import { adminDb } from "@/lib/firebase-admin";
import { mobiloxSuccessResponse, normalizeMobiloxMutation, verifyMobiloxBasicAuth } from "@/lib/integrations/mobilox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function exactTextResponse(body: "0" | "1", status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function mobiloxAuthConfigured() {
  return Boolean(process.env.MOBILOX_BASIC_AUTH_USERNAME && process.env.MOBILOX_BASIC_AUTH_PASSWORD);
}

export async function POST(request: Request) {
  if (!mobiloxAuthConfigured()) return exactTextResponse("0", 503);
  if (!verifyMobiloxBasicAuth(request.headers.get("authorization"))) return exactTextResponse("0", 401);

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("xml")) return exactTextResponse("0", 415);
  if (!adminDb) return exactTextResponse("0", 503);

  try {
    const xml = await request.text();
    const mutation = normalizeMobiloxMutation(xml);
    const now = new Date().toISOString();
    const vehicleRef = adminDb.collection("vehicles").doc(`mobilox-${mutation.providerVehicleId}`);
    const mutationRef = adminDb.collection("integrationEvents").doc(`mobilox-${mutation.providerVehicleId}-${mutation.action}-${mutation.receivedAt}`);

    await adminDb.runTransaction(async (transaction) => {
      const current = await transaction.get(vehicleRef);

      if (mutation.action === "delete") {
        transaction.set(vehicleRef, {
          id: `mobilox-${mutation.providerVehicleId}`,
          source: "mobilox",
          sourceVehicleId: mutation.providerVehicleId,
          syncStatus: "deleted",
          deletedAt: mutation.receivedAt,
          updatedAt: mutation.receivedAt,
        }, { merge: true });
      } else {
        transaction.set(vehicleRef, {
          id: `mobilox-${mutation.providerVehicleId}`,
          createdAt: current.data()?.createdAt ?? mutation.receivedAt,
          source: "mobilox",
          sourceVehicleId: mutation.providerVehicleId,
          syncStatus: mutation.action === "add" ? "active" : "changed",
          ...mutation,
          updatedAt: mutation.receivedAt,
        }, { merge: true });
      }

      transaction.set(mutationRef, {
        provider: "mobilox",
        type: `vehicle.${mutation.action}`,
        sourceVehicleId: mutation.providerVehicleId,
        receivedAt: mutation.receivedAt,
        processedAt: now,
        authentication: "basic",
        result: "success",
      }, { merge: true });
    });

    return exactTextResponse(mobiloxSuccessResponse(), 200);
  } catch (error) {
    console.error("Mobilox inventory mutation rejected", error instanceof Error ? error.message : "unknown error");
    return exactTextResponse("0", 400);
  }
}
