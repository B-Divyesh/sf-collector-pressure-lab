# Adversarial first-read review 2 — FAIL

Reviewed 2026-08-28 against source commit
`868ec12fd77d671ecb844cbca21cbd882ef5c251` and
<https://collector-pressure-lab.sociobot.in/>. The live root HTML, service
worker, JavaScript, CSS, and hero image match the local production build by
SHA-256. No product source changed after review 1.

## Verdict

**FAIL.** There are 35 reopened blocking findings, two new minor findings, and
no declared claim test to run. The product is not clear enough on first read,
has no one-click isolated demo, has no claims manifest, and still presents the
home page as a successful response for demo and unknown routes. A passing
general test suite does not meet those missing product contracts.

New round-2 findings use `F-2-k`. Reopened findings retain their original
`F-1-k` ids because the history requirement explicitly requires the same id.

## Cold first screen, before scrolling

Fresh Chromium contexts used 390 × 844 and 1440 × 900 viewports, blocked
service workers, no prior storage, no interaction, and `scrollY = 0`.

| Viewport | What does this do? | For whom? | What should I click first? |
| --- | --- | --- | --- |
| 390 px | It appears to model when telemetry queues, slows, or drops. “Platform edge” does not identify a Collector pressure test. | Cannot answer. Neither OpenTelemetry operators nor self-hosting engineers appear in the first screen. | `Run the browser model` looks primary, but it does not name a result or say that sample data will load. |
| 1440 px | The lede implies a bounded telemetry burst test, but the headline still uses a transit metaphor. | Cannot answer. `Local collector experiment` names a context, not the intended person. | `Run the browser model` and `Install the CLI` compete, and neither says what the first click will show. |

The exact failing text is `Find the platform edge before the incident.` and
`Replay a bounded telemetry burst. See the first queue, slowdown, or drop.
Leave with a tuning hypothesis—not a guess.` On mobile, the three short facts
are below the fold; only their decorative diamond begins at 813 px.

## Reopened blocking findings

The history rule requires every unresolved review-1 finding to return with the
same id as blocking. Product source is unchanged, the live build matches it,
and each live/code check below confirms that these are not merely stale notes.

### F-1-1 — BLOCKING — the first screen does not state the job and audience plainly

- Quote/location: hero text quoted above, at both tested viewports.
- Why this fails: a visitor cannot name the user or distinguish a Collector
  pressure threshold from a generic telemetry simulator.
- Fix: use `Find your Collector's pressure threshold` and `For OpenTelemetry
  operators testing when a local Collector queues, slows, or drops telemetry.`
  Put `Try it with sample data` beside `Loads a safe sample and shows the
  result.` Show `Free to use.`, `Works offline after the first visit.`, and
  `Runs against loopback by default.` on the first mobile screen.

### F-1-2 — BLOCKING — there is no one-click isolated sample-data demo

- Quote/location: hero action `Run the browser model`; `/demo`; `/?demo=1`;
  attempted command `cplab demo`.
- Evidence: the hero click only scrolls to `Not run`. `/demo` and `?demo=1`
  show the unrun home page. Banner, `Reset demo`, and `Start for real` counts
  are zero. `cplab demo` from a new temporary directory exits 2 with
  `unrecognized subcommand 'demo'`. `.factory/demo.md` and a terminal recording
  are absent.
- Why this fails: the first click does not show the product working, and demo
  isolation, reset, real-data separation, and CLI output cannot be verified.
- Fix: add `/demo` with a populated realistic result, persistent demo banner,
  working reset/exit controls, and a separate `demo:` namespace. Add a bundled
  `cplab demo` sample that writes only to a reported temporary path, record that
  real command on the landing page, and document it in `.factory/demo.md`.

### F-1-3 — BLOCKING — the required claims manifest does not exist

- Location: `.factory/claims.json` is absent and `rg '@claim:'` returns no
  tagged tests.
- Why this fails: there are no listed commands to execute from a clean clone,
  so no visitor-facing claim meets the one-claim/one-test contract.
- Fix: add the manifest and exactly one independently runnable tagged test for
  every claim, including a clean sandbox description.

### F-1-4 — BLOCKING — every landing and README claim is unlisted

- Location: every row marked `C` in Appendices A and B, plus the meta
  description. There is no manifest entry for any of them.
- Why this fails: visitors are asked to rely on functional, privacy, offline,
  packaging, compatibility, and safety statements with no declared proof.
