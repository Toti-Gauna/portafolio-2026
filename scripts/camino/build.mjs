/**
 * «El camino» (design/2026/camino.md): the career as a model railway, drawn with the anatomy kit (lib/iso/iso-kit.mjs,
 * a copy of .claude/skills/anatomy/kit/iso-kit.mjs, MIT).
 *   node scripts/camino/build.mjs                  → public/media/camino/camino.svg + camino.json
 *   node scripts/camino/build.mjs --preview <html> → also a standalone page to look at it
 * World units ≈ 1 px; x runs along the board, y is depth (−y = back), z is up. Camera: azimuth 45°, so the faces that
 * look at +x (lower right) and +y (lower left) are the visible ones.
 * Layout rule that keeps the painter honest: nothing stands in front of a built line (every building sits behind its
 * track), so the handcar the page moves can be drawn last. Every building group carries data-building="<id>"
 * (lib/career.ts) and sits in a data-station="<id>" group.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import * as k from '../../lib/iso/iso-kit.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '../../public/media/camino');
const PREVIEW = process.argv.includes('--preview') ? process.argv[process.argv.indexOf('--preview') + 1] : '';

const W = 1600;
const H = 1100;
const AZ = 45;

/* ── the board: near square, the line runs in an S over three parallel rows ─────────────────────────────────── */
const BOARD = { x: -40, y: -410, w: 1090, d: 790, r: 12 };
const BOARD_H = 18;
const LEG_H = 26;
/** row A (back): origin → TACH → Ada · row B (middle, toward −x): Tsoft · row C (front): the own path → the roadmap */
const ROW = { a: -250, b: 0, c: 255 };
const BUILT_TO = 660; // on row C, past this x the line is only surveyed: the roadmap

const P = k.fitProjection([...k.boxCorners(BOARD, -BOARD_H - LEG_H, 0), [620, -85, 175]], W, H, { pad: 26, azimuth: AZ });

const at = (p) => k.iso(p, P);
const r1 = (n) => Math.round(n * 10) / 10;
const pathOf = (pts, close = false) => `M${pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L')}${close ? 'Z' : ''}`;
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);

/* ── drawing helpers ──────────────────────────────────────────────────────────────────────────────────────── */
/** a rounded box */
const box = (x, y, w, d, z, h, tone = 'mid', { bevel = 0, steps = 2, r = 0.8, lit, inner, cls } = {}) =>
  S(k.slabOf({ x, y, w, d, r }, z, h, P, steps, bevel), { tone, lit, inner, className: cls });
/** a box given by its centre */
const boxC = (cx, cy, w, d, z, h, tone, o) => box(cx - w / 2, cy - d / 2, w, d, z, h, tone, o);
const post = (cx, cy, rad, z, h, tone = 'mid', steps = 12) => S(k.cylinder(cx, cy, rad, z, h, P, steps), { tone });
/** a filled polygon of world points (on a face or on the floor) */
const poly = (pts, cls) => `<path class="${cls}" d="${pathOf(pts.map(at), true)}"/>`;
/** a rectangle on the +y face (y = const), from x0 to x1, z0 to z1 */
const onY = (y, x0, x1, z0, z1, cls) => poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], cls);
/** a rectangle on the +x face (x = const), from y0 to y1 */
const onX = (x, y0, y1, z0, z1, cls) => poly([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]], cls);
/** text on the +y face, reading along +x, its baseline at height z */
const signY = (x, y, z, text, size = 7, anchor = 'middle') => k.faceTextSvg(k.sideMatrix([x, y], z, P, 'left'), text, { size, tone: 'hi', anchor });
/** text on the +x face, reading along −y */
const signX = (x, y, z, text, size = 7, anchor = 'middle') => k.faceTextSvg(k.sideMatrix([x, y], z, P, 'right'), text, { size, tone: 'hi', anchor });
/** a band seam round a box at height z (wraps its visible corners) */
const seam = (x, y, w, d, z, r = 0.8) => L(k.sideSeam({ x, y, w, d, r }, z, P, 2), { tone: 'faint' });
/** a sign plate standing on a roof edge, its face toward +y, with its text */
function plateY(cx, y, z, w, text) {
  return box(cx - w / 2, y - 2, w, 2, z, 12, 'mid', { r: 0.3 }) + onY(y, cx - w / 2 + 1, cx + w / 2 - 1, z + 1, z + 11, 'cam-plate') + signY(cx, y, z + 3.4, text, 7.2);
}
function plateX(x, cy, z, w, text) {
  return box(x - 2, cy - w / 2, 2, w, z, 12, 'mid', { r: 0.3 }) + onX(x, cy - w / 2 + 1, cy + w / 2 - 1, z + 1, z + 11, 'cam-plate') + signX(x, cy, z + 3.4, text, 7.2);
}
/** a stone plinth with an inset groove: the lot each building stands on */
function plinth(cx, cy, w, d, h = 3) {
  return box(cx - w / 2, cy - d / 2, w, d, 0, h, 'lo', { r: 1.5, bevel: 0.6 }) + L(k.planOutline(k.insetPlan({ x: cx - w / 2, y: cy - d / 2, w, d, r: 1.5 }, 3), h, P, 2), { tone: 'faint' });
}
/** sort [x, y, svg] parts far to near */
const byDepth = (parts) => parts.sort((a, b) => depth(a[0], a[1]) - depth(b[0], b[1])).map((p) => p[2]).join('');

