import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it } from 'vitest';

/**
 * A tool, not a test (lote 6.1): renders one brand's board to a standalone HTML file, with the real frame CSS and the
 * real fonts, to look at it without building the site.
 *   BRAND_PREVIEW=<id> [BRAND_LANG=en] [BRAND_OUT=<dir>] npx vitest run tests/unit/brand-preview.test.ts
 * writes <dir>/<id>.html (default dir: .brand-preview/, ignored by git). Without BRAND_PREVIEW it does nothing.
 */
const id = process.env.BRAND_PREVIEW;
describe.skipIf(!id)('brand preview', () => {
  it('writes the board of one brand', async () => {
    const lang = process.env.BRAND_LANG === 'en' ? 'en' : 'es';
    const out = resolve(process.env.BRAND_OUT ?? '.brand-preview');
    const { BRAND } = await import(`../../v2/components/brand/art/${id}.ts`);
    const copy = JSON.parse(readFileSync(`messages/v2/brands/${lang}/${id}.json`, 'utf8'));
    const labels = JSON.parse(readFileSync(`messages/v2/${lang}.json`, 'utf8')).brandlab;
    const { BrandBoard } = await import('../../v2/components/brand/BrandBoard');
    const html = renderToStaticMarkup(createElement(BrandBoard, { spec: BRAND, copy, labels }));
    const fonts = resolve('public/trailer/fonts');
    const css = [
      readFileSync('app/v2/[locale]/brand-fonts.css', 'utf8').replaceAll('../../../public/trailer/fonts', `file://${fonts}`),
      `@font-face{font-family:'Archivo';src:url('file://${fonts}/Archivo-latin.woff2') format('woff2');font-weight:100 900;font-stretch:62% 125%}`,
      `@font-face{font-family:'JetBrains Mono';src:url('file://${fonts}/JetBrainsMono-latin.woff2') format('woff2');font-weight:100 800}`,
      `:root{--family-sans:'Archivo';--family-mono:'JetBrains Mono'}body{margin:0;background:#060513}.ui-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}`,
      readFileSync('app/v2/[locale]/brand.css', 'utf8'),
    ].join('\n');
    mkdirSync(out, { recursive: true });
    writeFileSync(`${out}/${id}.html`, `<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${copy.name}</title><style>${css}</style><body>${html}</body></html>`);
  });
});
