# Independent verification 2 — FAIL

Verified 2026-08-28 from a clean checkout at source commit
`3a6663669474618cc571658dc5b8ebcf7b3a2a7d` against
`https://collector-pressure-lab.sociobot.in/`.

## Decision

**FAIL.** The CLI, browser model, deployment identity, caching repair, and
nearly all quality checks are good. However, the deployed service worker cannot
install, so the advertised PWA cannot update or reload offline. This is a
release-blocking deployed-artifact defect, not a source-build failure.

No product source was changed during this verification. This report and the
handoff are the only working-tree changes.

## Release-blocking defect

### P1 — production service worker precaches a deployment-control file that is not public

The candidate `sw.js` includes `/staticwebapp.config.json` in its `ASSETS`
array and installs with `cache.addAll(ASSETS)`. On the live host:

```text
GET /staticwebapp.config.json  -> HTTP 404
```

`Cache.addAll()` rejects if any resource is not a successful response. Fresh
Chromium evidence showed `serviceWorker` support but, six seconds after load,
no registration and no controller. A direct
`navigator.serviceWorker.register('/sw.js')` initially returned an
`installing` registration; two seconds later `getRegistration()` returned no
registration, with no active/waiting/controlling worker. Consequently
`navigator.serviceWorker.ready` never becomes ready and an offline reload or
update cannot succeed.

The static deployment intentionally returns 404 for the configuration file;
it is consumed at deployment time and is not a public asset. Remove it from
the precache list (or only precache resources verified public in production),
deploy, then verify a controlled worker, offline reload, and a changed-worker
update on the live URL.

## What passed

### Clean install, tests, build, and package

- Checkout was clean at the candidate SHA before reporting. `npm ci` completed
  with 0 audit vulnerabilities.
- `npm test` passed: 4 Rust unit tests, 4 CLI contract tests, 3 pressure
  fixtures, 1 doctest, 4 Vitest tests, and 8 Playwright desktop/mobile tests.
  Playwright's final `test-results/.last-run.json` is `passed` with no failed
  tests.
- `cargo clippy --all-targets --all-features -- -D warnings`, `cargo build
  --release`, `cargo package --allow-dirty`, exact `npm run build`, and
  `npm audit --omit=dev` passed. The package contains 40 files (280.1 KiB,
  155.9 KiB compressed) and Cargo's package verification passed.
- A clean temporary consumer `cargo install --path
  target/package/collector-pressure-lab-0.1.0 --root <temp>` produced the
  single `cplab` binary. `--help` was useful, documented `inspect --json`
  returned queue/batch settings, and a non-loopback endpoint was rejected with
  documented exit 2.

### Independent CLI end-to-end cases

All fixtures were isolated loopback HTTP servers and used the release binary.

- HTTP 200 at 25 rps for 500 ms: `stable`, 13/13 responses and successes,
  zero drops/transport errors, 26.98 achieved rps.
- A serial 20 ms exporter at rates 20 then 100 rps: first step `stable`; the
  second was `backpressure` at 49.68 achieved rps. That is within 1% of the
  measured 50 rps fixture capacity, comfortably inside the brief's 20%
  threshold criterion.
- HTTP 503 for every request at 25 rps/250 ms: exit 0 and complete JSON
  `drops` report, 7 responses, 0 successes, 7 drops, and 0 transport errors.
  This confirms the earlier all-drop defect is repaired.
- Invalid 249 ms duration, 10,001 rps, concurrency 257, and malformed header
  each returned exit 2 with a clear message. A loopback port with no listener
  returned documented exit 3 (`no HTTP responses were received`), preserving
  recovery semantics.

### Live deployment, browser, privacy, and response policy

- The live root HTML SHA-256 exactly matched `dist/site/index.html`; the
  deployed hashed CSS, JS, hero WebP, and `sw.js` each exactly matched the
  exact production build.
- The repaired cache behavior is live: `/assets/main-BHvAnVaC.css` and
  `/assets/main-BI7EvyuP.js` return `public, max-age=31536000, immutable`;
  `/pressure-line.webp` returns `public, max-age=86400`; `/sw.js` returns
  `no-cache`. HTML keeps short `public, must-revalidate, max-age=30`.
- Desktop and 390x844 mobile Chromium both reached `Model complete: Drops.`
  with no console/page errors, no horizontal overflow on mobile, and only
  same-origin browser requests. The arrival control changed 700 -> 750 with
  ArrowRight. Keyboard Tab first reached the skip link; focus was a visible
  solid 3 px brass outline with 4 px offset. Reduced motion changed transition
  duration to `1e-06s`.
- Axe had zero serious or critical violations on desktop and 390px mobile.
  The live page has its expected title, one `h1`, and one `main`; privacy and
  terms routes return 200.
- Source and runtime review found no analytics, telemetry upload, storage,
  third-party font/script, or third-party browser request. The CLI defaults to
  loopback and rejects remote endpoints unless explicitly overridden.
- Live responses provide HSTS, `X-Content-Type-Options: nosniff`, and
  `Referrer-Policy: strict-origin-when-cross-origin`. No CSP or Permissions
  Policy header was observed; this is recorded as hardening context, not an
  additional release decision for this static tool.

### Performance and budgets

- Lighthouse 12.8.2 mobile against production: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; LCP 1,362 ms, CLS 0, TBT
  0 ms.
- Production payloads are 4,057-byte JS (1,824 bytes gzip), 13,576-byte CSS
  (3,857 bytes gzip), no font payload, and 102,748-byte WebP hero: all within
  the stated budgets.

## Required resolution and re-verification

1. Exclude the non-public `staticwebapp.config.json` from `sw.js` precaching.
2. Deploy the new artifact and ensure the worker takes control.
3. On the live URL, load once online, confirm a controller, reload offline,
   then install a changed-worker version and confirm the new cache/worker
   activates. Re-run the existing clean-install and all-drop CLI checks.
