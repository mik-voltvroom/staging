import type {
  FindingSeverity,
  InspectionChecklistItem,
  InspectionSectionId,
  InspectionSession,
  InspectionStatus,
  ParsedVoiceCommand,
} from "@/lib/glasses/model";

const sections: Array<{ id: InspectionSectionId; items: Array<[string, string]> }> = [
  { id: "identification", items: [
    ["identification_license_plate", "Kenteken"], ["identification_vin", "VIN"], ["identification_mileage", "Kilometerstand"],
    ["identification_year", "Bouwjaar"], ["identification_keys", "Sleutelset"], ["identification_documents", "Documenten"],
  ] },
  { id: "exterior", items: [
    ["exterior_front_bumper", "Voorbumper"], ["exterior_hood", "Motorkap"], ["exterior_front_left_fender", "Linker voorscherm"],
    ["exterior_front_left_door", "Linker voorportier"], ["exterior_rear_left_door", "Linker achterportier"], ["exterior_rear_left_quarter", "Linker achterscherm"],
    ["exterior_rear_bumper", "Achterbumper"], ["exterior_rear_right_quarter", "Rechter achterscherm"], ["exterior_rear_right_door", "Rechter achterportier"],
    ["exterior_front_right_door", "Rechter voorportier"], ["exterior_front_right_fender", "Rechter voorscherm"], ["exterior_roof", "Dak"],
    ["exterior_glass", "Ruiten"], ["exterior_lights", "Verlichting"],
  ] },
  { id: "tires", items: [
    ["tire_front_left", "Band linksvoor"], ["wheel_front_left", "Velg linksvoor"], ["tire_front_right", "Band rechtsvoor"], ["wheel_front_right", "Velg rechtsvoor"],
    ["tire_rear_left", "Band linksachter"], ["wheel_rear_left", "Velg linksachter"], ["tire_rear_right", "Band rechtsachter"], ["wheel_rear_right", "Velg rechtsachter"],
  ] },
  { id: "interior", items: [
    ["interior_seats", "Stoelen"], ["interior_dashboard", "Dashboard"], ["interior_headliner", "Hemel"], ["interior_steering", "Stuur"],
    ["interior_infotainment", "Infotainment"], ["interior_climate", "Airconditioning"], ["interior_trim", "Bekleding"], ["interior_odor", "Geur"],
  ] },
  { id: "technical", items: [
    ["technical_engine", "Motor"], ["technical_transmission", "Transmissie"], ["technical_brakes", "Remmen"], ["technical_suspension", "Ophanging"],
    ["technical_warning_lights", "Waarschuwingslampjes"], ["technical_road_test", "Proefrit"],
  ] },
  { id: "hybrid_ev", items: [
    ["hybrid_ev_hv_battery", "HV-batterij"], ["hybrid_ev_soh", "State of Health"], ["hybrid_ev_charge_port", "Laadpoort"], ["hybrid_ev_cables", "Laadkabels"],
    ["hybrid_ev_ac", "AC-laden"], ["hybrid_ev_dc", "DC-laden"], ["hybrid_ev_dtcs", "Foutcodes"], ["hybrid_ev_battery_warnings", "Batterijwaarschuwingen"],
    ["hybrid_ev_range", "Elektrische actieradius"], ["hybrid_ev_thermal", "Thermisch management"],
  ] },
];

export function createDefaultChecklist(): InspectionChecklistItem[] {
  return sections.flatMap(section => section.items.map(([id, label]) => ({ id, section: section.id, label, status: "pending" as const })));
}

export function firstChecklistItem(): InspectionChecklistItem {
  return createDefaultChecklist()[0];
}

export function inspectionProgress(checklist: InspectionChecklistItem[]): { completed: number; total: number; percent: number } {
  const completed = checklist.filter(item => item.status !== "pending").length;
  const total = checklist.length;
  return { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 };
}

export function moveChecklistCursor(session: InspectionSession, direction: 1 | -1): Pick<InspectionSession, "currentSection" | "currentItemId"> {
  const index = Math.max(0, session.checklist.findIndex(item => item.id === session.currentItemId));
  const next = session.checklist[Math.min(session.checklist.length - 1, Math.max(0, index + direction))] ?? session.checklist[0];
  return { currentSection: next.section, currentItemId: next.id };
}

const transitions: Record<InspectionStatus, ReadonlySet<InspectionStatus>> = {
  draft: new Set(["active", "cancelled"]),
  active: new Set(["paused", "review", "cancelled"]),
  paused: new Set(["active", "review", "cancelled"]),
  processing: new Set(["review", "cancelled"]),
  review: new Set(["completed", "active", "cancelled"]),
  completed: new Set(),
  cancelled: new Set(),
};

export function canTransitionInspection(from: InspectionStatus, to: InspectionStatus): boolean {
  return from === to || transitions[from].has(to);
}

export function assertInspectionTransition(from: InspectionStatus, to: InspectionStatus): void {
  if (!canTransitionInspection(from, to)) throw new Error(`Ongeldige inspectiestatus: ${from} → ${to}.`);
}

