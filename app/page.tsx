import Image from "next/image";
import type { Metadata } from "next";
import { BrandLogo } from "@/components/BrandLogo";
import { ContactForm } from "@/components/ContactForm";
import { Header } from "@/components/Header";
import { VehicleCard } from "@/components/VehicleCard";
import { vehicles } from "@/lib/sample-data";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const assurances = [
  { icon: "/brand/icons/accugezondheid.svg", title: "Accu inzichtelijk", text: "Een begrijpelijke uitleg over de conditie en het gebruik van de aandrijflijn." },
  { icon: "/brand/icons/hybride.svg", title: "Eerlijk verbruik", text: "Geen foldercijfers, maar een realistische verwachting die past bij jouw ritten." },
  { icon: "/brand/icons/financiering.svg", title: "Kosten vooraf helder", text: "Aanschaf, maandlasten en verwacht onderhoud overzichtelijk naast elkaar." },
  { icon: "/brand/icons/proefrit.svg", title: "Advies zonder druk", text: "Rustig vergelijken en proefrijden met iemand die de techniek kan uitleggen." },
];

const steps = [
  ["01", "Vertel hoe je rijdt", "Dagelijkse afstand, laadmogelijkheden en wat je belangrijk vindt."],
  ["02", "Wij vergelijken eerlijk", "Elektrisch, hybride of toch anders — ook als dat niet onze voorraad is."],
  ["03", "Rijd en beslis rustig", "Pas na een uitgebreide proefrit bepaal je of de auto echt bij je past."],
];

