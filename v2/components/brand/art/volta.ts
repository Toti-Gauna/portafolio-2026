import type { BrandArt, BrandSpec } from '../types';

/**
 * Volta — the fictional supplements and sport shop of a sales demo (repo supplements-ecommerce, system «BOX»):
 * the training box as a brand. Carbon, steel and chalk, with the volt as the one signal light. Straight shapes
 * (0–4 px), a 7-segment LED scoreboard for every figure, lane markings under every label and hazard tape only for
 * notices. Symbol, colours and type are the repo's (src/config/brands/volta.ts, src/config/logo.ts, Led.tsx,
 * app/box.css); the grid, the patterns, the pieces and the tub are drawn for this board.
 */
const VOLT = '#c8ff2e', CARBON = '#0b0c0d', PLATE = '#151719', CHALK = '#f2f0ea', STEEL = '#a6abb0', PLASMA = '#5a3fe6';
const LINE = '#33383d', NIGHT = '#060707', CHIP = '#1f2225', PAPER = '#f3f3ef', GRAPHITE = '#131518', CHOC = '#5a3220';

const r2 = (n: number) => Math.round(n * 100) / 100;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const up = (s: string) => esc(s.toUpperCase());

type TxtOpt = { fill?: string; w?: number; cls?: string; anchor?: string; ls?: number; op?: number; rot?: string; wide?: boolean; extra?: string };
const txt = (x: number, y: number, s: string, size: number, o: TxtOpt = {}) =>
  `<text class="${o.cls ?? 'bl-fd'}${o.extra ? ` ${o.extra}` : ''}" x="${r2(x)}" y="${r2(y)}" font-size="${r2(size)}" font-weight="${o.w ?? 800}" fill="${o.fill ?? CHALK}"`
  + `${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.ls ? ` letter-spacing="${r2(o.ls)}"` : ''}${o.op ? ` opacity="${o.op}"` : ''}${o.rot ? ` transform="${o.rot}"` : ''}${o.wide ? ' font-stretch="125%"' : ''}>${s}</text>`;
/** A label in the text face: caps, bold and tracked (the repo's «eyebrow»). */
const tag = (x: number, y: number, s: string, size: number, o: TxtOpt = {}) => txt(x, y, up(s), size, { cls: 'bl-ft', w: 700, ls: size * 0.12, ...o });

/** The symbol (src/config/logo.ts, viewBox 0 0 64 64): the chalk stroke of the V and the bolt that closes it. */
const V_L = 'M4 8h14l13 34-5 14z', V_R = 'M44 8h17L48 30h7L27 60l8.5-23H29z';
const sym = (x: number, y: number, size: number, l = CHALK, r = VOLT) =>
  `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(size / 64)})"><path d="${V_L}" fill="${l}"/><path d="${V_R}" fill="${r}"/></g>`;
/** The steel plate of the header: a square of six modules with a bevel, the symbol on the four in the middle. */
const bevel = (x: number, y: number, w: number, h: number, sw: number) =>
  `<path d="M${r2(x + sw / 2)} ${r2(y + h)}V${r2(y + sw / 2)}H${r2(x + w)}" fill="none" stroke="${CHALK}" stroke-opacity=".16" stroke-width="${r2(sw)}"/>`;
const plate = (x: number, y: number, size: number, fill = CARBON) =>
  `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(size)}" height="${r2(size)}" rx="${r2(size / 24)}" fill="${fill}"/>${bevel(x, y, size, size, size / 36)}${sym(x + size / 6, y + size / 6, (size * 2) / 3)}`;

/** Lane marking (app/box.css, `lane`): dashes of 18 and gaps of 12, painted under a label. */
const lane = (x: number, y: number, w: number, color: string, k = 1, op = 1) =>
  `<path d="M${r2(x)} ${r2(y)}h${r2(w)}" fill="none" stroke="${color}" stroke-width="${r2(2 * k)}" stroke-dasharray="${r2(18 * k)} ${r2(12 * k)}"${op < 1 ? ` stroke-opacity="${op}"` : ''}/>`;