/* ── the board, on trestle legs ───────────────────────────────────────────────────────────────────────────── */
function board() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BOARD, -BOARD_H - LEG_H, BOARD_H + LEG_H, P)}"/>`];
  for (const [x, y] of k.corners(BOARD, 44).sort((a, b) => depth(...a) - depth(...b))) {
    out.push(box(x - 12, y - 12, 24, 24, -BOARD_H - LEG_H, 3, 'lo', { r: 2 }));
    out.push(box(x - 8, y - 8, 16, 16, -BOARD_H - LEG_H + 3, LEG_H - 3, 'lo', { r: 1.5 }));
  }
  const edge = L(k.sideSeam(BOARD, -6, P, 10), { tone: 'faint' });
  out.push(S(k.slabOf(BOARD, -BOARD_H, BOARD_H, P, 10, 1.6), { tone: 'mid', inner: edge }));
  out.push(L(k.planOutline(k.insetPlan(BOARD, 9), 0, P, 10), { tone: 'lo' }));
  const screws = k.corners(BOARD, 20);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 3, 0, P, 16)).join(''), { tone: 'lo' }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.6 }));
  // the maker's plate on the front edge, under the board's lip
  return out.join('');
}

/* ── track ────────────────────────────────────────────────────────────────────────────────────────────────── */
const GAUGE = 16;
/** sample a route of waypoints with round corners of radius r: [{ p: [x, y], t: [tx, ty], s }] about every `step` */
function routeOf(pts, r = 90, step = 6) {
  const out = [];
  const seg = (a, b) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 1e-6) return;
    const t = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    for (let d = 0; d < len; d += step) out.push({ p: [a[0] + t[0] * d, a[1] + t[1] * d], t });
  };
  let from = pts[0];
  for (let i = 1; i < pts.length - 1; i++) {
    const [a, c, b] = [pts[i - 1], pts[i], pts[i + 1]];
    const u = [c[0] - a[0], c[1] - a[1]];
    const v = [b[0] - c[0], b[1] - c[1]];
    const lu = Math.hypot(...u);
    const lv = Math.hypot(...v);
    const ru = Math.min(r, lu / 2, lv / 2);
    const p0 = [c[0] - (u[0] / lu) * ru, c[1] - (u[1] / lu) * ru];
    const p1 = [c[0] + (v[0] / lv) * ru, c[1] + (v[1] / lv) * ru];
    seg(from, p0);
    const n = Math.max(2, Math.ceil((ru * 1.6) / step));
    for (let j = 0; j < n; j++) {
      const q = j / n;
      const x = (1 - q) ** 2 * p0[0] + 2 * (1 - q) * q * c[0] + q * q * p1[0];
      const y = (1 - q) ** 2 * p0[1] + 2 * (1 - q) * q * c[1] + q * q * p1[1];
      const tx = 2 * (1 - q) * (c[0] - p0[0]) + 2 * q * (p1[0] - c[0]);
      const ty = 2 * (1 - q) * (c[1] - p0[1]) + 2 * q * (p1[1] - c[1]);
      const l = Math.hypot(tx, ty);
      out.push({ p: [x, y], t: [tx / l, ty / l] });
    }
    from = p1;
  }
  seg(from, pts[pts.length - 1]);
  out.push({ p: pts[pts.length - 1], t: out[out.length - 1].t });
  let s = 0;
  out.forEach((o, i) => {
    if (i) s += Math.hypot(o.p[0] - out[i - 1].p[0], o.p[1] - out[i - 1].p[1]);
    o.s = s;
  });
  return out;
}
const near = (route, s) => route.reduce((a, b) => (Math.abs(b.s - s) < Math.abs(a.s - s) ? b : a));
const off = (o, d) => [o.p[0] - o.t[1] * d, o.p[1] + o.t[0] * d];

const ground = [];
/** ballast bed, sleepers (one path), two coral rails; unbuilt: a dotted centre line, pale sleepers and survey stakes */
function track(route, { built = true, from = 0, to = Infinity } = {}) {
  to = Math.min(to, route[route.length - 1].s);
  const part = route.filter((o) => o.s >= from && o.s <= to);
  if (built) {
    const left = part.map((o) => at([...off(o, -15), 0.4]));
    const right = part.map((o) => at([...off(o, 15), 0.4])).reverse();
    ground.push(`<path class="cam-ballast" d="${pathOf([...left, ...right], true)}"/>`);
  }
  const quads = [];
  for (let s = from + 6; s < to - 4; s += 12) {
    const o = near(part, s);
    const q = [[-2.6, -13.5], [2.6, -13.5], [2.6, 13.5], [-2.6, 13.5]].map(([a, b]) => at([o.p[0] + o.t[0] * a - o.t[1] * b, o.p[1] + o.t[1] * a + o.t[0] * b, 1.2]));
    quads.push(pathOf(q, true));
  }
  ground.push(`<path class="cam-sleeper${built ? '' : ' cam-sleeper--plan'}" d="${quads.join('')}"/>`);
  if (built) {
    for (const d of [-GAUGE / 2, GAUGE / 2]) ground.push(`<path class="cam-rail" d="${pathOf(part.map((o) => at([...off(o, d), 2.6])))}"/>`);
  } else {
    ground.push(L(pathOf(part.map((o) => at([...o.p, 1.4]))), { tone: 'mid', dotted: true }));
    const stakes = [];
    for (let s = from + 26; s < to - 10; s += 64) {
      const o = near(part, s);
      for (const d of [-GAUGE - 2, GAUGE + 2]) {
        const [x, y] = off(o, d);
        stakes.push([x, y, post(x, y, 1.3, 0, 13, 'mid', 8) + `<path class="cam-flag" d="${pathOf([at([x, y, 13]), at([x + 5, y, 11.5]), at([x, y, 10])], true)}"/>`]);
      }
    }
    standing.push({ key: depth(part[0].p[0], part[0].p[1]), svg: byDepth(stakes) });
  }
}
function bufferStop(x, y) {
  const parts = [];
  for (const d of [-GAUGE / 2, GAUGE / 2]) parts.push([x, y + d, box(x - 3, y + d - 2, 6, 4, 0, 11, 'mid')]);
  return byDepth(parts) + box(x - 3, y - GAUGE / 2 - 6, 6, GAUGE + 12, 11, 5, 'hi', { bevel: 0.4 }) + onX(x + 3, y - GAUGE / 2 - 5, y - GAUGE / 2 + 1, 12, 15, 'cam-coral') + onX(x + 3, y + GAUGE / 2 - 1, y + GAUGE / 2 + 5, 12, 15, 'cam-coral');
}

