import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/auth/api";
import { firebaseManagementProjectId } from "@/lib/firebase-management/auth";
import { getManagedSecretStatus, putManagedSecret, VVOS_MANAGED_SECRETS } from "@/lib/firebase-management/secret-manager";
import { adminAuth, adminDb, adminStorage } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  const auth = await authorizeApi(request, "integrations.read");
  if (auth.response) return auth.response;
  try {
    return NextResponse.json({
      ok: true,
      projectId: firebaseManagementProjectId(),
      services: { auth: Boolean(adminAuth), firestore: Boolean(adminDb), storage: Boolean(adminStorage) },
      managedSecrets: await getManagedSecretStatus(),
      allowedSecretNames: VVOS_MANAGED_SECRETS,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Firebase beheerstatus kon niet worden gelezen." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const auth = await authorizeApi(request, "integrations.write");
  if (auth.response) return auth.response;
  try {
    const body = await request.json() as { name?: string; value?: string };
    if (typeof body.name !== "string" || typeof body.value !== "string") {
      return NextResponse.json({ ok: false, error: "name en value zijn verplicht." }, { status: 400 });
    }
    const result = await putManagedSecret(body.name, body.value);
    return NextResponse.json({ ok: true, secret: result, updatedBy: auth.actor?.uid ?? "system" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Firebase secret kon niet worden bijgewerkt." }, { status: 400 });
  }
}
