# Adversarial first-read review 3 — FAIL

Reviewed 2026-08-28 against source commit
`d44c5c9cf8ef9d542a5079ae071f610bf811b6ba` and
<https://collector-pressure-lab.sociobot.in/>. The live root and service worker
match the clean local production build byte for byte.

## Verdict

**FAIL.** The first screen, demo, routing, privacy behavior, and visual system
now work. All 12 manifest commands passed independently. The documented full
gate still produced an intermittent failure in the tagged threshold claim, and
several visitor-facing promises remain outside the claims manifest. There are
two blocking findings and three minor copy findings.

## Cold first screen, before scrolling

Fresh Chromium contexts used 390 × 844 and 1440 × 900 viewports, blocked
service workers, empty storage, `scrollY = 0`, and no interaction.

| Viewport | What does this do? | For whom? | What should I click first? |
| --- | --- | --- | --- |
| 390 px | It finds when an OpenTelemetry Collector starts to queue, slow, or drop telemetry. | OpenTelemetry operators testing a local Collector. | **Try it with sample data**; the adjacent line says it loads a sample and shows the result. |
| 1440 px | It tests a Collector's pressure threshold before production changes. | OpenTelemetry operators. | **Try it with sample data**. **Install the CLI** is visibly secondary. |

The exact first-screen text is `Find your Collector's pressure threshold`,
`For OpenTelemetry operators testing when a local Collector queues, slows, or
drops telemetry.`, and `Try it with sample data` beside `Loads a safe sample
and shows the result.` All three product facts end at 675 px on the 844 px
mobile viewport. This passes the mandatory first-read shape, subject to the
wording finding on “safe” below.

## Findings

### F-3-1 — BLOCKING — the tagged threshold claim is intermittent inside `npm test`

- Exact location: `site/tests/claims.spec.ts:273`,
  `@claim:threshold-accuracy reports the controlled 50 rps exporter within 20
  percent`.
- Evidence: in clean clone `/tmp/cplab-review3-clean.JLCcD0`, the first
  `npm test` run failed this tagged test. The child `cargo test` returned 101,
  so Playwright reported 1 failed, 34 passed, and 7 skipped. An immediate full
  rerun passed, a second fresh-clone full run passed, and five direct fixture
  reruns passed.
- Why this fails: the owner requires every claim test and `npm test` to pass.
  A load/order-sensitive claim test can reject a valid build and cannot be
  relied on as evidence for the central 20-percent accuracy promise. The test
  also discards the child process output when it fails, hiding the measured
  threshold.
- Concrete fix: make the timing fixture deterministic under the full
  Playwright workload or run the Rust claim tests in an isolated serial phase.
  Include the child stdout/stderr in the assertion message. Re-run `npm test`
  repeatedly from clean clones and require zero failures.

### F-1-4 — BLOCKING — prior unlisted-claims finding is only partly fixed

`.factory/claims.json` now exists and most product promises have useful tests.
The following live/README claims are still not stated by any manifest entry,
or the named test does not assert the promised outcome. This makes the earlier
F-1-4 closure partial, so the history rule reopens the same id.

