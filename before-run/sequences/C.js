/* C — Bootstrapping · s06 s07 s08 s09 s10(optional) s11.
 *
 * The signed bootloader hands a folded kernel out of itself; the kernel unfolds like origami, grabs its own straps
 * and climbs (the camera climbs with it) past the dark ghosts of B's floor; it spreads into a floor of the world
 * (page tables, scheduler, interrupts — one framing, led by the lamp), wakes the cores, snaps drivers in, mounts the
 * disk far below, and sends one gold spark up through the membrane: PID 1. The seed grows the family tree toward the
 * surface (A's ghost tree, switched on), copies itself, sprouts services, gets an address, opens a login screen and
 * hands the GPU to the compositor; the screen above lights and we rise into it ((s10) the password is hashed and
 * matched against /etc/shadow under an x-ray lens); the light becomes the wallpaper of A's desktop. The dashed gold
 * clang is still missing.
 *
 * Geography (local depth; smaller = nearer the surface): device floor −91 (baton 1) · ghosts of B's memory rows and
 * CPU −791…−2391 · kernel floor D_K −2700 · membrane D_MEM −4300 · seed D_SEED −4400, the tree's rings rise toward
 * the surface in steps of 50 · desktop D_DESK −5500 · exit camera z −7000 (baton 2, scale 0.4).
 * Both forms of s10 work: every s10 anchor is guarded by ctx.has("s10").
 */
