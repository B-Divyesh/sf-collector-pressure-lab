# Adversarial first-read review 1 — FAIL

Reviewed 2026-08-28 against source commit
`af12a3031cf5ffb642604fb9b200f25e864be0a8` and
<https://collector-pressure-lab.sociobot.in/>. The deployed root HTML, CSS,
and JavaScript match the local production build byte for byte.

## Verdict

**FAIL.** There are six blocking findings and additional copy and structure
findings. The CLI and browser model work, the visual identity is distinct, and
the local test suite passes. A cold visitor still cannot identify the intended
user from the first screen, cannot enter an isolated sample-data demo, cannot
verify any declared claim because `.factory/claims.json` is absent, and cannot
rely on route or 404 behavior.

## Cold first screen (before scrolling)

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900 with no saved
state. No interaction or scrolling occurred before these notes.

| Viewport | What does this do? | For whom? | What should I click first? |
| --- | --- | --- | --- |
| 390 px | It appears to model when telemetry queues, slows, or drops, but “platform edge” does not identify a Collector threshold test. | Cannot answer. The first screen says “Local collector experiment” but never says OpenTelemetry operator or self-hosting engineer. | The visual primary action is “Run the browser model,” but it does not say what result appears or that it uses sample data. |
| 1440 px | The lede suggests a telemetry burst test; the headline still describes it only through a transit metaphor. | Cannot answer. The intended operator is not named. | “Run the browser model” appears primary, while “Install the CLI” makes the actual product path ambiguous. |

### F-1-1 — BLOCKING — the first screen does not state the job and audience plainly

- Exact text: `Find the platform edge before the incident.` and `Replay a
  bounded telemetry burst. See the first queue, slowdown, or drop. Leave with a
  tuning hypothesis—not a guess.`
- Location: landing hero, both viewports. On 390 px, the three supposed facts
  begin below the fold; only the decorative diamond is visible at the bottom.
- Impact: “platform edge” is an unexplained metaphor, and no visible sentence
  names OpenTelemetry operators. A visitor cannot answer what this tests and
  for whom within one screen.
- Fix: use `Find your Collector's pressure threshold` as the h1 and `For
  OpenTelemetry operators testing when a local Collector queues, slows, or
  drops telemetry.` as the supporting sentence. Put `Try it with sample data`
  beside `Loads a safe sample and shows the result.` Add three separate facts:
  `Free to use.`, `Works offline after the first visit.`, and `Runs against
  loopback by default.`

### F-1-2 — BLOCKING — there is no one-click, isolated sample-data demo

- Exact locations: hero action `Run the browser model`; `/demo`; `/?demo=1`;
  CLI command `cplab demo`.
- Evidence: the hero action scrolls to an unrun model whose classification is
  `Not run`. It takes a second click to produce a result. `/demo` and `?demo=1`
  render the ordinary landing page. There is no `Demo — sample data, nothing is
  saved` banner, `Reset demo`, or `Start for real`. In a fresh temporary
  directory, `cplab demo` exits 2 with `unrecognized subcommand 'demo'`. There
  is no `.factory/demo.md` and no self-hosted terminal recording.
- Impact: neither the web explainer nor the CLI is tryable by the required demo
  entry point. Demo isolation and reset behavior cannot be verified.
- Fix: add a first-screen `Try it with sample data` route that opens with a
  realistic result already populated, the persistent demo banner, working
  reset/exit controls, and a separate `demo:` storage namespace. For this CLI,
  also add `cplab demo`, ship its sample, run it in a temporary directory, and
  show a recording of that real command on the landing page. Document all of
  it in `.factory/demo.md`.

### F-1-3 — BLOCKING — the required claims manifest does not exist

- Exact location: `.factory/claims.json` is absent; `rg '@claim:'` finds no
  tagged tests.
- Impact: there were no listed claim commands to run from a clean state. A
  passing general suite is not a claims audit, so every visitor-facing claim is
  untested under the required contract.
- Fix: create `.factory/claims.json`. Give every claim exactly one tagged test
  and a clean sandbox description. Make each manifest command independently
  runnable.

### F-1-4 — BLOCKING — all landing and README claims are unlisted

