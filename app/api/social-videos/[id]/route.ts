import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "@/lib/auth/api";
import { writeAuditEvent } from "@/lib/audit/audit-log";
import { socialVideoContentTypeSchema, socialVideoStatusSchema } from "@/lib/social-video/model";
import { getSocialVideo, updateSocialVideo } from "@/lib/social-video/repository";

const patchSchema = z.object({
  title: z.string().min(1).max(180).optional(),
  caption: z.string().max(1000).optional(),
  description: z.string().max(2000).optional(),
  status: socialVideoStatusSchema.optional(),
  contentType: socialVideoContentTypeSchema.optional(),
  vehicleIds: z.array(z.string()).max(20).optional(),
  carCheckId: z.string().nullable().optional(),
  vvVerifiedId: z.string().nullable().optional(),
  brand: z.string().max(80).nullable().optional(),
  model: z.string().max(120).nullable().optional(),
  tags: z.array(z.string().max(60)).max(30).optional(),
  featured: z.boolean().optional(),
  placements: z.object({
    homepage: z.boolean(), inventory: z.boolean(), vehicleDetail: z.boolean(), carCheck: z.boolean(), knowledge: z.boolean(),
  }).optional(),
}).strict();

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await authorizeApi(request, "socialVideos.read");
  if (auth.response) return auth.response;
  const { id } = await context.params;
  try {
    const video = await getSocialVideo(id);
    return video ? NextResponse.json({ video }) : NextResponse.json({ error: "Video niet gevonden." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Video-opslag is niet beschikbaar." }, { status: 503 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await authorizeApi(request, "socialVideos.write");
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige wijziging.", issues: parsed.error.flatten() }, { status: 400 });

  const patch = { ...parsed.data } as Record<string, unknown>;
  for (const key of ["carCheckId", "vvVerifiedId", "brand", "model"]) if (patch[key] === null) delete patch[key];
  if (parsed.data.status === "published") patch.publishedAt = new Date().toISOString();

  try {
    const before = await getSocialVideo(id);
    if (!before) return NextResponse.json({ error: "Video niet gevonden." }, { status: 404 });
    const video = await updateSocialVideo(id, patch);
    await writeAuditEvent({ action: "socialVideo.updated", entityType: "socialVideo", entityId: id, actor: auth.actor, metadata: { fromStatus: before.status, toStatus: video.status, vehicleIds: video.vehicleIds }, request });
    return NextResponse.json({ video });
  } catch {
    return NextResponse.json({ error: "Video kon niet worden bijgewerkt." }, { status: 503 });
  }
}