OT.sequence({
  id: "C",
  build(ctx) {
    const { clamp, lerp, sstep, tw, spring, E } = OT;
    const { t0, t1 } = ctx;
    const S10 = ctx.has("s10");
    const at = (b, w, n) => ctx.at(b, w, n), end = (b, w, n) => ctx.end(b, w, n);

    // ================= beats (every time comes from a word) =================
    const T = {
      boot: at("s06", "bootloader"), loads: at("s06", "loads"), kernel: at("s06", "kernel,"), unpacks: at("s06", "unpacks"), itself: at("s06", "itself."),
      booting: at("s06", "booting,"), bstrap: at("s06", "bootstrapping:"), pulling: at("s06", "pulling"), bootstraps: at("s06", "bootstraps."),
      impossible: at("s06", "Impossible"), computers: at("s06", "Computers"),
      sets: at("s07", "sets"), page: at("s07", "page"), sched: at("s07", "scheduler,"), irq: at("s07", "interrupts."), irqEnd: end("s07", "interrupts."),
      wakes: at("s07", "wakes"), other: at("s07", "other"), cores: at("s07", "cores,"), drivers: at("s07", "drivers,"),
      mounts: at("s07", "mounts"), disk: at("s07", "disk,"), starts: at("s07", "starts"), one: at("s07", "one"),
      process: at("s08", "Process"), oneP: at("s08", "one."), everything: at("s08", "Everything"), desktop8: at("s08", "desktop,"),
      editor8: at("s08", "editor,"), compiler8: at("s08", "compiler,"), child: at("s08", "child,"), grand: at("s08", "grandchild,"),
      ggrand: at("s08", "great-great-grandchild."), born: at("s08", "born"), copy: at("s08", "copy"), family: at("s08", "family"), begins: end("s08", "begins."),
      systemd: at("s09", "system-D,"), dozens: at("s09", "dozens"), router: at("s09", "router"), address: at("s09", "address."),
      login: at("s09", "login"), compositor: at("s09", "compositor"), takes: at("s09", "takes"), graphics: at("s09", "graphics"),
      draws: at("s09", "draws"), frameEnd: end("s09", "frame."),
      few: at("s11", "A"), desktop: at("s11", "desktop,"), hundred: at("s11", "hundred"), still: at("s11", "still"), compiler: at("s11", "compiler."),
    };
    const P = S10 ? {
      type: at("s10", "type"), password: at("s10", "password."), passwordEnd: end("s10", "password."), stored: at("s10", "stored."),
      hashes: at("s10", "hashes"), typed: at("s10", "typed"), compares: at("s10", "compares"), shadow: at("s10", "shadow."),
      match: at("s10", "match."), welcome: at("s10", "Welcome."), welcomeEnd: end("s10", "Welcome."),
    } : null;
    // s11: where the rise to the desktop starts (s10: after "Welcome."; without s10 the rise to the light carries on)
    const PB0 = S10 ? P.welcomeEnd + 0.1 : T.draws + 0.2;
    const A0 = T.desktop;                                       // the desktop framing is reached on "desktop,"

    const NAVY = "#070c1c", PLUM_D = "#1e1730", PLUM = "#2b2140", WALL = "#e2dacb", PAPER = "#efeae0";
    // ================= geography =================
    const D_K = -2700, D_MEM = -4300, D_SEED = -4400, RG = 50, D_DESK = -5500;
    const D_FUN = D_DESK + 250, D_LIGHTS = D_SEED - 100, D_DEV = -90;
    const RING_D = (g) => D_SEED - RG * g;
    const FR = {
      c0: { x: 960, y: 640, z: 0 },
      card: { x: 985, y: 785, z: 0 },                    // holds the card and the space under it (≤ 150 px from t0)
      f1: { x: 960, y: 1500, z: D_K },                   // the kernel floor: core, page tables, scheduler, interrupts
      f2: { x: 960, y: 1500, z: D_K - 600 },             // the whole floor: + cores, drivers, the disk far below
      m: { x: 960, y: 1165, z: D_SEED - 50 },            // just above the membrane: the seed and the tree growing up
      t: { x: 960, y: 1380, z: D_DESK + 300 },           // the whole tree; the screen's edge above
      s: { x: 960, y: 640, z: D_DESK },                  // the screen, scale 1 (s10)
      x: { x: 960, y: 640, z: D_DESK - 1500 },           // baton 2: A's desktop seen whole, scale 0.4
    };
    const sc = (d, f) => 1000 / (1000 - (f.z - d));
    // the world point (at depth d) that framing f shows at screen (sx, sy)
    const Wp = (sx, sy, d, f) => { const s = sc(d, f); return { x: f.x + (sx - 960) / s, y: f.y + (sy - 640) / s, d }; };

    // ================= styles =================
    ctx.el("style", "", document.head, `
      .sC-svg { position:absolute; left:0; top:0; overflow:visible; }
      .sC-svg text { font-family:"JetBrains Mono",monospace; }
      .sC-clip { position:absolute; left:0; top:509px; width:1920px; height:1600px; overflow:hidden; }
      .sC-blk { position:absolute; left:0; top:0; width:960px; height:320px; }
      .sC-pan { position:absolute; left:0; top:0; transform-origin:0 0; }
      .sC-pan > i { position:absolute; left:0; top:0; right:0; bottom:0; display:block; }
      .sC-pan .f { background-color:#0f1c33; background-image:repeating-linear-gradient(0deg, rgba(143,224,255,.11) 0 2px, transparent 2px 13px), repeating-linear-gradient(90deg, rgba(143,224,255,.05) 0 1px, transparent 1px 24px); box-shadow:inset 0 0 0 1.5px rgba(143,224,255,.30); }
      .sC-pan .b { background-color:#0b111e; background-image:repeating-linear-gradient(45deg, rgba(143,224,255,.09) 0 2px, transparent 2px 7px); box-shadow:inset 0 0 0 1.5px rgba(143,224,255,.42); }
      .sC-pan .sh { background:linear-gradient(120deg, rgba(220,245,255,0) 15%, rgba(220,245,255,.6) 50%, rgba(220,245,255,0) 85%); }
      .sC-kt { position:absolute; left:0; width:960px; text-align:center; font-family:"JetBrains Mono",monospace; white-space:pre; z-index:20; }
      .sC-kn { top:106px; font-size:32px; line-height:40px; font-weight:700; color:#ffc54d; text-shadow:0 0 16px rgba(255,190,70,.55); }
      .sC-ks { top:160px; font-size:20px; line-height:26px; color:rgba(255,230,200,.62); }
      .sC-kl { top:262px; font-size:34px; line-height:40px; color:#e8f6ff; text-shadow:0 0 14px rgba(140,210,255,.35); }
      .sC-chip { position:absolute; border-radius:8px; background:rgba(26,24,24,.16); box-shadow:0 0 0 2px rgba(140,140,150,.26); }
      .sC-lat { position:absolute; background:repeating-linear-gradient(0deg, rgba(143,224,255,.09) 0 2px, transparent 2px 80px), repeating-linear-gradient(90deg, rgba(143,224,255,.09) 0 2px, transparent 2px 80px); }
      .sC-lbl { position:absolute; font-family:"JetBrains Mono",monospace; font-size:22px; line-height:28px; color:rgba(200,235,255,.72); white-space:pre; }
      .sC-cpu { position:absolute; width:240px; height:240px; border-radius:20px; font:700 40px/240px "JetBrains Mono",monospace; text-align:center; }
      .sC-mod { position:absolute; left:0; top:0; width:440px; height:120px; border-radius:16px; font:600 40px/120px "JetBrains Mono",monospace; text-align:center; color:#d9f3ff; background:#0f2038; }
      .sC-sock { position:absolute; width:440px; height:120px; border-radius:16px; border:3px dashed rgba(143,224,255,.25); }
      .sC-part { position:absolute; border-radius:24px; font-family:"JetBrains Mono",monospace; white-space:pre; display:flex; align-items:center; }
      .sC-dev { position:absolute; border-radius:70px; font:600 140px "JetBrains Mono",monospace; display:flex; align-items:center; justify-content:center; }
      .sC-grid { position:absolute; background:repeating-linear-gradient(0deg, rgba(170,230,255,.45) 0 2px, transparent 2px 90px), repeating-linear-gradient(90deg, rgba(170,230,255,.45) 0 2px, transparent 2px 90px); }
      .sC-grid.lit { background:repeating-linear-gradient(0deg, rgba(225,248,255,.95) 0 3px, transparent 3px 90px), repeating-linear-gradient(90deg, rgba(225,248,255,.95) 0 3px, transparent 3px 90px); }
      .sC-ring { position:absolute; left:0; top:0; width:200px; height:200px; margin:-100px 0 0 -100px; border-radius:50%; border:4px solid rgba(225,248,255,.95); box-shadow:0 0 24px rgba(200,240,255,.8), inset 0 0 18px rgba(200,240,255,.5); }
      .sC-cell { position:absolute; left:0; top:0; border-radius:50%; font-family:"JetBrains Mono",monospace; }
      .sC-cell > i { position:absolute; left:0; top:0; right:0; bottom:0; display:block; border-radius:50%; }
      .sC-cell .g { background:radial-gradient(circle at 42% 38%, rgba(255,236,200,.5), rgba(255,196,120,.18) 55%, rgba(255,170,90,0) 74%); box-shadow:inset 0 0 0 3px rgba(255,214,160,.6), 0 0 50px rgba(255,190,110,.25); }
      .sC-cell .d { border:3px dashed rgba(255,214,160,.75); }
      .sC-cell .d.au { border:4px dashed #ffc54d; box-shadow:0 0 22px rgba(255,190,70,.35); }
      .sC-cell .au { box-shadow:inset 0 0 0 5px #ffc54d, 0 0 46px rgba(255,190,70,.55); }
      .sC-cell .l { position:absolute; left:-260px; right:-260px; top:50%; height:40px; margin-top:-20px; line-height:40px; text-align:center; font-size:30px; color:#fff3df; white-space:pre; }
      .sC-cell .l.gold { color:#ffc54d; text-shadow:0 0 14px rgba(255,190,70,.5); }
      .sC-cell .p { position:absolute; left:-200px; right:-200px; top:50%; margin-top:16px; text-align:center; font-size:22px; line-height:28px; color:rgba(255,230,200,.75); white-space:pre; }
      .sC-th { position:absolute; left:0; top:0; height:3px; margin-top:-1.5px; background:#ffd6a0; transform-origin:0 50%; }
      .sC-rib { position:absolute; left:0; top:0; background:#ffd6a0; }
      .sC-rib.au { background:#ffc54d; box-shadow:0 0 10px rgba(255,190,70,.6); }
      .sC-rib.dash { background:repeating-linear-gradient(90deg, #ffc54d 0 16px, transparent 16px 28px); }
      .sC-rib.cy { background:#8fe0ff; box-shadow:0 0 12px rgba(120,210,255,.7); }
      .sC-rib.mnt { background:linear-gradient(90deg, #d9f3ff, #8fe0ff 40%, rgba(143,224,255,.3)); box-shadow:0 0 14px rgba(120,210,255,.55); }
      .sC-bud { position:absolute; left:0; top:0; width:60px; height:60px; border-radius:50%; background:radial-gradient(circle at 42% 38%, rgba(255,236,200,.6), rgba(255,196,120,.22) 55%, rgba(255,170,90,0) 74%); box-shadow:inset 0 0 0 3px rgba(255,214,160,.65), 0 0 30px rgba(255,190,110,.3); }
      .sC-bl { position:absolute; left:0; top:0; width:700px; height:40px; line-height:40px; font-family:"JetBrains Mono",monospace; font-size:32px; color:#fff3df; white-space:pre; }
      .sC-addr { position:absolute; left:0; top:0; width:900px; height:80px; line-height:80px; text-align:right; font:700 66px "JetBrains Mono",monospace; color:#fff3df; white-space:pre; }
      .sC-lg { position:absolute; left:0; top:0; background:#efeae0; box-shadow:0 0 60px rgba(255,246,230,.45); overflow:hidden; }
      .sC-lg i { position:absolute; left:50%; top:50%; width:200px; height:26px; margin:-13px 0 0 -100px; border-radius:13px; background:#d8d1c3; display:block; }
      .sC-scr { position:absolute; left:0; top:0; width:1920px; height:1080px; background:#efeae0; box-shadow:0 0 220px 60px rgba(255,244,226,.30); }
      .sC-scr i { position:absolute; left:0; top:0; right:0; bottom:0; display:block; background:radial-gradient(ellipse 70% 70% at 50% 42%, rgba(255,252,246,.85), rgba(255,252,246,0) 75%); }
      .sC-av { position:absolute; left:896px; top:196px; width:128px; height:128px; border-radius:50%; background:#e2dacb; box-shadow:inset 0 0 0 3px #cfc6b5; }
      .sC-av::after { content:""; position:absolute; left:40px; top:26px; width:48px; height:48px; border-radius:50%; background:#cfc6b5; }
      .sC-fld { position:absolute; left:680px; top:400px; width:560px; height:78px; border-radius:16px; background:#f8f5ee; box-shadow:inset 0 0 0 2.5px #cfc6b5; }
      .sC-dot { position:absolute; left:0; top:0; width:20px; height:20px; margin:-10px 0 0 -10px; border-radius:50%; background:#1e1d1a; }
      .sC-lock { position:absolute; left:1262px; top:398px; width:64px; height:82px; }
      .sC-strip { position:absolute; left:0; top:0; height:64px; line-height:64px; font:700 52px "JetBrains Mono",monospace; color:#fff3df; white-space:pre; text-shadow:0 0 14px rgba(255,214,160,.35); }
      .sC-strip b { display:inline-block; width:18px; height:38px; margin:0 3px; vertical-align:-6px; border-radius:4px; background:#fff3df; }
      .sC-file { position:absolute; left:0; top:0; height:60px; line-height:60px; font:700 50px "JetBrains Mono",monospace; color:rgba(255,236,214,.78); white-space:pre; }
      .sC-lights { position:absolute; left:0; top:0; }
      .sC-clf { position:absolute; left:0; top:0; width:220px; height:220px; margin:-110px 0 0 -110px; border-radius:50%; border:6px dashed #a26a05; font-family:"JetBrains Mono",monospace; }
      .sC-clf span { position:absolute; left:-100px; right:-100px; top:50%; height:60px; margin-top:-30px; line-height:60px; text-align:center; font-size:52px; font-weight:700; color:#a26a05; }
    `);

    // ---- helpers: every owned style is written every frame; the caches only skip identical DOM writes
    const setO = (e, v) => { const s = v <= 0.0005 ? "0" : v >= 0.9995 ? "1" : v.toFixed(3); if (e._o !== s) { e.style.opacity = s; e._o = s; } };
    const setT = (e, s) => { if (e._t !== s) { e.style.transform = s; e._t = s; } };
    const setS = (e, k, s) => { const c = "_s" + k; if (e[c] !== s) { e.style[k] = s; e[c] = s; } };
    const setA = (e, k, s) => { const c = "_a" + k; if (e[c] !== s) { e.setAttribute(k, s); e[c] = s; } };
    const vis = (e, a) => ctx.show(e, a);
    const f1 = (v) => v.toFixed(1), f3 = (v) => v.toFixed(3);
    const pulse = (t, tp, up = 0.08, down = 2.4) => { const d = t - tp; return d < -up ? 0 : d < 0 ? sstep(-up, 0, d) : Math.exp(-d * down); };
    // a 3D thread between two world points (CSS z = −depth), a ribbon facing the camera; grow it with width
    const ribbon = (a0, b0, cls, h = 3, ra = 0, rb = 0) => {
      const e = ctx.el("div", "sC-rib " + (cls || ""));
      const ux = b0.x - a0.x, uy = b0.y - a0.y, ul = Math.hypot(ux, uy) || 1;
      const a = { x: a0.x + (ux / ul) * ra, y: a0.y + (uy / ul) * ra, d: a0.d }, b = { x: b0.x - (ux / ul) * rb, y: b0.y - (uy / ul) * rb, d: b0.d };
      const dx = b.x - a.x, dy = b.y - a.y, dz = -(b.d - a.d), L = Math.hypot(dx, dy, dz);
      const U = [dx / L, dy / L, dz / L];
      let V = [-U[1], U[0], 0]; const vl = Math.hypot(V[0], V[1]) || 1; V = V.map((v) => v / vl);
      const W = [U[1] * V[2] - U[2] * V[1], U[2] * V[0] - U[0] * V[2], U[0] * V[1] - U[1] * V[0]];
      const Tr = [a.x - (V[0] * h) / 2, a.y - (V[1] * h) / 2, -a.d - (V[2] * h) / 2];
      e.style.height = h + "px";
      e.style.transformOrigin = "0 0";
      e.style.transform = `matrix3d(${U.map(f3x).join(",")},0,${V.map(f3x).join(",")},0,${W.map(f3x).join(",")},0,${Tr.map(f3x).join(",")},1)`;
      e.style.width = "0px";
      ctx.lens(e, (a.d + b.d) / 2);
      return { el: e, L, a, b, at: (u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), d: lerp(a.d, b.d, u) }) };
    };
    function f3x(v) { return Math.abs(v) < 1e-9 ? "0" : v.toFixed(6); }
    const grow = (r, u, a) => { setS(r.el, "width", f1(r.L * clamp(u)) + "px"); setO(r.el, u > 0.002 ? a : 0); };
    // a flat thread on a plane (2D): from (x0, y0) to (x1, y1), grown by u
    const thread = (parent, x0, y0, x1, y1, cls, r0 = 0) => {
      const e = ctx.el("div", "sC-th " + (cls || ""), parent);
      { const l = Math.hypot(x1 - x0, y1 - y0) || 1; x0 += ((x1 - x0) / l) * r0; y0 += ((y1 - y0) / l) * r0; }
      const L = Math.hypot(x1 - x0, y1 - y0);
      e.style.transform = `translate3d(${f1(x0)}px, ${f1(y0)}px, 0px) rotate(${Math.atan2(y1 - y0, x1 - x0).toFixed(4)}rad)`;
      e.style.width = "0px";
      return { el: e, L };
    };

    // ================= entry baton 1: the signed bootloader on B's device floor =================
    // B's devP sits at our local depth −91 and xy (−90, −191); a plane exactly there keeps B's pixel phase.
    const cardP = ctx.plane(-91, "", { x: -90, y: -191 });
    const bc = OT.C.bootcard(cardP);
    const cardName = bc.card.querySelector(".n");

    // ================= ghosts of B's floor (passed on the climb) =================
    const ghosts = [];
    {
      const spots = [[120, 260], [120, 520], [120, 780], [1640, 260], [1640, 520], [1640, 780], [600, 40], [1080, 40], [600, 1020], [1080, 1020]];
      [-791, -1191, -1591, -1991].forEach((d) => {
        const p = ctx.plane(d);
        spots.forEach(([x, y], j) => {
          const c = ctx.el("div", "sC-chip", p);
          const vert = j < 6;
          c.style.cssText += `left:${x - 90}px;top:${y - 191}px;width:${vert ? 160 : 240}px;height:${vert ? 200 : 90}px;`;
        });
        ghosts.push({ p, d });
      });
      const p = ctx.plane(-2391);
      let s = `<svg class="sC-svg" width="1920" height="1080"><g transform="translate(-90 -191)" fill="none" stroke="rgba(255,150,90,.22)" stroke-width="3">`;
      s += `<rect x="620" y="300" width="680" height="680" rx="18"/><rect x="780" y="460" width="360" height="360" rx="8" stroke="rgba(255,138,61,.28)"/>`;
      for (let i = 0; i < 18; i++) { const q = 650 + i * 35.5; s += `<path d="M${q} 286 V300 M${q} 980 V994 M606 ${q - 320} H620 M1300 ${q - 320} H1314"/>`; }
      p.innerHTML = s + `</g></svg>`;
      ghosts.push({ p, d: -2391 });
    }

    // ================= the kernel floor (D_K) =================
    const floorP = ctx.plane(D_K);
    const lat = ctx.el("div", "sC-lat", floorP);
    lat.style.cssText += "left:-1640px;top:-700px;width:5200px;height:3600px;";      // centre (960, 1100) = (2600, 1800) inside
    // page tables: a four-level lattice
    const PT = { x: 100, y: 1300 };
    const ptRows = [];
    {
      let s = `<svg class="sC-svg" width="1920" height="1080">`;
      const rows = [[1, 1320, 26], [4, 1400, 22], [8, 1480, 18], [16, 1560, 12]];
      const xsOf = (n) => Array.from({ length: n }, (_, i) => 350 + (i - (n - 1) / 2) * (480 / Math.max(1, n)) * (n === 1 ? 0 : 1));
      const XS = rows.map(([n]) => xsOf(n));
      // links parent → children
      for (let r = 1; r < rows.length; r++) {
        const k = rows[r][0] / rows[r - 1][0];
        s += `<g class="lk${r}" stroke="#8fe0ff" stroke-width="2" fill="none">`;
        XS[r].forEach((x, i) => { const px = XS[r - 1][Math.floor(i / k)]; s += `<path d="M${px.toFixed(1)} ${rows[r - 1][1] + rows[r - 1][2] / 2} L${x.toFixed(1)} ${rows[r][1] - rows[r][2] / 2}"/>`; });
        s += `</g>`;
      }
      rows.forEach(([n, y, sz], r) => {
        s += `<g class="nd${r}" fill="rgba(143,224,255,.18)" stroke="#8fe0ff" stroke-width="2.5">`;
        XS[r].forEach((x) => { s += `<rect x="${(x - sz / 2).toFixed(1)}" y="${y - sz / 2}" width="${sz}" height="${sz}" rx="3"/>`; });
        s += `</g><text class="tl${r}" x="92" y="${y + 7}" text-anchor="end" font-size="19" fill="rgba(200,235,255,.75)">${["PML4", "PDPT", "PD", "PT"][r]}</text>`;
      });
      const g = ctx.el("div", "", floorP);
      g.innerHTML = s + `</svg>`;
      for (let r = 0; r < 4; r++) ptRows.push({ nd: g.querySelector(`.nd${r}`), lk: r ? g.querySelector(`.lk${r}`) : null, tl: g.querySelector(`.tl${r}`) });
    }
    const ptLog = ctx.el("div", "sC-lbl", floorP, "Using GB pages for direct mapping");
    ptLog.style.left = "100px"; ptLog.style.top = "1612px";
    // the scheduler: a run-queue wheel
    const SCH = { x: 960, y: 1450, r: 130 };
    const schEl = ctx.el("div", "", floorP);
    {
      let s = `<svg class="sC-svg" width="1920" height="1080"><g class="wh" transform="translate(${SCH.x} ${SCH.y})">`;
      s += `<circle r="${SCH.r}" fill="none" stroke="#8fe0ff" stroke-width="3"/><circle r="34" fill="rgba(143,224,255,.16)" stroke="#8fe0ff" stroke-width="2.5"/>`;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * 360;
        s += `<g transform="rotate(${a})"><path d="M0 -36 V-${SCH.r - 26}" stroke="rgba(143,224,255,.45)" stroke-width="2"/><rect x="-17" y="${-SCH.r - 15}" width="34" height="30" rx="6" fill="#0d1a30" stroke="#8fe0ff" stroke-width="2.5"/>` +
          (i % 3 !== 1 ? `<circle cy="${-SCH.r}" r="7" fill="#d9f3ff"/>` : "") + `</g>`;
      }
      schEl.innerHTML = s + `</g></svg>`;
    }
    const schWheel = schEl.querySelector(".wh");
    // interrupts: a column of vector slots (GSI 0-23)
    const irqEl = ctx.el("div", "", floorP);
    const irqSlots = [];
    {
      let s = `<svg class="sC-svg" width="1920" height="1080">`;
      for (let i = 0; i < 24; i++) {
        const x = i < 12 ? 1340 : 1590, y = 1308 + (i % 12) * 24;
        s += `<g class="q${i}"><rect x="${x}" y="${y}" width="210" height="16" rx="4" fill="rgba(143,224,255,.10)" stroke="#8fe0ff" stroke-width="2"/><rect class="m" x="${x + 4}" y="${y + 4}" width="26" height="8" rx="2" fill="#d9f3ff"/></g>`;
      }
      irqEl.innerHTML = s + `</svg>`;
      for (let i = 0; i < 24; i++) { const g = irqEl.querySelector(`.q${i}`); irqSlots.push({ g, m: g.querySelector(".m") }); }
    }
    const irqLog = ctx.el("div", "sC-lbl", floorP, "PCI: Using ACPI for IRQ routing");
    irqLog.style.left = "1320px"; irqLog.style.top = "1612px";
    // the cores (outside the first framing, top of the second)
    const cpus = [0, 1, 2, 3].map((i) => {
      const e = ctx.el("div", "sC-cpu", floorP, `CPU${i}`);
      e.style.left = 384 + i * 304 + "px"; e.style.top = "620px";
      return e;
    });
    const smp = ctx.el("div", "sC-lbl", floorP, "smp: Brought up 1 node, 4 CPUs");
    smp.style.cssText += "left:0;top:886px;width:1920px;text-align:center;font-size:36px;line-height:44px;";
    // driver sockets (the modules drop into them)
    const MODS = ["autofs4", "dm_multipath", "configfs", "fuse"];
    const MOD_X = 1940, MOD_Y = (i) => 1010 + i * 150;
    MODS.forEach((_, i) => { const s = ctx.el("div", "sC-sock", floorP); s.style.left = MOD_X + "px"; s.style.top = MOD_Y(i) + "px"; });
    const mods = MODS.map((name, i) => { const e = ctx.el("div", "sC-mod", null, name); return { e, i }; });

    // ================= the bottom, far below: the disk (s07) and the GPU (s09) =================
    const devP = ctx.plane(D_DEV);
    const EXT = Wp(250, 640, D_DEV, FR.f2);                     // the root partition, far below, seen from the second framing
    const ext4 = ctx.el("div", "sC-part", devP, `ext4  /`);
    ext4.style.cssText += `left:${f1(EXT.x - 380)}px;top:${f1(EXT.y - 60)}px;width:760px;height:120px;padding:0 50px;font-size:76px;`;
    const esp = ctx.el("div", "sC-part", devP, `ESP`);
    esp.style.cssText += `left:${f1(EXT.x - 380 - 186)}px;top:${f1(EXT.y - 60)}px;width:170px;height:120px;padding:0 30px;font-size:60px;font-weight:700;color:#d6ad6a;background:rgba(74,52,26,.8);box-shadow:0 0 0 10px rgba(214,173,106,.55);`;
    const GPUc = Wp(690, 770, D_DEV, FR.t);                     // the graphics card, seen from the tree framing
    const gpu = ctx.el("div", "sC-dev", devP, "GPU");
    gpu.style.cssText += `left:${f1(GPUc.x - 450)}px;top:${f1(GPUc.y - 250)}px;width:900px;height:500px;`;

    // ================= the kernel: folded in the card, then its own plane (it climbs) =================
    const KC0 = { x: 1000, y: 760 };                            // folded block centre once it is out of the card
    const KDX = -40, KDY = 340, KDY1 = 600;                     // drift: climb → centre (960, 1360); spread → (960, 1100)
    const kerP = ctx.plane(-92);
    const gthr = ctx.el("div", "", kerP, `<svg class="sC-svg" width="1920" height="1080"><path fill="none" stroke="#ffc54d" stroke-width="3.5" stroke-linecap="round" style="filter:drop-shadow(0 0 6px rgba(255,190,70,.8))"/></svg>`).querySelector("path");
    const kClip = ctx.el("div", "sC-clip", kerP);
    const blk = ctx.el("div", "sC-blk", kClip);
    const panels = [];
    [[0, 240, 240], [240, 480, null], [720, 240, 720]].forEach(([px, pw, hx], ci) =>
      [[0, 80, 80], [80, 160, null], [240, 80, 240]].forEach(([py, ph, hy], ri) => {
        const e = ctx.el("div", "sC-pan", blk, `<i class="f"></i><i class="b"></i><i class="sh"></i>`);
        e.style.width = pw + "px"; e.style.height = ph + "px";
        e.children[0].style.backgroundColor = ["#0b172c", "#0e1b33", "#0b172c", "#0e1d36", "#13233f", "#0e1d36", "#0a1529", "#0d1a31", "#0a1529"][ci * 3 + ri];
        panels.push({ e, f: e.children[0], b: e.children[1], sh: e.children[2], px, py, hx, hy, ci, ri });
      }));
    const kName = ctx.el("div", "sC-kt sC-kn", blk, "vmlinuz-7.0.0-34-generic");
    const kSize = ctx.el("div", "sC-kt sC-ks", blk, "17,303,944 bytes");
    const kLine = ctx.el("div", "sC-kt sC-kl", blk, "Linux version 7.0.0-34-generic");
    const strapSvg = ctx.el("div", "", kerP, `<svg class="sC-svg" width="1920" height="1080"><g fill="none" stroke="#fff3df" stroke-width="6" stroke-linecap="round" style="filter:drop-shadow(0 0 10px rgba(255,236,200,.85))"><path/><path/></g></svg>`);
    const straps = Array.from(strapSvg.querySelectorAll("path"));
    const STRAP_X = [KC0.x - 250, KC0.x + 250], STRAP_Y = 600;
    // where the kernel is: its plane rises with the camera during the climb (progress = camera z / D_K)
    const kernelAt = (t) => {
      const u = clamp(ctx.camAt(t).z / D_K), s = tw(T.sets - 0.05, T.sets + 0.95, t, "cubicInOut");
      return { u, dx: KDX * u, dy: KDY1 * u + (KDY - KDY1) * s, d: lerp(-92, D_K - 1, u) };
    };
    const NAME_W = { x: 1000 + KDX, y: 600 + 126 + KDY };       // the kernel's name on the floor (world)

    // ================= the membrane (D_MEM) =================
    const SEED = { x: 960, y: 1260 };
    const memP = ctx.plane(D_MEM);
    const grid = ctx.el("div", "sC-grid", memP); grid.style.cssText += `left:${SEED.x - 3000}px;top:${SEED.y - 2000}px;width:6000px;height:4000px;`;
    const memBloom = OT.C.bloom(memP, { size: 1100, rgb: "217,243,255" });
    const gridLit = ctx.el("div", "sC-grid lit", memP); gridLit.style.cssText += `left:${SEED.x - 600}px;top:${SEED.y - 600}px;width:1200px;height:1200px;`;
    const memRing = ctx.el("div", "sC-ring", memP);
    const gpuRing = ctx.el("div", "sC-ring", memP);

    // ================= the family tree: the seed + four rings rising toward the surface =================
    const seedP = ctx.plane(D_SEED);
    const ringP = [null, 1, 2, 3, 4].map((g) => (g ? ctx.plane(RING_D(g)) : null));
    const mkCell = (parent, x, y, r, label, opts = {}) => {
      const e = ctx.el("div", "sC-cell", parent, `<i class="g"></i><i class="d${opts.goldDash ? " au" : ""}"></i>${opts.gold ? `<i class="au"></i>` : ""}<span class="l${opts.goldDash ? " gold" : ""}"></span><span class="p"></span>`);
      e.style.width = e.style.height = 2 * r + "px";
      const c = { e, x, y, r, g: e.querySelector(".g"), dsh: e.querySelector(".d"), au: e.querySelector("i.au"), l: e.querySelector(".l"), p: e.querySelector(".p") };
      c.l.textContent = label || ""; if (opts.pid) c.p.textContent = opts.pid;
      if (opts.pid) c.l.style.marginTop = "-34px";
      e.style.transform = `translate3d(${f1(x - r)}px, ${f1(y - r)}px, 0px)`;
      return c;
    };
    const seed = mkCell(seedP, SEED.x, SEED.y, 150, "systemd", { gold: true, pid: "PID 1" });
    // ring cells, laid out where the seed framing (FR.m) shows them: [ring, sx, sy, r, label, parent index]
    const CELLS = [
      [1, 790, 500, 96, "gnome-shell", -1], [1, 560, 560, 66, "", -1], [1, 1180, 520, 64, "", -1], [1, 1440, 600, 56, "", -1],
      [2, 1120, 370, 90, "editor", 0], [2, 600, 390, 60, "", 1], [2, 360, 470, 54, "", 1], [2, 1430, 420, 58, "", 3],
      [3, 990, 250, 62, "", 4], [3, 420, 300, 50, "", 5], [3, 1290, 250, 52, "", 7], [3, 220, 390, 46, "", 6], [3, 1610, 330, 46, "", 7],
      [4, 840, 165, 72, "clang", 8], [4, 620, 185, 46, "", 9], [4, 1150, 140, 48, "", 10], [4, 1480, 200, 42, "", 10],
    ];
    const GOLD_CHAIN = new Set([0, 4, 8, 13]);                  // seed → gnome-shell → editor → … → clang (the goal)
    const cells = CELLS.map(([g, sx, sy, r, label, par], i) => {
      const w = Wp(sx, sy, RING_D(g), FR.m);
      const c = mkCell(ringP[g], w.x, w.y, r, label, { goldDash: i === 13 });
      c.ring = g; c.par = par; c.w = w; c.named = !!label;
      return c;
    });
    const NAMED_T = { 0: T.desktop8, 4: T.editor8, 13: T.compiler8 };
    const RING_T = { 1: [T.child - 0.55, T.child], 2: [T.grand - 0.55, T.grand], 3: [T.ggrand - 0.6, T.ggrand - 0.1], 4: [T.ggrand - 0.1, T.ggrand + 0.45] };
    const ribs = cells.map((c, i) => {
      const pa = c.par < 0 ? { x: SEED.x, y: SEED.y, d: D_SEED } : cells[c.par].w;
      const cls = i === 13 ? "dash" : GOLD_CHAIN.has(i) ? "au" : "";
      return ribbon(pa, c.w, cls, GOLD_CHAIN.has(i) ? 4 : 3, (c.par < 0 ? 150 : cells[c.par].r) - 4, c.r - 4);
    });
    // the copy: one cell divides (the seed), the copy becomes a service
    const COPY = Wp(1250, 730, D_SEED, FR.m);
    const copyCell = mkCell(seedP, COPY.x, COPY.y, 150, "systemd", { gold: true });
    // ================= s09: services, the address, the login screen, the compositor =================
    const SV_L = ["systemd-networkd", "systemd-resolved", "systemd-udevd", "systemd-logind", "dbus-daemon", "polkitd", "cron", "", ""];
    const SV_R = ["rsyslogd", "udisksd", "ModemManager", "chronyd", "multipathd", "agetty", "sshd", "", "", ""];
    const buds = [];
    const addBud = (sx, sy, name, side, k) => {
      const w = Wp(sx, sy, D_SEED, FR.t);
      const th = thread(seedP, SEED.x, SEED.y, w.x, w.y, "", 146);
      const e = ctx.el("div", "sC-bud", seedP);
      e.style.transform = `translate3d(${f1(w.x - 30)}px, ${f1(w.y - 30)}px, 0px)`;
      let lb = null;
      if (name) {
        lb = ctx.el("div", "sC-bl", seedP); lb.textContent = name;
        if (side < 0) { lb.style.textAlign = "right"; lb.style.transform = `translate3d(${f1(w.x - 40 - 700)}px, ${f1(w.y - 20)}px, 0px)`; }
        else lb.style.transform = `translate3d(${f1(w.x + 40)}px, ${f1(w.y - 20)}px, 0px)`;
      }
      const b = { w, th, e, lb, k, name };
      buds.push(b); return b;
    };
    // two loose arcs around the seed (as the tree framing shows them), radii jittered so they never line up
    const SC0 = { x: 960, y: 573 };
    SV_L.forEach((n, i) => { const a = ((215 - i * 9.4) * Math.PI) / 180, r = 1 + 0.06 * Math.sin(i * 2.3); addBud(SC0.x + Math.cos(a) * 600 * r, SC0.y + Math.sin(a) * 255 * r, n, -1, i); });
    SV_R.forEach((n, i) => { const a = ((-35 + i * 8.3) * Math.PI) / 180, r = 1 + 0.06 * Math.cos(i * 1.9); addBud(SC0.x + Math.cos(a) * 600 * r, SC0.y + Math.sin(a) * 255 * r, n, 1, i + 0.5); });
    const jBud = (() => {   // the copy settles as systemd-journald (a bud like the others)
      const e = ctx.el("div", "sC-bud", seedP);
      e.style.transform = `translate3d(${f1(COPY.x - 30)}px, ${f1(COPY.y - 30)}px, 0px)`;
      const lb = ctx.el("div", "sC-bl", seedP, "systemd-journald"); lb.style.transform = `translate3d(${f1(COPY.x + 40)}px, ${f1(COPY.y - 20)}px, 0px)`;
      const th = thread(seedP, SEED.x, SEED.y, COPY.x, COPY.y, "", 146);
      return { e, lb, th };
    })();
    const net = buds[0];
    // DHCP: networkd throws a thread to the frame edge; it comes back carrying the address
    const EDGE = Wp(-20, 300, D_SEED, FR.t);
    const dhcpSvg = ctx.el("div", "", seedP, `<svg class="sC-svg" width="1920" height="1080"><path fill="none" stroke="#ffd6a0" stroke-width="4" stroke-linecap="round"/></svg>`);
    const dhcp = dhcpSvg.querySelector("path");
    {
      const b = net.w;
      dhcp.setAttribute("d", `M${f1(b.x)} ${f1(b.y - 30)} C${f1(b.x)} ${f1(EDGE.y + 40)}, ${f1(b.x - 80)} ${f1(EDGE.y)}, ${f1(b.x - 200)} ${f1(EDGE.y)} L${f1(EDGE.x)} ${f1(EDGE.y)}`);
    }
    const DHCP_L = dhcp.getTotalLength ? dhcp.getTotalLength() : 1500;
    const addr = ctx.el("div", "sC-addr", seedP, "10.0.2.15/24");
    const ADDR_REST = Wp(452, 372, D_SEED, FR.t);                // right edge of the address at rest, above networkd
    // the login screen: a bud near the top opens into a small lit paper rectangle (no program name)
    const LG = Wp(1500, 300, D_SEED, FR.t);
    const lgTh = thread(seedP, SEED.x, SEED.y, LG.x, LG.y, "", 146);
    const lg = ctx.el("div", "sC-lg", seedP, `<i></i>`);
    const lgBar = lg.querySelector("i");
    // the compositor (gnome-shell) takes the GPU: a thread down through the membrane to the device floor
    const gsC = cells[0];
    const gpuTop = { x: GPUc.x, y: GPUc.y - 250, d: D_DEV };
    const gpuRib = ribbon(gsC.w, gpuTop, "cy", 4);
    const GPU_MEM = gpuRib.at((D_MEM - gsC.w.d) / (gpuTop.d - gsC.w.d));
    // the mount: a thread from the kernel's floor down to the root partition
    const MNT_A = { x: 480 + 0, y: 1100, d: D_K };
    const mntRib = ribbon(MNT_A, { x: EXT.x + 380, y: EXT.y - 60, d: D_DEV }, "mnt", 7);

    // ================= the screen and the desktop (D_DESK): baton 2 lives here =================
    const deskP = ctx.plane(D_DESK);
    const desk = OT.C.desktop(deskP, { clock: "Fri Oct 9 · 9:30", running: [], twins: false });
    const scr = ctx.el("div", "sC-scr", deskP, `<i></i>`);
    const scrLight = scr.querySelector("i");
    // s10: the login screen on the screen
    const lgn = S10 ? (() => {
      const av = ctx.el("div", "sC-av", deskP);
      const fld = ctx.el("div", "sC-fld", deskP);
      const lock = ctx.el("div", "sC-lock", deskP, `<svg width="64" height="82" viewBox="0 0 64 82"><path class="sh" d="M16 38 V24 a16 16 0 0 1 32 0 V38" fill="none" stroke="#5b574e" stroke-width="7" stroke-linecap="round"/><rect x="6" y="36" width="52" height="42" rx="9" fill="#5b574e"/><circle cx="32" cy="57" r="6" fill="#efeae0"/></svg>`);
      const latchBloom = OT.C.bloom(deskP, { size: 700, rgb: "255,214,140" });
      deskP.insertBefore(latchBloom, lock);                      // in front of the paper, behind the padlock
      const dots = Array.from({ length: 8 }, () => ctx.el("div", "sC-dot"));
      return { av, fld, lock, shackle: lock.querySelector(".sh"), latchBloom, dots };
    })() : null;
    const DOT = (i) => ({ x: 732 + i * 40, y: 439 });
    // s10: under the paper, the hash funnel and /etc/shadow
    const funP = S10 ? ctx.plane(D_FUN) : null;
    const fun = S10 ? (() => {
      const svg = ctx.el("div", "", funP, `<svg class="sC-svg" width="1920" height="1080"><g fill="none" stroke="rgba(226,206,255,.75)" stroke-width="4">` +
        `<ellipse cx="960" cy="470" rx="210" ry="30"/><path d="M750 470 L930 610 V650 M1170 470 L990 610 V650"/></g>` +
        `<ellipse class="glow" cx="960" cy="560" rx="120" ry="70" fill="rgba(255,214,160,.35)" style="filter:blur(18px)"/></svg>`);
      const glow = svg.querySelector(".glow");
      const HASH = "$6$" + "<b></b>".repeat(4) + "$" + "<b></b>".repeat(8) + "…";   // $6$<salt>$<hash>: blocks, never characters
      const strip = ctx.el("div", "sC-strip", funP, HASH);
      const file = ctx.el("div", "sC-file", funP, "/etc/shadow");
      const line = ctx.el("div", "sC-strip", funP, HASH);
      const fBloom = OT.C.bloom(funP, { size: 900, rgb: "255,226,180" });
      return { glow, strip, file, line, fBloom };
    })() : null;

    // ================= s11: the processes under the wallpaper; the missing compiler =================
    const lightsP = ctx.plane(D_LIGHTS);
    const LC = { x: 960, y: 560 };
    const lightsCv = ctx.el("canvas", "sC-lights", lightsP);
    {
      const CW = 1600, CH = 1100, K = 4;                         // canvas px → 4 world px
      lightsCv.width = CW; lightsCv.height = CH;
      lightsCv.style.cssText += `left:${LC.x - (CW * K) / 2}px;top:${LC.y - (CH * K) / 2}px;width:${CW * K}px;height:${CH * K}px;`;
      const g = lightsCv.getContext("2d"), r = OT.rng(306);
      // a branching tree grown from the middle (a random walk that forks), a point of light at every step
      const pts = [];
      const walk = (x, y, a, n, depth) => {
        for (let i = 0; i < n && pts.length < 360; i++) {
          a += (r() - 0.5) * 0.5; x += Math.cos(a) * 30; y += Math.sin(a) * 22;
          if (x < 260 || x > CW - 180 || y < 140 || y > CH * 0.86) return;
          pts.push([x + (r() - 0.5) * 16, y + (r() - 0.5) * 16]);
          if (depth < 4 && r() < 0.16) walk(x, y, a + (r() < 0.5 ? -1 : 1) * (0.6 + r() * 0.6), Math.floor(n * 0.55), depth + 1);
        }
      };
      for (let k = 0; k < 10; k++) walk(CW / 2 + (r() - 0.5) * 60, CH * 0.55, (k / 10) * Math.PI * 2 + 0.3, 30, 0);
      pts.forEach(([cx, cy]) => {
        const rad = 7 + r() * 9;
        const gr = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
        gr.addColorStop(0, "rgba(232,150,64,0.55)"); gr.addColorStop(0.35, "rgba(240,170,90,0.22)"); gr.addColorStop(1, "rgba(255,200,130,0)");
        g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, rad, 0, Math.PI * 2); g.fill();
      });
    }
    const CLF_A = cells[13].w, CLF_B = { x: -880, y: 600, d: D_DESK - 1 };
    const clf = ctx.el("div", "sC-clf", null, `<span>clang</span>`);

    // ================= camera =================
    const K = (t, f, ease) => [t, ease ? { x: f.x, y: f.y, z: f.z, ease } : { x: f.x, y: f.y, z: f.z }];
    const CL0 = T.pulling, CL1 = T.impossible - 0.15, CLd = CL1 - CL0;   // the climb (a burst through 2 inner keys)
    const mixF = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u) });
    ctx.cam([
      K(t0, FR.c0), K(T.boot - 0.02, FR.c0), K(T.kernel, FR.card, "smoother"),
      K(CL0, FR.card), K(CL0 + CLd / 3, mixF(FR.card, FR.f1, 0.259)), K(CL0 + (2 * CLd) / 3, mixF(FR.card, FR.f1, 0.741)), K(CL1, FR.f1),
      K(T.wakes - 0.1, FR.f1), K(T.cores + 0.25, FR.f2, "smoother"),
      K(T.starts - 0.12, FR.f2), K(T.one, FR.m, "smoother"),
      K(T.family - 0.1, FR.m), K(T.begins + 0.55, FR.t, "smoother"),
      K(T.draws + 0.2, FR.t),
      ...(S10
        ? [K(T.frameEnd + 0.8, FR.s, "quintInOut"), K(PB0, FR.s), K(A0, FR.x, "smoother")]
        : [K(T.draws + 1.7, { x: 960, y: 640, z: D_DESK + 60 }), K(A0, FR.x)]),
      K(t1, FR.x),
    ]);
    ctx.exit(FR.x);
    ctx.margins(0, 0);

    // ================= ground, motes =================

    // the ground follows what fills the frame: paper once the screen covers it (the caption scrim and the vignette
    // take the ground colour), plum again only while the paper is x-rayed (s10), wallpaper as the paper becomes it
    const COVER = S10 ? [T.frameEnd + 0.25, T.frameEnd + 0.75] : [T.draws + 1.25, T.draws + 1.75];
    const WALLT = S10 ? [PB0 + 0.1, PB0 + 1.3] : [PB0 + 1.6, PB0 + 2.8];
    ctx.ground([
      [t0, "#100a07"], [T.pulling + 0.2, "#100a07"], [T.pulling + 1.9, NAVY],
      [T.process + 0.1, NAVY], [T.oneP + 0.25, PLUM_D], [T.family, PLUM_D], [T.begins + 0.5, PLUM],
      [COVER[0], PLUM], [COVER[1], PAPER],
      ...(S10 ? [[P.hashes - 0.2, PAPER], [P.hashes + 0.15, PLUM], [P.welcome - 0.45, PLUM], [P.welcome - 0.15, PAPER]] : []),
      [WALLT[0], PAPER], [WALLT[1], WALL], [t1, WALL],
    ]);
    ctx.motes([[t0, "embers"], [T.pulling + 1.1, "sparks"], [T.process + 0.2, "spores"], [S10 ? T.frameEnd + 0.75 : T.draws + 1.65, "dust"]]);

    // ================= light and focus (two uses) =================
    // #1 lamp: page tables → scheduler → interrupts (one framing, the eye led by light)
    ctx.light([
      [T.page - 0.25, null], [T.page + 0.3, { x: 345, y: 1450, d: D_K, rx: 330, ry: 230, dim: 0.45 }],
      [T.sched - 0.2, {}], [T.sched + 0.25, { x: 960, y: 1450, rx: 210, ry: 210 }],
      [T.irq - 0.2, {}], [T.irq + 0.25, { x: 1575, y: 1450, rx: 300, ry: 230 }],
      [T.irqEnd + 0.35, {}], [T.wakes - 0.25, null],
    ]);
    // #2 lens: s10 the x-ray to the hash funnel under the paper; without s10, the processes under the wallpaper
    if (S10) ctx.focus([[P.hashes - 0.3, null], [P.hashes + 0.4, D_FUN], [P.shadow + 0.45, D_FUN], [P.shadow + 0.8, D_DESK], [P.shadow + 1.0, null]]);
    else ctx.focus([[T.hundred - 0.3, null], [T.hundred + 0.35, D_LIGHTS], [T.still - 0.55, D_LIGHTS], [T.still - 0.1, null]]);

    // ================= hero: the gold spark =================
    const strapAt = (t) => {
      const drop = clamp(spring(t, T.bstrap - 0.06, 13, 0.38), 0, 1.35);
      const pull = tw(T.pulling - 0.15, T.pulling + 0.35, t, "cubicOut");
      const slack = tw(T.impossible - 0.1, T.impossible + 0.7, t, "cubicInOut");
      const taut = pull * (1 - slack);
      const h = slack > 0 ? lerp(235, 95, slack) : lerp(150 * drop, 235, pull);
      const w = slack > 0 ? lerp(16, 44, slack) : lerp(34, 16, pull);
      return { h: h + Math.sin(t * 37) * 3 * taut, w, a: sstep(T.bstrap - 0.06, T.bstrap + 0.12, t) * (1 - sstep(T.impossible + 0.35, T.impossible + 0.95, t)), taut };
    };
    ctx.hero((t) => {
      if (t >= T.pulling - 0.12 && t < T.impossible + 1.0) {
        const st = strapAt(t), k = kernelAt(t);
        const ride = tw(T.pulling - 0.1, T.pulling + 0.45, t, "cubicOut");
        const back = tw(T.impossible + 0.15, T.impossible + 0.85, t, "cubicInOut");
        let x = STRAP_X[1], y = lerp(STRAP_Y, STRAP_Y - st.h * 0.74, ride);
        x = lerp(x, NAME_W.x - KDX, back); y = lerp(y, NAME_W.y - KDY, back);
        const p = ctx.project(x + k.dx, y + k.dy, k.d, t);
        const a = sstep(T.pulling - 0.12, T.pulling + 0.05, t) * (1 - sstep(T.impossible + 0.6, T.impossible + 0.95, t));
        return { text: "●", x: p.x, y: p.y, size: 26 * clamp(p.s, 0.6, 1.4), glow: 0.9, opacity: a };
      }
      if (t >= T.starts - 0.12 && t < T.oneP + 0.6) {
        const A = { x: NAME_W.x, y: NAME_W.y, d: D_K - 2 }, B = { x: SEED.x, y: SEED.y, d: D_MEM + 60 }, C = { x: SEED.x, y: SEED.y, d: D_SEED };
        const u1 = tw(T.starts - 0.12, T.one, t, "smoother"), u2 = tw(T.process + 0.05, T.process + 0.45, t, "cubicInOut");
        const q = u2 > 0 ? { x: lerp(B.x, C.x, u2), y: lerp(B.y, C.y, u2), d: lerp(B.d, C.d, u2) } : { x: lerp(A.x, B.x, u1), y: lerp(A.y, B.y, u1), d: lerp(A.d, B.d, u1) };
        const p = ctx.project(q.x, q.y, q.d, t);
        const a = sstep(T.starts - 0.12, T.starts + 0.05, t) * (1 - sstep(T.process + 0.35, T.oneP + 0.2, t));
        return { text: "●", x: p.x, y: p.y, size: lerp(24, 34, u1) * (1 + 0.25 * u2), glow: 1, opacity: a };
      }
      return null;
    });

    // ================= render =================
    ctx.render((t) => {
      const cam = ctx.camAt(t);
      const k = kernelAt(t);

      // ---------------- the card (baton 1) dims as the kernel takes the spark, then recedes on the climb
      bc.rest(780, 470);
      {
        const lit = sstep(T.boot - 0.1, T.boot + 0.35, t) * (1 - sstep(T.kernel - 0.2, T.kernel + 0.4, t));
        setS(cardName, "textShadow", lit > 0.002 ? `0 0 ${f1(16 + 22 * lit)}px rgba(255,190,70,${f3(0.55 + 0.4 * lit)})` : "");
        const dim = sstep(T.kernel - 0.2, T.kernel + 0.45, t);
        vis(cardP, lerp(1, 0.35, dim) * (1 - sstep(T.pulling + 0.3, T.pulling + 1.4, t)));
      }

      // ---------------- ghosts of B's floor: passed on the climb, dark
      const gh = sstep(T.pulling - 0.1, T.pulling + 0.4, t) * (1 - sstep(T.impossible - 0.5, T.impossible + 0.4, t));
      ghosts.forEach((G) => vis(G.p, gh * ctx.depthAlpha(G.d, t, [380, 760], [-2400, -1300])));

      // ---------------- the kernel
      setT(kerP, `translate3d(${f1(k.dx)}px, ${f1(k.dy)}px, ${f1(-k.d)}px)`);
      ctx.lens(kerP, k.d);
      const kDim = (1 - 0.72 * sstep(T.starts, T.one, t)) * (1 - 0.5 * sstep(T.process, T.oneP + 0.6, t));
      const kOut = 1 - sstep(T.everything - 0.6, T.everything + 0.4, t);
      vis(kerP, t < T.loads - 0.1 ? 0 : kDim * kOut);
      {
        // slide out of the card on a gold thread
        const slide = tw(T.loads - 0.02, T.loads + 0.55, t, "expoOut");
        const cy = lerp(420, KC0.y, slide);
        setT(blk, `translate3d(${KC0.x - 480}px, ${f1(cy - 160 - 509)}px, 0px)`);
        const yTop = cy - 80;
        setA(gthr, "d", `M888 386 C888 ${f1(386 + 0.5 * (yTop - 386))}, 1000 ${f1(yTop - 0.45 * (yTop - 386))}, 1000 ${f1(yTop)}`);
        setO(gthr, sstep(T.loads - 0.1, T.loads + 0.1, t) * (1 - sstep(T.kernel + 0.35, T.kernel + 1.0, t)));
        // origami: the side flaps open (×2), then the top and bottom (×2)
        const a1 = tw(T.unpacks - 0.04, T.unpacks + 0.42, t, "cubicInOut"), a2 = tw(T.itself - 0.02, T.itself + 0.5, t, "cubicInOut");
        const CX = Math.cos(Math.PI * (1 - a1)), CY = Math.cos(Math.PI * (1 - a2));
        const sp = tw(T.sets - 0.05, T.sets + 0.95, t, "expoOut");          // the kernel spreads into the floor
        panels.forEach((p) => {
          const cx = p.hx == null ? 1 : CX, cy2 = p.hy == null ? 1 : CY;
          const tx = p.hx == null ? p.px : p.hx + (p.px - p.hx) * cx;
          const ty = p.hy == null ? p.py : p.hy + (p.py - p.hy) * cy2;
          const outer = p.ci !== 1 || p.ri !== 1;
          const ox = outer ? (p.ci - 1) * 260 * sp : 0, oy = outer ? (p.ri - 1) * 150 * sp : 0;
          const scx = Math.abs(cx) < 0.002 ? 0.002 * Math.sign(cx || 1) : cx, scy = Math.abs(cy2) < 0.002 ? 0.002 * Math.sign(cy2 || 1) : cy2;
          setT(p.e, `translate(${f1(tx + ox)}px, ${f1(ty + oy)}px) scale(${scx.toFixed(4)}, ${scy.toFixed(4)})`);
          const face = cx * cy2 >= 0;
          setO(p.f, face ? 1 : 0); setO(p.b, face ? 0 : 1);
          setO(p.sh, 0.75 * Math.max(p.hx == null ? 0 : 1 - Math.abs(cx), p.hy == null ? 0 : 1 - Math.abs(cy2)));
          // paint order: while the side flaps are still over the centre, they are on top; then the row flaps
          const z = CX < 0 ? (p.ri === 1 ? (p.ci === 1 ? 0 : 3) : p.ci === 1 ? 1 : 2) : CY < 0 ? (p.ri === 1 ? 0 : 1) : 0;
          setS(p.e, "zIndex", String(z));
          setO(p.e, outer ? 1 - sp : 1);
        });
        // the names: the spark moves from the card's name to the kernel's; the first line at "booting,"
        const nameLit = sstep(T.kernel - 0.25, T.kernel + 0.15, t);
        const spark = t < T.starts ? 1 : 1 - sstep(T.starts - 0.05, T.starts + 0.35, t);
        setO(kName, 1);
        setS(kName, "color", OT.rgb(OT.mix([255, 243, 223], [255, 197, 77], spark)));
        setS(kName, "textShadow", spark > 0.01 ? `0 0 ${f1(12 + 16 * nameLit + 14 * pulse(t, T.impossible + 0.8, 0.1, 2))}px rgba(255,190,70,${f3(0.3 + 0.35 * nameLit)})` : "none");
        setO(kSize, 1 - 0.5 * sp);
        setO(kLine, sstep(T.booting - 0.15, T.booting + 0.2, t) * (1 - sp));
      }
      // the straps
      {
        const st = strapAt(t);
        straps.forEach((p, i) => {
          const ax = STRAP_X[i], sk = i ? 1 : -1;
          const lean = Math.sin(t * 3.1 + i) * 6 * (1 - st.taut);
          setA(p, "d", `M${f1(ax - st.w)} ${STRAP_Y} C${f1(ax - st.w * 2.4 + lean)} ${f1(STRAP_Y - st.h)}, ${f1(ax + st.w * 2.4 + lean + sk)} ${f1(STRAP_Y - st.h)}, ${f1(ax + st.w)} ${STRAP_Y}`);
        });
        setO(strapSvg, st.a);
      }

      // ---------------- the kernel floor
      const fl = sstep(T.sets - 0.3, T.sets + 0.3, t) * (1 - 0.7 * sstep(T.starts, T.one, t)) * (1 - 0.5 * sstep(T.process, T.oneP + 0.6, t)) * (1 - sstep(T.everything - 0.6, T.everything + 0.4, t));
      vis(floorP, fl * ctx.depthAlpha(D_K, t, [430, 820], [-3200, -1800]));
      {
        const R = lerp(200, 2900, tw(T.sets - 0.1, T.sets + 1.7, t, "cubicOut"));
        const m = `radial-gradient(circle at 2600px 1800px, #000 ${f1(R)}px, transparent ${f1(R + 320)}px)`;
        setS(lat, "webkitMaskImage", m); setS(lat, "maskImage", m);
        const base = 0.32;                                       // unlit structures: dark outlines until named
        // page tables: rows light top-down at "page tables,"
        ptRows.forEach((r, i) => {
          const on = sstep(T.page - 0.15 + i * 0.13, T.page + 0.15 + i * 0.13, t);
          setO(r.nd, base + (1 - base) * on); if (r.lk) setO(r.lk, 0.25 + 0.6 * on); setO(r.tl, 0.45 + 0.55 * on);
          setS(r.nd, "filter", on > 0.02 ? `drop-shadow(0 0 ${f1(8 * on)}px rgba(120,210,255,.8))` : "none");
        });
        setO(ptLog, 0.35 + 0.65 * sstep(T.page + 0.2, T.page + 0.6, t));
        // the scheduler starts turning
        const sOn = sstep(T.sched - 0.15, T.sched + 0.2, t);
        const ds = Math.max(0, t - (T.sched - 0.1));
        const ang = 50 * (ds - 0.5 * (1 - Math.exp(-ds / 0.5)));
        setA(schWheel, "transform", `translate(${SCH.x} ${SCH.y}) rotate(${ang.toFixed(2)})`);
        setO(schEl, base + (1 - base) * sOn);
        setS(schEl, "filter", sOn > 0.02 ? `drop-shadow(0 0 ${f1(10 * sOn)}px rgba(120,210,255,.75))` : "none");
        // interrupts: the slots light in a cascade, then fire now and then
        irqSlots.forEach((q, i) => {
          const on = sstep(T.irq - 0.08 + i * 0.02, T.irq + 0.1 + i * 0.02, t);
          const fire = on > 0.99 ? (OT.hash(i, Math.floor(t * 7)) > 0.86 ? 1 : 0.25) : 0;
          setO(q.g, base + (1 - base) * on); setO(q.m, 0.15 + 0.85 * Math.max(on * 0.3, fire));
        });
        setO(irqLog, 0.35 + 0.65 * sstep(T.irq + 0.15, T.irq + 0.55, t));
        // the cores: CPU0 is already awake, 1–3 wake in turn
        cpus.forEach((e, i) => {
          const on = i === 0 ? 1 : sstep(T.other - 0.1 + (i - 1) * 0.22, T.other + 0.12 + (i - 1) * 0.22, t);
          setS(e, "background", `rgba(143,224,255,${f3(0.05 + 0.13 * on)})`);
          setS(e, "boxShadow", `inset 0 0 0 3px rgba(143,224,255,${f3(0.3 + 0.7 * on)}), 0 0 ${f1(50 * on)}px rgba(120,210,255,${f3(0.45 * on)})`);
          setS(e, "color", `rgba(217,243,255,${f3(0.35 + 0.65 * on)})`);
        });
        setO(smp, sstep(T.cores + 0.15, T.cores + 0.5, t));
      }
      // drivers: the modules snap into the floor from above
      mods.forEach(({ e, i }) => {
        const tl = T.drivers - 0.2 + i * 0.16;
        const u = tw(tl - 0.3, tl, t, "cubicIn");
        ctx.place(e, MOD_X, MOD_Y(i), lerp(D_K - 380, D_K - 1, u));
        const a = sstep(tl - 0.3, tl - 0.2, t) * fl * ctx.depthAlpha(D_K, t, [430, 820], [-3200, -1800]);
        setO(e, a);
        const hit = pulse(t, tl, 0.02, 3.5);
        setS(e, "boxShadow", `inset 0 0 0 3px rgba(143,224,255,${f3(0.55 + 0.45 * hit)}), 0 0 ${f1(16 + 40 * hit)}px rgba(120,210,255,${f3(0.25 + 0.5 * hit)})`);
      });
      // the disk, far below: the thread drops and locks
      {
        const mu = tw(T.mounts - 0.05, T.disk + 0.02, t, "cubicInOut");
        const lock = pulse(t, T.disk + 0.08, 0.04, 2.2);
        const after = 1 - sstep(T.starts, T.one - 0.2, t);
        grow(mntRib, mu, after);
        const eA = sstep(T.mounts - 0.35, T.mounts + 0.1, t) * after;
        const locked = sstep(T.disk, T.disk + 0.15, t);
        setO(ext4, eA * (0.55 + 0.45 * locked)); setO(esp, eA * 0.6);
        setS(ext4, "background", locked > 0.01 ? `rgba(30,48,70,${f3(0.6 + 0.3 * locked)})` : "#14110e");
        setS(ext4, "boxShadow", `0 0 0 ${f1(10 + 6 * locked)}px rgba(${locked > 0.5 ? "143,224,255" : "200,190,175"},${f3(0.3 + 0.6 * locked)}), 0 0 ${f1(240 * lock)}px rgba(120,210,255,${f3(0.6 * lock)})`);
        setS(ext4, "color", locked > 0.5 ? `rgba(217,243,255,${f3(0.7 + 0.3 * locked)})` : "rgba(200,190,175,.55)");
      }

      // ---------------- the GPU (s09), on the same far floor
      {
        const gA = sstep(T.compositor - 0.1, T.compositor + 0.4, t) * (1 - sstep(T.draws + 0.3, T.draws + 1.0, t));
        const on = sstep(T.takes - 0.05, T.takes + 0.25, t);
        const peak = pulse(t, T.graphics + 0.05, 0.25, 1.4);
        setO(gpu, gA * (0.5 + 0.5 * on));
        setS(gpu, "boxShadow", `inset 0 0 0 14px rgba(143,224,255,${f3(0.3 + 0.7 * on)}), 0 0 ${f1(120 + 260 * peak)}px rgba(120,210,255,${f3(0.15 + 0.45 * on + 0.3 * peak)})`);
        setS(gpu, "color", `rgba(217,243,255,${f3(0.4 + 0.6 * on)})`);
        setS(gpu, "background", `rgba(143,224,255,${f3(0.06 + 0.14 * on)})`);
        const devA = Math.max(sstep(T.mounts - 0.35, T.mounts + 0.1, t) * (1 - sstep(T.starts, T.one - 0.2, t)), gA);
        vis(devP, devA * ctx.depthAlpha(D_DEV, t, [430, 820], [-9000, -8000]));
        grow(gpuRib, tw(T.compositor - 0.02, T.takes - 0.02, t, "cubicIn"), gA);
      }

      // ---------------- the membrane: the spark crosses it (a ring of light on the grid, no flash)
      {
        const effM = cam.z - D_MEM;
        const near = 1 - sstep(60, 320, effM);
        const mA = sstep(T.starts + 0.2, T.one, t) * (1 - 0.45 * sstep(T.oneP, T.oneP + 1.2, t)) * (1 - sstep(T.draws + 0.4, T.draws + 1.2, t));
        vis(memP, near * mA * ctx.depthAlpha(D_MEM, t, [430, 820], [-3200, -1800]));
        const tc = T.process + 0.28, d = t - tc;
        const ru = clamp(d / 1.0);
        setT(memRing, `translate3d(${SEED.x}px, ${SEED.y}px, 0px) scale(${f3(lerp(0.25, 3.0, E.expoOut(ru)))})`);
        setO(memRing, d < -0.03 ? 0 : d < 0 ? sstep(-0.03, 0, d) : Math.pow(1 - ru, 1.6));
        const bl = pulse(t, tc, 0.05, 2.3);
        ctx.place(memBloom, SEED.x, SEED.y, 0, `scale(${f3(lerp(0.4, 1.1, E.expoOut(clamp((d + 0.05) / 0.7))))})`);
        setO(memBloom, 0.9 * bl);
        setO(gridLit, 0.85 * bl);
        const m = `radial-gradient(circle at 600px 600px, #000 ${f1(60 + 420 * E.expoOut(clamp(d / 0.8)))}px, transparent ${f1(160 + 440 * E.expoOut(clamp(d / 0.8)))}px)`;
        setS(gridLit, "webkitMaskImage", m); setS(gridLit, "maskImage", m);
        // the compositor's thread passes the membrane: a small ring where it crosses
        const tg = T.compositor + 0.06, dg = t - tg, rg = clamp(dg / 0.9);
        setT(gpuRing, `translate3d(${f1(GPU_MEM.x)}px, ${f1(GPU_MEM.y)}px, 0px) scale(${f3(lerp(0.2, 1.5, E.expoOut(rg)))})`);
        setO(gpuRing, dg < 0 ? 0 : 0.85 * Math.pow(1 - rg, 1.5));
      }

      // ---------------- the family tree
      const treeOut = S10 ? 1 - sstep(P.welcome - 0.1, P.welcome + 0.35, t) : 1 - sstep(T.draws + 0.7, T.draws + 1.5, t);
      const xray = S10 ? 1 - 0.7 * sstep(P.hashes - 0.4, P.hashes + 0.2, t) : 1;   // under the x-ray the tree is a faint ground
      const treeOn = t >= T.process - 0.05 ? treeOut * xray : 0;
      vis(seedP, treeOn * ctx.depthAlpha(D_SEED, t, [430, 820], [-3200, -1800]));
      for (let g = 1; g <= 4; g++) vis(ringP[g], (t >= T.everything - 0.1 ? treeOn : 0) * ctx.depthAlpha(RING_D(g), t, [430, 820], [-3200, -1800]));
      {
        // the seed: born from the spark, gold-rimmed while it is the protagonist
        const tc = T.process + 0.3;
        const born = E.backOut(tw(tc - 0.12, tc + 0.45, t, "lin"));
        setT(seed.e, `translate3d(${SEED.x - 150}px, ${SEED.y - 150}px, 0px) scale(${f3(Math.max(0.05, lerp(0.12, 1, born)))})`);
        setO(seed.e, sstep(tc - 0.15, tc + 0.05, t));
        setO(seed.g, 1); setO(seed.dsh, 0);
        const sysd = pulse(t, T.systemd, 0.15, 1.3);
        setO(seed.au, 1);
        setS(seed.au, "boxShadow", `inset 0 0 0 5px #ffc54d, 0 0 ${f1(46 + 50 * sysd)}px rgba(255,190,70,${f3(0.55 + 0.3 * sysd)})`);
        setO(seed.l, sstep(T.oneP - 0.1, T.oneP + 0.25, t)); setO(seed.p, sstep(T.oneP + 0.05, T.oneP + 0.4, t));
        setS(seed.l, "textShadow", sysd > 0.01 ? `0 0 ${f1(18 * sysd)}px rgba(255,236,200,${f3(0.9 * sysd)})` : "none");
        setS(seed.l, "color", OT.rgb(OT.mix([255, 243, 223], [255, 255, 255], sysd)));
        // the ghosts appear nearer the surface, light as named, turn solid when their thread arrives
        cells.forEach((c, i) => {
          const ghost = sstep(T.everything - 0.1 + c.ring * 0.11, T.everything + 0.3 + c.ring * 0.11, t);
          const named = c.named ? sstep(NAMED_T[i] - 0.12, NAMED_T[i] + 0.2, t) : 0;
          const [r0, r1] = RING_T[c.ring];
          const tu = tw(r0, r1, t, "cubicInOut");
          const solid = i === 13 ? 0 : sstep(r1 - 0.05, r1 + 0.2, t);
          setO(c.e, ghost);
          setO(c.g, solid);
          setO(c.dsh, (1 - solid) * (i === 13 ? 0.75 + 0.25 * named : 0.45 + 0.4 * named));
          setO(c.l, c.named ? named : 0);
          grow(ribs[i], tu, (GOLD_CHAIN.has(i) ? 1 : 0.6) * ghost * treeOn * ctx.depthAlpha(RING_D(c.ring), t, [430, 820], [-3200, -1800]));
        });
        // a cell divides: the copy is identical, then its name changes
        const dv = tw(T.born - 0.1, T.born + 0.65, t, "expoOut");
        const ren = tw(T.copy + 0.35, T.copy + 0.8, t, "lin");
        const shrink = sstep(T.copy + 0.45, T.copy + 0.95, t);
        const cx = lerp(SEED.x, COPY.x, dv), cy = lerp(SEED.y, COPY.y, dv);
        setT(copyCell.e, `translate3d(${f1(cx - 150)}px, ${f1(cy - 150)}px, 0px) scale(${f3(lerp(1, 0.4, shrink))})`);
        setO(copyCell.e, (t >= T.born - 0.1 ? 1 : 0) * (1 - shrink));
        setO(copyCell.g, 1); setO(copyCell.dsh, 0); setO(copyCell.au, 1 - sstep(T.copy + 0.3, T.copy + 0.7, t));
        const nm = OT.scramble("systemd", "systemd-journald", ren, t, 7);
        if (copyCell.l.textContent !== nm) copyCell.l.textContent = nm;
        setO(copyCell.l, 1);
        setO(jBud.e, shrink); setO(jBud.lb, shrink);
        jBud.th.el.style.width = f1(jBud.th.L * shrink) + "px"; setO(jBud.th.el, 0.5 * shrink);
      }
      // ---------------- s09: services sprout together; the address; the login screen; the compositor
      {
        buds.forEach((b, i) => {
          const tg = T.dozens - 0.2 + (i % 10) * 0.02 + (b.k % 1) * 0.1;
          const u = tw(tg, tg + 0.35, t, "cubicOut");
          b.th.el.style.width = f1(b.th.L * u) + "px"; setO(b.th.el, 0.45 * Math.min(1, u * 3));
          const pop = clamp(E.backOut(tw(tg + 0.25, tg + 0.55, t, "lin")), 0, 1.2);
          setT(b.e, `translate3d(${f1(b.w.x - 30)}px, ${f1(b.w.y - 30)}px, 0px) scale(${f3(Math.max(0.01, pop))})`);
          setO(b.e, pop > 0.01 ? 1 : 0);
          if (b.lb) setO(b.lb, sstep(tg + 0.35, tg + 0.6, t) * (b === net ? 1 : 0.85));
        });
        // DHCP: out to the router, back with the address
        const out = tw(T.router - 0.3, T.router + 0.2, t, "cubicOut");
        const back = tw(T.address - 0.5, T.address + 0.02, t, "cubicInOut");
        const vis1 = DHCP_L * out * (1 - back);
        setA(dhcp, "stroke-dasharray", `${f1(Math.max(0.01, vis1))} ${f1(DHCP_L + 10)}`);
        setO(dhcp, out > 0 && back < 1 ? 0.9 : 0);
        const ax = lerp(EDGE.x - 40, ADDR_REST.x, back);
        const ay = lerp(EDGE.y, ADDR_REST.y, sstep(0.55, 1, back));
        setT(addr, `translate3d(${f1(ax - 900)}px, ${f1(ay - 40)}px, 0px)`);
        const aLit = pulse(t, T.address, 0.1, 1.2);
        const s09out = 1 - sstep(T.draws + 0.2, T.draws + 0.9, t);
        setO(addr, sstep(T.address - 0.55, T.address - 0.35, t) * s09out);
        setS(addr, "textShadow", `0 0 ${f1(10 + 26 * aLit)}px rgba(255,226,180,${f3(0.35 + 0.5 * aLit)})`);
        setS(addr, "color", OT.rgb(OT.mix([255, 236, 214], [255, 255, 255], aLit)));
        // the login screen bud opens into a small lit paper rectangle
        const lt = tw(T.login - 0.35, T.login, t, "cubicOut");
        lgTh.el.style.width = f1(lgTh.L * lt) + "px"; setO(lgTh.el, 0.45 * Math.min(1, lt * 3));
        const op = tw(T.login - 0.05, T.login + 0.45, t, "expoOut");
        const w = lerp(60, 430, op), h = lerp(60, 244, op);
        setS(lg, "width", f1(w) + "px"); setS(lg, "height", f1(h) + "px"); setS(lg, "borderRadius", f1(lerp(30, 12, op)) + "px");
        setT(lg, `translate3d(${f1(LG.x - w / 2)}px, ${f1(LG.y - h / 2)}px, 0px)`);
        setO(lg, lt > 0.95 ? s09out : 0);
        setS(lg, "background", OT.rgb(OT.mix([255, 214, 160], [239, 234, 224], op)));
        setO(lgBar, sstep(T.login + 0.2, T.login + 0.5, t));
        // the compositor: gnome-shell answers its name
        const gsLit = pulse(t, T.compositor, 0.1, 1.0);
        setS(gsC.l, "textShadow", gsLit > 0.01 ? `0 0 ${f1(18 * gsLit)}px rgba(255,236,200,${f3(0.9 * gsLit)})` : "none");
      }

      // ---------------- the screen above lights; s10 the login; s11 it becomes the wallpaper
      vis(deskP, t >= T.draws - 0.2 ? 1 : 0);
      {
        const light = tw(T.draws - 0.1, T.draws + 0.5, t, "smoother");
        const xr = S10 ? sstep(P.hashes - 0.2, P.hashes + 0.15, t) * (1 - sstep(P.welcome - 0.45, P.welcome - 0.15, t)) : 0;   // in step with the ground
        const toWall = clamp((t - WALLT[0]) / (WALLT[1] - WALLT[0]));     // in step with the ground
        const gone = sstep(A0 - 1.6, A0 - 0.4, t);
        setO(scr, light * (1 - 0.9 * xr) * (1 - gone));
        setS(scr, "background", OT.rgb(OT.mix(OT.hex2(PAPER), OT.hex2(WALL), toWall)));
        setO(scrLight, (1 - toWall) * (1 - 0.9 * xr) * (0.6 + 0.4 * pulse(t, T.draws + 0.4, 0.4, 0.8)));
        setS(scr, "boxShadow", toWall < 0.99 ? `0 0 220px 60px rgba(255,244,226,${f3(0.3 * (1 - toWall))})` : "none");
        // the desktop assembles (A's dismantle in reverse)
        const wallA = sstep(A0 - 2.0, A0 - 0.3, t);
        const topU = tw(A0 - 0.8, A0 - 0.15, t, "expoOut");
        const dockU = tw(A0 - 0.25, A0 + 0.3, t, "expoOut");
        const asm = t >= PB0 ? 1 : 0;
        vis(desk.el, asm);
        setO(desk.wall, wallA);
        setT(desk.top, topU >= 1 ? "" : `translateY(${f1(-120 * (1 - topU))}px)`);
        setO(desk.top, sstep(A0 - 0.85, A0 - 0.55, t));
        setT(desk.dock, dockU >= 1 ? "" : `translateX(${f1(-260 * (1 - dockU))}px)`);
        setO(desk.dock, sstep(A0 - 0.25, A0 + 0.05, t));
        desk.icons.forEach((ic, i) => {
          const u = tw(A0 + 0.05 + i * 0.07, A0 + 0.33 + i * 0.07, t, "lin");
          const s = u >= 1 ? 1 : Math.max(0.001, E.backOut(u));
          setT(ic, u >= 1 ? "" : `scale(${f3(s)})`);
        });
        if (S10) {
          // the login: dots fill the field, dissolve, fall through the paper into the funnel, the hash comes out
          const ui = sstep(T.frameEnd + 0.75, T.frameEnd + 1.1, t);
          const fold = tw(P.welcome - 0.05, P.welcome + 0.4, t, "cubicIn");
          [lgn.av, lgn.fld, lgn.lock].forEach((e) => { setO(e, ui * (1 - fold)); setT(e, fold > 0 ? `scaleY(${f3(1 - fold)})` : ""); });
          const unl = tw(P.match + 0.15, P.match + 0.5, t, "backOut");
          setA(lgn.shackle, "transform", `translate(${f1(10 * unl)} ${f1(-12 * unl)}) rotate(${f1(-28 * unl)} 48 38)`);
          const lb = pulse(t, P.match + 0.2, 0.05, 2.0);
          ctx.place(lgn.latchBloom, 1294, 439, 0, `scale(${f3(lerp(0.5, 1.1, E.expoOut(clamp((t - P.match - 0.15) / 0.6))))})`);
          setO(lgn.latchBloom, 0.95 * lb * (1 - fold));
          lgn.dots.forEach((e, i) => {
            const tin = lerp(P.type, P.passwordEnd - 0.1, i / 7);
            const typedA = sstep(tin - 0.04, tin + 0.04, t);
            const diss = sstep(P.stored - 0.05 + i * 0.03, P.stored + 0.45 + i * 0.03, t);
            const fall = tw(P.hashes - 0.15 + i * 0.05, P.hashes + 0.55 + i * 0.05, t, "cubicIn");
            const p0 = DOT(i);
            const x = lerp(p0.x + Math.sin(i * 1.7) * 14 * diss, 960 + (i - 3.5) * 10, fall);
            const y = lerp(p0.y - 16 * diss, 468, fall);
            const d = lerp(D_DESK - 1, D_FUN - 4, fall);
            ctx.place(e, x, y, d, `scale(${f3(lerp(1, 0.38, diss))})`);
            ctx.lens(e, d);
            setO(e, typedA * lerp(1, 0.75, diss) * (1 - sstep(0.85, 1, fall)) * (1 - fold));
          });
          // under the paper
          vis(funP, sstep(P.hashes - 0.4, P.hashes - 0.1, t) * (1 - sstep(P.welcome - 0.2, P.welcome + 0.25, t)));
          const churn = sstep(P.hashes + 0.2, P.hashes + 0.6, t) * (1 - 0.6 * sstep(P.typed + 0.4, P.typed + 1.0, t));
          setO(fun.glow, churn * (0.75 + 0.25 * Math.sin(t * 9)));
          const outU = tw(P.typed - 0.15, P.typed + 0.4, t, "cubicOut");
          const mt = tw(P.match - 0.25, P.match + 0.12, t, "cubicInOut");
          const HW = 222;                                         // half the strip's width
          const sx = lerp(lerp(960, 680, outU), 1260, mt), sy = lerp(650, 700, outU);
          setT(fun.strip, `translate3d(${f1(sx - HW)}px, ${f1(sy - 32)}px, 0px)`);
          const fin = tw(P.compares - 0.1, P.compares + 0.4, t, "cubicOut");
          setT(fun.line, `translate3d(${f1(1260 + 60 * (1 - fin) - HW)}px, ${700 - 32}px, 0px)`);
          setO(fun.line, fin * (1 - 0.5 * mt) * (1 - 0.45 * pulse(t, P.shadow, 0.15, 0.9)));
          setT(fun.file, `translate3d(${f1(1260 + 60 * (1 - fin) - 165)}px, 590px, 0px)`);
          const sh = pulse(t, P.shadow, 0.15, 0.9);
          setO(fun.strip, sstep(P.typed - 0.15, P.typed + 0.05, t) * (1 - 0.45 * sh));
          setO(fun.file, fin);
          setS(fun.file, "color", OT.rgb(OT.mix([255, 236, 214], [255, 255, 255], sh), 0.78 + 0.22 * sh));
          setS(fun.file, "textShadow", sh > 0.01 ? `0 0 ${f1(10 + 30 * sh)}px rgba(255,236,214,${f3(0.95 * sh)})` : "none");
          const mb = pulse(t, P.match + 0.12, 0.05, 2.2);
          ctx.place(fun.fBloom, 1260, 700, 0, `scale(${f3(lerp(0.4, 1, E.expoOut(clamp((t - P.match) / 0.6))))})`);
          setO(fun.fBloom, 0.9 * mb);
        }
      }

      // ---------------- s11: hundreds of processes glow under the wallpaper; the compiler is still missing
      {
        const aL = sstep(T.hundred - 0.25, T.hundred + 0.35, t) * (1 - sstep(T.still - 0.45, T.still + 0.05, t));
        vis(lightsP, aL * (S10 ? 1 : 0.8));                       // with s10 there is no lens left for it: a little brighter
        const u = tw(T.still - 0.12, T.still + 0.55, t, "expoOut");
        const q = { x: lerp(CLF_A.x, CLF_B.x, u), y: lerp(CLF_A.y, CLF_B.y, u), d: lerp(CLF_A.d, CLF_B.d, u) };
        ctx.place(clf, q.x, q.y, q.d);
        setO(clf, sstep(T.still - 0.12, T.still + 0.2, t) * (1 - sstep(T.compiler - 0.35, T.compiler + 0.05, t)));
      }
    });
  },
});
