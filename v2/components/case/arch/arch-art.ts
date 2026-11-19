import type { ArchSpec, NodeKind, Tone } from '@/lib/diagrams/types';
import { isle, pt } from '../../work/world-kit';

/**
 * The living architecture of a case (lote 5.2), drawn: a model on an isometric board, with the kit of the world of
 * Work. The structure is the published diagram's (ArchSpec: nodes, edges in the order a request travels, groups);
 * here it is laid on a lattice — a column and a row per node, read from the published layout — and every piece is
 * a small solid that says what it is: a screen, a rack, a store of discs, a gate. Connections run on the floor
 * along the lattice, with rounded corners, an arrow and their length (so a packet can travel them with
 * stroke-dashoffset alone). What is planned is a wireframe. No text in the drawing: names are HTML over it,
 * placed with the anchors returned here. Everything is built once, at build time.
 */
export const CELL = 205;
const PAD = 50, HALF = PAD / 2;
const TONE: Record<Tone, string> = { coral: '#ff7a5c', blue: '#8aa4ff', yellow: '#ffc247', green: '#3fe0b0', paper: '#eeeae3' };
const PLAIN = '#c9c5de';

type I = ReturnType<typeof isle>;
/** One solid per kind of piece, about 40 units wide, with ONE accent each (the kit's rule). */
const SOLID: Record<NodeKind, (I: I) => string> = {
  client: (I) => I.box(-18, -5, 36, 10, 0, 3) + I.box(-16, -2, 32, 4, 3, 27) + I.face([[-13, 2.3, 7], [13, 2.3, 7], [13, 2.3, 27], [-13, 2.3, 27]], 'wa-win') + I.face([[-13, 2.3, 22.5], [13, 2.3, 22.5], [13, 2.3, 27], [-13, 2.3, 27]], 'wa-acc') + I.lines([[[-9, 2.4, 17], [5, 2.4, 17]], [[-9, 2.4, 12], [9, 2.4, 12]]], 'wa-l wa-l--hi'),
  server: (I) => I.box(-13, -13, 26, 26, 0, 38) + I.lines([[[-8, 13.3, 10], [8, 13.3, 10]], [[-8, 13.3, 19], [8, 13.3, 19]]], 'wa-l wa-l--hi') + I.line([[-8, 13.3, 28], [8, 13.3, 28]], 'wa-acc-l') + I.dot(13.3, 8, 30, 1.6, 'wa-lit'),
  db: (I) => I.cyl(0, 0, 15, 0, 9) + I.cyl(0, 0, 15, 12, 9) + I.cyl(0, 0, 15, 24, 9) + I.ring(0, 0, 8.5, 33.2, 'wa-acc-l'),
  service: (I) => I.box(-15, -15, 30, 30, 0, 22) + I.box(-7, -7, 14, 14, 22, 5, { lit: true }) + I.dot(0, 0, 28.6, 2.8, 'wa-acc') + I.lines([[[-15, 15.3, 8], [-9, 15.3, 8]], [[9, 15.3, 8], [15, 15.3, 8]]], 'wa-l wa-l--hi'),
  // a service of someone else: a globe on its stand, with its orbit
  external: (I) => I.cyl(0, 0, 12, 0, 5) + I.dome(0, 0, 11, 5) + I.ring(0, 0, 16, 10, 'wa-acc-l') + I.dot(0, 0, 21.5, 2.4, 'wa-lit'),
  queue: (I) => I.box(-16, -12, 32, 24, 0, 5) + I.box(-16, -12, 32, 24, 9, 5) + I.box(-16, -12, 32, 24, 18, 5, { lit: true }) + I.line([[-10, 12.3, 11.5], [10, 12.3, 11.5]], 'wa-acc-l'),
  ai: (I) => I.box(-14, -14, 28, 28, 0, 8) + I.pyr(0, 0, 11, 8, 22) + I.star(0, 0, 41, 6.5),
  person: (I) => I.ring(0, 0, 13, 0.2, 'wa-acc-l') + I.cyl(0, 0, 7, 0, 21) + I.dot(0, 0, 29.5, 6.6, 'wa-lit'),
  gate: (I) => I.box(-19, -4, 7, 8, 0, 30) + I.box(12, -4, 7, 8, 0, 30) + I.box(-19, -4, 38, 8, 30, 6) + I.line([[-12, 0, 13], [12, 0, 13]], 'wa-acc-l') + I.dot(0, 0, 13, 2.4, 'wa-acc'),
  doc: (I) => I.box(-12, -1.6, 24, 3.2, 0, 33, { lit: true }) + I.lines([[[-8, 1.8, 26], [8, 1.8, 26]], [[-8, 1.8, 20], [8, 1.8, 20]], [[-8, 1.8, 14], [2, 1.8, 14]]], 'wa-l wa-l--ink') + I.dot(7, 1.8, 7, 2.6, 'wa-acc'),
  code: (I) => I.box(-17, -11, 34, 22, 0, 22) + I.lines([[[-8, 11.3, 16], [-13, 11.3, 11], [-8, 11.3, 6]], [[8, 11.3, 16], [13, 11.3, 11], [8, 11.3, 6]]], 'wa-acc-l') + I.line([[2.5, 11.3, 17], [-2.5, 11.3, 5]], 'wa-l wa-l--hi'),
  cloud: (I) => I.box(-17, -10, 34, 20, 0, 6) + I.dome(-7, 0, 9, 6) + I.dome(6, 0, 11.5, 6) + I.dot(6, 0, 23, 2.6, 'wa-acc'),
};
/** What is planned stands as a wireframe with a stake, like everything still to come in the world of Work. */
const PLANNED = (I: I) => I.wire(-15, -15, 30, 30, 0, 26) + I.stake(-15, 15, 0) + I.stake(15, 15, 0) + I.stake(15, -15, 0);