/** Hazard tape (app/box.css, `hazard`): diagonal stripes; a nested <svg> clips them without an id. */
const hazard = (x: number, y: number, w: number, h: number, bg: string, fg: string, p = 16) => {
  const n = Math.ceil((w + h) / p) + 1;
  const stripes = Array.from({ length: n }, (_, i) => `M${r2(i * p - h)} ${h}l${h} ${-h}h${p / 2}l${-h} ${h}z`).join('');
  return `<svg x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" viewBox="0 0 ${r2(w)} ${r2(h)}" overflow="hidden"><rect width="${r2(w)}" height="${r2(h)}" fill="${bg}"/><path d="${stripes}" fill="${fg}"/></svg>`;
};

/** The LED scoreboard (src/components/atoms/Led.tsx): seven segments in a cell of 40 × 58, leaning 7°. */
const hs = (cy: number) => `4,${cy} 7,${cy - 3} 25,${cy - 3} 28,${cy} 25,${cy + 3} 7,${cy + 3}`;
const vs = (cx: number, y1: number, y2: number) => `${cx},${y1} ${cx + 3},${y1 + 3} ${cx + 3},${y2 - 3} ${cx},${y2} ${cx - 3},${y2 - 3} ${cx - 3},${y1 + 3}`;
const SEGMENTS = [hs(3), vs(29, 4, 28), vs(29, 30, 54), hs(55), vs(3, 30, 54), vs(3, 4, 28), hs(29)];
const DIGITS: Record<string, string> = { '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg' };
const segs = (keys: string) => SEGMENTS.filter((_, k) => keys.includes('abcdefg'[k])).map((p) => `M${p}Z`).join('');
/** Width of a figure on the scoreboard, at height h. */
const ledW = (v: string, h: number) => ((v.length * 40 - 8 + 7) * h) / 58;
const led = (v: string, x: number, y: number, h: number, color: string, off = 0.1) =>
  `<g transform="translate(${r2(x + (7 * h) / 58)} ${r2(y)}) scale(${r2(h / 58)}) skewX(-7)" fill="${color}">`
  + [...v].map((c, i) => `<g transform="translate(${i * 40} 0)"><path d="${segs('abcdefg')}" opacity="${off}"/><path d="${segs(DIGITS[c] ?? '')}"/></g>`).join('') + '</g>';

/** The bolt of the house label (supplements/defs.tsx, pattern `bolt`), in a box of w × h. */
const labelBolt = (x: number, y: number, w: number, h: number) =>
  `<path d="M${r2(x + w * 0.8)} ${r2(y - 2)}h${r2(w * 0.18)}l${r2(-w * 0.1)} ${r2(h * 0.42)}h${r2(w * 0.09)}L${r2(x + w * 0.68)} ${r2(y + h + 2)}l${r2(w * 0.07)} ${r2(-h * 0.46)}h${r2(-w * 0.09)}z" fill="${VOLT}" opacity=".92"/>`;