| Exact quote / location | Gap | Concrete fix |
| --- | --- | --- |
| Landing CLI: `It can also read Collector self-metrics.`; landing Measurements: `available queue or failure metrics`; README: `The CLI checks http://127.0.0.1:8888/metrics by default.` | No manifest claim names self-metric collection or the default endpoint. `@claim:classification` only unit-tests metric text parsing; it does not run the CLI against a metrics endpoint. | Add a `collector-metrics` entry and an end-to-end fixture that serves changing queue/refusal/failure metrics at the documented default URL and asserts the report. |
| Landing: `One native binary, no runtime or account`; README: `Run one command without an account or Collector setup:` | `package-and-tests` covers one binary and packaging, not the no-runtime or no-account promises. | Narrow the copy to `One Rust binary`, or expand the manifest and verify a packaged install runs in a minimal consumer environment without login or runtime setup. |
| Landing Limits: `The CLI does not store telemetry`; README: `CLI inputs stay local except for bounded bodies sent to your chosen endpoint.`; Privacy: `The CLI sends no product telemetry` | `no-config-write` hashes only the supplied files. `loopback-guard` checks the selected endpoint. Neither proves that the CLI creates no other telemetry copy or makes no other request. | Add a `cli-data-boundary` claim. Run under isolated config/cache/temp directories, assert created files, and capture all outbound connections during inspect/run/demo. |
| README: `Version 0.1.0 is distributed as source through Cargo.` | `package-and-tests` proves that `cargo package` can create an archive; it does not prove distribution through a registry. | Rewrite as `Version 0.1.0 can be packaged from this repository with Cargo.` or add a registry-install test for the actual distribution channel. |
| README: `Factory registry credentials are not included.` | No entry or package-content test covers credentials or secrets. | Remove this internal reassurance, or add a package-secret scan claim that inspects the produced archive. |
| README: `--ci removes status animation and returns a non-zero code when the test cannot run.` | Exit behavior is exercised, but no entry names `--ci` animation behavior and no test uses a TTY to assert that status animation is absent. | Add a `ci-output` claim with a pseudo-TTY test, or remove the animation clause. |
| README: `npm test runs Rust, browser-model, build, and browser tests.` | The manifest does not state this claim. `package-and-tests` only inspects script text instead of running the claimed command as its observable assertion. | Expand the manifest claim and make its test execute the four gates, or replace the sentence with a non-claiming command list. |
| README: `Every visitor-facing claim is listed in .factory/claims.json.` | This self-audit promise is not itself listed, and the rows above make it false. | Rewrite as `See .factory/claims.json for the declared claim tests.` Add a maintained copy-to-claim mapping if completeness is promised. |
| README: `It bundles no OpenTelemetry source or assets.` | `no-third-party-runtime` concerns website requests. Its source check only rejects one Cargo dependency line and does not inspect the package archive or assets. | Add this license-boundary statement to the manifest and inspect every packaged file, or remove it. |
| Landing recording: `First pressure threshold: ~49.4 req/s` and `p95 484.8ms` | `threshold-accuracy` asserts only a 40–60 rps threshold. No entry or test covers the displayed p95 or exact recorded values; the manual demo in this review printed 49.5 and 484.9. | Label the panel `Example output — timing values vary` and test only invariant ranges, or generate and verify the displayed recording from a fixed fixture. |

### F-3-2 — Minor — “safe sample” is vague and unprovable copy

- Quote/location: first-screen action hint, `Loads a safe sample and shows the
  result.`
- Why this fails: “safe” does not say what is safe. The nearby demo-isolation
  copy already names the useful boundary.
- Rewrite: `Loads the bundled sample and shows the result.`

### F-3-3 — Minor — the README exposes unexplained factory jargon

- Quote/location: README line 30, `Factory registry credentials are not
  included.`
- Why this fails: a user installing a Rust CLI has not been introduced to a
  “Factory registry,” and the sentence raises a credential concern without a
  user action.
- Rewrite: delete the sentence. If a registry is later supported, document
  its exact install command and authentication requirement there.

### F-3-4 — Minor — one concept uses three terms

- Exact locations: landing `Read Collector settings`, `Never edits the
  Collector config`, and `rewrite your configuration`; README `configuration`,
  `config`, and `config settings`.
- Why this fails: “config,” “configuration,” and “settings” name the same
  Collector input/values inconsistently. The terminology table omits this
  concept.
- Concrete fix: use `Collector config` for the file and `config values` for
  values read from it. Add both to the terminology table.

## Demo and sandbox

- The first click from `/` opened `/demo`; `Drops`, dropped count `500`, and
  `Model complete: Drops.` were already visible at 390 px.
