'use client';

import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { GATE_EVENT, gateOpen, type GateVariant, type Step, STEPS, TAG_AFTER } from '@/v2/gate/state';
import type { Stage } from '@/v2/gate/scene';
import { ArrowIcon, PlayIcon } from '../ui/Icons';

export type GateLabels = {
  label: string; meet: string; enter: string; loading: string; ready: string; progress: string; key: string;
  level: string; role: string; edition: string; place: string; steps: Record<Step, string>;
};
/** What a version hangs on its 3D object: `k` is the small line (a year), `t` the name. */
export type GateTag = { k?: string; t: string };
type Letter = { ch: string; color?: string };

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MARK = (
  <>
    <path d="M11 16V41" />
    <path d="M41 21A13.5 13.5 0 1 0 42.5 33H30" />
    <circle cx="11" cy="7" r="3.4" className="gt-mark-dot" />
  </>
);

/**
 * The gate of /v2 (lote 3.1): one screen on any device, and a 3D scene behind it. Four versions share this
 * shell; each one is a different object on the same stage (v2/gate/scene) that builds itself with the real
 * loading of the page — four steps (the script, the fonts, the scene, the page itself), one move of the object
 * per step. The counter shows what has been built, never ahead of the loading. Two doors: the film and the
 * portfolio; Enter, Escape or the second door open it. The server renders the whole screen, so the name and the
 * doors are there on the first paint and work before the scene arrives; without WebGL the drawn mark stays.
 * Everything under the gate is inert while it is open. With reduced motion the scene is one still frame.
 */
