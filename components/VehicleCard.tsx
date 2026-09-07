import Link from "next/link";
import { eur, km } from "@/lib/format";
import type { Vehicle } from "@/types";
import { centsToEuros } from "@/lib/money";

export function driveLabel(value: string): "Hybride" | "Elektrisch" | "Icoon" {
  const normalized = value.toLowerCase();
  if (normalized.includes("hybrid")) return "Hybride";
  if (normalized.includes("electric")) return "Elektrisch";
  return "Icoon";
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const vehicleLabel = `${vehicle.brand} ${vehicle.model} ${vehicle.trim}`;
  const hasElectricDrive = vehicle.driveType === "electric" || vehicle.driveType.includes("hybrid");
  const facts = [
    ["Wegenbelasting", vehicle.roadTaxLabel || "Niet vermeld"],
    ["Elektrisch rijbereik", hasElectricDrive && vehicle.electricRangeKm ? `${km.format(vehicle.electricRangeKm)} km` : "n.v.t."],
    ["SOH-waarde", hasElectricDrive && vehicle.batteryHealthPercent !== undefined ? `${vehicle.batteryHealthPercent}%` : "n.v.t."],
    ["Leaseprijs", vehicle.leasePriceCents ? `${eur.format(centsToEuros(vehicle.leasePriceCents))} p/m` : "Op aanvraag"],
  ];

  return <Link className="vehicleCardLink" href={`/voorraad/${vehicle.slug}`} aria-label={`Bekijk ${vehicleLabel}`}>
    <article className="card vehicle">
      <div className="vehicleMedia"><img src={vehicle.images[0] || "/brand/vv-symbol.svg"} alt={`${vehicle.brand} ${vehicle.model}`} /><span>{driveLabel(vehicle.driveType)}</span></div>
      <div className="vehicleBody">
        <div className="vehicleHeading">
          <div><p className="vehicleBrand">{vehicle.brand}</p><h3>{vehicle.model}</h3></div>
          <div className="vehiclePrice">
            <div className="price">{eur.format(centsToEuros(vehicle.priceCents))}</div>
            {vehicle.monthlyPriceCents ? <div className="monthlyPrice">Financiering {eur.format(centsToEuros(vehicle.monthlyPriceCents))} p/m</div> : null}
          </div>
        </div>
        <p className="muted vehicleMeta">{vehicle.trim} · {vehicle.year} · {km.format(vehicle.mileageKm)} km</p>
        <div className="badges">
          <span className="badge">{vehicle.transmission}</span>
        </div>
        <dl className="vehicleFacts">
          {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
        <span className="button vehicleAction"><img className="vehicleActionMark" src="/brand/vv-symbol.svg" alt="" />Bekijk deze auto <span aria-hidden="true">→</span></span>
      </div>
    </article>
  </Link>;
}
