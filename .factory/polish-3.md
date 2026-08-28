# Perfection-loop polish 3

Repaired from review commit `cc20fc8a9d275366adb1f750385f80919a2276c7`. The deployed product build comes from `4fc6c70` and is live at <https://collector-pressure-lab.sociobot.in/>.

## Round-3 finding closure

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 | Serialized the Playwright matrix so the timing fixture cannot compete with browser workers. Child stdout and stderr now appear in failed assertions. | `@claim:threshold-accuracy`; three successful full-suite runs across independent clean clones; live-independent CLI fixture. |
| F-1-4 | Added `collector-metrics` and `cli-data-boundary` claims. Removed unsupported account, runtime, registry-distribution, credential, animation, test-composition, archive-content, and exact timing statements. Tightened package inspection and claim/tag parity. | All 14 manifest commands passed independently in `/tmp/cplab-polish3-final.Nze6sw`; `keeps one independently runnable tagged test for every declared claim`. |
| F-3-2 | Replaced “safe sample” with “bundled sample” in the first-screen hint and CLI help. | `opens the isolated sample in one click with a complete result`; [mobile first screen](evidence/polish-3/first-screen-mobile.png); live root check. |
| F-3-3 | Removed the factory registry credential sentence and narrowed packaging copy to what `cargo package` proves. | `@claim:package-and-tests`; Cargo package contains 13 allowlisted files and the bundled demo inputs. |
| F-3-4 | Uses “Collector config” for the file and “config values” for extracted values across the site, README, CLI help, and output. | Repository terminology scan; [.factory/copy-audit.md](copy-audit.md); `@claim:config-inspection`. |

## Earlier review finding closure

| Finding | Change retained or completed | Evidence |
| --- | --- | --- |
| F-1-1 | The first screen names the Collector pressure-threshold job, OpenTelemetry operators, the sample action, its result, and three facts. Short-height desktop spacing and 16 px text keep the complete block visible. | `opens the isolated sample in one click with a complete result`; [local mobile](evidence/polish-3/first-screen-mobile.png); [live mobile](evidence/polish-3/live/first-screen-mobile.png); live facts end at 752 px in an 844 px viewport. |
| F-1-2 | `/demo` and `?demo=1` open a populated Drops result. Demo storage is prefixed, reset restores 900 items/s, exit removes only demo data, and `cplab demo` writes to a reported temp directory. | `@claim:demo-isolation`; [live demo](evidence/polish-3/live/demo-mobile.png); [live query demo](evidence/polish-3/live/demo-query-mobile.png). |
| F-1-3 | The claims manifest contains 14 unique ids with one matching tagged test each. | Manifest parity unit test; 14 independent clean-clone claim commands. |
| F-1-4 | Every current landing, legal, and README promise is tested or narrowed to an instruction/scope statement. | [.factory/claims.json](claims.json); [.factory/copy-audit.md](copy-audit.md); all claim commands pass. |
| F-1-5 | Real demo/legal pages, deterministic deep-link focus, and the styled 404 remain. Unknown routes return 404. | `serves a real 404 and complete route metadata`; `focuses and aligns deep links after layout`; live route matrix in [product-check.json](evidence/polish-3/live/product-check.json). |
| F-1-6 | Restrictive CSP and Permissions Policy remain on every response. | `publishes restrictive security policies and real route handling`; live values in [hashes-and-headers.txt](evidence/polish-3/live/hashes-and-headers.txt). |
| F-1-7 | Root and route titles are plain and distinct. Canonical, Open Graph, Twitter, 1200×630 social art, favicon, and touch icon remain. Query demo metadata now updates its canonical and OG URL too. | `@claim:legal-and-site-links`; `@claim:demo-isolation`; live route matrix. |
| F-1-8 | The sitemap lists root, demo, privacy, and terms; robots references it. | `@claim:legal-and-site-links`; live `/sitemap.xml` and `/robots.txt` return 200. |
| F-1-9 | The shared wordmark, Demo/Privacy/Terms navigation, one-line purpose, factory credit, version, build id, and source link remain on all routes. | `@claim:legal-and-site-links`; live desktop/mobile route crawl. |
| F-1-10 | Route loads, Back, and hash navigation focus and announce the destination heading. | `moves focus on full navigation and browser back`; live Back focus `hero-title`; live `#cli` focus `cli-title` at 0.28 px. |
| F-1-11 | The long README overview remains split into short sentences. | Copy audit: maximum 22 words. |
| F-1-12 | Completed-run exit behavior and JSON policy guidance remain separate. | Copy audit; `@claim:classification`. |
| F-1-13 | Remote override guidance remains two direct sentences. | Copy audit; `@claim:loopback-guard`. |
| F-1-14 | Request measurements and optional Collector metrics remain separate sentences. | Copy audit; `@claim:classification`; `@claim:collector-metrics`. |
| F-1-15 | “Browser model” remains the single term for the web simulator. | Copy audit terminology table and repository scan. |
| F-1-16 | The tuning-hypothesis hero phrase remains removed. | Copy audit; live first-screen screenshot. |
| F-1-17 | The illustration caption directly connects incoming telemetry and export capacity. | Copy audit; live root. |
| F-1-18 | The three workflow steps remain short, verb-led instructions. | Copy audit; live root. |
| F-1-19 | Result text uses drains, backs up, and drops. | `@claim:classification`; browser model test. |
| F-1-20 | Visitor copy avoids the four previously flagged abstractions. | Banned/jargon repository scan; copy audit. |
| F-1-21 | Header action remains “Try sample pressure test.” | Target-size test; live root. |
| F-1-22 | Hero action remains “Try it with sample data” and opens a completed result. | `@claim:demo-isolation`; live first-click check. |
| F-1-23 | Form action remains “Show pressure result.” | `@claim:browser-no-network-or-storage`. |
| F-1-24 | Eyebrow remains “How the pressure test works.” | Copy audit. |
| F-1-25 | Method heading remains “Test one sample at increasing rates.” | Copy audit. |
| F-1-26 | Heading is now “Read Collector config values.” | Copy audit; `@claim:config-inspection`. |
| F-1-27 | Heading remains “Classify the first failure.” | Copy audit. |
| F-1-28 | Eyebrow remains “Browser queue model.” | Copy audit. |
| F-1-29 | Eyebrow remains “Collector CLI.” | Copy audit. |
| F-1-30 | Terminal heading remains “Test your local Collector from the terminal.” | Copy audit. |
| F-1-31 | Eyebrow remains “What the CLI can and cannot measure.” | Copy audit. |
| F-1-32 | Heading remains “Know what the result means.” | Copy audit. |
| F-1-33 | Heading remains “Measurements.” | Copy audit. |
| F-1-34 | Heading remains “Suggested next tests.” | Copy audit. |
| F-1-35 | Heading remains “Limits.” | Copy audit. |
| F-2-1 | Every visible link and button remains at least 44×44 px. All utility text is now at least 16 px. | `keeps every visible link and button at least 44 by 44 CSS pixels`; live `smallTargets: []`; Lighthouse Best Practices 100. |
| F-2-2 | External source links remain visibly labeled “opens external site.” | `@claim:legal-and-site-links`; live GitHub response 200. |

