# Stark theme spec

Re-skin the site to match Kostas's "Things - Stark" Obsidian theme (first version: red/gold/arc-reactor cyan).
This file is the source of truth for colors, type and treatment. Implement it by changing the tokens in
`src/style.css` and the colors the canvas reads in `src/signal.ts`. Do not touch `src/content.ts`.

## Mood
Stark Industries engineering console. Dark warm-black workshop surfaces, gold for anything that matters,
thin arc-reactor cyan lines for structure and data, a hard red used sparingly for action.
Technological, not neon: crisp lines, restrained glow, no rainbow gradients, no heavy blur.

## Palette (dark is the primary theme)

| Token            | Hex       | Role |
|------------------|-----------|------|
| `--stark-red`    | `#C8102E` | Primary accent: buttons, selection, active filter, focus ring fallback |
| `--stark-gold`   | `#F2C14E` | H1/H2, `<strong>`, key numbers, active nav, pill text |
| `--stark-cyan`   | `#6FE3FF` | Lines and data: canvas traces, grid, dividers on hover, `<em>`, H4, links on hover, focus ring |
| `--stark-link`   | `#E5484D` | Link color |
| `--stark-bg`     | `#120E0F` | Page background |
| `--stark-bg-deep`| `#0C0909` | Header bar, footer, hero base |
| `--stark-raised` | `#241A1C` | Raised surfaces: palette dialog, pills, inputs |
| `--stark-border` | `#2E2224` | Borders, hairlines, section dividers |
| `--stark-text`   | `#ECE4E4` | Body text |

Derived (use `color-mix`, don't hard-code new hexes):
- muted text: `color-mix(in srgb, var(--stark-bg), var(--stark-text) 72%)`
- faint text: `color-mix(in srgb, var(--stark-bg), var(--stark-text) 40%)`
- selection: `color-mix(in srgb, var(--stark-red) 28%, transparent)`
- tag/pill bg: `color-mix(in srgb, var(--stark-red) 25%, transparent)` with gold text and a 30% gold border
- hover bg: `color-mix(in srgb, var(--stark-red) 12%, transparent)`

### Light theme
Keep a light mode but make it the "blueprint on paper" variant: background `#F4F1EC`, text `#1E1718`,
gold darkened to `#A87A12` for contrast, cyan darkened to `#0A7EA0`, red unchanged.
Check every text/background pair hits WCAG AA.

## Typography
- Headings: **Rajdhani** (Google Fonts, weights 600/700). Alternative if it reads too narrow: Chakra Petch.
- Body: keep IBM Plex Sans.
- No uppercase or small-caps headings. Kostas dislikes them.
- H1, H2: gold. H3: red. H4: cyan.
- `<strong>` / bold: gold.
- `<em>` / italic: cyan, true italic (Plex has one).
- Use italic as a deliberate accent: the hero tagline and the section intros are set in cyan italic.

## Structure and lines ("light blue lines")
- Page background: a faint engineering grid in cyan at ~4-6% opacity (CSS `background-image` with two
  `linear-gradient`s, 48px cells, plus a heavier line every 4 cells). Static, no animation.
- Section dividers: 1px `--stark-border`; on the section heading, a short 2px cyan rule (~48px) to the left
  or under it, like a HUD bracket.
- Focus area / project rows: left border in cyan instead of the current green.
- Active filter button: red fill, gold text. Inactive: transparent, muted text, border `--stark-border`.

## Hero canvas (`src/signal.ts`)
- First EMG channel (the "live" one): gold.
- Other traces: cyan at ~45% opacity.
- Control channel `u(t)`: red.
- Grid lines: cyan at ~5%.
- Labels: muted text color.
- Read all of these from CSS variables (it already uses `--trace`, `--trace-dim`, `--grid`; add `--trace-ctrl`).

## Effects (keep them cheap)
- One glow only: H1 in the hero gets `text-shadow: 0 0 14px color-mix(in srgb, var(--stark-gold) 35%, transparent)`.
- No glow on body text, buttons or cards.
- No web-font icon packs, no extra animation libraries.
- Respect `prefers-reduced-motion` (already wired).

## Done when
- Dark and light both render with no hard-coded hexes outside the token block.
- Bold is gold, italic is cyan, headings use Rajdhani, the grid background is visible but quiet.
- Contrast passes AA. `npm run build` is clean.
