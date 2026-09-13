import { adminDb } from "@/lib/firebase-admin";
import type { PurchaseAdvice } from "@/lib/glasses/purchase-intelligence";

function dbOrThrow() {
  if (!adminDb) throw new Error("VVOS database niet beschikbaar.");
  return adminDb;
}

export async function savePurchaseAdvice(advice: PurchaseAdvice): Promise<void> {
  await dbOrThrow().collection("vehicles").doc(advice.vehicleId).collection("purchase_advice").doc(advice.id).set(advice);
}

export async function getLatestPurchaseAdvice(vehicleId: string): Promise<PurchaseAdvice | null> {
  const snapshot = await dbOrThrow().collection("vehicles").doc(vehicleId).collection("purchase_advice").orderBy("createdAt", "desc").limit(1).get();
  return snapshot.empty ? null : snapshot.docs[0].data() as PurchaseAdvice;
}
