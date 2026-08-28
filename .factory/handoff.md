# Collector Pressure Lab — review 6 handoff

Work order: `collector-pressure-lab-review-6`
Reviewed source: `118d2ab971526bd9a19225fbeeba8aaf4d2247ba`
Live URL: <https://collector-pressure-lab.sociobot.in/>

## Status

Review 6 is **PASS** with zero findings. No product code was changed. The full
review, including the complete landing/README copy ledger, independent claims
results, live browser evidence, and one-by-one history verification, is in
[review-6.md](review-6.md).

## Verification performed

- Opened the deployed root cold at 390 × 844 and 1440 × 900 before scrolling.
- Exercised the one-click browser demo, all four demo inputs/reset result,
  isolation, wordmark/Privacy/Back/close exits, ordinary browser storage,
  same-origin request interception, and offline service-worker reload.
- Ran `target/debug/cplab demo` from an empty temporary current directory;
  it wrote only to a reported temporary output directory.
- Ran `npm test`: 4 Rust unit, 4 CLI contract, 3 pressure-fixture, 1 doctest,
  6 Vitest, and 43 Playwright tests passed; 9 intentional duplicates skipped.
- Ran every one of the 16 listed `npm run test:claims -- --grep @claim:<id>`
  commands independently after `npm ci`; all passed.
- Checked live route metadata, 404 status/design, focus/announcements, Back,
  hash routing, links, headers, sitemap, and visual identity. Live Axe at 390
  px found zero violations on home, demo, Privacy, Terms, and 404.

## Run again

```sh
npm ci
npm test
npm run test:claims
npm run build:site
cargo run -- demo
```

Open the web demo at `/demo` after starting the local preview used by the
Playwright configuration.

## Known gaps and next steps

None found in this review. The intentional limit remains: a bounded synthetic
test is evidence for a next test, not a production-capacity guarantee.
