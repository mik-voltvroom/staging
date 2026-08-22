import "server-only";

import { adminDb } from "@/lib/firebase-admin";
import { vehicles as demoVehicles } from "@/lib/sample-data";
import { normalizeVehicleDocument } from "@/lib/vehicle/money";
import type { Vehicle } from "@/types";

function isPublishedOnWebsite(vehicle: Vehicle): boolean {
  return vehicle.status === "available"
    && vehicle.publication?.channels.website === true
    && (vehicle.publication.validationErrors?.length ?? 0) === 0;
}

function newestFirst(left: Vehicle, right: Vehicle): number {
  return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
}

function normalizeIdentity(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return normalized || undefined;
}

function deduplicateVehicles(vehicles: Vehicle[]): Vehicle[] {
  const seenVin = new Set<string>();
  const seenLicensePlate = new Set<string>();
  const unique: Vehicle[] = [];

  for (const vehicle of [...vehicles].sort(newestFirst)) {
    const vin = normalizeIdentity(vehicle.vin);
    const licensePlate = normalizeIdentity(vehicle.licensePlate);

    if ((vin && seenVin.has(vin)) || (licensePlate && seenLicensePlate.has(licensePlate))) {
      console.warn("Duplicate public vehicle suppressed", {
        id: vehicle.id,
        vin: vin ?? null,
        licensePlate: licensePlate ?? null,
      });
      continue;
    }

    if (vin) seenVin.add(vin);
    if (licensePlate) seenLicensePlate.add(licensePlate);
    unique.push(vehicle);
  }

  return unique;
}

export async function listPublicVehicles(limit = 12): Promise<Vehicle[]> {
  if (process.env.VVOS_DATA_MODE !== "firebase") {
    return deduplicateVehicles(demoVehicles.filter(vehicle => vehicle.status === "available")).slice(0, limit);
  }
  if (!adminDb) return [];

  let snapshot;
  try {
    snapshot = await adminDb.collection("vehicles").where("status", "==", "available").get();
  } catch (error) {
    console.error("Public inventory unavailable", error instanceof Error ? error.message : "unknown error");
    return [];
  }
  const vehicles: Vehicle[] = [];
  for (const document of snapshot.docs) {
    try {
      const vehicle = normalizeVehicleDocument(document.id, document.data());
      if (isPublishedOnWebsite(vehicle)) vehicles.push(vehicle);
    } catch (error) {
      console.error("Public vehicle skipped", document.id, error instanceof Error ? error.message : "unknown error");
    }
  }
  return deduplicateVehicles(vehicles).slice(0, limit);
}

export async function getPublicVehicleBySlug(slug: string): Promise<Vehicle | undefined> {
  const vehicles = await listPublicVehicles(100);
  return vehicles.find(vehicle => vehicle.slug === slug);
}
