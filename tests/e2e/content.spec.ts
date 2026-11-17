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

test('home: the cosmic workshop walk, one chapter per building, each page reachable; no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await enter(page, '/es/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ignacio');
  await expect(page.locator('article.tch')).toHaveCount(11);
  // every page of the menu is reachable from a chapter
  const hrefs = await page.locator('.tch__body a.tch__go').evaluateAll((as) => as.map((a) => new URL((a as HTMLAnchorElement).href).pathname));
  for (const p of ['/es/sobre-mi/', '/es/trabajo/', '/es/como-trabajo/', '/es/capacidades/', '/es/negocio/', '/es/roadmap/']) expect(hrefs, p).toContain(p);
  // honesty: featured projects and the roadmap carry their status; unbuilt sections say so
  await expect(page.locator('.tch--work .tch__body .stag')).toHaveCount(3);
  await expect(page.locator('.tch--roadmap .tch__body .stag[data-kind="planeado"]')).toHaveCount(3);
  await expect(page.locator('.tch--roadmap .tch__body .stag[data-kind="desarrollo"]')).toHaveCount(1);
  await expect(page.locator('.tch--roadmap .tch__body a.tch__go')).toHaveAttribute('href', /\/roadmap\/?$/);
  await expect(page.locator('.tch--brand .tch__body .tch__soon')).toHaveCount(1);
  await expect(page.locator('#contacto').getByRole('link', { name: 'Escribime' })).toHaveAttribute('href', 'mailto:ignaciogauna.developer@gmail.com');
  await expect(page.locator('#contacto')).toContainText('GPT Image');
  expect(await page.locator('main').innerText()).not.toContain('ComplIA');
  expect(errors).toEqual([]);
});

test('home walk: the stage pins, the scene changes with the scroll and the camera video is scrubbed', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/');
  const root = page.locator('[data-taller]');
  await expect(root).toHaveAttribute('data-mode', 'scroll');
  const tops = await page.locator('article.tch').evaluateAll((as) => as.map((a) => ({ top: a.getBoundingClientRect().top + scrollY, h: (a as HTMLElement).offsetHeight })));
  // chapter 3 (the hangar) is fully in place after its pin starts
  await page.evaluate((y) => scrollTo(0, y), tops[3].top + 10);
  await expect.poll(() => page.evaluate(() => Number((document.querySelector('.taller__scene[data-scene="3"]') as HTMLElement).style.opacity))).toBe(1);
  // the move from chapter 1 to 2 uses its video, scrubbed (paused, its time follows the scroll)
  await page.evaluate((y) => scrollTo(0, y), tops[1].top + 10);
  await expect.poll(() => page.evaluate(() => (document.querySelector('.taller__video') as HTMLVideoElement | null)?.readyState ?? 0), { timeout: 15000 }).toBeGreaterThanOrEqual(2);
  await page.evaluate((y) => scrollTo(0, y), tops[1].top + 0.8 * (tops[1].h - 900));
  await expect.poll(() => page.evaluate(() => (document.querySelector('.taller__video') as HTMLVideoElement).currentTime)).toBeGreaterThan(2);
  expect(await page.evaluate(() => (document.querySelector('.taller__video') as HTMLVideoElement).paused)).toBe(true);
  // the three.js background rests while the stage covers the screen
  expect(await page.evaluate(() => document.documentElement.hasAttribute('data-scene-covered'))).toBe(true);
});

