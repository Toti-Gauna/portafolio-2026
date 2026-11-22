import { expect, type Page, test } from '@playwright/test';

// Lote 8.2: the trailer «Conocer a Ignacio» of /v2, in code. A film of 80 seconds on one line of time (Web Animations),
// in a player with chapters; it never starts on its own and the film is asked for with the first press.

type Film = { t: number; playing: boolean; fmt: string; animations: number; lite: boolean; live: string[]; running: number };
const film = (page: Page) => page.evaluate(() => (window as unknown as { __igFilm: () => Film }).__igFilm());
const seek = (page: Page, t: number) => page.evaluate((x) => (window as unknown as { __igFilmSeek: (t: number) => void }).__igFilmSeek(x), t);
const start = async (page: Page) => {
  await page.locator('.tp-go').click();
  await page.waitForFunction(() => '__igFilm' in window);
};
/** where the dot is, in stage units */
const dotAt = (page: Page) => page.evaluate(() => {
  const s = document.querySelector('.tf-stage')!.getBoundingClientRect(), d = document.querySelector('.tf-dot-s')!.getBoundingClientRect();
  const u = s.width / (document.querySelector('.tf-stage')!.classList.contains('t') ? 90 : 160);
  return [(d.x + d.width / 2 - s.x) / u, (d.y + d.height / 2 - s.y) / u, d.width / u];
});

test('a poster first: nothing of the film is asked for until «Reproducir», and the story is also in words', async ({ page }) => {
  const asked: string[] = [];
  page.on('request', (r) => { if (/\.mp4/.test(r.url())) asked.push(r.url()); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/trailer/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('h1')).toHaveText('Conocer a Ignacio');
  await expect(page.locator('.tp')).toHaveAttribute('data-state', 'poster');
  await expect(page.locator('.tp-poster')).toContainText('1:20');
  await expect(page.locator('.tf-stage')).toHaveCount(0);
  expect(await page.evaluate(() => '__igFilm' in window)).toBe(false);
  await expect(page.locator('.tr-text ol > li')).toHaveCount(6);
  await expect(page.locator('.tr-text')).toContainText('Todo empezó en Mar del Plata.');
  await expect(page.locator('.tr-text')).toContainText('TACH Argentina (2021 – 2022)');
  await page.waitForTimeout(600);
  expect(asked).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});

test('it plays on one line of time: the clock runs, pause stops every animation, a chapter is a jump', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/trailer/');
  await start(page);
  await expect(page.locator('.tp')).toHaveAttribute('data-state', 'playing');
  await expect.poll(async () => (await film(page)).t).toBeGreaterThan(0.6);
  const a = await film(page);
  expect(a.animations).toBeGreaterThan(250);
  expect(a.live).toContain('mdp');
  expect(a.live.length).toBeLessThanOrEqual(3);
  // pause: nothing runs and the time stays
  await page.getByRole('button', { name: 'Pausar' }).click();
  const p1 = await film(page);
  expect(p1.playing).toBe(false);
  expect(p1.running).toBe(0);
  await page.waitForTimeout(400);
  expect((await film(page)).t).toBe(p1.t);
  // the third chapter is Tsoft, at bar 10
  await page.getByRole('button', { name: 'Capítulo 3: Tsoft' }).click();
  const c = await film(page);
  expect(c.t).toBeCloseTo(20, 1);
  expect(c.live).toContain('tuenti');
  await expect(page.locator('.sig-player-time')).toHaveText('0:20 / 1:20');
  await expect(page.getByRole('button', { name: 'Capítulo 3: Tsoft' })).toHaveAttribute('aria-current', 'true');
  // the arrows change chapter; Space plays
  await page.locator('.tp').focus();
  await page.keyboard.press('ArrowRight');
  expect((await film(page)).t).toBeCloseTo(42.22, 1);
  await page.keyboard.press('ArrowLeft');
  expect((await film(page)).t).toBeCloseTo(20, 1);
  await page.keyboard.press(' ');
  await expect(page.locator('.tp')).toHaveAttribute('data-state', 'playing');
  await expect.poll(async () => (await film(page)).t).toBeGreaterThan(20.4);
});

test('only transform, opacity, clip-path and stroke-dashoffset move, and the dot is where the script says', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/trailer/');
  await start(page);
  await page.getByRole('button', { name: 'Pausar' }).click();
  const props = await page.evaluate(() => {
    const set = new Set<string>();
    for (const an of document.getAnimations()) {
      const fx = an.effect as KeyframeEffect;
      if (!fx.target?.closest('.tf-stage')) continue;
      for (const k of fx.getKeyframes()) for (const p of Object.keys(k)) if (!['offset', 'computedOffset', 'easing', 'composite'].includes(p)) set.add(p);
    }
    return [...set].sort();
  });
  expect(props).toEqual(['clipPath', 'opacity', 'strokeDashoffset', 'transform']);
  // the light of Mar del Plata, the «Jugar» button, the centre of the ring of agents and the dot of the «i»
  for (const [t, x, y] of [[4, 48, 45], [6, 110, 73], [65.5, 117, 45], [79.9, 67 + (11 / 48) * 26, 15 + (7 / 48) * 26]]) {
    await seek(page, t);
    const [dx, dy] = await dotAt(page);
    expect(Math.abs(dx - x), `x at ${t}`).toBeLessThan(0.6);
    expect(Math.abs(dy - y), `y at ${t}`).toBeLessThan(0.6);
  }
  // the numbers end on their value and the three verbs of CompliA are on stage
  await seek(page, 51);
  await expect(page.locator('[data-slot="eclipse"] .tf-num')).toBeVisible();
  await seek(page, 30.9);
  await expect(page.locator('[data-slot="complia"] .tf-pill')).toHaveText(['Preguntá.Preguntá.', 'Analizá.Analizá.', 'Dictaminá.Dictaminá.']);
  await expect(page.locator('[data-slot="complia"] .tf-pill-on').last()).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-slot="complia"] .tf-pill-on').first()).toHaveCSS('opacity', '0');
});

