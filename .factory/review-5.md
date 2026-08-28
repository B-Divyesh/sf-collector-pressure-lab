# Adversarial first-read review 5 — FAIL

Reviewed 2026-08-28 against source commit
`809999e510b963e5cba165c7a059aa5d73e52ec9` and
<https://collector-pressure-lab.sociobot.in/>. This was a full cold review, not
a diff review. The live JavaScript and CSS match the clean local production
build by SHA-256.

## Verdict

**FAIL.** Five blocking findings remain: two demo-sandbox defects, a
half-fixed earlier metadata requirement, and two unlisted claims.
The product is clear on the first screen, opens a populated result in one
click, keeps demo storage separate, works offline, and passes all 15 declared
claim commands. However, **Reset demo** does not restore the sample that the
visitor initially entered, and the declared demo test checks only one of four
inputs. A passing under-scoped test does not make the reset behavior correct.

## Findings

### F-5-1 / F-1-2 (reopened) — BLOCKING — Reset changes to a different, undocumented demo sample

- Exact quotes/locations: landing banner action `Reset demo`; README `Use
  Reset demo to restore its sample`; `.factory/demo.md` says `Sample: 900
  incoming items/s, 420 exported items/s, a 1,200-item queue, and a 10-second
  burst` and `Reset demo restores the bundled values and result`.
- Live evidence from a fresh 390 px context:

  | State | Arrival | Export | Queue | Duration | Dropped | Stored value |
  | --- | ---: | ---: | ---: | ---: | ---: | --- |
  | First `/demo` load | 700 | 450 | 1,500 | 8 s | 500 | `700/450/1500/8` |
  | After **Reset demo** | 900 | 400 | 1,200 | 10 s | 3,800 | `900/400/1200/10` |

- The documented 420 items/s value never appears. The export range uses
  `min="50" step="50"`, so assigning 420 is normalized to 400.
- Code cause: `setupLab()` calls each input's update handler before
  `setupDemo()`. In demo mode, those handlers save the ordinary 700/450/1500/8
  defaults, so `setupDemo()` mistakes them for saved demo data. The reset then
  applies the invalid 420 value to the 50-step control.
- Claim gap: `@claim:demo-isolation` passes because it checks only that the
  arrival rate becomes 900 after reset. It never asserts the complete initial
  sample, all four post-reset inputs, or equality between initial and reset
  state. The manifest promises that the demo “resets,” so this is incomplete
  observable coverage, not an unlisted claim.
- Why this blocks: Reset is a mandatory demo control. A visitor cannot return
  to the sample they first saw, and the documented sample is not the sample
  used by either entry or reset.
- Concrete fix: initialize demo state before input listeners may persist it.
  Make the bundled export value representable—use 400 or change the control
  step. Update `@claim:demo-isolation` to assert all four values and result on
  fresh `/demo` and `/?demo=1`, mutate all four, reset, then assert exact
  equality with the initial sample. Keep the real-key survival assertions.

### F-5-2 / F-1-2 (reopened) — BLOCKING — demo data remains after the visitor leaves

- Exact quotes/locations: banner `Demo — sample data, nothing is saved`;
  Privacy `Demo changes use a separate demo: browser key and are removed when
  you leave`; attached demo contract `Leaving demo mode discards demo data`.
- Live evidence: after changing arrival rate to 1,200, navigating from `/demo`
  through the wordmark to `/` retained
  `demo:cplab:pressure-input=1200/450/1500/8`. Navigating to `/privacy/`
  retained the same key. Closing the page, opening a new page in the same
  browser context, and loading `/` also retained it.
- **Start for real** does remove the key, and the demo namespace never touches
  the seeded real key. The defect is that every other normal way to leave the
  demo bypasses that cleanup.
- Claim gap: no manifest entry states that demo data is discarded when the
  visitor leaves. The related `@claim:demo-isolation` test exercises only
  **Start for real**, not the wordmark, navigation links, browser Back, or page
  close/reopen. The privacy sentence is therefore also an unlisted claim.
