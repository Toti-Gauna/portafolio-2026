/* ============================================================================
   IG CAREER — the opening branches and the career act of "Conocer a Ignacio" (css/ig-career.css).
   Load after ig-kit.js. Both recipes are drawn with SVG + DOM and live on the master timeline (seekable).

   igburst   «CAMINOS»: from the seed, branches shoot out in every direction while the word rises; then
             they fade and one main line is left, the line the career walks on.                         4 s
             { word, duration }
   igcareer  the career as a git graph: one main line, one branch per job. The camera travels along the
             line; at each stop a branch climbs into a card (dates · company, role, what I did) and a
             piece of the work moves beside it (wallet in web and mobile, code being typed, the prize
             wheel, the promotion and the stack). Ends on a pull-back over the whole graph.           20 s
             { kicker, title, seed, span, outro, stops: [{ year, k, t, t2, d, vis, color, label, … }], at: [stop starts] }

   9:16 (D.H > D.W): the same moves on a 1080×1920 stage. igburst opens from a higher centre and leaves the main
   line low (LINE_V); igcareer travels one stage width per stop with the card on top, the piece of work under it
   and the main line low on the stage, the branch climbing up the left edge into the card.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const INK = '#0e0e10', PAPER = '#eeeae3', CORAL = '#ff4d2e', BLUE = '#2b50ff', YELLOW = '#ffc21a';
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const LINE_H = 900, LINE_V = 1580; // the main line's height on the stage (16:9 · 9:16): igburst leaves it, igcareer walks it
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ================================================================== IGBURST
  recipe('igburst', (D, T, o) => {
    const { tl } = D;
    const v = D.H > D.W, dur = o.duration || 4, r = rng(17), N = 34, CX = D.CX, CY = v ? 760 : 500, LINE = v ? LINE_V : LINE_H;
    const col = i => (i % 7 === 0 ? CORAL : i % 7 === 3 ? BLUE : PAPER);
    const br = Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2 + (r() - 0.5) * 0.3, L = 560 + r() * 560, bend = (r() - 0.5) * 0.8;
      const x1 = CX + Math.cos(a) * L * 0.5, y1 = CY + Math.sin(a) * L * 0.5;
      const x2 = CX + Math.cos(a + bend * 0.45) * L, y2 = CY + Math.sin(a + bend * 0.45) * L;
      return { d: `M${CX} ${CY}Q${x1.toFixed(0)} ${y1.toFixed(0)} ${x2.toFixed(0)} ${y2.toFixed(0)}`, x: x2, y: y2, c: col(i) };
    });
    const s = D.scene('igburst', `<div class="igu">
      <svg class="igu-g" viewBox="0 0 ${D.W} ${D.H}">
        ${br.map(b => `<path class="igu-br" d="${b.d}" style="stroke:${b.c}"/>`).join('')}
        ${br.map(b => `<circle class="igu-n" cx="${b.x.toFixed(0)}" cy="${b.y.toFixed(0)}" r="7" style="fill:${b.c}"/>`).join('')}
        <path class="igu-main" d="M-40 ${LINE}H${D.W + 40}"/>
      </svg>
      <i class="igu-halo" style="left:${CX - 700}px;top:${CY - 240}px"></i><i class="igu-seed" style="left:${CX - 16}px;top:${CY - 16}px"></i>
      <div class="igu-word" style="top:${CY}px">${esc(o.word)}</div>
    </div>`);
    const g = D.$('.igu-g', s), paths = D.$$('.igu-br', s), nodes = D.$$('.igu-n', s), main = D.$('.igu-main', s);
    const seed = D.$('.igu-seed', s), word = D.$('.igu-word', s);
    D.fit(word, Math.min(1700, D.W - 80));
    const chars = D.split(word, { type: 'chars', mask: 'chars' }).chars;
    D.show(s, T);
    D.setBg(o.bg || INK, T);
    D.ink(PAPER, T);
    if (o.label) D.label(T, o.label);
    gsap.set(paths, { drawSVG: '0%' });
    gsap.set(nodes, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(main, { drawSVG: '0%' });
    gsap.set(chars, { yPercent: 110 });
    D.hit(seed, { scale: 2.2, opacity: 1 }, { scale: 1, duration: 0.5, ease: 'expo.out' }, T);
    tl.to(paths, { drawSVG: '100%', duration: 0.95, ease: 'expo.out', stagger: { each: 0.018, from: 'random' } }, T + 0.02);
    tl.to(nodes, { scale: 1, duration: 0.35, ease: 'back.out(3)', stagger: { each: 0.018, from: 'random' } }, T + 0.5);
    tl.to(chars, { yPercent: 0, duration: 0.7, ease: 'expo.out', stagger: 0.045 }, T + 0.3);
    gsap.set(g, { transformOrigin: v ? `50% ${(CY / D.H * 100).toFixed(1)}%` : '50% 46%' });
    tl.fromTo(g, { scale: 0.96, rotation: -2 }, { scale: 1.06, rotation: 2, duration: dur, ease: 'none' }, T);
    // the roads fade; one line stays: the one the career walks on
    const out = T + dur - 0.9;
    tl.to([paths, nodes], { opacity: 0.12, duration: 0.5, ease: 'power2.in' }, out);
    tl.to(word, { yPercent: -30, opacity: 0, duration: 0.45, ease: 'power3.in' }, out + 0.2);
    tl.to(seed, { y: LINE - CY, scale: 0.6, duration: 0.6, ease: 'expo.inOut' }, out + 0.1);
    tl.to(main, { drawSVG: '100%', duration: 0.6, ease: 'expo.inOut' }, out + 0.2);
    D.sfx('whoosh', T, 0.6, 0.35);
    D.sfx('whoosh', out + 0.2, 0.4, 0.25);
    D.hide(s, T + dur);
    return dur;
  });

  // ================================================================== IGCAREER visuals (one per stop)
  const VIS = {
    // the wallet, in a browser and on a phone: same card, two screens
    wallet(v) {
      const card = `<div class="vw-card"><div class="vw-l">${esc(v.balance)}</div><div class="vw-n">$ ••••••</div>
        <div class="vw-b"><span>${esc(v.send)}</span><span>${esc(v.receive)}</span></div></div>
        <div class="vw-rows"><i></i><i></i><i></i></div>`;
      return `<div class="vw"><div class="vw-web"><div class="vw-bar"><i></i><i></i><i></i></div><div class="vw-in">${card}</div><span class="vw-tag mono">WEB</span></div>
        <div class="vw-phone"><div class="vw-in">${card}</div><span class="vw-tag mono">${esc(v.mobile)}</span></div></div>`;
    },
    // a component being typed in the editor, then rendered
    code(v) {
      return `<div class="vc"><div class="vc-bar"><i></i><i></i><i></i><span>${esc(v.file)}</span></div>
        <pre class="vc-code">${v.lines.map(l => `<div class="vc-ln">${l}</div>`).join('')}</pre>
        <div class="vc-out"><span class="mono">${esc(v.outLabel)}</span><b>${esc(v.out)}</b></div></div>`;
    },
    // the prize wheel (gamification), and what the work covered
    wheel(v) {
      const C = [CORAL, INK, BLUE, INK, YELLOW, INK, CORAL, INK], R = 230;
      const seg = C.map((c, i) => {
        const a0 = (i / 8) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / 8) * Math.PI * 2 - Math.PI / 2;
        return `<path d="M0 0L${(Math.cos(a0) * R).toFixed(1)} ${(Math.sin(a0) * R).toFixed(1)}A${R} ${R} 0 0 1 ${(Math.cos(a1) * R).toFixed(1)} ${(Math.sin(a1) * R).toFixed(1)}Z" fill="${c}"/>`;
      }).join('');
      return `<div class="vr"><svg class="vr-w" viewBox="-260 -270 520 530"><g class="vr-rot">${seg}<circle r="${R}" fill="none" stroke="${INK}" stroke-width="8"/></g>
        <circle r="46" fill="${PAPER}" stroke="${INK}" stroke-width="8"/><path d="M-16 -1l11 11 21-22" fill="none" stroke="${CORAL}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M0 -236l-22 -30h44z" fill="${INK}"/></svg>
        <div class="vr-chips">${v.chips.map(c => `<span>${esc(c)}</span>`).join('')}</div></div>`;
    },
    // the promotion, the recognition and the stack
    stack(v) {
      return `<div class="vs"><div class="vs-badge"><svg viewBox="0 0 48 48"><circle cx="24" cy="20" r="13" fill="none" stroke="${INK}" stroke-width="3"/><path d="M24 12l2.6 5.3 5.8.8-4.2 4.1 1 5.8L24 25.3 18.8 28l1-5.8-4.2-4.1 5.8-.8z" fill="${CORAL}"/><path d="M16 31l-4 13 7-3 4 6 3-11M32 31l4 13-7-3-4 6" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>
        <div><span class="mono">${esc(v.badgeK)}</span><b>${esc(v.badge)}</b></div></div>
        <div class="vs-k mono">${esc(v.stackK)}</div>
        <div class="vs-chips">${v.stack.map(c => `<span>${esc(c)}</span>`).join('')}</div></div>`;
    },
  };
  const PLAY = {
    wallet(D, el, t) {
      const web = D.$('.vw-web', el), ph = D.$('.vw-phone', el);
      D.hit(web, { x: -120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, t);
      D.hit(ph, { x: 140, y: 40, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, t + 0.18);
      D.$$('.vw-card', el).forEach((c, i) => D.hit(c, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, t + 0.45 + i * 0.12));
      D.$$('.vw-rows i', el).forEach((r, i) => D.hit(r, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'expo.out' }, t + 0.8 + (i % 3) * 0.1));
      D.$$('.vw-b span:first-child', el).forEach((b, i) => D.hit(b, { scale: 1 }, { keyframes: [{ scale: 0.92, duration: 0.1 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' }] }, t + 1.6 + i * 0.1));
    },
    code(D, el, t) {
      const lines = D.$$('.vc-ln', el), out = D.$('.vc-out', el);
      D.hit(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, t);
      let k = t + 0.35;
      lines.forEach(ln => {
        const ch = D.split(ln, { type: 'chars' }).chars;
        gsap.set(ch, { opacity: 0 });
        ch.forEach((c, i) => D.tl.set(c, { opacity: 1 }, k + i * 0.022));
        k += ch.length * 0.022 + 0.08;
      });
      [0.3, 0.9, 1.5].forEach(x => D.sfx('key', t + 0.35 + x, 0.12));
      D.hit(out, { y: 20, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(2)' }, k + 0.1);
      D.sfx('tick', k + 0.1, 0.05);
    },
    wheel(D, el, t) {
      const w = D.$('.vr-w', el), rot = D.$('.vr-rot', el), chips = D.$$('.vr-chips span', el);
      D.hit(w, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'expo.out' }, t);
      gsap.set(rot, { svgOrigin: '0 0' });
      D.hit(rot, { rotation: 0 }, { rotation: 1080 + 22.5, duration: 2.4, ease: 'power3.out' }, t + 0.1);
      D.sfx('tick', t + 2.45, 0.06);
      chips.forEach((c, i) => D.hit(c, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'back.out(2)' }, t + 0.7 + i * 0.32));
    },
    stack(D, el, t) {
      const badge = D.$('.vs-badge', el), k = D.$('.vs-k', el), chips = D.$$('.vs-chips span', el);
      D.hit(badge, { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, t);
      D.hit(k, { opacity: 0 }, { opacity: 1, duration: 0.4 }, t + 0.5);
      chips.forEach((c, i) => {
        D.hit(c, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'expo.out' }, t + 0.6 + i * 0.16);
        D.hit(c, { backgroundColor: 'rgba(14,14,16,0)', color: INK }, { backgroundColor: INK, color: PAPER, duration: 0.25 }, t + 0.75 + i * 0.16);
      });
    },
  };

  // ================================================================== IGCAREER
  recipe('igcareer', (D, T, o) => {
    const { tl } = D;
    const stops = o.stops || [], at = o.at || [2, 6, 10, 14], dur = o.duration || 20;
    // 16:9: the card left of the work, the line at 900 · 9:16: the card on top, the work under it, the line low
    const v = D.H > D.W, SW = D.W, SH = D.H, LINE = v ? LINE_V : LINE_H;
    const NX = v ? 84 : 150, BY = v ? 252 : 280, CARD = v ? 140 : 220, VIS_X = v ? 160 : 1120; // 9:16: the work is scaled ×1.2 (css)
    const n = stops.length, TW = SW * (n + 1);
    const X = i => SW * i; // stop i ≥ 1 sits at X(i); stop 0 is the intro
    const s = D.scene('igcareer', `<div class="igr"><div class="igr-track" style="width:${TW}px;height:${SH}px">
      <svg class="igr-g" viewBox="0 0 ${TW} ${SH}" width="${TW}" height="${SH}">
        <path class="igr-main" d="M-40 ${LINE}H${TW + 40}"/>
        ${stops.map((st, i) => { const x = X(i + 1) + NX; return `<path class="igr-br" d="M${x} ${LINE}V${BY + 38}Q${x} ${BY} ${x + 38} ${BY}H${X(i + 1) + CARD}" style="stroke:${st.color}"/>`; }).join('')}
        <circle class="igr-n" cx="${NX}" cy="${LINE}" r="14"/>
        ${stops.map((st, i) => `<circle class="igr-n" cx="${X(i + 1) + NX}" cy="${LINE}" r="14" style="fill:${st.color}"/>`).join('')}
      </svg>
      <div class="igr-yr mono" style="left:${NX}px;top:${LINE + 34}px">${esc(o.seed)}</div>
      ${stops.map((st, i) => `<div class="igr-yr mono" style="left:${X(i + 1) + NX}px;top:${LINE + 34}px">${esc(st.year)}</div>`).join('')}
      <div class="igr-intro"><div class="igr-ik mono">${esc(o.kicker)}</div><div class="igr-it">${o.title}</div><div class="igr-is mono">${esc(o.span)}</div></div>
      ${stops.map((st, i) => `<article class="igr-card" style="left:${X(i + 1) + CARD}px;--c:${st.color}"><i class="igr-bar"></i>
        <div class="igr-k mono"></div><h3 class="igr-t">${esc(st.t)}${st.t2 ? `<span class="igr-t2">${esc(st.t2)}</span>` : ''}</h3><p class="igr-d">${esc(st.d)}</p></article>
        <div class="igr-vis igr-vis--${st.vis}" style="left:${X(i + 1) + VIS_X}px">${VIS[st.vis](st.v || {})}</div>`).join('')}
    </div>${o.outro ? `<div class="igr-out">${o.outro}</div>` : ''}</div>`);
    const track = D.$('.igr-track', s), main = D.$('.igr-main', s), brs = D.$$('.igr-br', s), nodes = D.$$('.igr-n', s), yrs = D.$$('.igr-yr', s);
    const cards = D.$$('.igr-card', s), vis = D.$$('.igr-vis', s);
    const ik = D.$('.igr-ik', s), it = D.$('.igr-it', s), is = D.$('.igr-is', s);
    D.show(s, T);
    D.setBg(o.bg || PAPER, T);
    D.ink(INK, T);
    gsap.set(main, { drawSVG: '0% 0%' });
    gsap.set(brs, { drawSVG: '0%' });
    gsap.set(nodes, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(yrs, { opacity: 0, y: 14, xPercent: v ? 0 : -50, x: v ? -14 : 0 }); // 9:16: from the node's left edge (the seed's label would clip)
    gsap.set(track, { x: 0, y: 0, scale: 1, transformOrigin: '0 0' });

    // ── 0: the intro, on the line that the opening left behind
    if (v) D.fit(it, SW - 180);
    const itw = D.split(it, { type: 'words', mask: 'words' }).words;
    gsap.set(itw, { yPercent: 110 });
    gsap.set([ik, is], { opacity: 0 });
    tl.to(main, { drawSVG: `0% ${(100 / (n + 1)) * 1.1}%`, duration: 0.8, ease: 'power2.out' }, T);
    D.hit(nodes[0], { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, T + 0.15);
    tl.to(yrs[0], { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, T + 0.2);
    tl.to(ik, { opacity: 1, duration: 0.2 }, T + 0.05);
    tl.to(itw, { yPercent: 0, duration: 0.6, ease: 'expo.out', stagger: 0.05 }, T + 0.1);
    tl.to(is, { opacity: 1, duration: 0.4 }, T + 0.5);
    if (o.label) D.label(T, o.label);

    // ── 1…n: travel, fork, card, the work
    stops.forEach((st, i) => {
      const t = T + at[i], card = cards[i], k = D.$('.igr-k', card), title = D.$('.igr-t', card), desc = D.$('.igr-d', card), bar = D.$('.igr-bar', card);
      tl.to(track, { x: -X(i + 1), duration: 0.9, ease: 'expo.inOut' }, t);
      tl.to(main, { drawSVG: `0% ${Math.min(100, (100 / (n + 1)) * (i + 2.1))}%`, duration: 1.1, ease: 'power2.inOut' }, t);
      D.sfx('whoosh', t, 0.5, 0.22);
      D.hit(nodes[i + 1], { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, t + 0.55);
      D.sfx('tick', t + 0.55, 0.05);
      tl.to(yrs[i + 1], { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, t + 0.6);
      tl.to(brs[i], { drawSVG: '100%', duration: 0.55, ease: 'power2.inOut' }, t + 0.6);
      // the card
      D.fit(title, 772);
      const tw = D.split(title, { type: 'words', mask: 'words' }).words;
      gsap.set(tw, { yPercent: 110 });
      gsap.set(card, { autoAlpha: 0 });
      gsap.set(bar, { scaleY: 0, transformOrigin: '50% 0%' });
      gsap.set(desc, { opacity: 0, y: 16 });
      tl.set(card, { autoAlpha: 1 }, t + 0.9);
      D.hit(card, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'expo.out' }, t + 0.9);
      tl.to(bar, { scaleY: 1, duration: 0.45, ease: 'expo.out' }, t + 0.95);
      tl.to(k, { duration: 0.5, scrambleText: { text: st.k, chars: 'upperCase', speed: 1 }, ease: 'none' }, t + 0.95);
      tl.to(tw, { yPercent: 0, duration: 0.6, ease: 'expo.out', stagger: 0.04 }, t + 1.0);
      tl.to(desc, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, t + 1.25);
      if (st.label) D.label(t + 0.6, st.label);
      PLAY[st.vis](D, vis[i], t + 1.1);
    });

    // ── the pull-back: the whole graph, then the cut
    const back = T + (o.backAt ?? dur - 2), k = SW / TW;
    tl.to(main, { drawSVG: '0% 100%', duration: 0.8, ease: 'power2.inOut' }, back);
    tl.to(track, { x: 0, y: (SH - SH * k) / 2 + (v ? 190 : -60), scale: k, duration: 1.1, ease: 'expo.inOut' }, back);
    D.sfx('whoosh', back, 0.6, 0.3);
    const out = D.$('.igr-out', s);
    if (out) {
      const ow = D.split(out, { type: 'words', mask: 'words' }).words;
      gsap.set(ow, { yPercent: 110 });
      D.show(out, back + 0.3);
      tl.to(ow, { yPercent: 0, duration: 0.6, ease: 'expo.out', stagger: 0.05 }, back + 0.35);
    }
    tl.to(track, { opacity: 0, duration: 0.25, ease: 'power2.in' }, T + dur - 0.25);
    D.hide(s, T + dur);
    return dur;
  });
})();
