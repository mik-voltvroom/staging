import { z } from "zod";

const mobiloxVehicleSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String).optional(),
  kenteken: z.string().optional(),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
  merk: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  type: z.string().optional(),
  uitvoering: z.string().optional(),
  mileage: z.number().optional(),
  tellerstand: z.number().optional(),
  bouwjaar: z.number().optional(),
  year: z.number().optional(),
  fuel: z.string().optional(),
  brandstof: z.string().optional(),
  color: z.string().optional(),
  kleur: z.string().optional(),
  raw: z.record(z.unknown()).optional(),
}).passthrough();

export type MobiloxVehiclePayload = z.infer<typeof mobiloxVehicleSchema>;

export interface VehicleInformation {
  provider: "mobilox";
  providerVehicleId?: string;
  licensePlate?: string;
  vin?: string;
  brand?: string;
  model?: string;
  trim?: string;
  mileage?: number;
  year?: number;
  fuel?: string;
  color?: string;
  retrievedAt: string;
  raw: Record<string, unknown>;
}

function requiredConfig() {
  const baseUrl = process.env.MOBILOX_API_BASE_URL?.replace(/\/$/, "");
  const apiKey = process.env.MOBILOX_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error("Mobilox is niet geconfigureerd. Stel MOBILOX_API_BASE_URL en MOBILOX_API_KEY in.");
  }
  return { baseUrl, apiKey };
}

async function mobiloxFetch(path: string, init?: RequestInit): Promise<unknown> {
  const { baseUrl, apiKey } = requiredConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...init?.headers,
      },
    });
    if (!response.ok) {
      throw new Error(`Mobilox request mislukt (${response.status}).`);
    }
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeVehicle(input: unknown): VehicleInformation {
  const parsed = mobiloxVehicleSchema.parse(input);
  const raw = { ...parsed } as Record<string, unknown>;
  return {
    provider: "mobilox",
    providerVehicleId: parsed.id,
    licensePlate: parsed.kenteken ?? parsed.licensePlate,
    vin: parsed.vin,
    brand: parsed.merk ?? parsed.brand,
    model: parsed.model ?? parsed.type,
    trim: parsed.uitvoering,
    mileage: parsed.tellerstand ?? parsed.mileage,
    year: parsed.bouwjaar ?? parsed.year,
    fuel: parsed.brandstof ?? parsed.fuel,
    color: parsed.kleur ?? parsed.color,
    retrievedAt: new Date().toISOString(),
    raw,
  };
}

export async function getMobiloxVehicleByLicensePlate(licensePlate: string): Promise<VehicleInformation> {
  const normalizedPlate = licensePlate.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (normalizedPlate.length < 4 || normalizedPlate.length > 8) throw new Error("Ongeldig kenteken.");
  const pathTemplate = process.env.MOBILOX_VEHICLE_BY_PLATE_PATH ?? "/vehicles/license-plate/{licensePlate}";
  const path = pathTemplate.replace("{licensePlate}", encodeURIComponent(normalizedPlate));
  return normalizeVehicle(await mobiloxFetch(path));
}

export async function getMobiloxVehicleByVin(vin: string): Promise<VehicleInformation> {
  const normalizedVin = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
  if (normalizedVin.length !== 17) throw new Error("Ongeldig VIN.");
  const pathTemplate = process.env.MOBILOX_VEHICLE_BY_VIN_PATH ?? "/vehicles/vin/{vin}";
  const path = pathTemplate.replace("{vin}", encodeURIComponent(normalizedVin));
  return normalizeVehicle(await mobiloxFetch(path));
}
