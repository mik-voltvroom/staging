import { adminDb } from "@/lib/firebase-admin";
import type { Finding, InspectionMedia, InspectionObservation, InspectionSession } from "@/lib/glasses/model";

const COLLECTION = "inspection_sessions";

function dbOrThrow() {
  if (!adminDb) throw new Error("VVOS database niet beschikbaar.");
  return adminDb;
}

export async function createInspectionSession(session: InspectionSession): Promise<InspectionSession> {
  const { observations: _o, media: _m, findings: _f, ...root } = session;
  await dbOrThrow().collection(COLLECTION).doc(session.id).set(root);
  return session;
}

export async function getInspectionSession(id: string): Promise<InspectionSession | null> {
  const ref = dbOrThrow().collection(COLLECTION).doc(id);
  const [root, observations, media, findings] = await Promise.all([
    ref.get(), ref.collection("observations").orderBy("createdAt", "asc").get(), ref.collection("media").orderBy("createdAt", "asc").get(), ref.collection("findings").orderBy("createdAt", "asc").get(),
  ]);
  if (!root.exists) return null;
  return {
    ...(root.data() as Omit<InspectionSession, "observations" | "media" | "findings">),
    observations: observations.docs.map(doc => doc.data() as InspectionObservation),
    media: media.docs.map(doc => doc.data() as InspectionMedia),
    findings: findings.docs.map(doc => doc.data() as Finding),
  };
}

export async function listInspectionSessions(limit = 20): Promise<InspectionSession[]> {
  const snapshot = await dbOrThrow().collection(COLLECTION).orderBy("updatedAt", "desc").limit(Math.max(1, Math.min(limit, 50))).get();
  return Promise.all(snapshot.docs.map(doc => getInspectionSession(doc.id))).then(items => items.filter((item): item is InspectionSession => Boolean(item)));
}

export async function updateInspectionSession(id: string, patch: Partial<Omit<InspectionSession, "id" | "vehicleId" | "inspectorId" | "observations" | "media" | "findings">>): Promise<void> {
  await dbOrThrow().collection(COLLECTION).doc(id).set({ ...patch, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function addInspectionObservation(observation: InspectionObservation): Promise<void> {
  await dbOrThrow().collection(COLLECTION).doc(observation.inspectionId).collection("observations").doc(observation.id).set(observation);
}

export async function addInspectionFinding(finding: Finding): Promise<void> {
  await dbOrThrow().collection(COLLECTION).doc(finding.inspectionId).collection("findings").doc(finding.id).set(finding);
}

export async function updateInspectionFinding(inspectionId: string, findingId: string, patch: Partial<Finding>): Promise<void> {
  await dbOrThrow().collection(COLLECTION).doc(inspectionId).collection("findings").doc(findingId).set({ ...patch, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function addInspectionMedia(media: InspectionMedia): Promise<void> {
  await dbOrThrow().collection(COLLECTION).doc(media.inspectionId).collection("media").doc(media.id).set(media);
}

export async function getInspectionMedia(inspectionId: string, mediaId: string): Promise<InspectionMedia | null> {
  const doc = await dbOrThrow().collection(COLLECTION).doc(inspectionId).collection("media").doc(mediaId).get();
  return doc.exists ? doc.data() as InspectionMedia : null;
}

export async function updateInspectionMedia(inspectionId: string, mediaId: string, patch: Partial<InspectionMedia>): Promise<void> {
  await dbOrThrow().collection(COLLECTION).doc(inspectionId).collection("media").doc(mediaId).set({ ...patch, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function hasProcessedInspectionCommand(inspectionId: string, key: string): Promise<boolean> {
  const doc = await dbOrThrow().collection(COLLECTION).doc(inspectionId).collection("processed_commands").doc(key).get();
  return doc.exists;
}

export async function markInspectionCommandProcessed(inspectionId: string, key: string, intent: string): Promise<void> {
  await dbOrThrow().collection(COLLECTION).doc(inspectionId).collection("processed_commands").doc(key).set({ key, intent, processedAt: new Date().toISOString() });
}
