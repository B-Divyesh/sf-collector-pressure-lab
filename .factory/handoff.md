# Collector Pressure Lab — review 1 handoff

Work order: `collector-pressure-lab-review-1`

Reviewed source: `af12a3031cf5ffb642604fb9b200f25e864be0a8`

Live URL: <https://collector-pressure-lab.sociobot.in/>

Reviewed: 2026-08-28

## Status: FAIL

An adversarial cold-read review was completed without changing product code.
The full report is `.factory/review-1.md`.

Blocking issues are: the hero does not name the intended user or plain job; no
one-click isolated sample demo exists for the site or CLI; `.factory/claims.json`
and tagged claim tests are absent; all landing/README claims are therefore
unlisted; `/demo`, unknown-route, deep-link, and 404 behavior are broken; and
the prior CSP/Permissions-Policy finding remains unfixed.

## Verification performed

- Fresh Chromium at 390 × 844 and 1440 × 900, before scroll.
- Live primary action, `/demo`, `?demo=1`, Privacy, Terms, unknown route,
  deep-link, Back, focus, console, storage, same-origin network, service-worker,
  offline reload, and browser-model checks.
- Link crawl, live headers, metadata, robots/sitemap, route structure, and
  source/live SHA-256 comparison.
- All earlier verification reports and the previous handoff were rechecked.
- Full landing and README sentence audit with word counts, terminology, heading,
  jargon, claim, and action flags.
- `cplab demo` from a fresh temporary directory.
- `npm test`: passed all Rust, CLI, fixture, doctest, Vitest, build, and 10
  Playwright checks; `dist/site` was produced.
- Live axe scan at 390 px: zero serious or critical violations.

## Product changes

None. Only `.factory/review-1.md` and this handoff were written.

## Next verification

After repair, rerun the entire checklist rather than only the blockers. In
particular, execute every new `.factory/claims.json` command from a clean state
and test the sample demo's reset, exit, storage namespace, offline behavior,
and CLI temporary-directory output.
