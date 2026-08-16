import Image from "next/image";
import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Header } from "@/components/Header";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const assurances = [
  { icon: "/brand/icons/accugezondheid.svg", title: "SOH-accucontrole", text: "De conditie van de hoogvoltaccu wordt gecontroleerd. Wij leggen helder uit wat de gemeten waarde voor deze auto betekent." },
  { icon: "/brand/icons/praktijkverbruik.svg", title: "Onze ervaring uit de praktijk", text: "Geen verwachting uitsluitend uit de brochure. U krijgt een realistisch beeld van verbruik en elektrische actieradius bij normaal gebruik." },
  { icon: "/brand/icons/historie.svg", title: "Aantoonbare historie", text: "Onderhoud, kilometerstand, eigenaarsinformatie en relevante voertuiggegevens worden vóór verkoop gecontroleerd." },
  { icon: "/brand/icons/onderhoud.svg", title: "Zorgvuldig geselecteerd", text: "Geen willekeurige voorraad. Wij selecteren op leeftijd, kilometerstand, historie, uitvoering en technisch risico." },
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
            <p className="eyebrow">De hybride en elektrische specialist van Noord-Nederland</p>
            <h1 id="hero-title">Slim rijden.<br /><em>Meer genieten.</em></h1>
            <p className="heroDescriptor">Zorgvuldig geselecteerde hybride en elektrische occasions.</p>
            <p className="lead">Aantoonbare historie, inzicht in de hoogvoltaccu en persoonlijk advies op basis van hoe u werkelijk rijdt.</p>
            <div className="actions">
              <a className="button" href="#voorraad">Bekijk ons aanbod <span aria-hidden="true">→</span></a>
              <a className="button secondary" href="/keuzehulp">Welke auto past bij mij?</a>
            </div>
          </div>
          <div className="heroVisual">
            <div className="heroArtwork"><Image src="/editorial/hero-v2.png" alt="Een witte elektrische auto en een grafietgrijze hybride auto in een rustige studio" fill priority sizes="(max-width: 980px) 100vw, 52vw" /></div>
            <div className="heroProof"><span>Onze selectienorm</span><strong>Vijf harde selectiecriteria.</strong></div>
          </div>
        </div>
      </section>

      <section className="proofBar" aria-label="Volt & Vroom in het kort"><div className="container proofGrid">
        <div><strong>Maximaal 5 jaar</strong><span>Jonge, moderne auto’s</span></div><div><strong>Maximaal 100.000 km</strong><span>Gecontroleerde kilometerstand</span></div><div><strong>Eén eigenaar</strong><span>Overzichtelijke herkomst</span></div><div><strong>Dealeronderhouden</strong><span>Onderhoud aantoonbaar vastgelegd</span></div><div><strong>SOH-controle</strong><span>Accugezondheid in beeld</span></div>
      </div></section>

      <section id="waarom" className="section container introSection">
        <div className="sectionHeading splitHeading"><div><p className="eyebrow">De Volt &amp; Vroom-norm</p><h2>De juiste aandrijflijn. Aantoonbaar de juiste auto.</h2></div><p className="sectionIntro">Wij combineren meetgegevens met onze ervaring uit de praktijk. Zo worden historie, onderhoud, kilometerstand en accugezondheid controleerbaar onderdeel van het verhaal.</p></div>
        <div className="assuranceGrid">{assurances.map(item => <article className="assuranceCard" key={item.title}><Image src={item.icon} alt="" width={46} height={46} /><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div>
      </section>

      <section className="choiceSection" aria-labelledby="keuze-title"><div className="container choiceGrid">
        <div className="choiceCopy"><p className="eyebrow">Drie duidelijke werelden</p><h2 id="keuze-title">Welke auto past bij uw gebruik?</h2><p className="lead">Niet de trend, maar uw ritten, laadmogelijkheden en voorkeuren bepalen wat verstandig is. Wij leggen de verschillen uit en maken de gebruikskosten vergelijkbaar.</p><a className="textButton" href="/keuzehulp">Start de keuzehulp <span aria-hidden="true">→</span></a></div>
        <div className="choiceCards"><article><Image className="choiceIcon" src="/brand/icons/hybride.svg" alt="" width={48} height={48} /><div><h3>Hybride</h3><p>Elektrische ondersteuning met de vertrouwdheid van een brandstofmotor. Geschikt voor wisselende afstanden.</p><a href="/hybride">Lees over hybride <span aria-hidden="true">→</span></a></div></article><article><Image className="choiceIcon" src="/brand/icons/elektrisch.svg" alt="" width={48} height={48} /><div><h3>Elektrisch</h3><p>Stil en direct rijden. Wij tonen bereik, laadmogelijkheden en gemeten accugezondheid.</p><a href="/elektrisch">Lees over elektrisch <span aria-hidden="true">→</span></a></div></article><article className="iconsChoice"><span className="iconsMark" aria-hidden="true">&amp;</span><div><h3>Icons</h3><p>Youngtimers, klassiekers in spe en bijzondere sportieve auto’s, geselecteerd op historie en techniek.</p><a href="/icons">Ontdek Icons <span aria-hidden="true">→</span></a></div></article></div>
      </div></section>

      <section id="voorraad" className="section container">
        <div className="sectionHeading inventoryHeading"><div><p className="eyebrow">Geselecteerd aanbod</p><h2>Alleen publiceren wat wij kunnen onderbouwen.</h2></div><p className="sectionIntro">Actuele auto’s verschijnen hier pas nadat historie, kilometerstand, technische staat en beschikbare accudata zijn gecontroleerd. Wij tonen geen verzonnen SOH- of praktijkwaarden.</p></div>
        <div className="inventoryPlaceholder"><div><span>Voorraad in voorbereiding</span><h3>Wilt u als eerste weten welke auto’s beschikbaar komen?</h3><p>Vertel ons wat u zoekt. Wij nemen persoonlijk contact op zodra een passende, gecontroleerde auto beschikbaar is.</p></div><a className="button" href="#advies">Deel uw zoekopdracht <span aria-hidden="true">→</span></a></div>
      </section>

      <section className="section processSection" aria-labelledby="werkwijze-title"><div className="container">
        <div className="sectionHeading splitHeading"><div><p className="eyebrow">Zo werken wij</p><h2 id="werkwijze-title">Deskundig zonder afstand. Verkoop zonder druk.</h2></div><p className="sectionIntro">In drie heldere stappen krijgt u de informatie en aandacht om zelf een goede keuze te maken.</p></div>
        <ol className="processGrid">{steps.map(([number,title,text]) => <li key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
      </div></section>

      <section id="advies" className="section contactSection"><div className="container contactLayout">
        <div className="contactCopy"><p className="eyebrow">Persoonlijk advies</p><h2>Vertel ons hoe u rijdt.</h2><p className="lead">Wij leggen uit wat bij uw gebruik past en nemen persoonlijk contact met u op, zonder verkooppraat.</p><div className="contactFacts"><a href="tel:+31502113883"><span>Bel direct</span><strong>050 211 3883</strong></a><a href="mailto:mik@voltvroom.nl"><span>Stuur een e-mail</span><strong>mik@voltvroom.nl</strong></a><div><span>Bezoek op afspraak</span><strong>Euvelgunnerweg 50, Groningen</strong></div></div></div>
        <ContactForm vehicles={[]} />
      </div></section>
    </main>
    <SiteFooter />
  </>;
}
