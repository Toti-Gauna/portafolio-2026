import type { BrandArt, BrandSpec } from '../types';

/**
 * Eclipse — Ignacio's software studio. Its art direction is «Efemérides», an observatory: the visitor watches their
 * business come out of the shadow, and amber is the only source of light. Colours, type and the two marks are the
 * repo's (Eclipse-Web: app/globals.css, components/layout/MiniEclipse.tsx, components/ui/PhaseGlyph.tsx, the loader's
 * stacked eclipse + wordmark). The instrument (hairlines, rulers, a dial with its pointer at 45°) is its language.
 */
const VOID = '#05050a', NIGHT = '#0c0c14', CORONA = '#f5b942', FLARE = '#ffe8b0', DAWN = '#f4efe6', INK = '#111114';
const MIST = '#9a97a6', DEEP = '#8a5a00', MISTINK = '#5b5866', GLINT = '#fff8e6';
const n = (v: number) => Math.round(v * 100) / 100;
const D45 = Math.SQRT1_2;
/** a fixed «random» (no Math.random: the drawing is the same on every build) */
const hash = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

type TextOpt = { fill?: string; w?: number; cls?: 'bl-fd' | 'bl-ft'; anchor?: 'middle' | 'end'; ls?: number; it?: boolean; extra?: string };
/** Instrument Serif by default (headings are set tight, −0.02em); `cls: 'bl-ft'` is Geist. */
const txt = (x: number, y: number, s: string, size: number, o: TextOpt = {}) =>
  `<text class="${o.cls ?? 'bl-fd'}" x="${n(x)}" y="${n(y)}" font-size="${size}" font-weight="${o.w ?? 400}" fill="${o.fill ?? DAWN}"`
  + `${o.it ? ' font-style="italic"' : ''}${o.anchor ? ` text-anchor="${o.anchor}"` : ''} letter-spacing="${n(o.ls ?? (o.cls === 'bl-ft' ? 0 : -0.02 * size))}"${o.extra ?? ''}>${s}</text>`;
/** the one italic amber word of a heading */
const lit = (s: string, fill: string) => `<tspan font-style="italic" fill="${fill}">${s}</tspan>`;

/** Geist 500: the advance of each letter of the wordmark, in em (measured in the font file; kerning off). */
const ADV: Record<string, number> = { E: 0.609, C: 0.713, L: 0.583, I: 0.28, P: 0.657, S: 0.654 };
const adv = (c: string) => ADV[c] ?? 0.62;
const wordW = (w: string, size: number, track: number) => ([...w].reduce((s, c) => s + adv(c), 0) + ([...w].length - 1) * track) * size;
/** The wordmark: Geist 500, capitals, tracked (0.32em beside the mark, as in the header; 0.5em under it, as in the loader). */
const word = (x: number, y: number, w: string, size: number, o: { fill?: string; track?: number; mid?: boolean; extra?: string } = {}) => {
  const track = o.track ?? 0.32;
  return `<text class="bl-ft" x="${n(o.mid ? x - wordW(w, size, track) / 2 : x)}" y="${n(y)}" font-size="${size}" font-weight="500" letter-spacing="${n(track * size)}" fill="${o.fill ?? 'currentColor'}" style="font-kerning:none"${o.extra ?? ''}>${w}</text>`;
};

/** A four-point glint: two tapered blades. */
const star = (x: number, y: number, L: number, w: number, fill: string, rot = 0) =>
  `<path${rot ? ` transform="rotate(${rot} ${n(x)} ${n(y)})"` : ''} fill="${fill}" d="M${n(x - L)} ${n(y)}L${n(x)} ${n(y - w)}L${n(x + L)} ${n(y)}L${n(x)} ${n(y + w)}ZM${n(x)} ${n(y - L)}L${n(x + w)} ${n(y)}L${n(x)} ${n(y + L)}L${n(x - w)} ${n(y)}Z"/>`;
const rhombus = (x: number, y: number, r: number, fill: string) => `<path fill="${fill}" d="M${n(x)} ${n(y - r)}L${n(x + r * 0.72)} ${n(y)}L${n(x)} ${n(y + r)}L${n(x - r * 0.72)} ${n(y)}Z"/>`;

