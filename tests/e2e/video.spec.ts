import { expect, test, type Page } from '@playwright/test';

async function enter(page: Page, url: string) {
  await page.goto(url);
  const [skip, go] = url.includes('/en/') ? ['Skip', 'View portfolio'] : ['Saltar', 'Ver portafolio'];
  await expect(async () => {
    if (await page.getByRole('button', { name: go }).isVisible()) return;
    await page.getByRole('button', { name: skip }).first().click({ timeout: 500 });
    await expect(page.getByRole('button', { name: go })).toBeVisible({ timeout: 500 });
  }).toPass();
  await page.getByRole('button', { name: go }).click();
  await expect(page.locator('#boot')).toBeHidden();
  await expect(page.locator('#app-shell')).not.toHaveAttribute('inert', '');
  await page.waitForTimeout(300);
}

test('video: sections, the code-made trailers and a group per project with its status and case link', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await enter(page, '/es/video/');
  await expect(page.locator('main h1')).toHaveText('Video y tráileres.');
  await expect(page.locator('.bz-toc a')).toHaveCount(4);
  await expect(page.locator('#code .show__item')).toHaveCount(6);
  await expect(page.locator('.vd-group')).toHaveCount(7);
  await expect(page.locator('.vd-group__head .stag')).toHaveCount(7);
  const links = await page.locator('.vd-group__head a.card-link').evaluateAll((as) => as.map((a) => new URL((a as HTMLAnchorElement).href).pathname));
  expect(links).toEqual(['eclipse', 'complia', 'volta', 'velmar', 'dentalos', 'supernova', 'games'].map((s) => `/es/proyectos/${s}/`));
  await expect(page.locator('.vd-test')).toContainText('no está en este repositorio');
  expect(errors).toEqual([]);
});

test('video: «Ver Conocer a Ignacio» opens the trailer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/video/');
  await page.locator('#code').getByRole('button', { name: /Conocer a Ignacio/ }).click();
  await expect(page.locator('dialog[open]')).toBeVisible();
});

test('video: the videos are lazy, with a pause button each; one starts when it reaches the screen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/video/');
  const vids = page.locator('video');
  expect(await vids.count()).toBeGreaterThanOrEqual(20);
  for (const preload of await vids.evaluateAll((vs) => vs.map((v) => (v as HTMLVideoElement).preload))) expect(preload).toBe('none');
  await expect(page.locator('.mp__btn')).toHaveCount(await vids.count());
  const first = page.locator('#code video').first();
  await first.scrollIntoViewIfNeeded();
  await expect.poll(() => first.evaluate((v) => !(v as HTMLVideoElement).paused), { timeout: 8000 }).toBe(true);
});

test('video on a phone and in English: no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await enter(page, '/en/video/');
  await expect(page.locator('main h1')).toHaveText('Video and trailers.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  await expect(page.locator('.vd-group')).toHaveCount(7);
});

test('video with reduced motion: no video starts by itself', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await enter(page, '/es/video/');
  const first = page.locator('#code video').first();
  await first.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  expect(await first.evaluate((v) => (v as HTMLVideoElement).paused)).toBe(true);
  await ctx.close();
});

test('the footer and the home chapter lead to the video page; the Kinetic case shows the current film', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/');
  const hrefs = await page.locator('.tch--video a.tch__go').evaluateAll((as) => as.map((a) => new URL((a as HTMLAnchorElement).href).pathname));
  expect(hrefs).toContain('/es/video/');
  await page.goto('/es/proyectos/kinetic/#paso-how');
  await expect(page.locator('#paso-how')).toContainText('130 segundos en siete actos');
});