- Why this blocks: demo data is stored beyond demo mode even though both the
  privacy page and sandbox contract promise discard on leaving. This is a
  required demo isolation behavior and leaves F-1-2 only half-fixed.
- Concrete fix: clear the demo namespace whenever a non-demo route loads and
  when same-origin navigation leaves demo mode. Add tests for wordmark,
  Privacy, browser Back from a root-entered demo, and close/reopen into `/`.
  Keep the assertion that real-prefixed data survives.

### F-5-3 / F-1-7 (reopened) — BLOCKING — the designed 404 omits its Open Graph URL

- Exact location: live `/404`, an unknown 404 response, and
  `site/404/index.html`. The page has a canonical URL, OG title, description,
  and image, but no `<meta property="og:url">`.
- Why this matters: route metadata is inconsistent, and a shared 404 document
  lacks the URL identity supplied on every other public route.
- Why this blocks: F-1-7 required route-specific Open Graph metadata. The 404
  remained half-fixed while later reports marked it complete, so the history
  rule reopens that finding as blocking.
- Concrete fix: add `<meta property="og:url"
  content="https://collector-pressure-lab.sociobot.in/404">` and assert it in
  `@claim:legal-and-site-links` for both `/404` and an unknown route.

### F-5-4 / F-1-4 (reopened) — BLOCKING — the independence statement is an unlisted claim

- Exact quote/location: README and Terms, `Collector Pressure Lab is
  independent of the OpenTelemetry project.`
- Manifest evidence: no `.factory/claims.json` entry states independence,
  non-affiliation, or non-endorsement. `legal-and-site-links` claims only that
  routes, metadata, the MIT license, and styled 404 are published. Its test
  does not assert this sentence or any observable affiliation boundary.
- Why this blocks: legal affiliation is a fact a visitor can rely on. F-1-4
  originally included every README claim, so leaving this sentence outside
  the manifest keeps that earlier finding half-fixed.
- Concrete fix: remove the untestable independence sentence. If a disclaimer
  is required, use the narrower `OpenTelemetry names describe compatibility;
  this project claims no endorsement`, list that exact disclosure in
  `claims.json`, and test its publication in README and Terms.

### F-5-5 / F-1-4 (reopened) — BLOCKING — “adds no identifiers” has no claim or network assertion

- Exact quote/location: Privacy, `The product adds no identifiers to those
  requests.`
- Manifest evidence: `no-third-party-runtime` covers third-party requests,
  tracking code, and remote assets. It does not state the no-identifier
  promise. Its test checks request origins and source strings, not cookies,
  authorization/custom headers, query identifiers, or generated client IDs.
- Live observation: this review saw only ordinary same-origin asset URLs and
  no cross-origin request. That one run is not the declared clean-state test
  required for the published privacy promise.
- Why this blocks: the sentence is a user-relevant privacy claim and remains
  outside the manifest, reopening F-1-4.
- Concrete fix: add a `no-request-identifiers` claim and test the full landing
  and demo flow with request URL/query/header capture, empty cookies, and no
  generated browser identifier. Alternatively remove the sentence.

## Cold first screen, before scrolling

Fresh Chromium contexts used 390 × 844 and 1440 × 900 viewports, blocked
service workers, empty storage, `scrollY = 0`, and no interaction.

| Viewport | What does this do? | For whom? | What should I click first? |
| --- | --- | --- | --- |
| 390 × 844 | Finds when a local Collector reaches the threshold where telemetry queues, slows, or drops. | OpenTelemetry operators testing a local Collector. | **Try it with sample data**; the adjacent text says it loads the bundled sample and shows the result. |
| 1440 × 900 | Tests a Collector's pressure threshold before a production change. | OpenTelemetry operators. | **Try it with sample data**; **Install the CLI** is secondary. |

