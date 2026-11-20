'use client';

import { type CSSProperties, type PointerEvent as RPointerEvent, useCallback, useEffect, useRef } from 'react';
import type { BrandObject } from './types';

/** The pose the object rests in (degrees). */
export const REST = { rx: -16, ry: -32 };
/** Sides of the prism a can is built with. */
export const CAN_SIDES = 24;

const rad = (d: number) => (d * Math.PI) / 180;
const LIGHT = (() => { const v = [-0.5, -0.72, 0.62], l = Math.hypot(...v); return v.map((x) => x / l); })();

/** How dark a face is (0 lit … 0.62 in shadow) once the object is turned: its normal through rotateX(rx) rotateY(ry). */
export function shade(n: [number, number, number], rx: number, ry: number) {
  const cy = Math.cos(rad(ry)), sy = Math.sin(rad(ry)), cx = Math.cos(rad(rx)), sx = Math.sin(rad(rx));
  const x = cy * n[0] + sy * n[2], y0 = n[1], z0 = -sy * n[0] + cy * n[2];
  const y = cx * y0 - sx * z0, z = sx * y0 + cx * z0;
  const lit = Math.max(0, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]);
  return Math.round((1 - lit) * 0.62 * 100) / 100;
}

type Face = { key: string; n: [number, number, number]; style: CSSProperties; svg?: { box: string; inner: string; none?: boolean }; fill?: string; round?: boolean };

/** The faces of an object in the turntable's space (em units), each with its normal. Pure: also used by the test. */
export function facesOf(o: BrandObject, id: string): { faces: Face[]; defs?: string } {
  const em = (v: number) => `${Math.round(v * 100) / 100}em`;
  const rect = (w: number, h: number, t: string): CSSProperties => ({ width: em(w), height: em(h), left: em(-w / 2), top: em(-h / 2), transform: t });
  if (o.kind === 'box') {
    const [w, h, d] = o.size, f = o.faces;
    return {
      faces: [
        { key: 'front', n: [0, 0, 1], style: rect(w, h, `translateZ(${em(d / 2)})`), svg: { box: `0 0 ${w} ${h}`, inner: f.front } },
        { key: 'back', n: [0, 0, -1], style: rect(w, h, `rotateY(180deg) translateZ(${em(d / 2)})`), svg: { box: `0 0 ${w} ${h}`, inner: f.back } },
        { key: 'right', n: [1, 0, 0], style: rect(d, h, `rotateY(90deg) translateZ(${em(w / 2)})`), svg: { box: `0 0 ${d} ${h}`, inner: f.right } },
        { key: 'left', n: [-1, 0, 0], style: rect(d, h, `rotateY(-90deg) translateZ(${em(w / 2)})`), svg: { box: `0 0 ${d} ${h}`, inner: f.left } },
        { key: 'top', n: [0, -1, 0], style: rect(w, d, `rotateX(90deg) translateZ(${em(h / 2)})`), svg: { box: `0 0 ${w} ${d}`, inner: f.top } },
        { key: 'bottom', n: [0, 1, 0], style: rect(w, d, `rotateX(-90deg) translateZ(${em(h / 2)})`), svg: { box: `0 0 ${w} ${d}`, inner: f.bottom } },
      ],
    };
  }
  // a can: a prism of CAN_SIDES strips, each showing its slice of the one label; a lid is a second, plain prism
  const N = CAN_SIDES, faces: Face[] = [];
  const lidH = o.lid?.h ?? 0, y0 = lidH / 2; // the whole thing (can + lid) is centred on the turntable
  const W = Math.round(2 * Math.PI * o.r), slice = W / N;
  const ring = (r: number, h: number, cy: number, paint: (k: number) => Pick<Face, 'svg' | 'fill'>, tag: string) => {
    const side = 2 * r * Math.tan(Math.PI / N) + 0.6; // a hair wider: no seams between strips
    for (let k = 0; k < N; k++) {
      const a = -180 + (k + 0.5) * (360 / N);
      faces.push({ key: `${tag}${k}`, n: [Math.sin(rad(a)), 0, Math.cos(rad(a))], style: { ...rect(side, h, `translateY(${em(cy)}) rotateY(${Math.round(a * 100) / 100}deg) translateZ(${em(r)})`) }, ...paint(k) });
    }
  };
  const cap = (r: number, y: number, up: boolean, inner: string | undefined, fill: string | undefined, key: string) =>
    faces.push({ key, n: [0, up ? -1 : 1, 0], round: true, style: rect(2 * r, 2 * r, `translateY(${em(y)}) rotateX(${up ? 90 : -90}deg)`), svg: inner ? { box: `0 0 ${2 * r} ${2 * r}`, inner } : undefined, fill });
  ring(o.r, o.h, y0, (k) => ({ svg: { box: `${Math.round(k * slice * 100) / 100} 0 ${Math.round(slice * 100) / 100} ${o.h}`, inner: `<use href="#${id}-label"/>`, none: true } }), 's');
  cap(o.r, y0 + o.h / 2, false, undefined, '#101010', 'bottom');
  if (o.lid) {
    cap(o.r, y0 - o.h / 2, true, undefined, o.lid.side, 'shoulder');
    ring(o.lid.r, o.lid.h, y0 - o.h / 2 - o.lid.h / 2, () => ({ fill: o.lid!.side }), 'l');
    cap(o.lid.r, y0 - o.h / 2 - o.lid.h, true, o.lid.top, undefined, 'top');
  } else cap(o.r, y0 - o.h / 2, true, o.top, undefined, 'top');
  return { faces, defs: `<g id="${id}-label">${o.label}</g>` };
}

