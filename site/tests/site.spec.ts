import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("opens the isolated sample in one click with a complete result", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await expect(page.locator("#classification")).toHaveText("Drops");
  await expect(page.locator("#model-status")).toContainText("Model complete");
  await expect(page.locator("#drop-result")).not.toHaveText("—");
  expect(consoleErrors).toEqual([]);
});

test("supports keyboard operation and serious accessibility checks", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.locator("#arrival-rate").focus();
  const before = await page.locator("#arrival-rate").inputValue();
  await page.keyboard.press("ArrowRight");
  expect(Number(await page.locator("#arrival-rate").inputValue())).toBeGreaterThan(Number(before));
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});

test("publishes privacy and terms pages", async ({ page }) => {
  await page.goto("/privacy/");
  await expect(page.getByRole("heading", { level: 1, name: "Privacy" })).toBeVisible();
  await expect(page.locator("h1")).toBeFocused();
  await page.goto("/terms/");
  await expect(page.getByRole("heading", { level: 1, name: "Terms" })).toBeVisible();
  await expect(page.locator("h1")).toBeFocused();
});

test("moves focus on full navigation and browser back", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Privacy", exact: true }).first().click();
  await expect(page.locator("h1")).toBeFocused();
  await page.goBack();
  await expect(page.locator("#hero-title")).toBeFocused();
  await expect(page.locator("#route-announcer")).toContainText("Find your Collector's pressure threshold");
});

test("reopens the model shell offline", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "service worker check uses Chromium");
  await page.goto("/demo");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await expect(page.getByText(/Offline mode/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: /Show pressure result/ })).toBeVisible();
});

test("serves a real 404 and complete route metadata", async ({ page, request }) => {
  expect((await request.get("/missing-review-route")).status()).toBe(404);
  await page.goto("/missing-review-route");
  await expect(page).toHaveTitle("Page not found — Collector Pressure Lab");
  await expect(page.getByRole("heading", { level: 1, name: "This route stops here" })).toBeVisible();
  await page.goto("/demo");
  await expect(page).toHaveTitle("Demo — Collector Pressure Lab");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/demo$/);
});

test("focuses and aligns deep links after layout", async ({ page }) => {
  await page.goto("/#cli");
  await expect(page.locator("#cli-title")).toBeFocused();
  expect(await page.locator("#cli").evaluate((element) => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(8);
  await page.goto("/#lab");
  await expect(page.locator("#lab-title")).toBeFocused();
  expect(await page.locator("#lab").evaluate((element) => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(8);
});

test("keeps every visible link and button at least 44 by 44 CSS pixels", async ({ page }) => {
  await page.goto("/");
  const tooSmall = await page.locator("a:visible, button:visible").evaluateAll((elements) => elements.flatMap((element) => {
    const box = element.getBoundingClientRect();
    return box.width < 44 || box.height < 44 ? [{ text: element.textContent?.trim(), width: box.width, height: box.height }] : [];
  }));
  expect(tooSmall).toEqual([]);
});

test("installs the offline shell when the deployment control file is not public", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "service worker check uses Chromium");
  let deploymentControlRequests = 0;
  await context.route("**/staticwebapp.config.json", async (route) => {
    deploymentControlRequests += 1;
    await route.fulfill({ status: 404, body: "Not found" });
  });

  await page.goto("/");
  const worker = await page.evaluate(async () => fetch("/sw.js").then((response) => response.text()));
  expect(worker).not.toContain("staticwebapp.config.json");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  expect(deploymentControlRequests).toBe(0);
});
