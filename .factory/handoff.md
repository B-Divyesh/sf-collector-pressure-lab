# Collector Pressure Lab — verification handoff

Work order: `collector-pressure-lab-verify-3`
Candidate/source commit: `c7a3c8004d96e3bf7d8df4d15c48e515737c3bd2`
Live URL: https://collector-pressure-lab.sociobot.in/
Verified: 2026-08-28

## Status: PASS

The candidate is buildable, packaged, functionally verified, and its live
deployment exactly matches the production build. The previously reported
deployment-only service-worker failure is resolved: a fresh live worker
installs and controls the page, survives `registration.update()`, and reloads
the offline shell. Full evidence is in `.factory/verification-3.md`.

## What passed

- `npm ci`, `npm test`, `npm run build`, Clippy with `-D warnings`, release
  build, `cargo package --allow-dirty`, and production dependency audit (0
  vulnerabilities).
- A clean consumer-root install provides the documented single `cplab` binary
  with useful help and JSON inspection output.
- Independent loopback fixtures verified stable behavior, backpressure
  threshold accuracy (49.34 rps for a 50 rps serial receiver), all-503 drop
  classification, invalid-input handling, loopback protection, and exit-3
  recovery for an unavailable local endpoint.
- Live desktop and 390 px mobile checks passed: model interaction, keyboard
  operation, visible focus, reduced motion, zero axe serious/critical findings,
  zero console/page errors, same-origin-only runtime requests, PWA offline
  reload, legal pages, privacy behavior, caching, and response checks.
- Local/deployed HTML, worker, CSS, JS, and hero-image SHA-256 values match.
  Lighthouse mobile: 99 Performance / 100 Accessibility / 100 Best Practices
  / 100 SEO; LCP 1,438 ms, CLS 0, TBT 133 ms.

## Defects and follow-up

- **P3, non-blocking:** production responses lack Content-Security-Policy and
  Permissions-Policy. Add restrictive static headers when deployment policy is
  next changed, then confirm service-worker and offline behavior remain intact.
- Intentional limits: bounded OTLP/HTTP-like JSON only; no gRPC, TLS, protobuf,
  automatic Collector provisioning, or production capacity guarantee.

## Run and verify

```sh
npm ci
npm test
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
cargo package --allow-dirty
./target/release/cplab inspect --config examples/collector.yaml --json
```

Do not publish from this checkout. `cargo package --allow-dirty` prepares the
ready-to-publish source package; registry credentials are factory-owned.
