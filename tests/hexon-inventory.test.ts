import { afterEach, describe, expect, it } from "vitest";
import { parseHexonMutation } from "@/lib/integrations/hexon";
import { hexonCredentialsConfigured, verifyHexonAuthorization } from "@/lib/integrations/hexon-service";

const vehicleXml = `<?xml version="1.0" encoding="UTF-8"?>
<voertuig>
  <actie>toevoegen</actie>
  <voertuignr_hexon>5016729</voertuignr_hexon>
  <merk>Polestar</merk><model>2</model><type>Long Range Single Motor Plus 82 kWh</type>
  <bouwjaar>2024</bouwjaar><tellerstand>12.345</tellerstand><brandstof>Elektrisch</brandstof>
  <transmissie>Automaat</transmissie><carrosserie>Hatchback</carrosserie><kleur>Zwart</kleur><kenteken>AB-12-CD</kenteken>
  <verkoopprijs_particulier><bedrag>39.950,00</bedrag><munteenheid>EUR</munteenheid></verkoopprijs_particulier>
  <opmerkingen>Volledig elektrische Polestar.</opmerkingen>
  <afbeeldingen><afbeelding><url>https://images.example.test/polestar.jpg</url></afbeelding></afbeeldingen>
</voertuig>`;

const originalUser = process.env.HEXON_SYNC_USERNAME;
const originalPassword = process.env.HEXON_SYNC_PASSWORD;
afterEach(() => {
  if (originalUser === undefined) delete process.env.HEXON_SYNC_USERNAME; else process.env.HEXON_SYNC_USERNAME = originalUser;
  if (originalPassword === undefined) delete process.env.HEXON_SYNC_PASSWORD; else process.env.HEXON_SYNC_PASSWORD = originalPassword;
});

describe("Mobilox/Hexon incremental inventory", () => {
  it("maps a publishable VVOS vehicle in cents", () => {
    const mutation = parseHexonMutation(vehicleXml, new Date("2026-08-18T12:00:00.000Z"));
    expect(mutation.action).toBe("upsert");
    expect(mutation.providerAction).toBe("add");
    expect(mutation.externalId).toBe("5016729");
    expect(mutation.vehicle).toMatchObject({ id: "hexon-5016729", brand: "Polestar", model: "2", year: 2024, mileageKm: 12345, priceCents: 3995000, driveType: "electric", status: "available", images: ["https://images.example.test/polestar.jpg"] });
    expect(mutation.vehicle?.publication?.channels.website).toBe(true);
  });

  it("parses Hexon v2.25 attributes including actie=add", () => {
    const xml = vehicleXml
      .replace("<voertuig>", '<voertuig actie="add" voertuignr_hexon="56015851" voertuignr="5016729">')
      .replace("<actie>toevoegen</actie>", "")
      .replace("<voertuignr_hexon>5016729</voertuignr_hexon>", "");
    const mutation = parseHexonMutation(xml);
    expect(mutation.action).toBe("upsert");
    expect(mutation.providerAction).toBe("add");
    expect(mutation.externalId).toBe("5016729");
  });

  it("preserves change as provider action while using an upsert internally", () => {
    const xml = vehicleXml
      .replace("<voertuig>", '<voertuig actie="change">')
      .replace("<actie>toevoegen</actie>", "");
    const mutation = parseHexonMutation(xml);
    expect(mutation.action).toBe("upsert");
    expect(mutation.providerAction).toBe("change");
  });

  it("maps nested Hexon v2.25 pricing", () => {
    const nestedXml = vehicleXml.replace("<voertuignr_hexon>5016729</voertuignr_hexon>", "<voertuignr_hexon>56015851</voertuignr_hexon><voertuignr>5016729</voertuignr>").replace("<brandstof>Elektrisch</brandstof>", "<brandstof>E</brandstof>").replace("<verkoopprijs_particulier><bedrag>39.950,00</bedrag><munteenheid>EUR</munteenheid></verkoopprijs_particulier>", '<verkoopprijs_particulier><prijzen land="nl"><prijs nr="1"><bedrag>25911</bedrag><munteenheid>EUR</munteenheid></prijs></prijzen></verkoopprijs_particulier>');
    const mutation = parseHexonMutation(nestedXml);
    expect(mutation.vehicle).toMatchObject({ id: "hexon-5016729", priceCents: 2591100, driveType: "electric" });
  });

  it("honours tellerstand unit K and converts M to kilometres", () => {
    const kilometres = parseHexonMutation(vehicleXml.replace("<tellerstand>12.345</tellerstand>", '<tellerstand eenheid="K">12345</tellerstand>'));
    expect(kilometres.vehicle?.mileageKm).toBe(12345);

    const miles = parseHexonMutation(vehicleXml.replace("<tellerstand>12.345</tellerstand>", '<tellerstand eenheid="M">10000</tellerstand>'));
    expect(miles.vehicle?.mileageKm).toBe(16093);
  });

  it("archives attribute-style delete mutations", () => {
    expect(parseHexonMutation('<voertuig actie="delete" voertuignr="5016729" voertuignr_hexon="56015851"/>')).toEqual({ action: "archive", providerAction: "delete", externalId: "5016729" });
  });

  it("keeps incomplete vehicles out of the public website", () => {
    const mutation = parseHexonMutation(vehicleXml.replace("<tellerstand>12.345</tellerstand>", "<tellerstand/>"));
    expect(mutation.vehicle?.status).toBe("review");
    expect(mutation.vehicle?.publication?.channels.website).toBe(false);
  });

  it("rejects entity declarations and combustion-only stock", () => {
    expect(() => parseHexonMutation('<!DOCTYPE x [<!ENTITY x "boom">]><voertuig><voertuignr_hexon>&x;</voertuignr_hexon></voertuig>')).toThrow("DTD en entities");
    expect(() => parseHexonMutation(vehicleXml.replace("<brandstof>Elektrisch</brandstof>", "<brandstof>Benzine</brandstof>"))).toThrow("Niet-ondersteunde aandrijving");
  });

  it("uses one fail-closed Basic Auth configuration", () => {
    process.env.HEXON_SYNC_USERNAME = "feed";
    process.env.HEXON_SYNC_PASSWORD = "Volt1";
    expect(hexonCredentialsConfigured()).toBe(true);
    expect(verifyHexonAuthorization(`Basic ${Buffer.from("feed:Volt1").toString("base64")}`)).toBe(true);
    expect(verifyHexonAuthorization(`Basic ${Buffer.from("feed:wrong").toString("base64")}`)).toBe(false);
    delete process.env.HEXON_SYNC_PASSWORD;
    expect(hexonCredentialsConfigured()).toBe(false);
    expect(verifyHexonAuthorization(`Basic ${Buffer.from("feed:Volt1").toString("base64")}`)).toBe(false);
  });
});
