import * as THREE from 'three';
import type { Feats } from '../world-art';
import { BANDS, C, INK, LAND, LAYOUT, mix, PAPER, R, tonesOf, type BandDef } from '../world-bands';
import { fromScreen, type Isle, KR, KZ, type Part } from '../world-kit';

/**
 * The world of Work in 3D (lote 4.3): the same bands, read a second time. world-bands.ts describes every place
 * through two kits; here those kits do not write SVG — they record triangles. So the tower of Tsoft, the wheel of
 * Tuenti and the lighthouse are in space exactly where the drawing puts them, and nothing is modelled twice.
 * Everything that does not move is merged into three buffers: what the light falls on (one mesh), what glows
 * (windows, accents, the path: one mesh, untouched by the night) and the lines (one). What turns is kept apart.
 * Space: the plane of the land is x / z here, and up is y (a point of the land (x, y, z↑) is (x, z, y)).
 */
type V = [number, number, number];
type RGB = [number, number, number];
const { H, CY, LEAN } = LAND;
const rgb = (hex: string): RGB => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
const SOLID = '#231d5e', ROOF = '#2c2670', WINDOW = '#3a3390', WARM = '#fff3d6', HAY = '#f3dc8a';

/** A box you cannot drive through, on the plane of the land. */
export type Wall = [number, number, number, number];
/** A part that turns: where, about which axis, how, and what it is made of (already coloured). */
export type Spinner = { at: V; axis: 'x' | 'y' | 'z' | 'view'; kind: string; group: THREE.Group };

class Mesher {
  pos: number[] = []; col: number[] = [];
  gpos: number[] = []; gcol: number[] = [];
  lpos: number[] = []; lcol: number[] = [];
  walls: Wall[] = [];
  tri(a: V, b: V, c: V, k: RGB, glow = false) {
    const p = glow ? this.gpos : this.pos, q = glow ? this.gcol : this.col;
    p.push(a[0], a[2], a[1], b[0], b[2], b[1], c[0], c[2], c[1]);
    q.push(...k, ...k, ...k);
  }
  quad(a: V, b: V, c: V, d: V, k: RGB, glow = false) { this.tri(a, b, c, k, glow); this.tri(a, c, d, k, glow); }
  fan(pts: V[], k: RGB, glow = false) { for (let i = 1; i < pts.length - 1; i++) this.tri(pts[0], pts[i], pts[i + 1], k, glow); }
  line(a: V, b: V, k: RGB) { this.lpos.push(a[0], a[2], a[1], b[0], b[2], b[1]); this.lcol.push(...k, ...k); }
  /** A thin square bar between two points: a pole, a boom, a spoke. */
  tube(a: V, b: V, r: number, k: RGB, glow = false) {
    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    if (d.lengthSq() < 1e-6) return;
    const u = new THREE.Vector3().crossVectors(d, Math.abs(d.z) > Math.abs(d.x) + Math.abs(d.y) ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1)).normalize().multiplyScalar(r);
    const w = new THREE.Vector3().crossVectors(d, u).normalize().multiplyScalar(r);
    const ring = (p: V): V[] => [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([s, t]) => [p[0] + u.x * s + w.x * t, p[1] + u.y * s + w.y * t, p[2] + u.z * s + w.z * t]);
    const A = ring(a), B = ring(b);
    for (let i = 0; i < 4; i++) this.quad(A[i], A[(i + 1) % 4], B[(i + 1) % 4], B[i], k, glow);
  }
  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, k: RGB, edge?: RGB) {
    const c = (x: number, y: number, z: number): V => [x, y, z];
    const a = c(x0, y0, z0), b = c(x1, y0, z0), d = c(x1, y1, z0), e = c(x0, y1, z0), A = c(x0, y0, z1), B = c(x1, y0, z1), D = c(x1, y1, z1), E = c(x0, y1, z1);
    this.quad(A, B, D, E, k); this.quad(a, b, B, A, k); this.quad(b, d, D, B, k); this.quad(d, e, E, D, k); this.quad(e, a, A, E, k);
    if (edge) for (const [p, q] of [[A, B], [B, D], [D, E], [E, A], [a, A], [b, B], [d, D], [e, E]] as [V, V][]) this.line(p, q, edge);
  }
  cyl(cx: number, cy: number, r: number, z0: number, z1: number, k: RGB, seg = 14, edge?: RGB, r1 = r) {
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2, b = ((i + 1) / seg) * Math.PI * 2;
      const p0: V = [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z0], p1: V = [cx + Math.cos(b) * r, cy + Math.sin(b) * r, z0];
      const q0: V = [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, z1], q1: V = [cx + Math.cos(b) * r1, cy + Math.sin(b) * r1, z1];
      if (r1 > 0.01) { this.quad(p0, p1, q1, q0, k); this.tri([cx, cy, z1], q0, q1, k); if (edge) this.line(q0, q1, edge); } else this.tri(p0, p1, [cx, cy, z1], k);
    }
  }
  /** An ellipsoid (rx on the ground, rz up); `half` keeps only what is above its centre. */
  ball(cx: number, cy: number, cz: number, rx: number, rz: number, k: RGB, half = false, glow = false, seg = 9, rings = 5) {
    const at = (i: number, j: number): V => { const t = half ? (j / rings) * (Math.PI / 2) : (j / rings) * Math.PI - Math.PI / 2, a = (i / seg) * Math.PI * 2; return [cx + Math.cos(a) * Math.cos(t) * rx, cy + Math.sin(a) * Math.cos(t) * rx, cz + Math.sin(t) * rz]; };
    for (let i = 0; i < seg; i++) for (let j = 0; j < rings; j++) this.quad(at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1), k, glow);
  }
  disc(cx: number, cy: number, r: number, z: number, k: RGB, glow = false, inner = 0, seg = 22) {
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2, b = ((i + 1) / seg) * Math.PI * 2, p = (t: number, q: number): V => [cx + Math.cos(t) * q, cy + Math.sin(t) * q, z];
      if (inner) this.quad(p(a, inner), p(a, r), p(b, r), p(b, inner), k, glow); else this.tri([cx, cy, z], p(a, r), p(b, r), k, glow);
    }
  }
}