/**
 * The logo's eclipse (MiniEclipse at the top of the page: totality), in its 24-unit box around (cx, cy), s px per unit:
 * the sun's limb (r 6.5), the corona ring (r 8.6, the only amber line) and the diamond-ring glint at 45° (r 7).
 */
const mark = (cx: number, cy: number, s: number, o: { ink?: string; corona?: string; glint?: string; draw?: boolean } = {}) => {
  const ink = o.ink ?? 'currentColor', glint = o.glint ?? GLINT, gx = n(cx + 4.95 * s), gy = n(cy - 4.95 * s), a = n(3.45 * s);
  const cls = (c: string, i: number) => (o.draw ? ` class="${c}" style="--i:${i}"` : '');
  return `<circle${cls('bl-draw', 0)} cx="${cx}" cy="${cy}" r="${n(6.5 * s)}" fill="none" stroke="${ink}" stroke-opacity=".28" stroke-width="${n(0.75 * s)}"/>`
    // the corona starts drawing where the diamond ring is
    + `<circle${cls('bl-draw', 2)} cx="${cx}" cy="${cy}" r="${n(8.6 * s)}" fill="none" stroke="${o.corona ?? CORONA}" stroke-width="${n(0.9 * s)}" transform="rotate(-45 ${cx} ${cy})"/>`
    + `<g${cls('bl-fill', 7)}><circle cx="${gx}" cy="${gy}" r="${n(1.35 * s)}" fill="${glint}"/>`
    + `<path d="M${gx} ${n(gy - a)}v${n(2 * a)}M${n(gx - a)} ${gy}h${n(2 * a)}" fill="none" stroke="${glint}" stroke-width="${n(0.5 * s)}" stroke-linecap="round" opacity=".85"/></g>`;
};

/**
 * The brand's icon (PhaseGlyph): an eclipse at phase p — 0 the sun alone, 1 totality (corona ring and its bead).
 * The repo's geometry for r = 8, scaled to r.
 */
const phase = (cx: number, cy: number, r: number, p: number, o: { ink: string; ring?: string; w?: number }) => {
  const k = r / 8, w = n(o.w ?? k), d = (1 - p) * 2 * r, total = p > 0.985, ring = o.ring ?? o.ink;
  let sun = '';
  if (d >= 2 * r - 0.01) sun = `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${o.ink}"/>`;
  else if (!total) {
    const x = n(cx + d / 2), h = Math.sqrt(r * r - (d / 2) ** 2);
    sun = `<path fill="${o.ink}" d="M${x} ${n(cy - h)}A${n(r)} ${n(r)} 0 1 0 ${x} ${n(cy + h)}A${n(r)} ${n(r)} 0 0 1 ${x} ${n(cy - h)}Z"/>`;
  }
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="none" stroke="${o.ink}" stroke-opacity=".3" stroke-width="${w}"/>${sun}`
    + (total ? `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r + 2 * k)}" fill="none" stroke="${ring}" stroke-opacity="${ring === o.ink ? 0.55 : 1}" stroke-width="${w}"/><circle cx="${n(cx + (r + k) * D45)}" cy="${n(cy - (r + k) * D45)}" r="${n(1.6 * k)}" fill="${ring}"/>` : '');
};

/**
 * The eclipse of the hero and the loader, drawn: halo, corona rays, the bright limb, the moon and the diamond ring.
 * `id` prefixes its gradients (one per drawing). Proportions are the loader's (the white limb starts at the moon's edge).
 */