/** Group the values that are close into columns (or rows): each node takes the index of its group. */
function ranks(values: number[], gap = 70): Map<number, number> {
  const sorted = [...new Set(values)].sort((a, b) => a - b), out = new Map<number, number>();
  let rank = 0;
  sorted.forEach((v, i) => { if (i && v - sorted[i - 1] > gap) rank += 1; out.set(v, rank); });
  return out;
}

type P2 = [number, number];
const n1 = (v: number) => (Math.round(v * 10) / 10).toString();
const screen = (x: number, y: number, z = 0): P2 => { const [sx, sy] = pt([x, y, z]); return [sx, sy]; };

export type ArchNode = { id: string; kind: NodeKind; color: string; planned: boolean; cell: [number, number]; /** where its name goes, as a fraction of the drawing */ at: P2; /** the piece alone, for a list */ icon: string };
export type ArchEdge = { id: string; from: string; to: string; dashed: boolean; planned: boolean; /** where its label goes */ at: P2; len: number };
export type ArchZone = { id: string; at: P2 };
export type ArchArt = { svg: string; box: [number, number, number, number]; nodes: ArchNode[]; edges: ArchEdge[]; zones: ArchZone[]; cols: number; rows: number };

/** The box every icon is drawn in (the piece alone, with room for the tallest). */
export const ICON_BOX = '-34 -52 68 78';

