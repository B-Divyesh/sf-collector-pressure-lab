# Adversarial first-read review 6 — PASS

Reviewed 2026-08-28 against source commit
`118d2ab971526bd9a19225fbeeba8aaf4d2247ba` and the live site at
<https://collector-pressure-lab.sociobot.in/>. This was a fresh review, not a
diff review. Product code was not changed.

## Verdict

**PASS.** There are zero blocking or minor findings. The cold screen states
the job, audience, and first action; the one-click demo is populated and
isolated; every declared claim passed its own clean-state command; and the
previous findings remain fixed in both the deployed artifact and current
source.

## Cold first screen, before scrolling

Fresh Chromium contexts at 390 × 844 and 1440 × 900 opened `/` with empty
storage, no prior interaction, and `scrollY = 0`.

| Viewport | What it does, in my words | For whom | First click |
| --- | --- | --- | --- |
| 390 × 844 | Finds the request rate where a local Collector queues, slows, or drops telemetry. | OpenTelemetry operators testing a local Collector. | **Try it with sample data**. It says it loads the bundled sample and shows the result. |
| 1440 × 900 | Tests a Collector pressure threshold before a production change. | OpenTelemetry operators. | **Try it with sample data**; **Install the CLI** is visibly secondary. |

The exact text that supported those answers was `Find your Collector's pressure
threshold`, `For OpenTelemetry operators testing when a local Collector queues,
slows, or drops telemetry.`, and `Try it with sample data` beside `Loads the
bundled sample and shows the result.` The three facts are visible within the
phone first screen (the final fact ends at 752 px). No first-read finding.

## Copy audit

Words are whitespace-delimited; bracketed dynamic values count as one word;
hyphenated forms count as one word. Commands and code-only labels are excluded.
No entry exceeds 22 words. The banned-word scan found none. The terminology
scan uses **browser model**, **pressure threshold**, **request rate**,
**telemetry sample**, **Collector config**, and **config values** consistently.
Every factual landing/README promise below maps to the declared claim shown in
the final column; scope and instruction text is not presented as a product
claim.

### Landing-page sentences

| Words | Sentence | Claim/status |
| ---: | --- | --- |
| 7 | Offline mode: the browser model still works. | `offline-reload` |
| 6 | CLI install links need a connection. | state explanation |
| 6 | Demo — sample data, nothing is saved. | `demo-isolation` |
| 5 | Changes use separate demo storage. | `demo-isolation` |
| 13 | For OpenTelemetry operators testing when a local Collector queues, slows, or drops telemetry. | `classification` |
| 8 | Loads the bundled sample and shows the result. | `demo-isolation` |
| 3 | Free to use. | `free-to-use` |
| 6 | Works offline after the first visit. | `offline-reload` |
| 5 | Runs against loopback by default. | `loopback-guard` |
| 7 | See when incoming telemetry exceeds export capacity. | `classification` |
| 6 | Test evidence, not a capacity guarantee. | scope |
| 12 | Use an isolated Collector and repeat with production-shaped samples before changing limits. | instruction |
| 9 | Read queue size, consumer count, and batch config values. | `config-inspection` |
| 4 | Templated values remain unknown. | `config-inspection` |
| 9 | Replay JSON requests at increasing rates within fixed safety limits. | `bounded-replay` |
| 9 | Classify each run as stable, backpressure, or drops. | `classification` |
| 9 | The browser model explains queue behavior without contacting your Collector. | `browser-no-network-or-storage` |
| 6 | It does not predict production capacity. | scope |
| 1 | Ready. | state |
| 8 | Adjust a setting or show the sample result. | instruction |
| 14 | Show the result to see whether the queue drains, backs up, or drops items. | `classification` |
| 12 | The Rust binary sends a bounded sample to your local OTLP/HTTP receiver. | `bounded-replay` |
| 6 | It reads Collector self-metrics when available. | `collector-metrics` |
| 5 | Human output describes the result. | `classification` |
| 4 | Use `--json` in scripts. | `classification` |
| 3 | One Rust binary. | `package-and-tests` |
| 5 | Loopback endpoint guard by default. | `loopback-guard` |
| 5 | Never edits the Collector config. | `no-config-write` |
| 5 | Example output — timing values vary. | scope |
| 7 | First pressure threshold: measured by each run. | `threshold-accuracy` |
| 16 | See response latency, throughput, non-success responses, and available Collector queue or failure metrics for each rate. | `classification`, `collector-metrics` |
| 14 | Test queue size, consumers, batches, downstream latency, or a narrower range of request rates. | instruction |
| 11 | The CLI generates bounded traffic and never edits your Collector config. | `bounded-replay`, `no-config-write` |
| 6 | Results do not guarantee production capacity. | scope |
| 8 | Test bounded telemetry against a Collector you control. | instruction |
| 5 | Install command copied to clipboard. | feedback |
| 4 | Clipboard access was blocked. | error |
| 6 | Select and copy the command manually. | recovery |
| 7 | Modeled queue peak: [peak] of [capacity] items. | `classification` |
| 9 | Arrival stays below modeled export capacity at [percent] utilization. | `classification` |
| 6 | The queue holds the extra items. | `classification` |
| 10 | It needs about [seconds] seconds to drain after arrivals fall. | `classification` |
| 5 | [Count] items exceed the queue. | `classification` |
| 10 | Reduce arrival pressure or fix exporter capacity before raising limits. | instruction |
| 3 | Model complete: [classification]. | `classification` |
| 5 | Could not run model: [error]. | error |
| 4 | Could not run model. | error |
| 3 | Check the inputs. | recovery |
| 6 | Demo reset to the bundled sample. | `demo-isolation` |

