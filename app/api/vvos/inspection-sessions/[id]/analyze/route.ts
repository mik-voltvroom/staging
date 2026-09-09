import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/auth/api";
import { adminStorage } from "@/lib/firebase-admin";
import { vvosAIService } from "@/lib/glasses/ai-service";
import { addInspectionFinding, getInspectionMedia, getInspectionSession } from "@/lib/glasses/repository";
import { emitDomainEvent } from "@/lib/events/domain-events";
import { writeAuditEvent } from "@/lib/audit/audit-log";
import type { Finding } from "@/lib/glasses/model";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("summary") }),
  z.object({ action: z.literal("vision"), mediaId: z.string().uuid() }),
]);
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context): Promise<Response> {
  const authorization = await authorizeApi(request, "inspections.write");
  if (authorization.response) return authorization.response;
  const actor = authorization.actor!;
  const { id } = await context.params;
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ ok: false, error: "Analyse-opdracht is ongeldig." }, { status: 400 });
  const session = await getInspectionSession(id);
  if (!session) return NextResponse.json({ ok: false, error: "Inspectie niet gevonden." }, { status: 404 });

  if (body.data.action === "summary") {
    const summary = await vvosAIService.generateInspectionSummary(session);
    await emitDomainEvent({ name: "inspection.summary_generated", aggregateType: "inspection", aggregateId: id, vehicleId: session.vehicleId, inspectionId: id, actorId: actor.uid, payload: { progressPercent: summary.progressPercent, confirmedFindings: summary.confirmedFindings } });
    await writeAuditEvent({ action: "inspection.summary_generated", entityType: "inspection", entityId: id, actor, request, metadata: { progressPercent: summary.progressPercent } });
    return NextResponse.json({ ok: true, summary });
  }

  const media = await getInspectionMedia(id, body.data.mediaId);
  if (!media || media.status !== "uploaded") return NextResponse.json({ ok: false, error: "Foto niet gevonden of nog niet geüpload." }, { status: 404 });
  if (!adminStorage) return NextResponse.json({ ok: false, error: "VVOS Storage niet beschikbaar." }, { status: 503 });
  const [imageUrl] = await adminStorage.bucket().file(media.storagePath).getSignedUrl({ action: "read", expires: Date.now() + 5 * 60_000 });
  try {
    const suggestions = await vvosAIService.analyzeVehicleImage({ session, imageUrl, mediaId: media.id });
    const now = new Date().toISOString();
    const findings: Finding[] = suggestions.map(suggestion => ({
      id: crypto.randomUUID(), inspectionId: id, vehicleId: session.vehicleId, category: suggestion.category,
      component: suggestion.component, location: suggestion.location, severity: suggestion.severity,
      description: suggestion.description, aiDescription: suggestion.description, mediaIds: [media.id], confidence: suggestion.confidence,
      source: "vision", reviewStatus: "suggested", createdBy: actor.uid, createdAt: now, updatedAt: now,
    }));
    await Promise.all(findings.map(addInspectionFinding));
    await emitDomainEvent({ name: "inspection.vision_suggested", aggregateType: "inspection", aggregateId: id, vehicleId: session.vehicleId, inspectionId: id, actorId: actor.uid, payload: { mediaId: media.id, findingIds: findings.map(finding => finding.id), count: findings.length } });
    await writeAuditEvent({ action: "inspection.vision_suggestions_created", entityType: "inspection", entityId: id, actor, request, metadata: { mediaId: media.id, count: findings.length } });
    return NextResponse.json({ ok: true, suggestions: findings, session: await getInspectionSession(id) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Vision analyse niet beschikbaar." }, { status: 503 });
  }
}
