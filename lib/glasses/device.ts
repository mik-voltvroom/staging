"use client";

import type { MediaCapture, WearableDeviceAdapter, WearableDeviceSnapshot } from "@/lib/glasses/model";

export class BrowserCameraAdapter implements WearableDeviceAdapter {
  private stream: MediaStream | null = null;
  private connected = false;

  async connect(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera wordt niet ondersteund op dit apparaat.");
    this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
    this.connected = true;
  }
  async disconnect(): Promise<void> { this.stream?.getTracks().forEach(track => track.stop()); this.stream = null; this.connected = false; }
  async startCamera(): Promise<void> { if (!this.connected) await this.connect(); }
  async stopCamera(): Promise<void> { await this.disconnect(); }
  async capturePhoto(): Promise<MediaCapture> {
    if (!this.stream) await this.connect();
    const track = this.stream?.getVideoTracks()[0];
    if (!track) throw new Error("Geen actieve camera.");
    const video = document.createElement("video");
    video.srcObject = this.stream;
    video.playsInline = true;
    await video.play();
    await new Promise(resolve => setTimeout(resolve, 120));
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    video.pause();
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("Foto kon niet worden gemaakt.")), "image/jpeg", .92));
    return { kind: "photo", file: new File([blob], `inspection-${Date.now()}.jpg`, { type: "image/jpeg" }), capturedAt: new Date().toISOString() };
  }
  async startVideo(): Promise<void> { throw new Error("Video volgt in P1."); }
  async stopVideo(): Promise<MediaCapture> { throw new Error("Video volgt in P1."); }
  async startAudio(): Promise<void> {}
  async stopAudio(): Promise<void> {}
  async speak(text: string): Promise<void> {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-NL";
    speechSynthesis.speak(utterance);
  }
  getSnapshot(): WearableDeviceSnapshot {
    return { adapter: "browser_camera", name: "VVOS Companion camera", connected: this.connected, network: typeof navigator === "undefined" ? "unknown" : navigator.onLine ? "online" : "offline", capabilities: { camera: true, microphone: true, audioOutput: true, display: false, video: false } };
  }
}

export class MetaCompanionAdapter implements WearableDeviceAdapter {
  private unavailable(): never { throw new Error("Meta Companion adapter is voorbereid maar vereist de native Wearables SDK-koppeling in P1."); }
  connect(): Promise<void> { return Promise.reject(this.unavailable()); }
  disconnect(): Promise<void> { return Promise.resolve(); }
  startCamera(): Promise<void> { return Promise.reject(this.unavailable()); }
  stopCamera(): Promise<void> { return Promise.resolve(); }
  capturePhoto(): Promise<MediaCapture> { return Promise.reject(this.unavailable()); }
  startVideo(): Promise<void> { return Promise.reject(this.unavailable()); }
  stopVideo(): Promise<MediaCapture> { return Promise.reject(this.unavailable()); }
  startAudio(): Promise<void> { return Promise.reject(this.unavailable()); }
  stopAudio(): Promise<void> { return Promise.resolve(); }
  speak(): Promise<void> { return Promise.reject(this.unavailable()); }
  getSnapshot(): WearableDeviceSnapshot { return { adapter: "meta_companion", name: "Smart glasses", connected: false, network: "unknown", capabilities: { camera: true, microphone: true, audioOutput: true, display: false, video: true } }; }
}

export class MockGlassesAdapter implements WearableDeviceAdapter {
  private connected = false;
  async connect(): Promise<void> { this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async startCamera(): Promise<void> { this.connected = true; }
  async stopCamera(): Promise<void> {}
  async capturePhoto(): Promise<MediaCapture> {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    return { kind: "photo", file: new File([bytes], `mock-${Date.now()}.jpg`, { type: "image/jpeg" }), capturedAt: new Date().toISOString() };
  }
  async startVideo(): Promise<void> {}
  async stopVideo(): Promise<MediaCapture> { throw new Error("Mock video niet geïmplementeerd."); }
  async startAudio(): Promise<void> {}
  async stopAudio(): Promise<void> {}
  async speak(): Promise<void> {}
  getSnapshot(): WearableDeviceSnapshot { return { adapter: "mock", name: "VVOS Glasses Simulator", connected: this.connected, batteryPercent: 74, network: typeof navigator === "undefined" ? "unknown" : navigator.onLine ? "online" : "offline", capabilities: { camera: true, microphone: true, audioOutput: true, display: true, video: false } }; }
}
