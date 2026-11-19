import { expect, type Page, test } from '@playwright/test';

// Lote 5.3: «Cómo funciona» told by an object of each product. One phase per step; the first time the figure is
// on screen it goes through the steps once and stays whole; every step is a button that shows its phase.

const on = (page: Page, sel: string) => page.locator(`.ch-svg ${sel}`).evaluateAll((els) => els.map((e) => e.hasAttribute('data-on')));

test('the object goes through the steps once, then each step shows its own part', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/complia/');
  const how = page.locator('.ch');
  const steps = how.locator('.ch-step');
  await expect(steps).toHaveCount(4);
  // off screen it waits empty; on screen it tours, and ends with the last step and the object whole
  expect(await on(page, '[data-from="3"]')).toEqual([false]);
  await how.scrollIntoViewIfNeeded();
  await expect(steps.nth(0)).toHaveAttribute('aria-pressed', 'true');
  await expect(steps.nth(3)).toHaveAttribute('aria-pressed', 'true', { timeout: 6000 });
  expect(await on(page, '[data-from]')).not.toContain(false);
  // a step on request: what comes later goes away, what belongs to that step lights up
  await steps.nth(0).click();
  await expect(steps.nth(0)).toHaveAttribute('aria-pressed', 'true');
  expect(await on(page, '[data-from="0"]')).toEqual([true]);
  expect(await on(page, '[data-from="2"]')).toEqual([false]);
  expect(await on(page, '[data-now="0"], [data-only="0"]')).not.toContain(false);
  // with the keyboard: focusing a step shows it
  await steps.nth(2).focus();
  await expect(steps.nth(2)).toHaveAttribute('aria-pressed', 'true');
  expect(await on(page, '[data-from="2"]')).toEqual([true]);
  // and with a mouse, pointing is enough
  await steps.nth(1).hover();
  await expect(steps.nth(1)).toHaveAttribute('aria-pressed', 'true');
});

test('without JavaScript and with reduced motion the object is whole', async ({ browser }) => {
  for (const opts of [{ javaScriptEnabled: false }, { reducedMotion: 'reduce' as const }]) {
    const ctx = await browser.newContext({ ...opts, viewport: { width: 1280, height: 860 } });
    const page = await ctx.newPage();
    await page.goto('/v2/es/work/eclipse/');
    await page.locator('.ch').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const hidden = await page.locator('.ch-svg [data-from]').evaluateAll((els) => els.filter((e) => Number(getComputedStyle(e).opacity) < 1).length);
    expect(hidden, JSON.stringify(opts)).toBe(0);
    await ctx.close();
  }
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });
  test('the object over its steps, nothing wider than the screen', async ({ page }) => {
    await page.goto('/v2/es/work/games/');
    const how = page.locator('.ch');
    await how.scrollIntoViewIfNeeded();
    const [fig, list] = await Promise.all([how.locator('.ch-fig').boundingBox(), how.locator('.ch-steps').boundingBox()]);
    expect(fig!.y + fig!.height).toBeLessThanOrEqual(list!.y + 1);
    await how.locator('.ch-step').nth(4).tap();
    await expect(how.locator('.ch-step').nth(4)).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    const small = await how.locator('.ch-step').evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetHeight < 44).length);
    expect(small).toBe(0);
  });
});
