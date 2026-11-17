/**
 * The roadmap's model (design/2026/roadmap.md): the surveyed site past the railway of «El camino». One board, four
 * districts (the stages), a surveyor's line snaking through every piece of the plan in order (lib/roadmap.ts):
 *   project → a dotted wire model on its pegged plot (six hand-made ones, the rest drawn from their names), with a
 *             plate that carries its code; P0, under way, is half built: solid where it stands, wire where it doesn't
 *   window  → a level crossing: two posts and a striped barrier across the line (programming stops, maths goes on)
 *   cert    → a signal tower with its lamp
 *   pause   → a bench on a slab
 * Nothing is drawn as built: wire models have no fills, the line has no rails.
 *   node scripts/roadmap/build.mjs                  → public/media/roadmap/roadmap.svg + roadmap.json
 *   node scripts/roadmap/build.mjs --preview <html> → also a standalone page
 * Items are read from lib/roadmap.ts by a tiny parser (the file is data only), so the drawing and the page agree.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as k from '../../lib/iso/iso-kit.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../..');
const OUT = join(ROOT, 'public/media/roadmap');
const PREVIEW = process.argv.includes('--preview') ? process.argv[process.argv.indexOf('--preview') + 1] : '';

/* ── the plan, from lib/roadmap.ts ── */
const src = readFileSync(join(ROOT, 'lib/roadmap.ts'), 'utf8');
const ITEMS = [...src.matchAll(/\{ id: '([^']+)', stage: '(\w+)', kind: '(\w+)'(?:, code: '([^']+)')?[^}]*?\}/g)].map((m) => ({
  id: m[1],
  stage: m[2],
  kind: m[3],
  code: m[4] ?? '',
  status: /status: 'desarrollo'/.test(m[0]) ? 'desarrollo' : 'planeado',
  diorama: (m[0].match(/diorama: '(\w+)'/) ?? [])[1],
}));
if (ITEMS.length !== 56) throw new Error(`expected 56 items, read ${ITEMS.length}`);

const W = 1600;
const H = 1300;
const AZ = 45;

/* ── the board and the serpentine: 7 rows of 8 slots ── */
const COLS = 8;
const ROWS = Math.ceil(ITEMS.length / COLS);
const GAP_X = 128;
const GAP_Y = 150;
const X0 = 70;
const Y0 = -((ROWS - 1) * GAP_Y) / 2;
const BOARD = { x: -10, y: Y0 - 140, w: X0 * 2 + (COLS - 1) * GAP_X - 20 + 60, d: (ROWS - 1) * GAP_Y + 230, r: 12 };
const BOARD_H = 18;
const LEG_H = 26;

const P = k.fitProjection([...k.boxCorners(BOARD, -BOARD_H - LEG_H, 0), [BOARD.x, BOARD.y, 120]], W, H, { pad: 26, azimuth: AZ });
const at = (p) => k.iso(p, P);
const r1 = (n) => Math.round(n * 10) / 10;
const pathOf = (pts, close = false) => `M${pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L')}${close ? 'Z' : ''}`;
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const box = (x, y, w, d, z, h, tone = 'mid', { bevel = 0, steps = 2, r = 0.6, lit, cls } = {}) => S(k.slabOf({ x, y, w, d, r }, z, h, P, steps, bevel), { tone, lit, className: cls });
const post = (cx, cy, rad, z, h, tone = 'mid', steps = 10) => S(k.cylinder(cx, cy, rad, z, h, P, steps), { tone });
const poly = (pts, cls) => `<path class="${cls}" d="${pathOf(pts.map(at), true)}"/>`;
const byDepth = (parts) => parts.sort((a, b) => depth(a[0], a[1]) - depth(b[0], b[1])).map((p) => p[2]).join('');

