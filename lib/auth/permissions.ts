import type { VvosRole } from "@/lib/auth/session";

export type VvosPermission =
  | "dashboard.read"
  | "vehicles.read"
  | "vehicles.write"
  | "leads.read"
  | "leads.write"
  | "deals.read"
  | "deals.write"
  | "workshop.read"
  | "workshop.write"
  | "finance.read"
  | "finance.write"
  | "integrations.read"
  | "integrations.manage"
  | "audit.read"
  | "communications.send";

const rolePermissions: Record<VvosRole, ReadonlySet<VvosPermission>> = {
  owner: new Set<VvosPermission>([
    "dashboard.read", "vehicles.read", "vehicles.write", "leads.read", "leads.write",
    "deals.read", "deals.write", "workshop.read", "workshop.write", "finance.read",
    "finance.write", "integrations.read", "integrations.manage", "audit.read", "communications.send",
  ]),
  admin: new Set<VvosPermission>([
    "dashboard.read", "vehicles.read", "vehicles.write", "leads.read", "leads.write",
    "deals.read", "deals.write", "workshop.read", "workshop.write", "finance.read",
    "finance.write", "integrations.read", "integrations.manage", "audit.read", "communications.send",
  ]),
  sales: new Set<VvosPermission>([
    "dashboard.read", "vehicles.read", "leads.read", "leads.write", "deals.read",
    "deals.write", "communications.send",
  ]),
  marketing: new Set<VvosPermission>([
    "dashboard.read", "vehicles.read", "vehicles.write", "leads.read", "integrations.read",
  ]),
  workshop: new Set<VvosPermission>([
    "dashboard.read", "vehicles.read", "deals.read", "workshop.read", "workshop.write",
  ]),
  finance: new Set<VvosPermission>([
    "dashboard.read", "vehicles.read", "deals.read", "finance.read", "finance.write", "audit.read",
  ]),
  readonly: new Set<VvosPermission>([
    "dashboard.read", "vehicles.read", "leads.read", "deals.read", "workshop.read", "finance.read",
  ]),
};

export function hasPermission(role: VvosRole, permission: VvosPermission): boolean {
  return rolePermissions[role].has(permission);
}

export function permissionsForRole(role: VvosRole): VvosPermission[] {
  return [...rolePermissions[role]];
}
