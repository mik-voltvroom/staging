import { adminDb } from "@/lib/firebase-admin";
import { mobiloxSuccessResponse, normalizeMobiloxMutation, verifyMobiloxBasicAuth } from "@/lib/integrations/mobilox";

export const runtime = "nodejs";

function textResponse(body: string, status = 200) {
  return new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8" } });
}

function mobiloxAuthConfigured() {
  return Boolean(process.env.MOBILOX_BASIC_AUTH_USERNAME && process.env.MOBILOX_BASIC_AUTH_PASSWORD);
}

export async function POST(request: Request) {
  const authConfigured = mobiloxAuthConfigured();
  const isStaging = process.env.VVOS_ENV === "staging";

  // Hexon documents Basic Auth as optional. During staging integration we may
  // accept the feed without auth when no feed-specific credentials exist yet.
  // Outside staging authentication is mandatory and fail-closed.
  if (authConfigured && !verifyMobiloxBasicAuth(request.headers.get("authorization"))) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="VVOS Mobilox feed"' },
    });
  }
  if (!authConfigured && !isStaging) {
    return textResponse("Mobilox authenticatie is niet geconfigureerd.", 503);
  }

  try {
    const xml = await request.text();
    const mutation = normalizeMobiloxMutation(xml);

    if (process.env.VVOS_DATA_MODE === "firebase" && !adminDb) {
      return textResponse("VVOS database niet beschikbaar", 503);
    }

    if (adminDb) {
      const vehicleRef = adminDb.collection("vehicles").doc(`mobilox-${mutation.providerVehicleId}`);
      if (mutation.action === "delete") {
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
        authentication: authConfigured ? "basic" : "staging-unsecured",
      });
    }

    return textResponse(mobiloxSuccessResponse());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mobilox feed kon niet worden verwerkt.";
    return textResponse(message, 400);
  }
}
