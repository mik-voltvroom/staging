import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/auth/api";
import { writeAuditEvent } from "@/lib/audit/audit-log";
import { driveConfigured, getDriveAccessToken } from "@/lib/drive/auth";
import { runDriveAuthTest } from "@/lib/drive/google-drive";

export async function POST(request: Request) {
  const auth = await authorizeApi(request, "integrations.manage");
  if (auth.response) return auth.response;

  if (process.env.VVOS_ENV !== "staging") {
    return NextResponse.json(
      { ok: false, error: "De Drive-authenticatiemeting is alleen beschikbaar in staging." },
      { status: 403 },
    );
  }
  if (!driveConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Google Drive is nog niet geconfigureerd." },
      { status: 503 },
    );
  }

  try {
    const result = await runDriveAuthTest(
      await getDriveAccessToken(),
      process.env.GOOGLE_DRIVE_VEHICLES_FOLDER_ID!,
    );
    await writeAuditEvent({
      action: "integrations.drive_auth_tested",
      entityType: "integration",
      actor: auth.actor,
      metadata: { folderId: result.folderId, deleted: result.deleted },
      request,
    });
    return NextResponse.json({
      ok: true,
      message: "Drive-runtime-authenticatie geslaagd; testmap is verwijderd.",
      result,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("drive-auth-test", error);
    const message =
      error instanceof Error
        ? error.message
        : "Drive-runtime-authenticatie kon niet worden getest.";
    await writeAuditEvent({
      action: "integrations.drive_auth_failed",
      entityType: "integration",
      actor: auth.actor,
      metadata: { message },
      request,
    });
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