const eclipse = (id: string, cx: number, cy: number, R: number, o: { rays?: number; reach?: number } = {}) => {
  const N = o.rays ?? 132, reach = o.reach ?? 1.25;
  const paths = ['', '', ''];
  for (let i = 0; i < N; i++) {
    const a = ((i + hash(i) * 0.9) / N) * Math.PI * 2, h = hash(i + 53);
    // long streamers lean to the horizon, like a real corona
    const len = R * (0.2 + h * h * reach * (0.55 + 0.45 * Math.abs(Math.cos(a - 0.5))));
    const r0 = R * 1.015, r1 = R * 1.06 + len;
    paths[i % 3] += `M${n(cx + Math.cos(a) * r0)} ${n(cy + Math.sin(a) * r0)}L${n(cx + Math.cos(a) * r1)} ${n(cy + Math.sin(a) * r1)}`;
  }
  const u = R / 90, gx = n(cx + R * D45), gy = n(cy - R * D45);
  const grad = (name: string, r: number, stops: [number, string, number][], at = `cx="${cx}" cy="${cy}"`) =>
    `<radialGradient id="${id}-${name}" gradientUnits="userSpaceOnUse" ${at} r="${n(r)}">${stops.map(([off, c, op]) => `<stop offset="${off}" stop-color="${c}" stop-opacity="${op}"/>`).join('')}</radialGradient>`;
  return `<defs>`
    + grad('halo', R * 2.7, [[0.36, CORONA, 0.4], [0.6, CORONA, 0.13], [1, CORONA, 0]])
    + grad('ray', R * 2.5, [[0.4, FLARE, 0.95], [0.6, CORONA, 0.55], [1, CORONA, 0]])
    + grad('limb', R * 1.8, [[0.54, GLINT, 0], [0.562, GLINT, 1], [0.6, FLARE, 0.85], [0.72, CORONA, 0.35], [1, CORONA, 0]])
    + grad('moon', R * 1.1, [[0, '#0d0d16', 1], [0.6, '#050509', 1], [1, '#020204', 1]], `cx="${n(cx - R * 0.24)}" cy="${n(cy - R * 0.32)}"`)
    + grad('glint', R * 0.44, [[0, '#ffffff', 1], [0.09, GLINT, 0.95], [0.22, FLARE, 0.45], [0.5, FLARE, 0], [1, FLARE, 0]], `cx="${gx}" cy="${gy}"`)
    + `</defs>`
    + `<circle cx="${cx}" cy="${cy}" r="${n(R * 2.7)}" fill="url(#${id}-halo)"/>`
    + `<g fill="none" stroke="url(#${id}-ray)" stroke-linecap="round">${paths.map((d, i) => `<path stroke-width="${n([0.55, 0.9, 1.4][i] * u)}" d="${d}"/>`).join('')}</g>`
    + `<circle cx="${cx}" cy="${cy}" r="${n(R * 1.8)}" fill="url(#${id}-limb)"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${n(R)}" fill="url(#${id}-moon)"/>`
    + `<circle cx="${gx}" cy="${gy}" r="${n(R * 0.44)}" fill="url(#${id}-glint)"/>` + star(cx + R * D45, cy - R * D45, R * 0.62, R * 0.022, GLINT, 12);
};

/** Fixed stars: dawn points, each with its own brightness. */
const stars = (seed: number, w: number, h: number, count: number) =>
  Array.from({ length: count }, (_, i) => `<circle cx="${n(hash(seed + i) * w)}" cy="${n(hash(seed + i + 71) * h)}" r="${n(0.45 + hash(seed + i + 19) * 0.7)}" fill="${DAWN}" opacity="${n(0.18 + hash(seed + i + 37) * 0.5)}"/>`).join('');

/** Registration marks on the four corners of a frame (the repo's `.ticks`). */
const ticks = (x: number, y: number, w: number, h: number, len: number, stroke: string, op = 0.5) =>
  `<path fill="none" stroke="${stroke}" stroke-opacity="${op}" stroke-width="1" d="M${x} ${y + len}V${y}H${x + len}M${x + w - len} ${y}H${x + w}V${y + len}M${x + w} ${y + h - len}V${y + h}H${x + w - len}M${x + len} ${y + h}H${x}V${y + h - len}"/>`;

/** A ruler: a base line with a tick every `step`, a longer one every fifth. `dir` −1 ticks up/left, 1 down/right. */
const ruler = (x: number, y: number, len: number, step: number, o: { vertical?: boolean; dir?: 1 | -1; short?: number; long?: number; first?: number } = {}) => {
  const dir = o.dir ?? -1, short = o.short ?? 4, long = o.long ?? 9;
  let d = o.vertical ? `M${x} ${y}V${y + len}` : `M${x} ${y}H${x + len}`;
  for (let k = 0; k * step <= len + 0.01; k++) {
    const t = dir * ((k + (o.first ?? 0)) % 5 === 0 ? long : short), at = n(k * step);
    d += o.vertical ? `M${x} ${n(y + at)}h${t}` : `M${n(x + at)} ${y}v${t}`;
  }
  return d;
};

