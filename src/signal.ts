// Hero canvas: scrolling multi-channel "biosignal monitor".
// Cursor speed acts as muscle activation: move faster, EMG bursts harder.
// Click injects an impulse that ripples through the control channel.

type Channel = { name: string; kind: "emg" | "imu" | "eeg" | "ctrl"; buf: Float32Array };

export function mountSignal(canvas: HTMLCanvasElement, names: string[]) {
  const ctx = canvas.getContext("2d")!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(devicePixelRatio || 1, 2);

  const kinds: Channel["kind"][] = ["emg", "emg", "imu", "eeg", "ctrl"];
  let W = 0, H = 0, N = 0;
  let chans: Channel[] = [];

  let activation = 0.08;      // smoothed "effort", 0..1
  let lastX = 0, lastY = 0, lastT = performance.now();
  let impulse = 0;            // decays after click
  let ctrlState = 0, ctrlVel = 0;
  let t = 0;

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    N = Math.max(200, Math.floor(W / 2));
    chans = names.map((name, i) => ({
      name, kind: kinds[i % kinds.length], buf: new Float32Array(N),
    }));
  }

  function onMove(x: number, y: number) {
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    const v = Math.hypot(x - lastX, y - lastY) / dt; // px/ms
    activation = Math.min(1, activation + v * 0.08);
    lastX = x; lastY = y; lastT = now;
  }

  addEventListener("pointermove", (e) => onMove(e.clientX, e.clientY), { passive: true });
  canvas.addEventListener("pointerdown", () => { impulse = 1; });
  addEventListener("resize", resize);
  resize();

  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.8;

  function sample(c: Channel, i: number): number {
    switch (c.kind) {
      case "emg": {
        // agonist / antagonist: second EMG channel gets the co-contraction share
        const a = i === 0 ? activation : activation * 0.45 + 0.03;
        return gauss() * (0.04 + a);
      }
      case "imu":
        return Math.sin(t * 1.6) * (0.25 + activation * 0.5) + gauss() * 0.02;
      case "eeg": {
        // mu rhythm desynchronises (ERD) as activation rises
        const mu = Math.sin(t * 2 * Math.PI * 0.18) * 0.35 * (1 - activation * 0.85);
        return mu + Math.sin(t * 2.7) * 0.1 + gauss() * 0.08;
      }
      case "ctrl": {
        // damped second-order response to impulse + tracking activation
        const ref = activation * 0.6 + impulse * 0.9;
        const acc = 0.09 * (ref - ctrlState) - 0.22 * ctrlVel;
        ctrlVel += acc; ctrlState += ctrlVel;
        return ctrlState - 0.3;
      }
    }
  }

  function step() {
    t += 0.05;
    activation *= 0.965;
    activation = Math.max(0.05, activation);
    impulse *= 0.9;
    chans.forEach((c, i) => {
      c.buf.copyWithin(0, 1);
      c.buf[N - 1] = sample(c, i);
    });
  }

  const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const top = 64; // clear the fixed header
    const lane = (H - top) / chans.length;
    const trace = css("--trace"), dim = css("--trace-dim"), ctrl = css("--trace-ctrl"), grid = css("--grid"), label = css("--muted");

    ctx.strokeStyle = grid; ctx.lineWidth = 1;
    for (let x = W % 48; x < W; x += 48) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }

    chans.forEach((c, k) => {
      const mid = top + lane * k + lane / 2;
      const amp = lane * 0.42;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * W;
        const y = mid - Math.max(-1, Math.min(1, c.buf[i])) * amp;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = k === 0 ? trace : c.kind === "ctrl" ? ctrl : dim;
      ctx.lineWidth = k === 0 || c.kind === "ctrl" ? 1.6 : 1.1;
      ctx.stroke();

      ctx.fillStyle = label;
      ctx.font = "12px 'IBM Plex Sans', sans-serif";
      ctx.fillText(c.name, 12, top + lane * k + 14);
    });
  }

  // prefill so it doesn't start flat
  for (let i = 0; i < N; i++) step();

  if (reduce) { draw(); return; }

  // one rAF chain at a time; paused while the hero is off screen
  let running = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; loop(); }
    else if (!e.isIntersecting) running = false;
  }).observe(canvas);

  function loop() {
    if (!running) return;
    step(); step();
    draw();
    requestAnimationFrame(loop);
  }
}
