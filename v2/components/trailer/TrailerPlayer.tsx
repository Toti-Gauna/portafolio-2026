'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { CHAPTERS, chapterAt, type Fmt, TOTAL } from '@/v2/trailer/film';
import type { FilmHandle } from './Film';
import type { FilmData, TrailerCopy } from './shots';
import { useSoundtrack } from './useSoundtrack';

const Film = dynamic(() => import('./Film'), { ssr: false });
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
/** under this width the 16:9 stage is too small to read: the film is shown in 9:16 */
const WIDE_MIN = 560;
type Props = { data: FilmData; labels: TrailerCopy['player']; title: string; chapters: string[]; colors: string[]; home: string };

/**
 * The player of the trailer (lote 8.2): the frame with chapters approved in the signature pieces, around the film.
 * It never starts on its own: the film (its own chunk) is asked for with the first press of «Reproducir». It pauses when
 * it leaves the screen, the arrows change chapter, it ends still with «Repetir» and «Ver portafolio». The bar fills
 * with transform, written straight to the nodes; React renders again only on a new chapter, second or state. With
 * reduced motion it offers the text version first, and plays only if asked.
 * Lote 8.3: it sounds (`useSoundtrack`: the score of the film, and the film follows its clock), «Silenciar» turns it
 * off, and a link with `?play` (the gate, the home, Video) starts it at once; `?f=t` asks for the 9:16 edition.
 */
