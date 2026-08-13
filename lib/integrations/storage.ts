"use client";
import { storage } from "@/lib/firebase-client";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export async function uploadVehicleImage(vehicleId: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
  if (!storage) throw new Error("Firebase Storage is niet geconfigureerd.");
  if (!file.type.startsWith("image/")) throw new Error("Alleen afbeeldingen zijn toegestaan.");
  if (file.size > 15 * 1024 * 1024) throw new Error("Een foto mag maximaal 15 MB zijn.");
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const target = ref(storage, `vehicles/${vehicleId}/${Date.now()}-${safeName}`);
  const task = uploadBytesResumable(target, file, { contentType: file.type, customMetadata: { vehicleId } });
  return await new Promise((resolve, reject) => {
    task.on("state_changed", snapshot => onProgress?.(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100)), reject, async () => resolve(await getDownloadURL(task.snapshot.ref)));
  });
}
