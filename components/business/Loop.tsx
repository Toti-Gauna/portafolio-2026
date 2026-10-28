import type { CSSProperties } from 'react';
import { InView } from '@/components/diagrams/InView';

type Copy = { build: string; measure: string; learn: string; product: string; data: string; ideas: string; center: string; caption: string };

/** Build · Measure · Learn as a ring: three actions, three things they produce, and a light that keeps going round. */
export function Loop({ c }: { c: Copy }) {
  const R = 168, C = 260;
  const at = (deg: number, r = R) => [C + r * Math.cos((deg * Math.PI) / 180), C + r * Math.sin((deg * Math.PI) / 180)] as const;
  const actions = [[-90, c.build], [30, c.measure], [150, c.learn]] as const;
  const things = [[-30, c.product], [90, c.data], [210, c.ideas]] as const;
  return (
    <InView live as="figure" className="bz-fig bz-loop">
      <svg viewBox="0 0 520 520" aria-hidden="true">
        <circle className="bz-loop__ring" cx={C} cy={C} r={R} pathLength={1} />
        <circle className="bz-loop__pkt" cx={C} cy={C} r={R} pathLength={1} transform={`rotate(-90 ${C} ${C})`} />
        {things.map(([deg, t], i) => {
          const [x, y] = at(deg);
          const [lx, ly] = at(deg, R + 46);
          return (
            <g key={t} className="bz-loop__thing" style={{ '--o': i * 2 + 1 } as CSSProperties}>
              <circle cx={x} cy={y} r={9} />
              <text x={lx} y={ly + 8} textAnchor="middle" fontSize={22}>{t}</text>
            </g>
          );
        })}
        {actions.map(([deg, t], i) => {
          const [x, y] = at(deg);
          return (
            <g key={t} className="bz-loop__act" style={{ '--o': i * 2 } as CSSProperties}>
              <circle cx={x} cy={y} r={70} />
              <text x={x} y={y + 8} textAnchor="middle" fontSize={22}>{t}</text>
            </g>
          );
        })}
        <text className="bz-loop__center" x={C} y={C + 8} textAnchor="middle" fontSize={21}>{c.center}</text>
      </svg>
      <figcaption className="note">{c.caption}</figcaption>
    </InView>
  );
}
