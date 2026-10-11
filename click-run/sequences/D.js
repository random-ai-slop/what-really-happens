/* Sequence D — assembler → linker  (s08, s09)
 *
 * Entry  baton 3: the ASM block centred on indigo (#0e0c26), bits.
 * s08    a read head steps down the listing; each line scrambles into its real encoding (an object
 *        listing); the bytes detach and fall one stratum into the object layer (#07070f) where they
 *        line up: 17 code bytes (counted by a bracket) above the 14 gold bytes of the string. The
 *        8 zero bytes hollow out into two pink holes, flicker on their questions, and get hanging
 *        notes (real relocation types). Everything compacts into the hello.o brick, which drops to
 *        bedrock (#040406).
 * s09    startup bricks (crt1.o/_start, crti.o, crtn.o) dock; a ripple hands out final addresses;
 *        the .Lstr note carries its thread to the string and the hole snaps shut (BC 0E 00 00); far
 *        away libc.so.6 glows, threads from unseen programs feeding it; the puts hole fills with
 *        E3 FE FF FF towards a puts@plt stub whose dashed thread stops short of libc. The bricks fuse
 *        into the SLAB (chips land in its byte rows), 7F 45 4C 46 stamps, the file opens to 16 KB,
 *        and everything else dims away: a dead-still slab on bedrock.
 * Exit   baton 4: SLAB at left 580 / top 405 on the plane at depth DB, camera {960, 640, DB}.
 * Window convention: every element of this sequence is shown only for t0 <= t < t1.
 */
