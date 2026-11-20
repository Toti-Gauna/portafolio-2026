import type { BrandArt, BrandSpec } from '../types';

/**
 * Sereno — a brand exercise invented for the lab: a sourdough bakery that bakes before dawn. It does not exist.
 * The sereno is the one who keeps watch at night. The mark is a moon made of dough, scored like a loaf, and one
 * light left on: the oven. Three devices come out of it: the score (the module), the phases of the moon (the dough
 * that grows through the night) and the one lit window of the street.
 */
const NIGHT = '#1d2333', DOUGH = '#f1e4cc', CRUST = '#8a4b2a', OVEN = '#e0703a', WHEAT = '#c9a24a', FLOUR = '#fbf8f1';
const rad = (d: number) => (d * Math.PI) / 180;
const n = (v: number) => Math.round(v * 100) / 100;

/* The moon, in radii of the dough circle: a second circle (BITE) moved OFF along AXIS bites it. One module (MOD) is
   the width of a score; the three scores are centred on one ring every STEP degrees, each at the same
   SLANT to its radius; the light is two modules wide and touches the dough circle from inside. */
const BITE = 0.9, OFF = 0.54, AXIS = -34, MOD = 0.12, RING = 0.68, STEP = 30, SLANT = 60, CUT = 0.3;

/** What is left of the circle (cx, cy, r) when the second circle bites it. */
const crescent = (cx: number, cy: number, r: number) => {
  const a = (Math.acos((1 + OFF * OFF - BITE * BITE) / (2 * OFF)) * 180) / Math.PI;
  const p = (deg: number) => `${n(cx + r * Math.cos(rad(deg)))} ${n(cy + r * Math.sin(rad(deg)))}`;
  return `M${p(AXIS - a)}A${n(r)} ${n(r)} 0 1 0 ${p(AXIS + a)}A${n(r * BITE)} ${n(r * BITE)} 0 0 1 ${p(AXIS - a)}Z`;
};
const moon = (cx: number, cy: number, r: number) => {
  const at = (deg: number, k = 1): [number, number] => [cx + r * k * Math.cos(rad(deg)), cy + r * k * Math.sin(rad(deg))];
  const cuts = [-1, 0, 1].map((i) => {
    const a = AXIS + 180 + i * STEP, [mx, my] = at(a, RING), hx = (Math.cos(rad(a + SLANT)) * r * CUT) / 2, hy = (Math.sin(rad(a + SLANT)) * r * CUT) / 2;
    return [mx - hx, my - hy, mx + hx, my + hy];
  });
  return { body: crescent(cx, cy, r), cuts, light: at(AXIS, 1 - MOD), bite: at(AXIS, OFF), at };
};
/** A score as a closed shape (a hole in the dough). */
const slot = ([x1, y1, x2, y2]: number[], w: number) => {
  const l = Math.hypot(x2 - x1, y2 - y1), nx = (-(y2 - y1) / l) * (w / 2), ny = ((x2 - x1) / l) * (w / 2), r = n(w / 2);
  return `M${n(x1 + nx)} ${n(y1 + ny)}L${n(x2 + nx)} ${n(y2 + ny)}A${r} ${r} 0 0 0 ${n(x2 - nx)} ${n(y2 - ny)}L${n(x1 - nx)} ${n(y1 - ny)}A${r} ${r} 0 0 0 ${n(x1 + nx)} ${n(y1 + ny)}Z`;
};
/** The mark: the scores are holes (whatever is behind shows through them, like the oven through a cut). */
const mark = (cx: number, cy: number, r: number, o: { ink?: string; light?: string; acc?: boolean } = {}) => {
  const m = moon(cx, cy, r), ink = o.ink ?? NIGHT;
  return `<path fill-rule="evenodd" fill="${ink}" d="${m.body}${m.cuts.map((c) => slot(c, r * MOD)).join('')}"/>`
    + `<circle${o.acc ? ' class="bl-acc"' : ''} cx="${n(m.light[0])}" cy="${n(m.light[1])}" r="${n(r * MOD)}" fill="${o.acc ? 'currentColor' : o.light ?? FLOUR}"/>`;
};
/** A phase of the moon (f: 0.25 crescent, 0.5 half, 0.75 gibbous, 1 full), lit like the logo. The dough grows. */
const phase = (cx: number, cy: number, r: number, f: number, fill: string) => {
  if (f >= 1) return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
  const rx = n(r * Math.abs(1 - 2 * f));
  return `<path transform="rotate(${AXIS} ${cx} ${cy})" fill="${fill}" d="M${cx} ${cy - r}A${r} ${r} 0 0 0 ${cx} ${cy + r}A${rx} ${r} 0 0 ${f < 0.5 ? 1 : 0} ${cx} ${cy - r}Z"/>`;
};
const phases = (x: number, y: number, r: number, gap: number, ink: string, full: string, vertical = false) =>
  [0.25, 0.5, 0.75, 1].map((f, i) => phase(vertical ? x : x + i * gap, vertical ? y + i * gap : y, r, f, f === 1 ? full : ink)).join('');
