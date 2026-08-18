import { z } from "zod";
import type { Deal, DealStatus, DeliveryTask } from "@/types";
import { assertEurocents } from "@/lib/money";

const cents = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);

export const dealCreateSchema = z.object({
  leadId: z.string().trim().min(1).max(128),
  quoteId: z.string().trim().min(1).max(128).optional(),
  vehicleId: z.string().trim().min(1).max(128),
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254).optional(),
    phone: z.string().trim().min(8).max(40).optional(),
    address: z.string().trim().max(200).optional(),
    postalCode: z.string().trim().max(16).optional(),
    city: z.string().trim().max(120).optional(),
  }).strict(),
  salePriceCents: cents,
  tradeInCreditCents: cents.default(0),
  accessoriesCents: cents.default(0),
  deliveryPackageCents: cents.default(0),
  warranty: z.object({
    id: z.string().trim().min(1).max(128),
    name: z.string().trim().min(1).max(120),
    months: z.number().int().positive().max(120),
    priceCents: cents,
    description: z.string().trim().max(500),
    batteryCoverage: z.boolean(),
    deductibleCents: cents,
  }).strict().optional(),
  depositRequiredCents: cents.default(0),
  plannedDeliveryAt: z.string().datetime().optional(),
}).strict().superRefine((value, context) => {
  const total = value.salePriceCents - value.tradeInCreditCents + value.accessoriesCents + value.deliveryPackageCents + (value.warranty?.priceCents ?? 0);
  if (total < 0) context.addIssue({ code: z.ZodIssueCode.custom, path: ["tradeInCreditCents"], message: "Inruilwaarde kan het berekende dealtotaal niet negatief maken." });
  if (value.depositRequiredCents > Math.max(0, total)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["depositRequiredCents"], message: "Vereiste aanbetaling kan niet hoger zijn dan het dealtotaal." });
});

export type DealCreateInput = z.infer<typeof dealCreateSchema>;

export function calculateDealTotalCents(input: Pick<DealCreateInput, "salePriceCents" | "tradeInCreditCents" | "accessoriesCents" | "deliveryPackageCents" | "warranty">): number {
  const total = input.salePriceCents
    - input.tradeInCreditCents
    + input.accessoriesCents
    + input.deliveryPackageCents
    + (input.warranty?.priceCents ?? 0);
  return assertEurocents(total, "totalCents");
}

export function buildDeal(input: DealCreateInput, now = new Date()): Deal {
  const timestamp = now.toISOString();
  return {
    ...input,
    id: `DEAL-${crypto.randomUUID()}`,
    status: "draft",
    totalCents: calculateDealTotalCents(input),
    financeStatus: "not_requested",
    registrationStatus: "not_started",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

const defaultTasks = [
  ["documents", "Koopovereenkomst laten ondertekenen", "sales"],
  ["workshop", "Afleverbeurt en voertuigcontrole", "workshop"],
  ["cleaning", "Interieur- en exterieurreiniging", "workshop"],
  ["registration", "Tenaamstelling afronden", "admin"],
  ["customer", "Aflevermoment met klant bevestigen", "customer"],
] as const;

export function buildDefaultDeliveryTasks(dealId: string): DeliveryTask[] {
  return defaultTasks.map(([category, title, ownerRole]) => ({
    id: `TASK-${crypto.randomUUID()}`,
    dealId,
    category,
    title,
    ownerRole,
    status: "todo",
  }));
}

const transitions: Record<DealStatus, readonly DealStatus[]> = {
  draft: ["awaiting_signature", "cancelled"],
  awaiting_signature: ["signed", "cancelled"],
  signed: ["payment_pending", "cancelled"],
  payment_pending: ["paid", "cancelled"],
  paid: ["registration", "cancelled"],
  registration: ["preparation", "cancelled"],
  preparation: ["ready", "cancelled"],
  ready: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function canTransitionDeal(from: DealStatus, to: DealStatus): boolean {
  return transitions[from].includes(to);
}
