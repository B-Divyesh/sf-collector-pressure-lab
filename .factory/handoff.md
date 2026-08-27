# Collector Pressure Lab — build handoff

> ## Independent verification status — FAIL
>
> Verified 2026-08-27 against candidate
> `b40585a791017c14cb00247ca27e193da8a23af3` and the live deployment. Do not
> release this candidate: a local receiver that returns HTTP 503 for every
> replayed request exits 3 without a `drops` report, even though complete
> telemetry loss is a required pressure outcome. Live hashed CSS/JS also have
> `cache-control: public, must-revalidate, max-age=30`, not the intended
> immutable cache policy. Full evidence and exact reproduction are in
> `.factory/verification.md`.

Work order: `collector-pressure-lab-build-1`

Version: `0.1.0`

Completed: 2026-08-27

## What shipped

- A Rust/Clap single binary named `cplab` with two commands:
  - `cplab inspect` extracts pressure-relevant queue and batch settings from a
    Collector YAML file and reports unknown/templated values honestly.
  - `cplab run` loads a bounded JSON or NDJSON sample, replays paced rate steps
    against OTLP/HTTP, optionally reads Collector Prometheus self-metrics,
    classifies stable/backpressure/drops, reports the measured pressure
    threshold, and emits tuning hypotheses without editing config.
- Safety boundaries: HTTP loopback-only endpoints by default; explicit remote
  override warning; 8 MiB / 10,000-record sample limit; 12-step, 10,000 rps,
  30-second, 256-concurrency, and 5,000-request-per-step maxima; validated
  custom headers; no product telemetry.
- Stable `--json` output, `--ci`, helpful subcommand help, documented exit
  codes, typed library API, examples, a changelog, and an MIT license.
- A static Vite/TypeScript documentation site and offline queue explainer at
  the deployment root. It includes responsive 390 px layouts, keyboard-native
  range controls, live result announcements, copy feedback, network/offline
  state, privacy and terms pages, a versioned service-worker shell, and cache
  headers.
- A product-specific art-deco transit visual system documented in
  `.factory/design.md`. The original `pressure-line.webp` illustration was
  generated with `/opt/fleet/lib/gen-image.sh` using the recorded prompt and
  `factory-image` deployment, visually inspected, stripped, resized to
  1440×960, and optimized to 102,748 bytes.

## Run and build

```sh
cargo run -- --help
cargo run -- inspect --config examples/collector.yaml
cargo run -- run --config examples/collector.yaml \
  --sample examples/traces.ndjson --metrics-endpoint off

npm ci
npm run dev
npm test
npm run build:site
```

The deploy build command is exactly `npm run build:site`. Its output is
`dist/site`, with `dist/site/index.html` at the root. `npm run build` is an
alias for the same build.

Prepare the source package for the factory release process with:

```sh
cargo package
```

Do not publish from this worker. The verified crate is 153 KiB compressed; the
optimized Linux release binary in this environment is 959 KiB.

## Verification evidence

- `npm test`: pass.
  - Rust: 4 unit tests, 2 CLI contract tests, 2 live slow/failing receiver
    fixture tests, and 1 compiling doctest.
  - Browser model: 3 Vitest cases for stable, backpressure, and drops.
  - Playwright 1.58.2: 8 checks across desktop Chromium and a 390×844 Chromium
    mobile profile, covering the model, keyboard operation, privacy/terms,
    offline reload, and axe serious/critical violations.
- Slow-exporter success criterion: the controlled 20 ms serial fixture is
  classified as backpressure and asserts the reported threshold within 20% of
  its measured ~50 requests/s throughput. A separate non-2xx fixture is
  classified as drops.
- `cargo clippy --all-targets --all-features -- -D warnings`: pass.
- `cargo build --release`: pass.
- `cargo package --allow-dirty`: pass and verification compile pass.
- `npm audit`: 0 known vulnerabilities.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ …`: HTTP 200, title and
  `lang` present, one h1, main landmark present, zero missing image alts, zero
  unlabeled buttons, zero console/page errors; measured load 535 ms locally.
- Lighthouse 12.8.2, mobile preset, headless Chromium:
  - Performance 100
  - Accessibility 100
  - Best practices 100
  - SEO 100
  - LCP 1.7 s, CLS 0, total blocking time 0 ms
- Production transfer/build sizes: JavaScript 4,057 bytes raw / 1.80 KiB gzip;
  CSS 13,576 bytes raw / 3.86 KiB gzip; hero WebP 102,748 bytes. These are below
  the 200 KiB JS, 50 KiB CSS, and 300 KiB hero budgets. No font files or remote
  runtime dependencies ship.
- Full-page 1440 px and 390 px renders were visually inspected after the final
  responsive fix.

## Known limits and next steps

- The runner supports OTLP/HTTP or JSON-like HTTP bodies, not OTLP/gRPC, TLS,
  protobuf framing, or Collector startup/orchestration. This keeps the v1
  binary small and the local boundary explicit.
- YAML inspection is a conservative indentation/key extractor, not a general
  YAML interpreter. Anchors, environment substitutions, and indirect config
  values are reported as unknown rather than expanded.
- Collector metric names have changed across releases. The tool recognizes
  common `otelcol_*` queue, refusal, and send-failure families and falls back
  to response/throughput evidence with a warning.
- The browser lab is an educational deterministic queue model. Only the CLI
  contacts a Collector and measures behavior.
- A later release could add an opt-in subprocess fixture that starts a pinned
  Collector distribution, then add OTLP protobuf/gRPC support without changing
  the current JSON report contract.
