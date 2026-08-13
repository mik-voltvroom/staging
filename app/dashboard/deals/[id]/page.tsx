export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { DealWorkspace } from "@/components/deals/DealWorkspace";
import { sampleDeals,sampleDocuments,sampleFinance,samplePayments,sampleTasks } from "@/lib/deal/sample-data";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params; const deal=sampleDeals.find(d=>d.id===id); if(!deal) notFound(); return <main className="dashboardPage container"><DealWorkspace deal={deal} initialTasks={sampleTasks.filter(t=>t.dealId===id)} payments={samplePayments.filter(p=>p.dealId===id)} documents={sampleDocuments.filter(d=>d.dealId===id)} finance={sampleFinance.find(f=>f.dealId===id)}/></main>}
