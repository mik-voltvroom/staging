import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/auth/api";
import { getInspectionSession, updateInspectionSession } from "@/lib/glasses/repository";
import { writeAuditEvent } from "@/lib/audit/audit-log";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context): Promise<Response> {
  const authorization = await authorizeApi(request, "inspections.write");
  if (authorization.response) return authorization.response;
  const actor = authorization.actor!;
  const { id } = await context.params;
  const session = await getInspectionSession(id);
  if (!session) return NextResponse.json({ ok: false, error: "Inspectie niet gevonden." }, { status: 404 });
  if (!["active", "paused"].includes(session.status)) return NextResponse.json({ ok: false, error: "Inspectie kan vanuit deze status niet worden afgerond." }, { status: 409 });
  await updateInspectionSession(id, { status: "review" });
  await writeAuditEvent({ action: "inspection.completed_capture", entityType: "inspection", entityId: id, actor, request, metadata: { vehicleId: session.vehicleId } });
  return NextResponse.json({ ok: true, session: await getInspectionSession(id) });
}
