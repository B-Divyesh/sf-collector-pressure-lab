# Adversarial first-read review 4 — FAIL

Reviewed 2026-08-28 against source commit
`2c0707cea8d10e46374cf315588e5d8e897024e0` and
<https://collector-pressure-lab.sociobot.in/>. This was a fresh review, not a
diff review. A clean local clone was made at
`/tmp/cplab-review4-clean.Mu7dKY`; its 14 declared claim commands and `npm
test` were run there.

## Verdict

**FAIL.** The product is clear, tryable, isolated, accessible, and visually
specific. All listed claim tests pass. One factual landing-page pricing claim
is not a claim in `.factory/claims.json` and is therefore untested. This
reopens the earlier unlisted-claims issue under the history rule.

## Finding

### F-4-1 / F-1-4 (reopened) — BLOCKING — “Free to use” has no declared, observable claim test

- Exact quote/location: `Free to use.` in the third fact on the landing hero,
  `site/index.html`.
- Evidence: `.factory/claims.json` has 14 entries. No entry claims that the
  product is free, and no `where` field includes this landing fact. The
  superficially related `legal-and-site-links` entry promises only published
  routes, metadata, MIT license, and the styled 404. Its tagged test asserts
  those things; it does not assert the absence of a paid tier, payment flow, or
  billing request. `.factory/copy-audit.md` maps this sentence to that id, but
  the manifest and test do not support the mapping.
- Why this fails: a price statement is a fact a visitor can rely on. A future
  billing change could leave the sentence in place while all 14 current claim
  tests still pass. The claims contract requires each factual product promise
  to be declared and tested; this is the remaining part of earlier F-1-4.
- Concrete fix: retain the required price fact, add a `free-to-use` manifest
  entry whose claim is exactly `Collector Pressure Lab is free to use`, and add
  one `@claim:free-to-use` test. From a clean checkout, that test should visit
  the public landing, demo, privacy, and terms routes; assert there is no paid
  tier, payment/login call to action, price, or billing request; and source-scan
  for the Sociobot billing API or other payment-provider runtime. Alternatively
  remove `Free to use.`; the former preserves the brief's free monetization
  fact.

## Cold first screen

Fresh Chromium contexts had empty browser storage, no interaction, `scrollY =
0`, and viewports of 390 × 844 and 1440 × 900. Before scrolling, the answer
was unambiguous in both contexts:

| Viewport | What it does | For whom | First click |
| --- | --- | --- | --- |
| 390 × 844 | Finds the threshold where a local Collector queues, slows, or drops telemetry. | OpenTelemetry operators testing a local Collector. | **Try it with sample data**, which says it loads the bundled sample and shows the result. |
| 1440 × 900 | Tests a bounded sample against a Collector to find backpressure. | OpenTelemetry operators. | **Try it with sample data**; **Install the CLI** is visually secondary. |

The exact visible first-screen copy is `Find your Collector's pressure
threshold`, `For OpenTelemetry operators testing when a local Collector
queues, slows, or drops telemetry.`, and `Try it with sample data` beside
`Loads the bundled sample and shows the result.` The three facts all fit in the
390 px screen. This first-read check passes.

## Copy audit

Words are whitespace-delimited; hyphenated forms count as one. The complete
current landing and README prose audit follows. There are no sentences over 22
words, no supplied banned marketing adjective, no jargon finding, no
terminology conflict, no contextless heading, and no non-result-naming action.
The pricing sentence above is the sole claim-coverage flag.

### Landing sentences

