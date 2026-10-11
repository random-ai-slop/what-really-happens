/* Sequence B — lexer → tree → IR   (s03 s04 s05)
 *
 * One cast carries the whole sequence. The MAIN BLOCK's characters are read, cracked into tokens, and the tokens
 * sink into the water; the parser pulls those same token elements into the AST (they become its node labels),
 * and the AST nodes then fall into the lines of LLVM IR. The string token rises and becomes the hero; it docks as
 * the StringLiteral leaf, hovers over the IR, and finally drops into IR line 1 as c"Hello, world!\0A\00".
 * Every time is derived from the voice (ctx.at / ctx.end / t0 / t1).
 */
OT.sequence({
  id: "B",
  build(ctx) {
    const { t0, t1 } = ctx;
    const { E, clamp, lerp, inv, sstep, hash, spring, mix, rgb } = OT;
    const at = (b, w, n) => ctx.at(b, w, n);
    const en = (b, w, n) => ctx.end(b, w, n);

    // ------------------------------------------------------------------ beats (all from the voice)
    const T = {
      compiler: at("s03", "compiler"), reads: at("s03", "reads"), chops: at("s03", "chops"),
      characters: at("s03", "characters"), tokens: at("s03", "tokens"),
      keywords: at("s03", "keywords"), names: at("s03", "names"), punct: at("s03", "punctuation"),
      and: at("s03", "and"), string: at("s03", "string"), literalEnd: en("s03", "literal"),
      keep: at("s03", "keep"), eye: at("s03", "eye"), screen: en("s03", "screen"),
      parser: at("s04", "parser"), treeEnd: en("s04", "tree"),
      function: at("s04", "function"), inside: at("s04", "inside"), call: at("s04", "call"),
      ret: at("s04", "return"), retEnd: en("s04", "return"),
      semantic: at("s04", "semantic"), sense: en("s04", "sense"),
      printf: at("s04", "print-F"), exist: at("s04", "exist"), yes: at("s04", "yes"),
      pasted: at("s04", "pasted"), description: en("s04", "description"),
      does2: at("s04", "does", 2), string2: at("s04", "string"), it4: at("s04", "it", 4), doesEnd: en("s04", "does", 3),
      lowered: at("s05", "lowered"), repr: at("s05", "representation"), reprEnd: en("s05", "representation"),
      assembly: at("s05", "assembly-like"), no: at("s05", "no"), particular: at("s05", "particular"), cpu: at("s05", "CPU"),
      string5: at("s05", "string"), array: at("s05", "array"), fifteen: at("s05", "fifteen"),
      fourteen: at("s05", "fourteen"), characters5: at("s05", "characters"),
      zero: at("s05", "zero"), marks: at("s05", "marks"), endEnd: en("s05", "end"),
    };

    const DT = 1600; // depth of the syntax tree
    const DI = 3000; // depth of the IR (= exit camera depth)

    // ------------------------------------------------------------------ styles
    const css = ctx.el("style", null, ctx.root);
    css.textContent = `
.sB-wrap{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-style:preserve-3d}
.sB-tok,.sB-lbl{position:absolute;left:0;top:0;font-family:"JetBrains Mono",monospace;white-space:pre;line-height:1.5652em;transform-origin:50% 50%}
.sB-ch{display:inline-block;white-space:pre}
.sB-box{position:absolute;left:-9px;right:-9px;top:18%;bottom:18%;border-radius:8px;border:1.5px solid transparent}
.sB-read{position:absolute;left:0;top:0;width:240px;height:124px;margin:-62px 0 0 -120px;border-radius:50%;background:radial-gradient(closest-side,rgba(100,196,192,.55),rgba(100,196,192,.18) 58%,rgba(100,196,192,0))}
.sB-crack{position:absolute;left:0;top:0;width:2px;height:72px;margin:-36px 0 0 -1px;background:linear-gradient(180deg,rgba(18,70,76,0),rgba(18,70,76,.9) 22%,rgba(18,70,76,.9) 78%,rgba(18,70,76,0))}
.sB-svg{position:absolute;left:0;top:0;overflow:visible}
.sB-svg path{fill:none;stroke-linecap:round}
.sB-svg .edge{stroke:#9fd3e3;stroke-width:2.2}
.sB-svg .edgeG{stroke:#9fd3e3;stroke-width:9;opacity:.12}
.sB-svg .pulse{stroke:#f2feff;stroke-width:4.5}
.sB-svg .thread{stroke:#a8e2ef;stroke-width:2}
.sB-svg .threadG{stroke:#a8e2ef;stroke-width:10;opacity:.13}
.sB-svg .dot{fill:#d4ecf3}
.sB-ck{position:absolute;left:0;top:0;width:26px;height:21px}
.sB-ck svg{display:block}
.sB-decl .bx{position:absolute;left:-16px;right:-16px;top:10%;bottom:10%;border-radius:9px;border:1.5px solid rgba(255,206,110,.6);background:rgba(8,36,58,.55);box-shadow:0 0 26px rgba(255,190,80,.22)}
.sB-ov{position:absolute;font-family:"JetBrains Mono",monospace;white-space:pre;font-size:34px;line-height:54px}
.sB-cell{position:absolute;left:0;top:0;height:40px;border-radius:5px;border:1.5px solid rgba(150,215,250,.7);transform-origin:50% 50%}
.sB-chip{position:absolute;left:0;top:0;width:300px;height:300px;margin:-150px 0 0 -150px}
.sB-chip svg{position:absolute;left:0;top:0}
.sB-chip div{position:absolute;left:0;right:0;top:118px;text-align:center;font-family:"JetBrains Mono",monospace;font-size:52px;color:#bfe8ff}
`;

    // ------------------------------------------------------------------ helpers
    const S = (el, k, v) => { const c = el._sB || (el._sB = {}); if (c[k] !== v) { c[k] = v; el.style[k] = v; } };
    const show = (el, a) => { S(el, "visibility", a < 0.002 ? "hidden" : "visible"); if (a >= 0.002) S(el, "opacity", a.toFixed(3)); };
    const text = (el, s) => { if (el._tx !== s) { el._tx = s; el.textContent = s; } };
    const pos = (el, x, y, d, extra = "") => S(el, "transform", `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${(-d).toFixed(2)}px)${extra}`);
    const bump = (t, a, r, h, f) => sstep(a, a + r, t) * (1 - sstep(a + r + h, a + r + h + f, t)); // rise r, hold h, fall f

    ctx.margins(0, 0); // draw strictly inside [t0, t1): the neighbours own the batons outside it
    const wrap = ctx.el("div", "sB-wrap");
    const plane = (d) => { const p = ctx.el("div", "ot-plane", wrap); p.style.transform = `translate3d(0px, 0px, ${-d}px)`; return p; };

    // ------------------------------------------------------------------ baton 1: the MAIN BLOCK
    const p0 = plane(0);
    const MAIN = OT.C.code(p0, OT.C.PAGE_CODE.slice(1), { lang: "c", theme: "paper", size: 46, lh: 72 });
    const ML = 960 - MAIN.maxWidth / 2, MT = 640 - MAIN.height / 2;
    MAIN.el.style.left = ML + "px";
    MAIN.el.style.top = MT + "px";
    const CW = 46 * 0.6;

    // ------------------------------------------------------------------ far below: CPUs (s05 "belongs to no particular CPU")
    const CHIP_SVG = (() => {
      let s = `<svg width="300" height="300" viewBox="0 0 300 300"><rect x="50" y="50" width="200" height="200" rx="14" fill="rgba(120,200,255,.06)" stroke="#9fdcff" stroke-width="3"/>`;
      for (let i = 0; i < 7; i++) {
        const p = 72 + i * 26;
        s += `<path d="M${p} 50 V22 M${p} 250 V278 M50 ${p} H22 M250 ${p} H278" stroke="#9fdcff" stroke-width="3" stroke-linecap="round"/>`;
      }
      return s + `</svg>`;
    })();
    const CHIPS = [["x86-64", 1250, 300, 255], ["arm64", 1750, 985, 175], ["riscv64", 1500, 1630, 250]].map(([name, dd, sx, sy], i) => {
      const e = ctx.el("div", "sB-chip", wrap, CHIP_SVG + `<div>${name}</div>`);
      e.style.visibility = "hidden";
      // laid out so that, seen from the IR's depth, they sit around the IR block, far below it
      const d = DI + dd, s = 1000 / (1000 - (DI - 100 - d));
      return { el: e, d, x: 960 + (sx - 960) / s, y: 640 + (sy - 640) / s, i };
    });

    // ------------------------------------------------------------------ baton 2: the IR BLOCK (built now, revealed in s05)
    const IR_O0 = [
      '@.str = private constant [15 x i8] c"Hello, world!\\0A\\00"',
      "",
      "define i32 @main() {",
      "  %1 = call i32 (ptr, ...) @printf(ptr @.str)",
      "  ret i32 0",
      "}",
      "",
      "declare i32 @printf(ptr, ...)",
    ];
    const pI = plane(DI);
    const IR = OT.C.code(pI, IR_O0, { lang: "llvm", theme: "night", size: 34, lh: 54 });
    const IL0 = 960 - IR.maxWidth / 2, IT0 = 640 - IR.height / 2;
    IR.el.style.left = IL0 + "px";
    IR.el.style.top = IT0 + "px";
    const ICW = 34 * 0.6;
    const irX = (col) => IL0 + col * ICW;
    const irY = (row) => IT0 + row * 54 + 27;
    const strSpanIdx = IR.segs[0].findIndex((s) => s.textContent.startsWith('c"'));
    const strSpans = IR.segs[0].slice(strSpanIdx);
    // overlays with the block's exact metrics, drawn on top of it for pulses — the block itself stays untouched
    const ov = (row, col, s, color) => { const e = ctx.el("div", "sB-ov", pI); e.textContent = s; e.style.left = irX(col) + "px"; e.style.top = IT0 + row * 54 + "px"; e.style.color = color; e.style.visibility = "hidden"; return e; };
    const OV = {
      n15: ov(0, 25, "[15 x i8]", "#eafffb"),
      z00: ov(0, 53, "\\00", "#fff3d2"),
      call: ov(3, 7, "call", "#fff1ea"),
      ret: ov(4, 2, "ret", "#fff1ea"),
    };
    // the array: one cell per byte — H e l l o , ␠ w o r l d ! \0A \00
    const BYTES = [];
    for (let b = 0; b < 13; b++) BYTES.push([37 + b, 1]);
    BYTES.push([50, 3], [53, 3]);
    const CELLS = BYTES.map(([c, n]) => { const e = ctx.el("div", "sB-cell", pI); e.style.visibility = "hidden"; e.style.width = n * ICW - 3 + "px"; return { el: e, x: irX(c) + 1.5, y: IT0 + 7 }; });

    // ------------------------------------------------------------------ the syntax tree (threads on a plane at DT)
    const LFS = 30, LCW = LFS * 0.6, TFS = 22, TCW = TFS * 0.6, DFS = 26, DCW = DFS * 0.6;
    const N = {
      FD: { x: 960, y: 215, label: "FunctionDecl main" },
      CS: { x: 960, y: 345, label: "CompoundStmt" },
      CE: { x: 650, y: 480, label: "CallExpr" },
      RS: { x: 1330, y: 480, label: "ReturnStmt" },
      DR: { x: 380, y: 625, label: "DeclRefExpr printf" },
      SL: { x: 900, y: 610, label: "StringLiteral" },
      IL: { x: 1330, y: 625, label: "IntegerLiteral 0" },
    };
    Object.values(N).forEach((n) => { n.w = n.label.length * LCW; n.left = n.x - n.w / 2; });
    const SLV = { x: 900, y: 666 }; // the hero's seat as the StringLiteral's value
    const EDGES = [["FD", "CS"], ["CS", "CE"], ["CS", "RS"], ["CE", "DR"], ["CE", "SL"], ["RS", "IL"]];
    const DECL_TXT = "extern int printf (const char *__restrict __format, ...);";
    const PF_X = N.DR.left + 15 * LCW; // centre of "printf" in "DeclRefExpr printf"
    const DECL_X = PF_X - 14 * DCW, DECL_Y = 140; // the declaration's own "printf" sits right above it
    const CC_X = DECL_X + 19 * DCW; // "const char *" inside the declaration
    const SLTAG_Y = 722, SLTAG_FULL_L = 900 - (23 * TCW) / 2;

    const pT = plane(DT);
    {
      let s = `<svg class="sB-svg" width="1920" height="1080" viewBox="0 0 1920 1080">`;
      EDGES.forEach(([a, b]) => {
        const A = N[a], B = N[b], y1 = A.y + 21, y2 = B.y - 25, my = (y1 + y2) / 2;
        const d = `M${A.x} ${y1} C ${A.x} ${my + 26}, ${B.x} ${my - 26}, ${B.x} ${y2}`;
        s += `<path class="edgeG" pathLength="1" d="${d}"/><path class="edge" pathLength="1" d="${d}"/><path class="pulse" pathLength="1" d="${d}"/><circle class="dot" cx="${B.x}" cy="${y2}" r="4.5"/>`;
      });
      const full = `M${PF_X} ${N.DR.y - 22} L${PF_X} -1150`;
      s += `<path class="threadG" pathLength="1" d="${full}"/><path class="thread" pathLength="1" d="${full}"/>`;
      s += `<path class="pulse" pathLength="1" d="${full}"/></svg>`;
      pT.innerHTML = s;
    }
    const svgEdges = [];
    const TH = {};
    {
      const ps = Array.from(pT.querySelectorAll("path")), dots = Array.from(pT.querySelectorAll(".dot"));
      EDGES.forEach((e, i) => svgEdges.push({ g: ps[i * 3], e: ps[i * 3 + 1], p: ps[i * 3 + 2], dot: dots[i], a: e[0], b: e[1] }));
      const k = EDGES.length * 3;
      TH.line = [ps[k], ps[k + 1]]; TH.pulse = ps[k + 2];
      // a pathLength="1" path never shows a 1-unit dash fully without this
      ps.forEach((p) => p.setAttribute("stroke-dasharray", "1 1"));
    }

    // ------------------------------------------------------------------ reading light (surface)
    const readEl = ctx.el("div", "sB-read", wrap);

    // ------------------------------------------------------------------ tokens
    const PAPER = { k: "#a2462b", fn: "#1e1d1a", s: "#a26a05", esc: "#8a5300", num: "#6d5ba8", pu: "#7a756b" };
    const WATER = { k: "#ffc4a8", fn: "#f7f4ee", s: "#ffd166", esc: "#ffe39a", num: "#ddd2ff", pu: "#c6eef0" };
    const LABEL = "#d4ecf3", TAGC = "#8fe0d6", IRBASE = "#e6eef8";
    const TOKS = [
      { tx: "int", ln: 0, col: 0, lc: "kw", cls: "k", role: "tag", at: 0 },
      { tx: "main", ln: 0, col: 4, lc: "name", cls: "fn", role: "node", node: "FD" },
      { tx: "(", ln: 0, col: 8, lc: "punct", cls: "pu", role: "tag", at: 4 },
      { tx: "void", ln: 0, col: 9, lc: "kw", cls: "k", role: "tag", at: 5 },
      { tx: ")", ln: 0, col: 13, lc: "punct", cls: "pu", role: "tag", at: 9 },
      { tx: "{", ln: 0, col: 15, lc: "punct", cls: "pu", role: "node", node: "CS" },
      { tx: "printf", ln: 1, col: 4, lc: "name", cls: "fn", role: "node", node: "DR" },
      { tx: "(", ln: 1, col: 10, lc: "punct", cls: "pu", role: "node", node: "CE" },
      { tx: '"Hello, world!\\n"', ln: 1, col: 11, lc: "str", cls: "s", role: "hero" },
      { tx: ")", ln: 1, col: 28, lc: "punct", cls: "pu", role: "abs", node: "CE" },
      { tx: ";", ln: 1, col: 29, lc: "punct", cls: "pu", role: "abs", node: "CE" },
      { tx: "return", ln: 2, col: 4, lc: "kw", cls: "k", role: "node", node: "RS" },
      { tx: "0", ln: 2, col: 11, lc: "num", cls: "num", role: "node", node: "IL" },
      { tx: ";", ln: 2, col: 12, lc: "punct", cls: "pu", role: "abs", node: "RS" },
      { tx: "}", ln: 3, col: 0, lc: "punct", cls: "pu", role: "abs", node: "CS" },
    ];
    const STR = TOKS[8];
    const FD_TAG_L = N.FD.left + N.FD.w + 30;
    // where each AST node falls in the IR
    const IRT = {
      SL: { row: 0, col: 0, s: "@.str = private constant" },
      SLtag: { row: 0, col: 25, s: "[15 x i8]" },
      FD: { row: 2, col: 0, s: "define i32 @main() {" },
      CE: { row: 3, col: 2, s: "%1 = call i32 (ptr, ...)" },
      DR: { row: 3, col: 27, s: "@printf(ptr @.str)" },
      RS: { row: 4, col: 2, s: "ret i32" },
      IL: { row: 4, col: 10, s: "0" },
      CS: { row: 5, col: 0, s: "}" },
      decl: { row: 7, col: 0, s: "declare i32 @printf(ptr, ...)" },
    };
    // rows unfold bottom-up out of the folded band, so nothing ever flies through a row that has already landed
    const LOW_ORDER = ["decl", "CS", "RS", "IL", "CE", "DR", "FD", "SLtag", "SL"];
    const FOLD0 = T.lowered - 0.12, FOLD1 = T.lowered + 0.62, FCY = 360; // the whole tree folds flat like a closing pop-up
    LOW_ORDER.forEach((id, i) => { IRT[id].Ls = T.lowered + 0.45 + i * 0.075; IRT[id].land = IRT[id].Ls + 1.0; });
    const ROW_LAND = [];
    LOW_ORDER.forEach((id) => { const r = IRT[id].row; ROW_LAND[r] = Math.max(ROW_LAND[r] || 0, IRT[id].land); });
    const tIRdone = Math.max(...ROW_LAND.filter((v) => v));

    const lineCount = [0, 0, 0, 0];
    TOKS.forEach((k) => lineCount[k.ln]++);
    const lineIdx = [0, 0, 0, 0];
    const ZC = 600;
    TOKS.forEach((k, i) => {
      k.i = i;
      k.len = k.tx.length;
      k.el = ctx.el("div", "sB-tok", wrap);
      k.box = ctx.el("div", "sB-box", k.el);
      k.chs = ctx.el("span", "", k.el);
      k.txt = ctx.el("span", "", k.el);
      k.txt.style.display = "none";
      k.mode = "chs";
      k.chars = [];
      const parts = k.lc === "str" ? [['"Hello, world!', "s"], ["\\n", "esc"], ['"', "s"]] : [[k.tx, k.cls]];
      let c = k.col;
      parts.forEach(([s, cls]) => { for (const ch of s) { const e = ctx.el("span", "sB-ch", k.chs); e.textContent = ch; k.chars.push({ el: e, cls, ln: k.ln, col: c++ }); } });
      k.bx = ML + (k.col + k.len / 2) * CW;
      k.by = MT + 72 * k.ln + 36;
      const j = lineIdx[k.ln]++, n = lineCount[k.ln];
      k.gx = (j - (n - 1) / 2) * 18;
      k.gy = (k.ln - 1.5) * 10;
      // the cloud: the code's shape, broken apart and suspended at different depths
      const sx = 960 + (k.bx + k.gx - 960) * 1.5 + (k === STR ? 0 : (hash(i, 21) - 0.5) * 90);
      const sy = 640 + (k.by + k.gy - 640) * 1.7 + (k === STR ? 0 : (hash(i, 22) - 0.5) * 50);
      k.cd = k === STR ? 470 : 400 + 380 * hash(i, 23);
      const s = 1000 / (1000 - (ZC - k.cd));
      k.cx = 960 + (sx - 960) / s;
      k.cy = 640 + (sy - 640) / s;
      k.s0 = T.characters - 0.1 + 0.55 * hash(i, 7);
      k.ph = hash(i, 3) * 6.283;
      k.rot = k === STR ? 0 : (hash(i, 11) - 0.5) * 13;
      k.sp = T.parser + 0.2 + i * 0.12; // the parser consumes the stream in order
      if (k.role === "node") { k.tx2 = N[k.node].x; k.ty2 = N[k.node].y; k.fs2 = LFS; k.label = N[k.node].label; }
      else if (k.role === "tag") { k.tx2 = FD_TAG_L + (k.at + k.len / 2) * TCW; k.ty2 = N.FD.y + 2; k.fs2 = TFS; }
      else if (k.role === "abs") { k.tx2 = N[k.node].x; k.ty2 = N[k.node].y; k.fs2 = 24; }
    });
    const tokOf = (node) => TOKS.find((k) => k.role === "node" && k.node === node);
    const heroLeaf0 = STR.sp, heroLeaf1 = STR.sp + 1.05;

    // cracks at the token boundaries
    const CRACKS = [];
    for (let ln = 0; ln < 4; ln++) {
      const row = TOKS.filter((k) => k.ln === ln);
      for (let j = 1; j < row.length; j++) {
        const a = row[j - 1], b = row[j];
        const el = ctx.el("div", "sB-crack", wrap);
        el.style.visibility = "hidden";
        CRACKS.push({ el, a, b, x: ML + ((a.col + a.len + b.col) / 2) * CW, y: MT + 72 * ln + 36 });
      }
    }
    CRACKS.forEach((c, j) => { c.tc = T.chops + 0.02 + j * 0.028; });

    // reading order for the reading light (whitespace skipped)
    const RLINES = [[0, 0, 16], [1, 4, 30], [2, 4, 13], [3, 0, 1]];
    const RGAP = 2.5;
    const ROFF = [];
    let RU = 0;
    RLINES.forEach(([ln, c0, c1], i) => { ROFF[ln] = RU; RU += c1 - c0 + (i < 3 ? RGAP : 0); });
    const tR0 = T.compiler - 0.02, tR1 = T.chops - 0.12;
    const readUnit = (ln, col) => ROFF[ln] + (col - RLINES[ln][1]) + 0.5;
    const headAt = (h) => {
      for (let i = 0; i < 4; i++) {
        const [ln, c0, c1] = RLINES[i], o = ROFF[ln], L = c1 - c0;
        if (h <= o + L || i === 3) return { ln, col: c0 + clamp(h - o, 0, L), gapA: 1 };
        if (h < o + L + RGAP) return { ln, col: c1, gapA: 1 - sstep(o + L, o + L + RGAP * 0.6, h) };
      }
    };

    // ------------------------------------------------------------------ labels, tags, checks, declaration
    const lbl = (s, fs, color) => { const e = ctx.el("div", "sB-lbl", wrap); e.style.fontSize = fs + "px"; e.style.color = color; e.textContent = s; e.style.visibility = "hidden"; return e; };
    const slLabel = lbl("StringLiteral", LFS, LABEL);
    const ceTag = lbl("int", TFS, TAGC);
    const ilTag = lbl("int", TFS, TAGC);
    const slTag = lbl("char[15]", TFS, TAGC);
    const slArrow = lbl("→", TFS, TAGC);
    const ccTag = lbl("const char *", TFS, "#f4fbff"); // the travelling parameter type
    const drQ = lbl("?", 30, "#bfe6ff");
    const CHECK_SVG = `<svg width="26" height="21" viewBox="0 0 22 18"><path d="M2.5 9.5 L8 15 L19.5 2.5" fill="none" stroke="#c4f7de" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const CK = {};
    ["FD", "CS", "CE", "RS", "DR", "SL", "IL"].forEach((id) => { const e = ctx.el("div", "sB-ck", wrap, CHECK_SVG); e.style.visibility = "hidden"; CK[id] = e; });

    const decl = ctx.el("div", "sB-lbl sB-decl", wrap);
    decl.style.fontSize = DFS + "px";
    decl.style.visibility = "hidden";
    const declBox = ctx.el("div", "bx", decl);
    const declChs = ctx.el("span", "", decl);
    const declTxt = ctx.el("span", "", decl);
    declTxt.style.display = "none";
    const DPARTS = [["extern int ", "#cfe3ea"], ["printf", "#ffffff"], [" (", "#cfe3ea"], ["const char *", "#cfe3ea"], ["__restrict __format, ...);", "#cfe3ea"]];
    const declSpans = DPARTS.map(([s, c]) => { const e = ctx.el("span", "", declChs); e.textContent = s; e.style.color = c; return e; });

    // ------------------------------------------------------------------ camera, ground, motes, light
    // Readable text on screen → the camera rests dead still (two identical keys; a slow creep re-rasterises the glyphs
    // every frame and they shimmer). Between rests it moves decisively: the spline, or an `ease` speed curve.
    const R_LEX = { x: 960, y: 640, z: 585 };                // the token cloud (keywords, names, punctuation)
    const R_EYE = { x: 960, y: 640, z: 690 };                // "keep an eye on it"
    const R_TREE = { x: 900, y: 600, z: DT + 88, roll: 0 };  // the whole tree, through the semantic pass
    const R_DECL = { x: 719, y: 501, z: DT + 188, roll: 0 }; // printf's declaration docks
    const R_STR = { x: 717, y: 533, z: DT + 143 };           // "does it take a string?"
    const R_IR = { x: 960, y: 640, z: DI - 120 };            // the IR block
    const R_L1 = { x: 1154, y: 641, z: DI + 224 };           // IR line 1: the fifteen bytes
    const R_OUT = { x: 960, y: 640, z: DI };                 // exit baton
    ctx.cam([
      [t0, { x: 960, y: 640, z: 0 }],
      [T.chops, { x: 960, y: 640, z: 0 }],                   // still while the compiler reads; the chop pushes off
      [T.characters + 0.1, { z: 70 }],
      [T.tokens + 0.5, { z: 380 }],
      [T.keywords + 0.9, { ...R_LEX }],
      [T.and + 0.15, { ...R_LEX }],
      [T.literalEnd + 0.1, { ...R_EYE }],                    // a short push in on "one string literal"
      [T.screen, { ...R_EYE }],
      [T.parser + 1.8, { ...R_TREE }],
      [T.printf - 0.15, { ...R_TREE, roll: 0.4 }],           // 10 s on the tree: only a breath of roll, no x/y/z
      [T.yes - 0.2, { ...R_DECL }],                          // follows printf's thread up (spline: rides the thread)
      [T.does2, { ...R_DECL }],
      [T.string2 + 0.25, { ...R_STR, ease: "smoother" }],    // short glide down to the string
      [T.doesEnd + 0.45, { ...R_STR }],
      [T.lowered - 0.25, { x: 900, y: 590, z: DT + 50 }],
      [T.repr + 0.35, { ...R_IR }],
      [T.string5 - 0.1, { ...R_IR }],                        // still while the hero lands in its slot…
      [T.fifteen + 0.25, { ...R_L1, ease: "quintInOut" }],   // …then a decisive push onto line 1
      [T.marks, { ...R_L1 }],
      [T.endEnd + 0.55, { ...R_OUT, ease: "quintInOut" }],   // holds through "marks the end", then pulls out
      [t1, { ...R_OUT }],
    ]);
    ctx.exit({ x: 960, y: 640, z: DI });
    ctx.ground([
      [t0, "#e6e9e2"], [T.characters - 0.1, "#e6e9e2"], [T.tokens + 0.15, "#a9cdcb"], [T.keywords, "#5ba3aa"], [T.punct + 0.5, "#4f98a0"],
      [T.screen + 0.3, "#4f98a0"], [T.parser + 2.65, "#2a6f86"], [T.lowered, "#1a4a6e"], [T.reprEnd + 0.3, "#0f2a4f"], [t1, "#0f2a4f"],
    ]);
    ctx.motes([[t0, "dust"], [T.characters + 0.3, "plankton"], [T.repr, "bits"]]);

    const tChopShake = T.chops + 0.04;
    const tDock = T.pasted + 0.05;
    const tClick = T.it4 - 0.03;
    const tLand = T.string5 + 0.75;
    ctx.shake(tChopShake, { amp: 3.2, freq: 42, decay: 7 });
    ctx.flash(T.string + 0.5, { peak: 0.13, decay: 5, color: "#fff2cf" });
    ctx.shake(tDock, { amp: 3, freq: 34, decay: 6 });
    ctx.flash(tDock, { peak: 0.09, decay: 8, color: "#e2f8ff" });
    ctx.shake(tClick, { amp: 2.6, freq: 36, decay: 6 });
    ctx.flash(tClick, { peak: 0.08, decay: 8, color: "#e2f8ff" });
    ctx.flash(tIRdone + 0.02, { peak: 0.14, decay: 6, color: "#bfe8ff" });
    ctx.shake(tIRdone + 0.02, { amp: 5, freq: 30, decay: 5.5 });
    ctx.flash(tLand, { peak: 0.055, decay: 8, color: "#ffe7b0" });
    ctx.shake(tLand, { amp: 3, freq: 34, decay: 6 });

    // camera-relative clamps keep travelling things a little ahead of the lens (legible, never through it)
    const camZ = (t) => ctx.camAt(t).z;
    const tP0 = T.screen + 0.1, tP1 = T.parser + 1.95;

    // ------------------------------------------------------------------ choreography helpers
    const FOCUS = [["kw", T.keywords - 0.08, T.names - 0.12], ["name", T.names - 0.08, T.punct - 0.12], ["punct", T.punct - 0.08, T.and - 0.08]];
    const windowFocus = (wins, id, t) => {
      let f = 0, any = 0, kick = 0;
      for (const [c, a, b] of wins) {
        const w = sstep(a, a + 0.16, t) * (1 - sstep(b - 0.22, b, t));
        any = Math.max(any, w);
        if (c === id) { f = Math.max(f, w); if (t > a) kick = Math.max(kick, Math.exp(-(t - a) * 5)); }
      }
      return { f, any, kick };
    };
    const NFOCUS = [["FD", T.function - 0.1, T.inside - 0.15], ["CS", T.inside - 0.08, T.call - 0.12], ["CE", T.call - 0.08, T.ret - 0.12], ["RS", T.ret - 0.08, T.retEnd + 0.7], ["DR", T.printf - 0.08, T.description + 0.5]];
    const classFocus = (lc, t) => windowFocus(FOCUS, lc, t);
    const nodeFocus = (id, t) => windowFocus(NFOCUS, id, t);
    // semantic analysis: a ring of light runs down the edges level by level
    const SEM = T.semantic + 0.02, LV = 0.42;
    const EDGE_PULSE = { "FD-CS": SEM, "CS-CE": SEM + LV, "CS-RS": SEM + LV, "CE-DR": SEM + 2 * LV, "CE-SL": SEM + 2 * LV, "RS-IL": SEM + 2 * LV };
    const CHECK_T = { FD: SEM, CS: SEM + LV, RS: SEM + 2 * LV, IL: SEM + 3 * LV, DR: tDock, CE: tClick, SL: tClick + 0.07 };
    const EDGE_GROW = {
      "FD-CS": tokOf("CS").sp + 0.45, "CS-CE": tokOf("CE").sp + 0.4, "CE-DR": tokOf("CE").sp + 0.6,
      "CE-SL": heroLeaf1 - 0.35, "CS-RS": tokOf("RS").sp + 0.4, "RS-IL": tokOf("IL").sp + 0.45,
    };
    const lowRetract = (t) => sstep(T.lowered - 0.2, T.lowered + 0.5, t);

    // the lowering of a tree label: (1) the whole tree folds flat while it sinks ahead of the camera,
    // (2) each folded label unfolds into its own IR row and decodes into the IR text
    const fold = (t) => E.cubicInOut(inv(FOLD0, FOLD1, t));
    function lowerPose(id, fromX, fromY, fromFs, t, anchor0 = 0.5) {
      const R = IRT[id], f = fold(t), u = E.cubicInOut(inv(R.Ls, R.land, t));
      const xf = 960 + (fromX - 960) * (1 - 0.12 * f), yf = FCY + (fromY - FCY) * (1 - 0.8 * f);
      const dWant = lerp(DT, DI, E.cubicInOut(inv(FOLD0, R.land - 0.1, t)));
      const cz = camZ(t);
      const d = clamp(dWant, Math.max(DT, cz - 250), lerp(Math.max(DT, cz + 300), DI, sstep(0.55, 1, u)));
      return {
        u, f, x: lerp(xf, irX(R.col), u), y: lerp(yf, irY(R.row), u), d, anchor: lerp(anchor0, 0, u), fs: lerp(fromFs, 34, u),
        rx: -68 * f * (1 - u), a: 1 - sstep(R.land - 0.02, R.land + 0.3, t), su: inv(R.Ls + 0.3, R.land - 0.12, t),
      };
    }
    const scr = (from, to, u, t, seed) => OT.scramble(from, to, u, t, seed);

    // lexer-phase pose of a token (world, local coords) — shared by render and the hero hand-off
    function tokenPose(k, t) {
      const g = E.expoOut(inv(T.chops + 0.03, T.chops + 0.6, t));
      const x0 = k.bx + k.gx * g, y0 = k.by + k.gy * g;
      const us = E.cubicInOut(inv(k.s0, k.s0 + 1.7, t));
      // "keep an eye on it": the others part and sink away from the string
      const part = E.cubicInOut(inv(T.string, T.keep + 0.4, t));
      const pf = 1 + 0.42 * part;
      let cx = k.cx + 16 * Math.sin(0.55 * t + k.ph), cy = k.cy + 12 * Math.cos(0.47 * t + 1.3 * k.ph);
      if (k !== STR) { cx = 960 + (cx - 960) * pf; cy = 640 + (cy - 640) * pf; }
      const cd = k.cd + 26 * Math.sin(0.31 * t + k.ph) + 16 * Math.max(0, t - T.keywords) + (k !== STR ? 230 * part : 0);
      return { x: lerp(x0, cx, us), y: lerp(y0, cy, us), d: lerp(0, cd, us), rot: (k.rot + 3 * Math.sin(0.4 * t + k.ph)) * us };
    }

    // ------------------------------------------------------------------ hero
    const HERO_S = '"Hello, world!\\n"';
    const HERO_IR = 'c"Hello, world!\\0A\\00"';
    const HOVER = { x: irX(46), y: IT0 - 54 };
    const SLOT = { x: irX(46), y: irY(0) };
    const HSIZE = 64;
    ctx.hero((t) => {
      if (t < T.string || t >= tLand + 0.3) return null;
      if (t < T.screen + 0.6) {
        // born from the token: rises towards the lens and settles at the vanishing point
        const tp = tokenPose(STR, t);
        const pr = ctx.project(tp.x, tp.y, tp.d, t);
        const u = E.cubicInOut(inv(T.string, T.string + 0.95, t));
        const sw = Math.sin(Math.PI * u);
        const born = sstep(T.string + 0.2, T.string + 0.7, t);
        const breathe = 1 + 0.018 * Math.sin((t - T.keep) * 2.4) * sstep(T.keep - 0.5, T.keep, t);
        return {
          text: HERO_S, x: lerp(pr.x, 960, u), y: lerp(pr.y, 640, u) - 40 * sw, size: lerp(46 * pr.s, HSIZE, u) * (1 + 0.16 * sw) * breathe,
          weight: u < 0.45 ? 400 : 700, color: rgb(mix(WATER.s, "#ffc54d", born)),
          glow: lerp(0.35, 1, born) + 0.8 * bump(t, T.string + 0.3, 0.2, 0.1, 0.6) + 0.7 * bump(t, T.eye - 0.1, 0.25, 0.3, 0.9),
        };
      }
      if (t < T.lowered - 0.05) {
        // to the StringLiteral leaf, then pinned to it
        const leaf = ctx.project(SLV.x, SLV.y, DT, t);
        const u = E.cubicInOut(inv(heroLeaf0, heroLeaf1, t));
        const nf = nodeFocus("SL", t).any;
        const ask = bump(t, T.does2, 0.25, T.it4 - T.does2 + 0.2, 0.6);
        const breathe = 1 + 0.018 * Math.sin((t - T.keep) * 2.4) * (1 - u);
        return {
          text: HERO_S, x: lerp(960, leaf.x, u), y: lerp(640, leaf.y, u) - 50 * Math.sin(Math.PI * u), size: lerp(HSIZE * breathe, 40 * leaf.s, u),
          color: "#ffc54d", opacity: 1 - 0.42 * nf, glow: 1 + 0.5 * ask + 0.9 * bump(t, tClick, 0.05, 0.1, 0.7),
        };
      }
      // lift off the folding tree (riding just ahead of the lens), hover over IR line 1, then drop into the slot
      // it rises clear of the folding tree, waits up high while the rows unfold, then settles over IR line 1
      const uL = E.expoInOut(inv(T.lowered - 0.1, T.lowered + 0.6, t));
      const uX = E.cubicInOut(inv(T.lowered - 0.05, T.lowered + 1.5, t));
      const uD = E.cubicInOut(inv(T.lowered + 1.4, T.lowered + 2.1, t));
      const bob = 7 * Math.sin((t - T.repr) * 1.9) * sstep(T.repr, T.repr + 0.8, t) * (1 - sstep(T.string5 - 0.2, T.string5 + 0.1, t));
      const ud = E.cubicInOut(inv(T.string5 + 0.05, tLand, t));
      const wx = lerp(SLV.x, HOVER.x, uX);
      const wy = lerp(lerp(lerp(SLV.y, 250, uL), HOVER.y + bob, uD), SLOT.y, ud);
      const cz = camZ(t);
      const dWant = lerp(DT, DI, E.cubicInOut(inv(T.lowered + 0.2, T.lowered + 2.0, t)));
      const d = clamp(dWant, Math.max(DT, cz - 230), lerp(Math.max(DT, cz + 300), DI, uD));
      const p = ctx.project(wx, wy, d, t);
      const su = inv(T.string5 + 0.2, tLand - 0.12, t);
      return {
        text: scr(HERO_S, HERO_IR, su, t, 5), x: p.x, y: p.y, size: lerp(40, 34, ud) * p.s,
        weight: su > 0.85 ? 400 : 700, color: "#ffc54d", opacity: 1 - sstep(tLand - 0.02, tLand + 0.22, t), glow: 1 + 0.6 * bump(t, tLand - 0.1, 0.08, 0.05, 0.3),
      };
    });

    // ------------------------------------------------------------------ render
    ctx.render((t) => {
      const live = t >= t0 && t < t1;
      S(wrap, "display", live ? "" : "none");
      if (!live) return;

      const uW = sstep(T.tokens + 0.3, T.keywords, t); // paper ink → water ink (flips once the water is dark enough)
      const tSwap = tR0 - 0.04;
      const cz = camZ(t);

      // ---- baton 1 (exact component) until the reading begins, then the token cast takes over
      show(p0, t < tSwap ? 1 : 0);

      // ---- reading light
      const head = inv(tR0, tR1, t) * RU;
      const reading = t > tR0 - 0.1 && t < tR1 + 0.4;
      {
        const a = sstep(tR0 - 0.05, tR0 + 0.15, t) * (1 - sstep(tR1 - 0.05, tR1 + 0.15, t));
        if (a > 0.002) {
          const hd = headAt(head);
          pos(readEl, ML + hd.col * CW, MT + 72 * hd.ln + 38, 0);
          show(readEl, a * hd.gapA);
        } else show(readEl, 0);
      }

      // ---- cracks
      const g = E.expoOut(inv(T.chops + 0.03, T.chops + 0.6, t));
      CRACKS.forEach((c) => {
        const a = sstep(c.tc - 0.01, c.tc + 0.03, t) * (1 - sstep(c.tc + 0.16, c.tc + 0.6, t));
        if (a < 0.002) { show(c.el, 0); return; }
        const sy = E.expoOut(inv(c.tc, c.tc + 0.09, t));
        pos(c.el, c.x + ((c.a.gx + c.b.gx) / 2) * g, c.y + c.a.gy * g, 0, ` scaleY(${sy.toFixed(3)})`);
        show(c.el, a);
      });

      // ---- tokens
      const strFocus = sstep(T.and - 0.05, T.and + 0.3, t);
      const heroDim = sstep(T.string, T.string + 0.4, t) * (1 - sstep(T.screen + 0.2, T.parser + 0.4, t));
      TOKS.forEach((k) => {
        if (t < tSwap) { show(k.el, 0); return; }
        if (k === STR && t >= T.string) { show(k.el, 0); return; }
        const tp = tokenPose(k, t);
        let x = tp.x, y = tp.y, d = tp.d, rot = tp.rot, fs = 46, anchor = 0.5, rx = 0, a = 1, sc = 1;
        // parse: sink towards the tree plane (riding just ahead of the camera), each token pulled to its place on a spring
        if (t > tP0) {
          const dWant = lerp(d, DT, E.cubicInOut(inv(tP0, tP1, t)));
          d = clamp(dWant, Math.min(DT, cz - 250), Math.max(d, Math.min(DT, cz + 150)));
        }
        const ux = k.role === "hero" ? 0 : clamp(spring(t, k.sp, 10, 0.6), 0, 1.25);
        const uxc = clamp(ux);
        if (k.tx2 !== undefined) { x = lerp(x, k.tx2, ux); y = lerp(y, k.ty2, ux); }
        rot *= 1 - uxc;
        if (k.fs2) fs = lerp(46, k.fs2, uxc);
        if (k.role === "abs") { a *= 1 - sstep(0.72, 0.98, uxc); sc = lerp(1, 0.5, sstep(0.6, 1, uxc)); }

        // lexer-class pulses
        const cf = classFocus(k.lc, t);
        let lit = cf.f, dim = cf.any - cf.f;
        if (k === STR) lit = Math.max(lit, strFocus);
        else dim = Math.max(dim, strFocus * (1 - sstep(T.string + 0.3, T.string + 0.9, t)) * 0.8, heroDim * 1.25);
        sc *= 1 + cf.f * (0.1 + 0.22 * cf.kick) + (k === STR ? 0.08 * strFocus : 0);
        a *= 1 - 0.5 * clamp(dim, 0, 1.25) * (1 - uxc);

        // tree phase: node focus, semantic glow, the lowering
        let col = null, glow = 0, txt = null, weight = k.cls === "fn" ? 700 : 400;
        if (k.role === "node" || k.role === "tag") {
          const nodeId = k.role === "node" ? k.node : "FD";
          const nf = nodeFocus(nodeId, t);
          const f = nf.f * (1 - lowRetract(t));
          a *= 1 - 0.55 * (nf.any - nf.f) * uxc * (1 - lowRetract(t));
          if (k.role === "node") {
            sc *= 1 + uxc * (0.09 * f + 0.12 * f * nf.kick);
            glow = Math.max(f, 0.7 * bump(t, CHECK_T[k.node] - 0.05, 0.08, 0.15, 0.6));
            const su = inv(k.sp + 0.32, k.sp + 0.85, t);
            if (su > 0) { txt = scr(k.tx, k.label, su, t, k.i + 2); if (su >= 0.5) weight = 400; }
            col = rgb(mix(WATER[k.cls], f > 0.01 ? mix(LABEL, "#ffffff", f) : LABEL, uxc));
          } else {
            const semB = sstep(SEM - 0.05, SEM + 0.3, t);
            col = rgb(mix(WATER[k.cls], mix(TAGC, "#c9fff6", 0.5 * semB + 0.5 * f), uxc));
            glow = 0.5 * f;
          }
          const lid = k.role === "node" ? k.node : "FD";
          if (t > FOLD0) {
            if (k.role === "node") {
              const lp = lowerPose(lid, N[lid].x, N[lid].y, LFS, t);
              x = lp.x; y = lp.y; d = lp.d; anchor = lp.anchor; fs = lp.fs; rx = lp.rx; a *= lp.a; sc = lerp(sc, 1, lp.f);
              txt = scr(k.label, IRT[lid].s, lp.su, t, k.i + 9);
              col = rgb(mix(LABEL, IRBASE, lp.u)); glow = Math.max(glow * (1 - lp.f), 0.4 * Math.sin(Math.PI * lp.u));
            } else {
              const lp = lowerPose(lid, k.tx2, k.ty2, TFS, t);
              x = lp.x; y = lp.y; d = lp.d; rx = lp.rx; fs = lerp(TFS, 26, lp.u);
              a *= 1 - sstep(0.1, 0.45, lp.u);
            }
          }
        }

        // mode: per-char (lexer) or text (labels)
        if (txt !== null) {
          if (k.mode !== "txt") { k.mode = "txt"; S(k.chs, "display", "none"); S(k.txt, "display", ""); }
          text(k.txt, txt);
          S(k.txt, "color", col);
        } else {
          if (k.mode !== "chs") { k.mode = "chs"; S(k.chs, "display", ""); S(k.txt, "display", "none"); }
          k.chars.forEach((c) => {
            let cc = mix(PAPER[c.cls], WATER[c.cls], uW);
            let lift = 0, ls = 1;
            if (reading) {
              const act = Math.exp(-Math.pow((head - readUnit(c.ln, c.col)) / 1.7, 2));
              lift = -9 * act; ls = 1 + 0.2 * act;
              cc = mix(cc, [16, 104, 112], 0.85 * act);
            }
            if (lit > 0.001 && uxc < 1) cc = mix(cc, k === STR ? [255, 214, 120] : [255, 255, 255], 0.55 * lit * (1 - uxc) * uW);
            S(c.el, "color", col && uxc > 0 ? col : rgb(cc));
            S(c.el, "transform", lift || ls !== 1 ? `translateY(${lift.toFixed(2)}px) scale(${ls.toFixed(3)})` : "none");
          });
        }
        S(k.el, "fontWeight", String(weight));
        S(k.el, "fontSize", fs.toFixed(2) + "px");
        const gl = Math.max(glow, lit * uW * (1 - uxc));
        S(k.el, "textShadow", gl > 0.01 ? `0 0 ${(8 + 18 * gl).toFixed(1)}px rgba(255,255,255,${(0.65 * gl).toFixed(2)})` : uW > 0.5 ? "0 0 14px rgba(255,255,255,.18)" : "none");

        // hairline outline of each token
        const boxA = sstep(T.chops + 0.1, T.chops + 0.45, t) * (1 - sstep(0.05, 0.6, uxc));
        S(k.box, "borderColor", boxA > 0.002 ? rgb(mix([40, 46, 44], [226, 250, 250], uW), (0.3 + 0.12 * uW) * boxA) : "transparent");

        a *= ctx.depthAlpha(d, t);
        pos(k.el, x, y, d, ` translate(${(-anchor * 100).toFixed(2)}%, -50%) rotateX(${rx.toFixed(2)}deg) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(4)})`);
        show(k.el, a);
      });

      // ---- the tree's threads
      show(pT, ctx.depthAlpha(DT, t) * (t > tP0 ? 1 : 0));
      const retract = lowRetract(t);
      const dash = (p, vis) => S(p, "strokeDashoffset", (1 - clamp(vis)).toFixed(4));
      svgEdges.forEach((ed) => {
        const key = ed.a + "-" + ed.b;
        const vis = E.cubicOut(inv(EDGE_GROW[key], EDGE_GROW[key] + 0.5, t)) * (1 - retract);
        dash(ed.g, vis); dash(ed.e, vis);
        const fa = nodeFocus(ed.b, t), fb = nodeFocus(ed.a, t);
        const dimE = 1 - 0.5 * Math.max(fa.any, fb.any) * (1 - Math.max(fa.f, fb.f));
        S(ed.e, "opacity", (0.85 * dimE).toFixed(3));
        S(ed.dot, "opacity", (sstep(0.85, 1, vis) * dimE).toFixed(3));
        const ps = EDGE_PULSE[key], pu = inv(ps, ps + LV, t);
        S(ed.p, "strokeDasharray", "0.16 2");
        S(ed.p, "strokeDashoffset", (0.16 - pu * 1.16).toFixed(4));
        S(ed.p, "opacity", (pu > 0 && pu < 1 ? Math.sin(Math.PI * pu) : 0).toFixed(3));
      });
      {
        // printf's thread: shoots up out of frame, a shimmer climbs it, the declaration rides down it
        const LO = (N.DR.y - 22 - (DECL_Y + 21)) / (N.DR.y - 22 + 1150); // the part between DeclRefExpr and the docked declaration
        const gu = E.expoOut(inv(T.printf + 0.05, T.printf + 0.75, t));
        const reel = E.cubicInOut(inv(tDock - 0.05, tDock + 0.45, t));
        TH.line.forEach((p) => dash(p, Math.min(gu, lerp(1, LO, reel)) * (1 - retract)));
        const pu = inv(T.exist - 0.05, T.exist + 0.75, t);
        S(TH.pulse, "strokeDasharray", "0.1 2");
        S(TH.pulse, "strokeDashoffset", (0.1 - pu * 1.1).toFixed(4));
        S(TH.pulse, "opacity", (pu > 0 && pu < 1 ? Math.sin(Math.PI * pu) : 0).toFixed(3));
      }

      // ---- StringLiteral label (appears as the hero docks)
      {
        const u = inv(heroLeaf1 - 0.25, heroLeaf1 + 0.35, t);
        let x = N.SL.x, y = N.SL.y, d = DT, anchor = 0.5, fs = LFS, rx = 0, a = sstep(0, 0.4, u);
        let s = scr("", "StringLiteral", u, t, 31), col = LABEL;
        a *= 1 - 0.5 * nodeFocus("SL", t).any * (1 - lowRetract(t));
        if (t > FOLD0) {
          const lp = lowerPose("SL", N.SL.x, N.SL.y, LFS, t);
          x = lp.x; y = lp.y; d = lp.d; anchor = lp.anchor; fs = lp.fs; rx = lp.rx; a = lp.a;
          s = scr("StringLiteral", IRT.SL.s, lp.su, t, 33);
          col = rgb(mix(LABEL, IRBASE, lp.u));
        }
        text(slLabel, s); S(slLabel, "color", col); S(slLabel, "fontSize", fs.toFixed(2) + "px");
        pos(slLabel, x, y, d, ` translate(${(-anchor * 100).toFixed(2)}%, -50%) rotateX(${rx.toFixed(2)}deg)`);
        show(slLabel, a * ctx.depthAlpha(d, t));
      }

      // ---- type tags (semantic analysis) and the const char * that flies down to the string
      const tagPose = (el, x, y, a, d = DT, extra = "") => { pos(el, x, y, d, ` translate(0%, -50%)${extra}`); show(el, a * ctx.depthAlpha(d, t)); };
      const fadeLow = 1 - sstep(T.lowered - 0.15, T.lowered + 0.35, t);
      tagPose(ceTag, N.CE.left + N.CE.w + 16, N.CE.y + 2, sstep(tDock + 0.1, tDock + 0.5, t) * fadeLow);
      tagPose(ilTag, N.IL.left + N.IL.w + 16, N.IL.y + 2, sstep(CHECK_T.IL, CHECK_T.IL + 0.4, t) * fadeLow);
      {
        // char[15]: appears in the semantic pass, slides left when const char * clicks in, lowers into [15 x i8]
        const ua = sstep(CHECK_T.IL, CHECK_T.IL + 0.4, t);
        const slide = E.expoOut(inv(tClick - 0.04, tClick + 0.3, t));
        const x = lerp(900 - (8 * TCW) / 2, SLTAG_FULL_L, slide);
        if (t > FOLD0) {
          const lp = lowerPose("SLtag", x + (8 * TCW) / 2, SLTAG_Y, TFS, t);
          text(slTag, scr("char[15]", IRT.SLtag.s, lp.su, t, 41));
          S(slTag, "color", rgb(mix(TAGC, IRBASE, lp.u))); S(slTag, "fontSize", lp.fs.toFixed(2) + "px");
          pos(slTag, lp.x, lp.y, lp.d, ` translate(${(-lp.anchor * 100).toFixed(2)}%, -50%) rotateX(${lp.rx.toFixed(2)}deg)`);
          show(slTag, ua * lp.a * ctx.depthAlpha(lp.d, t));
        } else {
          text(slTag, "char[15]"); S(slTag, "color", rgb(mix(TAGC, "#e9fffb", bump(t, tClick, 0.05, 0.2, 0.8)))); S(slTag, "fontSize", TFS + "px");
          tagPose(slTag, x, SLTAG_Y, ua);
        }
        tagPose(slArrow, SLTAG_FULL_L + 9 * TCW, SLTAG_Y, sstep(tClick, tClick + 0.25, t) * fadeLow);
        // the travelling const char *: lifts off the declaration, arcs over the tree towards the lens, clicks in
        const t0c = T.string2 - 0.05, t1c = tClick - 0.04;
        const cg = bump(t, tClick - 0.05, 0.05, 0.15, 0.8);
        const e = E.cubicInOut(inv(t0c, t1c, t)), v = 1 - e;
        const P0 = [CC_X, DECL_Y], P1 = [790, 420], P2 = [SLTAG_FULL_L + 11 * TCW, SLTAG_Y];
        const px = v * v * P0[0] + 2 * v * e * P1[0] + e * e * P2[0], py = v * v * P0[1] + 2 * v * e * P1[1] + e * e * P2[1];
        S(ccTag, "fontSize", lerp(DFS, TFS, e).toFixed(2) + "px");
        S(ccTag, "color", rgb(mix([214, 255, 248], [255, 255, 255], Math.max(0.7 * (1 - sstep(0.85, 1, e)), cg))));
        S(ccTag, "textShadow", `0 0 ${(10 + 16 * Math.max(cg, Math.sin(Math.PI * e))).toFixed(1)}px rgba(200,255,250,${(0.35 + 0.45 * cg).toFixed(2)})`);
        tagPose(ccTag, px, py, sstep(t0c - 0.1, t0c + 0.05, t) * fadeLow, DT - 330 * Math.sin(Math.PI * e));
      }

      // ---- checks (and the question mark that waits for printf's declaration)
      Object.entries(CK).forEach(([id, el]) => {
        const tc = CHECK_T[id];
        const pop = clamp(spring(t, tc, 22, 0.45), 0, 1.4);
        const a = sstep(tc - 0.02, tc + 0.06, t) * fadeLow;
        const n = N[id];
        pos(el, n.left - 44, n.y - 11, DT, ` scale(${pop.toFixed(3)})`);
        show(el, a * ctx.depthAlpha(DT, t));
      });
      {
        const tq = CHECK_T.IL;
        const a = sstep(tq, tq + 0.15, t) * (1 - sstep(tDock - 0.05, tDock + 0.05, t));
        const q = 1 + 0.3 * bump(t, T.exist - 0.05, 0.1, 0.2, 0.4) + 0.15 * bump(t, T.printf - 0.05, 0.1, 0.1, 0.3);
        pos(drQ, N.DR.left - 40, N.DR.y, DT, ` translate(-50%, -50%) scale(${q.toFixed(3)})`);
        show(drQ, a * ctx.depthAlpha(DT, t));
      }

      // ---- the declaration from <stdio.h>: rides down the printf thread and docks
      {
        const du = clamp(spring(t, T.yes - 0.3, 7.5, 0.62), 0, 1.15);
        let x = DECL_X, y = lerp(-560, DECL_Y, du), d = DT, fs = DFS, rx = 0;
        let a = sstep(T.yes - 0.3, T.yes + 0.1, t);
        const ccHot = bump(t, T.does2 - 0.05, 0.25, T.it4 - T.does2, 0.6);
        S(declSpans[3], "color", rgb(mix([207, 227, 234], [255, 255, 255], ccHot)));
        S(declSpans[3], "textShadow", ccHot > 0.01 ? `0 0 ${(14 * ccHot).toFixed(1)}px rgba(210,255,250,${(0.7 * ccHot).toFixed(2)})` : "none");
        const pfHot = bump(t, tDock - 0.1, 0.1, 0.3, 0.8);
        S(declSpans[1], "textShadow", pfHot > 0.01 ? `0 0 ${(16 * pfHot).toFixed(1)}px rgba(255,255,255,${(0.8 * pfHot).toFixed(2)})` : "none");
        const dimD = 1 - 0.4 * bump(t, T.does2, 0.3, T.it4 - T.does2, 0.6);
        [0, 2, 4].forEach((i) => S(declSpans[i], "opacity", dimD.toFixed(3)));
        if (t > FOLD0) {
          const lp = lowerPose("decl", DECL_X, DECL_Y, DFS, t, 0);
          x = lp.x; y = lp.y; d = lp.d; fs = lp.fs; rx = lp.rx; a *= lp.a;
          if (lp.su > 0) {
            if (decl._m !== "txt") { decl._m = "txt"; declChs.style.display = "none"; declTxt.style.display = ""; }
          } else if (decl._m !== "chs") { decl._m = "chs"; declChs.style.display = ""; declTxt.style.display = "none"; }
          text(declTxt, scr(DECL_TXT, IRT.decl.s, lp.su, t, 51));
          S(declTxt, "color", rgb(mix([207, 227, 234], OT.hex2(IRBASE), lp.u)));
          S(declBox, "opacity", (1 - sstep(0, 0.4, lp.u)).toFixed(3));
        } else {
          if (decl._m !== "chs") { decl._m = "chs"; declChs.style.display = ""; declTxt.style.display = "none"; }
          S(declBox, "opacity", "1");
        }
        S(decl, "fontSize", fs.toFixed(2) + "px");
        pos(decl, x, y, d, ` translate(0%, -50%) rotateX(${rx.toFixed(2)}deg)`);
        S(decl, "transformOrigin", "0% 50%");
        show(decl, a * ctx.depthAlpha(d, t));
      }

      // ---- the IR block: rows appear as their nodes land; the string waits for the hero
      show(pI, t > T.lowered ? ctx.depthAlpha(DI, t, [430, 820], [-3200, -2000]) : 0);
      const focusStr = bump(t, T.fifteen - 0.3, 0.4, T.endEnd - T.fifteen, 0.6);
      IR.rows.forEach((row, r) => {
        const land = ROW_LAND[r];
        let a = land ? sstep(land - 0.05, land + 0.25, t) : 1;
        if (r > 0) a *= 1 - 0.55 * focusStr;
        S(row, "opacity", a >= 0.999 ? "" : a.toFixed(3));
      });
      const strA = sstep(tLand - 0.04, tLand + 0.18, t);
      strSpans.forEach((sp) => S(sp, "opacity", strA >= 0.999 ? "" : strA.toFixed(3)));

      // overlays: "assembly-like" (call / ret), "array of fifteen bytes" ([15 x i8]), "a zero that marks the end" (\00)
      const glowOv = (el, a, c) => { show(el, a); if (a > 0.002) S(el, "textShadow", `0 0 ${(6 + 16 * a).toFixed(1)}px ${c}`); };
      const asmA = bump(t, T.assembly - 0.05, 0.25, 0.8, 0.6);
      glowOv(OV.call, asmA, "rgba(255,190,160,.85)");
      glowOv(OV.ret, asmA, "rgba(255,190,160,.85)");
      glowOv(OV.n15, bump(t, T.array - 0.05, 0.25, T.fourteen - T.array - 0.1, 0.5), "rgba(140,255,235,.9)");
      const z0 = bump(t, T.zero - 0.06, 0.12, T.endEnd - T.zero, 0.7);
      glowOv(OV.z00, z0, "rgba(255,210,120,.95)");

      // the fifteen bytes, counted as the cells of an array
      const cellOut = 1 - sstep(T.endEnd + 0.05, T.endEnd + 0.7, t);
      CELLS.forEach((cl, b) => {
        const tb = T.fifteen - 0.05 + b * 0.036;
        const a = sstep(tb, tb + 0.06, t) * cellOut;
        if (a < 0.002) { show(cl.el, 0); return; }
        const pop = clamp(spring(t, tb, 22, 0.55), 0, 1.25);
        const isZero = b === 14;
        const sweep = isZero ? 0 : sstep(T.fourteen - 0.05 + b * 0.035, T.fourteen + 0.12 + b * 0.035, t);
        const hot = isZero ? z0 : sweep * (1 - 0.55 * sstep(T.zero - 0.1, T.zero + 0.2, t));
        const c = isZero ? mix([120, 170, 205], [255, 214, 130], hot) : mix([110, 160, 196], [196, 246, 255], hot);
        const end = isZero ? sstep(T.marks - 0.1, T.marks + 0.25, t) : 0;
        S(cl.el, "borderColor", rgb(c, 0.55 + 0.45 * hot));
        S(cl.el, "background", rgb(c, 0.05 + 0.17 * hot));
        S(cl.el, "borderRightWidth", (1.5 + 2.5 * end).toFixed(2) + "px");
        S(cl.el, "boxShadow", hot > 0.05 ? `0 0 ${(4 + 12 * hot).toFixed(1)}px ${rgb(c, 0.6 * hot)}` : "none");
        pos(cl.el, cl.x, cl.y, 0, ` scale(${lerp(0.6, 1, clamp(pop, 0, 1.25)).toFixed(3)})`);
        show(cl.el, a);
      });

      // ---- "belongs to no particular CPU": three CPUs far below, none of them claimed
      CHIPS.forEach((ch) => {
        const ta = T.particular - 0.35 + ch.i * 0.16;
        const a = 0.42 * sstep(ta, ta + 0.6, t) * (1 - sstep(T.cpu + 0.7, T.string5 - 0.3, t)) * (1 + 0.6 * bump(t, T.cpu - 0.05 + ch.i * 0.1, 0.1, 0.05, 0.4));
        pos(ch.el, ch.x + 40 * Math.sin(t * 0.3 + ch.i * 2), ch.y + 50 * Math.sin(t * 0.4 + ch.i), ch.d, ` rotate(${(6 * Math.sin(t * 0.2 + ch.i * 1.7) + (ch.i - 1) * 7).toFixed(2)}deg)`);
        show(ch.el, a * ctx.depthAlpha(ch.d, t, [430, 820], [-3600, -2400]));
      });
    });
  },
});
