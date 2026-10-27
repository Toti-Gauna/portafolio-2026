/* ============================================================================
   CONOCER A IGNACIO — el tráiler (es-AR). 90 s · 21 escenas · 120 BPM (un compás = 2 s).
   Kit: engine.js (copia de Handy) + recipes.js, recipes-type.js, recipes-glitch.js, recipes-ui.js,
   recipes-dev.js, recipes-shop.js, recipes-branch.js (copias de bifurcacion) + recipes-music.js y audio.js
   (Handy + parche IG) + ig-kit.js (nuevo). Ver engine-plan.md. Cada dato sale de portafolio-2026/messages/es.json.
   Mismas escenas y tiempos que trailer.en.js: solo cambian los textos.
   ========================================================================== */
import { PARTITURA } from './partitura.js';
import { INK, PAPER, CORAL, BLUE, NIGHT, YELLOW, NAVY, ICE, GH, GREEN, ACTS, PALETTE, PROJECT, GLYPHS, MONOGRAM, SHAPES, MEDIA } from './ig-data.js';

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: {
    title: 'IGNACIO GAUNA', subtitle: 'CONOCER A IGNACIO', hud: 'IGNACIO GAUNA — SSR AI FULLSTACK DEVELOPER',
    pageTitle: 'Conocer a Ignacio — Ignacio Gauna',
  },
  ui: {
    play: 'REPRODUCIR', seconds: 'SEGUNDOS', sound: 'CON SONIDO', replay: 'DE NUEVO', back: 'VOLVER',
    keys: 'ESPACIO PAUSA · M SILENCIO · R DE NUEVO · F PANTALLA COMPLETA',
    paused: 'EN PAUSA', soundOn: 'SONIDO ACTIVADO', soundOff: 'SIN SONIDO', particles: '',
  },
  palette: PALETTE,
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Archivo', stretch: true },
  music: PARTITURA,
  mix: { gain: 0.6 },   // the recipes' foley (whoosh, boom, key…) under the score
  acts: ACTS,
  hudAt: 1.2,

  scenes: [
    // ── ACTO 1 · LA SEMILLA (0–8) ─────────────────────────────────────────────── noche · puntos
    { type: 'igcut', de: 'origin', fit: 4, label: 'MAR DEL PLATA', foley: 0.3,                                   //  0–4
      lines: ['MAR DEL PLATA', '17 <em>AÑOS</em>'], to: INK },
    { type: 'igcut', de: 'typewriter', fit: 4, label: 'LA SEMILLA', speed: 1.3,                                  //  4–8
      lines: ['QUERÍA HACER', 'UNA WEB DE <em>JUEGOS</em>.'], bg: INK, to: CORAL },

    // ── ACTO 2 · CAMINOS (8–16) · DROP 1 ──────────────────────────────────────── noche · anillos
    { type: 'igcut', de: 'particles', fit: 4, label: 'CAMINOS', foley: 0.45, word: 'CAMINOS', caption: '',       //  8–12
      cap: { at: 1.1, k: 'Mar del Plata · a los 17', t: 'Ese año se abrieron todos los caminos.', d: 'Soy autodidacta: leo mucho y estudio por internet.', w: 1300 } },
    { type: 'igcut', de: 'brline', fit: 4, duration: 6, label: 'RECORRIDO',                                      // 12–16
      kicker: 'RECORRIDO', lines: ['Una semilla,', 'muchos <em>caminos</em>.'],
      commits: ['17', '2021', '2023', '2024', '2026', 'HOY'] },

    // ── ACTO 3 · CARRERA (16–32) ──────────────────────────────────────────────── papel · grilla
    { type: 'shift', label: 'TACH', spin: 0, letterbox: 0,                                                       // 16–20
      steps: [
        { word: '2021', form: 'circle', name: 'CÍRCULO', bg: PAPER, shape: CORAL },
        { word: 'BILLETERA', form: SHAPES.card, name: 'TARJETA', bg: BLUE, shape: YELLOW },
        { word: 'WEB', form: SHAPES.browser, name: 'NAVEGADOR', bg: YELLOW, shape: INK },
        { word: 'MÓVIL', form: SHAPES.phone, name: 'TELÉFONO', bg: CORAL, shape: PAPER },
      ],
      cap: { k: '2021 – 2022 · TACH Argentina', t: 'Software Developer', d: 'Desarrollo en remoto: una billetera virtual, en web y móvil.' } },
    { type: 'stack', label: 'ADA ITW', hold: 4, bg: PAPER, fg: INK, accent: BLUE, height: 420, offsetY: -140, width: 1180,    // 20–24
      stacks: [['ENSEÑÉ', '*JAVASCRIPT', 'Y REACT']],
      cap: { k: '2023 – 2024 · Ada ITW', t: 'Profesor', d: 'Enseñar me ayudó a afianzar las bases y a explicar ideas técnicas con claridad.', w: 1500 } },
    { type: 'igwheel', label: 'TSOFT · TUENTI', bg: PAPER, land: 0,                                              // 24–28
      kicker: 'Gamificación', title: 'El juego volvió.', pills: ['Ruleta', 'Referidos'],
      colors: [CORAL, INK, BLUE, INK, YELLOW, INK, CORAL, INK],
      cap: { pos: 'br', w: 820, k: 'Desde 2024 · Tsoft', t: 'Tuenti y Telefónica', d: 'La ruleta Tuenti y el sistema de referidos.' } },
    { type: 'slam', label: 'RECARGAS · PAGOS', beat: 1,                                                          // 28–30
      words: [
        { text: 'RECARGA AUTOMÁTICA.', bg: BLUE, fg: PAPER, shape: 'circle', sc: YELLOW },
        { text: 'PAGOS.', bg: YELLOW, fg: INK, shape: 'triangle', sc: CORAL },
      ],
      cap: { at: 0.1, k: 'Tsoft · el stack', t: 'React, React Native, TypeScript, Next.js, Tailwind, Node.js y SQL.', w: 1500 } },
    { type: 'slam', label: '2026', beat: 0.5, glitch: [{ at: 0.98, dur: 0.22, amt: 0.9 }],                       // 30–32
      words: [
        { text: '2026', bg: INK, fg: PAPER, shape: 'circle', sc: CORAL },
        { text: 'DEV SSR', bg: PAPER, fg: INK, shape: 'triangle', sc: BLUE },
        { text: 'SSR AI', bg: CORAL, fg: INK, shape: 'circle', sc: INK },
        { text: 'FULLSTACK.', bg: BLUE, fg: PAPER, shape: 'triangle', sc: YELLOW },
      ],
      cap: { at: 0.05, k: '2026 · Tsoft', t: 'Dev Ssr → Ssr AI Fullstack Developer', d: 'En enero, un Reconocimiento Especial de Tsoft.', w: 1500 } },

    // ── ACTO 4 · CompliA (32–42) · DROP 2 ─────────────────────────────────────── azul noche · scan
    { type: 'remixtitle', label: 'IA EN PRODUCCIÓN', duration: 4, foley: 0.45, title: 'CompliA', stamp: 'RAG',   // 32–36
      colors: [NAVY, BLUE, ICE, PAPER, NAVY, CORAL],
      cap: { at: 1.1, k: '2026 · Portal de compliance de Telefónica', t: 'Lo diseñé y lo construí.', d: 'Un asistente con RAG: validaciones, restricciones y recomendaciones.', w: 1500 } },
    { type: 'igclip', label: 'DEMO · DATOS DE EJEMPLO', duration: 6, bg: NAVY,                                   // 36–42
      src: MEDIA.complia, poster: MEDIA.compliaPoster, from: 0.3, window: 'CompliA · demo', tag: 'DATOS DE EJEMPLO',
      cap: { pos: 'tr', w: 720, at: 0.6, k: 'En producción interna', t: 'Inteligencia artificial en producción, para compliance.', d: 'Recorte de la demo, con datos de ejemplo.' } },

    // ── ACTO 5 · RAMAS PROPIAS (42–52) ────────────────────────────────────────── tinta · ramas
    { type: 'igprojects', label: 'RAMAS PROPIAS', duration: 6, bg: INK,                                          // 42–48
      items: [
        { name: 'Eclipse', status: 'En desarrollo', color: PROJECT.eclipse },
        { name: 'HandyX', status: 'En desarrollo · lanza el 10/11', color: PROJECT.handyx },
        { name: 'Volta', status: 'Demo', color: PROJECT.volta },
        { name: 'Velmar', status: 'Demo · para un cliente', color: PROJECT.velmar },
        { name: 'DentalOS', status: 'Demo', color: PROJECT.dentalos },
        { name: 'Supernova Eventos', status: 'Prototipo', color: PROJECT.supernova },
        { name: 'games-market', status: 'Banco de pruebas', color: PROJECT.games },
        { name: 'Kinetic Studio', status: '32 tráileres en código', color: PROJECT.kinetic },
      ],
      cap: { pos: 'tl', k: 'Proyectos propios', t: 'Y mis propias ramas.', d: 'Cada una dice en qué punto está.' } },
    { type: 'statpunch', label: 'LABORATORIO', step: 1,                                                          // 48–52
      stats: [
        { value: 32, label: 'TRÁILERES HECHOS CON CÓDIGO', note: 'KINETIC STUDIO · GSAP, CANVAS, WEBGL, WEBAUDIO', bg: CORAL, fg: INK },
        { value: 15, label: 'MÓDULOS DE UNA CLÍNICA FICTICIA', note: 'DENTALOS · DEMO · SOLO FRONTEND', bg: PROJECT.dentalos, fg: INK },
        { value: 24, label: 'JUEGOS WEB EN EL ROADMAP', note: 'GAMES-MARKET · BANCO DE PRUEBAS · 2D Y 3D', bg: YELLOW, fg: INK },
        { value: 10, format: v => `${Math.round(v)}/11`, label: 'HANDYX SALE EL 10 DE NOVIEMBRE', note: 'EN DESARROLLO · MAR DEL PLATA', bg: '#1f57a8', fg: PAPER },
      ] },

    // ── ACTO 6 · EL SISTEMA (52–72) ───────────────────────────────────────────── coral / tinta · red
    { type: 'igcut', de: 'typewriter', fit: 4, label: 'SISTEMA', speed: 1.3,                                     // 52–56
      lines: ['UN SISTEMA AGÉNTICO,', 'DIVIDIDO EN <em>PARTES</em>.'], bg: INK, to: CORAL },
    { type: 'igagents', label: '11 AGENTES', duration: 6, bg: CORAL, ink: INK, accent: PAPER,                    // 56–62
      glyphs: GLYPHS,
      agents: [
        { id: 'chief', name: 'Dirección' }, { id: 'uxui', name: 'UX/UI' }, { id: 'design', name: 'Diseño' },
        { id: 'marketing', name: 'Marketing' }, { id: 'ads', name: 'Anuncios' }, { id: 'docs', name: 'Documentación' },
        { id: 'frontend', name: 'Frontend' }, { id: 'backend', name: 'Backend' }, { id: 'security', name: 'Ciberseguridad' },
        { id: 'game', name: 'Juegos' }, { id: 'trailer', name: 'Tráileres' },
      ],
      groups: [
        { ids: ['chief', 'uxui', 'design', 'marketing', 'ads'], at: 0.2 },
        { ids: ['frontend', 'backend', 'security', 'game', 'trailer'], at: 2.0 },
        { ids: ['docs'], at: 3.8 },
      ],
      cap: [
        { at: 0.1, to: 1.95, w: 1500, k: 'Producto', t: 'Primero, qué se hace y en qué orden.' },
        { at: 1.95, to: 3.75, w: 1500, k: 'Arquitectos', t: 'Cada uno con su parte.' },
        { at: 3.75, w: 1500, k: 'Documentación · 11 agentes', t: 'No es un prompt: es un sistema con roles.' },
      ] },
    { type: 'rules', label: 'REGLAS', step: 1, head: 'CÓMO TRABAJAN JUNTOS', unit: 'REGLA',                      // 62–66
      rules: [
        { text: 'Primero la especificación, después el código.', bg: PAPER, num: CORAL },
        { text: 'Cada afirmación tiene su nivel de evidencia.', bg: INK, num: CORAL },
        { text: 'Puertas con aprobación humana.', bg: BLUE, num: YELLOW },
        { text: 'Se prueba, no se mira a ojo.', bg: GH, num: GREEN },
      ] },
    { type: 'igcut', de: 'pipeline', fit: 4, duration: 5, cls: 'ig-pipe', label: 'CI',                           // 66–70
      window: 'ci · corrida del 27/10/2026', title: 'Corrida del 27/10/2026', sub: 'Tests automáticos, e2e con Playwright y CI',
      running: 'Corriendo', doneLabel: 'Todo en verde', total: 'Todo en verde', gap: 0.3, rowH: 58,
      cols: ['PROYECTO', 'PROGRESO', 'RESULTADO', ''],
      stages: [
        { name: 'Descubrir', time: 0.3 }, { name: 'Planificar', time: 0.3 }, { name: 'Construir', time: 0.3 },
        { name: 'Probar', time: 0.3 }, { name: 'Revisar', detail: 'OK humano', time: 0.3 }, { name: 'Entregar', time: 0.3 },
      ],
      rows: [
        { name: 'Eclipse-Web', value: '463 tests' },
        { name: 'Backend de Eclipse', value: '779 tests' },
        { name: 'Portal interno', value: '132 tests' },
        { name: 'Recorridos en navegador', value: '14' },
      ] },
    { type: 'slam', label: 'APROBACIÓN HUMANA', beat: 0.5,                                                       // 70–72
      words: [
        { text: 'NADA', bg: INK, fg: PAPER },
        { text: 'SE ENTREGA', bg: PAPER, fg: INK, shape: 'square', sc: CORAL },
        { text: 'SIN APROBACIÓN', bg: GREEN, fg: INK, shape: 'circle', sc: PAPER },
        { text: 'HUMANA.', bg: CORAL, fg: INK, shape: 'triangle', sc: INK },
      ] },

    // ── ACTO 7 · FINAL (72–90) · DROP 3 ───────────────────────────────────────── noche → tinta · sol
    { type: 'igcut', de: 'title', fit: 5, label: 'IGNACIO GAUNA', bg: NIGHT, foley: 0.5,                         // 72–77
      title: 'IGNACIO GAUNA', subtitle: 'SSR AI FULLSTACK DEVELOPER', colors: [CORAL, BLUE, YELLOW] },
    { type: 'igcut', de: 'statement', fit: 3, label: 'PRODUCCIÓN', bg: NIGHT, accent: CORAL,                     // 77–80
      text: 'CONSTRUYO SOFTWARE CON IA<br><span>QUE LLEGA A PRODUCCIÓN.</span>' },
    { type: 'igend', label: 'CONTACTO', duration: 10, handoff: 8, bg: INK, ink: PAPER, accent: CORAL,            // 80–90
      mono: MONOGRAM, name: 'IGNACIO GAUNA', role: 'SSR AI FULLSTACK DEVELOPER',
      open: 'Abierto a nuevas oportunidades.', lead: 'Busco un rol Ssr o Sr de desarrollo fullstack con IA.',
      email: 'ignaciogauna.developer@gmail.com' },
  ],
});