- Fix: remove unsupported claims or declare and test them. At minimum, add
  independent tests for offline reload; browser network/storage boundaries;
  loopback guarding; bounded JSON/NDJSON replay; config inspection;
  stable/backpressure/drop classification; no config writes; supported
  platforms; packaging; third-party runtime boundaries; and legal/site links.
  Quantitative limits and threshold accuracy must be asserted numerically.

### F-1-5 — BLOCKING — demo, unknown-route, deep-link, and 404 routing are broken

- Locations/evidence: `/demo`, `/404`, and `/does-not-exist-review-2` all
  return HTTP 200 with the home title and h1. `/sitemap.xml` returns 404. At
  390 px, a fresh `#cli` load leaves the target 1,998 px below the viewport;
  active focus is `BODY`. `#lab` lands 208 px below the top and also leaves
  focus on `BODY`.
- Why this fails: invalid and demo URLs lie about their state, while deep links
  can open without showing or announcing their target.
- Fix: add real `/demo` and designed `/404` routes, serve unknown routes as
  404, and restore scroll/focus after layout settles. Test fresh loads and
  back/forward at both viewports.

### F-1-6 — BLOCKING — CSP and Permissions-Policy remain absent

- Location: live `/`, `/privacy/`, `/terms/`, `/sw.js`, and hashed assets;
  `site/public/staticwebapp.config.json`.
- Evidence: the responses and source global headers contain neither policy.
- Why this fails: earlier verification finding P3 remains open, so the history
  rule makes it blocking here.
- Fix: add a restrictive same-origin CSP and minimal Permissions Policy, then
  retest service-worker installation, update, and offline reload.

### F-1-7 — BLOCKING — metadata is incomplete and the root title is not plain

- Quote/location: root title `Collector Pressure Lab — test the pressure line`;
  all root and legal `<head>` elements.
- Evidence: there is no canonical, OG metadata/image, Twitter card, or
  apple-touch icon. `/demo` reuses the home title. The favicon, description,
  theme color, `lang`, h1, and main are present.
- Why this fails: “pressure line” does not name the job outside the page, and
  shares/deep routes have no reliable identity.
- Fix: use `Collector Pressure Lab — test Collector backpressure`; add
  route-specific canonical/OG/Twitter metadata, a 1200 × 630 product image,
  and a 180 px apple-touch icon.

### F-1-8 — BLOCKING — the sitemap is missing

- Location: `/sitemap.xml` returns 404; `robots.txt` only says `Allow: /`.
- Why this fails: the required routes are not listed for crawlers.
- Fix: publish and reference a sitemap for `/`, `/demo`, `/privacy/`, and
  `/terms/`.

### F-1-9 — BLOCKING — route headers and footers are inconsistent

- Location: home, privacy, and terms.
- Evidence: legal headers replace navigation with `Back to lab`; legal
  footers omit Source; one-liners differ; every footer omits `Built by Param
  Factory` and the version/build id. No header exposes Demo, Privacy, and Terms
  consistently.
- Why this fails: navigation and provenance change by route.
- Fix: share one header/footer skeleton with wordmark, Demo, Privacy, Terms,
  one product sentence, factory credit, and build id.

### F-1-10 — BLOCKING — navigation does not focus or announce the new h1

- Location: home → Privacy and browser Back.
- Evidence: `document.activeElement` is `BODY` after both transitions. Back
  restores the footer scroll position but not a route-heading announcement.
- Why this fails: keyboard and screen-reader users receive no route-change cue.
- Fix: focus a `tabindex="-1"` h1 and announce it through a polite live region
  on route load, forward, and back.

### F-1-11 through F-1-35 — BLOCKING — prior copy findings remain unchanged

All were minor in review 1. They become blocking in this round because they
were not fixed. The exact copy, reason, and concrete rewrite are below.