const has = (cls: string, word: string) => (` ${cls} `).includes(` ${word} `);
/** Flat things on the ground are laid a hair above it, in this order, so none flickers through another. */
const LIFT: [string, number][] = [['wa-seaf', 0.04], ['wa-shallow', 0.07], ['wa-g2', 0.1], ['wa-g3', 0.1], ['wa-park', 0.13], ['wa-wheat', 0.13], ['wa-road', 0.17], ['wa-px', 0.2]];

type Paint = { ground: string; g2: string; g3: string; gl: string; t1: string; t2: string; wt: string; rk: string; a: string; w: string; dark: boolean };

/** The kit of what is built, recording instead of drawing. Same calls, same numbers as the drawing's. */
function isle3(M: Mesher, spinners: Spinner[], ox: number, oy: number, c: Paint): Isle {
  const T = (x: number, y: number, z: number): V => [ox + x, oy + y, z];
  const ink = rgb(SOLID), paper = rgb(PAPER), edgeOnInk = rgb(mix(SOLID, PAPER, 0.6)), edgeOnPaper = rgb(mix(PAPER, INK, 0.7));
  const lineOf = (cls: string): { k: RGB; r: number; skip?: boolean } => {
    if (has(cls, 'wa-wave') || has(cls, 'wa-ctl') || has(cls, 'wa-floor--wide') || has(cls, 'wa-glint')) return { k: paper, r: 0, skip: true };
    const k = has(cls, 'wa-acc-l') || has(cls, 'wa-corona-l') ? rgb(c.a)
      : has(cls, 'wa-l--hi') || has(cls, 'wa-foam') || has(cls, 'wa-dial') || has(cls, 'wa-floor--dots') ? paper
        : has(cls, 'wa-l--ink') || has(cls, 'wa-gate') || has(cls, 'wa-beamline') || has(cls, 'wa-fan') ? rgb(c.dark ? PAPER : INK)
          : has(cls, 'wa-floor--neon') ? rgb('#a493ff')
            : has(cls, 'wa-floor') ? rgb(c.gl) : has(cls, 'wa-row') ? rgb(c.g3) : has(cls, 'wa-dash') ? rgb(c.g2)
              : has(cls, 'wa-pole') || has(cls, 'wa-wire') || has(cls, 'wa-scaf') || has(cls, 'wa-crane') || has(cls, 'wa-wheel') ? rgb(c.w) : rgb('#6c6790');
    const r = has(cls, 'wa-beamline') ? 1.4 : has(cls, 'wa-gate') ? 1.1 : has(cls, 'wa-wheel') ? 0.65 : has(cls, 'wa-crane') ? 0.7 : has(cls, 'wa-l--thick') ? 0.6 : has(cls, 'wa-pole') || has(cls, 'wa-fan') ? 0.45 : 0;
    return { k, r };
  };
  const stroke = (a: V, b: V, cls: string, glow = false) => { const s = lineOf(cls); if (s.skip) return; if (s.r) M.tube(a, b, s.r, s.k, glow); else M.line(a, b, s.k); };
  const faceOf = (cls: string): { k: RGB; glow: boolean; skip?: boolean } => {
    if (has(cls, 'wa-beam') || has(cls, 'wa-speck')) return { k: paper, glow: false, skip: true };
    if (has(cls, 'wa-acc--soft')) return { k: rgb(mix(c.a, c.ground, 0.5)), glow: false };
    if (has(cls, 'wa-acc')) return { k: rgb(c.a), glow: true };
    if (has(cls, 'wa-px--b')) return { k: rgb('#ff8fc0'), glow: true };
    if (has(cls, 'wa-px--c')) return { k: rgb('#3fe0b0'), glow: true };
    if (has(cls, 'wa-px')) return { k: rgb('#a493ff'), glow: true };
    const hex = has(cls, 'wa-lit') ? PAPER : has(cls, 'wa-win') ? WINDOW : has(cls, 'wa-ink') ? INK : has(cls, 'wa-seaf') ? c.wt : has(cls, 'wa-shallow') ? mix(c.wt, '#ffffff', 0.22)
      : has(cls, 'wa-g2') ? c.g2 : has(cls, 'wa-g3') || has(cls, 'wa-road') ? c.g3 : has(cls, 'wa-park') ? '#9fd3a4' : has(cls, 'wa-wheat') ? '#ecd785' : has(cls, 'wa-f2') ? '#1c1750' : ROOF;
    return { k: rgb(hex), glow: false };
  };
  const face = (pts: [number, number, number][], cls: string) => {
    const f = faceOf(cls);
    if (f.skip) return '';
    const flat = pts.every((p) => p[2] === 0), up = flat ? (LIFT.find(([w]) => has(cls, w))?.[1] ?? 0.1) : 0;
    M.fan(pts.map((p) => { const t = T(...p); return [t[0], t[1], t[2] + up] as V; }), f.k, f.glow);
    return '';
  };
  const line = (pts: [number, number, number][], cls = 'wa-l') => { for (let i = 0; i < pts.length - 1; i++) stroke(T(...pts[i]), T(...pts[i + 1]), cls); return ''; };
  const dot = (x: number, y: number, z: number, r: number, cls = 'wa-lit') => {
    if (has(cls, 'wa-smoke') || has(cls, 'wa-speck') || has(cls, 'wa-petal') || has(cls, 'wa-flower')) return '';
    const p = T(x, y, z), q = r / 1.12;
    if (has(cls, 'wa-corona')) { for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, b = ((i + 1) / 28) * Math.PI * 2, s = Math.SQRT1_2, at = (t: number): V => [p[0] + Math.cos(t) * q * s, p[1] - Math.cos(t) * q * s, p[2] + Math.sin(t) * q]; M.tube(at(a), at(b), 1, rgb(c.a), true); } return ''; }
    const glow = has(cls, 'wa-lit') || has(cls, 'wa-acc') || has(cls, 'wa-star');
    M.ball(p[0], p[1], p[2], q, q, rgb(has(cls, 'wa-acc') ? c.a : has(cls, 'wa-ink') ? INK : has(cls, 'wa-tree') ? c.t1 : PAPER), false, glow, 8, 4);
    return '';
  };
  const box = (x: number, y: number, w: number, d: number, z: number, h: number, o: { lit?: boolean; className?: string } = {}) => {
    const mass = o.className === 'wa-mass';
    M.box(ox + x, oy + y, z, ox + x + w, oy + y + d, z + h, mass ? rgb(c.g2) : o.lit ? paper : ink, mass ? rgb(c.g3) : o.lit ? edgeOnPaper : edgeOnInk);
    if (h > 3 && z < 8 && Math.min(w, d) > 3) M.walls.push([ox + x, oy + y, ox + x + w, oy + y + d]);
    return '';
  };
  const cyl = (cx: number, cy: number, r: number, z: number, h: number, o: { lit?: boolean; className?: string } = {}) => {
    M.cyl(ox + cx, oy + cy, r, z, z + h, o.className === 'wa-bale' ? rgb(HAY) : o.lit ? paper : ink, 14, o.className ? undefined : o.lit ? edgeOnPaper : edgeOnInk);
    if (h > 3 && z < 8 && r > 3) M.walls.push([ox + cx - r * 0.8, oy + cy - r * 0.8, ox + cx + r * 0.8, oy + cy + r * 0.8]);
    return '';
  };
  const ring = (cx: number, cy: number, r: number, z: number, cls = 'wa-l') => { const s = lineOf(cls); if (!s.skip) for (let i = 0; i < 32; i++) { const a = (i / 32) * Math.PI * 2, b = ((i + 1) / 32) * Math.PI * 2; M.line([ox + cx + Math.cos(a) * r, oy + cy + Math.sin(a) * r, z + 0.2], [ox + cx + Math.cos(b) * r, oy + cy + Math.sin(b) * r, z + 0.2], s.k); } return ''; };
  const wheel = (cx: number, cy: number, cz: number, r: number, axis: 'x' | 'y', cls = 'wa-l') => { for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, b = ((i + 1) / 24) * Math.PI * 2, at = (t: number): V => (axis === 'y' ? T(cx + Math.cos(t) * r, cy, cz + Math.sin(t) * r) : T(cx, cy + Math.cos(t) * r, cz + Math.sin(t) * r)); stroke(at(a), at(b), cls); } return ''; };
  const roof = rgb(ROOF), roof2 = rgb('#1c1750');
  const gable = (x: number, y: number, w: number, d: number, z: number, h: number) => {
    const a = T(x, y, z), b = T(x + w, y, z), e = T(x + w, y + d, z), f = T(x, y + d, z), r0 = T(x, y + d / 2, z + h), r1 = T(x + w, y + d / 2, z + h);
    M.quad(a, b, r1, r0, roof); M.quad(f, e, r1, r0, roof); M.tri(b, e, r1, roof2); M.tri(a, f, r0, roof2);
    for (const [p, q] of [[a, r0], [f, r0], [b, r1], [e, r1], [r0, r1]] as [V, V][]) M.line(p, q, edgeOnInk);
    return '';
  };
  const gableY = (x: number, y: number, w: number, d: number, z: number, h: number) => {
    const a = T(x, y, z), b = T(x + w, y, z), e = T(x + w, y + d, z), f = T(x, y + d, z), r0 = T(x + w / 2, y, z + h), r1 = T(x + w / 2, y + d, z + h);
    M.quad(a, f, r1, r0, roof); M.quad(b, e, r1, r0, roof); M.tri(f, e, r1, roof2); M.tri(a, b, r0, roof2);
    for (const [p, q] of [[a, r0], [b, r0], [f, r1], [e, r1], [r0, r1]] as [V, V][]) M.line(p, q, edgeOnInk);
    return '';
  };
  const pyr = (cx: number, cy: number, hw: number, z: number, h: number) => { const top = T(cx, cy, z + h), q = [T(cx - hw, cy - hw, z), T(cx + hw, cy - hw, z), T(cx + hw, cy + hw, z), T(cx - hw, cy + hw, z)]; for (let i = 0; i < 4; i++) M.tri(q[i], q[(i + 1) % 4], top, i % 2 ? roof2 : roof); return ''; };
  const cone = (cx: number, cy: number, r: number, z: number, h: number, cls = 'wa-f1') => { const k = has(cls, 'wa-acc') ? rgb(c.a) : has(cls, 'wa-lit') ? paper : roof; if (h > 0) M.cyl(ox + cx, oy + cy, r, z, z + h, k, 12, undefined, 0); else M.cyl(ox + cx, oy + cy, 0.01, z + h, z, k, 12, undefined, r); return ''; };
  const dome = (cx: number, cy: number, r: number, z: number, cls = 'wa-f1') => { M.ball(ox + cx, oy + cy, z, r, r * 0.92, has(cls, 'wa-lit') ? paper : roof, true, false, 14, 5); return ''; };
  const pane = (a: V, b: V, cc: V, d: V, on: boolean) => M.quad(a, b, cc, d, rgb(on ? WARM : WINDOW), on);
  const windows = (x0: number, x1: number, yF: number, z0: number, z1: number, cols: number, rows: number, seed = 0) => {
    const cw = (x1 - x0) / cols, rh = (z1 - z0) / rows, y = yF + 0.25;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const a = x0 + i * cw + cw * 0.22, b = a + cw * 0.56, lo = z0 + j * rh + rh * 0.2, hi = lo + rh * 0.56; pane(T(a, y, lo), T(b, y, lo), T(b, y, hi), T(a, y, hi), (i * 7 + j * 5 + seed * 3) % 5 < 2); }
    return '';
  };
  const windowsR = (y0: number, y1: number, xF: number, z0: number, z1: number, cols: number, rows: number, seed = 0) => {
    const cw = (y1 - y0) / cols, rh = (z1 - z0) / rows, x = xF + 0.25;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const a = y0 + i * cw + cw * 0.22, b = a + cw * 0.56, lo = z0 + j * rh + rh * 0.2, hi = lo + rh * 0.56; pane(T(x, a, lo), T(x, b, lo), T(x, b, hi), T(x, a, hi), (i * 3 + j * 7 + seed * 5) % 6 < 2); }
    return '';
  };
  const wire = (x: number, y: number, w: number, d: number, z: number, h: number) => { const k = rgb(c.w), q = (a: number, b: number, e: number) => T(x + a * w, y + b * d, z + e * h); for (const [p, r] of [[q(0, 0, 0), q(0, 0, 1)], [q(1, 0, 0), q(1, 0, 1)], [q(1, 1, 0), q(1, 1, 1)], [q(0, 1, 0), q(0, 1, 1)], [q(0, 0, 1), q(1, 0, 1)], [q(1, 0, 1), q(1, 1, 1)], [q(1, 1, 1), q(0, 1, 1)], [q(0, 1, 1), q(0, 0, 1)]] as [V, V][]) M.line(p, r, k); return ''; };
  const scaffold = (x0: number, x1: number, yF: number, z0: number, z1: number, cols: number, rows: number) => {
    const k = rgb(c.w);
    for (let i = 0; i <= cols; i++) { const x = x0 + ((x1 - x0) * i) / cols; M.line(T(x, yF, z0), T(x, yF, z1), k); }
    for (let j = 1; j <= rows; j++) { const z = z0 + ((z1 - z0) * j) / rows; M.line(T(x0, yF, z), T(x1, yF, z), k); }
    return '';
  };
  const crane = (x: number, y: number, z: number, h: number, arm: number, along: 'x' | 'y' = 'x') => {
    const tip = along === 'x' ? T(x + arm, y, z + h) : T(x, y + arm, z + h), back = along === 'x' ? T(x - arm * 0.34, y, z + h) : T(x, y - arm * 0.34, z + h), hook = along === 'x' ? T(x + arm * 0.78, y, z + h) : T(x, y + arm * 0.78, z + h), top = T(x, y, z + h + 7), k = rgb(c.w);
    M.tube(T(x, y, z), top, 0.7, k); M.tube(back, tip, 0.6, k); M.line(back, top, k); M.line(top, tip, k); M.line(hook, [hook[0], hook[1], hook[2] - h * 0.42], k);
    M.ball(hook[0], hook[1], hook[2] - h * 0.42, 1.6, 1.6, rgb(c.a), false, true, 6, 3);
    return '';
  };
  const tree = (cx: number, cy: number, z: number, r = 4) => { M.tube(T(cx, cy, z), T(cx, cy, z + r * 1.4), 0.5, rgb(mix(c.ground, INK, 0.58))); M.ball(ox + cx, oy + cy, z + r * 2.1, r * 1.05, r * 1.05, rgb(c.t1), false, false, 8, 4); return ''; };
  const flag = (cx: number, cy: number, z: number, h: number) => { M.tube(T(cx, cy, z), T(cx, cy, z + h), 0.45, rgb(c.w)); M.tri(T(cx, cy, z + h), T(cx + 8, cy, z + h - 3), T(cx, cy, z + h - 6), rgb(c.a), true); return ''; };
  const stake = (cx: number, cy: number, z: number) => { M.tube(T(cx, cy, z), T(cx, cy, z + 7), 0.35, rgb(c.w)); M.ball(ox + cx, oy + cy, z + 7, 1.3, 1.3, rgb(c.a), false, true, 6, 3); return ''; };
  /** A part that turns is kept as an object of its own, built in the two axes of its plane. */
  const turn = (axis: 'x' | 'y' | 'z', x: number, y: number, z: number, cls: string, parts: Part[]) => {
    const g = new THREE.Group(), sub = new Mesher();
    // in the part's own space: u along the first axis of its plane, v the second, n out of it
    const P2 = (u: number, v: number): V => [u, v, 0];
    for (const p of parts) {
      if (p.t === 'circle') { const s = lineOf(p.cls); for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, b = ((i + 1) / 28) * Math.PI * 2; sub.tube(P2(Math.cos(a) * p.r, Math.sin(a) * p.r), P2(Math.cos(b) * p.r, Math.sin(b) * p.r), Math.max(0.5, s.r), s.k); } }
      else if (p.t === 'line') { const s = lineOf(p.cls); sub.tube(P2(p.p[0], p.p[1]), P2(p.p[2], p.p[3]), Math.max(0.45, s.r), s.k); }
      else if (p.t === 'dot') { const f = faceOf(p.cls); sub.ball(p.x, p.y, 0, p.r, p.r, f.k, false, f.glow, 6, 3); }
      else if (!has(p.cls, 'wa-beam')) { const f = faceOf(p.cls), pts: V[] = []; for (let i = 0; i < p.p.length; i += 2) pts.push(P2(p.p[i], p.p[i + 1])); sub.fan(pts, f.k, f.glow); }
      else { const pts: V[] = []; for (let i = 0; i < p.p.length; i += 2) pts.push(P2(p.p[i], p.p[i + 1])); sub.fan(pts, rgb('#ffe39a'), true); }
    }
    // the mesher writes (x, z, y): here its "y" (v) must land on the second axis of the plane and its "z" on the normal
    const lit = geometry(sub.pos, sub.col), glow = geometry(sub.gpos, sub.gcol);
    const inner = new THREE.Group();
    if (lit) inner.add(new THREE.Mesh(lit, MAT.lit));
    if (glow) inner.add(new THREE.Mesh(glow, has(cls, 'wl-sweep') ? MAT.beam : MAT.glow));
    // sub space is (u, n, v) in three axes (x, y, z). Lay it in the world: 'z' → u = +x, v = +z(three) (the plane's y), n = up;
    // 'y' → u = +x, v = up, n = the plane's y; 'x' → u = the plane's y, v = up, n = +x
    const basis = new THREE.Matrix4();
    if (axis === 'z') basis.makeBasis(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
    else if (axis === 'y') basis.makeBasis(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0));
    else basis.makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0));
    g.applyMatrix4(basis);
    const p = T(x, y, z);
    g.position.set(p[0], p[2], p[1]);
    g.add(inner);
    spinners.push({ at: p, axis, kind: cls, group: inner });
    return '';
  };
  /** Rays and stars face the way the drawing is looked at: in the upright plane across that line of sight. */
  const upright = (x: number, y: number, z: number) => { const p = T(x, y, z), s = Math.SQRT1_2; return (u: number, v: number): V => [p[0] + u * s, p[1] - u * s, p[2] + v]; };
  const burst = (x: number, y: number, z: number, r: number, n = 8, cls = 'wa-acc-l') => {
    const s = lineOf(cls);
    if (has(cls, 'wa-fan')) {
      const g = new THREE.Group(), sub = new Mesher();
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; sub.tube([Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2, 0], [Math.cos(a) * r, Math.sin(a) * r, 0], 0.5, s.k); }
      const lit = geometry(sub.pos, sub.col)!;
      const inner = new THREE.Group(); inner.add(new THREE.Mesh(lit, MAT.lit));
      g.applyMatrix4(new THREE.Matrix4().makeBasis(new THREE.Vector3(Math.SQRT1_2, 0, -Math.SQRT1_2), new THREE.Vector3(Math.SQRT1_2, 0, Math.SQRT1_2), new THREE.Vector3(0, 1, 0)));
      const p = T(x, y, z); g.position.set(p[0], p[2], p[1]); g.add(inner);
      spinners.push({ at: p, axis: 'view', kind: 'wl-rot--fast', group: inner });
      return '';
    }
    const at = upright(x, y, z);
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; M.tube(at(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45), at(Math.cos(a) * r, Math.sin(a) * r), 0.4, s.k, true); }
    return '';
  };
  const star = (x: number, y: number, z: number, r: number) => { const at = upright(x, y, z), pts: V[] = Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 2 + (i / 10) * Math.PI * 2, q = i % 2 ? r * 0.42 : r; return at(Math.cos(a) * q, Math.sin(a) * q); }); for (let i = 0; i < 10; i++) M.tri(at(0, 0), pts[i], pts[(i + 1) % 10], rgb(WARM), true); return ''; };
  const lines = (segs: [number, number, number][][], cls = 'wa-l') => { const s = lineOf(cls); if (!s.skip) for (const g of segs) for (let i = 0; i < g.length - 1; i++) { const a = T(...g[i]), b = T(...g[i + 1]); M.line([a[0], a[1], a[2] + 0.22], [b[0], b[1], b[2] + 0.22], s.k); } return ''; };
  return {
    T, path: () => '', face, line, lines, box, cyl, dot, live: (_c: string, _x: number, _y: number, _z: number, content: string) => content, turn, burst, star, ticks: () => '',
    ring, wheel, gable, gableY, pyr, cone, dome, windows, windowsR, wire, scaffold, crane, tree, flag, stake,
    plan: (x: number, y: number, w: number, d: number, r: number) => ({ x: ox + x, y: oy + y, w, d, r }),
  } as unknown as Isle;
}

