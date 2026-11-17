import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';
import { COUNTS, ROADMAP, STAGES, itemsOf, monthRange, statusOf } from '../../lib/roadmap';

const media = join(__dirname, '../../public/media/roadmap');
const svg = readFileSync(join(media, 'roadmap.svg'), 'utf8');
const data = JSON.parse(readFileSync(join(media, 'roadmap.json'), 'utf8')) as { frames: Record<string, number[]>; items: Record<string, number[]> };

type Item = { name?: string; what?: string; tech?: string; exit?: string; opens?: string };
const day = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / 864e5;

describe('the roadmap (lib/roadmap.ts)', () => {
  it('56 pieces in order, four stages, no gaps and no overlaps: each starts the day after the previous ends', () => {
    expect(ROADMAP).toHaveLength(56);
    expect(new Set(ROADMAP.map((i) => i.id)).size).toBe(56);
    expect(STAGES.map((s) => itemsOf(s).length).reduce((a, b) => a + b, 0)).toBe(56);
    ROADMAP.forEach((it, i) => {
      if (i) expect(day(it.from) - day(ROADMAP[i - 1].to), it.id).toBe(1);
      expect(day(it.to) - day(it.from) + 1, `${it.id} weeks`).toBe(it.weeks * 7);
    });
    expect(ROADMAP[0].from).toBe('2026-11-16');
    expect(ROADMAP[55].to).toBe('2030-08-18');
    expect(COUNTS).toEqual({ p: 27, w: 12, c: 7 });
  });
  it('stages follow the story: core, cybersecurity, quant, aerospace, in that order', () => {
    const seen = ROADMAP.map((i) => i.stage);
    expect(seen).toEqual([...seen].sort((a, b) => STAGES.indexOf(a) - STAGES.indexOf(b)));
  });
  it('everything is planned except P0, which is under way', () => {
    for (const it of ROADMAP) expect(statusOf(it), it.id).toBe(it.id === 'p0' ? 'desarrollo' : 'planeado');
  });
  it('the proposals and the cuttable ones are the ones the plan marks', () => {
    expect(ROADMAP.filter((i) => i.proposed).map((i) => i.id)).toEqual(['p8', 'p9', 'q2', 'q6', 'a6']);
    expect(ROADMAP.filter((i) => i.cut).map((i) => i.id).sort()).toEqual(['a3', 'a6']);
  });
  it('copy in both languages for every piece, a way out for each maths window, a technology for each project', () => {
    for (const m of [es, en]) {
      const items = m.roadmap.items as unknown as Record<string, Item>;
      for (const it of ROADMAP) {
        const x = items[it.id];
        expect(x?.name && x.what, it.id).toBeTruthy();
        if (it.kind === 'window') expect(x.opens, it.id).toBeTruthy();
        if (it.kind === 'project' && it.id !== 'p0') expect(x.tech, it.id).toBeTruthy();
      }
      for (const s of STAGES) expect((m.roadmap.st as Record<string, { name: string; when: string; text: string }>)[s]?.text, s).toBeTruthy();
    }
    for (const it of ROADMAP.filter((i) => i.kind === 'window' && i.id !== 'wa2' && i.id !== 'wa3' && i.id !== 'wa4' && i.id !== 'wa5' && i.id !== 'wq3')) {
      expect((es.roadmap.items as unknown as Record<string, Item>)[it.id].exit, it.id).toBeTruthy();
    }
  });
  it('no prices and no exam codes anywhere in the copy', () => {
    for (const m of [es, en]) expect(JSON.stringify(m.roadmap)).not.toMatch(/US\$|USD|\$\s?\d|SY0-|\b\d{3}\b dólares/i);
  });
  it('months and years, the year once when both ends share it', () => {
    expect(monthRange('2028-02-07', '2028-08-13', 'es')).toBe('feb – ago 2028');
    expect(monthRange('2026-11-30', '2027-01-03', 'es')).toBe('nov 2026 – ene 2027');
    expect(monthRange('2026-11-16', '2026-11-29', 'es')).toBe('nov 2026');
    expect(monthRange('2028-02-07', '2028-08-13', 'en')).toBe('Feb – Aug 2028');
  });
});

describe('the roadmap drawing (scripts/roadmap/build.mjs)', () => {
  it('has every piece once, in its stage, and the camera has a frame for each stage and each piece', () => {
    for (const it of ROADMAP) {
      expect((svg.match(new RegExp(`data-item="${it.id}" data-stage="${it.stage}"`, 'g')) ?? []).length, it.id).toBe(1);
      expect(data.items[it.id], it.id).toHaveLength(4);
    }
    for (const s of STAGES) expect(data.frames[s], s).toHaveLength(4);
  });
  it('is light, and wire only where nothing is built', () => {
    expect(svg.length).toBeLessThan(450_000);
    expect(svg).not.toMatch(/<script|<foreignObject|href="http/i);
    expect((svg.match(/class="rm-wire"/g) ?? []).length).toBe(ROADMAP.filter((i) => i.kind === 'project').length);
  });
});
