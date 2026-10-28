/* ============================================================================
   IG BLOOM — the turn of "Conocer a Ignacio" (css/ig-bloom.css): every path at once, and what it all grows into.
   Load after ig-open.js.

   igzoom    The zoom-out. On the drop the camera pulls back from the own branches to the whole living graph:
             the seed at 17, the main line through the years, every front that opened and the own paths. The
             tips germinate one after the other (a sprout and a bud), the line keeps going past today, dashed,
             to one point of light: «Todo germina en lo mismo: buscar nuevos desafíos.»           8 s
             { seed, years: [6 labels], fronts: [{ name, color }] (7), own: [{ name, color }] (7), today,
               line, line2, duration }
   igrubros  The challenges, then the industries. On coral: «Potenciar negocios.» (bars that grow) and
             «Automatizar procesos difíciles.» (a tangle that straightens into a pipeline). Then on ink:
             «No le temo a ningún rubro:» and one line icon per industry, each landing on a beat.         8 s
             { kicker, lines: [a, b], head, rubros: [{ id, name }] (6), split, duration }
             ids: startups · corporate · agro · space · mining · oilgas

   9:16 (D.vertical): igzoom runs the time upwards (the seed at the bottom, the light at the top), every branch to
   the right of the line; igrubros stacks its lines and lays the industries in two columns.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const INK = '#0e0e10', PAPER = '#eeeae3', CORAL = '#ff4d2e', BLUE = '#2b50ff', YELLOW = '#ffc21a';
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const BEAT = 0.5, S16 = 0.125;

  // ================================================================== IGZOOM geometry
  // 16:9: time left → right on y 640. Fronts alternate above / below; the own paths fan up at the right on lanes.
  // 9:16: time bottom → top on x 150; every branch turns right into its tip; the own paths climb on lanes.
  function layout(v) {
    const fan = (hx, hy, tips, dx) => tips.map(([tx, ty]) => ({ fork: [hx, hy], tip: [tx, ty], label: [tx + 50, ty], al: 'l',
      d: `M${hx} ${hy}C${hx + dx} ${hy} ${tx - dx} ${ty} ${tx} ${ty}` }));
    if (!v) {
      const Y = 620, years = [110, 430, 640, 850, 1060, 1400];
      const F = [[150, 300, 410], [430, 570, 840], [640, 780, 410], [850, 990, 840], [1060, 1170, 410], [1110, 1255, 850], [1170, 1300, 470]];
      return {
        years: years.map(x => [x, Y]), seed: [110, Y], today: [1400, Y], light: [1830, Y],
        main: `M110 ${Y}H1400`, future: `M1400 ${Y}H1830`,
        fronts: F.map(([fx, tx, ty]) => { const up = ty < Y; return { fork: [fx, Y], tip: [tx, ty], label: [tx, up ? ty - 92 : ty + 44], al: 'c', up,
          d: `M${fx} ${Y}C${fx + 60} ${Y} ${tx - 110} ${ty} ${tx} ${ty}` }; }),
        own: fan(1400, Y, [[1545, 290], [1545, 370], [1545, 450], [1545, 530], [1545, 710], [1545, 790], [1545, 870]], 70),
        yearAt: (x, y, i) => [i ? x - 14 : x + 6, y + 50], focus: [1560, 580], zoom: 2,
      };
    }
    // 9:16: time runs upwards on x 150; every branch turns right; the own paths fan out above today, under the words
    const X = 150, years = [1800, 1700, 1615, 1530, 1445, 1200];
    const fy = [1780, 1700, 1615, 1530, 1445, 1370, 1290];
    return {
      years: years.map(y => [X, y]), seed: [X, 1800], today: [X, 1200], light: [X, 690],
      main: `M${X} 1800V1200`, future: `M${X} 1200V690`,
      fronts: fy.map(y => { const ty = y - 36; return { fork: [X, y], tip: [400, ty], label: [450, ty], al: 'l', up: true, d: `M${X} ${y}C${X} ${ty} ${X + 120} ${ty} 400 ${ty}` }; }),
      own: [1130, 1068, 1006, 944, 882, 820, 758].map(ty => ({ fork: [X, 1200], tip: [400, ty], label: [450, ty], al: 'l',
        d: `M${X} 1200C${X + 140} 1200 ${280} ${ty} 400 ${ty}` })),
      yearAt: (x, y) => [x - 30, y], focus: [420, 940], zoom: 1.8,
    };
  }
  /** a seedling at a tip: a short stem, two leaves and a bud, always growing up */
  const sprout = (x, y, c, k) => `<g class="igz-sp" transform="translate(${x} ${y}) scale(${k})"><g class="igz-spi">
      <path d="M0 0C-1 -10 2 -18 0 -30" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
      <path d="M0 -20C-6 -34 -22 -40 -32 -32C-24 -22 -10 -18 0 -20Z" fill="${c}"/><path d="M0 -26C6 -40 22 -46 32 -38C24 -28 10 -24 0 -26Z" fill="${c}" opacity=".75"/>
      <circle cx="0" cy="-32" r="6" fill="${PAPER}"/></g><circle class="igz-tip" r="5" fill="${c}"/></g>`;

  recipe('igzoom', (D, T, o) => {
    const { tl } = D;
    const v = D.vertical, dur = o.duration || 8, G = layout(v);
    const fronts = (o.fronts || []).slice(0, 7).map((f, i) => ({ ...f, ...G.fronts[i] }));
    const own = (o.own || []).slice(0, 7).map((f, i) => ({ ...f, ...G.own[i] }));
    const all = [...fronts, ...own];
    const s = D.scene('igzoom', `<div class="igz">
      <div class="igz-cam" style="transform-origin:${G.focus[0]}px ${G.focus[1]}px">
        <svg class="igz-g" viewBox="0 0 ${D.W} ${D.H}">
          <path class="igz-future" d="${G.future}"/>
          ${all.map(b => `<path class="igz-br" d="${b.d}" style="stroke:${b.color}"/>`).join('')}
          <path class="igz-main" d="${G.main}"/>
          ${G.years.map(([x, y], i) => `<circle class="igz-yn" cx="${x}" cy="${y}" r="${i === 0 ? 16 : 10}"${i === 0 ? ` style="fill:${CORAL}"` : ''}/>`).join('')}
          ${all.map(b => sprout(b.tip[0], b.tip[1], b.color, v ? 1 : b.al === 'l' ? 1.15 : 1.45)).join('')}
        </svg>
        ${G.years.map(([x, y], i) => { const [lx, ly] = G.yearAt(x, y, i); return `<div class="igz-yr mono${v ? ' r' : ''}" style="left:${lx}px;top:${ly}px">${esc((o.years || [])[i])}</div>`; }).join('')}
        ${all.map(b => `<div class="igz-lab igz-${b.al}" style="left:${b.label[0]}px;top:${b.label[1]}px;--c:${b.color}">${esc(b.name)}</div>`).join('')}
        <i class="igz-glow" style="left:${G.light[0]}px;top:${G.light[1]}px"></i><i class="igz-light" style="left:${G.light[0]}px;top:${G.light[1]}px"></i>
      </div>
      <div class="igz-txt"><div class="igz-a">${o.line || ''}</div><div class="igz-b">${o.line2 || ''}</div></div>
    </div>`);
    const cam = D.$('.igz-cam', s), main = D.$('.igz-main', s), fut = D.$('.igz-future', s), brs = D.$$('.igz-br', s), yn = D.$$('.igz-yn', s);
    const sps = D.$$('.igz-spi', s), labs = D.$$('.igz-lab', s), yrs = D.$$('.igz-yr', s), glow = D.$('.igz-glow', s), light = D.$('.igz-light', s);
    const ta = D.$('.igz-a', s), tb = D.$('.igz-b', s);
    D.fit(tb, v ? D.W - 140 : 1250);
    const aw = D.split(ta, { type: 'words', mask: 'words' }).words, bw = D.split(tb, { type: 'words', mask: 'words' }).words;
    D.show(s, T);
    D.wipeTo(o.bg || INK, T, 'up', 0.3);
    D.ink(PAPER, T);
    if (o.label) D.label(T, o.label);
    const tips = D.$$('.igz-tip', s);
    gsap.set([main, ...brs], { drawSVG: '0%' });
    gsap.set(fut, v ? { scaleY: 0, transformOrigin: '50% 100%' } : { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set([...yn, ...tips], { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(sps, { scale: 0, svgOrigin: '0 0' });
    gsap.set([...labs, ...yrs], { opacity: 0 });
    labs.forEach((l, i) => gsap.set(l, all[i].al === 'l' ? { yPercent: -50 } : { xPercent: -50, yPercent: -50 }));
    yrs.forEach((y, i) => gsap.set(y, v ? { xPercent: -100, yPercent: -50 } : { xPercent: i ? -100 : -50 }));
    gsap.set([glow, light], { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
    gsap.set([...aw, ...bw], { yPercent: 110 });
    const nF = fronts.length, ownBr = brs.slice(nF), frBr = brs.slice(0, nF);
    // on the drop: the camera starts on the own paths (just seen in the montage) and pulls back to every path
    tl.fromTo(cam, { scale: G.zoom }, { scale: 1, duration: 2.1, ease: 'expo.inOut' }, T);
    D.sfx('whoosh', T + 0.1, 1.2, 0.35);
    tl.to(ownBr, { drawSVG: '100%', duration: 0.4, ease: 'power2.out', stagger: 0.04 }, T);
    tl.to(tips.slice(nF), { scale: 1, duration: 0.25, ease: 'back.out(3)', stagger: 0.04 }, T + 0.3);
    tl.to(labs.slice(nF), { opacity: 1, duration: 0.3, stagger: 0.04 }, T + 0.3);
    // the main line from the seed, and every front in the order it opened
    tl.to(main, { drawSVG: '100%', duration: 1.3, ease: 'power2.inOut' }, T + 0.3);
    yn.forEach((n, i) => tl.to(n, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, T + 0.35 + i * 0.2));
    yrs.forEach((y, i) => tl.to(y, { opacity: 1, duration: 0.35 }, T + 0.45 + i * 0.2));
    frBr.forEach((b, i) => {
      const at = T + 0.5 + i * 0.17;
      tl.to(b, { drawSVG: '100%', duration: 0.5, ease: 'power2.out' }, at);
      tl.to(tips[i], { scale: 1, duration: 0.25, ease: 'back.out(3)' }, at + 0.42);
      D.hit(labs[i], { opacity: 0, y: fronts[i].up ? 10 : -10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, at + 0.45);
    });
    // then every tip germinates, in the order it opened, one per 16th: a stem, two leaves, a bud
    const B0 = T + 2;
    all.forEach((b, i) => {
      const at = B0 + i * S16;
      D.hit(sps[i], { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, at);
      if (i % 2 === 0) D.sfx('tick', at, 0.04);
    });
    // past today the line goes on, dashed, to one point of light
    const L = T + 4;
    D.hit(fut, v ? { scaleY: 0, transformOrigin: '50% 100%' } : { scaleX: 0, transformOrigin: '0% 50%' }, { [v ? 'scaleY' : 'scaleX']: 1, duration: 0.9, ease: 'power2.inOut' }, L - 0.9);
    D.hit(light, { scale: 0, opacity: 1 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, L);
    D.hit(glow, { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'expo.out' }, L);
    D.sfx('boom', L, 0.35);
    // everything pulses together on the bars that follow: it all grows into the same thing
    D.hit(sps, { scale: 1.25 }, { scale: 1, duration: 0.6, ease: 'power2.out', stagger: { each: 0.02, from: 'end' } }, L + 2);
    D.hit(light, { scale: 1.4 }, { scale: 1, duration: 0.8, ease: 'power2.out' }, L + 2);
    // the words
    tl.to(aw, { yPercent: 0, duration: 0.6, ease: 'expo.out', stagger: 0.05 }, T + 2.9);
    tl.to(bw, { yPercent: 0, duration: 0.75, ease: 'expo.out', stagger: 0.06 }, L);
    // out: the light opens and floods the frame (the next act starts on its colour)
    const out = T + dur - 0.55;
    tl.to([ta, tb, ...labs, ...yrs], { opacity: 0, duration: 0.3, ease: 'power2.in' }, out - 0.1);
    tl.to(D.$('.igz-g', s), { opacity: 0.25, duration: 0.4, ease: 'power2.in' }, out);
    tl.to(glow, { scale: 9, duration: 0.55, ease: 'power3.in' }, out);
    tl.to(light, { scale: 60, duration: 0.55, ease: 'power3.in' }, out);
    D.sfx('whoosh', out, 0.55, 0.3);
    D.hide(s, T + dur);
    (D.cfg.warmAt ||= []).push(T + 0.6, T + 2.6, T + 4.6);
    return dur;
  });

  // ================================================================== IGRUBROS
  // industry icons: viewBox 0 0 120 120, ink strokes (drawn on), one accent fill each (.ac)
  const ICONS = {
    startups: `<path d="M60 12C80 30 86 56 81 80H39C34 56 40 30 60 12Z"/><circle cx="60" cy="48" r="10"/><path d="M39 64L24 86L40 84"/><path d="M81 64L96 86L80 84"/>
      <path class="ac" d="M48 84C50 100 56 108 60 112C64 108 70 100 72 84Z"/>`,
    corporate: `<path d="M26 106V22H70V106"/><path d="M70 50H96V106"/><path d="M14 106H106"/>
      <path class="ac" d="M36 32h10v10h-10zM52 32h10v10h-10zM36 50h10v10h-10zM52 50h10v10h-10zM36 68h10v10h-10zM52 68h10v10h-10zM78 62h10v10h-10zM78 80h10v10h-10z"/>`,
    agro: `<path d="M60 112V30"/><path d="M60 112C52 98 40 92 26 92"/>
      <path class="ac" d="M60 40C48 38 42 28 46 18C56 20 60 30 60 40ZM60 40C72 38 78 28 74 18C64 20 60 30 60 40ZM60 60C48 58 40 48 44 38C56 40 60 50 60 60ZM60 60C72 58 80 48 76 38C64 40 60 50 60 60ZM60 80C48 78 40 68 44 58C56 60 60 70 60 80ZM60 80C72 78 80 68 76 58C64 60 60 70 60 80Z"/>`,
    space: `<path d="M50 50L70 50L70 70L50 70Z" transform="rotate(45 60 60)"/><path d="M60 46V30"/><circle cx="60" cy="26" r="5"/><ellipse cx="60" cy="60" rx="54" ry="20" stroke-dasharray="3 9" transform="rotate(-20 60 60)"/>
      <path class="ac" d="M16 52h26v16h-26zM78 52h26v16h-26z"/><path d="M42 60H50M70 60H78"/>`,
    mining: `<path d="M24 60H96L86 92H34Z"/><circle cx="44" cy="100" r="7"/><circle cx="76" cy="100" r="7"/><path d="M12 110H108"/>
      <path class="ac" d="M34 60L44 44L56 52L66 38L80 50L88 60Z"/>`,
    oilgas: `<path d="M44 108L62 56L80 108"/><path d="M14 108H106"/><g class="pj"><path d="M22 48L104 40"/><path d="M22 48C14 48 12 60 18 66L24 64"/></g><path d="M100 41L94 86"/><circle cx="94" cy="92" r="8"/><path d="M18 66V108"/>
      <path class="ac" d="M30 96C30 92 34 86 34 86C34 86 38 92 38 96C38 99 36 101 34 101C32 101 30 99 30 96Z"/>`,
  };
  // the two challenges' pictures (viewBox 0 0 300 220)
  const GROW = `<svg class="igr2-pic igr2-grow" viewBox="0 0 300 220"><path class="ax" d="M20 196H284"/>${[0, 1, 2, 3].map(i => `<rect class="gb" x="${36 + i * 62}" y="${150 - i * 34}" width="42" height="${46 + i * 34}" rx="6"/>`).join('')}
    <path class="arw" d="M36 128L104 92L160 106L246 34"/><path class="arh" d="M222 34H248V60"/></svg>`;
  const TANGLE = 'M20 120C60 40 110 200 140 110S90 30 170 70 230 190 180 150 250 60 280 110';
  const STRAIGHT = 'M20 110C70 110 110 110 140 110S110 110 170 110 230 110 200 110 250 110 280 110';
  const FLOW = `<svg class="igr2-pic igr2-flow" viewBox="0 0 300 220"><path class="tg" d="${TANGLE}"/>
    ${[20, 107, 193, 280].map((x, i) => `<g class="nd" transform="translate(${x} 110)"><circle r="20"/><path d="M-8 0l5 5 10-11"/></g>`).join('')}<circle class="pk" cx="20" cy="110" r="9"/></svg>`;

  recipe('igrubros', (D, T, o) => {
    const { tl } = D;
    const v = D.vertical, dur = o.duration || 8, SPLIT = T + (o.split ?? 3.5), rub = (o.rubros || []).slice(0, 6);
    const s = D.scene('igrubros', `<div class="igr2">
      <section class="igr2-a">
        <div class="igr2-k mono"></div>
        <div class="igr2-row igr2-r1"><div class="igr2-l">${o.lines[0]}</div>${GROW}</div>
        <div class="igr2-row igr2-r2"><div class="igr2-l">${o.lines[1]}</div>${FLOW}</div>
      </section>
      <section class="igr2-b">
        <div class="igr2-h">${o.head || ''}</div>
        <div class="igr2-grid">${rub.map(r => `<div class="igr2-tile"><svg class="igr2-ic" viewBox="0 0 120 120">${ICONS[r.id] || ''}</svg><b>${esc(r.name)}</b></div>`).join('')}</div>
      </section>
    </div>`);
    const A = D.$('.igr2-a', s), B = D.$('.igr2-b', s), k = D.$('.igr2-k', s), ls = D.$$('.igr2-l', s), h = D.$('.igr2-h', s), tiles = D.$$('.igr2-tile', s);
    ls.forEach(l => D.fit(l, v ? D.W - 140 : 1180));
    D.fit(h, v ? D.W - 140 : 1700);
    const lw = ls.map(l => D.split(l, { type: 'words', mask: 'words' }).words), hw = D.split(h, { type: 'words', mask: 'words' }).words;
    D.show(s, T);
    D.setBg(CORAL, T);
    D.ink(INK, T);
    if (o.label) D.label(T, o.label);
    gsap.set(B, { autoAlpha: 0 });
    gsap.set([...lw.flat(), ...hw], { yPercent: 110 });
    // every element starts hidden at build time (its tween sets it again on the timeline: seeking stays exact)
    gsap.set(D.$$('.igr2-grow .ax, .igr2-grow .arw, .igr2-grow .arh, .igr2-flow .tg, .igr2-flow .nd path', s), { drawSVG: '0%' });
    // (origin and scale in one set: changing an SVG element's origin later would shift it — GSAP's smoothOrigin)
    gsap.set(D.$$('.igr2-grow .gb', s), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(D.$$('.igr2-flow .nd', s), { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(D.$('.igr2-flow .pk', s), { opacity: 0 });
    gsap.set(tiles, { opacity: 0 });
    gsap.set(D.$$('.igr2-tile b', s), { opacity: 0 });
    // ── part 1, on coral: the two challenges, each with its picture
    if (o.kicker) tl.to(k, { duration: 0.5, scrambleText: { text: o.kicker, chars: 'upperCase', speed: 1 }, ease: 'none' }, T + 0.1);
    tl.to(lw[0], { yPercent: 0, duration: 0.65, ease: 'expo.out', stagger: 0.06 }, T + 0.2);
    const grow = D.$('.igr2-grow', s), bars = D.$$('.gb', grow), arw = D.$('.arw', grow), arh = D.$('.arh', grow), ax = D.$('.ax', grow);
    D.hit(ax, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.4, ease: 'power2.out' }, T + 0.3);
    D.hit(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: 'back.out(1.8)', stagger: 0.12 }, T + 0.45);
    D.hit(arw, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.5, ease: 'power2.inOut' }, T + 0.85);
    D.hit(arh, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.2, ease: 'power2.out' }, T + 1.3);
    tl.to(lw[1], { yPercent: 0, duration: 0.65, ease: 'expo.out', stagger: 0.06 }, T + 1.1);
    const flow = D.$('.igr2-flow', s), tg = D.$('.tg', flow), nds = D.$$('.nd', flow), pk = D.$('.pk', flow);
    D.hit(tg, { drawSVG: '0%', morphSVG: TANGLE }, { drawSVG: '100%', duration: 0.6, ease: 'power2.inOut' }, T + 1.2);
    // on the beat the knot comes undone: the hard process, automated
    const M = T + 2;
    tl.to(tg, { morphSVG: STRAIGHT, duration: 0.5, ease: 'expo.inOut' }, M);
    D.hit(nds, { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)', stagger: 0.1 }, M + 0.35);
    D.hit(D.$$('.nd path', flow), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.25, stagger: 0.1 }, M + 0.55);
    D.hit(pk, { x: 0, opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.05 }, { x: 260, duration: 0.8, ease: 'power1.inOut' }, { opacity: 0, duration: 0.1 }] }, M + 0.6);
    D.sfx('whoosh', M, 0.4, 0.2);
    tl.to(A, { y: v ? -60 : -40, opacity: 0, duration: 0.3, ease: 'power2.in' }, SPLIT - 0.3);
    // ── part 2, on ink: «No le temo a ningún rubro:» and the industries, one per beat
    D.wipeTo(o.bg || INK, SPLIT, 'up', 0.4);
    D.ink(PAPER, SPLIT);
    D.show(B, SPLIT);
    tl.to(hw, { yPercent: 0, duration: 0.6, ease: 'expo.out', stagger: 0.05 }, SPLIT + 0.1);
    const b0 = Math.ceil((SPLIT + 0.4) / BEAT - 1e-6) * BEAT;
    tiles.forEach((tile, i) => {
      const b = b0 + i * BEAT, strokes = D.$$('.igr2-ic path:not(.ac), .igr2-ic circle, .igr2-ic ellipse', tile), acc = D.$$('.ac', tile), name = D.$('b', tile);
      gsap.set(strokes, { drawSVG: '0%' });
      gsap.set(acc, { opacity: 0 });
      D.hit(tile, { scale: 1.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2.2)' }, b);
      tl.to(strokes, { drawSVG: '100%', duration: 0.4, ease: 'power2.out', stagger: 0.03 }, b);
      tl.to(acc, { opacity: 1, duration: 0.2 }, b + 0.25);
      D.hit(name, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'expo.out' }, b + 0.08);
      D.sfx('fold', b, 0.3);
      const pj = D.$('.pj', tile); // the pumpjack nods
      if (pj) { gsap.set(pj, { svgOrigin: '62 44' }); D.hit(pj, { rotation: 0 }, { keyframes: [{ rotation: 9, duration: 0.35, ease: 'sine.inOut' }, { rotation: -6, duration: 0.45, ease: 'sine.inOut' }, { rotation: 0, duration: 0.35, ease: 'sine.inOut' }] }, b + 0.3); }
      (D.cfg.warmAt ||= []).push(b + 0.3);
    });
    // all of them, once more, on the next bar; then out
    const allAt = b0 + tiles.length * BEAT + 0.5;
    if (allAt < T + dur - 0.6) D.hit(tiles.map(t => D.$('.igr2-ic', t)), { scale: 1.12 }, { scale: 1, duration: 0.5, ease: 'power2.out', stagger: { each: 0.03, from: 'center' } }, allAt);
    tl.to([h, ...tiles], { opacity: 0, y: -30, duration: 0.3, ease: 'power2.in', stagger: 0.02 }, T + dur - 0.4);
    D.hide(s, T + dur);
    (D.cfg.warmAt ||= []).push(T + 1.4, M + 0.6);
    return dur;
  });
})();
