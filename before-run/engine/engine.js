/* One-take engine for HyperFrames.
 *
 * One continuous 3D world, one camera, one paused GSAP timeline that calls OT.render(t).
 * Sequences (sequences/<ID>.js) register with OT.sequence({ id, build(ctx), ... }) and work in their
 * own local coordinates; the engine chains them so each sequence starts where the previous camera ended.
 * Everything visible is a pure function of t (seek-safe, deterministic).
 * API reference: engine/ENGINE.md
 */
(function () {
  const OT = (window.OT = window.OT || {});
  const TIMING = window.OT_TIMING;
  OT.timing = TIMING;
  OT.W = 1920; OT.H = 1080; OT.P = 1000; OT.O = { x: 960, y: 640 };
  const P = OT.P, O = OT.O;

  // ------------------------------------------------------------------ math
  const clamp = (OT.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)));
  const lerp = (OT.lerp = (a, b, u) => a + (b - a) * u);
  const inv = (OT.inv = (a, b, x) => clamp((x - a) / (b - a)));
  const sstep = (OT.sstep = (a, b, x) => { const u = inv(a, b, x); return u * u * (3 - 2 * u); });
  const E = (OT.E = {
    lin: (u) => u,
    quadIn: (u) => u * u,
    quadOut: (u) => 1 - (1 - u) * (1 - u),
    cubicIn: (u) => u * u * u,
    cubicOut: (u) => 1 - Math.pow(1 - u, 3),
    cubicInOut: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
    quintInOut: (u) => (u < 0.5 ? 16 * u ** 5 : 1 - Math.pow(-2 * u + 2, 5) / 2),
    expoIn: (u) => (u <= 0 ? 0 : Math.pow(2, 10 * u - 10)),
    expoOut: (u) => (u >= 1 ? 1 : 1 - Math.pow(2, -10 * u)),
    expoInOut: (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u < 0.5 ? Math.pow(2, 20 * u - 10) / 2 : (2 - Math.pow(2, -20 * u + 10)) / 2),
    sineInOut: (u) => -(Math.cos(Math.PI * u) - 1) / 2,
    quintIn: (u) => u ** 5,
    quintOut: (u) => 1 - Math.pow(1 - u, 5),
    sineIn: (u) => 1 - Math.cos((Math.PI * u) / 2),
    sineOut: (u) => Math.sin((Math.PI * u) / 2),
    smoother: (u) => u * u * u * (u * (u * 6 - 15) + 10),
    backOut: (u) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
  });
  OT.tw = (a, b, t, e = "cubicInOut") => E[e](inv(a, b, t));
  OT.track = (keys, t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i], [t0, v0] = keys[i - 1];
      if (t <= t1) return lerp(v0, v1, E[e || "cubicInOut"]((t - t0) / (t1 - t0)));
    }
    return keys[keys.length - 1][1];
  };
  // monotone cubic (Fritsch–Carlson) through [t, v] keys: smooth speed, never overshoots
  OT.monotone = (keys) => {
    const n = keys.length, xs = keys.map((k) => k[0]), ys = keys.map((k) => k[1]);
    if (n === 1) return () => ys[0];
    const d = [], m = [];
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
    }
    return (t) => {
      if (t <= xs[0]) return ys[0];
      if (t >= xs[n - 1]) return ys[n - 1];
      let lo = 0, hi = n - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (xs[mid] <= t) lo = mid; else hi = mid; }
      const i = lo, h = xs[i + 1] - xs[i], u = (t - xs[i]) / h;
      const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
      return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
    };
  };
  OT.spring = (t, t0, w = 18, z = 0.42) => {
    const x = t - t0; if (x <= 0) return 0;
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + ((z * w) / wd) * Math.sin(wd * x));
  };
  OT.rng = (seed) => { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  OT.hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  OT.hex2 = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  OT.mix = (a, b, u) => { const A = typeof a === "string" ? OT.hex2(a) : a, B = typeof b === "string" ? OT.hex2(b) : b; return [0, 1, 2].map((j) => Math.round(lerp(A[j], B[j], clamp(u)))); };
  OT.rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  OT.lum = (c) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
  OT.colorTrack = (keys, t) => {
    if (t <= keys[0][0]) return OT.hex2(keys[0][1]);
    let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++;
    const [t0, c0] = keys[i - 1], [t1, c1] = keys[i];
    return OT.mix(c0, c1, (t - t0) / Math.max(1e-6, t1 - t0));
  };
  // shake envelope: decaying wobble starting at t0
  OT.wobble = (t, t0, amp, freq = 30, decay = 5.5, seed = 0) => {
    const d = t - t0; if (d < 0 || d > 2.5) return [0, 0];
    const env = amp * Math.exp(-d * decay);
    return [env * Math.sin(d * freq + seed), env * Math.cos(d * freq * 1.13 + seed * 2)];
  };

  // ------------------------------------------------------------------ text
  const GLYPHS = "0123456789ABCDEF<>{}[]()/\\*+=#%&!?;:";
  // deterministic decode/scramble from one string to another; u in 0..1
  OT.scramble = (from, to, u, t, seed = 3) => {
    if (u >= 1) return to;
    if (u <= 0) return from;
    const len = Math.round(lerp(from.length, to.length, Math.min(1, u * 1.6)));
    const f = Math.floor(t * 30);
    let s = "";
    for (let c = 0; c < len; c++) {
      const settle = (c / Math.max(1, len)) * 0.7 + 0.3 * OT.hash(c, seed);
      if (u > settle) s += to[c] ?? " ";
      else s += GLYPHS[Math.floor(OT.hash(c + seed * 97, f) * GLYPHS.length)];
    }
    return s;
  };
  OT.esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // ------------------------------------------------------------------ narration
  const norm = (w) => w.toLowerCase().replace(/[.,;:!?—“”"'’]/g, "");
  OT.beat = (id) => TIMING.beats.find((b) => b.id === id);
  // absolute time of the n-th occurrence of a spoken word in a beat (spoken spelling, e.g. "print-F")
  OT.at = (id, word, n = 1, edge = "t0") => {
    const b = OT.beat(id);
    if (!b) throw new Error(`OT.at: no beat ${id} (an optional beat that was dropped? guard it with ctx.has("${id}"))`);
    const hits = b.words.filter((w) => norm(w.w) === norm(word));
    if (!hits.length) throw new Error(`OT.at: "${word}" not found in ${id}`);
    return hits[Math.min(n, hits.length) - 1][edge];
  };
  OT.end = (id, word, n = 1) => OT.at(id, word, n, "t1");
  // is this beat in the film? (optional beats can be dropped: film.json "drop" / build.py --without-optional)
  OT.has = (id) => !!OT.beat(id);

  // ------------------------------------------------------------------ registry
  OT._defs = OT._defs || {};
  OT.sequence = (def) => { OT._defs[def.id] = def; };

  // ------------------------------------------------------------------ components (shared batons)
  const C = (OT.C = {});
  const el = (OT.el = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; });

  const KW = { c: /^(int|void|return|char|const|extern|typedef|struct|long|unsigned|static|size_t|FILE)$/ };
  C.highlight = (line, lang = "c") => {
    const segs = [];
    const push = (t, c = "") => { if (!t) return; const last = segs[segs.length - 1]; if (last && last[1] === c) last[0] += t; else segs.push([t, c]); };
    if (lang === "c" && /^\s*#/.test(line)) return [[line, "pp"]];
    const re = lang === "llvm"
      ? /(c"(?:[^"\\]|\\.)*")|([@%][\w.]+)|(\b(?:define|declare|private|unnamed_addr|constant|align|call|tail|ret|dso_local|local_unnamed_addr|noundef|nonnull|dereferenceable|nocapture|readonly|alloca|store)\b)|(\b(?:i32|i8|ptr|\[\d+ x i8\])\b|\[\d+ x i8\])|(\b\d+\b)|([^\w\s"@%]+)|(\s+)|(\w+)/g
      : lang === "asm"
      ? /("(?:[^"\\]|\\.)*")|(\b(?:push|pop|lea|call|xor|ret|mov|sub|add)\b)|(\b(?:rax|rdi|rsi|eax|rcx|rip|rsp|rbp)\b)|(\.?[A-Za-z_][\w.]*:)|(\.L\w+|[\w]+@PLT|\.\w+)|(\b0x[0-9a-fA-F]+\b|\b\d+\b)|([^\w\s".@]+)|(\s+)|(\w+)/g
      : /("(?:[^"\\]|\\.)*")|(\b[A-Za-z_]\w*(?=\s*\())|(\b[A-Za-z_]\w*\b)|(\b\d+\b)|([^\w\s"]+)|(\s+)/g;
    let m;
    while ((m = re.exec(line))) {
      const tok = m[0];
      if (lang === "c") {
        if (m[1]) { const parts = tok.split(/(\\.)/); parts.forEach((p) => push(p, /^\\.$/.test(p) ? "esc" : "s")); }
        else if (m[2]) push(tok, KW.c.test(tok) ? "k" : "fn");
        else if (m[3]) push(tok, KW.c.test(tok) ? "k" : "");
        else if (m[4]) push(tok, "num");
        else if (m[5]) push(tok, "pu");
        else push(tok, "");
      } else if (lang === "llvm") {
        if (m[1]) { const parts = tok.split(/(\\[0-9A-F]{2})/); parts.forEach((p) => push(p, /^\\[0-9A-F]{2}$/.test(p) ? "esc" : "s")); }
        else if (m[2]) push(tok, /^@(puts|printf)$/.test(tok) ? "fn" : "lbl");
        else if (m[3]) push(tok, "k");
        else if (m[4]) push(tok, "ty");
        else if (m[5]) push(tok, "num");
        else if (m[6]) push(tok, "pu");
        else push(tok, "");
      } else if (lang === "asm") {
        if (m[1]) push(tok, "s");
        else if (m[2]) push(tok, "k");
        else if (m[3]) push(tok, "reg");
        else if (m[4]) push(tok, "lbl");
        else if (m[5]) push(tok, /@PLT$/.test(tok) || tok === "puts" ? "fn" : "pp");
        else if (m[6]) push(tok, "num");
        else if (m[7]) push(tok, "pu");
        else push(tok, "");
      } else push(tok, "");
    }
    return segs;
  };

  /* A block of code. lines: array of strings (highlighted by lang) or arrays of [text, cls] segments.
   * opts: { lang, theme:'paper'|'night', size, lh, chars:false }
   * Returns { el, rows:[div], segs:[[span]], chars:[[span]] (if chars) , width(i) }  — position el yourself. */
  C.code = (parent, lines, opts = {}) => {
    const { lang = "c", theme = "paper", size = 46, lh = Math.round(size * 1.56), chars = false } = opts;
    const box = el("div", `ot-code ${theme}`, parent);
    box.style.fontSize = size + "px";
    const out = { el: box, rows: [], segs: [], chars: [], size, lh, cw: size * 0.6 };
    lines.forEach((ln, i) => {
      const segs = typeof ln === "string" ? C.highlight(ln, lang) : ln;
      const row = el("div", "row", box);
      row.style.top = i * lh + "px";
      row.style.lineHeight = lh + "px";
      const spans = [], cs = [];
      segs.forEach(([txt, cls]) => {
        const sp = el("span", cls || "", row);
        if (chars) { for (const ch of txt) { const c = el("span", "", sp); c.textContent = ch; c.style.display = "inline-block"; c.style.whiteSpace = "pre"; cs.push(c); } }
        else sp.textContent = txt;
        spans.push(sp);
      });
      out.rows.push(row); out.segs.push(spans); out.chars.push(cs);
    });
    box.style.height = lines.length * lh + "px";
    out.text = lines.map((l) => (typeof l === "string" ? l : l.map((s) => s[0]).join("")));
    out.width = (i) => out.text[i].length * out.cw;
    out.maxWidth = Math.max(...out.text.map((t) => t.length)) * out.cw;
    out.height = lines.length * lh;
    return out;
  };

  /* The surface page: editor (hello.c) + Run pill + terminal. Page-local coordinates = the demo's screen layout.
   * Returns handles; call page.setTerm(lines) with lines = [[ [text, cls], ... ], ...] (cls: pr|out|dim|'') */
  C.PAGE_CODE = ["#include <stdio.h>", "int main(void) {", '    printf("Hello, world!\\n");', "    return 0;", "}"];
  C.page = (parent, opts = {}) => {
    const pg = el("div", "ot-page", parent);
    el("div", "tab", pg, "<b></b>hello.c");
    const lnums = C.PAGE_CODE.map((_, i) => { const n = el("div", "ln", pg); n.style.top = 330 + i * 72 + "px"; n.textContent = i + 1; return n; });
    const code = C.code(pg, C.PAGE_CODE, { lang: "c", theme: "paper", size: 46, lh: 72, chars: !!opts.chars });
    code.el.style.left = "520px"; code.el.style.top = "330px";
    const rule = el("div", "rule", pg);
    const pill = el("div", "pill", pg, `<svg viewBox="0 0 18 20"><path d="M2 1.5 L16.5 10 L2 18.5 Z" fill="#1e1d1a"/></svg><span>Run</span>`);
    const term = el("div", "term", pg);
    const tcaret = el("div", "tcaret", term); tcaret.style.opacity = 0;
    const page = { el: pg, code, lnums, rule, pill, tri: pill.querySelector("svg"), term, tcaret, tlines: [] };
    page.setTerm = (lines) => {
      const key = JSON.stringify(lines);
      if (page._key === key) return; page._key = key;
      page.tlines.forEach((l) => l.remove()); page.tlines = [];
      lines.forEach((segs, i) => {
        const l = el("div", "tl", term); l.style.top = i * 50 + "px";
        segs.forEach(([txt, cls]) => { const s = el("span", cls || "", l); s.textContent = txt; });
        page.tlines.push(l);
      });
    };
    // caret after the last char of terminal line i (col = character count)
    page.caretAt = (i, col, alpha) => { tcaret.style.left = col * 32 * 0.6 + 2 + "px"; tcaret.style.top = i * 50 + 6 + "px"; tcaret.style.opacity = alpha; };
    return page;
  };

  /* The executable on disk: a slab of bytes. 760×470 box; place its centre with translate(-50%,-50%). */
  C.slab = (parent, opts = {}) => {
    const s = el("div", "ot-slab", parent);
    const rows = [
      "7F 45 4C 46 02 01 01 00 00 00 00 00 00 00 00 00",
      "03 00 3E 00 01 00 00 00 40 10 00 00 00 00 00 00",
      "F3 0F 1E FA 31 ED 49 89 D1 5E 48 89 E2 48 83 E4",
      "50 48 8D 3D BC 0E 00 00 E8 E3 FE FF FF 31 C0 59",
      "C3 00 00 00 00 00 00 00 <b>48 65 6C 6C 6F 2C 20 77</b>",
      "<b>6F 72 6C 64 21 00</b> 00 00 01 1B 03 3B 34 00 00 00",
      "2F 6C 69 62 36 34 2F 6C 64 2D 6C 69 6E 75 78 2D",
      "78 38 36 2D 36 34 2E 73 6F 2E 32 00 70 75 74 73",
      "00 6C 69 62 63 2E 73 6F 2E 36 00 47 4C 49 42 43",
      "5F 32 2E 32 2E 35 00 00 00 00 00 00 02 00 02 00",
      "47 43 43 3A 20 28 55 62 75 6E 74 75 20 31 33 2E",
    ];
    s.innerHTML = `<div class="hdr"><span class="name">${OT.esc(opts.name || "hello")}</span><span class="magic">7F 45 4C 46</span><span class="kind">ELF64 · executable</span></div>` +
      `<div class="bytes">${rows.join("\n")}</div><div class="size">${OT.esc(opts.size || "16 KB")}</div>`;
    return { el: s, w: 760, h: 470 };
  };

  /* A process: a cell of light, 360px. */
  C.cell = (parent, opts = {}) => {
    const c = el("div", "ot-cell", parent);
    const sz = opts.size || 360;
    c.style.width = c.style.height = sz + "px";
    c.innerHTML = `<div class="lab">${OT.esc(opts.label || "")}</div><div class="pid">${OT.esc(opts.pid || "")}</div>`;
    return { el: c, size: sz, lab: c.querySelector(".lab"), pid: c.querySelector(".pid") };
  };

  /* The address space of our process, top = high addresses. 640px wide; bands keyed by name.
   * opts.promised: array of band names drawn dashed (mapped but not yet in memory). */
  C.MEM_BANDS = [
    { name: "stack", label: "stack", perm: "rw-", h: 120, addr: "0x7ffd…" },
    { name: "gap", gap: 70 },
    { name: "libc", label: "libc.so.6", perm: "r-x", h: 110, addr: "0x7f3a…" },
    { name: "gap2", gap: 60 },
    { name: "heap", label: "heap", perm: "rw-", h: 70, addr: "0x5555…9000" },
    { name: "data", label: ".data", perm: "rw-", h: 60, addr: "0x5555…8000" },
    { name: "rodata", label: '.rodata  <span class="gold">"Hello, world!"</span>', perm: "r--", h: 80, addr: "0x555555556004" },
    { name: "text", label: ".text  _start · main", perm: "r-x", h: 110, cls: "code", addr: "0x555555555000" },
  ];
  C.memcol = (parent, opts = {}) => {
    const m = el("div", "ot-mem", parent);
    const bands = {};
    let y = 0;
    C.MEM_BANDS.forEach((b) => {
      if (b.gap) { y += b.gap; return; }
      const d = el("div", `band ${b.cls || ""} ${opts.promised && opts.promised.includes(b.name) ? "promised" : ""}`, m);
      d.style.top = y + "px"; d.style.height = b.h + "px";
      d.innerHTML = `<span class="nm">${b.label}</span><span class="pm">${b.perm}</span>`;
      const a = el("div", "addr", m); a.style.top = y + b.h / 2 - 11 + "px"; a.textContent = b.addr;
      bands[b.name] = { el: d, addr: a, y, h: b.h };
      y += b.h + 10;
    });
    m.style.height = y + "px";
    return { el: m, bands, w: 640, h: y };
  };

  // ------------------------------------------------------------------ episode-2 baton components
  // Extracted verbatim from sequences/A.js and B.js (same markup, CSS values and DOM order) so that both sides of
  // a baton are pixel-identical. CSS in engine.css (.ot-bootcard, .ot-seal, .ot-desk*, .ot-ed*, .ot-pointer,
  // .ot-seqline, .ot-parcel, .ot-bloom). Build them in build(), drive them from render(t). API: engine/ENGINE.md.

  /* A wax seal: B's Secure Boot stamp, generalised. The art is drawn in a 250-unit viewBox and scaled to `size`.
   * Every instance gets its own textPath id (a duplicated id resolves to the first instance in the document, which
   * may be display:none → no ring text). The ring/centre text uses the inherited page font, exactly as B's did. */
  let sealN = 0;
  C.seal = (parent, opts = {}) => {
    const { ring = "", mid = "signed", sub = "", size = 250 } = opts;
    const id = `ot-seal-ring-${++sealN}`;
    const e = el("div", "ot-seal", parent);
    e.style.width = e.style.height = size + "px";
    e.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 250 250">
      <defs><path id="${id}" d="M125 125 m-88 0 a88 88 0 1 1 176 0 a88 88 0 1 1 -176 0"/></defs>
      <path d="M125 10 C150 14 170 8 188 26 C210 40 236 58 238 92 C246 120 240 150 228 172 C214 200 196 224 164 234 C138 244 106 244 82 232 C54 222 30 202 20 172 C8 146 8 112 18 86 C30 56 52 30 80 20 C96 12 110 8 125 10 Z" fill="#8e2b1e"/>
      <circle cx="125" cy="125" r="70" fill="none" stroke="#c4563f" stroke-width="3"/>
      <text font-size="15.5" font-weight="700" fill="#f2c9b8" letter-spacing="1.5"><textPath href="#${id}">${OT.esc(ring)}</textPath></text>
      <text x="125" y="${sub ? 122 : 134}" text-anchor="middle" font-size="26" font-weight="700" fill="#f6d9cc">${OT.esc(mid)}</text>` +
      (sub ? `\n      <text x="125" y="152" text-anchor="middle" font-size="18" fill="#f2c9b8">${OT.esc(sub)}</text>` : "") + `</svg>`;
    return e;
  };
  C.SEAL_UBUNTU = { ring: "UBUNTU ARCHIVE AUTOMATIC SIGNING KEY (2018) ·", mid: "signed", sub: "SHA256" };

  /* B → C baton: the shimx64.efi card + the Microsoft wax seal (B's .b-card / .b-stamp, moved verbatim).
   * card and stamp are siblings appended to `parent` in that order (no wrapper, so B keeps its DOM order); el = card.
   * rest(x, y): the resting picture — card at (x, y) scale 1 (origin 0 0), stamp at (x + 470, y + 70) rotate(−12°). */
  C.bootcard = (parent) => {
    const card = el("div", "ot-bootcard", parent, `<div class="n">shimx64.efi</div><div class="s">966,768 bytes · EFI application</div>`);
    const stamp = C.seal(parent, { ring: "MICROSOFT CORPORATION · UEFI CA 2011 ·", mid: "signed", sub: "Secure Boot", size: 250 });
    stamp.classList.add("ot-bootcard-stamp");
    const rest = (x, y) => {
      card.style.transform = `translate3d(${x}px, ${y}px, 0px) scale(1)`;
      card.style.transformOrigin = "0 0";
      card.style.opacity = "1";
      card.style.visibility = "inherit";
      stamp.style.transform = `translate3d(${x + 470}px, ${y + 70}px, 0px) rotate(-12deg) scale(1)`;
      stamp.style.opacity = "1";
      stamp.style.filter = "none";
      stamp.style.visibility = "inherit";
    };
    return { el: card, card, stamp, rest };
  };

  /* A's pointer arrow (34×48), top-left at the hot spot's box origin. */
  C.pointer = (parent) => el("div", "ot-pointer", parent, `<svg viewBox="0 0 34 48" width="34" height="48"><path d="M3 2 L3 38 L12 30 L18 45 L24 42 L18 28 L30 28 Z" fill="#1e1d1a" stroke="#f6f2ea" stroke-width="2.5" stroke-linejoin="round"/></svg>`);

  /* A's desktop, on A's coordinates (the window slot is the plane's (0,0)–(1920,1080)). */
  C.DESK_ICONS = [[">_", "#2b2a26", "#efeae0", "terminal"], ["▤", "#c9b991", "#3b3a35", "files"], ["◎", "#7aa5b5", "#f4f1ea", "browser"],
    ["{ }", "#efeae0", "#a2462b", "editor"], ["♪", "#b98a7a", "#f4f1ea", "music"], ["⚙", "#9a9384", "#efeae0", "settings"], ["⌫", "#5b574e", "#efeae0", "trash"]];
  const iconIndex = (i) => (typeof i === "string" ? C.DESK_ICONS.findIndex((d) => d[3] === i || d[0] === i) : i);
  C.desktop = (parent, opts = {}) => {
    const { clock = "Fri Oct 9 · 9:41", running = [], twins: withTwins = false } = opts;
    const root = el("div", "ot-desk", parent);
    const wall = el("div", "ot-desk-wall", root);
    {
      let s = `<svg width="5320" height="2700" viewBox="0 0 5320 2700" style="position:absolute;left:0;top:0">`;
      for (let i = 0; i < 14; i++) {
        const rx = 1500 + i * 260, ry = 520 + i * 120;
        s += `<ellipse cx="2660" cy="3150" rx="${rx}" ry="${ry * 2.2}" fill="none" stroke="#b9ad94" stroke-opacity="${(0.42 - i * 0.022).toFixed(3)}" stroke-width="5"/>`;
      }
      wall.innerHTML = s + "</svg>";
    }
    const twins = [];
    if (withTwins) {
      const term = el("div", "ot-desk-twin term", root, `<div class="tb"></div><b>~$</b> ls\nhello.c\n<b>~$</b> █`);
      term.style.cssText += "left:-900px;top:60px;width:1150px;height:760px;";
      const files = el("div", "ot-desk-twin files", root, `<div class="tb"></div>` + ["Documents", "Downloads", "Music", "Pictures", "code"].map((n, i) => `<div class="row" style="top:${120 + i * 96}px">${n}</div>`).join(""));
      files.style.cssText += "left:1650px;top:-380px;width:1050px;height:720px;";
      twins.push(term, files);
    }
    const top = el("div", "ot-desk-top", root, `<div class="clk">${OT.esc(clock)}</div><div class="st"><i></i><i></i><i style="width:58px"></i></div>`);
    const dock = el("div", "ot-desk-dock", root);
    const on = new Set(running.map(iconIndex));
    const icons = C.DESK_ICONS.map(([g, bg, fg], i) => {
      const ic = el("div", "ot-desk-icon" + (on.has(i) ? " on" : ""), dock, g);
      ic.style.top = 70 + i * 190 + "px"; ic.style.background = bg; ic.style.color = fg;
      return ic;
    });
    // centre of dock icon i (index or name: terminal files browser editor music settings trash), plane coords
    const icon = (i) => ({ x: -1230, y: 60 + 190 * iconIndex(i) });
    return { el: root, wall, top, dock, icons, twins, icon };
  };

  /* The terminal window on the desktop plane (D opens it, E returns to it): OT.term.view options. */
  C.TERM_WIN = { theme: "night", frame: true, title: "Terminal", x: 260, y: 110, w: 1400, h: 740, size: 28, lh: 40, pad: [30, 36, 30, 36] };

  /* A's editor window: .ot-ed (1920×1080 wrapper, the fold transform) → win (paper) → OT.C.page({chars:true}) → bar;
   * caretEl and pointer inside page.el. Same DOM order and CSS as A.js. Setters are pure: call the ones you own every
   * frame. Defaults after build: blank page (typed 0, line 1), caret at (523, 339), chrome 0, hover 0, pointer hidden. */
  C.editor = (parent) => {
    const root = el("div", "ot-ed", parent);
    const win = el("div", "ot-ed-win", root);
    const page = C.page(root, { chars: true });
    const bar = el("div", "ot-ed-bar", root, `<div class="t">hello.c — Editor</div><div class="x">×</div>`);
    const caretEl = el("div", "ot-ed-caret", page.el);
    const pointer = C.pointer(page.el);
    const pill = page.pill, triPath = page.tri.querySelector("path");
    // A's typing order: every char except leading indentation (leading spaces sit half a step before the next char)
    const all = [];
    page.code.chars.forEach((row, li) => {
      let lead = true, col = 0;
      row.forEach((sp) => { col++; const isLead = lead && sp.textContent === " "; if (!isLead) lead = false; all.push({ el: sp, li, col, lead: isLead }); });
    });
    let order = 0;
    all.forEach((c) => { c.order = c.lead ? order - 0.5 : order++; });
    const nChars = order;
    const lastTyped = [];
    all.forEach((c) => { if (!c.lead) lastTyped[c.order] = [c.li, c.col]; });
    const chars = all.filter((c) => !c.lead);
    const CW = 46 * 0.6;
    const ed = {
      el: root, win, page, bar, caretEl, pointer, pill, chars, allChars: all, nChars, CW,
      // characters with order < n visible (n may be fractional; leading indentation follows A's rule)
      typed(n) { all.forEach((c) => { const v = c.order < n ? "1" : "0"; if (c.el.style.opacity !== v) c.el.style.opacity = v; }); },
      // the first k line numbers visible (fractional k fades the k-th in)
      lines(k) { page.lnums.forEach((ln, i) => { ln.style.opacity = clamp(k - i).toFixed(3); }); },
      // the caret after the n-th typed character (n = 0: (523, 339)); A's blink on absolute t unless solid
      caretAfter(n, t, o = {}) {
        const { color = "#1e1d1a", solid = false } = o;
        const ti = Math.min(nChars - 1, Math.max(0, Math.ceil(n) - 1));
        const [cl, ccol] = n < 0.5 ? [0, 0] : lastTyped[ti];
        caretEl.style.transform = `translate3d(${520 + ccol * CW + 3}px, ${330 + cl * 72 + 9}px, 0px)`;
        caretEl.style.background = color;
        caretEl.style.opacity = (solid ? 1 : Math.floor(t / 0.53) % 2 === 0 ? 1 : 0.15).toFixed(3);
      },
      // where the caret sits after n typed characters (page coords of its top-left)
      caretPos(n) { const ti = Math.min(nChars - 1, Math.max(0, Math.ceil(n) - 1)); const [cl, ccol] = n < 0.5 ? [0, 0] : lastTyped[ti]; return { x: 520 + ccol * CW + 3, y: 330 + cl * 72 + 9 }; },
      // window chrome: A's pull-back look (radius 34u, shadows, title bar) — 0 = the bare page
      chrome(u) {
        win.style.borderRadius = (34 * u).toFixed(1) + "px";
        win.style.boxShadow = u > 0.01 ? `0 ${(60 * u).toFixed(0)}px ${(160 * u).toFixed(0)}px rgba(40,30,15,${(0.32 * u).toFixed(3)}), 0 0 0 ${(3 * u).toFixed(1)}px rgba(120,105,80,${(0.25 * u).toFixed(3)})` : "none";
        bar.style.opacity = u.toFixed(3);
        bar.style.borderRadius = `${(34 * u).toFixed(1)}px ${(34 * u).toFixed(1)}px 0 0`;
      },
      // the Run pill answering the pointer (A's hover)
      hover(u) {
        pill.style.background = `rgba(30,29,26,${(0.08 * u).toFixed(3)})`;
        pill.style.boxShadow = u > 0.01 ? `0 0 0 ${(6 * u).toFixed(1)}px rgba(162,106,5,${(0.12 * u).toFixed(3)})` : "none";
        triPath.setAttribute("fill", "#1e1d1a");
      },
      pointerAt(x, y, a) { pointer.style.transform = `translate3d(${x}px, ${y}px, 0px)`; pointer.style.opacity = a.toFixed(3); },
      // A's fold into a dock icon (u 0 → 1; icon = desktop.icon("editor") on the same plane, default (−1230, 630))
      fold(u, icon = { x: -1230, y: 630 }) {
        const fs = lerp(1, 0.035, u);
        const fx = lerp(0, icon.x - 960 * fs, u), fy = lerp(0, icon.y - 540 * fs, u);
        root.style.transform = `translate3d(${fx.toFixed(1)}px, ${fy.toFixed(1)}px, 0px) scale(${fs.toFixed(4)})`;
        root.style.transformOrigin = "0 0";
        const v = u > 0.98 ? "hidden" : "inherit";
        if (root.style.visibility !== v) root.style.visibility = v;
      },
    };
    ed.typed(0); ed.lines(1); ed.caretAfter(0, 0); ed.chrome(0); ed.hover(0); ed.pointerAt(1328, 262, 0); ed.fold(0);
    return ed;
  };

  /* D → E baton: the gold line of packets. w = n·cell + (n−1)·gap (1434 for 48); centre it: left 243px, top 628px. */
  C.seqline = (parent, opts = {}) => {
    const { n = 48, cell = 24, gap = 6 } = opts;
    const w = n * cell + (n - 1) * gap, h = cell;
    const e = el("div", "ot-seqline", parent);
    e.style.width = w + "px"; e.style.height = h + "px";
    const cells = [];
    for (let i = 0; i < n; i++) {
      const c = el("div", "ot-seqcell", e);
      c.style.left = i * (cell + gap) + "px";
      c.style.width = c.style.height = cell + "px";
      cells.push(c);
    }
    return { el: e, cells, w, h };
  };

  /* E's package (reused by G): 600×320, gold name, size, three ar member bands, the Ubuntu seal at the lower right.
   * Position el with left/top or a transform; members[i] = {el, lab}. name / size / member labels default to
   * OT.FACTS.apt.deb (file, sizeLabel, members[i][0]) — read at call time, so E and G show the capture's values. */
  C.parcel = (parent, opts = {}) => {
    const deb = (OT.FACTS && OT.FACTS.apt && OT.FACTS.apt.deb) || {};
    const { name = deb.file || "", size = deb.sizeLabel || "", seal = true } = opts;
    const memNames = opts.members || (deb.members || []).map((m) => m[0]);
    const e = el("div", "ot-parcel", parent);
    const label = el("div", "ot-parcel-name", e); label.textContent = name;
    const sub = el("div", "ot-parcel-size", e); sub.textContent = size;
    const members = [["debian-binary", 128, 30], ["control.tar.zst", 166, 30], ["data.tar.zst", 204, 80]].map(([nm0, top, h], i) => {
      const nm = memNames[i] || nm0;
      const b = el("div", "ot-parcel-member", e);
      b.style.top = top + "px"; b.style.height = h + "px"; b.style.lineHeight = h - 3 + "px";
      const lab = el("span", "", b); lab.textContent = nm;
      return { el: b, lab };
    });
    let sl = null;
    if (seal) {
      sl = C.seal(e, { ...C.SEAL_UBUNTU, size: 150 });
      sl.style.transform = "translate3d(430px, 168px, 0px) rotate(-10deg)";
    }
    return { el: e, label, sub, members, seal: sl, w: 600, h: 320 };
  };

  /* Local light (the flash rule): B's press bloom generalised. Inserted as the FIRST child of parent (behind what it
   * lights). Its centre is the element's origin: ctx.place(bl, cx, cy, 0, `scale(s)`); animate opacity + scale only. */
  C.bloom = (parent, opts = {}) => {
    const { size = 1400, rgb = "255,214,140" } = opts;
    const e = document.createElement("div");
    e.className = "ot-bloom";
    e.style.cssText = `width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;opacity:0;` +
      `background:radial-gradient(circle, rgba(${rgb},.55) 0%, rgba(${rgb},.24) 22%, rgba(${rgb},.08) 42%, rgba(${rgb},0) 62%);`;
    parent.insertBefore(e, parent.firstChild);
    return e;
  };

  // ------------------------------------------------------------------ boot & render
  let world, rollEl, ground, grain, dither, vignette, flashEl, scrim, cap, heroEl, fadeEl;
  const SEQS = [];
  let camX, camY, camZ, camR, groundKeys = [], flashes = [], shakes = [], fades = [], moteKeys = [];
  const MOTES = [];

  let easedSegs = [];
  // camera = monotone spline through all keys, except segments whose END key carries `ease` (a named OT.E curve):
  // those go in a straight line with that speed curve (use between rests for ramps: quintInOut, expoInOut, smoother…)
  OT.camera = (t) => {
    for (let i = 0; i < easedSegs.length; i++) {
      const s = easedSegs[i];
      if (t > s.t0 && t < s.t1) { const u = s.e((t - s.t0) / (s.t1 - s.t0)); return { x: lerp(s.a.x, s.b.x, u), y: lerp(s.a.y, s.b.y, u), z: lerp(s.a.z, s.b.z, u), roll: lerp(s.a.roll, s.b.roll, u) }; }
    }
    return { x: camX(t), y: camY(t), z: camZ(t), roll: camR(t) };
  };

  function makeCtx(id, info, origin) {
    const root = el("div", "ot-seq", world);
    root.dataset.seq = id;
    root.style.transform = `translate3d(${origin.x}px, ${origin.y}px, ${-origin.d}px)`;
    const ctx = {
      id, t0: info.t0, t1: info.t1, beats: info.beats, root, origin,
      _cam: [], _ground: [], _flash: [], _shake: [], _motes: [], _fade: [], _exit: null, _hero: null, _render: null, _moteClock: null, _pre: 1.5, _post: 1.5,
      margins(pre, post) { this._pre = pre; this._post = post; },
      at: OT.at, end: OT.end, beat: OT.beat, has: OT.has,
      cam(keys) { keys.forEach(([t, k]) => this._cam.push([t, k])); },
      ground(keys) { keys.forEach((k) => this._ground.push(k)); },
      flash(t, o = {}) { this._flash.push({ t, peak: 0.6, attack: 0.05, decay: 8, color: "#fff8ee", ...o }); },
      shake(t, o = {}) { this._shake.push({ t, amp: 10, freq: 30, decay: 5.5, ...o }); },
      motes(keys) { keys.forEach((k) => this._motes.push(k)); },
      moteClock(fn) { this._moteClock = fn; },
      fade(keys) { keys.forEach((k) => this._fade.push(k)); },
      exit(o) { this._exit = { x: 960, y: 640, ...o }; },
      hero(fn) { this._hero = fn; },
      render(fn) { this._render = fn; },
      el: (tag, cls, parent, html) => el(tag, cls, parent || root, html),
      // at = {x, y}: offset the whole plane in its own xy (baton 1: C puts the card plane exactly where B's devP was, so
      // the plane's render surface has the same pixel phase on both sides of the boundary — see ENGINE.md)
      plane(d = 0, cls = "", at = null) { const p = el("div", "ot-plane " + cls, root); p.style.transform = `translate3d(${at ? at.x || 0 : 0}px, ${at ? at.y || 0 : 0}px, ${-d}px)`; return p; },
      place(e, x, y, d = 0, extra = "") { e.style.transform = `translate3d(${x}px, ${y}px, ${-d}px)${extra ? " " + extra : ""}`; },
      camAt(t) { const c = OT.camera(t); return { x: c.x - origin.x, y: c.y - origin.y, z: c.z - origin.d, roll: c.roll }; },
      project(x, y, d, t) { const c = OT.camera(t); const eff = c.z - (origin.d + d); const s = P / (P - eff); return { x: O.x + (origin.x + x - c.x) * s, y: O.y + (origin.y + y - c.y) * s, s, eff }; },
      depthAlpha(d, t, near = [430, 820], far = [-2600, -1400]) { const eff = OT.camera(t).z - (origin.d + d); return sstep(far[0], far[1], eff) * (1 - sstep(near[0], near[1], eff)); },
      show(e, a) { const v = a < 0.002 ? "hidden" : "inherit"; if (e.style.visibility !== v) e.style.visibility = v; if (a >= 0.002) e.style.opacity = a.toFixed(3); },
      screen: el("div", "ot-seq-screen", document.getElementById("ot-screen")),
    };
    return ctx;
  }

  OT.boot = () => {
    world = document.getElementById("ot-world");
    rollEl = document.getElementById("ot-roll");
    ground = document.getElementById("ot-ground");
    grain = document.getElementById("ot-grain");
    dither = document.getElementById("ot-dither");
    vignette = document.getElementById("ot-vignette");
    flashEl = document.getElementById("ot-flash");
    scrim = document.getElementById("ot-scrim");
    cap = document.getElementById("ot-cap");
    heroEl = document.getElementById("ot-hero");
    fadeEl = document.getElementById("ot-fade");
    // 4K = deviceScaleFactor 2: the SVG grain/dither turbulence is defined per CSS px and would turn into 2-px grain.
    // Scale its frequency by the DPR so the grain stays one device pixel (nothing changes at DPR 1).
    const dpr = window.devicePixelRatio || 1;
    if (dpr !== 1) document.querySelectorAll("#ot-grain feTurbulence, #ot-dither feTurbulence").forEach((f) => {
      const base = f.dataset.otBase || (f.dataset.otBase = f.getAttribute("baseFrequency"));
      f.setAttribute("baseFrequency", base.trim().split(/[\s,]+/).map((v) => +(parseFloat(v) * dpr).toFixed(4)).join(" "));
    });

    let origin = { x: 0, y: 0, d: 0 };
    const camKeys = [];
    Object.values(TIMING.sequences).forEach((info) => {
      const def = OT._defs[info.id] || { build(ctx) { ctx.cam([[info.t0, { x: 960, y: 640, z: 0 }]]); ctx.ground([[info.t0, "#222222"]]); } };
      const ctx = makeCtx(info.id, info, origin);
      def.build(ctx);
      ctx._render = ctx._render || def.render || null;
      ctx._hero = ctx._hero || def.hero || null;
      let last = { x: 960, y: 640, z: 0, roll: 0 };
      ctx._cam.sort((a, b) => a[0] - b[0]).forEach(([t, k]) => {
        const { ease, ...kk } = k;
        last = { ...last, ...kk };
        camKeys.push([t, { x: origin.x + last.x, y: origin.y + last.y, z: origin.d + last.z, roll: last.roll || 0, ease }]);
      });
      groundKeys.push(...ctx._ground);
      flashes.push(...ctx._flash);
      shakes.push(...ctx._shake);
      fades.push(...ctx._fade);
      ctx._motes.forEach((k) => moteKeys.push(k));
      const ex = ctx._exit || last;
      SEQS.push(ctx);
      origin = { x: origin.x + (ex.x - 960), y: origin.y + (ex.y - 640), d: origin.d + ex.z };
    });
    camKeys.sort((a, b) => a[0] - b[0]);
    const dedup = [];
    camKeys.forEach((k) => { if (dedup.length && Math.abs(dedup[dedup.length - 1][0] - k[0]) < 1e-4) dedup[dedup.length - 1] = k; else dedup.push(k); });
    camX = OT.monotone(dedup.map(([t, k]) => [t, k.x]));
    camY = OT.monotone(dedup.map(([t, k]) => [t, k.y]));
    camZ = OT.monotone(dedup.map(([t, k]) => [t, k.z]));
    camR = OT.monotone(dedup.map(([t, k]) => [t, k.roll]));
    easedSegs = [];
    for (let i = 1; i < dedup.length; i++) {
      const e = dedup[i][1].ease;
      if (e) easedSegs.push({ t0: dedup[i - 1][0], t1: dedup[i][0], a: dedup[i - 1][1], b: dedup[i][1], e: OT.E[e] || OT.E.cubicInOut });
    }
    OT._easedSegs = easedSegs;
    groundKeys.sort((a, b) => a[0] - b[0]);
    if (!groundKeys.length) groundKeys.push([0, "#efeae0"]);
    moteKeys.sort((a, b) => a[0] - b[0]);
    for (let i = moteKeys.length - 1; i > 0; i--) if (moteKeys[i][1] === moteKeys[i - 1][1]) moteKeys.splice(i, 1);
    fades.sort((a, b) => a[0] - b[0]);

    // motes: an endless field that wraps around the camera
    const r = OT.rng(77);
    for (let i = 0; i < 150; i++) {
      const m = { px: r() * 6400, py: r() * 4200, pd: r() * 4300, ph: r() * 6.28, s: r(), g: r() < 0.5 ? "0" : "1", el: el("div", "ot-mote", world) };
      m.el.style.visibility = "hidden";
      MOTES.push(m);
    }
    OT.SEQS = SEQS;
  };

  const MOTE_STYLE = {
    dust: (m) => ({ text: "", w: 3 + m.s * 3, bg: "rgba(70,60,45,.32)", glow: "", a: 0.9 }),
    plankton: (m) => ({ text: "", w: 4 + m.s * 5, bg: "rgba(235,250,245,.75)", glow: "0 0 8px rgba(255,255,255,.6)", a: 0.85 }),
    spores: (m) => ({ text: "", w: 4 + m.s * 5, bg: "rgba(226,206,255,.7)", glow: "0 0 10px rgba(200,170,255,.6)", a: 0.8 }),
    sparks: (m) => ({ text: "", w: 3 + m.s * 4, bg: "#a8ecff", glow: "0 0 10px rgba(120,220,255,.9)", a: 0.85 }),
    bits: (m) => ({ text: m.g, size: 18 + m.s * 16, color: "#8fe0ff", glow: "0 0 10px rgba(110,210,255,.9)", a: 0.7 }),
    embers: (m) => ({ text: "", w: 5 + m.s * 6, bg: "#ff9a4a", glow: "0 0 12px #ff7a2e", a: 0.9 }),
    none: () => null,
  };
  function moteStyleAt(t) {
    if (!moteKeys.length) return ["dust", 1];
    if (t < moteKeys[0][0]) return [moteKeys[0][1], 1];
    let i = 0; while (i < moteKeys.length - 1 && t >= moteKeys[i + 1][0]) i++;
    const cur = moteKeys[i], next = moteKeys[i + 1];
    const fadeIn = i === 0 ? 1 : sstep(cur[0], cur[0] + 0.6, t);
    const fadeOut = next ? 1 - sstep(next[0] - 0.6, next[0], t) : 1;
    return [cur[1], Math.min(fadeIn, fadeOut)];
  }


  // slow camera drifts (text re-rasterises at every fractional scale → ±1–2 px glyph jitter). Use while authoring:
  //   OT.drifts() in the page console → [{t0, t1, seq}] stretches ≥ minDur where the camera creeps.
  OT.drifts = (minDur = 0.4, fps = 30) => {
    const out = []; let run = null;
    for (let i = 0; i < OT.timing.duration * fps; i++) {
      const t = i / fps, a = OT.camera(t), b = OT.camera(t + 1 / fps);
      const dz = Math.abs(b.z - a.z), dxy = Math.hypot(b.x - a.x, b.y - a.y);
      const slow = (dz > 0.02 && dz < 1.5) || (dz < 1.5 && dxy > 0.02 && dxy < 1.0);
      if (slow) { run = run || { t0: t }; run.t1 = t; }
      else if (run) { if (run.t1 - run.t0 >= minDur) out.push(run); run = null; }
    }
    if (run && run.t1 - run.t0 >= minDur) out.push(run);
    return out.map((r) => ({ ...r, seq: (SEQS.find((s) => r.t0 >= s.t0 && r.t0 < s.t1) || {}).id }));
  };

  function owner(t) { return SEQS.find((s) => t >= s.t0 && t < s.t1) || SEQS[SEQS.length - 1]; }

  // WCAG relative luminance of an [r, g, b] (0–255) colour
  const relLum = (c) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };

  OT.render = (t) => {
    const cam = OT.camera(t);
    let sx = 0, sy = 0;
    shakes.forEach((s, i) => { const [a, b] = OT.wobble(t, s.t, s.amp, s.freq, s.decay, i); sx += a; sy += b; });
    world.style.transform = `translate3d(${(O.x - cam.x + sx).toFixed(2)}px, ${(O.y - cam.y + sy).toFixed(2)}px, ${cam.z.toFixed(2)}px)`;
    rollEl.style.transform = cam.roll ? `rotate(${cam.roll.toFixed(3)}deg)` : "none";

    const g = OT.colorTrack(groundKeys, t);
    ground.style.background = OT.rgb(g);
    const light = OT.lum(g);
    grain.style.opacity = (0.55 * sstep(0.45, 0.85, light)).toFixed(3);
    // dither only where the vignette can step: dark but not pure-black grounds
    if (dither) dither.style.opacity = (sstep(0.004, 0.02, light) * (1 - sstep(0.25, 0.45, light))).toFixed(3);
    vignette.style.opacity = (0.22 + 0.5 * (1 - sstep(0.2, 0.75, light))).toFixed(3);
    OT.groundNow = g; OT.lightNow = light;

    // sequences
    SEQS.forEach((s) => {
      const active = t >= s.t0 - s._pre && t < s.t1 + s._post;
      const disp = active ? "" : "none";
      if (s.root.style.display !== disp) { s.root.style.display = disp; s.screen.style.display = disp; }
      if (active && s._render) s._render(t, s);
    });

    // hero
    const own = owner(t);
    const h = own._hero ? own._hero(t, own) : null;
    if (h && (h.opacity ?? 1) > 0.002) {
      heroEl.style.visibility = "visible";
      if (heroEl.textContent !== h.text) heroEl.textContent = h.text;
      heroEl.style.fontSize = (h.size || 46).toFixed(2) + "px";
      heroEl.style.fontWeight = h.weight || 700;
      const dark = 1 - sstep(0.35, 0.8, light);
      const col = h.color || OT.rgb(OT.mix([162, 106, 5], [255, 197, 77], dark));
      heroEl.style.color = Array.isArray(col) ? OT.rgb(col) : col;
      const glow = h.glow ?? dark;
      heroEl.style.textShadow = glow > 0.01 ? `0 0 ${(10 + 30 * glow).toFixed(1)}px rgba(255,190,70,${(0.2 + 0.55 * glow).toFixed(2)})` : "none";
      const anchor = h.anchor ?? 0.5;
      heroEl.style.transform = `translate(${(h.x ?? O.x).toFixed(1)}px, ${(h.y ?? O.y).toFixed(1)}px) translate(${(-anchor * 100).toFixed(2)}%, -50%) scale(${(h.scale ?? 1).toFixed(4)})`;
      heroEl.style.transformOrigin = `${anchor * 100}% 50%`;
      heroEl.style.opacity = (h.opacity ?? 1).toFixed(3);
      heroEl.style.filter = h.blur ? `blur(${h.blur.toFixed(1)}px)` : "none";
    } else heroEl.style.visibility = "hidden";

    // motes
    const [style, styleA] = moteStyleAt(t);
    const mk = MOTE_STYLE[style] || MOTE_STYLE.dust;
    const clock = own._moteClock ? own._moteClock(t) : t;
    MOTES.forEach((m, i) => {
      const st = mk(m);
      const dd = cam.z - 900 + ((((m.pd - (cam.z - 900)) % 4300) + 4300) % 4300);
      const eff = cam.z - dd;
      let a = st ? st.a * styleA * sstep(-3300, -2100, eff) * (1 - sstep(220, 560, eff)) : 0;
      if (a < 0.003) { if (m.el.style.visibility !== "hidden") m.el.style.visibility = "hidden"; return; }
      const x = cam.x - 3200 + ((((m.px - (cam.x - 3200)) % 6400) + 6400) % 6400) + Math.sin(clock * 0.4 + m.ph) * 22;
      const y = cam.y - 2100 + ((((m.py - (cam.y - 2100)) % 4200) + 4200) % 4200) + Math.cos(clock * 0.33 + m.ph) * 16 - (style === "dust" ? (clock * 7 + m.ph * 30) % 90 : 0);
      if (m._st !== style) {
        m._st = style;
        if (st.text) { m.el.textContent = st.text; m.el.style.fontSize = st.size + "px"; m.el.style.color = st.color; m.el.style.background = "none"; m.el.style.width = m.el.style.height = "auto"; m.el.style.textShadow = st.glow; m.el.style.boxShadow = "none"; }
        else { m.el.textContent = ""; m.el.style.width = m.el.style.height = st.w + "px"; m.el.style.background = st.bg; m.el.style.boxShadow = st.glow || "none"; m.el.style.textShadow = "none"; }
      }
      // keep the centre (where the story is) mostly clear
      const ps = P / (P - eff), qx = (O.x + (x - cam.x) * ps - 960) / 760, qy = (O.y + (y - cam.y) * ps - 560) / 360;
      a *= 0.12 + 0.88 * sstep(0.75, 1.15, Math.hypot(qx, qy));
      if (a < 0.003) { if (m.el.style.visibility !== "hidden") m.el.style.visibility = "hidden"; return; }
      m.el.style.visibility = "visible";
      m.el.style.opacity = a.toFixed(3);
      m.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${(-dd).toFixed(1)}px)`;
    });

    // flashes
    let fl = 0, fcol = "#fff8ee";
    flashes.forEach((f) => {
      const d = t - f.t; if (d < -f.attack || d > 4) return;
      const hold = f.hold || 0;
      const val = d < 0 ? f.peak * sstep(-f.attack, 0, d) : d < hold ? f.peak : f.peak * Math.exp(-(d - hold) * f.decay);
      if (val > fl) { fl = val; fcol = f.color; }
    });
    flashEl.style.opacity = fl.toFixed(3);
    flashEl.style.background = fcol;
    OT.flashNow = fl;

    // global fade
    if (fades.length) {
      let a = 0, c = "#000000";
      for (let i = 0; i < fades.length; i++) { const [ft, fa, fc] = fades[i]; if (t >= ft) { const nx = fades[i + 1]; a = nx && t < nx[0] ? lerp(fa, nx[1], OT.E.sineInOut((t - ft) / (nx[0] - ft))) : fa; c = fc || c; } }
      fadeEl.style.opacity = a.toFixed(3); fadeEl.style.background = c;
    }

    // captions
    scrim.style.background = `linear-gradient(to top, ${OT.rgb(g, 0.82)} 0px, ${OT.rgb(g, 0.55)} 120px, ${OT.rgb(g, 0)} 300px)`;
    // colour and halo are set on every frame, caption or not, so they are a function of time only (engine/layers.js
    // copies them onto the bilingual block, whose Chinese line can outlast an English phrase)
    const effLum = lerp(light, OT.lum(OT.hex2(fcol)), fl);
    const capDark = 1 - sstep(0.8, 0.86, effLum);
    const capCol = OT.mix([30, 29, 26], [246, 241, 232], capDark);
    cap.style.color = OT.rgb(capCol);
    let capShadow = capDark > 0.5 ? "0 2px 18px rgba(0,0,0,.55)" : "0 1px 12px rgba(239,234,224,.8)";
    // legibility guard: where text and ground get too close (WCAG ratio < 2.4: the colour flip on a light teal, a
    // flash) add a tight rim, dark or paper, whichever contrasts more with the text itself, as strong as the
    // shortfall (full at ≤ 1.6:1); nothing changes at ≥ 2.4:1
    const capBg = fl > 0 ? OT.mix(g, OT.hex2(fcol), fl) : g;
    const lt = relLum(capCol), lb = relLum(capBg);
    const capRim = clamp((2.4 - (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05)) / 0.8);
    if (capRim > 0.005) {
      const c = (lt + 0.05) / 0.05 > 0.97 / (lt + 0.05) ? "0,0,0" : "250,246,238";
      capShadow = `0 0 2px rgba(${c},${(0.85 * capRim).toFixed(2)}), 0 0 6px rgba(${c},${(0.6 * capRim).toFixed(2)}), ${capShadow}`;
    }
    cap.style.textShadow = capShadow;
    const c = TIMING.captions.find((k) => t >= k.t0 && t < k.t1);
    if (c) {
      if (cap.textContent !== c.text) cap.textContent = c.text;
      cap.style.opacity = (sstep(c.t0, c.t0 + 0.12, t) * (1 - sstep(c.t1 - 0.12, c.t1, t))).toFixed(3);
    } else cap.style.opacity = 0;
  };
})();
