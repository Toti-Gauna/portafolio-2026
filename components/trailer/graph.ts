import type { Orientation } from './types';

export interface Rect { x: number; y: number; w: number; h: number }
export interface Pt { x: number; y: number }

export const ACCENT = '#ff4d2e';
export const BLUE = '#2b50ff';
export const PAPER = '#eeeae3';
export const INK = '#0e0e10';

/** Area of the stage where the commit graph lives (the text goes below it). */
export function graphRect(o: Orientation, W: number, H: number): Rect {
  return o === 'landscape'
    ? { x: W * 0.06, y: H * 0.08, w: W * 0.88, h: H * 0.38 }
    : { x: W * 0.08, y: H * 0.06, w: W * 0.84, h: H * 0.28 };
}

/** Abstract graph space: u along the trunk (0..1), v across it (-1..1). */
export const mapUV = (r: Rect, u: number, v: number): Pt => ({ x: r.x + u * r.w, y: r.y + (v * 0.5 + 0.5) * r.h });

export function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n = 28): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, m = 1 - t;
    out.push({
      x: m * m * m * p0.x + 3 * m * m * t * p1.x + 3 * m * t * t * p2.x + t * t * t * p3.x,
      y: m * m * m * p0.y + 3 * m * m * t * p1.y + 3 * m * t * t * p2.y + t * t * t * p3.y,
    });
  }
  return out;
}

export interface Branch { pts: Pt[]; color: string; node: Pt }

/** Four career branches (TACH, Ada, Tuenti, CompliA). */
export const MAIN = [
  { u: 0.14, v: -0.62, color: ACCENT },
  { u: 0.3, v: 0.66, color: ACCENT },
  { u: 0.46, v: -0.7, color: ACCENT },
  { u: 0.62, v: 0.74, color: BLUE },
];

/** Eight own-project branches that fan out of the end of the trunk. */
export const SIDE_COUNT = 8;
export const sideV = (i: number) => -0.92 + (i * 1.84) / (SIDE_COUNT - 1);

export function buildBranches(r: Rect): { trunk: Pt[]; main: Branch[]; side: Branch[] } {
  const a = mapUV(r, 0.02, 0), b = mapUV(r, 0.98, 0);
  const trunk = [a, b];
  const main = MAIN.map((m) => {
    const s = mapUV(r, m.u, 0), e = mapUV(r, m.u + 0.13, m.v), end = mapUV(r, m.u + 0.19, m.v);
    const pts = [...cubic(s, { x: s.x + r.w * 0.06, y: s.y }, { x: e.x - r.w * 0.05, y: e.y }, e, 24), end];
    return { pts, color: m.color, node: end };
  });
  const side = Array.from({ length: SIDE_COUNT }, (_, i) => {
    const s = mapUV(r, 0.74, 0), e = mapUV(r, 0.93, sideV(i)), end = mapUV(r, 0.985, sideV(i));
    const pts = [...cubic(s, { x: s.x + r.w * 0.07, y: s.y }, { x: e.x - r.w * 0.06, y: e.y }, e, 24), end];
    return { pts, color: i % 3 === 2 ? BLUE : ACCENT, node: end };
  });
  return { trunk, main, side };
}

/** Polyline up to fraction p (0..1), with the last segment interpolated. */
export function partial(pts: Pt[], p: number): Pt[] {
  if (p <= 0) return [];
  if (p >= 1) return pts;
  const f = p * (pts.length - 1), i = Math.floor(f), k = f - i;
  const out = pts.slice(0, i + 1);
  if (k > 0 && pts[i + 1]) out.push({ x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k });
  return out;
}

/** Agents: one chief in the middle and ten around it. */
export function agentNodes(o: Orientation, W: number, H: number): Pt[] {
  const c = o === 'landscape' ? { x: W * 0.5, y: H * 0.46 } : { x: W * 0.5, y: H * 0.34 };
  const rx = o === 'landscape' ? W * 0.2 : W * 0.38;
  const ry = o === 'landscape' ? H * 0.3 : H * 0.17;
  const out: Pt[] = [c];
  for (let i = 0; i < 10; i++) {
    const a = (-Math.PI / 2) + (i / 10) * Math.PI * 2;
    out.push({ x: c.x + Math.cos(a) * rx, y: c.y + Math.sin(a) * ry });
  }
  return out;
}

/** The six gates, evenly spaced along a line (the labels are DOM, positioned with the same percentages). */
export const GATE_X0 = 0.14;
export const GATE_STEP = 0.144;
export const gateY = (o: Orientation) => (o === 'landscape' ? 0.86 : 0.74);
