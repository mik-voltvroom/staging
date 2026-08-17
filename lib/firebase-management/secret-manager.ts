import { firebaseManagementProjectId, getFirebaseManagementAccessToken } from "@/lib/firebase-management/auth";

const API = "https://secretmanager.googleapis.com/v1";
// Drive authentication is deliberately absent: VVOS uses keyless Google runtime identity.
export const VVOS_MANAGED_SECRETS = ["CRON_SECRET", "VWE_WEBHOOK_SECRET", "PORTAL_TOKEN_SECRET", "AUDIT_HASH_SALT"] as const;
export type ManagedSecretName = typeof VVOS_MANAGED_SECRETS[number];

function isManagedSecret(name: string): name is ManagedSecretName {
  return (VVOS_MANAGED_SECRETS as readonly string[]).includes(name);
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const token = await getFirebaseManagementAccessToken();
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Secret Manager ${response.status}: ${await response.text()}`);
  return response.json() as Promise<T>;
}

function project(): string {
  const id = firebaseManagementProjectId();
  if (!id) throw new Error("Firebase project-id ontbreekt voor beheerconnector.");
  return id;
}

export async function getManagedSecretStatus() {
  const projectId = project();
  const token = await getFirebaseManagementAccessToken();
  return Promise.all(VVOS_MANAGED_SECRETS.map(async (name) => {
    const url = `${API}/projects/${encodeURIComponent(projectId)}/secrets/${encodeURIComponent(name)}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (response.status === 404) return { name, exists: false };
    if (!response.ok) throw new Error(`Secret Manager ${response.status}: ${await response.text()}`);
    return { name, exists: true };
  }));
}

export async function putManagedSecret(name: string, value: string) {
  if (!isManagedSecret(name)) throw new Error("Secret is niet toegestaan via de VVOS beheerconnector.");
  if (!value.trim()) throw new Error("Secretwaarde mag niet leeg zijn.");
  const projectId = project();
  const token = await getFirebaseManagementAccessToken();
  const secretUrl = `${API}/projects/${encodeURIComponent(projectId)}/secrets/${encodeURIComponent(name)}`;
  const exists = await fetch(secretUrl, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (exists.status === 404) {
    await request(`${API}/projects/${encodeURIComponent(projectId)}/secrets?secretId=${encodeURIComponent(name)}`, {
      method: "POST",
      body: JSON.stringify({ replication: { automatic: {} } }),
    });
  } else if (!exists.ok) {
    throw new Error(`Secret Manager ${exists.status}: ${await exists.text()}`);
  }
  await request(`${secretUrl}:addVersion`, {
    method: "POST",
    body: JSON.stringify({ payload: { data: Buffer.from(value).toString("base64") } }),
  });
  return { name, updated: true };
}
