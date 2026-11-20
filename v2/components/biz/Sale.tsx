'use client';

import { type CSSProperties, useId, useState } from 'react';
import { SALE_BEATS, SALE_LENGTH } from './data';

type Beat = { t: string; d: string };
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/**
 * The ten-minute demo meeting (lote 6.2), as a timeline: a range moves through the minutes (keyboard included),
 * each beat is a button on the track, and the card says what happens at that minute.
 */
export function Meeting({ beats, label }: { beats: Beat[]; label: string }) {
  const [t, setT] = useState(0);
  const id = useId();
  const on = SALE_BEATS.reduce((k, s, i) => (s <= t ? i : k), 0);
  return (
    <div className="bz-meet">
      <div className="bz-track" style={{ '--p': t / SALE_LENGTH } as CSSProperties}>
        <span className="bz-track-fill" aria-hidden="true" />
        <ol className="bz-beats">
          {beats.map((b, i) => (
            <li key={b.t} style={{ left: `${(SALE_BEATS[i] / SALE_LENGTH) * 100}%` }}>
              <button type="button" aria-pressed={i === on} aria-label={`${clock(SALE_BEATS[i])} · ${b.t}`} onClick={() => setT(SALE_BEATS[i])} data-done={i < on || undefined} />
            </li>
          ))}
        </ol>
      </div>
      <label className="bz-scrub" htmlFor={id}>
        <span>{label}</span>
        <input id={id} type="range" min={0} max={SALE_LENGTH} step={15} value={t} onChange={(e) => setT(Number(e.currentTarget.value))} aria-valuetext={`${clock(t)} · ${beats[on].t}`} />
      </label>
      <div className="bz-meet-card" aria-live="polite">
        <p className="bz-meet-k">{clock(SALE_BEATS[on])}</p>
        <p className="bz-meet-t">{beats[on].t}</p>
        <p className="bz-meet-d">{beats[on].d}</p>
      </div>
      <ol className="bz-meet-list">{beats.map((b, i) => <li key={b.t}><code>{clock(SALE_BEATS[i])}</code> <b>{b.t}</b> {b.d}</li>)}</ol>
    </div>
  );
}
