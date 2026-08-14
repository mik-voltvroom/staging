import Link from "next/link";
import { eur, km } from "@/lib/format";
import type { Vehicle } from "@/types";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return <article className="card vehicle">
    <div className="vehicleMedia"><img src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model}`} /><span>{vehicle.driveType.replaceAll("-", " ")}</span></div>
    <div className="vehicleBody">
      <div className="vehicleHeading"><div><p className="vehicleBrand">{vehicle.brand}</p><h3>{vehicle.model}</h3></div><div className="price">{eur.format(vehicle.priceEur)}</div></div>
      <p className="muted vehicleMeta">{vehicle.trim} · {vehicle.year} · {km.format(vehicle.mileageKm)} km</p>
      <div className="badges">
        {vehicle.batteryHealthPercent && <span className="badge">Accu {vehicle.batteryHealthPercent}%</span>}
        {vehicle.annualSavingEur && <span className="badge">Bespaar ± {eur.format(vehicle.annualSavingEur)}/jaar</span>}
        <span className="badge">{vehicle.transmission}</span>
      </div>
      <Link className="button vehicleAction" href={`/voorraad/${vehicle.slug}`}>Bekijk deze auto <span aria-hidden="true">→</span></Link>
    </div>
  </article>;
}
