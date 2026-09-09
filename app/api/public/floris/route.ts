import { NextResponse } from "next/server";
import { z } from "zod";
import { buildFlorisContext } from "@/lib/floris/context";
import { requiresCurrentWebInfo } from "@/lib/floris/routing";
import { askFloris } from "@/lib/floris/service";
import { listPublicVehicles } from "@/lib/repositories/public-vehicle-repository";
import { consumePublicFlorisQuota } from "@/lib/security/public-rate-limit";

export const runtime = "nodejs";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1_200),
});

const schema = z.object({
  message: z.string().trim().min(1).max(800),
  slug: z.string().trim().min(1).max(180).optional(),
  history: z.array(messageSchema).max(8).default([]),
}).strict();

export async function POST(request: Request): Promise<Response> {
  const quota = await consumePublicFlorisQuota(request);
  if (!quota.allowed) {
    return NextResponse.json(
      { ok: false, error: "Floris heeft even veel vragen tegelijk. Probeer het zo nog eens." },
      { status: 429, headers: { "retry-after": String(quota.retryAfterSeconds), "cache-control": "no-store" } },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "De vraag kon niet worden verwerkt." }, { status: 400 });

  try {
    const publicInventory = await listPublicVehicles(100);
    const selectedVehicle = parsed.data.slug ? publicInventory.find(vehicle => vehicle.slug === parsed.data.slug) : undefined;
    const inventoryForContext = publicInventory.slice(0, 20);
    const useWebSearch = requiresCurrentWebInfo(parsed.data.message);
    const result = await askFloris({
      question: parsed.data.message,
      history: parsed.data.history,
      context: buildFlorisContext(selectedVehicle, inventoryForContext),
      useWebSearch,
    });

    return NextResponse.json({
      ok: true,
      answer: result.answer,
      sources: result.sources,
      usedWebSearch: useWebSearch,
      vehicle: selectedVehicle ? { id: selectedVehicle.id, slug: selectedVehicle.slug, name: `${selectedVehicle.brand} ${selectedVehicle.model}`, trim: selectedVehicle.trim } : null,
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "FLORIS_NOT_CONFIGURED") {
      return NextResponse.json({ ok: false, error: "Floris wordt momenteel klaargezet. Stel uw vraag gerust via contact." }, { status: 503 });
    }
    console.error("Floris request failed", code || "unknown");
    return NextResponse.json({ ok: false, error: "Floris kan deze vraag nu niet betrouwbaar beantwoorden. Probeer het opnieuw." }, { status: 502 });
  }
}
