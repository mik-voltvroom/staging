"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Vehicle } from "@/types";
import type { InspectionSession, WearableDeviceAdapter } from "@/lib/glasses/model";
import { inspectionProgress, reviewSummary } from "@/lib/glasses/business";
import { BrowserCameraAdapter, MockGlassesAdapter } from "@/lib/glasses/device";
import { listVehicles } from "@/lib/repositories/vehicle-repository";
import styles from "@/app/dashboard/voertuigcheck/glasses/glasses.module.css";

type QueueItem = { inspectionId: string; transcript: string; source: "voice" | "manual"; idempotencyKey: string };
type SessionPayload = { ok: boolean; error?: string; session?: InspectionSession; sessions?: InspectionSession[] };
type CommandPayload = SessionPayload & { responseText?: string; clientAction?: "capture_photo" };
type PreparePayload = { ok: boolean; error?: string; uploadUrl?: string; media?: { id: string } };
type MediaPayload = { ok: boolean; error?: string; url?: string };

type SpeechResult = { 0: { transcript: string } };
type SpeechEvent = { results: ArrayLike<SpeechResult> };
type SpeechRecognitionLike = { lang: string; interimResults: boolean; continuous: boolean; onresult: ((event: SpeechEvent) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start(): void; stop(): void };
type SpeechCtor = new () => SpeechRecognitionLike;
declare global { interface Window { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor } }

const QUEUE_KEY = "vvos.glasses.command-queue.v1";
const api = (id: string, suffix = "") => `/api/vvos/inspection-sessions/${id}${suffix}`;
const vehicleName = (vehicle: Vehicle) => `${vehicle.brand} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ""}`;
const euro = (cents: number) => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);

