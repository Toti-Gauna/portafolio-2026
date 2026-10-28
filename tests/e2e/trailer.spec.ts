import { expect, test, type Page } from '@playwright/test';

async function openTrailer(page: Page, url = '/es/', names = { skip: 'Saltar', trailer: 'Conocer a Ignacio' }) {
  await page.goto(url);
  await expect(async () => {
    if (await page.getByRole('button', { name: names.trailer }).isVisible()) return;
    await page.getByRole('button', { name: names.skip }).first().click({ timeout: 500 });
    await expect(page.getByRole('button', { name: names.trailer })).toBeVisible({ timeout: 500 });
  }).toPass();
  await page.getByRole('button', { name: names.trailer }).click();
}

const film = (page: Page) => page.locator('iframe.tplayer__frame');
async function ready(page: Page) {
  await expect(film(page)).toHaveCount(1);
  await expect(page.frameLocator('iframe.tplayer__frame').locator('html')).toHaveAttribute('data-trailer', 'ready', { timeout: 15000 });
  await expect(page.locator('.tplayer__loading')).toHaveCount(0, { timeout: 15000 }); // after the warm-up pass
}

test('the trailer plays fullscreen with no player bar; sound and skip work; no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.setViewportSize({ width: 1280, height: 720 });
  await openTrailer(page);
  const dialog = page.getByRole('dialog', { name: 'Conocer a Ignacio' });
  await expect(dialog).toBeVisible();
  await expect(film(page)).toHaveAttribute('src', /\/trailer\/v2\/index\.html\?host&lang=es$/);
  await ready(page);

  // the film covers the whole screen; there is no progress bar, in the page or in the film
  const box = await film(page).boundingBox();
  expect(box).toEqual({ x: 0, y: 0, width: 1280, height: 720 });
  await expect(dialog.getByRole('slider')).toHaveCount(0);
  const frame = page.frameLocator('iframe.tplayer__frame');
  await expect(frame.locator('#ui')).toBeHidden();
  await expect(frame.locator('html')).toHaveAttribute('data-duration', '120.00');

  // the controls step aside while the film plays, and come back when the pointer moves over it
  const player = page.locator('.tplayer');
  await expect(player).toHaveAttribute('data-ui', 'false', { timeout: 5000 });
  const controls = page.locator('.tplayer__ctl');
  await expect(controls).toHaveCSS('opacity', '0');
  await page.keyboard.press('Tab'); // the keyboard brings them back, with the focus ring on the first one
  await expect(page.getByRole('button', { name: 'Silenciar' })).toBeFocused();
  await expect(controls).toHaveCSS('opacity', '1');
  await page.locator('.tplayer').focus();
  await expect(player).toHaveAttribute('data-ui', 'false', { timeout: 5000 });
  await page.mouse.move(640, 600);
  await page.mouse.move(660, 610);
  await expect(player).toHaveAttribute('data-ui', 'true');

  await page.getByRole('button', { name: 'Silenciar' }).click();
  await expect(page.getByRole('button', { name: 'Activar sonido' })).toBeVisible();

  await page.getByRole('button', { name: 'Saltar al portafolio' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ignacio');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('when the film ends it hands off to the portfolio', async ({ page }) => {
  await openTrailer(page, '/es/?t=118.6'); // ?t= opens the film paused on that frame
  await ready(page);
  await page.evaluate(() => document.querySelector('iframe')!.contentWindow!.postMessage({ type: 'trailer:play' }, location.origin));
  await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 8000 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('English film, and Escape leaves it', async ({ page }) => {
  await openTrailer(page, '/en/', { skip: 'Skip', trailer: 'Meet Ignacio' });
  await expect(film(page)).toHaveAttribute('src', /lang=en$/);
  await ready(page);
  await expect(page.frameLocator('iframe.tplayer__frame').locator('html')).toHaveAttribute('lang', 'en');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('portrait screens get the 9:16 edition: the same 120 s film on a tall stage, kept if the phone turns', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openTrailer(page);
  await expect(film(page)).toHaveAttribute('src', /\/trailer\/v2\/index\.html\?host&lang=es&o=v$/);
  await ready(page);
  const frame = page.frameLocator('iframe.tplayer__frame');
  await expect(frame.locator('html')).toHaveClass(/\bis-vertical\b/);
  await expect(frame.locator('html')).toHaveAttribute('data-stage', '1080x1920');
  await expect(frame.locator('html')).toHaveAttribute('data-duration', '120.00');
  // the tall stage fits the phone's width; nothing scrolls sideways
  const stage = await frame.locator('#stage').boundingBox();
  expect(stage!.width).toBeLessThanOrEqual(391);
  expect(stage!.height).toBeGreaterThan(stage!.width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  await expect(page.getByRole('heading', { name: 'Girá el teléfono' })).toHaveCount(0);
  // turning the phone mid-film keeps the film running in its format (no reload); the next opening picks again.
  // The opening click asked for fullscreen; a window in fullscreen can't be resized by the test (a phone just rotates).
  await page.evaluate(() => (document.fullscreenElement ? document.exitFullscreen() : undefined));
  const html = await frame.locator('html').elementHandle();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(film(page)).toHaveAttribute('src', /&o=v$/);
  expect(await html!.evaluate((el) => el.isConnected && el.classList.contains('is-vertical'))).toBe(true);
  await html!.dispose();
});

test('phones get the light film: no stage-sized compositor layers anywhere in the 9:16 film', async ({ browser }) => {
  // iOS Safari backs each layer at its CSS size × DPR even when the stage is scaled down: one 1080×1920 layer is
  // 75 MB at DPR 3, and several at once crashed the tab. Chromium's layer tree is the proxy we can check here.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto('/trailer/v2/index.html?host&lang=es&o=v&t=0.5');
  await expect(page.locator('html')).toHaveAttribute('data-trailer', 'ready');
  await expect(page.locator('html')).toHaveClass(/\bis-lite\b/);
  await expect(page.locator('#fx')).toBeHidden(); // no canvas scene, no canvas
  const cdp = await ctx.newCDPSession(page);
  let layers: { width: number; height: number; drawsContent: boolean }[] = [];
  cdp.on('LayerTree.layerTreeDidChange', (e) => { if (e.layers) layers = e.layers; });
  await cdp.send('LayerTree.enable');
  for (const t of [3, 11, 20, 33, 45, 51, 56, 64, 75, 90, 102, 112]) {
    await page.evaluate((t) => { (window as unknown as { trailer: { tl: { seek: (t: number, e: boolean) => void } } }).trailer.tl.seek(t, false); }, t);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.waitForTimeout(150);
    // the page's own viewport-sized layers aside, nothing bigger than 30 % of the stage gets a layer. The CompliA
    // clip (30–36 s) is the exception: a playing video always has a layer, and its container (the stage) gets one too
    const big = layers.filter((l) => l.drawsContent && l.width * l.height > 0.3 * 1080 * 1920 && !(l.width <= 390 && l.height <= 844));
    expect(big.length, `t=${t}: ${big.map((l) => `${l.width}x${l.height}`).join(' ')}`).toBeLessThanOrEqual(t === 33 ? 1 : 0);
  }
  await ctx.close();
});

test('reduced motion: text version instead of the film, with a way to watch it anyway', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await openTrailer(page, 'http://127.0.0.1:4173/es/');
  await expect(page.getByRole('heading', { name: 'Versión en texto' })).toBeVisible();
  await expect(page.locator('.tplayer__list li')).toHaveCount(15);
  await expect(page.getByRole('heading', { name: 'Versión en texto' })).toBeFocused(); // reading starts at the top
  await expect(page.locator('.tplayer__list li').first()).toBeInViewport();
  await expect(film(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Ver la animación igual' }).click();
  await expect(film(page)).toHaveCount(1);
  await ctx.close();
});
