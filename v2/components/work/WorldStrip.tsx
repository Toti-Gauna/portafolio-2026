'use client';

import { type CSSProperties, type KeyboardEvent, type PointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowIcon, ArrowLeftIcon } from '../ui/Icons';

export type StripStop = { id: string; x: number; label: [number, number]; ink: string; on: string; color: string; name: string; when: string; state: string };
export type StripLabels = { kicker: string; title: string; alt: string; hint: string; prev: string; next: string; drag: string; stops: string; more: string };

const pad = (n: number) => String(n).padStart(2, '0');
/** How far the mouse has to travel before a press becomes a drag (a press on a button stays a click). */
const DRAG = 6;

/**
 * The map of Work (lote 4.1): the land fills the screen, edge to edge, and is travelled sideways. It is a strip
 * much wider than the screen inside a frame that scrolls: touch drags it natively; with a mouse you drag it too;
 * the two buttons INSIDE the map and the arrow keys (Home, End) go one stop at a time and bring that stop to the
 * middle. Over the land, as real text: the name of every stop, its dates and «Más información», which opens the
 * stop's postcard and its card (a <dialog> the server rendered: WorldInfo). A small panel says where you are.
 * Nothing runs on its own: every frame is asked by a scroll, a drag, a key or a click.
 * Without JS the frame still scrolls, with touch, trackpad and keyboard, and the cards below hold the same facts.
 */
export function WorldStrip({ svg, width, height, stops, labels }: { svg: string; width: number; height: number; stops: StripStop[]; labels: StripLabels }) {
  const root = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const land = useRef<HTMLDivElement>(null);
  const press = useRef<{ x: number; left: number; id: number; on: boolean } | null>(null);
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

  useEffect(() => {
    const r = root.current, v = view.current;
    if (!r || !v) return;
    // the map takes what is left of the screen under whatever sits above it
    const fit = () => r.style.setProperty('--ws-top', `${Math.round(r.getBoundingClientRect().top + window.scrollY)}px`);
    fit();
    setReady(true);
    let raf = 0;
    /* where you are: the stop nearest to the middle of the frame, read only when the frame has scrolled */
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
    window.addEventListener('resize', fit);
    // a click outside the card of a stop closes it (the dialog covers the screen: outside is the dialog itself)
    const dialogs = [...document.querySelectorAll<HTMLDialogElement>('dialog.wi')];
    const out = (e: MouseEvent) => { if (e.target === e.currentTarget) (e.currentTarget as HTMLDialogElement).close(); };
    dialogs.forEach((d) => d.addEventListener('click', out));
    return () => {
      v.removeEventListener('scroll', onScroll); v.removeEventListener('scrollend', settle); v.removeEventListener('wheel', free);
      v.removeEventListener('touchstart', free); v.removeEventListener('pointerdown', free); window.removeEventListener('resize', fit);
      dialogs.forEach((d) => d.removeEventListener('click', out));
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
  /* a mouse drags the land like a finger does — once it has moved: a press that stays put is still a click */
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    const v = view.current;
    if (!v || e.pointerType !== 'mouse' || e.button !== 0) return;
    press.current = { x: e.clientX, left: v.scrollLeft, id: e.pointerId, on: false };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const v = view.current, p = press.current;
    if (!v || !p || p.id !== e.pointerId) return;
    if (!p.on) {
      if (Math.abs(e.clientX - p.x) < DRAG) return;
      p.on = true;
      v.setPointerCapture(e.pointerId);
      v.dataset.drag = '';
    }
    v.scrollLeft = p.left - (e.clientX - p.x);
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const v = view.current;
    if (!v || !press.current || press.current.id !== e.pointerId) return;
    press.current = null;
    delete v.dataset.drag;
  };
  const open = (id: string) => (document.getElementById(`wi-${id}`) as HTMLDialogElement | null)?.showModal();

  const here = stops[at];
  // the land can bring its first and its last stop to the middle of the frame: it has that much room at both ends
  const vars = { '--ws-r': width / height, '--ws-a': stops[0].x / height, '--ws-z': (width - stops[last].x) / height, '--from': here.color } as CSSProperties;
  return (
    // the keys work from the frame and from its buttons alike
    <div ref={root} className="ws" style={vars} data-ready={ready || undefined} onKeyDown={onKey}>
      <div
        ref={view} className="ws-view" role="group" aria-label={labels.hint} tabIndex={0} data-cursor={labels.drag}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      >
        <div className="ws-track">
          <div ref={land} className="ws-land">
            <svg className="wa" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={labels.alt} dangerouslySetInnerHTML={{ __html: svg }} />
            <ol className="ws-names" aria-label={labels.stops}>
              {stops.map((s, i) => (
                <li key={s.id} data-id={s.id} data-on={i === at || undefined} style={{ left: `${(s.label[0] / width) * 100}%`, top: `${(s.label[1] / height) * 100}%`, '--ink': s.ink, '--on': s.on } as CSSProperties}>
                  <b>{s.name}</b>
                  <span>{s.when}</span>
                  <button type="button" className="ws-more" data-cursor="" onClick={() => open(s.id)}>
                    {labels.more}<span className="ui-sr"> · {s.name}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <div className="ws-hud">
        <p className="ws-kicker">{labels.kicker}</p>
        <h1>{labels.title}</h1>
        <p className="ws-now" aria-live="polite">
          <span className="ws-count">{pad(at + 1)} / {pad(stops.length)}</span>
          <b>{here.name}</b>
        </p>
        <span className="ws-dots" aria-hidden="true">{stops.map((s, i) => <i key={s.id} data-on={i === at || undefined} />)}</span>
      </div>
      <button type="button" className="ws-nav ws-nav--prev" aria-label={labels.prev} disabled={at === 0} onClick={() => go(at - 1)}><ArrowLeftIcon size={18} /></button>
      <button type="button" className="ws-nav ws-nav--next" aria-label={labels.next} disabled={at === last} onClick={() => go(at + 1)}><ArrowIcon size={18} /></button>
    </div>
  );
}
