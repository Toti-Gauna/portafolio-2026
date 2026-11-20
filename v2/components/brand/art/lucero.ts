import type { BrandArt, BrandSpec } from '../types';

/**
 * Lucero — a fictional bodegón, the brand of the product demo in the `foody` repo. From the repo: the name set in
 * Instrument Serif regular, cream on a warm night, wine and lamp amber, Geist for text, the «Demo» pill and the
 * notebook of the comanda. Drawn for the board: the lucero (a four-point star, the first light of the evening) and
 * the idea that ties everything together — a line of the menu whose dotted leader ends in the star.
 * Gus, the waiter of the demo, is not here: his design is a reference still to be approved.
 */
const WINE = '#b23a52', NIGHT = '#1a1113', CREAM = '#f3e6d0', AMBER = '#f5b942', COPPER = '#d9783a', PAPER = '#f6edda';

const n = (v: number) => Math.round(v * 100) / 100;

/** Advance widths (1/100 em: a character and two digits) read from the font files — Instrument Serif regular and
 *  italic, Geist 500 — so a leader can stop where the words start, in both languages. */
const table = (s: string) => { const m: Record<string, number> = {}; for (let k = 0; k < s.length; k += 3) m[s[k]] = Number(s.slice(k + 1, k + 3)); return m; };
const ADV = {
  r: table('a40b44c34d46e36f29g40h47i22j22k45l22m70n47ñ47o41p44q44r32s31t26u45v39w60x39y40z35á40é36í22ó41ú45A46B48C48D53E45F41G52H55I25J25K50L41M67N54O54P47Q54R51S41T46U54V46W65X55Y48Z43046125240337439538640736843940 17.21,22:21;22·11×53$42-43—72’17'),
  i: table('a47b43c35d47e35f27g40h48i29j27k45l24m75n52ñ52o41p45q43r37s30t27u51v41w61x45y42z39á47é35í29ó41ú51A46B48C48D54E45F41G51H55I25J25K50L41M67N54O54P47Q54R53S42T46U54V46W65X55Y48Z43046125240337439539641737844941 17.22,22:30;30·10×53$42-43—72’17'),
  g: table('a57b61c56d61e58f41g61h59i26j28k61l28m89n59ñ59o59p61q61r39s54t41u59v56w83x61y55z55á57é58í26ó59ú59A69B69C71D70E61F60G71H72I28J61K66L58M89N75O75P66Q75R68S65T57U69V69W97X63Y59Z56067141263363463564660753862961 24.21,21:30;30·21×52$64-42—91’22'),
};
/** r = Instrument Serif, i = its italic, g = Geist */
type Face = keyof typeof ADV;
const wd = (s: string, size: number, f: Face = 'r', ls = 0) => ([...s].reduce((a, c) => a + (ADV[f][c] ?? ADV[f][c.normalize('NFD')[0]] ?? 55), 0) / 100) * size + ls * s.length;

type T = { f?: Face; fill?: string; w?: number; anchor?: 'middle' | 'end'; ls?: number; op?: number; cls?: string; more?: string };
const txt = (x: number, y: number, s: string, size: number, o: T = {}) => {
  const f = o.f ?? 'r';
  return `<text class="${f === 'g' ? 'bl-ft' : 'bl-fd'}${o.cls ? ` ${o.cls}` : ''}" x="${n(x)}" y="${n(y)}" font-size="${n(size)}" font-weight="${f === 'g' ? o.w ?? 500 : 400}" font-style="${f === 'i' ? 'italic' : 'normal'}" fill="${o.fill ?? CREAM}"`
    + `${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.op ? ` fill-opacity="${o.op}"` : ''}${o.more ?? ''}>${s}</text>`;
};

/** The lucero: a four-point star in a circle of radius R; its inner corners sit on the diagonals, at 0.26 R. */
const star = (cx: number, cy: number, R: number, attrs = `fill="${AMBER}"`) => {
  const k = n(R * 0.26), a = n(R - k);
  return `<path ${attrs} d="M${n(cx)} ${n(cy - R)}l${k} ${a}L${n(cx + R)} ${n(cy)}l${-a} ${k}L${n(cx)} ${n(cy + R)}l${-k} ${-a}L${n(cx - R)} ${n(cy)}l${a} ${-k}z"/>`;
};

