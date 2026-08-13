import fs from "node:fs";

const requiredForProduction = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "CRON_SECRET",
  "PORTAL_TOKEN_SECRET",
  "AUDIT_HASH_SALT",
];

const missing = requiredForProduction.filter((key) => !process.env[key] || String(process.env[key]).includes("replace-with"));
const unsafe = [];
const hasRuntimeIdentity = Boolean(process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.K_SERVICE);
const hasServiceAccount = Boolean(process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY);
if (!hasRuntimeIdentity && !hasServiceAccount) unsafe.push("Firebase Admin vereist runtime identity of alle FIREBASE_ADMIN_* waarden");
if (process.env.VVOS_DATA_MODE !== "firebase") unsafe.push("VVOS_DATA_MODE moet firebase zijn");
if (process.env.VVOS_REQUIRE_AUTH !== "true") unsafe.push("VVOS_REQUIRE_AUTH moet true zijn");
if (process.env.NODE_ENV !== "production") unsafe.push("NODE_ENV is niet production");

const result = {
  ready: missing.length === 0 && unsafe.length === 0,
  missing,
  unsafe,
  checkedAt: new Date().toISOString(),
};
console.log(JSON.stringify(result, null, 2));
if (!result.ready) process.exitCode = 1;