Every exact sentence marked `C` in the two copy-audit appendices is an unlisted
claim. With no manifest, this includes functional, privacy, compatibility,
offline, packaging, and test-coverage statements. Required test groups are:

| Required claim test | Exact claims covered by audit rows | Observable assertion |
| --- | --- | --- |
| `@claim:offline-reload` | L1–L2, R35 | Load once, go offline, reload, and run the model; confirm cached same-origin resources only. |
| `@claim:browser-no-network-or-storage` | L16–L17, L21, R36, R39 | Intercept the full model flow; assert no network request and no input in local/session/IndexedDB storage. |
| `@claim:loopback-guard` | L7, L9a, L23, L23b, R2, R22–R23, R40 | Run the shipped sample in a temp directory; reject remote endpoints unless explicitly overridden and record the warning. |
| `@claim:bounded-replay` | L4, L13, L23, R11–R16, R21 | Assert JSON/NDJSON request mapping, headers, and every documented size, request, duration, and concurrency bound. |
| `@claim:config-inspection` | L11–L12, R24–R26 | Assert every named YAML key and unknown template value against the shipped config. |
| `@claim:classification` | L5–L6, L8–L9, L14, L21, L24, L26–L28, R2, R5, R18–R19, R27–R34 | Exercise stable, backpressure, partial drops, complete drops, thresholds, hypotheses, JSON, exit behavior, and stated limits. |
| `@claim:no-config-write` | L7, L23c, L28, R3, R34 | Hash config and sample files before and after every CLI path. |
| `@claim:platform-support` | R8 | Run the packaged binary on each claimed OS in CI, or narrow the copy to tested platforms. |
| `@claim:package-and-tests` | L23a, R1, R7–R9, R37–R38 | Build/package in a clean checkout and assert the documented examples are actually executed. |
| `@claim:no-third-party-runtime` | L29, R39, R42–R43 | Intercept website requests, inspect the package, and assert the stated analytics/assets/telemetry boundary. |
| `@claim:legal-and-site-links` | R41, R44–R45 | Crawl the documented site routes and verify the repository LICENSE is MIT. |

The current general tests do provide useful evidence: the clean `npm test`
passed, and an independent live browser flow confirmed an offline reload,
`Drops` model result, empty local/session storage, no cross-origin requests,
and no page errors. Those checks are not declared one-to-one claim tests.

### F-1-5 — BLOCKING — route handling and the 404 are broken

- Exact locations: `/demo`, `/does-not-exist-review-1`, `/#lab`, and `/#cli`.
- Evidence: `/demo` returns the home document with the home title. An arbitrary
  extensionless path returns HTTP 200 and the home page. `/sitemap.xml` returns
  the provider's unrelated Azure 404 page. Fresh 390 px deep links stop with
  `#lab` 330 px below the viewport top and `#cli` 851 px below it after load.
  The active element remains `BODY`.
- Impact: a mistyped URL looks valid, the required demo URL lies about its
  state, and deep links can open without showing or announcing their target.
- Fix: add real `/demo` and styled `/404` routes, return 404 for unknown paths,
  and route after layout is stable. On each route change, focus the route h1
  and announce it. Add fresh-load and back/forward tests at 390 px and desktop.

### F-1-6 — BLOCKING — prior finding P3 remains unfixed

- Prior location: `.factory/verification-3.md` and the previous
  `.factory/handoff.md`, finding `P3`.
- Live evidence: `/`, `/privacy/`, `/terms/`, `/sw.js`, and the hashed
  JavaScript have neither `Content-Security-Policy` nor `Permissions-Policy`.
  Source `site/public/staticwebapp.config.json` also defines neither header.
- Impact: this was explicitly left open in the prior handoff. Rule 6 makes an
  unfixed prior finding blocking in this round.
- Fix: add a restrictive CSP matching the same-origin app and a minimal
  Permissions Policy, deploy, then rerun service-worker install/update and
  offline reload tests.

## Other structure findings

### F-1-7 — metadata is incomplete and the root title is not plain

- Exact location: root `<head>`.
- Evidence: title is `Collector Pressure Lab — test the pressure line`; there
  is no canonical, Open Graph metadata/image, Twitter card, or apple-touch
  icon. The SVG favicon, `lang`, theme color, description, one h1, and one main
  are present.
