import { VEHICLE_DOSSIER_FOLDERS } from "@/lib/drive/business";

const DRIVE_API = "https://www.googleapis.com/drive/v3/files";

export interface DriveFolder { id: string; name: string; webViewLink?: string; }
export interface VehicleDossierResult extends DriveFolder { childFolderIds: Record<string, string>; }

function escapeDriveQuery(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function driveRequest<T>(accessToken: string, url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google Drive API ${response.status}: ${await response.text()}`);
  return response.json() as Promise<T>;
}

async function findFolder(accessToken: string, parentId: string, name: string): Promise<DriveFolder | null> {
  const q = `'${escapeDriveQuery(parentId)}' in parents and name='${escapeDriveQuery(name)}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const params = new URLSearchParams({ q, fields: "files(id,name,webViewLink)", pageSize: "10", supportsAllDrives: "true", includeItemsFromAllDrives: "true" });
  const result = await driveRequest<{ files: DriveFolder[] }>(accessToken, `${DRIVE_API}?${params}`);
  return result.files[0] ?? null;
}

async function createFolder(accessToken: string, parentId: string, name: string): Promise<DriveFolder> {
  return driveRequest<DriveFolder>(accessToken, `${DRIVE_API}?supportsAllDrives=true&fields=id,name,webViewLink`, {
    method: "POST",
    body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] }),
  });
}

async function ensureFolder(accessToken: string, parentId: string, name: string): Promise<DriveFolder> {
  return (await findFolder(accessToken, parentId, name)) ?? createFolder(accessToken, parentId, name);
}

export async function provisionVehicleDossier(accessToken: string, parentId: string, folderName: string): Promise<VehicleDossierResult> {
  const root = await ensureFolder(accessToken, parentId, folderName);
  const childFolderIds: Record<string, string> = {};
  for (const name of VEHICLE_DOSSIER_FOLDERS) {
    const folder = await ensureFolder(accessToken, root.id, name);
    childFolderIds[name] = folder.id;
  }
  return { ...root, webViewLink: root.webViewLink ?? `https://drive.google.com/drive/folders/${root.id}`, childFolderIds };
}
