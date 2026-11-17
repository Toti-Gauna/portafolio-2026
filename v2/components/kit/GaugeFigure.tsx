'use client';

import { useEffect, useRef } from 'react';
import { type Projection, translateAlong } from '@/v2/iso/iso-kit';
import { CARRIAGE_TOP, CHANGES, PER_TURN, REACH, STOPS, changeUnder, heightUnder, passes } from './gauge-model';
import { needlePath } from './gauge-needle';

export type GaugeLabels = { stage: string; change: string; between: string; reads: string; pass: string; fail: string };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const fmt = (n: number, locale: string) => n.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/**
 * Makes the gauge live: the pointer (or the arrow keys) slides the carriage, the plunger rides onto the
 * change under it on a real spring, the needle turns by the same amount and the lamp says whether that
 * change is inside the band. On first view it tours the five changes once (under 5 s), then waits for you.
 * It writes attributes straight to the SVG, runs only on screen and settles; reduced motion jumps.
 */
export function GaugeFigure({ svg, P, labels, locale }: { svg: string; P: Projection; labels: GaugeLabels; locale: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = stage.current!;
    const root = el.querySelector('svg')!;
    const part = (n: string) => root.querySelector(`[data-part="${n}"]`)!;
    const carriage = part('carriage'), plunger = part('plunger'), needle = part('needle'), lamp = part('lamp');
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    let x = STOPS[0], target = x, tipAt = CARRIAGE_TOP + CHANGES[0], rate = 0;
    let frame = 0, last = 0, clock = 0, touring = !still.matches, visible = false;
    const draw = () => {
      carriage.setAttribute('transform', translateAlong(P, [x, 0, 0]));
      plunger.setAttribute('transform', translateAlong(P, [0, 0, tipAt]));
      const h = tipAt - CARRIAGE_TOP;
      needle.setAttribute('d', needlePath(h / PER_TURN, P));
      const i = changeUnder(x), ok = i >= 0 && passes(CHANGES[i]);
      lamp.setAttribute('data-state', i < 0 ? 'idle' : ok ? 'pass' : 'fail');
      const text = i < 0 ? labels.between : `${labels.change.replace('{n}', String(i + 1))} · ${labels.reads.replace('{h}', fmt(h, locale))} · ${ok ? labels.pass : labels.fail}`;
      if (readout.current && readout.current.textContent !== text) readout.current.textContent = text;
      el.setAttribute('aria-valuenow', String(Math.max(1, i + 1)));
      el.setAttribute('aria-valuetext', text);
    };
    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      const calm = still.matches;
      if (touring) {
        clock += dt;
        const step = Math.floor(clock / 1.15);
        if (step >= STOPS.length) touring = false; else target = STOPS[step];
      }
      x = calm ? target : x + (target - x) * (1 - Math.exp(-dt / 0.24));
      if (Math.abs(target - x) < 0.01) x = target;
      const want = heightUnder(x);
      if (calm) { tipAt = want; rate = 0; } else {
        for (let i = 0; i < 4; i++) { rate += ((want - tipAt) * 420 - rate * 26) * dt / 4; tipAt += rate * dt / 4; }
        if (Math.abs(want - tipAt) < 0.005 && Math.abs(rate) < 0.005) { tipAt = want; rate = 0; }
      }
      draw();
      const settled = !touring && x === target && rate === 0 && tipAt === want;
      frame = visible && !settled ? requestAnimationFrame(tick) : 0;
    };
    const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
    const steer = (next: number) => { touring = false; target = clamp(next, REACH[0], REACH[1]); run(); };
    const io = new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { threshold: 0.3 });
    io.observe(el);
    const move = (e: PointerEvent) => {
      const box = root.getBoundingClientRect();
      const share = clamp(((e.clientX - box.left) / box.width - 0.25) / 0.5, 0, 1);
      steer(REACH[0] + share * (REACH[1] - REACH[0]));
    };
    const key = (e: KeyboardEvent) => {
      const here = STOPS.reduce((best, stop, i) => (Math.abs(stop - target) < Math.abs(STOPS[best] - target) ? i : best), 0);
      let to: number | null = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = Math.min(STOPS.length - 1, here + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = Math.max(0, here - 1);
      if (e.key === 'Home') to = 0;
      if (e.key === 'End') to = STOPS.length - 1;
      if (to === null) return;
      e.preventDefault();
      steer(STOPS[to]);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerdown', move);
    el.addEventListener('keydown', key);
    draw();
    return () => { cancelAnimationFrame(frame); io.disconnect(); el.removeEventListener('pointermove', move); el.removeEventListener('pointerdown', move); el.removeEventListener('keydown', key); };
  }, [P, labels, locale]);
  return (
    <>
      <div className="kit-stage" ref={stage} tabIndex={0} role="slider" aria-label={labels.stage} aria-valuemin={1} aria-valuemax={CHANGES.length} aria-valuenow={1} dangerouslySetInnerHTML={{ __html: svg }} />
      <span className="kit-corner" data-corner="readout" ref={readout} />
    </>
  );
}
