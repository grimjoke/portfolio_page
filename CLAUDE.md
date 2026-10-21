# Personal site (grimjoke.github.io/portfolio_page)

Static portfolio. Vite + vanilla TypeScript, no framework. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to `main`.

## Layout
- `src/content.ts` — ALL copy and data (bio, disciplines, V-model lifecycle, projects, publications, timeline, links). Edit content here only.
- `src/main.ts` — renders sections from content (incl. the Core section's V-model SVG and discipline cards; hovering a card highlights its `stages` on the V), project tag filters.
- `src/arm.ts` — hero biomimetic arm, shoulder down, bolted to a T-slot column stand (side view, facing left; avoid a beam-over-arm frame, it reads as a gallows). Analytic 2-link IK (elbow down/back), hand points at the cursor. Braided McKibben-style muscles: deltoid pair, biceps (thickens and turns gold with elbow flexion), triceps. Forearm tendon pack, 4 three-segment fingers + thumb that close on press. Readouts: q1-q3, muscle activation, grip. Idle: figure-8.
- `src/icons.ts` — line icons for discipline cards (keys referenced from content.ts).
- `src/signal.ts` — hero canvas: multi-channel biosignal monitor driven by the arm through `src/telemetry.ts` (arm writes, monitor reads). EMG = biceps/triceps activation (tonic from flexion + phasic burst on the moving agonist + grip co-contraction), IMU = elbow angular velocity, EEG mu rhythm desynchronises with effort, u(t) tracks elbow flexion; click = impulse into the damped 2nd-order controller trace.
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
