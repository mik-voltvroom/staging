"use client";
import type { Lead } from "@/types";
import { db } from "@/lib/firebase-client";
import { integrationMode } from "@/lib/config";
import { getLeads, saveLeads } from "@/lib/demo-store";
import { collection, doc, getDocs, orderBy, query, setDoc } from "firebase/firestore";

export async function listLeads(): Promise<Lead[]> {
  if (integrationMode !== "firebase" || !db) return getLeads();
  const snapshot = await getDocs(query(collection(db, "leads"), orderBy("createdAt", "desc")));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() } as Lead));
}

export async function saveLead(lead: Lead): Promise<void> {
  if (integrationMode !== "firebase" || !db) {
    const leads = getLeads();
    const index = leads.findIndex(item => item.id === lead.id);
    if (index >= 0) leads[index] = lead; else leads.unshift(lead);
    return saveLeads(leads);
  }
  const id = lead.id ?? crypto.randomUUID();
  await setDoc(doc(db, "leads", id), { ...lead, id }, { merge: true });
}
