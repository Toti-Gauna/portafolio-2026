'use client';

import { useEffect, useState } from 'react';
import { SoundIcon } from './Icons';

const KEY = 'ig:v2:sound';

/**
 * Sound off by default (CLAUDE.md). The choice is remembered on this device; the sound engine (lote 2.3)
 * reads the same key and the `ig:v2:sound` event.
 */
export function SoundToggle({ label, on, off }: { label: string; on: string; off: string }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    try { setEnabled(localStorage.getItem(KEY) === 'on'); } catch { /* storage blocked: stays off */ }
  }, []);
  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    try { localStorage.setItem(KEY, next ? 'on' : 'off'); } catch { /* not remembered */ }
    window.dispatchEvent(new CustomEvent('ig:v2:sound', { detail: { on: next } }));
  };
  return (
    <button type="button" className="ui-sound" aria-pressed={enabled} onClick={toggle} title={enabled ? on : off}>
      <SoundIcon on={enabled} />
      <span className="ui-sound-label">{label}</span>
    </button>
  );
}
