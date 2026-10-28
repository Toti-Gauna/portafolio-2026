/* Stack tiles — lab group (contract in js/ig-stack.js). Every visible string in text.es / text.en.
   Screen 3 (my projects): security · python · c · motion · tests. Screen 4 (studying): ml · aws · azure.
   Each tile is a 540×226 picture of the concept, played on D.tl from T and still by T + 2 s. */
(() => {
  'use strict';
  const { add } = Trailer.igStack;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const CHECK = 'M-6.5 0.5 L-2 5 L7 -5';
  const MONO = 11.4; // JetBrains Mono advance at 19 px (0.6 em)

  // Security — a sign-in hardens step by step: the password becomes an Argon2 hash, a 2FA code fills,
  // the session cookie gets its flags, the CSRF token matches, and the lock closes.
  add('security', {
    text: {
      es: { name: 'Seguridad', note: 'HttpOnly, CSRF, 2FA, Argon2', hash: '$argon2id$v=19$c2FsdA$Hq7…', tfa: '2FA', code: ['4', '8', '1', '9', '0', '3'], flags: ['HttpOnly', 'Secure', 'SameSite'], csrfH: 'X-CSRF-Token', csrf: 'a3f9e1c27b' },
      en: { name: 'Seguridad', note: 'HttpOnly, CSRF, 2FA, Argon2', hash: '$argon2id$v=19$c2FsdA$Hq7…', tfa: '2FA', code: ['4', '8', '1', '9', '0', '3'], flags: ['HttpOnly', 'Secure', 'SameSite'], csrfH: 'X-CSRF-Token', csrf: 'a3f9e1c27b' },
    },
    html: t => {
      const F = [21, 69, 117, 165];
      const fields = F.map(y => `<rect class="sf" x="16" y="${y}" width="408" height="40" rx="10"/><rect class="son" x="16" y="${y}" width="408" height="40" rx="10"/>
        <g transform="translate(402 ${y + 20})"><path class="sck" d="${CHECK}"/></g>`).join('');
      const dots = Array.from({ length: 8 }, (_, i) => `<circle class="sd" cx="${40 + i * 20}" cy="41" r="5"/>`).join('');
      const bx = [92, 124, 156, 200, 232, 264];
      const code = bx.map((x, i) => `<rect class="sbx" x="${x}" y="74" width="26" height="30" rx="6"/><text class="sdg" x="${x + 13}" y="96">${esc(t.code[i])}</text>`).join('');
      let cx = 64;
      const chips = t.flags.map(f => { const w = Math.round(f.length * MONO + 16), g = `<g class="sch"><rect x="${cx}" y="123" width="${w}" height="28" rx="14"/><text x="${cx + w / 2}" y="144">${esc(f)}</text></g>`; cx += w + 6; return g; }).join('');
      return `<svg viewBox="0 0 540 226" class="sx">
        ${fields}
        ${dots}<text class="sh" x="34" y="48"></text>
        <text class="stg" x="34" y="96">${esc(t.tfa)}</text>${code}
        <g transform="translate(40 137)"><circle class="sco" r="11"/><circle class="scd" cx="-4" cy="-3" r="2.2"/><circle class="scd" cx="4" cy="0" r="2"/><circle class="scd" cx="-1" cy="5" r="1.8"/></g>${chips}
        <text class="stg" x="34" y="192">${esc(t.csrfH)}</text><text class="stk" x="194" y="192"></text>
        <g class="slk">
          <g class="ssh"><path class="ssh0" d="M466 104 V90 a16 16 0 0 1 32 0 V104"/><path class="ssh1" d="M466 104 V90 a16 16 0 0 1 32 0 V104"/></g>
          <rect class="sb0" x="450" y="102" width="64" height="52" rx="10"/><rect class="sb1" x="450" y="102" width="64" height="52" rx="10"/>
          <circle class="skh" cx="482" cy="123" r="6"/><rect class="skh" x="479.5" y="125" width="5" height="14" rx="2.5"/>
        </g>
      </svg>`;
    },
    play(D, el, T, t) {
      const { tl } = D, $$ = s => D.$$(s, el);
      const on = $$('.son'), ck = $$('.sck'), dots = $$('.sd'), dg = $$('.sdg'), chips = $$('.sch');
      const hash = D.$('.sh', el), tok = D.$('.stk', el), lock = D.$('.slk', el), sh = D.$('.ssh', el);
      gsap.set(on, { opacity: 0 });
      gsap.set(ck, { drawSVG: '0%' });
      gsap.set([...dots, ...chips, lock], { transformOrigin: '50% 50%' });
      gsap.set(dots, { opacity: 0, scale: 0 });
      gsap.set(dg, { opacity: 0, y: 8 });
      gsap.set(chips, { opacity: 0, scale: 0.6 });
      gsap.set(sh, { y: -16 });
      gsap.set(D.$$('.ssh1, .sb1', el), { opacity: 0 });
      const pass = (i, at) => {
        tl.to(on[i], { opacity: 1, duration: 0.2, ease: 'power2.out' }, at);
        tl.to(ck[i], { drawSVG: '100%', duration: 0.22, ease: 'power2.out' }, at);
      };
      // 1 · the password is typed… and stored as an Argon2id hash
      tl.to(dots, { opacity: 1, scale: 1, duration: 0.14, ease: 'back.out(3)', stagger: 0.035 }, T);
      D.sfx('key', T, 0.08);
      tl.to(dots, { opacity: 0, scale: 0.3, duration: 0.14, ease: 'power2.in', stagger: 0.015 }, T + 0.36);
      tl.to(hash, { duration: 0.45, scrambleText: { text: t.hash, chars: 'abcdefghijklmnopqrstuvwxyz0123456789', speed: 1 }, ease: 'none' }, T + 0.4);
      pass(0, T + 0.78);
      // 2 · the 2FA code fills
      tl.to(dg, { opacity: 1, y: 0, duration: 0.16, ease: 'power3.out', stagger: 0.05 }, T + 0.5);
      pass(1, T + 0.9);
      // 3 · the session cookie gets its flags
      tl.to(chips, { opacity: 1, scale: 1, duration: 0.26, ease: 'back.out(2.2)', stagger: 0.07 }, T + 0.86);
      pass(2, T + 1.14);
      // 4 · the CSRF token matches
      tl.to(tok, { duration: 0.34, scrambleText: { text: t.csrf, chars: '0123456789abcdef', speed: 1 }, ease: 'none' }, T + 1.1);
      pass(3, T + 1.42);
      // and the lock closes
      tl.to(sh, { y: 0, duration: 0.16, ease: 'power3.in' }, T + 1.52);
      tl.to(D.$$('.ssh1, .sb1', el), { opacity: 1, duration: 0.14 }, T + 1.66);
      tl.to(lock, { keyframes: [{ scale: 1.08, duration: 0.08 }, { scale: 1, duration: 0.24, ease: 'power2.out' }] }, T + 1.66);
      D.sfx('tick', T + 1.66, 0.03);
    },
  });

  // Python — a notebook cell: the code is typed, the cell runs (In [ ] → [*] → [1]) and the output is the chart.
  add('python', {
    text: { es: { name: 'Python', note: 'Estudio y proyectos propios' }, en: { name: 'Python', note: 'Study and own projects' } },
    html: () => {
      const v = [0, 1, 4, 9, 16, 25], slot = 67;
      const bars = v.map((n, i) => { const cx = 118 + slot * i + slot / 2, h = Math.max(n * 3.2, 0); return `<rect class="pb" x="${cx - 21}" y="${202 - h}" width="42" height="${h || 0.01}" rx="3"/><text class="pv" x="${cx}" y="${202 - h - 9}">${n}</text>`; }).join('');
      return `
        <div class="pg pin">In&nbsp;[<span class="pq"><i class="q0">&nbsp;</i><i class="q1">*</i><i class="q2">1</i></span>]:</div>
        <div class="pc"><i class="pr"></i>
          <div class="pl"><span class="pt">sq <i class="o">=</i> <i class="o">[</i>x<i class="o">**</i><i class="n">2</i> <i class="k">for</i> x <i class="k">in</i> <i class="b">range</i><i class="o">(</i><i class="n">6</i><i class="o">)]</i></span></div>
          <div class="pl"><span class="pt">plt.<i class="b">bar</i><i class="o">(</i><i class="b">range</i><i class="o">(</i><i class="n">6</i><i class="o">),</i> sq<i class="o">)</i></span></div>
          <i class="pk"></i>
        </div>
        <div class="pg pout">Out[1]:</div>
        <svg viewBox="0 0 540 226" class="px"><path class="pa" d="M114 202.5 H522"/>${bars}</svg>`;
    },
    play(D, el, T) {
      const { tl } = D, lines = D.$$('.pt', el), caret = D.$('.pk', el), q = D.$$('.pq i', el), run = D.$('.pr', el);
      const out = D.$('.pout', el), bars = D.$$('.pb', el), vals = D.$$('.pv', el);
      const n = [30, 21], W = 12; // characters per line, advance at 20 px
      gsap.set(lines, { clipPath: 'inset(0% 100% 0% 0%)' });
      gsap.set(q.slice(1), { opacity: 0 });
      gsap.set([caret, out, run], { opacity: 0 });
      gsap.set(bars, { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set(vals, { opacity: 0, y: 6 });
      gsap.set(D.$('.pa', el), { drawSVG: '0%' });
      // typed, one character per step, with the caret riding the text
      tl.set(caret, { opacity: 1, x: 0, y: 0 }, T);
      D.sfx('key', T, 0.08);
      tl.to(lines[0], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: `steps(${n[0]})` }, T);
      tl.to(caret, { x: n[0] * W, duration: 0.55, ease: `steps(${n[0]})` }, T);
      tl.set(caret, { x: 0, y: 28 }, T + 0.6);
      tl.to(lines[1], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.38, ease: `steps(${n[1]})` }, T + 0.6);
      tl.to(caret, { x: n[1] * W, duration: 0.38, ease: `steps(${n[1]})` }, T + 0.6);
      // Shift+Enter: the cell runs…
      tl.set(caret, { opacity: 0 }, T + 1.02);
      tl.set(q[0], { opacity: 0 }, T + 1.02); tl.set(q[1], { opacity: 1 }, T + 1.02);
      tl.to(run, { opacity: 1, duration: 0.12 }, T + 1.02);
      tl.set(q[1], { opacity: 0 }, T + 1.24); tl.set(q[2], { opacity: 1 }, T + 1.24);
      tl.to(run, { opacity: 0, duration: 0.2 }, T + 1.24);
      // …and its output is the chart
      D.hit(out, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.25, ease: 'power3.out' }, T + 1.24);
      tl.to(D.$('.pa', el), { drawSVG: '100%', duration: 0.3, ease: 'power2.out' }, T + 1.24);
      tl.to(bars, { scaleY: 1, duration: 0.45, ease: 'expo.out', stagger: 0.05 }, T + 1.26);
      tl.to(vals, { opacity: 1, y: 0, duration: 0.25, ease: 'power3.out', stagger: 0.05 }, T + 1.34);
      D.sfx('tick', T + 1.28, 0.025);
    },
  });

  // C — pointer arithmetic: p walks the array 4 bytes at a time and writes through *p++,
  // ending one past the end (a + 4), as the loop leaves it.
  add('c', {
    text: { es: { name: 'C', note: 'Estudio y proyectos propios' }, en: { name: 'C', note: 'Study and own projects' } },
    html: () => {
      const X = [40, 132, 224, 316, 408], val = [1, 2, 4, 8], addr = ['0x1000', '0x1004', '0x1008', '0x100c', '0x1010'];
      const cells = X.map((x, i) => `<rect class="${i < 4 ? 'cm' : 'cm cg'}" x="${x}" y="122" width="92" height="48"/>
        <text class="ca${i < 4 ? '' : ' cgd'}" x="${x + 46}" y="200">${addr[i]}</text>
        ${i < 4 ? `<text class="cq" x="${x + 46}" y="154">?</text><text class="cv" x="${x + 46}" y="154">${val[i]}</text>` : ''}`).join('');
      return `
        <div class="cl"><span class="ct"><i class="ty">int</i> a<i class="o">[</i><i class="n">4</i><i class="o">],</i> <i class="o">*</i>p <i class="o">=</i> a<i class="o">;</i></span></div>
        <div class="cl"><span class="ct"><i class="k">for</i> <i class="o">(</i><i class="ty">int</i> i <i class="o">=</i> <i class="n">0</i><i class="o">;</i> i <i class="o">&lt;</i> <i class="n">4</i><i class="o">;</i> i<i class="o">++)</i> <span class="ch"><b class="chb"></b><i class="o">*</i>p<i class="o">++</i></span> <i class="o">=</i> <i class="n">1</i> <i class="o">&lt;&lt;</i> i<i class="o">;</i></span></div>
        <svg viewBox="0 0 540 226" class="cx">
          <text class="cn" x="22" y="154">a</text>
          ${cells}
          <g transform="translate(86 0)"><g class="cp"><text x="0" y="98">p</text><path class="cpl" d="M0 103 V114"/><path class="cph" d="M-6.5 112 L0 120 L6.5 112 Z"/></g></g>
        </svg>`;
    },
    play(D, el, T) {
      const { tl } = D, lines = D.$$('.ct', el), hl = D.$('.chb', el), p = D.$('.cp', el), q = D.$$('.cq', el), v = D.$$('.cv', el);
      gsap.set(lines, { clipPath: 'inset(0% 100% 0% 0%)' });
      gsap.set(hl, { opacity: 0 });
      gsap.set(p, { opacity: 0, y: -8 });
      gsap.set(v, { opacity: 0, scale: 0.5, transformOrigin: '50% 50%' });
      tl.to(lines[0], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.28, ease: 'steps(17)' }, T);
      D.sfx('key', T, 0.08);
      tl.to(p, { opacity: 1, y: 0, duration: 0.25, ease: 'power3.out' }, T + 0.28);
      tl.to(lines[1], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'steps(42)' }, T + 0.32);
      // *p++ = 1 << i: write through p, then p advances one int (4 bytes)
      for (let k = 0; k < 4; k++) {
        const at = T + 0.9 + k * 0.24;
        tl.to(hl, { keyframes: [{ opacity: 1, duration: 0.05 }, { opacity: 0.35, duration: 0.15 }] }, at);
        tl.to(q[k], { opacity: 0, duration: 0.08 }, at);
        tl.to(v[k], { opacity: 1, scale: 1, duration: 0.22, ease: 'back.out(2.6)' }, at);
        tl.to(p, { x: (k + 1) * 92, duration: 0.13, ease: 'power2.inOut' }, at + 0.09);
        D.sfx('tick', at, 0.018);
      }
      tl.to(hl, { opacity: 0, duration: 0.2 }, T + 1.78);
    },
  });

  // GSAP · WebGL — motion as code: the expo.out curve draws, a dot rides it, and the same ease moves the
  // WebGL "hello triangle" while the playhead scrubs the keyframes at constant speed.
  add('motion', {
    text: { es: { name: 'GSAP · WebGL', note: 'Kinetic Studio: 32 tráileres' }, en: { name: 'GSAP · WebGL', note: 'Kinetic Studio: 32 trailers' } },
    html: () => {
      const ex = u => (u === 1 ? 1 : 1 - Math.pow(2, -10 * u));
      let d = '';
      for (let i = 0; i <= 40; i++) { const u = i / 40; d += `${i ? 'L' : 'M'}${(20 + 180 * u).toFixed(1)} ${(202 - 180 * ex(u)).toFixed(1)} `; }
      let ticks = '';
      for (let i = 0; i <= 12; i++) { const x = 236 + i * 23; ticks += `M${x} 176 V${i % 4 ? 168 : 162} `; }
      return `<svg viewBox="0 0 540 226" class="mx">
          <path class="mlin" d="M20 202 L200 22"/>
          <path class="max" d="M20 22 V202 H200"/>
          <path class="mcu" d="${d}"/>
          <circle class="md" cx="20" cy="202" r="7"/>
          <text class="mc" x="232" y="48">ease: <tspan class="ms">"expo.out"</tspan></text>
          <path class="mtr" d="M236 112 H512"/>
          <g class="mru"><path class="mrl" d="M236 176 H512 ${ticks}"/></g>
          <path class="mkf" d="M236 168 L244 176 L236 184 L228 176 Z"/><path class="mkf" d="M512 168 L520 176 L512 184 L504 176 Z"/>
          <g class="mph"><path class="mpl" d="M236 150 V200"/><rect class="mpk" x="229" y="142" width="14" height="12" rx="3"/></g>
        </svg>
        <div class="mt"></div>`;
    },
    play(D, el, T) {
      const { tl } = D, ax = D.$('.max', el), lin = D.$('.mlin', el), cu = D.$('.mcu', el), dot = D.$('.md', el);
      const code = D.$('.mc', el), tr = D.$('.mtr', el), ru = D.$('.mru', el), kf = D.$$('.mkf', el), ph = D.$('.mph', el), tri = D.$('.mt', el);
      gsap.set([ax, cu, tr], { drawSVG: '0%' });
      gsap.set([lin, dot, code, ph], { opacity: 0 });
      gsap.set(ru, { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set(kf, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(tri, { opacity: 0, scale: 0.6, transformOrigin: '50% 66.7%' });
      // the graph and the timeline draw in
      tl.to(ax, { drawSVG: '100%', duration: 0.3, ease: 'power2.out' }, T);
      tl.to(lin, { opacity: 1, duration: 0.3 }, T + 0.1);
      tl.to(cu, { drawSVG: '100%', duration: 0.48, ease: 'power2.inOut' }, T + 0.12);
      tl.to(code, { opacity: 1, duration: 0.25 }, T + 0.05);
      tl.to(tr, { drawSVG: '100%', duration: 0.35, ease: 'power2.out' }, T + 0.1);
      tl.to(ru, { scaleX: 1, duration: 0.4, ease: 'expo.out' }, T + 0.15);
      tl.to(kf, { scale: 1, duration: 0.25, ease: 'back.out(3)', stagger: 0.08 }, T + 0.38);
      tl.to(tri, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, T + 0.3);
      tl.to([dot, ph], { opacity: 1, duration: 0.15 }, T + 0.5);
      // play: time moves at constant speed (x, playhead); the value follows expo.out (y, the triangle)
      const at = T + 0.64, dur = 1.1;
      tl.to(dot, { attr: { cx: 200 }, duration: dur, ease: 'none' }, at);
      tl.to(dot, { attr: { cy: 22 }, duration: dur, ease: 'expo.out' }, at);
      tl.to(ph, { x: 276, duration: dur, ease: 'none' }, at);
      tl.to(tri, { x: 224, rotation: 120, duration: dur, ease: 'expo.out' }, at);
      D.sfx('tick', at, 0.025);
    },
  });

  // Vitest · Playwright — the suite runs: spinners turn into checks, the browser test signs in, PASS.
  add('tests', {
    text: {
      es: { name: 'Vitest · Playwright', note: 'Eclipse y este sitio', rows: ['precios › quote()', 'i18n › mismas claves', 'e2e › portal: ingreso', 'a11y › contraste AA'], btn: 'Ingresar', pass: 'PASS', all: 'todo en verde' },
      en: { name: 'Vitest · Playwright', note: 'Eclipse and this site', rows: ['pricing › quote()', 'i18n › same keys', 'e2e › portal: sign in', 'a11y › AA contrast'], btn: 'Sign in', pass: 'PASS', all: 'all green' },
    },
    html: t => {
      const rows = t.rows.map((r, i) => { const y = 36 + i * 36; return `
        <g transform="translate(30 ${y})"><g class="tsp"><circle class="tsa" r="9"/></g><g class="tok"><circle class="tob" r="11"/><path class="tck" d="M-5 0.5 L-1.5 4 L5.5 -4"/></g></g>
        <text class="tn" x="52" y="${y + 7}">${esc(r)}</text>`; }).join('');
      return `<svg viewBox="0 0 540 226" class="tx">
          ${rows}
          <rect class="tw" x="312" y="18" width="212" height="142" rx="10"/><path class="twl" d="M312 40 H524"/>
          <circle class="twd" cx="328" cy="29" r="4"/><circle class="twd" cx="342" cy="29" r="4"/><circle class="twd" cx="356" cy="29" r="4"/>
          <rect class="tin" x="328" y="52" width="180" height="26" rx="6"/><rect class="tin" x="328" y="86" width="180" height="26" rx="6"/>
          <rect class="tfl" x="340" y="62" width="96" height="6" rx="3"/><rect class="tfl" x="340" y="96" width="64" height="6" rx="3"/>
          <g class="tbt"><rect class="tbr" x="328" y="122" width="112" height="30" rx="8"/><rect class="tbk" x="328" y="122" width="112" height="30" rx="8"/>
            <text class="tbl" x="384" y="143">${esc(t.btn)}</text><path class="tbc" d="M375 137 L381 143 L393 131"/></g>
          <g transform="translate(398 140)"><g class="tcu"><path d="M0 0 L0 21 L5.5 16 L9.5 25 L13.5 23.3 L9.6 14.6 L16.5 14.6 Z"/></g></g>
          <rect class="tbar" x="16" y="176" width="508" height="34" rx="8"/><rect class="tbf" x="16" y="176" width="508" height="34" rx="8"/>
          <text class="tps" x="32" y="200"><tspan class="tpb">${esc(t.pass)}</tspan>  ${esc(t.all)}</text>
        </svg>`;
    },
    play(D, el, T) {
      const { tl } = D, sp = D.$$('.tsp', el), ok = D.$$('.tok', el), ck = D.$$('.tck', el), fl = D.$$('.tfl', el);
      const cur = D.$('.tcu', el), bt = D.$('.tbt', el), done = D.$$('.tbk, .tbc', el), bar = D.$('.tbf', el), txt = D.$('.tps', el);
      gsap.set([...sp, ...ok, bt], { transformOrigin: '50% 50%' });
      gsap.set(ok, { scale: 0, opacity: 0 });
      gsap.set(ck, { drawSVG: '0%' });
      gsap.set(fl, { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set(cur, { x: 92, y: -96, opacity: 0 });
      gsap.set(done, { opacity: 0 });
      gsap.set(bar, { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set(txt, { opacity: 0, x: -8 });
      const at = [0.32, 0.52, 1.02, 1.22].map(s => T + s);
      sp.forEach((s, i) => {
        tl.to(s, { rotation: 720 * (at[i] - T), duration: at[i] - T, ease: 'none' }, T);
        tl.to(s, { opacity: 0, duration: 0.08 }, at[i]);
        tl.to(ok[i], { opacity: 1, scale: 1, duration: 0.24, ease: 'back.out(2.6)' }, at[i]);
        tl.to(ck[i], { drawSVG: '100%', duration: 0.2, ease: 'power2.out' }, at[i] + 0.06);
      });
      D.sfx('key', T, 0.06);
      // Playwright: fill(), click(), expect()
      tl.to(fl, { scaleX: 1, duration: 0.18, ease: 'steps(8)', stagger: 0.12 }, T + 0.2);
      tl.to(cur, { opacity: 1, duration: 0.12 }, T + 0.42);
      tl.to(cur, { x: 0, y: 0, duration: 0.36, ease: 'power3.inOut' }, T + 0.48);
      tl.to([cur, bt], { keyframes: [{ scale: 0.9, duration: 0.06 }, { scale: 1, duration: 0.16, ease: 'power2.out' }] }, T + 0.86);
      tl.to(done, { opacity: 1, duration: 0.15 }, T + 0.92);
      tl.to(D.$('.tbl', el), { opacity: 0, duration: 0.1 }, T + 0.92);
      tl.to(cur, { x: 46, y: -4, duration: 0.3, ease: 'power2.out' }, T + 1.0);
      // the run: PASS
      tl.to(bar, { scaleX: 1, duration: 0.45, ease: 'expo.out' }, T + 1.32);
      tl.to(txt, { opacity: 1, x: 0, duration: 0.3, ease: 'power3.out' }, T + 1.44);
      D.sfx('tick', T + 1.32, 0.03);
    },
  });

  // Machine learning — fit(): two classes, a linear boundary that swings like gradient descent and settles
  // between them, its decision regions turning with it, while the loss curve falls.
  add('ml', {
    text: { es: { name: 'Machine learning', note: 'Fundamentos', fit: 'fit(X, y)', loss: 'loss' }, en: { name: 'Machine learning', note: 'Fundamentals', fit: 'fit(X, y)', loss: 'loss' } },
    html: t => {
      const B = [[62, 52], [112, 38], [58, 104], [118, 84], [168, 46], [40, 140], [214, 30]];
      const A = [[300, 190], [250, 172], [300, 128], [210, 190], [262, 132], [322, 84], [150, 192]];
      let d = '';
      for (let i = 0; i <= 24; i++) { const u = i / 24; d += `${i ? 'L' : 'M'}${(366 + 152 * u).toFixed(1)} ${(78 + 110 * (1 - Math.exp(-4 * u)) / (1 - Math.exp(-4))).toFixed(1)} `; }
      return `<svg viewBox="0 0 540 226" class="lx">
          <defs><clipPath id="stk-ml-clip"><rect x="16" y="16" width="328" height="194" rx="12"/></clipPath></defs>
          <rect class="lf" x="16" y="16" width="328" height="194" rx="12"/>
          <g clip-path="url(#stk-ml-clip)"><g class="lreg">
            <rect class="lra" x="-220" y="-287" width="800" height="400"/><rect class="lrb" x="-220" y="113" width="800" height="400"/>
            <path class="lln" d="M-220 113 H580"/>
          </g></g>
          ${B.map(([x, y]) => `<rect class="lp lpb" x="${x - 6}" y="${y - 6}" width="12" height="12" rx="2"/>`).join('')}
          ${A.map(([x, y]) => `<circle class="lp lpa" cx="${x}" cy="${y}" r="7"/>`).join('')}
          <text class="lfit" x="362" y="46">${esc(t.fit)}</text>
          <g transform="translate(503 39)"><path class="lck" d="${CHECK}"/></g>
          <path class="lax" d="M364 68 V198 H522"/>
          <path class="lcu" d="${d}"/>
          <text class="llo" x="516" y="98">${esc(t.loss)}</text>
        </svg>`;
    },
    play(D, el, T) {
      const { tl } = D, pts = D.$$('.lp', el), reg = D.$('.lreg', el), cu = D.$('.lcu', el), ck = D.$('.lck', el);
      const fit = D.$('.lfit', el), ax = D.$('.lax', el), lo = D.$('.llo', el);
      gsap.set(pts, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
      gsap.set(reg, { svgOrigin: '180 113', rotation: 38, opacity: 0 });
      gsap.set([cu, ck], { drawSVG: '0%' });
      gsap.set(ax, { drawSVG: '0%' });
      gsap.set([fit, lo], { opacity: 0 });
      // the data
      tl.to(pts, { scale: 1, opacity: 1, duration: 0.24, ease: 'back.out(2.6)', stagger: { each: 0.022, from: 'random' } }, T);
      tl.to(fit, { opacity: 1, duration: 0.2 }, T + 0.15);
      tl.to(ax, { drawSVG: '100%', duration: 0.3, ease: 'power2.out' }, T + 0.15);
      tl.to(lo, { opacity: 1, duration: 0.2 }, T + 0.3);
      // fit(): the boundary swings and settles, the loss falls with it
      tl.to(reg, { opacity: 1, duration: 0.2 }, T + 0.3);
      tl.to(reg, { keyframes: [
        { rotation: -46, duration: 0.32, ease: 'sine.inOut' }, { rotation: -16, duration: 0.24, ease: 'sine.inOut' },
        { rotation: -33, duration: 0.2, ease: 'sine.inOut' }, { rotation: -26, duration: 0.16, ease: 'sine.inOut' },
        { rotation: -28, duration: 0.14, ease: 'sine.out' }] }, T + 0.42);
      tl.to(cu, { drawSVG: '100%', duration: 1.06, ease: 'power1.out' }, T + 0.42);
      tl.to(ck, { drawSVG: '100%', duration: 0.22, ease: 'power2.out' }, T + 1.5);
      tl.to(pts, { keyframes: [{ scale: 1.25, duration: 0.1 }, { scale: 1, duration: 0.25, ease: 'power2.out' }], stagger: 0.012 }, T + 1.48);
      D.sfx('tick', T + 1.5, 0.025);
    },
  });

  // AWS — a generic serverless upload, drawn as boxes with the service names in type:
  // POST /upload → API Gateway → Lambda → S3, and the object lands in the bucket.
  add('aws', {
    text: {
      es: { name: 'AWS', note: 'Estudio', req: '/upload', subs: ['ruta', 'handler()', 'bucket'], obj: 'foto.jpg' },
      en: { name: 'AWS', note: 'Study', req: '/upload', subs: ['route', 'handler()', 'bucket'], obj: 'photo.jpg' },
    },
    html: t => {
      const X = [16, 220, 388], BW = [172, 136, 136], N = ['API Gateway', 'Lambda', 'S3'];
      const box = (x, i) => `<g class="ab"><rect class="abr" x="${x}" y="88" width="${BW[i]}" height="72" rx="6"/><rect class="abo" x="${x}" y="88" width="${BW[i]}" height="72" rx="6"/>
        <text class="an" x="${x + 14}" y="118">${N[i]}</text><text class="as" x="${x + 14}" y="146">${esc(t.subs[i])}</text></g>`;
      const rw = Math.round((5 + t.req.length) * MONO + 26), ow = Math.round(t.obj.length * MONO + 46);
      return `<svg viewBox="0 0 540 226" class="ax">
          <path class="ae" d="M90 50 V82"/><path class="ah" d="M84 78 L90 86 L96 78"/>
          <path class="ae" d="M188 124 H212"/><path class="ah" d="M208 118 L216 124 L208 130"/>
          <path class="ae" d="M356 124 H380"/><path class="ah" d="M376 118 L384 124 L376 130"/>
          <path class="ae" d="M456 160 V172"/>
          ${X.map(box).join('')}
          <g class="arq"><rect x="16" y="18" width="${rw}" height="32" rx="16"/><text x="29" y="40"><tspan class="am">POST</tspan> ${esc(t.req)}</text></g>
          <g class="aob"><rect x="${524 - ow}" y="172" width="${ow}" height="34" rx="6"/>
            <path class="afi" d="M${524 - ow + 14} 180 h9 l5 5 v13 h-14 Z"/><text x="${524 - ow + 36}" y="195">${esc(t.obj)}</text></g>
          <circle class="ad" cx="90" cy="50" r="6"/>
        </svg>`;
    },
    play(D, el, T) {
      const { tl } = D, bx = D.$$('.ab', el), lit = D.$$('.abo', el), e = D.$$('.ae', el), h = D.$$('.ah', el);
      const rq = D.$('.arq', el), ob = D.$('.aob', el), dot = D.$('.ad', el);
      gsap.set(bx, { opacity: 0, y: 10 });
      gsap.set(rq, { opacity: 0, x: -10 });
      gsap.set(e, { drawSVG: '0%' });
      gsap.set([...h, ...lit, dot], { opacity: 0 });
      gsap.set(ob, { opacity: 0, y: -10 });
      // the architecture draws itself
      tl.to(bx, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out', stagger: 0.08 }, T);
      tl.to(rq, { opacity: 1, x: 0, duration: 0.35, ease: 'expo.out' }, T + 0.05);
      tl.to(e.slice(0, 3), { drawSVG: '100%', duration: 0.25, ease: 'power2.out', stagger: 0.08 }, T + 0.25);
      tl.to(h, { opacity: 1, duration: 0.15, stagger: 0.08 }, T + 0.4);
      // a request travels through it
      const hop = (x0, y0, x1, y1, at, i) => {
        tl.set(dot, { attr: { cx: x0, cy: y0 }, opacity: 1 }, at);
        tl.to(dot, { attr: { cx: x1, cy: y1 }, duration: 0.18, ease: 'power2.in' }, at);
        tl.set(dot, { opacity: 0 }, at + 0.18);
        tl.to(lit[i], { opacity: 1, duration: 0.18, ease: 'power2.out' }, at + 0.16);
        D.sfx('tick', at + 0.16, 0.018);
      };
      hop(90, 50, 90, 88, T + 0.62, 0);
      hop(188, 124, 220, 124, T + 0.9, 1);
      hop(356, 124, 388, 124, T + 1.16, 2);
      // the object lands in the bucket
      tl.to(e[3], { drawSVG: '100%', duration: 0.12 }, T + 1.36);
      tl.to(ob, { opacity: 1, y: 0, duration: 0.35, ease: 'back.out(2)' }, T + 1.42);
    },
  });

  // Azure — the same idea in its own shape: the web app on App Service sends the upload to Functions,
  // which writes it to Blob Storage.
  add('azure', {
    text: {
      es: { name: 'Azure', note: 'Estudio', subs: ['web app', 'trigger', 'contenedor'], saved: '+ informe.pdf', btn: 'Subir' },
      en: { name: 'Azure', note: 'Study', subs: ['web app', 'trigger', 'container'], saved: '+ report.pdf', btn: 'Upload' },
    },
    html: t => `<svg viewBox="0 0 540 226" class="zx">
        <path class="ze" d="M212 54 H254"/><path class="zh" d="M250 48 L258 54 L250 60"/>
        <path class="ze" d="M393 92 V126"/><path class="zh" d="M387 122 L393 130 L399 122"/>
        <g class="zb"><rect class="zbr" x="16" y="16" width="196" height="194" rx="14"/><rect class="zbo" x="16" y="16" width="196" height="194" rx="14"/>
          <text class="zn" x="32" y="50">App Service</text><text class="zs" x="32" y="76">${esc(t.subs[0])}</text>
          <rect class="zpg" x="32" y="92" width="164" height="102" rx="8"/>
          <rect class="zln" x="44" y="104" width="72" height="8" rx="4"/><rect class="zln zl2" x="44" y="122" width="136" height="6" rx="3"/><rect class="zln zl2" x="44" y="134" width="104" height="6" rx="3"/>
          <g class="zbt"><rect x="44" y="152" width="104" height="30" rx="15"/><text x="96" y="173">${esc(t.btn)}</text></g></g>
        <g class="zb"><rect class="zbr" x="262" y="16" width="262" height="76" rx="14"/><rect class="zbo" x="262" y="16" width="262" height="76" rx="14"/>
          <text class="zn" x="278" y="48">Functions</text><text class="zs" x="278" y="76">${esc(t.subs[1])}</text></g>
        <g class="zb"><rect class="zbr" x="262" y="134" width="262" height="76" rx="14"/><rect class="zbo" x="262" y="134" width="262" height="76" rx="14"/>
          <text class="zn" x="278" y="166">Blob Storage</text><text class="zs zsc" x="278" y="194">${esc(t.subs[2])}</text><text class="zs zsv" x="278" y="194"></text>
          <g class="zfi"><path d="M478 148 h17 l9 9 v35 h-26 Z"/><path class="zfo" d="M495 148 v9 h9"/></g></g>
        <circle class="zd" cx="212" cy="54" r="6"/>
      </svg>`,
    play(D, el, T, t) {
      const { tl } = D, bx = D.$$('.zb', el), lit = D.$$('.zbo', el), e = D.$$('.ze', el), h = D.$$('.zh', el), ln = D.$$('.zln', el);
      const btn = D.$('.zbt', el), dot = D.$('.zd', el), sv = D.$('.zsv', el), fi = D.$('.zfi', el);
      gsap.set(bx, { opacity: 0, scale: 0.94, transformOrigin: '50% 50%' });
      gsap.set(e, { drawSVG: '0%' });
      gsap.set([...h, ...lit, dot], { opacity: 0 });
      gsap.set(ln, { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set([btn, fi], { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' });
      // the three services
      tl.to(bx, { opacity: 1, scale: 1, duration: 0.4, ease: 'expo.out', stagger: 0.08 }, T);
      tl.to(ln, { scaleX: 1, duration: 0.3, ease: 'expo.out', stagger: 0.06 }, T + 0.15);
      tl.to(btn, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2.4)' }, T + 0.3);
      tl.to(e, { drawSVG: '100%', duration: 0.22, ease: 'power2.out', stagger: 0.1 }, T + 0.28);
      tl.to(h, { opacity: 1, duration: 0.15, stagger: 0.1 }, T + 0.42);
      // the visitor uploads: the app answers, Functions runs, the blob is written
      tl.to(btn, { keyframes: [{ scale: 0.9, duration: 0.06 }, { scale: 1, duration: 0.18, ease: 'power2.out' }] }, T + 0.56);
      tl.to(lit[0], { opacity: 1, duration: 0.18 }, T + 0.6);
      const hop = (x0, y0, x1, y1, at, i) => {
        tl.set(dot, { attr: { cx: x0, cy: y0 }, opacity: 1 }, at);
        tl.to(dot, { attr: { cx: x1, cy: y1 }, duration: 0.2, ease: 'power2.in' }, at);
        tl.set(dot, { opacity: 0 }, at + 0.2);
        tl.to(lit[i], { opacity: 1, duration: 0.18, ease: 'power2.out' }, at + 0.18);
        D.sfx('tick', at + 0.18, 0.018);
      };
      hop(212, 54, 262, 54, T + 0.7, 1);
      hop(393, 92, 393, 134, T + 0.98, 2);
      tl.to(D.$('.zsc', el), { opacity: 0, duration: 0.12 }, T + 1.16);
      tl.to(sv, { duration: 0.4, scrambleText: { text: t.saved, chars: 'abcdefghijklmnopqrstuvwxyz.', speed: 1 }, ease: 'none' }, T + 1.18);
      tl.to(fi, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.4)' }, T + 1.2);
    },
  });
})();