/** Three parallel scores around (x, y). */
const scores = (x: number, y: number, len: number, w: number, gap: number, deg: number, stroke: string) => {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
  return `<path fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" d="${[-1, 0, 1].map((i) => `M${n(x - (c * len) / 2 - s * gap * i)} ${n(y - (s * len) / 2 + c * gap * i)}l${n(c * len)} ${n(s * len)}`).join('')}"/>`;
};
const ear = (x: number, y: number, stalk: string, grain: string) =>
  `<path d="M${x} ${y + 8}V${y + 64}" stroke="${stalk}" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="${x}" cy="${y + 6}" rx="2.8" ry="6" fill="${grain}"/>`
  + [18, 29, 40, 51].map((d) => `<ellipse cx="${x - 5.6}" cy="${y + d}" rx="2.8" ry="6" transform="rotate(-34 ${x - 5.6} ${y + d})" fill="${grain}"/><ellipse cx="${x + 5.6}" cy="${y + d}" rx="2.8" ry="6" transform="rotate(34 ${x + 5.6} ${y + d})" fill="${grain}"/>`).join('');
const txt = (x: number, y: number, s: string, size: number, o: { fill?: string; w?: number; ft?: boolean; anchor?: string; ls?: number; len?: number } = {}) =>
  `<text class="${o.ft ? 'bl-ft' : 'bl-fd'}" x="${x}" y="${y}" font-size="${size}" font-weight="${o.w ?? (o.ft ? 500 : 400)}" fill="${o.fill ?? NIGHT}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.len ? ` textLength="${o.len}"` : ''}>${s}</text>`;
