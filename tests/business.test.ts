import { describe, expect, it } from "vitest";
import { grossMargin, marginPercent, slugify, totalCosts, validateVehicle } from "@/lib/business";
import type { VehicleCosts } from "@/types";

const costs: VehicleCosts = {
  purchasePriceEur: 20000,
  transportEur: 200,
  preparationEur: 300,
  maintenanceEur: 500,
  warrantyReserveEur: 400,
  advertisingEur: 100,
  financingEur: 250,
  otherEur: 50,
};

describe("vehicle business rules", () => {
  it("calculates total costs and margin deterministically", () => {
    expect(totalCosts(costs)).toBe(21800);
    expect(grossMargin(24950, costs)).toBe(3150);
    expect(marginPercent(24950, costs)).toBeCloseTo(12.625, 3);
  });

  it("creates stable Dutch-friendly slugs", () => {
    expect(slugify("Toyota C-HR 1.8 Hybride Édition")).toBe("toyota-c-hr-1-8-hybride-edition");
  });

  it("blocks incomplete publication data", () => {
    const errors = validateVehicle({ brand: "Toyota", model: "Corolla", driveType: "full-hybrid", images: [] });
    expect(errors).toContain("Minimaal één foto is verplicht");
    expect(errors).toContain("Verkoopprijs ontbreekt");
    expect(errors).toContain("Accugezondheid ontbreekt");
  });
});
