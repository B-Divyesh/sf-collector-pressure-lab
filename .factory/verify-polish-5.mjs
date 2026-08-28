import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const [baseUrl, evidenceDirectory] = process.argv.slice(2);
if (!baseUrl || !evidenceDirectory) {
  throw new Error("usage: node .factory/verify-polish-5.mjs <base-url> <evidence-directory>");
}

mkdirSync(evidenceDirectory, { recursive: true });
const browser = await chromium.launch();
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
const routes = ["/", "/demo", "/?demo=1", "/privacy/", "/terms/", "/404", "/missing-polish-5"];
const report = { baseUrl, routes: [], demo: {}, navigation: {}, offline: {}, screenshots: [] };

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport, serviceWorkers: "block" });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("pageerror", (error) => consoleErrors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  for (const route of routes) {
    const errorCountBefore = consoleErrors.length;
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    const axe = await new AxeBuilder({ page }).analyze();
    const seriousAxe = axe.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
    const facts = await page.evaluate(() => ({
      title: document.title,
      lang: document.documentElement.lang,
      h1: document.querySelectorAll("h1").length,
      main: document.querySelectorAll("main").length,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content"),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      focused: document.activeElement?.id || document.activeElement?.tagName,
    }));
    const smallTargets = await page.locator("a:visible, button:visible").evaluateAll((elements) => elements.flatMap((element) => {
      const box = element.getBoundingClientRect();
      return box.width < 44 || box.height < 44 ? [{ text: element.textContent?.trim(), width: box.width, height: box.height }] : [];
    }));
    report.routes.push({
      viewport: viewport.name,
      route,
      status: response?.status(),
      ...facts,
      seriousAxe: seriousAxe.length,
      smallTargets,
      consoleErrors: route.startsWith("/missing-") ? [] : consoleErrors.slice(errorCountBefore),
    });
  }

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const firstScreen = `${evidenceDirectory}/first-screen-${viewport.name}.png`;
  await page.screenshot({ path: firstScreen });
  report.screenshots.push(firstScreen);
  await page.goto(`${baseUrl}/demo`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector("#classification")?.textContent === "Drops");
  const demoScreen = `${evidenceDirectory}/demo-${viewport.name}.png`;
  await page.screenshot({ path: demoScreen });
  report.screenshots.push(demoScreen);
  if (viewport.name === "mobile") {
    await page.goto(`${baseUrl}/?demo=1`, { waitUntil: "networkidle" });
    const queryScreen = `${evidenceDirectory}/demo-query-mobile.png`;
    await page.screenshot({ path: queryScreen });
    report.screenshots.push(queryScreen);
    await page.goto(`${baseUrl}/404`, { waitUntil: "networkidle" });
    const notFoundScreen = `${evidenceDirectory}/404-mobile.png`;
    await page.screenshot({ path: notFoundScreen });
    report.screenshots.push(notFoundScreen);
  }
  await context.close();
}

