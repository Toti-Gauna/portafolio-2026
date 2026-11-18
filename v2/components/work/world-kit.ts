import * as k from '@/v2/iso/iso-kit';

/**
 * The drawing kit of the world of Work (lote 4.1): the Anatomy kit plus the few shapes a town needs — roofs,
 * domes, cones, windows, cranes and scaffolds — all in the same isometric projection, all placed on the ground
 * of a band of the land. Solids are ink; `lit` pieces are paper; `acc` is the one accent of each place.
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

/**
 * What a turning part is made of, in the two axes of its plane around its centre (the second axis is up, for a
 * part that stands): described as data, so the drawing and the 3D world build the same thing.
 */
export type Part =
  | { t: 'circle'; r: number; cls: string }
  | { t: 'line'; p: [number, number, number, number]; cls: string }
  | { t: 'dot'; x: number; y: number; r: number; cls: string }
  | { t: 'poly'; p: number[]; cls: string };
export const circle = (r: number, cls: string): Part => ({ t: 'circle', r, cls });
export const seg = (x1: number, y1: number, x2: number, y2: number, cls: string): Part => ({ t: 'line', p: [x1, y1, x2, y2], cls });
export const pip = (x: number, y: number, r: number, cls: string): Part => ({ t: 'dot', x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, r, cls });
export const shape = (p: number[], cls: string): Part => ({ t: 'poly', p, cls });
const partSvg = (p: Part) =>
  p.t === 'circle' ? `<circle class="${p.cls}" r="${p.r}"/>`
    : p.t === 'line' ? `<path class="${p.cls}" d="M${p.p[0]} ${p.p[1]}L${p.p[2]} ${p.p[3]}"/>`
      : p.t === 'dot' ? `<circle class="${p.cls}" cx="${p.x}" cy="${p.y}" r="${p.r}"/>`
        : `<path class="${p.cls}" d="M${p.p.map((v, i) => `${i && i % 2 === 0 ? 'L' : i ? ' ' : ''}${v}`).join('')}Z"/>`;

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
  /** `i` staggers whatever life the dot has (a blink, a puff of smoke): --i, read by the animation's delay. */
  const dot = (x: number, y: number, z: number, r: number, cls = 'wa-lit', i?: number) => { const [cx, cy] = pt(T(x, y, z)); return `<circle class="${cls}"${i === undefined ? '' : ` style="--i:${i}"`} cx="${n1(cx)}" cy="${n1(cy)}" r="${r}"/>`; };
  /**
   * Life (lote 4.3). A part that moves is wrapped in a group with a class `wl wl-…`; the stylesheet animates it,
   * only while its place is on screen. `live` anchors the movement on a point of the world (its transform-origin).
   */
  const live = (cls: string, x: number, y: number, z: number, content: string) => { const [cx, cy] = pt(T(x, y, z)); return `<g class="wl ${cls}" style="transform-origin:${n1(cx)}px ${n1(cy)}px">${content}</g>`; };
  /**
   * A part that turns in a plane of the world: about the vertical ('z': a beam, a shadow), or standing, facing the
   * viewer's left ('y') or right ('x') — a wheel, a reel. `local` is drawn flat, in that plane's own two axes
   * around (0, 0), where a circle is a circle (its `parts`); the outer group lays the plane down in the projection and the
   * inner one turns. So it is a true rotation in space, done with one `rotate`.
   */
  const turn = (axis: 'x' | 'y' | 'z', x: number, y: number, z: number, cls: string, parts: Part[]) => {
    const [cx, cy] = pt(T(x, y, z));
    const m = axis === 'z' ? [KX, KY, -KX, KY] : axis === 'y' ? [KX, KY, 0, -KZ] : [-KX, KY, 0, -KZ];
    return `<g transform="matrix(${m.join(' ')} ${n1(cx)} ${n1(cy)})"><g class="wl ${cls}">${parts.map(partSvg).join('')}</g></g>`;
  };
  /** Many separate strokes in the plane, as one path: the lines of a floor. */
  const lines = (segs: [number, number, number][][], cls = 'wa-l') => `<path class="${cls}" d="${segs.map((s) => path(s)).join('')}"/>`;
  /** Rays around a point, facing the viewer: a sun, a spark, the blades of a windmill. */
  const burst = (x: number, y: number, z: number, r: number, n = 8, cls = 'wa-acc-l') => {
    const [cx, cy] = pt(T(x, y, z));
    let d = '';
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; d += `M${(cx + Math.cos(a) * r * 0.45).toFixed(1)} ${(cy + Math.sin(a) * r * 0.45).toFixed(1)}L${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`; }
    return `<path class="${cls}" d="${d}"/>`;
  };
  /** A five-pointed star, facing the viewer. */
  const star = (x: number, y: number, z: number, r: number, cls = 'wa-acc') => {
    const [cx, cy] = pt(T(x, y, z));
    const p = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i / 10) * Math.PI * 2, q = i % 2 ? r * 0.42 : r; return `${(cx + Math.cos(a) * q).toFixed(1)} ${(cy + Math.sin(a) * q).toFixed(1)}`; });
    return `<path class="${cls}" d="M${p.join('L')}Z"/>`;
  };
  /** The marks of a dial lying flat: twenty-four ticks, every sixth one longer. */
  const ticks = (cx: number, cy: number, r: number, z: number) => {
    const t = k.radialTicks(ox + cx, oy + cy, r, 24, z, 6, [4, 8], P);
    return `<path class="wa-l wa-l--ink" d="${t.minor}"/><path class="wa-l wa-l--ink wa-l--thick" d="${t.major}"/>`;
  };
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
    let on = '', off = '', blink = '';
    const cw = (x1 - x0) / cols, rh = (z1 - z0) / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const a = x0 + i * cw + cw * 0.22, b = a + cw * 0.56, c = z0 + j * rh + rh * 0.2, e = c + rh * 0.56;
      const d = path([[a, yF, c], [b, yF, c], [b, yF, e], [a, yF, e]], true);
      if ((i * 7 + j * 5 + seed * 3) % 5 < 2) { if ((i * 5 + j * 3 + seed) % 4 === 0) blink += d; else on += d; } else off += d;
    }
    return `<path class="wa-win" d="${off}"/><path class="wa-lit" d="${on}"/>${blink ? `<path class="wa-lit wl wl-twinkle" style="--i:${seed}" d="${blink}"/>` : ''}`;
  };
  /** Windows on the face that looks right (x = xF). */
  const windowsR = (y0: number, y1: number, xF: number, z0: number, z1: number, cols: number, rows: number, seed = 0) => {
    let on = '', off = '', blink = '';
    const cw = (y1 - y0) / cols, rh = (z1 - z0) / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const a = y0 + i * cw + cw * 0.22, b = a + cw * 0.56, c = z0 + j * rh + rh * 0.2, e = c + rh * 0.56;
      const d = path([[xF, a, c], [xF, b, c], [xF, b, e], [xF, a, e]], true);
      if ((i * 3 + j * 7 + seed * 5) % 6 < 2) { if ((i * 5 + j * 3 + seed) % 4 === 0) blink += d; else on += d; } else off += d;
    }
    return `<path class="wa-win" d="${off}"/><path class="wa-lit" d="${on}"/>${blink ? `<path class="wa-lit wl wl-twinkle" style="--i:${seed}" d="${blink}"/>` : ''}`;
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
    line([[cx, cy, z], [cx, cy, z + h]], 'wa-pole') + live('wl-wave', cx, cy, z + h - 3, face([[cx, cy, z + h], [cx + 8, cy, z + h - 3], [cx, cy, z + h - 6]], 'wa-acc'));
  /** A stake with its ribbon: a lot that is marked, not built. */
  const stake = (cx: number, cy: number, z: number) => line([[cx, cy, z], [cx, cy, z + 7]], 'wa-pole') + dot(cx, cy, z + 7, 1.5, 'wa-acc');
  return { T, path, face, line, lines, box, cyl, dot, live, turn, burst, star, ticks, ring, wheel, gable, gableY, pyr, cone, dome, windows, windowsR, wire, scaffold, crane, tree, flag, stake, plan };
}
export type Isle = ReturnType<typeof isle>;
export { S as solid, L as lineSvg };
