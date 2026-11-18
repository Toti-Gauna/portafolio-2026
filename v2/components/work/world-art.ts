import * as k from '@/v2/iso/iso-kit';
import { fromScreen, isle, type Isle, KX, KY, P, pt } from './world-kit';

/**
 * The world of Work, drawn (lote 4.1). ONE continuous land, edge to edge, cut into diagonal bands — a biome per
 * stop of the journey — that is travelled sideways (Ignacio, 18/11/2026: «que cada proyecto tenga un bioma así y
 * que para recorrerlos sea en horizontal»). A path of light crosses them in order: the coast of Mar del Plata,
 * the cities of TACH and Tsoft, the campus of Ada ITW, a band for each project of my own, and the roadmap under
 * construction — the desert with its oil field and the farmland (Núcleo, two bands), the bastion
 * (Ciberseguridad), the financial city (Quant) and the launch pad (Aeroespacial).
 * No building is drawn twice. Built once on the server with the Anatomy kit; the engine (lote 4.2) moves over it.
 *  · Every band is a flat colour with a quiet pattern of its own on the ground, ink solids, paper where there
 *    is light and ONE accent.
 *  · What is planned is drawn «en obra»: a solid base, the rest in dashed outline, scaffolds, a crane and stakes.
 *  · No text inside the drawing: names, dates and states are HTML (messages → world.places).
 */
export const WORLD_GROUPS = ['origin', 'work', 'own', 'next'] as const;
export type WorldGroup = (typeof WORLD_GROUPS)[number];
type Draw = (I: Isle) => string;
/**
 * One band of the land. `w` × `d` is the footprint of what stands on it (plane units); `shift` moves the origin
 * of the drawing so that footprint is centred; `floor` is what is painted on the ground, clipped to the band;
 * `under` is the colour below the label when it is not the ground (the sea). Two bands may share an `id`.
 */
type BandDef = { id: string; group: WorldGroup; w: number; d: number; ground: string; accent?: string; ink?: 'dark' | 'light'; draw: Draw; floor?: Draw; node?: [number, number]; shift?: [number, number]; lift?: number; under?: string };

const INK = '#060513', PAPER = '#eeeae3';
const C = { amber: '#ffc247', sand: '#ffd98a', coral: '#ff5a3c', pink: '#ff5fa2', rose: '#ff8fc0', lilac: '#c79bff', mint: '#3fe0b0', lime: '#b6f36a', blue: '#5f86ff', sea: '#2b50ff', cyan: '#58d5ff', orange: '#ffa04a', field: '#9fe870', mist: '#c9c5de', stone: '#9a95b8', night: '#1b1647', paper: PAPER };
const lum = (h: string) => { const c = [1, 3, 5].map((i) => { const v = parseInt(h.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const mix = (a: string, b: string, t: number) => `#${[1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('')}`;
/* what is painted on the ground of a band: long lines in the plane (the band clips them), rings and specks */
const R = 680;
const rows = (I: Isle, axis: 'x' | 'y', step: number, cls = 'wa-floor') => {
  let d = '';
  for (let v = -R; v <= R; v += step) d += axis === 'x' ? I.path([[-R, v, 0], [R, v, 0]]) : I.path([[v, -R, 0], [v, R, 0]]);
  return `<path class="${cls}" d="${d}"/>`;
};
const grid = (I: Isle, step: number) => rows(I, 'x', step) + rows(I, 'y', step);
const rings = (I: Isle, cx: number, cy: number, radii: number[], cls = 'wa-floor') => radii.map((r) => I.ring(cx, cy, r, 0, cls)).join('');
/** Seeded points on the ground, away from what stands in the middle. */
const scatter = (seed: number, n: number, clear: number, make: (x: number, y: number, r: number) => string) => {
  let v = seed, out = '';
  const next = () => (v = (v * 1664525 + 1013904223) % 4294967296) / 4294967296;
  for (let i = 0; i < n * 4 && n > 0; i++) {
    const x = (next() - 0.5) * 2 * 520, y = (next() - 0.5) * 2 * 520, r = next();
    if (Math.abs(x) < clear && Math.abs(y) < clear) continue;
    out += make(Math.round(x), Math.round(y), r);
    n--;
  }
  return out;
};
const rays = (I: Isle, x: number, y: number, z: number, r: number, n = 8, cls = 'wa-acc-l') => {
  const [cx, cy] = pt(I.T(x, y, z));
  let d = '';
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; d += `M${(cx + Math.cos(a) * r * 0.45).toFixed(1)} ${(cy + Math.sin(a) * r * 0.45).toFixed(1)}L${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`; }
  return `<path class="${cls}" d="${d}"/>`;
};
const star = (I: Isle, x: number, y: number, z: number, r: number, cls = 'wa-acc') => {
  const [cx, cy] = pt(I.T(x, y, z));
  const p = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i / 10) * Math.PI * 2, q = i % 2 ? r * 0.42 : r; return `${(cx + Math.cos(a) * q).toFixed(1)} ${(cy + Math.sin(a) * q).toFixed(1)}`; });
  return `<path class="${cls}" d="M${p.join('L')}Z"/>`;
};
/** Stripes on a sloped awning that hangs over the face looking left. */
const awning = (I: Isle, x0: number, x1: number, y: number, z: number, out: number, drop: number, n: number) => {
  let s = '';
  const w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) s += I.face([[x0 + i * w, y, z], [x0 + (i + 1) * w, y, z], [x0 + (i + 1) * w, y + out, z - drop], [x0 + i * w, y + out, z - drop]], i % 2 ? 'wa-lit' : 'wa-acc');
  return s;
};