export function archArt(spec: ArchSpec, planned: readonly string[] = []): ArchArt {
  const L = spec.desktop.nodes;
  const colOf = ranks(spec.nodes.map((n) => L[n.id].x)), rowOf = ranks(spec.nodes.map((n) => L[n.id].y));
  const cell = Object.fromEntries(spec.nodes.map((n) => [n.id, [colOf.get(L[n.id].x)!, rowOf.get(L[n.id].y)!] as [number, number]]));
  const cols = Math.max(...Object.values(cell).map((c) => c[0])) + 1, rows = Math.max(...Object.values(cell).map((c) => c[1])) + 1;
  const taken = new Set(Object.values(cell).map((c) => c.join()));
  const isPlanned = (id: string) => planned.includes(id);
  const colorOf = (n: { tone?: Tone }) => (n.tone ? TONE[n.tone] : PLAIN);
  const bounds = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const see = (p: P2) => { bounds.x0 = Math.min(bounds.x0, p[0]); bounds.y0 = Math.min(bounds.y0, p[1]); bounds.x1 = Math.max(bounds.x1, p[0]); bounds.y1 = Math.max(bounds.y1, p[1]); return p; };
  const at = (c: number, r: number): P2 => [c * CELL, r * CELL];
  const poly = (pts: P2[]) => pts.map((p, i) => { const s = see(screen(p[0], p[1])); return `${i ? 'L' : 'M'}${n1(s[0])} ${n1(s[1])}`; }).join('');

  /* ── the floor: the board, a zone per group, a pad per piece ── */
  const m = 0.56 * CELL;
  const board = `<path class="la-board" d="${poly([[-m, -m], [(cols - 1) * CELL + m, -m], [(cols - 1) * CELL + m, (rows - 1) * CELL + m], [-m, (rows - 1) * CELL + m]])}Z"/>`;
  let grid = '';
  for (let c = 0; c < cols; c++) grid += `<path class="la-grid" d="${poly([[c * CELL, -m], [c * CELL, (rows - 1) * CELL + m]])}"/>`;
  for (let r = 0; r < rows; r++) grid += `<path class="la-grid" d="${poly([[-m, r * CELL], [(cols - 1) * CELL + m, r * CELL]])}"/>`;
  const zones: (ArchZone & { p: P2 })[] = [];
  let zoneSvg = '';
  for (const g of spec.groups ?? []) {
    const rect = spec.desktop.groups?.[g.id];
    if (!rect) continue;
    const inside = spec.nodes.filter((n) => { const b = L[n.id], cx = b.x + (b.w ?? 240) / 2, cy = b.y + 30; return cx >= rect.x && cx <= rect.x + rect.w && cy >= rect.y && cy <= rect.y + rect.h; }).map((n) => cell[n.id]);
    if (!inside.length) continue;
    const c0 = Math.min(...inside.map((c) => c[0])), c1 = Math.max(...inside.map((c) => c[0])), r0 = Math.min(...inside.map((c) => c[1])), r1 = Math.max(...inside.map((c) => c[1])), z = 0.4 * CELL;
    zoneSvg += `<path class="la-zone" data-z="${g.id}" style="--a:${g.tone ? TONE[g.tone] : PLAIN}" d="${poly([[c0 * CELL - z, r0 * CELL - z], [c1 * CELL + z, r0 * CELL - z], [c1 * CELL + z, r1 * CELL + z], [c0 * CELL - z, r1 * CELL + z]])}Z"/>`;
    // its name sits on its back corner, the one nothing stands in front of
    zones.push({ id: g.id, at: [0, 0], p: screen(c0 * CELL - z, r0 * CELL - z) });
  }
  const pads = spec.nodes.map((n) => { const [x, y] = at(...cell[n.id]); return `<path class="la-pad" data-n="${n.id}" style="--a:${colorOf(n)}" d="${poly([[x - HALF, y - HALF], [x + HALF, y - HALF], [x + HALF, y + HALF], [x - HALF, y + HALF]])}Z"/>`; }).join('');

  /* ── the connections: along the lattice, round the pieces in the way ── */
  const free = (c: number, r: number, a: [number, number], b: [number, number]) => !taken.has(`${c},${r}`) || (c === a[0] && r === a[1]) || (c === b[0] && r === b[1]);
  const clear = (a: [number, number], b: [number, number], ends: [[number, number], [number, number]]) => {
    // a straight run on the lattice between two cells: nothing may stand strictly inside it
    if (a[0] !== b[0] && a[1] !== b[1]) return false;
    const steps = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
    for (let i = 1; i < steps; i++) { const c = a[0] + Math.sign(b[0] - a[0]) * i, r = a[1] + Math.sign(b[1] - a[1]) * i; if (!free(c, r, ...ends)) return false; }
    return true;
  };
  const twins = new Set(spec.edges.filter((e) => spec.edges.some((o) => o.from === e.to && o.to === e.from)).map((e) => e.id));
  const route = (e: ArchSpec['edges'][number]): P2[] => {
    const a = cell[e.from], b = cell[e.to], ends: [[number, number], [number, number]] = [a, b];
    let via: [number, number][];
    if (a[0] === b[0] || a[1] === b[1]) {
      if (clear(a, b, ends)) via = [a, b];
      else if (a[1] === b[1]) { const s = a[1] + 1 < rows || a[1] === 0 ? 0.5 : -0.5; via = [a, [a[0], a[1] + s], [b[0], b[1] + s], b]; }
      else { const s = a[0] + 1 < cols || a[0] === 0 ? 0.5 : -0.5; via = [a, [a[0] + s, a[1]], [b[0] + s, b[1]], b]; }
    } else {
      const k1: [number, number] = [b[0], a[1]], k2: [number, number] = [a[0], b[1]];
      const ok = (k: [number, number]) => !taken.has(k.join()) && clear(a, k, ends) && clear(k, b, ends);
      if (ok(k1)) via = [a, k1, b];
      else if (ok(k2)) via = [a, k2, b];
      else { const s = b[1] > a[1] ? 0.5 : -0.5; via = [a, [a[0], a[1] + s], [b[0], a[1] + s], b]; }
    }
    let pts = via.map(([c, r]) => at(c, r));
    // two connections between the same two pieces (there and back) keep to their right-hand side
    if (twins.has(e.id)) pts = pts.map((p, i) => { const q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)], dx = q[0] - o[0], dy = q[1] - o[1], len = Math.hypot(dx, dy) || 1; return [p[0] - (dy / len) * 9, p[1] + (dx / len) * 9] as P2; });
    // from the edge of one pad to the edge of the other
    const trim = (p: P2, q: P2, by: number): P2 => { const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1; return [p[0] + ((q[0] - p[0]) / len) * by, p[1] + ((q[1] - p[1]) / len) * by]; };
    pts[0] = trim(pts[0], pts[1], HALF + 4);
    pts[pts.length - 1] = trim(pts[pts.length - 1], pts[pts.length - 2], HALF + 12);
    // round every corner
    const out: P2[] = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const p = pts[i], inn = trim(p, pts[i - 1], 16), exit = trim(p, pts[i + 1], 16);
      for (let k = 0; k <= 6; k++) { const t = k / 6, u = 1 - t; out.push([u * u * inn[0] + 2 * u * t * p[0] + t * t * exit[0], u * u * inn[1] + 2 * u * t * p[1] + t * t * exit[1]]); }
    }
    out.push(pts[pts.length - 1]);
    return out;
  };
  const edges: (ArchEdge & { p: P2 })[] = [];
  let edgeSvg = '';
  for (const e of spec.edges) {
    const pts = route(e), s = pts.map((p) => see(screen(p[0], p[1])));
    const d = s.map((p, i) => `${i ? 'L' : 'M'}${n1(p[0])} ${n1(p[1])}`).join('');
    const seg = s.slice(1).map((p, i) => Math.hypot(p[0] - s[i][0], p[1] - s[i][1])), len = seg.reduce((a, b) => a + b, 0);
    // its label sits at the middle of the way
    let run = len / 2, mid = s[0];
    for (let i = 0; i < seg.length; i++) { if (run <= seg[i]) { const t = run / seg[i]; mid = [s[i][0] + (s[i + 1][0] - s[i][0]) * t, s[i][1] + (s[i + 1][1] - s[i][1]) * t]; break; } run -= seg[i]; }
    // the arrow: a small triangle lying on the floor, pointing the way it travels
    const z = pts[pts.length - 1], y = pts[pts.length - 2], dl = Math.hypot(z[0] - y[0], z[1] - y[1]) || 1, ux = (z[0] - y[0]) / dl, uy = (z[1] - y[1]) / dl;
    const tip: P2 = [z[0] + ux * 9, z[1] + uy * 9], l: P2 = [z[0] - uy * 5.5, z[1] + ux * 5.5], r: P2 = [z[0] + uy * 5.5, z[1] - ux * 5.5];
    const plannedEdge = isPlanned(e.from) || isPlanned(e.to);
    edgeSvg += `<g class="la-edge" data-e="${e.id}"${e.dashed ? ' data-dashed' : ''}><path class="la-line" d="${d}"/><path class="la-run" d="${d}" style="--len:${Math.ceil(len)}"/><path class="la-arrow" d="${poly([tip, l, r])}Z"/></g>`;
    edges.push({ id: e.id, from: e.from, to: e.to, dashed: !!e.dashed, planned: plannedEdge, at: [0, 0], len: Math.ceil(len), p: mid });
  }

  /* ── the pieces, back to front ── */
  const order = [...spec.nodes].sort((a, b) => cell[a.id][0] + cell[a.id][1] - (cell[b.id][0] + cell[b.id][1]));
  const solids = order.map((n) => {
    const [x, y] = at(...cell[n.id]);
    see(screen(x, y, 48)); see(screen(x - 22, y + 22)); see(screen(x + 22, y - 22));
    return `<g class="la-node" data-n="${n.id}"${isPlanned(n.id) ? ' data-planned' : ''} style="--a:${colorOf(n)}">${(isPlanned(n.id) ? PLANNED : SOLID[n.kind])(isle(x, y))}</g>`;
  }).join('');

  /* ── the frame: room for the names under the front pieces and at the sides ── */
  const x = Math.floor(bounds.x0 - 20), y = Math.floor(bounds.y0 - 16), w = Math.ceil(bounds.x1 - bounds.x0 + 40), h = Math.ceil(bounds.y1 - bounds.y0 + 16 + 34);
  const frac = (p: P2): P2 => [Math.round(((p[0] - x) / w) * 10000) / 100, Math.round(((p[1] - y) / h) * 10000) / 100];
  const nodes: ArchNode[] = spec.nodes.map((n) => {
    const [cx, cy] = at(...cell[n.id]);
    return { id: n.id, kind: n.kind, color: colorOf(n), planned: isPlanned(n.id), cell: cell[n.id], at: frac(screen(cx + HALF, cy + HALF)), icon: (isPlanned(n.id) ? PLANNED : SOLID[n.kind])(isle(0, 0)) };
  });
  return {
    svg: board + grid + zoneSvg + pads + edgeSvg + solids, box: [x, y, w, h], cols, rows, nodes,
    edges: edges.map(({ p, ...e }) => ({ ...e, at: frac(p) })),
    zones: zones.map(({ p, ...z }) => ({ ...z, at: frac(p) })),
  };
}
