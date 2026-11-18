/**
 * The car of the world of Work (lote 4.3, primera persona). Pure: no DOM and no three.js here, so a test can
 * drive it. Everything is on the plane of the land (x, y in the land's own units; `a` is where the car points,
 * in radians: the way it goes is (cos a, sin a), and its right-hand side is (−sin a, cos a)).
 * Two ways to move it: `drive()` — the wheel and the pedals, with walls you cannot go through — and `pilot()`,
 * which takes it along the path of light to a stop (the way with one button, and the way without holding keys).
 */
export type Car = { x: number; y: number; a: number; v: number; steer: number };
/** `gas` from −1 (brake, then reverse) to 1; `turn` from −1 (left) to 1 (right). */
export type Input = { gas: number; turn: number };
/** A box on the plane you cannot drive through: x0, y0, x1, y1. */
export type Wall = [number, number, number, number];
/** Something round in the way: x, y, radius. */
export type Post = [number, number, number];

export const CAR = { len: 24, wid: 11, r: 7.5, base: 15, top: 190, back: 70, accel: 150, brake: 340, coast: 70, lock: 0.5 };

export const car = (x: number, y: number, a = 0): Car => ({ x, y, a, v: 0, steer: 0 });
/** The shortest way round from angle `a` to angle `b`. */
export const swing = (a: number, b: number) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };

/**
 * One step of `dt` seconds at the wheel. `fence` keeps the car on the land: given a point, it returns that point
 * or the nearest one allowed. Returns how hard the car hit something (0…1; 0 when it did not).
 */
export function drive(c: Car, i: Input, dt: number, walls: Wall[], posts: Post[], fence: (x: number, y: number) => [number, number]): number {
  // the pedals: gas pulls towards the top speed; against the way it goes, it brakes first
  if (i.gas > 0) c.v += (c.v < 0 ? CAR.brake : CAR.accel * (1 - Math.max(0, c.v) / CAR.top)) * i.gas * dt;
  else if (i.gas < 0) c.v += (c.v > 0 ? CAR.brake : CAR.accel * 0.7 * (1 + Math.min(0, c.v) / CAR.back)) * i.gas * dt;
  else { const d = CAR.coast * dt; c.v = Math.abs(c.v) <= d ? 0 : c.v - Math.sign(c.v) * d; }
  c.v = Math.max(-CAR.back, Math.min(CAR.top, c.v));
  // the wheel eases to where it is asked, and turns less the faster the car goes
  const lock = CAR.lock * (1 - 0.55 * Math.min(1, Math.abs(c.v) / CAR.top));
  c.steer += (i.turn * lock - c.steer) * Math.min(1, dt * 9);
  c.a += (c.v / CAR.base) * Math.tan(c.steer) * dt;
  let x = c.x + Math.cos(c.a) * c.v * dt, y = c.y + Math.sin(c.a) * c.v * dt, hit = 0;
  const bump = (nx: number, ny: number, depth: number) => {
    x += nx * depth; y += ny * depth;
    // what the car was doing into the wall is lost; along it, it slides on
    const into = (Math.cos(c.a) * nx + Math.sin(c.a) * ny) * c.v;
    if (into < 0) { hit = Math.max(hit, Math.min(1, -into / CAR.top)); c.v *= 1 - Math.min(0.9, (-into / (Math.abs(c.v) || 1)) * 0.9); }
  };
  for (const w of walls) {
    if (x < w[0] - CAR.r || x > w[2] + CAR.r || y < w[1] - CAR.r || y > w[3] + CAR.r) continue;
    const px = Math.max(w[0], Math.min(w[2], x)), py = Math.max(w[1], Math.min(w[3], y)), dx = x - px, dy = y - py, d = Math.hypot(dx, dy);
    if (d >= CAR.r) continue;
    if (d > 1e-6) bump(dx / d, dy / d, CAR.r - d);
    else {
      // the middle of the car is inside the box: out by the nearest side
      const l = x - w[0], r = w[2] - x, t = y - w[1], b = w[3] - y, m = Math.min(l, r, t, b);
      if (m === l) bump(-1, 0, l + CAR.r); else if (m === r) bump(1, 0, r + CAR.r); else if (m === t) bump(0, -1, t + CAR.r); else bump(0, 1, b + CAR.r);
    }
  }
  for (const p of posts) {
    const dx = x - p[0], dy = y - p[1], d = Math.hypot(dx, dy), gap = CAR.r + p[2];
    if (d < gap && d > 1e-6) bump(dx / d, dy / d, gap - d);
  }
  const [fx, fy] = fence(x, y);
  if (fx !== x || fy !== y) { c.v *= 0.9; x = fx; y = fy; }
  c.x = x; c.y = y;
  return hit;
}