/** The kit of the biome, recording. A thing is placed by its offset on the drawing from the middle of its band, as there. */
function feats3(M: Mesher, I: Isle, b: BandDef, cx: number, cy: number, bw: number, c: Paint): Feats {
  const [sx, sy] = b.shift ?? [0, 0];
  const X = (dx: number, dy: number) => cx + dx + (CY - cy - dy) * LEAN;
  /** The point of the land under an offset. */
  const at = (dx: number, dy: number) => fromScreen(X(dx, dy), cy + dy);
  const plane = (dx: number, dy: number): [number, number] => { const [x, y] = fromScreen(X(dx, dy) - cx, dy); return [x - sx, y - sy]; };
  const zw = ((b.w + b.d) * 0.8944) / 2 + 26, zd = ((b.w + b.d) * 0.4472) / 2 + 20, zu = b.tall ?? 150;
  const free = (dx: number, dy: number) => { const sxr = X(dx, dy) - cx; return !(Math.abs(sxr) < zw && dy > -zu && dy < zd) && !(dy > zd - 6 && dy < zd + 56) && !(dy > 112 && Math.abs(sxr + LAND.LABEL) < 150); };
  const t1 = rgb(c.t1), t2 = rgb(c.t2), trunk = rgb(mix(c.ground, INK, 0.58)), water = rgb(c.wt), shore = rgb(c.g2);
  const blob = (dx: number, dy: number, rx: number, k: RGB, lift: number, grow = 0) => { const [x, y] = at(dx, dy); M.disc(x, y, rx / KR + grow, lift, k); };
  const F = {
    plane,
    dot: () => '',
    scatter: (seed: number, n: number, make: (dx: number, dy: number, r: number) => string) => {
      let v = seed;
      const next = () => (v = (v * 1664525 + 1013904223) % 4294967296) / 4294967296;
      const got: [number, number, number][] = [];
      for (let i = 0; i < n * 6 && got.length < n; i++) { const dy = -cy + 8 + next() * (H - 16), dx = (next() - 0.5) * (bw - 30), r = next(); if (free(dx, dy)) got.push([Math.round(dx), Math.round(dy), r]); }
      got.forEach((p) => make(...p));
      return '';
    },
    pond: (dx: number, dy: number, rx: number, cls = 'wa-water') => { blob(dx, dy, rx, shore, 0.12, 5); blob(dx, dy, rx, cls === 'wa-ice' ? rgb(c.wt) : water, 0.16); return ''; },
    lake: (parts: [number, number, number][]) => { parts.forEach(([dx, dy, rx]) => blob(dx, dy, rx, shore, 0.12, 5)); parts.forEach(([dx, dy, rx]) => blob(dx, dy, rx, water, 0.16)); return ''; },
    river: (pts: [number, number][], w: number) => {
      const p = pts.map(([dx, dy]) => at(dx, dy)), half = w * 0.62;
      const side = (i: number, k: number, grow: number): V => { const a = p[Math.max(0, i - 1)], e = p[Math.min(p.length - 1, i + 1)], len = Math.hypot(e[0] - a[0], e[1] - a[1]) || 1; return [p[i][0] - ((e[1] - a[1]) / len) * (half + grow) * k, p[i][1] + ((e[0] - a[0]) / len) * (half + grow) * k, grow ? 0.12 : 0.16]; };
      for (const grow of [4, 0]) for (let i = 0; i < p.length - 1; i++) M.quad(side(i, 1, grow), side(i + 1, 1, grow), side(i + 1, -1, grow), side(i, -1, grow), grow ? shore : water);
      return '';
    },
    hill: (dx: number, dy: number, r: number, cls = 'wa-hill') => { const [x, y] = at(dx, dy); M.ball(x, y, 0, r / KR, (r * 0.66) / KZ, rgb(cls === 'wa-drift' ? c.g2 : c.g3), true, false, 14, 4); return ''; },
    peak: (dx: number, dy: number, w: number, h: number) => {
      const [x, y] = at(dx, dy), r = w / 2 / KR, top = h / KZ;
      const q = (i: number, k: number, z: number): V => { const a = (i / 5) * Math.PI * 2 + 0.6; return [x + Math.cos(a) * r * k, y + Math.sin(a) * r * k, z]; };
      for (let i = 0; i < 5; i++) { M.tri(q(i, 1, 0), q(i + 1, 1, 0), [x, y, top], rgb(i % 2 ? c.g3 : c.g2)); M.tri(q(i, 0.27, top * 0.73 + 0.3), q(i + 1, 0.27, top * 0.73 + 0.3), [x, y, top + 0.3], rgb(PAPER)); }
      return '';
    },
    tree: (dx: number, dy: number, s = 1) => { const [x, y] = at(dx, dy); M.cyl(x, y, 1.4 * s, 0, 11 * s, trunk, 6); M.ball(x, y, 17.5 * s, 10 * s, 10 * s, t1, false, false, 8, 5); M.ball(x - 2.6 * s, y + 2.6 * s, 20.5 * s, 5.4 * s, 5.4 * s, t2, false, false, 7, 4); M.walls.push([x - 2, y - 2, x + 2, y + 2]); return ''; },
    pine: (dx: number, dy: number, s = 1) => { const [x, y] = at(dx, dy); M.cyl(x, y, 1.3 * s, 0, 6 * s, trunk, 6); M.cyl(x, y, 9 * s, 5 * s, 22 * s, t1, 8, undefined, 0); M.cyl(x, y, 6.6 * s, 14 * s, 31 * s, t2, 8, undefined, 0); M.walls.push([x - 2, y - 2, x + 2, y + 2]); return ''; },
    bush: (dx: number, dy: number, s = 1) => { const [x, y] = at(dx, dy); M.ball(x - 3 * s, y + 3 * s, 3.4 * s, 5 * s, 4.4 * s, t1, false, false, 7, 4); M.ball(x + 3 * s, y - 2 * s, 4.2 * s, 5.8 * s, 5 * s, t1, false, false, 7, 4); M.ball(x + 1.5 * s, y, 6.4 * s, 3 * s, 2.8 * s, t2, false, false, 6, 3); return ''; },
    rock: (dx: number, dy: number, s = 1) => { const [x, y] = at(dx, dy); M.ball(x, y, 0, 8 * s, 8 * s, rgb(c.rk), true, false, 5, 2); M.ball(x + 5 * s, y - 4 * s, 0, 4.4 * s, 4 * s, rgb(mix(c.rk, c.g2, 0.3)), true, false, 5, 2); M.walls.push([x - 6 * s, y - 6 * s, x + 6 * s, y + 6 * s]); return ''; },
    cactus: (dx: number, dy: number, s = 1) => {
      const [x, y] = at(dx, dy), u = Math.SQRT1_2;
      M.cyl(x, y, 2.6 * s, 0, 23 * s, t1, 8); M.ball(x, y, 23 * s, 2.6 * s, 2.6 * s, t1, true, false, 8, 3);
      for (const [k, z0, z1] of [[-1, 11, 19], [1, 15, 23]] as [number, number, number][]) { const ax = x + k * 7 * s * u, ay = y - k * 7 * s * u; M.tube([x, y, z0 * s], [ax, ay, z0 * s], 1.6 * s, t1); M.cyl(ax, ay, 1.9 * s, z0 * s, z1 * s, t1, 7); M.ball(ax, ay, z1 * s, 1.9 * s, 1.9 * s, t1, true, false, 7, 3); }
      M.walls.push([x - 2, y - 2, x + 2, y + 2]);
      return '';
    },
    dune: (dx: number, dy: number, r: number) => { const [x, y] = at(dx, dy); M.ball(x, y, 0, r / KR, r * 0.22, rgb(c.g3), true, false, 14, 3); return ''; },
    tuft: (dx: number, dy: number) => { const [x, y] = at(dx, dy); for (const [a, e] of [[-2, -1], [0, 0], [2, 1]]) M.line([x + a, y - a, 0], [x + a + e, y - a - e, 5.5], t1); return ''; },
    patch: (dx: number, dy: number, w: number, d: number, cls = 'wa-g2') => { const [x, y] = plane(dx, dy); return I.face([[x - w / 2, y - d / 2, 0], [x + w / 2, y - d / 2, 0], [x + w / 2, y + d / 2, 0], [x - w / 2, y + d / 2, 0]], cls); },
    road: (axis: 'x' | 'y', dx: number, dy: number, w = 15) => {
      const [x, y] = plane(dx, dy);
      return axis === 'x'
        ? I.face([[-R, y - w / 2, 0], [R, y - w / 2, 0], [R, y + w / 2, 0], [-R, y + w / 2, 0]], 'wa-road') + I.lines([[[-R, y, 0.01], [R, y, 0.01]]], 'wa-dash')
        : I.face([[x - w / 2, -R, 0], [x + w / 2, -R, 0], [x + w / 2, R, 0], [x - w / 2, R, 0]], 'wa-road') + I.lines([[[x, -R, 0.01], [x, R, 0.01]]], 'wa-dash');
    },
    mass: (dx: number, dy: number, w: number, d: number, h: number) => { const [x, y] = plane(dx, dy); return I.box(x - w / 2, y - d / 2, w, d, 0, h, { className: 'wa-mass' }); },
    bale: (dx: number, dy: number) => { const [x, y] = plane(dx, dy); return I.cyl(x, y, 6, 0, 7, { className: 'wa-bale' }); },
    band: (dx: number, dy: number, rx: number, w: number) => { const [x, y] = at(dx, dy); M.disc(x, y, rx / KR, 0.1, shore, false, (rx - w) / KR, 40); return ''; },
    track: (dx: number, dy: number, rx: number) => { const [x, y] = at(dx, dy); M.disc(x, y, rx / KR, 0.14, rgb('#d98866'), false, (rx - 14) / KR, 36); return ''; },
    umbrella: (dx: number, dy: number, cls: string) => { const [x, y] = at(dx, dy); M.tube([x, y, 0], [x, y, 15], 0.4, rgb(c.w)); M.cyl(x, y, 9, 11.5, 16, cls === 'wa-acc' ? rgb(c.a) : rgb(PAPER), 10, undefined, 0); return ''; },
    boat: (dx: number, dy: number) => { const [x, y] = at(dx, dy), u = Math.SQRT1_2; M.box(x - 9, y - 3.2, 0.1, x + 9, y + 3.2, 3.4, rgb(INK)); M.tri([x - 1, y, 3.4], [x - 1, y, 21], [x + 8 * u + 1, y - 8 * u, 3.4], rgb(PAPER)); M.tube([x - 1, y, 3.4], [x - 1, y, 22], 0.3, rgb(INK)); return ''; },
  };
  return F as unknown as Feats;
}

