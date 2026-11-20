import { expect, type Locator, type Page, test } from '@playwright/test';

// Lote 6.2: «Negocio» of /v2. Seven sections applied to the projects' own decisions, with their real formulas.

const SECTIONS = ['modelo', 'precios', 'economia', 'embudo', 'ciclo', 'venta', 'metrica'];
const sec = (page: Page, id: string) => page.locator(`#${id}`);
const out = (s: Locator, k: string) => s.locator('.bz-panel:not([data-off]) .bz-out', { hasText: k }).locator('b');

test('seven sections, an index to each, and the honest note first', async ({ page }) => {
  await page.goto('/v2/es/negocio/');
  await expect(page.locator('.bz-honest')).toContainText('escenarios de ejemplo');
  for (const id of SECTIONS) {
    await expect(sec(page, id).locator('h2'), id).toBeVisible();
    await expect(page.locator(`.bz-index a[href="#${id}"]`), id).toHaveCount(1);
  }
  await page.locator('.bz-index a[href="#ciclo"]').click();
  await expect(page).toHaveURL(/#ciclo$/);
});

test('tabs: one project at a time, with the arrow keys too', async ({ page }) => {
  await page.goto('/v2/es/negocio/');
  const model = sec(page, 'modelo');
  const tabs = model.getByRole('tab');
  await expect(tabs).toHaveCount(5);
  await expect(model.locator('.bz-panel:not([data-off])')).toHaveCount(1);
  await tabs.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(model.locator('.bz-panel:not([data-off]) .bz-node')).toHaveCount(3); // Lucero: diner, venue, Eclipse
  await page.keyboard.press('End');
  await expect(tabs.nth(4)).toHaveAttribute('aria-selected', 'true');
});

test('the simulators compute with the repos’ formulas', async ({ page }) => {
  await page.goto('/v2/es/negocio/');
  const unit = sec(page, 'economia');
  // Velmar: the NFC plate costs 6.100 and is suggested at 12.200; the collar at 15.600
  await expect(out(unit, 'Precio sugerido')).toHaveText('$ 12.200');
  await unit.getByRole('button', { name: 'Collar con nombre' }).click();
  await expect(out(unit, 'Precio sugerido')).toHaveText('$ 15.600');
  // a higher margin, by keyboard on its range
  const margin = unit.locator('.bz-panel:not([data-off])').getByLabel('Margen objetivo');
  await margin.focus();
  await page.keyboard.press('ArrowRight');
  await expect(out(unit, 'Precio sugerido')).toHaveText('$ 15.900');
  // Volta: landed cost 27.194, proposed price 41.900 ending in 900, 500 rounds to 42.000
  await unit.getByRole('tab', { name: /Volta/ }).click();
  await expect(out(unit, 'Costo puesto')).toHaveText('$ 27.194');
  await expect(out(unit, 'Precio propuesto')).toHaveText('$ 41.900');
  await unit.getByRole('button', { name: 'a 500' }).click();
  await expect(out(unit, 'Precio propuesto')).toHaveText('$ 42.000');
  // DentalOS: the repo's test — one attention covers the campaign; a service that costs more leaves no break-even
  await unit.getByRole('tab', { name: /DentalOS/ }).click();
  await expect(out(unit, 'Atenciones para cubrirla')).toHaveText('1');
  const cost = unit.locator('.bz-panel:not([data-off])').getByLabel('Costo del servicio');
  await cost.fill('20000');
  await expect(out(unit, 'Atenciones para cubrirla')).toHaveText('—');
  await expect(unit.locator('.bz-panel:not([data-off])')).toContainText('continuidad');
});

test('the loop walks once and stops; the meeting moves minute by minute', async ({ page }) => {
  await page.goto('/v2/es/negocio/');
  const loop = sec(page, 'ciclo');
  await loop.scrollIntoViewIfNeeded();
  const steps = loop.locator('.bz-panel:not([data-off]) .bz-ring-steps button');
  await expect(steps).toHaveCount(6);
  await steps.nth(2).click();
  await expect(steps.nth(2)).toHaveAttribute('aria-pressed', 'true');
  await expect(loop.locator('.bz-panel:not([data-off]) .bz-loop-t')).toHaveText('Aviso');
  const play = loop.locator('.bz-panel:not([data-off])').getByRole('button', { name: 'Recorrer el ciclo' });
  await play.click();
  await expect(steps.nth(3)).toHaveAttribute('aria-pressed', 'true', { timeout: 4000 });
  // once around: it ends back at the first step and stops
  await expect(steps.nth(0)).toHaveAttribute('aria-pressed', 'true', { timeout: 12000 });
  await expect(loop.locator('.bz-panel:not([data-off])').getByRole('button', { name: 'Recorrer el ciclo' })).toHaveAttribute('aria-pressed', 'false');
  // the meeting
  const sale = sec(page, 'venta');
  await expect(sale.locator('.bz-meet-t')).toHaveText('El dolor');
  await sale.getByRole('button', { name: /9:00/ }).click();
  await expect(sale.locator('.bz-meet-t')).toHaveText('Cierre');
  const scrub = sale.getByLabel('Minuto de la reunión');
  await scrub.focus();
  await page.keyboard.press('Home');
  await expect(sale.locator('.bz-meet-t')).toHaveText('El dolor');
});

test('without JavaScript every panel is there, one under the other', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/v2/es/negocio/');
  await expect(page.locator('.bz-tablist').first()).toBeHidden();
  await expect(sec(page, 'modelo').locator('.bz-panel')).toHaveCount(5);
  for (const p of await sec(page, 'modelo').locator('.bz-panel').all()) await expect(p).toBeVisible();
  await expect(sec(page, 'economia')).toContainText('$ 12.200');
  await expect(sec(page, 'ciclo').locator('.bz-loop-list').first()).toBeVisible();
  await ctx.close();
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });
  test('nothing wider than the screen, text that can be read, controls that can be touched', async ({ page }) => {
    await page.goto('/v2/es/negocio/');
    const report = await page.evaluate(() => {
      const small: string[] = [], tiny: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>('.bz *')) {
        if (!el.offsetWidth || getComputedStyle(el).visibility === 'hidden' || el.closest('.ui-sr')) continue;
        if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()) && parseFloat(getComputedStyle(el).fontSize) < 12) small.push(el.className);
        if (el.matches('.bz button, .bz a, .bz input') && Math.min(el.offsetWidth, el.offsetHeight) < 44) tiny.push(`${el.className || el.tagName}: ${el.textContent!.slice(0, 16)}`);
      }
      return { small, tiny, wide: document.documentElement.scrollWidth > innerWidth };
    });
    expect(report).toEqual({ small: [], tiny: [], wide: false });
  });
});

test('in English', async ({ page }) => {
  await page.goto('/v2/en/negocio/');
  await expect(sec(page, 'economia').locator('.bz-out', { hasText: 'Suggested price' }).first().locator('b')).toHaveText('$ 12,200');
  await expect(page.locator('#modelo').getByRole('tablist')).toHaveAttribute('aria-label', 'Project');
});
