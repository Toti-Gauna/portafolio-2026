import { expect, test } from '@playwright/test';

// Lote 1.5: the illustration and icon kit of /v2, in /v2/<lang>/kit/.

const URL = '/v2/es/kit/';

test('the kit shows its four languages, with no console errors, and is never indexed', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(URL);
  for (const id of ['iconos', 'ilustracion', 'estampillas', 'tres-d']) await expect(page.locator(`section#${id} h2`)).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByRole('navigation', { name: 'Sistema' }).getByRole('link', { name: 'Kit' })).toHaveAttribute('aria-current', 'page');
  expect(await page.locator('body').innerText()).not.toMatch(/\bSsr\b|HandyX/);
  expect(errors).toEqual([]);
});

test('icons: 42 on one grid; interface glyphs have no accent, concept icons exactly one', async ({ page }) => {
  await page.goto(URL);
  const tiles = page.locator('.kit-icons li');
  await expect(tiles).toHaveCount(42);
  const report = await page.evaluate(() =>
    [...document.querySelectorAll('.kit-family')].map((fam) =>
      [...fam.querySelectorAll('.kit-icons svg')].map((svg) => ({
        box: svg.getAttribute('viewBox'), stroke: svg.getAttribute('stroke-width'), accents: svg.querySelectorAll('.ic-a').length, hidden: svg.getAttribute('aria-hidden'),
      })),
    ),
  );
  for (const fam of report) for (const ic of fam) { expect(ic.box).toBe('0 0 24 24'); expect(ic.stroke).toBe('1.75'); expect(ic.hidden).toBe('true'); }
  expect(report[0].every((ic) => ic.accents === 0)).toBe(true);
  for (const fam of report.slice(1)) expect(fam.every((ic) => ic.accents === 1)).toBe(true);
  // each tile names its icon
  for (const text of await tiles.allInnerTexts()) expect(text.trim().length).toBeGreaterThan(1);
});

test('the gauge: arrow keys bring each change under the needle; the readout, the lamp and the slider value agree', async ({ page }) => {
  await page.goto(URL);
  const stage = page.getByRole('slider', { name: /calibre de tests/ });
  const readout = page.locator('.kit-corner[data-corner="readout"]');
  const lamp = stage.locator('[data-part="lamp"]');
  await stage.scrollIntoViewIfNeeded();
  await stage.focus();
  await page.keyboard.press('Home');
  await expect(readout).toHaveText('cambio 1 · mide 14,0 · pasa', { timeout: 5000 });
  await expect(lamp).toHaveAttribute('data-state', 'pass');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(readout).toHaveText('cambio 3 · mide 17,2 · vuelve a ajuste', { timeout: 5000 });
  await expect(lamp).toHaveAttribute('data-state', 'fail');
  await expect(stage).toHaveAttribute('aria-valuetext', 'cambio 3 · mide 17,2 · vuelve a ajuste');
  await expect(stage).toHaveAttribute('aria-valuenow', '3');
  await page.keyboard.press('End');
  await expect(readout).toHaveText('cambio 5 · mide 14,1 · pasa', { timeout: 5000 });
  // it settles: once it has arrived nothing keeps moving
  const d = () => stage.locator('[data-part="needle"]').getAttribute('d');
  const before = await d();
  await page.waitForTimeout(600);
  expect(await d()).toBe(before);
});

test('stamps: six stops, each with its year and name in HTML and a description', async ({ page }) => {
  await page.goto(URL);
  const stamps = page.locator('.kit-stamp');
  await expect(stamps).toHaveCount(6);
  await expect(stamps.nth(0)).toContainText('2021');
  await expect(stamps.nth(0)).toContainText('TACH Argentina');
  await expect(stamps.nth(3)).toContainText('CompliA');
  await expect(page.getByRole('img', { name: /Estampilla/ })).toHaveCount(6);
});

test('3D: three.js arrives only when the scene comes on screen, then it turns with the arrow keys', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const three: string[] = [];
  await page.goto(URL);
  await page.waitForTimeout(800);
  const scene = page.locator('.kit-scene');
  await expect(scene.locator('canvas')).toHaveCount(0);
  await expect(scene).not.toHaveAttribute('data-ready', '1');
  page.on('request', (r) => r.resourceType() === 'script' && three.push(r.url()));
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute('data-ready', '1', { timeout: 15000 });
  await expect(scene.locator('canvas')).toHaveCount(1);
  expect(three.length).toBeGreaterThan(0); // its chunk was fetched on demand
  // something was drawn: the renderer reports the triangles of its last frame
  expect(Number(await scene.getAttribute('data-drawn'))).toBeGreaterThan(100);
  await scene.focus();
  await page.keyboard.press('ArrowRight');
  await expect(scene).toHaveAttribute('data-turn', /\d/);
});

for (const [w, h] of [[360, 740], [390, 844], [1440, 900]] as const) {
  test(`kit at ${w}×${h}: no horizontal scroll, no text under 12 px, targets of 44 px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(URL);
    const r = await page.evaluate(() => {
      const small: string[] = [];
      for (const el of document.querySelectorAll('body *:not(svg *)')) {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
        if (own && parseFloat(getComputedStyle(el).fontSize) < 12) small.push(el.className || el.tagName);
      }
      const tiny = [...document.querySelectorAll<HTMLElement>('a, button')]
        .filter((el) => el.offsetParent && !el.classList.contains('v2-skip') && el.getBoundingClientRect().height < 44)
        .map((el) => el.className || el.tagName);
      return { over: document.documentElement.scrollWidth - window.innerWidth, small, tiny };
    });
    expect(r.over).toBeLessThanOrEqual(0);
    expect(r.small).toEqual([]);
    expect(r.tiny).toEqual([]);
  });
}

test('reduced motion: the gauge waits at the first change and jumps on request; the 3D scene draws one frame', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL);
  const stage = page.getByRole('slider', { name: /calibre de tests/ });
  await stage.scrollIntoViewIfNeeded();
  const readout = page.locator('.kit-corner[data-corner="readout"]');
  await page.waitForTimeout(1600);
  await expect(readout).toHaveText('cambio 1 · mide 14,0 · pasa'); // no tour
  await stage.focus();
  await page.keyboard.press('ArrowRight');
  await expect(readout).toHaveText('cambio 2 · mide 14,3 · pasa');
  const scene = page.locator('.kit-scene');
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute('data-ready', '1', { timeout: 15000 });
  await ctx.close();
});
