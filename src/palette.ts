// Ctrl/Cmd+K command palette: jump to sections, open links.
import { site } from "./content";

type Cmd = { label: string; hint: string; run: () => void };

export function mountPalette() {
  const cmds: Cmd[] = [
    ...["core", "about", "projects", "publications", "timeline", "contact"].map((id) => ({
      label: `Go to ${id}`,
      hint: "section",
      run: () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
    })),
    ...site.links.map((l) => ({ label: `Open ${l.label}`, hint: "link", run: () => window.open(l.href, "_blank") })),
  ];

  const dlg = document.createElement("dialog");
  dlg.className = "palette";
  dlg.innerHTML = `
    <input type="text" placeholder="Type a command" aria-label="Command" />
    <ul role="listbox"></ul>`;
  document.body.append(dlg);
  const input = dlg.querySelector("input")!;
  const list = dlg.querySelector("ul")!;
  let sel = 0, shown: Cmd[] = cmds;

  function render() {
    const q = input.value.toLowerCase();
    shown = cmds.filter((c) => c.label.toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = shown
      .map((c, i) => `<li role="option" aria-selected="${i === sel}" data-i="${i}">${c.label}<span>${c.hint}</span></li>`)
      .join("") || `<li class="empty">No matching command</li>`;
  }

  function run(i: number) { const c = shown[i]; if (!c) return; dlg.close(); c.run(); }

  input.addEventListener("input", () => { sel = 0; render(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { sel = (sel + 1) % shown.length; render(); e.preventDefault(); }
    if (e.key === "ArrowUp") { sel = (sel - 1 + shown.length) % shown.length; render(); e.preventDefault(); }
    if (e.key === "Enter") run(sel);
  });
  list.addEventListener("click", (e) => {
    const li = (e.target as HTMLElement).closest("li[data-i]") as HTMLElement | null;
    if (li) run(+li.dataset.i!);
  });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  const open = () => { input.value = ""; sel = 0; render(); dlg.showModal(); input.focus(); };
  addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); dlg.open ? dlg.close() : open(); }
  });
  return open;
}
