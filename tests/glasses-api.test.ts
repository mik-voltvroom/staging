import { beforeEach, describe, expect, it, vi } from "vitest";

const memory = vi.hoisted(() => ({
  session: null as any,
  processed: new Set<string>(),
  objectExists: true,
}));

vi.mock("@/lib/auth/api", () => ({
  authorizeApi: vi.fn(async () => ({ actor: { uid: "user-1", email: "test@voltvroom.nl", role: "owner" }, response: null })),
}));
vi.mock("@/lib/audit/audit-log", () => ({ writeAuditEvent: vi.fn(async () => undefined) }));
vi.mock("@/lib/firebase-admin", () => ({
  adminDb: { collection: () => ({ doc: () => ({ get: async () => ({ exists: true }) }) }) },
  adminStorage: { bucket: () => ({ file: () => ({ getSignedUrl: async () => ["https://signed.test/object"], exists: async () => [memory.objectExists] }) }) },
}));
vi.mock("@/lib/glasses/repository", () => ({
  createInspectionSession: vi.fn(async (session: any) => { memory.session = structuredClone(session); return memory.session; }),
  listInspectionSessions: vi.fn(async () => memory.session ? [memory.session] : []),
  getInspectionSession: vi.fn(async () => memory.session ? structuredClone(memory.session) : null),
  updateInspectionSession: vi.fn(async (_id: string, patch: any) => { memory.session = { ...memory.session, ...patch, updatedAt: new Date().toISOString() }; }),
  addInspectionObservation: vi.fn(async (observation: any) => { memory.session.observations.push(observation); }),
  addInspectionFinding: vi.fn(async (finding: any) => { memory.session.findings.push(finding); }),
  updateInspectionFinding: vi.fn(async (_id: string, findingId: string, patch: any) => { memory.session.findings = memory.session.findings.map((finding: any) => finding.id === findingId ? { ...finding, ...patch } : finding); }),
  addInspectionMedia: vi.fn(async (media: any) => { memory.session.media.push(media); }),
  getInspectionMedia: vi.fn(async (_id: string, mediaId: string) => memory.session.media.find((media: any) => media.id === mediaId) ?? null),
  updateInspectionMedia: vi.fn(async (_id: string, mediaId: string, patch: any) => { memory.session.media = memory.session.media.map((media: any) => media.id === mediaId ? { ...media, ...patch } : media); }),
  hasProcessedInspectionCommand: vi.fn(async (_id: string, key: string) => memory.processed.has(key)),
  markInspectionCommandProcessed: vi.fn(async (_id: string, key: string) => { memory.processed.add(key); }),
}));

import { POST as createInspection } from "@/app/api/vvos/inspection-sessions/route";
import { POST as sendCommand } from "@/app/api/vvos/inspection-sessions/[id]/commands/route";
import { POST as media } from "@/app/api/vvos/inspection-sessions/[id]/media/route";
import { POST as complete } from "@/app/api/vvos/inspection-sessions/[id]/complete/route";

const context = (id: string) => ({ params: Promise.resolve({ id }) });
const jsonRequest = (url: string, body: unknown, headers: Record<string, string> = {}) => new Request(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });

async function start() {
  const response = await createInspection(jsonRequest("http://vvos.test/api/vvos/inspection-sessions", {
    vehicleId: "vehicle-1",
    device: { adapter: "browser_camera", name: "VVOS Companion", connected: true, network: "online", capabilities: { camera: true, microphone: true, audioOutput: true, display: false, video: false } },
  }));
  const payload = await response.json() as any;
  expect(response.status).toBe(201);
  expect(payload.session.status).toBe("active");
  return payload.session.id as string;
}

beforeEach(() => {
  memory.session = null;
  memory.processed.clear();
  memory.objectExists = true;
});

describe("VVOS Glasses P0 API flow", () => {
  it("runs the primary capture flow end to end through route handlers", async () => {
    const id = await start();

    let response = await sendCommand(jsonRequest(`http://vvos.test/${id}/commands`, { transcript: "Kilometerstand 42.831", source: "voice" }, { "x-vvos-idempotency-key": "mileage-1" }), context(id));
    expect(response.status).toBe(200);
    expect(memory.session.mileageKm).toBe(42831);

    response = await sendCommand(jsonRequest(`http://vvos.test/${id}/commands`, { transcript: "Maak een foto", source: "voice" }, { "x-vvos-idempotency-key": "photo-1" }), context(id));
    expect((await response.json() as any).clientAction).toBe("capture_photo");

    const preparedResponse = await media(jsonRequest(`http://vvos.test/${id}/media`, { action: "prepare", kind: "photo", contentType: "image/jpeg", capturedAt: "2026-09-09T04:00:00.000Z", sourceDevice: "browser_camera" }), context(id));
    const prepared = await preparedResponse.json() as any;
    expect(preparedResponse.status).toBe(201);
    expect(prepared.uploadUrl).toContain("signed.test");
    expect(memory.session.media).toHaveLength(1);

    response = await sendCommand(jsonRequest(`http://vvos.test/${id}/commands`, { transcript: "Velg rechtsvoor heeft lichte stoeprandschade", source: "voice" }, { "x-vvos-idempotency-key": "damage-1" }), context(id));
    expect(response.status).toBe(200);
    expect(memory.session.findings[0]).toMatchObject({ component: "wheel", location: "front_right", severity: "minor" });

    const duplicate = await sendCommand(jsonRequest(`http://vvos.test/${id}/commands`, { transcript: "Velg rechtsvoor heeft lichte stoeprandschade", source: "voice" }, { "x-vvos-idempotency-key": "damage-1" }), context(id));
    expect((await duplicate.json() as any).duplicate).toBe(true);
    expect(memory.session.findings).toHaveLength(1);

    await sendCommand(jsonRequest(`http://vvos.test/${id}/commands`, { transcript: "pauzeer inspectie", source: "voice" }, { "x-vvos-idempotency-key": "pause-1" }), context(id));
    expect(memory.session.status).toBe("paused");
    await sendCommand(jsonRequest(`http://vvos.test/${id}/commands`, { transcript: "hervat inspectie", source: "voice" }, { "x-vvos-idempotency-key": "resume-1" }), context(id));
    expect(memory.session.status).toBe("active");

    const completed = await complete(new Request(`http://vvos.test/${id}/complete`, { method: "POST" }), context(id));
    expect(completed.status).toBe(200);
    expect(memory.session.status).toBe("review");
  });

  it("rejects media confirmation when storage does not contain the object", async () => {
    const id = await start();
    const preparedResponse = await media(jsonRequest(`http://vvos.test/${id}/media`, { action: "prepare", kind: "photo", contentType: "image/jpeg", capturedAt: "2026-09-09T04:00:00.000Z", sourceDevice: "browser_camera" }), context(id));
    const prepared = await preparedResponse.json() as any;
    memory.objectExists = false;
    const confirmation = await media(jsonRequest(`http://vvos.test/${id}/media`, { action: "confirm", mediaId: prepared.media.id, sizeBytes: 128 }), context(id));
    expect(confirmation.status).toBe(409);
    expect(memory.session.media[0].status).toBe("failed");
  });

  it("makes the P1 boundary explicit instead of faking purchase intelligence", async () => {
    const id = await start();
    const response = await sendCommand(jsonRequest(`http://vvos.test/${id}/commands`, { transcript: "Geef inkoopadvies", source: "voice" }, { "x-vvos-idempotency-key": "advice-1" }), context(id));
    expect(response.status).toBe(501);
    expect((await response.json() as any).error).toContain("P1");
  });
});
