'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MUSIC_HOLD } from '@/v2/sound/control';
import type { MusicEngine, Score } from '@/v2/sound/engine';

type AC = typeof AudioContext;

/**
 * The sound of the trailer (lote 8.3). The film asked for it with a click, so it sounds by default and a button
 * silences it. The AudioContext is created inside that click (browsers only allow sound after a gesture); the engine
 * and the score are their own chunk. When the browser still holds the sound (a page opened from a link: the gesture
 * was on the page before), `locked` is true until the first touch or key on this page. While it plays, the music of
 * the site is put on hold (`MUSIC_HOLD`), so two musics never sound together.
 */
export function useSoundtrack(filmTime: () => number) {
  const ctx = useRef<AudioContext | null>(null);
  const out = useRef<GainNode | null>(null);
  const engine = useRef<MusicEngine | null>(null);
  const score = useRef<Score | null>(null);
  const loading = useRef<Promise<void> | null>(null);
  const want = useRef(false);
  const [muted, setMuted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [state, setState] = useState<'off' | 'loading' | 'on'>('off');

  const hold = (on: boolean) => window.dispatchEvent(new CustomEvent(MUSIC_HOLD, { detail: { on } }));
  /** Runs inside the gesture when there is one: the context is made and resumed before anything is awaited. */
  const prime = useCallback(() => {
    if (!ctx.current) {
      const C = window.AudioContext ?? (window as Window & { webkitAudioContext?: AC }).webkitAudioContext;
      if (!C) return null;
      ctx.current = new C({ latencyHint: 'playback' });
      out.current = ctx.current.createGain();
      out.current.connect(ctx.current.destination);
    }
    void ctx.current.resume().then(() => { if (ctx.current?.state === 'running') setLocked(false); }).catch(() => {});
    loading.current ??= Promise.all([import('@/v2/sound/engine'), import('@/v2/trailer/score')]).then(([e, s]) => {
      engine.current = new e.MusicEngine(ctx.current!, out.current!, 'circuito', 'home');
      score.current = s.buildScore();
    });
    return loading.current;
  }, []);
  const begin = useCallback(() => {
    if (!want.current || !engine.current || !score.current || !ctx.current) return;
    if (ctx.current.state !== 'running') { setLocked(true); return; }
    engine.current.playScore(score.current, filmTime());
    setState('on');
  }, [filmTime]);

  /** Start (or start again, after a jump) from where the film is. */
  const start = useCallback(() => {
    want.current = true;
    hold(true);
    const p = prime();
    if (!p) return;
    if (!engine.current) setState('loading');
    void p.then(() => {
      // a context made without a gesture waits: give it a moment, then ask for a touch
      if (ctx.current?.state !== 'running') setTimeout(() => { if (want.current && ctx.current?.state !== 'running') setLocked(true); }, 350);
      begin();
    });
  }, [prime, begin]);
  const stop = useCallback((fade = 0.12) => {
    want.current = false;
    engine.current?.stop(fade);
    setState('off');
    hold(false);
  }, []);
  /** The first touch or key on the page, or the «turn the sound on» button. */
  const unlock = useCallback(() => {
    const c = ctx.current;
    if (!c || c.state === 'running') { setLocked(false); return; }
    void c.resume().then(() => { setLocked(false); begin(); }).catch(() => {});
  }, [begin]);
  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m, g = out.current, c = ctx.current;
      if (g && c) g.gain.setTargetAtTime(next ? 0 : 1, c.currentTime, 0.04);
      return next;
    });
    unlock();
  }, [unlock]);
  /** Where the music is, in film seconds; null while it is not sounding (the film keeps its own time). */
  const time = useCallback(() => (ctx.current?.state === 'running' ? engine.current?.scoreTime() ?? null : null), []);

  useEffect(() => {
    if (!locked) return;
    const first = () => unlock();
    window.addEventListener('pointerdown', first, { once: true });
    window.addEventListener('keydown', first, { once: true });
    return () => { window.removeEventListener('pointerdown', first); window.removeEventListener('keydown', first); };
  }, [locked, unlock]);
  useEffect(() => () => {
    engine.current?.stop(0.05);
    if (want.current) hold(false);
    void ctx.current?.close();
  }, []);

  return { start, stop, unlock, toggleMute, time, muted, locked, state, debug: () => ({ state: ctx.current?.state ?? 'none', playing: engine.current?.playing ?? false, time: engine.current?.scoreTime() ?? null, muted, locked }) };
}
