import { barDegree, chord, type NoteEvent, place, spread, STYLES, type Voice, ZONES, type ZoneKey } from '@/v2/sound/compose';
import { BAR, BEAT, dotTrack, SHOTS, TOTAL } from './film';
import script from './script.json';

/**
 * The soundtrack of «Conocer a Ignacio» (lote 8.3): written for the film, bar by bar, on the same 36 bars and the
 * same clock. Pure: the same notes every time, in film seconds; the engine plays them against the film
 * (`MusicEngine.playScore`) and tests render them offline.
 *
 * It is «Circuito», the sound of the site (108 bpm, the tempo of the film), with a key per chapter and layers that
 * come in and go out with the story: a pad alone in Mar del Plata, a pulse when the games website builds itself,
 * the arpeggio on the first hit (bar 5), the bass on Ada ITW, a breath before AI and a hit for CompliA (13), the
 * six lanes of the own path as six notes and a hit with a new key (21), one stab per project, eleven notes for
 * eleven agents, a silence and a bell at the human gate, the last hit (33) and a chord that stays ringing.
 * Every landing of the dot is a small pluck, on the beat where it lands.
 */
export type ScoreEvent = { t: number; ev: NoteEvent; bright: number };
export type Score = { bpm: number; length: number; gain: number; events: ScoreEvent[] };

type Layer = 'pad' | 'arp' | 'bass' | 'kick' | 'hat';
/** the key of each chapter: its motif from the site's pages */
export const CHAPTER_ZONE: Record<string, ZoneKey> = { origen: 'about', frentes: 'work', tsoft: 'work', propio: 'business', sistema: 'how', cierre: 'home' };
const ALL: Layer[] = ['pad', 'arp', 'bass', 'kick', 'hat'];
/** which voices of «Circuito» play in each bar (1-based) */
export function layers(bar: number): Layer[] {
  if (bar <= 2) return ['pad'];
  if (bar <= 4) return ['pad', 'hat'];
  if (bar <= 6) return ['pad', 'arp', 'kick', 'hat'];
  if (bar === 12) return ['pad', 'bass'];
  if (bar === 20) return ['pad'];
  if (bar === 29 || bar === 30) return ['pad', 'bass', 'hat'];
  if (bar === 31 || bar === 32) return ['pad'];
  if (bar >= 35) return [];
  return ALL;
}
const VOICE_LAYER: Partial<Record<Voice, Layer>> = { pad: 'pad', arp: 'arp', bass: 'bass', kick: 'kick', hat: 'hat' };
export const chapterOfBar = (bar: number) => script.chapters.find((c) => bar >= c.bars[0] && bar < c.bars[0] + c.bars[1])!.id;
export const zoneOfBar = (bar: number) => ZONES[CHAPTER_ZONE[chapterOfBar(bar)]];
/** the beat (from the start of the film) where a shot starts */
const shotBeat = (id: string) => (SHOTS.find((s) => s.id === id)!.bars[0] - 1) * 4;

