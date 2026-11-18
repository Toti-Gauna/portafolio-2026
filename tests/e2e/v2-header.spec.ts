import { expect, test, type Page } from '@playwright/test';

// Lote 2.1: the site header of /v2. A transparent bar at the top of a page, a floating glass pill once the page
// moves; a light under the current page; below 1100 px the pages open in a full-screen dialog.

const PAGES = [
  ['Inicio', '/v2/es/'],
  ['Work', '/v2/es/work/'],
  ['Cómo trabajo', '/v2/es/como-trabajo/'],
  ['Brand Lab', '/v2/es/brand-lab/'],
  ['Negocio', '/v2/es/negocio/'],
  ['Sobre mí', '/v2/es/sobre-mi/'],
] as const;

const settle = (page: Page) => page.waitForTimeout(650);
const lightX = (page: Page) =>
  page.locator('.sh-light').evaluate((el) => {
    const b = el.getBoundingClientRect();
    return Math.round(b.left);
  });
const centerX = (page: Page, key: string) =>
  page.locator(`.sh-nav a[data-key="${key}"]`).evaluate((el) => {
    const b = el.getBoundingClientRect();
    return Math.round(b.left + b.width / 2);
  });

test('desktop: six pages in one row, the light under the current one, and it travels without reloading the header', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/');
  const nav = page.getByRole('navigation', { name: 'Principal' });
  await expect(nav.getByRole('link')).toHaveText(PAGES.map((p) => p[0]));
  const tops = await nav.getByRole('link').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
  await expect(nav.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.sh')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.sh-light')).toHaveAttribute('data-on', 'on');
  await settle(page);
  expect(Math.abs((await lightX(page)) - (await centerX(page, 'home')))).toBeLessThanOrEqual(1);

  // the header lives in the layout: the same node after a change of page, so the light slides to the new one
  await page.locator('.sh').evaluate((el) => { (el as HTMLElement & { __kept?: boolean }).__kept = true; });
  await nav.getByRole('link', { name: 'Negocio' }).click();
  await expect(page).toHaveURL(/\/v2\/es\/negocio\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cómo pienso el negocio.');
  expect(await page.locator('.sh').evaluate((el) => (el as HTMLElement & { __kept?: boolean }).__kept)).toBe(true);
  await expect(nav.getByRole('link', { name: 'Negocio' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.locator('[aria-current]')).toHaveCount(1);
  await page.mouse.move(700, 600);
  await settle(page);
  expect(Math.abs((await lightX(page)) - (await centerX(page, 'business')))).toBeLessThanOrEqual(1);
  // its colour is the page's
  expect(await page.locator('.sh-light').evaluate((el) => getComputedStyle(el).color)).toBe('rgb(95, 134, 255)');

  // under the pointer the light visits another page, and comes back
  await nav.getByRole('link', { name: 'Work' }).hover();
  await expect(page.locator('.sh-light')).toHaveAttribute('data-on', 'over');
  await settle(page);
  expect(Math.abs((await lightX(page)) - (await centerX(page, 'work')))).toBeLessThanOrEqual(1);
  await page.mouse.move(700, 600);
  await expect(page.locator('.sh-light')).toHaveAttribute('data-on', 'on');

  // «Contacto» lands on the contact block of «Sobre mí»
  await page.locator('.sh').getByRole('link', { name: 'Contacto' }).click();
  await expect(page).toHaveURL(/\/v2\/es\/sobre-mi\/#contacto$/);
  await expect(page.locator('#contacto')).toBeInViewport();
  expect(errors).toEqual([]);
});

test('the bar becomes a floating pill when the page moves, and a bar again at the top', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/');
  const sh = page.locator('.sh');
  const glass = page.locator('.sh-glass');
  await expect(sh).toHaveAttribute('data-stuck', 'false');
  await expect(glass).toHaveCSS('opacity', '0');
  const home0 = await page.locator('.sh-bar > .sh-left').boundingBox();
  await page.mouse.wheel(0, 600);
  await expect(sh).toHaveAttribute('data-stuck', 'true');
  await settle(page);
  await expect(glass).toHaveCSS('opacity', '1');
  // the pill is narrower than the bar and both sides move in with it
  const g = (await glass.boundingBox())!;
  expect(g.width).toBeLessThanOrEqual(1121);
  expect(g.x).toBeGreaterThan(100);
  const home1 = await page.locator('.sh-bar > .sh-left').boundingBox();
  expect(home1!.x - home0!.x).toBeGreaterThan(40);
  for (const sel of ['.sh-bar > .sh-left', '.sh-nav', '.sh-bar > .sh-tools']) {
    const b = (await page.locator(sel).boundingBox())!;
    expect(b.x, sel).toBeGreaterThanOrEqual(g.x);
    expect(b.x + b.width, sel).toBeLessThanOrEqual(g.x + g.width);
  }
  // nothing but opacity and transform changes: the header keeps its box
  expect((await sh.boundingBox())!.y).toBe(0);
  await page.mouse.wheel(0, -600);
  await expect(sh).toHaveAttribute('data-stuck', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

test('keyboard on desktop: skip link first, then every stop of the header shows its focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.v2-skip')).toBeFocused();
  const stops: string[] = [];
  for (let i = 0; i < 11; i++) {
    await page.keyboard.press('Tab');
    const s = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const cs = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      return { name: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim(), ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2, h: b.height, inHeader: Boolean(el.closest('.sh')) };
    });
    expect(s.inHeader, s.name).toBe(true);
    expect(s.ring, s.name).toBe(true);
    expect(s.h, s.name).toBeGreaterThanOrEqual(44);
    stops.push(s.name);
  }
  expect(stops).toEqual(['Ignacio Gauna, ir al inicio', 'Inicio', 'Work', 'Cómo trabajo', 'Brand Lab', 'Negocio', 'Sobre mí', 'Sonido', 'Español', 'English', 'Contacto']);
  // the skip link jumps past the header
  await page.goto('/v2/es/work/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

for (const [w, h] of [[360, 740], [390, 844], [820, 1180], [1024, 768]] as const) {
  test(`menu at ${w}×${h}: dialog, focus inside, Escape, focus back, the page stays put`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/v2/es/como-trabajo/');
    // the bar says where you are and fits the screen
    const here = page.locator('.sh-here');
    await expect(here).toHaveText('Cómo trabajo');
    expect(await here.locator('span').evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
    await expect(page.locator('.sh-nav')).toBeHidden();
    const fit = async () => page.evaluate(() => {
      const small: string[] = [];
      const scope = document.querySelector('dialog[open]') ?? document.body;
      for (const el of scope.querySelectorAll<HTMLElement>('*')) {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
        if (own && el.getClientRects().length && parseFloat(getComputedStyle(el).fontSize) < 12) small.push(el.className || el.tagName);
      }
      const tiny = [...scope.querySelectorAll<HTMLElement>('a, button')]
        .filter((el) => el.getClientRects().length && !el.classList.contains('v2-skip'))
        .filter((el) => { const b = el.getBoundingClientRect(); return b.height < 44 || b.width < 44; })
        .map((el) => el.className || el.textContent);
      return { over: document.documentElement.scrollWidth - innerWidth, inner: scope.scrollWidth - scope.clientWidth, small, tiny };
    });
    expect(await fit()).toEqual({ over: 0, inner: 0, small: [], tiny: [] });

    // (a short page on a tall screen scrolls less than that: what matters is that it stays where it was)
    const y0 = await page.evaluate(() => { scrollTo(0, 120); return scrollY; });
    const open = page.locator('.sh-bar .sh-menu');
    await expect(open).toHaveAccessibleName('Menú');
    await expect(open).toHaveAttribute('aria-expanded', 'false');
    await open.click();
    const dialog = page.getByRole('dialog', { name: 'Menú del sitio' });
    await expect(dialog).toBeVisible();
    await expect(open).toHaveAttribute('aria-expanded', 'true');
    await expect(dialog.getByRole('button', { name: 'Cerrar el menú' })).toBeFocused();
    const links = dialog.getByRole('navigation', { name: 'Principal' }).getByRole('link');
    await expect(links).toHaveCount(6);
    await expect(links.nth(2)).toHaveAttribute('aria-current', 'page');
    await expect(links.nth(2)).toContainText('El método y el sistema agéntico.');
    await settle(page);
    expect(await fit()).toEqual({ over: 0, inner: 0, small: [], tiny: [] });
    // the pages and the contact button fit the first screen of the dialog
    const contact = dialog.locator('.sm-foot .ui-btn');
    await expect(contact).toHaveText('Contacto');
    if (h >= 740) await expect(contact).toBeInViewport({ ratio: 1 });

    // focus never leaves the dialog and the page under it does not move
    for (let i = 0; i < 16; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => { const a = document.activeElement; return !a || a === document.body || Boolean(a.closest('dialog')); })).toBe(true);
    }
    await page.mouse.wheel(0, 400);
    expect(await page.evaluate(() => scrollY)).toBe(y0);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
    await expect(open).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => document.documentElement.classList.contains('sm-open'))).toBe(false);

    // a page from the menu: it navigates, the menu closes and the bar names the new page
    await open.click();
    await dialog.getByRole('link', { name: /Brand Lab/ }).click();
    await expect(page).toHaveURL(/\/v2\/es\/brand-lab\/$/);
    await expect(dialog).toBeHidden();
    await expect(here).toHaveText('Brand Lab');
    // and the close button closes it too
    await open.click();
    await dialog.getByRole('button', { name: 'Cerrar el menú' }).click();
    await expect(dialog).toBeHidden();
  });
}

