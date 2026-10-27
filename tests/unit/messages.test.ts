import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';

const keys = (o: unknown, prefix = ''): string[] =>
  Object.entries(o as Record<string, unknown>).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

describe('messages', () => {
  it('es and en have exactly the same keys', () => {
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });
  it('no message is empty', () => {
    for (const m of [es, en]) for (const k of keys(m)) {
      const v = k.split('.').reduce<unknown>((acc, p) => (acc as Record<string, unknown>)[p], m);
      expect(String(v).trim().length, k).toBeGreaterThan(0);
    }
  });
});
