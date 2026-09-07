"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Vehicle } from "@/types";
import { VehicleCard } from "@/components/VehicleCard";
import { publicVehicleCategory, publicVehicleEnteredAt, type PublicVehicleCategory } from "@/lib/vehicle/business";
import styles from "@/app/voorraad/inventory.module.css";

type SortKey = "newest" | "price-asc" | "price-desc" | "mileage-asc";

interface Filters {
  q: string;
  category: "" | PublicVehicleCategory;
  body: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxMileage: string;
  minRange: string;
  sort: SortKey;
}

const defaults: Filters = {
  q: "",
  category: "",
  body: "",
  minPrice: "",
  maxPrice: "",
  minYear: "",
  maxMileage: "",
  minRange: "",
  sort: "newest",
};

const numberValue = (value: string) => value === "" ? undefined : Number(value);

function filtersFromLocation(): Filters {
  if (typeof window === "undefined") return defaults;
  const query = new URLSearchParams(window.location.search);
  const category = query.get("categorie");
  const sort = query.get("sorteren");
  return {
    q: query.get("zoeken") ?? "",
    category: category === "Elektrisch" || category === "Hybride" || category === "Icon" || category === "Overig" ? category : "",
    body: query.get("carrosserie") ?? "",
    minPrice: query.get("prijs-vanaf") ?? "",
    maxPrice: query.get("prijs-tot") ?? "",
    minYear: query.get("bouwjaar-vanaf") ?? "",
    maxMileage: query.get("km-tot") ?? "",
    minRange: query.get("bereik-vanaf") ?? "",
    sort: sort === "price-asc" || sort === "price-desc" || sort === "mileage-asc" ? sort : "newest",
  };
}