/* ── buildings ────────────────────────────────────────────────────────────────────────────────────────────── */
/** standing things, painted by depth key (far first) */
const standing = [];

/** 1 · Mar del Plata: the desk where the first website was made, a CRT with a coral screen, a lamp, books */
function seed(cx, cy) {
  const x0 = cx - 34;
  const y0 = cy - 26;
  let s = plinth(cx, cy, 86, 70);
  // a tiled floor
  s += L(Array.from({ length: 5 }, (_, i) => k.segment([x0 + 10 + i * 14, y0 + 4, 3], [x0 + 10 + i * 14, y0 + 48, 3], P)).join(''), { tone: 'faint' });
  // chair, behind the desk
  s += box(cx - 6, cy + 14, 14, 12, 3, 12, 'lo') + box(cx - 6, cy + 24, 14, 2, 15, 16, 'mid');
  // desk: legs, top, drawer
  const legs = [[x0 + 4, y0 + 4], [x0 + 58, y0 + 4], [x0 + 4, y0 + 30], [x0 + 58, y0 + 30]].map(([x, y]) => [x, y, box(x - 1.5, y - 1.5, 3, 3, 3, 20, 'lo')]);
  s += byDepth(legs);
  s += box(x0 + 40, y0 + 2, 20, 30, 15, 8, 'mid') + seam(x0 + 40, y0 + 2, 20, 30, 19);
  s += box(x0, y0, 64, 36, 23, 2.6, 'mid', { bevel: 0.6 });
  // books, a lamp
  s += box(x0 + 4, y0 + 3, 9, 13, 25.6, 3, 'lo') + box(x0 + 4.5, y0 + 3.5, 8, 12, 28.6, 2.6, 'mid') + box(x0 + 4, y0 + 3, 9, 13, 31.2, 2.4, 'lo');
  s += post(x0 + 54, y0 + 6, 3.4, 25.6, 1.4, 'mid') + L(k.segment([x0 + 54, y0 + 6, 27], [x0 + 52, y0 + 10, 40], P) + k.segment([x0 + 52, y0 + 10, 40], [x0 + 46, y0 + 16, 44], P), { tone: 'mid' }) + post(x0 + 46, y0 + 16, 3.2, 40, 4, 'hi', 12);
  // the CRT: case, bezel, coral screen on the +y face; a keyboard in front
  const m = { x: x0 + 20, y: y0 + 4, w: 22, d: 18 };
  s += box(m.x + 3, m.y - 4, 16, 8, 25.6, 14, 'mid');
  s += box(m.x, m.y + 4, m.w, m.d, 25.6, 19, 'hi', { bevel: 0.6 });
  s += onY(m.y + 4 + m.d, m.x + 3, m.x + m.w - 3, 29, 42, 'cam-glass') + onY(m.y + 4 + m.d, m.x + 4.5, m.x + m.w - 4.5, 30.5, 40.5, 'cam-coral');
  s += box(m.x + 1, m.y + 25, 20, 6, 25.6, 1.4, 'mid') + D(k.dotGrid(m.x + 3, m.y + 26.5, 8, 2, 2.2, 27, P), { size: 0.35 });
  return s;
}

/** 2 · TACH: a startup's studio-cube with a round window, a door, a roof antenna and a sign */
function cube(cx, cy) {
  const w = 62;
  const d = 54;
  const h = 46;
  const x = cx - w / 2;
  const y = cy - d / 2;
  let s = plinth(cx, cy, 96, 82);
  s += box(x - 3, y + d, w + 6, 6, 0, 3, 'lo') + box(x + 14, y + d + 6, 16, 8, 0, 1.6, 'lo') + box(x + 14, y + d + 6, 16, 4, 1.6, 1.4, 'lo');
  s += box(x, y, w, d, 3, h, 'hi', { bevel: 1.2, inner: seam(x, y, w, d, 3 + h - 9) });
  // door and round window on the +y face, two windows on the +x face
  s += onY(y + d, x + 15, x + 29, 3, 28, 'cam-dark') + onY(y + d, x + 16.5, x + 27.5, 4, 26.5, 'cam-glass');
  s += `<path class="cam-dark" d="${k.sideRing([x + 46, y + d, 26], 8.5, 'y', P)}"/>` + `<path class="cam-glass" d="${k.sideRing([x + 46, y + d, 26], 6.5, 'y', P)}"/>`;
  for (const yy of [y + 8, y + 30]) s += onX(x + w, yy, yy + 14, 22, 36, 'cam-glass');
  // roof: parapet, an AC unit with a grille, the antenna mast with its dish
  const top = 3 + h;
  s += L(k.planOutline(k.insetPlan({ x, y, w, d, r: 0.8 }, 3), top, P, 2), { tone: 'lo' });
  s += box(x + 6, y + 6, 18, 14, top, 8, 'mid') + D(k.dotGrid(x + 9, y + 9, 5, 3, 3, top + 8, P), { size: 0.4 });
  s += box(x + 40, y + 10, 8, 8, top, 2, 'lo') + post(x + 44, y + 14, 1.6, top + 2, 52, 'mid', 8);
  s += L([18, 32, 46].map((zz) => k.segment([x + 41, y + 14, top + zz], [x + 47, y + 14, top + zz], P)).join(''), { tone: 'lo' });
  s += post(x + 44, y + 14, 5.2, top + 36, 1.6, 'hi', 16) + D([at([x + 44, y + 14, top + 54])], { size: 1.1, tone: 'hi' });
  s += plateY(cx - 8, y + d, top, 34, 'TACH');
  return s;
}

