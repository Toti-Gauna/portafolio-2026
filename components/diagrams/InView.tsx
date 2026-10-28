'use client';

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { observe } from '@/lib/observe';

/** Marks its block `data-in` when it enters the viewport (and `data-live` while on screen if `live`). CSS does the motion. */
export function InView({ as: Tag = 'div', className, live = false, style, children, ...rest }: {
  as?: ElementType; className?: string; live?: boolean; style?: CSSProperties; children: ReactNode; [k: `aria-${string}`]: string | undefined; role?: string; id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => (ref.current ? observe(ref.current, live) : undefined), [live]);
  return <Tag ref={ref} className={className} style={style} {...rest}>{children}</Tag>;
}