type D = { pitch?: number; r?: number; fill?: string; op?: number; each?: (k: number) => string };
/** The leader of the menu: dots on a fixed pitch, from x1 up to x2. */
const dots = (x1: number, x2: number, y: number, o: D = {}) => {
  let s = '';
  for (let x = x1, k = 0; x <= x2 + 0.01; x += o.pitch ?? 8, k++) s += `<circle cx="${n(x)}" cy="${n(y)}" r="${o.r ?? 1.3}"${o.each?.(k) ?? ''}/>`;
  return `<g fill="${o.fill ?? CREAM}"${o.op ? ` fill-opacity="${o.op}"` : ''}>${s}</g>`;
};
/** Where a leader starts and ends between two texts, snapped to its pitch (counted from x1). */
const span = (x1: number, x2: number, left: number, right: number, pitch: number, gap: number): [number, number] =>
  [x1 + Math.ceil((left + gap) / pitch) * pitch, x1 + Math.floor((x2 - x1 - right - gap) / pitch) * pitch];
/** A line of the menu: a name, its leader and what it leads to. */
const row = (x1: number, x2: number, y: number, a: [string, number, T], b: [string, number, T], d: D & { gap?: number } = {}) => {
  const [first, last] = span(x1, x2, wd(a[0], a[1], a[2].f, a[2].ls), wd(b[0], b[1], b[2].f, b[2].ls), d.pitch ?? 8, d.gap ?? 7);
  return txt(x1, y, a[0], a[1], a[2]) + dots(first, last, y - 2, d) + txt(x2, y, b[0], b[1], { ...b[2], anchor: 'end' });
};
/** The name with its lucero: the star is two modules wide (module = cap height − x-height = 0.21 em), its centre
 *  on the cap line. `x` is the left edge of the L; returns the drawing and its width. */
