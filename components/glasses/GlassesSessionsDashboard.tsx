"use client";

import { useEffect, useMemo, useState } from "react";
import type { Vehicle } from "@/types";
import type { InspectionSession, InspectionStatus } from "@/lib/glasses/model";
import { inspectionProgress } from "@/lib/glasses/business";
import { listVehicles } from "@/lib/repositories/vehicle-repository";
import styles from "@/app/dashboard/voertuigcheck/glasses/sessions/sessions.module.css";

type Payload = { ok: boolean; error?: string; sessions?: InspectionSession[] };
const statusLabels: Record<InspectionStatus, string> = { draft: "Concept", active: "Actief", paused: "Gepauzeerd", processing: "Verwerken", review: "Controle", completed: "Afgerond", cancelled: "Geannuleerd" };

function sameDay(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

export function GlassesSessionsDashboard() {
  const [sessions, setSessions] = useState<InspectionSession[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState<InspectionStatus | "all">("all");
  const [inspector, setInspector] = useState("all");
  const [vehicleQuery, setVehicleQuery] = useState("");
  const [todayOnly, setTodayOnly] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([
      fetch("/api/vvos/inspection-sessions?limit=50", { cache: "no-store" }).then(async response => {
        const payload = await response.json() as Payload;
        if (!response.ok || !payload.sessions) throw new Error(payload.error || "Glasses sessies laden mislukt.");
        return payload.sessions;
      }),
      listVehicles(),
    ]).then(([sessionItems, vehicleItems]) => { setSessions(sessionItems); setVehicles(vehicleItems); }).catch(cause => setError(cause instanceof Error ? cause.message : "Sessies laden mislukt."));
  }, []);

  const vehicleMap = useMemo(() => new Map(vehicles.map(vehicle => [vehicle.id, vehicle])), [vehicles]);
  const inspectors = useMemo(() => [...new Map(sessions.map(session => [session.inspectorId, session.inspectorEmail || session.inspectorId])).entries()], [sessions]);
  const filtered = useMemo(() => {
    const needle = vehicleQuery.trim().toLowerCase().replace(/[-\s]/g, "");
    return sessions.filter(session => {
      if (todayOnly && !sameDay(session.startedAt)) return false;
      if (status !== "all" && session.status !== status) return false;
      if (inspector !== "all" && session.inspectorId !== inspector) return false;
      if (!needle) return true;
      const vehicle = vehicleMap.get(session.vehicleId);
      const haystack = [vehicle?.brand, vehicle?.model, vehicle?.trim, vehicle?.licensePlate, vehicle?.vin, session.vehicleId].filter(Boolean).join(" ").toLowerCase().replace(/[-\s]/g, "");
      return haystack.includes(needle);
    });
  }, [sessions, todayOnly, status, inspector, vehicleQuery, vehicleMap]);

  return <main className={`container ${styles.page}`}>
    <div className={styles.title}><div><span>VVOS · CarCheck</span><h1>Glasses Sessions</h1><p>Alle handsfree voertuiginspecties, centraal in VVOS.</p></div><a href="/dashboard/voertuigcheck/glasses">Start CarCheck</a></div>
    {error && <div className={styles.error}>{error}</div>}
    <section className={styles.filters}>
      <input value={vehicleQuery} onChange={event => setVehicleQuery(event.target.value)} placeholder="Voertuig, kenteken of VIN" />
      <select value={status} onChange={event => setStatus(event.target.value as InspectionStatus | "all")}><option value="all">Alle statussen</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select value={inspector} onChange={event => setInspector(event.target.value)}><option value="all">Alle medewerkers</option>{inspectors.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
      <label><input type="checkbox" checked={todayOnly} onChange={event => setTodayOnly(event.target.checked)} />Vandaag</label>
    </section>
    <section className={styles.metrics}><div><strong>{filtered.length}</strong><span>Sessies</span></div><div><strong>{filtered.filter(item => item.status === "completed").length}</strong><span>Afgerond</span></div><div><strong>{filtered.reduce((sum, item) => sum + item.media.filter(media => media.status === "uploaded").length, 0)}</strong><span>Media</span></div><div><strong>{filtered.reduce((sum, item) => sum + item.findings.filter(finding => finding.reviewStatus !== "dismissed").length, 0)}</strong><span>Bevindingen</span></div></section>
    <div className={styles.tableWrap}><table><thead><tr><th>Datum</th><th>Voertuig</th><th>Medewerker</th><th>Duur</th><th>Foto's</th><th>Findings</th><th>Voortgang</th><th>Status</th></tr></thead><tbody>{filtered.map(session => { const vehicle = vehicleMap.get(session.vehicleId); const progress = inspectionProgress(session.checklist); const end = new Date(session.completedAt || session.updatedAt).getTime(); const durationMinutes = Math.max(0, Math.round((end - new Date(session.startedAt).getTime()) / 60000)); return <tr key={session.id}><td><strong>{new Date(session.startedAt).toLocaleDateString("nl-NL")}</strong><small>{new Date(session.startedAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</small></td><td><strong>{vehicle ? `${vehicle.brand} ${vehicle.model}` : session.vehicleId}</strong><small>{vehicle?.licensePlate || vehicle?.vin || "Geen kenteken"}</small></td><td>{session.inspectorEmail || session.inspectorId}</td><td>{durationMinutes} min</td><td>{session.media.filter(media => media.status === "uploaded").length}</td><td>{session.findings.filter(finding => finding.reviewStatus !== "dismissed").length}</td><td>{progress.completed}/{progress.total} · {progress.percent}%</td><td><span className={`${styles.status} ${styles[`status_${session.status}`]}`}>{statusLabels[session.status]}</span></td></tr>; })}{!filtered.length && <tr><td colSpan={8} className={styles.empty}>Geen Glasses-sessies binnen deze filters.</td></tr>}</tbody></table></div>
  </main>;
}
