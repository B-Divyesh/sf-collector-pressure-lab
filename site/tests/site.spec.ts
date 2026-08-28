import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("runs the offline model and exposes a complete result", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await page.getByRole("link", { name: "Run the browser model" }).click();
  await page.getByRole("button", { name: /Run the model/ }).click();
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
  await page.goto("/terms/");
  await expect(page.getByRole("heading", { level: 1, name: "Terms" })).toBeVisible();
});

test("reopens the model shell offline", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "service worker check uses Chromium");
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await expect(page.getByText(/Offline mode/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: /Run the model/ })).toBeVisible();
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