const word = (x: number, base: number, size: number, name: string, o: { ink?: string; star?: string } = {}) => {
  const m = 0.21 * size, sx = x + (2.262 - 0.019) * size + m * 0.32 + m;
  return { svg: txt(x - 0.019 * size, base, name, size, { fill: o.ink ?? CREAM }) + star(sx, base - 0.72 * size, m, `fill="${o.star ?? AMBER}"`), w: sx + m - x };
};
/** The seal: the submark as a stamp (a ring, the L and the lucero). */
const seal = (cx: number, cy: number, r: number, initial: string, o: { ink?: string; star?: string; w?: number } = {}) => {
  const s = r / 44, ink = o.ink ?? CREAM;
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="none" stroke="${ink}" stroke-width="${o.w ?? n(3 * s)}"/>`
    + txt(cx - 5 * s, cy + 23 * s, initial, 64 * s, { fill: ink, anchor: 'middle' }) + star(cx + 21 * s, cy - 19 * s, 12 * s, `fill="${o.star ?? AMBER}"`);
};

function art(t: Record<string, string>): BrandArt {
  // ---- the main logo: the name (as the repo sets it), its lucero and a line of the menu ----
  const F = 400 / 3, M = 28, W = 420, H = 228, L0 = M, R0 = W - M; // module = cap height − x-height = 0.21 em
  const BASE = 152, CAP = BASE - 0.72 * F, XH = BASE - 0.51 * F, SX = R0 - M, LINE = 194; // star centre: (SX, CAP)
  const i = (k: number) => ` style="--i:${n(k)}"`;
  const [d0, d1] = span(L0, R0, wd(t.kind, 24, 'i'), wd(t.night, 24, 'i'), M / 2, 9);
  const count = Math.round((d1 - d0) / (M / 2)) + 1;
  const main = txt(L0 - 0.019 * F, BASE, t.name, F, { cls: 'bl-fill', more: i(0) })
    + txt(L0 - 0.8, LINE, t.kind, 24, { f: 'i', cls: 'bl-fill', more: i(3) })
    + dots(d0, d1, LINE - 2.5, { pitch: M / 2, r: 2, each: (k) => ` class="bl-fill" style="--i:${n(4 + k * 0.4)}"` })
    + txt(R0, LINE, t.night, 24, { f: 'i', anchor: 'end', cls: 'bl-fill', more: i(4 + count * 0.4) })
    + star(SX, CAP, M - 3, `class="bl-draw" style="--i:${n(5 + count * 0.4)}" fill="none" stroke="${AMBER}" stroke-width="2" stroke-linejoin="round"`)
    + star(SX, CAP, M, `class="bl-fill" style="--i:${n(9 + count * 0.4)}" fill="${AMBER}"`);
  const mid = d0 + Math.floor(count / 2) * (M / 2), IN = M * 0.26 * Math.SQRT2;
  const grid = [
    // clear space: one module on every side
    `<rect class="bl-gm" x="0" y="0" width="${M}" height="${M}"/><rect class="bl-gm" x="${R0}" y="${H - M}" width="${M}" height="${M}"/>`,
    `<rect class="bl-g" x="${L0}" y="${M}" width="${R0 - L0}" height="${H - 2 * M}"/>`,
    // the lines of the type: cap height, x-height and base line; the band between the first two is the module
    `<path class="bl-g" d="M6 ${n(CAP)}H${W - 6}M6 ${n(XH)}H${W - 6}M6 ${BASE}H${W - 6}"/>`,
    `<rect class="bl-gm" x="${L0 + 3 * M}" y="${n(CAP)}" width="${M}" height="${M}"/>`,
    // the lucero: a square of two modules, its diagonals and two circles; its centre is on the cap line
    `<rect class="bl-g" x="${SX - M}" y="${n(CAP - M)}" width="${2 * M}" height="${2 * M}"/>`,
    `<path class="bl-g" d="M${SX - M} ${n(CAP - M)}L${SX + M} ${n(CAP + M)}M${SX + M} ${n(CAP - M)}L${SX - M} ${n(CAP + M)}M${SX} 6V${n(XH + M / 2)}"/>`,
    `<circle class="bl-gc" cx="${SX}" cy="${n(CAP)}" r="${M}"/><circle class="bl-gc" cx="${SX}" cy="${n(CAP)}" r="${n(IN)}"/>`,
    [[0, 0], [0, -M], [M, 0], [0, M], [-M, 0]].map(([x, y]) => `<circle class="bl-gp" cx="${SX + x}" cy="${n(CAP + y)}" r="2.2"/>`).join(''),
    // the leader: a dot every half module, counted from the left edge
    [-1, 0, 1].map((k) => `<rect class="bl-gm" x="${n(mid + k * (M / 2) - M / 4)}" y="${n(LINE - 2.5 - M / 4)}" width="${M / 2}" height="${M / 2}"/>`).join(''),
  ].join('');

  // ---- the reduced version: the name, its lucero and the «Demo» pill, as on the bar of the demo ----
  const sw = word(0, 0, 54, t.name), pw = wd(t.demo, 12, 'g', 1.4) + 18, sx0 = (280 - (sw.w + 12 + pw)) / 2;
  const secondary = word(sx0, 64, 54, t.name).svg
    + `<rect x="${n(sx0 + sw.w + 12)}" y="39" width="${n(pw)}" height="22" rx="11" fill="${CREAM}"/>`
    + txt(sx0 + sw.w + 12 + pw / 2 + 0.7, 54.3, t.demo, 12, { f: 'g', w: 600, fill: NIGHT, anchor: 'middle', ls: 1.4 });

  // ---- the submark: a ring, the L and the lucero (drawn for the board: the repo has no symbol) ----
  const submark = `<circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" stroke-width="3"/>`
    + txt(45, 73, t.initial, 64, { fill: 'currentColor', anchor: 'middle' }) + star(71, 31, 12, 'class="bl-acc" fill="currentColor"');

  // ---- patterns ----
  const mod = (x: number) => ((x % 120) + 120) % 120;
  /** a line of the comanda: a tick, its leader and the lucero (x wraps inside the tile) */
  const note = (y: number, x: number) => `<path d="M${mod(x + 10)} ${y - 6}l4 4 7-10" fill="none" stroke="${WINE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<g fill="${NIGHT}" fill-opacity=".7">${Array.from({ length: 8 }, (_, k) => `<circle cx="${mod(x + 32 + k * 8)}" cy="${y - 3}" r="1.3"/>`).join('')}</g>` + star(mod(x + 104), y - 7, 6.5, `fill="${WINE}"`);
  const notebook = `<rect width="120" height="120" fill="${PAPER}"/>`
    + `<path d="${Array.from({ length: 10 }, (_, k) => `M0 ${6 + k * 12}H120`).join('')}" stroke="${NIGHT}" stroke-opacity=".16"/>` + note(30, 0) + note(90, 60);
  const STARS = [15, 75, 45, 105];
  const sky = `<rect width="120" height="120" fill="${NIGHT}"/>` + STARS.map((sx, r) => {
    const y = 15 + r * 30;
    return `<g fill="${CREAM}" fill-opacity=".6">${Array.from({ length: 12 }, (_, k) => 5 + k * 10).filter((x) => Math.abs(x - sx) > 9).map((x) => `<circle cx="${x}" cy="${y}" r="1.4"/>`).join('')}</g>` + star(sx, y, 6.5);
  }).join('');
  const seals = `<rect width="120" height="120" fill="${WINE}"/>` + seal(30, 30, 20, t.initial, { w: 1.5 }) + seal(90, 90, 20, t.initial, { w: 1.5 }) + star(90, 30, 7) + star(30, 90, 7)
    + `<g fill="${CREAM}">${[[0, 0], [120, 0], [0, 120], [120, 120], [60, 60], [60, 0], [60, 120], [0, 60], [120, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6"/>`).join('')}</g>`;

  // ---- on screen: tonight's menu (a post) and the order on its way (a story) ----
  const pm = word(34, 56, 36, t.name, { ink: NIGHT, star: WINE });
  const post = `<rect width="400" height="400" fill="${PAPER}"/><rect x="13.5" y="13.5" width="373" height="373" fill="none" stroke="${NIGHT}" stroke-opacity=".5"/>`
    + pm.svg + txt(366, 54, t.sample, 17, { f: 'g', fill: NIGHT, anchor: 'end', op: 0.78 })
    + dots(34, 366, 76, { pitch: 8, r: 1.2, fill: NIGHT, op: 0.6 })
    + txt(32, 134, t.postA, 58, { f: 'i', fill: WINE }) + txt(32, 194, t.postB, 58, { f: 'i', fill: NIGHT })
    + [1, 2, 3, 4].map((k) => row(34, 366, 206 + k * 38, [t[`dish${k}`], 25, { fill: NIGHT }], [t[`price${k}`], 18, { f: 'g', fill: NIGHT }], { fill: NIGHT, op: 0.7, r: 1.3 })).join('');

  const step = (k: number, y: number) => txt(76, y + 8, t[`step${k}`], 27) + txt(76, y + 27, t[`step${k}b`], 13.5, { f: 'g', w: 400 });
  const sm = word(28, 62, 32, t.name), dw = wd(t.demo, 13, 'g', 1.5) + 18;
  const story = `<rect width="270" height="480" fill="${WINE}"/>` + sm.svg
    + `<rect x="${n(242 - dw)}" y="39" width="${n(dw)}" height="23" rx="11.5" fill="${CREAM}"/>` + txt(242 - dw / 2 + 0.75, 55.2, t.demo, 13, { f: 'g', w: 600, fill: NIGHT, anchor: 'middle', ls: 1.5 })
    + txt(27, 136, t.storyA, 46, { f: 'i' }) + txt(27, 180, t.storyB, 46, { f: 'i', fill: AMBER })
    + `<g fill="${CREAM}">${Array.from({ length: 11 }, (_, k) => 252 + k * 10).filter((y) => Math.abs(y - 302) > 12).map((y) => `<circle cx="46" cy="${y}" r="1.7"/>`).join('')}</g>`
    + `<circle cx="46" cy="238" r="7.5" fill="${CREAM}"/><circle cx="46" cy="302" r="7.5" fill="${CREAM}"/>` + star(46, 366, 15)
    + step(1, 238) + step(2, 302) + step(3, 366)
    + `<rect x="28" y="412" width="214" height="46" rx="3" fill="${AMBER}"/>` + txt(135, 440.5, t.cta, 16, { f: 'g', w: 600, fill: NIGHT, anchor: 'middle' });

  // ---- on the street: the poster (the leader climbs to the lucero) and the ticket of table 4 ----
  const arc = Array.from({ length: 19 }, (_, k) => { const u = k / 19, x = (1 - u) ** 2 * -4 + 2 * u * (1 - u) * 150 + u * u * 214, y = (1 - u) ** 2 * 180 + 2 * u * (1 - u) * 172 + u * u * 96; return `<circle cx="${n(x)}" cy="${n(y)}" r="1.9"/>`; }).join('');
  const wm = word(24, 380, 34, t.name);
  const poster = `<defs><radialGradient id="bl-lucero-glow"><stop offset="0" stop-color="${AMBER}" stop-opacity=".34"/><stop offset="1" stop-color="${AMBER}" stop-opacity="0"/></radialGradient></defs>`
    + `<rect width="300" height="400" fill="${NIGHT}"/><circle cx="226" cy="82" r="92" fill="url(#bl-lucero-glow)"/><g fill="${CREAM}">${arc}</g>` + star(226, 82, 42)
    + txt(22, 232, t.posterA, 50, { f: 'i' }) + txt(22, 278, t.posterB, 50, { f: 'i' }) + txt(22, 324, t.posterC, 50, { f: 'i', fill: AMBER })
    + `<rect y="344" width="300" height="56" fill="${WINE}"/>` + wm.svg
    + txt(278, 368, t.days, 14, { f: 'g', anchor: 'end' }) + txt(278, 386, t.hours, 14, { f: 'g', anchor: 'end' });

  const teeth = Array.from({ length: 24 }, () => 'l-5 -7l-5 7').join('');
  const tick = (x: number, y: number) => `<path d="M${x} ${y - 4}l4 4 7-10" fill="none" stroke="${WINE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  const item = (k: number, y: number) => txt(20, y, t[`qty${k}`], 21, { f: 'i', fill: WINE })
    + (() => { const [a, b] = span(40, 205, wd(t[`item${k}`], 12.5, 'g'), 0, 6, 5); return txt(40, y, t[`item${k}`], 12.5, { f: 'g', fill: NIGHT }) + dots(a, b, y - 2, { pitch: 6, r: 1, fill: NIGHT, op: 0.6 }); })() + tick(210, y - 3);
  const tw = word(0, 0, 36, t.name), tx = (240 - tw.w) / 2;
  const print = `<path d="M0 0H240V330${teeth}z" fill="${PAPER}"/>`
    + word(tx, 46, 36, t.name, { ink: NIGHT, star: WINE }).svg + txt(121, 67, t.ticket, 11, { f: 'g', w: 600, fill: WINE, anchor: 'middle', ls: 2.2 })
    + dots(20, 220, 82, { pitch: 5, r: 0.9, fill: NIGHT, op: 0.6 })
    + txt(19, 126, t.table, 42, { f: 'i', fill: NIGHT }) + txt(220, 108, t.covers, 12, { f: 'g', fill: NIGHT, anchor: 'end' }) + txt(220, 125, t.time, 12, { f: 'g', fill: NIGHT, anchor: 'end' })
    + dots(20, 220, 142, { pitch: 5, r: 0.9, fill: NIGHT, op: 0.6 })
    + item(1, 172) + item(2, 200) + item(3, 228)
    + dots(20, 220, 246, { pitch: 5, r: 0.9, fill: NIGHT, op: 0.6 })
    + txt(20, 280, t.thanksA, 23, { f: 'i', fill: NIGHT }) + txt(20, 304, t.thanksB, 23, { f: 'i', fill: NIGHT })
    + `<g transform="rotate(-12 190 284)">${seal(190, 284, 26, t.initial, { ink: WINE, star: WINE, w: 1.8 })}</g>`;

  // ---- in 3D: the matchbox of the house (the first light of the table) ----
  const [BW, BH, BD] = [220, 140, 58], K = 1.07; // drawn at 220 × 140 × 58, shown 7 % larger
  const face = (svg: string) => `<g transform="scale(${K})">${svg}</g>`;
  const fw = word(0, 0, 60, t.name), fx = (BW - fw.w) / 2;
  const front = `<rect width="${BW}" height="${BH}" fill="${WINE}"/><rect x="6.5" y="6.5" width="${BW - 13}" height="${BH - 13}" fill="none" stroke="${CREAM}" stroke-width="1.2"/>`
    + txt(BW / 2, 33, t.matches, 17, { f: 'i', anchor: 'middle' }) + word(fx, 93, 60, t.name).svg
    + row(18, BW - 18, 123, [t.kind, 17, { f: 'i' }], [t.night, 17, { f: 'i' }], { pitch: 7, r: 1.2 });
  const back = `<rect width="${BW}" height="${BH}" fill="${NIGHT}"/><rect x="6.5" y="6.5" width="${BW - 13}" height="${BH - 13}" fill="none" stroke="${CREAM}" stroke-opacity=".4" stroke-width="1.2"/>`
    + txt(20, 56, t.backA, 28, { f: 'i' }) + txt(20, 87, t.backB, 28, { f: 'i' })
    + dots(22, 178, 116, { pitch: 7, r: 1.2 }) + star(193, 115, 8) + seal(178, 42, 21, t.initial, { w: 1.5 });
  const striker = `<rect width="${BW}" height="${BD}" fill="${WINE}"/><rect x="12" y="12" width="${BW - 24}" height="${BD - 24}" rx="2" fill="${NIGHT}"/>`
    + `<g fill="${COPPER}" fill-opacity=".85">${Array.from({ length: 5 }, (_, r) => Array.from({ length: 32 }, (_, c) => `<circle cx="${n(17 + c * 6 + (r % 2) * 3)}" cy="${17 + r * 6}" r="0.9"/>`).join('')).join('')}</g>`;
  const end = `<rect width="${BD}" height="${BH}" fill="${WINE}"/><rect x="5" y="5" width="${BD - 10}" height="${BH - 10}" fill="${PAPER}"/><rect x="5" y="5" width="${BD - 10}" height="6" fill="${NIGHT}" fill-opacity=".14"/>` + star(BD / 2, BH / 2, 9, `fill="${WINE}"`);

  return {
    logo: { main: { box: [0, 0, W, H], svg: main }, grid, secondary: { box: [0, 0, 280, 84], svg: secondary }, submark: { box: [0, 0, 100, 100], svg: submark } },
    patterns: [{ box: [0, 0, 120, 120], svg: notebook }, { box: [0, 0, 120, 120], svg: sky }, { box: [0, 0, 120, 120], svg: seals }],
    digital: { post: { box: [0, 0, 400, 400], svg: post }, story: { box: [0, 0, 270, 480], svg: story } },
    physical: { poster: { box: [0, 0, 300, 400], svg: poster }, print: { box: [0, 0, 240, 330], svg: print } },
    object: { kind: 'box', size: [n(BW * K), n(BH * K), n(BD * K)], faces: { front: face(front), back: face(back), left: face(end), right: face(end), top: face(striker), bottom: face(striker) } },
  };
}

