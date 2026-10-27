/* Act 5 shots — handy group (contract in js/ig-shots.js). Two real HandyX components, rebuilt in code:
   · handy-landing: the hero of handy-landing-page-fe (src/render/paginas.ts paginaInicio + src/styles/main.css .hero*)
     with the phone of the demo's home screen (src/render/demo/usuario.ts 'u-inicio', src/styles/demo-app.css .hd-*).
     Copy: src/content/inicio.json (hero), sitio.json (header), rubros.json, demo-usuario.json (inicio).
   · handy-ops: the pre-registrations list of handy-internal-portal in its sample view (?demo=1):
     src/components/frame.ts (header + «Muestra» notice), src/pages/preregistros-list.ts (OPS-01 state tabs and rows),
     src/pages/preregistro-detail.ts (the WhatsApp sheet and «Paso que falta»), src/domain/preregistros.ts (labels and
     contactMessage), records from src/data/demo-data.ts (PRE-DEMO-E07, E04, E05, E08: fictional people).
   Brand: «Handyx» (as both products write it). Fonts: Archivo (shared, fonts/) + DM Sans (fonts/handy/, OFL).
   Images (media/shots/handy-*.webp): the Handyx logo and the Handys, from the landing's own src/img (assets/brand). */
(() => {
  'use strict';
  const { add } = Trailer.igShots;

  // line icons: same paths as handy-landing-page-fe/src/render/iconos.ts (24×24, currentColor)
  const P = {
    rayo: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    canilla: '<path d="M4 9h7a3 3 0 0 1 3 3v1"/><path d="M4 6v6"/><path d="M8 9V6h3"/><path d="M7 5h5"/><path d="M14 13h3a2 2 0 0 1 2 2v1"/><path d="M19 19.5c0 .8-.7 1.5-1.5 1.5S16 20.3 16 19.5c0-1 1.5-2.5 1.5-2.5s1.5 1.5 1.5 2.5Z"/>',
    llama: '<path d="M12 22c4 0 7-2.7 7-6.7 0-3.4-2.3-5.9-4-7.8-.4 1.8-1.4 3-2.6 3.5C12.9 8 12 4.6 9.5 2 9.6 5.4 5 8.6 5 15.3 5 19.3 8 22 12 22Z"/><path d="M12 22c-1.7 0-3-1.2-3-3 0-2 1.8-3.2 3-4.8 1.2 1.6 3 2.8 3 4.8 0 1.8-1.3 3-3 3Z"/>',
    llave: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8"/><path d="m16 7 3 3"/><path d="m18.5 4.5 2 2"/>',
    ladrillos: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.3h18M3 14.7h18"/><path d="M9 4v5.3M15 4v5.3M12 9.3v5.4M7 14.7V20M17 14.7V20"/>',
    aire: '<rect x="2.5" y="4" width="19" height="9" rx="2"/><path d="M6 10h12"/><path d="M8 16.5c0 1.5-1 2-1 3.5M12 16.5v4M16 16.5c0 1.5 1 2 1 3.5"/>',
    pin: '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/>',
    campana: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Z"/><path d="M10 21h4"/>',
    abajo: '<path d="m6 9 6 6 6-6"/>',
    derecha: '<path d="m9 6 6 6-6 6"/>',
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    calendario: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/><path d="M7.5 13h2M11 13h2M14.5 13h2M7.5 16.5h2M11 16.5h2"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    casa: '<path d="M3 11 12 3l9 8"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    lista: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    maletin: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>',
    salir: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5"/><path d="M5 12h11"/>',
    whatsapp: '<path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.2 3.1l-4.7 1.4Z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1c-1.2-.5-2.4-1.7-2.9-2.9l1-1-1-2L9 8.5Z"/>',
    copiar: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  };
  const ic = (n, c = 'hx-ic') => `<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
  const IMG = n => `media/shots/handy-${n}.webp`;
  const RUBRO_IC = ['rayo', 'canilla', 'llama', 'llave', 'ladrillos', 'aire'];
  const PICK = 1; // the tile that gets pressed: Plomería
  // status bar of the phone (signal, wifi, battery), as the landing draws it (.app-senal, .app-wifi, .app-bateria)
  const STATUS = '<svg viewBox="0 0 78 22" aria-hidden="true"><g fill="currentColor"><rect x="0" y="14" width="4" height="6" rx="1"/><rect x="6" y="10" width="4" height="10" rx="1"/><rect x="12" y="6" width="4" height="14" rx="1"/><rect x="18" y="2" width="4" height="18" rx="1"/>'
    + '<path d="M38 19.5 33.6 15a6.2 6.2 0 0 1 8.8 0Z"/><path d="M30.8 12.2a10.2 10.2 0 0 1 14.4 0l-1.9 1.9a7.5 7.5 0 0 0-10.6 0Z"/><path d="M28 9.4a14.2 14.2 0 0 1 20 0l-1.9 1.9a11.5 11.5 0 0 0-16.2 0Z"/>'
    + '<rect x="56" y="5" width="19" height="12" rx="2.5"/><rect x="76" y="9" width="2" height="4" rx="1"/></g><rect x="54" y="3" width="23" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".45"/></svg>';

  /* ── 1 · handy-landing: «¿Se rompió algo en casa?» + the app's «¿Qué necesitás hoy?» ───────────────────── */
  add('handy-landing', {
    frame: 'browser', url: 'handyc.com', bg: '#1F57A8', color: '#F5F59A',
    text: {
      es: {
        tagline: 'Soluciones, no problemas',
        nav: ['Cómo funciona', 'Especialistas', 'Demo', 'Preguntas'], navCta: 'Anotarme',
        pill: 'Mar del Plata · sale el 10/11',
        h: ['¿Se rompió', 'algo', 'en casa?'],
        sub: ['Especialistas verificados de Mar del Plata.', 'Ves el precio antes de confirmar.'],
        cta1: 'Quiero usar Handyx', cta2: 'Soy especialista',
        time: '9:41', badge: '2', addr: 'Catamarca 1650 · La Perla',
        q: ['¿Qué necesitás ', 'hoy', '?'],
        tiles: ['Electricidad', 'Plomería', 'Gas', 'Cerrajería', 'Albañilería', 'Aire acond.'],
        next: 'Tu próximo turno', esp: 'Especialista 2', espIni: 'E2', espRubro: 'Electricidad', estado: 'Confirmado',
      },
      en: {
        tagline: 'Solutions, not problems',
        nav: ['How it works', 'Specialists', 'Demo', 'FAQ'], navCta: 'Sign up',
        pill: 'Mar del Plata · out Nov 10',
        h: ['Something', 'broken', 'at home?'],
        sub: ['Verified specialists in Mar del Plata.', 'You see the price before you confirm.'],
        cta1: 'I want to use Handyx', cta2: 'I’m a specialist',
        time: '9:41', badge: '2', addr: 'Catamarca 1650 · La Perla',
        q: ['What do you need ', 'today', '?'],
        tiles: ['Electrical', 'Plumbing', 'Gas', 'Locksmith', 'Masonry', 'Air con.'],
        next: 'Your next appointment', esp: 'Specialist 2', espIni: 'E2', espRubro: 'Electrical', estado: 'Confirmed',
      },
    },
    html: t => `<div class="hl">
      <header class="hl-hdr">
        <span class="hl-logo"><img src="${IMG('logo')}" alt="" width="720" height="158"><small class="tex">${t.tagline}</small></span>
        <nav class="hl-nav tex">${t.nav.map(n => `<span>${n}</span>`).join('')}</nav>
        <span class="hl-btn hl-btn--ama hl-btn--chico">${t.navCta}</span>
      </header>
      <div class="hl-text">
        <span class="hl-pill">${ic('pin')}${t.pill}</span>
        <h1 class="hl-h">${t.h.map((l, i) => `<span class="hl-m"><span class="hl-li">${i === 2 ? `<span class="hl-mk"><i class="hl-mk-bg"></i><span>${l}</span></span>` : l}</span></span>`).join('')}</h1>
        <p class="hl-sub">${t.sub.join('<br>')}</p>
        <div class="hl-ctas">
          <span class="hl-btn hl-btn--azul">${t.cta1}<i class="hl-flecha">${ic('flecha')}</i></span>
          <span class="hl-btn hl-btn--contorno">${t.cta2}</span>
        </div>
      </div>
      <div class="hl-escena">
        <i class="hl-mosaicos"></i>
        <img class="hl-handy hl-lamparita" src="${IMG('lamparita')}" alt="" width="202" height="346">
        <div class="hl-tel"><div class="hl-scr">
          <div class="hl-estado"><span class="tex">${t.time}</span><i class="hl-isla"></i><span class="hl-estado-ic">${STATUS}</span></div>
          <div class="hl-app-h">
            <span class="hl-app-logo"><img src="${IMG('logo')}" alt="" width="720" height="158"><small class="tex">${t.tagline}</small></span>
            <span class="hl-sq">${ic('campana')}<b class="tex">${t.badge}</b></span><span class="hl-sq">${ic('pin')}</span>
          </div>
          <span class="hl-addr tex">${ic('pin')}${t.addr}${ic('abajo')}</span>
          <p class="hl-q${t.q.join('').length > 20 ? ' hl-q--largo' : ''}">${t.q[0]}<span class="hl-q-mk">${t.q[1]}</span>${t.q[2]}</p>
          <div class="hl-grid">${t.tiles.map((r, i) => `<span class="hl-tile${i === PICK ? ' hl-tile--pick' : ''}"><i class="hl-tile-base"></i><i class="hl-tile-base hl-on"></i>
            <span class="hl-tile-face">${ic(RUBRO_IC[i])}<span class="${r.length > 11 ? 'tex' : ''}">${r}</span>
              ${i === PICK ? `<span class="hl-tile-on hl-on">${ic(RUBRO_IC[i])}<span>${r}</span></span><i class="hl-tap"></i>` : ''}</span></span>`).join('')}</div>
          <p class="hl-sobre tex">${t.next}</p>
          <div class="hl-turno"><span class="hl-av">${t.espIni}<i>${ic('check')}</i></span><span class="hl-turno-t"><strong>${t.esp}</strong><small class="tex">${ic('rayo')}${t.espRubro}</small></span><span class="hl-ok tex">${t.estado}</span></div>
        </div></div>
        <img class="hl-handy hl-engranaje" src="${IMG('engranaje')}" alt="" width="338" height="339">
        <img class="hl-handy hl-llave" src="${IMG('llave')}" alt="" width="581" height="547">
      </div>
    </div>`,
    play(D, v, T, dur) {
      const { tl } = D, $ = s => v.querySelector(s), $$ = s => [...v.querySelectorAll(s)];
      const end = T + dur;
      // the headline lands line by line (mask), then the yellow marker sweeps under «en casa?»
      D.hit($$('.hl-li'), { yPercent: 108 }, { yPercent: 0, duration: 0.5, ease: 'expo.out', stagger: 0.06 }, T + 0.04);
      D.hit($('.hl-mk-bg'), { scaleX: 0 }, { scaleX: 1, duration: 0.32, ease: 'power3.inOut' }, T + 0.4);
      D.hit([$('.hl-pill'), $('.hl-sub'), $('.hl-ctas')], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.06 }, T + 0.14);
      // the phone rises into place, then drifts
      D.hit($('.hl-tel'), { y: 70 }, { y: 0, duration: 0.7, ease: 'expo.out' }, T);
      tl.to($('.hl-tel'), { y: -14, duration: end - T - 0.7, ease: 'sine.inOut' }, T + 0.7);
      // the decisive move: a tap on «Plomería» — the tile sinks into its base and turns brand blue (.hd-mosaico--activo)
      const pick = $('.hl-tile--pick'), face = pick.querySelector('.hl-tile-face'), on = pick.querySelectorAll('.hl-on');
      const icons = pick.querySelectorAll('.hl-tile-face > .hx-ic, .hl-tile-on > .hx-ic');
      D.hit(pick.querySelector('.hl-tap'), { scale: 0.3, opacity: 0.55 }, { scale: 1.6, opacity: 0, duration: 0.5, ease: 'power2.out' }, T + 0.6);
      D.hit(face, { y: 0 }, { y: 6, duration: 0.07, ease: 'power2.in' }, T + 0.6);
      tl.to(face, { y: 0, duration: 0.3, ease: 'back.out(3)' }, T + 0.69);
      D.hit(on, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power1.out' }, T + 0.64);
      D.hit(icons, { scale: 1, rotation: 0 }, { scale: 0.86, rotation: -8, duration: 0.08, ease: 'power2.in' }, T + 0.6);
      tl.to(icons, { scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(3.5)' }, T + 0.69);
      D.sfx('tick', T + 0.62, 0.05);
      // the Handys keep a little life while the frame drifts
      D.hit($('.hl-lamparita'), { rotation: -6, y: 10 }, { rotation: 4, y: -6, duration: dur, ease: 'sine.inOut' }, T);
      D.hit($('.hl-engranaje'), { rotation: -30 }, { rotation: 24, duration: dur, ease: 'power1.out' }, T);
      D.hit($('.hl-llave'), { rotation: 8, y: 24 }, { rotation: -4, y: 0, duration: dur, ease: 'expo.out' }, T);
    },
  });

  /* ── 2 · handy-ops: «Pre-registros» in the sample view; a record moves to the next OPS-01 stage ─────────── */
  const ROWS = [ // PRE-DEMO-E07, E04, E05, E08 (src/data/demo-data.ts), all in Mar del Plata
    { ini: 'FO', name: 'Federico O.', ic: 'llama' },
    { ini: 'GC', name: 'Gabriela C.', ic: 'aire' },
    { ini: 'JM', name: 'Julián M.', ic: 'ladrillos' },
    { ini: 'ME', name: 'Mariana E.', ic: 'rayo' },
  ];
  const STATE = ['con_intentos', 'con_intentos', 'contactado', 'comprometido'];
  const roll = (a, b) => `<span class="ho-roll"><span class="ho-roll-in"><i>${a}</i><i>${b}</i></span></span>`;

  add('handy-ops', {
    frame: 'browser', url: 'interno.handyc.com/?demo=1', bg: '#F7F6F1', color: '#1F57A8',
    text: {
      es: {
        portal: 'Portal interno', nav: ['Inicio', 'Pre-registros', 'Especialistas'], salir: 'Salir de la muestra',
        muestra: 'Muestra', aviso: 'Todos los registros son ficticios.',
        eyebrow: 'Formulario de la landing', h: ['Pre-', 'registros'],
        tabs: ['Todos', 'Sin contactar', 'Con intentos', 'Contactado', 'Comprometido'],
        ciudad: 'Mar del Plata', anoto: ['Se anotó el 30 sept', 'Se anotó el 1 oct', 'Se anotó el 28 sept', 'Se anotó el 25 sept'],
        rubros: ['Gas', 'Aire acondicionado', 'Albañilería', 'Electricidad'],
        pills: ['Con intentos · 1', 'Con intentos · 2', 'Contactado', 'Comprometido'],
        sheetEyebrow: 'Mensaje sugerido', sheetTitle: 'Escribile por WhatsApp',
        msgA: 'Hola Federico, te escribimos de nuevo desde Handyx por tu pre-registro como especialista en gas. ¿Cuándo te queda cómodo que hablemos unos minutos?',
        msgB: 'Hola Federico, gracias por la charla. Para seguir con tu alta en Handyx, ¿qué día te queda bien?',
        abrir: 'Abrir WhatsApp', copiar: 'Copiar mensaje',
        pasoA: 'Paso que falta · Con intentos', pasoB: 'Paso que falta · Contactado',
        estadoA: 'Preregistrado, pendiente de contacto', estadoB: 'Contactado',
      },
      en: {
        portal: 'Internal portal', nav: ['Home', 'Pre-registrations', 'Specialists'], salir: 'Leave the sample',
        muestra: 'Sample', aviso: 'Every record is fictional.',
        eyebrow: 'Landing form', h: ['Pre-', 'registrations'],
        tabs: ['All', 'Not contacted', 'With attempts', 'Contacted', 'Committed'],
        ciudad: 'Mar del Plata', anoto: ['Signed up Sep 30', 'Signed up Oct 1', 'Signed up Sep 28', 'Signed up Sep 25'],
        rubros: ['Gas', 'Air conditioning', 'Masonry', 'Electrical'],
        pills: ['With attempts · 1', 'With attempts · 2', 'Contacted', 'Committed'],
        sheetEyebrow: 'Suggested message', sheetTitle: 'Message them on WhatsApp',
        msgA: 'Hi Federico, we’re writing again from Handyx about your pre-registration as a gas specialist. When would be a good time to talk for a few minutes?',
        msgB: 'Hi Federico, thanks for the chat. To move on with your onboarding at Handyx, which day works for you?',
        abrir: 'Open WhatsApp', copiar: 'Copy message',
        pasoA: 'Next step · With attempts', pasoB: 'Next step · Contacted',
        estadoA: 'Pre-registered, pending contact', estadoB: 'Contacted',
      },
    },
    html: t => `<div class="ho">
      <header class="ho-hdr">
        <span class="ho-logo"><img src="${IMG('logo')}" alt="" width="720" height="158"><small>${t.portal}</small></span>
        <nav class="ho-nav">
          <span class="ho-nl">${ic('casa')}${t.nav[0]}</span>
          <span class="ho-nl ho-nl--on">${ic('lista')}${t.nav[1]}<b class="ho-badge">${roll(9, 8)}</b></span>
          <span class="ho-nl">${ic('maletin')}${t.nav[2]}</span>
        </nav>
        <span class="ho-salir">${ic('salir')}<span class="tex">${t.salir}</span></span>
      </header>
      <div class="ho-aviso"><span class="ho-chip">${t.muestra}</span><p>${t.aviso}</p></div>
      <div class="ho-main">
        <section class="ho-izq">
          <p class="ho-eyebrow tex">${t.eyebrow}</p>
          <h1 class="ho-h">${t.h[0]}<span class="ho-marca">${t.h[1]}</span></h1>
          <div class="ho-card">
            <div class="ho-tabs">
              <span class="ho-tab ho-tab--on">${t.tabs[0]}<b>14</b></span>
              <span class="ho-tab">${t.tabs[1]}<b>6</b></span>
              <span class="ho-tab ho-tab--int">${t.tabs[2]}<b>${roll(3, 2)}</b></span>
              <span class="ho-tab ho-tab--con">${t.tabs[3]}<b>${roll(2, 3)}</b></span>
              <span class="ho-tab">${t.tabs[4]}<b>3</b></span>
            </div>
            <ul class="ho-filas">${ROWS.map((r, i) => `<li class="ho-fila${i === 0 ? ' ho-fila--sel' : ''}">${i === 0 ? '<i class="ho-sel"></i>' : ''}
              <span class="ho-av">${r.ini}</span>
              <span class="ho-fila-p"><strong>${r.name}</strong><span class="ho-meta tex"><span class="ho-ciudad">${ic('pin')}${t.ciudad}</span> · ${t.anoto[i]}</span></span>
              <span class="ho-rubro tex">${ic(r.ic)}${t.rubros[i]}</span>
              <span class="ho-estado"><span class="ho-pill ho-pill--${STATE[i]}">${t.pills[i]}</span>${i === 0 ? `<span class="ho-pill ho-pill--contactado ho-pill--nueva">${t.pills[2]}</span>` : ''}</span>
              <span class="ho-flecha">${ic('derecha')}</span>
            </li>`).join('')}</ul>
          </div>
        </section>
        <aside class="ho-der">
          <section class="ho-hoja">
            <i class="ho-manija"></i>
            <p class="ho-eyebrow ho-eyebrow--claro tex">${t.sheetEyebrow}</p>
            <h2 class="ho-sub">${t.sheetTitle}</h2>
            <div class="ho-burbuja"><span class="ho-msg">${t.msgA}</span><span class="ho-msg-alto" aria-hidden="true">${t.msgA}</span></div>
            <div class="ho-acciones">
              <span class="ho-btn ho-btn--wa">${ic('whatsapp')}${t.abrir}</span>
              <span class="ho-btn ho-btn--ama">${ic('copiar')}${t.copiar}</span>
            </div>
          </section>
          <section class="ho-paso">
            <p class="ho-eyebrow ho-swap tex"><span class="ho-a">${t.pasoA}</span><span class="ho-b">${t.pasoB}</span></p>
            <h2 class="ho-paso-t ho-swap"><span class="ho-a">${t.estadoA}</span><span class="ho-b">${t.estadoB}</span></h2>
          </section>
        </aside>
      </div>
    </div>`,
    play(D, v, T, dur, t) {
      const { tl } = D, $ = s => v.querySelector(s), $$ = s => [...v.querySelectorAll(s)];
      const AT = T + 0.56; // the record moves: «Hablamos» → Contactado (OPS-01: a conversation moves pendiente → contactado)
      // the list settles in, the selected record lights up
      D.hit($$('.ho-fila'), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.45, ease: 'expo.out', stagger: 0.05 }, T + 0.06);
      D.hit($('.ho-hoja'), { y: 60 }, { y: 0, duration: 0.6, ease: 'expo.out' }, T + 0.04);
      D.hit($('.ho-sel'), { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' }, T + 0.3);
      // the pill flips, the OPS-01 counters tick (con intentos 3→2, contactado 2→3, para contactar 9→8)
      const old = $('.ho-fila--sel .ho-pill'), neu = $('.ho-pill--nueva');
      D.hit(old, { scale: 1, opacity: 1 }, { scale: 0.7, opacity: 0, duration: 0.14, ease: 'power2.in' }, AT);
      D.hit(neu, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.42, ease: 'back.out(2.6)' }, AT + 0.1);
      D.hit($$('.ho-roll-in'), { yPercent: 0 }, { yPercent: -50, duration: 0.4, ease: 'expo.out', stagger: 0.04 }, AT + 0.06);
      D.hit($$('.ho-tab--int, .ho-tab--con'), { scale: 1 }, { scale: 1.06, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1 }, AT + 0.06);
      // «Paso que falta» moves to the next stage
      D.hit($$('.ho-swap .ho-a'), { yPercent: 0, opacity: 1 }, { yPercent: -60, opacity: 0, duration: 0.25, ease: 'power2.in' }, AT + 0.08);
      D.hit($$('.ho-swap .ho-b'), { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }, AT + 0.2);
      // and the next WhatsApp message is the one for a Contactado (contactMessage)
      tl.to($('.ho-msg'), { duration: 0.55, scrambleText: { text: t.msgB, chars: 'abcdefghijklmnopqrstuvwxyz', speed: 1, revealDelay: 0.15 }, ease: 'none' }, AT + 0.18);
      D.sfx('tick', AT, 0.05);
      D.sfx('key', AT + 0.2, 0.08);
    },
  });
})();
