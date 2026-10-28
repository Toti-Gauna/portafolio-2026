/* ============================================================================
   IG FRONTS — the work fronts of "Conocer a Ignacio" as a git graph (css/ig-fronts.css). Load after ig-open.js.

   igfronts  One main line (Trailer.igLine: the one igfirst leaves on the stage). The camera travels along it;
             at each stop a branch forks off, climbs into the stop's text (dates · place, the challenge, one
             line) and a small animated scene of that front plays beside it — drawn in SVG/HTML, never a
             screenshot. Several igfronts scenes can follow each other (another scene in between).
             { origin: { year, color }, stops: [{ year, label, color, vis, k, t, d, v }], at: [s], duration }
     vis  tach    three panels assemble: the back office, the landing page and the wallet app on a phone
          class   a classroom: the board types «Hola, mundo», students with laptops, mini projects pop up,
                  notes are taken
          tuenti  the roulette spins, referrals connect (+1), then a dashboard draws itself: recurrence,
                  referrals, gamification — an illustration with fictional data, tagged as such
          events  an events micro-app (generic, no client brand): the pass is confirmed, the creator's steps
          team    colleagues on columns that rise together on the beat, the trainer beside them
     v    the strings each scene shows (same keys in es / en)

   Every scene is designed in a 900×720 box. 16:9: the text on the left, the scene on the right, the line low.
   9:16 (D.vertical): the text on top, the scene under it (scaled to the room left above the line).
   ========================================================================== */
