'use client';

import { type CSSProperties, type KeyboardEvent as RKeyboardEvent, type MouseEvent as RMouseEvent, type PointerEvent as RPointerEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { type GroupId, named, project, shortest, visible } from './sky';

export type SkyStar = { id: string; group: GroupId; lon: number; lat: number; size: number; hollow: boolean; color: string; name: string; side: 'l' | 'r'; kin: string[]; proofs: number };
export type SkyGroup = { id: GroupId; name: string; color: string; yaw: number; edges: [number, number][] };
export type SkyLabels = { stage: string; hint: string; groupsLabel: string; prev: string; next: string; legend: string; proofCount: { one: string; other: string } };

/** The tilt of the sky: seen a little from above, so the constellations read as figures. */
export const SKY_PITCH = 0.12;
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The sky of skills (lote 7.1): a sphere of stars seen from outside, in real 3D without WebGL. Every star is a
 * point of the sphere projected on each frame (sky.ts → project) and written as two numbers (--x, --y, in radii) that
 * the stylesheet turns into a transform; the lines of each constellation and the nameless dust follow the same maths.
 *
 * The visitor turns it by dragging (with inertia), by choosing a constellation or a star, or with the keyboard: every
 * star is a real button (Tab reaches all of them, the arrows go to the next and the previous one) and choosing one
 * turns the sky until it faces front, lights the stars used in the same proofs and opens its card. Frames are asked
 * only while the sky moves: at rest, none. With reduced motion a turn arrives at once. The server sends the sky
 * already projected, so without JavaScript it is a still picture with every card listed below it.
 */
export function Constellation({ stars, groups, dust, cards, labels: L }: { stars: SkyStar[]; groups: SkyGroup[]; dust: [number, number, number][]; cards: ReactNode[]; labels: SkyLabels }) {
  const [sel, setSel] = useState(0);
  const [group, setGroup] = useState<GroupId>(stars[0].group);
  const root = useRef<HTMLDivElement>(null);
  const sky = useRef({ yaw: 0, target: 0, vel: 0, mode: 'rest' as 'rest' | 'ease' | 'drag' | 'coast', raf: 0, last: 0 });
  const drag = useRef({ on: false, moved: false, x: 0, yaw: 0, R: 300, t: 0, lastX: 0, id: -1 });
  const frames = useRef(0);

  /** write the sky at its current yaw: stars, lines and dust */
  const paint = useCallback(() => {
    const el = root.current;
    if (!el) return;
    const yaw = sky.current.yaw;
    const pts = stars.map((s) => project(s.lon, s.lat, yaw, SKY_PITCH));
    el.querySelectorAll<HTMLElement>('.sk-star').forEach((b, i) => {
      const p = pts[i], o = visible(p.z);
      b.style.setProperty('--x', p.x.toFixed(4));
      b.style.setProperty('--y', p.y.toFixed(4));
      b.style.setProperty('--o', o.toFixed(3));
      b.style.setProperty('--n', named(p.z).toFixed(3));
      b.style.setProperty('--k', (0.8 + 0.3 * Math.max(0, p.z)).toFixed(3));
      b.toggleAttribute('data-back', o < 0.06);
    });
    let n = 0;
    const lines = el.querySelectorAll<SVGLineElement>('.sk-lines line');
    for (const g of groups) for (const [a, b] of g.edges) {
      const ln = lines[n++], p = pts[a], q = pts[b];
      ln.setAttribute('x1', p.x.toFixed(4)); ln.setAttribute('y1', p.y.toFixed(4));
      ln.setAttribute('x2', q.x.toFixed(4)); ln.setAttribute('y2', q.y.toFixed(4));
      ln.style.opacity = (Math.min(visible(p.z), visible(q.z)) * 0.55).toFixed(3);
    }
    el.querySelectorAll<SVGCircleElement>('.sk-dust circle').forEach((c, i) => {
      const p = project(dust[i][0], dust[i][1], yaw, SKY_PITCH);
      c.setAttribute('cx', p.x.toFixed(4)); c.setAttribute('cy', p.y.toFixed(4));
      c.style.opacity = (visible(p.z) * 0.5).toFixed(3);
    });
  }, [stars, groups, dust]);

  const nearest = useCallback((yaw: number) => groups.reduce((best, g) => (Math.abs(shortest(yaw, g.yaw)) < Math.abs(shortest(yaw, best.yaw)) ? g : best), groups[0]).id, [groups]);

  /** the loop: it runs while the sky is being dragged, coasting or easing to a target, and stops at rest */
  const tick = useCallback((t: number) => {
    const s = sky.current;
    const dt = Math.min(0.05, Math.max(0, (t - s.last) / 1000));
    s.last = t;
    frames.current++;
    if (s.mode === 'ease') {
      const d = shortest(s.yaw, s.target);
      if (Math.abs(d) < 0.002) { s.yaw = s.target; s.mode = 'rest'; } else s.yaw += d * (1 - Math.exp(-dt * 7));
    } else if (s.mode === 'coast') {
      s.yaw += s.vel * dt;
      s.vel *= Math.exp(-dt * 3.2);
      if (Math.abs(s.vel) < 0.03) { s.mode = 'rest'; setGroup(nearest(s.yaw)); }
    }
    paint();
    s.raf = s.mode === 'rest' ? 0 : requestAnimationFrame(tick);
  }, [paint, nearest]);
  const run = useCallback(() => {
    const s = sky.current;
    if (s.raf) return;
    s.last = performance.now();
    s.raf = requestAnimationFrame(tick);
  }, [tick]);
  useEffect(() => () => cancelAnimationFrame(sky.current.raf), []);

  const turnTo = useCallback((yaw: number) => {
    const s = sky.current;
    s.target = yaw;
    if (reduced()) { s.yaw = yaw; s.mode = 'rest'; paint(); return; }
    s.mode = 'ease';
    run();
  }, [paint, run]);

  const pick = useCallback((i: number, focus = false) => {
    const k = (i + stars.length) % stars.length;
    setSel(k);
    setGroup(stars[k].group);
    turnTo(stars[k].lon);
    if (focus) root.current?.querySelectorAll<HTMLButtonElement>('.sk-star')[k]?.focus({ preventScroll: true });
  }, [stars, turnTo]);
  const pickGroup = (g: SkyGroup) => {
    const first = stars.findIndex((s) => s.group === g.id);
    setGroup(g.id);
    setSel(first);
    turnTo(g.yaw);
  };

  // ── dragging: a horizontal drag turns the sky; a tap stays a tap ──
  const onDown = (e: RPointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('.sk-bar')) return;
    const probe = root.current?.querySelector<HTMLElement>('.sk-probe');
    drag.current = { on: true, moved: false, x: e.clientX, yaw: sky.current.yaw, R: probe?.offsetWidth || 300, t: performance.now(), lastX: e.clientX, id: e.pointerId };
  };
  const onMove = (e: RPointerEvent) => {
    const d = drag.current, s = sky.current;
    if (!d.on || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < 6) return;
      d.moved = true;
      try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* synthetic pointers */ }
      root.current?.setAttribute('data-drag', '');
    }
    const now = performance.now(), dt = Math.max(1, now - d.t) / 1000;
    s.vel = 0.7 * s.vel + 0.3 * (-(e.clientX - d.lastX) / d.R / dt);
    d.t = now; d.lastX = e.clientX;
    s.yaw = d.yaw - dx / d.R;
    s.mode = 'drag';
    run();
  };
  const onUp = (e: RPointerEvent) => {
    const d = drag.current, s = sky.current;
    if (!d.on || e.pointerId !== d.id) return;
    d.on = false;
    if (!d.moved) return;
    root.current?.removeAttribute('data-drag');
    if (reduced() || Math.abs(s.vel) < 0.2) { s.mode = 'rest'; s.vel = 0; setGroup(nearest(s.yaw)); } else { s.vel = Math.max(-4, Math.min(4, s.vel)); s.mode = 'coast'; run(); }
  };
  /** the click that ends a drag is not a choice */
  const onClickCapture = (e: RMouseEvent) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; } };

  const onKey = (e: RKeyboardEvent, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); pick(i + 1, true); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); pick(i - 1, true); }
    else if (e.key === 'Home') { e.preventDefault(); pick(0, true); }
    else if (e.key === 'End') { e.preventDefault(); pick(stars.length - 1, true); }
  };
  /** «Se usó junto con»: the names in a card lead to their stars */
  const onCards = (e: RMouseEvent) => {
    const id = (e.target as HTMLElement).closest<HTMLElement>('[data-star-go]')?.dataset.starGo;
    const i = stars.findIndex((s) => s.id === id);
    if (i >= 0) pick(i);
  };

  // for the tests: how many frames the sky has drawn, and where it is
  useEffect(() => {
    (window as unknown as { __igSky?: () => { frames: number; yaw: number; mode: string } }).__igSky = () => ({ frames: frames.current, yaw: sky.current.yaw, mode: sky.current.mode });
  }, []);

  const kin = new Set(stars[sel].kin);
  const initial = stars.map((s) => project(s.lon, s.lat, 0, SKY_PITCH));
  return (
    <div ref={root} className="sk" data-sel={stars[sel].id}>
      <div className="sk-bar">
        <div className="sk-groups" role="group" aria-label={L.groupsLabel}>
          {groups.map((g) => (
            <button key={g.id} type="button" className="sk-chip" aria-pressed={group === g.id} style={{ '--c': g.color } as CSSProperties} onClick={() => pickGroup(g)}><i aria-hidden="true" />{g.name}</button>
          ))}
        </div>
        <span className="sk-nav">
          <button type="button" className="sk-step" aria-label={L.prev} onClick={() => pick(sel - 1)}>←</button>
          <button type="button" className="sk-step" aria-label={L.next} onClick={() => pick(sel + 1)}>→</button>
        </span>
      </div>
      <div className="sk-stage" role="group" aria-label={L.stage} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onClickCapture={onClickCapture}>
        <i className="sk-probe" aria-hidden="true" />
        <div className="sk-origin">
          <svg className="sk-lines" viewBox="-1.3 -1.3 2.6 2.6" aria-hidden="true">
            <g className="sk-dust">
              {dust.map((d, i) => { const p = project(d[0], d[1], 0, SKY_PITCH); return <circle key={i} cx={p.x.toFixed(4)} cy={p.y.toFixed(4)} r={(0.0035 * d[2]).toFixed(4)} style={{ opacity: (visible(p.z) * 0.5).toFixed(3) }} />; })}
            </g>
            {groups.map((g) => g.edges.map(([a, b]) => {
              const p = initial[a], q = initial[b];
              return <line key={`${g.id}${a}-${b}`} x1={p.x.toFixed(4)} y1={p.y.toFixed(4)} x2={q.x.toFixed(4)} y2={q.y.toFixed(4)} stroke={g.color} style={{ opacity: (Math.min(visible(p.z), visible(q.z)) * 0.55).toFixed(3) }} />;
            }))}
          </svg>
          {stars.map((s, i) => {
            const p = initial[i], o = visible(p.z);
            return (
              <button
                key={s.id} type="button" className="sk-star" data-side={s.side} data-hollow={s.hollow ? '' : undefined} data-on={i === sel ? '' : undefined} data-kin={kin.has(s.id) ? '' : undefined}
                data-back={o < 0.06 ? '' : undefined} aria-pressed={i === sel} aria-controls="sk-cards"
                aria-label={`${s.name} · ${groups.find((g) => g.id === s.group)!.name}${s.proofs ? ` · ${s.proofs} ${s.proofs === 1 ? L.proofCount.one : L.proofCount.other}` : ''}`}
                style={{ '--x': p.x.toFixed(4), '--y': p.y.toFixed(4), '--o': o.toFixed(3), '--n': named(p.z).toFixed(3), '--k': (0.8 + 0.3 * Math.max(0, p.z)).toFixed(3), '--s': `${s.size}px`, '--c': s.color } as CSSProperties}
                onClick={() => pick(i)} onFocus={(e) => { if (e.currentTarget.matches(':focus-visible') && i !== sel) pick(i); }} onKeyDown={(e) => onKey(e, i)}
              >
                <span className="sk-dot" aria-hidden="true"><i /></span>
                <span className="sk-name" aria-hidden="true">{s.name}</span>
              </button>
            );
          })}
        </div>
        <p className="sk-hint">{L.hint}</p>
      </div>
      <p className="sk-legend">{L.legend}</p>
      <div id="sk-cards" className="sk-cards" onClick={onCards}>
        {cards.map((card, i) => <div key={stars[i].id} className="sk-cardwrap" data-off={i === sel ? undefined : ''}>{card}</div>)}
      </div>
    </div>
  );
}
