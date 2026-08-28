# Changelog

All notable changes follow Keep a Changelog. This project uses semantic
versioning beginning at 0.1.0.

## [Unreleased]

### Fixed

- Added isolated end-to-end claim evidence for Collector self-metrics and CLI data boundaries.
- Serialized timing-sensitive browser claim checks and retained child-process diagnostics on failure.
- Replaced vague demo and packaging copy with tested, consistent Collector config terms.

## [0.1.0] - 2026-08-27

### Added

- Bounded OTLP/HTTP and JSON-line replay against loopback Collectors.
- Pressure classification from responses, latency, throughput, and optional
  Collector self-metrics.
- Collector YAML inspection and tuning hypotheses.
- JSON output, documented exit codes, fixtures, and offline browser model.
