/* Web player for a one-take film (built by scripts/build-web.py; shared by every project).
 *
 * The film is OT.render(t): every frame is a pure function of t. This file adds, without touching the engine:
 *   - a clock: the pre-mixed film track's currentTime while playing, smoothed between its updates,
 *   - player chrome: play/pause, scrub bar with chapters (English + Chinese), captions EN / EN + 中文 / 中文 / off,
 *     fullscreen, keys, touch,
 *   - explore mode: while paused, an offset {dx, dy, dz} on top of OT.camera(t) plus a tilt of the world around the
 *     point the camera looks at; "back to the shot" eases it all back to zero. Per-shot limits come from
 *     XP_DATA.explore.zones (web.json); tilt is held at zero while the film's lamp (focus.js) is lit,
 *   - inspect notes (web/notes.js) pinned to a few real objects,
 *   - an adaptive frame rate on slow machines (draws every other display frame while that keeps up better).
 * Data: window.XP_DATA (data.js, generated), window.OT_TIMING / OT (the project's engine), window.XP_NOTES.
 * URL: ?t=SECONDS opens there · ?cc=en|bi|zh|off · ?perf (fps overlay) · ?q=full|lite (pin the frame rate) ·
 *      ?audio=m4a|webm (pick a track data.js lists). window.XP is a small API for tests (seek, renderAt, setOffset, …).
 */
