import { XMLParser, XMLValidator } from "fast-xml-parser";
import { slugify, validateVehicle } from "@/lib/business";
import { eurosToCents } from "@/lib/money";
import type { DriveType, Vehicle } from "@/types";

type XmlRecord = Record<string, unknown>;

export interface HexonMutation {
  action: "upsert" | "archive";
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
  return textFrom(firstField(root, names));
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

function parseBoolean(value: unknown): boolean {
  return ["1", "true", "ja", "yes", "j"].includes(textFrom(value)?.toLowerCase() ?? "");
}

function findPriceCents(root: unknown): number {
  const priceNode = firstField(root, ["verkoopprijs_particulier", "actieprijs", "meeneemprijs"]);
  const amount = parseNumber(firstField(priceNode, ["bedrag"]) ?? priceNode);
  if (amount === undefined) throw new Error("Hexon verkoopprijs ontbreekt of is ongeldig.");
  return eurosToCents(amount, "verkoopprijs_particulier");
}

function inferDriveType(fuel: string): DriveType {
  const value = fuel.toLowerCase();
  if (value.includes("plug") || (value.includes("elektr") && /benzine|diesel/.test(value))) return "plug-in-hybrid";
  if (value.includes("hybrid") || value.includes("hybride")) return "full-hybrid";
  if (value.includes("elektr")) return "electric";
  throw new Error(`Niet-ondersteunde aandrijving uit Hexon: ${fuel}.`);
}

function collectHttpsUrls(root: unknown): string[] {
  const urls = new Set<string>();
  visit(root, (_key, value) => {
    if (typeof value !== "string") return;
    const candidate = value.trim();
    if (/^https:\/\//i.test(candidate)) urls.add(candidate);
  });
  return [...urls].slice(0, 100);
}

function collectHighlights(root: unknown): string[] {
  const source = firstField(root, ["accessoires", "opties"]);
  if (!source) return [];
  const values = new Set<string>();
  visit(source, (key, value) => {
    if (!["accessoire", "optie", "omschrijving", "naam"].includes(key)) return;
    const text = textFrom(value);
    if (text && text.length <= 120) values.add(text);
  });
  return [...values].slice(0, 20);
}

function safeExternalId(value: string): string {
  const normalized = value.trim().replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-");
  if (!normalized || normalized.length > 100) throw new Error("Hexon voertuignummer is ongeldig.");
  return normalized;
}

function mutationAction(root: unknown): "upsert" | "archive" {
  const value = firstText(root, ["actie", "action"])?.toLowerCase() ?? "";
  return /delete|remove|verwijder|offline/.test(value) ? "archive" : "upsert";
}

export function parseHexonMutation(xml: string, now = new Date()): HexonMutation {
  if (!xml.trim() || xml.length > 2_000_000) throw new Error("Hexon XML ontbreekt of is te groot.");
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error("DTD en entities zijn niet toegestaan.");
  const validation = XMLValidator.validate(xml);
  if (validation !== true) throw new Error("Hexon XML is niet geldig.");

  const parsed = parser.parse(xml) as unknown;
  const externalId = safeExternalId(firstText(parsed, ["voertuignr_hexon", "voertuignummer", "stocknummer"]) ?? "");
  const action = mutationAction(parsed);
  if (action === "archive") return { action, externalId };

  const brand = firstText(parsed, ["merk"]) ?? "";
  const model = firstText(parsed, ["model"]) ?? "";
  const trim = firstText(parsed, ["uitvoering", "type", "titel"]) ?? "";
  const fuelType = firstText(parsed, ["brandstof", "brandstof_omschrijving"]) ?? "Elektrisch";
  const year = parseInteger(firstField(parsed, ["bouwjaar"])) ?? 0;
  const mileageKm = parseInteger(firstField(parsed, ["tellerstand", "kilometerstand"])) ?? 0;
  const images = collectHttpsUrls(firstField(parsed, ["afbeeldingen", "fotos", "foto_s"]));
  const sold = parseBoolean(firstField(parsed, ["verkocht"]));
  const id = `hexon-${externalId}`;
  const updatedAt = now.toISOString();

  const vehicle: Vehicle = {
    id,
    slug: slugify(`${brand}-${model}-${trim}-${year}-${externalId}`),
    brand,
    model,
    trim,
    year,
    mileageKm,
    priceCents: findPriceCents(parsed),
    driveType: inferDriveType(fuelType),
    fuelType,
    transmission: firstText(parsed, ["transmissie", "versnellingsbak"]) ?? "Onbekend",
    bodyStyle: firstText(parsed, ["carrosserie", "carrosserievorm"]) ?? "Onbekend",
    color: firstText(parsed, ["kleur", "basiskleur"]) ?? "Onbekend",
    maintenanceHistory: "unknown",
    vin: firstText(parsed, ["chassisnummer", "vin"]),
    licensePlate: firstText(parsed, ["kenteken"]),
    images,
    highlights: collectHighlights(parsed),
    description: firstText(parsed, ["opmerkingen", "omschrijving"]),
    status: sold ? "sold" : "review",
    locationCode: process.env.HEXON_DEFAULT_LOCATION_CODE || "GRONINGEN",
    updatedAt,
  };

  const validationErrors = validateVehicle(vehicle);
  if (!sold && validationErrors.length === 0) vehicle.status = "available";
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

  return { action, externalId, vehicle };
}
