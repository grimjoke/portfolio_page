// Hero robot: biomimetic arm, shoulder down, bolted to the side of a T-slot test stand. Side view, facing left.
// Shoulder-elbow-wrist is analytic 2-link IK (elbow down and back); the hand points at the target.
// Braided artificial muscles span the joints: the biceps shortens, thickens and lights up as the
// elbow flexes, the triceps does the opposite. A forearm tendon pack drives the fingers, which
// close on press. Idle: the hand traces a slow figure-8 in front of the rig.

import { telemetry } from "./telemetry";

type P = { x: number; y: number };

export function mountArm(canvas: HTMLCanvasElement, pressTarget: HTMLElement) {
  const ctx = canvas.getContext("2d")!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(devicePixelRatio || 1, 2);

  let W = 0, H = 0, u = 0, mobile = false;
  let L1 = 0, L2 = 0, LH = 0;     // upper arm, forearm, hand
  let shoulder: P = { x: 0, y: 0 }, elbow: P = { x: 0, y: 0 }, wrist: P = { x: 0, y: 0 }, tip: P = { x: 0, y: 0 };
  let handAng = Math.PI;
  let colX = 0, colTop = 0, floorY = 0;
  let target: P = { x: 0, y: 0 };
  let cursor: P = { x: 0, y: 0 };
  let lastMove = -1e9;
  let grip = 0, gripGoal = 0;
  let t = 0;
  let prevBend = 0, elbowVel = 0;
  const trail: P[] = [];

  const dist = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y);
  const toward = (from: P, to: P, len: number): P => {
    const d = dist(from, to) || 1;
    return { x: from.x + ((to.x - from.x) / d) * len, y: from.y + ((to.y - from.y) / d) * len };
  };
  const polar = (o: P, a: number, len: number): P => ({ x: o.x + Math.cos(a) * len, y: o.y + Math.sin(a) * len });
  const along = (a: P, b: P, s: number, side: number, off: number): P => {
    // point at fraction s from a to b, pushed `off` to the +90° (side 1) or -90° (side -1) normal
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    return polar({ x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s }, ang + side * Math.PI / 2, off);
  };

  // Two-link IK by the law of cosines; (a - alpha) keeps the elbow down and back.
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
    u = mobile ? Math.min(W * 0.07, H * 0.038) : Math.min(W * 0.052, H * 0.082);
    shoulder = mobile ? { x: W * 0.74, y: H * 0.2 } : { x: W * 0.8, y: H * 0.36 };
    colX = shoulder.x + 0.75 * u;
    colTop = shoulder.y - 1.5 * u;
    floorY = mobile ? H * 0.42 : H * 0.9;
    L1 = 2.3 * u; L2 = 2.0 * u; LH = 1.05 * u;
    target = idleGoal();
    solve(target);
    sense(); elbowVel = 0; sense(); // second pass: no velocity spike from the jump to the first pose
    trail.length = 0;
  }

  function solve(goal: P) {
    // fingertips land on the goal, so the wrist aims one hand-length short of it
    const wristGoal = dist(shoulder, goal) > LH ? toward(goal, shoulder, LH) : { ...shoulder };
    ({ e: elbow, w: wrist } = ik(shoulder, wristGoal, L1, L2));
    handAng = dist(wrist, goal) > 1 ? Math.atan2(goal.y - wrist.y, goal.x - wrist.x) : Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x);
    tip = polar(wrist, handAng, LH);
  }

  // Muscle model for the readouts, the muscle tint and the EMG traces: a tonic term from elbow
  // flexion (holding against gravity), a phasic burst on the agonist while the elbow moves, and
  // co-contraction while gripping.
  function sense() {
    const th1 = Math.atan2(elbow.y - shoulder.y, elbow.x - shoulder.x);
    const th2 = Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x);
    const bend = Math.atan2(Math.sin(th2 - th1), Math.cos(th2 - th1));
    elbowVel += (bend - prevBend - elbowVel) * 0.3;
    prevBend = bend;
    const flex = Math.min(1, Math.max(0, bend / 2.6));
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    telemetry.flex = flex;
    telemetry.elbowVel = elbowVel;
    telemetry.biceps = clamp(0.1 + 0.3 * flex + Math.max(0, elbowVel) * 10 + grip * 0.25);
    telemetry.triceps = clamp(0.08 + 0.25 * (1 - flex) + Math.max(0, -elbowVel) * 10 + grip * 0.15);
  }

  function idleGoal(): P {
    return {
      x: shoulder.x - 3.1 * u + Math.sin(t * 0.7) * 0.9 * u,
      y: shoulder.y + 1.5 * u + Math.sin(t * 1.4) * 0.8 * u,
    };
  }

  function step() {
    t += 0.016;
    const following = performance.now() - lastMove < 2500;
    const goal = following ? { ...cursor } : idleGoal();
    goal.x = Math.min(goal.x, shoulder.x - 0.5 * u); // stay in front of the rig
    goal.y = Math.min(Math.max(goal.y, shoulder.y - 4.5 * u), floorY - 0.3 * u);
    target.x += (goal.x - target.x) * 0.08;
    target.y += (goal.y - target.y) * 0.08;
    solve(target);
    grip += (gripGoal - grip) * 0.25;
    sense();
    trail.push({ ...tip });
    if (trail.length > 70) trail.shift();
    return following;
  }

  const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  function draw(following: boolean) {
    ctx.clearRect(0, 0, W, H);
    // cyan structure, gold joints and active muscle, red actuator cores (Stark theme)
    const line = css("--stark-cyan"), bg = css("--bg-deep"), gold = css("--stark-gold"), red = css("--stark-red"), muted = css("--muted");
    ctx.lineCap = "round"; ctx.lineJoin = "round";

    const seg = (a: P, b: P) => { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
    const bolt = (p: P, r: number) => {
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
      seg({ x: p.x - r * 0.6, y: p.y }, { x: p.x + r * 0.6, y: p.y });
    };
    const joint = (p: P, r: number) => {
      ctx.fillStyle = bg; ctx.strokeStyle = gold; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = red;
      ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.38, 0, Math.PI * 2); ctx.fill();
    };
    // Axis-aligned T-slot extrusion: outlined bar with a centre slot.
    const extrusion = (x: number, y: number, w: number, h: number) => {
      ctx.fillStyle = bg; ctx.strokeStyle = line; ctx.lineWidth = 1.5;
      ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
      ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
      if (w > h) { seg({ x: x + 4, y: y + h * 0.38 }, { x: x + w - 4, y: y + h * 0.38 }); seg({ x: x + 4, y: y + h * 0.62 }, { x: x + w - 4, y: y + h * 0.62 }); }
      else { seg({ x: x + w * 0.38, y: y + 4 }, { x: x + w * 0.38, y: y + h - 4 }); seg({ x: x + w * 0.62, y: y + 4 }, { x: x + w * 0.62, y: y + h - 4 }); }
      ctx.globalAlpha = 1;
    };
    // McKibben-style braided muscle between two anchors. `act` 0..1 tints it gold.
    const muscle = (a: P, b: P, width: number, act: number) => {
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const len = dist(a, b);
      const n = Math.max(6, Math.round(len / (0.22 * u)));
      const half = (s: number) => (width / 2) * (0.25 + 0.75 * Math.sin(Math.PI * s));
      const pt = (s: number, side: number) => polar(polar(a, ang, len * s), ang + Math.PI / 2, side * half(s));
      ctx.beginPath();
      for (let i = 0; i <= n; i++) { const p = pt(i / n, 1); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }
      for (let i = n; i >= 0; i--) { const p = pt(i / n, -1); ctx.lineTo(p.x, p.y); }
      ctx.closePath();
      ctx.fillStyle = bg; ctx.fill();
      ctx.strokeStyle = line; ctx.lineWidth = 1.4; ctx.stroke();
      if (act > 0.05) { ctx.strokeStyle = gold; ctx.globalAlpha = act; ctx.lineWidth = 1.8; ctx.stroke(); ctx.globalAlpha = 1; }
      // braid: crossing diagonals make the diamond weave
      ctx.strokeStyle = act > 0.5 ? gold : line; ctx.globalAlpha = 0.35 + act * 0.3; ctx.lineWidth = 0.8;
      for (let i = 0; i < n; i++) {
        seg(pt(i / n, 1), pt((i + 1) / n, -1));
        seg(pt(i / n, -1), pt((i + 1) / n, 1));
      }
      ctx.globalAlpha = 1;
      // end fittings
      ctx.fillStyle = gold;
      for (const p of [a, b]) { ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(2, 0.05 * u), 0, Math.PI * 2); ctx.fill(); }
    };
    // Hand in local coordinates: +x along the hand, fingers curl toward +y * side.
    const hand = (p: P, ang: number, curl: number, s: number, side: number) => {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(ang);
      // palm plate with metacarpals
      ctx.fillStyle = bg; ctx.strokeStyle = line; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(0.02 * s, -0.17 * s, 0.46 * s, 0.34 * s, 0.07 * s); ctx.fill(); ctx.stroke();
      ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
      for (const yo of [-0.09, -0.03, 0.03, 0.09]) seg({ x: 0.1 * s, y: yo * s }, { x: 0.44 * s, y: yo * 1.3 * s });
      ctx.globalAlpha = 1;
      const knuckles: P[] = [];
      const digit = (x: number, y: number, a: number, segs: number[], bend: number[]) => {
        ctx.strokeStyle = line; ctx.lineWidth = Math.max(2.2, 0.06 * s);
        knuckles.push({ x, y });
        ctx.beginPath(); ctx.moveTo(x, y);
        segs.forEach((len, i) => {
          a += bend[i];
          x += Math.cos(a) * len * s; y += Math.sin(a) * len * s;
          ctx.lineTo(x, y);
          if (i < segs.length - 1) knuckles.push({ x, y });
        });
        ctx.stroke();
      };
      // fingers fan slightly so they read in side view; index to little finger
      [-0.12, -0.04, 0.04, 0.12].forEach((yo, k) => {
        const lenScale = [0.95, 1, 0.95, 0.8][k];
        digit(0.48 * s, yo * 1.3 * s, yo * 0.6, [0.2 * lenScale, 0.14 * lenScale, 0.1 * lenScale],
          [curl * side * 0.55, curl * side * 0.75, curl * side * 0.6]);
      });
      digit(0.14 * s, -side * 0.17 * s, -side * 0.75, [0.17, 0.13], [curl * side * 0.55, curl * side * 0.65]);
      ctx.fillStyle = gold;
      for (const k of knuckles) { ctx.beginPath(); ctx.arc(k.x, k.y, Math.max(1.6, 0.028 * s), 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    };

    // ---------- frame: column stand, shoulder plate on its side ----------
    const bw = 0.32 * u; // extrusion width
    // power/signal cable from the shoulder housing down the back of the column
    ctx.strokeStyle = line; ctx.globalAlpha = 0.35; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(shoulder.x + 0.3 * u, shoulder.y + 0.35 * u);
    ctx.bezierCurveTo(shoulder.x + 0.9 * u, shoulder.y + 1.2 * u, colX + bw + 0.5 * u, shoulder.y + 0.4 * u, colX + bw + 0.12 * u, shoulder.y + 1.4 * u);
    ctx.lineTo(colX + bw + 0.12 * u, floorY - 0.15 * u);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // diagonal braces behind the column
    ctx.strokeStyle = line; ctx.lineWidth = 1.5;
    for (const dx of [-1.25, 1.0]) {
      const fx = dx < 0 ? colX : colX + bw;
      seg({ x: fx, y: floorY - 1.1 * u }, { x: fx + dx * u, y: floorY });
    }
    extrusion(colX, colTop, bw, floorY - colTop);                 // column
    extrusion(colX - 1.6 * u, floorY, 2.9 * u + bw, bw);           // foot
    ctx.fillStyle = bg; ctx.strokeStyle = line; ctx.lineWidth = 1.5;
    ctx.fillRect(colX - 0.05 * u, colTop - 0.08 * u, bw + 0.1 * u, 0.08 * u); // end cap
    ctx.strokeRect(colX - 0.05 * u, colTop - 0.08 * u, bw + 0.1 * u, 0.08 * u);

    // shoulder plate bolted to the column face
    const bx = shoulder.x - 0.55 * u, by = shoulder.y - 0.72 * u, bwid = colX - bx + bw * 0.5, bh = 1.32 * u;
    ctx.fillStyle = bg; ctx.strokeStyle = line; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(bx, by, bwid, bh, [0.5 * u, 0, 0, 0.5 * u]); ctx.fill(); ctx.stroke();
    for (const dy of [0.16, 1.16]) bolt({ x: colX + bw * 0.5, y: by + dy * u }, 0.05 * u);

    // ---------- arm ----------
    const th1 = Math.atan2(elbow.y - shoulder.y, elbow.x - shoulder.x);
    const th2 = Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x);
    let bend = th2 - th1; bend = Math.atan2(Math.sin(bend), Math.cos(bend));
    const flex = Math.min(1, Math.max(0, bend / 2.6)); // 0 straight, 1 fully flexed

    // deltoid pair: bracket to humerus, front (+) and back (-). raise: 0 hanging down, 1 pointing up.
    const raise = Math.min(1, Math.max(0, (((th1 + 2 * Math.PI) % (2 * Math.PI)) - Math.PI / 2) / Math.PI));
    muscle({ x: bx + 0.15 * u, y: by + 0.2 * u }, along(shoulder, elbow, 0.38, 1, 0.14 * u), 0.24 * u, raise);
    muscle({ x: colX - 0.12 * u, y: by + 0.18 * u }, along(shoulder, elbow, 0.38, -1, 0.14 * u), 0.22 * u, (1 - raise) * 0.3);

    // humerus: tube with collars
    ctx.strokeStyle = line; ctx.lineWidth = 0.2 * u; seg(shoulder, elbow);
    ctx.strokeStyle = bg; ctx.lineWidth = 0.2 * u - 3; seg(shoulder, elbow);
    ctx.strokeStyle = line; ctx.lineWidth = 1.2;
    for (const s of [0.3, 0.7]) seg(along(shoulder, elbow, s, 1, 0.13 * u), along(shoulder, elbow, s, -1, 0.13 * u));

    // forearm: radius and ulna struts with spacer plates
    for (const side of [1, -1]) {
      ctx.strokeStyle = line; ctx.lineWidth = 2.2;
      seg(along(elbow, wrist, 0.05, side, 0.1 * u), along(elbow, wrist, 1, side, 0.06 * u));
    }
    ctx.lineWidth = 1.4;
    for (const s of [0.35, 0.7]) seg(along(elbow, wrist, s, 1, 0.12 * u), along(elbow, wrist, s, -1, 0.12 * u));

    // tendon-drive pack on the back of the forearm, cables to the hand
    const pa = along(elbow, wrist, 0.22, -1, 0.26 * u), pb = along(elbow, wrist, 0.62, -1, 0.26 * u);
    ctx.save();
    ctx.translate(pa.x, pa.y); ctx.rotate(th2);
    const plen = dist(pa, pb);
    ctx.fillStyle = bg; ctx.strokeStyle = line; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.roundRect(0, -0.14 * u, plen, 0.28 * u, 0.05 * u); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = gold; ctx.lineWidth = 1.2;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(plen * (0.22 + k * 0.28), 0, 0.075 * u, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = line; ctx.globalAlpha = 0.6; ctx.lineWidth = 1;
    for (const off of [0.2, 0.26, 0.32]) {
      const from = along(elbow, wrist, 0.62, -1, off * u);
      const via = along(elbow, wrist, 0.97, -1, (off - 0.16) * u);
      const end = polar(wrist, handAng, 0.35 * LH);
      ctx.beginPath(); ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(via.x, via.y, end.x, end.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // biceps (front, +) and triceps (back, -) across the elbow
    const biA = along(shoulder, elbow, 0.12, 1, 0.22 * u), biB = along(elbow, wrist, 0.22, 1, 0.14 * u);
    const olecranon = polar(elbow, th2 + Math.PI, 0.28 * u);
    const triA = along(shoulder, elbow, 0.15, -1, 0.22 * u);
    muscle(biA, biB, u * (0.2 + 0.3 * flex), telemetry.biceps);
    muscle(triA, olecranon, u * (0.26 - 0.08 * flex), telemetry.triceps);

    // hand and joints
    hand(wrist, handAng, 0.15 + grip * 1.05, LH, -1);
    ctx.fillStyle = bg; ctx.strokeStyle = line; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(shoulder.x, shoulder.y, 0.46 * u, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // motor housing
    for (let k = 0; k < 6; k++) bolt(polar(shoulder, (k / 6) * Math.PI * 2 + 0.3, 0.38 * u), 0.035 * u);
    joint(shoulder, 0.27 * u); joint(elbow, 0.2 * u); joint(wrist, 0.13 * u);

    // end-effector trail and target crosshair
    trail.forEach((p, i) => {
      ctx.fillStyle = gold;
      ctx.globalAlpha = (i / trail.length) * 0.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (following) {
      ctx.strokeStyle = line; ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      seg(tip, cursor);
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 7, 0, Math.PI * 2);
      ctx.moveTo(cursor.x - 12, cursor.y); ctx.lineTo(cursor.x + 12, cursor.y);
      ctx.moveTo(cursor.x, cursor.y - 12); ctx.lineTo(cursor.x, cursor.y + 12);
      ctx.stroke();
    }

    // readouts: joint angles (shoulder relative to hanging down) and muscle activation
    if (!mobile) {
      ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
      ctx.fillStyle = muted; ctx.textAlign = "left";
      const q = (a: number) => (((a * 180) / Math.PI + 540) % 360) - 180;
      const rows = [
        `q1 ${q(th1 - Math.PI / 2).toFixed(0).padStart(4)}°`,
        `q2 ${q(bend).toFixed(0).padStart(4)}°`,
        `q3 ${q(handAng - th2).toFixed(0).padStart(4)}°`,
        `biceps  ${(telemetry.biceps * 100).toFixed(0).padStart(3)}%`,
        `triceps ${(telemetry.triceps * 100).toFixed(0).padStart(3)}%`,
        `grip    ${(grip * 100).toFixed(0).padStart(3)}%`,
      ];
      const x0 = colX + bw + 0.45 * u, y0 = shoulder.y - 0.6 * u;
      rows.forEach((r, i) => ctx.fillText(r, x0, y0 + i * 16));
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
