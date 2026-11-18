/**
 * The composer of the generative music (lote 2.3). Pure: for a style, a zone (the page) and a bar number it
 * returns the notes of that bar, the same every time. The engine (engine.ts) turns them into sound; tests and
 * offline renders call it directly. Nothing is recorded: every note is written here, from a few rules.
 */

export type Voice = 'pad' | 'pluck' | 'arp' | 'keys' | 'lead' | 'bass' | 'kick' | 'hat' | 'brush' | 'shaker' | 'swell' | 'chime';
/** `beat` from the start of the bar (4/4), `dur` in beats, `midi` note number, `vel` 0–1. */
export type NoteEvent = { voice: Voice; beat: number; dur: number; midi: number; vel: number };

export const MODES = {
  ionian: [0, 2, 4, 5, 7, 9, 11],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
} as const;
export type Mode = keyof typeof MODES;

export type ZoneKey = 'home' | 'work' | 'how' | 'brand' | 'business' | 'about' | 'system';
export type Zone = {
  /** MIDI note of the tonic in the bass octave. */
  root: number;
  mode: Mode;
  /** Scale degrees (0 = I), one per bar, looped. */
  prog: number[];
  seed: number;
  /** How busy the bar is (0–1). */
  density: number;
  /** How open the filters are (0–1). */
  bright: number;
  flats?: boolean;
};

/** One motif per page: its key, its mode and its four bars. The page colour sets the mood. */
export const ZONES: Record<ZoneKey, Zone> = {
  home: { root: 38, mode: 'ionian', prog: [0, 4, 5, 3], seed: 11, density: 0.6, bright: 0.6 }, // D: I V vi IV
  work: { root: 43, mode: 'mixolydian', prog: [0, 6, 3, 0], seed: 23, density: 0.75, bright: 0.75 }, // G: I ♭VII IV I
  how: { root: 45, mode: 'dorian', prog: [0, 3, 0, 6], seed: 37, density: 0.55, bright: 0.5 }, // A: i IV i ♭VII
  brand: { root: 39, mode: 'lydian', prog: [0, 1, 0, 4], seed: 41, density: 0.5, bright: 0.7, flats: true }, // E♭: I II I V
  business: { root: 41, mode: 'ionian', prog: [5, 3, 0, 4], seed: 53, density: 0.65, bright: 0.55, flats: true }, // F: vi IV I V
  about: { root: 36, mode: 'ionian', prog: [0, 2, 5, 3], seed: 67, density: 0.45, bright: 0.45 }, // C: I iii vi IV
  system: { root: 38, mode: 'dorian', prog: [0, 0, 6, 6], seed: 71, density: 0.35, bright: 0.35 }, // D: i ♭VII
};

export type StyleId = 'marea' | 'circuito' | 'taller';
export type Style = { id: StyleId; bpm: number; swing: number; compose: (bar: number, zone: Zone) => NoteEvent[] };

/* ── theory ─────────────────────────────────────────────────────────────── */

/** Small seeded generator (mulberry32): the same seed gives the same music. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Semitones above the tonic of the scale degree `d` (any integer; it climbs octaves). */
export function degree(zone: Zone, d: number): number {
  const s = MODES[zone.mode];
  const o = Math.floor(d / 7);
  return s[((d % 7) + 7) % 7] + 12 * o;
}

/** The chord on degree `d`, stacked in thirds: root, third, fifth and (with `seventh`) the seventh. */
export function chord(zone: Zone, d: number, seventh = true): number[] {
  const tones = [d, d + 2, d + 4, ...(seventh ? [d + 6] : [])];
  return tones.map((t) => degree(zone, t));
}

/** Puts a pitch (semitones above the tonic) in the range [lo, hi) of MIDI notes. */
export function place(zone: Zone, semis: number, lo: number, hi: number): number {
  let n = zone.root + semis;
  while (n < lo) n += 12;
  while (n >= hi) n -= 12;
  return n;
}

/** Every pitch of the chord between lo and hi, low to high. */
export function spread(zone: Zone, tones: number[], lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let n = lo; n < hi; n++) if (tones.some((t) => (((n - zone.root - t) % 12) + 12) % 12 === 0)) out.push(n);
  return out;
}

const SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

