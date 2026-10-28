import { expect, test } from '@playwright/test';

// iPadOS Safari grants the fullscreen asked for in the click AFTER the trailer's dialog has opened, and puts <html>
// above it in the top layer: the film ran out of sight. The player reopens its dialog on fullscreenchange.
test('a late fullscreen puts the film back on top, and skipping still leaves fullscreen', async ({ page }) => {
  await page.addInitScript(() => {
    const real = Element.prototype.requestFullscreen;
    const w = window as unknown as { __lateFs: () => Promise<void>; __shows: number };
    Element.prototype.requestFullscreen = () => Promise.resolve(); // the click's request "arrives" later, below
    w.__lateFs = () => real.call(document.documentElement);
    w.__shows = 0;
    const show = HTMLDialogElement.prototype.showModal;
    HTMLDialogElement.prototype.showModal = function () { if (this.classList.contains('tplayer')) w.__shows++; show.call(this); };
    addEventListener('keydown', (e) => { if (e.key === 'F9') void w.__lateFs(); }, true);
  });
  await page.goto('/es/');
  await page.getByRole('button', { name: 'Ver portafolio' }).click();
  await expect(page.locator('#boot')).toHaveCount(0);
  await page.getByRole('button', { name: /Ver el tr/ }).first().click();
  await expect(page.locator('dialog.tplayer[open]')).toHaveCount(1);
  await page.keyboard.press('F9');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shows: number }).__shows)).toBe(2);
  const top = await page.evaluate(() => ({
    fs: document.fullscreenElement?.tagName ?? null,
    open: !!document.querySelector('dialog.tplayer[open]'),
    inPlayer: !!document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest('dialog.tplayer'),
  }));
  expect(top).toEqual({ fs: 'HTML', open: true, inPlayer: true });
  await page.getByRole('button', { name: /Saltar/ }).click({ force: true });
  await expect(page.locator('dialog.tplayer')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
});
