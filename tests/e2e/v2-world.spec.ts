import { expect, test } from '@playwright/test';

// Lote 4.1: the art of the world of Work, on its page for approval (/v2/<l>/mundo/). One land in diagonal bands,
// a biome per stop, travelled sideways (drag, two buttons, the arrow keys); then every place on its own with its
// name, when, where it stands and what is drawn. Nothing is written inside the art.
const NAMES = ['Mar del Plata', 'TACH Argentina', 'Ada ITW', 'Tsoft', 'Eclipse', 'Sistema agéntico', 'Kinetic Studio', 'Volta', 'Velmar', 'DentalOS', 'games-market', 'Lucero', 'Trazo', 'Núcleo', 'Ciberseguridad', 'Quant', 'Aeroespacial'];

test('the land and its seventeen places, each with its name and state as real text', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/mundo/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('El mundo de Work');
  await expect(page.getByRole('navigation', { name: 'Sistema' }).getByRole('link', { name: 'Mundo' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  // the land: one drawing with a description, a band per place (two for Núcleo), a path travelled and a path planned
  const land = page.getByRole('img', { name: /Terreno isométrico en franjas diagonales/ });
  await expect(land).toBeVisible();
  expect(await land.evaluate((el) => [el.querySelectorAll('.wa-band').length, el.querySelectorAll('.wa-isle').length, el.querySelectorAll('text').length, el.querySelectorAll('.wa-node').length, el.querySelectorAll('.wa-path--plan').length])).toEqual([18, 18, 0, 17, 1]);
  // it fills its frame from edge to edge and top to bottom: no gap around the land
  const fill = await page.locator('.ws-view').evaluate((v) => { const a = v.getBoundingClientRect(), b = v.querySelector('.ws-land')!.getBoundingClientRect(); return [Math.round(b.height - v.clientHeight), b.width > a.width * 5]; });
  expect(fill).toEqual([0, true]);
  // the names of the places are written over the land, in the order of the journey
  await expect(page.getByRole('list', { name: 'Paradas del recorrido' }).locator('li b')).toHaveText(NAMES);
  await expect(page.locator('.wd-legend li')).toHaveText(['Sendero recorrido', 'Sendero planeado', 'Construido', 'En obra']);
  await expect(page.locator('main h2')).toHaveText(['El recorrido', 'Donde empezó', 'El trabajo', 'Camino propio', 'Lo que viene']);
  const cards = page.locator('.wd-card');
  await expect(cards.locator('h3')).toHaveText(NAMES);
  await expect(cards.locator('.wd-state').nth(3)).toHaveText('Trabajo profesional · corporativa');
  await expect(cards.locator('.wd-state').nth(4)).toHaveText('En construcción');
  await expect(page.locator('section[aria-labelledby="wd-next"] .wd-state')).toHaveText(Array(4).fill('En el roadmap'));
  await expect(page.locator('section[aria-labelledby="wd-next"] .wd-when')).toHaveText(['nov 2026 – feb 2028', 'feb – ago 2028', 'ago 2028 – jun 2029', 'jun 2029 – ago 2030']);
  // every place is drawn on its own too, with what it shows said in words
  const drawn = await cards.evaluateAll((els) => els.map((el) => { const svg = el.querySelector('svg')!; const b = svg.getBoundingClientRect(); return [svg.getAttribute('role'), (svg.getAttribute('aria-label') ?? '').length > 20, svg.querySelectorAll('path').length > 20, b.width > 150 && b.height > 100]; }));
  expect(drawn).toEqual(Array(17).fill(['img', true, true, true]));
  await expect(cards.first().locator('.wd-art')).toContainText('el faro, el muelle');
  // no id is used twice (the land and the cards carry their own clips)
  expect(await page.evaluate(() => { const ids = [...document.querySelectorAll('[id]')].map((el) => el.id); return ids.length - new Set(ids).size; })).toBe(0);
  expect(errors).toEqual([]);
});

/** How far the middle of what stands on a place is from the middle of the frame. */
const offCentre = (page: import('@playwright/test').Page, id: string) => page.evaluate((id) => {
  const v = document.querySelector('.ws-view')!.getBoundingClientRect();
  const boxes = [...document.querySelectorAll(`.ws-land .wa-isle[data-id="${id}"]`)].map((el) => el.getBoundingClientRect());
  const l = Math.min(...boxes.map((b) => b.left)), r = Math.max(...boxes.map((b) => b.right));
  return Math.abs((l + r) / 2 - (v.left + v.width / 2));
}, id);

test('travelling it: the two buttons, the arrow keys and a drag with the mouse, one stop at a time', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/mundo/');
  const view = page.locator('.ws-view'), now = page.locator('.ws-now');
  const prev = page.getByRole('button', { name: 'Parada anterior' }), next = page.getByRole('button', { name: 'Parada siguiente' });
  // it starts on the first stop, in the middle of the frame, with nowhere to go back to
  await expect(now).toContainText('01 / 17');
  await expect(now).toContainText('Mar del Plata');
  await expect(prev).toBeDisabled();
  expect(await offCentre(page, 'mdp')).toBeLessThan(120);
  // a button goes one stop on and brings it to the middle
  await next.click();
  await expect(now).toContainText('02 / 17');
  await expect(now).toContainText('TACH Argentina');
  await expect.poll(() => offCentre(page, 'tach')).toBeLessThan(120);
  await expect(prev).toBeEnabled();
  await expect(page.locator('.ws-names li[data-on]')).toHaveText(/TACH Argentina/);
  // the arrow keys do the same; End and Home go to the ends
  await view.focus();
  await page.keyboard.press('ArrowRight');
  await expect(now).toContainText('Ada ITW');
  await page.keyboard.press('ArrowLeft');
  await expect(now).toContainText('TACH Argentina');
  await page.keyboard.press('End');
  await expect(now).toContainText('17 / 17');
  await expect(now).toContainText('Aeroespacial');
  await expect(next).toBeDisabled();
  await expect.poll(() => offCentre(page, 'espacio')).toBeLessThan(160);
  // Núcleo takes two bands and is one stop, between its two
  await prev.click(); await prev.click(); await prev.click();
  await expect(now).toContainText('14 / 17');
  await expect(now).toContainText('Núcleo');
  await expect.poll(() => offCentre(page, 'nucleo')).toBeLessThan(120);
  await page.keyboard.press('Home');
  await expect(now).toContainText('01 / 17');
  await expect.poll(() => view.evaluate((el) => el.scrollLeft)).toBe(0);
  // with the mouse you drag the land itself
  const box = (await view.boundingBox())!;
  await page.mouse.move(box.x + 900, box.y + 200);
  await page.mouse.down();
  await page.mouse.move(box.x + 300, box.y + 230, { steps: 5 });
  expect(await view.evaluate((el) => 'drag' in (el as HTMLElement).dataset)).toBe(true);
  await page.mouse.up();
  expect(await view.evaluate((el) => [Math.round(el.scrollLeft), 'drag' in (el as HTMLElement).dataset])).toEqual([600, false]);
  await expect(now).toContainText('02 / 17');
});

test('with reduced motion a stop arrives at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/v2/es/mundo/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  await page.getByRole('button', { name: 'Parada siguiente' }).click();
  // no glide: by the next task the frame is already there
  expect(await offCentre(page, 'tach')).toBeLessThan(120);
});

