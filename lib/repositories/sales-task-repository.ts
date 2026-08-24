"use client";

import { collection, doc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { integrationMode } from "@/lib/config";
import type { SalesTask } from "@/lib/sales-task-engine";

const DEMO_KEY = "vvos_sales_tasks";

function readDemoTasks(): SalesTask[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(DEMO_KEY) ?? "[]") as SalesTask[]; }
  catch { return []; }
}

function writeDemoTasks(tasks: SalesTask[]) {
  if (typeof window !== "undefined") localStorage.setItem(DEMO_KEY, JSON.stringify(tasks));
}

export async function listSalesTasks(): Promise<SalesTask[]> {
  if (integrationMode !== "firebase" || !db) return readDemoTasks();
  const snapshot = await getDocs(query(collection(db, "tasks"), orderBy("dueAt", "asc")));
  return snapshot.docs
    .map(item => ({ id: item.id, ...item.data() } as SalesTask))
    .filter(item => Boolean(item.leadId));
}

export async function saveSalesTask(task: SalesTask): Promise<void> {
  if (integrationMode !== "firebase" || !db) {
    const tasks = readDemoTasks();
    const index = tasks.findIndex(item => item.id === task.id);
    if (index >= 0) tasks[index] = task; else tasks.push(task);
    writeDemoTasks(tasks);
    return;
  }
  await setDoc(doc(db, "tasks", task.id), task, { merge: true });
}

export async function completeSalesTask(task: SalesTask): Promise<SalesTask> {
  const completed = { ...task, status: "done" as const, completedAt: new Date().toISOString() };
  await saveSalesTask(completed);
  return completed;
}
