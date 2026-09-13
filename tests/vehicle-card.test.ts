import { describe, expect, it } from "vitest";
import { driveLabel, vehicleFacts } from "@/components/VehicleCard";
import type { Vehicle } from "@/types";

const vehicle = {
  id: "test",
  slug: "test",
  brand: "Audi",
  model: "SQ7",
  trim: "4.0 TDI",
  year: 2017,
  mileageKm: 172334,
  priceCents: 3199000,
  driveType: "combustion",
  fuelType: "Diesel",
  transmission: "Automaat",
  bodyStyle: "SUV",
  color: "Grijs",
  maintenanceHistory: "unknown",
  images: [],
  highlights: [],
  status: "available",
  locationCode: "GRONINGEN",
  updatedAt: "2026-09-07T00:00:00.000Z",
} satisfies Vehicle;

describe("voorraadkaartgegevens per aandrijflijn", () => {
  it("toont vermogen en eigenaarsaantal voor een Icoon", () => {
    expect(driveLabel(vehicle.driveType)).toBe("Icoon");
    expect(vehicleFacts({ ...vehicle, powerHp: 503, ownerCount: 2 })).toEqual([
      ["Wegenbelasting", "Niet vermeld"],
      ["Vermogen", "503 pk"],
      ["Aantal eigenaren", "2"],
      ["Leaseprijs", "Op aanvraag"],
    ]);
  });

  it("behoudt rijbereik en SOH voor elektrisch", () => {
    expect(vehicleFacts({ ...vehicle, driveType: "electric", electricRangeKm: 480, batteryHealthPercent: 94 })).toEqual([
      ["Wegenbelasting", "Niet vermeld"],
      ["Elektrisch rijbereik", "480 km"],
      ["SOH-waarde", "94%"],
      ["Leaseprijs", "Op aanvraag"],
    ]);
  });
});
