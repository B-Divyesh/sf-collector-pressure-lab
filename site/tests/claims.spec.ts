import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { expect, test } from "@playwright/test";

const binary = resolve("target/debug/cplab");
const config = resolve("examples/collector.yaml");
const sample = resolve("examples/traces.ndjson");

test.describe.configure({ mode: "serial" });

function run(args: string[], cwd = resolve("."), env: Record<string, string | undefined> = process.env) {
  return spawnSync(binary, args, { cwd, env, encoding: "utf8", timeout: 60_000 });
}

function runAsync(args: string[], cwd = resolve("."), env: Record<string, string | undefined> = process.env) {
  return new Promise<{ code: number | null; stdout: string; stderr: string }>((done) => {
    const child = spawn(binary, args, { cwd, env });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (code) => done({ code, stdout, stderr }));
  });
}

type CapturedRequest = { body: string; header: string | undefined; method: string | undefined; path: string | undefined };

async function receiver(options: { delay?: number; serialDelay?: number; status?: number; capture?: CapturedRequest[] } = {}) {
  let nextResponse = Date.now();
  const server = createServer((request, response) => {
    let body = "";
    request.on("data", (chunk) => { body += chunk; });
    request.on("end", () => {
      options.capture?.push({
        body,
        header: request.headers["x-claim"] as string | undefined,
        method: request.method,
        path: request.url,
      });
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

async function metricsReceiver() {
  let reads = 0;
  const paths: string[] = [];
  const server = createServer((request, response) => {
    paths.push(request.url ?? "");
    const afterReplay = reads++ > 0;
    const body = [
      `otelcol_exporter_queue_size{exporter="otlp"} ${afterReplay ? 15 : 5}`,
      'otelcol_exporter_queue_capacity{exporter="otlp"} 100',
      `otelcol_exporter_send_failed_spans_total{exporter="otlp"} ${afterReplay ? 2 : 0}`,
      "",
    ].join("\n");
    response.writeHead(200, { "content-type": "text/plain", "content-length": Buffer.byteLength(body) });
    response.end(body);
  });
  await new Promise<void>((done, reject) => {
    server.once("error", reject);
    server.listen(8888, "127.0.0.1", done);
  });
  return { server, paths };
}

function close(server: Server) {
  return new Promise<void>((done) => server.close(() => done()));
}

test("@claim:demo-isolation opens and resets one sample, isolates storage, and discards demo changes on every exit", async ({ page, context }) => {
  const sample = {
    inputs: { arrival: "900", export: "400", queue: "1200", duration: "10" },
    result: { classification: "Drops", offered: "9,000", queue: "1,200", dropped: "3,800", recovery: "3s" },
  };
  const readBrowserSample = async () => ({
    inputs: {
      arrival: await page.locator("#arrival-rate").inputValue(),
      export: await page.locator("#export-capacity").inputValue(),
      queue: await page.locator("#queue-capacity").inputValue(),
      duration: await page.locator("#burst-seconds").inputValue(),
    },
    result: {
      classification: await page.locator("#classification").textContent(),
      offered: await page.locator("#offered-result").textContent(),
      queue: await page.locator("#queue-result").textContent(),
      dropped: await page.locator("#drop-result").textContent(),
      recovery: await page.locator("#recovery-result").textContent(),
    },
  });
  const mutateAllInputs = async () => {
    await page.locator("#pressure-form").evaluate((form) => {
      const values: Record<string, string> = {
        "arrival-rate": "1200",
        "export-capacity": "650",
        "queue-capacity": "2000",
        "burst-seconds": "12",
      };
      for (const [id, value] of Object.entries(values)) {
        const input = form.querySelector<HTMLInputElement>(`#${id}`)!;
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
  };
  const expectStorage = async (hasDemo: boolean) => {
    const stored = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
    expect(stored["real:cplab:sentinel"]).toBe("keep");
    expect(Object.hasOwn(stored, "demo:cplab:pressure-input")).toBe(hasDemo);
  };

  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("real:cplab:sentinel", "keep"));
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\/demo$/);
  for (const entry of ["/demo", "/?demo=1"]) {
    if (!page.url().endsWith(entry)) {
      await page.goto("/");
      await expectStorage(false);
      await page.goto(entry);
    }
    await expect(page).toHaveTitle("Demo — Collector Pressure Lab");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://collector-pressure-lab.sociobot.in/demo");
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://collector-pressure-lab.sociobot.in/demo");
    await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
    await expect(page.locator("#classification")).toHaveText("Drops");
    expect((await page.locator("#classification").boundingBox())!.y).toBeLessThan(page.viewportSize()!.height);
    const initial = await readBrowserSample();
    expect(initial).toEqual(sample);
    await mutateAllInputs();
    await expect(page.locator("#burst-seconds")).toHaveValue("12");
    await page.getByRole("button", { name: "Reset demo" }).click();
    await expect(page.locator("#model-status")).toContainText("Model complete: Drops");
    expect(await readBrowserSample()).toEqual(initial);
    expect(await readBrowserSample()).toEqual(sample);
    await expectStorage(true);
  }

  await page.getByRole("link", { name: "Start for real" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expectStorage(false);

  await page.goto("/demo");
  await mutateAllInputs();
  await page.getByRole("link", { name: "Collector Pressure Lab home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expectStorage(false);

  await page.goto("/demo");
  await mutateAllInputs();
  await page.getByRole("link", { name: "Privacy", exact: true }).first().click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expectStorage(false);

  await page.goto("/");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await mutateAllInputs();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expectStorage(false);

  await page.goto("/demo");
  await mutateAllInputs();
  await page.close();
  page = await context.newPage();
  await page.goto("/");
  await expectStorage(false);

  const directory = mkdtempSync(join(tmpdir(), "cplab-claim-demo-"));
  const output = run(["demo"], directory);
  expect(output.status).toBe(0);
  expect(output.stdout).toContain("DEMO — bundled sample, temporary loopback receiver");
  const outputPath = output.stdout.match(/Demo files: (.+)/)?.[1].trim();
  expect(outputPath).toBeTruthy();
  expect(readdirSync(outputPath!)).toEqual(expect.arrayContaining(["collector.yaml", "traces.ndjson", "report.json"]));
  expect(readdirSync(directory)).toEqual([]);
});

test("@claim:free-to-use publishes no paid tier, price, billing, payment, or login flow", async ({ page, context }) => {
  const requests: string[] = [];
  context.on("request", (request) => requests.push(request.url()));
  const publicRoutes = ["/", "/demo", "/privacy/", "/terms/"];
  for (const route of publicRoutes) {
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp(`${route === "/" ? "\\/$" : route.replaceAll("/", "\\/").replace(/\\\/$/, "\\/?$")}`));
    const publicText = await page.locator("body").innerText();
    expect(publicText).not.toMatch(/\b(?:paid tier|pricing|price|subscribe|checkout|billing)\b/i);
    expect(await page.getByRole("link", { name: /(?:sign in|log in|account|checkout|buy|upgrade|subscribe|billing|payment)/i }).count()).toBe(0);
    expect(await page.getByRole("button", { name: /(?:sign in|log in|account|checkout|buy|upgrade|subscribe|billing|payment)/i }).count()).toBe(0);
  }
  await page.goto("/");
  await expect(page.getByText("Free to use.", { exact: true })).toBeVisible();
  await page.goto("/terms/");
  await expect(page.getByText(/Collector Pressure Lab is free software under the MIT License\./)).toBeVisible();
  expect(requests.every((url) => new URL(url).origin === "http://127.0.0.1:4173")).toBe(true);
  const sources = ["site/index.html", "site/privacy/index.html", "site/terms/index.html", "site/404/index.html", "site/main.ts", "site/style.css"]
    .map((file) => readFileSync(file, "utf8")).join("\n");
  expect(sources).not.toMatch(/api\.sociobot\.in\/api\/v1|dodo|stripe|paypal|paddle|lemonsqueezy|checkout\.com|braintree|chargebee/i);
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
  const capture: CapturedRequest[] = [];
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
  expect(report.hypotheses.length).toBeGreaterThan(0);

  const backpressure = spawnSync("cargo", ["test", "--test", "pressure_fixture"], { encoding: "utf8", timeout: 120_000 });
  expect(backpressure.status, `pressure fixture failed\nstdout:\n${backpressure.stdout}\nstderr:\n${backpressure.stderr}`).toBe(0);
  expect(backpressure.stdout + backpressure.stderr).toContain("3 passed");
  const unavailable = await receiver();
  const unavailableEndpoint = unavailable.endpoint;
  await close(unavailable.server);
  const failed = run(["run", "--config", config, "--sample", sample, "--endpoint", unavailableEndpoint, "--metrics-endpoint", "off", "--rates", "1", "--duration", "250ms", "--timeout", "50ms", "--ci"]);
  expect(failed.status).toBe(3);
  expect(failed.stderr).toContain("no HTTP responses were received");
});

test("@claim:collector-metrics reads the default Collector metrics endpoint and reports pressure deltas", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI claim runs once");
  const telemetry = await receiver();
  const metrics = await metricsReceiver();
  try {
    const output = await runAsync([
      "run", "--config", config, "--sample", sample, "--endpoint", telemetry.endpoint,
      "--rates", "4", "--duration", "250ms", "--timeout", "1s", "--max-requests", "1", "--json", "--ci",
    ]);
    expect(output.code, output.stderr).toBe(0);
    const report = JSON.parse(output.stdout);
    expect(report.steps[0].metrics).toEqual({ queue_size: 10, queue_capacity: 100, failed_or_refused: 2 });
    expect(report.classification).toBe("drops");
    expect(metrics.paths).toEqual(["/metrics", "/metrics"]);
  } finally {
    await Promise.all([close(telemetry.server), close(metrics.server)]);
  }
});

test("@claim:cli-data-boundary creates no persistent telemetry copy and uses only selected endpoints", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI claim runs once");
  const root = mkdtempSync(join(tmpdir(), "cplab-claim-boundary-"));
  const directories = ["cache", "config", "home", "inputs", "temp", "work"];
  for (const name of directories) mkdirSync(join(root, name));
  const isolatedConfig = join(root, "inputs", "collector.yaml");
  const isolatedSample = join(root, "inputs", "traces.ndjson");
  copyFileSync(config, isolatedConfig);
  copyFileSync(sample, isolatedSample);
  const isolatedEnv = {
    ...process.env,
    HOME: join(root, "home"),
    XDG_CACHE_HOME: join(root, "cache"),
    XDG_CONFIG_HOME: join(root, "config"),
    TMPDIR: join(root, "temp"),
    TMP: join(root, "temp"),
    TEMP: join(root, "temp"),
  };

  const inspected = run(["inspect", "--config", isolatedConfig, "--json"], join(root, "work"), isolatedEnv);
  expect(inspected.status, inspected.stderr).toBe(0);
  const captured: CapturedRequest[] = [];
  const fixture = await receiver({ capture: captured });
  try {
    const replay = await runAsync([
      "run", "--config", isolatedConfig, "--sample", isolatedSample, "--endpoint", fixture.endpoint,
      "--metrics-endpoint", "off", "--rates", "4", "--duration", "250ms", "--max-requests", "1", "--json", "--ci",
    ], join(root, "work"), isolatedEnv);
    expect(replay.code, replay.stderr).toBe(0);
  } finally {
    await close(fixture.server);
  }
  expect(captured).toHaveLength(1);
  expect(captured.map(({ method, path }) => ({ method, path }))).toEqual([{ method: "POST", path: "/v1/traces" }]);
  for (const name of ["cache", "config", "home", "temp", "work"]) expect(readdirSync(join(root, name))).toEqual([]);
  expect(readdirSync(join(root, "inputs")).sort()).toEqual(["collector.yaml", "traces.ndjson"]);

  const demo = run(["demo"], join(root, "work"), isolatedEnv);
  expect(demo.status, demo.stderr).toBe(0);
  const demoPath = demo.stdout.match(/Demo files: (.+)/)?.[1].trim();
  expect(demoPath?.startsWith(join(root, "temp", "cplab-demo-"))).toBe(true);
  expect(readdirSync(demoPath!).sort()).toEqual(["collector.yaml", "report.json", "traces.ndjson"]);
  for (const name of ["cache", "config", "home", "work"]) expect(readdirSync(join(root, name))).toEqual([]);
  expect(readFileSync("src/main.rs", "utf8")).toContain('TcpListener::bind("127.0.0.1:0")');
});

test("@claim:no-config-write leaves config and sample bytes unchanged on every CLI path", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI claim runs once");
  const files = [config, sample];
  const before = files.map((file) => createHash("sha256").update(readFileSync(file)).digest("hex"));
  expect(run(["inspect", "--config", config, "--json"]).status).toBe(0);
  const fixture = await receiver();
  const replay = await runAsync(["run", "--config", config, "--sample", sample, "--endpoint", fixture.endpoint, "--metrics-endpoint", "off", "--rates", "1", "--duration", "250ms", "--json", "--ci"]);
  await close(fixture.server);
  expect(replay.code).toBe(0);
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
  expect(packaged.status, packaged.stderr).toBe(0);
  const packageFiles = spawnSync("cargo", ["package", "--allow-dirty", "--list"], { encoding: "utf8", timeout: 120_000 });
  expect(packageFiles.status, packageFiles.stderr).toBe(0);
  expect(packageFiles.stdout).toContain("examples/collector.yaml");
  expect(packageFiles.stdout).toContain("examples/traces.ndjson");
  expect(packageFiles.stdout).not.toContain(".factory/");
  expect(packageFiles.stdout).not.toContain("site/");
  expect(readFileSync("Cargo.toml", "utf8").match(/\[\[bin\]\]/g)).toHaveLength(1);
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  expect(packageJson.scripts.test).toContain("cargo test");
  expect(packageJson.scripts.test).toContain("test:unit");
  expect(packageJson.scripts.test).toContain("build:site");
  expect(packageJson.scripts.test).toContain("test:e2e");
  expect(readFileSync("tests/pressure_fixture.rs", "utf8")).toContain("slow_exporter_is_backpressure_and_threshold_tracks_throughput");
});

test("@claim:no-third-party-runtime uses only same-origin website resources and no tracking code", async ({ page, context }) => {
  const requests: string[] = [];
  context.on("request", (request) => requests.push(request.url()));
  await page.goto("/demo");
  await page.getByRole("button", { name: "Show pressure result" }).click();
  expect(requests.every((url) => new URL(url).origin === "http://127.0.0.1:4173")).toBe(true);
  const sources = ["site/index.html", "site/privacy/index.html", "site/terms/index.html", "site/main.ts", "site/style.css"]
    .map((file) => readFileSync(file, "utf8")).join("\n");
  expect(sources).not.toMatch(/google-analytics|googletagmanager|segment\.com|mixpanel|doubleclick|fonts\.googleapis|openai\.azure\.com/i);
  expect(sources).not.toMatch(/<script[^>]+src=["']https?:\/\//i);
  expect(sources).not.toMatch(/<link[^>]+rel=["'](?:stylesheet|preload|modulepreload)["'][^>]+href=["']https?:\/\//i);
});

test("@claim:no-request-identifiers adds no cookies, browser IDs, identity query values, or identity headers", async ({ page, context }) => {
  const requests: Array<{ url: string; headers: Record<string, string> }> = [];
  const responseCookies: string[] = [];
  context.on("request", (request) => requests.push({ url: request.url(), headers: request.headers() }));
  context.on("response", (response) => {
    const setCookie = response.headers()["set-cookie"];
    if (setCookie) responseCookies.push(setCookie);
  });

  await page.goto("/");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page.locator("#classification")).toHaveText("Drops");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.getByRole("link", { name: "Start for real" }).click();
  await page.goto("/privacy/");
  await expect(page.getByText("The site sets no cookies or browser identifiers.", { exact: false })).toBeVisible();
  await expect(page.getByText("It adds no authorization or custom identity headers to requests.", { exact: false })).toBeVisible();

  expect(responseCookies).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  for (const request of requests) {
    const url = new URL(request.url);
    expect([...url.searchParams.keys()]).toEqual([]);
    expect(Object.keys(request.headers)).not.toEqual(expect.arrayContaining([
      "authorization", "cookie", "x-client-id", "x-device-id", "x-session-id", "x-user-id", "x-visitor-id",
    ]));
  }
  expect(await page.evaluate(async () => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
    databases: await indexedDB.databases(),
    cookie: document.cookie,
  }))).toEqual({ local: [], session: [], databases: [], cookie: "" });
  expect(readFileSync("site/main.ts", "utf8")).not.toMatch(/document\.cookie|randomUUID|getRandomValues|x-(?:client|device|session|user|visitor)-id/i);
});

test("@claim:legal-and-site-links serves route titles, metadata, legal pages, and a real 404", async ({ page, request }) => {
  const routes = ["/", "/demo", "/privacy/", "/terms/", "/404"];
  for (const route of routes) expect((await request.get(route)).status()).toBe(200);
  expect((await request.get("/not-a-real-route")).status()).toBe(404);
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap: https://collector-pressure-lab.sociobot.in/sitemap.xml");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapText = await sitemap.text();
  for (const route of ["/", "/demo", "/privacy/", "/terms/"]) {
    expect(sitemapText).toContain(`https://collector-pressure-lab.sociobot.in${route}`);
  }
  expect(readFileSync("LICENSE", "utf8")).toContain("Permission is hereby granted");
  expect(readFileSync("Cargo.toml", "utf8")).toContain('license = "MIT"');
  expect(readFileSync("README.md", "utf8") + readFileSync("site/terms/index.html", "utf8"))
    .not.toMatch(/independent of the OpenTelemetry project|do not imply endorsement/i);
  for (const [route, title, socialUrl] of [
    ["/", "Collector Pressure Lab — test Collector backpressure", "https://collector-pressure-lab.sociobot.in/"],
    ["/demo", "Demo — Collector Pressure Lab", "https://collector-pressure-lab.sociobot.in/demo"],
    ["/privacy/", "Privacy — Collector Pressure Lab", "https://collector-pressure-lab.sociobot.in/privacy/"],
    ["/terms/", "Terms — Collector Pressure Lab", "https://collector-pressure-lab.sociobot.in/terms/"],
    ["/404", "Page not found — Collector Pressure Lab", "https://collector-pressure-lab.sociobot.in/404"],
  ]) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /\S+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", socialUrl);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", socialUrl);
    expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toContain("social-card.webp");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", /Collector Pressure Lab/);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", /\S+/);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", /social-card\.webp/);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/favicon.svg");
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "/apple-touch-icon.png");
    await expect(page.locator('nav[aria-label="Primary navigation"] a')).toHaveText([
      "Demo", "Privacy", "Terms", "Try sample pressure test →",
    ]);
    await expect(page.locator("footer .build-note")).toContainText("Built by Param Factory · v0.1.0 · build polish-5");
  }
  await page.goto("/privacy/");
  await expect(page.locator("h1")).toBeFocused();
  await page.goto("/");
  const links = await page.locator("a[href]").evaluateAll((anchors) => anchors.map((anchor) => ({ href: anchor.getAttribute("href") ?? "", text: anchor.textContent?.trim() ?? "" })));
  for (const link of links) {
    if (link.href.startsWith("#")) expect(await page.locator(link.href).count()).toBe(1);
    if (link.href.startsWith("/")) expect((await request.get(link.href)).status()).toBe(200);
    if (link.href.startsWith("https://github.com")) expect((await request.get(link.href)).status()).toBe(200);
  }
  expect(links.find((link) => link.href.startsWith("https://github.com"))?.text).toContain("opens external site");
  await page.goto("/not-a-real-route");
  await expect(page).toHaveTitle("Page not found — Collector Pressure Lab");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://collector-pressure-lab.sociobot.in/404");
  await expect(page.getByRole("heading", { level: 1, name: "This route stops here" })).toBeVisible();
});

test("@claim:threshold-accuracy reports the controlled 50 rps exporter within 20 percent", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI claim runs once");
  const regression = spawnSync("cargo", ["test", "--test", "pressure_fixture", "slow_exporter_is_backpressure_and_threshold_tracks_throughput", "--", "--exact"], { encoding: "utf8", timeout: 120_000 });
  expect(regression.status, `threshold fixture failed\nstdout:\n${regression.stdout}\nstderr:\n${regression.stderr}`).toBe(0);
  expect(regression.stdout + regression.stderr).toContain("1 passed");
});