/**
 * A brand's object in three dimensions, with CSS 3D only (lote 6.1): a box or a can whose faces are the brand's own
 * drawings. It rests turned; dragging turns it (with a little inertia), the slider turns it with the keyboard, and
 * every face darkens or lights as it faces the lamp. Frames are asked only while it moves. The HTML is the resting pose.
 */
export function Turntable({ object, id, alt, labels }: { object: BrandObject; id: string; alt: string; labels: { turn: string; reset: string; hint: string } }) {
  const root = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLInputElement>(null);
  const pose = useRef({ ...REST, vx: 0, raf: 0, drag: false, px: 0, py: 0 });
  const { faces, defs } = facesOf(object, id);

  const paint = useCallback(() => {
    const el = root.current, p = pose.current;
    if (!el) return;
    const obj = el.querySelector<HTMLElement>('.tt-obj')!;
    obj.style.transform = `rotateX(${p.rx.toFixed(2)}deg) rotateY(${p.ry.toFixed(2)}deg)`;
    obj.querySelectorAll<HTMLElement>('.tt-face').forEach((f, i) => f.style.setProperty('--sh', String(shade(faces[i].n, p.rx, p.ry))));
    if (slider.current) slider.current.value = String(Math.round(((((p.ry + 180) % 360) + 360) % 360) - 180));
  }, [faces]);

  const coast = useCallback(() => {
    const p = pose.current;
    cancelAnimationFrame(p.raf);
    const step = () => {
      p.ry += p.vx; p.vx *= 0.93; paint();
      if (Math.abs(p.vx) > 0.05 && !p.drag) p.raf = requestAnimationFrame(step);
    };
    if (Math.abs(p.vx) > 0.05) p.raf = requestAnimationFrame(step);
  }, [paint]);
  useEffect(() => () => cancelAnimationFrame(pose.current.raf), []);

  const down = (e: RPointerEvent<HTMLDivElement>) => {
    const p = pose.current;
    p.drag = true; p.px = e.clientX; p.py = e.clientY; p.vx = 0;
    cancelAnimationFrame(p.raf);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointers have no capture */ }
    root.current?.setAttribute('data-drag', '');
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const p = pose.current;
    if (!p.drag) return;
    const dx = e.clientX - p.px, dy = e.clientY - p.py;
    p.px = e.clientX; p.py = e.clientY;
    p.vx = dx * 0.55; p.ry += p.vx; p.rx = Math.max(-58, Math.min(24, p.rx - dy * 0.3));
    paint();
  };
  const up = () => {
    const p = pose.current;
    if (!p.drag) return;
    p.drag = false; root.current?.removeAttribute('data-drag');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) p.vx = 0; else coast();
  };
  const reset = () => { const p = pose.current; cancelAnimationFrame(p.raf); p.rx = REST.rx; p.ry = REST.ry; p.vx = 0; paint(); };

  return (
    <div ref={root} className="tt">
      {defs && <svg className="tt-defs" aria-hidden="true" width="0" height="0"><defs dangerouslySetInnerHTML={{ __html: defs }} /></svg>}
      <div className="tt-space" role="img" aria-label={alt} data-cursor={labels.turn} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div className="tt-floor" aria-hidden="true" />
        <div className="tt-obj" aria-hidden="true" style={{ transform: `rotateX(${REST.rx}deg) rotateY(${REST.ry}deg)` }}>
          {faces.map((f) => (
            <div key={f.key} className="tt-face" data-round={f.round || undefined} style={{ ...f.style, background: f.fill, '--sh': shade(f.n, REST.rx, REST.ry) } as CSSProperties}>
              {f.svg && <svg viewBox={f.svg.box} preserveAspectRatio={f.svg.none ? 'none' : undefined} dangerouslySetInnerHTML={{ __html: f.svg.inner }} />}
            </div>
          ))}
        </div>
      </div>
      <div className="tt-controls">
        <label className="tt-turn">
          <span>{labels.turn}</span>
          <input ref={slider} type="range" min={-180} max={180} step={5} defaultValue={REST.ry} onInput={(e) => { const p = pose.current; cancelAnimationFrame(p.raf); p.vx = 0; p.ry = Number(e.currentTarget.value); paint(); }} />
        </label>
        <button type="button" className="tt-reset" onClick={reset}>{labels.reset}</button>
      </div>
      <p className="tt-hint">{labels.hint}</p>
    </div>
  );
}