/** 3 · Ada ITW: an academy pavilion on steps, ten columns, a blackboard with chalk, benches, a small dome */
function academy(cx, cy) {
  const w = 120;
  const d = 82;
  const x = cx - w / 2;
  const y = cy - d / 2;
  let s = plinth(cx, cy, w + 24, d + 22);
  s += box(x - 6, y - 6, w + 12, d + 12, 3, 4, 'lo', { bevel: 0.5 }) + box(x - 3, y - 3, w + 6, d + 6, 7, 4, 'lo', { bevel: 0.5 }) + box(x, y, w, d, 11, 4, 'mid', { bevel: 0.6 });
  const floor = 15;
  // inside: a blackboard on its easel facing the street, chalk on it, the teacher's desk, benches at the back
  const bx = x + 18;
  const by = y + d - 24;
  s += box(x + 22, y + 12, 18, 6, floor, 6, 'lo') + box(x + 22, y + 18, 18, 2, floor, 12, 'mid');
  s += box(x + 50, y + 12, 18, 6, floor, 6, 'lo') + box(x + 50, y + 18, 18, 2, floor, 12, 'mid');
  s += box(x + 80, y + 14, 22, 9, floor, 11, 'mid');
  s += box(bx, by - 2, 3, 3, floor, 30, 'lo') + box(bx + 41, by - 2, 3, 3, floor, 30, 'lo');
  s += box(bx - 1, by, 46, 2.6, floor + 7, 24, 'mid') + onY(by + 2.6, bx + 1.5, bx + 42.5, floor + 9, floor + 29, 'cam-board');
  s += L(k.segment([bx + 5, by + 2.6, floor + 25], [bx + 24, by + 2.6, floor + 25], P) + k.segment([bx + 5, by + 2.6, floor + 20], [bx + 18, by + 2.6, floor + 20], P) + k.segment([bx + 5, by + 2.6, floor + 15], [bx + 28, by + 2.6, floor + 15], P) + k.segment([bx + 30, by + 2.6, floor + 26], [bx + 39, by + 2.6, floor + 12], P), { tone: 'faint', className: 'cam-chalk', free: true });
  // columns with capitals, back row first, then the front row
  const cols = [];
  for (const yy of [y + 6, y + d - 6]) for (let i = 0; i < 4; i++) cols.push([x + 8 + i * 34.6, yy]);
  const col = ([px, py]) => [px, py, post(px, py, 3.2, floor, 40, 'hi', 10) + box(px - 4.6, py - 4.6, 9.2, 9.2, floor + 40, 2.6, 'mid', { r: 0.4 })];
  s += byDepth(cols.filter((c) => c[1] < cy).map(col));
  s += byDepth(cols.filter((c) => c[1] > cy).map(col));
  // entablature, roof, a dome
  const z = floor + 42.6;
  s += box(x - 4, y - 4, w + 8, d + 8, z, 8, 'mid', { bevel: 0.8, inner: seam(x - 4, y - 4, w + 8, d + 8, z + 3) });
  s += box(x + 2, y + 2, w - 4, d - 4, z + 8, 3, 'lo');
  s += S(k.cylinder(cx, cy, 22, z + 11, 5, P, 28), { tone: 'mid' }) + S(k.cylinder(cx, cy, 18, z + 16, 6, P, 24), { tone: 'hi' }) + S(k.cylinder(cx, cy, 12, z + 22, 5, P, 20), { tone: 'hi' }) + post(cx, cy, 2, z + 27, 6, 'mid', 8);
  s += onY(y + d + 4, x + 26, x + 94, z + 0.8, z + 7.4, 'cam-plate') + signY(cx, y + d + 4, z + 2.2, 'ADA ITW', 6.2);
  return s;
}

