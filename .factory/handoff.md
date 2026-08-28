# Collector Pressure Lab — review 2 handoff

Work order: `collector-pressure-lab-review-2`

Reviewed source: `868ec12fd77d671ecb844cbca21cbd882ef5c251`

Live URL: <https://collector-pressure-lab.sociobot.in/>

Reviewed: 2026-08-28

## Status: FAIL

The complete adversarial report is `.factory/review-2.md`. No product code was
changed. All 35 unresolved review-1 findings were confirmed in live behavior
and source and reopened as blocking under the required history rule. Two new
minor findings cover sub-44 px targets and the unlabelled external Source link.

Primary blockers remain the unclear first screen, missing one-click isolated
web and CLI demo, absent `.factory/claims.json` and tagged claim tests, broken
demo/404/deep-link behavior, missing policy and metadata requirements,
inconsistent route skeleton, and unresolved plain-language findings.

## Verification performed

- Fresh Chromium cold reads at 390 × 844 and 1440 × 900 before scrolling.
- Live first-click, `/demo`, `?demo=1`, `cplab demo` in a temporary directory,
  banner/reset/exit, storage, network interception, service-worker, and offline
  model checks.
- Root, legal, demo, 404, unknown, hash, forward/back, focus, metadata,
  headers, robots, sitemap, and full discovered-link crawl.
- Live axe at both viewports, keyboard focus, console/page errors, and rendered
  target-size checks.
- Full landing and README sentence audit with counts, terminology, headings,
  actions, jargon, and every unlisted claim marked.
- All earlier review/handoff findings checked individually against live and
  source. Earlier repaired verification defects were regression-checked.
- Clean clone: `npm ci` and `npm test` passed 4 Rust unit, 4 CLI contract, 3
  pressure fixture, 1 doctest, 4 Vitest, and 10 Playwright tests. `dist/site`
  was produced.
- Local production HTML, worker, JavaScript, CSS, and hero hashes match live.

## Product changes

None. Only `.factory/review-2.md` and this handoff were written.

## Next verification

After repair, rerun the entire checklist from fresh contexts. Execute every
new claim command independently from a clean clone, then verify demo reset,
exit, storage isolation, offline behavior, and CLI temporary output before
rechecking copy, routes, metadata, policies, links, accessibility, and history.
