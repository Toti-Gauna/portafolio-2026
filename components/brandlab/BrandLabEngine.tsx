'use client';

import { useEffect } from 'react';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Turns the Brand Lab's picker into tabs (role tablist / tab / tabpanel, roving tabindex, arrows, Home and End) and
 * shows one sheet at a time. `#marca-<id>` opens that sheet (on load and on hashchange); a choice updates the hash with
 * replaceState. A sheet plays its entrance (`data-play`) when it is chosen, or the first time it enters the screen.
 */
export function BrandLabEngine() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-brandlab]');
    if (!root) return;
    const list = root.querySelector<HTMLElement>('.bl-picker ul')!;
    const tabs = Array.from(root.querySelectorAll<HTMLAnchorElement>('.bl-pick'));
    const sheets = tabs.map((a) => document.getElementById(`marca-${a.dataset.brand}`)!);
    const label = root.querySelector('.bl-picker')?.getAttribute('aria-label') ?? '';

    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', label);
    list.querySelectorAll('li').forEach((li) => li.setAttribute('role', 'presentation'));
    tabs.forEach((a, i) => {
      a.setAttribute('role', 'tab');
      a.id = `tab-${a.dataset.brand}`;
      a.setAttribute('aria-controls', sheets[i].id);
      a.removeAttribute('aria-current');
      sheets[i].setAttribute('role', 'tabpanel');
      sheets[i].setAttribute('aria-labelledby', a.id);
    });

    let current = -1;
    const play = (s: HTMLElement) => {
      if (reduced()) { s.setAttribute('data-play', ''); return; }
      s.removeAttribute('data-play');
      void s.offsetWidth; // restart the entrance
      s.setAttribute('data-play', '');
    };
    const io = 'IntersectionObserver' in window
      ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !e.target.hasAttribute('data-play')) play(e.target as HTMLElement); }), { rootMargin: '0px 0px -15% 0px' })
      : null;

    const show = (i: number, opts: { focus?: boolean; byUser?: boolean } = {}) => {
      if (i < 0 || i >= tabs.length) return;
      tabs.forEach((a, k) => { a.setAttribute('aria-selected', String(k === i)); a.tabIndex = k === i ? 0 : -1; });
      sheets.forEach((s, k) => s.toggleAttribute('data-active', k === i));
      if (opts.byUser) {
        history.replaceState(null, '', `#marca-${tabs[i].dataset.brand}`);
        play(sheets[i]);
      } else if (io) io.observe(sheets[i]); else play(sheets[i]);
      if (opts.focus) tabs[i].focus();
      current = i;
    };

    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const i = sheets.findIndex((s) => s.id === id);
      if (i >= 0 && i !== current) {
        show(i);
        requestAnimationFrame(() => sheets[i].scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' }));
        return true;
      }
      return false;
    };
    if (!fromHash()) show(0);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('.bl-pick');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      const i = tabs.indexOf(a);
      if (i !== current) show(i, { byUser: true });
    };
    const onKey = (e: KeyboardEvent) => {
      const i = tabs.indexOf(e.target as HTMLAnchorElement);
      if (i < 0) return;
      const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      show((next + tabs.length) % tabs.length, { focus: true, byUser: true });
    };
    list.addEventListener('click', onClick);
    list.addEventListener('keydown', onKey);
    addEventListener('hashchange', fromHash);
    root.setAttribute('data-ready', '');
    return () => {
      list.removeEventListener('click', onClick);
      list.removeEventListener('keydown', onKey);
      removeEventListener('hashchange', fromHash);
      io?.disconnect();
    };
  }, []);
  return null;
}
