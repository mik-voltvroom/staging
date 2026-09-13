import { describe, expect, it } from "vitest";
import type { Vehicle } from "@/types";
import { createDefaultChecklist } from "@/lib/glasses/business";
import type { InspectionSession } from "@/lib/glasses/model";
import { generatePurchaseAdvice } from "@/lib/glasses/purchase-intelligence";
import { VVOSAIService } from "@/lib/glasses/ai-service";

const vehicle: Vehicle = {
  id: "vehicle-1", slug: "rav4", brand: "Toyota", model: "RAV4", trim: "2.5 Hybrid", year: 2022, mileageKm: 42831,
  priceCents: 3_495_000, driveType: "full-hybrid", fuelType: "Hybrid", transmission: "Automaat", bodyStyle: "SUV", color: "grijs",
  maintenanceHistory: "complete", images: [], highlights: [], status: "available", locationCode: "GRONINGEN", updatedAt: "2026-09-09T00:00:00.000Z",
  commercial: { targetMarginCents: 350_000, maxStockDays: 60, viewCount: 0, leadCount: 0, priceHistory: [] },
};

function session(): InspectionSession {
  const checklist = createDefaultChecklist();
  checklist[0] = { ...checklist[0], status: "ok" };
  return {
    id: "11111111-1111-4111-8111-111111111111", vehicleId: vehicle.id, inspectorId: "tester", status: "review",
    startedAt: "2026-09-09T00:00:00.000Z", updatedAt: "2026-09-09T00:10:00.000Z",
    device: { adapter: "mock", name: "Mock", connected: true, network: "online", capabilities: { camera: true, microphone: true, audioOutput: true, display: false, video: true } },
    currentSection: "identification", currentItemId: checklist[0].id, checklist, observations: [], media: [], version: 1,
    findings: [{ id: "f1", inspectionId: "11111111-1111-4111-8111-111111111111", vehicleId: vehicle.id, category: "tires", component: "wheel", location: "front_right", severity: "minor", description: "Lichte velgschade", estimatedRepairCostCents: 12_500, mediaIds: [], source: "voice", reviewStatus: "confirmed", createdBy: "tester", createdAt: "2026-09-09T00:05:00.000Z", updatedAt: "2026-09-09T00:05:00.000Z" }],
  };
}

describe("VVOS Glasses intelligence", () => {
  it("calculates a transparent maximum purchase price", () => {
    const advice = generatePurchaseAdvice(vehicle, session(), { transportCents: 35_000, warrantyReserveCents: 50_000, marketingCents: 15_000, stockCostCents: 20_000 });
    expect(advice.assumptions.reconditioningCents).toBe(12_500);
    expect(advice.maximumPurchasePriceCents).toBe(3_012_500);
    expect(advice.verdict).toBe("ALLEEN_ONDER_MAX");
  });

  it("returns strong buy only when an actual offer is safely below max", () => {
    const advice = generatePurchaseAdvice(vehicle, session(), { offeredPurchasePriceCents: 2_700_000, desiredMarginCents: 350_000 });
    expect(advice.verdict).toBe("STERK_INKOPEN");
    expect(advice.expectedNetMarginCents).toBeGreaterThan(advice.assumptions.desiredMarginCents);
  });

  it("never finalizes vision without a provider and human review", async () => {
    const service = new VVOSAIService();
    await expect(service.analyzeVehicleImage({ session: session(), vehicle, imageUrl: "https://example.invalid/photo.jpg", mediaId: "m1" })).rejects.toThrow(/provider/i);
  });

  it("generates a deterministic inspection summary", async () => {
    const summary = await new VVOSAIService().generateInspectionSummary(session());
    expect(summary.confirmedFindings).toBe(1);
    expect(summary.progressPercent).toBeGreaterThan(0);
  });
});