- Impact: “pressure line” does not state the job outside the page, and shared
  previews have no product-specific image or canonical URL.
- Fix: use `Collector Pressure Lab — test Collector backpressure`; add the
  canonical, OG/Twitter title and description, a 1200 × 630 image derived from
  the pressure-line art, and a 180 px apple-touch icon on every route.

### F-1-8 — the sitemap is missing

- Exact location: `/sitemap.xml` returns HTTP 404; `robots.txt` contains only
  `User-agent: *` and `Allow: /`.
- Impact: required routes are not enumerated for crawlers.
- Fix: publish a valid sitemap for `/`, `/demo`, `/privacy/`, `/terms/`, and
  the designed 404 policy; reference it from `robots.txt`.

### F-1-9 — header and footer are not consistent across routes

- Exact locations: home, privacy, and terms templates.
- Evidence: legal-page headers replace all navigation with `Back to lab`.
  Footer one-liners differ, legal footers omit Source, and every footer omits
  `Built by Param Factory` and a version/build id.
- Impact: navigation and provenance change depending on the page.
- Fix: share one header/footer component across every route, with wordmark,
  Demo, Privacy, Terms, the product one-liner, factory credit, and build id.

### F-1-10 — full-page navigation does not focus the new h1

- Exact location: home footer `Privacy` link and the privacy/terms routes.
- Evidence: after navigating to Privacy, `document.activeElement` is `BODY`;
  after browser Back it remains `BODY`. Back restores the previous footer
  scroll position, but the new page heading is not announced through focus.
- Impact: keyboard and screen-reader users do not receive the required route
  change cue.
- Fix: on each route load/change, focus a `tabindex="-1"` h1 and announce its
  text in the polite live region; test forward and backward navigation.

## Copy findings

The following are individual copy findings. Each row supplies the exact quote,
why it fails first read, and a concrete replacement.

