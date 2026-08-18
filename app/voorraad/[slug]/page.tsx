import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { VehicleSocialVideos } from "@/components/VehicleSocialVideos";
import { eur, km } from "@/lib/format";
import { vehicles } from "@/lib/sample-data";
import { adminDb } from "@/lib/firebase-admin";
import type { Vehicle } from "@/types";

export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return process.env.VVOS_DATA_MODE === "firebase" ? [] : vehicles.map(v => ({ slug: v.slug }));
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let vehicle: Vehicle | undefined;
  if (process.env.VVOS_DATA_MODE === "firebase") {
    if (!adminDb) notFound();
    const snapshot = await adminDb.collection("vehicles").where("slug", "==", slug).where("status", "==", "available").limit(1).get();
    const document = snapshot.docs[0];
    vehicle = document ? ({ id: document.id, ...document.data() } as Vehicle) : undefined;
  } else {
    vehicle = vehicles.find(v => v.slug === slug);
  }
  if (!vehicle) notFound();
  return <>
    <Header />
    <main className="container section">
      <p className="eyebrow">{vehicle.driveType.replaceAll("-", " ")}</p>
      <h1 style={{fontSize:"clamp(2.8rem,6vw,5.5rem)"}}>{vehicle.brand} {vehicle.model}</h1>
      <p className="lead">{vehicle.trim} · {vehicle.year} · {km.format(vehicle.mileageKm)} km · {vehicle.transmission}</p>
      <div className="heroCard" style={{marginTop:28}}><img src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model}`} /></div>
      <div className="metrics" style={{marginTop:22}}>
        <div className="metric"><strong>{eur.format(vehicle.priceEur)}</strong><span className="muted">verkoopprijs</span></div>
        <div className="metric"><strong>{vehicle.monthlyPriceEur ? eur.format(vehicle.monthlyPriceEur) : "Op aanvraag"}</strong><span className="muted">indicatie per maand</span></div>
        <div className="metric"><strong>{vehicle.batteryHealthPercent ?? "—"}%</strong><span className="muted">accugezondheid</span></div>
        <div className="metric"><strong>{vehicle.annualSavingEur ? eur.format(vehicle.annualSavingEur) : "—"}</strong><span className="muted">geschatte jaarbesparing</span></div>
      </div>
      <VehicleSocialVideos vehicleId={vehicle.id} />
    </main>
  </>;
}
