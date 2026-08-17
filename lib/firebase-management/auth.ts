import { createSign } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CLOUD_SCOPE = "https://www.googleapis.com/auth/cloud-platform";
const METADATA_TOKEN_URL = "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token";

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

async function tokenFromServiceAccount(): Promise<string | null> {
  const email = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!email || !privateKey) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(JSON.stringify({ iss: email, scope: CLOUD_SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }));
  const unsigned = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${base64Url(signer.sign(privateKey.replace(/\\n/g, "\n")))}`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google OAuth ${response.status}: ${await response.text()}`);
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("Google OAuth gaf geen access token terug.");
  return payload.access_token;
}

async function tokenFromRuntimeIdentity(): Promise<string | null> {
  if (!(process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.K_SERVICE)) return null;
  const response = await fetch(`${METADATA_TOKEN_URL}?scopes=${encodeURIComponent(CLOUD_SCOPE)}`, {
    headers: { "Metadata-Flavor": "Google" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google metadata token ${response.status}: ${await response.text()}`);
  const payload = await response.json() as { access_token?: string };
  return payload.access_token ?? null;
}

export function firebaseManagementProjectId(): string | null {
  return process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null;
}

export async function getFirebaseManagementAccessToken(): Promise<string> {
  const serviceToken = await tokenFromServiceAccount();
  if (serviceToken) return serviceToken;
  const runtimeToken = await tokenFromRuntimeIdentity();
  if (runtimeToken) return runtimeToken;
  throw new Error("Firebase beheerconnector heeft geen Google runtime identity of Firebase Admin service-account.");
}
