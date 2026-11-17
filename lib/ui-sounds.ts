import { playCue } from './sound';

const CONTROL = 'a[href], button:not([disabled]), [role="button"], summary';

/**
 * Interface sounds for every control of the site, with one delegated listener each (no per-component wiring).
 * Hover (fine pointers only) → a soft tick; click → a click, the menu button → a breath. The gate (#boot) and the sound
 * button make their own sound. With reduced motion `playCue` stays silent. Returns the cleanup.
 */
export function installUiSounds() {
  let lastEl: Element | null = null;
  let lastAt = 0;
  const onOver = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = (e.target as Element | null)?.closest?.(CONTROL);
    if (!el || el === lastEl || el.closest('#boot') || el.closest('.sound-toggle')) return;
    lastEl = el;
    const now = performance.now();
    if (now - lastAt < 90) return;
    lastAt = now;
    playCue('tick');
  };
  const onOut = (e: PointerEvent) => {
    if ((e.target as Element | null)?.closest?.(CONTROL) === lastEl) lastEl = null;
  };
  const onClick = (e: MouseEvent) => {
    const el = (e.target as Element | null)?.closest?.(CONTROL);
    if (!el || el.closest('#boot') || el.closest('.sound-toggle')) return;
    playCue(el.classList.contains('menu-toggle') && !el.classList.contains('menu-toggle--close') ? 'whoosh' : 'click');
  };
  addEventListener('pointerover', onOver, { passive: true, capture: true });
  addEventListener('pointerout', onOut, { passive: true, capture: true });
  addEventListener('click', onClick, { passive: true, capture: true });
  return () => {
    removeEventListener('pointerover', onOver, { capture: true });
    removeEventListener('pointerout', onOut, { capture: true });
    removeEventListener('click', onClick, { capture: true });
  };
}
