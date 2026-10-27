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

test('trailer opens, plays, pauses, seeks, toggles sound and has no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await openTrailer(page);
  const dialog = page.getByRole('dialog', { name: 'Conocer a Ignacio' });
  await expect(dialog).toBeVisible();
  const pauseBtn = page.getByRole('button', { name: 'Pausar' });
  await expect(pauseBtn).toBeVisible({ timeout: 8000 }); // it autoplays once built
  await pauseBtn.click();
  await expect(page.getByRole('button', { name: 'Reproducir' })).toBeVisible();

  const range = page.getByRole('slider', { name: 'Progreso del tráiler' });
  await range.fill('50');
  await expect(range).toHaveAttribute('aria-valuetext', /0:50 \/ 2:00/);
  await expect(page.locator('[data-k="card-tuenti"]')).toBeVisible();
  await range.fill('110');
  await expect(page.locator('[data-k="role"]')).toBeVisible();

  const sound = page.getByRole('button', { name: 'Activar sonido' });
  await expect(sound).toHaveAttribute('aria-pressed', 'false'); // sound starts off
  await sound.click();
  await expect(page.getByRole('button', { name: 'Silenciar' })).toHaveAttribute('aria-pressed', 'true');

  await page.locator('.stage').click({ position: { x: 5, y: 5 } }); // focus leaves the buttons
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Pausar' })).toBeVisible();
  await page.getByRole('button', { name: 'Saltar al portafolio' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ignacio');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('the trailer ends by itself and lands on the portfolio', async ({ page }) => {
  await openTrailer(page, '/es/?t=118.5');
  await page.getByRole('button', { name: 'Reproducir' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 8000 });
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('English trailer and portrait layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openTrailer(page, '/en/?t=110', { skip: 'Skip', trailer: 'Meet Ignacio' });
  await expect(page.locator('.stage')).toHaveAttribute('data-o', 'portrait');
  await expect(page.locator('[data-k="role"]')).toContainText('Ssr AI Fullstack Developer');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

test('reduced motion: text version instead of the animation, with a way to watch it anyway', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await openTrailer(page, 'http://127.0.0.1:4173/es/');
  await expect(page.getByRole('heading', { name: 'Versión en texto' })).toBeVisible();
  await expect(page.locator('.trailer__list li')).toHaveCount(11);
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Ver la animación igual' }).click();
  await expect(page.locator('canvas')).toHaveCount(1);
  await ctx.close();
});

test('focus lands on play when ready; sound survives a rotation; small screens keep text readable', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openTrailer(page, '/es/?t=96');
  await expect(page.getByRole('button', { name: 'Reproducir' })).toBeFocused();
  await page.getByRole('button', { name: 'Activar sonido' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.stage')).toHaveAttribute('data-o', 'portrait');
  await expect(page.getByRole('button', { name: 'Silenciar' })).toHaveAttribute('aria-pressed', 'true');
  // rotation keeps the frame (no jump back to ?t)
  await expect(page.getByRole('slider', { name: 'Progreso del tráiler' })).toHaveValue('96');
  const tiny = await page.evaluate(() => Array.from(document.querySelectorAll('.stage .tx, .stage .tx *')).filter((e) => {
    const cs = getComputedStyle(e);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.5 && e.getBoundingClientRect().height > 0 && parseFloat(cs.fontSize) < 12;
  }).length);
  expect(tiny).toBe(0);
});
