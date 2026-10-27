'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { asset } from '@/lib/site';
import { primeTrailer, releaseTrailer, stopTrailerAudio } from '@/lib/trailer-prime';
import './trailer.css';

type Mode = 'film' | 'text' | 'rotate';
const portraitPhone = () => window.innerWidth < 700 && window.innerHeight > window.innerWidth;

/**
 * «Conocer a Ignacio»: the Kinetic Studio trailer (public/trailer/v2) fullscreen, with no player bar.
 * Discreet buttons (sound, text version, skip) that hide while the film plays; when it ends, the portfolio.
 */
export default function TrailerOverlay({ onClose }: { onClose: () => void }) {
  const t = useTranslations('trailer');
  const locale = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [mode, setMode] = useState<Mode>(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'text' : portraitPhone() ? 'rotate' : 'film');
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

  // the rotate gate lets go by itself once the phone is horizontal
  useEffect(() => {
    if (mode !== 'rotate') return;
    const onResize = () => { if (!portraitPhone()) setMode('film'); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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
  const watch = () => { primeTrailer(true); setReady(false); setMuted(false); setMode('film'); };
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
  const src = `${asset('/trailer/v2/index.html')}?host&lang=${locale}${qaFrame ? `&t=${encodeURIComponent(qaFrame)}` : ''}`;
  const transcript = t.raw('transcript') as string[];

  return (
    <dialog
      ref={dialogRef}
      className="tplayer"
      data-mode={mode}
      data-ui={ui}
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
          {!ready && <p className="tplayer__loading" role="status">{t('loading')}</p>}
          <div className="tplayer__ctl">
            <button type="button" className="tplayer__btn" onClick={toggleSound}>
              {muted ? t('soundOn') : t('soundOff')}
            </button>
            <button type="button" className="tplayer__btn" onClick={toText}>{t('textVersion')}</button>
            <button type="button" className="tplayer__btn tplayer__btn--skip" onClick={close}>{t('close')} <span aria-hidden="true">→</span></button>
          </div>
        </>
      )}

      {mode === 'rotate' && (
        <div className="tplayer__panel">
          <svg viewBox="0 0 48 48" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="15" y="6" width="18" height="30" rx="3" /><path d="M10 40c6 4 22 4 28-2" stroke="var(--accent)" /><path d="M35 34l3 4-5 1" stroke="var(--accent)" />
          </svg>
          <h2 className="tplayer__title">{t('rotateTitle')}</h2>
          <p>{t('rotateText')}</p>
          <div className="tplayer__actions">
            <button type="button" className="btn btn-primary" data-autofocus onClick={watch}>{t('watchAnyway')}</button>
            <button type="button" className="btn btn-ghost" onClick={toText}>{t('textVersion')}</button>
            <button type="button" className="btn btn-ghost" onClick={close}>{t('close')}</button>
          </div>
        </div>
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
