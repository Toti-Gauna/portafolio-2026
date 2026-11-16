'use client';

import { useEffect, useState } from 'react';
import { SOUND_EVENT, isSoundOn, playCue, setSound } from '@/lib/sound';

/** Botón de sonido del header (apagado por defecto; las puertas de la entrada lo encienden). El texto viene de props. */
export function SoundToggle({ on: labelOn, off: labelOff }: { on: string; off: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(isSoundOn());
    const h = (e: Event) => setOn(Boolean((e as CustomEvent<{ on: boolean }>).detail?.on));
    window.addEventListener(SOUND_EVENT, h);
    return () => window.removeEventListener(SOUND_EVENT, h);
  }, []);
  return (
    <button
      type="button"
      className="sound-toggle"
      aria-pressed={on}
      aria-label={on ? labelOff : labelOn}
      data-on={on || undefined}
      onClick={() => {
        const next = !isSoundOn();
        setSound(next);
        if (next) playCue('click');
      }}
    >
      <svg viewBox="0 0 22 14" aria-hidden="true">
        {[0, 5, 10, 15, 20].map((x, i) => (
          <rect key={x} x={x} y="0" width="2" height="14" style={{ '--i': i } as React.CSSProperties} />
        ))}
      </svg>
    </button>
  );
}
