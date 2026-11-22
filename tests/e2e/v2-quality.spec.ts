import { expect, type Page, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Lote 9.2: performance and accessibility of /v2, page by page. Budgets on what every page ships (gzip, as the hosting
// serves it), 3D only when asked for, the largest thing painted with the first paint (LCP < 2 s on a phone, measured
// with the network and CPU of a mid phone: scratchpad p92/lcp.mjs), and a sweep at nine sizes: no sideways scroll, no
// text under 12 px, no touch target under 44 px, the focus seen at every Tab stop.

const OUT = path.join(process.cwd(), 'out');
const PAGES = ['/v2/es/', '/v2/es/work/', '/v2/es/work/complia/', '/v2/es/work/eclipse/', '/v2/es/como-trabajo/', '/v2/es/brand-lab/', '/v2/es/brand-lab/eclipse/', '/v2/es/negocio/', '/v2/es/sobre-mi/', '/v2/es/video/', '/v2/es/trailer/'];
const SIZES: [number, number][] = [[320, 568], [360, 740], [390, 844], [412, 915], [768, 1024], [820, 1180], [1024, 768], [1366, 768], [1440, 900]];

const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : e.name === 'index.html' ? [path.join(d, e.name)] : []);
const gz = (f: string) => zlib.gzipSync(fs.readFileSync(f)).length;

test('budgets: every page of /v2 ships at most 200 KB of HTML, 205 KB of JavaScript and 66 KB of CSS (gzip) on its first load', () => {
  const pages = walk(path.join(OUT, 'v2'));
  expect(pages.length).toBeGreaterThan(70);
  const over: string[] = [];
  for (const f of pages) {
    const html = fs.readFileSync(f, 'utf8');
    const refs = (re: RegExp) => [...new Set([...html.matchAll(re)].map((m) => m[1].split('?')[0]))];
    const sum = (list: string[]) => list.reduce((a, u) => a + gz(path.join(OUT, u)), 0);
    const kb = { html: gz(f) / 1024, js: sum(refs(/<script[^>]+src="([^"]+\.js)"/g)) / 1024, css: sum(refs(/<link[^>]+href="([^"]+\.css)"/g)) / 1024 };
    const name = path.relative(OUT, f);
    if (kb.html > 200) over.push(`${name}: HTML ${kb.html.toFixed(0)} KB`);
    if (kb.js > 205) over.push(`${name}: JS ${kb.js.toFixed(0)} KB`);
    if (kb.css > 66) over.push(`${name}: CSS ${kb.css.toFixed(0)} KB`);
  }
  expect(over).toEqual([]);
});

/** the scripts a page asked for, with whether they carry three.js */
const scripts = (page: Page) => {
  const seen: { url: string; three: boolean }[] = [];
  page.on('response', async (r) => {
    if (r.request().resourceType() !== 'script') return;
    const body = await r.text().catch(() => '');
    seen.push({ url: r.url(), three: body.includes('WebGLRenderer') });
  });
  return seen;
};

test('3D comes late: no page of /v2 downloads three.js on its first load; the world asks for it only for the view from the ground', async ({ page }) => {
  for (const url of ['/v2/es/', '/v2/es/work/', '/v2/es/work/eclipse/', '/v2/es/brand-lab/eclipse/', '/v2/es/sobre-mi/', '/v2/es/trailer/']) {
    const seen = scripts(page);
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    expect(seen.filter((s) => s.three).map((s) => s.url), url).toEqual([]);
    page.removeAllListeners('response');
  }
});

test('the largest thing on a phone arrives with the first paint, and nothing jumps (LCP and CLS)', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => {
    const w = window as unknown as { __q: { lcp: number; cls: number } };
    w.__q = { lcp: 0, cls: 0 };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) w.__q.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) w.__q.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  const page = await ctx.newPage();
  for (const url of PAGES) {
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const q = await page.evaluate(() => ({ ...(window as unknown as { __q: { lcp: number; cls: number } }).__q, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0 }));
    // the film of a case hid its first frame and the LCP came seconds after the first paint; the trailer's poster changed shape on hydration
    expect(q.lcp - q.fcp, `${url} LCP ${Math.round(q.lcp)} ms after FCP ${Math.round(q.fcp)} ms`).toBeLessThan(600);
    expect(q.cls, `${url} CLS`).toBeLessThan(0.1);
  }
  await ctx.close();
});

