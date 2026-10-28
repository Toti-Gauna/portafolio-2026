/* ============================================================================
   MEET IGNACIO — the trailer (en). 90 s · 21 scenes · 120 BPM (one bar = 2 s).
   Kit: engine.js (the Handy copy) + recipes.js, recipes-type.js, recipes-glitch.js, recipes-ui.js,
   recipes-dev.js, recipes-shop.js, recipes-branch.js (bifurcacion copies) + recipes-music.js and audio.js
   (Handy + IG patch) + ig-kit.js (new). See engine-plan.md. Every fact comes from portafolio-2026/messages/en.json.
   Same scenes and timings as trailer.es.js: only the copy changes.
   ========================================================================== */
import { PARTITURA } from './partitura.js';
import { INK, PAPER, CORAL, BLUE, NIGHT, YELLOW, NAVY, ICE, GH, GREEN, ACTS, PALETTE, PROJECT, GLYPHS, MONOGRAM, SHAPES, MEDIA } from './ig-data.js';

Trailer.run({
  lang: 'en',
  locale: 'en-US',
  meta: {
    title: 'IGNACIO GAUNA', subtitle: 'MEET IGNACIO', hud: 'IGNACIO GAUNA — SSR AI FULLSTACK DEVELOPER',
    pageTitle: 'Meet Ignacio — Ignacio Gauna',
  },
  ui: {
    play: 'PLAY', seconds: 'SECONDS', sound: 'SOUND ON', replay: 'REPLAY', back: 'BACK',
    keys: 'SPACE PAUSE · M MUTE · R REPLAY · F FULLSCREEN',
    paused: 'PAUSED', soundOn: 'SOUND ON', soundOff: 'SOUND OFF', particles: '',
  },
  palette: PALETTE,
  fonts: { display: 'Archivo', mono: 'JetBrains Mono', serif: 'Archivo', stretch: true },
  music: PARTITURA,
  mix: { gain: 0.6 },   // the recipes' foley (whoosh, boom, key…) under the score
  acts: ACTS,
  hudAt: 1.2,

  scenes: [
    // ── ACT 1 · THE SEED (0–8) ────────────────────────────────────────────────────── night · dots
    { type: 'igcut', de: 'origin', fit: 4, label: 'MAR DEL PLATA', foley: 0.3,                                   //  0–4
      lines: ['MAR DEL PLATA', '<em>17</em> YEARS OLD'], to: INK },
    { type: 'igcut', de: 'typewriter', fit: 4, label: 'THE SEED', speed: 1.3,                                    //  4–8
      lines: ['I WANTED TO BUILD', 'A <em>GAMES</em> WEBSITE.'], bg: INK, to: CORAL },

    // ── ACT 2 · ROADS (8–12) · DROP 1 ─────────────────────────────────────────── night · branches
    { type: 'igburst', label: 'ROADS', word: 'ROADS', duration: 4, foley: 0.45,                           //  8–12
      cap: { at: 1.1, k: 'Mar del Plata · at 17', t: 'That year, every road opened up.', d: "I'm self-taught: I read a lot and study online.", w: 1300 } },

    // ── ACT 3 · CAREER (12–32) ────────────────────────────────────────────────── paper · one line, one branch per job
    { type: 'igcareer', label: 'THE ROAD', duration: 20, letterbox: 0, at: [2, 6, 10, 14], backAt: 18,
      outro: 'From 2021 to today, <em>one line</em>.',                 // 12–32
      kicker: 'THE ROAD', title: 'One seed,<br>many <em>roads</em>.', span: '2021 → 2026', seed: 'AT 17',
      stops: [
        { year: '2021', label: 'TACH', color: BLUE, vis: 'wallet', k: '2021 – 2022 · TACH Argentina', t: 'Software Developer',
          d: 'Remote development: a virtual wallet, on web and mobile.',
          v: { balance: 'Available balance', send: 'Send', receive: 'Receive', mobile: 'MOBILE' } },
        { year: '2023', label: 'ADA ITW', color: YELLOW, vis: 'code', k: '2023 – 2024 · Ada ITW', t: 'Professor',
          d: 'I taught JavaScript and React. Teaching helped me explain technical ideas clearly.',
          v: { file: 'Greeting.jsx', outLabel: 'Preview', out: 'Hello, world', lines: [
            '<span class="kw">function</span> <span class="fn">Greeting</span>({ name }) {',
            '  <span class="kw">return</span> <span class="tg">&lt;h1&gt;</span>Hello, {name}<span class="tg">&lt;/h1&gt;</span>;',
            '}',
            '<span class="tg">&lt;Greeting</span> name=<span class="st">"world"</span> <span class="tg">/&gt;</span>'] } },
        { year: '2024', label: 'TSOFT · TUENTI', color: CORAL, vis: 'wheel', k: 'Since 2024 · Tsoft · for Tuenti and Telefónica', t: 'Gamification,', t2: 'top-ups and payments',
          d: 'The Tuenti roulette and the referral system (the game came back), automatic top-up and payments.',
          v: { chips: ['Roulette', 'Referrals', 'Automatic top-up', 'Payments'] } },
        { year: '2026', label: '2026', color: GREEN, vis: 'stack', k: '2026 · Tsoft', t: 'Dev Ssr →', t2: 'Ssr AI Fullstack Developer',
          d: 'In January, a Special Recognition from Tsoft.',
          v: { badgeK: 'January 2026 · Tsoft', badge: 'Special Recognition', stackK: 'The stack',
            stack: ['React', 'React Native', 'TypeScript', 'Next.js', 'Tailwind', 'Node.js', 'SQL'] } },
      ] },

    // ── ACT 4 · CompliA (32–42) · DROP 2 ──────────────────────────────────────── navy · scan
    { type: 'igcase', label: 'AI IN PRODUCTION', duration: 10, bg: NAVY,                                                  // 32–42
      kicker: "2026 · Telefónica's compliance portal", title: 'CompliA', sub: 'Artificial intelligence in internal production.',
      facts: [{ k: 'Role', t: 'I designed and built it.' }, { k: 'How', t: 'A RAG assistant: validations, restrictions and recommendations.' }, { k: 'Demo', t: 'Demo clip, with sample data.' }],
      src: MEDIA.complia, poster: MEDIA.compliaPoster, from: 0.3, window: 'CompliA · demo', tag: 'SAMPLE DATA' },

    // ── ACT 5 · OWN BRANCHES (42–60) ──────────────────────────────────────────── one colour per project · montage
    // Each project shows its real components, rebuilt in code (js/shots/*): no screenshots, no video.
    { type: 'igprojects', label: 'OWN BRANCHES', duration: 3, step: 0.2, bg: INK,                                   // 42–45
      items: [
        { name: 'Eclipse', status: 'In development', color: PROJECT.eclipse },
        { name: 'HandyX', status: 'In development · launches Nov 10', color: PROJECT.handyx },
        { name: 'Volta', status: 'Demo', color: PROJECT.volta },
        { name: 'Velmar', status: 'Demo · made for a client', color: PROJECT.velmar },
        { name: 'DentalOS', status: 'Demo', color: PROJECT.dentalos },
        { name: 'Supernova Eventos', status: 'Prototype', color: PROJECT.supernova },
        { name: 'games-market', status: 'Test bench', color: PROJECT.games },
        { name: 'Kinetic Studio', status: '32 trailers in code', color: PROJECT.kinetic },
      ],
      cap: { pos: 'tl', k: 'Own projects', t: 'And my own branches.', d: 'Each one says where it stands.' } },
    { type: 'igshots', label: 'OWN BRANCHES', title: 'And my own branches.', end: 'All of it, in code.', titleDur: 0, mosaic: 1.5,      // 45–60
      shots: [
        { id: 'eclipse-landing', dur: 1.5, tag: { name: 'Eclipse', status: 'In development', note: 'The landing: demos, prices and the next step' } },
        { id: 'eclipse-portal', dur: 1.5, tag: { name: 'Eclipse', status: 'In development', note: 'Client portal · fictional data' } },
        { id: 'eclipse-ops', dur: 1.5, tag: { name: 'Eclipse', status: 'In development', note: 'Internal operations · sample data' } },
        { id: 'handy-landing', dur: 1.5, tag: { name: 'HandyX', status: 'In development', note: 'The landing · launches Nov 10' } },
        { id: 'handy-ops', dur: 1.5, tag: { name: 'HandyX', status: 'In development', note: 'Internal portal · fictional records' } },
        { id: 'volta', dur: 1, tag: { name: 'Volta', status: 'Demo', note: 'Supplements store, with gamification' } },
        { id: 'velmar', dur: 1, tag: { name: 'Velmar', status: 'Demo', note: 'Store made for a client' } },
        { id: 'dentalos', dur: 1, tag: { name: 'DentalOS', status: 'Demo', note: '15 modules of a fictional clinic' } },
        { id: 'supernova', dur: 1, tag: { name: 'Supernova Eventos', status: 'Prototype', note: 'Events, with fictional data' } },
        { id: 'games', dur: 1, tag: { name: 'games-market', status: 'Test bench', note: '24 web games on the roadmap' } },
        { id: 'kinetic', dur: 1, tag: { name: 'Kinetic Studio', status: '32 trailers', note: 'Trailers made with code, like this one' } },
      ] },

    // ── ACT 6 · TECHNOLOGIES (60–78) ──────────────────────────────────────────── ink · one animation per technology
    // Grouped by where I used them: at work, in my projects and studying.
    { type: 'igstack', label: 'TECHNOLOGIES', letterbox: 0,                                                    // 60–78
      screens: [
        { k: 'At work', t: 'Frontend and mobile', label: 'FRONTEND', tone: CORAL, bg: '#140f0f', dur: 4.5, tiles: ['react', 'typescript', 'nextjs', 'reactnative', 'tailwind'] },
        { k: 'At work', t: 'Backend, data and AI', label: 'BACKEND · AI', tone: CORAL, bg: '#0f1014', dur: 4.5, tiles: ['node', 'sql', 'cicd', 'rag'] },
        { k: 'In my projects', t: 'Security, languages and motion', label: 'PROJECTS', tone: '#7fa3ff', bg: '#0d1020', dur: 4.5, tiles: ['security', 'python', 'c', 'motion', 'tests'] },
        { k: 'Studying', t: 'Machine learning and cloud', label: 'STUDY', tone: YELLOW, bg: '#14130c', dur: 4.5, tiles: ['ml', 'aws', 'azure'] },
      ] },

    // ── ACT 7 · THE SYSTEM (78–94) ───────────────────────────────────────────── coral / ink · network
    { type: 'igcut', de: 'typewriter', fit: 2, label: 'SYSTEM', speed: 1.3,                                      // 78–80
      lines: ['AN AGENTIC SYSTEM,', 'SPLIT INTO <em>PARTS</em>.'], bg: INK, to: CORAL },
    { type: 'igagents', label: '11 AGENTS', duration: 6, bg: CORAL, ink: INK, accent: PAPER,                     // 80–86
      glyphs: GLYPHS,
      agents: [
        { id: 'chief', name: 'Direction' }, { id: 'uxui', name: 'UX/UI' }, { id: 'design', name: 'Design' },
        { id: 'marketing', name: 'Marketing' }, { id: 'ads', name: 'Ads' }, { id: 'docs', name: 'Documentation' },
        { id: 'frontend', name: 'Frontend' }, { id: 'backend', name: 'Backend' }, { id: 'security', name: 'Cybersecurity' },
        { id: 'game', name: 'Games' }, { id: 'trailer', name: 'Trailers' },
      ],
      groups: [
        { ids: ['chief', 'uxui', 'design', 'marketing', 'ads'], at: 0.2 },
        { ids: ['frontend', 'backend', 'security', 'game', 'trailer'], at: 2.0 },
        { ids: ['docs'], at: 3.8 },
      ],
      cap: [
        { at: 0.1, to: 1.95, w: 1500, k: 'Product', t: 'First, what gets done and in what order.' },
        { at: 1.95, to: 3.75, w: 1500, k: 'Architects', t: 'Each one with its own part.' },
        { at: 3.75, w: 1500, k: 'Documentation · 11 agents', t: 'Not a prompt: a system with roles.' },
      ] },
    { type: 'rules', label: 'RULES', step: 1, head: 'HOW THEY WORK TOGETHER', unit: 'RULE',                      // 86–90
      rules: [
        { text: 'Specification first, code second.', bg: PAPER, num: CORAL },
        { text: 'Every claim carries its level of evidence.', bg: INK, num: CORAL },
        { text: 'Gates with human approval.', bg: BLUE, num: YELLOW },
        { text: 'Tested, not eyeballed.', bg: GH, num: GREEN },
      ] },
    { type: 'igcut', de: 'pipeline', fit: 4, duration: 5, cls: 'ig-pipe', label: 'CI',                           // 90–94
      window: 'ci · run of 10/27/2026', title: 'Run of 10/27/2026', sub: 'Automated tests, Playwright e2e and CI',
      running: 'Running', doneLabel: 'All green', total: 'All green', gap: 0.3, rowH: 58,
      cols: ['PROJECT', 'PROGRESS', 'RESULT', ''],
      stages: [
        { name: 'Discover', time: 0.3 }, { name: 'Plan', time: 0.3 }, { name: 'Build', time: 0.3 },
        { name: 'Test', time: 0.3 }, { name: 'Review', detail: 'Human OK', time: 0.3 }, { name: 'Deliver', time: 0.3 },
      ],
      rows: [
        { name: 'Eclipse-Web', value: '463 tests' },
        { name: 'Eclipse backend', value: '779 tests' },
        { name: 'Internal portal', value: '132 tests' },
        { name: 'Browser journeys', value: '14' },
      ] },

    // ── ACT 8 · FINALE (94–112) · DROP 3 ──────────────────────────────────────── night → ink · sun
    { type: 'igcut', de: 'title', fit: 5, label: 'IGNACIO GAUNA', bg: NIGHT, foley: 0.5,                         // 94–99
      title: 'IGNACIO GAUNA', subtitle: 'SSR AI FULLSTACK DEVELOPER', colors: [CORAL, BLUE, YELLOW] },
    { type: 'igcut', de: 'statement', fit: 3, label: 'SHIPS', bg: NIGHT, accent: CORAL,                          // 99–102
      text: 'I BUILD AI SOFTWARE<br><span>THAT SHIPS.</span>' },
    { type: 'igend', label: 'CONTACT', duration: 10, handoff: 8, bg: INK, ink: PAPER, accent: CORAL,             // 102–112
      mono: MONOGRAM, name: 'IGNACIO GAUNA', role: 'SSR AI FULLSTACK DEVELOPER',
      open: 'Open to new opportunities.', lead: "I'm looking for a Ssr or Sr fullstack role with AI.",
      email: 'ignaciogauna.developer@gmail.com', link: 'linkedin.com/in/ignacio-emanuel-gauna' },
  ],
});
