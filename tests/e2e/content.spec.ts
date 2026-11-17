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

test('home: hero, one card per page with a real link, a short contact block; no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await enter(page, '/es/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ignacio');
  const cards = page.locator('.hub__card');
  await expect(cards).toHaveCount(5);
  const hrefs = await cards.locator('a.hub__more').evaluateAll((as) => as.map((a) => new URL((a as HTMLAnchorElement).href).pathname));
  expect(hrefs).toEqual(['/es/trabajo/', '/es/como-trabajo/', '/es/capacidades/', '/es/negocio/', '/es/sobre-mi/']);
  await expect(page.getByRole('link', { name: 'Conocer más: Cómo trabajo' })).toBeVisible();
  await expect(page.locator('section#contacto').getByRole('link', { name: 'Escribime' })).toHaveAttribute('href', 'mailto:ignaciogauna.developer@gmail.com');
  expect(await page.locator('main').innerText()).not.toContain('ComplIA');
  expect(errors).toEqual([]);
});

test('home cards lead to their pages, and every page renders its content with its headings', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await enter(page, '/es/');
  await page.getByRole('link', { name: 'Conocer más: Trabajo' }).click();
  await expect(page).toHaveURL(/\/es\/trabajo\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lo que construí.');
  for (const id of ['que-hago', 'trabajo', 'laboratorio']) await expect(page.locator(`section#${id} h2`)).toHaveCount(1);
  await expect(page.locator('.pillar')).toHaveCount(4);
  // honesty: every project card/lab item carries a status
  await expect(page.locator('.work__card .status')).toHaveCount(3);
  await expect(page.locator('.lab__item .status')).toHaveCount(6);

  await enter(page, '/es/como-trabajo/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Un método y un sistema.');
  for (const id of ['metodo', 'sistema']) await expect(page.locator(`section#${id} h2`)).toHaveCount(1);
  await expect(page.locator('.method__step')).toHaveCount(6);
  await expect(page.locator('.system__item')).toHaveCount(7);
  await expect(page.locator('.agent')).toHaveCount(11);
  await expect(page.locator('.agent svg')).toHaveCount(11);
  await expect(page.locator('#sistema figure.dg')).toHaveCount(1);
  await expect(page.locator('#sistema a[href$="/proyectos/agentes/"]')).toHaveCount(1);
  expect((await page.locator('main').innerText()).toLowerCase()).not.toContain('vibe coding');

  await enter(page, '/es/capacidades/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Qué uso, y de dónde sale cada cosa.');
  await expect(page.locator('.ledger tbody tr')).toHaveCount(17);

  await enter(page, '/es/sobre-mi/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('De Mar del Plata.');
  await expect(page.locator('section#recorrido h2')).toHaveCount(1);
  await expect(page.locator('.journey__item')).toHaveCount(8);
  await expect(page.locator('section#contacto h2')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('contact has email, LinkedIn and GitHub; external links open safely', async ({ page }) => {
  await enter(page, '/es/sobre-mi/');
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

test('wide header: five page links on one row, the language switch and one Contacto; no menu button', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/trabajo/');
  const links = page.locator('.site-nav__links a');
  await expect(links).toHaveCount(5);
  const boxes = await links.evaluateAll((as) => as.map((a) => a.getBoundingClientRect()).map((r) => ({ top: Math.round(r.top), h: Math.round(r.height) })));
  expect(new Set(boxes.map((b) => b.top)).size).toBe(1);
  for (const b of boxes) expect(b.h).toBeLessThanOrEqual(48);
  await expect(links.first()).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.site-header').getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/es/sobre-mi/#contacto');
  await expect(page.getByRole('button', { name: 'Menú', exact: true })).toBeHidden();
  // 1024 (an iPad in landscape): the menu button instead
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(links.first()).toBeHidden();
  await expect(page.getByRole('button', { name: 'Menú', exact: true })).toBeVisible();
});

test('menu: opens as a dialog, keeps focus inside, closes with Escape and the close button, returns focus', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await enter(page, '/es/');
  const toggle = page.getByRole('button', { name: 'Menú', exact: true });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toHaveAttribute('aria-controls', 'site-menu');
  await toggle.click();
  const dialog = page.getByRole('dialog', { name: 'Menú del sitio' });
  await expect(dialog).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(dialog.getByRole('link', { name: /^Inicio/ })).toHaveAttribute('aria-current', 'page');
  await expect(dialog.getByRole('link', { name: /^Inicio/ })).toBeFocused();
  // the page under it does not take focus or scroll
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  expect(await page.evaluate(() => getComputedStyle(document.body).position)).toBe('fixed');
  // Tab cycles inside the dialog
  for (let i = 0; i < 16; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('#site-menu'))).toBe(true);
  }
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('#site-menu'))).toBe(true);
  // every target is at least 44 px tall
  const small = await dialog.locator('a, button').evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height < 44).map((e) => e.textContent));
  expect(small).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(toggle).toBeFocused();
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  // the close button closes it too
  await toggle.click();
  await dialog.getByRole('button', { name: 'Cerrar el menú' }).click();
  await expect(dialog).toBeHidden();
  await expect(toggle).toBeFocused();
  // and a page link navigates
  await toggle.click();
  await dialog.getByRole('link', { name: /Cómo trabajo/ }).click();
  await expect(page).toHaveURL(/\/es\/como-trabajo\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Un método y un sistema.');
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => getComputedStyle(document.body).position)).not.toBe('fixed');
});