- The persistent banner said `Demo — sample data, nothing is saved` and showed
  **Reset demo** and **Start for real**.
- Reset restored arrival rate `900` and the completed Drops result.
- A seeded `real:cplab:sentinel` key survived demo entry, reset, and exit. Exit
  removed only `demo:cplab:pressure-input`.
- The complete live flow requested only
  `https://collector-pressure-lab.sociobot.in` resources. No console or page
  errors occurred.
- After service-worker control, offline reload retained the banner and
  populated Drops result. Cache name was `cplab-3e0ef5b009f9`.
- `cplab demo` ran the bundled sample against a temporary loopback receiver,
  printed its `/tmp/cplab-demo-…` output directory, and the tagged test
  confirmed that its temporary working directory stayed empty.

## Claims execution

All commands were run independently after `npm ci` in clean clone
`/tmp/cplab-review3-clean.JLCcD0` at the reviewed commit.

| Claim id | Independent manifest command |
| --- | --- |
| `demo-isolation` | PASS — 2 projects passed |
| `offline-reload` | PASS — 2 projects passed |
| `browser-no-network-or-storage` | PASS — 2 projects passed |
| `loopback-guard` | PASS — 1 passed, duplicate mobile case skipped |
| `bounded-replay` | PASS — 1 passed, duplicate mobile case skipped |
| `config-inspection` | PASS — 1 passed, duplicate mobile case skipped |
| `classification` | PASS — 1 passed, duplicate mobile case skipped |
| `no-config-write` | PASS — 1 passed, duplicate mobile case skipped |
| `package-and-tests` | PASS — 1 passed, duplicate mobile case skipped |
| `no-third-party-runtime` | PASS — 2 projects passed |
| `legal-and-site-links` | PASS — 2 projects passed |
| `threshold-accuracy` | PASS — 1 passed, duplicate mobile case skipped |

The independent commands do not erase F-3-1: the same tagged threshold test
failed once when `npm test` ran the supported full matrix.

## Structure, links, accessibility, and identity

- `/`, `/demo`, `/?demo=1`, `/privacy/`, `/terms/`, `/404`, and an unknown
  path were checked at 390 × 844 and 1440 × 900. Public routes returned 200;
  the unknown path returned 404 with the designed pressure-line page.
- Each route has `lang="en"`, one h1, one main, route-specific title,
  description, canonical, OG/Twitter image metadata, SVG favicon, and 180 px
  Apple icon. The social image is 1200 × 630.
- Fresh `#cli` and `#lab` links aligned within 1 px and focused their h2.
  Privacy navigation and browser Back focused and announced the new h1.
- All internal live links returned 200, hash targets exist, and the external
  GitHub source link returned 200 and is visibly identified as external.
- Headers and footers are consistent and include Demo, Privacy, Terms, the
  product sentence, Param Factory, version, and build id.
- Axe returned zero violations on all checked routes at both sizes. There was
  no horizontal overflow; visible controls met 44 × 44 px; first Tab reached
  the skip link; reduced-motion CSS removes the designed motion.
- `/opt/fleet/lib/verify-url.sh` passed: title, language, one h1, main, image
  alt coverage, button labels, and zero console errors on the valid root.
- Live CSP, Permissions Policy, Referrer Policy, nosniff, immutable hashed
  asset caching, sitemap, robots, and offline worker behavior passed.
- The art-deco transit-poster system, original station art, rail geometry,
  clipped panels, and ink/brass/mint/ember palette remain product-specific.
  This is not a generic SaaS template. Provenance remains documented.

The expected browser console message for the deliberately requested 404
document was not counted as an application error; valid routes logged none.

## History verification

Every earlier review, polish report, verification report, and handoff was read.
Each row below was checked in both current source and the live deployment.

