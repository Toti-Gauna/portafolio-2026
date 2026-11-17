import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';
import { CASES, CASE_SLUGS } from '../../lib/cases';
import { STATIONS } from '../../lib/career';

const STEP_IDS = ['what', 'see', 'how', 'role', 'real', 'security', 'decisions', 'quality', 'status'];
const statusOf = (slug: string) => STATIONS.flatMap((s) => s.buildings).find((b) => b.slug === slug)?.status;
const stepped = CASE_SLUGS.filter((s) => CASES[s].steps);

describe('case template with steps (Ola 7a)', () => {
  it('CompliA and Eclipse use it', () => {
    expect(stepped).toEqual(expect.arrayContaining(['complia', 'eclipse']));
  });

  it.each(stepped)('%s: every block is in exactly one step, with no unknown keys', (slug) => {
    const def = CASES[slug];
    const keys = def.blocks.map((b) => b.key);
    const inSteps = def.steps!.flatMap((s) => s.blocks);
    expect(new Set(inSteps).size, 'a block in two steps').toBe(inSteps.length);
    for (const k of inSteps) expect(keys, `unknown block ${k}`).toContain(k);
    for (const k of keys) expect(inSteps, `block ${k} is in no step`).toContain(k);
  });

  it.each(stepped)('%s: steps are not repeated, come from the vocabulary and «status» is last when present', (slug) => {
    const ids = CASES[slug].steps!.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(STEP_IDS).toContain(id);
    if (ids.includes('status')) expect(ids[ids.length - 1]).toBe('status');
  });

  it.each(stepped)('%s: «real» only on demos, MVPs, prototypes and test beds (Ignacio, 17/11/2026: HandyX too)', (slug) => {
    if (!CASES[slug].steps!.some((s) => s.id === 'real')) return;
    expect(['demo', 'mvp', 'prototipo', 'banco']).toContain(statusOf(slug));
  });

  it('every step has its label and line in both languages', () => {
    for (const m of [es, en]) {
      const st = m.caseUi.steps as Record<string, unknown>;
      for (const k of ['label', 'of', 'prev', 'next', 'all']) expect(st[k], k).toBeTruthy();
      expect(st.of as string).toMatch(/\{n\}.*\{total\}/);
      for (const id of STEP_IDS) {
        const x = st[id] as { t: string; d: string };
        expect(x.t, id).toBeTruthy();
        expect(x.d, id).toBeTruthy();
      }
    }
  });
});
