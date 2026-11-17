import { expect, test, type Page } from '@playwright/test';

async function enter(page: Page, url: string, skip = 'Saltar', portfolio = 'Ver portafolio') {
  await page.goto(url);
  await expect(async () => {
    if (await page.getByRole('button', { name: portfolio }).isVisible()) return;
    await page.getByRole('button', { name: skip }).first().click({ timeout: 500 });
    await expect(page.getByRole('button', { name: portfolio })).toBeVisible({ timeout: 500 });
  }).toPass();
  await page.getByRole('button', { name: portfolio }).click();
  await expect(page.locator('#boot')).toBeHidden();
  await expect(page.locator('#app-shell')).not.toHaveAttribute('inert', '');
  await page.waitForTimeout(300);
}
const ready = async (page: Page) => {
  await page.locator('.camino__window').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-roadmap]')).toHaveAttribute('data-state', 'ready', { timeout: 15000 });
};
const world = (page: Page) => page.evaluate(() => (document.querySelector('.cam-world') as SVGGElement).style.transform);

test('roadmap: the page, its lead and its model with the 56 pieces', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await enter(page, '/es/roadmap/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lo que viene.');
  await expect(page.locator('.roadmap__intro')).toContainText('85 %');
  await expect(page.locator('.roadmap__intro')).toContainText('27 proyectos · 12 ventanas · 7 certificaciones');
  await ready(page);
  await expect(page.locator('.camino__view g[data-item]')).toHaveCount(56);
  await expect(page.locator('.camino__readout')).toHaveText(/Etapa 1 de 4 · Núcleo/i);
  // honesty: P0 is under way, every other piece is planned
  await expect(page.locator('[data-card="p0"] .stag[data-kind="desarrollo"]')).toHaveCount(1);
  await expect(page.locator('.camino__card .stag[data-kind="planeado"]')).toHaveCount(55);
  expect(errors).toEqual([]);
});

test('roadmap: the stepper (click and keyboard) moves the camera, the readout and the panel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/roadmap/');
  await ready(page);
  const w0 = await world(page);
  await page.locator('.camino__step[data-station="quant"]').click();
  await expect(page.locator('.camino__readout')).toHaveText(/Etapa 3 de 4 · Quant/i);
  await expect(page.locator('.camino__panel[data-active]')).toHaveAttribute('data-panel', 'quant');
  expect(await world(page)).not.toBe(w0);
  await expect(page.locator('g[data-item][data-stage="quant"][data-stage-on]').first()).toBeAttached();
  await expect(page.locator('g[data-item][data-stage="core"][data-stage-on]')).toHaveCount(0);
  await page.locator('.camino__step[data-station="quant"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.camino__step[data-station="space"]')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.locator('.camino__step[data-station="core"]')).toHaveAttribute('aria-selected', 'true');
  expect(await page.locator('.camino__step[tabindex="0"]').count()).toBe(1);
});

test('roadmap: a row lights its model and opens its card; a window shows its exit level; a piece in the drawing takes the camera to its stage', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/roadmap/');
  await ready(page);
  await page.getByRole('button', { name: /P1.*Faro v1/ }).click();
  await expect(page.locator('g[data-item="p1"]')).toHaveAttribute('data-on', '');
  const card = page.locator('[data-card="p1"]');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Spring Boot');
  await expect(card).toContainText('pozos de Vaca Muerta');
  await expect(card).toContainText('nov 2026 – ene 2027');
  await expect(page.locator('[data-card="p0"]')).toBeHidden();
  await page.getByRole('button', { name: /W1/ }).click();
  await expect(page.locator('[data-card="w1"]')).toContainText('Nivel de salida');
  await expect(page.locator('[data-card="w1"]')).toContainText('Habilita');
  await expect(page.locator('[data-card="w1"]')).toContainText('P3');
  // proposals say so
  await page.locator('g[data-item="s2"]').dispatchEvent('click');
  await expect(page.locator('.camino__panel[data-active]')).toHaveAttribute('data-panel', 'cyber');
  await expect(page.locator('[data-card="s2"]')).toBeVisible();
  await page.locator('.camino__step[data-station="core"]').click();
  await page.getByRole('button', { name: /P8.*Red teaming/ }).click();
  await expect(page.locator('[data-card="p8"]')).toContainText('Propuesto');
  // no prices anywhere on the page
  expect(await page.locator('main').innerText()).not.toMatch(/US\$|USD|SY0-/);
});

test('roadmap: «Ver como lista» shows the four stages and the 56 cards as plain HTML, and back', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/roadmap/');
  await ready(page);
  await page.getByRole('button', { name: 'Ver como lista' }).click();
  await expect(page.locator('.camino__window')).toBeHidden();
  await expect(page.locator('.camino__panel:visible')).toHaveCount(4);
  await expect(page.locator('.camino__card:visible')).toHaveCount(56);
  await expect(page.locator('.roadmap__row:visible')).toHaveCount(0);
  await page.getByRole('button', { name: 'Ver la maqueta' }).click();
  await expect(page.locator('.camino__panel:visible')).toHaveCount(1);
});

test('roadmap without JavaScript: the whole plan is there as a list', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${process.env.PW_PORT ?? 4173}/es/roadmap/`);
  await expect(page.locator('.camino__window')).toBeHidden();
  await expect(page.locator('.camino__steps')).toBeHidden();
  await expect(page.locator('.camino__panel')).toHaveCount(4);
  await expect(page.locator('.camino__card')).toHaveCount(56);
  await ctx.close();
});

test('roadmap on a phone and in English: rows and steps of 44 px, nothing sideways', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await enter(page, `http://127.0.0.1:${process.env.PW_PORT ?? 4173}/en/roadmap/`, 'Skip', 'View portfolio');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('What comes next.');
  await ready(page);
  const w0 = await world(page);
  await page.locator('.camino__step[data-station="space"]').click();
  await expect(page.locator('.camino__readout')).toHaveText(/Stage 4 of 4 · Aerospace/i);
  const before = await world(page);
  expect(before).not.toBe(w0);
  await page.getByRole('button', { name: /A7.*Horizonte/ }).click();
  await expect.poll(() => world(page)).not.toBe(before);
  for (const sel of ['.camino__step', '.roadmap__row', '.camino__toggle']) {
    for (const el of await page.locator(`${sel}:visible`).all()) expect((await el.boundingBox())!.height, sel).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  await ctx.close();
});

test('the roadmap is reached from the home, from the path and from the footer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/');
  await expect(page.locator('.tch--roadmap .tch__body a.tch__go')).toHaveAttribute('href', /\/es\/roadmap\/?$/);
  await expect(page.locator('.foot').getByRole('link', { name: 'Roadmap' })).toHaveAttribute('href', /\/es\/roadmap\/?$/);
  await enter(page, '/es/trabajo/');
  await page.locator('.camino__window').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-camino]')).toHaveAttribute('data-state', 'ready', { timeout: 15000 });
  await page.locator('.camino__step[data-station="next"]').click();
  await expect(page.locator('.camino__panel[data-active] [data-card][data-on] .camino__go')).toHaveAttribute('href', /\/es\/roadmap\/?$/);
});