/* ── wire: the planned models are drawn only with dotted lines (no fills: nothing is built) ── */
const segs = [];
const seg = (a, b) => `M${at(a).map(r1).join(' ')}L${at(b).map(r1).join(' ')}`;
const polyline = (pts, close = false) => `M${pts.map((p) => at(p).map(r1).join(' ')).join('L')}${close ? 'Z' : ''}`;
const circle = (cx, cy, z, r, n = 20) => polyline(Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r, z]), true);
/** a ring standing in the plane x = cx (normal along x) */
const ringX = (cx, cy, cz, r, n = 20) => polyline(Array.from({ length: n }, (_, i) => [cx, cy + Math.cos((i / n) * Math.PI * 2) * r, cz + Math.sin((i / n) * Math.PI * 2) * r]), true);
/** a ring standing in the plane y = cy */
const ringY = (cx, cy, cz, r, n = 20) => polyline(Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cy, cz + Math.sin((i / n) * Math.PI * 2) * r]), true);
const wbox = (x, y, z, w, d, h) => {
  const c = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
  return polyline(c.map(([a, b]) => [a, b, z]), true) + polyline(c.map(([a, b]) => [a, b, z + h]), true) + c.map(([a, b]) => seg([a, b, z], [a, b, z + h])).join('');
};
const wboxC = (cx, cy, z, w, d, h) => wbox(cx - w / 2, cy - d / 2, z, w, d, h);
const wcyl = (cx, cy, z, r, h, n = 18) => circle(cx, cy, z, r, n) + circle(cx, cy, z + h, r, n) + seg([cx - r * 0.707, cy + r * 0.707, z], [cx - r * 0.707, cy + r * 0.707, z + h]) + seg([cx + r * 0.707, cy - r * 0.707, z], [cx + r * 0.707, cy - r * 0.707, z + h]);
const wire = (d) => `<path class="rm-wire" d="${d}"/>`;

