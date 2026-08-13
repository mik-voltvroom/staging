import { NextResponse } from "next/server";
import { integrationMode, isFirebaseAdminConfigured, isFirebaseClientConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "VVOS",
    version: process.env.npm_package_version ?? "0.7.1-agent",
    mode: integrationMode,
    checks: {
      firebaseClient: isFirebaseClientConfigured,
      firebaseAdmin: isFirebaseAdminConfigured,
      authenticationRequired: process.env.VVOS_REQUIRE_AUTH === "true",
      merchantConfigured: Boolean(process.env.GOOGLE_MERCHANT_ID && process.env.GOOGLE_MERCHANT_DATASOURCE),
      rdwConfigured: Boolean(process.env.RDW_API_BASE_URL),
      vweWebhookProtected: Boolean(process.env.VWE_WEBHOOK_SECRET),
    },
    timestamp: new Date().toISOString(),
  });
}