| ID | Severity | Exact quote / location | Why it fails | Proposed rewrite |
| --- | --- | --- | --- | --- |
| F-1-11 | Minor | README lines 5–8: `It reads a Collector YAML file, replays ... and prints tuning hypotheses.` (34 words) | Exceeds the 22-word hard cap and stacks five behaviors. | `It reads Collector YAML and replays a bounded JSON or NDJSON sample. It increases request rates, reads optional metrics, and reports the first pressure threshold.` |
| F-1-12 | Minor | README lines 63–65: `A completed run exits 0 ... policy decisions.` (27 words) | Exceeds the cap and mixes exit behavior with JSON guidance. | `A completed run exits 0, even when every HTTP response is non-2xx. Use the JSON classification field for policy decisions.` |
| F-1-13 | Minor | README lines 73–75: `` `--allow-remote` exists ... chosen endpoint. `` (26 words) | Exceeds the cap and hides the data boundary in a long clause. | ``Use `--allow-remote` only on a controlled lab network. The CLI warns you and sends samples only to the endpoint you choose.`` |
| F-1-14 | Minor | README lines 91–93: `At each offered rate, the lab records ... when metrics are exposed.` (31 words) | Exceeds the cap and presents an undifferentiated metric list. | `At each rate, the CLI records attempts, responses, drops, latency, and throughput. When available, it also reads Collector queue, refusal, and failure counters.` |
| F-1-15 | Minor | Landing/README: `browser model`, `deterministic queue model`, `Local model`, `offline queue model`, `offline model` | Five terms name the same feature. | Use `browser model` everywhere; describe offline behavior in a separate sentence. |
| F-1-16 | Minor | Hero: `Leave with a tuning hypothesis—not a guess.` | “Tuning hypothesis” is jargon and contrasts two abstractions. | `Get the next setting to test.` |
| F-1-17 | Minor | Figure: `Capacity becomes visible when the platform starts to fill.` | Transit metaphor hides the queue/capacity relationship. | `See when incoming telemetry exceeds export capacity.` |
| F-1-18 | Minor | Method body: `Extract queue consumers...`, `Send your JSON bodies...`, `Combine response latency...` | Dense noun lists make the three-step explanation read like implementation notes. | `Read queue size, consumer count, and batch settings.` / `Replay JSON requests at increasing rates within fixed safety limits.` / `Classify each run as stable, backpressure, or drops.` |
| F-1-19 | Minor | Result summary: `clears the platform ... crosses the drop gate` | The model result returns to unexplained transit metaphors. | `Run the model to see whether the queue drains, backs up, or drops items.` |
| F-1-20 | Minor | README: `local-first`, `directional`, `pressure-relevant`, `HTTP boundary experiment` | These terms require interpretation even for a technical reader. | `Runs locally`; `does not predict production capacity`; `Collector queue and batch settings`; `test at the Collector's OTLP/HTTP input`. |
| F-1-21 | Minor | Header action: `Open lab` | The button does not name a result or distinguish web model from CLI. | `Try sample pressure test` |
| F-1-22 | Minor | Hero action: `Run the browser model` | It names a mechanism, not the result, and opens an empty state. | `Try it with sample data` |
| F-1-23 | Minor | Form action: `Run the model` | It does not name the result. | `Show pressure result` |
| F-1-24 | Minor | Eyebrow: `The route` | The heading is meaningless out of context. | `How the pressure test works` |
| F-1-25 | Minor | Heading: `One sample. Stepped arrivals. An explainable verdict.` | “Stepped arrivals” and “verdict” are jargon outside the section. | `Test one sample at increasing rates` |
| F-1-26 | Minor | Heading: `Read the controls` | The step actually reads Collector configuration, not controls. | `Read Collector settings` |
| F-1-27 | Minor | Heading: `Mark the pressure line` | The transit metaphor does not name the classification task. | `Classify the first failure` |
| F-1-28 | Minor | Eyebrow: `Offline explainer` | It does not identify the browser model. | `Browser queue model` |
| F-1-29 | Minor | Eyebrow: `The real experiment` | “Real” makes the browser feature sound fake and does not name the CLI. | `Collector CLI` |
| F-1-30 | Minor | Heading: `Bring the pressure line to your terminal.` | The metaphor hides the terminal job. | `Test your local Collector from the terminal` |
| F-1-31 | Minor | Eyebrow: `Know the boundary` | It does not identify which boundary. | `What the CLI can and cannot measure` |
| F-1-32 | Minor | Heading: `Small on purpose.` | It does not make sense in a headings list. | `Know what the result means` |
| F-1-33 | Minor | Heading: `It measures` | “It” has no referent out of context. | `Measurements` |
| F-1-34 | Minor | Heading: `It suggests` | “It” has no referent out of context. | `Suggested next tests` |
| F-1-35 | Minor | Heading: `It does not` | “It” has no referent out of context. | `Limits` |

No banned marketing adjective from the supplied list appears in the audited
copy. `Install the CLI` and `Copy command` name their outcomes and pass.

## Demo and sandbox evidence

- Web primary click: URL becomes `/#lab`; result remains `Not run`; demo banner,
  Reset, and Start-for-real counts are all zero.
- Direct entries: `/demo` and `/?demo=1` show the ordinary landing page.
- CLI: `cplab demo` in a fresh `mktemp -d` directory exits 2; it creates no
  product output.
- Storage/network check of the existing browser model: before and after an
  offline run, local and session storage remained empty. The service worker
  controlled the page, the model returned `Drops`, and all requests were
  same-origin. This confirms the ordinary model's narrow privacy behavior; it
  does not establish a separate demo namespace because no demo exists.

## Claims and quality-gate execution

There were no claim entries to execute. The required file itself is missing.
From the clean worktree, the general gate was run exactly as documented:

```text
npm test
  Rust unit tests:       4 passed
  CLI contract tests:    4 passed
  pressure fixtures:     3 passed
  doctest:               1 passed
  Vitest:                4 passed
  Playwright:           10 passed
  Vite production build: passed; dist/site produced
```

The live page had no console/page errors. Axe found zero serious or critical
violations at 390 px. It has one h1, one main, `lang="en"`, visible keyboard
focus, reduced-motion handling, and a 4,057-byte JavaScript bundle. These
passes do not cancel the findings above.

## History verification

No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists. All earlier
verification reports and the handoff were read.

