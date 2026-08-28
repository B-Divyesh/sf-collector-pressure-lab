# Collector Pressure Lab — review 3 handoff

Work order: `collector-pressure-lab-review-3`

Reviewed source: `d44c5c9cf8ef9d542a5079ae071f610bf811b6ba`

Live URL: <https://collector-pressure-lab.sociobot.in/>

Completed: 2026-08-28

## Status: review complete, product verdict FAIL

No product code was modified. The full adversarial report is
`.factory/review-3.md`.

## What was verified

- Cold 390 × 844 and 1440 × 900 first screens.
- One-click web demo, populated result, reset, exit, storage isolation, offline
  reload, network boundary, and CLI temporary-directory demo.
- All 12 `.factory/claims.json` commands independently in a clean clone.
- Full `npm test`, Clippy with warnings denied, production build, package claim,
  and production dependency audit.
- Live routes, titles, metadata, 404 status/design, deep links, Back/focus,
  crawl, touch targets, Axe, reduced motion, headers, cache policy, and worker.
- Every earlier review, polish, verification, and handoff finding in live code
  and source.
- Every landing-page and README sentence, heading, action, term, and claim.

## Result

- Blocking F-3-1: `npm test` intermittently failed the tagged
  `@claim:threshold-accuracy` case. One clean-clone run failed; its immediate
  rerun and a separate fresh-clone run passed.
- Blocking reopened F-1-4: several self-metrics, CLI privacy, packaging,
  `--ci`, test-composition, licensing-boundary, and quantitative statements
  are not fully represented and observably asserted by the claims manifest.
- Minor F-3-2 through F-3-4: vague “safe sample” copy, factory-internal
  credential jargon, and inconsistent config terminology.

## Verification commands

```sh
npm ci
npm run test:claims -- --grep @claim:<id>
npm test
cargo clippy --all-targets --all-features -- -D warnings
npm audit --omit=dev
```

The 12 independent claim commands passed. `npm test` passed on two runs and
failed on one run as described above. Clippy passed, audit reported zero
vulnerabilities, and `dist/site` was produced.

## Next steps

Stabilize the threshold claim under the full suite, make child-process failure
output visible, then map or remove every claim listed under F-1-4. Apply the
three copy rewrites and rerun review 3 from a fresh clone and fresh browser
contexts.
