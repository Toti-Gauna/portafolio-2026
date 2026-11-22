'use client';

import { useEffect, useRef, useState } from 'react';
import { reducedMotion } from '@/v2/motion/env';
import { PlayIcon } from '../ui/Icons';

/**
 * The clip of a featured case: a poster until someone asks (an image that loads lazily, under the clip). With a mouse it plays while the pointer is on its
 * card; the button plays and pauses it for everyone (touch, keyboard, reduced motion). Muted, never downloaded
 * before it is needed, and paused when its card leaves the screen.
 */
export function CaseClip({ src, poster, alt, play, pause, name, card = '.hc-card', className }: {
  src: string; poster: string; alt: string; play: string; pause: string; name: string;
  /** The card whose pointer plays it (the home's case card; a frame of a case's gallery). */
  card?: string; className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  const run = (go: boolean) => {
    const v = video.current;
    if (!v) return;
    if (go) void v.play().then(() => setOn(true)).catch(() => setOn(false)); else if (!v.paused) { v.pause(); setOn(false); }
  };
  useEffect(() => {
    const box = root.current?.closest(card);
    if (!box) return;
    const enter = (e: Event) => { if ((e as PointerEvent).pointerType === 'mouse' && !reducedMotion()) run(true); };
    const leave = (e: Event) => { if ((e as PointerEvent).pointerType === 'mouse') run(false); };
    const io = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) run(false); });
    box.addEventListener('pointerenter', enter);
    box.addEventListener('pointerleave', leave);
    io.observe(box);
    return () => { box.removeEventListener('pointerenter', enter); box.removeEventListener('pointerleave', leave); io.disconnect(); };
  }, [card]);
  return (
    <div className={['hc-clip', className].filter(Boolean).join(' ')} ref={root} data-playing={on || undefined}>
      {/* the poster is an image under the clip, not the video's `poster`: a browser fetches a poster at once wherever it
          is on the page, an image waits until it comes near the screen (lote 9.2) */}
      <img className="hc-poster" src={poster} alt="" loading="lazy" decoding="async" aria-hidden="true" />
      <video ref={video} muted loop playsInline preload="none" aria-label={alt} tabIndex={-1}>
        <source src={src} type="video/mp4" />
      </video>
      <button type="button" className="hc-play" aria-pressed={on} onClick={() => run(!on)}>
        {on ? <svg aria-hidden="true" viewBox="0 0 12 12" width="13" height="13"><path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" /></svg> : <PlayIcon size={13} />}
        <span className="ui-sr">{on ? pause : play}: {name}</span>
      </button>
    </div>
  );
}
