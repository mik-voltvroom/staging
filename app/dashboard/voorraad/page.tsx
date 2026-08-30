"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Vehicle, VehicleStatus } from "@/types";
import { listVehicles } from "@/lib/repositories/vehicle-repository";
import { eur } from "@/lib/format";
import { grossMargin } from "@/lib/business";
import { centsToEuros } from "@/lib/money";
import { vehicleCommercialSummary } from "@/lib/vehicle/business";

export default function InventoryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<VehicleStatus | "all">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const items = await listVehicles();
        if (active) {
          setVehicles(items);
          setError(null);
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Voorraad laden mislukt.");
      }
    };
    void load();
    const refresh = () => { void load(); };
    window.addEventListener("vvos:vehicles", refresh);
    return () => { active = false; window.removeEventListener("vvos:vehicles", refresh); };
  }, []);

  const filtered = useMemo(
    () => vehicles.filter(v => (status === "all" || v.status === status)
      && `${v.brand} ${v.model} ${v.trim} ${v.licensePlate ?? ""}`.toLowerCase().includes(query.toLowerCase())),
    [vehicles, query, status],
  );

  return <main className="container dashboardPage">
    <div className="pageTitle"><div><p className="eyebrow">Voorraadbeheer</p><h1>Alle voertuigen</h1><p className="muted">Eén voorraadbron voor website en VVOS. Mobilox/Hexon-mutaties verschijnen hier automatisch.</p></div><Link className="button" href="/dashboard/voorraad/nieuw">+ Nieuwe auto</Link></div>
    {error ? <div className="notice noticeError">{error}</div> : null}
    <div className="toolbar"><input placeholder="Zoek merk, model of kenteken" value={query} onChange={e=>setQuery(e.target.value)} /><select value={status} onChange={e=>setStatus(e.target.value as VehicleStatus|"all")}><option value="all">Alle statussen</option><option value="draft">Concept</option><option value="photography">Fotografie</option><option value="review">Controle</option><option value="available">Beschikbaar</option><option value="reserved">Gereserveerd</option><option value="sold">Verkocht</option></select></div>
    <div className="tableWrap"><table><thead><tr><th>Voertuig</th><th>Status</th><th>Verkoop</th><th>Marge</th><th>Statijd</th><th>Interesse</th><th>Compleet</th></tr></thead><tbody>{filtered.map(v => {
      const commercial = vehicleCommercialSummary(v);
      const margin = v.costs?.purchasePriceCents ? grossMargin(v.commercial?.soldPriceCents ?? v.priceCents, v.costs) : undefined;
      return <tr key={v.id}><td><Link className="tableVehicle" href={`/dashboard/voorraad/${v.id}`}><img src={v.images[0] || "https://placehold.co/140x90?text=Geen+foto"} alt=""/><span><strong>{v.brand} {v.model}</strong><small>{v.trim} · {v.year} · {v.mileageKm.toLocaleString("nl-NL")} km</small></span></Link></td><td><span className={`statusPill status-${v.status}`}>{v.status}</span></td><td>{eur.format(centsToEuros(v.priceCents))}</td><td className={margin !== undefined && commercial.marginOnTarget ? "marginGood" : "marginWarn"}>{margin !== undefined ? eur.format(centsToEuros(margin)) : "–"}</td><td className={commercial.stockDays > (v.commercial?.maxStockDays ?? 45) ? "marginWarn" : ""}>{commercial.stockDays} d</td><td>{commercial.totalViewCount} views · {commercial.totalLeadCount} leads</td><td>{v.publication?.completenessPercent ?? 0}%</td></tr>;
    })}</tbody></table></div>
  </main>;
}
