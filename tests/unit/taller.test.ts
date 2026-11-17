import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';
import { CHAPTERS, SCENE_WIDTHS, sceneSrc } from '../../lib/taller';

const pub = join(__dirname, '../../public');
type Ch = { heading?: string; text?: string; cta?: string; alt: string; title: string; items?: string[] };

describe('home walk (lib/taller.ts)', () => {
  it('eleven chapters, the text zigzags with the building', () => {
    expect(CHAPTERS).toHaveLength(11);
    CHAPTERS.forEach((c, i) => {
      if (i > 0) expect(c.building, c.key).not.toBe(CHAPTERS[i - 1].building);
    });
  });
  it('every scene exists in every width and every camera video exists', () => {
    CHAPTERS.forEach((c, i) => {
      for (const w of SCENE_WIDTHS) expect(existsSync(join(pub, sceneSrc(i, w))), `${c.key} ${w}`).toBe(true);
      if (c.next) expect(existsSync(join(pub, `media/taller/${c.next}.mp4`)), c.next).toBe(true);
      if (c.next) expect(c.next, c.key).toBe(`t-${i}-${i + 1}`);
    });
  });
  it('every chapter has its copy in both languages, a button only when its page exists, items with a status', () => {
    for (const m of [es, en]) {
      const ch = m.taller.ch as Record<string, Ch>;
      for (const c of CHAPTERS) {
        const x = ch[c.key];
        expect(x?.title && x.alt, c.key).toBeTruthy();
        if (c.key !== 'hero') expect(x.heading && x.text, c.key).toBeTruthy();
        if (c.href) expect(x.cta, c.key).toBeTruthy();
        if (c.items) expect(x.items, c.key).toHaveLength(c.items.length);
      }
      expect(m.taller.credit).toMatch(/GPT Image/);
      expect(m.taller.credit).toMatch(/Higgsfield/);
    }
  });

  describe('references over the scenes (Ola 4)', () => {
    const inside = (x: number, y: number, p: number[]) => {
      let c = false;
      for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
        const [xi, yi, xj, yj] = [p[i], p[i + 1], p[j], p[j + 1]];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    const spots = CHAPTERS.flatMap((c) => (c.spots ?? []).map((s) => ({ c, s })));

    it('every chapter but the last has references, with unique ids', () => {
      for (const c of CHAPTERS) {
        if (c.key === 'contact') expect(c.spots, c.key).toBeUndefined();
        else expect(c.spots?.length, c.key).toBeGreaterThan(0);
        const ids = (c.spots ?? []).map((s) => s.id);
        expect(new Set(ids).size, c.key).toBe(ids.length);
      }
    });
    it('geometry: inside the scene, the marker inside its outline, on the building side, away from the text', () => {
      for (const { c, s } of spots) {
        const tag = `${c.key}.${s.id}`;
        expect(s.poly.length, tag).toBeGreaterThanOrEqual(6);
        expect(s.poly.length % 2, tag).toBe(0);
        for (const v of [...s.poly, ...s.at]) expect(v >= 0 && v <= 100, tag).toBe(true);
        expect(inside(s.at[0], s.at[1], s.poly), tag).toBe(true);
        if (c.building === 'left') expect(s.at[0], tag).toBeLessThan(58);
        else expect(s.at[0], tag).toBeGreaterThan(42);
      }
    });
    it('the hero is the index: every reference leads to another chapter, once each', () => {
      const hero = CHAPTERS[0].spots ?? [];
      const dest = hero.map((s) => ('chapter' in (s.go ?? {}) ? (s.go as { chapter: string }).chapter : ''));
      expect(dest.every((d) => d && d !== 'hero' && CHAPTERS.some((c) => c.key === d))).toBe(true);
      expect(new Set(dest).size).toBe(dest.length);
    });
    it('the roadmap is always «planeado» and has no destination; the exercise is marked as one', () => {
      for (const s of CHAPTERS.find((c) => c.key === 'roadmap')!.spots!) {
        expect(s.status, s.id).toBe('planeado');
        expect(s.go, s.id).toBeUndefined();
      }
      expect(CHAPTERS.find((c) => c.key === 'brand')!.spots!.find((s) => s.id === 'exercise')!.status).toBe('ejercicio');
    });
    it('copy in both languages: a name and a text, and a button label wherever it leads somewhere', () => {
      type Sp = { name?: string; text?: string; cta?: string };
      for (const m of [es, en]) {
        const ch = m.taller.ch as unknown as Record<string, { spots?: Record<string, Sp> }>;
        expect(m.taller.spots.label && m.taller.spots.goScene && m.taller.spots.close).toBeTruthy();
        for (const { c, s } of spots) {
          if (c.key === 'hero') continue;
          const x = ch[c.key].spots?.[s.id];
          expect(x?.name && x.text, `${c.key}.${s.id}`).toBeTruthy();
          if (s.go && !('chapter' in s.go)) expect(x?.cta, `${c.key}.${s.id}`).toBeTruthy();
        }
      }
    });
  });
});
