import type { Deal, DealDocument, DeliveryTask, FinanceApplication, PaymentRecord } from "@/types";
import { adminDb } from "@/lib/firebase-admin";
import { sampleDeals, sampleDocuments, sampleFinance, samplePayments, sampleTasks } from "@/lib/deal/sample-data";
import { buildDeal, buildDefaultDeliveryTasks, canTransitionDeal, type DealCreateInput } from "@/lib/deal/model";
import { assertEurocents, eurosToCents } from "@/lib/money";

export class DealRepositoryUnavailableError extends Error {}
export class DealNotFoundError extends Error {}
export class InvalidDealTransitionError extends Error {}
export class DealReadinessError extends Error {}
export class DeliveryTaskNotFoundError extends Error {}
export class InvalidDeliveryTaskTransitionError extends Error {}

function firebaseMode(): boolean {
  return process.env.VVOS_DATA_MODE === "firebase";
}

function requireDb() {
  if (!firebaseMode() || !adminDb) throw new DealRepositoryUnavailableError("Dealrepository is niet beschikbaar.");
  return adminDb;
}

function normalizedCents(record: Record<string, unknown>, centsField: string, legacyEuroField: string): number {
  if (typeof record[centsField] === "number") return assertEurocents(record[centsField], centsField);
  if (typeof record[legacyEuroField] === "number") return eurosToCents(record[legacyEuroField], legacyEuroField);
  throw new Error(`Financieel veld ${centsField} ontbreekt.`);
}

function normalizeWarranty(value: unknown): Deal["warranty"] {
  if (!value || typeof value !== "object") return undefined;
  const record = { ...(value as Record<string, unknown>) };
  record.priceCents = normalizedCents(record, "priceCents", "priceEur");
  record.deductibleCents = normalizedCents(record, "deductibleCents", "deductibleEur");
  delete record.priceEur;
  delete record.deductibleEur;
  return record as unknown as Deal["warranty"];
}

export function normalizeDealDocument(id: string, value: Record<string, unknown>): Deal {
  const record: Record<string, unknown> = { ...value, id };
  for (const [centsField, euroField] of [
    ["salePriceCents", "salePriceEur"],
    ["tradeInCreditCents", "tradeInCreditEur"],
    ["accessoriesCents", "accessoriesEur"],
    ["deliveryPackageCents", "deliveryPackageEur"],
    ["depositRequiredCents", "depositRequiredEur"],
    ["totalCents", "totalEur"],
  ] as const) {
    record[centsField] = normalizedCents(record, centsField, euroField);
    delete record[euroField];
  }
  record.warranty = normalizeWarranty(record.warranty);
  return record as unknown as Deal;
}

function normalizePaymentDocument(id: string, value: Record<string, unknown>): PaymentRecord {
  const record: Record<string, unknown> = { ...value, id };
  record.amountCents = normalizedCents(record, "amountCents", "amountEur");
  delete record.amountEur;
  return record as unknown as PaymentRecord;
}

function normalizeFinanceDocument(id: string, value: Record<string, unknown>): FinanceApplication {
  const record: Record<string, unknown> = { ...value, id };
  for (const [centsField, euroField] of [
    ["requestedAmountCents", "requestedAmountEur"],
    ["downPaymentCents", "downPaymentEur"],
  ] as const) {
    record[centsField] = normalizedCents(record, centsField, euroField);
    delete record[euroField];
  }
  if (record.monthlyPaymentCents !== undefined || record.monthlyPaymentEur !== undefined) {
    record.monthlyPaymentCents = normalizedCents(record, "monthlyPaymentCents", "monthlyPaymentEur");
  }
  delete record.monthlyPaymentEur;
  return record as unknown as FinanceApplication;
}

export async function listDeals(): Promise<Deal[]> {
  if (!firebaseMode()) return sampleDeals;
  const snapshot = await requireDb().collection("deals").orderBy("createdAt", "desc").get();
  return snapshot.docs.map(document => normalizeDealDocument(document.id, document.data()));
}

export async function listDeliveryOverview(): Promise<{ deals: Deal[]; tasks: DeliveryTask[]; payments: PaymentRecord[] }> {
  if (!firebaseMode()) return { deals: sampleDeals, tasks: sampleTasks, payments: samplePayments };
  const db = requireDb();
  const [deals, tasks, payments] = await Promise.all([
    db.collection("deals").orderBy("createdAt", "desc").get(),
    db.collection("deliveryTasks").get(),
    db.collection("payments").get(),
  ]);
  return {
    deals: deals.docs.map(document => normalizeDealDocument(document.id, document.data())),
    tasks: tasks.docs.map(document => ({ id: document.id, ...document.data() }) as DeliveryTask),
    payments: payments.docs.map(document => normalizePaymentDocument(document.id, document.data())),
  };
}

