import { NextResponse } from "next/server";
import { z } from "zod";
import { bankTransactions, financeInvoices } from "@/lib/finance/sample-data";
import { invoiceOpenAmount } from "@/lib/finance/business";
import { authorizeApi } from "@/lib/auth/api";
import { writeAuditEvent } from "@/lib/audit/audit-log";

const schema = z.object({ transactionId: z.string(), invoiceId: z.string() });

export async function POST(request: Request) {
  const auth = await authorizeApi(request, "finance.write");
  if (auth.response) return auth.response;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige matching" }, { status: 400 });
  const transaction = bankTransactions.find((item) => item.id === parsed.data.transactionId);
  const invoice = financeInvoices.find((item) => item.id === parsed.data.invoiceId);
  if (!transaction || !invoice) return NextResponse.json({ error: "Transactie of factuur niet gevonden" }, { status: 404 });
  const difference = Math.abs(Math.abs(transaction.amountEur) - invoiceOpenAmount(invoice));
  const matched = difference < 0.02;
  await writeAuditEvent({ action: "bank_transaction.reconciled", entityType: "bank_transaction", entityId: transaction.id, actor: auth.actor, outcome: matched ? "success" : "warning", metadata: { invoiceId: invoice.id, differenceEur: difference }, request });
  return NextResponse.json({ matched, differenceEur: difference, transactionId: transaction.id, invoiceId: invoice.id, mode: "preview" });
}
