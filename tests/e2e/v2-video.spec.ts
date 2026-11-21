import { expect, type Page, test } from '@playwright/test';

// Lote 7.2: «Video» of /v2. A wall of films with a silent preview under the mouse, filters by type and format, and a
// modal player; fewer than 60 words outside the captions.

type Wall = { shown: number; open: string | null };
const wall = (page: Page) => page.evaluate(() => (window as unknown as { __igWall: () => Wall }).__igWall());
const mp4s = (page: Page) => { const seen: string[] = []; page.on('request', (r) => { if (r.url().endsWith('.mp4')) seen.push(r.url()); }); return seen; };

test('the wall: 25 films, the trailer first, fewer than 60 words outside the captions, nothing downloaded', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const seen = mp4s(page);
  await page.goto('/v2/es/video/');
  await expect(page.locator('h1')).toHaveText('Todo, en movimiento.');
  await expect(page.locator('.vw-cell')).toHaveCount(25);
  await expect(page.locator('.vw-cell').first()).toHaveAttribute('data-feature', '');
  await expect(page.locator('.vw-tile').first()).toHaveAttribute('href', '/trailer/v2/index.html?lang=es');
  await expect(page.locator('.vw-tile').nth(1)).toHaveAttribute('href', '/trailer/v2/index.html?lang=es&o=v');
  const words = await page.locator('main').evaluate((m) => {
    const c = m.cloneNode(true) as HTMLElement;
    c.querySelectorAll('.vw-cap, dialog').forEach((e) => e.remove());
    return c.innerText.split(/\s+/).filter(Boolean).length;
  });
  expect(words).toBeLessThan(60);
  await page.waitForTimeout(800);
  expect(seen).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});

test('filters by type and format, with the count announced', async ({ page }) => {
  await page.goto('/v2/es/video/');
  const count = page.locator('.vw-count');
  await expect(count).toContainText('25 películas');
  await page.locator('.vw-group', { hasText: 'Tipo' }).getByRole('button', { name: 'Motion' }).click();
  await expect(count).toContainText('5 películas');
  await expect(page.locator('.vw-cell:not([hidden])')).toHaveCount(5);
  for (const c of await page.locator('.vw-cell:not([hidden])').all()) await expect(c).toHaveAttribute('data-kind', 'motion');
  await page.locator('.vw-group', { hasText: 'Tipo' }).getByRole('button', { name: 'Todo' }).click();
  await page.locator('.vw-group', { hasText: 'Formato' }).getByRole('button', { name: 'Celular' }).click();
  const tall = await page.locator('.vw-cell:not([hidden])').count();
  expect(tall).toBeGreaterThanOrEqual(5);
  for (const c of await page.locator('.vw-cell:not([hidden])').all()) await expect(c).toHaveAttribute('data-shape', 'tall');
  await page.locator('.vw-group', { hasText: 'Tipo' }).getByRole('button', { name: 'Tráiler' }).click();
  await expect(count).toContainText('1 película');
  await expect(page.locator('.vw-group', { hasText: 'Formato' }).getByRole('button', { name: 'Celular' })).toHaveAttribute('aria-pressed', 'true');
  expect((await wall(page)).shown).toBe(1);
});

