'use client';

import { useEffect, useRef, useState } from 'react';
import type { Svg } from './types';

/** `bl-draw` lines are drawn with stroke-dashoffset: they need a path length of 1. */
export const prepLogo = (svg: string) => svg.replace(/class="([^"]*\bbl-draw\b[^"]*)"/g, '$& pathLength="1"');

/**
 * A logo on its stage (lote 6.1). On the cover it draws itself once when it comes on screen — lines first
 * (stroke-dashoffset), fills after — and «Volver a dibujar» plays it again. In «Construcción» the same logo sits
 * under its grid, and a button takes the grid away to compare. The HTML is the finished logo, with its grid:
 * without JavaScript or with reduced motion nothing waits and nothing moves.
 */
export function LogoStage({ art, grid, alt, labels, mode }: { art: Svg; grid?: string; alt: string; labels: { redraw: string; grid: string }; mode: 'cover' | 'grid' }) {
  const root = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(true);
  const play = () => {
    const el = root.current;
    if (!el) return;
    el.setAttribute('data-anim', 'wait');
    void el.getBoundingClientRect();
    el.setAttribute('data-anim', 'play');
  };
  useEffect(() => {
    const el = root.current;
    if (!el || mode !== 'cover') return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); el.setAttribute('data-anim', 'play'); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);
  return (
    <div ref={root} className="bl-logo" data-mode={mode} data-anim={mode === 'cover' ? 'wait' : undefined} data-grid={mode === 'grid' ? (on ? 'on' : 'off') : undefined}>
      <svg viewBox={art.box.join(' ')} role="img" aria-label={alt}>
        <g dangerouslySetInnerHTML={{ __html: prepLogo(art.svg) }} />
        {grid && <g className="bl-grid" aria-hidden="true" dangerouslySetInnerHTML={{ __html: grid }} />}
      </svg>
      {mode === 'cover'
        ? <button type="button" className="bl-btn bl-redraw" onClick={play}>{labels.redraw}</button>
        : <button type="button" className="bl-btn bl-gridbtn" aria-pressed={on} onClick={() => setOn((v) => !v)}>{labels.grid}</button>}
    </div>
  );
}
