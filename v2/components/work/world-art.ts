import { type BandDef, BANDS, C, INK, LAND, LAYOUT, lum, mix, PAPER, R, tonesOf, type WorldGroup, WORLD_GROUPS } from './world-bands';
import { fromScreen, isle, type Isle, KX, KY, KZ, pt } from './world-kit';

export { WORLD_GROUPS, type WorldGroup };

/**
 * The world of Work, drawn (lote 4.1). ONE continuous land, edge to edge, cut into diagonal bands — a biome per
 * stop of the journey — that is travelled sideways (Ignacio, 18/11/2026: «que cada proyecto tenga un bioma así y
 * que para recorrerlos sea en horizontal»). A path of light crosses them in order: the coast of Mar del Plata,
 * the cities of TACH and Tsoft, the campus of Ada ITW, a band for each project of my own, and the projects to
 * come, under construction: the desert with its oil field and the farmland (Núcleo, two bands).
 * No building is drawn twice. Built once on the server with the Anatomy kit; the map moves over it.
 *  · Every band is a BIOME, not a flat colour: a ground in a soft tone and what lies on it — water, hills,
 *    trees, dunes, streets, fields — in two or three tones of that ground (Ignacio: «mejorá la colorimetría»,
 *    «podés colocarles biomas, como el del inicio»). Saturated colour is kept for the ONE accent of each place.
 *  · What stands on it is ink solids, paper where there is light.
 *  · What is planned is drawn «en obra»: a solid base, the rest in dashed outline, scaffolds, a crane and stakes.
 *  · No text inside the drawing: names, dates and states are HTML (messages → world.places).
 */
export const WORLD_IDS = [...new Set(BANDS.map((b) => b.id))];
export type WorldId = string;
export const WORLD_GROUP_OF: Record<string, WorldGroup> = Object.fromEntries(BANDS.map((b) => [b.id, b.group]));

/*
 * The land: `H` tall; every border leans the same way (x = border + (CY − y) · LEAN), like a ruled sheet seen at
 * an angle. A band is as wide as what stands on it plus `AIR`: room for its biome (Ignacio: «no tengas miedo en
 * darle más espacio a cada zona»).
 */
