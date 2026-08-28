# Collector Pressure Lab — review 5 handoff

Work order: `collector-pressure-lab-review-5`

Reviewed source: `809999e510b963e5cba165c7a059aa5d73e52ec9`

Live URL: <https://collector-pressure-lab.sociobot.in/>

## Status: review complete, product FAIL

No product code was changed. The full adversarial review is in
`.factory/review-5.md`.

The first blocker: fresh `/demo` opens with 700/450/1500/8, while **Reset
demo** changes to 900/400/1200/10. The documented sample is 900/420/1200/10;
420 is not representable by the export slider's 50-unit step. The
`demo-isolation` test passes because it checks only the post-reset arrival
rate. This reopens the reset portion of F-1-2 as F-5-1.

The second blocker: demo changes survive navigation through the wordmark or
Privacy and survive closing/reopening the page. Only **Start for real** clears
the key, contrary to the privacy and sandbox leave contract (F-5-2/F-1-2).

The third blocker: the designed 404 and unknown-route document omit `og:url`.
This leaves F-1-7 half-fixed and reopens it as F-5-3.

The fourth blocker: `Collector Pressure Lab is independent of the
OpenTelemetry project` appears in README and Terms without a matching manifest
claim or observable test. This reopens F-1-4 as F-5-4.

The fifth blocker: Privacy says the product adds no identifiers to hosting
requests, but no manifest entry or test inspects identifiers in URLs, headers,
cookies, or browser state. This also reopens F-1-4 as F-5-5.

## Verification performed

- Fresh live Chromium at 390 × 844 and 1440 × 900 for the cold first screen.
- Live one-click demo entry, complete input/reset comparison, real-key
  survival, four leave paths, same-origin request capture, and offline reload.
- `cplab demo` from an empty temporary directory; exit 0, no current-directory
  files, and three expected files in the reported temporary output.
- Every one of the 15 `.factory/claims.json` commands independently in clean
  clone `/tmp/cplab-review5-clean.LIxyAW`; all command exits were 0.
- Full clean-clone `npm test`: 4 Rust unit, 4 CLI contract, 3 pressure fixture,
  1 doctest, 6 Vitest, and 41 Playwright passes; 9 intentional mobile skips.
- Live route/status/metadata/header/footer/link/focus checks; unknown route
  returned the designed HTTP 404.
- Live Axe checks at 390 px and the full local desktop/mobile accessibility
  matrix; no serious or critical issue. Required URL verifier passed with no
  console errors.
- Live/local production JavaScript and CSS hashes match. Built JS is 2,697
  bytes gzip; CSS is 4,367 bytes gzip.

## Next steps

Repair F-5-1 through F-5-5 exactly as specified in the review, add the missing
reset, leave-path, metadata, and privacy assertions, deploy, then rerun the
entire review rather than only the changed checks.
