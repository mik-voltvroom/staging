"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Vehicle, VehicleStatus } from "@/types";
import { listVehicles } from "@/lib/repositories/vehicle-repository";
import { eur } from "@/lib/format";
import { grossMargin } from "@/lib/business";
import "./inventory.css";

type InventoryRecord = Partial<Vehicle> & {
  id: string;
  source?: string;
  sourceVehicleId?: string;
  syncStatus?: string;
  type?: string;
  mileage?: number;
  retailPrice?: number;
  imageUrls?: string[];
  receivedAt?: string;
  deletedAt?: string;
  hybrid?: { hybridType?: string; batteryConditionPct?: number; electricRangeKm?: number; };
};

const statusLabels: Record<string, string> = { draft:"Concept", photography:"Fotografie", review:"Controle", available:"Beschikbaar", reserved:"Gereserveerd", sold:"Verkocht", archived:"Archief", active:"Actief", changed:"Bijgewerkt", deleted:"Verwijderd" };

function vehicleView(vehicle: InventoryRecord) {
  const images = vehicle.images?.length ? vehicle.images : vehicle.imageUrls ?? [];
  const price = vehicle.priceEur ?? vehicle.retailPrice ?? 0;
  const mileage = vehicle.mileageKm ?? vehicle.mileage ?? 0;
  const trim = vehicle.trim ?? vehicle.type ?? "";
  const status = vehicle.status ?? vehicle.syncStatus ?? "draft";
  const updatedAt = vehicle.updatedAt ?? vehicle.receivedAt ?? vehicle.deletedAt ?? new Date().toISOString();
  const source = vehicle.source === "mobilox" ? "Hexon / Mobilox" : "VVOS";
  const batteryHealth = vehicle.batteryHealthPercent ?? vehicle.hybrid?.batteryConditionPct;
  const electricRange = vehicle.electricRangeKm ?? vehicle.hybrid?.electricRangeKm;
  return { images, price, mileage, trim, status, updatedAt, source, batteryHealth, electricRange };
}

