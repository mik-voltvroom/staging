import { XMLParser, XMLValidator } from "fast-xml-parser";
import { slugify, validateVehicle } from "@/lib/business";
import { eurosToCents } from "@/lib/money";
import type { DriveType, Vehicle } from "@/types";

type XmlRecord = Record<string, unknown>;
type ProviderAction = "add" | "change" | "delete";

export interface HexonMutation {
  action: "upsert" | "archive";
  providerAction: ProviderAction;
  externalId: string;
  vehicle?: Vehicle;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  ignoreDeclaration: true,
  parseTagValue: false,
  parseAttributeValue: false,
  processEntities: false,
  trimValues: true,
});

const MAX_XML_NODES = 20_000;

function normalizedKey(value: string): string {
  const withoutAttributePrefix = value.replace(/^@_/, "");
  return withoutAttributePrefix.split(":").at(-1)?.toLowerCase() ?? withoutAttributePrefix.toLowerCase();
}

function isRecord(value: unknown): value is XmlRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function visit(root: unknown, callback: (key: string, value: unknown, rawKey: string) => boolean | void): void {
  const queue: unknown[] = [root];
  let queueIndex = 0;
  let visited = 0;
  while (queueIndex < queue.length) {
    const current = queue[queueIndex++];
    if (++visited > MAX_XML_NODES) throw new Error("Hexon XML bevat te veel velden.");
    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }
    if (!isRecord(current)) continue;
    for (const [key, value] of Object.entries(current)) {
      if (callback(normalizedKey(key), value, key) === true) return;
      if (Array.isArray(value) || isRecord(value)) queue.push(value);
    }
  }
}

function textFrom(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const text = String(value).trim();
    return text || undefined;
  }
  let result: string | undefined;
  visit(value, (_key, nested, rawKey) => {
    if (rawKey.startsWith("@_")) return;
    if (typeof nested === "string" || typeof nested === "number" || typeof nested === "boolean") {
      const text = String(nested).trim();
      if (text) {
        result = text;
        return true;
      }
    }
  });
  return result;
}

function attributeText(value: unknown, name: string): string | undefined {
  if (!isRecord(value)) return undefined;
  const expected = normalizedKey(name);
  for (const [key, nested] of Object.entries(value)) {
    if (!key.startsWith("@_")) continue;
    if (normalizedKey(key) !== expected) continue;
    return textFrom(nested);
  }
  return undefined;
}

function firstField(root: unknown, names: string[]): unknown {
  for (const name of names) {
    const expected = normalizedKey(name);
    let found: unknown;
    visit(root, (key, value) => {
      if (key === expected) {
        found = value;
        return true;
      }
    });
    if (found !== undefined) return found;
  }
  return undefined;
}

function firstText(root: unknown, names: string[]): string | undefined {
  for (const name of names) {
    const text = textFrom(firstField(root, [name]));
    if (text) return text;
  }
  return undefined;
}

function parseNumber(value: unknown): number | undefined {
  const raw = textFrom(value)?.replace(/\s/g, "");
  if (!raw) return undefined;
  const normalized = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(raw)
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw.replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : undefined;
}

function parseInteger(value: unknown): number | undefined {
  const number = parseNumber(value);
  return number === undefined ? undefined : Math.round(number);
}

function parseOdometerKm(value: unknown): number | undefined {
  const reading = parseNumber(value);
  if (reading === undefined) return undefined;
  const unit = attributeText(value, "eenheid")?.toUpperCase();
  if (!unit || unit === "K") return Math.round(reading);
  if (unit === "M") return Math.round(reading * 1.609344);
  throw new Error(`Niet-ondersteunde tellerstand-eenheid uit Hexon: ${unit}.`);
}

function parseBoolean(value: unknown): boolean {
  return ["1", "true", "ja", "yes", "j"].includes(textFrom(value)?.toLowerCase() ?? "");
}

