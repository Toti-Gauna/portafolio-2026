'use client';

import { useEffect } from 'react';
import { CHAPTERS } from '@/lib/taller';
import { setZone } from '@/lib/music';
import { playCue } from '@/lib/sound';

/**
 * The walk: wide screens with motion allowed, and landscape screens with a mouse from 760 px (a 1280×720 laptop at
 * 150 % is 853×~400 CSS px). Phones, tablets in portrait and reduced motion keep the plain layout.
 */
const QUERY = [
  '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
  '(min-width: 760px) and (orientation: landscape) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
].join(', ');
/**
 * Scroll budget of each chapter, in px (Ola 12): the scene holds still, then the camera moves to the next one. Both
 * scale with the screen between a floor and a ceiling, so a short screen doesn't race through the films (the move
 * used to be 0.72 of the screen's height: ~5 wheel steps at 720 px tall, 3 at 400; now 9–12).
 */
const HOLD = { vh: 0.35, min: 300, max: 380 };
const MOVE = { vh: 1.2, min: 900, max: 1200 };
const budget = (b: { vh: number; min: number; max: number }, vh: number) => Math.round(Math.min(b.max, Math.max(b.min, b.vh * vh)));
/** the text leaves over this share of the move */
const FADE = 0.25;
/** the scroll the scene follows is eased toward the real one (1/s): a wheel step glides instead of jumping a film */
const EASE = 7;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * Drives the home's walk through the cosmic workshop (components/taller/Taller.tsx). Everything it touches is
 * transform and opacity, written once per animation frame and only while scrolling (or easing); nothing loops.
 * - Each chapter pins its text. A text taller than the screen scrolls first and pins at its end (sticky with a negative
 *   top). Then the stage holds the scene and moves to the next one: the generated video (scrubbed: currentTime
 *   follows the eased scroll) or, without one, a crossfade with a small slide.
 * - Scenes get their srcset when they are near (one behind, two ahead); a video is created when its chapter is
 *   the current one and dropped (src removed: frees the decoder) when it is far.
 * - While the stage covers the screen, the three.js background is paused (html[data-scene-covered]): it can't be seen.
 */