/** 4a · Tsoft: the corporate tower, window bands, a set-back crown, a mast, the sign */
function tower(cx, cy) {
  const w = 58;
  const d = 58;
  const x = cx - w / 2;
  const y = cy - d / 2;
  const h = 150;
  let s = plinth(cx, cy, 92, 92);
  s += box(x - 8, y - 8, w + 16, d + 16, 3, 16, 'mid', { bevel: 0.8 }) + onY(y + d + 8, cx - 12, cx + 12, 3, 16, 'cam-glass');
  let bands = '';
  for (let z = 30; z < 19 + h - 8; z += 12) bands += k.sideSeam({ x, y, w, d, r: 1 }, z, P, 2);
  s += box(x, y, w, d, 19, h, 'hi', { bevel: 1.2, inner: L(bands, { tone: 'faint' }) });
  // vertical mullions on both faces
  let mull = '';
  for (let i = 1; i < 6; i++) mull += k.segment([x + (w * i) / 6, y + d, 19], [x + (w * i) / 6, y + d, 19 + h], P) + k.segment([x + w, y + (d * i) / 6, 19], [x + w, y + (d * i) / 6, 19 + h], P);
  s += L(mull, { tone: 'faint' });
  const top = 19 + h;
  s += box(x + 8, y + 8, w - 16, d - 16, top, 10, 'mid', { bevel: 0.6 }) + post(cx, cy, 1.8, top + 10, 30, 'mid', 8) + D([at([cx, cy, top + 40])], { size: 1.2, tone: 'hi' });
  s += plateX(x + w, cy, top - 18, 40, 'TSOFT');
  return s;
}
/** 4b · Tuenti: a low annex with the prize wheel on its roof (the gamification) */
function tuenti(cx, cy) {
  const w = 74;
  const d = 58;
  const x = cx - w / 2;
  const y = cy - d / 2;
  let s = plinth(cx, cy, w + 16, d + 16);
  s += box(x, y, w, d, 3, 28, 'hi', { bevel: 1, inner: seam(x, y, w, d, 22) });
  for (let i = 0; i < 4; i++) s += onY(y + d, x + 6 + i * 17, x + 18 + i * 17, 9, 19, 'cam-glass');
  const top = 31;
  s += box(cx - 4, cy - 4, 8, 8, top, 6, 'mid');
  s += S(k.cylinder(cx, cy, 24, top + 6, 3, P, 48), { tone: 'hi' });
  const t = k.radialTicks(cx, cy, 23, 12, 2, top + 9, [9, 9], P);
  s += L(t.minor + t.major, { tone: 'lo' });
  // two coral sectors on the wheel, the pointer on its stand
  const sector = (a0, a1) => poly([[cx, cy, top + 9], ...Array.from({ length: 7 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 6; return [cx + Math.sin(a) * 22, cy - Math.cos(a) * 22, top + 9]; })], 'cam-coral');
  s += sector(0, Math.PI / 6) + sector(Math.PI, Math.PI + Math.PI / 6);
  s += post(cx, cy, 2.6, top + 9, 2, 'mid', 12);
  s += box(cx + 26, cy - 2, 4, 4, top, 16, 'mid') + poly([[cx + 26, cy, top + 14], [cx + 19, cy, top + 11], [cx + 26, cy, top + 9]], 'cam-coral');
  s += plateY(cx - 14, y + d, top, 40, 'TUENTI');
  return s;
}
/** 4c · CompliA, for Telefónica: a ventilated annex (the servers), a document stack on its roof (the RAG) */
function complia(cx, cy) {
  const w = 60;
  const d = 52;
  const x = cx - w / 2;
  const y = cy - d / 2;
  let s = plinth(cx, cy, w + 16, d + 16);
  s += box(x, y, w, d, 3, 46, 'hi', { bevel: 1, inner: seam(x, y, w, d, 40) });
  for (let i = 0; i < 3; i++) s += onX(x + w, y + 6 + i * 15, y + 17 + i * 15, 8, 34, 'cam-dark') + D(k.pointsAt(Array.from({ length: 6 }, (_, j) => [x + w, y + 11.5 + i * 15, 11 + j * 4]), P), { size: 0.45 });
  s += onY(y + d, x + 8, x + 22, 3, 24, 'cam-glass');
  const top = 49;
  // the stack of documents, each sheet a thin slab offset a little
  for (let i = 0; i < 6; i++) s += box(x + 10 + (i % 2) * 1.5, y + 10 + (i % 3), 22, 16, top + i * 2.2, 2.2, i === 5 ? 'hi' : 'mid', { r: 0.3 });
  s += box(x + 40, y + 12, 10, 26, top, 7, 'mid') + D(k.dotGrid(x + 42, y + 14, 3, 8, 3, top + 7, P), { size: 0.4 });
  s += plateY(cx + 4, y + d, top - 14, 52, 'TELEFÓNICA');
  return s;
}
/** 4d · Supernova Eventos: an event stage with a truss and two flag masts (no client brand) */
function supernova(cx, cy) {
  const w = 70;
  const d = 44;
  const x = cx - w / 2;
  const y = cy - d / 2;
  let s = plinth(cx, cy, w + 14, d + 14);
  s += box(x, y, w, d, 3, 8, 'mid', { bevel: 0.6 }) + box(x + 22, y + d, 26, 6, 3, 4, 'lo');
  // the truss: two towers and a beam, with lights
  const legs = [[x + 6, y + 6], [x + w - 6, y + 6]].map(([px, py]) => [px, py, box(px - 2.5, py - 2.5, 5, 5, 11, 38, 'mid')]);
  s += byDepth(legs);
  s += box(x + 3.5, y + 3.5, w - 7, 5, 49, 5, 'hi') + D(Array.from({ length: 6 }, (_, i) => at([x + 12 + i * 9.5, y + 8.5, 48])), { size: 0.9, tone: 'hi' });
  // a backdrop and the flag masts with coral pennants
  s += box(x + 12, y + 8, w - 24, 2, 11, 30, 'lo');
  for (const px of [x - 2, x + w + 2]) s += post(px, y + d - 4, 1.2, 3, 46, 'mid', 8) + poly([[px, y + d - 4, 49], [px + 10, y + d - 4, 45], [px, y + d - 4, 41]], 'cam-coral');
  return s;
}

