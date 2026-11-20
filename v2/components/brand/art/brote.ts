import type { BrandArt, BrandSpec } from '../types';

/**
 * Brote — a brand exercise invented for the lab: a nursery of indoor plants. It does not exist and copies no one.
 * The idea: the «o» of «brote» is a pot, and a sprout grows out of it. One circle (the «o») measures everything:
 * each leaf is the lens where two of those circles cross, and every plant of the system is built with that leaf.
 * Sprout green is the field, soil brown the ink, terracotta the pot. Soft, round and clear; each plant has its care card.
 */
const HOJA = '#2f6b3e', BROTE = '#a8d672', MACETA = '#c9643f', CAL = '#f4f1e8', TIERRA = '#3b2a20', MUSGO = '#6f7f3a';

const f = (v: number) => Math.round(v * 100) / 100;
/** unit vector of an angle in degrees, measured the way a plant grows (90 = straight up) */
const dir = (a: number): [number, number] => [Math.cos((a * Math.PI) / 180), -Math.sin((a * Math.PI) / 180)];

const txt = (x: number, y: number, s: string, size: number, o: { fill?: string; w?: number; cls?: string; anchor?: string; ls?: number } = {}) =>
  `<text class="${o.cls ?? 'bl-fd'}" x="${f(x)}" y="${f(y)}" font-size="${size}" font-weight="${o.w ?? 800}" fill="${o.fill ?? TIERRA}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''}>${s}</text>`;
const body = (x: number, y: number, s: string, size: number, o: { fill?: string; w?: number; anchor?: string } = {}) => txt(x, y, s, size, { cls: 'bl-ft', w: 600, ...o });

/* ------------------------------------------------------------------ the logo: the word, its pot and its sprout */

/**
 * A leaf of the logo: the lens of two circles of radius R whose centres are R apart (a vesica), growing from (x, y)
 * at angle a. The path is drawn `soft` inside and stroked 2 × soft with round joins: the outline keeps the two
 * circles and the tips come out round.
 */
function vesica(x: number, y: number, a: number, R: number, soft: number) {
  const [dx, dy] = dir(a), H = (R * Math.sqrt(3)) / 2, mx = x + dx * H, my = y + dy * H;
  const r = R - soft, h = Math.sqrt(r * r - (R * R) / 4);
  const p = `M${f(mx - dx * h)} ${f(my - dy * h)}A${f(r)} ${f(r)} 0 0 1 ${f(mx + dx * h)} ${f(my + dy * h)}A${f(r)} ${f(r)} 0 0 1 ${f(mx - dx * h)} ${f(my - dy * h)}Z`;
  // the centres of its two circles: half a radius to each side of the leaf's axis
  const c: [number, number][] = [[mx - dy * (R / 2), my + dx * (R / 2)], [mx + dy * (R / 2), my - dx * (R / 2)]];
  const tip: [number, number] = [x + dx * 2 * H, y + dy * 2 * H];
  // the same lens with its sharp tips (the submark, which is one flat shape)
  const q = `M${f(x)} ${f(y)}A${f(R)} ${f(R)} 0 0 1 ${f(tip[0])} ${f(tip[1])}A${f(R)} ${f(R)} 0 0 1 ${f(x)} ${f(y)}Z`;
  return { p, q, c, tip, sw: 2 * soft };
}

/**
 * The geometry of the word, from its type size F (measured on Bricolage Grotesque 800: x-height 0.531 em, the «o»
 * 0.556 em tall with a 0.014 em overshoot). cx is the axis of the «o», base the baseline.
 */
function geo(cx: number, base: number, F: number) {
  const R = 0.278 * F, sw = 0.15 * F, cy = base - 0.264 * F, top = cy - R;
  const stem = top - 0.8 * R, node = top - 0.38 * R; // where the big leaf and the small one leave the stem
  return { R, sw, cy, top, stem, node, big: vesica(cx, stem, 45, R, 0.06 * R), small: vesica(cx, node, 150, 0.75 * R, 0.06 * R), left: cx - R - 0.02 * F, right: cx + R + 0.03 * F };
}

