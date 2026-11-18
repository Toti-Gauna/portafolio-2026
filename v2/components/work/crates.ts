import { KX, KY, KZ } from './world-kit';

/**
 * The crates of the world of Work (lote 4.3): cubes you pick up, throw and watch tumble. Real 3D, without WebGL:
 * a rigid body in the space of the land (x and y on the ground, z up, in the land's own units) — position,
 * velocity, orientation (a quaternion) and spin — stepped with gravity, a floor that bounces and rubs, and walls
 * at the edges of the land; then its eight corners are projected like everything else in the drawing and the
 * three faces that look at you are painted. Pure: no DOM here (the map draws it; a test throws one).
 */
export type V3 = [number, number, number];
export type Quat = [number, number, number, number]; // x, y, z, w
export type Body = { p: V3; v: V3; q: Quat; w: V3; held: boolean; rest: boolean; calm: number };
/** The land a crate may roam, in the land's own screen units: it bounces back from its edges. */
export type Walls = { x0: number; x1: number; y0: number; y1: number };

export const EDGE = 13; // the side of a crate, in land units
const HALF = EDGE / 2, G = 620, BOUNCE = 0.46, RUB = 0.72;

export const body = (x: number, y: number): Body => ({ p: [x, y, HALF], v: [0, 0, 0], q: [0, 0, 0, 1], w: [0, 0, 0], held: false, rest: true, calm: 0 });

const mul = (a: Quat, b: Quat): Quat => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];
const unit = (q: Quat): Quat => { const n = Math.hypot(...q) || 1; return [q[0] / n, q[1] / n, q[2] / n, q[3] / n]; };
/** Rotate a vector by a quaternion. */
export const turn = (q: Quat, v: V3): V3 => {
  const [x, y, z, w] = q, ix = w * v[0] + y * v[2] - z * v[1], iy = w * v[1] + z * v[0] - x * v[2], iz = w * v[2] + x * v[1] - y * v[0], iw = -x * v[0] - y * v[1] - z * v[2];
  return [ix * w + iw * -x + iy * -z - iz * -y, iy * w + iw * -y + iz * -x - ix * -z, iz * w + iw * -z + ix * -y - iy * -x];
};

/* the 24 ways a cube sits square: a crate at rest eases into the nearest one */
const SQUARE: Quat[] = (() => {
  const out: Quat[] = [], s = Math.SQRT1_2;
  const gen: Quat[] = [[0, 0, 0, 1], [s, 0, 0, s], [0, s, 0, s], [0, 0, s, s]];
  const seen = new Set<string>();
  let frontier: Quat[] = [[0, 0, 0, 1]];
  while (frontier.length) {
    const next: Quat[] = [];
    for (const q of frontier) for (const g of gen) {
      let r = unit(mul(g, q));
      if (r[3] < 0 || (r[3] === 0 && (r[0] < 0 || (r[0] === 0 && (r[1] < 0 || (r[1] === 0 && r[2] < 0)))))) r = [-r[0], -r[1], -r[2], -r[3]];
      const key = r.map((n) => (Math.round(n * 1000) / 1000 || 0).toFixed(3)).join(',');
      if (!seen.has(key)) { seen.add(key); out.push(r); next.push(r); }
    }
    frontier = next;
  }
  return out;
})();
export const SQUARE_COUNT = SQUARE.length;
const nearestSquare = (q: Quat): Quat => {
  let best = SQUARE[0], d = -1;
  for (const s of SQUARE) { const k = Math.abs(q[0] * s[0] + q[1] * s[1] + q[2] * s[2] + q[3] * s[3]); if (k > d) { d = k; best = s; } }
  return q[0] * best[0] + q[1] * best[1] + q[2] * best[2] + q[3] * best[3] < 0 ? [-best[0], -best[1], -best[2], -best[3]] : best;
};

/** How far below its centre the lowest corner of the crate is. */
const drop = (q: Quat) => { const a = turn(q, [HALF, 0, 0]), b = turn(q, [0, HALF, 0]), c = turn(q, [0, 0, HALF]); return Math.abs(a[2]) + Math.abs(b[2]) + Math.abs(c[2]); };

/**
 * One step of `dt` seconds. Returns how hard the crate hit the ground in this step (0 when it did not): the
 * sound of the thud. A crate at rest, or held, is not moved by this.
 */
