/* D — The internet · s12 s13(optional) s14 s15 s16 s17.
 *
 * The desktop opens a terminal; `sudo apt install clang` → clang and its friends spring out on threads; every thread
 * bends left and converges on `archive.ubuntu.com` and a gold `?`. Pull back into the night: our lit roof (the
 * desktop) among dark towers. (s13: the `?` hops resolver → root → com. → ubuntu.com.; nine A records come back;
 * 185.125.190.82 fills the slot; the line docks on the far tower.) Every computer is a tower of floor plates: the
 * gold message drops through our roof and is wrapped TCP → IP → Wi-Fi frame on the way down; it leaves as gold radio
 * rings; the home router (a short tower) climbs it to its IP floor and reads the address; light in glass, along the
 * ocean floor; we rise up the far tower. Wide hold: SYN, SYN-ACK, ACK, GET, slow start 10/20/40, the line fills, a
 * murmuration of gold packets on three routes, out of order, a few lost and resent; push into our TCP floor: they
 * land in one perfect line.
 *
 *   entry (baton 2): OT.C.desktop(ctx.plane(1500), {clock: "Fri Oct 9 · 9:30"}), camera {960, 640, 0}, #e2dacb, dust.
 *   exit  (baton 3): OT.C.seqline on a plane at D.tcp (2500), left 243 / top 628; camera {960, 640, 2500};
 *                    #070c1c, sparks. Everything else is faded by t1 − 0.1.
 * Geography (local): our tower's axis is (960, 445) — the desktop wall's centre — with floors at depth 1500 (the roof =
 * the desktop), 2000 user, 2500 TCP, 3000 IP, 3500 NIC, 4000 the ground (land and seabed). The wide map is one
 * camera W; every map position below is written as its screen position at W and converted (atW).
 * apt values come from OT.FACTS.apt (PENDING the desktop capture): command, log, drop rules, parcel count, names. */
