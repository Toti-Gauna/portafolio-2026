'use client';

import { type CSSProperties, type KeyboardEvent, type ReactNode, useRef, useState } from 'react';
import { STOPS, TSOFT, YEARS } from './timeline';

type Words = { when: string; short: string; title: string };

/**
 * The timeline of «Sobre mí» (lote 7.1), 2021 → today. On a wide screen it is a chart: the years across, a bar for
 * each place the record dates (TACH, Ada ITW, Tsoft), the seed before the axis, the four moments at Tsoft inside its
 * band and my own paths at the end; every one is a button that opens its card (arrows move along the eight). On a
 * narrow screen, and without JavaScript, the chart steps aside and the eight cards are simply there, one after the
 * other on a line. Nothing moves by itself.
 */
export function Timeline({ words, cards, labels }: { words: Record<string, Words>; cards: ReactNode[]; labels: { chart: string; today: string; tsoft: string } }) {
  const [on, setOn] = useState(STOPS.findIndex((s) => s.id === 'ai'));
  const root = useRef<HTMLDivElement>(null);
  const go = (i: number) => {
    const k = Math.max(0, Math.min(STOPS.length - 1, i));
    setOn(k);
    root.current?.querySelector<HTMLButtonElement>(`[data-stop="${STOPS[k].id}"]`)?.focus();
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(i - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(STOPS.length - 1); }
  };
  const col = (y: number) => YEARS.indexOf(y as (typeof YEARS)[number]) + 2;
  const btn = (id: string, extra?: CSSProperties) => {
    const i = STOPS.findIndex((s) => s.id === id), s = STOPS[i], w = words[id];
    return (
      <button
        key={id} type="button" className="tl-btn" data-stop={id} data-kind={s.kind} aria-pressed={on === i} aria-controls="tl-cards"
        style={{ '--c': s.color, ...extra } as CSSProperties} onClick={() => setOn(i)} onKeyDown={(e) => onKey(e, i)}
      >
        <i aria-hidden="true" /><span>{w.short}</span>
      </button>
    );
  };
  const moments = STOPS.filter((s) => s.kind === 'moment');
  return (
    <div ref={root} className="tl">
      <div className="tl-chart" role="group" aria-label={labels.chart} style={{ '--years': YEARS.length } as CSSProperties}>
        <div className="tl-axis" aria-hidden="true">
          {YEARS.map((y) => <span key={y} style={{ gridColumn: col(y) }}>{y}</span>)}
          <span style={{ gridColumn: YEARS.length + 2 }}>{labels.today}</span>
        </div>
        {btn('seed', { gridColumn: 1, gridRow: 2 })}
        {STOPS.filter((s) => s.kind === 'job').map((s, k) => btn(s.id, { gridColumn: `${col(s.span![0])} / ${col(s.span![1]) + 1}`, gridRow: 2 + k }))}
        <div className="tl-band" style={{ gridColumn: `${col(TSOFT.span[0])} / ${YEARS.length + 3}`, gridRow: 4, '--c': TSOFT.color } as CSSProperties}>
          <b>{labels.tsoft}</b>
          <div className="tl-moments">{moments.map((m) => btn(m.id))}</div>
        </div>
        {btn('own', { gridColumn: `${YEARS.length + 1} / ${YEARS.length + 3}`, gridRow: 5 })}
      </div>
      <ol id="tl-cards" className="tl-cards">
        {STOPS.map((s, i) => <li key={s.id} className="tl-card" data-off={i === on ? undefined : ''} style={{ '--c': s.color } as CSSProperties}>{cards[i]}</li>)}
      </ol>
    </div>
  );
}