| Earlier finding | Live and source recheck | Result |
| --- | --- | --- |
| Verification P1: all-503 responses lost the drop report | `npm test` ran `all_503_responses_exit_zero_with_a_complete_json_drop_report`; it passed. | Fixed |
| Verification P2: immutable asset caching absent live | Hashed CSS/JS return `public, max-age=31536000, immutable`. | Fixed |
| Verification 2 P1: service worker precached a non-public file | Fresh live worker controlled the page and reloaded offline; model returned `Drops`. | Fixed |
| Verification 3 / prior handoff P3: CSP and Permissions Policy absent | Both headers remain absent in source and production. | **Unfixed; repeated as F-1-6 BLOCKING** |

## Link, route, and visual checklist

- All ten landing anchors were crawled. `/`, Privacy, Terms, favicon, and the
  GitHub source resolve successfully; all three in-page target ids exist.
- Privacy and Terms have route-specific titles, one h1, one main, a header, and
  a footer. Their metadata and shared-navigation defects remain as reported.
- The pressure-line art-deco transit-poster identity is specific to this
  product and does not resemble a generic centered SaaS hero or three-card
  template. The generated asset provenance is recorded in `.factory/design.md`.
- The unknown-route fallback and fresh deep-link positioning fail despite the
  individual links resolving; see F-1-5.

## Appendix A — landing-page copy audit

Counting method: visible/conditionally displayed prose was split into
sentences with English sentence boundaries. Words are whitespace-delimited;
an em dash or middle dot separates words. Interface labels are listed
separately because headings and actions are not always sentences. `C` means an
unlisted claim; `J`, jargon/metaphor; `T`, inconsistent terminology; `H`, weak
heading; `B`, action does not name a useful result.

| # | Words | Exact sentence | Flags |
| --- | ---: | --- | --- |
| L1 | 7 | Offline mode: the browser model still works. | C |
| L2 | 6 | CLI install links need a connection. | C |
| L3 | 5 | Route 01 Local collector experiment | — |
| L4 | 5 | Replay a bounded telemetry burst. | C, J |
| L5 | 7 | See the first queue, slowdown, or drop. | C |
| L6 | 8 | Leave with a tuning hypothesis—not a guess. | C, J, F-1-16 |
| L7 | 9 | Loopback-only by default · samples stay local · no config writes | C |
| L8 | 9 | Capacity becomes visible when the platform starts to fill. | C, J, F-1-17 |
| L9 | 6 | Lab evidence, not a capacity guarantee. | C |
| L9a | 12 | Use an isolated Collector and repeat with production-shaped samples before changing limits. | Safety instruction |
| L10 | 2 | The route | H, F-1-24 |
| L11 | 11 | Extract queue consumers, capacity, and batch settings from your Collector YAML. | C, J, F-1-18 |
| L12 | 4 | Templated values stay unknown. | C |
| L13 | 17 | Send your JSON bodies at stepped rates with hard caps on duration, requests, concurrency, and sample size. | C, J, F-1-18 |
| L14 | 16 | Combine response latency, throughput, failures, and optional Collector self-metrics into a stable, backpressure, or drops result. | C, J, F-1-18 |
| L15 | 2 | Offline explainer | H, T, F-1-28 |
| L16 | 10 | This deterministic queue model teaches the mechanics in your browser. | C, J, T |
| L17 | 9 | It sends nothing and does not benchmark your Collector. | C |
| L18 | 1 | Ready. | — |
| L19 | 8 | Adjust a lever or run the default burst. | J |
| L20 | 2 | Modeled result | — |
| L21 | 20 | Run the model to see whether this synthetic burst clears the platform, waits in queue, or crosses the drop gate. | C, J, F-1-19 |
| L22 | 3 | The real experiment | H, F-1-29 |
| L23 | 17 | The Rust binary sends your bounded sample to your local OTLP/HTTP receiver and can read Collector self-metrics. | C |
| L23a | 7 | One native binary, no runtime or account | C |
| L23b | 5 | Loopback endpoint guard by default | C |
| L23c | 5 | Never edits the Collector config | C |
| L24 | 9 | Human output explains the result; `--json` makes it scriptable. | C, J |
| L25 | 3 | Know the boundary | H, F-1-31 |
| L26 | 15 | HTTP response latency, achieved throughput, non-success responses, and available queue/failure self-metrics across your chosen steps. | C |
| L27 | 15 | Concrete next experiments around queue buffering, consumers, batches, downstream latency, and a finer threshold search. | C, J |
| L28 | 14 | Store telemetry, generate production-scale traffic, guarantee capacity, or rewrite a configuration on your behalf. | C |
| L29 | 8 | Free, local-first, and independent of the OpenTelemetry project. | C, J |

