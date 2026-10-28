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

    // ── ACTO 2 · CAMINOS (8–12) · DROP 1 ──────────────────────────────────────── noche · ramas
    { type: 'igburst', label: 'CAMINOS', word: 'CAMINOS', duration: 4, foley: 0.45,                           //  8–12
      cap: { at: 1.1, k: 'Mar del Plata · a los 17', t: 'Ese año se abrieron todos los caminos.', d: 'Soy autodidacta: leo mucho y estudio por internet.', w: 1300 } },

    // ── ACTO 3 · CARRERA (12–32) ──────────────────────────────────────────────── papel · una línea, una rama por trabajo
    { type: 'igcareer', label: 'RECORRIDO', duration: 20, letterbox: 0, at: [2, 6, 10, 14], backAt: 18,
      outro: 'De 2021 a hoy, <em>una sola línea</em>.',                 // 12–32
      kicker: 'RECORRIDO', title: 'Una semilla,<br>muchos <em>caminos</em>.', span: '2021 → 2026', seed: 'A LOS 17',
      stops: [
        { year: '2021', label: 'TACH', color: BLUE, vis: 'wallet', k: '2021 – 2022 · TACH Argentina', t: 'Software Developer',
          d: 'Desarrollo en remoto: una billetera virtual, en web y móvil.',
          v: { balance: 'Saldo disponible', send: 'Enviar', receive: 'Recibir', mobile: 'MÓVIL' } },
        { year: '2023', label: 'ADA ITW', color: YELLOW, vis: 'code', k: '2023 – 2024 · Ada ITW', t: 'Profesor',
          d: 'Enseñé JavaScript y React. Enseñar me ayudó a explicar ideas técnicas con claridad.',
          v: { file: 'Saludo.jsx', outLabel: 'Vista previa', out: 'Hola, mundo', lines: [
            '<span class="kw">function</span> <span class="fn">Saludo</span>({ nombre }) {',
            '  <span class="kw">return</span> <span class="tg">&lt;h1&gt;</span>Hola, {nombre}<span class="tg">&lt;/h1&gt;</span>;',
            '}',
            '<span class="tg">&lt;Saludo</span> nombre=<span class="st">"mundo"</span> <span class="tg">/&gt;</span>'] } },
        { year: '2024', label: 'TSOFT · TUENTI', color: CORAL, vis: 'wheel', k: 'Desde 2024 · Tsoft · para Tuenti y Telefónica', t: 'Gamificación,', t2: 'recargas y pagos',
          d: 'La ruleta Tuenti y el sistema de referidos (el juego volvió), la recarga automática y los pagos.',
          v: { chips: ['Ruleta', 'Referidos', 'Recarga automática', 'Pagos'] } },
        { year: '2026', label: '2026', color: GREEN, vis: 'stack', k: '2026 · Tsoft', t: 'Dev Ssr →', t2: 'Ssr AI Fullstack Developer',
          d: 'En enero, un Reconocimiento Especial de Tsoft.',
          v: { badgeK: 'Enero 2026 · Tsoft', badge: 'Reconocimiento Especial', stackK: 'El stack',
            stack: ['React', 'React Native', 'TypeScript', 'Next.js', 'Tailwind', 'Node.js', 'SQL'] } },
      ] },

    // ── ACTO 4 · CompliA (32–42) · DROP 2 ─────────────────────────────────────── azul noche · scan
    { type: 'igcase', label: 'IA EN PRODUCCIÓN', duration: 10, bg: NAVY,                                                  // 32–42
      kicker: '2026 · Portal de compliance de Telefónica', title: 'CompliA', sub: 'Inteligencia artificial en producción interna.',
      facts: [{ k: 'Rol', t: 'Lo diseñé y lo construí.' }, { k: 'Cómo', t: 'Un asistente con RAG: validaciones, restricciones y recomendaciones.' }, { k: 'Demo', t: 'Recorte de la demo, con datos de ejemplo.' }],
      src: MEDIA.complia, poster: MEDIA.compliaPoster, from: 0.3, window: 'CompliA · demo', tag: 'DATOS DE EJEMPLO' },

    // ── ACTO 5 · RAMAS PROPIAS (42–60) ────────────────────────────────────────── un color por proyecto · montaje
    // Cada proyecto muestra sus componentes reales, reconstruidos en código (js/shots/*): sin capturas ni video.
    { type: 'igprojects', label: 'RAMAS PROPIAS', duration: 3, step: 0.2, bg: INK,                                   // 42–45
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
    { type: 'igshots', label: 'RAMAS PROPIAS', title: 'Y mis propias ramas.', end: 'Todo, en código.', titleDur: 0, mosaic: 1.5,      // 45–60
      shots: [
        { id: 'eclipse-landing', dur: 1.5, tag: { name: 'Eclipse', status: 'En desarrollo', note: 'La landing: demos, precios y el siguiente paso' } },
        { id: 'eclipse-portal', dur: 1.5, tag: { name: 'Eclipse', status: 'En desarrollo', note: 'Portal de clientes · datos ficticios' } },
        { id: 'eclipse-ops', dur: 1.5, tag: { name: 'Eclipse', status: 'En desarrollo', note: 'Operación interna · datos de ejemplo' } },
        { id: 'handy-landing', dur: 1.5, tag: { name: 'HandyX', status: 'En desarrollo', note: 'La landing · lanza el 10/11' } },
        { id: 'handy-ops', dur: 1.5, tag: { name: 'HandyX', status: 'En desarrollo', note: 'Portal interno · registros ficticios' } },
        { id: 'volta', dur: 1, tag: { name: 'Volta', status: 'Demo', note: 'Tienda de suplementos, con gamificación' } },
        { id: 'velmar', dur: 1, tag: { name: 'Velmar', status: 'Demo', note: 'Tienda hecha para un cliente' } },
        { id: 'dentalos', dur: 1, tag: { name: 'DentalOS', status: 'Demo', note: '15 módulos de una clínica ficticia' } },
        { id: 'supernova', dur: 1, tag: { name: 'Supernova Eventos', status: 'Prototipo', note: 'Eventos, con datos ficticios' } },
        { id: 'games', dur: 1, tag: { name: 'games-market', status: 'Banco de pruebas', note: '24 juegos web en el roadmap' } },
        { id: 'kinetic', dur: 1, tag: { name: 'Kinetic Studio', status: '32 tráileres', note: 'Tráileres hechos con código, como este' } },
      ] },

    // ── ACTO 6 · TECNOLOGÍAS (60–78) ──────────────────────────────────────────── tinta · una animación por tecnología
    // Agrupadas por dónde las usé: en el trabajo, en mis proyectos y estudiando.
    { type: 'igstack', label: 'TECNOLOGÍAS', letterbox: 0,                                                    // 60–78
      screens: [
        { k: 'En el trabajo', t: 'Frontend y mobile', label: 'FRONTEND', tone: CORAL, bg: '#140f0f', dur: 4.5, tiles: ['react', 'typescript', 'nextjs', 'reactnative', 'tailwind'] },
        { k: 'En el trabajo', t: 'Backend, datos e IA', label: 'BACKEND · IA', tone: CORAL, bg: '#0f1014', dur: 4.5, tiles: ['node', 'sql', 'cicd', 'rag'] },
        { k: 'En mis proyectos', t: 'Seguridad, lenguajes y motion', label: 'PROYECTOS', tone: '#7fa3ff', bg: '#0d1020', dur: 4.5, tiles: ['security', 'python', 'c', 'motion', 'tests'] },
        { k: 'Estudiando', t: 'Machine learning y nube', label: 'ESTUDIO', tone: YELLOW, bg: '#14130c', dur: 4.5, tiles: ['ml', 'aws', 'azure'] },
      ] },

    // ── ACTO 7 · EL SISTEMA (78–94) ───────────────────────────────────────────── coral / tinta · red
    { type: 'igcut', de: 'typewriter', fit: 2, label: 'SISTEMA', speed: 1.3,                                     // 78–80
      lines: ['UN SISTEMA AGÉNTICO,', 'DIVIDIDO EN <em>PARTES</em>.'], bg: INK, to: CORAL },
    { type: 'igagents', label: '11 AGENTES', duration: 6, bg: CORAL, ink: INK, accent: PAPER,                    // 80–86
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
    { type: 'rules', label: 'REGLAS', step: 1, head: 'CÓMO TRABAJAN JUNTOS', unit: 'REGLA',                      // 86–90
      rules: [
        { text: 'Primero la especificación, después el código.', bg: PAPER, num: CORAL },
        { text: 'Cada afirmación tiene su nivel de evidencia.', bg: INK, num: CORAL },
        { text: 'Puertas con aprobación humana.', bg: BLUE, num: YELLOW },
        { text: 'Se prueba, no se mira a ojo.', bg: GH, num: GREEN },
      ] },
    { type: 'igcut', de: 'pipeline', fit: 4, duration: 5, cls: 'ig-pipe', label: 'CI',                           // 90–94
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

    // ── ACTO 8 · FINAL (94–112) · DROP 3 ───────────────────────────────────────── noche → tinta · sol
    { type: 'igcut', de: 'title', fit: 5, label: 'IGNACIO GAUNA', bg: NIGHT, foley: 0.5,                         // 94–99
      title: 'IGNACIO GAUNA', subtitle: 'SSR AI FULLSTACK DEVELOPER', colors: [CORAL, BLUE, YELLOW] },
    { type: 'igcut', de: 'statement', fit: 3, label: 'PRODUCCIÓN', bg: NIGHT, accent: CORAL,                     // 99–102
      text: 'CONSTRUYO SOFTWARE CON IA<br><span>QUE LLEGA A PRODUCCIÓN.</span>' },
    { type: 'igend', label: 'CONTACTO', duration: 10, handoff: 8, bg: INK, ink: PAPER, accent: CORAL,            // 102–112
      mono: MONOGRAM, name: 'IGNACIO GAUNA', role: 'SSR AI FULLSTACK DEVELOPER',
      open: 'Abierto a nuevas oportunidades.', lead: 'Busco un rol Ssr o Sr de desarrollo fullstack con IA.',
      email: 'ignaciogauna.developer@gmail.com', link: 'linkedin.com/in/ignacio-emanuel-gauna' },
  ],
});