function normalizedNumber(value: string): number | undefined {
  const cleaned = value.replace(/\s/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function detectLocation(text: string): string | undefined {
  const map: Array<[RegExp, string]> = [
    [/\b(rechtsvoor|voor rechts|rv)\b/i, "front_right"], [/\b(linksvoor|voor links|lv)\b/i, "front_left"],
    [/\b(rechtsachter|achter rechts|ra)\b/i, "rear_right"], [/\b(linksachter|achter links|la)\b/i, "rear_left"],
    [/rechter achterdeur/i, "rear_right_door"], [/linker achterdeur/i, "rear_left_door"], [/rechter voor(?:deur|portier)/i, "front_right_door"], [/linker voor(?:deur|portier)/i, "front_left_door"],
  ];
  return map.find(([pattern]) => pattern.test(text))?.[1];
}

function locationFromCurrentItem(itemId: string): string | undefined {
  const match = itemId.match(/_(front_left|front_right|rear_left|rear_right)$/);
  return match?.[1];
}

function severityFromText(text: string): FindingSeverity {
  if (/kritiek|onveilig|gevaarlijk|ernstig defect/i.test(text)) return "critical";
  if (/groot|diep|fors|ernstig/i.test(text)) return "major";
  if (/licht|lichte|klein|kleine|oppervlakkig/i.test(text)) return "minor";
  return "attention";
}

function componentFromText(text: string): string {
  if (/velg/i.test(text)) return "wheel";
  if (/band/i.test(text)) return "tire";
  if (/deur|portier/i.test(text)) return "door";
  if (/bumper/i.test(text)) return "bumper";
  if (/ruit|glas/i.test(text)) return "glass";
  if (/lamp|verlichting/i.test(text)) return "lighting";
  return "body";
}

export function parseVoiceCommand(rawText: string, session: InspectionSession): ParsedVoiceCommand {
  const text = rawText.trim();
  const lower = text.toLowerCase();
  const current = session.checklist.find(item => item.id === session.currentItemId);

  if (/^(start|begin).*(carcheck|inspectie)/i.test(text)) return { intent: "START_INSPECTION", rawText: text, confidence: .99, entities: {} };
  if (/\b(maak|neem).*(foto|fotootje)|\bfoto\b/i.test(text)) return { intent: "CAPTURE_PHOTO", rawText: text, confidence: .99, entities: {} };
  if (/\bvolgende\b/i.test(lower)) return { intent: "NEXT_SECTION", rawText: text, confidence: .98, entities: {} };
  if (/\b(ga terug|vorige)\b/i.test(lower)) return { intent: "PREVIOUS_SECTION", rawText: text, confidence: .98, entities: {} };
  if (/\bpauze(?:er)?\b/i.test(lower)) return { intent: "PAUSE_INSPECTION", rawText: text, confidence: .98, entities: {} };
  if (/\bhervat|ga verder\b/i.test(lower)) return { intent: "RESUME_INSPECTION", rawText: text, confidence: .98, entities: {} };
  if (/\b(stop|afronden|voltooi).*(inspectie|carcheck)?\b/i.test(lower)) return { intent: "COMPLETE_INSPECTION", rawText: text, confidence: .96, entities: {} };
  if (/\binkoopadvies\b/i.test(lower)) return { intent: "REQUEST_PURCHASE_ADVICE", rawText: text, confidence: .99, entities: {} };

  const mileage = text.match(/kilometerstand\s*(?:is|van)?\s*([0-9][0-9.,\s]*)/i);
  if (mileage?.[1]) {
    const value = normalizedNumber(mileage[1]);
    if (value !== undefined) return { intent: "SET_MILEAGE", rawText: text, confidence: .99, entities: { value: Math.round(value), unit: "km" } };
  }

  const explicitDepth = text.match(/(?:band|voorband|achterband)?\s*(linksvoor|rechtsvoor|linksachter|rechtsachter|lv|rv|la|ra)?[^0-9]*([0-9]+(?:[.,][0-9]+)?)\s*(?:mm|millimeter)/i);
  const contextualDepth = current?.id.startsWith("tire_") ? text.match(/^\s*([0-9]+(?:[.,][0-9]+)?)\s*(?:mm|millimeter)?\s*$/i) : null;
  const depthMatch = explicitDepth ?? contextualDepth;
  if (depthMatch) {
    const rawValue = explicitDepth ? depthMatch[2] : depthMatch[1];
    const value = rawValue ? normalizedNumber(rawValue) : undefined;
    const location = detectLocation(text) ?? (current ? locationFromCurrentItem(current.id) : undefined);
    if (value !== undefined && location) return { intent: "SET_TIRE_DEPTH", rawText: text, confidence: explicitDepth ? .98 : .88, entities: { value, unit: "mm", location, component: "tire" } };
  }

  if (/geen (?:tweede|reserve)[ -]?sleutel|sleutel ontbreekt/i.test(lower)) return { intent: "FLAG_FINDING", rawText: text, confidence: .96, entities: { component: "keys", severity: "attention", description: text } };

  if (/kras|deuk|schade|beschadigd|stoeprand|scheur|barst/i.test(lower)) {
    return {
      intent: "ADD_DAMAGE", rawText: text, confidence: .94,
      entities: { component: componentFromText(text), location: detectLocation(text) ?? (current ? locationFromCurrentItem(current.id) : undefined), severity: severityFromText(text), description: text },
    };
  }

  if (/markeer.*aandacht|aandachtspunt/i.test(lower)) return { intent: "FLAG_FINDING", rawText: text, confidence: .9, entities: { severity: "attention", description: text } };
  return { intent: "ADD_OBSERVATION", rawText: text, confidence: .72, entities: { description: text } };
}

export function checklistItemForTireLocation(location: string): string | undefined {
  const valid = new Set(["front_left", "front_right", "rear_left", "rear_right"]);
  return valid.has(location) ? `tire_${location}` : undefined;
}

export function reviewSummary(session: InspectionSession): { ok: number; attention: number; repairs: number; critical: number } {
  return {
    ok: session.checklist.filter(item => item.status === "ok").length,
    attention: session.findings.filter(finding => finding.reviewStatus !== "dismissed" && ["minor", "attention"].includes(finding.severity)).length,
    repairs: session.findings.filter(finding => finding.reviewStatus !== "dismissed" && finding.severity === "major").length,
    critical: session.findings.filter(finding => finding.reviewStatus !== "dismissed" && finding.severity === "critical").length,
  };
}
