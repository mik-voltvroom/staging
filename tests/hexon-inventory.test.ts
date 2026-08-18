import { describe, expect, it } from "vitest";
import { parseHexonMutation } from "@/lib/integrations/hexon";

const vehicleXml = `<?xml version="1.0" encoding="UTF-8"?>
<voertuig>
  <actie>toevoegen</actie>
  <voertuignr_hexon>5016729</voertuignr_hexon>
  <merk>Polestar</merk>
  <model>2</model>
  <type>Long Range Single Motor Plus 82 kWh</type>
  <bouwjaar>2024</bouwjaar>
  <tellerstand>12.345</tellerstand>
  <brandstof>Elektrisch</brandstof>
  <transmissie>Automaat</transmissie>
  <carrosserie>Hatchback</carrosserie>
  <kleur>Zwart</kleur>
  <kenteken>AB-12-CD</kenteken>
  <verkoopprijs_particulier><bedrag>39.950,00</bedrag><munteenheid>EUR</munteenheid></verkoopprijs_particulier>
  <opmerkingen>Volledig elektrische Polestar.</opmerkingen>
  <afbeeldingen><afbeelding><url>https://images.example.test/polestar.jpg</url></afbeelding></afbeeldingen>
</voertuig>`;

describe("Mobilox/Hexon incremental inventory", () => {
  it("maps the flat DV vehicle schema to a publishable VVOS vehicle in cents", () => {
    const mutation = parseHexonMutation(vehicleXml, new Date("2026-08-18T12:00:00.000Z"));
    expect(mutation.action).toBe("upsert");
    expect(mutation.externalId).toBe("5016729");
    expect(mutation.vehicle).toMatchObject({
      id: "hexon-5016729",
      brand: "Polestar",
      model: "2",
      year: 2024,
      mileageKm: 12345,
      priceCents: 3995000,
      driveType: "electric",
      status: "available",
      images: ["https://images.example.test/polestar.jpg"],
    });
    expect(mutation.vehicle?.publication?.channels.website).toBe(true);
  });

  it("maps the nested Hexon v2.25 price and uses the vehicle number instead of the request number", () => {
    const nestedXml = vehicleXml
      .replace("<voertuignr_hexon>5016729</voertuignr_hexon>", "<voertuignr_hexon>56015851</voertuignr_hexon><voertuignr>5016729</voertuignr>")
      .replace("<brandstof>Elektrisch</brandstof>", "<brandstof>E</brandstof>")
      .replace(
        "<verkoopprijs_particulier><bedrag>39.950,00</bedrag><munteenheid>EUR</munteenheid></verkoopprijs_particulier>",
        '<verkoopprijs_particulier><prijzen land="nl"><prijs nr="1"><bedrag>25911</bedrag><munteenheid>EUR</munteenheid></prijs></prijzen></verkoopprijs_particulier>',
      );

    const mutation = parseHexonMutation(nestedXml, new Date("2026-08-18T12:00:00.000Z"));
    expect(mutation.externalId).toBe("5016729");
    expect(mutation.vehicle).toMatchObject({
      id: "hexon-5016729",
      priceCents: 2591100,
      driveType: "electric",
      status: "available",
    });
  });

  it("stores a vehicle for review instead of publishing when Hexon omits the odometer", () => {
    const mutation = parseHexonMutation(vehicleXml.replace("<tellerstand>12.345</tellerstand>", "<tellerstand/>"));
    expect(mutation.vehicle?.status).toBe("review");
    expect(mutation.vehicle?.publication?.channels.website).toBe(false);
    expect(mutation.vehicle?.publication?.validationErrors).toContain("Kilometerstand ontbreekt");
  });

  it("archives a vehicle for a delete mutation without requiring commercial fields", () => {
    const mutation = parseHexonMutation("<voertuig><actie>verwijderen</actie><voertuignr_hexon>5016729</voertuignr_hexon></voertuig>");
    expect(mutation).toEqual({ action: "archive", externalId: "5016729" });
  });

  it("rejects entity declarations", () => {
    expect(() => parseHexonMutation('<!DOCTYPE x [<!ENTITY x "boom">]><voertuig><voertuignr_hexon>&x;</voertuignr_hexon></voertuig>')).toThrow("DTD en entities");
  });

  it("rejects combustion-only stock instead of presenting it as electric", () => {
    expect(() => parseHexonMutation(vehicleXml.replace("<brandstof>Elektrisch</brandstof>", "<brandstof>Benzine</brandstof>"))).toThrow("Niet-ondersteunde aandrijving");
  });

  it("keeps incomplete vehicles out of the public website", () => {
    const mutation = parseHexonMutation(vehicleXml.replace("<afbeeldingen><afbeelding><url>https://images.example.test/polestar.jpg</url></afbeelding></afbeeldingen>", ""));
    expect(mutation.vehicle?.status).toBe("review");
    expect(mutation.vehicle?.publication?.channels.website).toBe(false);
  });
});