type Tint = { ink: string; pot: string; leaf: string };
/** on the light fields (sprout, lime) and on the dark one (leaf) */
const LIGHT: Tint = { ink: TIERRA, pot: MACETA, leaf: HOJA }, DARK: Tint = { ink: CAL, pot: CAL, leaf: BROTE };

/** The pot and its sprout, without letters. */
function potted(cx: number, base: number, F: number, c: Tint, draw = false) {
  const g = geo(cx, base, F), r = g.R - g.sw / 2;
  const cl = (k: string, i: number) => (draw ? ` class="${k}" style="--i:${i}"` : '');
  const lf = (v: ReturnType<typeof vesica>, i: number) => `<path${cl('bl-fill', i)} d="${v.p}" fill="${c.leaf}" stroke="${c.leaf}" stroke-width="${f(v.sw)}" stroke-linejoin="round"/>`;
  return `<path${cl('bl-draw', 4)} d="M${f(cx)} ${f(g.top + g.sw / 2)}V${f(g.stem)}" fill="none" stroke="${c.leaf}" stroke-width="${f(0.22 * g.R)}" stroke-linecap="round"/>`
    + `<path${cl('bl-draw', 0)} d="M${f(cx)} ${f(g.cy - r)}A${f(r)} ${f(r)} 0 1 1 ${f(cx)} ${f(g.cy + r)}A${f(r)} ${f(r)} 0 1 1 ${f(cx)} ${f(g.cy - r)}Z" fill="none" stroke="${c.pot}" stroke-width="${f(g.sw)}"/>`
    + lf(g.small, 6) + lf(g.big, 7);
}

/** The logo: «br», the pot that is its «o» with the sprout, and «te». Set by its two halves, so the «o» is always on its axis. */
function word(cx: number, base: number, F: number, t: Record<string, string>, c: Tint, draw = false) {
  const g = geo(cx, base, F);
  return `<g${draw ? ' class="bl-fill" style="--i:2"' : ''}>${txt(g.left, base, t.nameA, f(F), { fill: c.ink, anchor: 'end' })}${txt(g.right, base, t.nameB, f(F), { fill: c.ink })}</g>` + potted(cx, base, F, c, draw);
}
/** where the ink of the word starts and ends, from the axis of the «o» (measured: «br» 0.976 em, «te» 0.882 em) */
const INK_L = 0.278 + 0.02 + 0.976 - 0.031, INK_R = 0.278 + 0.03 + 0.882;
/** the word, centred on x */
const wordAt = (x: number, base: number, F: number, t: Record<string, string>, c: Tint) => word(x + ((INK_L - INK_R) / 2) * F, base, F, t, c);

/* ------------------------------------------------------------------ the system: one leaf, every plant */

/** The same leaf, freer: from (x, y), at angle a, `len` long and `fat` × len wide, with soft tips. */
function leaf(x: number, y: number, a: number, len: number, fill: string, fat = 0.56) {
  const [dx, dy] = dir(a), w = len * fat, r = f((len * len + w * w) / (4 * w)), x1 = f(x + dx * len), y1 = f(y + dy * len);
  return `<path d="M${f(x)} ${f(y)}A${r} ${r} 0 0 1 ${x1} ${y1}A${r} ${r} 0 0 1 ${f(x)} ${f(y)}Z" fill="${fill}" stroke="${fill}" stroke-width="${f(len * 0.07)}" stroke-linejoin="round"/>`;
}
/** A leaf on its stalk, with its vein: from (x, y) at angle a, a stalk `s` long and then the leaf. */
function stalk(x: number, y: number, a: number, s: number, len: number, fill: string, fat = 0.56, vein = BROTE) {
  const [dx, dy] = dir(a), bx = x + dx * s, by = y + dy * s, ln = (k0: number, k1: number, c: string, w: number) =>
    `<path d="M${f(x + dx * k0)} ${f(y + dy * k0)}L${f(x + dx * k1)} ${f(y + dy * k1)}" stroke="${c}" stroke-width="${f(w)}" stroke-linecap="round" fill="none"/>`;
  return (s ? ln(0, s, fill, len * 0.075) : '') + leaf(bx, by, a, len, fill, fat) + ln(s + len * 0.14, s + len * 0.68, vein, len * 0.042);
}
type Stalk = [a: number, s: number, len: number, fill: string, vein?: string];
/** A plant: stalks out of one point, drawn from the back to the front. */
const plant = (x: number, y: number, ls: Stalk[], fat?: number) => ls.map(([a, s, l, c, v]) => stalk(x, y, a, s, l, c, fat, v)).join('');
/** A fan of plain leaves out of one point: [angle, length, colour]. */
const fan = (x: number, y: number, ls: [number, number, string][], fat?: number) => ls.map(([a, l, c]) => leaf(x, y, a, l, c, fat)).join('');