test('home on a phone and with reduced motion: pictures and text, no stage, no videos', async ({ browser }) => {
  for (const opts of [{ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' as const }]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    await enter(page, `http://127.0.0.1:${process.env.PW_PORT ?? 4173}/es/`);
    await expect(page.locator('[data-taller]')).not.toHaveAttribute('data-mode', 'scroll');
    await expect(page.locator('.taller__stage')).toBeHidden();
    await expect(page.locator('.tch__pic').first()).toBeVisible();
    await page.locator('#contacto').scrollIntoViewIfNeeded();
    await expect(page.locator('.taller__video')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await ctx.close();
  }
});

test('home cards lead to their pages, and every page renders its content with its headings', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await enter(page, '/es/');
  await page.locator('.tch--work .tch__body a.tch__go').click();
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

/** Case pages with steps show one step at a time (Ola 7a): open the one that holds what the test looks at. */
const openStep = async (page: Page, id: string) => {
  await page.evaluate((x) => { location.hash = `#paso-${x}`; }, id);
  await expect(page.locator(`#paso-${id}`)).toBeVisible();
};

test('every case page exists in both languages and says its status', async ({ page }) => {
  for (const [loc, skip, port] of [['es', 'Saltar', 'Ver portafolio'], ['en', 'Skip', 'View portfolio']] as const) {
    for (const slug of CASE_SLUGS) {
      await enter(page, `/${loc}/proyectos/${slug}/`, skip, port);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('.case .status, .case .stag').first()).not.toBeEmpty();
    }
  }
});

test('CompliA case: clip with controls and caption; no internal data claims', async ({ page }) => {
  await enter(page, '/es/proyectos/complia/');
  await expect(page.locator('video[controls]')).toHaveCount(1);
  await openStep(page, 'see');
  await expect(page.getByText('Datos de ejemplo.').first()).toBeVisible();
  await openStep(page, 'status');
  await expect(page.getByRole('heading', { name: 'Lo que no muestro' })).toBeVisible();
});

test('wide header: six page links on one row, the language switch and one Contacto; no menu button', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/trabajo/');
  const links = page.locator('.site-nav__links a');
  await expect(links).toHaveCount(6);
  const boxes = await links.evaluateAll((as) => as.map((a) => a.getBoundingClientRect()).map((r) => ({ top: Math.round(r.top), h: Math.round(r.height) })));
  expect(new Set(boxes.map((b) => b.top)).size).toBe(1);
  for (const b of boxes) expect(b.h).toBeLessThanOrEqual(48);
  await expect(links.first()).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.site-header').getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/es/sobre-mi/#contacto');
  await expect(page.getByRole('button', { name: 'Menú', exact: true })).toBeHidden();
  // 1024 (an iPad in landscape): the links stay on one row (no Contacto: the floating button covers it), no menu button
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(links.first()).toBeVisible();
  const rows = await links.evaluateAll((as) => new Set(as.map((a) => Math.round(a.getBoundingClientRect().top))).size);
  expect(rows).toBe(1);
  await expect(page.locator('.site-nav__contact')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Menú', exact: true })).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  // 768 (an iPad in portrait): still the links, nothing overflowing
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(links.first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  // below 768: the menu button instead
  await page.setViewportSize({ width: 700, height: 900 });
  await expect(links.first()).toBeHidden();
  await expect(page.getByRole('button', { name: 'Menú', exact: true })).toBeVisible();
});

test('the sound button is in the header, the gate turned it on, and it toggles', async ({ page }) => {
  await enter(page, '/es/trabajo/');
  const btn = page.locator('.site-header').getByRole('button', { name: /sonido/i });
  await expect(btn).toBeVisible();
  const box = await btn.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  await expect(btn).toHaveAttribute('aria-pressed', 'true'); // «Ver portafolio» turned it on
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
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
  await expect(page.getByRole('link', { name: /See how I work/ })).toHaveAttribute('href', '/en/como-trabajo/');
});

test('below 1100 px a floating contact button steps aside near other contact actions', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await enter(page, '/es/');
  const fab = page.locator('.fab-contact');
  await expect(fab).toHaveAttribute('data-hidden', 'true'); // hero buttons are on screen
  await page.locator('.tch--skills .tch__body .tch__go').scrollIntoViewIfNeeded();
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
    await openStep(page, 'see');
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
  test.setTimeout(150_000); // 13 cases, each step opened at two widths
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const slug of CASE_SLUGS) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await enter(page, `/es/proyectos/${slug}/`);
    const sections = page.locator('main section.cs[id]');
    expect(await sections.count(), slug).toBeGreaterThan(3);
    const steps = CASES[slug].steps;
    await expect((steps ? page.locator('.csteps__side a') : page.locator('.toc a')).first()).toBeVisible();
    // with steps, each step shows only its own diagrams
    const groups = steps
      ? steps.map((st) => ({ step: st.id, n: CASES[slug].blocks.filter((b) => b.type === 'diagram' && st.blocks.includes(b.key)).length }))
      : [{ step: '', n: CASES[slug].blocks.filter((b) => b.type === 'diagram').length }];
    for (const g of groups) {
      if (g.step) await openStep(page, g.step);
      await expect(page.locator('figure.dg svg.dg__svg--desktop:visible'), `${slug} ${g.step}`).toHaveCount(g.n);
      if (g.n) {
        const text = page.locator('figure.dg details.dg__text:visible').first();
        await text.locator('summary').click();
        expect(await text.locator('li').count()).toBeGreaterThan(1);
      }
    }
    await page.setViewportSize({ width: 360, height: 800 });
    for (const g of groups) {
      if (g.step) await openStep(page, g.step);
      await expect(page.locator('figure.dg svg.dg__svg--mobile:visible'), `${slug} ${g.step}`).toHaveCount(g.n);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), slug).toBeLessThanOrEqual(0);
  }
  expect(errors).toEqual([]);
});

test('CompliA diagram is labelled as a conceptual scheme, not Telefónica architecture', async ({ page }) => {
  await enter(page, '/es/proyectos/complia/');
  await openStep(page, 'how');
  await expect(page.locator('.dg__badge')).toHaveText('Esquema conceptual');
  await expect(page.getByText(/No es la arquitectura de Telefónica/)).toBeVisible();
});