test('no horizontal scroll at 360 px on any page', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  for (const url of ['/es/', '/es/trabajo/', '/es/como-trabajo/', '/es/capacidades/', '/es/negocio/', '/es/sobre-mi/', '/en/', '/en/sobre-mi/']) {
    await enter(page, url, url.startsWith('/en/') ? 'Skip' : 'Saltar', url.startsWith('/en/') ? 'View portfolio' : 'Ver portafolio');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), url).toBeLessThanOrEqual(0);
  }
});

test('English pages mirror the Spanish structure', async ({ page }) => {
  await enter(page, '/en/sobre-mi/', 'Skip', 'View portfolio');
  await expect(page.locator('section#recorrido h2')).toContainText('Mar del Plata');
  await enter(page, '/en/como-trabajo/', 'Skip', 'View portfolio');
  await expect(page.locator('.method__step')).toHaveCount(6);
  await enter(page, '/en/', 'Skip', 'View portfolio');
  await expect(page.getByRole('link', { name: 'Learn more: How I work' })).toHaveAttribute('href', '/en/como-trabajo/');
});

test('below 1100 px a floating contact button steps aside near other contact actions', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await enter(page, '/es/');
  const fab = page.locator('.fab-contact');
  await expect(fab).toHaveAttribute('data-hidden', 'true'); // hero buttons are on screen
  await page.locator('.hub__card--skills').scrollIntoViewIfNeeded();
  await expect(fab).toHaveAttribute('data-hidden', 'false');
  await expect(page.getByRole('link', { name: /^Contacto/ }).last()).toHaveAttribute('href', 'mailto:ignaciogauna.developer@gmail.com');
  await page.locator('#contacto').scrollIntoViewIfNeeded();
  await expect(fab).toHaveAttribute('data-hidden', 'true');
  // after a client-side navigation it looks up the new page's contact actions
  await page.locator('footer').getByRole('link', { name: 'Trabajo', exact: true }).click();
  await expect(page).toHaveURL(/\/es\/trabajo\/$/);
  await expect(fab).toHaveAttribute('data-hidden', 'false');
});

test('Tuenti and Eclipse cases: own page, Eclipse links to its site', async ({ page }) => {
  await enter(page, '/es/trabajo/');
  await page.locator('.work__card', { hasText: 'Tuenti' }).getByRole('link').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tuenti');
  await enter(page, '/es/proyectos/eclipse/');
  await expect(page.getByRole('link', { name: /eclipse-business\.com/ })).toHaveAttribute('href', 'https://eclipse-business.com/');
});

test('portal screenshots: the Eclipse gallery loads, with alt text and a caption; work cards have covers', async ({ page }) => {
  for (const [slug, n] of [['eclipse', 7]] as const) {
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
  await enter(page, '/es/trabajo/');
  const covers = page.locator('.work__shot');
  await expect(covers).toHaveCount(3);
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

test('CompliA diagram is labelled as a conceptual scheme, not Telefónica architecture', async ({ page }) => {
  await enter(page, '/es/proyectos/complia/');
  await expect(page.locator('.dg__badge')).toHaveText('Esquema conceptual');
  await expect(page.getByText(/No es la arquitectura de Telefónica/)).toBeVisible();
});