/** A terracotta pot seen from the front: its rim and its body, w wide and h tall, from the top of the rim. */
function pot(cx: number, top: number, w: number, h: number, fill = MACETA) {
  const rim = h * 0.24, a = w * 0.43, b = w * 0.32, r = h * 0.13, y0 = top + rim - 2, y1 = top + h;
  const at = (y: number) => a - ((a - b) * (y - y0)) / (y1 - r - y0); // half-width of the body at a height
  const sh = y0 + 2 + h * 0.07;
  return `<path d="M${f(cx - a)} ${f(y0)}H${f(cx + a)}L${f(cx + b)} ${f(y1 - r)}Q${f(cx + b - 1)} ${f(y1)} ${f(cx + b - r)} ${f(y1)}H${f(cx - b + r)}Q${f(cx - b + 1)} ${f(y1)} ${f(cx - b)} ${f(y1 - r)}Z" fill="${fill}"/>`
    + `<path d="M${f(cx - at(y0 + 2))} ${f(y0 + 2)}H${f(cx + at(y0 + 2))}L${f(cx + at(sh))} ${f(sh)}H${f(cx - at(sh))}Z" fill="${TIERRA}" fill-opacity="0.2"/>`
    + `<rect x="${f(cx - w / 2)}" y="${f(top)}" width="${f(w)}" height="${f(rim)}" rx="${f(rim * 0.42)}" fill="${fill}"/>`;
}

/** The three signs of a care card, drawn around (0, 0) in a 20-unit box: water, light and care. */
const SIGN = {
  water: (c: string) => `<path d="M0 -8.4C4.2 -3.4 6.6 -0.4 6.6 2.6A6.6 6.6 0 1 1 -6.6 2.6C-6.6 -0.4 -4.2 -3.4 0 -8.4Z" fill="${c}"/>`,
  light: (c: string) => `<circle r="3.9" fill="${c}"/><path d="${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const [x, y] = dir(a); return `M${f(x * 6.4)} ${f(y * 6.4)}L${f(x * 8.8)} ${f(y * 8.8)}`; }).join('')}" stroke="${c}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`,
  care: (c: string) => `<g transform="translate(-0.5 7.5)">${leaf(0, 0, 58, 10, c, 0.62)}${leaf(0, 0, 138, 7.5, c, 0.62)}</g>`,
};
type Sign = keyof typeof SIGN;
/** A sign on its round badge. */
const badge = (k: Sign, x: number, y: number, r: number, bg: string, fg: string) =>
  `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${bg}"/><g transform="translate(${f(x)} ${f(y)}) scale(${f(r / 14)})">${SIGN[k](fg)}</g>`;
/** A scale of three dots: how much water, light or care a plant asks for. */
const dots = (x: number, y: number, on: number, c: string, r = 4.6, gap = 14) =>
  [0, 1, 2].map((i) => (i < on ? `<circle cx="${f(x + i * gap)}" cy="${f(y)}" r="${r}" fill="${c}"/>` : `<circle cx="${f(x + i * gap)}" cy="${f(y)}" r="${f(r - 1)}" fill="none" stroke="${c}" stroke-width="2"/>`)).join('');
/** A pill with a sign and a line of text. */
const pill = (x: number, y: number, w: number, h: number, k: Sign, s: string, size: number) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${HOJA}"/>${badge(k, x + h / 2, y + h / 2, h / 2 - 5, BROTE, HOJA)}${body(x + h + 2, y + h / 2 + size * 0.35, s, size, { fill: CAL })}`;

