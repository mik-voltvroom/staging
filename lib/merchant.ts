import type { Vehicle } from "@/types";

const escapeXml = (value: unknown) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

export function createVehicleFeed(vehicles: Vehicle[], baseUrl: string): string {
  const items = vehicles
    .filter((vehicle) => vehicle.status === "available")
    .map((vehicle) => `
      <item>
        <g:id>${escapeXml(vehicle.id)}</g:id>
        <title>${escapeXml(`${vehicle.brand} ${vehicle.model} ${vehicle.trim}`)}</title>
        <description>${escapeXml(`${vehicle.year} · ${vehicle.mileageKm} km · ${vehicle.driveType}`)}</description>
        <link>${escapeXml(`${baseUrl}/voorraad/${vehicle.slug}`)}</link>
        <g:image_link>${escapeXml(vehicle.images[0])}</g:image_link>
        <g:availability>in_stock</g:availability>
        <g:condition>used</g:condition>
        <g:price>${vehicle.priceEur.toFixed(2)} EUR</g:price>
        <g:brand>${escapeXml(vehicle.brand)}</g:brand>
        <g:product_type>Vehicles &gt; Cars</g:product_type>
        <g:custom_label_0>${escapeXml(vehicle.driveType)}</g:custom_label_0>
        <g:custom_label_1>${escapeXml(vehicle.locationCode)}</g:custom_label_1>
      </item>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Volt &amp; Vroom voertuigen</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Actuele hybride voorraad van Volt &amp; Vroom</description>${items}
  </channel>
</rss>`;
}
