# Perfection-loop polish 5

Released candidate: `809999e510b963e5cba165c7a059aa5d73e52ec9`

Adversarial review: `c35868bd419f01f105b0f82f15ccbe44267d3bb6`

Product repair: `e1c0ac7`

Verification repair: `b2f289c`

Production: <https://collector-pressure-lab.sociobot.in/>

Every earlier review and polish record was reread. Round 5 fixed F-5-1 through
F-5-5 and rechecked every earlier finding against a clean clone and the cold
production site.

## Common evidence

- [Clean-clone record](evidence/polish-5/clean-clone.txt): all 16 claim commands
  passed independently. The full suite passed 4 Rust unit, 4 CLI contract, 3
  pressure fixture, 1 doctest, 6 Vitest, and 43 Playwright checks. Nine
  duplicate mobile cases were intentionally skipped.
- [Live product check](evidence/polish-5/live/product-check.json): desktop and
  390 × 844 mobile route, metadata, Axe, target, overflow, demo, identity,
  navigation, focus, and offline checks.
- [Required live URL verifier](evidence/polish-5/live/verify.json): correct
  title, language, main landmark, image alternatives, labels, and no console
  errors.
- [Live Lighthouse](evidence/polish-5/live/lighthouse.json): Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; LCP 1.4 s, CLS 0, TBT 40 ms.
- [Artifact hashes and headers](evidence/polish-5/hashes-and-headers.txt): local
  and live files match; immutable hashed assets and security headers are live.
- Screenshots: [mobile first screen](evidence/polish-5/live/first-screen-mobile.png),
  [desktop first screen](evidence/polish-5/live/first-screen-desktop.png),
  [mobile demo](evidence/polish-5/live/demo-mobile.png),
  [query demo](evidence/polish-5/live/demo-query-mobile.png), and
  [mobile 404](evidence/polish-5/live/404-mobile.png).

## Finding closure

