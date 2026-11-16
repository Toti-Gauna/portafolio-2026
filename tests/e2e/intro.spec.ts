import { expect, test, type Page } from '@playwright/test';

// The server HTML already has the boot screen; its buttons only work once React has hydrated.
async function skipBoot(page: Page, skip: string, next: string) {
  await expect(async () => {
    if (await page.getByRole('button', { name: next }).isVisible()) return; // the gate may already be up
    await page.getByRole('button', { name: skip }).click({ timeout: 500 });
    await expect(page.getByRole('button', { name: next })).toBeVisible({ timeout: 500 });
  }).toPass();
}

test('boot screen shows on every load, then the gate, then the portfolio', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  for (let i = 0; i < 2; i++) {
    await page.goto('/es/');
    await expect(page.getByRole('status')).toContainText('Cargando');
    // The page content is in the HTML but inert while the boot screen is up.
    await expect(page.locator('#app-shell')).toHaveAttribute('inert', '');
    const gate = page.getByRole('button', { name: 'Ver portafolio' });
    await expect(gate).toBeVisible();
    await expect(page.getByRole('button', { name: 'Conocer a Ignacio' })).toBeFocused();
    await gate.click();
    await expect(page.locator('#boot')).toHaveCount(0);
    await expect(page.locator('#app-shell')).not.toHaveAttribute('inert', '');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ignacio');
  }
  expect(errors).toEqual([]);
});

test('skip jumps to the gate; Escape closes it; trailer opens and closes', async ({ page }) => {
  await page.goto('/en/');
  await skipBoot(page, 'Skip', 'Meet Ignacio');
  await page.getByRole('button', { name: 'Meet Ignacio' }).click();
  const dialog = page.getByRole('dialog', { name: 'Meet Ignacio' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#boot')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Write to me' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Watch the trailer' }).click();
  await expect(page.getByRole('dialog', { name: 'Meet Ignacio' })).toBeVisible();
});

test('language switch keeps the page and the root redirects', async ({ page }) => {
  await page.goto('/es/');
  await skipBoot(page, 'Saltar', 'Ver portafolio');
  await page.getByRole('button', { name: 'Ver portafolio' }).click();
  await page.getByRole('link', { name: 'EN', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/$/);
  await page.goto('/');
  await expect(page).toHaveURL(/\/(es|en)\/$/);
});

test('no horizontal overflow at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/es/');
  await skipBoot(page, 'Saltar', 'Ver portafolio');
  await page.getByRole('button', { name: 'Ver portafolio' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

test('reduced motion: boot screen still works and finishes quickly', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${process.env.PW_PORT ?? 4173}/es/`);
  await expect(page.getByRole('button', { name: 'Ver portafolio' })).toBeVisible({ timeout: 2000 });
  await ctx.close();
});

test('the gate shows the halftone eclipse and fits a short phone in landscape', async ({ page }) => {
  await page.setViewportSize({ width: 568, height: 320 });
  await page.goto('/es/');
  await expect(page.getByRole('button', { name: 'Ver portafolio' })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Conocer a Ignacio' })).toBeInViewport();
  await expect(page.locator('.boot__eclipse svg')).toHaveCount(2);
});

test('both doors turn the sound on; a visitor who switched it off stays off', async ({ page }) => {
  await page.goto('/es/');
  const gate = page.getByRole('button', { name: 'Ver portafolio' });
  await expect(gate).toBeVisible();
  const heard = page.evaluate(() => new Promise<boolean>((r) => window.addEventListener('ig:sound', (e) => r((e as CustomEvent).detail.on), { once: true })));
  await gate.click();
  expect(await heard).toBe(true);
  await page.evaluate(() => localStorage.setItem('ig-sound', 'off'));
  await page.reload();
  await page.getByRole('button', { name: 'Ver portafolio' }).click();
  await expect(page.locator('#boot')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('ig-sound'))).toBe('off');
});
