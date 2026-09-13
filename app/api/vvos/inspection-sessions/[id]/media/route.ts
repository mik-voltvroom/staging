import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/auth/api";
import { adminStorage } from "@/lib/firebase-admin";
import { addInspectionMedia, getInspectionMedia, getInspectionSession, updateInspectionMedia } from "@/lib/glasses/repository";
import { writeAuditEvent } from "@/lib/audit/audit-log";
import type { InspectionMedia } from "@/lib/glasses/model";

export const runtime = "nodejs";
const prepareSchema = z.object({ action: z.literal("prepare"), kind: z.enum(["photo", "video"]), contentType: z.enum(["image/jpeg", "image/png", "image/webp", "video/mp4"]), capturedAt: z.string().datetime(), sourceDevice: z.enum(["browser_camera", "meta_companion", "mock"]) });
const confirmSchema = z.object({ action: z.literal("confirm"), mediaId: z.string().uuid(), sizeBytes: z.number().int().positive().max(250_000_000) });
const bodySchema = z.discriminatedUnion("action", [prepareSchema, confirmSchema]);
type Context = { params: Promise<{ id: string }> };

const ext: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "video/mp4": "mp4" };

export async function GET(request: Request, context: Context): Promise<Response> {
  const authorization = await authorizeApi(request, "inspections.read");
  if (authorization.response) return authorization.response;
  const { id } = await context.params;
  const mediaId = new URL(request.url).searchParams.get("mediaId");
  if (!mediaId) return NextResponse.json({ ok: false, error: "mediaId ontbreekt." }, { status: 400 });
  const media = await getInspectionMedia(id, mediaId);
  if (!media || media.status !== "uploaded") return NextResponse.json({ ok: false, error: "Media niet gevonden." }, { status: 404 });
  if (!adminStorage) return NextResponse.json({ ok: false, error: "Mediaopslag niet beschikbaar." }, { status: 503 });
  const [url] = await adminStorage.bucket().file(media.storagePath).getSignedUrl({ version: "v4", action: "read", expires: Date.now() + 5 * 60_000 });
  return NextResponse.json({ ok: true, url });
}

export async function POST(request: Request, context: Context): Promise<Response> {
  const authorization = await authorizeApi(request, "inspections.write");
  if (authorization.response) return authorization.response;
  const actor = authorization.actor!;
  const { id } = await context.params;
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ ok: false, error: "Ongeldige media-aanvraag." }, { status: 400 });
  const session = await getInspectionSession(id);
  if (!session) return NextResponse.json({ ok: false, error: "Inspectie niet gevonden." }, { status: 404 });
  if (!adminStorage) return NextResponse.json({ ok: false, error: "Mediaopslag niet beschikbaar." }, { status: 503 });

  if (body.data.action === "prepare") {
    const mediaId = crypto.randomUUID();
    const storagePath = `vehicles/${session.vehicleId}/inspections/${id}/${session.currentSection}/${mediaId}.${ext[body.data.contentType]}`;
    const now = new Date().toISOString();
    const media: InspectionMedia = { id: mediaId, inspectionId: id, vehicleId: session.vehicleId, kind: body.data.kind, storagePath, contentType: body.data.contentType, section: session.currentSection, itemId: session.currentItemId, sourceDevice: body.data.sourceDevice, status: "pending", createdBy: actor.uid, capturedAt: body.data.capturedAt, createdAt: now, updatedAt: now };
    await addInspectionMedia(media);
    const [uploadUrl] = await adminStorage.bucket().file(storagePath).getSignedUrl({ version: "v4", action: "write", expires: Date.now() + 10 * 60_000, contentType: body.data.contentType });
    await writeAuditEvent({ action: "inspection.media_prepared", entityType: "inspection", entityId: id, actor, request, metadata: { mediaId, kind: media.kind, section: media.section } });
    return NextResponse.json({ ok: true, media, uploadUrl }, { status: 201 });
  }

  const media = await getInspectionMedia(id, body.data.mediaId);
  if (!media) return NextResponse.json({ ok: false, error: "Media niet gevonden." }, { status: 404 });
  const [exists] = await adminStorage.bucket().file(media.storagePath).exists();
  if (!exists) {
    await updateInspectionMedia(id, media.id, { status: "failed" });
    return NextResponse.json({ ok: false, error: "Upload is niet bevestigd door opslag." }, { status: 409 });
  }
  await updateInspectionMedia(id, media.id, { status: "uploaded", sizeBytes: body.data.sizeBytes });
  await writeAuditEvent({ action: "inspection.photo_captured", entityType: "inspection", entityId: id, actor, request, metadata: { mediaId: media.id, sizeBytes: body.data.sizeBytes } });
  return NextResponse.json({ ok: true, session: await getInspectionSession(id) });
}
