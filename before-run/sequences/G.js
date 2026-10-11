/* G — Save, and back to the button · s28 s29 s30 s31.
 *
 * The carry: the file peels off the page as a gold sheet and sinks with us through the membrane into the kernel,
 * where it becomes a dirty page in the page cache; flushed, it falls through the ext4 journal as a 4096-byte block
 * into the NVMe drive; inside the flash its bytes (48 65 6C … "Hello, world") drop into cells as gold charge. The
 * lights go out: only the charge glows, and beside it (the lamp) the kernel's own cells on the same drive. Morning:
 * the power button below lights, and ONE long rise passes everything the film built (firmware, the kernel, PID 1,
 * the membrane) up through the surface onto the desktop, where the recap plays with the camera still (packets, the
 * signed package, the editor unfolding from its icon, eighty keystrokes, one save). The camera pushes into the window
 * (A's pull-back reversed) and lands on A's opening picture; the pointer comes to rest on Run. Click.
 *
 *   entry (baton 5): OT.C.editor(ctx.plane(0)) complete — typed(70), lines(5), caretAfter(70, t) ink, chrome(0),
 *                    hover(0), pointer hidden; camera {960, 640, 0}; ground #efeae0; motes dust; no hero.
 *   end (from s31 "button." on): A's frame at t ≈ 6.0 — the same editor with hover(1) and pointerAt(1328, 262, 1).
 *   ending: OT.timing.ending = "fade" (press + warm bloom, still hold, 2 s fade) | "hello" (the click runs the saved
 *           command in the page's terminal strip and prints Hello, world!; no fade).
 *
 * Depth map (local): page/desktop 0 · PID 1 1500 · membrane 2200 · kernel name 2900 · page cache 3000 ·
 * journal 3700 · firmware 4000 · drive 4300 · flash cells + power button 5300. */
