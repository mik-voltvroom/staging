const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const CLOUD_SCOPE = "https://www.googleapis.com/auth/cloud-platform";
const METADATA_TOKEN_URL =
  "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token";
const IAM_CREDENTIALS_API = "https://iamcredentials.googleapis.com/v1";

interface MetadataTokenResponse {
  access_token?: string;
}

interface GeneratedAccessTokenResponse {
  accessToken?: string;
}

export function driveConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_DRIVE_VEHICLES_FOLDER_ID,
  );
}

async function getRuntimeCloudToken(): Promise<string> {
  const response = await fetch(
    `${METADATA_TOKEN_URL}?scopes=${encodeURIComponent(CLOUD_SCOPE)}`,
    {
      headers: { "Metadata-Flavor": "Google" },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Google runtime identity token ${response.status}: ${await response.text()}`,
    );
  }

  const payload = (await response.json()) as MetadataTokenResponse;
  if (!payload.access_token) {
    throw new Error("Google runtime identity gaf geen access token terug.");
  }
  return payload.access_token;
}

export async function getDriveAccessToken(): Promise<string> {
  const serviceAccountEmail = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL;
  if (!serviceAccountEmail) {
    throw new Error("GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL ontbreekt.");
  }

  const runtimeToken = await getRuntimeCloudToken();
  const response = await fetch(
    `${IAM_CREDENTIALS_API}/projects/-/serviceAccounts/${encodeURIComponent(serviceAccountEmail)}:generateAccessToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${runtimeToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scope: [DRIVE_SCOPE], lifetime: "3600s" }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Google IAM Credentials ${response.status}: ${await response.text()}`,
    );
  }

  const payload = (await response.json()) as GeneratedAccessTokenResponse;
  if (!payload.accessToken) {
    throw new Error("Google IAM Credentials gaf geen Drive access token terug.");
  }
  return payload.accessToken;
}
