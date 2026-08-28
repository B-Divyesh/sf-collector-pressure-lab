# Collector Pressure Lab — review 4 handoff

Work order: `collector-pressure-lab-review-4`
Reviewed source: `2c0707cea8d10e46374cf315588e5d8e897024e0`
Live URL: <https://collector-pressure-lab.sociobot.in/>

## Status: review failed

No product code was changed. The review is recorded in
`.factory/review-4.md` and committed with this handoff.

One blocking finding remains: landing copy says `Free to use.`, but
`.factory/claims.json` has no exact pricing claim and no observable test for
the absence of a paid/billing flow. This reopens earlier F-1-4 as F-4-1.

## Verification performed

- Fresh live Chromium checks at 390 × 844 and 1440 × 900: cold first screen,
  one-click demo, reset, exit, route metadata, focus/back/deep link, route
  statuses, links, Axe, console, responsive overflow, and same-origin network
  requests.
- Demo isolation: populated `Drops` result, `demo:cplab:pressure-input`, reset
  to 900 items/s, exit cleanup, ordinary model no storage, and offline reload.
- CLI isolation: `cplab demo` from a fresh temporary directory wrote only its
  reported temporary output directory and left the working directory empty.
- Fresh clone `/tmp/cplab-review4-clean.Mu7dKY`: all 14 commands in
  `.factory/claims.json` passed independently (log:
  `/tmp/cplab-review4-claims.log`). `npm test` also passed: Rust, Vitest,
  build, and 39 Playwright passes with nine intentional duplicate mobile skips.

## Next step

Add an exact `free-to-use` manifest entry and one tagged clean-state test that
asserts no paid tier, payment/login CTA, price, billing request, or billing
runtime on the public product. Then rerun all manifest commands and `npm test`.