(() => {
  'use strict';
  const { recipe } = Trailer;
  const INK = '#0e0e10', PAPER = '#eeeae3', CORAL = '#ff4d2e', BLUE = '#2b50ff', YELLOW = '#ffc21a', GREEN = '#34d399', ICE = '#7fd4ff';
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const LINE = Trailer.igLine;
  const BEAT = 0.5;
  const onBeat = t => Math.ceil(t / BEAT - 1e-6) * BEAT; // the first beat at or after t
  const q = (el, s) => el.querySelector(s), qa = (el, s) => Array.from(el.querySelectorAll(s));
  /** a from → to whose from-state holds from the scene's start (so a tween that starts late never shows its end) */
  const enter = (D, T0, el, from, to, at) => { D.tl.set(el, from, T0); D.tl.to(el, to, at); };
  /** a typed line: clip-path stepped one character at a time */
  const type = (D, T0, el, at, cps = 34) => { const n = el.textContent.length; enter(D, T0, el, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: n / cps, ease: `steps(${n})` }, at); return at + n / cps; };
  /** a person seen from behind or in front: head + shoulders (centre x, head y, size, body colour) */
  const person = (x, y, r, fill, cls = '') => `<g class="${cls}"><g class="fp" transform="translate(${x} ${y})"><path d="M${-r * 1.9} ${r * 4.4}C${-r * 1.9} ${r * 1.9} ${-r * 1.1} ${r * 1.3} 0 ${r * 1.3}S${r * 1.9} ${r * 1.9} ${r * 1.9} ${r * 4.4}Z" fill="${fill}"/><circle r="${r}" fill="${INK}"/></g></g>`;
  const check = 'M-9 0l6 6 12-13';

  // ================================================================== THE SCENES (900×720 each)
  const VIS = {
    // TACH — the back office, the landing page and the app, assembling into one product
    tach(v) {
      const rows = [['#34d399', 1], [YELLOW, 0.7], ['#34d399', 0.85], ['#34d399', 0.6]];
      return `<div class="fv-tach">
        <div class="ft-bo ft-panel"><div class="ft-bar"><i></i><i></i><i></i></div>
          <div class="ft-side">${[0, 1, 2, 3, 4].map(i => `<i${i === 0 ? ' class="on"' : ''}></i>`).join('')}</div>
          <div class="ft-main"><div class="ft-h"><b></b><span></span></div>
            <div class="ft-kpis">${[0, 1, 2].map(i => `<div><i></i><b style="width:${[70, 54, 82][i]}%"></b></div>`).join('')}</div>
            ${rows.map(([c, w]) => `<div class="ft-row"><i class="ft-av"></i><b style="width:${Math.round(150 * w)}px"></b><span style="background:${c}"></span><em></em></div>`).join('')}</div>
          <span class="ft-tag mono">${esc(v.tags[0])}</span></div>
        <div class="ft-land ft-panel"><div class="ft-bar"><i></i><i></i><i></i></div>
          <div class="ft-hero"><b></b><b></b><s></s><span class="ft-cta"></span><span class="ft-cta2"></span></div>
          <div class="ft-mini"><i></i></div>
          <span class="ft-tag mono">${esc(v.tags[1])}</span></div>
        <div class="ft-app"><div class="ft-scr">
            <div class="ft-card"><small>${esc(v.balance)}</small><strong>$ ••••••</strong>
              <div class="ft-btns"><span class="ft-send">${esc(v.send)}</span><span>${esc(v.receive)}</span></div></div>
            ${[0, 1, 2, 3].map(() => '<div class="ft-li"><i></i><b></b><em></em></div>').join('')}
            <div class="ft-ok"><svg viewBox="-16 -16 32 32"><circle r="15"/><path d="${check}"/></svg></div>
            <div class="ft-nav">${[0, 1, 2, 3].map(i => `<i${i === 0 ? ' class="on"' : ''}></i>`).join('')}</div></div>
          <span class="ft-tag mono">${esc(v.tags[2])}</span></div>
      </div>`;
    },
    // Ada ITW — the board, the teacher, students with laptops, mini projects and notes
    class(v) {
      return `<div class="fv-class">
        <svg class="fc-svg" viewBox="0 0 900 720">
          <g class="fc-me">
            <rect x="672" y="404" width="30" height="190" rx="15" fill="${INK}"/><rect x="722" y="404" width="30" height="190" rx="15" fill="${INK}"/>
            <path d="M650 236C650 206 676 196 712 196S774 206 774 236L768 420H656Z" fill="${CORAL}"/>
            <path d="M770 238C792 290 792 330 784 380" stroke="${INK}" stroke-width="22" stroke-linecap="round" fill="none"/>
            <g class="fc-arm"><path d="M660 240C628 220 606 196 590 168" stroke="${INK}" stroke-width="22" stroke-linecap="round" fill="none"/>
              <rect x="572" y="132" width="14" height="44" rx="4" transform="rotate(-32 579 154)" fill="${YELLOW}" stroke="${INK}" stroke-width="3"/></g>
            <circle cx="712" cy="150" r="44" fill="${INK}"/>
          </g>
          <line class="fc-desk" x1="0" y1="640" x2="900" y2="640"/>
          ${person(140, 520, 36, BLUE, 'fc-st')}${person(430, 528, 34, YELLOW, 'fc-st')}
          <g class="fc-book" transform="translate(690 588) rotate(-6)"><rect width="190" height="124" rx="8" fill="#fff" stroke="${INK}" stroke-width="4"/>
            <path d="M95 4V120" stroke="${INK}" stroke-width="2" opacity=".35"/>
            ${[0, 1, 2, 3].map(i => `<path class="fc-note" d="M${i < 2 ? 14 : 108} ${34 + (i % 2) * 30}h${i % 2 ? 54 : 70}" stroke="${BLUE}" stroke-width="5" stroke-linecap="round"/>`).join('')}
            <g class="fc-pen"><rect x="-6" y="-60" width="12" height="62" rx="3" fill="${YELLOW}" stroke="${INK}" stroke-width="3" transform="rotate(28)"/></g></g>
        </svg>
        <div class="fc-board"><pre>${v.code.map(l => `<div class="fc-ln">${l}</div>`).join('')}</pre></div>
        ${[190, 482].map((x, i) => `<div class="fc-lap" style="left:${x}px"><div class="fc-scr"><span>${esc(v.out)}</span></div><i></i></div>`).join('')}
        <div class="fc-proj fc-p1"><div class="fc-pb"><i></i><i></i><i></i></div><b>${esc(v.out)}</b><span>${esc(v.click)}</span></div>
        <div class="fc-proj fc-p2"><div class="fc-pb"><i></i><i></i><i></i></div>${v.todo.map(x => `<div class="fc-todo"><svg viewBox="-14 -14 28 28"><rect x="-12" y="-12" width="24" height="24" rx="6"/><path d="M-6 0l4 4 8-9"/></svg>${esc(x)}</div>`).join('')}</div>
      </div>`;
    },
    // Tuenti — the roulette, the referral loop and the dashboard that measures them (illustration, fictional data)
    tuenti(v) {
      const C = [CORAL, PAPER, BLUE, '#1d1d23', CORAL, PAPER, BLUE, '#1d1d23'], R = 172;
      const seg = C.map((c, i) => {
        const a0 = (i / 8) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / 8) * Math.PI * 2 - Math.PI / 2;
        return `<path d="M0 0L${(Math.cos(a0) * R).toFixed(1)} ${(Math.sin(a0) * R).toFixed(1)}A${R} ${R} 0 0 1 ${(Math.cos(a1) * R).toFixed(1)} ${(Math.sin(a1) * R).toFixed(1)}Z" fill="${c}"/>`;
      }).join('');
      const pegs = C.map((_, i) => { const a = (i / 8) * Math.PI * 2 - Math.PI / 2; return `<circle cx="${(Math.cos(a) * (R + 14)).toFixed(1)}" cy="${(Math.sin(a) * (R + 14)).toFixed(1)}" r="6" fill="${INK}"/>`; }).join('');
      const P = [[300, 54], [336, 140], [292, 220]];
      const bars = [34, 52, 44, 70, 86, 104];
      return `<div class="fv-tuenti">
        <svg class="fu-wheel" viewBox="-210 -232 420 440"><g class="fu-rot">${seg}<circle r="${R}" fill="none" stroke="${INK}" stroke-width="8"/>${pegs}</g>
          <circle r="44" fill="${INK}" stroke="${PAPER}" stroke-width="5"/><path d="M-14 0l9 9 19-21" fill="none" stroke="${CORAL}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
          <path class="fu-ptr" d="M0 -176l-24 -46h48z" fill="${INK}"/></svg>
        <svg class="fu-ref" viewBox="0 0 420 270">
          ${P.map(([x, y]) => `<path class="fu-link" d="M108 140C200 140 ${x - 90} ${y} ${x - 30} ${y}"/>`).join('')}
          ${person(76, 104, 22, CORAL, 'fu-me')}
          ${P.map(([x, y]) => `<g class="fu-p">${person(x, y - 30, 17, BLUE)}<g class="fu-plus" transform="translate(${x + 60} ${y - 40})"><rect x="-28" y="-18" width="56" height="36" rx="18" fill="${YELLOW}" stroke="${INK}" stroke-width="3"/><text y="9">${esc(v.plus)}</text></g></g>`).join('')}
        </svg>
        <div class="fu-dash">
          <div class="fu-w fu-w1"><span class="mono">${esc(v.rec)}</span>
            <svg viewBox="0 0 392 150"><path class="fu-gl" d="M0 140H392M0 95H392M0 50H392"/><path class="fu-area" d="M0 128C50 122 70 106 112 100S190 82 232 70 330 44 392 34V150H0Z"/><path class="fu-line" d="M0 128C50 122 70 106 112 100S190 82 232 70 330 44 392 34"/></svg></div>
          <div class="fu-row">
            <div class="fu-w fu-w2"><span class="mono">${esc(v.ref)}</span><svg viewBox="0 0 190 130">${bars.map((h, i) => `<rect class="fu-bar" x="${i * 31 + 4}" y="${126 - h}" width="22" height="${h}" rx="4"/>`).join('')}</svg></div>
            <div class="fu-w fu-w3"><span class="mono">${esc(v.game)}</span><svg viewBox="-60 -60 120 120"><circle r="44" class="fu-ring"/><circle r="44" class="fu-don" transform="rotate(-90)"/><path class="fu-star" d="M0 -16l4.7 9.6 10.6 1.5-7.7 7.5 1.8 10.6L0 8.2l-9.4 5 1.8-10.6-7.7-7.5 10.6-1.5z"/></svg></div>
          </div>
        </div>
        <span class="fu-tag mono">${String(v.tag).split(' · ').map(esc).join('<br>')}</span>
      </div>`;
    },
    // Supernova Eventos — an events micro-app, generic: the pass gets confirmed; the creator's steps
    events(v) {
      // a QR of its own (21×21, the three finder squares, a seeded fill): no data in it
      const r = rng(5), N = 21, inF = (x, y) => [[0, 0], [N - 7, 0], [0, N - 7]].find(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
      const qr = Array.from({ length: N * N }, (_, i) => { const x = i % N, y = Math.floor(i / N), f = inF(x, y);
        let on;
        if (f) { const dx = x - f[0], dy = y - f[1]; on = dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4); }
        else on = !(x < 8 && y < 8) && !(x > N - 9 && y < 8) && !(x < 8 && y > N - 9) && r() > 0.5;
        return on ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : ''; }).join('');
      return `<div class="fv-events">
        <div class="fe-phone"><div class="fe-scr">
          <div class="fe-top"><b>${esc(v.app)}</b><i></i></div>
          <div class="fe-card"><div class="fe-img"><i class="fe-sun"></i><i class="fe-hill"></i><i class="fe-hill2"></i></div>
            <span class="fe-cat">${esc(v.cat)}</span><b class="fe-t">${esc(v.title)}</b><span class="fe-dt mono">${esc(v.date)}</span>
            <span class="fe-cta">${esc(v.cta)}</span></div>
          <div class="fe-pass"><div class="fe-ok"><svg viewBox="-16 -16 32 32"><circle r="15"/><path d="${check}"/></svg>${esc(v.ok)}</div>
            <b>${esc(v.title)}</b><svg class="fe-qr" viewBox="-1 -1 ${N + 2} ${N + 2}" shape-rendering="crispEdges"><rect x="-1" y="-1" width="${N + 2}" height="${N + 2}" style="fill:#fff"/>${qr}</svg><i class="fe-tear"></i></div>
        </div></div>
        <div class="fe-admin"><div class="ft-bar"><i></i><i></i><i></i></div>
          <div class="fe-steps">${v.steps.map((s, i) => `<div class="fe-st"><span class="fe-dot"><em>${i + 1}</em><svg viewBox="-16 -16 32 32"><path d="${check}"/></svg></span><b>${esc(s)}</b></div>`).join('')}</div>
          <div class="fe-cal">${Array.from({ length: 28 }, (_, i) => `<i${[3, 9, 12, 18, 24].includes(i) ? ' class="ev"' : ''}></i>`).join('')}</div></div>
        <span class="fe-tag mono">${String(v.tag).split(' · ').map(esc).join('<br>')}</span>
      </div>`;
    },
    // training colleagues — five of them on columns that rise together; the trainer beside them
    team(v) {
      const X = [300, 425, 550, 675, 800], C = [BLUE, YELLOW, GREEN, ICE, '#ff9f87'];
      return `<div class="fv-team"><svg class="fm-svg" viewBox="0 0 900 720">
        <path class="fm-lvl" d="M240 0H880"/>
        <text class="fm-lab" x="880" y="-16" text-anchor="end">${esc(v.level)}</text>
        <defs><clipPath id="fm-ground"><rect width="900" height="676"/></clipPath></defs>
        <g clip-path="url(#fm-ground)">${X.map((x, i) => `<g class="fm-col"><rect x="${x - 46}" y="356" width="92" height="440" rx="10" fill="${INK}"/><rect x="${x - 46}" y="356" width="92" height="22" rx="10" fill="${C[i]}"/></g>`).join('')}</g>
        ${X.map((x, i) => `<g class="fm-who" data-x="${x}">${person(x, 230, 30, C[i])}</g>`).join('')}
        <line x1="0" y1="676" x2="900" y2="676" stroke="${INK}" stroke-width="4"/>
        <g class="fm-me"><rect x="78" y="560" width="26" height="116" rx="13" fill="${INK}"/><rect x="118" y="560" width="26" height="116" rx="13" fill="${INK}"/>
          <path d="M60 430C60 404 84 396 111 396S162 404 162 430L156 572H66Z" fill="${CORAL}"/>
          <g class="fm-arm"><path d="M156 432C186 404 204 372 214 338" stroke="${INK}" stroke-width="20" stroke-linecap="round" fill="none"/></g>
          <circle cx="111" cy="356" r="36" fill="${INK}"/></g>
      </svg></div>`;
    },
  };

  // ================================================================== THEIR MOTION
  // PLAY[vis](D, el, t, T0): from t on (T0 = the scene's start, where from-states are set)
  const PLAY = {
    tach(D, el, t, T0) {
      const bo = q(el, '.ft-bo'), land = q(el, '.ft-land'), app = q(el, '.ft-app');
      enter(D, T0, bo, { x: -140, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, t);
      enter(D, T0, land, { y: 160, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, t + 0.3);
      enter(D, T0, app, { x: 170, y: 30, rotation: 8, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, t + 0.55);
      enter(D, T0, qa(el, '.ft-kpis b, .ft-row b, .ft-row em, .ft-h b'), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'expo.out', stagger: 0.05 }, t + 0.3);
      enter(D, T0, qa(el, '.ft-row span, .ft-av'), { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(3)', stagger: 0.05 }, t + 0.6);
      enter(D, T0, qa(el, '.ft-hero b, .ft-hero s'), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'expo.out', stagger: 0.08 }, t + 0.6);
      enter(D, T0, qa(el, '.ft-cta, .ft-cta2, .ft-mini'), { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.5)', stagger: 0.08 }, t + 0.85);
      enter(D, T0, q(el, '.ft-card'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, t + 0.85);
      enter(D, T0, qa(el, '.ft-li'), { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.07 }, t + 1.0);
      // a transfer: «Enviar» is pressed, the check pops
      const press = onBeat(t + 1.5);
      D.hit(q(el, '.ft-send'), { scale: 1 }, { keyframes: [{ scale: 0.88, duration: 0.08 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' }] }, press);
      enter(D, T0, q(el, '.ft-ok'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(3)' }, press + 0.18);
      D.sfx('beep', press + 0.18, 1320, 0.08, 0.035);
      // the three tags, one per beat: back office · landing · app
      qa(el, '.ft-tag').forEach((tg, i) => { const b = onBeat(t + 2) + i * BEAT; enter(D, T0, tg, { scale: 0.4, opacity: 0, rotation: -6 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.4, ease: 'back.out(3)' }, b); D.sfx('tick', b, 0.05); });
    },
    class(D, el, t, T0) {
      const board = q(el, '.fc-board'), me = q(el, '.fc-me'), arm = q(el, '.fc-arm'), sts = qa(el, '.fc-st'), laps = qa(el, '.fc-lap');
      enter(D, T0, board, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'expo.out' }, t);
      enter(D, T0, me, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, t + 0.1);
      gsap.set(arm, { svgOrigin: '660 240' });
      enter(D, T0, arm, { rotation: -70 }, { rotation: 0, duration: 0.6, ease: 'back.out(2)' }, t + 0.35);
      // the board types; the output line lands last
      let k = t + 0.45;
      qa(el, '.fc-ln').forEach((ln, i) => { k = type(D, T0, ln, k, 40) + 0.12; D.sfx('key', k - 0.3, 0.12); if (i === 1) k += 0.1; });
      // the students sit down with their laptops
      sts.forEach((p, i) => enter(D, T0, p, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, t + 0.35 + i * 0.12));
      laps.forEach((l, i) => enter(D, T0, l, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }, t + 0.5 + i * 0.12));
      // «Hola, mundo» on every screen, then their mini projects pop up
      const hw = onBeat(k - 0.1);
      qa(el, '.fc-scr span').forEach((sp, i) => { type(D, T0, sp, hw + i * 0.15, 30); });
      D.sfx('beep', hw, 1046, 0.1, 0.035);
      qa(el, '.fc-proj').forEach((p, i) => enter(D, T0, p, { y: 80, scale: 0.6, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, hw + 0.4 + i * BEAT));
      enter(D, T0, qa(el, '.fc-todo path'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.25, ease: 'power2.out', stagger: 0.2 }, hw + 1.2);
      D.hit(q(el, '.fc-p1 span'), { scale: 1 }, { keyframes: [{ scale: 0.86, duration: 0.08 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' }] }, hw + 1.3);
      // and the notes, written while the class goes on
      const notes = qa(el, '.fc-note'), pen = q(el, '.fc-pen');
      enter(D, T0, notes, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.5, ease: 'none', stagger: 0.6 }, t + 0.9);
      const P = [[14, 34], [14, 64], [108, 34], [108, 64]], W = [70, 54, 70, 54];
      D.tl.set(pen, { x: P[0][0], y: P[0][1] }, T0);
      P.forEach(([x, y], i) => { D.tl.set(pen, { x, y }, t + 0.9 + i * 0.6); D.tl.to(pen, { x: x + W[i], duration: 0.5, ease: 'none' }, t + 0.9 + i * 0.6); });
    },
    tuenti(D, el, t, T0) {
      const w = q(el, '.fu-wheel'), rot = q(el, '.fu-rot'), ptr = q(el, '.fu-ptr');
      enter(D, T0, w, { scale: 0.7, rotation: -40, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, t);
      gsap.set(rot, { svgOrigin: '0 0' });
      gsap.set(ptr, { svgOrigin: '0 -200' });
      const spin = 1.9, total = 1080 + 22.5;
      enter(D, T0, rot, { rotation: 0 }, { rotation: total, duration: spin, ease: 'power3.out' }, t + 0.1);
      // the pointer flicks on the pegs it passes (times from the ease, exact on every replay)
      const ease = gsap.parseEase('power3.out');
      let last = -1;
      for (let m = 1; m * 45 <= total; m++) {
        let lo = 0, hi = 1; for (let it = 0; it < 26; it++) { const mid = (lo + hi) / 2; if (ease(mid) < m * 45 / total) lo = mid; else hi = mid; }
        const tt = t + 0.1 + hi * spin;
        if (tt - last < 0.07) continue;
        last = tt;
        D.tl.to(ptr, { rotation: -14, duration: 0.03, ease: 'none' }, tt);
        D.tl.to(ptr, { rotation: 0, duration: 0.09, ease: 'power2.out' }, tt + 0.03);
        D.sfx('tick', tt, 0.03 + 0.04 * hi);
      }
      // the referrals connect: one invite, three that join (+1 each)
      enter(D, T0, q(el, '.fu-me'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, t + 0.8);
      qa(el, '.fu-link').forEach((l, i) => enter(D, T0, l, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.35, ease: 'power2.out' }, t + 1.0 + i * 0.25));
      qa(el, '.fu-p').forEach((p, i) => {
        enter(D, T0, p.firstElementChild, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'back.out(2)' }, t + 1.25 + i * 0.25);
        enter(D, T0, q(p, '.fu-plus'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, t + 1.4 + i * 0.25);
      });
      // then the dashboard draws itself
      const dash = q(el, '.fu-dash'), d0 = onBeat(t + 2.1);
      enter(D, T0, dash, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'expo.out' }, d0);
      D.sfx('whoosh', d0, 0.4, 0.2);
      enter(D, T0, q(el, '.fu-line'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.9, ease: 'power2.inOut' }, d0 + 0.3);
      enter(D, T0, q(el, '.fu-area'), { opacity: 0 }, { opacity: 1, duration: 0.6 }, d0 + 0.8);
      enter(D, T0, qa(el, '.fu-bar'), { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.45, ease: 'back.out(1.6)', stagger: 0.08 }, d0 + 0.5);
      enter(D, T0, q(el, '.fu-don'), { drawSVG: '0%' }, { drawSVG: '72%', duration: 0.9, ease: 'power2.inOut' }, d0 + 0.7);
      enter(D, T0, q(el, '.fu-star'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, d0 + 1.4);
      enter(D, T0, q(el, '.fu-tag'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, d0 + 0.6);
    },
    events(D, el, t, T0) {
      enter(D, T0, q(el, '.fe-phone'), { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, t);
      enter(D, T0, q(el, '.fe-card'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, t + 0.2);
      enter(D, T0, q(el, '.fe-admin'), { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'expo.out' }, t + 0.25);
      enter(D, T0, qa(el, '.fe-cal i'), { scale: 0 }, { scale: 1, duration: 0.25, ease: 'back.out(2)', stagger: 0.012 }, t + 0.45);
      const press = onBeat(t + 0.75);
      D.hit(q(el, '.fe-cta'), { scale: 1 }, { keyframes: [{ scale: 0.9, duration: 0.08 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' }] }, press);
      D.sfx('key', press, 0.3);
      enter(D, T0, q(el, '.fe-pass'), { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: 'expo.out' }, press + 0.12);
      enter(D, T0, q(el, '.fe-qr'), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.4, ease: 'steps(21)' }, press + 0.45);
      enter(D, T0, q(el, '.fe-ok svg path'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.3, ease: 'power2.out' }, press + 0.4);
      D.sfx('beep', press + 0.45, 1320, 0.08, 0.035);
      qa(el, '.fe-st').forEach((st, i) => {
        enter(D, T0, q(st, '.fe-dot'), { backgroundColor: 'rgba(255,46,136,0)' }, { backgroundColor: '#ff2e88', duration: 0.2 }, t + 0.6 + i * 0.25);
        enter(D, T0, q(st, 'em'), { opacity: 1 }, { opacity: 0, duration: 0.1 }, t + 0.6 + i * 0.25);
        enter(D, T0, q(st, 'path'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.25 }, t + 0.65 + i * 0.25);
      });
      enter(D, T0, qa(el, '.fe-cal .ev'), { backgroundColor: 'rgba(255,46,136,0)' }, { backgroundColor: '#ff2e88', duration: 0.2, stagger: 0.12 }, t + 0.9);
      enter(D, T0, q(el, '.fe-tag'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, t + 1.1);
    },
    team(D, el, t, T0) {
      const who = qa(el, '.fm-who'), cols = qa(el, '.fm-col'), me = q(el, '.fm-me'), arm = q(el, '.fm-arm'), lvl = qa(el, '.fm-lvl, .fm-lab');
      const Y0 = 280, LV = 452, STEP = [0, 100, 200, 300]; // columns start 280 px down (40 px showing); each beat lifts them 100 px
      D.tl.set(cols, { y: Y0, opacity: 0 }, T0);
      D.tl.to(cols, { opacity: 1, duration: 0.3, stagger: 0.06 }, t);
      who.forEach((w, i) => enter(D, T0, w, { y: Y0 + 50, opacity: 0 }, { y: Y0, opacity: 1, duration: 0.45, ease: 'back.out(2)' }, t + i * 0.06));
      enter(D, T0, me, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, t);
      gsap.set(arm, { svgOrigin: '156 432' });
      enter(D, T0, arm, { rotation: 50 }, { rotation: 22, duration: 0.45, ease: 'power2.out' }, t + 0.2);
      enter(D, T0, lvl, { y: LV, opacity: 0 }, { y: LV, opacity: 1, duration: 0.3 }, t + 0.3);
      enter(D, T0, lvl[0], { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.5, ease: 'power2.out' }, t + 0.3);
      // three beats: the whole team rises together, the level line with it
      const b0 = onBeat(t + 0.6);
      [1, 2, 3].forEach((k, j) => {
        const b = b0 + j * BEAT;
        D.tl.to([...cols, ...who], { y: Y0 - STEP[k], duration: 0.42, ease: 'back.out(1.8)' }, b);
        D.tl.to(lvl, { y: LV - STEP[k], duration: 0.42, ease: 'back.out(1.8)' }, b);
        D.tl.to(arm, { rotation: 22 - k * 14, duration: 0.3, ease: 'power2.out' }, b);
        D.sfx('tick', b, 0.05);
      });
      const top = b0 + 2 * BEAT + 0.25, heads = who.map(w => w.querySelector('.fp'));
      enter(D, T0, lvl[0], { stroke: INK }, { stroke: CORAL, duration: 0.2 }, top - 0.05);
      gsap.set(heads, { transformOrigin: '50% 100%' });
      D.hit(heads, { scale: 1 }, { keyframes: [{ scale: 1.1, duration: 0.12 }, { scale: 1, duration: 0.3, ease: 'power2.out' }], stagger: 0.04 }, top);
      D.sfx('beep', top, 1046, 0.1, 0.035);
    },
  };

  // ================================================================== IGFRONTS
  recipe('igfronts', (D, T, o) => {
    const { tl } = D;
    const v = D.vertical, SW = D.W, SH = D.H, LY = LINE.y(v), NX = LINE.x(v);
    const stops = o.stops || [], n = stops.length, dur = o.duration || 6 * n, at = o.at || stops.map((_, i) => i * (dur / n));
    const TX = v ? 140 : 230, TY = v ? 186 : 214, BY = TY + 26, TW = SW * (n + 1);
    const X = i => SW * i; // stop i ≥ 1 sits at X(i); X(0) is where the scene starts (origin)
    const origin = o.origin || {};
    const s = D.scene('igfronts', `<div class="igf"><div class="igf-track" style="width:${TW}px;height:${SH}px">
      <svg class="igf-g" viewBox="0 0 ${TW} ${SH}" width="${TW}" height="${SH}">
        <path class="igf-main" d="M-40 ${LY}H${TW + 40}"/>
        ${stops.map((st, i) => { const x = X(i + 1) + NX; return `<path class="igf-br" d="M${x} ${LY}V${BY + 40}Q${x} ${BY} ${x + 40} ${BY}H${X(i + 1) + TX - 26}" style="stroke:${st.color}"/>`; }).join('')}
        <circle class="igf-n" cx="${NX}" cy="${LY}" r="15" style="fill:${origin.color || INK}"/>
        ${stops.map((st, i) => `<circle class="igf-n" cx="${X(i + 1) + NX}" cy="${LY}" r="15" style="fill:${st.color}"/>`).join('')}
      </svg>
      <div class="igf-yr mono" style="left:${NX}px;top:${LY + 36}px">${esc(origin.year)}</div>
      ${stops.map((st, i) => `<div class="igf-yr mono" style="left:${X(i + 1) + NX}px;top:${LY + 36}px">${esc(st.year)}</div>`).join('')}
      ${stops.map((st, i) => `<article class="igf-txt" style="left:${X(i + 1) + TX}px;top:${TY}px;--c:${st.color}">
          <div class="igf-k mono"></div><h3 class="igf-t">${st.t}</h3><p class="igf-d">${esc(st.d)}</p></article>
        <div class="igf-vis igf-vis--${st.vis}">${VIS[st.vis](st.v || {})}</div>`).join('')}
    </div></div>`);
    const track = D.$('.igf-track', s), main = D.$('.igf-main', s), brs = D.$$('.igf-br', s), nodes = D.$$('.igf-n', s), yrs = D.$$('.igf-yr', s);
    const txts = D.$$('.igf-txt', s), vis = D.$$('.igf-vis', s);
    // the scene's box: 16:9 right of the text; 9:16 under the text, scaled into the room above the line
    vis.forEach((el, i) => {
      let x, y, k;
      if (v) {
        const h = txts[i].offsetHeight, top = TY + h + 56, room = LY - 96 - top;
        k = Math.min((SW - 100) / 900, room / 720);
        x = X(i + 1) + (SW - 900 * k) / 2; y = top + (room - 720 * k) / 2;
      } else { k = 1; x = X(i + 1) + 950; y = 150; }
      gsap.set(el, { left: x, top: y, scale: k, transformOrigin: '0 0' });
    });
    D.show(s, T);
    if (o.wipe !== false) D.wipeTo(o.bg || PAPER, T, 'up', 0.45); else D.setBg(o.bg || PAPER, T);
    D.ink(INK, T);
    if (o.label) D.label(T, o.label);
    const frac = x => Math.min(100, ((x + 40) / (TW + 80)) * 100);
    gsap.set(main, { drawSVG: `0% ${frac(SW)}%` });
    gsap.set(brs, { drawSVG: '0%' });
    gsap.set(nodes.slice(1), { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(nodes[0], { transformOrigin: '50% 50%' });
    gsap.set(yrs, { opacity: 0, y: 14, xPercent: v ? 0 : -50, x: v ? -15 : 0 });
    gsap.set(track, { x: 0 });
    D.hit(nodes[0], { scale: 0.6 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, T);
    tl.to(yrs[0], { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, T + 0.05);

    stops.forEach((st, i) => {
      const t = T + at[i], next = i + 1 < n ? T + at[i + 1] : T + dur;
      const tx = txts[i], k = D.$('.igf-k', tx), title = D.$('.igf-t', tx), desc = D.$('.igf-d', tx);
      tl.to(track, { x: -X(i + 1), duration: 0.9, ease: 'expo.inOut' }, t);
      tl.to(main, { drawSVG: `0% ${frac(X(i + 1) + SW)}%`, duration: 1.1, ease: 'power2.inOut' }, t);
      D.sfx('whoosh', t, 0.5, 0.22);
      D.hit(nodes[i + 1], { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, t + 0.55);
      D.sfx('tick', t + 0.55, 0.05);
      tl.to(yrs[i + 1], { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, t + 0.6);
      tl.to(brs[i], { drawSVG: '100%', duration: 0.55, ease: 'power2.inOut' }, t + 0.6);
      // the text: where and when (scrambles), the challenge (rises), one line (fades up)
      const tw = D.split(title, { type: 'words', mask: 'words' }).words;
      gsap.set(tw, { yPercent: 110 });
      gsap.set(desc, { opacity: 0, y: 16 });
      tl.to(k, { duration: 0.5, scrambleText: { text: st.k, chars: 'upperCase', speed: 1 }, ease: 'none' }, t + 0.95);
      tl.to(tw, { yPercent: 0, duration: 0.65, ease: 'expo.out', stagger: 0.045 }, t + 1.0);
      tl.to(desc, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, t + 1.3);
      if (st.label) D.label(t + 0.6, st.label);
      // the scene of the front
      try { PLAY[st.vis](D, D.$('[class^="fv-"]', vis[i]), t + 1.0, T); } catch (e) { console.error(`[igfronts] ${st.vis}`, e); }
      D.hit(vis[i].firstElementChild, { scale: 1 }, { scale: 1.025, duration: Math.max(0.1, next - t - 1), ease: 'sine.inOut' }, t + 1);
      (D.cfg.warmAt ||= []).push(t + 1.6, t + 3);
    });
    tl.to(track, { opacity: 0, duration: 0.25, ease: 'power2.in' }, T + dur - 0.25);
    D.hide(s, T + dur);
    return dur;
  });
})();