/** The wide tub of the demo (supplements/tubs.tsx, `Tub`), flat, with the volt lid of this board. Text is set outside the scale. */
const tub = (x: number, y: number, s: number, id: string, t: Record<string, string>) => {
  const body = 'M6 38H182V196Q182 212 166 212H22Q6 212 6 196Z', lid = 'M0 5q0-5 5-5h178q5 0 5 5v35h-188z';
  const cyl = `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".1" stop-color="#000" stop-opacity=".16"/>`
    + '<stop offset=".25" stop-color="#fff" stop-opacity=".24"/><stop offset=".34" stop-color="#fff" stop-opacity=".05"/><stop offset=".62" stop-color="#000" stop-opacity="0"/>'
    + '<stop offset=".86" stop-color="#000" stop-opacity=".26"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>';
  const ridges = Array.from({ length: 25 }, (_, i) => `M${r2(((i + 1) * 188) / 26)} 6v31`).join('');
  return `<defs>${cyl}</defs><g transform="translate(${x} ${y}) scale(${s})">`
    + `<path d="${body}" fill="${PLATE}"/><rect x="6" y="38" width="176" height="10" fill="#000" opacity=".3"/>`
    + labelBolt(6 + 176 * 0.3, 64, 176 * 0.7, 111) + `<rect x="6" y="175" width="176" height="17" fill="${CHOC}"/><rect x="6" y="175" width="176" height="5" fill="#fff" opacity=".22"/>`
    + `<path d="${body}" fill="url(#${id})" opacity=".85"/>`
    + `<path d="${lid}" fill="${VOLT}"/><path d="${ridges}" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="1.4"/><path d="M4 2.5h180" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/>`
    + `<path d="${lid}" fill="url(#${id})" opacity=".7"/><rect y="37" width="188" height="3" fill="#000" opacity=".35"/></g>`
    + tag(x + s * 19, y + s * 88, t.house, 17, { ls: 0.6, op: 0.86 }) + txt(x + s * 19, y + s * 126, up(t.line), 26, { cls: 'bl-ft', w: 850, wide: true });
};

