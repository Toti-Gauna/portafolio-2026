import { InView } from '@/components/diagrams/InView';

type Copy = { n: string[]; e: string[]; c: string };

/** Who pays whom: three boxes joined by two labelled arrows; a packet runs along them while the figure is on screen. */
export function ValueFlow({ name, c }: { name: string; c: Copy }) {
  return (
    <InView live as="figure" className="bz-flow">
      <figcaption className="bz-flow__name label">{name}</figcaption>
      <ol className="bz-flow__row">
        {c.n.map((n, i) => (
          <li key={n}>
            <span className="bz-flow__box">{n}</span>
            {i < c.e.length && <span className="bz-flow__arrow" aria-hidden="true"><i /><b>{c.e[i]}</b></span>}
            {i < c.e.length && <span className="sr-only"> → {c.e[i]} →</span>}
          </li>
        ))}
      </ol>
      <p className="note">{c.c}</p>
    </InView>
  );
}
