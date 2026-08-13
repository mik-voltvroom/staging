"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Vehicle, VehicleStatus } from "@/types";
import { getVehicles } from "@/lib/demo-store";
import { eur } from "@/lib/format";
import { grossMargin } from "@/lib/business";

export default function InventoryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]); const [query, setQuery] = useState(""); const [status, setStatus] = useState<VehicleStatus | "all">("all");
  useEffect(() => { const load=()=>setVehicles(getVehicles()); load(); window.addEventListener("vvos:vehicles", load); return()=>window.removeEventListener("vvos:vehicles",load); }, []);
  const filtered = useMemo(() => vehicles.filter(v => (status === "all" || v.status === status) && `${v.brand} ${v.model} ${v.trim} ${v.licensePlate ?? ""}`.toLowerCase().includes(query.toLowerCase())), [vehicles, query, status]);
  return <main className="container dashboardPage">
    <div className="pageTitle"><div><p className="eyebrow">Voorraadbeheer</p><h1>Alle voertuigen</h1><p className="muted">Van inkoop tot publicatie en verkoop.</p></div><Link className="button" href="/dashboard/voorraad/nieuw">+ Nieuwe auto</Link></div>
    <div className="toolbar"><input placeholder="Zoek merk, model of kenteken" value={query} onChange={e=>setQuery(e.target.value)} /><select value={status} onChange={e=>setStatus(e.target.value as VehicleStatus|"all")}><option value="all">Alle statussen</option><option value="draft">Concept</option><option value="photography">Fotografie</option><option value="review">Controle</option><option value="available">Beschikbaar</option><option value="reserved">Gereserveerd</option><option value="sold">Verkocht</option></select></div>
    <div className="tableWrap"><table><thead><tr><th>Voertuig</th><th>Status</th><th>Verkoop</th><th>Marge</th><th>Compleet</th><th>Bijgewerkt</th></tr></thead><tbody>{filtered.map(v => <tr key={v.id}><td><Link className="tableVehicle" href={`/dashboard/voorraad/${v.id}`}><img src={v.images[0] || "https://placehold.co/140x90?text=Geen+foto"} alt=""/><span><strong>{v.brand} {v.model}</strong><small>{v.trim} · {v.year} · {v.mileageKm.toLocaleString("nl-NL")} km</small></span></Link></td><td><span className={`statusPill status-${v.status}`}>{v.status}</span></td><td>{eur.format(v.priceEur)}</td><td className={(v.costs && grossMargin(v.priceEur,v.costs)>=2500)?"marginGood":"marginWarn"}>{v.costs ? eur.format(grossMargin(v.priceEur,v.costs)) : "–"}</td><td>{v.publication?.completenessPercent ?? 0}%</td><td>{new Date(v.updatedAt).toLocaleDateString("nl-NL")}</td></tr>)}</tbody></table></div>
  </main>;
}
