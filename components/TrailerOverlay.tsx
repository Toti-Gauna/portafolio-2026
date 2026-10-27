'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pause, Play, Volume2, VolumeX, X } from './trailer/icons';
import { buildTimeline, CODE, VIDEO_LENGTH, VIDEO_START } from './trailer/scenes';
import { draw, makeScene, PARTICLES } from './trailer/draw';
import { initialState } from './trailer/state';
import { sampleText } from './trailer/sample';
import { TrailerAudio } from './trailer/audio';
import { DURATION, sceneAt } from './trailer/timing';
import { stageFor, type Orientation } from './trailer/types';
import { GATE_X0, GATE_STEP, gateY } from './trailer/graph';
import { asset } from '@/lib/site';
import './trailer/trailer.css';

const SCENES = 11;
const wheelPaths = Array.from({ length: 8 }, (_, i) => {
  const a0 = (i * Math.PI) / 4 - Math.PI / 2, a1 = ((i + 1) * Math.PI) / 4 - Math.PI / 2;
  const p = (a: number) => `${(100 + 92 * Math.cos(a)).toFixed(2)} ${(100 + 92 * Math.sin(a)).toFixed(2)}`;
  return `M100 100L${p(a0)}A92 92 0 0 1 ${p(a1)}Z`;
});
const wheelFill = ['#ff4d2e', '#1b1b20', '#2b50ff', '#1b1b20', '#eeeae3', '#1b1b20', '#ff4d2e', '#1b1b20'];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** The 120 s trailer: a native <dialog> with its own controls. Loaded only when the visitor asks for it. */
export default function TrailerOverlay({ onClose }: { onClose: () => void }) {
  const t = useTranslations('trailer');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const audioRef = useRef<TrailerAudio | null>(null);
  const timeRef = useRef(0);
  const wantPlay = useRef(true);

  const [o, setO] = useState<Orientation>(() => (window.innerHeight > window.innerWidth * 1.05 ? 'portrait' : 'landscape'));
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [force, setForce] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(false);
  const [time, setTime] = useState(0);
  const [scene, setScene] = useState(0);
  const textMode = reduced && !force;

  useEffect(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(id);
      id = setTimeout(() => setO(window.innerHeight > window.innerWidth * 1.05 ? 'portrait' : 'landscape'), 150);
    };
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(id); window.removeEventListener('resize', onResize); };
  }, []);

  const syncVideo = useCallback(() => {
    const v = videoRef.current, tl = tlRef.current;
    if (!v || !tl) return;
    const now = tl.time();
    const want = Math.min(VIDEO_LENGTH, Math.max(0, now - VIDEO_START));
    const inRange = now >= VIDEO_START - 0.2 && now <= VIDEO_START + VIDEO_LENGTH;
    if (inRange && !tl.paused()) {
      if (v.paused) void v.play().catch(() => {});
      if (Math.abs(v.currentTime - want) > 0.3) v.currentTime = want;
    } else {
      if (!v.paused) v.pause();
      if (Math.abs(v.currentTime - want) > 0.04) v.currentTime = want;
    }
  }, []);

  // Build the whole trailer: sample the text targets, make the canvas scene and the master timeline.
  useEffect(() => {
    if (textMode) return;
    const root = stageRef.current, canvas = canvasRef.current;
    const g = canvas?.getContext('2d');
    if (!root || !canvas || !g) return;
    let disposed = false;
    let lastUi = 0;
    setReady(false);

    void (async () => {
      const family = getComputedStyle(root).fontFamily;
      try { await document.fonts.load(`800 100px ${family}`); } catch { /* fall back to whatever is loaded */ }
      if (disposed) return;
      const size = stageFor(o), { W, H } = size;
      const landscape = o === 'landscape';
      const word = t('scenes.typeWord');
      const targets = {
        word: sampleText([word], family, landscape ? H * 0.34 : W * 0.26, { x: W / 2, y: H / 2 }, 0, W, H, PARTICLES, 11),
        name: sampleText(['IGNACIO', 'GAUNA'], family, landscape ? H * 0.23 : W * 0.165, { x: W / 2, y: H / 2 }, landscape ? H * 0.26 : W * 0.2, W, H, PARTICLES, 23),
      };
      const sc = makeScene(size, targets);
      const st = initialState();
      let tl!: gsap.core.Timeline;
      const render = () => {
        draw(g, st, sc, tl.time());
        timeRef.current = tl.time();
        syncVideo();
        const now = performance.now();
        if (now - lastUi > 100) {
          lastUi = now;
          setTime(Math.round(tl.time() * 10) / 10);
          setScene(sceneAt(tl.time()));
        }
      };
      tl = buildTimeline(root, st, render);
      tl.eventCallback('onComplete', () => {
        setPlaying(false);
        wantPlay.current = false;
        audioRef.current?.pause();
        setTimeout(() => { if (!disposed) onClose(); }, 500);
      });
      tlRef.current = tl;

      const audio = new TrailerAudio(() => tl.time());
      audio.setEnabled(false);
      audioRef.current = audio;

      const startAt = new URLSearchParams(window.location.search).get('t');
      const from = startAt !== null && !Number.isNaN(Number(startAt)) ? Math.min(DURATION, Math.max(0, Number(startAt))) : timeRef.current;
      if (startAt !== null) wantPlay.current = false;
      tl.time(from);
      render();
      setReady(true);
      if (wantPlay.current) { tl.play(); audio.play(); setPlaying(true); }
    })();

    const onVis = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', onVis);
      tlRef.current?.kill();
      tlRef.current = null;
      audioRef.current?.dispose();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o, textMode]);

  const pause = useCallback(() => {
    tlRef.current?.pause();
    audioRef.current?.pause();
    wantPlay.current = false;
    setPlaying(false);
    syncVideo();
  }, [syncVideo]);

  const play = useCallback(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (tl.time() >= DURATION - 0.05) tl.time(0);
    tl.play();
    audioRef.current?.play();
    wantPlay.current = true;
    setPlaying(true);
  }, []);

  const toggle = useCallback(() => (tlRef.current?.paused() ? play() : pause()), [play, pause]);

  const seek = useCallback((v: number) => {
    tlRef.current?.time(v);
    audioRef.current?.seek();
    setTime(v);
    setScene(sceneAt(v));
  }, []);

  const toggleSound = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.setEnabled(!a.enabled);
    setSound(a.enabled);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'INPUT') { e.preventDefault(); toggle(); }
    if ((e.key === 'm' || e.key === 'M') && tag !== 'INPUT') toggleSound();
  };

  const s = (k: string) => t(`scenes.${k}`);
  const transcript = [
    `${s('s1a')} ${s('s1b')}`,
    `${s('typePre')}${s('typeWord')}${s('typePost')}`,
    s('s3'),
    ...(['tach', 'ada', 'tuenti', 'complia'] as const).map(
      (k) => `${s(`${k}.year`)} · ${s(`${k}.name`)}. ${s(`${k}.text`)}${k === 'tuenti' ? ` ${s('tuenti.game')}` : ''}`,
    ),
    `${s('projects.title')} ${['eclipse', 'handyx', 'volta', 'velmar', 'dentalos', 'supernova', 'games', 'kinetic']
      .map((k) => `${s(`projects.${k}`)} (${s(`projects.${k}S`)})`).join(', ')}.`,
    `${s('system.title')} ${s('system.text')} ${[1, 2, 3, 4, 5, 6].map((i) => s(`system.g${i}`)).join(' → ')}. ${s('system.note')}`,
    `Ignacio Gauna. ${s('role')}.`,
    `${s('open')} ${s('mail')}`,
  ];

  const projects = ['eclipse', 'handyx', 'volta', 'velmar', 'dentalos', 'supernova', 'games', 'kinetic'] as const;
  const gatePos = (i: number) => `${(GATE_X0 + i * GATE_STEP) * 100}%`;

  return (
    <dialog ref={dialogRef} className="trailer" aria-labelledby="trailer-title" onClose={onClose} onKeyDown={onKeyDown}>
      <h2 id="trailer-title" className="sr-only">{t('title')}</h2>

      {textMode ? (
        <div className="trailer__text">
          <h3 className="trailer__texth">{t('textTitle')}</h3>
          <p className="label">{t('textLead')}</p>
          <ol className="trailer__list">{transcript.map((line, i) => <li key={i}>{line}</li>)}</ol>
          <div className="trailer__textactions">
            <button type="button" className="btn btn-ghost" onClick={() => setForce(true)}>{t('watch')}</button>
            <button type="button" className="btn btn-primary" autoFocus onClick={onClose}>{t('close')}</button>
          </div>
        </div>
      ) : (
        <div className="trailer__wrap" data-o={o}>
          <div ref={stageRef} className="stage" data-o={o} data-ready={ready}>
            <canvas ref={canvasRef} className="stage__canvas" width={stageFor(o).W} height={stageFor(o).H} aria-hidden="true" />

            <p className="tx tx-center tx-low big" data-k="s1a">{s('s1a')}</p>
            <p className="tx tx-center tx-low big" data-k="s1b">{s('s1b')}</p>
            <p className="tx tx-center tx-low big typed" data-k="type" data-pre={s('typePre')} data-word={s('typeWord')} data-post={s('typePost')}>
              <span data-k="tPre" /><mark data-k="tWord" /><span data-k="tPost" />
            </p>
            <p className="tx tx-center big" data-k="s3">{s('s3')}</p>

            {/* 2021 · TACH */}
            <div className="tx card" data-k="card-tach">
              <p className="card__year">{s('tach.year')}</p>
              <p className="card__name">{s('tach.name')}</p>
              <p className="card__text">{s('tach.text')}</p>
            </div>
            <div className="tx vis" data-k="vis-tach" aria-hidden="true">
              <div className="wallet">
                <span className="wallet__chip" />
                <span className="wallet__dots">•••• •••• ••••</span>
                <span className="wallet__shine" data-k="shine" />
              </div>
            </div>

            {/* 2023 · Ada */}
            <div className="tx card" data-k="card-ada">
              <p className="card__year">{s('ada.year')}</p>
              <p className="card__name">{s('ada.name')}</p>
              <p className="card__text">{s('ada.text')}</p>
            </div>
            <div className="tx vis" data-k="vis-ada" aria-hidden="true">
              <pre className="codebox"><code data-k="code" data-full={CODE} /></pre>
            </div>

            {/* 2024 · Tuenti */}
            <div className="tx card" data-k="card-tuenti">
              <p className="card__year">{s('tuenti.year')}</p>
              <p className="card__name">{s('tuenti.name')}</p>
              <p className="card__text">{s('tuenti.text')}</p>
              <p className="card__tag" data-k="tag-game">{s('tuenti.game')}</p>
            </div>
            <div className="tx vis vis--wheel" data-k="vis-tuenti" aria-hidden="true">
              <svg viewBox="0 0 200 210" className="wheel">
                <g data-k="wheel">
                  {wheelPaths.map((d, i) => <path key={i} d={d} fill={wheelFill[i]} stroke="#0e0e10" strokeWidth="2" />)}
                  <circle cx="100" cy="100" r="14" fill="#0e0e10" stroke="#eeeae3" strokeWidth="2" />
                </g>
                <path d="M100 4 L92 -10 L108 -10 Z" transform="translate(0 14)" fill="#eeeae3" />
              </svg>
              <ul className="pills">
                {[1, 2, 3, 4].map((i) => <li key={i} className="pill" data-k="pill">{s(`tuenti.p${i}`)}</li>)}
              </ul>
            </div>

            {/* 2026 · ComplIA */}
            <div className="tx card" data-k="card-complia">
              <p className="card__year">{s('complia.year')}</p>
              <p className="card__name">{s('complia.name')}</p>
              <p className="card__text">{s('complia.text')}</p>
              <p className="card__note">{s('complia.note')}</p>
            </div>
            <figure className="tx vis vis--video" data-k="vis-complia">
              <video ref={videoRef} muted playsInline preload="auto" poster={asset('/media/complia-demo-poster.jpg')} aria-label={t('video')}>
                <source src={asset('/media/complia-demo.mp4')} type="video/mp4" />
              </video>
              <figcaption className="label">{t('video')}</figcaption>
            </figure>

            {/* mis propias ramas */}
            <p className="tx proj-title" data-k="proj-title">{s('projects.title')}</p>
            <ul className="proj-grid">
              {projects.map((k) => (
                <li key={k} className="tx chip" data-k="chip">
                  <span className="chip__name">{s(`projects.${k}`)}</span>
                  <span className="chip__status">{s(`projects.${k}S`)}</span>
                </li>
              ))}
            </ul>

            {/* el sistema */}
            <p className="tx sys-title" data-k="sys-title">{s('system.title')}</p>
            <p className="tx sys-text" data-k="sys-text">{s('system.text')}</p>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <p key={i} className="tx gate" data-k="gate" style={{ left: gatePos(i - 1), top: `${(gateY(o) + 0.03) * 100}%` }}>{s(`system.g${i}`)}</p>
            ))}
            <p className="tx sys-note" data-k="sys-note">{s('system.note')}</p>

            {/* unión y créditos */}
            <p className="tx role" data-k="role">{s('role')}</p>
            <div className="cut cut--a" data-k="cut-a" />
            <div className="cut cut--b" data-k="cut-b" />
            <p className="tx open" data-k="open">{s('open')}</p>
            <p className="tx mail" data-k="mail">{s('mail')}</p>
            <div className="stage__fade" data-k="stage-fade" />
          </div>

          <div className="controls" role="group" aria-label={t('title')}>
            <button type="button" className="ctl" onClick={toggle} disabled={!ready} aria-label={playing ? t('pause') : t('play')} autoFocus>
              {playing ? <Pause /> : <Play />}
            </button>
            <input
              className="ctl-range"
              type="range"
              min={0}
              max={DURATION}
              step={1}
              value={Math.round(time)}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label={t('progress')}
              aria-valuetext={`${fmt(time)} / ${fmt(DURATION)}`}
              disabled={!ready}
              style={{ ['--p' as string]: `${(time / DURATION) * 100}%` }}
            />
            <span className="ctl-time" aria-hidden="true">{fmt(time)} / {fmt(DURATION)}</span>
            <button type="button" className="ctl" onClick={toggleSound} disabled={!ready} aria-pressed={sound} aria-label={sound ? t('soundOff') : t('soundOn')}>
              {sound ? <Volume2 /> : <VolumeX />}
            </button>
            <button type="button" className="ctl ctl--skip" onClick={onClose}>
              <X /><span>{t('close')}</span>
            </button>
          </div>
          <p className="sr-only" aria-live="polite">{ready ? `${t('scene', { n: scene + 1, total: SCENES })}: ${transcript[scene]}` : ''}</p>
        </div>
      )}
    </dialog>
  );
}
