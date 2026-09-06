# Collector pressure review 7 — PASS

Reviewed 2026-09-06 at <https://collector-pressure-lab.sociobot.in/>.

Implementation candidate: `e1c0ac780307d61a03bf134acc09d7e69064f77b`
(`fix: close round five review findings`). Documentation/report SHA:
`9ad3f9ad24530cb140b5f0a91bedb2a5167a6d20`. The commits after the
implementation candidate change tests, evidence, and reports; they do not
change the shipped application. A fresh local production build matched the
live HTML, JavaScript, CSS, service worker, and hero asset by SHA-256.

## Verdict

**PASS.** Finding count: **0**. Untested claim count: **0**. No product code
was changed during this review.

## Job, audience, and first action

The job is to find the request rate where a local OpenTelemetry Collector
queues, slows, or drops telemetry before a production change. It is for
OpenTelemetry operators. The first action is **Try it with sample data**;
the adjacent text says it loads the bundled sample and shows the result.

Fresh, empty-storage Chromium contexts opened the live root before scrolling:

| Viewport | Evidence before scrolling |
| --- | --- |
| 390 × 844 phone | `Find your Collector's pressure threshold`; named OpenTelemetry audience; sample action; all three facts visible; no horizontal overflow or console/page error. |
| 1440 × 900 desktop | The same job, audience, action, outcome, and facts; CLI installation is visibly secondary. |

## Live product check

- One click entered `/demo` with the realistic bundled result already
  populated: **Drops**, 900 incoming items/s, 400 exported items/s, 1,200
  queue items, 10-second burst, 9,000 offered, and 3,800 dropped.
- The persistent banner says `Demo — sample data, nothing is saved` and has
  **Reset demo** and **Start for real**. Reset restored the same complete
  result. The only demo key was `demo:cplab:pressure-input`; it was removed on
  exit. The observed browser requests were same-origin only.
- After initial online load, the deployed service worker controlled `/demo`.
  A fresh 390 px context went offline, reloaded, retained **Drops**, showed
  the offline notice, and produced no console/page errors.
- `/`, `/demo`, `/?demo=1`, `/privacy/`, and `/terms/` returned 200 with
  route-specific titles, one `h1`, one `main`, and `lang="en"`. `/404` is the
  designed public not-found page; an unknown URL returned that page with the
  deliberate HTTP 404 status. This is expected, not a defect.
- Live headers include the restrictive CSP and Permissions Policy. `robots.txt`
  points to a sitemap listing all public routes. Hashed assets are immutable;
  the service worker is `no-cache`.
- Axe Playwright scans found zero violations on phone-size `/`, `/demo`,
  `/privacy/`, `/terms/`, and `/404`. Keyboard, focus, mobile layout,
  reduced-motion, route title, privacy/legal, 404, and ordinary error/recovery
  coverage also passed in the full Playwright suite.

## Claim commands and clean artifact

After `npm ci`, `npm test` passed: 4 Rust unit tests, 4 CLI contract tests, 3
pressure-fixture tests, 1 doctest, 6 Vitest tests, and 52 Playwright tests.
`npm run build:site` produced `dist/site`; browser JavaScript is 6.64 kB raw
(2.72 kB gzip).

Each command declared in `.factory/claims.json` was then run independently
from the clean setup and exited successfully:

`demo-isolation`, `free-to-use`, `offline-reload`,
`browser-no-network-or-storage`, `loopback-guard`, `bounded-replay`,
`config-inspection`, `classification`, `collector-metrics`,
`cli-data-boundary`, `no-config-write`, `package-and-tests`,
`no-third-party-runtime`, `no-request-identifiers`,
`legal-and-site-links`, and `threshold-accuracy`.

There is exactly one matching `@claim:<id>` test tag for each of the 16
manifest IDs. No live landing-page or README claim lacked a listed test.

`cargo package --allow-dirty` verified the source package. I installed that
package into a fresh temporary consumer root and exercised its installed
single `cplab` binary. `cplab --help`, JSON inspection, and `cplab demo`
worked. The demo used a separate temporary directory, left its empty current
directory unchanged, and found backpressure at about 49.5 successful
requests/s. A normal invalid endpoint returned documented exit 2 with the
loopback recovery message. This product has no backend service, tenant state,
health endpoint, or rate-limited public API, so backend-only checks do not
apply.

## Earlier findings

Every prior review, verification report, polish report, and handoff was read.
Current live and clean-artifact evidence gives the following disposition.

| Earlier finding(s) | Current disposition and evidence |
| --- | --- |
| F-1-1 | Fixed. The cold phone and desktop screens name the Collector job, OpenTelemetry audience, sample action, result, and three facts. |
| F-1-2, F-5-1, F-5-2 | Fixed. The web and CLI demos are populated; reset restores 900/400/1200/10 and Drops; demo storage is isolated and cleared on exit. |
| F-1-3, F-1-4, F-4-1, F-5-4, F-5-5 | Fixed. The 16-entry manifest, unique tags, independent command runs, free claim, privacy/network tests, and identifier test all pass. |
| F-1-5 | Fixed. Demo/query routes, legal routes, focus behavior, and a deliberate unknown-route HTTP 404 work. |
| F-1-6 and Verification 3 P3 | Fixed. CSP and Permissions Policy are present in both live response headers and static configuration. |
| F-1-7, F-5-3 | Fixed. Route titles, canonical/social metadata, icons, and the 404 `og:url` are present. |
| F-1-8 | Fixed. Live robots and sitemap are published and linked. |
| F-1-9, F-1-10 | Fixed. Shared navigation/footer, route focus, Back, and announced headings are covered by the current suite. |
| F-1-11 through F-1-14 | Fixed. README operational sentences remain split below the 22-word limit. |
| F-1-15 through F-1-20 | Fixed. Current visitor copy consistently says browser model and uses direct Collector/queue language; the prior jargon and metaphors are absent. |
| F-1-21 through F-1-35 | Fixed. Current buttons and headings name their action or section plainly, including sample test, result, config values, classification, CLI, measurements, next tests, and limits. |
| F-2-1, F-2-2 | Fixed. Current controls meet the tested target size and the GitHub link says it opens an external site. |
| F-3-1 | Fixed. `threshold-accuracy` passed independently and inside the complete suite. |
| F-3-2, F-3-3, F-3-4 | Fixed. Copy says bundled sample, contains no unsupported credential wording, and distinguishes Collector config from config values. |
| Verification P1 | Fixed. The all-503 regression remains in the passing CLI contract suite and retains the complete Drops report. |
| Verification P2 | Fixed. Live hashed JavaScript and CSS have immutable cache headers. |
| Verification 2 P1 | Fixed. Live service-worker control and offline demo reload passed without a deployment-control request. |

## Scope and evidence limits

The CLI deliberately runs bounded HTTP JSON/NDJSON traffic against a Collector
the operator controls. It does not provision Collectors, replay production
traffic, or promise production capacity. The static site has no accounts,
payments, analytics, remote fonts, or third-party runtime. No missing useful
AI feature was found: deterministic local measurements are the intended job,
and an optional model call would add network, cost, and non-determinism without
improving that experiment.