test('on a phone the land travels inside its own frame, and the page stays its width', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/v2/es/mundo/');
  // a frame you can focus and scroll, with a name that says what to do
  const frame = page.getByRole('group', { name: 'Arrastrá el terreno o usá las flechas para recorrerlo.' });
  await expect(frame).toHaveAttribute('tabindex', '0');
  const before = await frame.evaluate((el) => [el.scrollWidth > el.clientWidth * 10, el.scrollLeft]);
  expect(before).toEqual([true, 0]);
  // with the keyboard too: the frame takes focus and the arrows move it
  await frame.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => frame.evaluate((el) => el.scrollLeft)).toBeGreaterThan(300);
  await expect(page.locator('.ws-now')).toContainText('Ada ITW');
  // the stop in the middle has its name in view
  await expect.poll(() => page.evaluate(() => { const b = document.querySelector('.ws-names li[data-id="ada"]')!.getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth; })).toBe(true);
  // two buttons a thumb can hit
  const sizes = await page.locator('.ws-bar button').evaluateAll((els) => els.map((el) => { const b = el.getBoundingClientRect(); return Math.min(b.width, b.height); }));
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(44);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 740) await page.evaluate((y) => scrollTo(0, y), y);
  const r = await page.evaluate(() => {
    const small: string[] = [];
    for (const el of document.querySelectorAll('main *')) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (own && parseFloat(getComputedStyle(el).fontSize) < 12) small.push(el.className.toString() || el.tagName);
    }
    return { over: document.documentElement.scrollWidth - innerWidth, small };
  });
  expect(r.over).toBeLessThanOrEqual(0);
  expect(r.small).toEqual([]);
});

test('without JS the land is all there and its frame still scrolls', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto('/v2/es/mundo/');
  await expect(page.getByRole('img', { name: /Terreno isométrico en franjas diagonales/ })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Paradas del recorrido' }).locator('li')).toHaveCount(17);
  // the buttons need the script: they are not offered
  await expect(page.locator('.ws-bar')).toBeHidden();
  const frame = page.locator('.ws-view');
  await expect(frame).toHaveCSS('overflow-x', 'auto');
  await expect(frame).toHaveAttribute('tabindex', '0');
  await context.close();
});

test('in English the places keep their order and say where they stand', async ({ page }) => {
  await page.goto('/v2/en/mundo/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The world of Work');
  await expect(page.locator('.wd-card h3')).toHaveText(['Mar del Plata', 'TACH Argentina', 'Ada ITW', 'Tsoft', 'Eclipse', 'Agentic system', 'Kinetic Studio', 'Volta', 'Velmar', 'DentalOS', 'games-market', 'Lucero', 'Trazo', 'Core', 'Cybersecurity', 'Quant', 'Aerospace']);
  await expect(page.locator('section[aria-labelledby="wd-next"] .wd-state')).toHaveText(Array(4).fill('On the roadmap'));
  await expect(page.getByRole('button', { name: 'Next stop' })).toBeEnabled();
  await expect(page.getByRole('group', { name: 'Drag the land or use the arrows to travel it.' })).toBeVisible();
});