| Finding id | Change retained or made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained the verb-led pressure-threshold headline, named OpenTelemetry audience, adjacent sample outcome, and three plain facts on the first screen. | Live first-screen screenshots; route `/`; `@claim:demo-isolation`. |
| F-1-2 | Made `/demo` and `?demo=1` open the same populated sample, use only `demo:` storage, reset exactly, and discard the demo key through every leave path. The CLI demo still writes only to its reported temporary directory. | `@claim:demo-isolation`; live `demo.initial`, `demo.reset`, `queryInitial`, `queryReset`, and `exitPaths` in [product-check.json](evidence/polish-5/live/product-check.json). |
| F-1-3 | Retained `.factory/claims.json`, now with 16 unique claims and exactly one tagged test for each claim. | Manifest parity test; all 16 independent clean-clone claim commands. |
| F-1-4 | Removed the unprovable independence sentence and added a precise browser-identifier claim with an observable test. Every current factual promise is declared or narrowed to scope/instruction. | `@claim:no-request-identifiers`; `@claim:free-to-use`; [claims.json](claims.json); [copy audit](copy-audit.md). |
| F-1-5 | Retained real demo/legal URLs, deterministic deep-link behavior, a styled `/404`, and an HTTP 404 response for unknown paths. | `@claim:legal-and-site-links`; live `/404` is 200 and `/missing-polish-5` is 404 in the live product check. |
| F-1-6 | Retained restrictive same-origin CSP, Permissions Policy, Referrer Policy, and content-type protection. | [Artifact hashes and headers](evidence/polish-5/hashes-and-headers.txt); live URL verifier. |
| F-1-7 | Added the missing 404 `og:url`. Retained distinct plain titles, descriptions, canonical URLs, Open Graph/Twitter metadata, original social art, favicon, touch icon, and manifest on every route. | `@claim:legal-and-site-links`; exact direct and unknown 404 metadata in the live product check. |
| F-1-8 | Retained `robots.txt` and a sitemap containing root, demo, privacy, and terms. | `@claim:legal-and-site-links`; live `/robots.txt` and `/sitemap.xml`. |
| F-1-9 | Retained the shared wordmark, Demo/Privacy/Terms navigation, purpose line, legal links, source label, factory credit, version, and updated `polish-5` build id. | `@claim:legal-and-site-links`; live route crawl. |
| F-1-10 | Retained destination-heading focus and polite announcements for navigation, browser Back, and hash routes. | Live check: Privacy h1, Back `hero-title`, `#cli` `cli-title` at 0.28125 px. |
| F-1-11 | Retained the short-sentence README overview. | [Copy audit](copy-audit.md); no sentence over 22 words. |
| F-1-12 | Retained separate completed-run exit and JSON policy guidance. | [Copy audit](copy-audit.md); `@claim:classification`. |
| F-1-13 | Retained two direct remote-override sentences. | [Copy audit](copy-audit.md); `@claim:loopback-guard`. |
| F-1-14 | Retained separate request-evidence and optional Collector-metrics sentences. | [Copy audit](copy-audit.md); `@claim:classification`; `@claim:collector-metrics`. |
| F-1-15 | Retained **browser model** as the sole web-simulator term. | Copy-audit terminology table; browser tests. |
| F-1-16 | Kept the unexplained tuning-hypothesis phrase out of the hero. | Mobile first-screen screenshot; copy audit. |
| F-1-17 | Retained the direct incoming-telemetry versus export-capacity caption. | Copy audit; live `/`. |
| F-1-18 | Retained three short, verb-led workflow steps. | Copy audit; live `/`. |
| F-1-19 | Retained result wording about the queue draining, backing up, or dropping items. | `@claim:classification`; browser-model checks. |
| F-1-20 | Kept the four flagged abstractions out of visitor and README copy. | Copy audit and full-suite copy scan. |
| F-1-21 | Retained **Try sample pressure test** for the header action. | Live target audit; live `/`. |
| F-1-22 | Retained **Try it with sample data** as the primary action; one click opens a completed sample. | `@claim:demo-isolation`; live demo screenshots. |
| F-1-23 | Retained **Show pressure result** for the form action. | `@claim:browser-no-network-or-storage`; live `/`. |
| F-1-24 | Retained **How the pressure test works**. | Copy audit; live `/`. |
| F-1-25 | Retained **Test one sample at increasing rates**. | Copy audit; live `/`. |
| F-1-26 | Retained **Read Collector config values**, distinguishing the file from extracted values. | `@claim:config-inspection`; copy audit. |
| F-1-27 | Retained **Classify the first failure**. | Copy audit; live `/`. |
| F-1-28 | Retained **Browser queue model**. | Copy audit; live `/`. |
| F-1-29 | Retained **Collector CLI**. | Copy audit; live `/`. |
| F-1-30 | Retained **Test your local Collector from the terminal**. | Copy audit; live `/`. |
| F-1-31 | Retained **What the CLI can and cannot measure**. | Copy audit; live `/`. |
| F-1-32 | Retained **Know what the result means**. | Copy audit; live `/`. |
| F-1-33 | Retained **Measurements**. | Copy audit; live `/`. |
| F-1-34 | Retained **Suggested next tests**. | Copy audit; live `/`. |
| F-1-35 | Retained **Limits**. | Copy audit; live `/`. |
| F-2-1 | Retained at least 44 × 44 px for every visible button and link at both checked viewport sizes. | Empty `smallTargets` for all 14 live route/viewport cases. |
| F-2-2 | Retained the visible and accessible external-site label on the source link. | `@claim:legal-and-site-links`; live footer crawl. |
| F-3-1 | Retained serial claim execution and child-process diagnostics for the timing fixture. | `@claim:threshold-accuracy`; clean-clone full suite. |
| F-3-2 | Retained **bundled sample**, not vague **safe sample**, in the first-screen and CLI wording. | First-screen screenshots; copy audit. |
| F-3-3 | Kept unprovable registry-credential wording removed and packaging wording limited to Cargo evidence. | `@claim:package-and-tests`; `cargo package --allow-dirty`. |
| F-3-4 | Retained **Collector config** for the file and **config values** for extracted values. | `@claim:config-inspection`; copy-audit terminology table. |
| F-4-1 | Retained the explicit `free-to-use` manifest claim and test across all public routes, with no billing, login, or payment-provider path. | `@claim:free-to-use`; all claim commands; live route crawl. |
| F-5-1 | Replaced the invalid 420-value sample with the representable 900/400/1200/10 sample. Initial entry and reset now produce the same complete Drops result: 9,000 received, 1,200 queued, 3,800 dropped, 3 s first pressure. The test asserts every input and result field on both `/demo` and `?demo=1`. | `@claim:demo-isolation`; live `resetMatchesInitial` and `queryResetMatchesInitial` are true. |
| F-5-2 | Demo state is cleared on wordmark, Privacy, browser Back, Start for real, non-demo load, and close/reopen. Real-prefixed storage is never removed. | `@claim:demo-isolation`; live `exitPaths` contains only `real:cplab:sentinel` for Privacy, wordmark, Back, and close/reopen. |
| F-5-3 | Added exact `https://collector-pressure-lab.sociobot.in/404` Open Graph URL to the designed 404. | `@claim:legal-and-site-links`; direct `/404` and unknown route both report the exact URL in the live matrix. |
| F-5-4 | Removed the unlisted OpenTelemetry-independence/endorsement claim from README and Terms. | `@claim:legal-and-site-links` asserts the phrase is absent; clean-clone copy scan. |
| F-5-5 | Replaced the vague identifier sentence with two exact promises and added `no-request-identifiers`. The test inspects request URLs/headers, response cookies, cookies, storage, IndexedDB, and identifier-generating source APIs across the demo flow. | `@claim:no-request-identifiers`; live `requestsAddNoIdentityValues: true`, `cookies: []`. |
| Verification P1 | Retained a complete Drops JSON report for all-503 responses. | `all_503_responses_exit_zero_with_a_complete_json_drop_report`; `@claim:classification`. |
| Verification P2 | Retained immutable caching for content-addressed assets. | Deployment unit test; live header evidence. |
| Verification 2 P1 | Kept deployment-control files out of the worker precache and retained a populated offline demo reload. | Worker install test; live `offline.controlled: true`, `classification: Drops`. |
| Verification 3 P3 | Retained live CSP and Permissions Policy. | Header evidence and required live URL verifier. |

## Release conclusion

The artifact remains one Rust CLI plus its static landing/docs site. The site
keeps the product-specific art-deco transit-poster system recorded in
`design.md`; no generic template or runtime AI feature was added. The CLI job
is deterministic, so AI would add cost and uncertainty without helping the
pressure test. No review finding remains unresolved.