export function step(b: Body, dt: number, walls: Walls): number {
  if (b.rest || b.held) return 0;
  let hit = 0;
  b.v[2] -= G * dt;
  b.p[0] += b.v[0] * dt; b.p[1] += b.v[1] * dt; b.p[2] += b.v[2] * dt;
  // spin: q ← q + ½ · ω · q · dt
  const [wx, wy, wz] = b.w, d = mul([wx, wy, wz, 0], b.q);
  b.q = unit([b.q[0] + d[0] * 0.5 * dt, b.q[1] + d[1] * 0.5 * dt, b.q[2] + d[2] * 0.5 * dt, b.q[3] + d[3] * 0.5 * dt]);
  const low = b.p[2] - drop(b.q);
  if (low < 0) {
    b.p[2] -= low;
    if (b.v[2] < 0) {
      hit = Math.min(1, -b.v[2] / 420);
      b.v[2] = -b.v[2] * BOUNCE;
      if (b.v[2] < 46) b.v[2] = 0;
      // the ground grips: it slows the slide and turns it into a tumble about the axis across the way it goes
      b.v[0] *= RUB; b.v[1] *= RUB;
      b.w = [b.w[0] * 0.55 - (b.v[1] / HALF) * 0.3, b.w[1] * 0.55 + (b.v[0] / HALF) * 0.3, b.w[2] * 0.6];
    } else { b.v[0] *= 1 - 3 * dt; b.v[1] *= 1 - 3 * dt; }
  }
  // the edges of the land
  const sx = (b.p[0] - b.p[1]) * KX, sy = (b.p[0] + b.p[1]) * KY;
  const ox = sx < walls.x0 ? walls.x0 - sx : sx > walls.x1 ? walls.x1 - sx : 0, oy = sy < walls.y0 ? walls.y0 - sy : sy > walls.y1 ? walls.y1 - sy : 0;
  if (ox || oy) {
    b.p[0] += (ox / KX + oy / KY) / 2; b.p[1] += (oy / KY - ox / KX) / 2;
    const vx = (b.v[0] - b.v[1]) * KX, vy = (b.v[0] + b.v[1]) * KY;
    const rx = ox && Math.sign(vx) !== Math.sign(ox) ? -vx * 0.5 : vx, ry = oy && Math.sign(vy) !== Math.sign(oy) ? -vy * 0.5 : vy;
    b.v[0] = (rx / KX + ry / KY) / 2; b.v[1] = (ry / KY - rx / KX) / 2;
  }
  // on the ground and nearly still: it squares up and stops
  const slow = Math.hypot(...b.v) < 14 && b.p[2] - drop(b.q) < 0.6;
  if (slow) {
    b.calm += dt;
    const to = nearestSquare(b.q), k = Math.min(1, dt * 14);
    b.q = unit([b.q[0] + (to[0] - b.q[0]) * k, b.q[1] + (to[1] - b.q[1]) * k, b.q[2] + (to[2] - b.q[2]) * k, b.q[3] + (to[3] - b.q[3]) * k]);
    b.w = [b.w[0] * 0.8, b.w[1] * 0.8, b.w[2] * 0.8];
    b.v = [b.v[0] * 0.8, b.v[1] * 0.8, 0];
    if (b.calm > 0.34) { b.q = to; b.v = [0, 0, 0]; b.w = [0, 0, 0]; b.p[2] = HALF; b.rest = true; }
  } else b.calm = 0;
  return hit;
}

/** A crate in the hand turns slowly about the vertical, so it shows its faces. */
export function twirl(b: Body, dt: number) {
  const d = mul([0, 0, 2.4, 0], b.q);
  b.q = unit([b.q[0] + d[0] * 0.5 * dt, b.q[1] + d[1] * 0.5 * dt, b.q[2] + d[2] * 0.5 * dt, b.q[3] + d[3] * 0.5 * dt]);
}

/** Let go of a crate with the velocity of the hand (land units per second, on the ground plane). */
export function toss(b: Body, vx: number, vy: number) {
  const speed = Math.min(520, Math.hypot(vx, vy)), k = speed / (Math.hypot(vx, vy) || 1);
  b.v = [vx * k, vy * k, 150 + speed * 0.42];
  // it leaves the hand spinning: about the axis across its way, and a little about the vertical
  b.w = [(-vy * k) / HALF * 0.5, (vx * k) / HALF * 0.5, (speed / 60) * (vx > vy ? 1 : -1)];
  b.held = false; b.rest = false; b.calm = 0;
}

const CORNERS: V3[] = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
const FACES: { at: number[]; n: V3 }[] = [
  { at: [4, 5, 6, 7], n: [0, 0, 1] }, { at: [0, 3, 2, 1], n: [0, 0, -1] },
  { at: [1, 2, 6, 5], n: [1, 0, 0] }, { at: [0, 4, 7, 3], n: [-1, 0, 0] },
  { at: [3, 7, 6, 2], n: [0, 1, 0] }, { at: [0, 1, 5, 4], n: [0, -1, 0] },
];
/** Where the eye is (azimuth 45°, elevation 30°) and where the light comes from. */
const EYE: V3 = [0.6124, 0.6124, 0.5], SUN: V3 = [-0.25, 0.42, 0.87];

/**
 * What to paint: the faces that look at the eye, back to front, each as a path (relative to the point of the
 * ground under the crate) with how lit it is (0…1); and the lift of the crate, for its shadow.
 */
export function faces(b: Body): { d: string; lit: number }[] {
  const pts = CORNERS.map((c) => { const r = turn(b.q, [c[0] * HALF, c[1] * HALF, c[2] * HALF]); return [(r[0] - r[1]) * KX, (r[0] + r[1]) * KY - (r[2] + b.p[2]) * KZ]; });
  return FACES.map((f) => ({ f, n: turn(b.q, f.n) }))
    .filter(({ n }) => n[0] * EYE[0] + n[1] * EYE[1] + n[2] * EYE[2] > 0.001)
    .map(({ f, n }) => ({
      d: `M${f.at.map((i) => `${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`).join('L')}Z`,
      lit: Math.max(0, Math.min(1, 0.5 + 0.5 * (n[0] * SUN[0] + n[1] * SUN[1] + n[2] * SUN[2]))),
    }));
}
