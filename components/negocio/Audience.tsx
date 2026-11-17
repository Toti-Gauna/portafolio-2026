import type { CSSProperties } from 'react';
import { InView } from '@/components/diagrams/InView';
import { AUDIENCE_WIDTHS } from '@/lib/negocio';

type Copy = { title: string; steps: string[]; caption: string };

/** A campaign audience that shrinks by rules of respect: five bars, each narrower. Widths are illustrative. */
export function Audience({ c }: { c: Copy }) {
  return (
    <InView as="figure" className="bz-aud">
      <figcaption className="bz-fig__t">{c.title}</figcaption>
      <ol>
        {c.steps.map((s, i) => (
          <li key={s} style={{ '--w': `${AUDIENCE_WIDTHS[i]}%`, '--o': i } as CSSProperties}><span>{s}</span></li>
        ))}
      </ol>
      <p className="note">{c.caption}</p>
    </InView>
  );
}