test('a mouse plays a silent preview, requested only then, and stops it when it leaves', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const seen = mp4s(page);
  await page.goto('/v2/es/video/');
  const tile = page.locator('.vw-tile[data-film="volta-panel"]');
  await tile.scrollIntoViewIfNeeded();
  await tile.hover();
  await expect(tile).toHaveAttribute('data-playing', '');
  expect(seen.some((u) => u.endsWith('/media/volta/panel.mp4'))).toBe(true);
  expect(await tile.locator('video').evaluate((v: HTMLVideoElement) => v.muted && !v.paused)).toBe(true);
  await page.mouse.move(5, 5);
  await expect(tile).not.toHaveAttribute('data-playing', '');
  expect(await tile.locator('video').evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

test('the player: opens a film with its words and its case, walks the films, closes back to the tile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/video/');
  const tile = page.locator('.vw-tile[data-film="eclipse-portal-clientes"]');
  await tile.scrollIntoViewIfNeeded();
  await tile.click();
  const dlg = page.locator('dialog.vp');
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('h2')).toHaveText('Eclipse');
  await expect(dlg.locator('.vp-cap')).toHaveText('Portal de clientes en modo demo: de Mis proyectos al detalle.');
  await expect(dlg.locator('video')).toHaveAttribute('src', '/media/eclipse/portal-clientes.mp4');
  await expect(dlg.locator('video')).toHaveAttribute('controls', '');
  await expect(dlg.getByRole('link', { name: 'Ver el caso' })).toHaveAttribute('href', '/v2/es/work/eclipse/');
  await expect(dlg.getByRole('button', { name: 'Cerrar' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await wall(page)).open).toBe('eclipse-portal-interno');
  await dlg.getByRole('button', { name: 'Película anterior' }).click();
  await expect.poll(async () => (await wall(page)).open).toBe('eclipse-portal-clientes');
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
  await expect(tile).toBeFocused();
  // the trailer is a link to the trailer itself
  await expect(page.locator('.vw-tile').first()).not.toHaveAttribute('aria-haspopup', 'dialog');
});

test('with the keyboard, reduced motion and without JavaScript', async ({ browser }) => {
  const calm = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 860 } });
  const page = await calm.newPage();
  const seen = mp4s(page);
  await page.goto('/v2/es/video/');
  const tile = page.locator('.vw-tile[data-film="dentalos-recepcion"]');
  await tile.scrollIntoViewIfNeeded();
  await tile.hover();
  await page.waitForTimeout(400);
  await expect(tile).not.toHaveAttribute('data-playing', '');
  expect(seen).toEqual([]);
  await tile.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('dialog.vp')).toBeVisible();
  expect(await page.locator('dialog.vp video').evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await calm.close();

  const plain = await browser.newContext({ javaScriptEnabled: false });
  const p2 = await plain.newPage();
  await p2.goto('/v2/es/video/');
  await expect(p2.locator('.vw-bar')).toBeHidden();
  await expect(p2.locator('.vw-cell')).toHaveCount(25);
  await expect(p2.locator('.vw-tile[data-film="games-ninja"]')).toHaveAttribute('href', '/media/games/ninja.mp4');
  await plain.close();
});

test('on a 360 px phone the wall keeps its rhythm and the player fits', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/v2/es/video/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  const wide = (await page.locator('.vw-cell[data-film], .vw-cell').nth(2).boundingBox())!;
  expect(wide.width).toBeGreaterThan(300);
  for (const b of await page.locator('.vw-chip').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  const tile = page.locator('.vw-tile[data-film="velmar-collar-en-vivo"]');
  await tile.scrollIntoViewIfNeeded();
  await tile.click();
  const box = (await page.locator('dialog.vp').boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(360);
});

test('the ways in: the foot of every page, the home and Work; and in English', async ({ page }) => {
  await page.goto('/v2/es/sobre-mi/');
  await expect(page.locator('.sf').getByRole('link', { name: 'Video' })).toHaveAttribute('href', '/v2/es/video/');
  await page.goto('/v2/es/');
  await expect(page.locator('#explorar').getByRole('link', { name: /Video/ })).toHaveAttribute('href', '/v2/es/video/');
  await page.goto('/v2/es/work/');
  await expect(page.getByRole('link', { name: 'Ver los videos' })).toHaveAttribute('href', '/v2/es/video/');
  await page.goto('/v2/en/video/');
  await expect(page.locator('h1')).toHaveText('Everything, in motion.');
  await expect(page.locator('.vw-count')).toContainText('25 films');
  await expect(page.locator('.vw-tile').first()).toHaveAttribute('href', '/trailer/v2/index.html?lang=en');
});
