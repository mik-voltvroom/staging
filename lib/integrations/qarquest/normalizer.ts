import type { MarketVehicle, QarQuestRawRecord } from "./types";

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const number = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const cleaned = value.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export function normalizeQarQuestJson(input: Record<string, unknown>, fetchedAt = new Date().toISOString()): QarQuestRawRecord {
  return {
    sourceId: text(input.id ?? input.vehicleId ?? input.stockId),
    sourceUrl: text(input.url ?? input.detailUrl),
    make: text(input.make ?? input.brand ?? input.merk),
    model: text(input.model),
    variant: text(input.variant ?? input.version ?? input.execution),
    year: number(input.year ?? input.registrationYear ?? input.bouwjaar),
    mileageKm: number(input.mileage ?? input.mileageKm ?? input.kilometerstand),
    askingPrice: number(input.price ?? input.askingPrice ?? input.vraagprijs),
    expectedRetailPrice: number(input.expectedRetailPrice ?? input.retailPrice ?? input.expectedSellingPrice),
    expectedGrossMargin: number(input.expectedGrossMargin ?? input.margin),
    expectedDaysToSell: number(input.expectedDaysToSell ?? input.daysToSell ?? input.stockDays),
    comparableCount: number(input.comparableCount ?? input.comparables),
    country: text(input.country),
    fetchedAt,
    raw: input,
  };
}

export function toMarketVehicle(record: QarQuestRawRecord): MarketVehicle | null {
  if (!record.make || !record.model) return null;
  const sourceId = record.sourceId || [record.make, record.model, record.variant, record.year, record.mileageKm, record.askingPrice].filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const useful = [record.year, record.mileageKm, record.askingPrice, record.expectedRetailPrice, record.expectedDaysToSell].filter(v => v != null).length;
  return {
    source: "qarquest",
    sourceId,
    sourceUrl: record.sourceUrl,
    make: record.make,
    model: record.model,
    variant: record.variant,
    year: record.year,
    mileageKm: record.mileageKm,
    askingPrice: record.askingPrice,
    expectedRetailPrice: record.expectedRetailPrice,
    expectedGrossMargin: record.expectedGrossMargin,
    expectedDaysToSell: record.expectedDaysToSell,
    comparableCount: record.comparableCount,
    country: record.country,
    fetchedAt: record.fetchedAt,
    confidence: Math.min(1, 0.35 + useful * 0.12),
  };
}
