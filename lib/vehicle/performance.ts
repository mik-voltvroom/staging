import type { Vehicle, VehicleStatus } from "@/types";
import { totalCosts } from "@/lib/business";
import { defaultVehicleCommercial, vehicleCommercialSummary } from "@/lib/vehicle/business";

export const ACTIVE_INVENTORY_STATUSES: VehicleStatus[] = ["draft", "photography", "review", "available", "reserved"];

export type InventoryAction = "missing-costs" | "overdue" | "below-target" | "low-interest";

export interface InventoryPerformanceRow {
  vehicle: Vehicle;
  stockDays: number;
  maxStockDays: number;
  costsKnown: boolean;
  totalCostCents?: number;
  marginCents?: number;
  targetMarginCents: number;
  views: number;
  leads: number;
  actions: InventoryAction[];
}

export interface InventoryPerformance {
  rows: InventoryPerformanceRow[];
  activeCount: number;
  retailValueCents: number;
  knownCostValueCents: number;
  expectedMarginCents: number;
  costCompleteCount: number;
  costCoveragePercent: number;
  averageStockDays: number;
  overdueCount: number;
  belowTargetCount: number;
  missingCostsCount: number;
  ageBuckets: Array<{ label: string; count: number }>;
  lastUpdatedAt?: string;
}

export function buildInventoryPerformance(vehicles: Vehicle[], now = new Date()): InventoryPerformance {
  const active = vehicles.filter(vehicle => ACTIVE_INVENTORY_STATUSES.includes(vehicle.status));
  const rows = active.map(vehicle => {
    const summary = vehicleCommercialSummary(vehicle, now);
    const maxStockDays = vehicle.commercial?.maxStockDays ?? defaultVehicleCommercial.maxStockDays;
    const actions: InventoryAction[] = [];
    if (!summary.costsKnown) actions.push("missing-costs");
    if (summary.stockDays > maxStockDays) actions.push("overdue");
    if (summary.costsKnown && !summary.marginOnTarget) actions.push("below-target");
    if (summary.stockDays >= 21 && summary.totalLeadCount === 0) actions.push("low-interest");

    return {
      vehicle,
      stockDays: summary.stockDays,
      maxStockDays,
      costsKnown: summary.costsKnown,
      ...(summary.costsKnown && vehicle.costs ? { totalCostCents: totalCosts(vehicle.costs), marginCents: summary.marginCents } : {}),
      targetMarginCents: summary.targetMarginCents,
      views: summary.totalViewCount,
      leads: summary.totalLeadCount,
      actions,
    };
  });

  const costCompleteRows = rows.filter(row => row.costsKnown);
  const latestTimestamp = active.map(vehicle => vehicle.updatedAt).filter(Boolean)
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0];

  return {
    rows,
    activeCount: rows.length,
    retailValueCents: rows.reduce((total, row) => total + row.vehicle.priceCents, 0),
    knownCostValueCents: costCompleteRows.reduce((total, row) => total + (row.totalCostCents ?? 0), 0),
    expectedMarginCents: costCompleteRows.reduce((total, row) => total + (row.marginCents ?? 0), 0),
    costCompleteCount: costCompleteRows.length,
    costCoveragePercent: rows.length ? Math.round((costCompleteRows.length / rows.length) * 100) : 0,
    averageStockDays: rows.length ? Math.round(rows.reduce((total, row) => total + row.stockDays, 0) / rows.length) : 0,
    overdueCount: rows.filter(row => row.actions.includes("overdue")).length,
    belowTargetCount: rows.filter(row => row.actions.includes("below-target")).length,
    missingCostsCount: rows.filter(row => row.actions.includes("missing-costs")).length,
    ageBuckets: [
      { label: "0–20 dagen", count: rows.filter(row => row.stockDays <= 20).length },
      { label: "21–44 dagen", count: rows.filter(row => row.stockDays >= 21 && row.stockDays <= 44).length },
      { label: "45–59 dagen", count: rows.filter(row => row.stockDays >= 45 && row.stockDays <= 59).length },
      { label: "60+ dagen", count: rows.filter(row => row.stockDays >= 60).length },
    ],
    ...(latestTimestamp ? { lastUpdatedAt: latestTimestamp } : {}),
  };
}
