import { clamp, reducedMotion } from './env';

/**
 * Animación ligada al scroll. Every `[data-scroll]` element gets `--p`, from 0 (its top meets the bottom of the
 * screen) to 1 (its bottom leaves the top). The CSS turns `--p` into transform, opacity or stroke-dashoffset.
 * Only elements near the screen are measured, and only on frames where the page scrolled: nothing runs while the
 * page is still. With reduced motion each element rests at `data-scroll-rest` (default 1, its final frame).
 */
export function installScroll() {
  const active = new Set<HTMLElement>();
  let frame = 0;

  const update = () => {
    frame = 0;
    const vh = window.innerHeight;
    for (const el of active) {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--p', clamp((vh - r.top) / (vh + r.height)).toFixed(4));
    }
  };
  const request = () => { if (!frame && active.size) frame = requestAnimationFrame(update); };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) active.add(e.target as HTMLElement);
        else active.delete(e.target as HTMLElement);
      }
      request();
    },
    { rootMargin: '15% 0px' },
  );

  const scan = () => {
    const reduce = reducedMotion();
    for (const el of document.querySelectorAll<HTMLElement>('[data-scroll]:not([data-scroll-on])')) {
      el.dataset.scrollOn = '';
      if (reduce) el.style.setProperty('--p', el.dataset.scrollRest ?? '1');
      else io.observe(el);
    }
    // elements that left the page with the previous route
    for (const el of active) if (!el.isConnected) active.delete(el);
  };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  scan();
  return {
    scan,
    destroy: () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    },
  };
}
