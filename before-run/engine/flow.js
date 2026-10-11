/* Packet flow for the one-take engine.
 *
 * Thousands of packets along paths on a plane, drawn into ONE <canvas> per flow, every frame, from t alone:
 * packet i is born at b_i = f(i) (the inverse of the cumulative rate), and its position is
 * path((t - b_i) · v_i) plus a lateral offset from hash(i). No state carries between frames, so any seek is exact
 * and the cost depends only on how many packets are in flight (not on how many have ever been sent).
 * A few labelled packets ("SYN", "GET /ubuntu/pool/…") are DOM elements (bursts) so their text stays crisp.
 * API reference: engine/ENGINE.md ("Packet flow").
 */
(function () {
  const OT = window.OT;
  const { clamp, lerp, sstep, E } = OT;
  const TAU = Math.PI * 2;

  // ------------------------------------------------------------------ paths
  /* Arc-length parametrised path, resampled every `step` px.
   * spec: [[x,y], ...] (polyline; o.curve > 0 rounds it through the points, Catmull-Rom; 1 = classic)
   *     | "M x y C … L … Q … Z" (SVG path data: M L H V C S Q Z, absolute or relative)
   * → { L, at(s) → {x, y, nx, ny, a} (a = heading in radians), X, Y, NX, NY, step, n, box } */
  const path = (spec, o = {}) => {
    const step0 = o.step || 2;
    const curves = [];                       // cubic segments [x0,y0,x1,y1,x2,y2,x3,y3]
    const line = (a, b) => curves.push([a[0], a[1], lerp(a[0], b[0], 1 / 3), lerp(a[1], b[1], 1 / 3), lerp(a[0], b[0], 2 / 3), lerp(a[1], b[1], 2 / 3), b[0], b[1]]);
    if (typeof spec === "string") parseD(spec, curves, line);
    else {
      const P = spec, k = (o.curve ?? 0) / 6;
      for (let i = 0; i < P.length - 1; i++) {
        if (!k) { line(P[i], P[i + 1]); continue; }
        const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
        curves.push([p1[0], p1[1], p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k, p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k, p2[0], p2[1]]);
      }
    }
    // dense samples → cumulative length → uniform resample
    const dx = [], dy = [], dl = [0];
    curves.forEach((c, ci) => {
      const est = Math.hypot(c[2] - c[0], c[3] - c[1]) + Math.hypot(c[4] - c[2], c[5] - c[3]) + Math.hypot(c[6] - c[4], c[7] - c[5]);
      const n = Math.max(2, Math.ceil(est / 0.75));
      for (let j = ci ? 1 : 0; j <= n; j++) {
        const u = j / n, v = 1 - u;
        const x = v * v * v * c[0] + 3 * v * v * u * c[2] + 3 * v * u * u * c[4] + u * u * u * c[6];
        const y = v * v * v * c[1] + 3 * v * v * u * c[3] + 3 * v * u * u * c[5] + u * u * u * c[7];
        if (dx.length) dl.push(dl[dl.length - 1] + Math.hypot(x - dx[dx.length - 1], y - dy[dy.length - 1]));
        dx.push(x); dy.push(y);
      }
    });
    const L = dl[dl.length - 1];
    const n = Math.max(2, Math.ceil(L / step0) + 1), step = L / (n - 1);   // exact spacing: at(L) is the end point
    const X = new Float32Array(n), Y = new Float32Array(n), NX = new Float32Array(n), NY = new Float32Array(n);
    let j = 0;
    for (let i = 0; i < n; i++) {
      const s = i === n - 1 ? L : i * step;
      while (j < dl.length - 2 && dl[j + 1] < s) j++;
      const f = dl[j + 1] > dl[j] ? (s - dl[j]) / (dl[j + 1] - dl[j]) : 0;
      X[i] = lerp(dx[j], dx[j + 1], f); Y[i] = lerp(dy[j], dy[j + 1], f);
    }
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - 2), b = Math.min(n - 1, i + 2);
      const tx = X[b] - X[a], ty = Y[b] - Y[a], m = Math.hypot(tx, ty) || 1;
      NX[i] = -ty / m; NY[i] = tx / m;
    }
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < n; i++) { x0 = Math.min(x0, X[i]); y0 = Math.min(y0, Y[i]); x1 = Math.max(x1, X[i]); y1 = Math.max(y1, Y[i]); }
    const at = (s) => {
      const k = clamp(s, 0, L) / step, i = Math.min(n - 2, Math.floor(k)), f = k - i;
      return { x: X[i] + (X[i + 1] - X[i]) * f, y: Y[i] + (Y[i + 1] - Y[i]) * f, nx: NX[i], ny: NY[i], a: Math.atan2(-NX[i], NY[i]) };
    };
    return { L, step, n, X, Y, NX, NY, at, box: [x0, y0, x1, y1] };
  };

  function parseD(d, curves, line) {
    const tok = d.match(/[MLHVCSQZmlhvcsqz]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
    let i = 0, cmd = "", cx = 0, cy = 0, sx = 0, sy = 0, lc = null;
    const num = () => +tok[i++];
    while (i < tok.length) {
      if (/[A-Za-z]/.test(tok[i])) cmd = tok[i++];
      const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
      const ox = rel ? cx : 0, oy = rel ? cy : 0;
      if (C === "M") { cx = ox + num(); cy = oy + num(); sx = cx; sy = cy; cmd = rel ? "l" : "L"; lc = null; }
      else if (C === "L") { const x = ox + num(), y = oy + num(); line([cx, cy], [x, y]); cx = x; cy = y; lc = null; }
      else if (C === "H") { const x = ox + num(); line([cx, cy], [x, cy]); cx = x; lc = null; }
      else if (C === "V") { const y = oy + num(); line([cx, cy], [cx, y]); cy = y; lc = null; }
      else if (C === "C") { const c = [cx, cy, ox + num(), oy + num(), ox + num(), oy + num(), ox + num(), oy + num()]; curves.push(c); cx = c[6]; cy = c[7]; lc = [c[4], c[5]]; }
      else if (C === "S") { const r = lc ? [2 * cx - lc[0], 2 * cy - lc[1]] : [cx, cy]; const c = [cx, cy, r[0], r[1], ox + num(), oy + num(), ox + num(), oy + num()]; curves.push(c); cx = c[6]; cy = c[7]; lc = [c[4], c[5]]; }
      else if (C === "Q") { const qx = ox + num(), qy = oy + num(), x = ox + num(), y = oy + num(); curves.push([cx, cy, cx + (2 / 3) * (qx - cx), cy + (2 / 3) * (qy - cy), x + (2 / 3) * (qx - x), y + (2 / 3) * (qy - y), x, y]); cx = x; cy = y; lc = null; }
      else if (C === "Z") { if (cx !== sx || cy !== sy) line([cx, cy], [sx, sy]); cx = sx; cy = sy; lc = null; }
      else throw new Error(`OT.flow.path: unsupported command ${cmd}`);
    }
  }

  // ------------------------------------------------------------------ birth schedules
  /* cumulative count N(t) of a piecewise-linear rate [[t, packets/s], ...] (zero outside the keys) and its inverse */
  const schedule = (keys) => {
    const K = keys.map(([t, r]) => [t, r]), C = [0];
    for (let k = 1; k < K.length; k++) C.push(C[k - 1] + ((K[k][1] + K[k - 1][1]) / 2) * (K[k][0] - K[k - 1][0]));
    const total = C[C.length - 1];
    const N = (t) => {
      if (t <= K[0][0]) return 0;
      if (t >= K[K.length - 1][0]) return total;
      let k = 0; while (K[k + 1][0] < t) k++;
      const x = t - K[k][0], dt = K[k + 1][0] - K[k][0], a = (K[k + 1][1] - K[k][1]) / (2 * dt);
      return C[k] + K[k][1] * x + a * x * x;
    };
    const inv = (c) => {
      if (c <= 0) return K[0][0];
      if (c >= total) return K[K.length - 1][0];
      let k = 0; while (C[k + 1] < c) k++;
      const d = c - C[k], dt = K[k + 1][0] - K[k][0], a = (K[k + 1][1] - K[k][1]) / (2 * dt), b = K[k][1];
      const q = b * b + 4 * a * d;
      return K[k][0] + (2 * d) / (b + Math.sqrt(Math.max(0, q)) || 1e-9);
    };
    return { N, inv, total };
  };

  // ------------------------------------------------------------------ the flow
  /* OT.flow(parent, opts) → flow;  call flow.render(t) every frame.
   * opts: { nodes:{name:[x,y]}, streams:[…], bursts:[…], res:1 (canvas pixels per local px; raise it if the camera
   *         pushes in past scale 1), box:[x0,y0,x1,y1] (canvas rect; default = all stream paths + margin) }
   * stream: { path | route:[node names] (+ curve 0.6), rate: n (with from/to) | [[t, n/s], …] | births:[t, …],
   *           speed:900 px/s, speedVar:0.25 (±, overtaking = out of order), lateral:18 (bundle half-width),
   *           pinch:0.6 (bundle narrows into the nodes), wander:6, wavelength:420, jitter:0.6 (birth jitter, slots),
   *           size:3, trail:0 (streak length px; 0 = dots), color:"#8fe0ff", alpha:0.9, glow:0.6 (halo),
   *           blend:"lighter"|"source-over", fade:40 (px at both ends), loss:0, lossColor:"#ff8a6a",
   *           lossFade:90 (path px over which a lost packet fades out; raise it on wide maps),
   *           land:{ at:(i, birth)→[x,y], dur:0.5, hold:1, fade:0.4, ease:"cubicOut" } (packets settle somewhere), seed }
   * burst: { path | route, at, dur:0.9, ease:"cubicInOut", label, color:"#8fe0ff", size:16, tail:110, side:1,
   *          hold:0.25 (rest at the end), ping:true (ring at arrival), labelSize:24, keepLabel:false, cls }
   * opts.burstParent: put the bursts (dots, labels) in another element, e.g. the same plane after a window that
   *   covers the end of the path, so labels are not hidden under it. */
  const flow = (OT.flow = (parent, opts = {}) => {
    const nodes = opts.nodes || {};
    // a built path (OT.flow.path) is used as is; raw specs (point arrays — which also have .at() — or SVG strings) are built
    const built = (q) => q && !Array.isArray(q) && typeof q !== "string" && typeof q.at === "function" && q.L != null;
    const mkPath = (s) => (s.path ? (built(s.path) ? s.path : path(s.path, s)) : path(s.route.map((n) => { if (!nodes[n]) throw new Error(`OT.flow: no node ${n}`); return nodes[n]; }), { curve: 0.6, ...s }));

    const streams = (opts.streams || []).map((s0, k) => {
      const s = { speed: 900, speedVar: 0.25, lateral: 18, pinch: 0.6, wander: 6, wavelength: 420, jitter: 0.6, size: 3, trail: 0, color: "#8fe0ff", alpha: 0.9, glow: 0.6, blend: "lighter", fade: 40, loss: 0, lossColor: "#ff8a6a", lossFade: 90, seed: 11 + k * 7, ...s0 };
      s.P = mkPath(s);
      // bundle profile along the path (narrow into the nodes), sampled like the path
      s.PR = new Float32Array(s.P.n);
      for (let i = 0; i < s.P.n; i++) s.PR[i] = s.pinch ? Math.pow(Math.sin(Math.PI * clamp((i * s.P.step) / s.P.L)), s.pinch) : 1;
      s.tmp = new Float32Array(4);
      if (s.births) { s.B = Float64Array.from(s.births).sort(); s.total = s.B.length; }
      else {
        s.S = schedule(Array.isArray(s.rate) ? s.rate : [[s.from ?? 0, s.rate], [s.to ?? 1e9, s.rate]]);
        s.total = Math.floor(s.S.total);
      }
      s.vmin = s.speed * (1 - s.speedVar);
      s.land = s.land ? { dur: 0.5, hold: 1, fade: 0.4, ease: "cubicOut", ...s.land } : null;
      s.maxAge = s.P.L / s.vmin + (s.land ? s.land.dur + s.land.hold + s.land.fade : 0);
      s.count = (t) => (s.B ? upper(s.B, t) : Math.min(s.total, Math.floor(s.S.N(t))));
      return s;
    });

    // canvas over the union of the paths (+ the landing area, which the sequence passes in opts.box if it is far)
    let box = opts.box;
    if (!box) {
      box = [Infinity, Infinity, -Infinity, -Infinity];
      streams.forEach((s) => { const m = s.lateral + s.wander + s.size * 4 + 24; const b = s.P.box; box = [Math.min(box[0], b[0] - m), Math.min(box[1], b[1] - m), Math.max(box[2], b[2] + m), Math.max(box[3], b[3] + m)]; });
      if (!streams.length) box = [0, 0, 2, 2];
    }
    box = [Math.floor(box[0]), Math.floor(box[1]), Math.ceil(box[2]), Math.ceil(box[3])];
    const res = opts.res || 1;
    const el = OT.el("div", "ot-flow " + (opts.cls || ""), parent);
    const cv = OT.el("canvas", "", el);
    const W = box[2] - box[0], H = box[3] - box[1];
    cv.width = Math.ceil(W * res); cv.height = Math.ceil(H * res);
    cv.style.cssText = `position:absolute;left:${box[0]}px;top:${box[1]}px;width:${W}px;height:${H}px;`;
    const g = cv.getContext("2d");

    // bursts: a dot, a comet tail, a label, a ring
    const bursts = (opts.bursts || []).map((b0) => {
      const b = { dur: 0.9, ease: "cubicInOut", color: "#8fe0ff", size: 16, tail: 110, side: 1, hold: 0.25, ping: true, labelSize: 24, ...b0 };
      b.P = mkPath(b);
      const host = opts.burstParent ? OT.el("div", "ot-flow", opts.burstParent) : el;   // bursts may sit above other layers
      b.ring = OT.el("div", "fb-ring", host); b.tailEl = OT.el("div", "fb-tail", host); b.dot = OT.el("div", "fb-dot", host);
      b.lab = b.label ? OT.el("div", "fb-lab " + (b.cls || ""), host) : null;
      if (b.lab) { b.lab.textContent = b.label; b.lab.style.fontSize = b.labelSize + "px"; b.lab.style.color = b.color; }
      b.dot.style.cssText += `width:${b.size}px;height:${b.size}px;background:${b.color};box-shadow:0 0 ${b.size}px ${b.color};`;
      b.tailEl.style.cssText += `height:${Math.max(2, b.size * 0.45)}px;background:linear-gradient(90deg, rgba(0,0,0,0), ${b.color});`;
      b.ring.style.cssText += `width:${b.size * 3}px;height:${b.size * 3}px;border-color:${b.color};`;
      [b.ring, b.tailEl, b.dot, b.lab].forEach((e) => e && (e.style.visibility = "hidden"));
      return b;
    });

    const LV = 8;                                    // alpha buckets per colour (one stroke call each)
    const buf = [], bufN = [];
    const ensure = (k, n) => { if (!buf[k] || buf[k].length < n) buf[k] = new Float32Array(Math.max(n, (buf[k] ? buf[k].length : 0) * 2, 4096)); };
    let painted = false;
    const stats = { drawn: 0 };

    const drawStream = (s, t) => {
      // which packets can be in flight: born in [t - maxAge, t]
      let i0, i1;
      if (s.B) { i0 = upper(s.B, t - s.maxAge - 1e-9); i1 = upper(s.B, t) - 1; }
      else { i0 = Math.max(0, Math.floor(s.S.N(t - s.maxAge)) - 2); i1 = Math.min(s.total - 1, Math.ceil(s.S.N(t)) + 1); }
      if (i1 < i0) return 0;
      const P = s.P, L = P.L, step = P.step, n = P.n, X = P.X, Y = P.Y, NX = P.NX, NY = P.NY;
      const groups = s.loss > 0 ? 2 : 1;
      for (let k = 0; k < LV * groups; k++) { bufN[k] = 0; ensure(k, 4 * (i1 - i0 + 1)); }
      const posAt = (sd, off, out, o) => {
        const kk = sd / step, i = Math.min(n - 2, Math.max(0, Math.floor(kk))), f = kk - i;
        out[o] = X[i] + (X[i + 1] - X[i]) * f + NX[i] * off; out[o + 1] = Y[i] + (Y[i + 1] - Y[i]) * f + NY[i] * off;
      };
      const tmp = s.tmp, PR = s.PR, wan = s.wander;
      const lw = s.wavelength > 0 ? TAU / s.wavelength : 0;
      const offAt = (d, lat, ph) => lat * PR[Math.min(n - 1, Math.max(0, Math.round(d / step)))] + wan * Math.sin(d * lw + ph);
      let drawn = 0;
      for (let i = i0; i <= i1; i++) {
        const h1 = OT.hash(i, s.seed), h2 = OT.hash(i, s.seed + 1), h3 = OT.hash(i, s.seed + 2);
        const b = s.B ? s.B[i] : s.S.inv(i + 0.5 + s.jitter * (OT.hash(i, s.seed + 5) - 0.5));
        const age = t - b;
        if (age < 0 || age > s.maxAge) continue;
        const v = s.speed * (1 + s.speedVar * (2 * h1 - 1));
        const sd = age * v;
        const lateral = s.lateral * (2 * h2 - 1), ph = h3 * TAU;
        let a = s.alpha, grp = 0;
        if (sd <= L) {
          a *= Math.min(1, sd / s.fade) * (s.land ? 1 : Math.min(1, (L - sd) / s.fade));
          if (s.loss > 0 && OT.hash(i, s.seed + 3) < s.loss) {
            const die = L * (0.3 + 0.45 * OT.hash(i, s.seed + 4));
            if (sd > die) { grp = 1; a *= 1 - clamp((sd - die) / s.lossFade); }
          }
          posAt(sd, offAt(sd, lateral, ph), tmp, 2);
          const st = Math.max(0, sd - s.trail);
          posAt(st, offAt(st, lateral, ph), tmp, 0);
        } else if (s.land) {
          const tl = (sd - L) / v, Ld = s.land;
          if (tl > Ld.dur + Ld.hold + Ld.fade) continue;
          posAt(L, offAt(L, lateral, ph), tmp, 0);
          const [lx, ly] = Ld.at(i, b);
          const u = E[Ld.ease](clamp(tl / Ld.dur));
          tmp[2] = lerp(tmp[0], lx, u); tmp[3] = lerp(tmp[1], ly, u);
          const u0 = E[Ld.ease](clamp((tl - (s.trail / v)) / Ld.dur));
          tmp[0] = lerp(tmp[0], lx, u0); tmp[1] = lerp(tmp[1], ly, u0);
          a *= 1 - clamp((tl - Ld.dur - Ld.hold) / Ld.fade);
        } else continue;
        if (a < 0.02) continue;
        const k = grp * LV + Math.min(LV - 1, Math.round(a * (LV - 1)));
        const B = buf[k], m = bufN[k];
        B[m] = tmp[0]; B[m + 1] = tmp[1]; B[m + 2] = tmp[2]; B[m + 3] = tmp[3];
        bufN[k] = m + 4; drawn++;
      }
      if (!drawn) return 0;
      g.globalCompositeOperation = s.blend;
      g.lineCap = "round";
      const pass = (lw2, am) => {
        for (let k = 0; k < LV * groups; k++) {
          const m = bufN[k]; if (!m) continue;
          const B = buf[k];
          g.strokeStyle = k < LV ? s.color : s.lossColor;
          g.globalAlpha = Math.min(1, ((k % LV) / (LV - 1)) * am);
          g.lineWidth = lw2;
          g.beginPath();
          for (let q = 0; q < m; q += 4) {
            const dx = B[q + 2] - B[q], dy = B[q + 3] - B[q + 1];
            if (dx * dx + dy * dy < 0.01) { g.moveTo(B[q + 2] - 0.05, B[q + 3]); g.lineTo(B[q + 2] + 0.05, B[q + 3]); }
            else { g.moveTo(B[q], B[q + 1]); g.lineTo(B[q + 2], B[q + 3]); }
          }
          g.stroke();
        }
      };
      if (s.glow > 0) pass(s.size * 3.2, s.glow * 0.22);
      pass(s.size, 1);
      return drawn;
    };

    const f = {
      el, canvas: cv, box, streams, bursts, stats, path,
      stream: (k) => streams[k],
      render(t) {
        // canvas: clear only if something was painted last time
        if (painted) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; g.clearRect(0, 0, cv.width, cv.height); painted = false; }
        g.setTransform(res, 0, 0, res, -box[0] * res, -box[1] * res);
        let drawn = 0;
        streams.forEach((s) => { drawn += drawStream(s, t); });
        painted = drawn > 0; stats.drawn = drawn;
        const cvVis = painted ? "inherit" : "hidden";
        if (cv.style.visibility !== cvVis) cv.style.visibility = cvVis;

        bursts.forEach((b) => {
          const d = t - b.at, end = b.dur + b.hold;
          const on = d >= -0.15 && d < end + 0.4;
          const vis = on ? "inherit" : "hidden";
          [b.dot, b.tailEl, b.lab].forEach((e) => e && e.style.visibility !== vis && (e.style.visibility = vis));
          // arrival ring
          const rd = d - b.dur;
          const ringOn = b.ping && rd >= 0 && rd < 0.7;
          b.ring.style.visibility = ringOn ? "inherit" : "hidden";
          if (ringOn) {
            const q = b.P.at(b.P.L);
            const sc = lerp(0.4, 2.6, E.cubicOut(rd / 0.7));
            b.ring.style.transform = `translate(${(q.x - b.size * 1.5).toFixed(1)}px, ${(q.y - b.size * 1.5).toFixed(1)}px) scale(${sc.toFixed(3)})`;
            b.ring.style.opacity = (0.85 * (1 - rd / 0.7)).toFixed(3);
          }
          if (!on) return;
          const u = E[b.ease](clamp(d / b.dur));
          const p = b.P.at(u * b.P.L);
          const a = sstep(-0.15, 0.02, d) * (1 - sstep(end, end + 0.4, d));
          b.dot.style.transform = `translate(${(p.x - b.size / 2).toFixed(1)}px, ${(p.y - b.size / 2).toFixed(1)}px)`;
          b.dot.style.opacity = a.toFixed(3);
          // the tail is longest mid-flight (speed), gone at rest
          const sp = d > 0 && d < b.dur ? Math.sin(Math.PI * clamp(d / b.dur)) : 0;
          b.tailEl.style.width = b.tail + "px";
          b.tailEl.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) rotate(${p.a.toFixed(4)}rad) scaleX(${Math.max(0.001, sp).toFixed(3)}) translate(-100%, -50%)`;
          b.tailEl.style.opacity = (a * 0.9).toFixed(3);
          if (b.lab) {
            const gap = b.size * 0.5 + b.labelSize * 0.9;
            const lx = p.x + p.nx * gap * b.side, ly = p.y + p.ny * gap * b.side;
            b.lab.style.transform = `translate(${lx.toFixed(1)}px, ${ly.toFixed(1)}px) translate(-50%, -50%)`;
            // the label travels with the packet and hands over to the ring on arrival (keepLabel: stays for the hold)
            b.lab.style.opacity = (a * (b.keepLabel ? 1 : 1 - sstep(b.dur - 0.08, b.dur + 0.22, d))).toFixed(3);
          }
        });
      },
    };
    return f;
  });

  const upper = (arr, t) => { let lo = 0, hi = arr.length; while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] <= t) lo = m + 1; else hi = m; } return lo; };

  flow.path = path;
  flow.schedule = schedule;
  /* rate keys with linear ramps whose integral is exactly `total` packets */
  flow.rate = (total, t0, t1, ramp = 0.6) => { const r = total / Math.max(1e-6, t1 - t0 - ramp); return [[t0, 0], [t0 + ramp, r], [t1 - ramp, r], [t1, 0]]; };
  /* explicit births: volleys [[t, n, spread]] → n packets spread over `spread` s from t (TCP slow start: 10, 20, 40 …) */
  flow.volleys = (list, seed = 5) => {
    const out = [];
    list.forEach(([t, n, spread = 0.2], v) => { for (let i = 0; i < n; i++) out.push(t + spread * ((i + 0.5 * OT.hash(i, seed + v)) / n)); });
    return out.sort((a, b) => a - b);
  };
})();