The exact first-screen text is `Find your Collector's pressure threshold`,
`For OpenTelemetry operators testing when a local Collector queues, slows, or
drops telemetry.`, and `Try it with sample data` beside `Loads the bundled
sample and shows the result.` The three facts end at 752 px on mobile and 860
px on desktop. The first-read requirement passes.

## Demo, privacy, and CLI sandbox

- One click from `/` opened `/demo`. `Drops`, 500 dropped items, and `Model
  complete: Drops.` were visible immediately; the classification began at 632
  px on the 844 px viewport.
- The banner read `Demo — sample data, nothing is saved` and exposed **Reset
  demo** and **Start for real**. Reset fails F-5-1; other exit paths fail
  F-5-2.
- Demo entry, mutation, reset, and exit used only
  `demo:cplab:pressure-input`. A seeded `real:cplab:sentinel` survived all
  three actions. **Start for real** removed only the demo key, but the
  wordmark, Privacy navigation, and page close/reopen left it behind.
- Every live demo request was same-origin. After service-worker control, an
  intercepted offline reload retained the banner and populated `Drops`
  result.
- `cplab demo` was run from an empty temporary current directory. It exited 0,
  left that directory empty, reported a separate `/tmp/cplab-demo-…`
  directory, and created `collector.yaml`, `traces.ndjson`, and `report.json`
  there. The result was `backpressure` with a measured threshold of about 49.5
  successful requests/s.
- The ordinary browser-model claim test found no local/session/IndexedDB data
  and no cross-origin request.

## Claims execution

All 15 commands from `.factory/claims.json` were run independently after
`npm ci` in clean clone `/tmp/cplab-review5-clean.LIxyAW`.

| Claim id | Listed command result |
| --- | --- |
| `demo-isolation` | PASS — but under-scoped; see F-5-1 and F-5-2 |
| `free-to-use` | PASS |
| `offline-reload` | PASS |
| `browser-no-network-or-storage` | PASS |
| `loopback-guard` | PASS |
| `bounded-replay` | PASS |
| `config-inspection` | PASS |
| `classification` | PASS |
| `collector-metrics` | PASS |
| `cli-data-boundary` | PASS |
| `no-config-write` | PASS |
| `package-and-tests` | PASS |
| `no-third-party-runtime` | PASS |
| `legal-and-site-links` | PASS — but under-scoped; see F-5-3 |
| `threshold-accuracy` | PASS |

F-5-2 and F-5-5 are unlisted privacy claims, and F-5-4 is an unlisted README
claim. F-5-1 is a declared demo behavior whose test does not assert the full
reset outcome. The legal/site test does not check the 404 metadata gap in
F-5-3.

The complete clean-clone `npm test` also passed: 4 Rust unit tests, 4 CLI
contract tests, 3 pressure fixtures, 1 doctest, 6 Vitest tests, and 41
Playwright passes with 9 intentional mobile duplicates skipped. The build
produced `dist/site`; JavaScript is 2,697 bytes gzip and CSS is 4,367 bytes
gzip.

## Copy audit

Visible words are counted; punctuation-only marks are excluded and hyphenated
forms count as one. Code blocks are commands and are excluded. No sentence
exceeds 22 words. No supplied banned
word, inconsistent product term, contextless heading, or non-result-naming
button was found. `F-5-1` marks the false reset sentence; F-5-4 marks the
unlisted independence claim.

### Landing-page sentences

