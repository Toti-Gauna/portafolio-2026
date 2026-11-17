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

test('a zone the visitor comes back to resumes its track; passing through a chapter does not switch the music (Ola 12)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  // count the <audio> players the music makes: a zone that restarts its track would make new ones
  await page.addInitScript(() => {
    const w = window as unknown as { __audios: number; Audio: typeof Audio };
    w.__audios = 0;
    const A = w.Audio;
    const Counted = function (this: unknown, src?: string) { w.__audios++; return new A(src); } as unknown as typeof Audio;
    Counted.prototype = A.prototype;
    w.Audio = Counted;
  });
  await openAt(page, '/es/');
  await page.getByRole('button', { name: 'Ver portafolio' }).click();
  await expect.poll(async () => (await snd(page)).zone).toBe('inicio');
  const go = (n: number) => page.evaluate((i) => {
    const a = document.querySelectorAll('article[data-ch]')[i] as HTMLElement;
    scrollTo(0, a.getBoundingClientRect().top + scrollY + 40);
  }, n);
  for (let r = 0; r < 2; r++) {
    await go(3);
    await expect.poll(async () => (await snd(page)).zone, { timeout: 8000 }).toBe('work');
    await go(0);
    await expect.poll(async () => (await snd(page)).zone, { timeout: 8000 }).toBe('inicio');
  }
  const made = await page.evaluate(() => (window as unknown as { __audios: number }).__audios);
  // two zones with a file: two players each (the loop overlap), made once
  expect(made).toBeLessThanOrEqual(4);
  // a fling past the work chapters: the zone goes straight from «inicio» to «brand»
  const seen = new Set<string>();
  for (const n of [1, 2, 3, 4, 5, 6]) {
    await go(n);
    await page.waitForTimeout(100);
    seen.add(String((await snd(page)).wanted));
  }
  await expect.poll(async () => (await snd(page)).wanted, { timeout: 8000 }).toBe('brand');
  expect(seen.has('work')).toBe(false);
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