export default function InventoryPage() {
  const [vehicles, setVehicles] = useState<InventoryRecord[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<VehicleStatus | "all" | "active" | "changed">("all");
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active=true; const load=async()=>{ try { const records=await listVehicles(); if(active)setVehicles(records as unknown as InventoryRecord[]); } finally { if(active)setLoading(false); } }; void load(); window.addEventListener("vvos:vehicles",load); return()=>{active=false;window.removeEventListener("vvos:vehicles",load);}; },[]);
  const filtered=useMemo(()=>vehicles.filter(vehicle=>{const view=vehicleView(vehicle);if(view.status==="deleted")return false;const statusMatch=status==="all"||view.status===status;const haystack=`${vehicle.brand??""} ${vehicle.model??""} ${view.trim} ${vehicle.licensePlate??""}`.toLowerCase();return statusMatch&&haystack.includes(query.toLowerCase());}),[vehicles,query,status]);
  const stats=useMemo(()=>{const active=vehicles.filter(v=>vehicleView(v).status!=="deleted");return{total:active.length,available:active.filter(v=>["available","active","changed"].includes(vehicleView(v).status)).length,reserved:active.filter(v=>vehicleView(v).status==="reserved").length,retailValue:active.reduce((sum,v)=>sum+vehicleView(v).price,0),mobilox:active.filter(v=>v.source==="mobilox").length};},[vehicles]);

  return <main className="container dashboardPage inventoryPage">
    <div className="pageTitle inventoryHero"><div><p className="eyebrow">VVOS · Voorraad</p><h1>Voertuigen</h1><p className="muted">Eén rustige werkplek voor voorraad, hybride-data, publicatie en verkoop.</p></div><div className="inventoryActions"><span className="syncBadge"><i /> Hexon / Mobilox gekoppeld</span><Link className="button" href="/dashboard/voorraad/nieuw">Nieuwe auto</Link></div></div>
    <section className="inventoryKpis" aria-label="Voorraadoverzicht"><article><span>Voorraad</span><strong>{stats.total}</strong><small>voertuigen</small></article><article><span>Beschikbaar</span><strong>{stats.available}</strong><small>direct verkoopbaar</small></article><article><span>Gereserveerd</span><strong>{stats.reserved}</strong><small>in verkoopproces</small></article><article><span>Verkoopwaarde</span><strong>{eur.format(stats.retailValue)}</strong><small>actuele vraagprijzen</small></article><article><span>Mobilox</span><strong>{stats.mobilox}</strong><small>gesynchroniseerd</small></article></section>
    <div className="inventoryToolbar"><div className="inventorySearch"><span aria-hidden="true">⌕</span><input aria-label="Zoeken" placeholder="Zoek op merk, model of kenteken" value={query} onChange={event=>setQuery(event.target.value)}/></div><select aria-label="Filter op status" value={status} onChange={event=>setStatus(event.target.value as typeof status)}><option value="all">Alle statussen</option><option value="active">Actief vanuit Mobilox</option><option value="available">Beschikbaar</option><option value="reserved">Gereserveerd</option><option value="review">Controle</option><option value="photography">Fotografie</option><option value="draft">Concept</option><option value="sold">Verkocht</option></select><span className="inventoryCount">{filtered.length} resultaten</span></div>
    {loading?<div className="inventoryEmpty">Voorraad wordt geladen…</div>:filtered.length===0?<div className="inventoryEmpty"><strong>Geen voertuigen gevonden</strong><span>Pas je zoekopdracht of filter aan.</span></div>:<section className="inventoryGrid">{filtered.map(vehicle=>{const view=vehicleView(vehicle);const margin=vehicle.costs&&view.price?grossMargin(view.price,vehicle.costs):undefined;return <Link href={`/dashboard/voorraad/${vehicle.id}`} className="inventoryCard" key={vehicle.id}><div className="inventoryMedia">{view.images[0]?<img src={view.images[0]} alt={`${vehicle.brand??"Voertuig"} ${vehicle.model??""}`}/>:<div className="inventoryPlaceholder"><span>VV</span><small>Foto volgt</small></div>}<div className="inventoryCardTop"><span className={`statusPill status-${view.status}`}>{statusLabels[view.status]??view.status}</span><span className="sourcePill">{view.source}</span></div></div><div className="inventoryBody"><div className="inventoryHeading"><div><h2>{vehicle.brand??"Onbekend"} {vehicle.model??"voertuig"}</h2><p>{view.trim||"Uitvoering nog niet ingevuld"}</p></div><strong>{view.price?eur.format(view.price):"Prijs volgt"}</strong></div><div className="inventorySpecs"><span>{vehicle.year??"—"}<small>Bouwjaar</small></span><span>{view.mileage?`${view.mileage.toLocaleString("nl-NL")} km`:"—"}<small>Kilometerstand</small></span><span>{vehicle.licensePlate??"—"}<small>Kenteken</small></span></div>{(view.batteryHealth||view.electricRange)&&<div className="hybridStrip"><span><b>Hybrid intelligence</b>{vehicle.hybrid?.hybridType??vehicle.driveType??"Geëlektrificeerd"}</span>{view.batteryHealth&&<span><b>{view.batteryHealth}%</b> accuconditie</span>}{view.electricRange&&<span><b>{view.electricRange} km</b> elektrisch</span>}</div>}<footer className="inventoryCardFooter"><span>{margin!==undefined?<>Marge <b className={margin>=2500?"marginGood":"marginWarn"}>{eur.format(margin)}</b></>:<>Bron <b>{view.source}</b></>}</span><span>Bijgewerkt {new Date(view.updatedAt).toLocaleDateString("nl-NL",{day:"2-digit",month:"short"})}</span></footer></div></Link>;})}</section>}
  </main>;
}
