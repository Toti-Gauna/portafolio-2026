'use client';

import { primeTrailer } from '@/lib/trailer-prime';

export const OPEN_TRAILER_EVENT = 'ig:open-trailer';

export function TrailerButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => { primeTrailer(); window.dispatchEvent(new Event(OPEN_TRAILER_EVENT)); }}>
      {children}
    </button>
  );
}
