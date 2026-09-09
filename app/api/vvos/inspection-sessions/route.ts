import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/auth/api";
import { adminDb } from "@/lib/firebase-admin";
import { createDefaultChecklist, firstChecklistItem } from "@/lib/glasses/business";
import { createInspectionSession, listInspectionSessions } from "@/lib/glasses/repository";
import { writeAuditEvent } from "@/lib/audit/audit-log";
import type { InspectionSession } from "@/lib/glasses/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const deviceSchema = z.object({
  adapter: z.enum(["browser_camera", "meta_companion", "mock"]), name: z.string().min(1).max(100), connected: z.boolean(), batteryPercent: z.number().min(0).max(100).optional(),
  network: z.enum(["online", "offline", "unknown"]), capabilities: z.object({ camera: z.boolean(), microphone: z.boolean(), audioOutput: z.boolean(), display: z.boolean(), video: z.boolean() }),
});
const createSchema = z.object({ vehicleId: z.string().min(1).max(120), device: deviceSchema });

export async function GET(request: Request): Promise<Response> {
  const authorization = await authorizeApi(request, "inspections.read");
  if (authorization.response) return authorization.response;
  try {
    return NextResponse.json({ ok: true, sessions: await listInspectionSessions(20) }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("VVOS inspections list failed", error);
    return NextResponse.json({ ok: false, error: "Inspecties konden niet worden geladen." }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  const authorization = await authorizeApi(request, "inspections.write");
  if (authorization.response) return authorization.response;
  const actor = authorization.actor!;
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Ongeldige inspectiegegevens." }, { status: 400 });
  if (!adminDb) return NextResponse.json({ ok: false, error: "VVOS database niet beschikbaar." }, { status: 503 });
  const vehicle = await adminDb.collection("vehicles").doc(parsed.data.vehicleId).get();
  if (!vehicle.exists) return NextResponse.json({ ok: false, error: "Voertuig niet gevonden." }, { status: 404 });
  const now = new Date().toISOString();
  const first = firstChecklistItem();
  const session: InspectionSession = {
    id: crypto.randomUUID(), vehicleId: parsed.data.vehicleId, inspectorId: actor.uid, inspectorEmail: actor.email, status: "active", startedAt: now, updatedAt: now,
    device: parsed.data.device, currentSection: first.section, currentItemId: first.id, checklist: createDefaultChecklist(), observations: [], media: [], findings: [], version: 1,
  };
  try {
    await createInspectionSession(session);
    await writeAuditEvent({ action: "inspection.started", entityType: "inspection", entityId: session.id, actor, request, metadata: { vehicleId: session.vehicleId, device: session.device.adapter } });
    return NextResponse.json({ ok: true, session }, { status: 201 });
  } catch (error) {
    console.error("VVOS inspection create failed", error);
    return NextResponse.json({ ok: false, error: "Inspectie kon niet worden gestart." }, { status: 500 });
  }
}
