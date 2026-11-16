import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';
import { PAGES } from '../../lib/nav';
import sitemap from '../../app/sitemap';
import { CHAPTERS } from '../../lib/taller';

const root = fileURLToPath(new URL('../../', import.meta.url));

describe('site pages (lib/nav.ts)', () => {
  it('every page has its route, its menu line, a chapter of the home walk that leads to it and is in the sitemap', () => {
    const urls = sitemap().map((u) => u.url);
    for (const p of PAGES) {
      expect(existsSync(`${root}app/[locale]${p.href}/page.tsx`), p.href).toBe(true);
      for (const m of [es, en]) {
        expect(m.nav.pages[p.key].t, p.key).toBeTruthy();
      }
      expect(CHAPTERS.some((c) => c.href?.split('#')[0] === p.href), `chapter for ${p.href}`).toBe(true);
      for (const l of ['es', 'en']) expect(urls.some((u) => u.endsWith(`/${l}${p.href}/`)), `${l}${p.href}`).toBe(true);
    }
  });
  it('at most five page links in the wide header', () => {
    expect(PAGES.length).toBeLessThanOrEqual(5);
  });
});
