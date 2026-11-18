'use client';

import { OPEN_SHORTCUTS } from '@/v2/motion/events';

/** Opens the shortcuts help from anywhere (the foot); it works even with the one-key shortcuts turned off. */
export function ShortcutsButton({ label }: { label: string }) {
  return (
    <button type="button" className="v2-keys-btn" onClick={() => window.dispatchEvent(new Event(OPEN_SHORTCUTS))}>
      <span>{label}</span>
      <kbd className="ui-kbd" aria-hidden="true">?</kbd>
    </button>
  );
}
