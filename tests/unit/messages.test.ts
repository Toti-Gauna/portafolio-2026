import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';
import { CASES, CASE_SLUGS } from '../../lib/cases';

const keys = (o: unknown, prefix = ''): string[] =>
  Object.entries(o as Record<string, unknown>).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
const caseCopy = (loc: string, slug: string) => JSON.parse(readFileSync(join(__dirname, `../../messages/cases/${loc}/${slug}.json`), 'utf8'));
const get = (o: unknown, k: string) => k.split('.').reduce<unknown>((acc, p) => (acc as Record<string, unknown>)?.[p], o);

describe('messages', () => {
  it('es and en have exactly the same keys', () => {
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });
  it('no message is empty', () => {
    for (const m of [es, en]) for (const k of keys(m)) expect(String(get(m, k)).trim().length, k).toBeGreaterThan(0);
  });
});

describe('case pages', () => {
  it('every case has one copy file per locale and no stray files', () => {
    for (const loc of ['es', 'en']) {
      const files = readdirSync(join(__dirname, `../../messages/cases/${loc}`)).map((f) => f.replace(/\.json$/, '')).sort();
      expect(files).toEqual([...CASE_SLUGS].sort());
    }
  });
  for (const slug of CASE_SLUGS) {
    it(`${slug}: same keys in es and en, nothing empty, a copy for every block`, () => {
      const [a, b] = [caseCopy('es', slug), caseCopy('en', slug)];
      expect(keys(b).sort()).toEqual(keys(a).sort());
      for (const k of keys(a)) expect(String(get(a, k)).length, k).toBeGreaterThan(0);
      for (const block of CASES[slug].blocks) expect(a.blocks[block.key], block.key).toBeTruthy();
      for (const f of ['title', 'kind', 'status', 'summary']) expect(a[f], f).toBeTruthy();
    });
  }
  it('diagram copy names every node and edge of its spec', () => {
    for (const slug of CASE_SLUGS) for (const loc of ['es', 'en']) {
      const c = caseCopy(loc, slug);
      for (const b of CASES[slug].blocks) {
        if (b.type === 'diagram') {
          const d = c.blocks[b.key].diagram;
          for (const n of b.spec.nodes) expect(d.nodes[n.id]?.label, `${slug}.${b.key}.${n.id}`).toBeTruthy();
          for (const g of b.spec.groups ?? []) expect(d.groups?.[g.id], `${slug}.${b.key}.${g.id}`).toBeTruthy();
          for (const v of ['desktop', 'mobile'] as const) for (const n of b.spec.nodes) expect(b.spec[v].nodes[n.id], `${slug} ${v} ${n.id}`).toBeTruthy();
        }
        if (b.type === 'sequence') {
          const s = c.blocks[b.key].seq;
          for (const m of b.spec.msgs) expect(s.msgs[m.id], `${slug}.${b.key}.${m.id}`).toBeTruthy();
        }
      }
    }
  });
});
