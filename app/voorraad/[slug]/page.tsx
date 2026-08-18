import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { VehicleSocialVideos } from "@/components/VehicleSocialVideos";
import { eur, km } from "@/lib/format";
import { centsToEuros } from "@/lib/money";
import { getPublicVehicleBySlug } from "@/lib/repositories/public-vehicle-repository";

export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = await getPublicVehicleBySlug(slug);
  if (!vehicle) notFound();
  return <>
    <Header />
    <main className="container section">
      <p className="eyebrow">{vehicle.driveType.replaceAll("-", " ")}</p>
      <h1 style={{fontSize:"clamp(2.8rem,6vw,5.5rem)"}}>{vehicle.brand} {vehicle.model}</h1>
      <p className="lead">{vehicle.trim} · {vehicle.year} · {km.format(vehicle.mileageKm)} km · {vehicle.transmission}</p>
      <div className="heroCard" style={{marginTop:28}}><img src={vehicle.images[0] || "/brand/vv-symbol.svg"} alt={`${vehicle.brand} ${vehicle.model}`} /></div>
      <div className="metrics" style={{marginTop:22}}>
        <div className="metric"><strong>{eur.format(centsToEuros(vehicle.priceCents))}</strong><span className="muted">verkoopprijs</span></div>
        <div className="metric"><strong>{vehicle.monthlyPriceCents ? eur.format(centsToEuros(vehicle.monthlyPriceCents)) : "Op aanvraag"}</strong><span className="muted">indicatie per maand</span></div>
        <div className="metric"><strong>{vehicle.batteryHealthPercent ?? "—"}%</strong><span className="muted">accugezondheid</span></div>
        <div className="metric"><strong>{vehicle.annualSavingCents ? eur.format(centsToEuros(vehicle.annualSavingCents)) : "—"}</strong><span className="muted">geschatte jaarbesparing</span></div>
      </div>
      <VehicleSocialVideos vehicleId={vehicle.id} />
    </main>
  </>;
}
