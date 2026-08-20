import { createHash } from "node:crypto";
import { adminDb } from "@/lib/firebase-admin";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

function fingerprint(request: Request): string {
  const salt = process.env.AUDIT_HASH_SALT || "staging-public-rate-limit";
  const source = `${clientAddress(request)}:${request.headers.get("user-agent") || "unknown"}:${salt}`;
  return createHash("sha256").update(source).digest("hex").slice(0, 32);
}

export async function consumePublicLeadQuota(request: Request): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  if (!adminDb) return { allowed: false, retryAfterSeconds: 60 };

  const now = Date.now();
  const bucket = Math.floor(now / WINDOW_MS);
  const id = `${fingerprint(request)}-${bucket}`;
  const ref = adminDb.collection("_publicRateLimits").doc(id);

  const allowed = await adminDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const count = Number(snapshot.data()?.count || 0);
    if (count >= MAX_REQUESTS) return false;

    transaction.set(ref, {
      count: count + 1,
      bucket,
      updatedAt: new Date(now).toISOString(),
      expiresAt: new Date((bucket + 2) * WINDOW_MS).toISOString(),
    }, { merge: true });
    return true;
  });

  const retryAfterSeconds = Math.max(1, Math.ceil(((bucket + 1) * WINDOW_MS - now) / 1000));
  return { allowed, retryAfterSeconds };
}
