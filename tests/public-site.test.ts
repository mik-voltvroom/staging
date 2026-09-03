import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("publieke Volt & Vroom website", () => {
  it("houdt interne VVOS-navigatie buiten de publieke header", () => {
    const header = read("components/Header.tsx");
    expect(header).not.toContain("/dashboard");
    expect(header).toContain("Mobiele navigatie");
    expect(header).toContain("/#waarom");
    expect(header).toContain("/contact");
  });

  it("biedt een complete adviesroute met privacytoestemming en anti-spamveld", () => {
    const form = read("components/ContactForm.tsx");
    expect(form).toContain('fetch("/api/leads"');
    expect(form).toContain('name="consent"');
    expect(form).toContain('name="website"');
    expect(form).toContain('href="/privacy"');
    expect(form).toContain("telefoonnummer of e-mailadres");
  });

  it("gebruikt geen vervallen Automotive-descriptor op de homepage", () => {
    expect(read("app/page.tsx").toUpperCase()).not.toContain("AUTOMOTIVE");
  });

  it("maakt aanbod, bewijs en primaire vervolgstap direct duidelijk", () => {
    const homepage = read("app/page.tsx");
    expect(homepage).toContain("Slim rijden.");
    expect(homepage).toContain("Meer genieten.");
    expect(homepage).toContain("Hybride en elektrische occasions, geselecteerd op historie, techniek en dagelijks gebruik");
    expect(homepage.indexOf('href="#uitgelicht"')).toBeLessThan(homepage.indexOf('href="/keuzehulp"'));
  });

  it("toont uitsluitend repository-backed publiceerbare voorraad", () => {
    const homepage = read("app/page.tsx");
    const repository = read("lib/repositories/public-vehicle-repository.ts");
    expect(homepage).toContain("listPublicVehicles(8)");
    expect(homepage).toContain("<FeaturedInventoryRail vehicles={featuredVehicles}");
    expect(homepage).toContain("<VehicleCard vehicle={vehicle}");
    expect(repository).toContain('vehicle.status === "available"');
    expect(repository).toContain('vehicle.publication?.channels.website === true');
    expect(repository).toContain("validationErrors");
  });

  it("formuleert de selectienorm controleerbaar en zonder onnodige absolute claims", () => {
    const homepage = read("app/page.tsx");
    expect(homepage).toContain("Historie gecontroleerd");
    expect(homepage).toContain("Techniek beoordeeld");
    expect(homepage).toContain("Accudata waar beschikbaar");
    expect(homepage).toContain("Volt & Vroom controle");
    expect(homepage).not.toContain("Hybrid Intelligence");
    expect(homepage).not.toContain("Altijd dealeronderhouden");
    expect(homepage).not.toContain("Eén eigenaar");
  });

  it("houdt de selectienorm en hero-acties compact op mobiel", () => {
    const css = read("app/public.css");
    const enhancements = read("app/enhancements.css");
    const refresh = read("app/frontend-refresh.css");
    expect(css).toContain(".proofGrid{display:grid;grid-template-columns:repeat(3,1fr)");
    expect(css).toContain(".proofGrid{grid-template-columns:1fr}");
    expect(css).toContain(".hero .actions{display:grid;grid-template-columns:1fr}");
    expect(css).toContain("min-height:44px");
    expect(enhancements).toContain(".mobileActionBar.isHidden");
    expect(refresh).toContain(".featuredRail");
  });

  it("houdt voertuigteksten publiek en aandrijflijnspecifiek", () => {
    const detail = read("app/voorraad/[slug]/page.tsx");
    const card = read("components/VehicleCard.tsx");
    expect(detail).toContain("publicDescription");
    expect(detail).toContain("Elektrische gegevens");
    expect(detail).toContain("rustig met u door");
    expect(detail).not.toContain("Hybrid Intelligence");
    expect(detail).not.toContain(">Hybrid data<");
    expect(card).toContain('return "Elektrisch"');
  });

  it("biedt afzonderlijke landingspagina's, FAQ's en een gevalideerde keuzehulp", () => {
    expect(read("app/hybride/page.tsx")).toContain("Hybride wanneer dat slimmer is");
    expect(read("app/elektrisch/page.tsx")).toContain("Elektrisch wanneer het klopt");
    expect(read("app/icons/page.tsx")).toContain("Meer karakter. Dezelfde standaard");
    expect(read("components/SegmentPage.tsx")).toContain("Veelgestelde vragen");
    const match = read("components/MatchForm.tsx");
    expect(match).toContain('fetch("/api/leads"');
    expect(match).toContain('name="consent"');
    expect(match).toContain('name="website"');
    expect(match).toContain("getRecommendation");
  });

  it("publiceert VV Verified, contact en technische SEO", () => {
    expect(read("app/vv-verified/page.tsx")).toContain("Vertrouwen moet controleerbaar zijn");
    expect(read("app/contact/page.tsx")).toContain("Euvelgunnerweg 50");
    const sitemap = read("app/sitemap.ts");
    expect(sitemap).toContain('"/hybride"');
    expect(sitemap).toContain('"/elektrisch"');
    expect(sitemap).toContain('"/keuzehulp"');
    expect(sitemap).toContain('"/vv-verified"');
    expect(sitemap).toContain('"/contact"');
    expect(read("app/robots.ts")).toContain('disallow: ["/dashboard/", "/api/", "/login"]');
    expect(read("app/page.tsx")).toContain('"@type": "AutoDealer"');
  });

  it("biedt een veilige Google Maps-routeplanner naar de showroom", () => {
    const homepage = read("app/page.tsx");
    const footer = read("components/SiteFooter.tsx");
    const contact = read("app/contact/page.tsx");

    for (const source of [homepage, footer, contact]) {
      expect(source).toContain("https://www.google.com/maps/dir/?api=1");
      expect(source).toContain("Euvelgunnerweg%2050%2C%209723%20CW%20Groningen");
      expect(source).toContain('target="_blank"');
      expect(source).toContain('rel="noopener noreferrer"');
    }
  });

  it("laadt de officiële Google Merchant-reviewbadge pas na de primaire pagina", () => {
    const badge = read("components/GoogleMerchantBadge.tsx");
    const layout = read("app/layout.tsx");

    expect(badge).toContain("https://www.gstatic.com/shopping/merchant/merchantwidget.js");
    expect(badge).toContain("merchant_id: 5838389580");
    expect(badge).toContain('position: "RIGHT_BOTTOM"');
    expect(badge).toContain('region: "NL"');
    expect(badge).toContain('strategy="lazyOnload"');
    expect(layout).toContain("<GoogleMerchantBadge />");
  });

  it("maakt kernconversies provider-neutraal meetbaar", () => {
    const analytics = read("components/PublicAnalytics.tsx");
    expect(analytics).toContain("phone_click");
    expect(analytics).toContain("email_click");
    expect(analytics).toContain("route_click");
    expect(analytics).toContain("match_started");
    expect(analytics).toContain("lead_submitted");
  });
});
