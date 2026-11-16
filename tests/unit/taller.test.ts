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
});
