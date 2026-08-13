import { z } from "zod";
import { createServerDocument, productionDataEnabled } from "@/lib/repositories/server-collection";
import { scoreLead, responseDeadline } from "@/lib/sales-engine";

const leadSchema = z.object({
  vehicleId: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  channel: z.enum(["website", "whatsapp", "phone", "merchant", "other"]).default("website"),
  message: z.string().max(2000).optional(),
  consent: z.literal(true),
  budgetEur: z.number().nonnegative().optional(),
  financingNeeded: z.boolean().optional(),
  hasTradeIn: z.boolean().optional(),
}).refine(data => data.email || data.phone, { message: "E-mail of telefoonnummer is verplicht." });

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) return Response.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });

  const id = `LEAD-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const sales = scoreLead(parsed.data);
  const lead = await createServerDocument("leads", id, {
    ...parsed.data,
    status: "new",
    sales: { ...sales, responseDueAt: responseDeadline(sales.score) },
    createdAt: now,
    updatedAt: now,
  });
  return Response.json({ ok: true, mode: productionDataEnabled() ? "firebase" : "demo", lead }, { status: 201 });
}
