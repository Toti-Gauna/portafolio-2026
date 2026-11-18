import { finePointer, reducedMotion } from './env';

/**
 * Hover magnético. A `[data-magnetic]` element (the value is the pull in px, 8 by default) leans toward the
 * mouse while it is over it and springs back when it leaves. It moves with the `translate` property, so it adds
 * to the element's own `transform` (the lift of a button on hover). Mouse only; the loop stops once everything
 * is back at rest.
 */
type State = { x: number; y: number; tx: number; ty: number };

export function installMagnetic() {
  if (!finePointer() || reducedMotion()) return { destroy: () => {} };
  const moving = new Map<HTMLElement, State>();
  let current: HTMLElement | null = null;
  let frame = 0;

  const tick = () => {
    frame = 0;
    for (const [el, s] of moving) {
      s.x += (s.tx - s.x) * 0.22;
      s.y += (s.ty - s.y) * 0.22;
      const done = Math.abs(s.tx - s.x) < 0.05 && Math.abs(s.ty - s.y) < 0.05;
      if (done) { s.x = s.tx; s.y = s.ty; }
      el.style.translate = s.x || s.y ? `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px` : '';
      if (done && !s.tx && !s.ty) moving.delete(el);
    }
    if ([...moving.values()].some((s) => s.x !== s.tx || s.y !== s.ty)) frame = requestAnimationFrame(tick);
  };
  const kick = () => { if (!frame) frame = requestAnimationFrame(tick); };
  const state = (el: HTMLElement) => {
    let s = moving.get(el);
    if (!s) { s = { x: 0, y: 0, tx: 0, ty: 0 }; moving.set(el, s); }
    return s;
  };
  const release = (el: HTMLElement) => { const s = state(el); s.tx = 0; s.ty = 0; kick(); };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-magnetic]') ?? null;
    if (el !== current) { if (current) release(current); current = el; }
    if (!el) return;
    const s = state(el);
    const r = el.getBoundingClientRect();
    const pull = Number(el.dataset.magnetic) || 8;
    const cx = r.left - s.x + r.width / 2;
    const cy = r.top - s.y + r.height / 2;
    s.tx = Math.max(-1, Math.min(1, (e.clientX - cx) / (r.width / 2))) * pull;
    s.ty = Math.max(-1, Math.min(1, (e.clientY - cy) / (r.height / 2))) * pull * 0.6;
    kick();
  };
  const onOut = (e: PointerEvent) => { if (!e.relatedTarget && current) { release(current); current = null; } };

  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerout', onOut, { passive: true });
  return {
    destroy: () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onOut);
      cancelAnimationFrame(frame);
      for (const el of moving.keys()) el.style.translate = '';
    },
  };
}