| Words | Exact sentence | Flag |
| ---: | --- | --- |
| 7 | Offline mode: the browser model still works. | — |
| 6 | CLI install links need a connection. | — |
| 6 | Demo — sample data, nothing is saved. | — |
| 5 | Changes use separate demo storage. | — |
| 13 | For OpenTelemetry operators testing when a local Collector queues, slows, or drops telemetry. | — |
| 8 | Loads the bundled sample and shows the result. | — |
| 3 | Free to use. | — |
| 6 | Works offline after the first visit. | — |
| 5 | Runs against loopback by default. | — |
| 7 | See when incoming telemetry exceeds export capacity. | — |
| 6 | Test evidence, not a capacity guarantee. | — |
| 12 | Use an isolated Collector and repeat with production-shaped samples before changing limits. | — |
| 9 | Read queue size, consumer count, and batch config values. | — |
| 4 | Templated values remain unknown. | — |
| 10 | Replay JSON requests at increasing rates within fixed safety limits. | — |
| 8 | Classify each run as stable, backpressure, or drops. | — |
| 10 | The browser model explains queue behavior without contacting your Collector. | — |
| 6 | It does not predict production capacity. | — |
| 1 | Ready. | — |
| 8 | Adjust a setting or show the sample result. | — |
| 14 | Show the result to see whether the queue drains, backs up, or drops items. | — |
| 12 | The Rust binary sends a bounded sample to your local OTLP/HTTP receiver. | — |
| 6 | It reads Collector self-metrics when available. | — |
| 5 | Human output describes the result. | — |
| 4 | Use `--json` in scripts. | — |
| 3 | One Rust binary | — |
| 5 | Loopback endpoint guard by default | — |
| 5 | Never edits the Collector config | — |
| 5 | Example output — timing values vary. | — |
| 7 | First pressure threshold: measured by each run. | — |
| 16 | See response latency, throughput, non-success responses, and available Collector queue or failure metrics for each rate. | — |
| 14 | Test queue size, consumers, batches, downstream latency, or a narrower range of request rates. | — |
| 11 | The CLI generates bounded traffic and never edits your Collector config. | — |
| 6 | Results do not guarantee production capacity. | — |
| 8 | Test bounded telemetry against a Collector you control. | — |
| 5 | Install command copied to clipboard. | — |
| 4 | Clipboard access was blocked. | — |
| 6 | Select and copy the command manually. | — |
| 7 | Modeled queue peak: [peak] of [capacity] items. | — |
| 9 | Arrival stays below modeled export capacity at [percent] utilization. | — |
| 6 | The queue holds the extra items. | — |
| 10 | It needs about [seconds] seconds to drain after arrivals fall. | — |
| 5 | [Count] items exceed the queue. | — |
| 10 | Reduce arrival pressure or fix exporter capacity before raising limits. | — |
| 3 | Model complete: [classification]. | — |
| 5 | Could not run model: [error]. | — |
| 4 | Could not run model. | — |
| 3 | Check the inputs. | — |
| 6 | Demo reset to the bundled sample. | F-5-1: entry and reset samples differ |

The 17-word meta description is `Test a bounded telemetry sample against a
local Collector and find where requests queue, slow, or drop.` It is covered
by `bounded-replay` and `classification`.

### Landing headings and actions

| Type | Exact text | Result |
| --- | --- | --- |
| H1 | Find your Collector's pressure threshold | Pass |
| Eyebrow | Collector pressure test | Pass |
| Action | Try sample pressure test | Pass |
| Action | Try it with sample data | Pass |
| Action | Install the CLI | Pass |
| Eyebrow | How the pressure test works | Pass |
| H2 | Test one sample at increasing rates | Pass |
| H3 | Read Collector config values | Pass |
| H3 | Replay bounded requests | Pass |
| H3 | Classify the first failure | Pass |
| Eyebrow | Browser queue model | Pass |
| H2 | Model a burst before you run the CLI. | Pass |
| Action | Show pressure result | Pass |
| Result heading | Modeled result | Pass |
| Eyebrow | Collector CLI | Pass |
| H2 | Test your local Collector from the terminal | Pass |
| Action | Copy command / Copied | Pass |
| Eyebrow | What the CLI can and cannot measure | Pass |
| H2 | Know what the result means | Pass |
| H3 | Measurements | Pass |
| H3 | Suggested next tests | Pass |
| H3 | Limits | Pass |
| Demo actions | Reset demo / Start for real | Labels pass; reset behavior fails F-5-1 |

