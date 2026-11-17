import { expect, test, type Page } from '@playwright/test';

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
  await page.waitForTimeout(300);
}
const ready = async (page: Page) => {
  await page.locator('.camino__window').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-camino]')).toHaveAttribute('data-state', 'ready', { timeout: 15000 });
};
const world = (page: Page) => page.evaluate(() => (document.querySelector('.cam-world') as SVGGElement).style.transform);
const car = (page: Page) => page.evaluate(() => document.querySelector('.cam-car-at')!.getAttribute('transform'));

test('path: the drawing loads when the section is near, with its 21 buildings, and the first station is up', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await enter(page, '/es/trabajo/');
  await ready(page);
  await expect(page.locator('.camino__view g[data-building]')).toHaveCount(21);
  await expect(page.locator('.camino__readout')).toHaveText(/Estación 1 de 6 · Mar del Plata/i);
  await expect(page.locator('.camino__step')).toHaveCount(6);
  await expect(page.locator('.camino__step[aria-selected="true"]')).toHaveCount(1);
  await expect(page.locator('.camino__panel[data-active]')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('path: picking a station moves the camera and the handcar, changes the readout and the panel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/trabajo/');
  await ready(page);
  const w0 = await world(page);
  const c0 = await car(page);
  await page.locator('.camino__step[data-station="tsoft"]').click();
  await expect(page.locator('.camino__readout')).toHaveText(/Estación 4 de 6 · Tsoft/i);
  await expect(page.locator('.camino__panel[data-active]')).toHaveAttribute('data-panel', 'tsoft');
  await expect(page.locator('.camino__step[data-station="tsoft"]')).toHaveAttribute('aria-selected', 'true');
  await expect.poll(() => car(page), { timeout: 5000 }).not.toBe(c0);
  expect(await world(page)).not.toBe(w0);
  // the stepper stops at the last station: the roadmap is shown as planned
  await page.locator('.camino__step[data-station="next"]').click();
  await expect(page.locator('.camino__panel[data-active] .stag[data-kind="planeado"]:visible')).toHaveCount(1);
  await expect(page.locator('.camino__panel[data-active] [data-card][data-on] .camino__go')).toHaveCount(0);
});

test('path: the stepper works with the keyboard (arrows, Home, End)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/trabajo/');
  await ready(page);
  await page.locator('.camino__step[data-station="origin"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.camino__step[data-station="tach"]')).toBeFocused();
  await expect(page.locator('.camino__step[data-station="tach"]')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(page.locator('.camino__step[data-station="next"]')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(page.locator('.camino__step[data-station="origin"]')).toBeFocused();
  // only the selected tab is in the tab order
  expect(await page.locator('.camino__step[tabindex="0"]').count()).toBe(1);
});

test('path: a building lifts when picked, in the drawing or in its row, and its card opens with its way in', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/trabajo/');
  await ready(page);
  await page.locator('.camino__step[data-station="tsoft"]').click();
  await page.waitForTimeout(1200);
  // from the chips
  await page.getByRole('button', { name: 'CompliA', exact: true }).click();
  await expect(page.locator('g[data-building="complia"]')).toHaveAttribute('data-on', '');
  const card = page.locator('[data-card="complia"]');
  await expect(card).toBeVisible();
  await expect(card.locator('.stag[data-kind="produccion"]')).toBeVisible();
  await expect(card.getByRole('link', { name: /Ver el caso/ })).toHaveAttribute('href', /\/proyectos\/complia\/?$/);
  await expect(page.locator('[data-card="tsoft"]')).toBeHidden();
  // from the drawing
  await page.locator('g[data-building="tuenti"]').click({ force: true });
  await expect(page.locator('g[data-building="tuenti"]')).toHaveAttribute('data-on', '');
  await expect(page.locator('g[data-building="complia"]')).not.toHaveAttribute('data-on', '');
  await expect(page.locator('[data-card="tuenti"]')).toBeVisible();
  // a building of another station takes the camera there
  await page.locator('g[data-building="tach"]').dispatchEvent('click');
  await expect(page.locator('.camino__panel[data-active]')).toHaveAttribute('data-panel', 'tach');
  await expect(page.locator('[data-card="tach"]')).toBeVisible();
});

test('path: «Ver como lista» shows every station and building as plain HTML, and back', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/trabajo/');
  await ready(page);
  await page.getByRole('button', { name: 'Ver como lista' }).click();
  await expect(page.locator('.camino__window')).toBeHidden();
  await expect(page.locator('.camino__steps')).toBeHidden();
  await expect(page.locator('.camino__panel:visible')).toHaveCount(6);
  await expect(page.locator('.camino__card:visible')).toHaveCount(21);
  await page.getByRole('button', { name: 'Ver la maqueta' }).click();
  await expect(page.locator('.camino__window')).toBeVisible();
  await expect(page.locator('.camino__panel:visible')).toHaveCount(1);
});

test('path without JavaScript: the whole list is there, no stage', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${process.env.PW_PORT ?? 4173}/es/trabajo/`);
  await expect(page.locator('.camino__window')).toBeHidden();
  await expect(page.locator('.camino__steps')).toBeHidden();
  await expect(page.locator('.camino__panel')).toHaveCount(6);
  await expect(page.locator('.camino__card')).toHaveCount(21);
  await ctx.close();
});

test('path on a phone: the camera frames the picked building, the stepper and chips are 44 px, nothing scrolls sideways', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await enter(page, `http://127.0.0.1:${process.env.PW_PORT ?? 4173}/es/trabajo/`);
  await ready(page);
  const w0 = await world(page);
  await page.locator('.camino__step[data-station="own"]').click();
  await expect(page.locator('.camino__panel[data-active]')).toHaveAttribute('data-panel', 'own');
  const before = await world(page);
  expect(before).not.toBe(w0);
  await page.getByRole('button', { name: 'Volta', exact: true }).click();
  await expect.poll(() => world(page)).not.toBe(before);
  for (const sel of ['.camino__step', '.camino__chip', '.camino__toggle']) {
    for (const el of await page.locator(`${sel}:visible`).all()) expect((await el.boundingBox())!.height, sel).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  await ctx.close();
});

test('path with reduced motion: the camera and the handcar jump, nothing runs', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await enter(page, `http://127.0.0.1:${process.env.PW_PORT ?? 4173}/es/trabajo/`);
  await ready(page);
  const c0 = await car(page);
  await page.locator('.camino__step[data-station="ada"]').click();
  await expect.poll(() => car(page), { timeout: 1000 }).not.toBe(c0);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.cam-world')!).transitionDuration)).toBe('0s');
  await ctx.close();
});
