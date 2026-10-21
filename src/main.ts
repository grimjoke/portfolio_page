import "./style.css";
import { site, channels, core, lifecycle, disciplines, projects, publications, timeline, stack } from "./content";
import { icons } from "./icons";
import { mountSignal } from "./signal";
import { mountArm } from "./arm";
import { mountPalette } from "./palette";

const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

// ---------- V-model ----------
// Left arm descends (decomposition), right arm climbs (integration and test).
const vPos = lifecycle.map((_, i) => ({ x: 200 + i * 100, y: 40 + (i <= 3 ? i : 6 - i) * 61.7 }));
const vSvg = `
<svg class="vmodel" viewBox="40 0 920 275" role="img" aria-label="Systems engineering V-model: ${lifecycle.map((s) => esc(s.label)).join(", ")}">
  ${[[0, 6], [1, 5], [2, 4]].map(([a, b]) =>
    `<line class="pair" x1="${vPos[a].x + 14}" y1="${vPos[a].y}" x2="${vPos[b].x - 14}" y2="${vPos[b].y}"/>`).join("")}
  <polyline class="arm" points="${vPos.map((p) => `${p.x},${p.y}`).join(" ")}"/>
  <text class="cap" x="361" y="111" text-anchor="middle" transform="rotate(31.7 361 111)">decompose</text>
  <text class="cap" x="639" y="111" text-anchor="middle" transform="rotate(-31.7 639 111)">integrate &amp; test</text>
  ${lifecycle.map((s, i) => {
    const p = vPos[i];
    const [tx, ty, anchor] = i < 3 ? [p.x - 20, p.y + 5, "end"] : i === 3 ? [p.x, p.y + 38, "middle"] : [p.x + 20, p.y + 5, "start"];
    return `<g class="node" data-stage="${s.id}"><circle cx="${p.x}" cy="${p.y}" r="9"/><text x="${tx}" y="${ty}" text-anchor="${anchor}">${esc(s.label)}</text></g>`;
  }).join("")}
</svg>`;

const idx = (n: number) => `<span class="idx">${String(n).padStart(2, "0")}</span>`;

