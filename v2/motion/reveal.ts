import { reducedMotion } from './env';

/**
 * Aparición. `data-reveal` (optionally `="fade"` or `="scale"`) marks what enters when it reaches the screen.
 * Only what is below the fold is hidden, and only once this engine runs (`html.v2-motion`): without JavaScript,
 * with reduced motion, or for whatever is already on screen, the content is simply there (`data-shown="instant"`).
 * Elements that enter together are staggered by their place on the page (`--ri`, at most 6 steps of 60 ms).
 */
const PENDING = '[data-reveal]:not([data-shown])';

export function installReveal() {
  const html = document.documentElement;
  const io = new IntersectionObserver(
    (entries) => {
      const shown = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
      shown.sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        return ra.top - rb.top || ra.left - rb.left;
      });
      shown.forEach((el, i) => {
        el.style.setProperty('--ri', String(Math.min(i, 6)));
        el.dataset.shown = 'in';
        io.unobserve(el);
      });
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.1 },
  );

  const scan = () => {
    const reduce = reducedMotion();
    const vh = window.innerHeight;
    for (const el of document.querySelectorAll<HTMLElement>(PENDING)) {
      const r = el.getBoundingClientRect();
      if (reduce || (r.top < vh && r.bottom > 0)) el.dataset.shown = 'instant';
      else io.observe(el);
    }
    html.classList.add('v2-motion');
  };

  /** Plays the entrance of everything inside `root` again (the demo on /motion/). */
  const replay = (root: Element) => {
    if (reducedMotion()) return;
    const els = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
    els.forEach((el) => { delete el.dataset.shown; el.style.removeProperty('--ri'); });
    void (root as HTMLElement).offsetHeight; // the hidden state must be drawn before it is left
    requestAnimationFrame(() => els.forEach((el) => io.observe(el)));
  };

  scan();
  return { scan, replay, destroy: () => io.disconnect() };
}