The meta description is 17 words: `Replay bounded telemetry bursts against a
local OpenTelemetry Collector and learn where it queues, slows, or drops.` It
is also an unlisted claim.

### Landing headings, labels, and actions

| Words | Exact string | Result |
| ---: | --- | --- |
| 7 | Find the platform edge before the incident. | J; F-1-1 |
| 3 | Open lab | B; F-1-21 |
| 4 | Run the browser model | B, T; F-1-22 |
| 3 | Install the CLI | Pass |
| 7 | One sample. Stepped arrivals. An explainable verdict. | H, J; F-1-25 |
| 3 | Read the controls | H; F-1-26 |
| 3 | Replay bounded bursts | J |
| 4 | Mark the pressure line | H, J; F-1-27 |
| 8 | Model a burst before you run the CLI. | Pass |
| 4 | Arrival rate 700 items/s | Pass |
| 4 | Exporter capacity 450 items/s | Pass |
| 4 | Queue capacity 1,500 items | Pass |
| 4 | Burst duration 8 sec | Pass |
| 3 | Run the model | B; F-1-23 |
| 2 | Not run | Pass |
| 1 | Offered | Pass |
| 2 | Queue peak | Pass |
| 1 | Dropped | Pass |
| 2 | Drain time | Pass |
| 7 | Bring the pressure line to your terminal. | H, J; F-1-30 |
| 2 | Copy command | Pass |
| 3 | Small on purpose. | H; F-1-32 |
| 2 | It measures | H; F-1-33 |
| 2 | It suggests | H; F-1-34 |
| 3 | It does not | H; F-1-35 |

## Appendix B — README copy audit

Code blocks are commands rather than sentences and are excluded. Headings and
exit-code list items are included after the sentence table.

