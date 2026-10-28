import type { CSSProperties } from 'react';
import { InView } from '@/components/diagrams/InView';

const STATIONS: [number, number][] = [[250, 70], [500, 70], [750, 70], [750, 210], [500, 210], [250, 210]];

/** The six steps of the method as a loop (wide screens only; the numbered list below carries the same text). */
export function MethodCycle({ names, caption }: { names: string[]; caption: string }) {
  return (
    <InView live as="figure" className="mc">
      <svg viewBox="0 0 1000 290" className="mc__svg" aria-hidden="true">
        <path className="mc__track" d="M140 70H860A70 70 0 0 1 860 210H140A70 70 0 0 1 140 70Z" pathLength={1} />
        <path className="mc__pkt" d="M140 70H860A70 70 0 0 1 860 210H140A70 70 0 0 1 140 70Z" pathLength={1} />
        {[[375, 70, 0], [625, 70, 0], [625, 210, 180], [375, 210, 180]].map(([x, y, r]) => <path key={`${x}${y}`} className="mc__chev" d="M-5 -6L3 0L-5 6" transform={`translate(${x} ${y}) rotate(${r})`} />)}
        {STATIONS.map(([x, y], i) => (
          <g key={i} className="mc__st" style={{ '--o': i } as CSSProperties}>
            <circle cx={x} cy={y} r={20} />
            <text x={x} y={y + 5.5} fontSize={16} textAnchor="middle" className="mc__n">{String(i + 1).padStart(2, '0')}</text>
            <text x={x} y={y < 100 ? y - 34 : y + 52} fontSize={19} textAnchor="middle" className="mc__l">{names[i]}</text>
          </g>
        ))}
      </svg>
      <figcaption className="note">{caption}</figcaption>
    </InView>
  );
}