| Words | Sentence |
| ---: | --- |
| 7 | Offline mode: the browser model still works. |
| 6 | CLI install links need a connection. |
| 6 | Demo — sample data, nothing is saved. |
| 5 | Changes use separate demo storage. |
| 13 | For OpenTelemetry operators testing when a local Collector queues, slows, or drops telemetry. |
| 8 | Loads the bundled sample and shows the result. |
| 3 | Free to use. |
| 6 | Works offline after the first visit. |
| 5 | Runs against loopback by default. |
| 7 | See when incoming telemetry exceeds export capacity. |
| 6 | Test evidence, not a capacity guarantee. |
| 12 | Use an isolated Collector and repeat with production-shaped samples before changing limits. |
| 9 | Read queue size, consumer count, and batch config values. |
| 4 | Templated values remain unknown. |
| 9 | Replay JSON requests at increasing rates within fixed safety limits. |
| 9 | Classify each run as stable, backpressure, or drops. |
| 9 | The browser model explains queue behavior without contacting your Collector. |
| 6 | It does not predict production capacity. |
| 1 | Ready. |
| 8 | Adjust a setting or show the sample result. |
| 14 | Show the result to see whether the queue drains, backs up, or drops items. |
| 12 | The Rust binary sends a bounded sample to your local OTLP/HTTP receiver. |
| 6 | It reads Collector self-metrics when available. |
| 5 | Human output describes the result. |
| 4 | Use `--json` in scripts. |
| 3 | One Rust binary. |
| 5 | Loopback endpoint guard by default. |
| 5 | Never edits the Collector config. |
| 5 | Example output — timing values vary. |
| 7 | First pressure threshold: measured by each run. |
| 16 | See response latency, throughput, non-success responses, and available Collector queue or failure metrics for each rate. |
| 14 | Test queue size, consumers, batches, downstream latency, or a narrower range of request rates. |
| 11 | The CLI generates bounded traffic and never edits your Collector config. |
| 6 | Results do not guarantee production capacity. |
| 8 | Test bounded telemetry against a Collector you control. |
| 5 | Install command copied to clipboard. |
| 4 | Clipboard access was blocked. |
| 6 | Select and copy the command manually. |
| 6 | Modeled queue peak: [peak] of [capacity] items. |
| 9 | Arrival stays below modeled export capacity at [percent] utilization. |
| 6 | The queue holds the extra items. |
| 10 | It needs about [seconds] seconds to drain after arrivals fall. |
| 5 | [Count] items exceed the queue. |
| 10 | Reduce arrival pressure or fix exporter capacity before raising limits. |
| 3 | Model complete: [classification]. |
| 5 | Could not run model: [error]. |
| 4 | Could not run model. |
| 3 | Check the inputs. |
| 6 | Demo reset to the bundled sample. |

Headings pass the out-of-context check: `Find your Collector's pressure
threshold`, `Test one sample at increasing rates`, `Read Collector config
values`, `Replay bounded requests`, `Classify the first failure`, `Model a
burst before you run the CLI`, `Test your local Collector from the terminal`,
`Know what the result means`, `Measurements`, `Suggested next tests`, and
`Limits`. Actions pass the result-naming check: `Try sample pressure test`,
`Try it with sample data`, `Install the CLI`, `Show pressure result`, `Copy
command`, `Reset demo`, and `Start for real`.

### README sentences

