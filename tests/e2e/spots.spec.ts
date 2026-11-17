import { expect, test, type Locator, type Page } from '@playwright/test';

async function enter(page: Page, url: string) {
  await page.goto(url);
  await expect(async () => {
    if (await page.getByRole('button', { name: 'Ver portafolio' }).isVisible()) return;
    await page.getByRole('button', { name: 'Saltar' }).first().click({ timeout: 500 });
    await expect(page.getByRole('button', { name: 'Ver portafolio' })).toBeVisible({ timeout: 500 });
  }).toPass();
  await page.getByRole('button', { name: 'Ver portafolio' }).click();
  // the gate leaves and the page unlocks: only then does the layout stop moving under the pointer
  await expect(page.locator('#boot')).toBeHidden();
  await expect(page.locator('#app-shell')).not.toHaveAttribute('inert', '');
  // the walk switches to its scroll layout once the page has hydrated; before that the references are a plain list
  if ((page.viewportSize()?.width ?? 0) >= 900) await expect(page.locator('[data-taller]')).toHaveAttribute('data-mode', 'scroll');
  await page.waitForTimeout(300);
}

/** a card fades and slides in for 200 ms: a person waits for it to land before pressing; Playwright would call it unstable and retry with other scroll alignments */
const landed = (card: Locator) => card.locator('.tch__card').evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)).then(() => true));

/** scroll so that chapter `i` is pinned and its scene is still (the first 40 % of its pin) */
async function toChapter(page: Page, i: number, extra = 5) {
  const top = await page.locator(`article[data-ch="${i}"]`).evaluate((a) => a.getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => scrollTo(0, y), top + extra);
  await expect.poll(() => page.evaluate((n) => Number((document.querySelector(`.taller__scene[data-scene="${n}"]`) as HTMLElement).style.opacity), i)).toBe(1);
}

test('walk: hovering a reference opens its name, outlines it and lifts it off the scene; a click opens its card', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/');
  await expect(page.locator('[data-taller]')).toHaveAttribute('data-mode', 'scroll');
  await toChapter(page, 3);
  const spot = page.locator('article[data-ch="3"] [data-spot="complia"]');
  const mark = spot.locator('summary');
  // the marker is a 44 px target on the scene
  const box = (await mark.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  // at rest: no lift, the name is clipped away
  await expect(page.locator('.taller__lift')).not.toHaveAttribute('data-on', '');
  await mark.hover();
  await expect(spot).toHaveAttribute('data-active', '');
  await expect(page.locator('.taller__lift')).toHaveAttribute('data-on', '');
  await expect(page.locator('.taller__lift-img')).toHaveAttribute('src', /escena-3-/);
  await expect(page.locator('article[data-ch="3"] [data-shape="complia"]')).toHaveAttribute('data-active', '');
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.querySelector('.taller__lift-shadow')!).opacity)).not.toBe('0');
  // click: the card, with its status and its way in
  await mark.click();
  const card = spot.locator('.tch__card');
  await expect(card).toBeVisible();
  await expect(card.locator('.stag[data-kind="produccion"]')).toBeVisible();
  await expect(card.getByRole('link', { name: /Ver el caso/ })).toHaveAttribute('href', /\/proyectos\/complia\/?$/);
  // one card at a time
  await page.locator('article[data-ch="3"] [data-spot="eclipse"] summary').click();
  await expect(page.locator('article[data-ch="3"] details[open]')).toHaveCount(1);
  await expect(spot.locator('.tch__card')).toBeHidden();
});

test('walk: Escape closes the card and gives the focus back; so does a click outside; so does scrolling on', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/');
  await toChapter(page, 3);
  const mark = page.locator('article[data-ch="3"] [data-spot="volta"] summary');
  await mark.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('article[data-ch="3"] details[open]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('article[data-ch="3"] details[open]')).toHaveCount(0);
  await expect(mark).toBeFocused();
  await mark.click();
  await page.mouse.click(1380, 850);
  await expect(page.locator('details[open]')).toHaveCount(0);
  await mark.click();
  await expect(page.locator('article[data-ch="3"] details[open]')).toHaveCount(1);
  const h = await page.locator('article[data-ch="3"]').evaluate((a) => (a as HTMLElement).offsetHeight);
  await page.evaluate((y) => scrollBy(0, y), 0.8 * (h - 900));
  await expect(page.locator('details[open]')).toHaveCount(0);
  await expect(page.locator('article[data-ch="3"] [data-map]')).toHaveAttribute('inert', '');
});

test('walk: the hero is the index of the workshop and each reference goes to its scene', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/');
  const spots = page.locator('article[data-ch="0"] .tch__spot');
  await expect(spots).toHaveCount(8);
  await expect(spots.locator('.tch__num')).toHaveText(['02', '03', '04', '05', '06', '07', '08', '10']);
  await spots.nth(1).locator('summary').click();
  await landed(spots.nth(1));
  await spots.nth(1).getByRole('link', { name: 'Ir a la escena' }).click();
  await expect(page).toHaveURL(/#taller-work$/);
  await expect.poll(() => page.evaluate(() => Math.abs(document.querySelector('#taller-work')!.getBoundingClientRect().top))).toBeLessThan(40);
});

test('walk: the trailer reference opens the trailer; the roadmap ones are «Planeado» and lead to the roadmap page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/');
  await toChapter(page, 8);
  await page.locator('article[data-ch="8"] [data-spot="trailer"] summary').click();
  await landed(page.locator('article[data-ch="8"] [data-spot="trailer"]'));
  await page.locator('article[data-ch="8"] [data-spot="trailer"]').getByRole('button', { name: /Ver el tráiler/ }).click();
  await expect(page.locator('dialog[open]')).toBeVisible({ timeout: 10000 });
  await page.keyboard.press('Escape');
  const roadmap = page.locator('article[data-ch="9"] .tch__spot');
  await expect(roadmap).toHaveCount(4);
  await expect(roadmap.locator('.stag[data-kind="planeado"]')).toHaveCount(4);
  for (const a of await roadmap.locator('a.tch__go').all()) await expect(a).toHaveAttribute('href', /\/roadmap\/?$/);
  await expect(roadmap.locator('a.tch__go')).toHaveCount(4);
});

test('plain layout (phone): a list under each text, rows of 44 px that unfold their card, no sideways scroll', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await enter(page, `http://127.0.0.1:${process.env.PW_PORT ?? 4173}/es/`);
  const map = page.locator('article[data-ch="3"] [data-map]');
  await map.scrollIntoViewIfNeeded();
  await expect(map.locator('.tch__shapes')).toBeHidden();
  const rows = map.locator('summary');
  await expect(rows).toHaveCount(4);
  for (let i = 0; i < 4; i++) expect((await rows.nth(i).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await rows.first().click();
  await expect(map.locator('.tch__card').first()).toBeVisible();
  await expect(map.getByRole('link', { name: 'Ver el caso' }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  await ctx.close();
});
