# Perfection-loop polish 4

Base release: `2c0707cea8d10e46374cf315588e5d8e897024e0`  
Adversarial review: `a3f7acd8ddbc1e99111904e182fa0c7b9837c93a`  
Repair commit: `01b34eedc57c5a74cee94649540ed122dfc8c300`  
Production check: <https://collector-pressure-lab.sociobot.in/>

This round reread every `review-*.md`, `polish-*.md`, and verification record. The sole current defect was F-4-1, which reopened F-1-4. The shipped product was rechecked rather than trusting prior status labels.

## Common evidence

- **Clean clone:** `/tmp/cplab-polish4-clean.PG89Ev`, `npm ci`, then all 15 `.factory/claims.json` commands independently. Every command passed.
- **Full suite:** `npm test` passed: 4 Rust unit, 4 CLI contract, 3 pressure-fixture, 1 doctest, 6 Vitest, and 50 Playwright checks. `cargo fmt --check`, strict Clippy, and `cargo package --allow-dirty` passed.
- **Live:** [product-check.json](evidence/polish-4/live/product-check.json) records both 390 × 844 and 1440 × 900 checks for titles, metadata, routes, 404, CSP, Permissions Policy, zero Axe violations, target sizes, focus, demo isolation, same-origin requests, and offline reload. [verify.json](evidence/polish-4/live/verify.json) is the required URL-verifier result. [lighthouse.json](evidence/polish-4/live/lighthouse.json) reports 100/100/100/100 with 1.35 s LCP, CLS 0, and TBT 0.
- **Screenshots:** [first screen, mobile](evidence/polish-4/live/first-screen-mobile.png), [first screen, desktop](evidence/polish-4/live/first-screen-desktop.png), [demo, mobile](evidence/polish-4/live/demo-mobile.png), [demo, desktop](evidence/polish-4/live/demo-desktop.png), [query demo, mobile](evidence/polish-4/live/demo-query-mobile.png), [query demo, desktop](evidence/polish-4/live/demo-query-desktop.png).

## Finding closure

