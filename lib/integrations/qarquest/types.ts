export type QarQuestSourceFormat = "json" | "html";

export interface QarQuestRawRecord {
  sourceId?: string;
  sourceUrl?: string;
  make?: string;
  model?: string;
  variant?: string;
  year?: number;
  mileageKm?: number;
  askingPrice?: number;
  expectedRetailPrice?: number;
  expectedGrossMargin?: number;
  expectedDaysToSell?: number;
  comparableCount?: number;
  country?: string;
  fetchedAt: string;
  raw?: unknown;
}

export interface MarketVehicle {
  source: "qarquest";
  sourceId: string;
  sourceUrl?: string;
  make: string;
  model: string;
  variant?: string;
  year?: number;
  mileageKm?: number;
  askingPrice?: number;
  expectedRetailPrice?: number;
  expectedGrossMargin?: number;
  expectedDaysToSell?: number;
  comparableCount?: number;
  country?: string;
  fetchedAt: string;
  confidence: number;
}

export interface QarQuestIngestAudit {
  fetchedAt: string;
  sourceUrl: string;
  status: "ok" | "rejected" | "error";
  recordCount: number;
  reason?: string;
}
