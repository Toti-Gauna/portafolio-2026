import type { BrandArt, BrandSpec } from '../types';

/**
 * Velmar — a client's brand: made-to-order objects for the home and the pet, Mar del Plata. The logo is theirs (an
 * «M» of two peaks over a «V», straight cuts at 45°: `LogoMark` in velmar-ecommerce-/src/components/atoms/Logo.tsx);
 * colours and type are the PROVISIONAL palette of the demo (src/config/brand.ts, app/globals.css). The grid, the
 * patterns, the pieces and the box are drawn for this board.
 */
const OLIVE = '#3a4527', PAPER = '#f6f1e8', INK = '#1c2016', WOOD = '#b98b5c', SAND = '#ece2cf', BRASS = '#d2ad69';
// supporting tokens of the same repo: surface / onPrimary, primaryHover, muted, border, muted of the dark theme
const SURFACE = '#fffdf8', DEEP = '#283019', MUTED = '#5d6050', BORDER = '#e2d8c4', DUSK = '#a9a591';

/** The monogram exactly as the repo draws it: viewBox 156 234 558 452, two mitred lines 78 thick. */
const M_D = 'M187.5 432.5 323 297l112 112 112-112 135.5 135.5', V_D = 'M295.5 487.5 435 627l139.5-139.5';
const T = 78; // the stroke is the module
/** The same two letters as outlines (butt ends, mitred corners), for the places that paint with `fill`. */
const M_OUT = 'M159.92 404.92 323 241.85 435 353.85 547 241.85 710.08 404.92 654.92 460.08 547 352.15 435 464.15 323 352.15 215.08 460.08Z';
const V_OUT = 'M323.08 459.92 435 571.85 546.92 459.92 602.08 515.08 435 682.15 267.92 515.08Z';

const r = (n: number) => Math.round(n * 100) / 100;
/** Places the mark's own box (558 × 452) with its top-left corner at (x, y), w wide. */
const space = (x: number, y: number, w: number) => `translate(${r(x)} ${r(y)}) scale(${r(w / 558 * 1e4) / 1e4}) translate(-156 -234)`;
const mark = (x: number, y: number, w: number, ink: string, draw = false) =>
  `<g transform="${space(x, y, w)}" fill="none" stroke="${ink}" stroke-width="${T}" stroke-linejoin="miter">`
  + (draw ? `<path class="bl-draw" style="--i:0" d="${M_D}"/><path class="bl-draw" style="--i:2" d="${V_D}"/>` : `<path d="${M_D}${V_D}"/>`) + '</g>';

type TO = { fill?: string; w?: number; anchor?: 'middle' | 'end'; ls?: number; italic?: boolean };
const text = (cls: string, x: number, y: number, s: string, size: number, o: TO, extra = '') =>
  `<text class="${cls}" x="${r(x)}" y="${r(y)}" font-size="${size}" font-weight="${o.w ?? 500}" fill="${o.fill ?? INK}"`
  + `${o.ls ? ` letter-spacing="${r(o.ls * size)}"` : ''}${o.italic ? ' font-style="italic"' : ''}${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${extra}>${s}</text>`;
/** Fraunces as the store sets it: weight 420, tight (−0.02em on the logo, a little looser on small lines) and the
 *  display cut (opsz 144) on large sizes. */
const fd = (x: number, y: number, s: string, size: number, o: TO = {}) =>
  text('bl-fd', x, y, s, size, { w: 420, ls: size >= 60 ? -0.02 : -0.012, ...o }, size >= 28 ? ` style="font-variation-settings:'opsz' 144"` : '');
const ft = (x: number, y: number, s: string, size: number, o: TO = {}) => text('bl-ft', x, y, s, size, { w: 600, ...o });
/** The store's «eyebrow»: Manrope 800, capitals, wide tracking (0.18em). A centred one is nudged by half a space. */
const eye = (x: number, y: number, s: string, size: number, o: TO = {}) => { const ls = o.ls ?? 0.18; return ft(o.anchor === 'middle' ? x + (ls * size) / 2 : x, y, s, size, { w: 800, ...o, ls }); };
/** Caveat: only for a name written by hand, as in the store's collar customiser. */
const hand = (x: number, y: number, s: string, size: number, o: TO = {}) => text('bl-ft', x, y, s, size, { w: 600, ...o }, ` style="font-family:'bl-caveat',cursive"`);
/** A row of chevrons «^», n of them, each w wide and w/2 high, starting at (x, y = their base line). */
const chevrons = (x: number, y: number, w: number, n: number, gap: number, ink: string, sw: number) =>
  `<path fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="miter" d="${Array.from({ length: n }, (_, i) => `M${r(x + i * (w + gap))} ${y}l${w / 2} ${-w / 2} ${w / 2} ${w / 2}`).join('')}"/>`;

