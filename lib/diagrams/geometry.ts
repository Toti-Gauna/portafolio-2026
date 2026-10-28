import type { Box, EdgeGeo, Side } from './types';

export const NODE_W = { desktop: 200, mobile: 150 } as const;
export const NODE_H = { desktop: 64, mobile: 56 } as const;
export type Variant = keyof typeof NODE_W;

export type Rect = { x: number; y: number; w: number; h: number };
export const rect = (b: Box, v: Variant): Rect => ({ x: b.x, y: b.y, w: b.w ?? NODE_W[v], h: b.h ?? NODE_H[v] });

const center = (r: Rect) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

/** The side of `a` that faces `b` (the dominant axis wins). */
export function facing(a: Rect, b: Rect): Side {
  const ca = center(a), cb = center(b);
  const dx = cb.x - ca.x, dy = cb.y - ca.y;
  // normalise by the boxes' size so wide boxes stacked vertically still connect top/bottom
  if (Math.abs(dx) / (a.w + b.w) > Math.abs(dy) / (a.h + b.h)) return dx > 0 ? 'r' : 'l';
  return dy > 0 ? 'b' : 't';
}

export function anchor(r: Rect, s: Side, shift = 0) {
  switch (s) {
    case 't': return { x: r.x + r.w / 2 + shift, y: r.y };
    case 'b': return { x: r.x + r.w / 2 + shift, y: r.y + r.h };
    case 'l': return { x: r.x, y: r.y + r.h / 2 + shift };
    default: return { x: r.x + r.w, y: r.y + r.h / 2 + shift };
  }
}

const NORMAL: Record<Side, { x: number; y: number }> = { t: { x: 0, y: -1 }, b: { x: 0, y: 1 }, l: { x: -1, y: 0 }, r: { x: 1, y: 0 } };
const r1 = (n: number) => Math.round(n * 10) / 10;

/** A cubic curve that leaves and enters each box perpendicular to its side, plus its midpoint (for the label). */
export function edgePath(a: Rect, b: Rect, g: EdgeGeo = {}) {
  const sa = g.from ?? facing(a, b), sb = g.to ?? facing(b, a);
  const p0 = anchor(a, sa, g.fo), p3 = anchor(b, sb, g.too);
  // the arrowhead sits on the target box: stop a hair short so it does not overlap the border
  const na = NORMAL[sa], nb = NORMAL[sb];
  const end = { x: p3.x + nb.x * 2, y: p3.y + nb.y * 2 };
  const dist = Math.hypot(end.x - p0.x, end.y - p0.y);
  const k = Math.max(24, dist * 0.42);
  const p1 = { x: p0.x + na.x * k, y: p0.y + na.y * k };
  const p2 = { x: end.x + nb.x * k, y: end.y + nb.y * k };
  const mid = { x: (p0.x + 3 * p1.x + 3 * p2.x + end.x) / 8, y: (p0.y + 3 * p1.y + 3 * p2.y + end.y) / 8 };
  const d = g.d ?? `M${r1(p0.x)} ${r1(p0.y)}C${r1(p1.x)} ${r1(p1.y)} ${r1(p2.x)} ${r1(p2.y)} ${r1(end.x)} ${r1(end.y)}`;
  return { d, mid: { x: g.lx ?? mid.x, y: g.ly ?? mid.y } };
}

/** Width of a one-line mono label (JetBrains Mono advances 0.6 em per character). */
export const monoWidth = (text: string, size: number) => text.length * size * 0.6;
