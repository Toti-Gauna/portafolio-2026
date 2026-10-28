import { InView } from '@/components/diagrams/InView';

/** Red ocean → blue ocean: one band of water that changes colour from left to right; the waves move while on screen. */
export function Ocean({ c }: { c: { red: string; redD: string; blueO: string; blueD: string } }) {
  const wave = (y: number, a: number) => {
    let d = `M0 ${y}`;
    for (let x = 0; x < 2400; x += 200) d += ` q50 ${-a} 100 0 t100 0`;
    return `${d} V200 H0 Z`;
  };
  return (
    <InView live as="figure" className="bz-fig bz-ocean">
      <svg viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="bz-sea" gradientUnits="userSpaceOnUse" x1="0" x2="1200" y1="0" y2="0">
            <stop offset="0" stopColor="#ff4d2e" />
            <stop offset="0.45" stopColor="#7a2c3a" />
            <stop offset="0.6" stopColor="#24357a" />
            <stop offset="1" stopColor="#2b50ff" />
          </linearGradient>
        </defs>
        <g className="bz-ocean__w bz-ocean__w--back"><path d={wave(92, 14)} fill="url(#bz-sea)" opacity="0.35" /></g>
        <g className="bz-ocean__w"><path d={wave(118, 18)} fill="url(#bz-sea)" opacity="0.8" /></g>
      </svg>
      <figcaption className="bz-ocean__cap">
        <span><b>{c.red}</b> {c.redD}</span>
        <span><b>{c.blueO}</b> {c.blueD}</span>
      </figcaption>
    </InView>
  );
}
