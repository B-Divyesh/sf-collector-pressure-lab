# Collector Pressure Lab — independent verification handoff

Work order: `collector-pressure-lab-verify-2`
Verified source: `3a6663669474618cc571658dc5b8ebcf7b3a2a7d`
Live URL: https://collector-pressure-lab.sociobot.in/
Verified: 2026-08-28

## Status: FAIL

The candidate passes its clean install, unit/integration/browser tests,
type/lint checks, release build/package, CLI contract, deployment identity,
desktop/mobile accessibility, privacy/outbound, cache, and performance checks.
It must not be accepted because the **live service worker cannot install**.

### P1 — offline PWA/update is broken on the deployed host

`sw.js` precaches `/staticwebapp.config.json`; live requests for that
deployment-control file return 404. Its `cache.addAll()` installation rejects,
then Chromium removes the registration: no active/waiting/controlling worker
remains. Offline reload and service-worker update are therefore unavailable.

Resolve by removing that non-public path from the precache manifest (or
precache only live-successful files), deploy, then verify live worker control,
offline reload, and a changed-worker update.

## Evidence and commands

```sh
npm ci
npm test
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
cargo package --allow-dirty
npm run build
npm audit --omit=dev
```

All commands passed. `npm test` exercised 4 Rust unit tests, 4 CLI contracts,
3 pressure fixtures, 1 doctest, 4 Vitest checks, and 8 Playwright checks.
`cargo package` was installed into a clean temporary consumer; `cplab --help`,
`inspect --json`, and loopback safety rejection worked.

Independent loopback tests returned stable 13/13 HTTP-200 traffic, correctly
identified serial-slow-exporter backpressure at 49.68 rps for a 50-rps fixture,
and correctly treated all HTTP-503 traffic as an exit-0 `drops` report. Input
boundaries returned exit 2; an unreachable loopback receiver returned exit 3.

The live root HTML, CSS, JS, hero, and service worker exactly matched the
production build. Cache headers are now correct: hashed assets are immutable
for one year, hero is one day, and the service worker is `no-cache`.
Lighthouse mobile was 100 Performance / 100 Accessibility / 100 Best
Practices / 100 SEO (LCP 1.362 s, CLS 0, TBT 0). Desktop and 390px mobile had
no console/page errors, no serious/critical axe findings, only same-origin
requests, keyboard-visible focus, reduced motion, and a working browser model.

Full evidence and precise reproduction are in
`.factory/verification-2.md`.

## Known limits

- The runner is a bounded OTLP/JSON HTTP experiment, not gRPC, TLS, protobuf
  framing, or Collector orchestration.
- Configuration parsing reports indirect/templated values as unknown rather
  than expanding them.
- The browser model is educational and deterministic; only the CLI measures a
  chosen local receiver.
- Do not publish the crate from this repository. `cargo package --allow-dirty`
  prepares the release source package after the P1 is repaired.
