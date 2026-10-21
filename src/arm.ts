// Hero robot: humanoid bust whose right arm reaches for the cursor.
// Shoulder-elbow-wrist is analytic 2-link IK (elbow down), the hand points at the target and its
// fingers close on press, the head tracks the target, the other hand rests on the hip.
// Idle: the reaching hand traces a slow figure-8.

type P = { x: number; y: number };

export function mountArm(canvas: HTMLCanvasElement, pressTarget: HTMLElement) {
  const ctx = canvas.getContext("2d")!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(devicePixelRatio || 1, 2);

  let W = 0, H = 0, u = 0, mobile = false;
  let cx = 0, sy = 0;             // body centre x, shoulder line y
  let L1 = 0, L2 = 0, LH = 0;     // upper arm, forearm, hand
  let shoulder: P = { x: 0, y: 0 }, elbow: P = { x: 0, y: 0 }, wrist: P = { x: 0, y: 0 }, tip: P = { x: 0, y: 0 };
  let handAng = Math.PI;
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
  const polar = (o: P, a: number, len: number): P => ({ x: o.x + Math.cos(a) * len, y: o.y + Math.sin(a) * len });

  // Two-link IK by the law of cosines. Taking (a - alpha) puts the elbow below the line when
  // reaching left, and outward when the hand is on the hip.
  function ik(s: P, goal: P, l1: number, l2: number) {
    const a = Math.atan2(goal.y - s.y, goal.x - s.x);
    const d = Math.min(Math.max(dist(s, goal), Math.abs(l1 - l2) + 1), l1 + l2 - 0.5);
    const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
    const alpha = Math.acos(Math.min(1, Math.max(-1, cosA)));
    return { e: polar(s, a - alpha, l1), w: polar(s, a, d) };
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mobile = W < 760;
    u = mobile ? Math.min(W * 0.085, H * 0.05) : Math.min(W * 0.055, H * 0.085);
    cx = mobile ? W * 0.78 : W * 0.8;
    sy = (mobile ? H * 0.42 : H * 0.88) - 3 * u;
    L1 = 1.9 * u; L2 = 1.7 * u; LH = 0.75 * u;
    shoulder = { x: cx - 1.35 * u, y: sy + 0.15 * u };
    target = idleGoal();
    solve(target);
    trail.length = 0;
  }

  function solve(goal: P) {
    // fingertips land on the goal, so the wrist aims one hand-length short of it
    const wristGoal = dist(shoulder, goal) > LH ? toward(goal, shoulder, LH) : { ...shoulder };
    ({ e: elbow, w: wrist } = ik(shoulder, wristGoal, L1, L2));
    handAng = dist(wrist, goal) > 1 ? Math.atan2(goal.y - wrist.y, goal.x - wrist.x) : Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x);
    tip = polar(wrist, handAng, LH);
  }

  function idleGoal(): P {
    return {
      x: shoulder.x - 2.6 * u + Math.sin(t * 0.7) * 0.9 * u,
      y: shoulder.y - 0.3 * u + Math.sin(t * 1.4) * 0.7 * u,
    };
  }

  function step() {
    t += 0.016;
    const following = performance.now() - lastMove < 2500;
    const goal = following ? { ...cursor } : idleGoal();
    goal.x = Math.min(goal.x, shoulder.x - 0.4 * u); // reach across the front, not through the body
    goal.y = Math.min(goal.y, sy + 3 * u);
    target.x += (goal.x - target.x) * 0.08;
    target.y += (goal.y - target.y) * 0.08;
    solve(target);
    grip += (gripGoal - grip) * 0.25;
    trail.push({ ...tip });
    if (trail.length > 70) trail.shift();
    return following;
  }

  const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  function draw(following: boolean) {
    ctx.clearRect(0, 0, W, H);
    // cyan structure, gold joints and faceplate, red actuator cores (Stark theme)
    const line = css("--stark-cyan"), bg = css("--bg-deep"), gold = css("--stark-gold"), red = css("--stark-red"), muted = css("--muted");
    ctx.lineCap = "round"; ctx.lineJoin = "round";

    const limb = (a: P, b: P, w: number) => {
      ctx.strokeStyle = line; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.strokeStyle = bg; ctx.lineWidth = Math.max(1.5, w - 4);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    };
    const joint = (p: P, r: number) => {
      ctx.fillStyle = bg; ctx.strokeStyle = gold; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = red;
      ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.38, 0, Math.PI * 2); ctx.fill();
    };
    // Hand in local coordinates: +x along the hand, fingers curl toward +y * side.
    const hand = (p: P, ang: number, curl: number, s: number, side: number) => {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(ang);
      ctx.fillStyle = bg; ctx.strokeStyle = line; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(0, -0.2 * s, 0.45 * s, 0.4 * s, 0.08 * s); ctx.fill(); ctx.stroke();
      ctx.lineWidth = Math.max(2, 0.07 * s);
      const digit = (x: number, y: number, a: number, segs: number[], bend: number[]) => {
        ctx.beginPath(); ctx.moveTo(x, y);
        segs.forEach((len, i) => {
          a += bend[i];
          x += Math.cos(a) * len * s; y += Math.sin(a) * len * s;
          ctx.lineTo(x, y);
        });
        ctx.stroke();
      };
      for (const yo of [-0.15, -0.05, 0.05, 0.15]) {
        digit(0.45 * s, yo * s, 0, [0.24, 0.18], [curl * side * 0.8, curl * side * 1.1]);
      }
      digit(0.1 * s, -side * 0.2 * s, -side * 0.9, [0.2, 0.15], [curl * side * 0.6, curl * side * 0.8]);
      ctx.restore();
    };

    // end-effector trail
    trail.forEach((p, i) => {
      ctx.fillStyle = gold;
      ctx.globalAlpha = (i / trail.length) * 0.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // target crosshair when tracking the cursor
    if (following) {
      ctx.strokeStyle = line; ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(cursor.x, cursor.y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 7, 0, Math.PI * 2);
      ctx.moveTo(cursor.x - 12, cursor.y); ctx.lineTo(cursor.x + 12, cursor.y);
      ctx.moveTo(cursor.x, cursor.y - 12); ctx.lineTo(cursor.x, cursor.y + 12);
      ctx.stroke();
    }

    // display stand
    const waist = sy + 2.4 * u, floor = sy + 3 * u;
    ctx.strokeStyle = line; ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 0.18 * u, waist, 0.36 * u, floor - waist);
    ctx.fillStyle = line;
    ctx.fillRect(cx - 1.3 * u, floor, 2.6 * u, 2);

    // torso
    const T = (x: number, y: number): [number, number] => [cx + x * u, sy + y * u];
    const torso: [number, number][] = [
      T(-0.45, -0.15), T(-1.3, 0), T(-1.45, 0.35), T(-1.15, 1.4), T(-0.75, 2.4),
      T(0.75, 2.4), T(1.15, 1.4), T(1.45, 0.35), T(1.3, 0), T(0.45, -0.15),
    ];
    ctx.fillStyle = bg; ctx.strokeStyle = line; ctx.lineWidth = 1.8;
    ctx.beginPath();
    torso.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // chest plate and abdominal segments
    ctx.globalAlpha = 0.5; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(...T(-1.15, 1.4)); ctx.quadraticCurveTo(...T(0, 1.85), ...T(1.15, 1.4));
    ctx.moveTo(...T(-0.85, 1.95)); ctx.lineTo(...T(0.85, 1.95));
    ctx.moveTo(...T(-0.8, 2.18)); ctx.lineTo(...T(0.8, 2.18));
    ctx.moveTo(...T(0, 1.62)); ctx.lineTo(...T(0, 2.4));
    ctx.stroke();
    ctx.globalAlpha = 1;

    // arc reactor
    const rc = { x: cx, y: sy + 0.75 * u };
    ctx.strokeStyle = line; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(rc.x, rc.y, 0.3 * u, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const p0 = polar(rc, a, 0.18 * u), p1 = polar(rc, a, 0.26 * u);
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    }
    ctx.fillStyle = line;
    ctx.globalAlpha = reduce ? 0.85 : 0.7 + 0.25 * Math.sin(t * 2.2);
    ctx.beginPath(); ctx.arc(rc.x, rc.y, 0.13 * u, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // neck and head; the faceplate and eyes shift toward the target
    ctx.fillStyle = bg; ctx.strokeStyle = line; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.rect(cx - 0.22 * u, sy - 0.48 * u, 0.44 * u, 0.36 * u); ctx.fill(); ctx.stroke();
    const hc = { x: cx, y: sy - 0.98 * u };
    const look = toward({ x: 0, y: 0 }, { x: tip.x - hc.x, y: tip.y - hc.y }, 0.12 * u);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(hc.x, hc.y, 0.5 * u, 0.6 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const fx = hc.x + look.x, fy = hc.y + look.y * 0.6;
    ctx.strokeStyle = gold; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(fx, fy + 0.05 * u, 0.34 * u, 0.44 * u, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx - 0.12 * u, fy + 0.3 * u); ctx.lineTo(fx + 0.12 * u, fy + 0.3 * u); ctx.stroke();
    ctx.strokeStyle = line; ctx.lineWidth = Math.max(2.5, 0.07 * u);
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(fx + s * 0.06 * u, fy - 0.04 * u);
      ctx.lineTo(fx + s * 0.22 * u, fy - 0.09 * u);
      ctx.stroke();
    }

    // resting arm: hand on the hip, rising slightly as if breathing
    const s2 = { x: cx + 1.35 * u, y: sy + 0.15 * u };
    const hip = { x: cx + 1.05 * u, y: sy + 2.15 * u + Math.sin(t * 1.1) * 0.04 * u };
    const rest = ik(s2, hip, L1 * 0.85, L2 * 0.85);
    limb(s2, rest.e, 0.42 * u);
    limb(rest.e, rest.w, 0.34 * u);
    hand(rest.w, Math.atan2(rest.w.y - rest.e.y, rest.w.x - rest.e.x), 0.7, LH * 0.9, 1);
    joint(s2, 0.3 * u); joint(rest.e, 0.22 * u);

    // reaching arm
    limb(shoulder, elbow, 0.42 * u);
    limb(elbow, wrist, 0.34 * u);
    hand(wrist, handAng, 0.15 + grip * 1.05, LH, -1);
    const joints = [shoulder, elbow, wrist];
    const radii = [0.3 * u, 0.22 * u, 0.15 * u];
    joints.forEach((p, i) => joint(p, radii[i]));

    // joint angle readouts, each relative to the previous segment (shoulder relative to hanging down)
    if (!mobile) {
      ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
      ctx.fillStyle = muted; ctx.textAlign = "right";
      const ends = [elbow, wrist, tip];
      let prev = Math.PI / 2;
      joints.forEach((p, i) => {
        const ang = Math.atan2(ends[i].y - p.y, ends[i].x - p.x);
        let q = ((ang - prev) * 180) / Math.PI;
        q = ((q + 540) % 360) - 180;
        prev = ang;
        ctx.fillText(`q${i + 1} ${q.toFixed(0).padStart(4)}°`, p.x - radii[i] - 6, p.y - radii[i] - 6);
      });
      ctx.textAlign = "start";
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
  addEventListener("resize", () => { resize(); if (reduce) draw(false); });
  t = 1.2;
  resize();

  if (reduce) { draw(false); return; }

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