The 17-word root description, `Test a bounded telemetry sample against a local
Collector and find where requests queue, slow, or drop.`, maps to
`bounded-replay` and `classification`.

### README sentences

| Words | Sentence | Claim/status |
| ---: | --- | --- |
| 14 | Collector Pressure Lab tests when a local OpenTelemetry Collector queues, slows, or drops telemetry. | `classification` |
| 15 | It is for operators checking queue, batch, or exporter config values before a production change. | audience |
| 13 | The CLI reads Collector YAML and replays a bounded JSON or NDJSON sample. | `bounded-replay`, `config-inspection` |
| 13 | It increases request rates, reads optional metrics, and reports the first pressure threshold. | `collector-metrics`, `threshold-accuracy` |
| 6 | It never edits the Collector config. | `no-config-write` |
| 6 | Try the isolated sample at https://collector-pressure-lab.sociobot.in/demo. | `demo-isolation` |
| 7 | Synthetic results do not predict production capacity. | scope |
| 12 | Run each CLI test against an isolated Collector, never a production endpoint. | instruction |
| 7 | Build the single binary with stable Rust. | `package-and-tests` |
| 8 | Prepare the publishable source package without publishing it. | `package-and-tests` |
| 11 | Version 0.1.0 can be packaged from this repository with Cargo. | `package-and-tests` |
| 7 | Run the bundled sample with one command. | `demo-isolation` |
| 14 | The command copies the bundled Collector config and telemetry sample into a temporary directory. | `demo-isolation` |
| 17 | It starts a temporary loopback receiver, runs the pressure test, and writes `report.json` beside the copied inputs. | `demo-isolation` |
| 6 | The final output prints that directory. | `demo-isolation` |
| 8 | The web demo uses separate `demo:` browser storage. | `demo-isolation` |
| 15 | Use Reset demo to restore its sample or Start for real to remove demo data. | `demo-isolation` |
| 11 | Leaving the demo through another site link also removes its data. | `demo-isolation` |
| 7 | See `.factory/demo.md` for the full sandbox contract. | documentation |
| 8 | Start an isolated Collector with an OTLP/HTTP receiver. | instruction |
| 10 | Then replay an OTLP JSON payload or newline-delimited JSON bodies. | `bounded-replay` |
| 7 | Each non-empty NDJSON line becomes one request. | `bounded-replay` |
| 8 | A regular JSON file becomes one request body. | `bounded-replay` |
| 11 | The CLI loads at most 8 MiB or 10,000 records. | `bounded-replay` |
| 9 | Each rate step has time, request, and concurrency limits. | `bounded-replay` |
| 7 | The CLI checks `http://127.0.0.1:8888/metrics` by default. | `collector-metrics` |
| 8 | Pass `--metrics-endpoint off` when Collector self-metrics are unavailable. | instruction |
| 5 | Use machine-readable output in scripts. | `classification` |
| 10 | `--ci` returns a non-zero code when the test cannot run. | `classification` |
| 12 | A completed run exits 0, even when every HTTP response is non-2xx. | `classification` |
| 8 | Use the JSON classification field for policy decisions. | `classification` |
| 9 | Use `--header 'name:value'` when a local receiver requires metadata. | `bounded-replay` |
| 6 | Remote hosts are rejected by default. | `loopback-guard` |
| 8 | Use `--allow-remote` only on a controlled test network. | instruction |
| 13 | The CLI warns you and sends samples only to the endpoint you choose. | `loopback-guard`, `cli-data-boundary` |
| 7 | Read Collector config values without sending traffic. | `config-inspection` |
| 9 | The parser reads these Collector queue and batch config values. | `config-inspection` |
| 8 | Unknown or templated values are reported, not guessed. | `config-inspection` |
| 12 | At each rate, the CLI records attempts, responses, drops, latency, and throughput. | `classification` |
| 10 | When available, it reads Collector queue, refusal, and failure counters. | `collector-metrics` |
| 9 | The first step with failures or refusals is drops. | `classification` |
| 10 | Rising latency, queue growth, or lower throughput is backpressure. | `classification` |
| 5 | Otherwise the result is stable. | `classification` |
| 11 | The threshold uses the lowest pressured step and measured successful throughput. | `threshold-accuracy` |
| 8 | The CLI tests at the Collector's OTLP/HTTP input. | `bounded-replay` |
| 12 | It cannot see memory spikes or downstream throttling outside the test window. | scope |
| 9 | It cannot read queue state when self-metrics are off. | `collector-metrics` |
| 10 | Suggested config values are next tests, not automatic config changes. | scope |
| 10 | The site documents the CLI and includes a browser model. | site structure |
| 15 | The browser model works offline after the first visit and does not contact a Collector. | `offline-reload`, `browser-no-network-or-storage` |
| 9 | The CLI integration suite includes a controlled slow receiver. | `threshold-accuracy` |
| 7 | See `.factory/claims.json` for the declared claim tests. | documentation |
| 9 | The site sends no analytics or third-party runtime requests. | `no-third-party-runtime` |
| 9 | Outside demo mode, the browser model stores no inputs. | `browser-no-network-or-storage` |
| 7 | The CLI creates no persistent telemetry copy. | `cli-data-boundary` |
| 11 | It connects only to the test and metrics endpoints you choose. | `cli-data-boundary` |
| 6 | Read the privacy and terms pages. | `legal-and-site-links` |
| 6 | This project uses the MIT License. | `legal-and-site-links` |

