'use client';

import { useRef } from 'react';
import { REPLAY_REVEAL } from '@/v2/motion/events';

/** Plays again the entrance of everything inside the nearest `[data-replay]` (the demo on /motion/). */
export function ReplayButton({ label }: { label: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      type="button"
      className="ui-btn ui-btn--secondary ui-btn--sm"
      onClick={() => ref.current?.closest('[data-replay]')?.dispatchEvent(new Event(REPLAY_REVEAL, { bubbles: true }))}
    >
      <span>{label}</span>
    </button>
  );
}
