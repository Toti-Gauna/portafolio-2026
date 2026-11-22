import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import notes from '../../design/v2/trailer/notes.json';
import homeEs from '../../messages/v2/es.json';
import es from '../../messages/v2/trailer/es.json';
import en from '../../messages/v2/trailer/en.json';
import aboutEs from '../../messages/v2/about/es.json';
import { CASES, type CaseSlug } from '../../v2/components/case/cases';
import { STAMP_IDS } from '../../v2/components/kit/stamps';
import { AGENTS, STATIONS } from '../../v2/components/how/flow';
import script from '../../v2/trailer/script.json';

/** The script of the trailer «Conocer a Ignacio» of /v2 (lote 8.1): 60 to 90 seconds on a grid of bars, a chapter per
 *  front and per project, words that can be read in time, and every fact from the approved record. */
type Shot = { id: string; chapter: string; bars: number[]; theme: string; cues: Record<string, number>; case?: string; stamp?: string; show?: string[]; media?: string; media2?: string; clip?: string; count?: { to: number; key: string } };
const shots = script.shots as unknown as Shot[];
const COPY = { es, en } as const;
const VOICE = { es: /\b(sin|no|nunca|todavía|falta|pendiente)\b/i, en: /\b(no|not|never|without|yet|missing|lack)\b|n't\b/i };
const beat = 60 / script.bpm, bar = beat * script.beatsPerBar;
const words = (s: string) => s.split(/\s+/).filter((x) => /[\p{L}\d]/u.test(x)).length;
const strings = (o: unknown): string[] => typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(strings) : o && typeof o === 'object' ? Object.values(o).flatMap(strings) : [];
const keys = (o: unknown, p = ''): string[] => Array.isArray(o) ? [`${p}[${o.length}]`] : o && typeof o === 'object' ? Object.entries(o).flatMap(([k, v]) => keys(v, `${p}.${k}`)) : [p];
const verbsOf = (l: 'es' | 'en', slug: string): string[] => JSON.parse(readFileSync(`messages/v2/cases/${l}/${slug}.json`, 'utf8')).film.verbs;
/** what a viewer has to read in a shot: its name, its sentences, its pills, its verbs and its number */
const reading = (s: Shot, l: 'es' | 'en') => {
  const c = COPY[l].shots[s.id as keyof typeof es.shots] as Record<string, string | string[]>;
  const list = ['name', 'line', 'fact', 'after', 'pills', 'count'].flatMap((k) => c[k] ?? []);
  if (s.show?.includes('verbs')) list.push(...verbsOf(l, s.case!));
  if (s.count) list.push(String(s.count.to));
  return list.join(' ');
};

describe('v2 trailer script (lote 8.1)', () => {
  it('60 to 90 seconds on a grid: the shots fill the 36 bars in order, inside their chapters, and the music hits where a shot starts', () => {
    const total = script.bars * bar;
    expect(total).toBeGreaterThanOrEqual(60);
    expect(total).toBeLessThanOrEqual(90);
    let next = 1;
    for (const s of shots) { expect(s.bars[0], s.id).toBe(next); next += s.bars[1]; }
    expect(next - 1).toBe(script.bars);
    next = 1;
    for (const c of script.chapters) {
      expect(c.bars[0], c.id).toBe(next); next += c.bars[1];
      const mine = shots.filter((s) => s.chapter === c.id);
      expect(mine.length, c.id).toBeGreaterThan(0);
      expect(mine[0].bars[0]).toBe(c.bars[0]);
      expect(mine.at(-1)!.bars[0] + mine.at(-1)!.bars[1]).toBe(c.bars[0] + c.bars[1]);
    }
    expect(next - 1).toBe(script.bars);
    for (const d of script.drops) { expect(shots.some((s) => s.bars[0] === d), `drop ${d}`).toBe(true); expect((d - 1) % 4, `drop ${d} opens a phrase`).toBe(0); }
    // every part enters inside its shot
    for (const s of shots) for (const [k, b] of Object.entries(s.cues)) expect(b, `${s.id}.${k}`).toBeLessThan(s.bars[1] * script.beatsPerBar);
  });

  it('a chapter per front and per project: every front of the record and the six own projects have their shot', () => {
    expect(script.chapters.map((c) => c.id)).toEqual(['origen', 'frentes', 'tsoft', 'propio', 'sistema', 'cierre']);
    const ids = shots.map((s) => s.id);
    for (const id of ['tach', 'ada', 'tuenti', 'complia', 'supernova', 'eclipse', 'volta', 'velmar', 'dentalos', 'kinetic', 'games']) expect(ids, id).toContain(id);
    for (const s of shots.filter((x) => x.chapter === 'tsoft' && x.case)) expect(CASES[s.case as CaseSlug].stop).toBe('tsoft');
    for (const s of shots.filter((x) => x.chapter === 'propio' && x.case)) expect(CASES[s.case as CaseSlug].stop).not.toBe('tsoft');
    // the stamps sealed on the way are the six of the kit, once each
    expect(shots.map((s) => s.stamp).filter(Boolean).sort()).toEqual([...STAMP_IDS].sort());
  });

  it('the words: same keys, a positive voice, challenges and not job titles, and time to read every shot', () => {
    expect(keys(en)).toEqual(keys(es));
    expect(Object.keys(es.shots)).toEqual(shots.map((s) => s.id));
    expect(Object.keys(notes.shots)).toEqual(shots.map((s) => s.id));
    expect(Object.keys(es.chapters)).toEqual(script.chapters.map((c) => c.id));
    for (const l of ['es', 'en'] as const) {
      for (const t of strings(COPY[l])) { expect(t, l).not.toMatch(VOICE[l]); expect(t, l).not.toMatch(/vibe coding|handyx|developer|desarrollador|\bsr\b|senior|\bjr\b/i); }
      for (const s of shots) expect(words(reading(s, l)) / (s.bars[1] * bar), `${l} ${s.id}: ${reading(s, l)}`).toBeLessThanOrEqual(3);
    }
    for (const t of strings(notes)) expect(t).not.toMatch(/vibe coding|handyx/i);
  });

  it('every fact is the record: dates, verbs, states, clips and the two numbers', () => {
    // the fronts, as the sheet of «Sobre mí» dates them
    expect(aboutEs.sheet.rows.before.v).toContain(`TACH Argentina (${es.shots.tach.when})`);
    expect(aboutEs.sheet.rows.before.v).toContain(`Ada ITW (${es.shots.ada.when})`);
    expect(aboutEs.timeline.stops.seed.text[0]).toContain('una web de juegos');
    expect(aboutEs.timeline.stops.tach.text[0]).toMatch(/backoffice, la landing y la app de una billetera virtual/);
    expect(aboutEs.timeline.stops.ai.text[0]).toMatch(/Diseñé y construí CompliA/);
    expect(aboutEs.story.beats.join(' ')).toContain('Me mueven los desafíos nuevos');
    // what a case shows is its own: three verbs, a state and a clip that exists
    for (const s of shots.filter((x) => x.case)) {
      const c = CASES[s.case as CaseSlug];
      expect(c, s.id).toBeTruthy();
      if (s.show?.includes('verbs')) for (const l of ['es', 'en'] as const) expect(verbsOf(l, s.case!)).toHaveLength(3);
      if (s.show?.includes('state')) expect(homeEs.ui.status[c.status as keyof typeof homeEs.ui.status]).toBeTruthy();
      for (const m of [s.media, s.media2, s.clip]) if (m) expect(existsSync(`public${m}`), m).toBe(true);
      if (s.media && s.id !== 'eclipse') expect([c.film.poster, c.film.src]).toContain(s.media);
    }
    // Tuenti: the drawn illustration, never a capture
    expect(shots.find((s) => s.id === 'tuenti')!.media).toBe('/media/tuenti-cover.svg');
    // the numbers: the tests of Eclipse as the home says them, with their date, and the agents
    const tests = homeEs.home.stats.items.find((i) => i.u === 'tests')!;
    expect(shots.find((s) => s.id === 'eclipse')!.count!.to).toBe(Number(tests.n.replace('.', '')));
    expect(tests.d).toContain(es.shots.eclipse.date.match(/\d+\/\d+\/\d+/)![0]);
    expect(shots.find((s) => s.id === 'agents')!.count!.to).toBe(AGENTS.length);
    expect(STATIONS).toHaveLength(7);
  });

  it('the storyboard: a note for every shot and the seven things the plan asks of the film', () => {
    for (const n of Object.values(notes.shots)) for (const k of ['see', 'move', 'sound', 'tall', 'src'] as const) expect(n[k].length).toBeGreaterThan(8);
    expect(Object.keys(notes.chapters)).toEqual(script.chapters.map((c) => c.id));
    const frames = readFileSync('design/v2/trailer/frames.ts', 'utf8');
    for (const part of ['f-pill', 'f-glass', 'data-count', 'f-stamp', 'f-dot', 'f-tag']) expect(frames).toContain(part);
    for (const s of shots) expect(frames, s.id).toContain(`'${s.id}'`);
    for (const t of new Set(shots.map((s) => s.theme))) expect(frames, t).toContain(`[data-theme=${t}]`);
  });
});