(function () {
  "use strict";
  const OT = window.OT;
  const TIMING = window.OT_TIMING;
  const D = window.XP_DATA || {};
  const DUR = TIMING.duration;
  const P = OT.P || 1000; // engine perspective
  const $ = (s, r = document) => r.querySelector(s);
  const body = document.body;
  const cls = (c, on) => body.classList.toggle(c, !!on);
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const qs = new URLSearchParams(location.search);
  const store = {
    get(k, d) { try { const v = localStorage.getItem("xp-" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("xp-" + k, JSON.stringify(v)); } catch (e) { /* private mode, blocked storage */ } },
  };
  const fmt = (s) => { s = Math.max(0, Math.floor(s + 1e-6)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const smoother = (u) => u * u * u * (u * (u * 6 - 15) + 10);
  const sstep = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const TITLE = D.title || document.title;

  // ------------------------------------------------------------------ chapters (data.js: from publish.json / web.json)
  const ACTS = D.acts || {};
  const SEQS = Object.values(TIMING.sequences).sort((a, b) => a.t0 - b.t0);
  const seqAt = (t) => SEQS.find((s) => t >= s.t0 && t < s.t1) || SEQS[SEQS.length - 1];
  const CH = (D.chapters && D.chapters.length ? D.chapters : SEQS.map((s) => ({ t: s.t0, en: (ACTS[s.id] || {}).en || s.id, zh: "", act: s.id })))
    .map((c, i) => ({ ...c, t: i === 0 ? 0 : c.t }));
  const chapterAt = (t) => { let i = 0; while (i < CH.length - 1 && t >= CH[i + 1].t) i++; return i; };

  // ------------------------------------------------------------------ captions: the engine's English (#ot-cap) or the bilingual block
  // the web track is the subtitle file's (data.js, the .srt's text and line breaks); the film's OT_TIMING.captionsZh is
  // its burned-in variant (one-line rewrites, per-cue lift) and only a fallback
  const ZHC = (D.captionsZh && D.captionsZh.length ? D.captionsZh : (TIMING.captionsZh || []).map((c) => ({ t0: c.t0, t1: c.t1, text: c.text }))) || [];
  const ENC = TIMING.captions || [];
  const MODES = ZHC.length ? ["en", "bi", "zh", "off"] : ["en", "off"];
  const MODE_LABEL = { en: "EN", bi: "EN + 中文", zh: "中文", off: "off" };
  const MODE_TEXT = { en: "English", bi: "English + 中文", zh: "中文", off: "Off" };
  let ccMode = qs.get("cc") || store.get("captions", ZHC.length ? "bi" : "en");
  if (!MODES.includes(ccMode)) ccMode = ZHC.length ? "bi" : "en";
  let capEl = null, cap2 = null, cap2En = null, cap2Zh = null;
  const cueAt = (list, t, hint) => {
    // cues are sorted; start from the last hit (playback) and fall back to a binary search (seeks)
    const h = hint.i;
    if (h >= 0 && h < list.length && t >= list[h].t0 && t < list[h].t1) return list[h];
    if (h + 1 < list.length && t >= list[h + 1].t0 && t < list[h + 1].t1) { hint.i = h + 1; return list[h + 1]; }
    let lo = 0, hi = list.length - 1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (list[m].t1 <= t) lo = m + 1; else if (list[m].t0 > t) hi = m - 1; else { hint.i = m; return list[m]; } }
    return null;
  };
  const hintEn = { i: 0 }, hintZh = { i: 0 };
  const vis = (c, t) => sstep(c.t0, c.t0 + 0.12, t) * (1 - sstep(c.t1 - 0.12, c.t1, t));
  const setStyle = (e, k, v) => { if (e.style[k] !== v) e.style[k] = v; };
  function drawCaptions(t) {
    if (!cap2 || (ccMode !== "bi" && ccMode !== "zh")) return;
    const c = ccMode === "bi" ? cueAt(ENC, t, hintEn) : null;
    const z = cueAt(ZHC, t, hintZh);
    const ae = c ? vis(c, t) : 0, az = z ? vis(z, t) : 0;
    if (c && cap2En.textContent !== c.text) cap2En.textContent = c.text;
    if (z && cap2Zh.textContent !== z.text) cap2Zh.textContent = z.text;
    setStyle(cap2En, "display", ccMode === "bi" ? "" : "none");
    setStyle(cap2En, "opacity", ae.toFixed(3));
    setStyle(cap2Zh, "opacity", az.toFixed(3));

    setStyle(cap2, "color", capEl.style.color);         // the engine styled #ot-cap for this instant (ground, flash,
    setStyle(cap2, "textShadow", capEl.style.textShadow); // lamp): the bilingual block wears the same colour and halo
    setStyle(cap2, "opacity", ae > 0 || az > 0 ? "1" : "0");
  }

  // ------------------------------------------------------------------ explore: an offset on top of the authored camera
  // off = applied now, goal = where the viewer is steering; par = hover lean (tilt only)
  const KEYS = ["dx", "dy", "dz", "yaw", "pitch"];
  const off = { dx: 0, dy: 0, dz: 0, yaw: 0, pitch: 0 };
  const goal = { dx: 0, dy: 0, dz: 0, yaw: 0, pitch: 0 };
  const par = { yaw: 0, pitch: 0 }, parGoal = { yaw: 0, pitch: 0 };
  // default limits: dolly from 2x in (planes nearer than that fade out in the engine's near-clip) to 0.43x out; the
  // look-at point stays within the authored frame (+ a margin),
  // so the story never leaves the screen; tilt up to a diorama view, never edge-on. web.json explore.limits overrides
  // them for the film, explore.zones for a stretch of it ({explore: false} = this shot cannot be explored).
  const BASE = Object.assign({ dzIn: 500, dzOut: -1300, x: 1100, yUp: -780, yDown: 600, yaw: 26, pitch: 18, explore: true }, (D.explore && D.explore.limits) || {});
  const ZONES = (D.explore && D.explore.zones) || [];
  let LIM = BASE, zoneNow = null;
  const lampOn = (t) => { try { return !!(OT.fx && OT.fx.lampAt && OT.fx.lampAt(t)); } catch (e) { return false; } };
  // dolly-in is also capped per shot so the plane in view stops short of the engine's near-clip fade (eff ≈ 430):
  // measured after the first paused render at a new t (renderNow → autoDolly)
  const auto = { t: NaN, dzIn: Infinity };
  function limitsAt(t) {
    const z = ZONES.find((k) => t >= k.t0 && t < k.t1) || null;
    let L = z ? Object.assign({}, BASE, z) : BASE;
    if (auto.t === t && auto.dzIn < L.dzIn) L = Object.assign({}, L, { dzIn: auto.dzIn });
    if (lampOn(t)) L = Object.assign({}, L, { yaw: 0, pitch: 0, lamp: true }); // the lamp's pool is screen-space: no tilt under it
    return [L, z];
  }
  let ret = null; // an authored ease back to the shot: { from, start, dur }
  const calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let parallaxOn = !calm; // the hover lean; suspended by "back to the shot" until the next explore gesture
  let renderT = NaN, offOn = false, tiltOn = false;

  const authoredCamera = OT.camera;
  // The offset applies only to the instant being rendered: lookups of the camera at other times (look-aheads inside
  // sequences, the engine's drift check) keep seeing the authored path, so nothing the film computes gets polluted.
  OT.camera = function (t) {
    const c = authoredCamera(t);
    if (!offOn || t !== renderT) return c;
    return { x: c.x + off.dx, y: c.y + off.dy, z: c.z + off.dz, roll: c.roll };
  };
  OT.authoredCamera = authoredCamera;

  function clampGoal() {
    goal.dz = clamp(goal.dz, LIM.dzOut, LIM.dzIn);
    goal.dx = clamp(goal.dx, -LIM.x, LIM.x);
    goal.dy = clamp(goal.dy, LIM.yUp, LIM.yDown);
    goal.yaw = clamp(goal.yaw, -LIM.yaw, LIM.yaw);
    goal.pitch = clamp(goal.pitch, -LIM.pitch, LIM.pitch);
    if (LIM.explore === false) KEYS.forEach((k) => (goal[k] = 0));
  }
  const offShot = () => KEYS.some((k) => Math.abs(goal[k]) > (k === "yaw" || k === "pitch" ? 0.4 : 4));
  const focalScale = () => P / (P - off.dz); // apparent scale of the authored focal plane
  const anyOff = () => KEYS.some((k) => Math.abs(off[k]) > 1e-3);

  function backToShot(dur = 0.95) {
    if (!anyOff()) { KEYS.forEach((k) => (goal[k] = off[k] = 0)); parGoal.yaw = parGoal.pitch = 0; parallaxOn = false; cls("xp-off-shot", false); return; }
    ret = { from: { ...off }, start: performance.now(), dur: dur * 1000 };
    KEYS.forEach((k) => (goal[k] = 0));
    parGoal.yaw = parGoal.pitch = 0;
    parallaxOn = false;
    cls("xp-off-shot", false);
  }

  // new t (seek, play): adopt that shot's limits; an offset that is no longer allowed eases back inside them
  function applyLimits(t) {
    const [L, z] = limitsAt(t);
    const changed = L !== LIM && JSON.stringify(L) !== JSON.stringify(LIM);
    LIM = L; zoneNow = z;
    cls("xp-noexplore", LIM.explore === false);
    if (!changed) return;
    const before = { ...goal };
    clampGoal();
    if (KEYS.some((k) => Math.abs(before[k] - goal[k]) > 1e-3)) { ret = null; cls("xp-off-shot", offShot()); }
  }

  // advance off → goal (or along the authored return); returns true when anything moved
  function stepExplore(dt, now) {
    let moved = false;
    if (ret) {
      const u = clamp((now - ret.start) / ret.dur, 0, 1), e = 1 - smoother(u);
      KEYS.forEach((k) => (off[k] = ret.from[k] * e));
      if (u >= 1) { ret = null; KEYS.forEach((k) => (off[k] = 0)); }
      moved = true;
    } else {
      const k = 1 - Math.exp(-dt * (gesture ? 22 : 9));
      KEYS.forEach((key) => {
        const d = goal[key] - off[key];
        if (d === 0) return;
        off[key] = Math.abs(d) < (key === "yaw" || key === "pitch" ? 0.002 : 0.05) ? goal[key] : off[key] + d * k;
        moved = true;
      });
    }
    const kp = 1 - Math.exp(-dt * 4.5);
    ["yaw", "pitch"].forEach((key) => {
      const g = LIM.yaw === 0 && LIM.pitch === 0 ? 0 : parGoal[key];
      const d = g - par[key];
      if (d === 0) return;
      par[key] = Math.abs(d) < 0.002 ? g : par[key] + d * kp;
      moved = true;
    });
    return moved;
  }

  // ------------------------------------------------------------------ stage, letterbox, captions above the bar
  const vp = $("#xp-viewport"), frameEl = $("#xp-frame");
  let world = null, tiltEl = null;
  const FR = { x: 0, y: 0, s: 1 };
  function layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const s = Math.min(vw / 1920, vh / 1080);
    FR.s = s; FR.x = (vw - 1920 * s) / 2; FR.y = (vh - 1080 * s) / 2;
    frameEl.style.transform = `translate(${FR.x.toFixed(2)}px, ${FR.y.toFixed(2)}px) scale(${s.toFixed(5)})`;
    dirty = true;
    capLift();
  }
  const toDesign = (cx, cy) => ({ x: (cx - FR.x) / FR.s, y: (cy - FR.y) / FR.s });
  const barEl = $("#xp-bar");
  let liftNow = -1;
  function capLift() {
    // the captions' lowest line sits ~48 px (design) above the frame's bottom edge; the bar's controls take its
    // height minus the gradient's top padding. When they overlap and the bar is showing, lift the captions.
    const showing = !body.classList.contains("xp-idle") && !body.classList.contains("xp-booting") && ccMode !== "off";
    const barTop = window.innerHeight - Math.max(0, barEl.offsetHeight - 14);
    const capBottom = FR.y + (1080 - 46) * FR.s;
    const lift = showing ? Math.max(0, (capBottom - barTop + 6) / FR.s) : 0;
    const v = Math.round(lift);
    if (v === liftNow) return;
    liftNow = v;
    document.documentElement.style.setProperty("--xp-caplift", v + "px");
    cls("xp-caplift", v > 0);
  }

  let lastBox = "";
  function letterbox() {
    const g = OT.groundNow || [18, 17, 16];
    const c = `rgb(${Math.round(g[0] * 0.42)},${Math.round(g[1] * 0.42)},${Math.round(g[2] * 0.42)})`;
    if (c !== lastBox) { lastBox = c; vp.style.background = c; }
  }

  // ------------------------------------------------------------------ render
  let t = 0, dirty = true, poster = true;
  const perf = { renders: 0, renderMs: 0, renderMax: 0 };
  function renderNow() {
    const a = performance.now();
    renderT = t;
    offOn = Math.abs(off.dx) > 1e-3 || Math.abs(off.dy) > 1e-3 || Math.abs(off.dz) > 1e-3;
    OT.render(t);
    drawCaptions(t);
    if (!playing && auto.t !== t) {
      auto.t = t;
      auto.dzIn = clamp(450 - (subjectEff() - off.dz), 80, BASE.dzIn);
      applyLimits(t);
    }
    const yaw = off.yaw + par.yaw, pitch = off.pitch + par.pitch;
    if (Math.abs(yaw) > 0.003 || Math.abs(pitch) > 0.003) {
      // tilt the world about the point on the vanishing point at the focal plane (stage (960, 640, 0)), where the
      // authored camera puts the subject. (A pivot at the median depth of the visible planes was tried: it swung several
      // episode-1 shots out of frame and helped none.)
      const r = `rotateX(${pitch.toFixed(3)}deg) rotateY(${yaw.toFixed(3)}deg)`;
      world.style.transform = r + " " + world.style.transform;
      tiltEl.style.transform = "perspective(1000px) " + r;
      tiltOn = true;
    } else if (tiltOn) { tiltEl.style.transform = ""; tiltOn = false; }
    letterbox();
    const ms = performance.now() - a;
    perf.renders++; perf.renderMs += ms; perf.renderMax = Math.max(perf.renderMax, ms);
  }

  // depth (stage z = eff, + towards the viewer) of what the frame shows: the opacity-weighted median of the visible
  // planes' depths, read from the transforms the engine just wrote (sequence root translate3d z + plane translate3d z).
  // Used to cap dolly-in per shot.
  const zOf = (el) => { const m = /translate3d\([^,]+,[^,]+,\s*(-?[\d.]+)px\)/.exec(el.style.transform); return m ? +m[1] : 0; };
  function subjectEff() {
    const cz = OT.camera(t).z, rows = [];
    world.querySelectorAll(":scope > .ot-seq").forEach((root) => {
      if (root.style.display === "none") return;
      const rz = zOf(root);
      root.querySelectorAll(".ot-plane").forEach((pl) => {
        if (pl.style.visibility === "hidden" || pl.style.display === "none") return;
        const a = pl.style.opacity === "" ? 1 : +pl.style.opacity;
        const eff = cz + rz + zOf(pl);
        if (a < 0.05 || eff > 820 || eff < -3000) return;
        rows.push([eff, a]);
      });
    });
    if (!rows.length) return 0;
    rows.sort((x, y) => x[0] - y[0]);
    const half = rows.reduce((s, r) => s + r[1], 0) / 2;
    let acc = 0;
    for (const [eff, a] of rows) { acc += a; if (acc >= half) return eff; }
    return 0;
  }

  // ------------------------------------------------------------------ audio clock
  const audio = $("#xp-audio");
  // data.js lists only the tracks the build made (web.json audio.formats, default AAC only). Opus/WebM is used only
  // when listed and playable; ?audio=m4a|webm picks a listed track (testing), anything else is ignored.
  const AU = D.audio || { m4a: "audio/film.m4a" };
  const opusOK = !!(AU.webm && audio.canPlayType && audio.canPlayType('audio/webm; codecs="opus"'));
  const wantAU = qs.get("audio");
  let SRC = (wantAU === "m4a" && AU.m4a) || (wantAU === "webm" && AU.webm) || (opusOK ? AU.webm : AU.m4a || AU.webm) || null;
  let playing = false, silent = false; // silent: no usable audio → free-running clock
  let anchorA = 0, anchorP = 0, lastA = -1, freeT0 = 0, freeP0 = 0;
  let blobURL = null;
  // fetch the whole track once (≈5 MB) so seeking never depends on the server's range support
  function prefetch(src) {
    if (!src || location.protocol === "file:" || !window.fetch) return;
    fetch(src).then((r) => (r.ok ? r.blob() : Promise.reject(r.status))).then((b) => {
      if (src !== SRC) return;
      blobURL = URL.createObjectURL(b);
      if (!audio.getAttribute("src")) { audio.src = blobURL; audio.preload = "auto"; }
    }).catch(() => { /* streamed on demand instead */ });
  }
  prefetch(SRC);
  function ensureSrc() { if (!audio.getAttribute("src") && (blobURL || SRC)) { audio.src = blobURL || SRC; audio.preload = "auto"; } }
  // a browser that says it plays Opus/WebM but cannot decode it gets the AAC track once (when listed), before the silent clock
  function fallback() {
    if (!AU.m4a || SRC === AU.m4a) return false;
    SRC = AU.m4a; blobURL = null;
    audio.src = SRC; audio.preload = "auto";
    if (playing) { try { audio.currentTime = t; } catch (e) {} anchorA = t; anchorP = performance.now(); lastA = -1; const p = audio.play(); if (p && p.catch) p.catch(goSilent); }
    return true;
  }
  function goSilent(err) {
    if (err && err.name === "AbortError") return;
    if (playing && !silent) { silent = true; freeT0 = t; freeP0 = performance.now(); }
  }

  function clock(now) {
    if (silent) return Math.min(DUR, freeT0 + (now - freeP0) / 1000);
    const a = audio.currentTime;
    if (a !== lastA) { lastA = a; anchorA = a; anchorP = now; }
    const flowing = !audio.paused && !audio.seeking && audio.readyState >= 3;
    const ext = flowing ? Math.min(0.12, (now - anchorP) / 1000) * (audio.playbackRate || 1) : 0;
    return Math.min(DUR, anchorA + ext);
  }
  function startAudio(now) {
    if (!SRC) silent = true; // no track listed: the film runs on the page clock
    if (silent) { freeT0 = t; freeP0 = now; return; }
    ensureSrc();
    try { audio.currentTime = t; } catch (e) { /* before metadata: re-seeked on loadedmetadata */ }
    anchorA = t; anchorP = now; lastA = -1;
    const p = audio.play();
    if (p && p.catch) p.catch((err) => {
      if (err && err.name === "AbortError") return;
      if (err && err.name === "NotSupportedError" && fallback()) return;
      // blocked or undecodable: keep the film running on the page clock rather than stalling
      silent = true; freeT0 = t; freeP0 = performance.now();
    });
  }
  let internalPause = false;
  audio.addEventListener("loadedmetadata", () => { if (playing && Math.abs(audio.currentTime - t) > 0.3) { try { audio.currentTime = t; } catch (e) {} } });
  audio.addEventListener("ended", () => { if (playing) { t = DUR - 0.001; setPlaying(false); } });
  audio.addEventListener("error", () => { if (!fallback()) goSilent(); });
  // OS / headset media keys pause the element directly
  audio.addEventListener("pause", () => { if (playing && !scrubbing && !audio.ended && !internalPause) setPlaying(false); });

  function setPlaying(on, quiet) {
    const now = performance.now();
    if (on === playing) return;
    if (on) {
      if (poster) { t = 0; leavePoster(); }
      if (t >= DUR - 0.05) t = 0;
      playing = true;
      closeNote(); closeMenus();
      if (anyOff() || Math.abs(par.yaw) + Math.abs(par.pitch) > 1e-3) backToShot(0.7);
      parGoal.yaw = parGoal.pitch = 0;
      startAudio(now);
      hint(null);
      quality.reset();
    } else {
      t = clock(now);
      playing = false;
      internalPause = true; audio.pause(); internalPause = false;
      parallaxOn = !calm;
      applyLimits(t);
      if (!quiet) pauseHint();
    }
    cls("xp-playing", playing); cls("xp-paused", !playing); cls("xp-explorable", !playing);
    $("#xp-play").setAttribute("aria-label", playing ? "Pause" : "Play");
    if ("mediaSession" in navigator) try { navigator.mediaSession.playbackState = playing ? "playing" : "paused"; } catch (e) {}
    dirty = true;
    wakeUI();
  }
  const togglePlay = () => setPlaying(!playing);

  function seek(nt) {
    t = clamp(nt, 0, DUR - 0.001);
    if (poster) leavePoster();
    if (playing) {
      const now = performance.now();
      if (silent) { freeT0 = t; freeP0 = now; } else { try { audio.currentTime = t; } catch (e) {} anchorA = t; anchorP = now; lastA = -1; }
    } else applyLimits(t);
    closeNote();
    dirty = true;
  }
  const seekBy = (d) => seek(t + d);
  function chapterJump(dir) {
    const i = chapterAt(t);
    if (dir < 0) seek(t - CH[i].t > 2.5 || i === 0 ? CH[i].t : CH[i - 1].t);
    else if (i < CH.length - 1) seek(CH[i + 1].t);
  }

  // ------------------------------------------------------------------ poster: a frame of the film; its Run pill starts the film
  const runspot = $("#xp-runspot");
  const POSTER_T = D.poster && isFinite(D.poster.t) ? D.poster.t : 0;
  let pillEl = null;
  function placeRunspot() {
    if (!poster || !pillEl) return;
    const r = pillEl.getBoundingClientRect();
    if (!r.width) return;
    const a = toDesign(r.left, r.top), b = toDesign(r.right, r.bottom);
    Object.assign(runspot.style, { left: a.x + "px", top: a.y + "px", width: b.x - a.x + "px", height: b.y - a.y + "px" });
  }
  function leavePoster() { poster = false; cls("xp-poster", false); hint(null); }
  runspot.addEventListener("click", (e) => { e.stopPropagation(); setPlaying(true); });

  // ------------------------------------------------------------------ chrome
  const scrub = $("#xp-scrub"), fill = $(".fill", scrub), head = $(".head", scrub), hov = $(".hover", scrub), tip = $(".tip", scrub);
  const timeNow = $("#xp-time .now"), chapN = $("#xp-chap .n"), chapT = $("#xp-chap .t");
  $("#xp-time .dur").textContent = " / " + fmt(DUR);
  scrub.setAttribute("aria-valuemax", DUR.toFixed(0));
  {
    const ticks = $(".ticks", scrub);
    CH.forEach((c, i) => {
      if (i === 0) return;
      const tk = document.createElement("i");
      if (CH[i - 1].act !== c.act) tk.className = "act";
      tk.style.left = ((c.t / DUR) * 100).toFixed(3) + "%";
      ticks.appendChild(tk);
    });
    const ol = $("#xp-chapters ol");
    let act = null;
    CH.forEach((c, i) => {
      if (c.act !== act) {
        act = c.act;
        const a = ACTS[act] || {};
        const h = document.createElement("li"); h.className = "act"; h.setAttribute("aria-hidden", "true");
        h.innerHTML = `<span>${esc(a.en || act)}</span>` + (a["zh-Hans"] ? `<span class="z" lang="zh-Hans">${esc(a["zh-Hans"])}</span>` : "");
        ol.appendChild(h);
      }
      const li = document.createElement("li");
      li.dataset.i = i; li.tabIndex = 0; li.setAttribute("role", "button");
      li.innerHTML = `<span class="tm">${fmt(c.t)}</span><span class="t"><b></b>${c.zh ? '<i lang="zh-Hans"></i>' : ""}</span>`;
      li.querySelector("b").textContent = c.en;
      if (c.zh) li.querySelector("i").textContent = c.zh;
      const go = () => { seek(c.t); closeMenus(); };
      li.addEventListener("click", go);
      li.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); go(); } });
      ol.appendChild(li);
    });
  }
  const chapTitle = (c) => (ccMode === "zh" && c.zh ? c.zh : c.en);
  let lastUI = { sec: -1, ch: -1, pct: -1, mode: "" };
  function updateUI() {
    const tt = poster ? 0 : t; // the poster shows a frame of the film, but Run starts the film at 0:00
    const pct = (tt / DUR) * 100;
    if (Math.abs(pct - lastUI.pct) > 0.004) {
      lastUI.pct = pct;
      fill.style.width = pct.toFixed(3) + "%";
      head.style.left = pct.toFixed(3) + "%";
    }
    const sec = Math.floor(tt);
    if (sec !== lastUI.sec) { lastUI.sec = sec; timeNow.textContent = fmt(tt); scrub.setAttribute("aria-valuenow", sec); scrub.setAttribute("aria-valuetext", fmt(tt)); }
    const ci = chapterAt(tt);
    if (ci !== lastUI.ch || ccMode !== lastUI.mode) {
      lastUI.ch = ci; lastUI.mode = ccMode;
      chapN.textContent = String(ci + 1).padStart(2, "0");
      chapT.textContent = chapTitle(CH[ci]);
      if (ccMode === "zh" && CH[ci].zh) chapT.setAttribute("lang", "zh-Hans"); else chapT.removeAttribute("lang");
      document.querySelectorAll("#xp-chapters li.on").forEach((e) => e.classList.remove("on"));
      const li = document.querySelector(`#xp-chapters li[data-i="${ci}"]`);
      if (li) li.classList.add("on");
      if ("mediaSession" in navigator && window.MediaMetadata) {
        try { navigator.mediaSession.metadata = new MediaMetadata({ title: TITLE, artist: CH[ci].en }); } catch (e) {}
      }
    }
  }

  // scrub bar
  let scrubbing = false, scrubWasPlaying = false;
  const scrubT = (cx) => { const r = scrub.getBoundingClientRect(); return clamp((cx - r.left) / r.width, 0, 1) * DUR; };
  function showTip(cx) {
    const r = scrub.getBoundingClientRect();
    const tt = scrubT(cx), u = tt / DUR, c = CH[chapterAt(tt)];
    hov.style.width = (u * 100).toFixed(2) + "%";
    tip.querySelector("b").textContent = c.en;
    tip.querySelector("i").textContent = c.zh || "";
    tip.querySelector("span").textContent = fmt(tt);
    const w = tip.offsetWidth || 160;
    tip.style.left = clamp(u * r.width, w / 2 - 4, r.width - w / 2 + 4) + "px";
  }
  scrub.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    scrubbing = true; scrubWasPlaying = playing;
    if (playing) { internalPause = true; audio.pause(); internalPause = false; t = clock(performance.now()); }
    try { scrub.setPointerCapture(e.pointerId); } catch (err) {}
    cls("xp-scrubbing", true);
    seek(scrubT(e.clientX)); showTip(e.clientX);
  });
  scrub.addEventListener("pointermove", (e) => { showTip(e.clientX); if (scrubbing) seek(scrubT(e.clientX)); });
  const endScrub = () => {
    if (!scrubbing) return;
    scrubbing = false; cls("xp-scrubbing", false);
    if (scrubWasPlaying && playing) startAudio(performance.now());
    if (!playing) applyLimits(t);
    wakeUI();
  };
  scrub.addEventListener("pointerup", endScrub);
  scrub.addEventListener("pointercancel", endScrub);
  scrub.addEventListener("lostpointercapture", endScrub);
  scrub.addEventListener("keydown", (e) => {
    if (e.key === "Home") { seek(0); e.preventDefault(); e.stopPropagation(); }
    if (e.key === "End") { seek(DUR); e.preventDefault(); e.stopPropagation(); }
  });

  // buttons
  const btn = (sel, fn) => $(sel).addEventListener("click", (e) => { e.stopPropagation(); fn(e); if (e.pointerType) e.currentTarget.blur(); });
  btn("#xp-play", togglePlay);
  btn("#xp-back", () => backToShot());

  // captions menu
  const ccBtn = $("#xp-cc"), ccMenu = $("#xp-ccmenu");
  ccMenu.innerHTML = `<div class="h">captions · 字幕</div>` + MODES.map((m) =>
    `<button type="button" role="menuitemradio" data-m="${m}" aria-checked="false">${MODE_TEXT[m].replace(/(中文)/, '<span class="z" lang="zh-Hans">$1</span>')}</button>`).join("");
  ccMenu.querySelectorAll("button").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); setCC(b.dataset.m); closeMenus(); }));
  function setCC(m, save = true) {
    if (!MODES.includes(m)) return;
    ccMode = m;
    MODES.forEach((k) => cls("xp-cc-" + k, k === m));
    ccBtn.querySelector(".m").innerHTML = MODE_LABEL[m].replace(/(中文)/, '<span class="z" lang="zh-Hans">$1</span>');
    ccBtn.setAttribute("aria-label", "Captions: " + MODE_TEXT[m]);
    ccMenu.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", b.dataset.m === m ? "true" : "false"));
    if (save) store.set("captions", m);
    dirty = true;
    capLift();
  }
  const cycleCC = () => setCC(MODES[(MODES.indexOf(ccMode) + 1) % MODES.length]);

  const menus = { chap: $("#xp-chapters"), help: $("#xp-help"), cc: ccMenu };
  const menuBtn = { chap: $("#xp-chap"), cc: ccBtn };
  function closeMenus() {
    Object.values(menus).forEach((m) => (m.hidden = true));
    Object.values(menuBtn).forEach((b) => b.setAttribute("aria-expanded", "false"));
  }
  function toggleMenu(k) {
    const open = menus[k].hidden; closeMenus(); menus[k].hidden = !open;
    if (menuBtn[k]) menuBtn[k].setAttribute("aria-expanded", open ? "true" : "false");
    return open;
  }
  btn("#xp-chap", () => { if (toggleMenu("chap")) { const li = $("#xp-chapters li.on"); if (li) li.scrollIntoView({ block: "nearest" }); } });
  btn("#xp-cc", () => toggleMenu("cc"));
  btn("#xp-q", () => toggleMenu("help"));
  document.addEventListener("pointerdown", (e) => { if (!e.target.closest("#xp-chapters, #xp-chap, #xp-help, #xp-q, #xp-ccmenu, #xp-cc")) closeMenus(); }, true);

  const fsRoot = document.documentElement;
  const fsReq = fsRoot.requestFullscreen || fsRoot.webkitRequestFullscreen;
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  if (!fsReq) $("#xp-fs").style.display = "none";
  function toggleFS() {
    if (fsEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else if (fsReq) {
      const p = fsReq.call(fsRoot, { navigationUI: "hide" });
      if (p && p.then) p.then(() => { try { screen.orientation.lock("landscape").catch(() => {}); } catch (e) {} }).catch(() => {});
    }
  }
  btn("#xp-fs", toggleFS);

  // idle: the chrome fades while playing (and the captions step back down)
  let idleTimer = 0, overBar = false;
  const menusOpen = () => Object.values(menus).some((m) => !m.hidden);
  function wakeUI() {
    if (body.classList.contains("xp-idle")) { cls("xp-idle", false); capLift(); }
    clearTimeout(idleTimer);
    if (playing) idleTimer = setTimeout(() => { if (playing && !scrubbing && !overBar && !menusOpen()) { cls("xp-idle", true); capLift(); } }, 2600);
  }
  barEl.addEventListener("pointerenter", () => { overBar = true; wakeUI(); });
  barEl.addEventListener("pointerleave", () => { overBar = false; wakeUI(); });

  // hints
  const hintEl = $("#xp-hint");
  let hintTimer = 0, explored = store.get("explored", false), pauses = 0;
  const touchy = window.matchMedia && matchMedia("(hover: none)").matches;
  function hint(html, ms) {
    clearTimeout(hintTimer);
    if (!html) { hintEl.classList.remove("on"); return; }
    hintEl.innerHTML = html; hintEl.classList.add("on");
    if (ms) hintTimer = setTimeout(() => hintEl.classList.remove("on"), ms);
  }
  function pauseHint() {
    pauses++;
    if (LIM.explore === false) { hint("paused · this shot can't be explored", 2600); return; }
    if (explored && pauses > 1) return;
    hint(touchy ? "paused · <b>drag</b> to look around · <b>pinch</b> to move in and out"
                : "paused · <b>drag</b> to look around · <b>scroll</b> to move in and out · <b>right-drag</b> to tilt", explored ? 3500 : 7000);
  }
  function noteExplored() { parallaxOn = !calm; if (!explored) { explored = true; store.set("explored", true); } hint(null); }

  // ------------------------------------------------------------------ explore input
  const pts = new Map();
  let gesture = null;
  const TAP = 7;
  const canExplore = () => LIM.explore !== false;
  function panBy(dxScreen, dyScreen) {
    if (!canExplore()) return;
    const s = FR.s * focalScale();
    goal.dx -= dxScreen / s; goal.dy -= dyScreen / s;
    ret = null; clampGoal(); cls("xp-off-shot", offShot());
  }
  let lampHinted = false;
  function tiltBy(dxScreen, dyScreen) {
    if (!canExplore()) return;
    if (LIM.lamp && !lampHinted) { lampHinted = true; hint("no tilt while the lamp lights this shot · drag and scroll still move the camera", 3200); }
    goal.yaw += dxScreen * 0.14; goal.pitch -= dyScreen * 0.14;
    ret = null; clampGoal(); cls("xp-off-shot", offShot());
  }
  // dolly so the point under (cx, cy) stays put
  function dollyTo(dz, cx, cy) {
    if (!canExplore()) return;
    const before = goal.dz;
    goal.dz = dz; clampGoal();
    if (cx != null) {
      const p = toDesign(cx, cy);
      const s0 = P / (P - before), s1 = P / (P - goal.dz);
      goal.dx += (p.x - 960) * (1 / s0 - 1 / s1);
      goal.dy += (p.y - 640) * (1 / s0 - 1 / s1);
    }
    ret = null; clampGoal(); cls("xp-off-shot", offShot());
  }
  const dollyBy = (amount, cx, cy) => dollyTo(goal.dz + amount, cx, cy);
  function grab() {
    // grabbing the world stops time; the pause adopts this shot's limits
    if (playing) setPlaying(false, true);
    if (!canExplore()) { hint("this shot can't be explored", 2200); return false; }
    return true;
  }

  vp.addEventListener("contextmenu", (e) => e.preventDefault());
  vp.addEventListener("pointerdown", (e) => {
    if (e.target.closest("#xp-runspot")) return;
    closeMenus();
    try { vp.setPointerCapture(e.pointerId); } catch (err) {}
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) {
      gesture = { mode: e.button === 2 || e.shiftKey || e.altKey ? "tilt" : "pan", moved: false, x0: e.clientX, y0: e.clientY, type: e.pointerType, button: e.button };
    } else if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      gesture = { mode: "pinch", moved: true, d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, dz0: goal.dz, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, type: e.pointerType };
      grab();
      cls("xp-dragging", true);
    }
  });
  vp.addEventListener("pointermove", (e) => {
    const p = pts.get(e.pointerId);
    if (!p || !gesture) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (gesture.mode === "pinch") {
      if (pts.size < 2) return;
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      panBy(mx - gesture.mx, my - gesture.my);
      gesture.mx = mx; gesture.my = my;
      dollyTo(P - (P - gesture.dz0) / (d / gesture.d0), mx, my);
      noteExplored();
      return;
    }
    if (!gesture.moved) {
      if (Math.hypot(e.clientX - gesture.x0, e.clientY - gesture.y0) < TAP) return;
      gesture.moved = true;
      closeNote();
      if (!grab()) return;
      cls("xp-dragging", true);
      noteExplored();
    }
    if (gesture.mode === "tilt") tiltBy(dx, dy); else panBy(dx, dy);
  });
  function endPointer(e) {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    const g = gesture;
    if (pts.size === 0) {
      gesture = null; cls("xp-dragging", false);
      if (g && !g.moved && e.type === "pointerup" && g.mode !== "pinch") {
        if (g.type === "mouse") { if (g.button === 0) { if (noteOpen) closeNote(); else togglePlay(); } }
        else if (body.classList.contains("xp-idle")) wakeUI();
        else if (noteOpen) closeNote();
        else togglePlay();
      }
    } else if (pts.size === 1 && g && g.mode === "pinch") {
      const [q] = [...pts.values()];
      gesture = { mode: "pan", moved: true, x0: q.x, y0: q.y, type: g.type, button: 0 };
    }
  }
  vp.addEventListener("pointerup", endPointer);
  vp.addEventListener("pointercancel", endPointer);
  vp.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (playing) return;
    const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? 400 : 1;
    let dy = e.deltaY * unit, dx = e.deltaX * unit;
    if (e.ctrlKey) dy *= 7; // trackpad pinch arrives as ctrl+wheel with small deltas (Chrome, Firefox)
    if (Math.abs(dy) >= Math.abs(dx)) dollyBy(clamp(-dy * 1.15, -260, 260), e.clientX, e.clientY);
    else panBy(-dx, 0);
    if (canExplore()) noteExplored();
  }, { passive: false });
  // Safari: trackpad pinch arrives as gesture events (non-standard), not as ctrl+wheel
  let gz0 = 0;
  vp.addEventListener("gesturestart", (e) => { e.preventDefault(); gz0 = goal.dz; });
  vp.addEventListener("gesturechange", (e) => {
    e.preventDefault();
    if (playing || !e.scale) return;
    dollyTo(P - (P - gz0) / e.scale, e.clientX, e.clientY);
    if (canExplore()) noteExplored();
  });
  vp.addEventListener("gestureend", (e) => e.preventDefault());

  // gentle parallax: the world leans towards the pointer while paused
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    wakeUI();
    if (playing || gesture || overBar || noteOpen || !parallaxOn || poster || !canExplore() || quality.lite) return;
    const u = e.clientX / window.innerWidth - 0.5, v = e.clientY / window.innerHeight - 0.5;
    parGoal.yaw = -u * 2 * 2.6;
    parGoal.pitch = v * 2 * 1.7;
  }, { passive: true });
  document.documentElement.addEventListener("mouseleave", () => { parGoal.yaw = parGoal.pitch = 0; });
  window.addEventListener("blur", () => { parGoal.yaw = parGoal.pitch = 0; });

  // keys
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    const inMenu = e.target && e.target.closest && e.target.closest("#xp-chapters, #xp-ccmenu");
    if (inMenu && (k === "Enter" || k === " ")) return;
    let handled = true;
    if (k === " " || k === "k" || k === "K") togglePlay();
    else if (k === "ArrowLeft") e.shiftKey ? chapterJump(-1) : seekBy(-5);
    else if (k === "ArrowRight") e.shiftKey ? chapterJump(1) : seekBy(5);
    else if (k === "ArrowUp" || k === "ArrowDown") { if (grab()) { dollyBy(k === "ArrowUp" ? 160 : -160); noteExplored(); } }
    else if (k === "j" || k === "J") seekBy(-10);
    else if (k === "l" || k === "L") seekBy(10);
    else if (k === "c" || k === "C") cycleCC();
    else if (k === "f" || k === "F") toggleFS();
    else if (k === "r" || k === "R" || k === "0") backToShot();
    else if (k === "Home") seek(0);
    else if (k === "End") seek(DUR);
    else if (k === "?") toggleMenu("help");
    else if (k === "Escape") { if (noteOpen) closeNote(); else if (menusOpen()) closeMenus(); else if (!fsEl()) backToShot(); else handled = false; }
    else handled = false;
    if (handled) { e.preventDefault(); wakeUI(); }
  });
  window.addEventListener("keyup", (e) => { if (e.key === " ") e.preventDefault(); });
  window.addEventListener("resize", layout);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", layout);
  document.addEventListener("fullscreenchange", layout);
  document.addEventListener("webkitfullscreenchange", layout);

  if ("mediaSession" in navigator) {
    const ms = navigator.mediaSession;
    const h = (a, f) => { try { ms.setActionHandler(a, f); } catch (e) {} };
    h("play", () => setPlaying(true)); h("pause", () => setPlaying(false));
    h("seekbackward", () => seekBy(-10)); h("seekforward", () => seekBy(10));
    h("seekto", (d) => seek(d.seekTime)); h("previoustrack", () => chapterJump(-1)); h("nexttrack", () => chapterJump(1));
  }

  // ------------------------------------------------------------------ inspect notes (web/notes.js)
  const NOTES = (window.XP_NOTES || []).map((n) => ({ ...n }));
  const marksEl = $("#xp-marks"), noteEl = $("#xp-note");
  let noteOpen = null;
  NOTES.forEach((n) => {
    try { n.a = n.from(OT); n.b = n.to(OT); } catch (e) { n.a = n.b = -1; } // a dropped optional beat: the note never shows
    const m = document.createElement("button");
    m.type = "button"; m.textContent = "+"; m.title = n.title; m.setAttribute("aria-label", "Inspect: " + n.title);
    m.style.display = "none";
    m.addEventListener("click", (e) => { e.stopPropagation(); noteOpen === n ? closeNote() : openNote(n); });
    m.addEventListener("pointerdown", (e) => e.stopPropagation());
    marksEl.appendChild(m);
    n.mark = m;
  });
  function visible(el) {
    if (!el || !el.isConnected) return null;
    if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return null;
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity < 0.35) return null;
    }
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) return null;
    return r;
  }
  function placeMarks() {
    NOTES.forEach((n) => {
      let r = null;
      if (!playing && !poster && t >= n.a && t < n.b) { try { r = visible(n.find(document, OT, t)); } catch (e) { r = null; } }
      n.rect = r;
      if (!r) { if (n.mark.style.display !== "none") n.mark.style.display = "none"; if (noteOpen === n) closeNote(); return; }
      const [ax, ay] = n.anchor === "tl" ? [r.left, r.top] : n.anchor === "bl" ? [r.left, r.bottom] : n.anchor === "br" ? [r.right, r.bottom]
        : n.anchor === "c" ? [(r.left + r.right) / 2, (r.top + r.bottom) / 2] : [r.right, r.top];
      n.mx = clamp(ax, 18, innerWidth - 18); n.my = clamp(ay, 18, innerHeight - 70);
      n.mark.style.display = "block";
      n.mark.style.transform = `translate(${n.mx.toFixed(1)}px, ${n.my.toFixed(1)}px)`;
      if (noteOpen === n) placeNote(n);
    });
  }
  function openNote(n) {
    noteOpen = n;
    NOTES.forEach((o) => o.mark.classList.toggle("open", o === n));
    noteEl.innerHTML = `<button class="x" type="button" aria-label="Close">×</button><h3></h3>${n.html}`;
    noteEl.classList.toggle("wide", !!n.wide);
    noteEl.querySelector("h3").textContent = n.title;
    noteEl.querySelector(".x").addEventListener("click", (e) => { e.stopPropagation(); closeNote(); });
    noteEl.hidden = false;
    placeNote(n);
    parGoal.yaw = parGoal.pitch = 0;
  }
  function placeNote(n) {
    const w = noteEl.offsetWidth, h = noteEl.offsetHeight, edge = 16;
    let x = n.mx + 22, y = n.my - 20;
    if (x + w > innerWidth - edge) x = n.mx - 22 - w;
    x = clamp(x, edge, Math.max(edge, innerWidth - w - edge));
    y = clamp(y, edge, Math.max(edge, innerHeight - h - 76));
    noteEl.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
  }
  function closeNote() {
    if (!noteOpen) return;
    noteOpen = null; noteEl.hidden = true;
    NOTES.forEach((o) => o.mark.classList.remove("open"));
  }
  noteEl.addEventListener("pointerdown", (e) => e.stopPropagation());

  // ------------------------------------------------------------------ adaptive frame rate
  // Measures how long the display frames take while playing. If the machine cannot keep ~40 fps, draw every other
  // display frame (the clock still follows the audio, so time stays exact; only the frame rate halves: a steady 30
  // beats a stuttering 25-35) and stop the hover lean. Retries full rate after 12 s and on every play.
  // ?q=full / ?q=lite pin it.
  const quality = {
    pin: qs.get("q"), lite: qs.get("q") === "lite", iv: [], skip: false, since: 0, switches: 0,
    reset() { this.iv.length = 0; this.since = performance.now(); if (this.lite && !this.pin) this.set(false, this.since); },
    tick(dt, now) {
      if (this.pin) return;
      if (!playing || scrubbing || document.hidden) { this.iv.length = 0; return; }
      this.iv.push(dt);
      if (this.iv.length > 90) this.iv.shift();
      if (this.iv.length < 90 || now - this.since < 1500) return;
      const s = this.iv.slice().sort((a, b) => a - b), med = s[45], p90 = s[81];
      if (!this.lite && (med > 0.024 || p90 > 0.05)) { this.set(true, now); }
      else if (this.lite && now - this.since > 12000) { this.set(false, now); }
    },
    set(on, now) { this.lite = on; this.switches++; this.since = now; this.iv.length = 0; cls("xp-lite", on); if (on) parGoal.yaw = parGoal.pitch = 0; },
  };
  cls("xp-lite", quality.lite);

  // ------------------------------------------------------------------ perf overlay (?perf)
  const perfEl = $("#xp-perf");
  const fps = { frames: 0, since: 0, long: 0, worst: 0, last: 0, text: "" };
  if (qs.has("perf")) perfEl.hidden = false;
  function perfTick(now) {
    if (fps.last) { const d = now - fps.last; if (d > 25) fps.long++; fps.worst = Math.max(fps.worst, d); }
    fps.last = now; fps.frames++;
    if (now - fps.since >= 1000) {
      const f = (fps.frames * 1000) / (now - fps.since);
      fps.text = `${f.toFixed(0)} fps${quality.lite ? " (lite: draws every 2nd)" : ""}  worst ${fps.worst.toFixed(0)} ms  >25ms ${fps.long}\n` +
        `render ${(perf.renderMs / Math.max(1, perf.renders)).toFixed(1)} ms avg  ${perf.renderMax.toFixed(1)} max  ${perf.renders} draws\n` +
        `t ${t.toFixed(2)}  ${seqAt(t).id}${zoneNow ? "  zone" : ""}${LIM.lamp ? "  lamp" : ""}`;
      if (!perfEl.hidden) perfEl.textContent = fps.text;
      fps.frames = 0; fps.since = now; fps.long = 0; fps.worst = 0;
      perf.renders = 0; perf.renderMs = 0; perf.renderMax = 0;
    }
  }

  // ------------------------------------------------------------------ loop
  let lastNow = 0, frameNo = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = lastNow ? Math.min(0.1, (now - lastNow) / 1000) : 0.016;
    lastNow = now;
    frameNo++;
    quality.tick(dt, now);
    if (playing && !scrubbing) {
      let nt = clock(now);
      if (nt < t && t - nt < 0.06) nt = t; // never tick backwards on a late audio update
      if (nt !== t) { t = nt; dirty = true; }
      if (t >= DUR - 0.0005) { t = DUR - 0.001; setPlaying(false); }
    }
    if (stepExplore(dt, now)) dirty = true;
    if (dirty && !(quality.lite && playing && frameNo % 2)) {
      dirty = false;
      if (!playing && !gesture && !ret) applyLimits(t);
      renderNow();
      updateUI();
      if (poster) placeRunspot();
      if (!playing && NOTES.length) placeMarks();
      else if (NOTES.length) NOTES.forEach((n) => { if (n.mark.style.display !== "none") n.mark.style.display = "none"; });
    }
    perfTick(now);
  }

  // ------------------------------------------------------------------ boot
  function prepareDOM() {
    // #xp-tilt: an identity wrapper round the screen-space layers (the hero and every sequence's ctx.screen), so a tilt
    // of the world can lean them too. Done before OT.boot, which looks the layers up by id.
    const screenEl = document.getElementById("ot-screen"), heroEl = document.getElementById("ot-hero");
    tiltEl = document.createElement("div");
    tiltEl.id = "xp-tilt";
    screenEl.parentNode.insertBefore(tiltEl, screenEl);
    tiltEl.appendChild(screenEl);
    if (heroEl) tiltEl.appendChild(heroEl);
    // the bilingual caption block, right after the engine's caption (below #ot-fade), styled by engine.css/captions.css
    capEl = document.getElementById("ot-cap");
    if (ZHC.length && !document.getElementById("ot-cap2")) {
      cap2 = document.createElement("div"); cap2.id = "ot-cap2"; cap2.lang = "zh-Hans"; cap2.setAttribute("aria-live", "off");
      cap2En = document.createElement("div"); cap2En.className = "en"; cap2En.lang = "en";
      cap2Zh = document.createElement("div"); cap2Zh.className = "zh";
      cap2.append(cap2En, cap2Zh);
      cap2.style.opacity = "0";
      capEl.parentNode.insertBefore(cap2, capEl.nextSibling);
    }
  }
  function boot() {
    prepareDOM();
    OT.boot();
    world = document.getElementById("ot-world");
    world.style.transformOrigin = "960px 640px 0px";   // the tilt's pivot (renderNow); the engine itself only translates
    if (D.poster && D.poster.runspot) { try { pillEl = document.querySelector(D.poster.runspot); } catch (e) { pillEl = null; } }
    setCC(ccMode, false);
    t = POSTER_T;
    layout();
    applyLimits(t);
    renderNow(); updateUI();
    cls("xp-booting", false);
    capLift();
    placeRunspot();
    hint(pillEl ? (touchy ? "tap <b>Run</b> to play" : "click <b>Run</b> to play · or press <b>space</b>") : (touchy ? "tap to play" : "click to play · or press <b>space</b>"));
    requestAnimationFrame(frame);
    if (qs.has("t")) seek(parseFloat(qs.get("t")) || 0);
  }
  const zhChars = Array.from(new Set(ZHC.slice(0, 6).map((z) => z.text).join(""))).join("");
  const fontsReady = document.fonts && document.fonts.load
    ? Promise.all([
        document.fonts.load('400 40px "Fraunces"'), document.fonts.load('italic 400 40px "Fraunces"'),
        document.fonts.load('400 40px "JetBrains Mono"'), document.fonts.load('700 40px "JetBrains Mono"'),
        zhChars ? document.fonts.load('420 35px "OT Serif SC"', zhChars) : null,
      ]).catch(() => {})
    : Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 4000))]).then(boot);

  // ------------------------------------------------------------------ a small API for tests and benchmarks
  window.XP = {
    get t() { return t; }, get playing() { return playing; }, get off() { return { ...off }; }, get goal() { return { ...goal }; },
    get limits() { return { ...LIM }; }, get captions() { return ccMode; }, get lite() { return quality.lite; },
    chapters: CH, seek, play: () => setPlaying(true), pause: () => setPlaying(false), backToShot, setCaptions: (m) => setCC(m),
    setOffset(o) { Object.assign(goal, o); Object.assign(off, o); ret = null; clampGoal(); Object.assign(off, goal); cls("xp-off-shot", offShot()); dirty = true; },
    renderAt(tt) { t = tt; if (poster) leavePoster(); applyLimits(t); renderNow(); updateUI(); },
    perf, fps, audio, notes: NOTES, placeMarks, openNote, closeNote, quality,
  };
})();
