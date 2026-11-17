import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Ignacio, 29/10/2026: nothing about HandyX in the portfolio — no case, card, capture, background, trailer view,
// business example or mention, not even in comments of the code the site serves.
const ROOT = join(__dirname, '../..');
const DIRS = ['messages', 'lib', 'components', 'app', 'i18n', 'public'];
const SKIP = new Set([join(ROOT, 'public/trailer/vendor')]);
const TEXT = /\.(json|ts|tsx|js|mjs|css|html|svg|md|txt)$/;

function* files(dir: string): Generator<string> {
  if (SKIP.has(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p);
    else yield p;
  }
}

describe('no HandyX', () => {
  it('no file or text in the site names it', () => {
    const hits: string[] = [];
    for (const d of DIRS) {
      for (const f of files(join(ROOT, d))) {
        if (/handy/i.test(f)) hits.push(f.slice(ROOT.length));
        else if (TEXT.test(f) && /handy/i.test(readFileSync(f, 'utf8'))) hits.push(`${f.slice(ROOT.length)} (text)`);
      }
    }
    expect(hits).toEqual([]);
  });
});