### README sentences

| Words | Exact sentence | Flag |
| ---: | --- | --- |
| 14 | Collector Pressure Lab tests when a local OpenTelemetry Collector queues, slows, or drops telemetry. | — |
| 15 | It is for operators checking queue, batch, or exporter config values before a production change. | — |
| 13 | The CLI reads Collector YAML and replays a bounded JSON or NDJSON sample. | — |
| 13 | It increases request rates, reads optional metrics, and reports the first pressure threshold. | — |
| 6 | It never edits the Collector config. | — |
| 6 | Try the isolated sample at `https://collector-pressure-lab.sociobot.in/demo`. | — |
| 7 | Synthetic results do not predict production capacity. | — |
| 12 | Run each CLI test against an isolated Collector, never a production endpoint. | — |
| 7 | Build the single binary with stable Rust: | — |
| 8 | Prepare the publishable source package without publishing it: | — |
| 10 | Version 0.1.0 can be packaged from this repository with Cargo. | — |
| 7 | Run the bundled sample with one command: | — |
| 14 | The command copies the bundled Collector config and telemetry sample into a temporary directory. | — |
| 17 | It starts a temporary loopback receiver, runs the pressure test, and writes `report.json` beside the copied inputs. | — |
| 6 | The final output prints that directory. | — |
| 8 | The web demo uses separate `demo:` browser storage. | — |
| 15 | Use **Reset demo** to restore its sample or **Start for real** to remove demo data. | F-5-1: Reset changes the sample |
| 7 | See `.factory/demo.md` for the full sandbox contract. | — |
| 8 | Start an isolated Collector with an OTLP/HTTP receiver. | — |
| 10 | Then replay an OTLP JSON payload or newline-delimited JSON bodies: | — |
| 7 | Each non-empty NDJSON line becomes one request. | — |
| 8 | A regular JSON file becomes one request body. | — |
| 10 | The CLI loads at most 8 MiB or 10,000 records. | — |
| 9 | Each rate step has time, request, and concurrency limits. | — |
| 6 | The CLI checks `http://127.0.0.1:8888/metrics` by default. | — |
| 8 | Pass `--metrics-endpoint off` when Collector self-metrics are unavailable. | — |
| 5 | Use machine-readable output in scripts: | — |
| 10 | `--ci` returns a non-zero code when the test cannot run. | — |
| 12 | A completed run exits 0, even when every HTTP response is non-2xx. | — |
| 8 | Use the JSON classification field for policy decisions. | — |
| 9 | Use `--header 'name:value'` when a local receiver requires metadata. | — |
| 6 | Remote hosts are rejected by default. | — |
| 8 | Use `--allow-remote` only on a controlled test network. | — |
| 13 | The CLI warns you and sends samples only to the endpoint you choose. | — |
| 7 | Read Collector config values without sending traffic: | — |
| 10 | The parser reads these Collector queue and batch config values: | — |
| 8 | Unknown or templated values are reported, not guessed. | — |
| 12 | At each rate, the CLI records attempts, responses, drops, latency, and throughput. | — |
| 10 | When available, it reads Collector queue, refusal, and failure counters. | — |
| 9 | The first step with failures or refusals is **drops**. | — |
| 9 | Rising latency, queue growth, or lower throughput is **backpressure**. | — |
| 5 | Otherwise the result is **stable**. | — |
| 11 | The threshold uses the lowest pressured step and measured successful throughput. | — |
| 8 | The CLI tests at the Collector's OTLP/HTTP input. | — |
| 12 | It cannot see memory spikes or downstream throttling outside the test window. | — |
| 9 | It cannot read queue state when self-metrics are off. | — |
| 10 | Suggested config values are next tests, not automatic config changes. | — |
| 10 | The site documents the CLI and includes a browser model. | — |
| 15 | The browser model works offline after the first visit and does not contact a Collector. | — |
| 9 | The CLI integration suite includes a controlled slow receiver. | — |
| 7 | See `.factory/claims.json` for the declared claim tests. | — |
| 9 | The site sends no analytics or third-party runtime requests. | — |
| 9 | Outside demo mode, the browser model stores no inputs. | — |
| 7 | The CLI creates no persistent telemetry copy. | — |
| 11 | It connects only to the test and metrics endpoints you choose. | — |
| 6 | Read the privacy and terms pages. | — |
| 9 | Collector Pressure Lab is independent of the OpenTelemetry project. | F-5-4: unlisted claim |
| 6 | This project uses the MIT License. | — |

