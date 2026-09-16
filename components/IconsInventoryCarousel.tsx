"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { eur } from "@/lib/format";
import { centsToEuros } from "@/lib/money";
import type { Vehicle } from "@/types";

const number = new Intl.NumberFormat("nl-NL");

export function IconsInventoryCarousel({ vehicles }: { vehicles: Vehicle[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiple = vehicles.length > 1;

  const move = (direction: -1 | 1) => {
    if (!hasMultiple) return;
    const nextIndex = Math.max(0, Math.min(vehicles.length - 1, activeIndex + direction));
    railRef.current?.children[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setActiveIndex(nextIndex);
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !hasMultiple) return;
    const updateIndex = () => {
      const firstCard = rail.firstElementChild;
      if (!firstCard) return;
      setActiveIndex(Math.round(rail.scrollLeft / (firstCard as HTMLElement).offsetWidth));
    };
    rail.addEventListener("scroll", updateIndex, { passive: true });
    return () => rail.removeEventListener("scroll", updateIndex);
  }, [hasMultiple]);

  return <section className="iconsInventory" id="icons-voorraad" aria-labelledby="icons-inventory-title">
    <div className="container">
      <div className="iconsInventoryHeading">
        <div>
          <p className="eyebrow">Actuele Icons-selectie</p>
          <h2 id="icons-inventory-title">Onze Icons op voorraad</h2>
        </div>
        <div className="iconsInventoryControls">
          <span>{vehicles.length === 0 ? "Binnenkort nieuwe selectie" : `${vehicles.length} ${vehicles.length === 1 ? "Icon" : "Icons"} beschikbaar`}</span>
          <button type="button" onClick={() => move(-1)} disabled={!hasMultiple || activeIndex === 0} aria-label="Vorige Icon">←</button>
          <button type="button" onClick={() => move(1)} disabled={!hasMultiple || activeIndex === vehicles.length - 1} aria-label="Volgende Icon">→</button>
        </div>
      </div>

      {vehicles.length === 0 ? <div className="iconsInventoryEmpty"><h3>Nieuwe Icons onderweg.</h3><p>Er staan momenteel geen als Icons gemarkeerde voertuigen gepubliceerd.</p></div> :
        <div className="iconsInventoryRail" ref={railRef} role="region" aria-label="Icons op voorraad" aria-roledescription="carrousel" tabIndex={0} onKeyDown={(event) => {
          if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
          if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
        }}>
          {vehicles.map(vehicle => <article className="iconsInventoryCard" key={vehicle.id}>
            <Link href={`/voorraad/${encodeURIComponent(vehicle.slug)}`} className="iconsInventoryMedia" aria-label={`Bekijk ${vehicle.brand} ${vehicle.model}`}>
              {vehicle.images[0] ? <img src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model} ${vehicle.trim}`} loading="lazy" /> : <span>Foto volgt</span>}
            </Link>
            <div className="iconsInventoryBody">
              <p className="iconsInventoryBrand">{vehicle.brand}</p>
              <h3>{vehicle.model}</h3>
              <p className="iconsInventoryTrim">{vehicle.trim}</p>
              <div className="iconsInventoryFacts">
                <span>{vehicle.year}</span>
                <span>{number.format(vehicle.mileageKm)} km</span>
              </div>
              <strong className="iconsInventoryPrice">{vehicle.priceCents > 0 ? eur.format(centsToEuros(vehicle.priceCents)) : "Prijs op aanvraag"}</strong>
              <Link className="textButton" href={`/voorraad/${encodeURIComponent(vehicle.slug)}`}>Bekijk Icon <span aria-hidden="true">→</span></Link>
            </div>
          </article>)}
        </div>}
    </div>
  </section>;
}
