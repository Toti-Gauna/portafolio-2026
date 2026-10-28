import type { CSSProperties } from 'react';
import { InView } from '@/components/diagrams/InView';

/** The commitment ladder: a compliment costs nothing; time, reputation and money are real signals. */
export function Ladder({ c }: { c: { title: string; steps: { t: string; d: string }[] } }) {
  return (
    <InView as="figure" className="bz-fig bz-ladder" aria-labelledby="bz-ladder-t">
      <h4 id="bz-ladder-t" className="bz-fig__t">{c.title}</h4>
      <ol className="bz-ladder__steps">
        {c.steps.map((s, i) => (
          <li key={s.t} style={{ '--o': i, '--h': `${18 + i * 27}%` } as CSSProperties}>
            <span className="bz-ladder__bar" aria-hidden="true"><span /></span>
            <b>{s.t}</b>
            <span className="bz-ladder__d">{s.d}</span>
          </li>
        ))}
      </ol>
    </InView>
  );
}
