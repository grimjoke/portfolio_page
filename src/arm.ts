// Hero robot: 3-link planar manipulator that reaches for the cursor (FABRIK IK).
// Idle: end effector traces a slow figure-8. Press: gripper closes.

type P = { x: number; y: number };

export function mountArm(canvas: HTMLCanvasElement, pressTarget: HTMLElement) {
  const ctx = canvas.getContext("2d")!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(devicePixelRatio || 1, 2);

  let W = 0, H = 0, reach = 0, mobile = false;
  let base: P = { x: 0, y: 0 };
  let L = [0, 0, 0];
  let pts: P[] = [];
  let target: P = { x: 0, y: 0 };
  let cursor: P = { x: 0, y: 0 };
  let lastMove = -1e9;
  let grip = 0, gripGoal = 0;
  let t = 0;
  const trail: P[] = [];

  const dist = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y);
  const toward = (from: P, to: P, len: number): P => {
    const d = dist(from, to) || 1;
    return { x: from.x + ((to.x - from.x) / d) * len, y: from.y + ((to.y - from.y) / d) * len };
  };

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mobile = W < 760;
    base = mobile ? { x: W * 0.8, y: H * 0.33 } : { x: W * 0.74, y: H * 0.86 };
    reach = mobile ? Math.min(W * 0.5, H * 0.22) : Math.min(W * 0.34, H * 0.62);
    L = [reach * 0.42, reach * 0.36, reach * 0.22];
    pts = [{ ...base }];
    for (const l of L) pts.push({ x: pts[pts.length - 1].x - l * 0.3, y: pts[pts.length - 1].y - l });
    target = { ...pts[3] };
    trail.length = 0;
  }

  // FABRIK: alternate backward (from goal) and forward (from base) passes.
  function solve(goal: P) {
    const total = L[0] + L[1] + L[2];
    if (dist(base, goal) > total * 0.97) goal = toward(base, goal, total * 0.97);
    for (let k = 0; k < 8; k++) {
      pts[3] = { ...goal };
      for (let i = 2; i >= 0; i--) pts[i] = toward(pts[i + 1], pts[i], L[i]);
      pts[0] = { ...base };
      for (let i = 0; i < 3; i++) pts[i + 1] = toward(pts[i], pts[i + 1], L[i]);
      if (dist(pts[3], goal) < 0.5) break;
    }
  }

  function idleGoal(): P {
    const c = { x: base.x - reach * 0.3, y: base.y - reach * 0.62 };
    return { x: c.x + Math.sin(t * 0.7) * reach * 0.38, y: c.y + Math.sin(t * 1.4) * reach * 0.16 };
  }

  function step() {
    t += 0.016;
    const following = performance.now() - lastMove < 2500;
    let goal = following ? { ...cursor } : idleGoal();
    goal.y = Math.min(goal.y, base.y - reach * 0.12); // stay above the floor
    target.x += (goal.x - target.x) * 0.08;
    target.y += (goal.y - target.y) * 0.08;
    solve(target);
    grip += (gripGoal - grip) * 0.25;
    trail.push({ ...pts[3] });
    if (trail.length > 70) trail.shift();
    return following;
  }

  const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  function draw(following: boolean) {
    ctx.clearRect(0, 0, W, H);
    const ink = css("--ink"), bg = css("--bg"), trace = css("--trace"), muted = css("--muted");
    const w = Math.max(8, reach * 0.06);

    // end-effector trail
    trail.forEach((p, i) => {
      ctx.fillStyle = trace;
      ctx.globalAlpha = (i / trail.length) * 0.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // target crosshair when tracking the cursor
    if (following) {
      ctx.strokeStyle = trace; ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(pts[3].x, pts[3].y); ctx.lineTo(cursor.x, cursor.y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 7, 0, Math.PI * 2);
      ctx.moveTo(cursor.x - 12, cursor.y); ctx.lineTo(cursor.x + 12, cursor.y);
      ctx.moveTo(cursor.x, cursor.y - 12); ctx.lineTo(cursor.x, cursor.y + 12);
      ctx.stroke();
    }

    // pedestal
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(base.x - w * 2.2, base.y + w * 1.6);
    ctx.lineTo(base.x + w * 2.2, base.y + w * 1.6);
    ctx.lineTo(base.x + w * 1.2, base.y);
    ctx.lineTo(base.x - w * 1.2, base.y);
    ctx.closePath(); ctx.fill();
    ctx.fillRect(base.x - w * 3, base.y + w * 1.6, w * 6, 3);

    // links: outlined bars
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const lw = w * (1 - i * 0.2);
      ctx.strokeStyle = ink; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[i + 1].x, pts[i + 1].y); ctx.stroke();
      ctx.strokeStyle = bg; ctx.lineWidth = Math.max(1.5, lw - 5);
      ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[i + 1].x, pts[i + 1].y); ctx.stroke();
    }

    // gripper, aligned with the last link
    const e = pts[3];
    const a = Math.atan2(e.y - pts[2].y, e.x - pts[2].x);
    const open = (1 - grip) * w * 0.9 + w * 0.25;
    const fl = w * 1.5;
    ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.lineCap = "round";
    for (const s of [-1, 1]) {
      const px = e.x + Math.cos(a + (s * Math.PI) / 2) * open;
      const py = e.y + Math.sin(a + (s * Math.PI) / 2) * open;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y); ctx.lineTo(px, py);
      ctx.lineTo(px + Math.cos(a) * fl, py + Math.sin(a) * fl);
      ctx.stroke();
    }

    // joints + angle readouts
    ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
    let prev = -Math.PI / 2;
    for (let i = 0; i < 3; i++) {
      const p = pts[i];
      const ang = Math.atan2(pts[i + 1].y - p.y, pts[i + 1].x - p.x);
      let q = ((ang - prev) * 180) / Math.PI;
      q = ((q + 540) % 360) - 180;
      prev = ang;
      ctx.fillStyle = bg; ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, w * 0.75, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = trace;
      ctx.beginPath(); ctx.arc(p.x, p.y, w * 0.28, 0, Math.PI * 2); ctx.fill();
      if (!mobile) {
        ctx.fillStyle = muted;
        ctx.fillText(`q${i + 1} ${q.toFixed(0).padStart(4)}°`, p.x + w * 1.4, p.y + 4);
      }
    }
  }

  addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    if (e.clientY > r.bottom) return;
    cursor = { x: e.clientX - r.left, y: e.clientY - r.top };
    lastMove = performance.now();
  }, { passive: true });
  pressTarget.addEventListener("pointerdown", () => { gripGoal = 1; });
  addEventListener("pointerup", () => { gripGoal = 0; });
  addEventListener("resize", () => { resize(); if (reduce) { solve(idleGoal()); draw(false); } });
  resize();

  if (reduce) { t = 1.2; solve(idleGoal()); draw(false); return; }

  // one rAF chain at a time; paused while the hero is off screen
  let running = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; loop(); }
    else if (!e.isIntersecting) running = false;
  }).observe(canvas);
  function loop() {
    if (!running) return;
    draw(step());
    requestAnimationFrame(loop);
  }
}
