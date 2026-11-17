'use client';

import { useEffect } from 'react';
import { CHAPTERS } from '@/lib/taller';
import { setZone } from '@/lib/music';
import { playCue } from '@/lib/sound';

/** Wide screens with motion allowed: the walk. Phones, tablets in portrait and reduced motion keep the plain layout. */
const QUERY = '(min-width: 900px) and (prefers-reduced-motion: no-preference)';
/** share of a chapter's pinned scroll spent holding its scene before the camera moves to the next one */
const HOLD = 0.4;
/** the text leaves over this share of the move */
const FADE = 0.16;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * Drives the home's walk through the cosmic workshop (components/taller/Taller.tsx). Everything it touches is
 * transform and opacity, written once per animation frame and only while scrolling; nothing loops.
 * - Each chapter pins for its height; while pinned, the stage holds its scene, then moves to the next one: the
 *   generated video (scrubbed by the scroll: currentTime follows the position) or, without one, a crossfade with a
 *   small slide.
 * - Scenes get their srcset when they are near (one behind, two ahead); a video is created when its chapter is
 *   the current one and dropped (src removed: frees the decoder) when it is far.
 * - While the stage covers the screen, the three.js background is paused (html[data-scene-covered]): it can't be seen.
 */
function run(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>('.taller__stage');
  if (!stage) return () => {};
  const scenes = Array.from(stage.querySelectorAll<HTMLImageElement>('.taller__scene'));
  const chapters = Array.from(root.querySelectorAll<HTMLElement>('article[data-ch]'));
  const bodies = chapters.map((c) => c.querySelector<HTMLElement>('.tch__body'));
  const videos = new Map<number, HTMLVideoElement>();
  const html = document.documentElement;
  root.dataset.mode = 'scroll';

  let tops: number[] = [];
  let spans: number[] = [];
  let rootBottom = 0;
  let vh = innerHeight;
  const measure = () => {
    vh = innerHeight;
    tops = chapters.map((c) => c.getBoundingClientRect().top + scrollY);
    spans = chapters.map((c) => Math.max(1, c.offsetHeight - vh));
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

  let raf = 0;
  const frame = () => {
    raf = 0;
    const y = scrollY;
    let i = 0;
    for (let k = 0; k < tops.length; k++) if (y >= tops[k] - 1) i = k;
    const f = y < tops[0] ? 0 : clamp((y - tops[i]) / spans[i]);
    const hasNext = i < chapters.length - 1;
    const e = hasNext ? clamp((f - HOLD) / (1 - HOLD)) : 0;

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
    videos.forEach((vid, k) => {
      if (k !== i || !ready || e === 0) return show(vid, 0);
      show(vid, e < 0.06 ? e / 0.06 : 1);
      const t = e * (vid.duration - 0.05);
      if (Math.abs(vid.currentTime - t) > 1 / 48) vid.currentTime = t;
    });

    bodies.forEach((b, k) => {
      if (!b) return;
      const fk = y < tops[k] ? 0 : clamp((y - tops[k]) / spans[k]);
      const out = k < chapters.length - 1 ? clamp((fk - HOLD) / FADE) : 0;
      b.style.opacity = String(1 - out);
      b.style.transform = out ? `translate3d(0,${(-24 * out).toFixed(1)}px,0)` : '';
    });

    html.toggleAttribute('data-scene-covered', y < rootBottom - vh * 0.5);
  };
  const request = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const onResize = () => { measure(); request(); };

  measure();
  frame();
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
    html.removeAttribute('data-scene-covered');
    delete root.dataset.mode;
  };
}

/** The chapter in the middle of the screen sets the music zone, and a soft pulse marks each new building (every mode). */
function watchChapters(root: HTMLElement) {
  let shown = -1;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const i = Number((e.target as HTMLElement).dataset.ch);
        if (i === shown || !CHAPTERS[i]) continue;
        if (shown >= 0) playCue('select');
        shown = i;
        setZone(CHAPTERS[i].zone);
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  root.querySelectorAll<HTMLElement>('article[data-ch]').forEach((a) => io.observe(a));
  return () => io.disconnect();
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
