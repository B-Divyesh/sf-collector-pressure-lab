import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Route = { route: string; headers?: Record<string, string> };

describe("Azure Static Web Apps cache contract", () => {
  it("keeps content-addressed assets immutable while the service worker updates", () => {
    const config = JSON.parse(
      readFileSync(new URL("./public/staticwebapp.config.json", import.meta.url), "utf8"),
    ) as { routes: Route[] };
    const headerFor = (route: string) =>
      config.routes.find((entry) => entry.route === route)?.headers?.["Cache-Control"];

    expect(headerFor("/assets/*")).toBe("public, max-age=31536000, immutable");
    expect(headerFor("/pressure-line.webp")).toBe("public, max-age=86400");
    expect(headerFor("/sw.js")).toBe("no-cache");
  });
});
