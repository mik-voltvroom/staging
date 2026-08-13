import { describe, expect, it } from "vitest";
import { agedReceivables, invoiceOpenAmount, invoiceTotals, vehicleProfit, vatBreakdown } from "@/lib/finance/business";
import type { Invoice, InvoiceLine } from "@/types";

const lines: InvoiceLine[] = [
  { id: "1", description: "Onderhoud", quantity: 2, unitPriceEur: 100, vatPercent: 21 },
  { id: "2", description: "APK", quantity: 1, unitPriceEur: 50, vatPercent: 0 },
];

describe("finance rules", () => {
  it("calculates invoice and VAT totals", () => {
    expect(invoiceTotals(lines)).toEqual({ subtotalEur: 250, vatEur: 42, totalEur: 292 });
    expect(vatBreakdown(lines)).toHaveLength(2);
  });

  it("never returns a negative open amount", () => {
    const invoice = { totalEur: 100, paidEur: 125 } as Invoice;
    expect(invoiceOpenAmount(invoice)).toBe(0);
  });

  it("calculates true vehicle contribution", () => {
    const result = vehicleProfit({
      vehicleId: "VV-1", vehicleLabel: "Toyota Corolla", salePriceEur: 25000, purchasePriceEur: 20000,
      directCostsEur: 1000, financeCostsEur: 200, warrantyProvisionEur: 300, tradeInMarginEur: 500,
      upsellMarginEur: 400, stockDays: 30,
    });
    expect(result.grossContributionEur).toBe(4400);
    expect(result.contributionPercent).toBe(17.6);
  });

  it("ages receivables into the right bucket", () => {
    const now = new Date("2026-07-14T12:00:00Z");
    const invoice = { kind: "sales", status: "sent", totalEur: 1000, paidEur: 0, dueDate: "2026-06-01" } as Invoice;
    expect(agedReceivables([invoice], now).days31to60).toBe(1000);
  });
});
