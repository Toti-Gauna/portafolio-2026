'use client';

import { type RefObject, useEffect, useLayoutEffect, useState } from 'react';

export const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** True while the element is on screen (nothing runs off screen); with `once`, stays true after the first time. */
export function useInView(ref: RefObject<Element | null>, { once = false, threshold = 0.35 } = {}): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting);
      if (e.isIntersecting && once) io.disconnect();
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, threshold]);
  return inView;
}