/** the six hand-made models and the ones drawn from each project's name; all around (cx, cy), up to ~70 units high */
const MODELS = {
  // Faro: a pumpjack beside a lighthouse (wells of Vaca Muerta, and a light that guides)
  faro: (cx, cy) => {
    let s = wbox(cx - 34, cy - 8, 0, 34, 16, 4); // the pumpjack's skid
    s += seg([cx - 26, cy, 4], [cx - 17, cy, 30]) + seg([cx - 8, cy, 4], [cx - 17, cy, 30]); // A-frame
    s += seg([cx - 36, cy, 33], [cx - 2, cy, 27]) + polyline([[cx - 36, cy, 33], [cx - 40, cy, 26], [cx - 38, cy, 18]]); // beam and horse head
    s += seg([cx - 38, cy, 18], [cx - 38, cy, 4]);
    s += wcyl(cx + 18, cy, 0, 9, 4) + wcyl(cx + 18, cy, 4, 7, 50, 14) + wcyl(cx + 18, cy, 54, 9, 3) + wcyl(cx + 18, cy, 57, 5, 8, 12) + seg([cx + 18, cy, 65], [cx + 18, cy, 72]);
    return s;
  },
  // Escudo: a gate with a shield over it (a gateway that decides who passes)
  escudo: (cx, cy) => {
    let s = wbox(cx - 34, cy - 6, 0, 12, 12, 46) + wbox(cx + 22, cy - 6, 0, 12, 12, 46) + wbox(cx - 34, cy - 6, 46, 68, 12, 8);
    s += polyline([[cx - 14, cy + 6, 40], [cx + 14, cy + 6, 40], [cx + 14, cy + 6, 22], [cx, cy + 6, 10], [cx - 14, cy + 6, 22]], true);
    s += polyline([[cx - 9, cy + 6, 35], [cx + 9, cy + 6, 35], [cx + 9, cy + 6, 23], [cx, cy + 6, 15], [cx - 9, cy + 6, 23]], true);
    return s;
  },
  // Surco: furrows with seedlings, a sensor mast
  surco: (cx, cy) => {
    let s = '';
    for (let i = 0; i < 6; i++) {
      const y = cy - 24 + i * 9;
      s += seg([cx - 38, y, 0.5], [cx + 18, y, 0.5]);
      for (let j = 0; j < 5; j++) s += seg([cx - 32 + j * 12, y, 0.5], [cx - 32 + j * 12, y, 5]);
    }
    s += seg([cx + 30, cy, 0], [cx + 30, cy, 52]) + wboxC(cx + 30, cy, 40, 12, 8, 7) + seg([cx + 30, cy, 52], [cx + 22, cy - 6, 58]);
    return s;
  },
  // Estación: a ground-station dish on its pedestal
  estacion: (cx, cy) => {
    let s = wboxC(cx, cy, 0, 22, 22, 10) + wcyl(cx, cy, 10, 5, 22, 12);
    const c = [cx + 4, cy + 4, 46];
    const n = 22;
    const rim = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [c[0] + Math.cos(a) * 26 * 0.75, c[1] + Math.cos(a) * 26 * 0.75 * -0.2 + Math.sin(a) * 26, c[2] + Math.cos(a) * 18];
    });
    s += polyline(rim, true) + seg([cx, cy, 32], c) + seg(c, [c[0] + 14, c[1] + 4, c[2] + 6]) + seg(rim[0], [c[0] + 14, c[1] + 4, c[2] + 6]) + seg(rim[n / 2], [c[0] + 14, c[1] + 4, c[2] + 6]);
    return s;
  },
  // Lupa: an inspection bench, a part on it, a magnifier on its arm
  lupa: (cx, cy) => {
    let s = wboxC(cx, cy, 0, 64, 30, 22) + wboxC(cx - 8, cy, 22, 18, 14, 10);
    s += seg([cx + 22, cy - 10, 22], [cx + 22, cy - 10, 58]) + seg([cx + 22, cy - 10, 58], [cx + 4, cy - 6, 52]);
    s += ringX(cx - 2, cy - 4, 44, 11);
    return s;
  },
  // Horizonte: a rocket on its pad, beside its tower
  horizonte: (cx, cy) => {
    let s = wboxC(cx, cy, 0, 44, 36, 5) + wcyl(cx, cy, 5, 7, 46, 14) + polyline([[cx - 7, cy, 51], [cx, cy, 68], [cx + 7, cy, 51]]) + polyline([[cx, cy - 7, 51], [cx, cy, 68], [cx, cy + 7, 51]]);
    for (const [dx, dy] of [[-10, 0], [10, 0], [0, -10], [0, 10]]) s += seg([cx + dx * 0.7, cy + dy * 0.7, 18], [cx + dx * 1.3, cy + dy * 1.3, 5]);
    s += wbox(cx + 14, cy - 18, 5, 8, 8, 58);
    for (let z = 15; z < 60; z += 11) s += seg([cx + 14, cy - 18, z], [cx + 22, cy - 10, z + 6]);
    s += seg([cx + 14, cy - 10, 50], [cx + 7, cy - 3, 46]);
    return s;
  },
  // ── drawn from the name ──
  p8: (cx, cy) => wboxC(cx, cy, 0, 30, 30, 34) + ringY(cx, cy + 15, 20, 10) + ringY(cx, cy + 15, 20, 4) + seg([cx - 15, cy + 15, 20], [cx + 15, cy + 15, 20]) + seg([cx, cy + 15, 5], [cx, cy + 15, 35]),
  s1: (cx, cy) => wboxC(cx, cy, 0, 46, 36, 40) + ringY(cx, cy + 18, 20, 12) + ringY(cx, cy + 18, 20, 3) + seg([cx - 12, cy + 18, 20], [cx + 12, cy + 18, 20]), // Cripta: a vault door
  s2: (cx, cy) => { // Bastión: a wall with merlons and a corner tower
    let s = wbox(cx - 40, cy - 6, 0, 64, 12, 26);
    for (let i = 0; i < 5; i++) s += wbox(cx - 38 + i * 13, cy - 6, 26, 7, 12, 6);
    return s + wcyl(cx + 32, cy, 0, 10, 40, 14) + wcyl(cx + 32, cy, 40, 12, 5, 14);
  },
  s3: (cx, cy) => { // Centinela: a watchtower with an eye
    let s = '';
    for (const [dx, dy] of [[-10, -10], [10, -10], [10, 10], [-10, 10]]) s += seg([cx + dx * 1.4, cy + dy * 1.4, 0], [cx + dx, cy + dy, 50]);
    s += seg([cx - 14, cy - 14, 18], [cx + 14, cy + 14, 32]) + seg([cx + 14, cy - 14, 18], [cx - 14, cy + 14, 32]);
    return s + wboxC(cx, cy, 50, 24, 24, 14) + ringY(cx, cy + 12, 57, 4) + polyline([[cx - 14, cy - 14, 64], [cx, cy, 74], [cx + 14, cy + 14, 64]]) + polyline([[cx + 14, cy - 14, 64], [cx, cy, 74], [cx - 14, cy + 14, 64]]);
  },
  q1: (cx, cy) => { // Ábaco: an abacus
    let s = wbox(cx - 34, cy - 3, 0, 4, 6, 44) + wbox(cx + 30, cy - 3, 0, 4, 6, 44) + seg([cx - 30, cy, 44], [cx + 30, cy, 44]) + seg([cx - 30, cy, 2], [cx + 30, cy, 2]);
    for (let r = 0; r < 4; r++) {
      const z = 10 + r * 9;
      s += seg([cx - 30, cy, z], [cx + 30, cy, z]);
      for (let b = 0; b < 4; b++) s += ringX(cx - 22 + b * 7 + (r % 2) * 18, cy, z, 3, 8);
    }
    return s;
  },
  q2: (cx, cy) => { // papers: a stack of sheets, one lifted
    let s = '';
    for (let i = 0; i < 3; i++) s += wboxC(cx - 8 + i * 4, cy - 2 + i * 3, i * 3, 34, 44, 1);
    return s + polyline([[cx + 10, cy - 20, 20], [cx + 40, cy - 20, 28], [cx + 40, cy + 20, 28], [cx + 10, cy + 20, 20]], true);
  },
  q3: (cx, cy) => { // Prisma: a triangular prism on a stand
    const a = [cx - 26, cy - 14, 10];
    const b = [cx - 26, cy + 14, 10];
    const c = [cx - 26, cy, 46];
    const o = (p) => [p[0] + 52, p[1], p[2]];
    return polyline([a, b, c], true) + polyline([o(a), o(b), o(c)], true) + seg(a, o(a)) + seg(b, o(b)) + seg(c, o(c)) + wboxC(cx, cy, 0, 20, 20, 10);
  },
  q4: (cx, cy) => { // Libro: an open book on a lectern
    const sp = [[cx - 30, cy, 30], [cx + 30, cy, 30]];
    return wboxC(cx, cy, 0, 20, 14, 22) + polyline([sp[0], sp[1], [cx + 30, cy - 26, 40], [cx - 30, cy - 26, 40]], true) + polyline([sp[0], sp[1], [cx + 30, cy + 26, 40], [cx - 30, cy + 26, 40]], true);
  },
  q5: (cx, cy) => { // Tablero: a dashboard panel with bars
    let s = seg([cx, cy, 0], [cx, cy, 22]) + wboxC(cx, cy, 0, 26, 18, 2) + polyline([[cx - 34, cy, 22], [cx + 34, cy, 22], [cx + 34, cy, 62], [cx - 34, cy, 62]], true);
    [10, 22, 14, 30, 18, 26].forEach((h, i) => { s += polyline([[cx - 28 + i * 10, cy, 26], [cx - 28 + i * 10, cy, 26 + h], [cx - 22 + i * 10, cy, 26 + h], [cx - 22 + i * 10, cy, 26]]); });
    return s;
  },
  q6: (cx, cy) => wcyl(cx, cy, 0, 18, 14) + wcyl(cx, cy, 16, 18, 14) + wcyl(cx, cy, 32, 18, 14) + seg([cx + 18, cy, 46], [cx + 38, cy - 10, 46]) + seg([cx + 18, cy, 30], [cx + 38, cy - 10, 30]), // a database feeding a pipe
  p0: (cx, cy) => wboxC(cx, cy, 0, 60, 44, 30), // P0: the wire half; its solid half is drawn apart
  a1: (cx, cy) => { // Trayectoria: a ballistic arc with its points
    const pts = Array.from({ length: 13 }, (_, i) => { const q = i / 12; return [cx - 40 + q * 80, cy + 10 - q * 20, 4 + 64 * q * (1 - q) * 3.4]; });
    return polyline(pts) + pts.filter((_, i) => i % 3 === 0).map((p) => ringY(p[0], p[1], p[2], 2.4, 8)).join('') + wboxC(cx - 40, cy + 10, 0, 10, 10, 4);
  },
  a2: (cx, cy) => { // Cuerda: a truss on two supports
    let s = wboxC(cx - 36, cy, 0, 8, 14, 20) + wboxC(cx + 36, cy, 0, 8, 14, 20) + seg([cx - 40, cy, 20], [cx + 40, cy, 20]) + seg([cx - 40, cy, 40], [cx + 40, cy, 40]);
    for (let i = 0; i <= 8; i++) s += seg([cx - 40 + i * 10, cy, 20], [cx - 40 + i * 10, cy, 40]) + (i < 8 ? seg([cx - 40 + i * 10, cy, i % 2 ? 40 : 20], [cx - 30 + i * 10, cy, i % 2 ? 20 : 40]) : '');
    return s;
  },
  a3: (cx, cy) => { // Túnel: a wind tunnel tube with a wing inside
    let s = '';
    for (let i = 0; i <= 4; i++) s += ringX(cx - 36 + i * 18, cy, 24, 18 + (i === 0 || i === 4 ? 4 : 0));
    s += seg([cx - 36, cy - 18, 24], [cx + 36, cy - 18, 24]) + seg([cx - 36, cy + 18, 24], [cx + 36, cy + 18, 24]) + seg([cx - 36, cy, 42], [cx + 36, cy, 42]);
    return s + polyline([[cx - 6, cy - 12, 24], [cx + 8, cy - 12, 26], [cx + 8, cy + 12, 26], [cx - 6, cy + 12, 24]], true) + wboxC(cx, cy, 0, 60, 12, 4);
  },
  a4: (cx, cy) => { // Rumbo: a quadcopter over its pad
    let s = wboxC(cx, cy, 0, 40, 40, 2) + wboxC(cx, cy, 30, 12, 12, 6);
    for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) s += seg([cx + dx * 6, cy + dy * 6, 33], [cx + dx * 20, cy + dy * 20, 33]) + circle(cx + dx * 20, cy + dy * 20, 35, 9, 16);
    return s;
  },
  a5: (cx, cy) => { // Órbita: a planet with a tilted orbit and a satellite
    let s = circle(cx, cy, 30, 16, 22) + ringX(cx, cy, 30, 16, 22) + ringY(cx, cy, 30, 16, 22);
    const orbit = Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [cx + Math.cos(a) * 36, cy + Math.sin(a) * 30, 30 + Math.sin(a) * 14]; });
    return s + polyline(orbit, true) + wboxC(cx + 36, cy, 26, 6, 6, 6) + wboxC(cx, cy, 0, 18, 18, 8);
  },
  a6: (cx, cy) => wboxC(cx - 22, cy, 0, 22, 22, 22) + wboxC(cx + 22, cy - 10, 0, 22, 22, 30) + wboxC(cx + 4, cy + 22, 0, 18, 18, 14) + seg([cx - 11, cy, 11], [cx + 11, cy - 10, 15]) + seg([cx + 22, cy + 1, 7], [cx + 13, cy + 22, 7]), // three modules linked: contributions
};

