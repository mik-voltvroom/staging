import Link from "next/link";
import { Header } from "@/components/Header";
import { listPublicVehicles } from "@/lib/repositories/public-vehicle-repository";
import { centsToEuros } from "@/lib/money";

const money = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("nl-NL");

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const vehicles = await listPublicVehicles(100);

  return <div style={{ minHeight: "100vh", background: "#f7f9fa", color: "#111820" }}>
    <Header />
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "72px 28px 96px" }}>
      <header style={{ maxWidth: 760, marginBottom: 52 }}>
        <p style={{ margin: "0 0 14px", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#64717c" }}>Volt & Vroom selectie</p>
        <h1 style={{ margin: 0, fontSize: "clamp(40px, 6vw, 72px)", lineHeight: .98, letterSpacing: "-.055em", fontWeight: 650 }}>Auto’s die we zelf<br />zouden rijden.</h1>
        <p style={{ margin: "24px 0 0", maxWidth: 620, fontSize: 18, lineHeight: 1.65, color: "#64717c" }}>Een compacte selectie hybride en geëlektrificeerde auto’s. Duidelijke data, transparante techniek en geen onnodige verkooppraat.</p>
      </header>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #dfe5e8", paddingTop: 18, marginBottom: 28 }}>
        <span style={{ color: "#64717c" }}>{vehicles.length} {vehicles.length === 1 ? "auto" : "auto’s"} beschikbaar</span>
        <span style={{ fontSize: 13, color: "#64717c" }}>Live uit Volt & Vroom voorraad</span>
      </div>

      {vehicles.length === 0 ? <div style={{ background: "white", borderRadius: 18, padding: 48, border: "1px solid #e4e9ec" }}><h2 style={{ marginTop: 0 }}>Nieuwe selectie onderweg.</h2><p style={{ color: "#64717c", marginBottom: 0 }}>Er staan momenteel geen beschikbare voertuigen gepubliceerd.</p></div> :
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        {vehicles.map(vehicle => <Link key={vehicle.id} href={`/voorraad/${encodeURIComponent(vehicle.slug)}`} style={{ textDecoration: "none", color: "inherit", background: "white", borderRadius: 18, overflow: "hidden", border: "1px solid #e4e9ec", display: "block" }}>
          <div style={{ aspectRatio: "4 / 3", background: "#edf1f3", overflow: "hidden", position: "relative" }}>
            {vehicle.images[0] ? <img src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "grid", placeItems: "center", color: "#8a969e" }}>Foto volgt</div>}
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start" }}><div><h2 style={{ margin: 0, fontSize: 24, letterSpacing: "-.03em" }}>{vehicle.brand} {vehicle.model}</h2><p style={{ margin: "6px 0 0", color: "#64717c", minHeight: 22 }}>{vehicle.trim}</p></div><strong style={{ fontSize: 20, whiteSpace: "nowrap" }}>{vehicle.priceCents > 0 ? money.format(centsToEuros(vehicle.priceCents)) : "Prijs op aanvraag"}</strong></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 22, paddingTop: 18, borderTop: "1px solid #edf0f2", color: "#52606b", fontSize: 14 }}>
              {vehicle.year ? <span>{vehicle.year}</span> : null}{vehicle.mileageKm !== undefined ? <span>{number.format(vehicle.mileageKm)} km</span> : null}{vehicle.transmission ? <span>{vehicle.transmission}</span> : null}{vehicle.fuelType ? <span>{vehicle.fuelType}</span> : null}
            </div>
          </div>
        </Link>)}
      </div>}
    </main>
  </div>;
}