| ID | Exact quote/location | Why it fails | Concrete fix |
| --- | --- | --- | --- |
| F-1-11 | README: `It reads a Collector YAML file... and prints tuning hypotheses.` (34 words) | Exceeds 22 words and stacks five jobs. | `It reads Collector YAML and replays a bounded JSON or NDJSON sample. It increases rates, reads optional metrics, and reports the first pressure threshold.` |
| F-1-12 | README: `A completed run exits 0... policy decisions.` (27 words) | Exceeds 22 words and mixes exit behavior with JSON guidance. | `A completed run exits 0, even when every HTTP response is non-2xx. Use the JSON classification field for policy decisions.` |
| F-1-13 | README: `` `--allow-remote` exists... chosen endpoint. `` (26 words) | Exceeds 22 words and hides the data boundary. | ``Use `--allow-remote` only on a controlled lab network. The CLI warns you and sends samples only to the endpoint you choose.`` |
| F-1-14 | README: `At each offered rate, the lab records... when metrics are exposed.` (31 words) | Exceeds 22 words and is an undifferentiated metric list. | `At each rate, the CLI records attempts, responses, drops, latency, and throughput. When available, it reads Collector queue, refusal, and failure counters.` |
| F-1-15 | Landing/README: `browser model`, `deterministic queue model`, `Local model`, `offline queue model`, `offline model` | Five terms name one feature. | Use `browser model` everywhere and state offline behavior separately. |
| F-1-16 | Hero: `Leave with a tuning hypothesis—not a guess.` | “Tuning hypothesis” is jargon. | `Get the next setting to test.` |
| F-1-17 | Figure: `Capacity becomes visible when the platform starts to fill.` | The transit metaphor hides the queue relationship. | `See when incoming telemetry exceeds export capacity.` |
| F-1-18 | Method: `Extract queue consumers...`; `Send your JSON bodies...`; `Combine response latency...` | Dense noun lists read like implementation notes. | `Read queue size, consumer count, and batch settings.` / `Replay JSON requests at increasing rates within fixed safety limits.` / `Classify each run as stable, backpressure, or drops.` |
| F-1-19 | Result: `clears the platform... crosses the drop gate` | Transit metaphors obscure the result. | `Run the model to see whether the queue drains, backs up, or drops items.` |
| F-1-20 | README: `local-first`, `directional`, `pressure-relevant`, `HTTP boundary experiment` | These require interpretation. | `Runs locally`; `does not predict production capacity`; `Collector queue and batch settings`; `test at the Collector's OTLP/HTTP input`. |
| F-1-21 | Header action: `Open lab` | It does not name a result. | `Try sample pressure test` |
| F-1-22 | Hero action: `Run the browser model` | It names a mechanism and opens an empty state. | `Try it with sample data` |
| F-1-23 | Form action: `Run the model` | It does not name the result. | `Show pressure result` |
| F-1-24 | Eyebrow: `The route` | Meaningless out of context. | `How the pressure test works` |
| F-1-25 | Heading: `One sample. Stepped arrivals. An explainable verdict.` | “Stepped arrivals” and “verdict” are jargon. | `Test one sample at increasing rates` |
| F-1-26 | Heading: `Read the controls` | The step reads configuration, not controls. | `Read Collector settings` |
| F-1-27 | Heading: `Mark the pressure line` | The metaphor hides classification. | `Classify the first failure` |
| F-1-28 | Eyebrow: `Offline explainer` | It does not identify the browser model. | `Browser queue model` |
| F-1-29 | Eyebrow: `The real experiment` | It makes the browser feature sound fake and does not name the CLI. | `Collector CLI` |
| F-1-30 | Heading: `Bring the pressure line to your terminal.` | The metaphor hides the terminal job. | `Test your local Collector from the terminal` |
| F-1-31 | Eyebrow: `Know the boundary` | It does not identify the boundary. | `What the CLI can and cannot measure` |
| F-1-32 | Heading: `Small on purpose.` | It fails in a headings list. | `Know what the result means` |
| F-1-33 | Heading: `It measures` | “It” has no referent out of context. | `Measurements` |
| F-1-34 | Heading: `It suggests` | “It” has no referent out of context. | `Suggested next tests` |
| F-1-35 | Heading: `It does not` | “It” has no referent out of context. | `Limits` |

## New findings

### F-2-1 — Minor — visible controls miss the 44 × 44 px target minimum

- Location/evidence: the home wordmark is 186 × 34 px on mobile and 317 × 34
  px on desktop. The desktop `CLI` link is 25 × 44 px; the footer `Terms` link
  is 42 × 44 px.
- Why this fails: a phone visitor can miss narrow or short tap targets.
- Fix: give every interactive element a minimum 44 × 44 px hit area without
  changing the visible label size.

### F-2-2 — Minor — the external Source link is not identified as external

