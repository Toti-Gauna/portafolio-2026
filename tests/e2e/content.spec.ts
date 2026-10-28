import { expect, test, type Page } from '@playwright/test';
import { CASES, CASE_SLUGS } from '../../lib/cases';

async function enter(page: Page, url: string, skip = 'Saltar', portfolio = 'Ver portafolio') {
  await page.goto(url);
  await expect(async () => {
    if (await page.getByRole('button', { name: portfolio }).isVisible()) return;
    await page.getByRole('button', { name: skip }).first().click({ timeout: 500 });
    await expect(page.getByRole('button', { name: portfolio })).toBeVisible({ timeout: 500 });
  }).toPass();
  await page.getByRole('button', { name: portfolio }).click();
}

test('home has its nine sections, each with its heading, and no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await enter(page, '/es/');
  for (const id of ['que-hago', 'trabajo', 'recorrido', 'laboratorio', 'metodo', 'sistema', 'capacidades', 'sobre-mi', 'contacto']) {
    await expect(page.locator(`section#${id} h2`)).toHaveCount(1);
  }
  await expect(page.locator('.journey__item')).toHaveCount(8);
  await expect(page.locator('.method__step')).toHaveCount(6);
  await expect(page.locator('.system__item')).toHaveCount(7);
  await expect(page.locator('.agent')).toHaveCount(11);
  await expect(page.locator('.agent svg')).toHaveCount(11);
  await expect(page.locator('.pillar')).toHaveCount(4);
  await expect(page.locator('.ledger tbody tr')).toHaveCount(17);
  await expect(page.locator('#sistema figure.dg')).toHaveCount(1);
  expect((await page.locator('main').innerText()).toLowerCase()).not.toContain('vibe coding');
  // honesty: every project card/lab item carries a status, and the product name is spelled CompliA
  await expect(page.locator('.work__card .status')).toHaveCount(4);
  await expect(page.locator('.lab__item .status')).toHaveCount(6);
  expect(await page.locator('main').innerText()).not.toContain('ComplIA');
  expect(errors).toEqual([]);
});

test('contact has email, LinkedIn and GitHub; external links open safely', async ({ page }) => {
  await enter(page, '/es/');
  const c = page.locator('section#contacto');
  await expect(c.getByRole('link', { name: 'ignaciogauna.developer@gmail.com' })).toHaveAttribute('href', 'mailto:ignaciogauna.developer@gmail.com');
  await expect(c.getByRole('link', { name: /linkedin\.com\/in\/ignacio-emanuel-gauna/ })).toHaveAttribute('href', 'https://www.linkedin.com/in/ignacio-emanuel-gauna/');
  await expect(c.getByRole('link', { name: /github\.com\/Toti-Gauna/ })).toHaveAttribute('href', 'https://github.com/Toti-Gauna');
  const bad = await page.locator('a[target="_blank"]:not([rel~="noopener"])').count();
  expect(bad).toBe(0);
});

test('every case page exists in both languages and says its status', async ({ page }) => {
  for (const [loc, skip, port] of [['es', 'Saltar', 'Ver portafolio'], ['en', 'Skip', 'View portfolio']] as const) {
    for (const slug of CASE_SLUGS) {
      await enter(page, `/${loc}/proyectos/${slug}/`, skip, port);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('.case .status').first()).not.toBeEmpty();
    }
  }
});

