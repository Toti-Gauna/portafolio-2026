'use client';

import { type CSSProperties, useLayoutEffect, useRef } from 'react';
import { BEAT, chapterAt, DOT_COLOR, dotTrack, type Fmt, isLive, SHOTS, STAGE, TOTAL, waveAt } from '@/v2/trailer/film';
import { PRESETS } from '@/v2/trailer/presets';
import { type FilmData, ShotBody, StampSprite } from './shots';

export type FilmHandle = { play: () => void; pause: () => void; seek: (t: number) => void; time: () => number };
type Props = {
  fmt: Fmt; data: FilmData; api: (h: FilmHandle | null) => void; onTime: (t: number) => void; onEnd: () => void;
  /** the soundtrack's clock (lote 8.3): while the music plays, the picture follows it */
  clock?: () => number | null;
};
/** how far the picture may drift from the music before it is put back on the beat */
const DRIFT = 0.045;

const OUT = 'cubic-bezier(.2,.8,.2,1)', IN = 'cubic-bezier(.6,0,.9,.4)';
const WAVE = 620, HOP = 0.42;
const COLORS = [...new Set(Object.values(DOT_COLOR))];
/** what a slow machine goes without: the drift of the panels, the light that crosses them and their clips */
const EXTRA = new Set(['drift', 'glint']);
/** once a film went lite, the next one (another format, a new size) starts lite */
let wentLite = false;
const num = (el: Element, k: string, d = 0) => { const v = el.getAttribute(k); return v === null ? d : Number(v); };

/**
 * The film (lote 8.2): twenty shots on one stage and the dot that crosses them all. Everything that moves is a Web
 * Animation made once, with its place on ONE line of time — every animation lasts exactly the film (its delay, its
 * movement and an end delay), so playing, pausing and seeking are the same three calls on all of them and the browser
 * moves them on its own: no code runs per frame for the picture. While it plays, one loop reads the clock to tell the
 * player the time and to keep on stage only the shots near the playhead (the rest are `display: none`: no layers).
 * Only transform, opacity, clip-path and stroke-dashoffset are animated.
 */