- Quote/location: footer link `Source` → GitHub.
- Why this fails: the site-structure contract requires external links to say
  so, and a first-time visitor is not warned that navigation leaves the site.
- Fix: label it `Source on GitHub (opens external site)` or add equivalent
  visible and accessible text.

## Demo and sandbox evidence

- Web first click: URL becomes `/#lab`, focus stays on `BODY`, and the result
  remains `Not run`.
- Direct `/demo` and `?demo=1`: ordinary home page; no banner, populated
  result, reset, exit, or demo namespace.
- CLI: `cplab demo` in a fresh `mktemp -d` directory exits 2 before producing
  output.
- Ordinary browser model only: a fresh service worker controlled the page;
  after offline reload it returned `Drops`. All requested URLs were
  same-origin. `localStorage`, `sessionStorage`, and IndexedDB stayed empty;
  the service-worker cache was `cplab-f592803ec64d`. This verifies the narrow
  ordinary-model behavior, not demo isolation, because no demo exists.

## Claims and clean-clone execution

`.factory/claims.json` is missing, so there were zero listed claim commands to
run. That is a blocking absence, not a vacuous pass. A clean clone at the
reviewed SHA was still tested with the documented general gate:

```text
npm ci                         passed; 0 audit vulnerabilities
npm test
  Rust unit tests              4 passed
  CLI contract tests           4 passed
  pressure fixture tests       3 passed
  doctest                      1 passed
  Vitest                       4 passed
  Playwright                  10 passed
  Vite production build        passed; dist/site produced
```

No claim test failed because no claim test exists. Every `C` row below is
therefore an untested, unlisted claim.

## Structure, links, accessibility, and identity

- All discovered landing/privacy/terms links returned 200, and all hash target
  ids exist. There are no dead links in the current crawl.
- Root, Privacy, and Terms each have `lang="en"`, one h1, one main, and
  route-appropriate legal titles. Root title, demo title, metadata, sitemap,
  404, navigation consistency, and route focus still fail as reported.
- Fresh live axe scans at both viewports returned zero violations. First Tab
  focuses `Skip to main content` with a 3 px brass outline and 4 px offset.
  There were no console or page errors. The new target-size finding is based on
  rendered bounding boxes, which axe did not flag.
- The production JavaScript is 4,057 bytes and 1,804 bytes gzip. Reduced-motion
  handling exists in source and the clean browser suite passes.
- The art-deco transit-poster palette, rails, ticket labels, and original hero
  art are distinct and match `.factory/design.md`; this is not a generic SaaS
  template. Asset provenance is documented.

## History verification

Review 1 and the prior handoff were read in full. There are no polish reports.
The live/local asset hashes match, and the only commit after product source was
review 1 documentation. The table records a separate live-and-code check for
every earlier finding.