| Earlier id | Current verification | Result |
| --- | --- | --- |
| F-1-1 | Plain job, named audience, action, outcome, and three facts fit the mobile first screen. | Fixed |
| F-1-2 | Populated web demo, banner/reset/exit, isolated key, CLI demo, and documentation all work. | Fixed |
| F-1-3 | Twelve unique manifest entries and tagged tests exist. | Fixed |
| F-1-4 | Most claims are mapped, but the current unlisted-claim table above remains. | **Half-fixed; reopened blocking** |
| F-1-5 | Demo/deep links work; unknown path returns the designed 404. | Fixed |
| F-1-6 | CSP and Permissions Policy are present live and in both host configs. | Fixed |
| F-1-7 | Plain root title and complete canonical/social/touch metadata are live. | Fixed |
| F-1-8 | Sitemap and robots reference return 200 and list all public routes. | Fixed |
| F-1-9 | Shared header/footer content is consistent on every checked route. | Fixed |
| F-1-10 | Full navigation, Back, and hash changes focus and announce headings. | Fixed |
| F-1-11 | The former 34-word README sentence is split into 13-word sentences. | Fixed |
| F-1-12 | Exit and JSON guidance are separate 12- and 8-word sentences. | Fixed |
| F-1-13 | Remote override guidance is split into direct short sentences. | Fixed |
| F-1-14 | Metrics are split across 12- and 10-word sentences. | Fixed |
| F-1-15 | `browser model` is now consistent. | Fixed |
| F-1-16 | The tuning-hypothesis hero line is gone. | Fixed |
| F-1-17 | The caption directly names telemetry and export capacity. | Fixed |
| F-1-18 | All workflow steps are short and verb-led. | Fixed |
| F-1-19 | Result copy uses drains, backs up, and drops. | Fixed |
| F-1-20 | The four earlier README jargon terms are absent. | Fixed |
| F-1-21 | Header action is `Try sample pressure test`. | Fixed |
| F-1-22 | Hero action is `Try it with sample data` and opens a result. | Fixed |
| F-1-23 | Form action is `Show pressure result`. | Fixed |
| F-1-24 | Eyebrow is `How the pressure test works`. | Fixed |
| F-1-25 | Heading is `Test one sample at increasing rates`. | Fixed |
| F-1-26 | Heading is `Read Collector settings`. | Fixed |
| F-1-27 | Heading is `Classify the first failure`. | Fixed |
| F-1-28 | Eyebrow is `Browser queue model`. | Fixed |
| F-1-29 | Eyebrow is `Collector CLI`. | Fixed |
| F-1-30 | Terminal heading directly names testing a local Collector. | Fixed |
| F-1-31 | Eyebrow names what the CLI can and cannot measure. | Fixed |
| F-1-32 | Heading is `Know what the result means`. | Fixed |
| F-1-33 | Heading is `Measurements`. | Fixed |
| F-1-34 | Heading is `Suggested next tests`. | Fixed |
| F-1-35 | Heading is `Limits`. | Fixed |
| F-2-1 | Every visible live link/button was at least 44 × 44 px. | Fixed |
| F-2-2 | Source link says `(opens external site)`. | Fixed |
| Verification P1 | All-503 tests return a complete Drops report. | Fixed |
| Verification P2 | Live hashed JS/CSS use immutable caching. | Fixed |
| Verification 2 P1 | Worker precache excludes deployment control and reloads offline. | Fixed |
| Verification 3 P3 | Live/source CSP and Permissions Policy are present. | Fixed |

## Missed leverage

No AI feature is justified for a deterministic Collector load experiment.
Adding model-generated tuning advice would make a measured tool less
explainable. YAML plus JSON/NDJSON import, JSON output, and the temporary demo
report cover the obvious import/export need. No separate sync feature is
implied by this local CLI brief.

## Copy audit

Counting uses visible words, excluding punctuation-only marks. Domain terms
such as OpenTelemetry, OTLP/HTTP, NDJSON, loopback, and self-metrics are
appropriate for the named operator audience. No sentence exceeds 22 words and
no banned marketing word appears.

