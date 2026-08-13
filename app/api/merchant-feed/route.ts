import { createVehicleFeed } from "@/lib/merchant";
import { vehicles } from "@/lib/sample-data";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.voltvroom.nl";
  return new Response(createVehicleFeed(vehicles, baseUrl), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=900, stale-while-revalidate=3600"
    }
  });
}
