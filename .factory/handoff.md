# Collector Pressure Lab — polish 3 handoff

Work order: `collector-pressure-lab-polish-3`

Review base: `cc20fc8a9d275366adb1f750385f80919a2276c7`

Released product source: `4fc6c70`

Live URL: <https://collector-pressure-lab.sociobot.in/>

Completed: 2026-08-28

## Status: complete

Every finding from review rounds 1–3 and the earlier verification reports is
closed. The finding-by-finding record is in `.factory/polish-3.md`. There are
no known product gaps, deferred minor items, stubs, or TODOs.

## What changed

- Rewrote the first screen so it states the pressure-threshold job, audience,
  one-click sample outcome, and three concrete facts within a 390 × 844 view.
- Kept the Art Deco instrument-panel identity while raising visible text to a
  16 px minimum and preserving 44 × 44 px controls at both test viewports.
- Made `/demo` and `?demo=1` open the populated sample in one click. Demo data
  uses only the `demo:` namespace, reset restores the seed, and exit removes
  only demo state. The query entry now sets demo title, canonical, and OG URL.
- Added observable claims for the default Collector metrics endpoint and the
  CLI file/network boundary. Removed or narrowed statements that the sandbox
  could not prove. The manifest now has 14 unique claims and exactly one test
  tag per claim.
- Serialized browser claim execution to remove timing contention and included
  child stdout/stderr in assertion failures.
- Standardized “Collector config” and “config values,” removed internal
  factory credential language, and replaced “safe sample” with “bundled
  sample.”
- Restricted Cargo packaging to the binary, library, license, README, and
  bundled examples. Site assets and factory evidence are excluded.
- Extended route, focus, mobile, metadata, 404, Axe, target-size, privacy,
  offline, and reduced-motion regression coverage.

## Clean-clone verification

Final source was checked from `/tmp/cplab-polish3-final.Nze6sw` after a fresh
clone and `npm ci`.

```sh
npm test
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
cargo package --allow-dirty
npm audit --omit=dev
```

Results:

- All 14 command strings in `.factory/claims.json` passed independently.
- Rust: 4 unit tests, 4 CLI contract tests, 3 pressure fixtures, and 1 doctest.
- Vitest: 6 passed.
- Playwright: 39 passed and 9 intentional duplicate mobile-project skips.
- Formatting, Clippy with warnings denied, release build, package verification,
  and production audit all passed; the audit found zero vulnerabilities.
- Cargo package: 13 files, 68.2 KiB raw, 18.9 KiB compressed.
- Site build: 6.50 kB JavaScript, 16.09 kB CSS, no font payload, and a
  102.75 kB hero WebP.

The full suite also passed in two preceding independent clean clones while the
final claim and packaging assertions were being tightened. The formerly flaky
threshold claim passed in every serialized run.

## Browser and accessibility evidence

- Local Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.66 s, CLS 0, TBT 0 ms.
- Live Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.35 s, CLS 0, TBT 0 ms.
- `/opt/fleet/lib/verify-url.sh` passed locally and live. The live cold load was
  1,221 ms with zero console errors, one `h1`, one `main`, `lang="en"`, no
  missing alt text, and no unnamed buttons.
- Cold live Axe checks found zero serious or critical violations on `/`,
  `/demo`, `/?demo=1`, `/privacy/`, `/terms/`, `/404`, and an unknown route at
  1440 × 900 and 390 × 844.
- Every live route had one `h1`, one `main`, no horizontal overflow, and the
  expected distinct title. Unknown paths returned the styled 404 with HTTP 404.
- Live keyboard checks restored focus to `hero-title` on Back and placed the
  `#cli` heading at the viewport top. Reduced-motion duration was effectively
  zero, and no visible control measured below 44 × 44 px.

Evidence files:

- `.factory/evidence/polish-3/live/product-check.json`
- `.factory/evidence/polish-3/live/hashes-and-headers.txt`
- `.factory/evidence/polish-3/live/lighthouse-summary.json`
- `.factory/evidence/polish-3/live/first-screen-mobile.png`
- `.factory/evidence/polish-3/live/demo-mobile.png`
- `.factory/evidence/polish-3/live/demo-query-mobile.png`
- `.factory/evidence/polish-3/live/404-mobile.png`

## Deployment verification

The static work-order command completed successfully:

```sh
npm ci && npm run build:site
/opt/fleet/lib/deploy-static.sh collector-pressure-lab /work/repo/dist/site
```

The custom domain reported Ready and returned HTTPS 200. Local and live hashes
match for `index.html`, `sw.js`, the hashed CSS and JavaScript, and the hero
image. Live responses include the restrictive CSP, Permissions Policy,
Referrer Policy, HSTS, and `nosniff`. Hashed assets use one-year immutable
caching. The deployment control file is neither public nor worker-cached.

The final cold demo check confirmed a completed Drops result, 500 dropped
items, same-origin requests only, isolated demo storage, reset to 900 items/s,
real-state preservation on exit, and a populated offline reload.

## Package and maintenance

The CLI package is ready for the factory publishing step; it was not published
from this worker. Run `cargo package` to reproduce the archive. Run `npm test`
for the complete acceptance suite or execute each command in
`.factory/claims.json` for claim-by-claim verification.