### Landing-page sentences

`C` means the claim remains unlisted under F-1-4; `V` is vague; `T` is
inconsistent terminology. Runtime variants, sentence-like list lines, and the
meta description are included exactly as displayed.

| # | Words | Exact sentence | Flags |
| --- | ---: | --- | --- |
| L1 | 7 | Offline mode: the browser model still works. | — |
| L2 | 6 | CLI install links need a connection. | — |
| L3 | 6 | Demo — sample data, nothing is saved | — |
| L4 | 5 | Changes use separate demo storage. | — |
| L5 | 13 | For OpenTelemetry operators testing when a local Collector queues, slows, or drops telemetry. | — |
| L6 | 8 | Loads a safe sample and shows the result. | V, F-3-2 |
| L7 | 3 | Free to use. | — |
| L8 | 6 | Works offline after the first visit. | — |
| L9 | 5 | Runs against loopback by default. | — |
| L10 | 7 | See when incoming telemetry exceeds export capacity. | — |
| L11 | 6 | Test evidence, not a capacity guarantee. | — |
| L12 | 12 | Use an isolated Collector and repeat with production-shaped samples before changing limits. | — |
| L13 | 8 | Read queue size, consumer count, and batch settings. | T, F-3-4 |
| L14 | 4 | Templated values remain unknown. | — |
| L15 | 10 | Replay JSON requests at increasing rates within fixed safety limits. | — |
| L16 | 8 | Classify each run as stable, backpressure, or drops. | — |
| L17 | 10 | The browser model explains queue behavior without contacting your Collector. | — |
| L18 | 6 | It does not predict production capacity. | — |
| L19 | 1 | Ready. | — |
| L20 | 8 | Adjust a setting or show the sample result. | — |
| L21 | 14 | Show the result to see whether the queue drains, backs up, or drops items. | — |
| L22 | 12 | The Rust binary sends a bounded sample to your local OTLP/HTTP receiver. | — |
| L23 | 6 | It can also read Collector self-metrics. | C |
| L24 | 5 | Human output describes the result. | — |
| L25 | 4 | Use `--json` in scripts. | — |
| L26 | 7 | One native binary, no runtime or account | C |
| L27 | 5 | Loopback endpoint guard by default | — |
| L28 | 5 | Never edits the Collector config | T, F-3-4 |
| L29 | 15 | See response latency, throughput, non-success responses, and available queue or failure metrics for each rate. | C |
| L30 | 14 | Test queue size, consumers, batches, downstream latency, or a narrower range of request rates. | — |
| L31 | 15 | The CLI does not store telemetry, generate production-scale traffic, guarantee capacity, or rewrite your configuration. | C, T, F-3-4 |
| L32 | 8 | Test bounded telemetry against a Collector you control. | — |
| L33 | 5 | Install command copied to clipboard. | — |
| L34 | 4 | Clipboard access was blocked. | — |
| L35 | 6 | Select and copy the command manually. | — |
| L36 | 7 | Modeled queue peak: [peak] of [capacity] items. | — |
| L37 | 9 | Arrival stays below modeled export capacity at [percent] utilization. | — |
| L38 | 6 | The queue holds the extra items. | — |
| L39 | 10 | It needs about [seconds] seconds to drain after arrivals fall. | — |
| L40 | 5 | [Count] items exceed the queue. | — |
| L41 | 10 | Reduce arrival pressure or fix exporter capacity before raising limits. | — |
| L42 | 3 | Model complete: [classification]. | — |
| L43 | 5 | Could not run model: [error]. | — |
| L44 | 4 | Could not run model. | — |
| L45 | 3 | Check the inputs. | — |
| L46 | 6 | Demo reset to the bundled sample. | — |
| L47 | 17 | Test a bounded telemetry sample against a local Collector and find where requests queue, slow, or drop. | Meta description; covered |

