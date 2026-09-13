import { describe, expect, it } from "vitest";
import { publicVehicleCategory, publicVehicleEnteredAt } from "@/lib/vehicle/business";
import type { Vehicle } from "@/types";

const vehicle = (overrides: Partial<Vehicle>): Vehicle => ({
  id: "vehicle-1", slug: "vehicle-1", brand: "Test", model: "Auto", trim: "Uitvoering",
  year: 2024, mileageKm: 10_000, priceCents: 2_500_000, driveType: "electric", fuelType: "Elektrisch",
  transmission: "Automaat", bodyStyle: "SUV", color: "Zwart", maintenanceHistory: "unknown", images: [],
  highlights: [], status: "available", locationCode: "GRONINGEN", updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("publieke voertuigpresentatie", () => {
  it("gebruikt overal de drie afgesproken VV-categorieën", () => {
    expect(publicVehicleCategory(vehicle({ driveType: "electric" }))).toBe("Elektrisch");
    expect(publicVehicleCategory(vehicle({ driveType: "full-hybrid" }))).toBe("Hybride");
    expect(publicVehicleCategory(vehicle({ driveType: "plug-in-hybrid" }))).toBe("Hybride");
    expect(publicVehicleCategory(vehicle({ driveType: "combustion", fuelType: "Benzine" }))).toBe("Icon");
    expect(publicVehicleCategory(vehicle({ driveType: "combustion", fuelType: "Diesel" }))).toBe("Icon");
  });

  it("sorteert op voorraad-binnenkomstdatum met veilige fallbacks", () => {
    expect(publicVehicleEnteredAt(vehicle({ commercial: { targetMarginCents: 0, maxStockDays: 45, viewCount: 0, leadCount: 0, priceHistory: [], stockEnteredAt: "2026-03-01T00:00:00.000Z" } }))).toBe(Date.parse("2026-03-01T00:00:00.000Z"));
    expect(publicVehicleEnteredAt(vehicle({ createdAt: "2026-02-01T00:00:00.000Z" }))).toBe(Date.parse("2026-02-01T00:00:00.000Z"));
  });
});
