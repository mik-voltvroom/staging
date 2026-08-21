import { createHash, timingSafeEqual } from "node:crypto";
import { adminDb } from "@/lib/firebase-admin";
import { parseHexonMutation } from "@/lib/integrations/hexon";
import { persistHexonImages } from "@/lib/integrations/hexon-images";

export const HEXON_MAX_BODY_BYTES = 2_000_000;

function safeEqual(actual: string, expected: string): boolean {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyHexonAuthorization(header: string | null): boolean {
  const username = process.env.HEXON_SYNC_USERNAME;
  const password = process.env.HEXON_SYNC_PASSWORD;
  if (!username || !password || !header?.startsWith("Basic ")) return false;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 1) return false;
    return safeEqual(decoded.slice(0, separator), username) && safeEqual(decoded.slice(separator + 1), password);
  } catch {
    return false;
  }
}

export function hexonCredentialsConfigured(): boolean {
  return Boolean(process.env.HEXON_SYNC_USERNAME && process.env.HEXON_SYNC_PASSWORD);
}

export async function processHexonInventoryXml(xml: string): Promise<{ duplicate: boolean; externalId: string; action: string; providerAction: string }> {
  if (!adminDb) throw new Error("VVOS database niet beschikbaar.");
  const mutation = parseHexonMutation(xml);
  const hash = createHash("sha256").update(xml).digest("hex");
  const eventRef = adminDb.doc(`integrationEvents/hexon-${hash}`);
  const vehicleRef = adminDb.doc(`vehicles/${mutation.vehicle?.id ?? `hexon-${mutation.externalId}`}`);
  const now = new Date().toISOString();
  let duplicate = false;
  let imageFailures: Array<{ sourceUrl: string; message: string }> = [];

  const alreadyProcessed = await eventRef.get();
  if (alreadyProcessed.exists) {
    return {
      duplicate: true,
      externalId: mutation.externalId,
      action: mutation.action,
      providerAction: mutation.providerAction,
    };
  }

  if (mutation.action === "upsert" && mutation.vehicle?.images.length) {
    const persisted = await persistHexonImages(mutation.externalId, mutation.vehicle.images);
    imageFailures = persisted.failures;
    if (persisted.images.length) mutation.vehicle.images = persisted.images;
  }

  await adminDb.runTransaction(async transaction => {
    const event = await transaction.get(eventRef);
    if (event.exists) {
      duplicate = true;
      return;
    }

    const current = await transaction.get(vehicleRef);
    if (mutation.action === "archive") {
      if (current.exists) {
        transaction.set(vehicleRef, {
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
    } else {
      if (!mutation.vehicle) throw new Error("Hexon voertuigdata ontbreekt.");
      transaction.set(vehicleRef, {
        ...mutation.vehicle,
        createdAt: current.data()?.createdAt ?? now,
        source: {
          provider: "mobilox-hexon",
          externalId: mutation.externalId,
          lastMutationAt: now,
          imageStorage: mutation.vehicle.images.length ? "firebase-storage" : "none",
          imageFailures: imageFailures.length,
        },
      }, { merge: true });
    }

    transaction.create(eventRef, {
      provider: "mobilox-hexon",
      type: `vehicle.${mutation.providerAction}`,
      operation: mutation.action,
      providerAction: mutation.providerAction,
      externalId: mutation.externalId,
      payloadSha256: hash,
      receivedAt: now,
      processedAt: now,
      imageFailures: imageFailures.slice(0, 20),
      result: imageFailures.length ? "accepted_with_image_warnings" : "accepted",
    });
  });

  return { duplicate, externalId: mutation.externalId, action: mutation.action, providerAction: mutation.providerAction };
}
