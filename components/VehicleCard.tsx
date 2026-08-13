import Link from "next/link";
import { eur, km } from "@/lib/format";
import type { Vehicle } from "@/types";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return <article className="card vehicle">
    <img src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model}`} />
    <p className="eyebrow">{vehicle.driveType.replaceAll("-", " ")}</p>
    <h3>{vehicle.brand} {vehicle.model}</h3>
    <p className="muted">{vehicle.trim} · {vehicle.year} · {km.format(vehicle.mileageKm)} km</p>
    <div className="price">{eur.format(vehicle.priceEur)}</div>
    <div className="badges">
      {vehicle.batteryHealthPercent && <span className="badge">Accu {vehicle.batteryHealthPercent}%</span>}
      {vehicle.annualSavingEur && <span className="badge">Bespaar ± {eur.format(vehicle.annualSavingEur)}/jaar</span>}
      <span className="badge">{vehicle.transmission}</span>
    </div>
    <Link className="button" href={`/voorraad/${vehicle.slug}`}>Bekijk deze auto</Link>
  </article>;
}
