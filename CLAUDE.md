# Personal site (grimjoke.github.io/portfolio_page)

Static portfolio. Vite + vanilla TypeScript, no framework. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to `main`.

## Layout
- `src/content.ts` — ALL copy and data (bio, disciplines, V-model lifecycle, projects, publications, timeline, links). Edit content here only.
- `src/main.ts` — renders sections from content (incl. the Core section's V-model SVG and discipline cards; hovering a card highlights its `stages` on the V), project tag filters, theme toggle.
- `src/arm.ts` — hero robot arm: 3-link planar manipulator, FABRIK IK toward the cursor, idle figure-8, press to grip, live joint angles.
- `src/icons.ts` — line icons for discipline cards (keys referenced from content.ts).
- `src/signal.ts` — hero canvas: simulated multi-channel biosignal monitor. Cursor speed = EMG activation, EEG mu rhythm desynchronises with activation, click = impulse into a damped 2nd-order "controller" trace.
- `src/palette.ts` — Ctrl/Cmd+K command palette.
- `src/style.css` — Stark theme tokens on `:root` (spec: `docs/STARK_THEME.md`). Dark is the default; light only via `data-theme="light"` (theme toggle). Raw palette is `--stark-*`; everything else derives with `color-mix`. No hexes outside the token block.
  - AA adjustments to the spec in light mode: small gold/cyan text uses `--gold-ink`/`--cyan-ink` (mixed toward text), links use stark red, pills use red 12%, active filter is red with paper text, no H1 glow. In dark, the active filter uses red mixed 70% into bg so gold text passes.
  - Canvases read `--trace` (gold, live EMG), `--trace-dim` (cyan 45%), `--trace-ctrl` (red), `--grid`, `--muted`; the arm reads `--stark-cyan/gold/red` and `--bg-deep`.

## Conventions
- Keep it dependency-light. No UI framework unless there's a real reason.
- Respect `prefers-reduced-motion` for anything animated.
- Escape all content with `esc()` when interpolating into HTML.
- No em dashes in site copy.
- No uppercase or small-caps headings or labels.
- Fields marked `TODO` in content.ts are placeholders: fill with real data, never invent publications.

## Commands
- `npm install`, `npm run dev`, `npm run build`, `npm run preview`

## Ideas backlog
- Blog/notes section from markdown files (vite-plugin or import.meta.glob)
- Project detail pages
- Pull publications from ORCID public API at build time
- Mobile: make the hero respond to device tilt (DeviceOrientation) instead of cursor
