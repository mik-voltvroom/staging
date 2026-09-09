import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/auth/api";
import { deviationDetailsComplete, evaluateCarCheck101 } from "@/lib/glasses/carcheck101";
import { getInspectionSession, updateInspectionSession } from "@/lib/glasses/repository";
import { writeAuditEvent } from "@/lib/audit/audit-log";

const schema = z.object({
  itemId: z.string().min(1).max(120),
  status: z.enum(["pending", "ok", "attention", "fail", "na"]).optional(),
  riskLevel: z.enum(["low", "medium", "high", "safety_critical"]).nullable().optional(),
  note: z.string().trim().max(1200).nullable().optional(),
  repairAction: z.string().trim().max(1200).nullable().optional(),
  repairCostCents: z.number().int().min(0).max(20_000_000).nullable().optional(),
  value: z.union([z.string().max(200), z.number().finite()]).nullable().optional(),
  unit: z.string().trim().max(30).nullable().optional(),
}).strict();

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context): Promise<Response> {
  const authorization = await authorizeApi(request, "inspections.write");
  if (authorization.response) return authorization.response;
  const actor = authorization.actor!;
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Ongeldige CarCheck-wijziging." }, { status: 400 });
  const session = await getInspectionSession(id);
  if (!session) return NextResponse.json({ ok: false, error: "Inspectie niet gevonden." }, { status: 404 });
  if (["completed", "cancelled"].includes(session.status)) return NextResponse.json({ ok: false, error: "Deze CarCheck kan niet meer worden aangepast." }, { status: 409 });
  const existing = session.checklist.find(item => item.id === parsed.data.itemId);
  if (!existing) return NextResponse.json({ ok: false, error: "Controlepunt niet gevonden." }, { status: 404 });

  const now = new Date().toISOString();
  const patch = parsed.data;
  const checklist = session.checklist.map(item => item.id !== patch.itemId ? item : {
    ...item,
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.riskLevel !== undefined ? { riskLevel: patch.riskLevel ?? undefined } : {}),
    ...(patch.note !== undefined ? { note: patch.note ?? undefined } : {}),
    ...(patch.repairAction !== undefined ? { repairAction: patch.repairAction ?? undefined } : {}),
    ...(patch.repairCostCents !== undefined ? { repairCostCents: patch.repairCostCents ?? undefined } : {}),
    ...(patch.value !== undefined ? { value: patch.value ?? undefined } : {}),
    ...(patch.unit !== undefined ? { unit: patch.unit ?? undefined } : {}),
    updatedAt: now,
  });
  await updateInspectionSession(id, { checklist, currentSection: existing.section, currentItemId: existing.id });
  const updated = await getInspectionSession(id);
  if (!updated) return NextResponse.json({ ok: false, error: "CarCheck kon niet worden herladen." }, { status: 500 });
  const item = updated.checklist.find(candidate => candidate.id === existing.id)!;
  const carCheck = evaluateCarCheck101(updated);
  await writeAuditEvent({ action: "carcheck.point_updated", entityType: "inspection", entityId: id, actor, request, metadata: { point: item.number, itemId: item.id, status: item.status, riskLevel: item.riskLevel, deviationComplete: deviationDetailsComplete(item) } });
  return NextResponse.json({ ok: true, item, deviationComplete: deviationDetailsComplete(item), carCheck, session: updated });
}
