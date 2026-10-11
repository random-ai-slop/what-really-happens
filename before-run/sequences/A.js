/* A — Rewind. A finished hello.c, the pointer comes to rest on Run; we pull back to reveal the desktop, then
 * rewind the whole world: the code un-types, the window folds into the dock, the desktop dismantles, the camera
 * falls through darkening strata, the last gold dot goes out.
 * Exit = black void (no baton object). */
OT.sequence({
  id: "A",
  build(ctx) {
    const { clamp, lerp, inv, sstep, tw, spring, rng, E } = OT;
    const at = (w, n) => ctx.at("s00", w, n), end = (w, n) => ctx.end("s00", w, n);

    // ---------------- beats ----------------
    const T = {};
    T.cursor = at("cursor");
    T.run = at("Run.");
    T.start = at("start");
    T.whole = at("end");                    // "the end of a very long story": pull back
    T.first = end("story.");
    T.so = at("So,");
    T.rw = at("rewind.") + 0.08;            // the rewind starts
    T.untype1 = T.rw + 1.05;               // code gone
    T.fold0 = T.rw + 0.85; T.fold1 = T.rw + 1.45;   // window folds into the dock
    T.dis0 = T.rw + 1.3; T.dis1 = T.rw + 2.25;      // desktop dismantles
    T.fall0 = T.rw + 2.0; T.fall1 = ctx.t1 - 0.95; // the fall
    T.led = T.fall1 + 0.05;                // gold dot = power LED, then off
    T.off = ctx.t1 - 0.45;

    // ---------------- styles ----------------
    ctx.el("style", "", document.head, `
      .a-win { position:absolute; left:0; top:0; width:1920px; height:1080px; background:#efeae0; }
      .a-bar { position:absolute; left:0; top:0; width:1920px; height:84px; background:#e4ddcf; border-bottom:2px solid #d6cebf; }
      .a-bar .t { position:absolute; left:0; right:0; top:0; height:84px; line-height:84px; text-align:center; font-family:"JetBrains Mono",monospace; font-size:30px; color:#8a8478; }
      .a-bar .x { position:absolute; right:34px; top:22px; width:40px; height:40px; border-radius:50%; background:#d6cebf; color:#6f695e; font:700 26px/40px "JetBrains Mono",monospace; text-align:center; }
      .a-out { position:absolute; left:520px; top:736px; width:880px; height:56px; font-family:"JetBrains Mono",monospace; font-size:40px; line-height:56px; }
      .a-out .pr { position:absolute; left:0; color:#a59e8f; }
      .a-out .tx { position:absolute; left:40px; top:0; color:#a26a05; font-weight:700; transform-origin:0 50%; display:block; }
      .a-out .tm { position:absolute; right:0; top:0; font-size:24px; color:#8a8478; }
      .a-caret { position:absolute; left:0; top:0; width:4px; height:54px; background:#1e1d1a; }
      .a-pointer { position:absolute; left:0; top:0; width:34px; height:48px; }
      .a-top { position:absolute; left:-1700px; top:-905px; width:5320px; height:88px; background:#1e1d1a; font-family:"JetBrains Mono",monospace; }
      .a-top .clk { position:absolute; left:0; right:0; top:0; line-height:88px; text-align:center; font-size:36px; color:#efeae0; letter-spacing:0.04em; }
      .a-top .st { position:absolute; right:1810px; top:28px; display:flex; gap:26px; }
      .a-top .st i { display:block; width:34px; height:32px; border-radius:6px; background:#efeae0; opacity:.85; }
      .a-dock { position:absolute; left:-1330px; top:-80px; width:200px; height:1440px; border-radius:60px; background:rgba(30,29,26,.88); }
      .a-icon { position:absolute; left:30px; width:140px; height:140px; border-radius:34px; display:flex; align-items:center; justify-content:center;
        font-family:"JetBrains Mono",monospace; font-weight:700; font-size:54px; transform-origin:50% 50%; }
      .a-icon.on::after { content:""; position:absolute; right:-24px; top:58px; width:14px; height:24px; border-radius:7px; background:#efeae0; }
      .a-twin { position:absolute; border-radius:24px; box-shadow:0 30px 90px rgba(40,30,15,.25); overflow:hidden; font-family:"JetBrains Mono",monospace; }
      .a-twin.term { background:#26241f; color:#d9d2c3; font-size:38px; line-height:64px; padding:90px 50px; white-space:pre; }
      .a-twin.term b { color:#a59e8f; font-weight:400; }
      .a-twin.files { background:#f3efe6; }
      .a-twin.files .row { position:absolute; left:60px; height:84px; line-height:84px; font-size:36px; color:#5b574e; }
      .a-twin.files .row::before { content:""; display:inline-block; width:56px; height:42px; border-radius:8px; background:#cdbf9f; margin-right:30px; vertical-align:-6px; }
      .a-twin .tb { position:absolute; left:0; top:0; right:0; height:76px; background:rgba(0,0,0,.08); }
      .a-cell { position:absolute; left:0; top:0; border-radius:50%; font-family:"JetBrains Mono",monospace; color:#fff3df; text-align:center; }
      .a-cell span { position:absolute; left:-200px; right:-200px; top:50%; transform:translateY(-50%); font-size:30px; }
      .a-thread { position:absolute; left:0; top:0; height:3px; background:#ffd6a0; transform-origin:0 50%; }
      .a-grid { position:absolute; left:-2040px; top:-1460px; width:6000px; height:4000px;
        background: repeating-linear-gradient(0deg, rgba(170,230,255,.45) 0 2px, transparent 2px 90px),
                    repeating-linear-gradient(90deg, rgba(170,230,255,.45) 0 2px, transparent 2px 90px); }
      .a-sil .trace { stroke:#ff7a2e; stroke-width:4; fill:none; }
    `);

    // ---------------- the desktop (behind the editor window, same plane) ----------------
    const desk = ctx.plane(0);
    const wall = ctx.el("div", "", desk);
    wall.style.cssText = "position:absolute;left:-1700px;top:-905px;width:5320px;height:2700px;overflow:hidden;";
    {
      let s = `<svg width="5320" height="2700" viewBox="0 0 5320 2700" style="position:absolute;left:0;top:0">`;
      for (let i = 0; i < 14; i++) {
        const rx = 1500 + i * 260, ry = 520 + i * 120;
        s += `<ellipse cx="2660" cy="3150" rx="${rx}" ry="${ry * 2.2}" fill="none" stroke="#b9ad94" stroke-opacity="${(0.42 - i * 0.022).toFixed(3)}" stroke-width="5"/>`;
      }
      wall.innerHTML = s + "</svg>";
    }
    const twins = [];
    {
      const term = ctx.el("div", "a-twin term", desk, `<div class="tb"></div><b>~$</b> ls\nhello.c\n<b>~$</b> █`);
      term.style.cssText += "left:-900px;top:60px;width:1150px;height:760px;";
      const files = ctx.el("div", "a-twin files", desk, `<div class="tb"></div>` + ["Documents", "Downloads", "Music", "Pictures", "code"].map((n, i) => `<div class="row" style="top:${120 + i * 96}px">${n}</div>`).join(""));
      files.style.cssText += "left:1650px;top:-380px;width:1050px;height:720px;";
      twins.push(term, files);
    }
    const top = ctx.el("div", "a-top", desk, `<div class="clk">Fri Oct 9 · 9:41</div><div class="st"><i></i><i></i><i style="width:58px"></i></div>`);
    const dock = ctx.el("div", "a-dock", desk);
    const ICONS = [[">_", "#2b2a26", "#efeae0"], ["▤", "#c9b991", "#3b3a35"], ["◎", "#7aa5b5", "#f4f1ea"], ["{ }", "#efeae0", "#a2462b", true], ["♪", "#b98a7a", "#f4f1ea"], ["⚙", "#9a9384", "#efeae0"], ["⌫", "#5b574e", "#efeae0"]];
    const icons = ICONS.map(([g, bg, fg, on], i) => {
      const ic = ctx.el("div", "a-icon" + (on ? " on" : ""), dock, g);
      ic.style.top = 70 + i * 190 + "px"; ic.style.background = bg; ic.style.color = fg;
      return ic;
    });
    const EDIT_ICON = { x: -1330 + 100, y: -80 + 70 + 3 * 190 + 70 }; // centre of the editor icon (desk coords)

    // ---------------- the editor window (episode 1's page) ----------------
    const winPlane = ctx.plane(0);
    const win = ctx.el("div", "a-win", winPlane);
    const page = OT.C.page(winPlane, { chars: true });
    const bar = ctx.el("div", "a-bar", winPlane, `<div class="t">hello.c — Editor</div><div class="x">×</div>`);
    const caret = ctx.el("div", "a-caret", page.el);
    const pointer = ctx.el("div", "a-pointer", page.el, `<svg viewBox="0 0 34 48" width="34" height="48"><path d="M3 2 L3 38 L12 30 L18 45 L24 42 L18 28 L30 28 Z" fill="#1e1d1a" stroke="#f6f2ea" stroke-width="2.5" stroke-linejoin="round"/></svg>`);
    const pill = page.pill, triPath = page.tri.querySelector("path");

    // typing order (same as episode 1): every char except leading indentation
    const chars = [];
    page.code.chars.forEach((row, li) => {
      let lead = true, col = 0;
      row.forEach((sp) => { col++; const isLead = lead && sp.textContent === " "; if (!isLead) lead = false; chars.push({ el: sp, li, col, lead: isLead }); });
    });
    let order = 0;
    chars.forEach((c) => { c.order = c.lead ? order - 0.5 : order++; });
    const nChars = order;
    const lastTyped = [];
    chars.forEach((c) => { if (!c.lead) lastTyped[c.order] = [c.li, c.col]; });
    chars.forEach((c) => { c.hello = c.li === 2 && c.col >= 13 && c.col <= 25; }); // the "Hello, world!" glyphs (the hero takes over)
    const CW = 46 * 0.6;
    // where "Hello, world!" sits inside the printf line (page coords)
    const HELLO = { x: 520 + 12 * CW, y: 330 + 2 * 72 + 36 };

    // ---------------- ghost strata we fall through ----------------
    const D_TREE = 1300, D_MEM = 2400, D_SIL = 4000;
    const tree = ctx.plane(D_TREE);
    const CELLS = [[0, 0, 150, "systemd · 1"], [-620, -330, 96, "gnome-shell"], [600, -360, 90, "editor"], [-760, 250, 80, "bash"], [720, 300, 84, "clangd"], [-180, 420, 70, "journald"], [260, -470, 64, "dbus"], [120, 470, 64, "NetworkManager"]];
    const cells = CELLS.map(([dx, dy, r, label], i) => {
      const th = i ? ctx.el("div", "a-thread", tree) : null;
      const c = ctx.el("div", "a-cell", tree, `<span>${label}</span>`);
      c.style.width = c.style.height = r * 2 + "px";
      c.style.background = "radial-gradient(circle at 42% 38%, rgba(255,236,200,.5), rgba(255,196,120,.18) 55%, rgba(255,170,90,0) 74%)";
      c.style.boxShadow = "inset 0 0 0 3px rgba(255,214,160,.6), 0 0 50px rgba(255,190,110,.25)";
      return { c, th, dx, dy, r };
    });
    const membrane = ctx.plane(D_MEM);
    membrane.innerHTML = `<div class="a-grid"></div>`;
    const sil = ctx.plane(D_SIL);
    {
      const r = rng(9), cx = 1920, cy = 1080;
      let s = `<svg class="a-sil" width="3840" height="2160" viewBox="0 0 3840 2160" style="position:absolute;left:-960px;top:-440px">`;
      for (let i = 0; i < 30; i++) {
        const ang = (i / 30) * Math.PI * 2 + r() * 0.2, R1 = 380 + r() * 80, R2 = 1300 + r() * 300;
        const x1 = cx + Math.cos(ang) * R2, y1 = cy + Math.sin(ang) * R2 * 0.62, x2 = cx + Math.cos(ang) * R1, y2 = cy + Math.sin(ang) * R1 * 0.5;
        s += `<path class="trace" d="M${x1.toFixed(0)} ${y1.toFixed(0)} L${x1.toFixed(0)} ${((y1 + y2) / 2).toFixed(0)} L${x2.toFixed(0)} ${((y1 + y2) / 2).toFixed(0)} L${x2.toFixed(0)} ${y2.toFixed(0)}"/>`;
      }
      s += `<rect x="${cx - 380}" y="${cy - 340}" width="760" height="680" rx="14" fill="rgba(255,140,60,.12)" stroke="#ff8a3d" stroke-width="4"/></svg>`;
      sil.innerHTML = s;
    }

    // ---------------- camera, ground, light ----------------
    const PULL = -1500;
    const EXITZ = 5600;
    ctx.cam([
      [0, { x: 960, y: 640, z: 0 }], [T.whole - 0.3, { z: 0 }], [T.first + 0.35, { z: PULL }], [T.rw + 0.35, { z: PULL }],
      [T.fall0, { z: PULL }], [T.fall0 + 1.1, { z: 1700 }], [T.fall0 + 2.0, { z: 4400 }], [T.fall1, { z: EXITZ }], [ctx.t1, { z: EXITZ }],
    ]);
    ctx.exit({ z: EXITZ });
    const PAPER = "#efeae0", WALL = "#e2dacb";
    ctx.ground([
      [0, PAPER], [T.whole, PAPER], [T.first, WALL], [T.dis0, WALL], [T.dis1, "#2b2140"], [T.fall0 + 0.9, "#2b2140"], [T.fall0 + 1.25, "#070c1c"],
      [T.fall0 + 1.95, "#090407"], [T.fall0 + 2.25, "#210904"], [T.fall1 - 0.2, "#050202"], [T.off, "#000000"], [ctx.t1, "#000000"],
    ]);
    ctx.motes([[0, "dust"], [T.dis1, "spores"], [T.fall0 + 1.2, "sparks"], [T.fall0 + 2.0, "embers"], [T.fall1 - 0.3, "none"]]);
    ctx.moteClock((t) => (t < T.rw ? t : T.rw - (t - T.rw) * 3)); // motes drift backwards during the rewind
    ctx.flash(T.fall0 + 1.55, { peak: 0.35, attack: 0.04, decay: 9, color: "#d9f3ff" });
    ctx.shake(T.fall0 + 1.55, { amp: 12, freq: 32 });
    ctx.margins(0, 0.2);

    // ---------------- hero: the gold string rewinds into a dot, the dot becomes the power LED ----------------
    let helloScreen = null;
    ctx.hero((t) => {
      if (t < T.rw + 0.2 || t >= T.off + 0.05) return null;
      if (!helloScreen) helloScreen = ctx.project(HELLO.x, HELLO.y, 0, T.rw + 0.2);
      const n = Math.round(13 * (1 - tw(T.rw + 0.25, T.rw + 0.95, t, "quadIn")));
      const text = n > 0 ? "Hello, world!".slice(0, n) : "●";
      const mv = tw(T.rw + 0.9, T.fall0 + 0.4, t, "cubicInOut");
      const breathe = 1 + 0.08 * Math.sin((t - T.fall0) * 5);
      const dying = sstep(T.led, T.off, t);
      const lit = t < T.off - 0.1 ? 1 : 0.15 * (1 - sstep(T.off - 0.1, T.off, t));
      const dark = 1 - sstep(0.35, 0.8, OT.lightNow ?? 1);
      return {
        text, x: lerp(helloScreen.x, 960, mv), y: lerp(helloScreen.y, 640, mv), anchor: n > 0 ? 0 : 0.5,
        weight: n > 0 ? 400 : 700, size: n > 0 ? 46 * helloScreen.s : lerp(26, 18, dying) * (t > T.fall0 ? breathe : 1),
        color: OT.mix([162, 106, 5], [255, 205, 92], Math.max(dark, n > 0 ? 0 : 1)), glow: n > 0 ? dark : 0.6 + 0.4 * (1 - dying),
        opacity: lit * (1 - sstep(T.off, T.off + 0.05, t)),
      };
    });

    // ---------------- render ----------------
    ctx.render((t) => {
      const cam = ctx.camAt(t);

      // the window + desktop share depth 0; both fade as we fall through them
      const near = ctx.depthAlpha(0, t, [380, 820]);
      ctx.show(winPlane, near);
      ctx.show(desk, t < T.whole - 0.3 ? 0 : near);

      // window chrome appears only when we pull back
      const chrome = sstep(T.whole - 0.1, T.first, t);
      win.style.borderRadius = (34 * chrome).toFixed(1) + "px";
      win.style.boxShadow = chrome > 0.01 ? `0 ${(60 * chrome).toFixed(0)}px ${(160 * chrome).toFixed(0)}px rgba(40,30,15,${(0.32 * chrome).toFixed(3)}), 0 0 0 ${(3 * chrome).toFixed(1)}px rgba(120,105,80,${(0.25 * chrome).toFixed(3)})` : "none";
      bar.style.opacity = chrome.toFixed(3);
      bar.style.borderRadius = `${(34 * chrome).toFixed(1)}px ${(34 * chrome).toFixed(1)}px 0 0`;

      // typing (all typed) → un-typing during the rewind
      const typed = t < T.rw ? nChars : nChars * (1 - tw(T.rw, T.untype1, t, "quadIn"));
      chars.forEach((c) => { c.el.style.opacity = c.order < typed && !(c.hello && t >= T.rw + 0.2) ? 1 : 0; });
      const ti = Math.min(nChars - 1, Math.max(0, Math.ceil(typed) - 1));
      const [cl, ccol] = typed < 0.5 ? [0, 0] : lastTyped[ti];
      ctx.place(caret, 520 + ccol * CW + 3, 330 + cl * 72 + 9, 0);
      const blink = t >= T.rw && t < T.untype1 ? 1 : Math.floor(t / 0.53) % 2 === 0 ? 1 : 0.15;
      caret.style.opacity = (blink * (1 - sstep(T.fold0, T.fold0 + 0.2, t))).toFixed(3);
      page.lnums.forEach((n) => { n.style.opacity = (1 - sstep(T.untype1 - 0.3, T.untype1, t)).toFixed(3); });

      // the pointer glides in and comes to rest on Run; during the rewind it backs away along the same path
      const arrive = tw(T.cursor - 0.2, T.run + 0.1, t, "expoOut");
      const back = tw(T.rw, T.rw + 0.55, t, "expoIn");
      const u = arrive * (1 - back);
      ctx.place(pointer, lerp(1580, 1328, u), lerp(930, 262, u), 0);
      pointer.style.opacity = (sstep(T.cursor - 0.25, T.cursor - 0.05, t) * (1 - sstep(T.rw + 0.4, T.rw + 0.6, t))).toFixed(3);

      // the Run pill answers the hover, quietly
      const hover = sstep(T.run - 0.1, T.run + 0.2, t) * (1 - sstep(T.rw, T.rw + 0.3, t));
      pill.style.background = `rgba(30,29,26,${(0.08 * hover).toFixed(3)})`;
      pill.style.boxShadow = hover > 0.01 ? `0 0 0 ${(6 * hover).toFixed(1)}px rgba(162,106,5,${(0.12 * hover).toFixed(3)})` : "none";
      triPath.setAttribute("fill", "#1e1d1a");

      // the window folds into its dock icon
      const fold = tw(T.fold0, T.fold1, t, "expoIn");
      const fs = lerp(1, 0.035, fold);
      const fx = lerp(0, EDIT_ICON.x - 960 * fs, fold), fy = lerp(0, EDIT_ICON.y - 540 * fs, fold);
      winPlane.style.transform = `translate3d(${fx.toFixed(1)}px, ${fy.toFixed(1)}px, 0px) scale(${fs.toFixed(4)})`;
      winPlane.style.transformOrigin = "0 0";
      if (fold > 0.98) ctx.show(winPlane, 0);

      // the desktop dismantles: other windows shrink, dock icons pop out bottom-up, the top bar retracts
      twins.forEach((w, i) => {
        const u = tw(T.dis0 + i * 0.12, T.dis0 + 0.45 + i * 0.12, t, "expoIn");
        w.style.transform = `scale(${(1 - u).toFixed(4)})`; w.style.opacity = (1 - u).toFixed(3);
      });
      icons.forEach((ic, i) => {
        const k = icons.length - 1 - i;
        const u = tw(T.dis0 + 0.25 + k * 0.07, T.dis0 + 0.45 + k * 0.07, t, "expoIn");
        ic.style.transform = `scale(${(1 - u).toFixed(4)})`;
      });
      dock.style.transform = `translateX(${(-260 * tw(T.dis1 - 0.4, T.dis1, t, "expoIn")).toFixed(1)}px)`;
      dock.style.opacity = (1 - sstep(T.dis1 - 0.3, T.dis1, t)).toFixed(3);
      top.style.transform = `translateY(${(-120 * tw(T.dis0 + 0.6, T.dis0 + 1.0, t, "expoIn")).toFixed(1)}px)`;
      wall.style.opacity = (sstep(T.whole - 0.2, T.first, t) * (1 - sstep(T.dis0 + 0.4, T.dis1, t))).toFixed(3);

      // ghost strata: lit while far, switched off as we pass ("lights going out floor by floor")
      const lightsOff = (d) => 1 - sstep(-700, 250, cam.z - d);
      ctx.show(tree, t < T.fall0 ? 0 : ctx.depthAlpha(D_TREE, t, [240, 560], [-3200, -1800]) * (0.25 + 0.75 * lightsOff(D_TREE)));
      const shrink = tw(T.fall0 - 0.1, T.fall0 + 1.0, t, "cubicIn");
      cells.forEach(({ c, th, dx, dy, r }, i) => {
        const x = 960 + dx * (1 - shrink), y = 640 + dy * (1 - shrink), s = i === 0 ? 1 : 1 - shrink;
        ctx.place(c, x - r, y - r, 0, `scale(${Math.max(0.001, s).toFixed(4)})`);
        c.style.opacity = (i === 0 ? 1 : 1 - sstep(0.7, 1, shrink)).toFixed(3);
        if (th) {
          const len = Math.hypot(dx, dy) * (1 - shrink);
          ctx.place(th, 960, 640, 0, `rotate(${Math.atan2(dy, dx).toFixed(4)}rad)`);
          th.style.width = len.toFixed(1) + "px"; th.style.opacity = (0.6 * (1 - shrink)).toFixed(3);
        }
      });
      ctx.show(membrane, t < T.fall0 ? 0 : ctx.depthAlpha(D_MEM, t, [880, 975], [-3400, -2000]) * (0.2 + 0.8 * lightsOff(D_MEM)));
      ctx.show(sil, t < T.fall0 ? 0 : ctx.depthAlpha(D_SIL, t, [600, 900], [-3200, -1700]) * (0.15 + 0.85 * lightsOff(D_SIL)));
    });
  },
});