function art(t: Record<string, string>): BrandArt {
  // ---- the main logo: the plate of six modules, the name as tall as the V, the descriptor on its lane ----
  const U = 25, PX = 30, PY = 30, PS = 6 * U; // module, plate
  const SX = PX + U, SY = PY + U, K = (4 * U) / 64; // the symbol on the four modules in the middle
  const TOP = SY + 8 * K, BASE = SY + 60 * K; // the top line of the V and the tip of the bolt
  const NX = PX + PS + 1.5 * U, NF = (BASE - TOP) / 0.8, NW = 2.235 * NF; // the name: cap height 0.8 em, tracking 0.06 em
  const END = NX + NW, W = Math.round(END + PX), LW = END - PX;
  const dash = LW / (9 + (8 * 2) / 3), step = (dash * 5) / 3; // nine dashes, 3 : 2
  const P = (x: number, y: number) => `${r2(SX + x * K)} ${r2(SY + y * K)}`;
  const main = `<rect class="bl-draw" style="--i:0" x="${PX}" y="${PY}" width="${PS}" height="${PS}" rx="6" fill="none" stroke="${CARBON}" stroke-width="3"/>`
    + `<g class="bl-fill" style="--i:2"><rect x="${PX}" y="${PY}" width="${PS}" height="${PS}" rx="6" fill="${CARBON}"/>${bevel(PX, PY, PS, PS, 4)}</g>`
    + `<g transform="translate(${SX} ${SY}) scale(${K})"><path class="bl-fill" style="--i:4" d="${V_L}" fill="${CHALK}"/><path class="bl-fill" style="--i:7" d="${V_R}" fill="${VOLT}"/></g>`
    + txt(NX, BASE, up(t.name), NF, { fill: CARBON, ls: NF * 0.06, extra: 'bl-fill" style="--i:9' })
    + `<g class="bl-fill" style="--i:12">${tag(PX, PY + PS + U + 14, t.descriptor, 20, { fill: CARBON, ls: 3 })}</g>`
    + Array.from({ length: 9 }, (_, i) => `<path class="bl-draw" style="--i:${13 + i}" d="M${r2(PX + i * step)} 238h${r2(dash)}" fill="none" stroke="${CARBON}" stroke-width="4"/>`).join('');
  const grid = [
    // the plate: six modules a side; the symbol's box: the four in the middle
    `<path class="bl-g" d="${[1, 2, 3, 4, 5].map((i) => `M${PX + i * U} ${PY - 10}V${PY + PS + 10}M${PX - 10} ${PY + i * U}H${PX + PS + 10}`).join('')}"/>`,
    `<rect class="bl-gc" x="${PX}" y="${PY}" width="${PS}" height="${PS}"/><rect class="bl-gc" x="${SX}" y="${SY}" width="${4 * U}" height="${4 * U}"/>`,
    `<rect class="bl-gm" x="${PX}" y="${PY}" width="${U}" height="${U}"/><rect class="bl-gm" x="${PX + PS - U}" y="${PY + PS - U}" width="${U}" height="${U}"/>`,
    // both strokes of the V are born on one line; the name runs from that line to the tip of the bolt
    `<path class="bl-g" d="M8 ${r2(TOP)}H${W - 8}M8 ${r2(BASE)}H${W - 8}"/>`,
    // the outer edge of the chalk stroke aims at the tip of the bolt, and so does the bolt's own blade
    `<path class="bl-gc" d="M${P(4 - (14 * 22) / 48, -6)}L${P(4 + (52 * 22) / 48, 60)}M${P(55 + (26 * 28) / 30, 4)}L${P(27, 60)}"/>`,
    `<path class="bl-g" d="M${P(0, 30)}H${r2(SX + 64 * K)}M${P(0, 37)}H${r2(SX + 64 * K)}"/>`,
    ...[[27, 60], [4, 8], [18, 8], [44, 8], [61, 8], [48, 30], [55, 30], [29, 37], [35.5, 37]].map(([x, y]) => `<circle class="bl-gp" cx="${r2(SX + x * K)}" cy="${r2(SY + y * K)}" r="${x === 27 ? 3.4 : 2.2}"/>`),
    // a module and a half between plate and name; one module of clear space around the lockup
    `<rect class="bl-gm" x="${PX + PS}" y="${r2(TOP)}" width="${1.5 * U}" height="${r2(BASE - TOP)}"/>`,
    `<rect class="bl-g" x="${PX - U}" y="${PY - U}" width="${r2(END - PX + 2 * U)}" height="${PS + 2 * U}"/>`,
    `<rect class="bl-gm" x="${PX - U}" y="${PY - U}" width="${U}" height="${U}"/><rect class="bl-gm" x="${r2(END)}" y="${PY + PS}" width="${U}" height="${U}"/>`,
  ].join('');

  // ---- the stacked version: plate, name and three dashes of lane ----
  const secondary = plate(16, 14, 72) + txt(16, 148, up(t.name), 55, { fill: CARBON, ls: 3.3 })
    + [0, 1, 2, 3].map((i) => `<rect x="${r2(16 + i * 34.2)}" y="162" width="20.5" height="3.5" fill="${CARBON}"/>`).join('');
  const submark = `<g transform="translate(1.25 -1) scale(1.5)"><path d="${V_L}" fill="currentColor"/><path class="bl-acc" d="${V_R}" fill="currentColor"/></g>`;

  // ---- patterns: bolts with one switched on, the lab sheet, and the floor of the box ----
  const BOLT = 'M20 4 11 19h7l-3 13 10-17h-7z'; // src/config/brand.ts, BOLT_SVG (a tile of 36)
  const p0 = `<rect width="120" height="120" fill="${CARBON}"/>` + [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) =>
    `<path transform="translate(${c * 40 + 2} ${r * 40 + 2})" d="${BOLT}" fill="${r === 1 && c === 1 ? VOLT : r === c ? LINE : CHIP}"/>`)).join('');
  const fine = Array.from({ length: 15 }, (_, i) => `M${i * 8 + 0.5} 0V120M0 ${i * 8 + 0.5}H120`).join('');
  const major = [0, 1, 2].map((i) => `M${i * 40 + 0.5} 0V120M0 ${i * 40 + 0.5}H120`).join('');
  const p1 = `<rect width="120" height="120" fill="${PAPER}"/><path d="${fine}" stroke="${GRAPHITE}" stroke-opacity=".09" fill="none"/><path d="${major}" stroke="${GRAPHITE}" stroke-opacity=".24" fill="none"/>`
    + `<rect x="41" y="41" width="7.5" height="7.5" fill="${VOLT}"/><rect x="89" y="73" width="7.5" height="7.5" fill="${GRAPHITE}"/>`
    + `<path d="M77 80.5h7M80.5 77v7M37 0.5h7M40.5 -3v7M37 120.5h7M40.5 117v7" stroke="${GRAPHITE}" stroke-width="1.5" fill="none"/>`;
  const p2 = `<rect width="120" height="120" fill="${NIGHT}"/>${hazard(0, 8, 120, 22, VOLT, CARBON, 24)}`
    + `<path d="M0 60h120" stroke="${CHALK}" stroke-opacity=".5" stroke-width="3" stroke-dasharray="18 12" fill="none"/>`
    + `<path d="M15 90h120M-105 90h120" stroke="${VOLT}" stroke-width="3" stroke-dasharray="18 12" fill="none"/>`
    + `<path d="M0 112.5h120" stroke="${LINE}" stroke-width="1" fill="none"/>`;

  // ---- on screen: the product post (volt above, the box below) and the «how to» story in day mode (Tiza) ----
  const post = `<rect width="400" height="400" fill="${VOLT}"/>${plate(24, 22, 40)}${txt(74, 56, up(t.name), 40, { fill: CARBON, ls: 2.4 })}`
    + `<rect x="212" y="26" width="164" height="32" rx="2" fill="${CARBON}"/>${tag(294, 48, t.seal, 17, { fill: VOLT, ls: 1, anchor: 'middle' })}`
    + txt(24, 120, up(t.postA), 58, { fill: CARBON, w: 900, ls: 0.6 }) + txt(24, 178, up(t.postB), 58, { fill: CARBON, w: 900, ls: 0.6 })
    + `<rect y="196" width="400" height="204" fill="${CARBON}"/>`
    + `<rect x="24" y="216" width="176" height="92" rx="2" fill="${PLATE}"/><rect x="24" y="216" width="176" height="3" fill="${VOLT}"/>${bevel(24, 219, 176, 89, 1.5)}`
    + led('24', 38, 233, 60, VOLT) + txt(134, 293, up(t.gram), 46, { w: 800 })
    + tag(24, 338, t.postC, 17, { ls: 1.4 }) + tag(24, 360, t.postD, 17, { ls: 1.4, fill: STEEL }) + lane(24, 378, 176, CHALK, 1, 0.45)
    + tub(218, 204, 0.9, 'bl-volta-post-cyl', t);

  const sheet = Array.from({ length: 60 }, (_, i) => `${i < 34 ? `M${i * 8 + 0.5} 0V480` : ''}M0 ${i * 8 + 0.5}H270`).join('');
  const sheet40 = Array.from({ length: 12 }, (_, i) => `${i < 7 ? `M${i * 40 + 0.5} 0V480` : ''}M0 ${i * 40 + 0.5}H270`).join('');
  const row = (i: number, v: string, unit: string, sub: string) => {
    const y = 184 + i * 78;
    return `<rect x="22" y="${y}" width="226" height="70" rx="2" fill="${PLATE}"/><rect x="22" y="${y}" width="226" height="2.5" fill="${VOLT}"/>`
      + led(v, 118 - ledW(v, 40), y + 16, 40, VOLT) + txt(130, y + 37, up(unit), 27, { w: 800, ls: 0.5 }) + txt(130, y + 56, esc(sub), 13, { cls: 'bl-ft', w: 500, fill: STEEL });
  };
  const story = `<rect width="270" height="480" fill="${PAPER}"/><path d="${sheet}" stroke="${GRAPHITE}" stroke-opacity=".06" fill="none"/><path d="${sheet40}" stroke="${GRAPHITE}" stroke-opacity=".13" fill="none"/>`
    + plate(22, 26, 34) + tag(66, 48, t.house, 13.5, { fill: GRAPHITE, ls: 1.9 })
    + txt(22, 118, up(t.storyA), 46, { fill: GRAPHITE, w: 900, ls: 0.5 }) + txt(22, 164, up(t.storyB), 46, { fill: GRAPHITE, w: 900, ls: 0.5 })
    + row(0, '1', t.u1, t.s1) + row(1, '250', t.u2, t.s2) + row(2, '20', t.u3, t.s3)
    + lane(22, 428, 226, GRAPHITE, 1, 0.5)
    + hazard(0, 446, 270, 34, VOLT, CARBON, 16) + `<rect x="22" y="451" width="130" height="24" rx="2" fill="${CARBON}"/>${tag(87, 468, t.demo, 13, { fill: VOLT, ls: 1.5, anchor: 'middle' })}`;

  // ---- on the street: the poster (the symbol from across the avenue) and a coupon of the club, as a ticket ----
  const poster = `<rect width="300" height="400" fill="${CARBON}"/><path d="M60.5 26V400M180.5 26V400" stroke="${CHALK}" stroke-opacity=".05" fill="none"/>`
    + hazard(0, 0, 300, 26, VOLT, CARBON, 16) + `<rect x="16" y="3" width="140" height="20" rx="2" fill="${CARBON}"/>${tag(86, 18, t.demo, 14, { fill: VOLT, ls: 1.5, anchor: 'middle' })}`
    + sym(19 - 4 * 4.6, 44 - 8 * 4.6, 64 * 4.6)
    + txt(19, 358, up(t.name), 80, { ls: 4.8 }) + tag(19, 380, t.descriptor, 14.5, { fill: VOLT, ls: 2 }) + lane(19, 391, 262, CHALK, 1, 0.45);
  const TW = 264, TH = 116;
  const print = `<path d="M2 0H72l8 8 8-8H${TW - 2}a2 2 0 0 1 2 2V${TH - 2}a2 2 0 0 1-2 2H88l-8-8-8 8H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" fill="${PLATE}"/>`
    + `<path d="M2 0H72l8 8V${TH - 8}l-8 8H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" fill="${NIGHT}"/><rect x="0" y="0" width="72" height="3" fill="${VOLT}"/>`
    + `<path d="M80 14V${TH - 14}" stroke="${LINE}" stroke-width="2" stroke-dasharray="4 4" fill="none"/>`
    + sym(29, 12, 22) + txt(40, 76, '10%', 36, { fill: VOLT, anchor: 'middle', ls: 0.5 }) + tag(41, 96, t.off, 12.5, { fill: STEEL, ls: 2.5, anchor: 'middle' })
    + `<rect x="98" y="16" width="110" height="22" rx="2" fill="${CHIP}"/>${tag(153, 31.5, t.club, 12.5, { fill: VOLT, ls: 1, anchor: 'middle' })}`
    + txt(98, 62, esc(t.cupA), 14.5, { cls: 'bl-ft', w: 700 }) + tag(98, 82, t.code, 12.5, { fill: STEEL, ls: 1.2 }) + lane(98, 98, 150, CHALK, 1, 0.45);

  // ---- in 3D: the 2 lb tub of the house whey; the label goes all the way round ----
  const R = 84, H = 150, LW3 = Math.round(2 * Math.PI * R), LR = 88;
  const use = (i: number, v: string, unit: string) => led(v, 74 - ledW(v, 20), 50 + i * 26, 20, VOLT) + tag(82, 68 + i * 26, unit, 16, { ls: 1.2 });
  const label = `<rect width="${LW3}" height="${H}" fill="${PLATE}"/><rect width="${LW3}" height="9" fill="#000" opacity=".32"/><rect y="9" width="${LW3}" height="2.5" fill="${VOLT}"/>`
    + `<rect y="128" width="${LW3}" height="22" fill="${CHOC}"/><rect y="128" width="${LW3}" height="6" fill="#fff" opacity=".22"/>`
    // the front
    + labelBolt(246, 14, 216, 114) + sym(206, 21, 22) + tag(234, 38, t.house, 16, { ls: 2.2, op: 0.86 })
    + txt(206, 88, up(t.line), 40, { cls: 'bl-ft', w: 850, wide: true }) + tag(206, 112, t.sub, 16, { w: 600, ls: 0.4, op: 0.78 }) + tag(206, 145, t.flavor, 16, { ls: 2 })
    // how to load up, on the left
    + tag(28, 36, t.use, 16, { fill: VOLT, ls: 1.6 }) + use(0, '1', t.u1) + use(1, '250', t.u2) + use(2, '20', t.u3)
    // the demo notice, on the seam
    + hazard(498, 11.5, 30, 116.5, VOLT, CARBON, 16) + `<rect x="502" y="38" width="22" height="64" rx="2" fill="${CARBON}"/>${tag(519, 70, t.demoShort, 16, { fill: VOLT, ls: 2, anchor: 'middle', rot: 'rotate(-90 519 70)' })}`;
  const lidTop = `<rect width="${2 * LR}" height="${2 * LR}" fill="${VOLT}"/><circle cx="${LR}" cy="${LR}" r="80" fill="none" stroke="${CARBON}" stroke-opacity=".3" stroke-width="2.5"/>`
    + `<circle cx="${LR}" cy="${LR}" r="72" fill="none" stroke="${CARBON}" stroke-opacity=".16" stroke-width="1.5"/>${plate(LR - 40, LR - 40, 80)}`;

  return {
    logo: { main: { box: [0, 0, W, 262], svg: main }, grid, secondary: { box: [0, 0, 156, 180], svg: secondary }, submark: { box: [0, 0, 100, 100], svg: submark } },
    patterns: [{ box: [0, 0, 120, 120], svg: p0 }, { box: [0, 0, 120, 120], svg: p1 }, { box: [0, 0, 120, 120], svg: p2 }],
    digital: { post: { box: [0, 0, 400, 400], svg: post }, story: { box: [0, 0, 270, 480], svg: story } },
    physical: { poster: { box: [0, 0, 300, 400], svg: poster }, print: { box: [0, 0, TW, TH], svg: print } },
    object: { kind: 'can', r: R, h: H, label, top: `<rect width="${2 * R}" height="${2 * R}" fill="${PLATE}"/>`, lid: { r: LR, h: 30, side: VOLT, top: lidTop } },
  };
}