function findPriceCents(root: unknown): number {
  for (const key of ["actieprijs", "verkoopprijs_particulier", "meeneemprijs"]) {
    const priceNode = firstField(root, [key]);
    const amount = parseNumber(firstField(priceNode, ["bedrag"]) ?? priceNode);
    if (amount !== undefined && amount > 0) return eurosToCents(amount, key);
  }
  throw new Error("Hexon verkoopprijs ontbreekt of is ongeldig.");
}

function inferDriveType(fuel: string, pluginHybrid: boolean): DriveType {
  const value = fuel.trim().toLowerCase();
  if (value === "e" || value === "electric" || value === "elektrisch") return "electric";
  if (pluginHybrid || value === "b,e" || value === "d,e") return "plug-in-hybrid";
  if (value === "h" || value.includes("hybrid") || value.includes("hybride")) return "full-hybrid";
  throw new Error(`Niet-ondersteunde aandrijving uit Hexon: ${fuel}.`);
}

function displayFuelType(fuel: string, driveType: DriveType): string {
  const value = fuel.trim().toUpperCase();
  if (driveType === "electric") return "Elektrisch";
  if (value === "B,E") return "Benzine / Elektrisch";
  if (value === "D,E") return "Diesel / Elektrisch";
  if (value === "H") return "Hybride";
  return fuel;
}

function displayTransmission(value: string | undefined): string {
  if (value === "A") return "Automaat";
  if (value === "H") return "Handgeschakeld";
  if (value === "S") return "Semi-automaat";
  if (value === "C") return "CVT";
  return value || "Onbekend";
}

