'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { asset } from '@/lib/site';
import { Monogram } from './Monogram';
import { primeTrailer, releaseTrailer, stopTrailerAudio } from '@/lib/trailer-prime';
import './trailer.css';

type Mode = 'film' | 'text';
/** A screen taller than wide gets the 9:16 edition of the film (same scenes, timings and score on a 1080×1920 stage). */
const portrait = () => window.innerHeight > window.innerWidth;

/**
 * «Conocer a Ignacio»: the Kinetic Studio trailer (public/trailer/v2) fullscreen, with no player bar.
 * Discreet buttons (sound, text version, skip) that hide while the film plays; when it ends, the portfolio.
 * The format is chosen when the film starts (portrait → `&o=v`, landscape → 16:9) and kept until it closes:
 * turning the phone mid-film never reloads it.
 */
export default function TrailerOverlay({ onClose }: { onClose: () => void }) {
  const t = useTranslations('trailer');
  const locale = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [mode, setMode] = useState<Mode>(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'text' : 'film');
  const [vertical, setVertical] = useState(portrait);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ui, setUi] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const loaded = useRef(false);
  const done = useRef(false);

  const close = useCallback(() => {
    if (done.current) return;
    done.current = true;
    releaseTrailer();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
    return () => {
      d?.close();
      if (loaded.current) releaseTrailer(); // not on React's dev double mount, before the film exists
    };
  }, []);

  // The click asks for fullscreen on <html> and the dialog opens right after, but the browser grants it later
  // (iPadOS Safari: after its zoom animation) and puts <html> into the top layer ABOVE the dialog: the film kept
  // playing out of sight until fullscreen ended. Reopening the dialog puts it back on top; the iframe stays loaded,
  // and the queued `close` event finds the dialog open again, so it is ignored.
  useEffect(() => {
    const onFs = () => {
      const d = dialogRef.current;
      if (!d?.open || done.current) return;
      d.close();
      d.showModal();
      (d.querySelector<HTMLElement>('[data-autofocus]') ?? d).focus();
    };
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('webkitfullscreenchange', onFs);
    };
  }, []);

  // the film talks through postMessage (same origin, this frame only)
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== frameRef.current?.contentWindow) return;
      const type = (e.data as { type?: string } | null)?.type;
      if (type === 'trailer:ready') setReady(true);
      else if (type === 'trailer:close') close();
      else if (type === 'trailer:end') { setLeaving(true); setTimeout(close, 600); }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [close]);

  // showModal() would focus the first focusable thing (the film). In the film the dialog itself takes focus:
  // no ring on a button, so the controls can step aside; Tab reaches them. Other views name their first focus.
  useEffect(() => {
    const d = dialogRef.current;
    (d?.querySelector<HTMLElement>('[data-autofocus]') ?? d)?.focus();
  }, [mode]);

  // controls appear on any movement and hide after 2.5 s
  const poke = useCallback(() => {
    setUi(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setUi(false), 2500);
  }, []);
  useEffect(() => { poke(); return () => clearTimeout(idle.current); }, [poke, mode]);

  const post = (msg: object) => frameRef.current?.contentWindow?.postMessage(msg, location.origin);
  const toggleSound = () => { const m = !muted; setMuted(m); post({ type: 'trailer:mute', muted: m }); poke(); };
  const watch = () => { primeTrailer(true); setReady(false); setMuted(false); setVertical(portrait()); setMode('film'); };
  const toText = () => { stopTrailerAudio(); setMode('text'); };
  const onKeyDown = (e: React.KeyboardEvent) => {
    poke();
    if (e.key === ' ' && mode === 'film' && (e.target as HTMLElement).tagName !== 'BUTTON') {
      e.preventDefault();
      post({ type: 'trailer:toggle' });
    }
  };
  // the film covers the screen and swallows the pointer: listen inside it too (same origin)
  const onFrameLoad = () => {
    loaded.current = true;
    const w = frameRef.current?.contentWindow;
    if (!w) return;
    ['pointermove', 'pointerdown', 'keydown'].forEach((type) => w.addEventListener(type, poke, { passive: true }));
  };

  const qaFrame = new URLSearchParams(window.location.search).get('t');
  const src = `${asset('/trailer/v2/index.html')}?host&lang=${locale}${vertical ? '&o=v' : ''}${qaFrame ? `&t=${encodeURIComponent(qaFrame)}` : ''}`;
  const transcript = t.raw('transcript') as string[];

  return (
    <dialog
      ref={dialogRef}
      className="tplayer"
      data-mode={mode}
      data-format={vertical ? 'vertical' : 'landscape'}
      data-ui={ui}
      data-ready={ready}
      data-leaving={leaving}
      aria-label={t('title')}
      tabIndex={-1}
      onCancel={(e) => { e.preventDefault(); close(); }}
      onClose={() => { if (!dialogRef.current?.open) close(); }} // a native close (Escape) that skipped cancel
      onKeyDown={onKeyDown}
      onPointerMove={poke}
      onPointerDown={poke}
    >
      {mode === 'film' && (
        <>
          <iframe
            ref={frameRef}
            className="tplayer__frame"
            src={src}
            title={t('frame')}
            allow="autoplay; fullscreen"
            tabIndex={-1}
            onLoad={onFrameLoad}
          />
          {!ready && (
            <div className="tplayer__cover">
              <Monogram className="tplayer__mark" />
              <span className="tplayer__bar" aria-hidden="true"><span /></span>
              <p className="tplayer__loading" role="status">{t('loading')}</p>
            </div>
          )}
          <div className="tplayer__ctl">
            <button type="button" className="tplayer__btn" onClick={toggleSound}>
              {muted ? t('soundOn') : t('soundOff')}
            </button>
            <button type="button" className="tplayer__btn" onClick={toText}>{t('textVersion')}</button>
            <button type="button" className="tplayer__btn tplayer__btn--skip" onClick={close}>{t('close')} <span aria-hidden="true">→</span></button>
          </div>
        </>
      )}

      {mode === 'text' && (
        <div className="tplayer__panel tplayer__panel--text">
          <h2 className="tplayer__title" tabIndex={-1} data-autofocus>{t('textTitle')}</h2>
          <p className="label">{t('textLead')}</p>
          <ol className="tplayer__list">{transcript.map((line, i) => <li key={i}>{line}</li>)}</ol>
          <div className="tplayer__actions">
            <button type="button" className="btn btn-ghost" onClick={watch}>{t('watch')}</button>
            <button type="button" className="btn btn-primary" onClick={close}>{t('close')}</button>
          </div>
        </div>
      )}
    </dialog>
  );
}