const BANDS: BandDef[] = [
  /* ── where it began ── */
  { id: 'mdp', group: 'origin', w: 176, d: 150, ground: C.amber, node: [70, 6], under: C.sea, floor: (I) =>
    // the sea takes the front of the band: the shore, and the waves that reach it
    I.face([[-R, 12, 0], [R, 12, 0], [R, R, 0], [-R, R, 0]], 'wa-seaf') + I.line([[-R, 12, 0], [R, 12, 0]], 'wa-foam') +
    Array.from({ length: 22 }, (_, i) => I.line([[-R + ((i * 37) % 48), 28 + i * 17, 0], [R, 28 + i * 17, 0]], 'wa-wave')).join(''),
    draw: (I) => [
      // the lighthouse, and its beam over the sea
      I.cyl(-56, -44, 10, 0, 12), I.cyl(-56, -44, 7.5, 12, 34), I.ring(-56, -44, 7.5, 24, 'wa-l wa-l--hi'), I.ring(-56, -44, 7.5, 35, 'wa-l wa-l--hi'),
      I.cyl(-56, -44, 9.5, 46, 2.5), I.cyl(-56, -44, 5.6, 48.5, 9, { lit: true }), I.cone(-56, -44, 7.4, 57.5, 9, 'wa-f2'),
      I.face([[-56, -44, 53], [58, 30, 64], [58, 30, 36]], 'wa-beam'),
      // the house where the first website was made, its window lit
      I.box(-14, -50, 40, 30, 0, 20), I.gable(-17, -53, 46, 36, 20, 13), I.windows(-10, 22, -20, 5, 15, 3, 1, 1),
      // the first product: a games site
      I.box(44, -30, 14, 12, 0, 24), I.face([[46, -18, 12], [56, -18, 12], [56, -18, 21], [46, -18, 21]], 'wa-acc'), I.line([[48, -18, 8], [54, -18, 8]], 'wa-l wa-l--hi'),
      // the pier
      I.box(8, 4, 12, 62, 0, 4), [18, 34, 50, 66].map((y) => I.line([[20, y, 0], [20, y, -7]], 'wa-l wa-l--hi')).join(''),
      I.line([[-30, -6, 0], [-30, -6, 13]], 'wa-pole'), I.cone(-30, -6, 9, 11, 6, 'wa-acc'),
    ].join('') },

  /* ── the work ── */
  { id: 'tach', group: 'work', w: 136, d: 124, ground: C.coral, accent: C.amber, floor: (I) => grid(I, 46), draw: (I) => [
      I.box(-52, -50, 30, 30, 0, 74), I.windows(-50, -24, -20, 6, 70, 3, 8, 2), I.windowsR(-48, -22, -22, 6, 70, 3, 8, 4),
      I.box(-14, -54, 28, 28, 0, 50), I.box(-10, -50, 20, 20, 50, 8), I.windows(-12, 12, -26, 6, 46, 3, 5, 5), I.windowsR(-52, -28, 14, 6, 46, 3, 5, 1),
      I.box(-54, -10, 30, 24, 0, 34), I.windows(-52, -26, 14, 5, 30, 3, 3, 3), I.windowsR(-8, 12, -24, 5, 30, 2, 3, 2),
      // a wallet you carry: the app, and what moves through it
      I.box(8, 4, 26, 6, 0, 44, { r: 3 }), I.face([[11, 10, 5], [31, 10, 5], [31, 10, 40], [11, 10, 40]], 'wa-lit'),
      I.line([[15, 10, 31], [27, 10, 31]], 'wa-l wa-l--ink'), I.line([[15, 10, 25], [23, 10, 25]], 'wa-l wa-l--ink'), I.face([[15, 10, 9], [27, 10, 9], [27, 10, 17], [15, 10, 17]], 'wa-acc'),
      I.cyl(46, 22, 11, 0, 3.5, { lit: true }), I.ring(46, 22, 7, 3.5, 'wa-l wa-l--ink'), I.cyl(30, 40, 8, 0, 3, { lit: true }), I.ring(30, 40, 4.6, 3, 'wa-l wa-l--ink'),
    ].join('') },

  { id: 'ada', group: 'work', w: 150, d: 128, ground: C.mint, floor: (I) => rows(I, 'y', 34, 'wa-floor wa-floor--wide') + [[-150, -120], [-96, -170], [150, -150], [200, -60], [-190, 40], [-120, 150], [110, 170], [210, 110]].map(([x, y]) => I.tree(x, y, 0, 6)).join(''), draw: (I) => [
      I.tree(-62, -52, 0, 5), I.flag(58, -50, 0, 46),
      // the hall, with its columns
      I.box(-54, -50, 84, 36, 0, 24), I.gable(-58, -54, 92, 44, 24, 15), I.box(-56, -14, 88, 9, 0, 3),
      [-48, -32, -16, 0, 16].map((x) => I.cyl(x + 8, -9, 2.4, 3, 21, { lit: true })).join(''),
      // the blackboard: code, and the line being explained
      I.box(4, 14, 50, 4, 8, 30), I.line([[10, 18, 8], [10, 18, 0]], 'wa-pole'), I.line([[48, 18, 8], [48, 18, 0]], 'wa-pole'),
      [[12, 34, 30], [16, 40, 25], [16, 30, 20], [12, 22, 15]].map(([a, b, z], i) => I.line([[a, 18, z], [b, 18, z]], i === 1 ? 'wa-acc-l' : 'wa-l wa-l--hi')).join(''),
      [-34, -16, 2].map((x, i) => I.cyl(x, 30 + i * 5, 5, 0, 6, { lit: true })).join(''), I.tree(60, 26, 0, 5),
    ].join('') },

  { id: 'tsoft', group: 'work', w: 250, d: 196, ground: C.blue, node: [108, 80], lift: 16, floor: (I) => grid(I, 58), draw: (I) => [
      // Tsoft: the tower
      I.box(-108, -84, 46, 42, 0, 100), I.box(-102, -78, 34, 30, 100, 20), I.line([[-85, -63, 120], [-85, -63, 146]], 'wa-l wa-l--hi'), I.dot(-85, -63, 146, 2.4, 'wa-acc'),
      I.windows(-105, -65, -42, 8, 96, 4, 11, 1), I.windowsR(-81, -45, -62, 8, 96, 4, 11, 2), I.windows(-100, -70, -48, 103, 117, 3, 2, 3),
      // Tuenti: the wheel of prizes
      I.box(-14, -72, 44, 16, 0, 7), I.line([[-8, -64, 7], [8, -64, 40]], 'wa-pole'), I.line([[24, -64, 7], [8, -64, 40]], 'wa-pole'),
      I.wheel(8, -64, 40, 30, 'y', 'wa-wheel'), I.wheel(8, -64, 40, 22, 'y', 'wa-pole'),
      Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return I.line([[8, -64, 40], [8 + Math.cos(a) * 30, -64, 40 + Math.sin(a) * 30]], 'wa-pole') + I.dot(8 + Math.cos(a + 0.39) * 26, -64, 40 + Math.sin(a + 0.39) * 26, 2.2, i % 2 ? 'wa-lit' : 'wa-acc'); }).join(''),
      I.dot(8, -64, 40, 4, 'wa-lit'), I.face([[4, -64, 76], [12, -64, 76], [8, -64, 68]], 'wa-acc'),
      // CompliA: the document, and the answer that passed its checks
      I.box(-100, 14, 44, 32, 0, 58), I.face([[-95, 46, 8], [-61, 46, 8], [-61, 46, 52], [-95, 46, 52]], 'wa-lit'),
      [44, 37, 30, 23, 16].map((z, i) => I.line([[-90, 46, z], [i === 4 ? -76 : -66, 46, z]], i === 2 ? 'wa-acc-l' : 'wa-l wa-l--ink')).join(''),
      I.cyl(-66, 30, 10, 58, 4, { lit: true }), I.line([[-71, 31, 62], [-67, 35, 62], [-60, 26, 62]], 'wa-l wa-l--ink wa-l--thick'),
      // Supernova Eventos: a stage
      I.box(10, 18, 64, 44, 0, 7), I.line([[14, 22, 7], [14, 22, 44], [70, 22, 44], [70, 22, 7]], 'wa-pole wa-l--thick'), I.line([[14, 22, 44], [42, 22, 54], [70, 22, 44]], 'wa-pole'),
      rays(I, 42, 22, 30, 15, 12), I.dot(42, 22, 30, 5, 'wa-acc'),
      I.box(22, 66, 22, 3, 0, 12, { lit: true, r: 2 }), I.line([[36, 69, 2], [36, 69, 10]], 'wa-l wa-l--ink'),
    ].join('') },

  /* ── my own path ── */
  { id: 'eclipse', group: 'own', w: 136, d: 124, ground: C.night, accent: C.amber, ink: 'light', floor: (I) => rings(I, -4, -4, [86, 124, 170, 226, 292], 'wa-floor wa-floor--dots'), draw: (I) => [
      I.ring(-4, -4, 52, 0, 'wa-dial'),
      I.cyl(-14, -14, 30, 0, 22, { lit: true }), I.dome(-14, -14, 30, 22, 'wa-lit'), I.line([[-14, 16, 22], [-14, 4, 46], [-14, -14, 56]], 'wa-l wa-l--ink wa-l--thick'),
      I.box(10, 12, 16, 12, 0, 4, { lit: true }), I.box(14, 22, 16, 12, 0, 2, { lit: true }),
      // the eclipse itself, with its corona
      rays(I, 42, -56, 88, 27, 24, 'wa-corona-l'), I.dot(42, -56, 88, 17, 'wa-corona'), I.dot(42, -56, 88, 14, 'wa-ink'),
    ].join('') },

  { id: 'agentes', group: 'own', w: 134, d: 122, ground: C.pink, accent: PAPER, floor: (I) => rings(I, 0, 0, [82, 84, 150, 152, 230]), draw: (I) => {
      // eleven agents around one table, and the gate where a person decides
      const posts = Array.from({ length: 11 }, (_, i) => { const a = (i / 11) * Math.PI * 2 + 0.3; return { x: Math.cos(a) * 46, y: Math.sin(a) * 42, h: 16 + ((i * 5) % 4) * 4 }; });
      const post = (p: (typeof posts)[number]) => I.line([[0, 0, 12], [p.x, p.y, p.h]], 'wa-l wa-l--hi') + I.cyl(p.x, p.y, 4.4, 0, p.h) + I.dot(p.x, p.y, p.h, 2.2, 'wa-lit');
      const back = posts.filter((p) => p.x + p.y < 0).sort((a, b) => a.x + a.y - (b.x + b.y)), front = posts.filter((p) => p.x + p.y >= 0).sort((a, b) => a.x + a.y - (b.x + b.y));
      return back.map(post).join('') + I.cyl(0, 0, 15, 0, 9, { lit: true }) + I.ring(0, 0, 9, 9, 'wa-l wa-l--ink') + I.dot(0, 0, 9, 3, 'wa-ink') + front.map(post).join('') +
        I.line([[38, 50, 0], [38, 50, 24], [58, 34, 24], [58, 34, 0]], 'wa-gate') + I.dot(48, 42, 24, 3, 'wa-lit');
    } },

  { id: 'kinetic', group: 'own', w: 134, d: 122, ground: C.paper, floor: (I) => rows(I, 'x', 52), draw: (I) => [
      // a spotlight on its tripod
      I.line([[40, -44, 0], [46, -40, 34], [52, -44, 0]], 'wa-pole'), I.line([[46, -34, 0], [46, -40, 34]], 'wa-pole'), I.cyl(46, -40, 7, 34, 9), I.face([[46, -40, 38], [-30, 36, 6], [0, 52, 6]], 'wa-beam'),
      // the clapperboard
      I.box(-50, -18, 64, 7, 0, 40), I.face([[-46, -11, 4], [10, -11, 4], [10, -11, 36], [-46, -11, 36]], 'wa-win'),
      [28, 20, 12].map((z, i) => I.line([[-40, -11, z], [i === 2 ? -16 : 4, -11, z]], 'wa-l wa-l--hi')).join(''),
      I.box(-50, -18, 64, 7, 42, 9), Array.from({ length: 5 }, (_, i) => I.face([[-48 + i * 12, -11, 43], [-42 + i * 12, -11, 43], [-38 + i * 12, -11, 50], [-44 + i * 12, -11, 50]], 'wa-lit')).join(''),
      // a reel
      I.box(24, 26, 26, 8, 0, 4), I.wheel(37, 30, 22, 17, 'y', 'wa-wheel'), I.wheel(37, 30, 22, 5, 'y', 'wa-l wa-l--ink'),
      Array.from({ length: 5 }, (_, i) => { const a = (i / 5) * Math.PI * 2 + 0.4; return I.dot(37 + Math.cos(a) * 10.5, 30, 22 + Math.sin(a) * 10.5, 2.6, 'wa-acc'); }).join(''),
    ].join('') },

  { id: 'volta', group: 'own', w: 134, d: 118, ground: C.lime, floor: (I) => scatter(7, 46, 86, (x, y, r) => I.dot(x, y, 0, 1.6 + r * 2.4, 'wa-speck')), draw: (I) => [
      I.box(-52, -44, 60, 38, 0, 28), I.windowsR(-40, -10, 8, 6, 24, 2, 2, 1), I.face([[-28, -6, 0], [-14, -6, 0], [-14, -6, 15], [-28, -6, 15]], 'wa-lit'),
      awning(I, -52, 8, -6, 23, 13, 7, 6),
      // the jar, and what it promises
      I.cyl(36, -22, 15, 0, 32), I.ring(36, -22, 15, 22, 'wa-l wa-l--hi'), I.ring(36, -22, 15, 9, 'wa-l wa-l--hi'), I.cyl(36, -22, 10, 32, 6, { lit: true }),
      I.face([[35, -7, 21], [41, -7, 21], [37, -7, 15.5], [42, -7, 15.5], [33, -7, 9.5], [36.5, -7, 14], [32, -7, 14]], 'wa-acc'),
      // a weight to lift
      I.cyl(6, 34, 6, 0, 9, { lit: true }), I.cyl(30, 34, 6, 0, 9, { lit: true }), I.line([[6, 34, 5], [30, 34, 5]], 'wa-l wa-l--ink wa-l--thick'),
    ].join('') },

  { id: 'velmar', group: 'own', w: 134, d: 118, ground: C.cyan, floor: (I) => rows(I, 'y', 26), draw: (I) => [
      // the workshop: a saw-tooth roof and a chimney
      I.box(-54, -44, 72, 40, 0, 22), I.gableY(-54, -44, 36, 40, 22, 13), I.gableY(-18, -44, 36, 40, 22, 13),
      I.cyl(24, -36, 4.2, 0, 44), I.dot(27, -39, 52, 3.4, 'wa-smoke'), I.dot(31, -43, 60, 4.6, 'wa-smoke'), I.dot(37, -48, 70, 6, 'wa-smoke'),
      I.face([[-44, -4, 0], [-22, -4, 0], [-22, -4, 16], [-44, -4, 16]], 'wa-lit'), I.windows(-14, 14, -4, 6, 17, 2, 1, 2),
      // made to order: a gift, with its ribbon
      I.box(22, 14, 26, 24, 0, 18, { lit: true }), I.line([[35, 14, 18], [35, 38, 18], [35, 38, 0]], 'wa-acc-l wa-l--thick'), I.line([[22, 26, 18], [48, 26, 18], [48, 26, 0]], 'wa-acc-l wa-l--thick'),
      I.dot(32, 26, 23, 3.4, 'wa-acc'), I.dot(38, 26, 23, 3.4, 'wa-acc'),
    ].join('') },

  { id: 'dentalos', group: 'own', w: 130, d: 118, ground: C.mist, floor: (I) => grid(I, 28), draw: (I) => [
      I.box(-50, -44, 62, 40, 0, 32), I.windows(-46, 8, -4, 16, 28, 4, 1, 3), I.windowsR(-40, -8, 12, 6, 28, 2, 2, 5), I.face([[-26, -4, 0], [-12, -4, 0], [-12, -4, 12], [-26, -4, 12]], 'wa-lit'),
      // the sign of a clinic
      I.box(-22, -26, 6, 6, 32, 16, { lit: true, r: 1 }), I.face([[-25, -20, 37], [-13, -20, 37], [-13, -20, 43], [-25, -20, 43]], 'wa-acc'), I.face([[-22, -20, 34], [-16, -20, 34], [-16, -20, 46], [-22, -20, 46]], 'wa-acc'),
      // a tooth, on its plinth
      I.cyl(34, 16, 15, 0, 5), I.cyl(28, 16, 4.2, 5, 13, { lit: true }), I.cyl(40, 16, 4.2, 5, 13, { lit: true }), I.box(22, 8, 24, 16, 16, 17, { lit: true, r: 7 }), I.line([[30, 24, 30], [34, 24, 27], [38, 24, 30]], 'wa-l wa-l--ink'),
    ].join('') },

  { id: 'games', group: 'own', w: 138, d: 122, ground: C.lilac, floor: (I) => scatter(11, 40, 90, (x, y, r) => { const q = 6 + Math.round(r * 2) * 6, a = Math.round(x / 12) * 12, b = Math.round(y / 12) * 12; return I.face([[a, b, 0], [a + q, b, 0], [a + q, b + q, 0], [a, b + q, 0]], 'wa-speck'); }), draw: (I) => [
      // the projector is the screen
      I.line([[-50, -36, 0], [-50, -36, 10]], 'wa-pole'), I.line([[22, -36, 0], [22, -36, 10]], 'wa-pole'),
      I.box(-58, -40, 88, 6, 10, 54), I.face([[-54, -34, 14], [26, -34, 14], [26, -34, 60], [-54, -34, 60]], 'wa-lit'),
      I.line([[-44, -34, 24], [-44, -34, 38]], 'wa-l wa-l--ink wa-l--thick'), I.line([[16, -34, 34], [16, -34, 48]], 'wa-l wa-l--ink wa-l--thick'), I.dot(-10, -34, 40, 3.4, 'wa-acc'),
      I.face([[2, 22, 12], [-54, -34, 14], [26, -34, 60]], 'wa-beam'), I.box(-6, 18, 18, 14, 0, 6), I.box(-4, 20, 14, 10, 6, 7), I.dot(2, 20, 10, 2.4, 'wa-lit'),
      // and the phones of the crowd, the controllers
      [[30, 30], [46, 14], [52, 40]].map(([x, y]) => I.line([[x + 3, y + 5, 3], [-14, -34, 36]], 'wa-ctl') + I.box(x, y, 8, 13, 0, 2.4, { lit: true, r: 2 })).join(''),
    ].join('') },

  { id: 'lucero', group: 'own', w: 134, d: 118, ground: C.orange, accent: PAPER, floor: (I) => rows(I, 'x', 40) + rows(I, 'y', 160), draw: (I) => [
      I.box(-52, -44, 66, 34, 0, 26), I.windowsR(-38, -14, 14, 6, 22, 2, 2, 3), awning(I, -52, 14, -10, 21, 12, 6, 6), I.face([[-22, -10, 0], [-8, -10, 0], [-8, -10, 14], [-22, -10, 14]], 'wa-lit'),
      // the morning star over the door
      I.line([[26, -38, 0], [26, -38, 58]], 'wa-pole'), star(I, 26, -38, 66, 11, 'wa-lit'),
      // tables you order from
      [[-10, 26], [18, 10], [38, 34]].map(([x, y], i) => I.cyl(x, y, 2, 0, 8) + I.cyl(x, y, 9, 8, 2, { lit: true }) + I.box(x - 3, y - 3, 6, 6, 10, 0.6, { r: 0.6 }) + I.cyl(x + 13, y - 2 + i * 2, 3.4, 0, 5) + I.cyl(x - 4, y + 13, 3.4, 0, 5)).join(''),
    ].join('') },

  { id: 'trazo', group: 'own', w: 130, d: 118, ground: C.rose, accent: C.sea, floor: (I) => rings(I, 0, 0, [70, 104, 146, 200, 268]), draw: (I) => {
      // the day in hours: a sundial
      const t = k.radialTicks(I.T(0, 0, 0)[0], I.T(0, 0, 0)[1], 43, 24, 6, 6, [4, 8], P);
      return [
        I.cyl(0, 0, 46, 0, 6, { lit: true }), `<path class="wa-l wa-l--ink" d="${t.minor}"/><path class="wa-l wa-l--ink wa-l--thick" d="${t.major}"/>`, I.ring(0, 0, 28, 6, 'wa-l wa-l--ink'),
        I.face([[0, 0, 6], [30, 26, 6], [12, 34, 6]], 'wa-acc wa-acc--soft'), I.face([[0, -30, 6], [0, 6, 6], [0, 6, 40]], 'wa-f2'), I.line([[0, -30, 6], [0, 6, 40], [0, 6, 6]], 'wa-l wa-l--hi'),
        // a goal reached
        I.flag(-30, 28, 6, 26), I.dot(18, -30, 6, 3, 'wa-ink'), I.dot(-34, -10, 6, 3, 'wa-ink'),
      ].join('');
    } },

  /* ── the roadmap, under construction ── */
  { id: 'nucleo', group: 'next', w: 132, d: 136, ground: C.sand, shift: [65, 0], node: [-10, 76],
    floor: (I) => scatter(3, 30, 0, (x, y, r) => I.ring(x, y, 9 + r * 16, 0, 'wa-dune')),
    draw: (I) => [
      // the desert: storage, a derrick still on paper, and the pump that already nods
      I.cyl(-104, -44, 14, 0, 12), I.ring(-104, -44, 14, 6, 'wa-l wa-l--hi'), `<path class="wa-wire" d="${k.ring(I.T(-104, -44, 0)[0], I.T(-104, -44, 0)[1], 14, 26, P, 28)}"/>` + I.line([[-118, -44, 12], [-118, -44, 26]], 'wa-wire') + I.line([[-90, -44, 12], [-90, -44, 26]], 'wa-wire'),
      [[-60, -52], [-36, -52], [-36, -28], [-60, -28]].map(([x, y]) => I.line([[x, y, 0], [-48, -40, 70]], 'wa-wire')).join(''),
      [18, 36, 52].map((z) => { const s = 12 * (1 - z / 70); return I.line([[-48 - s, -40 - s, z], [-48 + s, -40 - s, z], [-48 + s, -40 + s, z], [-48 - s, -40 + s, z], [-48 - s, -40 - s, z]], 'wa-wire'); }).join(''),
      I.box(-92, 4, 46, 12, 0, 4), I.line([[-80, 10, 4], [-70, 10, 28], [-60, 10, 4]], 'wa-pole wa-l--thick'), I.line([[-96, 10, 23], [-44, 10, 33]], 'wa-beamline'),
      I.face([[-46, 10, 39], [-39, 10, 36], [-39, 10, 26], [-46, 10, 29]], 'wa-f2'), I.line([[-41, 10, 27], [-41, 10, 4]], 'wa-pole'), I.wheel(-90, 10, 14, 8, 'y', 'wa-wheel'), I.dot(-41, 10, 4, 2.6, 'wa-acc'),
      I.crane(-16, -50, 0, 62, 34, 'y'), I.stake(-122, 58, 0), I.stake(-8, 58, 0),
    ].join('') },
  { id: 'nucleo', group: 'next', w: 124, d: 136, ground: C.field, shift: [-72, 0],
    floor: (I) => rows(I, 'y', 16, 'wa-row'),
    draw: (I) => [
      // the farmland: a barn, a silo half risen, a windmill
      I.box(22, -56, 38, 26, 0, 17), I.gable(19, -59, 44, 32, 17, 12), I.face([[34, -30, 0], [46, -30, 0], [46, -30, 12], [34, -30, 12]], 'wa-lit'),
      I.cyl(84, -42, 12, 0, 22), I.ring(84, -42, 12, 11, 'wa-l wa-l--hi'), `<path class="wa-wire" d="${k.ring(I.T(84, -42, 0)[0], I.T(84, -42, 0)[1], 12, 40, P, 28)}"/>` + I.line([[72, -42, 22], [72, -42, 40]], 'wa-wire') + I.line([[96, -42, 22], [96, -42, 40]], 'wa-wire'), I.scaffold(70, 98, -29, 0, 40, 3, 4),
      I.line([[104, 24, 0], [108, 28, 44], [112, 24, 0]], 'wa-pole'), I.line([[108, 32, 0], [108, 28, 44]], 'wa-pole'), rays(I, 108, 28, 44, 15, 8, 'wa-fan'), I.dot(108, 28, 44, 2.6, 'wa-acc'),
      I.stake(124, 58, 0), I.stake(124, -58, 0), I.stake(14, 58, 0),
    ].join('') },

  { id: 'ciber', group: 'next', w: 134, d: 122, ground: C.stone, accent: C.mint, floor: (I) => grid(I, 36), draw: (I) => [
      // a bastion: towers and walls, and a keep that is half drawing
      I.cyl(-42, -38, 10, 0, 34), I.box(-42, -42, 84, 8, 0, 22), I.cyl(42, -38, 10, 0, 34), I.box(-46, -38, 8, 76, 0, 22),
      I.box(-20, -18, 40, 34, 0, 28), I.wire(-20, -18, 40, 34, 28, 26), I.scaffold(-22, 22, 17, 0, 54, 4, 5),
      I.face([[-8, 16, 8], [8, 16, 8], [8, 16, 18], [0, 16, 25], [-8, 16, 18]], 'wa-acc'), I.dot(0, 16, 15, 2.4, 'wa-ink'), I.line([[0, 16, 14], [0, 16, 10]], 'wa-l wa-l--ink'),
      I.box(38, -38, 8, 76, 0, 22), I.cyl(-42, 38, 10, 0, 34), I.box(-42, 34, 30, 8, 0, 22), I.box(12, 34, 30, 8, 0, 22), I.cyl(42, 38, 10, 0, 34),
      [[-42, -38], [42, -38], [-42, 38], [42, 38]].map(([x, y]) => I.ring(x, y, 10, 26, 'wa-l wa-l--hi')).join(''),
      I.crane(28, -8, 28, 46, 30, 'x'), I.stake(60, 54, 0), I.stake(-60, 54, 0),
    ].join('') },

  { id: 'quant', group: 'next', w: 144, d: 126, ground: C.sea, accent: C.mint, floor: (I) => grid(I, 50), draw: (I) => [
      // a skyline that is still going up
      I.box(-58, -52, 28, 26, 0, 62), I.wire(-58, -52, 28, 26, 62, 34), I.windows(-56, -32, -26, 6, 58, 3, 7, 1), I.windowsR(-50, -28, -30, 6, 58, 3, 7, 3), I.crane(-44, -39, 96, 20, 30, 'x'),
      I.box(-22, -56, 26, 26, 0, 66), I.box(-18, -52, 18, 18, 66, 14), I.windows(-20, 2, -30, 6, 62, 3, 7, 4), I.windowsR(-54, -32, 4, 6, 62, 3, 7, 2),
      I.box(-58, -16, 26, 24, 0, 44), I.windows(-56, -34, 8, 6, 40, 3, 5, 2), I.windowsR(-14, 6, -32, 6, 40, 3, 5, 5),
      I.box(12, -46, 24, 24, 0, 26), I.wire(12, -46, 24, 24, 26, 40), I.scaffold(10, 38, -21, 0, 66, 3, 6), I.windows(14, 34, -22, 6, 22, 3, 2, 3),
      // the board: what went up and what went down
      I.line([[4, 30, 0], [4, 30, 8]], 'wa-pole'), I.line([[54, 30, 0], [54, 30, 8]], 'wa-pole'), I.box(-2, 26, 62, 5, 8, 36),
      [[4, 14, 24, 0], [14, 20, 32, 1], [24, 17, 27, 0], [34, 24, 38, 1], [44, 28, 36, 0], [52, 30, 41, 1]].map(([x, a, b, up]) => I.line([[x + 2, 31, a - 3], [x + 2, 31, b + 3]], 'wa-l wa-l--hi') + I.face([[x, 31, a], [x + 4, 31, a], [x + 4, 31, b], [x, 31, b]], up ? 'wa-acc' : 'wa-lit')).join(''),
      I.stake(64, 56, 0), I.stake(-64, 56, 0),
    ].join('') },

  { id: 'espacio', group: 'next', w: 144, d: 126, ground: C.night, accent: C.coral, ink: 'light', floor: (I) => scatter(5, 60, 84, (x, y, r) => I.dot(x, y, 0, 0.8 + r * 1.4, 'wa-speck wa-speck--star')), draw: (I) => [
      `<path class="wa-wire" d="${k.ring(I.T(0, 0, 0)[0], I.T(0, 0, 0)[1], 74, 96, P, 48)}"/>`, `<path class="wa-wire" d="${k.ring(I.T(0, 0, 0)[0], I.T(0, 0, 0)[1], 50, 128, P, 40)}"/>`,
      // two satellites, already on their orbits in the drawing
      I.box(-78, -6, 8, 8, 92, 8, { lit: true, r: 1 }), I.face([[-92, -2, 96], [-80, -2, 96], [-80, -2, 104], [-92, -2, 104]], 'wa-acc'), I.face([[-68, -2, 96], [-56, -2, 96], [-56, -2, 104], [-68, -2, 104]], 'wa-acc'),
      I.box(30, -44, 7, 7, 125, 7, { lit: true, r: 1 }), I.face([[18, -41, 128], [28, -41, 128], [28, -41, 134], [18, -41, 134]], 'wa-acc'), I.face([[39, -41, 128], [49, -41, 128], [49, -41, 134], [39, -41, 134]], 'wa-acc'),
      // the tower, the pad and a rocket whose top is still a drawing
      [[-46, -36], [-32, -36], [-32, -22], [-46, -22]].map(([x, y]) => I.line([[x, y, 0], [x, y, 84]], 'wa-pole')).join(''), I.scaffold(-46, -32, -22, 0, 84, 1, 8),
      I.line([[-32, -28, 60], [-10, -8, 60]], 'wa-pole'), I.line([[-32, -28, 34], [-10, -8, 34]], 'wa-pole'),
      I.cyl(-2, -2, 36, 0, 4), I.ring(-2, -2, 26, 4, 'wa-l wa-l--hi'), I.ring(-2, -2, 15, 4, 'wa-acc-l'),
      I.face([[-16, 9, 4], [-2, 9, 4], [-2, 9, 24]], 'wa-f2'), I.face([[-2, 9, 4], [12, 9, 4], [-2, 9, 24]], 'wa-f2'),
      I.cyl(-2, -2, 10.5, 4, 40, { lit: true }), I.ring(-2, -2, 10.5, 26, 'wa-l wa-l--ink'), I.ring(-2, -2, 10.5, 34, 'wa-l wa-l--ink'), I.dot(-2, 8.5, 30, 2.6, 'wa-acc'),
      `<path class="wa-wire" d="${k.ring(I.T(-2, -2, 0)[0], I.T(-2, -2, 0)[1], 10.5, 62, P, 24)}"/>` + I.line([[-12.5, -2, 44], [-12.5, -2, 62], [-2, -2, 86], [8.5, -2, 62], [8.5, -2, 44]], 'wa-wire'),
      // a dish that listens
      I.line([[46, 22, 0], [46, 22, 16]], 'wa-pole wa-l--thick'), I.cone(46, 22, 14, 30, -14, 'wa-lit'), I.line([[46, 22, 30], [46, 22, 40]], 'wa-pole'), I.dot(46, 22, 40, 2.4, 'wa-acc'),
      [[-60, 40, 150], [20, -70, 160], [70, -20, 110], [-20, -60, 190], [64, 30, 170]].map(([x, y, z]) => I.dot(x, y, z, 1.3, 'wa-star')).join(''),
      I.stake(64, 56, 0), I.stake(-64, 56, 0),
    ].join('') },
];