| Words | Sentence |
| ---: | --- |
| 14 | Collector Pressure Lab tests when a local OpenTelemetry Collector queues, slows, or drops telemetry. |
| 15 | It is for operators checking queue, batch, or exporter config values before a production change. |
| 13 | The CLI reads Collector YAML and replays a bounded JSON or NDJSON sample. |
| 13 | It increases request rates, reads optional metrics, and reports the first pressure threshold. |
| 6 | It never edits the Collector config. |
| 7 | Try the isolated sample at the demo URL. |
| 7 | Synthetic results do not predict production capacity. |
| 12 | Run each CLI test against an isolated Collector, never a production endpoint. |
| 7 | Build the single binary with stable Rust. |
| 8 | Prepare the publishable source package without publishing it. |
| 11 | Version 0.1.0 can be packaged from this repository with Cargo. |
| 7 | Run the bundled sample with one command. |
| 14 | The command copies the bundled Collector config and telemetry sample into a temporary directory. |
| 17 | It starts a temporary loopback receiver, runs the pressure test, and writes `report.json` beside the copied inputs. |
| 6 | The final output prints that directory. |
| 8 | The web demo uses separate `demo:` browser storage. |
| 15 | Use Reset demo to restore its sample or Start for real to remove demo data. |
| 7 | See `.factory/demo.md` for the full sandbox contract. |
| 8 | Start an isolated Collector with an OTLP/HTTP receiver. |
| 10 | Then replay an OTLP JSON payload or newline-delimited JSON bodies. |
| 7 | Each non-empty NDJSON line becomes one request. |
| 8 | A regular JSON file becomes one request body. |
| 11 | The CLI loads at most 8 MiB or 10,000 records. |
| 9 | Each rate step has time, request, and concurrency limits. |
| 7 | The CLI checks `http://127.0.0.1:8888/metrics` by default. |
| 8 | Pass `--metrics-endpoint off` when Collector self-metrics are unavailable. |
| 5 | Use machine-readable output in scripts. |
| 10 | `--ci` returns a non-zero code when the test cannot run. |
| 12 | A completed run exits 0, even when every HTTP response is non-2xx. |
| 8 | Use the JSON classification field for policy decisions. |
| 9 | Use `--header 'name:value'` when a local receiver requires metadata. |
| 6 | Remote hosts are rejected by default. |
| 8 | Use `--allow-remote` only on a controlled test network. |
| 13 | The CLI warns you and sends samples only to the endpoint you choose. |
| 7 | Read Collector config values without sending traffic. |
| 9 | The parser reads these Collector queue and batch config values. |
| 8 | Unknown or templated values are reported, not guessed. |
| 12 | At each rate, the CLI records attempts, responses, drops, latency, and throughput. |
| 10 | When available, it reads Collector queue, refusal, and failure counters. |
| 9 | The first step with failures or refusals is drops. |
| 10 | Rising latency, queue growth, or lower throughput is backpressure. |
| 5 | Otherwise the result is stable. |
| 11 | The threshold uses the lowest pressured step and measured successful throughput. |
| 8 | The CLI tests at the Collector's OTLP/HTTP input. |
| 12 | It cannot see memory spikes or downstream throttling outside the test window. |
| 9 | It cannot read queue state when self-metrics are off. |
| 10 | Suggested config values are next tests, not automatic config changes. |
| 10 | The site documents the CLI and includes a browser model. |
| 15 | The browser model works offline after the first visit and does not contact a Collector. |
| 9 | The CLI integration suite includes a controlled slow receiver. |
| 7 | See `.factory/claims.json` for the declared claim tests. |
| 9 | The site sends no analytics or third-party runtime requests. |
| 9 | Outside demo mode, the browser model stores no inputs. |
| 7 | The CLI creates no persistent telemetry copy. |
| 11 | It connects only to the test and metrics endpoints you choose. |
| 6 | Read the privacy and terms pages. |
| 9 | Collector Pressure Lab is independent of the OpenTelemetry project. |
| 6 | This project uses the MIT License. |

Terminology remains consistent: **browser model**, **pressure threshold**,
**request rate**, **telemetry sample**, **CLI test**, **Collector config**, and
**config values**. The source has no visitor-facing occurrence of the banned
terms or the former `settings` / `configuration` variants.

## Demo, privacy, and CLI sandbox

- One click from the root visited `/demo`. At both viewports, the first screen
  already contained `Drops`, the dropped-item result, and `Model complete:
  Drops.` The 390 px result classification was above the fold.
- The persistent banner read `Demo — sample data, nothing is saved`; it exposed
  **Reset demo** and **Start for real**. Reset restored arrival rate `900`.
