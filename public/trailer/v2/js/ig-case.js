/* ============================================================================
   IG CASE — a case study in one slide (css/ig-case.css): what it is, my role, how it works and its status
   on the left; the real demo clip playing on the right, kept in sync with the timeline (seekable).
   { kicker, title, sub, facts: [{ k, t }], src, poster, from, window, tag, bg, duration }          10 s
   9:16 (D.vertical): the text on top, the clip under it at the stage's width; the window rises in.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const NAVY = '#0b1430', PAPER = '#eeeae3';
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  recipe('igcase', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 10, from = o.from ?? 0, tall = D.vertical;
    const s = D.scene('igcase', `<div class="igk">
      <div class="igk-l">
        <div class="igk-k mono"></div>
        <div class="igk-t">${esc(o.title)}</div>
        <div class="igk-s">${esc(o.sub)}</div>
        <dl class="igk-f">${(o.facts || []).map(f => `<div class="igk-row"><dt class="mono">${esc(f.k)}</dt><dd>${esc(f.t)}</dd></div>`).join('')}</dl>
      </div>
      <figure class="igk-win">
        <div class="igk-bar"><i></i><i></i><i></i><span>${esc(o.window)}</span></div>
        <div class="igk-media"><video muted playsinline preload="auto"${o.poster ? ` poster="${o.poster}"` : ''}><source src="${o.src}" type="video/mp4"></video></div>
        <figcaption class="igk-tag mono">${esc(o.tag)}</figcaption>
      </figure>
    </div>`);
    const k = D.$('.igk-k', s), title = D.$('.igk-t', s), sub = D.$('.igk-s', s), rows = D.$$('.igk-row', s);
    const win = D.$('.igk-win', s), tag = D.$('.igk-tag', s), v = D.$('video', s);
    v.muted = true;
    D.show(s, T);
    D.wipeTo(o.bg || NAVY, T, 'up', 0.4);
    D.ink(PAPER, T);
    if (o.label) D.label(T, o.label);
    D.fit(title, tall ? D.W - 140 : 760); // clear of the demo window
    const chars = D.split(title, { type: 'chars', mask: 'chars' }).chars;
    gsap.set(chars, { yPercent: 110 });
    tl.to(k, { duration: 0.5, scrambleText: { text: o.kicker, chars: 'upperCase', speed: 1 }, ease: 'none' }, T + 0.1);
    tl.to(chars, { yPercent: 0, duration: 0.7, ease: 'expo.out', stagger: 0.04 }, T + 0.2);
    D.hit(sub, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, T + 0.65);
    rows.forEach((r, i) => {
      D.hit(r, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out' }, T + 1.5 + i * 0.55);
      D.hit(D.$('dt', r), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.4, ease: 'expo.out' }, T + 1.5 + i * 0.55);
      D.sfx('tick', T + 1.5 + i * 0.55, 0.04);
    });
    if (tall) D.hit(win, { opacity: 0, y: 140, rotationX: 14, transformPerspective: 2000 }, { opacity: 1, y: 0, rotationX: 0, duration: 0.9, ease: 'expo.out' }, T + 0.6);
    else D.hit(win, { opacity: 0, x: 120, rotationY: -16, transformPerspective: 2000 }, { opacity: 1, x: 0, rotationY: 0, duration: 0.9, ease: 'expo.out' }, T + 0.6);
    tl.to(win, { scale: 1.03, duration: dur - 1.8, ease: 'sine.inOut' }, T + 1.5);
    D.hit(tag, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'back.out(2)' }, T + 1.2);
    D.sfx('whoosh', T + 0.6, 0.5, 0.25);
    tl.to(s.firstElementChild, { opacity: 0, duration: 0.3, ease: 'power2.in' }, T + dur - 0.3);
    D.hide(s, T + dur);
    (D.cfg.warmAt ||= []).push(T + 2);
    // the clip follows the playhead: plays while inside, holds its frame outside (seekable with ?t=)
    const t0 = T + 0.8, len = dur - 0.8;
    gsap.ticker.add(() => {
      const t = D.tl.time(), want = from + (t - t0), inside = t >= t0 && t < T + dur;
      const end = (v.duration || 99) - 0.05;
      if (inside && !D.tl.paused() && want < end) {
        if (v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
        if (Math.abs(v.currentTime - want) > 0.25) v.currentTime = want;
      } else {
        if (!v.paused) v.pause();
        const w = Math.min(Math.max(want, from), Math.min(end, from + len));
        if (v.readyState >= 1 && Math.abs(v.currentTime - w) > 0.05) v.currentTime = w;
      }
    });
    return dur;
  });
})();
