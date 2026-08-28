# Independent verification 3 — PASS

Verified 2026-08-28 from a clean checkout at candidate commit
`c7a3c8004d96e3bf7d8df4d15c48e515737c3bd2` against
`https://collector-pressure-lab.sociobot.in/`.

## Decision

**PASS.** The candidate is a functional, local-first Collector pressure
experiment, not a demo. Fresh production evidence confirms the prior
deployment-only service-worker defect is repaired: the live worker installs,
controls the page, remains active after an update check, and supports an
offline reload. No product source was changed during this verification.

## Clean-checkout gates

All of the following passed:

```sh
npm ci
npm test
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
npm run build
cargo package --allow-dirty
npm audit --omit=dev
```

- `npm ci` and `npm audit --omit=dev`: 0 audit vulnerabilities.
- `npm test`: 4 Rust unit tests, 4 CLI-contract tests, 3 pressure-fixture
  tests, 1 doctest, 4 Vitest tests, and 10 Playwright desktop/mobile tests
  passed. An independent `npx playwright test` rerun also passed all 10.
- TypeScript's no-emit check is part of the exact Vite production build.
  There is no separate lint script; Clippy is clean with warnings denied.
- `cargo package --allow-dirty` packaged 41 files (286.7 KiB / 157.9 KiB
  compressed) and passed Cargo's package compilation verification.
- Built browser payloads: JS 4,057 bytes (1,804 gzip), CSS 13,576 bytes
  (3,856 gzip), no font payload, hero WebP 102,748 bytes. All are below the
  stated budgets.

## Independent CLI evidence

All ad-hoc fixtures ran only on `127.0.0.1` using `target/release/cplab`.

- A serial 20 ms receiver was stable at 20 rps (10/10 successes; 21.21
  achieved rps) and classified `backpressure` at 100 rps (50/50 successes;
  49.34 achieved rps; p95 491.4 ms). The 49.34 rps threshold is 1.3% from the
  fixture's measured 50 rps capacity, meeting the brief's 20% criterion.
- An all-503 receiver at 25 rps/250 ms exited 0 with a complete `drops` JSON
  report: 7 responses, 0 successes, 7 drops, 0 transport errors.
- A loopback port with no listener returned documented exit 3 and a clear
  recovery message. Empty sample behavior (exit 2) is covered by the CLI
  contract suite.
- 249 ms duration, 10,001 rps, concurrency 257, malformed header, and a
  remote endpoint without `--allow-remote` each returned exit 2 with a useful
  error. `inspect --json` returned the documented queue/batch values.

### Packaged consumer

`cargo install --path target/package/collector-pressure-lab-0.1.0 --root
<temp>` installed the single `cplab` binary into a clean consumer root. Its
`--help` was useful, its documented inspection JSON was correct, and its
remote-endpoint guard returned exit 2. Nothing was published.

## Live artifact and browser evidence

The live deployment exactly matched the local production build by SHA-256:

- `index.html` — `46ec75e90ecc9794a7c3e8fb2567554bc9665ffbd8bd7a2db238a1e7b4db3003`
- `sw.js` — `6aae6148fcef5a5e8c5c6f8efb24fa6d3c5a2d4bf3d4831db342e37463de1382`
- CSS — `70ea8cfbc7e5e12fc4a842d862da93312e9ffde52a55377f4bdba8bb55421722`
- JS — `538de73ab10949183e784213643d4dc5eb11e74f9712ac45e896fdc2941d32b4`
- hero WebP — `3dccf4c508be7097cadb5110ee0f707fcef21fbaa7b636d04f14af3bb286e62b`

Fresh Chromium checks at desktop and 390 x 844 mobile found one title, one
`h1`, one `main`, correct legal routes, a `Drops` model result, no console or
page errors, and no third-party runtime requests. The first Tab reaches the
skip link; its computed focus is a visible brass 3 px outline with 4 px offset.
ArrowRight changes the arrival control from 700 to 750. Axe found zero serious
or critical violations on both viewports; the 390 px page has no
user-scrollable horizontal overflow. Reduced motion changes transitions to
`1e-06s` while preserving result updates.

The live worker was verified in a fresh browser context: `ready` resolved,
reload produced a controller, `registration.update()` retained an active worker
with no waiting worker, and offline mode showed the banner and reloaded the
model shell. Its precache excludes `staticwebapp.config.json`; that live
deployment-control route correctly 404s and was not requested by worker
installation. This directly resolves the previous P1.

Source/runtime review found no analytics, tracking, storage, remote font, or
third-party script. The CLI defaults to loopback and only sends bounded sample
bodies to the chosen endpoint.

## Response policy, caching, and performance

- `/`, `/privacy/`, and `/terms/` return 200; deployment-control
  `/staticwebapp.config.json` returns the intended 404.
- HTML: `public, must-revalidate, max-age=30`; worker: `no-cache`; hashed
  assets: `public, max-age=31536000, immutable`; hero: `public, max-age=86400`.
- Live headers include HSTS, `X-Content-Type-Options: nosniff`, and
  `Referrer-Policy: strict-origin-when-cross-origin`.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1,438 ms, CLS 0, TBT 133 ms. The score JSON was written before
  Chrome's final full-page-screenshot process crashed; its audited metrics are
  valid and independent Playwright sessions reported no browser/page errors.

## Findings

### P3 — CSP and Permissions-Policy are absent

Live responses have no Content-Security-Policy or Permissions-Policy. This is
defense-in-depth rather than release-blocking because all tested runtime code
is same-origin and there is no third-party code. Add restrictive static headers
when deployment policy next changes, then retest PWA/offline behavior.

## Known product boundaries

The intentional scope is bounded HTTP JSON/NDJSON replay, not TLS, gRPC,
protobuf, Collector provisioning, or production-scale generation. Templated
config values are reported as unknown; synthetic results are not capacity
guarantees.
