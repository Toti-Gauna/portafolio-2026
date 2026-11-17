'use client';

import { useEffect } from 'react';
import { CHAPTERS } from '@/lib/taller';

/**
 * The references over the scenes (components/taller/Spots.tsx): behaviour only, nothing renders here.
 * - One card open at a time (the `name` of the <details> does it where supported; this does it everywhere).
 * - A reference is «active» while hovered (mouse), focused or open: its name opens, its outline draws and, in the walk,
 *   its cut-out lifts off the scene (`.taller__lift`: the same picture, clipped to the outline, raised, with a shadow).
 * - Escape closes the open card and gives the focus back; so does a click outside it.
 * All of it is transform, opacity, clip-path and stroke-dashoffset, driven by data attributes; nothing loops.
 */
function run(root: HTMLElement) {
  const lift = root.querySelector<HTMLElement>('.taller__lift');
  const liftImg = lift?.querySelector<HTMLImageElement>('.taller__lift-img');
  const scenes = Array.from(root.querySelectorAll<HTMLImageElement>('.taller__scene'));
  const spots = () => Array.from(root.querySelectorAll<HTMLElement>('.tch__spot'));
  const NS = 'http://www.w3.org/2000/svg';
  const poly = (li: HTMLElement) => (li.dataset.poly ?? '').split(' ').map(Number);
  const mid = (p: number[], o: 0 | 1) => p.filter((_, i) => i % 2 === o).reduce((a, b) => a + b, 0) / (p.length / 2);
  // the outlines (dashed + a line that draws itself) are made here: they only exist in the walk, so the HTML carries one list of points per reference
  root.querySelectorAll<SVGSVGElement>('.tch__shapes').forEach((svg) => {
    svg.closest('.tch__plane')?.querySelectorAll<HTMLElement>('.tch__spot').forEach((li) => {
      const p = poly(li);
      const g = document.createElementNS(NS, 'g');
      g.dataset.shape = li.dataset.spot;
      const pts = p.map((v, i) => ((v * (i % 2 ? 1357 : 2400)) / 100).toFixed(0)).join(' ');
      for (const cls of ['tch__dash', 'tch__trace']) {
        const el = document.createElementNS(NS, 'polygon');
        el.setAttribute('class', cls);
        el.setAttribute('points', pts);
        if (cls === 'tch__trace') el.setAttribute('pathLength', '100');
        g.appendChild(el);
      }
      svg.appendChild(g);
    });
  });
  let hovered: HTMLElement | null = null;
  let focused: HTMLElement | null = null;

  const openOne = () => root.querySelector<HTMLDetailsElement>('.tch__spot details[open]');
  const current = () => openOne()?.closest<HTMLElement>('.tch__spot') ?? hovered ?? focused;

  const refresh = () => {
    const now = current();
    for (const li of spots()) {
      const on = li === now;
      if (on !== li.hasAttribute('data-active')) li.toggleAttribute('data-active', on);
      const chapter = li.closest('article');
      const shape = chapter?.querySelector<SVGGElement>(`[data-shape="${li.dataset.spot}"]`);
      if (shape && on !== shape.hasAttribute('data-active')) shape.toggleAttribute('data-active', on);
    }
    if (!lift || !liftImg) return;
    const walk = root.dataset.mode === 'scroll';
    const i = now ? Number(now.closest<HTMLElement>('article')?.dataset.ch) : -1;
    const src = walk && i >= 0 ? scenes[i]?.currentSrc : '';
    if (!now || !src) {
      lift.removeAttribute('data-on');
      return;
    }
    if (liftImg.getAttribute('src') !== src) liftImg.src = src;
    const p = poly(now);
    lift.style.setProperty('--poly', `polygon(${Array.from({ length: p.length / 2 }, (_, k) => `${p[2 * k]}% ${p[2 * k + 1]}%`).join(', ')})`);
    lift.style.setProperty('--ox', `${mid(p, 0).toFixed(1)}%`);
    lift.style.setProperty('--oy', `${mid(p, 1).toFixed(1)}%`);
    lift.setAttribute('data-on', '');
  };

  const li = (e: Event) => (e.target as Element | null)?.closest<HTMLElement>('.tch__spot') ?? null;

  const onToggle = (e: Event) => {
    const d = e.target as HTMLDetailsElement;
    if (d.tagName !== 'DETAILS' || !d.closest('.tch__spot')) return;
    if (d.open) root.querySelectorAll<HTMLDetailsElement>('.tch__spot details[open]').forEach((o) => { if (o !== d) o.open = false; });
    refresh();
  };
  const onOver = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = li(e);
    if (el !== hovered) { hovered = el; refresh(); }
  };
  const onFocusIn = (e: FocusEvent) => {
    const el = li(e);
    if (el && (e.target as Element).matches(':focus-visible')) focused = el;
    else focused = null;
    refresh();
  };
  const onFocusOut = () => { focused = null; refresh(); };
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    const d = openOne();
    if (!d) return;
    d.open = false;
    d.querySelector<HTMLElement>('summary')?.focus();
  };
  const onDown = (e: PointerEvent) => {
    const d = openOne();
    if (d && !d.closest('.tch__spot')!.contains(e.target as Node)) d.open = false;
  };

  root.addEventListener('toggle', onToggle, true);
  root.addEventListener('pointerover', onOver, { passive: true });
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('focusout', onFocusOut);
  addEventListener('keydown', onKey);
  addEventListener('pointerdown', onDown, { passive: true });
  return () => {
    root.removeEventListener('toggle', onToggle, true);
    root.removeEventListener('pointerover', onOver);
    root.removeEventListener('focusin', onFocusIn);
    root.removeEventListener('focusout', onFocusOut);
    removeEventListener('keydown', onKey);
    removeEventListener('pointerdown', onDown);
    lift?.removeAttribute('data-on');
    root.querySelectorAll('.tch__shapes').forEach((svg) => svg.replaceChildren());
  };
}

export function TallerSpots() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-taller]');
    if (!root || !CHAPTERS.some((c) => c.spots?.length)) return;
    return run(root);
  }, []);
  return null;
}
