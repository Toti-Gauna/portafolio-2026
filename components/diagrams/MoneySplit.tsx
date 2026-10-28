import type { CSSProperties } from 'react';
import { InView } from './InView';
import './split.css';

export type SplitCopy = {
  title: string;
  caption: string;
  rows: { label: string; total: string; segs: { w: number; t: string; tone?: 'coral' | 'paper' | 'muted' }[] }[];
};

/** Where the money of one job goes: stacked bars on one scale (widths from the example's numbers), drawn in on entry. */
export function MoneySplit({ copy }: { copy: SplitCopy }) {
  const max = Math.max(...copy.rows.map((r) => r.segs.reduce((a, s) => a + s.w, 0)));
  return (
    <InView as="figure" className="dg ms" aria-labelledby="ms-t">
      <div className="dg__head"><h3 id="ms-t" className="dg__title">{copy.title}</h3></div>
      <dl className="ms__rows">
        {copy.rows.map((r, i) => (
          <div key={r.label} className="ms__row" style={{ '--o': i } as CSSProperties}>
            <dt className="ms__label">{r.label} <b className="ms__total">{r.total}</b></dt>
            <dd className="ms__bar">
              {r.segs.map((s) => (
                <span key={s.t} className="ms__seg" data-tone={s.tone ?? 'paper'} style={{ flexBasis: `${(s.w / max) * 100}%` }}>
                  <span className="ms__fill" />
                  <span className="ms__t">{s.t}</span>
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <figcaption className="note dg__caption">{copy.caption}</figcaption>
    </InView>
  );
}
