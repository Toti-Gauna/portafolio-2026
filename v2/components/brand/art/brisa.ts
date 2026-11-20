import type { BrandArt, BrandSpec } from '../types';

/**
 * Clínica Brisa — the fictional dental clinic of the DentalOS demo (exercise). Direction «Editorial clínico cálido»
 * (dentalos/docs/spec/direccion.md): warm paper, a serif for titles, hairlines, gold as the only accent and the
 * «folio del turno», a paper ticket with a perforated edge and the day in large figures.
 * From its repo: every hex (src/styles/app.css), the two families and the symbol of src/ui/art/brand.tsx — a tooth,
 * a breeze (one gold arc) and a gold dot. Drawn for the board: the breeze opens a band of air through the tooth so
 * the mark also works in one ink, the grid, the patterns, the pieces and the care kit.
 */
const GREEN = '#1e5c55', DEEP = '#164842', NIGHT = '#12302e', PAPER = '#f6f1e8', CARD = '#fffcf7', INK = '#1b2a28';
const GOLD = '#d9b66c', GOLD_PRINT = '#b08a3e', GOLD_INK = '#76581a', SAND = '#e6d9c3', LINE = '#d8cdbb', GREY = '#55615e';
const MINT = '#cbddd7', MINT_50 = '#e2ece8', TEAL = '#6bbfb1', ENAMEL = '#f6f4ee', LINE_STRONG = '#8c816e';

/* The symbol in its own 48-unit box (BrandMark of the repo). TOOTH is its path, whole; CROWN and ROOTS are the same
   tooth with a band taken out around the breeze: its stroke (2.6) plus half a stroke of air on each side. */
const TOOTH = 'M14 17c0-3.2 2.4-5.6 5.6-5.6 2.4 0 3.4 1.3 4.4 1.3s2-1.3 4.4-1.3c3.2 0 5.6 2.4 5.6 5.6 0 3.8-1.9 5.6-2.6 8.9-.6 3.2-1.3 10.1-3.6 10.1-2 0-2.2-6-4.9-6s-2.9 6-4.9 6c-2.3 0-3-6.9-3.6-10.1C15.9 22.6 14 20.8 14 17z';
const CROWN = 'M14.8 24.79C15.48 22.15 14 20.35 14 17C14 13.8 16.4 11.4 19.6 11.4C22 11.4 23 12.7 24 12.7C25 12.7 26 11.4 28.4 11.4C31.6 11.4 34 13.8 34 17C34 20.21 32.64 21.99 31.8 24.46C29.94 24.06 28.04 23.81 26.14 23.71C24.22 23.6 22.3 23.64 20.38 23.82C18.5 24 16.63 24.31 14.8 24.79Z';
const ROOTS = 'M30.78 29.56C30.22 32.67 29.4 36 27.8 36C25.8 36 25.6 30 22.9 30C20.2 30 20 36 18 36C16.49 36 15.67 33.05 15.12 30.11C16.77 29.6 18.46 29.27 20.17 29.07C21.95 28.86 23.75 28.8 25.54 28.89C27.3 28.97 29.06 29.18 30.78 29.56Z';
/** the breeze: the repo's arc as a line (to draw it) and as the same line turned into a shape (to fill it) */
const BREEZE = 'M9 30c8-5 22-5 30 0';
const BAND = 'M8.31 28.9C10.55 27.5 13.06 26.55 15.63 25.92C18.36 25.26 21.18 24.95 24 24.95C26.82 24.95 29.64 25.26 32.37 25.92C34.94 26.55 37.45 27.5 39.69 28.9A1.3 1.3 0 0 1 38.31 31.1C36.3 29.85 34.05 29.01 31.75 28.45C29.22 27.83 26.61 27.55 24 27.55C21.39 27.55 18.78 27.83 16.25 28.45C13.95 29.01 11.7 29.85 9.69 31.1A1.3 1.3 0 0 1 8.31 28.9Z';
/** the breeze is (within a tenth of a unit) an arc of this circle, centred on the axis of the tooth */
const ARC = { cx: 24, cy: 58.125, r: 31.875 };

