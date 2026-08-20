"use client";
import type { VehicleCosts } from "@/types";
import { eur } from "@/lib/format";
import { grossMargin, marginPercent, totalCosts } from "@/lib/business";
import { centsToEuros, eurosToCents } from "@/lib/money";

export function MarginPanel({ priceCents, costs, onChange }: { priceCents: number; costs: VehicleCosts; onChange: (costs: VehicleCosts) => void }) {
  const labels: Record<keyof VehicleCosts, string> = {
    purchasePriceCents: "Inkoopprijs", transportCents: "Transport", preparationCents: "Poetsen/foto", maintenanceCents: "Onderhoud", warrantyReserveCents: "Garantiereserve", advertisingCents: "Advertentie", financingCents: "Voorraadfinanciering", otherCents: "Overig"
  };
  return <section className="panel">
    <div className="panelHeader"><div><p className="eyebrow">Dealcalculatie</p><h2>Marge vóór overhead</h2></div><strong className={grossMargin(priceCents, costs) >= 250000 ? "marginGood" : "marginWarn"}>{eur.format(centsToEuros(grossMargin(priceCents, costs)))}</strong></div>
    <div className="formGrid compact">
      {(Object.keys(labels) as (keyof VehicleCosts)[]).map(key => <label key={key}>{labels[key]}<input type="number" min="0" step="0.01" value={centsToEuros(costs[key])} onChange={e => onChange({ ...costs, [key]: eurosToCents(Number(e.target.value), key) })} /></label>)}
    </div>
    <div className="marginSummary"><span>Totale directe kostprijs <strong>{eur.format(centsToEuros(totalCosts(costs)))}</strong></span><span>Margepercentage <strong>{marginPercent(priceCents, costs).toFixed(1)}%</strong></span><span>Norm <strong>min. €2.500</strong></span></div>
  </section>;
}
