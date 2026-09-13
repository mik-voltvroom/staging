import { normalizeQarQuestJson, toMarketVehicle } from "./normalizer";
import type { MarketVehicle, QarQuestIngestAudit } from "./types";

const MIN_INTERVAL_MS = 4_000;
let lastRequestAt = 0;

function assertAllowedUrl(url: string) {
  const parsed = new URL(url);
  const host = parsed.hostname.toLowerCase();
  if (!(host === "qarquest.nl" || host.endsWith(".qarquest.nl") || host === "qarquest.com" || host.endsWith(".qarquest.com"))) {
    throw new Error("QarQuest connector refuses non-QarQuest hosts");
  }
  if (parsed.protocol !== "https:") throw new Error("HTTPS required");
}

async function throttle() {
  const wait = MIN_INTERVAL_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
  lastRequestAt = Date.now();
}

export interface QarQuestFetchOptions {
  url: string;
  /** Session material must be supplied server-side from a secret store. Never persist it in Firestore or client bundles. */
  cookieHeader: string;
}

export async function fetchQarQuestJson(options: QarQuestFetchOptions): Promise<{ vehicles: MarketVehicle[]; audit: QarQuestIngestAudit }> {
  assertAllowedUrl(options.url);
  if (!options.cookieHeader) throw new Error("Authenticated QarQuest session required");
  await throttle();

  const fetchedAt = new Date().toISOString();
  const response = await fetch(options.url, {
    headers: {
      accept: "application/json,text/plain;q=0.9,*/*;q=0.1",
      cookie: options.cookieHeader,
      "user-agent": "VVOS-QarQuest-Connector/1.0",
    },
    cache: "no-store",
    redirect: "error",
  });

  if (response.status === 401 || response.status === 403) {
    return { vehicles: [], audit: { fetchedAt, sourceUrl: options.url, status: "rejected", recordCount: 0, reason: `authentication rejected (${response.status})` } };
  }
  if (!response.ok) throw new Error(`QarQuest request failed (${response.status})`);

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) throw new Error("Expected JSON endpoint; HTML scraping is intentionally not enabled until selectors are verified");

  const payload = await response.json() as unknown;
  const rows = Array.isArray(payload) ? payload : payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data) ? (payload as { data: unknown[] }).data : [];
  const vehicles = rows
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
    .map(row => toMarketVehicle(normalizeQarQuestJson(row, fetchedAt)))
    .filter((row): row is MarketVehicle => row !== null);

  return { vehicles, audit: { fetchedAt, sourceUrl: options.url, status: "ok", recordCount: vehicles.length } };
}