/* ── infrastructure: solid, small, grey (the plan's own furniture) ── */
function crossing(x, y) {
  // two posts with lamps either side of the line, a barrier arm across it with coral stripes
  const parts = [];
  for (const dy of [-22, 22]) parts.push([x, y + dy, box(x - 2.5, y + dy - 2.5, 5, 5, 0, 26, 'mid') + post(x, y + dy, 3, 26, 3, 'hi', 10)]);
  let s = byDepth(parts);
  s += box(x - 1.6, y - 22, 3.2, 44, 18, 3, 'hi', { cls: 'rm-bar' });
  for (let i = 0; i < 4; i++) s += poly([[x + 1.6, y - 18 + i * 10, 18], [x + 1.6, y - 13 + i * 10, 18], [x + 1.6, y - 13 + i * 10, 21], [x + 1.6, y - 18 + i * 10, 21]], 'rm-stripe');
  return s;
}
function tower(x, y) {
  // a lattice signal tower: four legs, cross-braces, a lamp
  let s = '';
  const legs = [[-6, -6], [6, -6], [6, 6], [-6, 6]].map(([dx, dy]) => [x + dx, y + dy, post(x + dx, y + dy, 0.9, 0, 46, 'mid', 6)]);
  s += byDepth(legs);
  let br = '';
  for (let z = 6; z < 44; z += 10) br += k.segment([x - 6, y + 6, z], [x + 6, y + 6, z + 10], P) + k.segment([x + 6, y - 6, z], [x + 6, y + 6, z + 10], P);
  s += L(br, { tone: 'lo' });
  return s + box(x - 8, y - 8, 16, 16, 46, 3, 'mid') + post(x, y, 4, 49, 8, 'hi', 14) + `<path class="rm-lamp" d="${k.sideRing([x, y + 4, 53], 2.4, 'y', P)}"/>`;
}
function bench(x, y) {
  return box(x - 18, y - 12, 36, 24, 0, 2, 'lo', { r: 1 }) + box(x - 12, y - 4, 2, 8, 2, 7, 'mid') + box(x + 10, y - 4, 2, 8, 2, 7, 'mid') + box(x - 14, y - 5, 28, 10, 9, 2, 'hi') + box(x - 14, y - 6, 28, 2, 11, 9, 'mid');
}

