// Sequence E — shell, fork, scheduler, exec, address space   (s10 s11 s12 s13 s14)
//
// Camera journey (local depth; larger = deeper):
//   slab on the disk (0) ──whip up through ghosts of the compile strata──▶ the page (−5300)
//   ──sink through the paper──▶ user space (−3400): zsh, the kernel membrane glowing below (−2400)
//   fork (mitosis) ── pull back: hundreds of cells, CPU cores under the membrane (−2150) beam up into them
//   ── push in on the clone ── its exec thread drops to the disk ── plunge down the thread to the slab (0)
//   ── whip back up with the program headers ── dive into the clone ▶ its address space (−2700) = baton 5
(function () {
  const { clamp, lerp, inv, sstep, tw, spring, rng, hash } = OT;

  const TERM_CMD = [["$ ", "pr"], ["clang -O2 hello.c -o hello && ", "dim"], ["./hello", ""]];
  const D_PAGE = -5300, D_US = -3400, D_KM = -2400, D_CORE = -2150, D_EXIT = -2700;
  const ZSH = { x: 1500, y: 1200 }, PAR = { x: 1150, y: 1200 }, KID = { x: 1850, y: 1200 };
  const R0 = 190, SEPB = R0 * 1.22, SEPF = 350;
  const SLAB_HIT = { x: 650, y: 437, d: 0 };          // the slab's name, where the exec thread lands
  const MC = { x: 1700, y: 1150 };                     // centre of the membrane / crowd
  const PULL = { x: 1720, y: 1150, z: D_US - 1250 };   // the pulled-back camera

  const GHOSTS = [
    { d: -800, cls: "gb", items: ["50 48 8D 3D BC 0E 00 00", "E8 E3 FE FF FF 31 C0 59", "7F 45 4C 46 02 01 01 00", "<b>48 65 6C 6C 6F 2C 20 77</b>", "C3 00 00 00 01 1B 03 3B", "<b>6F 72 6C 64 21 00</b>"] },
    { d: -1650, cls: "ga", items: ["push  rax", "lea   rdi, [rip + .Lstr]", "call  puts@PLT", "xor   eax, eax", "pop   rcx", "ret"] },
    { d: -2500, cls: "gi", items: ["define i32 @main() {", "%1 = tail call i32 @puts(ptr @str)", "ret i32 0", "declare i32 @puts(ptr)", '<b>c"Hello, world!\\00"</b>'] },
    { d: -3350, cls: "gt", items: ["FunctionDecl main", "CompoundStmt", "CallExpr 'int'", "ReturnStmt", "IntegerLiteral 0", "DeclRefExpr printf"] },
    { d: -4250, cls: "gk", items: ["int", "main", "(", "void", ")", "{", "printf", '<b>"Hello, world!\\n"</b>', "return", "0", ";", "}"] },
  ];
  const SYS = ["read", "write", "openat", "close", "mmap", "munmap", "brk", "wait4", "exit_group", "futex", "ioctl", "fstat", "rt_sigaction", "pread64", "mprotect", "getpid", "kill", "pipe2", "dup2", "poll", "sched_yield", "nanosleep", "lseek", "access", "getdents64", "socket", "connect", "sendto", "recvfrom", "epoll_wait", "set_tid_address", "prlimit64", "arch_prctl", "uname"];
  const KNAMES = [["do_execveat_common", -1950, 2350, 1500], ["bprm_execve", -1550, 650, 1150], ["search_binary_handler", -1100, 1900, 380], ["load_elf_binary", -620, 300, 980], ["begin_new_exec", -330, 1700, 1080]];
  const NAMED = [
    { n: "systemd", pid: "PID 1", x: 470, y: 330 }, { n: "sshd", pid: "", x: 2980, y: 260 }, { n: "Xwayland", pid: "", x: 330, y: 1480 },
    { n: "firefox", pid: "", x: 3080, y: 1560 }, { n: "pipewire", pid: "", x: 3560, y: 760 },
  ];
  const CORES = [{ x: 70, y: 250 }, { x: 1170, y: 250 }, { x: 2270, y: 250 }, { x: 3370, y: 250 }];
  const KWORK = [{ n: "kworker/1:2", x: 3100, y: 1650 }, { n: "", x: 300, y: 1250 }];
  const PH = [
    [["PHDR", "t"]],
    [["INTERP     ", "t"], ["/lib64/ld-linux-x86-64.so.2", "p"]],
    [["LOAD       ", "t"], ["r--", "m"]],
    [["LOAD       ", "t"], ["r-x", "m"]],
    [["LOAD       ", "t"], ["r--", "m"]],
    [["LOAD       ", "t"], ["rw-", "m"]],
    [["DYNAMIC    ", "t"], ["", "p"]],
    [["GNU_STACK  ", "t"], ["rw-", "m"]],
    [["entry      ", "t"], ["0x1040", "e"]],
  ];
  const PH_LH = 44, PH_FS = 30, PH_W = 690, PH_H = PH.length * PH_LH;
  const GLYPHS = [["$PATH", -95, 58], ["zle", 92, 84], ["history", -10, 128], ["$PS1", 122, -34], ["jobs", -128, -6], ["setopt", 58, 150]];

  const CSS = `
.sE-ghost{position:absolute;font-family:"JetBrains Mono",monospace;white-space:pre;line-height:1}
.sE-ghost b{font-weight:400;color:#ffc54d;text-shadow:0 0 16px rgba(255,190,70,.6)}
.sE-ghost.gb{font-size:40px;color:rgba(130,220,255,.85);text-shadow:0 0 14px rgba(90,200,255,.5)}
.sE-ghost.ga{font-size:44px;color:#e6eef8}
.sE-ghost.gi{font-size:40px;color:#c9d6ff}
.sE-ghost.gt{font-size:42px;color:#d4ecf3}
.sE-ghost.gk{font-size:60px;color:#f4f1ea}
.sE-ul{position:absolute;height:3px;background:#1e1d1a;transform-origin:0 50%;border-radius:2px}
.sE-carry{position:absolute;left:0;top:0;font-family:"JetBrains Mono",monospace;white-space:pre;line-height:1}
.sE-glint{position:absolute;left:580px;top:405px;width:760px;height:470px;border-radius:6px;box-shadow:0 0 0 3px rgba(225,247,255,.95),0 0 70px rgba(150,220,255,.85),inset 0 0 50px rgba(150,220,255,.35)}
.sE-mrow{position:absolute;left:599px;top:487px;width:140px;height:34px;border-radius:5px;border:2px solid rgba(255,214,120,.95);box-shadow:0 0 22px rgba(255,200,90,.8),inset 0 0 14px rgba(255,200,90,.45)}
.sE-mem{position:absolute;width:9000px;height:6000px;background:repeating-linear-gradient(0deg,rgba(170,230,255,.3) 0 3px,transparent 3px 150px),repeating-linear-gradient(90deg,rgba(170,230,255,.3) 0 3px,transparent 3px 150px)}
.sE-memglow{position:absolute;left:0;top:0;width:4000px;height:4000px;margin:-2000px 0 0 -2000px;border-radius:50%;background:radial-gradient(closest-side,rgba(205,246,255,.6),rgba(120,200,255,.2) 50%,rgba(80,160,255,0) 100%)}
.sE-sys{position:absolute;font-family:"JetBrains Mono",monospace;font-size:34px;color:rgba(215,245,255,.5);white-space:pre}
.sE-door{position:absolute;left:0;top:0;font-family:"JetBrains Mono",monospace;font-size:58px;white-space:pre;color:rgba(215,245,255,.55)}
.sE-ring{position:absolute;left:0;top:0;border-radius:50%;border:4px solid rgba(205,246,255,.95);box-shadow:0 0 30px rgba(140,225,255,.8),inset 0 0 30px rgba(140,225,255,.5)}
.sE-core{position:absolute;width:250px;height:250px;margin:-125px 0 0 -125px;border-radius:22px;border:3px solid rgba(160,230,255,.95);background:radial-gradient(circle,rgba(225,250,255,.8),rgba(120,210,255,.28) 45%,rgba(60,140,220,.08) 80%);box-shadow:0 0 80px rgba(110,210,255,.75),inset 0 0 40px rgba(150,230,255,.6)}
.sE-die{position:absolute;border:4px solid rgba(150,220,255,.45);border-radius:40px;background:rgba(80,160,230,.06);box-shadow:0 0 90px rgba(90,180,255,.25)}
.sE-corel{position:absolute;font:700 60px "JetBrains Mono",monospace;color:#c4f0ff;white-space:pre;transform:translate(-50%,0);text-shadow:0 0 18px rgba(110,210,255,.8)}
.sE-th{position:absolute;left:0;top:0;transform-origin:0 50%}
.sE-th.warm{height:3px;margin-top:-1.5px;background:rgba(255,222,174,.92);box-shadow:0 0 10px rgba(255,200,140,.7)}
.sE-th.cyan{height:3px;margin-top:-1.5px;background:rgba(195,242,255,.95);box-shadow:0 0 12px rgba(120,220,255,.85)}
.sE-th.beam{height:9px;margin-top:-4.5px;border-radius:5px;background:linear-gradient(90deg,rgba(120,215,255,.5),rgba(236,252,255,.97));box-shadow:0 0 22px rgba(120,220,255,.85)}
.sE-th.gold{height:4px;margin-top:-2px;background:rgba(255,228,170,.96);box-shadow:0 0 14px rgba(255,200,110,.85)}
.sE-bead{position:absolute;left:0;top:0;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:radial-gradient(circle,#fff 0 16%,rgba(255,226,170,.75) 32%,rgba(255,210,150,0) 70%)}
.sE-bead.cy{background:radial-gradient(circle,#fff 0 16%,rgba(170,235,255,.8) 32%,rgba(150,225,255,0) 70%)}
.sE-pierce{position:absolute;left:0;top:0;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;background:radial-gradient(circle,rgba(240,252,255,.95) 0 9%,rgba(150,230,255,.5) 28%,rgba(150,230,255,0) 70%)}
.sE-c{position:absolute;left:0;top:0;border-radius:50%;--lit:0;background:radial-gradient(circle at 42% 38%,rgba(255,236,200,.36),rgba(255,196,120,.13) 52%,rgba(255,170,90,.03) 71%,rgba(255,170,90,0) 73%);box-shadow:inset 0 0 0 2px rgba(255,214,160,.5)}
.sE-c.v1{background:radial-gradient(circle at 42% 38%,rgba(255,224,214,.32),rgba(250,170,150,.12) 52%,rgba(240,150,140,.03) 71%,rgba(240,150,140,0) 73%);box-shadow:inset 0 0 0 2px rgba(255,200,186,.45)}
.sE-c.v2{background:radial-gradient(circle at 42% 38%,rgba(246,234,222,.3),rgba(226,200,184,.11) 52%,rgba(210,190,180,.03) 71%,rgba(210,190,180,0) 73%);box-shadow:inset 0 0 0 2px rgba(240,224,206,.42)}
.sE-c::after{content:"";position:absolute;left:-30%;top:-30%;width:160%;height:160%;border-radius:50%;opacity:var(--lit);background:radial-gradient(circle,rgba(255,251,238,.97) 0 20%,rgba(255,222,164,.6) 36%,rgba(255,200,130,0) 68%)}
.sE-c.kw{background:radial-gradient(circle at 42% 38%,rgba(210,245,255,.42),rgba(120,200,255,.15) 52%,rgba(100,180,255,0) 73%);box-shadow:inset 0 0 0 3px rgba(160,230,255,.6)}
.sE-c.kw::after{background:radial-gradient(circle,rgba(240,252,255,.97) 0 20%,rgba(150,225,255,.6) 36%,rgba(120,210,255,0) 68%)}
.sE-cn{position:absolute;left:-60px;right:-60px;top:50%;transform:translateY(-62%);text-align:center;font:700 46px "JetBrains Mono",monospace;color:#fff3df;white-space:pre}
.sE-c.kw .sE-cn{font-size:54px;color:#d8f6ff}
.sE-cp{position:absolute;left:0;right:0;top:50%;transform:translateY(62%);text-align:center;font:28px "JetBrains Mono",monospace;color:rgba(255,230,200,.75)}
.sE-svg{position:absolute;overflow:visible}
.sE-lab{position:absolute;left:0;top:0;font-family:"JetBrains Mono",monospace;white-space:pre;line-height:1}
.sE-lab.nm{font-size:38px;font-weight:700;color:#fff3df}
.sE-lab.pid{font-size:23px;color:rgba(255,232,204,.8)}
.sE-lab.gl{font-size:20px;color:rgba(255,226,190,.55)}
.sE-hit{position:absolute;left:0;top:0;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;background:radial-gradient(circle,rgba(255,246,226,.9) 0 10%,rgba(255,214,160,.45) 30%,rgba(255,214,160,0) 68%)}
.sE-cur{position:absolute;left:100%;top:0;margin-left:3px;font-weight:400;color:#ffe9c8}
.sE-kn{position:absolute;left:0;top:0;font-family:"JetBrains Mono",monospace;font-size:46px;color:rgba(150,225,255,.62);white-space:pre;text-shadow:0 0 14px rgba(90,200,255,.5)}
.sE-mg{position:absolute;left:0;top:0;font:22px "JetBrains Mono",monospace;color:#fff3cf;white-space:pre;text-shadow:0 0 18px rgba(255,200,90,.95)}
.sE-ph{position:absolute;left:0;top:0;transform-origin:0 0;width:${PH_W}px;height:${PH_H}px;font-family:"JetBrains Mono",monospace;font-size:${PH_FS}px}
.sE-ph .r{position:absolute;left:0;top:0;height:${PH_LH}px;line-height:${PH_LH}px;white-space:pre;color:#e6f4ff;text-shadow:0 0 14px #000,0 0 6px #000,0 0 2px #000}
.sE-ph .r{transform-origin:0 50%}
.sE-ph .t{color:#c3d2ff}.sE-ph .p{color:#eef4ff}.sE-ph .m{color:#8fe0ff}.sE-ph .e{color:#ffffff;font-weight:700}
.sE-bglow{position:absolute;width:640px;border-radius:4px;background:rgba(255,230,190,.14);box-shadow:0 0 50px rgba(255,214,160,.55),inset 0 0 34px rgba(255,226,180,.45)}
.sE-bglow.cy{background:rgba(190,240,255,.12);box-shadow:0 0 50px rgba(140,220,255,.55),inset 0 0 34px rgba(160,230,255,.45)}
.sE-frame{position:absolute;border:2px dashed rgba(226,206,255,.42);border-radius:8px}
.sE-args{position:absolute;font:21px "JetBrains Mono",monospace;color:#fff1dc;white-space:pre;line-height:1}
.sE-ld{position:absolute;left:0;top:0;height:48px;padding:0 20px;border-radius:24px;font:700 24px/48px "JetBrains Mono",monospace;color:#062330;background:#dff8ff;box-shadow:0 0 30px rgba(140,230,255,.9),0 0 80px rgba(120,210,255,.5);white-space:pre}
.sE-wl{position:absolute;font:21px "JetBrains Mono",monospace;color:#c4f0ff;white-space:pre;line-height:1}
`;

  OT.sequence({
    id: "E",
    build(ctx) {
      const { t0, t1 } = ctx;
      const W = (b, w, n) => ctx.at(b, w, n), We = (b, w, n) => ctx.end(b, w, n);
      const T = {
        s10: W("s10", "The"), dot: W("s10", "dot-slash"), hello: We("s10", "hello"), goes: W("s10", "goes"), shell: W("s10", "shell"),
        program: W("s10", "program"), waiting: W("s10", "waiting"), type: We("s10", "type"), but: W("s10", "But"), cant: W("s10", "can't"),
        own: W("s10", "own"), only: W("s10", "Only"), kernel: W("s10", "kernel"), can: We("s10", "can"), so: W("s10", "So"), asks: W("s10", "asks"),
        first: W("s11", "First"), fork: W("s11", "fork"), clones: W("s11", "clones"), brand: W("s11", "brand-new"), with: W("s11", "with"), id: W("s11", "ID"),
        that: W("s12", "That"), one: W("s12", "one"), hundreds: W("s12", "hundreds"), sched: W("s12", "scheduler"), decides: W("s12", "decides"),
        cpu: W("s12", "CPU"), core: W("s12", "core"), how: W("s12", "how"), slices: W("s12", "slices"), switching: W("s12", "switching"),
        constantly: W("s12", "constantly"), when: W("s12", "When"), turn: W("s12", "turn"), makes: W("s12", "makes"), request: W("s12", "request"),
        exec: W("s13", "Exec"), replace: W("s13", "replace"), file13: W("s13", "file"), wipes: W("s13", "wipes"), memory: W("s13", "memory"),
        checks: W("s13", "checks"), magic: W("s13", "magic"), number: W("s13", "number"), reads: W("s13", "reads"), map: W("s13", "map"),
        inside: W("s13", "inside"), what: W("s13", "what"), where1: W("s13", "where", 1), where2: W("s13", "where", 2), begin: W("s13", "begin"),
        builds: W("s14", "builds"), address: W("s14", "address"), space: W("s14", "space"), code: W("s14", "code"), ro1: W("s14", "read-only", 1),
        exe: W("s14", "executable"), our: W("s14", "Our"), string: W("s14", "string"), ro2: W("s14", "read-only", 2), right: W("s14", "right"),
        beside: W("s14", "beside"), stack: W("s14", "stack"), top: W("s14", "top"), holding: W("s14", "holding"), args: W("s14", "arguments"),
        asked: W("s14", "asked"), libc: W("s14", "lib-C"), dynamic: W("s14", "dynamic"), linker: W("s14", "linker"), first14: W("s14", "first"),
        mapping: W("s14", "mapping"), library: W("s14", "library"), wiring: W("s14", "wiring"), stub: W("s14", "stub"), real: W("s14", "real"),
        puts: W("s14", "puts"), putsE: We("s14", "puts"),
      };

      // ------------------------------------------------------------------ camera
      const whip0 = t0 + 0.5, land = T.s10 - 0.2, WD = land - whip0;
      const sink0 = T.goes - 0.15, sink1 = T.shell + 0.75, SD = sink1 - sink0;
      const plunge0 = T.memory - 0.05, plunge1 = T.magic - 0.12, PD = plunge1 - plunge0;
      const up0 = T.what - 0.05, up1 = T.where2 + 0.05, UD = up1 - up0;
      const dive0 = T.builds - 0.1, dive1 = T.space + 0.1;
      const tBreak = T.clones + 0.62;
      // Text sits still while it is read: every stretch with readable text is a dead-still rest (two identical
      // keys; a slow creep re-rasterises the glyphs every frame and they shimmer). Moves between rests are
      // decisive; a 5th field names an OT.E speed curve for the segment arriving at that key.
      const R1 = [ZSH.x, ZSH.y, D_US];                          // zsh waiting, "./hello" inside
      const R2 = [ZSH.x, ZSH.y + 10, D_US - 380];               // the membrane below, the clone door
      const R3 = [1600, 1210, D_US - 380];                      // the two cells, the new PID
      const R4 = [PULL.x, PULL.y, PULL.z];                      // the crowd, the CPU cores
      const R5 = [KID.x - 250, KID.y - 110, D_US - 160];        // the clone and its exec thread
      const R6 = [KID.x + 120, KID.y + 230, D_EXIT + 130];      // the address space: text, rodata
      const R7 = [KID.x + 120, KID.y + 20, D_EXIT + 80];        // the stack, argv, NEEDED, ld.so
      const R8 = [KID.x + 70, KID.y + 95, D_EXIT - 60];         // libc mapped, the stub wired to puts
      const CAM = [
        [t0, 960, 640, 0],
        [whip0, 960, 640, 0],
        [whip0 + 0.3 * WD, 960, 640, -520],
        [whip0 + 0.62 * WD, 960, 640, -2950],
        [whip0 + 0.86 * WD, 960, 640, -4950],
        [land, 960, 640, D_PAGE],
        [sink0, 960, 640, D_PAGE],
        [sink0 + 0.45 * SD, 1240, 930, D_PAGE + 950],
        [sink1, ...R1],
        [T.only - 0.35, ...R1],
        [T.can + 0.1, ...R2],                                   // "Only the kernel can": pull back to the membrane
        [T.clones + 0.15, ...R2],
        [T.with - 0.4, ...R3, "quintInOut"],                    // catch the clone as it springs free
        [T.one - 0.45, ...R3],
        [T.hundreds + 0.75, ...R4, "quintInOut"],               // "one of hundreds": whoosh back, peak on "hundreds"
        [T.when, ...R4],
        [T.request + 0.3, ...R5, "quintInOut"],                 // "gets its turn": push in, settled for "request"
        [plunge0, ...R5],
        [plunge0 + 0.36 * PD, lerp(KID.x, 960, 0.22), lerp(KID.y, 640, 0.22), D_US + 760],
        [plunge0 + 0.72 * PD, lerp(KID.x, 960, 0.8), lerp(KID.y, 640, 0.8), -760],
        [plunge1, 960, 640, 0],
        [up0, 960, 640, 0],
        [up0 + 0.3 * UD, lerp(960, KID.x, 0.22), lerp(640, KID.y, 0.22), -880],
        [up0 + 0.7 * UD, lerp(960, KID.x, 0.85), lerp(640, KID.y, 0.85), D_US + 640],
        [up1, KID.x, KID.y, D_US + 200],
        [dive0, KID.x, KID.y, D_US + 200],
        [dive1, ...R6],
        [T.stack - 0.7, ...R6],
        [T.stack + 0.25, ...R7],                                // up to the stack
        [T.library - 0.1, ...R7],
        [T.wiring + 0.3, ...R8],                                // back a little: libc, the wire
        [T.putsE + 0.1, ...R8],
        [t1 - 0.45, KID.x, KID.y, D_EXIT],                      // settle onto baton 5
        [t1, KID.x, KID.y, D_EXIT],
      ];
      ctx.cam(CAM.map(([t, x, y, z, ease]) => [t, ease ? { x, y, z, roll: 0, ease } : { x, y, z, roll: 0 }]));
      ctx.exit({ x: KID.x, y: KID.y, z: D_EXIT });

      // when does the camera cross a depth? (my own spline; interior segments match the engine's)
      const zf = OT.monotone(CAM.map((k) => [k[0], k[3]]));
      const cross = (z, a, b) => {
        let lo = a, hi = b; const s = Math.sign(zf(b) - zf(a));
        for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if ((zf(m) - z) * s < 0) lo = m; else hi = m; }
        return (lo + hi) / 2;
      };
      const plX = cross(D_KM + 700, plunge0, plunge1), upX = cross(D_KM + 700, up0, up1);

      ctx.ground([
        [t0, "#040406"], [whip0, "#040406"],
        [cross(-800, whip0, land), "#07070f"], [cross(-1650, whip0, land), "#0e0c26"], [cross(-2500, whip0, land), "#0b1a3a"],
        [cross(-3350, whip0, land), "#1a4a6e"], [cross(-4250, whip0, land), "#4f98a0"], [cross(-4900, whip0, land), "#a9cdcb"],
        [land, "#efeae0"], [sink0 + 0.05, "#efeae0"],
        [cross(D_PAGE + 650, sink0, sink1), "#9b90a3"], [cross(D_PAGE + 1300, sink0, sink1), "#3a2d52"], [sink1, "#2b2140"],
        [plX - 0.06, "#2b2140"], [plX + 0.1, "#0c1430"], [plunge1 - 0.15, "#070c1c"], [plunge1 + 0.3, "#040406"],
        [up0, "#040406"], [upX - 0.3, "#070c1c"], [upX + 0.08, "#2b2140"],
        [dive0, "#2b2140"], [dive1, "#1e1730"], [t1, "#1e1730"],
      ]);
      ctx.motes([[t0, "none"], [land - 0.3, "dust"], [sink0 + 0.55, "spores"], [plX, "sparks"], [upX, "spores"]]);
      ctx.flash(land, { peak: 0.22, decay: 7, color: "#fff8ee" });
      ctx.shake(land, { amp: 5 });
      ctx.shake(tBreak, { amp: 3.5 });
      ctx.flash(plX, { peak: 0.45, decay: 10, color: "#d9f3ff" });
      ctx.shake(plX, { amp: 14, freq: 34 });
      ctx.shake(plunge1, { amp: 9 });
      ctx.flash(upX, { peak: 0.42, decay: 9, color: "#d9f3ff" });
      ctx.shake(upX, { amp: 9, freq: 34 });
      ctx.hero(() => null);

      // ------------------------------------------------------------------ DOM (built once)
      const TOPS = [];
      const top = (e) => (TOPS.push(e), e);
      const plane = (d) => top(ctx.plane(d));
      const free = (cls, html) => top(ctx.el("div", cls, ctx.root, html));
      ctx.el("style", "", ctx.root, CSS);

      // ghosts of the compile strata (only seen streaking past during the whip)
      const ghosts = GHOSTS.map((g, i) => {
        const p = plane(g.d);
        const r = rng(400 + i * 37);
        const n = g.items.length;
        g.items.forEach((txt, j) => {
          const a = (j / n) * Math.PI * 2 + i * 0.9 + (r() - 0.5) * 0.5;
          const rad = 540 + r() * 620;
          const e = ctx.el("div", `sE-ghost ${g.cls}`, p, txt);
          e.style.left = (960 + Math.cos(a) * rad * 1.45).toFixed(0) + "px";
          e.style.top = (640 + Math.sin(a) * rad * 0.8).toFixed(0) + "px";
          e.style.transform = `translate(-50%,-50%) rotate(${((r() - 0.5) * 8).toFixed(1)}deg)`;
        });
        return { el: p, d: g.d };
      });

      // the surface page
      const pPage = plane(D_PAGE);
      const page = OT.C.page(pPage);
      page.setTerm([TERM_CMD]);
      const tl0 = page.tlines[0];
      const runSpan = tl0.children[2];
      const tabEl = page.el.querySelector(".tab");
      const TCW = 32 * 0.6, CMD_COL = TERM_CMD[0][0].length + TERM_CMD[1][0].length;
      const RUN_X = 520 + CMD_COL * TCW, RUN_Y = 732 + 25;
      const HELLO_X = RUN_X + 4.5 * TCW, RUN_CX = RUN_X + 3.5 * TCW;
      const ul = ctx.el("div", "sE-ul", pPage);
      ul.style.left = RUN_X + "px"; ul.style.top = 732 + 45 + "px"; ul.style.width = 7 * TCW + "px";

      // the slab on the disk (baton 4)
      const pSlab = plane(0);
      const slab = OT.C.slab(pSlab, { name: "hello", size: "16 KB" });
      slab.el.style.left = "580px"; slab.el.style.top = "405px";
      const slabName = slab.el.querySelector(".name"), slabMagic = slab.el.querySelector(".magic"), slabBytes = slab.el.querySelector(".bytes"), slabHdr = slab.el.querySelector(".hdr");
      slabMagic.style.display = "inline-block"; slabMagic.style.transformOrigin = "0 50%";
      const MAGIC_POS = { x: 580 + 26 + 5 * 18 + 18 + 5.5 * 13.2, y: 437 };
      const glint = ctx.el("div", "sE-glint", pSlab);
      const magicRow = ctx.el("div", "sE-mrow", pSlab);

      // the kernel membrane
      const pKM = plane(D_KM);
      const mem = ctx.el("div", "sE-mem", pKM);
      mem.style.left = MC.x - 4500 + "px"; mem.style.top = MC.y - 3000 + "px";
      const memGlow = ctx.el("div", "sE-memglow", pKM);
      const clonePt = { x: ZSH.x + 900, y: ZSH.y + 250, d: D_KM };
      const fEx = (D_KM - D_US) / (SLAB_HIT.d - D_US);
      const execPt = { x: lerp(KID.x, SLAB_HIT.x, fEx), y: lerp(KID.y, SLAB_HIT.y, fEx), d: D_KM };
      const sysBox = ctx.el("div", "", pKM);
      {
        const r = rng(91);
        let k = 0;
        const used = [];
        for (let i = 0; i < 400 && k < 46; i++) {
          const x = MC.x + (r() - 0.5) * 6400, y = MC.y + (r() - 0.5) * 4200;
          if (Math.hypot(x - clonePt.x, y - clonePt.y) < 420 || Math.hypot(x - execPt.x - 300, (y - execPt.y) * 2.2) < 900) continue;
          if (used.some((u) => Math.abs(u[0] - x) < 520 && Math.abs(u[1] - y) < 90)) continue;
          if ([ZSH, KID, PAR].some((p) => Math.hypot(p.x - x, p.y - y) < 560)) continue;
          used.push([x, y]);
          const e = ctx.el("div", "sE-sys", sysBox, SYS[k % SYS.length]);
          e.style.left = x.toFixed(0) + "px"; e.style.top = y.toFixed(0) + "px";
          k++;
        }
      }
      const cloneLab = ctx.el("div", "sE-door", pKM, "clone");
      const execLab = ctx.el("div", "sE-door", pKM, "execve");
      const cloneRing = ctx.el("div", "sE-ring", pKM), execRing = ctx.el("div", "sE-ring", pKM), sweepRing = ctx.el("div", "sE-ring", pKM);
      const pierces = CORES.map(() => ctx.el("div", "sE-pierce", pKM));

      // CPU cores and kernel threads, under the membrane
      const pCore = plane(D_CORE);
      const die = ctx.el("div", "sE-die", pCore);
      die.style.left = CORES[0].x - 330 + "px"; die.style.top = CORES[0].y - 300 + "px";
      die.style.width = CORES[3].x - CORES[0].x + 660 + "px"; die.style.height = "720px";
      const coreEls = CORES.map((c, i) => {
        const e = ctx.el("div", "sE-core", pCore); e.style.left = c.x + "px"; e.style.top = c.y + "px";
        const l = ctx.el("div", "sE-corel", pCore, "CPU " + i); l.style.left = c.x + "px"; l.style.top = c.y + 150 + "px";
        return { e, l };
      });
      const kws = KWORK.map((k) => {
        const e = ctx.el("div", "sE-c kw", pCore); const rr = 120;
        e.style.width = e.style.height = rr * 2 + "px";
        if (k.n) ctx.el("div", "sE-cn", e, k.n);
        return { x: k.x, y: k.y, d: D_CORE, r: rr, el: e, ph: k.x * 0.01 };
      });

      // kernel functions on the way down to the disk (texture of the dark kernel)
      const kns = KNAMES.map(([n, d, x, y]) => ({ el: free("sE-kn", n), d, x, y }));

      // the crowd of user processes
      const crowd = [];
      {
        const r = rng(4013);
        const named = NAMED.map((n) => ({ x: n.x, y: n.y, r: 130 }));
        let tries = 0;
        while (crowd.length < 170 && tries < 9000) {
          tries++;
          const x = -900 + r() * 5300, y = -650 + r() * 3700, rad = 38 + Math.pow(r(), 1.7) * 82, d = D_US - 450 + r() * 820;
          if ([ZSH, PAR, KID].some((p) => Math.hypot(p.x - x, p.y - y) < R0 + rad + 210)) continue;
          if (named.some((p) => Math.hypot(p.x - x, p.y - y) < p.r + rad + 40)) continue;
          if (crowd.some((c) => Math.hypot(c.x - x, c.y - y) < c.r + rad + 22)) continue;
          crowd.push({ x, y, d, r: rad, ph: r() * 6.28, v: Math.floor(r() * 3), base: 0.5 + 0.5 * r() });
        }
        let tiny = 0; tries = 0;
        while (tiny < 130 && tries < 9000) {
          tries++;
          const x = -1100 + r() * 5700, y = -800 + r() * 4000, rad = 15 + r() * 20, d = D_US + 150 + r() * 480;
          if ([ZSH, PAR, KID].some((p) => Math.hypot(p.x - x, p.y - y) < R0 + rad + 150)) continue;
          if (crowd.some((c) => Math.hypot(c.x - x, c.y - y) < c.r + rad + 14)) continue;
          crowd.push({ x, y, d, r: rad, ph: r() * 6.28, v: Math.floor(r() * 3), base: 0.35 + 0.45 * r() });
          tiny++;
        }
        crowd.forEach((c) => {
          c.el = free(`sE-c ${c.v ? "v" + c.v : ""}`);
          c.el.style.width = c.el.style.height = (2 * c.r).toFixed(0) + "px";
          c.el.style.marginLeft = c.el.style.marginTop = (-c.r).toFixed(0) + "px";
        });
      }
      const named = NAMED.map((n, i) => {
        const rr = 128, e = free("sE-c");
        e.style.width = e.style.height = 2 * rr + "px"; e.style.marginLeft = e.style.marginTop = -rr + "px";
        ctx.el("div", "sE-cn", e, n.n);
        if (n.pid) ctx.el("div", "sE-cp", e, n.pid);
        return { x: n.x, y: n.y, d: D_US - 60 + i * 30, r: rr, el: e, ph: i * 1.7, base: 1 };
      });

      // zsh, its clone (mitosis drawn as one SVG outline)
      const pUS = plane(D_US);
      const svg = ctx.el("div", "", pUS, `<svg class="sE-svg" width="3600" height="2400" viewBox="-600 -100 3600 2400" style="left:-600px;top:-100px">
        <defs>
          <radialGradient id="sE-gN"><stop offset="0" stop-color="#fff2dc" stop-opacity=".6"/><stop offset=".5" stop-color="#ffc884" stop-opacity=".2"/><stop offset="1" stop-color="#ffb064" stop-opacity="0"/></radialGradient>
          <radialGradient id="sE-gK"><stop offset="0" stop-color="#fff6e2" stop-opacity=".78"/><stop offset=".45" stop-color="#ffcf6a" stop-opacity=".27"/><stop offset="1" stop-color="#ffb43c" stop-opacity="0"/></radialGradient>
          <radialGradient id="sE-gH"><stop offset=".55" stop-color="#ffbe78" stop-opacity="0"/><stop offset=".66" stop-color="#ffbe78" stop-opacity=".2"/><stop offset="1" stop-color="#ffbe78" stop-opacity="0"/></radialGradient>
          <radialGradient id="sE-gHK"><stop offset=".55" stop-color="#ffc54d" stop-opacity="0"/><stop offset=".66" stop-color="#ffc54d" stop-opacity=".3"/><stop offset="1" stop-color="#ffc54d" stop-opacity="0"/></radialGradient>
        </defs>
        <circle class="hp" fill="url(#sE-gH)"/><circle class="hk" fill="url(#sE-gHK)"/>
        <path class="bg" fill="none" stroke="rgba(255,206,150,.16)" stroke-width="16"/>
        <path class="b" fill="rgba(255,190,120,.07)" stroke="rgba(255,226,184,.8)" stroke-width="2.6"/>
        <circle class="np" fill="url(#sE-gN)"/><circle class="nk" fill="url(#sE-gK)"/>
        <circle class="rk" fill="none" stroke="#ffc54d" stroke-width="3.4"/>
      </svg>`).firstChild;
      const q = (s) => svg.querySelector(s);
      const sv = { hp: q(".hp"), hk: q(".hk"), bg: q(".bg"), b: q(".b"), np: q(".np"), nk: q(".nk"), rk: q(".rk") };
      const lab = (cls, txt) => ctx.el("div", "sE-lab " + cls, pUS, txt);
      const labP = lab("nm", "zsh"), pidP = lab("pid", "PID 4012"), labK = lab("nm", "zsh"), pidK = lab("pid", "PID 4012");
      const glP = GLYPHS.map((g) => lab("gl", g[0])), glK = GLYPHS.map((g) => lab("gl", g[0]));
      const hitEl = ctx.el("div", "sE-hit", pUS);

      // threads, beams, beads (true 3D segments)
      const thPty = free("sE-th warm"), thAsk = free("sE-th warm"), thReply = free("sE-th cyan");
      const thExU = free("sE-th gold"), thExK = free("sE-th cyan");
      const beams = CORES.map(() => free("sE-th beam"));
      const beadA = free("sE-bead"), beadR = free("sE-bead cy"), beadE = free("sE-bead");

      // carried words: "hello" rising off the slab, "./hello" in the shell and in the clone
      const carry = free("sE-carry", "hello");
      const helloP = free("sE-carry", './hello<span class="sE-cur">▌</span>'), helloK = free("sE-carry", "./hello");
      const curEl = helloP.firstElementChild;
      const magicUp = free("sE-mg", "7F 45 4C 46");

      // the program headers
      const phEl = free("sE-ph");
      const phRows = PH.map((segs, i) => {
        const r = ctx.el("div", "r", phEl);
        const spans = segs.map(([txt, c]) => { const s = ctx.el("span", c, r); s.textContent = txt; return s; });
        return { el: r, spans, i };
      });

      // the address space (baton 5)
      const pMem = plane(D_EXIT);
      const memc = OT.C.memcol(pMem, { promised: ["text", "rodata", "data"] });
      const ML = KID.x - 320, MT = KID.y - memc.h / 2;
      memc.el.style.left = ML + "px"; memc.el.style.top = MT + "px";
      const B = memc.bands;
      Object.values(B).forEach((b) => { b.nm = b.el.querySelector(".nm"); b.pm = b.el.querySelector(".pm"); b.gold = b.el.querySelector(".gold"); });
      const bglow = {};
      Object.entries(B).forEach(([n, b]) => {
        const g = ctx.el("div", "sE-bglow" + (n === "text" || n === "libc" ? " cy" : ""), pMem);
        g.style.left = ML + "px"; g.style.top = MT + b.y + "px"; g.style.height = b.h + "px";
        bglow[n] = g;
      });
      const frame = ctx.el("div", "sE-frame", pMem);
      frame.style.left = ML - 12 + "px"; frame.style.top = MT - 12 + "px"; frame.style.width = 664 + "px"; frame.style.height = memc.h + 14 + "px";
      const ARG_PRE = "argc=1  argv[0]=", ARG_VAL = '"./hello"';
      const argsEl = ctx.el("div", "sE-args", pMem);
      const argPre = ctx.el("span", "", argsEl), argVal = ctx.el("span", "", argsEl);
      argVal.textContent = ARG_VAL;
      const ARG_X = ML + 150, ARG_Y = MT + B.stack.y + B.stack.h / 2 - 11;
      argsEl.style.left = ARG_X + "px"; argsEl.style.top = ARG_Y + "px";
      const ARG_VAL_C = { x: ARG_X + (ARG_PRE.length + ARG_VAL.length / 2) * 12.6, y: ARG_Y + 11 };
      const ldEl = ctx.el("div", "sE-ld", pMem, "ld.so");
      const textY = MT + B.text.y + 34, libcY = MT + B.libc.y + B.libc.h / 2;
      const wireD = `M ${ML + 640} ${textY} C ${ML + 840} ${textY}, ${ML + 840} ${libcY}, ${ML + 640} ${libcY}`;
      const wire = ctx.el("div", "", pMem, `<svg class="sE-svg" width="10" height="10" style="left:0;top:0">
        <path class="wd" d="${wireD}" fill="none" stroke="rgba(160,230,255,.75)" stroke-width="3" stroke-dasharray="12 10"/>
        <path class="ws" d="${wireD}" fill="none" stroke="#e8fbff" stroke-width="4.5" style="filter:drop-shadow(0 0 8px rgba(130,225,255,.9))"/>
      </svg>`).firstChild;
      const wd = wire.querySelector(".wd"), ws = wire.querySelector(".ws");
      const WLEN = ws.getTotalLength ? ws.getTotalLength() : 600;
      const wlPlt = ctx.el("div", "sE-wl", pMem, "puts@plt"), wlPuts = ctx.el("div", "sE-wl", pMem, "puts");
      wlPlt.style.left = ML + 652 + "px"; wlPlt.style.top = textY + 12 + "px";
      wlPuts.style.left = ML + 652 + "px"; wlPuts.style.top = libcY - 34 + "px";

      // ------------------------------------------------------------------ scheduler (pure function of t)
      const SCH0 = T.core - 0.2, SCH1 = T.exec + 0.6, SDT = 1 / 240;
      const rate = (t) => (t < T.slices - 0.15 ? 0.7 : t < T.turn ? lerp(3.2, 9, sstep(T.slices, T.constantly + 0.3, t)) : lerp(9, 2.4, sstep(T.turn, T.turn + 0.6, t)));
      const PHT = [0];
      for (let k = 1; SCH0 + k * SDT <= SCH1 + SDT; k++) PHT.push(PHT[k - 1] + rate(SCH0 + (k - 0.5) * SDT) * SDT);
      const phaseAt = (t) => { const x = (clamp(t, SCH0, SCH1) - SCH0) / SDT, k = Math.min(Math.floor(x), PHT.length - 2); return lerp(PHT[k], PHT[k + 1], x - k); };
      const timeOfPhase = (p) => { let lo = 0, hi = PHT.length - 1; if (p <= PHT[0]) return SCH0; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (PHT[m] < p) lo = m; else hi = m; } return SCH0 + (lo + (p - PHT[lo]) / Math.max(1e-9, PHT[hi] - PHT[lo])) * SDT; };
      // beam targets: cells that are on screen from the pulled-back camera
      const onPull = (c) => { const s = 1000 / (1000 - (PULL.z - c.d)); const x = 960 + (c.x - PULL.x) * s, y = 640 + (c.y - PULL.y) * s; return x > 140 && x < 1780 && y > 90 && y < 840; };
      const TGT = [];
      crowd.forEach((c) => { if (onPull(c)) TGT.push(c); });
      named.forEach((c) => TGT.push(c));
      kws.forEach((c) => TGT.push(c));
      const PARt = { x: PAR.x, y: PAR.y, d: D_US, par: true };
      TGT.push(PARt);
      const KIDt = { x: KID.x, y: KID.y, d: D_US, kid: true };
      const coreState = (c, t) => {
        const off = c * 0.29, ph = phaseAt(t) + off, slot = Math.floor(ph);
        const tSw = timeOfPhase(slot - off);
        const pick = (s) => TGT[Math.floor(hash(c * 17 + 3, s) * TGT.length)];
        if (c === 1 && t >= T.turn) return { cur: KIDt, prev: pick(slot), tSw: T.turn };
        return { cur: pick(slot), prev: pick(slot - 1), tSw };
      };

      // ------------------------------------------------------------------ helpers
      const fx = (v) => v.toFixed(1);
      const fogA = (eff, f0 = -2600, f1 = -1400, n0 = 430, n1 = 820) => sstep(f0, f1, eff) * (1 - sstep(n0, n1, eff));
      const darkOf = (l) => 1 - sstep(0.35, 0.8, l);
      const mixc = (a, b, u) => OT.rgb(OT.mix(a, b, u));
      const put3 = (el, x, y, d, extra = "") => { el.style.transform = `translate3d(${fx(x)}px,${fx(y)}px,${fx(-d)}px)${extra ? " " + extra : ""}`; };
      const put2 = (el, x, y, extra = "translate(-50%,-50%)") => { el.style.transform = `translate(${fx(x)}px,${fx(y)}px) ${extra}`; };
      const ring = (el, x, y, R, a) => {
        if (a < 0.003 || R < 1) { ctx.show(el, 0); return; }
        el.style.width = el.style.height = fx(2 * R) + "px";
        el.style.transform = `translate(${fx(x - R)}px,${fx(y - R)}px)`;
        ctx.show(el, a);
      };
      // a thread of light between two 3D points, turned to face the lens; f0..f1 = drawn part
      const seg = (el, A, Bp, cam, f1 = 1, f0 = 0, alpha = 1) => {
        if (alpha < 0.003 || f1 - f0 < 1e-4) { ctx.show(el, 0); return; }
        let ax = lerp(A.x, Bp.x, f0), ay = lerp(A.y, Bp.y, f0), ad = lerp(A.d, Bp.d, f0);
        let bx = lerp(A.x, Bp.x, f1), by = lerp(A.y, Bp.y, f1), bd = lerp(A.d, Bp.d, f1);
        const dn = cam.z - 860;
        if (ad < dn && bd < dn) { ctx.show(el, 0); return; }
        if (ad < dn) { const u = (dn - ad) / (bd - ad); ax = lerp(ax, bx, u); ay = lerp(ay, by, u); ad = dn; }
        else if (bd < dn) { const u = (dn - bd) / (ad - bd); bx = lerp(bx, ax, u); by = lerp(by, ay, u); bd = dn; }
        const dx = bx - ax, dy = by - ay, dz = ad - bd, L = Math.hypot(dx, dy, dz);
        if (L < 1) { ctx.show(el, 0); return; }
        const ux = dx / L, uy = dy / L, uz = dz / L;
        const phi = Math.atan2(dy, dx), th = Math.asin(clamp(-uz, -1, 1));
        const vx = cam.x - (ax + bx) / 2, vy = cam.y - (ay + by) / 2, vz = 1000 - cam.z + (ad + bd) / 2;
        const wx = uy * vz - uz * vy, wy = uz * vx - ux * vz, wz = ux * vy - uy * vx;
        const sp = Math.sin(phi), cp = Math.cos(phi), s2 = Math.sin(th), c2 = Math.cos(th);
        const psi = Math.atan2(s2 * cp * wx + s2 * sp * wy + c2 * wz, -sp * wx + cp * wy);
        el.style.width = fx(L) + "px";
        el.style.transform = `translate3d(${fx(ax)}px,${fx(ay)}px,${fx(-ad)}px) rotateZ(${phi.toFixed(4)}rad) rotateY(${th.toFixed(4)}rad) rotateX(${psi.toFixed(4)}rad)`;
        ctx.show(el, alpha);
      };
      const at3 = (A, Bp, u) => ({ x: lerp(A.x, Bp.x, u), y: lerp(A.y, Bp.y, u), d: lerp(A.d, Bp.d, u) });
      const bead = (el, P, a) => { if (a < 0.003) { ctx.show(el, 0); return; } put3(el, P.x, P.y, P.d); ctx.show(el, a); };
      const circ = (x, y, r) => `M ${fx(x + r)} ${fx(y)} A ${fx(r)} ${fx(r)} 0 1 1 ${fx(x - r)} ${fx(y)} A ${fx(r)} ${fx(r)} 0 1 1 ${fx(x + r)} ${fx(y)} Z`;
      // one cell pinching into two: outline of two circles joined by a neck that thins to nothing
      const peanut = (ax, bx, cy, r, sep) => {
        const mid = (ax + bx) / 2, k = sep / SEPB;
        const h = r * Math.pow(Math.max(0, 1 - k), 0.85), g = lerp(Math.PI / 2, 0.8, k), sg = Math.sin(g), cg = Math.cos(g);
        const RU = [bx - r * cg, cy - r * sg], RL = [bx - r * cg, cy + r * sg], LU = [ax + r * cg, cy - r * sg], LL = [ax + r * cg, cy + r * sg];
        const c = Math.max(3, Math.hypot(RU[0] - mid, RU[1] - (cy - h)) * 0.45);
        const p = (a) => `${fx(a[0])} ${fx(a[1])}`;
        return `M ${p([mid, cy - h])} C ${p([mid + c, cy - h])}, ${p([RU[0] - sg * c, RU[1] + cg * c])}, ${p(RU)} A ${fx(r)} ${fx(r)} 0 1 1 ${p(RL)} ` +
          `C ${p([RL[0] - sg * c, RL[1] - cg * c])}, ${p([mid + c, cy + h])}, ${p([mid, cy + h])} C ${p([mid - c, cy + h])}, ${p([LL[0] + sg * c, LL[1] - cg * c])}, ${p(LL)} ` +
          `A ${fx(r)} ${fx(r)} 0 1 1 ${p(LU)} C ${p([LU[0] + sg * c, LU[1] + cg * c])}, ${p([mid - c, cy - h])}, ${p([mid, cy - h])} Z`;
      };
      const sepAt = (t) => {
        const pre = SEPB * 0.3 * tw(T.fork, T.clones, t, "sineInOut");
        if (t < tBreak) return lerp(pre, SEPB * 0.999, tw(T.clones - 0.05, tBreak, t, "cubicIn"));
        return lerp(SEPB, SEPF, clamp(spring(t, tBreak, 8, 0.55), 0, 1.25));
      };
      const bump = (t) => {
        let b = 0, hit = 0;
        [T.cant + 0.02, T.own - 0.32].forEach((th) => {
          const u = t - th;
          if (u > 0 && u < 1.4) b = Math.max(b, Math.sin(Math.min(1, u / 0.16) * Math.PI / 2) * Math.exp(-Math.max(0, u - 0.16) * 5));
          hit = Math.max(hit, Math.exp(-Math.pow((u - 0.17) / 0.12, 2)));
        });
        return [b, hit];
      };
      const cellPos = (c, t) => (c.ph == null ? c : { x: c.x + 16 * Math.sin(t * 0.45 + c.ph), y: c.y + 12 * Math.cos(t * 0.37 + c.ph * 1.3), d: c.d });
      const bez = (s) => { const P = [[ML + 640, textY], [ML + 840, textY], [ML + 840, libcY], [ML + 640, libcY]], m = 1 - s; return [0, 1].map((j) => m * m * m * P[0][j] + 3 * m * m * s * P[1][j] + 3 * m * s * s * P[2][j] + s * s * s * P[3][j]); };
      {
        // the dashed thread from the stub that "stops short" (first 72% of the wire)
        const s = 0.72, P = [[ML + 640, textY], [ML + 840, textY], [ML + 840, libcY], [ML + 640, libcY]];
        const L1 = (a, b2) => [lerp(a[0], b2[0], s), lerp(a[1], b2[1], s)];
        const q1 = L1(P[0], P[1]), m12 = L1(P[1], P[2]), q2 = L1(q1, m12), q3 = bez(s);
        wd.setAttribute("d", `M ${P[0][0]} ${P[0][1]} C ${fx(q1[0])} ${fx(q1[1])}, ${fx(q2[0])} ${fx(q2[1])}, ${fx(q3[0])} ${fx(q3[1])}`);
        ws.setAttribute("stroke-dasharray", `${fx(WLEN)} ${fx(WLEN)}`);
      }
      const rowWorld = (i, LX, LY) => ({ x: LX, y: LY + i * PH_LH + PH_LH / 2 });
      const FLY = [
        { row: 3, band: "text", t: T.code },
        { row: 4, band: "rodata", t: T.string - 0.05 },
        { row: 5, band: "data", t: T.beside + 0.45 },
        { row: 7, band: "stack", t: T.stack },
      ];
      const BAND_T = { text: T.code, rodata: T.string - 0.05, data: T.beside + 0.45, heap: T.beside + 0.8, stack: T.stack, libc: T.mapping + 0.15 };
      const pulse = (t, a, rise = 0.12, decay = 2) => (t < a - rise ? 0 : t < a ? sstep(a - rise, a, t) : Math.exp(-(t - a) * decay));
      const glowSpan = (el, g, col, shadow) => {
        if (g < 0.01) { el.style.color = ""; el.style.textShadow = ""; return; }
        el.style.color = col; el.style.textShadow = `0 0 ${fx(6 + 22 * g)}px ${shadow.replace("A", (0.25 + 0.7 * g).toFixed(2))}`;
      };

      // ------------------------------------------------------------------ render
      ctx.render((t) => {
        if (t < t0 || t >= t1) { TOPS.forEach((e) => ctx.show(e, 0)); return; }
        const cam = ctx.camAt(t);
        const light = OT.lightNow ?? 0, dark = darkOf(light);

        // ---- ghosts of the compile strata streak past during the whip
        const gW = sstep(whip0 - 0.05, whip0 + 0.25, t) * (1 - sstep(land - 0.25, land + 0.02, t));
        ghosts.forEach((g) => ctx.show(g.el, 0.62 * gW * fogA(cam.z - g.d, -2300, -1000, 300, 700)));

        // ---- the slab on the disk
        {
          let a = 0;
          if (t < land + 0.4) a = fogA(cam.z);
          else if (t > T.exec - 0.2) a = fogA(cam.z, -4300, -3300) * sstep(T.exec, T.file13 - 0.1, t) * (1 - sstep(up0 + 0.1, up0 + 0.6, t));
          ctx.show(pSlab, a);
          slabName.style.opacity = t < T.exec ? (1 - 0.7 * sstep(t0 + 0.12, t0 + 0.45, t)).toFixed(3) : "1";
          slabBytes.style.opacity = (1 - 0.75 * sstep(T.reads - 0.1, T.reads + 0.4, t)).toFixed(3);
          slabHdr.style.opacity = (1 - 0.7 * sstep(T.reads - 0.1, T.reads + 0.4, t)).toFixed(3);
          glint.style.boxShadow = t < plunge0 ? "0 0 0 8px rgba(225,247,255,.95),0 0 200px 30px rgba(150,220,255,.9)" : "";
          const mg = pulse(t, T.magic + 0.02, 0.1, 1.6);
          slabMagic.style.transform = mg > 0.003 ? `scale(${(1 + 0.6 * mg).toFixed(3)})` : "none";
          slabMagic.style.textShadow = mg > 0.003 ? `0 0 ${fx(10 + 34 * mg)}px rgba(255,210,110,${(0.6 + 0.4 * mg).toFixed(2)}), 0 0 ${fx(4 + 8 * mg)}px rgba(255,240,200,${(0.9 * mg).toFixed(2)})` : "";
          ctx.show(magicRow, 0.95 * pulse(t, T.magic + 0.12, 0.12, 1.3));
          ctx.show(glint, Math.max(0.95 * pulse(t, T.file13, 0.3, 1.4), 0.5 * mg, 0.35 * pulse(t, T.reads + 0.1, 0.2, 1.5)));
        }

        // ---- "hello" lifts off the slab and rides up with us into the terminal
        {
          const a = sstep(t0 + 0.06, t0 + 0.3, t) * (1 - sstep(land + 0.02, land + 0.14, t));
          if (a < 0.003) ctx.show(carry, 0);
          else {
            const u = tw(whip0 + 0.05, land - 0.04, t, "cubicInOut");
            const lift = sstep(t0 + 0.1, whip0 + 0.1, t) * (1 - sstep(land - 0.45, land - 0.03, t));
            carry.style.fontSize = fx(lerp(30, 32, u)) + "px";
            carry.style.fontWeight = u < 0.85 ? "700" : "400";
            carry.style.color = mixc([59, 58, 53], [238, 246, 255], dark);
            carry.style.textShadow = dark > 0.03 ? `0 0 ${fx(20 * dark)}px rgba(150,220,255,${(0.75 * dark).toFixed(2)})` : "none";
            put3(carry, lerp(651, HELLO_X, u), lerp(437, RUN_Y, u), cam.z - 90 * lift, "translate(-50%,-50%)");
            ctx.show(carry, a);
          }
        }

        // ---- the page
        {
          const a = t < sink1 + 0.3 ? fogA(cam.z - D_PAGE) : 0;
          ctx.show(pPage, a);
          const foc = sstep(T.dot - 0.12, T.dot + 0.2, t);
          const dim = lerp(1, 0.22, foc).toFixed(3);
          page.code.el.style.opacity = dim; page.lnums.forEach((n) => (n.style.opacity = dim));
          tabEl.style.opacity = dim; page.rule.style.opacity = dim; page.pill.style.opacity = dim;
          tl0.children[0].style.opacity = tl0.children[1].style.opacity = lerp(1, 0.4, foc).toFixed(3);
          runSpan.style.opacity = sstep(land - 0.03, land + 0.1, t).toFixed(3);
          runSpan.style.fontWeight = foc > 0.5 ? "700" : "400";
          runSpan.style.color = "#1e1d1a";
          ul.style.transform = `scaleX(${tw(T.dot, T.hello + 0.2, t, "expoOut").toFixed(3)})`;
          ul.style.opacity = (1 - sstep(T.goes + 0.2, T.goes + 0.6, t)).toFixed(3);
          const blink = Math.floor((t - land) / 0.53) % 2 === 0 ? 1 : 0.1;
          page.caretAt(0, CMD_COL + 7, t > land + 0.1 && t < T.goes ? blink : 0);
        }

        // ---- user space: zsh and its clone
        const rb = R0 * (1 + 0.022 * Math.sin((t - T.shell) * 2.4));
        const sep = sepAt(t);
        const A = { x: ZSH.x - sep, y: ZSH.y }, Bc = { x: ZSH.x + sep, y: ZSH.y };
        const swell = clamp(spring(t, T.where2 - 0.3, 7, 0.6), 0, 1.25);
        const rA = rb, rB = rb + 85 * swell;
        const copyA = sstep(0.25 * SEPB, 0.9 * SEPB, sep);
        const wipe = tw(T.wipes - 0.05, T.memory + 0.15, t, "cubicOut");
        const usA = sstep(T.goes + 0.15, T.shell, t) * (1 - sstep(dive0 + 0.15, dive1 - 0.25, t)) * fogA(cam.z - D_US, -3000, -1700);
        ctx.show(pUS, usA);
        const lit = {}; // lit levels from the scheduler, by target
        TGT.forEach((c) => (c._lit = 0)); KIDt._lit = 0;
        crowd.forEach((c) => (c._lit = 0));

        // ---- the scheduler's sweep and the cores' beams (computed first: they light the cells)
        const sweepR = 2900 * tw(T.sched - 0.1, T.decides + 1.0, t, "cubicOut");
        const sweepA = sstep(T.sched - 0.12, T.sched + 0.1, t) * (1 - sstep(T.decides + 0.3, T.decides + 1.0, t));
        const kmFog = fogA(cam.z - D_KM, -3700, -2500);
        CORES.forEach((c, i) => {
          const Ac = { x: c.x, y: c.y, d: D_CORE };
          const s0 = T.cpu + 0.12 * i;
          const bA = sstep(s0 - 0.05, s0 + 0.1, t) * (i === 1 ? 1 - sstep(T.exec - 0.3, T.exec + 0.4, t) : 1 - sstep(T.request, T.request + 0.5, t));
          if (bA < 0.003 || t < SCH0) { ctx.show(beams[i], 0); ctx.show(pierces[i], 0); return; }
          const s = coreState(i, t);
          const P = cellPos(s.cur, t);
          const gs = s.tSw > s0 + 0.45 ? sstep(s.tSw, s.tSw + 0.07, t) : 1;
          const g = tw(s0, s0 + 0.4, t, "expoOut") * gs;
          seg(beams[i], Ac, P, cam, g, 0, bA * kmFog);
          s.cur._lit = Math.max(s.cur._lit || 0, g * bA);
          if (s.tSw > s0 + 0.45 && s.prev !== s.cur) s.prev._lit = Math.max(s.prev._lit || 0, Math.exp(-(t - s.tSw) * 7) * bA);
          const u = (D_KM - D_CORE) / (P.d - D_CORE);
          if (P.d < D_KM && g > u) { const Q = at3(Ac, P, u); put2(pierces[i], Q.x, Q.y, ""); ctx.show(pierces[i], bA * (0.75 + 0.25 * Math.sin(t * 23 + i))); }
          else ctx.show(pierces[i], 0);
        });

        // ---- the crowd
        const crowdA = lerp(0.32, 1, sstep(T.one - 0.6, T.hundreds, t)) * sstep(T.goes + 0.3, T.shell + 0.3, t) * (1 - sstep(dive0 + 0.15, dive1 - 0.3, t));
        const drawCell = (c, groupA) => {
          const a = groupA * fogA(cam.z - c.d, -3100, -1800) * (c.base ?? 1);
          if (a < 0.003) { ctx.show(c.el, 0); return; }
          const P = cellPos(c, t);
          let l = c._lit || 0;
          if (sweepA > 0.003) l = Math.max(l, 0.55 * sweepA * Math.exp(-Math.pow((Math.hypot(c.x - MC.x, c.y - MC.y) - sweepR) / 240, 2)));
          put3(c.el, P.x, P.y, P.d, `scale(${(1 + 0.12 * l).toFixed(3)})`);
          c.el.style.setProperty("--lit", l.toFixed(3));
          ctx.show(c.el, a);
        };
        crowd.forEach((c) => drawCell(c, crowdA));
        const namedA = sstep(T.one - 0.5, T.hundreds + 0.2, t) * (1 - sstep(dive0 + 0.15, dive1 - 0.3, t));
        named.forEach((c) => drawCell(c, namedA));

        // ---- the kernel membrane, its doors, and the cores beneath it
        {
          const mA = OT.track([[sink1 - 0.3, 0], [sink1 + 0.4, 0.16], [T.only - 0.1, 0.16], [T.kernel + 0.25, 0.9], [T.asks, 0.45], [T.that, 0.4],
            [T.sched - 0.1, 0.4], [T.sched + 0.35, 0.85], [T.cpu, 0.48], [dive0, 0.48], [dive1 - 0.3, 0]], t);
          ctx.show(pKM, mA * fogA(cam.z - D_KM, -3700, -2500, 230, 560));
          memGlow.style.transform = `translate(${ZSH.x + 200}px,${ZSH.y + 160}px)`;
          memGlow.style.opacity = OT.track([[T.only - 0.2, 0.15], [T.kernel + 0.2, 1], [T.asks + 0.6, 0.4], [T.sched, 0.4], [T.sched + 0.4, 0.8], [T.cpu + 0.5, 0.45]], t).toFixed(3);
          const cl = Math.max(sstep(T.asks + 0.15, T.asks + 0.35, t) * (1 - sstep(tBreak, tBreak + 1.2, t)), 0);
          cloneLab.style.transform = `translate(${clonePt.x + 34}px,${clonePt.y}px) translate(0,-50%) scale(${(1 + 0.25 * pulse(t, T.asks + 0.3, 0.1, 3)).toFixed(3)})`;
          cloneLab.style.transformOrigin = "0 50%";
          cloneLab.style.opacity = (1 - sstep(tBreak + 1.2, tBreak + 2.4, t)).toFixed(3);
          cloneLab.style.color = mixc([150, 205, 225], [245, 253, 255], cl);
          cloneLab.style.textShadow = cl > 0.01 ? `0 0 ${fx(28 * cl)}px rgba(150,230,255,${(0.9 * cl).toFixed(2)})` : "none";
          const el2 = sstep(T.request + 0.2, T.request + 0.45, t) * (1 - 0.6 * sstep(T.file13, T.file13 + 1, t));
          execLab.style.transform = `translate(${execPt.x - 30}px,${execPt.y + 22}px) translate(-100%,0) scale(${(1 + 0.25 * pulse(t, T.request + 0.4, 0.1, 3)).toFixed(3)})`;
          execLab.style.transformOrigin = "100% 0";
          execLab.style.opacity = (sstep(T.makes - 0.2, T.request + 0.3, t) * (1 - sstep(up1 - 0.5, up1, t))).toFixed(3);
          execLab.style.color = mixc([150, 205, 225], [245, 253, 255], el2);
          execLab.style.textShadow = el2 > 0.01 ? `0 0 ${fx(28 * el2)}px rgba(150,230,255,${(0.9 * el2).toFixed(2)})` : "none";
          const rc = (ta) => [260 * tw(ta, ta + 0.9, t, "expoOut"), sstep(ta - 0.02, ta + 0.05, t) * (1 - sstep(ta + 0.2, ta + 0.9, t))];
          let [R1, a1] = rc(T.asks + 0.32); const [R2, a2] = rc(T.first);
          if (a2 > a1) { R1 = R2; a1 = a2; }
          ring(cloneRing, clonePt.x, clonePt.y, R1, a1);
          const [R3, a3] = rc(T.request + 0.38);
          ring(execRing, execPt.x, execPt.y, R3, a3);
          ring(sweepRing, MC.x, MC.y, sweepR, sweepA);
          const cA = sstep(T.cpu - 0.35, T.core, t) * (1 - sstep(T.request + 0.2, T.exec + 0.3, t)) * fogA(cam.z - D_CORE, -3700, -2500);
          ctx.show(pCore, cA);
          coreEls.forEach((c, i) => { const p = 1 + 0.06 * pulse(t, T.cpu + 0.12 * i, 0.05, 4); c.e.style.transform = `scale(${p.toFixed(3)})`; });
          kws.forEach((k) => { const l = k._lit || 0; put2(k.el, k.x + 16 * Math.sin(t * 0.45 + k.ph), k.y, `translate(-50%,-50%) scale(${(1 + 0.12 * l).toFixed(3)})`); k.el.style.setProperty("--lit", l.toFixed(3)); });
        }

        // ---- zsh / the clone: one outline that pinches in two
        {
          sv.b.setAttribute("d", sep < SEPB ? peanut(A.x, Bc.x, A.y, rA, sep) : circ(A.x, A.y, rA) + " " + circ(Bc.x, Bc.y, rB));
          sv.bg.setAttribute("d", sv.b.getAttribute("d"));
          const setC = (el, x, y, r, o) => { el.setAttribute("cx", fx(x)); el.setAttribute("cy", fx(y)); el.setAttribute("r", fx(Math.max(0.1, r))); el.setAttribute("opacity", clamp(o, 0, 1).toFixed(3)); };
          const parLit = PARt._lit || 0, kidLit = KIDt._lit || 0;
          const kidFill = (1 - 0.8 * wipe) + 0.8 * sstep(T.where2 - 0.3, T.where2 + 0.5, t) + 1.3 * pulse(t, T.wipes + 0.05, 0.08, 4);
          const reply = sstep(T.first, T.fork, t) * (1 - sstep(tBreak, tBreak + 0.8, t));
          setC(sv.hp, A.x, A.y, rA * 1.55, 0.8 + 0.5 * reply + parLit);
          setC(sv.np, A.x, A.y, rA * 0.95, 0.75 + 0.25 * Math.sin((t - T.shell) * 2.4) * sstep(T.waiting - 0.2, T.waiting + 0.3, t) + 0.6 * reply + 0.8 * parLit);
          const rkA = sstep(tBreak + 0.1, T.id + 0.3, t) * copyA;
          setC(sv.hk, Bc.x, Bc.y, rB * 1.55, copyA * (0.4 + 0.6 * rkA + kidLit));
          setC(sv.nk, Bc.x, Bc.y, rB * 0.95, copyA * kidFill * (0.75 + 0.9 * kidLit + 0.5 * pulse(t, T.makes, 0.1, 2) + 0.6 * pulse(t, T.that + 0.3, 0.2, 1.5)));
          setC(sv.rk, Bc.x, Bc.y, rB, rkA);
          // labels and the shell's insides
          put2(labP, A.x, A.y - 0.6 * rA); put2(pidP, A.x, A.y - 0.6 * rA + 38);
          const kLab = t < T.begin + 0.15 ? "zsh" : OT.scramble("zsh", "hello", tw(T.begin + 0.15, T.begin + 0.5, t, "lin"), t);
          if (labK.textContent !== kLab) labK.textContent = kLab;
          const kPid = t < T.id - 0.05 ? "PID 4012" : "PID " + OT.scramble("4012", "4013", tw(T.id - 0.05, T.id + 0.22, t, "lin"), t, 5);
          if (pidK.textContent !== kPid) pidK.textContent = kPid;
          put2(labK, Bc.x, Bc.y - 0.6 * rB); put2(pidK, Bc.x, Bc.y - 0.6 * rB + 38, `translate(-50%,-50%) scale(${(1 + 0.45 * pulse(t, T.id + 0.12, 0.08, 3)).toFixed(3)})`);
          ctx.show(labP, 1); ctx.show(pidP, 1); ctx.show(labK, copyA); ctx.show(pidK, copyA);
          pidK.style.color = pulse(t, T.id + 0.12, 0.08, 1.2) > 0.05 ? "#fff6dc" : "";
          GLYPHS.forEach(([g, gx, gy], i) => {
            put2(glP[i], A.x + gx * rA / R0, A.y + gy * rA / R0);
            ctx.show(glP[i], 1);
            const sp = 1 + 1.7 * wipe;
            put2(glK[i], Bc.x + gx * sp * rB / R0, Bc.y + gy * sp * rB / R0);
            const txt = wipe > 0 ? OT.scramble(g, "", wipe, t, i + 2) : g;
            if (glK[i].textContent !== txt) glK[i].textContent = txt;
            ctx.show(glK[i], copyA * (1 - wipe));
          });
          const [bp, hit] = bump(t);
          put2(hitEl, A.x + rA * 0.98, A.y + 22, "");
          ctx.show(hitEl, hit * (t < T.only ? 1 : 0));
          // "./hello": falls from the terminal into the shell, is copied into the clone, ends up on the new stack
          const du = tw(T.goes - 0.05, sink1 - 0.1, t, "cubicInOut");
          const pa = sstep(T.goes - 0.08, T.goes + 0.05, t);
          if (pa < 0.003) ctx.show(helloP, 0);
          else {
            const inCell = { x: A.x + 118 * bp, y: A.y + 22 };
            const x = lerp(RUN_CX, inCell.x, du), y = lerp(RUN_Y, inCell.y, du), d = lerp(D_PAGE, D_US, du);
            helloP.style.fontSize = fx(lerp(32, 28, du)) + "px";
            helloP.style.fontWeight = "700";
            helloP.style.color = mixc([30, 29, 26], [255, 243, 222], dark);
            helloP.style.textShadow = dark > 0.03 ? `0 0 ${fx(16 * dark)}px rgba(255,214,160,${(0.6 * dark).toFixed(2)})` : "none";
            put3(helloP, x, y, d, "translate(-50%,-50%)");
            curEl.style.opacity = t > T.waiting - 0.3 && t < T.but && Math.floor((t - T.waiting) / 0.5) % 2 === 0 ? "1" : "0";
            ctx.show(helloP, pa * (du < 1 ? 1 : usA) * (1 - 0.35 * sstep(tBreak, tBreak + 1, t)));
          }
          const ka = copyA * (t < dive0 ? usA : 1) * (1 - sstep(T.holding - 0.05, T.holding + 0.25, t));
          if (ka < 0.003) ctx.show(helloK, 0);
          else {
            const m = tw(dive0, dive1 + 0.3, t, "cubicInOut");
            const keep = 1 + 0.5 * pulse(t, T.wipes + 0.1, 0.15, 1.5);
            helloK.style.fontSize = fx(lerp(28, 21, m)) + "px";
            helloK.style.fontWeight = m > 0.5 ? "400" : "700";
            helloK.style.color = "#fff3de";
            helloK.style.textShadow = `0 0 ${fx(16 * keep)}px rgba(255,214,160,${(0.55 * keep).toFixed(2)})`;
            const oy = lerp(22, 0.62 * rB, sstep(T.wipes, T.memory + 0.3, t));
            const wy = lerp(MT + 150, ARG_VAL_C.y, tw(T.stack - 0.25, T.stack + 0.3, t, "cubicInOut"));
            put3(helloK, lerp(Bc.x, ARG_VAL_C.x, m) - 480 * Math.sin(Math.PI * m), lerp(Bc.y + oy, wy, m), lerp(D_US, D_EXIT, m), `translate(-50%,-50%) scale(${keep.toFixed(3)})`);
            ctx.show(helloK, ka * lerp(1, 0.7, m * (1 - sstep(T.stack, T.top, t))));
          }
        }

        // ---- threads: the pty, the shell's request (clone), the kernel's answer, exec
        {
          seg(thPty, { x: RUN_CX, y: RUN_Y + 10, d: D_PAGE }, { x: ZSH.x + 30, y: ZSH.y - R0, d: D_US }, cam, tw(T.goes - 0.05, sink1 - 0.1, t, "cubicInOut"), 0,
            sstep(T.goes - 0.1, T.goes + 0.1, t) * (1 - sstep(T.only, T.kernel, t)) * 0.9);
          const Pz = { x: A.x, y: A.y, d: D_US };
          const fa = tw(T.so, T.asks + 0.3, t, "cubicIn");
          const askA = sstep(T.so - 0.05, T.so + 0.05, t) * (1 - sstep(T.fork, tBreak - 0.1, t));
          seg(thAsk, Pz, clonePt, cam, fa, 0, askA);
          bead(beadA, at3(Pz, clonePt, fa), askA * (fa < 1 ? 1 : 1 - sstep(T.asks + 0.3, T.asks + 0.5, t)));
          const fr = tw(T.first, T.fork + 0.15, t, "cubicOut");
          const repA = sstep(T.first - 0.05, T.first + 0.05, t) * (1 - sstep(tBreak - 0.1, tBreak + 0.5, t));
          seg(thReply, clonePt, Pz, cam, fr, 0, repA);
          bead(beadR, at3(clonePt, Pz, fr), repA * (fr < 1 ? 1 : 0));
          const Pk = { x: Bc.x, y: Bc.y, d: D_US };
          const exA = sstep(T.makes - 0.05, T.makes + 0.05, t) * (1 - sstep(up1 - 0.5, up1 + 0.1, t));
          const fu = tw(T.makes, T.request + 0.38, t, "cubicIn"), fk = tw(T.exec, T.file13 - 0.05, t, "quadIn");
          seg(thExU, Pk, execPt, cam, fu, 0, exA);
          const onSlab = sstep(plunge1 - 0.3, plunge1 + 0.05, t) * (1 - sstep(up0 - 0.1, up0 + 0.3, t));
          seg(thExK, execPt, SLAB_HIT, cam, fk, 0, exA * (fk > 0 ? 1 : 0) * (1 - 0.8 * onSlab));
          const be = fu < 1 && t > T.makes ? at3(Pk, execPt, fu) : fk > 0 && fk < 1 ? at3(execPt, SLAB_HIT, fk) : null;
          bead(beadE, be || Pk, be ? exA : 0);
        }

        // ---- the dark kernel on the way to the disk
        {
          const moving = 1 - sstep(plunge1 - 0.2, plunge1 + 0.1, t) * (1 - sstep(up0, up0 + 0.25, t));
          const kA = sstep(plunge0, plunge0 + 0.3, t) * (1 - sstep(up1 - 0.3, up1, t)) * moving;
          kns.forEach((k) => {
            const a = kA * fogA(cam.z - k.d, -1900, -900, 380, 760);
            if (a < 0.003) { ctx.show(k.el, 0); return; }
            put3(k.el, k.x, k.y, k.d, "translate(-50%,-50%)"); ctx.show(k.el, a);
          });
          // the magic number lifts off the slab, up the thread
          const mu = tw(T.number, T.number + 0.8, t, "cubicIn");
          const ma = sstep(T.number - 0.05, T.number + 0.05, t) * (1 - sstep(T.number + 0.55, T.number + 0.85, t));
          if (ma < 0.003) ctx.show(magicUp, 0);
          else {
            const d = -950 * mu;
            const onT = at3(SLAB_HIT, execPt, clamp(-d / (SLAB_HIT.d - execPt.d)));
            put3(magicUp, lerp(MAGIC_POS.x, onT.x, sstep(0, 0.5, mu)), lerp(MAGIC_POS.y, onT.y, sstep(0, 0.5, mu)), d, "translate(-50%,-50%)");
            ctx.show(magicUp, ma * fogA(cam.z - d));
          }
        }

        // ---- the program headers: rise out of the slab, ride up with us, dock in the clone, fly into the bands
        let LX, LY, LS = 1;
        {
          const e = tw(T.reads - 0.1, T.inside + 0.3, t, "cubicOut");
          let cx, cy, LD;
          if (t < up0) { LD = -40 - 210 * e; cx = 960; cy = 640; }
          else if (t < up1) { const su = sstep(0, 1, clamp(cam.z / (D_US + 200))); LD = cam.z + lerp(-250, D_EXIT - D_US - 200, su * su * su); cx = cam.x; cy = cam.y; }
          else { cx = KID.x; cy = KID.y; LD = D_EXIT; }
          LX = cx - PH_W / 2; LY = cy - PH_H / 2;
          const cs = tw(T.builds + 0.2, T.space + 0.5, t, "cubicInOut");
          LX = lerp(LX, KID.x + 362, cs); LY = lerp(LY, KID.y - 20 - PH_H * 0.35, cs); LS = lerp(1, 0.7, cs);
          const la = sstep(T.reads - 0.15, T.reads + 0.05, t) * (1 - sstep(T.mapping - 0.25, T.mapping + 0.3, t)) * fogA(cam.z - LD, -2600, -1400, 500, 860);
          ctx.show(phEl, la);
          if (la > 0.003) {
            put3(phEl, LX, LY, LD, `scale(${LS.toFixed(4)})`);
            const wg = sstep(T.what - 0.05, T.what + 0.2, t) * (1 - sstep(T.where1 + 0.5, T.where1 + 1.0, t));
            const eg = sstep(T.where2 - 0.1, T.where2 + 0.15, t) * (1 - sstep(T.begin + 0.6, T.begin + 1.4, t));
            phRows.forEach((r, i) => {
              const ei = tw(T.reads + i * 0.07, T.reads + i * 0.07 + 0.35, t, "cubicOut");
              let tx = 0, ty = (1 - ei) * 26 + i * PH_LH, ra = ei;
              const fl = FLY.find((f) => f.row === i);
              if (fl) {
                const b = B[fl.band], fu = tw(fl.t - 0.45, fl.t - 0.02, t, "cubicInOut");
                tx = fu * (ML + 18 - LX) / LS; ty = lerp(ty, (MT + b.y + b.h / 2 - PH_LH / 2 - LY) / LS, fu);
                ra *= 1 - sstep(fl.t - 0.08, fl.t + 0.15, t);
              } else if (i === 1) ra *= 1 - 0.85 * sstep(T.dynamic - 0.05, T.dynamic + 0.3, t);
              else if (i !== 6) ra *= 1 - 0.65 * sstep(T.code - 0.4, T.code + 0.2, t);
              const sc = i === 8 ? 1 + 0.22 * eg : i === 6 ? 1 + 0.45 * sstep(T.asked - 0.1, T.asked + 0.25, t) * (1 - sstep(T.libc + 0.6, T.dynamic, t)) : i === 1 ? 1 + 0.35 * pulse(t, T.dynamic + 0.05, 0.25, 2.5) : 1;
              r.el.style.transform = `translate(${fx(tx)}px,${fx(ty)}px) scale(${sc.toFixed(3)})`;
              r.el.style.opacity = ra.toFixed(3);
            });
            [2, 3, 4, 5].forEach((i) => glowSpan(phRows[i].spans[1], wg, "#effcff", "rgba(143,224,255,A)"));
            glowSpan(phRows[8].spans[1], eg, "#ffffff", "rgba(190,240,255,A)");
            const nu = tw(T.asked - 0.1, T.asked + 0.35, t, "lin");
            const ntxt = nu <= 0 ? "" : OT.scramble("", "NEEDED libc.so.6", nu, t, 9);
            if (phRows[6].spans[1].textContent !== ntxt) phRows[6].spans[1].textContent = ntxt;
            glowSpan(phRows[6].spans[1], Math.max(pulse(t, T.libc + 0.1, 0.25, 1.2), 0.5 * pulse(t, T.asked + 0.3, 0.2, 2)), "#ffffff", "rgba(143,224,255,A)");
            glowSpan(phRows[1].spans[1], pulse(t, T.dynamic + 0.05, 0.25, 2.5), "#ffffff", "rgba(143,224,255,A)");
          }
        }

        // ---- the address space builds band by band (ends as baton 5)
        {
          ctx.show(pMem, sstep(T.builds - 0.2, T.builds + 0.3, t));
          const addrBase = 0.4 * sstep(T.address - 0.1, T.space + 0.3, t);
          Object.entries(B).forEach(([name, b]) => {
            const tb = BAND_T[name];
            const a = sstep(tb - 0.08, tb + 0.12, t);
            let tf = "none";
            if (t < tb + 2.5) {
              const u = clamp(spring(t, tb, 13, 0.5), 0, 1.2);
              let pre = "";
              if (name === "rodata") pre = `translateY(${fx(-40 * (1 - clamp(spring(t, T.beside - 0.15, 14, 0.45), 0, 1.3)))}px) `;
              tf = `${pre}scaleY(${lerp(0.06, 1, u).toFixed(4)})`;
            }
            b.el.style.transform = tf;
            const gl = name === "text" ? Math.max(pulse(t, tb + 0.1, 0.1, 1.1), 0.7 * sstep(T.ro1, T.ro1 + 0.2, t) * (1 - sstep(T.exe + 0.3, T.exe + 1.1, t)))
              : name === "rodata" ? Math.max(pulse(t, tb + 0.1, 0.1, 0.9), 0.6 * sstep(T.ro2, T.ro2 + 0.2, t) * (1 - sstep(T.beside + 0.2, T.beside + 0.9, t)))
              : name === "stack" ? Math.max(pulse(t, tb + 0.1, 0.1, 1.1), 0.5 * sstep(T.holding, T.holding + 0.3, t) * (1 - sstep(T.args + 0.3, T.args + 1.0, t)))
              : name === "libc" ? Math.max(pulse(t, tb + 0.1, 0.1, 1.2), pulse(t, T.puts + 0.05, 0.1, 1.4)) : 0.5 * pulse(t, tb + 0.1, 0.1, 1.5);
            bglow[name].style.transform = tf;
            ctx.show(bglow[name], gl * (1 - sstep(T.putsE + 0.2, t1 - 0.45, t)));
            b.el.style.opacity = a >= 0.999 ? "1" : a.toFixed(3);
            const aa = Math.max(addrBase, a);
            b.addr.style.opacity = aa >= 0.999 ? "1" : aa.toFixed(3);
          });
          glowSpan(B.text.nm, pulse(t, T.code + 0.1, 0.15, 1.2), "#ffffff", "rgba(143,224,255,A)");
          glowSpan(B.text.pm, sstep(T.ro1 - 0.1, T.ro1 + 0.15, t) * (1 - sstep(T.exe + 0.5, T.exe + 1.2, t)), "#ffffff", "rgba(143,224,255,A)");
          glowSpan(B.rodata.pm, sstep(T.ro2 - 0.1, T.ro2 + 0.15, t) * (1 - sstep(T.ro2 + 0.9, T.ro2 + 1.6, t)), "#ffffff", "rgba(255,226,180,A)");
          const sg = pulse(t, T.string + 0.05, 0.15, 0.9);
          B.rodata.gold.style.textShadow = sg > 0.01 ? `0 0 ${fx(12 + 26 * sg)}px rgba(255,190,70,${(0.6 + 0.4 * sg).toFixed(2)})` : "";
          glowSpan(B.stack.nm, pulse(t, T.stack + 0.1, 0.15, 1.2), "#ffffff", "rgba(255,226,180,A)");
          glowSpan(B.libc.nm, Math.max(pulse(t, T.mapping + 0.2, 0.15, 1.5), pulse(t, T.puts + 0.05, 0.1, 1.4)), "#ffffff", "rgba(143,224,255,A)");
          ctx.show(frame, 0.9 * sstep(T.address - 0.2, T.space + 0.2, t) * (1 - sstep(T.top, T.top + 0.8, t)));
          // argv on the new stack
          const n = Math.floor(ARG_PRE.length * tw(T.holding, T.args - 0.15, t, "lin") + 1e-6);
          const pre = ARG_PRE.slice(0, n) + " ".repeat(ARG_PRE.length - n);
          if (argPre.textContent !== pre) argPre.textContent = pre;
          argVal.style.opacity = sstep(T.holding - 0.1, T.holding + 0.2, t).toFixed(3);
          ctx.show(argsEl, sstep(T.holding - 0.15, T.holding, t) * (1 - sstep(T.putsE + 0.2, t1 - 0.45, t)));
          // ld.so: born from INTERP, runs first, maps libc, wires the stub to the real puts
          const lA = sstep(T.dynamic - 0.1, T.dynamic + 0.15, t) * (1 - sstep(T.real + 0.05, T.puts + 0.12, t));
          if (lA < 0.003) ctx.show(ldEl, 0);
          else {
            const rowP = [LX + 24.5 * PH_FS * 0.6 * LS, LY + 1.5 * PH_LH * LS], gap = [ML + 470, MT + 165], lib = [ML + 470, libcY], stub = bez(0);
            const L2 = (a, b2, u) => [lerp(a[0], b2[0], u), lerp(a[1], b2[1], u)];
            let p = L2(rowP, gap, tw(T.dynamic, T.first14, t, "cubicInOut"));
            p = L2(p, lib, tw(T.mapping - 0.25, T.mapping + 0.15, t, "cubicInOut"));
            p = L2(p, stub, tw(T.library + 0.25, T.wiring, t, "cubicInOut"));
            if (t > T.wiring) p = bez(tw(T.wiring, T.real + 0.05, t, "cubicInOut"));
            const sc = lerp(0.4, 1, tw(T.dynamic - 0.1, T.dynamic + 0.3, t, "backOut")) * (1 + 0.18 * pulse(t, T.first14, 0.1, 3));
            put2(ldEl, p[0], p[1], `translate(-50%,-50%) scale(${sc.toFixed(3)})`);
            ctx.show(ldEl, lA);
          }
          const w = tw(T.wiring, T.real + 0.05, t, "cubicInOut");
          const endA = 1 - sstep(T.putsE + 0.3, t1 - 0.45, t);
          wd.setAttribute("opacity", (sstep(T.library - 0.2, T.library + 0.3, t) * (1 - sstep(T.real, T.real + 0.4, t))).toFixed(3));
          ws.setAttribute("stroke-dashoffset", fx(WLEN * (1 - w)));
          ws.setAttribute("opacity", (sstep(T.wiring - 0.05, T.wiring + 0.05, t) * endA).toFixed(3));
          ws.setAttribute("stroke-width", fx(4.5 + 4 * pulse(t, T.puts + 0.05, 0.1, 2)));
          ctx.show(wire, 1);
          ctx.show(wlPlt, sstep(T.library - 0.1, T.library + 0.3, t) * endA);
          ctx.show(wlPuts, sstep(T.real - 0.15, T.puts, t) * endA);
        }
      });
    },
  });
})();
