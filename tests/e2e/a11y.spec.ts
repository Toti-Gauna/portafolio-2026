import { expect, test, type Page } from '@playwright/test';

// Contrast: every visible text node, against the colour it really sits on (WCAG AA: 4.5, or 3 for large text).
const SCAN = () => {
  const parse = (c: string) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }: { r: number; g: number; b: number }) => { const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a: any, b: any) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const over = (top: any, bot: any) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const bgOf = (el: Element) => { let stack: any[] = []; let e: Element | null = el; while (e) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; } e = e.parentElement; } let base = { r: 14, g: 14, b: 16, a: 1 }; for (const c of stack.reverse()) base = over(c, base); return base; };
  const out: string[] = []; const seen = new Set<string>();
  for (const el of Array.from(document.querySelectorAll('body *'))) {
    if (!Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent!.trim())) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
    const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) continue;
    if ((el as HTMLElement).closest('[inert], .sr-only, dialog:not([open])')) continue;
    const fg0 = parse(cs.color); if (!fg0) continue;
    const bg = bgOf(el); const fg = over({ ...fg0, a: fg0.a * 1 }, bg);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5; const cr = ratio(fg, bg);
    if (cr < need) { const key = `${el.tagName}.${(el as HTMLElement).className}`; if (!seen.has(key)) { seen.add(key); out.push(`${key} ${cr.toFixed(2)} (need ${need}) "${el.textContent!.trim().slice(0, 30)}" ${cs.color} on rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`); } }
  }
  return out;
};


async function enter(page: Page, url: string) {
  await page.goto(url);
  const name = url.includes('/en/') ? 'View portfolio' : 'Ver portafolio';
  await expect(page.getByRole('button', { name })).toBeVisible({ timeout: 20000 });
  await page.getByRole('button', { name }).click({ timeout: 20000 });
  await expect(page.locator('#boot')).toHaveCount(0);
}

for (const url of ['/es/', '/es/proyectos/complia/', '/es/proyectos/kinetic/', '/en/']) {
  test(`AA text contrast on ${url}`, async ({ page }) => {
    await enter(page, url);
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(900);
    expect(await page.evaluate(SCAN)).toEqual([]);
  });
}

test('keyboard: every stop shows a focus ring, is on screen and is at least 44 px tall', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await enter(page, '/es/');
  await page.waitForTimeout(500);
  await page.evaluate(() => { document.body.setAttribute('tabindex', '-1'); document.body.focus(); document.body.removeAttribute('tabindex'); window.scrollTo(0, 0); });
  const bad: string[] = []; const stops: string[] = [];
  for (let i = 0; i < 120; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const e = document.activeElement as HTMLElement;
      if (!e || e === document.body) return null;
      const cs = getComputedStyle(e), r = e.getBoundingClientRect();
      return { name: (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30), ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2, h: Math.round(r.height), on: r.bottom > 0 && r.top < innerHeight };
    });
    if (!info) break;
    stops.push(info.name);
    if (!info.ring) bad.push(`no ring: ${info.name}`);
    if (!info.on) bad.push(`off screen: ${info.name}`);
    if (info.h < 44) bad.push(`small: ${info.name} ${info.h}px`);
    if (stops.length > 3 && stops.at(-1) === stops[0] && stops.at(-2) === stops[1]) break;
  }
  expect(stops.length).toBeGreaterThan(25);
  expect(stops[0]).toMatch(/Saltar al contenido/);
  expect(bad).toEqual([]);
});

test('social and search metadata on home and a case page', async ({ page }) => {
  for (const url of ['/es/', '/en/', '/es/proyectos/tuenti/']) {
    await page.goto(url);
    const meta = (sel: string, attr = 'content') => page.locator(sel).first().getAttribute(attr);
    expect(await meta('meta[property="og:image"]')).toBe('https://portfolio.eclipse-business.com/og.png');
    expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
    expect(await meta('link[rel="canonical"]', 'href')).toContain(`https://portfolio.eclipse-business.com${url}`);
    expect(await page.locator('link[rel="alternate"][hreflang]').count()).toBeGreaterThanOrEqual(2);
    expect((await page.title()).length).toBeLessThan(70);
  }
});

test('reduced motion: nothing stays hidden waiting for a scroll animation', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await enter(page, 'http://127.0.0.1:4173/es/');
  const hidden = await page.evaluate(() => Array.from(document.querySelectorAll('.reveal')).filter((e) => Number(getComputedStyle(e).opacity) < 1).length);
  expect(hidden).toBe(0);
  await ctx.close();
});
