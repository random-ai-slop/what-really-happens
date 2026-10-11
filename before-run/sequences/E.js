/* E — Install and set up · s18 s19 s20 s21 s22 (247.11 → 326.03; s21 kept).
 *
 * The gold line of packets (baton 3) turns clear: the bytes are plain HTTP. It lifts through the membrane into user
 * space and rolls up into the parcel; Ubuntu's seal lands on it. One held framing — parcel, index, signature, key —
 * led by the lamp (#1): the parcel's fingerprint, the same fingerprint in the index, the signature over the index, the
 * key that was on the disk all along. The parcel opens like a pop-up book (an archive inside an archive), dpkg lifts
 * the files out and they settle into a wall of drawers next to drawers that were already full; a thread drops from
 * libllvm21 to the GPU. A burst up to the surface: the terminal, `clang` typed, the shell walks the PATH (a vertical
 * stack of doors) to /usr/bin/clang; the error message. s21: the file's first bytes; behind it, in depth, the compiler
 * that compiled it; a dive down a hall of ever coarser programs to a front panel where one switch is flipped by hand;
 * a whip back up to the desktop. s22: a click on { }, fork / exec / loader seen through the wallpaper (lens #2), the
 * compositor's dashed slot, the editor unfolds out of its dock icon and we push into the blank page; the Run pill's
 * saved command.
 *
 * Batons:  entry 3 — OT.C.seqline(ctx.plane(0)) left 243 top 628, camera {960, 640, 0}, #070c1c, sparks, no hero.
 *          exit 4  — OT.C.editor on ctx.plane(D_DESK) blank (typed 0, lines 1, ink caret with A's blink, chrome 0,
 *                    hover 0, fold 0, pointer hidden), camera {960, 640, D_DESK}, #efeae0, dust. The desktop, the
 *                    saved command and its thread are gone by t1 − 0.05.
 * Facts: every apt value from OT.FACTS.apt (PENDING the desktop capture); the rest from STORYBOARD § c (constants
 * below). Light/focus: lamp #1 (s18), lens #2 (s22). */
