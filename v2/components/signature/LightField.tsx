'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { finePointer, reducedMotion } from './hooks';

/** Size of one cell of the lit dot pattern, in px (signature.css uses the same value). */
const PITCH = 24;

/**
 * A light that follows the pointer and switches on what it touches: a round window (soft mask) moves with
 * transform over a brighter dot pattern, which counter-moves so the dots stay put.
 * It eases toward the pointer and stops its loop once it arrives or the pointer leaves. Touch screens and
 * reduced motion keep the light still at its resting spot.
 */
export function LightField({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer() || reducedMotion()) return;
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0, started = false;
    const tick = () => {
      x += (tx - x) * 0.16; y += (ty - y) * 0.16;
      el.style.setProperty('--lx', `${x.toFixed(1)}px`);
      el.style.setProperty('--ly', `${y.toFixed(1)}px`);
      // the lit dots stay put while the window moves: shift the pattern back by the offset within one cell
      el.style.setProperty('--mx', `${(-(x % PITCH)).toFixed(1)}px`);
      el.style.setProperty('--my', `${(-(y % PITCH)).toFixed(1)}px`);
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.4 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top;
      if (!started) { x = tx; y = ty; started = true; el.dataset.live = '1'; }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const leave = () => { cancelAnimationFrame(raf); raf = 0; started = false; delete el.dataset.live; };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, []);
  return (
    <div className={['sig-light', className].filter(Boolean).join(' ')} ref={ref}>
      <span className="sig-light-win" aria-hidden="true"><span className="sig-light-lit" /></span>
      {children}
    </div>
  );
}
