import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("Social Video security boundary", () => {
  it("houdt socialVideos buiten directe Firestore-clienttoegang", () => {
    const rules = read("firestore.rules");
    expect(rules).toContain("match /socialVideos/{videoId}");
    expect(rules).toContain("allow read, write: if false");
  });

  it("houdt de publieke video-API allow-listed en server-side", () => {
    const model = read("lib/social-video/model.ts");
    const publicRoute = read("app/api/public/social-videos/route.ts");
    expect(model).toContain("publicSocialVideoSchema");
    expect(publicRoute).toContain("listPublishedSocialVideos");
    expect(publicRoute).not.toContain("adminDb.collection");
  });

  it("staat alleen vooraf bekende socialproviders toe", () => {
    const providers = read("lib/social-video/providers.ts");
    expect(providers).toContain("isHost(url.hostname, \"youtube.com\")");
    expect(providers).toContain("isHost(url.hostname, \"tiktok.com\")");
    expect(providers).toContain("isHost(url.hostname, \"instagram.com\")");
  });
});
