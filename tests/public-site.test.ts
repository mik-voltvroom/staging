import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("publieke Volt & Vroom website", () => {
  it("houdt interne VVOS-navigatie buiten de publieke header", () => {
    const header = read("components/Header.tsx");
    expect(header).not.toContain("/dashboard");
    expect(header).toContain("Mobiele navigatie");
  });

  it("biedt een complete adviesroute met privacytoestemming", () => {
    const form = read("components/ContactForm.tsx");
    expect(form).toContain('fetch("/api/leads"');
    expect(form).toContain('name="consent"');
    expect(form).toContain('href="/privacy"');
  });

  it("gebruikt geen vervallen Automotive-descriptor op de homepage", () => {
    expect(read("app/page.tsx").toUpperCase()).not.toContain("AUTOMOTIVE");
  });

  it("maakt aanbod, bewijs en primaire vervolgstap direct duidelijk", () => {
    const homepage = read("app/page.tsx");
    expect(homepage).toContain("Hybride en elektrische occasions.");
    expect(homepage).toContain("Aantoonbaar gecontroleerd.");
    expect(homepage).toContain("Doe de Hybrid &amp; EV Match");
    expect(homepage.indexOf('href="/keuzehulp"')).toBeLessThan(homepage.indexOf('href="#voorraad"'));
    expect(homepage).not.toContain("Geen prijs zonder bewijs");
  });

  it("maakt de selectiecriteria en drie aanbodwerelden expliciet", () => {
    const homepage = read("app/page.tsx");
    expect(homepage).toContain("Maximaal 5 jaar");
    expect(homepage).toContain("Maximaal 100.000 km");
    expect(homepage).toContain("Eén vorige eigenaar");
    expect(homepage).toContain("Dealeronderhouden");
    expect(homepage).toContain("SOH-accucontrole");
    expect(homepage).toContain("Onze ervaring uit de praktijk");
    expect(homepage).toContain(">Hybride<");
    expect(homepage).toContain(">Elektrisch<");
    expect(homepage).toContain(">Icons<");
  });

  it("houdt de selectienorm en hero-acties compact op mobiel", () => {
    const css = read("app/public.css");
    expect(css).toContain(".proofGrid{display:grid;grid-template-columns:repeat(5,1fr)");
    expect(css).toContain(".proofGrid{grid-template-columns:repeat(2,minmax(0,1fr))}");
    expect(css).toContain(".hero .actions{display:grid;grid-template-columns:1fr}");
    expect(css).toContain("min-height:44px");
  });

  it("biedt afzonderlijke landingspagina's en een gevalideerde keuzehulp", () => {
    expect(read("app/hybride/page.tsx")).toContain("Hybride wanneer dat slimmer is");
    expect(read("app/elektrisch/page.tsx")).toContain("Elektrisch wanneer het klopt");
    expect(read("app/icons/page.tsx")).toContain("Meer karakter. Dezelfde standaard");
    const match = read("components/MatchForm.tsx");
    expect(match).toContain('fetch("/api/leads"');
    expect(match).toContain('name="consent"');
    expect(match).toContain("getRecommendation");
  });

  it("publiceert technische SEO voor de nieuwe content", () => {
    expect(read("app/sitemap.ts")).toContain('"/hybride"');
    expect(read("app/sitemap.ts")).toContain('"/elektrisch"');
    expect(read("app/sitemap.ts")).toContain('"/keuzehulp"');
    expect(read("app/robots.ts")).toContain('disallow: ["/dashboard/", "/api/", "/login"]');
    expect(read("app/page.tsx")).toContain('"@type": "AutoDealer"');
  });
});