export default function HomePage() {
  return <>
    <a className="skipLink" href="#inhoud">Ga naar de inhoud</a>
    <Header />
    <main id="inhoud">
      <section className="heroShell" aria-labelledby="hero-title">
        <div className="container hero">
          <div className="heroCopy">
            <p className="eyebrow">Premium hybride specialist van Noord-Nederland</p>
            <h1 id="hero-title">Slim rijden.<br /><em>Meer genieten.</em></h1>
            <p className="lead">Heldere informatie, lage gebruikskosten en persoonlijk advies. Wij maken elektrisch en hybride rijden begrijpelijk, zodat je kiest met zekerheid.</p>
            <div className="actions">
              <a className="button" href="#advies">Plan een vrijblijvend gesprek <span aria-hidden="true">→</span></a>
              <a className="textButton" href="#voorraad">Bekijk de voorraad</a>
            </div>
            <ul className="trustList" aria-label="Onze zekerheden"><li>Persoonlijk advies</li><li>Transparante historie</li><li>Geen verkooppraat</li></ul>
          </div>
          <div className="heroVisual">
            <div className="heroArtwork"><Image src="/editorial/hero-v2.png" alt="Een witte elektrische auto en een grafietgrijze hybride auto in een rustige studio" fill priority sizes="(max-width: 980px) 100vw, 52vw" /></div>
            <div className="heroProof"><span>Onze belofte</span><strong>Meer inzicht. Minder twijfel.</strong></div>
          </div>
        </div>
      </section>

      <section className="proofBar" aria-label="Volt & Vroom in het kort"><div className="container proofGrid">
        <div><strong>Noord-Nederland</strong><span>Persoonlijk en dichtbij</span></div><div><strong>Elektrisch & hybride</strong><span>Advies vanuit jouw gebruik</span></div><div><strong>Techniek begrijpelijk</strong><span>Ook zonder autokennis</span></div><div><strong>Vrijblijvend</strong><span>Eerst weten, dan kiezen</span></div>
      </div></section>

      <section id="waarom" className="section container introSection">
        <div className="sectionHeading splitHeading"><div><p className="eyebrow">Waarom Volt & Vroom</p><h2>Een slimme keuze mag ook gewoon goed voelen.</h2></div><p className="sectionIntro">De overstap naar elektrisch of hybride roept vragen op. Wij combineren technische kennis met nuchter advies, zodat je precies weet waar je aan toe bent.</p></div>
        <div className="assuranceGrid">{assurances.map(item => <article className="assuranceCard" key={item.title}><Image src={item.icon} alt="" width={46} height={46} /><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div>
      </section>

      <section className="choiceSection" aria-labelledby="keuze-title"><div className="container choiceGrid">
        <div className="choiceCopy"><p className="eyebrow">Elektrisch of hybride?</p><h2 id="keuze-title">Niet de trend, maar jouw dagelijkse rit bepaalt.</h2><p className="lead">Een elektrische auto is ideaal als laden logisch in je dag past. Een hybride kan slimmer zijn bij wisselende afstanden of beperkte laadmogelijkheden. Wij rekenen beide routes eerlijk met je door.</p><a className="textButton" href="#advies">Ontdek wat bij je past <span aria-hidden="true">→</span></a></div>
        <div className="choiceCards"><article><Image className="choiceIcon" src="/brand/icons/elektrisch.svg" alt="" width={48} height={48} /><div><h3>Elektrisch</h3><p>Stil, direct en lokaal uitstootvrij. Sterk bij voorspelbare ritten en een goede laadplek.</p></div></article><article><Image className="choiceIcon" src="/brand/icons/hybride.svg" alt="" width={48} height={48} /><div><h3>Hybride</h3><p>Efficiënt zonder laadstress. Vertrouwd op lange afstanden en zuinig in stad en regio.</p></div></article></div>
      </div></section>

      <section id="voorraad" className="section container">
        <div className="sectionHeading inventoryHeading"><div><p className="eyebrow">Uitgelichte voorraad</p><h2>Auto’s met een helder verhaal.</h2></div><p className="sectionIntro">De eerste selectie staat klaar. Voertuigpagina’s worden nog verder aangevuld; voor alle actuele informatie kun je ons direct benaderen.</p></div>
        <div className="grid vehicleGrid">{vehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
      </section>

      <section className="section processSection" aria-labelledby="werkwijze-title"><div className="container">
        <div className="sectionHeading splitHeading"><div><p className="eyebrow">Zo werken wij</p><h2 id="werkwijze-title">Van twijfel naar een keuze die klopt.</h2></div><p className="sectionIntro">Geen ingewikkeld verkoopproces. Drie rustige stappen, met alle ruimte om vragen te stellen.</p></div>
        <ol className="processGrid">{steps.map(([number,title,text]) => <li key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
      </div></section>

      <section id="advies" className="section contactSection"><div className="container contactLayout">
        <div className="contactCopy"><p className="eyebrow">Vrijblijvend advies</p><h2>Vertel ons hoe je rijdt.</h2><p className="lead">Wij nemen persoonlijk contact op en helpen je op weg met een passend, eerlijk advies.</p><div className="contactFacts"><a href="tel:+31502113883"><span>Bel direct</span><strong>050 211 3883</strong></a><a href="mailto:mik@voltvroom.nl"><span>Stuur een e-mail</span><strong>mik@voltvroom.nl</strong></a><div><span>Bezoek op afspraak</span><strong>Euvelgunnerweg 50, Groningen</strong></div></div></div>
        <ContactForm vehicles={vehicles.map(vehicle => ({ id: vehicle.id, label: `${vehicle.brand} ${vehicle.model}` }))} />
      </div></section>
    </main>
    <footer className="siteFooter"><div className="container footerTop"><div><BrandLogo dark /><p>Slim rijden. Meer genieten.</p></div><div><strong>Navigatie</strong><a href="#voorraad">Voorraad</a><a href="#waarom">Onze zekerheid</a><a href="#advies">Contact</a></div><div><strong>Contact</strong><a href="tel:+31502113883">050 211 3883</a><a href="mailto:mik@voltvroom.nl">mik@voltvroom.nl</a><span>Groningen</span></div></div><div className="container footerBottom"><span>© 2026 Volt &amp; Vroom</span><div><a href="/privacy">Privacy</a><a href="/login">VVOS-login</a></div></div></footer>
  </>;
}
