# Collector Pressure Lab

Collector Pressure Lab tests when a local OpenTelemetry Collector queues, slows, or drops telemetry.
It is for operators checking queue, batch, or exporter config values before a production change.

The CLI reads Collector YAML and replays a bounded JSON or NDJSON sample.
It increases request rates, reads optional metrics, and reports the first pressure threshold.
It never edits the Collector config.

Try the isolated sample at <https://collector-pressure-lab.sociobot.in/demo>.
Synthetic results do not predict production capacity.
Run each CLI test against an isolated Collector, never a production endpoint.

## Install

Build the single binary with stable Rust:

```sh
cargo install --path .
cplab --help
```

Prepare the publishable source package without publishing it:

```sh
cargo package
```

Version 0.1.0 can be packaged from this repository with Cargo.

## Try the bundled sample

Run the bundled sample with one command:

```sh
cplab demo
```

The command copies the bundled Collector config and telemetry sample into a temporary directory.
It starts a temporary loopback receiver, runs the pressure test, and writes `report.json` beside the copied inputs.
The final output prints that directory.

The web demo uses separate `demo:` browser storage.
Use **Reset demo** to restore its sample or **Start for real** to remove demo data.
Leaving the demo through another site link also removes its data.
See [.factory/demo.md](.factory/demo.md) for the full sandbox contract.

## Test a Collector

Start an isolated Collector with an OTLP/HTTP receiver.
Then replay an OTLP JSON payload or newline-delimited JSON bodies:

```sh
cplab run \
  --config ./examples/collector.yaml \
  --sample ./examples/traces.ndjson \
  --endpoint http://127.0.0.1:4318/v1/traces \
  --rates 25,50,100,200 \
  --duration 2s
```

Each non-empty NDJSON line becomes one request.
A regular JSON file becomes one request body.
The CLI loads at most 8 MiB or 10,000 records.
Each rate step has time, request, and concurrency limits.

The CLI checks `http://127.0.0.1:8888/metrics` by default.
Pass `--metrics-endpoint off` when Collector self-metrics are unavailable.

Use machine-readable output in scripts:

```sh
cplab run --config collector.yaml --sample sample.json \
  --rates 100,200 --duration 1s --json --ci
```

`--ci` returns a non-zero code when the test cannot run.
A completed run exits 0, even when every HTTP response is non-2xx.
Use the JSON classification field for policy decisions.

Exit codes:

- `0`: test completed
- `2`: argument, input, safety, or config error
- `3`: no HTTP response could be measured

Use `--header 'name:value'` when a local receiver requires metadata.
Remote hosts are rejected by default.
Use `--allow-remote` only on a controlled test network.
The CLI warns you and sends samples only to the endpoint you choose.

## Inspect Collector config

Read Collector config values without sending traffic:

```sh
cplab inspect --config ./examples/collector.yaml
cplab inspect --config ./examples/collector.yaml --json
```

The parser reads these Collector queue and batch config values:

- `sending_queue.enabled`
- `sending_queue.queue_size`
- `sending_queue.num_consumers`
- `batch.send_batch_size`
- `batch.send_batch_max_size`
- `batch.timeout`

Unknown or templated values are reported, not guessed.

## Understand classification

At each rate, the CLI records attempts, responses, drops, latency, and throughput.
When available, it reads Collector queue, refusal, and failure counters.

The first step with failures or refusals is **drops**.
Rising latency, queue growth, or lower throughput is **backpressure**.
Otherwise the result is **stable**.
The threshold uses the lowest pressured step and measured successful throughput.

The CLI tests at the Collector's OTLP/HTTP input.
It cannot see memory spikes or downstream throttling outside the test window.
It cannot read queue state when self-metrics are off.
Suggested config values are next tests, not automatic config changes.

## Run the site

The site documents the CLI and includes a browser model.
The browser model works offline after the first visit and does not contact a Collector.

```sh
npm ci
npm run dev
npm run build:site    # output: dist/site
```

## Test and package

```sh
npm test
npm run test:claims
cargo clippy --all-targets --all-features -- -D warnings
cargo package
```

The CLI integration suite includes a controlled slow receiver.
See [.factory/claims.json](.factory/claims.json) for the declared claim tests.

## Privacy and scope

The site sends no analytics or third-party runtime requests.
Outside demo mode, the browser model stores no inputs.
The CLI creates no persistent telemetry copy. It connects only to the test and metrics endpoints you choose.
Read the [privacy](https://collector-pressure-lab.sociobot.in/privacy/) and [terms](https://collector-pressure-lab.sociobot.in/terms/) pages.

## License

This project uses the [MIT License](LICENSE).
