"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { eur } from "@/lib/format";
import { centsToEuros } from "@/lib/money";
import { listVehicles } from "@/lib/repositories/vehicle-repository";
import { buildInventoryPerformance, type InventoryAction } from "@/lib/vehicle/performance";
import type { Vehicle } from "@/types";
import "./performance.css";

type ActionFilter = InventoryAction | "all";
const actionLabels: Record<InventoryAction, string> = {
  "missing-costs": "Inkoop aanvullen",
  overdue: "Statijd overschreden",
  "below-target": "Marge onder doel",
  "low-interest": "Geen leads na 21 dagen",
};
const money = (cents: number) => eur.format(centsToEuros(cents));

export default function InventoryPerformancePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filter, setFilter] = useState<ActionFilter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await listVehicles();
        if (active) { setVehicles(result); setError(null); setLoading(false); }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Voorraadprestaties laden mislukt.");
          setLoading(false);
        }
      }
    };
    void load();
    const refresh = () => { void load(); };
    window.addEventListener("vvos:vehicles", refresh);
    return () => { active = false; window.removeEventListener("vvos:vehicles", refresh); };
  }, []);

  const performance = useMemo(() => buildInventoryPerformance(vehicles), [vehicles]);
  const rows = useMemo(() => performance.rows
    .filter(row => filter === "all" || row.actions.includes(filter))
    .filter(row => `${row.vehicle.brand} ${row.vehicle.model} ${row.vehicle.licensePlate ?? ""}`.toLowerCase().includes(query.toLowerCase()))
    .sort((left, right) => {
      const priority = (actions: InventoryAction[]) => Number(actions.includes("missing-costs")) * 4
        + Number(actions.includes("overdue")) * 3 + Number(actions.includes("below-target")) * 2
        + Number(actions.includes("low-interest"));
      return priority(right.actions) - priority(left.actions) || right.stockDays - left.stockDays;
    }), [filter, performance.rows, query]);
  const maxBucket = Math.max(1, ...performance.ageBuckets.map(bucket => bucket.count));

  return <main className="container dashboardPage performancePage">
    <div className="pageTitle"><div><p className="eyebrow">Voorraadsturing</p><h1>Marge &amp; statijd</h1><p className="muted">Live stuurinformatie uit het centrale voertuigdossier.</p></div><Link className="button secondary" href="/dashboard/voorraad">Open voorraad</Link></div>
    {error ? <div className="notice noticeError">{error}</div> : null}
    {loading ? <div className="notice">Voorraadprestaties laden…</div> : null}

    <section className="metrics performanceMetrics" aria-label="Voorraad kerncijfers">
      <article className="metric"><span>Actieve voorraad</span><strong>{performance.activeCount}</strong><small>{money(performance.retailValueCents)} verkoopwaarde</small></article>
      <article className="metric"><span>Verwachte marge</span><strong>{performance.costCompleteCount ? money(performance.expectedMarginCents) : "Onbekend"}</strong><small>{performance.costCompleteCount ? `Over ${performance.costCompleteCount} kost-complete auto’s` : "Geen kost-complete dossiers"}</small></article>
      <article className="metric"><span>Gemiddelde statijd</span><strong>{performance.averageStockDays} dagen</strong><small>{performance.overdueCount} boven eigen maximum</small></article>
      <article className="metric"><span>Kostendekking</span><strong>{performance.costCoveragePercent}%</strong><small>{performance.missingCostsCount} {performance.missingCostsCount === 1 ? "ontbrekende inkoopprijs" : "ontbrekende inkoopprijzen"}</small></article>
    </section>

    {performance.missingCostsCount > 0 ? <div className="performanceGuardrail"><strong>Marge is nog niet volledig.</strong><span>De totale marge gebruikt alleen voertuigen met een bekende inkoopprijs. Vul {performance.missingCostsCount} dossier{performance.missingCostsCount === 1 ? "" : "s"} aan voor een compleet beeld.</span></div> : null}

    <section className="performanceGrid">
      <article className="panel">
        <div className="sectionHeading"><div><p className="eyebrow">Verdeling</p><h2>Statijd actieve voorraad</h2></div><span className="dataFreshness">{performance.lastUpdatedAt ? `Bron bijgewerkt ${new Date(performance.lastUpdatedAt).toLocaleString("nl-NL")}` : "Nog geen brondata"}</span></div>
        <div className="ageBars">{performance.ageBuckets.map(bucket => <div key={bucket.label}><span>{bucket.label}</span><div><i style={{ width: `${(bucket.count / maxBucket) * 100}%` }} /></div><strong>{bucket.count}</strong></div>)}</div>
      </article>
      <article className="panel">
        <p className="eyebrow">Aandacht nodig</p><h2>Vandaag aanpakken</h2>
        <div className="actionCounts">
          <button type="button" onClick={() => setFilter("missing-costs")}><strong>{performance.missingCostsCount}</strong><span>Inkoop aanvullen</span></button>
          <button type="button" onClick={() => setFilter("overdue")}><strong>{performance.overdueCount}</strong><span>Statijd overschreden</span></button>
          <button type="button" onClick={() => setFilter("below-target")}><strong>{performance.belowTargetCount}</strong><span>Marge onder doel</span></button>
        </div>
      </article>
    </section>

    <section className="performanceActions">
      <div className="sectionHeading"><div><p className="eyebrow">Actielijst</p><h2>Voertuigen met prioriteit</h2></div><span className="muted">{rows.length} {rows.length === 1 ? "resultaat" : "resultaten"}</span></div>
      <div className="toolbar"><input aria-label="Zoek voertuig" placeholder="Zoek merk, model of kenteken" value={query} onChange={event => setQuery(event.target.value)} /><select aria-label="Filter op actie" value={filter} onChange={event => setFilter(event.target.value as ActionFilter)}><option value="all">Alle actieve voorraad</option>{Object.entries(actionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div className="tableWrap"><table><thead><tr><th>Voertuig</th><th>Statijd</th><th>Marge</th><th>Interesse</th><th>Actie</th></tr></thead><tbody>
        {rows.map(row => <tr key={row.vehicle.id}>
          <td><Link href={`/dashboard/voorraad/${row.vehicle.id}`}><strong>{row.vehicle.brand} {row.vehicle.model}</strong><small>{row.vehicle.licensePlate ?? row.vehicle.trim}</small></Link></td>
          <td className={row.actions.includes("overdue") ? "marginWarn" : ""}>{row.stockDays} / {row.maxStockDays} dagen</td>
          <td>{row.costsKnown ? <><strong className={(row.marginCents ?? 0) >= row.targetMarginCents ? "marginGood" : "marginWarn"}>{money(row.marginCents ?? 0)}</strong><small>doel {money(row.targetMarginCents)}</small></> : <><strong>Onbekend</strong><small>inkoopprijs ontbreekt</small></>}</td>
          <td>{row.views} views · {row.leads} leads</td>
          <td><div className="actionTags">{row.actions.length ? row.actions.map(action => <span key={action} className={action === "missing-costs" || action === "overdue" ? "urgent" : ""}>{actionLabels[action]}</span>) : <span>Geen directe actie</span>}</div></td>
        </tr>)}
        {!loading && rows.length === 0 ? <tr><td colSpan={5}>Geen voertuigen binnen dit filter.</td></tr> : null}
      </tbody></table></div>
    </section>
  </main>;
}
