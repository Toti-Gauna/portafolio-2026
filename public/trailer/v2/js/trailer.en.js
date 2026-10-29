/* ============================================================================
   MEET IGNACIO — the trailer (en). 130 s · 15 scenes · 120 BPM (one bar = 2 s).
   The story Ignacio told (10/28/2026): Mar del Plata → at 17, a games website that changed his life → the work
   fronts (TACH, Ada ITW, Tsoft: Tuenti, CompliA, Supernova Eventos, the team), with one sentence along the line
   before each of them (`lead`, `exit`) → a path of his own → every path,
   all growing into the same thing: seeking new challenges → the industries → what he does → the end.
   No job titles anywhere: challenges. Every fact comes from portafolio-2026/messages/en.json (journey, about, contact).
   Kit: engine.js (the Kinetic kit copy) + recipes*.js (bifurcacion copies) + recipes-music.js and audio.js (Kinetic kit + IG patch)
   + ig-kit.js, ig-open.js, ig-fronts.js, ig-bloom.js, ig-case.js, ig-shots.js, ig-stack.js.
   Same scenes and timings as trailer.es.js: only the copy changes.
   ========================================================================== */
import { PARTITURA } from './partitura.js';
import { INK, PAPER, CORAL, BLUE, NIGHT, YELLOW, NAVY, GH, GREEN, ACTS, PALETTE, PROJECT, FRONT, GLYPHS, MONOGRAM, MEDIA } from './ig-data.js';

