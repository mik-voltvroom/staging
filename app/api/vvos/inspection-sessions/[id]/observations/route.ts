import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/auth/api";
import { addInspectionObservation, getInspectionSession } from "@/lib/glasses/repository";
import { writeAuditEvent } from "@/lib/audit/audit-log";
import type { InspectionObservation } from "@/lib/glasses/model";

const schema = z.object({ text: z.string().trim().min(1).max(1200), source: z.enum(["manual", "voice"]).default("manual") });
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context): Promise<Response> {
  const authorization = await authorizeApi(request, "inspections.write");
  if (authorization.response) return authorization.response;
  const actor = authorization.actor!;
  const { id } = await context.params;
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ ok: false, error: "Ongeldige observatie." }, { status: 400 });
  const session = await getInspectionSession(id);
  if (!session) return NextResponse.json({ ok: false, error: "Inspectie niet gevonden." }, { status: 404 });
  const observation: InspectionObservation = { id: crypto.randomUUID(), inspectionId: id, vehicleId: session.vehicleId, text: body.data.text, source: body.data.source, section: session.currentSection, itemId: session.currentItemId, createdBy: actor.uid, createdAt: new Date().toISOString() };
  await addInspectionObservation(observation);
  await writeAuditEvent({ action: "inspection.observation_added", entityType: "inspection", entityId: id, actor, request, metadata: { observationId: observation.id, source: observation.source } });
  return NextResponse.json({ ok: true, observation }, { status: 201 });
}