{
  const context = await browser.newContext({ viewport: viewports[1], serviceWorkers: "block" });
  let page = await context.newPage();
  const requests = [];
  context.on("request", (request) => requests.push({ url: request.url(), headers: request.headers() }));
  await page.goto(baseUrl);
  await page.evaluate(() => localStorage.setItem("real:cplab:sentinel", "keep"));
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await page.waitForFunction(() => document.querySelector("#classification")?.textContent === "Drops");
  const readState = () => page.evaluate(() => ({
    inputs: ["arrival-rate", "export-capacity", "queue-capacity", "burst-seconds"].map((id) => document.querySelector(`#${id}`).value),
    result: ["classification", "offered-result", "queue-result", "drop-result", "recovery-result"].map((id) => document.querySelector(`#${id}`).textContent),
    storage: Object.fromEntries(Object.entries(localStorage)),
  }));
  const initial = await readState();
  await page.locator("#pressure-form").evaluate((form) => {
    for (const [id, value] of [["arrival-rate", "1200"], ["export-capacity", "650"], ["queue-capacity", "2000"], ["burst-seconds", "12"]]) {
      const input = form.querySelector(`#${id}`);
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.getByText("Model complete: Drops.").waitFor();
  const reset = await readState();
  await page.getByRole("link", { name: "Privacy", exact: true }).first().click();
  const afterLeave = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  const exitPaths = { privacy: afterLeave };

  await page.goto(`${baseUrl}/demo`);
  await page.waitForFunction(() => document.querySelector("#classification")?.textContent === "Drops");
  await page.locator("#arrival-rate").evaluate((input) => {
    input.value = "1200";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.getByRole("link", { name: "Collector Pressure Lab home" }).click();
  exitPaths.wordmark = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));

  await page.goto(baseUrl);
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await page.waitForFunction(() => document.querySelector("#classification")?.textContent === "Drops");
  await page.locator("#arrival-rate").evaluate((input) => {
    input.value = "1200";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.goBack();
  exitPaths.back = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));

  await page.goto(`${baseUrl}/?demo=1`);
  await page.waitForFunction(() => document.querySelector("#classification")?.textContent === "Drops");
  const queryInitial = await readState();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.getByText("Model complete: Drops.").waitFor();
  const queryReset = await readState();

  await page.locator("#arrival-rate").evaluate((input) => {
    input.value = "1200";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.close();
  page = await context.newPage();
  await page.goto(baseUrl);
  exitPaths.closeAndReopen = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  report.demo = {
    initial,
    reset,
    resetMatchesInitial: JSON.stringify(initial.inputs) === JSON.stringify(reset.inputs) && JSON.stringify(initial.result) === JSON.stringify(reset.result),
    queryInitial,
    queryReset,
    queryResetMatchesInitial: JSON.stringify(queryInitial.inputs) === JSON.stringify(queryReset.inputs) && JSON.stringify(queryInitial.result) === JSON.stringify(queryReset.result),
    exitPaths,
    sameOriginRequests: requests.every((request) => new URL(request.url).origin === new URL(baseUrl).origin),
    requestsAddNoIdentityValues: requests.every((request) => {
      const url = new URL(request.url);
      const names = Object.keys(request.headers);
      const queryIsOnlyDemoMode = [...url.searchParams.entries()].every(([key, value]) => key === "demo" && value === "1");
      return queryIsOnlyDemoMode && !names.some((name) => /^(authorization|cookie|x-(client|device|session|user|visitor)-id)$/i.test(name));
    }),
    cookies: await context.cookies(),
  };
  await page.goto(baseUrl);
  await page.getByRole("link", { name: "Privacy", exact: true }).first().click();
  await page.waitForFunction(() => document.activeElement?.tagName === "H1");
  const privacyFocus = await page.evaluate(() => ({ focused: document.activeElement?.textContent?.trim(), announced: document.querySelector("#route-announcer")?.textContent }));
  await page.goBack();
  await page.waitForFunction(() => document.activeElement?.id === "hero-title");
  const backFocus = await page.evaluate(() => ({ focused: document.activeElement?.id, announced: document.querySelector("#route-announcer")?.textContent }));
  await page.goto(`${baseUrl}/#cli`);
  await page.waitForFunction(() => document.activeElement?.id === "cli-title");
  const hashFocus = await page.evaluate(() => ({ focused: document.activeElement?.id, top: document.querySelector("#cli")?.getBoundingClientRect().top, announced: document.querySelector("#route-announcer")?.textContent }));
  report.navigation = { privacyFocus, backFocus, hashFocus };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: viewports[1] });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/demo`);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(() => document.querySelector("#classification")?.textContent === "Drops");
  report.offline = {
    controlled: await page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    title: await page.title(),
    banner: await page.getByText("Demo — sample data, nothing is saved").isVisible(),
    classification: await page.locator("#classification").textContent(),
  };
  await context.close();
}

await browser.close();
writeFileSync(`${evidenceDirectory}/product-check.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
