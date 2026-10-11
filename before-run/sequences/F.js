/* F — One keystroke · s23 s24 s25 s26 s27 (STORYBOARD § d F).
 *
 * The page types itself up to `printf("` and the gold caret waits for the H. We fall from it to the keyboard, where the
 * H is only a position (key 11); the report `02 00 0B …` waits until it is polled, then rises floor by floor, changing
 * name each time (0B → 11 → 35 → 42 + 35 → H), and drops into the line as the gold H. The line re-colours (the lexer);
 * under the translucent paper clangd has already parsed it (lens #1); the code is half-compiled again and again. Then the
 * H is drawn: the real glyph outline, its pixels, the frame, one refresh; fingertip to photons; the rest rains in.
 *
 *   entry (baton 4): OT.C.editor(ctx.plane(0)) blank — typed(0), lines(1), caretAfter(0, t) ink, chrome(0), hover(0),
 *                    fold(0), pointer hidden; camera {960, 640, 0}; ground #efeae0; motes dust; no hero.
 *   exit  (baton 5): the complete hello.c — typed(70), lines(5), caretAfter(70, t) ink, chrome(0), hover(0), pointer
 *                    hidden; camera exits at {960, 640, 0}; ground #efeae0; motes dust; nothing else.
 *
 * Geometry: depth = abstraction. Page 0 · clangd 160 (just under the paper) · user space 1600 · membrane 2000 ·
 * kernel 3200 · keyboard 4800. The camera only ever moves in z between rests centred on (960, 640) (except the push
 * into the H), so at every rest the plane at eff 0 maps 1:1 onto the screen. Things the story CARRIES across a move
 * (the dashed H, the report, the two events) ride in ctx.screen during the move and live on their plane at the rests:
 * the plane copy and the screen copy draw the same picture at the switch instant.
 * Facts only from STORYBOARD § c: report 02 00 0B 00 00 00 00 00, hid_keyboard[11] = 35 (the only row shown),
 * KEY_LEFTSHIFT 42, KEY_H 35, wl_keyboard.key, clang AST node kinds, glibc's printf declaration, JetBrains Mono's H. */
