export type InspectionStatus = "draft" | "active" | "paused" | "processing" | "review" | "completed" | "cancelled";
export type InspectionSectionId = "identification" | "documentation" | "body" | "glass_lighting" | "interior" | "tires_wheels" | "brakes" | "chassis" | "drivetrain" | "electronics_12v" | "hybrid_ev" | "road_test" | "final_check";
export type ChecklistStatus = "pending" | "ok" | "attention" | "fail" | "na";
export type FindingSeverity = "info" | "minor" | "attention" | "major" | "critical";
export type FindingSource = "manual" | "voice" | "vision" | "vehicle_data" | "diagnostic" | "ai";
export type FindingReviewStatus = "suggested" | "confirmed" | "dismissed";
export type ObservationSource = "manual" | "voice";
export type MediaKind = "photo" | "video";
export type MediaStatus = "pending" | "uploaded" | "failed";
export type WearableAdapterType = "browser_camera" | "meta_companion" | "mock";

export interface DeviceCapabilities { camera: boolean; microphone: boolean; audioOutput: boolean; display: boolean; video: boolean; }
export interface WearableDeviceSnapshot { adapter: WearableAdapterType; name: string; connected: boolean; batteryPercent?: number; network: "online" | "offline" | "unknown"; capabilities: DeviceCapabilities; }

export interface InspectionChecklistItem {
  id: string;
  number?: number;
  section: InspectionSectionId;
  category?: string;
  label: string;
  safetyCritical?: boolean;
  status: ChecklistStatus;
  value?: string | number;
  unit?: string;
  note?: string;
  repairAction?: string;
  repairCostCents?: number;
  updatedAt?: string;
}

export interface InspectionSession {
  id: string; vehicleId: string; inspectorId: string; inspectorEmail?: string | null; status: InspectionStatus; startedAt: string; completedAt?: string; updatedAt: string;
  device: WearableDeviceSnapshot; currentSection: InspectionSectionId; currentItemId: string; mileageKm?: number; checklist: InspectionChecklistItem[];
  observations: InspectionObservation[]; media: InspectionMedia[]; findings: Finding[]; version: 1;
}

export interface InspectionObservation { id: string; inspectionId: string; vehicleId: string; text: string; source: ObservationSource; section: InspectionSectionId; itemId?: string; createdBy: string; createdAt: string; }
export interface Finding { id: string; inspectionId: string; vehicleId: string; category: string; component: string; location?: string; severity: FindingSeverity; description: string; aiDescription?: string; estimatedRepairCostCents?: number; mediaIds: string[]; confidence?: number; source: FindingSource; reviewStatus: FindingReviewStatus; createdBy: string; createdAt: string; updatedAt: string; }
export interface InspectionMedia { id: string; inspectionId: string; vehicleId: string; kind: MediaKind; storagePath: string; contentType: string; section: InspectionSectionId; itemId?: string; category?: string; component?: string; location?: string; sourceDevice: WearableAdapterType; status: MediaStatus; sizeBytes?: number; createdBy: string; capturedAt: string; createdAt: string; updatedAt: string; }

export type VoiceIntent = "START_INSPECTION" | "CAPTURE_PHOTO" | "START_VIDEO" | "STOP_VIDEO" | "ADD_OBSERVATION" | "ADD_DAMAGE" | "SET_TIRE_DEPTH" | "SET_MILEAGE" | "NEXT_SECTION" | "PREVIOUS_SECTION" | "FLAG_FINDING" | "PAUSE_INSPECTION" | "RESUME_INSPECTION" | "COMPLETE_INSPECTION" | "REQUEST_PURCHASE_ADVICE";
export interface ParsedVoiceCommand { intent: VoiceIntent; rawText: string; confidence: number; entities: { value?: number; unit?: string; component?: string; location?: string; severity?: FindingSeverity; description?: string; }; }
export interface MediaCapture { kind: MediaKind; file: File; capturedAt: string; }
export interface WearableDeviceAdapter { connect(): Promise<void>; disconnect(): Promise<void>; startCamera(): Promise<void>; stopCamera(): Promise<void>; capturePhoto(): Promise<MediaCapture>; startVideo(): Promise<void>; stopVideo(): Promise<MediaCapture>; startAudio(): Promise<void>; stopAudio(): Promise<void>; speak(text: string): Promise<void>; getSnapshot(): WearableDeviceSnapshot; }