export function GlassesWorkspace({ devMode = false }: { devMode?: boolean }) {
  const adapter = useRef<WearableDeviceAdapter | null>(null);
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sessions, setSessions] = useState<InspectionSession[]>([]);
  const [session, setSession] = useState<InspectionSession | null>(null);
  const [vehicleId, setVehicleId] = useState("");
  const [query, setQuery] = useState("");
  const [command, setCommand] = useState("");
  const [connected, setConnected] = useState(false);
  const [online, setOnline] = useState(true);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Klaar voor CarCheck");
  const [error, setError] = useState("");

  useEffect(() => {
    adapter.current = devMode ? new MockGlassesAdapter() : new BrowserCameraAdapter();
    void Promise.all([
      listVehicles().then(setVehicles),
      fetch("/api/vvos/inspection-sessions", { cache: "no-store" }).then(async response => {
        const payload = await response.json() as SessionPayload;
        if (response.ok && payload.sessions) setSessions(payload.sessions);
      }),
    ]).catch(cause => setError(cause instanceof Error ? cause.message : "VVOS laden mislukt."));
    return () => { void adapter.current?.disconnect(); recognition.current?.stop(); };
  }, [devMode]);

  useEffect(() => {
    const up = () => { setOnline(true); void flushQueue(); };
    const down = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", up); window.addEventListener("offline", down);
    if (navigator.onLine) void flushQueue();
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);

  const selected = vehicles.find(vehicle => vehicle.id === vehicleId);
  const activeVehicle = session ? vehicles.find(vehicle => vehicle.id === session.vehicleId) : selected;
  const currentItem = session?.checklist.find(item => item.id === session.currentItemId);
  const progress = session ? inspectionProgress(session.checklist) : { completed: 0, total: 0, percent: 0 };
  const summary = session ? reviewSummary(session) : null;
  const device = adapter.current?.getSnapshot();
  const results = useMemo(() => {
    const needle = query.toLowerCase().replace(/[-\s]/g, "");
    return vehicles.filter(vehicle => !needle || [vehicle.licensePlate, vehicle.vin, vehicle.brand, vehicle.model, vehicle.trim, vehicle.id]
      .filter(Boolean).join(" ").toLowerCase().replace(/[-\s]/g, "").includes(needle)).slice(0, 8);
  }, [query, vehicles]);
  const openSessions = sessions.filter(item => ["active", "paused", "review"].includes(item.status)).slice(0, 4);

  async function connect() {
    setBusy(true); setError(""); setStatus("Brilinterface verbinden…");
    try { await adapter.current?.connect(); setConnected(true); setStatus("Camera en audio gereed"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Verbinden mislukt."); setStatus("Niet verbonden"); }
    finally { setBusy(false); }
  }

  async function startInspection() {
    if (!selected || !adapter.current) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/vvos/inspection-sessions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ vehicleId: selected.id, device: adapter.current.getSnapshot() }) });
      const payload = await response.json() as SessionPayload;
      if (!response.ok || !payload.session) throw new Error(payload.error || "Inspectie starten mislukt.");
      const created = payload.session;
      setSession(created); setSessions(items => [created, ...items]); setStatus("Luisteren…");
      await adapter.current.speak(`CarCheck gestart voor ${selected.brand} ${selected.model}.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Inspectie starten mislukt."); }
    finally { setBusy(false); }
  }

  function readQueue(): QueueItem[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]") as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap(value => {
        if (!value || typeof value !== "object") return [];
        const item = value as Partial<QueueItem>;
        if (!item.inspectionId || !item.transcript || (item.source !== "voice" && item.source !== "manual")) return [];
        return [{ inspectionId: item.inspectionId, transcript: item.transcript, source: item.source, idempotencyKey: item.idempotencyKey || crypto.randomUUID() }];
      });
    } catch { return []; }
  }
  function enqueue(item: QueueItem) { localStorage.setItem(QUEUE_KEY, JSON.stringify([...readQueue(), item].slice(-100))); }
  async function flushQueue() {
    if (!navigator.onLine) return;
    const pending = readQueue(); if (!pending.length) return;
    const remaining: QueueItem[] = [];
    for (const item of pending) {
      try {
        const response = await fetch(api(item.inspectionId, "/commands"), { method: "POST", headers: { "content-type": "application/json", "x-vvos-idempotency-key": item.idempotencyKey }, body: JSON.stringify({ transcript: item.transcript, source: item.source }) });
        if (!response.ok) remaining.push(item);
      } catch { remaining.push(item); }
    }
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    if (remaining.length !== pending.length) setStatus(`${pending.length - remaining.length} offline acties gesynchroniseerd`);
  }

  async function sendCommand(textValue: string, source: "voice" | "manual" = "manual") {
    const text = textValue.trim(); if (!text || !session) return;
    const idempotencyKey = crypto.randomUUID();
    if (!navigator.onLine) { enqueue({ inspectionId: session.id, transcript: text, source, idempotencyKey }); setStatus("Offline — actie staat in wachtrij"); return; }
    setBusy(true); setError(""); setStatus(source === "voice" ? "Verwerken…" : "Opslaan…");
    try {
      const response = await fetch(api(session.id, "/commands"), { method: "POST", headers: { "content-type": "application/json", "x-vvos-idempotency-key": idempotencyKey }, body: JSON.stringify({ transcript: text, source }) });
      const payload = await response.json() as CommandPayload;
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Commando verwerken mislukt.");
      if (payload.session) setSession(payload.session);
      setCommand(""); setStatus(payload.responseText || "Opgeslagen");
      if (payload.responseText) await adapter.current?.speak(payload.responseText);
      if (payload.clientAction === "capture_photo") await capturePhoto();
    } catch (cause) {
      if (cause instanceof TypeError) { enqueue({ inspectionId: session.id, transcript: text, source, idempotencyKey }); setStatus("Verbinding weg — actie veilig in wachtrij"); }
      else setError(cause instanceof Error ? cause.message : "Commando verwerken mislukt.");
    } finally { setBusy(false); }
  }

  async function capturePhoto() {
    if (!session || !adapter.current) return;
    if (!online) { setError("Foto-upload vereist in P0 een verbinding; observaties blijven offline beschikbaar."); return; }
    setBusy(true); setError(""); setStatus("Foto maken…");
    try {
      const capture = await adapter.current.capturePhoto();
      const prepareResponse = await fetch(api(session.id, "/media"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "prepare", kind: capture.kind, contentType: capture.file.type, capturedAt: capture.capturedAt, sourceDevice: adapter.current.getSnapshot().adapter }) });
      const prepared = await prepareResponse.json() as PreparePayload;
      if (!prepareResponse.ok || !prepared.uploadUrl || !prepared.media) throw new Error(prepared.error || "Upload voorbereiden mislukt.");
      const upload = await fetch(prepared.uploadUrl, { method: "PUT", headers: { "content-type": capture.file.type }, body: capture.file });
      if (!upload.ok) throw new Error("Foto-upload mislukt.");
      const confirmResponse = await fetch(api(session.id, "/media"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "confirm", mediaId: prepared.media.id, sizeBytes: capture.file.size }) });
      const confirmed = await confirmResponse.json() as SessionPayload;
      if (!confirmResponse.ok || !confirmed.session) throw new Error(confirmed.error || "Foto bevestigen mislukt.");
      setSession(confirmed.session); setStatus("Foto opgeslagen"); await adapter.current.speak("Foto opgeslagen.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Foto maken mislukt."); }
    finally { setBusy(false); }
  }

  function startListening() {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) { setError("Spraakherkenning is in deze browser niet beschikbaar. Gebruik het tekstveld of de native companion app."); return; }
    const speech = new Ctor(); speech.lang = "nl-NL"; speech.interimResults = false; speech.continuous = false;
    speech.onresult = event => { const transcript = event.results[event.results.length - 1]?.[0]?.transcript; if (transcript) void sendCommand(transcript, "voice"); };
    speech.onerror = () => { setListening(false); setError("Spraak kon niet betrouwbaar worden herkend."); };
    speech.onend = () => setListening(false);
    recognition.current = speech; setListening(true); setStatus("Luisteren…"); speech.start();
  }

  async function finish() {
    if (!session) return;
    const response = await fetch(api(session.id, "/complete"), { method: "POST" });
    const payload = await response.json() as SessionPayload;
    if (!response.ok || !payload.session) { setError(payload.error || "Afronden mislukt."); return; }
    setSession(payload.session); setStatus("CarCheck controleren");
  }
  async function reviewFinding(findingId: string, reviewStatus: "confirmed" | "dismissed") {
    if (!session) return;
    const response = await fetch(api(session.id, "/findings"), { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ findingId, reviewStatus }) });
    const payload = await response.json() as SessionPayload;
    if (response.ok && payload.session) setSession(payload.session); else setError(payload.error || "Bevinding aanpassen mislukt.");
  }
  async function openMedia(mediaId: string) {
    if (!session) return;
    const response = await fetch(`${api(session.id, "/media")}?mediaId=${encodeURIComponent(mediaId)}`);
    const payload = await response.json() as MediaPayload;
    if (!response.ok || !payload.url) { setError(payload.error || "Foto openen mislukt."); return; }
    window.open(payload.url, "_blank", "noopener,noreferrer");
  }
  async function setInspectionStatus(next: "active" | "completed") {
    if (!session) return;
    const response = await fetch(api(session.id), { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: next }) });
    const payload = await response.json() as SessionPayload;
    if (!response.ok || !payload.session) { setError(payload.error || "CarCheck aanpassen mislukt."); return; }
    setSession(payload.session); setStatus(next === "completed" ? "CarCheck definitief opgeslagen" : "Inspectie hervat");
  }

  return <main className={styles.shell}>
    <header className={styles.topbar}><div><span className={styles.eyebrow}>VVOS · CarCheck</span><h1>Glasses</h1></div><div className={`${styles.liveDot} ${connected ? styles.connected : ""}`}><i />{connected ? "Verbonden" : "Niet verbonden"}</div></header>
    {error && <div className={styles.error} role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Melding sluiten">×</button></div>}

    {!session && <>
      <section className={styles.deviceCard}><div className={styles.deviceIcon}>VV</div><div className={styles.deviceCopy}><span className={styles.eyebrow}>Device</span><h2>{device?.name ?? "VVOS Companion"}</h2><p>{connected ? "Camera en audio zijn gereed." : "Verbind de camera-interface voor een CarCheck."}</p></div><button className={styles.primaryButton} onClick={() => void connect()} disabled={busy}>{connected ? "Opnieuw verbinden" : "Verbinden"}</button><div className={styles.deviceStats}><span><i className={device?.capabilities.camera ? styles.ok : ""}/>Camera</span><span><i className={device?.capabilities.microphone ? styles.ok : ""}/>Audio</span><span><i className={online ? styles.ok : styles.warn}/>{online ? "Online" : "Offline"}</span>{device?.batteryPercent !== undefined && <span>{device.batteryPercent}% batterij</span>}</div></section>
      {openSessions.length > 0 && <section className={styles.section}><div className={styles.sectionHead}><div><span className={styles.eyebrow}>Verder waar u was</span><h2>Open inspecties</h2></div></div><div className={styles.resumeGrid}>{openSessions.map(item => { const vehicle = vehicles.find(v => v.id === item.vehicleId); return <button className={styles.resumeCard} key={item.id} onClick={() => { setSession(item); setVehicleId(item.vehicleId); setStatus(item.status === "review" ? "CarCheck controleren" : "Inspectie hervat"); }}><span>{item.status}</span><strong>{vehicle ? vehicleName(vehicle) : item.vehicleId}</strong><small>{vehicle?.licensePlate || "Geen kenteken"} · {inspectionProgress(item.checklist).percent}%</small></button>; })}</div></section>}
      <section className={styles.section}><div className={styles.sectionHead}><div><span className={styles.eyebrow}>Voertuig</span><h2>Start CarCheck</h2></div></div><input className={styles.search} value={query} onChange={event => setQuery(event.target.value)} placeholder="Kenteken, VIN of voertuig zoeken"/><div className={styles.vehicleList}>{results.map(vehicle => <button key={vehicle.id} className={`${styles.vehicleCard} ${vehicleId === vehicle.id ? styles.selected : ""}`} onClick={() => setVehicleId(vehicle.id)}><div><span className={styles.eyebrow}>{vehicle.driveType.replaceAll("-", " ")}</span><strong>{vehicleName(vehicle)}</strong><small>{vehicle.licensePlate || "Geen kenteken"} · {vehicle.mileageKm.toLocaleString("nl-NL")} km · {vehicle.year}</small></div><div><b>{euro(vehicle.priceCents)}</b><small>{vehicleId === vehicle.id ? "Geselecteerd" : "Selecteer"}</small></div></button>)}</div><button className={styles.primaryButtonWide} disabled={!selected || !connected || busy} onClick={() => void startInspection()}>Start inspectie</button></section>
    </>}

    {session && !["review", "completed"].includes(session.status) && <section className={styles.inspection}><div className={styles.vehicleHeader}><button className={styles.backButton} onClick={() => setSession(null)}>‹</button><div><span>{activeVehicle?.licensePlate || "Voertuig"}</span><strong>{activeVehicle ? vehicleName(activeVehicle) : session.vehicleId}</strong></div><div className={styles.progressText}><strong>{progress.completed}/{progress.total}</strong><span>CarCheck</span></div></div><div className={styles.progressBar}><i style={{ width: `${progress.percent}%` }}/></div><div className={styles.focusCard}><span className={styles.eyebrow}>{session.currentSection.replace("_", " / ")}</span><h2>{currentItem?.label || "CarCheck"}</h2><div className={`${styles.listenState} ${listening ? styles.listening : ""}`}><i/><strong>{status}</strong></div><p>Zeg wat u ziet. VVOS gebruikt het huidige onderdeel als context.</p></div><div className={styles.actionGrid}><button onClick={() => void capturePhoto()} disabled={busy}><span>◉</span><strong>Foto</strong></button><button onClick={startListening} disabled={busy || listening}><span>⌁</span><strong>{listening ? "Luistert" : "Spreek"}</strong></button><button onClick={() => void sendCommand("in orde")} disabled={busy}><span>✓</span><strong>Goed</strong></button><button onClick={() => void sendCommand("volgende onderdeel")} disabled={busy}><span>→</span><strong>Volgende</strong></button><button onClick={() => void sendCommand(session.status === "paused" ? "hervat inspectie" : "pauzeer inspectie")} disabled={busy}><span>Ⅱ</span><strong>{session.status === "paused" ? "Hervat" : "Pauze"}</strong></button></div><form className={styles.commandBar} onSubmit={event => { event.preventDefault(); void sendCommand(command); }}><input value={command} onChange={event => setCommand(event.target.value)} placeholder='Bijv. "Velg rechtsvoor lichte schade"'/><button disabled={busy || !command.trim()}>Opslaan</button></form><div className={styles.recent}><div><span className={styles.eyebrow}>Sessie</span><strong>{session.findings.length} bevindingen · {session.media.filter(item => item.status === "uploaded").length} foto’s</strong></div><button className={styles.stopButton} onClick={() => void finish()}>Stop &amp; controleer</button></div></section>}

    {session && ["review", "completed"].includes(session.status) && <section className={styles.review}><div className={styles.reviewHead}><div><span className={styles.eyebrow}>CarCheck controleren</span><h2>{activeVehicle ? vehicleName(activeVehicle) : "Voertuig"}</h2><p>{activeVehicle?.licensePlate || session.vehicleId} · {progress.completed} van {progress.total} gecontroleerd</p></div><div className={styles.score}>{progress.percent}<span>%</span></div></div>{summary && <div className={styles.summaryGrid}><div><strong>{summary.ok}</strong><span>OK</span></div><div><strong>{summary.attention}</strong><span>Aandacht</span></div><div><strong>{summary.repairs}</strong><span>Reparaties</span></div><div><strong>{summary.critical}</strong><span>Kritiek</span></div></div>}<div className={styles.findings}>{session.findings.filter(finding => finding.reviewStatus !== "dismissed").map(finding => <article key={finding.id}><div><span className={`${styles.severity} ${styles[finding.severity]}`}>{finding.severity}</span><h3>{finding.component}{finding.location ? ` · ${finding.location.replaceAll("_", " ")}` : ""}</h3><p>{finding.description}</p></div>{session.status === "review" && <div className={styles.findingActions}><button onClick={() => void reviewFinding(finding.id, "confirmed")}>Akkoord</button><button onClick={() => void reviewFinding(finding.id, "dismissed")}>Verwijderen</button></div>}</article>)}</div>{session.media.some(item => item.status === "uploaded") && <div className={styles.mediaStrip}>{session.media.filter(item => item.status === "uploaded").map((media, index) => <button key={media.id} onClick={() => void openMedia(media.id)}>Foto {index + 1}<span>Bekijken ↗</span></button>)}</div>}<div className={styles.reviewActions}>{session.status === "review" ? <><button className={styles.secondaryButton} onClick={() => void setInspectionStatus("active")}>Inspectie hervatten</button><button className={styles.primaryButton} onClick={() => void setInspectionStatus("completed")}>CarCheck opslaan</button></> : <><button className={styles.secondaryButton} onClick={() => setSession(null)}>Terug naar Glasses</button><div className={styles.completeBadge}>Definitief opgeslagen</div></>}</div><div className={styles.nextLayer}><span className={styles.eyebrow}>Volgende laag</span><strong>AI Vision, rapport en Purchase Intelligence</strong><p>P0 slaat hiervoor nu een echte, gestructureerde dataset op. Deze functies worden niet gesimuleerd.</p></div></section>}
  </main>;
}
