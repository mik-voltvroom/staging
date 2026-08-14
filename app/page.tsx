import Image from "next/image";
import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Header } from "@/components/Header";
import { SiteFooter } from "@/components/SiteFooter";
import { VehicleCard } from "@/components/VehicleCard";
import { vehicles } from "@/lib/sample-data";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const assurances = [
  { icon: "/brand/icons/accugezondheid.svg", title: "SOH-accucontrole", text: "De gemeten accugezondheid wordt in een helder rapport vastgelegd en persoonlijk uitgelegd." },
  { icon: "/brand/icons/praktijkverbruik.svg", title: "Onze ervaring uit de praktijk", text: "Wij vertalen praktijkverbruik, bereik en laadgedrag naar wat u tijdens uw eigen ritten kunt verwachten." },
  { icon: "/brand/icons/historie.svg", title: "Aantoonbare historie", text: "Eigenaarschap, kilometerstand en voertuigverleden worden gecontroleerd en begrijpelijk gepresenteerd." },
  { icon: "/brand/icons/onderhoud.svg", title: "Dealeronderhouden", text: "De onderhoudshistorie is aantoonbaar en uitgevoerd door de merkdealer." },
  { icon: "/brand/icons/kilometerstand.svg", title: "Kilometerstand gecontroleerd", text: "Wij selecteren tot 100.000 kilometer en leggen de geregistreerde kilometerhistorie vast." },
];

const steps = [
  ["01", "Vertel hoe u rijdt", "Uw dagelijkse afstand, laadmogelijkheden en wat u belangrijk vindt."],
  ["02", "Wij leggen de opties uit", "U ziet wat elektrisch, hybride en de auto zelf in uw situatie betekenen."],
  ["03", "Proefrijden en rustig kiezen", "Na de uitleg en proefrit beslist u pas of de auto werkelijk bij u past."],
];