function run(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>('.taller__stage');
  if (!stage) return () => {};
  const scenes = Array.from(stage.querySelectorAll<HTMLImageElement>('.taller__scene'));
  const chapters = Array.from(root.querySelectorAll<HTMLElement>('article[data-ch]'));
  const pins = chapters.map((c) => c.querySelector<HTMLElement>('.tch__pin'));
  const bodies = chapters.map((c) => c.querySelector<HTMLElement>('.tch__body'));
  const maps = chapters.map((c) => c.querySelector<HTMLElement>('.tch__map'));
  const videos = new Map<number, HTMLVideoElement>();
  const html = document.documentElement;
  const last = chapters.length - 1;
  root.dataset.mode = 'scroll';

  let tops: number[] = [];
  let leads: number[] = [];
  let hold = 0;
  let move = 1;
  let rootBottom = 0;
  let vh = innerHeight;
  const measure = () => {
    vh = innerHeight;
    hold = budget(HOLD, vh);
    move = budget(MOVE, vh);
    leads = pins.map((p) => (p ? Math.max(0, Math.ceil(p.offsetHeight - vh)) : 0));
    chapters.forEach((c, k) => {
      c.style.minHeight = k < last ? `${vh + leads[k] + hold + move}px` : '';
      const p = pins[k];
      if (p) p.style.top = leads[k] ? `${-leads[k]}px` : '';
    });
    tops = chapters.map((c) => c.getBoundingClientRect().top + scrollY);
    rootBottom = root.getBoundingClientRect().bottom + scrollY;
  };

  const load = (i: number) => {
    const img = scenes[i];
    if (img?.dataset.srcset) {
      img.srcset = img.dataset.srcset;
      delete img.dataset.srcset;
    }
  };

  const video = (i: number) => {
    let v = videos.get(i);
    if (v) return v;
    const src = chapters[i]?.dataset.next;
    if (!src) return undefined;
    v = document.createElement('video');
    v.className = 'taller__video';
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.setAttribute('aria-hidden', 'true');
    v.src = src;
    // iOS only decodes frames for seeking after the element has played once (muted playback needs no gesture)
    v.addEventListener('loadeddata', () => { void v!.play().then(() => v!.pause()).catch(() => {}); }, { once: true });
    stage.appendChild(v);
    videos.set(i, v);
    return v;
  };
  const drop = (i: number) => {
    const v = videos.get(i);
    if (!v) return;
    v.removeAttribute('src');
    v.load();
    v.remove();
    videos.delete(i);
  };

  const show = (el: HTMLElement, opacity: number, transform = '') => {
    el.style.opacity = String(opacity);
    el.style.transform = transform;
  };

  /** px into chapter k's move (negative while its text scrolls in or its scene holds) */
  const into = (y: number, k: number) => y - tops[k] - leads[k] - hold;

  let raf = 0;
  let eased = scrollY;
  let then = 0;
  const frame = (now: number) => {
    raf = 0;
    const target = scrollY;
    const dt = then ? Math.min(0.05, (now - then) / 1000) : 1 / 60;
    then = now;
    // a jump (an anchor, Home, End) goes straight there: no flight through every film on the way
    if (Math.abs(target - eased) > vh * 2.5) eased = target;
    else eased += (target - eased) * (1 - Math.exp(-dt * EASE));
    if (Math.abs(target - eased) < 0.5) eased = target;
    const y = eased;

    let i = 0;
    for (let k = 0; k < tops.length; k++) if (y >= tops[k] - 1) i = k;
    const e = i < last && y >= tops[0] ? clamp(into(y, i) / move) : 0;

    for (let k = i - 1; k <= i + 2; k++) if (k >= 0 && k < scenes.length) load(k);
    for (const k of Array.from(videos.keys())) if (k < i - 1 || k > i) drop(k);

    const v = chapters[i].dataset.next ? video(i) : undefined;
    const ready = !!v && v.readyState >= 2 && v.duration > 0;
    const dir = chapters[i].dataset.text === 'left' ? 1 : -1;

    scenes.forEach((img, k) => {
      if (k !== i && k !== i + 1) return show(img, 0);
      if (k === i) {
        if (e === 0) return show(img, 1);
        if (ready) return show(img, e < 0.06 ? 1 - e / 0.06 : 0);
        return show(img, 1 - e, `translate3d(${(-dir * 3 * e).toFixed(2)}%,0,0) scale(${(1 + 0.04 * e).toFixed(4)})`);
      }
      // the next scene: under the video until its last frames, or crossfading in
      if (ready) return show(img, e > 0.96 ? (e - 0.96) / 0.04 : 0);
      return show(img, e, `translate3d(${(dir * 3 * (1 - e)).toFixed(2)}%,0,0) scale(${(1.04 - 0.04 * e).toFixed(4)})`);
    });
    let seeking = false;
    videos.forEach((vid, k) => {
      if (k !== i || !ready || e === 0) return show(vid, 0);
      show(vid, e < 0.06 ? e / 0.06 : 1);
      const t = e * (vid.duration - 0.05);
      // one seek at a time: a new one would cancel the frame being decoded
      if (vid.seeking) seeking = true;
      else if (Math.abs(vid.currentTime - t) > 1 / 48) {
        vid.currentTime = t;
        seeking = true;
      }
    });

    bodies.forEach((b, k) => {
      if (!b) return;
      const out = k < last ? clamp(into(y, k) / (FADE * move)) : 0;
      b.style.opacity = String(1 - out);
      b.style.transform = out ? `translate3d(0,${(-24 * out).toFixed(1)}px,0)` : '';
      // the references leave with the text (an open card closes, the map can't be reached while it fades); a text
      // taller than the screen brings them in once it has pinned, so they sit on the scene
      const m = maps[k];
      if (m) {
        const off = out > 0 || y < tops[k] + leads[k] - 1;
        m.style.opacity = String(off && out === 0 ? 0 : 1 - out);
        if (off !== m.hasAttribute('inert')) {
          m.toggleAttribute('inert', off);
          if (off) m.querySelectorAll<HTMLDetailsElement>('details[open]').forEach((d) => { d.open = false; });
        }
      }
    });

    html.toggleAttribute('data-scene-covered', target < rootBottom - vh * 0.5);
    if (eased !== target || seeking) raf = requestAnimationFrame(frame);
    else then = 0;
  };
  const request = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const onResize = () => { measure(); request(); };

  measure();
  frame(performance.now());
  // fonts and the boot screen change the layout once after mount
  const ro = new ResizeObserver(onResize);
  ro.observe(root);
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', onResize);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    removeEventListener('scroll', request);
    removeEventListener('resize', onResize);
    Array.from(videos.keys()).forEach(drop);
    scenes.forEach((s) => { s.style.opacity = ''; s.style.transform = ''; });
    bodies.forEach((b) => { if (b) { b.style.opacity = ''; b.style.transform = ''; } });
    maps.forEach((m) => { if (m) { m.style.opacity = ''; m.removeAttribute('inert'); } });
    chapters.forEach((c) => { c.style.minHeight = ''; });
    pins.forEach((p) => { if (p) p.style.top = ''; });
    html.removeAttribute('data-scene-covered');
    delete root.dataset.mode;
  };
}

/**
 * The chapter in the middle of the screen sets the music zone, and a soft pulse marks each new building (every mode).
 * Only a chapter the visitor stays on counts (SETTLE): scrolling past three buildings doesn't switch the music three
 * times or ring three cues.
 */
const SETTLE = 450;
function watchChapters(root: HTMLElement) {
  let shown = -1;
  let timer = 0;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const i = Number((e.target as HTMLElement).dataset.ch);
        if (!CHAPTERS[i]) continue;
        window.clearTimeout(timer);
        if (i === shown) continue;
        const commit = () => {
          if (shown >= 0) playCue('select');
          shown = i;
          setZone(CHAPTERS[i].zone);
        };
        if (shown < 0) commit();
        else timer = window.setTimeout(commit, SETTLE);
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  root.querySelectorAll<HTMLElement>('article[data-ch]').forEach((a) => io.observe(a));
  return () => {
    window.clearTimeout(timer);
    io.disconnect();
  };
}

export function TallerEngine() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-taller]');
    if (!root) return;
    const stopWatching = watchChapters(root);
    const mq = matchMedia(QUERY);
    let stop = () => {};
    const start = () => {
      stop();
      stop = mq.matches ? run(root) : () => {};
    };
    start();
    mq.addEventListener('change', start);
    return () => {
      mq.removeEventListener('change', start);
      stop();
      stopWatching();
    };
  }, []);
  return null;
}