const { H, CY, LEAN, AIR, STEP, LABEL } = LAND;
const n1 = (v: number) => (Math.round(v * 10) / 10).toString();
const at = (x: number, y: number) => x + (CY - y) * LEAN;
const poly = (l: number, r: number) => `M${n1(at(l, 0))} 0L${n1(at(r, 0))} 0L${n1(at(r, H))} ${H}L${n1(at(l, H))} ${H}Z`;
const el = (x: number, y: number, rx: number, ry: number) => `M${n1(x - rx)} ${n1(y)}A${n1(rx)} ${n1(ry)} 0 1 0 ${n1(x + rx)} ${n1(y)}A${n1(rx)} ${n1(ry)} 0 1 0 ${n1(x - rx)} ${n1(y)}Z`;
const pa = (cls: string, d: string) => `<path class="${cls}" d="${d}"/>`;
const ci = (cls: string, x: number, y: number, r: number) => `<circle class="${cls}" cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}"/>`;
/** A smooth line through points (Catmull-Rom as cubics). */
function pathD(nodes: [number, number][]) {
  let d = `M${nodes[0][0].toFixed(1)} ${nodes[0][1].toFixed(1)}`;
  for (let i = 0; i < nodes.length - 1; i++) {
    const p0 = nodes[Math.max(0, i - 1)], p1 = nodes[i], p2 = nodes[i + 1], p3 = nodes[Math.min(nodes.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * The biome kit: what lies on the ground of a band. Everything is placed by its offset on screen (dx, dy) from
 * the middle of the band — where what stands on it is — so a biome is composed like a picture: the back of the
 * band is up and to the right, its front down and to the left. Round things (ponds, hills, canopies) are drawn
 * straight on screen (a circle on the ground is an ellipse 2:1); what follows the grid (streets, plots, low
 * buildings) goes through the plane. All of it in the tones of the band: --g2 lighter, --g3 darker, --t1/--t2
 * what grows, --wt water.
 */
/** What was asked for and did not fit in its band: it has to stay empty (a test looks). */
export const WORLD_DROPPED: string[] = [];
function feats(I: Isle, b: BandDef, cx: number, cy: number, bw: number) {
  const [sx, sy] = b.shift ?? [0, 0];
  // (dx, dy): dy is how far down the screen from the middle of the band; dx how far right of the band's OWN centre
  // line at that height (it leans with the borders), so a band is always |dx| < bw / 2, front and back alike
  const X = (dx: number, dy: number) => cx + dx + (CY - cy - dy) * LEAN, Y = (dy: number) => cy + dy;
  /** Plane coordinates (for `I`) of a point given by its offset on screen. */
  const plane = (dx: number, dy: number): [number, number] => { const [x, y] = fromScreen(X(dx, dy) - cx, dy); return [x - sx, y - sy]; };
  const shadow = (x: number, y: number, rx: number) => pa('wa-shadow', el(x + rx * 0.4, y + 1, rx, rx * 0.42));
  // nothing may cross a border (the band clips it and a cut tree shows): what does not fit is left out, and counted
  const first = BANDS[0] === b, last = BANDS[BANDS.length - 1] === b;
  const fits = (what: string, dx: number, dy: number, half: number, up = 0) => {
    // what rises goes straight up the screen while the band leans away under it
    const ok = [0, up].every((h) => (first || dx - h * LEAN - half > -bw / 2 + 4) && (last || dx - h * LEAN + half < bw / 2 - STEP - 2)) && cy + dy - up > 2 && cy + dy < H + 30;
    if (!ok) WORLD_DROPPED.push(`${b.id}: ${what} at ${Math.round(dx)}, ${Math.round(dy)}`);
    return ok;
  };
  const g = (what: string, dx: number, dy: number, half: number, up: number, draw: () => string) => (fits(what, dx, dy, half, up) ? draw() : '');
  // where nothing is scattered: what stands on the band, the path in front of it and the name at the bottom
  const zw = ((b.w + b.d) * KX) / 2 + 26, zd = ((b.w + b.d) * KY) / 2 + 20, zu = b.tall ?? 150;
  const free = (dx: number, dy: number) => { const sxr = X(dx, dy) - cx; return !(Math.abs(sxr) < zw && dy > -zu && dy < zd) && !(dy > zd - 6 && dy < zd + 56) && !(dy > 112 && Math.abs(sxr + LABEL) < 150); };
  const F = {
    plane,
    dot: (dx: number, dy: number, r: number, cls: string) => ci(cls, X(dx, dy), Y(dy), r),
    /** Seeded things spread over the band, back to front, never on what stands in the middle. */
    scatter: (seed: number, n: number, make: (dx: number, dy: number, r: number) => string) => {
      let v = seed;
      const next = () => (v = (v * 1664525 + 1013904223) % 4294967296) / 4294967296;
      const got: [number, number, number][] = [];
      for (let i = 0; i < n * 6 && got.length < n; i++) {
        const dy = -cy + 8 + next() * (H - 16), dx = (next() - 0.5) * (bw - 30), r = next();
        if (free(dx, dy)) got.push([Math.round(dx), Math.round(dy), r]);
      }
      return got.sort((p, q) => p[1] - q[1]).map((p) => make(...p)).join('');
    },
    pond: (dx: number, dy: number, rx: number, cls = 'wa-water') => g('pond', dx, dy, rx + 6, 0, () =>
      pa('wa-shore', el(X(dx, dy), Y(dy), rx + 6, rx / 2 + 4)) + pa(cls, el(X(dx, dy), Y(dy), rx, rx / 2)) + pa('wa-glint', `M${n1(X(dx, dy) - rx * 0.5)} ${n1(Y(dy) - rx * 0.12)}h${n1(rx * 0.42)}M${n1(X(dx, dy) - rx * 0.1)} ${n1(Y(dy) + rx * 0.14)}h${n1(rx * 0.5)}`)),
    lake: (parts: [number, number, number][]) => (parts.every(([dx, dy, rx]) => fits('lake', dx, dy, rx + 6)) ?
      parts.map(([dx, dy, rx]) => pa('wa-shore', el(X(dx, dy), Y(dy), rx + 6, rx / 2 + 4))).join('') + parts.map(([dx, dy, rx]) => pa('wa-water', el(X(dx, dy), Y(dy), rx, rx / 2))).join('') +
      pa('wa-glint', parts.map(([dx, dy, rx]) => `M${n1(X(dx, dy) - rx * 0.5)} ${n1(Y(dy) - rx * 0.1)}h${n1(rx * 0.44)}M${n1(X(dx, dy) - rx * 0.05)} ${n1(Y(dy) + rx * 0.16)}h${n1(rx * 0.4)}`).join('')) : ''),
    /** A river: a ribbon through the points, half as wide where it runs across the screen (the ground lies flat). */
    river: (pts: [number, number][], w: number) => {
      const side = (k: number) => pts.map(([dx, dy], i): [number, number] => {
        const a = pts[Math.max(0, i - 1)], c = pts[Math.min(pts.length - 1, i + 1)], len = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1;
        return [X(dx, dy) - ((c[1] - a[1]) / len) * w * 0.5 * k, Y(dy) + ((c[0] - a[0]) / len) * w * 0.34 * k];
      });
      const body = (m: number) => { const L = side(m), Rr = side(-m).reverse(); return `${pathD(L)}L${pathD(Rr).slice(1)}Z`; };
      return pa('wa-shore', body(1.3)) + pa('wa-water', body(1)) + pa('wa-glint', pts.slice(1, -1).map(([dx, dy]) => `M${n1(X(dx, dy) - 16)} ${n1(Y(dy))}h22`).join(''));
    },
    hill: (dx: number, dy: number, r: number, cls = 'wa-hill') => g('hill', dx, dy, r, r * 0.66, () => {
      const x = X(dx, dy), y = Y(dy);
      return pa(cls, `M${n1(x - r)} ${n1(y)}A${n1(r)} ${n1(r * 0.66)} 0 0 1 ${n1(x + r)} ${n1(y)}A${n1(r)} ${n1(r * 0.3)} 0 0 1 ${n1(x - r)} ${n1(y)}Z`) +
        pa('wa-crest', `M${n1(x - r * 0.8)} ${n1(y - r * 0.26)}A${n1(r)} ${n1(r * 0.7)} 0 0 1 ${n1(x - r * 0.1)} ${n1(y - r * 0.62)}`);
    }),
    peak: (dx: number, dy: number, w: number, h: number) => g('peak', dx, dy, w / 2, h, () => {
      const x = X(dx, dy), y = Y(dy);
      return pa('wa-peak', `M${n1(x - w / 2)} ${n1(y)}L${n1(x)} ${n1(y - h)}L${n1(x + w / 2)} ${n1(y)}Z`) + pa('wa-peak2', `M${n1(x)} ${n1(y - h)}L${n1(x + w / 2)} ${n1(y)}L${n1(x + w * 0.12)} ${n1(y)}Z`) +
        pa('wa-snow', `M${n1(x - w * 0.13)} ${n1(y - h * 0.74)}L${n1(x)} ${n1(y - h)}L${n1(x + w * 0.13)} ${n1(y - h * 0.74)}L${n1(x + w * 0.05)} ${n1(y - h * 0.66)}L${n1(x - w * 0.02)} ${n1(y - h * 0.73)}L${n1(x - w * 0.08)} ${n1(y - h * 0.65)}Z`);
    }),
    tree: (dx: number, dy: number, s = 1) => g('tree', dx, dy, 13 * s, 32 * s, () => {
      const x = X(dx, dy), y = Y(dy);
      return shadow(x, y, 10 * s) + pa('wa-trunk', `M${n1(x - 1.5 * s)} ${n1(y)}V${n1(y - 11 * s)}H${n1(x + 1.5 * s)}V${n1(y)}Z`) + ci('wa-leaf', x, y - 19 * s, 11.5 * s) + ci('wa-leaf2', x - 3.2 * s, y - 22.4 * s, 6 * s);
    }),
    pine: (dx: number, dy: number, s = 1) => g('pine', dx, dy, 11 * s, 36 * s, () => {
      const x = X(dx, dy), y = Y(dy), tri = (w: number, y0: number, y1: number, cls: string, half = false) => pa(cls, `M${n1(x - w * s)} ${n1(y - y0 * s)}L${n1(x)} ${n1(y - y1 * s)}L${n1(half ? x : x + w * s)} ${n1(y - y0 * s)}Z`);
      return shadow(x, y, 9 * s) + pa('wa-trunk', `M${n1(x - 1.4 * s)} ${n1(y)}V${n1(y - 7 * s)}H${n1(x + 1.4 * s)}V${n1(y)}Z`) + tri(10, 5, 24, 'wa-leaf') + tri(10, 5, 24, 'wa-leaf2', true) + tri(7.6, 15, 34, 'wa-leaf') + tri(7.6, 15, 34, 'wa-leaf2', true);
    }),
    bush: (dx: number, dy: number, s = 1) => g('bush', dx, dy, 11 * s, 12 * s, () => { const x = X(dx, dy), y = Y(dy); return shadow(x, y, 8 * s) + ci('wa-leaf', x - 4 * s, y - 4 * s, 5.6 * s) + ci('wa-leaf', x + 3.4 * s, y - 5 * s, 6.6 * s) + ci('wa-leaf2', x + 1.6 * s, y - 7.4 * s, 3.4 * s); }),
    rock: (dx: number, dy: number, s = 1) => g('rock', dx, dy, 11 * s, 11 * s, () => {
      const x = X(dx, dy), y = Y(dy), q = (a: number, c: number) => `${n1(x + a * s)} ${n1(y + c * s)}`;
      return shadow(x, y, 9 * s) + pa('wa-rock', `M${q(-9, 0)}L${q(-4, -10)}L${q(5, -9)}L${q(10, -1)}L${q(3, 3)}Z`) + pa('wa-rock2', `M${q(-9, 0)}L${q(-4, -10)}L${q(1, -3)}L${q(3, 3)}Z`);
    }),
    cactus: (dx: number, dy: number, s = 1) => g('cactus', dx, dy, 12 * s, 28 * s, () => {
      const x = X(dx, dy), y = Y(dy), bar = (a: number, c: number, w: number, h: number) => `<rect class="wa-leaf" x="${n1(x + a * s)}" y="${n1(y + c * s)}" width="${n1(w * s)}" height="${n1(h * s)}" rx="${n1((Math.min(w, h) / 2) * s)}"/>`;
      return shadow(x, y, 8 * s) + bar(-3, -26, 6, 26) + bar(-10, -15, 9, 4.4) + bar(-10.4, -21, 4.4, 10) + bar(2, -19, 9, 4.4) + bar(7, -26, 4.4, 11) + pa('wa-cactus2', `M${n1(x - 1.2 * s)} ${n1(y - 23 * s)}V${n1(y - 3 * s)}`);
    }),
    /** A dune: the shadow under its crest. */
    dune: (dx: number, dy: number, r: number) => g('dune', dx, dy, r, r * 0.5, () => { const x = X(dx, dy), y = Y(dy); return pa('wa-dune', `M${n1(x - r)} ${n1(y)}A${n1(r)} ${n1(r * 0.5)} 0 0 1 ${n1(x + r)} ${n1(y)}A${n1(r * 1.16)} ${n1(r * 0.3)} 0 0 0 ${n1(x - r)} ${n1(y)}Z`); }),
    tuft: (dx: number, dy: number) => { const x = X(dx, dy), y = Y(dy); return pa('wa-tuft', `M${n1(x - 3)} ${n1(y)}l-2-6M${n1(x)} ${n1(y)}v-8M${n1(x + 3)} ${n1(y)}l2-6`); },
    /** A plot of ground in another tone, square to the grid. */
    patch: (dx: number, dy: number, w: number, d: number, cls = 'wa-g2') => { const [x, y] = plane(dx, dy); return I.face([[x - w / 2, y - d / 2, 0], [x + w / 2, y - d / 2, 0], [x + w / 2, y + d / 2, 0], [x - w / 2, y + d / 2, 0]], cls); },
    /** A street along one axis of the grid, through a point, from border to border. */
    road: (axis: 'x' | 'y', dx: number, dy: number, w = 15) => {
      const [x, y] = plane(dx, dy);
      return axis === 'x'
        ? I.face([[-R, y - w / 2, 0], [R, y - w / 2, 0], [R, y + w / 2, 0], [-R, y + w / 2, 0]], 'wa-road') + I.line([[-R, y, 0], [R, y, 0]], 'wa-dash')
        : I.face([[x - w / 2, -R, 0], [x + w / 2, -R, 0], [x + w / 2, R, 0], [x - w / 2, R, 0]], 'wa-road') + I.line([[x, -R, 0], [x, R, 0]], 'wa-dash');
    },
    /** A low building in the tones of the ground: the rest of the town, never a place of its own. */
    mass: (dx: number, dy: number, w: number, d: number, h: number) => g('mass', dx, dy, (w + d) * 0.46, h * 1.1 + (w + d) * 0.23, () => { const [x, y] = plane(dx, dy); return I.box(x - w / 2, y - d / 2, w, d, 0, h, { className: 'wa-mass', r: 1.6, crease: 'none' }); }),
    bale: (dx: number, dy: number) => g('bale', dx, dy, 9, 10, () => { const [x, y] = plane(dx, dy); return I.cyl(x, y, 6, 0, 7, { className: 'wa-bale' }); }),
    /** A ring of path on the ground, around the middle of the band. */
    band: (dx: number, dy: number, rx: number, w: number) => pa('wa-g2', `${el(X(dx, dy), Y(dy), rx, rx / 2)}${el(X(dx, dy), Y(dy), rx - w, (rx - w) / 2)}`).replace('<path ', '<path fill-rule="evenodd" '),
    track: (dx: number, dy: number, rx: number) => g('track', dx, dy, rx, rx / 2, () => pa('wa-track', `${el(X(dx, dy), Y(dy), rx, rx / 2)}${el(X(dx, dy), Y(dy), rx - 14, (rx - 14) / 2)}`).replace('<path ', '<path fill-rule="evenodd" ') + pa('wa-lane', el(X(dx, dy), Y(dy), rx - 7, (rx - 7) / 2))),
    umbrella: (dx: number, dy: number, cls: string) => g('umbrella', dx, dy, 12, 22, () => { const x = X(dx, dy), y = Y(dy); return shadow(x, y, 9) + pa('wa-pole', `M${n1(x)} ${n1(y)}V${n1(y - 17)}`) + pa(cls, `M${n1(x - 11)} ${n1(y - 14)}A11 8 0 0 1 ${n1(x + 11)} ${n1(y - 14)}A11 3.4 0 0 1 ${n1(x - 11)} ${n1(y - 14)}Z`); }),
    boat: (dx: number, dy: number) => g('boat', dx, dy, 26, 24, () => { const x = X(dx, dy), y = Y(dy); return `<g class="wl wl-bob" style="--i:${Math.abs(Math.round(dx)) % 5}">` + pa('wa-glint', `M${n1(x - 26)} ${n1(y + 8)}h16M${n1(x + 12)} ${n1(y + 9)}h12`) + pa('wa-ink', `M${n1(x - 13)} ${n1(y)}H${n1(x + 13)}L${n1(x + 8)} ${n1(y + 6)}H${n1(x - 8)}Z`) + pa('wa-lit', `M${n1(x - 1)} ${n1(y - 2)}V${n1(y - 22)}L${n1(x + 11)} ${n1(y - 2)}Z`) + '</g>'; }),
  };
  return F;
}
export type Feats = ReturnType<typeof feats>;

/** The box that holds everything a piece of the drawing paints: every point of its paths, every circle. */
function bounds(svg: string): [number, number, number, number] {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const see = (x: number, y: number, r = 0) => { x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r); x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r); };
  // what turns is drawn in the coordinates of its own plane, around (0, 0): it is not part of the measure
  svg = svg.replace(/<g transform="matrix[^"]*"><g class="[^"]*">.*?<\/g><\/g>/g, '');
  for (const m of svg.matchAll(/ d="([^"]+)"/g)) {
    for (const seg of m[1].matchAll(/([MLCA])([^MLCAZ]*)/g)) {
      const n = (seg[2].match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
      if (seg[1] === 'A') { for (let i = 0; i + 6 < n.length + 1; i += 7) see(n[i + 5], n[i + 6]); } else for (let i = 0; i + 1 < n.length; i += 2) see(n[i], n[i + 1]);
    }
  }
  for (const m of svg.matchAll(/cx="(-?[\d.]+)" cy="(-?[\d.]+)" r="(-?[\d.]+)"/g)) see(Number(m[1]), Number(m[2]), Number(m[3]));
  return [x0, y0, x1, y1];
}

type Built = { i: number; reach: number; id: string; group: WorldGroup; vars: string; ground: string; l: number; r: number; cx: number; cy: number; floor: string; over: string; node: [number, number]; home: [number, number]; under: string; box: [number, number, number, number] };
const built: Built[] = BANDS.map((b, i) => {
  const { l, r, bw, cx, cy } = LAYOUT[i];
  const [ox, oy] = fromScreen(cx, cy), [sx, sy] = b.shift ?? [0, 0];
  const I = isle(ox + sx, oy + sy);
  const t = tonesOf(b), dark = t.dark;
  // what stands free on the ground (poles, wires, scaffolds) is ink on a light band and paper on a dark one
  const vars = `--g0:${b.ground};--g20:${t.g2};--g30:${t.g3};--gs0:${mix(b.ground, INK, 0.42)};--gs20:${mix(b.ground, INK, 0.58)};--gl0:${dark ? mix(b.ground, PAPER, 0.3) : mix(b.ground, INK, 0.2)};--t10:${t.t1};--t20:${t.t2};--wt0:${t.wt};--rk0:${t.rk};--a:${b.accent ?? C.coral};--w0:${dark ? PAPER : INK}`;
  const over = b.draw(I);
  const [x0, y0, x1, y1] = bounds(over);
  return {
    i, reach: (b.w + b.d) * KX * 0.72, id: b.id, group: b.group, vars, ground: b.ground, l, r, cx, cy, under: b.under ?? b.ground,
    // the door of the place: in front of what stands on it, where the path passes
    node: pt(I.T(...(b.node ?? [-sx + b.w / 2 + 12, -sy + b.d / 2 + 12]), 0)),
    // where it stands: the middle of its plot, on the ground
    home: pt(I.T(0, 0, 0)),
    floor: b.floor?.(feats(I, b, cx, cy, bw), I) ?? '',
    over: `<g class="wa-on">${over}</g>`,
    box: [x0, y0, x1, y1],
  };
});
const W = LAYOUT[LAYOUT.length - 1].r;
const of = (id: string) => built.filter((b) => b.id === id);

/** One door per place: where a place takes two bands, between its two. The path of light goes through them in order; dashed where it is still a plan. */
const nodes: [number, number][] = WORLD_IDS.map((id) => { const b = of(id); return [b.reduce((a, c) => a + c.node[0], 0) / b.length, b.reduce((a, c) => a + c.node[1], 0) / b.length]; });
const firstNext = WORLD_IDS.findIndex((id) => WORLD_GROUP_OF[id] === 'next');
const done = nodes.slice(0, firstNext), plan = nodes.slice(firstNext - 1);
const trail =
  `<path class="wa-path-glow" d="${pathD(done)}"/><path class="wa-path" d="${pathD(done)}"/><path class="wa-path wa-path--plan" d="${pathD(plan)}"/>` +
  nodes.map((n, i) => `<circle class="wa-node${i >= firstNext ? ' wa-node--plan' : ''}" cx="${n[0].toFixed(1)}" cy="${n[1].toFixed(1)}" r="5"/>`).join('');

/**
 * The parts of the land carry ids, so a place can be shown again elsewhere on the page with <use> (its card,
 * its stamp) and the drawing travels once: `wbg<i>` the ground of band i with its biome, `wst<i>` what stands on it.
 * Each carries the class `wa` itself: inside a <use> the painting rules (`.wa .iso-fill`…) only see the copied part.
 */
const ground = (b: Built) => {
  const d = poly(b.i === 0 ? b.l - 900 : b.l, b.i === built.length - 1 ? b.r + 900 : b.r);
  return `<g class="wa wa-band" id="wbg${b.i}" data-id="${b.id}" data-group="${b.group}" style="${b.vars}"><clipPath id="wb${b.i}"><path d="${d}"/></clipPath><path class="wa-land" d="${d}"/><g clip-path="url(#wb${b.i})">${b.floor}<ellipse class="wa-glow" fill="url(#wglow)" cx="${n1(b.cx)}" cy="${n1(b.cy + 14)}" rx="${n1(b.reach)}" ry="${n1(b.reach * 0.5)}"/></g></g>`;
};
const stands = (b: Built) => `<g class="wa wa-isle" id="wst${b.i}" data-id="${b.id}" data-group="${b.group}" style="${b.vars}">${b.over}</g>`;
const steps = built.slice(1).map((b) => `<path class="wa-step wa-tone" style="--gs0:${mix(b.ground, INK, 0.42)}" d="${poly(b.l, b.l + STEP)}"/>`).join('');
const byDepth = [...built].sort((a, b) => a.cy - b.cy || a.i - b.i);

export const WORLD_BOX = { x: 0, y: 0, width: W, height: H };
/** The whole land: every ground with its biome, the steps between them, the path, then everything that stands, back to front. */
export const WORLD_SVG =
  '<defs><radialGradient id="wglow"><stop offset="0" stop-color="#ffe7a6" stop-opacity="0.5"/><stop offset="0.55" stop-color="#ffd27a" stop-opacity="0.16"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>' +
  built.map(ground).join('') + steps + trail + byDepth.map(stands).join('');
/** What stands on a place, drawn whole (no reference): for pages that do not carry the land, like a case (lote 5.1). */
export const WORLD_STAND_ART: Record<string, string> = Object.fromEntries(WORLD_IDS.map((id) => [id, of(id).map((b) => `<g class="wa wa-isle" data-id="${b.id}" style="${b.vars}">${b.over}</g>`).join('')]));
const use = (b: Built[], part: 'wbg' | 'wst') => b.map((c) => `<use href="#${part}${c.i}"/>`).join('');
/** One place on its own: a 4:3 window on the land, close to what stands on it (its ground and what stands, by reference). */
export const WORLD_ISLES: Record<string, { svg: string; box: [number, number, number, number]; group: WorldGroup; ground: string }> =
  Object.fromEntries(WORLD_IDS.map((id) => {
    const b = of(id), n = b.length;
    const w = Math.max(400, Math.round(b.reduce((a, c) => a + (BANDS[c.i].w + BANDS[c.i].d) * KX, 0) + 130)), h = Math.min(H, Math.round(w * 0.75));
    const x = Math.max(0, Math.min(W - w, Math.round((b[0].l + b[n - 1].r) / 2 - w / 2))), y = Math.max(0, Math.min(H - h, Math.round(b[0].cy - 46 - h / 2)));
    return [id, { svg: use(b, 'wbg') + use(b, 'wst'), box: [x, y, w, h], group: b[0].group, ground: b[0].ground }];
  }));
/** What stands on a place, alone, with the box that holds it and the colour of its ground: what a stamp is printed from. */
export const WORLD_STANDS: Record<string, { svg: string; box: [number, number, number, number]; ground: string; dark: boolean }> =
  Object.fromEntries(WORLD_IDS.map((id) => {
    const b = of(id), x0 = Math.min(...b.map((c) => c.box[0])), y0 = Math.min(...b.map((c) => c.box[1])), x1 = Math.max(...b.map((c) => c.box[2])), y1 = Math.max(...b.map((c) => c.box[3]));
    return [id, { svg: use(b, 'wst'), box: [Math.floor(x0), Math.floor(y0), Math.ceil(x1 - x0), Math.ceil(y1 - y0)], ground: b[0].ground, dark: lum(b[0].ground) <= 0.3 }];
  }));
export const WORLD_NODES: Record<string, [number, number]> = Object.fromEntries(WORLD_IDS.map((id, i) => [id, [Math.round(nodes[i][0]), Math.round(nodes[i][1])]]));
/**
 * Where to stop on each place, in the order of the journey: `x` is the centre to bring to the middle of the
 * screen, `label` where its name goes (HTML over the drawing, on the ground in front; the point is the bottom
 * of the block), `on` the colour under that name and `ink` the colour to write it in.
 */
export const WORLD_STOPS = WORLD_IDS.map((id) => {
  const b = of(id), mid = (b[0].l + b[b.length - 1].r) / 2, y = H - 14, on = b[0].under;
  // the middle of what stands on the stop, up and down: where a zoomed map looks
  const top = Math.min(...b.map((c) => c.box[1])), bottom = Math.max(...b.map((c) => c.box[3]));
  // a little to the left of the stop (the band leans that way at the bottom), near enough to be in view on a phone when the stop is in the middle
  // for the view from the ground: the door (`node`), the middle of the plot (`home`) and how tall it stands, in land units
  const home: [number, number] = [Math.round(b.reduce((a, c) => a + c.home[0], 0) / b.length), Math.round(b.reduce((a, c) => a + c.home[1], 0) / b.length)];
  return { id, group: b[0].group, node: WORLD_NODES[id], home, tall: Math.round((home[1] - top) / KZ), x: Math.round(mid), y: Math.round((top + bottom) / 2), span: [Math.round(at(b[0].l, H)), Math.round(at(b[b.length - 1].r, 0))] as [number, number], label: [Math.round(mid - LABEL), y] as [number, number], on, ink: lum(on) > 0.18 ? INK : PAPER };
});
/**
 * The whole land in a few shapes, for the minimap: every band in the colour of its ground, the path and a dot
 * per stop (`data-i`, in the order of the journey). Drawn in the land's own units and stretched to its box.
 */
export const WORLD_MINI =
  built.map((b) => `<path d="${poly(b.l, b.r)}" fill="${b.under === b.ground ? b.ground : b.under}"/>`).join('') +
  `<path class="wm-path" d="${pathD(done)}"/><path class="wm-path wm-path--plan" d="${pathD(plan)}"/>` +
  nodes.map((n, i) => `<circle class="wm-stop" data-i="${i}" cx="${n[0].toFixed(0)}" cy="${n[1].toFixed(0)}" r="9"/>`).join('');

/**
 * Life (lote 4.3): who walks and what can be picked up, in the units of the land.
 * People walk the path of light near every stop — in front of what stands there, so nobody is ever drawn over a
 * building — back and forth between two points: `x, y` where they start, `dx, dy` how far they go, `dur` how long
 * one way takes (seconds), `c` what they wear and `ink` the colour of the rest of them on that ground.
 */
const WEAR = [C.coral, C.amber, C.mint, '#5f86ff', '#ff8fc0', '#c79bff'];
export const WORLD_WALKERS = WORLD_IDS.flatMap((id, i) => {
  const n = nodes[i], next = nodes[Math.min(nodes.length - 1, i + 1)], prev = nodes[Math.max(0, i - 1)], on = of(id)[0].ground;
  const ink = lum(on) > 0.18 ? INK : PAPER;
  const leg = (to: [number, number], t0: number, t1: number, side: number, k: number) => {
    const vx = to[0] - n[0], vy = to[1] - n[1], len = Math.hypot(vx, vy) || 1;
    // two lanes, one each side of the path
    const ox = (-vy / len) * side, oy = (vx / len) * side;
    const x = n[0] + vx * t0 + ox, y = n[1] + vy * t0 + oy, dx = vx * (t1 - t0), dy = vy * (t1 - t0);
    return { id, x: Math.round(x), y: Math.round(y), dx: Math.round(dx), dy: Math.round(dy), dur: Math.round((Math.hypot(dx, dy) / 11) * 10) / 10, c: WEAR[(i * 2 + k) % WEAR.length], ink };
  };
  return [
    ...(i < nodes.length - 1 ? [leg(next, 0.07, 0.3, 9, 0)] : []),
    ...(i > 0 ? [leg(prev, 0.06, 0.26, -9, 1)] : [leg(next, 0.34, 0.12, -9, 1)]),
  ];
});
/** Crates left by the path, one per stop (three in the arcade): `x, y` on the land, `c` their colour. To pick up and throw. */
export const WORLD_CRATES = WORLD_IDS.flatMap((id, i) => {
  const n = nodes[i];
  const one = (dx: number, dy: number, k: number) => ({ id, x: Math.round(n[0] + dx), y: Math.round(n[1] + dy), c: WEAR[(i + k * 2 + 3) % WEAR.length] });
  return id === 'games' ? [one(74, 16, 0), one(98, 24, 1), one(84, 34, 2)] : [one(74 + (i % 3) * 8, 18 + (i % 2) * 8, 0)];
});
