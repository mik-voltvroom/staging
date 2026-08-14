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

  it("maakt de selectiecriteria en drie aanbodwerelden expliciet", () => {
    const homepage = read("app/page.tsx");
    expect(homepage).toContain("Maximaal 5 jaar oud");
    expect(homepage).toContain("Tot 100.000 kilometer");
    expect(homepage).toContain("Eén vorige eigenaar");
    expect(homepage).toContain("Dealeronderhouden");
    expect(homepage).toContain("SOH-rapport");
    expect(homepage).toContain(">Hybride<");
    expect(homepage).toContain(">Elektrisch<");
    expect(homepage).toContain(">Icons<");
  });
});
