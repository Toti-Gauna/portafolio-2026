'use client';

import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { reducedMotion } from '../../signature/hooks';

/** How long each step of the first tour lasts: five steps stay under five seconds (WCAG 2.2.2). */
export const HOW_STEP_MS = 950;

/**
 * «Cómo funciona», told by the object of the case (lote 5.3). The object (object-art.ts, drawn at build time) has
 * one phase per step; every step is a button: pointing at it, focusing it or pressing it shows its phase — its part
 * comes in or lights up. The first time the figure is on screen it goes through the steps once (under five seconds)
 * and stays whole. The HTML is the last phase: without JavaScript or with reduced motion the object is complete and
 * the steps still show each phase on request. Timers only while touring; nothing else asks for frames.
 */
export function CaseHow({ svg, box, steps, color, label }: { svg: string; box: [number, number, number, number]; steps: { t: string; d: string }[]; color: string; label: string }) {
  const fig = useRef<HTMLElement>(null);
  const last = steps.length - 1;
  const [phase, setPhase] = useState(last);
  const [touring, setTouring] = useState(false);

  const paint = useCallback((ph: number) => {
    const root = fig.current?.querySelector('svg');
    if (!root) return;
    root.querySelectorAll<SVGElement>('[data-from]').forEach((el) => el.toggleAttribute('data-on', Number(el.dataset.from) <= ph));
    root.querySelectorAll<SVGElement>('[data-only], [data-now]').forEach((el) => el.toggleAttribute('data-on', Number(el.dataset.only ?? el.dataset.now) === ph));
  }, []);
  useEffect(() => { paint(phase); }, [phase, paint]);

  /* the first time it is on screen: from nothing, one step after another, then whole */
  useEffect(() => {
    const el = fig.current;
    if (!el || reducedMotion()) return;
    let done = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done) return;
      done = true;
      io.disconnect();
      setPhase(0);
      setTouring(true);
    }, { threshold: 0.45 });
    // before it is seen, the object waits empty (it is off screen: nobody sees it go)
    if (el.getBoundingClientRect().top > innerHeight) setPhase(-1);
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!touring) return;
    if (phase >= last) { setTouring(false); return; }
    const t = window.setTimeout(() => setPhase((p) => p + 1), HOW_STEP_MS);
    return () => window.clearTimeout(t);
  }, [touring, phase, last]);

  const show = (i: number) => { setTouring(false); setPhase(i); };
  return (
    <div className="ch" style={{ '--c': color } as CSSProperties}>
      <div className="ch-in">
        <figure ref={fig} className="ch-fig">
          <svg className="wa ch-svg" viewBox={box.join(' ')} role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: svg }} />
        </figure>
        <ol className="ch-steps">
          {steps.map((s, i) => (
            <li key={s.t}>
              <button
                type="button" className="ch-step" aria-pressed={i === phase}
                onClick={() => show(i)} onFocus={() => show(i)}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') show(i); }}
              >
                <i aria-hidden="true">{i + 1}</i>
                <b>{s.t}</b>
                <span>{s.d}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
