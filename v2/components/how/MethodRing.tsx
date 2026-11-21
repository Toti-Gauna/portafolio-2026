'use client';

import { type CSSProperties, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { RING_STEP_MS } from './flow';

type Step = { name: string; short: string; text: string; example: string };
type Labels = { ring: string; walk: string; pause: string; replay: string; step: string; of: string; did: string; back: string };

const N = 6, R = 38;
const at = (i: number) => { const a = ((-90 + (i * 360) / N) * Math.PI) / 180; return { x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a) }; };
/** the arc from one step to the next, on the ring (an SVG path in the 0–100 box) */
const arc = (i: number) => { const p = at(i), q = at((i + 1) % N); return `M${p.x.toFixed(2)} ${p.y.toFixed(2)}A${R} ${R} 0 0 1 ${q.x.toFixed(2)} ${q.y.toFixed(2)}`; };

/**
 * The method as a cycle (lote 7.3): six steps around a ring, each a button that opens its card — what the step is
 * and what I did there —; the arcs between them light up to the current one (stroke-dashoffset), and the last arc,
 * from «Entregar» back to «Entender», is the cycle itself. «Recorrer el ciclo» walks it once, a step every
 * RING_STEP_MS, lights the return and stops; off screen it pauses. Arrows, Home and End move between the steps.
 */
export function MethodRing({ steps, labels: L }: { steps: Step[]; labels: Labels }) {
  const [on, setOn] = useState(0);
  const [walk, setWalk] = useState<'idle' | 'play' | 'done'>('idle');
  const [back, setBack] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (walk !== 'play') return;
    const t = window.setTimeout(() => {
      if (on < N - 1) setOn(on + 1);
      else { setBack(true); setWalk('done'); }
    }, RING_STEP_MS);
    return () => window.clearTimeout(t);
  }, [walk, on]);
  useEffect(() => {
    const el = root.current;
    if (!el || walk !== 'play') return;
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) setWalk('idle'); }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [walk]);

  const pick = (i: number, focus = false) => {
    const k = (i + N) % N;
    setWalk('idle');
    setBack(false);
    setOn(k);
    if (focus) list.current?.querySelectorAll<HTMLButtonElement>('button')[k]?.focus();
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); pick(i + 1, true); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); pick(i - 1, true); }
    else if (e.key === 'Home') { e.preventDefault(); pick(0, true); }
    else if (e.key === 'End') { e.preventDefault(); pick(N - 1, true); }
  };
  const toggle = () => {
    if (walk === 'play') { setWalk('idle'); return; }
    if (walk === 'done' || on === N - 1) { setOn(0); setBack(false); }
    setWalk('play');
  };
  const s = steps[on], nn = (i: number) => String(i + 1).padStart(2, '0');

  return (
    <div ref={root} className="mr" data-walk={walk}>
      <div className="mr-ring" role="group" aria-label={L.ring}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={R} className="mr-base" />
          {Array.from({ length: N }, (_, i) => (
            <path key={i} d={arc(i)} pathLength={1} className={i === N - 1 ? 'mr-arc mr-back' : 'mr-arc'} data-on={(i === N - 1 ? back : i < on) ? '' : undefined} />
          ))}
          <path d="M0 -2.4L4 0L0 2.4z" className="mr-head" transform={`translate(${at(0).x - 0.6} ${at(0).y}) rotate(0)`} data-on={back ? '' : undefined} />
        </svg>
        <p className="mr-center" aria-hidden="true">
          <b>{nn(on)}</b>
          <span>{s.short}</span>
          {back && <em>{L.back}</em>}
        </p>
        <ol ref={list} className="mr-steps">
          {steps.map((x, i) => {
            const p = at(i);
            return (
              <li key={x.name} style={{ left: `${p.x}%`, top: `${p.y}%`, '--i': i } as CSSProperties} data-side={p.x > 55 ? 'r' : p.x < 45 ? 'l' : p.y < 50 ? 't' : 'b'}>
                <button type="button" aria-pressed={i === on} aria-controls="mr-card" data-done={i < on ? '' : undefined} onClick={() => pick(i)} onKeyDown={(e) => onKey(e, i)}>
                  <b>{i + 1}</b>
                  <span className="mr-label">{x.short}</span>
                  <span className="ui-sr">: {x.name}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div id="mr-card" className="mr-card">
        <p className="mr-k" aria-live="polite">{L.step} {on + 1} {L.of} {N}</p>
        <h3>{s.name}</h3>
        <p className="mr-text">{s.text}</p>
        <div className="mr-did">
          <h4>{L.did}</h4>
          <p>{s.example}</p>
        </div>
        <button type="button" className="ui-btn ui-btn--secondary ui-btn--md mr-walk" aria-pressed={walk === 'play'} onClick={toggle}>
          <span>{walk === 'play' ? L.pause : walk === 'done' ? L.replay : L.walk}</span>
        </button>
      </div>
      <ol className="mr-all">
        {steps.map((x, i) => (
          <li key={x.name}><b>{nn(i)} · {x.name}</b><span>{x.text}</span><span><em>{L.did}:</em> {x.example}</span></li>
        ))}
      </ol>
    </div>
  );
}
