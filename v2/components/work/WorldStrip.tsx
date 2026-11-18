'use client';

import { type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import { read as recall, sfx, write as remember } from '@/v2/sound/control';
import { ArrowIcon, ArrowLeftIcon } from '../ui/Icons';
import { type Body, body, faces, step, toss, twirl } from './crates';
import { fromScreen, KX, KY, KZ } from './world-kit';

export type StripStop = { id: string; x: number; y: number; span: [number, number]; label: [number, number]; ink: string; on: string; color: string; name: string; when: string; state: string; group: string };
export type StripLabels = { kicker: string; title: string; alt: string; hint: string; prev: string; next: string; drag: string; stops: string; more: string; zoomIn: string; zoomOut: string; asList: string; toNight: string; toDay: string; pause: string; play: string };
export type StripWalker = { id: string; x: number; y: number; dx: number; dy: number; dur: number; c: string; ink: string };
export type StripCrate = { id: string; x: number; y: number; c: string };

const pad = (n: number) => String(n).padStart(2, '0');
/** How far the mouse has to travel before a press becomes a drag (a press on a button stays a click). */
const DRAG = 6;
/** How close you can get: the land at 1× fills the height of the map. One step of the buttons or the keys. */
const ZMIN = 1, ZMAX = 2.4, ZSTEP = 1.4;
const clampZ = (z: number) => Math.round(Math.min(ZMAX, Math.max(ZMIN, z)) * 100) / 100;
const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TIME_KEY = 'ig:v2:time';
/** How high a crate rides in the hand, in land units. */
const LIFT = 24;
/** A face of a crate: its colour, lighter where the light falls and darker away from it. */
const shade = (hex: string, lit: number) => {
  const to = lit > 0.5 ? 255 : 6, k = lit > 0.5 ? (lit - 0.5) * 0.7 : (0.5 - lit) * 1.1;
  return `rgb(${[1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - k) + to * k)).join(' ')})`;
};
const crateAt = (c: StripCrate) => { const [x, y] = fromScreen(c.x, c.y); return body(x, y); };

/** Someone walking: no face, what they wear in the colour given, the rest in the ink of the ground they are on. */
const Walker = () => (
  <svg viewBox="0 0 16 30" aria-hidden="true">
    <ellipse className="ww-shadow" cx="9" cy="28.4" rx="6" ry="1.8" />
    <g className="ww-body">
      <rect className="ww-leg ww-leg--a" x="5.2" y="17" width="2.6" height="11" rx="1.3" />
      <rect className="ww-leg ww-leg--b" x="8.2" y="17" width="2.6" height="11" rx="1.3" />
      <rect className="ww-coat" x="3.6" y="8" width="8.8" height="11.5" rx="3.4" />
      <rect className="ww-arm" x="6.8" y="9.6" width="2.4" height="8.4" rx="1.2" />
      <circle className="ww-head" cx="8" cy="4.2" r="3.5" />
    </g>
  </svg>
);
const Cloud = () => (
  <svg viewBox="0 0 120 48" aria-hidden="true"><path d="M22 40a14 14 0 0 1 2-27.8A20 20 0 0 1 62 8a17 17 0 0 1 30 8 12.5 12.5 0 0 1 6 24Z" /></svg>
);

/**
 * The engine of the world of Work (lotes 4.1 y 4.2). The land fills the screen and is travelled sideways: it is a
 * strip much wider than the screen inside a frame that scrolls. Touch drags it natively; a mouse drags it too;
 * the two buttons inside the map and the arrow keys (Home, End) go one stop at a time and bring it to the middle.
 * It zooms: the buttons «+» and «−», the keys + and −, a pinch on a trackpad (ctrl + wheel), two fingers on a
 * screen, or a double click on the land. While a gesture lasts only a `transform` moves (the compositor does it);
 * when it ends, the land takes its new size once and the frame is moved so that the point under the fingers
 * stays where it was. A button does the same with a short animation of that transform: the one heavy frame,
 * the land drawn again at its new size, always falls on a still picture. The glass card in the corner says where you are, holds the minimap — the whole land, with
 * the window you see; press or drag on it to travel — and the way to the list. Over the land, as real text: the
 * name, the dates and «Más información» of every stop, which opens its postcard and its card (WorldInfo).
 * Nothing runs on its own: every frame is asked by a scroll, a gesture, a key or a click.
 * Without JS the frame still scrolls with touch, trackpad and keyboard, and the list below holds the same facts.
 */
export function WorldStrip({ svg, mini, width, height, stops, walkers, crates, labels }: { svg: string; mini: string; width: number; height: number; stops: StripStop[]; walkers: StripWalker[]; crates: StripCrate[]; labels: StripLabels }) {
  const root = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const land = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLSpanElement>(null);
  const press = useRef<{ x: number; y: number; left: number; top: number; id: number; on: boolean } | null>(null);
  /** The stop a button or a key is gliding to: until the frame gets there, where you are is that stop. */
  const aim = useRef<number | null>(null);
  /** Where the land is inside the scrolled content, and its size: measured on mount, on resize and after a zoom. */
  const geo = useRef({ x: 0, y: 0, w: 1, h: 1, vw: 1, vh: 1 });
  const zoom = useRef(1);
  /** A gesture in progress: the scale it has reached and the point it is centred on (client coordinates). */
  const gesture = useRef<{ k: number; cx: number; cy: number; t?: number } | null>(null);
  const [at, setAt] = useState(0);
  const [z, setZ] = useState(1);
  const [ready, setReady] = useState(false);
  /* life (lote 4.3): day or night, moving or paused, which places are on screen, and the crates */
  const [time, setTime] = useState<'day' | 'night'>('day');
  const [life, setLife] = useState(true);
  const veil = useRef<HTMLDivElement>(null);
  const live = useRef<Map<string, Element[]> | null>(null);
  const liveNow = useRef('');
  const bodies = useRef<Body[]>(crates.map(crateAt));
  const crateEls = useRef<(HTMLSpanElement | null)[]>([]);
  const hand = useRef<{ i: number; id: number; trail: [number, number, number][] } | null>(null);
  const loop = useRef(0);
  const last = stops.length - 1;

  const measure = useCallback(() => {
    const v = view.current, l = land.current;
    if (!v || !l) return;
    const a = v.getBoundingClientRect(), b = l.getBoundingClientRect();
    geo.current = { x: b.left - a.left - v.clientLeft + v.scrollLeft, y: b.top - a.top - v.clientTop + v.scrollTop, w: l.offsetWidth, h: l.offsetHeight, vw: v.clientWidth, vh: v.clientHeight };
  }, []);
  /** Where the frame has to be for stop `i` to sit in its middle. */
  const spot = useCallback((i: number) => {
    const g = geo.current;
    return { left: g.x + (stops[i].x / width) * g.w - g.vw / 2, top: g.y + (stops[i].y / height) * g.h - g.vh / 2 };
  }, [stops, width, height]);

  /** Which places are on screen: only they move (data-live on their ground, on what stands there and on who walks). */
  const markLive = useCallback(() => {
    const v = view.current, l = land.current;
    if (!v || !l) return;
    if (!live.current) {
      live.current = new Map();
      for (const el of l.querySelectorAll('.wa-band[data-id], .wa-isle[data-id], .ww[data-id]')) { const id = (el as HTMLElement | SVGElement).dataset.id!; live.current.set(id, [...(live.current.get(id) ?? []), el]); }
    }
    const g = geo.current, x0 = ((v.scrollLeft - g.x) / g.w) * width, x1 = x0 + (g.vw / g.w) * width;
    const on = stops.filter((s) => s.span[1] > x0 && s.span[0] < x1).map((s) => s.id);
    if (on.join() === liveNow.current) return;
    liveNow.current = on.join();
    for (const [id, els] of live.current) for (const el of els) el.toggleAttribute('data-live', on.includes(id));
  }, [stops, width]);

  /** The minimap's window: what part of the land is in view. */
  const paintWindow = useCallback(() => {
    const v = view.current, el = win.current;
    if (!v || !el) return;
    const g = geo.current;
    const l = Math.max(0, (v.scrollLeft - g.x) / g.w), t = Math.max(0, (v.scrollTop - g.y) / g.h);
    el.style.left = `${(l * 100).toFixed(3)}%`;
    el.style.width = `${(Math.min(1 - l, g.vw / g.w) * 100).toFixed(3)}%`;
    el.style.top = `${(t * 100).toFixed(2)}%`;
    el.style.height = `${(Math.min(1 - t, g.vh / g.h) * 100).toFixed(2)}%`;
    markLive();
  }, [markLive]);

  const go = useCallback((i: number) => {
    const v = view.current;
    if (!v) return;
    const n = Math.max(0, Math.min(last, i));
    aim.current = n;
    setAt(n);
    sfx('stop');
    const s = spot(n);
    v.scrollTo({ left: s.left, top: s.top, behavior: still() ? 'auto' : 'smooth' });
  }, [last, spot]);

  /**
   * The land takes zoom `next`, keeping the point at (cx, cy) — client coordinates — where it was on screen.
   * Whatever transform was previewing the change is dropped in the same frame: the new layout shows exactly what
   * the preview showed, only sharp.
   */
  const zoomTo = useCallback((next: number, cx?: number, cy?: number) => {
    const v = view.current, l = land.current, r = root.current;
    if (!v || !l || !r) return;
    const z0 = zoom.current, z1 = clampZ(next);
    const a = v.getBoundingClientRect();
    const fx = (cx ?? a.left + v.clientWidth / 2) - a.left - v.clientLeft, fy = (cy ?? a.top + v.clientHeight / 2) - a.top - v.clientTop;
    const g = geo.current;
    // the point under the focus, as a fraction of the land (the preview's origin, so the same with it or without)
    const u = (v.scrollLeft + fx - g.x) / g.w, w = (v.scrollTop + fy - g.y) / g.h;
    // the preview goes before measuring (a box is read with its transform); the same task lays the land out
    // again, so no frame ever shows the land without either
    l.style.transform = '';
    l.style.transformOrigin = '';
    if (z1 !== z0) {
      zoom.current = z1;
      r.style.setProperty('--z', String(z1));
      measure();
      const n = geo.current;
      v.scrollLeft = n.x + u * n.w - fx;
      v.scrollTop = n.y + w * n.h - fy;
      setZ(z1);
    }
    paintWindow();
  }, [measure, paintWindow]);

  /**
   * A button, a key or a double click: the zoom is shown first as a transform around the point (the compositor
   * animates it, the land is not laid out), and the land takes its new size when the movement is over — so the
   * one heavy frame, drawing the land again at its new size, lands on a still picture.
   */
  const busy = useRef(false);
  const zoomBy = useCallback((next: number, cx?: number, cy?: number) => {
    const v = view.current, l = land.current;
    if (!v || !l || busy.current) return;
    const z1 = clampZ(next), k = z1 / zoom.current;
    if (k === 1) return;
    const a = v.getBoundingClientRect();
    const px = cx ?? a.left + v.clientWidth / 2, py = cy ?? a.top + v.clientHeight / 2;
    if (still()) { zoomTo(z1, px, py); return; }
    const b = l.getBoundingClientRect(), origin = `${px - b.left}px ${py - b.top}px`;
    busy.current = true;
    const anim = l.animate([{ transformOrigin: origin, transform: 'none' }, { transformOrigin: origin, transform: `scale(${k})` }], { duration: 240, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' });
    const done = () => {
      l.style.transformOrigin = origin;
      l.style.transform = `scale(${k})`;
      anim.cancel();
      zoomTo(z1, px, py);
      busy.current = false;
    };
    anim.finished.then(done, () => { busy.current = false; });
  }, [zoomTo]);

  /**
   * A gesture shows its zoom with a transform only, around the point where it started (which therefore stays
   * put); the land is laid out again when it ends.
   */
  const preview = useCallback((k: number, cx: number, cy: number) => {
    const l = land.current;
    if (!l) return;
    const kk = clampZ(zoom.current * k) / zoom.current;
    if (!gesture.current) {
      const b = l.getBoundingClientRect();
      gesture.current = { k: kk, cx, cy };
      l.style.transformOrigin = `${cx - b.left}px ${cy - b.top}px`;
    } else gesture.current.k = kk;
    l.style.transform = `scale(${kk})`;
  }, []);
  const settle = useCallback(() => {
    const gst = gesture.current;
    if (!gst) return;
    gesture.current = null;
    zoomTo(zoom.current * gst.k, gst.cx, gst.cy);
  }, [zoomTo]);

  useEffect(() => {
    const r = root.current, v = view.current;
    if (!r || !v) return;
    // the map takes what is left of the screen under whatever sits above it
    const fit = () => r.style.setProperty('--ws-top', `${Math.round(r.getBoundingClientRect().top + window.scrollY)}px`);
    fit();
    measure();
    paintWindow();
    setReady(true);
    // the hour of the visitor, unless they chose: night from 19 to 7
    const hour = new Date().getHours(), chosen = recall(TIME_KEY);
    if (chosen === 'night' || (chosen !== 'day' && (hour >= 19 || hour < 7))) setTime('night');
    // nothing moves while the map is off screen
    const seen = new IntersectionObserver(([e]) => r.toggleAttribute('data-seen', e.isIntersecting), { threshold: 0.05 });
    seen.observe(r);
    let raf = 0;
    /* where you are: the stop nearest to the middle of the frame, read only when the frame has scrolled */
    const read = () => {
      raf = 0;
      paintWindow();
      if (aim.current !== null) {
        const s = spot(aim.current);
        const to = Math.max(0, Math.min(v.scrollWidth - v.clientWidth, s.left));
        if (Math.abs(to - v.scrollLeft) > 2) return;
        aim.current = null;
      }
      let best = 0, gap = Infinity;
      for (let i = 0; i <= last; i++) { const g = Math.abs(spot(i).left - v.scrollLeft); if (g < gap) { gap = g; best = i; } }
      setAt(best);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    // a hand on the land takes over from a glide; so does the end of the glide, wherever it stopped
    const free = () => { aim.current = null; };
    const end = () => { aim.current = null; onScroll(); };
    /* a pinch on a trackpad arrives as ctrl + wheel: shown with a transform, laid out when the fingers rest */
    const onWheel = (e: WheelEvent) => {
      free();
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const k = (gesture.current?.k ?? 1) * Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0025) * 4);
      preview(k, e.clientX, e.clientY);
      window.clearTimeout(gesture.current?.t);
      if (gesture.current) gesture.current.t = window.setTimeout(settle, 220);
    };
    /* two fingers on a screen: the same, from the distance between them */
    let pinch: { d: number; cx: number; cy: number } | null = null;
    const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const onTouchStart = (e: TouchEvent) => {
      free();
      if (e.touches.length === 2) pinch = { d: dist(e.touches), cx: (e.touches[0].clientX + e.touches[1].clientX) / 2, cy: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!pinch || e.touches.length !== 2) return;
      e.preventDefault();
      preview(dist(e.touches) / pinch.d, pinch.cx, pinch.cy);
    };
    const onTouchEnd = (e: TouchEvent) => { if (pinch && e.touches.length < 2) { pinch = null; settle(); } };
    const ro = new ResizeObserver(() => { fit(); measure(); paintWindow(); });
    ro.observe(v);
    v.addEventListener('scroll', onScroll, { passive: true });
    v.addEventListener('scrollend', end);
    v.addEventListener('wheel', onWheel, { passive: false });
    v.addEventListener('touchstart', onTouchStart, { passive: true });
    v.addEventListener('touchmove', onTouchMove, { passive: false });
    v.addEventListener('touchend', onTouchEnd);
    v.addEventListener('touchcancel', onTouchEnd);
    v.addEventListener('pointerdown', free);
    // a click outside the card of a stop closes it (the dialog covers the screen: outside is the dialog itself)
    const dialogs = [...document.querySelectorAll<HTMLDialogElement>('dialog.wi')];
    const out = (e: Event) => { if (e.target === e.currentTarget) (e.currentTarget as HTMLDialogElement).close(); };
    dialogs.forEach((d) => d.addEventListener('click', out));
    return () => {
      ro.disconnect();
      seen.disconnect();
      cancelAnimationFrame(loop.current);
      v.removeEventListener('scroll', onScroll); v.removeEventListener('scrollend', end); v.removeEventListener('wheel', onWheel);
      v.removeEventListener('touchstart', onTouchStart); v.removeEventListener('touchmove', onTouchMove); v.removeEventListener('touchend', onTouchEnd);
      v.removeEventListener('touchcancel', onTouchEnd); v.removeEventListener('pointerdown', free);
      dialogs.forEach((d) => d.removeEventListener('click', out));
      window.clearTimeout(gesture.current?.t);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [last, spot, measure, paintWindow, preview, settle]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(zoom.current * ZSTEP); return; }
    if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomBy(zoom.current / ZSTEP); return; }
    const to = e.key === 'ArrowRight' ? at + 1 : e.key === 'ArrowLeft' ? at - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? last : null;
    if (to === null) return;
    e.preventDefault();
    go(to);
  };
  /* a mouse drags the land like a finger does — once it has moved: a press that stays put is still a click */
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    const v = view.current;
    if (!v || e.pointerType !== 'mouse' || e.button !== 0 || (e.target as Element).closest('.wc')) return;
    press.current = { x: e.clientX, y: e.clientY, left: v.scrollLeft, top: v.scrollTop, id: e.pointerId, on: false };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const v = view.current, p = press.current;
    if (!v || !p || p.id !== e.pointerId) return;
    if (!p.on) {
      if (Math.hypot(e.clientX - p.x, e.clientY - p.y) < DRAG) return;
      p.on = true;
      v.setPointerCapture(e.pointerId);
      v.dataset.drag = '';
    }
    v.scrollLeft = p.left - (e.clientX - p.x);
    v.scrollTop = p.top - (e.clientY - p.y);
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const v = view.current;
    if (!v || !press.current || press.current.id !== e.pointerId) return;
    press.current = null;
    delete v.dataset.drag;
  };
  const onDouble = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest('button')) return;
    zoomBy(zoom.current >= ZMAX - 0.01 ? ZMIN : zoom.current * ZSTEP, e.clientX, e.clientY);
  };
  /* the minimap: press to go there, drag to travel; the land follows at once */
  const miniGo = (e: PointerEvent<HTMLSpanElement>) => {
    const v = view.current;
    if (!v) return;
    const b = e.currentTarget.getBoundingClientRect(), g = geo.current;
    aim.current = null;
    v.scrollLeft = g.x + ((e.clientX - b.left) / b.width) * g.w - g.vw / 2;
    v.scrollTop = g.y + ((e.clientY - b.top) / b.height) * g.h - g.vh / 2;
  };
  const open = (id: string) => { sfx('open'); (document.getElementById(`wi-${id}`) as HTMLDialogElement | null)?.showModal(); };

  /* ── life: day and night ── */
  const flip = async (e: MouseEvent<HTMLButtonElement>) => {
    const next = time === 'day' ? 'night' : 'day', r = root.current, el = veil.current;
    remember(TIME_KEY, next);
    sfx(next);
    if (!r || !el || still() || !el.animate) { setTime(next); return; }
    // the new hour spreads from the button like a wave; the land changes under it, and the wave clears
    const a = r.getBoundingClientRect(), b = e.currentTarget.getBoundingClientRect();
    const at = `${Math.round(b.left + b.width / 2 - a.left)}px ${Math.round(b.top + b.height / 2 - a.top)}px`;
    el.dataset.to = next;
    el.style.opacity = '1';
    await el.animate([{ clipPath: `circle(0px at ${at})` }, { clipPath: `circle(${Math.ceil(Math.hypot(a.width, a.height))}px at ${at})` }], { duration: 520, easing: 'cubic-bezier(0.3, 0, 0.2, 1)' }).finished.catch(() => undefined);
    setTime(next);
    await el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 460, easing: 'ease-out' }).finished.catch(() => undefined);
    el.style.opacity = '0';
  };

  /* ── life: crates to pick up and throw ── */
  const paint = (i: number) => {
    const el = crateEls.current[i], b = bodies.current[i];
    if (!el) return;
    el.style.setProperty('--x', ((b.p[0] - b.p[1]) * KX).toFixed(1));
    el.style.setProperty('--y', ((b.p[0] + b.p[1]) * KY).toFixed(1));
    const f = faces(b), paths = el.querySelectorAll('path'), sh = el.querySelector('ellipse');
    paths.forEach((path, k) => { path.setAttribute('d', f[k]?.d ?? ''); if (f[k]) path.style.fill = shade(crates[i].c, f[k].lit); });
    if (sh) { sh.setAttribute('rx', (9 + b.p[2] * 0.06).toFixed(1)); sh.style.opacity = String(Math.max(0.05, 0.22 - b.p[2] * 0.0016)); }
  };
  const tick = (t0: number) => (now: number) => {
    const dt = Math.min(0.032, Math.max(0, (now - t0) / 1000));
    let busy = false;
    bodies.current.forEach((b, i) => {
      if (b.held) { twirl(b, dt); paint(i); busy = true; return; }
      if (b.rest) return;
      // two half steps: a fast crate does not sink through the ground
      const hit = Math.max(step(b, dt / 2, walls), step(b, dt / 2, walls));
      if (hit > 0.12) sfx('thud', hit);
      paint(i);
      busy = busy || !b.rest;
    });
    loop.current = busy ? requestAnimationFrame(tick(now)) : 0;
  };
  const walls = { x0: 24, x1: width - 24, y0: 70, y1: height - 10 };
  const run = () => { if (!loop.current) loop.current = requestAnimationFrame(tick(performance.now())); };
  /** Where a pointer is on the land, in the land's units. */
  const onLand = (e: PointerEvent) => { const b = land.current!.getBoundingClientRect(); return [((e.clientX - b.left) / b.width) * width, ((e.clientY - b.top) / b.height) * height] as [number, number]; };
  const carry = (b: Body, x: number, y: number) => { const [px, py] = fromScreen(x, y + LIFT * KZ); b.p = [px, py, LIFT]; };
  const grab = (i: number) => (e: PointerEvent<HTMLSpanElement>) => {
    if (e.button !== 0 || hand.current) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const b = bodies.current[i], [x, y] = onLand(e);
    b.held = true; b.rest = false; b.v = [0, 0, 0]; b.w = [0, 0, 0];
    carry(b, x, y);
    hand.current = { i, id: e.pointerId, trail: [[performance.now(), x, y]] };
    e.currentTarget.dataset.held = '';
    aim.current = null;
    sfx('grab');
    run();
  };
  const drag = (e: PointerEvent<HTMLSpanElement>) => {
    const h = hand.current;
    if (!h || h.id !== e.pointerId) return;
    const [x, y] = onLand(e);
    carry(bodies.current[h.i], x, y);
    h.trail.push([performance.now(), x, y]);
    if (h.trail.length > 6) h.trail.shift();
  };
  const drop = (e: PointerEvent<HTMLSpanElement>) => {
    const h = hand.current;
    if (!h || h.id !== e.pointerId) return;
    hand.current = null;
    delete e.currentTarget.dataset.held;
    // the throw is the way the hand was going over its last moments
    const a = h.trail[0], z = h.trail[h.trail.length - 1], dt = Math.max(0.016, (z[0] - a[0]) / 1000);
    const [vx, vy] = fromScreen((z[1] - a[1]) / dt, (z[2] - a[2]) / dt);
    toss(bodies.current[h.i], vx, vy);
    run();
  };

  const here = stops[at];
  // the land can bring its first and its last stop to the middle of the frame: it has that much room at both ends
  const vars = { '--z': 1, '--ws-wh': height, '--ws-r': width / height, '--ws-a': stops[0].x / height, '--ws-z': (width - stops[last].x) / height, '--from': here.color } as CSSProperties;
  return (
    // the keys work from the frame and from its buttons alike
    <div ref={root} className="ws" style={vars} data-ready={ready || undefined} data-zoomed={z > 1.01 || undefined} data-time={time} data-life={life ? 'on' : 'off'} onKeyDown={onKey}>
      <div
        ref={view} className="ws-view" role="group" aria-label={labels.hint} tabIndex={0} data-cursor={labels.drag}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onDoubleClick={onDouble}
      >
        <div className="ws-track">
          <div ref={land} className="ws-land">
            <svg className="wa" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={labels.alt} dangerouslySetInnerHTML={{ __html: svg }} />
            {/* life over the land: who walks and what can be thrown. Decoration: nothing here is announced or focused. */}
            <div className="ws-walkers" aria-hidden="true">
              {walkers.map((w, i) => (
                <span key={i} className="ww" data-id={w.id} style={{ left: `${(w.x / width) * 100}%`, top: `${(w.y / height) * 100}%`, '--dx': w.dx, '--dy': w.dy, '--d': `${w.dur}s`, '--c': w.c, '--k': w.ink, '--f': w.dx < 0 ? -1 : 1, '--i': i % 7 } as CSSProperties}>
                  <Walker />
                </span>
              ))}
            </div>
            <div className="ws-crates" aria-hidden="true">
              {crates.map((c, i) => {
                const b = bodies.current[i], f = faces(b);
                return (
                  <span
                    key={i} ref={(el) => { crateEls.current[i] = el; }} className="wc" data-id={c.id} data-cursor=""
                    style={{ '--x': ((b.p[0] - b.p[1]) * KX).toFixed(1), '--y': ((b.p[0] + b.p[1]) * KY).toFixed(1) } as CSSProperties}
                    onPointerDown={grab(i)} onPointerMove={drag} onPointerUp={drop} onPointerCancel={drop}
                  >
                    <svg viewBox="-24 -44 48 56">
                      <ellipse className="wc-shadow" cx="0" cy="0" rx="9.4" ry="4.4" />
                      {[0, 1, 2].map((k) => <path key={k} d={f[k]?.d ?? ''} style={f[k] ? { fill: shade(c.c, f[k].lit) } : undefined} />)}
                    </svg>
                  </span>
                );
              })}
            </div>
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
      {/* clouds cross the frame, with their shadow on the land; the veil is the wave of dusk and dawn */}
      <div className="ws-sky" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => <i key={i} className="wk" style={{ '--i': i } as CSSProperties}><Cloud /><Cloud /></i>)}
      </div>
      <div ref={veil} className="ws-veil" aria-hidden="true" />
      {/* the glass card: the page, where you are, the whole land, and the way to the list */}
      <div className="ws-hud">
        <p className="ws-kicker">{labels.kicker}</p>
        <h1>{labels.title}</h1>
        <p className="ws-now" aria-live="polite">
          <span className="ws-count">{pad(at + 1)} / {pad(stops.length)} · {here.group}</span>
          <b>{here.name}</b>
          <span className="ws-meta">{here.when} · {here.state}</span>
        </p>
        <span className="ws-mini" aria-hidden="true" data-at={at} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); miniGo(e); }} onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) miniGo(e); }}>
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" dangerouslySetInnerHTML={{ __html: mini }} />
          <span ref={win} className="ws-win" />
        </span>
        <a className="ws-list" href="#lista">{labels.asList}</a>
      </div>
      <div className="ws-zoom">
        <button type="button" className="ws-zbtn" aria-label={labels.zoomIn} disabled={z >= ZMAX - 0.01} onClick={() => zoomBy(zoom.current * ZSTEP)}>
          <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
        <button type="button" className="ws-zbtn" aria-label={labels.zoomOut} disabled={z <= ZMIN + 0.01} onClick={() => zoomBy(zoom.current / ZSTEP)}>
          <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
        <button type="button" className="ws-zbtn ws-time" aria-label={time === 'day' ? labels.toNight : labels.toDay} onClick={flip}>
          {time === 'day'
            ? <svg aria-hidden="true" viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M15.2 11.4A6.6 6.6 0 0 1 6.6 2.8a6.6 6.6 0 1 0 8.6 8.6Z" /></svg>
            : <svg aria-hidden="true" viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="9" cy="9" r="3.4" /><path d="M9 1.6v1.8M9 14.6v1.8M1.6 9h1.8M14.6 9h1.8M3.8 3.8l1.2 1.2M13 13l1.2 1.2M3.8 14.2 5 13M13 5l1.2-1.2" /></svg>}
        </button>
        <button type="button" className="ws-zbtn ws-pause" aria-label={life ? labels.pause : labels.play} aria-pressed={!life} onClick={() => setLife(!life)}>
          {life
            ? <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
            : <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M4.6 2.8v10.4L13 8Z" fill="currentColor" /></svg>}
        </button>
      </div>
      <button type="button" className="ws-nav ws-nav--prev" aria-label={labels.prev} disabled={at === 0} onClick={() => go(at - 1)}><ArrowLeftIcon size={18} /></button>
      <button type="button" className="ws-nav ws-nav--next" aria-label={labels.next} disabled={at === last} onClick={() => go(at + 1)}><ArrowIcon size={18} /></button>
    </div>
  );
}
