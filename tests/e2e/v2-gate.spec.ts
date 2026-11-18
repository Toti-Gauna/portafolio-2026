import { expect, test, type Page } from '@playwright/test';

// Lote 3.1: the gate of /v2. One screen on any device over a 3D scene, in four versions (the mark in polished
// metal, the five layers of the craft, the climb of the roadmap, the stamps of the journey). Each object builds
// itself with the real loading; the name and two doors are HTML. Every other test skips the gate with the QA
// switch (playwright.config.ts); these run without it.
test.use({ storageState: { cookies: [], origins: [] } });
test.setTimeout(90_000); // the scene is drawn by software here

const gate = (page: Page) => page.getByRole('dialog', { name: 'Entrada al portafolio' });
const ready = async (page: Page) => {
  await expect(page.locator('.gt')).toHaveAttribute('data-ready', 'true', { timeout: 45_000 });
  await page.waitForTimeout(900); // the entrances of the name and the doors
};
/** What must hold on every screen: one screen, nothing cut, readable, touchable. */
const measure = (page: Page) => page.evaluate(() => {
  const g = document.querySelector('.gt')!;
  const inner = document.querySelector('.gt-in')!;
  const seen = (el: Element) => { const b = el.getBoundingClientRect(); const cs = getComputedStyle(el); return b.width > 0 && cs.visibility !== 'hidden' && !el.closest('.ui-sr'); };
  const inside = (el: Element) => { const b = el.getBoundingClientRect(); return b.left >= -1 && b.top >= -1 && b.right <= innerWidth + 1 && b.bottom <= innerHeight + 1; };
  const parts = [...g.querySelectorAll('.gt-brand, .gt-stage, .gt-word, .gt-role, .gt-door, .gt-meter, .gt-tags b, .gt-tags em')].filter(seen);
  const small: string[] = [];
  for (const el of g.querySelectorAll('*')) {
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
    if (own && seen(el) && parseFloat(getComputedStyle(el).fontSize) < 12) small.push(el.className.toString() || el.tagName);
  }
  const stage = g.querySelector('.gt-stage')!.getBoundingClientRect();
  return {
    fits: inner.scrollHeight <= inner.clientHeight && inner.scrollWidth <= inner.clientWidth,
    outside: parts.filter((el) => !inside(el)).map((el) => `${el.className || el.tagName}: ${el.textContent!.slice(0, 16)}`),
    doors: [...g.querySelectorAll('.gt-door')].map((el) => Math.round(el.getBoundingClientRect().height)),
    stage: [Math.round(stage.width), Math.round(stage.height)],
    small,
    pageScroll: getComputedStyle(document.documentElement).overflowY,
  };
});
const fits = async (page: Page) => {
  const r = await measure(page);
  expect(r.fits).toBe(true);
  expect(r.outside).toEqual([]);
  expect(Math.min(...r.doors)).toBeGreaterThanOrEqual(44);
  expect(Math.min(...r.stage)).toBeGreaterThanOrEqual(120);
  expect(r.small).toEqual([]);
  expect(r.pageScroll).toBe('hidden');
};

test('the gate is in the HTML the server sends, and without JavaScript there is no gate at all', async ({ request, browser }) => {
  const html = await (await request.get('/v2/es/')).text();
  expect(html).toContain('class="gt"');
  expect(html).toContain('Ver portafolio');
  expect(html).toContain('gt-poster');
  expect(html).toMatch(/<noscript><style>\.gt\{display:none\}<\/style><\/noscript>/);
  const ctx = await browser.newContext({ javaScriptEnabled: false, storageState: { cookies: [], origins: [] } });
  const page = await ctx.newPage();
  await page.goto('/v2/es/');
  await expect(page.locator('.gt')).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await ctx.close();
});

for (const [w, h] of [[360, 640], [390, 844], [844, 390], [820, 1180], [1024, 768], [1440, 900]] as const) {
  test(`one screen at ${w}×${h}: everything visible, nothing scrolls, readable and touchable`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/v2/es/');
    await expect(gate(page)).toBeVisible();
    await ready(page);
    await fits(page);
    await page.mouse.wheel(0, 600);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });
}

