/* ============================================================================
   CONOCER A IGNACIO — el tráiler (es-AR). 130 s · 15 escenas · 120 BPM (un compás = 2 s).
   La historia que contó Ignacio (28/10/2026): Mar del Plata → a los 17, una web de juegos que le cambió la vida →
   los frentes de trabajo (TACH, Ada ITW, Tsoft: Tuenti, CompliA, Supernova Eventos, el equipo), con una frase a lo
   largo de la línea antes de cada uno (`lead`, `exit`) → un camino propio
   → todos los caminos, que germinan en lo mismo: buscar nuevos desafíos → los rubros → lo que hace → el final.
   Sin puestos en ningún lado: desafíos. Cada dato sale de portafolio-2026/messages/es.json (journey, about, contact).
   Kit: engine.js (copia de Handy) + recipes*.js (copias de bifurcacion) + recipes-music.js y audio.js (Handy + parche IG)
   + ig-kit.js, ig-open.js, ig-fronts.js, ig-bloom.js, ig-case.js, ig-shots.js, ig-stack.js.
   Mismas escenas y tiempos que trailer.en.js: solo cambian los textos.
   ========================================================================== */
import { PARTITURA } from './partitura.js';
import { INK, PAPER, CORAL, BLUE, NIGHT, YELLOW, NAVY, GH, GREEN, ACTS, PALETTE, PROJECT, FRONT, GLYPHS, MONOGRAM, MEDIA } from './ig-data.js';

