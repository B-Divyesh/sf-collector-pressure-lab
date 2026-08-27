# Collector Pressure Lab

Collector Pressure Lab is a local-first CLI for OpenTelemetry operators who
want evidence before changing queue, batch, or exporter settings in production.
It reads a Collector YAML file, replays a bounded JSON or NDJSON sample against
a loopback OTLP/HTTP endpoint at stepped rates, samples optional Collector
self-metrics, classifies the first pressure threshold, and prints tuning
hypotheses. It never edits the configuration.

Documentation and the offline model: https://collector-pressure-lab.sociobot.in

Synthetic results are directional, not production capacity guarantees. Run the
lab against an isolated local Collector, never a production endpoint.

## Install

Build the single binary with stable Rust:

```sh
cargo install --path .
cplab --help
```

For a release artifact without installing it:

```sh
cargo build --release
./target/release/cplab --help
```

Version 0.1.0 supports Linux, macOS, and Windows anywhere stable Rust runs.
Factory release credentials are not included; `cargo package` prepares the
publishable source package.

## Usage

Start an isolated Collector configured with an OTLP/HTTP receiver. Then replay
an OTLP JSON payload or newline-delimited JSON bodies:

```sh
cplab run \
  --config ./examples/collector.yaml \
  --sample ./examples/traces.ndjson \
  --endpoint http://127.0.0.1:4318/v1/traces \
  --rates 25,50,100,200 \
  --duration 2s
```

Each non-empty NDJSON line is sent as one request. A regular JSON file is sent
as one request body. The sample is loaded once and capped at 8 MiB and 10,000
records. Each rate step is time- and request-bounded. By default, the CLI also
tries `http://127.0.0.1:8888/metrics`; use `--metrics-endpoint off` when
Collector self-metrics are unavailable.

Machine-readable output and CI mode:

```sh
cplab run --config collector.yaml --sample sample.json \
  --rates 100,200 --duration 1s --json --ci
```

`--ci` disables status animation and returns a non-zero exit code when the run
cannot be performed. A completed run exits 0 even when it discovers pressure;
the JSON `classification` field is intended for policy decisions. Exit codes:

- `0`: experiment completed
- `2`: arguments, input, safety check, or configuration error
- `3`: every request failed, so no threshold could be measured

Use `--header 'name:value'` for a local test receiver that requires metadata.
Remote hosts are rejected. `--allow-remote` exists for controlled lab networks
and prints an explicit warning; samples still remain on the operator's machine
except for requests sent to the chosen endpoint.

Inspect config-derived settings without sending traffic:

```sh
cplab inspect --config ./examples/collector.yaml
cplab inspect --config ./examples/collector.yaml --json
```

The parser intentionally extracts only pressure-relevant Collector settings:
`sending_queue.enabled`, `sending_queue.queue_size`, `sending_queue.num_consumers`,
`batch.send_batch_size`, `batch.send_batch_max_size`, and `batch.timeout`.
Unknown or templated values are reported, not guessed.

## How classification works

At each offered rate, the lab records attempts, successful responses, transport
errors/non-2xx drops, response latency, achieved request throughput, and deltas
from common `otelcol_*` queue/refusal/failure counters when metrics are exposed.
The first step with explicit failures/refusals is **drops**. A step with rising
latency, exporter queue growth, or materially lower achieved throughput is
**backpressure**. Otherwise it is **stable**. The reported threshold is the
lowest pressured step and is refined from observed successful throughput.

This is an HTTP boundary experiment. It cannot see memory spikes, downstream
backend throttling outside the run window, or queue state when Collector
self-metrics are disabled. Tuning output is a hypothesis to validate, not an
automatic configuration change.

## Site and browser model

The landing page documents the CLI and includes an entirely offline queue
model. The model explains likely behavior but does not contact a Collector.

```sh
npm ci
npm run dev
npm run build:site    # output: dist/site
```

## Test and verify

```sh
cargo test
npm test
npm run build
cargo package --allow-dirty
```

`npm test` runs Rust tests plus the site unit and browser tests. The documented
examples are covered by CLI integration tests, including a controlled slow
receiver fixture.

## Privacy and scope

There is no telemetry, analytics, account, upload, local storage, or runtime
third-party request. CLI inputs stay local unless their bounded request bodies
are sent to the endpoint you provide. See the site privacy and terms pages.

Collector Pressure Lab is independent of the OpenTelemetry project. It reads
configuration keys and public self-metric names but bundles no OpenTelemetry
source or assets.

## License

MIT. See [LICENSE](LICENSE).
