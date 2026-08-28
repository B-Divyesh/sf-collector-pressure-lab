import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { expect, test } from "@playwright/test";

const binary = resolve("target/debug/cplab");
const config = resolve("examples/collector.yaml");
const sample = resolve("examples/traces.ndjson");

test.describe.configure({ mode: "serial" });

function run(args: string[], cwd = resolve(".")) {
  return spawnSync(binary, args, { cwd, encoding: "utf8", timeout: 60_000 });
}

function runAsync(args: string[]) {
  return new Promise<{ code: number | null; stdout: string; stderr: string }>((done) => {
    const child = spawn(binary, args, { cwd: resolve(".") });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (code) => done({ code, stdout, stderr }));
  });
}

async function receiver(options: { delay?: number; serialDelay?: number; status?: number; capture?: Array<{ body: string; header: string | undefined }> } = {}) {
  let nextResponse = Date.now();
  const server = createServer((request, response) => {
    let body = "";
    request.on("data", (chunk) => { body += chunk; });
    request.on("end", () => {
      options.capture?.push({ body, header: request.headers["x-claim"] as string | undefined });
      const now = Date.now();
      const wait = options.serialDelay
        ? Math.max(now, nextResponse) + options.serialDelay - now
        : options.delay ?? 0;
      if (options.serialDelay) nextResponse = now + wait;
      setTimeout(() => {
        response.writeHead(options.status ?? 200, { "content-type": "application/json" });
        response.end("{}");
      }, options.delay ?? 0);
    });
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("fixture did not bind");
  return { server, endpoint: `http://127.0.0.1:${address.port}/v1/traces` };
}

function close(server: Server) {
  return new Promise<void>((done) => server.close(() => done()));
}

test("@claim:demo-isolation opens populated sample data and clears only its namespace", async ({ page }) => {
  await page.goto("/demo");
  await expect(page).toHaveTitle("Demo — Collector Pressure Lab");
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await expect(page.locator("#classification")).toHaveText("Drops");
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(["demo:cplab:pressure-input"]);
  await page.locator("#arrival-rate").evaluate((element: HTMLInputElement) => {
    element.value = "1200";
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.locator("#arrival-rate")).toHaveValue("900");
  await page.getByRole("link", { name: "Start for real" }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  await page.goto("/?demo=1");
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await expect(page.locator("#classification")).toHaveText("Drops");

  const directory = mkdtempSync(join(tmpdir(), "cplab-claim-demo-"));
  const output = run(["demo"], directory);
  expect(output.status).toBe(0);
  expect(output.stdout).toContain("DEMO — bundled sample, temporary loopback receiver");
  const outputPath = output.stdout.match(/Demo files: (.+)/)?.[1].trim();
  expect(outputPath).toBeTruthy();
  expect(readdirSync(outputPath!)).toEqual(expect.arrayContaining(["collector.yaml", "traces.ndjson", "report.json"]));
  expect(readdirSync(directory)).toEqual([]);
});

test("@claim:offline-reload reloads the demo and runs the browser model offline", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "service worker behavior is verified in Chromium");
  await page.goto("/demo");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await expect(page.locator("#classification")).toHaveText("Drops");
});

test("@claim:browser-no-network-or-storage keeps the ordinary browser model in memory", async ({ page, context }) => {
  const crossOrigin: string[] = [];
  context.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:4173") crossOrigin.push(request.url());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Show pressure result" }).click();
  await expect(page.locator("#classification")).toHaveText("Drops");
  expect(await page.evaluate(async () => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
    databases: await indexedDB.databases(),
  }))).toEqual({ local: [], session: [], databases: [] });
  expect(crossOrigin).toEqual([]);
});

test("@claim:loopback-guard rejects remote endpoints unless explicitly allowed", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI claim runs once");
  const before = createHash("sha256").update(readFileSync(sample)).digest("hex");
  const rejected = run(["run", "--config", config, "--sample", sample, "--endpoint", "http://example.com/v1/traces", "--metrics-endpoint", "off", "--ci"]);
  expect(rejected.status).toBe(2);
  expect(rejected.stderr).toContain("loopback");
  const allowed = run(["run", "--config", config, "--sample", sample, "--endpoint", "http://192.0.2.1/v1/traces", "--allow-remote", "--metrics-endpoint", "off", "--duration", "250ms", "--timeout", "50ms", "--rates", "1", "--ci"]);
  expect(allowed.stderr).toContain("WARNING");
  expect(createHash("sha256").update(readFileSync(sample)).digest("hex")).toBe(before);
});

