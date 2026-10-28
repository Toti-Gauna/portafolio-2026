/**
 * One pooled IntersectionObserver for every animated block (Reveal, diagrams, readouts).
 * `data-in` is set once, the first time a block enters; `data-live` is on only while the block is on screen,
 * so looping motion (a diagram's packets) pauses off-screen. Reduced motion: `data-in` at once, never `data-live`.
 * Touch screens (coarse pointer): `data-live` also comes off while the page scrolls and returns 200 ms after it
 * settles, so the looping strokes (repainted every frame) never compete with scrolling — as the background scene does.
 */
type Entry = { live: boolean };
const watched = new Map<Element, Entry>();
/** live blocks on screen right now */
const onScreen = new Set<Element>();
let io: IntersectionObserver | null = null;
let scrolling = false;
let scrollTimer = 0;
let listening = false;

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const setLive = (el: Element, on: boolean) => el.toggleAttribute('data-live', on && !scrolling);

function onScroll() {
  if (!scrolling) {
    scrolling = true;
    onScreen.forEach((el) => el.removeAttribute('data-live'));
  }
  clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(() => {
    scrolling = false;
    onScreen.forEach((el) => el.setAttribute('data-live', ''));
  }, 200);
}

function observer() {
  if (io) return io;
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const w = watched.get(e.target);
      if (!w) continue;
      if (e.isIntersecting) e.target.setAttribute('data-in', '');
      if (w.live) {
        if (e.isIntersecting) onScreen.add(e.target);
        else onScreen.delete(e.target);
        setLive(e.target, e.isIntersecting);
      } else if (e.isIntersecting) { io!.unobserve(e.target); watched.delete(e.target); }
    }
  }, { rootMargin: '0px 0px -4% 0px' });
  return io;
}

export function observe(el: Element, live = false) {
  if (!('IntersectionObserver' in window) || reduced()) {
    el.setAttribute('data-in', '');
    return () => {};
  }
  if (live && !listening && window.matchMedia('(pointer: coarse)').matches) {
    listening = true;
    addEventListener('scroll', onScroll, { passive: true });
  }
  watched.set(el, { live });
  observer().observe(el);
  return () => { watched.delete(el); onScreen.delete(el); io?.unobserve(el); };
}
