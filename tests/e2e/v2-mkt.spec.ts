import { expect, test } from '@playwright/test';

// Lote 6.3: a marketing playbook per project with a brand, after its board in the Brand Lab: the customer's way with
// every touchpoint on the screen or on the street, its piece in the brand's skin, its card, the walk along the path
// and the year of campaigns from the repo.

const PLAYS = ['ig', 'eclipse', 'velmar', 'volta', 'brisa', 'lucero'];

test('the wall lists the six playbooks; the lab exercises have none', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto('/v2/es/brand-lab/');
  const links = page.locator('.blw-mk-a');
  await expect(links).toHaveCount(6);
  const hrefs = await links.evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  expect(hrefs).toEqual(PLAYS.map((id) => `/v2/es/brand-lab/${id}/#marketing`));
  await links.nth(3).click();
  await expect(page).toHaveURL(/\/brand-lab\/volta\/#marketing$/);
  await expect(page.locator('#mk-title')).toHaveText('Volta: el laboratorio que te avisa');
  for (const id of ['sereno', 'brote']) {
    await page.goto(`/v2/es/brand-lab/${id}/`);
    await expect(page.locator('#marketing')).toHaveCount(0);
  }
});

test('each playbook: in its brand\'s skin, its points on two lanes, the path drawn between them', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const id of PLAYS) {
    await page.goto(`/v2/es/brand-lab/${id}/`);
    const mk = page.locator('#marketing');
    await mk.scrollIntoViewIfNeeded();
    // the brand's own field and display face, as on its board
    const [mkBg, boardBg] = await Promise.all([mk.locator('.bl-sec').first(), page.locator('.bl-cover')].map((l) => l.evaluate((e) => getComputedStyle(e).backgroundColor)));
    expect(mkBg, id).toBe(boardBg);
    const points = mk.locator('.mk-pt');
    const n = await points.count();
    expect(n, id).toBeGreaterThanOrEqual(6);
    await expect(mk.locator('.mk-ol li[data-lane="physical"]').first()).toBeVisible();
    // one segment between each pair of points; the first point is open
    await expect(mk.locator('.mk-seg')).toHaveCount(n - 1);
    await expect(points.first()).toHaveAttribute('aria-pressed', 'true');
    await expect(mk.locator('.mk-detail:not([data-off])')).toHaveCount(1);
    // every origin is named
    await expect(mk.locator('.mk-detail:not([data-off]) .mk-origin')).toHaveText(/En su repo|En sus documentos|En este sitio|Propuesta del playbook/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), id).toBe(0);
  }
});

test('a point opens its piece and its card; the arrows walk the path', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/brand-lab/volta/');
  const mk = page.locator('#marketing');
  const points = mk.locator('.mk-pt');
  await points.nth(6).click();
  await expect(points.nth(6)).toHaveAttribute('aria-pressed', 'true');
  const card = mk.locator('.mk-detail:not([data-off])');
  await expect(card.locator('h3')).toHaveText('El aviso de recompra');
  await expect(card).toContainText('Unos 5 días antes de que se termine el pote');
  await expect(card.locator('code')).toHaveText('supplements-ecommerce/src/demo/admin/repurchase-text.ts');
  await expect(card.locator('.mkp-chat')).toContainText('¿Te preparamos otro?');
  await expect(mk.locator('.mk-step')).toContainText('Punto 7 de 8');
  // the segments on both sides of the point are lit
  await expect(mk.locator('.mk-seg[data-on]')).toHaveCount(2);
  await points.nth(6).focus();
  await page.keyboard.press('ArrowRight');
  await expect(points.nth(7)).toBeFocused();
  await expect(points.nth(7)).toHaveAttribute('aria-pressed', 'true');
  await expect(card.locator('h3')).toHaveText('El regalo, en historia');
  await page.keyboard.press('Home');
  await expect(points.first()).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Punto siguiente' }).click();
  await expect(points.nth(1)).toHaveAttribute('aria-pressed', 'true');
  // the pieces are pictures with a name; their words are written beside them
  await expect(mk.locator('.mk-detail:not([data-off]) figure[role="img"]')).toHaveAttribute('aria-label', /Portada de ejemplo/);
});

