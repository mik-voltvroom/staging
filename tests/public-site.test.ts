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
});
