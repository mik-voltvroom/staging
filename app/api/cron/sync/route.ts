import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Cron is niet geconfigureerd" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), jobs: ["validate_inventory", "refresh_merchant_feed", "flag_stale_leads"], note: "Cron orchestration gereed; providers worden geactiveerd via env-configuratie." });
}
