'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { reducedMotion, useInView, useIsoLayoutEffect } from './hooks';

export type Verb = { text: string; from: string; to: string };

const STEP_MS = 720;

/**
 * Verbs in pills that light up one by one, once, when they come on screen; the last one stays lit.
 * Finite on purpose (no loop to pause). Rendered in its final state: no JavaScript or reduced motion = the end frame.
 * step: -1 hidden · 0..n-1 that verb is lit (earlier ones stay outlined in their colour).
 */
export function KineticVerbs({ verbs, replayKey = 0 }: { verbs: Verb[]; replayKey?: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, threshold: 0.6 });
  const last = verbs.length - 1;
  const [step, setStep] = useState(last);
  const [armed, setArmed] = useState(false);
  useIsoLayoutEffect(() => { if (!reducedMotion()) { setStep(-1); setArmed(true); } }, [replayKey]);
  useEffect(() => {
    if (!armed || !inView) return;
    const timers = verbs.map((_, i) => window.setTimeout(() => setStep(i), 120 + i * STEP_MS));
    const done = window.setTimeout(() => setArmed(false), 120 + last * STEP_MS);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [armed, inView, verbs, last]);
  return (
    <p className="sig-verbs" ref={ref}>
      {verbs.map((v, i) => (
        <span key={v.text} className="sig-verb" data-state={step < i ? 'wait' : step === i ? 'on' : 'done'} style={{ '--from': v.from, '--to': v.to } as CSSProperties}>
          <span>{v.text}</span>
        </span>
      ))}
    </p>
  );
}
