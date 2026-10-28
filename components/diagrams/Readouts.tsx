import type { CSSProperties } from 'react';
import { InView } from './InView';
import './readouts.css';

export type Readout = { n: string; u?: string; d: string };

/** Numbers that roll into place like an instrument (transform only). The real value is text for everyone else. */
export function Odometer({ value }: { value: string }) {
  let k = 0;
  return (
    <span className="odo">
      <span aria-hidden="true" className="odo__digits">
        {Array.from(value).map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={i} className="odo__d" style={{ '--v': Number(ch), '--k': k++ } as CSSProperties}>
              <span>{'0123456789'.split('').map((d) => <span key={d}>{d}</span>)}</span>
            </span>
          ) : <span key={i} className="odo__s">{ch}</span>,
        )}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}

export function Readouts({ items, note, className }: { items: Readout[]; note?: string; className?: string }) {
  return (
    <InView className={`ro${className ? ` ${className}` : ''}`}>
      <dl className="ro__list">
        {items.map((it) => (
          <div key={it.d} className="ro__item">
            <dt className="ro__d">{it.d}</dt>
            <dd className="ro__n"><Odometer value={it.n} />{it.u && <span className="ro__u">{it.u}</span>}</dd>
          </div>
        ))}
      </dl>
      {note && <p className="note ro__note">{note}</p>}
    </InView>
  );
}
