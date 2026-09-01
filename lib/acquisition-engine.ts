export interface AcquisitionCandidate {
  brand: string;
  model: string;
  year: number;
  mileageKm: number;
  askingPriceEur: number;
  expectedRetailEur: number;
  preparationEur: number;
  transportEur: number;
  warrantyReserveEur: number;
  otherCostsEur: number;
  expectedDaysToSell: number;
  comparableSupply: number;
  demandScore: number;
  vvFitScore: number;
}

export interface AcquisitionResult {
  buyScore: number;
  decision: "BUY" | "NEGOTIATE" | "NO BUY";
  totalCostsEur: number;
  expectedMarginEur: number;
  marginPercent: number;
  grossProfitPerStockDay: number;
  maxBidEur: number;
  targetBidEur: number;
  probabilitySoldWithin30Days: number;
  reasons: string[];
}

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));
const round50 = (n: number) => Math.floor(n / 50) * 50;

export function analyseAcquisition(c: AcquisitionCandidate): AcquisitionResult {
  const nonPurchaseCosts = c.preparationEur + c.transportEur + c.warrantyReserveEur + c.otherCostsEur;
  const expectedMarginEur = c.expectedRetailEur - c.askingPriceEur - nonPurchaseCosts;
  const marginPercent = c.expectedRetailEur > 0 ? (expectedMarginEur / c.expectedRetailEur) * 100 : 0;
  const grossProfitPerStockDay = expectedMarginEur / Math.max(1, c.expectedDaysToSell);

  // Minimum contribution target scales with retail value, with a practical floor.
  const targetMargin = Math.max(2500, c.expectedRetailEur * 0.11);
  const maxBidEur = round50(Math.max(0, c.expectedRetailEur - nonPurchaseCosts - targetMargin));
  const targetBidEur = round50(Math.max(0, maxBidEur - Math.max(300, c.expectedRetailEur * 0.015)));

  const marginScore = clamp((marginPercent / 15) * 100);
  const velocityScore = clamp(110 - c.expectedDaysToSell * 2.1);
  const supplyPenalty = clamp(100 - Math.max(0, c.comparableSupply - 8) * 2.5);
  const demand = clamp(c.demandScore);
  const fit = clamp(c.vvFitScore);
  const buyScore = Math.round(
    marginScore * 0.32 + velocityScore * 0.28 + demand * 0.18 + fit * 0.14 + supplyPenalty * 0.08,
  );

  const probabilitySoldWithin30Days = Math.round(clamp(100 - (c.expectedDaysToSell - 18) * 2.3 + (demand - 50) * 0.25));
  const decision = buyScore >= 78 && c.askingPriceEur <= maxBidEur ? "BUY" : buyScore >= 58 ? "NEGOTIATE" : "NO BUY";
  const reasons = [
    `Verwachte marge €${Math.round(expectedMarginEur).toLocaleString("nl-NL")}`,
    `Verwachte statijd ${Math.round(c.expectedDaysToSell)} dagen`,
    `${probabilitySoldWithin30Days}% kans op verkoop binnen 30 dagen`,
    `Brutowinst per voorraaddag €${Math.round(grossProfitPerStockDay)}`,
  ];
  if (c.askingPriceEur > maxBidEur) reasons.push(`Vraagprijs ligt €${Math.round(c.askingPriceEur - maxBidEur).toLocaleString("nl-NL")} boven maximaal VV-bod`);
  if (c.comparableSupply > 25) reasons.push("Relatief veel vergelijkbaar aanbod");
  if (fit >= 80) reasons.push("Sterke match met Volt & Vroom voorraadstrategie");

  return { buyScore, decision, totalCostsEur: c.askingPriceEur + nonPurchaseCosts, expectedMarginEur, marginPercent, grossProfitPerStockDay, maxBidEur, targetBidEur, probabilitySoldWithin30Days, reasons };
}
