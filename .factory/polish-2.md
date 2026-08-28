# Perfection-loop polish 2

Source repaired from `868ec12fd77d671ecb844cbca21cbd882ef5c251` after reading `review-1.md`, `review-2.md`, and every earlier verification and handoff record. There were no earlier `polish-*.md` files.

Live URL: <https://collector-pressure-lab.sociobot.in/>

## Finding closure

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Replaced the metaphorical hero with “Find your Collector's pressure threshold,” named OpenTelemetry operators, added one sample action with its outcome, and placed three facts above 675 px at 390 px. | `opens the isolated sample in one click with a complete result`; [mobile first screen](evidence/local/first-screen-mobile.png); live `/` cold check at 390 px. |
| F-1-2 | Added populated `/demo` and `/?demo=1` entry points, a persistent banner, reset and exit controls, `demo:` storage isolation, `cplab demo`, shipped sample copies, temporary output, and a terminal recording. | `@claim:demo-isolation`; [live query demo](evidence/live/demo-query-mobile.png); live `/demo` and `/?demo=1` both show `Drops`. |
| F-1-3 | Added `.factory/claims.json` with 12 unique ids and independently runnable commands. | Manifest/schema check and 12 independent clean-clone commands passed. |
| F-1-4 | Rewrote unsupported copy and covered offline, privacy, safety, replay, inspection, classification, writes, packaging, runtime, legal, demo, and accuracy claims. | All `@claim:*` tests in `site/tests/claims.spec.ts`; clean-clone results recorded below. |
| F-1-5 | Added built `/demo` and styled `/404`; unknown paths now return 404. Added deterministic hash scrolling and focus. | `serves a real 404 and complete route metadata`; `focuses and aligns deep links after layout`; [live route report](evidence/live/routes-accessibility.json). |
| F-1-6 | Added restrictive CSP and Permissions Policy through Static Web Apps configuration and `_headers`. | `publishes restrictive security policies and real route handling`; live headers on `/`, `/demo`, `/privacy/`, `/terms/`, and `/sw.js`. |
| F-1-7 | Replaced the root title and added route-specific canonical, Open Graph, Twitter, 1200×630 art, and 180 px touch-icon metadata. | `@claim:legal-and-site-links`; live titles in [route report](evidence/live/routes-accessibility.json). |
| F-1-8 | Added `sitemap.xml` for all public routes and referenced it from `robots.txt`. | `@claim:legal-and-site-links`; live `/sitemap.xml` and `/robots.txt` return 200. |
| F-1-9 | Standardized wordmark, Demo/Privacy/Terms navigation, one-liner, factory credit, build id, and source link across all routes. | `@claim:legal-and-site-links`; live crawl of `/`, `/demo`, `/privacy/`, `/terms/`, and `/404`. |
| F-1-10 | Focuses the new h1 on full-route navigation and back, focuses hash headings, and announces changes in a polite live region. | `moves focus on full navigation and browser back`; `focuses and aligns deep links after layout`; live `#cli` top `-0.15625`, active `cli-title`. |
| F-1-11 | Split the 34-word README overview into short sentences. | `.factory/copy-audit.md`; banned/long-sentence scan. |
| F-1-12 | Split completed-run exit behavior from JSON policy guidance. | `.factory/copy-audit.md`; `@claim:classification`. |
| F-1-13 | Rewrote remote override guidance as two direct sentences. | `.factory/copy-audit.md`; `@claim:loopback-guard`. |
| F-1-14 | Split the metric list into request evidence and optional Collector metrics. | `.factory/copy-audit.md`; `@claim:classification`. |
| F-1-15 | Uses “browser model” consistently and states offline behavior separately. | Terminology table in `.factory/copy-audit.md`; copy scan. |
| F-1-16 | Replaced “tuning hypothesis” hero wording with a direct next-action promise. | Hero copy audit; [mobile first screen](evidence/local/first-screen-mobile.png). |
| F-1-17 | Rewrote the figure caption as “See when incoming telemetry exceeds export capacity.” | `.factory/copy-audit.md`; live `/`. |
| F-1-18 | Rewrote all three workflow steps as short verb-led instructions. | `.factory/copy-audit.md`; live `/`. |
| F-1-19 | Rewrote result copy as queue drains, backs up, or drops items. | `@claim:classification`; live browser-model result. |
| F-1-20 | Removed “local-first,” “directional,” “pressure-relevant,” and “HTTP boundary experiment” from visitor and README copy. | Repository copy scan; `.factory/copy-audit.md`. |
| F-1-21 | Replaced “Open lab” with “Try sample pressure test.” | Live shared header; target-size test. |
| F-1-22 | Replaced the hero action with “Try it with sample data” and made it open a completed demo. | `@claim:demo-isolation`; [live mobile demo](evidence/live/demo-390.png). |
| F-1-23 | Replaced “Run the model” with “Show pressure result.” | `@claim:browser-no-network-or-storage`; live `/`. |
| F-1-24 | Replaced “The route” with “How the pressure test works.” | Heading audit in `.factory/copy-audit.md`. |
| F-1-25 | Replaced the jargon heading with “Test one sample at increasing rates.” | Heading audit; live `/`. |
| F-1-26 | Replaced “Read the controls” with “Read Collector settings.” | Heading audit; live `/`. |
| F-1-27 | Replaced “Mark the pressure line” with “Classify the first failure.” | Heading audit; live `/`. |
| F-1-28 | Replaced “Offline explainer” with “Browser queue model.” | Terminology audit; live `/`. |
| F-1-29 | Replaced “The real experiment” with “Collector CLI.” | Heading audit; live `/`. |
| F-1-30 | Replaced the terminal metaphor with “Test your local Collector from the terminal.” | Heading audit; live `/`. |
| F-1-31 | Replaced “Know the boundary” with “What the CLI can and cannot measure.” | Heading audit; live `/`. |
| F-1-32 | Replaced “Small on purpose” with “Know what the result means.” | Heading audit; live `/`. |
| F-1-33 | Replaced “It measures” with “Measurements.” | Heading audit; live `/`. |
| F-1-34 | Replaced “It suggests” with “Suggested next tests.” | Heading audit; live `/`. |
| F-1-35 | Replaced “It does not” with “Limits.” | Heading audit; live `/`. |
| F-2-1 | Gave every visible link and button a minimum 44×44 px hit area, including wordmark, CLI, Terms, and demo controls. | `keeps every visible link and button at least 44 by 44 CSS pixels`; live check returned `sizes: []`. |
| F-2-2 | Relabeled the external link “Source on GitHub (opens external site)” on every route. | `@claim:legal-and-site-links`; live footer crawl. |

