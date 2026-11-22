import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

// Lote 9.4: «Sin archivos huérfanos». Both sites (the published one and /v2) live in this repo: a module counts as
// used when an entry point of Next, a config, a script or a test reaches it through its imports; a file in public/
// counts as used when the code, the messages or the published trailer name it, by its path or by a template that
// builds it (`/media/trailer/ig-${locale}-wide.webp`). Licences are kept next to what they license.

const ROOT = process.cwd();
const walk = (d: string): string[] => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.name === 'node_modules' || e.name.startsWith('.') ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : [];
const rel = (f: string) => path.relative(ROOT, f);

describe('no orphan files', () => {
  it('every module of the two sites is reached from an entry point', () => {
    const all = ['app', 'components', 'lib', 'v2', 'i18n', 'scripts', 'design', 'tests', 'messages'].flatMap((d) => walk(path.join(ROOT, d))).filter((f) => /\.(tsx?|mjs|js|css|json)$/.test(f));
    all.push(...['next.config.ts', 'playwright.config.ts', 'vitest.config.ts'].map((f) => path.join(ROOT, f)));
    const exts = ['', '.ts', '.tsx', '.mjs', '.js', '.json', '.css', '/index.ts', '/index.tsx'];
    const resolve = (from: string, spec: string) => {
      const base = spec.startsWith('@/') ? path.join(ROOT, spec.slice(2)) : spec.startsWith('.') ? path.resolve(path.dirname(from), spec) : null;
      if (!base) return null;
      for (const e of exts) if (fs.existsSync(base + e) && fs.statSync(base + e).isFile()) return base + e;
      return null;
    };
    const deps = (f: string): string[] => {
      const text = fs.readFileSync(f, 'utf8');
      if (f.endsWith('.json')) return [];
      if (f.endsWith('.css')) return [...text.matchAll(/@import\s+['"]([^'"]+)['"]/g)].map((m) => resolve(f, m[1])).filter((x): x is string => !!x);
      const out = ts.preProcessFile(text, true, true).importedFiles.map((x) => resolve(f, x.fileName)).filter((x): x is string => !!x);
      // a template import (`../messages/cases/${locale}/${slug}.json`) reaches every file it can name; so does the path next.config gives next-intl
      for (const m of text.matchAll(/(?:import\(\s*`|createNextIntlPlugin\(\s*['"`])([^`'"]+)/g)) {
        const g = path.resolve(path.dirname(f), m[1]);
        const re = new RegExp(`^${g.replace(/[.+?^()|[\]\\]/g, '\\$&').replace(/\$\{[^}]+\}/g, '[^/]+')}$`);
        out.push(...all.filter((x) => re.test(x)));
      }
      return out;
    };
    const entry = (f: string) => /^app\/(.*\/)?(page|layout|template|not-found|error|loading|route|default|sitemap|robots|manifest|icon|opengraph-image)\.(t|j)sx?$/.test(rel(f))
      || /^(next|playwright|vitest)\.config\.ts$/.test(rel(f)) || /^(scripts|tests)\//.test(rel(f)) || (/^design\//.test(rel(f)) && /\.(mjs|ts)$/.test(f));
    const seen = new Set<string>();
    const stack = all.filter(entry);
    while (stack.length) { const f = stack.pop()!; if (seen.has(f)) continue; seen.add(f); stack.push(...deps(f).filter((d) => !seen.has(d))); }
    const orphans = all.filter((f) => /^(app|components|lib|v2|i18n|messages)\//.test(rel(f)) && !seen.has(f)).map(rel);
    expect(orphans).toEqual([]);
  });

  it('every file in public/ is named by the code, the messages or the published trailer', () => {
    const files = walk(path.join(ROOT, 'public')).filter((f) => !rel(f).startsWith('public/trailer/vendor/'));
    const sources = ['app', 'components', 'lib', 'v2', 'messages', 'public'].flatMap((d) => walk(path.join(ROOT, d)))
      .filter((f) => /\.(tsx?|mjs|js|json|css|html|webmanifest)$/.test(f)).map((f) => [f, fs.readFileSync(f, 'utf8')] as const);
    // templates that build public paths: `…${x}…` → a pattern
    const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const templates = sources.flatMap(([, t]) => [...t.matchAll(/`([^`\n]{0,160}\/[^`\n]{0,160}\$\{[^`\n]{0,160}\.(?:webp|jpg|png|mp4|svg|woff2|txt))`/g)]
      .map((m) => ({ text: m[1], re: new RegExp(`${m[1].split(/\$\{[^}]+\}/).map(esc).join('[^/]+')}$`) })));
    const orphans = files.filter((f) => {
      const p = rel(f).replace(/^public\//, ''), dir = path.dirname(p), stem = path.basename(p).replace(/\.[^.]+$/, '');
      if (/(^|\/)(OFL|LICENSE)[^/]*\.txt$|-OFL\.txt$/.test(p)) return false; // a font's licence travels with it
      if (sources.some(([s, t]) => s !== f && (t.includes(p) || (t.includes(path.basename(p)) && sources.some(([, u]) => u.includes(dir.split('/').slice(-1)[0])))))) return false;
      // a template counts only when its fixed text already names the file's folder (`/${dir}/${x}` would name anything)
      if (templates.some((x) => x.text.includes(dir) && (x.re.test('/' + p) || x.re.test(p)))) return false;
      // the trailer's views and walls are named by their id next to their folder (`media/wall/<lang>/<id>.webp`)
      return !(sources.some(([, t]) => t.includes(`'${stem}'`) || t.includes(`"${stem}"`)) && sources.some(([, t]) => t.includes(dir.split('/')[0])));
    }).map(rel);
    expect(orphans).toEqual([]);
  });

  it('every font file carries its licence in its folder', () => {
    const fonts = walk(path.join(ROOT, 'public/trailer/fonts')).filter((f) => /\.(woff2?|ttf|otf)$/.test(f));
    expect(fonts.length).toBeGreaterThan(20);
    const family = (f: string) => path.basename(f).replace(/(-latin.*|-Variable|-Regular|-Italic|-wght.*|-\d00.*)?\.(woff2?|ttf|otf)$/, '').replace(/-/g, '').toLowerCase();
    const missing = fonts.filter((f) => {
      const licences = fs.readdirSync(path.dirname(f)).filter((n) => /OFL|LICENSE/i.test(n)).map((n) => n.replace(/OFL|LICENSE|\.txt|-/gi, '').toLowerCase());
      return !licences.some((l) => family(f).startsWith(l) || l.startsWith(family(f)));
    }).map(rel);
    expect(missing).toEqual([]);
  });
});
