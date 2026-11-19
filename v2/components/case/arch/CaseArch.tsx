'use client';

import { type CSSProperties, type KeyboardEvent, type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ArchArt } from './arch-art';
import { ICON_BOX } from './arch-art';

export type ArchCopy = {
  title: string; caption: string; badge?: string;
  nodes: Record<string, { label: string; sub: string; note: string }>;
  edges: Record<string, string>;
  groups?: Record<string, string>;
};
export type ArchLabels = {
  kicker: string; hint: string; follow: string; pause: string; resume: string; prev: string; next: string; reset: string;
  step: string; of: string; sends: string; gets: string; planned: string; text: string; pieces: string; links: string; list: string;
};

/** Seconds each step of «Seguir el recorrido» stays before the next. */
export const ARCH_STEP_MS = 1900;

/**
 * The living architecture of a case (lote 5.2). A model on an isometric board (arch-art.ts, drawn at build time)
 * and, over it, real HTML: the name of every piece is a button. Pointing at a piece or focusing its name lights it,
 * its connections and the pieces at their other end, dims the rest and opens its card: what it does, what it sends
 * and to whom, what it receives and from whom — its contract. «Seguir el recorrido» walks a request through the
 * connections in the order of the published diagram: a packet runs along each one (stroke-dashoffset), the card
 * says where it goes and what it carries; ← → step, Escape leaves. On a narrow screen the names become a list
 * under the drawing. The text version says all of it in words. Nothing runs unless asked, and nothing loops.
 */
