import type { Invoice, InvoiceLine, VehicleCosts, VehicleProfitability, VatBreakdown } from "@/types";

export const roundMoney = (value:number) => Math.round((value + Number.EPSILON) * 100) / 100;
export function invoiceTotals(lines:InvoiceLine[]) {
  const subtotalEur = roundMoney(lines.reduce((s,l)=>s+l.quantity*l.unitPriceEur,0));
  const vatEur = roundMoney(lines.reduce((s,l)=>s+(l.quantity*l.unitPriceEur)*(l.vatPercent/100),0));
  return { subtotalEur, vatEur, totalEur: roundMoney(subtotalEur+vatEur) };
}
export function vatBreakdown(lines:InvoiceLine[]):VatBreakdown[]{
  const grouped = new Map<number,{net:number;vat:number}>();
  for(const l of lines){const net=l.quantity*l.unitPriceEur; const vat=net*l.vatPercent/100; const row=grouped.get(l.vatPercent)??{net:0,vat:0}; row.net+=net;row.vat+=vat;grouped.set(l.vatPercent,row)}
  return [...grouped.entries()].map(([rate,v])=>({rate,netEur:roundMoney(v.net),vatEur:roundMoney(v.vat),grossEur:roundMoney(v.net+v.vat)}));
}
export function invoiceOpenAmount(invoice:Invoice){return roundMoney(Math.max(0,invoice.totalEur-invoice.paidEur))}
export function isOverdue(invoice:Invoice, now=new Date()){return !["paid","cancelled"].includes(invoice.status)&&new Date(invoice.dueDate)<now}
export function directVehicleCosts(costs?:VehicleCosts){if(!costs)return 0;return Object.values(costs).reduce((s,v)=>s+v,0)}
export function vehicleProfit(input:Omit<VehicleProfitability,"grossContributionEur"|"contributionPercent">):VehicleProfitability{
  const grossContributionEur=roundMoney(input.salePriceEur-input.purchasePriceEur-input.directCostsEur-input.financeCostsEur-input.warrantyProvisionEur+input.tradeInMarginEur+input.upsellMarginEur);
  const contributionPercent=input.salePriceEur?roundMoney(grossContributionEur/input.salePriceEur*100):0;
  return {...input,grossContributionEur,contributionPercent};
}
export function agedReceivables(invoices:Invoice[], now=new Date()){
  const buckets={current:0,days1to30:0,days31to60:0,days61plus:0};
  for(const invoice of invoices.filter(i=>i.kind==="sales"&&invoiceOpenAmount(i)>0)){
    const due=new Date(invoice.dueDate); const days=Math.floor((now.getTime()-due.getTime())/86400000); const open=invoiceOpenAmount(invoice);
    if(days<=0)buckets.current+=open; else if(days<=30)buckets.days1to30+=open; else if(days<=60)buckets.days31to60+=open; else buckets.days61plus+=open;
  }
  return buckets;
}