| Earlier id | Live and code verification | Result |
| --- | --- | --- |
| F-1-1 | Same hero h1/lede in live DOM and `site/index.html`; mobile facts remain below fold. | Unfixed; reopened blocking |
| F-1-2 | Same empty anchor flow; no demo route/UI/docs/CLI subcommand in live or source. | Unfixed; reopened blocking |
| F-1-3 | Manifest absent; source has no `@claim:` tag. | Unfixed; reopened blocking |
| F-1-4 | Same landing/README claims; manifest still absent. | Unfixed; reopened blocking |
| F-1-5 | Unknown/demo paths still rewrite to home; source fallback unchanged; deep-link focus is `BODY`. | Unfixed; reopened blocking |
| F-1-6 | Live headers and source config still omit both policies. | Unfixed; reopened blocking |
| F-1-7 | Live/source heads still lack canonical/social/apple metadata and retain the metaphorical root title. | Unfixed; reopened blocking |
| F-1-8 | Live sitemap is 404; no sitemap source file. | Unfixed; reopened blocking |
| F-1-9 | Live/source legal templates still use different header/footer content. | Unfixed; reopened blocking |
| F-1-10 | Live forward/back focus remains `BODY`; no route-focus code exists. | Unfixed; reopened blocking |
| F-1-11 | Same 34-word README sentence. | Unfixed; reopened blocking |
| F-1-12 | Same 27-word README sentence. | Unfixed; reopened blocking |
| F-1-13 | Same 26-word README sentence. | Unfixed; reopened blocking |
| F-1-14 | Same 31-word README sentence. | Unfixed; reopened blocking |
| F-1-15 | All five browser-model terms remain in live/source/README. | Unfixed; reopened blocking |
| F-1-16 | Same hero jargon in live/source. | Unfixed; reopened blocking |
| F-1-17 | Same figure metaphor in live/source. | Unfixed; reopened blocking |
| F-1-18 | Same three dense method sentences in live/source. | Unfixed; reopened blocking |
| F-1-19 | Same platform/drop-gate result text in live/source. | Unfixed; reopened blocking |
| F-1-20 | Same four README jargon terms. | Unfixed; reopened blocking |
| F-1-21 | Same `Open lab` header action. | Unfixed; reopened blocking |
| F-1-22 | Same `Run the browser model` empty-state action. | Unfixed; reopened blocking |
| F-1-23 | Same `Run the model` form action. | Unfixed; reopened blocking |
| F-1-24 | Same `The route` eyebrow. | Unfixed; reopened blocking |
| F-1-25 | Same `One sample... verdict` heading. | Unfixed; reopened blocking |
| F-1-26 | Same `Read the controls` heading. | Unfixed; reopened blocking |
| F-1-27 | Same `Mark the pressure line` heading. | Unfixed; reopened blocking |
| F-1-28 | Same `Offline explainer` eyebrow. | Unfixed; reopened blocking |
| F-1-29 | Same `The real experiment` eyebrow. | Unfixed; reopened blocking |
| F-1-30 | Same terminal pressure-line heading. | Unfixed; reopened blocking |
| F-1-31 | Same `Know the boundary` eyebrow. | Unfixed; reopened blocking |
| F-1-32 | Same `Small on purpose.` heading. | Unfixed; reopened blocking |
| F-1-33 | Same `It measures` heading. | Unfixed; reopened blocking |
| F-1-34 | Same `It suggests` heading. | Unfixed; reopened blocking |
| F-1-35 | Same `It does not` heading. | Unfixed; reopened blocking |

Earlier verification defects remain correctly repaired: the all-503 fixture
returns a complete drop report, immutable hashed-asset caching is live, and a
fresh service worker installs and reloads offline.

## Missed leverage

No AI step is expected for a deterministic load experiment, and adding one
would be decorative. The brief's natural import/export needs are already the
CLI's YAML plus JSON/NDJSON inputs and human/JSON outputs. The obvious missing
try-out path is the bundled CLI/web sample demo already covered by F-1-2; no
additional sync or AI finding is justified.

## Appendix A — landing-page copy audit

Counting method: visible, conditionally displayed, and runtime prose is split
at English sentence boundaries. Whitespace, an em dash, or a middle dot marks
a word boundary; hyphenated terms count as one word. Headings, controls, and actions follow separately.
`C` means unlisted claim; `J`, jargon/metaphor; `T`, inconsistent term; `H`,
weak out-of-context heading; `B`, action does not name a useful result. No
banned marketing adjective from the supplied list appears.

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
| L10 | 12 | Use an isolated Collector and repeat with production-shaped samples before changing limits. | Safety instruction |
| L11 | 2 | The route | H, F-1-24 |
| L12 | 11 | Extract queue consumers, capacity, and batch settings from your Collector YAML. | C, J, F-1-18 |
| L13 | 4 | Templated values stay unknown. | C |
| L14 | 17 | Send your JSON bodies at stepped rates with hard caps on duration, requests, concurrency, and sample size. | C, J, F-1-18 |
| L15 | 16 | Combine response latency, throughput, failures, and optional Collector self-metrics into a stable, backpressure, or drops result. | C, J, F-1-18 |
| L16 | 2 | Offline explainer | H, T, F-1-28 |
| L17 | 10 | This deterministic queue model teaches the mechanics in your browser. | C, J, T |
| L18 | 9 | It sends nothing and does not benchmark your Collector. | C |
| L19 | 1 | Ready. | — |
| L20 | 8 | Adjust a lever or run the default burst. | J |
| L21 | 2 | Modeled result | — |
| L22 | 20 | Run the model to see whether this synthetic burst clears the platform, waits in queue, or crosses the drop gate. | C, J, F-1-19 |
| L23 | 3 | The real experiment | H, F-1-29 |
| L24 | 17 | The Rust binary sends your bounded sample to your local OTLP/HTTP receiver and can read Collector self-metrics. | C |
| L25 | 9 | Human output explains the result; `--json` makes it scriptable. | C, J |
| L26 | 7 | One native binary, no runtime or account | C |
| L27 | 5 | Loopback endpoint guard by default | C |
| L28 | 5 | Never edits the Collector config | C |
| L29 | 3 | Know the boundary | H, F-1-31 |
| L30 | 15 | HTTP response latency, achieved throughput, non-success responses, and available queue/failure self-metrics across your chosen steps. | C |
| L31 | 15 | Concrete next experiments around queue buffering, consumers, batches, downstream latency, and a finer threshold search. | C, J |
| L32 | 14 | Store telemetry, generate production-scale traffic, guarantee capacity, or rewrite a configuration on your behalf. | C |
| L33 | 8 | Free, local-first, and independent of the OpenTelemetry project. | C, J |
| L33a | 5 | First pressure threshold: ~81.4 req/s | C, quantitative sample output |
| L34 | 5 | Install command copied to clipboard. | C |
| L35 | 4 | Clipboard access was blocked. | Runtime error |
| L36 | 6 | Select and copy the command manually. | Recovery instruction |
| L37 | 2 | Model running… | Status |
| L38 | 3 | Model complete: [classification]. | C |
| L39 | 5 | Could not run model: [error]. | Runtime error |
| L40 | 4 | Could not run model. | Runtime error |
| L41 | 3 | Check the inputs. | Recovery instruction |
| L42 | 7 | Modeled queue peak: [peak] of [capacity] items. | C |
| L43 | 9 | Arrival stays below modeled export capacity at [percent] utilization. | C |
| L44 | 15 | The queue absorbs the burst and needs about [seconds] seconds to drain after arrivals fall. | C |
| L45 | 5 | [Count] items exceed the queue. | C |
| L46 | 10 | Reduce arrival pressure or fix exporter capacity before raising limits. | Recommendation |

