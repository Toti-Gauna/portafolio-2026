'use client';

import { useState } from 'react';

type Level = { name: string; phrase: string; who: string; adds: string[] };

/**
 * Eclipse's six monthly levels as a staircase (lote 6.2): each step is a button; the chosen one shows what it adds
 * on top of the one before («Todo Growth +»). The HTML shows the first; every level is a real button.
 */
export function Ladder({ levels, labels, n }: { levels: Level[]; labels: { includes: string; who: string; all: string }; n: number }) {
  const [on, setOn] = useState(0);
  const l = levels[on];
  return (
    <div className="bz-ladder">
      <div className="bz-steps" role="group" aria-label={labels.includes}>
        {levels.slice(0, n).map((x, i) => (
          <button key={x.name} type="button" className="bz-step" aria-pressed={i === on} onClick={() => setOn(i)} onMouseEnter={(e) => { if (window.matchMedia('(hover: hover)').matches) setOn(i); void e; }} style={{ ['--h' as string]: `${30 + (i * 70) / (n - 1)}%` }}>
            <span className="bz-step-bar" aria-hidden="true" />
            <b>{x.name}</b>
          </button>
        ))}
      </div>
      <div className="bz-level" aria-live="polite">
        <p className="bz-level-k">{String(on + 1).padStart(2, '0')} · {l.name}</p>
        <p className="bz-level-t">{l.phrase}</p>
        <p className="bz-level-who"><b>{labels.who}:</b> {l.who}</p>
        <p className="bz-level-inc">{labels.includes}</p>
        <ul>
          {on > 0 && <li className="bz-level-all">{labels.all} {levels[on - 1].name}</li>}
          {l.adds.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </div>
    </div>
  );
}