export function buildScore(): Score {
  const out: ScoreEvent[] = [];
  const at = (beat: number, ev: Omit<NoteEvent, 'beat'>, bright: number) => out.push({ t: beat * BEAT, ev: { ...ev, beat: 0 }, bright });
  for (let bar = 1; bar <= script.bars; bar++) {
    const z = zoneOfBar(bar), lay = layers(bar), b0 = (bar - 1) * 4;
    // the motif of the chapter starts again at each chapter: its first bar is the first chord
    const local = bar - script.chapters.find((c) => c.id === chapterOfBar(bar))!.bars[0];
    for (const ev of STYLES.circuito.compose(local, z)) {
      const l = VOICE_LAYER[ev.voice];
      if (!l || !lay.includes(l)) continue;
      const soft = bar <= 2 ? 0.8 : 1;
      at(b0 + ev.beat, { ...ev, vel: ev.vel * soft }, z.bright);
    }
  }
  const tonesAt = (beat: number) => { const bar = Math.floor(beat / 4) + 1, z = zoneOfBar(bar); return { z, tones: chord(z, barDegree(z, bar - script.chapters.find((c) => c.id === chapterOfBar(bar))!.bars[0])) }; };
  // the hits: a swell under the first beat and a low bell
  for (const d of script.drops) {
    const { z, tones } = tonesAt((d - 1) * 4);
    at((d - 1) * 4 - 1, { voice: 'swell', dur: 2, midi: 0, vel: 0.34 }, z.bright);
    at((d - 1) * 4, { voice: 'chime', dur: 4, midi: place(z, tones[0], 60, 72), vel: 0.22 }, z.bright);
  }
  // the dot: a small pluck on every landing, walking up the chord
  dotTrack('w').slice(1).forEach((s, i) => {
    const beat = s.t / BEAT, { z, tones } = tonesAt(beat);
    at(beat, { voice: 'pluck', dur: 1, midi: place(z, tones[i % 3], 72, 84), vel: s.tap ? 0.4 : 0.22 }, z.bright);
  });
  // the click on «Jugar», the last beat before the first hit
  { const { z, tones } = tonesAt(15); at(15, { voice: 'chime', dur: 2, midi: place(z, tones[0], 79, 91), vel: 0.3 }, z.bright); }
  // the own path: six lanes, six notes (they draw at 0.3 + i·0.25 beats)
  { const b = shotBeat('own'), { z, tones } = tonesAt(b), pool = spread(z, chord(z, 0), 67, 91);
    for (let i = 0; i < 6; i++) at(b + 0.3 + i * 0.25, { voice: 'pluck', dur: 1.2, midi: pool[i % pool.length], vel: 0.3 }, z.bright); }
  // one stab per project, on its first beat
  for (const id of ['volta', 'velmar', 'dentalos', 'kinetic', 'games']) {
    const b = shotBeat(id), { z, tones } = tonesAt(b);
    for (const n of spread(z, tones, 60, 76)) at(b, { voice: 'keys', dur: 0.9, midi: n, vel: 0.3 }, z.bright);
  }
  // eleven agents, eleven notes: each icon arrives at 1.5 + i·0.5 beats
  { const b = shotBeat('agents'), { z, tones } = tonesAt(b), pool = spread(z, tones, 64, 90);
    for (let i = 0; i < 11; i++) at(b + 1.5 + i * 0.5, { voice: 'arp', dur: 0.3, midi: pool[i % pool.length], vel: 0.34 }, z.bright); }
  // the human gate: the dot walks six stations (a note each), a silence, and the approval is a bell on «Publicar»
  { const b = shotBeat('gate'), { z, tones } = tonesAt(b), pool = spread(z, tones, 62, 86);
    for (let i = 0; i < 6; i++) at(b + i * 0.5, { voice: 'pluck', dur: 0.6, midi: pool[i % pool.length], vel: 0.28 }, z.bright);
    at(b + 6, { voice: 'chime', dur: 6, midi: place(z, tones[0], 72, 84), vel: 0.36 }, z.bright);
    at(b + 6, { voice: 'chime', dur: 6, midi: place(z, tones[2], 76, 88), vel: 0.26 }, z.bright); }
  // the end: the dot lands in the «i» and a chord stays ringing until the film is over
  { const b = shotBeat('end'), z = ZONES.home, tones = chord(z, 0);
    for (const n of spread(z, tones, 50, 74)) at(b, { voice: 'pad', dur: 8, midi: n, vel: 0.34 }, z.bright);
    at(b, { voice: 'bass', dur: 6, midi: place(z, tones[0], 33, 45), vel: 0.5 }, z.bright);
    [0, 1, 2].forEach((k, i) => at(b + i * 0.25, { voice: 'chime', dur: 6, midi: place(z, tones[k], 74, 86), vel: 0.3 }, z.bright)); }
  out.sort((a, b) => a.t - b.t);
  return { bpm: script.bpm, length: TOTAL, gain: 1.15, events: out.filter((e) => e.t < TOTAL - 0.01) };
}

/** The bar a moment of the film is in (1-based), and how long a bar lasts: for the tests and the player. */
export const barAt = (t: number) => Math.min(script.bars, Math.floor(t / BAR) + 1);