## Earlier verification regressions

| Finding | Evidence |
| --- | --- |
| Verification P1: all-503 responses lost the report | `all_503_responses_exit_zero_with_a_complete_json_drop_report` and `@claim:classification` pass with a complete Drops report. |
| Verification P2: hashed assets lacked immutable caching | Live hashed CSS returns `public, max-age=31536000, immutable`; see [hashes-and-headers.txt](evidence/polish-3/live/hashes-and-headers.txt). |
| Verification 2 P1: worker precached the deployment control file | Worker install/offline checks pass; `/staticwebapp.config.json` returns 404 and is absent from `sw.js`. |
| Verification 3 P3: CSP and Permissions Policy were absent | Both policies are present in source and live responses. |

## Verification summary

- Every one of the 14 `.factory/claims.json` commands passed independently from clean clone `/tmp/cplab-polish3-final.Nze6sw`.
- `npm test` passed repeatedly across independent clean clones. Final run: 4 Rust unit tests, 4 CLI contract tests, 3 pressure fixtures, 1 doctest, 6 Vitest tests, and 39 Playwright passes with 9 intentional duplicate mobile skips.
- `cargo fmt --check`, Clippy with warnings denied, release build, Cargo package verification, and production audit all passed.
- The package contains 13 files, 68.2 KiB raw and 18.9 KiB compressed. Site assets and factory evidence are excluded.
- Built payloads: 6.50 kB JavaScript, 16.09 kB CSS, no fonts, and 102.75 kB hero WebP.
- Local Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.66 s, CLS 0, TBT 0 ms.
- Live Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.35 s, CLS 0, TBT 0 ms. See [summary](evidence/polish-3/live/lighthouse-summary.json).
- Local and live root, worker, CSS, JavaScript, and hero hashes match. `/opt/fleet/lib/verify-url.sh` passes with zero console errors.
- Live Axe checks report zero serious or critical violations across root, both demo entries, privacy, terms, the 404 page, and an unknown route at both viewports.

No finding remains open.
