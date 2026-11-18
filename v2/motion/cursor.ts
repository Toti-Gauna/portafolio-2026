import { finePointer, reducedMotion } from './env';

/**
 * Cursor contextual. The system cursor stays (it is the one people trust); a ring of light follows it and says
 * what a click does: it grows over links and buttons, takes the colour of the part of the page it is over
 * (`--from` or `--c`), and over a `[data-cursor="Ver caso"]` element shows that word next to the pointer.
 * It hides over text fields, when the mouse leaves the window and during a page transition. Mouse only, never
 * with reduced motion; the loop runs only while the ring is catching up with the pointer.
 */
const INTERACTIVE = 'a[href], button, [role="button"], [role="switch"], summary, label, select';
const TEXTUAL = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"]';

export function installCursor() {
  if (!finePointer() || reducedMotion()) return { destroy: () => {} };
  const el = document.createElement('div');
  el.className = 'v2-cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="v2-cursor-ring"></span><span class="v2-cursor-label"></span>';
  document.body.appendChild(el);
  const label = el.querySelector<HTMLElement>('.v2-cursor-label')!;

  let px = 0, py = 0, x = 0, y = 0, frame = 0, shown = false;
  let over: Element | null = null;

  const draw = () => { el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`; };
  const tick = () => {
    frame = 0;
    x += (px - x) * 0.3;
    y += (py - y) * 0.3;
    if (Math.abs(px - x) < 0.1 && Math.abs(py - y) < 0.1) { x = px; y = py; draw(); return; }
    draw();
    frame = requestAnimationFrame(tick);
  };

  const context = (target: Element | null) => {
    if (target === over) return;
    over = target;
    const t = target?.closest?.(`${INTERACTIVE}, [data-cursor], ${TEXTUAL}`) ?? null;
    const named = target?.closest?.<HTMLElement>('[data-cursor]') ?? null;
    const mode = t?.matches(TEXTUAL) ? 'text' : named?.dataset.cursor ? 'label' : t ? 'link' : 'idle';
    el.dataset.mode = mode;
    label.textContent = mode === 'label' ? named!.dataset.cursor! : '';
    const cs = target ? getComputedStyle(target) : null;
    const tint = (cs?.getPropertyValue('--from') || cs?.getPropertyValue('--c') || '').trim();
    if (tint) el.style.setProperty('--cc', tint); else el.style.removeProperty('--cc');
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') { el.dataset.on = 'false'; return; }
    px = e.clientX; py = e.clientY;
    if (!shown) { x = px; y = py; draw(); shown = true; }
    el.dataset.on = 'true';
    context(e.target as Element);
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const onOut = (e: PointerEvent) => { if (!e.relatedTarget) { el.dataset.on = 'false'; shown = false; over = null; } };
  const onDown = () => { el.dataset.down = 'true'; };
  const onUp = () => { delete el.dataset.down; };
  // after a click, or when the page scrolls under a still mouse, what is under the pointer changes: read it again
  const onClick = () => { over = null; };
  let look = 0;
  const onScroll = () => {
    if (!shown || look) return;
    look = requestAnimationFrame(() => { look = 0; context(document.elementFromPoint(px, py)); });
  };

  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerout', onOut, { passive: true });
  document.addEventListener('pointerdown', onDown, { passive: true });
  document.addEventListener('pointerup', onUp, { passive: true });
  document.addEventListener('click', onClick, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  return {
    destroy: () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onOut);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(look);
      el.remove();
    },
  };
}
