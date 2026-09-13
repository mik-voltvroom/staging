import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/auth/api";
import { adminDb } from "@/lib/firebase-admin";
import { normalizeVehicleDocument } from "@/lib/vehicle/money";
import { getInspectionSession } from "@/lib/glasses/repository";
import { vvosAIService } from "@/lib/glasses/ai-service";
import { savePurchaseAdvice } from "@/lib/glasses/purchase-repository";
import { emitDomainEvent } from "@/lib/events/domain-events";
import { writeAuditEvent } from "@/lib/audit/audit-log";

const cents = z.number().int().min(0).max(100_000_000).optional();
const schema = z.object({
  inspectionId: z.string().uuid().optional(), expectedSalePriceCents: cents, reconditioningCents: cents,
  transportCents: cents, warrantyReserveCents: cents, marketingCents: cents, stockCostCents: cents,
  desiredMarginCents: cents, offeredPurchasePriceCents: cents,
});
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context): Promise<Response> {
  const authorization = await authorizeApi(request, "inspections.write");
  if (authorization.response) return authorization.response;
  const actor = authorization.actor!;
  const { id } = await context.params;
  const body = schema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ ok: false, error: "Inkoopaannames zijn ongeldig." }, { status: 400 });
  if (!adminDb) return NextResponse.json({ ok: false, error: "VVOS database niet beschikbaar." }, { status: 503 });
  const vehicleDoc = await adminDb.collection("vehicles").doc(id).get();
  if (!vehicleDoc.exists) return NextResponse.json({ ok: false, error: "Voertuig niet gevonden." }, { status: 404 });
  const vehicle = normalizeVehicleDocument(vehicleDoc.id, vehicleDoc.data() ?? {});
  const session = body.data.inspectionId ? await getInspectionSession(body.data.inspectionId) : null;
  if (body.data.inspectionId && (!session || session.vehicleId !== vehicle.id)) return NextResponse.json({ ok: false, error: "Inspectie hoort niet bij dit voertuig." }, { status: 409 });
  const { inspectionId: _inspectionId, ...overrides } = body.data;
  const advice = await vvosAIService.generatePurchaseAdvice(vehicle, session ?? undefined, overrides);
  await savePurchaseAdvice(advice);
  await emitDomainEvent({ name: "purchase_advice.generated", aggregateType: "vehicle", aggregateId: vehicle.id, vehicleId: vehicle.id, inspectionId: advice.inspectionId, actorId: actor.uid, payload: { adviceId: advice.id, risk: advice.risk, verdict: advice.verdict, maximumPurchasePriceCents: advice.maximumPurchasePriceCents } });
  await writeAuditEvent({ action: "purchase_advice.generated", entityType: "vehicle", entityId: vehicle.id, actor, request, metadata: { inspectionId: advice.inspectionId, risk: advice.risk, verdict: advice.verdict, maximumPurchasePriceCents: advice.maximumPurchasePriceCents } });
  return NextResponse.json({ ok: true, advice });
}
