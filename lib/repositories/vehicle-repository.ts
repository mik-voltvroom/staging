"use client";
import type { Vehicle } from "@/types";
import { db } from "@/lib/firebase-client";
import { integrationMode } from "@/lib/config";
import { getVehicles, upsertVehicle as demoUpsert, deleteVehicle as demoDelete } from "@/lib/demo-store";
import { deleteDoc, deleteField, doc, setDoc } from "firebase/firestore";

interface VehicleListResponse {
  ok: boolean;
  vehicles?: Vehicle[];
  error?: string;
}

export async function listVehicles(): Promise<Vehicle[]> {
  if (integrationMode !== "firebase") return getVehicles();

  const response = await fetch("/api/vvos/vehicles", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  const payload = await response.json() as VehicleListResponse;
  if (!response.ok || !payload.ok || !Array.isArray(payload.vehicles)) {
    throw new Error(payload.error || `Voorraad laden mislukt (${response.status}).`);
  }
  return payload.vehicles;
}

export async function getVehicle(id: string): Promise<Vehicle | undefined> {
  if (integrationMode !== "firebase") return getVehicles().find(vehicle => vehicle.id === id);
  return (await listVehicles()).find(vehicle => vehicle.id === id);
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
