"use client";

import { useRef, useState } from "react";
import styles from "./VehicleGallery.module.css";

export function VehicleGallery({ images, vehicleLabel }: { images: string[]; vehicleLabel: string }) {
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const image = images[active];
  const show = (index: number) => { setActive(index); dialog.current?.showModal(); };
  const move = (direction: -1 | 1) => setActive(current => (current + direction + images.length) % images.length);

  if (!images.length) return <div className={styles.galleryFallback}><img src="/brand/vv-symbol.svg" alt="" /><span>Foto’s volgen</span></div>;

  return <div className={styles.gallery} style={{ zIndex: 1 }}>
    <button className={styles.galleryMain} type="button" onClick={() => show(active)} aria-label={`Open fotogalerij van ${vehicleLabel}`}>
      <img src={image} alt={`${vehicleLabel}, foto ${active + 1} van ${images.length}`} />
      <span>{active + 1} / {images.length} · Vergroot</span>
    </button>
    {images.length > 1 ? <div className={styles.thumbnails} aria-label="Kies een voertuigfoto">
      {images.slice(0, 8).map((source, index) => <button className={index === active ? styles.thumbnailActive : undefined} type="button" key={`${source}-${index}`} onClick={() => setActive(index)} aria-label={`Toon foto ${index + 1}`} aria-current={index === active ? "true" : undefined}><img src={source} alt="" loading="lazy" /></button>)}
    </div> : null}
    <dialog ref={dialog} className={styles.lightbox} onClick={event => { if (event.target === dialog.current) dialog.current?.close(); }}>
      <button className={styles.lightboxClose} type="button" onClick={() => dialog.current?.close()} aria-label="Sluit fotogalerij">×</button>
      {images.length > 1 ? <button className={styles.lightboxPrevious} type="button" onClick={() => move(-1)} aria-label="Vorige foto">←</button> : null}
      <img src={image} alt={`${vehicleLabel}, foto ${active + 1} van ${images.length}`} />
      {images.length > 1 ? <button className={styles.lightboxNext} type="button" onClick={() => move(1)} aria-label="Volgende foto">→</button> : null}
      <p>{active + 1} van {images.length}</p>
    </dialog>
  </div>;
}
