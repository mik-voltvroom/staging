"use client";

import { ChangeEvent, DragEvent, PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

const OUTPUT_WIDTH = 1920;
const OUTPUT_HEIGHT = 1280;

type CarState = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

const INITIAL_CAR: CarState = {
  x: OUTPUT_WIDTH / 2,
  y: OUTPUT_HEIGHT * 0.63,
  scale: 1,
  rotation: 0,
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Afbeelding kon niet worden geladen."));
    image.src = src;
  });
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.68, "#fbfdff");
  gradient.addColorStop(1, "#eef7fc");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  ctx.save();
  ctx.strokeStyle = "rgba(91, 174, 226, 0.18)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(235, 330);
  ctx.lineTo(385, 0);
  ctx.stroke();

  ctx.strokeStyle = "rgba(91, 174, 226, 0.13)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(1740, 230, 345, Math.PI * 0.66, Math.PI * 1.28);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#071526";
  ctx.font = "600 38px Manrope, Inter, Arial, sans-serif";
  ctx.letterSpacing = "12px";
  ctx.fillText("VOLT & VROOM", OUTPUT_WIDTH / 2, 112);

  ctx.fillStyle = "#5baee2";
  ctx.font = "500 18px Inter, Arial, sans-serif";
  ctx.letterSpacing = "8px";
  ctx.fillText("AUTOMOTIVE", OUTPUT_WIDTH / 2, 158);

  ctx.strokeStyle = "rgba(91,174,226,.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(OUTPUT_WIDTH / 2 - 255, 151);
  ctx.lineTo(OUTPUT_WIDTH / 2 - 115, 151);
  ctx.moveTo(OUTPUT_WIDTH / 2 + 115, 151);
  ctx.lineTo(OUTPUT_WIDTH / 2 + 255, 151);
  ctx.stroke();
  ctx.restore();

  const floor = ctx.createLinearGradient(0, 780, 0, OUTPUT_HEIGHT);
  floor.addColorStop(0, "rgba(238,244,248,0)");
  floor.addColorStop(1, "rgba(220,230,236,0.52)");
  ctx.fillStyle = floor;
  ctx.fillRect(0, 760, OUTPUT_WIDTH, OUTPUT_HEIGHT - 760);
}

