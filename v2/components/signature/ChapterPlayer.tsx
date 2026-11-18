'use client';

import { type CSSProperties, type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from './hooks';

export type Chapter = { id: string; title: string; verb: string; from: string; to: string; art: string; crop: string };
export type PlayerLabels = { film: string; play: string; pause: string; replay: string; chapter: string; chapters: string; keys: string };

/** Seconds each chapter lasts. */
export const CHAPTER_SECONDS = 3.2;
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/**
 * The frame of the trailer: a stage, chapters on the bar, play / pause and jumps with the arrow keys.
 * It never starts on its own, stops at the end and pauses when it leaves the screen. The bar fills with
 * transform only, written straight to the nodes; React re-renders on chapter, second and state changes.
 */
export function ChapterPlayer({ chapters, labels }: { chapters: Chapter[]; labels: PlayerLabels }) {
  const total = chapters.length * CHAPTER_SECONDS;
  const root = useRef<HTMLDivElement>(null);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const t = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [secs, setSecs] = useState(0);
  const inView = useInView(root, { threshold: 0.25 });

  const paint = useCallback(() => {
    fills.current.forEach((el, i) => {
      if (el) el.style.transform = `scaleX(${Math.min(1, Math.max(0, (t.current - i * CHAPTER_SECONDS) / CHAPTER_SECONDS)).toFixed(4)})`;
    });
  }, []);
  const sync = useCallback(() => {
    setChapter(Math.min(chapters.length - 1, Math.max(0, Math.floor(t.current / CHAPTER_SECONDS))));
    setSecs(Math.floor(t.current));
    paint();
  }, [chapters.length, paint]);

  useEffect(() => { if (!inView) setPlaying(false); }, [inView]);
  useEffect(() => {
    if (!playing) return;
    let raf = 0, last = performance.now();
    const frame = (now: number) => {
      // a frame can be stamped before the click that started this (a busy machine): time never runs backwards
      t.current = Math.min(total, t.current + Math.min(0.1, Math.max(0, (now - last) / 1000)));
      last = now;
      sync();
      if (t.current >= total) { setPlaying(false); setEnded(true); return; }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing, total, sync]);

  const seek = (i: number) => { t.current = Math.min(chapters.length - 1, Math.max(0, i)) * CHAPTER_SECONDS; setEnded(false); sync(); };
  const toggle = () => {
    if (ended) { seek(0); setPlaying(true); } else setPlaying((p) => !p);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    seek(chapter + (e.key === 'ArrowRight' ? 1 : -1));
  };
  const c = chapters[chapter];
  const mainLabel = ended ? labels.replay : playing ? labels.pause : labels.play;
  return (
    <div className="sig-player" ref={root} role="group" aria-label={labels.film} onKeyDown={onKey} data-playing={playing || undefined} style={{ '--from': c.from, '--to': c.to } as CSSProperties}>
      <div className="sig-player-stage">
        <p className="sig-player-film">{labels.film}</p>
        <div className="sig-scene" key={c.id}>
          <div className="sig-scene-text">
            <p className="sig-scene-n" aria-hidden="true">{String(chapter + 1).padStart(2, '0')}</p>
            <p className="sig-scene-title">{c.title}</p>
            <p className="sig-scene-verb"><span>{c.verb}</span></p>
          </div>
          <svg className="sig-scene-art" viewBox={c.crop} aria-hidden="true" dangerouslySetInnerHTML={{ __html: c.art }} />
        </div>
      </div>
      <div className="sig-player-bar">
        <button type="button" className="sig-player-play" onClick={toggle} aria-label={mainLabel}>
          {ended ? (
            <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 8a5.5 5.5 0 1 1-1.7-4" /><path d="M13.6 1.6V5h-3.4" /></svg>
          ) : playing ? (
            <svg aria-hidden="true" viewBox="0 0 12 12" width="13" height="13"><path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" /></svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 12 12" width="13" height="13"><path d="M2.5 1l8.5 5-8.5 5z" fill="currentColor" /></svg>
          )}
        </button>
        <ol className="sig-player-chapters" aria-label={labels.chapters}>
          {chapters.map((ch, i) => (
            <li key={ch.id} style={{ '--from': ch.from, '--to': ch.to } as CSSProperties}>
              <button type="button" onClick={() => seek(i)} aria-current={i === chapter ? 'true' : undefined} aria-label={`${labels.chapter} ${i + 1}: ${ch.title}`}>
                <span className="sig-player-track"><span ref={(el) => { fills.current[i] = el; }} /></span>
                <span className="sig-player-name" aria-hidden="true">{ch.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <span className="sig-player-time" aria-hidden="true">{clock(secs)} / {clock(total)}</span>
      </div>
      <p className="sig-player-keys">{labels.keys}</p>
    </div>
  );
}
