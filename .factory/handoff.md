# Collector Pressure Lab — polish 5 handoff

Work order: `collector-pressure-lab-polish-5`

Released candidate: `809999e510b963e5cba165c7a059aa5d73e52ec9`

Review commit: `c35868bd419f01f105b0f82f15ccbe44267d3bb6`

Product repair: `e1c0ac7`

Verification repair: `b2f289c`

Live URL: <https://collector-pressure-lab.sociobot.in/>

## Status

Round 5 is complete. All findings from reviews 1–5 and earlier verification
records are closed. The detailed one-to-one map is in
[polish-5.md](polish-5.md).

The repair makes the browser sample exact and isolated, clears it on every
leave path, completes 404 social metadata, removes the unprovable independence
sentence, and adds a tested no-browser-identifier claim. It also strengthens
route, link, metadata, mobile, focus, and live verification. The catalog line
is now a verb-first 84-character sentence.

The visual direction remains the original art-deco transit-poster pressure
lab. The artifact class remains a Rust CLI with a Vite static landing/docs
site.

## Run and verify

```sh
npm ci
npm test
npm run build:site
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
cargo package --allow-dirty
```

Run the shipped CLI sample with `cargo run -- demo`. Open the isolated web
sample at `http://localhost:4173/demo` after `npm run preview:site`.

## Exact verification evidence

- Final clean clone: `/tmp/cplab-polish5-final.teF95X` at `b2f289c`.
- All 16 commands from `.factory/claims.json` passed independently.
- Full `npm test` passed: 4 Rust unit, 4 CLI contract, 3 pressure fixture, 1
  doctest, 6 Vitest, and 43 Playwright passes; 9 intentional duplicate-mobile
  skips.
- Formatting, strict Clippy, release build, Cargo package, and site build
  passed. The Cargo package contains 13 files and both bundled sample inputs.
- `dist/site` JavaScript is 6.64 kB raw / 2.72 kB gzip. CSS is 16.09 kB raw /
  4.36 kB gzip. The hero image is 102,748 bytes; no font files ship.
- Local Lighthouse: Performance 99, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.7 s, CLS 0, TBT 70 ms.
- Cold live Lighthouse: 100/100/100/100; LCP 1.4 s, CLS 0, TBT 40 ms.
- The required URL verifier passed live with no console errors.
- Live Axe checks found zero serious or critical violations at 1440 × 900 and
  390 × 844. Every visible target was at least 44 × 44 px. No route overflowed.
- `/`, `/demo`, `/?demo=1`, `/privacy/`, `/terms/`, and `/404` return their
  correct documents. `/missing-polish-5` returns the designed document with
  HTTP 404. Every route has one h1, main, exact title, canonical, and Open Graph
  URL.
- Both demo entries load and reset to 900/400/1200/10 and the complete Drops
  result. Privacy, wordmark, Back, and close/reopen exits remove the demo key
  while preserving a real-data sentinel.
- The browser request audit found only same-origin requests, no identity query
  values or request headers, no Set-Cookie response, and no browser cookies.
- Offline reload is service-worker controlled and restores the populated Drops
  result.
- Local/live SHA-256 hashes match for HTML, worker, JavaScript, and CSS. Live
  hashed assets are immutable; the worker is no-cache; all security policies
  are present.

Evidence is under [.factory/evidence/polish-5](evidence/polish-5), including
desktop/mobile screenshots, the route/demo/focus/offline matrix, Lighthouse,
headers/hashes, and the required URL-verifier outputs.

## Deployment

`dist/site` was deployed to the production environment of Azure Static Web
Apps resource `sf-collector-pressure-lab` in resource group `sociobot`. A cold
custom-domain check showed `build polish-5`, and local/live artifact hashes
matched after deployment.

The CLI package was verified but not published; registry publishing remains a
factory-owned step.

## Known gaps and next steps

None within the work order. The documented product limit remains intentional:
this bounded lab test does not predict production capacity.
