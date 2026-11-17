'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { finePointer, reducedMotion } from './hooks';

const MAX = 11; // degrees

/**
 * A glass panel with real depth: it rests slightly turned, follows a fine pointer, and children marked with
 * `data-depth` float at their own height (translateZ). Touch screens and reduced motion keep the resting pose.
 * Writes CSS variables straight to the node (no React state per frame).
 */
export function TiltPanel({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer() || reducedMotion()) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--ry', `${((px - 0.5) * 2 * MAX).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${((0.5 - py) * 2 * MAX).toFixed(2)}deg`);
        el.style.setProperty('--gx', `${(px * r.width).toFixed(1)}px`);
        el.style.setProperty('--gy', `${(py * r.height).toFixed(1)}px`);
        el.dataset.live = '1';
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      for (const p of ['--rx', '--ry', '--gx', '--gy']) el.style.removeProperty(p);
      delete el.dataset.live;
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, []);
  return (
    <div className={['sig-tilt', className].filter(Boolean).join(' ')} ref={ref}>
      <div className="sig-tilt-body">
        {children}
        <span className="sig-tilt-glare" aria-hidden="true" />
      </div>
    </div>
  );
}
