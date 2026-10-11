/* Attention without moving the camera: rack focus (the lens) and a light pool (the lamp).
 *
 * The camera holds one framing; the lens decides which depth is sharp and the lamp decides which spot is lit.
 * Load after engine.js and before the sequences (the index template does). The film's driver calls OT.render by
 * name from its property setter, so the wrapped OT.render below runs on every seek, including motion-blur sub-frame
 * seeks (no GSAP callbacks involved). Adds to every sequence ctx:
 *
 *   ctx.focus(keys, { aperture = 34, max = 12 })
 *       The lens. keys: [t, target, ease?] — the focus ARRIVES at target at t, coming from the previous key with
 *       `ease` (any OT.E name, default "smoother"); two equal keys hold. target:
 *         number        a local depth (the depth you gave ctx.plane)
 *         element       a plane or element registered with ctx.lens → the depth ctx.lens gave it this frame
 *         { eff: e }    the depth at eff = e from the camera (follows the camera: e = 0 is the scale-1 depth)
 *         null          no depth of field: everything sharp (racks from/to null fade the blur in/out in place)
 *       A plane at screen scale s, with the focal plane at scale sf, gets a screen-space blur of
 *       aperture · |1 − s / sf| px (thin-lens circle of confusion), capped at `max`, quantised to 0.25 px, and
 *       nothing at all under 0.5 px — the focal plane keeps `filter: none`, so its text is untouched.
 *   ctx.light(keys, { shade, lift })
 *       The lamp. keys: [t, {x, y, d, r | rx + ry, dim, lift, soft, ease}] in local world coordinates (projected
 *       through the camera every frame, so the pool stays on its object while the camera moves). Missing fields
 *       carry over from the previous key ({} = hold); [t, null] = off (fades out / in at the current spot).
 *         r / rx, ry   the fully lit core (world px); the light falls off over another `soft` × r (default 0.7)
 *         dim          0..1 how far everything outside the pool sinks: multiply by black on dark grounds, by a warm
 *                      brown on paper (a shadow, not grey) — picked from the ground luminance every frame
 *         lift         0..1 a warm screen-blended glow inside the pool (default 0.08; automatically off on paper)
 *       The lamp sits above the world, the hero, the vignette and the caption scrim, below the captions.
 *   ctx.lens(el, d, k = 1)
 *       (Re)register an element for the focus blur at local depth d, drawn at in-plane scale k (a plane you also
 *       scale). ctx.plane() registers its planes for you; call ctx.lens from render() when the depth animates.
 *       d is the depth THE LENS sees and may differ from where the element really is: to rack between two things
 *       on one plane, split them into two planes at the same depth and give one a lens-only depth (B.js: the loupe
 *       "lifts" 150 units for the lens only). Do not fake depth with an animated scale(): Chrome then picks the
 *       layer's raster scale from seek history and the glyphs stop being a pure function of t.
 *       The focus pass owns `filter` on registered elements: EVERY ctx.plane() is registered, so a sequence must
 *       never set `filter` on a ctx.plane() element (it is overwritten every frame); filters on children are fine.
 *   ctx.blurAt(d, t)
 *       The blur (screen px, quantised) a thing at local depth d gets at t — for the hero (`blur:`) or free elements.
 *
 * Tracks belong to the sequence that owns t (like the hero): a sequence without keys is sharp and unlit. End your
 * tracks at null (or at a depth the next sequence starts with) by t1, or the hand-off pops.
 * Depth of field is for holds: release it (null) before a flight — blurred planes near the lens cost the most and
 * hide what the flight is for. On near-black grounds the lamp re-dithers itself with the engine's #ot-dither noise.
 * Everything is a pure function of t. Debug: OT.fx.at(t) → {lens, lamp}; window.OT_FX_OFF = "focus,light" (set
 * before this file loads) disables either pass for A/B comparisons.
 */