Trailer.run({
  lang: 'es',
  locale: 'es-AR',
  meta: {
    title: 'IGNACIO GAUNA', subtitle: 'CONOCER A IGNACIO', hud: 'IGNACIO GAUNA — CONOCER A IGNACIO',
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
    // ── 1 · MAR DEL PLATA (0–6) ──────────────────────────────────────────────── noche · la costa y una luz
    { type: 'igcoast', label: 'MAR DEL PLATA', duration: 6, foley: 0.5,                                          //   0–6
      kicker: 'Mar del Plata · Argentina', line: 'Todo empezó en<br><em>Mar del Plata.</em>', sea: 'Océano Atlántico' },

    // ── 2 · EL PRIMER PRODUCTO (6–12) · DROP 1 en el clic ─────────────────────── tinta · la web de juegos → ramas
    { type: 'igfirst', label: 'EL PRIMER PRODUCTO', duration: 6, foley: 0.6,                                      //   6–12
      kicker: 'Mar del Plata · a los 17', lines: ['Con 17 años programé', 'mi primer producto:'], big: 'una web de <em>juegos</em>.',
      after: '…que me cambió<br><em>la vida.</em>', afterSub: 'Soy autodidacta: leo mucho y estudio por internet.',
      site: { logo: 'JUEGOS', nav: ['Inicio', 'Juegos', 'Contacto'], play: 'JUGAR', ticker: '¡A JUGAR!' } },

    // ── 3 · LOS FRENTES (12–42) ──────────────────────────────────────────────── papel · una línea, una rama por frente
    { type: 'igfronts', label: 'FRENTES DE TRABAJO', letterbox: 0,                                     //  12–42
      origin: { year: 'A LOS 17', color: CORAL },
      stops: [
        { year: '2021', label: 'TACH', color: FRONT.tach, vis: 'tach',
          lead: { text: 'Y ese fue mi primer paso hacia nuevas experiencias, como trabajar en…', dur: 4 }, stay: 5,
          k: '2021 – 2022 · TACH Argentina',
          t: 'Una billetera virtual, de punta a punta.', d: 'En remoto: el backoffice, la landing y la app, en web y móvil.',
          v: { tags: ['BACKOFFICE', 'LANDING', 'APP'], balance: 'Saldo disponible', send: 'Enviar', receive: 'Recibir' } },
        { year: '2023', label: 'ADA ITW', color: FRONT.ada, vis: 'class',
          lead: { text: 'Después, otro desafío: del código al aula, en…', dur: 3 }, stay: 5.5,
          k: '2023 – 2024 · Ada ITW',
          t: 'Enseñar a programar.', d: 'JavaScript y React: proyectos, hello worlds y alumnos que arrancaban de cero.',
          v: { out: 'Hola, mundo', click: 'Clic', todo: ['HTML', 'CSS', 'JavaScript'], code: [
            '<span class="kw">const</span> saludo = <span class="st">"Hola, mundo"</span>;',
            '<span class="fn">console</span>.log(saludo);',
            '<span class="cm">// → Hola, mundo</span>'] } },
        { year: '2024', label: 'TSOFT · TUENTI', color: FRONT.tuenti, vis: 'tuenti',
          lead: { text: 'De enseñar, a una empresa grande: Tsoft. Primero, en…', dur: 3 }, stay: 6.5,
          k: '2024 · Tsoft · Tuenti',
          t: 'Gamificación que se mide.', d: 'La ruleta y los referidos. Después, un dashboard para medirlos.',
          v: { tag: 'Ilustración · datos ficticios', rec: 'Recurrencia', ref: 'Referidos', game: 'Gamificación', plus: '+1' } },
      ],
      exit: { text: 'Y llegó la IA: llevarla a producción con…', dur: 3, color: '#7fd4ff' } },

    // ── 4 · CompliA (42–48) ──────────────────────────────────────────────────── azul noche · el caso con su demo
    { type: 'igcase', label: 'COMPLIA', duration: 6, bg: NAVY,                                                    //  42–48
      kicker: '2026 · Portal de compliance de Telefónica', title: 'CompliA', sub: 'Inteligencia artificial en producción interna.',
      facts: [{ k: 'Qué hice', t: 'Lo diseñé y lo construí.' }, { k: 'Cómo', t: 'Un asistente con RAG: validaciones, restricciones y recomendaciones.' }, { k: 'Demo', t: 'Recorte de la demo, con datos de ejemplo.' }],
      src: MEDIA.complia, poster: MEDIA.compliaPoster, from: 0.3, window: 'CompliA · demo', tag: 'DATOS DE EJEMPLO' },

    // ── 5 · TSOFT, TAMBIÉN (48–60) ───────────────────────────────────────────── papel · la línea sigue
    { type: 'igfronts', label: 'TSOFT', letterbox: 0,                                                //  48–60
      origin: { year: 'COMPLIA', color: '#7fd4ff' },
      stops: [
        { year: '2026', label: 'SUPERNOVA EVENTOS', color: FRONT.supernova, vis: 'events',
          lead: { text: 'En Tsoft, más frentes: un prototipo para…', dur: 3 }, stay: 2.6,
          k: '2026 · Tsoft',
          t: 'Una micro-app de eventos.', d: 'Supernova Eventos: un prototipo, con datos ficticios.',
          v: { app: 'Eventos', cat: 'Bienestar', title: 'Un respiro para vos', date: '28 oct · 09:00', cta: 'Me sumo', ok: 'Confirmado',
            steps: ['Información', 'Audiencia', 'Email', 'Revisión'], tag: 'Prototipo · datos ficticios' } },
        { year: '2026', label: 'EQUIPO', color: FRONT.team, vis: 'team', stay: 2.5, k: '2026 · Tsoft',
          t: 'Subir el nivel del equipo.', d: 'Capacité a compañeros.', v: { level: 'Nivel' } },
      ],
      exit: { text: 'Y en paralelo, con lo aprendido en cada frente, armé…', dur: 3, color: CORAL } },

    // ── 6 · UN CAMINO PROPIO (60–70) ─────────────────────────────────────────── un color por proyecto · montaje
    // Cada proyecto muestra sus componentes reales, reconstruidos en código (js/shots/*): sin capturas ni video.
    { type: 'igprojects', label: 'CAMINO PROPIO', duration: 2, step: 0.15, bg: INK,                                 //  60–62
      items: [
        { name: 'Eclipse', status: 'En desarrollo', color: PROJECT.eclipse },
        { name: 'HandyX', status: 'En desarrollo · lanza el 10/11', color: PROJECT.handyx },
        { name: 'Volta', status: 'Demo', color: PROJECT.volta },
        { name: 'Velmar', status: 'Demo · para un cliente', color: PROJECT.velmar },
        { name: 'DentalOS', status: 'Demo', color: PROJECT.dentalos },
        { name: 'games-market', status: 'Banco de pruebas', color: PROJECT.games },
        { name: 'Kinetic Studio', status: '32 tráileres en código', color: PROJECT.kinetic },
      ],
      cap: { pos: 'tl', k: 'Camino propio', t: 'Un camino propio.', d: 'Cada proyecto dice en qué punto está.' } },
    { type: 'igshots', label: 'CAMINO PROPIO', title: '', end: 'Todo, en código.', titleDur: 0, mosaic: 1.5,         //  62–70
      shots: [
        { id: 'eclipse-landing', dur: 1.5, tag: { name: 'Eclipse', status: 'En desarrollo', note: 'La landing: demos, precios y el siguiente paso' } },
        { id: 'eclipse-portal', dur: 1, tag: { name: 'Eclipse', status: 'En desarrollo', note: 'Portal de clientes · datos ficticios' } },
        { id: 'handy-landing', dur: 1, tag: { name: 'HandyX', status: 'En desarrollo', note: 'La landing · lanza el 10/11' } },
        { id: 'volta', dur: 1, tag: { name: 'Volta', status: 'Demo', note: 'Tienda de suplementos, con gamificación' } },
        { id: 'dentalos', dur: 1, tag: { name: 'DentalOS', status: 'Demo', note: '16 módulos de una clínica ficticia' } },
        { id: 'kinetic', dur: 1, tag: { name: 'Kinetic Studio', status: '32 tráileres', note: 'Tráileres hechos con código, como este' } },
      ] },

    // ── 7 · TODOS LOS CAMINOS (70–78) · DROP 2 ─────────────────────────────────── tinta · el grafo entero germina
    { type: 'igzoom', label: 'TODOS LOS CAMINOS', duration: 8,                                                     //  70–78
      years: ['17', '2021', '2023', '2024', '2026', 'HOY'],
      fronts: [
        { name: 'Web de juegos', color: FRONT.first }, { name: 'TACH', color: FRONT.tach }, { name: 'Ada ITW', color: FRONT.ada },
        { name: 'Tuenti', color: FRONT.tuenti }, { name: 'CompliA', color: FRONT.complia }, { name: 'Supernova Eventos', color: FRONT.supernova },
        { name: 'Equipo', color: FRONT.team },
      ],
      own: [
        { name: 'Eclipse', color: PROJECT.eclipse }, { name: 'HandyX', color: PROJECT.handyx }, { name: 'Volta', color: PROJECT.volta },
        { name: 'Velmar', color: PROJECT.velmar }, { name: 'DentalOS', color: PROJECT.dentalos }, { name: 'games-market', color: PROJECT.games },
        { name: 'Kinetic Studio', color: PROJECT.kinetic },
      ],
      line: 'Todo germina en lo mismo:', line2: 'buscar <em>nuevos desafíos</em>.' },

    // ── 8 · DESAFÍOS Y RUBROS (78–86) ────────────────────────────────────────── coral → tinta · un rubro por tiempo
    { type: 'igrubros', label: 'DESAFÍOS', duration: 8, split: 3.5,                                                  //  78–86
      kicker: 'Me mueven los desafíos nuevos', lines: ['Potenciar negocios.', 'Automatizar procesos<br>difíciles.'],
      head: 'No le temo a ningún rubro:',
      rubros: [{ id: 'startups', name: 'Startups' }, { id: 'corporate', name: 'Corporativas' }, { id: 'agro', name: 'Agro' },
        { id: 'space', name: 'Espacio' }, { id: 'mining', name: 'Minería' }, { id: 'oilgas', name: 'Oil & gas' }] },

    // ── 9 · TECNOLOGÍAS (86–102) · DROP 3 ──────────────────────────────────────── tinta · una animación por tecnología
    // Agrupadas por dónde las usé: en el trabajo, en mis proyectos y estudiando.
    { type: 'igstack', label: 'TECNOLOGÍAS', letterbox: 0,                                                        //  86–102
      screens: [
        { k: 'En el trabajo', t: 'Frontend y mobile', label: 'FRONTEND', tone: CORAL, bg: '#140f0f', dur: 4, tiles: ['react', 'typescript', 'nextjs', 'reactnative', 'tailwind'] },
        { k: 'En el trabajo', t: 'Backend, datos e IA', label: 'BACKEND · IA', tone: CORAL, bg: '#0f1014', dur: 4, tiles: ['node', 'sql', 'cicd', 'rag'] },
        { k: 'En mis proyectos', t: 'Seguridad, lenguajes y motion', label: 'PROYECTOS', tone: '#7fa3ff', bg: '#0d1020', dur: 4, tiles: ['security', 'python', 'c', 'motion', 'tests'] },
        { k: 'Estudiando', t: 'Machine learning y nube', label: 'ESTUDIO', tone: YELLOW, bg: '#14130c', dur: 4, tiles: ['ml', 'aws', 'azure'] },
      ] },

    // ── 10 · EL SISTEMA (102–118) ──────────────────────────────────────────────── coral / tinta · red
    { type: 'igcut', de: 'typewriter', fit: 2, label: 'SISTEMA', speed: 1.3,                                     // 102–104
      lines: ['UN SISTEMA AGÉNTICO,', 'DIVIDIDO EN <em>PARTES</em>.'], bg: INK, to: CORAL },
    { type: 'igagents', label: '11 AGENTES', duration: 6, bg: CORAL, ink: INK, accent: PAPER,                    // 104–110
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
    { type: 'rules', label: 'REGLAS', step: 1, head: 'CÓMO TRABAJAN JUNTOS', unit: 'REGLA',                      // 110–114
      rules: [
        { text: 'Primero la especificación, después el código.', bg: PAPER, num: CORAL },
        { text: 'Cada afirmación tiene su nivel de evidencia.', bg: INK, num: CORAL },
        { text: 'Puertas con aprobación humana.', bg: BLUE, num: YELLOW },
        { text: 'Se prueba, no se mira a ojo.', bg: GH, num: GREEN },
      ] },
    { type: 'igcut', de: 'pipeline', fit: 4, duration: 5, cls: 'ig-pipe', label: 'CI',                           // 114–118
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

    // ── 11 · FINAL (118–130) · DROP 4 ───────────────────────────────────────── tinta · sol
    { type: 'igend', label: 'CONTACTO', duration: 12, handoff: 10, bg: INK, ink: PAPER, accent: CORAL,            // 118–130
      mono: MONOGRAM, name: 'IGNACIO GAUNA',
      open: 'Abierto a nuevos desafíos.', lead: 'Startups, corporativas, agro, espacio, minería, oil & gas.',
      email: 'ignaciogauna.developer@gmail.com', link: 'linkedin.com/in/ignacio-emanuel-gauna' },
  ],
});
