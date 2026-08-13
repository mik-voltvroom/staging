import { afterEach, describe, expect, it } from "vitest";
import { GET as runCron } from "@/app/api/cron/sync/route";
import { POST as importVwe } from "@/app/api/vwe/import/route";

afterEach(() => {
  delete process.env.CRON_SECRET;
  delete process.env.VWE_WEBHOOK_SECRET;
});

describe("service hooks fail closed", () => {
  it("rejects cron when no secret is configured", async () => {
    const response = await runCron(new Request("https://staging.voltvroom.nl/api/cron/sync"));
    expect(response.status).toBe(503);
  });

  it("rejects an invalid cron bearer token", async () => {
    process.env.CRON_SECRET = "a-secure-staging-cron-secret";
    const response = await runCron(new Request("https://staging.voltvroom.nl/api/cron/sync", {
      headers: { authorization: "Bearer wrong" },
    }));
    expect(response.status).toBe(401);
  });

  it("rejects VWE imports when no webhook secret is configured", async () => {
    const response = await importVwe(new Request("https://staging.voltvroom.nl/api/vwe/import", {
      method: "POST",
      body: JSON.stringify({ vehicles: [] }),
    }));
    expect(response.status).toBe(503);
  });
});
