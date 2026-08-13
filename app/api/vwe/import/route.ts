import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { slugify } from "@/lib/business";
export async function POST(request: Request) {
  const expected = process.env.VWE_WEBHOOK_SECRET;
  if (!expected) return NextResponse.json({ error: "VWE-import is niet geconfigureerd" }, { status: 503 });
  if (request.headers.get("x-vvos-secret") !== expected) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  const payload = await request.json();
  const rows = Array.isArray(payload) ? payload : payload.vehicles;
  if (!Array.isArray(rows)) return NextResponse.json({ error: "vehicles-array ontbreekt" }, { status: 400 });
  const mapped = rows.map((row: Record<string, unknown>) => ({ ...row, id: String(row.id ?? row.stockNumber ?? crypto.randomUUID()), slug: String(row.slug ?? slugify(`${row.brand ?? "auto"}-${row.model ?? ""}-${row.year ?? ""}`)), updatedAt: new Date().toISOString(), createdAt: row.createdAt ?? new Date().toISOString() }));
  if (!adminDb) return NextResponse.json({ mode: "demo", accepted: mapped.length, preview: mapped.slice(0, 3) });
  const firestore = adminDb;
  const batch = firestore.batch(); mapped.forEach(vehicle => batch.set(firestore.doc(`vehicles/${vehicle.id}`), vehicle, { merge: true })); await batch.commit();
  return NextResponse.json({ mode: "live", imported: mapped.length });
}
