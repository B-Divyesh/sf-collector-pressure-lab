# Visual thesis — The pressure line

## Direction and rationale

Collector Pressure Lab uses an **art-deco transit poster** language. A Collector
pipeline behaves like a metropolitan line at rush hour: arrivals pulse, a
platform queue fills, service capacity becomes visible, and overflow has a
cost. The visual system makes that mental model concrete without pretending a
browser simulation is a production benchmark. Strong rails, ticket-shaped
labels, stepped plots, and an original night-station illustration distinguish
the product from generic observability dashboards.

This is intentionally a single-mode, ink-on-paper dark treatment. It resembles
a technical poster pinned in a midnight control room, so the measured output—not
chrome—has priority.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Night ink | `#101B20` | page background |
| Platform | `#18282D` | raised controls and plots |
| Paper | `#F3E8CE` | primary text and panel paper |
| Brass | `#E0B44B` | primary action, thresholds, focus |
| Signal mint | `#85C9AD` | safe capacity and success |
| Ember | `#E8754F` | drops and danger |
| Fog | `#A9B7AE` | secondary copy |
| Rail | `#486067` | structural rules |

Paper on night ink is 13.3:1; fog on night ink is 8.3:1; night ink on brass is
8.0:1. Status always has a word and shape in addition to color.

## Type

- Display: **Metropolis 1920**, an original CSS/system treatment using
  `Arial Narrow`, `Aptos Narrow`, and sans-serif fallbacks. Uppercase letters,
  generous tracking, and compact line-height evoke engraved station signage.
- Utility/body: **IBM Plex Mono-compatible system stack** (`ui-monospace`,
  `SFMono-Regular`, `Consolas`, monospace). No font files or remote requests;
  figures stay tabular and the initial payload stays small.
- Scale: 14 / 16 / 20 / 28 / 44 / clamp(48–88) px. Body text never drops below
  16 px. Reading measure is capped at 68 characters.

## Spacing and shape

The base unit is 4 px, used in an 8 / 12 / 16 / 24 / 32 / 48 / 72 rhythm.
Desktop sections share a 1,200 px rail; the hero uses a 7:5 split. On a 390 px
viewport, navigation loses secondary links, the hero and lab stack, and the
results become a vertical station board. Corners are clipped or nearly square;
round pills are reserved for line/status markers. Rules are 1–2 px and behave
like tracks rather than card borders. Touch targets are at least 44 px.

## Interaction grammar

- The sole primary route is **Run the browser model**; CLI copy actions are
  secondary.
- Inputs resemble signal levers: high-contrast tracks, large thumbs, and a
  numeric readout adjacent to the label.
- Results arrive as a station board: classification first, then throughput,
  queue peak, and dropped items. Each change is also announced to assistive
  technology.
- Keyboard users can tab through each input, use arrow keys on ranges, and
  activate every button with native controls. Focus is a 3 px brass outline
  with a dark offset.

## Motion policy

One 520 ms entrance shifts the hero artwork upward by 10 px; the model's queue
bar and plot update over 220 ms using only transform/opacity. Nothing loops.
With `prefers-reduced-motion: reduce`, all transforms, scrolling behavior, and
transitions are removed; state changes remain visible instantly.

## Asset plan and provenance

- `site/public/pressure-line.webp`: original raster hero, generated for this
  product with the factory `factory-image` deployment on 2026-08-27, then
  resized/optimized locally to WebP. Prompt: “Art-deco transit poster for a
  developer tool: an abstract midnight telemetry station seen in isometric
  cutaway, three luminous signal rails entering a brass queue chamber, orderly
  pulses accumulating and one ember warning gate, geometric 1930s screen-print
  shapes, subtle paper grain, night ink / antique paper / brass / mint / ember
  palette, dramatic but technical, wide landscape composition, right-weighted
  subject with quiet negative space, no people, no logos, no letters, no words,
  no UI screenshot, no gradients, no watermark.” Generated imagery is treated
  as project-owned original artwork under the service output terms.
- Product marks, route diagram, gauges, and icons are hand-authored in HTML/CSS
  from primitive lines and shapes; no third-party icon set.

The generated image is decorative because the adjacent copy communicates its
meaning; its empty alt prevents duplicate narration. The simulation chart has a
text summary and does not rely on the artwork.