export const BRAND: BrandSpec = {
  id: 'lucero', kind: 'exercise',
  skin: {
    main: { bg: WINE, ink: CREAM, muted: PAPER, accent: AMBER, line: '#c26370' },
    alt: { bg: NIGHT, ink: CREAM, muted: '#cdb9a0', accent: AMBER, line: '#3a2a2d' },
    onAccent: NIGHT, radius: '3px', rule: '2px dotted',
    heading: { weight: 400, transform: 'none', tracking: '-0.01em', style: 'italic' },
  },
  palette: [
    { key: 'wine', hex: WINE, share: 34 }, { key: 'night', hex: NIGHT, share: 30 }, { key: 'cream', hex: CREAM, share: 18 },
    { key: 'notebook', hex: PAPER, share: 8 }, { key: 'amber', hex: AMBER, share: 6 }, { key: 'copper', hex: COPPER, share: 4 },
  ],
  type: {
    display: { name: 'Instrument Serif', stack: "'bl-instrument', serif", weights: [400], italic: true },
    text: { name: 'Geist', stack: "'bl-geist', sans-serif", weights: [400, 500, 600] },
  },
  origin: { logo: 'repo', grid: 'lab', palette: 'repo', type: 'repo', patterns: 'lab', pieces: 'lab', object: 'lab' },
  art,
};
