import "./style.css";
import { site, channels, focus, projects, publications, timeline, stack } from "./content";
import { mountSignal } from "./signal";
import { mountPalette } from "./palette";

const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

// ---------- theme ----------
const root = document.documentElement;
function setTheme(t: "light" | "dark") {
  root.dataset.theme = t;
  try { localStorage.setItem("theme", t); } catch {}
}
try {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") root.dataset.theme = saved;
} catch {}
const toggleTheme = () => {
  const dark = root.dataset.theme
    ? root.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(dark ? "light" : "dark");
};

// ---------- render ----------
$("#app").innerHTML = `
<header class="bar">
  <a href="#top" class="mark">${esc(site.short)}</a>
  <nav>
    <a href="#projects">Projects</a>
    <a href="#publications">Papers</a>
    <a href="#contact">Contact</a>
    <button class="k" id="open-palette" aria-label="Open command palette"><kbd>⌘K</kbd></button>
    <button id="theme" aria-label="Toggle theme">◐</button>
  </nav>
</header>

<section class="hero" id="top">
  <canvas id="signal" aria-hidden="true"></canvas>
  <div class="hero-text">
    <h1>${esc(site.name)}</h1>
    <p class="role">${esc(site.role)}<br>${esc(site.org)}</p>
    <p class="tag">${esc(site.tagline)}</p>
    <p class="hint">Move your cursor to activate the muscle. Click to kick the controller.</p>
  </div>
</section>

<main>
  <section id="about" class="wrap two">
    <h2>About</h2>
    <div>${site.about.map((p) => `<p>${esc(p)}</p>`).join("")}
      <ul class="stack">${stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
    </div>
  </section>

  <section id="focus" class="wrap">
    <h2>What I work on</h2>
    <div class="focus">
      ${focus.map((f) => `<article><h3>${esc(f.title)}</h3><p>${esc(f.body)}</p></article>`).join("")}
    </div>
  </section>

  <section id="projects" class="wrap">
    <div class="head">
      <h2>Projects</h2>
      <div class="filters" role="group" aria-label="Filter projects"></div>
    </div>
    <ul class="projects"></ul>
  </section>

  <section id="publications" class="wrap two">
    <h2>Publications</h2>
    <ol class="pubs">
      ${publications.map((p) => `
        <li>
          <a href="${esc(p.href ?? "#")}">${esc(p.title)}</a>
          <span>${esc(p.authors)}. <em>${esc(p.venue)}</em>, ${esc(p.year)}.</span>
        </li>`).join("")}
    </ol>
  </section>

  <section id="timeline" class="wrap two">
    <h2>Timeline</h2>
    <ol class="timeline">
      ${timeline.map((r) => `
        <li><time>${esc(r.period)}</time><div><strong>${esc(r.title)}</strong><span>${esc(r.org)}</span></div></li>`).join("")}
    </ol>
  </section>

  <section id="contact" class="wrap two">
    <h2>Contact</h2>
    <div>
      <p>Open to collaborations on rehabilitation tech, biosignal processing and medical device engineering.</p>
      <ul class="links">${site.links.map((l) => `<li><a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join("")}</ul>
    </div>
  </section>
</main>

<footer class="wrap"><span>${esc(site.location)}</span><span>© ${new Date().getFullYear()} ${esc(site.name)}</span></footer>
`;

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
mountSignal($<HTMLCanvasElement>("#signal"), channels);
const openPalette = mountPalette(toggleTheme);
$("#open-palette").addEventListener("click", openPalette);
$("#theme").addEventListener("click", toggleTheme);