### Headings and actions

All headings make sense when read without surrounding prose. All actions name
the result or operation; no generic submit-style label was found.

| Type | Text |
| --- | --- |
| H1 | Find your Collector's pressure threshold |
| H2 | Test one sample at increasing rates |
| H3 | Read Collector config values |
| H3 | Replay bounded requests |
| H3 | Classify the first failure |
| H2 | Model a burst before you run the CLI. |
| H2 | Test your local Collector from the terminal |
| H2 | Know what the result means |
| H3 | Measurements |
| H3 | Suggested next tests |
| H3 | Limits |
| Actions | Try sample pressure test; Try it with sample data; Install the CLI; Show pressure result; Copy command; Reset demo; Start for real |

## Demo and sandbox behaviour

- One click from landing opened `/demo` and scrolled to a populated product
  screen: 900 incoming items/s, 400 exported items/s, a 1,200-item queue,
  10-second burst, and a complete **Drops** result (9,000 offered, 1,200 queue
  peak, 3,800 dropped, 3-second drain).
- The visible persistent banner states `Demo — sample data, nothing is saved`,
  with **Reset demo** and **Start for real**. Reset restored all four sample
  inputs and the complete result, not merely the arrival value.
- The sole demo storage key was
  `demo:cplab:pressure-input`. A seeded `real:cplab:sentinel` survived demo
  mutation and all verified exits: wordmark, Privacy, browser Back, and
  close/reopen. Each exit removed the demo key.
