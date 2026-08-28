# Collector Pressure Lab — polish 4 handoff

Work order: `collector-pressure-lab-polish-4`
Reviewed base: `2c0707cea8d10e46374cf315588e5d8e897024e0`
Review repaired: `a3f7acd8ddbc1e99111904e182fa0c7b9837c93a`
Product repair: `01b34eedc57c5a74cee94649540ed122dfc8c300`
Live URL: <https://collector-pressure-lab.sociobot.in/>

## Status: complete

The final untested factual promise is repaired. `Free to use.` is now declared as the exact `free-to-use` claim and has one clean-state tagged Playwright test. It visits home, demo, privacy, and terms; confirms the free statements; rejects paid-tier, price, billing, payment, and login affordances; records same-origin-only requests; and scans the browser source for billing or payment runtimes.

The release was built with the work-order command `npm ci && npm run build:site` and deployed directly to Azure Static Web Apps production (`sf-collector-pressure-lab`, resource group `sociobot`) from `dist/site`. The public root returned `build polish-4` after deployment.

## Exact verification evidence

- Fresh clone: `/tmp/cplab-polish4-clean.PG89Ev` at `01b34ee`; `npm ci` completed with 0 vulnerabilities.
- Every manifest command ran independently and passed: `demo-isolation`, `free-to-use`, `offline-reload`, `browser-no-network-or-storage`, `loopback-guard`, `bounded-replay`, `config-inspection`, `classification`, `collector-metrics`, `cli-data-boundary`, `no-config-write`, `package-and-tests`, `no-third-party-runtime`, `legal-and-site-links`, and `threshold-accuracy`.
- `npm test` passed in that clone: 4 Rust unit tests, 4 CLI contract tests, 3 pressure fixtures, 1 doctest, 6 Vitest tests, and 50 Playwright checks. It covers the unit, integration, build, browser, accessibility, privacy, service-worker, and offline paths.
- `cargo fmt --check`, `cargo clippy --all-targets --all-features -- -D warnings`, and `cargo package --allow-dirty` passed. The created package is `target/package/collector-pressure-lab-0.1.0.crate`.
- Required live URL verifier passed with HTTP 200, no console errors, one title, `lang="en"`, one `h1`, one `main`, and zero images missing `alt`: [verify.json](evidence/polish-4/live/verify.json).
- Cold live browser audit passed at 390 × 844 and 1440 × 900. It checks every public route, query demo, missing-route 404, metadata, CSP, Permissions Policy, target sizes, overflow, forward/back/hash focus, isolated demo reset/exit, same-origin requests, and offline reload: [product-check.json](evidence/polish-4/live/product-check.json).
- Axe returned zero serious or critical violations on `/`, `/demo`, `/?demo=1`, `/privacy/`, `/terms/`, and `/404` at both viewports. This is recorded per route in [product-check.json](evidence/polish-4/live/product-check.json).
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.35 s, CLS 0, TBT 0 ms: [lighthouse.json](evidence/polish-4/live/lighthouse.json).
- Screenshots: [mobile first screen](evidence/polish-4/live/first-screen-mobile.png), [desktop first screen](evidence/polish-4/live/first-screen-desktop.png), [mobile demo](evidence/polish-4/live/demo-mobile.png), [desktop demo](evidence/polish-4/live/demo-desktop.png), [mobile query demo](evidence/polish-4/live/demo-query-mobile.png), and [desktop query demo](evidence/polish-4/live/demo-query-desktop.png).

## Product and release notes

- Catalog copy is now verb-first and 77 characters: “Find when a local OpenTelemetry Collector queues, slows, or drops telemetry.”
- The visual system remains the documented art-deco pressure-line treatment; no generic template or third-party runtime was introduced.
- `cplab demo` remains a bundled, loopback-only temporary-directory flow. The website demo remains in the separate `demo:cplab:pressure-input` namespace and is cleared by **Start for real**.
- Ready-to-publish package command: `cargo package`. Nothing was published from this work order.

## Known gaps and next steps

None. No review finding of any severity remains open.
