import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/auth/api";
import { adminDb } from "@/lib/firebase-admin";
import { checklistItemForTireLocation, moveChecklistCursor } from "@/lib/glasses/business";
import { vvosAIService } from "@/lib/glasses/ai-service";
import type { PurchaseAdvice } from "@/lib/glasses/purchase-intelligence";
import { savePurchaseAdvice } from "@/lib/glasses/purchase-repository";
import { normalizeVehicleDocument } from "@/lib/vehicle/money";
import { addInspectionFinding, addInspectionObservation, getInspectionSession, hasProcessedInspectionCommand, markInspectionCommandProcessed, updateInspectionSession } from "@/lib/glasses/repository";
import { writeAuditEvent } from "@/lib/audit/audit-log";
import type { Finding, InspectionObservation } from "@/lib/glasses/model";

export const runtime = "nodejs";
const schema = z.object({ transcript: z.string().trim().min(1).max(800), source: z.enum(["voice", "manual"]).default("voice") });
type Context = { params: Promise<{ id: string }> };

function spokenPurchaseVerdict(verdict: PurchaseAdvice["verdict"]): string {
  if (verdict === "STERK_INKOPEN") return "Sterk inkopen";
  if (verdict === "INKOPEN") return "Inkopen";
  if (verdict === "NIET_INKOPEN") return "Niet inkopen";
  return "Alleen inkopen onder deze prijs";
}