- Request interception during ordinary model use and the demo recorded only
  same-origin resources. Ordinary use left localStorage, sessionStorage, and
  IndexedDB empty and sent no authorization/custom identity headers.
- After service-worker control, a 390 px context was taken offline and
  reloaded `/demo`; the banner remained visible and the populated result was
  **Drops** with no console or page errors.
- `target/debug/cplab demo` was run from an empty temporary current directory.
  It returned 0, printed a separate `/tmp/cplab-demo-…` output directory, and
  left the current directory empty. Its bundled loopback run reported
  backpressure at approximately 49.5 successful requests/s.

## Claims and local verification

After `npm ci`, every manifest command was run independently. All 16 passed.
The complete `npm test` also passed: 4 Rust unit tests, 4 CLI contract tests,
3 pressure fixtures, 1 doctest, 6 Vitest tests, and 43 Playwright tests (9
intentional duplicate-mobile skips). `npm run build:site` produced `dist/site`;
the JavaScript is 6.64 kB raw / 2.72 kB gzip.

| Claim id | Result |
| --- | --- |
| `demo-isolation` | PASS |
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
| `no-request-identifiers` | PASS |
| `legal-and-site-links` | PASS |
| `threshold-accuracy` | PASS |

The live-page and README cross-check found no claim-like sentence without a
manifest entry. There is exactly one `@claim:<id>` tag for each manifest id.

## Structure, accessibility, and links

- `/`, `/demo`, `/?demo=1`, `/privacy/`, `/terms/`, and `/404` returned their
  intended document. A fresh `/missing-review-6` returned HTTP 404 with the
  designed “This route stops here” page and return action.
- Each route has the expected route title, one h1, one main landmark, `lang`, a
  description, canonical URL, Open Graph URL/image, Twitter card, favicon,
  and apple-touch icon. Demo uses `Demo — Collector Pressure Lab`; privacy and
  terms use the route-first pattern; the root title is `Collector Pressure Lab
  — test Collector backpressure`.
- Link crawl returned 200 for every internal destination and the GitHub source;
  hash targets exist. `robots.txt` references the sitemap, which lists the
  public routes.
- Navigating to Privacy focused and announced its h1. Browser Back focused and
  announced `hero-title`. `#cli` focused and announced `cli-title`, aligned
  within 0.5 px of the viewport top.
- Header/footer content is consistent on all routes: wordmark home link, Demo,
  Privacy, Terms, skip link, product line, external-source label, Param Factory
  credit, version, and build id.
- Live Axe checks at 390 px on `/`, `/demo`, `/privacy/`, `/terms/`, and `/404`
  returned no violations. The local suite also covers keyboard controls,
  target sizes, reduced motion, console errors, and image alternatives.
- The deployed surface matches the documented art-deco transit-poster identity:
  night ink, brass rails, clipped station-board panels, and the original
  pressure-line illustration. It is not a generic SaaS template.

## Earlier finding verification

Every earlier `review-*.md`, `polish-*.md`, and the prior handoff was read.
The current source and live site confirm every item below, rather than relying
on an earlier “fixed” label.

