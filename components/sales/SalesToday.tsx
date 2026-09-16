"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Lead } from "@/types";
import type { SalesTask } from "@/lib/sales-task-engine";
import { nextTaskForLead, sortSalesTasks, taskIsOverdue } from "@/lib/sales-task-engine";
import { listLeads } from "@/lib/repositories/lead-repository";
import { completeSalesTask, listSalesTasks, saveSalesTask } from "@/lib/repositories/sales-task-repository";

export function SalesToday() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<SalesTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listLeads(), listSalesTasks()]).then(async ([leadItems, taskItems]) => {
      const openIds = new Set(taskItems.filter(task => task.status === "open").map(task => task.id));
      const generated = leadItems.map(lead => nextTaskForLead(lead)).filter((task): task is SalesTask => Boolean(task));
      const missing = generated.filter(task => !openIds.has(task.id));
      await Promise.all(missing.map(saveSalesTask));
      setLeads(leadItems);
      setTasks(sortSalesTasks([...taskItems, ...missing]));
    }).finally(() => setLoading(false));
  }, []);

  const open = useMemo(() => sortSalesTasks(tasks.filter(task => task.status === "open")), [tasks]);
  const overdue = open.filter(task => taskIsOverdue(task)).length;
  const hot = leads.filter(lead => lead.sales?.temperature === "hot").length;

  async function finish(task: SalesTask) {
    const completed = await completeSalesTask(task);
    setTasks(current => current.map(item => item.id === completed.id ? completed : item));
  }

  if (loading) return <section className="panel">Sales cockpit laden…</section>;

  return <section className="panel">
    <div className="panelHeader"><div><p className="eyebrow">Morning sales intelligence · fase 1</p><h2>Wat levert vandaag verkoop op?</h2></div><Link href="/dashboard/leads">Open pipeline →</Link></div>
    <div className="salesSummary">
      <div className="metric"><span>Open acties</span><strong>{open.length}</strong></div>
      <div className="metric"><span>Te laat</span><strong>{overdue}</strong></div>
      <div className="metric"><span>Hot leads</span><strong>{hot}</strong></div>
      <div className="metric"><span>Afspraken</span><strong>{leads.filter(lead => lead.status === "appointment").length}</strong></div>
    </div>
    <div className="recentList">
      {open.slice(0, 8).map(task => <div key={task.id} className="salesTaskRow">
        <span><strong>{task.title}</strong><small>{task.priority.toUpperCase()} · uiterlijk {new Date(task.dueAt).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" })}</small></span>
        <span><Link className="textLink" href={`/dashboard/leads/${task.leadId}`}>Lead →</Link> <button className="button secondary" onClick={() => finish(task)}>Gereed</button></span>
      </div>)}
      {open.length === 0 && <p className="muted">Geen open salesacties. Pipeline is bijgewerkt.</p>}
    </div>
  </section>;
}