export const WORLD_IDS = [...new Set(BANDS.map((b) => b.id))];
export type WorldId = string;
export const WORLD_GROUP_OF: Record<string, WorldGroup> = Object.fromEntries(BANDS.map((b) => [b.id, b.group]));

/* The land: `H` tall; every border leans the same way (x = border + (CY − y) · LEAN), like a ruled sheet seen at an angle. */
const H = 420, CY = 250, LEAN = 0.5, AIR = 84, STEP = 8;
const n1 = (v: number) => (Math.round(v * 10) / 10).toString();
const at = (x: number, y: number) => x + (CY - y) * LEAN;
const poly = (l: number, r: number) => `M${n1(at(l, 0))} 0L${n1(at(r, 0))} 0L${n1(at(r, H))} ${H}L${n1(at(l, H))} ${H}Z`;

type Built = { i: number; id: string; group: WorldGroup; vars: string; l: number; r: number; cx: number; cy: number; floor: string; over: string; node: [number, number]; under: string };
let edge = 0;
const built: Built[] = BANDS.map((b, i) => {
  const bw = Math.round((b.w + b.d) * KX + AIR), l = edge, r = (edge += bw);
  // what stands on the band sits around the line where the borders are measured, a little up or down from its neighbours
  const cx = l + bw / 2, cy = CY + (b.lift ?? (i % 2 ? 12 : -8));
  const [ox, oy] = fromScreen(cx, cy), [sx, sy] = b.shift ?? [0, 0];
  const I = isle(ox + sx, oy + sy);
  const dark = lum(b.ground) <= 0.3;
  // what stands free on the ground (poles, wires, scaffolds) is ink on a light band and paper on a dark one
  const vars = `--g:${b.ground};--gs:${mix(b.ground, INK, 0.42)};--gs2:${mix(b.ground, INK, 0.58)};--gl:${dark ? mix(b.ground, PAPER, 0.34) : mix(b.ground, INK, 0.3)};--a:${b.accent ?? C.coral};--w:${dark ? PAPER : INK}`;
  return {
    i, id: b.id, group: b.group, vars, l, r, cx, cy, under: b.under ?? b.ground,
    // the door of the place: in front of what stands on it, where the path passes
    node: pt(I.T(...(b.node ?? [-sx + b.w / 2 + 12, -sy + b.d / 2 + 12]), 0)),
    floor: b.floor?.(I) ?? '',
    over: `<g class="wa-on${b.ink === 'light' ? ' wa-on--light' : ''}">${b.draw(I)}</g>`,
  };
});
const W = edge;
const of = (id: string) => built.filter((b) => b.id === id);

