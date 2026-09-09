import type { Vehicle } from "@/types";
import type { Finding, InspectionSession } from "@/lib/glasses/model";

export type PurchaseVerdict = "STERK_INKOPEN" | "INKOPEN" | "ALLEEN_ONDER_MAX" | "NIET_INKOPEN";
export type PurchaseRisk = "low" | "medium" | "high" | "critical";

export interface PurchaseAdviceAssumptions {
  expectedSalePriceCents: number;
  reconditioningCents: number;
  transportCents: number;
  warrantyReserveCents: number;
  marketingCents: number;
  stockCostCents: number;
  desiredMarginCents: number;
  offeredPurchasePriceCents?: number;
}

export interface PurchaseAdvice {
  id: string;
  vehicleId: string;
  inspectionId?: string;
  createdAt: string;
  assumptions: PurchaseAdviceAssumptions;
  unpricedFindingIds: string[];
  maximumPurchasePriceCents: number;
  expectedGrossMarginCents?: number;
  expectedNetMarginCents?: number;
  risk: PurchaseRisk;
  verdict: PurchaseVerdict;
  rationale: string[];
}

export interface PurchaseAdviceOverrides {
  expectedSalePriceCents?: number;
  reconditioningCents?: number;
  transportCents?: number;
  warrantyReserveCents?: number;
  marketingCents?: number;
  stockCostCents?: number;
  desiredMarginCents?: number;
  offeredPurchasePriceCents?: number;
}

function confirmedFindings(session?: InspectionSession): Finding[] {
  return session?.findings.filter(finding => finding.reviewStatus === "confirmed") ?? [];
}

function riskFor(findings: Finding[], unpricedCount: number): PurchaseRisk {
  if (findings.some(finding => finding.severity === "critical")) return "critical";
  if (findings.some(finding => finding.severity === "major") || unpricedCount >= 3) return "high";
  if (findings.some(finding => finding.severity === "attention") || unpricedCount > 0) return "medium";
  return "low";
}

export function generatePurchaseAdvice(
  vehicle: Vehicle,
  session?: InspectionSession,
  overrides: PurchaseAdviceOverrides = {},
): PurchaseAdvice {
  const findings = confirmedFindings(session);
  const pricedRepairCents = findings.reduce((sum, finding) => sum + (finding.estimatedRepairCostCents ?? 0), 0);
  const unpricedFindingIds = findings.filter(finding => finding.estimatedRepairCostCents === undefined && finding.severity !== "info").map(finding => finding.id);
  const costs = vehicle.costs;
  const assumptions: PurchaseAdviceAssumptions = {
    expectedSalePriceCents: overrides.expectedSalePriceCents ?? vehicle.priceCents,
    reconditioningCents: overrides.reconditioningCents ?? pricedRepairCents + (costs?.preparationCents ?? 0) + (costs?.maintenanceCents ?? 0),
    transportCents: overrides.transportCents ?? costs?.transportCents ?? 0,
    warrantyReserveCents: overrides.warrantyReserveCents ?? costs?.warrantyReserveCents ?? 0,
    marketingCents: overrides.marketingCents ?? costs?.advertisingCents ?? 0,
    stockCostCents: overrides.stockCostCents ?? (costs?.financingCents ?? 0) + (costs?.otherCents ?? 0),
    desiredMarginCents: overrides.desiredMarginCents ?? vehicle.commercial?.targetMarginCents ?? 350_000,
    offeredPurchasePriceCents: overrides.offeredPurchasePriceCents,
  };
  const nonPurchaseCosts = assumptions.reconditioningCents + assumptions.transportCents + assumptions.warrantyReserveCents + assumptions.marketingCents + assumptions.stockCostCents;
  const maximumPurchasePriceCents = Math.max(0, assumptions.expectedSalePriceCents - nonPurchaseCosts - assumptions.desiredMarginCents);
  const risk = riskFor(findings, unpricedFindingIds.length);
  const offered = assumptions.offeredPurchasePriceCents;
  const expectedGrossMarginCents = offered === undefined ? undefined : assumptions.expectedSalePriceCents - offered - assumptions.reconditioningCents - assumptions.transportCents;
  const expectedNetMarginCents = offered === undefined ? undefined : assumptions.expectedSalePriceCents - offered - nonPurchaseCosts;

  let verdict: PurchaseVerdict = "ALLEEN_ONDER_MAX";
  if (risk === "critical" || maximumPurchasePriceCents <= 0) verdict = "NIET_INKOPEN";
  else if (offered !== undefined) {
    if (offered > maximumPurchasePriceCents) verdict = "NIET_INKOPEN";
    else if (offered <= Math.floor(maximumPurchasePriceCents * 0.95) && risk !== "high") verdict = "STERK_INKOPEN";
    else verdict = "INKOPEN";
  }

  const rationale = [
    `Verwachte verkoopprijs gebaseerd op ${overrides.expectedSalePriceCents !== undefined ? "handmatige aanname" : "huidige VVOS-verkoopprijs"}.`,
    `${findings.length} bevestigde bevinding(en); ${unpricedFindingIds.length} zonder reparatiebedrag.`,
    `Gewenste marge: €${Math.round(assumptions.desiredMarginCents / 100).toLocaleString("nl-NL")}.`,
  ];
  if (risk === "critical") rationale.push("Minimaal één kritieke bevinding blokkeert een positief inkoopadvies.");
  if (unpricedFindingIds.length) rationale.push("Niet-geprijsde bevindingen zijn niet stilzwijgend in de maximale inkoopprijs geschat.");

  return {
    id: crypto.randomUUID(),
    vehicleId: vehicle.id,
    inspectionId: session?.id,
    createdAt: new Date().toISOString(),
    assumptions,
    unpricedFindingIds,
    maximumPurchasePriceCents,
    expectedGrossMarginCents,
    expectedNetMarginCents,
    risk,
    verdict,
    rationale,
  };
}