(function () {
  const OT = window.OT;
  const { clamp, lerp, sstep } = OT;
  const P = OT.P, O = OT.O;
  const OFF = String(window.OT_FX_OFF || "");
  const FOCUS_ON = !/focus/.test(OFF), LIGHT_ON = !/light/.test(OFF);
  const STEP = 0.25, MIN = 0.5;                       // blur quantum and threshold (screen px)
  const LENSED = [];                                  // every element the focus pass may blur
  const SHADE_PAPER = [150, 116, 78], SHADE_DARK = [0, 0, 0], LIFT = [255, 212, 150];
  // caption centre the halo tint is sampled at: the English line (engine.css #ot-cap), or the bilingual block
  // (engine/layers.js #ot-cap2; layers.js loads after this file and sets OT.captionsMode, so read it per frame)
  const capY = () => (OT.captionsMode === "en+zh" ? 975 : 1000);
  let shadeEl = null, liftEl = null, capEl = null, ditherEl = null, ditherSrc = null;

  // ------------------------------------------------------------------ ctx extensions
  function extend(ctx) {
    const plane = ctx.plane;
    ctx._focus = null; ctx._light = null;
    ctx.lens = (el, d = 0, k = 1) => {
      if (!el._otLens) { el._otLens = {}; LENSED.push(el); }
      el._otLens.d = ctx.origin.d + d; el._otLens.k = k;
      return el;
    };
    ctx.plane = (d = 0, cls = "", at = null) => ctx.lens(plane.call(ctx, d, cls, at), d);
    ctx.focus = (keys, o = {}) => {
      ctx._focus = { keys: keys.slice().sort((a, b) => a[0] - b[0]), aperture: o.aperture ?? 34, max: o.max ?? 12 };
    };
    ctx.light = (keys, o = {}) => {
      // resolve carried-over fields once; positions stay local (projected per frame)
      let last = { x: 960, y: 640, d: 0, rx: 300, ry: 300, dim: 0.5, lift: 0.08, soft: 0.7 };
      const ks = keys.slice().sort((a, b) => a[0] - b[0]).map(([t, v]) => {
        if (v == null) return { t, v: null, ease: "smoother" };
        const { r, ease, ...rest } = v;
        last = { ...last, ...rest, ...(r != null ? { rx: r, ry: r } : {}) };
        return { t, v: last, ease: ease || "smoother" };
      });
      ctx._light = { keys: ks, shade: o.shade || SHADE_PAPER, lift: o.lift || LIFT };
    };
    ctx.blurAt = (d, t) => {
      const L = FOCUS_ON ? lensAt(t) : null;
      return L ? blurPx(L, ctx.origin.d + d, OT.camera(t).z) : 0;
    };
  }

  // wrap the registry so every build() gets the extensions (sequences load after this file)
  const register = OT.sequence;
  OT.sequence = (def) => register({ ...def, build(ctx) { extend(ctx); return def.build.call(this, ctx); } });

  // ------------------------------------------------------------------ evaluation
  const owner = (t) => OT.SEQS.find((s) => t >= s.t0 && t < s.t1) || OT.SEQS[OT.SEQS.length - 1];
  // segment around t: [a, b, u] with u eased by the arriving key; a or b may be missing at the ends
  function segment(keys, t, tOf, easeOf) {
    let i = 0;
    while (i < keys.length && tOf(keys[i]) <= t) i++;
    if (i === 0) return [keys[0], keys[0], 1];
    if (i === keys.length) return [keys[i - 1], keys[i - 1], 1];
    const a = keys[i - 1], b = keys[i];
    const u = (OT.E[easeOf(b)] || OT.E.smoother)(clamp((t - tOf(a)) / Math.max(1e-6, tOf(b) - tOf(a))));
    return [a, b, u];
  }

  // the lens at t → { d (absolute focal depth), a (aperture px, 0 = off), max } or null
  function lensAt(t) {
    const s = owner(t), F = s && s._focus;
    if (!F || !F.keys.length) return null;
    const cz = OT.camera(t).z;
    const depth = (v) => (v == null ? null : typeof v === "number" ? s.origin.d + v : v._otLens ? v._otLens.d : v.eff != null ? cz - v.eff : null);
    const [a, b, u] = segment(F.keys, t, (k) => k[0], (k) => k[2] || "smoother");
    const da = depth(a[1]), db = depth(b[1]);
    let d, on;
    if (da != null && db != null) { d = lerp(da, db, u); on = 1; }
    else if (db != null) { d = db; on = u; }
    else if (da != null) { d = da; on = 1 - u; }
    else return null;
    if (on <= 0 || cz - d >= P - 1) return null;       // off, or focal plane behind the lens
    return { d, a: F.aperture * on, max: F.max };
  }

  // screen-space blur (px) for something at absolute depth d
  function blurPx(L, d, cz) {
    const s = P / (P - (cz - d)), sf = P / (P - (cz - L.d));
    if (!(s > 0) || cz - d >= P) return 0;
    const q = Math.round(Math.min(L.max, L.a * Math.abs(1 - s / sf)) / STEP) * STEP;
    return q < MIN ? 0 : q;
  }

  // the lamp at t → { s (owner ctx), v (local light), on } or null
  function lampAt(t) {
    const s = owner(t), Lk = s && s._light;
    if (!Lk || !Lk.keys.length) return null;
    const [a, b, u] = segment(Lk.keys, t, (k) => k.t, (k) => k.ease);
    let v, on;
    if (a.v && b.v) { v = {}; for (const k in b.v) v[k] = lerp(a.v[k], b.v[k], u); on = 1; }
    else if (b.v) { v = b.v; on = u; }
    else if (a.v) { v = a.v; on = 1 - u; }
    else return null;
    return on > 0 ? { s, v, on, shade: Lk.shade, lift: Lk.lift } : null;
  }

  OT.fx = { at: (t) => ({ lens: lensAt(t), lamp: lampAt(t) }), lensAt, lampAt };

  // ------------------------------------------------------------------ passes (after the engine's render)
  function applyFocus(t) {
    const L = FOCUS_ON ? lensAt(t) : null;
    const cz = OT.camera(t).z;
    for (let i = 0; i < LENSED.length; i++) {
      const el = LENSED[i], R = el._otLens;
      let f = "none";
      if (L && el.style.visibility !== "hidden") {
        const r = blurPx(L, R.d, cz);
        if (r > 0) f = `blur(${(r / ((P / (P - (cz - R.d))) * R.k)).toFixed(2)}px)`;   // css px = screen px / scale
      }
      if (el._otF !== f) { el.style.filter = f; el._otF = f; }
    }
  }

  const SM = [0, 0.1, 0.25, 0.42, 0.58, 0.75, 0.9, 1];   // smoothstep samples (fewer stops, no Mach bands)
  function applyLight(t) {
    const lamp = LIGHT_ON ? lampAt(t) : null;
    if (!lamp) { hide(shadeEl); hide(liftEl); hide(ditherEl); undisplay(ditherEl, true); return; }
    const { s, v, on } = lamp;
    const cam = OT.camera(t);
    const p = s.project(v.x, v.y, v.d, t);
    let x = p.x, y = p.y;
    if (cam.roll) {                                     // the world rolls around the vanishing point
      const a = (cam.roll * Math.PI) / 180, dx = x - O.x, dy = y - O.y;
      x = O.x + dx * Math.cos(a) - dy * Math.sin(a); y = O.y + dx * Math.sin(a) + dy * Math.cos(a);
    }
    const RX = v.rx * p.s * (1 + v.soft), RY = v.ry * p.s * (1 + v.soft), core = 100 / (1 + v.soft);
    const at = `${RX.toFixed(1)}px ${RY.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px`;
    const paper = sstep(0.3, 0.75, OT.lightNow ?? 0);
    const dim = clamp(v.dim * on);
    if (dim > 0.003) {
      const tint = OT.mix([255, 255, 255], OT.mix(SHADE_DARK, lamp.shade, paper), dim);
      const stops = SM.map((w, i) => `${OT.rgb(OT.mix([255, 255, 255], tint, w))} ${(core + ((100 - core) * i) / (SM.length - 1)).toFixed(1)}%`);
      shadeEl.style.background = `radial-gradient(${at}, #fff 0%, ${stops.join(", ")})`;
      show(shadeEl);
    } else hide(shadeEl);
    // on paper the engine gives captions a paper-coloured halo; under the lamp's shadow it must be the shaded paper.
    // Recoloured whether or not an English phrase shows, so the halo is a function of time only (engine/layers.js
    // copies it onto the bilingual block, whose Chinese line can outlast an English phrase)
    if (dim > 0.003 && paper > 0.5 && (OT.lightNow ?? 0) > 0.8 && (OT.flashNow ?? 0) < 0.05) {
      const g = Math.hypot((960 - x) / RX, (capY() - y) / RY), c = core / 100;
      const w = g <= c ? 0 : g >= 1 ? 1 : sampleSM((g - c) / (1 - c));
      const sh = OT.mix([255, 255, 255], OT.mix(SHADE_DARK, lamp.shade, paper), dim * w);
      capEl.style.textShadow = `0 1px 12px ${OT.rgb(OT.groundNow.map((k, j) => Math.round((k * sh[j]) / 255)), 0.8)}`;
    }
    const lift = v.lift * on * (1 - paper);
    if (lift > 0.003) {
      const c = lamp.lift;
      const stops = SM.map((w, i) => `${OT.rgb(c, lift * (1 - w))} ${(core * 0.4 + ((100 - core * 0.4) * i) / (SM.length - 1)).toFixed(1)}%`);
      liftEl.style.background = `radial-gradient(${at}, ${OT.rgb(c, lift)} 0%, ${stops.join(", ")})`;
      show(liftEl);
    } else hide(liftEl);
    // the lamp's gradients step in 1-level rings on near-black grounds (like the vignette): re-dither above them with
    // the engine's own static noise layer, as strongly as the engine dithers the ground right now
    const da = ditherSrc ? +ditherSrc.style.opacity || 0 : 0;
    if (ditherEl && da > 0.003) { ditherEl.style.opacity = (da * clamp(on * 2)).toFixed(3); undisplay(ditherEl, false); show(ditherEl); } else { hide(ditherEl); undisplay(ditherEl, true); }
  }
  const sampleSM = (u) => { const f = u * (SM.length - 1), i = Math.min(SM.length - 2, Math.floor(f)); return lerp(SM[i], SM[i + 1], f - i); };
  const show = (e) => { if (e && e.style.visibility !== "visible") e.style.visibility = "visible"; };
  const hide = (e) => { if (e && e.style.visibility !== "hidden") e.style.visibility = "hidden"; };
  // the lamp's dither clone is display:none whenever it is not needed: merely present (even visibility:hidden), its
  // second feTurbulence changed the engine's grain/dither noise by up to 8 levels on EVERY frame of the film (measured)
  const undisplay = (e, off) => { const v = off ? "none" : ""; if (e && e.style.display !== v) e.style.display = v; };

  // ------------------------------------------------------------------ boot & render hooks
  const boot = OT.boot;
  OT.boot = () => {
    boot();
    const cap = (capEl = document.getElementById("ot-cap"));
    shadeEl = OT.el("div", "", null); shadeEl.id = "ot-shade";
    liftEl = OT.el("div", "", null); liftEl.id = "ot-lift";
    cap.parentNode.insertBefore(shadeEl, cap);
    cap.parentNode.insertBefore(liftEl, cap);
    ditherSrc = document.getElementById("ot-dither");
    if (ditherSrc) {
      ditherEl = ditherSrc.cloneNode(true); ditherEl.id = "ot-lamp-dither";
      ditherEl.querySelectorAll("filter[id]").forEach((f) => {             // keep ids unique in the clone
        const id = f.id + "-lamp";
        ditherEl.querySelectorAll(`[filter="url(#${f.id})"]`).forEach((r) => r.setAttribute("filter", `url(#${id})`));
        f.id = id;
      });
      ditherEl.style.display = "none";                                    // see undisplay(): only shown with the lamp
      cap.parentNode.insertBefore(ditherEl, cap);
    }
  };
  const render = OT.render;
  OT.render = (t) => {
    render(t);
    if (!shadeEl) return;
    applyFocus(t);
    applyLight(t);
  };
})();
