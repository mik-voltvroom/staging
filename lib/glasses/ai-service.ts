import type { Vehicle } from "@/types";
import { parseVoiceCommand, reviewSummary } from "@/lib/glasses/business";
import type { FindingSeverity, InspectionSession, ParsedVoiceCommand } from "@/lib/glasses/model";
import { generatePurchaseAdvice, type PurchaseAdvice, type PurchaseAdviceOverrides } from "@/lib/glasses/purchase-intelligence";

export interface StructuredObservation {
  text: string;
  category: string;
  component?: string;
  location?: string;
  value?: number;
  unit?: string;
  confidence: number;
}

export interface VisionSuggestion {
  category: string;
  component: string;
  location?: string;
  severity: FindingSeverity;
  description: string;
  confidence: number;
}

export interface InspectionSummary {
  inspectionId: string;
  generatedAt: string;
  progressPercent: number;
  counts: { ok: number; attention: number; repairs: number; critical: number };
  confirmedFindings: number;
  suggestedFindings: number;
  unreviewedChecklistItems: number;
  headline: string;
}

export interface VehicleImageContext {
  session: InspectionSession;
  vehicle?: Vehicle;
  imageUrl: string;
  mediaId: string;
}

export interface VVOSAIProvider {
  analyzeVehicleImage?(context: VehicleImageContext): Promise<VisionSuggestion[]>;
}

export class VVOSAIService {
  constructor(private readonly provider?: VVOSAIProvider) {}

  async transcribeAudio(): Promise<never> {
    throw new Error("Audio transcription provider is niet aangesloten; companion transcriptie blijft de P1 input.");
  }

  async classifyVoiceIntent(text: string, session: InspectionSession): Promise<ParsedVoiceCommand> {
    return parseVoiceCommand(text, session);
  }

  async structureObservation(text: string, session: InspectionSession): Promise<StructuredObservation> {
    const command = await this.classifyVoiceIntent(text, session);
    return {
      text,
      category: session.currentSection,
      component: command.entities.component,
      location: command.entities.location,
      value: command.entities.value,
      unit: command.entities.unit,
      confidence: command.confidence,
    };
  }

  async analyzeVehicleImage(context: VehicleImageContext): Promise<VisionSuggestion[]> {
    if (!this.provider?.analyzeVehicleImage) throw new Error("VVOS Vision provider is niet geconfigureerd.");
    return this.provider.analyzeVehicleImage(context);
  }

  async detectDamage(context: VehicleImageContext): Promise<VisionSuggestion[]> {
    return (await this.analyzeVehicleImage(context)).filter(item => item.severity !== "info");
  }

  async generateInspectionSummary(session: InspectionSession): Promise<InspectionSummary> {
    const counts = reviewSummary(session);
    const completed = session.checklist.filter(item => item.status !== "pending").length;
    const total = session.checklist.length;
    const confirmedFindings = session.findings.filter(finding => finding.reviewStatus === "confirmed").length;
    const suggestedFindings = session.findings.filter(finding => finding.reviewStatus === "suggested").length;
    const unreviewedChecklistItems = total - completed;
    return {
      inspectionId: session.id,
      generatedAt: new Date().toISOString(),
      progressPercent: total ? Math.round((completed / total) * 100) : 0,
      counts,
      confirmedFindings,
      suggestedFindings,
      unreviewedChecklistItems,
      headline: counts.critical > 0
        ? "Kritieke bevinding vereist beoordeling."
        : counts.repairs > 0
          ? `${counts.repairs} reparatiepunt(en) vragen aandacht.`
          : counts.attention > 0
            ? `${counts.attention} aandachtspunt(en) gevonden.`
            : "Geen bevestigde technische of cosmetische aandachtspunten geregistreerd.",
    };
  }

  async generatePurchaseAdvice(vehicle: Vehicle, session?: InspectionSession, overrides: PurchaseAdviceOverrides = {}): Promise<PurchaseAdvice> {
    return generatePurchaseAdvice(vehicle, session, overrides);
  }
}

export const vvosAIService = new VVOSAIService();
