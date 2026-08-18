import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { eur, km } from "@/lib/format";
import { vehicles } from "@/lib/sample-data";
import styles from "./vehicle.module.css";

export function generateStaticParams() { return vehicles.map(v => ({ slug: v.slug })); }

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = vehicles.find(v => v.slug === slug);
  if (!vehicle) notFound();

  const score = Math.min(99, Math.round(68 + (vehicle.batteryHealthPercent ?? 80) * .28));
  const driveLabel = vehicle.driveType.replaceAll("-", " ");

  return <div className={styles.page}>
    <Header />
    <main className={styles.shell}>
      <div className={styles.breadcrumb}><Link href="/voorraad">← Terug naar voorraad</Link><span>Volt & Vroom Selectie · Groningen</span></div>

      <section className={styles.hero}>
        <div className={styles.visual}>
          <img src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model} ${vehicle.trim}`} />
          <div className={styles.visualTop}><span className={styles.status}><i /> Beschikbaar</span><span className={styles.carcheckBadge}>CarCheck verified</span></div>
          <div className={styles.visualBottom}><div><span>Volt & Vroom selectie</span><strong>Zorgvuldig geselecteerd. Transparant gecontroleerd.</strong></div><div><span>Foto</span><strong>01 / {String(vehicle.images.length).padStart(2,"0")}</strong></div></div>
        </div>

        <aside className={styles.side}>
          <p className={styles.eyebrow}>{driveLabel} · VV Selectie</p>
          <h1>{vehicle.brand}<br />{vehicle.model}</h1>
          <p className={styles.trim}>{vehicle.trim}</p>
          <div className={styles.price}>{eur.format(vehicle.priceEur)}</div>
          <div className={styles.monthly}>{vehicle.monthlyPriceEur ? `Financiering indicatief vanaf ${eur.format(vehicle.monthlyPriceEur)} p/m` : "Financiering op aanvraag"}</div>
          <div className={styles.quickFacts}>
            <div><span>Bouwjaar</span><strong>{vehicle.year}</strong></div><div><span>Kilometerstand</span><strong>{km.format(vehicle.mileageKm)} km</strong></div>
            <div><span>Aandrijving</span><strong>{vehicle.fuelType}</strong></div><div><span>Transmissie</span><strong>{vehicle.transmission}</strong></div>
          </div>
          <div className={styles.ctaStack}><a className={styles.primary} href="#afspraak">Plan een proefrit</a><a className={styles.secondary} href="#carcheck">Bekijk CarCheck</a></div>
          <div className={styles.microTrust}><span>Geen verrassingen</span><span>Persoonlijk advies</span><span>12 mnd garantie</span></div>
        </aside>
      </section>

      <section className={styles.story}>
        <div><span className={styles.sectionLabel}>Waarom deze auto</span><h2>Geen occasion.<br />Een bewuste keuze.</h2><p className={styles.storyLead}>Bij Volt & Vroom draait een auto niet alleen om uitvoering en kilometerstand. We kijken naar het complete verhaal: techniek, historie, accugezondheid, gebruikskosten en hoe de auto past bij jouw dagelijks leven.</p><div className={styles.highlightGrid}>{vehicle.highlights.map(item => <span key={item}>✓ {item}</span>)}</div></div>
        <aside className={styles.factsCard}><h3>De essentie</h3><div className={styles.factRow}><span>Carrosserie</span><strong>{vehicle.bodyStyle}</strong></div><div className={styles.factRow}><span>Kleur</span><strong>{vehicle.color}</strong></div><div className={styles.factRow}><span>Onderhoud</span><strong>{vehicle.maintenanceHistory === "complete" ? "Volledig inzichtelijk" : vehicle.maintenanceHistory}</strong></div><div className={styles.factRow}><span>Garantie</span><strong>{vehicle.warrantyMonths} maanden</strong></div><div className={styles.factRow}><span>Locatie</span><strong>Volt & Vroom Groningen</strong></div></aside>
      </section>

      <section className={styles.intelligence} id="carcheck">
        <div className={styles.intelligenceHead}><div><span className={styles.sectionLabel}>Hybrid Intelligence</span><h2>Wij laten zien wat<br />anderen overslaan.</h2></div><p>Hybride rijden wordt pas echt transparant als je verder kijkt dan brandstof en vermogen. Daarom maken we de belangrijkste aandrijf- en accudata begrijpelijk.</p></div>
        <div className={styles.intelligenceGrid}>
          <article className={styles.intelCard}><span>Accugezondheid</span><strong>{vehicle.batteryHealthPercent ?? "—"}%</strong><small>indicatie batterijconditie</small></article>
          <article className={styles.intelCard}><span>Praktijkverbruik</span><strong>{vehicle.consumptionPer100Km ? `${vehicle.consumptionPer100Km} l` : "—"}</strong><small>per 100 kilometer</small></article>
          <article className={styles.intelCard}><span>Geschatte besparing</span><strong>{vehicle.annualSavingEur ? eur.format(vehicle.annualSavingEur) : "—"}</strong><small>per jaar volgens profiel</small></article>
          <article className={styles.intelCard}><span>Garantie</span><strong>{vehicle.warrantyMonths} mnd</strong><small>Volt & Vroom zekerheid</small></article>
        </div>
        <div className={styles.score}><div className={styles.scoreRing}><strong>{score}</strong><small>/100</small></div><div className={styles.scoreText}><h3>CarCheck voertuigscore</h3><p>Een heldere samenvatting van de beschikbare voertuigdata. Het volledige rapport maakt inzichtelijk waarop de beoordeling is gebaseerd.</p></div></div>
      </section>

      <section className={styles.ownership}>
        <article className={styles.ownershipCard}><span className={styles.sectionLabel}>Slimmer rijden</span><div className={styles.ownershipValue}>{vehicle.annualSavingEur ? eur.format(vehicle.annualSavingEur) : "Op maat"}</div><h3>Geschatte jaarbesparing</h3><p>Niet alleen kijken naar de aanschafprijs. Volt & Vroom maakt de potentiële gebruiksvoordelen van hybride rijden zichtbaar.</p></article>
        <article className={styles.ownershipCard}><span className={styles.sectionLabel}>Flexibel bezit</span><div className={styles.ownershipValue}>{vehicle.monthlyPriceEur ? `${eur.format(vehicle.monthlyPriceEur)} p/m` : "Op maat"}</div><h3>Financiering als indicatie</h3><p>We rekenen transparant met je mee. Geen verkooppraat, maar een voorstel dat past bij auto, looptijd en jouw situatie.</p></article>
      </section>

      <section className={styles.trust} id="afspraak"><span className={styles.sectionLabel}>Ervaar het verschil</span><h2>Een goede auto voel je.<br />Een goede keuze begrijp je.</h2><p>Plan een persoonlijke proefrit in Groningen. We nemen de auto, techniek en relevante CarCheck-data rustig met je door.</p><div className={styles.trustActions}><a className={styles.primary} href="mailto:mik@voltvroom.nl?subject=Proefrit%20Volt%20%26%20Vroom">Plan een proefrit</a><a className={styles.secondary} href="tel:+31501234567">Bel Volt & Vroom</a></div></section>
    </main>

    <div className={styles.stickyBar}><div><strong>{vehicle.brand} {vehicle.model}</strong><br /><span>{vehicle.trim} · {eur.format(vehicle.priceEur)}</span></div><a href="#afspraak">Plan proefrit</a></div>
  </div>;
}
