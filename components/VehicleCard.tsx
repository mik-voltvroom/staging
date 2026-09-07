import Link from "next/link";
import { eur, km } from "@/lib/format";
import type { Vehicle } from "@/types";
import { centsToEuros } from "@/lib/money";
import { publicVehicleCategory } from "@/lib/vehicle/business";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const vehicleLabel = `${vehicle.brand} ${vehicle.model} ${vehicle.trim}`;
  const category = publicVehicleCategory(vehicle);
  const categoryFacts = category === "Icon"
    ? [
        vehicle.powerHp ? `${km.format(vehicle.powerHp)} pk` : null,
        vehicle.ownerCount !== undefined ? `${vehicle.ownerCount} ${vehicle.ownerCount === 1 ? "eigenaar" : "eigenaren"}` : null,
      ]
    : [
        vehicle.electricRangeKm ? `${km.format(vehicle.electricRangeKm)} km elektrisch` : null,
        vehicle.batteryHealthPercent !== undefined ? `SOH ${vehicle.batteryHealthPercent}%` : null,
      ];

  return <Link className="vehicleCardLink" href={`/voorraad/${vehicle.slug}`} aria-label={`Bekijk ${vehicleLabel}`}>
    <article className="card vehicle">
      <div className="vehicleMedia">
        <img src={vehicle.images[0] || "/brand/vv-symbol.svg"} alt={`${vehicle.brand} ${vehicle.model}`} loading="lazy" />
        <span>{category}</span>
      </div>
      <div className="vehicleBody">
        <div className="vehicleHeading">
          <div><p className="vehicleBrand">{vehicle.brand}</p><h3>{vehicle.model}</h3></div>
          <div className="vehiclePrice"><div className="price">{vehicle.priceCents > 0 ? eur.format(centsToEuros(vehicle.priceCents)) : "Prijs op aanvraag"}</div></div>
        </div>
        <p className="muted vehicleMeta">{vehicle.trim} · {vehicle.year} · {km.format(vehicle.mileageKm)} km</p>
        <div className="badges">
          {categoryFacts.map(fact => fact ? <span className="badge" key={fact}>{fact}</span> : null)}
          {vehicle.transmission ? <span className="badge">{vehicle.transmission}</span> : null}
        </div>
        <span className="button vehicleAction"><img className="vehicleActionMark" src="/brand/vv-symbol.svg" alt="" />Bekijk deze auto <span aria-hidden="true">→</span></span>
      </div>
    </article>
  </Link>;
}
