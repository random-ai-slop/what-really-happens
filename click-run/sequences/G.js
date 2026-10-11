/* G — exit & outro. Entry = baton 6 (the PAGE, terminal shows the command and "Hello, world!").
 * s18: under the paper, our process dissolves; its exit code 0 floats to the waking shell; a new prompt.
 * s19: one fall through every stratum, a word per layer; whip back up; the pointer clicks Run again; end card. */
OT.sequence({
  id: "G",
  build(ctx) {
    const { clamp, lerp, inv, sstep, tw, spring, rng } = OT;
    const at = (b, w, n) => ctx.at(b, w, n), end = (b, w, n) => ctx.end(b, w, n);
    const T = {
      main: at("s18", "Main"), exits: at("s18", "exits"), reclaims: at("s18", "reclaims"), memory: end("s18", "memory"),
      shell: at("s18", "shell"), collects: at("s18", "collects"), zero: at("s18", "zero", 2), success: at("s18", "success"),
      prints: at("s18", "prints"), prompt: end("s18", "prompt"),
      words: ["Preprocessor", "Compiler", "Optimizer", "Assembler", "Linker", "Shell", "Kernel", "Loader", "Scheduler", "CPU", "Terminal"].map((w) => at("s19", w)),
      all: at("s19", "All"), click: at("s19", "click"), hello: at("s19", "hello"), helloEnd: end("s19", "hello"),
    };
    T.whip0 = T.words[10] + 0.95; T.whip1 = T.all + 0.05;
    T.card = T.helloEnd + 1.0;

    ctx.el("style", "", document.head, `
      .sG-cell { position:absolute; left:0; top:0; border-radius:50%; font-family:"JetBrains Mono",monospace; }
      .sG-cell .l { position:absolute; left:0; right:0; top:50%; transform:translateY(-50%); text-align:center; font-weight:700; font-size:30px; }
      .sG-cell .p { position:absolute; left:0; right:0; top:calc(50% + 28px); text-align:center; font-size:19px; opacity:.75; }
      .sG-bit { position:absolute; left:0; top:0; width:120px; height:22px; border-radius:3px; border:1.5px solid rgba(197,138,42,.7); background:rgba(255,210,150,.25); }
      .sG-code { position:absolute; left:0; top:0; font-family:"JetBrains Mono",monospace; white-space:pre; }
      .sG-exit { position:absolute; left:0; top:0; font-family:"JetBrains Mono",monospace; font-weight:700; font-size:64px; color:#a26a05; text-shadow:0 0 18px rgba(230,160,40,.55); }
      .sG-thread { position:absolute; left:0; top:0; width:2.5px; background:linear-gradient(#c58a2a, rgba(197,138,42,0)); transform-origin:50% 0; }
      .sG-tok { position:absolute; font-family:"JetBrains Mono",monospace; font-size:54px; color:#f4f1ea; white-space:pre; }
      .sG-tok.k { color:#ffbfa3; } .sG-tok.s { color:#ffc54d; text-shadow:0 0 18px rgba(255,190,70,.6); }
      .sG-hex { position:absolute; font-family:"JetBrains Mono",monospace; font-size:48px; color:#82dcff; text-shadow:0 0 14px rgba(90,200,255,.55); white-space:pre; }
      .sG-hex i { font-style:normal; color:#ff5c9a; text-shadow:0 0 14px rgba(255,92,154,.7); }
      .sG-grid { position:absolute; left:-2040px; top:-1460px; width:6000px; height:4000px;
        background: radial-gradient(closest-side at 50% 52%, rgba(190,240,255,.5), rgba(120,200,255,.15) 55%, rgba(80,160,255,0) 100%),
          repeating-linear-gradient(0deg, rgba(170,230,255,.42) 0 2px, transparent 2px 90px), repeating-linear-gradient(90deg, rgba(170,230,255,.42) 0 2px, transparent 2px 90px); }
      .sG-beam { position:absolute; left:0; top:0; width:70px; height:900px; border-radius:35px; background:linear-gradient(rgba(140,220,255,0), rgba(140,220,255,.55), rgba(140,220,255,0)); }
      .sG-dot { position:absolute; left:0; top:0; width:26px; height:26px; border-radius:50%; background:rgba(255,214,160,.8); box-shadow:0 0 14px rgba(255,190,110,.7); }
      .sG-px { position:absolute; left:0; top:0; background:#fff; box-shadow:0 0 18px rgba(255,255,255,.9); }
      .sG-card { position:absolute; left:0; right:0; top:0; bottom:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:26px; }
      .sG-card .t { font-family:"Fraunces",serif; font-size:76px; font-weight:400; letter-spacing:-0.02em; color:#1e1d1a; font-variation-settings:"opsz" 144; }
      .sG-card .t i { font-style:italic; font-weight:350; }
      .sG-card .m { font-family:"JetBrains Mono",monospace; font-size:24px; color:#8a8478; letter-spacing:.02em; }
      .sG-pointer { position:absolute; left:0; top:0; width:34px; height:48px; }
    `);

    // ---------------- the surface ----------------
    const pagePlane = ctx.plane(0);
    const page = OT.C.page(pagePlane);
    const TERM_CMD = [["$ ", "pr"], ["clang -O2 hello.c -o hello && ", "dim"], ["./hello", ""]];
    const TERM_OUT = [["Hello, world!", "out"]];
    const pointer = ctx.el("div", "sG-pointer", page.el, `<svg viewBox="0 0 34 48" width="34" height="48"><path d="M3 2 L3 38 L12 30 L18 45 L24 42 L18 28 L30 28 Z" fill="#1e1d1a" stroke="#f6f2ea" stroke-width="2.5" stroke-linejoin="round"/></svg>`);
    const triPath = page.tri.querySelector("path");

    // ---------------- beneath the paper: our process and the shell ----------------
    const UND = 700;
    const under = ctx.plane(UND);
    const mkCell = (label, pid, size, warm) => {
      const c = ctx.el("div", "sG-cell", under, `<div class="l">${label}</div><div class="p">PID ${pid}</div>`);
      c.style.width = c.style.height = size + "px";
      c.style.color = warm ? "#7a4b05" : "#5b574e";
      return c;
    };
    const HC = { x: 1180, y: 1180, r: 170 }, SH = { x: 720, y: 1150, r: 150 };
    const cellHello = mkCell("hello", 4013, HC.r * 2, true);
    const cellShell = mkCell("zsh", 4012, SH.r * 2, false);
    ctx.place(cellHello, HC.x - HC.r, HC.y - HC.r, 0);
    ctx.place(cellShell, SH.x - SH.r, SH.y - SH.r, 0);
    const bits = Array.from({ length: 9 }, (_, i) => { const b = ctx.el("div", "sG-bit", under); return { el: b, i, r: rng(40 + i) }; });
    const exitCode = ctx.el("div", "sG-exit", under, "0");

    // ---------------- the montage: one stratum per word ----------------
    const D0 = 1500, GAP = 1250;
    const depthOf = (i) => D0 + i * GAP;
    const strata = [];
    const addStratum = (i, html) => { const el = ctx.plane(depthOf(i)); el.innerHTML = html; strata.push({ el, D: depthOf(i), i }); return el; };
    const c960 = (w, h) => `left:${960 - w / 2}px;top:${640 - h / 2}px`;
    // 0 preprocessor: header lines, printf gold
    {
      const L = ["extern int fflush (FILE *__stream);", "extern FILE *fopen (const char *__restrict __filename, ...);", "extern int fprintf (FILE *__restrict __stream, ...);", "extern int printf (const char *__restrict __format, ...);", "extern int sprintf (char *__restrict __s, ...);", "extern int puts (const char *__s);", "extern size_t fwrite (const void *__restrict __ptr, ...);"];
      addStratum(0, `<div class="sG-code" style="${c960(1300, 420)};font-size:38px;line-height:60px;color:#3b3a35">${L.map((l) => (l.includes(" printf ") ? `<span style="color:#a26a05;font-weight:700">${OT.esc(l)}</span>` : OT.esc(l))).join("\n")}</div>`);
    }
    // 1 compiler: tokens around the gold string
    {
      const r = rng(3); let h = "";
      [["int", "k"], ["main", ""], ["(", ""], ["void", "k"], [")", ""], ["{", ""], ["printf", ""], ["return", "k"], ["0", ""], [";", ""], ["}", ""]].forEach(([t, c], i) => {
        const a = (i / 11) * Math.PI * 2, R = 380 + r() * 160;
        h += `<div class="sG-tok ${c}" style="left:${(960 + Math.cos(a) * R * 1.6).toFixed(0)}px;top:${(640 + Math.sin(a) * R).toFixed(0)}px;transform:translate(-50%,-50%)">${t}</div>`;
      });
      addStratum(1, h + `<div class="sG-tok s" style="left:960px;top:640px;transform:translate(-50%,-50%)">"Hello, world!\\n"</div>`);
    }
    // 2 optimizer: the swap
    addStratum(2, `<div class="sG-code" style="${c960(1100, 70)};font-size:52px;color:#e6eef8">call i32 <span style="color:#ffffff;font-weight:700;text-decoration:line-through;opacity:.45">@printf</span> <span style="color:#ffc54d;font-weight:700">@puts</span>(ptr @str)</div>`);
    // 3 assembler: bytes with holes
    addStratum(3, `<div class="sG-hex" style="${c960(1500, 60)}">50 48 8D 3D <i>?? ?? ?? ??</i> E8 <i>?? ?? ?? ??</i> 31 C0 59 C3</div>`);
    // 4 linker: the executable
    { const el = addStratum(4, ""); const s = OT.C.slab(el, { name: "hello", size: "16 KB" }); s.el.style.left = "580px"; s.el.style.top = "405px"; }
    // 5 shell: a cell
    { const el = addStratum(5, ""); const c = OT.C.cell(el, { label: "zsh", pid: "PID 4012", size: 420 }); c.el.style.left = "750px"; c.el.style.top = "430px"; }
    // 6 kernel: the membrane
    {
      const r = rng(5); const SYS = ["read", "write", "mmap", "execve", "clone", "exit_group", "brk", "openat", "futex", "wait4"];
      let h = `<div class="sG-grid">`;
      for (let i = 0; i < 46; i++) { const x = 3000 + (r() - 0.5) * 5200, y = 2000 + (r() - 0.5) * 3400; if (Math.hypot((x - 3000) / 1.7, y - 2100) < 280) continue; h += `<div style="position:absolute;left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;font:24px 'JetBrains Mono',monospace;color:rgba(215,245,255,.6)">${SYS[i % SYS.length]}</div>`; }
      addStratum(6, h + "</div>");
    }
    // 7 loader: the address space
    { const el = addStratum(7, ""); const m = OT.C.memcol(el, { promised: [] }); m.el.style.left = "640px"; m.el.style.top = 640 - m.h / 2 + "px"; }
    // 8 scheduler: cores and cells
    {
      const r = rng(8); let h = "";
      for (let c = 0; c < 4; c++) h += `<div class="sG-beam" style="left:${(600 + c * 240).toFixed(0)}px;top:190px"></div>`;
      for (let i = 0; i < 40; i++) h += `<div class="sG-dot" style="left:${(300 + r() * 1320).toFixed(0)}px;top:${(220 + r() * 840).toFixed(0)}px;opacity:${(0.4 + r() * 0.6).toFixed(2)}"></div>`;
      addStratum(8, h);
    }
    // 9 CPU: silicon
    {
      let s = `<svg width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0"><defs><radialGradient id="sG-heat" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffb070" stop-opacity=".9"/><stop offset=".4" stop-color="#ff6a1a" stop-opacity=".3"/><stop offset="1" stop-color="#ff4a00" stop-opacity="0"/></radialGradient></defs>`;
      s += `<rect x="460" y="190" width="1000" height="900" rx="14" fill="rgba(255,110,40,.08)" stroke="#ff8a3d" stroke-width="3"/>`;
      [[500, 230, 420, 380], [1000, 230, 420, 380], [500, 670, 420, 380], [1000, 670, 420, 380]].forEach(([x, y, w, h]) => { s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="rgba(255,110,40,.1)" stroke="#ff8a3d" stroke-width="2"/>`; });
      s += `<circle cx="960" cy="640" r="560" fill="url(#sG-heat)"/></svg>`;
      addStratum(9, s);
    }
    // 10 terminal: the glyphs as pixels
    {
      const el = addStratum(10, "");
      const GL = { H: ["10001", "10001", "11111", "10001", "10001"], e: ["01110", "10001", "11111", "10000", "01110"], l: ["01100", "00100", "00100", "00100", "01110"], o: ["01110", "10001", "10001", "10001", "01110"] };
      const word = "Hello"; const px = 22, gap = 4;
      const W = word.length * (5 * (px + gap) + 30);
      [...word].forEach((ch, k) => GL[ch].forEach((row, y) => [...row].forEach((v, x) => {
        if (v !== "1") return;
        const d = ctx.el("div", "sG-px", el);
        d.style.width = d.style.height = px + "px";
        d.style.left = 960 - W / 2 + k * (5 * (px + gap) + 30) + x * (px + gap) + "px";
        d.style.top = 640 - 2.5 * (px + gap) + y * (px + gap) + "px";
      })));
    }
    const GROUND_OF = ["#e9e8df", "#2a6f86", "#0f2a4f", "#07070f", "#040406", "#2b2140", "#070c1c", "#1e1730", "#050814", "#3a1206", "#16110d"];
    const MOTES_OF = ["dust", "plankton", "bits", "bits", "none", "spores", "sparks", "spores", "sparks", "embers", "embers"];

    // end card (screen space)
    const card = ctx.el("div", "sG-card", ctx.screen, `<div class="t">What <i>Really</i> Happens When You Click Run</div><div class="m">5 lines of C · clang -O2 · Linux x86-64 · glibc</div>`);

    // ---------------- camera ----------------
    // Text is on screen in every rest, so rests are dead still (identical full keys); moves between them are decisive.
    const UNDER = { x: 950, y: 900, z: 210 };   // beneath the paper: both processes + the code above (mid of the old 960/200 → 940/220 creep)
    const PROMPT = { x: 960, y: 700, z: 40 };   // back on the page, the new prompt
    const CLICK = { x: 960, y: 675, z: 15 };    // after the whip: click Run, say hello (mid of the old 660/0 → 690/30 creep)
    const END = { x: 960, y: 640, z: -1800 };   // end card
    const keys = [[ctx.t0, { x: 960, y: 640, z: 0 }], [T.main - 0.3, { x: 960, y: 820, z: 60 }],
      [T.exits - 0.6, { ...UNDER, roll: 0 }],                 // lands as "zero." ends
      [T.prints - 0.3, { ...UNDER, roll: 0.35 }],             // still; only a 0.35° roll breathes through the long hold
      [T.prompt + 0.6, { ...PROMPT, roll: 0, ease: "smoother" }],   // glide up (tried spline / quintInOut / expoInOut)
      [T.words[0] - 0.55, { ...PROMPT }]];
    T.words.forEach((w, i) => keys.push([w + 0.05, { x: 960, y: 640, z: depthOf(i) - 120 }]));
    keys.push([T.whip0, { x: 960, y: 640, z: depthOf(10) + 260 }]);
    keys.push([T.whip1, { ...CLICK }]);
    keys.push([T.helloEnd + 0.4, { ...CLICK }]);
    keys.push([T.card + 1.8, { ...END, ease: "smoother" }]);  // pull back to the card, then hold to the end
    keys.push([ctx.t1, { ...END }]);
    ctx.cam(keys);
    ctx.exit({ x: 960, y: 640, z: -1800 });

    const gk = [[ctx.t0, "#efeae0"], [T.words[0] - 0.4, "#efeae0"]];
    T.words.forEach((w, i) => gk.push([w + 0.1, GROUND_OF[i]]));
    gk.push([T.whip0, "#fff8ee"], [T.whip1, "#efeae0"]);
    ctx.ground(gk);
    const mk = [[ctx.t0, "dust"]];
    T.words.forEach((w, i) => mk.push([w - 0.1, MOTES_OF[i]]));
    mk.push([T.whip1, "dust"]);
    ctx.motes(mk);
    T.words.forEach((w, i) => { if (i === 6) ctx.flash(w, { peak: 0.5, decay: 9, color: "#d9f3ff" }); });
    ctx.flash(T.whip0 - 0.25, { peak: 1, attack: 0.3, hold: 0.12, decay: 6 });
    ctx.shake(T.words[6], { amp: 12 });
    ctx.shake(T.whip1, { amp: 9, freq: 26 });
    ctx.shake(T.click, { amp: 2.2 });
    ctx.fade([[ctx.t1 - 1.2, 0, "#000000"], [ctx.t1 - 0.05, 1, "#000000"]]);

    // ---------------- render ----------------
    ctx.margins(0, 1.5);
    ctx.render((t) => {
      // page
      ctx.show(pagePlane, ctx.depthAlpha(0, t, [380, 820], [-99999, -99998]));
      const promptOn = t >= T.prints + 0.25;
      page.setTerm(promptOn ? [TERM_CMD, TERM_OUT, [["$ ", "pr"]]] : [TERM_CMD, TERM_OUT]);
      page.caretAt(2, 2, promptOn ? (Math.floor((t - T.prints) / 0.53) % 2 === 0 ? 1 : 0.1) : 0);
      const pulse = sstep(T.hello - 0.1, T.hello + 0.3, t) * (1 - sstep(T.card + 0.5, T.card + 1.5, t));
      page.tlines[1] && (page.tlines[1].style.textShadow = pulse > 0 ? `0 0 ${(22 * pulse).toFixed(1)}px rgba(230,160,30,${(0.6 * pulse).toFixed(2)})` : "none");
      // the pointer returns and clicks Run once more
      const pu = tw(T.click - 1.0, T.click - 0.1, t, "expoOut");
      const press = t >= T.click && t < T.click + 0.5 ? 1 - 0.12 * Math.exp(-(t - T.click) * 14) : 1;
      ctx.place(pointer, lerp(1600, 1328, pu), lerp(960, 262, pu), 0, `scale(${press.toFixed(3)})`);
      pointer.style.opacity = (sstep(T.click - 1.0, T.click - 0.8, t) * (1 - sstep(T.card, T.card + 0.6, t))).toFixed(3);
      const filled = t >= T.click && t < T.click + 0.25;
      page.pill.style.background = filled ? "#1e1d1a" : "rgba(239,234,224,0)";
      page.pill.style.color = filled ? "#efeae0" : "#1e1d1a";
      triPath.setAttribute("fill", filled ? "#efeae0" : "#1e1d1a");

      // beneath: the processes
      const underA = sstep(ctx.t0 + 0.3, T.main - 0.2, t) * (1 - sstep(T.prompt + 0.3, T.prompt + 1.2, t));
      ctx.show(under, underA * 0.95);
      const dieU = tw(T.exits, T.memory + 0.2, t, "cubicIn");
      const ringA = 1 - dieU;
      cellHello.style.boxShadow = `inset 0 0 0 ${(2.5 * ringA).toFixed(2)}px rgba(197,138,42,${(0.85 * ringA).toFixed(2)}), 0 0 ${(50 * ringA).toFixed(0)}px rgba(230,170,70,${(0.45 * ringA).toFixed(2)})`;
      cellHello.style.background = `radial-gradient(circle at 42% 38%, rgba(255,214,150,${(0.55 * ringA).toFixed(2)}), rgba(255,196,120,${(0.15 * ringA).toFixed(2)}) 60%, rgba(255,170,90,0) 74%)`;
      cellHello.style.opacity = (1 - sstep(T.memory - 0.3, T.memory + 0.3, t)).toFixed(3);
      bits.forEach((b) => {
        const k = b.i, t0 = T.reclaims - 0.3 + k * 0.08;
        const u = tw(t0, t0 + 1.4, t, "cubicIn");
        const x = HC.x - 60 + ((k % 3) - 1) * 70 + u * (b.r() - 0.5) * 0;
        const y = HC.y - 70 + Math.floor(k / 3) * 30 + u * 260;
        ctx.place(b.el, x + Math.sin(k * 2.1) * u * 90, y, u * 900);
        b.el.style.opacity = ((1 - u) * sstep(ctx.t0, T.main, t)).toFixed(3);
      });
      const wake = sstep(T.shell - 0.2, T.shell + 0.4, t);
      const sp = 0.35 + 0.65 * wake + 0.2 * Math.exp(-Math.max(0, t - T.zero) * 4) * sstep(T.zero - 0.05, T.zero, t);
      cellShell.style.boxShadow = `inset 0 0 0 2.5px rgba(150,140,120,${(0.4 + 0.5 * wake).toFixed(2)}), 0 0 ${(50 * sp).toFixed(0)}px rgba(230,170,70,${(0.35 * sp).toFixed(2)})`;
      cellShell.style.background = `radial-gradient(circle at 42% 38%, rgba(255,226,180,${(0.5 * sp).toFixed(2)}), rgba(255,210,150,${(0.12 * sp).toFixed(2)}) 60%, rgba(255,190,120,0) 74%)`;
      cellShell.style.color = OT.rgb(OT.mix([120, 115, 105], [110, 70, 10], wake));
      // the exit code: born from our process, carried to the shell
      const born = spring(t, T.main + 0.35, 14, 0.5);
      const carry = tw(T.collects - 0.1, T.zero + 0.2, t, "cubicInOut");
      const ex = lerp(HC.x, SH.x, carry) - 20, ey = lerp(HC.y - 30 - 110 * clamp(born, 0, 1.2), SH.y - 40, carry) - Math.sin(Math.PI * carry) * 140;
      ctx.place(exitCode, ex, ey, 0, `scale(${lerp(0.4, 1, clamp(born, 0, 1.3)).toFixed(3)})`);
      exitCode.style.opacity = (sstep(T.main + 0.3, T.main + 0.5, t) * (1 - sstep(T.zero + 0.15, T.zero + 0.4, t))).toFixed(3);
      // montage strata
      strata.forEach((s) => ctx.show(s.el, t > T.words[0] - 2.5 && t < T.whip1 + 0.3 ? ctx.depthAlpha(s.D, t, [380, 760], [-1250, -650]) : 0));

      // end card
      card.style.opacity = (sstep(T.card, T.card + 1.0, t)).toFixed(3);
      card.style.transform = `translateY(${(-300 + 12 * (1 - sstep(T.card, T.card + 1.4, t))).toFixed(1)}px)`;
    });
  },
});
