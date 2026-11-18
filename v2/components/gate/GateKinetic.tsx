'use client';

import { type CSSProperties, type PointerEvent as RPointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import { type Step, STEPS } from '@/v2/gate/state';
import { GATE_CYCLE, GATE_INTRO, GATE_THEMES, type GateTheme } from '@/v2/gate/themes';
import { ArrowIcon, PlayIcon } from '../ui/Icons';
import { reducedMotion, useGate } from './useGate';

export type KineticLabels = {
  label: string; meet: string; enter: string; loading: string; ready: string; progress: string; key: string; tint: string;
  level: string; role: string; edition: string; place: string; steps: Record<Step, string>;
};

/** How long each act of the opening lasts at least, and when in it the ball lands (ms). */
const ACT = [720, 860, 1000, 780];
const LANDS = [0, 380, 540, 410];
const CROUCH = 150, FLIGHT = 520;
const WIPE = 640, LEAD = 70;
type Plate = { id: number; theme: GateTheme; x: number; y: number; r: number };

/**
 * «Cinética», the gate of the home (lote 3.1): 2D motion graphics around the IG mark, with the weight and the
 * bounce of character animation. The coral dot of the «i» is a ball: it drops in and squashes on the floor,
 * jumps to its place and the stem shoots up under it, the G rolls in and bumps the stem, the ball slams down as
 * the dot and the bar snaps in — and every landing sends a new colour across the whole screen (ink → coral →
 * blue → paper → ink). Then the mark hops to its place and the gate rests as the published one does: the mark,
 * the name, the role and two doors on a branch, with the letters of the name jumping in.
 *  · The real loading drives it: one act per step (the script, the fonts, the scene, the page).
 *  · At rest it answers: a letter jumps under the pointer (and its neighbours with it), the mark wiggles and
 *    its dot hops, the doors squash (and stay: nothing ever hides a door); pressing the mark takes the gate to the next colour.
 *  · A press anywhere during the opening goes straight to the rest. Enter, Escape or «Ver portafolio» open it.
 *  · Colours never tint text over the wrong field: each element switches when the wipe reaches it (`--d`).
 * Only transform, opacity and clip-path move. With reduced motion the gate is at rest from the start.
 */
export function GateKinetic({ first, last, labels, trailerHref }: { first: string; last: string; labels: KineticLabels; trailerHref: string }) {
  const { root, open, done, mark, leaving, enter } = useGate(undefined, 560);
  const [scene, setScene] = useState(0);
  const [landed, setLanded] = useState(false);
  const [theme, setTheme] = useState<GateTheme>('ink'); // what is written takes these colours
  const [field, setField] = useState<GateTheme>('ink'); // the colour under the wipes in flight
  const [plates, setPlates] = useState<Plate[]>([]);
  const since = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const serial = useRef(0);
  const big = useRef<HTMLDivElement>(null);
  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };
  const centre = (sel: string) => {
    const b = root.current?.querySelector(sel)?.getBoundingClientRect();
    return b ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight * 0.42 };
  };

  /** A new colour spreads from a point; every coloured thing switches as the edge passes it. */
  const wipe = useCallback((next: GateTheme, at: { x: number; y: number }) => {
    const host = root.current;
    if (!host) return;
    const calm = reducedMotion();
    const r = Math.hypot(Math.max(at.x, window.innerWidth - at.x), Math.max(at.y, window.innerHeight - at.y));
    host.querySelectorAll<HTMLElement | SVGElement>('.gk-t').forEach((el) => {
      const b = el.getBoundingClientRect();
      const d = Math.min(1, Math.hypot(b.left + b.width / 2 - at.x, b.top + b.height / 2 - at.y) / r);
      // the wipe eases out (quadratic): the time it takes to reach a distance is the inverse of that
      el.style.setProperty('--d', calm ? '0ms' : `${Math.round(LEAD + WIPE * (1 - Math.sqrt(1 - d)))}ms`);
    });
    setTheme(next);
    if (calm) { setField(next); setPlates([]); } else setPlates((ps) => [...ps, { id: ++serial.current, theme: next, x: at.x, y: at.y, r }]);
  }, [root]);

  /** The end of the opening, however it is reached: the gate at rest, in ink. */
  const rest = useCallback((from?: { x: number; y: number }) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setScene(4);
    setLanded(true);
    if (from) wipe('ink', from); else { setTheme('ink'); setField('ink'); setPlates([]); }
  }, [wipe]);

  /* the opening's own step: the ball has landed (or, with reduced motion, there is no opening) */
  useEffect(() => {
    if (!open) return;
    since.current = performance.now();
    if (reducedMotion()) { rest(); mark('scene'); return; }
    const id = setTimeout(() => mark('scene'), 560);
    return () => { clearTimeout(id); timers.current.forEach(clearTimeout); };
  }, [open, mark, rest]);

  /* one act per loading step, each at least as long as its move */
  useEffect(() => {
    if (!open || landed || scene >= 4 || done.length <= scene) return;
    const id = setTimeout(() => {
      const next = scene + 1;
      since.current = performance.now();
      setScene(next);
      if (next < 4) { later(() => wipe(GATE_INTRO[next], centre(next === 2 ? '.gk-stem' : '.gk-ball')), LANDS[next]); return; }
      // the last act: the mark crouches and hops to its place; landing there turns the screen to ink
      later(() => {
        const a = big.current?.getBoundingClientRect(), b = root.current?.querySelector('.gk-mark svg')?.getBoundingClientRect();
        if (!big.current || !a || !b || !big.current.animate) { rest(centre('.gk-mark')); return; }
        const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2), k = b.width / a.width;
        const lift = Math.max(40, a.height * 0.2);
        big.current.animate([
          { transform: 'translate(0, 0) scale(1)', easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)' },
          { transform: `translate(${dx * 0.55}px, ${dy * 0.5 - lift}px) scale(${(1 + k) / 2})`, easing: 'cubic-bezier(0.6, 0, 0.9, 0.6)' },
          { transform: `translate(${dx}px, ${dy}px) scale(${k})` },
        ], { duration: FLIGHT, fill: 'forwards' }).onfinish = () => rest(centre('.gk-mark'));
      }, CROUCH);
    }, Math.max(0, since.current + ACT[scene] - performance.now()));
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, landed, scene, done.length]);

  /* a press anywhere during the opening (not on a control) goes straight to the rest */
  const onPress = (e: RPointerEvent) => { if (!landed && !(e.target as Element).closest('a, button')) rest(); };

  /* a letter jumps under the pointer, and its neighbours with it */
  // busy: a jump of ours is still running (the CSS entrances and loops do not count)
  const busy = (el: Element) => el.getAnimations().some((a) => !('animationName' in a) && a.playState === 'running');
  const hop = (el: Element | null | undefined, amp: number, delay = 0) => {
    if (!el || !('animate' in el) || busy(el)) return;
    el.animate([
      { transform: 'translateY(0) scale(1, 1)' },
      { transform: 'translateY(0) scale(1.16, 0.8)', offset: 0.16 },
      { transform: `translateY(${-amp}em) scale(0.9, 1.14)`, offset: 0.48, easing: 'cubic-bezier(0.5, 0, 0.9, 0.6)' },
      { transform: 'translateY(0) scale(1.13, 0.85)', offset: 0.8 },
      { transform: 'translateY(0) scale(1, 1)' },
    ], { duration: 540, delay, easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)' });
  };
  const onLetter = (e: RPointerEvent) => {
    const el = (e.target as Element).closest('.gk-l');
    if (!el || !landed || reducedMotion()) return;
    const all = [...(root.current?.querySelectorAll('.gk-l') ?? [])], i = all.indexOf(el);
    hop(el, 0.4);
    [1, 2].forEach((n) => { hop(all[i - n], 0.4 / (n * 2.2), n * 70); hop(all[i + n], 0.4 / (n * 2.2), n * 70); });
  };
  const wiggle = () => {
    if (reducedMotion()) return;
    hop(root.current?.querySelector('.gk-mark-dot'), 0.5);
    const g = root.current?.querySelector('.gk-mark-g');
    if (g && !busy(g)) g.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-16deg)', offset: 0.3 }, { transform: 'rotate(9deg)', offset: 0.6 }, { transform: 'rotate(-3deg)', offset: 0.82 }, { transform: 'rotate(0)' }], { duration: 620, easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)' });
  };
  /* under the pointer a door takes a breath: squash, stretch, settle. A jump of ours, never a CSS animation on
     :hover — swapping the animation there replayed the door's entrance when the pointer left, and it vanished
     for an instant (Ignacio, 18/11/2026). */
  const boing = (e: RPointerEvent) => {
    const el = e.currentTarget;
    if (e.pointerType !== 'mouse' || !landed || reducedMotion() || busy(el)) return;
    el.animate([
      { transform: 'scale(1, 1)' }, { transform: 'scale(1.06, 0.9)', offset: 0.3 }, { transform: 'scale(0.97, 1.06)', offset: 0.6 },
      { transform: 'scale(1.02, 0.98)', offset: 0.82 }, { transform: 'scale(1, 1)' },
    ], { duration: 460, easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)' });
  };
  const tint = () => {
    wiggle();
    wipe(GATE_CYCLE[(GATE_CYCLE.indexOf(theme) + 1) % GATE_CYCLE.length], centre('.gk-mark'));
  };

  if (!open) return null;
  const pct = Math.round((done.length / STEPS.length) * 100);
  const ready = landed && done.length === STEPS.length;
  const step = STEPS[Math.min(STEPS.length - 1, done.length)];
  const t = GATE_THEMES[theme];
  const vars = { '--fg': t.fg, '--soft': t.soft, '--alt': t.alt, '--dot': t.dot, '--btn': t.btn, '--btn-fg': t.btnFg, '--focus-c': t.focus } as CSSProperties;
  let n = 0;
  const word = (text: string, cls: string) => (
    <span className={`gk-word ${cls}`} aria-hidden="true">
      {[...text].map((ch, i) => <span key={i} className="gk-l gk-t" style={{ '--i': n++ } as CSSProperties}>{ch}</span>)}
    </span>
  );
  return (
    <div
      ref={root} className="gt gk" tabIndex={-1} role="dialog" aria-modal="true" aria-label={labels.label}
      data-v="cinetica" data-scene={scene} data-landed={landed} data-theme={theme} data-step={done.length} data-ready={ready} data-leaving={leaving || undefined}
      style={vars} onPointerDown={onPress}
    >
      {/* the colours: the field, and over it each new colour spreading from where the ball landed */}
      <div className="gk-field" style={{ background: GATE_THEMES[field].bg }} aria-hidden="true">
        {plates.map((p) => (
          <div key={p.id} className="gk-wipe" style={{ '--x': `${p.x}px`, '--y': `${p.y}px`, '--r': `${p.r}px` } as CSSProperties}>
            <i style={{ background: GATE_THEMES[p.theme].edge }} />
            <i
              style={{ background: GATE_THEMES[p.theme].bg }}
              onAnimationEnd={() => { setField(p.theme); setPlates((ps) => ps.filter((q) => q.id > p.id)); }}
            />
          </div>
        ))}
      </div>

      {/* the opening: the mark, large, built by the ball */}
      <div ref={big} className="gk-big" aria-hidden="true">
        <svg viewBox="0 0 48 48">
          <ellipse className="gk-shadow gk-t" cx="24" cy="43.5" rx="5.4" ry="0.8" />
          <g className="gk-body">
            <g className="gk-stem-w"><path className="gk-stem gk-t" d="M11 16V41" /></g>
            <g className="gk-g-roll"><g className="gk-g-spin"><path className="gk-arc gk-t" d="M41 21A13.5 13.5 0 1 0 42.5 33" /></g></g>
            <path className="gk-bar gk-t" d="M42.5 33H30" />
            <g className="gk-ball-x"><g className="gk-ball-y"><circle className="gk-ball gk-t" cx="24" cy="39.3" r="3.4" /></g></g>
          </g>
          {/* what a landing kicks up: one burst per act, where it happens */}
          <g transform="translate(24 42.7)"><path className="gk-pow gk-pow--0 gk-t" d="M5 -1.2L9.5 -3.4M-5 -1.2L-9.5 -3.4M7 0.4H12.5M-7 0.4H-12.5" /></g>
          <g transform="translate(11 42.7)"><path className="gk-pow gk-pow--1 gk-t" d="M5 -1.2L9.5 -3.4M-5 -1.2L-9.5 -3.4M7 0.4H12.5M-7 0.4H-12.5" /></g>
          <g transform="translate(14 28.5)"><path className="gk-pow gk-pow--2 gk-t" d="M-3 -5L-5.6 -9.4M-5.4 -1.6L-10.4 -3M-5.4 2.6L-10 5.2M-2.6 5.6L-4.6 10" /></g>
          <g transform="translate(11 9)"><path className="gk-pow gk-pow--3 gk-t" d="M5.4 -1.4L10 -3.6M-5.4 -1.4L-10 -3.6M6.4 2.6H11.4M-6.4 2.6H-11.4" /></g>
        </svg>
      </div>

      <div className="gk-in">
        <div className="gk-top">
          <p className="gk-brand gk-t">{labels.edition}</p>
          <p className="gk-place gk-t">{labels.place}</p>
          {!landed && (
            <button type="button" className="gk-skip gk-t" data-gate-enter onClick={enter}>
              <span>{labels.enter}</span><ArrowIcon />
            </button>
          )}
        </div>

        {/* the rest: the gate as the published one, alive */}
        <div className="gk-final" inert={!landed}>
          <button type="button" className="gk-mark gk-t" aria-label={labels.tint} onClick={tint} onPointerEnter={wiggle}>
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M11 16V41" />
              <g className="gk-mark-g"><path d="M41 21A13.5 13.5 0 1 0 42.5 33H30" /></g>
              <g className="gk-mark-dot"><circle cx="11" cy="7" r="3.4" /></g>
            </svg>
          </button>
          <div className="gk-id">
            <p className="gk-name" onPointerOver={onLetter} onPointerDown={onLetter}>
              {/* the name, whole, for screen readers; the letters that jump are decoration */}
              <span className="ui-sr">{`${first} ${last}`}</span>
              {word(first, 'gk-word--first')}
              {word(last, 'gk-word--last')}
            </p>
            <p className="gk-role gk-t"><b>{labels.level}</b> {labels.role}</p>
          </div>
          <div className="gk-doors">
            <svg className="gk-fork gk-t" viewBox="0 0 40 136" aria-hidden="true">
              <path className="gk-fork-b" d="M6 6V100a12 12 0 0 0 12 12H40" pathLength={1} />
              <path className="gk-fork-a" d="M6 6V40a12 12 0 0 0 12 12H40" pathLength={1} />
              <circle cx="6" cy="6" r="5" />
              <circle className="gk-packet" cx="6" cy="6" r="3" />
            </svg>
            <a className="gk-door gk-door--meet gk-t" href={trailerHref} data-magnetic="6" onPointerEnter={boing}>
              <PlayIcon size={14} />
              <span>{labels.meet}</span>
            </a>
            <button type="button" className="gk-door gk-door--enter gk-t" data-gate-enter data-magnetic="6" onClick={enter} onPointerEnter={boing}>
              <span>{labels.enter}</span>
              <ArrowIcon />
              <kbd className="gk-key" aria-hidden="true">{labels.key}</kbd>
            </button>
          </div>
        </div>

        <div className="gk-meter gk-t" aria-hidden="true">
          <span className="gk-step">{done.length === STEPS.length ? labels.ready : `${labels.loading} · ${labels.steps[step]}`}</span>
          <span className="gk-bar-h"><i style={{ transform: `scaleX(${pct / 100})` }} /></span>
          <span className="gk-num">{String(pct).padStart(3, '0')}</span>
        </div>
      </div>
      <span className="ui-sr" role="progressbar" aria-label={labels.progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} />
    </div>
  );
}
