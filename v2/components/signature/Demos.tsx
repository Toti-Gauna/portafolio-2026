'use client';

import { type CSSProperties, useState } from 'react';
import { CountUp } from './CountUp';
import { KineticVerbs, type Verb } from './KineticVerbs';

const ReplayIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 8a5.5 5.5 0 1 1-1.7-4" /><path d="M13.6 1.6V5h-3.4" /></svg>
);

/** The verbs, with a button to see them run again (the catalogue only: on a page they run once). */
export function VerbsDemo({ verbs, replay }: { verbs: Verb[]; replay: string }) {
  const [k, setK] = useState(0);
  return (
    <div className="sig-demo">
      <KineticVerbs verbs={verbs} replayKey={k} />
      <button type="button" className="ui-btn ui-btn--secondary ui-btn--sm" onClick={() => setK((n) => n + 1)}><ReplayIcon /><span>{replay}</span></button>
    </div>
  );
}

export function CountersDemo({ items, replay }: { items: { value: string; label: string; from: string }[]; replay: string }) {
  const [k, setK] = useState(0);
  return (
    <div className="sig-demo">
      <div className="sig-counters">
        {items.map((it) => (
          <p key={it.label} className="sig-counter" style={{ '--from': it.from } as CSSProperties}>
            <b><CountUp value={it.value} replayKey={k} /></b>
            <span>{it.label}</span>
          </p>
        ))}
      </div>
      <button type="button" className="ui-btn ui-btn--secondary ui-btn--sm" onClick={() => setK((n) => n + 1)}><ReplayIcon /><span>{replay}</span></button>
    </div>
  );
}
