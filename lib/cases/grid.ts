import type { ArchSpec, Layout } from '@/lib/diagrams/types';

/**
 * Hand-placing two layouts per diagram is the slow part of a case. For the «how it would be built for real» diagrams
 * (Ola 7b) the layouts come from the order of the nodes: `rows` is a list of rows of node ids.
 *  - Desktop: each row as given (up to 3 nodes, 240 wide on a 1000 canvas).
 *  - Mobile: ONE column in reading order, 300 wide (two per row left labels and boxes too narrow for their text).
 *    Edges between neighbours run straight down; an edge that skips nodes is routed along the right margin without
 *    its label (`finishGrid`, applied once to every case in lib/cases/index.ts). Its label stays in the text version.
 * The unit test (tests/unit/diagrams.test.ts) still checks both layouts.
 */
export function gridLayouts(
  rows: string[][],
  extra?: { desktop?: Partial<Layout>; mobile?: Partial<Layout> },
): { desktop: Layout; mobile: Layout } {
  // desktop: 1 node = centred; 2 = at the thirds; 3 = full row
  const DX: Record<number, number[]> = { 1: [380], 2: [200, 560], 3: [20, 380, 740] };
  const desktop: Layout['nodes'] = {};
  rows.forEach((row, r) => row.forEach((id, c) => { desktop[id] = { x: DX[row.length][c], y: 20 + r * 130, w: 240 }; }));
  const dH = 20 + (rows.length - 1) * 130 + 64 + 20;

  const flat = rows.flat();
  const mobile: Layout['nodes'] = {};
  flat.forEach((id, i) => { mobile[id] = { x: 30, y: 10 + i * MOBILE_PITCH, w: 300 }; });
  const mH = 10 + (flat.length - 1) * MOBILE_PITCH + 56 + 10;
  return {
    desktop: { w: 1000, h: dH, nodes: desktop, ...extra?.desktop },
    mobile: { w: 360, h: mH, nodes: mobile, col: flat, ...extra?.mobile },
  };
}

const MOBILE_PITCH = 92;

/** Routes the edges of a single-column mobile layout (see `gridLayouts`). Idempotent; hand-written geometry wins. */
export function finishGrid(spec: ArchSpec) {
  const col = spec.mobile.col;
  if (!col) return;
  const edges = spec.mobile.edges ?? (spec.mobile.edges = {});
  const mid = (id: string) => spec.mobile.nodes[id].y + 28;
  for (const e of spec.edges) {
    if (edges[e.id]) continue;
    const [i, j] = [col.indexOf(e.from), col.indexOf(e.to)];
    if (i < 0 || j < 0) continue;
    if (Math.abs(i - j) === 1) { edges[e.id] = i < j ? { from: 'b', to: 't' } : { from: 't', to: 'b' }; continue; }
    // skips nodes: out of the right side, down the margin, back in; the farther the span the further out the curve bows
    const out = 330 + 14 + Math.min(Math.abs(i - j), 4) * 3;
    edges[e.id] = { d: `M330 ${mid(e.from)}C${out} ${mid(e.from)} ${out} ${mid(e.to)} 330 ${mid(e.to)}`, hide: true };
  }
}
