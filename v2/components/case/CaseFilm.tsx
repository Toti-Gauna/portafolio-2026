'use client';

import { type CSSProperties, type KeyboardEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { CountUp } from '../signature/CountUp';
import { reducedMotion } from '../signature/hooks';

export type FilmLabels = { film: string; chapters: string[]; chapter: string; chaptersLabel: string; play: string; pause: string; replay: string; keys: string; clip: string; clipStop: string };

/** Seconds each chapter lasts: four chapters, ten seconds. */
export const FILM_CHAPTER = 2.5;
const CHAPTERS = 4;
const TOTAL = FILM_CHAPTER * CHAPTERS;
/** When each part of the film comes in (seconds). The verbs light one after another inside the second chapter. */
export const FILM_AT = { kind: 0, title: 0.15, stamp: 0.55, line: 1.1, verbs: [2.6, 3.3, 4], panel: 5, numbers: 7.5, status: 7.9 } as const;
const clock = (s: number) => `0:${String(Math.floor(s)).padStart(2, '0')}`;

/**
 * The film that opens a case (lote 5.1): ten seconds in four chapters, in the colour of the project — what it is (its
 * name and its stamp), what it does (three verbs that light one after another), the product in use (a glass panel
 * with the real clip) and where it stands (figures that count, the state). The level is the product film of CompliA:
 * depth, verbs in pills, numbers that count, a player with chapters.
 * The HTML is the last frame: without JavaScript, with reduced motion or once it ends, everything is in place and
 * still. It plays once when it first comes on screen (WCAG 2.2.2: it can be paused, and it is ten seconds), pauses
 * off screen, ← → change chapter. Every part carries `data-at` (when it comes in); the loop writes `data-on` on what
 * has arrived — only when a threshold is crossed — and asks for frames only while it plays.
 */
export function CaseFilm({ color, labels, kind, title, line, verbs, numbers, status, stamp, panel, back }: {
  color: string; labels: FilmLabels; kind: string; title: string; line: string; verbs: string[]; numbers: { n: string; d: string }[];
  status: ReactNode; stamp: ReactNode; panel: ReactNode; back: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const t = useRef(TOTAL);
  const applied = useRef(-1);
  const numbersIn = useRef(true);
  const [run, setRun] = useState<'idle' | 'play' | 'pause' | 'end'>('end');
  const [chapter, setChapter] = useState(CHAPTERS - 1);
  const [secs, setSecs] = useState(TOTAL);
  const [rolls, setRolls] = useState(0);
  const [ready, setReady] = useState(false);

  /** Light what has arrived at time `t`, and only touch the DOM when something changes. */
  const paint = useCallback(() => {
    const el = root.current;
    if (!el) return;
    const now = t.current;
    const parts = el.querySelectorAll<HTMLElement>('[data-at]');
    let on = 0;
    parts.forEach((p) => { if (Number(p.dataset.at) <= now) on += 1; });
    if (on !== applied.current) {
      applied.current = on;
      let lastVerb: HTMLElement | null = null;
      parts.forEach((p) => {
        const arrived = Number(p.dataset.at) <= now;
        p.toggleAttribute('data-on', arrived);
        if (p.dataset.part === 'verb') { p.removeAttribute('data-now'); if (arrived) lastVerb = p; }
      });
      (lastVerb as HTMLElement | null)?.setAttribute('data-now', '');
    }
    // the figures count from zero the moment they come in
    const counted = now >= FILM_AT.numbers;
    if (counted && !numbersIn.current) setRolls((r) => r + 1);
    numbersIn.current = counted;
    fills.current.forEach((f, i) => { if (f) f.style.transform = `scaleX(${Math.min(1, Math.max(0, (now - i * FILM_CHAPTER) / FILM_CHAPTER)).toFixed(4)})`; });
    setChapter(Math.min(CHAPTERS - 1, Math.floor(now / FILM_CHAPTER)));
    setSecs(Math.floor(now));
  }, []);

  /* the clip on the panel follows the film: it plays from the third chapter while the film plays */
  const clip = useCallback((go: boolean) => {
    const v = root.current?.querySelector<HTMLVideoElement>('.cf-panel video');
    if (!v) return;
    if (go) void v.play().catch(() => undefined); else if (!v.paused) v.pause();
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    setReady(true);
    if (reducedMotion()) return;
    // from the first frame: the film starts from nothing (the HTML was its last frame)
    t.current = 0; applied.current = -1;
    setRun('idle');
    paint();
    let seen = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !seen) { seen = true; setRun((r) => (r === 'idle' ? 'play' : r)); }
      if (!e.isIntersecting) setRun((r) => (r === 'play' ? 'pause' : r));
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [paint]);

  useEffect(() => {
    if (run !== 'play') { clip(false); return; }
    let raf = 0, last = performance.now();
    const frame = (now: number) => {
      // a frame can come stamped before the click that asked for it: time never runs backwards
      t.current = Math.min(TOTAL, t.current + Math.min(0.1, Math.max(0, (now - last) / 1000)));
      last = Math.max(last, now);
      if (t.current >= FILM_AT.panel - 2.5) {
        const v = root.current?.querySelector<HTMLVideoElement>('.cf-panel video');
        if (v && v.preload === 'none') { v.preload = 'auto'; v.load(); }
      }
      if (t.current >= FILM_AT.panel) clip(true);
      paint();
      if (t.current >= TOTAL) { setRun('end'); return; }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [run, paint, clip]);

  const seek = (i: number) => {
    t.current = Math.min(CHAPTERS - 1, Math.max(0, i)) * FILM_CHAPTER;
    applied.current = -1;
    paint();
    if (run === 'end' || run === 'idle') setRun('pause');
  };
  const toggle = () => {
    if (run === 'end') { t.current = 0; applied.current = -1; paint(); setRun('play'); return; }
    setRun((r) => (r === 'play' ? 'pause' : 'play'));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    if ((e.target as Element).closest('a, .cf-clip')) return;
    e.preventDefault();
    seek(chapter + (e.key === 'ArrowRight' ? 1 : -1));
  };
  const mainLabel = run === 'end' ? labels.replay : run === 'play' ? labels.pause : labels.play;
  const n = (k: number) => String(k);

  return (
    <section ref={root} className="cf" aria-labelledby="cf-title" data-ready={ready || undefined} data-run={run} style={{ '--c': color } as CSSProperties} onKeyDown={onKey}>
      <div className="cf-stage">
        <div className="cf-text">
          <p className="cf-kind" data-at={FILM_AT.kind}>{back}<span aria-hidden="true">·</span><span>{kind}</span></p>
          <h1 id="cf-title" className="cf-title" data-at={FILM_AT.title}>{title}</h1>
          <p className="cf-line" data-at={FILM_AT.line}>{line}</p>
          <p className="cf-verbs">
            {verbs.map((v, i) => <span key={v} className="cf-verb" data-part="verb" data-at={FILM_AT.verbs[i] ?? FILM_AT.verbs[2]} data-now={i === verbs.length - 1 ? '' : undefined}>{v}</span>)}
          </p>
          <div className="cf-end">
            {numbers.length > 0 && (
              <dl className="cf-numbers" data-part="numbers" data-at={FILM_AT.numbers}>
                {numbers.map((x) => (
                  <div key={x.n + x.d}>
                    <dt><CountUp key={rolls} value={x.n} replayKey={rolls} /></dt>
                    <dd>{x.d}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="cf-status" data-at={FILM_AT.status}>{status}</div>
          </div>
        </div>
        <div className="cf-show">
          <div className="cf-panel" data-at={FILM_AT.panel}>{panel}</div>
          <div className="cf-stamp" data-at={FILM_AT.stamp}>{stamp}</div>
        </div>
      </div>
      <div className="cf-bar" role="group" aria-label={labels.film}>
        <button type="button" className="cf-play" onClick={toggle} aria-label={mainLabel}>
          {run === 'end' ? (
            <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 8a5.5 5.5 0 1 1-1.7-4" /><path d="M13.6 1.6V5h-3.4" /></svg>
          ) : run === 'play' ? (
            <svg aria-hidden="true" viewBox="0 0 12 12" width="13" height="13"><path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" /></svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 12 12" width="13" height="13"><path d="M2.5 1l8.5 5-8.5 5z" fill="currentColor" /></svg>
          )}
        </button>
        <ol className="cf-chapters" aria-label={labels.chaptersLabel}>
          {labels.chapters.map((name, i) => (
            <li key={name}>
              <button type="button" onClick={() => seek(i)} aria-current={i === chapter ? 'true' : undefined} aria-label={`${labels.chapter} ${n(i + 1)}: ${name}`}>
                <span className="cf-track"><span ref={(el) => { fills.current[i] = el; }} /></span>
                <span className="cf-name" aria-hidden="true">{name}</span>
              </button>
            </li>
          ))}
        </ol>
        <span className="cf-time" aria-hidden="true">{clock(secs)} / {clock(TOTAL)}</span>
      </div>
    </section>
  );
}