/** «Dmaj7», «Bm7», «C7», «F♯m7♭5»: the name of the chord a bar plays. */
export function chordName(zone: Zone, d: number): string {
  const [r, t, f, s] = chord(zone, d);
  const third = t - r, fifth = f - r, sev = s - r;
  const name = (zone.flats ? FLAT : SHARP)[(zone.root + r) % 12];
  if (third === 4 && fifth === 7) return name + (sev === 11 ? 'maj7' : '7');
  if (third === 3 && fifth === 7) return name + 'm7';
  if (third === 3 && fifth === 6) return name + 'm7♭5';
  return name + (sev === 11 ? 'maj7♯5' : '+7');
}

export const barDegree = (zone: Zone, bar: number) => zone.prog[((bar % zone.prog.length) + zone.prog.length) % zone.prog.length];

/* ── the three proposals ────────────────────────────────────────────────── */

/** A: «Marea». Ambient: long pads, a rolling pluck that comes and goes like the sea, a slow wave of noise. */
const marea: Style = {
  id: 'marea', bpm: 70, swing: 0.5,
  compose(bar, z) {
    const d = barDegree(z, bar);
    const tones = chord(z, d);
    const ev: NoteEvent[] = [];
    for (const n of spread(z, tones, 50, 70)) ev.push({ voice: 'pad', beat: 0, dur: 4, midi: n, vel: 0.42 });
    ev.push({ voice: 'bass', beat: 0, dur: 3.5, midi: place(z, tones[0], 36, 48), vel: 0.55 });
    // the motif repeats every four bars and changes a little every eight
    const r = rng(z.seed * 1000 + (bar % 4) + (Math.floor(bar / 8) % 2) * 17);
    const pool = spread(z, tones, 62, 86);
    let k = Math.floor(r() * pool.length);
    for (let s = 0; s < 8; s++) {
      if (r() > z.density * 0.75) continue;
      k = (k + (r() < 0.75 ? 1 : 2)) % pool.length;
      ev.push({ voice: 'pluck', beat: s / 2, dur: 1.5, midi: pool[k], vel: 0.26 + r() * 0.14 });
    }
    if (bar % 2 === 0) ev.push({ voice: 'swell', beat: 0, dur: 8, midi: 0, vel: 0.22 });
    if (bar % 8 >= 2) for (let s = 0; s < 4; s++) if (r() < z.density * 0.7) ev.push({ voice: 'shaker', beat: s + 0.5, dur: 0.25, midi: 0, vel: 0.07 + r() * 0.05 });
    if (bar % 8 === 0) ev.push({ voice: 'chime', beat: 0, dur: 4, midi: pool[pool.length - 1] ?? 84, vel: 0.16 });
    return ev;
  },
};

/** B: «Circuito». Pulse: a sixteenth-note arpeggio that runs like code, eighth-note bass, soft kick and hats. */
const circuito: Style = {
  id: 'circuito', bpm: 108, swing: 0.5,
  compose(bar, z) {
    const d = barDegree(z, bar);
    const tones = chord(z, d);
    const ev: NoteEvent[] = [];
    for (const n of spread(z, tones, 55, 72)) ev.push({ voice: 'pad', beat: 0, dur: 4, midi: n, vel: 0.2 });
    // one pattern per page (up, up and down, or a walk), the same every bar so the ear can hold it
    const pr = rng(z.seed * 77);
    const pool = spread(z, tones, 60, 86);
    const shape = Math.floor(pr() * 3);
    const order: number[] = [];
    for (let s = 0; s < 16; s++) {
      if (shape === 0) order.push(s % pool.length);
      else if (shape === 1) { const span = pool.length * 2 - 2; const p = s % span; order.push(p < pool.length ? p : span - p); }
      else order.push(Math.floor(pr() * pool.length));
    }
    const gate = rng(z.seed * 131 + (bar % 2));
    for (let s = 0; s < 16; s++) {
      if (s % 4 !== 0 && gate() > 0.35 + z.density * 0.6) continue;
      ev.push({ voice: 'arp', beat: s / 4, dur: 0.22, midi: pool[order[s] % pool.length], vel: s % 4 === 0 ? 0.42 : 0.28 });
    }
    const root = place(z, tones[0], 33, 45);
    const r = rng(z.seed * 501 + (bar % 4));
    for (let s = 0; s < 8; s++) ev.push({ voice: 'bass', beat: s / 2, dur: 0.4, midi: s % 2 && r() < 0.35 ? root + 12 : root, vel: s % 2 ? 0.34 : 0.46 });
    const breath = bar % 16 === 15;
    if (!breath) for (const b of [0, 2]) ev.push({ voice: 'kick', beat: b, dur: 0.5, midi: 0, vel: 0.5 });
    if (bar % 4 === 3 && !breath) ev.push({ voice: 'kick', beat: 3.5, dur: 0.5, midi: 0, vel: 0.36 });
    for (let s = 0; s < 4; s++) ev.push({ voice: 'hat', beat: s + 0.5, dur: 0.1, midi: 0, vel: 0.16 });
    for (let s = 0; s < 16; s++) if (s % 2 && r() < z.density * 0.35) ev.push({ voice: 'hat', beat: s / 4, dur: 0.05, midi: 0, vel: 0.06 });
    return ev;
  },
};

