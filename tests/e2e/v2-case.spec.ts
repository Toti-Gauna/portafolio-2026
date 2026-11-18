import { expect, type Page, test } from '@playwright/test';

// Lote 5.1: the case pages of /v2. A ten-second film opens each one (four chapters: the product, what it does, in
// use, where it stands), then «En 10 segundos», how it works, the gallery, three decisions, what it is built with,
// the depth folded and the next case. The film plays once, can be paused and jumped with ← →, and ends still.

const countFrames = (page: Page) => page.addInitScript(() => {
  const w = window as unknown as { __raf?: number };
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => { w.__raf = (w.__raf ?? 0) + 1; return raf(cb); };
});
const frames = (page: Page) => page.evaluate(() => (window as unknown as { __raf?: number }).__raf ?? 0);
const shown = (page: Page, sel: string) => page.locator(sel).first().evaluate((el) => Number(getComputedStyle(el).opacity));

test('the film plays once, in four chapters, can be paused and jumped, and ends still', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const clips: string[] = [];
  page.on('request', (r) => { if (r.url().endsWith('.mp4')) clips.push(r.url()); });
  await countFrames(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/complia/');
  const film = page.locator('.cf');
  await expect(film).toHaveAttribute('data-run', 'play');
  // the name comes first, the product later: at the start the panel waits out of sight, and its clip is not asked for
  await expect(page.getByRole('heading', { level: 1, name: 'CompliA' })).toBeVisible();
  expect(await shown(page, '.cf-panel')).toBe(0);
  expect(clips).toEqual([]);
  // pause: the time stops
  const bar = page.getByRole('group', { name: /Película del caso/ });
  await page.waitForTimeout(1200);
  await bar.getByRole('button', { name: 'Pausar la película' }).click();
  const at = await page.locator('.cf-time').textContent();
  await page.waitForTimeout(700);
  expect(await page.locator('.cf-time').textContent()).toBe(at);
  // jump to the third chapter: the product is in, its clip is asked for once the film plays again
  await bar.getByRole('button', { name: 'Capítulo 3: En uso' }).click();
  await expect(bar.getByRole('button', { name: 'Capítulo 3: En uso' })).toHaveAttribute('aria-current', 'true');
  await expect.poll(() => shown(page, '.cf-panel')).toBe(1);
  // ← → move between chapters
  await bar.getByRole('button', { name: 'Capítulo 3: En uso' }).press('ArrowRight');
  await expect(bar.getByRole('button', { name: 'Capítulo 4: Dónde está' })).toHaveAttribute('aria-current', 'true');
  await bar.getByRole('button', { name: 'Capítulo 4: Dónde está' }).press('ArrowLeft');
  await expect(bar.getByRole('button', { name: 'Capítulo 3: En uso' })).toHaveAttribute('aria-current', 'true');
  await bar.getByRole('button', { name: 'Reproducir la película' }).click();
  await expect.poll(() => clips.length).toBeGreaterThan(0);
  // it ends on its last frame: the three verbs (the last one lit), the figure, the state; then nothing asks for frames
  await expect(film).toHaveAttribute('data-run', 'end', { timeout: 15_000 });
  await expect(bar.getByRole('button', { name: 'Repetir la película' })).toBeVisible();
  for (const v of ['Preguntá.', 'Analizá.', 'Dictaminá.']) expect(await shown(page, `.cf-verb:text-is("${v}")`)).toBe(1);
  await expect(page.locator('.cf-verb[data-now]')).toHaveText('Dictaminá.');
  await expect(page.locator('.cf-numbers')).toContainText('4');
  await expect(page.locator('.cf-status')).toContainText('En producción interna');
  await page.mouse.move(5, 890);
  await page.waitForTimeout(800);
  const f0 = await frames(page);
  await page.waitForTimeout(1500);
  expect(await frames(page)).toBe(f0);
  expect(errors).toEqual([]);
});

test('three layers: 10 seconds, how it works and three decisions in view; the depth folded; the next case', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto('/v2/es/work/eclipse/');
  for (const h of ['En 10 segundos', 'Cómo funciona', 'Galería', 'Tres decisiones', 'Con qué está hecho']) await expect(page.getByRole('heading', { level: 2, name: h })).toBeAttached();
  await expect(page.locator('.cs2-ten li')).toHaveCount(3);
  await expect(page.locator('.cs2-decisions li')).toHaveCount(3);
  // the depth is folded until someone asks
  const more = page.locator('.cs2-depth details');
  await expect(more).not.toHaveAttribute('open');
  await more.locator('summary').click();
  await expect(more).toHaveAttribute('open', '');
  await expect(more.locator('.cs2-more').first()).toBeVisible();
  // the public link opens in a new tab and says so
  const site = page.getByRole('link', { name: /Ver el sitio/ });
  await expect(site).toHaveAttribute('target', '_blank');
  // the gallery: a clip is a poster until the pointer or its button asks for it
  const asked: string[] = [];
  page.on('request', (r) => { if (r.url().includes('/media/eclipse/portal-clientes.mp4')) asked.push(r.url()); });
  const shot = page.locator('.cs2-shot').first();
  await shot.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  expect(asked).toEqual([]);
  await shot.getByRole('button', { name: /Reproducir/ }).click();
  await expect.poll(() => asked.length).toBeGreaterThan(0);
  // the next case, compact, and the way back to the world
  const next = page.getByRole('navigation', { name: 'Siguiente caso' });
  await expect(next.getByRole('link', { name: /Sistema agéntico/ })).toHaveAttribute('href', /\/v2\/es\/work\/agentes\/$/);
  await next.getByRole('link', { name: /Sistema agéntico/ }).click();
  await expect(page).toHaveURL(/\/v2\/es\/work\/agentes\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sistema agéntico');
});

