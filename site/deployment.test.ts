import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Route = { route: string; rewrite?: string; statusCode?: number; headers?: Record<string, string> };

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

  it("publishes restrictive security policies and real route handling", () => {
    const config = JSON.parse(
      readFileSync(new URL("./public/staticwebapp.config.json", import.meta.url), "utf8"),
    ) as { globalHeaders: Record<string, string>; routes: Route[]; responseOverrides: Record<string, { statusCode: number; rewrite: string }> };
    expect(config.globalHeaders["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(config.globalHeaders["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(config.globalHeaders["Permissions-Policy"]).toContain("camera=()");
    expect(config.routes.find((entry) => entry.route === "/demo")).toMatchObject({ rewrite: "/demo/index.html" });
    expect(config.responseOverrides["404"]).toEqual({ rewrite: "/404/index.html", statusCode: 404 });
  });
});
