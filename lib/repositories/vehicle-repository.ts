"use client";
import type { Vehicle } from "@/types";
import { db } from "@/lib/firebase-client";
import { integrationMode } from "@/lib/config";
import { getVehicles, upsertVehicle as demoUpsert, deleteVehicle as demoDelete } from "@/lib/demo-store";
import { collection, deleteDoc, deleteField, doc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { normalizeVehicleDocument } from "@/lib/vehicle/money";

export async function listVehicles(): Promise<Vehicle[]> {
  if (integrationMode !== "firebase" || !db) return getVehicles();
  const snapshot = await getDocs(query(collection(db, "vehicles"), orderBy("updatedAt", "desc")));
  return snapshot.docs.map(item => normalizeVehicleDocument(item.id, item.data()));
}

export async function saveVehicle(vehicle: Vehicle): Promise<void> {
  if (integrationMode !== "firebase" || !db) return demoUpsert(vehicle);
  const legacyTopLevelDeletes = {
    priceEur: deleteField(),
    monthlyPriceEur: deleteField(),
    annualSavingEur: deleteField(),
  };
  const legacyCostDeletes = vehicle.costs ? {
    purchasePriceEur: deleteField(),
    transportEur: deleteField(),
    preparationEur: deleteField(),
    maintenanceEur: deleteField(),
    warrantyReserveEur: deleteField(),
    advertisingEur: deleteField(),
    financingEur: deleteField(),
    otherEur: deleteField(),
  } : {};
  await setDoc(doc(db, "vehicles", vehicle.id), {
    ...vehicle,
    ...legacyTopLevelDeletes,
    ...(vehicle.costs ? { costs: { ...vehicle.costs, ...legacyCostDeletes } } : {}),
  }, { merge: true });
}

export async function removeVehicle(id: string): Promise<void> {
  if (integrationMode !== "firebase" || !db) return demoDelete(id);
  await deleteDoc(doc(db, "vehicles", id));
}
