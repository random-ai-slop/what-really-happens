/* A — the surface: cold open, freeze & preview dive, title, "the button is a command", #include unrolls.
 * Ported from reference/demo-opening.html onto the one-take engine. Exit = baton 1 (MAIN BLOCK). */
OT.sequence({
  id: "A",
  build(ctx) {
    const { clamp, lerp, inv, sstep, tw, spring, rng, hash, E } = OT;
    const OX = 960, OY = 640;
    const at = (b, w, n) => ctx.at(b, w, n), end = (b, w, n) => ctx.end(b, w, n);

    // ---------------- beats ----------------
    const T = {
      type0: 0.5, type1: 2.75, ptr0: 2.85, ptr1: 3.45, click: 3.58, out: 3.72,
      freeze: 6.14, plunge: 6.95, membrane: 11.3, light: 13.8, land: 14.65, thaw: 16.35, title: 16.75,
    };
    T.s01 = at("s01", "That");
    T.commands = at("s01", "commands");
    T.build = at("s01", "build");
    T.run = at("s01", "run", 2);
    T.build2 = at("s01", "build", 2);
    T.four = at("s01", "four");
    T.hiding = at("s01", "hiding");
    T.name = end("s01", "name");
    T.arrow = T.name + 0.15;
    T.toInclude = T.name + 0.5;
    T.prep = at("s02", "preprocessor");
    T.edits = at("s02", "edits");
    T.hash = at("s02", "Hash-include");
    T.paste = at("s02", "paste");
    T.here = end("s02", "here");
    T.five = at("s02", "Five");
    T.hundreds = at("s02", "hundreds");
    T.buried = at("s02", "buried");
    T.need = at("s02", "need");
    T.descr = at("s02", "description");
    T.printf = at("s02", "print-F");
    T.s02end = ctx.beat("s02").end;
    T.lift0 = T.s02end + 0.3;
    T.lift1 = ctx.t1 - 0.12;

    // ---------------- styles ----------------
    ctx.el("style", "", document.head, `
      .sA-out { position:absolute; left:520px; top:736px; width:880px; height:56px; font-family:"JetBrains Mono",monospace; font-size:40px; line-height:56px; }
      .sA-out .pr { position:absolute; left:0; color:#a59e8f; }
      .sA-out .tx { position:absolute; left:40px; top:0; color:#a26a05; font-weight:700; transform-origin:0 50%; display:block; }
      .sA-out .tm { position:absolute; right:0; top:0; font-size:24px; color:#8a8478; }
      .sA-caret { position:absolute; left:0; top:0; width:4px; height:54px; background:#1e1d1a; }
      .sA-pointer { position:absolute; left:0; top:0; width:34px; height:48px; }
      .sA-tmask { position:absolute; right:769px; top:226px; height:100px; width:1120px; overflow:hidden; }
      .sA-title { position:absolute; right:0; top:0; height:100px; line-height:100px; white-space:nowrap; font-family:"Fraunces",serif; font-size:72px; font-weight:400; letter-spacing:-0.02em; color:#1e1d1a; font-variation-settings:"opsz" 144; }
      .sA-title i { font-style:italic; font-weight:350; }
      .sA-cmd { position:absolute; right:22px; top:0; height:100%; display:flex; align-items:center; white-space:pre; font-size:25px; font-weight:700; color:#1e1d1a; }
      .sA-cmd span { transition:none; }
      .sA-ghost { position:absolute; left:0; top:0; font-family:"JetBrains Mono",monospace; font-size:34px; color:#5b574e; white-space:pre; }
      .sA-thread { position:absolute; left:0; top:0; width:2px; background:#b9b1a2; transform-origin:0 0; }
      .sA-sel { position:absolute; left:516px; top:336px; height:60px; background:rgba(79,102,136,0.16); border-radius:4px; }
      .sA-tok { position:absolute; font-family:"JetBrains Mono",monospace; font-size:56px; white-space:pre; color:#f4f1ea; text-shadow:0 0 18px rgba(255,255,255,.25); }
      .sA-tok.k { color:#ffbfa3; } .sA-tok.pu { color:#bfe6e8; opacity:.75; } .sA-tok.pp { color:#cfe0ff; }
      .sA-tree text { font-family:"JetBrains Mono",monospace; font-size:28px; fill:#d4ecf3; }
      .sA-tree .edge { stroke:#9fd3e3; stroke-width:2; fill:none; opacity:.8; } .sA-tree .dot { fill:#d4ecf3; }
      .sA-hex { position:absolute; font-family:"JetBrains Mono",monospace; font-size:30px; line-height:50px; white-space:pre; color:rgba(130,220,255,.78); text-shadow:0 0 14px rgba(90,200,255,.55); }
      .sA-hex b { color:#ffd166; font-weight:400; text-shadow:0 0 14px rgba(255,200,80,.8); }
      .sA-membrane { position:absolute; left:-2040px; top:-1460px; width:6000px; height:4000px;
        background: radial-gradient(closest-side at 50% 52%, rgba(190,240,255,.55), rgba(120,200,255,.18) 55%, rgba(80,160,255,0) 100%),
          repeating-linear-gradient(0deg, rgba(170,230,255,.42) 0 2px, transparent 2px 90px),
          repeating-linear-gradient(90deg, rgba(170,230,255,.42) 0 2px, transparent 2px 90px); }
      .sA-sys { position:absolute; font-family:"JetBrains Mono",monospace; font-size:24px; color:rgba(215,245,255,.55); }
      .sA-sil .trace { stroke:#ff7a2e; stroke-width:3; fill:none; opacity:.55; }
      .sA-sil .pulse { stroke:#ffd2a1; stroke-width:4; fill:none; stroke-dasharray:40 360; }
      .sA-sil .blk { fill:rgba(255,110,40,.08); stroke:#ff8a3d; stroke-width:2.5; }
      .sA-sil .core { fill:rgba(255,170,90,.25); stroke:#ffc27a; stroke-width:3; }
      .sA-scroll { position:absolute; left:0; top:0; transform-origin:0 0; }
      .sA-scroll .ot-code .row { opacity:.9; }
      .sA-scroll .hot { color:#a26a05 !important; font-weight:700; }
      .sA-lift { position:absolute; left:0; top:0; transform-origin:0 0; }
    `);

    // ---------------- the page ----------------
    const pagePlane = ctx.plane(0);
    const page = OT.C.page(pagePlane, { chars: true });
    const codeRows = page.code.rows, lnums = page.lnums;
    const tab = page.el.querySelector(".tab");
    const caret = ctx.el("div", "sA-caret", page.el);
    const sel = ctx.el("div", "sA-sel", page.el);
    const out = ctx.el("div", "sA-out", page.el, `<span class="pr">›</span><span class="tx">Hello, world!</span><span class="tm">0.21 s</span>`);
    const outText = out.querySelector(".tx"), tm = out.querySelector(".tm");
    const tmask = ctx.el("div", "sA-tmask", page.el, `<div class="sA-title">What <i>Really</i> Happens When You Click</div>`);
    const titleEl = tmask.firstChild;
    const pill = page.pill, tri = page.tri, triPath = tri.querySelector("path"), runLabel = pill.querySelector("span");
    const CMD_BUILD = "clang -O2 hello.c -o hello", CMD_RUN = "./hello";
    const cmd = ctx.el("div", "sA-cmd", pill, `<span class="c">clang</span><span class="b">${CMD_BUILD.slice(5)}</span><span class="a">  &amp;&amp;  </span><span class="r">${CMD_RUN}</span>`);
    const cmdB = cmd.querySelector(".b"), cmdC = cmd.querySelector(".c"), cmdA = cmd.querySelector(".a"), cmdR = cmd.querySelector(".r");
    const CMD_W = (CMD_BUILD.length + 6 + CMD_RUN.length) * 25 * 0.6 + 18 + 12 + 50;
    const pointer = ctx.el("div", "sA-pointer", page.el, `<svg viewBox="0 0 34 48" width="34" height="48"><path d="M3 2 L3 38 L12 30 L18 45 L24 42 L18 28 L30 28 Z" fill="#1e1d1a" stroke="#f6f2ea" stroke-width="2.5" stroke-linejoin="round"/></svg>`);
    const STAGES = ["preprocess", "compile", "assemble", "link"];
    const ghostThread = ctx.el("div", "sA-thread", page.el);
    const ghosts = STAGES.map((s) => ctx.el("div", "sA-ghost", page.el, s));

    // typing order: every char of the code except leading indentation
    const chars = [];
    page.code.chars.forEach((row, li) => {
      let lead = true, col = 0;
      row.forEach((sp) => { col++; const isLead = lead && sp.textContent === " "; if (!isLead) lead = false; chars.push({ el: sp, li, col, lead: isLead }); });
    });
    let order = 0;
    chars.forEach((c) => { c.order = c.lead ? order - 0.5 : order++; });
    const nChars = order;
    const lastTyped = []; // order -> [line, col]
    chars.forEach((c) => { if (!c.lead) lastTyped[c.order] = [c.li, c.col]; });

    // ---------------- the preview dive (frozen time) ----------------
    const layers = [];
    const addLayer = (D, html, o = {}) => {
      const el = ctx.plane(D);
      el.innerHTML = html;
      layers.push({ el, D, win: [T.plunge - 0.1, T.land + 0.12], near: [430, 820], far: [-2700, -1500], ...o });
    };
    const TOKENS = [["#include", "pp"], ["<stdio.h>", "pp"], ["int", "k"], ["main", ""], ["(", "pu"], ["void", "k"], [")", "pu"], ["{", "pu"], ["printf", ""], ["(", "pu"], [")", "pu"], [";", "pu"], ["return", "k"], ["0", ""], [";", "pu"], ["}", "pu"]];
    [1500, 1900, 2300].forEach((D, li) => {
      const r = rng(31 + li * 17);
      let html = "";
      TOKENS.forEach(([txt, cls], i) => {
        if ((i + li) % 3 === 0) return;
        let x, y, tries = 0;
        do { x = OX + (r() - 0.5) * 3000; y = OY + (r() - 0.5) * 1700; tries++; } while (Math.hypot((x - OX) / 1.7, y - OY) < 330 && tries < 30);
        html += `<div class="sA-tok ${cls}" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;transform:translate(-50%,-50%) rotate(${((r() - 0.5) * 10).toFixed(1)}deg)">${OT.esc(txt)}</div>`;
      });
      addLayer(D, html, { far: [-2100, -1100] });
    });
    {
      const N = { fd: [960, 205, "FunctionDecl main"], cs: [960, 325, "CompoundStmt"], ce: [640, 455, "CallExpr"], rs: [1290, 455, "ReturnStmt"], dr: [420, 580, "printf"], sl: [960, 640, ""], il: [1290, 585, "IntegerLiteral 0"] };
      const EDGES = [["fd", "cs"], ["cs", "ce"], ["cs", "rs"], ["ce", "dr"], ["ce", "sl"], ["rs", "il"]];
      let svg = `<svg class="sA-tree" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0">`;
      EDGES.forEach(([a, b]) => { const [x1, y1] = N[a], [x2, y2] = N[b]; const yb = b === "sl" ? y2 - 34 : y2 - 26; svg += `<path class="edge" d="M${x1} ${y1 + 22} C ${x1} ${(y1 + yb) / 2 + 20}, ${x2} ${(y1 + yb) / 2 - 20}, ${x2} ${yb}"/>`; });
      Object.values(N).forEach(([x, y, label]) => { if (label) svg += `<circle class="dot" cx="${x}" cy="${y - 26}" r="5"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${label}</text>`; });
      addLayer(3300, svg + "</svg>", { far: [-1500, -700] });
    }
    {
      const HEXROWS = ["7F 45 4C 46 02 01 01 00  00 00 00 00 00 00 00 00", "01 00 3E 00 01 00 00 00  00 00 00 00 00 00 00 00", "50 48 8D 3D 00 00 00 00  E8 00 00 00 00 31 C0 59", "C3 <b>48 65 6C 6C 6F 2C 20  77 6F 72 6C 64 21 00</b>", "00 2E 74 65 78 74 00 2E  72 6F 64 61 74 61 00 2E", "73 79 6D 74 61 62 00 6D  61 69 6E 00 70 75 74 73"];
      [[4300, 0], [4650, 1]].forEach(([D, k]) => {
        let html = ""; const r = rng(77 + k);
        for (let b = 0; b < 7; b++) {
          const x = OX + ((b % 3) - 1) * 980 + (r() - 0.5) * 160 + (k ? 420 : 0);
          const y = OY + (Math.floor(b / 3) - 1) * 520 + (r() - 0.5) * 120 - (k ? 240 : 0);
          if (Math.hypot((x - OX) / 1.8, y - OY) < 260) continue;
          html += `<div class="sA-hex" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;transform:translate(-50%,-50%)">${HEXROWS.slice((b + k) % 3, ((b + k) % 3) + 4).join("\n")}</div>`;
        }
        addLayer(D, html, { far: [-1400, -650] });
      });
    }
    {
      const r = rng(5);
      const SYS = ["read", "write", "openat", "close", "mmap", "munmap", "brk", "execve", "clone", "wait4", "exit_group", "futex", "ioctl", "fstat", "rt_sigaction", "pread64", "arch_prctl", "mprotect", "getpid", "kill"];
      let html = `<div class="sA-membrane">`;
      for (let i = 0; i < 70; i++) {
        const x = 3000 + (r() - 0.5) * 5200, y = 2000 + (r() - 0.5) * 3400;
        if (Math.hypot((x - 3000) / 1.7, y - 2100) < 260) continue;
        html += `<div class="sA-sys" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px">${SYS[i % SYS.length]}</div>`;
      }
      addLayer(5800, html + "</div>", { near: [880, 975] });
    }
    {
      const r = rng(9), cx = 1920, cy = 1080;
      let s = `<svg class="sA-sil" width="3840" height="2160" viewBox="0 0 3840 2160" style="position:absolute;left:-960px;top:-440px">`;
      s += `<defs><radialGradient id="sA-heat" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffb070" stop-opacity="0.9"/><stop offset="0.35" stop-color="#ff6a1a" stop-opacity="0.35"/><stop offset="1" stop-color="#ff4a00" stop-opacity="0"/></radialGradient></defs>`;
      s += `<rect x="${cx - 1500}" y="${cy - 900}" width="3000" height="1800" rx="18" class="blk"/>`;
      [[-1350, -780, 720, 520], [-560, -780, 1120, 300], [630, -780, 720, 520], [-1350, 260, 720, 520], [630, 260, 720, 520], [-560, 520, 1120, 260], [-1350, -200, 300, 400], [1050, -200, 300, 400]].forEach(([x, y, w, h]) => {
        s += `<rect x="${cx + x}" y="${cy + y}" width="${w}" height="${h}" rx="8" class="blk"/>`;
        for (let g = 1; g < 4; g++) s += `<line x1="${cx + x + (w * g) / 4}" y1="${cy + y + 12}" x2="${cx + x + (w * g) / 4}" y2="${cy + y + h - 12}" class="trace" style="opacity:.25"/>`;
      });
      s += `<rect x="${cx - 420}" y="${cy - 380}" width="840" height="760" rx="14" class="core"/>`;
      for (let i = 0; i < 26; i++) {
        const ang = (i / 26) * Math.PI * 2 + r() * 0.2, R1 = 420 + r() * 80, R2 = 1300 + r() * 300;
        const x1 = cx + Math.cos(ang) * R2, y1 = cy + Math.sin(ang) * R2 * 0.62, x2 = cx + Math.cos(ang) * R1, y2 = cy + Math.sin(ang) * R1 * 0.5;
        const d = `M${x1.toFixed(0)} ${y1.toFixed(0)} L${x1.toFixed(0)} ${((y1 + y2) / 2).toFixed(0)} L${x2.toFixed(0)} ${((y1 + y2) / 2).toFixed(0)} L${x2.toFixed(0)} ${y2.toFixed(0)}`;
        s += `<path class="trace" d="${d}"/><path class="pulse" data-ph="${r().toFixed(3)}" d="${d}"/>`;
      }
      s += `<circle cx="${cx}" cy="${cy}" r="1100" fill="url(#sA-heat)" class="heat"/></svg>`;
      addLayer(7400, s, { near: [700, 980] });
    }
    const pulses = Array.from(ctx.root.querySelectorAll(".sA-sil .pulse"));
    const heatglow = ctx.root.querySelector(".sA-sil .heat");

    // ---------------- the scroll: what #include pastes in ----------------
    const HDR = [
      "typedef long unsigned int size_t;", "typedef __builtin_va_list __gnuc_va_list;", "typedef unsigned char __u_char;", "typedef unsigned short int __u_short;",
      "typedef unsigned int __u_int;", "typedef unsigned long int __u_long;", "typedef signed char __int8_t;", "typedef unsigned char __uint8_t;",
      "typedef signed short int __int16_t;", "typedef unsigned short int __uint16_t;", "typedef signed int __int32_t;", "typedef unsigned int __uint32_t;",
      "typedef signed long int __int64_t;", "typedef unsigned long int __uint64_t;", "typedef long int __intmax_t;", "typedef unsigned long int __uintmax_t;",
      "typedef unsigned long int __dev_t;", "typedef unsigned int __uid_t;", "typedef unsigned int __gid_t;", "typedef unsigned long int __ino_t;",
      "typedef unsigned int __mode_t;", "typedef long int __off_t;", "typedef long int __off64_t;", "typedef int __pid_t;", "typedef long int __clock_t;",
      "typedef long int __time_t;", "typedef long int __ssize_t;", "typedef struct { int __val[2]; } __fsid_t;",
      "typedef struct { int __count; union { unsigned int __wch; char __wchb[4]; } __value; } __mbstate_t;",
      "typedef struct _G_fpos_t { __off_t __pos; __mbstate_t __state; } __fpos_t;", "typedef struct _IO_FILE __FILE;", "typedef struct _IO_FILE FILE;",
      "struct _IO_FILE;", "struct _IO_marker;", "struct _IO_codecvt;", "struct _IO_wide_data;", "typedef void _IO_lock_t;", "struct _IO_FILE", "{",
      "  int _flags;", "  char *_IO_read_ptr;", "  char *_IO_read_end;", "  char *_IO_read_base;", "  char *_IO_write_base;", "  char *_IO_write_ptr;",
      "  char *_IO_write_end;", "  char *_IO_buf_base;", "  char *_IO_buf_end;", "  char *_IO_save_base;", "  char *_IO_backup_base;", "  char *_IO_save_end;",
      "  struct _IO_marker *_markers;", "  struct _IO_FILE *_chain;", "  int _fileno;", "  int _flags2;", "  __off_t _old_offset;", "  unsigned short _cur_column;",
      "  signed char _vtable_offset;", "  char _shortbuf[1];", "  _IO_lock_t *_lock;", "  __off64_t _offset;", "  struct _IO_codecvt *_codecvt;",
      "  struct _IO_wide_data *_wide_data;", "  struct _IO_FILE *_freeres_list;", "  void *_freeres_buf;", "  size_t __pad5;", "  int _mode;",
      "  char _unused2[15 * sizeof (int) - 4 * sizeof (void *) - sizeof (size_t)];", "};", "typedef __gnuc_va_list va_list;", "typedef __off_t off_t;",
      "typedef __ssize_t ssize_t;", "typedef __fpos_t fpos_t;", "extern FILE *stdin;", "extern FILE *stdout;", "extern FILE *stderr;",
      "extern int remove (const char *__filename);", "extern int rename (const char *__old, const char *__new);",
      "extern int renameat (int __oldfd, const char *__old, int __newfd, const char *__new);", "extern int fclose (FILE *__stream);",
      "extern FILE *tmpfile (void);", "extern char *tmpnam (char[20]);", "extern int fflush (FILE *__stream);",
      "extern FILE *fopen (const char *__restrict __filename, const char *__restrict __modes);",
      "extern FILE *fdopen (int __fd, const char *__modes);", "extern void setbuf (FILE *__restrict __stream, char *__restrict __buf);",
      "extern int setvbuf (FILE *__restrict __stream, char *__restrict __buf, int __modes, size_t __n);",
      "extern int fprintf (FILE *__restrict __stream, const char *__restrict __format, ...);",
      "extern int printf (const char *__restrict __format, ...);",
      "extern int sprintf (char *__restrict __s, const char *__restrict __format, ...);",
      "extern int vfprintf (FILE *__restrict __s, const char *__restrict __format, __gnuc_va_list __arg);",
      "extern int vprintf (const char *__restrict __format, __gnuc_va_list __arg);",
      "extern int snprintf (char *__restrict __s, size_t __maxlen, const char *__restrict __format, ...);",
      "extern int dprintf (int __fd, const char *__restrict __fmt, ...);", "extern int fscanf (FILE *__restrict __stream, const char *__restrict __format, ...);",
      "extern int scanf (const char *__restrict __format, ...);", "extern int sscanf (const char *__restrict __s, const char *__restrict __format, ...);",
      "extern int fgetc (FILE *__stream);", "extern int getc (FILE *__stream);", "extern int getchar (void);", "extern int fputc (int __c, FILE *__stream);",
      "extern int putc (int __c, FILE *__stream);", "extern int putchar (int __c);", "extern char *fgets (char *__restrict __s, int __n, FILE *__restrict __stream);",
      "extern __ssize_t getline (char **__restrict __lineptr, size_t *__restrict __n, FILE *__restrict __stream);",
      "extern int fputs (const char *__restrict __s, FILE *__restrict __stream);", "extern int puts (const char *__s);", "extern int ungetc (int __c, FILE *__stream);",
      "extern size_t fread (void *__restrict __ptr, size_t __size, size_t __n, FILE *__restrict __stream);",
      "extern size_t fwrite (const void *__restrict __ptr, size_t __size, size_t __n, FILE *__restrict __s);",
      "extern int fseek (FILE *__stream, long int __off, int __whence);", "extern long int ftell (FILE *__stream);", "extern void rewind (FILE *__stream);",
      "extern int fgetpos (FILE *__restrict __stream, fpos_t *__restrict __pos);", "extern int fsetpos (FILE *__stream, const fpos_t *__pos);",
      "extern void clearerr (FILE *__stream);", "extern int feof (FILE *__stream);", "extern int ferror (FILE *__stream);", "extern void perror (const char *__s);",
      "extern int fileno (FILE *__stream);", "extern FILE *popen (const char *__command, const char *__modes);", "extern int pclose (FILE *__stream);",
      "extern char *ctermid (char *__s);", "extern void flockfile (FILE *__stream);", "extern int ftrylockfile (FILE *__stream);", "extern void funlockfile (FILE *__stream);",
      "extern int __uflow (FILE *);", "extern int __overflow (FILE *, int);", "",
    ];
    const HOT = HDR.findIndex((l) => l.startsWith("extern int printf "));
    const NH = HDR.length;
    const SC = { x: 480, y: 404, tilt: 54, lh: 50 };
    const COS = Math.cos((SC.tilt * Math.PI) / 180), SIN = Math.sin((SC.tilt * Math.PI) / 180);
    const lineY = (k) => SC.y + (k + 0.5) * SC.lh * COS, lineD = (k) => (k + 0.5) * SC.lh * SIN;
    const scroll = ctx.el("div", "sA-scroll", ctx.root);
    scroll.style.transform = `translate3d(${SC.x}px, ${SC.y}px, 0px) rotateX(${-SC.tilt}deg)`;
    scroll.style.width = "2400px";
    scroll.style.height = HDR.length * SC.lh + 20 + "px";
    const scode = OT.C.code(scroll, HDR, { lang: "c", theme: "paper", size: 30, lh: SC.lh });
    scode.rows[HOT].classList.add("hot");
    const scrollH = NH * SC.lh;

    // our own code at the tail of the scroll — it lifts off and settles flat: baton 1
    const MAIN = OT.C.PAGE_CODE.slice(1);
    const lift = ctx.el("div", "sA-lift", ctx.root);
    const mainBlock = OT.C.code(lift, MAIN, { lang: "c", theme: "paper", size: 46, lh: 72 });
    const s0 = 30 / 46;
    const P0 = { x: SC.x, y: SC.y + NH * SC.lh * COS, d: NH * SC.lh * SIN, rot: -SC.tilt, s: s0 };
    const EXIT = { x: 960, y: P0.y + 150, z: P0.d - 60 };
    const P1 = { x: EXIT.x - mainBlock.maxWidth / 2, y: EXIT.y - mainBlock.height / 2, d: EXIT.z, rot: 0, s: 1 };

    // ---------------- camera ----------------
    // Readable text is on screen almost everywhere here, and any slow creep of x/y/z re-snaps the glyphs every frame
    // (±0.5–1.6 px shimmer). So the camera RESTS dead still (two identical full {x,y,z} keys) while code and labels
    // are read, and moves decisively between rests.
    const lc = (k, eff, x = 960) => ({ x, y: lineY(k), z: lineD(k) + eff });
    const HOME = { x: 960, y: 640, z: 0 };
    const TITLE = { x: 790, y: 364, z: 120 }, CMD = { x: 905, y: 364, z: 120 }, INC = { x: 768, y: 366, z: 0 };
    const PF = lc(HOT, 360, 1000);
    ctx.cam([
      [0, HOME], [T.freeze + 0.36, HOME],                                  // cold open: still while the code is typed, run, and frozen
      [T.plunge, { z: 70 }],                                               // ...then push off into the dive on "but in that blink"
      [7.6, { z: 320 }], [8.2, { z: 900 }], [8.75, { z: 1600 }],
      [9.4, { z: 2300 }], [10.0, { z: 3250 }], [10.55, { z: 4250 }], [T.membrane, { z: 6800 }], [11.8, { z: 7050 }], [12.41, { z: 7250 }],
      [13.3, { z: 7550 }], [T.light, { z: 7750 }], [14.0, { z: 7600 }], [T.land, { z: 0 }], [T.thaw, { z: 0 }], [16.6, { z: 10 }],
      [17.6, TITLE], [T.s01 - 0.3, TITLE],                                 // rest on the title
      [T.commands + 0.2, { ...CMD, ease: "smoother" }], [T.name + 0.1, CMD], // glide over to the command line, rest
      [T.toInclude + 1.4, { ...INC, ease: "smoother" }], [T.five - 0.7, INC], // glide back to #include, rest while it is explained
      [T.five, lc(4, 150, 860)], [T.hundreds, lc(30, 200)], [T.buried - 0.1, lc(62, 220)], [T.need, lc(HOT - 5, 300, 985)],
      [T.printf, PF], [T.s02end + 0.2, PF],                                // land on printf's declaration, rest
      [ctx.t1, EXIT],
    ]);
    ctx.exit(EXIT);
    ctx.ground([
      [0, "#efeae0"], [T.freeze, "#efeae0"], [6.55, "#e2e2df"], [7.55, "#e2e2df"], [8.15, "#a9cdcb"], [8.75, "#4f98a0"], [9.45, "#2a6f86"], [10.05, "#143f66"],
      [10.6, "#0b1a3a"], [11.2, "#04060d"], [11.32, "#1a2d55"], [11.6, "#090407"], [12.3, "#210904"], [13.4, "#4a1606"], [T.light, "#ffe9c7"], [13.95, "#fff8ee"],
      [T.land, "#e2e2df"], [T.thaw, "#e2e2df"], [17.1, "#efeae0"], [T.five, "#efeae0"], [T.printf, "#ebebe4"], [ctx.t1, "#e6e9e2"],
    ]);
    ctx.motes([[0, "dust"], [7.7, "plankton"], [10.3, "bits"], [11.4, "sparks"], [12.0, "embers"], [T.light, "none"], [T.land, "dust"]]);
    const wt = (t) => (t < T.freeze ? t : t < T.thaw ? T.freeze : T.freeze + (t - T.thaw) * 0.25);
    ctx.moteClock(wt);
    ctx.shake(T.click, { amp: 2.2, freq: 30 });
    ctx.shake(T.membrane, { amp: 16, freq: 34 });
    ctx.shake(T.land, { amp: 11, freq: 26 });
    ctx.shake(T.title, { amp: 5, freq: 22 });
    ctx.shake(T.printf, { amp: 2.5, freq: 24 });
    ctx.flash(T.membrane, { peak: 0.55, attack: 0.05, decay: 9, color: "#d9f3ff" });
    ctx.flash(T.light + 0.1, { peak: 1, attack: 0.35, hold: 0.15, decay: 5.5, color: "#fff8ee" });
    ctx.flash(T.land, { peak: 0.18, attack: 0.03, decay: 8, color: "#fff8ee" });

    // ---------------- hero: the string that falls with us (preview dive only) ----------------
    const HERO = [[0, "Hello, world!"], [8.55, '"Hello, world!\\n"'], [9.85, 'StringLiteral "Hello, world!\\n"'], [10.5, "48 65 6C 6C 6F 2C 20 77 6F 72 6C 64 21 00"], [11.34, 'write(1, "Hello, world!\\n", 14)'], [12.24, "01001000 01100101 01101100 01101100 01101111"]];
    const heroText = (t) => {
      let i = 0; while (i < HERO.length - 1 && t >= HERO[i + 1][0]) i++;
      return i === 0 ? HERO[0][1] : OT.scramble(HERO[i - 1][1], HERO[i][1], inv(HERO[i][0], HERO[i][0] + 0.32, t), t);
    };
    let heroStart = null;
    ctx.hero((t) => {
      if (t < T.plunge || t >= T.land || t > T.light + 0.2) return null;
      if (!heroStart) heroStart = ctx.project(560, 764, 0, T.plunge);
      const mv = tw(T.plunge, 8.05, t, "cubicInOut");
      const burst = sstep(T.light - 0.3, T.light + 0.12, t);
      const dark = 1 - sstep(0.35, 0.8, OT.lightNow ?? 1);
      const col = OT.mix([162, 106, 5], [255, 205, 92], dark);
      return {
        text: heroText(t), x: lerp(heroStart.x, OX, mv), y: lerp(heroStart.y, OY, mv), anchor: lerp(0, 0.5, mv),
        size: lerp(40 * heroStart.s, 46, mv), color: burst > 0 ? [255, Math.round(lerp(col[1], 250, burst)), Math.round(lerp(col[2], 235, burst))] : col,
        glow: Math.min(1, 0.2 + dark + burst), scale: 1 + 0.7 * burst, blur: 10 * burst, opacity: 1 - sstep(T.light - 0.02, T.light + 0.18, t),
      };
    });

    // ---------------- render ----------------
    const CW = 46 * 0.6;
    ctx.render((t) => {
      const cam = ctx.camAt(t);
      const w = wt(t);

      // the page plane: fades as we fall through it
      ctx.show(pagePlane, ctx.depthAlpha(0, t, [380, 820]));
      const frozen = sstep(T.freeze, T.freeze + 0.35, t) * (1 - sstep(T.thaw, T.thaw + 0.8, t));
      const filt = frozen > 0.001 ? `saturate(${(1 - 0.88 * frozen).toFixed(3)}) contrast(${(1 - 0.12 * frozen).toFixed(3)})` : "none";
      page.code.el.style.filter = filt; pill.style.filter = filt; pointer.style.filter = filt;

      // typing + caret
      const typed = inv(T.type0, T.type1, t) * nChars;
      chars.forEach((c) => { c.el.style.opacity = c.order < typed ? 1 : 0; });
      const ti = Math.min(nChars - 1, Math.max(0, Math.floor(typed) - 1));
      const [cl, ccol] = typed < 1 ? [0, 0] : lastTyped[ti];
      ctx.place(caret, 520 + ccol * CW + 3, 330 + cl * 72 + 9, 0);
      const blink = t < T.type1 + 0.2 ? 1 : Math.floor((w - T.type1) / 0.53) % 2 === 0 ? 1 : 0.15;
      caret.style.opacity = ((t < T.freeze ? blink : t < T.thaw ? 0.55 : blink) * (t < T.type0 - 0.3 ? 0 : 1) * (1 - sstep(T.title - 0.2, T.title + 0.2, t))).toFixed(3);

      // pointer
      const pu = tw(T.ptr0, T.ptr1, t, "expoOut");
      const press = t >= T.click && t < T.click + 0.5 ? 1 - 0.12 * Math.exp(-(t - T.click) * 14) : 1;
      ctx.place(pointer, lerp(1580, 1328, pu), lerp(930, 262, pu), 0, `scale(${press.toFixed(3)})`);
      pointer.style.opacity = (sstep(T.ptr0 - 0.05, T.ptr0 + 0.15, t) * (1 - sstep(T.thaw, T.thaw + 0.5, t))).toFixed(3);

      // the Run pill: click, grow into the title's last word, open into the command, turn its arrow down
      const pressP = t >= T.click ? Math.exp(-(t - T.click) * 9) : 0;
      const grow = tw(T.title, T.title + 0.55, t, "backOut");
      pill.style.transform = `scale(${((1 - 0.07 * pressP * Math.cos((t - T.click) * 20)) * lerp(1, 1.5, grow)).toFixed(4)})`;
      const filled = t >= T.click && t < T.out + 0.12;
      pill.style.background = filled ? "#1e1d1a" : "rgba(239,234,224,0)";
      pill.style.color = filled ? "#efeae0" : "#1e1d1a";
      triPath.setAttribute("fill", filled ? "#efeae0" : "#1e1d1a");
      const open = tw(T.commands - 0.35, T.commands + 0.55, t, "expoOut");
      pill.style.width = lerp(150, CMD_W, open).toFixed(1) + "px";
      pill.style.left = (1400 - lerp(150, CMD_W, open)).toFixed(1) + "px";
      pill.style.justifyContent = open > 0.01 ? "flex-start" : "center";
      pill.style.paddingLeft = open > 0.01 ? "22px" : "0px";
      runLabel.style.opacity = (1 - sstep(T.commands - 0.4, T.commands - 0.15, t)).toFixed(3);
      runLabel.style.display = open > 0.6 ? "none" : "";
      cmd.style.opacity = sstep(T.commands - 0.2, T.commands + 0.3, t).toFixed(3);
      cmd.style.clipPath = `inset(0px 0px 0px ${((1 - open) * 100).toFixed(2)}%)`;
      const hiB = sstep(T.build - 0.1, T.build + 0.2, t) * (1 - sstep(T.run - 0.2, T.run + 0.1, t));
      const hiR = sstep(T.run - 0.15, T.run + 0.15, t) * (1 - sstep(T.build2 - 0.2, T.build2 + 0.1, t));
      const hiC = sstep(T.build2 - 0.1, T.build2 + 0.25, t);
      const dimAll = sstep(T.build - 0.1, T.build + 0.2, t);
      cmdB.style.color = OT.rgb(OT.mix([30, 29, 26], [162, 106, 5], hiB));
      cmdB.style.opacity = (1 - 0.6 * dimAll * (1 - hiB)).toFixed(3);
      cmdA.style.opacity = (1 - 0.7 * dimAll).toFixed(3);
      cmdR.style.color = OT.rgb(OT.mix([30, 29, 26], [162, 106, 5], hiR));
      cmdR.style.opacity = (1 - 0.6 * dimAll * (1 - hiR)).toFixed(3);
      cmdC.style.color = OT.rgb(OT.mix([30, 29, 26], [162, 106, 5], Math.max(hiB, hiC)));
      cmdC.style.opacity = (1 - 0.6 * dimAll * (1 - Math.max(hiB, hiC))).toFixed(3);
      const rot = 90 * clamp(spring(t, T.arrow, 16, 0.38), 0, 1.2);
      tri.style.transform = `rotate(${rot.toFixed(2)}deg)`;
      pill.style.opacity = (1 - sstep(T.toInclude + 0.2, T.toInclude + 1.0, t)).toFixed(3);

      // four stages hiding behind one name
      const clangX = 1400 - CMD_W * 1.5 + (22 + 18 + 12) * 1.5;
      ghosts.forEach((g, i) => {
        const tin = T.four - 0.25 + i * 0.16;
        const fan = tw(tin, tin + 0.5, t, "backOut") * (1 - tw(T.hiding + i * 0.05, T.hiding + 0.6 + i * 0.05, t, "cubicIn"));
        ctx.place(g, clangX, 276 + 4 + fan * (70 + i * 56), 0);
        g.style.opacity = (sstep(tin, tin + 0.2, t) * fan).toFixed(3);
      });
      const thr = Math.max(0, ...ghosts.map((_, i) => tw(T.four - 0.25 + i * 0.16, T.four + 0.25 + i * 0.16, t, "backOut") * (1 - tw(T.hiding, T.hiding + 0.6, t, "cubicIn")) * (70 + i * 56) + 30));
      ctx.place(ghostThread, clangX - 18, 300, 0);
      ghostThread.style.height = Math.max(0, thr).toFixed(1) + "px";
      ghostThread.style.opacity = sstep(0, 20, thr).toFixed(3);

      // output line
      out.style.opacity = t >= T.out ? 1 : 0;
      outText.style.transform = `scale(${lerp(0.9, 1, clamp(spring(t, T.out, 22, 0.45), 0, 1.2)).toFixed(4)})`;
      tm.textContent = (0.21 * tw(T.out, T.out + 0.22, t, "expoOut")).toFixed(2) + " s";
      outText.style.visibility = t < T.plunge || t >= T.land ? "visible" : "hidden";
      outText.style.textShadow = frozen > 0.01 ? `0 0 ${(14 * frozen).toFixed(1)}px rgba(255,190,60,${(0.55 * frozen).toFixed(2)})` : "none";

      // title grows out of the Run pill; the page dims around it
      const reveal = tw(T.title + 0.05, T.title + 0.95, t, "expoOut");
      const tOut = tw(T.s01 - 0.25, T.s01 + 0.3, t, "cubicIn");
      titleEl.style.transform = `translate(${((1 - reveal) * 104).toFixed(2)}%, ${(-24 * tOut).toFixed(1)}px)`;
      titleEl.style.opacity = (sstep(T.title, T.title + 0.2, t) * (1 - tOut)).toFixed(3);
      const dimTitle = sstep(T.title, T.title + 0.6, t) * (1 - sstep(T.toInclude, T.toInclude + 1.0, t));
      const dimDesc = sstep(T.toInclude, T.toInclude + 1.0, t);
      const push = tw(T.paste - 0.1, T.paste + 0.8, t, "cubicInOut");
      codeRows.forEach((row, i) => {
        const base = lerp(1, 0.14, dimTitle) * lerp(1, i === 0 ? 1 : 0.35, dimDesc) * (i === 0 ? 1 : 1 - push);
        row.style.opacity = base.toFixed(3);
        row.style.transform = i > 0 ? `translate(0px, ${(push * 420).toFixed(1)}px)` : "none";
        lnums[i].style.opacity = (base * (i === 0 ? 1 - sstep(T.paste, T.paste + 1, t) : 1)).toFixed(3);
        lnums[i].style.transform = i > 0 ? `translate(0px, ${(push * 420).toFixed(1)}px)` : "none";
      });
      const pageDim = Math.max(dimTitle, dimDesc);
      tab.style.opacity = (lerp(1, 0.14, pageDim) * (1 - sstep(T.paste, T.paste + 1, t))).toFixed(3);
      page.rule.style.opacity = (lerp(1, 0.14, pageDim) * (1 - push)).toFixed(3);
      out.style.opacity = ((t >= T.out ? 1 : 0) * lerp(1, 0.14, pageDim) * (1 - push)).toFixed(3);
      const glow = sstep(T.prep - 0.2, T.prep + 0.4, t);
      codeRows[0].style.textShadow = glow > 0 ? `0 0 ${(18 * glow).toFixed(1)}px rgba(79,102,136,${(0.45 * glow).toFixed(2)})` : "none";
      // "it just edits text": a selection sweeps the line; "#include" pulses
      const sw = tw(T.edits - 0.1, T.edits + 0.45, t, "cubicOut");
      sel.style.width = (sw * 18 * CW + 8).toFixed(1) + "px";
      sel.style.opacity = (sstep(T.edits - 0.1, T.edits, t) * (1 - sstep(T.hash + 0.5, T.paste, t))).toFixed(3);
      const hp = Math.exp(-Math.max(0, t - T.hash) * 3) * sstep(T.hash - 0.05, T.hash, t);
      page.code.segs[0][0].style.color = OT.rgb(OT.mix([79, 102, 136], [40, 70, 130], hp));

      // preview layers
      layers.forEach((L) => {
        if (t < L.win[0] || t > L.win[1]) { ctx.show(L.el, 0); return; }
        ctx.show(L.el, ctx.depthAlpha(L.D, t, L.near, L.far));
      });
      heatglow.setAttribute("opacity", (0.25 + 0.75 * sstep(12.0, 13.75, t)).toFixed(3));
      pulses.forEach((p) => p.setAttribute("stroke-dashoffset", (-(t * 900 + parseFloat(p.dataset.ph) * 400) % 400).toFixed(1)));

      // the scroll unrolls from #include
      const shown = t < T.paste ? 0 : OT.track([[T.paste, 0], [T.here, 12, "cubicOut"], [T.five, 20, "lin"], [T.hundreds, 72, "quadIn"], [T.buried - 0.1, NH + 4, "lin"]], t);
      const unroll = clamp(shown * SC.lh, 0, scrollH + 10);
      scroll.style.clipPath = `inset(0px 0px ${Math.max(0, scrollH + 10 - unroll).toFixed(1)}px 0px)`;
      ctx.show(scroll, t >= T.paste - 0.05 ? 1 - sstep(T.lift0, T.lift1 - 0.25, t) : 0);
      const hot = sstep(T.descr, T.printf + 0.3, t);
      scode.rows.forEach((row, k) => {
        const eff = cam.z - lineD(k);
        const a = (0.3 + 0.7 * sstep(k * SC.lh - 40, k * SC.lh + 60, unroll)) * (1 - sstep(560, 860, eff)) * OT.sstep(-2600, -1500, eff);
        row.style.opacity = (k === HOT ? Math.max(a, a) : a * (1 - 0.55 * hot)).toFixed(3);
      });
      scode.rows[HOT].style.textShadow = hot > 0 ? `0 0 ${(26 * hot).toFixed(1)}px rgba(230,160,30,${(0.6 * hot).toFixed(2)})` : "none";

      // our own code lifts off the tail of the scroll and settles flat
      const u = tw(T.lift0, T.lift1, t, "cubicInOut");
      const arc = Math.sin(Math.PI * u) * 160;
      const P = { x: lerp(P0.x, P1.x, u), y: lerp(P0.y, P1.y, u), d: lerp(P0.d, P1.d, u) - arc, rot: lerp(P0.rot, P1.rot, u), s: lerp(P0.s, P1.s, u) };
      lift.style.transform = `translate3d(${P.x.toFixed(2)}px, ${P.y.toFixed(2)}px, ${(-P.d).toFixed(2)}px) rotateX(${P.rot.toFixed(3)}deg) scale(${P.s.toFixed(4)})`;
      const liftVis = sstep(NH * SC.lh - 120, NH * SC.lh - 20, unroll) * (t >= T.paste ? 1 : 0);
      ctx.show(lift, t >= ctx.t1 ? 0 : t >= T.lift1 ? 1 : liftVis * (u > 0 ? 1 : 1 - sstep(560, 860, cam.z - P0.d)));
    });
  },
});
