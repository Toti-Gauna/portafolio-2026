import { rng } from './rng';
import type { Pt } from './graph';

/**
 * Samples points that fall inside rendered text (in logical stage units).
 * Deterministic: the same font and size always give the same points.
 */
export function sampleText(
  lines: string[], font: string, size: number, centre: Pt, lineGap: number, W: number, H: number, count: number, seed: number,
): Pt[] {
  const scale = 0.5;
  const c = document.createElement('canvas');
  c.width = Math.ceil(W * scale); c.height = Math.ceil(H * scale);
  const g = c.getContext('2d');
  if (!g) return [];
  g.scale(scale, scale);
  g.fillStyle = '#fff';
  g.font = `800 ${size}px ${font}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const total = (lines.length - 1) * lineGap;
  lines.forEach((l, i) => g.fillText(l, centre.x, centre.y - total / 2 + i * lineGap));
  const { data } = g.getImageData(0, 0, c.width, c.height);
  const cand: Pt[] = [];
  const step = 2;
  for (let y = 0; y < c.height; y += step) {
    for (let x = 0; x < c.width; x += step) {
      if (data[(y * c.width + x) * 4 + 3] > 128) cand.push({ x: x / scale, y: y / scale });
    }
  }
  const r = rng(seed);
  if (cand.length === 0) return Array.from({ length: count }, () => ({ x: centre.x, y: centre.y }));
  return Array.from({ length: count }, () => {
    const p = cand[Math.floor(r() * cand.length)];
    return { x: p.x + (r() - 0.5) * 2, y: p.y + (r() - 0.5) * 2 };
  });
}