test('«Recorrer el camino» walks the way once and stops on the last point', async ({ page }) => {
  await page.clock.install();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/brand-lab/lucero/');
  const mk = page.locator('#marketing');
  await mk.locator('.mk-map').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Recorrer el camino' }).click();
  await page.clock.runFor(1950);
  await expect(mk.locator('.mk-step')).toContainText('Punto 2 de 8');
  await expect(mk.locator('.mk-seg[data-on]')).toHaveCount(1);
  // pause holds it
  await page.getByRole('button', { name: 'Pausar' }).click();
  await page.clock.runFor(6000);
  await expect(mk.locator('.mk-step')).toContainText('Punto 2 de 8');
  await page.getByRole('button', { name: 'Recorrer el camino' }).click();
  for (let i = 0; i < 8; i++) await page.clock.runFor(1950);
  await expect(mk.locator('.mk-step')).toContainText('Punto 8 de 8');
  await expect(mk.locator('.mk-seg[data-on]')).toHaveCount(7);
  await expect(page.getByRole('button', { name: 'Recorrer de nuevo' })).toBeVisible();
});

test('the year of campaigns comes from the repo', async ({ page }) => {
  await page.goto('/v2/es/brand-lab/volta/');
  const cal = page.locator('.mk-cal');
  await expect(cal.locator('.mk-dates li')).toHaveCount(17);
  await expect(cal.locator('.mk-dates li').first()).toContainText('San Valentín');
  await expect(cal.locator('.mk-track')).toHaveCount(2);
  await expect(cal.locator('code')).toHaveText('supplements-ecommerce/src/demo/fixtures/themes.ts');
  await page.goto('/v2/es/brand-lab/brisa/');
  await expect(page.locator('.mk-cal')).toHaveCount(0);
  await expect(page.locator('.mk-next')).toContainText('El QR en el comprobante de turno');
});

test('without JavaScript every card is there, one after the other', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/v2/es/brand-lab/eclipse/');
  await expect(page.locator('.mk-detail')).toHaveCount(8);
  for (const d of await page.locator('.mk-detail').all()) await expect(d).toBeVisible();
  await expect(page.locator('.mk-bar')).toBeHidden();
  await ctx.close();
});

test('reduced motion: the path changes at once', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('/v2/es/brand-lab/velmar/');
  const seg = page.locator('.mk-seg').first();
  await expect(seg).toHaveCount(1);
  expect(await seg.evaluate((e) => getComputedStyle(e).transitionDuration)).toBe('0s');
  await ctx.close();
});

test('on a 360 px phone: a list in the order of the way, a tap brings its card', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/v2/es/brand-lab/ig/');
  const mk = page.locator('#marketing');
  await expect(mk.locator('.mk-path')).toHaveCount(0);
  await expect(mk.locator('.mk-pt-m').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  const pt = mk.locator('.mk-pt').nth(4);
  const box = await pt.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await pt.click();
  const card = mk.locator('.mk-detail:not([data-off])');
  await expect(card.locator('h3')).toHaveText('El caso en diez segundos');
  await expect(card).toBeInViewport();
  // the piece fits the phone
  const piece = await card.locator('.mkp').boundingBox();
  expect(piece!.x).toBeGreaterThanOrEqual(0);
  expect(piece!.x + piece!.width).toBeLessThanOrEqual(360);
});

test('in English', async ({ page }) => {
  await page.goto('/v2/en/brand-lab/lucero/');
  await expect(page.locator('#mk-title')).toHaveText('Lucero: from the sidewalk to the table');
  await expect(page.locator('.mk-bar')).toContainText('Point 1 of 8');
  await expect(page.locator('.mk-cal .mk-dates li').first()).toContainText('Feb 7–15');
});