export function TrailerPlayer({ data, labels: L, title, chapters, colors, home }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const film = useRef<FilmHandle | null>(null);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const want = useRef(false);
  const at = useRef(0);
  const [asked, setAsked] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [secs, setSecs] = useState(0);
  const [fmt, setFmt] = useState<Fmt>('w');
  // until it hydrates the poster takes its shape from CSS with the same rules as below (no jump on a phone)
  const [placed, setPlaced] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [calm, setCalm] = useState(false);
  const [full, setFull] = useState(false);
  const [canFull, setCanFull] = useState(false);
  const sound = useSoundtrack(useCallback(() => film.current?.time() ?? at.current, []));
  const autoplay = useRef(false);
  const soundRef = useRef(sound);
  soundRef.current = sound;

  useEffect(() => {
    const el = root.current!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches, q = new URLSearchParams(window.location.search);
    setCalm(reduced);
    setCanFull(!!document.fullscreenEnabled);
    if (q.get('f') === 't' || window.matchMedia('(orientation: portrait) and (max-width: 820px)').matches) setFmt('t');
    setPlaced(true);
    // a link that asked for the film («Conocer a Ignacio»): it starts at once, unless motion is reduced
    if (q.has('play') && !reduced) autoplay.current = true;
    const ro = new ResizeObserver(() => { const n = el.clientWidth < WIDE_MIN; setNarrow(n); if (n) setFmt('t'); });
    ro.observe(el);
    const onFull = () => setFull(document.fullscreenElement === el);
    document.addEventListener('fullscreenchange', onFull);
    // nothing plays off screen
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) stopRef.current(); }, { threshold: 0.25 });
    io.observe(el);
    // and nothing plays in a hidden tab
    const onHidden = () => { if (document.hidden) stopRef.current(); };
    document.addEventListener('visibilitychange', onHidden);
    return () => { ro.disconnect(); io.disconnect(); document.removeEventListener('fullscreenchange', onFull); document.removeEventListener('visibilitychange', onHidden); };
  }, []);

  const onTime = useCallback((t: number) => {
    at.current = t;
    fills.current.forEach((el, i) => { if (el) el.style.transform = `scaleX(${Math.min(1, Math.max(0, (t - CHAPTERS[i].start) / CHAPTERS[i].dur)).toFixed(4)})`; });
    setChapter(chapterAt(Math.min(t, TOTAL - 0.01)));
    setSecs(Math.floor(t));
  }, []);
  const onEnd = useCallback(() => { want.current = false; setPlaying(false); setEnded(true); sound.stop(3); }, [sound]);
  const api = useCallback((h: FilmHandle | null) => {
    film.current = h;
    setReady(!!h);
    if (!h) return;
    // QA: a jump to any second, as a chapter does (the music goes along)
    (window as unknown as { __igFilmSeek?: (t: number) => void }).__igFilmSeek = (t) => { h.seek(t); if (want.current) soundRef.current.start(); };
    // a new film (another format) starts where the last one was
    h.seek(at.current >= TOTAL ? 0 : at.current);
    if (want.current) { h.play(); setPlaying(true); }
  }, []);

  const play = () => {
    want.current = true; setEnded(false);
    if (!asked) setAsked(true);
    if (at.current >= TOTAL - 0.02) { at.current = 0; film.current?.seek(0); }
    if (film.current) { film.current.play(); setPlaying(true); }
    sound.start();
  };
  const pause = () => { want.current = false; film.current?.pause(); setPlaying(false); sound.stop(); };
  const stopRef = useRef(pause);
  stopRef.current = () => { if (want.current) pause(); };
  useEffect(() => { if (autoplay.current) { autoplay.current = false; play(); } });
  const toggle = () => (playing ? pause() : play());
  const seek = (i: number) => {
    const c = Math.min(CHAPTERS.length - 1, Math.max(0, i));
    setEnded(false);
    if (!asked) { at.current = CHAPTERS[c].start; setAsked(true); onTime(at.current); return; }
    film.current?.seek(CHAPTERS[c].start);
    if (want.current) sound.start();
  };
  const onKey = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'A') { e.preventDefault(); toggle(); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); seek(chapter + (e.key === 'ArrowRight' ? 1 : -1)); }
  };
  useEffect(() => { (window as unknown as { __igTrailerSound?: () => object }).__igTrailerSound = sound.debug; });
  // QA: the soundtrack rendered offline, with its levels (and, asked, as a WAV to listen to)
  useEffect(() => {
    (window as unknown as { __igScoreRender?: unknown }).__igScoreRender = async (rate = 22050, asWav = false, from = 0, to = TOTAL + 3) => {
      const [{ renderScore }, { buildScore }, { levels, wav }] = await Promise.all([import('@/v2/sound/engine'), import('@/v2/trailer/score'), import('@/v2/sound/analyze')]);
      const b = await renderScore(buildScore(), TOTAL + 3, rate);
      const cut = (c: Float32Array) => c.subarray(Math.floor(from * rate), Math.floor(to * rate));
      const ch = [cut(b.getChannelData(0)), cut(b.getChannelData(1))];
      // level per second, to see the shape of the film in the music
      const per: number[] = [];
      for (let s = 0; s + rate <= ch[0].length; s += rate) { let q = 0; for (let i = s; i < s + rate; i++) q += ch[0][i] * ch[0][i]; per.push(Math.round(10 * Math.log10(q / rate + 1e-12))); }
      const out: Record<string, unknown> = { ...levels(ch, rate), per };
      if (asWav) { const bytes = wav(ch, rate); let str = ''; for (let i = 0; i < bytes.length; i += 0x8000) str += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); out.wav = btoa(str); }
      return out;
    };
  }, []);
  const fullscreen = () => { if (full) void document.exitFullscreen().catch(() => {}); else void root.current?.requestFullscreen().catch(() => {}); };
  const main = ended ? L.replay : playing ? L.pause : asked && !ready ? L.loading : L.play;

  return (
    <div className="tp sig-player" ref={root} role="group" aria-label={L.film} tabIndex={-1} onKeyDown={onKey} data-fmt={fmt} data-state={ended ? 'ended' : playing ? 'playing' : asked ? 'paused' : 'poster'} data-full={full || undefined}>
      <div className="tp-box">
        {asked && <Film key={fmt} fmt={fmt} data={data} api={api} onTime={onTime} onEnd={onEnd} clock={sound.time} />}
        {sound.locked && !sound.muted && <button type="button" className="tp-unlock" onClick={sound.unlock}>{L.unlock}</button>}
        {!asked && (
          <div className={`tp-poster ${placed ? fmt : 'a'}`}>
            <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="7" r="3.4" fill="#ff5a3c" stroke="none" /><path d="M11 16v25" /><path d="M41 21a13.5 13.5 0 1 0 1.5 12H30" /></svg>
            <p className="tp-poster-t">{title}</p>
            <p className="tp-poster-l">{L.length}</p>
            {calm && <p className="tp-calm">{L.calm}</p>}
            <button type="button" className="ui-btn ui-btn--primary ui-btn--md tp-go" onClick={play}><span>{calm ? L.anyway : L.play}</span></button>
          </div>
        )}
        {ended && (
          <div className="tp-end">
            <button type="button" className="ui-btn ui-btn--secondary ui-btn--md" onClick={play}><span>{L.replay}</span></button>
            <Link className="ui-btn ui-btn--primary ui-btn--md" href={home}><span>{L.enter}</span></Link>
          </div>
        )}
      </div>
      <p className="ui-sr" aria-live="polite">{asked ? `${L.chapter} ${chapter + 1}: ${chapters[chapter]}` : ''}</p>
      <div className="sig-player-bar tp-bar">
        <button type="button" className="sig-player-play" onClick={toggle} aria-label={main}>
          {ended ? (
            <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 8a5.5 5.5 0 1 1-1.7-4" /><path d="M13.6 1.6V5h-3.4" /></svg>
          ) : playing ? (
            <svg aria-hidden="true" viewBox="0 0 12 12" width="13" height="13"><path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" /></svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 12 12" width="13" height="13"><path d="M2.5 1l8.5 5-8.5 5z" fill="currentColor" /></svg>
          )}
        </button>
        <ol className="sig-player-chapters" aria-label={L.chapters}>
          {chapters.map((name, i) => (
            <li key={name} style={{ '--from': colors[i], '--to': colors[i], flexGrow: CHAPTERS[i].dur } as React.CSSProperties}>
              <button type="button" onClick={() => seek(i)} aria-current={asked && i === chapter ? 'true' : undefined} aria-label={`${L.chapter} ${i + 1}: ${name}`}>
                <span className="sig-player-track"><span ref={(el) => { fills.current[i] = el; }} /></span>
                <span className="sig-player-name" aria-hidden="true">{name}</span>
              </button>
            </li>
          ))}
        </ol>
        <span className="sig-player-time" aria-hidden="true">{clock(secs)} / {clock(TOTAL)}</span>
      </div>
      <div className="tp-tools">
        <p className="sig-player-keys">{L.keys}</p>
        {!narrow && (
          <span className="tp-seg" role="group" aria-label={L.format}>
            <button type="button" aria-pressed={fmt === 'w'} aria-label={L.wideLabel} onClick={() => setFmt('w')}>{L.wide}</button>
            <button type="button" aria-pressed={fmt === 't'} aria-label={L.tallLabel} onClick={() => setFmt('t')}>{L.tall}</button>
          </span>
        )}
        <button type="button" className="tp-full tp-mute" aria-pressed={sound.muted} onClick={sound.toggleMute}>{sound.muted ? L.unmute : L.mute}</button>
        {canFull && <button type="button" className="tp-full" onClick={fullscreen}>{full ? L.exitFull : L.full}</button>}
      </div>
    </div>
  );
}
