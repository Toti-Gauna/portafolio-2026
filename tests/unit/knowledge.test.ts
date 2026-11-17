import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';
import { KNOWLEDGE, SKILL_ROWS } from '../../lib/home';

type Item = { name: string; tag: string; text: string };

describe('Conocimiento: AR/VR, Blender, Meshy y Claude (Ola 10)', () => {
  it('four cards in both languages, and none is a technology of the ledger (they are knowledge, not use)', () => {
    expect(KNOWLEDGE).toEqual(['arvr', 'blender', 'meshy', 'claude']);
    const ledger = SKILL_ROWS.map((r) => r.id as string);
    for (const id of KNOWLEDGE) expect(ledger).not.toContain(id);
    for (const m of [es, en]) {
      const items = m.skills.know.items as Record<string, Item>;
      for (const id of KNOWLEDGE) { expect(items[id].name && items[id].tag && items[id].text, id).toBeTruthy(); }
      expect(m.skills.know.lead).toBeTruthy();
    }
  });

  it('what Ignacio confirmed on 17/11/2026: AR/VR, Blender and Meshy are knowledge and study, with nothing published', () => {
    for (const [m, tag, none] of [[es, 'Conocimiento y estudio', /ninguna pieza publicada|lo declaro/], [en, 'Knowledge and study', /no published piece|I will say so/]] as const) {
      const items = m.skills.know.items as Record<string, Item>;
      for (const id of ['arvr', 'blender', 'meshy']) {
        expect(items[id].tag, id).toBe(tag);
        expect(items[id].text, id).toMatch(none);
      }
    }
  });

  it('honesty: no experience, years, clients or projects are claimed for them; AI models would be declared', () => {
    for (const m of [es, en]) {
      const all = JSON.stringify(m.skills.know).toLowerCase();
      expect(all).not.toMatch(/años de|years of|cliente|client|proyecto en producción|in production for|experiencia con|certific/);
    }
    expect(es.skills.know.items.meshy.text).toMatch(/declaro/);
    expect(en.skills.know.items.meshy.text).toMatch(/say so/);
  });
});
