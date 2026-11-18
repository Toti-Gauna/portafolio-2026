import * as k from '@/v2/iso/iso-kit';

/**
 * The drawing kit of the world of Work (lote 4.1): the Anatomy kit plus the few shapes a town needs — roofs,
 * domes, cones, windows, cranes and scaffolds — all in the same isometric projection, all placed in the plane
 * of an island. Solids are ink; `lit` pieces are paper; `acc` is the one accent of each place.
 * Everything returns SVG strings: the world is drawn once, at build time.
 */
export const P: k.Projection = { origin: [0, 0], scale: 1 };
/** One plane unit on screen: along a ground axis, and one unit of height. */
export const KX = 0.8944, KY = 0.4472, KZ = 1.0954, KR = 1.2649;
export type V3 = k.Point3;
type Opt = { tone?: k.Tone; lit?: boolean; className?: string; r?: number; bevel?: number; crease?: k.Tone | 'none' };

const S = k.solidSvg, L = k.lineSvg;
const n1 = (v: number) => (Math.round(v * 10) / 10).toString();
export const pt = (p: V3) => k.iso(p, P);
export const depth = (x: number, y: number) => x + y;
/** Plane coordinates of a point given where it should fall on the drawing (ground level). */
export const fromScreen = (sx: number, sy: number): [number, number] => [(sx / KX + sy / KY) / 2, (sy / KY - sx / KX) / 2];

