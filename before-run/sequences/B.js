/* B — Power on, in the dark at the bottom of the world.
 * A box and a button → the power rails settle, PWR_OK goes high (the gold spark is born) → a hidden chip wakes
 * first (we look away) → the CPU leaves reset and fetches from 16 bytes below 4 GiB → the address is a flash
 * chip, its bytes are the first instruction → firmware camps in the CPU cache while it trains the RAM (eyes open,
 * rows light, we fly down the hall) → devices wake, the disk opens: a FAT partition, the bootloader, a seal. */
OT.sequence({
  id: "B",
  build(ctx) {
    const { clamp, lerp, inv, sstep, tw, spring, rng, E } = OT;
    const at = (b, w, n) => ctx.at(b, w, n), end = (b, w, n) => ctx.end(b, w, n);

    // ---------------- beats ----------------
    const T = {
      box: at("s01", "box,"), button: at("s01", "button."),
      press: at("s02", "press") + 0.08, it: at("s02", "it."), rails0: at("s02", "The") - 0.12,
      v12: at("s02", "power"), v5: at("s02", "supply"), v33: at("s02", "settles"), good: at("s02", "good."), goodEnd: end("s02", "good."),
      tech: at("s02", "Technically,"), tiny: at("s02", "tiny"), hidden: at("s02", "hidden"), wakes: at("s02", "wakes"), lets: at("s02", "Let's"), there: end("s02", "there."),
      then: at("s03", "Then"), reset: at("s03", "reset"), fetches: at("s03", "fetches"), address: at("s03", "address,"), sixteen: at("s03", "sixteen"),
      below: at("s03", "below"), giga: end("s03", "gigabytes."), ram: at("s03", "RAM."), flash: at("s03", "flash"), holding: at("s03", "holding"), firmware: at("s03", "firmware."), fwEnd: end("s03", "firmware."),
      often: at("s04", "Often,"), either: end("s04", "either."), so: at("s04", "So"), borrows: at("s04", "borrows"), cache: at("s04", "cache,"),
      trains: at("s04", "trains"), memory: at("s04", "memory,"), nudging: at("s04", "nudging"), every: at("s04", "every"), until: at("s04", "until"), clean: at("s04", "clean."), cleanEnd: end("s04", "clean."),
      wakes2: at("s05", "wakes"), rest: at("s05", "rest"), machine: at("s05", "machine,"), opens: at("s05", "opens"), partition: at("s05", "partition"),
      fat: at("s05", "FAT,"), older: at("s05", "older"), users: end("s05", "users,"), loads: at("s05", "loads"), boot: at("s05", "bootloader."), bootEnd: end("s05", "bootloader."),
      with: at("s05", "With"), secure: at("s05", "Secure"), first: at("s05", "first"), linux: at("s05", "Linux"), signed: at("s05", "signed"), ms: at("s05", "Microsoft."), msEnd: end("s05", "Microsoft."),
    };
    const FLASH_MODE = "bloom", IT_M = "bloom", GOOD_M = "glow", RAILS_L = false;   // prototype switch (work/tools/sfx/flashpatch.py)
    T.land = T.signed + 0.265;                                 // the seal's spring first reaches scale 1
    T.clear0 = T.msEnd + 0.05; T.clear1 = T.msEnd + 0.55;      // the tail clears the floor: only the card + seal stay (baton 1)
    const H0 = T.rails0, H1 = T.goodEnd + 0.45;                 // the scope's write head sweeps across this window
    const headX = (t) => 430 + 1130 * inv(H0, H1, t);
    const xAt = (tt) => 430 + 1130 * inv(H0, H1, tt);
    const RESET_BYTES = ["0F", "20", "C0", "A8", "01", "74", "05", "E9", "2C", "FF", "FF", "FF", "E9", "11", "FF", "90"];

    // ---------------- styles ----------------
    ctx.el("style", "", document.head, `
      .b-svg { position:absolute; left:0; top:0; overflow:visible; }
      .b-svg text { font-family:"JetBrains Mono",monospace; }
      .b-lbl { position:absolute; font-family:"JetBrains Mono",monospace; font-size:22px; color:rgba(255,226,196,.62); white-space:pre; }
      .b-cell { position:absolute; width:58px; height:58px; border-radius:6px; border:2px solid rgba(255,200,140,.45); font:700 26px/54px "JetBrains Mono",monospace; text-align:center; color:#ffe2bf; }
      .b-hex { position:absolute; font:24px/34px "JetBrains Mono",monospace; color:#ffd9a8; white-space:pre; text-shadow:0 0 12px rgba(255,170,80,.55); }
      .b-chip { position:absolute; border-radius:8px; }
      .b-dev { position:absolute; border-radius:14px; border:2.5px solid rgba(160,210,255,.35); font:600 26px "JetBrains Mono",monospace; color:rgba(200,230,255,.8); display:flex; align-items:center; justify-content:center; }
      .b-part { position:absolute; height:118px; border-radius:10px; font-family:"JetBrains Mono",monospace; display:flex; align-items:center; padding:0 26px; white-space:pre; }
      .b-tree { position:absolute; font:30px/52px "JetBrains Mono",monospace; color:rgba(255,230,200,.72); white-space:pre; }
      .b-tree .hi { color:#ffc54d; text-shadow:0 0 14px rgba(255,190,70,.6); }
      .b-gate { position:absolute; width:300px; font-family:"JetBrains Mono",monospace; }
      .b-gate .k { margin-top:18px; padding:14px 18px; border-radius:10px; border:2px solid rgba(255,220,170,.35); font-size:21px; color:rgba(255,235,210,.75); white-space:pre; }
      .b-fat { position:absolute; font:700 30px "JetBrains Mono",monospace; color:#d6ad6a; border:3px solid #d6ad6a; border-radius:8px; padding:6px 16px; letter-spacing:0.08em; }
    `);

    // ================= station 0: the box and the button (d 400) =================
    const D_BTN = 400;
    const btnP = ctx.plane(D_BTN);
    btnP.innerHTML = `<svg class="b-svg" width="1920" height="1080">
      <rect class="box" x="300" y="140" width="1320" height="1000" rx="46" fill="none" stroke="#3b3128" stroke-width="3"/>
      <g class="btn" transform="translate(960 640)">
        <circle r="122" fill="#0e0c0a" stroke="#3a322a" stroke-width="5"/>
        <circle class="ring" r="122" fill="none" stroke="#ffc54d" stroke-width="7" opacity="0"/>
        <path class="glyph" d="M 34.4 -49.1 A 60 60 0 1 1 -34.4 -49.1" fill="none" stroke="#5c5248" stroke-width="13" stroke-linecap="round"/>
        <line class="glyph" x1="0" y1="-74" x2="0" y2="-16" stroke="#5c5248" stroke-width="13" stroke-linecap="round"/>
      </g></svg>`;
    const boxR = btnP.querySelector(".box"), btnG = btnP.querySelector(".btn"), ring = btnP.querySelector(".ring"), glyphs = btnP.querySelectorAll(".glyph");

    // ================= station 1: the power rails (d 1300) =================
    const D_SCOPE = 1300;
    const scopeP = ctx.plane(D_SCOPE);
    const LANES = [["+12 V", 400, T.v12], ["+5 V", 520, T.v5], ["+3.3 V", 640, T.v33]];
    const rail = (y, xr) => {
      let d = `M 430 ${y + 34}`;
      for (let x = 436; x <= 1560; x += 6) {
        let v;
        if (x < xr) v = 0;
        else { const u = (x - xr) / 46; v = u < 1 ? E.cubicInOut(u) : 1 + 0.22 * Math.exp(-(u - 1) * 1.1) * Math.sin((u - 1) * 3.6); }
        d += ` L ${x} ${(y + 34 - 68 * v).toFixed(1)}`;
      }
      return d;
    };
    const xg = xAt(T.good);
    let sc = `<svg class="b-svg" width="1920" height="1080"><defs><clipPath id="b-head"><rect class="head" x="0" y="0" width="0" height="1080"/></clipPath></defs>`;
    LANES.forEach(([name, y, tt], li) => {
      sc += `<line x1="430" y1="${y + 34}" x2="1560" y2="${y + 34}" stroke="rgba(160,210,255,.12)" stroke-width="2"/>`;
      sc += `<text x="400" y="${y + 8}" text-anchor="end" font-size="26" fill="rgba(200,230,255,.7)">${name}</text>`;
      sc += `<path class="railp" clip-path="url(#b-head)" d="${rail(y, xAt(tt))}" fill="none" stroke="#9fdcff" stroke-width="4" stroke-linejoin="round"/>`;
    });
    const yP = 790;
    sc += `<line x1="430" y1="${yP + 30}" x2="1560" y2="${yP + 30}" stroke="rgba(160,210,255,.12)" stroke-width="2"/>`;
    sc += `<text x="400" y="${yP + 6}" text-anchor="end" font-size="26" fill="rgba(255,214,160,.8)">PWR_OK</text>`;
    sc += `<path clip-path="url(#b-head)" d="M 430 ${yP + 30} L ${xg.toFixed(1)} ${yP + 30}" fill="none" stroke="rgba(255,214,160,.55)" stroke-width="4"/>`;
    sc += `<path class="pok" clip-path="url(#b-head)" d="M ${xg.toFixed(1)} ${yP + 30} L ${(xg + 4).toFixed(1)} ${yP - 30} L 1560 ${yP - 30}" fill="none" stroke="#ffc54d" stroke-width="5" stroke-linejoin="round"/>`;
    sc += `<line class="headline" x1="0" y1="330" x2="0" y2="850" stroke="rgba(200,235,255,.35)" stroke-width="2"/></svg>`;
    scopeP.innerHTML = sc;
    const headRect = scopeP.querySelector(".head"), headLine = scopeP.querySelector(".headline"), pok = scopeP.querySelector(".pok");
    const railPaths = Array.from(scopeP.querySelectorAll(".railp"));
    // local light (no full-frame flash): elements live in the world planes, behind what they light
    const behind = (parent, css) => { const e = ctx.el("div", "", parent); e.style.cssText = "position:absolute;left:0;top:0;pointer-events:none;" + css; parent.insertBefore(e, parent.firstChild); return e; };
    const bloom = behind(btnP, "left:260px;top:-60px;width:1400px;height:1400px;border-radius:50%;opacity:0;" +
      "background:radial-gradient(circle, rgba(255,214,140,.55) 0%, rgba(255,190,90,.24) 22%, rgba(255,160,60,.08) 42%, rgba(255,150,50,0) 62%);");
    const ripple = ctx.el("div", "", btnP); ripple.style.cssText = "position:absolute;left:0;top:0;width:260px;height:260px;margin:-130px 0 0 -130px;border-radius:50%;border:3px solid rgba(255,205,110,.9);box-shadow:0 0 18px rgba(255,190,70,.6), inset 0 0 18px rgba(255,190,70,.35);opacity:0;pointer-events:none;";
    const scopeLight = behind(scopeP, "left:195px;top:120px;width:1600px;height:900px;border-radius:50%;opacity:0;" +
      "background:radial-gradient(ellipse at center, rgba(140,205,255,.16) 0%, rgba(140,205,255,.07) 40%, rgba(140,205,255,0) 70%);");
    const stepGlow = ctx.el("div", "", scopeP); stepGlow.style.cssText = `position:absolute;left:${(xg - 160).toFixed(0)}px;top:${yP - 160}px;width:320px;height:320px;border-radius:50%;opacity:0;pointer-events:none;` +
      "background:radial-gradient(circle, rgba(255,214,120,.55) 0%, rgba(255,190,70,.18) 35%, rgba(255,190,70,0) 70%);";
    const pulse = ctx.el("div", "", scopeP); pulse.style.cssText = "position:absolute;left:0;top:0;width:220px;height:18px;margin:-9px 0 0 -200px;border-radius:9px;opacity:0;pointer-events:none;" +
      "background:linear-gradient(90deg, rgba(255,197,77,0) 0%, rgba(255,214,140,.55) 70%, rgba(255,246,220,1) 100%);box-shadow:0 0 22px rgba(255,190,70,.8);";

    // ================= station 2: the hidden chip (d 1500, off to the lower right) =================
    const D_SPY = 1500, SPY = { x: 2050, y: 1120 };
    const spyP = ctx.plane(D_SPY);
    spyP.innerHTML = `<svg class="b-svg" width="1920" height="1080"><g transform="translate(${SPY.x} ${SPY.y})">
      <rect x="-95" y="-95" width="190" height="190" rx="12" fill="#13100d" stroke="#3d342b" stroke-width="3"/>
      ${[-60, -20, 20, 60].map((o) => `<rect x="${o - 6}" y="-112" width="12" height="17" fill="#3d342b"/><rect x="${o - 6}" y="95" width="12" height="17" fill="#3d342b"/>`).join("")}
      <circle class="eye" r="30" fill="#1a1612" stroke="#4a4036" stroke-width="3"/>
      <circle class="pupil" r="12" fill="#0b0a09"/></g></svg>`;
    const eye = spyP.querySelector(".eye"), pupil = spyP.querySelector(".pupil");

    // ================= station 3: the CPU, the address space, the flash chip (d 2300) =================
    const D_CPU = 2300;
    const cpuP = ctx.plane(D_CPU);
    {
      let s = `<svg class="b-svg" width="1920" height="1080">`;
      s += `<rect x="620" y="300" width="680" height="680" rx="18" fill="#120c08" stroke="#5a3a22" stroke-width="3"/>`;
      for (let i = 0; i < 18; i++) {
        const p = 650 + i * 35.5;
        s += `<line x1="${p}" y1="286" x2="${p}" y2="300" stroke="#6a4a2e" stroke-width="5"/><line x1="${p}" y1="980" x2="${p}" y2="994" stroke="#6a4a2e" stroke-width="5"/>`;
        s += `<line x1="606" y1="${p - 320}" x2="620" y2="${p - 320}" stroke="#6a4a2e" stroke-width="5"/><line x1="1300" y1="${p - 320}" x2="1314" y2="${p - 320}" stroke="#6a4a2e" stroke-width="5"/>`;
      }
      s += `<rect class="die" x="780" y="460" width="360" height="360" rx="8" fill="#1c100a" stroke="#ff8a3d" stroke-width="3" opacity=".35"/>`;
      s += `<rect class="cache" x="985" y="488" width="130" height="92" rx="6" fill="rgba(255,190,110,0)" stroke="#ffc27a" stroke-width="3" stroke-dasharray="8 7" opacity=".4"/>`;
      s += `<text class="cachel" x="1050" y="606" text-anchor="middle" font-size="20" fill="rgba(255,226,196,.0)">cache</text>`;
      s += `<path class="rst" d="M 250 860 L 606 860" stroke="#ffc54d" stroke-width="4" fill="none" opacity=".25"/>`;
      s += `<text x="250" y="842" font-size="22" fill="rgba(255,226,196,.6)">RESET#</text>`;
      // address space: 0 at the bottom, 4 GiB at the top
      s += `<rect class="ramcol" x="1490" y="244" width="84" height="766" rx="6" fill="rgba(255,220,180,.03)" stroke="rgba(255,220,180,.4)" stroke-width="2.5" stroke-dasharray="10 9"/>`;
      s += `<rect class="fwwin" x="1490" y="196" width="84" height="40" rx="4" fill="rgba(255,190,90,.12)" stroke="#ffb35a" stroke-width="3"/>`;
      s += `<line x1="1480" y1="196" x2="1600" y2="196" stroke="rgba(255,226,196,.7)" stroke-width="2"/>`;
      s += `<text x="1590" y="1010" font-size="22" fill="rgba(255,226,196,.55)">0x00000000</text>`;
      s += `<text class="ramlbl" x="1532" y="430" text-anchor="middle" font-size="26" font-weight="700" fill="rgba(255,226,196,0)">RAM</text><text class="ramx" x="1532" y="466" text-anchor="middle" font-size="20" fill="rgba(255,150,120,0)">not here</text>`;
      s += `<path class="athread" d="M 1300 640 C 1400 640, 1420 216, 1500 216" fill="none" stroke="#ffc54d" stroke-width="3"/>`;
      // the loupe: the last 16 bytes below 4 GiB
      s += `<path class="lthread" d="M 1564 200 L 1660 120" fill="none" stroke="rgba(255,226,196,.55)" stroke-width="2"/>`;
      s += `<text class="l4g" x="2648" y="70" text-anchor="end" font-size="24" fill="rgba(255,226,196,0)">4 GiB ↓</text>`;
      s += `<text class="lf0" x="1662" y="198" font-size="22" fill="rgba(255,226,196,0)">0xFFFFFFF0</text>`;
      s += `<text class="lff" x="2648" y="198" text-anchor="end" font-size="22" fill="rgba(255,226,196,0)">0xFFFFFFFF</text>`;
      // the flash chip, wired to the top of the address space
      s += `<path class="fthread" d="M 2200 172 C 2200 280, 2240 330, 2240 400" fill="none" stroke="#ffb35a" stroke-width="3"/>`;
      s += `<g class="flash" transform="translate(2240 470)"><rect x="-95" y="-70" width="190" height="140" rx="8" fill="#15110e" stroke="#7a6650" stroke-width="3"/>`;
      for (let i = 0; i < 4; i++) s += `<rect x="-118" y="${-52 + i * 32}" width="23" height="12" fill="#7a6650"/><rect x="95" y="${-52 + i * 32}" width="23" height="12" fill="#7a6650"/>`;
      s += `<circle cx="-66" cy="-42" r="8" fill="#7a6650"/><text y="110" text-anchor="middle" font-size="22" fill="rgba(255,226,196,.6)">SPI flash · firmware</text></g>`;
      s += `</svg>`;
      cpuP.innerHTML = s;
    }
    const die = cpuP.querySelector(".die"), cacheR = cpuP.querySelector(".cache"), cacheL = cpuP.querySelector(".cachel"), rst = cpuP.querySelector(".rst");
    const ramx = cpuP.querySelector(".ramx"), ramcol = cpuP.querySelector(".ramcol"), fwwin = cpuP.querySelector(".fwwin"), ramlbl = cpuP.querySelector(".ramlbl"), athread = cpuP.querySelector(".athread");
    const lthread = cpuP.querySelector(".lthread"), l4g = cpuP.querySelector(".l4g"), lf0 = cpuP.querySelector(".lf0"), lff = cpuP.querySelector(".lff"), fthread = cpuP.querySelector(".fthread"), flashG = cpuP.querySelector(".flash");
    const athreadLen = 520, fthreadLen = 260;
    athread.style.strokeDasharray = `${athreadLen} ${athreadLen}`; fthread.style.strokeDasharray = `${fthreadLen} ${fthreadLen}`;
    const cells = RESET_BYTES.map((b, i) => {
      const c = ctx.el("div", "b-cell", cpuP);
      c.style.left = 1662 + i * 62 + "px"; c.style.top = "82px";
      return c;
    });
    const fwBlock = ctx.el("div", "b-hex", cpuP, "0F 20 C0 A8\n01 74 05 E9\n2C FF FF FF\nE9 11 FF 90");

    // data lanes from the CPU to the memory, each with an eye diagram
    const LANES2 = [];
    {
      const lanes = ctx.el("div", "", cpuP);
      let s = `<svg class="b-svg" width="1920" height="1080">`;
      for (let i = 0; i < 8; i++) {
        const left = i < 4, k = i % 4;
        const y = 420 + k * 120, x0 = left ? 606 : 1314, x1 = left ? 90 : 1830;
        const ex = left ? 330 : 1590;
        s += `<line class="ln${i}" x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#8fe0ff" stroke-width="3" opacity="0"/>`;
        s += `<g class="eye${i}" transform="translate(${ex} ${y})" opacity="0">`;
        for (let j = 0; j < 5; j++) s += `<path class="arc" data-j="${j}" d="" fill="none" stroke="#bfefff" stroke-width="2.5" opacity="${(0.25 + 0.12 * j).toFixed(2)}"/>`;
        s += `<line class="smp" x1="0" y1="-40" x2="0" y2="40" stroke="#ffc54d" stroke-width="3"/>`;
        s += `<text y="-52" text-anchor="middle" font-size="20" fill="rgba(200,235,255,.7)">DQ${i}</text></g>`;
        LANES2.push({ i, y, ex });
      }
      lanes.innerHTML = s + `</svg>`;
      LANES2.forEach((L) => {
        L.line = lanes.querySelector(`.ln${L.i}`); L.g = lanes.querySelector(`.eye${L.i}`);
        L.arcs = Array.from(L.g.querySelectorAll(".arc")); L.smp = L.g.querySelector(".smp");
        L.t0 = T.nudging - 0.2 + L.i * ((T.until - T.nudging + 0.2) / 8);
      });
    }

    // ================= the memory hall (d 2900 … 5300) =================
    const HALL = [];
    for (let k = 0; k < 6; k++) {
      const d = 2900 + k * 400;
      const p = ctx.plane(d);
      const chips = [];
      const spots = [[120, 260], [120, 520], [120, 780], [1640, 260], [1640, 520], [1640, 780], [600, 40], [1080, 40], [600, 1020], [1080, 1020]];
      spots.forEach(([x, y], j) => {
        const c = ctx.el("div", "b-chip", p);
        const vert = j < 6;
        c.style.cssText += `left:${x}px;top:${y}px;width:${vert ? 160 : 240}px;height:${vert ? 200 : 90}px;`;
        chips.push({ el: c, tl: T.until + 0.05 + k * 0.17 + 0.03 * (j % 5) });
      });
      HALL.push({ p, d, chips });
    }

    // ================= station 5: devices, the disk, the bootloader (d 5600) =================
    const D_DEV = 5600;
    const devP = ctx.plane(D_DEV);
    const hub = ctx.el("div", "", devP);
    hub.innerHTML = `<svg class="b-svg" width="1920" height="1080">
      <path class="dt" d="M 960 470 C 820 470, 700 420, 560 420" fill="none" stroke="#8fe0ff" stroke-width="3"/>
      <path class="dt" d="M 960 470 C 1100 470, 1250 400, 1420 400" fill="none" stroke="#8fe0ff" stroke-width="3"/>
      <path class="dt" d="M 960 470 C 960 560, 960 600, 960 690" fill="none" stroke="#8fe0ff" stroke-width="3"/>
      <path class="dt" d="M 960 470 C 1100 470, 1300 780, 1500 840" fill="none" stroke="#8fe0ff" stroke-width="3"/>
      <circle class="hubdot" cx="960" cy="470" r="14" fill="#ffc27a"/></svg>`;
    const dts = Array.from(hub.querySelectorAll(".dt")), hubdot = hub.querySelector(".hubdot");
    dts.forEach((p) => { p.style.strokeDasharray = "600 600"; });
    const DEVS = [["GPU", 400, 330, 320, 180, T.wakes2], ["USB", 1420, 340, 200, 120, T.rest], ["NVMe", 760, 690, 400, 118, T.rest + 0.2], ["Wi-Fi", 1500, 800, 200, 120, T.machine]];
    const devs = DEVS.map(([name, x, y, w, h, tl]) => {
      const e = ctx.el("div", "b-dev", devP, name);
      e.style.cssText += `left:${x}px;top:${y}px;width:${w}px;height:${h}px;`;
      return { e, tl, name };
    });
    const esp = ctx.el("div", "b-part", devP, `ESP`);
    const root = ctx.el("div", "b-part", devP, `ext4  /`);
    const espLbl = ctx.el("div", "b-lbl", devP, "EFI System Partition · FAT32");
    const fat = ctx.el("div", "b-fat", devP, "FAT · 1977");
    const treeEl = ctx.el("div", "b-tree", devP, `EFI/\n├─ BOOT/BOOTX64.EFI\n└─ ubuntu/\n   ├─ <span class="hi">shimx64.efi</span>\n   └─ grubx64.efi`);
    const bc = OT.C.bootcard(devP); const card = bc.card, stamp = bc.stamp;   // baton 1 (shared with C)
    const gate = ctx.el("div", "b-gate", devP, `<svg width="120" height="140" viewBox="0 0 120 140"><path d="M30 62 V40 a30 30 0 0 1 60 0 V62" fill="none" stroke="rgba(255,220,170,.8)" stroke-width="9"/><rect x="14" y="60" width="92" height="74" rx="12" fill="#1b1611" stroke="rgba(255,220,170,.8)" stroke-width="5"/><circle cx="60" cy="96" r="9" fill="rgba(255,220,170,.8)"/></svg><div class="k">firmware trusts:\nMicrosoft Corporation\nUEFI CA 2011</div>`);
    const gateArc = gate.querySelector("path");
    devP.appendChild(stamp);                                   // keep B's paint order: card, gate, (halo), stamp

    const sealHalo = ctx.el("div", "", devP);
    sealHalo.style.cssText = "position:absolute;left:0;top:0;width:640px;height:640px;margin:-320px 0 0 -320px;border-radius:50%;opacity:0;pointer-events:none;" +
      "background:radial-gradient(circle, rgba(255,150,105,.55) 0%, rgba(230,95,60,.22) 30%, rgba(200,70,40,0) 62%);";
    devP.insertBefore(sealHalo, stamp);

    // ---------------- camera ----------------
    const DEV_Z = 5420;
    const SEAL = { x: 1050, y: 831, z: DEV_Z + 271 }, DEMO_END = ctx.t1 - T.msEnd > 2.0;
    ctx.cam([
      [ctx.t0, { x: 960, y: 640, z: 0 }], [T.button - 0.4, { z: 0 }], [T.press - 0.2, { z: 120 }], [T.it + 0.3, { z: 150 }],
      [T.rails0 + 0.55, { x: 960, y: 610, z: 1080 }], [T.goodEnd + 0.4, { x: 960, y: 610, z: 1080 }],
      [T.tech + 0.15, { x: 960, y: 610, z: 1080 }], [T.hidden, { x: 1880, y: 1050, z: 1330 }], [T.lets - 0.05, { x: 1880, y: 1050, z: 1330 }],
      [T.there + 0.55, { x: 960, y: 640, z: 1650 }], [T.reset - 0.1, { x: 960, y: 640, z: 2130 }], [T.address - 0.55, { x: 960, y: 640, z: 2130 }],
      [T.address + 0.3, { x: 1330, y: 560, z: 2130 }], [T.sixteen - 0.35, { x: 1330, y: 560, z: 2130 }],
      [T.sixteen + 0.45, { x: 2075, y: 420, z: 2500, ease: "quintInOut" }], [T.fwEnd + 0.6, { x: 2075, y: 420, z: 2500 }],
      [T.often + 0.6, { x: 1000, y: 620, z: 2000, ease: "quintInOut" }], [T.until - 0.1, { x: 1000, y: 620, z: 2000 }], [T.cleanEnd + 0.45, { x: 960, y: 640, z: 4300 }],
      [T.wakes2 + 0.3, { x: 960, y: 620, z: DEV_Z }], [T.machine + 0.4, { x: 960, y: 620, z: DEV_Z }],
      [T.partition + 0.4, { x: 960, y: 600, z: DEV_Z + 160 }], [T.loads - 0.15, { x: 960, y: 600, z: DEV_Z + 160 }],
      [T.boot + 0.45, { x: 1050, y: 831, z: DEV_Z + 271, ease: "quintInOut" }],
      // the demo cut's ending (B is last, 4 s tail): hold on the seal, pull back, fade to black. In the full film C
      // starts 0.7 s after "Microsoft." (C.lead 0.3): B holds on the seal while its tail clears the floor (baton 1).
      ...(DEMO_END ? [[T.msEnd + 0.4, SEAL], [ctx.t1, { x: 1100, y: 620, z: DEV_Z - 500 }]] : [[ctx.t1, SEAL]]),
    ]);
    ctx.exit(DEMO_END ? { x: 1100, y: 620, z: DEV_Z - 500 } : SEAL);
    ctx.ground([
      [ctx.t0, "#000000"], [T.press, "#000000"], [T.it + 0.4, "#070504"], [T.good, "#0b0706"], [T.reset, "#0e0806"], [T.often, "#0c0807"],
      [T.until, "#0c0a0b"], [T.cleanEnd + 0.4, "#0e0d10"], [T.machine, "#110c0a"], [T.ms, "#140d09"], [ctx.t1, "#100a07"],
    ]);
    ctx.motes([[ctx.t0, "none"], [T.it + 0.3, "embers"], [T.until, "bits"], [T.cleanEnd + 0.6, "embers"]]);
    ctx.moteClock((t) => (t < T.it ? 0 : (t - T.it) * 0.6));
    if (IT_M === "flash") ctx.flash(T.it, { peak: 0.22, attack: 0.04, decay: 6, color: "#ffd27a" });
    if (GOOD_M === "flash") ctx.flash(T.good, { peak: 0.12, attack: 0.03, decay: 7, color: "#ffd27a" });
    ctx.flash(T.reset + 0.05, { peak: 0.16, attack: 0.04, decay: 6, color: "#ff9a4a" });
    ctx.flash(T.clean, { peak: 0.2, attack: 0.05, decay: 5, color: "#d9f3ff" });
    // the seal no longer flashes the frame: it flares locally at the landing (see sealHalo / stamp filter below)
    ctx.shake(T.press, { amp: 3, freq: 28 });
    ctx.shake(T.land, { amp: 9, freq: 26 });
    ctx.shake(T.older + 0.1, { amp: 3, freq: 30 });
    if (DEMO_END) ctx.fade([[ctx.t0, 0, "#000000"], [ctx.t1 - 1.6, 0, "#000000"], [ctx.t1, 1, "#000000"]]);
    ctx.margins(0, 0);

    // ---------------- hero: the spark ----------------
    const pin = (x, y, d, t) => ctx.project(x, y, d, t);
    const HERO = [
      [T.it, "●"], [T.good, "power good"], [T.fetches + 0.1, "0xFFFFFFF0"], [T.firmware, "mov eax, cr0"], [T.boot + 0.1, "shimx64.efi"],
    ];
    const heroText = (t) => {
      let i = 0; while (i < HERO.length - 1 && t >= HERO[i + 1][0]) i++;
      return i === 0 ? HERO[0][1] : OT.scramble(HERO[i - 1][1], HERO[i][1], inv(HERO[i][0], HERO[i][0] + 0.32, t), t);
    };
    ctx.hero((t) => {
      if (t < T.it - 0.05) return null;
      // anchor in the world for each phase
      let p, size = 30, anchor = 0.5, op = 1;
      if (t < T.good) { p = pin(960, 640, D_BTN, t); size = 22; }
      else if (t < T.then) { p = pin(xg + 22, yP - 64, D_SCOPE, t); anchor = 0; }
      else if (t < T.fetches + 0.1) {
        const u = tw(T.then, T.reset, t, "cubicInOut");
        const a = pin(xg + 22, yP - 64, D_SCOPE, t), b = pin(560, 820, D_CPU, t);
        p = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), s: lerp(a.s, b.s, u) }; anchor = 0;
      } else if (t < T.firmware) {
        const u = tw(T.fetches + 0.1, T.address + 0.4, t, "cubicInOut");
        const a = pin(560, 820, D_CPU, t), b = pin(1662, 40, D_CPU, t);
        p = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), s: lerp(a.s, b.s, u) }; anchor = 0;
      } else if (t < T.cache - 0.6) { p = pin(1662, 40, D_CPU, t); anchor = 0; }
      else if (t < T.wakes2) {
        const u = tw(T.cache - 0.6, T.cache + 0.2, t, "cubicInOut");
        const a = pin(1662, 40, D_CPU, t), b = pin(1050, 466, D_CPU, t);
        p = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), s: lerp(a.s, b.s, u) }; anchor = lerp(0, 0.5, u); size = lerp(30, 24, u);
        op = 1 - sstep(T.cleanEnd, T.cleanEnd + 0.4, t);
      } else return null;
      return { text: heroText(t), x: p.x, y: p.y, anchor, size: size * clamp(p.s, 0.55, 1.6), glow: 0.9, opacity: op * (t < T.it + 0.05 ? sstep(T.it - 0.05, T.it + 0.05, t) : 1) };
    });

    // ---------------- render ----------------
    const eyePath = (open, j, jit) => {
      const h = 6 + 30 * open, w = 70;
      const o = (1 - open) * (j - 2) * 6 + jit;
      return `M ${-w} ${o} C ${-w / 2} ${-h + o}, ${w / 2} ${-h + o}, ${w} ${o} M ${-w} ${o} C ${-w / 2} ${h + o}, ${w / 2} ${h + o}, ${w} ${o}`;
    };
    ctx.render((t) => {
      const cam = ctx.camAt(t);

      // ---- station 0
      ctx.show(btnP, (t >= ctx.t0 && t < T.good ? 1 : 0) * ctx.depthAlpha(D_BTN, t, [220, 470]));
      boxR.setAttribute("opacity", (0.7 * sstep(T.box - 0.2, T.box + 0.8, t)).toFixed(3));
      const btnA = sstep(T.button - 0.3, T.button + 0.6, t);
      const pr = t >= T.press ? 1 - 0.08 * Math.exp(-(t - T.press) * 9) * Math.cos((t - T.press) * 22) : 1;
      btnG.setAttribute("transform", `translate(960 640) scale(${pr.toFixed(4)})`);
      btnG.setAttribute("opacity", btnA.toFixed(3));
      const lit = sstep(T.it - 0.15, T.it + 0.1, t);
      ring.setAttribute("opacity", lit.toFixed(3));
      ring.style.filter = lit > 0.01 ? `drop-shadow(0 0 ${(18 * lit).toFixed(0)}px rgba(255,190,70,.8))` : "none";
      glyphs.forEach((g) => g.setAttribute("stroke", OT.rgb(OT.mix([92, 82, 72], [255, 197, 77], lit))));
      {
        const d = t - T.it;
        // bloom: warm light spreads from the button and settles to a faint glow
        const bl = IT_M === "bloom" ? (d < -0.04 ? 0 : d < 0 ? sstep(-0.04, 0, d) : 0.25 + 0.75 * Math.exp(-d * 3.2)) : 0;
        bloom.style.opacity = bl.toFixed(3);
        bloom.style.transform = `scale(${lerp(0.3, 1, E.expoOut(clamp((d + 0.04) / 0.7))).toFixed(4)})`;
        // pulse: one thin ring leaves the button
        const rr = IT_M === "ripple" && d > -0.02 && d < 1.1 ? clamp((d + 0.02) / 1.1) : -1;
        if (rr >= 0) { const k = E.expoOut(rr); ripple.style.opacity = ((1 - rr) ** 1.6 * sstep(0, 0.06, rr)).toFixed(3); ripple.style.transform = `translate(960px, 640px) scale(${lerp(1.0, 5.2, k).toFixed(4)})`; ripple.style.borderWidth = (3 / lerp(1, 5.2, k) * 2).toFixed(2) + "px"; }
        else ripple.style.opacity = "0";
      }

      // ---- station 1: the rails scope
      ctx.show(scopeP, t < T.rails0 - 0.6 || t > T.reset ? 0 : ctx.depthAlpha(D_SCOPE, t) * sstep(T.rails0 - 0.6, T.rails0, t) * (1 - sstep(T.there, T.there + 0.6, t)));
      const hx = headX(t);
      headRect.setAttribute("width", hx.toFixed(1));
      headLine.setAttribute("x1", hx.toFixed(1)); headLine.setAttribute("x2", hx.toFixed(1));
      headLine.setAttribute("opacity", (1 - sstep(H1 - 0.3, H1, t)).toFixed(3));
      pok.style.filter = t > T.good ? `drop-shadow(0 0 ${(10 + 10 * Math.exp(-(t - T.good) * 3)).toFixed(1)}px rgba(255,190,70,.8))` : "none";
      {
        // rails: each trace glows as it rises; the scope's light comes up in three steps
        const steps = [T.v12, T.v5, T.v33].map((tt) => sstep(tt - 0.02, tt + 0.18, t));
        railPaths.forEach((pth, i) => {
          const g = RAILS_L && t > [T.v12, T.v5, T.v33][i] - 0.02 ? 0.35 + 0.65 * Math.exp(-(t - [T.v12, T.v5, T.v33][i]) * 2.2) : 0;
          pth.style.filter = g > 0.01 ? `drop-shadow(0 0 ${(4 + 14 * g).toFixed(1)}px rgba(150,215,255,${(0.35 + 0.5 * g).toFixed(2)}))` : "none";
        });
        // the light comes up only behind what the write head has drawn
        scopeLight.style.opacity = (RAILS_L ? 0.6 * (steps[0] + steps[1] + steps[2]) / 3 : 0).toFixed(3);
        const mx = hx - 195;                                   // soft edge just behind the write head
        scopeLight.style.webkitMaskImage = scopeLight.style.maskImage = `linear-gradient(90deg, #000 ${(mx - 220).toFixed(0)}px, transparent ${(mx + 40).toFixed(0)}px)`;
        // good: local glow at the PWR_OK step (bloom, rails); a pulse runs right along PWR_OK (pulse)
        const dg = t - T.good;
        const sg = GOOD_M === "flash" ? 0 : dg < -0.03 ? 0 : dg < 0 ? sstep(-0.03, 0, dg) : Math.exp(-dg * (GOOD_M === "pulse" ? 4 : 2.2));
        stepGlow.style.opacity = (sg * (GOOD_M === "pulse" ? 0.6 : 1)).toFixed(3);
        stepGlow.style.transform = `scale(${lerp(0.6, 1.25, E.expoOut(clamp(dg / 0.6))).toFixed(4)})`;
        const pu = GOOD_M === "pulse" && dg >= 0 && dg < 0.9 ? dg / 0.9 : -1;
        if (pu >= 0) { const x = lerp(xg + 4, 2300, E.cubicIn(pu)); pulse.style.opacity = (sstep(0, 0.08, pu) * (1 - sstep(0.75, 1, pu))).toFixed(3); pulse.style.transform = `translate(${x.toFixed(1)}px, ${yP - 30}px)`; }
        else pulse.style.opacity = "0";
      }

      // ---- station 2: the hidden chip wakes first; it watches us leave
      ctx.show(spyP, t < T.tech - 0.5 || t > T.there + 1.5 ? 0 : ctx.depthAlpha(D_SPY, t));
      const awake = sstep(T.tiny - 0.1, T.tiny + 0.3, t) * (1 - 0.7 * sstep(T.there, T.there + 0.8, t));
      eye.setAttribute("fill", OT.rgb(OT.mix([26, 22, 18], [207, 239, 255], awake)));
      eye.style.filter = awake > 0.05 ? `drop-shadow(0 0 ${(16 * awake).toFixed(0)}px rgba(160,220,255,.9))` : "none";
      const look = cam.x - SPY.x, lookY = cam.y - SPY.y;
      const lk = Math.min(1, Math.hypot(look, lookY) / 400);
      const ang = Math.atan2(lookY, look);
      pupil.setAttribute("cx", (Math.cos(ang) * 12 * lk).toFixed(2)); pupil.setAttribute("cy", (Math.sin(ang) * 12 * lk).toFixed(2));
      pupil.setAttribute("r", (12 * awake + 2).toFixed(2));

      // ---- station 3: CPU, address, flash
      ctx.show(cpuP, t < T.there - 0.5 ? 0 : ctx.depthAlpha(D_CPU, t));
      const alive = sstep(T.reset - 0.1, T.reset + 0.4, t);
      die.setAttribute("opacity", (0.35 + 0.65 * alive).toFixed(3));
      die.setAttribute("fill", OT.rgb(OT.mix([28, 16, 10], [74, 30, 10], alive)));
      die.style.filter = alive > 0.05 ? `drop-shadow(0 0 ${(26 * alive).toFixed(0)}px rgba(255,120,40,.55))` : "none";
      rst.setAttribute("opacity", (0.25 + 0.75 * sstep(T.then, T.reset, t) * (1 - 0.6 * sstep(T.reset, T.reset + 0.6, t))).toFixed(3));
      const ad = tw(T.fetches, T.address + 0.2, t, "cubicInOut");
      athread.style.strokeDashoffset = (athreadLen * (1 - ad)).toFixed(1);
      athread.setAttribute("opacity", (ad > 0 ? 1 : 0) * (1 - 0.7 * sstep(T.often, T.often + 1, t)));
      const colA = sstep(T.address - 0.6, T.address, t);
      ramcol.setAttribute("opacity", colA.toFixed(3)); fwwin.setAttribute("opacity", colA.toFixed(3));
      ramlbl.setAttribute("fill", `rgba(255,226,196,${(0.75 * sstep(T.address - 0.2, T.address + 0.3, t) * (1 - 0.55 * sstep(T.ram + 0.2, T.ram + 0.8, t))).toFixed(3)})`);
      ramx.setAttribute("fill", `rgba(255,150,120,${(0.85 * sstep(T.ram - 0.1, T.ram + 0.2, t) * (1 - sstep(T.often, T.often + 0.8, t))).toFixed(3)})`);
      ramcol.setAttribute("stroke", `rgba(255,220,180,${(0.4 * (1 - 0.5 * sstep(T.ram + 0.2, T.ram + 0.8, t))).toFixed(3)})`);
      const lp = tw(T.sixteen - 0.2, T.sixteen + 0.5, t, "expoOut");
      lthread.setAttribute("opacity", lp.toFixed(3));
      [l4g, lf0, lff].forEach((e, i) => e.setAttribute("fill", `rgba(255,226,196,${(0.75 * sstep(T.sixteen + 0.2 * i, T.sixteen + 0.4 + 0.2 * i, t)).toFixed(3)})`));
      const fl = tw(T.flash - 0.15, T.flash + 0.55, t, "cubicInOut");
      fthread.style.strokeDashoffset = (fthreadLen * (1 - fl)).toFixed(1);
      flashG.setAttribute("opacity", (0.35 + 0.65 * sstep(T.flash + 0.2, T.flash + 0.6, t)).toFixed(3));
      flashG.style.filter = t > T.flash + 0.3 ? "drop-shadow(0 0 16px rgba(255,170,80,.6))" : "none";
      cells.forEach((c, i) => {
        const appear = sstep(T.sixteen + i * 0.035, T.sixteen + 0.25 + i * 0.035, t);
        c.style.opacity = (appear * (1 - sstep(T.cache - 0.6, T.cache, t))).toFixed(3);
        const filled = inv(T.holding - 0.15 + i * 0.05, T.holding + 0.15 + i * 0.05, t);
        const txt = filled >= 1 ? RESET_BYTES[i] : filled > 0 ? "0123456789ABCDEF"[Math.floor(OT.hash(i, Math.floor(t * 30)) * 16)] + "0123456789ABCDEF"[Math.floor(OT.hash(i + 40, Math.floor(t * 30)) * 16)] : "";
        if (c.textContent !== txt) c.textContent = txt;
        const gold = i < 3 && t > T.firmware;
        c.style.color = gold ? "#ffc54d" : "#ffe2bf";
        c.style.borderColor = i === 0 ? "rgba(255,197,77,.95)" : gold ? "rgba(255,197,77,.7)" : "rgba(255,200,140,.45)";
        c.style.boxShadow = i === 0 && t > T.sixteen + 0.3 ? "0 0 18px rgba(255,190,70,.6)" : "none";
      });
      // the firmware camps in the cache
      const mv = tw(T.borrows - 0.2, T.cache + 0.1, t, "cubicInOut");
      ctx.place(fwBlock, lerp(1662, 996, mv), lerp(82, 492, mv), 0, `scale(${lerp(1, 0.42, mv).toFixed(4)})`);
      fwBlock.style.transformOrigin = "0 0";
      fwBlock.style.opacity = (sstep(T.borrows - 0.3, T.borrows, t) * (1 - sstep(T.cleanEnd, T.cleanEnd + 0.5, t))).toFixed(3);
      const room = sstep(T.cache - 0.3, T.cache + 0.2, t);
      cacheR.setAttribute("opacity", (0.4 + 0.6 * room).toFixed(3));
      cacheR.setAttribute("fill", `rgba(255,190,110,${(0.22 * room).toFixed(3)})`);
      cacheR.setAttribute("stroke-dasharray", room > 0.5 ? "none" : "8 7");
      cacheL.setAttribute("fill", `rgba(255,226,196,${(0.8 * room).toFixed(3)})`);
      // memory training: lanes appear, eyes open one by one
      LANES2.forEach((L) => {
        const show = sstep(T.trains - 0.2 + L.i * 0.04, T.trains + 0.3 + L.i * 0.04, t);
        const open = tw(L.t0, L.t0 + 0.45, t, "expoOut");
        L.line.setAttribute("opacity", (show * (0.25 + 0.55 * open)).toFixed(3));
        L.g.setAttribute("opacity", show.toFixed(3));
        const jitF = Math.floor(t * 24);
        L.arcs.forEach((a, j) => a.setAttribute("d", eyePath(open, j, (1 - open) * (OT.hash(L.i * 7 + j, jitF) - 0.5) * 14)));
        L.smp.setAttribute("transform", `translate(${(lerp(-52 + (L.i % 3) * 12, 0, open)).toFixed(1)} 0)`);
        L.smp.setAttribute("opacity", (1 - 0.6 * sstep(L.t0 + 0.5, L.t0 + 1, t)).toFixed(3));
      });

      // ---- the memory hall: dark, then lit row by row while we fly through
      HALL.forEach((H) => {
        ctx.show(H.p, t < T.often - 1 ? 0 : ctx.depthAlpha(H.d, t, [420, 820], [-3600, -2200]) * (1 - sstep(T.wakes2 - 0.4, T.wakes2 + 0.3, t)));
        H.chips.forEach((c) => {
          const on = sstep(c.tl, c.tl + 0.25, t);
          c.el.style.background = on > 0.02 ? `repeating-linear-gradient(90deg, rgba(150,225,255,${(0.5 * on).toFixed(2)}) 0 7px, rgba(150,225,255,${(0.12 * on).toFixed(2)}) 7px 14px), rgba(12,16,22,.9)` : "rgba(16,18,24,.6)";
          c.el.style.boxShadow = on > 0.02 ? `0 0 0 2px rgba(170,230,255,${(0.3 + 0.6 * on).toFixed(2)}), 0 0 ${(40 * on).toFixed(0)}px rgba(120,210,255,${(0.5 * on).toFixed(2)})` : "0 0 0 2px rgba(120,130,150,.28)";
        });
      });

      // ---- station 5: devices, partitions, the bootloader, the seal
      ctx.show(devP, t < T.cleanEnd - 0.5 ? 0 : ctx.depthAlpha(D_DEV, t, [430, 820], [-3400, -2000]));
      const keep = 1 - sstep(T.clear0, T.clear1, t);          // the tail: everything but the card and the seal leaves
      dts.forEach((p, i) => {
        const u = tw(T.wakes2 - 0.2 + i * 0.2, T.wakes2 + 0.4 + i * 0.2, t, "cubicOut");
        p.style.strokeDashoffset = (600 * (1 - u)).toFixed(1);
        p.setAttribute("opacity", (0.7 * (1 - 0.6 * sstep(T.partition, T.partition + 0.6, t)) * keep).toFixed(3));
      });
      hubdot.setAttribute("opacity", keep.toFixed(3));
      const split = tw(T.partition - 0.3, T.partition + 0.5, t, "expoOut");
      devs.forEach(({ e, tl, name }) => {
        const on = sstep(tl, tl + 0.3, t);
        e.style.boxShadow = on > 0.02 ? `0 0 ${(40 * on).toFixed(0)}px rgba(120,210,255,${(0.35 * on).toFixed(2)})` : "none";
        e.style.borderColor = `rgba(160,210,255,${(0.35 + 0.55 * on).toFixed(2)})`;
        e.style.color = `rgba(200,230,255,${(0.35 + 0.6 * on).toFixed(2)})`;
        e.style.opacity = ((name === "NVMe" ? 1 - split : 1 - 0.75 * sstep(T.partition, T.partition + 0.6, t)) * keep).toFixed(3);
      });
      // the NVMe drive opens into its partitions
      const PX = 300, PY = 640, PW = 1320;
      esp.style.left = lerp(760, PX, split) + "px"; esp.style.top = lerp(690, PY, split) + "px";
      esp.style.width = lerp(400, 190, split) + "px";
      root.style.left = lerp(760, PX + 206, split) + "px"; root.style.top = lerp(690, PY, split) + "px";
      root.style.width = lerp(400, PW - 206, split) + "px";
      const espOn = sstep(T.fat - 0.2, T.fat + 0.2, t);
      esp.style.background = OT.rgb(OT.mix([30, 26, 22], [74, 52, 26], espOn));
      esp.style.boxShadow = `0 0 0 2.5px rgba(255,${Math.round(lerp(210, 197, espOn))},${Math.round(lerp(180, 77, espOn))},${(0.4 + 0.5 * espOn).toFixed(2)})${espOn > 0.05 ? `, 0 0 ${(36 * espOn).toFixed(0)}px rgba(255,180,80,${(0.4 * espOn).toFixed(2)})` : ""}`;
      esp.style.color = OT.rgb(OT.mix([200, 190, 175], [255, 214, 140], espOn));
      esp.style.fontSize = "28px"; esp.style.fontWeight = "700";
      root.style.background = "#14110e"; root.style.boxShadow = "0 0 0 2.5px rgba(200,190,175,.3)"; root.style.color = "rgba(200,190,175,.55)"; root.style.fontSize = "28px";
      esp.style.opacity = root.style.opacity = (sstep(T.partition - 0.4, T.partition, t) * keep).toFixed(3);
      ctx.place(espLbl, PX, PY - 46, 0);
      espLbl.style.opacity = (0.9 * sstep(T.fat - 0.1, T.fat + 0.3, t) * keep).toFixed(3);
      const fs = clamp(spring(t, T.older, 16, 0.45), 0, 1.3);
      ctx.place(fat, PX + 330, PY - 120, 0, `rotate(-8deg) scale(${lerp(1.6, 1, Math.min(1, fs)).toFixed(3)})`);
      fat.style.opacity = (sstep(T.older - 0.05, T.older + 0.05, t) * (1 - 0.65 * sstep(T.boot, T.boot + 0.5, t)) * keep).toFixed(3);
      const tr = tw(T.boot - 0.3, T.boot + 0.3, t, "cubicOut");
      ctx.place(treeEl, PX, PY + 150 + 30 * (1 - tr), 0);
      treeEl.style.opacity = (tr * (1 - 0.8 * sstep(T.secure, T.secure + 0.6, t)) * keep).toFixed(3);
      // shim lifts into a card; the firmware's trusted key; the seal
      const lift = tw(T.secure - 0.2, T.secure + 0.6, t, "expoOut");
      ctx.place(card, lerp(PX + 100, 780, lift), lerp(PY + 300, 470, lift), 0, `scale(${lerp(0.5, 1, lift).toFixed(4)})`);
      card.style.transformOrigin = "0 0";
      card.style.opacity = lift.toFixed(3);
      const gt = tw(T.secure + 0.2, T.secure + 0.8, t, "expoOut");
      ctx.place(gate, 1500 + 40 * (1 - gt), 430, 0);
      gate.style.opacity = (gt * keep).toFixed(3);
      const unlock = tw(T.ms, T.ms + 0.45, t, "backOut");
      gateArc.setAttribute("transform", `translate(${(18 * unlock).toFixed(1)} ${(-14 * unlock).toFixed(1)}) rotate(${(-22 * unlock).toFixed(1)} 90 62)`);
      const st = clamp(spring(t, T.signed + 0.1, 15, 0.5), 0, 1.25);
      ctx.place(stamp, 1250, 540, 0, `rotate(-12deg) scale(${lerp(2.2, 1, Math.min(1, st)).toFixed(4)})`);
      stamp.style.opacity = sstep(T.signed - 0.05, T.signed + 0.12, t).toFixed(3);
      {
        // the seal flares where it lands: no global exposure change
        const dl = t - T.land;
        const fl = (dl < -0.02 ? 0 : dl < 0 ? sstep(-0.02, 0, dl) : Math.exp(-dl * 2.6)) * keep;
        stamp.style.filter = fl > 0.01 ? `brightness(${(1 + 0.5 * fl).toFixed(3)}) drop-shadow(0 0 ${(6 + 26 * fl).toFixed(1)}px rgba(255,130,90,${(0.3 + 0.55 * fl).toFixed(2)}))` : "none";
        sealHalo.style.opacity = (0.95 * fl).toFixed(3);
        ctx.place(sealHalo, 1375, 665, 0, `scale(${lerp(0.45, 1.1, E.expoOut(clamp((dl + 0.02) / 0.6))).toFixed(4)})`);
      }
    });
  },
});
