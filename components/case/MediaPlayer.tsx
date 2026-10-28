'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A muted loop that plays only while on screen, with its own pause button (WCAG 2.2.2).
 * Reduced motion: it never starts by itself; the button plays it.
 */
export function MediaPlayer({ src, poster, label, w, h, labels }: { src: string; poster: string; label: string; w: number; h: number; labels: { play: string; pause: string } }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const wanted = useRef(true);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) wanted.current = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && wanted.current) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.35 });
    io.observe(v);
    const on = () => setPlaying(true), off = () => setPlaying(false);
    v.addEventListener('play', on); v.addEventListener('pause', off);
    return () => { io.disconnect(); v.removeEventListener('play', on); v.removeEventListener('pause', off); };
  }, []);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    wanted.current = v.paused;
    if (v.paused) v.play().catch(() => {}); else v.pause();
  };
  return (
    <div className="mp">
      <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" width={w} height={h} aria-label={label} />
      <button type="button" className="mp__btn" onClick={toggle} aria-label={playing ? labels.pause : labels.play}>
        <svg viewBox="0 0 24 24" aria-hidden="true">{playing ? <path d="M8 5v14M16 5v14" /> : <path d="M8 5l11 7-11 7z" />}</svg>
      </button>
    </div>
  );
}
