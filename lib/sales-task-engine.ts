import type { Lead } from "@/types";

export type SalesTaskKind = "first_response" | "follow_up" | "appointment" | "deal_follow_up";
export type SalesTaskStatus = "open" | "done" | "cancelled";
export type SalesTaskPriority = "urgent" | "high" | "normal";

export interface SalesTask {
  id: string;
  leadId: string;
  leadName: string;
  vehicleId?: string;
  title: string;
  kind: SalesTaskKind;
  status: SalesTaskStatus;
  priority: SalesTaskPriority;
  dueAt: string;
  owner?: string;
  createdAt: string;
  completedAt?: string;
}

function minutesFrom(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000).toISOString();
}

export function nextTaskForLead(lead: Lead, now = new Date()): SalesTask | null {
  if (!lead.id || lead.status === "won" || lead.status === "lost") return null;

  const created = new Date(lead.createdAt ?? now.toISOString());
  const common = {
    id: `${lead.id}:${lead.status ?? "new"}`,
    leadId: lead.id,
    leadName: lead.name,
    vehicleId: lead.vehicleId,
    status: "open" as const,
    owner: lead.owner ?? lead.sales?.assignedTo,
    createdAt: now.toISOString(),
  };

  switch (lead.status ?? "new") {
    case "new":
      return {
        ...common,
        title: `Neem direct contact op met ${lead.name}`,
        kind: "first_response",
        priority: "urgent",
        dueAt: lead.sales?.responseDueAt ?? minutesFrom(created, 10),
      };
    case "contacted":
      return {
        ...common,
        title: `Kwalificeer behoefte van ${lead.name}`,
        kind: "follow_up",
        priority: "high",
        dueAt: lead.nextActionAt ?? minutesFrom(now, 240),
      };
    case "qualified":
      return {
        ...common,
        title: `Plan afspraak of proefrit met ${lead.name}`,
        kind: "appointment",
        priority: "high",
        dueAt: lead.nextActionAt ?? minutesFrom(now, 1_440),
      };
    case "appointment":
      return {
        ...common,
        title: `Zet afspraak van ${lead.name} om naar deal` ,
        kind: "deal_follow_up",
        priority: "high",
        dueAt: lead.nextActionAt ?? minutesFrom(now, 1_440),
      };
    default:
      return null;
  }
}

export function taskIsOverdue(task: SalesTask, now = new Date()) {
  return task.status === "open" && new Date(task.dueAt).getTime() < now.getTime();
}

export function sortSalesTasks(tasks: SalesTask[]) {
  const rank: Record<SalesTaskPriority, number> = { urgent: 0, high: 1, normal: 2 };
  return tasks.slice().sort((a, b) => {
    const priority = rank[a.priority] - rank[b.priority];
    return priority || new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });
}
