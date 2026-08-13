import Link from "next/link";
import { sampleDeals, sampleTasks, samplePayments } from "@/lib/deal/sample-data";
import { dealProgress, openBalance } from "@/lib/deal/business";
export function DeliveryBoard(){ return <div className="recordGrid">{sampleDeals.map(deal=>{const paid=samplePayments.filter(p=>p.dealId===deal.id&&p.status==="paid").reduce((s,p)=>s+p.amountEur,0); return <Link className="panel deliveryCard" href={`/dashboard/deals/${deal.id}`} key={deal.id}><span className="eyebrow">{deal.id}</span><h3>{deal.customer.name}</h3><p>{deal.vehicleId}</p><div className="progressBar"><i style={{width:`${dealProgress(deal,sampleTasks)}%`}} /></div><small>{dealProgress(deal,sampleTasks)}% gereed · € {openBalance(deal,paid).toLocaleString("nl-NL")} open</small></Link>})}</div> }