export default function HomePage() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "AutoDealer", name: "Volt & Vroom", description: "Onafhankelijke specialist voor zorgvuldig geselecteerde hybride en elektrische occasions.", url: "https://www.voltvroom.nl", telephone: "+31502113883", email: "mik@voltvroom.nl", address: { "@type": "PostalAddress", streetAddress: "Euvelgunnerweg 50", postalCode: "9723 CW", addressLocality: "Groningen", addressCountry: "NL" }, areaServed: ["Groningen", "Drenthe", "Friesland"] }) }} />
    <a className="skipLink" href="#inhoud">Ga naar de inhoud</a>
    <Header />
    <main id="inhoud">
      <section className="heroShell" aria-labelledby="hero-title">
        <div className="container hero">
          <div className="heroCopy">
            <p className="eyebrow">Hybride · Elektrisch · Icons</p>
            <h1 id="hero-title">Slim rijden.<br /><em>Meer genieten.</em></h1>
            <p className="lead">Geteste auto’s. Eerlijke informatie. Persoonlijk advies. Wij maken accugezondheid, verbruik, historie en kosten inzichtelijk voordat u kiest.</p>
            <div className="actions">
              <a className="button" href="#voorraad">Bekijk ons aanbod <span aria-hidden="true">→</span></a>
              <a className="textButton" href="/keuzehulp">Ontdek wat bij u past</a>
            </div>
            <ul className="trustList" aria-label="Onze zekerheden"><li>Aantoonbaar gecontroleerd</li><li>SOH-rapport</li><li>Advies zonder druk</li></ul>
          </div>
          <div className="heroVisual">
            <div className="heroArtwork"><Image src="/editorial/hero-v2.png" alt="Een witte elektrische auto en een grafietgrijze hybride auto in een rustige studio" fill priority sizes="(max-width: 980px) 100vw, 52vw" /></div>
            <div className="heroProof"><span>Onze norm</span><strong>Geen prijs zonder bewijs.</strong></div>
          </div>
        </div>
      </section>

      <section className="proofBar" aria-label="Volt & Vroom in het kort"><div className="container proofGrid">
        <div><strong>Maximaal 5 jaar</strong><span>Jonge, moderne auto’s</span></div><div><strong>Tot 100.000 km</strong><span>Gecontroleerde kilometerstand</span></div><div><strong>Eén vorige eigenaar</strong><span>Overzichtelijke herkomst</span></div><div><strong>SOH gemeten</strong><span>Accugezondheid in beeld</span></div>
      </div></section>

      <section id="waarom" className="section container introSection">
        <div className="sectionHeading splitHeading"><div><p className="eyebrow">De Volt &amp; Vroom-norm</p><h2>Zekerheid wordt zichtbaar in vijf bewijzen.</h2></div><p className="sectionIntro">Wij combineren meetgegevens met onze ervaring uit de praktijk. Zo worden historie, onderhoud, kilometerstand en accugezondheid controleerbaar onderdeel van het verhaal.</p></div>
        <div className="assuranceGrid">{assurances.map(item => <article className="assuranceCard" key={item.title}><Image src={item.icon} alt="" width={46} height={46} /><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div>
      </section>

      <section className="choiceSection" aria-labelledby="keuze-title"><div className="container choiceGrid">
        <div className="choiceCopy"><p className="eyebrow">Drie duidelijke werelden</p><h2 id="keuze-title">Welke auto past bij uw gebruik?</h2><p className="lead">Niet de trend, maar uw ritten, laadmogelijkheden en voorkeuren bepalen wat verstandig is. Wij leggen de verschillen uit en maken de gebruikskosten vergelijkbaar.</p><a className="textButton" href="#advies">Vraag persoonlijk advies <span aria-hidden="true">→</span></a></div>
        <div className="choiceCards"><article><Image className="choiceIcon" src="/brand/icons/hybride.svg" alt="" width={48} height={48} /><div><h3>Hybride</h3><p>Elektrische ondersteuning met de vertrouwdheid van een brandstofmotor. Geschikt voor wisselende afstanden.</p><a href="/hybride">Lees over hybride <span aria-hidden="true">→</span></a></div></article><article><Image className="choiceIcon" src="/brand/icons/elektrisch.svg" alt="" width={48} height={48} /><div><h3>Elektrisch</h3><p>Stil en direct rijden. Wij tonen bereik, laadmogelijkheden en gemeten accugezondheid.</p><a href="/elektrisch">Lees over elektrisch <span aria-hidden="true">→</span></a></div></article><article className="iconsChoice"><span className="iconsMark" aria-hidden="true">&amp;</span><div><h3>Icons</h3><p>Youngtimers, klassiekers in spe en bijzondere sportieve auto’s, geselecteerd op historie en techniek.</p><a href="/icons">Ontdek Icons <span aria-hidden="true">→</span></a></div></article></div>
      </div></section>

      <section id="voorraad" className="section container">
        <div className="sectionHeading inventoryHeading"><div><p className="eyebrow">Uitgelichte voorraad</p><h2>Geteste auto’s. Begrijpelijk uitgelegd.</h2></div><p className="sectionIntro">Bij iedere auto tonen wij prijs, aandrijving, kilometerstand, historie en accugezondheid. De voertuigpagina’s worden nog aangevuld; actuele informatie geven wij graag persoonlijk.</p></div>
        <div className="grid vehicleGrid">{vehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
      </section>

      <section className="section processSection" aria-labelledby="werkwijze-title"><div className="container">
        <div className="sectionHeading splitHeading"><div><p className="eyebrow">Zo werken wij</p><h2 id="werkwijze-title">Deskundig zonder afstand. Verkoop zonder druk.</h2></div><p className="sectionIntro">In drie heldere stappen krijgt u de informatie en aandacht om zelf een goede keuze te maken.</p></div>
        <ol className="processGrid">{steps.map(([number,title,text]) => <li key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
      </div></section>

      <section id="advies" className="section contactSection"><div className="container contactLayout">
        <div className="contactCopy"><p className="eyebrow">Persoonlijk advies</p><h2>Vertel ons hoe u rijdt.</h2><p className="lead">Wij leggen uit wat bij uw gebruik past en nemen persoonlijk contact met u op, zonder verkooppraat.</p><div className="contactFacts"><a href="tel:+31502113883"><span>Bel direct</span><strong>050 211 3883</strong></a><a href="mailto:mik@voltvroom.nl"><span>Stuur een e-mail</span><strong>mik@voltvroom.nl</strong></a><div><span>Bezoek op afspraak</span><strong>Euvelgunnerweg 50, Groningen</strong></div></div></div>
        <ContactForm vehicles={vehicles.map(vehicle => ({ id: vehicle.id, label: `${vehicle.brand} ${vehicle.model}` }))} />
      </div></section>
    </main>
    <SiteFooter />
  </>;
}
