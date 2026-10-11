// Sequence F — page fault, CPU, syscall → pixels   (s15 s16 s17)
//
// rip steps onto the promised .text band and falls through (page fault) into the kernel's net of light; the kernel
// scans its page cache, lifts the page out (or would read the disk), carries it up into .text; rip is restarted and
// this time the floor holds. Dive into .text: _start walks, calls into libc, libc calls main. Plunge to silicon:
// fetch / decode / execute, the clock races, lea puts the string's address in rdi, call puts. The address rises with
// us to .rodata: puts copies the string into stdout's buffer and the newline the optimizer plucked drifts back and
// snaps on. The process can't reach the terminal; one instruction — syscall — and the string drops through the kernel
// membrane. ring 0, write(1, buf, 14): fourteen bytes ride fd 1 and a pty tunnel up to the terminal app, find their
// glyphs in a font, are painted into pixels, and we rise through the light onto the page (baton 6).
OT.sequence({
  id: "F",
  build(ctx) {
    const { t0, t1 } = ctx;
    const { clamp, lerp, inv, sstep, tw, E } = OT;
    const W = (b, w, n = 1) => ctx.at(b, w, n);
    const win = (t, a, b, c, d) => sstep(a, b, t) * (1 - sstep(c, d, t));
    const bump = (t, tp, rise, decay) => (t < tp - rise ? 0 : t < tp ? sstep(tp - rise, tp, t) : Math.exp(-(t - tp) * decay));
    const put = (e, x, y, d, extra = "") => ctx.place(e, x, y, d, extra);
    const div = (cls, parent, html) => ctx.el("div", cls, parent || ctx.root, html);
    const free = (cls, parent, html) => div("ot-free " + cls, parent, html);
    const CEN = "translate(-50%,-50%)";
    const f3 = (v) => v.toFixed(3);
    const setText = (e, s) => { if (e.textContent !== s) e.textContent = s; };
    const op = (e, a) => { e.style.opacity = f3(clamp(a)); }; // children of a plane: opacity only, never visibility

    // ------------------------------------------------------------------ narration anchors
    const T = {
      run: W("s15", "run"), tryA: W("s15", "try", 1), memory: W("s15", "memory"), kern1: W("s15", "kernel", 1),
      promised: W("s15", "promised"), soA: W("s15", "So"), step: W("s15", "step"), lands: W("s15", "lands"),
      nothing: W("s15", "nothing"), pageA: W("s15", "page", 1), fault: W("s15", "fault"), kern2: W("s15", "kernel", 2),
      catches: W("s15", "catches"), finds: W("s15", "finds"), pageB: W("s15", "page", 2), cache: W("s15", "cache"),
      disk: W("s15", "disk"), maps: W("s15", "maps"), tryB: W("s15", "try", 2), thisT: W("s15", "This"),
      floor: W("s15", "floor"), there: W("s15", "there"),
      exec: W("s16", "Execution"), mainA: W("s16", "main", 1), us: W("s16", "underscore-start"), startup: W("s16", "startup"),
      prepares: W("s16", "prepares"), cLib: W("s16", "C"), calls: W("s16", "calls"),
      mainB: W("s16", "main", 2), fetches: W("s16", "fetches"), decodes: W("s16", "decodes"), executes: W("s16", "executes"),
      billions: W("s16", "billions"), second: W("s16", "second"), load: W("s16", "Load"), address: W("s16", "address"),
      call: W("s16", "Call"), putsA: W("s16", "puts"),
      putsB: W("s17", "Puts"), copies: W("s17", "copies"), andB: W("s17", "and"), restores: W("s17", "restores"),
      newline: W("s17", "newline"), took: W("s17", "took"), away: W("s17", "away"), but: W("s17", "But"),
      touch: W("s17", "touch"), screen: W("s17", "screen"), directly: W("s17", "directly"), soB: W("s17", "So"),
      special: W("s17", "special"), instr: W("s17", "instruction"), sys: W("s17", "sys-call"), switches: W("s17", "switches"),
      kmode: W("s17", "kernel", 1), writes: W("s17", "writes"), fourteen: W("s17", "fourteen"), bytes: W("s17", "bytes"),
      standard: W("s17", "standard"), output: W("s17", "output"), pseudo: W("s17", "pseudo-terminal"),
      terminal: W("s17", "terminal"), app: W("s17", "app"), paints: W("s17", "paints"), pixels: W("s17", "pixels"),
    };
    T.contact = T.lands + 0.22; // rip's foot meets the dashed outline
    T.catchT = T.catches + 0.1; // rip meets the net
    T.slot = T.maps + 0.8; // the page clicks into .text
    T.dive0 = T.us + 0.05; T.dive1 = T.us + 1.1;
    T.stepDt = Math.min(0.12, (T.cLib - 0.06 - T.startup) / 11);
    T.plunge0 = T.mainB + 0.3; T.plunge1 = T.fetches - 0.1;
    T.rise0 = T.putsA + 0.45; T.rise1 = T.putsB - 0.15;
    T.cross = T.sys + 0.38; // the string meets the membrane
    T.kArrive = T.sys + 1.55;
    T.upCross = T.pseudo - 0.1; // the camera's eye rises back through the membrane
    T.land = T.pixels + 1.2; // camera settles on the page
    T.swap = T.pixels + 1.26; // hero hands over to the page's own output line

    // ------------------------------------------------------------------ geometry (local px / depth)
    const MD = 1800; // kernel membrane (and the net that catches rip)
    const CD = 2350; // page cache, under the membrane
    const LIFT_D = 1560; // the found page is lifted up through the net
    const CATCH_Z = 1640; // camera depth when the net catches rip
    const DD = 2900; // the disk
    const LD = 820, LZ = LD + 130, LCAMY = 1070; // inside .text: the listing, and the camera that reads it
    const SD = 4800, SY = 960; // silicon
    const KD = 3600, KZ = KD + 180; // kernel scene (write), camera depth there
    const TD = -400; // the terminal app, up near the surface
    const GD = -600; // glyph row
    const PAGE_D = -2200; // the paper surface (exit)
    const PX = 1740; // page plane x offset: it lies right above the terminal app
    const EXIT = { x: 960 + PX, y: 640, z: PAGE_D };

    // ------------------------------------------------------------------ style
    ctx.el("style", "", ctx.root, `
.sF-ptr{width:0;height:0}
.sF-ptr .halo{position:absolute;left:-70px;top:-70px;width:140px;height:140px;border-radius:50%;background:radial-gradient(closest-side,rgba(170,238,255,.55),rgba(120,210,255,.16) 55%,rgba(120,210,255,0))}
.sF-ptr svg{position:absolute;left:-24px;top:-28px;width:48px;height:56px;overflow:visible}
.sF-ptr path{fill:#f2fdff;stroke:#bdf0ff;stroke-width:1.5;stroke-linejoin:round}
.sF-ptr .lab{position:absolute;left:-22px;top:-66px;font:500 20px "JetBrains Mono",monospace;white-space:pre;color:rgba(205,240,255,.8)}
.sF-ptr .lab b{color:#8fe0ff;font-weight:700}
.sF-ptr .pf{position:absolute;left:34px;top:-12px;font:700 22px "JetBrains Mono",monospace;color:#ff5c9a;text-shadow:0 0 12px rgba(255,92,154,.85)}
.sF-memb{width:9000px;height:6000px}
.sF-memb .grid{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(170,230,255,.42) 0 2px,transparent 2px 90px),repeating-linear-gradient(90deg,rgba(170,230,255,.42) 0 2px,transparent 2px 90px)}
.sF-memb .glow{position:absolute;left:2700px;top:1500px;width:3600px;height:3000px;background:radial-gradient(closest-side,rgba(190,240,255,.6),rgba(120,200,255,.18) 50%,rgba(80,160,255,0))}
.sF-memb .sys{position:absolute;font:400 24px "JetBrains Mono",monospace;color:rgba(215,245,255,.5);white-space:pre}
.sF-ring{width:1000px;height:1000px;border-radius:50%;border:3px solid rgba(200,244,255,.95);box-shadow:0 0 30px rgba(143,224,255,.6),inset 0 0 30px rgba(143,224,255,.4)}
.sF-spot{width:900px;height:900px;border-radius:50%;background:radial-gradient(closest-side,rgba(210,248,255,.85),rgba(143,224,255,.25) 45%,rgba(143,224,255,0))}
.sF-tile{position:absolute;width:640px;height:110px;border-radius:4px;border:1.5px solid rgba(140,220,255,.3);background-color:rgba(120,200,255,.035);background-image:repeating-linear-gradient(90deg,rgba(150,220,255,.22) 0 26px,transparent 26px 38px),repeating-linear-gradient(90deg,rgba(150,220,255,.15) 0 26px,transparent 26px 38px);background-size:570px 5px,420px 5px;background-position:30px 38px,30px 68px;background-repeat:no-repeat}
.sF-beam{position:absolute;width:5200px;height:260px;background:linear-gradient(180deg,rgba(143,224,255,0),rgba(143,224,255,.16) 45%,rgba(200,245,255,.3) 50%,rgba(143,224,255,.16) 55%,rgba(143,224,255,0))}
.sF-ftile{width:640px;height:110px;border-radius:4px;border:2px solid rgba(140,220,255,.3);font-family:"JetBrains Mono",monospace}
.sF-ftile .fl{position:absolute;left:18px;top:7px;font-size:17px;color:rgba(200,238,255,.8);white-space:pre}
.sF-ftile .fb{position:absolute;left:18px;font-size:20px;color:#9fe4ff;text-shadow:0 0 10px rgba(90,200,255,.55);white-space:pre}
.sF-slabw{width:760px;height:470px}
.sF-halo{width:1500px;height:1100px;border-radius:50%;background:radial-gradient(closest-side,rgba(150,220,255,.5),rgba(110,190,255,.14) 55%,rgba(110,190,255,0))}
.sF-hl{position:absolute;height:42px;border-radius:6px;background:linear-gradient(90deg,rgba(143,224,255,0),rgba(143,224,255,.2) 6%,rgba(143,224,255,.1) 85%,rgba(143,224,255,0));box-shadow:inset 3px 0 0 rgba(170,236,255,.8)}
.sF-libc{width:1700px;height:700px;border-radius:50%;background:radial-gradient(closest-side,rgba(205,236,255,.55),rgba(191,232,255,.18) 50%,rgba(191,232,255,0))}
.sF-lab{font:500 22px "JetBrains Mono",monospace;white-space:pre;color:rgba(225,242,255,.82)}
.sF-die .blk{fill:rgba(255,110,40,.05);stroke:#ff8a3d;stroke-width:2.5;opacity:.6}
.sF-die .trace{stroke:#ff7a2e;stroke-width:3;fill:none;opacity:.5}
.sF-die .pulse{stroke:#ffd2a1;stroke-width:4;fill:none;stroke-dasharray:40 360}
.sF-die .core{fill:rgba(255,150,70,.1);stroke:#ffc27a;stroke-width:3.5}
.sF-die .core2{fill:#ff8a3d;fill-opacity:.06;stroke:#ffab66;stroke-width:3}
.sF-gate{width:420px;height:150px;border-radius:16px;border:2.5px solid rgba(255,150,80,.85)}
.sF-gate .gl{position:absolute;left:16px;top:9px;font:500 20px "JetBrains Mono",monospace;color:rgba(255,214,170,.8);letter-spacing:.05em}
.sF-chip{font:700 26px "JetBrains Mono",monospace;white-space:pre;color:#fff3e6;text-shadow:0 0 16px rgba(255,170,90,.85)}
.sF-reg{width:460px;height:64px;border-radius:32px;border:2px solid rgba(143,224,255,.65);background:rgba(8,14,24,.5);font-family:"JetBrains Mono",monospace}
.sF-reg .rn{position:absolute;left:26px;top:0;line-height:60px;font-size:24px;color:#8fe0ff;font-weight:700}
.sF-reg .rv{position:absolute;right:26px;top:0;line-height:60px;font-size:26px;color:#e8f4ff;white-space:pre}
.sF-cring{width:1000px;height:1000px;border-radius:50%;border:3px solid rgba(255,196,130,.85);box-shadow:0 0 30px rgba(255,140,60,.5)}
.sF-bcell{position:absolute;width:30px;height:46px;border:1.5px solid rgba(255,220,170,.55);border-radius:3px}
.sF-ch{font:700 24px/1 "JetBrains Mono",monospace;color:#ffc54d;white-space:pre;text-shadow:0 0 12px rgba(255,190,70,.65);padding:11px 8px;border:1.5px solid transparent;border-radius:5px}
.sF-nl{font:400 34px/1 "JetBrains Mono",monospace;color:#ffc54d;white-space:pre;padding:8px 6px;border:1.5px solid transparent;border-radius:5px}
.sF-addr{font:700 26px/1 "JetBrains Mono",monospace;color:#ffc54d;white-space:pre;text-shadow:0 0 16px rgba(255,190,70,.85)}
.sF-pcell{border-radius:50%;background:radial-gradient(closest-side,rgba(255,214,150,0) 70%,rgba(255,200,120,.09) 92%,rgba(255,200,120,0) 100%);box-shadow:inset 0 0 0 3px rgba(255,205,120,.75),0 0 70px rgba(255,180,90,.25),inset 0 0 60px rgba(255,190,110,.2)}
.sF-tcell{border-radius:50%;background:radial-gradient(closest-side,rgba(255,236,200,.06),rgba(255,214,160,.03) 75%,rgba(255,214,160,0));box-shadow:inset 0 0 0 2.5px rgba(255,226,190,.6),0 0 70px rgba(255,214,160,.2),inset 0 0 70px rgba(255,214,160,.14)}
.sF-tcell .tn{position:absolute;left:0;right:0;top:34px;text-align:center;font:700 26px "JetBrains Mono",monospace;color:#fff3df}
.sF-tcell .mini{position:absolute;left:0;right:0;top:860px;text-align:center;font:500 22px/34px "JetBrains Mono",monospace;color:rgba(255,240,220,.62);white-space:pre}
.sF-thread{height:4px;border-radius:2px;background:linear-gradient(90deg,rgba(255,197,77,.95),#ffe2a0);box-shadow:0 0 14px rgba(255,190,70,.75);transform-origin:0 50%}
.sF-bump{width:420px;height:420px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,244,222,.95),rgba(255,180,130,.35) 40%,rgba(255,160,110,0))}
.sF-sysl{font:500 26px "JetBrains Mono",monospace;white-space:pre;color:#eaf9ff;text-shadow:0 0 16px rgba(143,224,255,.75)}
.sF-sysl i{font-style:normal;color:rgba(130,220,255,.65)}
.sF-klab{font:500 30px "JetBrains Mono",monospace;white-space:pre;color:rgba(190,240,255,.88);text-shadow:0 0 14px rgba(120,210,255,.5)}
.sF-stab{font:400 22px/40px "JetBrains Mono",monospace;white-space:pre;color:rgba(160,220,255,.5)}
.sF-stab div{height:40px}
.sF-rail{height:4px;border-radius:2px;background:linear-gradient(90deg,rgba(143,224,255,0),rgba(143,224,255,.85) 5%,rgba(143,224,255,.85) 95%,rgba(143,224,255,.4));box-shadow:0 0 18px rgba(120,210,255,.6)}
.sF-tring{width:300px;height:300px;border-radius:50%;border:3px solid rgba(143,224,255,.75);box-shadow:0 0 26px rgba(120,210,255,.45),inset 0 0 26px rgba(120,210,255,.3)}
.sF-tring.u{border-color:rgba(255,214,160,.8);box-shadow:0 0 26px rgba(255,190,110,.4),inset 0 0 26px rgba(255,190,110,.25)}
.sF-tring.port{border-width:4px;border-color:rgba(220,248,255,.95);box-shadow:0 0 40px rgba(170,235,255,.8),inset 0 0 40px rgba(170,235,255,.5)}
.sF-sheet{font:400 34px/50px "JetBrains Mono",monospace;letter-spacing:13.6px;color:transparent;-webkit-text-stroke:1.2px rgba(220,240,255,.55);white-space:pre}
.sF-look{width:36px;height:48px;border-radius:7px;border:2px solid #fff;box-shadow:0 0 18px rgba(190,240,255,.95)}
.sF-gly{font:700 120px/1 "JetBrains Mono",monospace;color:transparent;-webkit-text-stroke:2.5px #ffc54d;white-space:pre}
.sF-pix{font:700 120px/1 "JetBrains Mono",monospace;white-space:pre;color:#fff2d2;filter:url(#sF-pixf)}
.sF-pglow{width:1500px;height:520px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,252,240,.95),rgba(255,240,205,.45) 50%,rgba(255,240,205,0))}
`);
    // pixelate: sample the glyph on a 12 px grid and grow each sample into an 11 px square
    ctx.el("div", "", ctx.root, `<svg width="0" height="0" style="position:absolute"><filter id="sF-pixf" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feFlood x="6" y="6" width="1" height="1" flood-color="#fff"/><feComposite width="12" height="12"/><feTile result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/><feMorphology operator="dilate" radius="5.5"/></filter></svg>`);

    // ------------------------------------------------------------------ baton 5: the address space
    const memP = ctx.plane(0);
    const mem = OT.C.memcol(memP, { promised: ["text", "rodata", "data"] });
    mem.el.style.left = "640px";
    const MT = 640 - mem.h / 2;
    mem.el.style.top = MT + "px";
    const bandC = (n) => MT + mem.bands[n].y + mem.bands[n].h / 2;
    const TY = bandC("text"), RY = bandC("rodata"), HY = bandC("heap");
    const nmText = mem.bands.text.el.querySelector(".nm");
    nmText.innerHTML = '.text  <span>_start</span> · <span>main</span>'; // same text, words addressable
    const [lblStart, lblMain] = nmText.querySelectorAll("span");
    const NMCW = 22 * 0.6, NMX = 640 + 18; // label metrics inside the bands
    const roAddr = mem.bands.rodata.addr;

    // the stdout buffer in the heap (malloc'd by stdio on first output); the last cell takes the newline
    const CELLX = (i) => 745 + 33 * i + (i === 13 ? 5 : 0);
    const cells = [];
    for (let i = 0; i < 14; i++) {
      const c = div("sF-bcell", memP); const w = i === 13 ? 40 : 30;
      c.style.left = CELLX(i) - w / 2 + "px"; c.style.top = HY - 23 + "px"; c.style.width = w + "px"; cells.push(c);
    }
    const bufLab = div("sF-lab", memP, "stdout");
    bufLab.style.cssText += `position:absolute;left:${CELLX(0) - 15}px;top:${HY - 66}px;font-size:19px;color:rgba(255,230,200,.7)`;
    const RIMX = 930 + Math.sqrt(650 * 650 - (HY - 640) * (HY - 640)); // our cell's wall, at the heap's height
    const thread = div("sF-thread", memP);
    thread.style.cssText += `position:absolute;left:${CELLX(13) + 24}px;top:${HY - 2}px;width:${(RIMX - CELLX(13) - 24).toFixed(0)}px`;

    // ------------------------------------------------------------------ rip
    const ptr = free("sF-ptr", null, `<div class="halo"></div><svg viewBox="0 0 48 56"><path d="M5 3 L45 28 L5 53 L15 28 Z"/></svg><div class="lab"><b>rip</b> 0x555555555040</div><div class="pf">#PF</div>`);
    const ptrHalo = ptr.querySelector(".halo"), ptrLab = ptr.querySelector(".lab"), ptrPF = ptr.querySelector(".pf");

    // ------------------------------------------------------------------ the kernel membrane / net
    const MEMB = { x: 960, y: TY };
    const memb = free("sF-memb");
    const membGrid = div("grid", memb), membGlow = div("glow", memb);
    const membSys = div("", memb);
    {
      const r = OT.rng(5);
      const SYS = ["read", "write", "openat", "close", "mmap", "munmap", "brk", "execve", "clone", "wait4", "exit_group", "futex", "ioctl", "fstat", "rt_sigaction", "pread64", "mprotect", "getpid", "poll", "lseek"];
      for (let i = 0; i < 46; i++) {
        const x = 4500 + (r() - 0.5) * 7600, y = 3000 + (r() - 0.5) * 5000;
        if (Math.hypot((x - 4500) / 1.6, y - 3000) < 520) continue;
        const s = div("sys", membSys, SYS[i % SYS.length]);
        s.style.left = x.toFixed(0) + "px"; s.style.top = y.toFixed(0) + "px";
      }
    }
    const rings = [0, 1, 2].map(() => free("sF-ring"));
    const spot = free("sF-spot");

    // ------------------------------------------------------------------ page cache + disk
    const cacheP = ctx.plane(CD);
    const FC = 3, FR = 6; // the found page's slot in the cache grid
    const tileX = (c) => 960 + (c - 2) * 700, tileY = (r) => TY - 5 * 150 + r * 150;
    const FX = tileX(FC), FY = tileY(FR);
    const LIFT = { x: FX - 120, y: FY - 40 };
    const tiles = [];
    for (let r = 0; r < 12; r++) for (let c = 0; c < 5; c++) {
      if (c === FC && r === FR) continue;
      const e = div("sF-tile", cacheP);
      e.style.left = tileX(c) - 320 + "px"; e.style.top = tileY(r) - 55 + "px";
      tiles.push({ e, y: tileY(r), x: tileX(c) });
    }
    const beam = div("sF-beam", cacheP);
    const ftile = free("sF-ftile", null,
      `<div class="fl">hello  +0x1000</div><div class="fb" style="top:36px">… F3 0F 1E FA 31 ED 49 89 D1 5E 48 89 E2 48</div><div class="fb" style="top:66px">83 E4 F0 50 54 45 31 C0 31 C9 48 8D 3D E1 …</div>`);
    const ftileIn = [...ftile.children];
    const SLAB = { x: 190, y: 1290, s: 1.5 };
    const slabW = free("sF-slabw");
    OT.C.slab(slabW, { name: "hello", size: "16 KB" });
    const slabHalo = free("sF-halo");

    // ------------------------------------------------------------------ inside .text: _start and main
    const ASM_K = /^(endbr64|xor|mov|pop|push|and|lea|call|hlt|ret)$/;
    const ASM_R = /^(rax|rcx|rdx|rsi|rdi|rbp|rsp|rip|r8d|r9|eax|ebp|ecx)$/;
    const asm = (line) => {
      const out = [];
      const push = (s, c) => { const l = out[out.length - 1]; if (l && l[1] === c) l[0] += s; else out.push([s, c]); };
      const re = /(\s+)|(0x[0-9a-f]+|-?\d+)|([A-Za-z_][\w@.]*:?)|([^\w\s])/g;
      let m;
      while ((m = re.exec(line))) {
        const s = m[0];
        if (m[1]) push(s, "");
        else if (m[2]) push(s, "num");
        else if (m[3]) push(s, s.endsWith(":") ? "lbl" : ASM_K.test(s) ? "k" : ASM_R.test(s) ? "reg" : "fn");
        else push(s, "pu");
      }
      return out;
    };
    const START = ["endbr64", "xor   ebp, ebp", "mov   r9, rdx", "pop   rsi", "mov   rdx, rsp", "and   rsp, -16", "push  rax", "push  rsp",
      "xor   r8d, r8d", "xor   ecx, ecx", "lea   rdi, [rip + main]", "call  [rip + __libc_start_main@GOTPCREL]", "hlt"];
    const MAIN = [["50", "push  rax"], ["48 8D 3D BC 0E 00 00", "lea   rdi, [rip + 0xebc]"], ["E8 E3 FE FF FF", "call  puts@plt"], ["31 C0", "xor   eax, eax"], ["59", "pop   rcx"], ["C3", "ret"]];
    const lstP = ctx.plane(LD);
    const LCS = 28, LLH = 42, LCW = LCS * 0.6;
    const startCode = OT.C.code(lstP, [[["_start:", "lbl"], ["  0x555555555040", "cm"]], ...START.map((l) => [["    ", ""], ...asm(l)])], { lang: "asm", theme: "night", size: LCS, lh: LLH });
    const mainCode = OT.C.code(lstP, [[["main:", "lbl"], ["    0x555555555140", "cm"]], ...MAIN.map(([b, l]) => [["    ", ""], [b.padEnd(22), "hex"], ...asm(l)])], { lang: "asm", theme: "night", size: LCS, lh: LLH });
    const LCY = 940; // listing centre line
    const SL = 960 - startCode.maxWidth / 2, ST = LCY - startCode.height / 2;
    const ML = 1560, MTOP = LCY - mainCode.height / 2;
    startCode.el.style.left = SL + "px"; startCode.el.style.top = ST + "px";
    mainCode.el.style.left = ML + "px"; mainCode.el.style.top = MTOP + "px";
    const rowS = (i) => ST + LLH / 2 + i * LLH, rowM = (i) => MTOP + LLH / 2 + i * LLH;
    const MX = ML + mainCode.maxWidth / 2;
    const hlS = div("sF-hl", lstP), hlM = div("sF-hl", lstP);
    hlS.style.left = SL - 14 + "px"; hlS.style.width = startCode.maxWidth + 40 + "px";
    hlM.style.left = ML - 14 + "px"; hlM.style.width = mainCode.maxWidth + 40 + "px";
    const libcSpan = startCode.segs[12].find((s) => s.textContent.includes("__libc"));
    const main50 = mainCode.segs[1][1];
    const LIBC_Y = LCAMY + (70 - 640) / (1000 / (1000 - (LZ - LD))); // label sits near the top edge of the frame
    const libcGlow = div("ot-free sF-libc", lstP);
    const libcLab = div("ot-free sF-lab", lstP, "libc.so.6");
    libcLab.style.color = "#dff2ff"; libcLab.style.fontSize = "26px";
    put(libcGlow, 1120, LIBC_Y - 260, 0, CEN);
    put(libcLab, 1120, LIBC_Y, 0, CEN);

    // ------------------------------------------------------------------ silicon
    const siP = ctx.plane(SD);
    const pulses = [], cores2 = [];
    {
      const r = OT.rng(9), cx = 2200, cy = 1400;
      let s = `<svg class="sF-die" width="4400" height="2800" viewBox="0 0 4400 2800" style="position:absolute;left:${MX - 2200}px;top:${SY - 1400}px;overflow:visible">`;
      s += `<defs><radialGradient id="sF-heat" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffb070" stop-opacity="0.85"/><stop offset="0.35" stop-color="#ff6a1a" stop-opacity="0.3"/><stop offset="1" stop-color="#ff4a00" stop-opacity="0"/></radialGradient></defs>`;
      s += `<rect x="40" y="40" width="4320" height="2720" rx="24" class="blk"/>`;
      [[-600, -1200, 1200, 300], [-600, 900, 1200, 300], [-2080, -260, 380, 520], [1700, -260, 380, 520]].forEach(([x, y, w, h]) => {
        s += `<rect x="${cx + x}" y="${cy + y}" width="${w}" height="${h}" rx="10" class="blk"/>`;
        for (let g = 1; g < 6; g++) s += `<line x1="${cx + x + (w * g) / 6}" y1="${cy + y + 14}" x2="${cx + x + (w * g) / 6}" y2="${cy + y + h - 14}" class="trace" style="opacity:.22"/>`;
      });
      [[-1480, -830], [1480, -830], [-1480, 830], [1480, 830]].forEach(([dx, dy]) => {
        s += `<rect x="${cx + dx - 440}" y="${cy + dy - 260}" width="880" height="520" rx="16" class="core2"/>`;
        for (let g = 0; g < 3; g++) s += `<rect x="${cx + dx - 330 + g * 230}" y="${cy + dy - 70}" width="200" height="90" rx="10" class="blk" style="opacity:.45"/>`;
      });
      for (let i = 0; i < 24; i++) {
        const ang = (i / 24) * Math.PI * 2 + r() * 0.18, R1 = 760 + r() * 40, R2 = 1700 + r() * 380;
        const x1 = cx + Math.cos(ang) * R2, y1 = cy + Math.sin(ang) * R2 * 0.62, x2 = cx + Math.cos(ang) * R1, y2 = cy + Math.sin(ang) * R1 * 0.42;
        const d = `M${x1.toFixed(0)} ${y1.toFixed(0)} L${x1.toFixed(0)} ${((y1 + y2) / 2).toFixed(0)} L${x2.toFixed(0)} ${((y1 + y2) / 2).toFixed(0)} L${x2.toFixed(0)} ${y2.toFixed(0)}`;
        s += `<path class="trace" d="${d}"/><path class="pulse" data-ph="${r().toFixed(3)}" d="${d}"/>`;
      }
      s += `<rect x="${cx - 760}" y="${cy - 300}" width="1520" height="600" rx="20" class="core"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="1500" fill="url(#sF-heat)" class="heat"/>`;
      s += `</svg>`;
      siP.insertAdjacentHTML("beforeend", s);
      siP.querySelectorAll(".pulse").forEach((p) => pulses.push({ p, ph: parseFloat(p.dataset.ph) }));
      siP.querySelectorAll(".core2").forEach((c) => cores2.push(c));
    }
    const heat = siP.querySelector(".heat");
    const GATES = ["fetch", "decode", "execute"].map((n, i) => {
      const e = div("ot-free sF-gate", siP, `<div class="gl">${n}</div>`);
      const x = MX + (i - 1) * 460, y = 900;
      put(e, x, y, 0, CEN);
      return { e, x, y };
    });
    const mkReg = (name, x) => { const e = div("ot-free sF-reg", siP, `<div class="rn">${name}</div><div class="rv"></div>`); put(e, x, 1085, 0, CEN); return { e, v: e.querySelector(".rv"), x, y: 1085 }; };
    const RDI = mkReg("rdi", MX - 250), RIP = mkReg("rip", MX + 250);
    const chips = [0, 1, 2].map(() => free("sF-chip"));
    const crings = [0, 1, 2].map(() => div("ot-free sF-cring", siP));
    const CHIPS = [
      { b: "50", m: "push  rax" },
      { b: "48 8D 3D BC 0E 00 00", m: "lea rdi, [rip + 0xebc]" },
      { b: "E8 E3 FE FF FF", m: "call puts@plt" },
    ];
    const addrFly = free("sF-addr", null, "0x555555556004"); // the string's address, rising from rdi to .rodata

    // ------------------------------------------------------------------ the string's own glyphs (gold), the buffer, the newline
    const STR = "Hello, world!";
    const CH = [...STR, "\\n"];
    const HEX = ["48", "65", "6C", "6C", "6F", "2C", "20", "77", "6F", "72", "6C", "64", "21", "0A"];
    const SRCX = (i) => NMX + (9 + i) * NMCW + NMCW / 2; // in `.rodata "Hello, world!"` (spaces collapse)
    const KX = (i) => 961 + (i - 6.5) * 58; // byte pitch in the kernel
    const chs = CH.map((c, i) => free(i === 13 ? "sF-nl" : "sF-ch"));
    const procCell = free("sF-pcell");
    procCell.style.width = procCell.style.height = "1300px";
    const bumpEl = free("sF-bump");
    const sysl = free("sF-sysl", null, `<i>0F 05</i>  syscall`);

    // ------------------------------------------------------------------ the kernel side: ring 0, the syscall table, write(1, buf, 14), fd 1, the pty
    const klab = free("sF-klab");
    const kparts = [0, 1, 2, 3, 4].map(() => ctx.el("span", "", klab));
    const SYSTAB = ["read", "write", "open", "close", "stat", "fstat", "lstat", "poll", "lseek", "mmap"];
    const stab = free("sF-stab", null, SYSTAB.map((n, i) => `<div>${String(i).padStart(2, " ")}  ${n}</div>`).join(""));
    const stabWrite = stab.children[1];
    const STAB = { x: 300, y: HY - 250 };
    const rail = free("sF-rail");
    const RAIL0 = KX(13) + 40, TUNX = 2700;
    const fdLab = free("sF-lab", null, "fd 1");
    const MOUTH_Y = 840;
    const axisY = (d) => lerp(HY, MOUTH_Y, clamp((KD - d) / (KD - TD)));
    const TRING_D = [];
    for (let k = 0; k <= 10; k++) TRING_D.push(KD - k * 400);
    const trings = TRING_D.map((d) => free("sF-tring" + (d < MD ? " u" : "")));
    const portRing = free("sF-tring port");
    const ptyLab = free("sF-lab", null, "pty");

    // ------------------------------------------------------------------ the terminal app, its font, the glyph row
    const TCELL = { x: TUNX, y: 685, r: 560 };
    const tcell = free("sF-tcell", null, `<div class="tn">terminal</div><div class="mini">$ clang -O2 hello.c -o hello &amp;&amp; ./hello\n▌</div>`);
    tcell.style.width = tcell.style.height = TCELL.r * 2 + "px";
    const miniEl = tcell.querySelector(".mini");
    const SHEET_PITCH = 34, SHL = TUNX - 16 * SHEET_PITCH, SHT = 232;
    const sheetRows = [];
    for (let r = 0; r < 3; r++) { let s = ""; for (let c = 0; c < 32; c++) { const code = 0x20 + r * 32 + c; s += code < 0x7f ? String.fromCharCode(code) : " "; } sheetRows.push(s); }
    const sheet = free("sF-sheet");
    sheet.textContent = sheetRows.join("\n");
    const glyphPos = (i) => { const code = parseInt(HEX[i], 16) - 0x20; return { x: SHL + (code & 31) * SHEET_PITCH + 10.2, y: SHT + 25 + (code >> 5) * 50 }; };
    const look = free("sF-look");
    const ROW_Y = 660, ROW_L = TUNX - (13 * 72) / 2;
    const rowX = (i) => ROW_L + 36 + 72 * i;
    const glys = [...STR].map((c) => { const g = free("sF-gly"); g.textContent = c; return g; });
    const pixRow = free("sF-pix");
    pixRow.textContent = STR;
    const pglow = free("sF-pglow");

    // ------------------------------------------------------------------ baton 6: the page
    const pageP = ctx.plane(PAGE_D);
    pageP.style.transform = `translate3d(${PX}px, 0px, ${-PAGE_D}px)`;
    const page = OT.C.page(pageP);
    const TERM_CMD = [["$ ", "pr"], ["clang -O2 hello.c -o hello && ", "dim"], ["./hello", ""]];
    const TERM_OUT = [["Hello, world!", "out"]];
    page.setTerm([TERM_CMD, TERM_OUT]);

    // ------------------------------------------------------------------ camera (local)
    // Text re-rasterises at every fractional camera step, so wherever readable text is on screen the camera is DEAD
    // STILL (two identical keys, full {x, y, z}); it moves only in decisive, eased moves between those rests.
    const K = [];
    const key = (t, k) => K.push([t, k]);
    const A_TEXT = { x: 935, y: 860, z: 200 }; // over .text, rip arriving
    const A_STEP = { x: 955, y: 925, z: 260 }; // rip's first step (z fixed: rip's foot meets the outline at depth 0)
    const A_LEAN = { x: 1250, y: TY + 62, z: CATCH_Z + 50 }; // leaning towards the page the kernel found
    const A_SLOT = { x: 960, y: TY - 15, z: 300 }; // z fixed: the page clicks into .text at eff 300
    const A_FLOOR = { x: 960, y: TY, z: 325 };
    const A_LABELS = { x: 880, y: TY, z: 410 }; // ".text  _start · main"
    const A_START = { x: 960, y: LCAMY, z: LZ }; // reading _start
    const A_MAIN = { x: MX, y: LCAMY, z: LZ }; // reading main
    key(t0, { x: 960, y: 640, z: 0 });
    key(T.run - 0.3, { x: 960, y: 640, z: 0 }); // dead still on the baton
    key(T.tryA + 0.6, { ...A_TEXT }); // down to .text, rip arriving
    key(T.soA, { ...A_TEXT, roll: 0.35 }); // hold x/y/z: "none of it is actually in memory yet; the kernel only promised it." (only a slow roll breathes)
    key(T.soA + 0.95, { ...A_STEP, roll: 0, ease: "smoother" }); // "So the CPU's very first step": one glide in
    key(T.contact, { ...A_STEP });
    key(T.contact + 0.45, { x: 960, y: 940, z: 300 }); // the hang before the drop
    key(T.fault, { x: 960, y: TY, z: 800 });
    key(T.fault + 0.9, { x: 960, y: TY, z: 1330 });
    key(T.catchT, { x: 960, y: TY, z: CATCH_Z });
    key(T.finds - 0.05, { x: 960, y: TY, z: CATCH_Z }); // rip lies in the net: still
    key(T.cache, { ...A_LEAN, ease: "smoother" }); // lean towards the page the kernel found
    key(T.maps, { ...A_LEAN }); // hold on its bytes
    key(T.slot, { ...A_SLOT }); // whip up with it
    key(T.floor, { ...A_SLOT }); // hold: "lets the CPU try again. This time,"
    key(T.floor + 0.35, { ...A_FLOOR, ease: "quintOut" }); // the floor holds: a small jolt down with rip's landing
    key(T.exec - 0.1, { ...A_FLOOR }); // rest
    key(T.mainA - 0.3, { ...A_LABELS, ease: "smoother" }); // "Execution starts not at main,": glide to the labels
    key(T.dive0, { ...A_LABELS });
    key(T.dive1, { ...A_START }); // through .text
    key(T.calls - 0.1, { ...A_START }); // hold while rip walks _start
    key(T.mainB + 0.25, { ...A_MAIN, ease: "smoother" }); // glide to main
    key(T.plunge0, { ...A_MAIN });
    key(T.plunge1, { x: MX, y: SY, z: SD }); // plunge to silicon
    key(T.billions, { x: MX, y: SY, z: SD });
    key(T.second + 0.25, { x: MX, y: SY + 30, z: SD - 910 }); // back off: the whole die is humming
    key(T.load - 0.2, { x: MX, y: SY + 30, z: SD - 910 });
    key(T.load + 0.3, { x: MX, y: SY, z: SD });
    key(T.rise0, { x: MX, y: SY, z: SD });
    const A_COPY = { x: 985, y: 760, z: 380 }; // z fixed: the rising address docks at depth 0 at rise1
    const A_BUF = { x: 975, y: 735, z: 450 }; // the stdout buffer
    const A_SYS = { x: 961, y: 688, z: -100 }; // z fixed: the bytes leave the buffer at depth 0 at sys
    const A_KERN = { x: 961, y: HY, z: KZ }; // ring 0, write(1, buf, 14)
    const A_FONT = { x: TUNX, y: 610, z: -600 }; // the terminal app's font
    key(T.rise1, { ...A_COPY }); // whip up into user space, the address leading the way
    key(T.andB, { ...A_COPY }); // hold while puts copies the string
    key(T.newline - 0.08, { ...A_BUF, ease: "smoother" }); // "and restores the newline": push in to the buffer
    key(T.but, { ...A_BUF });
    key(T.screen, { x: 1800, y: 660, z: -1300 }); // pull back: two processes, a wall between them
    key(T.directly + 0.5, { x: 1810, y: 660, z: -1330 });
    key(T.instr - 0.25, { ...A_SYS }); // back to the buffer
    key(T.sys, { ...A_SYS }); // the held breath
    key(T.cross, { x: 961, y: 686, z: 1550 }); // drop
    key(T.cross + 0.32, { x: 961, y: HY, z: 2800 });
    key(T.kArrive, { ...A_KERN });
    key(T.standard - 0.1, { ...A_KERN }); // hold: ring 0, the table, write(1, buf, 14), fourteen bytes
    key(T.output + 0.4, { x: 2300, y: HY, z: KD - 300 }); // run along fd 1
    key(T.upCross, { x: 2580, y: 740, z: 2800 });
    key(T.pseudo + 0.3, { x: TUNX, y: 760, z: 2150 }); // looking down the pty
    key(T.app, { ...A_FONT }); // rise with the bytes
    key(T.paints, { ...A_FONT }); // hold while each byte finds its glyph
    key(T.pixels + 0.2, { x: TUNX, y: 600, z: -700 });
    key(T.land, { ...EXIT }); // up through the light onto the paper
    key(t1, { ...EXIT });
    ctx.cam(K);
    ctx.exit(EXIT);

    // ------------------------------------------------------------------ ground, motes, flashes, shakes
    ctx.ground([
      [t0, "#1e1730"], [T.promised, "#1c1530"], [T.contact, "#1a1430"], [T.fault, "#0d0f22"], [T.fault + 1, "#070a16"],
      [T.catchT, "#08101f"], [T.maps, "#0a1124"], [T.slot, "#1e1730"], [T.plunge0, "#1e1730"], [T.plunge1, "#210904"],
      [T.billions, "#2c0d05"], [T.second + 0.3, "#4a1606"], [T.load + 0.3, "#3a1205"], [T.rise0, "#3a1205"], [T.rise1, "#1e1730"],
      [T.but, "#1e1730"], [T.screen, "#251b3a"], [T.soB, "#241a38"], [T.sys, "#1e1730"], [T.cross, "#0c1630"], [T.cross + 0.6, "#070c1c"],
      [T.writes, "#060a18"], [T.pseudo, "#060a18"], [T.app - 0.4, "#1c1630"], [T.app, "#2b2140"], [T.pixels + 0.28, "#2b2140"],
      [T.pixels + 0.46, "#fff8ee"], [T.pixels + 0.85, "#fff8ee"], [T.land, "#efeae0"], [t1, "#efeae0"],
    ]);
    ctx.motes([[t0, "spores"], [T.kern2, "sparks"], [T.maps + 0.5, "spores"], [T.plunge0 + 0.2, "embers"], [T.rise0 + 0.6, "spores"],
      [T.cross, "sparks"], [T.upCross + 0.3, "spores"], [T.pixels, "none"], [T.pixels + 0.85, "dust"]]);
    ctx.shake(T.contact, { amp: 2.5, freq: 34, decay: 7 });
    ctx.flash(T.catchT, { peak: 0.14, decay: 5, color: "#8fe0ff" });
    ctx.shake(T.catchT, { amp: 5, freq: 22, decay: 5 });
    ctx.flash(T.slot, { peak: 0.16, decay: 6, color: "#d9f3ff" });
    ctx.shake(T.slot, { amp: 4, decay: 7 });
    ctx.flash(T.floor + 0.02, { peak: 0.1, decay: 7, color: "#d9f3ff" });
    ctx.shake(T.floor + 0.02, { amp: 8, freq: 26, decay: 6.5 });
    ctx.shake(T.plunge1, { amp: 6, decay: 6 });
    ctx.flash(T.executes, { peak: 0.16, decay: 6, color: "#ffb070" });
    ctx.flash(T.address, { peak: 0.1, decay: 6, color: "#ffc54d" });
    ctx.flash(T.newline + 0.12, { peak: 0.07, decay: 8, color: "#ffc54d" });
    ctx.shake(T.screen + 0.02, { amp: 4, decay: 7 });
    ctx.flash(T.cross, { peak: 0.6, decay: 6.5, color: "#d9f3ff" });
    ctx.shake(T.cross, { amp: 16, freq: 32, decay: 5 });
    ctx.flash(T.upCross, { peak: 0.28, decay: 7, color: "#d9f3ff" });
    ctx.flash(T.pixels + 0.42, { peak: 0.95, attack: 0.22, hold: 0.2, decay: 5, color: "#fff8ee" });
    ctx.shake(T.land, { amp: 3, decay: 7 });

    // ------------------------------------------------------------------ choreography helpers
    const PH = { x: 960, y: TY, d: -120 }; // rip hovering over .text
    const GUT_S = SL - 30, GUT_M = ML - 30;
    let zMaps = null;
    const camZ = (t) => ctx.camAt(t).z;

    // rip: {x, y, d, rot, sc, a, lab}
    function ripAt(t) {
      if (t < T.run - 0.35) return null;
      if (t < T.contact) {
        const a = tw(T.run - 0.35, T.tryA + 0.3, t, "cubicOut");
        const x = lerp(700, PH.x, a), y = lerp(TY - 150, PH.y, a);
        let d = lerp(-320, PH.d, a);
        const hes = t > T.tryA ? Math.sin((t - T.tryA) * 9) * Math.exp(-(t - T.tryA) * 2.2) : 0; // "or rather, try to"
        d += 26 * hes + 5 * Math.sin(t * 2.3);
        d = lerp(d, 0, tw(T.step, T.contact, t, "quadIn"));
        return { x, y, d, rot: 0, sc: 1, a: sstep(T.run - 0.35, T.run + 0.15, t), lab: 1 };
      }
      if (t < T.catchT) {
        const u = inv(T.contact, T.catchT, t);
        const d = Math.max(0, camZ(t) - lerp(260, CATCH_Z - MD, E.quadIn(u)));
        return { x: PH.x, y: PH.y, d, rot: 320 * E.quadIn(u), sc: 1, a: 1, lab: 1 };
      }
      if (t < T.tryB) { // resting in the net; restarted later (it leaves the net as the page goes up)
        const x = t - T.catchT;
        const d = MD + 40 * Math.sin(x * 10) * Math.exp(-x * 4.5);
        return { x: PH.x, y: PH.y, d, rot: 320 + 8 * Math.sin(x * 6) * Math.exp(-x * 2), sc: 1, a: 1 - sstep(T.maps, T.maps + 0.35, t), lab: 1 };
      }
      const sp = clamp(OT.spring(t, T.tryB, 16, 0.5), 0, 1.3);
      if (t < T.dive0) {
        let d = PH.d + 5 * Math.sin(t * 2.3);
        d = lerp(d, 0, tw(T.thisT + 0.2, T.floor, t, "quadIn"));
        return { x: PH.x, y: PH.y, d, rot: 0, sc: 0.2 + 0.8 * sp, a: sstep(T.tryB, T.tryB + 0.08, t), lab: 1 };
      }
      if (t < T.dive1) {
        const u = tw(T.dive0, T.dive1, t, "cubicInOut");
        return { x: lerp(PH.x, GUT_S, u), y: lerp(TY, rowS(1), u), d: lerp(0, LD, u), rot: 0, sc: lerp(1, 0.72, u), a: 1, lab: 1 - sstep(0, 0.5, u) };
      }
      const base = { rot: 0, sc: 0.72, a: 1, lab: 0, d: LD };
      if (t < T.cLib + 0.05) { // walk _start, one instruction at a time
        const kf = Math.max(0, (t - T.startup) / T.stepDt), k = Math.min(11, Math.floor(kf));
        const from = rowS(Math.max(1, k)), to = rowS(1 + k);
        const y = lerp(from, to, E.expoOut(clamp((kf - k) / 0.5)));
        return { ...base, x: GUT_S, y: t < T.startup ? rowS(1) : y };
      }
      const OUTY = LIBC_Y - 240;
      if (t < T.calls) { // call → off into libc
        const u = tw(T.cLib + 0.05, T.cLib + 0.6, t, "cubicIn");
        return { ...base, x: lerp(GUT_S, 1120, u), y: lerp(rowS(12), OUTY, u) };
      }
      if (t < T.plunge0) { // libc calls main
        const u = tw(T.calls, T.mainB + 0.2, t, "cubicOut");
        return { ...base, x: lerp(1200, GUT_M, u), y: lerp(OUTY, rowM(1), u) };
      }
      if (t < T.plunge1 + 0.45) { // falls with us into the core, docks in rip
        const u = tw(T.plunge0, T.plunge1, t, "cubicInOut");
        const dock = tw(T.plunge1, T.plunge1 + 0.4, t, "cubicIn");
        return { ...base, x: lerp(GUT_M, RIP.x - 200, u), y: lerp(rowM(1), RIP.y, u), d: t < T.plunge1 ? camZ(t) : SD, a: 1 - dock, sc: 0.72 };
      }
      return null;
    }

    // a gold glyph of the string: {x, y, d, a, text, sc, blur, box}
    const DEP = (i) => T.standard - 0.05 + 0.075 * i;
    const DUR = (i) => 0.5 + (TUNX - KX(i)) / 2600;
    const TA = (i) => DEP(i) + DUR(i); // enters the pty
    const TM = (i) => T.app - 0.05 + 0.105 * i; // reaches the terminal app
    const theta = (i, d) => i * 0.8 + (KD - d) * 0.0032;
    function chAt(i, t) {
      if (t < T.copies - 0.2) return null;
      let x, y, d = 0, a = 1, sc = 1, blur = 0, box = 0;
      const W0 = T.writes + 0.04 * i;
      const text = t < W0 ? CH[i] : OT.scramble(CH[i], HEX[i], inv(W0, W0 + 0.28, t), t, 5 + i);
      if (t < T.sys) {
        if (i < 13) {
          const c0 = T.copies + 0.075 * i, c1 = c0 + 0.42;
          if (t < c0) return null;
          const u = E.cubicInOut(inv(c0, c1, t));
          x = lerp(SRCX(i), CELLX(i), u); y = lerp(RY, HY, u); d = -90 * Math.sin(Math.PI * u); sc = lerp(0.92, 1, u);
          return { x, y, d, a: sstep(c0, c0 + 0.06, t), text, sc, blur, box };
        }
        // the newline the optimizer plucked: drifts down from above and snaps on
        const s0 = T.restores - 0.6, s1 = T.newline - 0.08, s2 = T.newline + 0.1;
        if (t < s0) return null;
        const D0 = { x: 1180, y: 590, d: -260 }, D1 = { x: 1192, y: 662, d: -60 };
        if (t < s1) {
          const u = E.sineInOut(inv(s0, s1, t));
          x = lerp(D0.x, D1.x, u) + 22 * Math.sin(u * 3.1); y = lerp(D0.y, D1.y, u); d = lerp(D0.d, D1.d, u);
          return { x, y, d, a: sstep(s0, s0 + 0.35, t), text: "\\0A", sc: 1, blur: 6 * (1 - u), box, nl: 1 };
        }
        const u = E.expoOut(inv(s1, s2, t));
        return { x: lerp(D1.x, CELLX(13), u), y: lerp(D1.y, HY, u), d: lerp(D1.d, 0, u), a: 1, text: OT.scramble("\\0A", "\\n", inv(T.newline + 0.02, T.newline + 0.32, t), t, 11), sc: lerp(1, 24 / 34, u), blur: 0, box, nl: 1 };
      }
      if (i === 13) sc = 24 / 34;
      box = sstep(T.cross, T.kArrive, t);
      if (t < T.kArrive) { // dropped through the membrane, spreading to the kernel's byte pitch
        const tl = t - 0.004 * i;
        const cz = camZ(Math.max(T.sys, tl));
        const eff = tl < T.cross ? lerp(-100, -250, inv(T.sys, T.cross, tl)) : lerp(-250, KZ - KD, E.cubicOut(inv(T.cross, T.kArrive, tl)));
        d = tl <= T.sys ? 0 : Math.min(KD, cz - eff);
        const sp = E.cubicInOut(inv(T.sys + 0.35, T.kArrive - 0.15, t));
        return { x: lerp(CELLX(i), KX(i), sp), y: HY, d, a, text, sc, blur, box };
      }
      if (t < DEP(i)) {
        const cnt = bump(t, T.fourteen + 0.03 * i, 0.05, 6);
        return { x: KX(i), y: HY, d: KD - 30 * cnt, a, text, sc: sc * (1 + 0.2 * cnt), blur, box };
      }
      if (t < TA(i)) { // along fd 1 to the pty
        const u = inv(DEP(i), TA(i), t);
        x = lerp(KX(i), TUNX + 95 * Math.cos(theta(i, KD)), E.cubicInOut(u));
        y = lerp(HY, axisY(KD) + 95 * Math.sin(theta(i, KD)), E.cubicInOut(sstep(0.7, 1, u)));
        return { x, y, d: KD - 40 * Math.sin(Math.PI * Math.min(1, u * 3)), a, text, sc, blur, box };
      }
      if (t < TM(i)) { // up the tunnel, spiralling
        const u = E.cubicInOut(inv(TA(i), TM(i), t));
        d = lerp(KD, TD, u);
        const th = theta(i, d);
        return { x: TUNX + 95 * Math.cos(th), y: axisY(d) + 95 * Math.sin(th), d, a, text, sc, blur, box };
      }
      // look it up in the font
      const u = E.cubicInOut(inv(TM(i), TM(i) + 0.3, t));
      const th = theta(i, TD);
      const sx = TUNX + 95 * Math.cos(th), sy = MOUTH_Y + 95 * Math.sin(th);
      box *= 1 - u;
      if (i === 13) { // a newline has no glyph: the cursor drops to the next line
        x = lerp(sx, ROW_L + 13 * 72 + 40, u); y = lerp(sy, ROW_Y + 90, u);
        return { x, y, d: lerp(TD, GD, u), a: 1 - sstep(0.6, 1, u), text, sc, blur, box };
      }
      const g = glyphPos(i);
      return { x: lerp(sx, g.x, u), y: lerp(sy, g.y, u), d: TD, a: 1 - sstep(TM(i) + 0.26, TM(i) + 0.36, t), text, sc, blur, box };
    }

    // ------------------------------------------------------------------ hero: only for the last carry (pixels → page)
    const H0 = T.pixels + 0.32, H1 = T.swap + 0.2;
    ctx.hero((t) => {
      if (t < H0 || t >= H1) return null;
      const L = ctx.project(ROW_L, ROW_Y, GD, t);
      const u = inv(T.pixels + 0.5, T.land, t);
      const c = tw(T.pixels + 0.75, T.land, t, "cubicInOut");
      return {
        text: STR, x: lerp(L.x, 520, E.cubicInOut(u)), y: lerp(L.y, 807, E.cubicOut(u)), size: lerp(120 * L.s, 32, E.cubicInOut(u)), anchor: 0,
        color: OT.mix([255, 251, 242], [162, 106, 5], c), glow: 1 - c,
        opacity: sstep(H0, H0 + 0.12, t) * (1 - sstep(T.swap, T.swap + 0.16, t)), weight: 700,
      };
    });

    // ------------------------------------------------------------------ render
    const NEAR = [430, 820], FAR = [-2600, -1400];
    ctx.render((t) => {
      const live = t >= t0 && t < t1;
      const cam = ctx.camAt(t);
      const fog = (d, near = NEAR, far = FAR) => { const eff = cam.z - d; return sstep(far[0], far[1], eff) * (1 - sstep(near[0], near[1], eff)); };
      const show = (e, a) => { ctx.show(e, live ? a : 0); return live && a >= 0.002; };

      // ---------------------------------------------------------------- the address space
      const diveOut = t > T.dive0 && t < T.rise0 ? 1 - sstep(T.dive0 + 0.1, T.dive0 + 0.5, t) : 1;
      show(memP, t < T.cross + 0.9 ? fog(0) * diveOut : 0);
      mem.bands.text.el.classList.toggle("promised", t < T.slot);
      mem.bands.rodata.el.classList.toggle("promised", t < T.copies - 0.25);
      mem.bands.data.el.classList.toggle("promised", t < T.prepares);
      {
        const shimmer = win(t, T.memory - 0.1, T.memory + 0.25, T.promised + 0.9, T.promised + 1.5);
        ["text", "rodata", "data"].forEach((n, i) => {
          const f = shimmer * (0.5 + 0.5 * Math.sin(t * 23 + i * 2.1)) * (0.55 + 0.45 * Math.sin(t * 7.3 + i));
          let o = 1 - 0.7 * f;
          if (n === "text") o *= 1 - 0.8 * win(t, T.contact - 0.04, T.contact + 0.03, T.contact + 0.3, T.contact + 0.9);
          mem.bands[n].el.style.opacity = o >= 0.999 ? "" : f3(o);
        });
        const g = Math.max(bump(t, T.slot, 0.08, 2.4), 0.9 * bump(t, T.floor, 0.05, 2.2), 0.3 * win(t, T.floor, T.floor + 0.4, T.us, T.dive1));
        mem.bands.text.el.style.boxShadow = g > 0.01 ? `0 0 ${(14 + 46 * g).toFixed(1)}px rgba(143,224,255,${f3(0.8 * g)}), inset 0 0 ${(24 * g).toFixed(1)}px rgba(143,224,255,${f3(0.45 * g)})` : "";
        const hiM = win(t, T.mainA - 0.05, T.mainA + 0.1, T.mainA + 0.45, T.mainA + 0.8), dimM = sstep(T.mainA + 0.45, T.mainA + 0.9, t) * (1 - sstep(T.dive1, T.dive1 + 0.1, t));
        lblMain.style.color = hiM > 0.01 ? "#ffffff" : "";
        lblMain.style.textShadow = hiM > 0.01 ? `0 0 ${(18 * hiM).toFixed(1)}px rgba(200,240,255,${f3(0.9 * hiM)})` : "";
        lblMain.style.opacity = dimM > 0.001 ? f3(1 - 0.65 * dimM) : "";
        const hiS = sstep(T.us - 0.12, T.us + 0.15, t) * (1 - sstep(T.dive1, T.dive1 + 0.1, t));
        lblStart.style.color = hiS > 0.01 ? "#ffffff" : "";
        lblStart.style.textShadow = hiS > 0.01 ? `0 0 ${(22 * hiS).toFixed(1)}px rgba(143,224,255,${f3(hiS)})` : "";
        // the string's address docks on .rodata's address
        const ra = win(t, T.rise1 - 0.08, T.rise1 + 0.05, T.copies + 0.9, T.copies + 1.4);
        roAddr.style.color = ra > 0.01 ? OT.rgb(OT.mix([220, 210, 255], [255, 197, 77], ra)) : "";
        roAddr.style.textShadow = ra > 0.01 ? `0 0 ${(16 * ra).toFixed(1)}px rgba(255,190,70,${f3(0.85 * ra)})` : "";
      }
      // buffer cells + label + reaching thread
      {
        const ca = win(t, T.putsB - 0.35, T.copies, T.sys + 0.3, T.sys + 0.6);
        cells.forEach((c, i) => {
          const filled = i < 13 ? sstep(T.copies + 0.075 * i + 0.34, T.copies + 0.075 * i + 0.42, t) : sstep(T.newline + 0.04, T.newline + 0.12, t);
          const emptied = sstep(T.sys + 0.02 * i, T.sys + 0.15 + 0.02 * i, t);
          op(c, ca);
          c.style.borderColor = `rgba(255,${Math.round(lerp(220, 205, filled))},${Math.round(lerp(170, 110, filled))},${f3(0.45 + 0.4 * filled * (1 - emptied))})`;
          c.style.boxShadow = filled * (1 - emptied) > 0.01 ? `0 0 14px rgba(255,190,70,${f3(0.35 * filled * (1 - emptied))})` : "none";
        });
        op(bufLab, ca);
        const reach = tw(T.touch - 0.15, T.screen + 0.05, t, "cubicOut") * (1 - tw(T.screen + 0.2, T.directly + 0.35, t, "cubicIn"));
        op(thread, reach > 0.004 ? 1 : 0);
        thread.style.transform = `scaleX(${f3(reach)})`;
      }

      // ---------------------------------------------------------------- rip
      {
        const s = live ? ripAt(t) : null;
        if (s && show(ptr, s.a * fog(s.d, [480, 860], [-2800, -1500]))) {
          put(ptr, s.x, s.y, s.d, `rotate(${s.rot.toFixed(2)}deg) scale(${f3(s.sc)})`);
          op(ptrLab, s.lab * (1 - sstep(T.pageA, T.fault, t) * (1 - sstep(T.tryB, T.tryB + 0.3, t))));
          ptrLab.style.transform = `rotate(${(-s.rot).toFixed(2)}deg)`;
          op(ptrPF, win(t, T.pageA - 0.05, T.fault, T.catchT + 0.2, T.catchT + 0.6) * (0.75 + 0.25 * Math.sin(t * 30)));
          ptrPF.style.transform = `rotate(${(-s.rot).toFixed(2)}deg)`;
          const hot = Math.max(bump(t, T.tryB, 0.02, 3), bump(t, T.floor, 0.02, 2.5), bump(t, T.catchT, 0.02, 2.5));
          ptrHalo.style.transform = `scale(${f3(1 + 0.8 * hot)})`;
          op(ptrHalo, 0.8 + 0.2 * hot);
        } else ctx.show(ptr, 0);
      }

      // ---------------------------------------------------------------- membrane / net
      {
        const sA = win(t, T.kern1 - 0.5, T.promised + 0.1, T.slot + 0.2, T.slot + 1.0);
        const sB = win(t, T.soB - 0.4, T.instr, T.app - 0.5, T.app);
        const cacheView = win(t, T.finds, T.finds + 0.4, T.maps, T.maps + 0.3);
        const gridA = sA * lerp(0.26, 1, sstep(T.nothing, T.catchT, t)) * (1 - 0.5 * cacheView) + sB * lerp(0.3, 1, sstep(T.sys, T.cross, t));
        const glowA = sA * (0.42 + 0.12 * Math.sin(t * 2.6) * (1 - sstep(T.nothing, T.fault, t)) + 0.35 * bump(t, T.kern1 + 0.25, 0.3, 1.6) + 0.6 * bump(t, T.catchT, 0.6, 1.4) - 0.25 * cacheView)
          + sB * (0.55 + 0.45 * bump(t, T.cross, 0.25, 1.6));
        const vis = Math.max(gridA, glowA);
        if (show(memb, vis > 0.002 ? fog(MD, [430, 820], [-3300, -1900]) : 0)) {
          put(memb, MEMB.x, MEMB.y, MD, CEN);
          op(membGrid, gridA);
          op(membGlow, glowA);
          op(membSys, clamp(gridA) * 0.85);
        }
        // ripples: the catch, then the syscall's impact
        const RIPL = [[T.contact, PH.x, PH.y, 0, 0.42, 0.45], [T.catchT, PH.x, PH.y, MD, 1.15, 1], [T.floor + 0.02, PH.x, PH.y, 0, 0.55, 0.7], [T.cross, 961, HY, MD, 1.6, 1]];
        rings.forEach((r, k) => {
          let on = false;
          RIPL.forEach(([ts, x, y, d, smax, amax]) => {
            const age = t - ts - 0.11 * k;
            if (age > 0 && age < 1.7) {
              const u = age / 1.7;
              const s = 0.04 + smax * E.cubicOut(u);
              const nf = d === MD ? [430, 820] : NEAR, ff = d === MD ? [-3300, -1900] : FAR;
              if (show(r, amax * Math.pow(1 - u, 1.6) * fog(d, nf, ff))) put(r, x, y, d, `${CEN} scale(${f3(s)})`);
              on = true;
            }
          });
          if (!on) ctx.show(r, 0);
        });
        const sp = Math.max(bump(t, T.catchT, 0.05, 2.2), bump(t, T.cross, 0.03, 2.4));
        if (show(spot, sp * fog(MD, [430, 820], [-3300, -1900]))) put(spot, t < T.sys ? PH.x : 961, t < T.sys ? PH.y : HY, MD, CEN);
      }

      // ---------------------------------------------------------------- page cache, the found page, the disk
      {
        const diskOn = win(t, T.disk - 0.45, T.disk - 0.05, T.maps + 0.05, T.maps + 0.4);
        const cA = win(t, T.finds - 0.6, T.finds + 0.15, T.maps + 0.15, T.maps + 0.55) * (1 - 0.55 * diskOn);
        const lit = sstep(T.pageB - 0.05, T.pageB + 0.15, t);
        const by = lerp(TY - 950, FY, tw(T.finds - 0.15, T.pageB + 0.02, t, "cubicInOut"));
        if (show(cacheP, cA * fog(CD, NEAR, [-2400, -1100]))) {
          const beamA = 1 - 0.85 * lit;
          op(beam, beamA);
          beam.style.transform = `translate(${-2600 + 960}px, ${(by - 130).toFixed(1)}px)`;
          tiles.forEach((tl) => {
            const b = Math.exp(-Math.pow((tl.y - by) / 120, 2)) * beamA;
            tl.e.style.borderColor = `rgba(150,225,255,${f3(0.28 + 0.5 * b)})`;
            tl.e.style.backgroundColor = `rgba(120,200,255,${f3(0.03 + 0.1 * b)})`;
          });
        }
        // the found page: lit, lifted up through the net, carried up and slotted into .text
        let fx = FX, fy = FY, fd = CD;
        if (t >= T.pageB - 0.05) {
          const u = tw(T.pageB - 0.05, T.pageB + 0.6, t, "cubicInOut");
          fx = lerp(FX, LIFT.x, u); fy = lerp(FY, LIFT.y, u); fd = lerp(CD, LIFT_D, u);
        }
        if (t >= T.maps) {
          if (zMaps === null) zMaps = camZ(T.maps);
          const u = tw(T.maps, T.slot, t, "cubicInOut");
          const eff = lerp(zMaps - LIFT_D, 300, u);
          fd = t >= T.slot ? 0 : camZ(t) - eff;
          fx = lerp(LIFT.x, 960, u); fy = lerp(LIFT.y, TY, u);
        }
        const fA = win(t, T.finds - 0.6, T.finds + 0.15, T.slot + 0.05, T.slot + 0.55);
        if (show(ftile, fA * fog(fd, NEAR, [-2400, -1100]))) {
          const scanB = Math.exp(-Math.pow((FY - by) / 120, 2)) * (1 - lit);
          const pulse = bump(t, T.cache, 0.05, 2.5);
          put(ftile, fx, fy, fd, `${CEN} scale(${f3(1 + 0.05 * pulse)})`);
          ftile.style.borderColor = `rgba(${Math.round(lerp(150, 215, lit))},${Math.round(lerp(225, 248, lit))},255,${f3(0.28 + 0.5 * scanB + 0.67 * lit)})`;
          ftile.style.backgroundColor = `rgba(120,200,255,${f3(0.03 + 0.1 * scanB + 0.13 * lit)})`;
          ftile.style.boxShadow = lit > 0.01 ? `0 0 ${(30 + 40 * pulse).toFixed(1)}px rgba(143,224,255,${f3(0.5 * lit)})` : "none";
          ftileIn.forEach((c) => op(c, lit * (1 - sstep(T.slot - 0.38, T.slot - 0.08, t))));
        }
        // ...or on the disk: the executable glows far beneath the cache
        const dA = win(t, T.finds - 0.3, T.cache, T.maps, T.maps + 0.4) * (0.3 + 0.7 * diskOn);
        const sFog = fog(DD, NEAR, [-2600, -1100]);
        if (show(slabW, dA * sFog)) put(slabW, SLAB.x, SLAB.y, DD, `${CEN} scale(${SLAB.s})`);
        if (show(slabHalo, dA * diskOn * sFog)) put(slabHalo, SLAB.x, SLAB.y, DD, `${CEN} scale(${f3(1 + 0.15 * diskOn)})`);
      }

      // ---------------------------------------------------------------- inside .text
      {
        const lA = win(t, T.dive0 + 0.2, T.dive0 + 0.6, T.plunge0 + 0.25, T.plunge0 + 0.6);
        if (show(lstP, lA * fog(LD))) {
          const kf = Math.max(0, (t - T.startup) / T.stepDt);
          const cur = t < T.startup ? 1 : Math.min(12, 1 + Math.floor(kf));
          const onStart = t < T.calls;
          const focusMain = sstep(T.calls - 0.1, T.mainB, t);
          startCode.rows.forEach((r, i) => {
            const base = i === 0 ? 0.85 : 0.42;
            const o = onStart && i === cur && t >= T.dive1 - 0.2 ? 1 : base;
            op(r, o * (1 - 0.8 * focusMain));
          });
          const mCur = t >= T.mainB ? 1 : -1;
          mainCode.rows.forEach((r, i) => op(r, i === mCur ? 1 : lerp(0.28, i === 0 ? 0.95 : 0.55, focusMain)));
          op(main50, 1 - sstep(T.plunge0, T.plunge0 + 0.08, t));
          op(hlS, onStart ? sstep(T.dive1 - 0.3, T.dive1, t) : 0);
          hlS.style.top = rowS(cur) - LLH / 2 + "px";
          op(hlM, sstep(T.mainB - 0.05, T.mainB + 0.15, t));
          hlM.style.top = rowM(1) - LLH / 2 + "px";
          const lib = win(t, T.prepares + 0.2, T.cLib, T.calls, T.calls + 0.5);
          libcSpan.style.textShadow = lib > 0.01 ? `0 0 ${(20 * lib).toFixed(1)}px rgba(205,236,255,${f3(lib)})` : "";
          op(libcGlow, lib);
          op(libcLab, lib);
        }
      }

      // ---------------------------------------------------------------- silicon
      {
        const sA = win(t, T.plunge0 + 0.25, T.plunge1 - 0.25, T.rise0 + 0.35, T.rise0 + 0.8);
        const siA = sA * fog(SD, NEAR, [-3300, -1700]);
        const b0 = T.billions;
        const bx = clamp(t - b0, 0, 1.9);
        const phi = 1.5 * bx + 1.75 * bx * bx;
        const env = win(t, b0 - 0.1, b0 + 0.25, T.load - 0.35, T.load + 0.05);
        // the three instructions we follow through the gates
        const CH3 = [
          { tA: T.plunge0, f: T.plunge1, dd: T.decodes - 0.12, ee: T.executes - 0.18, x: T.executes + 0.35 },
          { tA: T.load - 0.45, f: T.load + 0.02, dd: T.load + 0.26, ee: T.address - 0.36, x: T.address + 0.25 },
          { tA: T.call - 0.75, f: T.call - 0.28, dd: T.call - 0.02, ee: T.putsA + 0.04, x: T.putsA + 0.38 },
        ];
        const gateGlow = [0, 0, 0];
        CH3.forEach((c, k) => {
          const e = chips[k];
          if (!live || t < c.tA || t > c.x + 0.45) { ctx.show(e, 0); return; }
          let x, y = 900, d = SD, a = siA;
          if (k === 0 && t < c.f) { // fell with us from main's first row
            const u = tw(T.plunge0, T.plunge1, t, "cubicInOut");
            x = lerp(ML + 4 * LCW + LCW, GATES[0].x, u); y = lerp(rowM(1), 900, u); d = camZ(t); a = 1;
          } else if (t < c.f) {
            const u = E.cubicOut(inv(c.tA, c.f, t));
            x = lerp(GATES[0].x - 460, GATES[0].x, u); a *= sstep(c.tA, c.tA + 0.15, t);
          } else if (t < c.dd) x = GATES[0].x;
          else if (t < c.ee) x = lerp(GATES[0].x, GATES[1].x, E.expoOut(inv(c.dd, c.dd + 0.2, t)));
          else if (t < c.x) x = lerp(GATES[1].x, GATES[2].x, E.expoOut(inv(c.ee, c.ee + 0.18, t)));
          else { x = lerp(GATES[2].x, GATES[2].x + 460, E.cubicIn(inv(c.x, c.x + 0.45, t))); a *= 1 - sstep(c.x + 0.1, c.x + 0.45, t); }
          setText(e, OT.scramble(CHIPS[k].b, CHIPS[k].m, inv(c.dd + 0.05, c.dd + 0.33, t), t, 21 + k));
          const exe = bump(t, c.ee + 0.18, 0.04, 4);
          e.style.color = k === 1 && t > c.ee + 0.1 ? "#ffe2a0" : "";
          if (show(e, a)) put(e, x, y, d, `${CEN} scale(${f3(1 + 0.12 * exe)})`);
          if (d === SD) GATES.forEach((g, gi) => { gateGlow[gi] = Math.max(gateGlow[gi], clamp(1 - Math.abs(x - g.x) / 240)); });
          gateGlow[2] = Math.max(gateGlow[2], exe);
        });
        if (show(siP, siA)) {
          heat.setAttribute("opacity", f3(0.3 + 0.7 * sstep(T.plunge1, T.second, t) * (1 - 0.3 * sstep(T.load, T.rise0, t))));
          pulses.forEach(({ p, ph }) => p.setAttribute("stroke-dashoffset", (-((t * 700 + 900 * phi + ph * 400) % 400)).toFixed(1)));
          cores2.forEach((c, i) => {
            const g = env * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(2 * Math.PI * (phi * 2 + i * 0.27))));
            c.style.fillOpacity = f3(0.06 + 0.42 * g); c.style.strokeOpacity = f3(0.55 + 0.45 * g);
          });
          GATES.forEach((g, gi) => {
            const strobe = env * (0.5 + 0.5 * Math.cos(2 * Math.PI * (phi * 3 - gi / 3)));
            const v = clamp(Math.max(gateGlow[gi], 0.85 * strobe));
            g.e.style.background = `rgba(255,${Math.round(lerp(110, 170, v))},${Math.round(lerp(40, 90, v))},${f3(0.06 + 0.3 * v)})`;
            g.e.style.borderColor = `rgba(255,${Math.round(lerp(150, 225, v))},${Math.round(lerp(80, 170, v))},${f3(0.75 + 0.25 * v)})`;
            g.e.style.boxShadow = v > 0.01 ? `0 0 ${(20 + 50 * v).toFixed(1)}px rgba(255,150,60,${f3(0.7 * v)})` : "none";
          });
          // registers: rdi holds argc until lea loads the string's address; rip follows the instructions
          const rdiGold = t >= T.address - 0.2;
          setText(RDI.v, rdiGold ? OT.scramble("1", "0x555555556004", inv(T.address - 0.2, T.address + 0.02, t), t, 41) : "1");
          RDI.v.style.color = rdiGold ? "#ffc54d" : "";
          RDI.v.style.textShadow = rdiGold ? "0 0 16px rgba(255,190,70,.85)" : "";
          const rg = bump(t, T.address - 0.02, 0.04, 1.6);
          RDI.e.style.borderColor = rdiGold ? `rgba(255,197,77,${f3(0.6 + 0.4 * rg)})` : "";
          RDI.e.style.boxShadow = rg > 0.01 ? `0 0 ${(20 + 40 * rg).toFixed(1)}px rgba(255,190,70,${f3(0.6 * rg)})` : "none";
          let rv = "0x555555555140";
          if (t >= CH3[1].f) rv = "0x555555555141";
          if (t >= CH3[2].f) rv = "0x555555555148";
          if (t >= CH3[2].ee + 0.18) rv = OT.scramble("0x555555555148", "0x555555555030", inv(CH3[2].ee + 0.18, CH3[2].ee + 0.45, t), t, 43);
          setText(RIP.v, rv);
          const pg = Math.max(bump(t, T.plunge1 + 0.4, 0.1, 3), bump(t, CH3[2].ee + 0.2, 0.04, 3));
          RIP.e.style.boxShadow = pg > 0.01 ? `0 0 ${(20 + 40 * pg).toFixed(1)}px rgba(143,224,255,${f3(0.7 * pg)})` : "none";
          crings.forEach((r, k) => {
            const ph = (((phi + k / 3) % 1) + 1) % 1;
            op(r, env * Math.pow(1 - ph, 1.3));
            r.style.transform = `translate3d(${MX}px, ${SY}px, 0px) ${CEN} scale(${f3(0.25 + ph * 2.8)})`;
          });
        }
        // the string's address rises with us from rdi to .rodata
        const aU = inv(T.rise0 - 0.05, T.rise1, t);
        const aA = live ? win(t, T.rise0 - 0.2, T.rise0, T.rise1, T.rise1 + 0.3) : 0;
        if (show(addrFly, aA)) {
          const u = E.cubicInOut(aU);
          const d = t < T.rise0 - 0.05 ? SD : t >= T.rise1 ? 0 : camZ(t) - lerp(0, 380, u);
          put(addrFly, lerp(RDI.x + 110, 549, u), lerp(RDI.y, RY, u), d, `${CEN} scale(${f3(lerp(1, 17 / 26, u))})`);
        }
      }

      // ---------------------------------------------------------------- the string: copies, newline, drop, bytes, pty, font
      chs.forEach((e, i) => {
        const s = live ? chAt(i, t) : null;
        if (!s) { ctx.show(e, 0); return; }
        const a = s.a * fog(s.d, s.nl ? [640, 960] : [500, 880], [-2800, -1500]);
        if (!show(e, a)) return;
        setText(e, s.text);
        const cnt = bump(t, T.fourteen + 0.03 * i, 0.05, 5);
        put(e, s.x, s.y, s.d, `${CEN} scale(${f3(s.sc)})`);
        e.style.filter = s.blur > 0.05 ? `blur(${s.blur.toFixed(2)}px)` : "none";
        e.style.borderColor = s.box > 0.01 ? `rgba(255,205,110,${f3(0.6 * s.box + 0.35 * cnt)})` : "transparent";
        e.style.backgroundColor = s.box > 0.01 ? `rgba(255,190,70,${f3(0.07 * s.box + 0.12 * cnt)})` : "transparent";
        if (i === 13) {
          const hot = Math.max(bump(t, T.newline + 0.1, 0.05, 1.2), 0.6 * win(t, T.took - 0.2, T.took, T.away + 0.4, T.but));
          e.style.textShadow = `0 0 ${(12 + 16 * hot).toFixed(1)}px rgba(255,195,80,${f3(0.7 + 0.3 * hot)}), 0 0 ${(30 + 24 * hot).toFixed(1)}px rgba(255,180,60,${f3(0.35 + 0.35 * hot)})`;
        } else e.style.textShadow = cnt > 0.02 ? `0 0 ${(12 + 20 * cnt).toFixed(1)}px rgba(255,210,120,${f3(0.65 + 0.35 * cnt)})` : "";
      });
      // our process's wall, the bump, the syscall instruction
      {
        const pA = win(t, T.but - 0.1, T.touch - 0.2, T.instr - 0.5, T.instr + 0.1);
        if (show(procCell, pA * fog(0))) put(procCell, 930, 640, 0, CEN);
        const bA = bump(t, T.screen + 0.03, 0.06, 2.2) * pA;
        if (show(bumpEl, bA * fog(0))) put(bumpEl, RIMX, HY, 0, `${CEN} scale(${f3(0.6 + 0.5 * bA)})`);
        const yA = win(t, T.special - 0.15, T.special + 0.15, T.sys + 0.2, T.sys + 0.45);
        if (show(sysl, yA * fog(0))) put(sysl, 961, HY - 72, 0, `${CEN} scale(${f3(1 + 0.12 * bump(t, T.instr + 0.05, 0.08, 2.5))})`);
      }

      // ---------------------------------------------------------------- kernel: ring 0, the syscall table, write(1, buf, 14), fd 1, the pty tunnel
      {
        const kA = win(t, T.cross + 0.5, T.kArrive - 0.1, T.output + 0.3, T.output + 0.8) * fog(KD);
        if (show(klab, kA)) {
          put(klab, 961, HY - 96, KD, CEN);
          if (t < T.writes) {
            const sw = inv(T.switches, T.switches + 0.32, t);
            setText(kparts[0], OT.scramble("ring 3", "ring 0", sw, t, 51));
            ["", "", "", ""].forEach((s, j) => setText(kparts[j + 1], s));
            const r0 = sstep(T.switches + 0.1, T.switches + 0.35, t);
            kparts[0].style.opacity = f3(0.55 + 0.45 * r0);
            kparts[0].style.color = r0 > 0.5 ? "#ffffff" : "";
            kparts[0].style.textShadow = r0 > 0.01 ? `0 0 ${(10 + 20 * bump(t, T.kmode + 0.1, 0.3, 1.2)).toFixed(1)}px rgba(170,235,255,${f3(0.5 + 0.5 * r0)})` : "";
          } else {
            const u = inv(T.writes, T.writes + 0.3, t);
            kparts[0].style.opacity = ""; kparts[0].style.color = ""; kparts[0].style.textShadow = "";
            if (u < 1) { setText(kparts[0], OT.scramble("ring 0", "write(1, buf, 14)", u, t, 53)); ["", "", "", ""].forEach((s, j) => setText(kparts[j + 1], s)); }
            else { setText(kparts[0], "write("); setText(kparts[1], "1"); setText(kparts[2], ", buf, "); setText(kparts[3], "14"); setText(kparts[4], ")"); }
            const h14 = win(t, T.fourteen - 0.05, T.fourteen + 0.1, T.bytes + 0.3, T.bytes + 0.6), h1 = win(t, T.standard - 0.05, T.standard + 0.1, T.output + 0.4, T.output + 0.7);
            kparts[3].style.color = h14 > 0.02 ? "#ffffff" : ""; kparts[3].style.textShadow = h14 > 0.02 ? `0 0 ${(20 * h14).toFixed(1)}px rgba(200,245,255,${f3(h14)})` : "";
            kparts[1].style.color = h1 > 0.02 ? "#ffffff" : ""; kparts[1].style.textShadow = h1 > 0.02 ? `0 0 ${(20 * h1).toFixed(1)}px rgba(200,245,255,${f3(h1)})` : "";
          }
        }
        // sys_call_table: rax = 1 → write
        const tbA = win(t, T.kmode - 0.2, T.kmode + 0.3, T.standard + 0.2, T.output + 0.4) * fog(KD);
        if (show(stab, tbA)) {
          put(stab, STAB.x, STAB.y, KD);
          const wl = sstep(T.writes - 0.15, T.writes + 0.05, t);
          stabWrite.style.color = wl > 0.01 ? OT.rgb(OT.mix([160, 220, 255], [255, 255, 255], wl)) : "";
          stabWrite.style.textShadow = wl > 0.01 ? `0 0 ${(16 * wl).toFixed(1)}px rgba(170,235,255,${f3(wl)})` : "";
        }
        const rA = win(t, T.writes, T.standard - 0.2, T.pseudo + 0.4, T.app - 0.3) * fog(KD, NEAR, [-3000, -1600]);
        if (show(rail, rA)) { put(rail, RAIL0, HY - 2, KD); rail.style.width = TUNX - 150 - RAIL0 + "px"; }
        if (show(fdLab, rA * win(t, T.standard - 0.2, T.standard + 0.1, T.pseudo, T.pseudo + 0.4))) put(fdLab, RAIL0 + 10, HY - 38, KD);
        const tA = win(t, T.standard, T.output + 0.2, T.app + 0.4, T.app + 0.9);
        const passD = [];
        for (let i = 0; i < 14; i++) if (t > TA(i) && t < TM(i)) passD.push(lerp(KD, TD, E.cubicInOut(inv(TA(i), TM(i), t))));
        TRING_D.forEach((d, k) => {
          let passing = 0;
          passD.forEach((pd) => { passing = Math.max(passing, Math.exp(-Math.pow((pd - d) / 160, 2))); });
          if (show(trings[k], tA * fog(d, [480, 860], [-3000, -1600]) * (0.55 + 0.45 * passing))) put(trings[k], TUNX, axisY(d), d, `${CEN} scale(${f3(1 + 0.12 * passing)})`);
        });
        if (show(portRing, tA * fog(MD, [480, 860], [-3000, -1600]))) put(portRing, TUNX, axisY(MD), MD, `${CEN} scale(1.15)`);
        if (show(ptyLab, tA * win(t, T.output, T.pseudo - 0.1, T.terminal, T.app) * fog(KD, NEAR, [-3000, -1600]))) put(ptyLab, TUNX + 175, axisY(KD) - 20, KD);
      }

      // ---------------------------------------------------------------- the terminal app: font, glyphs, pixels
      {
        const cA = Math.max(win(t, T.but - 0.1, T.touch - 0.2, T.instr - 0.3, T.instr + 0.3), win(t, T.pseudo + 0.2, T.terminal, T.pixels + 0.25, T.pixels + 0.55));
        if (show(tcell, cA * fog(TD))) put(tcell, TCELL.x, TCELL.y, TD, CEN);
        op(miniEl, (1 - sstep(T.instr, T.pseudo, t)) * (Math.floor(t * 1.9) % 2 === 0 ? 1 : 0.85));
        const shA = cA * (0.55 + 0.45 * sstep(T.app - 0.3, T.app, t));
        if (show(sheet, shA * fog(TD))) put(sheet, SHL, SHT, TD);
        // the lookup marker visits each glyph
        let lk = -1;
        for (let i = 0; i < 13; i++) if (t >= TM(i) + 0.18 && t < TM(i) + 0.5) lk = i;
        if (lk >= 0 && show(look, cA * fog(TD) * (1 - sstep(TM(lk) + 0.38, TM(lk) + 0.5, t)))) {
          const g = glyphPos(lk); put(look, g.x, g.y, TD, CEN);
        } else ctx.show(look, 0);
        const paint = tw(T.paints, T.paints + 0.5, t, "lin");
        const lit = sstep(T.pixels - 0.1, T.pixels + 0.3, t);
        const gone = sstep(T.pixels + 0.4, T.pixels + 0.58, t);
        glys.forEach((g, i) => {
          const l0 = TM(i) + 0.3;
          if (!live || t < l0 || STR[i] === " ") { ctx.show(g, 0); return; }
          const u = E.cubicInOut(inv(l0, l0 + 0.42, t));
          const p = glyphPos(i);
          const x = lerp(p.x, rowX(i), u), y = lerp(p.y, ROW_Y, u), d = lerp(TD, GD, u);
          if (show(g, (1 - gone) * fog(d) * sstep(l0, l0 + 0.05, t))) {
            put(g, x, y, d, `${CEN} scale(${f3(lerp(34 / 120, 1, u))})`);
            const land = bump(t, l0 + 0.42, 0.05, 4);
            g.style.webkitTextStroke = `${(2.5 + 1.5 * land).toFixed(2)}px ${OT.rgb(OT.mix([255, 197, 77], [255, 250, 235], Math.max(land * 0.6, lit)))}`;
            g.style.textShadow = `0 0 ${(14 + 20 * land + 30 * lit).toFixed(1)}px rgba(255,200,90,${f3(0.35 + 0.4 * land + 0.4 * lit)})`;
          }
        });
        if (show(pixRow, paint > 0.001 ? (1 - gone) * fog(GD) : 0)) {
          put(pixRow, ROW_L, ROW_Y - 60, GD);
          pixRow.style.clipPath = `inset(0px 0px ${((1 - paint) * 100).toFixed(2)}% 0px)`;
          pixRow.style.color = OT.rgb(OT.mix([255, 214, 120], [255, 255, 250], lit));
        }
        const bloom = E.quadIn(inv(T.pixels + 0.02, T.pixels + 0.48, t));
        if (show(pglow, Math.max(0.35 * paint, lit) * (1 - sstep(T.pixels + 0.55, T.pixels + 0.8, t)) * fog(GD))) put(pglow, TUNX, ROW_Y, GD + 20, `${CEN} scale(${f3(0.8 + 0.5 * lit + 6 * bloom)})`);
      }

      // ---------------------------------------------------------------- baton 6
      show(pageP, t >= T.pixels + 0.3 ? fog(PAGE_D, [430, 820], [-3000, -1500]) : 0);
      page.tlines[1].style.opacity = t >= T.swap ? "" : "0";
    });
  },
});