export function InventoryBrowser({ vehicles }: { vehicles: Vehicle[] }) {
  const [filters, setFilters] = useState<Filters>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFilters(filtersFromLocation());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const query = new URLSearchParams();
    const entries: Array<[string, string]> = [
      ["zoeken", filters.q], ["categorie", filters.category], ["carrosserie", filters.body],
      ["prijs-vanaf", filters.minPrice], ["prijs-tot", filters.maxPrice], ["bouwjaar-vanaf", filters.minYear],
      ["km-tot", filters.maxMileage], ["bereik-vanaf", filters.minRange],
    ];
    for (const [key, value] of entries) if (value) query.set(key, value);
    if (filters.sort !== "newest") query.set("sorteren", filters.sort);
    const suffix = query.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${suffix ? `?${suffix}` : ""}${window.location.hash}`);
  }, [filters, ready]);

  const bodyStyles = useMemo(() => Array.from(new Set(vehicles.map(vehicle => vehicle.bodyStyle).filter(Boolean))).sort(), [vehicles]);
  const minPrice = numberValue(filters.minPrice);
  const maxPrice = numberValue(filters.maxPrice);
  const minYear = numberValue(filters.minYear);
  const maxMileage = numberValue(filters.maxMileage);
  const minRange = numberValue(filters.minRange);

  const results = useMemo(() => vehicles.filter(vehicle => {
    const search = `${vehicle.brand} ${vehicle.model} ${vehicle.trim}`.toLowerCase();
    if (filters.q && !search.includes(filters.q.trim().toLowerCase())) return false;
    if (filters.category && publicVehicleCategory(vehicle) !== filters.category) return false;
    if (filters.body && vehicle.bodyStyle !== filters.body) return false;
    if (minPrice !== undefined && vehicle.priceCents < minPrice * 100) return false;
    if (maxPrice !== undefined && vehicle.priceCents > maxPrice * 100) return false;
    if (minYear !== undefined && vehicle.year < minYear) return false;
    if (maxMileage !== undefined && vehicle.mileageKm > maxMileage) return false;
    if (minRange !== undefined && (vehicle.electricRangeKm === undefined || vehicle.electricRangeKm < minRange)) return false;
    return true;
  }).sort((left, right) => {
    if (filters.sort === "price-asc") return left.priceCents - right.priceCents;
    if (filters.sort === "price-desc") return right.priceCents - left.priceCents;
    if (filters.sort === "mileage-asc") return left.mileageKm - right.mileageKm;
    return publicVehicleEnteredAt(right) - publicVehicleEnteredAt(left);
  }), [vehicles, filters, minPrice, maxPrice, minYear, maxMileage, minRange]);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters(current => ({ ...current, [key]: value }));
  const activeCount = Object.entries(filters).filter(([key, value]) => key !== "sort" && value !== "").length;

  return <section aria-labelledby="inventory-results-heading">
    <details className={styles.filters} open>
      <summary>Filter voorraad{activeCount ? ` (${activeCount})` : ""}</summary>
      <div className={styles.filterGrid}>
        <label className={styles.search}>Zoek merk of model<input value={filters.q} onChange={event => set("q", event.target.value)} placeholder="Bijvoorbeeld Polestar" type="search" /></label>
        <label>Categorie<select value={filters.category} onChange={event => set("category", event.target.value as Filters["category"])}><option value="">Alle categorieën</option><option>Elektrisch</option><option>Hybride</option><option>Icon</option></select></label>
        <label>Carrosserie<select value={filters.body} onChange={event => set("body", event.target.value)}><option value="">Alle carrosserieën</option>{bodyStyles.map(body => <option key={body}>{body}</option>)}</select></label>
        <label>Prijs vanaf<input value={filters.minPrice} onChange={event => set("minPrice", event.target.value)} inputMode="numeric" min="0" step="1000" type="number" placeholder="€ 0" /></label>
        <label>Prijs tot<input value={filters.maxPrice} onChange={event => set("maxPrice", event.target.value)} inputMode="numeric" min="0" step="1000" type="number" placeholder="Geen maximum" /></label>
        <label>Bouwjaar vanaf<input value={filters.minYear} onChange={event => set("minYear", event.target.value)} inputMode="numeric" min="1950" max="2100" type="number" placeholder="Alle jaren" /></label>
        <label>Kilometerstand tot<input value={filters.maxMileage} onChange={event => set("maxMileage", event.target.value)} inputMode="numeric" min="0" step="5000" type="number" placeholder="Geen maximum" /></label>
        <label>Elektrisch bereik vanaf<input value={filters.minRange} onChange={event => set("minRange", event.target.value)} inputMode="numeric" min="0" step="25" type="number" placeholder="Alle bereiken" /></label>
      </div>
      {activeCount ? <button className={styles.clear} type="button" onClick={() => setFilters(current => ({ ...defaults, sort: current.sort }))}>Wis filters</button> : null}
    </details>

    <div className={styles.resultBar}>
      <p id="inventory-results-heading" role="status" aria-live="polite"><strong>{results.length}</strong> {results.length === 1 ? "auto" : "auto’s"} gevonden</p>
      <label>Sorteren<select value={filters.sort} onChange={event => set("sort", event.target.value as SortKey)}><option value="newest">Nieuwste binnenkomst</option><option value="price-asc">Prijs laag–hoog</option><option value="price-desc">Prijs hoog–laag</option><option value="mileage-asc">Kilometerstand laag–hoog</option></select></label>
    </div>

    {results.length ? <div className={styles.grid}>{results.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div> : <div className={styles.empty}>
      <p className={styles.eyebrow}>Geen passende auto gevonden</p>
      <h2>Vertel ons wat u zoekt.</h2>
      <p>Wis de filters of start de keuzehulp. Dan kijken we gericht met u mee, zonder een resultaat te beloven dat niet in de voorraad staat.</p>
      <div><button type="button" onClick={() => setFilters(defaults)}>Wis filters</button><Link href="/keuzehulp">Start de keuzehulp</Link></div>
    </div>}
  </section>;
}