test('CompliA case: clip with controls and caption; no internal data claims', async ({ page }) => {
  await enter(page, '/es/proyectos/complia/');
  await expect(page.locator('video[controls]')).toHaveCount(1);
  await expect(page.getByText('Datos de ejemplo.').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lo que no muestro' })).toBeVisible();
});

test('navigation: the section menu works on a phone and no horizontal scroll at 360 px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await enter(page, '/es/');
  await page.getByText('Secciones', { exact: true }).click();
  await page.locator('.site-header__menu').getByRole('link', { name: 'Método' }).click();
  await expect(page).toHaveURL(/#metodo$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

test('English home mirrors the Spanish structure', async ({ page }) => {
  await enter(page, '/en/', 'Skip', 'View portfolio');
  await expect(page.locator('section#recorrido h2')).toContainText('Mar del Plata');
  await expect(page.locator('.method__step')).toHaveCount(6);
});

test('phones get a floating contact button that steps aside near other contact actions', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await enter(page, '/es/');
  const fab = page.locator('.fab-contact');
  await expect(fab).toHaveAttribute('data-hidden', 'true'); // hero buttons are on screen
  await page.locator('#metodo').scrollIntoViewIfNeeded();
  await expect(fab).toHaveAttribute('data-hidden', 'false');
  await expect(page.getByRole('link', { name: /^Contacto/ }).last()).toHaveAttribute('href', 'mailto:ignaciogauna.developer@gmail.com');
  await page.locator('#contacto').scrollIntoViewIfNeeded();
  await expect(fab).toHaveAttribute('data-hidden', 'true');
});

test('Tuenti and Eclipse cases: own page, Eclipse links to its site', async ({ page }) => {
  await enter(page, '/es/');
  await page.locator('.work__card', { hasText: 'Tuenti' }).getByRole('link').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tuenti');
  await enter(page, '/es/proyectos/eclipse/');
  await expect(page.getByRole('link', { name: /eclipse-business\.com/ })).toHaveAttribute('href', 'https://eclipse-business.com/');
});

test('portal screenshots: Eclipse and HandyX galleries load, with alt text and a caption; work cards have covers', async ({ page }) => {
  for (const [slug, n] of [['eclipse', 7], ['handyx', 4]] as const) {
    await enter(page, `/es/proyectos/${slug}/`);
    const items = page.locator('.gallery__item');
    await expect(items).toHaveCount(n);
    for (let i = 0; i < n; i++) {
      const img = items.nth(i).locator('img');
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBe(1600);
      expect((await img.getAttribute('alt'))!.length).toBeGreaterThan(20);
      await expect(items.nth(i).locator('figcaption')).not.toBeEmpty();
    }
  }
  await enter(page, '/es/');
  const covers = page.locator('.work__shot');
  await expect(covers).toHaveCount(4);
  // Tuenti: a drawn illustration, never a screenshot (confidentiality)
  await expect(page.locator('.work__card').filter({ hasText: 'Tuenti' }).locator('img')).toHaveAttribute('src', /tuenti-cover\.svg$/);
});

test('case pages: index, numbered sections, diagrams readable as text, no horizontal scroll on a phone', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const slug of CASE_SLUGS) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await enter(page, `/es/proyectos/${slug}/`);
    const sections = page.locator('main section.cs[id]');
    expect(await sections.count(), slug).toBeGreaterThan(3);
    await expect(page.locator('.toc a').first()).toBeVisible();
    const diagrams = CASES[slug].blocks.filter((b) => b.type === 'diagram').length;
    await expect(page.locator('figure.dg svg.dg__svg--desktop:visible')).toHaveCount(diagrams);
    if (diagrams) {
      const text = page.locator('figure.dg details.dg__text').first();
      await text.locator('summary').click();
      expect(await text.locator('li').count()).toBeGreaterThan(1);
    }
    await page.setViewportSize({ width: 360, height: 800 });
    await expect(page.locator('figure.dg svg.dg__svg--mobile:visible')).toHaveCount(diagrams);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), slug).toBeLessThanOrEqual(0);
  }
  expect(errors).toEqual([]);
});

test('HandyX case explains the business: the money split and the pre-registration funnel', async ({ page }) => {
  await enter(page, '/es/proyectos/handyx/');
  await expect(page.locator('.ms__row')).toHaveCount(3);
  await expect(page.getByText('$ 49.500')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Del preregistro al compromiso' })).toBeVisible();
  // honesty block: nothing deployed, no users
  await expect(page.getByText(/Nada está desplegado/)).toBeVisible();
});

test('CompliA diagram is labelled as a conceptual scheme, not Telefónica architecture', async ({ page }) => {
  await enter(page, '/es/proyectos/complia/');
  await expect(page.locator('.dg__badge')).toHaveText('Esquema conceptual');
  await expect(page.getByText(/No es la arquitectura de Telefónica/)).toBeVisible();
});
