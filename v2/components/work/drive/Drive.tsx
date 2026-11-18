'use client';

import { type CSSProperties, forwardRef, type KeyboardEvent, type PointerEvent, type RefObject, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { sfx } from '@/v2/sound/control';
import type { Body } from '../crates';
import type { DriveHandle, DriveState, DriveWalker } from './engine';

export type DriveStopInfo = { id: string; node: [number, number]; home: [number, number]; tall: number; planned: boolean; name: string; when: string; state: string; color: string };
export type DriveLabels = { hint: string; move: string; horn: string; camera: string; space: string; gas: string; brake: string; left: string; right: string; more: string; here: string; going: string };
export type DriveApi = { goTo(i: number): void; horn(): void; cam(): 'in' | 'out' };

const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const KEYS: Record<string, 'up' | 'down' | 'left' | 'right'> = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
const Arrow = ({ turn }: { turn: number }) => (
  <svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20" style={{ rotate: `${turn}deg` }}><path d="M10 4v12M4.5 9.5 10 4l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/**
 * The world of Work from the ground (lote 4.3): a canvas, and over it — as real HTML — the name of every place
 * in view, the card of the place you are at (with «Más información», the same card as on the map), the pedals
 * and the wheel for a touch screen, and the keys for a keyboard. The scene itself (three.js, the land in 3D, the
 * car) is `engine.ts`, loaded here and only here: nobody downloads it without asking for this view.
 * Keys work while the canvas has the focus: arrows or W A S D drive, Space sounds the horn, C changes the camera,
 * Enter opens the card of the place, Page Up / Page Down go to the stop before and after.
 */
export const Drive = forwardRef<DriveApi, {
  stops: DriveStopInfo[]; walkers: DriveWalker[]; crates: { c: string }[]; bodies: RefObject<Body[]>; width: number; height: number;
  start: number; night: boolean; life: boolean; labels: DriveLabels; dot: RefObject<HTMLSpanElement | null>;
  onAt(i: number): void; onReady(): void; onFail(): void; onOpen(id: string): void; onStep(by: number): void; onCam(cam: 'in' | 'out'): void;
}>(function Drive({ stops, walkers, crates, bodies, width, height, start, night, life, labels, dot, onAt, onReady, onFail, onOpen, onStep, onCam }, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<DriveHandle | null>(null);
  const names = useRef<(HTMLLIElement | null)[]>([]);
  const keys = useRef({ up: false, down: false, left: false, right: false });
  const press = useRef<{ id: number; x: number; crate: boolean } | null>(null);
  const [near, setNear] = useState<number | null>(null);
  /* on autopilot: the stop the car is going to (its name is shown, with how much of the way is done) */
  const [going, setGoing] = useState<number | null>(null);
  const goingNow = useRef<number | null>(null);
  const bar = useRef<HTMLElement>(null);
  const now = useRef({ night, life });
  now.current = { night, life };
  const cb = useRef({ onAt, onReady, onFail });
  cb.current = { onAt, onReady, onFail };

  useImperativeHandle(ref, () => ({
    goTo: (i) => engine.current?.goTo(i),
    horn: () => engine.current?.horn(),
    cam: () => engine.current?.cam() ?? 'in',
  }), []);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let dead = false, seen = true;
    const live = () => engine.current?.setActive(seen && !document.hidden);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; live(); }, { threshold: 0.05 });
    const ro = new ResizeObserver(() => engine.current?.resize());
    (async () => {
      try {
        const { createDrive } = await import('./engine');
        if (dead) return;
        engine.current = createDrive({
          canvas: el, stops, walkers, crates, bodies: bodies.current ?? [], width, height, start,
          night: now.current.night, life: now.current.life, still: still(), coarse: window.matchMedia('(pointer: coarse)').matches,
          onAt: (i) => cb.current.onAt(i),
          onNear: (i) => setNear(i),
          onFrame: (f) => {
            const d = dot.current;
            if (d) { d.style.left = `${(f.u * 100).toFixed(2)}%`; d.style.top = `${(Math.max(0, Math.min(1, f.v)) * 100).toFixed(1)}%`; }
            if (f.to !== goingNow.current) { goingNow.current = f.to; setGoing(f.to); }
            if (bar.current) bar.current.style.transform = `scaleX(${f.trip.toFixed(3)})`;
          },
          place: (i, x, y, show) => { const li = names.current[i]; if (!li) return; li.toggleAttribute('data-show', show); if (show) li.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; },
          sound: sfx,
        });
        (window as unknown as { __igDrive?: () => DriveState }).__igDrive = () => engine.current!.state();
        io.observe(el); ro.observe(el);
        document.addEventListener('visibilitychange', live);
        cb.current.onReady();
      } catch {
        if (!dead) cb.current.onFail();
      }
    })();
    return () => {
      dead = true;
      io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', live);
      engine.current?.dispose();
      engine.current = null;
      delete (window as unknown as { __igDrive?: unknown }).__igDrive;
    };
    // the scene is built once, for the stop the map was on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { engine.current?.setNight(night); }, [night]);
  useEffect(() => { engine.current?.setLife(life); }, [life]);

  const feed = () => { const k = keys.current; engine.current?.input({ gas: (k.up ? 1 : 0) - (k.down ? 1 : 0), turn: (k.right ? 1 : 0) - (k.left ? 1 : 0) }); };
  const onKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const k = KEYS[e.key];
    if (k) { e.preventDefault(); if (!keys.current[k]) { keys.current[k] = true; feed(); } return; }
    if (e.repeat) { if (e.key === ' ') e.preventDefault(); return; }
    if (e.key === ' ') { e.preventDefault(); engine.current?.horn(); }
    else if (e.key === 'c' || e.key === 'C') { const c = engine.current?.cam(); if (c) onCam(c); }
    else if (e.key === 'Enter' && near !== null) { e.preventDefault(); onOpen(stops[near].id); }
    else if (e.key === 'PageDown') { e.preventDefault(); onStep(1); }
    else if (e.key === 'PageUp') { e.preventDefault(); onStep(-1); }
  };
  const onKeyUp = (e: KeyboardEvent<HTMLCanvasElement>) => { const k = KEYS[e.key]; if (k) { keys.current[k] = false; feed(); } };
  const letGo = () => { keys.current = { up: false, down: false, left: false, right: false }; feed(); };
  /* on the canvas: a press on a crate picks it up (and letting go throws it); anywhere else, it turns the head */
  const onDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const en = engine.current;
    if (!en || press.current || e.button !== 0) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* it still presses */ }
    press.current = { id: e.pointerId, x: e.clientX, crate: en.grab(e.clientX, e.clientY) };
  };
  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const p = press.current, en = engine.current;
    if (!p || !en || p.id !== e.pointerId) return;
    if (p.crate) en.move(e.clientX, e.clientY);
    else { en.look((e.clientX - p.x) * 0.006); p.x = e.clientX; }
  };
  const onUp = (e: PointerEvent<HTMLCanvasElement>) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId) return;
    press.current = null;
    if (p.crate) engine.current?.release(); else engine.current?.lookEnd();
  };
  /* the pedals and the wheel of a touch screen: held down, like the keys */
  const pad = (k: 'up' | 'down' | 'left' | 'right') => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => { try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* a pointer that cannot be held still presses */ } keys.current[k] = true; feed(); },
    onPointerUp: () => { keys.current[k] = false; feed(); },
    onPointerCancel: () => { keys.current[k] = false; feed(); },
    onLostPointerCapture: () => { keys.current[k] = false; feed(); },
    onContextMenu: (e: { preventDefault(): void }) => e.preventDefault(),
  });
  const here = near !== null ? stops[near] : null;

  return (
    <div className="dv">
      <canvas ref={canvas} className="dv-canvas" tabIndex={0} role="application" aria-label={labels.hint} data-cursor="" onKeyDown={onKeyDown} onKeyUp={onKeyUp} onBlur={letGo} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
      {/* the names follow their places: decoration (the card of the map says where you are, aloud) */}
      <ol className="dv-names" aria-hidden="true">
        {stops.map((s, i) => <li key={s.id} ref={(el) => { names.current[i] = el; }} style={{ '--c': s.color } as CSSProperties}><i />{s.name}</li>)}
      </ol>
      {here && going === null && (
        <div className="dv-card" style={{ '--c': here.color } as CSSProperties}>
          <p><span>{labels.here}</span><b>{here.name}</b><small>{here.when} · {here.state}</small></p>
          <button type="button" className="dv-more" data-cursor="" onClick={() => onOpen(here.id)}>{labels.more}<span className="ui-sr"> · {here.name}</span></button>
        </div>
      )}
      {going !== null && (
        <p className="dv-trip" style={{ '--c': stops[going].color } as CSSProperties}>
          <span>{labels.going}</span><b>{stops[going].name}</b><i ref={bar} aria-hidden="true" />
        </p>
      )}
      <p className="dv-keys">
        <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>{labels.move}</span>
        <span><kbd>{labels.space}</kbd>{labels.horn}</span>
        <span><kbd>C</kbd>{labels.camera}</span>
      </p>
      <div className="dv-pad dv-pad--wheel">
        <button type="button" aria-label={labels.left} {...pad('left')}><Arrow turn={-90} /></button>
        <button type="button" aria-label={labels.right} {...pad('right')}><Arrow turn={90} /></button>
      </div>
      <div className="dv-pad dv-pad--pedals">
        <button type="button" aria-label={labels.brake} {...pad('down')}><Arrow turn={180} /></button>
        <button type="button" className="dv-gas" aria-label={labels.gas} {...pad('up')}><Arrow turn={0} /></button>
      </div>
    </div>
  );
});
