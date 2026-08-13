"use client";
import type { Vehicle } from "@/types";
import { db } from "@/lib/firebase-client";
import { integrationMode } from "@/lib/config";
import { getVehicles, upsertVehicle as demoUpsert, deleteVehicle as demoDelete } from "@/lib/demo-store";
import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from "firebase/firestore";

export async function listVehicles(): Promise<Vehicle[]> {
  if (integrationMode !== "firebase" || !db) return getVehicles();
  const snapshot = await getDocs(query(collection(db, "vehicles"), orderBy("updatedAt", "desc")));
  return snapshot.docs.map(item => item.data() as Vehicle);
}

export async function saveVehicle(vehicle: Vehicle): Promise<void> {
  if (integrationMode !== "firebase" || !db) return demoUpsert(vehicle);
  await setDoc(doc(db, "vehicles", vehicle.id), vehicle, { merge: true });
}

export async function removeVehicle(id: string): Promise<void> {
  if (integrationMode !== "firebase" || !db) return demoDelete(id);
  await deleteDoc(doc(db, "vehicles", id));
}
