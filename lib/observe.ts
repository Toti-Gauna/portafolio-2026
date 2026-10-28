/**
 * One pooled IntersectionObserver for every animated block (Reveal, diagrams, readouts).
 * `data-in` is set once, the first time a block enters; `data-live` is on only while the block is on screen,
 * so looping motion (a diagram's packets) pauses off-screen. Reduced motion: `data-in` at once, never `data-live`.
 */
type Entry = { live: boolean };
const watched = new Map<Element, Entry>();
let io: IntersectionObserver | null = null;

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function observer() {
  if (io) return io;
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const w = watched.get(e.target);
      if (!w) continue;
      if (e.isIntersecting) e.target.setAttribute('data-in', '');
      if (w.live) e.target.toggleAttribute('data-live', e.isIntersecting);
      else if (e.isIntersecting) { io!.unobserve(e.target); watched.delete(e.target); }
    }
  }, { rootMargin: '0px 0px -4% 0px' });
  return io;
}

export function observe(el: Element, live = false) {
  if (!('IntersectionObserver' in window) || reduced()) {
    el.setAttribute('data-in', '');
    return () => {};
  }
  watched.set(el, { live });
  observer().observe(el);
  return () => { watched.delete(el); io?.unobserve(el); };
}
