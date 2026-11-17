'use client';

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Monogram } from './Monogram';
import { OPEN_TRAILER_EVENT } from './TrailerButton';
import { primeTrailer } from '@/lib/trailer-prime';
import { enableSoundFromGate, hold, playCue } from '@/lib/sound';
import './intro.css';

// The trailer (engine + audio + scenes) is a separate chunk: it downloads only when asked for.
const TrailerOverlay = lazy(() => import('./TrailerOverlay'));

type Phase = 'loading' | 'ready' | 'closing' | 'closed';

const MIN_MS = 1200;
const MIN_MS_REDUCED = 300;
const SAFETY_MS = 4000;

/**
 * Boot screen shown on EVERY load (system «Cartel suizo»): a coral halftone eclipse that lights up with the real load,
 * then the gate (trailer / portfolio); both doors turn the sound on (lib/sound.ts). The server HTML already contains it (no flash) and the
 * page content stays in the DOM underneath (SEO, screen readers) but inert until it closes.
 */
export function Intro() {
  const t = useTranslations('intro');
  const [phase, setPhase] = useState<Phase>('loading');
  const [trailer, setTrailer] = useState(false);
  // Real load progress: hydrated -> fonts -> window load -> done.
  const [progress, setProgress] = useState(0.12);
  const portfolioBtn = useRef<HTMLButtonElement>(null);
  const trailerBtn = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setPhase((p) => (p === 'closed' || p === 'closing' ? p : 'closing'));
  }, []);

  // Phase machine: loading -> ready (real load + minimum time, or "skip") -> closing -> closed.
  useEffect(() => {
    if (phase !== 'loading') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const min = reduced ? MIN_MS_REDUCED : MIN_MS;
    const start = performance.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setProgress(1);
      timer = setTimeout(() => setPhase('ready'), Math.max(350, min - (performance.now() - start)));
    };
    const loaded = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', () => resolve(), { once: true });
    });
    void document.fonts?.ready.then(() => setProgress((p) => Math.max(p, 0.6)));
    void loaded.then(() => setProgress((p) => Math.max(p, 0.85)));
    void Promise.all([loaded, document.fonts?.ready]).then(finish);
    const safety = setTimeout(finish, SAFETY_MS);
    return () => {
      clearTimeout(timer);
      clearTimeout(safety);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'ready') trailerBtn.current?.focus();
    if (phase === 'closing') {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const timer = setTimeout(() => setPhase('closed'), reduced ? 0 : 350);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // While the boot screen or the trailer is up, the page is inert and does not scroll. iOS Safari ignores
  // overflow:hidden on <html> for touch scrolling, so the body is pinned in place (and restored after).
  const open = phase === 'loading' || phase === 'ready' || trailer; // the page is usable again as the boot screen fades
  // Only what this screen pinned is undone here: the site menu may pin the body too, right after the gate.
  const pinned = useRef(false);
  useEffect(() => {
    const shell = document.getElementById('app-shell');
    const root = document.documentElement, body = document.body;
    const unlock = () => {
      shell?.removeAttribute('inert');
      if (!pinned.current) return;
      pinned.current = false;
      const y = -parseInt(body.style.top || '0', 10);
      root.style.overflow = ''; body.style.position = ''; body.style.top = ''; body.style.width = '';
      window.scrollTo(0, y);
    };
    if (open) {
      shell?.setAttribute('inert', '');
      if (body.style.position !== 'fixed') {
        const y = window.scrollY;
        root.style.overflow = 'hidden';
        body.style.position = 'fixed'; body.style.top = `-${y}px`; body.style.width = '100%';
        pinned.current = true;
      }
      return unlock;
    }
    unlock();
  }, [open]);

  // Focus lands on the content once, as the screen starts to leave, unless the visitor already moved it (the menu).
  useEffect(() => {
    if (phase !== 'closing') return;
    const a = document.activeElement;
    if (!a || a === document.body || a.closest('#boot')) document.getElementById('contenido')?.focus({ preventScroll: true });
  }, [phase]);

  // the film has its own music: the site's rests while it plays and comes back when it closes
  useEffect(() => {
    hold('trailer', trailer);
    return () => hold('trailer', false);
  }, [trailer]);

  // The hero's "watch the trailer" button asks for it through an event.
  useEffect(() => {
    const onOpen = () => setTrailer(true);
    window.addEventListener(OPEN_TRAILER_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_TRAILER_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (phase !== 'ready' || trailer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, trailer, close]);

  const closeTrailer = useCallback(() => {
    setTrailer(false);
    // opened from the page (the gate already gone): back to the content, as the gate's exit does
    if (phase === 'closed') requestAnimationFrame(() => document.getElementById('contenido')?.focus({ preventScroll: true }));
    close();
  }, [close, phase]);

  const enterPortfolio = () => {
    if (enableSoundFromGate()) playCue('open');
    close();
  };
  const enterTrailer = () => {
    enableSoundFromGate(); // the film brings its own music; the site keeps the sound on afterwards
    primeTrailer();
    setTrailer(true);
  };
  const lit = phase === 'loading' ? progress : 1;

  return (
    <>
      {(phase !== 'closed' || trailer) && (
        <div
          id="boot"
          className="boot"
          data-phase={phase}
          role="dialog"
          aria-modal="true"
          aria-label={t('dialog')}
          aria-hidden={trailer || undefined}
          data-trailer={trailer || undefined}
        >
          {/* the brand image: a coral halftone eclipse. Its dots light up from the centre with the real load,
              and the moon slides in to complete it when the site is ready. */}
          <div className="boot__eclipse" aria-hidden="true">
            <div className="boot__dots" style={{ clipPath: `circle(${Math.round(8 + lit * 42)}% at 50% 50%)` }}>
              <svg viewBox="0 0 640 640">
                <defs>
                  <pattern id="boot-d1" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="1.6" fill="var(--accent)" /></pattern>
                  <pattern id="boot-d2" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="3.4" fill="var(--accent)" /></pattern>
                  <pattern id="boot-d3" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="5.6" fill="var(--accent)" /></pattern>
                </defs>
                <circle cx="320" cy="320" r="318" fill="url(#boot-d1)" />
                <circle cx="320" cy="320" r="236" fill="var(--ink)" />
                <circle cx="320" cy="320" r="236" fill="url(#boot-d2)" />
                <circle cx="320" cy="320" r="150" fill="var(--ink)" />
                <circle cx="320" cy="320" r="150" fill="url(#boot-d3)" />
              </svg>
            </div>
            <svg className="boot__moon" viewBox="0 0 640 640">
              <circle cx="368" cy="290" r="128" fill="var(--ink)" />
            </svg>
          </div>

          <p className="boot__meta" aria-hidden="true">
            <span>{t('fig')}</span>
            <span>{t('place')}</span>
          </p>

          <div className="boot__inner">
            <Monogram className="boot__mark" />
            <p className="boot__name">
              <span className="boot__first">{t('first')}</span>
              <span className="boot__last">{t('last')}</span>
            </p>
            <p className="boot__role">{t('role')}</p>

            {trailer ? (
              <p role="status" className="boot__status">{t('trailerLoading')}</p>
            ) : phase === 'loading' ? (
              <div className="boot__load">
                <p role="status" className="boot__status">
                  {t('loading')} <span className="boot__pct">{Math.round(progress * 100)}&nbsp;%</span>
                </p>
                <button type="button" className="btn btn-ghost boot__skip" onClick={() => setPhase('ready')}>
                  {t('skip')}
                </button>
              </div>
            ) : (
              <div className="boot__gate">
                <div className="boot__doors">
                  <button ref={trailerBtn} type="button" className="btn btn-primary boot__door" onClick={enterTrailer}>
                    {t('trailer')} <span aria-hidden="true">▶</span>
                  </button>
                  <button ref={portfolioBtn} type="button" className="btn btn-ghost boot__door" onClick={enterPortfolio}>
                    {t('portfolio')} <span aria-hidden="true">→</span>
                  </button>
                </div>
                <p className="boot__hint">{t('soundHint')}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {trailer && (
        <Suspense fallback={null}>
          <TrailerOverlay onClose={closeTrailer} />
        </Suspense>
      )}
    </>
  );
}