export default function PhotoStudioPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carImageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; carX: number; carY: number } | null>(null);
  const [car, setCar] = useState<CarState>(INITIAL_CAR);
  const [sourceName, setSourceName] = useState<string>("");
  const [status, setStatus] = useState("Upload een autofoto om te beginnen.");
  const [busy, setBusy] = useState(false);
  const [hasCar, setHasCar] = useState(false);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
    drawBackground(ctx);

    const image = carImageRef.current;
    if (!image) return;

    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate((car.rotation * Math.PI) / 180);

    const baseScale = Math.min((OUTPUT_WIDTH * 0.76) / image.naturalWidth, (OUTPUT_HEIGHT * 0.58) / image.naturalHeight);
    const scale = baseScale * car.scale;
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;

    ctx.shadowColor = "rgba(4, 20, 31, 0.16)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 18;
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
    ctx.restore();
  }, [car]);

  useEffect(() => {
    render();
  }, [render]);

  async function processFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setStatus("Kies een JPG, PNG of WebP-afbeelding.");
      return;
    }

    setBusy(true);
    setSourceName(file.name);
    setStatus("Auto vrijstaand maken zonder de auto zelf te wijzigen…");

    try {
      const form = new FormData();
      form.append("image", file);
      const response = await fetch("/api/photo-studio/cutout", { method: "POST", body: form });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Vrijstaand maken is mislukt." }));
        throw new Error(error.error || "Vrijstaand maken is mislukt.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const image = await loadImage(url);
      carImageRef.current = image;
      setCar(INITIAL_CAR);
      setHasCar(true);
      setStatus("Klaar. Sleep de auto op zijn plek en pas alleen grootte of hoek aan.");
    } catch (error) {
      setHasCar(false);
      carImageRef.current = null;
      setStatus(error instanceof Error ? error.message : "Er ging iets mis.");
    } finally {
      setBusy(false);
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void processFile(file);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) void processFile(file);
  }

  function onPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (!hasCar) return;
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const sx = OUTPUT_WIDTH / rect.width;
    const sy = OUTPUT_HEIGHT / rect.height;
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX * sx,
      y: event.clientY * sy,
      carX: car.x,
      carY: car.y,
    };
    canvas.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const sx = OUTPUT_WIDTH / rect.width;
    const sy = OUTPUT_HEIGHT / rect.height;
    setCar((current) => ({
      ...current,
      x: drag.carX + event.clientX * sx - drag.x,
      y: drag.carY + event.clientY * sy - drag.y,
    }));
  }

  function onPointerUp(event: PointerEvent<HTMLCanvasElement>) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  function resetCar() {
    setCar(INITIAL_CAR);
  }

  function download(format: "jpeg" | "png") {
    const canvas = canvasRef.current;
    if (!canvas || !hasCar) return;
    render();
    const ext = format === "jpeg" ? "jpg" : "png";
    const link = document.createElement("a");
    const safeName = (sourceName.replace(/\.[^.]+$/, "") || "auto").replace(/[^a-zA-Z0-9-_]+/g, "-");
    link.download = `volt-vroom-${safeName}-1920x1280.${ext}`;
    link.href = canvas.toDataURL(`image/${format}`, format === "jpeg" ? 0.94 : undefined);
    link.click();
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>VVOS · Photo Studio</p>
          <h1>Elke auto. Dezelfde Volt & Vroom-uitstraling.</h1>
          <p>De auto blijft origineel. Geen generatieve AI, geen retouche, geen kleurcorrectie — alleen vrijstaand maken, positioneren, schalen en roteren.</p>
        </div>
        <div className={styles.outputBadge}>1920 × 1280 px</div>
      </header>

      <div className={styles.grid}>
        <aside className={styles.controls}>
          <section className={styles.card}>
            <h2>1. Autofoto</h2>
            <label className={styles.dropzone} onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} disabled={busy} />
              <strong>{busy ? "Bezig…" : sourceName || "Sleep foto hierheen"}</strong>
              <span>of tik om een foto te kiezen</span>
            </label>
            <p className={styles.status}>{status}</p>
          </section>

          <section className={styles.card}>
            <h2>2. Plaatsing</h2>
            <label className={styles.controlRow}>
              <span>Grootte</span>
              <b>{Math.round(car.scale * 100)}%</b>
              <input type="range" min="0.55" max="1.35" step="0.01" value={car.scale} disabled={!hasCar} onChange={(e) => setCar((c) => ({ ...c, scale: Number(e.target.value) }))} />
            </label>
            <label className={styles.controlRow}>
              <span>Hoek</span>
              <b>{car.rotation.toFixed(1)}°</b>
              <input type="range" min="-8" max="8" step="0.1" value={car.rotation} disabled={!hasCar} onChange={(e) => setCar((c) => ({ ...c, rotation: Number(e.target.value) }))} />
            </label>
            <button className={styles.secondaryButton} onClick={resetCar} disabled={!hasCar}>Reset plaatsing</button>
            <p className={styles.hint}>Sleep de auto direct in de preview voor de juiste positie. De pixelinhoud van de auto wordt niet bewerkt.</p>
          </section>

          <section className={styles.card}>
            <h2>3. Export</h2>
            <button className={styles.primaryButton} onClick={() => download("jpeg")} disabled={!hasCar}>Download JPG</button>
            <button className={styles.secondaryButton} onClick={() => download("png")} disabled={!hasCar}>Download PNG</button>
            <p className={styles.hint}>JPG is de standaard voor de website. PNG is handig voor verdere opmaak.</p>
          </section>
        </aside>

        <section className={styles.previewCard}>
          <div className={styles.previewTopline}>
            <span>Vaste achtergrond · Volt & Vroom Automotive</span>
            <span>Websiteformaat</span>
          </div>
          <div className={styles.canvasWrap}>
            <canvas
              ref={canvasRef}
              width={OUTPUT_WIDTH}
              height={OUTPUT_HEIGHT}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className={hasCar ? styles.canvasActive : undefined}
            />
          </div>
          <div className={styles.guardrail}>
            <strong>Originaliteitsregel</strong>
            <span>Geen nieuwe velgen, lak, lampen, nummerplaten, carrosseriedelen of interieur. Alleen compositie.</span>
          </div>
        </section>
      </div>
    </main>
  );
}
