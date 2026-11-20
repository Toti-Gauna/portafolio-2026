'use client';

import { type CSSProperties, type KeyboardEvent, type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { WALK_STEP_MS } from './plays';
import type { Lane, Touch } from './types';

export type MapLabels = {
  map: string; walk: string; pause: string; replay: string; step: string; of: string; prev: string; next: string; keys: string;
  lanes: Record<Lane, string>;
};

type Item = Touch & { name: string; thumb: ReactNode; detail: ReactNode };

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The map of a playbook (lote 6.3). Columns are the stages of the customer's way; the upper lane is the screen, the
 * lower one the street. Every touchpoint is a button with its piece in miniature; a path joins them in the order the
 * customer meets them. Pointing, focusing or tapping one opens its piece and its card below; the arrows move along
 * the path. «Recorrer el camino» walks it once (a timer, one step every WALK_STEP_MS), stops at the last point and
 * pauses off screen. Nothing asks for animation frames: the path is drawn with stroke-dashoffset transitions.
 * Below 760 px of container the map is a list in the order of the path (the path is hidden; numbers carry the order).
 */
export function PlayMap({ items, stages, labels: L }: { items: Item[]; stages: string[]; labels: MapLabels }) {
  const [on, setOn] = useState(0);
  const [walk, setWalk] = useState<'idle' | 'play' | 'pause' | 'done'>('idle');
  const [segs, setSegs] = useState<{ d: string }[]>([]);
  const [box, setBox] = useState<[number, number]>([0, 0]);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const n = items.length;

  /** the row of each point: two sub-rows per lane, so two points of one stage and lane sit one above the other */
  const rows = useMemo(() => {
    const seen = new Map<string, number>();
    return items.map((t) => {
      const k = `${t.stage}:${t.lane}`, i = seen.get(k) ?? 0;
      seen.set(k, i + 1);
      return (t.lane === 'digital' ? 1 : 4) + i;
    });
  }, [items]);

  /** the path: measured once per size from the thumbnails' centres (no reads while anything moves) */
  const measure = useCallback(() => {
    const r = root.current, ol = list.current;
    if (!r || !ol) return;
    const R = r.getBoundingClientRect();
    if (getComputedStyle(r).getPropertyValue('--mk-wide').trim() !== '1') { setSegs([]); return; }
    const pts = [...ol.querySelectorAll<HTMLElement>('.mk-thumb')].map((el) => {
      const b = el.getBoundingClientRect();
      return [b.left + b.width / 2 - R.left, b.top + b.height / 2 - R.top] as const;
    });
    const out: { d: string }[] = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], dx = x2 - x1;
      out.push({ d: Math.abs(dx) < 24
        ? `M${x1} ${y1}C${x1 + 70} ${y1 + (y2 - y1) * 0.3} ${x2 + 70} ${y2 - (y2 - y1) * 0.3} ${x2} ${y2}`
        : `M${x1} ${y1}C${x1 + dx / 2} ${y1} ${x2 - dx / 2} ${y2} ${x2} ${y2}` });
    }
    setBox([R.width, R.height]);
    setSegs(out);
  }, []);
  useIso(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (root.current) ro.observe(root.current);
    return () => ro.disconnect();
  }, [measure]);

  /** the walk: one step per WALK_STEP_MS while on screen; it ends on the last point */
  useEffect(() => {
    if (walk !== 'play') return;
    if (on >= n - 1) { setWalk('done'); return; }
    const t = window.setTimeout(() => setOn((i) => i + 1), WALK_STEP_MS);
    return () => window.clearTimeout(t);
  }, [walk, on, n]);
  useEffect(() => {
    const el = root.current;
    if (!el || walk !== 'play') return;
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) setWalk('pause'); });
    io.observe(el);
    return () => io.disconnect();
  }, [walk]);

  const pick = (i: number, focus = false) => {
    const k = Math.max(0, Math.min(n - 1, i));
    if (walk === 'play') setWalk('pause');
    setOn(k);
    if (focus) list.current?.querySelectorAll<HTMLButtonElement>('.mk-pt')[k]?.focus();
  };
  /** a tap on a point of the list (narrow screens): the card is below the list, so bring it into view */
  const tap = (i: number) => {
    pick(i);
    if (segs.length === 0) requestAnimationFrame(() => document.getElementById('mk-details')?.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' }));
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); pick(i + 1, true); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); pick(i - 1, true); }
    else if (k === 'Home') { e.preventDefault(); pick(0, true); }
    else if (k === 'End') { e.preventDefault(); pick(n - 1, true); }
  };
  const toggleWalk = () => {
    if (walk === 'play') { setWalk('pause'); return; }
    if (walk === 'idle' || walk === 'done') setOn(0);
    setWalk('play');
  };
  const walking = walk === 'play' || walk === 'pause';
  const nn = (i: number) => String(i + 1).padStart(2, '0');

  return (
    <div className="mk-mapwrap">
      <div ref={root} className="mk-map" style={{ '--cols': stages.length, '--rd2': rows.includes(2) ? 'var(--mk-row)' : '0px', '--rp2': rows.includes(5) ? 'var(--mk-row)' : '0px' } as CSSProperties} data-walk={walking ? '' : undefined}>
        <div className="mk-heads" aria-hidden="true">
          {stages.map((s, i) => <span key={i} style={{ '--c': i + 1 } as CSSProperties}><b>{nn(i)}</b>{s}</span>)}
          <span className="mk-lane" data-l="digital"><em>{L.lanes.digital}</em></span>
          <span className="mk-lane" data-l="physical"><em>{L.lanes.physical}</em></span>
        </div>
        {segs.length > 0 && (
          <svg className="mk-path" viewBox={`0 0 ${box[0]} ${box[1]}`} width={box[0]} height={box[1]} aria-hidden="true">
            {segs.map((s, i) => <path key={`b${i}`} className="mk-seg-bg" d={s.d} />)}
            {segs.map((s, i) => (
              <path key={i} className="mk-seg" d={s.d} pathLength={1}
                data-on={(walking || walk === 'done') ? (i < on ? '' : undefined) : (i === on || i === on - 1 ? '' : undefined)} />
            ))}
          </svg>
        )}
        <ol ref={list} className="mk-ol" aria-label={L.map}>
          {items.map((t, i) => (
            <li key={t.id} style={{ '--c': t.stage + 1, '--r': rows[i] + 1 } as CSSProperties} data-lane={t.lane}>
              <button type="button" className="mk-pt" aria-pressed={on === i} aria-controls="mk-details" onClick={() => tap(i)} onKeyDown={(e) => onKey(e, i)}>
                <span className="mk-thumb" data-on="a">{t.thumb}</span>
                <span className="mk-pt-t"><b>{nn(i)}</b><span>{t.name}</span></span>
                <span className="mk-pt-m">{stages[t.stage]} · {L.lanes[t.lane]}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="mk-bar">
        <button type="button" className="bl-btn mk-walk" onClick={toggleWalk} aria-pressed={walk === 'play'}>
          {walk === 'play' ? L.pause : walk === 'done' ? L.replay : L.walk}
        </button>
        <p className="mk-step" aria-live="polite">{L.step} {on + 1} {L.of} {n} · <b>{items[on].name}</b></p>
        <span className="mk-nav">
          <button type="button" className="bl-btn" aria-label={L.prev} onClick={() => pick(on - 1)} disabled={on === 0}>←</button>
          <button type="button" className="bl-btn" aria-label={L.next} onClick={() => pick(on + 1)} disabled={on === n - 1}>→</button>
        </span>
        <p className="mk-keys">{L.keys}</p>
      </div>
      <div id="mk-details" className="mk-details">
        {items.map((t, i) => <div key={t.id} className="mk-detail" data-off={i === on ? undefined : ''}>{t.detail}</div>)}
      </div>
    </div>
  );
}