OT.sequence({
  id: "D",
  build(ctx) {
    const { t0, t1 } = ctx;
    const { clamp, lerp, inv, sstep, E, spring, hash } = OT;
    const a8 = (w, n) => ctx.at("s08", w, n), a9 = (w, n) => ctx.at("s09", w, n);
    const T = {
      asm: a8("assembler"), enc: a8("encodes"), instr: a8("instruction"), raw: a8("raw"), code: a8("code"),
      main: a8("main"), n17: a8("seventeen"), bytes: a8("bytes"), but: a8("but"), blank: a8("blank"),
      where1: a8("where", 1), string: a8("string"), live: a8("live"), where2: a8("where", 2), puts1: a8("puts"),
      nobody: a8("nobody"), holes: a8("holes"), each: a8("each", 2), note: a8("note"), fill: a8("fill"),
      later: a8("later"), laterE: ctx.end("s08", "later"),
      linker: a9("linker"), settles: a9("settles"), notes: a9("notes"), adds: a9("adds"), startup: a9("startup"), never: a9("never"),
      gives: a9("gives"), final: a9("final"), address: a9("address"), fills: a9("fills"), holes2: a9("holes"),
      puts2: a9("puts"), clib: a9("c"), library: a9("library"), shared: a9("shared"), program: a9("program"),
      call: a9("call"), small: a9("small"), stub: a9("stub"), connected: a9("connected"), launch: a9("launch"),
      result: a9("result"), exec: a9("executable"), about: a9("about"), sixteen: a9("sixteen"), kb: a9("kilobytes"),
      still: a9("still"), file: a9("file"),
    };

    // ------------------------------------------------------------------ depths, layout, derived beats
    const DBY = 700;            // object-file stratum (bytes plane)
    const DB = 3000;            // bedrock: the linker's table, the slab plane, the exit depth
    const DL = DB + 1600;       // libc.so.6, far below/away
    const SB = 0.6;             // hello.o scale on bedrock
    const CY8 = 625, BY = 670;  // container centre y: bytes plane / bedrock
    const SCR = 0.36;           // scramble duration

    const LINE_ORDER = [1, 2, 3, 4, 5, 6, 8];
    const scanAt = (i) => (i < 6 ? T.enc + 0.14 * i : T.enc + 0.96); // when the read head reaches LINE_ORDER[i]
    const tChip = T.raw - 0.22, tFall = T.raw + 0.04;
    const tCnt0 = T.main + 0.08, tCnt1 = T.n17 + 0.3;
    const tC0 = T.later + 0.02, tC1 = T.later + 0.62;      // compaction into the hello.o brick
    const tP0 = T.later + 0.5, tP1 = T.linker - 0.2;       // the drop to bedrock
    const tDock = [T.adds - 0.06, T.adds + 0.14, T.adds + 0.34];
    const tRip0 = T.gives + 0.1, tRip1 = T.address + 0.45;
    const tFillA = T.address + 0.42, tFillB = T.holes2 - 0.06;
    const tStubIn = T.small - 0.06, tFill2 = T.stub + 0.02;
    const tDash0 = T.connected - 0.32, tDash1 = T.launch + 0.06;
    const tF0 = T.result - 0.3, tF1 = T.exec - 0.06;
    const tGrow0 = T.sixteen - 0.12, tGrow1 = T.kb + 0.4;
    const tGone0 = T.still - 0.5, tGone1 = T.still + 0.45;
    const tRest = tGrow1 + 0.15; // from here the camera is dead still to t1

    // ------------------------------------------------------------------ camera / ground / motes / hits
    // Text sits in frame almost everywhere here, and a slow creep makes glyphs shimmer, so the camera works in
    // rests (two identical keys, full x/y/z) joined by decisive moves. Small reframes ride inside bigger moves.
    ctx.cam([
      [t0, { x: 960, y: 640, z: 0, roll: 0 }],
      [T.enc - 0.05, { x: 960, y: 640, z: 0 }],
      [T.raw - 0.5, { x: 960, y: 640, z: 0 }],                                   // still while the read head encodes
      [T.main - 0.02, { x: 960, y: 618, z: DBY, ease: "smoother" }],         // one dive after the falling bytes
      [T.but + 0.14, { x: 960, y: 618, z: DBY }],                                 // "Main is just seventeen bytes"
      [T.blank + 0.45, { x: 960, y: 618, z: DBY + 70, ease: "smoother" }],        // push in on "blank"
      [T.where1 - 0.1, { x: 960, y: 618, z: DBY + 70 }],
      [T.live - 0.1, { x: 915, y: 618, z: DBY + 70, ease: "smoother" }],          // lean to the string's hole
      [T.where2 - 0.15, { x: 915, y: 618, z: DBY + 70 }],
      [T.puts1 + 0.2, { x: 1005, y: 618, z: DBY + 70, ease: "smoother" }],       // lean to puts' hole
      [T.nobody + 0.15, { x: 1005, y: 618, z: DBY + 70 }],
      [T.holes - 0.55, { x: 960, y: 632, z: DBY + 132, ease: "smoother" }],       // both holes, room for the notes
      [tP0 + 0.12, { x: 960, y: 632, z: DBY + 132 }],
      [T.linker - 0.1, { x: 960, y: 640, z: DB - 80 }],                           // land on bedrock
      [tFillA - 0.35, { x: 960, y: 640, z: DB - 80 }],                            // still: notes, startup, addresses
      [T.holes2 + 0.3, { x: 905, y: 650, z: DB + 130 }],
      [T.library + 0.35, { x: 1180, y: 556, z: DB - 436 }],
      [T.program + 0.25, { x: 1180, y: 556, z: DB - 436 }],                       // still on libc
      [T.stub + 0.3, { x: 1130, y: 600, z: DB - 215 }],
      [T.connected - 0.25, { x: 1130, y: 600, z: DB - 215 }],                     // still on the stub, then follow the thread
      [T.launch + 0.3, { x: 1168, y: 576, z: DB - 290 }],
      [T.result - 0.25, { x: 1168, y: 576, z: DB - 290 }],                        // still: "connected at launch"
      [T.exec + 0.05, { x: 960, y: 640, z: DB - 150 }],
      [tGrow0, { x: 960, y: 640, z: DB - 150 }],                                  // still: the stamp
      [tRest, { x: 960, y: 640, z: DB }],
      [t1, { x: 960, y: 640, z: DB }],
    ]);
    ctx.exit({ x: 960, y: 640, z: DB });
    ctx.ground([[t0, "#0e0c26"], [T.raw, "#0e0c26"], [T.main, "#07070f"], [tP0 + 0.2, "#07070f"], [T.linker - 0.15, "#040406"], [t1, "#040406"]]);
    ctx.motes([[t0, "bits"], [T.linker - 0.2, "none"]]);
    ctx.flash(tP1 + 0.02, { peak: 0.07, decay: 6, color: "#bfe8ff" });
    ctx.shake(tP1 + 0.02, { amp: 6, decay: 6 });
    ctx.shake(tDock[0] + 0.62, { amp: 3.5, freq: 34, decay: 8 });
    ctx.shake(tDock[2] + 0.62, { amp: 2.5, freq: 34, decay: 8 });
    ctx.flash(tFillB + 0.05, { peak: 0.08, decay: 9, color: "#d9f3ff" });
    ctx.shake(tFillB + 0.05, { amp: 3, freq: 32, decay: 8 });
    ctx.flash(tFill2 + 0.05, { peak: 0.06, decay: 9, color: "#d9f3ff" });
    ctx.flash(T.exec, { peak: 0.12, decay: 7, color: "#bfe8ff" });
    ctx.shake(T.exec, { amp: 6, decay: 6 });
    ctx.hero(() => null);

    // ------------------------------------------------------------------ styles
    const MONO = '"JetBrains Mono", monospace';
    const style = ctx.el("style", "", ctx.root);
    style.textContent = `
.sD-chip{position:absolute;left:0;top:0;width:64px;height:58px;margin:-29px 0 0 -32px;font-family:${MONO};font-size:40px;line-height:58px;text-align:center;color:#82dcff;white-space:pre}
.sD-chip .bd{position:absolute;left:0;top:0;right:0;bottom:0;border-radius:8px;border:1.5px solid rgba(130,220,255,.55);background:rgba(130,220,255,.075);box-shadow:inset 0 0 14px rgba(110,210,255,.12)}
.sD-chip .tx{position:relative}
.sD-chip.g .bd{border-color:rgba(255,197,77,.5);background:rgba(255,197,77,.07);box-shadow:inset 0 0 14px rgba(255,190,70,.12)}
.sD-rim{position:absolute;left:0;top:0;width:286px;height:72px;margin:-36px 0 0 -143px;border-radius:11px;border:2.5px dashed #ff5c9a;box-shadow:0 0 26px rgba(255,92,154,.35),inset 0 0 22px rgba(255,92,154,.2)}
.sD-rimok{position:absolute;left:0;top:0;width:286px;height:72px;margin:-36px 0 0 -143px;border-radius:11px;border:2.5px solid #a8ecff;box-shadow:0 0 30px rgba(140,225,255,.55),inset 0 0 22px rgba(140,225,255,.25)}
.sD-hang{position:absolute;left:0;top:0;width:300px;height:120px;margin:0 0 0 -150px;transform-origin:50% 0}
.sD-hang .th{position:absolute;left:149px;top:0;width:2px;height:36px;background:rgba(255,120,170,.85);transform-origin:50% 0}
.sD-hang .tg{position:absolute;left:150px;top:34px;padding:9px 18px 9px 18px;border-radius:9px;border:1.5px solid rgba(255,92,154,.8);background:rgba(38,8,22,.9);box-shadow:0 0 22px rgba(255,92,154,.25);font-family:${MONO};white-space:pre;text-align:center}
.sD-hang .tg:before{content:"";position:absolute;left:50%;top:-1px;width:9px;height:9px;margin:-5px 0 0 -5px;border-radius:50%;border:1.5px solid rgba(255,140,185,.9);background:#14040c}
.sD-hang .t1{font-size:31px;line-height:38px;color:#ffe1ec}
.sD-hang .t2{font-size:17px;line-height:22px;color:rgba(255,175,208,.75);letter-spacing:.02em}
.sD-lbl{position:absolute;left:0;top:0;width:320px;height:56px;margin:-28px 0 0 -320px;line-height:56px;text-align:right;font-family:${MONO};font-size:36px;color:#b9ccff;white-space:pre;transform-origin:100% 50%}
.sD-adr{position:absolute;left:0;top:0;width:320px;height:40px;margin:-20px 0 0 -320px;line-height:40px;text-align:right;font-family:${MONO};font-size:24px;color:#8fe0ff;white-space:pre;transform-origin:100% 50%;text-shadow:0 0 12px rgba(110,210,255,.6)}
.sD-ta{position:absolute;left:0;top:0;width:90px;height:30px;margin:-15px 0 0 -45px;line-height:30px;text-align:center;font-family:${MONO};font-size:20px;color:#bfefff;white-space:pre}
.sD-brk{position:absolute;left:0;top:0;width:1216px;height:16px;margin:-8px 0 0 -608px;border:2px solid rgba(160,230,255,.85);border-bottom:none;border-radius:4px 4px 0 0;box-shadow:0 -6px 18px -8px rgba(140,225,255,.6)}
.sD-cnt{position:absolute;left:0;top:0;width:400px;height:48px;margin:-24px 0 0 -200px;line-height:48px;text-align:center;font-family:${MONO};font-size:34px;color:#dff6ff;white-space:pre;text-shadow:0 0 16px rgba(120,215,255,.6)}
.sD-scan{position:absolute;left:0;top:0;height:52px;border-left:3px solid #9fe6ff;background:linear-gradient(90deg,rgba(143,224,255,.20),rgba(143,224,255,.07) 40%,rgba(143,224,255,0));box-shadow:-6px 0 22px rgba(120,215,255,.45)}
.sD-body{position:absolute;left:0;top:0;width:1530px;height:410px;margin:-205px 0 0 -765px;border-radius:16px;background:linear-gradient(180deg,#121826 0%,#0b0f19 100%);box-shadow:0 0 0 2.5px rgba(140,200,255,.38),0 60px 160px rgba(0,0,0,.7),0 0 110px rgba(80,160,255,.14)}
.sD-body .hl{position:absolute;left:0;right:0;top:86px;height:2px;background:rgba(140,200,255,.22)}
.sD-body .kd{position:absolute;right:40px;top:28px;font-family:${MONO};font-size:26px;color:rgba(160,200,255,.7);letter-spacing:.04em}
.sD-hname{position:absolute;left:0;top:0;height:60px;margin:-30px 0 0 0;line-height:60px;font-family:${MONO};font-weight:700;font-size:44px;color:#eef4ff;white-space:pre;transform-origin:0 50%}
.sD-brick{position:absolute;left:0;top:0;border-radius:9px;background:linear-gradient(180deg,#141b2b 0%,#0c111c 100%);box-shadow:0 0 0 1.5px rgba(140,200,255,.36),0 24px 70px rgba(0,0,0,.65);font-family:${MONO};white-space:pre}
.sD-brick .nm{position:absolute;left:22px;top:12px;font-size:26px;line-height:34px;font-weight:700;color:#eef4ff}
.sD-brick .sb{position:absolute;right:22px;top:15px;font-size:19px;line-height:30px;color:rgba(160,205,255,.8)}
.sD-brick .bt{position:absolute;left:26px;top:54px;font-size:19px;line-height:30px;color:rgba(130,220,255,.8)}
.sD-brick .ad{position:absolute;right:22px;top:15px;font-size:19px;line-height:30px;color:#8fe0ff;text-shadow:0 0 10px rgba(110,210,255,.6)}
.sD-lglow{position:absolute;left:0;top:0;width:3800px;height:2500px;margin:-1250px 0 0 -1900px;border-radius:50%;background:radial-gradient(closest-side,rgba(205,240,255,.40),rgba(150,215,255,.15) 38%,rgba(110,190,255,.05) 68%,rgba(80,160,255,0))}
.sD-lglow .nu{position:absolute;left:50%;top:50%;width:1300px;height:820px;margin:-410px 0 0 -650px;border-radius:50%;background:radial-gradient(closest-side,rgba(235,250,255,.42),rgba(190,232,255,.14) 55%,rgba(190,232,255,0))}
.sD-lglow .orb{position:absolute;left:50%;top:50%;border-radius:50%;border:4px solid rgba(191,232,255,.13)}
.sD-libl{position:absolute;left:0;top:0;width:0;height:0;font-family:${MONO}}
.sD-libl .fnn{position:absolute;left:0;top:0;white-space:pre;transform:translate(-50%,-50%);color:#d7f0ff}
.sD-libl .big{position:absolute;left:0;top:0;font-size:150px;line-height:170px;font-weight:700;color:#e6f6ff;text-shadow:0 0 60px rgba(191,232,255,.8);white-space:pre;transform:translate(0,-50%)}
.sD-hex{position:absolute;left:0;top:0;font-family:${MONO};font-size:30px;line-height:50px;white-space:pre;color:rgba(130,220,255,.55);text-shadow:0 0 14px rgba(90,200,255,.45);transform:translate(-50%,-50%)}
.sD-band{position:absolute;left:0;top:0;width:260px;height:720px;margin:-360px 0 0 -130px;background:linear-gradient(90deg,rgba(190,235,255,0),rgba(190,235,255,.16) 45%,rgba(235,250,255,.34) 50%,rgba(190,235,255,.16) 55%,rgba(190,235,255,0))}
`;

    // ------------------------------------------------------------------ helpers
    const st = (el, k, v) => { const c = el._sD || (el._sD = {}); if (c[k] !== v) { c[k] = v; el.style[k] = v; } };
    const vis = (el, a) => {
      if (!(a >= 0.002)) { st(el, "visibility", "hidden"); return false; }
      st(el, "visibility", "visible");
      st(el, "opacity", a >= 0.999 ? "1" : a.toFixed(3));
      return true;
    };
    const txt = (el, s) => { if (el._tx !== s) { el._tx = s; el.textContent = s; } };
    const f2 = (v) => v.toFixed(2);
    const tr = (x, y, d, s = 1, r = 0) => `translate3d(${f2(x)}px, ${f2(y)}px, ${f2(-d)}px)${r ? ` rotate(${f2(r)}deg)` : ""}${s !== 1 ? ` scale(${s.toFixed(4)})` : ""}`;
    const mixc = (a, b, u) => OT.rgb(OT.mix(a, b, u));
    const pulse = (t, at, k = 5) => (t >= at ? Math.exp(-(t - at) * k) : 0);
    const win = (t, a, b, fi = 0.15, fo = 0.15) => sstep(a - fi, a, t) * (1 - sstep(b, b + fo, t));
    const HEXD = "0123456789ABCDEF";
    const rndHex = (t, k, rate = 14) => { const f = Math.floor(t * rate); return HEXD[Math.floor(hash(k * 7 + 1, f) * 16)] + HEXD[Math.floor(hash(k * 13 + 5, f + 3) * 16)]; };
    const swing = (t, imps) => imps.reduce((s, [at, A, w = 8]) => { const x = t - at; return x > 0 ? s + A * Math.exp(-2.3 * x) * Math.sin(w * x) : s; }, 0);

    // ------------------------------------------------------------------ the ASM block (baton 3)
    const ASM = ["main:", "    push  rax", "    lea   rdi, [rip + .Lstr]", "    call  puts@PLT", "    xor   eax, eax", "    pop   rcx", "    ret", ".Lstr:", '    .asciz "Hello, world!"'];
    const pAsm = ctx.plane(0);
    const asm = OT.C.code(pAsm, ASM, { lang: "asm", theme: "night", size: 36, lh: 56 });
    const AX = 960 - asm.maxWidth / 2, AY = 640 - asm.height / 2;
    asm.el.style.left = AX + "px";
    asm.el.style.top = AY + "px";
    const ORIG = asm.segs.map((spans) => spans.map((sp) => [sp.textContent, sp.className]));
    const ENC = { 1: ["50"], 2: ["48", "8D", "3D", "00", "00", "00", "00"], 3: ["E8", "00", "00", "00", "00"], 4: ["31", "C0"], 5: ["59"], 6: ["C3"] };
    const GOLD = ["48", "65", "6C", "6C", "6F", "2C", "20", "77", "6F", "72", "6C", "64", "21", "00"];
    const hexOf = (L) => (L === 8 ? GOLD : ENC[L]).join(" ");
    const rowY = (L) => AY + 56 * L + 28;
    const scan = ctx.el("div", "sD-scan", pAsm);
    scan.style.left = AX - 34 + "px";
    scan.style.width = asm.maxWidth + 110 + "px";

    // ------------------------------------------------------------------ the object: chips, holes, notes, labels, brick
    const CODE = [];
    LINE_ORDER.forEach((L) => (L === 8 ? [] : ENC[L]).forEach((h, j) => CODE.push({ L, j, h })));
    const chips = [];
    const mkChip = (h, gold) => {
      const el = ctx.el("div", "ot-free sD-chip" + (gold ? " g" : ""));
      const bd = OT.el("div", "bd", el), tx = OT.el("span", "tx", el);
      tx.textContent = h;
      return { el, bd, tx };
    };
    CODE.forEach((c, k) => {
      const o = mkChip(c.h, false);
      const hole = k >= 4 && k <= 7 ? 0 : k >= 9 && k <= 12 ? 1 : -1;
      const fill = hole === 0 ? ["BC", "0E", "00", "00"][k - 4] : hole === 1 ? ["E3", "FE", "FF", "FF"][k - 9] : c.h;
      const li = LINE_ORDER.indexOf(c.L);
      chips.push({ ...o, kind: "c", k, h: c.h, hole, fill, L: c.L,
        sx: AX + 21.6 * (5 + 3 * c.j), sy: rowY(c.L), lx: -576 + 72 * k, ly: -105,
        fs: tFall + 0.03 * li + 0.012 * c.j, rot: (hash(k, 11) - 0.5) * 26,
        sr: k < 16 ? 3 : 4, sc: k < 16 ? k : 0 });
    });
    GOLD.forEach((h, g) => {
      const o = mkChip(h, true);
      chips.push({ ...o, kind: "g", k: g, h, hole: -1, fill: h, L: 8,
        sx: AX + 21.6 * (5 + 3 * g), sy: rowY(8), lx: -576 + 72 * g, ly: 105,
        fs: tFall + 0.06 + 0.01 * g, rot: (hash(g, 23) - 0.5) * 26,
        sr: g < 8 ? 4 : 5, sc: g < 8 ? 8 + g : g - 8 });
    });
    const slabXY = (r, c) => [580 + 26 + 34.2 * c + 11.4, 405 + 84 + 30 * r + 15];

    const body = ctx.el("div", "ot-free sD-body");
    const bodyHl = OT.el("div", "hl", body);
    const bodyKd = OT.el("div", "kd", body, "ELF64 · relocatable");
    const hname = ctx.el("div", "ot-free sD-hname");
    hname.textContent = "hello.o";
    const rims = [0, 1].map(() => ctx.el("div", "ot-free sD-rim"));
    const rimsOk = [0, 1].map(() => ctx.el("div", "ot-free sD-rimok"));
    const HOLE_X = [-180, 180];
    const tags = [
      { t1: "→ .Lstr", t2: "R_X86_64_PC32" },
      { t1: "→ puts", t2: "R_X86_64_PLT32" },
    ].map((d) => {
      const el = ctx.el("div", "ot-free sD-hang");
      const th = OT.el("div", "th", el), tg = OT.el("div", "tg", el);
      const a = OT.el("div", "t1", tg), b = OT.el("div", "t2", tg);
      a.textContent = d.t1; b.textContent = d.t2;
      return { el, th, tg, a, b, d };
    });
    const lblMain = ctx.el("div", "ot-free sD-lbl"); lblMain.textContent = "main:";
    const lblStr = ctx.el("div", "ot-free sD-lbl"); lblStr.textContent = ".Lstr:";
    const adrMain = ctx.el("div", "ot-free sD-adr"); adrMain.textContent = "0x1140";
    const adrStr = ctx.el("div", "ot-free sD-adr"); adrStr.textContent = "0x2004";
    const brk = ctx.el("div", "ot-free sD-brk");
    const cnt = ctx.el("div", "ot-free sD-cnt");
    const tiny = chips.map((c) => {
      const el = ctx.el("div", "ot-free sD-ta");
      el.textContent = (c.kind === "c" ? 0x1140 + c.k : 0x2004 + c.k).toString(16);
      return el;
    });

    // ------------------------------------------------------------------ strata glimpsed on the way down (real hello.o bytes)
    const HEXROWS = [
      "7F 45 4C 46 02 01 01 00  00 00 00 00 00 00 00 00",
      "01 00 3E 00 01 00 00 00  00 00 00 00 00 00 00 00",
      "50 48 8D 3D 00 00 00 00  E8 00 00 00 00 31 C0 59",
      "C3 48 65 6C 6C 6F 2C 20  77 6F 72 6C 64 21 00 00",
      "00 2E 74 65 78 74 00 2E  72 6F 64 61 74 61 00 2E",
      "73 79 6D 74 61 62 00 6D  61 69 6E 00 70 75 74 73",
    ];
    const strata = [[1450, 0], [2100, 1]].map(([d, k]) => {
      const p = ctx.plane(d);
      const r = OT.rng(41 + k * 9);
      for (let b = 0; b < 6; b++) {
        const x = 960 + ((b % 3) - 1) * 1250 + (r() - 0.5) * 200 + (k ? 380 : -160);
        const y = 640 + (Math.floor(b / 3) - 0.5) * 1150 + (r() - 0.5) * 160;
        const h = ctx.el("div", "sD-hex", p);
        h.style.left = x.toFixed(0) + "px"; h.style.top = y.toFixed(0) + "px";
        h.textContent = HEXROWS.slice((b + k) % 3, ((b + k) % 3) + 3).join("\n");
      }
      return { p, d };
    });

    // ------------------------------------------------------------------ bedrock: platter tracks, startup bricks, stub, libc
    const pPlat = ctx.plane(DB + 650);
    {
      let s = `<svg width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">`;
      for (let i = 0; i < 20; i++) s += `<circle cx="960" cy="3300" r="${2700 + i * 64}" fill="none" stroke="rgba(150,190,235,${(0.05 + 0.03 * (i % 3 === 0)).toFixed(3)})" stroke-width="2"/>`;
      s += `</svg>`;
      pPlat.innerHTML = s;
    }
    const mkBrick = (w, h, name, sub, bytes, adr) => {
      const el = ctx.el("div", "ot-free sD-brick");
      el.style.width = w + "px"; el.style.height = h + "px"; el.style.margin = `${-h / 2}px 0 0 ${-w / 2}px`;
      const nm = OT.el("div", "nm", el, OT.esc(name));
      const sb = sub ? OT.el("div", "sb", el, OT.esc(sub)) : null;
      const bt = bytes ? OT.el("div", "bt", el, OT.esc(bytes)) : null;
      const ad = adr ? OT.el("div", "ad", el, "") : null;
      return { el, nm, sb, bt, ad, w, h, adr };
    };
    // crt1.o carries real _start bytes (endbr64 · xor ebp,ebp · mov r9,rdx · pop rsi · mov rdx,rsp · and rsp,..)
    const CRT = [
      { ...mkBrick(600, 96, "crt1.o", "_start", "F3 0F 1E FA 31 ED 49 89 D1 5E 48 89 E2 48 83 E4", "_start  0x1040"), from: [-260, 120, DB + 950], to: [780, 467], fz: [880, 543] },
      { ...mkBrick(230, 62, "crti.o", "", "", ""), from: [-420, 760, DB + 950], to: [1206, 467], fz: [1180, 520] },
      { ...mkBrick(230, 62, "crtn.o", "", "", ""), from: [930, 1620, DB + 950], to: [1286, 832], fz: [1120, 800] },
    ];
    const stub = mkBrick(230, 82, "puts@plt", "", "", "");
    OT.el("div", "sb", stub.el, "0x1030").style.cssText = "left:22px;right:auto;top:44px;";
    const STUB = [1560, 607];

    // libc.so.6: a vast glowing cloud of real exported names, three layers deep (parallax), no box
    const LIBC = { x: 2900, y: -470 };
    const lglow = ctx.el("div", "ot-free sD-lglow");
    OT.el("div", "nu", lglow);
    [[2200, 1350], [2900, 1800]].forEach(([w, h]) => { const e = OT.el("div", "orb", lglow); e.style.width = w + "px"; e.style.height = h + "px"; e.style.margin = `${-h / 2}px 0 0 ${-w / 2}px`; });
    const LDEP = [DL - 260, DL, DL + 380];
    const llay = LDEP.map((d) => ({ el: ctx.el("div", "ot-free sD-libl"), d }));
    const FNS = ["printf", "malloc", "free", "memcpy", "strlen", "fopen", "fwrite", "exit", "qsort", "strcmp", "getenv", "memset", "fclose", "realloc", "snprintf", "strtol", "fflush", "write", "read", "calloc", "fputs", "abort", "strchr", "memmove", "time", "perror", "putchar", "setlocale", "atoi", "strstr", "fread", "isatty", "signal", "fprintf", "sscanf", "strncpy", "getline", "fgets", "localtime", "pthread_create", "dlopen", "mmap", "open", "close", "sprintf", "qsort_r"];
    FNS.forEach((n, i) => {
      const L = i % 3, r = Math.sqrt((i + 0.6) / FNS.length), th = i * 2.39996 + 0.4;
      let x = 1300 * r * Math.cos(th), y = 780 * r * Math.sin(th);
      if (x < -380 && y < -120) { x += 300; y += 140; } // keep the label corner clear
      if (Math.hypot(x + 560, y - 300) < 260) { x += 250; y += 60; } // and puts
      const e = OT.el("div", "fnn", llay[L].el);
      e.textContent = n;
      e.style.left = x.toFixed(0) + "px"; e.style.top = y.toFixed(0) + "px";
      e.style.fontSize = [58, 52, 48][L] + "px";
      e.style.opacity = [0.5, 0.36, 0.24][L] * (1 - 0.35 * r);
    });
    const putsDiv = OT.el("div", "fnn", llay[0].el);
    putsDiv.textContent = "puts";
    putsDiv.style.left = "-560px"; putsDiv.style.top = "300px"; putsDiv.style.fontSize = "64px";
    const putsEl = { e: putsDiv, x: -560, y: 300 };
    const lbig = OT.el("div", "big", llay[0].el, "libc.so.6");
    lbig.style.left = "-1320px"; lbig.style.top = "-300px";
    const PUTS_L = { x: LIBC.x + putsEl.x, y: LIBC.y + putsEl.y, d: LDEP[0] };
    // threads from programs we never see, converging on the library (fading with distance)
    const lthr = ctx.el("div", "ot-free");
    const LTH = [];
    {
      const r = OT.rng(808);
      let s = `<svg width="18000" height="13000" viewBox="-9000 -6500 18000 13000" style="position:absolute;left:-9000px;top:-6500px;overflow:visible">`;
      s += `<defs><radialGradient id="sD-lg" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="7600"><stop offset="0" stop-color="#d5f1ff" stop-opacity=".55"/><stop offset=".3" stop-color="#bfe8ff" stop-opacity=".2"/><stop offset="1" stop-color="#bfe8ff" stop-opacity="0"/></radialGradient>`;
      s += `<radialGradient id="sD-lp" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="7600"><stop offset="0" stop-color="#f2fbff" stop-opacity="1"/><stop offset=".45" stop-color="#d9f3ff" stop-opacity=".55"/><stop offset="1" stop-color="#d9f3ff" stop-opacity="0"/></radialGradient></defs>`;
      for (let i = 0; i < 26; i++) {
        const ang = ((140 + (250 * i) / 25 + (r() - 0.5) * 9) * Math.PI) / 180;
        const R = 5600 + r() * 2600;
        const ox = Math.cos(ang) * R, oy = Math.sin(ang) * R * 0.85;
        const ex = Math.cos(ang) * (260 + r() * 200), ey = Math.sin(ang) * (170 + r() * 120);
        const nx = -Math.sin(ang), ny = Math.cos(ang), bend = (r() - 0.5) * 1800;
        const d = `M${ox.toFixed(0)} ${oy.toFixed(0)} Q${((ox + ex) / 2 + nx * bend).toFixed(0)} ${((oy + ey) / 2 + ny * bend).toFixed(0)} ${ex.toFixed(0)} ${ey.toFixed(0)}`;
        s += `<path d="${d}" fill="none" stroke="url(#sD-lg)" stroke-width="5"/>`;
        s += `<path class="pl" d="${d}" pathLength="1000" fill="none" stroke="url(#sD-lp)" stroke-width="11" stroke-linecap="round" stroke-dasharray="34 966"/>`;
        LTH.push(r());
      }
      s += `</svg>`;
      lthr.innerHTML = s;
    }
    const lpulses = Array.from(lthr.querySelectorAll(".pl"));

    // the linker's ripple and the bedrock threads
    const band = ctx.el("div", "ot-free sD-band");
    const pThr = ctx.plane(DB - 2);
    pThr.innerHTML = `<svg width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">
      <path class="a" fill="none" stroke="#ff8fb8" stroke-width="2.4" stroke-linecap="round"/>
      <path class="b" fill="none" stroke="#a8ecff" stroke-width="2.6" stroke-linecap="round" pathLength="1"/>
      <path class="c" fill="none" stroke="#bfe8ff" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="11 9"/>
      <circle class="e" r="7" fill="#040406" stroke="#bfe8ff" stroke-width="2.4"/>
    </svg>`;
    const thrA = pThr.querySelector(".a"), thrB = pThr.querySelector(".b"), thrC = pThr.querySelector(".c"), thrE = pThr.querySelector(".e");
    const sa = (el, k, v) => { const c = el._sD || (el._sD = {}); if (c[k] !== v) { c[k] = v; el.setAttribute(k, v); } };

    // ------------------------------------------------------------------ the slab (baton 4)
    const pSlab = ctx.plane(DB);
    const slab = OT.C.slab(pSlab, { name: "hello", size: "16 KB" });
    slab.el.style.left = "580px";
    slab.el.style.top = "405px";
    const sName = slab.el.querySelector(".name"), sMagic = slab.el.querySelector(".magic"), sKind = slab.el.querySelector(".kind");
    const sBytes = slab.el.querySelector(".bytes"), sSize = slab.el.querySelector(".size"), sHdr = slab.el.querySelector(".hdr");

    // ------------------------------------------------------------------ the object container (hello.o) over time
    const objAt = (t) => {
      const c = E.cubicInOut(inv(tC0, tC1, t));
      const p = E.quintInOut(inv(tP0, tP1, t));
      const tau = t - tP1;
      const bounce = tau > 0 ? 46 * Math.exp(-tau * 9) * Math.sin(tau * 24) : 0;
      return { x: 960, y: lerp(CY8, BY, p), d: lerp(DBY, DB, p) - bounce, S: lerp(1, SB, c), c, p };
    };
    const W = (o, lx, ly, lz = 0) => [o.x + o.S * lx, o.y + o.S * ly, o.d - lz];
    // the apparent position on the bedrock plane of a point on a deeper plane (for threads that reach into depth)
    const onBed = (x, y, d, t) => {
      const c = ctx.camAt(t);
      const sd = 1000 / (1000 - (c.z - d)), sb = 1000 / (1000 - (c.z - DB));
      return [c.x + (x - c.x) * (sd / sb), c.y + (y - c.y) * (sd / sb)];
    };

    // ------------------------------------------------------------------ render
    ctx.render((t) => {
      const live = t >= t0 && t < t1;
      const o = objAt(t);
      const fus = inv(tF0, tF1, t); // fusion progress (linear)
      const gone = sstep(tGone0, tGone1, t);
      const lb = lerp(1, 1.3, o.c); // label boost while compacted

      // ---------------- ASM block
      const asmA = live ? ctx.depthAlpha(0, t) : 0;
      if (vis(pAsm, asmA)) {
        LINE_ORDER.concat([0, 7]).forEach((L) => {
          const row = asm.rows[L], segs = asm.segs[L], orig = ORIG[L];
          let a = 1, mode = "orig";
          if (L === 0 || L === 7) a = 1 - sstep(tChip - 0.02, tChip + 0.02, t);
          else {
            const s0 = scanAt(LINE_ORDER.indexOf(L));
            if (t >= s0 && t < tChip + 0.24) { mode = "hex"; a = 1 - sstep(tChip + 0.06, tChip + 0.24, t); }
            else if (t >= tChip + 0.24) { mode = "ghost"; a = 0.3 * sstep(tChip + 0.3, tChip + 0.6, t) * (1 - sstep(T.code - 0.1, T.main - 0.2, t)); }
            if (mode === "hex") {
              const u = inv(s0, s0 + SCR, t);
              const from = orig.slice(1).map((s) => s[0]).join("");
              txt(segs[1], OT.scramble(from, hexOf(L), u, t, L + 3));
              if (segs[1].className !== (L === 8 ? "s" : "hex")) segs[1].className = L === 8 ? "s" : "hex";
              for (let i = 2; i < segs.length; i++) txt(segs[i], "");
            }
          }
          if (mode !== "hex") {
            segs.forEach((sp, i) => { txt(sp, orig[i][0]); if (sp.className !== orig[i][1]) sp.className = orig[i][1]; });
          }
          vis(row, a);
        });
        // read head
        let y = rowY(0);
        LINE_ORDER.forEach((L, i) => { const prev = i === 0 ? rowY(0) : rowY(LINE_ORDER[i - 1]); y += (rowY(L) - prev) * clamp(spring(t, scanAt(i) - 0.06, 30, 0.75), 0, 1.15); });
        const sA = sstep(T.asm - 0.1, T.asm + 0.3, t) * (1 - sstep(T.raw - 0.2, T.raw + 0.1, t));
        if (vis(scan, sA)) st(scan, "transform", `translate3d(0px, ${f2(y - 26)}px, 0px)`);
      }

      // ---------------- focus / brightness schedule (s08)
      const dimBlank = sstep(T.blank - 0.15, T.blank + 0.25, t) * (1 - sstep(tC0, tC1, t));
      const goldBase = t < T.main ? 1 : lerp(1, 0.42, sstep(T.main - 0.1, T.main + 0.4, t));
      const goldQ = win(t, T.where1 + 0.25, T.live + 0.55, 0.3, 0.5);
      const goldPulse = pulse(t, T.string - 0.05, 3.5);

      // ---------------- chips
      chips.forEach((c, i) => {
        let a = live ? sstep(tChip - 0.05, tChip + 0.14, t) : 0;
        // fusion: chip bodies dissolve, text lands in the slab and hands over to its byte rows
        const pf = clamp(spring(t, tF0 + 0.12 + 0.012 * c.sc + 0.05 * (c.sr - 3), 8, 0.8), 0, 1.06);
        a *= 1 - sstep(tF1 - 0.05, tF1 + 0.2, t);
        if (!vis(c.el, a)) { vis(tiny[i], 0); return; }
        // position: fall from the listing to the row, then ride the container, then fuse into the slab
        const p = spring(t, c.fs, 6.6, 0.7), pz = E.cubicOut(inv(c.fs, c.fs + 0.85, t));
        const lsx = c.sx - 960, lsy = c.sy - CY8;
        let ly = c.ly;
        if (c.kind === "g") ly += 5 * Math.sin(t * 1.5 + c.k * 0.45) * sstep(T.main, T.main + 1, t) * (1 - sstep(T.gives, T.final + 0.3, t));
        const lx = lerp(lsx, c.lx, p), lyy = lerp(lsy, ly, p), lz = lerp(DBY, 0, pz);
        let [x, y, d] = W(o, lx, lyy, lz);
        let s = o.S * lerp(0.9, 1, pz);
        const rot = c.rot * (1 - clamp(p, 0, 1)) * (t > c.fs ? 1 : 0);
        if (fus > 0) {
          const [fx, fy] = slabXY(c.sr, c.sc);
          x = lerp(x, fx, pf); y = lerp(y, fy, pf); d = lerp(d, DB - 3, clamp(pf, 0, 1)); s = lerp(s, 0.475, clamp(pf, 0, 1));
        }
        st(c.el, "transform", tr(x, y, d, s, rot));

        // look
        let col = c.kind === "g" ? [255, 197, 77] : [130, 220, 255];
        let bdA = 1, hl = 0, dim = 1, text = c.h;
        // counted
        if (c.kind === "c") {
          const tk = lerp(tCnt0, tCnt1, (c.k + 0.5) / 17);
          hl += 1.0 * pulse(t, tk, 2.4) * (t < T.but ? 1 : 0);
          if (c.hole < 0) dim *= lerp(1, 0.55, dimBlank);
        } else {
          dim *= goldBase;
          dim = Math.max(dim, lerp(dim, 1, Math.max(goldQ, 0.7 * goldPulse)));
          hl += 0.7 * goldPulse;
        }
        // holes
        if (c.hole >= 0) {
          const open = sstep(T.blank - 0.1, T.blank + 0.18, t);
          const fillT = c.hole === 0 ? tFillB : tFill2;
          const shut = sstep(fillT, fillT + 0.12, t);
          bdA = lerp(1, 0, open * (1 - shut));
          col = OT.mix([130, 220, 255], [255, 92, 154], open * (1 - shut));
          dim *= lerp(1, 0.62, open * (1 - shut));
          // searching on its question
          const q = c.hole === 0 ? [T.where1 + 0.1, T.live + 0.4] : [T.where2 + 0.08, T.puts1 + 0.5];
          if (t >= q[0] && t < q[1]) { text = rndHex(t, c.k); dim = 1; }
          if (t >= fillT) { const u = inv(fillT, fillT + 0.3, t); text = OT.scramble("00", c.fill, u, t, c.k + 5); hl += 0.9 * pulse(t, fillT + 0.05, 4); }
        }
        // call byte lights up on "that call"
        if (c.kind === "c" && c.k === 8) hl += 0.8 * pulse(t, T.call - 0.05, 3);
        // ripple: final addresses
        const bx = lerp(430, 1520, E.sineInOut(inv(tRip0, tRip1, t)));
        const ripA = win(t, tRip0, tRip1, 0.1, 0.25);
        const near = ripA * Math.exp(-Math.pow((x - bx) / 70, 2));
        hl += 0.85 * near;
        // dissolve bodies in fusion
        bdA *= 1 - sstep(tF0 + 0.1, tF0 + 0.5, t);
        // compaction / bedrock calm
        if (t > tC0) dim = Math.max(dim, 0.88);
        txt(c.tx, text);
        st(c.bd, "opacity", (bdA * dim).toFixed(3));
        const tc = OT.mix(col, c.kind === "g" ? [255, 244, 214] : [235, 250, 255], clamp(hl, 0, 1));
        st(c.tx, "color", OT.rgb(tc, clamp(dim, 0, 1)));
        const gl = clamp(0.45 + 0.55 * hl, 0, 1) * dim;
        const gc = c.hole >= 0 && bdA < 0.5 ? "255,92,154" : c.kind === "g" ? "255,190,70" : "90,200,255";
        st(c.tx, "textShadow", `0 0 ${(10 + 16 * clamp(hl, 0, 1)).toFixed(0)}px rgba(${gc},${gl.toFixed(2)})`);

        // tiny per-byte addresses in the ripple
        if (vis(tiny[i], live ? near * 0.95 * (1 - fus) : 0)) {
          const [tx, ty, td] = W(o, c.lx, ly - 52);
          st(tiny[i], "transform", tr(tx, ty, td - 1, o.S * 1.15));
        }
      });

      // ---------------- bracket + count ("Main is just seventeen bytes")
      {
        const u = inv(tCnt0, tCnt1, t);
        const a = live ? sstep(tCnt0 - 0.1, tCnt0 + 0.05, t) * (1 - sstep(T.but - 0.1, T.but + 0.35, t)) : 0;
        if (vis(brk, a)) {
          const [x, y, d] = W(o, 0, -158);
          st(brk, "transform", tr(x, y, d, o.S));
          st(brk, "clipPath", `inset(-30px ${f2(100 - 100 * u)}% -30px -30px)`);
        }
        if (vis(cnt, a)) {
          const n = clamp(Math.floor(u * 17 + 0.5), 1, 17);
          txt(cnt, n + (n === 1 ? " byte" : " bytes"));
          const [x, y, d] = W(o, 0, -196);
          const pop = 1 + 0.12 * pulse(t, tCnt1, 6);
          st(cnt, "transform", tr(x, y, d, o.S * pop));
        }
      }

      // ---------------- labels (main:, .Lstr:) — they ride down with the rows, then gain addresses
      [[lblMain, adrMain, 0, -105, 5, 0], [lblStr, adrStr, 7, 105, 6, 1]].forEach(([el, adr, L, ly, n, gi]) => {
        const fsx = tFall + (gi ? 0.06 : 0.0);
        const p = spring(t, fsx, 6.6, 0.72), pz = E.cubicOut(inv(fsx, fsx + 0.85, t));
        const a = live ? sstep(tChip - 0.04, tChip, t) * (1 - sstep(tF0 + 0.1, tF0 + 0.45, t)) : 0;
        const srcR = AX + 21.6 * n;
        const lx = lerp(srcR - 960, -628, p), lyy = lerp(rowY(L) - CY8, ly, p), lz = lerp(DBY, 0, pz);
        const [x, y, d] = W(o, lx, lyy, lz);
        const sc = o.S * lerp(1, 0.72 * lb, pz);
        const dimL = gi ? Math.max(goldBase, goldQ) : 1;
        const say = gi ? pulse(t, T.string - 0.05, 2.5) : pulse(t, T.main - 0.05, 2.5);
        if (vis(el, a * Math.max(dimL, 0.55))) {
          st(el, "transform", tr(x, y, d - 0.5, sc * (1 + 0.12 * say)));
          st(el, "color", mixc([185, 204, 255], [240, 246, 255], say));
          st(el, "textShadow", say > 0.02 ? `0 0 ${(18 * say).toFixed(0)}px rgba(185,204,255,${(0.8 * say).toFixed(2)})` : "none");
        }
        // final address
        const pass = inv(tRip0, tRip1, t);
        const ad = live ? sstep(0.0, 0.12, pass) * (1 - sstep(tF0 + 0.1, tF0 + 0.45, t)) : 0;
        if (vis(adr, ad)) {
          txt(adr, OT.scramble("      ", gi ? "0x2004" : "0x1140", inv(tRip0 + 0.05, tRip0 + 0.4, t), t, 9 + gi));
          const [ax, ay, adp] = W(o, -628, ly + 38);
          st(adr, "transform", tr(ax, ay, adp - 0.5, o.S * lb * 0.95));
        }
      });

      // ---------------- holes: rims
      [0, 1].forEach((h) => {
        const open = sstep(T.blank - 0.08, T.blank + 0.18, t);
        const fillT = h === 0 ? tFillB : tFill2;
        const shut = sstep(fillT, fillT + 0.1, t);
        const q = h === 0 ? [T.where1, T.live + 0.45] : [T.where2, T.puts1 + 0.55];
        const fl = t >= q[0] && t < q[1] ? (hash(Math.floor(t * 20), h + 3) > 0.45 ? 1 : 0.35) : 1;
        const both = Math.max(pulse(t, T.holes - 0.05, 3), pulse(t, T.nobody, 2.2) * 0.3);
        let a = live ? open * (1 - shut) * lerp(0.8, 1, fl) * (t >= q[0] && t < q[1] ? fl : 1) : 0;
        if (h === 1) a = Math.max(a * (1 - shut), live ? 0.95 * pulse(t, T.puts2 - 0.05, 2.5) * (1 - shut) : 0);
        a *= 1 - sstep(tF0, tF0 + 0.3, t);
        const pop = 1 + 0.14 * (1 - clamp(spring(t, T.blank - 0.05, 16, 0.45), 0, 1.2)) * open + 0.06 * both;
        const [x, y, d] = W(o, HOLE_X[h], -105);
        if (vis(rims[h], a)) st(rims[h], "transform", tr(x, y, d - 0.6, o.S * pop));
        const okA = live ? sstep(fillT - 0.02, fillT + 0.06, t) * (1 - sstep(fillT + 0.35, fillT + 0.9, t)) : 0;
        if (vis(rimsOk[h], okA)) st(rimsOk[h], "transform", tr(x, y, d - 0.6, o.S * (1 + 0.08 * pulse(t, fillT, 6))));
      });

      // ---------------- notes (tags)
      const [h1x, h1y] = W(o, HOLE_X[0], -105 + 37);
      const [h2x, h2y] = W(o, HOLE_X[1], -105 + 37);
      const tagS = o.S * lerp(1, 1.3, o.c);
      // dashed thread geometry (s09): from the stub (later the slab) towards libc's puts, stopping short
      const [px, py] = onBed(PUTS_L.x, PUTS_L.y, PUTS_L.d, t);
      const dashO = [lerp(STUB[0] + 115, 1340, sstep(tF0, tF0 + 0.7, t)), lerp(STUB[1], 714, sstep(tF0, tF0 + 0.7, t))];
      const dashF = 0.64 * E.cubicOut(inv(tDash0, tDash1, t));
      const dashE = [lerp(dashO[0], px, dashF), lerp(dashO[1], py, dashF)];
      tags.forEach((g, h) => {
        const ta = T.each + 0.22 * h;
        let a = live ? sstep(ta, ta + 0.18, t) : 0;
        const imps = [[ta + 0.12, 15], [T.fill, 6], [T.notes - 0.05, 5]];
        let pin = h === 0 ? [h1x, h1y] : [h2x, h2y], pd = o.d - 1, sc = tagS, thA = 1, hideT = 0;
        if (h === 0) {
          // the .Lstr note carries its thread to the string, then the hole closes
          const u = E.cubicInOut(inv(tFillA, tFillB, t));
          if (u > 0) {
            const [gx, gy] = W(o, -576, 105 - 40);
            pin = [lerp(h1x, gx, u), lerp(h1y, gy - 70 * SB * 1.3, u)];
            thA = 1 - sstep(0, 0.15, u);
            sc = tagS * lerp(1, 0.55, u);
          }
          a *= 1 - sstep(tFillB - 0.04, tFillB + 0.08, t);
        } else {
          // the puts note moves to the stub, then rides the dashed thread out towards libc
          const u1 = E.cubicInOut(inv(tStubIn + 0.08, tFill2 + 0.1, t));
          const u2 = E.cubicInOut(inv(tDash0, tDash1, t));
          const stubPin = [STUB[0], STUB[1] + 42];
          if (u1 > 0) pin = [lerp(pin[0], stubPin[0], u1), lerp(pin[1], stubPin[1], u1)];
          if (u2 > 0) pin = [lerp(pin[0], dashE[0], u2), lerp(pin[1], dashE[1] + 9, u2)];
          if (u1 > 0) { pd = lerp(pd, DB - 1, u1); sc = lerp(tagS, 0.78, u1); }
          imps.push([tFill2 + 0.08, 9], [tDash1, 10]);
          // absorbed into the file during fusion
          const uf = E.cubicIn(inv(tF0 + 0.1, tF0 + 0.6, t));
          if (uf > 0) { pin = [lerp(pin[0], 1250, uf), lerp(pin[1], 700, uf)]; sc *= lerp(1, 0.3, uf); }
          a *= 1 - sstep(tF0 + 0.35, tF0 + 0.6, t);
          txt(g.b, OT.scramble("R_X86_64_PLT32", "R_X86_64_JUMP_SLOT", inv(tDash0 + 0.25, tDash0 + 0.6, t), t, 31));
        }
        const bright = Math.max(pulse(t, T.note - 0.05, 1.6), 0.8 * pulse(t, T.notes - 0.1, 2.2), h === 1 ? pulse(t, T.puts2 - 0.05, 2) : 0);
        if (vis(g.el, a)) {
          const th = swing(t, imps) + 0.9 * Math.sin(t * 1.25 + h * 2);
          st(g.el, "transform", tr(pin[0], pin[1], pd, sc, th));
          const grow = clamp(spring(t, ta, 20, 0.7), 0, 1.05);
          st(g.th, "transform", `scaleY(${grow.toFixed(3)})`);
          st(g.th, "opacity", thA.toFixed(3));
          const drop = (1 - clamp(spring(t, ta + 0.06, 15, 0.5), 0, 1.3)) * -26;
          st(g.tg, "transform", `translate(-50%, ${f2(drop)}px) scale(${(1 + 0.08 * bright).toFixed(3)})`);
          st(g.tg, "boxShadow", `0 0 ${(22 + 26 * bright).toFixed(0)}px rgba(255,92,154,${(0.25 + 0.45 * bright).toFixed(2)})`);
        }
      });

      // ---------------- the hello.o brick body + name; in the fusion the body morphs into the slab's footprint
      {
        const a = live ? sstep(tC0 + 0.1, tC1, t) * (1 - sstep(tF0 + 0.45, tF1 - 0.05, t)) : 0;
        if (vis(body, a)) {
          const [x0, y0, d0] = W(o, -5, -30);
          const m = E.cubicInOut(inv(tF0, tF0 + 0.6, t));
          const x = lerp(x0, 960, m), y = lerp(y0, 640, m), d = lerp(d0 + 1, DB + 1, m);
          const sx = lerp(o.S, 760 / 1530, m), sy = lerp(o.S, 470 / 410, m);
          st(body, "transform", `translate3d(${f2(x)}px, ${f2(y)}px, ${f2(-d)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`);
          const kd = 1 - sstep(tF0 - 0.05, tF0 + 0.15, t);
          st(bodyKd, "opacity", kd.toFixed(3)); st(bodyHl, "opacity", kd.toFixed(3));
        }
        const na = live ? sstep(tC0 + 0.15, tC1, t) * (1 - sstep(tF1 - 0.12, tF1 + 0.06, t)) : 0;
        if (vis(hname, na)) {
          let [x, y, d] = W(o, -735, -192);
          let s = o.S;
          const u = E.cubicInOut(inv(tF0 + 0.12, tF0 + 0.66, t));
          if (u > 0) { x = lerp(x, 606, u); y = lerp(y, 437, u); d = lerp(d, DB - 3, u); s = lerp(s, 30 / 44, u); }
          txt(hname, OT.scramble("hello.o", "hello", inv(tF0 + 0.5, tF0 + 0.85, t), t, 4));
          st(hname, "transform", tr(x, y, d - 0.5, s));
        }
      }

      // ---------------- strata flying past during the drop
      strata.forEach((L) => {
        const a = live ? win(t, tP0 + 0.15, tP1 - 0.1, 0.25, 0.25) * ctx.depthAlpha(L.d, t, [380, 760]) * 0.55 : 0;
        vis(L.p, a);
      });

      // ---------------- bedrock world
      const arrive = live ? sstep(T.linker - 0.55, T.linker + 0.9, t) : 0;
      vis(pPlat, arrive * 0.9 * (1 - gone));

      // startup bricks: out of the dark, then they dock with a clack
      CRT.forEach((b, i) => {
        const p = spring(t, tDock[i], 8.5, 0.55);
        const pp = clamp(p, 0, 1.2);
        let x = lerp(b.from[0], b.to[0], pp), y = lerp(b.from[1], b.to[1], pp), d = lerp(b.from[2], DB, pp);
        let s = 1;
        const glint = pulse(t, tDock[i] + 0.58, 4);
        // fusion: crt1's bytes line becomes the slab's _start row; the others melt in
        const u = E.cubicInOut(inv(tF0 + 0.04 * i, tF0 + 0.6 + 0.04 * i, t));
        if (u > 0) { x = lerp(x, b.fz[0], u); y = lerp(y, b.fz[1], u); d = lerp(d, DB - 3, u); if (i > 0) s = lerp(1, 0.45, u); }
        const fade = i === 0 ? 1 - sstep(tF1 - 0.12, tF1 + 0.12, t) : 1 - sstep(tF0 + 0.2, tF0 + 0.48, t);
        const a = arrive * lerp(0.4, 1, clamp(pp, 0, 1)) * fade;
        if (vis(b.el, a)) {
          st(b.el, "transform", tr(x, y, d, s));
          const bodyA = 1 - sstep(tF0 + 0.12, tF0 + 0.42, t);
          const nameA = 1 - sstep(tF0 - 0.05, tF0 + 0.2, t);
          st(b.el, "boxShadow", `0 0 0 1.5px rgba(140,200,255,${((0.36 + 0.5 * glint) * bodyA).toFixed(3)}), 0 24px 70px rgba(0,0,0,${(0.65 * bodyA).toFixed(3)}), 0 0 ${(30 * glint).toFixed(0)}px rgba(150,220,255,${(0.5 * glint).toFixed(2)})`);
          st(b.el, "background", `linear-gradient(180deg, rgba(20,27,43,${bodyA.toFixed(3)}) 0%, rgba(12,17,28,${bodyA.toFixed(3)}) 100%)`);
          st(b.nm, "opacity", nameA.toFixed(3));
          if (b.sb) {
            const adA = sstep(0, 0.12, inv(tRip0, tRip1, t) - 0.05);
            st(b.sb, "opacity", ((1 - adA) * nameA).toFixed(3));
            if (b.ad) { txt(b.ad, OT.scramble("", b.adr, inv(tRip0 + 0.1, tRip0 + 0.45, t), t, 17)); st(b.ad, "opacity", (adA * nameA).toFixed(3)); }
          }
          if (b.bt) st(b.bt, "opacity", (1 - sstep(tF1 - 0.12, tF1 + 0.05, t)).toFixed(3));
        }
      });

      // the stub
      {
        const p = spring(t, tStubIn, 14, 0.5);
        const u = E.cubicInOut(inv(tF0 + 0.05, tF0 + 0.62, t));
        const a = live ? sstep(tStubIn, tStubIn + 0.12, t) * (1 - sstep(tF0 + 0.2, tF0 + 0.5, t)) : 0;
        if (vis(stub.el, a)) {
          const x = lerp(STUB[0], 1220, u), y = lerp(STUB[1], 700, u);
          st(stub.el, "transform", tr(x, y, DB - 0.5, clamp(p, 0, 1.2) * lerp(1, 0.45, u)));
          const g = pulse(t, tFill2 + 0.05, 3);
          st(stub.el, "boxShadow", `0 0 0 1.5px rgba(150,220,255,${(0.45 + 0.5 * g).toFixed(2)}), 0 24px 70px rgba(0,0,0,.65), 0 0 ${(14 + 30 * g).toFixed(0)}px rgba(150,220,255,${(0.2 + 0.5 * g).toFixed(2)})`);
        }
      }

      // libc, far away, fed by threads from unseen programs
      {
        const lib = sstep(T.clib - 0.25, T.library + 0.35, t);
        const base = arrive * lerp(0.34, 1, lib) * lerp(1, 0.7, sstep(T.program + 1.2, T.program + 2.5, t)) * lerp(1, 0.8, sstep(tF0, tF1, t)) * (1 - gone);
        if (vis(lglow, base * 0.9)) st(lglow, "transform", tr(LIBC.x, LIBC.y, LDEP[2] + 40));
        llay.forEach((L) => { if (vis(L.el, base)) st(L.el, "transform", tr(LIBC.x, LIBC.y, L.d)); });
        const pg = Math.max(lib * (1 - sstep(T.program + 0.8, T.program + 2.2, t)), pulse(t, T.puts2, 1.5) * 0.4, 0.55 * win(t, tDash0, tDash1 + 0.4, 0.2, 0.6));
        st(putsEl.e, "color", mixc([215, 240, 255], [255, 255, 255], pg));
        st(putsEl.e, "opacity", lerp(0.62, 1, pg).toFixed(3));
        st(putsEl.e, "textShadow", pg > 0.02 ? `0 0 ${(44 * pg).toFixed(0)}px rgba(191,232,255,${(0.95 * pg).toFixed(2)})` : "none");
        st(putsEl.e, "transform", `translate(-50%, -50%) scale(${(1 + 0.3 * pg).toFixed(3)})`);
        const shared = sstep(T.shared - 0.2, T.shared + 0.4, t) * (1 - sstep(T.program + 1.4, T.program + 2.6, t));
        const thA = arrive * lerp(0.4, 1, Math.max(lib * 0.7, shared)) * lerp(1, 0.6, sstep(tF0, tF1, t)) * (1 - gone);
        if (vis(lthr, thA)) {
          st(lthr, "transform", tr(LIBC.x, LIBC.y, LDEP[2] + 20));
          // a steady inward drift plus extra distance travelled while "shared by every program" is spoken
          const extra = 0.5 * clamp(t - (T.shared - 0.2), 0, T.program + 2.6 - (T.shared - 0.2));
          lpulses.forEach((pl, i) => {
            const off = -((((t * 0.1 + extra + LTH[i]) % 1) + 1) % 1) * 1000;
            sa(pl, "stroke-dashoffset", off.toFixed(1));
            sa(pl, "opacity", (0.45 + 0.55 * shared).toFixed(3));
          });
        }
      }

      // ripple band
      {
        const a = live ? win(t, tRip0, tRip1, 0.12, 0.3) : 0;
        if (vis(band, a)) st(band, "transform", tr(lerp(430, 1520, E.sineInOut(inv(tRip0, tRip1, t))), 650, DB - 3));
      }

      // bedrock threads: .Lstr note → string, hole → stub, stub → libc (dashed, stops short)
      vis(pThr, live ? 1 : 0);
      {
        // A: hole 1 to its travelling note
        const u = E.cubicInOut(inv(tFillA, tFillB, t));
        const aA = live && t >= tFillA ? 1 - sstep(tFillB + 0.05, tFillB + 0.35, t) : 0;
        if (aA > 0.002) {
          const [gx, gy] = W(o, -576, 105 - 40);
          const ex = lerp(h1x, gx, u), ey = lerp(h1y, gy - 70 * SB * 1.3, u);
          const retract = E.cubicIn(inv(tFillB - 0.02, tFillB + 0.2, t));
          const sx2 = lerp(h1x, ex, retract), sy2 = lerp(h1y, ey, retract);
          sa(thrA, "d", `M${f2(sx2)} ${f2(sy2)} Q${f2((sx2 + ex) / 2)} ${f2(Math.max(sy2, ey) + 20)} ${f2(ex)} ${f2(ey)}`);
          sa(thrA, "opacity", aA.toFixed(3));
        } else sa(thrA, "opacity", "0");
        // B: hole 2 to the stub (solid, grows)
        const gB = E.cubicOut(inv(tStubIn + 0.05, tFill2, t));
        const aB = live ? sstep(tStubIn, tStubIn + 0.05, t) * (1 - sstep(tF0 + 0.1, tF0 + 0.45, t)) : 0;
        sa(thrB, "d", `M${f2(h2x)} ${f2(h2y)} C${f2(h2x)} ${f2(h2y + 62)}, ${f2(STUB[0] - 170)} ${f2(STUB[1] + 70)}, ${f2(STUB[0] - 116)} ${f2(STUB[1] + 6)}`);
        sa(thrB, "stroke-dasharray", "1 1");
        sa(thrB, "stroke-dashoffset", (1 - gB).toFixed(4));
        sa(thrB, "opacity", aB.toFixed(3));
        // C: the dashed thread to libc, connected only at launch
        const aC = live ? sstep(tDash0, tDash0 + 0.1, t) * (1 - gone) : 0;
        sa(thrC, "d", `M${f2(dashO[0])} ${f2(dashO[1])} L${f2(dashE[0])} ${f2(dashE[1])}`);
        sa(thrC, "opacity", aC.toFixed(3));
        sa(thrC, "stroke-dashoffset", f2(-t * 26));
        const ring = 1 + 0.5 * pulse(t, T.launch, 3) * Math.abs(Math.sin((t - T.launch) * 9));
        sa(thrE, "cx", f2(dashE[0])); sa(thrE, "cy", f2(dashE[1]));
        sa(thrE, "r", (7 * ring).toFixed(2));
        sa(thrE, "opacity", (aC * sstep(0.15, 0.3, dashF)).toFixed(3));
      }

      // ---------------- the slab: fused, stamped, opened to full size, then left alone (baton 4)
      {
        const a = live ? sstep(tF0 + 0.4, tF1 - 0.1, t) : 0;
        const done = t >= tGrow1 + 0.05;
        vis(pSlab, a);
        if (done) {
          // exact baton: no extra transform / opacity / clip on the component
          ["opacity", "transform"].forEach((k) => st(slab.el, k, ""));
          st(slab.el, "visibility", "visible");
          [sName, sMagic, sKind, sBytes, sSize, sHdr].forEach((e) => { st(e, "opacity", ""); st(e, "transform", ""); st(e, "clipPath", ""); st(e, "transformOrigin", ""); });
          txt(sSize, "16 KB"); txt(sName, "hello");
        } else if (a > 0.002) {
          st(slab.el, "visibility", "visible");
          st(slab.el, "opacity", a.toFixed(3));
          st(slab.el, "transform", "");
          st(sHdr, "opacity", "1");
          st(sName, "opacity", sstep(tF1 - 0.12, tF1 + 0.06, t).toFixed(3));
          txt(sName, "hello");
          const stamp = E.expoOut(inv(T.exec - 0.04, T.exec + 0.4, t));
          st(sMagic, "opacity", sstep(T.exec - 0.06, T.exec + 0.02, t).toFixed(3));
          st(sMagic, "transform", `scale(${lerp(1.9, 1, stamp).toFixed(4)})`);
          st(sMagic, "transformOrigin", "0% 50%");
          st(sKind, "opacity", sstep(T.exec + 0.1, T.exec + 0.5, t).toFixed(3));
          st(sBytes, "opacity", sstep(tF1 - 0.1, tF1 + 0.15, t).toFixed(3));
          const g = E.cubicInOut(inv(tGrow0, tGrow1, t));
          st(sBytes, "clipPath", `inset(${f2(60 * (1 - g))}px 0px ${f2(150 * (1 - g))}px 0px)`);
          const kb = Math.round(lerp(2, 16, E.cubicOut(inv(tGrow0, tGrow1 - 0.05, t))));
          txt(sSize, kb + " KB");
          st(sSize, "opacity", sstep(tGrow0 - 0.15, tGrow0 + 0.05, t).toFixed(3));
          st(sSize, "transform", "");
          st(sHdr, "transform", ""); st(sName, "transform", ""); st(sKind, "transform", "");
          st(sHdr, "clipPath", ""); st(sName, "clipPath", ""); st(sMagic, "clipPath", ""); st(sKind, "clipPath", ""); st(sSize, "clipPath", "");
        } else {
          st(slab.el, "visibility", "hidden");
        }
      }
    });
  },
});
