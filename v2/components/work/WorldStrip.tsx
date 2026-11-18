'use client';

import { type CSSProperties, type KeyboardEvent, type PointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import { IconButton } from '../ui/Button';
import { ArrowIcon, ArrowLeftIcon } from '../ui/Icons';

export type StripStop = { id: string; x: number; label: [number, number]; ink: string; color: string; name: string; when: string; state: string };
export type StripLabels = { alt: string; hint: string; prev: string; next: string; drag: string; stops: string };

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The land of Work, travelled sideways (lote 4.1): it is a strip much wider than the screen inside a frame that
 * scrolls. Touch drags it natively; with a mouse you drag it too; the two buttons and the arrow keys (Home, End)
 * go one stop at a time and bring that stop to the middle. The names over the land are real text. The bar below
 * says where you are. Nothing runs on its own: every frame is asked by a scroll, a drag, a key or a click.
 * Without JS the frame still scrolls, with touch, trackpad and keyboard.
 */
export function WorldStrip({ svg, width, height, stops, labels }: { svg: string; width: number; height: number; stops: StripStop[]; labels: StripLabels }) {
  const view = useRef<HTMLDivElement>(null);
  const land = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; id: number } | null>(null);
  /** The stop a button or a key is gliding to: until the frame gets there, where you are is that stop. */
  const aim = useRef<number | null>(null);
  const [at, setAt] = useState(0);
  const [ready, setReady] = useState(false);
  const last = stops.length - 1;

  /** Where the frame has to be for stop `i` to sit in its middle. */
  const leftOf = useCallback((i: number) => {
    const v = view.current, l = land.current;
    if (!v || !l) return 0;
    // the land's own left edge inside the scrolled content, whatever the frame is positioned against
    const start = l.getBoundingClientRect().left - v.getBoundingClientRect().left - v.clientLeft + v.scrollLeft;
    return start + (stops[i].x / width) * l.offsetWidth - v.clientWidth / 2;
  }, [stops, width]);

  const go = useCallback((i: number) => {
    const v = view.current;
    if (!v) return;
    const n = Math.max(0, Math.min(last, i));
    aim.current = n;
    setAt(n);
    v.scrollTo({ left: leftOf(n), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [last, leftOf]);

  /* where you are: the stop nearest to the middle of the frame, read only when the frame has scrolled */
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    setReady(true);
    let raf = 0;
    const read = () => {
      raf = 0;
      if (aim.current !== null) {
        const to = Math.max(0, Math.min(v.scrollWidth - v.clientWidth, leftOf(aim.current)));
        if (Math.abs(to - v.scrollLeft) > 2) return;
        aim.current = null;
      }
      let best = 0, gap = Infinity;
      for (let i = 0; i <= last; i++) { const g = Math.abs(leftOf(i) - v.scrollLeft); if (g < gap) { gap = g; best = i; } }
      setAt(best);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    // a hand on the land takes over from a glide; so does the end of the glide, wherever it stopped
    const free = () => { aim.current = null; };
    const settle = () => { aim.current = null; onScroll(); };
    v.addEventListener('scroll', onScroll, { passive: true });
    v.addEventListener('scrollend', settle);
    v.addEventListener('wheel', free, { passive: true });
    v.addEventListener('touchstart', free, { passive: true });
    v.addEventListener('pointerdown', free);
    return () => {
      v.removeEventListener('scroll', onScroll); v.removeEventListener('scrollend', settle); v.removeEventListener('wheel', free);
      v.removeEventListener('touchstart', free); v.removeEventListener('pointerdown', free);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [last, leftOf]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const to = e.key === 'ArrowRight' ? at + 1 : e.key === 'ArrowLeft' ? at - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? last : null;
    if (to === null) return;
    e.preventDefault();
    go(to);
  };
  /* a mouse drags the land like a finger does */
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    const v = view.current;
    if (!v || e.pointerType !== 'mouse' || e.button !== 0) return;
    drag.current = { x: e.clientX, left: v.scrollLeft, id: e.pointerId };
    v.setPointerCapture(e.pointerId);
    v.dataset.drag = '';
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const v = view.current, d = drag.current;
    if (v && d && d.id === e.pointerId) v.scrollLeft = d.left - (e.clientX - d.x);
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const v = view.current;
    if (!v || !drag.current || drag.current.id !== e.pointerId) return;
    drag.current = null;
    delete v.dataset.drag;
  };

  const here = stops[at];
  // the land can bring its first and its last stop to the middle of the frame: it has that much room at both ends
  const vars = { '--ws-r': width / height, '--ws-a': stops[0].x / height, '--ws-z': (width - stops[last].x) / height } as CSSProperties;
  return (
    // the keys work from the frame and from its two buttons alike
    <div className="ws" style={vars} data-ready={ready || undefined} onKeyDown={onKey}>
      <div
        ref={view} className="ws-view" role="group" aria-label={labels.hint} tabIndex={0} data-cursor={labels.drag}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      >
        <div className="ws-track">
          <div ref={land} className="ws-land">
            <svg className="wa" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={labels.alt} dangerouslySetInnerHTML={{ __html: svg }} />
            <ol className="ws-names" aria-label={labels.stops}>
              {stops.map((s, i) => (
                <li key={s.id} data-id={s.id} data-on={i === at || undefined} style={{ left: `${(s.label[0] / width) * 100}%`, top: `${(s.label[1] / height) * 100}%`, color: s.ink }}>
                  <b>{s.name}</b>
                  <span>{s.when}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <div className="ws-bar" style={{ '--from': here.color } as CSSProperties}>
        <IconButton label={labels.prev} disabled={at === 0} onClick={() => go(at - 1)}><ArrowLeftIcon /></IconButton>
        <p className="ws-now" aria-live="polite">
          <span className="ws-count">{pad(at + 1)} / {pad(stops.length)}</span>
          <b>{here.name}</b>
          <span className="ws-meta">{here.when} · {here.state}</span>
        </p>
        <IconButton label={labels.next} disabled={at === last} onClick={() => go(at + 1)}><ArrowIcon /></IconButton>
      </div>
    </div>
  );
}