export function Gate({ variant = 'monograma', first, last, labels, trailerHref, tags = [], tagsLabel, stamps }: {
  variant?: GateVariant; first: Letter[]; last: Letter[]; labels: GateLabels; trailerHref: string;
  tags?: GateTag[]; tagsLabel?: string; stamps?: string[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const tagList = useRef<HTMLUListElement>(null);
  const stage = useRef<Stage | null>(null);
  const release = useRef<() => void>(() => {});
  const [open, setOpen] = useState(true);
  const [done, setDone] = useState<Step[]>([]);
  const [gl, setGl] = useState<'pending' | 'on' | 'off'>('pending');
  const [built, setBuilt] = useState(0); // what the scene has built, 0…1
  const [leaving, setLeaving] = useState(false);
  const mark = useCallback((s: Step) => setDone((d) => (d.includes(s) ? d : [...d, s])), []);

  /* open or not: the layout's script decided before the first paint */
  useEffect(() => {
    if (!gateOpen()) { setOpen(false); return; }
    const html = document.documentElement;
    html.dataset.gateLive = 'true';
    // everything under the gate waits: no focus, no clicks, no screen reader
    const under = [...document.querySelectorAll<HTMLElement>('.sh, .v2-skip, .v2-page > :not(.gt)')];
    under.forEach((el) => { el.inert = true; });
    release.current = () => { under.forEach((el) => { el.inert = false; }); delete html.dataset.gateLive; release.current = () => {}; };
    // focus goes to the gate itself: Enter opens it, and no door is marked until Tab reaches it
    root.current?.focus({ preventScroll: true });
    return () => release.current();
  }, []);

  /* the real loading: four steps, each marked when it actually happens */
  useEffect(() => {
    if (!open) return;
    mark('dom');
    let alive = true;
    (document.fonts?.ready ?? Promise.resolve()).then(() => alive && mark('fonts'));
    const loaded = () => alive && mark('page');
    if (document.readyState === 'complete') loaded(); else window.addEventListener('load', loaded, { once: true });

    const el = canvas.current, host = root.current;
    let ro: ResizeObserver | undefined;
    let onMove: ((e: PointerEvent) => void) | undefined;
    // without the scene the drawn mark stays, and that step is done
    const flat = () => { if (alive) { setGl('off'); mark('scene'); } };
    if (!el || !host || !window.WebGL2RenderingContext) flat();
    else {
      const pictures = Promise.all((stamps ?? []).map(async (svg) => {
        const img = new Image();
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300" width="480" height="600">${svg}</svg>`)}`;
        await img.decode();
        return img;
      }));
      Promise.all([import('@/v2/gate/scene'), pictures]).then(([{ createStage, RIGS }, images]) => {
        if (!alive) return;
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        const items = tagList.current ? [...tagList.current.children] as HTMLElement[] : [];
        let shownUnit = 0;
        const s = createStage(el, RIGS[variant], {
          reduced: reduced(), coarse, images,
          onProgress: (p) => alive && setBuilt(p),
          // straight to the DOM: these change on every frame the camera moves
          onMoves: (n) => { host.dataset.move = String(n); },
          onAnchors: (pts, unit) => {
            if (Math.abs(unit - shownUnit) > 0.25) { shownUnit = unit; tagList.current?.style.setProperty('--u', `${unit.toFixed(2)}px`); }
            pts.forEach((a, i) => { if (items[i]) items[i].style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`; });
          },
        });
        stage.current = s;
        const place = () => {
          const b = box.current?.getBoundingClientRect();
          if (b && b.width && b.height) s.place({ cx: b.left + b.width / 2, cy: b.top + b.height / 2, w: b.width, h: b.height }, window.innerWidth, window.innerHeight);
        };
        place();
        ro = new ResizeObserver(place);
        ro.observe(host);
        if (box.current) ro.observe(box.current);
        if (!coarse) {
          onMove = (e) => s.pointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
          window.addEventListener('pointermove', onMove, { passive: true });
        }
        void s.ready.then(() => { if (alive) { setGl('on'); mark('scene'); } });
      }).catch(flat);
    }
    return () => {
      alive = false;
      window.removeEventListener('load', loaded);
      ro?.disconnect();
      if (onMove) window.removeEventListener('pointermove', onMove);
      stage.current?.dispose();
      stage.current = null;
    };
    // `stamps` comes from the server and never changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mark, variant]);

  /* each loading step releases one move of the scene */
  useEffect(() => { stage.current?.step(done.length); }, [done, gl]);

  const enter = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    window.dispatchEvent(new CustomEvent(GATE_EVENT, { detail: { action: 'enter' } }));
    const finish = () => {
      document.documentElement.dataset.gate = 'off';
      release.current(); // the page under the gate is live again before focus moves into it
      setOpen(false);
      document.getElementById('main')?.focus({ preventScroll: true });
    };
    if (reduced()) { finish(); return; }
    void Promise.all([stage.current?.exit() ?? Promise.resolve(), new Promise((r) => setTimeout(r, 520))]).then(finish);
  }, [leaving]);

  /* Enter and Escape open the gate (Enter on the first door follows its link) */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape' || (e.key === 'Enter' && !(e.target as Element | null)?.closest?.('a'))) { e.preventDefault(); enter(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, enter]);

  if (!open) return null;
  const loaded = done.length / STEPS.length;
  // with the scene, the counter is what the scene has built (it follows the loading); without it, the loading itself
  const progress = gl === 'on' ? Math.min(built, loaded) : gl === 'off' ? loaded : Math.min(loaded, 0.5);
  const ready = progress >= 1;
  const pct = Math.round(progress * 100);
  const step = STEPS[Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length))];
  const word = (letters: Letter[], from: number) => letters.map((l, i) => (
    <span key={i} className="gt-l" style={{ '--i': from + i, '--lc': l.color } as CSSProperties}>{l.ch}</span>
  ));
  const after = TAG_AFTER[variant];
  return (
    <div
      ref={root} className="gt" tabIndex={-1} role="dialog" aria-modal="true" aria-label={labels.label}
      data-v={variant} data-gl={gl} data-step={done.length} data-ready={ready} data-leaving={leaving || undefined}
    >
      <canvas ref={canvas} className="gt-canvas" aria-hidden="true" />
      <div className="gt-veil" aria-hidden="true" />
      {tags.length > 0 && (
        <ul ref={tagList} className="gt-tags" aria-label={tagsLabel}>
          {tags.map((tag, i) => (
            <li key={i} data-after={after[i] ?? 0}>
              <span>{tag.k && <b>{tag.k}</b>}<em>{tag.t}</em></span>
            </li>
          ))}
        </ul>
      )}
      <div className="gt-in">
        <div className="gt-top">
          <p className="gt-brand">
            <svg viewBox="0 0 48 48" aria-hidden="true">{MARK}</svg>
            <span>{labels.edition}</span>
          </p>
          <p className="gt-place">{labels.place}</p>
        </div>
        <div ref={box} className="gt-stage">
          {/* the drawn mark: what there is to see until the scene arrives, and all there is without WebGL */}
          <svg className="gt-poster" viewBox="0 0 48 48" aria-hidden="true">{MARK}</svg>
        </div>
        <div className="gt-id">
          <p className="gt-name">
            {/* the name, whole, for screen readers; the letters that move are decoration */}
            <span className="ui-sr">{`${first.map((l) => l.ch).join('')} ${last.map((l) => l.ch).join('')}`}</span>
            <span className="gt-word" aria-hidden="true">{word(first, 0)}</span>
            <span className="gt-word gt-word--last" aria-hidden="true">{word(last, first.length)}</span>
          </p>
          <p className="gt-role"><b>{labels.level}</b><span>{labels.role}</span></p>
        </div>
        <div className="gt-doors">
          <a className="gt-door gt-door--meet" href={trailerHref} data-magnetic="6">
            <PlayIcon size={14} />
            <span>{labels.meet}</span>
          </a>
          <button type="button" className="gt-door gt-door--enter" data-gate-enter data-magnetic="6" onClick={enter}>
            <span>{labels.enter}</span>
            <ArrowIcon />
            <kbd className="ui-kbd" aria-hidden="true">{labels.key}</kbd>
          </button>
        </div>
        <div className="gt-meter" aria-hidden="true">
          <span className="gt-step">{ready ? labels.ready : `${labels.loading} · ${labels.steps[step]}`}</span>
          <span className="gt-bar"><i style={{ transform: `scaleX(${progress})` }} /></span>
          <span className="gt-num">{String(pct).padStart(3, '0')}</span>
        </div>
      </div>
      <span className="ui-sr" role="progressbar" aria-label={labels.progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} />
    </div>
  );
}
