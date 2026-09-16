const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.voltvroom.nl";

const content = `# Volt & Vroom

> Volt & Vroom is een onafhankelijk autobedrijf in Groningen voor zorgvuldig geselecteerde hybride en elektrische occasions en een kleine collectie Icons. De website legt voertuigdata, accugezondheid en dagelijks gebruik begrijpelijk uit.

## Belangrijkste pagina's

- [Homepage](${siteUrl}/): bedrijfsprofiel, werkwijze, actuele voorraad en contact
- [Voorraad](${siteUrl}/voorraad): actuele hybride en elektrische occasions
- [Hybride auto kopen in Groningen](${siteUrl}/hybride-auto-kopen-groningen): lokaal koopadvies voor hybride occasions
- [Elektrische auto kopen in Groningen](${siteUrl}/elektrische-auto-kopen-groningen): lokaal koopadvies voor elektrische occasions
- [Kennisbank](${siteUrl}/kennis): uitleg over hybride, elektrisch, accugezondheid en laden
- [Volt & Vroom controle](${siteUrl}/vv-verified): controleaanpak en beschikbare voertuiggegevens
- [Keuzehulp](${siteUrl}/keuzehulp): keuze tussen hybride en elektrisch op basis van dagelijks gebruik
- [Contact](${siteUrl}/contact): Euvelgunnerweg 50, 9723 CW Groningen

## Redactionele uitgangspunten

- Ontbrekende voertuig- of accugegevens worden expliciet benoemd.
- Een State of Health-meting wordt altijd met methode en context gepresenteerd.
- Advies houdt rekening met ritten, laadmogelijkheden, onderhoud, historie en gebruikskosten.
- Actuele voertuigprijzen en beschikbaarheid staan uitsluitend op de voertuigpagina's.
`;

export function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
