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

    // ── ACT 2 · ROADS (8–16) · DROP 1 ──────────────────────────────────────────── night · rings
    { type: 'igcut', de: 'particles', fit: 4, label: 'ROADS', foley: 0.45, word: 'ROADS', caption: '',           //  8–12
      cap: { at: 1.1, k: 'Mar del Plata · at 17', t: 'That year, every road opened up.', d: "I'm self-taught: I read a lot and study online.", w: 1300 } },
    { type: 'igcut', de: 'brline', fit: 4, duration: 6, label: 'JOURNEY',                                        // 12–16
      kicker: 'JOURNEY', lines: ['One seed,', 'many <em>paths</em>.'],
      commits: ['17', '2021', '2023', '2024', '2026', 'TODAY'] },

    // ── ACT 3 · CAREER (16–32) ────────────────────────────────────────────────── paper · grid
    { type: 'shift', label: 'TACH', spin: 0, letterbox: 0,                                                       // 16–20
      steps: [
        { word: '2021', form: 'circle', name: 'CIRCLE', bg: PAPER, shape: CORAL },
        { word: 'WALLET', form: SHAPES.card, name: 'CARD', bg: BLUE, shape: YELLOW },
        { word: 'WEB', form: SHAPES.browser, name: 'BROWSER', bg: YELLOW, shape: INK },
        { word: 'MOBILE', form: SHAPES.phone, name: 'PHONE', bg: CORAL, shape: PAPER },
      ],
      cap: { k: '2021 – 2022 · TACH Argentina', t: 'Software Developer', d: 'Remote development: a virtual wallet, on web and mobile.' } },
    { type: 'stack', label: 'ADA ITW', hold: 4, bg: PAPER, fg: INK, accent: BLUE, height: 420, offsetY: -140, width: 1180,    // 20–24
      stacks: [['I TAUGHT', '*JAVASCRIPT', 'AND REACT']],
      cap: { k: '2023 – 2024 · Ada ITW', t: 'Professor', d: 'Teaching helped me strengthen my basics and explain technical ideas clearly.', w: 1500 } },
    { type: 'igwheel', label: 'TSOFT · TUENTI', bg: PAPER, land: 0,                                              // 24–28
      kicker: 'Gamification', title: 'The game came back.', pills: ['Roulette', 'Referrals'],
      colors: [CORAL, INK, BLUE, INK, YELLOW, INK, CORAL, INK],
      cap: { pos: 'br', w: 820, k: 'Since 2024 · Tsoft', t: 'Tuenti and Telefónica', d: 'The Tuenti roulette and the referral system.' } },
    { type: 'slam', label: 'TOP-UPS · PAYMENTS', beat: 1,                                                        // 28–30
      words: [
        { text: 'AUTOMATIC TOP-UP.', bg: BLUE, fg: PAPER, shape: 'circle', sc: YELLOW },
        { text: 'PAYMENTS.', bg: YELLOW, fg: INK, shape: 'triangle', sc: CORAL },
      ],
      cap: { at: 0.1, k: 'Tsoft · the stack', t: 'React, React Native, TypeScript, Next.js, Tailwind, Node.js and SQL.', w: 1500 } },
    { type: 'slam', label: '2026', beat: 0.5, glitch: [{ at: 0.98, dur: 0.22, amt: 0.9 }],                       // 30–32
      words: [
        { text: '2026', bg: INK, fg: PAPER, shape: 'circle', sc: CORAL },
        { text: 'DEV SSR', bg: PAPER, fg: INK, shape: 'triangle', sc: BLUE },
        { text: 'SSR AI', bg: CORAL, fg: INK, shape: 'circle', sc: INK },
        { text: 'FULLSTACK.', bg: BLUE, fg: PAPER, shape: 'triangle', sc: YELLOW },
      ],
      cap: { at: 0.05, k: '2026 · Tsoft', t: 'Dev Ssr → Ssr AI Fullstack Developer', d: 'In January, a Special Recognition from Tsoft.', w: 1500 } },

    // ── ACT 4 · CompliA (32–42) · DROP 2 ──────────────────────────────────────── navy · scan
    { type: 'remixtitle', label: 'AI IN PRODUCTION', duration: 4, foley: 0.45, title: 'CompliA', stamp: 'RAG',   // 32–36
      colors: [NAVY, BLUE, ICE, PAPER, NAVY, CORAL],
      cap: { at: 1.1, k: "2026 · Telefónica's compliance portal", t: 'I designed and built it.', d: 'A RAG assistant: validations, restrictions and recommendations.', w: 1500 } },
    { type: 'igclip', label: 'DEMO · SAMPLE DATA', duration: 6, bg: NAVY,                                        // 36–42
      src: MEDIA.complia, poster: MEDIA.compliaPoster, from: 0.3, window: 'CompliA · demo', tag: 'SAMPLE DATA',
      cap: { pos: 'tr', w: 720, at: 0.6, k: 'In internal production', t: 'Artificial intelligence in production, for compliance.', d: 'Demo clip, with sample data.' } },

    // ── ACT 5 · OWN BRANCHES (42–52) ─────────────────────────────────────────── ink · branches
    { type: 'igprojects', label: 'OWN BRANCHES', duration: 6, bg: INK,                                           // 42–48
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
      cap: { pos: 'tl', k: 'My own projects', t: 'And my own branches.', d: 'Each one says where it stands.' } },
    { type: 'statpunch', label: 'LAB', step: 1,                                                                  // 48–52
      stats: [
        { value: 32, label: 'TRAILERS MADE WITH CODE', note: 'KINETIC STUDIO · GSAP, CANVAS, WEBGL, WEBAUDIO', bg: CORAL, fg: INK },
        { value: 15, label: 'MODULES OF A FICTIONAL CLINIC', note: 'DENTALOS · DEMO · FRONTEND ONLY', bg: PROJECT.dentalos, fg: INK },
        { value: 24, label: 'WEB GAMES ON THE ROADMAP', note: 'GAMES-MARKET · TEST BENCH · 2D AND 3D', bg: YELLOW, fg: INK },
        { value: 10, format: v => `NOV ${Math.round(v)}`, label: 'HANDYX LAUNCHES ON NOVEMBER 10', note: 'IN DEVELOPMENT · MAR DEL PLATA', bg: '#1f57a8', fg: PAPER },
      ] },

    // ── ACT 6 · THE SYSTEM (52–72) ───────────────────────────────────────────── coral / ink · network
    { type: 'igcut', de: 'typewriter', fit: 4, label: 'SYSTEM', speed: 1.3,                                      // 52–56
      lines: ['AN AGENTIC SYSTEM,', 'SPLIT INTO <em>PARTS</em>.'], bg: INK, to: CORAL },
    { type: 'igagents', label: '11 AGENTS', duration: 6, bg: CORAL, ink: INK, accent: PAPER,                     // 56–62
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
    { type: 'rules', label: 'RULES', step: 1, head: 'HOW THEY WORK TOGETHER', unit: 'RULE',                      // 62–66
      rules: [
        { text: 'Specification first, code second.', bg: PAPER, num: CORAL },
        { text: 'Every claim carries its level of evidence.', bg: INK, num: CORAL },
        { text: 'Gates with human approval.', bg: BLUE, num: YELLOW },
        { text: 'Tested, not eyeballed.', bg: GH, num: GREEN },
      ] },
    { type: 'igcut', de: 'pipeline', fit: 4, duration: 5, cls: 'ig-pipe', label: 'CI',                           // 66–70
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
    { type: 'slam', label: 'HUMAN APPROVAL', beat: 0.5,                                                          // 70–72
      words: [
        { text: 'NOTHING', bg: INK, fg: PAPER },
        { text: 'SHIPS', bg: PAPER, fg: INK, shape: 'square', sc: CORAL },
        { text: 'WITHOUT HUMAN', bg: GREEN, fg: INK, shape: 'circle', sc: PAPER },
        { text: 'APPROVAL.', bg: CORAL, fg: INK, shape: 'triangle', sc: INK },
      ] },

    // ── ACT 7 · FINALE (72–90) · DROP 3 ──────────────────────────────────────── night → ink · sun
    { type: 'igcut', de: 'title', fit: 5, label: 'IGNACIO GAUNA', bg: NIGHT, foley: 0.5,                         // 72–77
      title: 'IGNACIO GAUNA', subtitle: 'SSR AI FULLSTACK DEVELOPER', colors: [CORAL, BLUE, YELLOW] },
    { type: 'igcut', de: 'statement', fit: 3, label: 'SHIPS', bg: NIGHT, accent: CORAL,                          // 77–80
      text: 'I BUILD AI SOFTWARE<br><span>THAT SHIPS.</span>' },
    { type: 'igend', label: 'CONTACT', duration: 10, handoff: 8, bg: INK, ink: PAPER, accent: CORAL,             // 80–90
      mono: MONOGRAM, name: 'IGNACIO GAUNA', role: 'SSR AI FULLSTACK DEVELOPER',
      open: 'Open to new opportunities.', lead: "I'm looking for a Ssr or Sr fullstack role with AI.",
      email: 'ignaciogauna.developer@gmail.com' },
  ],
});
