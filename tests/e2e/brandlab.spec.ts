import { expect, test, type Page } from '@playwright/test';

async function enter(page: Page, url: string) {
  await page.goto(url);
  await expect(async () => {
    if (await page.getByRole('button', { name: 'Ver portafolio' }).isVisible()) return;
    await page.getByRole('button', { name: 'Saltar' }).first().click({ timeout: 500 });
    await expect(page.getByRole('button', { name: 'Ver portafolio' })).toBeVisible({ timeout: 500 });
  }).toPass();
  await page.getByRole('button', { name: 'Ver portafolio' }).click();
  await expect(page.locator('#boot')).toBeHidden();
  await expect(page.locator('#app-shell')).not.toHaveAttribute('inert', '');
  await page.waitForTimeout(300);
}
const visible = (page: Page) => page.locator('.bl-sheet:visible');

test('brand lab: the page, the method, eight tabs and one sheet', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await enter(page, '/es/brand-lab/');
  await expect(page.locator('main h1')).toHaveText('Cómo doy marca.');
  await expect(page.locator('.bl-method li')).toHaveCount(4);
  await expect(page.getByRole('tab')).toHaveCount(8);
  await expect(visible(page)).toHaveCount(1);
  await expect(page.locator('#marca-ig')).toBeVisible();
  await expect(page.getByRole('tab', { name: /IG/ })).toHaveAttribute('aria-selected', 'true');
  expect(errors).toEqual([]);
});

test('brand lab: a click and the arrow keys change the sheet and the hash; #marca-velmar opens Velmar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/brand-lab/');
  await page.getByRole('tab', { name: /Volta/ }).click();
  await expect(page.locator('#marca-volta')).toBeVisible();
  await expect(visible(page)).toHaveCount(1);
  expect(new URL(page.url()).hash).toBe('#marca-volta');
  await expect(page.locator('#marca-volta')).toHaveAttribute('data-play', '');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#marca-dentalos')).toBeVisible();
  await expect(page.getByRole('tab', { name: /Clínica Brisa/ })).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('#marca-brote')).toBeVisible();
  await page.keyboard.press('Home');
  await expect(page.locator('#marca-ig')).toBeVisible();
  await page.goto('/es/brand-lab/#marca-velmar');
  await expect(page.locator('#marca-velmar')).toBeVisible();
  await expect(visible(page)).toHaveCount(1);
});

test('brand lab: who owns each brand is said on its sheet; the fictional ones are brand exercises', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/brand-lab/');
  for (const id of ['volta', 'dentalos', 'lucero', 'sereno', 'brote']) {
    await page.locator(`.bl-pick[data-brand="${id}"]`).click();
    await expect(page.locator(`#marca-${id} .bl-head .stag[data-kind="ejercicio"]`), id).toHaveText(/Ejercicio de marca/i);
  }
  await page.locator('.bl-pick[data-brand="velmar"]').click();
  await expect(page.locator('#marca-velmar .bl-kind')).toHaveText(/Marca de un cliente/i);
  await expect(page.locator('#marca-velmar .bl-foot')).toContainText('provisional');
  await page.locator('.bl-pick[data-brand="ig"]').click();
  await expect(page.locator('#marca-ig .bl-kind')).toHaveText(/Marca propia/i);
  // each block says where it comes from
  await expect(page.locator('#marca-ig .bl-cap__from')).toHaveCount(7);
});

test('brand lab: each sheet has its palette in text, three patterns and three sample pieces', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/brand-lab/#marca-lucero');
  const s = page.locator('#marca-lucero');
  await expect(s.locator('.bl-palette li')).toHaveCount(6);
  await expect(s.locator('.bl-palette')).toContainText('#B23A52');
  await expect(s.locator('.bl-pat[role="img"]')).toHaveCount(3);
  await expect(s.locator('.bl-app[role="img"]')).toHaveCount(3);
  await expect(s.locator('.bl-panel[role="img"]')).toHaveCount(3);
});

test('brand lab on a phone: tabs ≥ 44 px, no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await enter(page, '/es/brand-lab/');
  for (const t of await page.getByRole('tab').all()) expect((await t.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  for (const id of ['ig', 'eclipse', 'velmar', 'volta', 'dentalos', 'lucero', 'sereno', 'brote']) {
    await page.locator(`.bl-pick[data-brand="${id}"]`).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), id).toBeLessThanOrEqual(0);
  }
});

test('brand lab with reduced motion: everything in its final state, no animation', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await enter(page, '/es/brand-lab/#marca-sereno');
  const s = page.locator('#marca-sereno');
  await expect(s).toBeVisible();
  expect(await s.locator('.bl-palette li').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  expect(await s.locator('.bl-palette li').first().evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  await ctx.close();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('every sheet shows, and the picker is a list of links', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/es/brand-lab/');
    await expect(page.locator('.bl-sheet')).toHaveCount(8);
    for (const s of await page.locator('.bl-sheet').all()) await expect(s).toBeVisible();
    await expect(page.locator('.bl-picker a[href^="#marca-"]')).toHaveCount(8);
  });
});
