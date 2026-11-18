'use client';

import { useEffect, useRef, useState } from 'react';
import { reducedMotion } from '@/v2/motion/env';
import { PlayIcon } from '../ui/Icons';

/**
 * The clip of a featured case: a poster until someone asks. With a mouse it plays while the pointer is on its
 * card; the button plays and pauses it for everyone (touch, keyboard, reduced motion). Muted, never downloaded
 * before it is needed, and paused when its card leaves the screen.
 */
export function CaseClip({ src, poster, alt, play, pause, name }: { src: string; poster: string; alt: string; play: string; pause: string; name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  const run = (go: boolean) => {
    const v = video.current;
    if (!v) return;
    if (go) void v.play().then(() => setOn(true)).catch(() => setOn(false)); else if (!v.paused) { v.pause(); setOn(false); }
  };
  useEffect(() => {
    const card = root.current?.closest('.hc-card');
    if (!card) return;
    const enter = (e: Event) => { if ((e as PointerEvent).pointerType === 'mouse' && !reducedMotion()) run(true); };
    const leave = (e: Event) => { if ((e as PointerEvent).pointerType === 'mouse') run(false); };
    const io = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) run(false); });
    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointerleave', leave);
    io.observe(card);
    return () => { card.removeEventListener('pointerenter', enter); card.removeEventListener('pointerleave', leave); io.disconnect(); };
  }, []);
  return (
    <div className="hc-clip" ref={root} data-playing={on || undefined}>
      <video ref={video} muted loop playsInline preload="none" poster={poster} aria-label={alt} tabIndex={-1}>
        <source src={src} type="video/mp4" />
      </video>
      <button type="button" className="hc-play" aria-pressed={on} onClick={() => run(!on)}>
        {on ? <svg aria-hidden="true" viewBox="0 0 12 12" width="13" height="13"><path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" /></svg> : <PlayIcon size={13} />}
        <span className="ui-sr">{on ? pause : play}: {name}</span>
      </button>
    </div>
  );
}