OT.sequence({
  id: "G",
  build(ctx) {
    const { t0, t1 } = ctx;
    const { clamp, lerp, inv, sstep, tw, E } = OT;
    const ENDING = OT.timing.ending === "hello" ? "hello" : "fade";
    const at = (b, w, n) => ctx.at(b, w, n), end = (b, w, n) => ctx.end(b, w, n);

    // ---------------- beats (all from words) ----------------
    const T = {
      ctrlS: at("s28", "Control-S."), editorW: at("s28", "editor"), calls: at("s28", "calls"), write: at("s28", "write,"),
      kernel: at("s28", "kernel"), done: at("s28", "done."), fib: at("s28", "fibbing:"), still: at("s28", "still"),
      page: at("s28", "page"), cache: end("s28", "cache."), seconds: at("s28", "Seconds"), later: end("s28", "later,"),
      flushed: at("s28", "flushed"), system: at("s28", "system,"), ssd: at("s28", "SSD."),
      there: at("s29", "There,"), hello: at("s29", "Hello,"), becomes: at("s29", "becomes"), charge: at("s29", "charge"),
      trapped: at("s29", "trapped"), few: at("s29", "few"), cells: at("s29", "cells."), survive: at("s29", "survive"),
      power: at("s29", "power"), off: at("s29", "off,"), same: at("s29", "same"), kern: at("s29", "kernel"),
      this: at("s29", "this"), morning: at("s29", "morning."),
      Power: at("s30", "Power."), firmware: at("s30", "Firmware."), kernel2: at("s30", "kernel."), process: at("s30", "Process"),
      desktop: at("s30", "desktop."), desktopEnd: end("s30", "desktop."), twenty: at("s30", "Seventy-seven"), packets: end("s30", "packets."),
      signed: at("s30", "signed"), pkg: at("s30", "package."), editor: at("s30", "editor."), eighty: at("s30", "Eighty"),
      keys: end("s30", "keystrokes."), one: at("s30", "one", 2), save: at("s30", "save."), just: at("s30", "just"), here: end("s30", "here."),
      cursor: at("s31", "cursor"), button: at("s31", "button."), click: at("s31", "Click."),
    };

    // ---------------- geography ----------------
    const D = { P1: 1500, MEM: 2200, KN: 2900, PC: 3000, FS: 3700, FW: 4000, DRV: 4300, CELL: 5300 };
    const Z_CLOSE = 5565, Z_NIGHT = 4967;                       // the cells plane at scale ≈1.36 / 0.75
    const PITCH = 30, CS = 24, COLS = 32;                      // flash cells (in-plane units)
    const FX = 483, FY = 508;                                  // our file's first cell; "Hello, world" = row 4
    const BTN = { x: 960, y: 1300 };                           // the power button, below the chip
    const SLOT = { x: 960, y: 600 };                           // our page in the page cache
    const BLOCK = { x: 1000, y: 619 };                         // where the block settles inside `ext4  /`
    const Y_FW = 1250, Y_KN = 1150, Y_P1 = 960;                 // the rise: the column drifts back from the button
    const PAPER = "#efeae0", WALL = "#e2dacb", PLUM = "#2b2140", NAVY = "#070c1c";
    const GOLD = [255, 197, 77], GOLD_P = [162, 106, 5];

    // ---------------- the file's real bytes (hello.c, 83 bytes) → TLC cells ----------------
    const SRC = OT.C.PAGE_CODE.join("\n") + "\n";
    const BYTES = Array.from(SRC).map((c) => c.charCodeAt(0));   // 83
    const bits = []; BYTES.forEach((b) => { for (let k = 7; k >= 0; k--) bits.push((b >> k) & 1); });
    const NCELL = Math.ceil(bits.length / 3);                     // 222
    const LEVEL = []; for (let k = 0; k < NCELL; k++) LEVEL.push(4 * (bits[3 * k] || 0) + 2 * (bits[3 * k + 1] || 0) + (bits[3 * k + 2] || 0));
    const HELLO0 = SRC.indexOf("Hello, world");                  // byte 48 → bit 384 → cell 128 = row 4, col 0
    const HEX = BYTES.slice(HELLO0, HELLO0 + 12).map((b) => b.toString(16).toUpperCase().padStart(2, "0"));
    const cellXY = (k) => ({ x: FX + (k % COLS) * PITCH, y: FY + Math.floor(k / COLS) * PITCH });
    const STRIP0 = (HELLO0 * 8) / 3;                              // 128

    // ---------------- styles ----------------
    ctx.el("style", "", document.head, `
      .sG-svg { position:absolute; left:0; top:0; overflow:visible; }
      .sG-svg text { font-family:"JetBrains Mono",monospace; }
      .sG-lbl { position:absolute; left:0; top:0; font-family:"JetBrains Mono",monospace; white-space:pre; }
      .sG-sheet { position:absolute; left:0; top:0; width:900px; height:372px; transform-origin:450px 186px; }
      .sG-sheet .bg { position:absolute; left:0; top:0; width:900px; height:372px; border-radius:14px; border-style:solid; }
      .sG-sheet .ot-code.sGx .fn { font-weight:700; }
      .sG-sheet .bar { position:absolute; left:0; top:0; height:30px; border-radius:15px; }
      .sG-sheet .hatch { position:absolute; left:0; top:0; width:900px; height:372px; border-radius:14px;
        background:repeating-linear-gradient(90deg, rgba(255,197,77,.9) 0 22px, rgba(255,197,77,.32) 22px 44px); }
      .sG-grid { position:absolute; left:-2040px; top:-1460px; width:6000px; height:4000px;
        background: repeating-linear-gradient(0deg, rgba(170,230,255,.45) 0 2px, transparent 2px 90px),
                    repeating-linear-gradient(90deg, rgba(170,230,255,.45) 0 2px, transparent 2px 90px); }
      .sG-ring { position:absolute; left:0; top:0; width:700px; height:700px; margin:-350px 0 0 -350px; border-radius:50%;
        border:4px solid rgba(217,243,255,.95); box-shadow:0 0 40px rgba(217,243,255,.75), inset 0 0 40px rgba(217,243,255,.45); }
      .sG-chip { position:absolute; left:291px; top:286px; width:2724px; height:744px; border-radius:18px; border:2px solid rgba(255,226,196,.22); }
      .sG-cells { position:absolute; left:303px; top:298px; width:2700px; height:720px; background-size:30px 30px;
        background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30'><rect x='0.75' y='0.75' width='22.5' height='22.5' rx='3' fill='none' stroke='rgb(255,226,196)' stroke-opacity='0.5' stroke-width='1.5'/></svg>"); }
      .sG-hex { position:absolute; left:0; top:0; font:700 26px/26px "JetBrains Mono",monospace; color:#ffc54d; white-space:pre;
        text-shadow:0 0 14px rgba(255,190,70,.6); transform-origin:50% 50%; }
      .sG-gold { color:#ffc54d; text-shadow:0 0 16px rgba(255,190,70,.6); font-weight:700; }
      .sG-drop { position:absolute; left:0; top:0; width:10px; height:26px; margin:-26px 0 0 -5px; border-radius:5px; background:#a26a05; }
      .sG-sat { position:absolute; left:0; top:0; border-radius:50%;
        background:radial-gradient(circle at 42% 38%, rgba(255,236,200,.5), rgba(255,196,120,.18) 55%, rgba(255,170,90,0) 74%);
        box-shadow:inset 0 0 0 3px rgba(255,214,160,.6), 0 0 50px rgba(255,190,110,.25); }
      .sG-thread { position:absolute; left:0; top:0; height:3px; background:#ffd6a0; transform-origin:0 50%; }
      .sG-dev { position:absolute; border-radius:14px; border:2.5px solid rgba(160,210,255,.55); }
      .sG-part { position:absolute; height:118px; border-radius:10px; font:28px "JetBrains Mono",monospace; display:flex; align-items:center; padding:0 26px; white-space:pre; }
    `);

    // ================= planes (DOM order = paint order at equal depth) =================
    const deskP = ctx.plane(0);                                // the desktop (recap) — behind the editor
    const edP = ctx.plane(0);                                  // the page (baton 5 and the end picture)
    const p1P = ctx.plane(D.P1), memP = ctx.plane(D.MEM), knP = ctx.plane(D.KN), pcP = ctx.plane(D.PC);
    const fsP = ctx.plane(D.FS), fwP = ctx.plane(D.FW), drvP = ctx.plane(D.DRV), cellP = ctx.plane(D.CELL);

    // ---------------- the editor (entry and end) ----------------
    const ed = OT.C.editor(edP);
    const pill = ed.pill;
    const bloom = OT.C.bloom(ed.page.el, { size: 1400 });      // B's press bloom, behind the pill, on the paper
    const drops = [];                                          // "Eighty keystrokes." — gold drops into each character
    for (let i = 0; i < ed.nChars; i++) drops.push(ctx.el("div", "sG-drop", edP));

    // ---------------- the desktop (recap) ----------------
    const desk = OT.C.desktop(deskP, { clock: "Fri Oct 9 · 9:41", running: [] });
    const MUR = OT.flow.path([[3900, 260], [2800, -330], [1600, -470], [420, -380], [-560, -170], [-1230, 60]], { curve: 0.8 });
    const mur = OT.flow(deskP, {
      res: 0.5, box: [-1500, -1000, 4100, 800],
      streams: [{ path: MUR, rate: OT.flow.rate(1900, T.twenty - 0.45, T.packets - 0.75, 0.4), speed: 3500, speedVar: 0.12,
        lateral: 190, pinch: 0.55, wander: 80, wavelength: 1400, size: 9, color: "#a26a05", alpha: 0.85, glow: 0, blend: "source-over", fade: 80, seed: 41 }],
    });
    const deb = (OT.FACTS && OT.FACTS.apt && OT.FACTS.apt.deb) || { file: "", sizeLabel: "" };
    const parcel = OT.C.parcel(ctx.root, { name: deb.file, size: deb.sizeLabel });
    parcel.el.style.transformOrigin = "300px 160px";

    // ---------------- the sheet: the file as a gold sheet → a dirty page → a block ----------------
    const sheet = ctx.el("div", "sG-sheet");
    const sheetBg = ctx.el("div", "bg", sheet);
    const sheetCode = OT.C.code(sheet, OT.C.PAGE_CODE, { lang: "c", theme: "sGx", size: 46, lh: 72 });
    sheetCode.el.style.left = "15px"; sheetCode.el.style.top = "12px";
    const bars = OT.C.PAGE_CODE.map((ln, i) => {
      const lead = ln.length - ln.trimStart().length;
      const b = ctx.el("div", "bar", sheet);
      b.style.left = 15 + lead * 27.6 + "px"; b.style.top = 12 + i * 72 + 21 + "px"; b.style.width = (ln.length - lead) * 27.6 + "px";
      return b;
    });
    const hatch = ctx.el("div", "hatch", sheet);
    const SHEET_C = { x: 955, y: 504 };                        // the sheet's centre when it lies on the code
    const placeSheet = (cx, cy, d, k, extra = "") => ctx.place(sheet, cx - 450, cy - 186, d, `scale(${k.toFixed(4)})${extra}`);

    // ---------------- membrane ----------------
    memP.innerHTML = `<div class="sG-grid"></div>`;
    const ring = ctx.el("div", "sG-ring", memP);

    // ---------------- kernel: the page cache ----------------
    const PC = { cols: 7, rows: 5, w: 220, h: 90, gx: 26, gy: 26 };
    const pcX0 = SLOT.x - 3 * (PC.w + PC.gx) - PC.w / 2, pcY0 = SLOT.y - 2 * (PC.h + PC.gy) - PC.h / 2;
    {
      const r = OT.rng(28);
      let s = `<svg class="sG-svg" width="1920" height="1080">`;
      for (let row = 0; row < PC.rows; row++) for (let col = 0; col < PC.cols; col++) {
        if (col === 3 && row <= 2) continue;                   // the label slot and our slot are drawn separately
        const x = pcX0 + col * (PC.w + PC.gx), y = pcY0 + row * (PC.h + PC.gy);
        s += `<rect x="${x}" y="${y}" width="${PC.w}" height="${PC.h}" rx="8" fill="rgba(143,224,255,.04)" stroke="rgba(143,224,255,.38)" stroke-width="2"/>`;
        const n = Math.floor(r() * 5.5);
        for (let i = 0; i < n; i++) s += `<rect x="${x + 16 + (i === 2 || i === 3 ? 16 : 0)}" y="${y + 12 + i * 14}" width="${(30 + r() * 130).toFixed(0)}" height="7" rx="3.5" fill="rgba(143,224,255,.22)"/>`;
      }
      const x = pcX0 + 3 * (PC.w + PC.gx), y = pcY0;
      s += `<rect x="${x}" y="${y}" width="${PC.w}" height="${PC.h}" rx="8" fill="rgba(143,224,255,.04)" stroke="rgba(143,224,255,.38)" stroke-width="2"/>`;
      s += `</svg>`;
      pcP.innerHTML = s;
    }
    const pcSvg = pcP.querySelector("svg");
    const pcLbl = ctx.el("div", "sG-lbl", pcP, "page cache");
    pcLbl.style.cssText += `left:${pcX0}px;top:${pcY0 - 64}px;font-size:26px;color:rgba(200,235,255,.75);`;
    const clean = ctx.el("div", "", pcP);                      // our page after the flush: still cached, now clean
    clean.style.cssText = `position:absolute;left:${SLOT.x - PC.w / 2}px;top:${SLOT.y - PC.h / 2}px;width:${PC.w}px;height:${PC.h}px;border-radius:8px;border:2px solid rgba(143,224,255,.6);background:rgba(143,224,255,.06);`;
    const writeLbl = ctx.el("div", "sG-lbl", pcP, `write(…, 83)`);
    writeLbl.style.cssText += `left:${SLOT.x - 300}px;width:600px;text-align:center;top:${SLOT.y - PC.h - PC.gy - 20}px;font-size:34px;line-height:40px;color:#fff3df;`;
    const ret = ctx.el("div", "sG-lbl", ctx.root, "83");      // the return value bounces back up
    ret.style.cssText += "font-size:34px;line-height:40px;color:#ffffff;font-weight:700;text-shadow:0 0 18px rgba(200,235,255,.8);";
    const dirty = ctx.el("div", "sG-lbl", pcP, `dirty`);
    dirty.style.cssText += `left:${SLOT.x - 300}px;width:600px;text-align:center;top:${SLOT.y - PC.h - PC.gy - 18}px;font-size:30px;line-height:36px;`;
    dirty.classList.add("sG-gold");
    const timer = ctx.el("div", "", pcP, `<svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="17" fill="none" stroke="rgba(143,224,255,.25)" stroke-width="4"/><circle class="arc" cx="22" cy="22" r="17" fill="none" stroke="#bfefff" stroke-width="4" stroke-linecap="round" transform="rotate(-90 22 22)" stroke-dasharray="106.8 106.8" stroke-dashoffset="106.8"/></svg>`);
    timer.style.cssText = `position:absolute;left:${SLOT.x + 64}px;top:${SLOT.y - PC.h - PC.gy - 22}px;width:44px;height:44px;`;
    const timerArc = timer.querySelector(".arc");

    // ---------------- the ext4 journal (a ring of blocks) ----------------
    {
      let s = `<svg class="sG-svg" width="1920" height="1080">`;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2 - Math.PI / 2, x = SLOT.x + Math.cos(a) * 330, y = SLOT.y + Math.sin(a) * 330;
        s += `<rect class="jb" x="${(x - 19).toFixed(1)}" y="${(y - 19).toFixed(1)}" width="38" height="38" rx="5" transform="rotate(${((a * 180) / Math.PI + 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="rgba(143,224,255,.06)" stroke="rgba(143,224,255,.5)" stroke-width="2.5"/>`;
      }
      fsP.innerHTML = s + `</svg>`;
    }
    const jbs = Array.from(fsP.querySelectorAll(".jb"));
    const fsLbl = ctx.el("div", "sG-lbl", fsP, "ext4 journal");
    fsLbl.style.cssText += `left:${SLOT.x - 300}px;width:600px;text-align:center;top:${SLOT.y - 400}px;font-size:26px;color:rgba(200,235,255,.75);`;

    // ---------------- the drive (B's NVMe, ESP, ext4 /) ----------------
    const nvme = ctx.el("div", "sG-dev", drvP);
    nvme.style.cssText += "left:260px;top:450px;width:1400px;height:300px;";
    const nvmeLbl = ctx.el("div", "sG-lbl", drvP, "NVMe");
    nvmeLbl.style.cssText += "left:290px;top:474px;font-size:26px;font-weight:600;color:rgba(200,230,255,.85);";
    const esp = ctx.el("div", "sG-part", drvP, "ESP");
    esp.style.cssText += "left:300px;top:560px;width:190px;background:#2a2115;box-shadow:0 0 0 2.5px rgba(214,173,106,.6);color:#d6ad6a;font-weight:700;";
    const root = ctx.el("div", "sG-part", drvP, "ext4  /");
    root.style.cssText += "left:506px;top:560px;width:1114px;background:#14110e;color:rgba(200,190,175,.7);";
    const blkLbl = ctx.el("div", "sG-lbl", drvP, "4096 bytes");
    blkLbl.style.cssText += `left:${BLOCK.x - 300}px;width:600px;text-align:center;top:${BLOCK.y - 132}px;font-size:26px;color:rgba(255,226,196,.85);`;

    // ---------------- the flash: cells, our charges, the kernel's, the power button ----------------
    const chip = ctx.el("div", "sG-chip", cellP);
    const cellsBg = ctx.el("div", "sG-cells", cellP);
    const KR = { x0: FX + 35 * PITCH, y0: FY - 4 * PITCH, cols: 49, rows: 15 };
    const kCv = ctx.el("canvas", "", cellP);
    kCv.width = KR.cols * PITCH; kCv.height = KR.rows * PITCH;
    kCv.style.cssText = `position:absolute;left:${KR.x0}px;top:${KR.y0}px;width:${KR.cols * PITCH}px;height:${KR.rows * PITCH}px;`;
    {
      const g = kCv.getContext("2d");
      for (let r = 0; r < KR.rows; r++) for (let c = 0; c < KR.cols; c++) {
        const lv = 0.2 + 0.8 * OT.hash(c * 31 + 7, r * 17 + 3);
        g.fillStyle = "rgba(143,224,255,.16)"; g.fillRect(c * PITCH - 2, r * PITCH - 2 + CS * (1 - lv), CS + 4, CS * lv + 4);
        g.fillStyle = "rgba(143,224,255,.75)"; g.fillRect(c * PITCH, r * PITCH + CS * (1 - lv), CS, CS * lv);
      }
    }
    const kLbl = ctx.el("div", "sG-lbl", cellP, "vmlinuz-7.0.0-34-generic");
    kLbl.style.cssText += `left:${KR.x0}px;top:${KR.y0 - 62}px;font-size:30px;color:rgba(200,235,255,.85);`;
    const RES = 2.5, OCV = { x: FX - 12, y: FY - 12, w: COLS * PITCH + 18, h: 7 * PITCH + 18 };
    const oCv = ctx.el("canvas", "", cellP);
    oCv.width = Math.round(OCV.w * RES); oCv.height = Math.round(OCV.h * RES);
    oCv.style.cssText = `position:absolute;left:${OCV.x}px;top:${OCV.y}px;width:${OCV.w}px;height:${OCV.h}px;`;
    const og = oCv.getContext("2d");
    const hexEls = HEX.map((h, i) => {
      const e = ctx.el("div", "sG-hex", cellP, h);
      const k0 = STRIP0 + (8 * i) / 3, k1 = STRIP0 + (8 * i + 8) / 3;    // the cells this byte's bits land in
      const cx = FX + ((k0 + k1) / 2 - STRIP0) * PITCH - 3;
      return { e, cx, i };
    });
    const HEX_Y = FY - 38;                                      // the hex row floats above the file's cells
    const btn = ctx.el("div", "", cellP);
    btn.innerHTML = `<svg class="sG-svg" width="1920" height="1080"><g class="btn" transform="translate(${BTN.x} ${BTN.y})">
        <circle r="122" fill="#0e0c0a" stroke="#3a322a" stroke-width="5"/>
        <circle class="ring" r="122" fill="none" stroke="#ffc54d" stroke-width="7" opacity="0"/>
        <path class="glyph" d="M 34.4 -49.1 A 60 60 0 1 1 -34.4 -49.1" fill="none" stroke="#5c5248" stroke-width="13" stroke-linecap="round"/>
        <line class="glyph" x1="0" y1="-74" x2="0" y2="-16" stroke="#5c5248" stroke-width="13" stroke-linecap="round"/>
      </g></svg>`;
    const btnG = btn.querySelector(".btn"), btnRing = btn.querySelector(".ring"), glyphs = btn.querySelectorAll(".glyph");
    const dawn = OT.C.bloom(cellP, { size: 1400 });            // behind the chip: the button's warm light

    // ---------------- the rise: firmware, the kernel, PID 1 ----------------
    fwP.innerHTML = `<svg class="sG-svg" width="1920" height="1080"><g class="flash" transform="translate(660 ${Y_FW - 70}) scale(1.4)">
      <rect x="-95" y="-70" width="190" height="140" rx="8" fill="#15110e" stroke="#7a6650" stroke-width="3"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="-118" y="${-52 + i * 32}" width="23" height="12" fill="#7a6650"/><rect x="95" y="${-52 + i * 32}" width="23" height="12" fill="#7a6650"/>`).join("")}
      <circle cx="-66" cy="-42" r="8" fill="#7a6650"/><text y="110" text-anchor="middle" font-size="22" fill="rgba(255,226,196,.6)">SPI flash · firmware</text></g></svg>`;
    const fwChip = fwP.querySelector(".flash");
    const mov = ctx.el("div", "sG-lbl sG-gold", fwP, "mov eax, cr0");
    mov.style.cssText += `left:870px;top:${Y_FW - 98}px;font-size:48px;line-height:56px;`;
    const knName = ctx.el("div", "sG-lbl sG-gold", knP, "vmlinuz-7.0.0-34-generic");
    knName.style.cssText += `left:360px;width:1200px;text-align:center;top:${Y_KN - 28}px;font-size:46px;line-height:56px;`;
    const knLog = [["Using GB pages for direct mapping", -150], ["NET: Registered PF_INET protocol family", 110]].map(([s, dy]) => {
      const e = ctx.el("div", "sG-lbl", knP, s);
      e.style.cssText += `left:360px;width:1200px;text-align:center;top:${Y_KN + dy}px;font-size:24px;color:rgba(200,235,255,.42);`;
      return e;
    });
    const SATS = [[-470, -250, 70], [430, -280, 62], [-520, 170, 56], [500, 200, 66], [40, -380, 48]];
    const sats = SATS.map(([dx, dy, r]) => {
      const th = ctx.el("div", "sG-thread", p1P);
      ctx.place(th, 960, Y_P1, 0, `rotate(${Math.atan2(dy, dx).toFixed(4)}rad)`);
      th.style.width = (Math.hypot(dx, dy) - r).toFixed(0) + "px";
      const c = ctx.el("div", "sG-sat", p1P);
      c.style.width = c.style.height = 2 * r + "px";
      ctx.place(c, 960 + dx - r, Y_P1 + dy - r, 0);
      return { th, c };
    });
    const pid1 = OT.C.cell(p1P, { label: "systemd", pid: "1", size: 300 });
    ctx.place(pid1.el, 960 - 150, Y_P1 - 150, 0);

    // ================= camera =================
    const P0 = { x: 960, y: 640, z: 0 };
    const KV = { x: 960, y: 640, z: D.PC };
    const DV = { x: 960, y: 640, z: D.DRV };
    const CV = { x: 960, y: 560, z: Z_CLOSE };
    const NV = { x: 1250, y: 610, z: Z_NIGHT };
    const BV = { x: 960, y: BTN.y, z: Z_NIGHT };
    const DESK = { x: 960, y: 640, z: -1500 };
    T.dive0 = T.calls - 0.12; T.dive1 = T.kernel - 0.05;
    T.plunge0 = T.flushed + 0.15; T.plunge1 = T.ssd - 0.18;
    T.push0 = T.there - 0.2; T.push1 = T.hello + 0.45;
    T.back0 = T.few - 0.05; T.back1 = T.cells - 0.05;
    T.pan0 = T.this - 0.05; T.pan1 = T.Power - 0.12;
    T.rise0 = T.Power + 0.06; T.land = T.desktop + 0.55;
    T.in0 = T.just - 0.2; T.in1 = T.here + 0.3;
    ctx.cam([
      [t0, P0], [T.dive0, P0],
      [T.dive1, { ...KV, ease: "smoother" }], [T.plunge0, KV],
      [T.plunge1, { ...DV, ease: "smoother" }], [T.push0, DV],
      [T.push1, { ...CV, ease: "quintInOut" }], [T.back0, CV],
      [T.back1, { ...NV, ease: "smoother" }], [T.pan0, NV],
      [T.pan1, { ...BV, ease: "smoother" }], [T.rise0, BV],
      // one long rise: a spline through the strata, no stops
      [T.firmware, { x: 960, y: Y_FW, z: D.FW }],
      [T.kernel2, { x: 960, y: Y_KN, z: D.KN }],
      [T.process, { x: 960, y: Y_P1, z: D.P1 }],
      [T.desktop - 0.1, { x: 960, y: 655, z: -1250 }],
      [T.land, DESK], [T.in0, DESK],
      [T.in1, { ...P0, ease: "quintInOut" }], [t1, P0],
    ]);
    ctx.exit(P0);

    // ================= ground, motes, light, fade, shake =================
    // when the dive (smoother, P0 → KV) passes depth z: the ground changes where the camera is fastest (integration: no lilac-grey)
    const passDive = (z) => { let lo = 0, hi = 1; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (lerp(P0.z, KV.z, E.smoother(m)) < z) lo = m; else hi = m; } return lerp(T.dive0, T.dive1, (lo + hi) / 2); };
    ctx.ground([
      [t0, PAPER], [passDive(250), PAPER], [passDive(520), PLUM], [passDive(D.MEM - 350), PLUM], [passDive(D.MEM + 50), NAVY],
      [T.plunge0 + 0.4, NAVY], [T.plunge0 + 1.2, "#0e0806"], [T.plunge1 - 0.4, "#110c0a"],
      [T.push0 + 0.1, "#110c0a"], [T.push1 - 0.1, "#100a07"],
      [T.power, "#100a07"], [T.off + 0.4, "#000000"],
      [T.Power, "#000000"], [T.Power + 0.45, "#070504"], [T.firmware, "#0e0806"], [T.kernel2 - 0.3, NAVY],
      [T.process - 0.3, PLUM], [T.process + 0.45, PLUM], [T.process + 0.7, WALL],   // as the wallpaper's rings arrive
      [T.in0, WALL], [T.in1 - 0.1, PAPER], [t1, PAPER],
    ]);
    ctx.motes([
      [t0, "dust"], [T.dive0 + 0.45, "spores"], [T.dive0 + 0.9, "sparks"], [T.plunge0 + 1.1, "embers"],
      [T.power + 0.2, "none"], [T.Power + 0.15, "embers"], [T.kernel2 - 0.6, "sparks"], [T.process - 0.5, "spores"], [T.process + 0.75, "dust"],
    ]);
    ctx.light([
      [T.same - 0.35, null],
      [T.same + 0.2, { x: 960, y: FY + 100, d: D.CELL, rx: 560, ry: 165, dim: 0.45, lift: 0.08 }],
      [T.kern - 0.15, {}],
      [T.kern + 0.4, { x: KR.x0 + 520, y: KR.y0 + 200, rx: 560, ry: 290 }],
      [T.this - 0.1, {}],
      [T.morning + 0.15, null],
    ]);
    if (ENDING === "fade") ctx.fade([[t0, 0, "#000000"], [t1 - 2.0, 0, "#000000"], [t1, 1, "#000000"]]);
    T.press = T.click + 0.04;
    ctx.shake(T.press, { amp: 2, freq: 28 });
    ctx.margins(0, 0);

    // ================= render =================
    let crossDive = null, crossRise = null;                    // when the camera crosses the membrane (spline is fixed after boot)
    const crossAt = (a, b) => { let lo = a, hi = b; const za = ctx.camAt(a).z; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if ((ctx.camAt(m).z - D.MEM) * (za - D.MEM) > 0) lo = m; else hi = m; } return (lo + hi) / 2; };
    const win = (t, a, b, fi = 0.3, fo = 0.3) => sstep(a - fi, a, t) * (1 - sstep(b, b + fo, t));
    let oKey = "";

    ctx.render((t) => {
      const cam = ctx.camAt(t);
      const live = t >= t0 && t < t1;
      const dark = 1 - sstep(0.35, 0.8, OT.lightNow ?? 1);
      if (crossDive === null) { crossDive = crossAt(T.dive0, T.dive1); crossRise = crossAt(T.kernel2, T.process); }

      // ---------------- the editor ----------------
      const recap = t >= T.desktop;                             // the editor belongs to the recap from here on
      const fu = recap ? (t < T.editor - 0.15 ? 1 : E.expoIn(1 - inv(T.editor - 0.15, T.editor + 0.5, t))) : 0;
      const typing0 = T.eighty - 0.05, typing1 = T.keys + 0.05;
      let n = ed.nChars, caretGold = false;
      if (recap && t < typing1) { n = ed.nChars * inv(typing0, typing1, t); caretGold = t >= typing0; }
      ed.typed(n);
      const li = n < 0.5 ? 0 : ed.chars[Math.min(ed.nChars - 1, Math.ceil(n) - 1)].li;
      ed.lines(recap && t < typing1 ? li + 1 : 5);
      if (caretGold) ed.caretAfter(n, t, { color: "#a26a05", solid: true }); else ed.caretAfter(n, t);
      ed.chrome(recap ? 1 - sstep(T.in0, T.in1 - 0.1, t) : 0);
      ed.fold(fu, desk.icon("editor"));
      ed.page.code.el.style.opacity = !recap && t >= T.ctrlS + 0.3 ? (1 - 0.82 * sstep(T.ctrlS + 0.3, T.ctrlS + 0.75, t)).toFixed(3) : "1";
      ed.win.style.opacity = !recap && t >= T.dive0 - 0.05 ? (1 - sstep(T.dive0 - 0.05, T.dive0 + 0.12, t)).toFixed(3) : "1";
      const arrive = tw(T.cursor - 0.2, T.button, t, "expoOut");
      ed.pointerAt(lerp(1580, 1328, arrive), lerp(930, 262, arrive), sstep(T.cursor - 0.25, T.cursor - 0.05, t));
      ed.hover(sstep(T.button - 0.3, T.button, t));
      {
        // Click.: B's press spring on the pill, B's warm bloom behind it
        const d = t - T.press;
        const pr = d < -0.04 ? 1 : d < 0 ? 1 - 0.06 * sstep(-0.04, 0, d) : 1 - 0.06 * Math.exp(-d * 9) * Math.cos(d * 22);
        if (d < -0.04 || (d > 0.8 && Math.abs(pr - 1) < 1e-4)) { pill.style.transform = ""; pill.style.transformOrigin = ""; }
        else { pill.style.transform = `scale(${pr.toFixed(4)})`; pill.style.transformOrigin = "50% 50%"; }
        const settle = ENDING === "fade" ? 0.25 : 0.12;
        const bl = d < -0.04 ? 0 : d < 0 ? sstep(-0.04, 0, d) : settle + (1 - settle) * Math.exp(-d * 3.2);
        ctx.place(bloom, 1325, 276, 0, `scale(${lerp(0.3, 1, E.expoOut(clamp((d + 0.04) / 0.7))).toFixed(4)})`);
        ctx.show(bloom, live ? bl : 0);
      }
      {
        // the "hello" ending: the Run button's saved command runs in the page's own terminal strip
        let lines = [], cr = [0, 0, 0];
        if (ENDING === "hello" && t >= T.press + 0.2) {
          lines.push([["~$ ", "pr"], ["clang -O2 hello.c -o hello && ./hello", "dim"]]);
          if (t >= T.press + 0.85) lines.push([["Hello, world!", "out"]]);
        }
        ed.page.setTerm(lines);
        ed.page.caretAt(cr[0], cr[1], cr[2]);
      }
      // the keystroke rain
      drops.forEach((e, i) => {
        const ti = lerp(typing0, typing1, (i + 0.5) / ed.nChars);
        const u = inv(ti - 0.32, ti, t);
        const a = recap && t >= ti - 0.32 && t < ti + 0.06 ? (u < 1 ? sstep(0, 0.25, u) : 1 - inv(ti, ti + 0.06, t)) : 0;
        if (a > 0.002) { const p = ed.caretPos(i + 1), h = 200 + 260 * OT.hash(i, 5), jx = 60 * (OT.hash(i, 9) - 0.5); ctx.place(e, p.x - 14 + jx * (1 - u), p.y + 8 - h * (1 - E.quadIn(u)), 0); }
        ctx.show(e, a);
      });
      const edA = recap ? (t >= T.editor - 0.2 ? 1 : 0) : t < T.dive1 + 0.3 ? ctx.depthAlpha(0, t, [250, 520]) : 0;   // gone before it streaks (speed audit)
      ctx.show(edP, live ? edA : 0);

      // ---------------- the sheet ----------------
      {
        let a = 0, cx = SHEET_C.x, cy = SHEET_C.y, d = 0, k = 1, ta = 0, ba = 0, bga = 0, ha = 0, rot = 0, glow = 0;
        if (t >= T.ctrlS - 0.15 && t < T.ssd + 2.2) {
          // Control-S.: the text turns gold where it lies, then the sheet peels up off the page
          const peel = tw(T.ctrlS + 0.55, T.editorW - 0.1, t, "cubicInOut");
          a = sstep(T.ctrlS - 0.15, T.ctrlS + 0.1, t);
          ta = 1; ba = 0;
          bga = sstep(T.ctrlS + 0.55, T.ctrlS + 1.2, t);
          d = -80 * peel; cy = SHEET_C.y - 26 * peel;
          rot = 16 * peel * (1 - peel);                          // a slight peel (≤ 4°), never tilting into the page
          if (t >= T.dive0) {
            // the dive: the sheet sinks ahead of the camera and lands in its page-cache slot
            const u = inv(T.dive0, T.dive1, t);
            const eff = 80 * (1 - u) - 380 * Math.sin(Math.PI * u);
            d = cam.z - eff;
            k = lerp(1, PC.w / 900, E.cubicInOut(inv(0.45, 1, u)));
            cx = lerp(SHEET_C.x, SLOT.x, E.cubicInOut(u)); cy = lerp(SHEET_C.y - 26, SLOT.y, E.cubicInOut(u));
            rot = 3 * (1 - sstep(0, 0.3, u));
            ta = 1 - sstep(0.12, 0.42, u); ba = sstep(0.12, 0.42, u);
          }
          if (t >= T.dive1) { d = D.PC; k = PC.w / 900; cx = SLOT.x; cy = SLOT.y; ta = 0; ba = 1; rot = 0; }
          if (t >= T.plunge0) {
            // flushed: it falls through the journal into the drive, a 4096-byte block
            const u = inv(T.plunge0, T.plunge1, t);
            d = Math.min(D.DRV, cam.z + 280 * Math.sin(Math.PI * u));    // it drops ahead of us, into the drive
            cx = lerp(SLOT.x, BLOCK.x, E.cubicInOut(u)); cy = lerp(SLOT.y, BLOCK.y, E.cubicInOut(u));
            ha = sstep(T.system - 0.2, T.system + 0.25, t);
            ba = 1 - ha;
          }
          glow = sstep(T.ctrlS - 0.15, T.ctrlS + 0.1, t) * (t < T.ctrlS + 0.9 ? 1 : 0.6);
        } else if (t >= T.one - 0.1 && t < T.save + 0.9) {
          // One save.: a small gold sheet dips into the window and is gone
          const u = inv(T.one - 0.1, T.save + 0.75, t);
          a = sstep(0, 0.2, u) * (1 - sstep(0.6, 1, u));
          d = lerp(-170, 0, E.cubicInOut(clamp(u / 0.75))); ta = 1; bga = 0.6; ba = 0;
        }
        a *= ctx.depthAlpha(d, t, [300, 620], [-4000, -3000]);      // pushing past the block into the flash: it passes us
        ctx.show(sheet, live ? a : 0);
        if (a > 0.002) {
          placeSheet(cx, cy, d, k, rot ? ` rotateX(${rot.toFixed(2)}deg)` : "");
          const g = OT.rgb(OT.mix(GOLD_P, GOLD, dark));
          sheetCode.el.style.color = g;
          sheetCode.el.style.opacity = ta.toFixed(3);
          const bw = clamp(2 / k, 2, 9);
          sheetBg.style.borderWidth = bw.toFixed(2) + "px";
          sheetBg.style.borderColor = OT.rgb(OT.mix(GOLD_P, GOLD, dark), lerp(0.45, 0.95, dark));
          sheetBg.style.background = OT.rgb(OT.mix([255, 214, 140], GOLD, dark), lerp(0.18, 0.12, dark));
          sheetBg.style.boxShadow = dark > 0.05 ? `0 0 ${(40 / Math.max(k, 0.3)).toFixed(0)}px rgba(255,190,70,${(0.45 * dark).toFixed(3)})` : "none";
          sheetBg.style.opacity = bga.toFixed(3);
          bars.forEach((b) => { b.style.background = g; b.style.opacity = (ba * lerp(0.75, 0.95, dark)).toFixed(3); });
          hatch.style.opacity = ha.toFixed(3);
          sheet.style.textShadow = "none";
          sheetCode.el.style.textShadow = dark > 0.05 ? `0 0 16px rgba(255,190,70,${(0.55 * dark).toFixed(3)})` : glow > 0.01 ? `0 0 ${(8 * glow).toFixed(1)}px rgba(255,214,140,${(0.5 * glow).toFixed(3)})` : "none";
        }
      }

      // ---------------- membrane: one ring of light where we cross ----------------
      {
        const near = (tc) => win(t, tc - 0.6, tc + 0.5, 0.3, 0.4);
        const a = Math.max(t < T.plunge0 ? near(crossDive) : 0, t > T.firmware ? near(crossRise) : 0);
        ctx.show(memP, live ? a * ctx.depthAlpha(D.MEM, t, [430, 700], [-2600, -1400]) : 0);
        const tc = t < T.plunge0 ? crossDive : crossRise, c = ctx.camAt(tc);
        const u = clamp((t - tc + 0.12) / 0.9);
        ctx.place(ring, c.x, c.y, 0, `scale(${lerp(0.25, 1.6, E.expoOut(u)).toFixed(4)})`);
        ctx.show(ring, u > 0 && u < 1 ? (1 - u) ** 1.5 * sstep(0, 0.08, u) : 0);
      }

      // ---------------- the page cache ----------------
      {
        const a = t < T.dive0 - 0.1 || t > T.ssd ? 0 : ctx.depthAlpha(D.PC, t, [430, 820], [-2600, -1400]);
        ctx.show(pcP, live ? a : 0);
        pcSvg.style.opacity = lerp(0.55, 1, sstep(T.page - 0.2, T.page + 0.3, t)).toFixed(3);
        ctx.show(pcLbl, sstep(T.page - 0.35, T.page + 0.05, t));
        ctx.show(writeLbl, win(t, T.write, T.fib + 0.25, 0.25, 0.35));
        ctx.show(dirty, win(t, T.still + 0.4, T.flushed + 0.4, 0.35, 0.3));
        ctx.show(timer, win(t, T.seconds - 0.1, T.flushed + 0.4, 0.25, 0.3));
        timerArc.setAttribute("stroke-dashoffset", (106.8 * (1 - tw(T.seconds, T.later + 0.05, t, "sineInOut"))).toFixed(2));
        ctx.show(clean, sstep(T.flushed, T.flushed + 0.35, t));
        // the return value: 83 bounces back up toward the page
        const u = inv(T.done - 0.05, T.done + 0.75, t);
        const ra = u > 0 && u < 1 ? sstep(0, 0.12, u) * (1 - sstep(0.55, 1, u)) : 0;
        ctx.show(ret, live ? ra * a : 0);
        if (ra > 0.002) ctx.place(ret, SLOT.x + 52, SLOT.y - PC.h - PC.gy - 20 - 140 * E.backOut(clamp(u * 1.4)), D.PC - 420 * E.cubicIn(u));
      }

      // ---------------- the journal ----------------
      {
        const a = t < T.plunge0 - 0.2 || t > T.push0 ? 0 : ctx.depthAlpha(D.FS, t, [250, 600], [-2600, -1400]);
        ctx.show(fsP, live ? a : 0);
        const hot = Math.exp(-Math.abs(t - T.system) * 2.2);
        jbs.forEach((b, i) => {
          const lit = i === 9 ? sstep(T.system - 0.1, T.system + 0.15, t) : 0;
          b.setAttribute("stroke", lit > 0.01 ? OT.rgb(OT.mix([143, 224, 255], [235, 250, 255], lit), 0.95) : `rgba(143,224,255,${(0.45 + 0.4 * hot).toFixed(3)})`);
          b.setAttribute("fill", `rgba(143,224,255,${(0.06 + 0.25 * lit + 0.06 * hot).toFixed(3)})`);
        });
        fsLbl.style.opacity = (0.55 + 0.45 * hot).toFixed(3);
      }

      // ---------------- the drive ----------------
      {
        const a = t > T.push1 + 0.2 ? 0 : sstep(T.system - 0.35, T.system + 0.15, t) * ctx.depthAlpha(D.DRV, t, [250, 520], [-2600, -1400]);   // the drive drops away before it streaks past
        ctx.show(drvP, live ? a : 0);
        const lit = sstep(T.ssd - 0.15, T.ssd + 0.25, t);
        root.style.boxShadow = `0 0 0 2.5px rgba(200,190,175,${(0.3 + 0.35 * lit).toFixed(3)})${lit > 0.01 ? `, 0 0 ${(30 * lit).toFixed(0)}px rgba(255,190,70,${(0.25 * lit).toFixed(3)})` : ""}`;
        ctx.show(blkLbl, win(t, T.system + 0.35, T.push0 + 0.1, 0.3, 0.3));
      }

      // ---------------- the flash cells ----------------
      {
        const a = t < T.push0 - 0.1 || t > T.process ? 0 : ctx.depthAlpha(D.CELL, t, [430, 820], [-3400, -2200]);
        const recede = 1 - sstep(380, 820, D.CELL - cam.z);       // rising away: the chip sinks into the dark below
        ctx.show(cellP, live ? a * (t > T.Power ? recede : 1) : 0);
        const night = sstep(T.power, T.off + 0.4, t);
        const day = sstep(T.push0, T.push1 - 0.2, t);
        chip.style.opacity = (day * lerp(1, 0.18, night)).toFixed(3);
        cellsBg.style.opacity = (day * lerp(0.42, 0.07, night)).toFixed(3);
        kCv.style.opacity = Math.max(0.2 * sstep(T.back0, T.back1, t) * (1 - sstep(T.power, T.off + 0.3, t)), 0.55 * sstep(T.same - 0.1, T.same + 0.6, t)).toFixed(3);
        ctx.show(kLbl, sstep(T.kern - 0.1, T.kern + 0.35, t) * (1 - sstep(T.this, T.morning + 0.3, t)));
        // the hex row of "Hello, world", then its bits fall into the cells as charge
        hexEls.forEach(({ e, cx, i }) => {
          const ap = sstep(T.push0 + 0.5, T.hello + 0.1, t);
          const f0 = T.becomes - 0.05 + 0.03 * i, u = inv(f0, f0 + 0.32, t);
          ctx.show(e, ap * (1 - sstep(0.55, 1, u)));
          e.style.transform = `translate3d(${(cx - 16).toFixed(1)}px, ${(HEX_Y + (FY + 4 * PITCH - HEX_Y + 4) * E.quadIn(u)).toFixed(1)}px, 0px) scale(${lerp(1, 0.55, u).toFixed(3)})`;
        });
        // our cells (canvas, redrawn only when they change)
        const fillAt = (k) => {
          const r = Math.floor(k / COLS), c = k % COLS;
          if (r === 4) return T.becomes + 0.15 + 0.03 * Math.floor((3 * c) / 8);   // as its byte lands
          return T.charge + 0.28 + Math.abs(r - 4) * 0.13 + 0.004 * c;
        };
        const lidAt = (k) => (Math.floor(k / COLS) === 4 ? T.trapped + 0.006 * (k % COLS) : fillAt(k) + 0.22);
        const q = [];
        for (let k = 0; k < NCELL; k++) { const f = clamp((t - fillAt(k)) / 0.22), l = clamp((t - lidAt(k)) / 0.2); q.push(Math.round(f * 24), Math.round(l * 12)); }
        const hot = Math.round(12 * Math.exp(-Math.max(0, t - T.charge) * 2.5) * sstep(T.charge - 0.3, T.charge, t));
        const key = q.join(",") + "|" + hot;
        if (key !== oKey) {
          oKey = key;
          og.setTransform(1, 0, 0, 1, 0, 0);
          og.clearRect(0, 0, oCv.width, oCv.height);
          og.setTransform(RES, 0, 0, RES, -OCV.x * RES, -OCV.y * RES);
          og.globalCompositeOperation = "lighter";
          for (let k = 0; k < NCELL; k++) {
            const f = q[2 * k] / 24, l = q[2 * k + 1] / 12;
            if (f <= 0) continue;
            const { x, y } = cellXY(k), lv = 0.22 + 0.78 * (LEVEL[k] / 7), h = CS * lv * E.cubicOut(f);
            const boost = Math.floor(k / COLS) === 4 ? hot / 12 : 0;
            og.fillStyle = `rgba(255,190,70,${(0.22 * f + 0.25 * boost).toFixed(3)})`;
            og.fillRect(x - 4, y - 4, CS + 8, CS + 8);
            og.fillStyle = `rgba(255,197,77,${(0.9 * f).toFixed(3)})`;
            og.fillRect(x, y + CS - h, CS, h);
            og.fillStyle = `rgba(255,214,140,${(0.55 * f).toFixed(3)})`;
            og.fillRect(x, y, CS, 1.5); og.fillRect(x, y, 1.5, CS); og.fillRect(x + CS - 1.5, y, 1.5, CS); og.fillRect(x, y + CS - 1.5, CS, 1.5);
            if (l > 0) { og.fillStyle = `rgba(255,236,190,${(0.95 * l).toFixed(3)})`; og.fillRect(x - 1, y - 3, (CS + 2) * l, 3.5); }
          }
          og.globalCompositeOperation = "source-over";
        }
        oCv.style.opacity = "1";
        oCv.style.filter = night > 0.01 ? `drop-shadow(0 0 ${(14 * night).toFixed(1)}px rgba(255,190,70,${(0.55 * night).toFixed(3)}))` : "none";   // the only light
        // the power button: dawn below, then Power.
        const dp = t - T.Power;
        const lit = sstep(T.Power - 0.12, T.Power + 0.08, t);
        const pr = dp >= 0 ? 1 - 0.08 * Math.exp(-dp * 9) * Math.cos(dp * 22) : 1;
        btnG.setAttribute("transform", `translate(${BTN.x} ${BTN.y}) scale(${pr.toFixed(4)})`);
        btnG.setAttribute("opacity", (sstep(T.this - 0.2, T.morning + 0.4, t) * 0.85 + 0.15 * lit).toFixed(3));
        btnRing.setAttribute("opacity", lit.toFixed(3));
        btnRing.style.filter = lit > 0.01 ? `drop-shadow(0 0 ${(18 * lit).toFixed(0)}px rgba(255,190,70,.8))` : "none";
        glyphs.forEach((g) => g.setAttribute("stroke", OT.rgb(OT.mix([92, 82, 72], [255, 197, 77], lit))));
        const dawnA = 0.28 * sstep(T.this - 0.1, T.Power - 0.2, t);
        const bl = dp < -0.04 ? dawnA : dp < 0 ? lerp(dawnA, 1, sstep(-0.04, 0, dp)) : 0.25 + 0.75 * Math.exp(-dp * 3.2);
        ctx.place(dawn, BTN.x, BTN.y, 0, `scale(${(dp < -0.04 ? 0.7 : lerp(0.7, 1, E.expoOut(clamp((dp + 0.04) / 0.7)))).toFixed(4)})`);
        ctx.show(dawn, bl);
      }

      // ---------------- the rise: firmware, the kernel, PID 1 ----------------
      {
        const stratum = (d) => (t < T.Power || t > T.desktopEnd + 0.5 ? 0 : ctx.depthAlpha(d, t, [250, 520], [-2600, -1400]) * (1 - sstep(650, 1400, d - cam.z)));
        ctx.show(fwP, live ? stratum(D.FW) : 0);
        ctx.show(knP, live ? stratum(D.KN) : 0);
        ctx.show(p1P, live ? stratum(D.P1) : 0);
        const glint = (tt) => Math.exp(-Math.max(0, t - tt) * 2.2) * sstep(tt - 0.25, tt, t);
        const gf = glint(T.firmware);
        fwChip.style.filter = `drop-shadow(0 0 ${(6 + 22 * gf).toFixed(1)}px rgba(255,170,80,${(0.3 + 0.5 * gf).toFixed(3)}))`;
        mov.style.textShadow = `0 0 ${(14 + 24 * gf).toFixed(1)}px rgba(255,190,70,${(0.55 + 0.4 * gf).toFixed(3)})`;
        const gk = glint(T.kernel2);
        knName.style.textShadow = `0 0 ${(16 + 26 * gk).toFixed(1)}px rgba(255,190,70,${(0.55 + 0.4 * gk).toFixed(3)})`;
        const gp = glint(T.process);
        pid1.el.style.boxShadow = `inset 0 0 0 4px rgba(255,197,77,.95), 0 0 ${(40 + 50 * gp).toFixed(0)}px rgba(255,190,70,${(0.4 + 0.4 * gp).toFixed(3)})`;
        sats.forEach(({ th, c }) => { th.style.opacity = "0.35"; c.style.opacity = "0.6"; });
      }

      // ---------------- the desktop: the recap, camera still ----------------
      {
        const a = t < T.process || t >= T.in1 ? 0 : ctx.depthAlpha(0, t, [430, 820], [-2600, -1400]);
        ctx.show(deskP, live ? a : 0);
        mur.render(t);
        const arr = sstep(T.packets - 0.35, T.packets + 0.05, t) * (1 - sstep(T.signed + 0.1, T.signed + 0.7, t));
        desk.icons[0].style.boxShadow = arr > 0.01 ? `0 0 0 ${(7 * arr).toFixed(1)}px rgba(162,106,5,${(0.55 * arr).toFixed(3)}), 0 0 ${(50 * arr).toFixed(0)}px rgba(255,190,70,${(0.55 * arr).toFixed(3)})` : "none";
        desk.icons[0].classList.toggle("on", t >= T.packets - 0.1);
        desk.icons[3].classList.toggle("on", t >= T.editor);
        // A signed package.: the parcel drops onto the desktop, its seal flares, it opens
        const pd0 = T.signed - 0.5, pd1 = T.signed - 0.06;
        const pa = t < pd0 || t > T.editor ? 0 : sstep(pd0, pd0 + 0.15, t) * (1 - sstep(T.pkg + 0.55, T.editor - 0.2, t));
        ctx.show(parcel.el, live ? pa : 0);
        if (pa > 0.002) {
          const pdd = lerp(-1100, 0, E.cubicIn(inv(pd0, pd1, t)));
          ctx.place(parcel.el, 660, 380, pdd, "scale(1.6)");
          const dl = t - pd1;
          const fl = dl < -0.02 ? 0 : dl < 0 ? sstep(-0.02, 0, dl) : Math.exp(-dl * 2.6);
          parcel.seal.style.filter = fl > 0.01 ? `brightness(${(1 + 0.5 * fl).toFixed(3)}) drop-shadow(0 0 ${(6 + 26 * fl).toFixed(1)}px rgba(255,130,90,${(0.3 + 0.55 * fl).toFixed(2)}))` : "none";
          parcel.members.forEach((m, i) => {
            const u = tw(T.pkg - 0.05 + i * 0.09, T.pkg + 0.55 + i * 0.09, t, "cubicOut");
            m.el.style.transform = `translate3d(${(330 * u).toFixed(1)}px, 0px, 0px)`;
            m.el.style.opacity = (1 - sstep(0.35, 1, u)).toFixed(3);
          });
        }
      }
    });
  },
});