README headings are `Collector Pressure Lab`, `Install`, `Try the bundled
sample`, `Test a Collector`, `Inspect Collector config`, `Understand
classification`, `Run the site`, `Test and package`, `Privacy and scope`, and
`License`. Each makes sense out of context. The exit-code list and config-key
list are labels/data, not sentences.

Terminology is consistent: **browser model**, **pressure threshold**,
**request rate**, **telemetry sample**, **CLI test**, **Collector config**, and
**config values**.

## Structure, links, accessibility, and identity

- `/`, `/demo`, `/?demo=1`, `/privacy/`, `/terms/`, and `/404` returned 200.
  `/missing-review-5` returned 404 with the designed `This route stops here`
  page.
- Every route had `lang="en"`, one h1, one main, a route title, description,
  canonical, OG/Twitter title/description/image, SVG favicon, Apple icon,
  consistent header/footer, and no horizontal overflow. The sole metadata gap
  is F-5-3.
- Root title is `Collector Pressure Lab — test Collector backpressure`.
  Demo, privacy, terms, and 404 titles follow the route pattern.
- Privacy navigation focused and announced its h1 after the page's two-frame
  focus update. Browser Back focused `hero-title`; `/#cli` focused
  `cli-title`, announced it, and aligned the section within 0.3 px.
- The complete unique-link crawl returned 200 for root, demo, privacy, terms,
  favicon/touch/social assets, and GitHub source. All hash targets exist.
- Live Axe checks found zero serious or critical issues across every checked
  route at 390 px. The full local browser matrix passed at desktop and mobile,
  including keyboard operation, 44 × 44 px targets, reduced motion, and valid
  route console checks. The required URL verifier passed with zero console
  errors, one h1, one main, `lang="en"`, and no missing image alt.
- CSP, Permissions Policy, Referrer Policy, `nosniff`, sitemap, robots, and
  immutable hashed-asset caching are live.
- The art-deco transit-poster palette, clipped panels, brass rails, station
  board, and original pressure-line art match `.factory/design.md`. The site
  is recognizably product-specific, not a generic SaaS template.

## Earlier-finding verification

Every earlier `review-*.md`, `polish-*.md`, and current handoff was read. Each
finding below was checked against both current code and the live deployment.

