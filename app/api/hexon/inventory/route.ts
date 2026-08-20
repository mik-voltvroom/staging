import { timingSafeEqual } from "node:crypto";
import { adminDb } from "@/lib/firebase-admin";
import { parseHexonMutation } from "@/lib/integrations/hexon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 2_000_000;

function plain(value: "0" | "1", status: number): Response {
  return new Response(value, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

function matchesSecret(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

function authorized(request: Request): boolean {
  const username = process.env.HEXON_SYNC_USERNAME;
  const password = process.env.HEXON_SYNC_PASSWORD;
  if (!username || !password || password.length < 24) return false;
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 1) return false;
    const usernameMatches = matchesSecret(decoded.slice(0, separator), username);
    const passwordMatches = matchesSecret(decoded.slice(separator + 1), password);
    return usernameMatches && passwordMatches;
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!process.env.HEXON_SYNC_USERNAME || (process.env.HEXON_SYNC_PASSWORD?.length ?? 0) < 24) return plain("0", 503);
  if (!authorized(request)) return plain("0", 401);

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("xml")) return plain("0", 415);
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return plain("0", 413);
  if (!adminDb) return plain("0", 503);

  try {
    const xml = await request.text();
    const mutation = parseHexonMutation(xml);
    const document = adminDb.doc(`vehicles/${mutation.vehicle?.id ?? `hexon-${mutation.externalId}`}`);
    const now = new Date().toISOString();

    await adminDb.runTransaction(async (transaction) => {
      const current = await transaction.get(document);
      if (mutation.action === "archive") {
        if (current.exists) {
          transaction.set(document, {
            status: "archived",
            publication: {
              channels: { website: false, merchant: false, google_ads: false, meta: false },
              completenessPercent: current.data()?.publication?.completenessPercent ?? 0,
              lastValidatedAt: now,
              validationErrors: ["Niet langer geselecteerd in Mobilox/Hexon"],
            },
            updatedAt: now,
            source: { provider: "mobilox-hexon", externalId: mutation.externalId, lastMutationAt: now },
          }, { merge: true });
        }
        return;
      }

      if (!mutation.vehicle) throw new Error("Hexon voertuigdata ontbreekt.");
      transaction.set(document, {
        ...mutation.vehicle,
        createdAt: current.data()?.createdAt ?? now,
        source: { provider: "mobilox-hexon", externalId: mutation.externalId, lastMutationAt: now },
      }, { merge: true });
    });

    return plain("1", 200);
  } catch (error) {
    console.error("Hexon inventory mutation rejected", error instanceof Error ? error.message : "unknown error");
    return plain("0", 400);
  }
}