const n = (v: number) => Math.round(v * 100) / 100;
/** The symbol with the axis of the tooth on `cx` and its roots standing on `base`, at `s` px per unit. */
const mark = (cx: number, base: number, s: number, o: { tooth?: string; gold?: string } = {}) =>
  `<g transform="translate(${n(cx - 24 * s)} ${n(base - 36 * s)}) scale(${s})"><path d="${CROWN}${ROOTS}" fill="${o.tooth ?? ENAMEL}"/>`
  + `<path d="${BAND}" fill="${o.gold ?? GOLD}"/><circle cx="37" cy="12" r="2.4" fill="${o.gold ?? GOLD}"/></g>`;
const txt = (x: number, y: number, s: string, size: number, o: { fill?: string; w?: number; cls?: 'bl-fd' | 'bl-ft'; anchor?: string; ls?: number } = {}) => {
  const cls = o.cls ?? 'bl-fd';
  return `<text class="${cls}" x="${n(x)}" y="${n(y)}" font-size="${size}" font-weight="${o.w ?? (cls === 'bl-fd' ? 500 : 400)}" fill="${o.fill ?? PAPER}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''}>${s}</text>`;
};
const rule = (x1: number, y: number, x2: number, c = LINE, w = 1) => `<path d="M${n(x1)} ${n(y)}H${n(x2)}" stroke="${c}" stroke-width="${w}" fill="none"/>`;
/** A folio: a sheet whose left edge is perforated (half holes of r 4 every 14, as in the repo's .folio). */
const sheet = (x: number, y: number, w: number, h: number, fill: string, stroke = LINE) => {
  const holes = Math.floor((h - 12) / 14), first = y + (h - (holes - 1) * 14) / 2;
  let d = `M${x} ${y}H${x + w}V${y + h}H${x}`;
  for (let i = holes - 1; i >= 0; i--) d += `V${n(first + i * 14 + 4)}A4 4 0 0 0 ${x} ${n(first + i * 14 - 4)}`;
  return `<path d="${d}Z" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
};
/** A row of breezes, end to end: `k` arcs of width `w` from (x, y). */
const breezes = (x: number, y: number, w: number, k: number) =>
  `M${n(x)} ${n(y)}` + Array.from({ length: k }, () => `c${n(w * 8 / 30)} ${n(-w / 6)} ${n(w * 22 / 30)} ${n(-w / 6)} ${n(w)} 0`).join('');

function art(t: Record<string, string>): BrandArt {
  /* ---------- the logo: the symbol and the name in two lines; the gold dot is the module ---------- */
  const S = 5.6, M = 4.8 * S; // the dot's diameter: clear space, and the gap between symbol and name
  const AX = M + (24 - 7.7) * S, BASE = 184; // axis of the tooth; the line the roots and the tag stand on
  const ox = AX - 24 * S, oy = BASE - 36 * S; // where the 48-unit box starts
  const px = (u: number) => n(ox + u * S), py = (u: number) => n(oy + u * S);
  const NX = n(px(40.3) + M); // the name starts one module after the breeze ends
  const main = `<g transform="translate(${n(ox)} ${n(oy)}) scale(${S})">`
    + `<path class="bl-draw" style="--i:0" d="${CROWN}" fill="none" stroke="${ENAMEL}" stroke-width="0.4"/><path class="bl-draw" style="--i:1" d="${ROOTS}" fill="none" stroke="${ENAMEL}" stroke-width="0.4"/>`
    + `<path class="bl-fill" style="--i:3" d="${CROWN}${ROOTS}" fill="${ENAMEL}"/>`
    + `<path class="bl-draw" style="--i:5" d="${BREEZE}" fill="none" stroke="${GOLD}" stroke-width="2.6" stroke-linecap="round"/>`
    + `<circle class="bl-fill" style="--i:9" cx="37" cy="12" r="2.4" fill="${GOLD}"/></g>`
    + `<g class="bl-fill" style="--i:9">${txt(NX, 98, t.first, 60, { ls: -0.7 })}${txt(NX, 154, t.last, 60, { ls: -0.7 })}</g>`
    + `<g class="bl-fill" style="--i:11">${txt(NX + 2, BASE, t.tag, 18, { cls: 'bl-ft', w: 600, fill: MINT, ls: 0.4 })}</g>`;
  const arc = (r: number, u1: number, u2: number) => { // an arc of the breeze's circle (radius r, in units) between two x
    const y = (u: number) => ARC.cy - Math.sqrt(r * r - (u - ARC.cx) ** 2);
    return `<path class="bl-gc" d="M${px(u1)} ${py(y(u1))}A${n(r * S)} ${n(r * S)} 0 0 1 ${px(u2)} ${py(y(u2))}"/>`;
  };
  const RIGHT = NX + 174; // where «Clínica» ends
  const grid = [
    // clear space: one module (the dot) on every side of the lockup
    `<rect class="bl-g" x="${n(px(7.7) - M)}" y="${n(py(9.6) - M)}" width="${n(RIGHT - px(7.7) + 2 * M)}" height="${n(BASE - py(9.6) + 2 * M)}"/>`,
    `<rect class="bl-gm" x="${n(px(7.7) - M)}" y="${n(py(9.6) - M)}" width="${n(M)}" height="${n(M)}"/><rect class="bl-gm" x="${n(RIGHT)}" y="${BASE}" width="${n(M)}" height="${n(M)}"/>`,
    // the same module between the symbol and the name, and around the dot
    `<rect class="bl-gm" x="${px(40.3)}" y="${py(26.4)}" width="${n(M)}" height="${n(M)}"/><rect class="bl-gm" x="${px(34.6)}" y="${py(9.6)}" width="${n(M)}" height="${n(M)}"/>`,
    `<circle class="bl-gc" cx="${px(37)}" cy="${py(12)}" r="${n(2.4 * S)}"/><circle class="bl-gp" cx="${px(37)}" cy="${py(12)}" r="2.5"/>`,
    // tooth and breeze share one axis; the breeze reaches five units past the tooth on each side
    `<path class="bl-g" d="M${px(24)} ${py(5)}V${py(41)}M${px(14)} ${py(8.5)}V${py(38.5)}M${px(34)} ${py(8.5)}V${py(38.5)}M${px(9)} ${py(27)}V${py(38.5)}M${px(39)} ${py(27)}V${py(38.5)}"/>`,
    // the breeze is an arc of one circle; the band of air it opens is two arcs of the same centre
    arc(ARC.r, 4, 44), arc(ARC.r + 2.6, 13, 35), arc(ARC.r - 2.6, 13, 35),
    `<circle class="bl-gp" cx="${px(9)}" cy="${py(30)}" r="2.5"/><circle class="bl-gp" cx="${px(39)}" cy="${py(30)}" r="2.5"/><circle class="bl-gp" cx="${px(24)}" cy="${py(26.25)}" r="2.5"/>`,
    // the crown, the two lines of the name and the line everything stands on
    `<path class="bl-g" d="M${n(px(7.7) - M)} ${py(11.4)}H${n(RIGHT + M)}M${n(px(7.7) - M)} ${BASE}H${n(RIGHT + M)}M${NX} 98H${n(RIGHT)}M${NX} 154H${n(RIGHT)}M${NX} ${py(5)}V${n(BASE + M)}"/>`,
  ].join('');

  // the header's lockup, as the repo writes it: symbol, name in one line and the demo's tag under it
  const secondary = mark(46, 71, 2.05) + txt(96, 47, t.name, 34, { ls: -0.3 }) + txt(97, 68, t.tag, 13, { cls: 'bl-ft', w: 600, fill: MINT, ls: 0.3 });
  const submark = `<g transform="translate(-14.8 -11.6) scale(2.7)"><path d="${CROWN}${ROOTS}" fill="currentColor"/>`
    + `<path class="bl-acc" d="${BAND}" fill="currentColor"/><circle class="bl-acc" cx="37" cy="12" r="2.4" fill="currentColor"/></g>`;

  /* ---------- patterns ---------- */
  // breezes laid like scales: hairlines on the green, and one of them in gold with its dot
  const scales = `<rect width="120" height="120" fill="${GREEN}"/><g fill="none" stroke="${TEAL}" stroke-width="1" stroke-opacity="0.7">`
    + [0, 1, 2, 3, 4, 5, 6, 7].map((r) => `<path d="${breezes(r % 2 ? -30 : 0, 12 + r * 15, 60, r % 2 ? 3 : 2)}"/>`).join('')
    + `</g><path d="${breezes(30, 57, 60, 1)}" fill="none" stroke="${GOLD}" stroke-width="3.2" stroke-linecap="round"/><circle cx="86" cy="15.6" r="4.4" fill="${GOLD}"/>`
    + `<path d="${breezes(-30, 117, 60, 1)}${breezes(90, 117, 60, 1)}" fill="none" stroke="${ENAMEL}" stroke-width="1.6" stroke-linecap="round"/>`;
  // the chart: one tooth per cell between hairlines, and the one with the next step, whole
  const cell = (c: number, r: number) => `translate(${n(c * 40 + 20 - 24 * 0.92)} ${n(r * 40 + 21 - 23.7 * 0.92)}) scale(0.92)`;
  const chart = `<rect width="120" height="120" fill="${PAPER}"/><path d="M0 0.5H120M0 40.5H120M0 80.5H120M0.5 0V120M40.5 0V120M80.5 0V120" stroke="${LINE}" stroke-width="1" fill="none"/>`
    + [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => (r === 1 && c === 1
      ? `<g transform="${cell(c, r)}"><path d="${CROWN}${ROOTS}" fill="${GREEN}"/><path d="${BAND}" fill="${GOLD_PRINT}"/><circle cx="37" cy="12" r="2.4" fill="${GOLD_PRINT}"/></g>`
      : `<path transform="${cell(c, r)}" d="${TOOTH}" fill="${(r + c) % 2 ? CARD : 'none'}" stroke="${GREEN}" stroke-width="1.1"/>`))).join('');
  // the month: one dot per day on gold, and the day of the appointment circled
  const month = `<rect width="120" height="120" fill="${GOLD}"/>`
    + [0, 1, 2, 3, 4].flatMap((r) => [0, 1, 2, 3, 4].map((c) => (r === 2 && c === 3
      ? `<circle cx="${12 + c * 24}" cy="${12 + r * 24}" r="8.5" fill="${NIGHT}"/><circle cx="${12 + c * 24}" cy="${12 + r * 24}" r="2.6" fill="${ENAMEL}"/>`
      : `<circle cx="${12 + c * 24}" cy="${12 + r * 24}" r="${(r + c) % 7 === 6 ? 1.4 : 2.6}" fill="${NIGHT}"/>`))).join('');

  /* ---------- on screen ---------- */
  // the post: the clinic's line, set large on the green, with the symbol under it
  const post = `<rect width="400" height="400" fill="${GREEN}"/>`
    + txt(32, 52, t.name, 21) + txt(368, 52, t.kicker, 17, { cls: 'bl-ft', w: 700, fill: GOLD, anchor: 'end', ls: 1.2 }) + rule(32, 70, 368, TEAL, 1)
    + txt(32, 136, t.lineA, 46, { ls: -0.6 }) + txt(32, 186, t.lineB, 46, { ls: -0.6 }) + txt(32, 236, t.lineC, 46, { fill: GOLD, ls: -0.6 })
    + txt(32, 334, t.postA, 17, { cls: 'bl-ft', fill: MINT }) + txt(32, 357, t.postB, 17, { cls: 'bl-ft', fill: MINT })
    + mark(308, 366, 4.1);
  // the story: a reminder, with the folio of the appointment
  const story = `<rect width="270" height="480" fill="${PAPER}"/><rect width="270" height="72" fill="${GREEN}"/>${mark(38, 52, 1.25)}${txt(66, 46, t.name, 20)}`
    + txt(22, 106, t.kicker, 13, { cls: 'bl-ft', w: 700, fill: GOLD_INK, ls: 1.1 }) + txt(22, 142, t.storyA, 30, { fill: INK, ls: -0.4 }) + txt(22, 176, t.storyB, 30, { fill: GREEN, ls: -0.4 })
    + sheet(20, 198, 230, 172, CARD)
    + txt(40, 268, '22', 74, { fill: GREEN, ls: -1.5 }) + txt(124, 230, t.dow, 14, { cls: 'bl-ft', fill: GREY }) + txt(124, 248, t.month, 14, { cls: 'bl-ft', fill: GREY }) + txt(124, 268, t.time, 16, { cls: 'bl-ft', w: 700, fill: INK })
    + rule(40, 284, 232) + txt(40, 311, t.service, 19, { fill: INK })
    + txt(40, 332, t.where, 13, { cls: 'bl-ft', fill: GREY })
    + `<rect x="40" y="343" width="${n(t.status.length * 6.9 + 30)}" height="20" rx="10" fill="${MINT_50}" stroke="${MINT}"/><circle cx="51" cy="353" r="3" fill="${GREEN}"/>` + txt(59, 357.5, t.status, 13, { cls: 'bl-ft', w: 700, fill: DEEP })
    + `<rect x="20" y="386" width="230" height="44" rx="6" fill="${GREEN}"/>` + txt(135, 413, t.cta, 15, { cls: 'bl-ft', w: 700, anchor: 'middle' })
    + `<circle cx="${n(135 - t.sample.length * 3.2 - 8)}" cy="453.5" r="2.4" fill="${GOLD_PRINT}"/>` + txt(135, 458, t.sample, 13, { cls: 'bl-ft', fill: GREY, anchor: 'middle' });

  /* ---------- on the street ---------- */
  // the poster: the tooth, very large, on paper; a frame of hairlines and the invitation to book
  const poster = `<rect width="300" height="400" fill="${PAPER}"/><rect x="10.5" y="10.5" width="279" height="379" fill="none" stroke="${LINE}"/>`
    + txt(26, 40, t.posterKicker, 14, { cls: 'bl-ft', w: 700, fill: GOLD_INK, ls: 1.2 }) + rule(26, 52, 274)
    + mark(150, 244, 7, { tooth: GREEN, gold: GOLD_PRINT })
    + txt(26, 292, t.posterA, 33, { fill: INK, ls: -0.5 }) + txt(26, 327, t.posterB, 33, { fill: GREEN, ls: -0.5 })
    + txt(26, 350, t.posterSub, 14, { cls: 'bl-ft', fill: GREY }) + rule(26, 362, 274)
    + txt(26, 380, t.name, 15, { fill: INK }) + txt(274, 380, t.tag, 14, { cls: 'bl-ft', fill: GREY, anchor: 'end' });
  // the appointment card: the folio, to carry in a pocket
  const print = sheet(0.5, 0.5, 239, 149, CARD)
    + txt(16, 27, t.name, 15, { fill: INK }) + rule(16, 38, 158)
    + txt(15, 92, '22', 60, { fill: GREEN, ls: -1.2 }) + txt(84, 61, t.dow, 12, { cls: 'bl-ft', fill: GREY }) + txt(84, 76, t.month, 12, { cls: 'bl-ft', fill: GREY }) + txt(84, 92, t.time, 14, { cls: 'bl-ft', w: 700, fill: INK })
    + rule(16, 104, 158) + txt(16, 123, t.service, 15, { fill: INK }) + txt(16, 139, t.where, 11, { cls: 'bl-ft', fill: GREY })
    // the stub: the symbol and the state of the appointment, past a line of perforation
    + `<path d="M170.5 0.5V149.5" stroke="${LINE_STRONG}" stroke-width="1" stroke-dasharray="2 4" fill="none"/>` + mark(205, 86, 1.5, { tooth: GREEN, gold: GOLD_PRINT })
    + txt(205, 118, t.status, 11, { cls: 'bl-ft', w: 700, fill: GOLD_INK, anchor: 'middle', ls: 0.4 });

  /* ---------- in 3D: the care kit the clinic hands over, with the next appointment written on its back ---------- */
  const [W, H, D] = [176, 206, 78];
  const side = `<rect width="${D}" height="${H}" fill="${DEEP}"/><g fill="none" stroke="${GOLD}" stroke-width="1.1">`
    + Array.from({ length: 13 }, (_, r) => `<path d="${breezes(r % 2 ? -19.5 : 0, 16 + r * 15, 39, r % 2 ? 3 : 2)}"/>`).join('') + '</g>';
  return {
    logo: { main: { box: [0, 0, 440, 220], svg: main }, grid, secondary: { box: [0, 0, 296, 88], svg: secondary }, submark: { box: [0, 0, 100, 100], svg: submark } },
    patterns: [{ box: [0, 0, 120, 120], svg: scales }, { box: [0, 0, 120, 120], svg: chart }, { box: [0, 0, 120, 120], svg: month }],
    digital: { post: { box: [0, 0, 400, 400], svg: post }, story: { box: [0, 0, 270, 480], svg: story } },
    physical: { poster: { box: [0, 0, 300, 400], svg: poster }, print: { box: [0, 0, 240, 150], svg: print } },
    object: {
      kind: 'box', size: [W, H, D],
      faces: {
        front: `<rect width="${W}" height="${H}" fill="${GREEN}"/><rect x="7.5" y="7.5" width="${W - 15}" height="${H - 15}" fill="none" stroke="${GOLD}" stroke-width="1"/>`
          + mark(W / 2, 120, 3.1) + txt(W / 2, 152, t.name, 23, { anchor: 'middle' }) + rule(W / 2 - 18, 163, W / 2 + 18, GOLD, 1.5)
          + txt(W / 2, 185, t.kit, 16, { cls: 'bl-ft', w: 600, fill: MINT, anchor: 'middle', ls: 0.3 }),
        back: `<rect width="${W}" height="${H}" fill="${PAPER}"/><rect x="7.5" y="7.5" width="${W - 15}" height="${H - 15}" fill="none" stroke="${LINE}" stroke-width="1"/>`
          + txt(W / 2, 44, t.next, 21, { fill: GREEN, anchor: 'middle' }) + rule(20, 57, W - 20)
          + txt(20, 90, t.day, 16, { cls: 'bl-ft', fill: GREY }) + rule(66, 92, W - 20, LINE_STRONG) + txt(20, 124, t.hour, 16, { cls: 'bl-ft', fill: GREY }) + rule(66, 126, W - 20, LINE_STRONG)
          + `<path d="${breezes(W / 2 - 15, 150, 30, 1)}" fill="none" stroke="${GOLD_PRINT}" stroke-width="2.4" stroke-linecap="round"/>`
          + txt(W / 2, 172, t.tagA, 16, { fill: INK, anchor: 'middle' }) + txt(W / 2, 190, t.tagB, 16, { fill: INK, anchor: 'middle' }),
        left: side, right: side,
        top: `<rect width="${W}" height="${D}" fill="${GOLD}"/>${mark(W / 2, 64, 1.9, { tooth: NIGHT, gold: NIGHT })}`,
        bottom: `<rect width="${W}" height="${D}" fill="${NIGHT}"/>`,
      },
    },
  };
}

export const BRAND: BrandSpec = {
  id: 'brisa', kind: 'exercise',
  skin: {
    main: { bg: GREEN, ink: PAPER, muted: MINT, accent: GOLD, line: '#3f7a72' },
    alt: { bg: PAPER, ink: INK, muted: GREY, accent: '#9a6a0e', line: LINE },
    onAccent: INK, radius: '6px', rule: '1px solid',
    heading: { weight: 500, transform: 'none', tracking: '-0.012em', style: 'normal' },
  },
  palette: [
    { key: 'green', hex: GREEN, share: 36 }, { key: 'paper', hex: PAPER, share: 30 }, { key: 'ink', hex: INK, share: 10 },
    { key: 'gold', hex: GOLD, share: 8 }, { key: 'sand', hex: SAND, share: 8 }, { key: 'night', hex: NIGHT, share: 8 },
  ],
  type: {
    display: { name: 'Newsreader', stack: "'bl-newsreader', serif", weights: [500] },
    text: { name: 'Source Sans 3', stack: "'bl-sourcesans', sans-serif", weights: [400, 600, 700] },
  },
  origin: { logo: 'repo', grid: 'lab', palette: 'repo', type: 'repo', patterns: 'lab', pieces: 'lab', object: 'lab' },
  art,
};
