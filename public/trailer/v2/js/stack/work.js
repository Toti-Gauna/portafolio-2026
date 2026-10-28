/* Stack tiles — work group (contract in js/ig-stack.js). Every visible string in text.es / text.en. */
(() => {
  'use strict';
  const { add } = Trailer.igStack;
  // React — a component tree renders; a state change flows down and re-renders the cards it reaches.
  add('react', {
    text: { es: { name: 'React', note: 'Ruleta, referidos y pagos', state: 'estado' }, en: { name: 'React', note: 'Roulette, referrals, payments', state: 'state' } },
    html: t => {
      const N = [['App', 300, 36], ['Header', 150, 108], ['Feed', 362, 108], ['Card', 246, 184], ['Card', 362, 184], ['Card', 478, 184]];
      const E = [[0, 1], [0, 2], [2, 3], [2, 4], [2, 5]];
      const pill = ([n, x, y], i) => `<g class="rn" data-i="${i}" transform="translate(${x} ${y})"><rect x="-56" y="-20" width="112" height="40" rx="20"/><text y="7">&lt;${n}/&gt;</text></g>`;
      return `<svg viewBox="0 0 540 226" class="rx">
        ${E.map(([a, b]) => `<path class="re" d="M${N[a][1]} ${N[a][2] + 20}C${N[a][1]} ${(N[a][2] + N[b][2]) / 2} ${N[b][1]} ${(N[a][2] + N[b][2]) / 2} ${N[b][1]} ${N[b][2] - 20}"/>`).join('')}
        ${N.map(pill).join('')}
        <circle class="rs" r="9" cx="300" cy="36"/>
        <g transform="translate(84 36)"><g class="rl"><rect x="-62" y="-18" width="124" height="36" rx="18"/><text y="7">${t.state}</text></g></g>
      </svg>`;
    },
    play(D, el, T) {
      const { tl } = D, nodes = D.$$('.rn', el), edges = D.$$('.re', el), dot = D.$('.rs', el), lab = D.$('.rl', el);
      gsap.set(nodes, { transformOrigin: '50% 50%' });
      gsap.set(edges, { drawSVG: '0%' });
      nodes.forEach((n, i) => D.hit(n, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.4)' }, T + (i === 0 ? 0 : 0.18 + i * 0.07)));
      tl.to(edges, { drawSVG: '100%', duration: 0.35, ease: 'power2.out', stagger: 0.06 }, T + 0.12);
      // setState: the change travels App → Feed → the three cards, which re-render (they flash)
      D.hit(lab, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power3.out' }, T + 0.75);
      D.hit(dot, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.2 }, T + 0.85);
      tl.to(dot, { attr: { cx: 362, cy: 108 }, duration: 0.35, ease: 'power2.inOut' }, T + 1.0);
      tl.to(dot, { opacity: 0, duration: 0.15 }, T + 1.35);
      [3, 4, 5].forEach((i, k) => tl.to(nodes[i], { keyframes: [{ scale: 1.12, duration: 0.14 }, { scale: 1, duration: 0.3, ease: 'power2.out' }] }, T + 1.38 + k * 0.06));
      [2, 3, 4, 5].forEach((i, k) => tl.set(nodes[i], { attr: { class: 'rn on' } }, T + 1.3 + k * 0.06));
    },
  });


  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const VB = 'viewBox="0 0 540 226"';
  /** a line of code typed in: clip-path stepped one character at a time */
  const type = (D, el, n, at, cps = 60) => D.hit(el, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: n / cps, ease: `steps(${n})` }, at);

  // TypeScript — the compiler catches a string where a number goes; the quotes go, 12 takes the colour of
  // `number` and the check passes.
  add('typescript', {
    text: {
      es: { name: 'TypeScript', note: 'Tsoft, Eclipse y HandyX', file: 'carrito.ts', err1: "No se puede asignar 'string'", err2: "al tipo 'number'.", ok: '0 errores' },
      en: { name: 'TypeScript', note: 'Tsoft, Eclipse and HandyX', file: 'cart.ts', err1: "Type 'string' is not assignable", err2: "to type 'number'.", ok: '0 errors' },
    },
    html: t => {
      const x = c => (56 + c * 14.4).toFixed(1), tab = Math.round(t.file.length * 11.4 + 34), ok = Math.round(50 + t.ok.length * 13.2 + 20);
      return `<svg ${VB} class="ts">
        <rect class="tab" x="16" y="16" width="${tab}" height="36" rx="8"/><text class="file" x="33" y="40">${esc(t.file)}</text>
        <path class="rule" d="M16 52H524"/><rect class="tabl" x="16" y="50" width="${tab}" height="3"/>
        <text class="ln" x="24" y="106">3</text>
        <g class="code">
          <text class="k" x="${x(0)}" y="106">const</text><text class="id" x="${x(6)}" y="106">total</text><text class="p" x="${x(11)}" y="106">:</text>
          <text class="ty" x="${x(13)}" y="106">number</text><text class="p" x="${x(20)}" y="106">=</text>
          <text class="s q" x="${x(22)}" y="106">"</text>
          <g class="n12"><text class="s" x="${x(23)}" y="106">12</text><text class="ty vn" x="${x(23)}" y="106">12</text></g>
          <text class="s q" x="${x(25)}" y="106">"</text><text class="p semi" x="${x(26)}" y="106">;</text>
        </g>
        <path class="sq" d="M${x(22)} 117q2-3.5 4 0${'t4 0'.repeat(13)}"/>
        <g transform="translate(56 132)"><g class="pop"><rect width="468" height="62" rx="10"/><rect class="pbar" width="4" height="62" rx="2"/>
          <text x="20" y="25">${esc(t.err1)}</text><text x="20" y="51">${esc(t.err2)}</text></g></g>
        <g transform="translate(56 140)"><g class="ok"><rect width="${ok}" height="46" rx="23"/><path d="M17 23l7 7 13-14"/><text x="48" y="31">${esc(t.ok)}</text></g></g>
      </svg>`;
    },
    play(D, el, T) {
      const { tl } = D, $ = s => D.$(s, el), q = D.$$('.q', el), sq = $('.sq'), pop = $('.pop'), ok = $('.ok'), tick = $('.ok path');
      gsap.set($('.code'), { clipPath: 'inset(0% 100% 0% 0%)' });
      gsap.set([sq, tick], { drawSVG: '0%' });
      gsap.set([pop, ok, $('.vn')], { opacity: 0 });
      gsap.set([...q, ok], { transformOrigin: '50% 50%' });
      // the line is typed
      type(D, $('.code'), 27, T, 66);
      // the compiler flags it: squiggle + message
      tl.to(sq, { drawSVG: '100%', duration: 0.22, ease: 'power1.inOut' }, T + 0.46);
      D.hit(pop, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }, T + 0.56);
      D.sfx('tick', T + 0.5, 0.03);
      // the fix: the quotes go, "12" becomes 12 (the colour of number) and the error clears
      tl.to(q, { opacity: 0, scale: 0.3, duration: 0.16, ease: 'power2.in' }, T + 1.22);
      tl.to(sq, { drawSVG: '100% 100%', duration: 0.18, ease: 'power2.in' }, T + 1.22);
      tl.to(pop, { opacity: 0, y: 8, duration: 0.2, ease: 'power2.in' }, T + 1.22);
      tl.to($('.n12'), { x: -14.4, duration: 0.3, ease: 'power3.inOut' }, T + 1.36);
      tl.to($('.semi'), { x: -28.8, duration: 0.3, ease: 'power3.inOut' }, T + 1.36);
      tl.to($('.n12 .s'), { opacity: 0, duration: 0.2 }, T + 1.4);
      tl.to($('.vn'), { opacity: 1, duration: 0.2 }, T + 1.4);
      D.hit(ok, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, T + 1.5);
      tl.to(tick, { drawSVG: '100%', duration: 0.25, ease: 'power2.out' }, T + 1.6);
    },
  });

  // Next.js — file-system routing: each file under app/ is a URL that renders in the browser; at build time
  // every page is prerendered to static HTML (SSG: this portfolio and Eclipse are static exports).
  add('nextjs', {
    text: { es: { name: 'Next.js', note: 'Eclipse y este portafolio', slug: 'hola' }, en: { name: 'Next.js', note: 'Eclipse and this portfolio', slug: 'hello' } },
    html: t => {
      const F = [['', 'page.tsx'], ['about/', 'page.tsx'], ['blog/[id]/', 'page.tsx']], U = ['/', '/about', `/blog/${t.slug}`];
      const b = (x, y, w, h, c = 'b1') => `<rect class="${c}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(h / 2, 5)}"/>`;
      const pages = [
        b(316, 72, 150, 16) + b(316, 98, 104, 9, 'b2') + [316, 382, 448].map(x => b(x, 122, 58, 62, 'cd')).join('') + b(326, 170, 30, 7, 'ac'),
        '<circle class="cd" cx="340" cy="94" r="22"/>' + b(374, 80, 112, 13) + b(374, 102, 78, 9, 'b2') + [190, 176, 132].map((w, i) => b(316, 138 + i * 18, w, 8, 'b3')).join(''),
        b(316, 72, 176, 16) + b(316, 98, 62, 8, 'ac') + [190, 184, 190, 120].map((w, i) => b(316, 122 + i * 17, w, 8, 'b3')).join(''),
      ];
      return `<svg ${VB} class="nx">
        <g transform="translate(0 84)"><g class="hl"><rect x="12" y="-18" width="256" height="36" rx="8"/><path d="M274 0H292M286-6l6 6-6 6"/></g></g>
        <text class="dir0" x="20" y="44">app/</text>
        <path class="tree" d="M30 54V168M30 84H42M30 126H42M30 168H42"/>
        ${F.map(([d, f], i) => `<text class="f" x="50" y="${91 + i * 42}"><tspan class="d">${d}</tspan>${f}</text>`).join('')}
        <rect class="win" x="300" y="16" width="224" height="194" rx="12"/>
        <path class="rule" d="M300 56H524"/>
        ${[316, 330, 344].map(x => `<circle class="dot" cx="${x}" cy="36" r="4.5"/>`).join('')}
        <rect class="urlb" x="358" y="22" width="154" height="28" rx="14"/>${U.map(u => `<text class="url" x="372" y="42">${esc(u)}</text>`).join('')}
        ${pages.map(p => `<g class="pg">${p}</g>`).join('')}
        <g transform="translate(462 172)"><g class="stamp"><rect x="-46" y="-21" width="92" height="42" rx="6"/><text y="9">SSG</text></g></g>
      </svg>`;
    },
    play(D, el, T, t) {
      const { tl } = D, $ = s => D.$(s, el), rows = D.$$('.f', el), hl = $('.hl'), url = D.$$('.url', el), pg = D.$$('.pg', el), stamp = $('.stamp');
      gsap.set([hl, ...pg, stamp, ...url], { opacity: 0 });
      gsap.set(stamp, { transformOrigin: '50% 50%' });
      gsap.set([$('.dir0'), ...rows], { opacity: 0 });
      gsap.set($('.tree'), { drawSVG: '0%' });
      // the app/ tree
      D.hit([$('.dir0'), ...rows], { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.32, ease: 'power3.out', stagger: 0.06 }, T);
      D.hit($('.tree'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.35, ease: 'power2.out' }, T + 0.05);
      // each file is a route: select it, the URL changes and the page renders
      D.hit(hl, { opacity: 0 }, { opacity: 1, duration: 0.2 }, T + 0.3);
      tl.set(rows[0], { attr: { class: 'f on' } }, T + 0.3);
      tl.set(url[0], { opacity: 1 }, T + 0.3);
      D.hit(pg[0], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, T + 0.34);
      [1, 2].forEach(i => {
        const at = T + 0.3 + i * 0.44;
        tl.to(hl, { y: 42 * i, duration: 0.28, ease: 'power3.inOut' }, at);
        tl.set(rows[i - 1], { attr: { class: 'f' } }, at + 0.1);
        tl.set(rows[i], { attr: { class: 'f on' } }, at + 0.1);
        tl.set(url[i - 1], { opacity: 0 }, at + 0.04);
        tl.set(url[i], { opacity: 1 }, at + 0.04);
        type(D, url[i], url[i].textContent.length, at + 0.04, 40);
        tl.to(pg[i - 1], { opacity: 0, duration: 0.14 }, at);
        D.hit(pg[i], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, at + 0.12);
      });
      // next build: prerendered as static HTML
      D.hit(stamp, { opacity: 0, scale: 1.7, rotation: 6 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.34, ease: 'back.out(1.7)' }, T + 1.48);
      D.sfx('tick', T + 1.54, 0.03);
    },
  });

  // React Native — one component, two platforms: the same <App/> renders on both phones, and one state change
  // switches the tab on both at once.
  add('reactnative', {
    text: {
      es: { name: 'React Native', note: 'Apps móviles en el trabajo', one: 'un solo código', tab1: 'Pedidos', tab2: 'Perfil' },
      en: { name: 'React Native', note: 'Mobile apps at work', one: 'one codebase', tab1: 'Orders', tab2: 'Profile' },
    },
    html: t => {
      const AV = ['#61dafb', '#ff4d2e', '#ffc21a'];
      const screen = `
        <text class="h t1" x="10" y="38">${esc(t.tab1)}</text><text class="h t2" x="10" y="38">${esc(t.tab2)}</text>
        <g class="l1">${[58, 82, 106].map((y, i) => `<circle cx="17" cy="${y}" r="8" fill="${AV[i]}"/><rect class="b1" x="31" y="${y - 7}" width="${[50, 44, 52][i]}" height="7" rx="3.5"/><rect class="b2" x="31" y="${y + 3}" width="${[32, 40, 26][i]}" height="5" rx="2.5"/>`).join('')}</g>
        <g class="l2"><circle cx="46" cy="72" r="19" fill="#61dafb"/><rect class="b1" x="20" y="100" width="52" height="8" rx="4"/><rect class="b2" x="28" y="114" width="36" height="6" rx="3"/></g>
        <path class="tb" d="M0 128H92"/>${[18, 46, 74].map(x => `<rect class="ic" x="${x - 5}" y="134" width="10" height="10" rx="3"/>`).join('')}
        <rect class="ind" x="10" y="149" width="16" height="3" rx="1.5"/>`;
      const phone = (x, ios, label) => `
        <g transform="translate(${x} 14)"><g class="ph">
          <rect class="body" width="104" height="168" rx="18"/><rect class="scr" x="6" y="6" width="92" height="156" rx="13"/>
          ${ios ? '<rect class="cam" x="40" y="11" width="24" height="7" rx="3.5"/>' : '<circle class="cam" cx="52" cy="15" r="3.5"/>'}
          <g transform="translate(6 6)"><g class="ui">${screen}</g></g>
        </g></g>
        <text class="pl" x="${x + 52}" y="206">${label}</text>`;
      return `<svg ${VB} class="rnx">
        <path class="ln" d="M208 98H140"/><path class="ln" d="M332 98H400"/>
        ${phone(30, true, 'iOS')}${phone(406, false, 'Android')}
        <text class="one" x="270" y="46">${esc(t.one)}</text>
        <g transform="translate(270 98)"><g class="app"><rect x="-62" y="-22" width="124" height="44" rx="22"/><text y="8">&lt;App/&gt;</text></g></g>
        <g transform="translate(270 152)"><g class="set"><rect x="-68" y="-18" width="136" height="36" rx="18"/><text y="7">setTab(1)</text></g></g>
        <circle class="dt" cx="208" cy="98" r="7"/><circle class="dt" cx="332" cy="98" r="7"/>
      </svg>`;
    },
    play(D, el, T) {
      const { tl } = D, $ = s => D.$(s, el), $$ = s => D.$$(s, el);
      const ph = $$('.ph'), app = $('.app'), set = $('.set'), dt = $$('.dt');
      gsap.set([...ph, app, set, ...dt], { transformOrigin: '50% 50%' });
      gsap.set([...$$('.t2'), ...$$('.l2'), ...dt, ...ph, app, set, $('.one')], { opacity: 0 });
      gsap.set($$('.ln'), { drawSVG: '0%' });
      gsap.set($$('.ui'), { clipPath: 'inset(0% 0% 100% 0%)' });
      // one component, two phones
      D.hit(ph, { opacity: 0, scale: 0.92, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'expo.out' }, T);
      D.hit(app, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.2)' }, T + 0.12);
      D.hit($('.one'), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, T + 0.2);
      D.hit($$('.ln'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.3, ease: 'power2.out' }, T + 0.3);
      // both screens render the same UI at once
      D.hit($$('.ui'), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45, ease: 'power2.inOut' }, T + 0.45);
      // setTab(1): the change reaches both phones and both switch tab
      D.hit(set, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power3.out' }, T + 0.95);
      D.hit(dt, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.15 }, T + 1.05);
      tl.to(dt[0], { attr: { cx: 146 }, duration: 0.28, ease: 'power2.in' }, T + 1.12);
      tl.to(dt[1], { attr: { cx: 394 }, duration: 0.28, ease: 'power2.in' }, T + 1.12);
      tl.to(dt, { opacity: 0, duration: 0.1 }, T + 1.4);
      tl.to($$('.ind'), { x: 28, duration: 0.32, ease: 'power3.inOut' }, T + 1.4);
      tl.to([...$$('.l1'), ...$$('.t1')], { opacity: 0, x: -10, duration: 0.18, ease: 'power2.in' }, T + 1.4);
      D.hit([...$$('.l2'), ...$$('.t2')], { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.32, ease: 'power3.out' }, T + 1.52);
      D.sfx('tick', T + 1.42, 0.03);
    },
  });

  // Tailwind — utility classes are typed one by one and the button restyles live with each one.
  add('tailwind', {
    text: { es: { name: 'Tailwind', note: 'En el trabajo y en Eclipse', btn: 'Comprar' }, en: { name: 'Tailwind', note: 'At work and in Eclipse', btn: 'Buy now' } },
    html: t => {
      const C = [['bg-sky-500', '#0ea5e9'], ['text-white', '#ffffff'], ['px-6 py-3'], ['rounded-full'], ['shadow-lg']];
      return `<div class="twx">
        <div class="l0">&lt;button <i>class="</i></div>
        ${C.map(([c, sw], i) => `<div class="cl" style="top:${48 + i * 32}px">${sw ? `<b class="sw" style="background:${sw}"></b>` : ''}<span>${c}${i === C.length - 1 ? '<i>"&gt;</i>' : ''}</span></div>`).join('')}
        <div class="view"><div class="btn">
          <div class="sh"></div><div class="bg"></div><div class="out"></div>
          <div class="tx"><span>${esc(t.btn)}</span></div><div class="tx wt"><span>${esc(t.btn)}</span></div>
        </div></div>
      </div>`;
    },
    play(D, el, T) {
      const { tl } = D, $ = s => D.$(s, el), $$ = s => D.$$(s, el);
      const lines = $$('.cl span'), sw = $$('.sw'), bg = $('.bg'), btn = $('.btn');
      const box = (y, x, r) => `inset(${y}px ${x}px ${y}px ${x}px round ${r}px)`;
      const ix = Math.max(8, Math.round((btn.offsetWidth - $('.tx span').offsetWidth) / 2) - 6);
      gsap.set($('.out'), { left: ix, right: ix });
      gsap.set(lines, { clipPath: 'inset(0% 100% 0% 0%)' });
      gsap.set(bg, { clipPath: box(14, ix, 0), opacity: 0 });
      gsap.set([$('.sh'), $('.tx.wt')], { opacity: 0 });
      gsap.set(sw, { scale: 0 });
      // each class is typed, then applied
      lines.forEach((s, i) => type(D, s, s.textContent.length, T + 0.06 + i * 0.3, 48));
      const fx = i => T + 0.3 + i * 0.3;
      tl.to(sw[0], { scale: 1, duration: 0.2, ease: 'back.out(3)' }, fx(0) - 0.04);
      tl.to(bg, { opacity: 1, duration: 0.2 }, fx(0)); // bg-sky-500
      tl.to($('.out'), { opacity: 0, duration: 0.2 }, fx(0));
      tl.to(sw[1], { scale: 1, duration: 0.2, ease: 'back.out(3)' }, fx(1) - 0.04);
      tl.to($('.tx.wt'), { opacity: 1, duration: 0.2 }, fx(1)); // text-white
      tl.to(bg, { clipPath: box(0, 0, 0), duration: 0.32, ease: 'expo.out' }, fx(2)); // px-6 py-3
      tl.to(bg, { clipPath: box(0, 0, 30), duration: 0.32, ease: 'expo.out' }, fx(3)); // rounded-full
      tl.to($('.sh'), { opacity: 1, duration: 0.3, ease: 'power2.out' }, fx(4)); // shadow-lg: the button lifts
      tl.to(btn, { y: -4, duration: 0.3, ease: 'power2.out' }, fx(4));
      D.sfx('tick', fx(4), 0.03);
    },
  });

  // Node.js — a request reaches an Express server, the event loop turns, and a JSON 200 comes back.
  add('node', {
    text: { es: { name: 'Node.js', note: 'Express y Prisma en Eclipse', loop: 'event loop' }, en: { name: 'Node.js', note: 'Express and Prisma in Eclipse', loop: 'event loop' } },
    html: t => `<svg ${VB} class="nd">
      <g class="req"><rect x="16" y="18" width="236" height="44" rx="22"/><text x="34" y="47"><tspan class="m">GET</tspan> /api/projects</text></g>
      <path class="lane l1" d="M262 40H374"/><path class="hd h1" d="M366 33l8 7-8 7"/>
      <path class="lane l2" d="M374 96H262"/><path class="hd h2" d="M270 89l-8 7 8 7"/>
      <circle class="pk p1" cx="262" cy="40" r="6"/><circle class="pk p2" cx="374" cy="96" r="6"/>
      <rect class="srv" x="384" y="16" width="140" height="194" rx="16"/>
      <text class="ex" x="454" y="50">Express</text>
      <circle class="trk" cx="454" cy="120" r="34"/><circle class="arc" cx="454" cy="120" r="34" transform="rotate(-90 454 120)"/>
      <g class="orb"><circle cx="454" cy="86" r="6"/></g>
      <text class="lp" x="454" y="194">${esc(t.loop)}</text>
      <g class="res"><rect x="16" y="74" width="236" height="44" rx="22"/><text x="34" y="103"><tspan class="m">200</tspan> OK · JSON</text></g>
      <g class="js"><rect x="16" y="130" width="236" height="80" rx="12"/>
        <text x="32" y="162"><tspan class="p">[{ </tspan><tspan class="k">"id"</tspan><tspan class="p">: </tspan><tspan class="nu">1</tspan><tspan class="p">, … },</tspan></text>
        <text x="43.4" y="192"><tspan class="p">{ </tspan><tspan class="k">"id"</tspan><tspan class="p">: </tspan><tspan class="nu">2</tspan><tspan class="p">, … }]</tspan></text></g>
    </svg>`,
    play(D, el, T) {
      const { tl } = D, $ = s => D.$(s, el), p1 = $('.p1'), p2 = $('.p2'), res = $('.res'), js = $('.js');
      const srv = [$('.srv'), $('.ex'), $('.trk'), $('.lp')];
      gsap.set([p1, p2, res, $('.req'), ...srv, $('.orb')], { opacity: 0 });
      gsap.set([$('.arc'), $('.l1'), $('.h1'), $('.l2'), $('.h2')], { drawSVG: '0%' });
      gsap.set(js, { clipPath: 'inset(0% 0% 100% 0%)' });
      gsap.set(res, { transformOrigin: '50% 50%' });
      // the request leaves for the server
      D.hit($('.req'), { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power3.out' }, T);
      D.hit(srv, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.04 }, T + 0.05);
      tl.to($('.l1'), { drawSVG: '100%', duration: 0.22, ease: 'power2.out' }, T + 0.22);
      tl.to($('.h1'), { drawSVG: '100%', duration: 0.12 }, T + 0.4);
      tl.set(p1, { opacity: 1 }, T + 0.36);
      tl.to(p1, { attr: { cx: 374 }, duration: 0.28, ease: 'power2.in' }, T + 0.36);
      tl.set(p1, { opacity: 0 }, T + 0.64);
      // the event loop turns once: the handler awaits, the callback comes back
      tl.set($('.srv'), { attr: { class: 'srv on' } }, T + 0.64);
      tl.set($('.orb'), { opacity: 1 }, T + 0.64);
      D.hit($('.orb'), { rotation: 0, svgOrigin: '454 120' }, { rotation: 360, duration: 0.6, ease: 'power1.inOut' }, T + 0.64);
      tl.to($('.arc'), { drawSVG: '100%', duration: 0.6, ease: 'power1.inOut' }, T + 0.64);
      // the response flies back: 200 and the JSON body
      tl.to($('.l2'), { drawSVG: '100%', duration: 0.2, ease: 'power2.out' }, T + 1.2);
      tl.to($('.h2'), { drawSVG: '100%', duration: 0.12 }, T + 1.36);
      tl.set(p2, { opacity: 1 }, T + 1.28);
      tl.to(p2, { attr: { cx: 262 }, duration: 0.26, ease: 'power2.out' }, T + 1.28);
      tl.set(p2, { opacity: 0 }, T + 1.54);
      D.hit(res, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, T + 1.48);
      D.hit(js, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.32, ease: 'power2.out' }, T + 1.58);
      D.sfx('tick', T + 1.5, 0.03);
    },
  });

  // SQL — a query is written; the rows that don't match drop out and the rest sort into the result.
  add('sql', {
    text: {
      es: { name: 'SQL', note: 'PostgreSQL en Eclipse', rows: 'mate,yerba,termo,vaso,taza', result: '3 filas' },
      en: { name: 'SQL', note: 'PostgreSQL in Eclipse', rows: 'mug,tea,kettle,glass,cup', result: '3 rows' },
    },
    html: t => {
      const P = [12, 8, 30, 6, 10], S = [4, 0, 2, 9, 0], Q = [
        '<tspan class="k">SELECT</tspan> name, price', '<tspan class="k">FROM</tspan> products',
        '<tspan class="k">WHERE</tspan> stock &gt; <tspan class="nu">0</tspan>', '<tspan class="k">ORDER BY</tspan> price;',
      ];
      const rw = Math.round(46 + t.result.length * 12 + 18);
      return `<svg ${VB} class="sq">
        <rect class="hl" x="12" y="91" width="238" height="32" rx="6"/>
        ${Q.map((q, i) => `<text class="q" x="22" y="${46 + i * 34}">${q}</text>`).join('')}
        <g transform="translate(16 170)"><g class="res"><rect width="${rw}" height="40" rx="20"/><path d="M16 20l6 6 12-12"/><text x="44" y="27">${esc(t.result)}</text></g></g>
        <rect class="tbl" x="258" y="16" width="266" height="194" rx="12"/>
        <text class="th" x="274" y="42">name</text><text class="th hp" x="432" y="42">price</text><text class="th hs" x="508" y="42">stock</text>
        <path class="sep" d="M258 54H524"/>
        ${t.rows.split(',').map((n, i) => `<g transform="translate(0 ${77 + i * 30})"><g class="row">
          <text x="274" y="0">${esc(n)}</text><text class="pr" x="432" y="0">${P[i]}</text><text class="${S[i] ? 'st' : 'st z'}" x="508" y="0">${S[i]}</text></g></g>`).join('')}
      </svg>`;
    },
    play(D, el, T) {
      const { tl } = D, $ = s => D.$(s, el), $$ = s => D.$$(s, el), q = $$('.q'), rows = $$('.row'), hl = $('.hl'), res = $('.res');
      gsap.set(q, { clipPath: 'inset(0% 100% 0% 0%)' });
      gsap.set([hl, res, ...rows], { opacity: 0 });
      // the query is written, the table is there
      q.forEach((l, i) => type(D, l, [18, 13, 15, 15][i], T + i * 0.16, 90));
      D.hit(rows, { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: 'power3.out' }, T);
      // WHERE stock > 0: the rows with no stock drop out
      D.hit(hl, { opacity: 0 }, { opacity: 1, duration: 0.15 }, T + 0.72);
      tl.set($('.hs'), { attr: { class: 'th hs on' } }, T + 0.72);
      tl.set($$('.z'), { attr: { class: 'st z on' } }, T + 0.76);
      tl.to([rows[1], rows[4]], { opacity: 0, x: 24, duration: 0.28, ease: 'power2.in' }, T + 0.92);
      // ORDER BY price: the rest sort
      tl.to(hl, { y: 34, duration: 0.25, ease: 'power3.inOut' }, T + 1.2);
      tl.set($('.hs'), { attr: { class: 'th hs' } }, T + 1.2);
      tl.set($('.hp'), { attr: { class: 'th hp on' } }, T + 1.2);
      tl.to(rows[3], { y: -90, duration: 0.45, ease: 'power3.inOut' }, T + 1.28);
      tl.to(rows[3], { keyframes: [{ x: 14, duration: 0.2, ease: 'power2.out' }, { x: 0, duration: 0.25, ease: 'power2.in' }] }, T + 1.28);
      tl.to(rows[0], { y: 30, duration: 0.45, ease: 'power3.inOut' }, T + 1.28);
      D.hit(res, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power3.out' }, T + 1.62);
      D.sfx('tick', T + 1.64, 0.03);
    },
  });

  // CI/CD — a commit runs the pipeline: commit → build → test → deploy, each stage spins, then checks.
  add('cicd', {
    text: {
      es: { name: 'CI/CD', note: 'Pipelines y despliegues', msg: 'feat: carrito', stages: 'commit,build,test,deploy', run: 'en curso', done: 'desplegado' },
      en: { name: 'CI/CD', note: 'Pipelines and deploys', msg: 'feat: cart', stages: 'commit,build,test,deploy', run: 'running', done: 'deployed' },
    },
    html: t => {
      const X = [64, 196, 328, 460], S = t.stages.split(',');
      const cw = Math.round(58 + (8 + t.msg.length) * 11.4 + 16), rw = Math.round(44 + t.run.length * 11.4 + 18), dw = Math.round(44 + t.done.length * 11.4 + 18);
      return `<svg ${VB} class="ci">
        <g class="cm"><rect x="16" y="16" width="${cw}" height="40" rx="20"/><circle cx="40" cy="36" r="6"/><path d="M28 36h6M46 36h6"/>
          <text x="60" y="43"><tspan class="h">a3f9c2e</tspan> ${esc(t.msg)}</text></g>
        <g transform="translate(524 36)">
          <g class="st run"><rect x="${-rw}" y="-20" width="${rw}" height="40" rx="20"/><circle class="sp" cx="${-rw + 24}" cy="0" r="8"/><text x="${-rw + 42}" y="7">${esc(t.run)}</text></g>
          <g class="st done"><rect x="${-dw}" y="-20" width="${dw}" height="40" rx="20"/><path d="M${-dw + 17} 0l6 6 11-12"/><text x="${-dw + 42}" y="7">${esc(t.done)}</text></g>
        </g>
        <path class="rail" d="M64 124H460"/><path class="prog" d="M64 124H460"/>
        ${X.map((x, i) => `<g transform="translate(${x} 124)"><g class="nd">
          <circle class="base" r="26"/><circle class="idle" r="5"/><circle class="spin" r="26"/>
          <circle class="ok" r="28"/><path class="ck" d="M-11 1l7 7 15-15"/></g></g>
          <text class="lb" x="${x}" y="184">${esc(S[i])}</text>`).join('')}
      </svg>`;
    },
    play(D, el, T) {
      const { tl } = D, $ = s => D.$(s, el), $$ = s => D.$$(s, el);
      const nd = $$('.nd'), spin = $$('.spin'), ok = $$('.ok'), ck = $$('.ck'), lb = $$('.lb'), idle = $$('.idle'), run = $('.run'), done = $('.done');
      gsap.set([...nd, ...ok, ...spin, run, done], { transformOrigin: '50% 50%' });
      gsap.set(spin, { drawSVG: '0% 0%' });
      gsap.set(ok, { scale: 0 });
      gsap.set([...ck, $('.prog'), $('.rail')], { drawSVG: '0%' });
      gsap.set([$('.cm'), run, done, ...nd], { opacity: 0 });
      gsap.set($('.sp'), { drawSVG: '0% 70%' });
      // the commit enters the pipeline
      D.hit($('.cm'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power3.out' }, T);
      tl.to($('.rail'), { drawSVG: '100%', duration: 0.45, ease: 'power2.inOut' }, T + 0.05);
      D.hit(nd, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)', stagger: 0.06 }, T + 0.05);
      D.hit(run, { opacity: 0 }, { opacity: 1, duration: 0.2 }, T + 0.2);
      tl.to($('.sp'), { rotation: 900, duration: 1.4, ease: 'none' }, T + 0.2);
      const pass = (i, at) => {
        tl.set(idle[i], { opacity: 0 }, at);
        tl.to(ok[i], { scale: 1, duration: 0.22, ease: 'back.out(2.2)' }, at);
        tl.to(ck[i], { drawSVG: '100%', duration: 0.18, ease: 'power2.out' }, at + 0.08);
        tl.set(lb[i], { attr: { class: 'lb on' } }, at);
      };
      pass(0, T + 0.36);
      // each stage runs (spinner) and passes (check); the green line advances
      [1, 2, 3].forEach(i => {
        const s = T + 0.42 + (i - 1) * 0.4;
        tl.to($('.prog'), { drawSVG: `${(i / 3) * 100}%`, duration: 0.16, ease: 'power1.inOut' }, s);
        tl.set(idle[i], { opacity: 0 }, s + 0.1);
        D.hit(spin[i], { drawSVG: '0% 28%', rotation: 0 }, { rotation: 300, duration: 0.3, ease: 'none' }, s + 0.1);
        pass(i, s + 0.34);
      });
      // deployed
      tl.to(run, { opacity: 0, duration: 0.15 }, T + 1.6);
      D.hit(done, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, T + 1.62);
      D.sfx('tick', T + 1.62, 0.035);
    },
  });

  // RAG — a question retrieves three passages ranked by relevance; the answer is written citing the two that matter.
  add('rag', {
    text: {
      es: { name: 'RAG con LLM', note: 'CompliA, en producción interna', q: '¿Plazo para devolver un producto?', docs: 'devoluciones.md,garantia.pdf,envios.md', a: 'Tenés 30 días desde la entrega.' },
      en: { name: 'RAG con LLM', note: 'CompliA, in internal production', q: 'How long do I have to return it?', docs: 'returns.md,warranty.pdf,shipping.md', a: 'You have 30 days from delivery.' },
    },
    html: t => {
      const V = [0.92, 0.81, 0.34];
      return `<div class="rg">
        <div class="q">${esc(t.q)}</div>
        ${t.docs.split(',').map((d, i) => `<div class="ch" style="top:${66 + i * 30}px"><b>[${i + 1}]</b><span>${esc(d)}</span><i><u style="width:${V[i] * 100}%"></u></i><em>${V[i].toFixed(2)}</em></div>`).join('')}
        <div class="a"><p>${t.a.split(' ').map(w => `<span>${esc(w)}</span>`).join(' ')}<b>[1]</b><b>[2]</b></p></div>
      </div>`;
    },
    play(D, el, T) {
      const { tl } = D, $ = s => D.$(s, el), $$ = s => D.$$(s, el);
      const rows = $$('.ch'), bars = $$('.ch u'), sc = $$('.ch em'), w = $$('.a span'), ci = $$('.a b');
      gsap.set([$('.q'), ...rows, $('.a'), ...w, ...ci], { opacity: 0 });
      gsap.set(bars, { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set($('.q'), { transformOrigin: '100% 100%' });
      // the question
      D.hit($('.q'), { opacity: 0, y: 10, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' }, T);
      // retrieval: three passages, ranked by relevance
      D.hit(rows, { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.08, ease: 'power3.out' }, T + 0.3);
      D.hit(bars, { scaleX: 0 }, { scaleX: 1, duration: 0.5, stagger: 0.08, ease: 'expo.out' }, T + 0.38);
      sc.forEach((s, i) => tl.to(s, { duration: 0.4, scrambleText: { text: s.textContent, chars: '0123456789', speed: 1 }, ease: 'none' }, T + 0.38 + i * 0.08));
      // the top two are kept, the third falls back
      tl.set([rows[0], rows[1]], { attr: { class: 'ch on' } }, T + 0.98);
      tl.to(rows[2], { opacity: 0.4, duration: 0.25 }, T + 0.98);
      // the answer is written, then cites its sources
      D.hit($('.a'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, T + 1.04);
      D.hit(w, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.2, stagger: 0.055, ease: 'power2.out' }, T + 1.08);
      D.hit(ci, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.28, stagger: 0.09, ease: 'back.out(2.4)' }, T + 1.5);
      D.sfx('tick', T + 1.52, 0.03);
    },
  });
})();
