import { Header } from "@/components/Header";
import { VehicleCard } from "@/components/VehicleCard";
import { vehicles } from "@/lib/sample-data";

export default function HomePage() {
  return <>
    <Header />
    <main>
      <section className="container hero">
        <div>
          <p className="eyebrow">De hybride specialist van Noord-Nederland</p>
          <h1>Slim rijden. Meer genieten.</h1>
          <p className="lead">Geteste hybride auto's met inzicht in accugezondheid, praktijkverbruik, maandlasten en onderhoud. Geen verkooppraat, wel zekerheid.</p>
          <div className="actions">
            <a className="button" href="#voorraad">Bekijk voorraad</a>
            <a className="button secondary" href="#contact">Welke hybride past bij mij?</a>
          </div>
        </div>
        <div className="heroCard"><img src={vehicles[0].images[0]} alt="Premium hybride auto" /></div>
      </section>

      <section id="waarom" className="section container">
        <p className="eyebrow">Volt & Vroom zekerheid</p>
        <h2>Een verstandige keuze, zonder dat het saai wordt.</h2>
        <div className="metrics">
          <div className="metric"><strong>100%</strong><span className="muted">transparante historie</span></div>
          <div className="metric"><strong>Accutest</strong><span className="muted">zichtbaar per voertuig</span></div>
          <div className="metric"><strong>Maandlast</strong><span className="muted">naast de verkoopprijs</span></div>
          <div className="metric"><strong>Persoonlijk</strong><span className="muted">advies zonder druk</span></div>
        </div>
      </section>

      <section id="voorraad" className="section container">
        <p className="eyebrow">Uitgelichte voorraad</p>
        <h2>Hybrides die technisch én financieel kloppen.</h2>
        <p className="lead">Iedere auto wordt gepresenteerd op gebruikskosten, accugezondheid en relevante uitrusting.</p>
        <div className="grid" style={{marginTop: 28}}>{vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}</div>
      </section>

      <section id="contact" className="section container">
        <div className="card">
          <p className="eyebrow">Persoonlijk advies</p>
          <h2>Vertel hoe u rijdt. Wij adviseren wat echt past.</h2>
          <p className="lead">Volt & Vroom · Euvelgunnerweg 50 · 9723 CW Groningen · 050 211 3883</p>
          <div className="actions"><a className="button" href="mailto:mik@voltvroom.nl">Neem contact op</a></div>
        </div>
      </section>
    </main>
    <footer><div className="container">© 2026 Volt & Vroom — slim, transparant en persoonlijk.</div></footer>
  </>;
}
