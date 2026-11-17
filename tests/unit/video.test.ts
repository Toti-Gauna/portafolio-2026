import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';
import { CASE_SLUGS } from '../../lib/cases';
import { STATIONS } from '../../lib/career';
import { FORMAT_PROJECTS, VIDEO_GROUPS, videosOf } from '../../lib/video';
import { EXTRA_PAGES } from '../../lib/nav';
import { CHAPTERS } from '../../lib/taller';

const root = join(__dirname, '../..');
const caseCopy = (loc: string, slug: string) => JSON.parse(readFileSync(join(root, `messages/cases/${loc}/${slug}.json`), 'utf8'));
const statusOf = (slug: string) => STATIONS.flatMap((s) => s.buildings).find((b) => b.slug === slug)?.status;

describe('Video y tráileres (lib/video.ts, Ola 8c)', () => {
  it('every group is a case with a status and at least one video that exists on disk, with a poster', () => {
    for (const slug of [...VIDEO_GROUPS, 'kinetic'] as const) {
      expect(CASE_SLUGS as readonly string[], slug).toContain(slug);
      expect(statusOf(slug) ?? 'sin-estado', slug).toBeTruthy();
      const vids = videosOf(slug);
      expect(vids.length, slug).toBeGreaterThanOrEqual(1);
      for (const v of vids) {
        expect(v.kind).toBe('video');
        expect(existsSync(join(root, 'public', v.src)), `${slug}/${v.id} file`).toBe(true);
        expect(v.poster && existsSync(join(root, 'public', v.poster)), `${slug}/${v.id} poster`).toBe(true);
      }
    }
  });

  it('every video has its caption (in the case that owns it) in both languages', () => {
    for (const loc of ['es', 'en']) {
      for (const slug of [...VIDEO_GROUPS, 'kinetic'] as const) {
        const c = caseCopy(loc, slug);
        for (const v of videosOf(slug)) {
          if (slug === 'complia') expect(c.blocks.demo.caption, loc).toBeTruthy();
          else expect(c.blocks.media.items[v.id]?.caption, `${loc} ${slug}/${v.id}`).toBeTruthy();
        }
      }
    }
  });

  it('copy: sections, groups, formats and the Remotion test in both languages', () => {
    for (const m of [es, en]) {
      const v = m.video as Record<string, any>;
      for (const k of ['label', 'title', 'lead', 'note']) expect(v[k], k).toBeTruthy();
      for (const slug of VIDEO_GROUPS) expect(v.groups[slug], slug).toBeTruthy();
      expect(v.formats.items).toHaveLength(FORMAT_PROJECTS.length);
      expect(v.remotion.facts.length).toBe(5);
      expect(v.remotion.kinetic.steps).toHaveLength(4);
      expect(v.remotion.remo.steps).toHaveLength(4);
      expect(v.code.facts).toHaveLength(3);
    }
    expect(es.video.remotion.facts.length).toBe(en.video.remotion.facts.length);
  });

  it('the Remotion test is told as a test: not in the repo, with its licence caveat; and it is not a dependency', () => {
    for (const m of [es, en]) {
      const facts = JSON.stringify((m.video as Record<string, any>).remotion.facts);
      expect(facts).toMatch(/repositorio|repository/);
      expect(facts).toMatch(/licencia|licence/i);
    }
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    expect(Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter((d) => /remotion/i.test(d))).toEqual([]);
  });

  it('honesty: no results, amounts or client brands; the export is not claimed bit-exact', () => {
    for (const m of [es, en]) {
      const all = JSON.stringify(m.video);
      expect(all).not.toMatch(/\$\s?\d|US\$|\bUSD\b|telef[oó]nica|movistar|tuenti|instagram\.com|viral|millones|views\b|vistas de/i);
      expect(all).toMatch(/2 de 4|2 of 4/);
    }
  });

  it('the Kinetic case describes the current film (130 s), not the old one', () => {
    for (const loc of ['es', 'en']) {
      const raw = JSON.stringify(caseCopy(loc, 'kinetic'));
      expect(raw).not.toMatch(/112 s|112 segundos|112 seconds|112,00|112\.00/);
      expect(raw).toMatch(/130/);
    }
  });

  it('it is an extra page (footer and sitemap), and the home chapter leads to it', () => {
    expect(EXTRA_PAGES.map((p) => p.href)).toContain('/video');
    expect(CHAPTERS.find((c) => c.key === 'video')!.href).toBe('/video');
    expect(existsSync(join(root, 'app/[locale]/video/page.tsx'))).toBe(true);
  });
});