| Earlier id | Current confirmation |
| --- | --- |
| F-1-1 | Fixed: job, audience, sample outcome, and three facts fit the cold phone screen. |
| F-1-2 | Fixed: populated web/CLI demos, exact reset, isolated namespace, and every tested exit cleanup work. |
| F-1-3 | Fixed: manifest and one tagged test per declared claim are present. |
| F-1-4 | Fixed: current factual copy is claimed and tested; untestable affiliation copy is absent. |
| F-1-5 | Fixed: real demo/legal URLs, deep links, styled 404, and unknown-route 404 status work. |
| F-1-6 | Fixed: CSP and Permissions Policy are live and present in deployment configuration. |
| F-1-7 | Fixed: every route, including 404, has canonical and complete social metadata. |
| F-1-8 | Fixed: live robots and sitemap are present and list routes. |
| F-1-9 | Fixed: header and footer skeleton is shared. |
| F-1-10 | Fixed: forward, Back, and hash navigation focus and announce headings. |
| F-1-11 | Fixed: README overview is split into short sentences. |
| F-1-12 | Fixed: completion and JSON guidance are separate sentences. |
| F-1-13 | Fixed: remote override guidance is direct and short. |
| F-1-14 | Fixed: request evidence and optional metrics are separate sentences. |
| F-1-15 | Fixed: browser model is the single web-simulator term. |
| F-1-16 | Fixed: unexplained tuning-hypothesis copy is absent. |
| F-1-17 | Fixed: the caption names telemetry and export capacity. |
| F-1-18 | Fixed: workflow steps are short and verb-led. |
| F-1-19 | Fixed: results say drains, backs up, or drops. |
| F-1-20 | Fixed: prior abstract README jargon is absent. |
| F-1-21 | Fixed: header action names the sample pressure test. |
| F-1-22 | Fixed: hero action is Try it with sample data and opens a result. |
| F-1-23 | Fixed: form action is Show pressure result. |
| F-1-24 | Fixed: method eyebrow names the pressure test. |
| F-1-25 | Fixed: method heading names increasing rates. |
| F-1-26 | Fixed: config-values heading distinguishes values from the file. |
| F-1-27 | Fixed: classification heading names the first failure. |
| F-1-28 | Fixed: browser-model eyebrow is explicit. |
| F-1-29 | Fixed: CLI eyebrow is explicit. |
| F-1-30 | Fixed: terminal heading names testing a local Collector. |
| F-1-31 | Fixed: boundary eyebrow names the CLI limits. |
| F-1-32 | Fixed: result-meaning heading has context. |
| F-1-33 | Fixed: Measurements heading has context. |
| F-1-34 | Fixed: Suggested next tests heading has context. |
| F-1-35 | Fixed: Limits heading has context. |
| F-2-1 | Fixed: visible controls meet the 44 × 44 px target check. |
| F-2-2 | Fixed: GitHub source visibly says it opens an external site. |
| F-3-1 | Fixed: the threshold timing claim passes independently and in the full suite. |
| F-3-2 | Fixed: first-screen text says bundled sample, not vague safe sample. |
| F-3-3 | Fixed: unprovable registry-credential copy is absent. |
| F-3-4 | Fixed: Collector config and config values remain distinct. |
| F-4-1 | Fixed: free-to-use is a declared, independently passing claim. |
| F-5-1 | Fixed: fresh and reset demo values/results match at 900/400/1200/10. |
| F-5-2 | Fixed: demo state clears on non-demo exits while real data survives. |
| F-5-3 | Fixed: 404 has exact `og:url`. |
| F-5-4 | Fixed: unsupported OpenTelemetry independence statement is absent. |
| F-5-5 | Fixed: no-request-identifiers is declared and network/storage tested. |
| Verification P1 | Fixed: all-503 output retains complete Drops JSON. |
| Verification P2 | Fixed: hashed assets use immutable caching. |
| Verification 2 P1 | Fixed: service-worker demo reload works offline without precaching deployment control. |
| Verification 3 P3 | Fixed: CSP and Permissions Policy remain live. |

## Missed leverage

No finding. The brief calls for a deterministic CLI that imports Collector YAML
and JSON/NDJSON, emits human/JSON results, and supplies a temp-directory demo;
all are present. An AI suggestion step would add a key, cost, network traffic,
and nondeterminism to a job that needs reproducible evidence. No decorative AI
feature or embedded provider credential was found.

## What would make this perfect

No product change is required by this review. Preserve the current one-to-one
claims coverage and rerun the cold/demo/privacy/route checks after each future
deployment so this PASS remains evidence-backed.
