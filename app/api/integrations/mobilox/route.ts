import { adminDb } from "@/lib/firebase-admin";
import { mobiloxSuccessResponse, normalizeMobiloxMutation, verifyMobiloxBasicAuth } from "@/lib/integrations/mobilox";

export const runtime = "nodejs";

function textResponse(body: string, status = 200) {
  return new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8" } });
}

export async function POST(request: Request) {
  if (!verifyMobiloxBasicAuth(request.headers.get("authorization"))) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="VVOS Mobilox feed"' },
    });
  }

  try {
    const xml = await request.text();
    const mutation = normalizeMobiloxMutation(xml);

    // Never acknowledge a successful external mutation in production when
    // the persistent store is unavailable (AGENTS.md rule 4).
    if (process.env.VVOS_DATA_MODE === "firebase" && !adminDb) {
      return textResponse("VVOS database niet beschikbaar", 503);
    }

    if (adminDb) {
      const vehicleRef = adminDb.collection("vehicles").doc(`mobilox-${mutation.providerVehicleId}`);
      if (mutation.action === "delete") {
        // Keep a tombstone for audit/sync history instead of losing the source identity.
        await vehicleRef.set({
          id: `mobilox-${mutation.providerVehicleId}`,
          source: "mobilox",
          sourceVehicleId: mutation.providerVehicleId,
          syncStatus: "deleted",
          deletedAt: mutation.receivedAt,
          updatedAt: mutation.receivedAt,
        }, { merge: true });
      } else {
        await vehicleRef.set({
          id: `mobilox-${mutation.providerVehicleId}`,
          source: "mobilox",
          sourceVehicleId: mutation.providerVehicleId,
          syncStatus: mutation.action === "add" ? "active" : "changed",
          ...mutation,
          updatedAt: mutation.receivedAt,
        }, { merge: true });
      }

      await adminDb.collection("integrationEvents").add({
        provider: "mobilox",
        type: `vehicle.${mutation.action}`,
        sourceVehicleId: mutation.providerVehicleId,
        receivedAt: mutation.receivedAt,
        processedAt: new Date().toISOString(),
      });
    }

    // Hexon example contract: print exactly "1" when processing succeeded.
    return textResponse(mobiloxSuccessResponse());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mobilox feed kon niet worden verwerkt.";
    return textResponse(message, 400);
  }
}