function art(t: Record<string, string>): BrandArt {
  // ---------- logo: the repo's lock-up (mark, a gap of a quarter of its box, the name at 0.8 of it, centred) ----------
  const MW = 160, MX = 30, MY = (200 - (452 * MW) / 558) / 2, FS = MW * 0.8, BASE = 100 + 0.35 * FS;
  const main = mark(MX, MY, MW, OLIVE, true) + `<g class="bl-fill" style="--i:5">${fd(MX + MW * 1.25, BASE, t.name, FS)}</g>`;

  // its construction, in the mark's own coordinates: every measure below is a number of the repo's drawing
  const X0 = 159.92 - T, X1 = 710.08 + T, Y0 = 241.85 - T, Y1 = 682.15 + T; // clear space: one stroke on every side
  const diag = (kind: 1 | -1, c: number) => { // kind 1: y − x = c · kind −1: x + y = c, cut to the clear space
    const p: number[][] = [];
    for (const x of [X0, X1]) { const y = kind === 1 ? x + c : c - x; if (y >= Y0 && y <= Y1) p.push([x, y]); }
    for (const y of [Y0, Y1]) { const x = kind === 1 ? y - c : c - y; if (x > X0 && x < X1) p.push([x, y]); }
    return `M${r(p[0][0])} ${r(p[0][1])}L${r(p[1][0])} ${r(p[1][1])}`;
  };
  // the edges of the six strokes, as x + y = c (the ones that climb to the right); their mirror image is y − x = c − 870
  const LAT = [564.85, 675.15, 788.85, 899.15, 1006.85, 1117.15];
  /** The cell of that lattice between two pairs of edges: a square on its point, one module wide. */
  const cell = (a: number, b: number, c: number, d: number) => `<path class="bl-gm" d="${[[a, c], [b, c], [b, d], [a, d]].map(([s, df], i) => `${i ? 'L' : 'M'}${r((s - df) / 2)} ${r((s + df) / 2)}`).join('')}z"/>`;
  const grid = `<g transform="${space(MX, MY, MW)}">`
    // clear space (one stroke on every side of the mark's own box), and one module of it in a corner
    + `<rect class="bl-g" x="${r(X0)}" y="${r(Y0)}" width="${r(X1 - X0)}" height="${r(Y1 - Y0)}"/><rect class="bl-g" x="${r(X0 + T)}" y="${r(Y0 + T)}" width="${r(X1 - X0 - 2 * T)}" height="${r(Y1 - Y0 - 2 * T)}"/>`
    + `<rect class="bl-gm" x="${r(X0)}" y="${r(Y0)}" width="${T}" height="${T}"/>`
    // every edge runs on one lattice at 45°: ink, air, ink, air, ink, each one module wide
    + `<path class="bl-g" d="${LAT.map((c) => diag(-1, c) + diag(1, c - 870)).join('')}"/>`
    // the two modules of air on the axis: the notch between the peaks, and the gap between the M and the V
    + cell(LAT[1], LAT[2], LAT[1] - 870, LAT[2] - 870) + cell(LAT[3], LAT[4], LAT[3] - 870, LAT[4] - 870)
    // the axis of symmetry
    + `<path class="bl-g" d="M435 ${r(Y0 - 26)}V${r(Y1 + 26)}"/>`
    // 45° at the foot of the M, 90° inside the V
    + `<path class="bl-gc" d="M${r(215.08 + 104)} 460.08A104 104 0 0 0 ${r(215.08 + 104 / Math.SQRT2)} ${r(460.08 - 104 / Math.SQRT2)}M${r(435 - 50 / Math.SQRT2)} ${r(571.85 - 50 / Math.SQRT2)}A50 50 0 0 1 ${r(435 + 50 / Math.SQRT2)} ${r(571.85 - 50 / Math.SQRT2)}"/>`
    // where the mark touches its box
    + [[323, 241.85], [547, 241.85], [435, 682.15], [159.92, 404.92], [710.08, 404.92]].map(([x, y]) => `<circle class="bl-gp" cx="${x}" cy="${y}" r="8"/>`).join('')
    + '</g>'
    // the line where the M ends and the V begins runs on through the middle of the capitals of the name
    + `<path class="bl-g" d="M3 100H597M${MX + MW + 28} ${r(BASE)}H594M${MX + MW + 28} ${r(BASE - 0.7 * FS)}H594"/>`;

  // stacked, for narrow places (drawn for the board: the repo has the horizontal lock-up only)
  const secondary = mark(80, 10, 80, OLIVE) + fd(120, 119, t.name, 44, { anchor: 'middle' }) + eye(120, 145, t.cityUp, 13, { fill: OLIVE, anchor: 'middle' });
  const submark = `<g transform="translate(50 50) scale(0.153) translate(-435 -462)"><path class="bl-acc" fill="currentColor" d="${M_OUT}"/><path class="bl-acc" fill="currentColor" d="${V_OUT}"/></g>`;

  // ---------- patterns ----------
  const p1 = `<rect width="120" height="120" fill="${PAPER}"/>` + [0, 1, 2, 3, 4, 5].map((row) => {
    const off = row % 2 ? -15 : 0;
    return [0, 1, 2, 3, 4].map((c) => `<path d="M${off + c * 30 + 4} ${row * 20 + 16}l11-11 11 11" fill="none" stroke="${row === 3 && c === 2 ? WOOD : OLIVE}" stroke-width="3.2" stroke-linejoin="miter"/>`).join('');
  }).join('');
  const p2 = `<rect width="120" height="120" fill="${INK}"/>${mark(8, 12, 44, BRASS)}${mark(68, 72, 44, BRASS)}`
    + [[90, 30], [30, 90]].map(([x, y]) => `<path d="M${x} ${y - 5}l5 5-5 5-5-5z" fill="${OLIVE}"/>`).join('');
  const p3 = `<rect width="120" height="120" fill="${OLIVE}"/>`
    + `<path d="M0 60L60 0M0 120L120 0M60 120L120 60M0 60L60 120M0 0L120 120M60 0L120 60" fill="none" stroke="${SAND}" stroke-width="1.7" stroke-dasharray="5.3 5.3"/>`
    + [[30, 30], [90, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.2" fill="${BRASS}"/><circle cx="${x}" cy="${y}" r="1.5" fill="${OLIVE}"/>`).join('');

  // ---------- on screen ----------
  // a post: the collar with its name tag, in the store's «studio» of sand
  const E = { cx: 200, cy: 124, rx: 112, ry: 44 }, at = (deg: number, d = 0) => { const a = (deg * Math.PI) / 180; return [r(E.cx + (E.rx + d) * Math.cos(a)), r(E.cy + (E.ry + d) * Math.sin(a))]; };
  const arc = (d: number, lower: boolean) => `M${E.cx - E.rx - d} ${E.cy}A${E.rx + d} ${E.ry + d} 0 0 ${lower ? 0 : 1} ${E.cx + E.rx + d} ${E.cy}`;
  const [bx, by] = at(38);
  const post = `<rect width="400" height="400" fill="${PAPER}"/><rect width="400" height="246" fill="${SAND}"/>`
    + eye(28, 50, t.made, 17, { fill: OLIVE }) + mark(326, 26, 46, OLIVE)
    + `<g fill="none"><path d="${arc(0, false)}" stroke="${DEEP}" stroke-width="22"/><path d="${arc(0, true)}" stroke="${OLIVE}" stroke-width="22"/>`
    + `<path d="${arc(7, true)}M${E.cx - E.rx + 7} ${E.cy}A${E.rx - 7} ${E.ry - 7} 0 0 0 ${E.cx + E.rx - 7} ${E.cy}" stroke="${SAND}" stroke-width="1.5" stroke-dasharray="5 4"/>`
    + `<rect x="${bx - 9}" y="${by - 17}" width="18" height="34" rx="3" transform="rotate(-24 ${bx} ${by})" stroke="${BRASS}" stroke-width="4.5"/>`
    + `<path d="M${bx - 9} ${by + 4}L${bx + 10} ${by - 4.5}" stroke="${BRASS}" stroke-width="3.2" stroke-linecap="round"/>`
    + `<circle cx="200" cy="${E.cy + E.ry + 14}" r="10" stroke="${BRASS}" stroke-width="3.6"/></g>`
    + [52, 61, 70].map((d) => { const [x, y] = at(d); return `<circle cx="${x}" cy="${y}" r="2.6" fill="${SAND}"/>`; }).join('')
    + `<circle cx="200" cy="224" r="33" fill="${BRASS}"/><circle cx="200" cy="224" r="28.5" fill="none" stroke="${WOOD}" stroke-width="1.4"/><circle cx="200" cy="198" r="3.6" fill="${SAND}"/>`
    + hand(200, 236, t.petA, 31, { anchor: 'middle' })
    + fd(28, 318, t.postA, 44) + fd(28, 366, t.postB, 44, { italic: true, fill: OLIVE });

  // a story: how an order goes, on olive; the mark rises from the bottom, tone on tone
  const step = (i: number) => {
    const cy = 228 + i * 55;
    return `<path d="M44 ${cy - 17}l17 17-17 17-17-17z" fill="${i === 2 ? PAPER : 'none'}" stroke="${PAPER}" stroke-width="1.6"/>`
      + fd(44, cy + 5.5, String(i + 1), 16, { fill: i === 2 ? OLIVE : PAPER, anchor: 'middle', w: 600, ls: 0 }) + ft(76, cy + 5.5, t[`step${i}`], 16, { fill: PAPER })
      + (i < 2 ? `<path d="M44 ${cy + 22}V${cy + 34}" stroke="${PAPER}" stroke-width="1.5" stroke-dasharray="3 3"/>` : '');
  };
  const story = `<rect width="270" height="480" fill="${OLIVE}"/>${mark(-22, 322, 314, DEEP)}`
    + mark(26, 32, 40, PAPER) + fd(76, 57, t.name, 25, { fill: PAPER })
    + fd(26, 128, t.storyA, 38, { fill: PAPER }) + fd(26, 170, t.storyB, 38, { fill: SAND, italic: true })
    + [0, 1, 2].map(step).join('')
    + `<rect x="26" y="402" width="218" height="46" rx="23" fill="${PAPER}"/>` + ft(135, 430.5, t.cta, 15.5, { fill: OLIVE, w: 800, anchor: 'middle' });

  // ---------- on the street ----------
  // a poster: the mark in brass on night, and a name tag hanging from the point of the V
  const poster = `<rect width="300" height="400" fill="${INK}"/>`
    + `<path d="M150 208V236" stroke="${DUSK}" stroke-width="1.4"/>${mark(40, 32, 220, BRASS)}`
    + `<g transform="rotate(-7 150 236)"><path fill-rule="evenodd" d="M106 247l13-13h62l13 13v45H106zM154 245a4 4 0 1 0-8 0a4 4 0 1 0 8 0z" fill="${PAPER}"/>`
    + hand(150, 282, t.petB, 27, { anchor: 'middle' }) + '</g>'
    + fd(150, 340, t.posterA, 35, { fill: PAPER, anchor: 'middle' }) + ft(150, 363, t.posterB, 14.5, { fill: DUSK, w: 500, anchor: 'middle' })
    + eye(150, 387, t.cityUp, 14, { fill: BRASS, anchor: 'middle' });

  // a hang tag: olive head with the eyelet, and the name written by hand
  const print = `<path fill-rule="evenodd" d="M40 0H200L240 40V132H0V40ZM130 38a10 10 0 1 0-20 0a10 10 0 1 0 20 0Z" fill="${OLIVE}"/><path d="M0 131H240V318L228 330H12L0 318Z" fill="${SURFACE}"/>`
    + `<circle cx="120" cy="38" r="12.5" fill="none" stroke="${BRASS}" stroke-width="3.4"/>` + mark(88, 64, 64, PAPER)
    + `<path d="M117 41C112 22 102 8 94-6M123 41C130 20 142 8 152-6" fill="none" stroke="${WOOD}" stroke-width="2.6" stroke-linecap="round"/>`
    + eye(120, 162, t.tagFor, 12, { fill: OLIVE, anchor: 'middle', ls: 0.16 }) + hand(120, 218, t.petA, 58, { anchor: 'middle' })
    + `<path d="M34 230H206" stroke="${OLIVE}" stroke-width="1.3" stroke-dasharray="1.5 4" stroke-linecap="round"/>`
    + ft(24, 259, t.tagK1, 12, { fill: MUTED, w: 700 }) + fd(216, 259, t.tagV1, 15, { anchor: 'end', ls: -0.01 })
    + `<path d="M24 269H216" stroke="${BORDER}" stroke-width="1"/>`
    + ft(24, 288, t.tagK2, 12, { fill: MUTED, w: 700 }) + fd(216, 288, t.city, 15, { anchor: 'end', ls: -0.01 })
    + chevrons(27, 316, 14, 9, 7.5, OLIVE, 2.6);

  // ---------- in 3D: the box an order travels in — kraft, one ink, olive tape and a label written by hand ----------
  const [W, H, D] = [210, 110, 150];
  const kraft = (w: number, h: number) => `<rect width="${w}" height="${h}" fill="${WOOD}"/>`;
  const tape = (x: number, y: number, w: number, h: number) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${OLIVE}"/>`;
  const drop = tape(D / 2 - 17, 0, 34, 26) + chevrons(D / 2 - 7, 16, 14, 1, 0, PAPER, 2.6); // the tape folds down the sides
  const faces = {
    front: kraft(W, H) + mark(13, 20, 60, INK) + fd(82, 59, t.name, 42) + eye(W / 2, 97, t.made, 16, { anchor: 'middle', ls: 0.1 }),
    back: kraft(W, H) + mark(90, 9, 30, INK) + [t.boxA, t.boxB, t.boxC].map((s, i) => fd(W / 2, 59 + i * 22, s, 18, { anchor: 'middle', italic: true, ls: -0.01 })).join(''),
    right: kraft(D, H) + drop + `<path d="M55 60l20-20 20 20M55 80l20-20 20 20" fill="none" stroke="${INK}" stroke-width="7" stroke-linejoin="miter"/>` + eye(D / 2, 103, t.up, 16, { anchor: 'middle', ls: 0.06 }),
    left: kraft(D, H) + drop + fd(D / 2, 66, t.city, 21, { anchor: 'middle', italic: true, ls: -0.01 }) + chevrons(34, 92, 12, 5, 5.5, INK, 2.6),
    top: kraft(W, D) + tape(0, D / 2 - 17, W, 34) + chevrons(9, D / 2 + 5, 14, 10, 6, PAPER, 2.6)
      + mark(162, 13, 34, INK)
      + `<rect x="12" y="102" width="118" height="38" rx="2" fill="${SURFACE}"/>` + eye(22, 127, t.forUp, 16, { fill: OLIVE, ls: 0.1 }) + hand(84, 130, t.petA, 30),
    bottom: kraft(W, D) + `<rect width="${W}" height="${D}" fill="${INK}" opacity="0.28"/>` + tape(0, D / 2 - 17, W, 34),
  };

  return {
    logo: { main: { box: [0, 0, 600, 200], svg: main }, grid, secondary: { box: [0, 0, 240, 160], svg: secondary }, submark: { box: [0, 0, 100, 100], svg: submark } },
    patterns: [{ box: [0, 0, 120, 120], svg: p1 }, { box: [0, 0, 120, 120], svg: p2 }, { box: [0, 0, 120, 120], svg: p3 }],
    digital: { post: { box: [0, 0, 400, 400], svg: post }, story: { box: [0, 0, 270, 480], svg: story } },
    physical: { poster: { box: [0, 0, 300, 400], svg: poster }, print: { box: [0, 0, 240, 330], svg: print } },
    object: { kind: 'box', size: [W, H, D], faces },
  };
}

export const BRAND: BrandSpec = {
  id: 'velmar', kind: 'client',
  skin: {
    main: { bg: PAPER, ink: INK, muted: MUTED, accent: OLIVE, line: '#d6c2a0' },
    alt: { bg: INK, ink: PAPER, muted: DUSK, accent: BRASS, line: '#4f523e' },
    // the store's own corners (--radius-card: 1.75rem), its perforated rules and its Fraunces at 420
    onAccent: SURFACE, radius: '28px', rule: '1px dashed',
    heading: { weight: 420, transform: 'none', tracking: '-0.02em', style: 'normal' },
  },
  palette: [
    { key: 'paper', hex: PAPER, share: 44 }, { key: 'olive', hex: OLIVE, share: 20 }, { key: 'ink', hex: INK, share: 14 },
    { key: 'sand', hex: SAND, share: 10 }, { key: 'wood', hex: WOOD, share: 7 }, { key: 'brass', hex: BRASS, share: 5 },
  ],
  type: {
    display: { name: 'Fraunces', stack: "'bl-fraunces', serif", weights: [400, 600], italic: true },
    text: { name: 'Manrope', stack: "'bl-manrope', sans-serif", weights: [500, 700, 800] },
  },
  origin: { logo: 'repo', grid: 'lab', palette: 'repo', type: 'repo', patterns: 'lab', pieces: 'lab', object: 'lab' },
  art,
};
