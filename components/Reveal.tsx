'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { observe } from '@/lib/observe';

/** Adds `data-in` once the block enters the viewport (pooled observer, lib/observe.ts). CSS does the motion. */
export function Reveal({ as: Tag = 'div', className, children }: { as?: ElementType; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => (ref.current ? observe(ref.current) : undefined), []);
  return <Tag ref={ref} className={`reveal${className ? ` ${className}` : ''}`}>{children}</Tag>;
}
