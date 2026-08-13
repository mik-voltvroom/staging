"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Lead, LeadStatus } from "@/types";
import { listLeads, saveLead } from "@/lib/repositories/lead-repository";
import { responseDeadline, scoreLead } from "@/lib/sales-engine";

const columns: { id: LeadStatus; label: string }[] = [
  { id: "new", label: "Nieuw" },
  { id: "contacted", label: "Contact" },
  { id: "qualified", label: "Gekwalificeerd" },
  { id: "appointment", label: "Afspraak" },
  { id: "won", label: "Gewonnen" },
  { id: "lost", label: "Verloren" },
];

export function SalesPipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listLeads()
      .then((items) => {
        setLeads(
          items.map((lead) => {
            const scored = scoreLead(lead);
            return {
              ...lead,
              sales:
                lead.sales ??
                {
                  ...scored,
                  responseDueAt: responseDeadline(
                    scored.score,
                    new Date(lead.createdAt ?? Date.now()),
                  ),
                },
            };
          }),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const hot = useMemo(
    () => leads.filter((lead) => lead.sales?.temperature === "hot").length,
    [leads],
  );

  async function move(lead: Lead, status: LeadStatus) {
    const next = { ...lead, status };
    setLeads((current) => current.map((item) => (item.id === lead.id ? next : item)));
    await saveLead(next);
  }

  if (loading) return <div className="panel">CRM laden…</div>;

  return (
    <>
      <div className="salesSummary">
        <div className="metric"><span>Hot leads</span><strong>{hot}</strong></div>
        <div className="metric"><span>Open pipeline</span><strong>{leads.filter((lead) => !["won", "lost"].includes(lead.status ?? "new")).length}</strong></div>
        <div className="metric"><span>Afspraken</span><strong>{leads.filter((lead) => lead.status === "appointment").length}</strong></div>
      </div>
      <div className="kanban">
        {columns.map((column) => (
          <section className="kanbanColumn" key={column.id}>
            <header><strong>{column.label}</strong><span>{leads.filter((lead) => (lead.status ?? "new") === column.id).length}</span></header>
            {leads
              .filter((lead) => (lead.status ?? "new") === column.id)
              .map((lead) => (
                <article className="leadCard" key={lead.id}>
                  <div className="leadMeta">
                    <span>{lead.channel}</span>
                    <span className={`temperature ${lead.sales?.temperature}`}>{lead.sales?.score ?? 0}</span>
                  </div>
                  <h3><Link href={`/dashboard/leads/${lead.id}`}>{lead.name}</Link></h3>
                  <p>{lead.message}</p>
                  <small>{lead.phone || lead.email}</small>
                  <label>
                    Fase
                    <select value={lead.status ?? "new"} onChange={(event) => move(lead, event.target.value as LeadStatus)}>
                      {columns.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
                    </select>
                  </label>
                </article>
              ))}
          </section>
        ))}
      </div>
    </>
  );
}