/**
 * Copy into SVG text: markup characters escaped. The contract test reads «NaN» without minding case, and Spanish has
 * it inside words («funcionando»): its middle letter is written as a character reference, which renders the same.
 */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/nan/gi, (m) => `${m[0]}&#${m.charCodeAt(1)};${m[2]}`);

function art(copy: Record<string, string>): BrandArt {
  const t = new Proxy(copy, { get: (o, k: string) => esc(String(o[k])) });
  // ---- the logo: the loader's lockup — the eclipse in its 24-unit box and the wordmark under it, tracked half an em
  const S = 9.5, CX = 240, CY = 126, BOX = 12 * S; // the 24-unit box is 228 wide
  const FS = 38, TRACK = 0.5, BASE = 290, CAP = 0.71 * FS;
  const W = wordW(t.word, FS, TRACK), X0 = CX - W / 2;
  // the glow of the 24-unit box, as rings that fade (the logo carries no gradient ids: it is on the page more than once)
  const glow = Array.from({ length: 9 }, (_, i) => `<circle cx="${CX}" cy="${CY}" r="${n((9.25 + i * 0.32) * S)}" fill="none" stroke="${CORONA}" stroke-width="${n(0.34 * S)}" opacity="${n(0.13 * (1 - i / 9) ** 1.6)}"/>`).join('');
  const main = `<g class="bl-fill" style="--i:4">${glow}</g>`
    + mark(CX, CY, S, { draw: true })
    + `<g class="bl-fill" style="--i:9">${word(X0, BASE, t.word, FS, { track: TRACK })}</g>`;
  // its construction
  let gaps = '', x = X0;
  [...t.word].forEach((c, i, all) => {
    x += adv(c) * FS;
    if (i < all.length - 1) { gaps += `<rect class="bl-gm" x="${n(x)}" y="${n(BASE - CAP)}" width="${TRACK * FS}" height="${n(CAP)}"/>`; x += TRACK * FS; }
  });
  const grid = [
    // the 24-unit box, with its ruler: one tick per unit
    `<rect class="bl-g" x="${CX - BOX}" y="${CY - BOX}" width="${2 * BOX}" height="${2 * BOX}"/>`,
    `<path class="bl-gc" d="${ruler(CX - BOX, CY + BOX, 2 * BOX, S, { dir: 1, short: 4, long: 8, first: 3 })}"/>`,
    `<path class="bl-gc" d="${ruler(CX - BOX, CY - BOX, 2 * BOX, S, { vertical: true, dir: -1, short: 4, long: 8, first: 3 })}"/>`,
    // the axes; the vertical one runs through the wordmark
    `<path class="bl-g" d="M${CX} 2V314M${CX - BOX - 22} ${CY}H${CX + BOX + 22}"/>`,
    // two concentric circles: the sun's limb and the corona
    `<circle class="bl-gc" cx="${CX}" cy="${CY}" r="${6.5 * S}"/><circle class="bl-gc" cx="${CX}" cy="${CY}" r="${n(8.6 * S)}"/>`,
    // the glint sits on the diagonal of the box, between the two
    `<path class="bl-g" d="M${CX} ${CY}L${CX + BOX} ${CY - BOX}"/><circle class="bl-gc" cx="${CX}" cy="${CY}" r="${7 * S}" stroke-dasharray="2 5"/>`,
    `<circle class="bl-gp" cx="${CX}" cy="${CY}" r="2.6"/><circle class="bl-gp" cx="${n(CX + 4.95 * S)}" cy="${n(CY - 4.95 * S)}" r="2.6"/>`,
    // the wordmark: base line, cap line and half an em between letters
    `<path class="bl-g" d="M${n(X0 - 22)} ${BASE}H${n(X0 + W + 22)}M${n(X0 - 22)} ${n(BASE - CAP)}H${n(X0 + W + 22)}M${n(X0)} ${n(BASE - CAP - 12)}V${BASE + 12}M${n(X0 + W)} ${n(BASE - CAP - 12)}V${BASE + 12}"/>`,
    gaps,
  ].join('');
  // the header's lockup: the mark beside the wordmark (0.32em)
  const secondary = mark(30, 32, 2.5) + word(82, 43.4, t.word, 32);
  // the symbol alone: the ring is the light
  const ring = (R: number, r: number) => `M${50 - R} 50a${R} ${R} 0 1 0 ${2 * R} 0a${R} ${R} 0 1 0 ${-2 * R} 0ZM${50 - r} 50a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  const submark = `<circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" stroke-opacity=".34" stroke-width="3"/>`
    + `<path class="bl-acc" fill="currentColor" fill-rule="evenodd" d="${ring(38, 33)}"/>`
    + `<circle cx="69.8" cy="30.2" r="5.6" fill="currentColor"/><path d="M69.8 16.2v28M55.8 30.2h28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`;

  // ---- patterns: the ephemeris of phases (void), the instrument's rulers (dawn), occultations in full light (corona)
  const cross = [0, 60, 120].flatMap((px) => [0, 60, 120].map((py) => `M${px - 4} ${py}h8M${px} ${py - 4}v8`)).join('');
  const p1 = `<rect width="120" height="120" fill="${VOID}"/><path d="${cross}" fill="none" stroke="${DAWN}" stroke-opacity=".34" stroke-width=".8"/>`
    + [0.25, 0.5, 0.75, 1].map((p, i) => phase(30 + (i % 2) * 60, 30 + Math.floor(i / 2) * 60, 15, p, { ink: DAWN, ring: CORONA, w: 1.2 })).join('');
  const p2 = `<rect width="120" height="120" fill="${DAWN}"/><g fill="none" stroke="${INK}" stroke-width=".9">`
    + `<path stroke-opacity=".62" d="M0 36H120${Array.from({ length: 20 }, (_, k) => `M${3 + 6 * k} 36v${k % 5 === 2 ? -12 : -5}`).join('')}"/>`
    + `<path stroke-opacity=".62" d="M0 84H120${Array.from({ length: 20 }, (_, k) => `M${3 + 6 * k} 84v${k % 5 === 0 ? 12 : 5}`).join('')}"/></g>`
    + `<path d="M3 60H120" fill="none" stroke="${MISTINK}" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="0.1 5.9"/>`
    + rhombus(45, 14, 6.5, DEEP) + phase(93, 107, 6, 1, { ink: DEEP, ring: DEEP, w: 1.1 });
  const p3 = `<rect width="120" height="120" fill="${CORONA}"/>`
    + `<circle cx="30" cy="30" r="25" fill="none" stroke="${VOID}" stroke-opacity=".3" stroke-width=".8"/><circle cx="30" cy="30" r="18" fill="${FLARE}"/><circle cx="39" cy="24" r="18" fill="${VOID}"/>`
    + `<circle cx="90" cy="90" r="25" fill="none" stroke="${VOID}" stroke-opacity=".3" stroke-width=".8"/><circle cx="90" cy="90" r="19.4" fill="${FLARE}"/><circle cx="90" cy="90" r="18" fill="${VOID}"/>${star(102.7, 77.3, 9, 1.3, GLINT)}`
    + `<circle cx="90" cy="30" r="1.7" fill="${VOID}"/><circle cx="30" cy="90" r="1.7" fill="${VOID}"/>`;

  // ---- on screen
  const post = `<rect width="400" height="400" fill="${VOID}"/>${stars(3, 400, 400, 46)}${eclipse('bl-eclipse-post', 274, 134, 84)}`
    + mark(46, 44, 1.5, { ink: DAWN }) + word(74, 50, t.word, 17, { fill: DAWN })
    + txt(30, 284, t.lightA, 60) + txt(30, 340, `${t.lightB} ${lit(t.lightC, CORONA)}`, 60)
    + `<path d="M30 360H370" stroke="${DAWN}" stroke-opacity=".18"/>` + txt(30, 382, t.eyebrow, 17, { cls: 'bl-ft', w: 500, fill: MIST });
  const rows = [t.g1, t.g2, t.g3];
  const story = `<defs><radialGradient id="bl-eclipse-story-sky" gradientUnits="userSpaceOnUse" cx="250" cy="20" r="330"><stop offset="0" stop-color="${CORONA}" stop-opacity=".2"/><stop offset="1" stop-color="${CORONA}" stop-opacity="0"/></radialGradient></defs>`
    + `<rect width="270" height="480" fill="${VOID}"/><rect width="270" height="480" fill="url(#bl-eclipse-story-sky)"/>${stars(11, 270, 480, 30)}${eclipse('bl-eclipse-story', 232, 34, 62, { rays: 96 })}`
    + mark(40, 46, 1.1, { ink: DAWN }) + word(60, 50.6, t.word, 13, { fill: DAWN })
    + `<path d="M40 150V352" stroke="${DAWN}" stroke-opacity=".2"/>`
    + rows.map((s, i) => `<circle cx="40" cy="${156 + i * 62}" r="14" fill="${VOID}"/>${phase(40, 156 + i * 62, 9, 0.25 * (i + 1), { ink: DAWN })}${txt(66, 172 + i * 62, s, 48)}`).join('')
    + `<circle cx="40" cy="342" r="15" fill="${VOID}"/>${phase(40, 342, 9, 1, { ink: DAWN, ring: CORONA })}${txt(66, 353, t.g4, 31, { it: true, fill: CORONA })}`
    + `<rect x="34" y="402" width="202" height="46" rx="23" fill="${CORONA}"/>${txt(135, 430.5, t.cta, 16, { cls: 'bl-ft', w: 600, fill: VOID, anchor: 'middle' })}`
    + `<circle cx="204" cy="402" r="2.6" fill="${GLINT}"/>${star(204, 402, 13, 1.2, GLINT)}`;

  // ---- on the street: a chart of the observatory, printed on dawn paper
  const DX = 150, DY = 150, MOON = 50;
  const dial = Array.from({ length: 180 }, (_, k) => {
    const a = (k * 2 * Math.PI) / 180, r1 = 78 + (k % 15 === 0 ? 10 : k % 5 === 0 ? 6.5 : 3.5);
    return `M${n(DX + Math.cos(a) * 78)} ${n(DY + Math.sin(a) * 78)}L${n(DX + Math.cos(a) * r1)} ${n(DY + Math.sin(a) * r1)}`;
  }).join('');
  const seats = Array.from({ length: 7 }, (_, i) => {
    const a = -Math.PI / 4 + (i * 2 * Math.PI) / 7, px = DX + Math.cos(a) * 96, py = DY + Math.sin(a) * 96;
    return i === 0 ? rhombus(px, py, 6, DEEP) : `<circle cx="${n(px)}" cy="${n(py)}" r="2.6" fill="${DAWN}" stroke="${INK}" stroke-width=".9"/>`;
  }).join('');
  const poster = `<defs><radialGradient id="bl-eclipse-poster-halo" gradientUnits="userSpaceOnUse" cx="${DX}" cy="${DY}" r="98"><stop offset=".5" stop-color="${CORONA}" stop-opacity=".7"/><stop offset=".72" stop-color="${FLARE}" stop-opacity=".5"/><stop offset="1" stop-color="${FLARE}" stop-opacity="0"/></radialGradient></defs>`
    + `<rect width="300" height="400" fill="${DAWN}"/>${ticks(10, 10, 280, 380, 8, INK)}`
    + phase(31, 29, 7, 1, { ink: DEEP }) + word(47, 34, t.word, 14, { fill: INK }) + txt(278, 34, t.totality, 14, { cls: 'bl-ft', w: 500, fill: MISTINK, anchor: 'end' })
    + `<circle cx="${DX}" cy="${DY}" r="98" fill="url(#bl-eclipse-poster-halo)"/>`
    + `<g fill="none" stroke="${INK}"><path stroke-opacity=".3" stroke-width=".8" d="M${DX - 106} ${DY}H${DX + 106}M${DX} ${DY - 106}V${DY + 106}"/>`
    + `<circle cx="${DX}" cy="${DY}" r="78" stroke-opacity=".7" stroke-width=".8"/><path stroke-opacity=".7" stroke-width=".7" d="${dial}"/><circle cx="${DX}" cy="${DY}" r="96" stroke-opacity=".3" stroke-width=".8"/></g>`
    + `<path d="M${n(DX + MOON * D45)} ${n(DY - MOON * D45)}L${n(DX + 91 * D45)} ${n(DY - 91 * D45)}" stroke="${DEEP}" stroke-width="1.2"/>${seats}`
    + `<circle cx="${DX}" cy="${DY}" r="${n((MOON * 8.6) / 6.5)}" fill="none" stroke="${DEEP}" stroke-width="1.6"/><circle cx="${DX}" cy="${DY}" r="${MOON}" fill="${INK}"/>`
    + `<circle cx="${n(DX + MOON * D45)}" cy="${n(DY - MOON * D45)}" r="4.2" fill="${CORONA}" stroke="${DEEP}" stroke-width=".8"/>${star(DX + MOON * D45, DY - MOON * D45, 15, 1.6, CORONA)}`
    + txt(22, 286, t.showA, 35, { fill: INK }) + txt(22, 320, t.showB, 35, { fill: INK }) + txt(22, 354, t.showC, 35, { fill: DEEP, it: true })
    + `<path d="M22 366H278" stroke="${INK}" stroke-opacity=".22"/>` + txt(22, 383, t.eyebrow, 14, { cls: 'bl-ft', w: 500, fill: MISTINK });

  // a project passport (the portal's five stages; «2 de 5» is the second): a ticket in solid corona
  const stages = [t.stage0, t.stage1, t.stage2, t.stage3, t.stage4], NOW = 1;
  const print = `<path fill="${CORONA}" d="M10 0H182A6 6 0 0 0 194 0H230A10 10 0 0 1 240 10V130A10 10 0 0 1 230 140H194A6 6 0 0 0 182 140H10A10 10 0 0 1 0 130V10A10 10 0 0 1 10 0Z"/>`
    + `<path d="M188 12V128" stroke="${VOID}" stroke-opacity=".55" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="0.1 4.9"/>`
    + phase(23, 21, 6, 1, { ink: VOID, w: 1 }) + word(37, 25, t.word, 11, { fill: VOID })
    + txt(15, 53, t.passport, 21, { fill: VOID })
    + stages.map((s, i) => {
      const y = 73 + i * 13.4, on = i === NOW, c = on ? CORONA : VOID;
      return (on ? `<rect x="11" y="${n(y - 9.6)}" width="168" height="13.4" rx="6.7" fill="${VOID}"/>` : '')
        + phase(21, y - 3.9, 3.6, 1 - i / 4, { ink: c, w: 0.8 }) + txt(32, y, s, 11.5, { cls: 'bl-ft', w: on ? 600 : 500, fill: c });
    }).join('')
    + txt(215, 78, t.now, 52, { fill: VOID, anchor: 'middle', ls: 0 }) + txt(215, 97, t.of, 12, { cls: 'bl-ft', w: 600, fill: VOID, anchor: 'middle' })
    + rhombus(215, 118, 5, VOID) + rhombus(215, 24, 5, VOID);

  // ---- in 3D: the welcome box (Equipment: packaging and unboxing) — a dark carton with a lid of light
  const [BW, BH, BD] = [210, 180, 96];
  const frame = (w: number, h: number) => `<rect x="8.5" y="8.5" width="${w - 17}" height="${h - 17}" fill="none" stroke="${DAWN}" stroke-opacity=".16"/>${ticks(8.5, 8.5, w - 17, h - 17, 8, DAWN, 0.6)}`;
  const side = (flip: boolean, inner: string) => {
    const rx = flip ? BD - 22 : 22;
    return `<rect width="${BD}" height="${BH}" fill="${NIGHT}"/><path fill="none" stroke="${DAWN}" stroke-opacity=".42" stroke-width=".9" d="${ruler(rx, 18, 144, 4, { vertical: true, dir: flip ? -1 : 1, short: 4, long: 9 })}"/>`
      + rhombus(rx + (flip ? 9 : -9), 58, 4.5, CORONA) + inner;
  };
  return {
    logo: { main: { box: [0, 0, 480, 320], svg: main }, grid, secondary: { box: [0, 0, 284, 64], svg: secondary }, submark: { box: [0, 0, 100, 100], svg: submark } },
    patterns: [{ box: [0, 0, 120, 120], svg: p1 }, { box: [0, 0, 120, 120], svg: p2 }, { box: [0, 0, 120, 120], svg: p3 }],
    digital: { post: { box: [0, 0, 400, 400], svg: post }, story: { box: [0, 0, 270, 480], svg: story } },
    physical: { poster: { box: [0, 0, 300, 400], svg: poster }, print: { box: [0, 0, 240, 140], svg: print } },
    object: {
      kind: 'box', size: [BW, BH, BD],
      faces: {
        front: `<rect width="${BW}" height="${BH}" fill="${VOID}"/>${stars(23, BW, BH, 16)}${eclipse('bl-eclipse-box', 105, 76, 34, { rays: 90, reach: 1.05 })}${frame(BW, BH)}${word(105, 157, t.word, 17, { fill: DAWN, track: 0.5, mid: true })}`,
        back: `<rect width="${BW}" height="${BH}" fill="${NIGHT}"/>${frame(BW, BH)}${txt(105, 74, t.madeA, 27, { anchor: 'middle' })}${txt(105, 104, t.madeB, 27, { anchor: 'middle', it: true, fill: CORONA })}`
          + [1, 0.75, 0.5, 0.25, 0].map((p, i) => phase(105 + (i - 2) * 26, 140, 7, p, { ink: DAWN, ring: CORONA, w: 1 })).join(''),
        left: side(false, [1, 0.75, 0.5, 0.25, 0].map((p, i) => phase(60, 34 + i * 28, 8, p, { ink: DAWN, ring: CORONA, w: 1 })).join('')),
        right: side(true, word(40, 95.7, t.word, 16, { fill: DAWN, track: 0.5, mid: true, extra: ' transform="rotate(-90 40 90)"' })),
        top: `<rect width="${BW}" height="${BD}" fill="${CORONA}"/>${ticks(8.5, 8.5, BW - 17, BD - 17, 8, VOID, 0.7)}<circle cx="105" cy="48" r="31" fill="none" stroke="${VOID}" stroke-opacity=".5" stroke-width="1"/><circle cx="105" cy="48" r="23.4" fill="${FLARE}"/><circle cx="105" cy="48" r="22" fill="${VOID}"/>${star(120.6, 32.4, 10, 1.3, GLINT)}`,
        bottom: `<rect width="${BW}" height="${BD}" fill="${NIGHT}"/>`,
      },
    },
  };
}

