'use client';

import { type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { reducedMotion } from '@/v2/motion/env';
import { ArrowIcon, ArrowLeftIcon, CloseIcon, PlayIcon } from '../ui/Icons';
import type { FilmKind, FilmShape } from './films';

/** A tile as the server lays it out: the film, its colour and its words (name, caption = the «pie», alt). */
export type WallFilm = {
  id: string; kind: FilmKind; shape: FilmShape; href: string; src?: string; poster: string;
  color: string; name: string; caption: string; alt: string; caseHref?: string; feature?: boolean;
};
export type WallLabels = {
  kind: string; shape: string; all: string; kinds: Record<FilmKind, string>; shapes: Record<FilmShape, string>;
  count: { one: string; other: string }; open: string;
  player: { label: string; close: string; prev: string; next: string; case: string; of: string };
};

type Pick<T extends string> = 'all' | T;

/**
 * The wall of films (lote 7.2). Every tile is a real link: to the clip (or, for the trailer, to the trailer itself),
 * so without JavaScript each film still opens. With it:
 *  - filters by type and by format (two groups of toggle buttons; the count is announced);
 *  - a mouse over a tile plays a silent preview of the clip, which is only requested at that moment and stops when
 *    the pointer leaves (touch screens and reduced motion get the poster);
 *  - a tap or Enter opens the film in a modal player with its caption, its description, the way to its case and the
 *    films next to it (← →, Escape closes and the focus goes back to the tile).
 * Nothing plays by itself and nothing asks for frames.
 */
export function FilmWall({ films, labels: L }: { films: WallFilm[]; labels: WallLabels }) {
  const [kind, setKind] = useState<Pick<FilmKind>>('all');
  const [shape, setShape] = useState<Pick<FilmShape>>('all');
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const shown = films.map((f) => (kind === 'all' || f.kind === kind) && (shape === 'all' || f.shape === shape));
  const n = shown.filter(Boolean).length;
  const playable = films.map((f, i) => (f.src && shown[i] ? i : -1)).filter((i) => i >= 0);

  // ── the silent preview under a mouse ──
  const preview = (e: PointerEvent<HTMLAnchorElement>, on: boolean) => {
    if (e.pointerType !== 'mouse') return;
    const tile = e.currentTarget, v = tile.querySelector('video');
    if (!v) return;
    if (on) {
      if (reducedMotion()) return;
      if (!v.getAttribute('src')) v.setAttribute('src', v.dataset.src!);
      void v.play().then(() => tile.setAttribute('data-playing', '')).catch(() => undefined);
    } else {
      v.pause();
      tile.removeAttribute('data-playing');
    }
  };

  // ── the player ──
  const show = useCallback((i: number) => {
    setOpen(i);
    const d = dialog.current;
    if (d && !d.open) d.showModal();
  }, []);
  const close = () => dialog.current?.close();
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const done = () => {
      player.current?.pause();
      setOpen(null);
      opener.current?.focus();
    };
    d.addEventListener('close', done);
    return () => d.removeEventListener('close', done);
  }, []);
  useEffect(() => {
    if (open === null) return;
    const v = player.current;
    if (!v) return;
    v.load();
    if (!reducedMotion()) void v.play().catch(() => undefined);
  }, [open]);
  const step = (d: number) => {
    if (open === null) return;
    const k = playable.indexOf(open);
    const next = playable[(k + d + playable.length) % playable.length];
    if (next !== undefined) setOpen(next);
  };
  const onDialogKey = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'VIDEO') return; // the video's own controls use the arrows to seek
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  };
  const onTile = (e: MouseEvent<HTMLAnchorElement>, i: number) => {
    const f = films[i];
    if (!f.src || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // the trailer opens its own page
    e.preventDefault();
    e.currentTarget.querySelector('video')?.pause();
    opener.current = e.currentTarget;
    show(i);
  };

  // for the tests: how many tiles show and which film is open
  useEffect(() => {
    (window as unknown as { __igWall?: () => { shown: number; open: string | null } }).__igWall = () => ({ shown: n, open: open === null ? null : films[open].id });
  }, [n, open, films]);

  const f = open === null ? null : films[open];
  const pos = open === null ? 0 : playable.indexOf(open) + 1;
  const group = <T extends string>(label: string, value: Pick<T>, set: (v: Pick<T>) => void, opts: [Pick<T>, string][]) => (
    <div className="vw-group" role="group" aria-label={label}>
      <span className="vw-group-k" aria-hidden="true">{label}</span>
      {opts.map(([v, t]) => <button key={v} type="button" className="vw-chip" aria-pressed={value === v} onClick={() => set(v)}>{t}</button>)}
    </div>
  );

  return (
    <div className="vw">
      <div className="vw-bar">
        {group<FilmKind>(L.kind, kind, setKind, [['all', L.all], ...(Object.keys(L.kinds) as FilmKind[]).map((k) => [k, L.kinds[k]] as [FilmKind, string])])}
        {group<FilmShape>(L.shape, shape, setShape, [['all', L.all], ...(Object.keys(L.shapes) as FilmShape[]).map((k) => [k, L.shapes[k]] as [FilmShape, string])])}
        <p className="vw-count" aria-live="polite"><b>{n}</b> {n === 1 ? L.count.one : L.count.other}</p>
      </div>

      <ul className="vw-grid">
        {films.map((film, i) => (
          <li key={film.id} className="vw-cell" data-shape={film.shape} data-kind={film.kind} data-feature={film.feature ? '' : undefined} hidden={!shown[i]} style={{ '--c': film.color } as CSSProperties}>
            <a
              className="vw-tile" href={film.href} data-film={film.id} onClick={(e) => onTile(e, i)}
              onPointerEnter={(e) => preview(e, true)} onPointerLeave={(e) => preview(e, false)}
              aria-haspopup={film.src ? 'dialog' : undefined}
            >
              <span className="vw-media" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={film.poster} alt="" loading={i < 4 ? 'eager' : 'lazy'} decoding="async" />
                {film.src && <video muted loop playsInline preload="none" data-src={film.src} tabIndex={-1} />}
                <span className="vw-play">{film.src ? <PlayIcon size={14} /> : <ArrowIcon size={14} />}</span>
              </span>
              <span className="vw-cap">
                <b><i aria-hidden="true" />{film.name}</b>
                <span>{film.caption}</span>
                {!film.src && <em>{L.open}</em>}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <dialog ref={dialog} className="vp" aria-label={L.player.label} onKeyDown={onDialogKey} onClick={(e) => { if (e.target === dialog.current) close(); }}>
        {f && (
          <div className="vp-in" style={{ '--c': f.color } as CSSProperties}>
            <div className="vp-top">
              <p className="vp-pos">{pos} {L.player.of} {playable.length}</p>
              <button type="button" className="vp-btn" onClick={close} autoFocus aria-label={L.player.close}><CloseIcon /></button>
            </div>
            <div className="vp-stage" data-shape={f.shape}>
              <video ref={player} key={f.id} controls playsInline muted loop poster={f.poster} src={f.src} aria-label={f.alt} />
            </div>
            <div className="vp-foot">
              <div className="vp-text">
                <h2><i aria-hidden="true" />{f.name}</h2>
                <p className="vp-cap">{f.caption}</p>
                <p className="vp-alt">{f.alt}</p>
              </div>
              <div className="vp-acts">
                <button type="button" className="vp-btn" onClick={() => step(-1)} aria-label={L.player.prev}><ArrowLeftIcon /></button>
                <button type="button" className="vp-btn" onClick={() => step(1)} aria-label={L.player.next}><ArrowIcon /></button>
                {f.caseHref && <Link className="ui-btn ui-btn--secondary ui-btn--md vp-case" href={f.caseHref} onClick={close}><span>{L.player.case}</span><ArrowIcon size={14} /></Link>}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
