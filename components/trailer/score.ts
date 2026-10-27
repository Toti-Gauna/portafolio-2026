import { T, DURATION } from './timing';

/** The score as data (the same idea as the Kinetic Studio kit): every event has a time in seconds. */
export type EventKind = 'kick' | 'hat' | 'bass' | 'pad' | 'click' | 'hit' | 'blip' | 'whoosh' | 'thump' | 'swell';
export interface ScoreEvent { t: number; k: EventKind; f?: number; d?: number; v?: number }

export const BPM = 104;
export const BEAT = 60 / BPM;

// A minor feel. One root per career branch: A, C, D, E.
const ROOTS = [110, 130.81, 146.83, 164.81];
const PENTA = [0, 3, 5, 7, 10, 12, 15];
const note = (root: number, semis: number) => root * Math.pow(2, semis / 12);

export function buildScore(): ScoreEvent[] {
  const e: ScoreEvent[] = [];
  const add = (t: number, k: EventKind, o: Partial<ScoreEvent> = {}) => { if (t < DURATION) e.push({ t, k, ...o }); };

  // 1 · cold open: drone and a slow heartbeat
  add(0, 'pad', { f: 55, d: 18, v: 0.5 });
  add(0.5, 'pad', { f: 82.41, d: 17, v: 0.3 });
  for (let t = 1.2; t < T.s2; t += 1.4) { add(t, 'thump', { v: 0.8 }); add(t + 0.28, 'thump', { v: 0.5 }); }

  // 2 · typing
  const chars = 31, t0 = T.s2 + 1.2, dur = 4.2;
  for (let i = 0; i < chars; i++) add(t0 + (i * dur) / chars, 'click', { v: 0.5 + ((i * 7) % 5) * 0.06 });
  add(T.s2 + 7.2, 'blip', { f: note(220, 0), d: 0.5, v: 0.5 });
  add(T.s2 + 7.4, 'blip', { f: note(220, 7), d: 0.6, v: 0.5 });

  // 3 · explosion
  add(T.s3 - 1.4, 'swell', { d: 1.6, v: 0.8 });
  add(T.s3, 'hit', { v: 1 });
  add(T.s3, 'pad', { f: 110, d: 10, v: 0.5 });
  add(T.s3 + 5, 'whoosh', { d: 2, v: 0.5 });

  // 4–7 · four branches, each with its root; groove grows
  const starts = [T.s4, T.s5, T.s6, T.s7];
  starts.forEach((s, bi) => {
    const root = ROOTS[bi];
    const end = bi === 3 ? T.s8 : starts[bi + 1];
    add(s, 'pad', { f: root / 2, d: end - s + 0.5, v: 0.45 });
    add(s, 'whoosh', { d: 1.2, v: 0.35 });
    for (let t = s, n = 0; t < end - 0.01; t += BEAT, n++) {
      add(t, 'kick', { v: bi === 0 ? 0.7 : 0.9 });
      if (bi >= 1) add(t + BEAT / 2, 'hat', { v: 0.35 });
      // bass: eighth-note motif that walks the pentatonic
      const step = [0, 0, 3, 0, 5, 3, 0, 7][n % 8];
      if (bi >= 1 || n % 2 === 0) add(t, 'bass', { f: note(root / 2, step), d: BEAT * 0.9, v: 0.7 });
      if (bi >= 2 && n % 2 === 1) add(t + BEAT / 2, 'blip', { f: note(root * 2, PENTA[(n * 3) % 7]), d: 0.25, v: 0.25 });
    }
  });

  // 8 · own projects: build
  add(T.s8, 'pad', { f: 110, d: 12.5, v: 0.4 });
  for (let t = T.s8, n = 0; t < T.s9; t += BEAT / 2, n++) {
    add(t, 'hat', { v: 0.2 + (n / 40) * 0.5 });
    if (n % 2 === 0) add(t, 'kick', { v: 0.8 });
    add(t, 'blip', { f: note(220, PENTA[(n * 2) % 7]), d: 0.2, v: 0.2 });
  }
  add(T.s9 - 1.6, 'swell', { d: 1.6, v: 1 });

  // 9 · the system: the drop
  add(T.s9, 'hit', { v: 1 });
  add(T.s9, 'pad', { f: 110, d: 16, v: 0.5 });
  for (let t = T.s9, n = 0; t < T.s10; t += BEAT / 2, n++) {
    if (n % 2 === 0) add(t, 'kick', { v: 1 });
    if (n % 4 === 2) add(t, 'hat', { v: 0.5 });
    add(t, 'bass', { f: note(55, [0, 0, 7, 0, 5, 0, 3, 5][n % 8]), d: BEAT * 0.45, v: 0.8 });
    if (n % 3 === 0) add(t, 'blip', { f: note(440, PENTA[(n / 3 | 0) % 7]), d: 0.2, v: 0.3 });
  }
  for (let i = 0; i < 6; i++) add(T.s9 + 3.2 + i * 2.2, 'blip', { f: note(440, PENTA[i]), d: 0.5, v: 0.5 });

  // 10 · merge: one big hit, then air
  add(T.s10 - 0.6, 'swell', { d: 0.6, v: 0.8 });
  add(T.s10, 'hit', { v: 1 });
  add(T.s10, 'pad', { f: 110, d: 14, v: 0.55 });
  add(T.s10, 'pad', { f: 164.81, d: 14, v: 0.35 });
  add(T.s10, 'pad', { f: 220, d: 14, v: 0.3 });

  // 11 · credits: last chord, silence
  add(T.s11, 'pad', { f: 110, d: 5, v: 0.45 });
  add(T.s11, 'pad', { f: 329.63, d: 5, v: 0.2 });
  add(T.s11 + 0.2, 'blip', { f: note(440, 0), d: 1.4, v: 0.4 });

  return e.sort((a, b) => a.t - b.t);
}

/** Times of every kick, for visuals that pulse with the beat (pure function of time: seekable). */
export const KICKS: number[] = buildScore().filter((e) => e.k === 'kick' || e.k === 'hit').map((e) => e.t);

/** 0..1 pulse that decays after the last kick before t. */
export function pulseAt(t: number): number {
  let lo = 0, hi = KICKS.length - 1, last = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (KICKS[m] <= t) { last = KICKS[m]; lo = m + 1; } else hi = m - 1; }
  if (last < 0) return 0;
  const d = t - last;
  return d > 0.6 ? 0 : Math.exp(-d * 9);
}