| Earlier id | Current verification |
| --- | --- |
| F-1-1 | Fixed: job, audience, action, outcome, and three facts fit both cold first screens. |
| F-1-2 | **Half-fixed and reopened by F-5-1/F-5-2:** entry, banner, namespace separation, offline mode, and CLI demo work; Reset changes samples and ordinary leave paths retain demo data. |
| F-1-3 | Fixed: 15 unique manifest entries and matching tagged tests exist. |
| F-1-4 | **Half-fixed and reopened by F-5-2/F-5-4/F-5-5:** discard-on-leave, independence, and no-identifier statements remain outside the manifest; F-5-1 is incomplete observable coverage inside a listed claim. |
| F-1-5 | Fixed: demo/deep links, focus, styled 404, and real 404 status pass. |
| F-1-6 | Fixed: CSP and Permissions Policy are present live and in source. |
| F-1-7 | **Half-fixed and reopened by F-5-3:** root/public-route metadata pass, but the 404 still lacks route-specific `og:url`. |
| F-1-8 | Fixed: sitemap and robots reference are live. |
| F-1-9 | Fixed: shared header/footer content is consistent. |
| F-1-10 | Fixed: forward, Back, and hash navigation focus and announce headings. |
| F-1-11 | Fixed: README overview remains split below 22 words. |
| F-1-12 | Fixed: exit and JSON guidance remain separate. |
| F-1-13 | Fixed: remote override guidance remains two direct sentences. |
| F-1-14 | Fixed: request evidence and optional metrics remain separate. |
| F-1-15 | Fixed: `browser model` is used consistently. |
| F-1-16 | Fixed: former tuning-hypothesis hero jargon is absent. |
| F-1-17 | Fixed: caption directly names incoming telemetry and export capacity. |
| F-1-18 | Fixed: workflow steps remain short and verb-led. |
| F-1-19 | Fixed: result copy says drains, backs up, or drops. |
| F-1-20 | Fixed: former abstract README terms remain absent. |
| F-1-21 | Fixed: header action remains `Try sample pressure test`. |
| F-1-22 | Fixed: hero action remains `Try it with sample data` and opens a result. |
| F-1-23 | Fixed: form action remains `Show pressure result`. |
| F-1-24 | Fixed: eyebrow remains `How the pressure test works`. |
| F-1-25 | Fixed: method heading names increasing request rates. |
| F-1-26 | Fixed: heading remains `Read Collector config values`. |
| F-1-27 | Fixed: heading remains `Classify the first failure`. |
| F-1-28 | Fixed: eyebrow remains `Browser queue model`. |
| F-1-29 | Fixed: eyebrow remains `Collector CLI`. |
| F-1-30 | Fixed: terminal heading names testing the local Collector. |
| F-1-31 | Fixed: boundary eyebrow names CLI limits. |
| F-1-32 | Fixed: heading remains `Know what the result means`. |
| F-1-33 | Fixed: heading remains `Measurements`. |
| F-1-34 | Fixed: heading remains `Suggested next tests`. |
| F-1-35 | Fixed: heading remains `Limits`. |
| F-2-1 | Fixed: visible live targets pass 44 × 44 px checks. |
| F-2-2 | Fixed: the GitHub source link visibly says it opens an external site. |
| F-3-1 | Fixed: threshold claim passed independently and in full `npm test`. |
| F-3-2 | Fixed: first-screen hint says `bundled sample`. |
| F-3-3 | Fixed: factory-registry credential wording remains absent. |
| F-3-4 | Fixed: `Collector config` and `config values` remain distinct. |
| F-4-1 | Fixed: `free-to-use` is declared and passed its clean-state test. |
| Verification P1 | Fixed: all-503 responses retain a complete Drops report. |
| Verification P2 | Fixed: live hashed assets use immutable caching. |
| Verification 2 P1 | Fixed: service worker excludes deployment control and reloads the demo offline. |
| Verification 3 P3 | Fixed: CSP and Permissions Policy remain live. |

## Missed leverage

No finding. JSON/NDJSON input, Collector YAML inspection, human/JSON output,
and the temporary demo report cover the brief's obvious import/export needs.
A deterministic load test does not benefit from model-generated advice; it
would weaken explainability and introduce keys, cost, and network use. No AI
runtime, provider key, decorative AI feature, or sync expectation was found.

## What would make this perfect

1. Make fresh demo entry and Reset use the same documented, representable
   four-value sample, then test the entire state and result on both demo entry
   URLs.
2. Discard demo storage on every way out of demo mode and test each route.
3. Add and test the 404 `og:url` metadata.
4. Remove or narrow, list, and test the OpenTelemetry independence statement.
5. Declare and verify the no-request-identifiers privacy promise, or remove it.

Then rerun every claim command, `npm test`, and the full live cold/demo/route
check. No other work is identified in this review.
