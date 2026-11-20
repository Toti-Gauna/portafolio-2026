'use client';

import { useState } from 'react';

/** «Solo forma y color»: hides the names on the wall, to tell the brands apart by what they look like. */
export function WallBlind({ label, wall }: { label: string; wall: string }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button" className="blw-blind" aria-pressed={on}
      onClick={() => { const next = !on; setOn(next); document.getElementById(wall)?.toggleAttribute('data-blind', next); }}
    >
      <i aria-hidden="true" />{label}
    </button>
  );
}
