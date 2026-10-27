'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

/** Adds `data-in` once the block enters the viewport (one IntersectionObserver per block, once). CSS does the motion. */
export function Reveal({ as: Tag = 'div', className, children }: { as?: ElementType; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.setAttribute('data-in', '');
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.setAttribute('data-in', ''); io.disconnect(); }
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`reveal${className ? ` ${className}` : ''}`}>{children}</Tag>;
}
