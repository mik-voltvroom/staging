import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/auth/api";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  const auth = await authorizeApi(request, "audit.read");
  if (auth.response) return auth.response;
  if (!adminDb) return NextResponse.json({ items: [], error: "Database niet beschikbaar." }, { status: 503 });
  const db = adminDb;

  const requested = Number(new URL(request.url).searchParams.get("limit") ?? 25);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 100) : 25;
  const snapshot = await db
    .collection("integrationEvents")
    .where("provider", "==", "mobilox")
    .orderBy("receivedAt", "desc")
    .limit(limit)
    .get();

  const items = await Promise.all(snapshot.docs.map(async (doc) => {
    const data = doc.data();
    const sourceVehicleId = String(data.sourceVehicleId ?? "");
    const vehicleId = sourceVehicleId ? `mobilox-${sourceVehicleId}` : undefined;
    let vehicle: Record<string, unknown> | null = null;
    if (vehicleId) {
      const vehicleSnapshot = await db.collection("vehicles").doc(vehicleId).get();
      vehicle = vehicleSnapshot.exists ? vehicleSnapshot.data() ?? null : null;
    }
    return {
      id: doc.id,
      type: data.type ?? "vehicle.unknown",
      sourceVehicleId,
      receivedAt: data.receivedAt ?? data.processedAt ?? null,
      processedAt: data.processedAt ?? null,
      authentication: data.authentication ?? "unknown",
      vehicleId,
      vehicle: vehicle ? {
        licensePlate: vehicle.licensePlate ?? null,
        brand: vehicle.brand ?? null,
        model: vehicle.model ?? null,
        type: vehicle.type ?? null,
        syncStatus: vehicle.syncStatus ?? null,
      } : null,
    };
  }));

  return NextResponse.json({ items });
}