The terminal's numeric sample output is a UI record rather than prose; its
unlisted quantitative values are reported in F-1-4.

### Landing headings and actions

| Type | Exact text | Result |
| --- | --- | --- |
| H1 | Find your Collector's pressure threshold | Pass: 5 words, names the job |
| Heading | Test one sample at increasing rates | Pass |
| Heading | Read Collector settings | Pass, terminology finding F-3-4 |
| Heading | Replay bounded requests | Pass |
| Heading | Classify the first failure | Pass |
| Heading | Model a burst before you run the CLI | Pass |
| Heading | Test your local Collector from the terminal | Pass |
| Heading | Know what the result means | Pass |
| Headings | Measurements; Suggested next tests; Limits | Pass |
| Action | Try sample pressure test | Pass |
| Action | Try it with sample data | Pass |
| Action | Install the CLI | Pass |
| Action | Show pressure result | Pass |
| Action | Copy command | Pass |
| Demo actions | Reset demo; Start for real | Pass; required demo controls |

### README sentences

Code blocks, headings, and label-only lists are not sentences and are audited
after the table.

| Line | Words | Exact sentence | Flags |
| ---: | ---: | --- | --- |
| 3 | 14 | Collector Pressure Lab tests when a local OpenTelemetry Collector queues, slows, or drops telemetry. | — |
| 4 | 14 | It is for operators checking queue, batch, or exporter settings before a production change. | T, F-3-4 |
| 6 | 13 | The CLI reads Collector YAML and replays a bounded JSON or NDJSON sample. | — |
| 7 | 13 | It increases request rates, reads optional metrics, and reports the first pressure threshold. | C: metrics |
| 8 | 5 | It never edits the configuration. | T, F-3-4 |
| 10 | 7 | Try the isolated sample at https://collector-pressure-lab.sociobot.in/demo. | — |
| 11 | 7 | Synthetic results do not predict production capacity. | — |
| 12 | 12 | Run each CLI test against an isolated Collector, never a production endpoint. | — |
| 16 | 7 | Build the single binary with stable Rust: | — |
| 23 | 8 | Prepare the publishable source package without publishing it: | — |
| 29 | 8 | Version 0.1.0 is distributed as source through Cargo. | C |
| 30 | 6 | Factory registry credentials are not included. | C, jargon, F-3-3 |
| 34 | 9 | Run one command without an account or Collector setup: | C |
| 40 | 13 | The command copies the bundled config and telemetry sample into a temporary directory. | T, F-3-4 |
| 41 | 17 | It starts a temporary loopback receiver, runs the pressure test, and writes `report.json` beside the copied inputs. | — |
| 42 | 6 | The final output prints that directory. | — |
| 44 | 8 | The web demo uses separate `demo:` browser storage. | — |
| 45 | 15 | Use **Reset demo** to restore its sample or **Start for real** to remove demo data. | — |
| 46 | 7 | See `.factory/demo.md` for the full sandbox contract. | — |
| 50 | 8 | Start an isolated Collector with an OTLP/HTTP receiver. | — |
| 51 | 10 | Then replay an OTLP JSON payload or newline-delimited JSON bodies: | — |
| 62 | 7 | Each non-empty NDJSON line becomes one request. | — |
| 63 | 8 | A regular JSON file becomes one request body. | — |
| 64 | 11 | The CLI loads at most 8 MiB or 10,000 records. | — |
| 65 | 9 | Each rate step has time, request, and concurrency limits. | — |
| 67 | 7 | The CLI checks `http://127.0.0.1:8888/metrics` by default. | C |
| 68 | 8 | Pass `--metrics-endpoint off` when Collector self-metrics are unavailable. | C |
| 70 | 5 | Use machine-readable output in scripts: | — |
| 77 | 14 | `--ci` removes status animation and returns a non-zero code when the test cannot run. | C: animation |
| 78 | 12 | A completed run exits 0, even when every HTTP response is non-2xx. | — |
| 79 | 8 | Use the JSON classification field for policy decisions. | — |
| 81 | 2 | Exit codes: | — |
| 87 | 9 | Use `--header 'name:value'` when a local receiver requires metadata. | — |
| 88 | 6 | Remote hosts are rejected by default. | — |
| 89 | 8 | Use `--allow-remote` only on a controlled test network. | — |
| 90 | 13 | The CLI warns you and sends samples only to the endpoint you choose. | — |
| 94 | 6 | Read config settings without sending traffic: | T, F-3-4 |
| 101 | 9 | The parser reads these Collector queue and batch settings: | — |
| 110 | 8 | Unknown or templated values are reported, not guessed. | — |
| 114 | 12 | At each rate, the CLI records attempts, responses, drops, latency, and throughput. | — |
| 115 | 10 | When available, it reads Collector queue, refusal, and failure counters. | C |
| 117 | 9 | The first step with failures or refusals is **drops**. | — |
| 118 | 9 | Rising latency, queue growth, or lower throughput is **backpressure**. | — |
| 119 | 5 | Otherwise the result is **stable**. | — |
| 120 | 11 | The threshold uses the lowest pressured step and measured successful throughput. | — |
| 122 | 8 | The CLI tests at the Collector's OTLP/HTTP input. | — |
| 123 | 12 | It cannot see memory spikes or downstream throttling outside the test window. | — |
| 124 | 9 | It cannot read queue state when self-metrics are off. | C |
| 125 | 9 | Suggested settings are next tests, not automatic configuration changes. | T, F-3-4 |
| 129 | 10 | The site documents the CLI and includes a browser model. | — |
| 130 | 15 | The browser model works offline after the first visit and does not contact a Collector. | — |
| 147 | 9 | `npm test` runs Rust, browser-model, build, and browser tests. | C |
| 148 | 9 | The CLI integration suite includes a controlled slow receiver. | Covered by threshold test |
| 149 | 7 | Every visitor-facing claim is listed in `.factory/claims.json`. | C; false while F-1-4 remains |
| 153 | 11 | The site has no analytics, account, upload, or third-party runtime request. | Partly covered; account/upload absent from manifest claim |
| 154 | 9 | Outside demo mode, the browser model stores no inputs. | — |
| 155 | 13 | CLI inputs stay local except for bounded bodies sent to your chosen endpoint. | C |
| 156 | 6 | Read the privacy and terms pages. | — |
| 158 | 9 | Collector Pressure Lab is independent of the OpenTelemetry project. | — |
| 159 | 7 | It bundles no OpenTelemetry source or assets. | C |
| 163 | 6 | This project uses the MIT License. | — |

README headings are conventional and understandable in isolation. The only
README action text appears as explicit commands or verb-led instructions. No
button-label problem exists there.

## Quality-gate summary

- Twelve independent manifest commands: all passed.
- `npm test`: one clean-clone run failed F-3-1; immediate rerun passed; a
  separate fresh-clone run passed with 35 Playwright passes and 7 intentional
  duplicate mobile skips.
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- `npm audit --omit=dev`: zero vulnerabilities.
- `npm run build:site`: produced `dist/site`; JS 6.38 kB raw / 2.66 kB gzip,
  CSS 15.86 kB raw / 4.32 kB gzip, no font payload.
- Live root and worker SHA-256 values exactly matched the clean build.

## What would make this perfect

1. Remove the threshold-test intermittency under the full supported gate and
   retain diagnostic output on child-process failure.
2. List and observably test every remaining functional, privacy, packaging,
   and quantitative promise in F-1-4, or narrow the copy to tested facts.
3. Replace “safe sample,” remove factory-internal credential wording, and use
   one pair of terms for the Collector config file and its values.

After those changes, rerun the entire cold-view, demo, claim, history, route,
copy, privacy, and accessibility checklist from scratch.
