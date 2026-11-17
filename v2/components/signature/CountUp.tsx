'use client';

import { type CSSProperties, useRef, useState } from 'react';
import { reducedMotion, useInView, useIsoLayoutEffect } from './hooks';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * A figure whose digits roll to their value the first time it is on screen (transform only).
 * Rendered at its final value: without JavaScript, or with reduced motion, it simply shows the number.
 * `value` is the formatted figure («1.374»); screen readers get it as plain text.
 */
export function CountUp({ value, replayKey = 0 }: { value: string; replayKey?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, threshold: 0.6 });
  const [run, setRun] = useState(true);
  // before the first paint: wind back to zero, unless the visitor asked for no motion
  useIsoLayoutEffect(() => { if (!reducedMotion()) setRun(false); }, [replayKey]);
  useIsoLayoutEffect(() => {
    if (!inView || run) return;
    const id = requestAnimationFrame(() => setRun(true));
    return () => cancelAnimationFrame(id);
  }, [inView, run]);
  let k = 0;
  return (
    <span className="sig-count" ref={ref} data-run={run ? '1' : '0'}>
      <span className="ui-sr">{value}</span>
      <span aria-hidden="true" className="sig-count-row">
        {[...value].map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={i} className="sig-digit" style={{ '--d': Number(ch), '--k': k++ } as CSSProperties}>
              <span>{DIGITS.map((d) => <span key={d}>{d}</span>)}</span>
            </span>
          ) : (
            <span key={i} className="sig-count-sep">{ch}</span>
          ),
        )}
      </span>
    </span>
  );
}
