# Independent verification — FAIL

Verified on 2026-08-27 against source commit
`b40585a791017c14cb00247ca27e193da8a23af3` and
`https://collector-pressure-lab.sociobot.in/`.

## Decision

**FAIL.** The CLI does not report a measured all-drop condition. A controlled
loopback receiver that returns HTTP 503 for every request causes `cplab run` to
exit 3 with `every request failed; check that the local Collector endpoint and
signal path are running`, with no human or `--json` report. Complete loss is
precisely a pressure/drop outcome the brief requires the product to classify
and explain. The README also says completed pressure discoveries exit 0, which
is not true for this condition.

No product source was changed during verification.

## Release-blocking defect

### P1 — complete drops are treated as an execution error, not a result

Reproduction (the fixture is a local `127.0.0.1` HTTP server returning 503 for
every POST):

```sh
target/release/cplab run \
  --config examples/collector.yaml --sample examples/traces.ndjson \
  --endpoint http://127.0.0.1:49123/v1/traces --metrics-endpoint off \
  --rates 25 --duration 250ms --timeout 1s --header 'x-mode:drop' --json --ci
```

Observed: exit status `3`, stderr `cplab: every request failed; check that the
local Collector endpoint and signal path are running`, and no JSON output.
This is caused after the requests have been attempted and their non-2xx
responses counted, so it loses actionable evidence rather than recovering
from an inability to run. A mixed 200/503 fixture does return exit 0 and a
`"classification": "drops"` JSON report, confirming the edge case.

## Non-blocking deployment defect

### P2 — immutable static-asset caching is not effective live

The production `/_headers` source declares immutable, year-long caching for
`/assets/*`, but the live CSS and hashed JavaScript responses both return
`cache-control: public, must-revalidate, max-age=30`. The hero and service
worker have the same 30-second policy. This misses the stated static-product
caching policy and adds needless repeat validation requests. Deployment
configuration needs to honor the supplied header policy (or emit equivalent
headers); the source build itself is correct.

## What passed

- Clean checkout was exactly the candidate commit before report creation.
  `npm ci`, `npm test`, `cargo clippy --all-targets --all-features -- -D
  warnings`, `cargo build --release`, `cargo package --allow-dirty`, exact
  `npm run build`, and `npm audit --omit=dev` all passed. `npm test` covered 4
  Rust unit tests, 2 CLI-contract tests, 2 pressure fixtures, 1 doctest, 3
  Vitest cases, and 8 Playwright project checks.
- A packed clean consumer install succeeded from
  `target/package/collector-pressure-lab-0.1.0`: `cplab --help`, documented
  `inspect --json`, and remote-endpoint rejection (exit 2) all behaved as
  documented.
- Independent loopback end-to-end CLI cases:
  - HTTP 200: `stable`, 7/7 successes, 28.9 req/s at 25 offered req/s.
  - Serial 100 ms HTTP 200: `backpressure`, 6/6 successes and 9.88 req/s at
    25 offered req/s.
  - Alternating HTTP 200/503: `drops`, 4 successes / 3 drops, exit 0 and JSON
    tuning hypotheses.
  - Lower duration boundary 250 ms succeeds; 249 ms, 10,001 rps, and
    concurrency 257 each reject with exit 2 and a clear error.
- Live deployment matches the candidate production output byte-for-byte:
  root HTML plus CSS, JS, hero WebP, and service worker SHA-256 hashes all
  matched `dist/site` after the exact production build.
- Live Chromium checks at desktop and 390x844 mobile: one h1, correct title,
  offline model reaches `DROPS`, no console/page errors, only same-origin
  requests, and no serious or critical axe findings. Keyboard focus on the
  range control is a visible `3px` brass outline with `4px` offset.
  `prefers-reduced-motion` reduces transition duration; the live service
  worker successfully reloads the shell offline.
- Lighthouse 12.8.2 mobile against production: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; LCP 1.4 s, CLS 0, TBT 0 ms.
  Output is 4,057-byte JS (1.80 KiB gzip), 13,576-byte CSS (3.86 KiB gzip),
  and a 102,748-byte hero WebP, within the applicable payload budgets.
- Privacy/outbound review: the site made only same-origin browser requests;
  there are no third-party runtime requests or fonts. Live responses include
  HSTS, `nosniff`, and a strict-origin referrer policy. No CSP or Permissions
  Policy header was observed; this is recorded as hardening context, not a
  release decision for this static no-input site.

## Required resolution and re-verification

Return a complete JSON and human report classified as `drops` when requests
were sent and all receive non-2xx responses; reserve exit 3 for cases where
no useful request outcome could be measured (for example, total connection or
transport failure). Add a CLI regression test for this all-503 case. Configure
the deployment to retain immutable cache headers for hashed assets. Re-run the
same clean-install, fixture, and live-header checks after a new candidate is
deployed.
