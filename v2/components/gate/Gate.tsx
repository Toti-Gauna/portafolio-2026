'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { type Gate3D, type Step, STEPS, TAG_AFTER } from '@/v2/gate/state';
import type { Stage } from '@/v2/gate/scene';
import { ArrowIcon, PlayIcon } from '../ui/Icons';
import { reducedMotion as reduced, useGate } from './useGate';

export type GateLabels = {
  label: string; meet: string; enter: string; loading: string; ready: string; progress: string; key: string;
  level: string; role: string; edition: string; place: string; steps: Record<Step, string>;
};
/** What a version hangs on its 3D object: `k` is the small line (a year), `t` the name. */
export type GateTag = { k?: string; t: string };
type Letter = { ch: string; color?: string };

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
  variant?: Gate3D; first: Letter[]; last: Letter[]; labels: GateLabels; trailerHref: string;
  tags?: GateTag[]; tagsLabel?: string; stamps?: string[];
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const tagList = useRef<HTMLUListElement>(null);
  const stage = useRef<Stage | null>(null);
  const { root, open, done, mark, leaving, enter } = useGate(() => stage.current?.exit());
  const [gl, setGl] = useState<'pending' | 'on' | 'off'>('pending');
  const [built, setBuilt] = useState(0); // what the scene has built, 0…1

  /* the scene: its first frames are the third loading step */
  useEffect(() => {
    if (!open) return;
    let alive = true;
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