// ---------- render ----------
$("#app").innerHTML = `
<header class="bar">
  <a href="#top" class="mark">${esc(site.short)}</a>
  <nav>
    <a href="#core">Core</a>
    <a href="#projects">Projects</a>
    <a href="#publications">Papers</a>
    <a href="#contact">Contact</a>
    <button class="k" id="open-palette" aria-label="Open command palette"><kbd>⌘K</kbd></button>
  </nav>
</header>

<section class="hero" id="top">
  <canvas id="signal" aria-hidden="true"></canvas>
  <canvas id="arm" aria-hidden="true"></canvas>
  <div class="hero-text">
    <ul class="hero-disc">${site.disciplines.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
    <h1>${esc(site.name)}</h1>
    <p class="role">${esc(site.role)}<br>${esc(site.org)}</p>
    <p class="tag">${esc(site.tagline)}</p>
    <p class="hint">Move your cursor: the robot reaches for it and the EMG fires. Press to grip.</p>
  </div>
</section>

<main>
  <section id="core" class="wrap">
    <div class="core-head">
      <h2>${idx(1)}${esc(core.title)}</h2>
      <p>${esc(core.intro)}</p>
    </div>
    <figure class="v-wrap">
      ${vSvg}
      <ol class="v-list">${lifecycle.map((s) => `<li data-stage="${s.id}">${esc(s.label)}</li>`).join("")}</ol>
      <figcaption>Hover a discipline to see where it sits on the V.</figcaption>
    </figure>
    <div class="disc-grid">
      ${disciplines.map((d) => `
        <article class="disc" tabindex="0" data-stages="${d.stages.join(" ")}">
          <div class="disc-top">
            <span class="ico">${icons[d.icon]}</span>
            <ol class="ticks" aria-label="Lifecycle coverage">${lifecycle.map((s) =>
              `<li class="${d.stages.includes(s.id) ? "on" : ""}" title="${esc(s.label)}"></li>`).join("")}</ol>
          </div>
          <h3>${esc(d.title)}</h3>
          <p>${esc(d.body)}</p>
          <ul class="tools">${d.tools.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        </article>`).join("")}
    </div>
  </section>

  <section id="about" class="wrap two">
    <h2>${idx(2)}About</h2>
    <div>${site.about.map((p) => `<p>${esc(p)}</p>`).join("")}
      <ul class="stack">${stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
    </div>
  </section>

  <section id="projects" class="wrap">
    <div class="head">
      <h2>${idx(3)}Projects</h2>
      <div class="filters" role="group" aria-label="Filter projects"></div>
    </div>
    <ul class="projects"></ul>
  </section>

  <section id="publications" class="wrap two">
    <h2>${idx(4)}Publications</h2>
    <ol class="pubs">
      ${publications.map((p) => `
        <li>
          <a href="${esc(p.href ?? "#")}">${esc(p.title)}</a>
          <span>${esc(p.authors)}. <em>${esc(p.venue)}</em>, ${esc(p.year)}.</span>
        </li>`).join("")}
    </ol>
  </section>

  <section id="timeline" class="wrap two">
    <h2>${idx(5)}Timeline</h2>
    <ol class="timeline">
      ${timeline.map((r) => `
        <li><time>${esc(r.period)}</time><div><strong>${esc(r.title)}</strong><span>${esc(r.org)}</span></div></li>`).join("")}
    </ol>
  </section>

  <section id="contact" class="wrap two">
    <h2>${idx(6)}Contact</h2>
    <div>
      <p>Open to collaborations on rehabilitation tech, biosignal processing and medical device engineering.</p>
      <ul class="links">${site.links.map((l) => `<li><a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join("")}</ul>
    </div>
  </section>
</main>

<footer class="wrap"><span>${esc(site.location)}</span><span>© ${new Date().getFullYear()} ${esc(site.name)}</span></footer>
`;

// ---------- core: highlight V stages for the hovered discipline ----------
const coreEl = $("#core");
function highlight(stages: string[] | null) {
  coreEl.classList.toggle("focused", !!stages);
  coreEl.querySelectorAll<HTMLElement>("[data-stage]").forEach((n) =>
    n.classList.toggle("on", !stages || stages.includes(n.dataset.stage!)));
}
coreEl.querySelectorAll<HTMLElement>(".disc").forEach((card) => {
  const on = () => highlight(card.dataset.stages!.split(" "));
  card.addEventListener("mouseenter", on);
  card.addEventListener("focus", on);
  card.addEventListener("mouseleave", () => highlight(null));
  card.addEventListener("blur", () => highlight(null));
});
highlight(null);

// ---------- projects + filters ----------
const tags = ["all", ...new Set(projects.flatMap((p) => p.tags))];
let active = "all";
function renderProjects() {
  $(".filters").innerHTML = tags
    .map((t) => `<button aria-pressed="${t === active}" data-t="${esc(t)}">${esc(t)}</button>`)
    .join("");
  $(".projects").innerHTML = projects
    .filter((p) => active === "all" || p.tags.includes(active))
    .map((p) => `
      <li>
        <span class="yr">${esc(p.year)}</span>
        <div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.summary)}</p>
          <p class="meta">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}
          ${(p.links ?? []).map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join("")}</p>
        </div>
      </li>`)
    .join("");
}
$(".filters").addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest("button");
  if (b) { active = b.dataset.t!; renderProjects(); }
});
renderProjects();

// ---------- wire up ----------
// arm first: it writes the telemetry the signal monitor reads
mountArm($<HTMLCanvasElement>("#arm"), $(".hero"));
mountSignal($<HTMLCanvasElement>("#signal"), channels);
const openPalette = mountPalette();
$("#open-palette").addEventListener("click", openPalette);
