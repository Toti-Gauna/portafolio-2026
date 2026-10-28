import type { CSSProperties } from 'react';
import { InView } from '@/components/diagrams/InView';

const KEYS = ['eliminate', 'reduce', 'raise', 'create'] as const;
type Copy = { title: string; caption: string; items: Record<(typeof KEYS)[number], string[]> } & Record<(typeof KEYS)[number], string>;

/** The four actions (Eliminate · Reduce · Raise · Create) as a 2×2 grid; each quadrant opens in turn. */
export function Errc({ c }: { c: Copy }) {
  return (
    <InView as="figure" className="bz-fig bz-errc" aria-labelledby="bz-errc-t">
      <h4 id="bz-errc-t" className="bz-fig__t">{c.title}</h4>
      <div className="bz-errc__grid">
        {KEYS.map((k, i) => (
          <section key={k} className="bz-errc__q" data-k={k} style={{ '--o': i } as CSSProperties} aria-label={c[k]}>
            <p className="bz-errc__verb"><span aria-hidden="true">{['−', '↓', '↑', '+'][i]}</span>{c[k]}</p>
            <ul>{c.items[k].map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
        ))}
      </div>
      <figcaption className="note">{c.caption}</figcaption>
    </InView>
  );
}
