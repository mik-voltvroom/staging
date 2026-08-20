import Link from "next/link";
import { Header } from "@/components/Header";
import { listPublicVehicles } from "@/lib/public-vehicles";
import styles from "./showroom.module.css";

const money = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("nl-NL");

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function display(value: string | number | undefined, fallback = "—") {
  return value === undefined || value === "" ? fallback : String(value);
}

export default async function InventoryPage({ searchParams }: { searchParams: SearchParams }) {
  const allVehicles = await listPublicVehicles();
  const params = await searchParams;
  const query = first(params.q).trim().toLowerCase();
  const brand = first(params.brand);
  const fuel = first(params.fuel);
  const sort = first(params.sort) || "newest";

  const brands = [...new Set(allVehicles.map(vehicle => vehicle.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, "nl"));
  const fuels = [...new Set(allVehicles.map(vehicle => vehicle.fuelType).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, "nl"));

  const vehicles = allVehicles
    .filter(vehicle => !brand || vehicle.brand === brand)
    .filter(vehicle => !fuel || vehicle.fuelType === fuel)
    .filter(vehicle => {
      if (!query) return true;
      const haystack = [vehicle.brand, vehicle.model, vehicle.trim, vehicle.title, vehicle.fuelType, vehicle.bodyStyle]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => {
      if (sort === "price-asc") return (a.priceEur ?? Number.MAX_SAFE_INTEGER) - (b.priceEur ?? Number.MAX_SAFE_INTEGER);
      if (sort === "price-desc") return (b.priceEur ?? -1) - (a.priceEur ?? -1);
      if (sort === "mileage") return (a.mileageKm ?? Number.MAX_SAFE_INTEGER) - (b.mileageKm ?? Number.MAX_SAFE_INTEGER);
      if (sort === "year") return (b.year ?? 0) - (a.year ?? 0);
      return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
    });

  const filtering = Boolean(query || brand || fuel || sort !== "newest");

  return <div className={styles.page}>
    <Header />
    <main className={styles.shell}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Volt & Vroom · Groningen</span>
          <h1>Onze<br />showroom.</h1>
        </div>
        <p className={styles.heroText}>Geen eindeloze occasionlijst, maar een zorgvuldig geselecteerde collectie. Met relevante voertuigdata, heldere techniek en een presentatie die recht doet aan de auto.</p>
      </section>

      <section className={styles.controls} aria-label="Voorraad filteren">
        <form className={styles.filterForm} method="get">
          <label className={styles.searchField}>
            <span>Zoeken</span>
            <input name="q" defaultValue={first(params.q)} placeholder="Merk, model of uitvoering" />
          </label>
          <label className={styles.selectField}>
            <span>Merk</span>
            <select name="brand" defaultValue={brand}>
              <option value="">Alle merken</option>
              {brands.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className={styles.selectField}>
            <span>Aandrijving</span>
            <select name="fuel" defaultValue={fuel}>
              <option value="">Alle aandrijvingen</option>
              {fuels.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className={styles.selectField}>
            <span>Sorteren</span>
            <select name="sort" defaultValue={sort}>
              <option value="newest">Nieuwste eerst</option>
              <option value="price-asc">Prijs laag → hoog</option>
              <option value="price-desc">Prijs hoog → laag</option>
              <option value="mileage">Laagste kilometerstand</option>
              <option value="year">Nieuwste bouwjaar</option>
            </select>
          </label>
          <button className={styles.filterButton} type="submit">Toon selectie</button>
        </form>
      </section>

      <div className={styles.toolbar}>
        <span className={styles.count}><strong>{vehicles.length}</strong> {vehicles.length === 1 ? "auto gevonden" : "auto’s gevonden"}</span>
        <div className={styles.toolbarRight}>
          {filtering ? <Link className={styles.reset} href="/voorraad">Wis filters</Link> : null}
          <span className={styles.live}><i /> Live gekoppeld met voorraadbeheer</span>
        </div>
      </div>

      {vehicles.length === 0 ? <section className={styles.empty}>
        <span className={styles.emptyLabel}>Geen match</span>
        <h2>{allVehicles.length ? "Deze selectie staat er nu niet tussen." : "Nieuwe selectie onderweg."}</h2>
        <p>{allVehicles.length ? "Pas je filters aan of bekijk de volledige showroom." : "Zodra een auto via de voorraadkoppeling beschikbaar komt, verschijnt hij hier automatisch."}</p>
        {allVehicles.length ? <Link href="/voorraad" className={styles.emptyAction}>Bekijk volledige showroom →</Link> : null}
      </section> : <section className={styles.grid}>
        {vehicles.map(vehicle => {
          const hybrid = vehicle.pluginHybrid || Boolean(vehicle.hybridType) || Boolean(vehicle.electricRangeKm);
          return <Link key={vehicle.id} href={`/voorraad/${encodeURIComponent(vehicle.slug)}`} className={styles.card}>
            <div className={styles.visual}>
              {vehicle.imageUrls[0] ? <img src={vehicle.imageUrls[0]} alt={`${vehicle.brand} ${vehicle.model}`} /> : <div className={styles.emptyPhoto}>Foto volgt</div>}
              <span className={styles.status}>{vehicle.reserved ? "Gereserveerd" : "Beschikbaar"}</span>
              {hybrid ? <span className={styles.hybrid}>{vehicle.hybridType || "Hybrid"}</span> : null}
              {vehicle.imageUrls.length > 1 ? <span className={styles.photoCount}>{vehicle.imageUrls.length} foto’s</span> : null}
            </div>
            <div className={styles.body}>
              <div className={styles.topline}>
                <div>
                  <span className={styles.label}>{vehicle.bodyStyle || vehicle.fuelType || "Volt & Vroom selectie"}</span>
                  <h2 className={styles.name}>{vehicle.brand} {vehicle.model}</h2>
                  <p className={styles.trim}>{vehicle.trim || vehicle.title || ""}</p>
                </div>
                <strong className={styles.price}>{vehicle.priceEur ? money.format(vehicle.priceEur) : "Op aanvraag"}</strong>
              </div>
              <div className={styles.facts}>
                <div className={styles.fact}><span>Bouwjaar</span><strong>{display(vehicle.year)}</strong></div>
                <div className={styles.fact}><span>Kilometerstand</span><strong>{vehicle.mileageKm !== undefined ? `${number.format(vehicle.mileageKm)} km` : "—"}</strong></div>
                <div className={styles.fact}><span>Aandrijving</span><strong>{display(vehicle.fuelType)}</strong></div>
                <div className={styles.fact}><span>Transmissie</span><strong>{display(vehicle.transmission)}</strong></div>
              </div>
              <div className={styles.footer}>
                <span className={styles.source}>Volt & Vroom selectie</span>
                <span className={styles.view}>Bekijk auto <span aria-hidden="true">→</span></span>
              </div>
            </div>
          </Link>;
        })}
      </section>}
    </main>
  </div>;
}