/** the own path: small houses, each with its own telling detail */
function house(cx, cy, w, d, h, detail, sign) {
  const x = cx - w / 2;
  const y = cy - d / 2;
  let s = plinth(cx, cy, w + 12, d + 12);
  s += box(x, y, w, d, 3, h, 'hi', { bevel: 0.8, inner: seam(x, y, w, d, 3 + h - 6) });
  s += onY(y + d, x + 6, x + 16, 3, 20, 'cam-glass');
  s += detail(x, y, w, d, 3 + h);
  if (sign) s += onY(y + d, x + 20, x + w - 4, 3 + h - 13, 3 + h - 7, 'cam-plate');
  return s;
}
const OWN = {
  // Eclipse: the studio, with an eclipse disc on its face
  eclipse: (cx, cy) => house(cx, cy, 52, 44, 40, (x, y, w, d, top) =>
    `<path class="cam-coral" d="${k.sideRing([x + w, y + d / 2, top - 18], 10, 'x', P)}"/><path class="cam-dark" d="${k.sideRing([x + w, y + d / 2 - 2.5, top - 18], 9, 'x', P)}"/>` +
    box(x + 6, y + 6, 16, 12, top, 5, 'mid')),
  // the agentic system: 11 small modules round a hub
  agentes: (cx, cy) => house(cx, cy, 48, 48, 22, (x, y, w, d, top) => {
    const parts = [];
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2;
      const px = cx + Math.sin(a) * 16;
      const py = cy - Math.cos(a) * 16;
      parts.push([px, py, box(px - 2.6, py - 2.6, 5.2, 5.2, top, 6, 'mid', { r: 0.3 })]);
    }
    const hub = [cx, cy, S(k.cylinder(cx, cy, 6, top, 11, P, 24), { tone: 'hi' })];
    return byDepth([...parts, hub]);
  }),
  // Kinetic Studio: a small cinema, a screen on the roof and two reels
  kinetic: (cx, cy) => house(cx, cy, 50, 42, 30, (x, y, w, d, top) =>
    box(x + 6, y + 4, 34, 3, top, 22, 'mid') + onY(y + 7, x + 8, x + 38, top + 3, top + 20, 'cam-coral') +
    `<path class="cam-dark" d="${k.sideRing([x + w, y + 12, top - 12], 6, 'x', P)}"/><path class="cam-dark" d="${k.sideRing([x + w, y + 28, top - 12], 6, 'x', P)}"/>`),
  // Volta: a shop with an awning and stacked boxes
  volta: (cx, cy) => house(cx, cy, 46, 40, 28, (x, y, w, d, top) =>
    box(x + 2, y + d, w - 4, 8, top - 12, 2, 'mid', { r: 0.3 }) + onY(y + d + 8, x + 3, x + w - 3, top - 12, top - 10, 'cam-coral') +
    box(x + w + 3, y + 6, 8, 8, 3, 8, 'mid') + box(x + w + 3, y + 16, 8, 8, 3, 8, 'mid') + box(x + w + 3, y + 10, 8, 8, 11, 8, 'mid'), true),
  // Velmar: a workshop with a chimney and a candle on the sill
  velmar: (cx, cy) => house(cx, cy, 44, 38, 26, (x, y, w, d, top) =>
    box(x + w - 12, y + 6, 8, 8, top, 16, 'mid') + post(x + 10, y + d + 2.5, 2, 3, 6, 'hi', 10) + D([at([x + 10, y + d + 2.5, 11])], { size: 0.8, tone: 'hi' }), true),
  // DentalOS: a clinic, two storeys, a canopy over the door
  dentalos: (cx, cy) => house(cx, cy, 46, 40, 40, (x, y, w, d, top) =>
    box(x + 4, y + d, 18, 8, 22, 1.6, 'mid', { r: 0.3 }) + onX(x + w, y + 6, y + d - 6, 26, 34, 'cam-glass') + onX(x + w, y + 6, y + d - 6, 12, 20, 'cam-glass'), true),
  // games-market: a pavilion with a big screen and phones in front
  games: (cx, cy) => house(cx, cy, 46, 40, 20, (x, y, w, d, top) =>
    box(x + 8, y + 8, 30, 3, top, 18, 'mid') + onY(y + 11, x + 10, x + 36, top + 2, top + 16, 'cam-glass') +
    [0, 1, 2].map((i) => box(x + 10 + i * 10, y + 22, 3, 5, top, 6, 'hi', { r: 0.4 })).join('')),
  // HandyX: a workshop shed with a ladder and a toolbox
  handyx: (cx, cy) => house(cx, cy, 44, 38, 26, (x, y, w, d, top) =>
    box(x + w + 3, y + 10, 12, 7, 3, 7, 'mid') + onX(x + w + 15, y + 12, y + 15, 7, 9, 'cam-coral') +
    L(k.segment([x + w - 8, y + d + 4, 3], [x + w - 8, y + d + 1, 30], P) + k.segment([x + w - 2, y + d + 4, 3], [x + w - 2, y + d + 1, 30], P) +
      [8, 14, 20, 26].map((z) => k.segment([x + w - 8, y + d + 4 - z / 9, z], [x + w - 2, y + d + 4 - z / 9, z], P)).join(''), { tone: 'mid' }), true),
  // Lucero: a restaurant with a coral awning and a table with a parasol
  lucero: (cx, cy) => house(cx, cy, 46, 40, 26, (x, y, w, d, top) =>
    box(x + 4, y + d, w - 8, 9, top - 10, 2, 'hi', { r: 0.3 }) + onY(y + d + 9, x + 5, x + w - 5, top - 10, top - 8, 'cam-coral') +
    post(x + w + 10, y + d - 4, 6, 3, 8, 'mid', 20) + post(x + w + 10, y + d - 4, 0.8, 11, 12, 'mid', 6) + S(k.cylinder(x + w + 10, y + d - 4, 10, 23, 1.4, P, 24), { tone: 'hi' }), true),
  // Trazo: a hut with a sundial (the day, in hours)
  trazo: (cx, cy) => house(cx, cy, 40, 36, 24, (x, y, w, d, top) => {
    const px = x + w + 14;
    const py = y + d / 2;
    const t = k.radialTicks(px, py, 9, 12, 3, 9, [2.4, 4], P);
    return S(k.cylinder(px, py, 10, 3, 6, P, 32), { tone: 'hi' }) + L(t.minor, { tone: 'lo' }) + L(t.major, { tone: 'mid' }) + poly([[px, py, 9], [px, py - 8, 9], [px, py, 17]], 'cam-coral');
  }),
};

/** the roadmap: a plot pegged out with stakes and string, nothing built */
function plot(cx, cy, w, d) {
  const plan = { x: cx - w / 2, y: cy - d / 2, w, d, r: 0.5 };
  let s = L(k.planOutline(plan, 0.3, P, 2), { tone: 'mid', dotted: true }) + L(k.planOutline(k.insetPlan(plan, 10), 0.3, P, 2), { tone: 'lo', dotted: true });
  const stakes = k.corners(plan, 0).map(([x, y]) => [x, y, post(x, y, 1.4, 0, 16, 'mid', 8) + D([at([x, y, 16])], { size: 0.9, tone: 'hi' })]);
  s += L(k.onTop([[plan.x, plan.y], [plan.x + w, plan.y], [plan.x + w, plan.y + d], [plan.x, plan.y + d]], 13, P, true), { tone: 'lo' });
  return s + byDepth(stakes);
}