OT.sequence({
  id: "F",
  build(ctx) {
    const { clamp, lerp, inv, sstep, tw, E } = OT;
    const { t0, t1 } = ctx;
    const at = (b, w, n) => ctx.at(b, w, n), end = (b, w, n) => ctx.end(b, w, n);

    // ---------------- beats (every time from a word) ----------------
    const T = {
      keystroke: at("s23", "keystroke:"), H: at("s23", "H"), keyboard: at("s23", "keyboard"),
      reports: at("s23", "reports"), positions: at("s23", "positions:"), shift: at("s23", "shift,"), eleven: at("s23", "eleven."),
      waits: at("s23", "waits"), polls: at("s23", "polls"), thousand: at("s23", "thousand"), second: at("s23", "second."),
      turns: at("s24", "turns"), events: at("s24", "events:"), f42: at("s24", "forty-two,"), f35: at("s24", "thirty-five."),
      hands: at("s24", "hands"), window: at("s24", "window"), and: at("s24", "and"), layout: at("s24", "layout"),
      decide: at("s24", "decide:"), capital: at("s24", "capital"),
      inserts: at("s25", "inserts"), recolors: at("s25", "re-colors"), lexer: at("s25", "lexer,"), keystroke2: end("s25", "keystroke."),
      meanwhile: at("s25", "Meanwhile"), clangd: at("s25", "clang-D"), front: at("s25", "front"), printf: at("s25", "print-F"),
      typingIt: end("s25", "it.", 3),                     // "it" also in "inserts it", "how it knows"
      click: at("s26", "click"), runEnd: end("s26", "Run,"), half: at("s26", "half-compiled"), nobody: at("s26", "Nobody"),
      H2: at("s27", "H"), drawn: at("s27", "drawn:"), curves: at("s27", "curves"), filled: at("s27", "filled"),
      blended: at("s27", "blended"), frame: at("s27", "frame,"), next: at("s27", "next"),
      fingertip: at("s27", "Fingertip"), photons: end("s27", "photons:"), ms: end("s27", "milliseconds."),
      eighty: at("s27", "eighty"), timesEnd: end("s27", "times."),
    };
    // derived
    T.type0 = T.keystroke + 0.06; T.type1 = T.type0 + 0.8;               // the first 42 characters type themselves
    T.dive0 = T.keyboard; T.dive1 = T.dive0 + 1.9;                        // M dive: paper → plum → navy → silicon (1.9 s: integration speed cap)
    T.dis0 = T.dive1 + 0.05; T.dis1 = T.dive1 + 0.6;                      // the dashed H dissolves on the cap
    T.r1a = T.second + 0.45; T.r1b = T.r1a + 1.3;                         // M rise 1: keyboard → kernel
    T.look0 = Math.max(T.r1b + 0.12, T.turns - 0.05); T.look1 = T.look0 + 0.45;   // 0B → row 11 → 35
    T.r2a = T.f35 + 0.75; T.r2b = T.r2a + 1.3;                            // M rise 2: kernel → user space
    T.r3a = T.and - 0.06; T.r3b = T.r3a + 1.35;                           // M rise 3: user space → the page
    T.drop0 = T.capital; T.drop1 = T.capital + 0.48;                      // the H drops into the line
    T.km1 = T.drop1 + 0.65;                                               // the keymap is gone
    T.push0 = T.H2 - 0.25; T.push1 = T.drawn + 0.55;                      // M push into the H
    T.whip0 = T.blended - 0.1; T.whip1 = T.frame - 0.15;                  // M whip out to the desktop
    T.pb0 = T.ms + 0.05; T.pb1 = Math.min(T.eighty - 0.08, T.pb0 + 1.45); // M push back into the page
    T.rain0 = T.pb1 + 0.05; T.rain1 = Math.min(t1 - 0.32, T.timesEnd - 0.15);
    T.ink = Math.min(T.rain1 + 0.22, t1 - 0.08);                          // the caret has turned ink (blinks again)
    OT._F = T;

    // ---------------- depths & page geometry ----------------
    const D_KEY = 4800, D_KERN = 3200, D_MEM = 2000, D_USER = 1600, D_CLANGD = 160;
    const MAG = 10, D_HZ = 1000 * (1 - 1 / MAG);                         // push into the H: scale 10
    const CW = 27.6, FU = 46 / 1000;
    const colX = (col) => 520 + (col - 1) * CW;                           // left edge of a 1-based column
    const BASE2 = 330 + 2 * 72 + 52;                                       // baseline of line 3: Chrome rounds it to whole px (measured on the `"`)
    const HCELL = { x: colX(13), y: 330 + 2 * 72 };                       // the H's char box (left, line top)
    const H_C = { x: HCELL.x + 300 * FU, y: BASE2 - 365 * FU };           // the H's visual centre (865.0, 509.7)
    const GOLD_P = "#a26a05", GOLD_D = "#ffc54d", INK = "#1e1d1a";

    // JetBrains Mono Regular 'H' (assets/fonts/JetBrainsMono-400.woff2, glyf, default wght 400): 12 corners, no curves
    const H_PATH = "M93 0V730H183V418H417V730H507V0H417V336H183V0Z";
    const H_PTS = [[93, 0], [93, 730], [183, 730], [183, 418], [417, 418], [417, 730], [507, 730], [507, 0], [417, 0], [417, 336], [183, 336], [183, 0]];

    // ---------------- styles ----------------
    ctx.el("style", "", document.head, `
      .sF-abs { position:absolute; left:0; top:0; }
      .sF-svg { position:absolute; left:0; top:0; overflow:visible; }
      .sF-lbl { position:absolute; left:0; top:0; font:22px/1 "JetBrains Mono",monospace; white-space:pre; }
      .sF-byte { position:absolute; left:0; top:0; width:58px; height:58px; border-radius:6px; border:2px solid rgba(255,200,140,.45);
        font:700 26px/54px "JetBrains Mono",monospace; text-align:center; color:#ffe2bf; }
      .sF-rframe { position:absolute; left:0; top:0; width:548px; height:86px; border-radius:14px; border:2px solid rgba(255,200,140,.3); }
      .sF-pulse { position:absolute; left:0; top:0; width:548px; height:86px; border-radius:14px; border:2px solid rgba(143,224,255,.6); }
      .sF-tok { position:absolute; left:0; top:0; border:2px solid transparent; border-radius:10px; font-family:"JetBrains Mono",monospace; white-space:pre; overflow:hidden; }
      .sF-tok .nm { position:absolute; left:20px; top:0; font-size:26px; }
      .sF-tok .nu { position:absolute; right:0; top:0; font-weight:700; text-align:center; }
      .sF-fly { position:absolute; left:0; top:0; font:700 26px/1 "JetBrains Mono",monospace; white-space:pre; }
      .sF-col { position:absolute; left:0; top:0; width:160px; height:42px; border-radius:6px; border:2px solid rgba(143,224,255,.28); background:rgba(143,224,255,.04); }
      .sF-km { position:absolute; left:0; top:0; width:72px; height:66px; border:2px solid #d8d1c3; font:42px/62px "JetBrains Mono",monospace; text-align:center; color:#3b3a35; }
      .sF-hfly { position:absolute; left:0; top:0; font:46px/72px "JetBrains Mono",monospace; color:#a26a05; white-space:pre; transform-origin:13.8px 36px; }
      .sF-pop { position:absolute; left:0; top:0; padding:14px 26px 18px; border-radius:12px; background:#f6f2ea; border:2px solid #d8d1c3;
        box-shadow:0 14px 36px rgba(40,30,15,.13); font-family:"JetBrains Mono",monospace; white-space:pre; }
      .sF-pop .a { font-size:34px; font-weight:700; color:#1e1d1a; line-height:46px; }
      .sF-pop .b { font-size:24px; color:#3b3a35; line-height:34px; margin-top:4px; }
      .sF-pop .k { color:#a2462b; } .sF-pop .f { color:#1e1d1a; font-weight:700; } .sF-pop .p { color:#7a756b; }
      .sF-ast { position:absolute; left:0; top:0; font:28px/1 "JetBrains Mono",monospace; white-space:pre; color:#fff3df; }
      .sF-ast .g { color:rgba(255,214,160,.5); } .sF-ast .k { font-weight:700; } .sF-ast .v { color:rgba(255,243,223,.62); }
      .sF-pool { position:absolute; left:0; top:0; border-radius:50%; }
      .sF-tb { position:absolute; left:0; top:0; height:62px; border-radius:6px; }
      .sF-hair { position:absolute; left:0; top:0; width:2px; height:70px; background:#7a756b; }
      .sF-scan { position:absolute; left:0; top:0; width:4900px; height:200px; }
      .sF-ov { position:absolute; left:0; top:0; transform-origin:50% 50%; }
      .sF-ov canvas, .sF-ov svg { position:absolute; left:0; top:0; }
      .sF-dot { position:absolute; left:0; top:0; width:12px; height:12px; margin:-6px 0 0 -6px; border-radius:50%; background:#ffc54d; box-shadow:0 0 12px rgba(255,190,70,.8); }
    `);

    // ---------------- helpers ----------------
    const S = (e, k, v) => { if (e.style[k] !== v) e.style[k] = v; };
    const A = (e, k, v) => { const s = String(v); if (e.getAttribute(k) !== s) e.setAttribute(k, s); };
    const txt = (e, v) => { if (e.textContent !== v) e.textContent = v; };
    const bump = (t, a, d) => { const u = (t - a) / d; return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u); };
    const flare = (t, a, k = 2.4) => (t < a - 0.06 ? 0 : t < a ? sstep(a - 0.06, a, t) : Math.exp(-(t - a) * k));
    const qb = (p0, p1, p2, u) => ({ x: (1 - u) * (1 - u) * p0.x + 2 * u * (1 - u) * p1.x + u * u * p2.x, y: (1 - u) * (1 - u) * p0.y + 2 * u * (1 - u) * p1.y + u * u * p2.y });
    const cb = (p, u) => { const v = 1 - u; return { x: v * v * v * p[0].x + 3 * v * v * u * p[1].x + 3 * v * u * u * p[2].x + u * u * u * p[3].x, y: v * v * v * p[0].y + 3 * v * v * u * p[1].y + 3 * v * u * u * p[2].y + u * u * u * p[3].y }; };
    const mix4 = (a, b, u) => [0, 1, 2, 3].map((j) => (j < 3 ? Math.round(lerp(a[j], b[j], clamp(u))) : +lerp(a[j] ?? 1, b[j] ?? 1, clamp(u)).toFixed(3)));
    const rgba = (c) => `rgba(${c[0]},${c[1]},${c[2]},${c[3] ?? 1})`;
    const nearA = (eff, n0 = 360, n1 = 640) => 1 - sstep(n0, n1, eff);   // gone by scale 2.8: nearer planes streak (integration speed audit)
    const farA = (eff, f0 = -1400, f1 = -500) => sstep(f0, f1, eff);
    // a glyph box = the page's char cell (27.6 × 60.72 px = advance × (ascent + descent)), font units inside
    const glyphBox = (parent, o) => {
      const e = ctx.el("div", "sF-abs", parent);
      e.innerHTML = `<svg width="27.6" height="60.72" viewBox="0 -1020 600 1320" class="sF-svg"><path d="${H_PATH}" transform="scale(1,-1)" fill="${o.fill || "none"}" stroke="${o.stroke || "none"}" stroke-width="${o.sw || 0}" stroke-dasharray="${o.dash || "none"}" stroke-linejoin="round"/></svg>`;
      return { el: e, path: e.querySelector("path") };
    };

    // ================= planes (DOM order = paint order of coplanar planes) =================
    const keyP = ctx.plane(D_KEY);
    const kernP = ctx.plane(D_KERN);
    const memP = ctx.plane(D_MEM);
    const userP = ctx.plane(D_USER);
    const clangP = ctx.plane(D_CLANGD);
    const deskP = ctx.plane(0);
    const twinsP = ctx.plane(0);
    const edP = ctx.plane(0);
    const ed = OT.C.editor(edP);                                           // batons 4 and 5
    const fxP = ctx.plane(0);                                              // things on the page, above the editor
    const SCR = ctx.screen;

    // ================= the keyboard (silicon) =================
    const KU = 86, KG = 8, KX = 960 - 7.5 * KU, KY = 446;
    const ROWS = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
      [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25], [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75], [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25]];
    const KEYS = [];
    ROWS.forEach((row, r) => { let off = 0; row.forEach((w, i) => { KEYS.push({ r, i, x: KX + off * KU + KG / 2, y: KY + r * KU + KG / 2, w: w * KU - KG, h: KU - KG }); off += w; }); });
    const kH = KEYS.find((k) => k.r === 2 && k.i === 6), kSh = KEYS.find((k) => k.r === 3 && k.i === 0);
    const capC = (k) => ({ x: k.x + k.w / 2, y: k.y + k.h / 2 });
    {
      let s = `<svg class="sF-svg" width="1920" height="1080">`;
      s += `<path d="M 960 344 L 960 ${KY - 26}" stroke="rgba(255,140,70,.35)" stroke-width="3" fill="none"/>`;
      s += `<rect x="${KX - 26}" y="${KY - 26}" width="${15 * KU + 52}" height="${5 * KU + 52}" rx="30" fill="#140604" stroke="rgba(255,130,70,.22)" stroke-width="2"/>`;
      KEYS.forEach((k, j) => {
        s += `<g class="kc" data-j="${j}"><rect class="cap" x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}" rx="10" fill="#260c06" stroke="rgba(255,150,90,.32)" stroke-width="2"/>` +
          `<rect x="${k.x + 7}" y="${k.y + 5}" width="${k.w - 14}" height="${k.h - 16}" rx="7" fill="#311108"/>` +
          (k === kH ? `<text class="n11" x="${k.x + k.w / 2}" y="${k.y + k.h / 2 + 4}" text-anchor="middle" font-size="26" font-weight="700" fill="#ffe2bf" opacity="0">11</text>` : "") + `</g>`;
      });
      keyP.innerHTML = s + `</svg>`;
    }
    const capG = Array.from(keyP.querySelectorAll(".kc")), capR = capG.map((g) => g.querySelector(".cap"));
    const n11 = keyP.querySelector(".n11");
    const gH = capG[KEYS.indexOf(kH)], gSh = capG[KEYS.indexOf(kSh)];
    const fly11 = ctx.el("div", "sF-fly", keyP);                          // "11" leaves the cap and becomes 0B
    const shDot = ctx.el("div", "sF-dot", keyP);                           // shift's glint → 02

    // the report: label + frame + 8 bytes; one copy per place it can be (keyboard, screen, kernel)
    const RX0 = 700, RY0 = 271;                                            // byte i at (RX0 + 66 i, RY0), 58×58
    const byteC = (i) => ({ x: RX0 + 66 * i + 29, y: RY0 + 29 });
    const mkReport = (parent) => {
      const el = ctx.el("div", "sF-abs", parent);
      const lab = ctx.el("div", "sF-lbl", el, "report"); lab.style.transform = `translate(${RX0}px, ${RY0 - 46}px)`; lab.style.color = "rgba(255,226,196,.62)";
      const frame = ctx.el("div", "sF-rframe", el); frame.style.transform = `translate(${RX0 - 14}px, ${RY0 - 14}px)`;
      const bytes = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const b = ctx.el("div", "sF-byte", el); b.style.transform = `translate(${RX0 + 66 * i}px, ${RY0}px)`; return b; });
      return { el, lab, frame, bytes };
    };
    const repKey = mkReport(keyP), repScr = mkReport(SCR), repKern = mkReport(kernP);

    // poll pulses: report-sized frames that come down through depth from above and land on the report
    const PT = 0.38, POOL = 16;
    const pulses = [];
    {
      const a = T.polls - 0.05, tR = T.thousand + 0.45, tEnd = T.second, r0 = 2.2, r1 = 36, k = Math.log(r1 / r0) / (tR - a);
      let tt = a;
      while (tt < tEnd) { pulses.push(tt); tt += 1 / (tt < tR ? r0 * Math.exp(k * (tt - a)) : r1); }
    }
    const carrier = T.r1a - PT;                                            // the one that carries the report up
    const pulseEls = Array.from({ length: POOL }, () => ctx.el("div", "ot-free sF-pulse", ctx.root));
    const carrierEl = ctx.el("div", "ot-free sF-pulse", ctx.root);
    const arrivals = pulses.map((b) => b + PT);

    // ================= the kernel =================
    const COLX = 880, COLY = 410, ROW11 = 2;                              // rows 9..13 → row 11 is the third
    const kLab = ctx.el("div", "sF-lbl", kernP, "hid_keyboard[]"); kLab.style.transform = "translate(960px, 372px) translateX(-50%)"; kLab.style.color = "rgba(200,235,255,.72)"; kLab.style.fontSize = "24px";
    const cols = [0, 1, 2, 3, 4].map((i) => { const c = ctx.el("div", "sF-col", kernP); c.style.transform = `translate(${COLX}px, ${COLY + 46 * i}px)`; return c; });
    const R11 = { y: COLY + 46 * ROW11 + 21 };
    const idx11 = ctx.el("div", "sF-fly", kernP, "11"); idx11.style.transform = `translate(862px, ${R11.y - 13}px) translateX(-100%)`;
    const val35 = ctx.el("div", "sF-fly", kernP, "35"); val35.style.fontSize = "30px"; val35.style.transform = `translate(960px, ${R11.y - 15}px) translateX(-50%)`;
    const fly0B = ctx.el("div", "sF-fly", kernP);

    // the two events: one token each, carried kernel → user space → the page (cards → chips → keymap)
    const mkTok = (parent) => {
      const el = ctx.el("div", "sF-tok", parent);
      const nm = ctx.el("span", "nm", el), nu = ctx.el("span", "nu", el);
      return { el, nm, nu };
    };
    const TOKP = { kern: kernP, scr2: SCR, user: userP, scr3: SCR, page: fxP };
    const toks = [0, 1].map(() => { const o = {}; for (const k in TOKP) o[k] = mkTok(TOKP[k]); return o; });
    // scr2 and scr3 share ctx.screen but are distinct elements (never visible together)
    const TH = {
      byte: { bg: [0, 0, 0, 0], bd: [255, 176, 112, 0.6], nm: [200, 235, 255, 0], nu: [255, 176, 112], glow: 0.6 },
      cell: { bg: [0, 0, 0, 0], bd: [143, 224, 255, 0], nm: [200, 235, 255, 0], nu: [255, 197, 77], glow: 1 },
      kern: { bg: [9, 18, 38, 0.92], bd: [143, 224, 255, 0.55], nm: [200, 235, 255, 0.85], nu: [255, 197, 77], glow: 1 },
      user: { bg: [38, 27, 56, 0.94], bd: [255, 214, 160, 0.6], nm: [255, 243, 223, 0.85], nu: [255, 197, 77], glow: 1 },
      paper: { bg: [246, 242, 234, 1], bd: [162, 106, 5, 0.5], nm: [59, 58, 53, 1], nu: [162, 106, 5], glow: 0 },
    };
    const mixTh = (a, b, u) => ({ bg: mix4(a.bg, b.bg, u), bd: mix4(a.bd, b.bd, u), nm: mix4(a.nm, b.nm, u), nu: mix4(a.nu, b.nu, u), glow: lerp(a.glow, b.glow, clamp(u)) });
    const CARD = [{ x: 960, y: 706 }, { x: 960, y: 782 }], CARD_W = 520, CARD_H = 60, CHIP_W = 66, CHIP_H = 48, PCHIP_W = 76, PCHIP_H = 56;
    const NAMES = ["KEY_LEFTSHIFT", "KEY_H"], NUMS = ["42", "35"];

    // ================= the membrane (user ↔ kernel): A's grid =================
    const grid = ctx.el("div", "sF-abs", memP);
    grid.style.cssText += "left:-2040px;top:-1460px;width:6000px;height:4000px;background:repeating-linear-gradient(0deg, rgba(170,230,255,.45) 0 2px, transparent 2px 90px), repeating-linear-gradient(90deg, rgba(170,230,255,.45) 0 2px, transparent 2px 90px);";
    const memBloom = OT.C.bloom(memP, { size: 1100, rgb: "217,243,255" });

    // ================= user space: the compositor and the windows =================
    const GS_C = { x: 960, y: 300 }, ED_C = { x: 880, y: 730 };
    const uThread = ctx.el("div", "sF-abs", userP);
    const TH_P = [{ x: 960, y: 440 }, { x: 960, y: 530 }, { x: 880, y: 540 }, { x: 880, y: 620 }];
    uThread.innerHTML = `<svg class="sF-svg" width="1920" height="1080"><path d="M ${TH_P[0].x} ${TH_P[0].y} C ${TH_P[1].x} ${TH_P[1].y}, ${TH_P[2].x} ${TH_P[2].y}, ${TH_P[3].x} ${TH_P[3].y}" fill="none" stroke="#ffd6a0" stroke-width="3"/></svg>`;
    const uThreadP = uThread.querySelector("path");
    let TH_LEN = 0; { let p = cb(TH_P, 0); for (let i = 1; i <= 100; i++) { const q = cb(TH_P, i / 100); TH_LEN += Math.hypot(q.x - p.x, q.y - p.y); p = q; } } TH_LEN = Math.ceil(TH_LEN) + 2;
    uThreadP.style.strokeDasharray = `${TH_LEN} ${TH_LEN}`;
    const wlLab = ctx.el("div", "sF-lbl", userP, "wl_keyboard.key"); wlLab.style.transform = "translate(946px, 518px)"; wlLab.style.color = "rgba(255,243,223,.78)";
    const faint = [[540, 690, 170], [1370, 680, 170], [1250, 880, 120]].map(([x, y, sz]) => { const c = OT.C.cell(userP, { label: "", size: sz }); ctx.place(c.el, x - sz / 2, y - sz / 2, 0); return c; });
    const gsCell = OT.C.cell(userP, { label: "gnome-shell", size: 300 }); ctx.place(gsCell.el, GS_C.x - 150, GS_C.y - 150, 0);
    gsCell.lab.style.transform = "translateY(-120%)";
    const edCell = OT.C.cell(userP, { label: "editor", size: 220 }); ctx.place(edCell.el, ED_C.x - 110, ED_C.y - 110, 0);
    edCell.lab.style.transform = "translateY(10%)";
    const GS_SLOT = [{ x: 922, y: 336 }, { x: 998, y: 336 }], ED_SLOT = [{ x: 846, y: 692 }, { x: 914, y: 692 }];

    // ================= clangd, just under the paper (lens #1) =================
    const pool = ctx.el("div", "sF-pool", clangP);
    pool.style.cssText += "width:1700px;height:820px;transform:translate(110px, 330px);background:radial-gradient(closest-side, rgba(43,33,64,.96) 0%, rgba(43,33,64,.9) 50%, rgba(43,33,64,.55) 78%, rgba(43,33,64,0) 100%);";
    const cdCell = OT.C.cell(clangP, { label: "clangd", size: 230 }); ctx.place(cdCell.el, 500 - 115, 735 - 115, 0);
    const AST = [
      [0, `<span class="k">FunctionDecl</span> <span class="v">main 'int (void)'</span>`],
      [1, `<span class="g">└─</span> <span class="k">CompoundStmt</span>`],
      [2, `<span class="g">└─</span> <span class="k">CallExpr</span> <span class="v">'int'</span>`],
      [3, `<span class="g">├─</span> <span class="k">DeclRefExpr</span> <span class="v">printf</span>`],
      [3, `<span class="g">└─</span> <span class="k">StringLiteral</span>`],
    ];
    const astRows = AST.map(([ind, html], i) => { const r = ctx.el("div", "sF-ast", clangP, html); r.style.transform = `translate(${700 + ind * 50}px, ${600 + i * 52}px)`; return r; });
    const cdThread = ctx.el("div", "sF-abs", clangP);
    cdThread.innerHTML = `<svg class="sF-svg" width="1920" height="1080"><path d="M 615 700 C 650 680, 660 616, 694 614" fill="none" stroke="#ffd6a0" stroke-width="3" opacity=".7"/></svg>`;

    // ================= the desktop around the page (A's), layers that flatten into one frame =================
    const desk = OT.C.desktop(deskP, { running: ["editor"], twins: true });
    const twinRoot = ctx.el("div", "ot-desk", twinsP);
    desk.twins.forEach((w) => twinRoot.appendChild(w));

    // ================= the page: lexer layer (under the code), the half-compiled glow =================
    const pg = ed.page;
    const lexL = ctx.el("div", "sF-abs", null);
    pg.el.insertBefore(lexL, pg.code.el);
    const L3 = { top: 330 + 2 * 72 + 4 };
    const TOKS3 = [[colX(5), colX(11), [30, 29, 26, 0.09]], [colX(11), colX(12), [122, 117, 107, 0.14]], [colX(12), 1400, [162, 106, 5, 0.16]]];
    const tokBoxes = TOKS3.map(([x0, x1, c]) => {
      const b = ctx.el("div", "sF-tb", lexL); b.style.transform = `translate(${x0}px, ${L3.top}px)`; b.style.width = x1 - x0 + "px";
      b.style.background = x1 === 1400 ? `linear-gradient(90deg, ${rgba(c)} 0%, ${rgba(c)} 55%, ${rgba([c[0], c[1], c[2], 0])} 100%)` : rgba(c);
      return b;
    });
    const hairs = [colX(5), colX(11), colX(12)].map((x) => { const h = ctx.el("div", "sF-hair", lexL); h.style.transform = `translate(${x - 1}px, ${L3.top - 4}px)`; return h; });
    const sweep = ctx.el("div", "sF-hair", lexL); sweep.style.background = "linear-gradient(180deg, rgba(79,102,136,0), rgba(79,102,136,.75) 30%, rgba(79,102,136,.75) 70%, rgba(79,102,136,0))";
    const hcGlow = OT.C.bloom(pg.el, { size: 1700, rgb: "255,214,140" });
    const runGlow = OT.C.bloom(pg.el, { size: 520, rgb: "255,206,120" });

    // ================= fx on the page: dashed H, keymap, the H in flight, popup, thread, scanline, photons =================
    const photon = OT.C.bloom(fxP, { size: 340, rgb: "255,214,140" });
    const dashP = glyphBox(fxP, { stroke: GOLD_P, sw: 44, dash: "70 46", fill: "rgba(162,106,5,.10)" });
    const dashS = glyphBox(SCR, { stroke: GOLD_P, sw: 40, dash: "70 46", fill: "rgba(162,106,5,.10)" });
    const dashK = glyphBox(keyP, { stroke: GOLD_D, sw: 36, dash: "70 46", fill: "rgba(255,197,77,.10)" });
    [dashP, dashS, dashK].forEach((g) => { g.el.style.transformOrigin = "13.8px 30.13px"; });
    const DASH_PAGE = { x: HCELL.x, y: BASE2 - 46.92 };                    // glyph-box top-left on the page
    const DASH_KEY = { x: capC(kH).x - 13.8, y: capC(kH).y - 30.13 };       // centred on the h cap
    const KM = { cells: [{ x: 926, y: 587 }, { x: 996, y: 587 }], slot: [{ x: 742, y: 620 }, { x: 826, y: 620 }] };   // 42 + 35 → [h|H]
    const kmLab = ctx.el("div", "sF-lbl", fxP, "layout"); kmLab.style.transform = "translate(926px, 556px)";
    const kmArrow = ctx.el("div", "sF-lbl", fxP, "→"); kmArrow.style.transform = "translate(880px, 602px)"; kmArrow.style.fontSize = "36px"; kmArrow.style.color = "#7a756b";
    const kmCells = ["h", "H"].map((c, i) => { const e = ctx.el("div", "sF-km", fxP, c); e.style.transform = `translate(${KM.cells[i].x}px, ${KM.cells[i].y}px)`; return e; });
    kmCells[0].style.borderRadius = "10px 0 0 10px"; kmCells[1].style.borderRadius = "0 10px 10px 0";
    const hFly = ctx.el("div", "sF-hfly", fxP, "H");
    const pop = ctx.el("div", "sF-pop", fxP,
      `<div class="a">printf</div><div class="b"><span class="k">extern</span> <span class="k">int</span> <span class="f">printf</span> <span class="p">(</span><span class="k">const</span> <span class="k">char</span> <span class="p">*</span>__restrict __format<span class="p">,</span> <span class="p">...);</span></div>`);
    const POP = { x: colX(5) - 8, y: 560 };
    const thr = ctx.el("div", "sF-abs", fxP);
    const THR = [{ x: 1950, y: 1800 }, { x: 1750, y: 1250 }, { x: 1060, y: 1000 }, { x: 866, y: 534 }];
    thr.innerHTML = `<svg class="sF-svg" width="1920" height="1080"><path d="M ${THR[0].x} ${THR[0].y} C ${THR[1].x} ${THR[1].y}, ${THR[2].x} ${THR[2].y}, ${THR[3].x} ${THR[3].y}" fill="none" stroke="${GOLD_P}" stroke-width="8" stroke-linecap="round"/></svg>`;
    const thrP = thr.querySelector("path");
    let THR_LEN = 0; { let p = cb(THR, 0); for (let i = 1; i <= 200; i++) { const q = cb(THR, i / 200); THR_LEN += Math.hypot(q.x - p.x, q.y - p.y); p = q; } }
    thrP.style.strokeDasharray = `${THR_LEN.toFixed(1)} ${THR_LEN.toFixed(1)}`;
    const scan = ctx.el("div", "sF-scan", fxP);
    scan.style.background = "linear-gradient(180deg, rgba(255,251,242,0) 0%, rgba(255,251,242,.18) 70%, rgba(255,253,248,.95) 96%, rgba(255,255,255,1) 97.5%, rgba(255,253,248,.6) 99%, rgba(255,251,242,0) 100%)";

    // ================= the H, drawn: a screen-space loupe that follows the page's H (crisp at the rest) =================
    const OWp = 34, OHp = 52;                                              // page px around the H's centre
    const OW = OWp * MAG, OH = OHp * MAG;
    const ov = ctx.el("div", "sF-ov", SCR); ov.style.width = OW + "px"; ov.style.height = OH + "px";
    const GX0 = Math.floor(H_C.x - OWp / 2), GY0 = Math.floor(H_C.y - OHp / 2) + 2, GXN = 30, GYN = 44;   // pixel grid (page px)
    const can = ctx.el("canvas", "", ov); can.width = OW; can.height = OH;
    const g2d = can.getContext("2d");
    const vx0 = H_C.x - OWp / 2, vy0 = H_C.y - OHp / 2;
    const toO = (px, py) => ({ x: (px - vx0) * MAG, y: (py - vy0) * MAG });   // page px → overlay px (at the rest)
    const gpt = ([X, Y]) => toO(HCELL.x + X * FU, BASE2 - Y * FU);
    {
      const pts = H_PTS.map(gpt);
      const d = "M " + pts.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" L ") + " Z";
      let s = `<svg width="${OW}" height="${OH}" viewBox="0 0 ${OW} ${OH}">`;
      s += `<defs><radialGradient id="sF-gfade" cx="50%" cy="50%" r="55%"><stop offset="60%" stop-color="#fff"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
        `<mask id="sF-gmask"><rect width="${OW}" height="${OH}" fill="url(#sF-gfade)"/></mask></defs>`;
      let gl = "";
      for (let i = 0; i <= GXN; i++) { const x = toO(GX0 + i, 0).x; gl += `M ${x.toFixed(1)} ${toO(0, GY0).y.toFixed(1)} V ${toO(0, GY0 + GYN).y.toFixed(1)} `; }
      for (let j = 0; j <= GYN; j++) { const y = toO(0, GY0 + j).y; gl += `M ${toO(GX0, 0).x.toFixed(1)} ${y.toFixed(1)} H ${toO(GX0 + GXN, 0).x.toFixed(1)} `; }
      s += `<path class="grid" d="${gl}" stroke="rgba(30,29,26,.2)" stroke-width="1" fill="none" mask="url(#sF-gmask)"/>`;
      s += `<path class="hfill" d="${d}" fill="${GOLD_P}"/>`;
      s += `<path class="hline" d="${d}" fill="none" stroke="${GOLD_P}" stroke-width="3" stroke-linejoin="miter"/>`;
      pts.forEach((p) => { s += `<circle class="hdot" cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="7" fill="${GOLD_P}" stroke="#efeae0" stroke-width="3"/>`; });
      ov.insertAdjacentHTML("beforeend", s + `</svg>`);
    }
    const ovGrid = ov.querySelector(".grid"), ovFill = ov.querySelector(".hfill"), ovLine = ov.querySelector(".hline"), ovDots = Array.from(ov.querySelectorAll(".hdot"));
    let OL_LEN = 0; { const pts = H_PTS.map(gpt); for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; OL_LEN += Math.hypot(b.x - a.x, b.y - a.y); } }
    ovLine.style.strokeDasharray = `${OL_LEN.toFixed(1)} ${OL_LEN.toFixed(1)}`;
    // coverage of every page pixel by the real outline (16×16 supersampling, even-odd), computed once
    const poly = H_PTS.map(([X, Y]) => [HCELL.x + X * FU, BASE2 - Y * FU]);
    const inside = (x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
    const COV = [];
    for (let j = 0; j < GYN; j++) for (let i = 0; i < GXN; i++) {
      let n = 0; for (let sy = 0; sy < 16; sy++) for (let sx = 0; sx < 16; sx++) if (inside(GX0 + i + (sx + 0.5) / 16, GY0 + j + (sy + 0.5) / 16)) n++;
      if (n) COV.push({ i, j, c: n / 256 });
    }
    const PAPER_RGB = [239, 234, 224], GOLD_RGB = [162, 106, 5];

    // ================= camera, ground, motes =================
    const P0 = { x: 960, y: 640, z: 0 }, HZ = { x: H_C.x, y: H_C.y, z: D_HZ }, DESKV = { x: 960, y: 640, z: -1500 };
    ctx.cam([
      [t0, P0], [T.dive0, P0],
      [T.dive1, { x: 960, y: 640, z: D_KEY, ease: "smoother" }], [T.r1a, { x: 960, y: 640, z: D_KEY }],
      [T.r1b, { x: 960, y: 640, z: D_KERN, ease: "quintInOut" }], [T.r2a, { x: 960, y: 640, z: D_KERN }],
      [T.r2b, { x: 960, y: 640, z: D_USER, ease: "cubicInOut" }], [T.r3a, { x: 960, y: 640, z: D_USER }],
      [T.r3b, { ...P0, ease: "cubicInOut" }], [T.push0, P0],
      [T.push1, { ...HZ, ease: "quintInOut" }], [T.whip0, HZ],
      [T.whip1, { ...DESKV, ease: "expoInOut" }], [T.pb0, DESKV],
      [T.pb1, { ...P0, ease: "quintInOut" }], [t1, P0],
    ]);
    ctx.exit({ x: 960, y: 640, z: 0 });
    // when an eased camera segment passes depth z (so ground changes follow the strata, not the clock)
    const segAt = (tA, tB, zA, zB, ease, z) => { let a = 0, b = 1; const up = zB > zA; for (let k = 0; k < 40; k++) { const m = (a + b) / 2, zm = lerp(zA, zB, E[ease](m)); if (up ? zm < z : zm > z) a = m; else b = m; } return lerp(tA, tB, (a + b) / 2); };
    const diveAt = (z) => segAt(T.dive0, T.dive1, 0, D_KEY, "smoother", z);
    const r3At = (z) => segAt(T.r3a, T.r3b, D_USER, 0, "cubicInOut", z);
    const PAPER = "#efeae0", WALL = "#e2dacb", PLUM = "#2b2140", NAVY = "#070c1c", SIL = "#210904";
    ctx.ground([
      [t0, PAPER], [diveAt(360), PAPER], [diveAt(640), PLUM],   // in step with the page's near fade (no flat grey frame) [diveAt(2500), NAVY], [diveAt(3800), "#0e0507"], [T.dive1, SIL],
      [T.r1a, SIL], [T.r1b, NAVY], [T.r2a, NAVY], [T.r2b, PLUM], [T.r3a, PLUM], [r3At(640), PLUM], [r3At(360), PAPER],   // in step with the page arriving
      [T.whip0 + 0.5, PAPER], [T.whip1 - 0.2, WALL], [T.pb0, WALL], [T.pb1, PAPER], [t1, PAPER],
    ]);
    ctx.motes([[t0, "dust"], [diveAt(1500), "spores"], [diveAt(2600), "sparks"], [diveAt(3900), "embers"],
      [T.r1a + 0.6, "sparks"], [T.r2a + 0.6, "spores"], [T.r3a + 0.95, "dust"]]);
    ctx.margins(0, 0);

    // ================= lens #1: under the translucent paper, clangd =================
    ctx.focus([
      [T.clangd - 0.25, null], [T.clangd + 0.45, D_CLANGD], [T.printf - 0.3, D_CLANGD], [T.printf + 0.25, 0],
      [T.printf + 0.9, 0], [T.typingIt + 0.15, null],
    ], { aperture: 34, max: 12 });

    // ---------------- token (event) state, frame coordinates (= plane coords at every rest) ----------------
    const tokState = (k, t) => {
      let ph = t < T.r1b ? null : t < T.r2a ? "kern" : t < T.r2b ? "scr2" : t < T.r3a ? "user" : t < T.r3b ? "scr3" : t < T.km1 ? "page" : null;
      if (!ph) return null;
      const st = { ph, x: 0, y: 0, w: CARD_W, h: CARD_H, num: NUMS[k], numS: 36, nameA: 1, numW: 100, th: TH.kern, fl: 0, a: 1 };
      const fa = k === 0 ? flare(t, T.f42, 2.0) : flare(t, T.f35, 2.0);
      if (ph === "kern") {
        const a = k === 0 ? T.events - 0.45 : T.events - 0.3, b = a + 0.6;
        if (t < a) return null;
        const u = tw(a, b, t, "cubicInOut"), m = sstep(0.35, 1, u);
        const from = k === 0 ? byteC(0) : { x: 960, y: R11.y }, via = k === 0 ? { x: 610, y: 560 } : { x: 1140, y: 640 };
        const p = qb(from, via, CARD[k], u);
        st.x = p.x; st.y = p.y;
        st.w = lerp(k === 0 ? 58 : 70, CARD_W, m); st.h = lerp(k === 0 ? 58 : 40, CARD_H, m);
        st.numW = lerp(st.w, 100, m); st.numS = lerp(k === 0 ? 26 : 30, 36, u);
        st.num = k === 0 ? (u < 0.5 ? "02" : OT.scramble("02", "42", inv(0.5, 0.85, u), t, 5)) : "35";
        st.nameA = sstep(0.7, 1, u); st.th = mixTh(k === 0 ? TH.byte : TH.cell, TH.kern, sstep(0.2, 0.9, u)); st.fl = fa;
      } else if (ph === "scr2") {
        const u = E.cubicInOut(inv(T.r2a, T.r2b, t)), m = sstep(0.04, 0.5, u);   // rides with rise 2
        st.x = lerp(CARD[k].x, GS_SLOT[k].x, u); st.y = lerp(CARD[k].y, GS_SLOT[k].y, u);
        st.w = lerp(CARD_W, CHIP_W, m); st.h = lerp(CARD_H, CHIP_H, m); st.numW = lerp(100, CHIP_W, m); st.numS = lerp(36, 30, m);
        st.nameA = 1 - sstep(0, 0.25, u); st.th = mixTh(TH.kern, TH.user, sstep(0.3, 0.9, u)); st.fl = fa * (1 - u);
      } else if (ph === "user") {
        const a = T.hands + 0.05 + k * 0.14, b = T.window - 0.05 + k * 0.14, u = tw(a, b, t, "cubicInOut");
        let p;
        if (u < 0.18) p = { x: lerp(GS_SLOT[k].x, TH_P[0].x, u / 0.18), y: lerp(GS_SLOT[k].y, TH_P[0].y, u / 0.18) };
        else if (u < 0.82) p = cb(TH_P, (u - 0.18) / 0.64);
        else p = { x: lerp(TH_P[3].x, ED_SLOT[k].x, (u - 0.82) / 0.18), y: lerp(TH_P[3].y, ED_SLOT[k].y, (u - 0.82) / 0.18) };
        Object.assign(st, { x: p.x, y: p.y, w: CHIP_W, h: CHIP_H, numW: CHIP_W, numS: 30, nameA: 0, th: TH.user });
      } else if (ph === "scr3") {
        const u = E.cubicInOut(inv(T.r3a, T.r3b, t));                     // rides with rise 3
        const g = sstep(0.4, 1, u);
        Object.assign(st, { x: lerp(ED_SLOT[k].x, KM.slot[k].x, u), y: lerp(ED_SLOT[k].y, KM.slot[k].y, u), w: lerp(CHIP_W, PCHIP_W, g), h: lerp(CHIP_H, PCHIP_H, g), numW: lerp(CHIP_W, PCHIP_W, g), numS: lerp(30, 34, g), nameA: 0, th: mixTh(TH.user, TH.paper, sstep(0.55, 0.92, u)) });
      } else {
        Object.assign(st, { x: KM.slot[k].x, y: KM.slot[k].y, w: PCHIP_W, h: PCHIP_H, numW: PCHIP_W, numS: 34, nameA: 0, th: TH.paper });
        st.a = 1 - sstep(T.drop1 + 0.05, T.km1, t);
        st.fl = k === 0 ? 0.8 * flare(t, T.decide, 1.6) : 0;                // shift chooses the column
      }
      return st;
    };
    const paintTok = (tk, st, name) => {
      const th = st.th, fl = st.fl || 0;
      S(tk.el, "transform", `translate3d(${(st.x - st.w / 2).toFixed(2)}px, ${(st.y - st.h / 2).toFixed(2)}px, 0px)`);
      S(tk.el, "width", st.w.toFixed(2) + "px"); S(tk.el, "height", st.h.toFixed(2) + "px");
      S(tk.el, "background", rgba(th.bg)); S(tk.el, "borderColor", rgba(th.bd));
      S(tk.el, "opacity", st.a.toFixed(3));
      S(tk.el, "boxShadow", fl > 0.02 ? `0 0 ${(24 * fl).toFixed(1)}px rgba(255,190,70,${(0.45 * fl).toFixed(3)})` : "none");
      txt(tk.nm, name); S(tk.nm, "opacity", st.nameA.toFixed(3)); S(tk.nm, "color", rgba(th.nm)); S(tk.nm, "lineHeight", (st.h - 4).toFixed(2) + "px");
      txt(tk.nu, st.num); S(tk.nu, "width", st.numW.toFixed(2) + "px"); S(tk.nu, "fontSize", st.numS.toFixed(2) + "px"); S(tk.nu, "lineHeight", (st.h - 4).toFixed(2) + "px");
      S(tk.nu, "color", rgba([...th.nu.slice(0, 3), 1]));
      const g = th.glow * (0.55 + 0.45 * fl);
      S(tk.nu, "textShadow", g > 0.02 ? `0 0 ${(12 + 16 * fl).toFixed(1)}px rgba(255,190,70,${(0.55 * g + 0.3 * fl).toFixed(3)})` : "none");
    };

    // ---------------- report state ----------------
    const paintReport = (R, t, dim) => {
      const a = sstep(T.reports - 0.15, T.reports + 0.35, t);
      S(R.el, "opacity", (a * dim).toFixed(3));
      const has02 = t >= T.shift + 0.33, has0B = t >= T.eleven + 0.45;
      // waiting: the frame breathes; polls glint on it as they land; the carrier lights it gold
      let gl = 0; for (let i = arrivals.length - 1; i >= 0; i--) { const d = t - arrivals[i]; if (d >= 0) { gl = Math.max(gl, Math.exp(-d * 10)); if (d > 0.5) break; } }
      const breathe = t > T.waits - 0.2 && t < T.polls ? 0.5 + 0.5 * Math.sin(((t - T.waits) / 1.15) * Math.PI * 2 - Math.PI / 2) : 0;
      const carry = sstep(T.r1a - 0.06, T.r1a, t) * (1 - sstep(T.r1b, T.r1b + 0.6, t));
      S(R.frame, "borderColor", carry > 0.01 ? `rgba(255,197,77,${(0.3 + 0.6 * carry).toFixed(3)})` : `rgba(${gl > 0.02 ? "190,235,255" : "255,200,140"},${(0.3 + 0.25 * breathe + 0.5 * gl).toFixed(3)})`);
      S(R.frame, "boxShadow", carry > 0.01 ? `0 0 ${(26 * carry).toFixed(1)}px rgba(255,190,70,${(0.4 * carry).toFixed(3)})` : breathe > 0.01 ? `0 0 ${(18 * breathe).toFixed(1)}px rgba(255,170,90,${(0.2 * breathe).toFixed(3)})` : "none");
      R.bytes.forEach((b, i) => {
        const v = i === 0 && has02 ? "02" : i === 2 && has0B ? "0B" : "00";
        txt(b, v);
        const lit = v !== "00", gold = v === "0B";
        const fx = gold ? flare(t, T.eleven + 0.45, 2.5) : lit ? flare(t, T.shift + 0.33, 2.5) : 0;
        S(b, "color", gold ? GOLD_D : lit ? "#ffb070" : "rgba(255,226,191,.42)");
        S(b, "borderColor", gold ? "rgba(255,197,77,.9)" : lit ? "rgba(255,176,112,.75)" : "rgba(255,200,140,.32)");
        S(b, "textShadow", gold ? `0 0 ${(12 + 14 * fx).toFixed(1)}px rgba(255,190,70,${(0.6 + 0.3 * fx).toFixed(3)})` : lit ? "0 0 10px rgba(255,150,80,.45)" : "none");
        S(b, "boxShadow", gold ? `0 0 ${(14 + 16 * fx).toFixed(1)}px rgba(255,190,70,${(0.35 + 0.35 * fx).toFixed(3)})` : "none");
      });
    };

    // ---------------- the page's characters, typed / pulsing / raining ----------------
    const chars = ed.chars;                                                 // 70, A's typing order; chars[42] = the H
    const HCH = chars[42];
    const rainL = (k) => lerp(T.rain0 + 0.12, T.rain1, (k - 43) / 26);    // landing time of char k (43..69)
    const PULSES = [];                                                      // half-compiled: a dozen, quickening
    { let p = T.half - 0.02, k = 0; while (p < T.nobody - 0.15 && k < 14) { PULSES.push([p, Math.min(0.2, 0.8 * 0.42 * Math.pow(0.86, k))]); p += 0.42 * Math.pow(0.86, k); k++; } }

    // ================= render =================
    ctx.render((t) => {
      const on = t >= t0 && t < t1;
      const cam = ctx.camAt(t);
      const eff = (d) => cam.z - d;

      // ---------- planes: visibility by depth and story ----------
      const pageA = !on ? 0 : t >= T.push0 ? 1 : nearA(eff(0));
      ctx.show(edP, pageA);
      ctx.show(fxP, pageA);
      const keyA = on && t >= T.dive0 && t < T.r2a ? farA(eff(D_KEY)) * nearA(eff(D_KEY)) : 0;
      ctx.show(keyP, keyA);
      const diving = t >= T.dive0 && t < T.dive1;
      const kernA = !on ? 0 : diving ? 0.5 * farA(eff(D_KERN)) * nearA(eff(D_KERN)) : t >= T.r1a && t < T.r3a ? farA(eff(D_KERN), -1100, -400) * nearA(eff(D_KERN)) : 0;
      ctx.show(kernP, kernA);
      const memA = !on ? 0 : diving ? 0.55 * farA(eff(D_MEM), -1600, -600) * nearA(eff(D_MEM), 380, 640) :
        t >= T.r2a && t < T.r3b ? 0.6 * farA(eff(D_MEM), -520, 200) * nearA(eff(D_MEM), 380, 640) : 0;
      ctx.show(memP, memA);
      const userA = !on ? 0 : diving ? 0.5 * farA(eff(D_USER)) * nearA(eff(D_USER)) : t >= T.r2a && t < T.push0 ? farA(eff(D_USER), -1100, -400) * nearA(eff(D_USER)) : 0;
      ctx.show(userP, userA);
      const clA = on ? sstep(T.meanwhile + 0.1, T.clangd + 0.2, t) * (1 - sstep(T.printf + 0.6, T.typingIt - 0.2, t)) : 0;
      ctx.show(clangP, clA);
      const deskA = on && t >= T.whip0 + 0.25 && t < T.pb1 ? 1 : 0;
      ctx.show(deskP, deskA); ctx.show(twinsP, deskA);

      // ---------- the editor (batons 4 and 5 live here) ----------
      ed.chrome(sstep(T.whip0 + 0.45, T.whip1 - 0.1, t) * (1 - sstep(T.pb0 + 0.1, T.pb1 - 0.15, t)));
      ed.hover(sstep(T.click - 0.1, T.runEnd, t) * (1 - sstep(T.runEnd + 0.75, T.runEnd + 1.25, t)));
      ed.fold(0); ed.pointerAt(1328, 262, 0);
      // typed count: 0 → 42 fast, the H at 43, the rain to 70
      let nT = t < T.type0 ? 0 : t < T.type1 ? 42 * inv(T.type0, T.type1, t) : 42;
      if (t >= T.drop1) nT = 43;
      let landed = 0;
      if (t >= T.rain0) { for (let k = 43; k < 70; k++) if (t >= rainL(k) - 0.13) landed = k + 1; nT = Math.max(43, landed); }
      if (t >= T.rain1 + 0.02) nT = 70;
      ed.typed(nT);
      const sx = lerp(colX(5) - 14, 1410, tw(T.recolors - 0.05, T.recolors + 0.65, t, "cubicInOut"));   // the lexer sweep
      // per-character overrides (every frame, so the batons stay exact)
      chars.forEach((c, k) => {
        let tf = "", op = null, fw = "", flt = "";
        // half-compiled: a ripple of tiny lifts, quickening
        if (t >= T.half - 0.1 && t < T.nobody && k < 43) {
          let lift = 0; const dl = ((c.col - 1) / 30 + c.li * 0.15) * 0.1;
          for (const [p, d] of PULSES) lift = Math.max(lift, bump(t, p + dl, d));
          if (lift > 0.001) tf = `translate(0px, ${(-2.6 * lift).toFixed(2)}px)`;
        }
        // the rain
        if (k >= 43 && t >= T.rain0 && t < T.rain1 + 0.02) {
          const u = inv(rainL(k) - 0.13, rainL(k), t);
          if (u > 0 && u < 1) { tf = `translate(0px, ${(-30 * (1 - E.quadIn(u))).toFixed(2)}px)`; op = sstep(0, 0.45, u); }
        }
        if (k === 42) {
          // the H arrives as the protagonist (bold) and is inserted as plain text when the lexer passes
          if (t >= T.drop1 && t < T.recolors + 1 && sx < HCELL.x + 14) fw = "700";
          if (t >= T.push1 - 0.05 && t < T.whip0 + 0.5) op = 1 - sstep(T.push1 - 0.05, T.push1 + 0.15, t) * (1 - sstep(T.whip0 + 0.1, T.whip0 + 0.5, t));
          const ph = flare(t, T.photons - 0.1, 1.6);
          if (ph > 0.01 && t < T.pb1) flt = `drop-shadow(0 0 ${(4 + 8 * ph).toFixed(1)}px rgba(255,190,70,${(0.85 * ph).toFixed(3)}))`;
        }
        if (k < 42 && t >= T.push0 && t < T.whip1) op = (op ?? 1) * (1 - 0.7 * sstep(T.push0 + 0.4, T.push1, t) * (1 - sstep(T.whip0 + 0.2, T.whip0 + 1.0, t)));
        S(c.el, "transform", tf); S(c.el, "fontWeight", fw); S(c.el, "filter", flt);
        if (op != null) S(c.el, "opacity", clamp(op).toFixed(3));
      });
      // line numbers arrive with their lines
      const lnA = (o) => (nT > o ? 1 : 0);
      ed.lines(1 + lnA(18) + lnA(34) + (landed > 60 || nT >= 70 ? 1 : 0) + (landed > 69 || nT >= 70 ? 1 : 0));
      // the caret: ink (baton) → gold while the H is followed → ink when the file is complete
      if (t < T.keystroke - 0.05 || t >= T.ink) ed.caretAfter(Math.floor(nT), t);
      else {
        const solid = (t >= T.type0 && t < T.type1 + 0.05) || (t >= T.rain0 && t < T.ink);
        const gold = OT.rgb(OT.mix([30, 29, 26], [162, 106, 5], sstep(T.keystroke - 0.05, T.keystroke + 0.1, t) * (1 - sstep(T.rain1 + 0.02, T.ink, t))));
        ed.caretAfter(Math.floor(nT), t, { color: gold, solid });
        if (t >= T.push0 && t < T.whip0 + 0.6) S(ed.caretEl, "opacity", (1 - sstep(T.push0, T.push0 + 0.25, t)).toFixed(3));
      }
      const lensPaper = t >= T.meanwhile && t < T.typingIt + 0.2 ? sstep(T.meanwhile + 0.1, T.clangd + 0.2, t) * (1 - sstep(T.printf + 0.3, T.typingIt - 0.2, t)) : 0;
      S(pg.rule, "opacity", lensPaper > 0 ? (1 - 0.75 * lensPaper).toFixed(3) : "");
      S(ed.win, "opacity", t >= T.meanwhile && t < T.typingIt + 0.2 ? (1 - 0.7 * sstep(T.meanwhile + 0.1, T.clangd + 0.2, t) * (1 - sstep(T.printf + 0.3, T.typingIt - 0.2, t))).toFixed(3) : "");

      // ---------- the lexer pass (s25): a sweep re-colours line 3; then its token boundaries ----------
      ctx.show(lexL, on && t >= T.recolors - 0.1 && t < T.keystroke2 + 0.2 ? 1 : 0);
      S(sweep, "transform", `translate(${sx.toFixed(1)}px, ${L3.top - 4}px)`);
      S(sweep, "opacity", (sstep(T.recolors - 0.1, T.recolors, t) * (1 - sstep(T.recolors + 0.55, T.recolors + 0.75, t))).toFixed(3));
      tokBoxes.forEach((b, i) => {
        const x0 = TOKS3[i][0];
        S(b, "opacity", (sstep(x0, x0 + 40, sx) * (1 - sstep(T.lexer + 0.4, T.keystroke2, t))).toFixed(3));
      });
      hairs.forEach((h, i) => S(h, "opacity", (0.75 * bump(t, T.lexer - 0.12 + i * 0.05, 1.1)).toFixed(3)));

      // ---------- "click Run": the pill answers (A's hover) with a warm local light behind it ----------
      const rg = sstep(T.click - 0.15, T.click + 0.2, t) * (1 - sstep(T.runEnd + 0.6, T.runEnd + 1.3, t));
      ctx.show(runGlow, on ? rg : 0); S(runGlow, "opacity", (0.75 * rg).toFixed(3)); S(runGlow, "transform", "translate3d(1325px, 276px, 0px)");

      // ---------- the half-compiled glow, under the code ----------
      let hg = 0; if (t >= T.half - 0.1 && t < T.nobody + 0.3) for (const [p, d] of PULSES) hg = Math.max(hg, bump(t, p, d * 1.3));
      S(hcGlow, "opacity", (0.3 * hg).toFixed(3)); S(hcGlow, "transform", "translate3d(960px, 520px, 0px)");

      // ---------- the dashed H: waits at the caret, rides the dive, dissolves on the cap ----------
      const dshA = sstep(T.H - 0.1, T.H + 0.15, t);
      const dph = t < T.H - 0.1 ? null : t < T.dive0 ? "page" : t < T.dive1 ? "scr" : t < T.dis1 ? "key" : null;
      const du = E.smoother(inv(T.dive0, T.dive1, t));          // rides with the dive
      ctx.show(dashP.el, on && dph === "page" ? dshA : 0);
      S(dashP.el, "transform", `translate3d(${DASH_PAGE.x}px, ${DASH_PAGE.y.toFixed(2)}px, 0px)`);
      ctx.show(dashS.el, on && dph === "scr" ? 1 : 0);
      S(dashS.el, "transform", `translate3d(${lerp(DASH_PAGE.x, DASH_KEY.x, du).toFixed(2)}px, ${lerp(DASH_PAGE.y, DASH_KEY.y, du).toFixed(2)}px, 0px) scale(${lerp(1, 1.3, du).toFixed(4)})`);
      A(dashS.path, "stroke", OT.rgb(OT.mix([162, 106, 5], [255, 197, 77], sstep(0.25, 0.7, du))));
      S(dashS.path, "filter", du > 0.5 ? `drop-shadow(0 0 ${(10 * sstep(0.5, 1, du)).toFixed(1)}px rgba(255,190,70,.7))` : "none");
      const dis = inv(T.dis0, T.dis1, t);
      ctx.show(dashK.el, on && dph === "key" ? 1 - E.cubicIn(dis) : 0);
      S(dashK.el, "transform", `translate3d(${DASH_KEY.x.toFixed(2)}px, ${DASH_KEY.y.toFixed(2)}px, 0px) scale(${lerp(1.3, 1.6, E.cubicOut(dis)).toFixed(4)})`);
      S(dashK.path, "filter", "drop-shadow(0 0 10px rgba(255,190,70,.7))");

      // ---------- the keyboard: blank caps; positions; shift + key 11 ----------
      if (keyA > 0) {
        const lit = sstep(T.dive1 - 0.35, T.dive1 + 0.15, t) * (1 - 0.45 * sstep(T.dis1, T.positions - 0.2, t));
        KEYS.forEach((k, j) => {
          const tg = T.positions - 0.12 + k.r * 0.07 + ((k.x - KX) / (15 * KU)) * 0.28;
          const gl = bump(t, tg, 0.42);
          const pressed = (k === kSh && t >= T.shift - 0.04 && t < T.r1a + 0.4) || (k === kH && t >= T.eleven - 0.04 && t < T.r1a + 0.4);
          if (pressed) {
            const p = sstep(k === kSh ? T.shift - 0.04 : T.eleven - 0.04, (k === kSh ? T.shift : T.eleven) + 0.06, t);
            A(capR[j], "stroke", `rgba(255,197,77,${(0.45 + 0.5 * p).toFixed(3)})`); A(capR[j], "stroke-width", "3");
            A(capR[j], "fill", OT.rgb(OT.mix([38, 12, 6], [74, 42, 8], p)));
            A(capG[j], "transform", `translate(0 ${(3 * p).toFixed(2)})`);
            S(capG[j], "filter", p > 0.02 ? `drop-shadow(0 0 ${(14 * p).toFixed(1)}px rgba(255,190,70,${(0.6 * p).toFixed(3)}))` : "none");
          } else {
            A(capR[j], "stroke", `rgba(255,${Math.round(150 + 60 * gl)},${Math.round(90 + 60 * gl)},${(0.3 + 0.4 * lit + 0.6 * gl).toFixed(3)})`); A(capR[j], "stroke-width", "2");
            A(capR[j], "fill", OT.rgb(OT.mix([38, 12, 6], [86, 34, 14], gl))); A(capG[j], "transform", "translate(0 0)"); S(capG[j], "filter", "none");
          }
        });
        const pH = t >= T.eleven - 0.04 && t < T.r1a + 0.4;
        A(n11, "opacity", sstep(T.positions + 0.05, T.positions + 0.35, t).toFixed(3));
        A(n11, "fill", pH ? GOLD_D : "#ffe2bf");
        S(n11, "filter", pH ? "drop-shadow(0 0 8px rgba(255,190,70,.8))" : "none");
        // 11 leaves the cap and lands in the report as 0B; shift's glint becomes 02
        const fu = tw(T.eleven + 0.02, T.eleven + 0.45, t, "cubicInOut");
        const fp = qb(capC(kH), { x: 1010, y: 470 }, byteC(2), fu);
        ctx.show(fly11, fu > 0 && fu < 1 ? 1 : 0);
        txt(fly11, fu < 0.6 ? "11" : OT.scramble("11", "0B", inv(0.6, 0.95, fu), t, 2));
        S(fly11, "transform", `translate3d(${fp.x.toFixed(1)}px, ${fp.y.toFixed(1)}px, 0px) translate(-50%, -50%)`);
        S(fly11, "color", GOLD_D); S(fly11, "textShadow", "0 0 14px rgba(255,190,70,.75)");
        const su = tw(T.shift - 0.02, T.shift + 0.33, t, "cubicInOut");
        const sp = qb(capC(kSh), { x: 430, y: 330 }, byteC(0), su);
        ctx.show(shDot, su > 0 && su < 1 ? 1 : 0);
        S(shDot, "transform", `translate3d(${sp.x.toFixed(1)}px, ${sp.y.toFixed(1)}px, 0px)`);
        S(shDot, "background", "#ffb070"); S(shDot, "boxShadow", "0 0 14px rgba(255,150,80,.9)");
      }

      // ---------- the report: keyboard → (carried) → kernel ----------
      const rph = t < T.reports - 0.15 ? null : t < T.r1a ? "key" : t < T.r1b ? "scr" : t < T.r2b ? "kern" : null;
      const rdim = 1 - 0.6 * sstep(T.look1, T.look1 + 0.5, t);
      ctx.show(repKey.el, rph === "key" ? 1 : 0); ctx.show(repScr.el, on && rph === "scr" ? 1 : 0); ctx.show(repKern.el, rph === "kern" ? 1 : 0);
      if (rph) paintReport(rph === "key" ? repKey : rph === "scr" ? repScr : repKern, t, rph === "kern" ? rdim : 1);
      // poll pulses (world elements between the camera and the report)
      pulseEls.forEach((e, j) => {
        let b = null; for (let i = j; i < pulses.length; i += POOL) if (t >= pulses[i] && t < pulses[i] + PT) b = pulses[i];
        if (b == null || !on) { ctx.show(e, 0); return; }
        const p = (t - b) / PT, d = D_KEY - 760 * (1 - E.cubicOut(p));
        ctx.place(e, RX0 - 14, RY0 - 14, d);
        ctx.show(e, (0.6 * sstep(0, 0.3, p) * (1 - sstep(0.88, 1, p))) * keyA);
      });
      {
        const p = (t - carrier) / PT;
        if (on && p > 0 && p < 1) {
          ctx.place(carrierEl, RX0 - 14, RY0 - 14, D_KEY - 760 * (1 - E.cubicOut(p)));
          ctx.show(carrierEl, 0.85 * sstep(0, 0.3, p) * (1 - sstep(0.9, 1, p)) * keyA);
          S(carrierEl, "borderColor", "rgba(255,214,140,.9)"); S(carrierEl, "boxShadow", "0 0 18px rgba(255,190,70,.45)");
        } else ctx.show(carrierEl, 0);
      }

      // ---------- the kernel: 0B → hid_keyboard[11] = 35; the events KEY_LEFTSHIFT 42, KEY_H 35 ----------
      if (kernA > 0) {
        const ghost = diving;
        const tdim = 1 - 0.5 * sstep(T.events + 0.3, T.events + 0.9, t);
        const rowLit = ghost ? 0 : sstep(T.look1 - 0.05, T.look1 + 0.15, t);
        cols.forEach((c, i) => {
          const hi = i === ROW11 ? rowLit : 0;
          S(c, "borderColor", `rgba(143,224,255,${((0.28 + 0.6 * hi) * (ghost ? 1 : tdim)).toFixed(3)})`);
          S(c, "background", `rgba(143,224,255,${(0.04 + 0.1 * hi).toFixed(3)})`);
          S(c, "boxShadow", hi > 0.02 ? `0 0 ${(22 * hi).toFixed(1)}px rgba(120,210,255,${(0.3 * hi * tdim).toFixed(3)})` : "none");
        });
        S(kLab, "opacity", ghost ? "0.6" : (tdim).toFixed(3));
        const fu = tw(T.look0, T.look0 + 0.45, t, "cubicInOut");
        const fp = qb(byteC(2), { x: 780, y: 410 }, { x: 838, y: R11.y }, fu);
        ctx.show(fly0B, !ghost && fu > 0 && fu < 1 ? 1 : 0);
        txt(fly0B, fu < 0.55 ? "0B" : OT.scramble("0B", "11", inv(0.55, 0.9, fu), t, 4));
        S(fly0B, "transform", `translate3d(${fp.x.toFixed(1)}px, ${fp.y.toFixed(1)}px, 0px) translate(-50%, -50%)`);
        S(fly0B, "color", GOLD_D); S(fly0B, "textShadow", "0 0 14px rgba(255,190,70,.75)");
        const ix = ghost ? 0 : sstep(T.look0 + 0.42, T.look0 + 0.5, t);
        ctx.show(idx11, ix * tdim);
        S(idx11, "color", GOLD_D); S(idx11, "textShadow", "0 0 12px rgba(255,190,70,.6)");
        ctx.show(val35, ghost ? 0 : 1);
        S(val35, "color", OT.rgb(OT.mix([110, 150, 175], [255, 197, 77], rowLit)));
        S(val35, "opacity", ((0.55 + 0.45 * rowLit) * (1 - 0.55 * sstep(T.events - 0.3, T.events + 0.2, t))).toFixed(3));
        S(val35, "textShadow", rowLit > 0.02 ? `0 0 ${(14 * rowLit).toFixed(1)}px rgba(255,190,70,${(0.6 * rowLit).toFixed(3)})` : "none");
      }

      // ---------- the two events: kernel cards → (carried) chips → gnome-shell → the window → (carried) → keymap ----------
      for (let k = 0; k < 2; k++) {
        const st = on ? tokState(k, t) : null;
        for (const ph in TOKP) {
          const tk = toks[k][ph];
          const vis = st && st.ph === ph;
          ctx.show(tk.el, vis ? 1 : 0);
          if (vis) paintTok(tk, st, NAMES[k]);
        }
      }

      // ---------- the membrane: crossed on the way up (a cool ring where we pass) ----------
      if (memA > 0) {
        const me = eff(D_MEM);                                             // the ring shows while the grid passes scale 2 → 1
        S(memBloom, "opacity", (t >= T.r2a && t < T.r3a ? 0.32 * sstep(520, 260, me) * sstep(-260, 80, me) : 0).toFixed(3));
        S(memBloom, "transform", "translate3d(960px, 600px, 0px)");
      }

      // ---------- user space: the compositor catches them and hands them to the window ----------
      if (userA > 0) {
        const ghost = diving;
        const catchF = ghost ? 0 : flare(t, T.r2b, 2.2);
        S(gsCell.el, "boxShadow", `inset 0 0 0 ${(2 + 2 * catchF).toFixed(1)}px rgba(255,214,160,${(0.55 + 0.4 * catchF).toFixed(3)}), 0 0 ${(60 + 40 * catchF).toFixed(0)}px rgba(255,190,110,${(0.22 + 0.3 * catchF).toFixed(3)})`);
        S(gsCell.el, "opacity", ghost ? "0.6" : "1");
        const tu = ghost ? 0 : tw(T.hands - 0.15, T.hands + 0.4, t, "cubicOut");
        uThreadP.style.strokeDashoffset = (TH_LEN * (1 - tu)).toFixed(1);
        A(uThreadP, "opacity", tu > 0 ? 1 : 0);
        S(wlLab, "opacity", (ghost ? 0 : sstep(T.hands + 0.05, T.hands + 0.35, t)).toFixed(3));
        const wl = ghost ? 0 : sstep(T.window - 0.1, T.window + 0.25, t);
        S(edCell.el, "boxShadow", `inset 0 0 0 ${(2 + 2 * wl).toFixed(1)}px rgba(255,214,160,${(0.45 + 0.5 * wl).toFixed(3)}), 0 0 ${(40 + 70 * wl).toFixed(0)}px rgba(255,190,110,${(0.12 + 0.4 * wl).toFixed(3)})`);
        S(edCell.el, "opacity", (ghost ? 0.5 : 0.55 + 0.45 * wl).toFixed(3));
        faint.forEach((c) => S(c.el, "opacity", ghost ? "0.4" : (0.38 * (1 - 0.35 * wl)).toFixed(3)));
      }

      // ---------- the keymap on the page: 42 + 35 → H (the layout decides) ----------
      const kmA = on && t >= T.r3a ? sstep(lerp(T.r3a, T.r3b, 0.7), T.r3b + 0.1, t) * (1 - sstep(T.drop1 + 0.05, T.km1, t)) : 0;
      [kmArrow, ...kmCells].forEach((e) => ctx.show(e, kmA));
      ctx.show(kmLab, kmA * (1 - sstep(T.drop0 - 0.05, T.drop0 + 0.12, t)));
      const lay = flare(t, T.layout - 0.05, 1.8), dec = sstep(T.decide - 0.05, T.decide + 0.2, t);
      kmCells.forEach((e, i) => {
        S(e, "borderColor", OT.rgb(OT.mix([216, 209, 195], [122, 117, 107], lay)));
        S(e, "background", i === 1 && dec > 0 ? `rgba(162,106,5,${(0.13 * dec).toFixed(3)})` : "transparent");
        S(e, "color", i === 1 ? OT.rgb(OT.mix([59, 58, 53], [162, 106, 5], dec), 1 - sstep(T.drop0, T.drop0 + 0.06, t)) : `rgba(59,58,53,${(1 - 0.6 * dec).toFixed(3)})`);
        S(e, "fontWeight", i === 1 && dec > 0.5 ? "700" : "400");
      });
      S(kmLab, "color", OT.rgb(OT.mix([154, 147, 132], [59, 58, 53], lay)));
      // the H leaves the keymap and drops into the line
      const hu = tw(T.drop0, T.drop1, t, "cubicInOut");
      const hp = qb({ x: KM.cells[1].x + 36 - 13.8, y: KM.cells[1].y + 33 - 36 }, { x: 1040, y: 452 }, { x: HCELL.x, y: HCELL.y }, hu);
      ctx.show(hFly, on && t >= T.drop0 && t < T.drop1 ? 1 : 0);
      S(hFly, "transform", `translate3d(${hp.x.toFixed(2)}px, ${hp.y.toFixed(2)}px, 0px) scale(${lerp(42 / 46, 1, hu).toFixed(4)})`);
      S(hFly, "fontWeight", "700");
      const landF = flare(t, T.drop1, 2.5);
      ctx.show(photon, on && ((t >= T.drop1 - 0.06 && t < T.drop1 + 1.6) || (t >= T.photons - 0.3 && t < T.pb0 + 0.3)) ? 1 : 0);
      const phF = flare(t, T.photons - 0.1, 1.4);
      S(photon, "opacity", (t < T.drop1 + 1.6 ? 0.55 * landF : 0.75 * phF).toFixed(3));
      S(photon, "transform", `translate3d(${H_C.x.toFixed(1)}px, ${H_C.y.toFixed(1)}px, 0px) scale(${(t < T.drop1 + 1.6 ? lerp(0.6, 1, 1 - landF) : lerp(0.8, 1.6, 1 - phF)).toFixed(4)})`);

      // ---------- the completion popup: clangd knows printf ----------
      const popA = on ? sstep(T.printf - 0.05, T.printf + 0.2, t) * (1 - sstep(T.typingIt + 0.35, T.typingIt + 0.8, t)) : 0;
      ctx.show(pop, popA);
      S(pop, "transform", `translate3d(${POP.x}px, ${(POP.y + 8 * (1 - E.cubicOut(inv(T.printf - 0.05, T.printf + 0.25, t)))).toFixed(2)}px, 0px)`);

      // ---------- clangd under the paper: the AST forms ----------
      if (clA > 0) {
        astRows.forEach((r, i) => {
          const ta = T.clangd + 0.25 + i * 0.42;
          S(r, "opacity", ((i === 4 ? 0.5 : 1) * sstep(ta, ta + 0.25, t)).toFixed(3));
        });
        S(cdCell.el, "boxShadow", `inset 0 0 0 2px rgba(255,214,160,.6), 0 0 ${(60 + 30 * bump(t, T.front - 0.3, 1.4)).toFixed(0)}px rgba(255,190,110,.3)`);
      }

      // ---------- the H, drawn: outline, corners, pixels (a loupe that follows the page's H) ----------
      const ovA = on && t >= T.push1 - 0.06 && t < T.whip0 + 0.6 ? sstep(T.push1 - 0.06, T.push1 + 0.12, t) * (1 - sstep(T.whip0 + 0.1, T.whip0 + 0.55, t)) : 0;
      ctx.show(ov, ovA);
      if (ovA > 0) {
        const pr = ctx.project(H_C.x, H_C.y, 0, t), k = pr.s / MAG;
        S(ov, "transform", `translate(${(pr.x - OW / 2).toFixed(2)}px, ${(pr.y - OH / 2).toFixed(2)}px) scale(${k.toFixed(5)})`);
        const cur = sstep(T.curves - 0.15, T.curves + 0.35, t);
        const pix = tw(T.filled - 0.05, T.filled + 0.8, t, "lin");
        A(ovFill, "opacity", (1 - 0.72 * cur - 0.28 * sstep(0.1, 0.5, pix)).toFixed(3));
        ovLine.style.strokeDashoffset = (OL_LEN * (1 - tw(T.curves - 0.15, T.curves + 0.75, t, "cubicInOut"))).toFixed(1);
        A(ovLine, "opacity", cur > 0 ? (1 - 0.35 * sstep(0.6, 1, pix)).toFixed(3) : 0);
        ovDots.forEach((dt, i) => {
          const da = sstep(T.curves + 0.1 + i * 0.06, T.curves + 0.22 + i * 0.06, t);
          A(dt, "opacity", (da * (1 - 0.45 * sstep(0.6, 1, pix))).toFixed(3)); A(dt, "r", (7 * (0.6 + 0.4 * da)).toFixed(2));
        });
        A(ovGrid, "opacity", sstep(T.filled - 0.25, T.filled + 0.1, t).toFixed(3));
        // pixels fill scanline by scanline, coverage greys along the edges
        g2d.clearRect(0, 0, OW, OH);
        if (pix > 0) {
          const rows = pix * (GYN + 4);
          for (const q of COV) {
            const a = clamp(rows - q.j);
            if (a <= 0) continue;
            const c = OT.mix(PAPER_RGB, GOLD_RGB, q.c);
            g2d.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
            const o = toO(GX0 + q.i, GY0 + q.j);
            g2d.fillRect(o.x + 0.5, o.y + 0.5, MAG - 1, MAG - 1);
          }
        }
      } else g2d.clearRect(0, 0, OW, OH);

      // ---------- the desktop: layers stack and flatten into one frame ----------
      if (deskA > 0) {
        const sep = 1 - tw(T.blended + 0.7, T.frame + 0.1, t, "cubicInOut");
        const dW = 900 * sep, dT = 450 * sep;
        S(deskP, "transform", `translate3d(0px, 0px, ${(-dW).toFixed(2)}px)`); ctx.lens(deskP, dW);
        S(twinsP, "transform", `translate3d(0px, 0px, ${(-dT).toFixed(2)}px)`); ctx.lens(twinsP, dT);
      }

      // ---------- the next refresh: one thin scanline down the whole frame ----------
      const su = inv(T.next - 0.06, T.next + 0.62, t);
      ctx.show(scan, on && su > 0 && su < 1 ? 1 - sstep(0.9, 1, su) : 0);
      S(scan, "transform", `translate3d(-1490px, ${(lerp(-1180, 1760, su) - 194).toFixed(1)}px, 0px)`);

      // ---------- fingertip to photons: a gold thread from below up to the H ----------
      const tu2 = tw(T.fingertip - 0.15, T.photons - 0.15, t, "sineInOut");
      ctx.show(thr, on && t >= T.fingertip - 0.1 && t < T.pb0 + 0.6 ? 1 - sstep(T.pb0, T.pb0 + 0.5, t) : 0);
      thrP.style.strokeDashoffset = (THR_LEN * (1 - tu2)).toFixed(1);
    });
  },
});