The 17-word meta description is also an unlisted claim: `Replay bounded
telemetry bursts against a local OpenTelemetry Collector and learn where it
queues, slows, or drops.`

### Landing headings, labels, and actions

| Words | Exact text | Result |
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
exit-code list items follow the sentence table.

| # | Words | Exact sentence | Flags |
| --- | ---: | --- | --- |
| R1 | 22 | Collector Pressure Lab is a local-first CLI for OpenTelemetry operators who want evidence before changing queue, batch, or exporter settings in production. | C, J |
| R2 | 34 | It reads a Collector YAML file, replays a bounded JSON or NDJSON sample against a loopback OTLP/HTTP endpoint at stepped rates, samples optional Collector self-metrics, classifies the first pressure threshold, and prints tuning hypotheses. | C, >22, J, F-1-11 |
| R3 | 5 | It never edits the configuration. | C |
| R4 | 6 | Documentation and the offline model: https://collector-pressure-lab.sociobot.in | T |
| R5 | 8 | Synthetic results are directional, not production capacity guarantees. | C, J |
| R6 | 12 | Run the lab against an isolated local Collector, never a production endpoint. | Safety instruction |
| R7 | 7 | Build the single binary with stable Rust: | C |
| R8 | 7 | For a release artifact without installing it: | — |
| R9 | 11 | Version 0.1.0 supports Linux, macOS, and Windows anywhere stable Rust runs. | C |
| R10 | 13 | Factory release credentials are not included; `cargo package` prepares the publishable source package. | C |
| R11 | 9 | Start an isolated Collector configured with an OTLP/HTTP receiver. | Instruction |
| R12 | 10 | Then replay an OTLP JSON payload or newline-delimited JSON bodies: | C |
| R13 | 9 | Each non-empty NDJSON line is sent as one request. | C |
| R14 | 10 | A regular JSON file is sent as one request body. | C |
| R15 | 13 | The sample is loaded once and capped at 8 MiB and 10,000 records. | C |
| R16 | 7 | Each rate step is time- and request-bounded. | C |
| R17 | 15 | By default, the CLI also tries `http://127.0.0.1:8888/metrics`; use `--metrics-endpoint off` when Collector self-metrics are unavailable. | C |
| R18 | 5 | Machine-readable output and CI mode: | J |
| R19 | 16 | `--ci` disables status animation and returns a non-zero exit code when the run cannot be performed. | C |
| R20 | 27 | A completed run exits 0 even when it discovers pressure, including when every received HTTP response is non-2xx; the JSON `classification` field is intended for policy decisions. | C, >22, F-1-12 |
| R21 | 2 | Exit codes: | — |
| R22 | 11 | Use `--header 'name:value'` for a local test receiver that requires metadata. | C |
| R23 | 4 | Remote hosts are rejected. | C |
| R24 | 26 | `--allow-remote` exists for controlled lab networks and prints an explicit warning; samples still remain on the operator's machine except for requests sent to the chosen endpoint. | C, >22, F-1-13 |
| R25 | 6 | Inspect config-derived settings without sending traffic: | C, J |
| R26 | 15 | The parser intentionally extracts only pressure-relevant Collector settings: `sending_queue.enabled`, `sending_queue.queue_size`, `sending_queue.num_consumers`, `batch.send_batch_size`, `batch.send_batch_max_size`, and `batch.timeout`. | C, J |
| R27 | 8 | Unknown or templated values are reported, not guessed. | C |
| R28 | 31 | At each offered rate, the lab records attempts, HTTP responses, successful responses, transport errors/non-2xx drops, response latency, achieved request throughput, and deltas from common `otelcol_*` queue/refusal/failure counters when metrics are exposed. | C, >22, F-1-14 |
| R29 | 8 | The first step with explicit failures/refusals is **drops**. | C |
| R30 | 15 | A step with rising latency, exporter queue growth, or materially lower achieved throughput is **backpressure**. | C |
| R31 | 4 | Otherwise it is **stable**. | C |
| R32 | 15 | The reported threshold is the lowest pressured step and is refined from observed successful throughput. | C |
| R33 | 6 | This is an HTTP boundary experiment. | J |
| R34 | 20 | It cannot see memory spikes, downstream backend throttling outside the run window, or queue state when Collector self-metrics are disabled. | C |
| R35 | 12 | Tuning output is a hypothesis to validate, not an automatic configuration change. | C, J |
| R36 | 13 | The landing page documents the CLI and includes an entirely offline queue model. | C, T |
| R37 | 11 | The model explains likely behavior but does not contact a Collector. | C |
| R38 | 12 | `npm test` runs Rust tests plus the site unit and browser tests. | C |
| R39 | 15 | The documented examples are covered by CLI integration tests, including a controlled slow receiver fixture. | C |
| R40 | 13 | There is no telemetry, analytics, account, upload, local storage, or runtime third-party request. | C |
| R41 | 16 | CLI inputs stay local unless their bounded request bodies are sent to the endpoint you provide. | C |
| R42 | 7 | See the site privacy and terms pages. | C |
| R43 | 9 | Collector Pressure Lab is independent of the OpenTelemetry project. | C |
| R44 | 15 | It reads configuration keys and public self-metric names but bundles no OpenTelemetry source or assets. | C |
| R45 | 1 | MIT. | C |
| R46 | 2 | See [LICENSE](LICENSE). | C |

