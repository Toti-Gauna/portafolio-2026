import { expect, test, type Page } from '@playwright/test';

// Animated background (components/scene): one fixed canvas behind the content, three loaded after the boot screen.
type SceneDebug = { id: string | null; state: string; frames: number; looping: boolean; memory: () => { geometries: number } };
const read = (page: Page) =>
  page.evaluate(() => {
    const s = (window as unknown as { __igScene?: SceneDebug }).__igScene;
    const el = document.querySelector('.scene');
    return { attr: el?.getAttribute('data-state') ?? null, scene: el?.getAttribute('data-scene') ?? null, id: s?.id ?? null, state: s?.state ?? null, frames: s?.frames ?? 0, looping: s?.looping ?? false, geometries: s ? s.memory().geometries : 0 };
  });

async function enter(page: Page, url: string) {
  await page.goto(url);
  const name = url.includes('/en/') ? 'View portfolio' : 'Ver portafolio';
  await expect(page.getByRole('button', { name })).toBeVisible({ timeout: 20000 });
  await page.getByRole('button', { name }).click();
  await expect(page.locator('#boot')).toHaveCount(0);
}

test('home: the canvas is behind the content and the scene runs after the intro', async ({ page }) => {
  await page.goto('/es/');
  // server HTML: the layer and the route's scene are there before any JS, three is not
  await expect(page.locator('.scene[data-scene="home"] canvas')).toHaveCount(1);
  expect(await page.evaluate(() => 'THREE' in window || '__igScene' in window)).toBe(false);
  await page.getByRole('button', { name: 'Ver portafolio' }).click();
  await expect(page.locator('#boot')).toHaveCount(0);
  await expect.poll(async () => (await read(page)).attr, { timeout: 15000 }).toMatch(/^(running|fallback)$/);
  const a = await read(page);
  test.skip(a.attr === 'fallback', 'no WebGL in this browser: the CSS light is the background');
  expect(a.id).toBe('home');
  await page.waitForTimeout(600);
  expect((await read(page)).frames).toBeGreaterThan(a.frames);
  // stacking: the layer never takes clicks and sits under #app-shell
  const z = await page.evaluate(() => {
    const scene = getComputedStyle(document.querySelector('.scene')!);
    const shell = getComputedStyle(document.getElementById('app-shell')!);
    return { pe: scene.pointerEvents, pos: scene.position, scene: Number(scene.zIndex), shell: Number(shell.zIndex) };
  });
  expect(z).toEqual({ pe: 'none', pos: 'fixed', scene: 0, shell: 1 });
  await expect(page.getByRole('link', { name: 'Escribime' }).first()).toBeVisible();
});

test('reduced motion: one still frame, no RAF loop', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await enter(page, 'http://127.0.0.1:4173/es/');
  await expect.poll(async () => (await read(page)).attr, { timeout: 15000 }).toMatch(/^(still|fallback)$/);
  const a = await read(page);
  if (a.attr === 'still') {
    expect(a.frames).toBe(1);
    expect(a.looping).toBe(false);
  }
  await page.waitForTimeout(1500);
  const b = await read(page);
  expect(b.frames).toBe(a.frames);
  expect(b.looping).toBe(false);
  await ctx.close();
});

test('navigating swaps the scene and disposes the old one', async ({ page }) => {
  await enter(page, '/es/');
  await expect.poll(async () => (await read(page)).attr, { timeout: 15000 }).toMatch(/^(running|fallback)$/);
  test.skip((await read(page)).attr === 'fallback', 'no WebGL');
  await page.locator('a[href*="/proyectos/complia"]').first().click();
  await expect(page).toHaveURL(/\/proyectos\/complia\/?$/);
  await expect(page.locator('.scene')).toHaveAttribute('data-scene', 'complia');
  await expect.poll(async () => (await read(page)).id, { timeout: 15000 }).toBe('complia');
  // only the new scene's geometries are left on the GPU
  expect((await read(page)).geometries).toBeLessThanOrEqual(4);
});

test('Save-Data: the CSS light only, three is never loaded', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true }));
  await enter(page, '/es/proyectos/eclipse/');
  await expect(page.locator('.scene')).toHaveAttribute('data-state', 'fallback');
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => '__igScene' in window)).toBe(false);
  const bg = await page.locator('.scene').evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(bg).toContain('radial-gradient');
});
