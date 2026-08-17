import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/auth/api";
import { getDriveAccessToken, driveConfigured } from "@/lib/drive/auth";
import { provisionVehicleDossier } from "@/lib/drive/google-drive";
import { validateVehicleForDossier, vehicleDossierFolderName } from "@/lib/drive/business";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await authorizeApi(request, "vehicles.write");
  if (auth.response) return auth.response;
  if (!driveConfigured()) return NextResponse.json({ ok: false, error: "Google Drive is nog niet geconfigureerd." }, { status: 503 });
  if (!adminDb) return NextResponse.json({ ok: false, error: "Firebase Admin is niet beschikbaar." }, { status: 503 });

  const { id } = await context.params;
  const ref = adminDb.collection("vehicles").doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) return NextResponse.json({ ok: false, error: "Voertuig niet gevonden." }, { status: 404 });

  const vehicle = { id: snapshot.id, ...snapshot.data() } as any;
  try {
    validateVehicleForDossier(vehicle);
    if (vehicle.driveDossier?.folderId) {
      return NextResponse.json({ ok: true, dossier: vehicle.driveDossier, reused: true });
    }

    const accessToken = await getDriveAccessToken();
    const dossier = await provisionVehicleDossier(accessToken, process.env.GOOGLE_DRIVE_VEHICLES_FOLDER_ID!, vehicleDossierFolderName(vehicle));
    const driveDossier = {
      folderId: dossier.id,
      folderName: dossier.name,
      webViewLink: dossier.webViewLink,
      childFolderIds: dossier.childFolderIds,
      provisionedAt: new Date().toISOString(),
      provisionedBy: auth.actor?.uid ?? "system",
    };
    await ref.set({ driveDossier, updatedAt: new Date().toISOString() }, { merge: true });
    return NextResponse.json({ ok: true, dossier: driveDossier, reused: false }, { status: 201 });
  } catch (error) {
    console.error("vehicle-drive-dossier", error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Voertuigdossier kon niet worden aangemaakt." }, { status: 500 });
  }
}
