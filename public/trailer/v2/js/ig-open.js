/* ============================================================================
   IG OPEN — the opening of "Conocer a Ignacio" (css/ig-open.css): where it started and the first product.
   Load after ig-kit.js. Drawn with SVG + DOM, every tween on the master timeline (seekable with ?t=).

   igcoast   «Todo empezó en Mar del Plata.» Night. The coast draws itself from north to south, as on a map (north up,
             land west, the Atlantic east): from the NNE down to the city, where it bulges east into the sea (the city
             front, Cabo Corrientes), the port's two breakwaters, then SW towards Chapadmalal. One point of light comes
             on in the city, on land; its glow and rings are clipped to the land. The camera dives into it.  6 s
             { kicker, line, sea, duration }   (line: HTML, <em> = accent; <br> between the two lines)
   igfirst   «Con 17 años programé mi primer producto: una web de juegos.» A small retro games site builds
             itself in a browser (header, a ticker, six game tiles with pixel sprites); a cursor clicks «Jugar»
             on the last 16th before the drop. On the drop the clicked button becomes the seed and ONE bright coral
             path grows out of exactly that point, first and alone: down to the main line and along it to where
             the fronts start (Trailer.igLine); a light rides its tip and the camera leans after it. Only then thin,
             dim branches sprout from the seed and from the path, and fade («…que me cambió la vida.»). 6 s
             { kicker, lines: [a, b], big, after, afterSub, site: { logo, nav: [], play, ticker }, click, drop }

   9:16 (D.vertical): igcoast keeps the map (bigger, the coast runs down the tall stage) with the title at the
   bottom; igfirst puts the text on top and the browser under it.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const INK = '#0e0e10', PAPER = '#eeeae3', CORAL = '#ff4d2e', BLUE = '#2b50ff', YELLOW = '#ffc21a', NIGHT = '#07070a';
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /** the main line the story walks on (igfirst leaves it, igfronts walks it): its height and the seed's x */
  const LINE = Trailer.igLine = { y: v => (v ? 1640 : 940), x: v => (v ? 84 : 150) };

  /** open Catmull-Rom through pts → a cubic path, plus `n` samples along it ([x, y, fraction]) */
  function spline(pts, n = 0) {
    const P = i => pts[Math.max(0, Math.min(pts.length - 1, i))];
    const seg = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      seg.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]);
    }
    const f = v => v.toFixed(1);
    const d = `M${f(pts[0][0])} ${f(pts[0][1])}` + seg.map(([, a, b, c]) => `C${f(a[0])} ${f(a[1])} ${f(b[0])} ${f(b[1])} ${f(c[0])} ${f(c[1])}`).join('');
    const bez = ([a, b, c, e], t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * e[k]); };
    const fine = [];
    seg.forEach(s => { for (let k = 0; k < 24; k++) fine.push(bez(s, k / 24)); });
    fine.push(pts[pts.length - 1]);
    const acc = [0];
    for (let i = 1; i < fine.length; i++) acc.push(acc[i - 1] + Math.hypot(fine[i][0] - fine[i - 1][0], fine[i][1] - fine[i - 1][1]));
    const L = acc[acc.length - 1];
    const at = fr => { const want = fr * L; let i = acc.findIndex(a => a >= want); if (i <= 0) i = 1; const k = (want - acc[i - 1]) / Math.max(1e-6, acc[i] - acc[i - 1]); return [fine[i - 1][0] + (fine[i][0] - fine[i - 1][0]) * k, fine[i - 1][1] + (fine[i][1] - fine[i - 1][1]) * k]; };
    return { d, at, L, samples: Array.from({ length: n }, (_, i) => { const fr = (i + 0.5) / n; return [...at(fr), fr]; }) };
  }

  // ================================================================== IGCOAST
  // The coast in map units, north up, the Atlantic to the EAST (+x), land to the west — as on Google Maps. A simple,
  // recognisable trace (Ignacio's reference, 28/10/2026): from Santa Clara / Mar Chiquita in the NNE the shore runs
  // down to the city, bulges east into the sea there (the city front and Cabo Corrientes), has the port's two
  // breakwaters just south of the cape, then runs SW towards Chapadmalal and Miramar. Points north → south.
  const COAST = [[780, -560], [700, -380], [630, -200], [570, -40], [522, 90], [488, 200], [468, 300], [470, 370], [484, 420],
    [502, 466], [516, 516], [508, 554], [480, 584], [458, 612], [446, 646], [436, 690], [422, 730], [400, 790], [372, 860],
    [336, 940], [290, 1030], [232, 1130], [160, 1240], [80, 1360], [-20, 1500], [-90, 1600]];
  const BREAKWATERS = ['M447 640C472 639 495 643 507 653C517 663 519 679 517 695', 'M434 702C456 703 480 706 499 714'];
  const CITY = [405, 470]; // the light: downtown, on land, a few blocks in from the bulge of the city front
  // groynes along the beaches north of the cape, at Playa Grande and south of the port: [y from, y to, how many]
  const GROYNES = [[180, 410, 6], [585, 632, 2], [770, 950, 6]];

  recipe('igcoast', (D, T, o) => {
    const { tl } = D;
    const v = D.vertical, dur = o.duration || 6, r = rng(23);
    // map → stage: scale and offset so the city lands where the frame needs it (the coast on the right, the sea east)
    const S = v ? 1.35 : 1.0, at = v ? [400, 700] : [1440, 380];
    const ox = at[0] - CITY[0] * S, oy = at[1] - CITY[1] * S;
    const coast = spline(COAST, 400);
    const land = `${coast.d}L-2600 1600L-2600 -560Z`;
    // the shore's x at a map y, and its fraction along the line (from the dense samples)
    const near = y => coast.samples.reduce((a, p) => (Math.abs(p[1] - y) < Math.abs(a[1] - y) ? p : a));
    // the groynes: short strokes from the shore out to sea, perpendicular to the coast
    const gro = [];
    GROYNES.forEach(([y0, y1, n]) => { for (let i = 0; i < n; i++) {
      const fr = near(y0 + (y1 - y0) * (i + 0.5) / n)[2], p = coast.at(fr), q = coast.at(fr + 0.002), dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
      const nx = dy / L, ny = -dx / L, s = nx < 0 ? -1 : 1; // the normal that points to the sea (east)
      gro.push({ fr, d: `M${p[0].toFixed(1)} ${p[1].toFixed(1)}l${(s * nx * 15).toFixed(1)} ${(s * ny * 15).toFixed(1)}` });
    } });
    // the sea: short wave strokes east of the coast (never on land)
    const waves = Array.from({ length: v ? 34 : 30 }, () => {
      const y = -360 + r() * 1800, x = near(y)[0] + 60 + r() * 720, w = 14 + r() * 34;
      return `<path d="M${x.toFixed(0)} ${y.toFixed(0)}h${w.toFixed(0)}" style="opacity:${(0.25 + r() * 0.5).toFixed(2)}"/>`;
    }).join('');
    // a faint street grid on the land around the centre (the city's own diagonal grid): a diamond of blocks
    const grid = [], G = 26, NG = 9;
    for (let k = -NG; k <= NG; k++) {
      const a = (NG - Math.abs(k)) * G; // shorter towards the diamond's tips
      const op = `style="opacity:${(0.2 * (1 - Math.abs(k) / (NG + 1))).toFixed(3)}"`; // fades out from the centre
      grid.push(`<path ${op} d="M${CITY[0] + k * G * 0.7 - a * 0.7} ${CITY[1] + k * G * 0.7 + a * 0.7}l${(a * 1.4).toFixed(0)} ${(-a * 1.4).toFixed(0)}"/>`,
        `<path ${op} d="M${CITY[0] - k * G * 0.7 - a * 0.7} ${CITY[1] + k * G * 0.7 - a * 0.7}l${(a * 1.4).toFixed(0)} ${(a * 1.4).toFixed(0)}"/>`);
    }
    const sx = at[0], sy = at[1], [cx, cy] = CITY;
    // the light and its rings live on the map, clipped to the land: they spread over the city, never over the sea
    const s = D.scene('igcoast', `<div class="igo">
      <div class="igo-map" style="transform-origin:${sx}px ${sy}px">
        <svg class="igo-svg" viewBox="0 0 ${D.W} ${D.H}">
          <defs><clipPath id="igo-land"><path d="${land}"/></clipPath>
            <radialGradient id="igo-light"><stop offset="0" stop-color="#ff4d2e" stop-opacity=".5"/><stop offset=".45" stop-color="#ff4d2e" stop-opacity=".16"/><stop offset="1" stop-color="#ff4d2e" stop-opacity="0"/></radialGradient></defs>
          <g transform="translate(${ox.toFixed(1)} ${oy.toFixed(1)}) scale(${S})">
            <path class="igo-land" d="${land}"/>
            <g clip-path="url(#igo-land)">
              <circle class="igo-glow" cx="${cx}" cy="${cy}" r="300" fill="url(#igo-light)"/>
              <g class="igo-grid">${grid.join('')}</g>
              ${[0, 1, 2].map(() => `<circle class="igo-ring" cx="${cx}" cy="${cy}" r="62"/>`).join('')}
            </g>
            <g class="igo-waves">${waves}</g>
            <path class="igo-surf" d="${coast.d}" transform="translate(9 3)"/>
            <path class="igo-coast" d="${coast.d}"/>
            ${BREAKWATERS.map(d => `<path class="igo-bw" d="${d}"/>`).join('')}
            ${gro.map(g => `<path class="igo-gro" d="${g.d}"/>`).join('')}
          </g>
        </svg>
        <i class="igo-seed" style="left:${sx}px;top:${sy}px"></i>
        <div class="igo-sea mono">${o.sea || ''}</div>
      </div>
      <i class="igo-shade"></i>
      <div class="igo-txt"><div class="igo-k mono"></div><div class="igo-line">${o.line || ''}</div></div>
    </div>`);
    const map = D.$('.igo-map', s), svg = D.$('.igo-svg', s), cl = D.$('.igo-coast', s), surf = D.$('.igo-surf', s), bws = D.$$('.igo-bw', s), gs = D.$$('.igo-gro', s);
    const wv = D.$('.igo-waves', s), gridG = D.$('.igo-grid', s), seed = D.$('.igo-seed', s), glow = D.$('.igo-glow', s), rings = D.$$('.igo-ring', s);
    const sea = D.$('.igo-sea', s), k = D.$('.igo-k', s), line = D.$('.igo-line', s), shade = D.$('.igo-shade', s);
    sea.innerHTML = String(o.sea || '').split(' ').map(esc).join('<br>');
    D.fit(line, D.W - (v ? 140 : 240));
    const words = D.split(line, { type: 'words', mask: 'words' }).words;

    D.show(s, T);
    D.setBg(NIGHT, T);
    D.ink(PAPER, T);
    if (o.label) D.label(T + 0.4, o.label);
    gsap.set([cl, surf, ...bws], { drawSVG: '0%' });
    gsap.set(gs, { opacity: 0 });
    gsap.set(seed, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 }); // the light comes on at L0, not before
    gsap.set([glow, ...rings], { svgOrigin: `${cx} ${cy}` });
    gsap.set(glow, { scale: 0.3, opacity: 0 });
    gsap.set(gridG, { opacity: 0 });
    gsap.set(rings, { scale: 0.2, opacity: 0 });
    gsap.set(words, { yPercent: 115 });
    // the night comes up; the coast draws itself north → south; the groynes follow the pen
    D.hit(svg, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, T);
    D.hit(wv, { x: -18 }, { x: 26, duration: dur, ease: 'none' }, T);
    D.hit(gridG, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power2.out' }, T + 1.6);
    const DRAW = 2.4;
    tl.to(cl, { drawSVG: '100%', duration: DRAW, ease: 'power2.inOut' }, T + 0.15);
    tl.to(surf, { drawSVG: '100%', duration: DRAW, ease: 'power2.inOut' }, T + 0.3);
    const ease = gsap.parseEase('power2.inOut');
    const when = fr => { let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (ease(m) < fr) lo = m; else hi = m; } return T + 0.15 + hi * DRAW; };
    gro.forEach((g, i) => D.hit(gs[i], { opacity: 0 }, { opacity: 1, duration: 0.25 }, when(g.fr) + 0.05));
    tl.to(bws, { drawSVG: '100%', duration: 0.6, ease: 'power2.out', stagger: 0.12 }, when(near(660)[2]));
    D.hit(sea, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1, ease: 'power2.out' }, T + 1.2);
    D.sfx('swell', T + 0.1, 4.6, 0.2);
    // one point of light, on the downbeat of the second bar
    const L0 = T + 2;
    D.hit(seed, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(3)' }, L0);
    D.hit(glow, { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out' }, L0);
    [L0, L0 + 0.25, L0 + 2].forEach((t, i) => D.hit(rings[i], { scale: 0.2, opacity: 0.9 }, { scale: 3.4, opacity: 0, duration: 1.7, ease: 'power2.out' }, t));
    D.sfx('beep', L0, 880, 0.5, 0.035);
    // the title, from the bottom
    D.hit(shade, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.out' }, T + 2.2);
    if (o.kicker) tl.to(k, { duration: 0.6, scrambleText: { text: o.kicker, chars: 'upperCase', speed: 1 }, ease: 'none' }, T + 2.4);
    tl.to(words, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07 }, T + 2.6);
    // the camera pushes in, then dives into the light (the next scene opens from it)
    tl.fromTo(map, { scale: 1 }, { scale: 1.08, duration: dur - 0.7, ease: 'sine.inOut' }, T);
    tl.to(map, { scale: 5, duration: 0.7, ease: 'power3.in' }, T + dur - 0.7);
    tl.to(svg, { opacity: 0, duration: 0.5, ease: 'power2.in' }, T + dur - 0.55);
    tl.to([line, k, shade, sea], { opacity: 0, y: -24, duration: 0.4, ease: 'power2.in' }, T + dur - 0.75);
    D.sfx('whoosh', T + dur - 0.7, 0.7, 0.3);
    D.hide(s, T + dur);
    (D.cfg.warmAt ||= []).push(T + 3.4);
    return dur;
  });

  // ================================================================== IGFIRST
  // pixel sprites (8×8) for the game tiles
  const SPRITES = [
    ['.X....X.', '..X..X..', '.XXXXXX.', 'XX.XX.XX', 'XXXXXXXX', 'X.XXXX.X', 'X.X..X.X', '...XX...'],  // a space invader of its own
    ['...XX...', '...XX...', '..XXXX..', '.XXXXXX.', 'XXXXXXXX', 'XX.XX.XX', 'X......X', '........'],  // a ship
    ['........', '..XXXX..', '.X.XX.X.', 'XXXXXXXX', 'XXXXXXXX', '.X....X.', '.XX..XX.', '........'],  // a car
    ['XX.XX.XX', '........', 'XX.XX.XX', '........', '.....X..', '........', '..XXXX..', '........'],  // bricks, ball and paddle
    ['.XX..XX.', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '...XX...', '........'],  // a heart (a life)
    ['...XX...', '..XXXX..', '.XXXXXX.', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '...XX...', '........'],  // a gem
  ];
  const TILE_BG = [CORAL, YELLOW, '#34d399', '#7fd4ff', '#ff2e88', '#c9b6ff'];
  const sprite = rows => `<svg class="ig1-px" viewBox="0 0 8 8" shape-rendering="crispEdges">${rows.map((row, y) => [...row].map((c, x) => c === 'X' ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : '').join('')).join('')}</svg>`;
  const JOY = '<svg class="ig1-joy" viewBox="0 0 12 12" shape-rendering="crispEdges"><rect x="5" y="1" width="2" height="2" fill="#ff4d2e"/><rect x="5.5" y="3" width="1" height="4" fill="#eeeae3"/><rect x="2" y="7" width="8" height="3" fill="#eeeae3"/><rect x="3" y="8" width="1" height="1" fill="#ff4d2e"/><rect x="8" y="8" width="1" height="1" fill="#ffc21a"/></svg>';
  const CURSOR = '<svg class="ig1-cur" viewBox="0 0 24 24"><path d="M3 2l15 11-6.5 1.2 3.8 7.3-3 1.5-3.8-7.4L3 20z" fill="#fff" stroke="#0e0e10" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const HIT = 4; // the tile whose «Jugar» gets the click (bottom row, middle)

  recipe('igfirst', (D, T, o) => {
    const { tl } = D;
    const v = D.vertical, dur = o.duration || 6, site = o.site || {}, CLICK = T + (o.click ?? 3.75), DROP = T + (o.drop ?? 4);
    const s = D.scene('igfirst', `<div class="ig1"><div class="ig1-cam">
      <svg class="ig1-main" viewBox="0 0 ${D.W} ${D.H}"><path d="M-40 ${LINE.y(v)}H${D.W + 40}"/></svg>
      <figure class="ig1-win">
        <div class="ig1-bar"><i></i><i></i><i></i><span class="ig1-url"><i class="ig1-caret"></i></span></div>
        <div class="ig1-page">
          <header class="ig1-head"><div class="ig1-logo">${JOY}<b>${[...String(site.logo || '')].map(c => `<span>${esc(c)}</span>`).join('')}</b></div>
            <nav class="ig1-nav">${(site.nav || []).map((n, i) => `<span${i === 1 ? ' class="on"' : ''}>${esc(n)}</span>`).join('')}</nav></header>
          <div class="ig1-tick"><div class="ig1-tick-in">${Array.from({ length: 6 }, () => `<span>★ ${esc(site.ticker || '')}</span>`).join('')}</div></div>
          <div class="ig1-grid">${SPRITES.map((sp, i) => `<div class="ig1-tile${i === HIT ? ' hit' : ''}"><div class="ig1-art" style="background:${TILE_BG[i]}">${sprite(sp)}</div>
            <div class="ig1-foot"><span class="ig1-stars">${'★'.repeat(4 - (i % 2))}${'☆'.repeat(i % 2)}</span><b class="ig1-play">${esc(site.play || '')}</b></div></div>`).join('')}</div>
        </div>
        ${CURSOR}
      </figure>
      <svg class="ig1-burst" viewBox="0 0 ${D.W} ${D.H}"></svg>
      <svg class="ig1-roads" viewBox="0 0 ${D.W} ${D.H}"><path class="ig1-road-glow"/><path class="ig1-road"/></svg>
      <i class="ig1-root"></i>
      <i class="ig1-seed"></i>
    </div>
      <i class="ig1-halo"></i>
      <div class="ig1-txt">
        <div class="ig1-k mono"></div>
        <div class="ig1-a">${(o.lines || []).map(l => `<div>${l}</div>`).join('')}</div>
        <div class="ig1-big">${o.big || ''}</div>
      </div>
      <div class="ig1-after"><div class="ig1-at">${o.after || ''}</div><div class="ig1-as">${esc(o.afterSub)}</div></div>
    </div>`);
    const win = D.$('.ig1-win', s), head = D.$('.ig1-head', s), letters = D.$$('.ig1-logo b span', s), joy = D.$('.ig1-joy', s), navs = D.$$('.ig1-nav span', s);
    const tick = D.$('.ig1-tick', s), tickIn = D.$('.ig1-tick-in', s), tiles = D.$$('.ig1-tile', s), arts = D.$$('.ig1-px', s), cur = D.$('.ig1-cur', s);
    const btn = D.$$('.ig1-play', s)[HIT], hitTile = tiles[HIT], caret = D.$('.ig1-caret', s);
    const k = D.$('.ig1-k', s), a = D.$('.ig1-a', s), big = D.$('.ig1-big', s), txt = D.$('.ig1-txt', s), halo = D.$('.ig1-halo', s);
    const after = D.$('.ig1-after', s), at = D.$('.ig1-at', s), as = D.$('.ig1-as', s), seed = D.$('.ig1-seed', s), main = D.$('.ig1-main path', s);
    D.fit(at, v ? D.W - 140 : 1000);
    // where the click lands, on the stage (measured before any transform is set)
    const bb = D.box(btn), BX = bb.x + bb.w / 2, BY = bb.y + bb.h / 2;
    const wb = D.box(win), cb = { x: BX - wb.x - 8, y: BY - wb.y - 6 };
    // THE path: from the button, down to the main line, then along it to the fronts' origin (a cubic + a line)
    const LY = LINE.y(v), NX = LINE.x(v), turn = Math.min(260, (BX - NX) * 0.3);
    const P0 = [BX, BY], P1 = [BX, BY + (LY - BY) * 0.7], P2 = [BX - turn * 0.25, LY], P3 = [BX - turn, LY];
    const roadD = `M${BX.toFixed(0)} ${BY.toFixed(0)}C${P1[0].toFixed(0)} ${P1[1].toFixed(0)} ${P2[0].toFixed(0)} ${P2[1].toFixed(0)} ${P3[0].toFixed(0)} ${P3[1].toFixed(0)}H${NX}`;
    const cub = t => { const u = 1 - t; return [0, 1].map(k => u * u * u * P0[k] + 3 * u * u * t * P1[k] + 3 * u * t * t * P2[k] + t * t * t * P3[k]); };
    const pts = [...Array.from({ length: 48 }, (_, i) => cub(i / 47)), [NX, LY]], acc = [0];
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const LEN = acc[acc.length - 1];
    const along = fr => { const want = fr * LEN; let i = acc.findIndex(x => x >= want); if (i <= 0) i = 1; const k = (want - acc[i - 1]) / Math.max(1e-6, acc[i] - acc[i - 1]); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]; };
    // the other branches: thin and dim, from the seed (never down the road) and sprouting from the road itself
    const r = rng(17), twigs = [], cols = i => (i % 5 === 1 ? BLUE : i % 5 === 3 ? YELLOW : PAPER);
    const down = Math.atan2(1, 0);
    for (let i = 0; i < 14; i++) {
      let ang = (i / 14) * Math.PI * 2 + (r() - 0.5) * 0.3;
      if (Math.abs(Math.atan2(Math.sin(ang - down), Math.cos(ang - down))) < 0.7) ang += Math.PI; // keep clear of the road
      const L = 240 + r() * 300, bend = (r() - 0.5) * 0.9;
      const x1 = BX + Math.cos(ang) * L * 0.5, y1 = BY + Math.sin(ang) * L * 0.5, x2 = BX + Math.cos(ang + bend * 0.45) * L, y2 = BY + Math.sin(ang + bend * 0.45) * L;
      twigs.push({ d: `M${BX.toFixed(0)} ${BY.toFixed(0)}Q${x1.toFixed(0)} ${y1.toFixed(0)} ${x2.toFixed(0)} ${y2.toFixed(0)}`, c: cols(i), fr: 0 });
    }
    for (let i = 0; i < 9; i++) {
      const fr = 0.18 + (i / 8) * 0.7, [x, y] = along(fr), L = 110 + r() * 170, side = i % 2 ? -1 : 1;
      const x2 = x + side * (40 + r() * 90), y2 = y - L;
      twigs.push({ d: `M${x.toFixed(0)} ${y.toFixed(0)}Q${x.toFixed(0)} ${(y - L * 0.6).toFixed(0)} ${x2.toFixed(0)} ${y2.toFixed(0)}`, c: cols(i + 2), fr });
    }
    const burst = D.$('.ig1-burst', s);
    burst.innerHTML = twigs.map(b => `<path d="${b.d}" style="stroke:${b.c}"/>`).join('');
    const paths = D.$$('path', burst);
    const road = D.$('.ig1-road', s), roadGlow = D.$('.ig1-road-glow', s), root = D.$('.ig1-root', s), cam = D.$('.ig1-cam', s);
    road.setAttribute('d', roadD);
    roadGlow.setAttribute('d', roadD);
    const aw = D.split(a, { type: 'lines', mask: 'lines' }).lines, bw = D.split(big, { type: 'words', mask: 'words' }).words;
    const atw = D.split(at, { type: 'words', mask: 'words' }).words;

    D.show(s, T);
    D.setBg(INK, T);
    D.ink(PAPER, T);
    if (o.label) D.label(T + 0.2, o.label);
    gsap.set([seed, root], { xPercent: -50, yPercent: -50, left: BX, top: BY, scale: 0, opacity: 0 });
    gsap.set(paths, { drawSVG: '0%', opacity: 1 });
    gsap.set([road, roadGlow], { drawSVG: '0%' });
    const f0 = ((NX + 40) / (D.W + 80) * 100).toFixed(2); // the main line runs out both ways from the origin
    gsap.set(main, { drawSVG: `${f0}% ${f0}%` });
    gsap.set([...aw, ...bw, ...atw], { yPercent: 110 });
    gsap.set(after, { autoAlpha: 0 });
    gsap.set(as, { opacity: 0, y: 16 });
    gsap.set(cur, { x: cb.x + (v ? 300 : 360), y: cb.y + 330, opacity: 0 });
    gsap.set(cam, { transformOrigin: `${NX}px ${LY}px` });
    // ── the site builds itself
    D.hit(win, { scale: 0.18, opacity: 0, y: 40 }, { scale: 1, opacity: 1, y: 0, duration: 0.65, ease: 'expo.out' }, T);
    D.sfx('whoosh', T, 0.5, 0.25);
    D.hit(head, { yPercent: -100 }, { yPercent: 0, duration: 0.45, ease: 'expo.out' }, T + 0.35);
    D.hit(joy, { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(3)' }, T + 0.55);
    letters.forEach((l, i) => D.hit(l, { yPercent: -160, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'bounce.out' }, T + 0.6 + i * 0.06));
    navs.forEach((n, i) => D.hit(n, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }, T + 0.9 + i * 0.07));
    D.hit(tick, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'expo.out' }, T + 0.85);
    D.hit(tickIn, { xPercent: 0 }, { xPercent: -20, duration: dur, ease: 'none' }, T + 0.85);
    tiles.forEach((t, i) => {
      const ti = T + 1.1 + i * 0.16;
      D.hit(t, { scale: 0.6, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(2)' }, ti);
      D.hit(arts[i], { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, ti + 0.15);
      D.sfx('tick', ti, 0.035);
    });
    for (let i = 0, on = 1; T + 0.4 + i * 0.5 < CLICK; i++, on ^= 1) tl.set(caret, { opacity: on }, T + 0.4 + i * 0.5);
    // ── the text
    if (o.kicker) tl.to(k, { duration: 0.5, scrambleText: { text: o.kicker, chars: 'upperCase', speed: 1 }, ease: 'none' }, T + 0.3);
    tl.to(aw, { yPercent: 0, duration: 0.7, ease: 'expo.out', stagger: 0.1 }, T + 0.45);
    tl.to(bw, { yPercent: 0, duration: 0.7, ease: 'expo.out', stagger: 0.07 }, T + 1.3);
    // ── the cursor comes in and clicks «Jugar» on the last 16th before the drop
    D.hit(cur, { opacity: 0 }, { opacity: 1, duration: 0.2 }, T + 2.3);
    tl.to(cur, { keyframes: [{ x: cb.x + 120, y: cb.y + 90, duration: 0.6, ease: 'power2.inOut' }, { x: cb.x, y: cb.y, duration: 0.55, ease: 'power3.out' }] }, T + 2.35);
    D.hit(hitTile, { y: 0 }, { y: -8, duration: 0.25, ease: 'power2.out' }, CLICK - 0.3);
    D.hit(btn, { backgroundColor: CORAL }, { backgroundColor: YELLOW, color: INK, duration: 0.15 }, CLICK - 0.25);
    tl.to(cur, { scale: 0.82, duration: 0.06, ease: 'power2.in' }, CLICK);
    tl.to(cur, { scale: 1, duration: 0.15, ease: 'power2.out' }, CLICK + 0.06);
    D.hit(btn, { scale: 1 }, { keyframes: [{ scale: 0.88, duration: 0.06 }, { scale: 1.06, duration: 0.12 }] }, CLICK);
    D.sfx('key', CLICK, 0.4);
    // ── the drop: the click becomes the seed, and ONE path grows out of it — first, alone, bright
    D.flash(DROP, 0.3, 0.4, CORAL);
    D.hit(root, { scale: 0, opacity: 1 }, { scale: 1, duration: 0.45, ease: 'expo.out' }, DROP - 0.05);
    D.hit(seed, { scale: 0, opacity: 1, left: BX, top: BY }, { scale: 1, duration: 0.35, ease: 'expo.out' }, DROP - 0.05);
    tl.to(win, { opacity: 0.16, scale: 0.97, duration: 0.5, ease: 'power2.out' }, DROP);
    tl.to(cur, { opacity: 0, duration: 0.2 }, DROP);
    const GROW = 1.0, ease = 'power1.inOut', ride = { p: 0 };
    tl.to([road, roadGlow], { drawSVG: '100%', duration: GROW, ease }, DROP);
    // a light rides the tip (seekable: its place is a function of the tween's progress)
    D.hit(ride, { p: 0 }, { p: 1, duration: GROW, ease, onUpdate: () => { const [x, y] = along(ride.p); seed.style.left = x.toFixed(1) + 'px'; seed.style.top = y.toFixed(1) + 'px'; } }, DROP);
    tl.to(seed, { scale: 0.62, duration: 0.3, ease: 'power2.out' }, DROP + GROW - 0.15);
    // the camera leans after the tip, then settles where the next scene starts
    D.hit(cam, { x: 0, scale: 1.05 }, { keyframes: [{ x: Math.min(90, (BX - NX) * 0.08), duration: GROW * 0.75, ease: 'sine.out' }, { x: 0, duration: 0.5, ease: 'power2.inOut' }] }, DROP);
    tl.to(cam, { scale: 1, duration: GROW + 0.4, ease: 'power2.inOut' }, DROP);
    D.sfx('whoosh', DROP, 0.6, 0.35);
    // only then the other branches: thin, dim, short-lived
    tl.to(paths, { drawSVG: '100%', duration: 0.45, ease: 'expo.out', stagger: { each: 0.02, from: 'random' } }, DROP + 0.35);
    tl.to(paths, { opacity: 0, duration: 0.35, ease: 'power2.in', stagger: { each: 0.01, from: 'random' } }, DROP + 0.85);
    // the old lines leave; «…que me cambió la vida.» rises in their place
    tl.to(txt, { y: -40, opacity: 0, duration: 0.3, ease: 'power2.in' }, DROP - 0.05);
    D.hit(halo, { opacity: 0 }, { opacity: 1, duration: 0.4 }, DROP);
    D.show(after, DROP + 0.05);
    tl.to(atw, { yPercent: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06 }, DROP + 0.1);
    tl.to(as, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, DROP + 0.55);
    // ── the road ahead: the main line runs on from where the path arrived; the rest leaves
    const out = T + dur - 1.05;
    tl.to(win, { opacity: 0, duration: 0.4, ease: 'power2.in' }, out);
    tl.to(root, { opacity: 0, duration: 0.4, ease: 'power2.in' }, out);
    tl.to([after, halo], { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' }, out + 0.3);
    tl.to(main, { drawSVG: '0% 100%', duration: 0.65, ease: 'expo.inOut' }, out + 0.1);
    tl.to(roadGlow, { opacity: 0, duration: 0.5 }, out + 0.2);
    D.sfx('whoosh', out + 0.2, 0.4, 0.22);
    D.hide(s, T + dur);
    (D.cfg.warmAt ||= []).push(T + 2.2, DROP + 0.5, DROP + 1.1);
    return dur;
  });
})();
