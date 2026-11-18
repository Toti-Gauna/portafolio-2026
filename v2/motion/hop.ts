import { reducedMotion } from './env';

/**
 * Squash and stretch on demand (lote 3.2; the language of the gate, for the whole site).
 *  · Letters: inside a `[data-hop]`, the letter under the pointer jumps and takes two neighbours on each side.
 *  · `[data-boing]`: the element (or its `[data-boing-part]`) takes a breath when the pointer comes onto it;
 *    `data-boing="hop"` makes it jump instead.
 * Each move is one finite `Element.animate` asked by the pointer: nothing runs on its own, and the CSS animation
 * of an element is never swapped (that replays its entrance when the pointer leaves). Off with reduced motion.
 */
/** A jump of ours is still running (CSS entrances and loops do not count: they stay listed after they end). */
export const busy = (el: Element) => el.getAnimations().some((a) => !('animationName' in a) && a.playState === 'running');

export function hop(el: Element | null | undefined, amp: number, delay = 0, unit = 'em') {
  if (!el || !('animate' in el) || busy(el)) return;
  el.animate([
    { transform: 'translateY(0) scale(1, 1)' },
    { transform: 'translateY(0) scale(1.16, 0.8)', offset: 0.16 },
    { transform: `translateY(${-amp}${unit}) scale(0.9, 1.14)`, offset: 0.48, easing: 'cubic-bezier(0.5, 0, 0.9, 0.6)' },
    { transform: 'translateY(0) scale(1.13, 0.85)', offset: 0.8 },
    { transform: 'translateY(0) scale(1, 1)' },
  ], { duration: 540, delay, easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)' });
}

export function boing(el: Element | null | undefined) {
  if (!el || !('animate' in el) || busy(el)) return;
  el.animate([
    { transform: 'scale(1, 1)' }, { transform: 'scale(1.06, 0.9)', offset: 0.3 }, { transform: 'scale(0.97, 1.06)', offset: 0.6 },
    { transform: 'scale(1.02, 0.98)', offset: 0.82 }, { transform: 'scale(1, 1)' },
  ], { duration: 460, easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)' });
}

/** The letter and its neighbours, the nearer the higher. */
export function hopLetters(letter: Element, all: Element[]) {
  const i = all.indexOf(letter);
  hop(letter, 0.4);
  for (const n of [1, 2]) { hop(all[i - n], 0.4 / (n * 2.2), n * 70); hop(all[i + n], 0.4 / (n * 2.2), n * 70); }
}

export function installHop() {
  const onOver = (e: PointerEvent) => {
    if (reducedMotion()) return;
    const target = e.target as Element | null;
    const letter = target?.closest?.('[data-hop] .jt-l');
    if (letter) hopLetters(letter, [...letter.closest('[data-hop]')!.querySelectorAll('.jt-l')]);
    const host = target?.closest?.('[data-boing]');
    // only on the way in: moving between its own children is not arriving
    if (!host || e.pointerType !== 'mouse' || (e.relatedTarget instanceof Node && host.contains(e.relatedTarget))) return;
    const part = host.querySelector('[data-boing-part]') ?? host;
    if (host.getAttribute('data-boing') === 'hop') hop(part, 12, 0, 'px'); else boing(part);
  };
  document.addEventListener('pointerover', onOver, { passive: true });
  return () => document.removeEventListener('pointerover', onOver);
}