export async function POST(request: Request, context: Context): Promise<Response> {
  const authorization = await authorizeApi(request, "inspections.write");
  if (authorization.response) return authorization.response;
  const actor = authorization.actor!;
  const { id } = await context.params;
  const parsedBody = schema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) return NextResponse.json({ ok: false, error: "Commando ontbreekt of is ongeldig." }, { status: 400 });
  const session = await getInspectionSession(id);
  if (!session) return NextResponse.json({ ok: false, error: "Inspectie niet gevonden." }, { status: 404 });
  if (!["active", "paused"].includes(session.status)) return NextResponse.json({ ok: false, error: "Deze inspectie accepteert geen commando's." }, { status: 409 });
  const idempotencyKey = request.headers.get("x-vvos-idempotency-key")?.trim();
  if (idempotencyKey && await hasProcessedInspectionCommand(id, idempotencyKey)) {
    return NextResponse.json({ ok: true, duplicate: true, responseText: "Actie was al verwerkt.", session });
  }

  const command = await vvosAIService.classifyVoiceIntent(parsedBody.data.transcript, session);
  const now = new Date().toISOString();
  let responseText = "Opgeslagen.";
  let clientAction: "capture_photo" | undefined;
  let purchaseAdvice: PurchaseAdvice | undefined;

  const addObservation = async (text: string): Promise<void> => {
    const observation: InspectionObservation = { id: crypto.randomUUID(), inspectionId: id, vehicleId: session.vehicleId, text, source: parsedBody.data.source, section: session.currentSection, itemId: session.currentItemId, createdBy: actor.uid, createdAt: now };
    await addInspectionObservation(observation);
  };

  switch (command.intent) {
    case "CAPTURE_PHOTO":
      clientAction = "capture_photo";
      responseText = "Camera klaar.";
      break;
    case "SET_MILEAGE": {
      const value = command.entities.value;
      if (value === undefined || value < 0 || value > 2_000_000) return NextResponse.json({ ok: false, error: "Kilometerstand kon niet betrouwbaar worden gelezen." }, { status: 422 });
      const checklist = session.checklist.map(item => item.id === "identification_mileage" ? { ...item, status: "ok" as const, value: Math.round(value), unit: "km", updatedAt: now } : item);
      await updateInspectionSession(id, { mileageKm: Math.round(value), checklist });
      await addObservation(parsedBody.data.transcript);
      responseText = `Kilometerstand ${Math.round(value).toLocaleString("nl-NL")} opgeslagen.`;
      break;
    }
    case "SET_TIRE_DEPTH": {
      const value = command.entities.value;
      const location = command.entities.location;
      const itemId = location ? checklistItemForTireLocation(location) : undefined;
      if (value === undefined || !location || !itemId || value < 0 || value > 20) return NextResponse.json({ ok: false, error: "Profieldiepte of wielpositie is onduidelijk." }, { status: 422 });
      const status = value < 1.6 ? "fail" as const : value < 3 ? "attention" as const : "ok" as const;
      const checklist = session.checklist.map(item => item.id === itemId ? { ...item, status, value, unit: "mm", updatedAt: now } : item);
      await updateInspectionSession(id, { checklist, currentSection: "tires", currentItemId: itemId });
      await addObservation(parsedBody.data.transcript);
      responseText = `${location.replaceAll("_", " ")} ${String(value).replace(".", ",")} millimeter opgeslagen${status === "attention" ? " als aandachtspunt" : status === "fail" ? " als afkeur" : ""}.`;
      break;
    }
    case "ADD_DAMAGE":
    case "FLAG_FINDING": {
      const finding: Finding = {
        id: crypto.randomUUID(), inspectionId: id, vehicleId: session.vehicleId, category: session.currentSection,
        component: command.entities.component ?? "unknown", location: command.entities.location, severity: command.entities.severity ?? "attention",
        description: command.entities.description ?? parsedBody.data.transcript, mediaIds: [], source: parsedBody.data.source === "voice" ? "voice" : "manual",
        reviewStatus: "confirmed", createdBy: actor.uid, createdAt: now, updatedAt: now,
      };
      await Promise.all([addInspectionFinding(finding), addObservation(parsedBody.data.transcript)]);
      responseText = `Opgeslagen als ${finding.severity === "minor" ? "lichte" : finding.severity === "critical" ? "kritieke" : ""} bevinding.`.replace("als  bevinding", "als bevinding");
      break;
    }
    case "NEXT_SECTION": {
      const cursor = moveChecklistCursor(session, 1);
      await updateInspectionSession(id, cursor);
      const next = session.checklist.find(item => item.id === cursor.currentItemId);
      responseText = next ? `Volgende: ${next.label}.` : "Volgende onderdeel.";
      break;
    }
    case "PREVIOUS_SECTION": {
      const cursor = moveChecklistCursor(session, -1);
      await updateInspectionSession(id, cursor);
      const previous = session.checklist.find(item => item.id === cursor.currentItemId);
      responseText = previous ? `Terug naar ${previous.label}.` : "Vorig onderdeel.";
      break;
    }
    case "PAUSE_INSPECTION":
      await updateInspectionSession(id, { status: "paused" });
      responseText = "Inspectie gepauzeerd.";
      break;
    case "RESUME_INSPECTION":
    case "START_INSPECTION":
      await updateInspectionSession(id, { status: "active" });
      responseText = "Inspectie hervat.";
      break;
    case "COMPLETE_INSPECTION":
      await updateInspectionSession(id, { status: "review" });
      responseText = "Inspectie klaar voor controle.";
      break;
    case "REQUEST_PURCHASE_ADVICE": {
      if (!adminDb) return NextResponse.json({ ok: false, error: "VVOS database niet beschikbaar." }, { status: 503 });
      const vehicleDoc = await adminDb.collection("vehicles").doc(session.vehicleId).get();
      if (!vehicleDoc.exists) return NextResponse.json({ ok: false, error: "Voertuig niet gevonden." }, { status: 404 });
      const vehicle = normalizeVehicleDocument(vehicleDoc.id, vehicleDoc.data() ?? {});
      purchaseAdvice = await vvosAIService.generatePurchaseAdvice(vehicle, session);
      await savePurchaseAdvice(purchaseAdvice);
      responseText = `Maximale inkoopprijs ${Math.round(purchaseAdvice.maximumPurchasePriceCents / 100).toLocaleString("nl-NL")} euro. ${spokenPurchaseVerdict(purchaseAdvice.verdict)}.`;
      break;
    }
    default: {
      await addObservation(parsedBody.data.transcript);
      if (/\b(netjes|goed|in orde|geen bijzonderheden|geen schade)\b/i.test(parsedBody.data.transcript)) {
        const checklist = session.checklist.map(item => item.id === session.currentItemId ? { ...item, status: "ok" as const, updatedAt: now } : item);
        await updateInspectionSession(id, { checklist });
        const label = session.checklist.find(item => item.id === session.currentItemId)?.label;
        responseText = `${label ?? "Onderdeel"} als goed opgeslagen.`;
      } else responseText = "Observatie opgeslagen.";
      break;
    }
  }

  if (idempotencyKey) await markInspectionCommandProcessed(id, idempotencyKey, command.intent);
  await writeAuditEvent({ action: "inspection.command", entityType: "inspection", entityId: id, actor, request, metadata: { intent: command.intent, confidence: command.confidence, purchaseAdviceId: purchaseAdvice?.id } });
  return NextResponse.json({ ok: true, command, responseText, clientAction, purchaseAdvice, session: await getInspectionSession(id) });
}
