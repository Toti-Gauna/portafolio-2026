import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';
import { BUILDINGS, STATIONS } from '../../lib/career';
import { CASE_SLUGS } from '../../lib/cases';

const media = join(__dirname, '../../public/media/camino');
const svg = readFileSync(join(media, 'camino.svg'), 'utf8');
const data = JSON.parse(readFileSync(join(media, 'camino.json'), 'utf8')) as {
  stops: Record<string, number>;
  frames: Record<string, number[]>;
  buildings: Record<string, number[]>;
  journey: number[][];
  depth: number[];
};

type B = { name?: string; text?: string; state?: string; facts?: { k: string; v: string }[] };

describe('the path (lib/career.ts, scripts/camino/build.mjs)', () => {
  it('six stations in the order of the story, every building once, in the right station', () => {
    expect(STATIONS.map((s) => s.id)).toEqual(['origin', 'tach', 'ada', 'tsoft', 'own', 'next']);
    const ids = BUILDINGS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(21);
  });
  it('copy in both languages for every station and building, with facts only where a case backs them', () => {
    for (const m of [es, en]) {
      const c = m.career as unknown as { st: Record<string, { name: string; when: string }>; b: Record<string, B> };
      for (const s of STATIONS) expect(c.st[s.id]?.name && c.st[s.id]?.when, s.id).toBeTruthy();
      for (const b of BUILDINGS) {
        const x = c.b[b.id];
        expect(x?.name && x.text, b.id).toBeTruthy();
        if (b.slug) expect(x.facts?.length, b.id).toBeGreaterThan(0);
        else expect(x.facts, b.id).toBeUndefined();
        if (!b.status) expect(x.state, b.id).toBeTruthy();
      }
    }
  });
  it('a case link only goes to a case that exists; the roadmap is planned, has no case and sits in the last station', () => {
    for (const b of BUILDINGS) if (b.slug) expect(CASE_SLUGS as readonly string[]).toContain(b.slug);
    const next = STATIONS.find((s) => s.id === 'next')!;
    expect(next.buildings.map((b) => b.id)).toEqual(['core', 'cyber', 'quant', 'space']);
    for (const b of next.buildings) {
      expect(b.status, b.id).toBe('planeado');
      expect(b.slug, b.id).toBeUndefined();
    }
    expect(BUILDINGS.filter((b) => b.status === 'planeado').every((b) => b.station === 'next')).toBe(true);
  });
  it('statuses are the approved ones: HandyX is an MVP, Lucero a demo, Eclipse in development, CompliA in internal production', () => {
    const st = Object.fromEntries(BUILDINGS.map((b) => [b.id, b.status]));
    expect(st).toMatchObject({ handyx: 'mvp', lucero: 'demo', eclipse: 'desarrollo', complia: 'produccion', supernova: 'prototipo', games: 'banco' });
  });
  it('the drawing has every building once, grouped in its station, and the camera has a frame and a stop for each station', () => {
    for (const b of BUILDINGS) {
      expect((svg.match(new RegExp(`data-building="${b.id}" data-station="${b.station}"`, 'g')) ?? []).length, b.id).toBe(1);
      expect(data.buildings[b.id], b.id).toHaveLength(4);
    }
    for (const s of STATIONS) {
      expect(data.frames[s.id], s.id).toHaveLength(4);
      expect(data.stops[s.id], s.id).toBeGreaterThanOrEqual(0);
    }
    const stops = STATIONS.map((s) => data.stops[s.id]);
    expect(stops, 'the handcar only goes forward').toEqual([...stops].sort((a, b) => a - b));
  });
  it('the journey is a continuous line the handcar can follow, and depth is known along it', () => {
    expect(data.depth).toHaveLength(data.journey.length);
    for (let i = 1; i < data.journey.length; i++) {
      expect(data.journey[i][3]).toBeGreaterThan(data.journey[i - 1][3]);
      expect(Math.hypot(data.journey[i][0] - data.journey[i - 1][0], data.journey[i][1] - data.journey[i - 1][1]), `step ${i}`).toBeLessThan(40);
    }
    const last = data.journey[data.journey.length - 1][3];
    for (const s of STATIONS) expect(data.stops[s.id]).toBeLessThanOrEqual(last);
  });
  it('the drawing is light enough and has its handcar in both orientations', () => {
    expect(svg.length).toBeLessThan(450_000);
    expect(svg).toContain('data-car="x"');
    expect(svg).toContain('data-car="y"');
    expect(svg).not.toMatch(/<script|<foreignObject|href="http/i);
  });
});
