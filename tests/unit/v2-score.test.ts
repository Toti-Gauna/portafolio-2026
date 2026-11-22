import { describe, expect, it } from 'vitest';
import { MODES, ZONES } from '../../v2/sound/compose';
import { BEAT, dotTrack, SHOTS, TOTAL } from '../../v2/trailer/film';
import { buildScore, CHAPTER_ZONE, chapterOfBar, layers, zoneOfBar } from '../../v2/trailer/score';
import script from '../../v2/trailer/script.json';
import { readFileSync } from 'node:fs';

/** The soundtrack of the trailer (lote 8.3): written for the film, on its bars and its clock. */
const score = buildScore();
const near = (t: number, voice: string, eps = 1e-6) => score.events.filter((e) => e.ev.voice === voice && Math.abs(e.t - t) < eps);
const beatOf = (id: string) => (SHOTS.find((s) => s.id === id)!.bars[0] - 1) * 4;
const barOf = (t: number) => Math.floor(t / (BEAT * 4)) + 1;

describe('v2 trailer soundtrack (lote 8.3)', () => {
  it('one clock: the tempo of the film, every note inside its 80 seconds, in order', () => {
    expect(score.bpm).toBe(script.bpm);
    expect(score.length).toBeCloseTo(TOTAL, 6);
    expect(score.events.length).toBeGreaterThan(600);
    for (let i = 0; i < score.events.length; i++) {
      const e = score.events[i];
      expect(e.t).toBeGreaterThanOrEqual(0);
      expect(e.t).toBeLessThan(TOTAL);
      if (i) expect(e.t).toBeGreaterThanOrEqual(score.events[i - 1].t);
      expect(e.ev.vel).toBeGreaterThan(0);
      expect(e.ev.vel).toBeLessThanOrEqual(0.6);
    }
  });

  it('the layers follow the story: a pad alone at first, a breath before AI, the air of the own path, the gate, the end', () => {
    const voicesIn = (bar: number) => new Set(score.events.filter((e) => barOf(e.t) === bar).map((e) => e.ev.voice));
    expect(layers(1)).toEqual(['pad']);
    for (const bar of [1, 2]) for (const v of ['kick', 'arp', 'bass']) expect(voicesIn(bar).has(v as never), `${bar} ${v}`).toBe(false);
    expect(voicesIn(5).has('arp')).toBe(true);
    expect(voicesIn(5).has('bass')).toBe(false);
    expect(voicesIn(7).has('bass')).toBe(true);
    for (const v of ['kick', 'arp', 'hat']) expect(voicesIn(12).has(v as never), `12 ${v}`).toBe(false);
    expect(voicesIn(13).has('kick')).toBe(true);
    expect(voicesIn(20).has('kick')).toBe(false);
    expect(voicesIn(31).has('kick')).toBe(false);
    expect(voicesIn(33).has('kick')).toBe(true);
    expect(voicesIn(36).size).toBe(0);
  });

  it('the hits fall where the film hits, and the dot is heard on every landing', () => {
    for (const d of script.drops) {
      expect(near((d - 1) * 4 * BEAT, 'chime').length, `drop ${d}`).toBeGreaterThan(0);
      expect(near(((d - 1) * 4 - 1) * BEAT, 'swell').length, `drop ${d}`).toBe(1);
    }
    for (const s of dotTrack('w').slice(1)) expect(near(s.t, 'pluck').length, `landing at ${s.t}`).toBeGreaterThan(0);
    // the click on «Jugar», the last beat of bar 4
    expect(near(15 * BEAT, 'chime').length).toBe(1);
    // one stab per project, eleven notes for eleven agents, and the bell of the human gate on «Publicar»
    for (const id of ['volta', 'velmar', 'dentalos', 'kinetic', 'games']) expect(near(beatOf(id) * BEAT, 'keys').length, id).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < 11; i++) expect(near((beatOf('agents') + 1.5 + i * 0.5) * BEAT, 'arp').length, `agent ${i}`).toBe(1);
    expect(near((beatOf('gate') + 6) * BEAT, 'chime').length).toBe(2);
    // the last chord starts as the dot lands in the «i» and lasts to the end of the film
    const pads = near(beatOf('end') * BEAT, 'pad');
    expect(pads.length).toBeGreaterThanOrEqual(3);
    for (const p of pads) expect(beatOf('end') * BEAT + p.ev.dur * BEAT).toBeGreaterThanOrEqual(TOTAL - 0.01);
  });

  it('a key per chapter: every pitched note is in the mode of its chapter', () => {
    expect(Object.keys(CHAPTER_ZONE)).toEqual(script.chapters.map((c) => c.id));
    for (const e of score.events) {
      if (!e.ev.midi || ['kick', 'hat', 'swell', 'brush', 'shaker'].includes(e.ev.voice)) continue;
      const bar = barOf(e.t), z = bar >= 35 ? ZONES.home : zoneOfBar(bar);
      const pc = (((e.ev.midi - z.root) % 12) + 12) % 12;
      expect((MODES[z.mode] as readonly number[]).includes(pc), `${e.ev.voice} ${e.ev.midi} at bar ${bar} (${chapterOfBar(bar)})`).toBe(true);
    }
  });

  it('the engine plays it against the film and the film follows it', () => {
    const engine = readFileSync('v2/sound/engine.ts', 'utf8');
    expect(engine).toMatch(/playScore\(score: Score, from: number/);
    expect(engine).toMatch(/scoreTime\(\): number \| null/);
    const film = readFileSync('v2/components/trailer/Film.tsx', 'utf8');
    expect(film).toMatch(/audioClock\?\.\(\)/);
    const player = readFileSync('v2/components/trailer/useSoundtrack.ts', 'utf8');
    // the context is made inside the click, and the site's music waits while the trailer sounds
    expect(player).toMatch(/new C\(/);
    expect(player).toMatch(/MUSIC_HOLD/);
  });
});
