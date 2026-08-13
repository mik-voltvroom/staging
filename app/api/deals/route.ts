import { NextResponse } from "next/server";
import { z } from "zod";
import { sampleDeals } from "@/lib/deal/sample-data";
import { authorizeApi } from "@/lib/auth/api";
import { writeAuditEvent } from "@/lib/audit/audit-log";

const dealSchema = z.object({
  leadId: z.string().min(1),
  vehicleId: z.string().min(1),
  customer: z.object({ name: z.string().min(2), email: z.string().email().optional(), phone: z.string().optional() }),
  salePriceEur: z.number().nonnegative().optional(),
}).passthrough();

export async function GET(request: Request) {
  const auth = await authorizeApi(request, "deals.read");
  if (auth.response) return auth.response;
  return NextResponse.json({ deals: sampleDeals });
}

export async function POST(request: Request) {
  const auth = await authorizeApi(request, "deals.write");
  if (auth.response) return auth.response;
  const parsed = dealSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige deal", issues: parsed.error.flatten() }, { status: 400 });
  const id = `DEAL-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
  const deal = { ...parsed.data, id, status: "draft", portalToken: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await writeAuditEvent({ action: "deal.created", entityType: "deal", entityId: id, actor: auth.actor, metadata: { leadId: deal.leadId, vehicleId: deal.vehicleId, salePriceEur: deal.salePriceEur }, request });
  return NextResponse.json({ deal }, { status: 201 });
}