export async function getDealBundle(id: string): Promise<{ deal: Deal; tasks: DeliveryTask[]; payments: PaymentRecord[]; documents: DealDocument[]; finance?: FinanceApplication } | null> {
  if (!firebaseMode()) {
    const deal = sampleDeals.find(item => item.id === id);
    if (!deal) return null;
    return {
      deal,
      tasks: sampleTasks.filter(item => item.dealId === id),
      payments: samplePayments.filter(item => item.dealId === id),
      documents: sampleDocuments.filter(item => item.dealId === id),
      finance: sampleFinance.find(item => item.dealId === id),
    };
  }

  const db = requireDb();
  const [dealDocument, tasks, payments, documents, finance] = await Promise.all([
    db.collection("deals").doc(id).get(),
    db.collection("deliveryTasks").where("dealId", "==", id).get(),
    db.collection("payments").where("dealId", "==", id).get(),
    db.collection("dealDocuments").where("dealId", "==", id).get(),
    db.collection("financeApplications").where("dealId", "==", id).limit(1).get(),
  ]);
  if (!dealDocument.exists) return null;
  return {
    deal: normalizeDealDocument(dealDocument.id, dealDocument.data() ?? {}),
    tasks: tasks.docs.map(document => ({ id: document.id, ...document.data() }) as DeliveryTask),
    payments: payments.docs.map(document => normalizePaymentDocument(document.id, document.data())),
    documents: documents.docs.map(document => ({ id: document.id, ...document.data() }) as DealDocument),
    finance: finance.empty ? undefined : normalizeFinanceDocument(finance.docs[0].id, finance.docs[0].data()),
  };
}

export async function createDealWithDelivery(input: DealCreateInput): Promise<{ deal: Deal; tasks: DeliveryTask[] }> {
  const db = requireDb();
  const deal = buildDeal(input);
  const tasks = buildDefaultDeliveryTasks(deal.id);
  await db.runTransaction(async transaction => {
    transaction.create(db.collection("deals").doc(deal.id), deal);
    for (const task of tasks) transaction.create(db.collection("deliveryTasks").doc(task.id), task);
  });
  return { deal, tasks };
}

export async function updateDealStatus(id: string, nextStatus: Deal["status"]): Promise<Deal> {
  const db = requireDb();
  return db.runTransaction(async transaction => {
    const reference = db.collection("deals").doc(id);
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists) throw new DealNotFoundError("Deal niet gevonden.");
    const deal = normalizeDealDocument(snapshot.id, snapshot.data() ?? {});
    if (!canTransitionDeal(deal.status, nextStatus)) {
      throw new InvalidDealTransitionError(`Overgang ${deal.status} -> ${nextStatus} is niet toegestaan.`);
    }
    if (nextStatus === "delivered") {
      const [tasks, payments] = await Promise.all([
        transaction.get(db.collection("deliveryTasks").where("dealId", "==", id)),
        transaction.get(db.collection("payments").where("dealId", "==", id)),
      ]);
      const tasksComplete = !tasks.empty && tasks.docs.every(document => document.data().status === "done");
      const paidCents = payments.docs.reduce((sum, document) => {
        const payment = document.data() as PaymentRecord;
        if (payment.status !== "paid") return sum;
        return sum + (payment.type === "refund" ? -payment.amountCents : payment.amountCents);
      }, 0);
      if (deal.registrationStatus !== "completed" || !tasksComplete || paidCents < deal.totalCents) {
        throw new DealReadinessError("Aflevering vereist voltooide tenaamstelling, volledige betaling en een afgeronde checklist.");
      }
    }
    const updated = { ...deal, status: nextStatus, updatedAt: new Date().toISOString() };
    transaction.update(reference, { status: nextStatus, updatedAt: updated.updatedAt });
    return updated;
  });
}

const deliveryTaskTransitions: Record<DeliveryTask["status"], readonly DeliveryTask["status"][]> = {
  todo: ["in_progress", "blocked"],
  in_progress: ["todo", "done", "blocked"],
  done: ["in_progress"],
  blocked: ["todo", "in_progress"],
};

export async function updateDeliveryTaskStatus(id: string, nextStatus: DeliveryTask["status"]): Promise<DeliveryTask> {
  const db = requireDb();
  return db.runTransaction(async transaction => {
    const reference = db.collection("deliveryTasks").doc(id);
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists) throw new DeliveryTaskNotFoundError("Aflevertaak niet gevonden.");
    const task = { id: snapshot.id, ...snapshot.data() } as DeliveryTask;
    const dealSnapshot = await transaction.get(db.collection("deals").doc(task.dealId));
    if (!dealSnapshot.exists) throw new DealNotFoundError("Bijbehorende deal niet gevonden.");
    const deal = dealSnapshot.data() as Deal;
    if (deal.status === "delivered" || deal.status === "cancelled") {
      throw new InvalidDeliveryTaskTransitionError("Aflevertaken van een afgesloten deal kunnen niet worden gewijzigd.");
    }
    if (!deliveryTaskTransitions[task.status].includes(nextStatus)) {
      throw new InvalidDeliveryTaskTransitionError(`Overgang ${task.status} -> ${nextStatus} is niet toegestaan.`);
    }
    const completedAt = nextStatus === "done" ? new Date().toISOString() : null;
    transaction.update(reference, { status: nextStatus, completedAt });
    return { ...task, status: nextStatus, completedAt: completedAt ?? undefined };
  });
}