test('the real clip of a case is asked for when its shot arrives, and the film ends still with «Repetir» and «Ver portafolio»', async ({ page }) => {
  const asked: string[] = [];
  page.on('request', (r) => { if (/\.mp4/.test(r.url())) asked.push(r.url().split('/').pop()!); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/trailer/');
  await start(page);
  await expect.poll(async () => (await film(page)).t).toBeGreaterThan(0.2);
  expect(asked).toEqual([]);
  await seek(page, 26.4);
  await expect.poll(() => asked).toContain('complia-demo.mp4');
  await seek(page, 78.6);
  await expect(page.locator('.tp')).toHaveAttribute('data-state', 'ended', { timeout: 6000 });
  const end = await film(page);
  expect(end.running).toBe(0);
  expect(end.live).toEqual(['end']);
  await expect(page.locator('.tp-end').getByRole('link', { name: 'Ver portafolio' })).toHaveAttribute('href', /\/v2\/es\/$/);
  await page.locator('.tp-end').getByRole('button', { name: 'Repetir' }).click();
  await expect(page.locator('.tp')).toHaveAttribute('data-state', 'playing');
  await expect.poll(async () => (await film(page)).t).toBeLessThan(3);
});

test('the 9:16 edition is the same film: it goes on from the same moment', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/trailer/');
  await start(page);
  await page.getByRole('button', { name: 'Pausar' }).click();
  await seek(page, 33);
  await page.getByRole('button', { name: 'Vertical, 9:16' }).click();
  await expect(page.locator('.tf-stage')).toHaveClass(/\bt\b/);
  await expect.poll(async () => (await film(page)).fmt).toBe('t');
  expect((await film(page)).t).toBeCloseTo(33, 1);
  const box = (await page.locator('.tf-stage').boundingBox())!;
  expect(box.height / box.width).toBeCloseTo(16 / 9, 1);
  const [dx, dy] = await dotAt(page);
  expect(dx).toBeCloseTo(80, 0);
  expect(dy).toBeCloseTo(13, 0);
});

test('on a 360 px phone the film is vertical, every text of every shot is 12 px or more and nothing widens the page', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/v2/es/trailer/');
  await expect(page.locator('.tp-seg')).toHaveCount(0);
  await start(page);
  await page.getByRole('button', { name: 'Pausar' }).click();
  await expect(page.locator('.tf-stage')).toHaveClass(/\bt\b/);
  const small: string[] = [];
  for (const t of [4.3, 8.7, 13.2, 19.9, 24.3, 26.5, 31, 37.6, 42.1, 44.3, 51, 53.2, 55.4, 57.6, 59.9, 62.1, 66.5, 71, 75.4, 79.9]) {
    await seek(page, t);
    small.push(...await page.evaluate((at) => [...document.querySelectorAll<HTMLElement>('.tf-slot[data-live] .tf-cam *')]
      .filter((e) => e.children.length === 0 && e.textContent!.trim() && e.getClientRects().length && parseFloat(getComputedStyle(e).fontSize) < 11.99)
      .map((e) => `${at}: ${e.className} ${getComputedStyle(e).fontSize}`), t));
  }
  expect(small).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  for (const b of await page.locator('.tp button').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
});

test('with reduced motion it offers the words first and plays only if asked; without JavaScript there are the words', async ({ browser }) => {
  const calm = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 860 } });
  const page = await calm.newPage();
  await page.goto('/v2/es/trailer/');
  await expect(page.locator('.tp-calm')).toContainText('movimiento reducido');
  await expect(page.locator('.tp-go')).toHaveText('Verlo igual');
  expect(await page.evaluate(() => '__igFilm' in window)).toBe(false);
  await start(page);
  await expect.poll(async () => (await film(page)).t).toBeGreaterThan(0.3);
  await calm.close();
  const plain = await browser.newContext({ javaScriptEnabled: false });
  const p2 = await plain.newPage();
  await p2.goto('/v2/es/trailer/');
  await expect(p2.locator('.tp')).toBeHidden();
  await expect(p2.locator('.tr-text ol > li')).toHaveCount(6);
  await expect(p2.locator('.tr-text')).toContainText('Abierto a nuevos desafíos.');
  await plain.close();
});

test('in English', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/en/trailer/');
  await expect(page.locator('h1')).toHaveText('Meet Ignacio');
  await start(page);
  await page.getByRole('button', { name: 'Pause' }).click();
  await seek(page, 4);
  await expect(page.locator('[data-slot="mdp"] .tf-line')).toHaveText('It all started in Mar del Plata.');
  await seek(page, 51);
  await expect(page.locator('[data-slot="eclipse"] .tf-count')).toContainText('tests passing');
  await expect(page.locator('.tr-text')).toContainText('Open to new challenges.');
});
