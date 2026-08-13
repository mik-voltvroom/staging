import { NextResponse } from "next/server";
import { z } from "zod";
import type { DealStatus } from "@/types";
import { authorizeApi } from "@/lib/auth/api";
import { writeAuditEvent } from "@/lib/audit/audit-log";

const statuses: DealStatus[] = ["draft", "awaiting_signature", "signed", "payment_pending", "paid", "registration", "preparation", "ready", "delivered", "cancelled"];
const schema = z.object({ status: z.enum(statuses as [DealStatus, ...DealStatus[]]) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeApi(request, "deals.write");
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige dealstatus" }, { status: 400 });
  await writeAuditEvent({ action: "deal.status_changed", entityType: "deal", entityId: id, actor: auth.actor, metadata: { status: parsed.data.status }, request });
  return NextResponse.json({ id, status: parsed.data.status, updatedAt: new Date().toISOString(), mode: "preview" });
}