/* ── layout: slot i sits along the serpentine; rows alternate direction ── */
const slot = (i) => {
  const row = Math.floor(i / COLS);
  const col = i % COLS;
  const c = row % 2 === 0 ? col : COLS - 1 - col;
  return { x: X0 + c * GAP_X, y: Y0 + row * GAP_Y, row };
};
const LINE_DY = 44; // the line runs in front of the plots (+y), so nothing stands in front of it

const ground = [];
const standing = [];
// the surveyor's line: pale sleepers, a dotted centre, flags at the turns
const route = [];
for (let r = 0; r < ROWS; r++) {
  const y = Y0 + r * GAP_Y + LINE_DY;
  const [a, b] = r % 2 === 0 ? [X0 - 40, X0 + (COLS - 1) * GAP_X + 40] : [X0 + (COLS - 1) * GAP_X + 40, X0 - 40];
  route.push([a, y], [b, y]);
}
let sleepers = '';
let centre = '';
for (let i = 0; i < route.length - 1; i++) {
  const [a, b] = [route[i], route[i + 1]];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const t = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  for (let d = 6; d < len - 4; d += 17) {
    const o = [a[0] + t[0] * d, a[1] + t[1] * d];
    sleepers += pathOf([[-2.4, -12], [2.4, -12], [2.4, 12], [-2.4, 12]].map(([u, v]) => at([o[0] + t[0] * u - t[1] * v, o[1] + t[1] * u + t[0] * v, 1])), true);
  }
  centre += `M${at([...a, 1.4]).map(r1).join(' ')}L${at([...b, 1.4]).map(r1).join(' ')}`;
}
ground.push(`<path class="cam-sleeper--plan" d="${sleepers}"/>`, L(centre, { tone: 'mid', dotted: true }));

