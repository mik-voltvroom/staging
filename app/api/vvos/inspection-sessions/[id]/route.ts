import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/auth/api";
import { assertInspectionTransition } from "@/lib/glasses/business";
import { getInspectionSession, updateInspectionSession } from "@/lib/glasses/repository";
import { writeAuditEvent } from "@/lib/audit/audit-log";

export const runtime = "nodejs";
const statusSchema = z.enum(["draft", "active", "paused", "processing", "review", "completed", "cancelled"]);
const patchSchema = z.object({ status: statusSchema.optional(), currentItemId: z.string().min(1).optional() }).strict();

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context): Promise<Response> {
  const authorization = await authorizeApi(request, "inspections.read");
  if (authorization.response) return authorization.response;
  const { id } = await context.params;
  const session = await getInspectionSession(id);
  return session ? NextResponse.json({ ok: true, session }, { headers: { "cache-control": "no-store" } }) : NextResponse.json({ ok: false, error: "Inspectie niet gevonden." }, { status: 404 });
}

export async function PATCH(request: Request, context: Context): Promise<Response> {
  const authorization = await authorizeApi(request, "inspections.write");
  if (authorization.response) return authorization.response;
  const actor = authorization.actor!;
  const { id } = await context.params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Ongeldige wijziging." }, { status: 400 });
  const session = await getInspectionSession(id);
  if (!session) return NextResponse.json({ ok: false, error: "Inspectie niet gevonden." }, { status: 404 });
  if (parsed.data.status) {
    try { assertInspectionTransition(session.status, parsed.data.status); }
    catch (error) { return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Ongeldige status." }, { status: 409 }); }
  }
  const current = parsed.data.currentItemId ? session.checklist.find(item => item.id === parsed.data.currentItemId) : undefined;
  if (parsed.data.currentItemId && !current) return NextResponse.json({ ok: false, error: "Checklistonderdeel niet gevonden." }, { status: 400 });
  await updateInspectionSession(id, {
    ...parsed.data,
    ...(current ? { currentSection: current.section } : {}),
    ...(parsed.data.status === "completed" ? { completedAt: new Date().toISOString() } : {}),
  });
  await writeAuditEvent({ action: "inspection.updated", entityType: "inspection", entityId: id, actor, request, metadata: parsed.data });
  return NextResponse.json({ ok: true, session: await getInspectionSession(id) });
}
