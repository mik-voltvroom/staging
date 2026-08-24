type ShadowVehicle = Record<string, unknown>;

function enabled(): boolean {
  return process.env.VVOS_SUPABASE_SHADOW_WRITE === "true";
}

function configured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function integer(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

export async function shadowVehicleToSupabase(input: {
  externalId: string;
  action: string;
  vehicle?: ShadowVehicle | null;
}): Promise<{ attempted: boolean; ok: boolean; error?: string }> {
  if (!enabled()) return { attempted: false, ok: true };
  if (!configured()) return { attempted: true, ok: false, error: "Supabase shadow-write configuration missing" };

  const base = process.env.SUPABASE_URL!.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const headers = {
    apikey: key,
    authorization: `Bearer ${key}`,
    "content-type": "application/json",
    prefer: "resolution=merge-duplicates,return=minimal",
  };

  try {
    if (input.action === "archive") {
      const response = await fetch(`${base}/rest/v1/vehicles?source_provider=eq.mobilox-hexon&source_external_id=eq.${encodeURIComponent(input.externalId)}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: "archived", updated_at: new Date().toISOString() }),
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Supabase archive returned ${response.status}`);
      return { attempted: true, ok: true };
    }

    const vehicle = input.vehicle;
    if (!vehicle) return { attempted: true, ok: false, error: "Vehicle payload missing" };

    const row = {
      source_provider: "mobilox-hexon",
      source_external_id: input.externalId,
      registration: text(vehicle.registration) ?? text(vehicle.licensePlate),
      vin: text(vehicle.vin),
      make: text(vehicle.make) ?? text(vehicle.brand) ?? "Onbekend",
      model: text(vehicle.model) ?? "Onbekend",
      variant: text(vehicle.variant),
      model_year: integer(vehicle.modelYear) ?? integer(vehicle.year),
      mileage_km: integer(vehicle.mileageKm) ?? integer(vehicle.mileage),
      price_cents: integer(vehicle.priceCents) ?? 0,
      status: text(vehicle.status) ?? "available",
      raw_payload: vehicle,
      updated_at: new Date().toISOString(),
    };

    const response = await fetch(`${base}/rest/v1/vehicles?on_conflict=source_provider,source_external_id`, {
      method: "POST",
      headers,
      body: JSON.stringify(row),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Supabase upsert returned ${response.status}`);
    return { attempted: true, ok: true };
  } catch (error) {
    return { attempted: true, ok: false, error: error instanceof Error ? error.message : "Unknown Supabase shadow-write error" };
  }
}