/** A way to follow: its points and how far along the way each one is. */
export type Path = { pts: [number, number][]; at: number[]; length: number };
export function pathOf(pts: [number, number][]): Path {
  const at = [0];
  for (let i = 1; i < pts.length; i++) at.push(at[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, at, length: at[at.length - 1] };
}
/** The point `s` units along the way, and where the way points there. */
export function along(p: Path, s: number): { x: number; y: number; a: number } {
  const t = Math.max(0, Math.min(p.length, s));
  let lo = 0, hi = p.at.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (p.at[m] <= t) lo = m; else hi = m; }
  const a = p.pts[lo], b = p.pts[hi], k = (t - p.at[lo]) / (p.at[hi] - p.at[lo] || 1);
  return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, a: Math.atan2(b[1] - a[1], b[0] - a[0]) };
}
/** How far along the way its nearest point to (x, y) is. */
export function nearest(p: Path, x: number, y: number): number {
  let best = 0, gap = Infinity;
  for (let i = 0; i < p.pts.length - 1; i++) {
    const a = p.pts[i], b = p.pts[i + 1], vx = b[0] - a[0], vy = b[1] - a[1], k = Math.max(0, Math.min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / (vx * vx + vy * vy || 1)));
    const d = Math.hypot(x - a[0] - vx * k, y - a[1] - vy * k);
    if (d < gap) { gap = d; best = p.at[i] + (p.at[i + 1] - p.at[i]) * k; }
  }
  return best;
}

/** A trip on autopilot: where on the way it is, where it goes, how fast, and the place the car joined from. */
export type Pilot = { s: number; to: number; v: number; from: [number, number]; join: number };
export const PILOT = { top: 250, accel: 260, join: 0.55 };
export const trip = (c: Car, p: Path, to: number): Pilot => ({ s: nearest(p, c.x, c.y), to, v: Math.max(0, Math.min(PILOT.top, Math.abs(c.v))), from: [c.x, c.y], join: 0 });
/**
 * One step of a trip. The car speeds up, cruises and slows down so that it stops exactly on its mark; it turns
 * to the way it travels. True when it has arrived (the car is then on the mark, still).
 */
export function pilot(c: Car, t: Pilot, p: Path, dt: number): boolean {
  const left = Math.abs(t.to - t.s), dir = Math.sign(t.to - t.s) || 1;
  // never faster than what still lets it stop in the distance left
  t.v = Math.min(PILOT.top, t.v + PILOT.accel * dt, Math.sqrt(2 * PILOT.accel * left) + 14);
  const go = Math.min(left, t.v * dt);
  t.s += dir * go;
  t.join = Math.min(1, t.join + dt / PILOT.join);
  const q = along(p, t.s), k = t.join * t.join * (3 - 2 * t.join);
  const x = t.from[0] + (q.x - t.from[0]) * k, y = t.from[1] + (q.y - t.from[1]) * k;
  const moved = Math.hypot(x - c.x, y - c.y);
  // it points where it is actually going (while it joins the way, that is not yet the way's own direction)
  const aim = moved > 0.05 ? Math.atan2(y - c.y, x - c.x) : dir > 0 ? q.a : q.a + Math.PI;
  const turn = swing(c.a, aim);
  c.steer = Math.max(-CAR.lock, Math.min(CAR.lock, turn));
  c.a += turn * Math.min(1, dt * 7);
  c.x = x; c.y = y; c.v = dt > 0 ? moved / dt : 0;
  if (left - go > 0.01 || t.join < 1) return false;
  c.v = 0; c.steer = 0;
  return true;
}
