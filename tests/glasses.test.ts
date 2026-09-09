import { describe, expect, it } from "vitest";
import { canTransitionInspection, createDefaultChecklist, parseVoiceCommand } from "@/lib/glasses/business";
import { evaluateCarCheck101 } from "@/lib/glasses/carcheck101";
import type { InspectionSession } from "@/lib/glasses/model";

function sessionAt(itemId = "identification_mileage"): InspectionSession {
  const checklist = createDefaultChecklist(); const item = checklist.find(candidate => candidate.id === itemId) ?? checklist[0];
  return { id:"inspection-1",vehicleId:"vehicle-1",inspectorId:"user-1",status:"active",startedAt:"2026-09-09T00:00:00.000Z",updatedAt:"2026-09-09T00:00:00.000Z",device:{adapter:"browser_camera",name:"Test",connected:true,network:"online",capabilities:{camera:true,microphone:true,audioOutput:true,display:false,video:false}},currentSection:item.section,currentItemId:item.id,checklist,observations:[],media:[],findings:[],version:1 };
}

describe("VVOS Glasses business rules", () => {
  it("builds the official 101-point VV CarCheck", () => {
    const checklist=createDefaultChecklist();
    expect(checklist).toHaveLength(101);
    expect(checklist[0]).toMatchObject({number:1,id:"identification_license_plate",category:"Identificatie"});
    expect(checklist[100]).toMatchObject({number:101,id:"final_advice",category:"Eindcontrole"});
    expect(new Set(checklist.map(item=>item.section)).size).toBe(13);
  });
  it("parses Dutch mileage with thousands separator",()=>{const c=parseVoiceCommand("Kilometerstand 42.831",sessionAt());expect(c.intent).toBe("SET_MILEAGE");expect(c.entities.value).toBe(42831);});
  it("parses wheel damage into structured entities",()=>{const c=parseVoiceCommand("Velg rechtsvoor heeft lichte stoeprandschade",sessionAt("wheels_condition"));expect(c.intent).toBe("ADD_DAMAGE");expect(c.entities.component).toBe("wheel");expect(c.entities.location).toBe("front_right");expect(c.entities.severity).toBe("minor");});
  it("uses current wheel context for a bare tread-depth value",()=>{const c=parseVoiceCommand("3,4 millimeter",sessionAt("tire_front_right"));expect(c.intent).toBe("SET_TIRE_DEPTH");expect(c.entities.location).toBe("front_right");expect(c.entities.value).toBe(3.4);});
  it("recognizes a missing reserve key as an attention finding",()=>{const c=parseVoiceCommand("Geen tweede sleutel aanwezig",sessionAt("identification_keys"));expect(c.intent).toBe("FLAG_FINDING");expect(c.entities.component).toBe("keys");});
  it("prevents reopening a completed inspection",()=>{expect(canTransitionInspection("review","completed")).toBe(true);expect(canTransitionInspection("completed","active")).toBe(false);});
});

describe("VV CarCheck 101 release logic",()=>{
  it("blocks release while the 101 points are incomplete",()=>{const result=evaluateCarCheck101(sessionAt());expect(result.handled).toBe(0);expect(result.decision).toBe("INCOMPLETE");expect(result.releaseBlocked).toBe(true);});
  it("approves only when all 101 points are handled without deviations",()=>{const session=sessionAt();session.checklist=session.checklist.map(i=>({...i,status:"ok" as const}));const result=evaluateCarCheck101(session);expect(result.handled).toBe(101);expect(result.decision).toBe("VV_APPROVED");expect(result.scorePercent).toBe(100);});
  it("rejects a complete inspection only when AFKEUR is marked Veiligheidskritisch",()=>{const session=sessionAt();session.checklist=session.checklist.map(i=>({...i,status:"ok" as const}));session.checklist=session.checklist.map(i=>i.id==="brakes_front_pads"?{...i,status:"fail" as const,riskLevel:"safety_critical" as const}:i);const result=evaluateCarCheck101(session);expect(result.decision).toBe("REJECTED");expect(result.safetyCriticalRejected).toBe(1);});
  it("requires repair for non-safety attention points",()=>{const session=sessionAt();session.checklist=session.checklist.map(i=>({...i,status:"ok" as const}));session.checklist=session.checklist.map(i=>i.id==="body_paint_variance"?{...i,status:"attention" as const,riskLevel:"medium" as const,note:"Lakverschil",repairAction:"Lak beoordelen",repairCostCents:25000}:i);const result=evaluateCarCheck101(session);expect(result.decision).toBe("REPAIR_REQUIRED");expect(result.releaseBlocked).toBe(true);});
});
