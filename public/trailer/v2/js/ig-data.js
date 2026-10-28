/* ============================================================================
   CONOCER A IGNACIO — shared data for trailer.es.js / trailer.en.js (no copy here: every string lives
   in the two configs). Palette per act, the agent glyphs, the IG monogram and the custom morph paths.
   ========================================================================== */

// ---- brand base (portfolio): ink · paper · coral · blue. Each act adds its own accents.
export const INK = '#0e0e10', PAPER = '#eeeae3', CORAL = '#ff4d2e', BLUE = '#2b50ff';
export const NIGHT = '#07070a', YELLOW = '#ffc21a';
export const NAVY = '#071233', ICE = '#7fd4ff';            // act 4 · CompliA
export const GH = '#0d1117', GREEN = '#3fb950';            // act 6 · proof (the dev module's GitHub dark)

/** acts: one palette + one background treatment each (ig-kit.js · acts plugin). Times in seconds. */
export const ACTS = [
  { id: 'semilla', from: 0, to: 8, kind: 'dots', tone: PAPER, alpha: 0.10 },
  { id: 'caminos', from: 8, to: 12, kind: 'rings', tone: PAPER, alpha: 0.16 },
  { id: 'carrera', from: 12, to: 32, kind: 'grid', tone: INK, alpha: 0.16 },
  { id: 'complia', from: 32, to: 42, kind: 'scan', tone: ICE, alpha: 0.12 },
  { id: 'ramas', from: 42, to: 60, kind: 'branches', tone: PAPER, alpha: 0.14 },
  { id: 'stack', from: 60, to: 78, kind: 'dots', tone: PAPER, alpha: 0.06 },
  { id: 'sistema', from: 78, to: 94, kind: 'net', tone: PAPER, alpha: 0.12 },
  { id: 'final', from: 94, to: 110, kind: 'sun', tone: CORAL, alpha: 0.32 },
];

/** the engine palette (global): night/ink/paper + accents (a1 coral, a2 blue, a3 yellow, a4 origin <em>,
 *  a5 + a2 = the chromatic split of title/remixtitle) and the particle spectrum of act 2. */
export const PALETTE = {
  night: NIGHT, ink: INK, paper: PAPER,
  accents: [CORAL, BLUE, YELLOW, '#ffb38a', '#ff2e88', ICE],
  spectrum: [BLUE, ICE, PAPER, YELLOW, CORAL],
  glow: CORAL,
};

/** project colours (act 5): one accent per own project. Not brand colours of anyone else. */
export const PROJECT = {
  eclipse: '#f5b942', handyx: '#4a8cff', volta: '#d4ff3a', velmar: '#d2ad69',
  dentalos: '#5ee6c8', supernova: '#ff2e88', games: '#34d399', kinetic: CORAL,
};

/** The eleven agents: the SAME glyphs as the portfolio (components/AgentIcon.tsx), 24×24, 1.5 stroke.
 *  `base` strokes in the glyph colour; `acc` is the one accent detail (class acc-s = stroke, acc-f = fill). */
export const GLYPHS = {
  chief: { base: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>', acc: '<circle class="acc-f" cx="12" cy="12" r="1"/>' },
  uxui: { base: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M3 8h18"/>', acc: '<path class="acc-s" d="M11 12l4 8 1.2-3.3L19.5 15z"/>' },
  design: { base: '<path d="M12 3l5 6-5 12-5-12z"/><path d="M12 9v4"/>', acc: '<circle class="acc-f" cx="12" cy="14.5" r="1.3"/>' },
  marketing: { base: '<path d="M4 10v4h3l7 4V6l-7 4z"/><path d="M7 14l1 5h2"/>', acc: '<path class="acc-s" d="M17.5 9.5a3.5 3.5 0 0 1 0 5"/>' },
  ads: { base: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/>', acc: '<circle class="acc-f" cx="12" cy="12" r="1.3"/>' },
  docs: { base: '<path d="M5 4h9l5 5v11H5z"/><path d="M14 4v5h5"/>', acc: '<path class="acc-s" d="M8 13h8M8 16.5h5"/>' },
  frontend: { base: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h18"/>', acc: '<path class="acc-s" d="M9.5 12l-2.5 2.5L9.5 17M14.5 12l2.5 2.5-2.5 2.5"/>' },
  backend: { base: '<ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6"/>', acc: '<path class="acc-s" d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>' },
  security: { base: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/>', acc: '<path class="acc-s" d="M9 12l2 2 4-4"/>' },
  game: { base: '<path d="M7 8h10a4 4 0 0 1 4 4v1.5a3 3 0 0 1-5.4 1.8L14.5 14h-5l-1.1 1.3A3 3 0 0 1 3 13.5V12a4 4 0 0 1 4-4z"/><path d="M8 10.5v3M6.5 12h3"/>', acc: '<circle class="acc-f" cx="16" cy="11.5" r="1"/>' },
  trailer: { base: '<rect x="3" y="9" width="18" height="11" rx="1.5"/><path d="M3 9l2-5 15 0-1 5"/><path d="M8 4l-1 5M13 4l-1 5"/>', acc: '<path class="acc-f" d="M10.5 12.5v4l3.5-2z"/>' },
};

/** "IG" monogram (portfolio design/svg/brand/monogram.svg): two strokes + the coral seed dot. viewBox 0 0 64 64. */
export const MONOGRAM = {
  strokes: ['M18 17v33', 'M50 22a16 16 0 1 0 0 20V34H38'],
  dot: { cx: 18, cy: 9, r: 3 },
};

/** morph targets for 'shift' (viewBox -250..250, closed paths, upright: use spin: 0). */
export const SHAPES = {
  card: 'M-162,-120H162A28,28 0 0 1 190,-92V92A28,28 0 0 1 162,120H-162A28,28 0 0 1 -190,92V-92A28,28 0 0 1 -162,-120Z',
  browser: 'M-200,-118H-70L-48,-158H52L74,-118H200V150H-200Z',
  phone: 'M-74,-200H74A36,36 0 0 1 110,-164V164A36,36 0 0 1 74,200H-74A36,36 0 0 1 -110,164V-164A36,36 0 0 1 -74,-200Z',
};

/** the CompliA clip (portfolio public/media). Relative to the trailer page: public/trailer/v2/index.html. */
export const MEDIA = {
  complia: '../../media/complia-demo.mp4',
  compliaPoster: '../../media/complia-demo-poster.jpg',
};
