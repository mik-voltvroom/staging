import Link from "next/link";
import { eur, km } from "@/lib/format";
import type { Vehicle } from "@/types";
import { centsToEuros } from "@/lib/money";

function driveLabel(value: string): string {
  const normalized = value.toLowerCase();
  if (normalized.includes("plug-in-hybrid")) return "Plug-in hybride";
  if (normalized.includes("hybrid")) return "Hybride";
  if (normalized.includes("electric")) return "Elektrisch";
  if (normalized.includes("combustion")) return "Brandstof";
  return value.replaceAll("-", " ");
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return <article className="card vehicle">
    <div className="vehicleMedia"><img src={vehicle.images[0] || "/brand/vv-symbol.svg"} alt={`${vehicle.brand} ${vehicle.model}`} /><span>{driveLabel(vehicle.driveType)}</span></div>
    <div className="vehicleBody">
      <div className="vehicleHeading"><div><p className="vehicleBrand">{vehicle.brand}</p><h3>{vehicle.model}</h3></div><div className="price">{eur.format(centsToEuros(vehicle.priceCents))}</div></div>
      <p className="muted vehicleMeta">{vehicle.trim} · {vehicle.year} · {km.format(vehicle.mileageKm)} km</p>
      <div className="badges">
        {vehicle.batteryHealthPercent && <span className="badge">Accu {vehicle.batteryHealthPercent}%</span>}
        {vehicle.annualSavingCents && <span className="badge">Bespaar ± {eur.format(centsToEuros(vehicle.annualSavingCents))}/jaar</span>}
        <span className="badge">{vehicle.transmission}</span>
      </div>
      <Link className="button vehicleAction" href={`/voorraad/${vehicle.slug}`}>Bekijk deze auto <span aria-hidden="true">→</span></Link>
    </div>
  </article>;
}