test("@claim:bounded-replay maps NDJSON bodies and enforces every documented bound", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI claim runs once");
  const capture: Array<{ body: string; header: string | undefined }> = [];
  const fixture = await receiver({ capture });
  const directory = mkdtempSync(join(tmpdir(), "cplab-claim-bounds-"));
  const ndjson = join(directory, "two.ndjson");
  writeFileSync(ndjson, '{"n":1}\n{"n":2}\n');
  const output = await runAsync(["run", "--config", config, "--sample", ndjson, "--endpoint", fixture.endpoint, "--metrics-endpoint", "off", "--rates", "4", "--duration", "500ms", "--timeout", "1s", "--concurrency", "2", "--max-requests", "2", "--header", "x-claim:bounded", "--json", "--ci"]);
  await close(fixture.server);
  expect(output.code).toBe(0);
  expect(capture).toHaveLength(2);
  expect(capture.map((item) => item.body).sort()).toEqual(['{"n":1}', '{"n":2}']);
  expect(capture.every((item) => item.header === "bounded")).toBe(true);
  const jsonFixture = await receiver({ capture });
  const json = join(directory, "one.json");
  writeFileSync(json, '{"resourceSpans":[]}');
  const jsonOutput = await runAsync(["run", "--config", config, "--sample", json, "--endpoint", jsonFixture.endpoint, "--metrics-endpoint", "off", "--rates", "1", "--duration", "250ms", "--timeout", "1s", "--max-requests", "1", "--json", "--ci"]);
  await close(jsonFixture.server);
  expect(jsonOutput.code).toBe(0);
  expect(capture.at(-1)?.body).toBe('{"resourceSpans":[]}');
  for (const args of [["--duration", "249ms"], ["--duration", "31s"], ["--timeout", "49ms"], ["--timeout", "31s"], ["--rates", "0"], ["--rates", "10001"], ["--concurrency", "0"], ["--concurrency", "257"], ["--max-requests", "0"], ["--max-requests", "10001"]]) {
    const result = run(["run", "--config", config, "--sample", sample, "--metrics-endpoint", "off", "--ci", ...args]);
    expect(result.status).toBe(2);
  }
  const oversized = join(directory, "oversized.json");
  writeFileSync(oversized, "x".repeat(8 * 1024 * 1024 + 1));
  expect(run(["run", "--config", config, "--sample", oversized, "--ci"]).status).toBe(2);
  const tooMany = join(directory, "too-many.ndjson");
  writeFileSync(tooMany, Array.from({ length: 10_001 }, (_, index) => `{"n":${index}}`).join("\n"));
  expect(run(["run", "--config", config, "--sample", tooMany, "--ci"]).status).toBe(2);
});

test("@claim:config-inspection reads named keys and reports template values as unknown", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI claim runs once");
  const output = run(["inspect", "--config", config, "--json"]);
  expect(output.status).toBe(0);
  const parsed = JSON.parse(output.stdout);
  expect(parsed).toMatchObject({ sending_queue_enabled: true, queue_size: 2048, num_consumers: 2, send_batch_size: 512, send_batch_max_size: 1024, batch_timeout: "1s" });
  const directory = mkdtempSync(join(tmpdir(), "cplab-claim-config-"));
  const templated = join(directory, "collector.yaml");
  writeFileSync(templated, "exporters:\n  otlp:\n    sending_queue:\n      queue_size: ${env:QUEUE_SIZE}\n");
  const unknown = run(["inspect", "--config", templated, "--json"]);
  expect(unknown.status).toBe(0);
  expect(JSON.parse(unknown.stdout).warnings.join(" ")).toContain("queue_size");
});

