/* ============================================================================
   IG STACK — the technologies act of "Conocer a Ignacio": one small animation per technology, grouped by
   where I used it (work · my projects · studying), so every tile says what it is AND where it comes from.
   Load after ig-kit.js; the tile modules (js/stack/*.js) register before the config runs. css/ig-stack.css.

   TILE MODULE (every rule in css/stack/<group>.css under .stk-<id>):
     Trailer.igStack.add('<id>', {
       text: { es: { name, note, …the tile's own strings }, en: { … } },   same keys in both languages
       html: t => '…',                 the animation's markup, inside a 540×226 box (the caption strip is below)
       play(D, el, T, t) { … },        its motion on D.tl from T, ≤ 2 s, ending on a clear, readable frame
     });                               (transform / opacity / clip-path / drawSVG / scrambleText; D.hit for from→to)

   RECIPE  { type: 'igstack', screens: [{ k, t, tone, bg, dur, tiles: [ids] }], label }
     Each screen: the kicker (where) and the title (what) at the top, 3–5 tiles in a grid. The tiles arrive
     one after the other and each plays its animation as it lands; then the screen clears for the next.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const INK = '#0e0e10', PAPER = '#eeeae3', CORAL = '#ff4d2e';
  const TILES = {};
  Trailer.igStack = { add(id, def) { TILES[id] = def; }, get: id => TILES[id], ids: () => Object.keys(TILES) };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const TW = 540, TH = 340, GX = 30, GY = 30, TOP = 300;
  /** tile positions on the stage for 3, 4 or 5 tiles (rows centred under the header) */
  function grid(n) {
    const rows = n <= 3 ? [n] : n === 4 ? [2, 2] : [3, 2];
    const out = [];
    rows.forEach((cnt, r) => {
      const w = cnt * TW + (cnt - 1) * GX, x0 = (1920 - w) / 2;
      for (let c = 0; c < cnt; c++) out.push({ x: x0 + c * (TW + GX), y: (n <= 3 ? TOP + 120 : TOP) + r * (TH + GY) });
    });
    return out;
  }

  recipe('igstack', (D, T, o) => {
    const { tl } = D;
    const lang = D.cfg.lang === 'en' ? 'en' : 'es';
    const screens = (o.screens || []).map(sc => ({ ...sc, tiles: sc.tiles.filter(id => TILES[id]) }));
    const tx = id => TILES[id].text[lang] || TILES[id].text.es;
    const s = D.scene('igstack', `<div class="stk">${screens.map((sc, i) => `
      <div class="stk-screen" style="--tone:${sc.tone || CORAL}">
        <div class="stk-head"><div class="stk-k mono"></div><div class="stk-t">${esc(sc.t)}</div></div>
        ${sc.tiles.map((id, j) => { const p = grid(sc.tiles.length)[j], t = tx(id); return `
          <div class="stk-tile stk-${id}" style="left:${p.x}px;top:${p.y}px"><div class="stk-art">${TILES[id].html(t)}</div>
            <div class="stk-cap"><b>${esc(t.name)}</b><span>${esc(t.note)}</span></div></div>`; }).join('')}
      </div>`).join('')}</div>`);
    const scr = D.$$('.stk-screen', s);
    D.show(s, T);
    D.ink(PAPER, T);
    if (o.label) D.label(T, o.label);
    let t = T;
    screens.forEach((sc, i) => {
      const el = scr[i], dur = sc.dur || 4.5, k = D.$('.stk-k', el), title = D.$('.stk-t', el), tiles = D.$$('.stk-tile', el);
      gsap.set(el, { autoAlpha: 0 });
      D.wipeTo(sc.bg || INK, t, i % 2 ? 'left' : 'right', 0.35);
      tl.set(el, { autoAlpha: 1 }, t);
      // header: where (scrambles in) and what (rises)
      const tw = D.split(title, { type: 'words', mask: 'words' }).words;
      gsap.set(tw, { yPercent: 110 });
      tl.to(k, { duration: 0.45, scrambleText: { text: sc.k, chars: 'upperCase', speed: 1 }, ease: 'none' }, t + 0.05);
      tl.to(tw, { yPercent: 0, duration: 0.55, ease: 'expo.out', stagger: 0.045 }, t + 0.1);
      if (sc.label) D.label(t, sc.label);
      // tiles: each lands, then plays
      tiles.forEach((tile, j) => {
        const at = t + 0.3 + j * 0.22, id = sc.tiles[j];
        D.hit(tile, { y: 60, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'expo.out' }, at);
        D.hit(D.$('.stk-cap', tile), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45, ease: 'expo.out' }, at + 0.15);
        D.sfx('tick', at + 0.1, 0.035);
        try { TILES[id].play(D, D.$('.stk-art', tile), at + 0.25, tx(id)); } catch (e) { console.error(`[igstack] ${id}`, e); }
        (D.cfg.warmAt ||= []).push(at + 1.2); // the warm-up pass paints each tile mid-animation (ig-kit.js)
      });
      D.sfx('whoosh', t, 0.45, 0.2);
      // the screen clears for the next one
      tl.to(tiles, { y: -40, opacity: 0, duration: 0.3, ease: 'power2.in', stagger: 0.03 }, t + dur - 0.38);
      tl.to([k, title], { opacity: 0, duration: 0.25, ease: 'power2.in' }, t + dur - 0.3);
      tl.set(el, { autoAlpha: 0 }, t + dur);
      t += dur;
    });
    D.hide(s, t);
    return t - T;
  });
})();
