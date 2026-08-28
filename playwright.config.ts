import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./site/tests",
  // Several claim checks run real bounded timing fixtures. Keep the browser
  // matrix serial so unrelated page work cannot steal time from those
  // measurements and make the central threshold claim load-sensitive.
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
  webServer: {
    command: "node site/preview.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});