README headings are `Collector Pressure Lab` (3), `Install` (1), `Usage` (1),
`How classification works` (3), `Site and browser model` (4), `Test and
verify` (3), `Privacy and scope` (3), and `License` (1); all make sense out of
context. Exit-code items are `` `0`: experiment completed `` (3), `` `2`:
arguments, input, safety check, or configuration error `` (8), and `` `3`: no
HTTP response could be measured (for example, every connection or request
timed out) `` (15); none exceeds 22 words.

## Terminology table

| Concept | Terms currently used | Required term |
| --- | --- | --- |
| Web simulator | browser model; deterministic queue model; Local model; offline queue model; offline model | browser model |
| Overload boundary | platform edge; pressure line; first pressure threshold; lowest pressured step | pressure threshold |
| Incoming load | telemetry burst; JSON bodies; offered rate; stepped arrivals | request rate; `telemetry sample` only for input |
| Workflow | lab; experiment; model | CLI test for a real run; browser model for the explainer |

## What would make this perfect

Resolve every finding and rerun the entire review. Perfect means the first
mobile screen names the operator, job, and one sample-data action; one click
opens an already-populated, resettable, isolated web demo; `cplab demo` runs a
bundled realistic sample in a temporary directory; every claim passes its own
clean-sandbox test; route/status/focus/metadata/policy/navigation behavior is
complete; all targets are at least 44 × 44 px; and neither copy appendix has a
`>22`, `J`, `T`, `H`, or `B` flag. At that point there would be no finding or
untested claim left.
