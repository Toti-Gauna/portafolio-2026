'use client';

import { type CSSProperties, type KeyboardEvent, type ReactNode, useRef, useState } from 'react';

/**
 * Tabs for the sections of «Negocio» (lote 6.2): one panel per project. The server sends every panel; with
 * JavaScript only the chosen one shows (the others carry data-off), without it they are all there, one under the
 * other, each with its own heading. Arrows, Home and End move between tabs (roving focus).
 */
export function Tabs({ id, label, tabs, children }: { id: string; label: string; tabs: { key: string; name: string; color?: string }[]; children: ReactNode[] }) {
  const [on, setOn] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const go = (i: number) => {
    const n = (i + tabs.length) % tabs.length;
    setOn(n);
    list.current?.querySelectorAll<HTMLButtonElement>('[role=tab]')[n]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); go(on + 1); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); go(on - 1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(tabs.length - 1); }
  };
  return (
    <div className="bz-tabs">
      <div ref={list} className="bz-tablist" role="tablist" aria-label={label} onKeyDown={onKey}>
        {tabs.map((t, i) => (
          <button
            key={t.key} type="button" role="tab" id={`${id}-t-${t.key}`} aria-controls={`${id}-p-${t.key}`} aria-selected={i === on} tabIndex={i === on ? 0 : -1}
            className="bz-tab" style={{ '--c': t.color } as CSSProperties} onClick={() => setOn(i)}
          >
            <i aria-hidden="true" />{t.name}
          </button>
        ))}
      </div>
      {children.map((panel, i) => (
        <div key={tabs[i].key} role="tabpanel" id={`${id}-p-${tabs[i].key}`} aria-labelledby={`${id}-t-${tabs[i].key}`} className="bz-panel" data-off={i === on ? undefined : ''} style={{ '--c': tabs[i].color } as CSSProperties}>
          {panel}
        </div>
      ))}
    </div>
  );
}
