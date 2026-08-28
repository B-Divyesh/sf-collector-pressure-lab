# Collector Pressure Lab — repair handoff

Work order: `collector-pressure-lab-repair-1`
Repair source commit: `1423db9e74de909dabafb21c0a91683d7dc58691`
Completed: 2026-08-28
Deployment: https://collector-pressure-lab.sociobot.in/

## Release-blocking findings repaired

### P1 — all-drop measurements now return results

`cplab run` now distinguishes an HTTP response from a transport failure. A
step reports additive `responses` and `transport_errors` fields. When every
request receives a non-2xx response (including a 503-only receiver), it now
returns exit `0`, a complete `drops` JSON report, and the human `PRESSURE LINE
DROPS` report with hypotheses. Exit `3` is reserved for runs where no HTTP
response could be measured at all.

Regression coverage is at both boundaries:

- `tests/pressure_fixture.rs` uses a 503-only loopback receiver and asserts a
  measured `drops` report with zero successes and zero transport errors.
- `tests/cli_contract.rs` reproduces the verifier command shape for `--json
  --ci`, asserts exit `0` plus the complete report, checks the human report,
  and separately asserts exit `3` for an unused loopback port.
- `README.md` now documents the corrected exit-code and all-non-2xx contract.

### P2 — Azure Static Web Apps cache policy is now deployed

`site/public/staticwebapp.config.json` is shipped in `dist/site` and is the
configuration format used by the static deployment worker. It retains the
existing navigation/security policy and adds route-specific caching:

- `/assets/*`: `public, max-age=31536000, immutable`
- `/pressure-line.webp`: `public, max-age=86400`
- `/sw.js`: `no-cache`

`site/deployment.test.ts` pins those three rules. Deployment `0b18ab5a-f2c5-
4bae-8ebd-149cd9edf249` completed through `/opt/fleet/lib/deploy-static.sh`.
Live header recheck confirmed the two hashed files return the one-year
immutable policy, the hero returns the one-day policy, and the service worker
returns `no-cache`.

## Verification evidence

- Clean JavaScript install: `npm ci` completed with 0 audit vulnerabilities.
- `npm test`: pass. This runs 4 Rust unit tests, 4 CLI contract tests, 3
  loopback pressure-fixture tests, 1 Rust doctest, 4 Vitest tests, and 8
  Playwright checks across desktop Chromium and a 390×844 mobile profile.
  The browser checks cover model behavior, keyboard range control, axe
  serious/critical violations, privacy/terms, and offline shell reload.
- `cargo clippy --all-targets --all-features -- -D warnings`: pass.
- `cargo build --release`: pass.
- `cargo package --allow-dirty`: pass; package verification passed. A clean
  temporary `cargo install --path target/package/collector-pressure-lab-0.1.0`
  produced `cplab`; `--help` and documented `inspect --json` worked, and a
  remote endpoint was rejected with exit 2.
- `npm run build`: pass, emitting `dist/site`. Production payloads are
  4,057-byte JS (1.80 KiB gzip), 13,576-byte CSS (3.86 KiB gzip), and a
  102,748-byte WebP hero.
- Local `verify-url.sh`: HTTP 200 in 528 ms; correct title/lang, one h1,
  main landmark, zero missing image alts/unlabeled buttons, and no console or
  page errors.
- Local Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.5 s, CLS 0, TBT 0 ms.
- Live `verify-url.sh`: HTTP 200 in 596 ms with the same title/lang/landmark/
  alt/button checks and zero console/page errors. A live 390×844 Chromium
  check reached `DROPS`, changed the range with ArrowRight (700 → 750), and
  made no external browser request. The checked live CSS, JS, hero WebP, and
  service worker SHA-256 values exactly matched `dist/site`.
- Privacy and response policy: no analytics, telemetry, third-party fonts, or
  browser requests were introduced. Live root keeps the static host's
  short revalidation policy; only content-addressed assets are immutable, and
  the updateable service worker is explicitly non-cacheable.

## Run, test, package, and deploy

```sh
npm ci
npm test
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
cargo package --allow-dirty
npm run build:site
```

The deploy artifact remains `dist/site`; the factory deployment command is
`/opt/fleet/lib/deploy-static.sh collector-pressure-lab /work/repo/dist/site`.
Do not publish the crate from this repository; `cargo package` prepares the
release source package.

## Known limits

- The runner supports bounded OTLP/HTTP or JSON-like HTTP bodies, not gRPC,
  TLS, protobuf framing, or Collector orchestration.
- YAML inspection intentionally reports anchors, substitutions, and indirect
  values as unknown instead of expanding them.
- The browser lab is deterministic education only; the CLI is the component
  that contacts and measures a Collector.