test('phones: the pill appears on scroll, every page fits 360 px and the language keeps the page', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const [name, path] of PAGES) {
    await page.goto(path);
    await expect(page.locator('.sh-here')).toHaveText(name);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), path).toBeLessThanOrEqual(0);
  }
  await page.goto('/v2/es/');
  await page.evaluate(() => scrollTo(0, 500));
  // if the pill does not come, say where the page was (seen once under load, never reproduced)
  const where = await page.evaluate(() => `scrollY ${scrollY} of ${document.documentElement.scrollHeight}, gate ${document.documentElement.dataset.gate}`);
  await expect(page.locator('.sh'), where).toHaveAttribute('data-stuck', 'true');
  await settle(page);
  await expect(page.locator('.sh-glass')).toHaveCSS('opacity', '1');
  // touch screens keep the solid glass: no backdrop filter to composite on every scroll frame
  await page.goto('/v2/es/negocio/');
  await page.getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/v2\/en\/negocio\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.sh-here')).toHaveText('Business');
});

test('the home leads to every page, and the design system keeps the header without a current page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/');
  await page.getByRole('link', { name: 'Explorar el portafolio' }).click();
  await expect(page.locator('#explorar')).toBeInViewport();
  const doors = page.locator('#explorar .ui-card-title a');
  await expect(doors).toHaveText(PAGES.slice(1).map((p) => p[0]));
  await doors.nth(0).click();
  await expect(page).toHaveURL(/\/v2\/es\/work\/$/);
  await page.getByRole('link', { name: 'Sistema IG' }).click();
  await expect(page).toHaveURL(/\/v2\/es\/tokens\/$/);
  await expect(page.locator('.sh-nav [aria-current]')).toHaveCount(0);
  await expect(page.locator('.sh-light')).toHaveAttribute('data-on', 'off');
  await expect(page.getByRole('navigation', { name: 'Sistema' }).getByRole('link')).toHaveCount(7);
});

test('reduced motion: the pill, the light and the menu change at once', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto('/v2/es/');
  await expect(page.locator('.sh-glass')).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('.sh-light')).toHaveCSS('transition-duration', '0s');
  await page.locator('.sh-bar .sh-menu').click();
  const dialog = page.getByRole('dialog', { name: 'Menú del sitio' });
  await expect(dialog).toHaveCSS('animation-name', 'none');
  await expect(dialog.locator('.sm-list li').first()).toHaveCSS('animation-name', 'none');
  await expect(dialog.locator('.sm-list li').last()).toHaveCSS('opacity', '1');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await ctx.close();
});

test('without JavaScript the header still names the current page and the foot leads everywhere', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('/v2/es/brand-lab/');
  const cur = page.locator('.sh-nav a[aria-current]');
  await expect(cur).toHaveText('Brand Lab');
  expect(await cur.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
  await expect(page.getByRole('navigation', { name: 'Mapa del sitio' }).getByRole('link')).toHaveCount(6);
  await ctx.close();
});