export function isle(ox: number, oy: number) {
  const T = (x: number, y: number, z: number): V3 => [ox + x, oy + y, z];
  const path = (pts: [number, number, number][], closed = false) => k.pathOf(pts.map((p) => pt(T(...p))), closed);
  const face = (pts: [number, number, number][], cls: string) => `<path class="${cls}" d="${path(pts, true)}"/>`;
  const line = (pts: [number, number, number][], cls = 'wa-l') => `<path class="${cls}" d="${path(pts)}"/>`;
  const plan = (x: number, y: number, w: number, d: number, r: number): k.Plan => ({ x: ox + x, y: oy + y, w, d, r });
  const box = (x: number, y: number, w: number, d: number, z: number, h: number, o: Opt = {}) =>
    S(k.slabOf(plan(x, y, w, d, o.r ?? 1.2), z, h, P, 5, o.bevel ?? 0), { tone: 'hi', ...o });
  const cyl = (cx: number, cy: number, r: number, z: number, h: number, o: Opt = {}) =>
    S(k.cylinder(ox + cx, oy + cy, r, z, h, P, 28, o.bevel ?? 0), { tone: 'hi', ...o });
  const dot = (x: number, y: number, z: number, r: number, cls = 'wa-lit') => { const [cx, cy] = pt(T(x, y, z)); return `<circle class="${cls}" cx="${n1(cx)}" cy="${n1(cy)}" r="${r}"/>`; };
  /** A flat ring on the ground or on a roof. */
  const ring = (cx: number, cy: number, r: number, z: number, cls = 'wa-l') => `<path class="${cls}" d="${k.ring(ox + cx, oy + cy, r, z, P, 36)}"/>`;
  /** A ring standing up, in the plane that faces the viewer's right (`x`) or left (`y`). */
  const wheel = (cx: number, cy: number, cz: number, r: number, axis: 'x' | 'y', cls = 'wa-l') => `<path class="${cls}" d="${k.sideRing(T(cx, cy, cz), r, axis, P, 28)}"/>`;

  /** A pitched roof with its ridge along x. */
  const gable = (x: number, y: number, w: number, d: number, z: number, h: number, cls = '') =>
    face([[x, y, z], [x + w, y, z], [x + w, y + d / 2, z + h], [x, y + d / 2, z + h]], `wa-f3 ${cls}`) +
    face([[x, y + d, z], [x + w, y + d, z], [x + w, y + d / 2, z + h], [x, y + d / 2, z + h]], `wa-f1 ${cls}`) +
    face([[x + w, y, z], [x + w, y + d, z], [x + w, y + d / 2, z + h]], `wa-f2 ${cls}`);
  /** A pitched roof with its ridge along y. */
  const gableY = (x: number, y: number, w: number, d: number, z: number, h: number, cls = '') =>
    face([[x, y, z], [x, y + d, z], [x + w / 2, y + d, z + h], [x + w / 2, y, z + h]], `wa-f3 ${cls}`) +
    face([[x + w, y, z], [x + w, y + d, z], [x + w / 2, y + d, z + h], [x + w / 2, y, z + h]], `wa-f2 ${cls}`) +
    face([[x, y + d, z], [x + w, y + d, z], [x + w / 2, y + d, z + h]], `wa-f1 ${cls}`);
  const pyr = (cx: number, cy: number, hw: number, z: number, h: number, cls = '') =>
    face([[cx - hw, cy + hw, z], [cx + hw, cy + hw, z], [cx, cy, z + h]], `wa-f1 ${cls}`) +
    face([[cx + hw, cy - hw, z], [cx + hw, cy + hw, z], [cx, cy, z + h]], `wa-f2 ${cls}`);
  const cone = (cx: number, cy: number, r: number, z: number, h: number, cls = 'wa-f1') => {
    const [bx, by] = pt(T(cx, cy, z)), [ax, ay] = pt(T(cx, cy, z + h)), rx = r * KR, ry = rx / 2;
    return `<path class="${cls}" d="M${n1(bx - rx)} ${n1(by)}L${n1(ax)} ${n1(ay)}L${n1(bx + rx)} ${n1(by)}A${n1(rx)} ${n1(ry)} 0 0 1 ${n1(bx - rx)} ${n1(by)}Z"/>`;
  };
  const dome = (cx: number, cy: number, r: number, z: number, cls = 'wa-f1') => {
    const [bx, by] = pt(T(cx, cy, z)), R = r * KR;
    return `<path class="${cls}" d="M${n1(bx - R)} ${n1(by)}A${n1(R)} ${n1(R * 0.92)} 0 0 1 ${n1(bx + R)} ${n1(by)}A${n1(R)} ${n1(R / 2)} 0 0 1 ${n1(bx - R)} ${n1(by)}Z"/>` +
      `<path class="wa-hl" d="M${n1(bx - R * 0.62)} ${n1(by - R * 0.5)}A${n1(R * 0.8)} ${n1(R * 0.74)} 0 0 1 ${n1(bx - R * 0.05)} ${n1(by - R * 0.84)}"/>`;
  };
  /** Windows on the face that looks left (y = yF), from x0 to x1 and z0 to z1. Some are lit, by a fixed pattern. */
  const windows = (x0: number, x1: number, yF: number, z0: number, z1: number, cols: number, rows: number, seed = 0) => {
    let on = '', off = '';
    const cw = (x1 - x0) / cols, rh = (z1 - z0) / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const a = x0 + i * cw + cw * 0.22, b = a + cw * 0.56, c = z0 + j * rh + rh * 0.2, e = c + rh * 0.56;
      const d = path([[a, yF, c], [b, yF, c], [b, yF, e], [a, yF, e]], true);
      if ((i * 7 + j * 5 + seed * 3) % 5 < 2) on += d; else off += d;
    }
    return `<path class="wa-win" d="${off}"/><path class="wa-lit" d="${on}"/>`;
  };
  /** Windows on the face that looks right (x = xF). */
  const windowsR = (y0: number, y1: number, xF: number, z0: number, z1: number, cols: number, rows: number, seed = 0) => {
    let on = '', off = '';
    const cw = (y1 - y0) / cols, rh = (z1 - z0) / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const a = y0 + i * cw + cw * 0.22, b = a + cw * 0.56, c = z0 + j * rh + rh * 0.2, e = c + rh * 0.56;
      const d = path([[xF, a, c], [xF, b, c], [xF, b, e], [xF, a, e]], true);
      if ((i * 3 + j * 7 + seed * 5) % 6 < 2) on += d; else off += d;
    }
    return `<path class="wa-win" d="${off}"/><path class="wa-lit" d="${on}"/>`;
  };
  /** The part of a building that is still a drawing: its edges, dashed. */
  const wire = (x: number, y: number, w: number, d: number, z: number, h: number) =>
    `<path class="wa-wire" d="${path([[x, y + d, z], [x, y + d, z + h], [x + w, y + d, z + h], [x + w, y + d, z]])}${path([[x + w, y + d, z + h], [x + w, y, z + h], [x + w, y, z]])}${path([[x, y + d, z + h], [x, y, z + h], [x + w, y, z + h]])}"/>`;
  const scaffold = (x0: number, x1: number, yF: number, z0: number, z1: number, cols: number, rows: number) => {
    let d = '';
    for (let i = 0; i <= cols; i++) { const x = x0 + ((x1 - x0) * i) / cols; d += path([[x, yF, z0], [x, yF, z1]]); }
    for (let j = 1; j <= rows; j++) { const z = z0 + ((z1 - z0) * j) / rows; d += path([[x0, yF, z], [x1, yF, z]]); }
    return `<path class="wa-scaf" d="${d}"/>`;
  };
  /** A tower crane: what says «en obra» from far away. */
  const crane = (x: number, y: number, z: number, h: number, arm: number, along: 'x' | 'y' = 'x') => {
    const tip: [number, number, number] = along === 'x' ? [x + arm, y, z + h] : [x, y + arm, z + h];
    const back: [number, number, number] = along === 'x' ? [x - arm * 0.34, y, z + h] : [x, y - arm * 0.34, z + h];
    const hook: [number, number, number] = along === 'x' ? [x + arm * 0.78, y, z + h] : [x, y + arm * 0.78, z + h];
    return `<path class="wa-crane" d="${path([[x, y, z], [x, y, z + h + 7]])}${path([back, tip])}${path([back, [x, y, z + h + 7], tip])}${path([hook, [hook[0], hook[1], hook[2] - h * 0.42]])}"/>` +
      dot(hook[0], hook[1], hook[2] - h * 0.42, 1.8, 'wa-acc');
  };
  const tree = (cx: number, cy: number, z: number, r = 4) => line([[cx, cy, z], [cx, cy, z + r * 1.3]], 'wa-pole') + dot(cx, cy, z + r * 2.1, r * 1.15, 'wa-tree');
  const flag = (cx: number, cy: number, z: number, h: number) =>
    line([[cx, cy, z], [cx, cy, z + h]], 'wa-pole') + face([[cx, cy, z + h], [cx + 8, cy, z + h - 3], [cx, cy, z + h - 6]], 'wa-acc');
  /** A stake with its ribbon: a lot that is marked, not built. */
  const stake = (cx: number, cy: number, z: number) => line([[cx, cy, z], [cx, cy, z + 7]], 'wa-pole') + dot(cx, cy, z + 7, 1.5, 'wa-acc');
  return { T, path, face, line, box, cyl, dot, ring, wheel, gable, gableY, pyr, cone, dome, windows, windowsR, wire, scaffold, crane, tree, flag, stake, plan };
}
export type Isle = ReturnType<typeof isle>;
export { S as solid, L as lineSvg };
