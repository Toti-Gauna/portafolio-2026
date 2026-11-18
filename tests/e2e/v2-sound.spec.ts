import { expect, test, type Page } from '@playwright/test';

// Lote 2.3: the generative music of /v2 (v2/sound, v2/components/sound). Silent until asked for, follows the page,
// pauses with the tab hidden; each page plays its proposal (Circuito, Taller on Work, Marea on the calm pages).

type Debug = { playing: boolean; style: string; zone: string; bar: number; state: string; loaded: boolean };
const music = (page: Page) => page.evaluate(() => (window as Window & { __igMusic?: () => Debug }).__igMusic?.() ?? null);

test('silent by default: no audio context and no engine until the sound button is pressed', async ({ page }) => {
  const scripts: string[] = [];
  page.on('request', (r) => r.resourceType() === 'script' && scripts.push(r.url()));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/');
  await page.mouse.click(700, 500);
  await page.waitForTimeout(500);
  expect(await music(page)).toMatchObject({ playing: false, state: 'none', loaded: false });
  const before = scripts.length;

  await page.locator('.sh-bar .ui-sound').click();
  await expect.poll(async () => (await music(page))?.playing).toBe(true);
  expect(scripts.length).toBeGreaterThan(before); // the engine arrives only now
  await expect.poll(async () => (await music(page))?.state).toBe('running');
  await expect.poll(async () => (await music(page))?.bar, { timeout: 8000 }).toBeGreaterThanOrEqual(1);
  expect(await music(page)).toMatchObject({ zone: 'home', style: 'circuito' });

  // a new page: its motif and its proposal from the next bar, without stopping
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Work' }).click();
  await expect(page).toHaveURL(/\/work\/$/);
  await expect.poll(async () => (await music(page))?.zone, { timeout: 8000 }).toBe('work');
  await expect.poll(async () => (await music(page))?.style, { timeout: 8000 }).toBe('taller');
  expect((await music(page))?.playing).toBe(true);
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Sobre mí' }).click();
  await expect.poll(async () => (await music(page))?.style, { timeout: 8000 }).toBe('marea');

  // off: it fades out and the audio context sleeps
  await page.locator('.sh-bar .ui-sound').click();
  await expect.poll(async () => (await music(page))?.playing).toBe(false);
  await expect.poll(async () => (await music(page))?.state, { timeout: 3000 }).toBe('suspended');
});

test('a saved «on» waits for the first click on the page, and a hidden tab is silent', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ig:v2:sound', 'on'));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/negocio/');
  await page.waitForTimeout(600);
  expect(await music(page)).toMatchObject({ playing: false, state: 'none' });
  await page.locator('main h1').click();
  await expect.poll(async () => (await music(page))?.playing).toBe(true);
  await expect.poll(async () => (await music(page))?.zone).toBe('business');

  const hide = (hidden: boolean) => page.evaluate((h) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
  await hide(true);
  await expect.poll(async () => (await music(page))?.playing).toBe(false);
  await hide(false);
  await expect.poll(async () => (await music(page))?.playing).toBe(true);
});

test('/sonido/: three proposals to listen to on any page motif, each with the pages where it plays', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/sonido/');
  await expect(page.getByRole('navigation', { name: 'Sistema' }).getByRole('link', { name: 'Música' })).toHaveAttribute('aria-current', 'page');
  const cards = page.locator('.mu-card');
  await expect(cards.locator('h3')).toHaveText(['Marea', 'Circuito', 'Taller']);
  // the chords of the page motif, written from the composer
  await expect(cards.first().locator('.mu-prog li')).toHaveText(['Dmaj7', 'A7', 'Bm7', 'Gmaj7']);

  const play = cards.nth(1).getByRole('button', { name: 'Escuchar' });
  await play.click();
  await expect(cards.nth(1).getByRole('button', { name: 'Detener' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await music(page))?.style, { timeout: 8000 }).toBe('circuito');
  await expect(cards.nth(1).locator('.mu-prog li[data-now]')).toHaveCount(1, { timeout: 8000 });
  await expect(cards.nth(1).locator('.mu-now')).toContainText('Acorde');

  // another page motif
  await page.getByRole('radio', { name: 'Work' }).check({ force: true });
  await expect(cards.first().locator('.mu-prog li')).toHaveText(['G7', 'Fmaj7', 'Cmaj7', 'G7']);
  await expect.poll(async () => (await music(page))?.zone, { timeout: 8000 }).toBe('work');

  await cards.nth(1).getByRole('button', { name: 'Detener' }).click();
  await expect.poll(async () => (await music(page))?.playing).toBe(false);

  await expect(cards.nth(1).locator('.mu-where')).toContainText('Inicio · Cómo trabajo · Negocio · Sistema');
  await expect(cards.nth(2).locator('.mu-where')).toContainText('Work');
  await expect(cards.nth(0).locator('.mu-where')).toContainText('Brand Lab · Sobre mí');
  expect(errors).toEqual([]);
});

test('levels: every proposal on every page stays quiet and clean (rendered offline by the same engine)', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/v2/es/sonido/');
  await page.waitForFunction(() => typeof (window as unknown as { __igMusicRender?: unknown }).__igMusicRender === 'function');
  for (const style of ['marea', 'circuito', 'taller']) for (const zone of ['home', 'work', 'about', 'system']) {
    const r = await page.evaluate(([s, z]) => (window as unknown as { __igMusicRender: (s: string, z: string, sec: number, rate: number) => Promise<{ peakDb: number; rmsDb: number }> }).__igMusicRender(s, z, 12, 22050), [style, zone]);
    expect(r.peakDb, `${style} ${zone} peak`).toBeLessThan(-6);
    expect(r.rmsDb, `${style} ${zone} rms`).toBeGreaterThan(-30);
    expect(r.rmsDb, `${style} ${zone} rms`).toBeLessThan(-16);
  }
});

test('the music page fits a phone', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/v2/es/sonido/');
  const r = await page.evaluate(() => {
    const small: string[] = [];
    for (const el of document.querySelectorAll('main *')) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (own && parseFloat(getComputedStyle(el).fontSize) < 12) small.push(el.className || el.tagName);
    }
    const tiny = [...document.querySelectorAll<HTMLElement>('main a, main button, main label')]
      .filter((el) => el.offsetParent && el.getBoundingClientRect().height < 40)
      .map((el) => el.className || el.textContent);
    return { over: document.documentElement.scrollWidth - innerWidth, small, tiny };
  });
  expect(r).toEqual({ over: 0, small: [], tiny: [] });
});
