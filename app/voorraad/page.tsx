import Link from "next/link";
import { Header } from "@/components/Header";
import { listPublicVehicles } from "@/lib/public-vehicles";
import styles from "./showroom.module.css";

const money = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("nl-NL");

export const dynamic = "force-dynamic";

function display(value: string | number | undefined, fallback = "—") {
  return value === undefined || value === "" ? fallback : String(value);
}

export default async function InventoryPage() {
  const vehicles = await listPublicVehicles();

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

      <div className={styles.toolbar}>
        <span className={styles.count}><strong>{vehicles.length}</strong> {vehicles.length === 1 ? "auto beschikbaar" : "auto’s beschikbaar"}</span>
        <span className={styles.live}><i /> Live gekoppeld met voorraadbeheer</span>
      </div>

      {vehicles.length === 0 ? <section className={styles.empty}>
        <h2>Nieuwe selectie onderweg.</h2>
        <p>Er staan momenteel geen voertuigen gepubliceerd. Zodra een auto via de voorraadkoppeling beschikbaar komt, verschijnt hij hier automatisch.</p>
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
                <span className={styles.source}>{vehicle.source}</span>
                <span className={styles.view}>Bekijk auto →</span>
              </div>
            </div>
          </Link>;
        })}
      </section>}
    </main>
  </div>;
}