/** C: «Taller». Lo-fi keys: electric-piano sevenths, a walking bass, a short melody and brushes, swung. */
const taller: Style = {
  id: 'taller', bpm: 82, swing: 0.62,
  compose(bar, z) {
    const d = barDegree(z, bar);
    const next = barDegree(z, bar + 1);
    const tones = chord(z, d);
    const ev: NoteEvent[] = [];
    const voicing = spread(z, tones, 55, 75);
    for (const n of voicing) ev.push({ voice: 'keys', beat: 0, dur: 1.6, midi: n, vel: 0.36 });
    const r = rng(z.seed * 997 + (bar % 4));
    if (r() < 0.4 + z.density * 0.5) for (const n of voicing) ev.push({ voice: 'keys', beat: 2.5, dur: 1, midi: n, vel: 0.26 });
    // walking bass: root, a chord tone, another, then a half step into the next root
    const lo = 36, hi = 50;
    const b0 = place(z, tones[0], lo, hi);
    const b1 = place(z, r() < 0.5 ? tones[1] : tones[2], lo, hi);
    const b2 = place(z, r() < 0.5 ? tones[2] : degree(z, d + 5), lo, hi);
    const target = place(z, degree(z, next), lo, hi);
    const b3 = target + (r() < 0.5 ? -1 : 1);
    [b0, b1, b2, b3].forEach((n, i) => ev.push({ voice: 'bass', beat: i, dur: 0.9, midi: n, vel: i === 0 ? 0.5 : 0.42 }));
    // a short melody from the pentatonic of the mode, repeated every four bars
    const m = rng(z.seed * 313 + (bar % 4));
    const penta = [0, 1, 2, 4, 5];
    const slots = [0.5, 1, 1.5, 2, 3, 3.5];
    const count = bar % 4 === 3 ? 1 : 2 + Math.floor(m() * 2);
    const picked = slots.filter(() => m() < count / slots.length + 0.1).slice(0, count);
    for (const s of picked) ev.push({ voice: 'lead', beat: s, dur: 0.75, midi: place(z, degree(z, penta[Math.floor(m() * penta.length)] + 7 * Math.floor(m() * 2)), 67, 86), vel: 0.3 + m() * 0.1 });
    ev.push({ voice: 'kick', beat: 0, dur: 0.5, midi: 0, vel: 0.42 }, { voice: 'kick', beat: 2.5, dur: 0.5, midi: 0, vel: 0.3 });
    ev.push({ voice: 'brush', beat: 1, dur: 0.3, midi: 0, vel: 0.26 }, { voice: 'brush', beat: 3, dur: 0.3, midi: 0, vel: 0.26 });
    for (let s = 0; s < 8; s++) ev.push({ voice: 'hat', beat: s / 2, dur: 0.06, midi: 0, vel: s % 2 ? 0.07 : 0.1 });
    return ev;
  },
};

export const STYLES: Record<StyleId, Style> = { marea, circuito, taller };
export const STYLE_IDS = Object.keys(STYLES) as StyleId[];

/** Where a beat really falls: swung styles push the off-beat eighths late. */
export function swingBeat(beat: number, swing: number): number {
  const whole = Math.floor(beat);
  const frac = beat - whole;
  return Math.abs(frac - 0.5) < 1e-6 ? whole + swing : beat;
}