// the four districts: each slot's ground takes its stage's tint, merged into one rectangle per row run
let zones = '';
for (let r = 0; r < ROWS; r++) {
  let runStart = -1;
  for (let c = 0; c <= COLS; c++) {
    const i = r * COLS + (r % 2 === 0 ? c : COLS - 1 - c);
    const st = c < COLS && i < ITEMS.length ? ITEMS[i].stage : null;
    const prev = c > 0 ? ITEMS[r * COLS + (r % 2 === 0 ? c - 1 : COLS - c)]?.stage : null;
    if (c > 0 && st !== prev && runStart >= 0) {
      const a = slot(r * COLS + (r % 2 === 0 ? runStart : COLS - 1 - runStart));
      const b = slot(r * COLS + (r % 2 === 0 ? c - 1 : COLS - c));
      const x0 = Math.min(a.x, b.x) - GAP_X / 2 + 3;
      const x1 = Math.max(a.x, b.x) + GAP_X / 2 - 3;
      const y0 = a.y - GAP_Y / 2 + 3;
      const y1 = a.y + GAP_Y / 2 - 3;
      zones += `<path class="rm-zone" data-zone="${prev}" d="${pathOf([[x0, y0, 0.05], [x1, y0, 0.05], [x1, y1, 0.05], [x0, y1, 0.05]].map(at), true)}"/>`;
      runStart = -1;
    }
    if (st && runStart < 0) runStart = c;
  }
}
ground.unshift(zones);

