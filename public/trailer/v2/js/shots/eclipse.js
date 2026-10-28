/* Act 5 shots — eclipse group (contract in js/ig-shots.js). Three real components, rebuilt in code:
     eclipse-landing  Eclipse-Web · the hero (components/hero: Eclipse.tsx layers + hero.css, Dial.tsx, HeroCopy,
                      messages hero.* · header.*), «Efemérides» tokens from app/globals.css
     eclipse-portal   Eclipse-Web · client portal «Mis proyectos» in demo mode (components/portal: ProjectsTable,
                      StageMark, StageTimeline, DemoNotice · lib/portal/fixtures.ts · messages portal.*)
     eclipse-ops      Eclipse-internal-portal · Prospectos (src/app.js renderProspectos, src/rules.js
                      prospectNextAction, sample data from src/data/seed.js; no proposal amounts)
   Fonts: Instrument Serif, Geist and Geist Mono (OFL, the repos' own files) in /trailer/fonts/eclipse. */
(() => {
  'use strict';
  const { add } = Trailer.igShots;
  // the portal's URL carries the language (same rule as main.js); 'es' outside a browser (unit tests)
  const LANG = typeof location !== 'undefined' && new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'es';
  // Start the faces now: the engine waits for document.fonts.ready before it builds (SplitText measures then).
  if (typeof document !== 'undefined' && document.fonts) {
    ['400 100px "Eclipse Serif"', 'italic 400 100px "Eclipse Serif"', '400 24px "Eclipse Sans"', '600 24px "Eclipse Sans"', '400 20px "Eclipse Mono"']
      .forEach(f => document.fonts.load(f).catch(() => {}));
  }

  // fixed pseudo-random (no Math.random: every frame must be reproducible)
  const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const f2 = n => n.toFixed(2);

  // ── the brand glyph (components/ui/PhaseGlyph.tsx): the sun (r 8 in a 24 box) and a moon of the same radius
  // d = (1 − phase)·16 to its right. Drawn as a mask so the moon itself can move (a transform on .ec-moon).
  // At totality: the corona ring and the diamond-ring glint.
  let gid = 0;
  const moonX = phase => (1 - phase) * 16;
  function glyph(phase, size, cls = '') {
    const id = `ec-gm${++gid}`, total = phase > 0.985;
    return `<svg class="ec-glyph ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">
      <defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-6" y="-6" width="36" height="36"><rect x="-6" y="-6" width="36" height="36" fill="#fff"/><circle class="ec-moon" cx="12" cy="12" r="8.25" fill="#000" transform="translate(${f2(moonX(phase))} 0)"/></mask></defs>
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-opacity=".3" stroke-width="1"/>
      <circle class="ec-sun" cx="12" cy="12" r="8" fill="currentColor" mask="url(#${id})"/>
      ${total ? `<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="1"/><circle cx="${f2(12 + 9 * 0.7071)}" cy="${f2(12 - 9 * 0.7071)}" r="1.6" fill="currentColor"/>` : ''}
    </svg>`;
  }
  // the header logo at the top of the page (components/layout/MiniEclipse.tsx at progress 0): totality
  const miniEclipse = size => `<svg class="ec-mini" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">
    <defs><radialGradient id="ec-mini-glow" cx="50%" cy="50%" r="50%"><stop offset="40%" stop-color="#FFE8B0" stop-opacity=".85"/><stop offset="62%" stop-color="#F5B942" stop-opacity=".4"/><stop offset="100%" stop-color="#F5B942" stop-opacity="0"/></radialGradient></defs>
    <circle cx="12" cy="12" r="12" fill="url(#ec-mini-glow)" opacity=".12"/>
    <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" stroke-opacity=".28" stroke-width=".75"/>
    <circle cx="12" cy="12" r="8.6" fill="none" stroke="#F5B942" stroke-width=".9"/>
    <circle cx="16.95" cy="7.05" r="1.35" fill="#FFF8E6"/><path d="M16.95 3.6v6.9M13.5 7.05h6.9" stroke="#FFF8E6" stroke-width=".5" stroke-linecap="round" opacity=".85"/>
  </svg>`;
  // Lucide icons, thin stroke (the repos use lucide-react / the same paths inline)
  const ICON = {
    plus: '<path d="M5 12h14M12 5v14"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    help: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24"/>',
  };
  const icon = (name, size, cls = '') => `<svg class="ec-ico ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;

  // =========================================================================================== 1 · LANDING
  // The hero at 1440×816 (the site's own side-by-side layout, closer): copy column on the left, THE eclipse on
  // the right inside its dial. Eclipse.tsx's CSS layers (glow, conic rays, inner ring, sun, moon) + an SVG of
  // streamers for the corona the site draws in WebGL; the dial from Dial.tsx (2° ticks, 7 rubro positions,
  // the pointer at 45° where the diamond ring fires).
  const EX = 1110, EY = 446, S = 560, R = S * 0.21; // centre, eclipse square, disc radius (disc = 42 %)
  const LIMB = { x: EX + R * 0.7071, y: EY - R * 0.7071 }; // upper-right limb, under the dial's pointer

  function stars() {
    let s = '';
    for (let i = 0; i < 110; i++) {
      const x = hash(i) * 1440, y = 70 + hash(i + 500) * 746, r = 0.5 + hash(i + 900) ** 3 * 1.4, o = 0.18 + hash(i + 1300) * 0.5;
      if (Math.hypot(x - EX, y - EY) < R * 1.5 || (x > 70 && x < 800 && y > 90 && y < 700)) continue; // clear of the disc and the copy
      s += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="#F4EFE6" opacity="${f2(o)}"/>`;
    }
    return `<svg class="el-stars" viewBox="0 0 1440 816" aria-hidden="true">${s}</svg>`;
  }
  function corona() {
    const M = S * 0.68; // half the box of the streamers
    let rays = '';
    for (let i = 0; i < 168; i++) {
      const a = (i / 168) * Math.PI * 2 + (hash(i + 40) - 0.5) * 0.05;
      const k = hash(i + 7), streamer = i % 21 === 4 || i % 29 === 11;
      const r0 = R * 0.97, r1 = R * (streamer ? 2.25 + k * 0.5 : 1.22 + k * k * 0.95);
      const w = (streamer ? 3.2 : 1.1 + hash(i + 77) * 2.6).toFixed(2), o = (streamer ? 0.75 : 0.22 + hash(i + 120) * 0.55).toFixed(2);
      rays += `<line x1="${f2(Math.cos(a) * r0)}" y1="${f2(Math.sin(a) * r0)}" x2="${f2(Math.cos(a) * r1)}" y2="${f2(Math.sin(a) * r1)}" stroke-width="${w}" stroke-opacity="${o}"/>`;
    }
    const pct = r => `${((r / M) * 100).toFixed(1)}%`;
    return `<svg class="el-corona" viewBox="${-M} ${-M} ${2 * M} ${2 * M}" aria-hidden="true">
      <defs>
        <radialGradient id="ec-ray" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${M}">
          <stop offset="${pct(R * 0.96)}" stop-color="#FFFAF0" stop-opacity="1"/>
          <stop offset="${pct(R * 1.2)}" stop-color="#FFE8B0" stop-opacity=".9"/>
          <stop offset="${pct(R * 1.6)}" stop-color="#F5B942" stop-opacity=".5"/>
          <stop offset="${pct(R * 2.3)}" stop-color="#F5B942" stop-opacity=".14"/>
          <stop offset="100%" stop-color="#F5B942" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="ec-inner" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${S * 0.28}">
          <stop offset="74%" stop-color="#FFF8E6" stop-opacity="1"/>
          <stop offset="79%" stop-color="#FFE8B0" stop-opacity=".95"/>
          <stop offset="86%" stop-color="#F5B942" stop-opacity=".55"/>
          <stop offset="94%" stop-color="#F5B942" stop-opacity=".15"/>
          <stop offset="100%" stop-color="#F5B942" stop-opacity="0"/>
        </radialGradient>
        <filter id="ec-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4"/></filter>
        <filter id="ec-softer" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
      </defs>
      <g stroke="url(#ec-ray)" stroke-linecap="round" filter="url(#ec-softer)" opacity=".8">${rays}</g>
      <g stroke="url(#ec-ray)" stroke-linecap="round" filter="url(#ec-soft)">${rays}</g>
      <circle r="${S * 0.28}" fill="url(#ec-inner)" opacity=".85"/>
    </svg>`;
  }
  function dial() {
    const RING = 48, BOX = 58, LABEL_R = 43.2;
    const polar = (r, deg) => { const a = ((deg - 90) * Math.PI) / 180; return [r * Math.cos(a), r * Math.sin(a)]; };
    const seg = (r0, r1, deg) => { const [x0, y0] = polar(r0, deg), [x1, y1] = polar(r1, deg); return `M${f2(x0)} ${f2(y0)}L${f2(x1)} ${f2(y1)}`; };
    let minor = '', medium = '';
    for (let deg = 0; deg < 360; deg += 2) { if (deg % 10 === 0) medium += seg(RING, RING - 2.6, deg); else minor += seg(RING, RING - 1.3, deg); }
    const N = 7, ang = i => (360 / N) * i;
    const major = Array.from({ length: N }, (_, i) => seg(RING + 0.6, RING - 4.6, ang(i))).join('');
    const cross = [0, 90, 180, 270].map(deg => seg(RING + 4.5, RING + 8, deg)).join('');
    const [px, py] = polar(RING + 4.4, 45);
    const labels = Array.from({ length: N }, (_, i) => {
      const [x, y] = polar(LABEL_R, ang(i));
      return `<span class="el-dial-n tex" style="left:${f2(50 + (x / (2 * BOX)) * 100)}%;top:${f2(50 + (y / (2 * BOX)) * 100)}%;transform:translate(-50%,-50%) rotate(${f2(ang(i))}deg)">${String(i + 1).padStart(2, '0')}</span>`;
    }).join('');
    return `<div class="el-dial">
      <div class="el-bezel"><svg viewBox="${-BOX} ${-BOX} ${2 * BOX} ${2 * BOX}" aria-hidden="true">
        <circle r="${RING}" class="el-d-ring"/><path d="${minor}" class="el-d-tick"/><path d="${medium}" class="el-d-mid"/><path d="${major}" class="el-d-major"/>
      </svg>${labels}</div>
      <svg class="el-dial-fixed" viewBox="${-BOX} ${-BOX} ${2 * BOX} ${2 * BOX}" aria-hidden="true">
        <path d="${cross}" class="el-d-cross"/><path d="${seg(RING - 5.5, RING + 2, 45)}" class="el-d-pointer"/>
        <rect x="${f2(px - 1.25)}" y="${f2(py - 1.25)}" width="2.5" height="2.5" transform="rotate(45 ${f2(px)} ${f2(py)})" class="el-d-diamond"/>
      </svg>
    </div>`;
  }

  add('eclipse-landing', {
    frame: 'browser', url: 'eclipse-business.com', bg: '#05050A', color: '#F5B942',
    text: {
      es: {
        brand: 'ECLIPSE', navServices: 'Servicios', navDemos: 'Demos', navPricing: 'Precios', navProcess: 'Cómo trabajamos',
        prefs: 'ES · ARS', login: 'Ingresar', headerCta: 'Potenciar mi negocio',
        index: '01', eyebrow: 'Desarrollo · IA · Automatización',
        h1: 'Potenciá y visibilizá <em>tu negocio</em>, y fidelizá clientes con Eclipse.',
        sub: 'Antes de hablar, te mostramos tu negocio funcionando: webs, sistemas y agentes de IA para negocios que no pueden esperar.',
        cta: 'Quiero potenciar mi negocio',
      },
      en: {
        brand: 'ECLIPSE', navServices: 'Services', navDemos: 'Demos', navPricing: 'Pricing', navProcess: 'How we work',
        prefs: 'EN · USD', login: 'Log in', headerCta: 'Boost my business',
        index: '01', eyebrow: 'Development · AI · Automation',
        h1: 'Boost <em>your business</em>, get it seen and win loyal customers with Eclipse.',
        sub: "Before we talk, we show you your business working: websites, systems and AI agents for businesses that can't wait.",
        cta: 'I want to boost my business',
      },
    },
    html: t => `${stars()}
      <header class="el-hdr tex">
        <span class="el-logo">${miniEclipse(30)}<b>${t.brand}</b></span>
        <nav class="el-nav"><span>${t.navServices}</span><span>${t.navDemos}</span><span>${t.navPricing}</span><span>${t.navProcess}</span></nav>
        <span class="el-tools"><span class="el-prefs">${icon('globe', 18)}<span>${t.prefs}</span>${icon('chev', 16)}</span><span class="el-login">${icon('login', 18)}${t.login}</span><i class="el-vsep"></i><span class="el-hcta">${t.headerCta}</span></span>
      </header>
      <div class="el-copy">
        <p class="el-mark tex"><span class="el-mark-i">${t.index}</span><i class="el-mark-rule"></i>${glyph(1, 20, 'el-mark-g')}<span>${t.eyebrow}</span></p>
        <h1 class="el-h1">${t.h1}</h1>
        <p class="el-sub">${t.sub}</p>
        <span class="el-cta"><span>${t.cta}</span><i class="el-glint"></i></span>
      </div>
      <div class="el-eclipse">
        <div class="el-glow"></div>
        <div class="el-lit">${corona()}<div class="el-rays"></div></div>
        <div class="el-sun"></div>
        <div class="el-moon"></div>
        ${dial()}
        <div class="el-ring" style="left:${f2(S / 2 + R * 0.7071 - 130)}px;top:${f2(S / 2 - R * 0.7071 - 130)}px"><i class="el-ring-bloom"></i><i class="el-ring-h"></i><i class="el-ring-v"></i><i class="el-ring-dot"></i></div>
      </div>`,
    play(D, v, T, dur) {
      const { tl } = D;
      const q = s => v.querySelector(s);
      const h1 = q('.el-h1');
      // the H1 keeps three lines in its column (en is longer): shrink it before the split measures it
      let fs = parseFloat(getComputedStyle(h1).fontSize);
      while (h1.offsetHeight > fs * 0.98 * 3.3 && fs > 70) { fs -= 2; h1.style.fontSize = fs + 'px'; }
      const words = D.split(h1, { type: 'words', mask: 'words' }).words;
      const moon = q('.el-moon'), lit = q('.el-lit'), glow = q('.el-glow'), ring = q('.el-ring'), bezel = q('.el-bezel');
      const cta = q('.el-cta'), glint = q('.el-glint');
      // start: the moon is still sliding in from the lower left (MOON_DIR), the sun peeks at the upper right
      const off = R * 1.05 * 0.7071;
      tl.set(moon, { x: -off, y: off }, T);
      // lite (tablets, phones): the corona only brightens and the dial holds still — with no layers, scaling and turning
      // those conic gradients re-rastered the whole eclipse on every frame of the cut (on desktop Chromium gives the
      // moving corona a layer of its own, and holding it still made the cut slower there: measured, so desktop keeps it)
      tl.set(lit, { opacity: 0.12, scale: D.lite ? 1 : 0.9 }, T);
      tl.set(bezel, { rotation: D.lite ? 0 : -14 }, T);
      tl.set(glow, { opacity: 0.35 }, T);
      tl.set(ring, { opacity: 0, scale: 0.2 }, T);
      tl.set(words, { yPercent: 110 }, T);
      tl.set([q('.el-mark'), q('.el-sub')], { opacity: 0, y: 14 }, T);
      tl.set(cta, { opacity: 0, y: 18 }, T);
      tl.set(glint, { x: 0, opacity: 0 }, T);
      // 1 · totality: the moon slides home, the corona lights up, the bezel settles
      tl.to(moon, { x: 0, y: 0, duration: 0.72, ease: 'power3.inOut' }, T + 0.04);
      tl.to(lit, { opacity: 1, ...(D.lite ? {} : { scale: 1 }), duration: 0.6, ease: 'power2.out' }, T + 0.5);
      if (!D.lite) tl.to(bezel, { rotation: 0, duration: 1.1, ease: 'expo.out' }, T + 0.05);
      tl.to(glow, { opacity: 1, duration: 0.6, ease: 'power2.out' }, T + 0.5);
      // 2 · the diamond ring fires at the limb, under the dial's pointer, and settles to a glint
      tl.to(ring, { opacity: 1, scale: 1.25, duration: 0.16, ease: 'power2.out' }, T + 0.66);
      tl.to(ring, { scale: 1, opacity: 0.9, duration: 0.5, ease: 'power2.out' }, T + 0.82);
      D.sfx('zap', T + 0.66, 0.05);
      // 3 · the H1 rises word by word, then the line under it and the CTA
      tl.to(words, { yPercent: 0, duration: 0.6, ease: 'expo.out', stagger: 0.03 }, T + 0.12);
      tl.to(q('.el-mark'), { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, T + 0.1);
      tl.to(q('.el-sub'), { opacity: 1, y: 0, duration: 0.55, ease: 'expo.out' }, T + 0.36);
      tl.to(cta, { opacity: 1, y: 0, duration: 0.55, ease: 'expo.out' }, T + 0.44);
      // 4 · the CTA's glint runs along its upper rim (the .btn-primary sparkle), once
      const run = cta.offsetWidth - 40;
      tl.to(glint, { keyframes: [{ opacity: 1, duration: 0.1 }, { opacity: 1, duration: 0.3 }, { opacity: 0, duration: 0.12 }], ease: 'none' }, T + 0.86);
      tl.to(glint, { x: run, duration: 0.52, ease: 'power2.inOut' }, T + 0.86);
      void dur;
    },
  });

  // =========================================================================================== 2 · CLIENT PORTAL
  // «Mis proyectos» (demo mode, fixtures of lib/portal/fixtures.ts): the demo notice, «Hola, Lucía.», the project's
  // Cronograma (StageTimeline: the five stages, each with its phase) and the ledger (ProjectsTable). The website
  // project moves from 2 de 5 · Construcción to 3 de 5 · Revisión de Eclipse: its moon slides, the stage scrambles,
  // the rail's hairline draws.
  // StageTimeline's rail: glyph i at x = i·116 (50 px), the axis leaves each mark toward the next one
  const SEG = i => `M${i * 116 + 58} 25H${(i + 1) * 116 - 8}`;
  const rail = t => `<div class="ep-tl"><p class="ep-tl-cap tex"><span>${t.timeline}</span><span class="ep-tl-code">${t.p1Code}</span></p>
    <div class="ep-railbox"><svg class="ep-rail-line" viewBox="0 0 580 50" width="580" height="50" aria-hidden="true">
      <path class="ep-seg ep-seg-done" d="${SEG(0)}"/><path class="ep-seg ep-seg-dash" d="${SEG(1)}"/><path class="ep-seg ep-seg-done ep-seg-new" d="${SEG(1)}"/>
      <path class="ep-seg ep-seg-rest ep-seg-34" d="${SEG(2)}"/><path class="ep-seg ep-seg-dash ep-seg-dash2" d="${SEG(2)}"/><path class="ep-seg ep-seg-rest" d="${SEG(3)}"/>
    </svg>
    <ol class="ep-rail">${[0, 1, 2, 3, 4].map(i => `<li class="ep-step" data-i="${i}">
      <span class="ep-step-g"><i class="ep-halo ep-halo-${i + 1}"></i>${glyph((i + 1) / 5, 50, 'ep-g-base')}${glyph((i + 1) / 5, 50, 'ep-g-ink')}${glyph((i + 1) / 5, 50, 'ep-g-amber')}</span>
      <span class="ep-step-n tex">${t[`pos${i + 1}`]}</span></li>`).join('')}</ol></div></div>`;

  add('eclipse-portal', {
    frame: 'browser', url: `eclipse-business.com/${LANG}/portal/proyectos/`, bg: '#F4EFE6', color: '#F5B942',
    text: {
      es: {
        brand: 'ECLIPSE', portal: 'Portal de clientes', navProjects: 'Mis proyectos', navExit: 'Salir de la demo', navBack: 'Volver al sitio', prefs: 'ES · ARS',
        badge: 'Demo', notice: 'Vista de demostración — datos ficticios; acceso real disponible cuando se implemente el backend.',
        crumbSite: 'Sitio', crumbPortal: 'Portal', crumbProjects: 'Mis proyectos', help: 'Ayuda',
        kicker: 'Mis proyectos', hello: 'Hola, Lucía.', company: 'Ferretería La Muestra · 4 proyectos con Eclipse',
        timeline: 'Cronograma', pos1: '1 de 5', pos2: '2 de 5', pos3: '3 de 5', pos4: '4 de 5', pos5: '5 de 5',
        colProject: 'Proyecto', colStage: 'Etapa actual', colMilestone: 'Próximo hito', colAction: 'Tu acción',
        p1Name: 'Sitio web de ejemplo', p1Item: 'Web multipágina', p1Code: 'DEMO-01',
        p1Pos: '2 de 5', p1Stage: 'Construcción', p1Short: 'Ejecución del alcance',
        p1PosNext: '3 de 5', p1StageNext: 'Revisión de Eclipse', p1ShortNext: 'QA interno',
        p1Milestone: 'Maqueta navegable de las 5 páginas', p1Meta: 'Eclipse · Desarrollo · fecha estimada', p1Date: '16 oct 2026',
        nothing: 'Nada pendiente de tu lado', working: 'Eclipse está trabajando',
        p2Name: 'Chatbot de consultas', p2Item: 'Chatbot IA (WhatsApp o web)', p2Code: 'DEMO-02',
        p2Pos: '4 de 5', p2Stage: 'Revisión del cliente', p2Short: 'Aprobación o decisión requerida',
        p2Milestone: 'Tu aprobación de las respuestas', p2Meta: 'Vos · fecha estimada', p2Date: '07 oct 2026',
        needs: 'Requiere tu acción', p2Action: 'Aprobar las respuestas del chatbot o pedir ajustes',
        p3Name: 'Recordatorios automáticos', p3Item: 'WhatsApp estándar (sin IA)', p3Code: 'DEMO-03',
        p3Pos: 'Después de la entrega', p3Stage: 'Soporte', p3Short: 'Solo con mantenimiento contratado',
        p3Milestone: 'Revisión de los envíos de octubre', p3Meta: 'Eclipse · Desarrollo · fecha estimada', p3Date: '02 nov 2026',
        support: 'Soporte activo',
      },
      en: {
        brand: 'ECLIPSE', portal: 'Client portal', navProjects: 'My projects', navExit: 'Exit the demo', navBack: 'Back to the site', prefs: 'EN · USD',
        badge: 'Demo', notice: 'Demo view — fictional data; real access will be available once the backend is built.',
        crumbSite: 'Site', crumbPortal: 'Portal', crumbProjects: 'My projects', help: 'Help',
        kicker: 'My projects', hello: 'Hi, Lucía.', company: 'Ferretería La Muestra · 4 projects with Eclipse',
        timeline: 'Timeline', pos1: '1 of 5', pos2: '2 of 5', pos3: '3 of 5', pos4: '4 of 5', pos5: '5 of 5',
        colProject: 'Project', colStage: 'Current stage', colMilestone: 'Next milestone', colAction: 'Your action',
        p1Name: 'Example website', p1Item: 'Multi-page website', p1Code: 'DEMO-01',
        p1Pos: '2 of 5', p1Stage: 'Build', p1Short: 'Scope in progress',
        p1PosNext: '3 of 5', p1StageNext: 'Eclipse review', p1ShortNext: 'Internal QA',
        p1Milestone: 'Clickable version of all 5 pages', p1Meta: 'Eclipse · Development · estimated', p1Date: '16 Oct 2026',
        nothing: 'Nothing pending on your side', working: 'Eclipse is working on it',
        p2Name: 'Questions chatbot', p2Item: 'AI chatbot (WhatsApp or web)', p2Code: 'DEMO-02',
        p2Pos: '4 of 5', p2Stage: 'Client review', p2Short: 'Approval or decision needed',
        p2Milestone: 'Your approval of the answers', p2Meta: 'You · estimated', p2Date: '07 Oct 2026',
        needs: 'Needs your action', p2Action: "Approve the chatbot's answers or ask for changes",
        p3Name: 'Automatic reminders', p3Item: 'Standard WhatsApp (no AI)', p3Code: 'DEMO-03',
        p3Pos: 'After delivery', p3Stage: 'Support', p3Short: 'Only with a maintenance plan',
        p3Milestone: 'October send review', p3Meta: 'Eclipse · Development · estimated', p3Date: '02 Nov 2026',
        support: 'Support active',
      },
    },
    html: t => `<div class="ep-light"></div>
      <header class="ep-hdr tex">
        <span class="ep-logo">${miniEclipse(28)}<b>${t.brand}</b></span><span class="ep-portal">${t.portal}</span>
        <nav class="ep-nav"><span class="on">${t.navProjects}</span><span>${t.navExit}</span><i class="ep-vsep"></i><span>${icon('back', 18)}${t.navBack}</span><span class="ep-prefs">${icon('globe', 18)}${t.prefs}${icon('chev', 16)}</span></nav>
      </header>
      <div class="ep-notice"><span class="ep-badge tex">${t.badge}</span><p>${t.notice}</p></div>
      <div class="ep-page">
        <p class="ep-crumbs tex"><span>${t.crumbSite}</span><i>/</i><span>${t.crumbPortal}</span><i>/</i><b>${t.crumbProjects}</b></p>
        <span class="ep-help tex">${icon('help', 20)}${t.help}</span>
        <div class="ep-head">
          <p class="ep-kicker"><span class="ep-badge tex">${t.badge}</span><span class="tex">${t.kicker}</span></p>
          <h1 class="ep-hello">${t.hello}</h1>
          <p class="ep-company">${t.company}</p>
        </div>
        ${rail(t)}
        <div class="ep-table">
          <div class="ep-thead tex"><span>${t.colProject}</span><span>${t.colStage}</span><span>${t.colMilestone}</span><span>${t.colAction}</span></div>
          <i class="ep-rule ep-rule-ink"></i>
          <div class="ep-row ep-row-1">
            <i class="ep-row-hl"></i>
            <div><b class="ep-name">${t.p1Name}</b><span class="ep-meta tex">${t.p1Item}</span><span class="ep-code tex">${t.p1Code}</span></div>
            <div class="ep-stage">${glyph(0.4, 40, 'ep-sg ep-sg-1')}<span><span class="ep-pos tex ep-p1-pos">${t.p1Pos}</span><b class="ep-sname ep-p1-stage">${t.p1Stage}</b><span class="ep-meta tex ep-p1-short">${t.p1Short}</span></span></div>
            <div><span class="ep-ms">${t.p1Milestone}</span><span class="ep-meta tex">${t.p1Meta} <span class="ep-date">${t.p1Date}</span></span></div>
            <div><span class="ep-ok">${icon('check', 22)}${t.nothing}</span><span class="ep-meta tex">${t.working}</span></div>
          </div>
          <i class="ep-rule"></i>
          <div class="ep-row ep-row-2" data-turn>
            <div><b class="ep-name">${t.p2Name}</b><span class="ep-meta tex">${t.p2Item}</span><span class="ep-code tex">${t.p2Code}</span></div>
            <div class="ep-stage">${glyph(0.8, 40, 'ep-sg')}<span><span class="ep-pos tex">${t.p2Pos}</span><b class="ep-sname">${t.p2Stage}</b><span class="ep-meta tex">${t.p2Short}</span></span></div>
            <div><span class="ep-ms">${t.p2Milestone}</span><span class="ep-meta tex">${t.p2Meta} <span class="ep-date">${t.p2Date}</span></span></div>
            <div><span class="ep-tag tex">${t.needs}</span><b class="ep-act">${t.p2Action}</b></div>
          </div>
          <i class="ep-rule"></i>
          <div class="ep-row ep-row-3">
            <div><b class="ep-name">${t.p3Name}</b><span class="ep-meta tex">${t.p3Item}</span><span class="ep-code tex">${t.p3Code}</span></div>
            <div class="ep-stage" data-stage="support">${glyph(1, 40, 'ep-sg')}<span><span class="ep-pos tex">${t.p3Pos}</span><b class="ep-sname">${t.p3Stage}</b><span class="ep-meta tex">${t.p3Short}</span></span></div>
            <div><span class="ep-ms">${t.p3Milestone}</span><span class="ep-meta tex">${t.p3Meta} <span class="ep-date">${t.p3Date}</span></span></div>
            <div><span class="ep-ok">${icon('check', 22)}${t.nothing}</span><span class="ep-meta tex">${t.support}</span></div>
          </div>
        </div>
      </div>`,
    play(D, v, T, dur, t) {
      const { tl } = D;
      const q = s => v.querySelector(s), qa = s => Array.from(v.querySelectorAll(s));
      const rules = qa('.ep-rule'), hello = q('.ep-hello');
      const step = i => q(`.ep-step[data-i="${i}"]`);
      const ink = i => step(i).querySelector('.ep-g-ink'), amber = i => step(i).querySelector('.ep-g-amber');
      // the rail as the fixture has it: 1 done (ink), 2 current (amber), 3–5 still to come
      tl.set(rules, { scaleX: 0 }, T);
      tl.set(hello, { clipPath: 'inset(0% 100% -20% 0%)' }, T);
      tl.set([ink(0)], { opacity: 1 }, T);
      tl.set([ink(1), ink(2), ink(3), ink(4), amber(0), amber(2), amber(3), amber(4)], { opacity: 0 }, T);
      tl.set(amber(1), { opacity: 1 }, T);
      tl.set(q('.ep-halo-3'), { opacity: 0, scale: 0.6 }, T);
      tl.set(q('.ep-halo-2'), { opacity: 1 }, T);
      tl.set(q('.ep-seg-dash2'), { opacity: 0 }, T);
      tl.set(q('.ep-seg-34'), { opacity: 1 }, T);
      tl.set(q('.ep-seg-new'), { drawSVG: '0%' }, T);
      tl.set(q('.ep-row-hl'), { opacity: 0 }, T);
      // hairlines draw, the greeting is uncovered by an edge passing (occultation)
      tl.to(rules, { scaleX: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06 }, T + 0.08);
      tl.to(hello, { clipPath: 'inset(0% 0% -20% 0%)', duration: 0.6, ease: 'expo.out' }, T + 0.04);
      // the website project advances: the row lights, its moon slides, the stage scrambles to the next one
      const A = T + 0.34;
      tl.to(q('.ep-row-hl'), { opacity: 1, duration: 0.3, ease: 'power2.out' }, A - 0.1);
      tl.to(q('.ep-sg-1 .ec-moon'), { x: moonX(0.6), duration: 0.6, ease: 'power3.inOut' }, A);
      tl.to(q('.ep-p1-pos'), { duration: 0.4, scrambleText: { text: t.p1PosNext, chars: '0123456789', speed: 0.6 }, ease: 'none' }, A);
      tl.to(q('.ep-p1-stage'), { duration: 0.55, scrambleText: { text: t.p1StageNext, chars: 'lowerCase', speed: 0.7 }, ease: 'none' }, A + 0.04);
      tl.to(q('.ep-p1-short'), { duration: 0.5, scrambleText: { text: t.p1ShortNext, chars: 'lowerCase', speed: 0.7 }, ease: 'none' }, A + 0.1);
      // …and on the cronograma: 2 → done (ink), the hairline to 3 draws, 3 becomes the current one (amber + halo)
      tl.to(q('.ep-seg-new'), { drawSVG: '100%', duration: 0.5, ease: 'power2.inOut' }, A + 0.1);
      tl.to(amber(1), { opacity: 0, duration: 0.3 }, A + 0.1);
      tl.to(ink(1), { opacity: 1, duration: 0.3 }, A + 0.1);
      tl.to(amber(2), { opacity: 1, duration: 0.3 }, A + 0.5);
      tl.to(q('.ep-halo-3'), { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }, A + 0.5);
      tl.to(q('.ep-halo-2'), { opacity: 0, duration: 0.3 }, A + 0.1);
      tl.to(q('.ep-seg-34'), { opacity: 0, duration: 0.3 }, A + 0.5);
      tl.to(q('.ep-seg-dash2'), { opacity: 1, duration: 0.3 }, A + 0.5);
      D.sfx('tick', A + 0.55, 0.04);
      void dur;
    },
  });

  // =========================================================================================== 3 · INTERNAL OPS
  // Eclipse · Operación interna, dark (its default), Prospectos: «Del contacto a la seña.» and the pipeline with
  // the next action the rules compute (rules.js prospectNextAction), on seed.js's sample prospects. The proposal
  // column (amounts) is left out. Motion: the next actions compute, row by row, and their due tags land.
  add('eclipse-ops', {
    frame: 'browser', url: 'toti-gauna.github.io/Eclipse-internal-portal/#prospectos', bg: '#0C0C14', color: '#F5B942',
    text: {
      es: {
        brand: 'ECLIPSE', label: 'Operación interna',
        navToday: 'Hoy', navCount: '15', navCalendar: 'Calendario', navProspects: 'Prospectos', navBatches: 'Lotes', navProjects: 'Proyectos', navPayments: 'Cobros', plan: 'Planificar',
        mode: 'Modo demostración · datos de este navegador',
        sample: 'Ejemplo', sampleText: 'Estás viendo datos de ejemplo: negocios ficticios para probar el flujo.', clean: 'Empezar con mis datos',
        crumbOps: 'Operación', crumbHere: 'Prospectos', kicker: 'Pipeline · 6 conversaciones abiertas',
        title: 'Del contacto a la <em>seña</em>.',
        rule: 'Responde → llamada el mismo día → propuesta en ≤24 h → toques a +2, +5 y +9 días. La próxima acción se calcula sola.',
        add: 'Prospecto',
        colProspect: 'Prospecto', colStage: 'Etapa', colSource: 'Fuente', colNext: 'Próxima acción',
        r1Name: 'Constructora (AU) · web + CRM', r1Meta: 'Upwork · cliente verificado · Agency', r1Pos: '4 de 5', r1Stage: 'Propuesta enviada', r1Source: 'Upwork',
        r1Next: 'Toque 1 de 3 (+2 días de la propuesta)', r1Due: 'Vencido hace 1 d',
        r2Name: 'Café del Puerto', r2Meta: 'Encargado · WhatsApp · Agency', r2Pos: '2 de 5', r2Stage: 'Respondió', r2Source: 'Lote',
        r2Next: 'Llamar (mismo día que respondió)', r2Due: 'Vencido hace 1 d',
        r3Name: 'Estudio digital (UK) · partner white-label', r3Meta: 'Upwork · Agency', r3Pos: '2 de 5', r3Stage: 'Respondió', r3Source: 'Upwork',
        r3Next: 'Llamar (mismo día que respondió)', r3Due: 'Hoy',
        r4Name: 'Centro de estética · turnos', r4Meta: 'Dueña · WhatsApp · Agency', r4Pos: '3 de 5', r4Stage: 'Llamada hecha', r4Source: 'Presencial', r4Warm: 'Tibio',
        r4Next: 'Enviar propuesta (≤24 h de la llamada)', r4Due: 'Hoy',
        open: 'Abrir',
      },
      en: {
        brand: 'ECLIPSE', label: 'Internal operations',
        navToday: 'Today', navCount: '15', navCalendar: 'Calendar', navProspects: 'Prospects', navBatches: 'Batches', navProjects: 'Projects', navPayments: 'Payments', plan: 'Plan',
        mode: 'Demo mode · data stored in this browser',
        sample: 'Sample', sampleText: "You're looking at sample data: fictional businesses to try out the flow.", clean: 'Start with my own data',
        crumbOps: 'Operations', crumbHere: 'Prospects', kicker: 'Pipeline · 6 open conversations',
        title: 'From first contact to <em>deposit</em>.',
        rule: 'Reply → same-day call → proposal within 24 h → follow-ups at +2, +5 and +9 days. The next action is worked out for you.',
        add: 'Prospect',
        colProspect: 'Prospect', colStage: 'Stage', colSource: 'Source', colNext: 'Next action',
        r1Name: 'Builder (AU) · web + CRM', r1Meta: 'Upwork · verified client · Agency', r1Pos: '4 of 5', r1Stage: 'Proposal sent', r1Source: 'Upwork',
        r1Next: 'Follow-up 1 of 3 (+2 days after the proposal)', r1Due: 'Overdue by 1 d',
        r2Name: 'Café del Puerto', r2Meta: 'Manager · WhatsApp · Agency', r2Pos: '2 of 5', r2Stage: 'Replied', r2Source: 'Batch',
        r2Next: 'Call (the same day they replied)', r2Due: 'Overdue by 1 d',
        r3Name: 'Digital studio (UK) · white-label partner', r3Meta: 'Upwork · Agency', r3Pos: '2 of 5', r3Stage: 'Replied', r3Source: 'Upwork',
        r3Next: 'Call (the same day they replied)', r3Due: 'Today',
        r4Name: 'Beauty salon · bookings', r4Meta: 'Owner · WhatsApp · Agency', r4Pos: '3 of 5', r4Stage: 'Call done', r4Source: 'In person', r4Warm: 'Warm',
        r4Next: 'Send the proposal (≤24 h after the call)', r4Due: 'Today',
        open: 'Open',
      },
    },
    html: t => {
      const row = (n, phase, late) => `<div class="eo-row" ${late ? 'data-late' : 'data-turn'}><i class="eo-edge"></i>
        <div><b class="eo-name">${t[`r${n}Name`]}</b><span class="eo-meta tex">${t[`r${n}Meta`]}</span></div>
        <div class="eo-stage">${glyph(phase, 30, 'eo-sg')}<span><span class="eo-pos tex">${t[`r${n}Pos`]}</span><b>${t[`r${n}Stage`]}</b></span></div>
        <div class="eo-src">${t[`r${n}Source`]}${t[`r${n}Warm`] ? `<span class="eo-meta tex">${t[`r${n}Warm`]}</span>` : ''}</div>
        <div class="eo-next"><span class="eo-next-t"><span class="eo-ghost">${t[`r${n}Next`]}</span><span class="eo-live" data-text="${t[`r${n}Next`]}">${t[`r${n}Next`]}</span></span><span class="eo-tag tex ${late ? 'eo-late' : 'eo-attn'}">${t[`r${n}Due`]}</span></div>
        <div class="eo-end"><span class="eo-open tex">${t.open}${icon('arrow', 20)}</span></div>
      </div>`;
      return `<div class="eo-light"></div>
      <header class="eo-hdr tex">
        <span class="eo-logo">${glyph(1, 28, 'eo-logo-g')}<b>${t.brand}</b></span><span class="eo-label">${t.label}</span>
        <nav class="eo-nav"><span>${t.navToday}<i class="eo-count">${t.navCount}</i></span><span>${t.navCalendar}</span><span class="on">${t.navProspects}</span><span>${t.navBatches}</span><span>${t.navProjects}</span><span>${t.navPayments}</span></nav>
        <span class="eo-tools"><i class="eo-vsep"></i><span class="eo-plan">${icon('plus', 18)}${t.plan}</span>${icon('sun', 20, 'eo-t')}${icon('more', 20, 'eo-t')}</span>
      </header>
      <div class="eo-mode tex"><span class="eo-badge">${t.mode}</span></div>
      <div class="eo-notice tex"><span class="eo-badge">${t.sample}</span><p>${t.sampleText}</p><u>${t.clean}</u></div>
      <div class="eo-page">
        <p class="eo-crumbs tex"><span>${t.crumbOps}</span><i>/</i><b>${t.crumbHere}</b></p>
        <p class="eo-kicker tex">${t.kicker}</p>
        <h1 class="eo-title">${t.title}</h1>
        <p class="eo-rule">${t.rule}</p>
        <span class="eo-add">${icon('plus', 22)}${t.add}</span>
        <div class="eo-thead tex"><span>${t.colProspect}</span><span>${t.colStage}</span><span>${t.colSource}</span><span>${t.colNext}</span><span></span></div>
        <i class="eo-hr"></i>
        <div class="eo-rows">${row(1, 0.8, true)}${row(2, 0.4, true)}${row(3, 0.4, false)}${row(4, 0.6, false)}</div>
      </div>`;
    },
    play(D, v, T, dur) {
      const { tl } = D;
      const q = s => v.querySelector(s), qa = s => Array.from(v.querySelectorAll(s));
      D.fit(q('.eo-title'), 1000); // en is longer: one line, clear of «+ Prospect»
      // .eo-ghost keeps each cell's final size, so the rows never jump while the text types in
      const nexts = qa('.eo-live'), tags = qa('.eo-tag'), edges = qa('.eo-edge');
      tl.set(q('.eo-hr'), { scaleX: 0 }, T);
      tl.set(nexts, { scrambleText: { text: ' ' } }, T);
      tl.set(tags, { opacity: 0, scale: 0.4 }, T);
      tl.set(edges, { scaleY: 0 }, T);
      tl.set(q('.eo-title em'), { opacity: 0, x: -10 }, T);
      tl.to(q('.eo-hr'), { scaleX: 1, duration: 0.8, ease: 'expo.out' }, T + 0.1);
      tl.to(q('.eo-title em'), { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out' }, T + 0.2);
      // the next action is computed: each row's action types itself in, its due tag lands, its edge lights
      nexts.forEach((el, i) => {
        const at = T + 0.2 + i * 0.08;
        tl.to(el, { duration: 0.38, scrambleText: { text: el.dataset.text, chars: 'abcdefghijklmnopqrstuvwxyz+≤()', revealDelay: 0.08, speed: 0.8 }, ease: 'none' }, at);
        tl.to(tags[i], { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.2)' }, at + 0.26);
        tl.to(edges[i], { scaleY: 1, duration: 0.4, ease: 'expo.out' }, at + 0.16);
        if (i < 2) D.sfx('key', at + 0.26, 0.025);
      });
      void dur;
    },
  });
})();
