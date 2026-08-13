"use client";
import type { VehicleCosts } from "@/types";
import { eur } from "@/lib/format";
import { grossMargin, marginPercent, totalCosts } from "@/lib/business";

export function MarginPanel({ price, costs, onChange }: { price: number; costs: VehicleCosts; onChange: (costs: VehicleCosts) => void }) {
  const labels: Record<keyof VehicleCosts, string> = {
    purchasePriceEur: "Inkoopprijs", transportEur: "Transport", preparationEur: "Poetsen/foto", maintenanceEur: "Onderhoud", warrantyReserveEur: "Garantiereserve", advertisingEur: "Advertentie", financingEur: "Voorraadfinanciering", otherEur: "Overig"
  };
  return <section className="panel">
    <div className="panelHeader"><div><p className="eyebrow">Dealcalculatie</p><h2>Marge vóór overhead</h2></div><strong className={grossMargin(price, costs) >= 2500 ? "marginGood" : "marginWarn"}>{eur.format(grossMargin(price, costs))}</strong></div>
    <div className="formGrid compact">
      {(Object.keys(labels) as (keyof VehicleCosts)[]).map(key => <label key={key}>{labels[key]}<input type="number" min="0" value={costs[key]} onChange={e => onChange({ ...costs, [key]: Number(e.target.value) })} /></label>)}
    </div>
    <div className="marginSummary"><span>Totale directe kostprijs <strong>{eur.format(totalCosts(costs))}</strong></span><span>Margepercentage <strong>{marginPercent(price, costs).toFixed(1)}%</strong></span><span>Norm <strong>min. €2.500</strong></span></div>
  </section>;
}