export const BRAND: BrandSpec = {
  id: 'eclipse', kind: 'own',
  skin: {
    // lines: the repo's line-strong on each theme (dawn 18 % on void, ink 22 % on dawn), flattened
    main: { bg: VOID, ink: DAWN, muted: MIST, accent: CORONA, line: '#302f32' },
    alt: { bg: DAWN, ink: INK, muted: MISTINK, accent: DEEP, line: '#c2beb8' },
    onAccent: VOID, radius: '24px', rule: '1px solid',
    heading: { weight: 400, transform: 'none', tracking: '-0.02em', style: 'normal' },
  },
  palette: [
    { key: 'void', hex: VOID, share: 50 }, { key: 'dawn', hex: DAWN, share: 22 }, { key: 'night', hex: NIGHT, share: 12 },
    { key: 'corona', hex: CORONA, share: 8 }, { key: 'mist', hex: MIST, share: 5 }, { key: 'flare', hex: FLARE, share: 3 },
  ],
  type: {
    display: { name: 'Instrument Serif', stack: "'bl-instrument', serif", weights: [400], italic: true },
    text: { name: 'Geist', stack: "'bl-geist', sans-serif", weights: [400, 500, 600] },
  },
  origin: { logo: 'repo', grid: 'lab', palette: 'repo', type: 'repo', patterns: 'lab', pieces: 'lab', object: 'lab' },
  art,
};
