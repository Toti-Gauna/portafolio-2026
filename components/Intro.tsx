'use client';

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Monogram } from './Monogram';
import { OPEN_TRAILER_EVENT } from './TrailerButton';
import { primeTrailer } from '@/lib/trailer-prime';
import './intro.css';

// The trailer (engine + audio + scenes) is a separate chunk: it downloads only when asked for.
const TrailerOverlay = lazy(() => import('./TrailerOverlay'));

type Phase = 'loading' | 'ready' | 'closing' | 'closed';

const MIN_MS = 1200;
const MIN_MS_REDUCED = 300;
const SAFETY_MS = 4000;

/**
 * Boot screen shown on EVERY load: a seed of light and a line that grows with the real load,
 * then the gate (trailer / portfolio). The server HTML already contains it (no flash) and the
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

  // While the boot screen or the trailer is up, the page is inert and does not scroll.
  const open = phase !== 'closed' || trailer;
  useEffect(() => {
    const shell = document.getElementById('app-shell');
    const root = document.documentElement;
    if (open) {
      shell?.setAttribute('inert', '');
      root.style.overflow = 'hidden';
    } else {
      shell?.removeAttribute('inert');
      root.style.overflow = '';
      if (phase === 'closed') document.getElementById('contenido')?.focus({ preventScroll: true });
    }
    return () => {
      shell?.removeAttribute('inert');
      root.style.overflow = '';
    };
  }, [open, phase]);

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
    close();
  }, [close]);

  return (
    <>
      {phase !== 'closed' && (
        <div
          id="boot"
          className="boot"
          data-phase={phase}
          role="dialog"
          aria-modal="true"
          aria-label={t('dialog')}
          hidden={trailer}
        >
          <div className="boot__inner">
            <Monogram className="boot__mark" />
            <p className="boot__name">{t('name')}</p>
            <p className="boot__role">{t('role')}</p>

            {phase === 'loading' ? (
              <>
                <svg className="boot__line" viewBox="0 0 320 24" fill="none" aria-hidden="true">
                  <path d="M16 12h288" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" strokeLinecap="round" />
                  <path className="boot__fill" d="M16 12h288" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" pathLength="1" style={{ strokeDashoffset: 1 - progress }} />
                  <circle cx="16" cy="12" r="6" fill="var(--accent)" />
                </svg>
                <p role="status" className="boot__status">{t('loading')}…</p>
                <button type="button" className="btn btn-ghost boot__skip" onClick={() => setPhase('ready')}>
                  {t('skip')}
                </button>
              </>
            ) : (
              <div className="boot__gate">
                {/* the seed opens into two branches: one per path */}
                <svg className="boot__fork" viewBox="0 0 40 136" fill="none" aria-hidden="true">
                  <path d="M12 4V34C12 46 20 52 36 52" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" pathLength="1" />
                  <path d="M12 34V96C12 106 20 112 36 112" stroke="var(--paper)" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" pathLength="1" />
                  <circle cx="12" cy="6" r="5" fill="var(--accent)" />
                </svg>
                <button ref={trailerBtn} type="button" className="btn btn-primary" onClick={() => { primeTrailer(); setTrailer(true); }}>
                  {t('trailer')}
                </button>
                <button ref={portfolioBtn} type="button" className="btn btn-ghost" onClick={close}>
                  {t('portfolio')}
                </button>
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