const MAT = {
  lit: new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }),
  glow: new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, toneMapped: false }),
  beam: new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: true, opacity: 0.3, depthWrite: false, toneMapped: false }),
  line: new THREE.LineBasicMaterial({ vertexColors: true }),
};
function geometry(pos: number[], col: number[]) {
  if (!pos.length) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

export type World3D = {
  group: THREE.Group; materials: typeof MAT; spinners: Spinner[]; walls: Wall[];
  /** How much was built: triangles lit, triangles that glow, line segments. */
  count: { lit: number; glow: number; lines: number };
  dispose(): void;
};

/**
 * Builds the whole land. `nodes` are the doors of the stops on the drawing (the path of light goes through
 * them); `firstPlanned` is the first stop that is still a plan (the path is dashed from the one before).
 */
export function buildWorld(nodes: [number, number][], firstPlanned: number): World3D {
  const M = new Mesher(), spinners: Spinner[] = [], group = new THREE.Group();
  BANDS.forEach((b, i) => {
    const { l, r, bw, cx, cy } = LAYOUT[i], t = tonesOf(b);
    const c: Paint = { ground: b.ground, g2: t.g2, g3: t.g3, gl: t.dark ? mix(b.ground, PAPER, 0.3) : mix(b.ground, INK, 0.2), t1: t.t1, t2: t.t2, wt: t.wt, rk: t.rk, a: b.accent ?? C.coral, w: t.dark ? PAPER : INK, dark: t.dark };
    // the ground of the band: its strip of the drawing, carried on far past the drawing's edges (the horizon is land)
    const edge = (x: number, y: number) => { const [px, py] = fromScreen(x + (CY - y) * LEAN, y); return [px, py, 0] as V; };
    const L = i === 0 ? l - 4200 : l, Rr = i === BANDS.length - 1 ? r + 4200 : r;
    M.quad(edge(L, -2600), edge(Rr, -2600), edge(Rr, 3200), edge(L, 3200), rgb(b.ground));
    // the step down from the band before, as a darker strip
    if (i) M.quad([...edge(l, -2600).slice(0, 2), 0.03] as V, [...edge(l + 9, -2600).slice(0, 2), 0.03] as V, [...edge(l + 9, 3200).slice(0, 2), 0.03] as V, [...edge(l, 3200).slice(0, 2), 0.03] as V, rgb(mix(b.ground, INK, 0.2)));
    const [ox, oy] = fromScreen(cx, cy), [sx, sy] = b.shift ?? [0, 0];
    const I = isle3(M, spinners, ox + sx, oy + sy, c);
    b.floor?.(feats3(M, I, b, cx, cy, bw, c), I);
    b.draw(I);
  });
  // the path of light: a ribbon through the door of every stop, and a ring of light on the ground at each door
  const pts = nodes.map(([x, y]) => { const [px, py] = fromScreen(x, y); return new THREE.Vector3(px, 0, py); });
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5), N = pts.length * 26, light = rgb('#ffe39a');
  for (let i = 0; i < N; i++) {
    const t0 = i / N, t1 = (i + 1) / N, planned = t0 * (pts.length - 1) >= firstPlanned - 1;
    if (planned && i % 2) continue;
    const a = curve.getPoint(t0), b = curve.getPoint(t1), n = new THREE.Vector3(-(b.z - a.z), 0, b.x - a.x).normalize().multiplyScalar(planned ? 1.1 : 1.8);
    M.quad([a.x + n.x, a.z + n.z, 0.3], [b.x + n.x, b.z + n.z, 0.3], [b.x - n.x, b.z - n.z, 0.3], [a.x - n.x, a.z - n.z, 0.3], light, true);
  }
  pts.forEach((p, i) => { M.disc(p.x, p.z, 7, 0.34, light, true, 5, 24); if (i < firstPlanned) M.disc(p.x, p.z, 3.4, 0.36, light, true); });
  const lit = geometry(M.pos, M.col)!, glow = geometry(M.gpos, M.gcol)!;
  const lines = new THREE.BufferGeometry();
  lines.setAttribute('position', new THREE.Float32BufferAttribute(M.lpos, 3));
  lines.setAttribute('color', new THREE.Float32BufferAttribute(M.lcol, 3));
  group.add(new THREE.Mesh(lit, MAT.lit), new THREE.Mesh(glow, MAT.glow), new THREE.LineSegments(lines, MAT.line));
  for (const s of spinners) group.add(s.group.parent!);
  return {
    group, materials: MAT, spinners, walls: M.walls, count: { lit: M.pos.length / 9, glow: M.gpos.length / 9, lines: M.lpos.length / 6 },
    dispose() { group.traverse((o) => { const g = (o as THREE.Mesh).geometry as THREE.BufferGeometry | undefined; g?.dispose(); }); },
  };
}