- In a fresh context, demo data used only
  `demo:cplab:pressure-input`. After **Start for real**, that key was removed.
  The declared claim test additionally seeded `real:cplab:sentinel`, proved it
  survived reset and exit, and passed in this review's clean clone.
- After service-worker installation, an offline fresh-context reload of `/demo`
  remained populated and returned `Drops`. Live browser requests throughout the
  demo were same-origin only. The ordinary browser model used no localStorage,
  sessionStorage, IndexedDB, or cross-origin request.
- From a fresh temporary current directory, `cplab demo` exited 0 and printed a
  separate `/tmp/cplab-demo-…` directory containing `collector.yaml`,
  `traces.ndjson`, and `report.json`; the current directory stayed empty. It
  reported a real bounded result (`Backpressure`, about 49.5 successful
  requests/s) and its next config values to test.

## Claim execution

Every command below passed independently from the clean clone. The per-claim
log is `/tmp/cplab-review4-claims.log` in this review container.

| Claim id | Result |
| --- | --- |
| `demo-isolation` | PASS |
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
| `legal-and-site-links` | PASS |
| `threshold-accuracy` | PASS |

`npm test` also passed in the same clone: four Rust unit tests, four CLI
contract tests, three pressure fixtures, one doctest, six Vitest tests, and 39
Playwright passes; nine duplicate mobile CLI claim tests were intentionally
skipped. `npm run build:site` produced `dist/site` as part of that gate.

## Structure, accessibility, and identity

- Root, demo, query-demo, privacy, terms, `/404`, and a missing route were
  checked at both 390 × 844 and 1440 × 900. Valid routes returned 200; the
  missing route returned HTTP 404 with the styled `This route stops here` page.
  The direct `/404` route is the designed page's normal 200 route.
- Every checked page had exactly one `h1` and one `main`, a plain route title,
  a meta description, canonical URL, OG/Twitter social image, SVG favicon,
  apple-touch icon, `lang="en"`, and no horizontal overflow. Root title is
  `Collector Pressure Lab — test Collector backpressure`; demo title becomes
  `Demo — Collector Pressure Lab` for both `/demo` and `?demo=1`.
- Axe found zero violations on every route at both viewports. Valid-route
  console checks were clean. The only browser-generated 404 resource message
  occurred while deliberately loading the missing route, whose document
  correctly returned status 404.
- Privacy navigation focused its `h1` and announced `Privacy`; browser Back
  focused and announced `hero-title`; a fresh `/#cli` load focused
  `cli-title` at 117 px (mobile) / 152 px (desktop) from the viewport top.
- Every unique site and external source link returned HTTP 200. `robots.txt`
  references the sitemap, which lists root, demo, privacy, and terms. Live
  responses included CSP, Permissions-Policy, `nosniff`, and Referrer-Policy.
- Header/footer identity, skip link, Demo/Privacy/Terms navigation, privacy
  and terms links, external-link label, Param Factory credit, version, and
  build id were consistent. The art-deco transit-board palette, clipped brass
  controls, station-board result layout, and original pressure-line image are
  product-specific rather than a generic SaaS template.

## Earlier-finding verification

Every earlier review, polish report, and handoff was read. The table confirms
the source and live behavior, not just a prior status label.

