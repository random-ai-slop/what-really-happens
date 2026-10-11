/* Layer split + bilingual captions. Load after engine.js and after every engine add-on that restyles the caption
 * (focus.js recolours its halo under the lamp): this file copies #ot-cap's final per-frame style.
 *
 *   hf render --variables '{"layer":"picture"}' --crf 0          the film without captions: #ot-cap held at opacity 0
 *                                                                 (its state between two captions; the scrim stays)
 *   hf render --variables '{"layer":"captions","captions":"en"}' --format png-sequence
 *                                                                 only the captions, on a transparent page, styled
 *                                                                 exactly as in the film (ground/flash colour, halo)
 *   "captions": "en" (default) | "en+zh"                          en+zh: English line(s) above the Chinese line(s)
 *   no variables (layer "all")                                    the film as before, byte-identical
 *
 * Composite = captions OVER picture with straight alpha in the video's own Y'CbCr (scripts/composite.sh). Exact
 * because nothing but #ot-fade sits above the captions; a BLACK fade is applied to the captions layer as
 * brightness(1 − a). Contract (pitfalls.md § Layer split): captions on top except the black fade, no blend modes,
 * caption styling a function of time only.
 *
 * Bilingual cues: OT_TIMING.captionsZh = [{t0, t1, text, lift?}] (script/build.py from script/subtitles.zh-Hans.json).
 * Each line fades on its own cue; `lift` (px, optional) raises the whole block while that Chinese cue is up.
 * window.OT_LAYER_DEFAULTS (e.g. {captions: "en+zh"}) sets defaults for previews/snapshots; --variables wins.
 */
(() => {
  const V = Object.assign({}, window.OT_LAYER_DEFAULTS || {}, window.__hfVariables || {});
  const layer = ["picture", "captions"].includes(V.layer) ? V.layer : "all";
  const bi = (V.captions || "en") === "en+zh";
  OT.layer = layer;
  OT.captionsMode = bi ? "en+zh" : "en";
  const sstep = OT.sstep;
  const BOTTOM = 52; // px, bilingual block bottom edge (the English-only caption keeps its own 64 px in engine.css)
  let cap, fadeEl, box, enEl, zhEl, warned = false;
  const ZH = (OT.timing.captionsZh || []);
  if (bi && !ZH.length) console.warn("[layers] captions en+zh but OT_TIMING.captionsZh is empty (run script/build.py)");

  const boot = OT.boot;
  OT.boot = () => {
    boot();
    if (layer !== "all") document.documentElement.dataset.otLayer = layer;
    cap = document.getElementById("ot-cap");
    fadeEl = document.getElementById("ot-fade");
    if (bi) {
      box = OT.el("div", "", null);
      box.id = "ot-cap2";
      enEl = OT.el("div", "en", box);
      zhEl = OT.el("div", "zh", box);
      box.lang = "zh-Hans";
      enEl.lang = "en";
      cap.parentNode.insertBefore(box, cap.nextSibling);
      // HyperFrames waits for document.fonts.ready once, at page init. The CJK face is only fetched when a glyph in
      // its range is first laid out (a later frame), so ask for it now with every character the cues use.
      const chars = Array.from(new Set(ZH.map((z) => z.text).join(""))).join("");
      if (document.fonts && chars) {
        document.fonts.load(`420 35px "OT Serif SC"`, chars).then((f) => {
          if (!f.length) console.warn("[layers] the Chinese caption font did not load");
        }, (e) => console.warn("[layers] Chinese caption font:", e));
      }
    }
  };

  const vis = (c, t) => sstep(c.t0, c.t0 + 0.12, t) * (1 - sstep(c.t1 - 0.12, c.t1, t));
  const set = (e, k, v) => { if (e.style[k] !== v) e.style[k] = v; };

  const render = OT.render;
  OT.render = (t) => {
    render(t);
    if (bi) {
      // #ot-cap has just been styled for this instant (colour, halo); the bilingual block wears the same
      const c = OT.timing.captions.find((k) => t >= k.t0 && t < k.t1);
      const z = ZH.find((k) => t >= k.t0 && t < k.t1);
      const ae = c ? vis(c, t) : 0, az = z ? vis(z, t) : 0;
      if (c && enEl.textContent !== c.text) enEl.textContent = c.text;
      if (z && zhEl.textContent !== z.text) zhEl.textContent = z.text;
      set(enEl, "opacity", ae.toFixed(3));
      set(zhEl, "opacity", az.toFixed(3));
      set(box, "bottom", `${BOTTOM + ((z && z.lift) || 0)}px`);
      set(box, "color", cap.style.color);
      set(box, "textShadow", cap.style.textShadow);
      set(box, "opacity", ae > 0 || az > 0 ? "1" : "0");
      cap.style.opacity = 0;
    }
    if (layer === "picture") {
      cap.style.opacity = 0;
      if (box) set(box, "opacity", "0");
    } else if (layer === "captions") {
      // #ot-fade sits above the captions; with only the captions on the page, apply a black fade to them directly
      const fa = +fadeEl.style.opacity || 0;
      if (fa > 0.002 && !warned && !/^(#000(000)?|black|rgb\(0, 0, 0\))$/i.test(fadeEl.style.background.trim())) {
        warned = true;
        console.warn(`[layers] non-black fade (${fadeEl.style.background}) at ${t.toFixed(2)} s: the captions layer only models black fades`);
      }
      const f = fa > 0.002 ? `brightness(${(1 - fa).toFixed(3)})` : "";
      for (const e of [cap, box]) if (e && e.style.filter !== f) e.style.filter = f;
    }
  };
})();