/* ── the handcar (the one lit part): built at the world origin, along x and along y; the page moves it ──── */
function handcar(along) {
  const L1 = along === 'x';
  const bw = L1 ? 26 : 18;
  const bd = L1 ? 18 : 26;
  let s = '';
  const wheels = [];
  for (const a of [-8, 8]) for (const b of [-7, 7]) {
    const [wx, wy] = L1 ? [a, b] : [b, a];
    wheels.push([wx, wy, post(wx, wy, 2.6, 1.8, 3.4, 'mid', 12)]);
  }
  s += byDepth(wheels);
  s += box(-bw / 2, -bd / 2, bw, bd, 5, 4, 'hi', { lit: true, bevel: 0.6 });
  // the pump: a post and a walking beam
  s += box(-2, -2, 4, 4, 9, 13, 'hi', { lit: true });
  s += L1 ? box(-12, -1.5, 24, 3, 22, 2.4, 'hi', { lit: true }) : box(-1.5, -12, 3, 24, 22, 2.4, 'hi', { lit: true });
  return s;
}

/* ── scenery: cypresses, station platforms with a lamp, the sea at Mar del Plata ─────────────────────────────── */
function cypress(x, y, h = 36) {
  // a cypress: a vertical body of revolution projects to its own profile, mirrored, so it is drawn as that silhouette
  // (left half in light, right half in shade, the base ellipse in front) instead of a faceted lathe: ~1 KB a tree
  const prof = [];
  for (let i = 0; i <= 10; i++) {
    const q = i / 10;
    prof.push([5 + q * h, 5.8 * Math.sin(Math.PI * Math.min(1, 0.16 + q * 0.94)) * (1 - 0.35 * q)]);
  }
  const side = (sign) => prof.map(([z, r]) => {
    const pts = Array.from({ length: 12 }, (_, j) => at([x + Math.cos((j / 12) * Math.PI * 2) * r, y + Math.sin((j / 12) * Math.PI * 2) * r, z]));
    return pts.reduce((m, p) => (sign * p[0] > sign * m[0] ? p : m));
  });
  const left = side(-1);
  const right = side(1);
  const [cx0, cy0] = at([x, y, 5]);
  const base = Array.from({ length: 9 }, (_, j) => at([x + Math.cos(-Math.PI / 4 + (j / 8) * Math.PI) * prof[0][1], y + Math.sin(-Math.PI / 4 + (j / 8) * Math.PI) * prof[0][1], 5]));
  const tip = at([x, y, 5 + h]);
  const mid = prof.map(([z]) => at([x, y, z]));
  const all = pathOf([...left, tip, ...right.reverse(), ...base.reverse()], true);
  const shade = pathOf([...mid, tip, ...side(1).reverse()], true);
  return post(x, y, 1.3, 0, 5, 'lo', 8) +
    `<g class="cam-tree"><path class="cam-tree__fill" d="${all}"/><path class="cam-tree__shade" d="${shade}"/><path class="iso-line" data-tone="mid" d="${all}"/></g>`;
}
/** a platform along x, behind the track (−y side), with a lamp post and a coral station marker */
function platformX(x0, x1, y) {
  return box(x0, y - 10, x1 - x0, 10, 0, 4, 'lo', { bevel: 0.5 }) + L(k.segment([x0, y - 1.5, 4], [x1, y - 1.5, 4], P), { tone: 'faint' }) +
    post(x0 + 8, y - 6, 1, 4, 22, 'mid', 8) + box(x0 + 5, y - 9, 6, 6, 26, 3, 'hi', { r: 0.6 }) +
    box(x1 - 14, y - 7, 8, 2, 4, 16, 'mid') + onY(y - 5, x1 - 13, x1 - 7, 12, 19, 'cam-coral');
}
/** the sea along the back-left edge by the first desk: a dark inlay with wave lines, a short pier */
function sea() {
  // the Atlantic along the back-left edge, beside the first desk: a dark inlay with a scalloped coast and wave lines
  const x0 = BOARD.x + 12;
  const y0 = BOARD.y + 14;
  const len = 230;
  const coast = Array.from({ length: 24 }, (_, i) => [x0 + 36 + Math.sin(i * 0.9) * 4, y0 + (len * i) / 23]);
  let s = poly([[x0, y0, 0.2], ...coast.map(([x, y]) => [x, y, 0.2]), [x0, y0 + len, 0.2]], 'cam-sea');
  s += L(k.onTop(coast, 0.25, P), { tone: 'lo' });
  let waves = '';
  for (let i = 0; i < 7; i++) {
    const yy = y0 + 18 + i * 30;
    waves += k.onTop([[x0 + 8, yy], [x0 + 14, yy + 4], [x0 + 20, yy], [x0 + 26, yy + 4]], 0.3, P);
  }
  s += L(waves, { tone: 'mid', className: 'cam-wave' });
  return s;
}

/* ── layout ───────────────────────────────────────────────────────────────────────────────────────────────── */
const MAIN = routeOf([[24, ROW.a], [940, ROW.a], [940, ROW.b], [70, ROW.b]], 110);
const BRANCH = routeOf([[430, ROW.b], [300, ROW.b], [150, ROW.c], [1010, ROW.c]], 100);
const builtEnd = BRANCH.find((o) => o.p[0] > BUILT_TO && o.p[1] > ROW.c - 1).s;
track(MAIN);
track(BRANCH, { to: builtEnd });
track(BRANCH, { built: false, from: builtEnd });
standing.push({ key: depth(24, ROW.a), svg: bufferStop(24 - 8, ROW.a) });
ground.unshift(sea());
for (const [x0, x1, y] of [[60, 160, ROW.a - 16], [330, 450, ROW.a - 16], [660, 800, ROW.a - 16], [420, 700, ROW.b - 16]]) standing.push({ key: depth((x0 + x1) / 2, y - 5), svg: platformX(x0, x1, y) });
for (const [x, y, h] of [[150, -360, 34], [175, -372, 26], [470, -370, 32], [560, -280, 24], [880, -350, 36], [905, -330, 26], [210, -60, 30], [960, -80, 34], [990, -60, 26], [120, 140, 28], [750, 110, 30], [140, 330, 32], [170, 345, 24], [620, 330, 28]]) standing.push({ key: depth(x, y), svg: cypress(x, y, h) });
standing.push({ key: depth(70, ROW.b), svg: bufferStop(70 - 8, ROW.b) });

