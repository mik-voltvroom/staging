import { VEHICLE_DOSSIER_FOLDERS } from "@/lib/drive/business";

const DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

export interface DriveFolder {
  id: string;
  name: string;
  webViewLink?: string;
}

export interface VehicleDossierResult extends DriveFolder {
  childFolderIds: Record<string, string>;
}

export interface DriveAuthTestResult {
  folderId: string;
  folderName: string;
  deleted: true;
}

function escapeQuery(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function driveRequest<T>(
  token: string,
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Google Drive API ${response.status}: ${await response.text()}`,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function findFolder(
  token: string,
  parentId: string,
  name: string,
): Promise<DriveFolder | null> {
  const query =
    `'${escapeQuery(parentId)}' in parents and ` +
    `name='${escapeQuery(name)}' and mimeType='${FOLDER_MIME_TYPE}' and trashed=false`;
  const params = new URLSearchParams({
    q: query,
    fields: "files(id,name,webViewLink)",
    pageSize: "10",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
  });
  const sharedDriveId = process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID;
  if (sharedDriveId) {
    params.set("corpora", "drive");
    params.set("driveId", sharedDriveId);
  }

  const payload = await driveRequest<{ files: DriveFolder[] }>(
    token,
    `${DRIVE_API}?${params}`,
  );
  return payload.files[0] ?? null;
}

async function createFolder(
  token: string,
  parentId: string,
  name: string,
): Promise<DriveFolder> {
  return driveRequest<DriveFolder>(
    token,
    `${DRIVE_API}?supportsAllDrives=true&fields=id,name,webViewLink`,
    {
      method: "POST",
      body: JSON.stringify({
        name,
        mimeType: FOLDER_MIME_TYPE,
        parents: [parentId],
      }),
    },
  );
}

async function ensureFolder(
  token: string,
  parentId: string,
  name: string,
): Promise<DriveFolder> {
  return (
    (await findFolder(token, parentId, name)) ??
    createFolder(token, parentId, name)
  );
}

async function deleteFolder(token: string, folderId: string): Promise<void> {
  await driveRequest<void>(
    token,
    `${DRIVE_API}/${encodeURIComponent(folderId)}?supportsAllDrives=true`,
    { method: "DELETE" },
  );
}

export async function provisionVehicleDossier(
  token: string,
  parentId: string,
  name: string,
): Promise<VehicleDossierResult> {
  const root = await ensureFolder(token, parentId, name);
  const childFolderIds: Record<string, string> = {};

  for (const childName of VEHICLE_DOSSIER_FOLDERS) {
    childFolderIds[childName] = (
      await ensureFolder(token, root.id, childName)
    ).id;
  }

  return {
    ...root,
    webViewLink:
      root.webViewLink ??
      `https://drive.google.com/drive/folders/${root.id}`,
    childFolderIds,
  };
}

export async function runDriveAuthTest(
  token: string,
  parentId: string,
): Promise<DriveAuthTestResult> {
  const folderName = `VVOS_AUTH_TEST-${Date.now()}`;
  const folder = await createFolder(token, parentId, folderName);

  try {
    await deleteFolder(token, folder.id);
  } catch (error) {
    throw new Error(
      `Drive-testmap ${folder.id} is aangemaakt, maar kon niet worden verwijderd: ${error instanceof Error ? error.message : "onbekende fout"}`,
    );
  }

  return { folderId: folder.id, folderName, deleted: true };
}