const dots = (d: string, stroke: string, w = 2, gap = 7) => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="0.01 ${gap}"/>`;

function art(t: Record<string, string>): BrandArt {
  // ---- the logo: the moon over the name, on one axis ----
  const [LW, LH] = [372, 248], CX = LW / 2, CY = 72, R = 54, BASE = 200, SIZE = 76, X = 2 * MOD * R; // X: the light, two modules
  const m = moon(CX, CY, R);
  const main = `<path class="bl-draw" style="--i:0" fill="none" stroke="${NIGHT}" stroke-width="1" stroke-linejoin="round" d="${m.body}"/>`
    + `<path class="bl-fill" style="--i:3" fill="${NIGHT}" d="${m.body}"/>`
    + m.cuts.map((c, i) => `<path class="bl-draw" style="--i:${6 + i}" fill="none" stroke="${OVEN}" stroke-width="${n(R * MOD)}" stroke-linecap="round" d="M${n(c[0])} ${n(c[1])}L${n(c[2])} ${n(c[3])}"/>`).join('')
    + `<circle class="bl-fill" style="--i:9" cx="${n(m.light[0])}" cy="${n(m.light[1])}" r="${n(R * MOD)}" fill="${FLOUR}"/>`
    + `<g class="bl-fill" style="--i:10">${txt(CX, BASE, t.name, SIZE, { anchor: 'middle' })}</g>`
    + `<g class="bl-fill" style="--i:12">${txt(CX + 1.5, BASE + 29, t.tag, 16, { ft: true, w: 600, anchor: 'middle', len: 216 })}</g>`;
  const [L, Rt, T, B] = [CX - 133 - X, CX + 133 + X, CY - R - X, BASE + 29 + X]; // clear space: one light around the lockup
  const grid = [
    `<rect class="bl-g" x="${n(L)}" y="${n(T)}" width="${n(Rt - L)}" height="${n(B - T)}"/>`,
    ...[[L, T], [Rt - X, T], [L, B - X], [Rt - X, B - X]].map(([x, y]) => `<rect class="bl-gm" x="${n(x)}" y="${n(y)}" width="${n(X)}" height="${n(X)}"/>`),
    // the axis of the lockup, and the lines the name sits on (base line, x-height, capitals)
    `<path class="bl-g" d="M${CX} ${n(T)}V${n(B)}M${n(L)} ${BASE}H${n(Rt)}M${n(L)} ${n(BASE - SIZE * 0.5)}H${n(Rt)}M${n(L)} ${n(BASE - SIZE * 0.77)}H${n(Rt)}"/>`,
    // the two circles of the moon, the axis that joins their centres and the ring the scores are centred on
    `<circle class="bl-gc" cx="${CX}" cy="${CY}" r="${R}"/><circle class="bl-gc" cx="${n(m.bite[0])}" cy="${n(m.bite[1])}" r="${n(R * BITE)}"/><circle class="bl-gc" cx="${CX}" cy="${CY}" r="${n(R * RING)}"/>`,
    `<path class="bl-g" d="M${m.at(AXIS + 180, 1.3).map(n).join(' ')}L${m.at(AXIS, 1.62).map(n).join(' ')}${[-1, 1].map((i) => `M${CX} ${CY}L${m.at(AXIS + 180 + i * STEP, 1.3).map(n).join(' ')}`).join('')}"/>`,
    `<rect class="bl-gm" x="${n(m.light[0] - X / 2)}" y="${n(m.light[1] - X / 2)}" width="${n(X)}" height="${n(X)}"/>`,
    ...[[CX, CY], m.bite, m.light, ...m.cuts.map((c) => [(c[0] + c[2]) / 2, (c[1] + c[3]) / 2])].map(([x, y]) => `<circle class="bl-gp" cx="${n(x)}" cy="${n(y)}" r="2.2"/>`),
  ].join('');
  const secondary = mark(53, 42, 32) + txt(99, 51, t.name, 46) + txt(100.5, 73, t.tag, 12, { ft: true, w: 600, len: 157 });
  const submark = mark(50, 50, 41, { ink: 'currentColor', acc: true });

  // ---- patterns: the score, the night the dough grows through, the wheat ----
  const p1 = `<rect width="120" height="120" fill="${DOUGH}"/>` + [[30, 30, 26], [90, 30, -26], [30, 90, -26], [90, 90, 26]].map(([x, y, d]) => scores(x, y, 24, 5.4, 12, d, CRUST)).join('');
  const p2 = `<rect width="120" height="120" fill="${NIGHT}"/>` + phases(15, 30, 9.5, 30, DOUGH, OVEN)
    + [0.75, 1, 0.25, 0.5].map((f, i) => phase(15 + i * 30, 90, 9.5, f, f === 1 ? OVEN : DOUGH)).join('');
  const p3 = `<rect width="120" height="120" fill="${CRUST}"/>` + ear(30, 26, WHEAT, DOUGH) + ear(90, 86, WHEAT, DOUGH) + ear(90, -34, WHEAT, DOUGH)
    + [[60, 12], [0, 72], [120, 72]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${WHEAT}"/>`).join('');

  // ---- on screen ----
  const post = `<rect width="400" height="400" fill="${OVEN}"/>${mark(300, 312, 120)}`
    + txt(32, 78, t.postA, 44) + txt(32, 125, t.postB, 44) + txt(32, 172, t.postC, 44, { fill: FLOUR })
    + txt(32, 318, t.name, 30) + txt(32, 348, t.postD, 17, { ft: true, w: 600 }) + txt(32, 372, t.postE, 17, { ft: true });
  const row = (i: number, f: number) => phase(42, 152 + i * 62, 12, f, DOUGH)
    + txt(68, 148 + i * 62, t[`time${i}`], 13.5, { ft: true, w: 600, fill: WHEAT, ls: 1 }) + txt(68, 167 + i * 62, t[`step${i}`], 14.5, { ft: true, fill: DOUGH });
  const story = `<rect width="270" height="480" fill="${NIGHT}"/>${mark(40, 46, 17, { ink: DOUGH, light: OVEN })}${txt(66, 54, t.name, 24, { fill: DOUGH })}`
    + txt(24, 108, t.storyTitle, 23, { fill: DOUGH }) + dots('M42 172V348', DOUGH, 2.2, 8) + `<g>${[0.25, 0.5, 0.75].map((f, i) => `<circle cx="42" cy="${152 + i * 62}" r="17" fill="${NIGHT}"/>` + row(i, f)).join('')}</g>`
    + `<circle cx="135" cy="508" r="150" fill="${OVEN}"/>${scores(135, 378, 20, 4.4, 15, 116, NIGHT)}`
    + txt(135, 432, t.time3, 34, { anchor: 'middle' }) + txt(135, 458, t.step3, 15, { ft: true, w: 600, anchor: 'middle' });

  // ---- on the street: the street asleep and one window lit ----
  const houses: [number, number, number, boolean][] = [[0, 30, 34, false], [30, 26, 48, true], [56, 34, 30, false], [90, 24, 54, true], [114, 30, 38, false], [182, 28, 50, true], [210, 34, 32, false], [244, 26, 44, true], [270, 30, 36, false]];
  const G = 362; // the ground line
  const street = houses.map(([x, w, h, gable]) => `<path fill="${DOUGH}" fill-opacity="0.13" d="M${x} ${G}V${G - h}${gable ? `l${w / 2} -12l${w / 2} 12` : `h${w}`}V${G}Z"/>`
    + [0, 1].map((k) => `<rect x="${x + w / 2 - 9 + k * 11}" y="${G - h + 9}" width="6" height="8" rx="1" fill="${NIGHT}"/>`).join('')).join('')
    // the bakery: an oven mouth with its light on, and the first bread in the air
    + `<path fill="${DOUGH}" fill-opacity="0.24" d="M144 ${G}V${G - 46}h38V${G}Z"/><rect x="170" y="${G - 58}" width="7" height="12" fill="${DOUGH}" fill-opacity="0.24"/>`
    + `<path fill="${OVEN}" d="M152 ${G}v-16a11 11 0 0 1 22 0v16Z"/><circle cx="163" cy="${G - 36}" r="3.4" fill="${FLOUR}"/>`
    + [[173.5, G - 66, 2.6], [177, G - 76, 2.1], [174, G - 85, 1.6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${DOUGH}" fill-opacity="0.5"/>`).join('')
    + `<path d="M0 ${G}H300" stroke="${DOUGH}" stroke-opacity="0.4" stroke-width="1.5"/>`;
  const poster = `<rect width="300" height="400" fill="${NIGHT}"/>${mark(150, 112, 82, { ink: DOUGH, light: OVEN })}`
    + txt(150, 244, t.posterA, 27, { fill: DOUGH, anchor: 'middle' })
    + `<text class="bl-fd" x="150" y="277" font-size="27" font-weight="400" fill="${DOUGH}" text-anchor="middle">${t.posterB} <tspan fill="${OVEN}">${t.posterC}</tspan></text>`
    + street + txt(20, 388, t.name, 18, { fill: DOUGH }) + txt(280, 387, t.posterD, 14, { ft: true, fill: DOUGH, anchor: 'end' });
  // a hang tag in the shape of an oven mouth
  const [PW, PH] = [200, 270], UP = 22;
  const print = `<path d="M100 ${UP + 26}C92 ${UP + 4} 110 14 104 -4M100 ${UP + 26}C108 ${UP + 6} 95 14 98 -4" fill="none" stroke="${CRUST}" stroke-width="1.8" stroke-linecap="round"/><g transform="translate(0 ${UP})">`
    + `<path fill-rule="evenodd" fill="${FLOUR}" d="M0 ${PH}V${PW / 2 + 8}A${PW / 2} ${PW / 2} 0 0 1 ${PW} ${PW / 2 + 8}V${PH}ZM100 20a7 7 0 1 0 0.01 0Z"/>`
    + `<path d="M0 ${PH - 30}H${PW}V${PH}H0Z" fill="${OVEN}"/>` + dots(`M9 ${PH - 38}V${PW / 2 + 8}A91 91 0 0 1 191 ${PW / 2 + 8}V${PH - 38}`, CRUST, 1.6, 5)
    + mark(100, 76, 30) + txt(100, 143, t.name, 30, { anchor: 'middle' }) + dots('M52 157H150', CRUST, 2, 7)
    + txt(100, 182, t.tagKind, 19, { anchor: 'middle' }) + txt(101, 200, t.tagA, 11, { ft: true, w: 600, fill: CRUST, anchor: 'middle', ls: 2 })
    + txt(100, 222, t.tagB, 11.5, { ft: true, anchor: 'middle' }) + txt(100, PH - 10.5, t.tagC, 11.5, { ft: true, w: 600, anchor: 'middle' }) + '</g>';

  // ---- in 3D: the bread box, scored on top like a loaf ----
  const [W, H, D] = [220, 140, 124];
  const side = `<rect width="${D}" height="${H}" fill="${DOUGH}"/>${txt(D / 2, 44, t.boxSide, 17, { anchor: 'middle' })}${dots(`M16 62H${D - 14}`, CRUST, 2.2, 6.6)}`
    + phases(D / 2 - 39, 90, 10, 26, NIGHT, OVEN) + dots(`M16 118H${D - 14}`, CRUST, 2.2, 6.6);
  return {
    logo: { main: { box: [0, 0, LW, LH], svg: main }, grid, secondary: { box: [0, 0, 280, 84], svg: secondary }, submark: { box: [0, 0, 100, 100], svg: submark } },
    patterns: [{ box: [0, 0, 120, 120], svg: p1 }, { box: [0, 0, 120, 120], svg: p2 }, { box: [0, 0, 120, 120], svg: p3 }],
    digital: { post: { box: [0, 0, 400, 400], svg: post }, story: { box: [0, 0, 270, 480], svg: story } },
    physical: { poster: { box: [0, 0, 300, 400], svg: poster }, print: { box: [0, 0, PW, PH + UP], svg: print } },
    object: {
      kind: 'box', size: [W, H, D],
      faces: {
        front: `<rect width="${W}" height="${H}" fill="${OVEN}"/>${mark(W / 2, 52, 40)}${txt(W / 2, 126, t.name, 31, { anchor: 'middle' })}`,
        back: `<rect width="${W}" height="${H}" fill="${OVEN}"/>${txt(W / 2, 50, `${t.postA} ${t.postB}`, 22, { anchor: 'middle' })}${txt(W / 2, 78, t.postC, 22, { fill: FLOUR, anchor: 'middle' })}${phases(W / 2 - 39, 108, 9, 26, NIGHT, FLOUR)}`,
        left: side, right: side,
        top: `<rect width="${W}" height="${D}" fill="${DOUGH}"/>${scores(W / 2, 46, 46, 8.5, 20, 26, CRUST)}${txt(W / 2, 106, t.tag, 16, { ft: true, w: 600, anchor: 'middle', len: 184 })}`,
        bottom: `<rect width="${W}" height="${D}" fill="${CRUST}"/>`,
      },
    },
  };
}

export const BRAND: BrandSpec = {
  id: 'sereno', kind: 'exercise',
  skin: {
    main: { bg: OVEN, ink: NIGHT, muted: NIGHT, accent: FLOUR, line: '#b25d36' },
    alt: { bg: NIGHT, ink: DOUGH, muted: '#c4b9a2', accent: OVEN, line: '#3a4159' },
    onAccent: NIGHT, radius: '22px', rule: '2px dotted',
    heading: { weight: 400, transform: 'none', tracking: '-0.01em', style: 'normal' },
  },
  palette: [
    { key: 'oven', hex: OVEN, share: 36 }, { key: 'night', hex: NIGHT, share: 30 }, { key: 'dough', hex: DOUGH, share: 16 },
    { key: 'flour', hex: FLOUR, share: 8 }, { key: 'crust', hex: CRUST, share: 6 }, { key: 'wheat', hex: WHEAT, share: 4 },
  ],
  type: {
    display: { name: 'Young Serif', stack: "'bl-youngserif', serif", weights: [400] },
    text: { name: 'Work Sans', stack: "'bl-worksans', sans-serif", weights: [400, 500, 600] },
  },
  origin: { logo: 'lab', grid: 'lab', palette: 'lab', type: 'lab', patterns: 'lab', pieces: 'lab', object: 'lab' },
  art,
};
