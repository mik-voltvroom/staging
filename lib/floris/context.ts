import type { Vehicle } from "@/types";

export interface FlorisVehicleContext {
  id: string;
  slug: string;
  name: string;
  trim: string;
  year: number;
  mileageKm: number;
  priceEur: number;
  driveType: string;
  fuelType: string;
  transmission: string;
  bodyStyle: string;
  color: string;
  licensePlate?: string;
  batteryHealthPercent?: number;
  electricRangeKm?: number;
  consumptionPer100Km?: number;
  warrantyMonths?: number;
  maintenanceHistory: string;
  equipment: string[];
  energy: Record<string, string | number | boolean>;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function optionalBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function safeText(value: unknown, maxLength = 180): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

function energyProfile(vehicle: Vehicle): Record<string, string | number | boolean> {
  const raw = vehicle as unknown as Record<string, unknown>;
  const nested = raw.energy && typeof raw.energy === "object" ? raw.energy as Record<string, unknown> : {};
  const profile: Record<string, string | number | boolean> = {};
  const numericFields: Array<[string, string]> = [
    ["grossBatteryKwh", "bruto_accu_kwh"],
    ["usableBatteryKwh", "bruikbare_accu_kwh"],
    ["rangeWltpKm", "wltp_bereik_km"],
    ["winterRangeKm", "winter_bereik_km"],
    ["acChargeKw", "ac_laadvermogen_kw"],
    ["acPhases", "ac_fasen"],
    ["dcMaxKw", "dc_max_kw"],
    ["dcAverage10To80Kw", "dc_gemiddeld_10_80_kw"],
    ["chargeTime10To80Minutes", "laadtijd_10_80_minuten"],
    ["architectureVoltage", "architectuur_voltage"],
  ];
  for (const [source, target] of numericFields) {
    const value = finiteNumber(nested[source] ?? raw[source]);
    if (value !== undefined) profile[target] = value;
  }
  const booleanFields: Array<[string, string]> = [
    ["heatPump", "warmtepomp"],
    ["batteryPreconditioning", "batterij_preconditioning"],
    ["plugAndCharge", "plug_and_charge"],
    ["v2l", "v2l"],
    ["v2h", "v2h"],
    ["v2g", "v2g"],
  ];
  for (const [source, target] of booleanFields) {
    const value = optionalBoolean(nested[source] ?? raw[source]);
    if (value !== undefined) profile[target] = value;
  }
  const notes = safeText(nested.chargingNotes ?? raw.chargingNotes, 300);
  if (notes) profile.laadnotitie = notes;
  return profile;
}

export function toFlorisVehicleContext(vehicle: Vehicle): FlorisVehicleContext {
  const licensePlate = safeText(vehicle.licensePlate, 16);
  return {
    id: vehicle.id,
    slug: vehicle.slug,
    name: `${vehicle.brand} ${vehicle.model}`.trim(),
    trim: safeText(vehicle.trim) ?? "",
    year: vehicle.year,
    mileageKm: vehicle.mileageKm,
    priceEur: Math.round(vehicle.priceCents / 100),
    driveType: vehicle.driveType,
    fuelType: safeText(vehicle.fuelType) ?? "onbekend",
    transmission: safeText(vehicle.transmission) ?? "onbekend",
    bodyStyle: safeText(vehicle.bodyStyle) ?? "onbekend",
    color: safeText(vehicle.color) ?? "onbekend",
    ...(licensePlate ? { licensePlate } : {}),
    ...(finiteNumber(vehicle.batteryHealthPercent) !== undefined ? { batteryHealthPercent: vehicle.batteryHealthPercent } : {}),
    ...(finiteNumber(vehicle.electricRangeKm) !== undefined ? { electricRangeKm: vehicle.electricRangeKm } : {}),
    ...(finiteNumber(vehicle.consumptionPer100Km) !== undefined ? { consumptionPer100Km: vehicle.consumptionPer100Km } : {}),
    ...(finiteNumber(vehicle.warrantyMonths) !== undefined ? { warrantyMonths: vehicle.warrantyMonths } : {}),
    maintenanceHistory: vehicle.maintenanceHistory,
    equipment: vehicle.highlights.map(item => safeText(item, 140)).filter((item): item is string => Boolean(item)).slice(0, 80),
    energy: energyProfile(vehicle),
  };
}

export function buildFlorisContext(vehicle: Vehicle | undefined, inventory: Vehicle[]): string {
  const selected = vehicle ? toFlorisVehicleContext(vehicle) : undefined;
  const stock = inventory
    .filter(item => !vehicle || item.id !== vehicle.id)
    .slice(0, 20)
    .map(toFlorisVehicleContext)
    .map(item => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      trim: item.trim,
      year: item.year,
      mileageKm: item.mileageKm,
      priceEur: item.priceEur,
      driveType: item.driveType,
      electricRangeKm: item.electricRangeKm,
      consumptionPer100Km: item.consumptionPer100Km,
      equipment: item.equipment.slice(0, 12),
      energy: item.energy,
    }));

  return JSON.stringify({ selectedVehicle: selected ?? null, currentPublicInventory: stock }, null, 2);
}