## Earlier verification regression checks

| Earlier finding | Evidence |
| --- | --- |
| Verification P1: all-503 responses lost the drop report | Rust `all_503_responses_exit_zero_with_a_complete_json_drop_report` and `@claim:classification` pass. |
| Verification P2: immutable caching absent | Live hashed CSS returns `public, max-age=31536000, immutable`. |
| Verification 2 P1: worker precached deployment config | Service-worker install/offline tests pass; live worker controls and reloads `/demo` offline. |
| Verification 3 P3: CSP and Permissions Policy absent | Both policies are present on every checked live response. |

## Verification evidence

- Clean clone: every command in `.factory/claims.json` ran independently; all 12 passed.
- Full local suite: 4 Rust unit, 4 CLI contract, 3 pressure fixture, 1 doctest, 5 Vitest, and 35 Playwright cases passed; 7 duplicate mobile CLI cases were intentionally skipped.
- Live routes: all seven routes at 1440×900 and 390×844 have zero axe violations and zero horizontal overflow. Unknown paths return 404.
- Live valid-route console errors: zero. Live browser requests during the full demo flow: same-origin only.
- Live offline: active service-worker controller, successful offline reload, persistent demo banner, and `Drops` result.
- Live Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 96, SEO 100; LCP 1.4 s, CLS 0, TBT 100 ms.
- Production payloads: JS 6.38 KB raw / 2.69 KB gzip; CSS 15.86 KB raw / 4.33 KB gzip; no fonts.
- Local screenshots: [first screen](evidence/local/first-screen-mobile.png), [demo desktop](evidence/local/demo-desktop.png), [demo mobile](evidence/local/demo-mobile.png), [404](evidence/local/404-mobile.png).
- Live screenshots: [demo desktop](evidence/live/demo-1440.png), [demo mobile](evidence/live/demo-390.png), [query demo](evidence/live/demo-query-mobile.png).

No review finding remains open.
