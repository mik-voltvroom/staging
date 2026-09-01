import { describe, expect, it } from "vitest";
import { buildInventoryPerformance } from "@/lib/vehicle/performance";
import { defaultVehicleCommercial } from "@/lib/vehicle/business";
import { emptyCosts } from "@/lib/business";
import type { Vehicle } from "@/types";

const vehicle = (overrides: Partial<Vehicle>): Vehicle => ({
  id: "vehicle-1", slug: "vehicle-1", brand: "Audi", model: "SQ7", trim: "4.0 TDI",
  year: 2017, mileageKm: 172_334, priceCents: 3_199_000, driveType: "combustion",
  fuelType: "Diesel", transmission: "Automaat", bodyStyle: "SUV", color: "Zwart",
  maintenanceHistory: "unknown", images: [], highlights: [], status: "available",
  locationCode: "GRONINGEN", createdAt: "2026-08-01T00:00:00.000Z", updatedAt: "2026-08-30T12:00:00.000Z",
  commercial: { ...defaultVehicleCommercial, stockEnteredAt: "2026-08-01T00:00:00.000Z" },
  ...overrides,
});

describe("live marge- en statijddashboard", () => {
  it("telt alleen actieve voorraad en maakt ontbrekende kostendata zichtbaar", () => {
    const result = buildInventoryPerformance([
      vehicle({ id: "active" }),
      vehicle({ id: "sold", status: "sold", soldAt: "2026-08-20T00:00:00.000Z" }),
    ], new Date("2026-09-01T00:00:00.000Z"));
    expect(result.activeCount).toBe(1);
    expect(result.retailValueCents).toBe(3_199_000);
    expect(result.expectedMarginCents).toBe(0);
    expect(result.costCoveragePercent).toBe(0);
    expect(result.rows[0].actions).toContain("missing-costs");
  });

  it("berekent marge uitsluitend over kost-complete dossiers", () => {
    const costs = { ...emptyCosts, purchasePriceCents: 2_500_000, preparationCents: 99_000 };
    const result = buildInventoryPerformance([
      vehicle({ id: "known", costs }),
      vehicle({ id: "unknown", priceCents: 2_000_000 }),
    ], new Date("2026-09-01T00:00:00.000Z"));
    expect(result.knownCostValueCents).toBe(2_599_000);
    expect(result.expectedMarginCents).toBe(600_000);
    expect(result.costCompleteCount).toBe(1);
    expect(result.costCoveragePercent).toBe(50);
  });

  it("signaleert overschreden statijd, doelmarge en lage interesse", () => {
    const result = buildInventoryPerformance([vehicle({
      costs: { ...emptyCosts, purchasePriceCents: 3_000_000 },
      commercial: { ...defaultVehicleCommercial, stockEnteredAt: "2026-07-01T00:00:00.000Z" },
    })], new Date("2026-09-01T00:00:00.000Z"));
    expect(result.rows[0].stockDays).toBe(62);
    expect(result.rows[0].actions).toEqual(["overdue", "below-target", "low-interest"]);
    expect(result.overdueCount).toBe(1);
    expect(result.belowTargetCount).toBe(1);
    expect(result.ageBuckets.at(-1)).toEqual({ label: "60+ dagen", count: 1 });
  });

  it("laadt het dashboard uit de Firebase-voertuigrepository", async () => {
    const source = await import("node:fs/promises").then(fs => fs.readFile("app/dashboard/voorraadprestaties/page.tsx", "utf8"));
    expect(source).toContain('listVehicles } from "@/lib/repositories/vehicle-repository"');
    expect(source).not.toContain("@/lib/demo-store");
  });
});