export default function Film({ fmt, data, api, onTime, onEnd, clock: audioClock }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const cb = useRef({ onTime, onEnd, audioClock });
  cb.current = { onTime, onEnd, audioClock };

  useLayoutEffect(() => {
    const root = stage.current!;
    let anims: Animation[] = [], drifts: Animation[] = [], clock: Animation | null = null, raf = 0, playing = false, held = 0, width = 0;
    // the governor: if the frames come slow, the panels stop drifting and show their still instead of their clip
    let synced = 0;
    let lite = wentLite || !!(navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData, last = 0, slow = 0, seen = 0;
    const slots = [...root.querySelectorAll<HTMLElement>('.tf-slot')];
    const live: boolean[] = slots.map(() => false);

    // QA: ?skip=drift,video leaves parts out, to measure what each one costs
    const skip = new Set((new URLSearchParams(window.location.search).get('skip') ?? '').split(','));
    const add = (el: Element, keyframes: Keyframe[], delay: number, duration: number, easing = 'linear', fill: FillMode = 'both') => {
      // every animation ends with the film: a finished one would rewind itself when played again
      const start = Math.max(0, delay);
      const an = el.animate(keyframes, { delay: start, duration, endDelay: Math.max(0, TOTAL * 1000 - start - duration), easing, fill });
      an.pause();
      (EXTRA.has(el.getAttribute('data-a') ?? '') ? drifts : anims).push(an);
      return an;
    };

    const build = () => {
      [...anims, ...drifts].forEach((x) => x.cancel());
      anims = []; drifts = [];
      width = root.clientWidth;
      const [W, H] = STAGE[fmt], u = width / W, R = Math.hypot(W, H) * u;
      clock = add(root.querySelector('.tf-clock')!, [{ opacity: 0 }, { opacity: 0 }], 0, TOTAL * 1000);
      slots.forEach((slot, i) => {
        const s = SHOTS[i], t0 = s.start * 1000;
        if (i > 0) {
          const [x, y] = waveAt(s.id, fmt), o = `${(x * u).toFixed(1)}px ${(y * u).toFixed(1)}px`;
          const wave = [{ clipPath: `circle(0px at ${o})` }, { clipPath: `circle(${R.toFixed(1)}px at ${o})` }];
          add(slot.querySelector('.tf-shot')!, wave, t0, WAVE, OUT, 'backwards');
          add(slot.querySelector('.tf-edge')!, wave, t0 - 36, WAVE, OUT);
        }
        // the camera goes up: what was on stage sinks while the next colour covers it
        if (i < slots.length - 1) add(slot.querySelector('.tf-cam')!, [{ transform: 'translateY(0)' }, { transform: `translateY(${(u * 9).toFixed(1)}px)` }], t0 + s.dur * 1000, 640, IN);
        slot.querySelectorAll('[data-a]').forEach((el) => {
          const name = el.getAttribute('data-a')!;
          if (skip.has(name) || (lite && EXTRA.has(name))) return;
          const m = PRESETS[el.getAttribute('data-a')!]({ u, n: num(el, 'data-n'), rx: num(el, 'data-rx', 5), ry: num(el, 'data-ry', -14), hold: num(el, 'data-hold') });
          // a part lands on its beat (it starts a moment earlier), but never before the wave has opened the shot
          const at = t0 + num(el, 'data-at') * BEAT * 1000;
          add(el, m.keyframes, m.offset === undefined ? Math.max(t0 + (i ? 150 : 0), at - 100) : at + m.offset * 1000, m.duration, m.easing);
        });
      });
      buildDot(u);
    };

    /** The journey of the dot: three nested boxes (across, up and down, its body) and one layer per colour. */
    const buildDot = (u: number) => {
      const stops = dotTrack(fmt), f = (t: number) => Math.min(1, Math.max(0, t / TOTAL));
      const X: Keyframe[] = [], Y: Keyframe[] = [], S: Keyframe[] = [];
      const px = (n: number) => `${(n * u).toFixed(1)}px`, sc = (d: number, sx = 1, sy = 1) => `scale(${((d / 10) * sx).toFixed(3)},${((d / 10) * sy).toFixed(3)})`;
      let lastS = -1;
      const body = (t: number, transform: string, easing = 'ease-out') => { if (t > lastS + 0.012 && t < TOTAL) { S.push({ offset: f(t), transform, easing }); lastS = t; } };
      X.push({ offset: 0, transform: `translateX(${px(stops[0].x)})` });
      Y.push({ offset: 0, transform: `translateY(${px(stops[0].y)})` });
      S.push({ offset: 0, transform: sc(stops[0].size) }); lastS = 0;
      for (let k = 1; k < stops.length; k++) {
        const p = stops[k - 1], q = stops[k], gap = q.t - Math.max(0, p.t), hop = Math.min(HOP, gap * 0.62), from = q.t - hop;
        const next = stops[k + 1], room = next ? next.t - Math.min(HOP, (next.t - q.t) * 0.62) - 0.1 : TOTAL;
        if (q.tap) {
          body(q.t - 0.12, sc(q.size, 1.18, 1.18)); body(q.t, sc(q.size, 0.66, 0.66)); body(q.t + 0.14, sc(q.size, 1.12, 1.12)); body(Math.min(q.t + 0.3, room), sc(q.size));
          continue;
        }
        const fall = q.y - p.y > 30, lift = fall ? 3 : hop < 0.3 ? 3 : 10;
        X.push({ offset: f(from), transform: `translateX(${px(p.x)})`, easing: 'cubic-bezier(.4,0,.6,1)' }, { offset: f(q.t), transform: `translateX(${px(q.x)})` });
        Y.push({ offset: f(from), transform: `translateY(${px(p.y)})`, easing: 'cubic-bezier(.2,.7,.4,1)' },
          { offset: f(from + hop * (fall ? 0.3 : 0.5)), transform: `translateY(${px(Math.min(p.y, q.y) - lift)})`, easing: 'cubic-bezier(.6,0,.9,.5)' },
          { offset: f(q.t), transform: `translateY(${px(q.y)})` });
        body(from - 0.1, sc(p.size)); body(from, sc(p.size, 1.25, 0.75)); body(from + hop * 0.5, sc((p.size + q.size) / 2, 0.86, 1.18), 'ease-in');
        body(q.t, sc(q.size, 1.42, 0.6)); if (q.t + 0.13 < room) body(q.t + 0.13, sc(q.size, 0.92, 1.1)); if (q.t + 0.3 < room) body(q.t + 0.3, sc(q.size));
      }
      const end = stops[stops.length - 1];
      X.push({ offset: 1, transform: `translateX(${px(end.x)})` }); Y.push({ offset: 1, transform: `translateY(${px(end.y)})` }); S.push({ offset: 1, transform: sc(end.size) });
      const dot = root.querySelector('.tf-dot')!;
      add(dot, X, 0, TOTAL * 1000); add(dot.querySelector('.tf-dot-y')!, Y, 0, TOTAL * 1000); add(dot.querySelector('.tf-dot-s')!, S, 0, TOTAL * 1000);
      dot.querySelectorAll<HTMLElement>('.tf-dot-c').forEach((el) => {
        const mine = el.dataset.c!, kf: Keyframe[] = [];
        stops.forEach((s, i) => { const on = s.color === mine ? 1 : 0; if (!i || on !== kf[kf.length - 1].opacity) kf.push({ offset: i ? f(s.t) : 0, opacity: on, easing: 'step-end' }); });
        kf.push({ offset: 1, opacity: kf[kf.length - 1].opacity });
        add(el, kf, 0, TOTAL * 1000);
      });
    };

    const now = () => (playing && clock ? Math.min(TOTAL, Number(clock.currentTime ?? 0) / 1000) : held);
    /** Keep on stage only the shots near the playhead, and their clips loaded and running. */
    const stageAt = (t: number) => {
      slots.forEach((slot, i) => {
        const on = isLive(i, t);
        if (on !== live[i]) { live[i] = on; slot.toggleAttribute('data-live', on); }
        slot.querySelectorAll('video').forEach((v) => {
          if (skip.has('video') || (lite && !v.hasAttribute('src'))) return;
          if (!on) { if (v.hasAttribute('src')) { v.pause(); v.removeAttribute('src'); v.load(); v.removeAttribute('data-on'); } return; }
          if (!v.hasAttribute('src')) { v.src = v.dataset.src!; v.onplaying = () => v.setAttribute('data-on', ''); }
          const run = playing && !lite && t >= SHOTS[i].start + 0.2;
          if (run && v.paused) void v.play().catch(() => {});
          if (!run && !v.paused) v.pause();
        });
      });
      root.dataset.chapter = String(chapterAt(t));
    };
    const loop = (stamp: number) => {
      if (!playing) return;
      let t = now();
      const dt = stamp - last;
      last = stamp;
      // the music is the master clock: if the picture drifted, it jumps back on the beat (rare: both clocks run the same)
      const heard = cb.current.audioClock?.();
      if (heard != null && heard < TOTAL && Math.abs(heard - t) > DRIFT) { const to = Math.max(0, heard) * 1000; [...anims, ...drifts].forEach((x) => { x.currentTime = to; }); synced++; t = Math.max(0, heard); }
      // two seconds of frames over 30 ms, after the first ones: go lite, for the rest of the film
      if (!lite && ++seen > 20 && dt < 250) { slow = dt > 30 ? slow + dt : Math.max(0, slow - dt * 2); if (slow > 2000) { lite = wentLite = true; drifts.forEach((x) => x.cancel()); drifts = []; root.dataset.lite = ''; } }
      stageAt(t);
      cb.current.onTime(t);
      if (t >= TOTAL - 0.02) { handle.pause(); held = TOTAL; cb.current.onTime(TOTAL); cb.current.onEnd(); return; }
      raf = requestAnimationFrame(loop);
    };
    const handle: FilmHandle = {
      play: () => {
        if (playing) return;
        if (held >= TOTAL - 0.02) held = 0;
        anims.forEach((x) => { x.currentTime = held * 1000; x.play(); });
        drifts.forEach((x) => { x.currentTime = held * 1000; if (!lite) x.play(); });
        playing = true; seen = 0; slow = 0;
        raf = requestAnimationFrame(loop);
      },
      pause: () => {
        if (!playing) return;
        held = now();
        playing = false;
        cancelAnimationFrame(raf);
        [...anims, ...drifts].forEach((x) => { x.pause(); x.currentTime = held * 1000; });
        stageAt(held);
      },
      seek: (t) => {
        held = Math.min(TOTAL, Math.max(0, t));
        [...anims, ...drifts].forEach((x) => { x.currentTime = held * 1000; });
        stageAt(held);
        cb.current.onTime(held);
      },
      time: now,
    };

    build();
    stageAt(0); // the player says where to start
    api(handle);
    (window as unknown as { __igFilm?: () => object }).__igFilm = () => ({ t: now(), playing, fmt, animations: anims.length + drifts.length, lite, synced, live: live.map((v, i) => (v ? SHOTS[i].id : '')).filter(Boolean), running: [...anims, ...drifts].filter((x) => x.playState === 'running').length });
    // a new size of the stage is a new set of numbers: build again, at the same moment
    const ro = new ResizeObserver(() => {
      if (Math.abs(root.clientWidth - width) < 1) return;
      const was = playing, t = now();
      if (was) { playing = false; cancelAnimationFrame(raf); }
      build();
      held = t;
      [...anims, ...drifts].forEach((x) => { x.currentTime = t * 1000; });
      stageAt(t);
      if (was) handle.play();
    });
    ro.observe(root);
    return () => {
      ro.disconnect(); cancelAnimationFrame(raf); playing = false; [...anims, ...drifts].forEach((x) => x.cancel()); api(null);
      delete (window as unknown as { __igFilm?: unknown }).__igFilm;
      delete (window as unknown as { __igFilmSeek?: unknown }).__igFilmSeek;
    };
  }, [fmt, api]);

  return (
    <div className={`tf-stage ${fmt}`} ref={stage} aria-hidden="true">
      <StampSprite />
      <span className="tf-clock" />
      {SHOTS.map((s) => (
        <div className="tf-slot" key={s.id} data-slot={s.id}>
          <span className="tf-edge" data-theme={s.theme} />
          <div className="tf-shot" data-theme={s.theme} data-shot={s.id}>
            <div className="tf-cam">
              <span className="tf-hud"><b>{String(chapterAt(s.start) + 1).padStart(2, '0')}</b>{data.copy.chapters[s.chapter as keyof typeof data.copy.chapters]}</span>
              {s.year && <span className="tf-year">{s.year}</span>}
              <ShotBody s={s} fmt={fmt} d={data} />
            </div>
          </div>
        </div>
      ))}
      <span className="tf-dot"><span className="tf-dot-y"><span className="tf-dot-s">{COLORS.map((c) => <i key={c} className="tf-dot-c" data-c={c} style={{ '--c': c } as CSSProperties} />)}</span></span></span>
    </div>
  );
}
