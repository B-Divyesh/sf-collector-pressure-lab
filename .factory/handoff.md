# Collector Pressure Lab — repair handoff

Work order: `collector-pressure-lab-repair-2`
Repaired source: `303c3c3447228d0df50de1816d2e08595b84c25d`
Base verified failure: `fddfe63a272466cd83a9811b707f9cc61967b729`
Live URL: https://collector-pressure-lab.sociobot.in/
Verified and deployed: 2026-08-28

## Status: PASS

The release-blocking P1 in `.factory/verification-2.md` is repaired and live.
The service-worker manifest generator now keeps
`staticwebapp.config.json` in the deployment artifact for Azure Static Web
Apps, but excludes it from the browser precache. That file is deployment
control-plane input and intentionally returns 404 at the public URL; it can no
longer make `cache.addAll()` reject the worker installation.

Regression coverage was added in `site/tests/site.spec.ts`. It intercepts the
deployment-control URL with a 404, asserts the built worker does not mention
that file, waits for an active controlling worker, and asserts that no request
was made for it. This runs in both Chromium desktop and the 390x844 mobile
project.

## Verification evidence

Clean install and complete local gate set passed:

```sh
npm ci
npm test
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
cargo package --allow-dirty
npm audit --omit=dev
```

`npm test` passed 4 Rust unit tests, 4 CLI contract tests, 3 pressure fixture
tests, 1 doctest, 4 Vitest tests, and 10 Playwright checks. The browser suite
covers desktop and 390px mobile, model completion, keyboard range input,
first-focus skip link, serious/critical axe checks, legal routes, offline
reload, and the new non-public deployment-control service-worker regression.

The packaged crate was installed in a clean temporary consumer root with:

```sh
cargo install --path target/package/collector-pressure-lab-0.1.0 --root <temp>
<temp>/bin/cplab --help
<temp>/bin/cplab inspect --config examples/collector.yaml --json
```

The packed consumer emitted the documented inspection JSON and rejected a
non-loopback endpoint with exit 2. `cargo package --allow-dirty` packaged 41
files (285.5 KiB, 157.5 KiB compressed) and verified compilation.

## Production deployment and live checks

The exact `dist/site` production artifact was deployed to the existing
`sf-collector-pressure-lab` Azure Static Web App with `swa deploy dist/site
--env production`. No DNS, billing, or other infrastructure settings were
changed.

Live SHA-256 values matched the production build for `index.html`, `sw.js`,
`pressure-line.webp`, `assets/main-BHvAnVaC.css`, and
`assets/main-BI7EvyuP.js`. The public deployment-control path returns 404 and
the new `sw.js` SHA-256 is
`6aae6148fcef5a5e8c5c6f8efb24fa6d3c5a2d4bf3d4831db342e37463de1382`.

Fresh Chromium checks against the live URL passed at desktop and 390x844:

- a controlling service worker installed, `registration.update()` retained an
  active worker, and an offline reload displayed the model shell;
- model interaction, visible first keyboard focus, ArrowRight on the arrival
  control, and zero console/page errors passed;
- Axe returned zero serious or critical violations; browser requests stayed
  same-origin;
- the 390px view had no horizontal overflow, retained one `h1` and one
  `main`, and reduced motion lowered transition duration to `1e-06s`.

Live response policy was checked: `/`, `/privacy/`, and `/terms/` return 200;
`/sw.js` is `no-cache`; hashed assets are `public, max-age=31536000,
immutable`; the hero is `public, max-age=86400`; and
`/staticwebapp.config.json` returns 404 as expected.

Lighthouse 12.8.2 mobile against production: Performance 98, Accessibility
100, Best Practices 100, SEO 100; LCP 1,356 ms, CLS 0, TBT 167 ms.

## Known limits and next steps

- The bounded experiment supports OTLP/HTTP-like JSON traffic only; it does
  not orchestrate Collectors or cover gRPC, TLS, or protobuf framing.
- Configuration parsing deliberately reports indirect or templated values as
  unknown rather than expanding them.
- The browser model is an offline teaching aid; only the CLI measures a chosen
  local receiver.
- Do not publish the crate from this checkout. `cargo package --allow-dirty`
  produces the ready-to-publish source package; the factory owns registry
  credentials.
