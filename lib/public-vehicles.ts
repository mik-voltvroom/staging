import "server-only";
import { adminDb } from "@/lib/firebase-admin";

type RawMap = Record<string, unknown>;

type FirestoreVehicle = RawMap & {
  id?: string;
  source?: string;
  syncStatus?: string;
  raw?: RawMap;
  hybrid?: RawMap;
};

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function number(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return undefined;
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function bool(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  const normalized = text(value)?.toLowerCase();
  if (["j", "ja", "1", "true"].includes(normalized ?? "")) return true;
  if (["n", "nee", "0", "false"].includes(normalized ?? "")) return false;
  return undefined;
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
  if (typeof value === "string") return value.split(",").map(item => item.trim()).filter(Boolean);
  return [];
}

function rawValue(vehicle: FirestoreVehicle, key: string) {
  return vehicle.raw?.[key];
}

export type PublicVehicle = ReturnType<typeof projectPublicVehicle>;

export function projectPublicVehicle(vehicle: FirestoreVehicle) {
  const hybrid = (vehicle.hybrid ?? {}) as RawMap;
  const id = text(vehicle.id) ?? "";
  const imageUrls = list(vehicle.imageUrls).length ? list(vehicle.imageUrls) : list(rawValue(vehicle, "afbeeldingen"));
  const sold = bool(vehicle.sold) ?? bool(rawValue(vehicle, "verkocht")) ?? false;
  const reserved = bool(vehicle.reserved) ?? bool(rawValue(vehicle, "gereserveerd")) ?? false;

  return {
    id,
    slug: id,
    source: vehicle.source === "mobilox" ? "Hexon / Mobilox" : "Volt & Vroom",
    available: vehicle.syncStatus !== "deleted" && !sold,
    reserved,
    brand: text(vehicle.brand) ?? text(rawValue(vehicle, "merk")) ?? "",
    model: text(vehicle.model) ?? text(rawValue(vehicle, "model")) ?? "",
    trim: text(vehicle.type) ?? text(rawValue(vehicle, "type")) ?? "",
    licensePlate: text(vehicle.licensePlate) ?? text(rawValue(vehicle, "kenteken")),
    vin: text(vehicle.vin) ?? undefined,
    year: number(vehicle.year) ?? number(rawValue(vehicle, "bouwjaar")),
    mileageKm: number(vehicle.mileage) ?? number(rawValue(vehicle, "tellerstand")),
    priceEur: number(vehicle.retailPrice) ?? number(rawValue(vehicle, "verkoopprijs_particulier_bedrag")),
    fuelType: text(vehicle.fuel) ?? text(rawValue(vehicle, "brandstof")),
    transmission: text(vehicle.transmission) ?? text(rawValue(vehicle, "transmissie")),
    bodyStyle: text(vehicle.body) ?? text(rawValue(vehicle, "carrosserie")),
    color: text(vehicle.color) ?? text(rawValue(vehicle, "kleur")),
    firstRegistrationDate: text(vehicle.firstRegistrationDate) ?? text(rawValue(vehicle, "datum_deel_1")),
    vatMargin: text(vehicle.vatMargin) ?? text(rawValue(vehicle, "btw_marge")),
    imageUrls,
    title: text(vehicle.title) ?? text(rawValue(vehicle, "titel")),
    highlights: text(vehicle.highlights) ?? text(rawValue(vehicle, "highlights")),
    description: text(vehicle.description) ?? text(rawValue(vehicle, "opmerkingen")),
    accessories: list(vehicle.accessories).length ? list(vehicle.accessories) : list(rawValue(vehicle, "accessoires")),

    powerHp: number(vehicle.powerHp) ?? number(rawValue(vehicle, "vermogen_motor_pk")) ?? number(rawValue(vehicle, "vermogen_pk")),
    powerKw: number(vehicle.powerKw) ?? number(rawValue(vehicle, "vermogen_motor_kw")) ?? number(rawValue(vehicle, "vermogen_kw")),
    engineCapacityCc: number(vehicle.engineCapacityCc) ?? number(rawValue(vehicle, "cilinderinhoud")),
    doors: number(vehicle.doors) ?? number(rawValue(vehicle, "aantal_deuren")),
    seats: number(vehicle.seats) ?? number(rawValue(vehicle, "aantal_zitplaatsen")),
    weightKg: number(vehicle.weightKg) ?? number(rawValue(vehicle, "massa")),
    towWeightBrakedKg: number(vehicle.towWeightBrakedKg) ?? number(rawValue(vehicle, "max_trekgewicht")),
    topSpeedKph: number(vehicle.topSpeedKph) ?? number(rawValue(vehicle, "topsnelheid")),
    accelerationSeconds: number(vehicle.accelerationSeconds) ?? number(rawValue(vehicle, "acceleratie")),
    apkUntil: text(vehicle.apkUntil) ?? text(rawValue(vehicle, "apk_tot")),
    energyLabel: text(vehicle.energyLabel) ?? text(rawValue(vehicle, "energielabel")),
    co2GKm: number(vehicle.co2GKm) ?? number(rawValue(vehicle, "co2_uitstoot")),
    consumptionPer100Km: number(vehicle.consumptionPer100Km) ?? number(rawValue(vehicle, "gemiddeld_verbruik")) ?? number(rawValue(vehicle, "wltp_brandstofverbruik_combined")),

    hybridType: text(hybrid.hybridType) ?? text(rawValue(vehicle, "type_hybride")),
    pluginHybrid: bool(hybrid.pluginHybrid) ?? bool(rawValue(vehicle, "plugin_hybride")),
    batteryHealthPercent: number(hybrid.batteryConditionPct) ?? number(rawValue(vehicle, "accu_conditie")),
    electricRangeKm: number(hybrid.electricRangeKm) ?? number(rawValue(vehicle, "actieradius_elektrisch")),
    electricPowerKw: number(hybrid.electricPowerKw) ?? number(rawValue(vehicle, "vermogen_elektrisch_kw")),
    electricPowerHp: number(hybrid.electricPowerHp) ?? number(rawValue(vehicle, "vermogen_elektrisch_pk")),
    chargingPowerKw: number(hybrid.chargingPowerKw) ?? number(rawValue(vehicle, "accu_laadvermogen")),
    connector: text(hybrid.connector) ?? text(rawValue(vehicle, "stekkeraansluiting")),
    fastChargingSupported: bool(hybrid.fastChargingSupported) ?? bool(rawValue(vehicle, "geschikt_voor_snelladen")),

    updatedAt: text(vehicle.updatedAt) ?? text(vehicle.receivedAt),
  };
}

export async function listPublicVehicles(): Promise<PublicVehicle[]> {
  if (!adminDb) return [];
  const snapshot = await adminDb.collection("vehicles").orderBy("updatedAt", "desc").get();
  return snapshot.docs
    .map(doc => projectPublicVehicle({ id: doc.id, ...doc.data() }))
    .filter(vehicle => vehicle.available && vehicle.brand && vehicle.model);
}

export async function getPublicVehicle(id: string): Promise<PublicVehicle | null> {
  if (!adminDb) return null;
  const snapshot = await adminDb.collection("vehicles").doc(id).get();
  if (!snapshot.exists) return null;
  const vehicle = projectPublicVehicle({ id: snapshot.id, ...snapshot.data() });
  return vehicle.available ? vehicle : null;
}
