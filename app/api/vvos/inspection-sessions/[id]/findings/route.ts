import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/auth/api";
import { getInspectionSession, updateInspectionFinding } from "@/lib/glasses/repository";
import { writeAuditEvent } from "@/lib/audit/audit-log";

const schema = z.object({ findingId: z.string().uuid(), reviewStatus: z.enum(["confirmed", "dismissed"]) });
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context): Promise<Response> {
  const authorization = await authorizeApi(request, "inspections.write");
  if (authorization.response) return authorization.response;
  const actor = authorization.actor!;
  const { id } = await context.params;
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ ok: false, error: "Ongeldige bevinding." }, { status: 400 });
  const session = await getInspectionSession(id);
  if (!session) return NextResponse.json({ ok: false, error: "Inspectie niet gevonden." }, { status: 404 });
  if (!session.findings.some(finding => finding.id === body.data.findingId)) return NextResponse.json({ ok: false, error: "Bevinding niet gevonden." }, { status: 404 });
  await updateInspectionFinding(id, body.data.findingId, { reviewStatus: body.data.reviewStatus });
  await writeAuditEvent({ action: "inspection.finding_reviewed", entityType: "inspection", entityId: id, actor, request, metadata: body.data });
  return NextResponse.json({ ok: true, session: await getInspectionSession(id) });
}
