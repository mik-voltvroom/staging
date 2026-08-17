import { adminDb } from "@/lib/firebase-admin";
import { publicSocialVideoSchema, socialVideoSchema, type PublicSocialVideo, type SocialVideo } from "@/lib/social-video/model";

const COLLECTION = "socialVideos";

function requireDb() {
  if (!adminDb) throw new Error("Firestore is niet beschikbaar.");
  return adminDb;
}

export async function createSocialVideo(video: SocialVideo): Promise<SocialVideo> {
  const parsed = socialVideoSchema.parse(video);
  await requireDb().collection(COLLECTION).doc(parsed.id).set(parsed, { merge: false });
  return parsed;
}

export async function listSocialVideos(): Promise<SocialVideo[]> {
  const snapshot = await requireDb().collection(COLLECTION).orderBy("updatedAt", "desc").limit(250).get();
  return snapshot.docs.map(doc => socialVideoSchema.parse(doc.data()));
}

export async function getSocialVideo(id: string): Promise<SocialVideo | null> {
  const doc = await requireDb().collection(COLLECTION).doc(id).get();
  return doc.exists ? socialVideoSchema.parse(doc.data()) : null;
}

export async function updateSocialVideo(id: string, patch: Partial<SocialVideo>): Promise<SocialVideo> {
  const ref = requireDb().collection(COLLECTION).doc(id);
  const current = await ref.get();
  if (!current.exists) throw new Error("Video niet gevonden.");
  const next = socialVideoSchema.parse({ ...current.data(), ...patch, id, updatedAt: new Date().toISOString() });
  await ref.set(next, { merge: false });
  return next;
}

export async function listPublishedSocialVideos(options: { placement?: keyof SocialVideo["placements"]; vehicleId?: string; limit?: number } = {}): Promise<PublicSocialVideo[]> {
  let query: FirebaseFirestore.Query = requireDb().collection(COLLECTION).where("status", "==", "published");
  if (options.placement) query = query.where(`placements.${options.placement}`, "==", true);
  if (options.vehicleId) query = query.where("vehicleIds", "array-contains", options.vehicleId);
  const snapshot = await query.limit(Math.min(options.limit ?? 50, 100)).get();
  const records = snapshot.docs
    .map(doc => socialVideoSchema.parse(doc.data()))
    .sort((a, b) => (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt));
  return records.map(video => publicSocialVideoSchema.parse(video));
}