Trailer.run({
  lang: 'en',
  locale: 'en-US',
  meta: {
    title: 'IGNACIO GAUNA', subtitle: 'MEET IGNACIO', hud: 'IGNACIO GAUNA — MEET IGNACIO',
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
  speed: 0.85,          // the film plays at 85 %: 130 s of film in ~153 s, so every line can be read (Ignacio, 28/10/2026)
  acts: ACTS,
  hudAt: 1.2,

  scenes: [
    // ── 1 · MAR DEL PLATA (0–6) ──────────────────────────────────────────────── night · the coast and one light
    { type: 'igcoast', label: 'MAR DEL PLATA', duration: 6, foley: 0.5,                                          //   0–6
      kicker: 'Mar del Plata · Argentina', line: 'It all started in<br><em>Mar del Plata.</em>', sea: 'Atlantic Ocean' },

    // ── 2 · THE FIRST PRODUCT (6–12) · DROP 1 on the click ────────────────────── ink · the games site → branches
    { type: 'igfirst', label: 'THE FIRST PRODUCT', duration: 6, foley: 0.6,                                      //   6–12
      kicker: 'Mar del Plata · at 17', lines: ['At 17 I built', 'my first product:'], big: 'a <em>games</em> website.',
      after: '…that changed<br><em>my life.</em>', afterSub: "I'm self-taught: I read a lot and study online.",
      site: { logo: 'GAMES', nav: ['Home', 'Games', 'Contact'], play: 'PLAY', ticker: "LET'S PLAY!" } },

    // ── 3 · THE FRONTS (12–42) ───────────────────────────────────────────────── paper · one line, one branch per front
    { type: 'igfronts', label: 'WORK FRONTS', letterbox: 0,                                     //  12–42
      origin: { year: 'AT 17', color: CORAL },
      stops: [
        { year: '2021', label: 'TACH', color: FRONT.tach, vis: 'tach',
          lead: { text: 'And that was my first step toward new experiences, like working at…', dur: 4 }, stay: 5,
          name: 'TACH Argentina', k: '2021 – 2022',
          t: 'A digital wallet, end to end.', d: 'Remote: the back office, the landing page and the app, on web and mobile.',
          v: { tags: ['BACK OFFICE', 'LANDING', 'APP'], balance: 'Available balance', send: 'Send', receive: 'Receive' } },
        { year: '2023', label: 'ADA ITW', color: FRONT.ada, vis: 'class',
          lead: { text: 'Next, a new challenge: from code to the classroom, at…', dur: 3 }, stay: 5.5,
          name: 'Ada ITW', k: '2023 – 2024',
          t: 'Teaching people to code.', d: 'JavaScript and React: projects, hello worlds and students starting from zero.',
          v: { out: 'Hello, world', click: 'Click', todo: ['HTML', 'CSS', 'JavaScript'], code: [
            '<span class="kw">const</span> greeting = <span class="st">"Hello, world"</span>;',
            '<span class="fn">console</span>.log(greeting);',
            '<span class="cm">// → Hello, world</span>'] } },
        { year: '2024', label: 'TSOFT · TUENTI', color: FRONT.tuenti, vis: 'tuenti',
          lead: { text: 'From teaching to a big company: Tsoft. First, on…', dur: 3 }, stay: 6.5,
          name: 'Tsoft · Tuenti', k: '2024',
          t: 'Gamification you can measure.', d: 'The roulette and the referrals. Then a dashboard to measure them.',
          v: { tag: 'Illustration · fictional data', rec: 'Recurrence', ref: 'Referrals', game: 'Gamification', plus: '+1' } },
      ],
      exit: { text: 'Then came AI: taking it to production with…', dur: 3, color: '#7fd4ff' } },

    // ── 4 · CompliA (42–48) ──────────────────────────────────────────────────── navy · the case with its demo
    { type: 'igcase', label: 'COMPLIA', duration: 6, bg: NAVY,                                                    //  42–48
      kicker: "2026 · Tsoft · Telefónica's compliance portal", title: 'CompliA', sub: 'Artificial intelligence in internal production.',
      facts: [{ k: 'What I did', t: 'I designed and built it.' }, { k: 'How', t: 'A RAG assistant: validations, restrictions and recommendations.' }, { k: 'Demo', t: 'Demo clip, with sample data.' }],
      src: MEDIA.complia, poster: MEDIA.compliaPoster, from: 0.3, window: 'CompliA · demo', tag: 'SAMPLE DATA' },

    // ── 5 · TSOFT, TOO (48–60) ───────────────────────────────────────────────── paper · the line goes on
    { type: 'igfronts', label: 'TSOFT', letterbox: 0,                                                //  48–60
      origin: { year: 'COMPLIA', color: '#7fd4ff' },
      stops: [
        { year: '2026', label: 'SUPERNOVA EVENTOS', color: FRONT.supernova, vis: 'events',
          lead: { text: 'At Tsoft, more fronts: a prototype for…', dur: 3 }, stay: 2.6,
          name: 'Supernova Eventos', k: '2026 · Tsoft',
          t: 'An events micro-app.', d: 'Supernova Eventos: a prototype, with fictional data.',
          v: { app: 'Events', cat: 'Wellness', title: 'A breather for you', date: 'Oct 28 · 09:00', cta: "I'm in", ok: 'Confirmed',
            steps: ['Details', 'Audience', 'Email', 'Review'], tag: 'Prototype · fictional data' } },
        { year: '2026', label: 'TEAM', color: FRONT.team, vis: 'team', stay: 2.5, name: 'Tsoft', k: '2026 · The team',
          t: "Raising the team's level.", d: 'I trained colleagues.', v: { level: 'Level' } },
      ],
      exit: { text: 'And alongside, with what I learned on every front, I built…', dur: 3, color: CORAL } },

    // ── 6 · A PATH OF MY OWN (60–70) ─────────────────────────────────────────── one colour per project · montage
    // Each project shows its real components, rebuilt in code (js/shots/*): no screenshots, no video.
    { type: 'igprojects', label: 'MY OWN PATH', duration: 2, step: 0.15, bg: INK,                                 //  60–62
      items: [
        { name: 'Eclipse', status: 'In development', color: PROJECT.eclipse },
        { name: 'Volta', status: 'Demo', color: PROJECT.volta },
        { name: 'Velmar', status: 'Demo · made for a client', color: PROJECT.velmar },
        { name: 'DentalOS', status: 'Demo', color: PROJECT.dentalos },
        { name: 'games-market', status: 'Test bench', color: PROJECT.games },
        { name: 'Kinetic Studio', status: '32 trailers in code', color: PROJECT.kinetic },
      ],
      cap: { pos: 'tl', k: 'My own path', t: 'A path of my own.', d: 'Each project says where it stands.' } },
    { type: 'igshots', label: 'MY OWN PATH', title: '', end: 'All of it, in code.', titleDur: 0, mosaic: 1.5,         //  62–70
      shots: [
        { id: 'eclipse-landing', dur: 1.5, tag: { name: 'Eclipse', status: 'In development', note: 'The landing: demos, prices and the next step' } },
        { id: 'eclipse-portal', dur: 1, tag: { name: 'Eclipse', status: 'In development', note: 'Client portal · fictional data' } },
        { id: 'volta', dur: 1, tag: { name: 'Volta', status: 'Demo', note: 'Supplements store, with gamification' } },
        { id: 'velmar', dur: 1, tag: { name: 'Velmar', status: 'Demo · made for a client', note: 'A store with coupons, a club and a roulette' } },
        { id: 'dentalos', dur: 1, tag: { name: 'DentalOS', status: 'Demo', note: '16 modules of a fictional clinic' } },
        { id: 'kinetic', dur: 1, tag: { name: 'Kinetic Studio', status: '32 trailers', note: 'Trailers made with code, like this one' } },
      ] },

    // ── 7 · EVERY PATH (70–78) · DROP 2 ──────────────────────────────────────── ink · the whole graph germinates
    { type: 'igzoom', label: 'EVERY PATH', duration: 8,                                                     //  70–78
      years: ['17', '2021', '2023', '2024', '2026', 'TODAY'],
      fronts: [
        { name: 'Games website', color: FRONT.first }, { name: 'TACH', color: FRONT.tach }, { name: 'Ada ITW', color: FRONT.ada },
        { name: 'Tuenti', color: FRONT.tuenti }, { name: 'CompliA', color: FRONT.complia }, { name: 'Supernova Eventos', color: FRONT.supernova },
        { name: 'Team', color: FRONT.team },
      ],
      own: [
        { name: 'Eclipse', color: PROJECT.eclipse }, { name: 'Volta', color: PROJECT.volta },
        { name: 'Velmar', color: PROJECT.velmar }, { name: 'DentalOS', color: PROJECT.dentalos }, { name: 'games-market', color: PROJECT.games },
        { name: 'Kinetic Studio', color: PROJECT.kinetic },
      ],
      line: 'It all grows into the same thing:', line2: 'seeking <em>new challenges</em>.' },

    // ── 8 · CHALLENGES AND INDUSTRIES (78–86) ─────────────────────────────────── coral → ink · one industry per beat
    { type: 'igrubros', label: 'CHALLENGES', duration: 8, split: 3.5,                                                  //  78–86
      kicker: 'New challenges are what drive me', lines: ['Boosting businesses.', 'Automating hard<br>processes.'],
      head: "I'm not afraid of any industry:",
      rubros: [{ id: 'startups', name: 'Startups' }, { id: 'corporate', name: 'Corporates' }, { id: 'agro', name: 'Agriculture' },
        { id: 'space', name: 'Space' }, { id: 'mining', name: 'Mining' }, { id: 'oilgas', name: 'Oil & gas' }] },

    // ── 9 · TECHNOLOGIES (86–102) · DROP 3 ─────────────────────────────────────── ink · one animation per technology
    // Grouped by where I used them: at work, in my projects and studying.
    { type: 'igstack', label: 'TECHNOLOGIES', letterbox: 0,                                                        //  86–102
      screens: [
        { k: 'At work', t: 'Frontend and mobile', label: 'FRONTEND', tone: CORAL, bg: '#140f0f', dur: 4, tiles: ['react', 'typescript', 'nextjs', 'reactnative', 'tailwind'] },
        { k: 'At work', t: 'Backend, data and AI', label: 'BACKEND · AI', tone: CORAL, bg: '#0f1014', dur: 4, tiles: ['node', 'sql', 'cicd', 'rag'] },
        { k: 'In my projects', t: 'Security, languages and motion', label: 'PROJECTS', tone: '#7fa3ff', bg: '#0d1020', dur: 4, tiles: ['security', 'python', 'c', 'motion', 'tests'] },
        { k: 'Studying', t: 'Machine learning and cloud', label: 'STUDY', tone: YELLOW, bg: '#14130c', dur: 4, tiles: ['ml', 'aws', 'azure'] },
      ] },

    // ── 10 · THE SYSTEM (102–118) ──────────────────────────────────────────────── coral / ink · network
    { type: 'igcut', de: 'typewriter', fit: 2, label: 'SYSTEM', speed: 1.3,                                     // 102–104
      lines: ['AN AGENTIC SYSTEM,', 'SPLIT INTO <em>PARTS</em>.'], bg: INK, to: CORAL },
    { type: 'igagents', label: '11 AGENTS', duration: 6, bg: CORAL, ink: INK, accent: PAPER,                    // 104–110
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
    { type: 'rules', label: 'RULES', step: 1, head: 'HOW THEY WORK TOGETHER', unit: 'RULE',                      // 110–114
      rules: [
        { text: 'Specification first, code second.', bg: PAPER, num: CORAL },
        { text: 'Every claim carries its level of evidence.', bg: INK, num: CORAL },
        { text: 'Gates with human approval.', bg: BLUE, num: YELLOW },
        { text: 'Tested, not eyeballed.', bg: GH, num: GREEN },
      ] },
    { type: 'igcut', de: 'pipeline', fit: 4, duration: 5, cls: 'ig-pipe', label: 'CI',                           // 114–118
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

    // ── 11 · FINALE (118–130) · DROP 4 ──────────────────────────────────────── ink · sun
    { type: 'igend', label: 'CONTACT', duration: 12, handoff: 10, bg: INK, ink: PAPER, accent: CORAL,            // 118–130
      mono: MONOGRAM, name: 'IGNACIO GAUNA',
      open: 'Open to new challenges.', lead: 'Startups, corporates, agriculture, space, mining, oil & gas.',
      email: 'ignaciogauna.developer@gmail.com', link: 'linkedin.com/in/ignacio-emanuel-gauna' },
  ],
});
