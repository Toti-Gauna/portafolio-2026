'use client';

import { type CSSProperties, type MouseEvent, useState } from 'react';

export type CraftLayer = { id: string; label: string; from: string; svg: string; anchor: { x: number; y: number } };

/**
 * The stack of five layers, alive: click a layer (or its name) and the ones above lift so it shows whole.
 * Each layer is its own <svg>, moved only with transform and opacity; the maths lives in signature.css
 * (--a = open layer, --i = this layer). Names are real buttons: Tab reaches them, Escape closes.
 */
export function CraftStack({ layers, glow, viewBox, title, hint }: { layers: CraftLayer[]; glow: string; viewBox: string; title: string; hint?: string }) {
  const [active, setActive] = useState<number | null>(null);
  const toggle = (i: number) => setActive((a) => (a === i ? null : i));
  const onStage = (e: MouseEvent) => {
    const hit = (e.target as Element).closest?.('[data-layer]');
    if (hit && (e.target as Element).classList.contains('hit')) toggle(Number(hit.getAttribute('data-layer')));
  };
  return (
    <figure
      className="sig-stack"
      data-active={active ?? undefined}
      style={{ '--a': active ?? 0 } as CSSProperties}
      onKeyDown={(e) => { if (e.key === 'Escape' && active !== null) setActive(null); }}
    >
      <div className="sig-stack-fig">
        <div className="sig-stack-stage" onClick={onStage}>
          <svg className="sig-stack-glow" viewBox={viewBox} aria-hidden="true" dangerouslySetInnerHTML={{ __html: glow }} />
          {/* painted bottom first, so the top layer covers the rest */}
          {layers.map((_, k) => {
            const i = layers.length - 1 - k, l = layers[i];
            return <svg key={l.id} className="sig-stack-layer" data-layer={i} data-on={active === i} viewBox={viewBox} aria-hidden="true" style={{ '--i': i } as CSSProperties} dangerouslySetInnerHTML={{ __html: l.svg }} />;
          })}
        </div>
        {/* the names: beside the art, on its leader lines, when there is room; a row of buttons below when not */}
        <div className="sig-stack-over">
          <ol className="sig-stack-legend">
            {layers.map((l, i) => (
              <li key={l.id} style={{ '--i': i, '--from': l.from, '--ay': `${l.anchor.y}%`, '--ax': `${l.anchor.x}%` } as CSSProperties}>
                <button type="button" aria-pressed={active === i} onClick={() => toggle(i)}>
                  <i aria-hidden="true">{String(i + 1).padStart(2, '0')}</i>
                  <span>{l.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <figcaption>
        <span className="ui-sr">{title}</span>
        {hint && <span className="sig-stack-hint">{hint}</span>}
      </figcaption>
    </figure>
  );
}