test('the count follows the real loading; under the gate the page waits; Enter opens it', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/');
  // the doors and the name are there from the first paint, before the scene
  await expect(page.getByRole('button', { name: 'Ver portafolio' })).toBeVisible();
  await expect(page.locator('.gt-step')).toContainText(/Cargando · (interfaz|tipografías|escena|página)|Listo/);
  const bar = page.getByRole('progressbar', { name: 'Carga del sitio' });
  await expect(bar).toHaveAttribute('aria-valuenow', '100', { timeout: 45_000 });
  await expect(page.locator('.gt-step')).toHaveText('Listo');
  await expect(page.locator('.gt-num')).toHaveText('100');
  await expect(page.locator('.gt')).toHaveAttribute('data-step', '4');
  // with 3D the scene took over from the drawn mark; without it, the drawn one stays
  const gl = await page.locator('.gt').getAttribute('data-gl');
  expect(['on', 'off']).toContain(gl);
  await expect(page.locator('.gt-poster')).toHaveCSS('opacity', gl === 'on' ? '0' : '1');
  await expect(page.locator('.gt-canvas')).toHaveCSS('opacity', gl === 'on' ? '1' : '0');
  // the whole name for screen readers; the moving letters are decoration
  await expect(page.locator('.gt-name .ui-sr')).toHaveText('Ignacio Gauna');
  await expect(page.locator('.gt-name .gt-word').first()).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.gt-role')).toHaveText('SrAI Fullstack Developer');
  await expect(page.locator('.gt-brand')).toContainText('Portafolio 2026');
  await expect(page.locator('.gt-place')).toHaveText('Mar del Plata, Argentina');

  // the page under the gate: no focus, no shortcuts
  expect(await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.sh, #main')].map((el) => el.inert))).toEqual([true, true]);
  await expect(gate(page)).toBeFocused();
  const stops: string[] = [];
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Tab');
    stops.push(await page.evaluate(() => (document.activeElement?.closest('.gt') ? (document.activeElement.textContent ?? '').replace(/Enter$/, '').trim() : 'outside')));
  }
  expect(stops.filter((s) => s !== 'outside').slice(0, 2)).toEqual(['Conocer a Ignacio', 'Ver portafolio']);
  expect(stops.every((s) => s === 'outside' || ['Conocer a Ignacio', 'Ver portafolio', ''].includes(s))).toBe(true);
  await page.keyboard.press('2');
  await expect(page).toHaveURL(/\/v2\/es\/$/);
  await expect(page.getByRole('link', { name: 'Conocer a Ignacio' }).first()).toHaveAttribute('href', /\/trailer\/v2\/index\.html\?lang=es$/);

  await page.locator('.gt').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.gt')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('data-gate', 'off');
  await expect(page.locator('#main')).toBeFocused();
  expect(await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.sh, #main')].map((el) => el.inert))).toEqual([false, false]);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('the second door and Escape open it too; inside the visit it never comes back, a reload brings it again', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/v2/en/');
  await expect(page.getByRole('dialog', { name: 'Entrance to the portfolio' })).toBeVisible();
  await page.getByRole('button', { name: 'View portfolio' }).click();
  await expect(page.locator('.gt')).toHaveCount(0);
  // around the site and back home: no gate
  await page.locator('.sh-bar .sh-menu').click();
  await page.getByRole('dialog', { name: 'Site menu' }).getByRole('link', { name: /Work/ }).click();
  await expect(page).toHaveURL(/\/work\/$/);
  await page.locator('.sh-home').first().click();
  await expect(page).toHaveURL(/\/v2\/en\/$/);
  await expect(page.locator('.gt')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // a full load of the home: the gate again, and Escape opens it
  await page.reload();
  await expect(page.locator('.gt')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.gt')).toHaveCount(0);
});

test('a visit that starts on another page never meets the gate', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/');
  await expect(page.locator('html')).toHaveAttribute('data-gate', 'off');
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Inicio' }).click();
  await expect(page).toHaveURL(/\/v2\/es\/$/);
  await expect(page.locator('.gt')).toBeHidden();
  await expect(page.locator('.v2-hero .ui-btn--primary')).toBeVisible();
});

test('reduced motion: one still frame of the finished object, nothing animates, and the gate opens at once', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 }, storageState: { cookies: [], origins: [] } });
  const page = await ctx.newPage();
  await page.goto('/v2/es/');
  await expect(page.locator('.gt')).toHaveAttribute('data-ready', 'true', { timeout: 45_000 });
  await expect(page.locator('.gt-l').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.gt-l').last()).toHaveCSS('opacity', '1');
  await expect(page.locator('.gt-doors')).toHaveCSS('animation-name', 'none');
  if ((await page.locator('.gt').getAttribute('data-gl')) === 'on') {
    // the scene drew what it had to and stopped: no frame is drawn while nothing changes
    const frames = () => page.locator('.gt-canvas').getAttribute('data-frames');
    const before = await frames();
    await page.mouse.move(400, 300);
    await page.mouse.move(700, 500);
    await page.waitForTimeout(1200);
    expect(await frames()).toBe(before);
  }
  await page.getByRole('button', { name: 'Ver portafolio' }).click();
  await expect(page.locator('.gt')).toHaveCount(0);
  await ctx.close();
});