| Earlier id | Current verification |
| --- | --- |
| F-1-1 | Fixed: the current first screen names the Collector task, OpenTelemetry operators, sample action, outcome, and facts at 390 px. |
| F-1-2 | Fixed: `/demo`, `?demo=1`, and `cplab demo` are populated, isolated demo entries; reset/exit and temp output passed. |
| F-1-3 | Fixed: the manifest contains 14 unique IDs with one matching tagged test each. |
| F-1-4 | **Reopened by F-4-1**: `Free to use.` has no matching manifest claim or observable test. |
| F-1-5 | Fixed: demo route, deep link, focus, styled 404, and actual missing-route 404 passed live. |
| F-1-6 | Fixed: CSP and Permissions-Policy were present on checked live responses. |
| F-1-7 | Fixed: titles, canonical, OG/Twitter data, social art, and icons passed across routes. |
| F-1-8 | Fixed: live robots and sitemap passed. |
| F-1-9 | Fixed: shared header/footer, legal links, factory credit, and build note were present. |
| F-1-10 | Fixed: privacy forward, Back, and `#cli` changed focus and live announcement correctly. |
| F-1-11 | Fixed: README overview is split; every audited sentence is 22 words or fewer. |
| F-1-12 | Fixed: completed-run exit behavior and JSON guidance are separate sentences. |
| F-1-13 | Fixed: remote override guidance is two direct sentences. |
| F-1-14 | Fixed: request measurements and optional Collector metrics are separate sentences. |
| F-1-15 | Fixed: visitor copy uses `browser model` consistently. |
| F-1-16 | Fixed: the former tuning-hypothesis hero phrase is absent. |
| F-1-17 | Fixed: figure caption says incoming telemetry exceeds export capacity. |
| F-1-18 | Fixed: the three steps are short, verb-led instructions. |
| F-1-19 | Fixed: result text says drains, backs up, or drops. |
| F-1-20 | Fixed: former abstract terms are absent from visitor copy. |
| F-1-21 | Fixed: header action is `Try sample pressure test`. |
| F-1-22 | Fixed: primary action is `Try it with sample data` and opens a completed result. |
| F-1-23 | Fixed: model action is `Show pressure result`. |
| F-1-24 | Fixed: eyebrow is `How the pressure test works`. |
| F-1-25 | Fixed: method heading names increasing request rates. |
| F-1-26 | Fixed: heading is `Read Collector config values`. |
| F-1-27 | Fixed: heading is `Classify the first failure`. |
| F-1-28 | Fixed: eyebrow is `Browser queue model`. |
| F-1-29 | Fixed: eyebrow is `Collector CLI`. |
| F-1-30 | Fixed: terminal heading names the local-Collector task. |
| F-1-31 | Fixed: boundary eyebrow names CLI limits. |
| F-1-32 | Fixed: heading is `Know what the result means`. |
| F-1-33 | Fixed: heading is `Measurements`. |
| F-1-34 | Fixed: heading is `Suggested next tests`. |
| F-1-35 | Fixed: heading is `Limits`. |
| F-2-1 | Fixed: live mobile/desktop controls had no target below 44 × 44 px; no overflow. |
| F-2-2 | Fixed: GitHub link visibly says `(opens external site)`. |
| F-3-1 | Fixed: the threshold claim passed independently and again in the complete clean-clone `npm test` run. |
| F-3-2 | Fixed: first-screen hint says `bundled sample`, not `safe sample`. |
| F-3-3 | Fixed: README contains no factory-registry credential language. |
| F-3-4 | Fixed: source and visible copy distinguish `Collector config` from `config values`. |
| Verification P1 | Fixed: `all_503_responses_exit_zero_with_a_complete_json_drop_report` passed inside the full gate. |
| Verification P2 | Fixed: live hashed assets retained immutable cache headers. |
| Verification 2 P1 | Fixed: offline demo passed and the worker does not precache a deployment control file. |
| Verification 3 P3 | Fixed: live CSP and Permissions-Policy were present. |

## Missed leverage

No finding. The brief calls for config inspection, bounded replay, pressure
classification, and tuning hypotheses; the CLI supplies each, including
`report.hypotheses` and human `NEXT CONFIG VALUES TO TEST`. Import is already
the local JSON/NDJSON sample path and export is scriptable JSON. An AI feature
would add credential, privacy, and network cost to a local deterministic test
without improving the core job, so none is expected here. No provider keys or
decorative AI feature were found.

## What would make this perfect

Add and pass the one `free-to-use` claim described in F-4-1, then rerun the
clean-clone manifest loop and `npm test`. No other issue was found in this
round.
