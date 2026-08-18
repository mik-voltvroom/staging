import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/auth/api";
import { writeAuditEvent } from "@/lib/audit/audit-log";

const schema = z.object({ dealId: z.string().min(1), amountEur: z.coerce.number().positive(), portalToken: z.string().optional() });

export async function POST(request: Request) {
  const auth = await authorizeApi(request, "deals.write");
  if (auth.response) return auth.response;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "dealId en een positief bedrag zijn verplicht" }, { status: 400 });
  const configured = Boolean(process.env.MOLLIE_API_KEY || process.env.STRIPE_SECRET_KEY);
  const paymentId = `pay_${Date.now()}`;
  await writeAuditEvent({ action: "payment.request_rejected", entityType: "payment", entityId: paymentId, actor: auth.actor, outcome: "warning", metadata: { dealId: parsed.data.dealId, amountEur: parsed.data.amountEur, mode: configured ? "configured-unverified" : "unavailable" }, request });
  return NextResponse.json({ ok: false, paymentId, status: "not_created", mode: configured ? "configured-unverified" : "unavailable", paymentUrl: null, message: configured ? "Providercredentials zijn aanwezig, maar er is nog geen geverifieerde providertransactie uitgevoerd." : "Betalingsprovider is niet geconfigureerd." }, { status: 503 });
}
