# Copy audit — perfection loop round 2

Audited 2026-08-28. Words are whitespace-delimited; hyphenated terms count as one word.
No sentence exceeds 22 words. No sentence uses a banned marketing word.

## Landing-page sentences

| Words | Sentence | Claim evidence |
| ---: | --- | --- |
| 7 | Offline mode: the browser model still works. | `offline-reload` |
| 6 | CLI install links need a connection. | state explanation |
| 7 | Demo — sample data, nothing is saved. | `demo-isolation` |
| 5 | Changes use separate demo storage. | `demo-isolation` |
| 13 | For OpenTelemetry operators testing when a local Collector queues, slows, or drops telemetry. | `classification` |
| 8 | Loads a safe sample and shows the result. | `demo-isolation` |
| 3 | Free to use. | `legal-and-site-links` |
| 6 | Works offline after the first visit. | `offline-reload` |
| 5 | Runs against loopback by default. | `loopback-guard` |
| 7 | See when incoming telemetry exceeds export capacity. | `classification` |
| 6 | Test evidence, not a capacity guarantee. | scope warning |
| 12 | Use an isolated Collector and repeat with production-shaped samples before changing limits. | safety instruction |
| 10 | Read queue size, consumer count, and batch settings. | `config-inspection` |
| 4 | Templated values remain unknown. | `config-inspection` |
| 9 | Replay JSON requests at increasing rates within fixed safety limits. | `bounded-replay` |
| 9 | Classify each run as stable, backpressure, or drops. | `classification` |
| 9 | The browser model explains queue behavior without contacting your Collector. | `browser-no-network-or-storage` |
| 7 | It does not predict production capacity. | scope warning |
| 9 | Ready. Adjust a setting or show the sample result. | state instruction |
| 14 | Show the result to see whether the queue drains, backs up, or drops items. | `classification` |
| 11 | The Rust binary sends a bounded sample to your local OTLP/HTTP receiver. | `bounded-replay` |
| 5 | It can also read Collector self-metrics. | `classification` |
| 5 | Human output describes the result. | `classification` |
| 4 | Use `--json` in scripts. | `classification` |
| 7 | One native binary, no runtime or account. | `package-and-tests` |
| 5 | Loopback endpoint guard by default. | `loopback-guard` |
| 5 | Never edits the Collector config. | `no-config-write` |
| 15 | See response latency, throughput, non-success responses, and available queue or failure metrics for each rate. | `classification` |
| 14 | Test queue size, consumers, batches, downstream latency, or a narrower range of request rates. | recommendation |
| 15 | The CLI does not store telemetry, generate production-scale traffic, guarantee capacity, or rewrite your configuration. | `no-config-write`, `bounded-replay` |
| 8 | Test bounded telemetry against a Collector you control. | safety instruction |
| 5 | Install command copied to clipboard. | observable feedback |
| 10 | Clipboard access was blocked. Select and copy the command manually. | error and recovery |
| 7 | Modeled queue peak: [peak] of [capacity] items. | `classification` |
| 9 | Arrival stays below modeled export capacity at [percent] utilization. | `classification` |
| 6 | The queue holds the extra items. | `classification` |
| 10 | It needs about [seconds] seconds to drain after arrivals fall. | `classification` |
| 5 | [Count] items exceed the queue. | `classification` |
| 10 | Reduce arrival pressure or fix exporter capacity before raising limits. | recommendation |
| 3 | Model complete: [classification]. | `classification` |
| 7 | Could not run model. Check the inputs. | error and recovery |
| 6 | Demo reset to the bundled sample. | `demo-isolation` |

The 17-word meta description is covered by `bounded-replay` and `classification`:
“Test a bounded telemetry sample against a local Collector and find where requests queue, slow, or drop.”

## Headings and actions

All headings name their section out of context. All actions start with a result-oriented verb.

| Type | Text |
| --- | --- |
| H1 | Find your Collector's pressure threshold |
| Primary action | Try it with sample data |
| H2 | Test one sample at increasing rates |
| H3 | Read Collector settings |
| H3 | Replay bounded requests |
| H3 | Classify the first failure |
| H2 | Model a burst before you run the CLI |
| Form action | Show pressure result |
| H2 | Test your local Collector from the terminal |
| H2 | Know what the result means |
| H3 | Measurements |
| H3 | Suggested next tests |
| H3 | Limits |

## README check

Every prose sentence in `README.md` is 22 words or fewer.
The same banned-word scan returned no matches.
Commands, headings, and option names were excluded from sentence counts.

## Terminology

| Concept | One term used |
| --- | --- |
| Web simulator | browser model |
| Overload boundary | pressure threshold |
| Incoming load | request rate |
| Input | telemetry sample |
| Real workflow | CLI test |
| Classification | stable, backpressure, or drops |