| Finding id | Change retained or made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the plain first screen: Collector threshold headline, named OpenTelemetry audience, sample action with outcome, and three facts. | Live mobile facts end at 752 px of 844 px in [product-check.json](evidence/polish-4/live/product-check.json); first-screen screenshots; live `/`. |
| F-1-2 | Kept populated `/demo` and `?demo=1`, persistent banner, reset/exit, `demo:` namespace, and `cplab demo` temporary output. | `@claim:demo-isolation`; live demo and query-demo screenshots; live `/demo` and `/?demo=1`. |
| F-1-3 | Kept the manifest and one tagged test per declared claim; it now has 15 unique claims. | Deployment manifest-parity unit test; all 15 clean-clone commands. |
| F-1-4 | Added the missing price claim and test, so every current landing, legal, README, and CLI factual promise is declared or narrowed to instruction/scope. | `@claim:free-to-use`; [claims.json](claims.json); [copy audit](copy-audit.md). |
| F-1-5 | Kept real demo/legal URLs, styled `/404`, actual missing-route 404, and deterministic deep-link focus/alignment. | `@claim:legal-and-site-links`; [product-check.json](evidence/polish-4/live/product-check.json); live `/missing-polish-4` returns 404. |
| F-1-6 | Kept the restrictive same-origin CSP and Permissions Policy on live responses. | [product-check.json](evidence/polish-4/live/product-check.json); live `/`, `/demo`, `/privacy/`, `/terms/`. |
| F-1-7 | Kept plain route titles, descriptions, canonical URLs, Open Graph/Twitter card data, social art, favicon, and touch icon. | `@claim:legal-and-site-links`; live route metadata in [product-check.json](evidence/polish-4/live/product-check.json). |
| F-1-8 | Kept `robots.txt` and the sitemap for root, demo, privacy, and terms. | `@claim:legal-and-site-links`; live `/robots.txt` and `/sitemap.xml`. |
| F-1-9 | Kept shared header/footer navigation, product line, legal links, source label, Param Factory credit, version, and `polish-4` build id. | `@claim:legal-and-site-links`; live route audit. |
| F-1-10 | Kept route-heading focus/live announcement for full navigation, browser Back, and hash routes. | [product-check.json](evidence/polish-4/live/product-check.json): Privacy h1, Back `hero-title`, and hash `cli-title`; live `/#cli`. |
| F-1-11 | Kept the README overview split into short sentences. | [copy audit](copy-audit.md), maximum 22 words. |
| F-1-12 | Kept completed-run exit behavior separate from JSON guidance. | [copy audit](copy-audit.md); `@claim:classification`. |
| F-1-13 | Kept remote-override guidance as two direct sentences. | [copy audit](copy-audit.md); `@claim:loopback-guard`. |
| F-1-14 | Kept request measurements separate from optional Collector metrics. | [copy audit](copy-audit.md); `@claim:classification`; `@claim:collector-metrics`. |
| F-1-15 | Kept **browser model** as the only web-simulator term. | [copy audit terminology](copy-audit.md); browser suite. |
| F-1-16 | Kept the unexplained tuning-hypothesis hero phrase removed. | [first-screen-mobile.png](evidence/polish-4/live/first-screen-mobile.png); live `/`. |
| F-1-17 | Kept the illustration caption’s direct incoming-versus-export-capacity wording. | [copy audit](copy-audit.md); live `/`. |
| F-1-18 | Kept all three workflow steps short and verb-led. | [copy audit](copy-audit.md); live `/`. |
| F-1-19 | Kept result copy about queues draining, backing up, or dropping items. | `@claim:classification`; browser-model checks. |
| F-1-20 | Kept the previously abstract terms out of visitor and README copy. | [copy audit](copy-audit.md); copy scan in full suite. |
| F-1-21 | Kept the header action as **Try sample pressure test**. | Live target audit; live `/`. |
| F-1-22 | Kept **Try it with sample data** as the primary action, opening a completed demo in one click. | `@claim:demo-isolation`; demo screenshots; live `/demo`. |
| F-1-23 | Kept the form action as **Show pressure result**. | `@claim:browser-no-network-or-storage`; live `/`. |
| F-1-24 | Kept **How the pressure test works** as the method eyebrow. | [copy audit](copy-audit.md); live `/`. |
| F-1-25 | Kept **Test one sample at increasing rates** as the method heading. | [copy audit](copy-audit.md); live `/`. |
| F-1-26 | Kept **Read Collector config values**, distinguishing file from extracted values. | `@claim:config-inspection`; [copy audit](copy-audit.md). |
| F-1-27 | Kept **Classify the first failure**. | [copy audit](copy-audit.md); live `/`. |
| F-1-28 | Kept **Browser queue model**. | [copy audit](copy-audit.md); live `/`. |
| F-1-29 | Kept **Collector CLI**. | [copy audit](copy-audit.md); live `/`. |
| F-1-30 | Kept **Test your local Collector from the terminal**. | [copy audit](copy-audit.md); live `/`. |
| F-1-31 | Kept **What the CLI can and cannot measure**. | [copy audit](copy-audit.md); live `/`. |
| F-1-32 | Kept **Know what the result means**. | [copy audit](copy-audit.md); live `/`. |
| F-1-33 | Kept **Measurements**. | [copy audit](copy-audit.md); live `/`. |
| F-1-34 | Kept **Suggested next tests**. | [copy audit](copy-audit.md); live `/`. |
| F-1-35 | Kept **Limits**. | [copy audit](copy-audit.md); live `/`. |
| F-2-1 | Kept every visible link and button at least 44 × 44 px. | Empty `smallTargets` for every live route and viewport in [product-check.json](evidence/polish-4/live/product-check.json). |
| F-2-2 | Kept the source link visibly and accessibly marked as external. | `@claim:legal-and-site-links`; live footer crawl. |
| F-3-1 | Kept serial claim execution and failure output for the timing regression. | `@claim:threshold-accuracy`; clean-clone `npm test` passed. |
| F-3-2 | Kept **bundled sample**, not vague **safe sample**, in the first-screen action hint. | [product-check.json](evidence/polish-4/live/product-check.json); first-screen screenshots. |
| F-3-3 | Kept unprovable registry-credential language removed and packaging copy narrowed to Cargo evidence. | `@claim:package-and-tests`; `cargo package --allow-dirty`. |
| F-3-4 | Kept **Collector config** and **config values** distinct in UI, docs, help, and output. | `@claim:config-inspection`; [copy audit](copy-audit.md). |
| F-4-1 | Added `free-to-use` to `.factory/claims.json` and one clean-state test covering the free fact, every public route, absent paid/billing/login UI, same-origin requests, and no billing/provider runtime. | `@claim:free-to-use` passed independently in fresh Chromium and mobile contexts; live `/`, `/demo`, `/privacy/`, and `/terms/` check in [product-check.json](evidence/polish-4/live/product-check.json). |
| Verification P1 | Kept complete Drops JSON for all-503 responses. | `all_503_responses_exit_zero_with_a_complete_json_drop_report`; `@claim:classification`. |
| Verification P2 | Kept immutable cache headers for content-addressed assets. | Deployment unit test; live response header check. |
| Verification 2 P1 | Kept the worker free of deployment-control precache entries and verified offline demo reload. | `installs the offline shell when the deployment control file is not public`; [product-check.json](evidence/polish-4/live/product-check.json). |
| Verification 3 P3 | Kept live CSP and Permissions Policy. | [product-check.json](evidence/polish-4/live/product-check.json); required URL verifier. |

## Release conclusion

The app is still the product-specific art-deco transit-poster pressure lab described in [design.md](design.md). Its CLI, browser model, one-click demo, privacy boundary, route behavior, accessibility, mobile layout, and catalog copy were exercised after the direct production deploy. No unresolved finding remains.
