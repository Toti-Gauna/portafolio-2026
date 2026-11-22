import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it } from 'vitest';
import { AgentIcon, type AgentId } from '../../components/AgentIcon';
import { board, type BoardShot } from '../../design/v2/trailer/board';
import { frame, type FrameCtx, type Shot } from '../../design/v2/trailer/frames';
import notes from '../../design/v2/trailer/notes.json';
import { CASES, type CaseSlug } from '../../v2/components/case/cases';
import { STAMP_IDS, stampSvg } from '../../v2/components/kit/stamps';
import { Monogram } from '../../v2/components/ui/Icons';
import { AGENTS } from '../../v2/components/how/flow';
import script from '../../v2/trailer/script.json';

/**
 * A tool, not a test (lote 8.1): writes the storyboard of «Conocer a Ignacio» as the body of an artifact.
 *   TRAILER_BOARD=<dir> npx vitest run tests/unit/trailer-storyboard.test.ts
 * writes <dir>/storyboard.html (the artifact), <dir>/preview.html (the same, wrapped, to open in a browser) and
 * <dir>/media/ (the real clips of the cases, as 720 px webp; needs ffmpeg). Without TRAILER_BOARD it does nothing.
 */
const out = process.env.TRAILER_BOARD;
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const LANGS = ['es', 'en'] as const;

describe.skipIf(!out)('trailer storyboard', () => {
  it('writes the storyboard page', () => {
    const dir = resolve(out!);
    mkdirSync(`${dir}/media`, { recursive: true });
    const copy = { es: read('messages/v2/trailer/es.json'), en: read('messages/v2/trailer/en.json') };
    const ui = { es: read('messages/v2/es.json').ui.status, en: read('messages/v2/en.json').ui.status };
    const how = { es: read('messages/v2/how/es.json').system.nodes, en: read('messages/v2/how/en.json').system.nodes };
    const shots = script.shots as unknown as (Shot & { show?: string[] })[];
    const slugs = [...new Set(shots.map((s) => s.case).filter(Boolean))] as CaseSlug[];
    const verbs = Object.fromEntries(LANGS.map((l) => [l, Object.fromEntries(slugs.map((s) => [s, read(`messages/v2/cases/${l}/${s}.json`).film.verbs]))])) as FrameCtx['verbs'];
    const done = new Set<string>();
    const img = (path: string) => {
      const name = path.replace(/^\/media\//, '').replace(/\//g, '-');
      const to = path.endsWith('.svg') ? name : name.replace(/\.\w+$/, '.webp');
      if (!done.has(to)) {
        done.add(to);
        if (path.endsWith('.svg')) copyFileSync(`public${path}`, `${dir}/media/${to}`);
        else execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `public${path}`, '-vf', 'scale=720:-2', '-quality', '72', `${dir}/media/${to}`]);
      }
      return `media/${to}`;
    };
    const still = (s: Shot) => {
      if (s.frameAt === undefined || !s.clip) return img(s.media!);
      const to = `${s.id}-still.webp`;
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(s.frameAt), '-i', `public${s.clip}`, '-frames:v', '1', '-vf', 'scale=720:-2', '-quality', '72', `${dir}/media/${to}`]);
      return `media/${to}`;
    };
    const ctx: FrameCtx = {
      copy, verbs, status: ui, still,
      stations: { es: Object.values(how.es).map((n) => (n as { label: string }).label), en: Object.values(how.en).map((n) => (n as { label: string }).label) },
      caseState: Object.fromEntries(Object.values(CASES).map((c) => [c.slug, c.status])),
      caseColor: Object.fromEntries(Object.values(CASES).map((c) => [c.slug, c.color])),
      img,
      agentIcons: AGENTS.map((a) => renderToStaticMarkup(createElement(AgentIcon, { id: a.id as AgentId }))),
      monogram: renderToStaticMarkup(createElement(Monogram, { size: 96 })),
      chapterNo: Object.fromEntries(script.chapters.map((c, i) => [c.id, i + 1])),
    };
    const beat = 60 / script.bpm;
    const words = (s: Shot & { show?: string[] }, l: 'es' | 'en') => {
      const c = copy[l].shots[s.id] as Record<string, string | string[]>;
      const list = Object.entries(c).filter(([k]) => !['t', 'replay'].includes(k)).flatMap(([, v]) => v);
      if (s.show?.includes('verbs')) list.push(...verbs[l][s.case!]);
      if (s.show?.includes('state')) list.push(ui[l][ctx.caseState[s.case!]]);
      if (s.id === 'own') list.push(...['eclipse', 'volta', 'velmar', 'dentalos', 'kinetic', 'games'].map((n) => copy[l].shots[n].name));
      if (s.id === 'gate') list.push(...ctx.stations[l]);
      if (s.count) list.unshift(s.count.to.toLocaleString(l === 'en' ? 'en-US' : 'es-AR'));
      return list;
    };
    const list: BoardShot[] = shots.map((s, i) => ({
      id: s.id, no: `P${String(i + 1).padStart(2, '0')}`, chapter: s.chapter, bar: s.bars[0], len: s.bars[1],
      start: (s.bars[0] - 1) * 4 * beat, dur: s.bars[1] * 4 * beat, theme: s.theme, title: copy.es.shots[s.id].t,
      frames: { w: frame(s, 'w', ctx), t: frame(s, 't', ctx) }, words: { es: words(s, 'es'), en: words(s, 'en') },
      count: s.count ? { to: s.count.to, cue: s.cues.count } : undefined,
      note: (notes.shots as Record<string, BoardShot['note']>)[s.id],
    }));
    const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${STAMP_IDS.map((id) => `<symbol id="st-${id}" viewBox="0 0 240 300">${stampSvg(id)}</symbol>`).join('')}</svg>`;
    const html = board({
      title: { es: copy.es.title, en: copy.en.title }, logline: copy.es.logline, bpm: script.bpm, bars: script.bars, seconds: Math.round(script.bars * 4 * beat), drops: script.drops,
      chapters: script.chapters.map((c) => ({ id: c.id, name: copy.es.chapters[c.id], bar: c.bars[0], len: c.bars[1], music: (notes.chapters as Record<string, string>)[c.id] })),
      shots: list, grammar: notes.grammar, ask: notes.ask, sprite,
      wordCount: list.reduce((n, s) => n + s.words.es.join(' ').split(/\s+/).filter((x) => /\p{L}|\d/u.test(x)).length, 0),
    });
    writeFileSync(`${dir}/storyboard.html`, html);
    writeFileSync(`${dir}/preview.html`, `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@font-face{font-family:'Archivo';src:url('file://${resolve('public/trailer/fonts')}/Archivo-latin.woff2') format('woff2');font-weight:100 900;font-stretch:62% 125%}@font-face{font-family:'JetBrains Mono';src:url('file://${resolve('public/trailer/fonts')}/JetBrainsMono-latin.woff2') format('woff2');font-weight:100 800}body{margin:0;font-size:14px}[hidden]{display:none!important}img{max-width:100%}</style></head><body>${html}</body></html>`);
  });
});
