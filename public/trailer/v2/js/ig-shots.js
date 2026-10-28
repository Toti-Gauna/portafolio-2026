/* ============================================================================
   IG SHOTS — act 5 of "Conocer a Ignacio": the product montage. Each own project shows one or two of its
   REAL components, rebuilt in code (HTML/CSS/SVG + GSAP on the master timeline): no screenshots, no video.
   Load after ig-kit.js; the shot modules (js/shots/*.js) register their views before the config runs.

   SHOT MODULE (one per project group, css in css/shots/<group>.css, every rule under .shot-<id>):
     Trailer.igShots.add('<id>', {
       frame: 'browser' | 'phone' | 'none',   browser: view 1440×816 under a 44 px bar · phone: view 392×832
                                              · none: the view is the whole 1920×1080 stage
       url: 'eclipse-business.com',           browser bar (optional)
       bg: '#05050A',                         stage colour while the shot is on (the cut wipes to it)
       color: '#F5B942',                      the project's accent (tag, mosaic dot)
       text: { es: {…}, en: {…} },            EVERY visible string of the view, same keys in both languages
       html: t => '<div>…</div>',             the view's markup (t = text[lang])
       play(D, v, T, dur, t) { … },           its motion: tweens on D.tl inside [T, T + dur] (v = view root);
                                              transform / opacity / clip-path / drawSVG / scrambleText only;
                                              use D.hit(el, from, to, at) for from→to so seeking works
     });

   RECIPE  { type: 'igshots', title, shots: [{ id, dur, tag: { name, status, note } }], mosaic, end, label }
     1 s title («Y mis propias ramas.») → one cut per shot, on the beat: the background wipes to the shot's
     colour, the frame whips in, its tag (name · status · note) wipes on, the view plays → the mosaic: every
     frame flies into a 4×3 wall with its name, and the last cell says `end`.
   9:16 (D.H > D.W): each frame keeps its own size and is scaled onto the stage (browsers to the stage's width,
     phones larger), with its tag full width under it; the mosaic is 3 columns × 4 rows.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const INK = '#0e0e10', PAPER = '#eeeae3', CORAL = '#ff4d2e';
  const SHOTS = {};
  Trailer.igShots = { add(id, def) { SHOTS[id] = def; }, get: id => SHOTS[id], ids: () => Object.keys(SHOTS) };

  // frame boxes on the 1920×1080 stage (the tag plate sits over the bottom-left corner)
  const BOX = {
    browser: { x: 240, y: 104, w: 1440, h: 860, s: 1 },
    phone: { x: 1150, y: 100, w: 420, h: 860, s: 1 },
    none: { x: 0, y: 0, w: 1920, h: 1080, s: 1 },
  };
  // 9:16: the same frames (same w × h), centred on (cx, cy) and scaled by s; the tag goes under the frame
  const place = (w, h, s, cx, cy) => ({ x: cx - w / 2, y: cy - h / 2, w, h, s });
  const BOX_V = {
    browser: place(1440, 860, 1000 / 1440, 540, 800),
    phone: place(420, 860, 1.2, 540, 790),
    none: place(1920, 1080, 1060 / 1920, 540, 820),
  };
  // how a frame arrives on its cut, in turn
  const ENTER = [
    { x: 300, rotationY: -16, opacity: 0 },
    { y: 220, opacity: 0 },
    { scale: 1.18, opacity: 0 },
    { x: -300, rotationY: 16, opacity: 0 },
  ];
  const WIPE = ['right', 'up', 'left', 'down'];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function frameHtml(id, def, t) {
    const f = def.frame || 'browser', view = `<div class="ish-view shot-${id}">${def.html(t)}</div>`;
    if (f === 'browser') return `<div class="ish-frame ish-browser" data-shot="${id}"><div class="ish-bar"><i></i><i></i><i></i>${def.url ? `<span class="ish-url">${esc(def.url)}</span>` : ''}</div>${view}</div>`;
    if (f === 'phone') return `<div class="ish-frame ish-phone" data-shot="${id}">${view}</div>`;
    return `<div class="ish-frame ish-none" data-shot="${id}">${view}</div>`;
  }

  recipe('igshots', (D, T, o) => {
    const { tl } = D;
    const lang = D.cfg.lang === 'en' ? 'en' : 'es';
    const shots = (o.shots || []).filter(s => SHOTS[s.id]);
    const TITLE = o.titleDur ?? 1, MOS = o.mosaic ?? 1.5, v = D.H > D.W, BOXES = v ? BOX_V : BOX;
    const s = D.scene('igshots', `<div class="ish">
      <div class="ish-title"><div class="ish-title-t">${esc(o.title)}</div></div>
      ${shots.map(sh => frameHtml(sh.id, SHOTS[sh.id], SHOTS[sh.id].text[lang] || SHOTS[sh.id].text.es)).join('')}
      ${shots.map(sh => `<div class="ish-tag" style="--c:${SHOTS[sh.id].color || CORAL}"><i class="ish-tag-bar"></i>
        <div class="ish-tag-top"><b>${esc(sh.tag.name)}</b><span class="ish-tag-st mono">${esc(sh.tag.status)}</span></div>
        ${sh.tag.note ? `<div class="ish-tag-nt">${esc(sh.tag.note)}</div>` : ''}</div>`).join('')}
      <div class="ish-labels">${shots.map(sh => `<div class="ish-cl" style="--c:${SHOTS[sh.id].color || CORAL}"><i></i>${esc(sh.tag.name)}</div>`).join('')}</div>
      <div class="ish-end"><div class="ish-end-t">${esc(o.end)}</div></div>
    </div>`);
    const frames = D.$$('.ish-frame', s), tags = D.$$('.ish-tag', s), labels = D.$$('.ish-cl', s);
    const titleBox = D.$('.ish-title', s), title = D.$('.ish-title-t', s), end = D.$('.ish-end', s), endT = D.$('.ish-end-t', s);
    D.show(s, T);
    if (o.label) D.label(T, o.label);

    // ── title: the words rise on ink
    if (TITLE > 0) { // titleDur: 0 → the montage opens straight on its first cut (the branches scene titles it)
      const words = D.split(title, { type: 'words', mask: 'words' }).words;
      gsap.set(words, { yPercent: 110 });
      D.setBg(o.bg || INK, T);
      D.ink(PAPER, T);
      D.show(titleBox, T);
      tl.to(words, { yPercent: 0, duration: 0.5, ease: 'expo.out', stagger: 0.06 }, T + 0.02);
      tl.to(title, { scale: 1.05, duration: TITLE, ease: 'none' }, T);
      D.hide(titleBox, T + TITLE);
      D.sfx('whoosh', T, 0.6, 0.25);
    }

    // ── the cuts
    gsap.set(frames, { autoAlpha: 0, transformPerspective: 2000, transformOrigin: '50% 50%' });
    gsap.set(tags, { autoAlpha: 0 });
    let t = T + TITLE;
    shots.forEach((sh, i) => {
      const def = SHOTS[sh.id], f = frames[i], tag = tags[i], dur = sh.dur || 1, bg = def.bg || INK;
      const box = BOXES[def.frame || 'browser'], en = ENTER[i % ENTER.length];
      gsap.set(f, { left: box.x, top: box.y, width: box.w, height: box.h });
      if (v) gsap.set(tag, { top: box.y + box.h / 2 + (box.h * box.s) / 2 + 44 });
      D.wipeTo(bg, t, WIPE[i % WIPE.length], 0.3);
      D.ink(D.contrast(bg), t);
      D.show(f, t);
      D.hit(f, { x: 0, y: 0, rotationY: 0, ...en, scale: box.s * (en.scale ?? 1) }, { x: 0, y: 0, scale: box.s, rotationY: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, t);
      tl.to(f, { scale: box.s * 1.035, duration: Math.max(0.1, dur - 0.5), ease: 'sine.inOut' }, t + 0.5);
      // the tag: plate wipes on, name rises
      D.show(tag, t + 0.1);
      D.hit(tag, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.35, ease: 'expo.out' }, t + 0.1);
      D.hit(D.$('b', tag), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: 'expo.out' }, t + 0.14);
      D.hide(tag, t + dur);
      D.sfx('whoosh', t, 0.35, 0.18);
      D.sfx('tick', t + 0.12, 0.04);
      (D.cfg.warmAt ||= []).push(t + 0.65); // the warm-up pass paints each view once it is on screen (js/ig-kit.js)
      const tx = def.text[lang] || def.text.es;
      try { def.play(D, D.$('.ish-view', f), t, dur, tx); } catch (e) { console.error(`[igshots] ${sh.id}`, e); }
      D.hide(f, t + dur);
      t += dur;
    });

    // ── the mosaic: every frame flies into a 4×3 wall (9:16: 3×4; the 12th cell holds `end`)
    const M = t, [COLS, X0, Y0, CW, GX, CH, GY] = v ? [3, 30, 412, 326, 21, 196, 104] : [4, 96, 128, 408, 32, 206, 66];
    D.wipeTo(o.mosaicBg || INK, M, 'up', 0.3);
    D.ink(PAPER, M);
    const cell = i => ({ x: X0 + (i % COLS) * (CW + GX), y: Y0 + Math.floor(i / COLS) * (CH + GY) });
    shots.forEach((sh, i) => {
      const def = SHOTS[sh.id], box = BOXES[def.frame || 'browser'], c = cell(i);
      const k = Math.min(CW / box.w, CH / box.h);
      const x = c.x + CW / 2 - (box.x + box.w / 2), y = c.y + CH / 2 - (box.y + box.h / 2);
      const at = M + 0.05 + i * 0.04;
      D.show(frames[i], at);
      D.hit(frames[i], { x: x * 0.6, y: y * 0.6 + 120, scale: k * 0.7, rotationY: 0, opacity: 0 }, { x, y, scale: k, opacity: 1, duration: 0.6, ease: 'expo.out' }, at);
      // under the frame's left edge; pulled back inside the cell when the name is wider than the frame (phones)
      if (v) labels[i].style.maxWidth = CW + 'px'; // 9:16: a long name takes two lines inside its cell
      const fl = c.x + (CW - box.w * k) / 2;
      gsap.set(labels[i], { left: Math.max(c.x, Math.min(fl, c.x + CW - labels[i].offsetWidth)), top: c.y + CH + 12 });
      D.hit(labels[i], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, at + 0.2);
    });
    const ce = cell(shots.length);
    gsap.set(end, { left: ce.x, top: ce.y, width: CW, height: CH });
    const ew = D.split(endT, { type: 'words', mask: 'words' }).words;
    gsap.set(ew, { yPercent: 110 });
    D.show(end, M + 0.4);
    tl.to(ew, { yPercent: 0, duration: 0.5, ease: 'expo.out', stagger: 0.05 }, M + 0.45);
    D.sfx('whoosh', M, 0.6, 0.3);
    tl.to(s, { opacity: 0, duration: 0.25, ease: 'power2.in' }, M + MOS - 0.25);
    D.hide(s, M + MOS);
    return M + MOS - T;
  });
})();
