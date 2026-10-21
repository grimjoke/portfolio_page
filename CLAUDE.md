# Personal site (grimjoke.github.io/portfolio_page)

Static portfolio. Vite + vanilla TypeScript, no framework. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to `main`.

## Layout
- `src/content.ts` — ALL copy and data (bio, disciplines, V-model lifecycle, projects, publications, timeline, links). Edit content here only.
- `src/main.ts` — renders sections from content (incl. the Core section's V-model SVG and discipline cards; hovering a card highlights its `stages` on the V), project tag filters.
- `src/arm.ts` — hero humanoid robot bust (arc-reactor chest, head tracks the target). Right arm: analytic 2-link IK (elbow down), hand points at the cursor, fingers close on press, live joint angles q1-q3; left hand rests on the hip. Idle: figure-8.
- `src/icons.ts` — line icons for discipline cards (keys referenced from content.ts).
- `src/signal.ts` — hero canvas: simulated multi-channel biosignal monitor. Cursor speed = EMG activation, EEG mu rhythm desynchronises with activation, click = impulse into a damped 2nd-order "controller" trace.
- `src/palette.ts` — Ctrl/Cmd+K command palette.
- `src/style.css` — Stark theme tokens on `:root` (spec: `docs/STARK_THEME.md`). **Dark only**: the light variant in the spec was dropped by choice, no theme toggle. Raw palette is `--stark-*`; everything else derives with `color-mix`. No hexes outside the token block.
  - AA tweak to the spec: the active filter uses red mixed 70% into bg (`--active-bg`) so its gold text passes; pure red only reaches 3.5:1.
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
