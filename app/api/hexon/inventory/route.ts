import { HEXON_MAX_BODY_BYTES, hexonCredentialsConfigured, processHexonInventoryXml, verifyHexonAuthorization } from "@/lib/integrations/hexon-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function plain(value: "0" | "1", status: number): Response {
  return new Response(value, { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}

export async function POST(request: Request): Promise<Response> {
  if (!hexonCredentialsConfigured()) return plain("0", 503);
  if (!verifyHexonAuthorization(request.headers.get("authorization"))) return plain("0", 401);

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("xml")) return plain("0", 415);
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > HEXON_MAX_BODY_BYTES) return plain("0", 413);

  try {
    const xml = await request.text();
    if (Buffer.byteLength(xml, "utf8") > HEXON_MAX_BODY_BYTES) return plain("0", 413);
    const result = await processHexonInventoryXml(xml);
    console.info("Hexon inventory mutation accepted", result);
    return plain("1", 200);
  } catch (error) {
    console.error("Hexon inventory mutation rejected", error instanceof Error ? error.message : "unknown error");
    return plain("0", 400);
  }
}