/** The path of light: through the door of every place, in the order of the journey; dashed where it is still a plan. */
function pathD(nodes: [number, number][]) {
  let d = `M${nodes[0][0].toFixed(1)} ${nodes[0][1].toFixed(1)}`;
  for (let i = 0; i < nodes.length - 1; i++) {
    const p0 = nodes[Math.max(0, i - 1)], p1 = nodes[i], p2 = nodes[i + 1], p3 = nodes[Math.min(nodes.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
/** One door per place: where a place takes two bands, between its two. */
const nodes: [number, number][] = WORLD_IDS.map((id) => { const b = of(id); return [b.reduce((a, c) => a + c.node[0], 0) / b.length, b.reduce((a, c) => a + c.node[1], 0) / b.length]; });
const firstNext = WORLD_IDS.findIndex((id) => WORLD_GROUP_OF[id] === 'next');
const done = nodes.slice(0, firstNext), plan = nodes.slice(firstNext - 1);
const trail =
  `<path class="wa-path-glow" d="${pathD(done)}"/><path class="wa-path" d="${pathD(done)}"/><path class="wa-path wa-path--plan" d="${pathD(plan)}"/>` +
  nodes.map((n, i) => `<circle class="wa-node${i >= firstNext ? ' wa-node--plan' : ''}" cx="${n[0].toFixed(1)}" cy="${n[1].toFixed(1)}" r="5"/>`).join('');

/**
 * A band of ground: its colour, the pattern clipped to it and, where it meets the band before, the step down.
 * `left` / `right` let it run past its border (the ends of the land; a place drawn on its own); `key` keeps the
 * clip ids of two drawings on one page apart.
 */
function ground(b: Built, key: string, left: boolean, right: boolean, step: boolean) {
  const d = poly(left ? b.l - 900 : b.l, right ? b.r + 900 : b.r);
  return `<g class="wa-band" data-id="${b.id}" data-group="${b.group}" style="${b.vars}"><clipPath id="${key}${b.i}"><path d="${d}"/></clipPath>` +
    `<path class="wa-land" d="${d}"/><g clip-path="url(#${key}${b.i})">${b.floor}</g>${step ? `<path class="wa-step" d="${poly(b.l, b.l + STEP)}"/>` : ''}</g>`;
}
const stands = (b: Built) => `<g class="wa-isle" data-id="${b.id}" data-group="${b.group}" style="${b.vars}">${b.over}</g>`;
const byDepth = [...built].sort((a, b) => a.cy - b.cy || a.i - b.i);

export const WORLD_BOX = { x: 0, y: 0, width: W, height: H };
/** The whole land: every ground, the path over them, then everything that stands, back to front. */
export const WORLD_SVG = built.map((b) => ground(b, 'wb', b.i === 0, b.i === built.length - 1, b.i > 0)).join('') + trail + byDepth.map(stands).join('');
/** One place on its own: what stands on it, close, on its own ground (or its two), with the 4:3 box that frames it. */
export const WORLD_ISLES: Record<string, { svg: string; box: [number, number, number, number]; group: WorldGroup }> =
  Object.fromEntries(WORLD_IDS.map((id) => {
    const b = of(id), n = b.length;
    const w = Math.max(360, Math.round(b.reduce((a, c) => a + (BANDS[c.i].w + BANDS[c.i].d) * KX, 0) + 80)), h = Math.min(H, Math.round(w * 0.75));
    const x = Math.max(0, Math.min(W - w, Math.round((b[0].l + b[n - 1].r) / 2 - w / 2))), y = Math.max(0, Math.min(H - h, Math.round(b[0].cy - 50 - h / 2)));
    return [id, { svg: b.map((c, j) => ground(c, 'wc', j === 0, j === n - 1, j > 0)).join('') + b.map(stands).join(''), box: [x, y, w, h], group: b[0].group }];
  }));
export const WORLD_NODES: Record<string, [number, number]> = Object.fromEntries(WORLD_IDS.map((id, i) => [id, [Math.round(nodes[i][0]), Math.round(nodes[i][1])]]));
/**
 * Where to stop on each place, in the order of the journey: `x` is the centre to bring to the middle of the
 * screen, `label` where its name goes (HTML over the drawing, on the ground in front), `on` the colour under
 * that name and `ink` the colour to write it in.
 */
export const WORLD_STOPS = WORLD_IDS.map((id) => {
  const b = of(id), mid = (b[0].l + b[b.length - 1].r) / 2, y = H - 12, on = b[0].under;
  return { id, group: b[0].group, x: Math.round(mid), label: [Math.round(at(mid, y)), y] as [number, number], on, ink: lum(on) > 0.18 ? INK : PAPER };
});