test('without WebGL the drawn mark stays, the count is the loading itself and everything works', async ({ page }) => {
  await page.addInitScript(() => { delete (window as unknown as { WebGL2RenderingContext?: unknown }).WebGL2RenderingContext; });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/v2/es/puerta/ascenso/');
  await expect(page.locator('.gt')).toHaveAttribute('data-gl', 'off');
  await expect(page.locator('.gt')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.gt-poster')).toBeVisible();
  await expect(page.locator('.gt-poster')).toHaveCSS('opacity', '1');
  await expect(page.locator('.gt-num')).toHaveText('100');
  // the labels belong to the 3D object: without it they are not shown
  await expect(page.locator('.gt-tags')).toBeHidden();
  await fits(page);
  await page.keyboard.press('Enter');
  await expect(page.locator('.gt')).toHaveCount(0);
});

test('with 3D the scene is drawn, follows the pointer, and stops when the gate closes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/v2/es/');
  await ready(page);
  test.skip((await page.locator('.gt').getAttribute('data-gl')) !== 'on', 'this browser has no WebGL');
  // the scene drew its way to the finished mark, on a canvas that covers the gate
  expect(Number(await page.locator('.gt-canvas').getAttribute('data-frames'))).toBeGreaterThan(8);
  const c = await page.locator('.gt-canvas').evaluate((el: HTMLCanvasElement) => [el.width, el.height, el.clientWidth, el.clientHeight]);
  expect(c[0]).toBeGreaterThanOrEqual(c[2]);
  expect(c[2]).toBe(1280);
  expect(c[3]).toBe(800);
  await expect(page.locator('.gt')).toHaveAttribute('data-move', '4');
  await page.keyboard.press('Enter');
  await expect(page.locator('.gt')).toHaveCount(0);
  // nothing keeps asking for frames once it is gone
  await page.mouse.move(5, 5);
  await page.waitForTimeout(800);
  await page.evaluate(() => { const w = window as Window & { __raf?: number }; w.__raf = 0; const raf = requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => { w.__raf = (w.__raf ?? 0) + 1; return raf(cb); }; });
  await page.waitForTimeout(1200);
  expect(await page.evaluate(() => (window as Window & { __raf?: number }).__raf)).toBe(0);
});

// The other three versions, each on its own preview route, and the page that lists the four.
const VERSIONS: [id: string, tags: string[]][] = [
  ['codigo', ['Planificación y ejecución', 'Código', 'Agentes', 'Tests', 'Deploy']],
  ['ascenso', ['2026Núcleo', '2028Ciberseguridad', '2028Quant', '2029Aeroespacial', '2030']],
  ['postal', ['2021TACH Argentina', '2023Ada ITW', '2024Tsoft · Tuenti', '2026CompliA · Tsoft', '2026Supernova Eventos', 'HoyEclipse']],
];

for (const [id, tags] of VERSIONS) {
  for (const [w, h] of [[360, 640], [844, 390], [1440, 900]] as const) {
    test(`«${id}» at ${w}×${h}: one screen, and its labels follow the object`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.setViewportSize({ width: w, height: h });
      await page.goto(`/v2/es/puerta/${id}/`);
      await expect(page.locator('.gt')).toHaveAttribute('data-v', id);
      // what the labels say is real text, in the HTML the server sent
      await expect(page.locator('.gt-tags li')).toHaveText(tags);
      await expect(page.locator('.gt-name .ui-sr')).toHaveText('Ignacio Gauna');
      await ready(page);
      await fits(page);
      if ((await page.locator('.gt').getAttribute('data-gl')) === 'on') {
        await expect(page.locator('.gt')).toHaveAttribute('data-move', '4');
        // every label sits on its own point of the object: all placed, no two on the same spot
        const at = await page.locator('.gt-tags li').evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform));
        expect(at.every((t) => /^translate3d\(/.test(t))).toBe(true);
        expect(new Set(at).size).toBe(tags.length);
        const shown = id === 'codigo' && w < 900 ? 0 : tags.length;
        expect(await page.locator('.gt-tags li').evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity === '1' && getComputedStyle(el).visibility === 'visible').length)).toBe(shown);
      }
      await page.keyboard.press('Enter');
      await expect(page.locator('.gt')).toHaveCount(0);
      await expect(page.locator('.v2-hero .ui-btn--primary')).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
}

test('/puerta/: the four versions side by side, each a link to the real thing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/puerta/');
  await expect(page.locator('html')).toHaveAttribute('data-gate', 'off');
  await expect(page.getByRole('navigation', { name: 'Sistema' }).getByRole('link', { name: 'Puerta' })).toHaveAttribute('aria-current', 'page');
  const cards = page.locator('.gl-card');
  await expect(cards.locator('h2')).toHaveText(['Monograma', 'Código', 'Ascenso', 'Postal']);
  await expect(cards.first()).toContainText('Hoy en el inicio');
  await expect(cards.nth(2)).toContainText('El roadmap 2026 → 2030');
  await cards.nth(3).getByRole('link', { name: /Abrir esta puerta/ }).click();
  await expect(page).toHaveURL(/\/v2\/es\/puerta\/postal\/$/);
  await expect(page.locator('.gt')).toHaveAttribute('data-v', 'postal');
  // at 360 px the page fits
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/v2/es/puerta/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});
