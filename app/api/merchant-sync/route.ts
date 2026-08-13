import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { authorizeApi } from "@/lib/auth/api";
import { writeAuditEvent } from "@/lib/audit/audit-log";

export async function POST(request: Request) {
  const auth = await authorizeApi(request, "integrations.manage");
  if (auth.response) return auth.response;
  const configured = Boolean(process.env.GOOGLE_MERCHANT_ID && process.env.GOOGLE_MERCHANT_DATASOURCE);
  if (!configured) {
    await writeAuditEvent({ action: "merchant.sync_requested", entityType: "integration", entityId: "merchant", actor: auth.actor, outcome: "warning", metadata: { configured: false }, request });
    return NextResponse.json({ mode: "demo", status: "warning", message: "Merchant-credentials ontbreken. XML-feed blijft beschikbaar via /api/merchant-feed." });
  }
  const count = adminDb ? (await adminDb.collection("vehicles").where("status", "==", "available").get()).size : 0;
  await writeAuditEvent({ action: "merchant.sync_queued", entityType: "integration", entityId: "merchant", actor: auth.actor, metadata: { processed: count }, request });
  return NextResponse.json({ mode: "live", status: "queued", processed: count, message: "Synchronisatie is klaargezet. Voeg OAuth/service-account transport toe voor de definitieve push." });
}
