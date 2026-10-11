// Sequence C — optimizer → assembly  ·  s06 s07
//
// Baton 2 (IR_O0) is rewritten in place by the optimizer: sheets of light (real LLVM passes) sweep through it;
// `instcombine` parks under the lines it works on — a lens finds no `%` in the string, printf is swapped for
// puts, tweezers pluck the `\0A` out (it floats up and away, leashed to puts) — until the block reads IR_O2.
// Then the IR drops a stratum: we dive after it, pass beneath it, and its lines rain down one by one into the
// assembly block (baton 3), threads tying each IR line to the instructions it became. A faint x86-64 die lies
// far below. rdi / eax appear as glass capsules beside the asm; everything else dissolves before the exit.
OT.sequence({
  id: "C",
  build(ctx) {
    const { t0, t1 } = ctx;
    const { clamp, lerp, inv, sstep: S } = OT;
    const EZ = OT.E;
    const A6 = (w, n = 1) => ctx.at("s06", w, n), E6 = (w, n = 1) => ctx.end("s06", w, n);
    const A7 = (w, n = 1) => ctx.at("s07", w, n), E7 = (w, n = 1) => ctx.end("s07", w, n);
    // rises to 1 over `rise` s before a, then decays exponentially at rate k
    const bump = (t, a, rise, k) => (t < a ? S(a - rise, a, t) : Math.exp(-(t - a) * k));
    // 1 inside [a, b]; soft edges of width fi / fo centred on a / b (so adjacent windows sum to 1)
    const win = (t, a, b, fi = 0.3, fo = 0.3) => S(a - fi / 2, a + fi / 2, t) * (1 - S(b - fo / 2, b + fo / 2, t));
    const f3 = (v) => v.toFixed(3);
    const px = (v) => v.toFixed(2) + "px";

    // ------------------------------------------------------------------ words
    const T = {
      then: A6("Then"), opt: A6("optimizer"), prog: A6("program"), p1: A6("pass", 1), p2: A6("pass", 2), fast: A6("faster"),
      same: A6("same"), behE: E6("behavior"),
      notices: A6("notices"), str: A6("string"), nothing: A6("nothing"), fmt: A6("format"), fmtE: E6("format"),
      pf: A6("print-F"), over: A6("overkill"), overE: E6("overkill"),
      swaps: A6("swaps"), simpler: A6("simpler"), puts1: A6("puts", 1), puts1E: E6("puts", 1),
      drops: A6("drops"), nl: A6("newline"), nlE: E6("newline"),
      since: A6("since"), puts2: A6("puts", 2), itself: A6("itself"), itselfE: E6("itself"),
      you: A6("You"), puts3: A6("puts", 3), compiler: A6("compiler"), decided: A6("decided"), decE: E6("decided"),
      back: A7("back"), trans: A7("translates"), all: A7("all"), thisW: A7("this"), into: A7("into"),
      asm: A7("assembly"), asmE: E7("assembly"), spec: A7("specific"), cpu: A7("CPU"), x86: A7("x86"), s64E: E7("64"),
      strs: A7("string's"), addr: A7("address"), goes: A7("goes"), reg: A7("register"), rdi: A7("R-D-I"), rdiE: E7("R-D-I"),
      func: A7("function"), exp: A7("expects"), first: A7("first"), arg: A7("argument"), argE: E7("argument"),
      call: A7("Call"), puts7: A7("puts"), puts7E: E7("puts"),
      put: A7("Put"), zero: A7("zero"), eax: A7("E-A-X"), eaxE: E7("E-A-X"),
      ret: A7("return"), val: A7("value"), valE: E7("value"),
    };
    const tDrop = T.decE + 0.06; // the IR lets go

    // ------------------------------------------------------------------ the real artefacts (STORYBOARD)
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
    const IR_O2 = [
      '@str = private constant [14 x i8] c"Hello, world!\\00"',
      "",
      "define i32 @main() {",
      "  %1 = tail call i32 @puts(ptr @str)",
      "  ret i32 0",
      "}",
      "",
      "declare i32 @puts(ptr)",
    ];
    const ASM = ["main:", "    push  rax", "    lea   rdi, [rip + .Lstr]", "    call  puts@PLT", "    xor   eax, eax", "    pop   rcx", "    ret", ".Lstr:", '    .asciz "Hello, world!"'];

    const D_ASM = 1500; // the assembly stratum = exit camera depth
    const D_HANG = D_ASM - 320; // where the IR hangs, just above our heads, while it rains down
    const D_DIE = D_ASM + 2200; // the faint CPU die, far below

    // ------------------------------------------------------------------ style
    const css = document.createElement("style");
    css.textContent = `
.sC-sheet{position:absolute;left:0;top:0;width:2600px;height:560px;transform-origin:50% 50%;
 background:linear-gradient(to bottom,rgba(190,230,255,0) 0%,rgba(190,230,255,.07) 22%,rgba(200,236,255,.3) 48%,rgba(235,248,255,.55) 50%,rgba(190,230,255,.22) 52%,rgba(190,230,255,.07) 68%,rgba(190,230,255,0) 82%);
 -webkit-mask-image:linear-gradient(to right,transparent 0%,#000 22%,#000 78%,transparent 100%);mask-image:linear-gradient(to right,transparent 0%,#000 22%,#000 78%,transparent 100%);}
.sC-sheet i{position:absolute;left:0;right:0;top:279px;height:2px;background:#f2fbff;box-shadow:0 0 10px 1px rgba(190,235,255,.95),0 0 26px rgba(150,215,255,.6);}
.sC-pass{position:absolute;left:0;top:0;font:500 21px/1 "JetBrains Mono",monospace;color:#d2f0ff;letter-spacing:.04em;white-space:pre;text-shadow:0 0 10px rgba(140,210,255,.75);}
.sC-lens{position:absolute;left:0;top:0;width:132px;height:132px;border-radius:50%;overflow:hidden;
 background:radial-gradient(circle at 38% 32%,rgba(46,92,158,.95),rgba(12,32,72,.97) 72%);
 box-shadow:inset 0 0 0 2.5px rgba(220,242,255,.92),inset 0 0 22px rgba(160,220,255,.35),0 0 34px rgba(140,210,255,.35),0 12px 40px rgba(0,0,0,.45);}
.sC-lens::after{content:"";position:absolute;left:14px;top:10px;width:70px;height:34px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.26),rgba(255,255,255,0));transform:rotate(-24deg);}
.sC-lensin{position:absolute;left:0;top:0;transform-origin:0 0;}
.sC-handle{position:absolute;left:0;top:0;width:80px;height:14px;margin-top:-7px;border-radius:7px;transform-origin:0 50%;background:linear-gradient(180deg,#e9f6ff,#8cc6e8 60%,#5b8fb3);box-shadow:0 0 14px rgba(140,210,255,.4);}
.sC-badge{position:absolute;left:0;top:0;font:700 28px/1 "JetBrains Mono",monospace;color:#8fe0ff;white-space:pre;text-shadow:0 0 10px rgba(110,210,255,.85);}
.sC-tw{position:absolute;left:0;top:0;width:0;height:0;}
.sC-tw i{position:absolute;left:-1.5px;top:0;width:3px;height:172px;transform-origin:50% 0;border-radius:2px;background:linear-gradient(to bottom,rgba(220,242,255,0),rgba(235,248,255,.95) 55%,#fff);box-shadow:0 0 10px rgba(170,225,255,.8);}
.sC-tw i{width:4px;left:-2px;}
.sC-tw i b{position:absolute;left:-3px;bottom:-4px;width:10px;height:10px;border-radius:50%;background:#f4fbff;box-shadow:0 0 12px 3px rgba(170,225,255,.85);}
.sC-nl{position:absolute;left:0;top:0;font:34px/54px "JetBrains Mono",monospace;white-space:pre;color:#ffc54d;}
.sC-svg{position:absolute;left:0;top:0;overflow:visible;}
.sC-copy{position:absolute;left:0;top:0;}
.sC-copy .w{position:absolute;left:0;top:0;transform-origin:0 0;}
.sC-plain{position:absolute;left:0;top:-28px;font:36px/56px "JetBrains Mono",monospace;white-space:pre;color:#e6eef8;}
.sC-rthr{position:absolute;left:0;top:-1px;width:1000px;height:2px;transform-origin:0 50%;background:linear-gradient(to right,rgba(143,224,255,.08),rgba(143,224,255,.75));}
.sC-cap{position:absolute;left:0;top:0;height:52px;border-radius:26px;font-family:"JetBrains Mono",monospace;transform-origin:0 50%;
 border:2px solid rgba(143,224,255,.8);background:linear-gradient(180deg,rgba(170,232,255,.2),rgba(110,200,255,.05) 58%,rgba(110,200,255,.12));
 box-shadow:0 0 26px rgba(110,210,255,.22),inset 0 2px 0 rgba(255,255,255,.22);}
.sC-cap .n{position:absolute;left:22px;top:0;line-height:48px;font-size:25px;font-weight:700;color:#8fe0ff;}
.sC-cap .v{position:absolute;right:22px;top:0;line-height:48px;font-size:25px;font-weight:700;white-space:pre;}
.sC-rk{position:absolute;left:0;top:0;width:78px;height:40px;border-radius:20px;border:1.5px solid rgba(143,224,255,.5);background:rgba(110,200,255,.05);font:21px/37px "JetBrains Mono",monospace;color:rgba(160,228,255,.85);text-align:center;}
.sC-ord{position:absolute;left:0;top:0;width:40px;text-align:center;font:19px/1 "JetBrains Mono",monospace;color:rgba(185,204,255,.75);}
.sC-dot{position:absolute;left:0;top:0;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:#ffe2a0;box-shadow:0 0 14px 4px rgba(255,190,70,.75);}
.sC-cdot{position:absolute;left:0;top:0;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#e8f8ff;box-shadow:0 0 14px 4px rgba(120,210,255,.8);}
.sC-zero{position:absolute;left:0;top:0;font:700 36px/56px "JetBrains Mono",monospace;color:#effaff;text-shadow:0 0 14px rgba(143,224,255,.95);}
.sC-x86{position:absolute;left:0;top:0;font:700 112px/1 "JetBrains Mono",monospace;color:#8fe0ff;letter-spacing:.02em;white-space:pre;}
.sC-chip{position:absolute;left:0;top:0;width:0;height:0;}
.sC-chipglow{position:absolute;left:-1150px;top:-1150px;width:2300px;height:2300px;border-radius:50%;background:radial-gradient(closest-side,rgba(110,200,255,.32),rgba(110,200,255,.08) 55%,rgba(110,200,255,0));}
`;
    ctx.root.appendChild(css);

    // ------------------------------------------------------------------ helpers
    const seg = (code, r, txt, n = 1) => {
      let k = 0;
      for (const sp of code.segs[r]) if (sp.textContent === txt && ++k === n) return sp;
      throw new Error(`C: segment "${txt}" not in row ${r}`);
    };
    // replace a span's text by child spans (renders identically)
    const split = (sp, parts) => {
      sp.textContent = "";
      return parts.map((p) => { const c = document.createElement("span"); c.textContent = p; sp.appendChild(c); return c; });
    };
    const glow = (rgb, g, r0 = 8, r1 = 18) =>
      g > 0.004 ? `0 0 ${(r0 + r1 * g).toFixed(1)}px rgba(${rgb},${f3(0.9 * g)}), 0 0 ${(r0 * 3 + r1 * 2 * g).toFixed(1)}px rgba(${rgb},${f3(0.45 * g)})` : "";
    const setTS = (el, v) => { if (el.style.textShadow !== v) el.style.textShadow = v; };
    const setTxt = (el, v) => { if (el.textContent !== v) el.textContent = v; };
    // inline span collapse (u: 0 present → 1 gone): fades, and the text after it closes up
    const collapse = (sp, n, cw, u, a = 1) => {
      sp.style.opacity = f3(a * (1 - S(0, 0.55, u)));
      sp.style.marginRight = u > 0 ? px(-n * cw * EZ.cubicInOut(u)) : "";
    };
    // a straight line in 3D from A to B (class sC-rthr: 1000px wide, origin at its left end)
    const line3d = (el, ax, ay, ad, bx, by, bd) => {
      const dx = bx - ax, dy = by - ay, dz = -(bd - ad);
      const h = Math.hypot(dx, dy), L = Math.hypot(h, dz);
      el.style.transform = `translate3d(${px(ax)}, ${px(ay)}, ${px(-ad)}) rotateZ(${Math.atan2(dy, dx).toFixed(4)}rad) rotateY(${Math.atan2(-dz, h).toFixed(4)}rad) scaleX(${(L / 1000).toFixed(4)})`;
    };
    const bez = (P, u) => { const v = 1 - u; return [0, 1].map((k) => v * v * v * P[0][k] + 3 * v * v * u * P[1][k] + 3 * v * u * u * P[2][k] + u * u * u * P[3][k]); };
    const svgEl = (tag, attrs, parent) => { const e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

    // ================================================================== the IR stratum (baton 2)
    const pI = ctx.plane(0);
    const ir = OT.C.code(pI, IR_O0, { lang: "llvm", theme: "night", size: 34, lh: 54 });
    const IRX = 960 - ir.maxWidth / 2, IRY = 640 - ir.height / 2, ICW = ir.cw, ILH = 54;
    ir.el.style.left = IRX + "px";
    ir.el.style.top = IRY + "px";
    const rowY = (i) => IRY + ILH * i + ILH / 2;
    const colX = (c) => IRX + ICW * c;

    // row 0: @.str = private constant [15 x i8] c"Hello, world!\0A\00"
    const name0 = seg(ir, 0, "@.str");
    const [, five, four] = split(seg(ir, 0, "[15 x i8]"), ["[1", "5", "4", " x i8]"]);
    four.style.marginLeft = -ICW + "px"; // overlays the 5, zero net advance (inline-block only while it rolls)
    const strA = seg(ir, 0, 'c"Hello, world!'), strB = seg(ir, 0, '"');
    const escSp = seg(ir, 0, "\\0A\\00"); // at the pluck its text becomes \00 and it closes up from the right
    const NL_COL = 50; // `\0A` occupies cols 50–52

    // row 3:   %1 = call i32 (ptr, ...) @printf(ptr @.str)
    const r3 = ir.rows[3], s3 = ir.segs[3];
    const iOpen3 = s3.findIndex((s) => s.textContent === "("), iPf3 = s3.findIndex((s) => s.textContent === "@printf");
    const pf3 = s3[iPf3];
    pf3.style.display = "inline-block";
    const va3 = document.createElement("span"); // "(ptr, ...) "
    r3.insertBefore(va3, s3[iOpen3]);
    let VA3N = 0;
    for (let k = iOpen3; k < iPf3; k++) { VA3N += s3[k].textContent.length; va3.appendChild(s3[k]); }
    const callSp = seg(ir, 3, "call");
    const tailSp = document.createElement("span");
    tailSp.className = "k";
    tailSp.textContent = "tail ";
    r3.insertBefore(tailSp, callSp);
    const name3 = seg(ir, 3, "@.str");
    const rest3 = Array.from(r3.children).filter((c) => c !== pf3 && c !== tailSp && c !== va3);

    // row 7: declare i32 @printf(ptr, ...)
    const r7 = ir.rows[7], s7 = ir.segs[7];
    const pf7 = seg(ir, 7, "@printf");
    pf7.style.display = "inline-block";
    const ic7 = s7.findIndex((s) => s.textContent === ",");
    const comma7 = s7[ic7], space7 = s7[ic7 + 1];
    const [dots7] = split(s7[ic7 + 2], ["...", ")"]);
    const rest7 = Array.from(r7.children).filter((c) => c !== pf7 && c !== comma7 && c !== space7);
    const ret0 = seg(ir, 4, "0");

    // what you wrote, remembered from the surface ("You never wrote puts.")
    const memory = OT.C.code(pI, ['printf("Hello, world!\\n");'], { lang: "c", theme: "night", size: 34, lh: 54 });
    memory.el.style.left = 960 - memory.maxWidth / 2 + "px";
    memory.el.style.top = IRY - 150 + "px";

    // ------------------------------------------------------------------ passes: sheets of light
    const SHEETS = [
      { name: "sroa", a: T.opt - 0.3, dur: 1.6 },
      { name: "early-cse", a: T.prog - 0.25, dur: 1.2 },
      { name: "simplifycfg", a: T.p1 - 0.08, dur: 0.75 },
      { name: "gvn", a: T.p2 - 0.06, dur: 0.5 },
      { name: "sccp", a: T.fast + 0.02, dur: 0.36 },
      { name: "dse", a: T.fast + 0.3, dur: 0.3 },
      { name: "instcombine", w: true },
    ];
    const Y_TOP = IRY - 170, Y_BOT = IRY + ir.height + 170;
    const yUnder = (i) => IRY + ILH * (i + 1) + 3;
    const W_KEYS = [
      [T.notices - 0.3, Y_TOP],
      [T.str - 0.12, yUnder(0), "cubicOut"],
      [T.fmtE, yUnder(0)],
      [T.pf - 0.04, yUnder(3), "cubicInOut"],
      [T.puts1 + 0.25, yUnder(3)],
      [T.drops - 0.32, yUnder(0), "cubicInOut"],
      [T.itself - 0.25, yUnder(0)],
      [T.itselfE + 0.3, Y_BOT, "cubicIn"],
    ];
    SHEETS.forEach((sh) => {
      sh.el = ctx.el("div", "sC-sheet");
      ctx.el("i", "", sh.el);
      sh.lab = ctx.el("div", "sC-pass", pI);
      sh.lab.textContent = sh.name;
    });
    const sheetState = (sh, t) => {
      if (sh.w) {
        const a = S(T.notices - 0.3, T.notices + 0.05, t) * (1 - S(T.itselfE + 0.05, T.itselfE + 0.3, t));
        return { y: OT.track(W_KEYS, t), a, heatK: 0.55 };
      }
      const u = inv(sh.a, sh.a + sh.dur, t);
      return { y: lerp(Y_TOP, Y_BOT, EZ.sineInOut(u)), a: t < sh.a || t > sh.a + sh.dur ? 0 : S(0, 0.14, u) * (1 - S(0.84, 1, u)), heatK: 1 };
    };

    // ------------------------------------------------------------------ the lens (no '%' anywhere)
    const LR = 66, LK = 1.6;
    const lens = ctx.el("div", "sC-lens", pI);
    const lensIn = ctx.el("div", "sC-lensin", lens);
    OT.C.code(lensIn, [IR_O0[0]], { lang: "llvm", theme: "night", size: 34, lh: 54 });
    const handle = ctx.el("div", "sC-handle", pI);
    const badge = ctx.el("div", "sC-badge", pI);
    const LX0 = colX(35) + 10, LX1 = colX(57) - 10;

    // ------------------------------------------------------------------ tweezers, the plucked newline, its leash
    const tw = ctx.el("div", "sC-tw", pI);
    const bladeL = ctx.el("i", "", tw), bladeR = ctx.el("i", "", tw);
    ctx.el("b", "", bladeL);
    ctx.el("b", "", bladeR);
    const nlG = ctx.el("div", "sC-nl", pI);
    nlG.textContent = "\\0A";
    const NLX = colX(NL_COL) + 1.5 * ICW; // centre of the glyph in the row
    const svgI = svgEl("svg", { class: "sC-svg", width: 1920, height: 1080 }, pI);
    const leash = svgEl("path", { fill: "none", stroke: "#ffc54d", "stroke-width": 2.2, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "1 1" }, svgI);
    leash.style.filter = "drop-shadow(0 0 5px rgba(255,190,70,.8))";
    const nlPos = (t) => {
      // in the row → lifted by the tweezers → released, floats up and out of frame
      const lift = EZ.cubicInOut(inv(T.drops + 0.06, T.nl + 0.1, t));
      let x = NLX + 10 * lift, y = rowY(0) - 92 * lift, rot = 0, sc = 1 + 0.12 * lift;
      const tr = T.nl + 0.1;
      if (t > tr) {
        const d = t - tr;
        x += 22 * Math.sin(d * 1.6) + 14 * d;
        y -= 52 * d + 40 * d * d;
        rot = 7 * Math.sin(d * 1.25);
        sc = lerp(1.12, 0.85, S(0, 2.2, d));
      }
      return { x, y, rot, sc };
    };

    // ================================================================== the assembly stratum (baton 3)
    const pA = ctx.plane(D_ASM);
    const asm = OT.C.code(pA, ASM, { lang: "asm", theme: "night", size: 36, lh: 56 });
    const ASMX = 960 - asm.maxWidth / 2, ASMY = 640 - asm.height / 2, ACW = asm.cw, ALH = 56;
    asm.el.style.left = ASMX + "px";
    asm.el.style.top = ASMY + "px";
    const aRowY = (j) => ASMY + ALH * j + ALH / 2;
    const aCol = (c) => ASMX + ACW * c;
    const aRdi = seg(asm, 2, "rdi"), aLstr = seg(asm, 2, ".Lstr"), aPlt = seg(asm, 3, "puts@PLT"), aCall = seg(asm, 3, "call");
    const aEax1 = seg(asm, 4, "eax", 1), aEax2 = seg(asm, 4, "eax", 2), aXor = seg(asm, 4, "xor"), aRet = seg(asm, 6, "ret");
    const aLbl = seg(asm, 7, ".Lstr:"), aStr = seg(asm, 8, '"Hello, world!"'), aLea = seg(asm, 2, "lea");
    const aGlowSpans = [aRdi, aLstr, aPlt, aCall, aEax1, aEax2, aXor, aRet, aLbl, aStr, aLea];

    // ------------------------------------------------------------------ rain: IR lines → asm lines
    const lead = (s) => s.length - s.trimStart().length;
    const RAIN = [
      { j: 0, i: 2, td: T.back - 0.02, arc: -50 },
      { j: 1, i: 2, td: T.back + 0.1, arc: 50 },
      { j: 2, i: 3, td: T.trans - 0.02, arc: -40 },
      { j: 3, i: 3, td: T.trans + 0.1, arc: 40 },
      { j: 4, i: 4, td: T.all - 0.02, arc: -40 },
      { j: 5, i: 4, td: T.all + 0.08, arc: 10 },
      { j: 6, i: 4, td: T.all + 0.18, arc: 50 },
      { j: 7, i: 0, td: T.into - 0.1, arc: 170 },
      { j: 8, i: 0, td: T.into + 0.02, arc: 240 },
    ];
    const DEPART = {}; // IR row → first departure
    RAIN.forEach((R) => {
      DEPART[R.i] = Math.min(DEPART[R.i] ?? 1e9, R.td);
      R.el = ctx.el("div", "sC-copy ot-free");
      R.wA = ctx.el("div", "w", R.el);
      const clone = OT.C.code(R.wA, [IR_O2[R.i]], { lang: "llvm", theme: "night", size: 34, lh: 54 });
      clone.el.style.top = -ILH / 2 + "px";
      R.wB = ctx.el("div", "w", R.el);
      R.plain = ctx.el("div", "sC-plain", R.wB);
      R.plain.style.color = R.j === 7 || R.j === 0 ? "#b9ccff" : "#e6eef8";
      R.thr = ctx.el("div", "sC-rthr ot-free");
      R.from = IR_O2[R.i];
      R.to = ASM[R.j];
      if (R.j === 7) R.from = "@str"; // the global's name becomes the label
      if (R.j === 8) {
        // the string itself never scrambles: only its IR wrapper turns into `.asciz`
        R.parts = [['@str = private constant [14 x i8] c"', '    .asciz "', ""], ["Hello, world!", "Hello, world!", "#ffc54d"], ['\\00"', '"', "#ffc54d"]].map(([from, to, col]) => {
          const sp = ctx.el("span", "", R.plain);
          if (col) { sp.style.color = col; sp.style.textShadow = "0 0 16px rgba(255,190,70,.55)"; }
          return { sp, from, to };
        });
      }
      R.li = lead(R.from);
      R.lj = lead(R.to);
    });
    const DISSOLVE = { 5: T.thisW - 0.05, 7: T.thisW + 0.05 };

    // ------------------------------------------------------------------ registers
    const CAPX = 1350, CAPW = 232;
    const mkCap = (name, y) => {
      const c = ctx.el("div", "sC-cap", pA);
      c.style.width = CAPW + "px";
      const n = ctx.el("span", "n", c); n.textContent = name;
      const v = ctx.el("span", "v", c);
      return { el: c, n, v, y };
    };
    const capRdi = mkCap("rdi", aRowY(2));
    capRdi.v.style.color = "#ffc54d";
    capRdi.v.style.textShadow = "0 0 12px rgba(255,190,70,.7)";
    const capEax = mkCap("eax", aRowY(4));
    capEax.v.style.color = "#effaff";
    capEax.v.style.textShadow = "0 0 12px rgba(143,224,255,.9)";
    const RACK = ["rsi", "rdx", "rcx", "r8", "r9"].map((name, k) => {
      const e = ctx.el("div", "sC-rk", pA);
      e.textContent = name;
      return { el: e, x: CAPX + CAPW + 18 + k * 88, k };
    });
    const ORD = [0, 1, 2, 3, 4, 5].map((k) => {
      const e = ctx.el("div", "sC-ord", pA);
      e.textContent = String(k + 1);
      return { el: e, x: k === 0 ? CAPX + CAPW / 2 : RACK[k - 1].x + 39 };
    });
    const svgA = svgEl("svg", { class: "sC-svg", width: 1920, height: 1080 }, pA);
    const defs = svgEl("defs", {}, svgA);
    const grad = svgEl("linearGradient", { id: "sC-callg", gradientUnits: "userSpaceOnUse", x1: 1060, y1: 0, x2: 1900, y2: 0 }, defs);
    svgEl("stop", { offset: 0, "stop-color": "#8fe0ff", "stop-opacity": 1 }, grad);
    svgEl("stop", { offset: 1, "stop-color": "#8fe0ff", "stop-opacity": 0 }, grad);
    const PTR = [[aCol(6) + 10, aRowY(7)], [1180, aRowY(7) + 4], [1300, 700], [CAPX + 4, aRowY(2) + 14]];
    const ptrPath = svgEl("path", { d: `M${PTR[0]} C${PTR[1]} ${PTR[2]} ${PTR[3]}`, fill: "none", stroke: "#ffc54d", "stroke-width": 2.2, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "1 1" }, svgA);
    ptrPath.style.filter = "drop-shadow(0 0 5px rgba(255,190,70,.75))";
    const CALLP = [[aCol(18) + 10, aRowY(3)], [1300, aRowY(3)], [1520, aRowY(3) + 30], [1920, aRowY(3) + 70]];
    const callPath = svgEl("path", { d: `M${CALLP[0]} C${CALLP[1]} ${CALLP[2]} ${CALLP[3]}`, fill: "none", stroke: "url(#sC-callg)", "stroke-width": 2.2, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "1 1" }, svgA);
    const mote = ctx.el("div", "sC-dot", pA);
    const cdot = ctx.el("div", "sC-cdot", pA);
    const zero = ctx.el("div", "sC-zero", pA);
    zero.textContent = "0";

    // ------------------------------------------------------------------ the chip, far below (revealed left of the code)
    const pD = ctx.plane(D_DIE);
    const DW = 1200, CHX = -960, CHY = 500;
    const chip = ctx.el("div", "sC-chip", pD);
    const chipGlow = ctx.el("div", "sC-chipglow", chip);
    const die = svgEl("svg", { class: "sC-svg", width: DW, height: DW, viewBox: "0 0 1400 1400" }, chip);
    die.style.left = -DW / 2 + "px";
    die.style.top = -DW / 2 + "px";
    {
      const st = { fill: "none", stroke: "#8fe0ff" };
      svgEl("rect", { ...st, x: 34, y: 34, width: 1332, height: 1332, "stroke-width": 40, "stroke-dasharray": "14 30", opacity: 0.6 }, die);
      svgEl("rect", { ...st, x: 64, y: 64, width: 1272, height: 1272, rx: 30, "stroke-width": 7, fill: "rgba(143,224,255,0.05)" }, die);
      svgEl("rect", { ...st, x: 330, y: 230, width: 740, height: 760, rx: 10, "stroke-width": 6, fill: "rgba(143,224,255,0.07)" }, die);
      for (let k = 0; k < 4; k++) {
        const x = 360 + k * 175;
        svgEl("rect", { ...st, x, y: 260, width: 160, height: 400, rx: 6, "stroke-width": 4 }, die);
        for (let g = 1; g < 5; g++) svgEl("line", { stroke: "#8fe0ff", x1: x + 14, y1: 260 + g * 80, x2: x + 146, y2: 260 + g * 80, "stroke-width": 2, opacity: 0.5 }, die);
      }
      svgEl("rect", { ...st, x: 360, y: 690, width: 685, height: 130, rx: 6, "stroke-width": 4 }, die);
      for (let g = 1; g < 9; g++) svgEl("line", { stroke: "#8fe0ff", x1: 360 + g * 76, y1: 696, x2: 360 + g * 76, y2: 814, "stroke-width": 2, opacity: 0.4 }, die);
      svgEl("rect", { ...st, x: 360, y: 840, width: 685, height: 120, rx: 6, "stroke-width": 4 }, die);
    }
    const x86 = ctx.el("div", "sC-x86", chip);
    x86.textContent = "x86-64";

    // ================================================================== camera, ground, light
    // The camera RESTS (two identical keys: dead still, so the code never shimmers) and TRAVELS with intent between
    // rests. A slow creep re-rasterises the text every frame (±0.5–1.6 px glyph jitter), so there are none here; the
    // life during a rest comes from the content (sheets of light, lens, tweezers, rain, capsules, threads).
    // Pans keep z constant so they never read as a creep.
    const P0 = { x: 960, y: 640, z: 0 }; //                    baton 2 (entry)
    const P_PASS = { x: 960, y: 655, z: 120 }; //               the IR while the passes sweep through it
    const P_STR = { x: 1265, y: 545, z: 335 }; //               the string under the lens
    const P_PF = { x: 965, y: 688, z: 180 }; //                 row 3: printf → puts
    const P_NL = { x: 1140, y: 675, z: 258 }; //                the newline plucked and floating away
    const P_YOU = { x: 960, y: 665, z: 175 }; //                "You never wrote puts."
    const P_ASM = { x: 960, y: 640, z: D_ASM }; //              baton 3 (exit)
    const P_CPU = { x: 868, y: 631, z: D_ASM + 52 }; //         the die revealed left of the code
    const P_RDI = { x: 1120, y: 685, z: D_ASM + 115 }; //       asm + the rdi capsule
    const P_RACK = { x: 1235, y: 680, z: D_ASM + 115 }; //      … + the rack of argument registers
    const P_EAX = { x: 1125, y: 682, z: D_ASM + 115 }; //       call / eax / return value
    const K = (t, p, ease) => [t, ease ? { ...p, ease } : { ...p }]; // ease: the move arriving at this key
    ctx.cam([
      K(t0, { ...P0, roll: 0 }),
      K(T.p1 - 0.1, P0),
      K(T.fast + 0.25, P_PASS, "quintInOut"), //                surge in with the passes: "pass after pass — faster"
      K(T.notices - 0.25, P_PASS),
      K(T.str + 0.05, P_STR, "quintInOut"), //                  it notices: push to the string
      K(T.fmtE - 0.05, P_STR),
      K(T.pf + 0.15, P_PF), //                                  back out to printf
      K(T.puts1E - 0.05, P_PF),
      K(T.nl, P_NL), //                                         over to the newline
      K(T.itself + 0.3, P_NL),
      K(T.you - 0.1, P_YOU),
      K(tDrop + 0.25, { ...P_YOU, roll: 0 }),
      [tDrop + 1.0, { x: 960, y: 652, z: 760, roll: -2.2 }], // the dive
      K(T.back - 0.26, { ...P_ASM, roll: 0 }),
      K(T.asmE + 0.1, P_ASM),
      K(T.cpu + 0.1, P_CPU, "smoother"), //                     drift left to reveal the die
      K(T.s64E, P_CPU),
      K(T.strs + 0.25, P_RDI),
      K(T.func - 0.25, P_RDI),
      K(T.exp + 0.45, P_RACK), //                               pan with the rack as it springs out
      K(T.argE + 0.2, P_RACK),
      K(T.puts7 + 0.1, P_EAX),
      K(T.ret + 0.25, P_EAX),
      K(t1 - 0.12, P_ASM, "smoother"), //                       settle back onto baton 3
      K(t1, { ...P_ASM, roll: 0 }),
    ]);
    ctx.exit({ x: 960, y: 640, z: D_ASM });
    ctx.ground([
      [t0, "#0f2a4f"],
      [T.you - 0.5, "#0d2449"],
      [tDrop + 0.2, "#0d2348"],
      [T.back - 0.2, "#14123a"],
      [T.ret, "#100e2d"],
      [t1 - 0.3, "#0e0c26"],
      [t1, "#0e0c26"],
    ]);
    // the motes are already bits when B hands over; only declare them when B is absent (a repeated style key
    // makes the engine fade the motes out and back in at the key)
    if (!OT._defs.B) ctx.motes([[t0, "bits"]]);
    ctx.flash(T.back - 0.3, { peak: 0.08, attack: 0.12, decay: 5, color: "#b9ccff" });
    ctx.shake(T.back - 0.3, { amp: 4, decay: 6 });

    // IR plane depth: hangs still, then falls (it leads; the camera dives after it and passes it)
    const dIRf = OT.monotone([[tDrop - 1, 0], [tDrop, 0], [tDrop + 0.6, 240], [tDrop + 1.05, 880], [tDrop + 1.65, D_HANG], [tDrop + 3, D_HANG]]);
    // …and once it starts raining down, what is left of it rises past us, overhead, out of the way
    const dIR = (t) => (t < tDrop ? 0 : dIRf(t) - 240 * S(T.back - 0.15, T.asmE + 0.4, t));

    // ================================================================== render
    ctx.render((t) => {
      const on = t >= t0 && t < t1;
      ctx.root.style.opacity = on ? "" : "0";
      if (!on) return;
      const dI = dIR(t);
      pI.style.transform = `translate3d(0px, 0px, ${px(-dI)})`;
      const irOn = t < T.asmE + 1.0;
      ctx.show(pI, irOn ? ctx.depthAlpha(dI, t, [440, 760]) : 0);

      // ---------------------------------------------------------------- sheets (passes)
      const heat = new Array(8).fill(0);
      SHEETS.forEach((sh) => {
        const { y, a, heatK } = sheetState(sh, t);
        const vis = irOn && a > 0.002;
        ctx.show(sh.el, vis ? a : 0);
        ctx.show(sh.lab, vis ? a : 0);
        if (!vis) return;
        sh.el.style.transform = `translate3d(${960 - 1300}px, ${px(y - 280)}, ${px(-dI)}) rotateX(58deg)`;
        sh.lab.style.transform = `translate(${px(colX(57) + 26)}, ${px(y - 30)})`;
        for (let i = 0; i < 8; i++) heat[i] = Math.max(heat[i], heatK * a * Math.exp(-(((y - 6 - rowY(i)) / 40) ** 2)));
      });

      // ---------------------------------------------------------------- IR rows
      const still = win(t, T.you - 0.05, T.decided + 0.15, 0.5, 0.6); // "You never wrote puts."
      const dimStill = lerp(1, 0.38, still);
      for (let i = 0; i < 8; i++) {
        const row = ir.rows[i];
        let a = 1, dy = -3 * heat[i];
        if (DEPART[i] != null && t >= DEPART[i]) a = 0.1 * (1 - S(T.asm - 0.2, T.asmE + 0.2, t)); // ghost left behind
        if (DISSOLVE[i] != null) { const u = inv(DISSOLVE[i], DISSOLVE[i] + 0.55, t); a *= 1 - EZ.quadOut(u); dy -= 34 * EZ.cubicOut(u); }
        if (i !== 3 && i !== 7) a *= dimStill;
        row.style.opacity = a >= 0.999 ? "" : f3(a);
        row.style.transform = Math.abs(dy) > 0.01 ? `translate(0px, ${px(dy)})` : "";
        setTS(row, glow("170,225,255", heat[i], 6, 14));
      }

      // the memory of the source line
      {
        const ma = 0.42 * S(T.you - 0.15, T.you + 0.45, t) * (1 - S(T.decided - 0.05, T.decE + 0.05, t));
        ctx.show(memory.el, ma);
        if (ma > 0.002) memory.el.style.transform = `translateY(${px(-24 * (1 - EZ.cubicOut(inv(T.you - 0.15, T.puts3 + 0.4, t))))})`;
      }

      // the string: "same behavior" and "our string"
      const gStr = Math.max(0.8 * win(t, T.same - 0.1, T.behE + 0.4, 0.3, 0.6), win(t, T.str - 0.1, T.fmtE, 0.25, 0.5));
      [strA, strB, escSp].forEach((sp) => setTS(sp, gStr > 0.004 ? `0 0 ${(16 + 18 * gStr).toFixed(1)}px rgba(255,190,70,${f3(0.55 + 0.4 * gStr)})` : ""));
      setTS(ret0, glow("200,184,255", 0.8 * win(t, T.same - 0.1, T.behE + 0.4, 0.3, 0.6)));

      // printf: flares on its name, dims on "overkill", is rewritten into puts
      const uVa = EZ.cubicInOut(inv(T.swaps + 0.15, T.simpler + 0.05, t)); // the varargs fold away ("simpler")
      const uPf = inv(T.simpler - 0.1, T.puts1 - 0.03, t), uPf7 = inv(T.simpler - 0.02, T.puts1 + 0.06, t);
      const uTail = inv(T.puts1 + 0.12, T.puts1 + 0.5, t);
      const pfFlare = bump(t, T.pf, 0.16, 2.2) * (1 - S(T.over - 0.1, T.over + 0.25, t));
      const pfDim = S(T.over - 0.05, T.over + 0.45, t);
      const putsG = Math.max(bump(t, T.puts1, 0.08, 1.8), 0.7 * win(t, T.puts2 - 0.1, T.itselfE, 0.25, 0.6), still);
      [[pf3, uPf], [pf7, uPf7]].forEach(([sp, u]) => {
        setTxt(sp, OT.scramble("@printf", "@puts", u, t, 5));
        sp.style.opacity = f3(lerp(1, 0.36, pfDim) + (1 - lerp(1, 0.36, pfDim)) * S(0.2, 0.9, u));
        const g = u > 0 ? putsG : pfFlare;
        setTS(sp, g > 0.004 ? `0 0 ${(8 + 18 * g).toFixed(1)}px rgba(255,255,255,${f3(0.95 * g)}), 0 0 ${(26 + 34 * g).toFixed(1)}px rgba(150,210,255,${f3(0.7 * g)})` : "");
        const sw = u > 0 ? 0.1 * bump(t, T.puts1, 0.1, 3) : 0.12 * pfFlare;
        sp.style.transform = sw > 0.001 ? `scale(${f3(1 + sw)})` : "";
      });
      const vaDim = lerp(1, 0.4, pfDim);
      collapse(va3, VA3N, ICW, uVa, vaDim * dimStill);
      collapse(comma7, 1, ICW, uVa, vaDim * dimStill);
      collapse(space7, 1, ICW, uVa, vaDim * dimStill);
      collapse(dots7, 3, ICW, uVa, vaDim);
      tailSp.style.opacity = f3(S(0.45, 1, uTail) * dimStill);
      tailSp.style.marginRight = uTail < 1 ? px(-5 * ICW * (1 - EZ.cubicInOut(uTail))) : "";
      rest3.forEach((c) => { c.style.opacity = still > 0.001 ? f3(dimStill) : ""; });
      rest7.forEach((c) => { c.style.opacity = still > 0.001 ? f3(dimStill) : ""; });

      // the newline: plucked, the bytes close up, [15 x i8] ticks to [14 x i8], @.str becomes @str
      const plucked = t >= T.drops;
      const uGap = inv(T.drops + 0.14, T.nl + 0.12, t);
      setTxt(escSp, plucked ? "\\00" : "\\0A\\00");
      escSp.style.marginLeft = plucked ? px(3 * ICW * (1 - EZ.cubicInOut(uGap))) : "";
      const uRoll = EZ.cubicOut(inv(T.nl + 0.08, T.nl + 0.34, t));
      five.style.display = uRoll > 0 ? "inline-block" : "";
      four.style.display = uRoll > 0 ? "inline-block" : "none"; // absent from layout until it rolls in
      five.style.transform = uRoll > 0 ? `translateY(${px(-22 * uRoll)})` : "";
      five.style.opacity = uRoll > 0 ? f3(1 - uRoll) : "";
      four.style.transform = `translateY(${px(22 * (1 - uRoll))})`;
      four.style.opacity = f3(uRoll);
      setTS(four, glow("143,224,255", bump(t, T.nl + 0.3, 0.2, 2.5) * (uRoll > 0 ? 1 : 0)));
      const uDot = inv(T.nl + 0.3, T.nl + 0.6, t);
      setTxt(name0, OT.scramble("@.str", "@str", uDot, t, 7));
      setTxt(name3, OT.scramble("@.str", "@str", uDot, t, 8));

      // ---------------------------------------------------------------- the lens
      {
        const a = S(T.str - 0.25, T.str - 0.02, t) * (1 - S(T.fmtE + 0.05, T.fmtE + 0.3, t));
        const vis = a > 0.002;
        ctx.show(lens, a); ctx.show(handle, a); ctx.show(badge, a);
        if (vis) {
          const u = EZ.sineInOut(inv(T.str, T.fmt - 0.05, t));
          const lx = lerp(LX0, LX1, u), ly = rowY(0) + 2;
          const pop = clamp(OT.spring(t, T.str - 0.25, 16, 0.5), 0, 1.3);
          lens.style.transform = `translate(${px(lx - LR)}, ${px(ly - LR)}) scale(${f3(lerp(0.5, 1, pop))})`;
          lensIn.style.transform = `translate(${px(LR - LK * (lx - IRX))}, ${px(LR - LK * (ly - IRY))}) scale(${LK})`;
          handle.style.transform = `translate(${px(lx + LR * 0.68)}, ${px(ly + LR * 0.68)}) rotate(45deg) scale(${f3(pop)})`;
          const found = t >= T.fmt - 0.05;
          setTxt(badge, found ? "% × 0" : "%");
          badge.style.transform = `translate(${px(lx + LR * 0.62)}, ${px(ly - LR - 30)}) scale(${f3(found ? 1 + 0.25 * bump(t, T.fmt - 0.05, 0.01, 6) : 1)})`;
        }
      }

      // ---------------------------------------------------------------- tweezers + the plucked \0A + leash
      {
        const ta = S(T.drops - 0.5, T.drops - 0.3, t) * (1 - S(T.nl + 0.25, T.nl + 0.6, t));
        ctx.show(tw, ta);
        if (ta > 0.002) {
          const down = EZ.cubicOut(inv(T.drops - 0.5, T.drops - 0.06, t));
          const close = inv(T.drops - 0.08, T.drops + 0.03, t), open2 = inv(T.nl + 0.1, T.nl + 0.24, t);
          const ang = lerp(lerp(16, 9.4, close), 18, open2);
          const p = nlPos(Math.min(t, T.nl + 0.1));
          const away = EZ.cubicIn(inv(T.nl + 0.2, T.nl + 0.6, t));
          const hy = p.y - 172 * Math.cos((ang * Math.PI) / 180) - 240 * (1 - down) - 160 * away;
          tw.style.transform = `translate(${px(p.x)}, ${px(hy)})`;
          bladeL.style.transform = `rotate(${f3(ang)}deg)`;
          bladeR.style.transform = `rotate(${f3(-ang)}deg)`;
        }
        const na = plucked ? 1 - S(T.you - 0.6, T.you - 0.2, t) : 0;
        ctx.show(nlG, na);
        const p = nlPos(t);
        if (na > 0.002) {
          const hot = bump(t, T.nl, 0.3, 1.2);
          nlG.style.transform = `translate(${px(p.x - 1.5 * ICW)}, ${px(p.y - ILH / 2)}) rotate(${f3(p.rot)}deg) scale(${f3(p.sc)})`;
          nlG.style.textShadow = `0 0 ${(12 + 14 * hot).toFixed(1)}px rgba(255,195,80,${f3(0.7 + 0.3 * hot)}), 0 0 ${(30 + 20 * hot).toFixed(1)}px rgba(255,180,60,${f3(0.35 + 0.3 * hot)})`;
        }
        // puts holds on to it: a gold leash from @puts to the drifting newline
        const g = EZ.cubicOut(inv(T.since, T.puts2 + 0.25, t));
        const la = g * (1 - S(T.itselfE + 0.2, T.you - 0.15, t));
        ctx.show(leash, la);
        if (la > 0.002) {
          const ax = colX(23.5), ay = IRY + 3 * ILH + 12;
          const bx = p.x, by = p.y + 16;
          const cy = IRY + 3 * ILH; // run along the gap between rows 2 and 3, then rise past the end of row 0
          leash.setAttribute("d", `M${ax.toFixed(1)} ${ay.toFixed(1)} C${ax.toFixed(1)} ${(cy - 4).toFixed(1)} ${(ax + 120).toFixed(1)} ${cy.toFixed(1)} ${(ax + 360).toFixed(1)} ${cy.toFixed(1)} C${(colX(57) + 40).toFixed(1)} ${cy.toFixed(1)} ${(colX(57) + 90).toFixed(1)} ${(rowY(0) + 10).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`);
          leash.setAttribute("stroke-dashoffset", f3(1 - g));
        }
      }

      // ---------------------------------------------------------------- rain into assembly
      const landA = new Array(9).fill(0);
      RAIN.forEach((R) => {
        const u = inv(R.td, R.td + 0.64, t), ue = EZ.cubicInOut(u);
        const p = clamp(OT.spring(t, R.td, 7.2, 0.6), 0, 1.25);
        const land = S(R.td + 0.56, R.td + 0.84, t);
        landA[R.j] = land;
        const flying = t >= R.td && land < 0.999;
        ctx.show(R.el, flying ? 1 : 0);
        const xs = IRX, ys = rowY(R.i), xe = ASMX, ye = aRowY(R.j);
        const x = lerp(xs, xe, ue) + R.arc * Math.sin(Math.PI * ue), y = lerp(ys, ye, ue);
        const d = lerp(dI, D_ASM, p);
        if (flying) {
          R.el.style.transform = `translate3d(${px(x)}, ${px(y)}, ${px(-d)})`;
          R.wA.style.transform = `scale(${f3(lerp(1, 36 / 34, ue))})`;
          R.wA.style.opacity = f3(1 - S(R.td, R.td + 0.2, t));
          R.wB.style.transform = `scale(${f3(lerp(34 / 36, 1, ue))})`;
          R.wB.style.opacity = f3(S(R.td + 0.02, R.td + 0.18, t) * (1 - land));
          const us = inv(R.td + 0.06, R.td + 0.38, t);
          if (R.parts) R.parts.forEach((q, k) => setTxt(q.sp, q.from === q.to ? q.to : OT.scramble(q.from, q.to, us, t, 31 + k)));
          else setTxt(R.plain, OT.scramble(R.from, R.to, us, t, 11 + R.j));
        }
        // a thread from the middle of the IR line to the middle of what it became; it lingers, then lets go
        const ta = 0.38 * S(R.td, R.td + 0.1, t) * (1 - S(R.td + 0.5, R.td + 1.1, t));
        ctx.show(R.thr, ta);
        if (ta > 0.002) line3d(R.thr, xs + ((R.li + R.from.length) / 2) * ICW, ys, dI, x + ((R.lj + R.to.length) / 2) * ACW * lerp(34 / 36, 1, ue), y, d);
      });

      // ---------------------------------------------------------------- the assembly block
      const endIn = S(t1 - 0.9, t1 - 0.3, t); // everything back to the plain baton
      const FOC = [
        { a: T.strs - 0.1, b: T.func, rows: [2, 7, 8] },
        { a: T.func, b: T.call - 0.1, rows: [2] },
        { a: T.call - 0.1, b: T.put - 0.1, rows: [3] },
        { a: T.put - 0.1, b: T.ret - 0.1, rows: [4] },
        { a: T.ret - 0.1, b: T.valE + 0.15, rows: [4, 6] },
      ];
      let any = 0;
      const foc = new Array(9).fill(0);
      FOC.forEach((w) => { const v = win(t, w.a, w.b, 0.35, 0.35); any += v; w.rows.forEach((j) => (foc[j] += v)); });
      any = clamp(any);
      for (let j = 0; j < 9; j++) {
        const a = landA[j] * lerp(1, 0.42, any * (1 - clamp(foc[j])));
        const wave = bump(t, T.asm + 0.05 * j, 0.12, 3.5) * (1 - endIn);
        asm.rows[j].style.opacity = a >= 0.999 ? "" : f3(a);
        setTS(asm.rows[j], glow("143,224,255", 0.8 * wave, 6, 14));
      }
      // token highlights
      const gStr7 = win(t, T.strs - 0.05, T.rdiE + 0.2, 0.3, 0.6);
      const gLstr = win(t, T.addr - 0.05, T.rdiE + 0.2, 0.3, 0.6);
      const gRdi = Math.max(win(t, T.rdi - 0.1, T.rdiE + 0.2, 0.25, 0.6), 0.8 * win(t, T.first - 0.1, T.argE + 0.1, 0.25, 0.6));
      const gCall = win(t, T.call - 0.05, T.puts7E + 0.3, 0.2, 0.6);
      const gEax = win(t, T.zero - 0.12, T.eaxE + 0.2, 0.2, 0.6);
      const gRet = win(t, T.ret - 0.08, T.valE + 0.1, 0.25, 0.6);
      setTS(aLbl, glow("255,190,70", gStr7));
      setTS(aStr, gStr7 > 0.004 ? `0 0 ${(16 + 18 * gStr7).toFixed(1)}px rgba(255,190,70,${f3(0.55 + 0.4 * gStr7)})` : "");
      setTS(aLstr, glow("255,190,70", gLstr));
      setTS(aLea, glow("255,181,154", 0.7 * win(t, T.goes - 0.1, T.rdiE, 0.25, 0.5)));
      setTS(aRdi, glow("143,224,255", gRdi));
      setTS(aCall, glow("255,181,154", gCall));
      setTS(aPlt, glow("255,255,255", gCall));
      setTS(aXor, glow("255,181,154", 0.8 * gEax));
      setTS(aEax1, glow("143,224,255", gEax));
      setTS(aEax2, glow("143,224,255", gEax));
      setTS(aRet, glow("255,181,154", gRet));
      if (t > t1 - 0.3) aGlowSpans.forEach((sp) => setTS(sp, ""));

      // ---------------------------------------------------------------- registers
      const fadeOut = 1 - S(T.valE - 0.05, t1 - 0.3, t);
      {
        // rdi: appears on "register"; the gold mote lays the pointer thread from .Lstr: into it
        const ap = clamp(OT.spring(t, T.reg - 0.15, 14, 0.55), 0, 1.2);
        const ca = S(T.reg - 0.15, T.reg + 0.1, t) * fadeOut;
        const land = t >= T.rdi - 0.08;
        const flashR = land ? bump(t, T.rdi - 0.08, 0.01, 3) : 0;
        const firstG = win(t, T.first - 0.1, T.argE + 0.1, 0.25, 0.6);
        ctx.show(capRdi.el, ca);
        capRdi.el.style.transform = `translate(${CAPX}px, ${px(capRdi.y - 26)}) scale(${f3(lerp(0.6, 1, ap) * (1 + 0.06 * flashR))})`;
        capRdi.el.style.boxShadow = `0 0 ${(26 + 30 * Math.max(flashR, firstG)).toFixed(1)}px rgba(110,210,255,${f3(0.22 + 0.5 * Math.max(flashR, firstG))}), inset 0 2px 0 rgba(255,255,255,.22)`;
        setTS(capRdi.n, glow("143,224,255", Math.max(flashR, firstG)));
        const pulseCall = bump(t, T.call + 0.05, 0.1, 3);
        capRdi.v.style.opacity = land ? f3(S(T.rdi - 0.08, T.rdi + 0.1, t)) : "0";
        setTxt(capRdi.v, ".Lstr");
        capRdi.v.style.transform = `scale(${f3(1 + 0.18 * pulseCall)})`;
        // the pointer thread + mote
        const um = EZ.cubicInOut(inv(T.goes - 0.08, T.rdi - 0.08, t));
        const pa = S(T.goes - 0.1, T.goes + 0.05, t) * (1 - S(T.call + 0.2, T.puts7E, t)) * fadeOut;
        ctx.show(ptrPath, pa);
        ptrPath.setAttribute("stroke-dashoffset", f3(1 - um));
        const ma = S(T.goes - 0.1, T.goes + 0.05, t) * (1 - S(T.rdi - 0.12, T.rdi + 0.05, t));
        ctx.show(mote, ma);
        if (ma > 0.002) { const [mx, my] = bez(PTR, um); mote.style.transform = `translate(${px(mx)}, ${px(my)})`; }
        // the rack of argument registers: rdi is the first of six
        const rk = S(T.exp - 0.1, T.exp + 0.2, t) * (1 - S(T.argE + 0.4, T.call + 0.1, t)) * fadeOut;
        RACK.forEach((r) => {
          const sp = clamp(OT.spring(t, T.exp - 0.05 + 0.05 * r.k, 12, 0.6), 0, 1.2);
          ctx.show(r.el, rk * S(0, 0.4, sp));
          r.el.style.transform = `translate(${px(lerp(CAPX + 60, r.x, sp))}, ${px(capRdi.y - 20)})`;
        });
        ORD.forEach((o, k) => {
          const oa = rk * (k === 0 ? 1 : 0.8) * S(T.exp + 0.1 + 0.05 * k, T.exp + 0.35 + 0.05 * k, t);
          ctx.show(o.el, oa);
          o.el.style.transform = `translate(${px(o.x - 20)}, ${px(capRdi.y + (k === 0 ? 34 : 30))})`;
          o.el.style.color = k === 0 ? `rgba(${OT.mix([185, 204, 255], [255, 255, 255], firstG).join(",")},${f3(0.75 + 0.25 * firstG)})` : "";
          setTS(o.el, k === 0 ? glow("143,224,255", firstG) : "");
        });
        // Call puts: a thread reaches out of puts@PLT into the dark, a pulse runs along it
        const cg = EZ.cubicOut(inv(T.call + 0.05, T.puts7 + 0.4, t));
        const cla = S(T.call, T.call + 0.1, t) * (1 - S(T.puts7E + 0.1, T.put, t));
        ctx.show(callPath, cla);
        callPath.setAttribute("stroke-dashoffset", f3(1 - cg));
        const cu = inv(T.puts7, T.puts7 + 0.75, t);
        const cda = cla * (cu > 0 && cu < 1 ? Math.sin(Math.PI * cu) : 0);
        ctx.show(cdot, cda);
        if (cda > 0.002) { const [cx, cy] = bez(CALLP, EZ.quadIn(cu)); cdot.style.transform = `translate(${px(cx)}, ${px(cy)})`; }
      }
      {
        // eax: appears on "Put"; xor eax, eax makes a 0 that drops into it on "E-A-X"
        const ap = clamp(OT.spring(t, T.put - 0.08, 14, 0.55), 0, 1.2);
        const ca = S(T.put - 0.08, T.put + 0.15, t) * fadeOut;
        const landZ = t >= T.eax - 0.04;
        const flashE = landZ ? bump(t, T.eax - 0.04, 0.01, 2.6) : 0;
        const retG = win(t, T.ret - 0.08, T.valE + 0.1, 0.25, 0.6);
        ctx.show(capEax.el, ca);
        capEax.el.style.transform = `translate(${CAPX}px, ${px(capEax.y - 26)}) scale(${f3(lerp(0.6, 1, ap) * (1 + 0.06 * flashE))})`;
        capEax.el.style.boxShadow = `0 0 ${(26 + 30 * Math.max(flashE, retG)).toFixed(1)}px rgba(110,210,255,${f3(0.22 + 0.5 * Math.max(flashE, retG))}), inset 0 2px 0 rgba(255,255,255,.22)`;
        setTS(capEax.n, glow("143,224,255", flashE));
        setTxt(capEax.v, "0");
        capEax.v.style.opacity = landZ ? "1" : "0";
        capEax.v.style.transform = `scale(${f3(1 + 0.3 * retG + 0.2 * flashE)})`;
        // the flying zero
        const za = S(T.zero - 0.08, T.zero + 0.05, t) * (landZ ? 0 : 1);
        ctx.show(zero, za);
        if (za > 0.002) {
          const pop = clamp(OT.spring(t, T.zero - 0.08, 15, 0.5), 0, 1.3);
          const uz = EZ.cubicInOut(inv(T.zero + 0.18, T.eax - 0.04, t));
          const zx0 = aCol(18) + 14, zy0 = aRowY(4);
          const zx1 = CAPX + CAPW - 22 - ACW, zy1 = aRowY(4);
          const zx = lerp(zx0, zx1, uz), zy = lerp(zy0, zy1, uz) - 70 * Math.sin(Math.PI * uz);
          zero.style.transform = `translate(${px(zx)}, ${px(zy - 28)}) scale(${f3(lerp(0.3, 1, pop) * lerp(1, 25 / 36, uz))})`;
        }
      }

      // ---------------------------------------------------------------- the chip
      {
        const presence = S(T.asmE - 0.2, T.cpu - 0.1, t) * (1 - S(T.s64E + 0.15, T.strs + 0.15, t));
        const cpu = win(t, T.cpu - 0.15, T.s64E + 0.2, 0.4, 0.9);
        const xg = win(t, T.x86 - 0.12, T.s64E + 0.2, 0.25, 0.9);
        ctx.show(pD, presence);
        if (presence > 0.002) {
          chip.style.transform = `translate(${CHX}px, ${CHY}px) rotate(-9deg)`;
          die.style.opacity = f3(0.34 + 0.4 * cpu);
          chipGlow.style.opacity = f3(0.15 + 0.6 * cpu);
          x86.style.opacity = f3(0.3 + 0.7 * xg);
          x86.style.transform = `translate(0px, ${px(DW * 0.33)}) translate(-50%, -50%) scale(${f3(1 + 0.05 * xg)})`;
          x86.style.color = `rgb(${OT.mix([143, 224, 255], [240, 252, 255], xg).join(",")})`;
          x86.style.textShadow = xg > 0.004 ? `0 0 ${(20 + 40 * xg).toFixed(1)}px rgba(110,210,255,${f3(0.95 * xg)})` : "none";
        }
      }
    });
  },
});