/** what breaks the rules on the page as it is now */
const audit = (page: Page) => page.evaluate(() => {
  const shown = (el: Element) => {
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none') return false;
    const b = el.getBoundingClientRect();
    if (b.width < 1 || b.height < 1) return false;
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = getComputedStyle(n);
      if (Number(c.opacity) === 0 || (n as HTMLElement).inert || n.getAttribute('aria-hidden') === 'true' || (n as HTMLElement).hidden) return false;
      if (n.tagName === 'DIALOG' && !(n as HTMLDialogElement).open) return false;
      if (n.tagName === 'DETAILS' && !(n as HTMLDetailsElement).open && !el.closest('summary')) return false;
    }
    return true;
  };
  const name = (el: Element) => `${el.tagName.toLowerCase()}${typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : ''} «${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}»`;
  const small: string[] = [], tiny: string[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set<Element>();
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    const el = t.parentElement;
    if (!t.textContent?.trim() || !el || seen.has(el)) continue;
    seen.add(el);
    if (el.closest('svg, script, style, noscript, .ui-sr')) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 11.95 && shown(el)) small.push(`${name(el)} ${size.toFixed(1)} px`);
  }
  for (const el of document.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"], [tabindex]:not([tabindex="-1"])')) {
    if (!shown(el)) continue;
    // a link inside running text is exempt (WCAG 2.5.8); a card's title link stretched over the card is as big as the card
    if (el.tagName === 'A' && getComputedStyle(el).display === 'inline' && el.closest('p, li, dd, figcaption, td')) continue;
    const card = el.closest('article, li, .ui-card');
    if (getComputedStyle(el, '::after').position === 'absolute' && card) { const c = card.getBoundingClientRect(); if (c.width >= 44 && c.height >= 44) continue; }
    const b = el.getBoundingClientRect();
    const min = el.matches('input[type="range"]') ? [0, 24] : [43.5, 43.5];
    if (b.width < min[0] || b.height < min[1]) tiny.push(`${name(el)} ${Math.round(b.width)}×${Math.round(b.height)}`);
  }
  return { overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, small: [...new Set(small)], tiny: [...new Set(tiny)] };
});

for (const [w, h] of SIZES) {
  test(`at ${w}×${h}: no sideways scroll, no text under 12 px, no touch target under 44 px`, async ({ browser }) => {
    test.setTimeout(120_000);
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 1100, isMobile: w < 700, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    for (const url of PAGES) {
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForTimeout(250);
      const a = await audit(page);
      expect(a.overflow, `${url} scrolls sideways`).toBe(0);
      expect(a.small, `${url} text under 12 px`).toEqual([]);
      expect(a.tiny, `${url} targets under 44 px`).toEqual([]);
    }
    await ctx.close();
  });
}

test('reduced motion: once a page has loaded, nothing on it is moving', async ({ browser }) => {
  test.setTimeout(120_000);
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const url of PAGES) {
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const running = await page.evaluate(() => document.getAnimations()
      .filter((a) => a.playState === 'running')
      .map((a) => { const t = (a.effect as KeyframeEffect | null)?.target as Element | null; return `${a.constructor.name} ${(a as CSSAnimation).animationName ?? ''} on ${t?.tagName.toLowerCase()}.${t && typeof t.className === 'string' ? t.className.split(' ')[0] : ''}`; }));
    expect(running, url).toEqual([]);
  }
  await ctx.close();
});

test('the keyboard: on every page the first 25 Tab stops are on screen and each one shows its focus', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1366, height: 768 });
  for (const url of PAGES) {
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(250);
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      const f = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const s = getComputedStyle(el), b = el.getBoundingClientRect();
        const ring = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 1) || (s.boxShadow !== 'none' && s.boxShadow !== '') || ['::before', '::after'].some((p) => { const q = getComputedStyle(el, p); return q.content !== 'none' && (q.outlineStyle !== 'none' || q.boxShadow !== 'none' || q.borderStyle !== 'none'); });
        return { name: `${el.tagName.toLowerCase()}.${el.className && typeof el.className === 'string' ? el.className.split(' ')[0] : ''} «${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}»`, ring, inView: b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth };
      });
      if (!f) break;
      expect(f.ring, `${url} focus ring on ${f.name}`).toBe(true);
      expect(f.inView, `${url} focus on screen: ${f.name}`).toBe(true);
    }
  }
});