OT.sequence({
  id: "D",
  build(ctx) {
    const { clamp, lerp, inv, sstep, E } = OT;
    const { t0, t1 } = ctx;
    const at = (b, w, n) => ctx.at(b, w, n), end = (b, w, n) => ctx.end(b, w, n);
    const H13 = ctx.has("s13");
    const A = OT.FACTS.apt;
    const ramp = (a, b, t, e = "smoother") => E[e](inv(a, b, t));
    const win = (t, a0, a1, b0, b1) => sstep(a0, a1, t) * (1 - sstep(b0, b1, t));
    const SVGNS = "http://www.w3.org/2000/svg";
    const svgEl = (tag, parent, attrs = {}) => { const e = document.createElementNS(SVGNS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); if (parent) parent.appendChild(e); return e; };

    // ------------------------------------------------------------------ word times
    const T = {
      open: at("s12", "open"), term: at("s12", "terminal:"), sudo: at("s12", "sudo"), cmdEnd: end("s12", "clang."),
      that: at("s12", "that"), clang: at("s12", "clang", 2), thirty: at("s12", "thirty"), friends: at("s12", "friends,"),
      archive: at("s12", "archive"), dot1: at("s12", "dot"), ubuntu: at("s12", "ubuntu"), dot2: at("s12", "dot", 2), com: at("s12", "com."),
      where: at("s12", "where,"), exactly: at("s12", "exactly?"),
      tower: at("s14", "tower"), layers: end("s14", "layers."), message: at("s14", "message"), goes: at("s14", "goes"),
      tcp: at("s14", "TCP,"), ip: at("s14", "IP,"), wifi: at("s14", "Wi-Fi"), radio: at("s14", "radio"),
      short: at("s15", "short"), they: at("s15", "they"), ipFloor: at("s15", "IP"), read: at("s15", "read"), addr: end("s15", "address,"),
      send: at("s15", "send"), light: at("s15", "light"), ocean: at("s15", "ocean"), second: end("s15", "second."),
      far: at("s16", "far"), syn: at("s16", "syn,"), synack: at("s16", "syn-ack,"), ack: at("s16", "ack."), server: at("s16", "server"), sends: at("s16", "sends,"),
      ten: at("s16", "ten"), twice1: at("s16", "twice"), twice2: at("s16", "twice", 2), until: at("s16", "until"), lineFull: at("s16", "line"),
      tf: at("s17", "seventy-seven"), packets: at("s17", "packets."), other: at("s17", "other"), routes: at("s17", "routes,"), out: at("s17", "out"),
      lost: at("s17", "lost"), resent: at("s17", "resent."), tcp2: at("s17", "TCP"), land: at("s17", "land"), perfect: at("s17", "perfect"), lineEnd: end("s17", "line."),
    };
    const Q = H13 ? {
      numbers: at("s13", "numbers,"), asks: at("s13", "asks"), resolver: at("s13", "resolver,"), root: at("s13", "root"), dotcom: at("s13", "dot"),
      ubuntu: at("s13", "ubuntu"), answers: at("s13", "answers"), address: at("s13", "address."), addressEnd: end("s13", "address."),
    } : null;

    // ------------------------------------------------------------------ geometry
    const D = { desk: 1500, user: 2000, tcp: 2500, ip: 3000, nic: 3500, gnd: 4000 };
    const W = { x: -5000, y: 1850, z: -9200 };                     // the wide map camera
    const sW = (d) => 1000 / (1000 + d - W.z);
    const atW = (sx, sy, d) => ({ x: W.x + (sx - 960) / sW(d), y: W.y + (sy - 640) / sW(d) });
    const gW = (sx, sy) => { const p = atW(sx, sy, D.gnd); return [p.x, p.y]; };
    const AX = { x: 960, y: 445 };                                  // our tower's axis = the desktop wall's centre
    const R0 = { x: 960, y: 640, z: 0 };                            // baton 2: the desktop at scale 0.4
    const R1 = { x: 612, y: 534, z: 1700 };                         // the terminal at scale 1.25 (28 px text → 35 px)
    const AT = (d) => ({ x: 960, y: 640, z: d });                   // straight down our tower
    const KG = 1 / sW(D.gnd), KR = 1 / sW(D.desk);                  // world px per screen px at W, on the ground / the roofs

    // ------------------------------------------------------------------ styles
    ctx.el("style", "", document.head, `
      .sD-svg { position:absolute; left:0; top:0; overflow:visible; }
      .sD-abs { position:absolute; left:0; top:0; }
      .sD-paper { position:absolute; left:-1700px; top:-905px; width:5320px; height:2700px; background:#e2dacb; }
      .sD-roofglow { position:absolute; left:-1700px; top:-905px; width:5320px; height:2700px; border-radius:40px; box-shadow:0 0 1100px 300px rgba(255,226,170,.15); }
      .sD-win { position:absolute; left:0; top:0; width:1920px; height:1080px; transform-origin:0 0; }
      .sD-parcel { position:absolute; left:0; top:0; border-radius:9px; background:linear-gradient(180deg,#3a2d20,#231b14);
        box-shadow:0 0 0 2px rgba(255,214,160,.6), 0 10px 26px rgba(0,0,0,.5); }
      .sD-parcel::after { content:""; position:absolute; left:8%; right:8%; top:34%; height:2px; background:rgba(255,214,160,.35); }
      .sD-plab { position:absolute; left:0; top:0; font:500 16px/20px "JetBrains Mono",monospace; color:rgba(255,232,206,.86); white-space:pre; }
      .sD-scr { position:absolute; left:0; top:0; font-family:"JetBrains Mono",monospace; white-space:pre; }
      .sD-ch { position:absolute; top:0; }
      .sD-dot { position:absolute; left:0; top:0; border-radius:50%; background:#ffc54d; box-shadow:0 0 18px 4px rgba(255,190,70,.7), 0 0 4px #fff3c8; }
      .sD-plate { position:absolute; left:0; top:0; border-style:solid; box-sizing:border-box; }
      .sD-plate i { position:absolute; left:18%; top:20%; right:18%; bottom:20%; border-style:solid; border-color:rgba(150,205,255,.16); border-radius:inherit; }
      .sD-lab { position:absolute; left:0; top:0; font-family:"JetBrains Mono",monospace; white-space:pre; color:rgba(220,240,255,.85); }
      .sD-env { position:absolute; left:0; top:0; box-sizing:border-box; }
      .sD-elab { position:absolute; left:0; top:0; width:1200px; margin-left:-600px; font:600 32px/40px "JetBrains Mono",monospace; white-space:pre; text-align:center; }
      .sD-rec { position:absolute; left:0; top:0; font:500 21px/25px "JetBrains Mono",monospace; white-space:pre; color:rgba(220,240,255,.85); }
      .sD-pillar { position:absolute; left:0; top:0; transform-origin:0 0; background:rgba(150,205,255,.34); }
      .sD-slot { position:absolute; top:0; width:24px; height:24px; border-radius:5px; box-sizing:border-box; border:2px dashed rgba(255,197,77,.3); }
      .sD-off { position:absolute; top:0; font:500 20px "JetBrains Mono",monospace; color:rgba(255,226,170,.85); white-space:pre; }
      .sD-lostp { position:absolute; left:0; top:0; border-radius:50%; }
    `);
    const el = (cls, parent, html) => ctx.el("div", cls, parent, html);

    // ================================================================== planes (far → near in DOM order)
    const groundP = ctx.plane(D.gnd);
    const nicP = ctx.plane(D.nic), ipP = ctx.plane(D.ip), tcpP = ctx.plane(D.tcp), userP = ctx.plane(D.user);
    const ringP = ctx.plane(D.nic);
    const roofP = ctx.plane(D.desk);
    const deskP = ctx.plane(D.desk);
    const lineP = ctx.plane(D.tcp);
    const FLOOR_P = { [D.user]: userP, [D.tcp]: tcpP, [D.ip]: ipP, [D.nic]: nicP };

    // ================================================================== the desktop (our roof)
    const paper = el("sD-paper", deskP);                           // the roof keeps its paper when the ground goes dark
    const roofGlow = el("sD-roofglow", deskP);
    deskP.insertBefore(roofGlow, deskP.firstChild); deskP.insertBefore(paper, deskP.firstChild);
    const desk = OT.C.desktop(deskP, { clock: "Fri Oct 9 · 9:30", running: [], twins: false });
    const termIcon = desk.icon("terminal"), termIconEl = desk.icons[0];

    // the terminal window grows out of its dock icon (A's fold in reverse) and replays the real log
    const winWrap = el("sD-win", deskP);
    const TW0 = OT.C.TERM_WIN;
    const log = OT.term.parse(OT.LOGS[A.log], { cols: 76, drop: A.drop, dropLive: A.dropLive });
    const firstLine = log.events.findIndex((e) => e.k === "line");
    const lastLive = Math.max(0, (firstLine < 0 ? log.events.length : firstLine) - 1);   // the live rows; the summary is never shown
    const tEnter = T.cmdEnd + 0.15;
    const term = OT.term.view(winWrap, log, {
      ...TW0, cmd: { prompt: "~$ ", text: A.command, t0: T.sudo, t1: tEnter }, endPrompt: false,
      keys: [[tEnter + 0.3, 0], [T.that - 0.05, lastLive]],
      screenScale: (t) => ctx.project(960, 470, D.desk, t).s,
    });
    const pointer = OT.C.pointer(deskP);

    // ---- parcels: clang + its friends (count and names from OT.FACTS.apt; any count 1–30 and any name length fit)
    const CW = TW0.size * 0.6, TX = TW0.x + TW0.pad[3], TY = TW0.y + Math.round(TW0.size * 2.1) + TW0.pad[0];
    const cmdLine = "~$ " + A.command;
    const words = A.command.trim().split(/\s+/), rootName = words[words.length - 1];
    const WORD = { x: TX + (cmdLine.lastIndexOf(rootName) + rootName.length / 2) * CW, y: TY + TW0.lh - 4 };   // under the typed package name
    const namedF = A.named.filter((n) => n !== rootName);
    const nF = Math.max(0, A.parcels - 1), nNamed = Math.min(namedF.length, nF), nUn = nF - nNamed;
    const PX = { l: 380, r: 1290 }, PXC = 835, BUS = 318;                      // parcels span; the height where the threads run left
    const parcels = [];
    const mkParcel = (x, y, w, h, label, parent, k, labDy) => {
      const b = el("sD-parcel", deskP); b.style.width = w + "px"; b.style.height = h + "px";
      const lab = label ? el("sD-plab", deskP) : null;
      if (lab) lab.textContent = label;
      const p = { x, y, w, h, el: b, lab, labDy, parent, k, labW: label ? label.length * 9.6 : 0 };
      parcels.push(p);
      return p;
    };
    const root = mkParcel(WORD.x + 40, 392, 78, 54, rootName, null, -1, 44);
    {
      const sp = nNamed > 1 ? Math.min(200, (PX.r - PX.l) / (nNamed - 1)) : 0, x0 = PXC - (sp * (nNamed - 1)) / 2;
      for (let i = 0; i < nNamed; i++) mkParcel(x0 + i * sp, 488 + (i % 2 ? 12 : 0), 62, 44, namedF[i], root, i, i % 2 ? 58 : 36);
      const rows = nUn > 9 ? 2 : nUn ? 1 : 0;
      for (let r = 0, k = 0; r < rows; r++) {
        const n = r === 0 ? Math.ceil(nUn / rows) : nUn - Math.ceil(nUn / rows);
        const s2 = n > 1 ? Math.min(150, (PX.r - PX.l) / (n - 1)) : 0, xa = PXC - (s2 * (n - 1)) / 2 + (r ? s2 / 2 : 0);
        for (let i = 0; i < n; i++, k++) mkParcel(xa + i * s2, 622 + r * 76 + 8 * Math.sin(i * 1.7 + r), 52, 38, null, root, nNamed + k, 0);
      }
    }
    // the moment each parcel springs out: clang on "clang", then a ripple of friends from "thirty" to "friends,"
    parcels.forEach((p) => { p.tPop = p.k < 0 ? T.clang : lerp(T.thirty, T.friends + 0.05, nF > 1 ? p.k / (nF - 1) : 0); });
    const threadSvg = svgEl("svg", deskP, { class: "sD-svg", width: 10, height: 10 });
    parcels.forEach((p) => { p.path = svgEl("path", threadSvg, { fill: "none", "stroke-linecap": "round" }); });
    parcels.forEach((p) => { deskP.appendChild(p.el); if (p.lab) deskP.appendChild(p.lab); });   // parcels above their threads

    // ================================================================== the question (screen space: it is carried)
    const QFS = 34, QCW = QFS * 0.6;
    const NAME = "archive.ubuntu.com", ADDR = "185.125.190.82", SLOT = "?.?.?.?";
    const COL_Q = NAME.length + 1, COL_S = NAME.length + 3;          // the `?` and the address slot (character columns)
    const qLine = el("sD-scr", ctx.screen);
    qLine.style.fontSize = QFS + "px"; qLine.style.lineHeight = QFS * 1.3 + "px";
    const qName = el("sD-ch", qLine), qMark = el("sD-ch", qLine), qMid = el("sD-ch", qLine), qSlot = el("sD-ch", qLine), qAddr = el("sD-ch", qLine);
    qName.textContent = NAME; qMark.textContent = "?"; qMid.textContent = "·"; qSlot.textContent = SLOT; qAddr.textContent = ADDR;
    [qMark, qSlot, qAddr].forEach((e) => (e.style.fontWeight = "700"));
    qName.style.left = "0px"; qMark.style.left = COL_Q * QCW + "px"; qMid.style.left = COL_Q * QCW + "px";
    qSlot.style.left = COL_S * QCW + "px"; qAddr.style.left = COL_S * QCW + "px";
    const knot = el("sD-dot", ctx.screen);
    // where the `?` sits on screen: at R1 left of the window (on the threads' bus); at W above our roof (s13) or docked
    const C_R1 = { x: 474, y: 640 + (BUS - R1.y) * 1.25 };
    const C_TOP = { x: 1469 - ((COL_S + ADDR.length) * QCW) / 2 + (COL_Q + 0.5) * QCW, y: 352 };
    const C_DOCK = { x: 64 + (COL_Q + 0.5) * QCW, y: 352 };
    const lineLeft = (c) => c.x - (COL_Q + 0.5) * QCW;
    // s13: the `?` that hops, the nine A records (dig order), the address that drops into the slot
    const hopQ = el("sD-scr", ctx.screen); hopQ.textContent = "?";
    hopQ.style.cssText += `font-size:${QFS}px;line-height:${QFS * 1.3}px;font-weight:700;color:#ffc54d;text-shadow:0 0 16px rgba(255,190,70,.6);`;
    const RECORDS = ["91.189.92.23", "91.189.91.81", "91.189.91.83", "91.189.91.82", "185.125.190.83", "91.189.92.22", ADDR, "91.189.92.24", "185.125.190.81"];
    const OURS_REC = RECORDS.indexOf(ADDR);
    const recs = H13 ? RECORDS.map((r) => { const e = el("sD-rec", ctx.screen); e.textContent = r; return e; }) : [];

    // ================================================================== the map: towers seen from above
    // screen position (at W) of each roof centre; footprint in world px; floors below the roof
    const FULL = [D.user, D.tcp, D.ip, D.nic];
    const TOWERS = {
      far:      { sx: 330, sy: 470, roof: D.desk, w: 3000, h: 1900, floors: FULL, lit: 1 },
      ubuntu:   { sx: 318, sy: 158, roof: D.desk, w: 1600, h: 1100, floors: FULL },
      com:      { sx: 640, sy: 252, roof: D.desk, w: 1600, h: 1100, floors: FULL },
      root:     { sx: 904, sy: 150, roof: D.desk, w: 1600, h: 1100, floors: FULL },
      resolver: { sx: 1186, sy: 250, roof: D.desk, w: 1400, h: 960, floors: FULL },
      router:   { sx: 1060, sy: 722, roof: D.ip, w: 1500, h: 950, floors: [D.nic], short: true },
      x1: { sx: 132, sy: 744, roof: D.desk, w: 1500, h: 1100, floors: FULL },
      x2: { sx: 1792, sy: 776, roof: D.desk, w: 1500, h: 1000, floors: FULL },
      x3: { sx: 1800, sy: 136, roof: D.desk, w: 1200, h: 860, floors: FULL },
      x5: { sx: 676, sy: 348, roof: D.ip, w: 1000, h: 700, floors: [D.nic], short: true },
      x6: { sx: 930, sy: 372, roof: D.ip, w: 1000, h: 700, floors: [D.nic], short: true },
      x7: { sx: 1300, sy: 840, roof: D.ip, w: 1100, h: 720, floors: [D.nic], short: true },
    };
    const GROW = 0.1;
    const plates = [];                                               // every floor plate of every tower (incl. ours)
    const mkPlate = (parent, x, y, w, h, kind, tower, d, idx) => {
      const e = el("sD-plate", parent);
      e.style.width = w + "px"; e.style.height = h + "px";
      e.style.transform = `translate3d(${(x - w / 2).toFixed(1)}px, ${(y - h / 2).toFixed(1)}px, 0px)`;
      e.style.borderRadius = Math.round(Math.min(w, h) * 0.05) + "px";
      if (kind === "roof" || kind === "rtop") e.appendChild(document.createElement("i"));   // a rooftop square: towers read as nested squares
      plates.push({ el: e, inner: e.querySelector("i"), kind, tower, d, idx });
      return e;
    };
    Object.entries(TOWERS).forEach(([id, tw]) => {
      const p = atW(tw.sx, tw.sy, tw.roof); tw.x = p.x; tw.y = p.y; tw.id = id;
      tw.roofEl = mkPlate(tw.roof === D.desk ? roofP : FLOOR_P[tw.roof], tw.x, tw.y, tw.w, tw.h, tw.short ? "rtop" : "roof", id, tw.roof, 0);
      tw.plates = tw.floors.map((d, k) => mkPlate(FLOOR_P[d], tw.x, tw.y, tw.w * (1 + GROW * (k + 1)), tw.h * (1 + GROW * (k + 1)), "floor", id, d, k + 1));
    });
    const ourPlates = FULL.map((d, k) => mkPlate(FLOOR_P[d], AX.x, AX.y, 5320 * (1 + GROW * (k + 1)), 2700 * (1 + GROW * (k + 1)), "ours", "ours", d, k + 1));
    const RT = TOWERS.router, FAR = TOWERS.far;
    // corner pillars for the two towers we visit: the router (a short tower, two floors) and the far tower
    const pillars = [];
    const mkPillars = (tw, top, wd, inset) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
      const x = tw.x + sx * (tw.w / 2 - inset), y = tw.y + sy * (tw.h / 2 - inset), H = D.gnd - top;
      const a = el("sD-pillar", ctx.root); a.style.width = wd + "px"; a.style.height = H + "px";
      a.style.transform = `translate3d(${x - wd / 2}px, ${y}px, ${-top}px) rotateX(-90deg)`;
      const b = el("sD-pillar", ctx.root); b.style.width = H + "px"; b.style.height = wd + "px";
      b.style.transform = `translate3d(${x}px, ${y - wd / 2}px, ${-top}px) rotateY(90deg)`;
      pillars.push({ a, b, tw: tw.id });
    });
    mkPillars(RT, D.ip, 6, 30);
    mkPillars(FAR, D.desk, 14, 60);

    // map labels (world text sized for W: one screen px at W = 1 / sW(d) world px)
    const mapLab = (parent, text, sx, sy, d, px, align = "center") => {
      const e = el("sD-lab", parent); e.textContent = text;
      const fs = px / sW(d); e.style.fontSize = fs.toFixed(1) + "px"; e.style.lineHeight = (fs * 1.25).toFixed(1) + "px";
      const p = atW(sx, sy, d), wpx = text.length * 0.6 * fs;
      const x = align === "center" ? p.x - wpx / 2 : align === "right" ? p.x - wpx : p.x;
      e.style.transform = `translate3d(${x.toFixed(1)}px, ${(p.y - fs * 0.625).toFixed(1)}px, 0px)`;
      return e;
    };
    // the far tower's label = the docked question line, in the world (the gold part is the protagonist until "message")
    const farLab = el("sD-lab", roofP);
    {
      const fs = QFS * KR, p = atW(lineLeft(C_DOCK), C_DOCK.y, D.desk);
      farLab.style.fontSize = fs.toFixed(2) + "px"; farLab.style.lineHeight = (fs * 1.3).toFixed(2) + "px";
      farLab.style.transform = `translate3d(${p.x.toFixed(1)}px, ${(p.y - fs * 0.65).toFixed(1)}px, 0px)`;
      farLab.innerHTML = `<span>${NAME}</span><span></span><span></span>`;
    }
    const [farName, farMid, farAddr] = Array.from(farLab.children);
    farAddr.style.fontWeight = "700";

    // s13: the DNS towers' names and their NS lists (texture; one name lit), the threads the question follows
    const dns = {};
    const hopSvg = svgEl("svg", roofP, { class: "sD-svg", width: 10, height: 10 });
    if (H13) {
      const listOf = (pre) => "abcdefghijklm".split("").map((c) => `${c}.${pre}.net.`);
      const nsList = (tw, names, lit, fs) => names.map((n, i) => { const e = mapLab(roofP, n, tw.sx + 80, tw.sy - ((names.length - 1) * fs * 1.24) / 2 + i * fs * 1.24, D.desk, fs, "left"); e.dataset.lit = i === lit ? "1" : ""; return e; });
      const R = TOWERS.resolver, RO = TOWERS.root, CO = TOWERS.com, UB = TOWERS.ubuntu;
      dns.resolver = { lab: mapLab(roofP, "resolver", R.sx, R.sy - 62, D.desk, 22), sub: mapLab(roofP, "10.0.2.3", R.sx + 80, R.sy, D.desk, 18, "left"), list: [] };
      dns.root = { lab: mapLab(roofP, ".", RO.sx, RO.sy - 66, D.desk, 30), list: nsList(RO, listOf("root-servers"), 5, 11) };
      dns.com = { lab: mapLab(roofP, "com.", CO.sx, CO.sy - 62, D.desk, 22), list: nsList(CO, listOf("gtld-servers"), 8, 11) };
      dns.ubuntu = { lab: mapLab(roofP, "ubuntu.com.", UB.sx, UB.sy - 62, D.desk, 22), list: nsList(UB, ["ns1.canonical.com.", "ns2.canonical.com.", "ns3.canonical.com."], 1, 15) };
    }
    // hop path (screen at W): our question → resolver → root → com. → ubuntu.com.  (each hop lands on its word)
    const HOPS = H13 ? [
      { from: { x: C_TOP.x, y: C_TOP.y }, to: TOWERS.resolver, t: Q.resolver },
      { from: TOWERS.resolver, to: TOWERS.root, t: Q.root },
      { from: TOWERS.root, to: TOWERS.com, t: Q.dotcom },
      { from: TOWERS.com, to: TOWERS.ubuntu, t: Q.ubuntu },
    ].map((h) => {
      const a = { x: h.from.sx ?? h.from.x, y: h.from.sy ?? h.from.y }, b = { x: h.to.sx, y: h.to.sy };
      const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 70 };
      const pt = (u) => ({ x: (1 - u) ** 2 * a.x + 2 * (1 - u) * u * c.x + u * u * b.x, y: (1 - u) ** 2 * a.y + 2 * (1 - u) * u * c.y + u * u * b.y });
      // the thread it leaves behind (world, on the roofs' level)
      let d = ""; for (let k = 0; k <= 24; k++) { const p = pt(k / 24), w = atW(p.x, p.y, D.desk); d += (k ? " L " : "M ") + w.x.toFixed(0) + " " + w.y.toFixed(0); }
      const path = svgEl("path", hopSvg, { d, fill: "none", stroke: "rgba(170,215,255,.5)", "stroke-width": (1.6 * KR).toFixed(0), "stroke-linecap": "round" });
      path.setAttribute("pathLength", "1");
      return { ...h, a, b, pt, path, t0: h.t - 0.62 };
    }) : [];

    // ================================================================== the ground: land lights, the sea, routes
    const gsvg = svgEl("svg", groundP, { class: "sD-svg", width: 10, height: 10 });
    const SEA = [[512, 428], [600, 404], [700, 414], [790, 438], [868, 478], [930, 540], [968, 616], [984, 690], [966, 762], [918, 818], [826, 846], [700, 850], [600, 826], [528, 772], [492, 690], [478, 600], [486, 502]].map(([a, b]) => gW(a, b));
    const inSea = (x, y) => { let c = false; for (let i = 0, j = SEA.length - 1; i < SEA.length; j = i++) { const [xi, yi] = SEA[i], [xj, yj] = SEA[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
    const seaPath = OT.flow.path(SEA.concat([SEA[0]]), { curve: 0.9 });
    const dOf = (P, stride = 3) => { let s = `M ${P.X[0].toFixed(0)} ${P.Y[0].toFixed(0)}`; for (let i = stride; i < P.n; i += stride) s += ` L ${P.X[i].toFixed(0)} ${P.Y[i].toFixed(0)}`; return s + ` L ${P.X[P.n - 1].toFixed(0)} ${P.Y[P.n - 1].toFixed(0)}`; };
    // routes: the main one is the cable (router → sea → far tower); two detours over other routers / another cable
    const OUR_DOOR = gW(1160, 640), RT_BASE = gW(1053, 714), FAR_BASE = gW(441, 500), RT_HOP = gW(1108, 688);
    const RT_PORT = gW(1006, 716);
    const CABLE = [RT_PORT, gW(978, 712), gW(880, 676), gW(760, 620), gW(640, 574), gW(536, 546), gW(484, 526), FAR_BASE];
    const cable = OT.flow.path(CABLE, { curve: 0.8 });
    const HI = [FAR_BASE, gW(500, 412), gW(640, 356), gW(676, 348), gW(800, 334), gW(930, 372), gW(1010, 470), gW(1040, 600), RT_BASE];
    const LO = [FAR_BASE, gW(458, 610), gW(520, 752), gW(660, 826), gW(840, 826), gW(1000, 790), gW(1300, 840), RT_BASE];
    const hiP = OT.flow.path(HI, { curve: 0.7 }), loP = OT.flow.path(LO, { curve: 0.7 });
    let gs = `<defs><clipPath id="sD-seaclip"><path d="${dOf(seaPath)}"/></clipPath>` +
      `<radialGradient id="sD-pool"><stop offset="0" stop-color="#bfefff" stop-opacity=".42"/><stop offset=".35" stop-color="#bfefff" stop-opacity=".12"/><stop offset="1" stop-color="#bfefff" stop-opacity="0"/></radialGradient></defs>`;
    gs += `<path class="sea" d="${dOf(seaPath)}" fill="#05222a" fill-opacity=".9"/>`;
    // seabed ripples: across the cable, so the run along it streams over them
    {
      const a0 = cable.at(0), a1 = cable.at(cable.L);
      const ux = (a1.x - a0.x) / Math.hypot(a1.x - a0.x, a1.y - a0.y), uy = (a1.y - a0.y) / Math.hypot(a1.x - a0.x, a1.y - a0.y);
      const r = OT.rng(31);
      let rd = "";
      for (let k = 0; k < 30; k++) {
        const s = (k / 29) * cable.L, c = cable.at(s), L = 4200 + r() * 1800, ph = r() * 6.28, amp = 120 + r() * 120;
        let d = "";
        for (let v = -L / 2, j = 0; v <= L / 2; v += 160, j++) {
          const w = amp * Math.sin(v / 520 + ph) + 60 * Math.sin(v / 170 + k);
          d += (j ? " L " : "M ") + (c.x - uy * v + ux * w).toFixed(0) + " " + (c.y + ux * v + uy * w).toFixed(0);
        }
        rd += `<path d="${d}"/>`;
      }
      gs += `<g class="ridges" clip-path="url(#sD-seaclip)" fill="none" stroke="rgba(120,200,200,.1)" stroke-linecap="round" stroke-linejoin="round">${rd}</g>`;
    }
    gs += `<path class="coast" d="${dOf(seaPath)}" fill="none" stroke="rgba(120,200,200,.24)"/>`;
    // land lights (a city at night): big soft specks for the far view, small bright points up close
    {
      const r = OT.rng(57);
      let far = "", near = "";
      for (let k = 0; k < 118; k++) {
        const [x, y] = gW(-60 + r() * 2040, 30 + r() * 860);
        const warm = r() < 0.6, rr = r();
        if (inSea(x, y)) continue;
        far += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(14 + rr * 14).toFixed(0)}" fill="${warm ? "rgba(255,214,160,.5)" : "rgba(170,215,255,.42)"}"/>`;
        near += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(3 + rr * 3).toFixed(1)}" fill="${warm ? "#ffe2b8" : "#cfe6ff"}"/>`;
      }
      gs += `<g class="lightsFar">${far}</g><g class="lightsNear">${near}</g>`;
    }
    gs += `<path class="cableGlass" d="${dOf(cable)}" fill="none" stroke="rgba(191,239,255,.12)" stroke-linecap="round"/>`;
    gs += `<path class="cableCore" d="${dOf(cable)}" fill="none" stroke="rgba(191,239,255,.42)" stroke-linecap="round"/>`;
    gs += `<path class="route" d="${dOf(hiP)}" fill="none" stroke="rgba(120,200,255,.16)"/><path class="route" d="${dOf(loP)}" fill="none" stroke="rgba(120,200,255,.16)"/>`;
    gs += `<circle class="pool" r="1100" fill="url(#sD-pool)"/>`;
    gsvg.innerHTML = gs;
    const gq = (s) => gsvg.querySelector(s);
    const sea = gq(".sea"), coast = gq(".coast"), ridges = gq(".ridges"), lightsFar = gq(".lightsFar"), lightsNear = gq(".lightsNear");
    const cGlass = gq(".cableGlass"), cCore = gq(".cableCore"), routes = Array.from(gsvg.querySelectorAll(".route")), pool = gq(".pool");

    // ================================================================== packets on the wide map (on the ground)
    const PIN = OT.flow.path(CABLE.slice().reverse().concat([RT_HOP, OUR_DOOR]), { curve: 0.7 });    // far → ours
    const POUT = OT.flow.path([OUR_DOOR, RT_HOP].concat(CABLE), { curve: 0.7 });                     // ours → far
    const HIN = OT.flow.path(HI.concat([RT_HOP, OUR_DOOR]), { curve: 0.7 });
    const LIN = OT.flow.path(LO.concat([RT_HOP, OUR_DOOR]), { curve: 0.7 });
    // the murmuration: braided strands around the main route (each strand is the route with a slow wave across it)
    const braid = (k) => {
      const P = PIN, pts = [];
      for (let s = 0; s <= P.L; s += P.L / 60) {
        const q = P.at(s), env = Math.sin(Math.PI * clamp(s / P.L)) ** 0.7;
        const off = env * KG * (26 * Math.sin((s / P.L) * Math.PI * (2.2 + 0.4 * k) + k * 1.9) + 10 * Math.sin((s / P.L) * Math.PI * 7 + k));
        pts.push([q.x + q.nx * off, q.y + q.ny * off]);
      }
      return OT.flow.path(pts, { curve: 0.5 });
    };
    const V = PIN.L / 1.25;                                          // a packet crosses the map in ≈ 1.25 s
    const tr = PIN.L / V;
    const vol = OT.flow.volleys([[T.ten - tr * 0.5, 10, 0.32], [T.twice1 - tr * 0.5, 20, 0.4], [T.twice2 - tr * 0.5, 40, 0.5]]);
    const F0 = T.until - tr * 0.6, F1 = T.tcp2 + 0.9;               // the bulk of the transfer is sent in [F0, F1]
    const FLOCK0 = T.tf - tr * 0.6;
    const pk = { speed: V, speedVar: 0.12, lateral: 5 * KG, pinch: 0.8, wander: 2.5 * KG, wavelength: 420 * KG, size: 3 * KG, trail: 14 * KG, color: "#ffc54d", glow: 0.5, alpha: 0.95, fade: 30 * KG };
    const strand = (k) => ({ ...pk, path: braid(k), rate: [[FLOCK0 + k * 0.08, 0], [T.packets, 170], [F1 - 0.6, 170], [F1, 0]], lateral: 9 * KG, wander: 5 * KG,
      wavelength: 300 * KG, size: 2.2 * KG, trail: 9 * KG, speedVar: 0.18, alpha: 0.78, glow: 0.35, seed: 33 + k * 4 });
    const tResent = T.resent - 0.1;
    const flow = OT.flow(groundP, {
      res: 0.09,
      streams: [
        { ...pk, path: PIN, births: vol, size: 5 * KG, trail: 26 * KG, lateral: 3 * KG, speedVar: 0.05 },                                     // slow start
        { ...pk, path: PIN, rate: [[F0, 0], [T.lineFull, 230], [FLOCK0 + 0.3, 230], [FLOCK0 + 1.2, 0]], seed: 21 },                          // the line fills
        ...[0, 1, 2, 3, 4, 5].map(strand),                                                                                                   // the murmuration
        { ...pk, path: HIN, rate: [[T.other - 0.9, 0], [T.other - 0.3, 210], [F1 - 0.6, 210], [F1, 0]], lateral: 16 * KG, wander: 8 * KG, size: 2.2 * KG, trail: 9 * KG, speedVar: 0.25, alpha: 0.75, glow: 0.35, seed: 61 },
        { ...pk, path: LIN, rate: [[T.other - 0.6, 0], [T.other, 180], [F1 - 0.6, 180], [F1, 0]], lateral: 14 * KG, wander: 7 * KG, size: 2.2 * KG, trail: 9 * KG, speedVar: 0.25, alpha: 0.75, glow: 0.35, seed: 67 },
        { ...pk, path: PIN, births: OT.flow.volleys([[tResent, 7, 0.35]], 13), size: 4.6 * KG, trail: 24 * KG, speedVar: 0.05, seed: 81 },                       // resent
        { path: POUT, rate: [[vol[0] + tr, 0], [vol[0] + tr + 0.3, 30], [T.lineFull, 110], [F1 + tr, 420], [F1 + tr + 0.5, 0]], speed: V, speedVar: 0.1, lateral: 4 * KG,
          pinch: 0.8, wander: 0, size: 1.8 * KG, trail: 9 * KG, color: "#b9ccff", alpha: 0.35, glow: 0, fade: 30 * KG, seed: 93 },          // ACKs
      ],
      bursts: [
        { path: PIN, at: T.synack - 0.3, dur: 1.0, label: "SYN-ACK", color: "#ffc54d", size: 22 * KG, labelSize: 44 * KG, tail: 120 * KG, side: -1, ping: true },
        { path: POUT, at: T.ack - 0.5, dur: 1.0, label: "ACK", color: "#ffc54d", size: 22 * KG, labelSize: 44 * KG, tail: 120 * KG, side: 1, ping: true },
        { path: POUT, at: T.server - 0.9, dur: 1.05, label: "GET", color: "#ffc54d", size: 18 * KG, labelSize: 40 * KG, tail: 100 * KG, side: 1, ping: true },
        // out of order: 1448 leaves first but slower; 2896 overtakes it mid-route and arrives first
        { path: PIN, at: T.out - 1.0, dur: 1.75, ease: "lin", label: "1448", color: "#ffc54d", size: 9 * KG, labelSize: 28 * KG, tail: 50 * KG, side: 1, ping: false, keepLabel: true, hold: 0.35 },
        { path: PIN, at: T.out - 0.55, dur: 1.0, ease: "lin", label: "2896", color: "#ffc54d", size: 9 * KG, labelSize: 28 * KG, tail: 50 * KG, side: -1, ping: false, keepLabel: true, hold: 0.35 },
      ],
    });
    // the SYN that made the whole journey: named where it arrived
    const synLab = mapLab(groundP, "SYN", 520, 425, D.gnd, 44);
    synLab.style.fontWeight = "700"; synLab.style.color = "#ffc54d"; synLab.style.textShadow = `0 0 ${(14 * KG).toFixed(0)}px rgba(255,190,70,.6)`;
    // a few get lost on the lower detour (they turn pink and fade off the route)
    const LOST = [0, 1, 2, 3, 4].map((k) => {
      const e = el("sD-lostp", groundP); const sz = 9 * KG; e.style.width = e.style.height = sz + "px"; e.style.margin = `${-sz / 2}px 0 0 ${-sz / 2}px`;
      return { el: e, born: T.lost - 0.95 + k * 0.11, die: 0.35 + 0.08 * k + 0.05 * OT.hash(k, 3), side: OT.hash(k, 5) - 0.5 };
    });

    // ================================================================== local light
    const bloomAt = (parent, x, y, size, rgb) => { const b = OT.C.bloom(parent, { size, rgb }); ctx.place(b, x, y, 0); return b; };
    const farBloom = bloomAt(roofP, FAR.x, FAR.y, 9000, "150,215,255");
    const rtBloom = bloomAt(nicP, RT.x, RT.y, 2600, "255,214,140");

    // ================================================================== the message on its way down (screen space: rides with the camera)
    const ENV = [
      { key: "tcp", label: "TCP · SYN · → :80", x0: -270, x1: 270, y0: -95, y1: 55, ly: -70, col: "143,224,255", lc: "rgba(214,242,255,", t: T.tcp },
      { key: "ip", label: `IP · 10.0.2.15 → ${ADDR}`, x0: -360, x1: 360, y0: -155, y1: 85, ly: -130, col: "143,224,255", lc: "rgba(214,242,255,", t: T.ip },
      { key: "wifi", label: "Wi-Fi frame", x0: -440, x1: 440, y0: -215, y1: 115, ly: -190, col: "255,176,112", lc: "rgba(255,226,204,", t: T.wifi },
    ];
    const mkBundle = (parent) => {
      const root = el("sD-abs", parent);
      const envs = ENV.map((e) => {
        const L = el("sD-env", root), R = el("sD-env", root), lab = el("sD-elab", root);
        [L, R].forEach((h, i) => {
          h.style.width = (e.x1 - e.x0) / 2 + "px"; h.style.height = e.y1 - e.y0 + "px";
          h.style.border = `2.5px solid rgba(${e.col},.85)`; h.style.background = `rgba(${e.col},.06)`;
          h.style[i ? "borderLeft" : "borderRight"] = "none";
          h.style.borderRadius = i ? "0 16px 16px 0" : "16px 0 0 16px";
        });
        lab.textContent = e.label;
        if (e.key === "ip") lab.innerHTML = `IP · 10.0.2.15 → <span>${ADDR}</span>`;
        return { ...e, L, R, lab, addr: lab.querySelector("span") };
      });
      const dot = el("sD-dot", root);
      return { root, envs, dot };
    };
    const scrB = mkBundle(ctx.screen);

    // gold radio rings (world, NIC level) from our antenna: the front rides just ahead of the camera to the router
    const ringSvg = svgEl("svg", ringP, { class: "sD-svg", width: 10, height: 10 });
    const RINGS = [0, 1, 2, 3].map(() => svgEl("circle", ringSvg, { cx: 960, cy: 640, fill: "none", stroke: "#ffc54d" }));
    const RT_CAM = { x: RT.x, y: RT.y + 40, z: D.ip };
    const ringReach = Math.hypot(RT.x - 960, RT.y - 640);

    // the message re-formed at the router (world): dot + TCP + IP (+ the Wi-Fi frame it arrived in)
    const rtB = mkBundle(ctx.root);
    // the pulse of light in glass (world, on the ground) and its gold heart
    const pulse = el("sD-abs", groundP), pulseCore = el("sD-dot", groundP);
    pulse.style.cssText += "width:560px;height:64px;margin:-32px 0 0 -280px;border-radius:32px;background:radial-gradient(ellipse at 72% 50%, rgba(255,255,255,.95) 0%, rgba(191,239,255,.75) 20%, rgba(191,239,255,.18) 52%, rgba(191,239,255,0) 72%);";
    pulseCore.style.width = pulseCore.style.height = "26px"; pulseCore.style.margin = "-13px 0 0 -13px";
    // it climbs the far tower as we rise with it
    const climb = el("sD-dot", ctx.root);

    // ================================================================== the landing: our TCP floor, one perfect line
    const line = OT.C.seqline(lineP, { n: 48 });
    line.el.style.left = "243px"; line.el.style.top = "628px";
    const NS = line.cells.length, SLOT_X = (k) => 243 + 12 + k * 30, SLOT_Y = 640;
    const slots = line.cells.map((c, k) => { const s = el("sD-slot", lineP); s.style.left = SLOT_X(k) - 12 + "px"; s.style.top = "628px"; return s; });
    lineP.appendChild(line.el);                                      // the cells above their empty slots
    const GAP = 29;                                                  // the slot whose segment was lost: filled last, on "perfect"
    const tL0 = T.tcp2 + 1.95, tL1 = T.perfect - 0.3;                // the line fills in sequence order, out of order locally
    const slotT = line.cells.map((_, k) => (k === GAP ? T.perfect + 0.04 : lerp(tL0, tL1, k / (NS - 1)) + 0.34 * (OT.hash(k, 7) - 0.5)));
    // landing packets: six ways in from the left (the far tower is that way); each group lands in its eight slots
    const LV = 1700, LDUR = 0.4;
    const landStreams = [0, 1, 2, 3, 4, 5].map((j) => {
      const k0 = j * 8, xm = SLOT_X(k0 + 3.5), yo = (j % 2 ? -1 : 1) * (70 + 20 * (j % 3));
      const P = OT.flow.path([[-280, 640 + yo * 4.2], [xm * 0.35, 640 + yo * 2.2], [xm - 260, 640 + yo * 1.1], [xm - 60, 640 + yo * 0.45]], { curve: 0.7 });
      const births = [];
      for (let k = k0; k < k0 + 8; k++) {
        if (k === GAP) continue;
        for (let m = 0; m < 22; m++) births.push([slotT[k] - 0.04 - 0.7 * OT.hash(k * 31 + m, 3 + j) - P.L / LV - LDUR, k]);
      }
      births.sort((a, b) => a[0] - b[0]);
      return { path: P, births: births.map((b) => b[0]), slotOf: births.map((b) => b[1]) };
    });
    const landFlow = OT.flow(lineP, {
      res: 1, box: [-300, 120, 1720, 1160],
      streams: landStreams.map((s, j) => ({ path: s.path, births: s.births, speed: LV, speedVar: 0, lateral: 22, pinch: 0.7, wander: 8, size: 4, trail: 20,
        color: "#ffc54d", glow: 0.6, alpha: 0.95, seed: 101 + j * 7, fade: 30,
        land: { at: (i) => [SLOT_X(s.slotOf[i]), SLOT_Y], dur: LDUR, hold: 0.05, fade: 0.3, ease: "cubicOut" } })),
      bursts: [{ path: [[-280, 300], [400, 420], [SLOT_X(GAP) - 300, 560], [SLOT_X(GAP) - 70, 626], [SLOT_X(GAP), SLOT_Y]], at: T.perfect - 0.95, dur: 1.0, ease: "cubicOut",
        color: "#ffc54d", size: 16, tail: 120, side: -1, ping: true }],
    });
    const lineBloom = bloomAt(lineP, SLOT_X(GAP), SLOT_Y, 900, "255,214,140");
    // a ruler of byte offsets as the first segments land (relative offsets: multiples of 1448)
    const offs = [0, 8, 16, 24, 32, 40].map((k) => { const o = el("sD-off", lineP); o.textContent = String(k * 1448); o.style.left = SLOT_X(k) - 12 + "px"; o.style.top = "580px"; return { el: o, k }; });

    // ================================================================== camera
    const tPull0 = T.exactly - 0.08, tPull1 = T.exactly + 1.62;            // R1 → W
    const tDive0 = T.goes - 0.05, tDive1 = T.tcp - 0.28;                    // W → our TCP floor
    const tIp0 = T.ip - 0.62, tIp1 = T.ip - 0.1, tNic0 = T.wifi - 0.6, tNic1 = T.wifi - 0.08;
    const tRad0 = T.radio + 0.22, tRad1 = T.short - 0.2;                    // ride the radio to the router
    const tRun0 = T.light - 0.32;                                            // plunge into the fibre: the run
    const tShore = T.second + 0.75, tUp0 = T.far - 0.15, tUp1 = T.far + 1.42; // decelerate at the far shore; rise to W
    const tPush0 = T.tcp2 - 0.18, tPush1 = T.tcp2 + 1.62;                  // W → our TCP floor (the landing)
    // when an eased move passes a depth (for ground colours keyed to where the camera is)
    const passZ = (ta, tb, za, zb, ease, z) => { let lo = 0, hi = 1; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if ((lerp(za, zb, E[ease](m)) - z) * Math.sign(zb - za) < 0) lo = m; else hi = m; } return lerp(ta, tb, (lo + hi) / 2); };
    // the pulse runs the cable: speed keys whose integral is the cable's length, the near coast reached on "ocean"
    const coastS = (() => { for (let s = 0; s < cable.L; s += 20) { const p = cable.at(s); if (inSea(p.x, p.y)) return s; } return cable.L * 0.15; })();
    const RUNZ = D.gnd - 200;
    const vA = coastS / (0.35 + (T.ocean - (tRun0 + 0.7)));
    const rest = cable.L - coastS, tc = T.ocean, te = tShore;
    const vB = (rest - vA * 0.4) / (0.4 + (te - 0.9 - tc - 0.8) + 0.45);
    const runS = OT.flow.schedule([[tRun0, 0], [tRun0 + 0.7, vA], [tc, vA], [tc + 0.8, vB], [te - 0.9, vB], [te, 0]]);
    const pulseS = (t) => Math.min(cable.L, runS.N(t));
    const camKeys = [
      [t0, R0], [T.term - 0.15, R0], [T.sudo - 0.06, { ...R1, ease: "quintInOut" }], [tPull0, R1], [tPull1, { ...W, ease: "quintInOut" }],
      [tDive0, W], [tDive1, { ...AT(D.tcp), ease: "quintInOut" }], [tIp0, AT(D.tcp)], [tIp1, { ...AT(D.ip), ease: "smoother" }],
      [tNic0, AT(D.ip)], [tNic1, { ...AT(D.nic), ease: "smoother" }], [tRad0, AT(D.nic)], [tRad1, { ...RT_CAM, ease: "cubicInOut" }], [tRun0, RT_CAM],
    ];
    // the run: follow the pulse (no ease: one long flight), plunging from the router to just above the cable
    for (let t = tRun0 + 0.35; t < tShore - 0.01; t += 0.3) {
      const p = cable.at(pulseS(t)), u = ramp(tRun0, tRun0 + 0.9, t, "cubicInOut");
      const lift = ramp(tShore - 1.4, tShore, t, "sineInOut");
      camKeys.push([t, { x: lerp(RT_CAM.x, p.x, Math.min(1, u * 1.15)), y: lerp(RT_CAM.y, p.y, Math.min(1, u * 1.15)), z: lerp(RT_CAM.z, RUNZ, u) - 420 * lift }]);
    }
    const SHORE = { x: cable.at(cable.L).x, y: cable.at(cable.L).y, z: RUNZ - 420 };
    camKeys.push([tShore, SHORE], [tUp0, SHORE], [tUp1, { ...W, ease: "quintInOut" }], [tPush0, W], [tPush1, { ...AT(D.tcp), ease: "quintInOut" }], [t1, AT(D.tcp)]);
    ctx.cam(camKeys);
    ctx.exit(AT(D.tcp));

    // ================================================================== ground, motes, light
    const NIGHT = "#111d33", PAPER = "#e2dacb", PLUM = "#2b2140", KERN = "#070c1c", SIL = "#210904", SEAC = "#05222a";
    const roofGone = (ta, tb) => passZ(ta, tb, W.z, D.tcp, "quintInOut", D.desk - 1700);     // our roof has dissolved
    const inUser = (ta, tb) => passZ(ta, tb, W.z, D.tcp, "quintInOut", D.user - 650);        // between the roof and the user floor
    const inKern = (ta, tb) => passZ(ta, tb, W.z, D.tcp, "quintInOut", D.user + 120);        // past the user floor: the kernel
    const dG = [roofGone(tDive0, tDive1), inUser(tDive0, tDive1), inKern(tDive0, tDive1)];
    const pG = [roofGone(tPush0, tPush1), inUser(tPush0, tPush1), inKern(tPush0, tPush1)];
    const tSeaIn = T.ocean - 0.12, tSeaOut = tShore - 0.55;
    ctx.ground([
      [t0, PAPER], [tPull0 + 0.38, PAPER], [tPull0 + 0.95, NIGHT], [dG[0], NIGHT], [dG[1], PLUM], [dG[2], PLUM], [dG[2] + 0.22, KERN],
      [tNic1 - 0.4, KERN], [tNic1, SIL], [tRad0 + 0.5, SIL], [tRad0 + 1.1, NIGHT], [tSeaIn, NIGHT], [tSeaIn + 0.3, SEAC], [tSeaOut, SEAC], [tSeaOut + 0.4, NIGHT],
      [pG[0], NIGHT], [pG[1], PLUM], [pG[2], PLUM], [pG[2] + 0.22, KERN], [t1, KERN],
    ]);
    ctx.motes([[t0, "dust"], [tPull0 + 0.5, "none"], [dG[1], "spores"], [dG[2], "sparks"], [tNic1 - 0.1, "embers"], [tRad0 + 0.8, "none"],
      [tSeaIn + 0.1, "plankton"], [tSeaOut + 0.2, "none"], [pG[1], "spores"], [pG[2], "sparks"]]);
    ctx.margins(0, 0);

    // lamp #1 (s13): it follows the `?` from tower to tower.  lamp #2 (s17): along the two detours.
    const LK = [];
    const roofLamp = (tw, r) => ({ x: tw.x, y: tw.y, d: D.desk, r, dim: 0.42 });
    if (H13) {
      const stack = atW(1600, 200, D.desk);
      LK.push([Q.resolver - 0.3, null], [Q.resolver + 0.05, roofLamp(TOWERS.resolver, 1350)], [Q.root - 0.25, {}], [Q.root + 0.15, roofLamp(TOWERS.root, 1600)],
        [Q.dotcom - 0.25, {}], [Q.dotcom + 0.15, roofLamp(TOWERS.com, 1600)], [Q.ubuntu - 0.25, {}], [Q.ubuntu + 0.15, roofLamp(TOWERS.ubuntu, 1600)],
        [Q.answers - 0.05, {}], [Q.answers + 0.5, { x: stack.x, y: stack.y, d: D.desk, rx: 3800, ry: 2600 }], [Q.addressEnd + 0.05, {}], [Q.addressEnd + 0.5, null]);
    }
    {
      const hiMid = hiP.at(hiP.L * 0.5), loMid = loP.at(loP.L * 0.55);
      LK.push([T.other - 0.35, null], [T.other + 0.1, { x: hiMid.x, y: hiMid.y, d: D.gnd, rx: 3400, ry: 2000, dim: 0.4 }], [T.routes + 0.1, {}],
        [T.routes + 0.65, { x: loMid.x, y: loMid.y, rx: 3800, ry: 1900 }], [T.out - 0.1, {}], [T.out + 0.35, null]);
    }
    ctx.light(LK);

    // ================================================================== render
    const sOf = (d, t) => { const c = ctx.camAt(t); return 1000 / (1000 - (c.z - d)); };
    const fromScreen = (sx, sy, d, t) => { const c = ctx.camAt(t); const s = 1000 / (1000 - (c.z - d)); return { x: c.x + (sx - 960) / s, y: c.y + (sy - 640) / s, s }; };
    const nearA = (d, t, a = 250, b = 620) => 1 - sstep(a, b, ctx.camAt(t).z - d);
    const mixc = (a, b, u) => OT.rgb(OT.mix(a, b, u));
    const tDock0 = H13 ? Q.addressEnd + 0.15 : tPull0, tDock1 = H13 ? Q.addressEnd + 1.15 : tPull1;
    const tFarWorld = H13 ? T.tower - 0.7 : tPull1 + 0.9;                   // the docked line hands over to its world copy
    const dotOn = T.message - 0.05;
    const roofSpot = { x: 640, y: 300, d: D.desk };                          // where the message starts: the terminal

    ctx.render((t) => {
      const on = t >= t0 && t < t1;
      const cam = ctx.camAt(t);

      // ---------------- the desktop roof
      const roofEff = cam.z - D.desk;
      const diving = (t > tDive0 && t < tUp0) || t > tPush0;
      const roofA = on ? (diving ? 1 - sstep(-4500, -2000, roofEff) : 1) * nearA(D.desk, t) : 0;
      ctx.show(deskP, roofA);
      const night = sstep(tPull0 + 0.3, tPull0 + 0.95, t);
      paper.style.opacity = sstep(tPull0, tPull0 + 0.35, t).toFixed(3);
      roofGlow.style.opacity = (night * 0.9).toFixed(3);

      // pointer → the terminal icon; the window grows out of it
      const pu = ramp(t0 + 0.4, T.open - 0.08, t, "expoOut");
      const pIcon = { x: termIcon.x - 3 * 2.4, y: termIcon.y - 2 * 2.4 };
      pointer.style.transformOrigin = "0 0";
      pointer.style.transform = `translate3d(${lerp(420, pIcon.x, pu).toFixed(1)}px, ${lerp(720, pIcon.y, pu).toFixed(1)}px, 0px) scale(2.4)`;
      pointer.style.opacity = win(t, t0 + 0.35, t0 + 0.55, T.term - 0.2, T.term + 0.05).toFixed(3);
      const pressing = t >= T.open && t < T.open + 0.6;
      termIconEl.style.transform = pressing ? `scale(${(1 - 0.08 * Math.exp(-(t - T.open) * 9) * Math.cos((t - T.open) * 26)).toFixed(4)})` : "none";
      termIconEl.classList.toggle("on", t >= T.open + 0.05);
      const fold = 1 - ramp(T.open + 0.12, T.term + 0.2, t, "expoOut");
      const fs = lerp(1, 0.035, fold);
      winWrap.style.transform = fold > 0.0005 ? `translate3d(${lerp(0, termIcon.x - 960 * fs, fold).toFixed(1)}px, ${lerp(0, termIcon.y - 540 * fs, fold).toFixed(1)}px, 0px) scale(${fs.toFixed(4)})` : "none";
      ctx.show(winWrap, t >= T.open + 0.12 ? 1 : 0);
      term.render(t);

      // ---------------- parcels + threads
      const sD = sOf(D.desk, t);
      const C = (() => {                                              // the `?` (screen) — the threads converge on it
        if (t < tPull0) return C_R1;
        const u = ramp(tPull0, tPull1, t, "quintInOut");
        const tgt = H13 ? C_TOP : C_DOCK;
        let c = { x: lerp(C_R1.x, tgt.x, u), y: lerp(C_R1.y, tgt.y, u) };
        if (H13 && t > tDock0) { const v = ramp(tDock0, tDock1, t, "quintInOut"); c = { x: lerp(C_TOP.x, C_DOCK.x, v), y: lerp(C_TOP.y, C_DOCK.y, v) }; }
        return c;
      })();
      const Cw = fromScreen(C.x, C.y, D.desk, t);
      // the threads let go once the name has docked (with s13 a little before: they would cross the address)
      const tLet = H13 ? tDock1 - 0.4 : tPull1 + 0.2;
      const threadsA = win(t, T.clang - 0.05, T.clang + 0.1, tLet, tLet + (H13 ? 0.6 : 1.0));
      const thrCol = mixc([118, 100, 74], [170, 215, 255], night);
      parcels.forEach((p, i) => {
        const pop = ramp(p.tPop, p.tPop + 0.42, t, "backOut"), vis = sstep(p.tPop - 0.02, p.tPop + 0.1, t);
        const par = p.parent ? { x: p.parent.x, y: p.parent.y + p.parent.h / 2 } : WORD;
        const x = lerp(par.x, p.x, pop), y = lerp(par.y, p.y, pop);
        p.el.style.transform = `translate3d(${(x - p.w / 2).toFixed(1)}px, ${(y - p.h / 2).toFixed(1)}px, 0px)`;
        p.el.style.opacity = vis.toFixed(3);
        if (p.lab) {
          p.lab.style.transform = `translate3d(${(x - p.labW / 2).toFixed(1)}px, ${(y + p.labDy - 10).toFixed(1)}px, 0px)`;
          p.lab.style.opacity = (vis * sstep(p.tPop + 0.15, p.tPop + 0.4, t)).toFixed(3);
        }
        // thread: to its parent until "archive"; then it bends: up to the bus, then left to the `?`
        const bend = ramp(T.archive - 0.22 + 0.014 * i, T.archive + 0.62 + 0.014 * i, t, "cubicInOut");
        const ax = x, ay = y - p.h / 2;
        const a1 = [ax, ay - 40], a2 = [par.x, par.y + 40];
        const busY = Cw.y + (i % 5 - 2) * 3 / sD;                    // a loose bundle
        const b1 = [ax, busY + (ay - busY) * 0.12], b2 = [ax - (ax - Cw.x) * 0.5, busY];
        const L2 = (a, b) => [lerp(a[0], b[0], bend), lerp(a[1], b[1], bend)];
        const c1 = L2(a1, b1), c2 = L2(a2, b2), e2 = L2([par.x, par.y], [Cw.x, Cw.y]);
        p.path.setAttribute("d", `M ${ax.toFixed(1)} ${ay.toFixed(1)} C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${e2[0].toFixed(1)} ${e2[1].toFixed(1)}`);
        p.path.setAttribute("stroke", thrCol);
        p.path.setAttribute("stroke-width", (lerp(2.2, 1.5, night) / sD).toFixed(2));
        p.path.setAttribute("opacity", (vis * threadsA * (p.k < 0 ? 1 : 0.75) * lerp(1, 0.7, night)).toFixed(3));
      });

      // ---------------- the question line (screen)
      const qA = on ? sstep(T.archive - 0.05, T.archive + 0.1, t) * (1 - sstep(tFarWorld, tFarWorld + 0.5, t)) : 0;
      ctx.show(qLine, qA);
      const goldNight = mixc([162, 106, 5], [255, 197, 77], night), glow = night > 0.5 ? "0 0 16px rgba(255,190,70,.6)" : "none";
      if (qA > 0.002) {
        qLine.style.transform = `translate(${lineLeft(C).toFixed(1)}px, ${(C.y - QFS * 0.65).toFixed(1)}px)`;
        // written as it is spoken: archive · . · ubuntu · . · com
        const nCh = t < T.dot1 ? 7 : t < T.ubuntu ? 8 : t < T.dot2 ? 14 : t < T.com ? 15 : 18;
        qName.textContent = NAME.slice(0, nCh);
        qName.style.color = mixc([30, 29, 26], [220, 240, 255], night);
        // the `?`: on "where,"; with s13 it hops away on "asks" (its seat becomes a quiet ·)
        const qOn = sstep(T.where - 0.05, T.where + 0.12, t) * (H13 ? 1 - sstep(HOPS[0].t0 - 0.03, HOPS[0].t0 + 0.03, t) : 1);
        qMark.style.opacity = qOn.toFixed(3); qMark.style.color = goldNight; qMark.style.textShadow = glow;
        qMid.style.opacity = H13 ? (sstep(Q.resolver - 0.6, Q.resolver - 0.3, t) * 0.55).toFixed(3) : "0"; qMid.style.color = "rgba(220,240,255,.85)";
        const slotOn = H13 ? sstep(Q.numbers - 0.05, Q.numbers + 0.25, t) * (1 - sstep(Q.address + 0.28, Q.address + 0.36, t)) : 0;
        qSlot.style.opacity = slotOn.toFixed(3); qSlot.style.color = "#ffc54d"; qSlot.style.textShadow = "0 0 14px rgba(255,190,70,.45)";
        const addrOn = H13 ? sstep(Q.address + 0.3, Q.address + 0.36, t) : 0;
        qAddr.style.opacity = addrOn.toFixed(3); qAddr.style.color = "#ffc54d"; qAddr.style.textShadow = "0 0 16px rgba(255,190,70,.6)";
      }
      const knotA = on ? win(t, T.archive + 0.45, T.archive + 0.7, T.where - 0.05, T.where + 0.1) : 0;
      ctx.show(knot, knotA);
      if (knotA > 0.002) { knot.style.width = knot.style.height = "9px"; knot.style.background = "#7a6a52"; knot.style.boxShadow = "none"; knot.style.transform = `translate(${(C.x - 4.5).toFixed(1)}px, ${(C.y - 4.5).toFixed(1)}px)`; }

      // s13: the hops, the answer
      if (!H13) ctx.show(hopQ, 0);
      else {
        const hk = HOPS.findIndex((h) => t < h.t);
        const hopA = on ? win(t, HOPS[0].t0 - 0.03, HOPS[0].t0 + 0.03, Q.answers - 0.05, Q.answers + 0.25) : 0;
        ctx.show(hopQ, hopA);
        if (hopA > 0.002) {
          const h = hk < 0 ? HOPS[HOPS.length - 1] : HOPS[hk];
          const u = ramp(h.t0, h.t - 0.02, t, "cubicInOut");
          const p = h.pt(u);
          hopQ.style.transform = `translate(${(p.x - QCW / 2).toFixed(1)}px, ${(p.y - QFS * 0.65).toFixed(1)}px)`;
        }
        HOPS.forEach((h) => {
          const u = ramp(h.t0, h.t - 0.02, t, "cubicInOut");
          h.path.setAttribute("stroke-dasharray", `${u.toFixed(4)} 1`);
          h.path.setAttribute("opacity", (on && u > 0.002 ? (1 - sstep(Q.addressEnd + 0.1, Q.addressEnd + 0.7, t)) * 0.9 : 0).toFixed(3));
        });
        // nine A records fly back from ubuntu.com. and stand still in dig order above the slot; ours drops into the slot
        const slotX = lineLeft(C_TOP) + COL_S * QCW, base = C_TOP.y - 40;
        recs.forEach((e, i) => {
          const t0r = Q.answers - 0.08 + i * 0.012, u = ramp(t0r, t0r + 0.6, t, "cubicInOut");
          const by = base - (RECORDS.length - 1 - i) * 25 - 12, ay = TOWERS.ubuntu.sy - 112 + (by - (base - 212));
          const x = lerp(TOWERS.ubuntu.sx - 60, slotX, u), y = lerp(ay, by, u) - Math.sin(Math.PI * u) * 40;
          const mine = i === OURS_REC;
          const drop = mine ? ramp(Q.address - 0.02, Q.address + 0.3, t, "cubicInOut") : 0;
          const fz = lerp(21, QFS, drop);
          const tx = lerp(x, slotX, drop), ty = lerp(y, C_TOP.y - fz * 0.65, drop);
          const a = sstep(t0r - 0.02, t0r + 0.1, t) * (mine ? 1 - sstep(Q.address + 0.3, Q.address + 0.36, t) : 1 - sstep(Q.address + 0.1, Q.address + 0.6, t));
          ctx.show(e, on ? a : 0);
          if (a > 0.002) {
            e.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
            e.style.fontSize = fz.toFixed(2) + "px"; e.style.lineHeight = (fz * 1.2).toFixed(2) + "px";
            const g = mine ? sstep(Q.address - 0.12, Q.address + 0.02, t) : 0;
            e.style.color = g > 0 ? mixc([220, 240, 255], [255, 197, 77], g) : "rgba(220,240,255,.85)";
            e.style.fontWeight = mine && g > 0.5 ? "700" : "500";
            e.style.textShadow = g > 0.02 ? `0 0 16px rgba(255,190,70,${(0.6 * g).toFixed(3)})` : "none";
          }
        });
      }

      // ---------------- the map
      const mapOn = on && t > tPull0 + 0.2;
      const floorsLit = sstep(T.tower - 0.1, T.tower + 0.9, t);
      ctx.show(roofP, mapOn ? nearA(D.desk, t) : 0);
      const running = win(t, T.light + 0.7, T.light + 1.3, tShore - 0.9, tShore - 0.3);   // along the seabed: no floors above us
      [userP, tcpP, ipP, nicP].forEach((P, k) => ctx.show(P, mapOn ? nearA(FULL[k], t, 150, 560) * (1 - running) : 0));
      ctx.show(groundP, mapOn ? nearA(D.gnd, t) : 0);
      const landing = t > tPush0 + 0.9;                               // our TCP floor: only the line remains
      plates.forEach((pl) => {
        const s = sOf(pl.d, t);
        const bw = clamp(1.8 / s, 3, 40);
        if (pl.kind === "roof" || pl.kind === "rtop") {
          const lit = pl.tower === "far" ? 1 : 0;
          pl.el.style.borderWidth = bw.toFixed(1) + "px";
          pl.el.style.borderColor = `rgba(150,205,255,${(0.34 + 0.16 * floorsLit + 0.2 * lit).toFixed(3)})`;
          pl.el.style.background = pl.kind === "rtop" ? "rgba(26,42,68,.42)" : lit ? "linear-gradient(160deg, rgba(32,56,92,.62), rgba(21,36,61,.55))" : "linear-gradient(160deg, rgba(27,44,71,.9), rgba(18,30,51,.86))";
          pl.el.style.boxShadow = lit ? `0 0 ${(26 / s).toFixed(0)}px rgba(143,224,255,.35)` : "none";
          if (pl.inner) pl.inner.style.borderWidth = (bw * 0.8).toFixed(1) + "px";
        } else {
          // floors: plates stacked in depth; on "tower" they light up from the top down
          const k = pl.idx;
          const ripple = sstep(T.tower - 0.1 + k * 0.14, T.tower + 0.45 + k * 0.14, t);
          const ours = pl.kind === "ours";
          const acc = pl.d === D.user ? "226,206,255" : pl.d === D.nic ? "255,150,90" : "150,205,255";
          pl.el.style.borderWidth = bw.toFixed(1) + "px";
          pl.el.style.borderColor = `rgba(${acc},${(0.05 + 0.4 * ripple).toFixed(3)})`;
          pl.el.style.background = `rgba(${acc},${(0.012 + 0.03 * ripple).toFixed(3)})`;
          if (ours) {
            // seen from inside: a faint grid on the floor we are standing at
            const gridA = sstep(0.55, 0.9, s) * (1 - sstep(1.5, 2.6, s)) * 0.2;
            pl.el.style.backgroundImage = gridA > 0.004 ? `repeating-linear-gradient(0deg, rgba(${acc},${gridA.toFixed(3)}) 0 3px, transparent 3px 300px), repeating-linear-gradient(90deg, rgba(${acc},${gridA.toFixed(3)}) 0 3px, transparent 3px 300px)` : "none";
            const away = win(t, tRad0 + 0.4, tRad0 + 1.0, tUp1 - 0.6, tUp1);
            pl.el.style.opacity = landing ? (1 - sstep(T.land - 0.4, T.perfect - 0.3, t)).toFixed(3) : (1 - away).toFixed(3);
          }
        }
      });
      pillars.forEach((p) => { const a = mapOn ? 1 : 0; ctx.show(p.a, a); ctx.show(p.b, a); });
      // the far tower: lit faintly; it glows when the pulse arrives and when it is ready to send
      const farGlow = win(t, tUp1 - 0.6, tUp1 - 0.1, tUp1 + 0.4, tUp1 + 1.6) + win(t, T.sends - 0.35, T.sends, T.sends + 0.6, T.sends + 1.6);
      ctx.show(farBloom, mapOn ? clamp(farGlow) * 0.5 : 0);
      // labels
      const farLabA = mapOn ? sstep(tFarWorld, tFarWorld + 0.5, t) * nearA(D.desk, t) : 0;
      ctx.show(farLab, farLabA);
      if (farLabA > 0.002) {
        const goldU = 1 - sstep(T.message - 0.05, T.message + 0.45, t);
        const hasAddr = H13 || t > T.read;
        farMid.textContent = hasAddr ? " · " : " ?"; farAddr.textContent = hasAddr ? ADDR : "";
        farName.style.color = "rgba(220,240,255,.85)";
        const gc = mixc([220, 240, 255], [255, 197, 77], goldU);
        farMid.style.color = hasAddr ? "rgba(220,240,255,.47)" : gc; farAddr.style.color = gc;
        farMid.style.fontWeight = hasAddr ? "400" : "700";
        farMid.style.textShadow = farAddr.style.textShadow = goldU > 0.02 ? `0 0 ${(16 * KR).toFixed(0)}px rgba(255,190,70,${(0.6 * goldU).toFixed(3)})` : "none";
      }
      if (H13) {
        const dnsA = (tq) => (on ? sstep(tq - 0.05, tq + 0.3, t) * (1 - sstep(T.layers, T.layers + 0.6, t)) : 0);
        ctx.show(dns.resolver.lab, dnsA(Q.resolver)); ctx.show(dns.resolver.sub, dnsA(Q.resolver) * 0.75);
        [["root", Q.root], ["com", Q.dotcom], ["ubuntu", Q.ubuntu]].forEach(([k, tq]) => {
          ctx.show(dns[k].lab, dnsA(tq));
          dns[k].list.forEach((e, i) => {
            ctx.show(e, dnsA(tq + 0.12 + i * 0.012) * (e.dataset.lit ? 1 : 0.4));
            e.style.color = e.dataset.lit ? "#ffffff" : "rgba(220,240,255,.85)";
          });
        });
      }
      // the ground: lines keep a constant on-screen width; detail fades in only when we are close
      const sG = sOf(D.gnd, t);
      const close = sstep(0.12, 0.3, sG);
      coast.setAttribute("stroke-width", clamp(2 / sG, 3, 60).toFixed(1));
      ridges.setAttribute("stroke-width", clamp(2.4 / sG, 14, 40).toFixed(1));
      ridges.setAttribute("opacity", close.toFixed(3));
      lightsFar.setAttribute("opacity", (1 - close).toFixed(3)); lightsNear.setAttribute("opacity", close.toFixed(3));
      sea.setAttribute("fill", mixc([8, 52, 62], [5, 34, 42], close)); sea.setAttribute("fill-opacity", lerp(0.8, 1, close).toFixed(3));
      cGlass.setAttribute("stroke-width", clamp(6 / sG, 40, 200).toFixed(1));
      cCore.setAttribute("stroke-width", clamp(1.4 / sG, 9, 40).toFixed(1));
      routes.forEach((r) => { r.setAttribute("stroke-width", clamp(1.8 / sG, 3, 60).toFixed(1)); r.setAttribute("opacity", (0.3 + 0.7 * win(t, T.other - 0.6, T.other, T.lineEnd, T.lineEnd + 1)).toFixed(3)); });
      // wide-map packets
      const flowA = on ? win(t, T.syn - 1.5, T.syn - 1.0, tPush0 + 0.35, tPush0 + 1.0) : 0;
      ctx.show(flow.el, flowA);
      if (flowA > 0.002) flow.render(t);
      const synA = on ? win(t, T.syn - 0.12, T.syn + 0.08, T.synack - 0.55, T.synack - 0.35) : 0;   // gone before SYN-ACK leaves (they overlapped)
      ctx.show(synLab, synA);
      LOST.forEach((L) => {
        const age = t - L.born, s = age * V, die = L.die * loP.L;
        const a = on && age > 0 && s < die + 0.5 * V ? sstep(0, 0.08, age) * (1 - sstep(die, die + 0.45 * V, s)) : 0;
        ctx.show(L.el, a);
        if (a > 0.002) {
          const p = loP.at(Math.min(s, die + (s - die) * 0.3)), drift = Math.max(0, s - die) * 0.7 * Math.sign(L.side || 1);
          L.el.style.transform = `translate3d(${(p.x + p.nx * drift).toFixed(0)}px, ${(p.y + p.ny * drift).toFixed(0)}px, 0px)`;
          const pink = sstep(die - 0.05 * V, die + 0.05 * V, s);
          L.el.style.background = mixc([255, 197, 77], [255, 92, 154], pink);
          L.el.style.boxShadow = `0 0 ${(14 * KG).toFixed(0)}px ${(4 * KG).toFixed(0)}px ${pink > 0.5 ? "rgba(255,92,154,.75)" : "rgba(255,190,70,.6)"}`;
        }
      });

      // ---------------- the gold message on the way down (screen)
      const bundleA = on ? win(t, dotOn, dotOn + 0.25, T.radio - 0.05, T.radio + 0.3) : 0;
      ctx.show(scrB.root, bundleA);
      if (bundleA > 0.002) {
        // the dot: from the terminal on our roof down the tower to the centre of the screen
        const dst = { x: 960, y: 640, d: D.tcp };
        const u = ramp(tDive0 - 0.05, tDive1 - 0.12, t, "cubicInOut");
        const pr = t >= tDive1 ? { x: 960, y: 640 } : ctx.project(lerp(roofSpot.x, dst.x, u), lerp(roofSpot.y, dst.y, u), lerp(roofSpot.d, dst.d, u), t);
        const dsz = lerp(18, 26, sstep(tDive0, tDive1, t));
        scrB.dot.style.width = scrB.dot.style.height = dsz.toFixed(1) + "px";
        scrB.dot.style.transform = `translate(${(pr.x - dsz / 2).toFixed(1)}px, ${(pr.y - dsz / 2).toFixed(1)}px)`;
        const melt = sstep(T.radio - 0.1, T.radio + 0.25, t);
        scrB.envs.forEach((e) => {
          const close2 = ramp(e.t - 0.32, e.t + 0.06, t, "cubicOut");
          const vis = sstep(e.t - 0.34, e.t - 0.2, t);
          const off = (1 - close2) * 150 + melt * 60;
          e.L.style.transform = `translate(${(960 + e.x0 - off).toFixed(1)}px, ${(640 + e.y0).toFixed(1)}px)`;
          e.R.style.transform = `translate(${(960 + (e.x0 + e.x1) / 2 + off).toFixed(1)}px, ${(640 + e.y0).toFixed(1)}px)`;
          e.L.style.opacity = e.R.style.opacity = vis.toFixed(3);
          // the label: brightest on its word, then quieter
          const named = sstep(e.t - 0.05, e.t + 0.12, t), later = ENV.some((o) => o.t > e.t && t > o.t) ? 1 : 0;
          e.lab.style.transform = `translate(960px, ${(640 + e.ly - 20).toFixed(1)}px)`;
          e.lab.style.opacity = (named * (later ? 0.6 : 1)).toFixed(3);
          e.lab.style.color = `${e.lc}1)`;
          e.lab.style.textShadow = later ? "none" : `0 0 18px rgba(${e.col},.45)`;
          if (e.addr) e.addr.style.opacity = H13 ? "1" : "0.55";      // without s13 the address is first *read* at the router
        });
      }

      // ---------------- radio rings → the router
      const ringA = on ? win(t, T.radio - 0.1, T.radio + 0.1, tRad1 + 0.05, tRad1 + 0.5) : 0;
      ctx.show(ringP, ringA);
      if (ringA > 0.002) {
        const sN = sOf(D.nic, t);
        const front = Math.max(1500 * (t - T.radio), Math.hypot(cam.x - 960, cam.y - 640) + 520);
        RINGS.forEach((c, k) => {
          const r = Math.max(1, front - k * 300);
          c.setAttribute("r", r.toFixed(1));
          c.setAttribute("stroke-width", clamp(5 / sN, 5, 30).toFixed(1));
          c.setAttribute("opacity", (0.9 * (1 - k * 0.2) * sstep(T.radio + k * 0.12, T.radio + k * 0.12 + 0.12, t) * (1 - sstep(ringReach + 200, ringReach + 900, r))).toFixed(3));
        });
      }

      // ---------------- the router: the message re-forms, climbs to the IP floor, is read, is sent on
      const tArr = tRad1 - 0.2;
      const rtA = on ? win(t, tArr - 0.2, tArr + 0.15, T.light - 0.1, T.light + 0.3) : 0;
      ctx.show(rtB.root, rtA);
      ctx.show(rtBloom, on ? win(t, tArr - 0.25, tArr, tArr + 0.4, tArr + 1.4) * 0.8 + win(t, T.read - 0.2, T.read + 0.1, T.addr, T.addr + 0.6) * 0.45 : 0);
      if (rtA > 0.002) {
        const up = ramp(T.they - 0.1, T.ipFloor + 0.05, t, "cubicInOut"), down = ramp(T.send - 0.05, T.send + 0.55, t, "cubicInOut");
        const out = ramp(T.send + 0.35, T.light - 0.05, t, "cubicInOut");
        const d = t < T.send ? lerp(D.nic, D.ip - 6, up) : lerp(lerp(D.ip - 6, D.nic, down), D.gnd, out);
        const port = cable.at(0);
        const x = lerp(RT.x, port.x, out), y = lerp(RT.y, port.y, out);
        rtB.root.style.transform = `translate3d(${(x - 960).toFixed(1)}px, ${(y - 640).toFixed(1)}px, ${(-d).toFixed(1)}px)`;
        rtB.dot.style.width = rtB.dot.style.height = "26px";
        rtB.dot.style.transform = `translate(947px, 627px) scale(${lerp(1, 0.4, out).toFixed(3)})`;
        const readU = win(t, T.read - 0.15, T.read + 0.15, T.send - 0.1, T.send + 0.3);
        rtB.envs.forEach((e) => {
          const keep = e.key === "wifi" ? 1 - sstep(T.they, T.ipFloor - 0.3, t) : 1 - sstep(T.light - 0.45, T.light - 0.05, t);
          const vis = sstep(tArr - 0.1, tArr + 0.3, t) * keep * (1 - out * 0.85);
          e.L.style.transform = `translate(${960 + e.x0}px, ${640 + e.y0}px)`;
          e.R.style.transform = `translate(${960 + (e.x0 + e.x1) / 2}px, ${640 + e.y0}px)`;
          e.L.style.opacity = e.R.style.opacity = vis.toFixed(3);
          e.lab.style.transform = `translate(960px, ${640 + e.ly - 20}px)`;
          e.lab.style.opacity = (vis * (e.key === "ip" ? 1 : 0.55)).toFixed(3);
          e.lab.style.color = `${e.lc}.9)`;
          e.lab.style.textShadow = "none";
          if (e.addr) {
            // the router reads the address: a reading light on it — the brightest thing
            e.addr.style.opacity = "1";
            e.addr.style.color = readU > 0.02 ? mixc([214, 242, 255], [255, 252, 240], readU) : "inherit";
            e.addr.style.fontWeight = readU > 0.5 ? "700" : "600";
            e.addr.style.textShadow = readU > 0.02 ? `0 0 ${(14 * readU).toFixed(0)}px rgba(255,240,200,${(0.95 * readU).toFixed(3)}), 0 0 ${(40 * readU).toFixed(0)}px rgba(255,214,140,${(0.7 * readU).toFixed(3)})` : "none";
          }
        });
      }

      // ---------------- light in glass: the pulse runs the cable
      const pulseA = on ? win(t, T.light - 0.2, T.light + 0.1, tUp0 + 0.1, tUp0 + 0.5) : 0;
      ctx.show(pulse, pulseA); ctx.show(pulseCore, pulseA);
      ctx.show(pool, on ? win(t, T.light, T.light + 0.4, tShore - 0.2, tShore + 0.4) : 0);
      if (pulseA > 0.002) {
        const p = cable.at(Math.max(0, pulseS(t)));
        pulse.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0px) rotate(${((p.a * 180) / Math.PI).toFixed(2)}deg)`;
        pulseCore.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0px)`;
        pool.setAttribute("cx", p.x.toFixed(1)); pool.setAttribute("cy", p.y.toFixed(1));
      }
      // it rises up the far tower, floor by floor, with us
      const climbA = on ? win(t, tUp0 - 0.05, tUp0 + 0.15, tUp1 - 0.25, tUp1 + 0.15) : 0;
      ctx.show(climb, climbA);
      if (climbA > 0.002) {
        const d = lerp(D.gnd, D.tcp, ramp(tUp0, tUp1 - 0.3, t, "cubicInOut"));
        const sc = sOf(d, t), sz = 24 / sc;
        climb.style.width = climb.style.height = sz.toFixed(1) + "px";
        ctx.place(climb, FAR.x - sz / 2, FAR.y - sz / 2, d);
      }

      // ---------------- the landing on our TCP floor
      const landOn = on && t > pG[2] - 0.15;
      ctx.show(lineP, landOn ? 1 : 0);
      if (landOn) {
        landFlow.render(t);
        line.cells.forEach((c, k) => { c.style.opacity = sstep(slotT[k] - 0.16, slotT[k] + 0.14, t).toFixed(3); });
        slots.forEach((s, k) => { s.style.opacity = (sstep(tPush1 - 0.5, tPush1, t) * (1 - sstep(slotT[k] - 0.1, slotT[k] + 0.1, t)) * (1 - sstep(T.lineEnd - 0.6, T.lineEnd - 0.2, t))).toFixed(3); });
        offs.forEach((o) => { ctx.show(o.el, win(t, slotT[o.k] - 0.1, slotT[o.k] + 0.15, T.perfect - 0.55, T.perfect - 0.15)); });
        ctx.show(lineBloom, win(t, T.perfect - 0.05, T.perfect + 0.12, T.perfect + 0.3, T.lineEnd - 0.12) * 0.7);
      }
    });
  },
});