(function () {
  // ⚠ PENDING verification (STORYBOARD § c): what `clang` prints with no input. Swap this one line if the coordinator's
  // check disagrees (fallback named by the storyboard: the captured `debconf: unable to initialize frontend: Dialog`).
  const NO_INPUT = "clang: error: no input files";
  // STORYBOARD § c (real, not pending)
  const PATH = "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin";
  const FOUND = "/usr/bin";                                               // the first PATH folder that has clang
  const CHAIN = ["/clang → clang-21 → ", "../lib/llvm-21/bin/clang"];    // /usr/bin/clang -> clang-21 -> ../lib/llvm-21/bin/clang
  const BINARY = "/usr/lib/llvm-21/bin/clang";                           // readlink -f, owned by clang-21
  const ELF = "7F 45 4C 46";                                              // every ELF file starts with these bytes
  const KEY_FILE = "ubuntu-archive-keyring.gpg";
  const KEY_FPR = "F6EC B376 2474 EDA9 D21B 7022 8719 20D1 991B C93C";
  const ISSUER = "9uyzdiR07anSG3Aihxkg0ZkbyTw";                           // the signature's issuer bytes = the key's fingerprint
  const INREL = [                                                         // InRelease (resolute), verbatim lines; … = elided
    ["-----BEGIN PGP SIGNED MESSAGE-----", 1], ["Hash: SHA512"], ["Origin: Ubuntu"], ["Label: Ubuntu"], ["Suite: resolute"],
    ["Version: 26.04"], ["Codename: resolute"], ["…"], ["-----BEGIN PGP SIGNATURE-----", 1],
    ["iQIzBAEBCgAdFiEE9uyzdiR07anSG3Aihxkg0ZkbyTwFAmnqUdIACgkQhxkg0Zkb"], ["yTym3hAAz/kLdTkCpSeoyXlsVoxA8s8RmNiCOx8fW2ho7IUuxq2imGFFvHSE89iG"],
    ["…"], ["=JYDG"], ["-----END PGP SIGNATURE-----", 1],
  ];
  const SAVED = ["clang", " -O2 hello.c -o hello && ./hello"];          // the Run button's saved command (STORYBOARD § d E)
  const MONO = '"JetBrains Mono",monospace';

  OT.sequence({
    id: "E",
    build(ctx) {
      const { clamp, lerp, inv, sstep, tw, spring } = OT;
      const EZ = OT.E;
      const { t0, t1 } = ctx;
      const at = (b, w, n) => ctx.at(b, w, n), end = (b, w, n) => ctx.end(b, w, n);
      const APT = OT.FACTS.apt, DEB = APT.deb;

      // ================================================================ words
      const T = {
        travels: at("s18", "travels"), plain: at("s18", "plain"), thats: at("s18", "That's"), trusts: at("s18", "trusts"),
        seal: at("s18", "seal,"), road: at("s18", "road."), every: at("s18", "Every"), finger: at("s18", "fingerprint"),
        index: at("s18", "index"), ubuntu: at("s18", "Ubuntu"), signs: at("s18", "signs,"), already: at("s18", "already"),
        key: at("s18", "key."), keyEnd: end("s18", "key."),
        archive: at("s19", "archive"), inside: at("s19", "inside"), dpkg: at("s19", "D-P-K-G"), unpacks: at("s19", "unpacks"),
        settle: at("s19", "settle"), place: at("s19", "place."), placeEnd: end("s19", "place."), already2: at("s19", "already"),
        graphics: at("s19", "graphics"), shaders: at("s19", "shaders."), shadersEnd: end("s19", "shaders."),
        clang20: at("s20", "clang"), nowEnd: end("s20", "now,"), path: at("s20", "path,"), folders: at("s20", "folders,"),
        until: at("s20", "until"), finds: at("s20", "finds"), other: at("s20", "other"), error: at("s20", "error"),
        clang21: at("s21", "clang"), compiled: at("s21", "compiled"), who: at("s21", "Who"), another: at("s21", "Another"),
        by: at("s21", "by"), ancestors: at("s21", "ancestors"), seeEnd: end("s21", "see."),
        now22: at("s22", "Now"), editor: at("s22", "editor."), fork: at("s22", "fork,"), exec: at("s22", "exec,"),
        loader: at("s22", "loader"), later: at("s22", "later,"), compositor: at("s22", "compositor"), draws: at("s22", "draws"),
        blank: at("s22", "blank"), pageEnd: end("s22", "page."), run: at("s22", "Run"), saved: at("s22", "saved"),
        command: at("s22", "command."),
      };
      const R = {
        road0: T.travels, road1: T.road - 0.1, road2: T.road + 0.6,
        clear0: T.plain - 0.3,
        rise0: T.thats - 0.1, rise1: T.thats + 1.35,
        roll0: T.trusts - 0.12, land: T.seal + 0.265,
        tag0: T.every + 0.4, sheets0: T.every - 0.1,
        pair0: T.index - 0.2, pair1: T.index + 0.42, thr0: T.ubuntu - 0.05,
        key0: T.already - 0.42, key1: T.already + 0.42, fit0: T.key - 0.04, fit1: T.key + 0.36,
        push0: T.keyEnd + 0.7, push1: T.archive - 0.15,
        pop0: T.archive - 0.12, open0: T.inside - 0.08, lift0: T.dpkg - 0.1,
        pan0: T.settle - 0.4, pan1: T.placeEnd + 0.1,
        full0: T.already2 - 0.15, gpu0: T.graphics - 0.15, tri0: T.shaders - 0.08,
        up0: T.shadersEnd + 0.25, up1: T.clang20 + 0.05,
        path0: T.path - 0.05, split0: T.folders - 0.1, split1: T.folders + 0.42,
        knock: [T.until - 0.12, T.until + 0.14, T.until + 0.4], found: T.finds + 0.02, dim0: T.other - 0.25,
        card0: T.clang21 - 0.1, bytes: T.compiled + 0.04, sil: T.who - 0.1, lit: T.another,
        dive0: T.another + 0.35, bottom: T.by - 0.2, flip: T.by,
        whip0: T.ancestors - 0.1, whip1: T.seeEnd + 0.9,      // 2.6 s, smoother (integration: the expoInOut whip peaked ~1000 px/frame)
        ptr0: T.now22 - 0.1, click: T.editor + 0.02,
        slot0: T.compositor - 0.05, unf0: T.draws - 0.2, unf1: T.blank + 0.06,
        p0: T.draws + 0.15, p1: T.pageEnd + 0.12,
        ring0: T.run - 0.1, cmd0: T.saved - 0.12,
      };
      R.out1 = t1 - 0.08; R.out0 = R.out1 - 0.35;           // the saved command and its thread leave before the baton

      // ================================================================ geography (local depths; negative = nearer the surface)
      const D_MEM = -620;                   // the membrane between the kernel and user space
      const D_U = -1300;                    // user space: the parcel, index, signature, key, the drawers
      const D_BG = D_U + 650;               // the other parcels, behind
      const D_GPU = D_U + 1500;             // a small far GPU (silicon, below)
      const D_KEY0 = D_U + 1100;            // where the key rises from
      const D_DESK = -2900;                 // the surface: desktop, terminal, editor (= the exit depth)
      const D_DOOR = D_DESK - 120;          // the PATH doors and clang's file, just above the desktop
      const D_CELL = D_DESK + 260;          // processes just under the wallpaper (s22)
      const A_N = 6, A_STEP = 1250;         // s21: the compilers that compiled clang, receding into the past
      const D_A = (k) => D_DESK + A_STEP * k;
      const D_P = D_DESK + 8800;            // the front panel at the bottom of the chain

      const F18 = { x: 960, y: 640, z: D_U };           // parcel · index · signature · key
      const F19 = { x: 760, y: 470, z: D_U + 230 };     // the open parcel
      const FW = { x: 3260, y: 600, z: D_U };           // the wall of drawers
      const F20 = { x: 960, y: 1110, z: D_DESK };       // the bottom of the terminal and the PATH doors
      const FP = { x: 960, y: 700, z: D_P };            // the front panel
      const F22 = { x: 960, y: 640, z: D_DESK - 1500 }; // the desktop (scale 0.4)
      const EXIT = { x: 960, y: 640, z: D_DESK };       // the blank page (baton 4)
      const sc = (F, d) => 1000 / (1000 - (F.z - d));
      const W = (F, d, sx, sy) => { const s = sc(F, d); return { x: F.x + (sx - 960) / s, y: F.y + (sy - 640) / s }; };

      // ================================================================ styles
      ctx.el("style", "", document.head, `
        .sE-pane { position:absolute; left:0; top:0; border-radius:8px; background:rgba(255,197,77,.05); box-shadow:inset 0 0 0 1.5px rgba(255,197,77,.8), 0 0 14px rgba(255,190,70,.25); opacity:0; }
        .sE-frag { position:absolute; left:0; top:0; height:28px; font:28px/28px ${MONO}; color:#fff3df; white-space:pre; text-shadow:0 0 12px rgba(255,214,160,.65); transform-origin:0 50%; }
        .sE-rail { position:absolute; left:-2600px; width:7000px; height:2px; background:rgba(143,224,255,.22); }
        .sE-dash { position:absolute; left:-2600px; width:7000px; height:2px; background:repeating-linear-gradient(90deg, rgba(143,224,255,.2) 0 26px, transparent 26px 60px); }
        .sE-grid { position:absolute; left:-2040px; top:-1460px; width:6000px; height:4000px;
          background: repeating-linear-gradient(0deg, rgba(170,230,255,.45) 0 2px, transparent 2px 90px), repeating-linear-gradient(90deg, rgba(170,230,255,.45) 0 2px, transparent 2px 90px); }
        .sE-xring { position:absolute; left:0; top:0; width:2300px; height:760px; margin:-380px 0 0 -1150px; border-radius:50%; opacity:0;
          background:radial-gradient(ellipse at center, rgba(217,243,255,0) 40%, rgba(217,243,255,.5) 50%, rgba(217,243,255,.12) 56%, rgba(217,243,255,0) 64%); }
        .sE-halo { position:absolute; left:505px; top:243px; width:440px; height:440px; margin:-220px 0 0 -220px; border-radius:50%; opacity:0; pointer-events:none;
          background:radial-gradient(circle, rgba(255,150,105,.55) 0%, rgba(230,95,60,.22) 30%, rgba(200,70,40,0) 62%); }
        .sE-lbl { position:absolute; font:18px/18px ${MONO}; color:rgba(255,226,196,.6); white-space:pre; letter-spacing:.06em; }
        .sE-hex { position:absolute; font:30px/38px ${MONO}; white-space:pre; color:rgba(255,232,206,.66); }
        .sE-hex .on { color:#fffaf0; text-shadow:0 0 14px rgba(255,236,200,.8); }
        .sE-sheet { position:absolute; border-radius:12px; background:rgba(255,214,160,.035); box-shadow:inset 0 0 0 1.5px rgba(255,214,160,.14); }
        .sE-tab { position:absolute; font:18px/18px ${MONO}; color:rgba(255,226,196,.62); white-space:pre; letter-spacing:.03em; }
        .sE-st { position:absolute; font:17px/26px ${MONO}; color:rgba(255,232,206,.7); white-space:pre; }
        .sE-bar { position:absolute; height:7px; border-radius:4px; background:rgba(255,214,160,.1); }
        .sE-in { position:absolute; font:15px/26px ${MONO}; color:rgba(255,232,206,.56); white-space:pre; }
        .sE-in.ar { font-size:17px; color:rgba(255,236,214,.86); }
        .sE-in .iss { border-radius:3px; }
        .sE-svg { position:absolute; left:0; top:0; overflow:visible; }
        .sE-keyw { position:absolute; left:0; top:0; width:940px; height:120px; }
        .sE-keyw .fpr { position:absolute; left:132px; top:10px; font:22px/22px ${MONO}; color:#f2dcc4; white-space:pre; }
        .sE-keyw .kf { position:absolute; left:132px; top:80px; font:17px/17px ${MONO}; color:rgba(242,220,196,.62); white-space:pre; }
        .sE-mcard { position:absolute; left:0; top:0; border-radius:10px; background:linear-gradient(180deg,#30261f,#251d17); box-shadow:inset 0 0 0 2px rgba(255,214,160,.42); transform-origin:50% 100%; }
        .sE-mcard .nm { position:absolute; left:22px; top:21px; font:24px/24px ${MONO}; color:#fff3df; white-space:pre; }
        .sE-mcard .sz { position:absolute; right:22px; top:23px; font:20px/20px ${MONO}; color:rgba(255,226,196,.62); white-space:pre; }
        .sE-tray { position:absolute; left:0; top:0; border-radius:0 0 10px 10px; background:rgba(33,25,20,.94); box-shadow:inset 0 0 0 1.5px rgba(255,214,160,.24); }
        .sE-chip { position:absolute; left:0; top:0; width:60px; height:20px; border-radius:5px; background:rgba(226,206,180,.3); box-shadow:inset 0 0 0 1.5px rgba(255,226,196,.38); }
        .sE-chip.g { width:96px; height:26px; background:rgba(255,197,77,.14); box-shadow:inset 0 0 0 2px #ffc54d, 0 0 16px rgba(255,190,70,.45);
          font:700 18px/26px ${MONO}; color:#ffc54d; text-align:center; text-shadow:0 0 12px rgba(255,190,70,.55); }
        .sE-dpkg { position:absolute; font:15px/15px ${MONO}; color:rgba(255,232,206,.34); white-space:pre; }
        .sE-bgp { position:absolute; left:0; top:0; width:300px; height:140px; border-radius:10px; background:linear-gradient(180deg,#2a2118,#1d1711); box-shadow:0 0 0 2px rgba(255,214,160,.3); }
        .sE-bgp .lid { position:absolute; left:0; top:0; width:300px; height:42px; border-radius:10px 10px 0 0; background:rgba(255,214,160,.08); border-bottom:1.5px solid rgba(255,214,160,.26); transform-origin:50% 0; }
        .sE-bgp .nm { position:absolute; left:18px; top:66px; font:20px/20px ${MONO}; color:rgba(255,236,214,.78); white-space:pre; }
        .sE-bgp .sp { position:absolute; left:0; top:0; width:18px; height:11px; border-radius:3px; background:rgba(226,206,180,.6); }
        .sE-dw { position:absolute; left:0; top:0; border-radius:10px; overflow:hidden; background:rgba(12,8,16,.6); box-shadow:inset 0 0 0 1.5px rgba(255,214,160,.16); }
        .sE-dw .pack { position:absolute; left:12px; right:12px; top:7px; height:24px; border-radius:4px; background:repeating-linear-gradient(90deg, rgba(226,206,180,.45) 0 24px, transparent 24px 30px); }
        .sE-dw .fr { position:absolute; left:0; top:0; right:0; bottom:0; border-radius:10px; background:linear-gradient(180deg, rgba(70,54,88,.97), rgba(50,39,66,.97)); box-shadow:inset 0 0 0 1.5px rgba(255,214,160,.3); }
        .sE-dw .fl { position:absolute; left:16px; top:18px; font:21px/21px ${MONO}; color:rgba(255,236,214,.84); white-space:pre; }
        .sE-dw .hd { position:absolute; left:50%; bottom:24px; width:64px; height:9px; margin-left:-32px; border-radius:5px; background:rgba(255,214,160,.32); }
        .sE-dw .tg { position:absolute; right:12px; bottom:12px; padding:0 10px; height:30px; border-radius:6px; font:19px/30px ${MONO}; color:#2a1e14; background:#f0d9b8; white-space:pre; }
        .sE-dw .tg.new { right:14px; bottom:14px; height:22px; padding:0 7px; font-size:14px; line-height:22px; }
        .sE-gpu { position:absolute; left:0; top:0; width:700px; height:380px; border-radius:24px; border:4px solid rgba(160,210,255,.35); font:600 56px/56px ${MONO}; color:rgba(200,230,255,.8); }
        .sE-gpu .gl { position:absolute; left:0; right:0; top:40px; text-align:center; }
        .ot-term.night .cmd.sE-gold { color:#ffc54d; text-shadow:0 0 14px rgba(255,190,70,.5); }
        .sE-path { position:absolute; left:0; top:0; font:24px/34px ${MONO}; color:#3b3a35; white-space:pre; }
        .sE-path.d { color:#a59e8f; }
        .sE-door { position:absolute; left:0; top:0; width:24px; height:34px; border-radius:4px 4px 2px 2px; border:2.5px solid rgba(30,29,26,.6); background:rgba(239,234,224,.7); transform-origin:0 50%; }
        .sE-door i { position:absolute; right:3px; top:13px; width:4px; height:4px; border-radius:50%; background:rgba(30,29,26,.65); }
        .sE-x { position:absolute; left:0; top:0; font:700 24px/34px ${MONO}; color:#a2462b; }
        .sE-chain { position:absolute; left:0; top:0; font:700 24px/34px ${MONO}; color:#a26a05; white-space:pre; }
        .sE-card { position:absolute; left:0; top:0; width:600px; height:270px; border-radius:10px; background:linear-gradient(180deg,#121826,#0b0f19);
          box-shadow:0 0 0 1.5px rgba(140,200,255,.35), 0 30px 90px rgba(40,30,15,.35); transform-origin:0 0; }
        .sE-card .n { position:absolute; left:32px; top:28px; font:700 40px/40px ${MONO}; color:#ffc54d; text-shadow:0 0 16px rgba(255,190,70,.55); }
        .sE-card .p { position:absolute; left:34px; top:84px; font:18px/18px ${MONO}; color:rgba(160,200,255,.62); white-space:pre; }
        .sE-card .b { position:absolute; left:32px; top:130px; font:34px/34px ${MONO}; color:#eef4ff; text-shadow:0 0 14px rgba(160,210,255,.6); white-space:pre; }
        .sE-card .r { position:absolute; height:10px; border-radius:5px; background:rgba(130,220,255,.16); }
        .sE-anc { position:absolute; left:0; top:0; width:900px; height:440px; border-radius:12px; background:linear-gradient(160deg,#1d140e,#0c0806); }
        .sE-anc svg, .sE-pan svg { position:absolute; left:0; top:0; overflow:visible; }
        .sE-pan { position:absolute; left:0; top:0; width:1500px; height:520px; }
        .sE-hand { position:absolute; left:0; top:0; width:360px; height:620px; transform-origin:61px 2px; filter:drop-shadow(0 0 2px rgba(255,179,90,.6)) drop-shadow(0 0 22px rgba(255,140,60,.22)); }
        .sE-lampbl { position:absolute; left:0; top:0; width:1700px; height:420px; margin:-210px 0 0 -850px; border-radius:50%; opacity:0;
          background:radial-gradient(ellipse at center, rgba(255,179,90,.36) 0%, rgba(255,160,70,.12) 40%, rgba(255,150,60,0) 68%); }
        .sE-pool { position:absolute; left:0; top:0; border-radius:50%; background:radial-gradient(circle, rgba(43,33,64,.95) 0%, rgba(43,33,64,.82) 36%, rgba(43,33,64,.3) 58%, rgba(43,33,64,0) 72%); }
        .sE-cbar { position:absolute; left:0; top:0; height:16px; border-radius:8px; background:rgba(255,226,196,.5); transform-origin:0 50%; }
        .sE-band { position:absolute; left:0; top:0; height:18px; border-radius:9px; background:rgba(185,204,255,.9); box-shadow:0 0 14px rgba(185,204,255,.6); }
        .sE-ld { position:absolute; left:0; top:0; font:700 46px/46px ${MONO}; color:#fff3df; text-shadow:0 0 18px rgba(255,226,196,.85); white-space:pre; }
        .sE-fork { position:absolute; left:0; top:0; height:7px; margin-top:-3.5px; border-radius:4px; background:#ffd6a0; transform-origin:0 50%; }
        .sE-slot { position:absolute; left:0; top:0; width:1920px; height:1080px; border-radius:34px; border:7px dashed rgba(30,29,26,.5); }
        .sE-cmd { position:absolute; left:0; top:0; font:30px/36px ${MONO}; color:#3b3a35; white-space:pre; }
        .sE-cmd .g { color:#a26a05; font-weight:700; }
        .sE-thr { position:absolute; left:0; top:0; width:2px; background:rgba(30,29,26,.55); transform-origin:50% 0; }
        .sE-scr { position:absolute; left:0; top:0; width:1920px; height:1080px; overflow:visible; }
      `);

      // small helpers: cached style writes (render sets every style it owns every frame; the caches only skip repeats)
      const setT = (e, s) => { if (e._sT !== s) { e.style.transform = s; e._sT = s; } };
      const setA = (e, a) => ctx.show(e, a);
      const setS = (e, k, v) => { const c = "_s" + k; if (e[c] !== v) { e.style[k] = v; e[c] = v; } };
      const tr = (x, y, extra = "") => `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0px)${extra ? " " + extra : ""}`;
      const quad = (a, c, b, u) => (1 - u) * (1 - u) * a + 2 * (1 - u) * u * c + u * u * b;
      const svgNS = "http://www.w3.org/2000/svg";

      // ================================================================ s18 · the road, the membrane, the line
      const roadP = ctx.plane(0);
      [612, 668].forEach((y) => { const r = ctx.el("div", "sE-rail", roadP); r.style.top = y + "px"; });
      ctx.el("div", "sE-dash", roadP).style.top = "639px";
      const memP = ctx.plane(D_MEM);
      ctx.el("div", "sE-grid", memP);
      const xring = ctx.el("div", "sE-xring", memP);
      ctx.place(xring, 960, 640, 0);

      // lineP rides the camera up (d 0 → D_U) and, once there, carries the parcel. The parcel is built first so the
      // cells and the readable fragments pour in OVER it.
      const lineP = ctx.plane(0);
      const PARCEL = { x: 70, y: 150 };                                    // its place in the four-thing framing
      const PARCEL_C = { x: 660, y: 400 };                                  // where it forms: centred on the line
      const pGlide = (t) => tw(T.every - 0.2, T.every + 0.5, t, "smoother");
      const parcelAt = (t) => { const u = pGlide(t); return { x: lerp(PARCEL_C.x, PARCEL.x, u), y: lerp(PARCEL_C.y, PARCEL.y, u) }; };
      const BAND = [[128, 30], [166, 30], [204, 80]];                       // the component's member bands (top, h)
      const parcel = OT.C.parcel(lineP, { name: DEB.file, size: DEB.sizeLabel });
      const halo = document.createElement("div"); halo.className = "sE-halo"; parcel.el.insertBefore(halo, parcel.seal);
      const SEAL_REST = "translate3d(430px, 168px, 0px) rotate(-10deg)";
      const line = OT.C.seqline(lineP, { n: 48 });
      line.el.style.left = "243px"; line.el.style.top = "628px";

      // what the clear cells read: the .deb's own first bytes, in file order (format constants + member names)
      const FRAG = [["!<arch>", -1], [DEB.members[0][0], 0], ["2.0", 0], [DEB.members[1][0], 1], [DEB.members[2][0], 2]];
      const PITCH = 30, GAP = [1, 1, 2, 2, 0];
      const need = (fs) => 1 + FRAG.reduce((a, [txt], k) => a + Math.max(2, Math.ceil((txt.length * fs * 0.6 + 12) / PITCH)) + GAP[k], 0);
      let FS = 28; while (FS > 18 && need(FS) > 47) FS -= 2;
      const FCW = FS * 0.6;
      let cur = 1;
      const frags = FRAG.map(([txt, band], k) => {
        const n = Math.max(2, Math.ceil((txt.length * FCW + 12) / PITCH));
        const c0 = cur; cur += n + GAP[k];
        const pane = ctx.el("div", "sE-pane", lineP);
        pane.style.cssText += `left:${243 + c0 * PITCH - 3}px;top:${640 - 25}px;width:${n * PITCH - 6 + 6}px;height:50px;`;
        const e = ctx.el("div", "sE-frag", lineP); e.textContent = txt;
        const x = 243 + c0 * PITCH + (n * PITCH - 6 - txt.length * FCW) / 2;
        e.style.left = x.toFixed(1) + "px"; e.style.top = 640 - FS / 2 + "px"; e.style.fontSize = FS + "px"; e.style.lineHeight = e.style.height = FS + "px";
        // where it flies when the line rolls up: the member's label inside the parcel (or the box itself)
        const tgt = band >= 0 ? { x: 51.5, y: BAND[band][0] + BAND[band][1] / 2, s: 18 / FS, keep: k !== 2 }   // parcel-local
          : { x: 36, y: 46, s: 24 / FS, keep: false };
        return { e, pane, k, band, c0, n, x, tgt };
      });
      const ctrl = frags[3];
      const cellBand = (i) => (i < ctrl.c0 ? 0 : i < ctrl.c0 + ctrl.n ? 1 : 2);
      const inFrag = (i) => frags.some((f) => i >= f.c0 && i < f.c0 + f.n);
      const slotN = [0, 0, 0];
      const cells = line.cells.map((c, i) => {
        const b = cellBand(i), j = slotN[b]++;
        const ex = 250 + (j % 16) * 10, ey = BAND[b][0] + (b === 2 ? 20 : 6) + Math.floor(j / 16) * 10;      // parcel-local
        return { c, i, b, sx: 243 + i * PITCH, sy: 628, ex, ey, inF: inFrag(i) };
      });

      // ================================================================ s18 · fingerprint, index, signature (userP)
      const userP = ctx.plane(D_U);
      const uSvg = document.createElementNS(svgNS, "svg");
      uSvg.setAttribute("class", "sE-svg"); uSvg.setAttribute("width", "1920"); uSvg.setAttribute("height", "1080");
      userP.appendChild(uSvg);
      const path = (d, stroke, w) => { const p = document.createElementNS(svgNS, "path"); p.setAttribute("d", d); p.setAttribute("fill", "none"); p.setAttribute("stroke", stroke); p.setAttribute("stroke-width", w); p.setAttribute("stroke-linecap", "round"); p.setAttribute("pathLength", "1"); p.setAttribute("stroke-dasharray", "1 1"); uSvg.appendChild(p); return p; };
      const drawPath = (p, f, a) => { const o = (1 - clamp(f)).toFixed(4); if (p._o !== o) { p.setAttribute("stroke-dashoffset", o); p._o = o; } const av = clamp(a).toFixed(3); if (p._a !== av) { p.setAttribute("opacity", av); p._a = av; } };

      const SHA_ROWS = DEB.sha256.match(/.{1,16}/g), SHA_N = DEB.sha256.length;
      const mkHex = (x, y) => SHA_ROWS.map((txt, i) => {
        const d = ctx.el("div", "sE-hex", userP); d.style.left = x + "px"; d.style.top = y + i * 38 + "px";
        const on = ctx.el("span", "on", d), off = ctx.el("span", "", d); off.textContent = txt;
        return { d, on, off, txt, k: 0 };
      });
      const setHex = (rows, k) => { let left = k; rows.forEach((r) => { const n = clamp(left, 0, r.txt.length); left -= r.txt.length; if (r.k !== n) { r.k = n; r.on.textContent = r.txt.slice(0, n); r.off.textContent = r.txt.slice(n); } }); };
      // the parcel's fingerprint (sha256 of the downloaded file), hanging under it
      const SHA_P = { x: 100, y: 568 };
      const tagThr = path(`M 200 474 L 200 528`, "rgba(255,214,160,.55)", 2);
      const shaLblP = ctx.el("div", "sE-lbl", userP, "SHA256"); shaLblP.style.left = SHA_P.x + "px"; shaLblP.style.top = "536px";
      const hexP = mkHex(SHA_P.x, SHA_P.y);
      // the index (Packages): many entries as texture, ours in the middle, its SHA256 at the same height as the parcel's
      const IDX = { x: 720, y: 116, w: 520, h: 626 };
      const idxEls = [];
      { const s = ctx.el("div", "sE-sheet", userP); s.style.cssText += `left:${IDX.x}px;top:${IDX.y}px;width:${IDX.w}px;height:${IDX.h}px;`; idxEls.push(s); }
      { const tb = ctx.el("div", "sE-tab", userP, "Packages"); tb.style.left = IDX.x + 22 + "px"; tb.style.top = IDX.y + 18 + "px"; idxEls.push(tb); }
      for (let r = 0; r < 11; r++) {
        if (r % 4 === 3) continue;                                          // gaps between entries
        const b = ctx.el("div", "sE-bar", userP);
        b.style.left = IDX.x + 24 + (r % 4 ? 0 : 0) + "px"; b.style.top = 166 + r * 21 + "px";
        b.style.width = Math.round(150 + 300 * OT.hash(r, 7)) + "px"; idxEls.push(b);
      }
      const fslash = DEB.filename.lastIndexOf("/") + 1;
      const STANZA = [["Package: " + DEB.package, 418], ["Filename: " + DEB.filename.slice(0, fslash), 444], ["          " + DEB.filename.slice(fslash), 470],
        ["Size: " + DEB.size, 496], ["SHA256:", 532]];
      STANZA.forEach(([txt, y]) => { const e = ctx.el("div", "sE-st", userP, OT.esc(txt)); e.style.left = IDX.x + 24 + "px"; e.style.top = y + "px"; idxEls.push(e); });
      const hexI = mkHex(IDX.x + 24, SHA_P.y);
      // InRelease: the signed list of indexes, with its signature
      const INR = { x: 1262, y: 116, w: 626, h: 428 };
      const inrEls = [];
      { const s = ctx.el("div", "sE-sheet", userP); s.style.cssText += `left:${INR.x}px;top:${INR.y}px;width:${INR.w}px;height:${INR.h}px;`; inrEls.push(s); }
      { const tb = ctx.el("div", "sE-tab", userP, "InRelease"); tb.style.left = INR.x + 22 + "px"; tb.style.top = INR.y + 18 + "px"; inrEls.push(tb); }
      const IN_Y = 164, IN_LH = 26, IN_CW = 9;
      let issSpan = null, issRow = -1;
      INREL.forEach(([txt, ar], i) => {
        const e = ctx.el("div", "sE-in" + (ar ? " ar" : ""), userP); e.style.left = INR.x + 24 + "px"; e.style.top = IN_Y + i * IN_LH + "px";
        const ix = txt.indexOf(ISSUER);
        if (ix >= 0) { ctx.el("span", "", e).textContent = txt.slice(0, ix); issSpan = ctx.el("span", "iss", e); issSpan.textContent = ISSUER; ctx.el("span", "", e).textContent = txt.slice(ix + ISSUER.length); issRow = i; }
        else e.textContent = txt;
        inrEls.push(e);
      });
      const ELL = INREL.findIndex(([x]) => x === "…");                    // the elided part, where the indexes' own hashes are listed
      const idxThr = path(`M ${IDX.x + IDX.w - 30} 470 C ${IDX.x + IDX.w + 20} 470, ${INR.x - 10} ${IN_Y + ELL * IN_LH + 13}, ${INR.x + 22} ${IN_Y + ELL * IN_LH + 13}`, "rgba(255,214,160,.6)", 2);
      // the key, and the keyhole under the signature
      const KEY_AT = { x: 590, y: 738 }, KEYHOLE = { x: 1716, y: 796 };
      const KEY_SLIDE = KEYHOLE.x - 4 - (KEY_AT.x + 880);
      const issX = INR.x + 24 + (issRow >= 0 ? INREL[issRow][0].indexOf(ISSUER) : 0) * IN_CW, issY = IN_Y + issRow * IN_LH;
      const issThr = path(`M ${issX + (ISSUER.length * IN_CW) / 2} ${issY + 24} C ${issX + 160} ${issY + 220}, ${KEYHOLE.x} ${KEYHOLE.y - 160}, ${KEYHOLE.x} ${KEYHOLE.y - 30}`, "#c4563f", 2.5);
      const hole = ctx.el("div", "", userP);
      hole.style.cssText = `position:absolute;left:${KEYHOLE.x - 30}px;top:${KEYHOLE.y - 30}px;width:60px;height:80px;`;
      hole.innerHTML = `<svg width="60" height="80" viewBox="0 0 60 80"><circle cx="30" cy="30" r="27" fill="#8e2b1e" stroke="#c4563f" stroke-width="3"/><circle cx="30" cy="26" r="8" fill="#1a0c08"/><path d="M26 30 L23 48 L37 48 L34 30 Z" fill="#1a0c08"/></svg>`;
      const keyP = ctx.plane(D_KEY0);
      const keyW = ctx.el("div", "sE-keyw", keyP);
      keyW.innerHTML = `<svg width="940" height="120" viewBox="0 0 940 120" style="position:absolute;left:0;top:0;overflow:visible">
        <circle cx="58" cy="58" r="46" fill="rgba(40,26,20,.65)" stroke="#e8c9a8" stroke-width="5"/>
        <circle cx="58" cy="58" r="15" fill="#1a1210" stroke="#e8c9a8" stroke-width="4"/>
        <path d="M104 48 H880 V68 H104 Z" fill="rgba(40,26,20,.65)" stroke="#e8c9a8" stroke-width="4" stroke-linejoin="round"/>
        <path d="M806 68 V100 H824 V86 H842 V106 H860 V86 H880 V68" fill="none" stroke="#e8c9a8" stroke-width="4" stroke-linejoin="round"/></svg>
        <div class="fpr">${OT.esc(KEY_FPR)}</div><div class="kf">${OT.esc(KEY_FILE)}</div>`;
      const keySvg = keyW.querySelector("svg");

      // ================================================================ s19 · the archive opens; files; the other parcels
      const bgP = ctx.plane(D_BG);
      const NB = Math.max(0, APT.parcels - 1);
      const others = APT.named.filter((n) => n !== DEB.package);
      const bgp = [];
      {
        // four rows (screen y at the F19 framing), as many columns as the count needs (21 parcels → 5 × 4)
        const cols = Math.max(5, Math.ceil(NB / 4)), ROWS_Y = [105, 330, 555, 835];
        const slots = [];
        for (let j = 0; j < NB; j++) {
          const cx = j % cols, cy = Math.floor(j / cols);
          const sx = 170 + (cx * 1580) / Math.max(1, cols - 1) + (OT.hash(j, 3) - 0.5) * 120, sy = ROWS_Y[cy] + (OT.hash(j, 5) - 0.5) * (cy === 3 ? 20 : 70);
          slots.push({ j, sx, sy, seen: sy < 200 || sx > 1650 || sy > 800 });     // not hidden behind our parcel and its members
        }
        // the named ones (STORYBOARD § c: only these may carry a name) go to slots that stay visible, spread out
        const seen = slots.filter((q) => q.seen), nameAt = new Map();
        others.forEach((nm, i) => { const q = seen[Math.floor(((i + 0.5) * seen.length) / Math.max(1, others.length))]; if (q && !nameAt.has(q.j)) nameAt.set(q.j, nm); });
        slots.forEach(({ j, sx, sy }) => {
          const w = W(F19, D_BG, sx, sy);
          const e = ctx.el("div", "sE-bgp", bgP); e.style.left = (w.x - 150).toFixed(0) + "px"; e.style.top = (w.y - 70).toFixed(0) + "px";
          const lid = ctx.el("div", "lid", e);
          if (nameAt.has(j)) ctx.el("div", "nm", e).textContent = nameAt.get(j);
          const sp = [0, 1, 2].map(() => ctx.el("div", "sp", e));
          bgp.push({ e, lid, sp, j, sx, sy, open: R.lift0 + 0.15 + (j * (T.unpacks + 0.5 - R.lift0)) / Math.max(1, NB) });
        });
      }
      // the three members pop up out of the parcel; data.tar.zst opens in turn (a tray of files)
      const MC = [{ y: 158, h: 66, w: 430 }, { y: 244, h: 66, w: 430 }, { y: 330, h: 112, w: 560 }];
      const MCX = 720;
      const hinges = MC.map((m, k) => path(`M ${PARCEL.x + 416} ${PARCEL.y + BAND[k][0] + BAND[k][1] / 2} C ${PARCEL.x + 520} ${PARCEL.y + BAND[k][0] + BAND[k][1] / 2}, ${MCX - 90} ${m.y + 33}, ${MCX} ${m.y + 33}`, "rgba(255,214,160,.4)", 2));
      const mcards = MC.map((m, k) => {
        const e = ctx.el("div", "sE-mcard", userP); e.style.cssText += `left:${MCX}px;top:${m.y}px;width:${m.w}px;height:${m.h}px;`;
        ctx.el("div", "nm", e).textContent = DEB.members[k][0];
        ctx.el("div", "sz", e).textContent = DEB.members[k][1];
        return e;
      });
      const TRAY = { x: MCX + 20, y: MC[2].y + MC[2].h, w: 520, h: 120 };
      const tray = ctx.el("div", "sE-tray", userP); tray.style.left = TRAY.x + "px"; tray.style.top = TRAY.y + "px"; tray.style.width = TRAY.w + "px";
      const dpkgEls = APT.dpkg.slice(0, 3).map((txt, i) => { const e = ctx.el("div", "sE-dpkg", userP); e.textContent = txt; e.style.left = PARCEL.x + "px"; e.style.top = 498 + i * 24 + "px"; return e; });

      // the wall of drawers (laid out in the FW framing's screen px; FW is at scale 1)
      const WX = FW.x - 960, WY = FW.y - 640;
      const DCOL = [353, 661, 969, 1277], DROW = [92, 250, 408], DW = 290, DH = 140;
      const DR = [
        { r: 0, c: 0, fl: "/usr/bin", tag: "binutils" }, { r: 0, c: 1, fl: "/usr/include", tag: "libc6-dev" }, { r: 0, c: 2, fl: "/usr/lib/llvm-21/bin", tag: DEB.package, isNew: true },
        { r: 0, c: 3 }, { r: 1, c: 0 }, { r: 1, c: 1, tag: "libclang-cpp21" }, { r: 1, c: 2 }, { r: 1, c: 3, tag: "libclang1-21" },
        { r: 2, c: 0, span: 2, tag: "libllvm21" }, { r: 2, c: 2 }, { r: 2, c: 3 },
      ];
      const drawers = DR.map((d) => {
        const w = d.span ? DW * 2 + 18 : DW;
        const x = DCOL[d.c] + WX, y = DROW[d.r] + WY;
        const e = ctx.el("div", "sE-dw", userP); e.style.cssText += `left:${x}px;top:${y}px;width:${w}px;height:${DH}px;`;
        const full = !!d.tag && !d.isNew;
        const pack = full ? ctx.el("div", "pack", e) : null;
        const fr = ctx.el("div", "fr", e);
        if (d.fl) ctx.el("div", "fl", fr).textContent = d.fl;
        ctx.el("div", "hd", fr);
        const tg = d.tag ? ctx.el("div", "tg" + (d.isNew ? " new" : ""), fr) : null;
        if (tg) tg.textContent = d.tag;
        return { ...d, e, fr, pack, tg, full, x, y, w, open: 0 };
      });
      const dw = (r, c) => drawers.find((d) => d.r === r && d.c === c);
      const llvmDw = dw(2, 0), newDw = dw(0, 2);
      // file chips: ours (from data.tar.zst) and a few from the other parcels
      const chipSlot = (d, j) => ({ x: d.x + 14 + j * 70, y: d.y + 7 });
      const OURS = [[newDw, 0, true], [dw(0, 0), 0], [dw(0, 0), 1], [newDw, 1], [dw(1, 2), 0], [dw(1, 2), 1], [dw(2, 2), 0], [dw(0, 3), 0]];
      const chips = OURS.map(([d, j, gold], k) => {
        const e = ctx.el("div", "sE-chip" + (gold ? " g" : ""), userP);
        if (gold) e.textContent = "clang";
        const s0 = gold ? { x: TRAY.x + 34, y: TRAY.y + 22 } : { x: TRAY.x + 150 + ((k - 1) % 4) * 84, y: TRAY.y + 20 + Math.floor((k - 1) / 4) * 40 };
        const dst = chipSlot(d, j);
        if (gold) { dst.x += 0; dst.y += 0; }
        return { e, k, gold, d, s0, dst, from: "tray" };
      });
      const THEIRS = [[dw(0, 0), 2], [dw(0, 3), 1], [dw(1, 0), 0], [dw(1, 0), 1], [dw(1, 2), 2], [dw(2, 2), 1], [dw(2, 3), 0], [dw(2, 3), 1]];
      // the other parcels' files: only from parcels that are not hidden behind ours (top row, right column, bottom row)
      const srcs = bgp.filter((b) => b.sy < 200 || b.sx > 1650 || b.sy > 800);
      THEIRS.forEach(([d, j], k) => {
        const src = srcs.length ? srcs[(k * 3 + 1) % srcs.length] : null;
        const sp = src ? W(F19, D_U, src.sx, src.sy - 40) : { x: 200, y: 100 };
        const e = ctx.el("div", "sE-chip", userP);
        chips.push({ e, k: OURS.length + k, gold: false, d, s0: sp, dst: chipSlot(d, j), from: "bg", born: src ? src.open + 0.12 : R.lift0 });
      });
      const goldChip = chips[0];
      // the GPU, far below the wall (B's device style), and its shaders
      const gpuP = ctx.plane(D_GPU);
      const GPU = (() => { const s = sc(FW, D_GPU); return { x: FW.x + (1000 - 960) / s - 350, y: FW.y + (770 - 640) / s - 190 }; })();
      const gpu = ctx.el("div", "sE-gpu", gpuP); gpu.style.left = GPU.x.toFixed(0) + "px"; gpu.style.top = GPU.y.toFixed(0) + "px";
      ctx.el("div", "gl", gpu).textContent = "GPU";
      const TRI = 14;
      {
        let s = `<svg width="700" height="380" viewBox="0 0 700 380">`;
        for (let i = 0; i < TRI; i++) {
          const cx = 90 + (i % 7) * 87 + (OT.hash(i, 11) - 0.5) * 30, cy = 200 + Math.floor(i / 7) * 92 + (OT.hash(i, 12) - 0.5) * 24, r = 22 + 14 * OT.hash(i, 13);
          const a = OT.hash(i, 14) * 6.28;
          const pt = [0, 1, 2].map((q) => `${(cx + r * Math.cos(a + q * 2.094)).toFixed(1)},${(cy + r * Math.sin(a + q * 2.094)).toFixed(1)}`).join(" ");
          s += `<polygon class="tri" points="${pt}" fill="rgba(143,224,255,.55)" stroke="#bfefff" stroke-width="2" opacity="0"/>`;
        }
        gpu.insertAdjacentHTML("beforeend", s + "</svg>");
      }
      const tris = Array.from(gpu.querySelectorAll(".tri"));

      // ================================================================ s21 · the hall of compilers (deep planes, before the desktop in DOM)
      const ancs = [];
      for (let k = 1; k <= A_N; k++) {
        const p = ctx.plane(D_A(k));
        const side = k % 2 ? 1 : -1;
        // seen best from ~1200 above: centre it around the camera's y there, alternating sides (the thread zigzags down)
        const cx = 960 + side * 560, cy = lerp(F20.y, FP.y, clamp((D_A(k) - 1200 - D_DESK) / (D_P - D_DESK))) + side * 90;
        const e = ctx.el("div", "sE-anc", p); e.style.left = cx - 450 + "px"; e.style.top = cy - 220 + "px";
        const cols = [40, 28, 18, 12, 8, 5][k - 1], rows = [12, 9, 6, 5, 4, 3][k - 1];
        const bw = 820 / cols, bh = 330 / rows;
        // the program's bytes as blocks (holes, for the oldest), all in ONE path per slab
        let dd = "";
        const f1 = (v) => v.toFixed(1);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          if (OT.hash(r * 97 + c, k * 13) < 0.42) continue;
          if (k >= 5) { const rr = Math.min(bw, bh) * 0.32, cx0 = 40 + c * bw + bw / 2, cy0 = 70 + r * bh + bh / 2; dd += `M${f1(cx0 - rr)} ${f1(cy0)}a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(2 * rr)} 0a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(-2 * rr)} 0Z`; }
          else { const x0 = 40 + c * bw + 2, y0 = 70 + r * bh + 3, w = bw - 4, h = bh - 6, q = Math.min(w, h) * 0.14; dd += `M${f1(x0 + q)} ${f1(y0)}h${f1(w - 2 * q)}q${f1(q)} 0 ${f1(q)} ${f1(q)}v${f1(h - 2 * q)}q0 ${f1(q)} ${f1(-q)} ${f1(q)}h${f1(-(w - 2 * q))}q${f1(-q)} 0 ${f1(-q)} ${f1(-q)}v${f1(-(h - 2 * q))}q0 ${f1(-q)} ${f1(q)} ${f1(-q)}Z`; }
        }
        let s = `<svg width="900" height="440" viewBox="0 0 900 440"><rect class="ring" x="1.5" y="1.5" width="897" height="437" rx="11" fill="none" stroke="rgba(255,200,140,.3)" stroke-width="3"/><path class="blk" fill="rgba(255,214,160,.34)" d="${dd}"/>`;
        s += `<rect x="0" y="0" width="900" height="440" rx="12" fill="url(#sE-sheen-${k})"/><defs><linearGradient id="sE-sheen-${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(255,240,220,.07)"/><stop offset=".45" stop-color="rgba(255,240,220,0)"/></linearGradient></defs></svg>`;
        e.innerHTML = s;
        ancs.push({ p, e, k, cx, cy, d: D_A(k), ring: e.querySelector(".ring"), blk: e.querySelector(".blk") });
      }
      // the front panel: lamps, toggle switches, one hand
      const panelP = ctx.plane(D_P);
      const PAN = { x: 210, y: 330 };
      const NSW = 16, FLIP = 9;
      const swX = (i) => 120 + i * 80 + Math.floor(i / 4) * 24;
      const SW_Y = 330, LEV = 70;
      const swUp = Array.from({ length: NSW }, (_, i) => OT.hash(i, 29) > 0.5 && i !== FLIP);
      const pan = ctx.el("div", "sE-pan", panelP); pan.style.left = PAN.x + "px"; pan.style.top = PAN.y + "px";
      const lampBl = ctx.el("div", "sE-lampbl", pan); ctx.place(lampBl, 750, 92, 0);
      {
        let s = `<svg width="1500" height="520" viewBox="0 0 1500 520"><rect x="2" y="2" width="1496" height="516" rx="18" fill="#1a120c" stroke="rgba(255,179,90,.24)" stroke-width="3"/>`;
        for (let i = 0; i < NSW; i++) {
          const x = swX(i);
          s += `<circle class="lg" cx="${x}" cy="92" r="30" fill="rgba(255,179,90,.0)"/><circle class="lp" cx="${x}" cy="92" r="15" fill="#2c1d12" stroke="rgba(255,179,90,.3)" stroke-width="2"/>`;
          s += `<rect x="${x - 18}" y="${SW_Y - 26}" width="36" height="52" rx="6" fill="#100a07" stroke="rgba(255,214,160,.22)" stroke-width="2"/>`;
          s += `<g class="lv" transform="translate(${x} ${SW_Y}) scale(1 ${swUp[i] ? -1 : 1})"><rect x="-7" y="-4" width="14" height="${LEV}" rx="7" fill="#d9c4a6"/></g>`;
        }
        pan.insertAdjacentHTML("beforeend", s + "</svg>");
      }
      const lamps = Array.from(pan.querySelectorAll(".lp")), lampGl = Array.from(pan.querySelectorAll(".lg")), levers = Array.from(pan.querySelectorAll(".lv"));
      const hand = ctx.el("div", "sE-hand", panelP);
      hand.innerHTML = `<svg width="360" height="620" viewBox="0 0 360 620"><g fill="#070504">
        <rect x="38" y="0" width="46" height="210" rx="23"/><rect x="80" y="128" width="44" height="118" rx="22"/><rect x="118" y="146" width="42" height="106" rx="21"/>
        <rect x="154" y="168" width="38" height="92" rx="19"/><rect x="30" y="176" width="168" height="196" rx="62"/>
        <rect x="-6" y="214" width="56" height="124" rx="28" transform="rotate(-34 22 276)"/><path d="M58 340 L206 340 L310 620 L120 620 Z"/></g></svg>`;
      const TIP = { x: 61, y: 2 };                                         // the finger tip inside the hand svg

      // ================================================================ s22 · processes under the wallpaper (before the desktop in DOM)
      const poolP = ctx.plane(D_CELL + 40), cellP = ctx.plane(D_CELL);
      const POOL = W(F22, D_CELL + 40, 345, 600), POOL_R = 270 / sc(F22, D_CELL + 40);
      const pool = ctx.el("div", "sE-pool", poolP);
      pool.style.cssText += `left:${(POOL.x - POOL_R).toFixed(0)}px;top:${(POOL.y - POOL_R).toFixed(0)}px;width:${(2 * POOL_R).toFixed(0)}px;height:${(2 * POOL_R).toFixed(0)}px;`;
      const sCell = sc(F22, D_CELL), CELL_D = 168 / sCell;
      const CP = W(F22, D_CELL, 262, 600), CC = W(F22, D_CELL, 436, 600);
      const forkThr = ctx.el("div", "sE-fork", cellP);
      const mkCell = (label) => {
        const c = OT.C.cell(cellP, { label, size: CELL_D });
        c.lab.style.fontSize = "60px"; c.lab.style.top = "34%";
        const bars = [0, 1, 2].map((q) => { const b = ctx.el("div", "sE-cbar", c.el); b.style.left = CELL_D * 0.3 + "px"; b.style.top = CELL_D * (0.56 + q * 0.09) + "px"; b.style.width = CELL_D * (0.22 + 0.18 * OT.hash(q, 3)) + "px"; return b; });
        const bars2 = [0, 1, 2].map((q) => { const b = ctx.el("div", "sE-cbar", c.el); b.style.left = CELL_D * 0.3 + "px"; b.style.top = CELL_D * (0.56 + q * 0.09) + "px"; b.style.width = CELL_D * (0.3 + 0.14 * OT.hash(q, 8)) + "px"; b.style.background = "rgba(255,240,220,.75)"; return b; });
        return { ...c, bars, bars2 };
      };
      const cParent = mkCell("gnome-shell"), cChild = mkCell("gnome-shell");
      const ldEl = ctx.el("div", "sE-ld", cellP); ldEl.textContent = "ld-linux-x86-64.so.2";
      const LD = W(F22, D_CELL, 436, 492);
      const ldW = 20 * 46 * 0.6;
      const libBands = [0, 1, 2].map(() => { const b = ctx.el("div", "sE-band", cellP); b.style.width = CELL_D * 0.5 + "px"; return b; });

      // ================================================================ s20/s22 · the surface: desktop, terminal, editor
      const deskP = ctx.plane(D_DESK);
      const bloomIcon = OT.C.bloom(deskP, { size: 760, rgb: "255,214,140" });
      const desk = OT.C.desktop(deskP, { clock: "Fri Oct 9 · 9:30", running: ["terminal"], twins: false });
      const ICON = desk.icon("editor"), edIcon = desk.icons[3];
      ctx.place(bloomIcon, ICON.x, ICON.y, 0);
      // the terminal: the real install log up to its last trigger line (the needrestart report after it is not shown),
      // then `clang` typed at the prompt; its output prints on "error"
      const raw = OT.LOGS[APT.log];
      const popt = { cols: 78, drop: APT.drop, dropLive: APT.dropLive };
      let log = OT.term.parse(raw, APT.tailUntil ? { ...popt, until: APT.tailUntil } : popt);   // the facts name the log's last line
      if (!APT.tailUntil) {
        let last = -1; log.events.forEach((e, i) => { if (e.k === "line" && !e.cont && /^Processing triggers for /.test(e.text)) last = i; });
        if (last >= 0) log = OT.term.parse(raw, { ...popt, until: new RegExp("^" + log.events[last].text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$") });
      }
      const term = OT.term.view(deskP, log, {
        ...OT.C.TERM_WIN, cmd: { prompt: "~$ ", text: APT.command, t0: -1e9, t1: -1e9 }, keys: [[t0, "end"]],
        cmds: [{ text: "clang", cls: "sE-gold", t0: T.clang20 + 0.02, t1: T.nowEnd, out: [[T.error, NO_INPUT]] }],
        hot: [[{ cmd: 0, out: 0 }, T.error, Infinity]],
        screenScale: (t) => ctx.project(960, 640, D_DESK, t).s,
      });
      term.el.classList.add("sE-term");
      const slot = ctx.el("div", "sE-slot", deskP);
      const ptr = OT.C.pointer(deskP); ptr.style.transformOrigin = "0 0";
      // the PATH doors and the clang file (just above the desktop)
      const doorP = ctx.plane(D_DOOR);
      const PW = 24 * 0.6;
      const PSTR = "PATH=" + PATH;
      const pLeft = 960 - (PSTR.length * PW) / 2, pY = W(F20, D_DOOR, 0, 440).y - 17;
      const pieces = [];
      { // "PATH=" and the colons are dim; each folder is its own piece so it can fly into the stack
        let o = 0;
        const add = (txt, cls, folder) => { const e = ctx.el("div", "sE-path" + (cls ? " " + cls : ""), doorP); e.textContent = txt; e.style.left = (pLeft + o * PW).toFixed(1) + "px"; e.style.top = pY.toFixed(1) + "px"; pieces.push({ e, o, txt, folder, x: pLeft + o * PW }); o += txt.length; };
        add("PATH=", "d", -1);
        PATH.split(":").forEach((f, k, all) => { add(f, "", k); if (k < all.length - 1) add(":", "d", -1); });
      }
      const folders = pieces.filter((p) => p.folder >= 0);
      const STX = W(F20, D_DOOR, 610, 0).x;
      const stackY = (k) => W(F20, D_DOOR, 0, 500 + k * 44).y - 17;
      const doors = folders.map((p, k) => {
        const d = ctx.el("div", "sE-door", doorP); ctx.el("i", "", d);
        d.style.left = (STX - 44).toFixed(1) + "px"; d.style.top = stackY(k).toFixed(1) + "px";
        const x = ctx.el("div", "sE-x", doorP); x.textContent = "✗"; x.style.left = (STX + p.txt.length * PW + 16).toFixed(1) + "px"; x.style.top = stackY(k).toFixed(1) + "px";
        return { d, x };
      });
      const FK = folders.findIndex((p) => p.txt === FOUND);
      const chainEl = ctx.el("div", "sE-chain", doorP);
      const chainHead = ctx.el("span", "", chainEl), chainTail = ctx.el("span", "", chainEl);
      chainEl.style.left = (STX + FOUND.length * PW).toFixed(1) + "px"; chainEl.style.top = stackY(Math.max(0, FK)).toFixed(1) + "px";
      const TAIL0 = { x: STX + (FOUND.length + CHAIN[0].length) * PW, y: stackY(Math.max(0, FK)) };
      const CARD = (() => { const c = W(F20, D_DOOR, 960, 600); return { x: c.x - 300, y: c.y - 135, cx: c.x, cy: c.y }; })();
      const card = ctx.el("div", "sE-card", doorP);
      card.innerHTML = `<div class="n">clang</div><div class="p">${OT.esc(BINARY)}</div><div class="b"></div>` +
        [0, 1, 2].map((q) => `<div class="r" style="left:32px;top:${190 + q * 22}px;width:${Math.round(320 + 200 * OT.hash(q, 21))}px"></div>`).join("");
      const cardBytes = card.querySelector(".b"), cardRows = Array.from(card.querySelectorAll(".r"));
      // the editor (baton 4) on the desktop's depth, painted after it; the saved command under the Run pill
      const edP = ctx.plane(D_DESK);
      const ed = OT.C.editor(edP);
      const cmdThr = ctx.el("div", "sE-thr", edP); cmdThr.style.left = "1324px"; cmdThr.style.top = "304px"; cmdThr.style.height = "36px";
      const cmdEl = ctx.el("div", "sE-cmd", edP);
      const cmdG = ctx.el("span", "g", cmdEl), cmdR = ctx.el("span", "", cmdEl);
      const CMD_LEN = SAVED[0].length + SAVED[1].length;
      cmdEl.style.left = (1400 - CMD_LEN * 18).toFixed(1) + "px"; cmdEl.style.top = "344px";

      // ================================================================ screen-space threads (drawn through depth)
      const scr = document.createElementNS(svgNS, "svg");
      scr.setAttribute("class", "sE-scr"); scr.setAttribute("width", "1920"); scr.setAttribute("height", "1080");
      ctx.screen.appendChild(scr);
      const mkLine = (stroke, glow) => { const p = document.createElementNS(svgNS, "path"); p.setAttribute("fill", "none"); p.setAttribute("stroke", stroke); p.setAttribute("stroke-linecap", "round"); p.setAttribute("stroke-linejoin", "round"); if (glow) p.style.filter = glow; scr.appendChild(p); return p; };
      const gpuThr = mkLine("#ffd6a0", "drop-shadow(0 0 6px rgba(255,214,160,.5))");
      const chainThr = mkLine("#ffc54d", "drop-shadow(0 0 8px rgba(255,190,70,.7))");
      const setLine = (p, d, w, a) => { if (p._d !== d) { p.setAttribute("d", d); p._d = d; } const ws = w.toFixed(2); if (p._w !== ws) { p.setAttribute("stroke-width", ws); p._w = ws; } const as = clamp(a).toFixed(3); if (p._a !== as) { p.setAttribute("opacity", as); p._a = as; } };

      // ================================================================ camera, ground, motes, light, lens
      const dz = D_P - D_DESK;
      ctx.cam([
        [t0, { x: 960, y: 640, z: 0 }], [R.rise0, { x: 960, y: 640, z: 0 }],
        [R.rise1, { ...F18, ease: "smoother" }], [R.push0, F18],
        [R.push1, { ...F19, ease: "smoother" }], [R.pan0, F19],
        [R.pan1, { ...FW, ease: "smoother" }], [R.up0, FW],
        [R.up1, { ...F20, ease: "quintInOut" }], [R.dive0, F20],
        ...[[0.17, 0.16], [0.4, 0.4], [0.66, 0.67]].map(([tf, zf]) => [lerp(R.dive0, R.bottom, tf), { x: 960, y: lerp(F20.y, FP.y, zf), z: D_DESK + dz * zf }]),
        [R.bottom, FP], [R.whip0, FP],
        [R.whip1, { ...F22, ease: "smoother" }], [R.p0, F22],
        [R.p1, { ...EXIT, ease: "quintInOut" }], [t1, EXIT],
      ]);
      ctx.exit(EXIT);
      // when the return (smoother, FP → F22) passes depth z
      const whipPass = (z) => { let lo = 0, hi = 1; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (lerp(FP.z, F22.z, EZ.smoother(m)) > z) lo = m; else hi = m; } return lerp(R.whip0, R.whip1, (lo + hi) / 2); };
      ctx.ground([
        [t0, "#070c1c"], [R.rise0 + 0.1, "#070c1c"], [R.rise1, "#2b2140"],
        [R.up0 + 0.1, "#2b2140"], [R.up1 - 0.1, "#e2dacb"],
        [R.dive0, "#e2dacb"], [R.dive0 + 1.0, "#0e0806"],   // a shorter dusk into the past (integration: less grey)
        [whipPass(D_DESK + 900), "#0e0806"], [whipPass(D_DESK + 380), "#e2dacb"],   // the colour changes as the desktop arrives (no grey hold)
        [R.p0 + 0.3, "#e2dacb"], [R.p1 - 0.1, "#efeae0"], [t1, "#efeae0"],
      ]);
      ctx.motes([[t0, "sparks"], [R.rise0 + 0.8, "spores"], [R.up0 + 0.6, "dust"], [R.dive0 + 0.4, "none"], [R.whip1 - 0.6, "dust"]]);
      ctx.shake(R.land, { amp: 3, freq: 26 });
      // lamp #1: fingerprint → index → signature → key (one framing, no camera move)
      ctx.light([
        [T.finger - 0.25, null],
        [T.finger + 0.3, { x: SHA_P.x + 150, y: 612, d: D_U, rx: 235, ry: 150, dim: 0.42, lift: 0.08 }],
        [T.index - 0.15, {}],
        [T.index + 0.3, { x: IDX.x + 265, y: 556, rx: 290, ry: 215 }],
        [T.ubuntu + 0.05, {}],
        [T.signs + 0.05, { x: INR.x + 313, y: 330, rx: 335, ry: 225 }],
        [T.already - 0.2, {}],
        [T.already + 0.35, { x: KEY_AT.x + 470, y: KEY_AT.y + 58, rx: 520, ry: 100 }],
        [T.key - 0.05, {}],
        [T.key + 0.35, { x: KEY_AT.x + 470 + KEY_SLIDE / 2 + 60, y: KEY_AT.y + 40, rx: 580, ry: 150 }],
        [T.keyEnd + 0.1, {}],
        [T.keyEnd + 0.5, null],
      ]);
      // lens #2: fork / exec / loader under the wallpaper
      ctx.focus([[T.fork - 0.35, null], [T.fork + 0.05, D_CELL], [T.later - 0.02, D_CELL], [T.later + 0.38, null]]);
      ctx.margins(0, 0);

      // the instant the line passes the membrane (camera z = D_MEM during the rise) — found once, from the camera
      let tCross = null;
      const crossT = () => {
        if (tCross != null) return tCross;
        let a = R.rise0, b = R.rise1;
        for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (ctx.camAt(m).z > D_MEM) a = m; else b = m; }
        return (tCross = (a + b) / 2);
      };

      // a 3D polyline through world points [x, y, d] projected each frame, clipped at the near plane, revealed to f
      const polyD = (pts, t, f) => {
        const NEAR = 880, proj = pts.map(([x, y, d]) => ({ x, y, d, p: ctx.project(x, y, d, t) }));
        const segs = []; let total = pts.length - 1, done = f * total;
        for (let i = 0; i < total && done > 0; i++) {
          let A = proj[i], B = proj[i + 1];
          const u = Math.min(1, done); done -= 1;
          if (u < 1) { const d = lerp(A.d, B.d, u); B = { x: lerp(A.x, B.x, u), y: lerp(A.y, B.y, u), d, p: ctx.project(lerp(A.x, B.x, u), lerp(A.y, B.y, u), d, t) }; }
          const ea = A.p.eff, eb = B.p.eff;
          if (ea >= NEAR && eb >= NEAR) continue;
          const clip = (P, Q) => { const l = (P.p.eff - NEAR) / (P.p.eff - Q.p.eff); return ctx.project(lerp(P.x, Q.x, l), lerp(P.y, Q.y, l), lerp(P.d, Q.d, l), t); };
          const pa = ea >= NEAR ? clip(A, B) : A.p, pb = eb >= NEAR ? clip(B, A) : B.p;
          segs.push([pa, pb]);
        }
        let d = "", last = null, sMax = 0;
        segs.forEach(([a, b]) => { if (!last || Math.hypot(a.x - last.x, a.y - last.y) > 0.5) d += `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} `; d += `L ${b.x.toFixed(1)} ${b.y.toFixed(1)} `; last = b; sMax = Math.max(sMax, a.s, b.s); });
        return { d: d || "M 0 0", s: sMax };
      };

      // ================================================================ render
      ctx.render((t) => {
        const on = t >= t0 && t < t1;

        // ---------------------------------------------------------- s18: road, membrane, the line, the parcel
        const roadA = sstep(R.road0, R.road0 + 0.8, t) * (1 - sstep(R.road1, R.road2, t));
        setA(roadP, on ? roadA * 0.9 : 0);
        if (on && t > R.rise0 - 0.05 && t < R.rise1 + 0.4) {
          const eff = ctx.camAt(t).z - D_MEM;
          setA(memP, (1 - sstep(250, 640, eff)) * sstep(-820, -380, eff) * 0.85);
          const tx = crossT(), dx = t - tx;
          setA(xring, dx < -0.12 ? 0 : dx < 0 ? sstep(-0.12, 0, dx) : Math.exp(-dx * 3.2));
          setT(xring, tr(960, 640, `scale(${lerp(0.82, 1.08, EZ.expoOut(clamp((dx + 0.12) / 0.9))).toFixed(4)})`));
        } else setA(memP, 0);

        const lineOn = on && t < R.pan1 + 0.2;
        setA(lineP, lineOn ? 1 : 0);
        if (lineOn) {
          // the plane rides the camera during the rise: the line stays dead still on screen
          const dl = t < R.rise0 ? 0 : t >= R.rise1 ? D_U : ctx.camAt(t).z;
          setT(lineP, t < R.rise0 ? "translate3d(0px, 0px, 0px)" : `translate3d(0px, 0px, ${(-dl).toFixed(3)}px)`);
          ctx.lens(lineP, dl);
          const memberOut = sstep(R.pop0, R.pop0 + 0.4, t);                 // the members have left the box (s19)
          const PA = parcelAt(t);
          cells.forEach((ce) => {
            const { c, i } = ce;
            const u = sstep(R.clear0 + i * 0.009, R.clear0 + 0.32 + i * 0.009, t);
            const r = tw(R.roll0 + (47 - i) * 0.0065, R.roll0 + 0.5 + (47 - i) * 0.0065, t, "cubicInOut");
            if (u <= 0 && r <= 0) {                                         // the baton cell, exactly as D left it
              if (c._base !== 1) { c.style.background = ""; c.style.boxShadow = ""; c.style.width = "24px"; c.style.height = "24px"; c.style.transform = ""; c.style.opacity = ""; c.style.visibility = ""; c._sT = null; c._base = 1; }
              return;
            }
            c._base = 0;
            const sz = lerp(24, 8, r), h = lerp(lerp(24, 44, u), 8, r);
            const ex = PA.x + ce.ex, ey = PA.y + ce.ey;
            const x = lerp(ce.sx, ex, r), y = quad(ce.sy, Math.min(ce.sy, ey) - 90, ey, r) - (h - 24) / 2 * (1 - r);
            setT(c, tr(x - ce.sx, y - ce.sy));
            c.style.width = sz.toFixed(2) + "px"; c.style.height = h.toFixed(2) + "px";
            const fill = r > 0 ? lerp(lerp(1, 0.07, u), 0.9, r) : lerp(1, 0.07, u);
            c.style.background = `rgba(255,197,77,${fill.toFixed(3)})`;
            const ringA = (ce.inF ? lerp(0.75, 0.14, u) : 0.75 * u) * (1 - r);
            c.style.boxShadow = `inset 0 0 0 ${(1.5 * u * (1 - r)).toFixed(2)}px rgba(255,197,77,${ringA.toFixed(3)}), 0 0 ${lerp(12, 6, r).toFixed(1)}px rgba(255,190,70,${lerp(lerp(0.55, ce.inF ? 0.08 : 0.22, u), 0.4, r).toFixed(3)})`;
            setA(c, (r >= 1 ? 0.6 : 1) * (1 - memberOut));
          });
          frags.forEach((f) => {
            const a = sstep(T.plain - 0.12 + f.k * 0.07, T.plain + 0.25 + f.k * 0.07, t);
            const r = tw(R.roll0 + 0.12 + f.k * 0.035, R.roll0 + 0.66 + f.k * 0.035, t, "cubicInOut");
            const tx = PA.x + f.tgt.x, ty = PA.y + f.tgt.y;
            const x = lerp(f.x, tx, r), y = quad(640, Math.min(640, ty) - 90, ty, r), s = lerp(1, f.tgt.s, r);
            setT(f.e, r <= 0 ? "none" : tr(x - f.x, y - 640, `scale(${s.toFixed(4)})`));
            setA(f.e, a * (f.tgt.keep ? 1 - sstep(0.86, 1, r) : 1 - sstep(0.55, 0.95, r)));
            setA(f.pane, sstep(R.clear0 + f.c0 * 0.009 + 0.1, R.clear0 + 0.42 + f.c0 * 0.009, t) * (1 - sstep(0, 0.25, r)));
          });
          // the parcel forms around the bytes
          const form = tw(R.roll0 + 0.12, R.roll0 + 0.72, t, "cubicOut");
          setA(parcel.el, form);
          setT(parcel.el, form >= 1 ? tr(PA.x, PA.y) : tr(PA.x, PA.y, `scale(${lerp(0.95, 1, form).toFixed(4)})`));
          parcel.el.style.transformOrigin = "50% 50%";
          setA(parcel.label, sstep(R.roll0 + 0.5, R.roll0 + 0.85, t));
          setA(parcel.sub, sstep(R.roll0 + 0.6, R.roll0 + 0.95, t));
          parcel.members.forEach((m, k) => {
            const f = frags.find((q) => q.band === k && q.tgt.keep);
            const rr = f ? tw(R.roll0 + 0.12 + f.k * 0.035, R.roll0 + 0.66 + f.k * 0.035, t, "cubicInOut") : 1;
            setA(m.lab, sstep(0.86, 1, rr));
            setA(m.el, 1 - 0.7 * memberOut);
            m.el.style.background = `rgba(255,214,160,${(0.05 + 0.08 * sstep(R.roll0 + 0.3, R.roll0 + 0.7, t) * (1 - sstep(R.roll0 + 0.8, R.roll0 + 1.4, t))).toFixed(3)})`;
          });
          // the seal lands (local flare, no full-frame light); later it brightens when the key fits (verified)
          const st = clamp(spring(t, T.seal + 0.1, 15, 0.5), 0, 1.25);
          setA(parcel.seal, sstep(T.seal - 0.05, T.seal + 0.12, t));
          setT(parcel.seal, st >= 1 && t > R.land + 1.2 ? SEAL_REST : `${SEAL_REST} scale(${lerp(2.2, 1, Math.min(1, st)).toFixed(4)})`);
          const dl2 = t - R.land;
          const fl = dl2 < -0.02 ? 0 : dl2 < 0 ? sstep(-0.02, 0, dl2) : Math.exp(-dl2 * 2.6);
          const ok = t < R.fit1 ? 0 : 0.3 + 0.7 * Math.exp(-(t - R.fit1) * 2.2);
          const okA = sstep(R.fit1 - 0.05, R.fit1 + 0.2, t) * ok;
          const g = Math.max(fl, okA);
          setS(parcel.seal, "filter", g > 0.01 ? `brightness(${(1 + 0.5 * fl + 0.3 * okA).toFixed(3)}) drop-shadow(0 0 ${(6 + 26 * g).toFixed(1)}px rgba(255,130,90,${(0.3 + 0.55 * g).toFixed(2)}))` : "none");
          setA(halo, 0.95 * fl + 0.5 * okA);
          setT(halo, `scale(${lerp(0.45, 1.1, EZ.expoOut(clamp((dl2 + 0.02) / 0.6))).toFixed(4)})`);
        }

        // ---------------------------------------------------------- s18/s19: userP (fingerprint, index, signature, key; members, files, drawers)
        const userOn = on && t > R.tag0 - 0.1 && t < R.up0 + 0.9;
        setA(userP, userOn ? 1 - sstep(R.up0 + 0.15, R.up0 + 0.7, t) : 0);
        const s18out = 1 - sstep(R.push0 - 0.1, R.push0 + 0.5, t);
        if (userOn) {
          // fingerprint tag
          drawPath(tagThr, tw(R.tag0, R.tag0 + 0.2, t, "cubicOut"), s18out);
          setA(shaLblP, sstep(R.tag0 + 0.12, R.tag0 + 0.28, t) * s18out);
          hexP.forEach((r, i) => setA(r.d, sstep(R.tag0 + 0.2 + i * 0.05, R.tag0 + 0.34 + i * 0.05, t) * s18out));
          // index + InRelease come up as texture; the lamp names them
          const sheetA = sstep(R.sheets0, R.sheets0 + 0.6, t) * s18out;
          idxEls.forEach((e) => setA(e, sheetA)); hexI.forEach((r) => setA(r.d, sheetA)); inrEls.forEach((e) => setA(e, sheetA));
          const kLit = Math.round(SHA_N * inv(R.pair0, R.pair1, t));     // the matching characters light pairwise
          setHex(hexP, kLit); setHex(hexI, kLit);
          drawPath(idxThr, tw(R.thr0, R.thr0 + 0.5, t, "cubicInOut"), s18out);
          // the key rises from the disk below, fits the signature's keyhole; the issuer bytes answer
          const kr = inv(R.key0, R.key1, t);
          const dKey = lerp(D_KEY0, D_U, EZ.quintOut(kr));
          setA(keyP, on && t > R.key0 && t < R.push1 ? sstep(R.key0, R.key0 + 0.3, t) * s18out : 0);
          setT(keyP, `translate3d(0px, 0px, ${(-dKey).toFixed(3)}px)`); ctx.lens(keyP, dKey);
          const fit = tw(R.fit0, R.fit1, t, "quintOut");
          setT(keyW, tr(KEY_AT.x + KEY_SLIDE * fit, KEY_AT.y));
          const okK = sstep(R.fit1 - 0.08, R.fit1 + 0.2, t);
          setS(keySvg, "filter", okK > 0.01 ? `drop-shadow(0 0 ${(4 + 14 * okK).toFixed(1)}px rgba(255,214,170,${(0.5 * okK).toFixed(2)}))` : "none");
          setA(hole, sstep(R.key0 + 0.2, R.key0 + 0.6, t) * s18out);
          setS(hole, "filter", okK > 0.01 ? `brightness(${(1 + 0.35 * okK).toFixed(3)}) drop-shadow(0 0 ${(14 * okK).toFixed(1)}px rgba(255,120,90,${(0.6 * okK).toFixed(2)}))` : "none");
          drawPath(issThr, tw(R.fit1 - 0.15, R.fit1 + 0.35, t, "cubicInOut"), s18out * 0.9);
          if (issSpan) {
            setS(issSpan, "background", `rgba(196,86,63,${(0.5 * okK).toFixed(3)})`);
            setS(issSpan, "color", okK > 0.01 ? OT.rgb(OT.mix([255, 232, 206], [255, 236, 226], okK), 0.56 + 0.44 * okK) : "");
          }
          // s19: the members pop up out of the parcel (pop-up book), data.tar.zst opens, files lift and fly
          MC.forEach((m, k) => {
            const p = tw(R.pop0 + k * 0.12, R.pop0 + 0.42 + k * 0.12, t, "cubicOut");
            setA(mcards[k], p * (1 - sstep(R.pan0 + 0.3, R.pan1, t)));
            setT(mcards[k], p >= 1 ? "none" : `rotateX(${(82 * (1 - p)).toFixed(2)}deg)`);
            drawPath(hinges[k], p, 1 - sstep(R.pan0, R.pan0 + 0.6, t));
          });
          const op = tw(R.open0, R.open0 + 0.55, t, "cubicOut");
          setA(tray, sstep(R.open0, R.open0 + 0.15, t) * (1 - sstep(R.pan0 + 0.3, R.pan1, t)));
          tray.style.height = (TRAY.h * op).toFixed(1) + "px";
          dpkgEls.forEach((e, i) => setA(e, sstep(T.dpkg + i * 0.6, T.dpkg + 0.25 + i * 0.6, t) * (1 - sstep(R.pan0, R.pan0 + 0.5, t))));
          const lift = tw(R.lift0, R.lift0 + 0.6, t, "cubicOut");
          const shutIn = sstep(R.pan1 + 0.1, R.pan1 + 0.45, t);
          chips.forEach((ch) => {
            const fly = ch.gold ? tw(R.pan0, R.pan1 - 0.05, t, "smoother") : tw(R.pan0 + 0.05 + ch.k * 0.035, R.pan1 - 0.2 + ch.k * 0.03, t, "quintInOut");
            let a, x0, y0;
            if (ch.from === "tray") {
              a = sstep(R.open0 + 0.2 + ch.k * 0.03, R.open0 + 0.4 + ch.k * 0.03, t);
              // dpkg lifts them out of the tray, drifting towards the wall (right)
              x0 = ch.s0.x + (ch.gold ? 250 : 230 + 22 * (ch.k % 4)) * lift; y0 = ch.s0.y + (ch.gold ? 46 : 40 + 16 * (ch.k % 3)) * lift;
            } else {
              a = sstep(ch.born, ch.born + 0.2, t) * 0.85;
              x0 = ch.s0.x; y0 = ch.s0.y - 30 * tw(ch.born, ch.born + 0.4, t, "cubicOut");
            }
            const x = lerp(x0, ch.dst.x, fly), y = quad(y0, Math.min(y0, ch.dst.y) - 220, ch.dst.y, fly);
            setA(ch.e, a * (ch.gold || ch.d === newDw ? 1 : 1 - shutIn));
            setT(ch.e, tr(x, y));
          });
          // the wall: target drawers open as the files arrive and close again; the new one stays open with clang
          const arrive = sstep(R.pan1 - 0.75, R.pan1 - 0.35, t), shut = sstep(R.pan1 + 0.1, R.pan1 + 0.5, t);
          const full = sstep(R.full0, R.full0 + 0.45, t);
          drawers.forEach((d) => {
            const target = chips.some((c) => c.d === d);
            let o = target ? arrive * (1 - shut) : 0;
            if (d === newDw) o = arrive;
            if (d.full) o = Math.max(o, 0.82 * full);
            setS(d.fr, "top", (38 * o).toFixed(2) + "px");
            const glow = d.full ? full : d === newDw ? 0.35 * full : 0;
            setS(d.e, "boxShadow", glow > 0.01 ? `inset 0 0 0 1.5px rgba(255,214,160,${(0.16 + 0.4 * glow).toFixed(3)}), 0 0 ${(40 * glow).toFixed(0)}px rgba(255,190,110,${(0.32 * glow).toFixed(3)})` : "");
            setS(d.fr, "background", d.full && full > 0.01 ? `linear-gradient(180deg, ${OT.rgb(OT.mix([70, 54, 88], [112, 80, 70], full), 0.97)}, ${OT.rgb(OT.mix([50, 39, 66], [84, 58, 52], full), 0.97)})` : "");
            if (d.tg) setA(d.tg, d.isNew ? sstep(R.full0 + 0.15, R.full0 + 0.45, t) : full);
          });
        }

        // the other parcels, behind (s19)
        const bgA = on ? sstep(R.push0 + 0.3, R.push1, t) * (1 - sstep(R.pan0, R.pan0 + 0.7, t)) : 0;
        setA(bgP, bgA * 0.62);
        if (bgA > 0) bgp.forEach((b) => {
          const o = tw(b.open, b.open + 0.22, t, "cubicOut");
          setT(b.lid, `scaleY(${(1 - 1.85 * o).toFixed(3)})`);
          b.sp.forEach((s, q) => { const f = tw(b.open + 0.04 * q, b.open + 0.5 + 0.04 * q, t, "cubicOut"); setA(s, f > 0 && f < 1 ? 1 - f : 0); setT(s, tr(120 + (q - 1) * 50 * f, 30 - 120 * f)); });
        });

        // the GPU and the thread from libllvm21 (s19); triangles at "shaders"
        const gpuA = on ? sstep(R.gpu0 + 0.3, R.gpu0 + 0.9, t) * (1 - sstep(R.up0, R.up0 + 0.4, t)) : 0;
        setA(gpuP, gpuA);
        if (gpuA > 0) {
          const lit = sstep(R.tri0, R.tri0 + 0.3, t);
          gpu.style.borderColor = `rgba(160,210,255,${(0.35 + 0.55 * lit).toFixed(2)})`;
          gpu.style.boxShadow = lit > 0.02 ? `0 0 ${(60 * lit).toFixed(0)}px rgba(120,210,255,${(0.35 * lit).toFixed(2)})` : "none";
          gpu.style.color = `rgba(200,230,255,${(0.6 + 0.35 * lit).toFixed(2)})`;
          const fr = Math.floor(t * 14);
          tris.forEach((p, i) => p.setAttribute("opacity", (lit * (OT.hash(i, fr) > 0.45 ? 0.95 : 0.15)).toFixed(3)));
        }
        if (gpuA > 0 && t > R.gpu0) {
          const pts = [[llvmDw.x + llvmDw.w / 2, llvmDw.y + DH, D_U], [GPU.x + 350, GPU.y, D_GPU]];
          const L = polyD(pts, t, tw(R.gpu0, R.gpu0 + 0.9, t, "cubicInOut"));
          setLine(gpuThr, L.d, 3, gpuA);
        } else setLine(gpuThr, "M 0 0", 1, 0);

        // ---------------------------------------------------------- s20/s22: the surface
        const deskWin = (t > R.up0 + 0.2 && t < R.dive0 + 1.2) || (t > R.whip0 + 0.4 && t < R.p1 + 0.04);
        const deskA = on && deskWin ? ctx.depthAlpha(D_DESK, t, t > R.whip0 ? [300, 640] : [430, 820], [-3200, -2200]) : 0;
        setA(deskP, deskA);
        if (deskA > 0) {
          term.render(t);
          // while the shell walks the PATH the log steps back a little; the error comes back at full strength
          setA(term.scr, 1 - 0.4 * sstep(R.path0 - 0.1, R.path0 + 0.3, t) * (1 - sstep(R.dim0, R.dim0 + 0.6, t)));
          // s22: the pointer clicks the editor's dock icon
          const g = tw(R.ptr0, T.editor - 0.04, t, "expoOut");
          const px = lerp(1400, ICON.x - 7.5, g), py = lerp(1180, ICON.y - 5, g);
          setA(ptr, sstep(R.ptr0, R.ptr0 + 0.25, t) * (1 - sstep(R.click + 0.45, R.click + 0.8, t)));
          setT(ptr, tr(px, py, "scale(2.5)"));
          const press = sstep(R.click - 0.06, R.click, t) * (1 - sstep(R.click + 0.08, R.click + 0.32, t));
          setT(edIcon, press > 0.001 ? `scale(${(1 - 0.08 * press).toFixed(4)})` : "none");
          const running = t >= R.click + 0.15;
          if (edIcon.classList.contains("on") !== running) edIcon.classList.toggle("on", running);
          const dc = t - R.click;
          setA(bloomIcon, dc < -0.04 ? 0 : dc < 0 ? 0.6 * sstep(-0.04, 0, dc) : 0.6 * Math.exp(-dc * 3));
          setT(bloomIcon, tr(ICON.x, ICON.y, `scale(${lerp(0.4, 1, EZ.expoOut(clamp((dc + 0.04) / 0.6))).toFixed(4)})`));
          // the compositor's slot for the window
          setA(slot, sstep(R.slot0, R.slot0 + 0.35, t) * (1 - sstep(R.unf1 - 0.25, R.unf1 + 0.1, t)));
        }

        // the PATH doors, then clang's file (doorP)
        const doorA = on && t > R.path0 - 0.1 && t < R.dive0 + 1.0 ? ctx.depthAlpha(D_DOOR, t, [380, 760]) : 0;
        setA(doorP, doorA);
        if (doorA > 0) {
          const nPrint = PSTR.length * inv(R.path0, R.path0 + 0.38, t);
          const fade = 1 - 0.7 * sstep(R.dim0, R.dim0 + 0.8, t);
          const gone = 1 - sstep(R.card0 - 0.2, R.card0 + 0.3, t);
          pieces.forEach((p) => {
            const shown = nPrint > p.o ? 1 : 0;
            if (p.folder < 0) { setA(p.e, shown * (1 - sstep(R.split0, R.split0 + 0.2, t))); return; }
            const k = p.folder;
            const u = tw(R.split0 + k * 0.03, R.split1 + k * 0.03, t, "cubicInOut");
            setT(p.e, u <= 0 ? "none" : tr((STX - p.x) * u, (stackY(k) - pY) * u));
            const knocked = k < FK ? sstep(R.knock[k] + 0.05, R.knock[k] + 0.2, t) : 0;
            const after = k > FK ? sstep(R.found, R.found + 0.3, t) : 0;
            let a = shown * (1 - 0.55 * knocked - 0.55 * after);
            if (k === FK) {
              const f = sstep(R.found - 0.05, R.found + 0.15, t);
              setS(p.e, "color", f > 0.5 ? "#a26a05" : ""); setS(p.e, "fontWeight", f > 0.5 ? "700" : "");
            }
            setA(p.e, a * fade * gone);
          });
          doors.forEach(({ d, x }, k) => {
            const da = sstep(R.split1 - 0.12, R.split1 + 0.15, t);
            const kk = k < FK ? R.knock[k] : k === FK ? R.found - 0.12 : null;
            const tap = kk != null && t > kk ? Math.exp(-(t - kk) * 14) * Math.sin((t - kk) * 60) * 3 : 0;
            const swing = k === FK ? tw(R.found, R.found + 0.3, t, "cubicOut") : 0;
            setT(d, `translate3d(${tap.toFixed(2)}px, 0px, 0px) scaleX(${(1 - 0.78 * swing).toFixed(3)})`);
            setS(d, "borderColor", k === FK && swing > 0 ? "#a26a05" : "");
            const after = k > FK ? sstep(R.found, R.found + 0.3, t) : 0;
            setA(d, da * (1 - 0.55 * after) * fade * gone);
            setA(x, k < FK ? sstep(R.knock[k] + 0.05, R.knock[k] + 0.15, t) * fade * gone : 0);
          });
          const nC = (CHAIN[0].length + CHAIN[1].length) * inv(R.found + 0.08, R.found + 0.55, t);
          const h0 = CHAIN[0].slice(0, Math.floor(nC)), h1 = CHAIN[1].slice(0, Math.max(0, Math.floor(nC) - CHAIN[0].length));
          if (chainHead.textContent !== h0) chainHead.textContent = h0;
          if (chainTail.textContent !== h1) chainTail.textContent = h1;
          setA(chainHead, fade * gone); setA(chainTail, fade * (1 - sstep(R.card0, R.card0 + 0.25, t)));
          // s21: the tail of the chain becomes clang's file; its first bytes
          const cg = tw(R.card0, R.card0 + 0.55, t, "cubicInOut");
          setA(card, sstep(R.card0, R.card0 + 0.2, t));
          setT(card, cg >= 1 ? tr(CARD.x, CARD.y) : tr(lerp(TAIL0.x, CARD.x, cg), lerp(TAIL0.y, CARD.y, cg), `scale(${lerp(0.25, 1, cg).toFixed(4)})`));
          const nb = Math.floor(ELF.length * inv(R.bytes, R.bytes + 0.3, t));
          const bt = ELF.slice(0, nb);
          if (cardBytes.textContent !== bt) cardBytes.textContent = bt;
          cardRows.forEach((r, q) => setA(r, sstep(R.bytes + 0.2 + q * 0.08, R.bytes + 0.4 + q * 0.08, t)));
        }

        // ---------------------------------------------------------- s21: the hall of compilers, the front panel
        const hallOn = on && t > R.sil - 0.1 && t < R.whip1;
        ancs.forEach((a) => {
          if (!hallOn) { setA(a.p, 0); return; }
          const eff = ctx.camAt(t).z - a.d;
          // on the way back up, what we have passed drops away below us and is gone ("ancestors you'll never see")
          const near = ctx.depthAlpha(a.d, t, t > R.whip0 ? [300, 640] : [470, 860], [-7200, -3600]) * (t > R.whip0 ? sstep(-1900, -700, eff) : 1);   // the return: gone before they streak past the lens
          const appear = a.k === 1 ? lerp(sstep(R.sil, R.sil + 0.5, t) * 0.26, 1, sstep(R.lit - 0.05, R.lit + 0.35, t))
            : sstep(R.lit + 0.25 + (a.k - 2) * 0.22, R.lit + 0.75 + (a.k - 2) * 0.22, t);
          setA(a.p, near * appear * (1 - sstep(R.whip0 + 0.9, R.whip1 - 0.2, t)));
          const lit = a.k === 1 ? sstep(R.lit - 0.05, R.lit + 0.35, t) : 1;
          a.ring.setAttribute("stroke", `rgba(255,200,140,${(0.18 + 0.42 * lit).toFixed(3)})`);
          a.blk.setAttribute("fill", `rgba(255,214,160,${(0.18 + 0.2 * lit).toFixed(3)})`);
        });
        const panA = on && t > R.dive0 && t < R.whip1 ? ctx.depthAlpha(D_P, t, [470, 860], [-7400, -3600]) * (t > R.whip0 ? sstep(-2600, -900, ctx.camAt(t).z - D_P) : 1) : 0;
        setA(panelP, panA);
        if (panA > 0) {
          const push = tw(R.flip - 0.1, R.flip + 0.12, t, "cubicInOut");
          levers.forEach((lv, i) => { const dir = i === FLIP ? lerp(1, -1, push) : swUp[i] ? -1 : 1; lv.setAttribute("transform", `translate(${swX(i)} ${SW_Y}) scale(1 ${dir.toFixed(3)})`); });
          lamps.forEach((lp, i) => {
            const upNow = i === FLIP ? push > 0.5 : swUp[i];
            const l = upNow ? sstep(R.flip + 0.05 + i * 0.02, R.flip + 0.2 + i * 0.02, t) : 0;
            const hot = i === FLIP ? 1 : 0.8;
            lp.setAttribute("fill", l > 0.01 ? OT.rgb(OT.mix([44, 29, 18], [255, 179, 90], l * hot)) : "#2c1d12");
            lampGl[i].setAttribute("fill", `rgba(255,179,90,${(0.32 * l * hot).toFixed(3)})`);
          });
          const fl = t < R.flip ? 0 : 0.45 + 0.55 * Math.exp(-(t - R.flip) * 2.4);
          setA(lampBl, fl * sstep(R.flip, R.flip + 0.15, t));
          // the hand: in from below-right, the finger pushes the lever up, then it withdraws a little
          const app = tw(R.flip - 1.5, R.flip - 0.14, t, "cubicOut"), wd = tw(R.flip + 0.7, R.flip + 1.6, t, "cubicInOut");
          // the finger comes in at an angle from the lower right so the lever stays visible; it pushes the lever's tip
          // up past the pivot and stops just beside it
          const tipX = PAN.x + swX(FLIP) + 11, tipY = PAN.y + lerp(SW_Y + LEV - 6, SW_Y - 4, push);
          const hx = tipX - TIP.x + 300 * (1 - app) + 90 * wd, hy = tipY - TIP.y + 460 * (1 - app) + 150 * wd;
          setT(hand, tr(hx, hy, "rotate(-24deg)"));
          setA(hand, app);
        }
        // the gold thread down the chain: clang's file → each ancestor → the switch
        if (on && t > R.lit && t < R.whip0 + 0.8) {
          const pts = [[CARD.x + 600, CARD.cy + 40, D_DOOR], ...ancs.map((a) => [a.cx, a.cy, a.d]), [PAN.x + swX(FLIP), PAN.y + 92, D_P]];
          const f = clamp(inv(R.lit, R.lit + 0.5, t) * (1 / (pts.length - 1)) + inv(R.lit + 0.5, R.bottom - 0.3, t) * ((pts.length - 2) / (pts.length - 1)));
          const L = polyD(pts, t, f);
          setLine(chainThr, L.d, clamp(2.6 * L.s, 2, 7), 1 - sstep(R.whip0, R.whip0 + 0.6, t));
        } else setLine(chainThr, "M 0 0", 1, 0);

        // ---------------------------------------------------------- s22: fork / exec / loader under the wallpaper
        const cellOn = on && t > T.fork - 0.5 && t < T.later + 1.0;
        const cellOut = 1 - sstep(T.later + 0.15, T.later + 0.7, t);
        setA(poolP, cellOn ? tw(T.fork - 0.45, T.fork + 0.05, t, "cubicOut") * cellOut : 0);
        setA(cellP, cellOn ? sstep(T.fork - 0.4, T.fork - 0.05, t) * cellOut : 0);
        if (cellOn) {
          const po = tw(T.fork - 0.45, T.fork + 0.05, t, "cubicOut");
          setT(pool, `scale(${lerp(0.4, 1, po).toFixed(4)})`); pool.style.transformOrigin = "50% 50%";
          const fk = tw(T.fork, T.fork + 0.45, t, "backOut");
          const cx = lerp(CP.x, CC.x, fk);
          setT(cParent.el, tr(CP.x - CELL_D / 2, CP.y - CELL_D / 2));
          setT(cChild.el, tr(cx - CELL_D / 2, CC.y - CELL_D / 2));
          setA(cChild.el, sstep(T.fork - 0.02, T.fork + 0.1, t));
          setT(forkThr, tr(CP.x, CP.y)); forkThr.style.width = Math.max(0, cx - CP.x).toFixed(1) + "px";
          setA(forkThr, sstep(T.fork + 0.05, T.fork + 0.25, t) * 0.8);
          // exec: the child's name scrambles to editor and its insides are replaced
          const ex = inv(T.exec - 0.05, T.exec + 0.3, t);
          const lab = ex <= 0 ? "gnome-shell" : OT.scramble("gnome-shell", "editor", ex, t);
          if (cChild.lab.textContent !== lab) cChild.lab.textContent = lab;
          cChild.bars.forEach((b, q) => setT(b, `scaleX(${(1 - tw(T.exec - 0.05 + q * 0.04, T.exec + 0.15 + q * 0.04, t, "cubicIn")).toFixed(3)})`));
          cChild.bars2.forEach((b, q) => setT(b, `scaleX(${tw(T.exec + 0.12 + q * 0.05, T.exec + 0.4 + q * 0.05, t, "cubicOut").toFixed(3)})`));
          cParent.bars2.forEach((b) => setT(b, "scaleX(0)"));
          // the loader maps three library bands into it
          setA(ldEl, sstep(T.loader - 0.2, T.loader + 0.05, t));
          setT(ldEl, tr(LD.x - ldW / 2, LD.y - 23));
          libBands.forEach((b, q) => {
            const m = tw(T.loader + 0.05 + q * 0.09, T.loader + 0.4 + q * 0.09, t, "cubicInOut");
            setA(b, sstep(T.loader + q * 0.09, T.loader + 0.1 + q * 0.09, t));
            setT(b, tr(lerp(LD.x - CELL_D * 0.25, cx - CELL_D * 0.25, m), lerp(LD.y + 20, CC.y - CELL_D * 0.36 + q * 26, m)));
          });
        }

        // ---------------------------------------------------------- s22: the editor unfolds; the blank page; the saved command
        const edOn = on && t >= R.unf0;
        setA(edP, edOn ? 1 : 0);
        if (edOn) {
          ed.fold(1 - EZ.expoOut(inv(R.unf0, R.unf1, t)), ICON);
          ed.chrome(1 - sstep(T.blank + 0.1, R.p1 - 0.05, t));
          ed.typed(0); ed.lines(1); ed.caretAfter(0, t); ed.hover(0); ed.pointerAt(1328, 262, 0);
          const ring = sstep(R.ring0, R.ring0 + 0.25, t) * (1 - sstep(R.out0, R.out1, t));
          if (ring > 0.002) ed.pill.style.boxShadow = `0 0 0 6px rgba(30,29,26,${(0.1 * ring).toFixed(3)})`;
          const cOut = 1 - sstep(R.out0, R.out1, t);
          const th = tw(R.cmd0, R.cmd0 + 0.25, t, "cubicOut");
          setA(cmdThr, th > 0 ? cOut : 0); setT(cmdThr, `scaleY(${th.toFixed(3)})`);
          const n = Math.floor(CMD_LEN * inv(R.cmd0 + 0.15, T.command + 0.25, t));
          const g0 = SAVED[0].slice(0, n), g1 = SAVED[1].slice(0, Math.max(0, n - SAVED[0].length));
          if (cmdG.textContent !== g0) cmdG.textContent = g0;
          if (cmdR.textContent !== g1) cmdR.textContent = g1;
          setA(cmdEl, n > 0 ? cOut : 0);
        }
      });
    },
  });
})();
