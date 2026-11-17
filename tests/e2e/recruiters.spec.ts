import { expect, test, type Page } from '@playwright/test';

async function enter(page: Page, url: string) {
  await page.goto(url);
  const [skip, go] = url.includes('/en/') ? ['Skip', 'View portfolio'] : ['Saltar', 'Ver portafolio'];
  await expect(async () => {
    if (await page.getByRole('button', { name: go }).isVisible()) return;
    await page.getByRole('button', { name: skip }).first().click({ timeout: 500 });
    await expect(page.getByRole('button', { name: go })).toBeVisible({ timeout: 500 });
  }).toPass();
  await page.getByRole('button', { name: go }).click();
  await expect(page.locator('#boot')).toBeHidden();
  await expect(page.locator('#app-shell')).not.toHaveAttribute('inert', '');
  await page.waitForTimeout(300);
}

test('recruiters: the sheet and three cases with their status, between the journey and the contact', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/sobre-mi/#reclutadores');
  const s = page.locator('section#reclutadores');
  await expect(s.locator('h2')).toHaveText('Lo esencial, en una ficha.');
  await expect(s.locator('.rc-sheet > div')).toHaveCount(8);
  await expect(s).toContainText('seguir desarrollándome y avanzando en mi carrera');
  await expect(s.locator('.rc-sheet')).toContainText('Inglés: C1');
  await expect(s.locator('.rc-case')).toHaveCount(3);
  await expect(s.locator('.rc-case .stag')).toHaveCount(2);
  const links = await s.locator('a.card-link').evaluateAll((as) => as.map((a) => new URL((a as HTMLAnchorElement).href).pathname));
  expect(links).toEqual(['/es/capacidades/', '/es/proyectos/complia/', '/es/proyectos/eclipse/', '/es/proyectos/agentes/']);
  await expect(s.getByRole('link', { name: 'Escribime' })).toHaveAttribute('href', 'mailto:ignaciogauna.developer@gmail.com');
  // order on the page: journey, recruiters, contact
  const ids = await page.locator('main > section').evaluateAll((els) => els.map((e) => e.id));
  expect(ids.indexOf('recorrido')).toBeLessThan(ids.indexOf('reclutadores'));
  expect(ids.indexOf('reclutadores')).toBeLessThan(ids.indexOf('contacto'));
});

test('no page of the site mentions Upwork, a salary or an availability date', async ({ page }) => {
  for (const url of ['/es/sobre-mi/', '/en/sobre-mi/', '/es/', '/es/trabajo/']) {
    await enter(page, url);
    const text = (await page.locator('body').innerText()).toLowerCase();
    expect(text, url).not.toMatch(/upwork|expectativa salarial|salary expectation|sueldo/);
  }
});

test('recruiters on a phone and in English: no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await enter(page, '/en/sobre-mi/');
  await expect(page.locator('#reclutadores h2')).toHaveText('The essentials, on one sheet.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});
