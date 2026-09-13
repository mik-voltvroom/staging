import { describe, expect, it } from "vitest";
import { canTransitionInspection, createDefaultChecklist, parseVoiceCommand } from "@/lib/glasses/business";
import type { InspectionSession } from "@/lib/glasses/model";

function sessionAt(itemId = "identification_mileage"): InspectionSession {
  const checklist = createDefaultChecklist();
  const item = checklist.find(candidate => candidate.id === itemId) ?? checklist[0];
  return {
    id: "inspection-1", vehicleId: "vehicle-1", inspectorId: "user-1", status: "active", startedAt: "2026-09-09T00:00:00.000Z", updatedAt: "2026-09-09T00:00:00.000Z",
    device: { adapter: "browser_camera", name: "Test", connected: true, network: "online", capabilities: { camera: true, microphone: true, audioOutput: true, display: false, video: false } },
    currentSection: item.section, currentItemId: item.id, checklist, observations: [], media: [], findings: [], version: 1,
  };
}

describe("VVOS Glasses business rules", () => {
  it("builds a modular CarCheck checklist", () => {
    const checklist = createDefaultChecklist();
    expect(checklist.length).toBeGreaterThan(40);
    expect(new Set(checklist.map(item => item.section))).toEqual(new Set(["identification", "exterior", "tires", "interior", "technical", "hybrid_ev"]));
  });

  it("parses Dutch mileage with thousands separator", () => {
    const command = parseVoiceCommand("Kilometerstand 42.831", sessionAt());
    expect(command.intent).toBe("SET_MILEAGE");
    expect(command.entities.value).toBe(42831);
  });

  it("parses wheel damage into structured entities", () => {
    const command = parseVoiceCommand("Velg rechtsvoor heeft lichte stoeprandschade", sessionAt("wheel_front_right"));
    expect(command.intent).toBe("ADD_DAMAGE");
    expect(command.entities.component).toBe("wheel");
    expect(command.entities.location).toBe("front_right");
    expect(command.entities.severity).toBe("minor");
  });

  it("uses current wheel context for a bare tread-depth value", () => {
    const command = parseVoiceCommand("3,4 millimeter", sessionAt("tire_front_right"));
    expect(command.intent).toBe("SET_TIRE_DEPTH");
    expect(command.entities.location).toBe("front_right");
    expect(command.entities.value).toBe(3.4);
  });

  it("recognizes a missing reserve key as an attention finding", () => {
    const command = parseVoiceCommand("Geen tweede sleutel aanwezig", sessionAt("identification_keys"));
    expect(command.intent).toBe("FLAG_FINDING");
    expect(command.entities.component).toBe("keys");
  });

  it("prevents reopening a completed inspection", () => {
    expect(canTransitionInspection("review", "completed")).toBe(true);
    expect(canTransitionInspection("completed", "active")).toBe(false);
  });
});
