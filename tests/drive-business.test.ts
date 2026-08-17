import { describe, expect, it } from "vitest";
import {
  VEHICLE_DOSSIER_FOLDERS,
  validateVehicleForDossier,
  vehicleDossierFolderName,
} from "@/lib/drive/business";

describe("vehicle Drive dossier rules", () => {
  it("uses the fixed 12-folder Volt & Vroom dossier structure", () => {
    expect(VEHICLE_DOSSIER_FOLDERS).toHaveLength(12);
    expect(VEHICLE_DOSSIER_FOLDERS[0]).toBe("01 Inkoop");
    expect(VEHICLE_DOSSIER_FOLDERS[11]).toBe(
      "12 Garantie & Aftersales",
    );
  });

  it("builds the canonical folder name from plate, vehicle and VIN tail", () => {
    expect(
      vehicleDossierFolderName({
        id: "veh-1",
        licensePlate: "12-ab-cd",
        brand: "Toyota",
        model: "Corolla",
        vin: "JTN123456789ABCD",
      }),
    ).toBe("12-AB-CD – Toyota Corolla – 89ABCD");
  });

  it("sanitizes invalid Drive filename characters", () => {
    expect(
      vehicleDossierFolderName({
        id: "vehicle-123456",
        licensePlate: "xx/yy",
        brand: "VW",
        model: "ID:4",
      }),
    ).toBe("XX-YY – VW ID-4 – 123456");
  });

  it("rejects dossiers without id, brand or model", () => {
    expect(() =>
      validateVehicleForDossier({
        id: "",
        brand: "Toyota",
        model: "Yaris",
      }),
    ).toThrow();
    expect(() =>
      validateVehicleForDossier({
        id: "veh",
        brand: " ",
        model: "Yaris",
      }),
    ).toThrow();
    expect(() =>
      validateVehicleForDossier({
        id: "veh",
        brand: "Toyota",
        model: " ",
      }),
    ).toThrow();
  });
});