function collectHttpsUrls(root: unknown): string[] {
  const urls = new Set<string>();
  visit(root, (key, value) => {
    if (key !== "url" || typeof value !== "string") return;
    const candidate = value.trim();
    if (/^https:\/\//i.test(candidate)) urls.add(candidate);
  });
  return [...urls].slice(0, 100);
}

function collectHighlights(root: unknown): string[] {
  const source = firstField(root, ["accessoires", "zoekaccessoires", "opties"]);
  if (!source) return [];
  const values = new Set<string>();
  visit(source, (key, value) => {
    if (!["accessoire", "optie", "omschrijving", "naam"].includes(key)) return;
    const text = textFrom(value);
    if (text && text.length <= 120) values.add(text);
  });
  return [...values].slice(0, 40);
}

function safeExternalId(value: string): string {
  const normalized = value.trim().replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-");
  if (!normalized || normalized.length > 100) throw new Error("Hexon voertuignummer is ongeldig.");
  return normalized;
}

function providerMutationAction(root: unknown): ProviderAction {
  const vehicleNode = firstField(root, ["voertuig"]);
  const attribute = attributeText(vehicleNode, "actie")?.toLowerCase();
  const fallback = firstText(root, ["actie", "action"])?.toLowerCase();
  const value = attribute || fallback || "add";
  if (/delete|remove|verwijder|offline/.test(value)) return "delete";
  if (/change|update|wijzig/.test(value)) return "change";
  return "add";
}

export function parseHexonMutation(xml: string, now = new Date()): HexonMutation {
  if (!xml.trim() || xml.length > 2_000_000) throw new Error("Hexon XML ontbreekt of is te groot.");
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error("DTD en entities zijn niet toegestaan.");
  const validation = XMLValidator.validate(xml);
  if (validation !== true) throw new Error("Hexon XML is niet geldig.");

  const parsed = parser.parse(xml) as unknown;
  const externalId = safeExternalId(firstText(parsed, ["voertuignr_hexon", "voertuignr", "voertuignr_klant", "voertuignummer", "stocknummer"]) ?? "");
  const providerAction = providerMutationAction(parsed);
  const action = providerAction === "delete" ? "archive" : "upsert";
  if (action === "archive") return { action, providerAction, externalId };

  const brand = firstText(parsed, ["merk"]) ?? "";
  const model = firstText(parsed, ["model"]) ?? "";
  const trim = firstText(parsed, ["uitrustingsniveau", "type", "titel"]) ?? "";
  const rawFuel = firstText(parsed, ["brandstof", "brandstof_omschrijving"]) ?? "";
  const pluginHybrid = parseBoolean(firstField(parsed, ["plugin_hybride"]));
  const driveType = inferDriveType(rawFuel, pluginHybrid);
  const fuelType = displayFuelType(rawFuel, driveType);
  const year = parseInteger(firstField(parsed, ["bouwjaar", "modeljaar"])) ?? 0;
  const mileageValue = firstField(parsed, ["tellerstand", "kilometerstand"]);
  const parsedMileageKm = parseOdometerKm(mileageValue);
  const mileageKm = parsedMileageKm ?? 0;
  const images = collectHttpsUrls(firstField(parsed, ["afbeeldingen", "fotos", "foto_s"]));
  const sold = parseBoolean(firstField(parsed, ["verkocht"]));
  const reserved = parseBoolean(firstField(parsed, ["gereserveerd"]));
  const id = `hexon-${externalId}`;
  const updatedAt = now.toISOString();
  const vin = firstText(parsed, ["vin", "chassisnummer"]);
  const licensePlate = firstText(parsed, ["kenteken"]);
  const description = firstText(parsed, ["opmerkingen", "omschrijving"]);
  const batteryHealthPercent = parseInteger(firstField(parsed, ["accu_conditie"]));
  const electricRangeKm = parseInteger(firstField(parsed, ["wltp_actieradius_elektrisch_combined", "actieradius_elektrisch"]));
  const consumptionPer100Km = parseNumber(firstField(parsed, ["wltp_brandstofverbruik_combined_weighted", "wltp_brandstofverbruik_combined", "gemiddeld_verbruik"]));
  const warrantyMonths = parseInteger(firstField(parsed, ["garantie_maanden", "fabrieksgarantie_aantal_maanden"]));

  const vehicle: Vehicle = {
    id,
    slug: slugify(`${brand}-${model}-${trim}-${year}-${externalId}`),
    brand,
    model,
    trim,
    year,
    mileageKm,
    priceCents: findPriceCents(parsed),
    driveType,
    fuelType,
    transmission: displayTransmission(firstText(parsed, ["transmissie", "versnellingsbak"])),
    bodyStyle: firstText(parsed, ["carrosserie", "carrosserievorm"]) ?? "Onbekend",
    color: firstText(parsed, ["kleur_nederlands", "basiskleur"]) ?? "Onbekend",
    ...(batteryHealthPercent !== undefined ? { batteryHealthPercent } : {}),
    ...(electricRangeKm !== undefined ? { electricRangeKm } : {}),
    ...(consumptionPer100Km !== undefined ? { consumptionPer100Km } : {}),
    ...(warrantyMonths !== undefined ? { warrantyMonths } : {}),
    maintenanceHistory: firstText(parsed, ["onderhoudsboekjes"]) === "dealer" ? "complete" : "unknown",
    ...(vin ? { vin } : {}),
    ...(licensePlate ? { licensePlate } : {}),
    images,
    highlights: collectHighlights(parsed),
    ...(description ? { description } : {}),
    status: sold ? "sold" : reserved ? "reserved" : "review",
    locationCode: process.env.HEXON_DEFAULT_LOCATION_CODE || "GRONINGEN",
    updatedAt,
  };

  const validationErrors = validateVehicle(vehicle);
  if (parsedMileageKm === undefined && !validationErrors.includes("Kilometerstand ontbreekt")) {
    validationErrors.push("Kilometerstand ontbreekt");
  }
  if (!sold && !reserved && validationErrors.length === 0) vehicle.status = "available";
  vehicle.publication = {
    channels: {
      website: vehicle.status === "available",
      merchant: false,
      google_ads: false,
      meta: false,
    },
    completenessPercent: Math.max(0, 100 - validationErrors.length * 12),
    lastValidatedAt: updatedAt,
    validationErrors,
  };

  return { action, providerAction, externalId, vehicle };
}
