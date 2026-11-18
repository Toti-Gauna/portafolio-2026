'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GATE_EVENT, gateOpen, type Step } from '@/v2/gate/state';

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * What every version of the gate shares: whether it is open (the layout's script decided before the first
 * paint), the page under it kept inert, the real loading (the script, the fonts and the page itself; the
 * «scene» step belongs to each version), and how it opens: Enter, Escape or its second door.
 * `exit` is the version's own way out; the gate is gone when it resolves (at least `ms` later).
 */
export function useGate(exit?: () => Promise<void> | void, ms = 520) {
  const root = useRef<HTMLDivElement>(null);
  const release = useRef<() => void>(() => {});
  const way = useRef(exit);
  way.current = exit;
  const [open, setOpen] = useState(true);
  const [done, setDone] = useState<Step[]>([]);
  const [leaving, setLeaving] = useState(false);
  const mark = useCallback((s: Step) => setDone((d) => (d.includes(s) ? d : [...d, s])), []);

  useEffect(() => {
    if (!gateOpen()) { setOpen(false); return; }
    const html = document.documentElement;
    html.dataset.gateLive = 'true';
    // everything under the gate waits: no focus, no clicks, no screen reader
    const under = [...document.querySelectorAll<HTMLElement>('.sh, .v2-skip, .v2-page > :not(.gt)')];
    under.forEach((el) => { el.inert = true; });
    release.current = () => { under.forEach((el) => { el.inert = false; }); delete html.dataset.gateLive; release.current = () => {}; };
    // focus goes to the gate itself: Enter opens it, and no door is marked until Tab reaches it
    root.current?.focus({ preventScroll: true });
    return () => release.current();
  }, []);

  useEffect(() => {
    if (!open) return;
    mark('dom');
    let alive = true;
    (document.fonts?.ready ?? Promise.resolve()).then(() => alive && mark('fonts'));
    const loaded = () => alive && mark('page');
    if (document.readyState === 'complete') loaded(); else window.addEventListener('load', loaded, { once: true });
    return () => { alive = false; window.removeEventListener('load', loaded); };
  }, [open, mark]);

  const enter = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    window.dispatchEvent(new CustomEvent(GATE_EVENT, { detail: { action: 'enter' } }));
    const finish = () => {
      document.documentElement.dataset.gate = 'off';
      release.current(); // the page under the gate is live again before focus moves into it
      setOpen(false);
      document.getElementById('main')?.focus({ preventScroll: true });
    };
    if (reducedMotion()) { finish(); return; }
    void Promise.all([way.current?.() ?? Promise.resolve(), new Promise((r) => setTimeout(r, ms))]).then(finish);
  }, [leaving, ms]);

  /* Enter and Escape open the gate (on a link or a button, Enter does what that control does) */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape' || (e.key === 'Enter' && !(e.target as Element | null)?.closest?.('a, button'))) { e.preventDefault(); enter(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, enter]);

  return { root, open, done, mark, leaving, enter };
}
