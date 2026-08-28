# Collector Pressure Lab — polish 2 handoff

Work order: `collector-pressure-lab-polish-2`

Source commits: `0e84232`, `dda09e7`, `45273e2`, `e19376b`

Live URL: <https://collector-pressure-lab.sociobot.in/>

Completed: 2026-08-28

## Status: complete

Every finding in `review-1.md` and `review-2.md` is resolved.
The CLI remains a Rust single binary, and the deployment remains a static Vite site.
The art-deco transit-poster identity is unchanged.

## Delivered

- Rewrote the first screen around the Collector pressure-threshold job and its OpenTelemetry audience.
- Added a one-click, precomputed `/demo` and `/?demo=1` flow with a persistent banner, reset, exit, and `demo:` storage isolation.
- Added `cplab demo`; it runs bundled samples against a temporary loopback receiver and writes its report only under `/tmp`.
- Added `.factory/claims.json` with 12 one-to-one tagged tests and `.factory/demo.md` with the sandbox contract.
- Added real demo, privacy, terms, designed 404, unknown-route status, sitemap, metadata, focus, history, and deep-link behavior.
- Added CSP, Permissions Policy, immutable hashed-asset caching, and offline route-aware service-worker fallbacks.
- Rewrote every flagged heading and sentence, added a copy audit, fixed mobile hit targets, and identified the external source link.
- Added original-art derivatives for Open Graph and the Apple touch icon; provenance is in `.factory/design.md`.

The finding-by-finding map is in `.factory/polish-2.md`.

## How to verify

```sh
npm ci
npm test
npm run test:claims
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
cargo package --allow-dirty
npm audit --omit=dev
```

Run one claim independently with:

```sh
npm run test:claims -- --grep @claim:demo-isolation
```

Every command listed in `.factory/claims.json` was also run independently from a clean clone.

## Exact evidence

- `npm test`: 4 Rust unit, 4 CLI contract, 3 pressure fixture, 1 doctest, 5 Vitest, and 35 Playwright cases passed; 7 duplicate mobile CLI cases skipped by design.
- `npm run test:claims`: 17 browser/project cases passed; 7 duplicate mobile CLI cases skipped by design.
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- `cargo build --release`: passed.
- `cargo package --allow-dirty`: verified one 0.1.0 source package. Nothing was published.
- `npm audit --omit=dev`: zero vulnerabilities.
- `dist/site`: JS 6.38 KB raw / 2.69 KB gzip; CSS 15.86 KB raw / 4.33 KB gzip.
- Local route axe sweep: zero violations on `/`, `/demo`, `/privacy/`, `/terms/`, and `/404` at 1440 and 390 px.
- Live route axe sweep: zero violations on all public routes and the unknown-path 404 at both viewports.
- Live valid routes: zero console or page errors; no horizontal overflow; every visible control is at least 44×44 px.
- Live demo: `Drops` is visible in the first viewport; reset returns arrival rate to 900; exit clears demo storage.
- Live privacy: the complete demo flow made only same-origin requests.
- Live offline: the service worker controls the page and reloads the populated demo offline.
- Live headers: CSP and Permissions Policy are present; hashed CSS remains immutable.
- Live Lighthouse mobile: 99 Performance, 100 Accessibility, 96 Best Practices, 100 SEO; LCP 1.4 s, CLS 0, TBT 100 ms.
- Live root and service-worker SHA-256 values match `dist/site`.
- Local evidence: `.factory/evidence/local/`.
- Live evidence: `.factory/evidence/live/`.
- Successful deployment id: `f26819bd-7b05-46e6-b601-aa59e01eea1a`.

## Deploy

```sh
npm ci && npm run build:site
/opt/fleet/lib/deploy-static.sh collector-pressure-lab dist/site
```

## Known gaps and next steps

None. No review finding, claim, test, or deployment check remains unresolved.
