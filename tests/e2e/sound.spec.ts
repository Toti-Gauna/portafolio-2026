import { expect, test, type Page } from '@playwright/test';

// Site sound (lib/sound.ts, lib/music.ts): off until a gate, one music zone per area, paused by the trailer.
type Snd = { zone: string | null; kind: string | null; wanted: string | null; running: boolean; rms: () => number };
const snd = (page: Page) =>
  page.evaluate(() => {
    const s = (window as unknown as { __igSound?: Snd }).__igSound;
    return { zone: s?.zone ?? null, wanted: s?.wanted ?? null, running: s?.running ?? false };
  });

async function openAt(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => '__igSound' in window);
}

test('silent until a gate; «Ver portafolio» turns the music on in the first zone', async ({ page }) => {
  await openAt(page, '/es/');
  expect((await snd(page)).running).toBe(false);
  expect(await page.evaluate(() => 'AudioContext' in window)).toBe(true);
  await page.getByRole('button', { name: 'Ver portafolio' }).click();
  await expect.poll(async () => (await snd(page)).running).toBe(true);
  await expect.poll(async () => (await snd(page)).zone).toBe('inicio');
});

test('the music zone follows the home chapters and the routes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openAt(page, '/es/');
  await page.getByRole('button', { name: 'Ver portafolio' }).click();
  await expect.poll(async () => (await snd(page)).zone).toBe('inicio');
  const go = async (i: number) => {
    await page.evaluate((n) => {
      const a = document.querySelectorAll('article[data-ch]')[n] as HTMLElement;
      scrollTo(0, a.getBoundingClientRect().top + scrollY + 40);
    }, i);
  };
  for (const [i, zone] of [[3, 'work'], [6, 'brand'], [9, 'roadmap'], [10, 'about']] as const) {
    await go(i);
    await expect.poll(async () => (await snd(page)).wanted, { timeout: 8000 }).toBe(zone);
  }
  await page.goto('/es/capacidades/');
  await page.waitForFunction(() => '__igSound' in window);
  expect((await snd(page)).wanted).toBe('brand');
});

test('the header button turns the music off and on; the choice is remembered', async ({ page }) => {
  await openAt(page, '/es/trabajo/');
  await page.getByRole('button', { name: 'Ver portafolio' }).click();
  await expect.poll(async () => (await snd(page)).running).toBe(true);
  await expect.poll(async () => (await snd(page)).zone).toBe('work');
  const btn = page.locator('.site-header .sound-toggle');
  await btn.click();
  await expect.poll(async () => (await snd(page)).running).toBe(false);
  await btn.click();
  await expect.poll(async () => (await snd(page)).running).toBe(true);
  await btn.click();
  expect(await page.evaluate(() => localStorage.getItem('ig-sound'))).toBe('off');
  // a visitor who turned it off is not turned on again by a gate
  await openAt(page, '/es/trabajo/');
  await page.getByRole('button', { name: 'Ver portafolio' }).click();
  await page.waitForTimeout(600);
  expect((await snd(page)).running).toBe(false);
});

test('the film has its own music: the site rests while it plays and comes back after', async ({ page }) => {
  await openAt(page, '/es/');
  await page.getByRole('button', { name: 'Conocer a Ignacio' }).click();
  await expect(page.getByRole('dialog', { name: 'Conocer a Ignacio' })).toBeVisible();
  await expect.poll(async () => (await snd(page)).running).toBe(false);
  await page.keyboard.press('Escape');
  await expect(page.locator('#boot')).toHaveCount(0);
  await expect.poll(async () => (await snd(page)).running).toBe(true);
});
