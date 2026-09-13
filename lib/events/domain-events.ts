import { adminDb } from "@/lib/firebase-admin";

export type VvosDomainEventName =
  | "inspection.started"
  | "inspection.photo_captured"
  | "inspection.observation_added"
  | "inspection.finding_created"
  | "inspection.finding_confirmed"
  | "inspection.completed"
  | "inspection.summary_generated"
  | "inspection.vision_suggested"
  | "carcheck.updated"
  | "purchase_advice.generated";

export interface VvosDomainEventInput {
  name: VvosDomainEventName;
  aggregateType: "inspection" | "vehicle";
  aggregateId: string;
  vehicleId?: string;
  inspectionId?: string;
  actorId?: string;
  payload?: Record<string, unknown>;
}

export interface VvosDomainEvent extends VvosDomainEventInput {
  id: string;
  occurredAt: string;
  schemaVersion: 1;
}

function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const forbidden = /(token|secret|password|authorization|cookie|api[-_]?key|signedurl)/i;
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, forbidden.test(key) ? "[REDACTED]" : value]));
}

export async function emitDomainEvent(input: VvosDomainEventInput): Promise<VvosDomainEvent> {
  const event: VvosDomainEvent = {
    ...input,
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
    schemaVersion: 1,
    payload: sanitizePayload(input.payload ?? {}),
  };
  if (adminDb) await adminDb.collection("domain_events").doc(event.id).set(event);
  else console.info("[VVOS:EVENT]", JSON.stringify(event));
  return event;
}