test("@claim:classification reports stable, backpressure, complete drops, and scriptable output", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI claim runs once");
  const stableFixture = await receiver();
  const stable = await runAsync(["run", "--config", config, "--sample", sample, "--endpoint", stableFixture.endpoint, "--metrics-endpoint", "off", "--rates", "20", "--duration", "250ms", "--timeout", "2s", "--json", "--ci"]);
  await close(stableFixture.server);
  expect(stable.code).toBe(0);
  expect(JSON.parse(stable.stdout).classification).toBe("stable");

  const dropFixture = await receiver({ status: 503 });
  const drops = await runAsync(["run", "--config", config, "--sample", sample, "--endpoint", dropFixture.endpoint, "--metrics-endpoint", "off", "--rates", "20", "--duration", "250ms", "--timeout", "2s", "--json", "--ci"]);
  await close(dropFixture.server);
  expect(drops.code).toBe(0);
  const report = JSON.parse(drops.stdout);
  expect(report.classification).toBe("drops");
  expect(report.steps[0].dropped).toBe(report.steps[0].attempted);

  const backpressure = spawnSync("cargo", ["test", "--test", "pressure_fixture", "slow_exporter_is_backpressure_and_threshold_tracks_throughput", "--", "--exact"], { encoding: "utf8", timeout: 120_000 });
  expect(backpressure.status).toBe(0);
});

test("@claim:no-config-write leaves config and sample bytes unchanged on every CLI path", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI claim runs once");
  const files = [config, sample];
  const before = files.map((file) => createHash("sha256").update(readFileSync(file)).digest("hex"));
  expect(run(["inspect", "--config", config, "--json"]).status).toBe(0);
  expect(run(["demo"]).status).toBe(0);
  const after = files.map((file) => createHash("sha256").update(readFileSync(file)).digest("hex"));
  expect(after).toEqual(before);
});

test("@claim:package-and-tests builds one documented binary and a publishable Cargo package", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI claim runs once");
  const help = run(["--help"]);
  expect(help.status).toBe(0);
  expect(help.stdout).toContain("demo");
  expect(help.stdout).toContain("inspect");
  expect(help.stdout).toContain("run");
  const packaged = spawnSync("cargo", ["package", "--allow-dirty"], { encoding: "utf8", timeout: 120_000 });
  expect(packaged.status).toBe(0);
  expect(readFileSync("Cargo.toml", "utf8").match(/\[\[bin\]\]/g)).toHaveLength(1);
});

test("@claim:no-third-party-runtime uses only same-origin website resources and no tracking code", async ({ page, context }) => {
  const requests: string[] = [];
  context.on("request", (request) => requests.push(request.url()));
  await page.goto("/demo");
  await page.getByRole("button", { name: "Show pressure result" }).click();
  expect(requests.every((url) => new URL(url).origin === "http://127.0.0.1:4173")).toBe(true);
  const sources = ["site/index.html", "site/main.ts", "site/style.css"].map((file) => readFileSync(file, "utf8")).join("\n");
  expect(sources).not.toMatch(/google-analytics|googletagmanager|segment\.com|mixpanel|fonts\.googleapis|openai\.azure\.com/i);
});

test("@claim:legal-and-site-links serves route titles, metadata, legal pages, and a real 404", async ({ page, request }) => {
  const routes = ["/", "/demo", "/privacy/", "/terms/"];
  for (const route of routes) expect((await request.get(route)).status()).toBe(200);
  expect((await request.get("/not-a-real-route")).status()).toBe(404);
  expect(readFileSync("LICENSE", "utf8")).toContain("Permission is hereby granted");
  expect(readFileSync("Cargo.toml", "utf8")).toContain('license = "MIT"');
  await page.goto("/privacy/");
  await expect(page).toHaveTitle("Privacy — Collector Pressure Lab");
  await expect(page.locator("h1")).toBeFocused();
  expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toContain("/privacy/");
  expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toContain("social-card.webp");
  await page.goto("/not-a-real-route");
  await expect(page).toHaveTitle("Page not found — Collector Pressure Lab");
  await expect(page.getByRole("heading", { level: 1, name: "This route stops here" })).toBeVisible();
});

test("@claim:threshold-accuracy reports the controlled 50 rps exporter within 20 percent", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI claim runs once");
  const regression = spawnSync("cargo", ["test", "--test", "pressure_fixture", "slow_exporter_is_backpressure_and_threshold_tracks_throughput", "--", "--exact"], { encoding: "utf8", timeout: 120_000 });
  expect(regression.status).toBe(0);
  expect(regression.stdout + regression.stderr).toContain("1 passed");
});
