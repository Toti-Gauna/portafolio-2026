import type { CSSProperties } from 'react';
import { InView } from '@/components/diagrams/InView';
import { funnelWidths } from '@/lib/negocio';

type Stage = { t: string; m: string };

/** A customer path as stacked bars that narrow stage by stage, each with the module that implements it. Widths are illustrative. */
export function Funnel({ name, stages, status }: { name: string; stages: Stage[]; status: React.ReactNode }) {
  const w = funnelWidths(stages.length);
  return (
    <InView as="figure" className="bz-fun">
      <figcaption className="bz-fun__head"><b>{name}</b>{status}</figcaption>
      <ol>
        {stages.map((s, i) => (
          <li key={s.t} style={{ '--w': `${w[i]}%`, '--o': i } as CSSProperties}>
            <span className="bz-fun__bar"><span className="bz-fun__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{s.t}</span>
            <span className="bz-fun__m">{s.m}</span>
          </li>
        ))}
      </ol>
    </InView>
  );
}
