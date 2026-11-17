import { expect, test, type Page } from '@playwright/test';

async function enter(page: Page, url: string) {
  await page.goto(url);
  await expect(async () => {
    const [skip, go] = url.includes('/en/') ? ['Skip', 'View portfolio'] : ['Saltar', 'Ver portafolio'];
    if (await page.getByRole('button', { name: go }).isVisible()) return;
    await page.getByRole('button', { name: skip }).first().click({ timeout: 500 });
    await expect(page.getByRole('button', { name: go })).toBeVisible({ timeout: 500 });
  }).toPass();
  await page.getByRole('button', { name: url.includes('/en/') ? 'View portfolio' : 'Ver portafolio' }).click();
  await expect(page.locator('#boot')).toBeHidden();
  await expect(page.locator('#app-shell')).not.toHaveAttribute('inert', '');
  await page.waitForTimeout(300);
}

test('business: six topics, each with its figure and its projects with their status; three book cards', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await enter(page, '/es/negocio/');
  await expect(page.locator('main h1')).toHaveText('Cómo pienso el negocio.');
  await expect(page.locator('.bz-honest')).toContainText('ninguna conversión');
  await expect(page.locator('.bz-toc a')).toHaveCount(7);
  await expect(page.locator('section.bz-topic')).toHaveCount(7);
  for (const id of ['models', 'digital', 'physical', 'brand', 'ops', 'funnels']) await expect(page.locator(`#${id} .bz-topic__fig figure`).first(), id).toBeAttached();
  await expect(page.locator('.bz-flow')).toHaveCount(4);
  await expect(page.locator('.bz-fun')).toHaveCount(5);
  await expect(page.locator('.bz-fun__head .stag')).toHaveCount(5);
  await expect(page.locator('#funnels .bz-legend')).toContainText('No está medido');
  // every example says which project it is and links to its case
  const links = await page.locator('.bz-apply__item a.card-link').evaluateAll((as) => as.map((a) => new URL((a as HTMLAnchorElement).href).pathname));
  expect(links.length).toBeGreaterThanOrEqual(20);
  for (const l of links) expect(l).toMatch(/^\/es\/proyectos\/[a-z]+\/$/);
  await expect(page.locator('.bz-bookcard')).toHaveCount(3);
  expect(errors).toEqual([]);
});

test('business: the physical marketing section does not claim a QR for DentalOS; nothing names a client or an amount', async ({ page }) => {
  await enter(page, '/es/negocio/');
  const physical = await page.locator('#physical').innerText();
  expect(physical).not.toMatch(/DentalOS/i);
  const all = await page.locator('main').innerText();
  expect(all).not.toMatch(/Telef[oó]nica|Movistar|Tuenti|tiendanube|\$\s?\d|US\$|USD/i);
});

test('business: the book cards lead to /negocio/libros, which keeps the three books complete', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/negocio/');
  await page.locator('.bz-bookcard--mom a.card-link').click();
  await expect(page).toHaveURL(/\/es\/negocio\/libros\/#mom$/);
  await expect(page.locator('main h1')).toHaveText('Cómo pienso el negocio.');
  await expect(page.locator('section.bz-book')).toHaveCount(3);
  await expect(page.locator('#mom')).toBeVisible();
  await expect(page.locator('.bz-model')).not.toHaveCount(0);
  await page.getByRole('link', { name: /Volver a Negocio/ }).click();
  await expect(page).toHaveURL(/\/es\/negocio\/$/);
});

test('business: the home chapter and its three references lead to the books page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/');
  const hrefs = await page.locator('.tch--business a').evaluateAll((as) => as.map((a) => new URL((a as HTMLAnchorElement).href).pathname + new URL((a as HTMLAnchorElement).href).hash));
  expect(hrefs.some((h) => /\/es\/negocio\/$/.test(h))).toBe(true);
  for (const k of ['lean', 'mom', 'blue']) expect(hrefs, k).toContain(`/es/negocio/libros/#${k}`);
});

test('business on a phone and in English: no sideways scroll, the rails and funnels are lists', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await enter(page, '/en/negocio/');
  await expect(page.locator('main h1')).toHaveText('How I think about business.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  await expect(page.locator('.bz-fun ol')).toHaveCount(5);
  await expect(page.locator('.bz-rails__track ol')).toHaveCount(4);
  await page.goto('/en/negocio/libros/');
  await expect(page.locator('section.bz-book')).toHaveCount(3);
});

test('business with reduced motion: figures in their final state', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await enter(page, '/es/negocio/#funnels');
  const bar = page.locator('.bz-fun__bar').first();
  await bar.scrollIntoViewIfNeeded();
  expect(await bar.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  expect(await bar.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
  await ctx.close();
});
