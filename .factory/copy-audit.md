# Copy audit — perfection loop round 3

Audited 2026-08-28. Words are whitespace-delimited; hyphenated terms count as one word. No sentence exceeds 22 words. No sentence uses a banned marketing word. Every visitor-facing factual promise maps to a claim below; instructions and scope warnings are marked “instruction” or “scope.”

## Landing-page sentences

| Words | Sentence | Evidence |
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

The 17-word root meta description maps to `bounded-replay` and `classification`: “Test a bounded telemetry sample against a local Collector and find where requests queue, slow, or drop.” The terminal uses “measured” placeholders because demo timing varies by machine; it makes no exact p95 or throughput promise.

## Headings and actions

All headings make sense out of context. All actions name the result.

| Type | Text |
| --- | --- |
| H1 | Find your Collector's pressure threshold |
| Primary action | Try it with sample data |
| H2 | Test one sample at increasing rates |
| H3 | Read Collector config values |
| H3 | Replay bounded requests |
| H3 | Classify the first failure |
| H2 | Model a burst before you run the CLI |
| Form action | Show pressure result |
| H2 | Test your local Collector from the terminal |
| H2 | Know what the result means |
| H3 | Measurements |
| H3 | Suggested next tests |
| H3 | Limits |

## README sentences

Commands, headings, URL labels, and exit-code labels are excluded. Each prose sentence remains within the 22-word cap.

| Words | Sentence | Evidence |
| ---: | --- | --- |
| 14 | Collector Pressure Lab tests when a local OpenTelemetry Collector queues, slows, or drops telemetry. | `classification` |
| 15 | It is for operators checking queue, batch, or exporter config values before a production change. | audience |
| 13 | The CLI reads Collector YAML and replays a bounded JSON or NDJSON sample. | `bounded-replay`, `config-inspection` |
| 13 | It increases request rates, reads optional metrics, and reports the first pressure threshold. | `collector-metrics`, `threshold-accuracy` |
| 6 | It never edits the Collector config. | `no-config-write` |
| 7 | Try the isolated sample at the demo URL. | `demo-isolation` |
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
| 9 | Collector Pressure Lab is independent of the OpenTelemetry project. | legal identity |
| 6 | This project uses the MIT License. | `legal-and-site-links` |

Privacy, terms, and 404 copy was also checked. Each sentence is 22 words or fewer, uses the same terms, and maps to the claim ids above or states safety/legal scope.

## Terminology

| Concept | Required term |
| --- | --- |
| Web simulator | browser model |
| Overload boundary | pressure threshold |
| Incoming load | request rate |
| Input data | telemetry sample |
| Real workflow | CLI test |
| Configuration file | Collector config |
| Values read from that file | config values |
| Classification | stable, backpressure, or drops |

Repository scans found no banned words and no older “settings” or “configuration” variants in visitor-facing site, README, or CLI help/output copy.