export const BRAND: BrandSpec = {
  id: 'volta', kind: 'exercise',
  skin: {
    main: { bg: VOLT, ink: CARBON, muted: LINE, accent: PLASMA, line: CARBON },
    alt: { bg: CARBON, ink: CHALK, muted: STEEL, accent: VOLT, line: LINE },
    onAccent: VOLT, radius: '2px', rule: '2px dashed',
    heading: { weight: 800, transform: 'uppercase', tracking: '0.01em', style: 'normal' },
  },
  palette: [
    { key: 'volt', hex: VOLT, share: 14 }, { key: 'carbon', hex: CARBON, share: 42 }, { key: 'plate', hex: PLATE, share: 18 },
    { key: 'chalk', hex: CHALK, share: 14 }, { key: 'steel', hex: STEEL, share: 8 }, { key: 'plasma', hex: PLASMA, share: 4 },
  ],
  type: {
    display: { name: 'Big Shoulders Display', stack: "'bl-bigshoulders', sans-serif", weights: [700, 900] },
    text: { name: 'Archivo', stack: "var(--family-sans), 'Archivo', sans-serif", weights: [400, 600] },
  },
  origin: { logo: 'repo', grid: 'lab', palette: 'repo', type: 'repo', patterns: 'lab', pieces: 'lab', object: 'lab' },
  art,
};
