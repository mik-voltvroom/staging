import type { Deal, DealDocument, DeliveryTask, FinanceApplication, PaymentRecord, WarrantyPackage } from "@/types";

export const warrantyPackages: WarrantyPackage[] = [
  { id: "care-12", name: "Volt Care", months: 12, priceEur: 695, description: "12 maanden uitgebreide garantie en mobiliteit.", batteryCoverage: true, deductibleEur: 0 },
  { id: "care-24", name: "Volt Care Plus", months: 24, priceEur: 1195, description: "24 maanden uitgebreide garantie, accucontrole en mobiliteit.", batteryCoverage: true, deductibleEur: 0 },
  { id: "care-36", name: "Volt Care Premium", months: 36, priceEur: 1695, description: "36 maanden maximale zekerheid en jaarlijkse hybride check.", batteryCoverage: true, deductibleEur: 0 }
];

export const sampleDeals: Deal[] = [
  {
    id: "DEAL-2026-0042",
    leadId: "lead-001",
    quoteId: "Q-2026-014",
    vehicleId: "VV-2026-1001",
    customer: { name: "Sanne de Boer", email: "sanne@example.nl", phone: "0612345678", address: "Noorderhaven 12", postalCode: "9712VG", city: "Groningen" },
    status: "preparation",
    salePriceEur: 27950,
    tradeInCreditEur: 4500,
    accessoriesEur: 795,
    deliveryPackageEur: 995,
    warranty: warrantyPackages[1],
    depositRequiredEur: 1000,
    totalEur: 26435,
    financeStatus: "approved",
    registrationStatus: "documents_requested",
    plannedDeliveryAt: "2026-07-21T13:00:00.000Z",
    portalToken: "demo-sanne-0042",
    createdAt: "2026-07-12T10:00:00.000Z",
    updatedAt: "2026-07-14T09:45:00.000Z"
  }
];

export const sampleTasks: DeliveryTask[] = [
  { id: "task-1", dealId: "DEAL-2026-0042", category: "documents", title: "Koopovereenkomst laten ondertekenen", ownerRole: "sales", status: "done", completedAt: "2026-07-13T09:20:00.000Z" },
  { id: "task-2", dealId: "DEAL-2026-0042", category: "workshop", title: "Afleverbeurt en hybride systeemcheck", ownerRole: "workshop", status: "in_progress", dueAt: "2026-07-18T15:00:00.000Z" },
  { id: "task-3", dealId: "DEAL-2026-0042", category: "cleaning", title: "Professionele interieur- en exterieurreiniging", ownerRole: "workshop", status: "todo", dueAt: "2026-07-20T12:00:00.000Z" },
  { id: "task-4", dealId: "DEAL-2026-0042", category: "registration", title: "Tenaamstellingsgegevens controleren", ownerRole: "admin", status: "todo", dueAt: "2026-07-20T16:00:00.000Z" },
  { id: "task-5", dealId: "DEAL-2026-0042", category: "customer", title: "Klant bevestigt aflevermoment", ownerRole: "customer", status: "done", completedAt: "2026-07-14T09:30:00.000Z" }
];

export const samplePayments: PaymentRecord[] = [
  { id: "pay-1", dealId: "DEAL-2026-0042", type: "deposit", amountEur: 1000, status: "paid", provider: "bank", reference: "AANBETALING-0042", paidAt: "2026-07-13T10:11:00.000Z", createdAt: "2026-07-12T13:00:00.000Z" },
  { id: "pay-2", dealId: "DEAL-2026-0042", type: "balance", amountEur: 25435, status: "open", provider: "mollie", paymentUrl: "#", createdAt: "2026-07-14T08:00:00.000Z" }
];

export const sampleDocuments: DealDocument[] = [
  { id: "doc-1", dealId: "DEAL-2026-0042", type: "purchase_agreement", title: "Koopovereenkomst", status: "signed", url: "#", createdAt: "2026-07-12T12:00:00.000Z", signedAt: "2026-07-13T09:20:00.000Z" },
  { id: "doc-2", dealId: "DEAL-2026-0042", type: "warranty", title: "Volt Care Plus voorwaarden", status: "accepted", url: "#", createdAt: "2026-07-12T12:05:00.000Z" },
  { id: "doc-3", dealId: "DEAL-2026-0042", type: "invoice", title: "Pro-formafactuur", status: "generated", url: "#", createdAt: "2026-07-14T08:00:00.000Z" }
];

export const sampleFinance: FinanceApplication[] = [
  { id: "fin-1", dealId: "DEAL-2026-0042", provider: "Demo Finance", requestedAmountEur: 18000, downPaymentEur: 8435, termMonths: 60, monthlyPaymentEur: 361, status: "approved", consentAt: "2026-07-12T14:00:00.000Z", submittedAt: "2026-07-12T14:05:00.000Z" }
];