| # | Words | Exact sentence | Flags |
| --- | ---: | --- | --- |
| R1 | 22 | Collector Pressure Lab is a local-first CLI for OpenTelemetry operators who want evidence before changing queue, batch, or exporter settings in production. | C, J |
| R2 | 34 | It reads a Collector YAML file, replays a bounded JSON or NDJSON sample against a loopback OTLP/HTTP endpoint at stepped rates, samples optional Collector self-metrics, classifies the first pressure threshold, and prints tuning hypotheses. | C, >22, J, F-1-11 |
| R3 | 5 | It never edits the configuration. | C |
| R4 | 6 | Documentation and the offline model: https://collector-pressure-lab.sociobot.in | T |
| R5 | 8 | Synthetic results are directional, not production capacity guarantees. | C, J |
| R6 | 12 | Run the lab against an isolated local Collector, never a production endpoint. | Safety instruction |
| R7 | 7 | Build the single binary with stable Rust: | C |
| R7a | 7 | For a release artifact without installing it: | — |
| R8 | 11 | Version 0.1.0 supports Linux, macOS, and Windows anywhere stable Rust runs. | C |
| R9 | 13 | Factory release credentials are not included; `cargo package` prepares the publishable source package. | C |
| R10 | 9 | Start an isolated Collector configured with an OTLP/HTTP receiver. | Instruction |
| R11 | 10 | Then replay an OTLP JSON payload or newline-delimited JSON bodies: | C |
| R12 | 9 | Each non-empty NDJSON line is sent as one request. | C |
| R13 | 10 | A regular JSON file is sent as one request body. | C |
| R14 | 13 | The sample is loaded once and capped at 8 MiB and 10,000 records. | C |
| R15 | 7 | Each rate step is time- and request-bounded. | C |
| R16 | 15 | By default, the CLI also tries `http://127.0.0.1:8888/metrics`; use `--metrics-endpoint off` when Collector self-metrics are unavailable. | C |
| R17 | 5 | Machine-readable output and CI mode: | J |
| R18 | 16 | `--ci` disables status animation and returns a non-zero exit code when the run cannot be performed. | C |
| R19 | 27 | A completed run exits 0 even when it discovers pressure, including when every received HTTP response is non-2xx; the JSON `classification` field is intended for policy decisions. | C, >22, F-1-12 |
| R20 | 2 | Exit codes: | — |
| R21 | 11 | Use `--header 'name:value'` for a local test receiver that requires metadata. | C |
| R22 | 4 | Remote hosts are rejected. | C |
| R23 | 26 | `--allow-remote` exists for controlled lab networks and prints an explicit warning; samples still remain on the operator's machine except for requests sent to the chosen endpoint. | C, >22, F-1-13 |
| R24 | 6 | Inspect config-derived settings without sending traffic: | C, J |
| R25 | 15 | The parser intentionally extracts only pressure-relevant Collector settings: `sending_queue.enabled`, `sending_queue.queue_size`, `sending_queue.num_consumers`, `batch.send_batch_size`, `batch.send_batch_max_size`, and `batch.timeout`. | C, J |
| R26 | 8 | Unknown or templated values are reported, not guessed. | C |
| R27 | 31 | At each offered rate, the lab records attempts, HTTP responses, successful responses, transport errors/non-2xx drops, response latency, achieved request throughput, and deltas from common `otelcol_*` queue/refusal/failure counters when metrics are exposed. | C, >22, F-1-14 |
| R28 | 8 | The first step with explicit failures/refusals is **drops**. | C |
| R29 | 15 | A step with rising latency, exporter queue growth, or materially lower achieved throughput is **backpressure**. | C |
| R30 | 4 | Otherwise it is **stable**. | C |
| R31 | 15 | The reported threshold is the lowest pressured step and is refined from observed successful throughput. | C |
| R32 | 6 | This is an HTTP boundary experiment. | J |
| R33 | 20 | It cannot see memory spikes, downstream backend throttling outside the run window, or queue state when Collector self-metrics are disabled. | C |
| R34 | 12 | Tuning output is a hypothesis to validate, not an automatic configuration change. | C, J |
| R35 | 13 | The landing page documents the CLI and includes an entirely offline queue model. | C, T |
| R36 | 11 | The model explains likely behavior but does not contact a Collector. | C |
| R37 | 12 | `npm test` runs Rust tests plus the site unit and browser tests. | C |
| R38 | 15 | The documented examples are covered by CLI integration tests, including a controlled slow receiver fixture. | C |
| R39 | 13 | There is no telemetry, analytics, account, upload, local storage, or runtime third-party request. | C |
| R40 | 16 | CLI inputs stay local unless their bounded request bodies are sent to the endpoint you provide. | C |
| R41 | 7 | See the site privacy and terms pages. | C |
| R42 | 9 | Collector Pressure Lab is independent of the OpenTelemetry project. | C |
| R43 | 15 | It reads configuration keys and public self-metric names but bundles no OpenTelemetry source or assets. | C |
| R44 | 1 | MIT. | C |
| R45 | 2 | See [LICENSE](LICENSE). | C |

README headings and list items: `Collector Pressure Lab` (3), `Install` (1),
`Usage` (1), `How classification works` (3), `Site and browser model` (4),
`Test and verify` (3), `Privacy and scope` (3), and `License` (1) are clear.
The exit-code items are `` `0`: experiment completed `` (3), `` `2`:
arguments, input, safety check, or configuration error `` (8), and `` `3`: no
HTTP response could be measured (for example, every connection or request
timed out) `` (15). None exceeds 22 words.

## Terminology table

| Concept | Terms currently used | Use consistently |
| --- | --- | --- |
| Web simulator | browser model; deterministic queue model; Local model; offline queue model; offline model | browser model |
| Overload boundary | platform edge; pressure line; first pressure threshold; lowest pressured step | pressure threshold |
| Incoming load | telemetry burst; JSON bodies; offered rate; stepped arrivals | request rate, with `telemetry sample` for the input |
| Product workflow | lab; experiment; model | CLI test for the real run; browser model for the explainer |

## What would make this perfect

Resolve every finding, then rerun this entire review from a fresh 390 px and
desktop context. Perfect means the first screen names the operator and job; a
single click opens an already-populated, resettable, isolated demo; every
claim is declared and passes its own sandbox test; unknown/deep routes behave
correctly; metadata, policies, sitemap, navigation, and focus are complete;
and both copy appendices contain no `>22`, `J`, `T`, `H`, or `B` flags.
