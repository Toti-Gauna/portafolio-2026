import * as k from '@/v2/iso/iso-kit';
import { fromScreen, isle, type Isle, KX, KY, P, pt } from './world-kit';

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
export const WORLD_GROUPS = ['origin', 'work', 'own', 'next'] as const;
export type WorldGroup = (typeof WORLD_GROUPS)[number];
type Draw = (I: Isle) => string;
type Tones = { g2: string; g3: string; t1: string; t2: string; wt: string; rk: string };
/**
 * One band of the land. `w` × `d` is the footprint of what stands on it (plane units) and `tall` how far it
 * rises on screen; `shift` moves the origin of the drawing so that footprint is centred; `floor` is the biome:
 * what lies on the ground, clipped to the band (`F` places things by their offset on screen from the middle of
 * the band); `tones` are the colours of that biome; `under` is the colour below the label when it is not the
 * ground (the sea). Two bands may share an `id`.
 */
type BandDef = { id: string; group: WorldGroup; w: number; d: number; ground: string; accent?: string; ink?: 'dark' | 'light'; draw: Draw; floor?: (F: Feats, I: Isle) => string; tones?: Partial<Tones>; node?: [number, number]; shift?: [number, number]; lift?: number; tall?: number; under?: string };

const INK = '#060513', PAPER = '#eeeae3';
/* accents (the spectrum of the brand) and grounds (the same hues, softened: they fill whole screens) */
const C = { amber: '#ffc247', coral: '#ff5a3c', mint: '#3fe0b0', sea: '#2b50ff', paper: PAPER };
const G = { sand: '#f4c868', clay: '#eba88f', meadow: '#96d3a6', steel: '#b4c3ee', night: '#1b1750', blossom: '#ecbcd1', studio: '#ece6da', grass: '#b3dc8e', quay: '#e7e0cb', snow: '#e8edf7', arcade: '#2a2073', dawn: '#f3be92', garden: '#f1d1d6', desert: '#efd39c', field: '#a9d683' };
const lum = (h: string) => { const c = [1, 3, 5].map((i) => { const v = parseInt(h.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const mix = (a: string, b: string, t: number) => `#${[1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('')}`;
/* what is painted on the ground of a band: long lines in the plane (the band clips them), rings and specks */
const R = 1100;
const rows = (I: Isle, axis: 'x' | 'y', step: number, cls = 'wa-floor') => {
  let d = '';
  for (let v = -R; v <= R; v += step) d += axis === 'x' ? I.path([[-R, v, 0], [R, v, 0]]) : I.path([[v, -R, 0], [v, R, 0]]);
  return `<path class="${cls}" d="${d}"/>`;
};
const grid = (I: Isle, step: number) => rows(I, 'x', step) + rows(I, 'y', step);
const rings = (I: Isle, cx: number, cy: number, radii: number[], cls = 'wa-floor') => radii.map((r) => I.ring(cx, cy, r, 0, cls)).join('');
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
  { id: 'mdp', group: 'origin', w: 176, d: 150, ground: G.sand, node: [70, 6], under: C.sea, tones: { wt: C.sea, g3: '#e3b356', t1: '#4f8a64', t2: '#7fb58a' }, floor: (F, I) => I.face([[-R, 12, 0], [R, 12, 0], [R, R, 0], [-R, R, 0]], 'wa-seaf') + I.face([[-R, 12, 0], [R, 12, 0], [R, 44, 0], [-R, 44, 0]], 'wa-shallow') + I.line([[-R, 12, 0], [R, 12, 0]], 'wa-foam') +
    I.live('wl-drift', 0, 0, 0, Array.from({ length: 34 }, (_, i) => I.line([[-R + ((i * 37) % 48), 30 + i * 17, 0], [R, 30 + i * 17, 0]], 'wa-wave')).join('')) +
    F.dune(60, -250, 40) + F.dune(-170, -256, 30) + F.dune(170, -180, 30) + F.dune(-80, -206, 28) + F.dune(206, -104, 26) + F.rock(-232, -84, 1.3) + F.rock(-212, -72, 0.8) +
    F.tuft(130, -130) + F.tuft(40, -190) + F.tuft(218, -56) + F.tuft(-20, -150) + F.umbrella(140, -70, 'wa-acc') + F.umbrella(190, -30, 'wa-lit') + F.umbrella(96, -104, 'wa-lit') + F.boat(-222, 150) + F.boat(212, 188) + F.boat(-330, 40),
    draw: (I) => [
      // the lighthouse, and its beam over the sea
      I.cyl(-56, -44, 10, 0, 12), I.cyl(-56, -44, 7.5, 12, 34), I.ring(-56, -44, 7.5, 24, 'wa-l wa-l--hi'), I.ring(-56, -44, 7.5, 35, 'wa-l wa-l--hi'),
      I.cyl(-56, -44, 9.5, 46, 2.5), I.cyl(-56, -44, 5.6, 48.5, 9, { lit: true }), I.cone(-56, -44, 7.4, 57.5, 9, 'wa-f2'),
      I.turn('z', -56, -44, 53, 'wl-sweep', '<path class="wa-beam" d="M0 0L150 -16L150 16Z"/>'),
      // the house where the first website was made, its window lit
      I.box(-14, -50, 40, 30, 0, 20), I.gable(-17, -53, 46, 36, 20, 13), I.windows(-10, 22, -20, 5, 15, 3, 1, 1),
      // the first product: a games site
      I.box(44, -30, 14, 12, 0, 24), I.face([[46, -18, 12], [56, -18, 12], [56, -18, 21], [46, -18, 21]], 'wa-acc'), I.line([[48, -18, 8], [54, -18, 8]], 'wa-l wa-l--hi'),
      // the pier
      I.box(8, 4, 12, 62, 0, 4), [18, 34, 50, 66].map((y) => I.line([[20, y, 0], [20, y, -7]], 'wa-l wa-l--hi')).join(''),
      I.line([[-30, -6, 0], [-30, -6, 13]], 'wa-pole'), I.cone(-30, -6, 9, 11, 6, 'wa-acc'),
    ].join('') },

  /* ── the work ── */
  { id: 'tach', group: 'work', w: 136, d: 124, ground: G.clay, accent: C.amber, tones: { t1: '#3a7a66', t2: '#66b08f' }, floor: (F, I) => F.road('x', 60, -150) + F.road('y', 170, -40) + F.road('y', -200, 20) + F.patch(0, 6, 196, 176) + F.patch(150, -214, 92, 70, 'wa-park') +
    F.mass(190, -70, 40, 34, 30) + F.mass(-60, -236, 44, 30, 24) + F.mass(-80, -160, 30, 30, 40) + F.mass(-170, 20, 30, 26, 26) + F.mass(196, 150, 30, 36, 22) +
    F.tree(128, -222) + F.tree(160, -204, 0.9) + F.tree(186, -228, 0.8) + F.tree(-200, 78, 0.9) + F.tree(196, 84) + F.bush(-190, 130), draw: (I) => [
      I.box(-52, -50, 30, 30, 0, 74), I.windows(-50, -24, -20, 6, 70, 3, 8, 2), I.windowsR(-48, -22, -22, 6, 70, 3, 8, 4),
      I.box(-14, -54, 28, 28, 0, 50), I.box(-10, -50, 20, 20, 50, 8), I.windows(-12, 12, -26, 6, 46, 3, 5, 5), I.windowsR(-52, -28, 14, 6, 46, 3, 5, 1),
      I.box(-54, -10, 30, 24, 0, 34), I.windows(-52, -26, 14, 5, 30, 3, 3, 3), I.windowsR(-8, 12, -24, 5, 30, 2, 3, 2),
      // a wallet you carry: the app, and what moves through it
      I.box(8, 4, 26, 6, 0, 44, { r: 3 }), I.face([[11, 10, 5], [31, 10, 5], [31, 10, 40], [11, 10, 40]], 'wa-lit'),
      I.line([[15, 10, 31], [27, 10, 31]], 'wa-l wa-l--ink'), I.line([[15, 10, 25], [23, 10, 25]], 'wa-l wa-l--ink'), I.face([[15, 10, 9], [27, 10, 9], [27, 10, 17], [15, 10, 17]], 'wa-acc'),
      I.cyl(46, 22, 11, 0, 3.5, { lit: true }), I.ring(46, 22, 7, 3.5, 'wa-l wa-l--ink'), I.cyl(30, 40, 8, 0, 3, { lit: true }), I.ring(30, 40, 4.6, 3, 'wa-l wa-l--ink'),
    ].join('') },

  { id: 'ada', group: 'work', w: 150, d: 128, ground: G.meadow, tones: { g2: '#b3e3bf', t1: '#2f7a5c', t2: '#5cb389', wt: '#4f8df0' }, floor: (F, I) => rows(I, 'y', 34, 'wa-floor wa-floor--wide') + F.patch(0, 8, 210, 186) + F.lake([[150, -170, 50], [192, -150, 30]]) +
    F.scatter(21, 46, (dx, dy, r) => F.dot(dx, dy, 1.4 + r * 1.4, r > 0.6 ? 'wa-acc' : 'wa-petal')) +
    F.tree(-150, -256) + F.tree(-104, -238, 1.15) + F.tree(30, -250) + F.bush(70, -224) + F.tree(214, -92, 1.1) + F.tree(196, -56, 0.85) + F.bush(128, -108) + F.tree(-190, -24, 1.1) + F.tree(-214, 24, 0.9) + F.bush(-182, 56) + F.tree(204, 128, 1.05) + F.tree(-216, 154), draw: (I) => [
      I.tree(-62, -52, 0, 5), I.flag(58, -50, 0, 46),
      // the hall, with its columns
      I.box(-54, -50, 84, 36, 0, 24), I.gable(-58, -54, 92, 44, 24, 15), I.box(-56, -14, 88, 9, 0, 3),
      [-48, -32, -16, 0, 16].map((x) => I.cyl(x + 8, -9, 2.4, 3, 21, { lit: true })).join(''),
      // the blackboard: code, and the line being explained
      I.box(4, 14, 50, 4, 8, 30), I.line([[10, 18, 8], [10, 18, 0]], 'wa-pole'), I.line([[48, 18, 8], [48, 18, 0]], 'wa-pole'),
      [[12, 34, 30], [16, 40, 25], [16, 30, 20], [12, 22, 15]].map(([a, b, z], i) => I.line([[a, 18, z], [b, 18, z]], i === 1 ? 'wa-acc-l' : 'wa-l wa-l--hi')).join(''),
      [-34, -16, 2].map((x, i) => I.cyl(x, 30 + i * 5, 5, 0, 6, { lit: true })).join(''), I.tree(60, 26, 0, 5),
    ].join('') },

  { id: 'tsoft', group: 'work', w: 250, d: 196, ground: G.steel, node: [108, 80], lift: 16, tall: 250, tones: { t1: '#2f5f7a', t2: '#5d93ad', wt: '#3f63f0' }, floor: (F, I) => F.river([[-340, -250], [-200, -272], [-60, -250], [90, -268], [230, -244], [350, -256]], 30) + F.road('x', 100, -172, 18) + F.road('y', 268, -30, 18) + F.road('y', -286, 20, 18) + F.patch(0, 12, 300, 248) +
    F.mass(268, -124, 44, 38, 40) + F.mass(250, -196, 34, 34, 60) + F.mass(180, -206, 30, 26, 28) + F.mass(-250, 56, 36, 32, 30) + F.mass(-258, 152, 30, 34, 20) +
    F.boat(40, -262) + F.tree(-170, -206) + F.tree(-134, -214, 0.85) + F.tree(120, -214, 0.9) + F.tree(292, 62) + F.tree(284, 142, 0.8) + F.bush(250, 110), draw: (I) => [
      // Tsoft: the tower
      I.box(-108, -84, 46, 42, 0, 100), I.box(-102, -78, 34, 30, 100, 20), I.line([[-85, -63, 120], [-85, -63, 146]], 'wa-l wa-l--hi'), I.dot(-85, -63, 146, 2.4, 'wa-acc'),
      I.windows(-105, -65, -42, 8, 96, 4, 11, 1), I.windowsR(-81, -45, -62, 8, 96, 4, 11, 2), I.windows(-100, -70, -48, 103, 117, 3, 2, 3),
      // Tuenti: the wheel of prizes
      I.box(-14, -72, 44, 16, 0, 7), I.line([[-8, -64, 7], [8, -64, 40]], 'wa-pole'), I.line([[24, -64, 7], [8, -64, 40]], 'wa-pole'),
      I.turn('y', 8, -64, 40, 'wl-spin', '<circle class="wa-wheel" r="30"/><circle class="wa-pole" r="22"/>' +
        Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2, c = (v: number) => (Math.cos(v) * 1).toFixed(3), q = (v: number) => (Math.sin(v) * 1).toFixed(3); return `<path class="wa-pole" d="M0 0L${(+c(a) * 30).toFixed(1)} ${(+q(a) * 30).toFixed(1)}"/><circle class="${i % 2 ? 'wa-lit' : 'wa-acc'}" cx="${(+c(a + 0.39) * 26).toFixed(1)}" cy="${(+q(a + 0.39) * 26).toFixed(1)}" r="2.2"/>`; }).join('')),
      I.dot(8, -64, 40, 4, 'wa-lit'), I.face([[4, -64, 76], [12, -64, 76], [8, -64, 68]], 'wa-acc'),
      // CompliA: the document, and the answer that passed its checks
      I.box(-100, 14, 44, 32, 0, 58), I.face([[-95, 46, 8], [-61, 46, 8], [-61, 46, 52], [-95, 46, 52]], 'wa-lit'),
      [44, 37, 30, 23, 16].map((z, i) => I.line([[-90, 46, z], [i === 4 ? -76 : -66, 46, z]], i === 2 ? 'wa-acc-l' : 'wa-l wa-l--ink')).join(''),
      I.cyl(-66, 30, 10, 58, 4, { lit: true }), I.line([[-71, 31, 62], [-67, 35, 62], [-60, 26, 62]], 'wa-l wa-l--ink wa-l--thick'),
      // Supernova Eventos: a stage
      I.box(10, 18, 64, 44, 0, 7), I.line([[14, 22, 7], [14, 22, 44], [70, 22, 44], [70, 22, 7]], 'wa-pole wa-l--thick'), I.line([[14, 22, 44], [42, 22, 54], [70, 22, 44]], 'wa-pole'),
      I.live('wl-pulse', 42, 22, 30, rays(I, 42, 22, 30, 15, 12)), I.dot(42, 22, 30, 5, 'wa-acc'),
      I.box(22, 66, 22, 3, 0, 12, { lit: true, r: 2 }), I.line([[36, 69, 2], [36, 69, 10]], 'wa-l wa-l--ink'),
    ].join('') },

  /* ── my own path ── */
  { id: 'eclipse', group: 'own', w: 136, d: 124, ground: G.night, accent: C.amber, ink: 'light', tones: { g2: '#3a3390', g3: '#120f3a', t1: '#0c0a2c', t2: '#2c2678' }, floor: (F, I) => F.peak(110, -150, 170, 132) + F.peak(180, -110, 96, 74) + F.peak(-40, -200, 110, 76) + F.peak(20, -120, 84, 56) +
    F.scatter(5, 60, (dx, dy, r) => F.dot(dx, dy, 0.8 + r * 1.3, 'wa-speck wa-speck--star')) + rings(I, -4, -4, [86, 124, 170], 'wa-floor wa-floor--dots') +
    F.pine(-196, 44) + F.pine(-172, 66, 0.8) + F.pine(196, 8, 0.9) + F.pine(210, 60, 1.1) + F.pine(204, 150, 0.9) + F.pine(-206, 156), draw: (I) => [
      I.ring(-4, -4, 52, 0, 'wa-dial'),
      I.cyl(-14, -14, 30, 0, 22, { lit: true }), I.dome(-14, -14, 30, 22, 'wa-lit'), I.line([[-14, 16, 22], [-14, 4, 46], [-14, -14, 56]], 'wa-l wa-l--ink wa-l--thick'),
      I.box(10, 12, 16, 12, 0, 4, { lit: true }), I.box(14, 22, 16, 12, 0, 2, { lit: true }),
      // the eclipse itself, with its corona
      I.live('wl-rot', 42, -56, 88, rays(I, 42, -56, 88, 27, 24, 'wa-corona-l')), I.dot(42, -56, 88, 17, 'wa-corona'), I.dot(42, -56, 88, 14, 'wa-ink'),
    ].join('') },

  { id: 'agentes', group: 'own', w: 134, d: 122, ground: G.blossom, accent: PAPER, tones: { g2: '#f6dbe7', g3: '#e0a6c1', t1: '#d0709f', t2: '#f1c4d8', wt: '#7fa6f5' }, floor: (F, I) => F.band(0, 0, 150, 14) + F.pond(182, -40, 32) + F.scatter(9, 70, (dx, dy, r) => F.dot(dx, dy, 1.2 + r * 1.6, 'wa-petal')) +
    F.tree(-150, -252) + F.tree(-60, -246) + F.tree(0, -224, 1.2) + F.tree(84, -248) + F.tree(150, -190, 1.1) + F.tree(206, -140, 0.9) + F.tree(116, -122) + F.tree(-192, -16, 1.1) + F.tree(-206, 44) + F.bush(-178, 74) + F.tree(204, 44, 0.9) + F.tree(198, 142, 1.1) + F.tree(-200, 154), draw: (I) => {
      // eleven agents around one table, and the gate where a person decides
      const posts = Array.from({ length: 11 }, (_, i) => { const a = (i / 11) * Math.PI * 2 + 0.3; return { x: Math.cos(a) * 46, y: Math.sin(a) * 42, h: 16 + ((i * 5) % 4) * 4 }; });
      const post = (p: (typeof posts)[number]) => I.line([[0, 0, 12], [p.x, p.y, p.h]], 'wa-l wa-l--hi') + I.cyl(p.x, p.y, 4.4, 0, p.h) + I.dot(p.x, p.y, p.h, 2.2, 'wa-lit wl wl-blink', posts.indexOf(p));
      const back = posts.filter((p) => p.x + p.y < 0).sort((a, b) => a.x + a.y - (b.x + b.y)), front = posts.filter((p) => p.x + p.y >= 0).sort((a, b) => a.x + a.y - (b.x + b.y));
      return back.map(post).join('') + I.cyl(0, 0, 15, 0, 9, { lit: true }) + I.ring(0, 0, 9, 9, 'wa-l wa-l--ink') + I.dot(0, 0, 9, 3, 'wa-ink') + front.map(post).join('') +
        I.line([[38, 50, 0], [38, 50, 24], [58, 34, 24], [58, 34, 0]], 'wa-gate') + I.dot(48, 42, 24, 3, 'wa-lit');
    } },

  { id: 'kinetic', group: 'own', w: 134, d: 122, ground: G.studio, tones: { g2: '#f7f3ea', g3: '#ded6c6' }, floor: (F, I) => rows(I, 'x', 52) + F.patch(0, 6, 214, 190, 'wa-g3') + F.road('y', -200, 20, 20) +
    F.mass(150, -180, 64, 6, 52) + F.mass(194, -108, 6, 60, 44) + F.mass(-10, -246, 40, 30, 16) + F.mass(-180, 34, 28, 28, 18) + F.mass(200, 132, 26, 22, 12) + F.mass(-110, -190, 22, 22, 30), draw: (I) => [
      // a spotlight on its tripod
      I.line([[40, -44, 0], [46, -40, 34], [52, -44, 0]], 'wa-pole'), I.line([[46, -34, 0], [46, -40, 34]], 'wa-pole'), I.cyl(46, -40, 7, 34, 9), I.face([[46, -40, 38], [-30, 36, 6], [0, 52, 6]], 'wa-beam'),
      // the clapperboard
      I.box(-50, -18, 64, 7, 0, 40), I.face([[-46, -11, 4], [10, -11, 4], [10, -11, 36], [-46, -11, 36]], 'wa-win'),
      [28, 20, 12].map((z, i) => I.line([[-40, -11, z], [i === 2 ? -16 : 4, -11, z]], 'wa-l wa-l--hi')).join(''),
      I.box(-50, -18, 64, 7, 42, 9), Array.from({ length: 5 }, (_, i) => I.face([[-48 + i * 12, -11, 43], [-42 + i * 12, -11, 43], [-38 + i * 12, -11, 50], [-44 + i * 12, -11, 50]], 'wa-lit')).join(''),
      // a reel
      I.box(24, 26, 26, 8, 0, 4), I.turn('y', 37, 30, 22, 'wl-spin wl-spin--slow', '<circle class="wa-wheel" r="17"/><circle class="wa-l wa-l--ink" r="5"/>' +
        Array.from({ length: 5 }, (_, i) => { const a = (i / 5) * Math.PI * 2 + 0.4; return `<circle class="wa-acc" cx="${(Math.cos(a) * 10.5).toFixed(1)}" cy="${(Math.sin(a) * 10.5).toFixed(1)}" r="2.6"/>`; }).join('')),
    ].join('') },

  { id: 'volta', group: 'own', w: 134, d: 118, ground: G.grass, tones: { g3: '#98cb76', t1: '#3a8758', t2: '#6cbb7d' }, floor: (F, I) => F.hill(110, -196, 78) + F.hill(190, -116, 36) + F.hill(-50, -244, 50) + F.hill(-170, -210, 40) + F.track(172, -36, 50) +
    F.scatter(7, 40, (dx, dy) => F.tuft(dx, dy)) + F.tree(-196, -16) + F.tree(-196, 44, 1.1) + F.bush(-182, 78) + F.tree(204, 122) + F.tree(-198, 154, 1.1), draw: (I) => [
      I.box(-52, -44, 60, 38, 0, 28), I.windowsR(-40, -10, 8, 6, 24, 2, 2, 1), I.face([[-28, -6, 0], [-14, -6, 0], [-14, -6, 15], [-28, -6, 15]], 'wa-lit'),
      awning(I, -52, 8, -6, 23, 13, 7, 6),
      // the jar, and what it promises
      I.cyl(36, -22, 15, 0, 32), I.ring(36, -22, 15, 22, 'wa-l wa-l--hi'), I.ring(36, -22, 15, 9, 'wa-l wa-l--hi'), I.cyl(36, -22, 10, 32, 6, { lit: true }),
      I.face([[35, -7, 21], [41, -7, 21], [37, -7, 15.5], [42, -7, 15.5], [33, -7, 9.5], [36.5, -7, 14], [32, -7, 14]], 'wa-acc wl wl-flick'),
      // a weight to lift
      I.cyl(6, 34, 6, 0, 9, { lit: true }), I.cyl(30, 34, 6, 0, 9, { lit: true }), I.line([[6, 34, 5], [30, 34, 5]], 'wa-l wa-l--ink wa-l--thick'),
    ].join('') },

  { id: 'velmar', group: 'own', w: 134, d: 118, ground: G.quay, tones: { g2: '#f3eedf', g3: '#d3cab0', wt: '#35a9c9' }, floor: (F, I) => I.face([[-R, -R, 0], [R, -R, 0], [R, -84, 0], [-R, -84, 0]], 'wa-seaf') + I.face([[-R, -110, 0], [R, -110, 0], [R, -84, 0], [-R, -84, 0]], 'wa-shallow') + I.line([[-R, -84, 0], [R, -84, 0]], 'wa-foam') +
    I.live('wl-drift', 0, 0, 0, Array.from({ length: 26 }, (_, i) => I.line([[-R + ((i * 29) % 48), -124 - i * 17, 0], [R, -124 - i * 17, 0]], 'wa-wave')).join('')) +
    rows(I, 'x', 40) + I.box(40, -150, 14, 68, 0, 4) + F.boat(88, -196) + F.boat(180, -120) + F.boat(-55, -262) + F.boat(190, -236) +
    F.mass(-190, 40, 22, 22, 14) + F.mass(-166, 62, 16, 16, 10) + F.mass(196, 112, 20, 20, 12) + F.rock(-206, 142, 1.2) + F.rock(206, 40, 1), draw: (I) => [
      // the workshop: a saw-tooth roof and a chimney
      I.box(-54, -44, 72, 40, 0, 22), I.gableY(-54, -44, 36, 40, 22, 13), I.gableY(-18, -44, 36, 40, 22, 13),
      I.cyl(24, -36, 4.2, 0, 44), I.dot(27, -39, 52, 3.4, 'wa-smoke wl wl-smoke', 0), I.dot(31, -43, 60, 4.6, 'wa-smoke wl wl-smoke', 1), I.dot(37, -48, 70, 6, 'wa-smoke wl wl-smoke', 2),
      I.face([[-44, -4, 0], [-22, -4, 0], [-22, -4, 16], [-44, -4, 16]], 'wa-lit'), I.windows(-14, 14, -4, 6, 17, 2, 1, 2),
      // made to order: a gift, with its ribbon
      I.box(22, 14, 26, 24, 0, 18, { lit: true }), I.line([[35, 14, 18], [35, 38, 18], [35, 38, 0]], 'wa-acc-l wa-l--thick'), I.line([[22, 26, 18], [48, 26, 18], [48, 26, 0]], 'wa-acc-l wa-l--thick'),
      I.dot(32, 26, 23, 3.4, 'wa-acc'), I.dot(38, 26, 23, 3.4, 'wa-acc'),
    ].join('') },

  { id: 'dentalos', group: 'own', w: 130, d: 118, ground: G.snow, tones: { g2: '#f8fafe', g3: '#cdd9ee', t1: '#2c5f70', t2: '#4f8b9b', wt: '#bcd3f3' }, floor: (F, I) => F.pond(170, -30, 42, 'wa-ice') + F.hill(100, -196, 72, 'wa-drift') + F.hill(182, -116, 36, 'wa-drift') + F.hill(-60, -244, 46, 'wa-drift') + F.hill(-168, 34, 34, 'wa-drift') +
    F.scatter(13, 50, (dx, dy, r) => F.dot(dx, dy, 1 + r * 1.2, 'wa-petal')) +
    F.pine(10, -226) + F.pine(48, -200, 1.2) + F.pine(170, -214, 0.9) + F.pine(-150, -236) + F.pine(-190, 78) + F.pine(-166, 100, 0.85) + F.pine(204, 108) + F.pine(186, 140, 0.8) + F.pine(-198, 160), draw: (I) => [
      I.box(-50, -44, 62, 40, 0, 32), I.windows(-46, 8, -4, 16, 28, 4, 1, 3), I.windowsR(-40, -8, 12, 6, 28, 2, 2, 5), I.face([[-26, -4, 0], [-12, -4, 0], [-12, -4, 12], [-26, -4, 12]], 'wa-lit'),
      // the sign of a clinic
      I.box(-22, -26, 6, 6, 32, 16, { lit: true, r: 1 }), I.face([[-25, -20, 37], [-13, -20, 37], [-13, -20, 43], [-25, -20, 43]], 'wa-acc'), I.face([[-22, -20, 34], [-16, -20, 34], [-16, -20, 46], [-22, -20, 46]], 'wa-acc'),
      // a tooth, on its plinth
      I.cyl(34, 16, 15, 0, 5), I.cyl(28, 16, 4.2, 5, 13, { lit: true }), I.cyl(40, 16, 4.2, 5, 13, { lit: true }), I.box(22, 8, 24, 16, 16, 17, { lit: true, r: 7 }), I.line([[30, 24, 30], [34, 24, 27], [38, 24, 30]], 'wa-l wa-l--ink'),
    ].join('') },

  { id: 'games', group: 'own', w: 138, d: 122, ground: G.arcade, tones: { g2: '#4a3db0', g3: '#1a1352' }, floor: (F, I) => grid(I, 46) + F.scatter(11, 30, (dx, dy, r) => F.patch(dx, dy, 8 + Math.round(r * 2) * 5, 8 + Math.round(r * 2) * 5, ['wa-px', 'wa-px wa-px--b', 'wa-px wa-px--c'][Math.floor(r * 2.99)])) +
    rings(I, 0, 0, [150, 152, 236], 'wa-floor wa-floor--neon'), draw: (I) => [
      // the projector is the screen
      I.line([[-50, -36, 0], [-50, -36, 10]], 'wa-pole'), I.line([[22, -36, 0], [22, -36, 10]], 'wa-pole'),
      I.box(-58, -40, 88, 6, 10, 54), I.face([[-54, -34, 14], [26, -34, 14], [26, -34, 60], [-54, -34, 60]], 'wa-lit'),
      I.line([[-44, -34, 24], [-44, -34, 38]], 'wa-l wa-l--ink wa-l--thick'), I.line([[16, -34, 34], [16, -34, 48]], 'wa-l wa-l--ink wa-l--thick'), I.dot(-10, -34, 40, 3.4, 'wa-acc wl wl-ball'),
      I.face([[2, 22, 12], [-54, -34, 14], [26, -34, 60]], 'wa-beam'), I.box(-6, 18, 18, 14, 0, 6), I.box(-4, 20, 14, 10, 6, 7), I.dot(2, 20, 10, 2.4, 'wa-lit'),
      // and the phones of the crowd, the controllers
      [[30, 30], [46, 14], [52, 40]].map(([x, y]) => I.line([[x + 3, y + 5, 3], [-14, -34, 36]], 'wa-ctl') + I.box(x, y, 8, 13, 0, 2.4, { lit: true, r: 2 })).join(''),
    ].join('') },

  { id: 'lucero', group: 'own', w: 134, d: 118, ground: G.dawn, accent: PAPER, tones: { g2: '#f8d7ba', g3: '#e0a476', t1: '#3f8a6a', t2: '#6fba92' }, floor: (F, I) => grid(I, 34) + F.patch(0, 8, 204, 180) + F.road('y', -200, 20, 18) +
    F.tree(96, -204, 1.1) + F.tree(158, -164) + F.tree(200, -208, 0.9) + F.bush(138, -120) + F.tree(-40, -246) + F.tree(-196, -10) + F.bush(-186, 52) + F.tree(202, 110, 1.05) + F.bush(196, 150) + F.tree(-200, 154), draw: (I) => [
      I.box(-52, -44, 66, 34, 0, 26), I.windowsR(-38, -14, 14, 6, 22, 2, 2, 3), awning(I, -52, 14, -10, 21, 12, 6, 6), I.face([[-22, -10, 0], [-8, -10, 0], [-8, -10, 14], [-22, -10, 14]], 'wa-lit'),
      // the morning star over the door
      I.line([[26, -38, 0], [26, -38, 58]], 'wa-pole'), I.live('wl-pulse wl-pulse--star', 26, -38, 66, star(I, 26, -38, 66, 11, 'wa-lit')),
      // tables you order from
      [[-10, 26], [18, 10], [38, 34]].map(([x, y], i) => I.cyl(x, y, 2, 0, 8) + I.cyl(x, y, 9, 8, 2, { lit: true }) + I.box(x - 3, y - 3, 6, 6, 10, 0.6, { r: 0.6 }) + I.cyl(x + 13, y - 2 + i * 2, 3.4, 0, 5) + I.cyl(x - 4, y + 13, 3.4, 0, 5)).join(''),
    ].join('') },

  { id: 'trazo', group: 'own', w: 130, d: 118, ground: G.garden, accent: C.sea, tones: { g2: '#f9e6ea', g3: '#e3b5bd', t1: '#4a9374', t2: '#7cc29c', wt: '#6f9df2' }, floor: (F, I) => F.band(0, 0, 196, 16) + F.band(0, 0, 128, 10) + F.pond(176, -150, 36) + F.scatter(17, 50, (dx, dy, r) => F.dot(dx, dy, 1.3 + r * 1.5, r > 0.5 ? 'wa-flower' : 'wa-petal')) +
    F.bush(-200, -12) + F.bush(-186, 60) + F.bush(198, 30) + F.bush(184, 96) + F.bush(90, -200) + F.tree(40, -238) + F.tree(-50, -252, 0.9) + F.tree(-160, -230) + F.tree(204, -66, 0.9) + F.tree(-196, 152, 1.1) + F.bush(202, 152), draw: (I) => {
      // the day in hours: a sundial
      const t = k.radialTicks(I.T(0, 0, 0)[0], I.T(0, 0, 0)[1], 43, 24, 6, 6, [4, 8], P);
      return [
        I.cyl(0, 0, 46, 0, 6, { lit: true }), `<path class="wa-l wa-l--ink" d="${t.minor}"/><path class="wa-l wa-l--ink wa-l--thick" d="${t.major}"/>`, I.ring(0, 0, 28, 6, 'wa-l wa-l--ink'),
        I.turn('z', 0, 0, 6, 'wl-clock', '<path class="wa-acc wa-acc--soft" d="M0 0L30 26L12 34Z"/>'), I.face([[0, -30, 6], [0, 6, 6], [0, 6, 40]], 'wa-f2'), I.line([[0, -30, 6], [0, 6, 40], [0, 6, 6]], 'wa-l wa-l--hi'),
        // a goal reached
        I.flag(-30, 28, 6, 26), I.dot(18, -30, 6, 3, 'wa-ink'), I.dot(-34, -10, 6, 3, 'wa-ink'),
      ].join('');
    } },

  /* ── the projects to come, under construction ── */
  { id: 'nucleo', group: 'next', w: 132, d: 136, ground: G.desert, shift: [65, 0], node: [-10, 76], tones: { g3: '#deba7c', t1: '#4f8a64', t2: '#7fb58a' },
    floor: (F, I) => F.dune(60, -236, 54) + F.dune(176, -170, 40) + F.dune(-110, -252, 36) + F.dune(200, -60, 30) + F.dune(-190, 44, 34) + F.dune(196, 124, 30) + F.dune(-186, 152, 36) +
    F.rock(150, -100, 1.3) + F.rock(172, -88, 0.8) + F.rock(-150, 104, 1) + F.cactus(20, -172) + F.cactus(214, -214, 0.8) + F.cactus(-204, -40, 0.9) + F.cactus(170, 44, 1.1) + F.tuft(100, -130) + F.tuft(-40, -200) + F.tuft(-212, 92),
    draw: (I) => [
      // the desert: storage, a derrick still on paper, and the pump that already nods
      I.cyl(-104, -44, 14, 0, 12), I.ring(-104, -44, 14, 6, 'wa-l wa-l--hi'), `<path class="wa-wire" d="${k.ring(I.T(-104, -44, 0)[0], I.T(-104, -44, 0)[1], 14, 26, P, 28)}"/>` + I.line([[-118, -44, 12], [-118, -44, 26]], 'wa-wire') + I.line([[-90, -44, 12], [-90, -44, 26]], 'wa-wire'),
      [[-60, -52], [-36, -52], [-36, -28], [-60, -28]].map(([x, y]) => I.line([[x, y, 0], [-48, -40, 70]], 'wa-wire')).join(''),
      [18, 36, 52].map((z) => { const s = 12 * (1 - z / 70); return I.line([[-48 - s, -40 - s, z], [-48 + s, -40 - s, z], [-48 + s, -40 + s, z], [-48 - s, -40 + s, z], [-48 - s, -40 - s, z]], 'wa-wire'); }).join(''),
      I.box(-92, 4, 46, 12, 0, 4), I.line([[-80, 10, 4], [-70, 10, 28], [-60, 10, 4]], 'wa-pole wa-l--thick'), 
      I.turn('y', -70, 10, 28, 'wl-nod', '<path class="wa-beamline" d="M-26 -5L26 5"/><path class="wa-f2" d="M24 11L31 8L31 -2L24 1Z"/>'), I.line([[-41, 10, 27], [-41, 10, 4]], 'wa-pole'), I.wheel(-90, 10, 14, 8, 'y', 'wa-wheel'), I.dot(-41, 10, 4, 2.6, 'wa-acc'),
      I.crane(-16, -50, 0, 62, 34, 'y'), I.stake(-122, 58, 0), I.stake(-8, 58, 0),
    ].join('') },
  { id: 'nucleo', group: 'next', w: 124, d: 136, ground: G.field, shift: [-72, 0], tones: { g3: '#8fc56c', t1: '#2f7a52', t2: '#5cb07c', wt: '#4f8df0' },
    floor: (F, I) => rows(I, 'y', 16, 'wa-row') + F.patch(60, -206, 120, 90, 'wa-wheat') + F.patch(-130, -150, 90, 70, 'wa-g3') + F.pond(-150, 40, 32) +
    F.bale(20, -210) + F.bale(56, -186) + F.bale(100, -224) + F.tree(190, -200, 1.1) + F.tree(-70, -250) + F.tree(-200, -30, 1.1) + F.bush(-186, 96) + F.tree(-120, 150) + F.tree(300, 120),
    draw: (I) => [
      // the farmland: a barn, a silo half risen, a windmill
      I.box(22, -56, 38, 26, 0, 17), I.gable(19, -59, 44, 32, 17, 12), I.face([[34, -30, 0], [46, -30, 0], [46, -30, 12], [34, -30, 12]], 'wa-lit'),
      I.cyl(84, -42, 12, 0, 22), I.ring(84, -42, 12, 11, 'wa-l wa-l--hi'), `<path class="wa-wire" d="${k.ring(I.T(84, -42, 0)[0], I.T(84, -42, 0)[1], 12, 40, P, 28)}"/>` + I.line([[72, -42, 22], [72, -42, 40]], 'wa-wire') + I.line([[96, -42, 22], [96, -42, 40]], 'wa-wire'), I.scaffold(70, 98, -29, 0, 40, 3, 4),
      I.line([[104, 24, 0], [108, 28, 44], [112, 24, 0]], 'wa-pole'), I.line([[108, 32, 0], [108, 28, 44]], 'wa-pole'), I.live('wl-rot wl-rot--fast', 108, 28, 44, rays(I, 108, 28, 44, 15, 8, 'wa-fan')), I.dot(108, 28, 44, 2.6, 'wa-acc'),
      I.stake(124, 58, 0), I.stake(124, -58, 0), I.stake(14, 58, 0),
    ].join('') },
];

export const WORLD_IDS = [...new Set(BANDS.map((b) => b.id))];
export type WorldId = string;
export const WORLD_GROUP_OF: Record<string, WorldGroup> = Object.fromEntries(BANDS.map((b) => [b.id, b.group]));

/*
 * The land: `H` tall; every border leans the same way (x = border + (CY − y) · LEAN), like a ruled sheet seen at
 * an angle. A band is as wide as what stands on it plus `AIR`: room for its biome (Ignacio: «no tengas miedo en
 * darle más espacio a cada zona»).
 */
const H = 520, CY = 300, LEAN = 0.5, AIR = 250, STEP = 9, LABEL = 50;
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
type Feats = ReturnType<typeof feats>;

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

type Built = { i: number; reach: number; id: string; group: WorldGroup; vars: string; ground: string; l: number; r: number; cx: number; cy: number; floor: string; over: string; node: [number, number]; under: string; box: [number, number, number, number] };
let edge = 0;
const built: Built[] = BANDS.map((b, i) => {
  const bw = Math.round((b.w + b.d) * KX + AIR), l = edge, r = (edge += bw);
  // what stands on the band sits around the line where the borders are measured, a little up or down from its neighbours
  const cx = l + bw / 2, cy = CY + (b.lift ?? (i % 2 ? 12 : -8));
  const [ox, oy] = fromScreen(cx, cy), [sx, sy] = b.shift ?? [0, 0];
  const I = isle(ox + sx, oy + sy);
  const dark = lum(b.ground) <= 0.3;
  const t: Tones = { g2: dark ? mix(b.ground, PAPER, 0.14) : mix(b.ground, '#ffffff', 0.34), g3: dark ? mix(b.ground, INK, 0.36) : mix(b.ground, INK, 0.13), t1: '#2f6f5e', t2: '#5fae8f', wt: '#3f6df2', rk: mix(b.ground, INK, dark ? 0.5 : 0.4), ...b.tones };
  // what stands free on the ground (poles, wires, scaffolds) is ink on a light band and paper on a dark one
  const vars = `--g0:${b.ground};--g20:${t.g2};--g30:${t.g3};--gs0:${mix(b.ground, INK, 0.42)};--gs20:${mix(b.ground, INK, 0.58)};--gl0:${dark ? mix(b.ground, PAPER, 0.3) : mix(b.ground, INK, 0.2)};--t10:${t.t1};--t20:${t.t2};--wt0:${t.wt};--rk0:${t.rk};--a:${b.accent ?? C.coral};--w0:${dark ? PAPER : INK}`;
  const over = b.draw(I);
  const [x0, y0, x1, y1] = bounds(over);
  return {
    i, reach: (b.w + b.d) * KX * 0.72, id: b.id, group: b.group, vars, ground: b.ground, l, r, cx, cy, under: b.under ?? b.ground,
    // the door of the place: in front of what stands on it, where the path passes
    node: pt(I.T(...(b.node ?? [-sx + b.w / 2 + 12, -sy + b.d / 2 + 12]), 0)),
    floor: b.floor?.(feats(I, b, cx, cy, bw), I) ?? '',
    over: `<g class="wa-on">${over}</g>`,
    box: [x0, y0, x1, y1],
  };
});
const W = edge;
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
  return { id, group: b[0].group, x: Math.round(mid), y: Math.round((top + bottom) / 2), span: [Math.round(at(b[0].l, H)), Math.round(at(b[b.length - 1].r, 0))] as [number, number], label: [Math.round(mid - LABEL), y] as [number, number], on, ink: lum(on) > 0.18 ? INK : PAPER };
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
