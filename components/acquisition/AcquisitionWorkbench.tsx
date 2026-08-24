"use client";
import { useMemo, useState } from "react";
import { analyseAcquisition, type AcquisitionCandidate } from "@/lib/acquisition-engine";

const initial: AcquisitionCandidate = { brand:"Toyota", model:"Corolla Touring Sports 1.8 Hybrid", year:2022, mileageKm:62000, askingPriceEur:20850, expectedRetailEur:24450, preparationEur:550, transportEur:150, warrantyReserveEur:300, otherCostsEur:100, expectedDaysToSell:22, comparableSupply:14, demandScore:84, vvFitScore:94 };
const euro = new Intl.NumberFormat("nl-NL", { style:"currency", currency:"EUR", maximumFractionDigits:0 });

export function AcquisitionWorkbench(){
 const [c,setC]=useState(initial); const r=useMemo(()=>analyseAcquisition(c),[c]);
 const setNum=(key:keyof AcquisitionCandidate)=>(e:React.ChangeEvent<HTMLInputElement>)=>setC(v=>({...v,[key]:Number(e.target.value)}));
 const setText=(key:"brand"|"model")=>(e:React.ChangeEvent<HTMLInputElement>)=>setC(v=>({...v,[key]:e.target.value}));
 return <div className="acqGrid">
  <section className="panel"><p className="eyebrow">Kandidaat</p><h2>Analyseer een inkoop</h2><div className="acqForm">
   <label>Merk<input value={c.brand} onChange={setText("brand")}/></label><label>Model / uitvoering<input value={c.model} onChange={setText("model")}/></label>
   <label>Bouwjaar<input type="number" value={c.year} onChange={setNum("year")}/></label><label>Kilometerstand<input type="number" value={c.mileageKm} onChange={setNum("mileageKm")}/></label>
   <label>Vraagprijs €<input type="number" value={c.askingPriceEur} onChange={setNum("askingPriceEur")}/></label><label>Verwachte retail €<input type="number" value={c.expectedRetailEur} onChange={setNum("expectedRetailEur")}/></label>
   <label>Voorbereiding €<input type="number" value={c.preparationEur} onChange={setNum("preparationEur")}/></label><label>Transport €<input type="number" value={c.transportEur} onChange={setNum("transportEur")}/></label>
   <label>Garantiereserve €<input type="number" value={c.warrantyReserveEur} onChange={setNum("warrantyReserveEur")}/></label><label>Overige kosten €<input type="number" value={c.otherCostsEur} onChange={setNum("otherCostsEur")}/></label>
   <label>Verwachte statijd<input type="number" value={c.expectedDaysToSell} onChange={setNum("expectedDaysToSell")}/></label><label>Vergelijkbaar aanbod<input type="number" value={c.comparableSupply} onChange={setNum("comparableSupply")}/></label>
   <label>Vraagscore 0–100<input type="number" min="0" max="100" value={c.demandScore} onChange={setNum("demandScore")}/></label><label>VV-fit 0–100<input type="number" min="0" max="100" value={c.vvFitScore} onChange={setNum("vvFitScore")}/></label>
  </div></section>
  <section className="panel acqResult"><p className="eyebrow">VV Acquisition Intelligence</p><div className="acqScore"><strong>{r.buyScore}</strong><span>/100</span></div><h2>{r.decision}</h2><p className="muted">{c.brand} {c.model} · {c.year} · {c.mileageKm.toLocaleString("nl-NL")} km</p>
   <div className="metrics"><div className="metric"><span>Doelbod</span><strong>{euro.format(r.targetBidEur)}</strong></div><div className="metric"><span>Maximaal bod</span><strong>{euro.format(r.maxBidEur)}</strong></div><div className="metric"><span>Marge</span><strong>{euro.format(r.expectedMarginEur)}</strong></div><div className="metric"><span>Winst / voorraaddag</span><strong>{euro.format(r.grossProfitPerStockDay)}</strong></div></div>
   <div className="acqProbability"><strong>{r.probabilitySoldWithin30Days}%</strong><span>verwachte kans verkocht binnen 30 dagen</span></div><ul>{r.reasons.map(x=><li key={x}>{x}</li>)}</ul>
   <p className="muted"><small>MVP-score op ingevoerde marktparameters. Voor productie worden marktprijs, vraag, aanbod en statijd automatisch uit databronnen gevoed en gekalibreerd met eigen VV-transacties.</small></p>
  </section>
 </div>
}
