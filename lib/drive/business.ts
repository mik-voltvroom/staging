import type { Vehicle } from "@/types";

export const VEHICLE_DOSSIER_FOLDERS = [
  "01 Inkoop",
  "02 Eigenarenhistorie",
  "03 Onderhoud",
  "04 Technisch rapport",
  "05 Diagnose & SOH",
  "06 Foto's",
  "07 Video's",
  "08 Werkzaamheden",
  "09 Advertentie",
  "10 Koopovereenkomst",
  "11 Aflevering",
  "12 Garantie & Aftersales",
] as const;

function cleanPart(value: string): string {
  return value
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function vehicleDossierFolderName(
  vehicle: Pick<Vehicle, "licensePlate" | "brand" | "model" | "vin" | "id">,
): string {
  const plate = cleanPart(
    vehicle.licensePlate?.toUpperCase() || "GEEN-KENTEKEN",
  );
  const label = cleanPart(`${vehicle.brand} ${vehicle.model}`);
  const vinTail = cleanPart(
    vehicle.vin?.slice(-6).toUpperCase() ||
      vehicle.id.slice(-6).toUpperCase(),
  );
  return `${plate} – ${label} – ${vinTail}`;
}

export function validateVehicleForDossier(
  vehicle: Pick<Vehicle, "id" | "brand" | "model">,
): void {
  if (!vehicle.id || !vehicle.brand.trim() || !vehicle.model.trim()) {
    throw new Error("Voertuigdossier vereist id, merk en model.");
  }
}
