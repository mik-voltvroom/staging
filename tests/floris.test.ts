import { describe, expect, it } from "vitest";
import { buildFlorisContext, toFlorisVehicleContext } from "@/lib/floris/context";
import { requiresCurrentWebInfo } from "@/lib/floris/service";
import type { Vehicle } from "@/types";

function vehicle(): Vehicle {
  const value: Vehicle = {
    id: "vehicle-1",
    slug: "volkswagen-id4-pro",
    brand: "Volkswagen",
    model: "ID.4",
    trim: "Pro",
    year: 2024,
    mileageKm: 21000,
    priceCents: 3495000,
    driveType: "electric",
    fuelType: "Elektrisch",
    transmission: "Automaat",
    bodyStyle: "SUV",
    color: "grijs",
    batteryHealthPercent: 96,
    electricRangeKm: 485,
    consumptionPer100Km: 17.8,
    maintenanceHistory: "complete",
    vin: "WVWSECRET123456789",
    licensePlate: "AB-12-CD",
    images: [],
    highlights: ["Adaptieve cruise control", "Stoelverwarming"],
    status: "available",
    locationCode: "GRONINGEN",
    updatedAt: "2026-09-09T05:00:00.000Z",
  };
  (value as unknown as Record<string, unknown>).energy = {
    usableBatteryKwh: 77,
    dcMaxKw: 175,
    chargeTime10To80Minutes: 29,
    heatPump: true,
  };
  return value;
}

describe("Floris routing", () => {
  it("uses current web information for Dutch tax questions", () => {
    expect(requiresCurrentWebInfo("Wat betaal ik aan wegenbelasting voor deze auto?")).toBe(true);
    expect(requiresCurrentWebInfo("Hoe zit de MRB voor een EV in 2026?")).toBe(true);
  });

  it("does not use web search for ordinary vehicle equipment questions", () => {
    expect(requiresCurrentWebInfo("Heeft deze auto stoelverwarming en een warmtepomp?")).toBe(false);
    expect(requiresCurrentWebInfo("Wat is het praktijkverbruik?")).toBe(false);
  });
});

describe("Floris public vehicle context", () => {
  it("passes public facts and charging data without exposing VIN", () => {
    const context = toFlorisVehicleContext(vehicle());
    expect(context).toMatchObject({ name: "Volkswagen ID.4", electricRangeKm: 485, batteryHealthPercent: 96 });
    expect(context.equipment).toContain("Stoelverwarming");
    expect(context.energy).toMatchObject({ bruikbare_accu_kwh: 77, dc_max_kw: 175, laadtijd_10_80_minuten: 29, warmtepomp: true });
    expect(JSON.stringify(context)).not.toContain("WVWSECRET");
  });

  it("keeps the selected vehicle separate from current public inventory", () => {
    const selected = vehicle();
    const other = { ...vehicle(), id: "vehicle-2", slug: "toyota-yaris-cross", brand: "Toyota", model: "Yaris Cross", driveType: "full-hybrid" as const };
    const parsed = JSON.parse(buildFlorisContext(selected, [selected, other]));
    expect(parsed.selectedVehicle.name).toBe("Volkswagen ID.4");
    expect(parsed.currentPublicInventory).toHaveLength(1);
    expect(parsed.currentPublicInventory[0].name).toBe("Toyota Yaris Cross");
  });
});
