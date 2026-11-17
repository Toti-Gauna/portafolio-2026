import type { Layout } from '@/lib/diagrams/types';

/**
 * Hand-placing two layouts per diagram is the slow part of a case. For the «how it would be built for real» diagrams
 * (Ola 7b) the layouts come from the order of the nodes: `rows` is a list of rows of node ids. The desktop drawing
 * puts each row as given (up to 3 nodes, 240 wide on a 1000 canvas); the mobile drawing flows the same nodes two to a
 * row (a row with a single node is centred and wider). Edge geometry is left to the automatic curve; give `edges`
 * (per layout) only to fix a label or an anchor. The unit test (tests/unit/diagrams.test.ts) still checks both layouts.
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

  // mobile: flow the nodes in the same reading order, two per row (a node alone on its row is centred)
  const flat = rows.flat();
  const mobile: Layout['nodes'] = {};
  let y = 10, i = 0, line = 0;
  while (i < flat.length) {
    const pair = flat.slice(i, i + 2);
    if (pair.length === 2) {
      mobile[pair[0]] = { x: 10, y, w: 160 };
      mobile[pair[1]] = { x: 190, y, w: 160 };
    } else mobile[pair[0]] = { x: 55, y, w: 250 };
    i += pair.length; y += 110; line++;
  }
  const mH = 10 + (line - 1) * 110 + 56 + 10;
  return {
    desktop: { w: 1000, h: dH, nodes: desktop, ...extra?.desktop },
    mobile: { w: 360, h: mH, nodes: mobile, ...extra?.mobile },
  };
}