test('without JavaScript, and with reduced motion, the film is its last frame', async ({ browser }) => {
  for (const opts of [{ javaScriptEnabled: false }, { reducedMotion: 'reduce' as const }]) {
    const ctx = await browser.newContext({ ...opts, viewport: { width: 1280, height: 860 } });
    const page = await ctx.newPage();
    const clips: string[] = [];
    page.on('request', (r) => { if (r.url().endsWith('.mp4')) clips.push(r.url()); });
    await page.goto('/v2/es/work/dentalos/');
    await page.waitForTimeout(900);
    for (const sel of ['.cf-title', '.cf-line', '.cf-verb', '.cf-numbers', '.cf-status', '.cf-panel', '.cf-stamp']) expect(await shown(page, sel), `${sel} ${JSON.stringify(opts)}`).toBe(1);
    // nothing plays by itself, and no clip is downloaded
    await expect(page.locator('.cf-bar')).toBeHidden();
    expect(clips).toEqual([]);
    await ctx.close();
  }
});

test('a case is one click away from the home and from the world', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto('/v2/es/');
  await expect(page.locator('.hc-card h3 a').first()).toHaveAttribute('href', /\/v2\/es\/work\/complia\/$/);
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  // the card of Tsoft holds three cases; the list below too
  for (const name of ['TACH Argentina', 'Ada ITW', 'Tsoft']) { await page.getByRole('button', { name: 'Parada siguiente' }).click(); await expect(page.locator('.ws-now b')).toHaveText(name); }
  await expect.poll(() => page.evaluate(() => new Promise<boolean>((done) => { const v = document.querySelector('.ws-view')!, x = v.scrollLeft; setTimeout(() => done(v.scrollLeft === x), 150); }))).toBe(true);
  await page.getByRole('button', { name: 'Más información · Tsoft' }).click();
  const dialog = page.getByRole('dialog', { name: 'Tsoft' });
  await expect(dialog.getByRole('link', { name: /Ver caso/ })).toHaveCount(3);
  await dialog.getByRole('link', { name: 'Ver caso · Tuenti' }).click();
  await expect(page).toHaveURL(/\/v2\/es\/work\/tuenti\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tuenti');
  // Tuenti: my own illustration, never a capture
  await expect(page.locator('.cf-panel img')).toHaveAttribute('src', /tuenti-cover\.svg$/);
  await page.goto('/v2/es/work/');
  await expect(page.locator('#lista .wd-card[data-id="eclipse"] .wd-case')).toHaveAttribute('href', /\/v2\/es\/work\/eclipse\/$/);
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });
  test('one column, nothing wider than the screen, readable and touchable', async ({ page }) => {
    for (const slug of ['velmar', 'agentes']) {
      await page.goto(`/v2/es/work/${slug}/`);
      await expect(page.locator('.cf')).toHaveAttribute('data-ready', 'true');
      const report = await page.evaluate(() => {
        const small: string[] = [], tiny: string[] = [];
        for (const el of document.querySelectorAll('.cs2 *')) {
          const b = el.getBoundingClientRect(), cs = getComputedStyle(el);
          if (!b.width || cs.visibility === 'hidden' || cs.display === 'none' || el.closest('.ui-sr, svg')) continue;
          if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()) && parseFloat(cs.fontSize) < 12) small.push(`${el.className}`);
          // the size it is laid out at (a part of the film may be turning in as it is measured)
          const box = el as HTMLElement;
          if (el.matches('.cs2 a, .cs2 button, .cs2 summary') && Math.min(box.offsetWidth, box.offsetHeight) < 44) tiny.push(`${el.className || el.tagName}: ${el.textContent!.slice(0, 20)}`);
        }
        return { small, tiny, wide: document.documentElement.scrollWidth > innerWidth };
      });
      expect(report, slug).toEqual({ small: [], tiny: [], wide: false });
    }
  });
});

test('in English', async ({ page }) => {
  await page.goto('/v2/en/work/games/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('games-market');
  for (const h of ['In 10 seconds', 'How it works', 'Three decisions']) await expect(page.getByRole('heading', { level: 2, name: h })).toBeAttached();
  await expect(page.locator('.cs2-nextstep')).toHaveText(/^Next step: /);
  await expect(page.getByRole('navigation', { name: 'Next case' }).getByRole('link', { name: /CompliA/ })).toHaveAttribute('href', /\/v2\/en\/work\/complia\/$/);
});