const B = [];
const stageStart = {};
ITEMS.forEach((it, i) => {
  const { x, y } = slot(i);
  stageStart[it.stage] ??= i;
  const plot = { x: x - 48, y: y - 40, w: 96, d: 72, r: 0.5 };
  let s = '';
  const lineY = y + LINE_DY;
  if (it.kind === 'project') {
    s += L(k.planOutline(plot, 0.3, P, 2), { tone: 'mid', dotted: true });
    const stakes = k.corners(plot, 0).map(([px, py]) => [px, py, L(k.segment([px, py, 0], [px, py, 14], P), { tone: 'mid', className: 'rm-stake' }) + D([at([px, py, 14])], { size: 0.8, tone: 'hi' })]);
    s += L(k.onTop([[plot.x, plot.y], [plot.x + plot.w, plot.y], [plot.x + plot.w, plot.y + plot.d], [plot.x, plot.y + plot.d]], 11, P, true), { tone: 'faint' });
    const model = MODELS[it.diorama] ?? MODELS[it.id];
    if (!model) throw new Error(`no model for ${it.id}`);
    if (it.id === 'p0') {
      // under way: the left half stands, the right half is still wire
      s += box(x - 30, y - 22, 30, 44, 0, 30, 'hi', { bevel: 0.6 }) + wire(model(x, y));
    } else {
      s += wire(model(x, y));
    }
    s += byDepth(stakes);
    // the code plate on its stake, at the plot's front edge, facing the line
    s += box(x + 30, plot.y + plot.d - 1, 2, 2, 0, 18, 'mid') + box(x + 22, plot.y + plot.d + 1, 22, 1.5, 12, 11, 'mid', { r: 0.2 }) + poly([[x + 22.5, plot.y + plot.d + 2.5, 12.5], [x + 43.5, plot.y + plot.d + 2.5, 12.5], [x + 43.5, plot.y + plot.d + 2.5, 22.5], [x + 22.5, plot.y + plot.d + 2.5, 22.5]], 'cam-plate') + k.faceTextSvg(k.sideMatrix([x + 33, plot.y + plot.d + 2.5], 14.6, P, 'left'), it.code, { size: 6.4, tone: 'hi', anchor: 'middle' });
  } else if (it.kind === 'window') {
    s += crossing(x, lineY) + box(x - 30, y - 10, 2, 2, 0, 20, 'mid') + box(x - 42, y - 8, 24, 1.5, 14, 11, 'mid', { r: 0.2 }) + poly([[x - 41.5, y - 6.5, 14.5], [x - 18.5, y - 6.5, 14.5], [x - 18.5, y - 6.5, 24.5], [x - 41.5, y - 6.5, 24.5]], 'cam-plate') + k.faceTextSvg(k.sideMatrix([x - 30, y - 6.5], 16.6, P, 'left'), it.code, { size: 6.4, tone: 'hi', anchor: 'middle' });
  } else if (it.kind === 'cert') {
    s += tower(x, y) + box(x + 14, y + 8, 22, 1.5, 4, 11, 'mid', { r: 0.2 }) + poly([[x + 14.5, y + 9.5, 4.5], [x + 35.5, y + 9.5, 4.5], [x + 35.5, y + 9.5, 14.5], [x + 14.5, y + 9.5, 14.5]], 'cam-plate') + k.faceTextSvg(k.sideMatrix([x + 25, y + 9.5], 6.6, P, 'left'), it.code, { size: 6.4, tone: 'hi', anchor: 'middle' });
  } else {
    s += bench(x, y);
  }
  B.push({ id: it.id, stage: it.stage, x, y });
  standing.push({ key: depth(x, y), svg: `<g data-item="${it.id}" data-stage="${it.stage}" data-kind="${it.kind}">${s}</g>` });
});

