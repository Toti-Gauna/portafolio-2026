import type { CSSProperties } from 'react';
import { InView } from '@/components/diagrams/InView';

type Copy = { bad: string; good: string; items: { bad: string; good: string }[]; caption: string };

/** The Mom Test in practice: each bad question gets struck through and replaced by a better one. */
export function Swap({ c }: { c: Copy }) {
  return (
    <InView as="figure" className="bz-fig bz-swap">
      <ol className="bz-swap__list">
        {c.items.map((it, i) => (
          <li key={it.bad} className="bz-swap__item" style={{ '--o': i } as CSSProperties}>
            <p className="bz-swap__bad"><span className="label">{c.bad}</span><s>{it.bad}</s></p>
            <p className="bz-swap__good"><span className="label">{c.good}</span>{it.good}</p>
          </li>
        ))}
      </ol>
      <figcaption className="note">{c.caption}</figcaption>
    </InView>
  );
}
