'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { LOOP_STEP_MS } from './data';

type Step = { t: string; d: string };

/**
 * A growth loop as a ring (lote 6.2): its steps around a circle, the arc lit up to the current one
 * (stroke-dashoffset). Every step is a button; «Recorrer el ciclo» walks the ring once, a step every
 * LOOP_STEP_MS, and stops back at the first. Off screen it pauses; nothing loops by itself.
 */
export function Loop({ title, steps, labels }: { title: string; steps: Step[]; labels: { play: string; pause: string; step: string; of: string } }) {
  const n = steps.length;
  const [on, setOn] = useState(0);
  const [playing, setPlaying] = useState(false);
  const left = useRef(0);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!playing) return;
    if (left.current <= 0) { setPlaying(false); return; }
    const t = window.setTimeout(() => { left.current -= 1; setOn((s) => (s + 1) % n); }, LOOP_STEP_MS);
    return () => window.clearTimeout(t);
  }, [playing, on, n]);
  useEffect(() => {
    const el = root.current;
    if (!el || !playing) return;
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) setPlaying(false); }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [playing]);
  const play = () => { if (playing) { setPlaying(false); return; } left.current = n - on; setPlaying(true); };
  const at = (i: number) => { const a = ((-90 + (i * 360) / n) * Math.PI) / 180; return { x: 50 + 40 * Math.cos(a), y: 50 + 40 * Math.sin(a) }; };
  const s = steps[on];
  return (
    <div ref={root} className="bz-loop">
      <div className="bz-ring">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="40" className="bz-ring-base" />
          <circle cx="50" cy="50" r="40" className="bz-ring-on" pathLength={n} strokeDasharray={`${n} ${n}`} style={{ strokeDashoffset: n - on } as CSSProperties} transform="rotate(-90 50 50)" />
        </svg>
        <p className="bz-ring-title" aria-hidden="true"><b>{title}</b><span>{on + 1} / {n}</span></p>
        <ol className="bz-ring-steps">
          {steps.map((x, i) => {
            const p = at(i);
            return (
              <li key={x.t} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                <button type="button" aria-pressed={i === on} aria-label={`${labels.step} ${i + 1}: ${x.t}`} data-done={i < on || undefined} onClick={() => { setPlaying(false); setOn(i); }}>{i + 1}</button>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="bz-loop-card">
        <p className="bz-loop-k">{labels.step} {on + 1} {labels.of} {n}</p>
        <p className="bz-loop-t" aria-live="polite">{s.t}</p>
        <p className="bz-loop-d">{s.d}</p>
        <button type="button" className="bz-play" aria-pressed={playing} onClick={play}>
          {playing
            ? <svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" /></svg>
            : <svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><path d="M2.5 1l8.5 5-8.5 5z" fill="currentColor" /></svg>}
          {playing ? labels.pause : labels.play}
        </button>
        <ol className="bz-loop-list">{steps.map((x) => <li key={x.t}><b>{x.t}</b> {x.d}</li>)}</ol>
      </div>
    </div>
  );
}
