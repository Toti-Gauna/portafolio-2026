import { expect, test } from '@playwright/test';

// Lote 4.1: the art of the world of Work, on its page for approval (/v2/<l>/mundo/). The whole map, then every
// island on its own with its name, when, where it stands and what is drawn. Nothing is written inside the art.
const NAMES = ['Mar del Plata', 'TACH Argentina', 'Ada ITW', 'Tsoft', 'Eclipse', 'Sistema agéntico', 'Kinetic Studio', 'Volta', 'Velmar', 'DentalOS', 'games-market', 'Lucero', 'Trazo', 'Núcleo', 'Ciberseguridad', 'Quant', 'Aeroespacial'];

test('the whole world and its seventeen islands, each with its name and state as real text', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/mundo/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('El mundo de Work');
  await expect(page.getByRole('navigation', { name: 'Sistema' }).getByRole('link', { name: 'Mundo' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  // the map: one drawing with a description, seventeen islands, a path travelled and a path planned
  const map = page.getByRole('img', { name: /Mapa isométrico: diecisiete islas/ });
  await expect(map).toBeVisible();
  expect(await map.evaluate((el) => [el.querySelectorAll('.wa-isle[data-id]').length / 2, el.querySelectorAll('text').length, el.querySelectorAll('.wa-node').length, el.querySelectorAll('.wa-path--plan').length])).toEqual([17, 0, 17, 1]);
  await expect(page.locator('.wd-legend li')).toHaveText(['Sendero recorrido', 'Sendero planeado', 'Construido', 'En obra']);
  // the islands, in the order of the journey and under their four headings
  await expect(page.locator('main h2')).toHaveText(['El mundo completo', 'Donde empezó', 'El trabajo', 'Camino propio', 'Lo que viene']);
  const cards = page.locator('.wd-card');
  await expect(cards.locator('h3')).toHaveText(NAMES);
  await expect(cards.locator('.wd-state').nth(3)).toHaveText('Trabajo profesional · corporativa');
  await expect(cards.locator('.wd-state').nth(4)).toHaveText('En construcción');
  await expect(page.locator('section[aria-labelledby="wd-next"] .wd-state')).toHaveText(Array(4).fill('En el roadmap'));
  await expect(page.locator('section[aria-labelledby="wd-next"] .wd-when')).toHaveText(['nov 2026 – feb 2028', 'feb – ago 2028', 'ago 2028 – jun 2029', 'jun 2029 – ago 2030']);
  // every island is drawn, with what it shows said in words
  const drawn = await cards.evaluateAll((els) => els.map((el) => { const svg = el.querySelector('svg')!; const b = svg.getBoundingClientRect(); return [svg.getAttribute('role'), (svg.getAttribute('aria-label') ?? '').length > 20, svg.querySelectorAll('path').length > 20, b.width > 150 && b.height > 100]; }));
  expect(drawn).toEqual(Array(17).fill(['img', true, true, true]));
  await expect(cards.first().locator('.wd-art')).toContainText('el faro, el muelle');
  expect(errors).toEqual([]);
});

test('on a phone the map travels sideways inside its own frame, and the page stays its width', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/v2/es/mundo/');
  // a frame you can focus and scroll, with a name that says what to do
  const frame = page.getByRole('group', { name: 'Deslizá para recorrerlo.' });
  await expect(frame).toHaveAttribute('tabindex', '0');
  await expect(page.locator('.wd-hint')).toBeVisible();
  const before = await frame.evaluate((el) => [el.scrollWidth > el.clientWidth + 200, el.scrollLeft]);
  expect(before).toEqual([true, 0]);
  // with the keyboard too: the frame takes focus and the arrows move it
  await frame.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => frame.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
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

test('in English the islands keep their order and say where they stand', async ({ page }) => {
  await page.goto('/v2/en/mundo/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The world of Work');
  await expect(page.locator('.wd-card h3')).toHaveText(['Mar del Plata', 'TACH Argentina', 'Ada ITW', 'Tsoft', 'Eclipse', 'Agentic system', 'Kinetic Studio', 'Volta', 'Velmar', 'DentalOS', 'games-market', 'Lucero', 'Trazo', 'Core', 'Cybersecurity', 'Quant', 'Aerospace']);
  await expect(page.locator('section[aria-labelledby="wd-next"] .wd-state')).toHaveText(Array(4).fill('On the roadmap'));
});