export function CaseArch({ art, copy, labels, color }: { art: ArchArt; copy: ArchCopy; labels: ArchLabels; color: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [pinned, setPinned] = useState(false);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const last = art.edges.length - 1;
  const name = (id: string) => copy.nodes[id]?.label ?? id;

  /* what lights up: a piece and everything it touches, or one step of the way */
  const lit = useMemo(() => {
    if (step >= 0) { const e = art.edges[step]; return { nodes: new Set([e.from, e.to]), edges: new Set([e.id]) }; }
    if (!focus) return null;
    const edges = art.edges.filter((e) => e.from === focus || e.to === focus);
    return { nodes: new Set([focus, ...edges.flatMap((e) => [e.from, e.to])]), edges: new Set(edges.map((e) => e.id)) };
  }, [art.edges, focus, step]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.querySelectorAll<SVGElement>('svg [data-n]').forEach((n) => n.toggleAttribute('data-lit', !!lit?.nodes.has(n.dataset.n!)));
    el.querySelectorAll<SVGElement>('svg [data-e]').forEach((n) => {
      n.toggleAttribute('data-lit', !!lit?.edges.has(n.dataset.e!));
      n.removeAttribute('data-run');
    });
    el.querySelectorAll<HTMLElement>('.la-name, .la-tag').forEach((n) => n.toggleAttribute('data-lit', !!(n.dataset.n ? lit?.nodes.has(n.dataset.n) : lit?.edges.has(n.dataset.e!))));
    // the packet runs again on every step (a fresh attribute restarts the animation)
    if (step >= 0) {
      const run = el.querySelector<SVGElement>(`svg [data-e="${art.edges[step].id}"]`);
      if (run) { void run.getBoundingClientRect(); run.setAttribute('data-run', ''); }
    }
  }, [lit, step, art.edges]);

  /* the walk through the connections: one step every ARCH_STEP_MS, to the end, then it stays */
  useEffect(() => {
    if (!playing) return;
    if (step >= last) { setPlaying(false); return; }
    const t = window.setTimeout(() => setStep((s) => Math.min(last, s + 1)), ARCH_STEP_MS);
    return () => window.clearTimeout(t);
  }, [playing, step, last]);
  // off screen, the walk waits
  useEffect(() => {
    const el = root.current;
    if (!el || !playing) return;
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) setPlaying(false); }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [playing]);

  const look = useCallback((id: string | null, pin = false) => { setStep(-1); setPlaying(false); setFocus(id); setPinned(pin && !!id); }, []);
  const follow = () => {
    if (playing) { setPlaying(false); return; }
    setFocus(null); setPinned(false);
    setStep((s) => (s < 0 || s >= last ? 0 : s));
    setPlaying(true);
  };
  const go = (to: number) => { setPlaying(false); setFocus(null); setStep(Math.max(0, Math.min(last, to))); };
  const reset = () => { setPlaying(false); setStep(-1); setFocus(null); setPinned(false); };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && (step >= 0 || focus)) { e.preventDefault(); reset(); return; }
    if (step < 0 || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    e.preventDefault();
    go(step + (e.key === 'ArrowRight' ? 1 : -1));
  };
  /* with a mouse, pointing at a piece of the drawing is the same as pointing at its name */
  const onOver = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || step >= 0 || pinned) return;
    const n = (e.target as Element).closest<SVGElement>('[data-n]');
    if (n) setFocus(n.dataset.n!);
  };
  const onLeave = (e: PointerEvent) => { if (e.pointerType === 'mouse' && !pinned && step < 0) setFocus(null); };

  const mode = step >= 0 ? 'step' : focus ? 'focus' : undefined;
  const card = (() => {
    if (step >= 0) {
      const e = art.edges[step];
      return (
        <>
          <p className="la-card-k">{labels.step} {step + 1} {labels.of} {art.edges.length}</p>
          <p className="la-card-t">{name(e.from)} <span aria-hidden="true">→</span><span className="ui-sr">,</span> {name(e.to)}</p>
          <p className="la-card-carry">{copy.edges[e.id]}</p>
          <p className="la-card-note">{copy.nodes[e.to]?.note}</p>
        </>
      );
    }
    if (focus) {
      const n = copy.nodes[focus], node = art.nodes.find((x) => x.id === focus)!;
      const out = art.edges.filter((e) => e.from === focus), inn = art.edges.filter((e) => e.to === focus);
      return (
        <>
          <p className="la-card-k">{n.sub}{node.planned && <span className="la-planned">{labels.planned}</span>}</p>
          <p className="la-card-t">{n.label}</p>
          <p className="la-card-note">{n.note}</p>
          {out.length > 0 && <p className="la-card-io"><b>{labels.sends}</b> {out.map((e) => `${name(e.to)} · ${copy.edges[e.id]}`).join(' — ')}</p>}
          {inn.length > 0 && <p className="la-card-io"><b>{labels.gets}</b> {inn.map((e) => `${name(e.from)} · ${copy.edges[e.id]}`).join(' — ')}</p>}
        </>
      );
    }
    return <p className="la-card-hint">{labels.hint}</p>;
  })();

  // a plain function (not a component): a new component type on every render would remount the button and lose its focus
  const nameButton = (id: string, list = false) => {
    const n = art.nodes.find((x) => x.id === id)!, c = copy.nodes[id];
    return (
      <button
        key={id} type="button" className={list ? 'la-chip' : 'la-name'} data-n={id} data-planned={n.planned || undefined} aria-pressed={focus === id && pinned}
        style={(list ? { '--a': n.color } : { left: `${n.at[0]}%`, top: `${n.at[1]}%`, '--a': n.color }) as unknown as CSSProperties}
        onPointerEnter={(e) => { if (e.pointerType === 'mouse' && !pinned && step < 0) setFocus(id); }}
        onFocus={() => { if (!pinned) look(id); }}
        onClick={() => (focus === id && pinned ? look(null) : look(id, true))}
      >
        {list && <svg viewBox={ICON_BOX} aria-hidden="true" className="wa la-icon" dangerouslySetInnerHTML={{ __html: n.icon }} />}
        <b>{c.label}</b><span>{c.sub}</span>
      </button>
    );
  };

  return (
    <div ref={root} className="la" data-mode={mode} data-playing={playing || undefined} style={{ '--c': color } as CSSProperties} onKeyDown={onKey}>
      <div className="la-stage" onPointerOver={onOver} onPointerLeave={onLeave}>
        <svg className="wa la-svg" viewBox={art.box.join(' ')} role="img" aria-label={`${copy.title}. ${copy.caption}`} dangerouslySetInnerHTML={{ __html: art.svg }} />
        <div className="la-over" role="group" aria-label={labels.pieces}>
          {art.zones.map((z) => <span key={z.id} className="la-zone-name" aria-hidden="true" style={{ left: `${z.at[0]}%`, top: `${z.at[1]}%` }}>{copy.groups?.[z.id]}</span>)}
          {art.edges.map((e) => <span key={e.id} className="la-tag" data-e={e.id} aria-hidden="true" style={{ left: `${e.at[0]}%`, top: `${e.at[1]}%` }}>{copy.edges[e.id]}</span>)}
          {art.nodes.map((n) => nameButton(n.id))}
        </div>
      </div>
      <ul className="la-list" aria-label={labels.list}>
        {art.nodes.map((n) => <li key={n.id}>{nameButton(n.id, true)}</li>)}
      </ul>
      <div className="la-panel">
        <div className="la-card" aria-live="polite">{card}</div>
        <div className="la-controls" role="group" aria-label={labels.follow}>
          <button type="button" className="la-follow" onClick={follow} aria-pressed={playing}>
            {playing
              ? <svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" /></svg>
              : <svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><path d="M2.5 1l8.5 5-8.5 5z" fill="currentColor" /></svg>}
            {playing ? labels.pause : step >= 0 && step < last ? labels.resume : labels.follow}
          </button>
          {step >= 0 && (
            <>
              <button type="button" className="la-step" onClick={() => go(step - 1)} disabled={step === 0} aria-label={labels.prev}><svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
              <button type="button" className="la-step" onClick={() => go(step + 1)} disabled={step === last} aria-label={labels.next}><svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            </>
          )}
          {mode && <button type="button" className="la-reset" onClick={reset}>{labels.reset}</button>}
        </div>
      </div>
      <details className="la-text">
        <summary>{labels.text}</summary>
        <h3>{labels.links}</h3>
        <ol>{art.edges.map((e) => <li key={e.id}>{name(e.from)} → {name(e.to)}: {copy.edges[e.id]}{e.planned ? ` (${labels.planned.toLowerCase()})` : ''}</li>)}</ol>
        <h3>{labels.pieces}</h3>
        <dl>{art.nodes.map((n) => <div key={n.id}><dt>{copy.nodes[n.id].label} · {copy.nodes[n.id].sub}{n.planned ? ` · ${labels.planned}` : ''}</dt><dd>{copy.nodes[n.id].note}</dd></div>)}</dl>
      </details>
    </div>
  );
}
