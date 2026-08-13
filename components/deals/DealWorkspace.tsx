"use client";
import { useMemo, useState } from "react";
import type { Deal, DealDocument, DeliveryTask, FinanceApplication, PaymentRecord } from "@/types";
import { canDeliver, dealProgress, openBalance } from "@/lib/deal/business";

const euro = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function DealWorkspace({ deal, initialTasks, payments, documents, finance }: { deal: Deal; initialTasks: DeliveryTask[]; payments: PaymentRecord[]; documents: DealDocument[]; finance?: FinanceApplication }) {
  const [tasks, setTasks] = useState(initialTasks);
  const paid = payments.filter(p => p.status === "paid" && p.type !== "refund").reduce((s,p)=>s+p.amountEur,0);
  const balance = openBalance(deal, paid);
  const progress = dealProgress(deal, tasks);
  const ready = canDeliver(deal, tasks, balance);
  function cycle(id:string){ setTasks(prev=>prev.map(t=>t.id===id?{...t,status:t.status==="todo"?"in_progress":t.status==="in_progress"?"done":"todo"}:t)); }
  return <div className="dealWorkspace">
    <section className="dealHero panel">
      <div><span className="eyebrow">{deal.id}</span><h1>{deal.customer.name}</h1><p className="muted">Voertuig {deal.vehicleId} · levering {deal.plannedDeliveryAt ? new Date(deal.plannedDeliveryAt).toLocaleString("nl-NL") : "nog niet gepland"}</p></div>
      <div className={`dealReadiness ${ready?"ready":"pending"}`}><strong>{progress}%</strong><span>{ready?"Klaar voor aflevering":"In voorbereiding"}</span></div>
    </section>
    <div className="metrics">
      <div className="metric"><span>Totaal</span><strong>{euro.format(deal.totalEur)}</strong></div>
      <div className="metric"><span>Betaald</span><strong>{euro.format(paid)}</strong></div>
      <div className="metric"><span>Openstaand</span><strong>{euro.format(balance)}</strong></div>
      <div className="metric"><span>Garantie</span><strong>{deal.warranty?.months || 0} mnd</strong></div>
    </div>
    <div className="workspaceGrid">
      <section className="panel"><div className="panelHeader"><div><span className="eyebrow">Afleverflow</span><h2>Checklist</h2></div><span className="statusPill">{tasks.filter(t=>t.status==="done").length}/{tasks.length}</span></div>
        <div className="deliveryTasks">{tasks.map(t=><button type="button" className={`deliveryTask ${t.status}`} key={t.id} onClick={()=>cycle(t.id)}><span>{t.status==="done"?"✓":t.status==="in_progress"?"…":"○"}</span><div><strong>{t.title}</strong><small>{t.category} · {t.ownerRole}</small></div></button>)}</div>
      </section>
      <div className="stack">
        <section className="panel"><span className="eyebrow">Betaling</span><h2>Transacties</h2>{payments.map(p=><div className="miniRecord" key={p.id}><strong>{p.type} · {euro.format(p.amountEur)}</strong><span>{p.status} via {p.provider}</span></div>)}<button className="button wide" type="button">Betaallink aanmaken</button></section>
        <section className="panel"><span className="eyebrow">Financiering</span><h2>{finance?.status || "Niet aangevraagd"}</h2>{finance && <><p>{euro.format(finance.requestedAmountEur)} · {finance.termMonths} maanden</p><p className="muted">Indicatie {euro.format(finance.monthlyPaymentEur || 0)} per maand</p></>}</section>
      </div>
    </div>
    <section className="panel"><div className="panelHeader"><div><span className="eyebrow">Dossier</span><h2>Documenten</h2></div><button className="button secondary" type="button">Document genereren</button></div><div className="documentGrid">{documents.map(d=><article key={d.id}><span>{d.type}</span><strong>{d.title}</strong><small>{d.status}</small></article>)}</div></section>
  </div>
}
