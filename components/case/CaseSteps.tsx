'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';

export type StepItem = { id: string; t: string; d: string; panel: ReactNode };
export type StepsUi = { label: string; of: string; prev: string; next: string; all: string };

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The case template (design/2026/casos.md): the steps of a case, one panel at a time. The server renders every panel
 * (the first marked active); without JS they all show, one below the other, and the column is an index of `#paso-<id>`
 * links. With JS only the active panel shows: a click, the prev/next links, the hash (`#paso-how`, or the id of a section
 * inside a panel) and the back button change it. The URL follows with replaceState; focus goes to the step's title.
 */
export function CaseSteps({ steps, ui }: { steps: StepItem[]; ui: StepsUi }) {
  const [active, setActive] = useState(0);
  const [fresh, setFresh] = useState(false);
  const user = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const ids = useMemo(() => steps.map((s) => s.id), [steps]);

  const go = useCallback((i: number, byUser = true) => {
    if (i < 0 || i >= ids.length) return;
    user.current = byUser;
    setFresh(byUser);
    setActive(i);
    if (byUser) history.replaceState(null, '', `#paso-${ids[i]}`);
  }, [ids]);

  // open the step named by the hash (and follow it when it changes)
  useEffect(() => {
    const fromHash = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      if (!h) return;
      let i = ids.findIndex((id) => `paso-${id}` === h);
      if (i < 0) {
        const el = document.getElementById(h);
        const panel = el?.closest('[data-step]');
        i = panel ? ids.indexOf(panel.getAttribute('data-step') ?? '') : -1;
        if (i >= 0) requestAnimationFrame(() => el?.scrollIntoView({ block: 'start' }));
      } else {
        requestAnimationFrame(() => document.getElementById(h)?.scrollIntoView({ block: 'start' }));
      }
      if (i >= 0) { user.current = false; setFresh(false); setActive(i); }
    };
    fromHash();
    addEventListener('hashchange', fromHash);
    return () => removeEventListener('hashchange', fromHash);
  }, [ids]);

  // after a change made by the reader: back to the start of the panel (if it was left above) and focus on its title
  useEffect(() => {
    if (!user.current) return;
    user.current = false;
    const panel = root.current?.querySelector<HTMLElement>(`[data-step="${ids[active]}"]`);
    if (!panel) return;
    const h = panel.querySelector<HTMLElement>('.cstep__h');
    h?.focus({ preventScroll: true });
    const top = panel.getBoundingClientRect().top;
    const head = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
    if (top < head + 8) panel.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
  }, [active, ids]);

  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#paso-"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const i = ids.indexOf(a.getAttribute('href')!.slice(6));
    if (i >= 0) go(i);
    const d = a.closest('details');
    if (d) d.open = false;
  };

  const n = steps.length;
  const list = (cls: string) => (
    <ol className={cls}>
      {steps.map((s, i) => (
        <li key={s.id}>
          <a href={`#paso-${s.id}`} aria-current={i === active ? 'step' : undefined}>
            <span className="csteps__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <span className="csteps__t">{s.t}<small>{s.d}</small></span>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div ref={root} className="csteps" onClick={onClick} style={{ '--p': (active + 1) / steps.length } as React.CSSProperties}>
      <nav className="csteps__side" aria-label={ui.label}>
        <div className="csteps__rail" aria-hidden="true"><i /></div>
        {list('csteps__list')}
      </nav>

      <div className="csteps__bar" role="group" aria-label={ui.label}>
        <div className="csteps__bar-row">
          <p className="csteps__now" aria-live="polite">
            <span className="label">{ui.of.replace('{n}', String(active + 1)).replace('{total}', String(n))}</span>
            <strong>{steps[active].t}</strong>
          </p>
          <button type="button" className="csteps__btn" aria-label={ui.prev} disabled={active === 0} onClick={() => go(active - 1)}>←</button>
          <button type="button" className="csteps__btn" aria-label={ui.next} disabled={active === n - 1} onClick={() => go(active + 1)}>→</button>
        </div>
        <details className="csteps__all">
          <summary>{ui.all}</summary>
          {list('csteps__list csteps__list--bar')}
        </details>
      </div>

      <div className="csteps__panels">
        {steps.map((s, i) => (
          <section
            key={s.id}
            id={`paso-${s.id}`}
            data-step={s.id}
            className="cstep"
            aria-labelledby={`h-paso-${s.id}`}
            data-active={i === active ? '' : undefined}
            data-fresh={i === active && fresh ? '' : undefined}
          >
            <h2 id={`h-paso-${s.id}`} className="cstep__h" tabIndex={-1}>
              <span className="cs__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{s.t}
            </h2>
            {s.panel}
            <nav className="cstep__nav" aria-label={ui.label}>
              {i > 0 ? <a href={`#paso-${steps[i - 1].id}`} className="cstep__prev"><span className="label">{ui.prev}</span>← {steps[i - 1].t}</a> : <span />}
              {i < n - 1 && <a href={`#paso-${steps[i + 1].id}`} className="cstep__next"><span className="label">{ui.next}</span>{steps[i + 1].t} →</a>}
            </nav>
          </section>
        ))}
      </div>
    </div>
  );
}
