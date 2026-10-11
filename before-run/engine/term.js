/* Terminal replay for the one-take engine.
 *
 * Replays a real `script` capture (a typescript: raw bytes with \r rewrites and ANSI colours) on a plane, as a
 * pure function of t. Two parts:
 *
 *   OT.term.parse(raw, opts)  → log  : the capture as a list of screen events (once, in build)
 *   OT.term.view(parent, log, opts)  : a terminal window that shows the log at time t (term.render(t) every frame)
 *
 * The time map is a list of anchors [t, ref, ease]: the event `ref` appears exactly at t; the events between two
 * anchors are spread by their reading weights, through the ease of the arriving anchor (`quadIn`, `expoIn` … =
 * a visible fast-forward). Scrolling is whole-line steps with a short eased glide at integer pixels, so text never
 * shimmers. Raw logs are embedded with script/logs.cjs (engine/logs.js → OT.LOGS[name]).
 * API reference: engine/ENGINE.md ("Terminal replay").
 */
(function () {
  const OT = window.OT;
  const { clamp, E } = OT;
  const T = (OT.term = {});

  // ------------------------------------------------------------------ parse
  const FG = { 30: "k0", 31: "r", 32: "g", 33: "y", 34: "bl", 35: "m", 36: "c", 37: "w", 90: "k0", 91: "r", 92: "g", 93: "y", 94: "bl", 95: "m", 96: "c", 97: "w" };

  /* ranges [a, b, cls] for plain text; refine what apt prints without colour (dims boilerplate, never new hues) */
  T.HL = {
    apt(s) {
      const r = [];
      let m;
      if ((m = /^(Get|Hit|Ign):\d+ (\S+) (\S+)/.exec(s))) {
        let p = s.indexOf(" ") + 1;
        r.push([0, p - 1, "d"]);
        r.push([p, p + m[2].length, "d"]); p += m[2].length + 1;
        r.push([p, p + m[3].length, "d"]); p += m[3].length + 1;
        // package lines: "<suite> <arch> <name> <arch> <version> [size]"
        const pk = /^(\S+) (\S+) (\S+) (\S+) (\[[^\]]+\])$/.exec(s.slice(p));
        if (pk) {
          r.push([p, p + pk[1].length, "d"]);
          let q = p + pk[1].length + 1;
          r.push([q, q + pk[2].length, "pk"]); q += pk[2].length + 1;
          r.push([q, q + pk[3].length, "d"]); q += pk[3].length + 1;
          r.push([q, q + pk[4].length, "d"]); q += pk[4].length + 1;
          r.push([q, q + pk[5].length, "sz"]);
        } else { const b = s.lastIndexOf(" ["); if (b > 0) r.push([b + 1, s.length, "sz"]); }
        return r;
      }
      if ((m = /^(Unpacking|Setting up|Selecting previously unselected package|Preparing to unpack|Processing triggers for) (\S+?)(:\w+)?( \(([^)]*)\))?( \.\.\.)?\.?$/.exec(s))) {
        let p = m[1].length + 1;
        r.push([p, p + m[2].length, "pk"]); p += m[2].length;
        if (m[3]) { r.push([p, p + m[3].length, "d"]); p += m[3].length; }
        if (m[4]) { r.push([p, p + m[4].length, "d"]); p += m[4].length; }
        if (m[6]) r.push([p, p + m[6].length, "d"]);
        return r;
      }
      if ((m = /^Fetched /.exec(s))) return [[0, s.length, "em"]];
      if ((m = /^(\s+)Download size: /.exec(s))) return [[m[0].length, s.length, "em"]];
      if (/^\(Reading database|^debconf: /.test(s)) return [[0, s.length, "d"]];
      return r;
    },
  };

  /* raw typescript → { events, lines }
   * events[i] = { k: "line"|"live", text, segs:[[text, cls]], cont, w }.  "line" = committed by \n (a new row);
   * "live" = a state of the cursor row that will be rewritten (\r progress). Screen after event i = all committed
   * lines so far + the latest live state since the last commit.
   * opts: { header:false (drop "Script started/done"), drop:[RegExp] (committed lines to remove),
   *         dropLive:false|true|[RegExp], from:RegExp (start at the first line matching), until:RegExp (stop after it),
   *         cols:100, wrap:"word" (break long lines at a space) | "char" (exactly like a terminal) | false (clip),
   *         hl:"apt"|fn(text)→ranges|null, junk:/\^@/g (literal text removed before parsing: cat -v residue),
   *         collapseBlank:true, weights:[[RegExp, w]] (reading weight = share of time the screen holds after this event),
   *         saved:true (drop what is drawn between ESC 7 and ESC 8 — save cursor, draw elsewhere, restore: dpkg's
   *         "Progress: [ 23%] [███…]" bar on the bottom row would otherwise glue onto the next line) } */
  T.parse = (raw, opts = {}) => {
    const o = { header: false, drop: [], dropLive: false, cols: 100, wrap: "word", hl: "apt", collapseBlank: true, weights: [], junk: /\^@/g, saved: true, ...opts };
    if (o.junk) raw = raw.replace(o.junk, "");
    if (o.saved) raw = raw.replace(/\x1b7[\s\S]*?\x1b8/g, "");   // drawn off-row and restored (dpkg's progress bar)
    const hl = typeof o.hl === "function" ? o.hl : o.hl ? T.HL[o.hl] : null;
    const out = [];
    let cur = [], col = 0, fg = "", bold = false, lastLive = null;
    const cls = () => [fg, bold ? "b" : ""].filter(Boolean).join(" ");
    const lineOf = () => {
      let n = cur.length; while (n > 0 && (!cur[n - 1] || cur[n - 1].ch === " ")) n--;
      const cells = []; for (let i = 0; i < n; i++) cells.push(cur[i] || { ch: " ", cl: "" });
      return cells;
    };
    const toSegs = (cells) => {
      const text = cells.map((c) => c.ch).join("");
      const cl = cells.map((c) => c.cl);
      if (hl) hl(text).forEach(([a, b, c]) => { for (let i = a; i < Math.min(b, cl.length); i++) if (!cl[i]) cl[i] = c; });
      for (let i = 1; i < text.length; i++) if (text[i] === " " && !/\bhot\b/.test(cl[i] || "")) cl[i] = cl[i - 1];   // spaces join the previous span
      const segs = [];
      for (let i = 0; i < text.length; i++) { const last = segs[segs.length - 1]; if (last && last[1] === cl[i]) last[0] += text[i]; else segs.push([text[i], cl[i]]); }
      return { text, segs };
    };
    const emit = (k) => {
      const { text, segs } = toSegs(lineOf());
      if (k === "live") {
        if (!text.trim()) return;                              // an erased status row: the next write replaces it
        const key = JSON.stringify(segs);
        if (key === lastLive) return;
        lastLive = key;
      } else lastLive = null;
      out.push({ k, text, segs });
    };
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (ch === "\x1b") {
        const nx = raw[i + 1];
        if (nx === "[") {
          let j = i + 2; while (j < raw.length && !/[@-~]/.test(raw[j])) j++;
          const params = raw.slice(i + 2, j), fin = raw[j];
          const ps = params.replace(/^\?/, "").split(";").map((p) => (p === "" ? 0 : +p));
          if (fin === "m") ps.forEach((p) => { if (p === 0) { fg = ""; bold = false; } else if (p === 1) bold = true; else if (p === 22) bold = false; else if (p === 39) fg = ""; else if (FG[p]) fg = FG[p]; });
          else if (fin === "K") { if (ps[0] === 2) cur = []; else if (ps[0] === 1) for (let c = 0; c <= col; c++) cur[c] = { ch: " ", cl: "" }; else cur.length = Math.min(cur.length, col); }
          else if (fin === "G") col = Math.max(0, (ps[0] || 1) - 1);
          else if (fin === "C") col += ps[0] || 1;
          else if (fin === "D") col = Math.max(0, col - (ps[0] || 1));
          i = j; continue;                                       // other CSI (cursor moves, scroll regions): ignored
        }
        if (nx === "]") { let j = i + 2; while (j < raw.length && raw[j] !== "\x07" && !(raw[j] === "\x1b" && raw[j + 1] === "\\")) j++; i = raw[j] === "\x07" ? j : j + 1; continue; }
        i += /[()#]/.test(nx) ? 2 : 1; continue;
      }
      if (ch === "\r") { if (raw[i + 1] === "\n") continue; emit("live"); col = 0; continue; }
      if (ch === "\n") { emit("line"); cur = []; col = 0; continue; }
      if (ch === "\b") { col = Math.max(0, col - 1); continue; }
      if (ch === "\t") { const n = 8 - (col % 8); for (let c = 0; c < n; c++) cur[col++] = { ch: " ", cl: "" }; continue; }
      if (ch < " " || ch === "\x7f") continue;
      for (let c = cur.length; c < col; c++) cur[c] = { ch: " ", cl: "" };
      cur[col++] = { ch, cl: cls() };
    }
    if (lineOf().length) emit("live");

    // filters (committed lines are the unit; live states belong to the line that follows them)
    let ev = out;
    if (!o.header) ev = ev.filter((e) => !/^Script (started|done) on /.test(e.text));
    if (o.from) { const i = ev.findIndex((e) => o.from.test(e.text)); if (i > 0) ev = ev.slice(i); }
    if (o.until) { const i = ev.findIndex((e) => e.k === "line" && o.until.test(e.text)); if (i >= 0) ev = ev.slice(0, i + 1); }
    ev = ev.filter((e) => !(e.k === "line" && o.drop.some((re) => re.test(e.text))));
    if (o.dropLive) ev = ev.filter((e) => e.k !== "live" || (Array.isArray(o.dropLive) && !o.dropLive.some((re) => re.test(e.text))));
    if (o.collapseBlank) ev = ev.filter((e, i) => !(e.k === "line" && !e.text && (i === 0 || (ev[i - 1].k === "line" && !ev[i - 1].text))));
    while (ev.length && ev[ev.length - 1].k === "line" && !ev[ev.length - 1].text) ev.pop();

    // wrap (or clip) to the terminal width; continuation rows appear with their head
    const events = [];
    ev.forEach((e) => {
      const pieces = [];
      if (e.text.length <= o.cols) pieces.push(e);
      else if (!o.wrap || e.k === "live") pieces.push({ ...e, text: e.text.slice(0, o.cols), segs: sliceSegs(e.segs, 0, o.cols) });
      else {
        let a = 0;
        while (a < e.text.length) {
          let b = Math.min(e.text.length, a + o.cols);
          if (o.wrap === "word" && b < e.text.length) {
            let sp = e.text.lastIndexOf(" ", b);
            const open = e.text.lastIndexOf("[", sp), close = e.text.lastIndexOf("]", sp);
            if (open > close && open - 1 > a) sp = open - 1;            // never split "[39.0 kB]"
            if (sp > a + o.cols * 0.4) b = sp + 1;
          }
          pieces.push({ k: e.k, text: e.text.slice(a, b).replace(/ +$/, ""), segs: trimSegs(sliceSegs(e.segs, a, b)), cont: a > 0 });
          a = b;
        }
      }
      pieces.forEach((p) => events.push(p));
    });
    events.forEach((e, i) => {
      const nextCont = events[i + 1] && events[i + 1].cont;
      let w = nextCont ? 0 : e.k === "live" ? 0.12 : e.text.trim() ? 1 : 0.35;
      for (const [re, ww] of o.weights) if (re.test(e.text)) { w = nextCont ? 0 : ww; break; }
      e.w = w; e.i = i;
    });
    return { events, cols: o.cols };
  };

  function trimSegs(segs) { const out = segs.map((x) => [...x]); while (out.length && !out[out.length - 1][0].replace(/ +$/, "")) out.pop(); if (out.length) out[out.length - 1][0] = out[out.length - 1][0].replace(/ +$/, ""); return out; }
  function sliceSegs(segs, a, b) {
    const out = []; let p = 0;
    segs.forEach(([tx, c]) => { const s0 = Math.max(a, p), s1 = Math.min(b, p + tx.length); if (s1 > s0) out.push([tx.slice(s0 - p, s1 - p), c]); p += tx.length; });
    return out;
  }

  // inverse of a monotone ease on [0,1] (bisection; fine for build-time use)
  const einv = (f, v) => { if (v <= 0) return 0; if (v >= 1) return 1; let a = 0, b = 1; for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (f(m) < v) a = m; else b = m; } return (a + b) / 2; };

  // ------------------------------------------------------------------ view
  /* A terminal window on `parent` (a plane). Local px; place it with opts x, y.
   * opts: { theme:"paper"|"night", x, y, w, h, size:26, lh:round(size*1.45), pad:[top,right,bottom,left] or n (36),
   *         frame:true (panel) | false (bare text on the ground), title:null (a quiet title bar),
   *         cmd:{ prompt:"~$ ", text, t0, t1, cls } (typed first line; Enter at t1), endPrompt:true (prompt + caret after the last anchor),
   *         cmds:[{ prompt:"~$ ", text, t0, t1, cls, out:[[t, text | segs], …] }] (more commands typed AFTER the log has finished
   *              — needs the last key to be "end": the prompt comes back when the log ends, the text types t0 → t1,
   *              Enter at t1, then each `out` line prints at its t (never before t1); E s20 types `clang` under the install tail),
   *         keys:[[t, ref, ease]] (ref: event index | "start" | "end" | RegExp | substring; first match after the previous key),
   *         glide:0.16 (s per one-row scroll), snap:true (rows at whole px), screenScale:(t)→s (snap to whole SCREEN px:
   *         pass t => ctx.project(x, y, d, t).s), hot:[[ref, tFrom, tTo]] (rows emphasised), fadeTop:true }
   * cls (cmd and each cmds[k]): an extra class on that command's typed text only ("cmd <cls>"), e.g. E's gold `clang`
   * without touching the other commands.
   * Events before the first key's ref are on screen from the start (a sequence can pick up a log mid-way).
   * Row refs for rowPos / hot also accept {cmd: k} (the k-th extra command's row), {cmd: k, out: j} and "final" (the
   * prompt after the last command). */
  T.view = (parent, log, opts = {}) => {
    const o = { theme: "paper", x: 0, y: 0, w: 1200, h: 720, size: 26, pad: 36, frame: true, title: null, cmd: null, cmds: [], endPrompt: true, keys: [[0, "start"]], glide: 0.16, hot: [], fadeTop: true, ...opts };
    o.lh = o.lh || Math.round(o.size * 1.45);
    const pad = Array.isArray(o.pad) ? o.pad : [o.pad, o.pad, o.pad, o.pad];
    const titleH = o.title ? Math.round(o.size * 2.1) : 0;
    const cw = o.size * 0.6;
    const ev = log.events, N = ev.length;

    // ---- DOM (built once)
    const box = OT.el("div", `ot-term ${o.theme}${o.frame ? " framed" : ""}`, parent);
    box.style.cssText += `left:${Math.round(o.x)}px;top:${Math.round(o.y)}px;width:${o.w}px;height:${o.h}px;font-size:${o.size}px;line-height:${o.lh}px;`;
    if (o.frame) OT.el("div", "tw-bg", box);
    if (o.title) { const tb = OT.el("div", "tw-title", box); tb.style.height = titleH + "px"; tb.style.lineHeight = titleH + "px"; tb.style.fontSize = Math.round(o.size * 0.8) + "px"; tb.textContent = o.title; }
    const scr = OT.el("div", "tw-scr", box);
    const scrH = o.h - titleH - pad[0] - pad[2];
    const VIS = Math.max(1, Math.floor(scrH / o.lh));
    scr.style.cssText += `left:${pad[3]}px;top:${titleH + pad[0]}px;width:${o.w - pad[1] - pad[3]}px;height:${VIS * o.lh}px;`;
    const R = VIS + 3;
    const outSegs = (x) => (typeof x === "string" ? [[x, ""]] : x);
    const MAXSEG = Math.min(10, Math.max(3, ...ev.map((e) => e.segs.length), ...(o.cmds || []).flatMap((c) => (c.out || []).map(([, x]) => outSegs(x).length))));   // span pool per row (extra segments merge)
    const ring = [];
    for (let k = 0; k < R; k++) {
      const row = OT.el("div", "tr", scr);
      row.style.height = o.lh + "px";
      const spans = []; for (let s = 0; s < MAXSEG; s++) spans.push(OT.el("span", "", row));
      ring.push({ el: row, spans, key: null, y: null, a: null, hot: null, vis: null });
    }
    const caret = OT.el("div", "tcar", scr);
    caret.style.width = Math.max(3, Math.round(o.size * 0.12)) + "px";
    caret.style.height = Math.round(o.size * 1.15) + "px";

    // ---- rows: row 0 = command (if any), then one row per committed event
    const HEAD = o.cmd ? 1 : 0;
    const rowOfEvent = new Int32Array(N);          // the screen row an event occupies (live → the row after the last commit)
    const commitsBefore = new Int32Array(N + 1);   // committed rows after the first n events
    const lastLiveAt = new Int32Array(N + 1);      // index of the live event shown after the first n events, or -1
    let c = 0, live = -1;
    for (let i = 0; i < N; i++) {
      commitsBefore[i] = c; lastLiveAt[i] = live;
      rowOfEvent[i] = HEAD + c;
      if (ev[i].k === "line") { c++; live = -1; } else live = i;
    }
    commitsBefore[N] = c; lastLiveAt[N] = live;
    const commitRow = []; ev.forEach((e, i) => { if (e.k === "line") commitRow[rowOfEvent[i] - HEAD] = i; });   // log row → event

    // ---- resolve the anchors → tau[i] = absolute time event i appears
    const resolve = (ref, from) => {
      if (typeof ref === "number") return ref;
      if (ref === "start") return 0;
      if (ref === "end") return N - 1;
      const test = ref instanceof RegExp ? (s) => ref.test(s) : (s) => s.includes(ref);
      for (let i = Math.max(0, from); i < N; i++) if (ev[i].k === "line" && !ev[i].cont && test(ev[i].text)) return i;
      for (let i = Math.max(0, from); i < N; i++) if (test(ev[i].text)) return i;
      throw new Error(`OT.term: key ${ref} matched nothing after event ${from}`);
    };
    const keys = []; let from = 0;
    o.keys.forEach(([t, ref, ease]) => { const i = resolve(ref, from); if (keys.length && i < keys[keys.length - 1].i) throw new Error(`OT.term: key ${ref} (event ${i}) is before the previous key`); if (keys.length && t < keys[keys.length - 1].t) throw new Error(`OT.term: key ${ref} at ${t} is earlier than the previous key`); keys.push({ t, i, e: typeof ease === "function" ? ease : E[ease || "lin"] }); from = i + 1; });
    const tau = new Float64Array(N).fill(Infinity);
    for (let i = 0; i < keys[0].i; i++) tau[i] = -Infinity;
    tau[keys[0].i] = keys[0].t;
    for (let k = 1; k < keys.length; k++) {
      const a = keys[k - 1], b = keys[k];
      let W = 0; for (let j = a.i; j < b.i; j++) W += ev[j].w;
      let acc = 0;
      for (let j = a.i + 1; j <= b.i; j++) {
        acc += ev[j - 1].w;
        const f = W > 0 ? acc / W : 1;
        tau[j] = a.t + (b.t - a.t) * einv(b.e, f);
      }
    }
    const lastKey = keys[keys.length - 1];
    const tEnd = lastKey.i === N - 1 ? lastKey.t : Infinity;

    // ---- typing rhythm: uneven keystrokes (longer after a space), the last one ~0.12 s before Enter
    const keyTimes = (text, t0, t1) => {
      const out = [];
      if (!isFinite(t0) || !isFinite(t1)) return out;
      const ws = [...text].map((ch, k) => 0.7 + 0.6 * OT.hash(k, 41) + (k && text[k - 1] === " " ? 0.7 : 0));
      const W = ws.reduce((a, b) => a + b, 0), span = Math.max(0, t1 - t0 - 0.12);
      let acc = 0; ws.forEach((w) => { acc += w; out.push(t0 + (span * acc) / W); });
      return out;
    };

    // ---- extra commands after the log: their rows follow the log's last row
    const logRows = commitsBefore[N] + (lastLiveAt[N] >= 0 ? 1 : 0);
    const CMDS = (o.cmds || []).map((c0) => ({ prompt: o.cmd ? o.cmd.prompt || "" : "~$ ", ...c0 }));
    if (CMDS.length && !isFinite(tEnd)) console.warn("OT.term: cmds need the log to finish (make the last key \"end\")");
    const cmdRow = [];                                 // screen row - (HEAD + logRows) → {k, j} (j = -1: the prompt row)
    let rr = HEAD + logRows, prevEnd = tEnd;
    CMDS.forEach((cm, k) => {
      cm.row = rr; cm.appear = prevEnd;
      if (cm.t0 < cm.appear) { console.warn(`OT.term: cmds[${k}].t0 is before its prompt can appear (${cm.appear}); typing starts then`); cm.t0 = cm.appear; }
      if (cm.t1 < cm.t0) cm.t1 = cm.t0;
      cm.keyT = keyTimes(cm.text, cm.t0, cm.t1);
      cm.outs = (cm.out || []).map(([tt, x]) => ({ t: Math.max(tt, cm.t1), segs: outSegs(x) }));
      for (let j = 1; j < cm.outs.length; j++) cm.outs[j].t = Math.max(cm.outs[j].t, cm.outs[j - 1].t);
      cm.outT = cm.outs.map((x) => x.t);
      cmdRow.push({ k, j: -1 }); cm.outs.forEach((_, j) => cmdRow.push({ k, j }));
      rr += 1 + cm.outs.length;
      prevEnd = cm.outs.length ? cm.outT[cm.outT.length - 1] : cm.t1;
    });
    const finalRow = rr, finalAt = prevEnd;
    const endPromptText = CMDS.length ? CMDS[CMDS.length - 1].prompt : o.cmd ? o.cmd.prompt || "" : null;

    // ---- scroll: once the cursor row passes the bottom, every committed row scrolls the screen one row.
    // Rows committed at the same instant glide together; a glide never outlasts the gap to the next one, so the
    // newest row is always (at most one glide from being) on screen and nothing lags behind at fast-forward.
    const cmdEnter = o.cmd ? o.cmd.t1 : -Infinity;
    const commitTimes = [];                            // time each screen row is committed (row 0 = the command)
    if (o.cmd) commitTimes.push(cmdEnter);
    for (let r = 0; r < commitRow.length; r++) commitTimes.push(tau[commitRow[r]]);
    if (CMDS.length) {
      if (lastLiveAt[N] >= 0) commitTimes.push(tEnd);  // a trailing live row stays; the prompt comes on the next row
      CMDS.forEach((cm) => { commitTimes.push(cm.t1); cm.outT.forEach((tt) => commitTimes.push(tt)); });
    }
    if (o.cmd && keys[0].t < cmdEnter && keys[0].i > 0) console.warn("OT.term: cmd.t1 is after events that are already on screen");
    const steps = [];                                  // {t, n, d}: at t the scroll target grows by n rows, glide d s
    commitTimes.forEach((t, r) => {
      const grow = Math.max(0, r + 2 - VIS) - Math.max(0, r + 1 - VIS);   // rows in use: committed + the cursor row
      if (!grow) return;
      const s = steps[steps.length - 1];
      if (s && s.t === t) s.n += grow; else steps.push({ t, n: grow });
    });
    steps.forEach((s, k) => { const nx = steps[k + 1]; s.d = Math.max(0, Math.min(o.glide, nx ? (nx.t - s.t) * 0.9 : o.glide)); });
    const stepT = steps.map((s) => s.t);
    const cum = []; { let a = 0; steps.forEach((s) => { a += s.n; cum.push(a); }); }

    const upper = (arr, t) => { let lo = 0, hi = arr.length; while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] <= t) lo = m + 1; else hi = m; } return lo; };
    const scrollAt = (t) => {
      const m = upper(stepT, t);
      if (m === 0) return 0;
      const s = steps[m - 1], before = cum[m - 1] - s.n;
      const u = s.d > 0 ? E.cubicOut(clamp((t - s.t) / s.d)) : 1;
      return before + s.n * u;
    };

    // ---- row refs: an event ref, {cmd: k}, {cmd: k, out: j} or "final"
    const rowOf = (ref) => {
      if (ref === "final") return finalRow;
      if (ref && typeof ref === "object" && !(ref instanceof RegExp) && ref.cmd != null) {
        const cm = CMDS[ref.cmd]; if (!cm) throw new Error(`OT.term: no cmds[${ref.cmd}]`);
        return cm.row + (ref.out == null ? 0 : 1 + ref.out);
      }
      return rowOfEvent[resolve(ref, 0)];
    };

    // ---- hot rows
    const hot = o.hot.map(([ref, a, b]) => ({ row: rowOf(ref), a, b: b ?? Infinity }));

    // ---- per-frame
    const setRow = (R0, segs, keyStr) => {
      if (R0.key === keyStr) return;
      R0.key = keyStr;
      const n = Math.min(segs.length, MAXSEG);
      for (let s = 0; s < MAXSEG; s++) {
        const sp = R0.spans[s];
        if (s < n) {
          const txt = s === MAXSEG - 1 && segs.length > MAXSEG ? segs.slice(s).map((x) => x[0]).join("") : segs[s][0];
          if (sp.textContent !== txt) sp.textContent = txt;
          const cl = segs[s][1] || "";
          if (sp.className !== cl) sp.className = cl;
        } else { if (sp.textContent !== "") sp.textContent = ""; if (sp.className) sp.className = ""; }
      }
    };
    const cmdCls = (c) => (c && c.cls ? "cmd " + c.cls : "cmd");     // the typed text's class (+ the command's own cls)
    const cmdSegs = (k) => [[o.cmd.prompt || "", "p"], [o.cmd.text.slice(0, k), cmdCls(o.cmd)]];
    const keyT = o.cmd ? keyTimes(o.cmd.text, o.cmd.t0, o.cmd.t1) : [];
    const typedAt = (t) => upper(keyT, t);
    const cmTyped = (cm, t) => (t >= cm.t1 ? cm.text.length : t < cm.t0 ? 0 : upper(cm.keyT, t));
    const state = (t) => {
      const n = upper(tau, t);                        // events applied
      const done = n >= N && t >= tEnd;
      let typed = 0;
      if (o.cmd) typed = t >= o.cmd.t1 ? o.cmd.text.length : t < o.cmd.t0 ? 0 : typedAt(t);
      // the cursor row, and which extra command is active (typing, or waiting for its output)
      let cur = HEAD + commitsBefore[n], cmd = -1, ctyped = 0;
      if (done && CMDS.length) {
        cur = finalRow;
        for (let k = 0; k < CMDS.length; k++) {
          const cm = CMDS[k];
          if (t < cm.t1) { cur = cm.row; cmd = k; ctyped = cmTyped(cm, t); break; }
          const shown = upper(cm.outT, t);
          if (shown < cm.outs.length) { cur = cm.row + 1 + shown; cmd = k; ctyped = cm.text.length; break; }
        }
      }
      return { n, c: commitsBefore[n], live: lastLiveAt[n], done, typed, cur, cmd, ctyped };
    };

    const view = {
      el: box, scr, rows: VIS, lh: o.lh, cw, log, tau, keys, cmds: CMDS,
      /* absolute time an event appears (ref as in keys) */
      timeOf: (ref) => tau[resolve(ref, 0)],
      /* local (plane) position of the left edge / vertical centre of the row holding `ref` ({cmd: k} etc. too), at time t */
      rowPos(ref, t) { const r = rowOf(ref); const y = r * o.lh - Math.round(scrollAt(t) * o.lh); return { x: o.x + pad[3], y: o.y + titleH + pad[0] + y + o.lh / 2, visible: y > -o.lh && y < VIS * o.lh }; },
      state,
      render(t) {
        const st = state(t);
        const S = scrollAt(t);
        // whole pixels: on screen when the sequence tells us the plane's scale (glyphs keep their sub-pixel phase), else local
        const sc = o.screenScale ? o.screenScale(t) : 1;
        const off = o.snap === false ? S * o.lh : Math.round(S * o.lh * sc) / sc;
        const top = Math.floor(off / o.lh);
        const curRow = st.cur;                        // the cursor row
        const lastRow = curRow;
        const logEnd = HEAD + logRows;
        const used = new Set();
        for (let r = Math.max(0, top - 1); r <= Math.min(lastRow, top + VIS); r++) {
          const R0 = ring[r % R];
          used.add(r % R);
          let segs, key, caretCol = -1;
          if (r < HEAD) {
            const k = o.cmd ? (t < o.cmd.t0 ? 0 : st.typed) : 0;
            segs = cmdSegs(k); key = "c" + k;
            if (r === curRow || t < cmdEnter) caretCol = (o.cmd.prompt || "").length + k;
          } else if (r < HEAD + st.c) {
            const i = commitRow[r - HEAD]; segs = ev[i].segs; key = "e" + i;
          } else if (r === HEAD + st.c && st.live >= 0) {
            segs = ev[st.live].segs; key = "e" + st.live;
          } else if (CMDS.length && r >= logEnd && st.done) {
            const info = cmdRow[r - logEnd];
            if (!info) {                               // the prompt after the last command
              const on = t >= finalAt && o.endPrompt;
              segs = on ? [[endPromptText, "p"]] : []; key = on ? "pr" : "_";
              if (on && r === curRow) caretCol = endPromptText.length;
            } else {
              const cm = CMDS[info.k];
              if (info.j < 0) {
                const on = t >= cm.appear && (o.endPrompt || t >= cm.t0);
                const k = cmTyped(cm, t);
                segs = on ? [[cm.prompt, "p"], [cm.text.slice(0, k), cmdCls(cm)]] : []; key = on ? `x${info.k}:${k}` : "_";
                if (on && r === curRow && t < cm.t1) caretCol = cm.prompt.length + k;
              } else {
                const ou = cm.outs[info.j];
                const on = t >= ou.t;
                segs = on ? ou.segs : []; key = on ? `o${info.k}:${info.j}` : "_";
              }
            }
          } else if (!CMDS.length && st.done && o.endPrompt && endPromptText != null && r === curRow) {
            segs = [[endPromptText, "p"]]; key = "pr"; caretCol = endPromptText.length;
          } else { segs = []; key = "_"; }
          setRow(R0, segs, key);
          const y = r * o.lh - off;
          if (R0.y !== y) { R0.y = y; R0.el.style.transform = `translate(0px, ${Number.isInteger(y) ? y : y.toFixed(4)}px)`; }
          const a = o.fadeTop ? clamp((y + o.lh) / o.lh) : 1;
          const av = a.toFixed(3);
          if (R0.a !== av) { R0.a = av; R0.el.style.opacity = av; }
          if (R0.vis !== "inherit") { R0.vis = "inherit"; R0.el.style.visibility = "inherit"; }
          const h = hot.some((hh) => hh.row === r && t >= hh.a && t < hh.b);
          if (R0.hot !== h) { R0.hot = h; R0.el.classList.toggle("hot", h); }
          R0.caret = caretCol;
        }
        ring.forEach((R0, k) => { if (!used.has(k) && R0.vis !== "hidden") { R0.vis = "hidden"; R0.el.style.visibility = "hidden"; R0.key = null; } });
        // caret: typing a command (solid while typing), blinking at a prompt
        let cr = -1, cc = 0;
        for (let r = Math.max(0, top - 1); r <= Math.min(lastRow, top + VIS); r++) { const R0 = ring[r % R]; if (R0.caret >= 0) { cr = r; cc = R0.caret; } }
        if (cr >= 0) {
          const typing = (o.cmd && t >= o.cmd.t0 - 0.05 && t < o.cmd.t1 + 0.1) || CMDS.some((cm) => t >= cm.t0 - 0.05 && t < cm.t1 + 0.1);
          const on = typing || Math.floor(t / 0.53) % 2 === 0;
          caret.style.visibility = on ? "inherit" : "hidden";
          caret.style.transform = `translate(${Math.round(cc * cw + 1)}px, ${(cr * o.lh - off + Math.round((o.lh - o.size * 1.15) / 2)).toFixed(2)}px)`;
        } else caret.style.visibility = "hidden";
      },
    };
    return view;
  };
})();