function art(t: Record<string, string>): BrandArt {
  /* ---- the main logo: 540 × 300, the word at 170 with half an «o» of air on every side */
  const CX = 274.5, BASE = 243, F = 170, G = geo(CX, BASE, F), R = G.R;
  const main = word(CX, BASE, F, t, LIGHT, true);
  const L = CX - INK_L * F, Rg = CX + INK_R * F, T = G.big.tip[1], B = G.cy + R; // the ink of the logo
  const xh = BASE - 0.531 * F;
  const grid = [
    // clear space: one «o» radius on every side, and the module (R × R) that measures it
    `<rect class="bl-g" x="${f(L - R)}" y="${f(T - R)}" width="${f(Rg - L + 2 * R)}" height="${f(B - T + 2 * R)}" rx="${f(R)}"/>`,
    `<rect class="bl-gm" x="${f(L - R)}" y="${f(BASE - R)}" width="${f(R)}" height="${f(R)}"/><rect class="bl-gm" x="${f(Rg)}" y="${f(BASE - R)}" width="${f(R)}" height="${f(R)}"/>`,
    `<rect class="bl-gm" x="${f(CX - R / 2)}" y="${f(B)}" width="${f(R)}" height="${f(R)}"/>`,
    // the base line, the x-height and the axis of the «o», which is the stem
    `<path class="bl-g" d="M${f(L - R)} ${BASE}H${f(Rg + R)}M${f(L - R)} ${f(xh)}H${f(Rg + R)}M${f(CX)} ${f(T - R)}V${f(B + R)}"/>`,
    // the axes of the two leaves: 45° and 150°
    `<path class="bl-g" d="M${f(CX)} ${f(G.stem)}L${f(G.big.tip[0] + 18)} ${f(G.big.tip[1] - 18)}M${f(CX)} ${f(G.node)}L${f(G.small.tip[0] - 15.6)} ${f(G.small.tip[1] - 9)}"/>`,
    // the «o»: one circle. Each leaf: the crossing of two (the big one, the same circle; the small one, three quarters)
    `<circle class="bl-gc" cx="${f(CX)}" cy="${f(G.cy)}" r="${f(R)}"/><circle class="bl-gc" cx="${f(CX)}" cy="${f(G.cy)}" r="${f(R - G.sw)}"/>`,
    ...G.big.c.map(([x, y]) => `<circle class="bl-gc" cx="${f(x)}" cy="${f(y)}" r="${f(R)}"/><circle class="bl-gp" cx="${f(x)}" cy="${f(y)}" r="2.6"/>`),
    ...G.small.c.map(([x, y]) => `<circle class="bl-gc" cx="${f(x)}" cy="${f(y)}" r="${f(R * 0.75)}"/><circle class="bl-gp" cx="${f(x)}" cy="${f(y)}" r="2.6"/>`),
    `<circle class="bl-gp" cx="${f(CX)}" cy="${f(G.cy)}" r="2.6"/><circle class="bl-gp" cx="${f(CX)}" cy="${f(G.stem)}" r="2.6"/><circle class="bl-gp" cx="${f(CX)}" cy="${f(G.node)}" r="2.6"/>`,
  ].join('');

  /* ---- the secondary: the word on one line with what it is */
  const secondary = word(95.5, 92, 64, t, LIGHT)
    + `<path d="M190 46V92" stroke="${TIERRA}" stroke-width="3" stroke-linecap="round" stroke-dasharray="0 7.6" fill="none"/>`
    + body(204, 67, t.tagA, 16, { w: 700 }) + body(204, 88, t.tagB, 16, { w: 700, fill: HOJA });

  /* ---- the submark: the pot and its sprout. The pot takes the ink, the sprout the accent */
  const sg = geo(49.5, 91.5, 75);
  const sr = sg.R - sg.sw / 2, sw2 = 0.11 * sg.R;
  const submark = `<path class="bl-acc" d="M${f(49.5 - sw2)} ${f(sg.top + sg.sw / 2)}V${f(sg.stem)}A${f(sw2)} ${f(sw2)} 0 0 1 ${f(49.5 + sw2)} ${f(sg.stem)}V${f(sg.top + sg.sw / 2)}Z" fill="currentColor"/>`
    + `<circle cx="49.5" cy="${f(sg.cy)}" r="${f(sr)}" fill="none" stroke="currentColor" stroke-width="${f(sg.sw)}"/>`
    + `<path class="bl-acc" d="${sg.small.q}" fill="currentColor"/><path class="bl-acc" d="${sg.big.q}" fill="currentColor"/>`;

  /* ---- patterns */
  const foliage = `<rect width="120" height="120" fill="${CAL}"/>`
    + leaf(11, 49, 45, 54, HOJA) + leaf(109, 49, 135, 54, BROTE) + leaf(49, 109, 135, 54, MUSGO) + leaf(71, 109, 45, 54, HOJA)
    + [[0, 0], [120, 0], [0, 120], [120, 120], [60, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${MACETA}"/>`).join('')
    + [[60, 0], [60, 120], [0, 60], [120, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${TIERRA}"/>`).join('');
  const pots = `<rect width="120" height="120" fill="${HOJA}"/>` + potted(30, 55, 44, { ink: CAL, pot: BROTE, leaf: CAL }) + potted(90, 115, 44, { ink: CAL, pot: MACETA, leaf: BROTE })
    + [[90, 30], [30, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${BROTE}"/>`).join('');
  const scales = `<rect width="120" height="120" fill="${MACETA}"/>`
    + [-1, 0, 1, 2, 3, 4, 5, 6, 7].flatMap((j) => [-1, 0, 1, 2, 3].map((i) => {
      const x = i * 40 + (((j % 2) + 2) % 2) * 20, y = j * 20;
      return `<circle cx="${x}" cy="${y}" r="20" fill="${MACETA}" stroke="${CAL}" stroke-width="2.6"/><circle cx="${x}" cy="${y - 9}" r="2.6" fill="${(i + j) % 3 === 0 ? BROTE : TIERRA}"/>`;
    })).join('');

  /* ---- on screen */
  // the plant of the week: a pothos in its pot, in front of a soft disc
  const vine = (d: string, ls: [number, number, number, number, string][]) => `<path d="${d}" fill="none" stroke="${HOJA}" stroke-width="4.5" stroke-linecap="round"/>` + ls.map(([x, y, a, l, c]) => stalk(x, y, a, 0, l, c, 0.76, c === BROTE ? HOJA : BROTE)).join('');
  const pothos = plant(306, 266, [[152, 12, 50, MUSGO], [26, 14, 52, MUSGO], [122, 26, 62, HOJA], [60, 30, 64, HOJA], [91, 44, 68, MUSGO], [100, 10, 34, BROTE, HOJA]], 0.76)
    + pot(306, 262, 132, 100)
    + vine('M338 266C360 274 370 296 366 334', [[357, 279, -12, 26, HOJA], [368, 304, -128, 28, MUSGO], [366, 334, -80, 32, HOJA]])
    + vine('M276 266C262 272 256 286 258 306', [[264, 276, 196, 24, MUSGO], [258, 306, -100, 28, HOJA]]);
  const post = `<rect width="400" height="400" fill="${BROTE}"/><circle cx="306" cy="232" r="122" fill="${CAL}"/>` + pothos
    + word(28 + INK_L * 40, 62, 40, t, LIGHT)
    + body(28, 116, t.postKicker, 17, { w: 700, fill: '#2a5233' }) + txt(26, 184, t.postName, 70, { ls: -2 })
    + pill(28, 228, 190, 40, 'water', t.care1, 17) + pill(28, 278, 190, 40, 'light', t.care2, 17) + pill(28, 328, 190, 40, 'care', t.care3, 17);

  // a care card as a story
  const row = (i: number, k: Sign, s: string, on: number) => badge(k, 50, 314 + i * 31, 11, HOJA, BROTE) + body(70, 319 + i * 31, s, 14.5, { w: 700 }) + dots(194, 314 + i * 31, on, HOJA);
  const story = `<rect width="270" height="480" fill="${HOJA}"/>` + wordAt(135, 62, 36, t, DARK)
    + `<rect x="20" y="82" width="230" height="318" rx="28" fill="${CAL}"/><rect x="32" y="94" width="206" height="136" rx="20" fill="${BROTE}"/>`
    + plant(135, 184, [[164, 8, 46, MUSGO, CAL], [16, 8, 46, MUSGO, CAL], [138, 14, 48, HOJA], [42, 14, 48, HOJA], [113, 22, 46, MUSGO, CAL], [67, 22, 46, MUSGO, CAL], [90, 26, 50, HOJA]], 0.5)
    + pot(135, 180, 74, 50)
    + body(36, 256, t.storyKicker, 13.5, { w: 700, fill: HOJA }) + txt(35, 289, t.storyName, 32, { ls: -0.6 })
    + row(0, 'water', t.rowWater, 2) + row(1, 'light', t.rowLight, 2) + row(2, 'care', t.rowCare, 3)
    + `<rect x="45" y="418" width="180" height="42" rx="21" fill="${BROTE}"/>` + body(135, 444.5, t.storyCta, 15, { w: 700, anchor: 'middle' });

  /* ---- on the street */
  // a poster for a cutting swap: one giant plant
  const poster = `<rect width="300" height="400" fill="${CAL}"/><circle cx="204" cy="246" r="112" fill="${BROTE}"/>`
    + txt(20, 62, t.posterA, 47, { ls: -1.4 }) + txt(20, 108, t.posterB, 47, { ls: -1.4, fill: HOJA })
    + `<path d="M196 274V214" fill="none" stroke="${HOJA}" stroke-width="13" stroke-linecap="round"/>`
    + stalk(196, 244, 150, 0, 92, HOJA, 0.577) + stalk(196, 216, 52, 0, 138, HOJA, 0.577)
    + pot(196, 268, 150, 112)
    + `<rect x="150" y="304" width="92" height="50" rx="25" fill="${CAL}"/>` + wordAt(196, 345, 27, t, LIGHT)
    + body(20, 300, t.posterC, 16, { w: 700 }) + body(20, 321, t.posterD, 16, { w: 700 })
    + `<rect x="20" y="344" width="112" height="34" rx="17" fill="${HOJA}"/>` + body(76, 366, t.posterDate, 14.5, { w: 700, fill: CAL, anchor: 'middle' });

  // the care card that goes with every plant: a stake for its pot
  const line = (i: number, k: Sign, s: string, v: string) => badge(k, 40, 160 + i * 32, 10.5, BROTE, HOJA) + body(58, 164.5 + i * 32, s, 13.5, { w: 700, fill: CAL }) + body(204, 164.5 + i * 32, v, 12.5, { fill: BROTE, anchor: 'end' })
    + (i ? `<path d="M30 ${144 + i * 32}H210" stroke="${CAL}" stroke-opacity="0.3" stroke-width="2" stroke-linecap="round" stroke-dasharray="0 6" fill="none"/>` : '');
  const print = `<path d="M40 10H200A26 26 0 0 1 226 36V224A26 26 0 0 1 200 250H150V302Q150 308 146 313L125 338Q120 343 115 338L94 313Q90 308 90 302V250H40A26 26 0 0 1 14 224V36A26 26 0 0 1 40 10Z" fill="${HOJA}"/>`
    + wordAt(120, 70, 36, t, DARK) + txt(120, 128, t.printName, 38, { fill: CAL, anchor: 'middle', ls: -0.8 })
    + line(0, 'water', t.rowWater, t.valWater) + line(1, 'light', t.rowLight, t.valLight) + line(2, 'care', t.rowCare, t.valCare)
    + `<circle cx="120" cy="286" r="7" fill="none" stroke="${BROTE}" stroke-width="4.5"/>`;

  /* ---- in 3D: a terracotta pot with its paper label. The label wraps it; its middle faces the visitor */
  const PR = 98, PH = 170, LR = 100.5, LW = Math.round(2 * Math.PI * PR), MID = LW / 2 + 18;
  const label = `<rect width="${LW}" height="${PH}" fill="${MACETA}"/><rect width="${LW}" height="11" fill="${TIERRA}" fill-opacity="0.24"/><rect y="${PH - 11}" width="${LW}" height="11" fill="${TIERRA}" fill-opacity="0.14"/>`
    + `<rect y="28" width="${LW}" height="114" fill="${CAL}"/><path d="M5 37H${LW}M5 133H${LW}" stroke="${HOJA}" stroke-width="2.8" stroke-linecap="round" stroke-dasharray="0 9" fill="none"/>`
    // the front: the logo and the plant's name
    + wordAt(MID, 101, 50, t, LIGHT) + txt(MID, 124, t.potName, 20, { anchor: 'middle', ls: -0.3 })
    // to its right, the care card; to its left, the plant
    + badge('water', MID + 116, 66, 15, HOJA, BROTE) + badge('light', MID + 152, 66, 15, HOJA, BROTE) + badge('care', MID + 188, 66, 15, HOJA, BROTE)
    + body(MID + 152, 104, t.care1, 16, { fill: TIERRA, w: 700, anchor: 'middle' }) + body(MID + 152, 124, t.care2, 16, { fill: HOJA, w: 700, anchor: 'middle' })
    + plant(MID - 166, 134, [[152, 0, 56, MUSGO, CAL], [28, 0, 56, MUSGO, CAL], [120, 0, 74, HOJA], [60, 0, 74, HOJA], [90, 0, 86, MUSGO, CAL]], 0.5)
    + leaf(24, 124, 64, 62, HOJA) + leaf(LW - 24, 124, 116, 62, MUSGO);
  // seen from above: the rim, the soil and the plant
  const above = (d: number) => {
    const c = d / 2, k = d / 168;
    return `<rect width="${d}" height="${d}" fill="${MACETA}"/><circle cx="${c}" cy="${c}" r="${f(c - 5 * k)}" fill="none" stroke="${TIERRA}" stroke-opacity="0.22" stroke-width="${f(3 * k)}"/><circle cx="${c}" cy="${c}" r="${f(69 * k)}" fill="${TIERRA}"/>`
      + fan(c, c, [0, 1, 2, 3, 4, 5, 6, 7].map((i): [number, number, string] => [i * 45 + 12, 61 * k, i % 2 ? HOJA : MUSGO]), 0.6)
      + fan(c, c, [0, 1, 2, 3].map((i): [number, number, string] => [i * 90 + 34, 38 * k, BROTE]), 0.62)
      + `<circle cx="${c}" cy="${c}" r="${f(5 * k)}" fill="${HOJA}"/>`;
  };

  return {
    logo: { main: { box: [0, 0, 540, 300], svg: main }, grid, secondary: { box: [0, 0, 320, 112], svg: secondary }, submark: { box: [0, 0, 100, 100], svg: submark } },
    patterns: [{ box: [0, 0, 120, 120], svg: foliage }, { box: [0, 0, 120, 120], svg: pots }, { box: [0, 0, 120, 120], svg: scales }],
    digital: { post: { box: [0, 0, 400, 400], svg: post }, story: { box: [0, 0, 270, 480], svg: story } },
    physical: { poster: { box: [0, 0, 300, 400], svg: poster }, print: { box: [0, 0, 240, 350], svg: print } },
    object: { kind: 'can', r: PR, h: PH, label, top: above(2 * PR), lid: { r: LR, h: 34, side: MACETA, top: above(2 * LR) } },
  };
}

export const BRAND: BrandSpec = {
  id: 'brote', kind: 'exercise',
  skin: {
    main: { bg: BROTE, ink: TIERRA, muted: '#2a5233', accent: HOJA, line: '#86b955' },
    alt: { bg: HOJA, ink: CAL, muted: '#d5e6bf', accent: BROTE, line: '#4d8a5c' },
    onAccent: CAL, radius: '28px', rule: '3px dotted',
    heading: { weight: 800, transform: 'none', tracking: '-0.035em', style: 'normal' },
  },
  palette: [
    { key: 'sprout', hex: BROTE, share: 34 }, { key: 'leaf', hex: HOJA, share: 26 }, { key: 'lime', hex: CAL, share: 18 },
    { key: 'pot', hex: MACETA, share: 10 }, { key: 'soil', hex: TIERRA, share: 8 }, { key: 'moss', hex: MUSGO, share: 4 },
  ],
  type: {
    display: { name: 'Bricolage Grotesque', stack: "'bl-bricolage', sans-serif", weights: [500, 700, 800] },
    text: { name: 'Figtree', stack: "'bl-figtree', sans-serif", weights: [400, 600, 700] },
  },
  origin: { logo: 'lab', grid: 'lab', palette: 'lab', type: 'lab', patterns: 'lab', pieces: 'lab', object: 'lab' },
  art,
};