const STATIONS = {};
const B = [];
function place(id, station, cx, cy, fn) {
  B.push({ id, station, cx, cy });
  (STATIONS[station] ??= []).push(id);
  standing.push({ key: depth(cx, cy), svg: `<g data-building="${id}" data-station="${station}">${fn(cx, cy)}</g>` });
}
place('seed', 'origin', 70, -322, seed);
place('tach', 'tach', 380, -325, cube);
place('ada', 'ada', 720, -330, academy);
place('complia', 'tsoft', 830, -78, complia);
place('tsoft', 'tsoft', 620, -88, tower);
place('tuenti', 'tsoft', 470, -76, tuenti);
place('supernova', 'tsoft', 300, -74, supernova);
const ownRow = [
  ['eclipse', 240, 122], ['agentes', 340, 120], ['kinetic', 440, 122], ['volta', 540, 120], ['velmar', 640, 122],
  ['dentalos', 290, 194], ['games', 390, 196], ['handyx', 490, 194], ['lucero', 590, 196], ['trazo', 690, 194],
];
for (const [id, x, y] of ownRow) place(id, 'own', x, y, OWN[id]);
[['core', 760, 170], ['cyber', 930, 170], ['quant', 790, 330], ['space', 950, 330]].forEach(([id, x, y]) => place(id, 'next', x, y, (a, b) => plot(a, b, 120, 52)));

/* ── where the handcar stops for each station (arc length on the journey: MAIN up to the switch, then BRANCH) ── */
const switchS = near(MAIN, MAIN.find((o) => o.p[1] > ROW.b - 1 && o.p[0] < 430).s).s;
const JOURNEY = [...MAIN.filter((o) => o.s <= switchS), ...BRANCH.filter((o) => o.s <= builtEnd).map((o) => ({ ...o, s: o.s + switchS }))];
const stopAt = (x, y) => JOURNEY.reduce((a, b) => (Math.hypot(b.p[0] - x, b.p[1] - y) < Math.hypot(a.p[0] - x, a.p[1] - y) ? b : a)).s;
const STOPS = {
  origin: stopAt(90, ROW.a),
  tach: stopAt(380, ROW.a),
  ada: stopAt(720, ROW.a),
  tsoft: stopAt(640, ROW.b),
  own: stopAt(440, ROW.c),
  next: builtEnd - 4,
};

/* ── frames: the screen box of each station (its buildings and its stretch of line) ─────────────────────── */
function frameOf(ids, extra = []) {
  const pts = [];
  for (const id of ids) {
    const b = B.find((x) => x.id === id);
    const r = 70;
    for (const [dx, dy] of [[-r, -r], [r, -r], [r, r], [-r, r]]) pts.push(at([b.cx + dx, b.cy + dy, 0]), at([b.cx + dx, b.cy + dy, id === 'tsoft' ? 200 : 80]));
  }
  for (const p of extra) pts.push(at(p));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)].map(r1);
}
const FRAMES = Object.fromEntries(Object.entries(STATIONS).map(([st, ids]) => [st, frameOf(ids, [[...near(JOURNEY, STOPS[st]).p, 0]])]));

/* ── write ────────────────────────────────────────────────────────────────────────────────────────────────── */
standing.sort((a, b) => a.key - b.key);
const car = (along) => `<g class="cam-car" data-car="${along}"${along === 'y' ? ' hidden' : ''}>${handcar(along)}</g>`;
const start = at([...near(JOURNEY, STOPS.origin).p, 0]);
const o0 = at([0, 0, 0]);
const carAt = `<g class="cam-car-at" data-k="${r1(depth(...near(JOURNEY, STOPS.origin).p))}" transform="translate(${r1(start[0] - o0[0])} ${r1(start[1] - o0[1])})">${car('x')}${car('y')}</g>`;
const body = `<g class="cam-world">${board()}<g class="cam-ground">${ground.join('')}</g><g class="cam-stand">${standing.map((i) => `<g data-k="${r1(i.key)}">${i.svg}</g>`).join('')}${carAt}</g></g>`;
const svg = k.figureSvg({ width: W, height: H, label: '', body });
const origin = at([0, 0, 0]);
const journey = JOURNEY.filter((_, i) => i % 2 === 0).map((o) => [...at([...o.p, 0]).map((v) => r1(v - 0)), Math.abs(o.t[0]) >= Math.abs(o.t[1]) ? 0 : 1, r1(o.s)]);
const data = { w: W, h: H, origin: origin.map(r1), depth: JOURNEY.filter((_, i) => i % 2 === 0).map((o) => r1(depth(...o.p))), stops: Object.fromEntries(Object.entries(STOPS).map(([a, s]) => [a, r1(s)])), frames: FRAMES, journey, buildings: Object.fromEntries(B.map((b) => [b.id, frameOf([b.id])])) };

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'camino.svg'), svg);
writeFileSync(join(OUT, 'camino.json'), JSON.stringify(data));

if (PREVIEW) writeFileSync(PREVIEW, k.pageHtml({ title: 'camino', theme: 'light', body: `<style>${readFileSync(join(HERE, '../../components/camino/camino.css'), 'utf8')}body{background:#0a0a0c}.iso-page{max-width:none}</style>${svg}`, width: 1600 }));
console.log('camino.svg', svg.length, 'bytes ·', B.length, 'buildings ·', JOURNEY.length, 'journey points');