// a stone at the start of each district with its number
Object.entries(stageStart).forEach(([st, i], n) => {
  const { x, y } = slot(i);
  const sx = x - 60;
  const sy = y + LINE_DY + 22;
  standing.push({ key: depth(sx, sy), svg: box(sx - 7, sy - 5, 14, 10, 0, 22, 'hi', { bevel: 0.6 }) + k.faceTextSvg(k.sideMatrix([sx, sy + 5], 6, P, 'left'), String(n + 1).padStart(2, '0'), { size: 7, tone: 'hi', anchor: 'middle' }) + poly([[sx - 7, sy + 5, 18], [sx + 7, sy + 5, 18], [sx + 7, sy + 5, 22], [sx - 7, sy + 5, 22]], 'cam-coral') });
});

/* ── board ── */
function board() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BOARD, -BOARD_H - LEG_H, BOARD_H + LEG_H, P)}"/>`];
  for (const [x, y] of k.corners(BOARD, 44).sort((a, b) => depth(...a) - depth(...b))) {
    out.push(box(x - 12, y - 12, 24, 24, -BOARD_H - LEG_H, 3, 'lo', { r: 2 }));
    out.push(box(x - 8, y - 8, 16, 16, -BOARD_H - LEG_H + 3, LEG_H - 3, 'lo', { r: 1.5 }));
  }
  out.push(S(k.slabOf(BOARD, -BOARD_H, BOARD_H, P, 10, 1.6), { tone: 'mid', inner: L(k.sideSeam(BOARD, -6, P, 10), { tone: 'faint' }) }));
  out.push(L(k.planOutline(k.insetPlan(BOARD, 9), 0, P, 10), { tone: 'lo' }));
  // a survey grid scored into the board: the site is measured, not built
  let grid = '';
  for (let x = BOARD.x + 40; x < BOARD.x + BOARD.w - 20; x += 64) grid += k.segment([x, BOARD.y + 12, 0.1], [x, BOARD.y + BOARD.d - 12, 0.1], P);
  for (let y = BOARD.y + 40; y < BOARD.y + BOARD.d - 20; y += 64) grid += k.segment([BOARD.x + 12, y, 0.1], [BOARD.x + BOARD.w - 12, y, 0.1], P);
  out.push(L(grid, { tone: 'faint', className: 'rm-grid' }));
  return out.join('');
}

/* ── frames for the camera: each stage, each item ── */
function frameOf(list) {
  const pts = [];
  for (const b of list) for (const [dx, dy] of [[-64, -56], [64, -56], [64, 70], [-64, 70]]) pts.push(at([b.x + dx, b.y + dy, 0]), at([b.x + dx, b.y + dy, 80]));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)].map(r1);
}
const STAGES = ['core', 'cyber', 'quant', 'space'];
const data = {
  w: W,
  h: H,
  frames: Object.fromEntries(STAGES.map((s) => [s, frameOf(B.filter((b) => b.stage === s))])),
  items: Object.fromEntries(B.map((b) => [b.id, frameOf([b])])),
  all: frameOf(B),
};

standing.sort((a, b) => a.key - b.key);
const body = `<g class="cam-world">${board()}<g class="cam-ground">${ground.join('')}</g><g class="cam-stand">${standing.map((i) => i.svg).join('')}</g></g>`;
const svg = k.figureSvg({ width: W, height: H, label: '', body });
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'roadmap.svg'), svg);
writeFileSync(join(OUT, 'roadmap.json'), JSON.stringify(data));
if (PREVIEW) {
  const css = readFileSync(join(ROOT, 'components/camino/camino.css'), 'utf8').split('/* ── the section')[0].replace('.camino .iso[data-theme="light"]', '.iso[data-theme="light"]') + readFileSync(join(ROOT, 'components/roadmap/roadmap-figure.css'), 'utf8');
  writeFileSync(PREVIEW, k.pageHtml({ title: 'roadmap', theme: 'light', body: `<style>${css}body{background:#0a0a0c}.iso-page{max-width:none}</style>${svg}`, width: 1600 }));
}
console.log('roadmap.svg', svg.length, 'bytes ·', B.length, 'items');
