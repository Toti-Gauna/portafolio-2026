import { describe, expect, it } from 'vitest';
import { anchor, edgePath, facing, monoWidth, rect } from '../../lib/diagrams/geometry';
import { CASES, CASE_SLUGS } from '../../lib/cases';
import { SYSTEM_FLOW } from '../../lib/home';
import type { ArchSpec } from '../../lib/diagrams/types';

const a = rect({ x: 0, y: 0, w: 200 }, 'desktop');
const right = rect({ x: 400, y: 0, w: 200 }, 'desktop');
const below = rect({ x: 0, y: 300, w: 200 }, 'desktop');

describe('diagram geometry', () => {
  it('connects the sides that face each other', () => {
    expect(facing(a, right)).toBe('r');
    expect(facing(right, a)).toBe('l');
    expect(facing(a, below)).toBe('b');
    expect(facing(below, a)).toBe('t');
  });
  it('anchors sit on the middle of each side, shifted on request', () => {
    expect(anchor(a, 'r')).toEqual({ x: 200, y: 32 });
    expect(anchor(a, 'b', 10)).toEqual({ x: 110, y: 64 });
  });
  it('a curve starts on the source side and ends just short of the target', () => {
    const { d, mid } = edgePath(a, right);
    expect(d.startsWith('M200 32C')).toBe(true);
    expect(d.endsWith('398 32')).toBe(true);
    expect(mid.y).toBeCloseTo(32);
  });
  it('mono labels are 0.6 em per character', () => {
    expect(monoWidth('abcd', 15)).toBe(36);
  });
});

/** Every diagram on the site: each node box inside its viewBox and no two boxes overlapping, in both layouts. */
describe('diagram layouts', () => {
  const specs: ArchSpec[] = [SYSTEM_FLOW, ...CASE_SLUGS.flatMap((s) => CASES[s].blocks.flatMap((b) => (b.type === 'diagram' ? [b.spec] : [])))];
  for (const spec of specs) {
    for (const v of ['desktop', 'mobile'] as const) {
      it(`${spec.id} (${v}): boxes fit and don't overlap`, () => {
        const L = spec[v];
        const boxes = spec.nodes.map((n) => ({ id: n.id, ...rect(L.nodes[n.id], v) }));
        for (const b of boxes) {
          expect(b.x, b.id).toBeGreaterThanOrEqual(0);
          expect(b.y, b.id).toBeGreaterThanOrEqual(0);
          expect(b.x + b.w, b.id).toBeLessThanOrEqual(L.w);
          expect(b.y + b.h, b.id).toBeLessThanOrEqual(L.h);
        }
        for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
          const p = boxes[i], q = boxes[j];
          const hit = p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h;
          expect(hit, `${p.id} × ${q.id}`).toBe(false);
        }
      });
    }
  }
});
