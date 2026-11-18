'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { STYLE_IDS, type StyleId, type ZoneKey } from '@/v2/sound/compose';
import { MUSIC_BAR, MUSIC_PREVIEW, MUSIC_STOP, MUSIC_STYLE, read, SOUND_EVENT, SOUND_KEY, STYLE_KEY } from '@/v2/sound/control';
import type { BarInfo, MusicEngine } from '@/v2/sound/engine';
import { pageOf } from '@/v2/site';

const zoneOf = (pathname: string): ZoneKey => pageOf(pathname) ?? 'system';
const savedStyle = (): StyleId => { const s = read(STYLE_KEY) as StyleId | null; return s && STYLE_IDS.includes(s) ? s : 'marea'; };

type Debug = { playing: boolean; style: StyleId; zone: ZoneKey; bar: number; state: string; loaded: boolean };

/**
 * The music of /v2 (lote 2.3), mounted once in the layout. Silent until someone asks for sound: then, inside that
 * click, it creates the AudioContext (browsers only allow sound after a gesture) and loads the engine, which is
 * never part of the first load. It follows the page (each page has its motif), pauses with the tab hidden, and
 * stops with the sound button. The /sonido/ page plays previews of the three proposals through it.
 */
export function SoundRoot() {
  const pathname = usePathname() ?? '';
  const ctx = useRef<AudioContext | null>(null);
  const engine = useRef<MusicEngine | null>(null);
  const loading = useRef<Promise<MusicEngine> | null>(null);
  const wanted = useRef(false); // the visitor turned the sound on
  const preview = useRef<{ style: StyleId; zone: ZoneKey } | null>(null);
  const zone = useRef<ZoneKey>(zoneOf(pathname));
  const debug = useRef<Debug>({ playing: false, style: 'marea', zone: zone.current, bar: -1, state: 'none', loaded: false });

  useEffect(() => {
    const w = window as Window & { __igMusic?: () => Debug };
    w.__igMusic = () => ({ ...debug.current, playing: engine.current?.playing ?? false, state: ctx.current?.state ?? 'none', loaded: Boolean(engine.current) });

    /** Must run inside the click: the context is created and resumed before anything is awaited. */
    const ensure = (): Promise<MusicEngine> => {
      if (!ctx.current) {
        const AC = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        ctx.current = new AC({ latencyHint: 'playback' });
      }
      void ctx.current.resume();
      if (engine.current) return Promise.resolve(engine.current);
      loading.current ??= import('@/v2/sound/engine').then(({ MusicEngine }) => {
        const p = preview.current;
        const e = new MusicEngine(ctx.current!, ctx.current!.destination, p?.style ?? savedStyle(), p?.zone ?? zone.current);
        e.onBar = (info: BarInfo) => { debug.current.bar = info.bar; debug.current.style = info.style; debug.current.zone = info.zone; window.dispatchEvent(new CustomEvent(MUSIC_BAR, { detail: info })); };
        engine.current = e;
        return e;
      });
      return loading.current;
    };
    const play = async () => {
      const e = await ensure();
      if (document.hidden) return;
      e.start();
    };
    const pause = () => {
      engine.current?.stop();
      const c = ctx.current;
      if (c) setTimeout(() => { if (!engine.current?.playing && c.state === 'running') void c.suspend(); }, 800);
    };

    // a saved «on» waits for the first gesture on this page (a click, after the page handled it: if that click
    // was the sound button turning the music off, nothing starts)
    wanted.current = read(SOUND_KEY) === 'on';
    const firstGesture = () => { if (wanted.current && !engine.current?.playing) void play(); };
    if (wanted.current) {
      window.addEventListener('click', firstGesture, { once: true });
      window.addEventListener('keydown', firstGesture, { once: true });
    }

    const onSound = (e: Event) => {
      wanted.current = Boolean((e as CustomEvent<{ on: boolean }>).detail?.on);
      if (wanted.current) {
        void ensure().then((m) => { if (!preview.current) { m.setStyle(savedStyle()); m.setZone(zone.current); } m.start(); });
      } else if (!preview.current) pause();
    };
    const onStyle = (e: Event) => { const s = (e as CustomEvent<{ style: StyleId }>).detail?.style; if (s && !preview.current) engine.current?.setStyle(s); };
    const onPreview = (e: Event) => {
      const d = (e as CustomEvent<{ style: StyleId; zone: ZoneKey }>).detail;
      preview.current = d;
      void ensure().then((m) => {
        const restart = m.playing && m.style !== d.style;
        m.setStyle(d.style);
        m.setZone(d.zone);
        if (restart) { m.stop(0.3); m.start(0.3); } else m.start(0.4);
      });
    };
    const onStop = () => {
      preview.current = null;
      if (!wanted.current) pause();
      else { engine.current?.setStyle(savedStyle()); engine.current?.setZone(zone.current); }
    };
    // a hidden tab is silent and costs nothing; it picks up on return
    const onVisible = () => {
      if (document.hidden) engine.current?.stop(0.3);
      else if ((wanted.current || preview.current) && engine.current) void play();
    };

    window.addEventListener(SOUND_EVENT, onSound);
    window.addEventListener(MUSIC_STYLE, onStyle);
    window.addEventListener(MUSIC_PREVIEW, onPreview);
    window.addEventListener(MUSIC_STOP, onStop);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('click', firstGesture);
      window.removeEventListener('keydown', firstGesture);
      window.removeEventListener(SOUND_EVENT, onSound);
      window.removeEventListener(MUSIC_STYLE, onStyle);
      window.removeEventListener(MUSIC_PREVIEW, onPreview);
      window.removeEventListener(MUSIC_STOP, onStop);
      document.removeEventListener('visibilitychange', onVisible);
      engine.current?.stop(0.1);
      void ctx.current?.close();
      ctx.current = null; engine.current = null; loading.current = null;
    };
  }, []);

  // a new page: its motif, from the next bar
  useEffect(() => {
    zone.current = zoneOf(pathname);
    debug.current.zone = zone.current;
    if (!preview.current) engine.current?.setZone(zone.current);
  }, [pathname]);

  return null;
}
