import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SCENE_IDS, sceneForPath } from '../../components/scene/routes';
import { CASE_SLUGS } from '../../lib/cases';

const root = fileURLToPath(new URL('../../', import.meta.url));

describe('route → background scene', () => {
  it('home in both languages', () => {
    for (const p of ['/', '/es', '/es/', '/en/', '/en/index.html', '/es/#trabajo', '/en/?x=1']) expect(sceneForPath(p)).toBe('home');
    expect(sceneForPath(null)).toBe('home');
  });

  it('every case page gets its own scene', () => {
    for (const slug of CASE_SLUGS) {
      expect(sceneForPath(`/es/proyectos/${slug}/`)).toBe(slug);
      expect(sceneForPath(`/en/proyectos/${slug}`)).toBe(slug);
    }
  });

  it('pages that are coming get theirs by route', () => {
    expect(sceneForPath('/es/negocio/')).toBe('negocio');
    expect(sceneForPath('/en/negocio/')).toBe('negocio');
    expect(sceneForPath('/en/business-models/')).toBe('negocio');
    expect(sceneForPath('/es/agentes/')).toBe('agentes');
    expect(sceneForPath('/en/agents/')).toBe('agentes');
    for (const id of ['volta', 'dentalos', 'games', 'velmar', 'supernova'] as const) {
      expect(sceneForPath(`/es/proyectos/${id}/`)).toBe(id);
      expect(sceneForPath(`/es/laboratorio/${id}/`)).toBe(id);
      expect(sceneForPath(`/en/${id}/`)).toBe(id);
    }
    expect(sceneForPath('/es/proyectos/supplements-ecommerce/')).toBe('volta');
    expect(sceneForPath('/es/proyectos/games-market/')).toBe('games');
  });

  it('anything else falls back to the dot field', () => {
    for (const p of ['/es/proyectos/', '/es/otra-cosa/', '/en/proyectos/unknown/', '/es/home/', '/es/default/']) expect(sceneForPath(p)).toBe('default');
  });

  it('ignores case, query and hash, and keeps a basePath-free path', () => {
    expect(sceneForPath('/ES/Proyectos/CompliA/?ref=x#h-arq')).toBe('complia');
  });

  it('every scene has its module and its CSS light (the fallback without WebGL)', () => {
    const css = readFileSync(`${root}components/scene/scene.css`, 'utf8');
    for (const id of SCENE_IDS) {
      expect(existsSync(`${root}components/scene/scenes/${id}.ts`), `scenes/${id}.ts`).toBe(true);
      expect(css, `CSS for ${id}`).toContain(`[data-scene='${id}']`);
    }
    const engine = readFileSync(`${root}components/scene/engine.ts`, 'utf8');
    for (const id of SCENE_IDS) expect(engine, `loader for ${id}`).toContain(`import('./scenes/${id}')`);
  });

  it('no randomness at module load: scenes are seeded', () => {
    for (const id of SCENE_IDS) {
      const src = readFileSync(`${root}components/scene/scenes/${id}.ts`, 'utf8');
      expect(src, id).not.toMatch(/Math\.random/);
    }
  });
});
