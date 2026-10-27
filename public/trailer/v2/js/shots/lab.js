/* Act 5 shots — lab group: Ignacio's own lab projects, each one rebuilt from ONE real component of its repo
   (same layout, tokens, type, copy and sample data), as HTML/CSS/SVG moved by the master timeline.
     volta     supplements-ecommerce · Club Volta: the 24-plate charge ring fills and the reward unlocks
     velmar    velmar · "Escribí el nombre": the name is typed and its letters drop onto the collar
     dentalos  DentalOS · Hoy y agenda: the day's appointments (seed, lunes 19/10) slide into their chairs
     supernova supernova-eventos · the confirmed pass: the ticket rises, its QR prints, the foil light crosses
     games     games-market · Batería de experiencias: the game cards light up in a wave
     kinetic   kinetic-studio · the trailer hub: the wall of generative posters flips on
   Contract in js/ig-shots.js; styles in css/shots/lab.css (every rule under .shot-<id>). Only fixed values: every
   frame can be sought with ?t=. */
(() => {
  'use strict';
  const { add } = Trailer.igShots;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const q = (v, s) => v.querySelector(s), qa = (v, s) => Array.from(v.querySelectorAll(s));
  // a from → to that starts after the cut: its from-state is set AT the cut (T), so the view never shows its final
  // state while the frame whips in (D.hit only sets it when the tween starts)
  const enter = (D, T, el, from, to, at) => { D.tl.set(el, from, T); D.tl.to(el, to, at); };
  const icon = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`;

  /* ── VOLTA ──────────────────────────────────────────────────────────────────────────────────────────────────
     Club Volta (src/features/club/ClubHero.tsx + ClubNextPrize.tsx). The ring is PlateRing (24 plates, viewBox 120)
     and the readout is the 7-segment Led (components/atoms/Led.tsx), both ported as they are. Copy: the hero and the
     "ready" state of ClubNextPrize with the first training mission of src/demo/fixtures/club.ts. */
  const VOLT = '#c8ff2e';
  const plate = i => {
    const S = 24, R = 52, gap = 2.2, rad = Math.PI / 180;
    const a0 = ((i * 360) / S + gap / 2 - 90) * rad, a1 = (((i + 1) * 360) / S - gap / 2 - 90) * rad;
    const p = (a, r) => `${(60 + r * Math.cos(a)).toFixed(2)} ${(60 + r * Math.sin(a)).toFixed(2)}`;
    return `M${p(a0, R)}A${R} ${R} 0 0 1 ${p(a1, R)}L${p(a1, R - 9)}A${R - 9} ${R - 9} 0 0 0 ${p(a0, R - 9)}Z`;
  };
  const PLATES = Array.from({ length: 24 }, (_, i) => plate(i));
  const LT = 6;
  const segH = cy => `4,${cy} ${4 + LT / 2},${cy - LT / 2} ${28 - LT / 2},${cy - LT / 2} 28,${cy} ${28 - LT / 2},${cy + LT / 2} ${4 + LT / 2},${cy + LT / 2}`;
  const segV = (cx, y1, y2) => `${cx},${y1} ${cx + LT / 2},${y1 + LT / 2} ${cx + LT / 2},${y2 - LT / 2} ${cx},${y2} ${cx - LT / 2},${y2 - LT / 2} ${cx - LT / 2},${y1 + LT / 2}`;
  const SEGS = [segH(3), segV(29, 4, 28), segV(29, 30, 54), segH(55), segV(3, 30, 54), segV(3, 4, 28), segH(29)];
  const DIGITS = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  const segPath = keys => SEGS.filter((_, k) => keys.includes('abcdefg'[k])).map(p => `M${p}Z`).join('');
  const SEG_ALL = segPath('abcdefg');
  const led = value => {
    const w = value.length * 40 + 10, h = 84;
    return `<svg class="vt-led" viewBox="-2 -2 ${w} 62" style="width:${(w / 62 * h).toFixed(1)}px" aria-hidden="true"><g transform="translate(8 0) skewX(-7)">${
      [...value].map((c, i) => `<g transform="translate(${i * 40} 0)"><path d="${SEG_ALL}" fill="currentColor" opacity=".08"/><path class="on" d="${segPath(DIGITS[c])}" fill="currentColor"/></g>`).join('')}</g></svg>`;
  };
  // the readout follows the plates: after plate i the ring reads round((i + 1) / 24 × 100)
  const LED_AT = [-1, 2, 5, 8, 11, 14, 17, 20, 23];
  const LED_VALUES = LED_AT.map(i => String(Math.round(((i + 1) / 24) * 100)));
  const GIFT = icon('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>');

  add('volta', {
    frame: 'browser', url: 'github.com/Toti-Gauna/supplements-ecommerce', bg: '#0b0c0d', color: VOLT,
    text: {
      es: {
        brand: 'VOLTA', nav: ['Tienda', 'Packs', 'Armá tu stack', 'Club Volta', 'Shaker Rush', 'Ayuda'], demo: 'Demo · no se cobra nada',
        club: 'Club Volta', h1: 'Sumá carga.', h2: 'Subí de nivel.',
        lede: 'Misiones de compra y de entrenamiento, el disco olímpico, Shaker Rush y premios en producto.',
        pct: '% carga', next: 'Tu próximo premio', prize: 'Listo para reclamar: Sachet de pre-entreno de regalo',
        claim: 'Reclamalo en «Entrená 3 veces esta semana»',
      },
      en: {
        brand: 'VOLTA', nav: ['Shop', 'Packs', 'Build your stack', 'Club Volta', 'Shaker Rush', 'Help'], demo: 'Demo · nothing is charged',
        club: 'Club Volta', h1: 'Load the bar.', h2: 'Level up.',
        lede: 'Purchase and training missions, the Olympic plate spin, Shaker Rush and rewards in product.',
        pct: '% load', next: 'Your next reward', prize: 'Ready to claim: a free pre-workout sachet',
        claim: 'Claim it in “Train 3 times this week”',
      },
    },
    html: t => `<div class="vt-head">
        <span class="vt-logo"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M4 8h14l13 34-5 14z" fill="#f2f0ea"/><path d="M44 8h17L48 30h7L27 60l8.5-23H29z" fill="${VOLT}"/></svg><b>${esc(t.brand)}</b></span>
        <span class="vt-nav tex">${t.nav.map((n, i) => `<span${i === 3 ? ' class="on"' : ''}>${esc(n)}</span>`).join('')}</span>
        <span class="vt-demo tex"><i></i>${esc(t.demo)}</span>
      </div>
      <div class="vt-band"><i class="vt-glow"></i>
        <div class="vt-copy">
          <p class="vt-eye">${esc(t.club)}</p>
          <h1 class="vt-h"><span>${esc(t.h1)}</span><span class="vt-h2">${esc(t.h2)}</span></h1>
          <p class="vt-p">${esc(t.lede)}</p>
        </div>
        <div class="vt-plate">
          <span class="vt-gift">${GIFT}</span>
          <div class="vt-ring">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" stroke-opacity=".14" stroke-width="1"/>
              ${PLATES.map(d => `<path d="${d}" fill="currentColor" fill-opacity=".1"/>`).join('')}
              <g class="vt-lit">${PLATES.map(d => `<path d="${d}" fill="currentColor"/>`).join('')}</g>
              <circle cx="60" cy="60" r="38" fill="none" stroke="currentColor" stroke-opacity=".18" stroke-dasharray="1 3"/>
            </svg>
            <div class="vt-read"><div class="vt-leds">${LED_VALUES.map(led).join('')}</div><span class="tex">${esc(t.pct)}</span></div>
          </div>
          <p class="vt-eye tex">${esc(t.next)}</p>
          <p class="vt-prize">${esc(t.prize)}</p>
          <p class="vt-claim">${esc(t.claim.split(' ').slice(0, -1).join(' '))} <span class="vt-nw">${esc(t.claim.split(' ').slice(-1)[0])}${icon('<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>')}</span></p>
        </div>
      </div>`,
    play(D, v, T) {
      const { tl } = D;
      const lit = qa(v, '.vt-lit path'), leds = qa(v, '.vt-led');
      const s0 = T + 0.12, step = 0.016;
      // the 24 plates light clockwise; the LED counts with them
      enter(D, T, lit, { opacity: 0 }, { opacity: 1, duration: 0.05, ease: 'none', stagger: step }, s0);
      tl.set(leds, { opacity: 0 }, T);
      tl.set(leds[0], { opacity: 1 }, T);
      LED_AT.forEach((i, k) => {
        if (!k) return;
        const at = s0 + i * step + 0.04;
        tl.set(leds[k - 1], { opacity: 0 }, at);
        tl.set(leds[k], { opacity: 1 }, at);
      });
      // full ring: the gift unlocks and the reward reads "ready to claim"
      const full = s0 + 23 * step + 0.06;
      D.hit(q(v, '.vt-ring'), { scale: 1.05 }, { scale: 1, duration: 0.4, ease: 'expo.out' }, full);
      enter(D, T, q(v, '.vt-gift'), { scale: 0.2, rotation: -30, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.4, ease: 'back.out(2.6)' }, full);
      enter(D, T, q(v, '.vt-prize'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.4, ease: 'expo.out' }, full + 0.02);
      enter(D, T, q(v, '.vt-claim'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }, full + 0.1);
      D.sfx('plip', full, 0.16, 640);
    },
  });

  /* ── VELMAR ─────────────────────────────────────────────────────────────────────────────────────────────────
     The live customizer of the home (src/features/home/LiveCustomizer.tsx) with its CollarPreview: paracord in
     "Verde oliva" (#5a6b3a), loose letters that hang, paw charm (defaultCollarConfig in src/demo/fixtures/collar.ts),
     the demo name "Lola". Geometry from collar/geometry.ts (bezier P, spread(4, 32)); cord layers from collar/Cord.tsx. */
  const CORD = 'M42 58 C60 246 340 246 358 58';
  const SPOTS = [[152.6, 192.48], [184.02, 198.28], [215.98, 198.28], [247.4, 192.48]];
  const CHARM = [279.99, 179.37];
  const LOGO_V = 'M187.5 432.5 323 297l112 112 112-112 135.5 135.5M295.5 487.5 435 627l139.5-139.5';
  const collar = name => {
    const letters = [...name.toUpperCase()].filter(c => c.trim()).slice(0, 4);
    const hang = (x, y) => `<line x1="${x}" y1="${y + 4}" x2="${x}" y2="${y + 12}" stroke="#b9b4a8" stroke-width="2"/><circle cx="${x}" cy="${y + 15}" r="3.6" fill="none" stroke="#b9b4a8" stroke-width="2"/>`;
    const [cx, cy] = CHARM;
    return `<svg viewBox="0 18 400 290" aria-hidden="true">
      <defs>
        <linearGradient id="lab-vm-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e2b0"/><stop offset=".5" stop-color="#d2ad69"/><stop offset="1" stop-color="#9a7434"/></linearGradient>
        <linearGradient id="lab-vm-buckle" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4d50"/><stop offset="1" stop-color="#1e2022"/></linearGradient>
        <filter id="lab-vm-drop" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="2.4" flood-color="#1c2016" flood-opacity=".28"/></filter>
      </defs>
      <ellipse cx="200" cy="292" rx="150" ry="9" fill="#1c2016" opacity=".07"/>
      <g filter="url(#lab-vm-drop)" fill="none">
        <path d="${CORD}" stroke="#3b4626" stroke-width="18" stroke-linecap="round"/>
        <path d="${CORD}" stroke="#5a6b3a" stroke-width="15" stroke-linecap="round"/>
        <path d="${CORD}" stroke="#3b4626" stroke-width="13" stroke-opacity=".45" stroke-dasharray="3.2 4.2"/>
        <path d="${CORD}" stroke="#7a904e" stroke-width="5" stroke-opacity=".5" stroke-dasharray="3.2 4.2" stroke-dashoffset="3.6" transform="translate(0 -3)"/>
      </g>
      <g transform="translate(350 42)"><rect width="30" height="32" rx="7" fill="url(#lab-vm-buckle)"/><rect x="6" y="9" width="18" height="14" rx="3" fill="#0f1011" opacity=".55"/></g>
      <rect x="30" y="44" width="22" height="28" rx="6" fill="url(#lab-vm-buckle)"/>
      ${letters.map((ch, i) => { const [x, y] = SPOTS[i]; return `<g class="vm-l" data-o="${x} ${y}">${hang(x, y)}<text x="${x}" y="${y + 50}" text-anchor="middle" font-size="32" font-weight="800" fill="#ffffff" stroke="#8c8c8c" stroke-width="2.6" paint-order="stroke" filter="url(#lab-vm-drop)" style="font-family:'LabManrope',sans-serif">${esc(ch)}</text></g>`; }).join('')}
      <g class="vm-charm" data-o="${cx} ${cy}">${hang(cx, cy)}<g transform="translate(${cx} ${cy + 36})"><g fill="url(#lab-vm-metal)" stroke="#7a5a26" stroke-width="1"><ellipse cx="0" cy="6" rx="10" ry="8.5"/><ellipse cx="-11" cy="-5" rx="4.2" ry="5.4"/><ellipse cx="-4" cy="-11" rx="4.2" ry="5.4"/><ellipse cx="4" cy="-11" rx="4.2" ry="5.4"/><ellipse cx="11" cy="-5" rx="4.2" ry="5.4"/></g></g></g>
    </svg>`;
  };

  add('velmar', {
    frame: 'browser', url: 'github.com/Toti-Gauna/velmar-ecommerce-', bg: '#f6f1e8', color: '#d2ad69',
    text: {
      es: {
        brand: 'Velmar', nav: ['Tienda', 'Crear el tuyo', 'Club Velmar', 'Ayuda'],
        eyebrow: 'Crear mi producto personalizado', h1: 'Escribí el nombre.', h2: 'Miralo al instante.',
        label: 'Nombre de tu mascota', name: 'Lola', fonts: ['Redondeada', 'Clásica', 'Manuscrita'], pill: 'Vista previa ilustrativa',
      },
      en: {
        brand: 'Velmar', nav: ['Shop', 'Make your own', 'Club Velmar', 'Help'],
        eyebrow: 'Create my custom product', h1: 'Type the name.', h2: 'See it instantly.',
        label: 'Your pet’s name', name: 'Lola', fonts: ['Rounded', 'Classic', 'Handwritten'], pill: 'Illustrative preview',
      },
    },
    html: t => `<div class="vm-head">
        <span class="vm-logo"><svg viewBox="156 234 558 452" aria-hidden="true"><path d="${LOGO_V}" fill="none" stroke="currentColor" stroke-width="78" stroke-linejoin="miter"/></svg><b>${esc(t.brand)}</b></span>
        <span class="vm-nav tex">${t.nav.map(n => `<span>${esc(n)}</span>`).join('')}</span>
      </div>
      <div class="vm-card"></div>
      <div class="vm-copy">
        <p class="vm-eye tex">${esc(t.eyebrow)}</p>
        <h2 class="vm-h"><span>${esc(t.h1)}</span><span><em>${esc(t.h2)}</em></span></h2>
        <p class="vm-label">${esc(t.label)}</p>
        <div class="vm-input">${Array.from({ length: [...t.name].length + 1 }, (_, i) => `<span class="vm-st">${esc([...t.name].slice(0, i).join(''))}<i class="vm-caret"></i></span>`).join('')}</div>
        <div class="vm-chips"><span class="vm-chip on">${esc(t.fonts[0])}</span><span class="vm-chip serif">${esc(t.fonts[1])}</span><span class="vm-chip hand">${esc(t.fonts[2])}</span></div>
      </div>
      <i class="vm-halo"></i>
      <div class="vm-prev">${collar(t.name)}<span class="vm-pill tex">${esc(t.pill)}</span></div>`,
    play(D, v, T) {
      const { tl } = D;
      const states = qa(v, '.vm-st'), letters = qa(v, '.vm-l'), charm = q(v, '.vm-charm');
      const k0 = T + 0.1, dk = 0.085;
      tl.set(states, { opacity: 0 }, T);
      tl.set(states[0], { opacity: 1 }, T);
      // each key: the input shows one more letter and that letter drops onto the cord, swinging from its ring
      const drop = (g, at, from) => {
        enter(D, T, g, { svgOrigin: g.dataset.o, y: -22, scale: 0.55, opacity: 0, rotation: from }, { y: 0, scale: 1, opacity: 1, duration: 0.18, ease: 'power2.out' }, at);
        tl.to(g, { rotation: 0, duration: 0.54, ease: 'elastic.out(1, 0.35)' }, at + 0.04);
      };
      letters.forEach((g, i) => {
        const at = k0 + i * dk;
        tl.set(states[i], { opacity: 0 }, at);
        tl.set(states[i + 1], { opacity: 1 }, at);
        drop(g, at, i % 2 ? 22 : -22);
        D.sfx('key', at, 0.1);
      });
      drop(charm, k0 + letters.length * dk, 26);
    },
  });

  /* ── DENTALOS ───────────────────────────────────────────────────────────────────────────────────────────────
     M04 Hoy y agenda, "Por profesional" (src/pages/admin/Today.tsx, .res-* in src/styles/app.css). Monday 19/10 of
     the seed (src/domain/seed.ts): A-0003 Julián 09:00 control, A-0006 Valeria 09:30 limpieza (Dr. Acosta, sillón 3),
     A-0004 Sofía 10:00 primera consulta pendiente, A-0005 Tomás 11:00 control; Dr. Lezcano works afternoons.
     15-minute rows (ROW_MIN) at 48 px: 192 px per hour from 09:00. */
  const DO_ROW = 48, DO_TOP = 72, DO_TIMEW = 92, DO_W = 1344;
  const doY = m => DO_TOP + ((m - 540) / 15) * DO_ROW;
  const doColW = (DO_W - DO_TIMEW) / 3;
  const DO_APPTS = [
    { col: 0, from: 540, to: 570, req: false },
    { col: 2, from: 570, to: 615, req: false },
    { col: 0, from: 600, to: 645, req: true },
    { col: 0, from: 660, to: 690, req: false },
  ];
  const BRAND_MARK = `<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="lab-do-bm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c6f69"/><stop offset="1" stop-color="#173c3a"/></linearGradient><linearGradient id="lab-do-bg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c8952c"/><stop offset=".5" stop-color="#f3d98a"/><stop offset="1" stop-color="#b8862b"/></linearGradient></defs><rect width="48" height="48" rx="13" fill="url(#lab-do-bm)"/><path d="M14 17c0-3.2 2.4-5.6 5.6-5.6 2.4 0 3.4 1.3 4.4 1.3s2-1.3 4.4-1.3c3.2 0 5.6 2.4 5.6 5.6 0 3.8-1.9 5.6-2.6 8.9-.6 3.2-1.3 10.1-3.6 10.1-2 0-2.2-6-4.9-6s-2.9 6-4.9 6c-2.3 0-3-6.9-3.6-10.1C15.9 22.6 14 20.8 14 17z" fill="#f6f4ee"/><path d="M9 30c8-5 22-5 30 0" stroke="url(#lab-do-bg)" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="37" cy="12" r="2.4" fill="url(#lab-do-bg)"/></svg>`;

  add('dentalos', {
    frame: 'browser', url: 'github.com/Toti-Gauna/DentalOS', bg: '#1e5c55', color: '#8fd3c6',
    text: {
      es: {
        clinic: 'Clínica Brisa', app: 'DentalOS · demo', demo: 'Demo', search: 'Buscar módulo o persona…', role: 'Recepción',
        eyebrow: 'M04 · Recepción', h1: 'Hoy y agenda', sub: 'lunes 19 de octubre · hoy, reloj de muestra 09:00',
        views: ['Por profesional', 'Lista del día', 'Semana', '14 días'],
        pros: [['Dra. Paula Ferreyra', 'Sede Centro'], ['Dr. Tomás Lezcano', 'Sede Norte'], ['Dr. Bruno Acosta', 'Sede Norte']],
        hours: ['09:00', '10:00', '11:00', '12:00'],
        appts: [
          ['09:00 · Julián', 'Control general', 'Sillón 1 · Confirmado · A-0003 v1'],
          ['09:30 · Valeria', 'Limpieza e higiene', 'Sillón 3 · Confirmado · A-0006 v1'],
          ['10:00 · Sofía', 'Primera consulta', 'Sillón 1 · Pendiente de confirmación'],
          ['11:00 · Tomás', 'Control general', 'Sillón 1 · Confirmado · A-0005 v1'],
        ],
      },
      en: {
        clinic: 'Clínica Brisa', app: 'DentalOS · demo', demo: 'Demo', search: 'Search a module or person…', role: 'Front desk',
        eyebrow: 'M04 · Front desk', h1: 'Today and schedule', sub: 'Monday, October 19 · today, sample clock 09:00',
        views: ['By professional', 'Day list', 'Week', '14 days'],
        pros: [['Dr. Paula Ferreyra', 'Centro site'], ['Dr. Tomás Lezcano', 'Norte site'], ['Dr. Bruno Acosta', 'Norte site']],
        hours: ['09:00', '10:00', '11:00', '12:00'],
        appts: [
          ['09:00 · Julián', 'General check-up', 'Chair 1 · Confirmed · A-0003 v1'],
          ['09:30 · Valeria', 'Cleaning and hygiene', 'Chair 3 · Confirmed · A-0006 v1'],
          ['10:00 · Sofía', 'First visit', 'Chair 1 · Awaiting confirmation'],
          ['11:00 · Tomás', 'General check-up', 'Chair 1 · Confirmed · A-0005 v1'],
        ],
      },
    },
    html: t => `<div class="do-head">
        <span class="do-logo">${BRAND_MARK}<span><b>${esc(t.clinic)}</b><small class="tex">${esc(t.app)}</small></span></span>
        <span class="do-chip tex">${esc(t.demo)}</span>
        <span class="do-search tex">${esc(t.search)}</span>
        <span class="do-role tex">${esc(t.role)}</span>
      </div>
      <div class="do-ph">
        <p class="do-eye tex">${esc(t.eyebrow)}</p>
        <h1 class="do-h">${esc(t.h1)}</h1>
        <p class="do-sub">${esc(t.sub)}</p>
      </div>
      <div class="do-seg tex">${t.views.map(x => `<span>${esc(x)}</span>`).join('')}</div>
      <div class="do-grid">
        <div class="do-ghead"></div>
        ${t.pros.map(([n, s], i) => `<div class="do-pro" style="left:${(DO_TIMEW + i * doColW).toFixed(1)}px;width:${doColW.toFixed(1)}px">${esc(n)}<small class="tex">${esc(s)}</small></div>`).join('')}
        ${t.pros.map((_, i) => `<div class="do-col${i === 1 ? ' closed' : ''}" style="left:${(DO_TIMEW + i * doColW).toFixed(1)}px;width:${doColW.toFixed(1)}px"></div>`).join('')}
        ${t.hours.map((h, i) => `<span class="do-time" style="top:${doY(540 + i * 60) + 8}px">${esc(h)}</span>`).join('')}
        ${DO_APPTS.map((a, i) => `<div class="do-appt${a.req ? ' req' : ''}" style="left:${(DO_TIMEW + a.col * doColW + 5).toFixed(1)}px;width:${(doColW - 10).toFixed(1)}px;top:${doY(a.from) + 2}px;height:${doY(a.to) - doY(a.from) - 4}px"><b>${esc(t.appts[i][0])}</b><span>${esc(t.appts[i][1])}</span><small class="tex">${esc(t.appts[i][2])}</small></div>`).join('')}
      </div>`,
    play(D, v, T) {
      // the day's appointments slide into their professional and chair, in the order of the clock
      enter(D, T, qa(v, '.do-appt'), { x: 110, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: 'expo.out', stagger: 0.075 }, T + 0.12);
      D.sfx('tick', T + 0.42, 0.03);
    },
  });

  /* ── SUPERNOVA EVENTOS ──────────────────────────────────────────────────────────────────────────────────────
     The pass after "Me sumo" (src/features/registration/PersonalTicket.tsx inside RegistrationModal's success view),
     phone layout of registration.css. Event "Un respiro para vos" of src/data/events.ts, the demo user of
     src/lib/events.ts. The QR is the real one: passPayload() of src/features/qr/qr.ts (pass id, event and function
     ids only, no personal data) encoded with the repo's own qrcode package, level Q, run-length paths. */
  const SN_QR = 'M4 4h7v1h-7zM12 4h3v1h-3zM19 4h2v1h-2zM22 4h3v1h-3zM27 4h4v1h-4zM32 4h3v1h-3zM38 4h1v1h-1zM42 4h1v1h-1zM46 4h1v1h-1zM50 4h7v1h-7zM4 5h1v1h-1zM10 5h1v1h-1zM15 5h2v1h-2zM18 5h2v1h-2zM21 5h7v1h-7zM30 5h1v1h-1zM32 5h3v1h-3zM36 5h2v1h-2zM39 5h5v1h-5zM46 5h2v1h-2zM50 5h1v1h-1zM56 5h1v1h-1zM4 6h1v1h-1zM6 6h3v1h-3zM10 6h1v1h-1zM12 6h3v1h-3zM16 6h1v1h-1zM18 6h1v1h-1zM20 6h4v1h-4zM28 6h1v1h-1zM36 6h1v1h-1zM38 6h4v1h-4zM43 6h1v1h-1zM45 6h1v1h-1zM47 6h1v1h-1zM50 6h1v1h-1zM52 6h3v1h-3zM56 6h1v1h-1zM4 7h1v1h-1zM6 7h3v1h-3zM10 7h1v1h-1zM12 7h1v1h-1zM16 7h1v1h-1zM18 7h1v1h-1zM20 7h1v1h-1zM22 7h2v1h-2zM25 7h2v1h-2zM30 7h2v1h-2zM33 7h2v1h-2zM38 7h1v1h-1zM41 7h2v1h-2zM46 7h1v1h-1zM48 7h1v1h-1zM50 7h1v1h-1zM52 7h3v1h-3zM56 7h1v1h-1zM4 8h1v1h-1zM6 8h3v1h-3zM10 8h1v1h-1zM13 8h1v1h-1zM19 8h1v1h-1zM21 8h3v1h-3zM26 8h8v1h-8zM37 8h1v1h-1zM39 8h5v1h-5zM45 8h2v1h-2zM50 8h1v1h-1zM52 8h3v1h-3zM56 8h1v1h-1zM4 9h1v1h-1zM10 9h1v1h-1zM12 9h1v1h-1zM15 9h2v1h-2zM18 9h3v1h-3zM22 9h1v1h-1zM25 9h1v1h-1zM27 9h2v1h-2zM32 9h1v1h-1zM38 9h1v1h-1zM44 9h1v1h-1zM46 9h1v1h-1zM50 9h1v1h-1zM56 9h1v1h-1zM4 10h7v1h-7zM12 10h1v1h-1zM14 10h1v1h-1zM16 10h1v1h-1zM18 10h1v1h-1zM20 10h1v1h-1zM22 10h1v1h-1zM24 10h1v1h-1zM26 10h1v1h-1zM28 10h1v1h-1zM30 10h1v1h-1zM32 10h1v1h-1zM34 10h1v1h-1zM36 10h1v1h-1zM38 10h1v1h-1zM40 10h1v1h-1zM42 10h1v1h-1zM44 10h1v1h-1zM46 10h1v1h-1zM48 10h1v1h-1zM50 10h7v1h-7zM12 11h2v1h-2zM15 11h1v1h-1zM17 11h2v1h-2zM20 11h2v1h-2zM24 11h3v1h-3zM28 11h1v1h-1zM32 11h2v1h-2zM35 11h3v1h-3zM40 11h1v1h-1zM42 11h2v1h-2zM46 11h2v1h-2zM5 12h1v1h-1zM7 12h1v1h-1zM9 12h6v1h-6zM17 12h8v1h-8zM27 12h6v1h-6zM35 12h1v1h-1zM37 12h2v1h-2zM40 12h2v1h-2zM44 12h1v1h-1zM48 12h4v1h-4zM53 12h2v1h-2zM56 12h1v1h-1zM4 13h1v1h-1zM6 13h1v1h-1zM8 13h1v1h-1zM13 13h2v1h-2zM24 13h1v1h-1zM28 13h2v1h-2zM31 13h2v1h-2zM39 13h2v1h-2zM43 13h2v1h-2zM49 13h1v1h-1zM51 13h6v1h-6zM6 14h6v1h-6zM13 14h3v1h-3zM18 14h2v1h-2zM24 14h1v1h-1zM29 14h1v1h-1zM36 14h1v1h-1zM38 14h1v1h-1zM40 14h2v1h-2zM44 14h1v1h-1zM47 14h2v1h-2zM50 14h1v1h-1zM54 14h2v1h-2zM5 15h1v1h-1zM7 15h1v1h-1zM9 15h1v1h-1zM11 15h5v1h-5zM19 15h2v1h-2zM24 15h2v1h-2zM27 15h1v1h-1zM29 15h1v1h-1zM31 15h1v1h-1zM33 15h5v1h-5zM39 15h4v1h-4zM47 15h3v1h-3zM52 15h1v1h-1zM54 15h3v1h-3zM5 16h2v1h-2zM9 16h3v1h-3zM16 16h3v1h-3zM21 16h1v1h-1zM23 16h1v1h-1zM26 16h3v1h-3zM35 16h6v1h-6zM44 16h2v1h-2zM48 16h1v1h-1zM51 16h2v1h-2zM55 16h2v1h-2zM8 17h1v1h-1zM12 17h1v1h-1zM14 17h2v1h-2zM17 17h2v1h-2zM22 17h5v1h-5zM28 17h5v1h-5zM35 17h4v1h-4zM40 17h2v1h-2zM44 17h1v1h-1zM47 17h2v1h-2zM50 17h1v1h-1zM4 18h3v1h-3zM8 18h1v1h-1zM10 18h1v1h-1zM13 18h1v1h-1zM17 18h1v1h-1zM20 18h3v1h-3zM25 18h3v1h-3zM33 18h3v1h-3zM37 18h6v1h-6zM44 18h3v1h-3zM48 18h2v1h-2zM54 18h3v1h-3zM4 19h3v1h-3zM12 19h1v1h-1zM18 19h3v1h-3zM22 19h1v1h-1zM30 19h1v1h-1zM32 19h1v1h-1zM34 19h1v1h-1zM36 19h2v1h-2zM40 19h1v1h-1zM44 19h1v1h-1zM48 19h1v1h-1zM51 19h3v1h-3zM56 19h1v1h-1zM4 20h4v1h-4zM10 20h1v1h-1zM12 20h2v1h-2zM16 20h4v1h-4zM21 20h6v1h-6zM30 20h5v1h-5zM36 20h1v1h-1zM39 20h5v1h-5zM45 20h3v1h-3zM51 20h3v1h-3zM55 20h2v1h-2zM4 21h2v1h-2zM8 21h1v1h-1zM12 21h2v1h-2zM18 21h3v1h-3zM22 21h2v1h-2zM26 21h1v1h-1zM28 21h1v1h-1zM30 21h1v1h-1zM32 21h2v1h-2zM39 21h1v1h-1zM41 21h2v1h-2zM45 21h1v1h-1zM48 21h1v1h-1zM52 21h1v1h-1zM54 21h1v1h-1zM56 21h1v1h-1zM4 22h1v1h-1zM6 22h2v1h-2zM9 22h2v1h-2zM13 22h1v1h-1zM15 22h1v1h-1zM18 22h2v1h-2zM21 22h1v1h-1zM23 22h5v1h-5zM29 22h1v1h-1zM32 22h1v1h-1zM36 22h1v1h-1zM39 22h2v1h-2zM43 22h2v1h-2zM49 22h1v1h-1zM52 22h1v1h-1zM54 22h3v1h-3zM6 23h2v1h-2zM9 23h1v1h-1zM11 23h3v1h-3zM17 23h2v1h-2zM21 23h2v1h-2zM30 23h4v1h-4zM36 23h4v1h-4zM41 23h3v1h-3zM52 23h1v1h-1zM55 23h1v1h-1zM4 24h1v1h-1zM6 24h2v1h-2zM10 24h3v1h-3zM15 24h2v1h-2zM19 24h3v1h-3zM23 24h4v1h-4zM28 24h2v1h-2zM31 24h1v1h-1zM34 24h1v1h-1zM37 24h1v1h-1zM42 24h1v1h-1zM44 24h3v1h-3zM48 24h5v1h-5zM54 24h3v1h-3zM4 25h1v1h-1zM6 25h3v1h-3zM13 25h2v1h-2zM17 25h1v1h-1zM20 25h1v1h-1zM23 25h2v1h-2zM26 25h4v1h-4zM32 25h2v1h-2zM35 25h1v1h-1zM37 25h1v1h-1zM39 25h2v1h-2zM42 25h2v1h-2zM45 25h1v1h-1zM51 25h2v1h-2zM55 25h2v1h-2zM4 26h1v1h-1zM6 26h1v1h-1zM8 26h4v1h-4zM13 26h2v1h-2zM17 26h4v1h-4zM22 26h3v1h-3zM27 26h1v1h-1zM30 26h1v1h-1zM33 26h2v1h-2zM38 26h2v1h-2zM41 26h4v1h-4zM47 26h1v1h-1zM50 26h1v1h-1zM52 26h4v1h-4zM6 27h1v1h-1zM8 27h2v1h-2zM14 27h1v1h-1zM16 27h2v1h-2zM21 27h1v1h-1zM24 27h1v1h-1zM26 27h1v1h-1zM28 27h1v1h-1zM32 27h4v1h-4zM37 27h1v1h-1zM40 27h4v1h-4zM45 27h1v1h-1zM49 27h1v1h-1zM51 27h4v1h-4zM6 28h1v1h-1zM8 28h6v1h-6zM16 28h2v1h-2zM20 28h3v1h-3zM27 28h6v1h-6zM34 28h3v1h-3zM38 28h3v1h-3zM43 28h4v1h-4zM48 28h5v1h-5zM56 28h1v1h-1zM5 29h1v1h-1zM7 29h2v1h-2zM12 29h1v1h-1zM14 29h3v1h-3zM18 29h4v1h-4zM23 29h1v1h-1zM25 29h1v1h-1zM28 29h1v1h-1zM32 29h2v1h-2zM36 29h1v1h-1zM38 29h1v1h-1zM41 29h1v1h-1zM43 29h2v1h-2zM47 29h2v1h-2zM52 29h1v1h-1zM54 29h2v1h-2zM4 30h1v1h-1zM6 30h1v1h-1zM8 30h1v1h-1zM10 30h1v1h-1zM12 30h1v1h-1zM17 30h1v1h-1zM22 30h7v1h-7zM30 30h1v1h-1zM32 30h3v1h-3zM41 30h4v1h-4zM47 30h2v1h-2zM50 30h1v1h-1zM52 30h2v1h-2zM55 30h2v1h-2zM5 31h2v1h-2zM8 31h1v1h-1zM12 31h1v1h-1zM15 31h2v1h-2zM20 31h2v1h-2zM23 31h2v1h-2zM26 31h3v1h-3zM32 31h2v1h-2zM37 31h1v1h-1zM40 31h2v1h-2zM43 31h1v1h-1zM45 31h1v1h-1zM47 31h2v1h-2zM52 31h1v1h-1zM5 32h1v1h-1zM7 32h8v1h-8zM16 32h3v1h-3zM20 32h1v1h-1zM22 32h2v1h-2zM28 32h10v1h-10zM39 32h5v1h-5zM45 32h9v1h-9zM56 32h1v1h-1zM6 33h1v1h-1zM9 33h1v1h-1zM14 33h4v1h-4zM19 33h4v1h-4zM24 33h1v1h-1zM26 33h1v1h-1zM28 33h1v1h-1zM30 33h1v1h-1zM32 33h1v1h-1zM34 33h1v1h-1zM36 33h2v1h-2zM39 33h1v1h-1zM42 33h1v1h-1zM50 33h2v1h-2zM53 33h1v1h-1zM56 33h1v1h-1zM4 34h1v1h-1zM6 34h3v1h-3zM10 34h2v1h-2zM13 34h1v1h-1zM16 34h2v1h-2zM20 34h2v1h-2zM23 34h2v1h-2zM26 34h4v1h-4zM31 34h1v1h-1zM33 34h2v1h-2zM36 34h2v1h-2zM39 34h2v1h-2zM43 34h1v1h-1zM45 34h2v1h-2zM49 34h2v1h-2zM53 34h1v1h-1zM55 34h2v1h-2zM6 35h4v1h-4zM11 35h3v1h-3zM18 35h3v1h-3zM23 35h1v1h-1zM25 35h1v1h-1zM28 35h1v1h-1zM31 35h8v1h-8zM40 35h1v1h-1zM48 35h2v1h-2zM51 35h1v1h-1zM56 35h1v1h-1zM7 36h1v1h-1zM10 36h1v1h-1zM13 36h2v1h-2zM16 36h3v1h-3zM20 36h1v1h-1zM23 36h1v1h-1zM25 36h4v1h-4zM30 36h1v1h-1zM33 36h1v1h-1zM39 36h3v1h-3zM44 36h1v1h-1zM46 36h1v1h-1zM51 36h1v1h-1zM54 36h3v1h-3zM5 37h1v1h-1zM9 37h1v1h-1zM12 37h2v1h-2zM19 37h1v1h-1zM22 37h1v1h-1zM24 37h2v1h-2zM28 37h2v1h-2zM35 37h1v1h-1zM39 37h3v1h-3zM43 37h3v1h-3zM49 37h3v1h-3zM55 37h2v1h-2zM4 38h2v1h-2zM7 38h1v1h-1zM10 38h1v1h-1zM12 38h3v1h-3zM19 38h3v1h-3zM23 38h1v1h-1zM26 38h2v1h-2zM30 38h1v1h-1zM34 38h1v1h-1zM36 38h3v1h-3zM40 38h2v1h-2zM47 38h2v1h-2zM51 38h3v1h-3zM5 39h2v1h-2zM8 39h1v1h-1zM12 39h2v1h-2zM19 39h1v1h-1zM21 39h1v1h-1zM24 39h1v1h-1zM26 39h1v1h-1zM28 39h1v1h-1zM32 39h4v1h-4zM37 39h1v1h-1zM41 39h6v1h-6zM49 39h2v1h-2zM54 39h3v1h-3zM4 40h1v1h-1zM6 40h2v1h-2zM10 40h3v1h-3zM14 40h3v1h-3zM18 40h4v1h-4zM31 40h1v1h-1zM33 40h1v1h-1zM35 40h3v1h-3zM39 40h3v1h-3zM44 40h3v1h-3zM49 40h3v1h-3zM56 40h1v1h-1zM5 41h3v1h-3zM9 41h1v1h-1zM11 41h1v1h-1zM13 41h1v1h-1zM16 41h1v1h-1zM19 41h1v1h-1zM22 41h1v1h-1zM24 41h1v1h-1zM26 41h2v1h-2zM31 41h2v1h-2zM34 41h2v1h-2zM38 41h1v1h-1zM41 41h1v1h-1zM50 41h1v1h-1zM53 41h1v1h-1zM55 41h2v1h-2zM4 42h3v1h-3zM8 42h1v1h-1zM10 42h1v1h-1zM13 42h4v1h-4zM18 42h1v1h-1zM21 42h4v1h-4zM27 42h1v1h-1zM30 42h2v1h-2zM33 42h2v1h-2zM36 42h1v1h-1zM40 42h1v1h-1zM43 42h1v1h-1zM45 42h1v1h-1zM47 42h1v1h-1zM49 42h3v1h-3zM53 42h1v1h-1zM55 42h2v1h-2zM5 43h1v1h-1zM11 43h3v1h-3zM15 43h4v1h-4zM20 43h1v1h-1zM22 43h3v1h-3zM26 43h2v1h-2zM30 43h1v1h-1zM35 43h2v1h-2zM38 43h3v1h-3zM44 43h1v1h-1zM46 43h1v1h-1zM48 43h1v1h-1zM50 43h2v1h-2zM56 43h1v1h-1zM5 44h3v1h-3zM10 44h2v1h-2zM13 44h2v1h-2zM17 44h2v1h-2zM20 44h3v1h-3zM24 44h1v1h-1zM28 44h2v1h-2zM31 44h1v1h-1zM34 44h1v1h-1zM36 44h1v1h-1zM38 44h1v1h-1zM40 44h3v1h-3zM47 44h2v1h-2zM50 44h1v1h-1zM5 45h2v1h-2zM8 45h2v1h-2zM12 45h5v1h-5zM20 45h1v1h-1zM22 45h1v1h-1zM24 45h1v1h-1zM26 45h1v1h-1zM29 45h3v1h-3zM33 45h3v1h-3zM41 45h4v1h-4zM47 45h1v1h-1zM54 45h1v1h-1zM56 45h1v1h-1zM4 46h2v1h-2zM7 46h4v1h-4zM12 46h1v1h-1zM18 46h2v1h-2zM21 46h3v1h-3zM25 46h1v1h-1zM27 46h1v1h-1zM29 46h1v1h-1zM32 46h1v1h-1zM34 46h1v1h-1zM36 46h1v1h-1zM39 46h1v1h-1zM44 46h1v1h-1zM49 46h2v1h-2zM54 46h3v1h-3zM5 47h2v1h-2zM11 47h1v1h-1zM13 47h2v1h-2zM17 47h3v1h-3zM21 47h1v1h-1zM23 47h2v1h-2zM27 47h1v1h-1zM32 47h2v1h-2zM35 47h2v1h-2zM40 47h1v1h-1zM43 47h2v1h-2zM46 47h4v1h-4zM52 47h1v1h-1zM55 47h1v1h-1zM7 48h1v1h-1zM10 48h1v1h-1zM14 48h2v1h-2zM17 48h1v1h-1zM23 48h1v1h-1zM25 48h1v1h-1zM28 48h5v1h-5zM40 48h4v1h-4zM45 48h1v1h-1zM48 48h5v1h-5zM54 48h1v1h-1zM56 48h1v1h-1zM12 49h1v1h-1zM15 49h4v1h-4zM21 49h1v1h-1zM24 49h3v1h-3zM28 49h1v1h-1zM32 49h1v1h-1zM34 49h1v1h-1zM38 49h1v1h-1zM43 49h3v1h-3zM48 49h1v1h-1zM52 49h1v1h-1zM54 49h3v1h-3zM4 50h7v1h-7zM12 50h1v1h-1zM15 50h1v1h-1zM17 50h1v1h-1zM19 50h5v1h-5zM27 50h2v1h-2zM30 50h1v1h-1zM32 50h5v1h-5zM40 50h2v1h-2zM43 50h2v1h-2zM47 50h2v1h-2zM50 50h1v1h-1zM52 50h4v1h-4zM4 51h1v1h-1zM10 51h1v1h-1zM12 51h1v1h-1zM15 51h5v1h-5zM23 51h3v1h-3zM28 51h1v1h-1zM32 51h1v1h-1zM34 51h1v1h-1zM39 51h2v1h-2zM43 51h6v1h-6zM52 51h5v1h-5zM4 52h1v1h-1zM6 52h3v1h-3zM10 52h1v1h-1zM22 52h2v1h-2zM25 52h2v1h-2zM28 52h5v1h-5zM34 52h11v1h-11zM47 52h6v1h-6zM55 52h1v1h-1zM4 53h1v1h-1zM6 53h3v1h-3zM10 53h1v1h-1zM12 53h1v1h-1zM14 53h3v1h-3zM21 53h3v1h-3zM25 53h2v1h-2zM28 53h4v1h-4zM34 53h2v1h-2zM38 53h1v1h-1zM40 53h2v1h-2zM49 53h2v1h-2zM52 53h3v1h-3zM4 54h1v1h-1zM6 54h3v1h-3zM10 54h1v1h-1zM13 54h2v1h-2zM16 54h1v1h-1zM20 54h2v1h-2zM25 54h1v1h-1zM27 54h2v1h-2zM32 54h1v1h-1zM37 54h1v1h-1zM39 54h2v1h-2zM42 54h1v1h-1zM44 54h1v1h-1zM51 54h3v1h-3zM55 54h2v1h-2zM4 55h1v1h-1zM10 55h1v1h-1zM12 55h2v1h-2zM15 55h1v1h-1zM17 55h1v1h-1zM19 55h2v1h-2zM23 55h1v1h-1zM26 55h1v1h-1zM28 55h1v1h-1zM30 55h2v1h-2zM33 55h1v1h-1zM35 55h3v1h-3zM41 55h1v1h-1zM43 55h3v1h-3zM51 55h2v1h-2zM55 55h1v1h-1zM4 56h7v1h-7zM15 56h1v1h-1zM17 56h7v1h-7zM30 56h1v1h-1zM35 56h2v1h-2zM38 56h1v1h-1zM40 56h1v1h-1zM42 56h1v1h-1zM49 56h2v1h-2zM52 56h2v1h-2zM55 56h1v1h-1z';
  const SN_STAR = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3c0 12-5 17-17 17 12 0 17 5 17 17 0-12 5-17 17-17C25 20 20 15 20 3Z" fill="currentColor"/><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width=".6" opacity=".55"/></svg>';

  add('supernova', {
    frame: 'phone', bg: '#001166', color: '#cbb2ff',
    text: {
      es: {
        eyebrow: 'Tu próximo gran momento', title: 'Ya sos parte.', brand: 'supernova', ok: 'Confirmado',
        category: 'Bienestar', mode: 'Presencial', event: 'Un respiro para vos', dateL: 'Fecha', date: '28 de octubre', timeL: 'Hora', time: '09:00 h',
        place: 'Espacio Bienestar · Buenos Aires', forL: 'Este momento es para', name: 'Alex García', pass: 'Pase individual', code: 'SN-F3EAA17B',
        save: 'Guardar fecha', download: 'Descargar pase',
      },
      en: {
        eyebrow: 'Your next big moment', title: 'You’re in.', brand: 'supernova', ok: 'Confirmed',
        category: 'Wellness', mode: 'In person', event: 'A breather for you', dateL: 'Date', date: 'October 28', timeL: 'Time', time: '09:00',
        place: 'Espacio Bienestar · Buenos Aires', forL: 'This moment is for', name: 'Alex García', pass: 'Single pass', code: 'SN-F3EAA17B',
        save: 'Save the date', download: 'Download pass',
      },
    },
    html: t => `<i class="sn-stars"></i><i class="sn-glow"></i>
      <span class="sn-btn" style="right:76px">${icon('<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>')}</span>
      <span class="sn-btn" style="right:18px">${icon('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')}</span>
      <div class="sn-intro">
        <div class="sn-intro-row"><span class="sn-emblem">${icon('<path class="sn-chk" d="M18 6 7 17l-5-5"/><path class="sn-chk" d="m22 10-7.5 7.5L13 16"/>')}</span><span class="sn-eye tex">${esc(t.eyebrow)}</span></div>
        <h2 class="sn-title">${esc(t.title)}</h2>
      </div>
      <div class="sn-ticket">
        <span class="sn-water">✦</span><span class="sn-foil"><i></i></span>
        <div class="sn-top"><span class="sn-brand">${SN_STAR}<b>${esc(t.brand)}</b></span><span class="sn-ok tex">${icon('<path d="M20 6 9 17l-5-5"/>')}${esc(t.ok)}</span></div>
        <div class="sn-main">
          <span class="sn-cat">${esc(t.category)} <i></i> ${esc(t.mode)}</span>
          <h3 class="sn-ev">${esc(t.event)}</h3>
          <div class="sn-row">
            <div class="sn-dt"><span><small class="tex">${esc(t.dateL)}</small><strong>${esc(t.date)}</strong></span><span><small class="tex">${esc(t.timeL)}</small><strong>${esc(t.time)}</strong></span></div>
            <span class="sn-qr"><svg viewBox="0 0 61 61" shape-rendering="crispEdges" aria-hidden="true"><rect width="61" height="61" fill="#ffffff"/><path d="${SN_QR}" fill="#09090b"/></svg></span>
          </div>
          <span class="sn-loc tex">${icon('<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>')}${esc(t.place)}</span>
        </div>
        <div class="sn-tear"><i></i><span></span><i></i></div>
        <div class="sn-bottom">
          <div class="sn-who"><small class="tex">${esc(t.forL)}</small><strong>${esc(t.name)}</strong><span class="tex">${esc(t.pass)}</span></div>
          <div class="sn-code">${icon('<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>', ' stroke-width="1.6"')}<span class="tex">${esc(t.code)}</span></div>
        </div>
      </div>
      <div class="sn-acts">
        <span class="sn-act pri tex">${icon('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>')}${esc(t.save)}</span>
        <span class="sn-act tex">${icon('<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>')}${esc(t.download)}</span>
      </div>`,
    play(D, v, T) {
      // "Ya sos parte.": the emblem checks, the pass rises (PersonalTicket: y 28 → 0, .96 → 1, ease [.16, 1, .3, 1]),
      // its QR prints top to bottom and the foil light crosses it
      enter(D, T, q(v, '.sn-emblem'), { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.4)' }, T + 0.06);
      enter(D, T, qa(v, '.sn-chk'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.3, ease: 'power2.out', stagger: 0.08 }, T + 0.16);
      enter(D, T, q(v, '.sn-title'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, T + 0.1);
      enter(D, T, q(v, '.sn-ticket'), { y: 90, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.7, ease: 'expo.out' }, T + 0.14);
      enter(D, T, q(v, '.sn-qr svg'), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.32, ease: 'power2.inOut' }, T + 0.4);
      enter(D, T, q(v, '.sn-ok'), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2.2)' }, T + 0.5);
      enter(D, T, q(v, '.sn-foil i'), { xPercent: 0 }, { xPercent: 330, duration: 0.42, ease: 'power2.inOut' }, T + 0.56);
      enter(D, T, q(v, '.sn-acts'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, T + 0.5);
      D.sfx('beep', T + 0.42, 1320, 0.08, 0.04);
    },
  });

  /* ── GAMES-MARKET ───────────────────────────────────────────────────────────────────────────────────────────
     The catalog page (src/routes/CatalogPage.tsx + GameCard, ui/catalog/badges.tsx), tokens of src/styles/tokens.css.
     Six real entries of src/games/registry.ts; the counts are the build's (18 playable of 24). */
  const GM_STATUS = { stable: '#2be38a', beta: '#ffb020' }, GM_TOPO = { solo: '#22e3f5', gamepad: '#a78bfa' };
  const GM_CARDS = [
    { topo: 'solo', status: 'stable', eff: 'S', net: false },
    { topo: 'solo', status: 'stable', eff: 'S', net: false },
    { topo: 'solo', status: 'stable', eff: 'M', net: false },
    { topo: 'solo', status: 'stable', eff: 'M', net: false },
    { topo: 'gamepad', status: 'beta', eff: 'M', net: true },
    { topo: 'gamepad', status: 'beta', eff: 'M', net: true },
  ];
  const GM_HOT = 2;

  add('games', {
    frame: 'browser', url: 'github.com/Toti-Gauna/games-market', bg: '#5b21b6', color: '#22e3f5',
    text: {
      es: {
        h1: 'Batería de experiencias', kiosk: 'Modo quiosco',
        lede: 'Los 24 juegos del catálogo, implementados o no. Abrí cualquiera para jugarlo con sus administrables en vivo.',
        playable: '18', playableL: 'jugables', pending: '6', pendingL: 'pendientes',
        filters: ['Categoría', 'Todas', 'Retro', 'Moderno', 'Creativo / 3D', 'Topología', 'Todas', 'Individual', 'Celular como control', 'Arena compartida'],
        topo: { solo: 'Individual', gamepad: 'Celular como control' }, status: { stable: 'Estable', beta: 'Beta' }, engine: 'Canvas 2D', net: 'Red', play: 'Jugar',
        games: [
          ['R3', 'Serpiente', 'Crecés juntando los principios de la cultura. Chocarte es el burnout.', '1 jugador · ~1 min'],
          ['M3', 'Vuelo', 'Un toque para subir. La gravedad hace el resto.', '1 jugador · ~1 min'],
          ['M2', 'Catapulta', 'Tres tiros por nivel y estructuras que se derrumban.', '1 jugador · ~4 min'],
          ['M5', 'Ninja', 'Deslizás para cortar. Las bombas terminan la partida.', '1 jugador · ~2 min'],
          ['R1', 'Supernova Pong', 'Dos celulares son las paletas, el proyector es la cancha.', '2 jugadores · ~3 min'],
          ['R4', 'Invasores', 'Hasta 4 celulares son cañones en la misma pantalla. La horda es común.', '1–4 jugadores · ~4 min'],
        ],
      },
      en: {
        h1: 'The experience lineup', kiosk: 'Kiosk mode',
        lede: 'All 24 games in the catalog, built or not. Open any of them to play it with its admin settings live.',
        playable: '18', playableL: 'playable', pending: '6', pendingL: 'pending',
        filters: ['Category', 'All', 'Retro', 'Modern', 'Creative / 3D', 'Topology', 'All', 'Solo', 'Phone as controller', 'Shared arena'],
        topo: { solo: 'Solo', gamepad: 'Phone as controller' }, status: { stable: 'Stable', beta: 'Beta' }, engine: 'Canvas 2D', net: 'Network', play: 'Play',
        games: [
          ['R3', 'Serpiente', 'You grow by collecting the culture’s principles. Crashing is burnout.', '1 player · ~1 min'],
          ['M3', 'Vuelo', 'One tap to rise. Gravity does the rest.', '1 player · ~1 min'],
          ['M2', 'Catapulta', 'Three shots per level and structures that come down.', '1 player · ~4 min'],
          ['M5', 'Ninja', 'Swipe to slice. Bombs end the round.', '1 player · ~2 min'],
          ['R1', 'Supernova Pong', 'Two phones are the paddles, the projector is the court.', '2 players · ~3 min'],
          ['R4', 'Invasores', 'Up to 4 phones are cannons on the same screen. The horde is shared.', '1–4 players · ~4 min'],
        ],
      },
    },
    html: t => `<div class="gm-top"><h1 class="gm-h">${esc(t.h1)}</h1><span class="gm-kiosk tex">${esc(t.kiosk)}</span></div>
      <p class="gm-lede">${esc(t.lede)}</p>
      <p class="gm-count"><b>${esc(t.playable)}</b> ${esc(t.playableL)} · <em>${esc(t.pending)}</em> ${esc(t.pendingL)}</p>
      <div class="gm-filters tex">${t.filters.map((f, i) => (i === 0 || i === 5) ? `<small>${esc(f)}</small>` : `<span${i === 1 || i === 6 ? ' class="on"' : ''}>${esc(f)}</span>`).join('')}</div>
      <div class="gm-grid">${GM_CARDS.map((c, i) => { const [code, title, tag, foot] = t.games[i]; return `<div class="gm-card${i === GM_HOT ? ' hot' : ''}"><i class="gm-glow"></i>
        <div class="gm-ct"><div><span class="gm-code tex">${esc(code)}</span><span class="gm-title">${esc(title)}<i>${esc(title)}</i></span></div><span class="gm-eff tex">${esc(c.eff)}</span></div>
        <p class="gm-tag tex">${esc(tag)}</p>
        <div class="gm-chips tex"><span style="color:${GM_TOPO[c.topo]}">${esc(t.topo[c.topo])}</span><span>${esc(t.engine)}</span><span><i style="background:${GM_STATUS[c.status]}"></i>${esc(t.status[c.status])}</span>${c.net ? `<span>${esc(t.net)}</span>` : ''}</div>
        <div class="gm-foot"><span class="tex">${esc(foot)}</span><b>${esc(t.play)}</b></div>
      </div>`; }).join('')}</div>`,
    play(D, v, T) {
      const cards = qa(v, '.gm-card'), glows = qa(v, '.gm-glow');
      const order = [0, 1, 3, 2, 4, 5]; // diagonal wave: (0,0) (0,1) (1,0) (0,2) (1,1) (1,2)
      const at = i => T + 0.1 + order.indexOf(i) * 0.065;
      cards.forEach((c, i) => {
        enter(D, T, c, { opacity: 0, y: 46, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'expo.out' }, at(i));
        // each tile lights as it lands; the hovered one stays lit, the rest settle
        if (i === GM_HOT) enter(D, T, glows[i], { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' }, at(i) + 0.12);
        else { enter(D, T, glows[i], { opacity: 0 }, { opacity: 0.85, duration: 0.14, ease: 'power2.out' }, at(i) + 0.08); D.tl.to(glows[i], { opacity: 0, duration: 0.3, ease: 'power2.in' }, at(i) + 0.24); }
      });
      enter(D, T, q(v, '.gm-card.hot .gm-title i'), { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' }, at(GM_HOT) + 0.2);
      D.sfx('plip', at(GM_HOT) + 0.12, 0.1, 880);
    },
  });

  /* ── KINETIC STUDIO ─────────────────────────────────────────────────────────────────────────────────────────
     The trailer hub (index.html + hub/hub.css): its intro and the library of generative posters. Each poster is the
     hub's own art: hub/motifs.ts drawn with the palette and title of hub/catalog.ts (same seeded RNG, catalog order),
     with the poster's scrim, number, badge and title. Sixteen of the catalog, laid as a wall. */
  const KN = [
    { p0: "#0e0e10", p1: "#ff4d2e", fg: "#f2ede4", m: "<circle cx=\"104\" cy=\"38\" r=\"19\" fill=\"#ff4d2e\"/><rect x=\"117\" y=\"33\" width=\"27\" height=\"27\" fill=\"#2b50ff\" transform=\"rotate(14 130 46)\"/><path d=\"M84 66 L100 38 L116 66Z\" fill=\"#ffc21a\"/>" },
    { p0: "#f2ede4", p1: "#0e0e10", fg: "#0e0e10", m: "<text x=\"154\" y=\"64\" text-anchor=\"end\" font-family=\"Archivo\" font-weight=\"900\" font-size=\"62\" fill=\"none\" stroke=\"#ff4d2e\" stroke-width=\".8\">Aa</text><text x=\"148\" y=\"60\" text-anchor=\"end\" font-family=\"Archivo\" font-weight=\"900\" font-size=\"62\" fill=\"#ff4d2e\">Aa</text>" },
    { p0: "#0a0a0a", p1: "#00ff9c", fg: "#f2ede4", m: "<rect x=\"70.0\" y=\"10.0\" width=\"50.8\" height=\"2.7\" fill=\"#00ff9c\" opacity=\"0.95\"/><rect x=\"71.8\" y=\"16.4\" width=\"75.6\" height=\"3.1\" fill=\"#ff2e88\" opacity=\"0.95\"/><rect x=\"90.7\" y=\"22.8\" width=\"52.1\" height=\"3.4\" fill=\"#f2ede4\" opacity=\"0.5\"/><rect x=\"81.3\" y=\"29.2\" width=\"37.1\" height=\"4.4\" fill=\"#00ff9c\" opacity=\"0.95\"/><rect x=\"75.6\" y=\"35.6\" width=\"46.8\" height=\"3.9\" fill=\"#ff2e88\" opacity=\"0.95\"/><rect x=\"103.1\" y=\"42.0\" width=\"47.0\" height=\"1.8\" fill=\"#f2ede4\" opacity=\"0.5\"/><rect x=\"78.7\" y=\"48.4\" width=\"68.1\" height=\"3.9\" fill=\"#00ff9c\" opacity=\"0.95\"/><rect x=\"92.2\" y=\"54.8\" width=\"52.7\" height=\"2.4\" fill=\"#ff2e88\" opacity=\"0.95\"/><rect x=\"82.3\" y=\"61.2\" width=\"71.8\" height=\"1.5\" fill=\"#f2ede4\" opacity=\"0.5\"/><rect x=\"77.7\" y=\"67.6\" width=\"58.6\" height=\"4.4\" fill=\"#00ff9c\" opacity=\"0.95\"/><rect x=\"70.5\" y=\"74.0\" width=\"47.1\" height=\"5.0\" fill=\"#ff2e88\" opacity=\"0.95\"/>" },
    { p0: "#f2ede4", p1: "#e63922", fg: "#0e0e10", m: "<circle cx=\"116\" cy=\"44\" r=\"28\" fill=\"#e63922\"/><rect x=\"88\" y=\"14\" width=\"9\" height=\"58\" fill=\"#1d4ed8\"/><path d=\"M116 16 A28 28 0 0 1 144 44 L116 44Z\" fill=\"#0e0e10\"/><line x1=\"78\" y1=\"76\" x2=\"156\" y2=\"76\" stroke=\"#0e0e10\" stroke-width=\"1\"/><circle cx=\"150\" cy=\"18\" r=\"4\" fill=\"#1d4ed8\"/>" },
    { p0: "#1e0b3a", p1: "#7c3aed", fg: "#f2ede4", m: "<path d=\"M140.4,44.0C141.2,48.9 134.2,56.8 129.8,60.6C125.4,64.5 119.6,65.9 114.1,67.1C108.5,68.3 101.4,69.9 96.3,67.7C91.3,65.4 84.7,58.8 83.5,53.6C82.3,48.4 87.0,41.9 89.1,36.4C91.3,30.9 92.0,23.9 96.3,20.3C100.7,16.8 110.3,13.2 115.1,15.1C119.9,16.9 121.0,26.4 125.2,31.2C129.5,36.0 139.7,39.1 140.4,44.0Z\" fill=\"#7c3aed\"/><path d=\"M150.4,58.0C150.2,60.7 143.7,63.1 141.1,65.7C138.5,68.2 137.6,72.3 134.7,73.5C131.8,74.6 126.2,74.2 123.7,72.4C121.2,70.5 120.5,65.8 119.5,62.5C118.6,59.3 117.2,56.0 117.9,52.9C118.6,49.7 121.0,45.1 123.7,43.6C126.5,42.2 131.3,43.3 134.4,44.2C137.5,45.2 139.8,46.9 142.5,49.2C145.1,51.5 150.6,55.3 150.4,58.0Z\" fill=\"#22d3ee\" style=\"mix-blend-mode:screen\"/><path d=\"M102.5,22.0C102.6,23.3 100.2,25.1 99.0,26.2C97.8,27.3 96.6,27.9 95.1,28.3C93.6,28.7 91.5,29.3 90.2,28.6C88.9,28.0 87.6,25.9 87.3,24.4C87.0,23.0 87.8,21.4 88.3,19.9C88.7,18.4 89.0,16.2 90.2,15.4C91.3,14.5 94.0,14.1 95.3,14.6C96.6,15.2 97.0,17.3 98.2,18.5C99.4,19.7 102.4,20.7 102.5,22.0Z\" fill=\"#22d3ee\" opacity=\".8\"/>" },
    { p0: "#020617", p1: "#3b82f6", fg: "#f2ede4", m: "<rect x=\"77.0\" y=\"10.0\" width=\"70.0\" height=\"70.0\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"1.60\" transform=\"rotate(0 112 45)\"/><rect x=\"81.2\" y=\"14.2\" width=\"61.6\" height=\"61.6\" fill=\"none\" stroke=\"#e879f9\" stroke-width=\"1.41\" transform=\"rotate(9 112 45)\"/><rect x=\"85.4\" y=\"18.4\" width=\"53.2\" height=\"53.2\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"1.22\" transform=\"rotate(18 112 45)\"/><rect x=\"89.6\" y=\"22.6\" width=\"44.8\" height=\"44.8\" fill=\"none\" stroke=\"#e879f9\" stroke-width=\"1.02\" transform=\"rotate(27 112 45)\"/><rect x=\"93.8\" y=\"26.8\" width=\"36.4\" height=\"36.4\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"0.83\" transform=\"rotate(36 112 45)\"/><rect x=\"98.0\" y=\"31.0\" width=\"28.0\" height=\"28.0\" fill=\"none\" stroke=\"#e879f9\" stroke-width=\"0.64\" transform=\"rotate(45 112 45)\"/><rect x=\"102.2\" y=\"35.2\" width=\"19.6\" height=\"19.6\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"0.45\" transform=\"rotate(54 112 45)\"/><rect x=\"106.4\" y=\"39.4\" width=\"11.2\" height=\"11.2\" fill=\"none\" stroke=\"#e879f9\" stroke-width=\"0.26\" transform=\"rotate(63 112 45)\"/>" },
    { p0: "#fde68a", p1: "#f97316", fg: "#0e0e10", m: "<path d=\"M98,38 L112,45 L98,52 L84,45Z\" fill=\"#0e0e10\"/><path d=\"M84,45 L98,52 L98,66 L84,59Z\" fill=\"#f97316\"/><path d=\"M112,45 L98,52 L98,66 L112,59Z\" fill=\"#1e293b\"/><path d=\"M126,33 L137,38.5 L126,44 L115,38.5Z\" fill=\"#0e0e10\"/><path d=\"M115,38.5 L126,44 L126,55 L115,49.5Z\" fill=\"#f97316\"/><path d=\"M137,38.5 L126,44 L126,55 L137,49.5Z\" fill=\"#1e293b\"/><path d=\"M120,62 L128,66 L120,70 L112,66Z\" fill=\"#0e0e10\"/><path d=\"M112,66 L120,70 L120,78 L112,74Z\" fill=\"#f97316\"/><path d=\"M128,66 L120,70 L120,78 L128,74Z\" fill=\"#1e293b\"/><path d=\"M144,58 L150,61 L144,64 L138,61Z\" fill=\"#0e0e10\"/><path d=\"M138,61 L144,64 L144,70 L138,67Z\" fill=\"#f97316\"/><path d=\"M150,61 L144,64 L144,70 L150,67Z\" fill=\"#1e293b\"/>" },
    { p0: "#0b1026", p1: "#8b5cf6", fg: "#f2ede4", m: "<circle cx=\"82.2\" cy=\"52.3\" r=\"1.19\" fill=\"#8b5cf6\"/><circle cx=\"124.7\" cy=\"22.8\" r=\"1.57\" fill=\"#fbbf24\"/><circle cx=\"112.3\" cy=\"42.8\" r=\"1.45\" fill=\"#f2ede4\"/><circle cx=\"113.8\" cy=\"22.2\" r=\"0.62\" fill=\"#8b5cf6\"/><circle cx=\"82.2\" cy=\"59.9\" r=\"1.35\" fill=\"#fbbf24\"/><circle cx=\"101.4\" cy=\"68.0\" r=\"0.96\" fill=\"#f2ede4\"/><circle cx=\"122.3\" cy=\"35.9\" r=\"0.43\" fill=\"#8b5cf6\"/><circle cx=\"96.8\" cy=\"66.7\" r=\"0.86\" fill=\"#fbbf24\"/><circle cx=\"68.9\" cy=\"52.0\" r=\"1.27\" fill=\"#f2ede4\"/><circle cx=\"159.6\" cy=\"47.8\" r=\"1.28\" fill=\"#8b5cf6\"/><circle cx=\"126.8\" cy=\"59.0\" r=\"0.96\" fill=\"#fbbf24\"/><circle cx=\"66.2\" cy=\"50.5\" r=\"0.95\" fill=\"#f2ede4\"/><circle cx=\"151.9\" cy=\"36.7\" r=\"0.69\" fill=\"#8b5cf6\"/><circle cx=\"117.5\" cy=\"47.8\" r=\"1.48\" fill=\"#fbbf24\"/><circle cx=\"99.1\" cy=\"45.8\" r=\"1.12\" fill=\"#f2ede4\"/><circle cx=\"110.5\" cy=\"31.9\" r=\"0.54\" fill=\"#8b5cf6\"/><circle cx=\"86.0\" cy=\"49.5\" r=\"1.14\" fill=\"#fbbf24\"/><circle cx=\"109.1\" cy=\"61.4\" r=\"0.53\" fill=\"#f2ede4\"/><circle cx=\"64.0\" cy=\"49.1\" r=\"1.41\" fill=\"#8b5cf6\"/><circle cx=\"103.9\" cy=\"28.7\" r=\"1.52\" fill=\"#fbbf24\"/><circle cx=\"138.8\" cy=\"32.1\" r=\"0.80\" fill=\"#f2ede4\"/><circle cx=\"83.2\" cy=\"36.5\" r=\"1.65\" fill=\"#8b5cf6\"/><circle cx=\"110.8\" cy=\"61.8\" r=\"0.59\" fill=\"#fbbf24\"/><circle cx=\"123.8\" cy=\"50.4\" r=\"1.30\" fill=\"#f2ede4\"/><circle cx=\"134.0\" cy=\"48.8\" r=\"0.87\" fill=\"#8b5cf6\"/><circle cx=\"153.5\" cy=\"35.8\" r=\"1.06\" fill=\"#fbbf24\"/><circle cx=\"105.5\" cy=\"54.3\" r=\"1.44\" fill=\"#f2ede4\"/><circle cx=\"100.3\" cy=\"24.0\" r=\"1.38\" fill=\"#8b5cf6\"/><circle cx=\"131.4\" cy=\"53.2\" r=\"0.97\" fill=\"#fbbf24\"/><circle cx=\"112.7\" cy=\"45.1\" r=\"0.44\" fill=\"#f2ede4\"/><circle cx=\"89.2\" cy=\"32.5\" r=\"1.45\" fill=\"#8b5cf6\"/><circle cx=\"130.3\" cy=\"37.0\" r=\"1.69\" fill=\"#fbbf24\"/><circle cx=\"140.9\" cy=\"51.9\" r=\"0.62\" fill=\"#f2ede4\"/><circle cx=\"138.2\" cy=\"31.7\" r=\"0.72\" fill=\"#8b5cf6\"/><circle cx=\"107.2\" cy=\"34.6\" r=\"1.21\" fill=\"#fbbf24\"/><circle cx=\"87.5\" cy=\"36.0\" r=\"1.04\" fill=\"#f2ede4\"/><circle cx=\"81.3\" cy=\"50.7\" r=\"1.22\" fill=\"#8b5cf6\"/><circle cx=\"150.9\" cy=\"35.5\" r=\"1.13\" fill=\"#fbbf24\"/><circle cx=\"131.1\" cy=\"43.0\" r=\"0.89\" fill=\"#f2ede4\"/><circle cx=\"107.8\" cy=\"39.3\" r=\"0.90\" fill=\"#8b5cf6\"/><circle cx=\"105.6\" cy=\"36.6\" r=\"1.60\" fill=\"#fbbf24\"/><circle cx=\"85.7\" cy=\"49.9\" r=\"1.49\" fill=\"#f2ede4\"/><circle cx=\"135.7\" cy=\"62.8\" r=\"0.71\" fill=\"#8b5cf6\"/><circle cx=\"89.5\" cy=\"47.6\" r=\"0.81\" fill=\"#fbbf24\"/><circle cx=\"139.3\" cy=\"63.2\" r=\"1.13\" fill=\"#f2ede4\"/><circle cx=\"121.4\" cy=\"31.7\" r=\"0.98\" fill=\"#8b5cf6\"/><circle cx=\"76.0\" cy=\"54.7\" r=\"1.42\" fill=\"#fbbf24\"/><circle cx=\"72.8\" cy=\"52.9\" r=\"1.42\" fill=\"#f2ede4\"/><circle cx=\"140.9\" cy=\"38.4\" r=\"0.41\" fill=\"#8b5cf6\"/><circle cx=\"73.9\" cy=\"56.1\" r=\"1.57\" fill=\"#fbbf24\"/><circle cx=\"96.6\" cy=\"52.1\" r=\"0.88\" fill=\"#f2ede4\"/><circle cx=\"100.8\" cy=\"59.1\" r=\"1.38\" fill=\"#8b5cf6\"/><circle cx=\"80.7\" cy=\"45.8\" r=\"1.14\" fill=\"#fbbf24\"/><circle cx=\"90.4\" cy=\"59.0\" r=\"0.81\" fill=\"#f2ede4\"/><circle cx=\"102.0\" cy=\"42.6\" r=\"1.65\" fill=\"#8b5cf6\"/><circle cx=\"67.8\" cy=\"44.3\" r=\"1.15\" fill=\"#fbbf24\"/><circle cx=\"110.1\" cy=\"64.4\" r=\"1.05\" fill=\"#f2ede4\"/><circle cx=\"86.6\" cy=\"49.3\" r=\"1.59\" fill=\"#8b5cf6\"/><circle cx=\"73.7\" cy=\"43.3\" r=\"1.12\" fill=\"#fbbf24\"/><circle cx=\"132.8\" cy=\"37.5\" r=\"1.49\" fill=\"#f2ede4\"/><circle cx=\"107.8\" cy=\"43.2\" r=\"1.53\" fill=\"#8b5cf6\"/><circle cx=\"126.1\" cy=\"64.6\" r=\"0.61\" fill=\"#fbbf24\"/><circle cx=\"129.8\" cy=\"41.4\" r=\"1.41\" fill=\"#f2ede4\"/><circle cx=\"118.3\" cy=\"40.0\" r=\"1.50\" fill=\"#8b5cf6\"/><circle cx=\"91.3\" cy=\"36.3\" r=\"1.05\" fill=\"#fbbf24\"/><circle cx=\"110.3\" cy=\"53.8\" r=\"1.08\" fill=\"#f2ede4\"/><circle cx=\"76.8\" cy=\"56.7\" r=\"1.09\" fill=\"#8b5cf6\"/><circle cx=\"83.0\" cy=\"63.2\" r=\"0.88\" fill=\"#fbbf24\"/><circle cx=\"154.0\" cy=\"35.4\" r=\"1.26\" fill=\"#f2ede4\"/><circle cx=\"117.9\" cy=\"63.8\" r=\"0.59\" fill=\"#8b5cf6\"/><circle cx=\"67.7\" cy=\"50.0\" r=\"0.82\" fill=\"#fbbf24\"/><circle cx=\"135.5\" cy=\"65.6\" r=\"1.62\" fill=\"#f2ede4\"/><circle cx=\"74.3\" cy=\"54.4\" r=\"0.41\" fill=\"#8b5cf6\"/><circle cx=\"97.5\" cy=\"59.1\" r=\"1.06\" fill=\"#fbbf24\"/><circle cx=\"135.4\" cy=\"31.8\" r=\"1.03\" fill=\"#f2ede4\"/><circle cx=\"93.1\" cy=\"50.3\" r=\"1.44\" fill=\"#8b5cf6\"/><circle cx=\"118.3\" cy=\"50.7\" r=\"1.57\" fill=\"#fbbf24\"/><circle cx=\"119.8\" cy=\"58.2\" r=\"0.86\" fill=\"#f2ede4\"/><circle cx=\"127.6\" cy=\"55.1\" r=\"0.76\" fill=\"#8b5cf6\"/><circle cx=\"108.4\" cy=\"30.0\" r=\"0.77\" fill=\"#fbbf24\"/><circle cx=\"153.3\" cy=\"56.9\" r=\"0.56\" fill=\"#f2ede4\"/><circle cx=\"145.2\" cy=\"40.8\" r=\"1.24\" fill=\"#8b5cf6\"/><circle cx=\"111.4\" cy=\"51.0\" r=\"0.56\" fill=\"#fbbf24\"/><circle cx=\"124.3\" cy=\"42.9\" r=\"1.29\" fill=\"#f2ede4\"/><circle cx=\"107.9\" cy=\"44.5\" r=\"0.89\" fill=\"#8b5cf6\"/><circle cx=\"99.4\" cy=\"61.5\" r=\"0.55\" fill=\"#fbbf24\"/><circle cx=\"107.0\" cy=\"64.4\" r=\"1.48\" fill=\"#f2ede4\"/><circle cx=\"77.7\" cy=\"48.9\" r=\"0.94\" fill=\"#8b5cf6\"/><circle cx=\"144.4\" cy=\"62.4\" r=\"1.37\" fill=\"#fbbf24\"/><circle cx=\"91.2\" cy=\"29.6\" r=\"0.87\" fill=\"#f2ede4\"/><circle cx=\"152.0\" cy=\"58.0\" r=\"1.15\" fill=\"#8b5cf6\"/><circle cx=\"126.7\" cy=\"31.2\" r=\"1.31\" fill=\"#fbbf24\"/><circle cx=\"94.7\" cy=\"37.3\" r=\"1.42\" fill=\"#f2ede4\"/><circle cx=\"101.7\" cy=\"42.1\" r=\"1.21\" fill=\"#8b5cf6\"/><circle cx=\"152.5\" cy=\"41.9\" r=\"1.41\" fill=\"#fbbf24\"/><circle cx=\"106.4\" cy=\"33.0\" r=\"1.63\" fill=\"#f2ede4\"/><circle cx=\"110.4\" cy=\"51.7\" r=\"1.02\" fill=\"#8b5cf6\"/><circle cx=\"134.2\" cy=\"56.1\" r=\"0.94\" fill=\"#fbbf24\"/><circle cx=\"143.4\" cy=\"45.6\" r=\"1.36\" fill=\"#f2ede4\"/><circle cx=\"67.4\" cy=\"43.6\" r=\"0.82\" fill=\"#8b5cf6\"/><circle cx=\"95.8\" cy=\"24.0\" r=\"0.75\" fill=\"#fbbf24\"/><circle cx=\"121.9\" cy=\"43.8\" r=\"0.49\" fill=\"#f2ede4\"/><circle cx=\"128.0\" cy=\"26.0\" r=\"0.97\" fill=\"#8b5cf6\"/><circle cx=\"82.6\" cy=\"56.7\" r=\"1.61\" fill=\"#fbbf24\"/><circle cx=\"96.4\" cy=\"56.2\" r=\"0.84\" fill=\"#f2ede4\"/><circle cx=\"84.7\" cy=\"54.7\" r=\"1.30\" fill=\"#8b5cf6\"/><circle cx=\"97.8\" cy=\"36.5\" r=\"1.26\" fill=\"#fbbf24\"/><circle cx=\"149.3\" cy=\"56.9\" r=\"0.88\" fill=\"#f2ede4\"/><circle cx=\"81.6\" cy=\"59.3\" r=\"1.38\" fill=\"#8b5cf6\"/><circle cx=\"107.6\" cy=\"51.3\" r=\"0.42\" fill=\"#fbbf24\"/><circle cx=\"112\" cy=\"45\" r=\"3\" fill=\"#f2ede4\"/>" },
    { p0: "#1a0536", p1: "#ff2e97", fg: "#f2ede4", m: "<defs><linearGradient id=\"lab-kn-gsun\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#ffd319\"/><stop offset=\"1\" stop-color=\"#ff2e97\"/></linearGradient></defs><circle cx=\"116\" cy=\"40\" r=\"24\" fill=\"url(#lab-kn-gsun)\"/><rect x=\"90\" y=\"44\" width=\"52\" height=\"1.2\" fill=\"var(--p0)\"/><rect x=\"90\" y=\"50\" width=\"52\" height=\"1.9\" fill=\"var(--p0)\"/><rect x=\"90\" y=\"55\" width=\"52\" height=\"2.5999999999999996\" fill=\"var(--p0)\"/><rect x=\"90\" y=\"59\" width=\"52\" height=\"3.3\" fill=\"var(--p0)\"/><rect x=\"60\" y=\"64\" width=\"100\" height=\"26\" fill=\"var(--p0)\"/><line x1=\"116\" y1=\"64\" x2=\"28\" y2=\"90\" stroke=\"#ff2e97\" stroke-width=\".7\"/><line x1=\"116\" y1=\"64\" x2=\"72\" y2=\"90\" stroke=\"#ff2e97\" stroke-width=\".7\"/><line x1=\"116\" y1=\"64\" x2=\"94\" y2=\"90\" stroke=\"#ff2e97\" stroke-width=\".7\"/><line x1=\"116\" y1=\"64\" x2=\"116\" y2=\"90\" stroke=\"#ff2e97\" stroke-width=\".7\"/><line x1=\"116\" y1=\"64\" x2=\"138\" y2=\"90\" stroke=\"#ff2e97\" stroke-width=\".7\"/><line x1=\"116\" y1=\"64\" x2=\"160\" y2=\"90\" stroke=\"#ff2e97\" stroke-width=\".7\"/><line x1=\"116\" y1=\"64\" x2=\"204\" y2=\"90\" stroke=\"#ff2e97\" stroke-width=\".7\"/><line x1=\"60\" y1=\"66\" x2=\"160\" y2=\"66\" stroke=\"#ff2e97\" stroke-width=\".7\"/><line x1=\"60\" y1=\"70\" x2=\"160\" y2=\"70\" stroke=\"#ff2e97\" stroke-width=\".7\"/><line x1=\"60\" y1=\"76\" x2=\"160\" y2=\"76\" stroke=\"#ff2e97\" stroke-width=\".7\"/><line x1=\"60\" y1=\"84\" x2=\"160\" y2=\"84\" stroke=\"#ff2e97\" stroke-width=\".7\"/>" },
    { p0: "#0f172a", p1: "#10b981", fg: "#f2ede4", m: "<rect x=\"84\" y=\"52\" width=\"7\" height=\"22\" fill=\"#10b981\"/><rect x=\"94\" y=\"40\" width=\"7\" height=\"34\" fill=\"#10b981\"/><rect x=\"104\" y=\"46\" width=\"7\" height=\"28\" fill=\"#10b981\"/><rect x=\"114\" y=\"28\" width=\"7\" height=\"46\" fill=\"#10b981\"/><rect x=\"124\" y=\"34\" width=\"7\" height=\"40\" fill=\"#10b981\"/><rect x=\"134\" y=\"16\" width=\"7\" height=\"58\" fill=\"#f59e0b\"/><rect x=\"144\" y=\"24\" width=\"7\" height=\"50\" fill=\"#10b981\"/><line x1=\"80\" y1=\"74.5\" x2=\"156\" y2=\"74.5\" stroke=\"#f2ede4\" stroke-width=\"1\"/><path d=\"M84 50 L100 42 L114 46 L130 26 L150 18\" fill=\"none\" stroke=\"#f2ede4\" stroke-width=\"1.2\"/>" },
    { p0: "#0a0a0a", p1: "#e5e5e5", fg: "#f2ede4", m: "<path d=\"M60,0 L70,0 L110,90 L100,90Z\" fill=\"#e5e5e5\" opacity=\".13\"/><path d=\"M76,0 L86,0 L126,90 L116,90Z\" fill=\"#e5e5e5\" opacity=\".13\"/><path d=\"M92,0 L102,0 L142,90 L132,90Z\" fill=\"#e5e5e5\" opacity=\".13\"/><path d=\"M108,0 L118,0 L158,90 L148,90Z\" fill=\"#e5e5e5\" opacity=\".13\"/><path d=\"M124,0 L134,0 L174,90 L164,90Z\" fill=\"#e5e5e5\" opacity=\".13\"/><path d=\"M140,0 L150,0 L190,90 L180,90Z\" fill=\"#e5e5e5\" opacity=\".13\"/><line x1=\"127.9\" y1=\"50.6\" x2=\"125.9\" y2=\"58.6\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"147.0\" y1=\"77.3\" x2=\"145.0\" y2=\"85.3\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"71.6\" y1=\"33.4\" x2=\"69.6\" y2=\"41.4\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"99.1\" y1=\"12.2\" x2=\"97.1\" y2=\"20.2\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"104.8\" y1=\"27.0\" x2=\"102.8\" y2=\"35.0\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"81.6\" y1=\"37.8\" x2=\"79.6\" y2=\"45.8\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"150.9\" y1=\"31.3\" x2=\"148.9\" y2=\"39.3\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"101.3\" y1=\"56.6\" x2=\"99.3\" y2=\"64.6\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"76.4\" y1=\"69.2\" x2=\"74.4\" y2=\"77.2\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"138.0\" y1=\"54.7\" x2=\"136.0\" y2=\"62.7\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"104.7\" y1=\"6.5\" x2=\"102.7\" y2=\"14.5\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"114.5\" y1=\"74.1\" x2=\"112.5\" y2=\"82.1\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"89.7\" y1=\"57.3\" x2=\"87.7\" y2=\"65.3\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"146.4\" y1=\"61.3\" x2=\"144.4\" y2=\"69.3\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"130.1\" y1=\"75.5\" x2=\"128.1\" y2=\"83.5\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"148.9\" y1=\"55.2\" x2=\"146.9\" y2=\"63.2\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"103.0\" y1=\"51.5\" x2=\"101.0\" y2=\"59.5\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"157.3\" y1=\"72.0\" x2=\"155.3\" y2=\"80.0\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"98.8\" y1=\"22.6\" x2=\"96.8\" y2=\"30.6\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"97.5\" y1=\"20.0\" x2=\"95.5\" y2=\"28.0\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"71.5\" y1=\"5.3\" x2=\"69.5\" y2=\"13.3\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"154.2\" y1=\"47.4\" x2=\"152.2\" y2=\"55.4\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"137.6\" y1=\"72.6\" x2=\"135.6\" y2=\"80.6\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"120.5\" y1=\"10.3\" x2=\"118.5\" y2=\"18.3\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"87.8\" y1=\"28.8\" x2=\"85.8\" y2=\"36.8\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><line x1=\"133.6\" y1=\"26.1\" x2=\"131.6\" y2=\"34.1\" stroke=\"#f2ede4\" stroke-width=\".4\" opacity=\".35\"/><circle cx=\"126\" cy=\"36\" r=\"10\" fill=\"#000\"/><path d=\"M104 90 Q106 54 126 50 Q146 54 148 90Z\" fill=\"#000\"/>" },
    { p0: "#1c2016", p1: "#d2ad69", fg: "#f2ede4", m: "<path d=\"M84 22h9l7 30h34l6-22H98\" fill=\"none\" stroke=\"#f2ede4\" stroke-width=\"2.2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"104\" cy=\"62\" r=\"4\" fill=\"#f2ede4\"/><circle cx=\"130\" cy=\"62\" r=\"4\" fill=\"#f2ede4\"/><circle cx=\"142\" cy=\"20\" r=\"9\" fill=\"#f6f1e8\"/><rect x=\"104\" y=\"34\" width=\"10\" height=\"10\" fill=\"#d2ad69\"/><path d=\"M118 44l6-10 6 10z\" fill=\"#f2ede4\"/><path d=\"M146 44 L146 58 L150 54 L153 61 L155 60 L152 53 L157 53Z\" fill=\"#f2ede4\"/>" },
    { p0: "#cfcfcf", p1: "#1f57a8", fg: "#0e0e10", m: "<path d=\"M93 27 L88.5 22.5 M90 35 L84 34 M98 21 L97 15\" stroke=\"#1f57a8\" stroke-width=\"3.4\" stroke-linecap=\"round\"/><path d=\"M93 27 L88.5 22.5 M90 35 L84 34 M98 21 L97 15\" stroke=\"#f5f59a\" stroke-width=\"1.8\" stroke-linecap=\"round\"/><path d=\"M153.38,55.24L153.38,58.76L150.10,59.34L149.09,61.78L151.00,64.51L148.51,67.00L145.78,65.09L143.34,66.10L142.76,69.38L139.24,69.38L138.66,66.10L136.22,65.09L133.49,67.00L131.00,64.51L132.91,61.78L131.90,59.34L128.62,58.76L128.62,55.24L131.90,54.66L132.91,52.22L131.00,49.49L133.49,47.00L136.22,48.91L138.66,47.90L139.24,44.62L142.76,44.62L143.34,47.90L145.78,48.91L148.51,47.00L151.00,49.49L149.09,52.22L150.10,54.66Z\" fill=\"#1f57a8\" transform=\"rotate(10 141 57)\"/><circle cx=\"141\" cy=\"60.4\" r=\"3.1\" fill=\"#fff\"/><circle cx=\"137.4\" cy=\"53.8\" r=\"1.3\" fill=\"#0e0e10\"/><circle cx=\"144.6\" cy=\"53.8\" r=\"1.3\" fill=\"#0e0e10\"/><path d=\"M108 19 C114 29 125 39 125 52 A17 17 0 0 1 91 52 C91 39 102 29 108 19Z\" fill=\"#8ec5ff\" stroke=\"#1f57a8\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/><ellipse cx=\"99.5\" cy=\"44\" rx=\"2\" ry=\"4.2\" fill=\"#fff\" opacity=\".75\" transform=\"rotate(24 99.5 44)\"/><circle cx=\"102.5\" cy=\"51\" r=\"2.3\" fill=\"#0e0e10\"/><circle cx=\"113.5\" cy=\"51\" r=\"2.3\" fill=\"#0e0e10\"/><circle cx=\"103.2\" cy=\"50.2\" r=\".75\" fill=\"#fff\"/><circle cx=\"114.2\" cy=\"50.2\" r=\".75\" fill=\"#fff\"/><path d=\"M104 57 Q108 61 112 57\" fill=\"none\" stroke=\"#0e0e10\" stroke-width=\"1.5\" stroke-linecap=\"round\"/>" },
    { p0: "#0e0e10", p1: "#ff4d2e", fg: "#f2ede4", m: "<circle cx=\"118\" cy=\"45\" r=\"34\" fill=\"none\" stroke=\"#f2ede4\" stroke-width=\"1\" stroke-dasharray=\"1 4\"/><text x=\"118\" y=\"64\" text-anchor=\"middle\" font-family=\"Archivo\" font-weight=\"900\" font-size=\"54\" fill=\"#ff4d2e\">03</text>" },
    { p0: "#0e0e10", p1: "#a78bfa", fg: "#f2ede4", m: "<path d=\"M80 45 L104 45 L122 26 L150 26 M104 45 L122 64 L150 64 M122 26 L140 14 M122 64 L140 76\" fill=\"none\" stroke=\"#f2ede4\" stroke-width=\"1.2\" opacity=\".6\"/><circle cx=\"104\" cy=\"45\" r=\"4\" fill=\"#f2ede4\"/><circle cx=\"122\" cy=\"26\" r=\"3.4\" fill=\"#a78bfa\"/><circle cx=\"122\" cy=\"64\" r=\"3.4\" fill=\"#34d399\"/><circle cx=\"150\" cy=\"26\" r=\"2.4\" fill=\"#a78bfa\"/><circle cx=\"150\" cy=\"64\" r=\"2.4\" fill=\"#34d399\"/><circle cx=\"140\" cy=\"14\" r=\"2\" fill=\"#a78bfa\"/><circle cx=\"140\" cy=\"76\" r=\"2\" fill=\"#34d399\"/>" },
    { p0: "#111111", p1: "#d4ff3a", fg: "#f2ede4", m: "<rect x=\"80\" y=\"42.0\" width=\"2.4\" height=\"6.0\" rx=\"1.2\" fill=\"#d4ff3a\"/><rect x=\"84\" y=\"30.8\" width=\"2.4\" height=\"28.3\" rx=\"1.2\" fill=\"#d4ff3a\"/><rect x=\"88\" y=\"24.2\" width=\"2.4\" height=\"41.6\" rx=\"1.2\" fill=\"#ff4d2e\"/><rect x=\"92\" y=\"24.6\" width=\"2.4\" height=\"40.9\" rx=\"1.2\" fill=\"#d4ff3a\"/><rect x=\"96\" y=\"37.0\" width=\"2.4\" height=\"16.0\" rx=\"1.2\" fill=\"#d4ff3a\"/><rect x=\"100\" y=\"35.2\" width=\"2.4\" height=\"19.5\" rx=\"1.2\" fill=\"#d4ff3a\"/><rect x=\"104\" y=\"25.9\" width=\"2.4\" height=\"38.1\" rx=\"1.2\" fill=\"#d4ff3a\"/><rect x=\"108\" y=\"22.8\" width=\"2.4\" height=\"44.5\" rx=\"1.2\" fill=\"#ff4d2e\"/><rect x=\"112\" y=\"32.5\" width=\"2.4\" height=\"24.9\" rx=\"1.2\" fill=\"#d4ff3a\"/><rect x=\"116\" y=\"40.2\" width=\"2.4\" height=\"9.5\" rx=\"1.2\" fill=\"#d4ff3a\"/><rect x=\"120\" y=\"29.1\" width=\"2.4\" height=\"31.7\" rx=\"1.2\" fill=\"#d4ff3a\"/><rect x=\"124\" y=\"22.7\" width=\"2.4\" height=\"44.6\" rx=\"1.2\" fill=\"#d4ff3a\"/><rect x=\"128\" y=\"29.2\" width=\"2.4\" height=\"31.6\" rx=\"1.2\" fill=\"#ff4d2e\"/><rect x=\"132\" y=\"35.7\" width=\"2.4\" height=\"18.6\" rx=\"1.2\" fill=\"#d4ff3a\"/><rect x=\"136\" y=\"33.5\" width=\"2.4\" height=\"23.0\" rx=\"1.2\" fill=\"#d4ff3a\"/><rect x=\"140\" y=\"24.3\" width=\"2.4\" height=\"41.4\" rx=\"1.2\" fill=\"#d4ff3a\"/><rect x=\"144\" y=\"27.3\" width=\"2.4\" height=\"35.4\" rx=\"1.2\" fill=\"#d4ff3a\"/><rect x=\"148\" y=\"31.2\" width=\"2.4\" height=\"27.5\" rx=\"1.2\" fill=\"#ff4d2e\"/><rect x=\"152\" y=\"38.5\" width=\"2.4\" height=\"13.0\" rx=\"1.2\" fill=\"#d4ff3a\"/>" },
  ];

  add('kinetic', {
    frame: 'none', bg: '#0e0e10', color: '#ff4d2e',
    text: {
      es: {
        brand: 'Kinetic Studio', eyebrow: 'Trailer hub — motion graphics 100% código', h1: ['TRAILER', 'HUB'],
        lede: 'Cada tráiler se genera en vivo en el navegador: sin videos, sin imágenes y sin audio grabado.', badge: 'Disponible',
        posters: [['01', 'KINETIC'], ['02', 'MANIFIESTO'], ['03', 'GLITCH'], ['04', 'BAUHAUS 100'], ['05', 'LIQUID'], ['08', 'HYPERSPACE'], ['09', 'PAPER CITY'], ['06', 'BIG BANG'], ['23', 'SYNTHWAVE'], ['10', 'DATA STORY'], ['21', 'NOIR'], ['16', 'VELMAR'], ['31', 'HANDY · ANUNCIO'], ['19', 'COUNTDOWN'], ['27', 'BIFURCACIÓN'], ['24', 'BEAT']],
      },
      en: {
        brand: 'Kinetic Studio', eyebrow: 'Trailer hub — motion graphics, 100% code', h1: ['TRAILER', 'HUB'],
        lede: 'Every trailer is generated live in the browser: no video, no images and no recorded audio.', badge: 'Available',
        posters: [['01', 'KINETIC'], ['02', 'MANIFIESTO'], ['03', 'GLITCH'], ['04', 'BAUHAUS 100'], ['05', 'LIQUID'], ['08', 'HYPERSPACE'], ['09', 'PAPER CITY'], ['06', 'BIG BANG'], ['23', 'SYNTHWAVE'], ['10', 'DATA STORY'], ['21', 'NOIR'], ['16', 'VELMAR'], ['31', 'HANDY · ANUNCIO'], ['19', 'COUNTDOWN'], ['27', 'BIFURCACIÓN'], ['24', 'BEAT']],
      },
    },
    html: t => `<i class="kn-fade"></i>
      <div class="kn-stage"><div class="kn-wall">${KN.map((p, i) => {
        const [n, title] = t.posters[i];
        const size = Math.min(44, 330 / ([...title].length * 0.98)).toFixed(1);
        return `<div class="kn-card" style="--p0:${p.p0};--p1:${p.p1};color:${p.fg}"><svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${p.m}</svg>
          <span class="kn-num tex">${esc(n)}</span><span class="kn-badge tex">▶ ${esc(t.badge)}</span><span class="kn-word${size < 24 ? ' tex' : ''}" style="font-size:${size}px">${esc(title)}</span>${i === 0 ? '<i class="kn-sel"></i>' : ''}</div>`;
      }).join('')}</div></div>
      <div class="kn-intro">
        <p class="kn-brand"><span class="kn-mark"><i></i><i></i><i></i></span>${esc(t.brand)}</p>
        <p class="kn-eye tex">${esc(t.eyebrow)}</p>
        <h1 class="kn-h">${t.h1.map(w => `<span><span>${esc(w)}</span></span>`).join('')}</h1>
        <p class="kn-lede">${esc(t.lede)}</p>
      </div>`,
    play(D, v, T, dur) {
      const cards = qa(v, '.kn-card');
      // the library flips on in a diagonal wave, then KINETIC (01, where the kit was born) is the selected one
      cards.forEach((c, i) => {
        const r = Math.floor(i / 4), k = i % 4;
        enter(D, T, c, { opacity: 0, rotationX: -80, y: 40, transformOrigin: '50% 100%' }, { opacity: 1, rotationX: 0, y: 0, duration: 0.55, ease: 'expo.out' }, T + 0.06 + (r + k) * 0.045);
      });
      enter(D, T, qa(v, '.kn-h > span > span'), { yPercent: 135 }, { yPercent: 0, duration: 0.55, ease: 'expo.out', stagger: 0.07 }, T + 0.04);
      enter(D, T, q(v, '.kn-sel'), { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' }, T + 0.6);
      D.hit(cards[0], { scale: 1 }, { scale: 1.04, duration: 0.4, ease: 'expo.out' }, T + 0.6);
      D.hit(q(v, '.kn-stage'), { x: 0 }, { x: -70, duration: dur, ease: 'sine.inOut' }, T);
    },
  });
})();
