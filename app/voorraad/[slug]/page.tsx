import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { eur } from "@/lib/format";
import { centsToEuros } from "@/lib/money";
import { getPublicVehicleBySlug } from "@/lib/repositories/public-vehicle-repository";
import styles from "./vehicle.module.css";

export const revalidate = 60;
export const dynamicParams = true;

const numberFormat = new Intl.NumberFormat("nl-NL");

export function generateStaticParams() {
  return [];
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = await getPublicVehicleBySlug(decodeURIComponent(slug));
  if (!vehicle) notFound();

  const priceEur = centsToEuros(vehicle.priceCents);
  const isReserved = vehicle.status === "reserved";

  const specs = [
    ["Carrosserie", vehicle.bodyStyle || null],
    ["Kleur", vehicle.color || null],
    ["Aandrijving", vehicle.fuelType || null],
    ["Transmissie", vehicle.transmission || null],
    ["Verbruik", vehicle.consumptionPer100Km ? `${vehicle.consumptionPer100Km} l/100 km` : null],
    ["Garantie", vehicle.warrantyMonths ? `${vehicle.warrantyMonths} maanden` : null],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  const hybridFacts = [
    ["Accuconditie", vehicle.batteryHealthPercent !== undefined ? `${vehicle.batteryHealthPercent}%` : null],
    ["Elektrische actieradius", vehicle.electricRangeKm ? `${numberFormat.format(vehicle.electricRangeKm)} km` : null],
    ["Praktijkverbruik", vehicle.consumptionPer100Km ? `${vehicle.consumptionPer100Km} l/100 km` : null],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return <div className={styles.page}>
    <Header />
    <main className={styles.shell}>
      <div className={styles.breadcrumb}><Link href="/voorraad">← Terug naar voorraad</Link><span>Volt & Vroom Selectie · Groningen</span></div>
      <section className={styles.hero}>
        <div className={styles.visual}>
          {vehicle.images[0] ? <img src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model} ${vehicle.trim}`} /> : null}
          <div className={styles.visualTop}><span className={styles.status}><i /> {isReserved ? "Gereserveerd" : "Beschikbaar"}</span>{hybridFacts.length ? <span className={styles.carcheckBadge}>Hybrid data</span> : null}</div>
          <div className={styles.visualBottom}><div><span>Volt & Vroom selectie</span><strong>Zorgvuldig geselecteerd. Transparant gepresenteerd.</strong></div><div><span>Foto’s</span><strong>{String(vehicle.images.length).padStart(2,"0")}</strong></div></div>
        </div>
        <aside className={styles.side}>
          <p className={styles.eyebrow}>{vehicle.driveType || vehicle.fuelType || "Volt & Vroom selectie"}</p>
          <h1>{vehicle.brand}<br />{vehicle.model}</h1>
          <p className={styles.trim}>{vehicle.trim}</p>
          <div className={styles.price}>{vehicle.priceCents > 0 ? eur.format(priceEur) : "Prijs op aanvraag"}</div>
          <div className={styles.monthly}>{vehicle.monthlyPriceCents ? `Vanaf ${eur.format(centsToEuros(vehicle.monthlyPriceCents))} p/m` : "Persoonlijk voorstel op aanvraag"}</div>
          <div className={styles.quickFacts}>
            {vehicle.year ? <div><span>Bouwjaar</span><strong>{vehicle.year}</strong></div> : null}
            {vehicle.mileageKm !== undefined ? <div><span>Kilometerstand</span><strong>{numberFormat.format(vehicle.mileageKm)} km</strong></div> : null}
            {vehicle.fuelType ? <div><span>Aandrijving</span><strong>{vehicle.fuelType}</strong></div> : null}
            {vehicle.transmission ? <div><span>Transmissie</span><strong>{vehicle.transmission}</strong></div> : null}
          </div>
          <div className={styles.ctaStack}><a className={styles.primary} href="#afspraak">Plan een proefrit</a>{vehicle.licensePlate ? <span className={styles.secondary}>{vehicle.licensePlate}</span> : null}</div>
        </aside>
      </section>

      <section className={styles.story}>
        <div><span className={styles.sectionLabel}>Deze auto</span><h2>{vehicle.brand} {vehicle.model}<br />zonder ruis.</h2><p className={styles.storyLead}>{vehicle.description || "We tonen wat we daadwerkelijk van deze auto weten. Geen ingevulde marketingvelden of aannames: alleen beschikbare voertuigdata en relevante techniek."}</p>{vehicle.highlights.length ? <div className={styles.highlightGrid}>{vehicle.highlights.slice(0, 10).map(item => <span key={item}>✓ {item}</span>)}</div> : null}</div>
        <aside className={styles.factsCard}><h3>Specificaties</h3>{specs.length ? specs.map(([label, fact]) => <div className={styles.factRow} key={label}><span>{label}</span><strong>{fact}</strong></div>) : <p>Nadere specificaties volgen.</p>}</aside>
      </section>

      {hybridFacts.length ? <section className={styles.intelligence} id="carcheck">
        <div className={styles.intelligenceHead}><div><span className={styles.sectionLabel}>Hybrid Intelligence</span><h2>Relevante hybride data.<br />Direct uit de voertuigdata.</h2></div><p>We tonen alleen hybride- en accugegevens die voor deze specifieke auto daadwerkelijk beschikbaar zijn.</p></div>
        <div className={styles.intelligenceGrid}>{hybridFacts.map(([label, fact]) => <article className={styles.intelCard} key={label}><span>{label}</span><strong>{fact}</strong><small>beschikbare voertuigdata</small></article>)}</div>
      </section> : null}

      <section className={styles.trust} id="afspraak"><span className={styles.sectionLabel}>Bekijk hem in Groningen</span><h2>De auto gezien.<br />Nu het verhaal erachter.</h2><p>Plan een persoonlijke proefrit. We nemen de auto en de beschikbare voertuigdata rustig met je door.</p><div className={styles.trustActions}><a className={styles.primary} href={`mailto:mik@voltvroom.nl?subject=${encodeURIComponent(`Proefrit ${vehicle.brand} ${vehicle.model}`)}`}>Plan een proefrit</a><a className={styles.secondary} href="mailto:mik@voltvroom.nl">Stel een vraag</a></div></section>
    </main>
    <div className={styles.stickyBar}><div><strong>{vehicle.brand} {vehicle.model}</strong><br /><span>{vehicle.trim}{vehicle.priceCents > 0 ? ` · ${eur.format(priceEur)}` : ""}</span></div><a href="#afspraak">Plan proefrit</a></div>
  </div>;
}
