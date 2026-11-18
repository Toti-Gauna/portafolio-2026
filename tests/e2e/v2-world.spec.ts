import { expect, type Page, test } from '@playwright/test';

// Lote 4.1: the world of Work (/v2/<l>/mundo/). The map fills the screen: one land in diagonal bands, a biome
// per stop, travelled sideways (drag, the two buttons inside the map, the arrow keys). «Más información» under
// every stop opens its postcard and its card. Below, the same stops as a list. Nothing is written inside the art.
const NAMES = ['Mar del Plata', 'TACH Argentina', 'Ada ITW', 'Tsoft', 'Eclipse', 'Sistema agéntico', 'Kinetic Studio', 'Volta', 'Velmar', 'DentalOS', 'games-market', 'Lucero', 'Trazo', 'Núcleo'];

test('the map fills the screen, with its fourteen stops named on the land and listed below', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/mundo/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('El mundo de Work');
  await expect(page.getByRole('navigation', { name: 'Sistema' }).getByRole('link', { name: 'Mundo' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  // full screen: from under the tabs to the bottom of the screen, from edge to edge, the land with no gap around it
  const fill = await page.locator('.ws').evaluate((el) => { const r = el.getBoundingClientRect(), v = el.querySelector('.ws-view')!, l = el.querySelector('.ws-land')!.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.width) - document.documentElement.clientWidth, Math.round(r.bottom) - innerHeight, Math.round(l.height) - v.clientHeight, l.width > r.width * 5]; });
  expect(fill).toEqual([0, 0, 0, 0, true]);
  // the land: one drawing with a description, a band per stop (two for Núcleo), a path travelled and a path planned
  const land = page.getByRole('img', { name: /Terreno isométrico en franjas diagonales/ });
  expect(await land.evaluate((el) => [el.querySelectorAll('.wa-band').length, el.querySelectorAll('.wa-isle').length, el.querySelectorAll('text').length, el.querySelectorAll('.wa-node').length, el.querySelectorAll('.wa-path--plan').length])).toEqual([15, 15, 0, 14, 1]);
  // the names of the stops are written over the land, in the order of the journey, each with its button
  const stops = page.getByRole('list', { name: 'Paradas del recorrido' });
  await expect(stops.locator('li b')).toHaveText(NAMES);
  await expect(stops.getByRole('button')).toHaveCount(14);
  await expect(stops.getByRole('button', { name: 'Más información · Tsoft' })).toBeAttached();
  // below the map: the same stops under their four headings; of what comes next, only Núcleo
  await expect(page.locator('.wd-legend li')).toHaveText(['Sendero recorrido', 'Sendero planeado', 'Construido', 'En obra']);
  await expect(page.locator('main h2:not(dialog h2)')).toHaveText(['Donde empezó', 'El trabajo', 'Camino propio', 'Proyectos futuros']);
  const cards = page.locator('.wd-card');
  await expect(cards.locator('h3')).toHaveText(NAMES);
  await expect(cards.locator('.wd-state').nth(3)).toHaveText('Trabajo profesional · corporativa');
  await expect(page.locator('section[aria-labelledby="wd-next"] .wd-card')).toHaveCount(1);
  await expect(page.locator('section[aria-labelledby="wd-next"] .wd-state')).toHaveText('Proyecto futuro');
  await expect(page.locator('section[aria-labelledby="wd-next"] .wd-when')).toHaveText('nov 2026 – feb 2028');
  await expect(page.getByText(/Ciberseguridad|Quant|Aeroespacial/)).toHaveCount(0);
  // every stop is shown on its own too (by reference to the land: the drawing travels once), with what it shows said in words
  await cards.last().scrollIntoViewIfNeeded();
  const drawn = await cards.evaluateAll((els) => els.map((el) => { const svg = el.querySelector('svg')!; const b = svg.getBoundingClientRect(); return [svg.getAttribute('role'), (svg.getAttribute('aria-label') ?? '').length > 20, svg.querySelectorAll('use').length >= 2, svg.querySelectorAll('path').length, b.width > 150 && b.height > 100]; }));
  expect(drawn).toEqual(Array(14).fill(['img', true, true, 0, true]));
  await expect(cards.first().locator('.wd-art')).toContainText('el faro, el muelle');
  expect(await page.evaluate(() => { const ids = [...document.querySelectorAll('[id]')].map((el) => el.id); return ids.length - new Set(ids).size; })).toBe(0);
  expect(errors).toEqual([]);
});

/** How far the middle of what stands on a stop is from the middle of the map. */
const offCentre = (page: Page, id: string) => page.evaluate((id) => {
  const v = document.querySelector('.ws-view')!.getBoundingClientRect();
  const boxes = [...document.querySelectorAll(`.ws-land .wa-isle[data-id="${id}"]`)].map((el) => el.getBoundingClientRect());
  const l = Math.min(...boxes.map((b) => b.left)), r = Math.max(...boxes.map((b) => b.right));
  return Math.abs((l + r) / 2 - (v.left + v.width / 2));
}, id);

/** The glide to a stop has ended: it sits in the middle and the map is still (a click on a button of the land must not race it). */
const arrived = async (page: Page, id: string) => {
  await expect.poll(() => offCentre(page, id)).toBeLessThan(140);
  await expect.poll(() => page.evaluate(() => new Promise<boolean>((done) => { const v = document.querySelector('.ws-view')!, x = v.scrollLeft; setTimeout(() => done(v.scrollLeft === x), 120); }))).toBe(true);
};

test('travelling it: the two buttons inside the map, the arrow keys and a drag with the mouse, one stop at a time', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/mundo/');
  const view = page.locator('.ws-view'), now = page.locator('.ws-now');
  const prev = page.getByRole('button', { name: 'Parada anterior' }), next = page.getByRole('button', { name: 'Parada siguiente' });
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  // it starts on the first stop, in the middle of the map, with nowhere to go back to
  await expect(now).toHaveText('01 / 14Mar del Plata');
  await expect(prev).toBeDisabled();
  expect(await offCentre(page, 'mdp')).toBeLessThan(140);
  // the buttons are inside the map, at its two sides
  const inside = await page.evaluate(() => { const m = document.querySelector('.ws')!.getBoundingClientRect(); return [...document.querySelectorAll('.ws-nav')].map((b) => { const r = b.getBoundingClientRect(); return r.top > m.top && r.bottom < m.bottom && r.left >= m.left && r.right <= m.right && Math.min(r.width, r.height) >= 44; }); });
  expect(inside).toEqual([true, true]);
  // a button goes one stop on and brings it to the middle; the page itself stays where it was
  await next.click();
  await expect(now).toHaveText('02 / 14TACH Argentina');
  await expect.poll(() => offCentre(page, 'tach')).toBeLessThan(140);
  await expect(prev).toBeEnabled();
  await expect(page.locator('.ws-names li[data-on] b')).toHaveText('TACH Argentina');
  // the arrow keys do the same, from the map or from its buttons; End and Home go to the ends
  await page.keyboard.press('ArrowRight');
  await expect(now).toContainText('Ada ITW');
  await view.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(now).toContainText('TACH Argentina');
  await page.keyboard.press('End');
  await expect(now).toHaveText('14 / 14Núcleo');
  await expect(next).toBeDisabled();
  // Núcleo takes two bands and is one stop, between its two
  await expect.poll(() => offCentre(page, 'nucleo')).toBeLessThan(140);
  await page.keyboard.press('Home');
  await expect(now).toContainText('01 / 14');
  await expect.poll(() => view.evaluate((el) => el.scrollLeft)).toBe(0);
  // with the mouse you drag the land itself — a press that stays put is not a drag
  const box = (await view.boundingBox())!;
  await page.mouse.move(box.x + 900, box.y + 200);
  await page.mouse.down();
  await page.mouse.move(box.x + 897, box.y + 200);
  expect(await view.evaluate((el) => 'drag' in (el as HTMLElement).dataset)).toBe(false);
  await page.mouse.move(box.x + 300, box.y + 230, { steps: 5 });
  expect(await view.evaluate((el) => 'drag' in (el as HTMLElement).dataset)).toBe(true);
  await page.mouse.up();
  expect(await view.evaluate((el) => [Math.round(el.scrollLeft), 'drag' in (el as HTMLElement).dataset])).toEqual([600, false]);
  await expect(now).toContainText('02 / 14');
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test('«Más información» opens the postcard of the stop and, below it, the card with what I did there', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/mundo/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  await expect(page.locator('dialog.wi')).toHaveCount(14);
  // TACH: the stamp of the kit, and the card under it
  await page.getByRole('button', { name: 'Parada siguiente' }).click();
  await expect(page.locator('.ws-now')).toContainText('TACH Argentina');
  await arrived(page, 'tach');
  const more = page.getByRole('button', { name: 'Más información · TACH Argentina' });
  await more.click();
  const tach = page.getByRole('dialog', { name: 'TACH Argentina' });
  await expect(tach).toBeVisible();
  await expect(tach.locator('.kit-stamp')).toHaveCount(1);
  await expect(tach.locator('.kit-stamp b')).toHaveText('2021');
  await expect(tach.getByRole('img', { name: /Estampilla: una web de backoffice/ })).toBeVisible();
  await expect(tach.locator('.wi-kicker')).toHaveText('El trabajo · 2021 – 2022');
  await expect(tach.locator('.wd-state')).toHaveText('Trabajo profesional · startup');
  await expect(tach.locator('.wi-facts dt')).toHaveText(['Período', 'Producto', 'Qué hice', 'Modalidad']);
  await expect(tach.locator('.wi-facts dd').nth(2)).toHaveText('El backoffice, la landing y la app, en web y móvil');
  // the postcard is on top and the card below it
  const order = await tach.evaluate((d) => { const s = d.querySelector('.wi-stamps')!.getBoundingClientRect(), c = d.querySelector('.wi-card')!.getBoundingClientRect(); return s.bottom <= c.top + 1; });
  expect(order).toBe(true);
  // it is a modal: the focus is on «Cerrar», the map behind does not take the keys, Escape closes it and the focus returns
  await expect(tach.getByRole('button', { name: 'Cerrar' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.ws-now')).toContainText('TACH Argentina');
  await page.keyboard.press('Escape');
  await expect(tach).toBeHidden();
  await expect(more).toBeFocused();
  // «Cerrar» and a click outside the card close it too
  await more.click();
  await tach.getByRole('button', { name: 'Cerrar' }).click();
  await expect(tach).toBeHidden();
  await more.click();
  await expect(tach).toBeVisible();
  await page.mouse.click(30, 450);
  await expect(tach).toBeHidden();
  // Tsoft: its three stamps, the position, and what I did inside
  await page.getByRole('button', { name: 'Parada siguiente' }).click();
  await expect(page.locator('.ws-now')).toContainText('Ada ITW');
  await page.getByRole('button', { name: 'Parada siguiente' }).click();
  await expect(page.locator('.ws-now')).toContainText('Tsoft');
  await arrived(page, 'tsoft');
  await page.getByRole('button', { name: 'Más información · Tsoft' }).click();
  const tsoft = page.getByRole('dialog', { name: 'Tsoft' });
  await expect(tsoft.locator('.kit-stamp span')).toHaveText(['Tsoft · Tuenti', 'CompliA · Tsoft', 'Supernova Eventos']);
  await expect(tsoft.locator('.wi-facts').first().locator('dd').nth(1)).toHaveText('Entré como Jr Frontend Developer; hoy soy Sr AI Fullstack Developer');
  await expect(tsoft.locator('.wi-inside h4')).toHaveText(['Tuenti', 'CompliA', 'Supernova Eventos']);
  await expect(tsoft.locator('.wi-inside .wd-state')).toHaveText(['Trabajo profesional', 'En producción interna', 'Prototipo']);
  await page.keyboard.press('Escape');
  // a stop with no stamp in the kit: printed from its own drawing in the world, on the colour of its ground
  await page.keyboard.press('End');
  await expect(page.locator('.ws-now')).toContainText('Núcleo');
  await arrived(page, 'nucleo');
  await page.getByRole('button', { name: 'Más información · Núcleo' }).click();
  const nucleo = page.getByRole('dialog', { name: 'Núcleo' });
  await expect(nucleo.locator('.kit-stamp b')).toHaveText('2026');
  await expect(nucleo.locator('.kit-stamp span')).toHaveText('Núcleo');
  await expect(nucleo.locator('.wi-kicker')).toHaveText('Proyectos futuros · nov 2026 – feb 2028');
  const printed = await nucleo.locator('.kit-stamp svg').evaluate((svg) => { const u = [...svg.querySelectorAll('use')]; return [u.length, u.every((x) => !!document.querySelector(x.getAttribute('href')!)), svg.querySelectorAll('text').length]; });
  expect(printed).toEqual([2, true, 0]);
  // nothing in a card is too small to read, and its text has contrast
  const small = await nucleo.evaluate((d) => [...d.querySelectorAll('*')].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()) && parseFloat(getComputedStyle(el).fontSize) < 12).map((el) => el.className.toString() || el.tagName));
  expect(small).toEqual([]);
});

test('with reduced motion a stop arrives at once and the card opens without moving', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/v2/es/mundo/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  await page.getByRole('button', { name: 'Parada siguiente' }).click();
  // no glide: by the next task the map is already there
  expect(await offCentre(page, 'tach')).toBeLessThan(140);
  await page.getByRole('button', { name: 'Más información · TACH Argentina' }).click();
  const tach = page.getByRole('dialog', { name: 'TACH Argentina' });
  await expect(tach).toBeVisible();
  expect(await tach.evaluate((d) => d.getAnimations({ subtree: true }).length)).toBe(0);
});

test('on a phone the map still fills what is left of the screen, the stop in the middle has its name and its button in view, and the page stays its width', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/v2/es/mundo/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  // a frame you can focus and scroll, with a name that says what to do
  const frame = page.getByRole('group', { name: 'Arrastrá el terreno o usá las flechas para recorrerlo.' });
  await expect(frame).toHaveAttribute('tabindex', '0');
  const before = await frame.evaluate((el) => [el.scrollWidth > el.clientWidth * 10, el.scrollLeft, Math.round(document.querySelector('.ws')!.getBoundingClientRect().bottom) - innerHeight]);
  expect(before).toEqual([true, 0, 0]);
  // with the keyboard too: the frame takes focus and the arrows move it
  await frame.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.ws-now')).toContainText('TACH Argentina');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.ws-now')).toContainText('Ada ITW');
  await expect.poll(() => frame.evaluate((el) => el.scrollLeft)).toBeGreaterThan(600);
  // the stop in the middle: its name and its button, whole, inside the screen
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('.ws-names li[data-id="ada"] b, .ws-names li[data-id="ada"] button')].every((el) => { const b = el.getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth && b.bottom <= innerHeight; }))).toBe(true);
  // buttons a thumb can hit
  const sizes = await page.locator('.ws-nav, .ws-more').evaluateAll((els) => els.map((el) => { const b = el.getBoundingClientRect(); return Math.min(b.width, b.height); }));
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(44);
  // the card of a stop fits the phone: it scrolls inside itself and nothing spills sideways
  await page.getByRole('button', { name: 'Más información · Ada ITW' }).click();
  const ada = page.getByRole('dialog', { name: 'Ada ITW' });
  await expect(ada).toBeVisible();
  expect(await ada.evaluate((d) => [d.scrollWidth <= d.clientWidth, [...d.querySelectorAll('.kit-stamp, .wi-card')].every((el) => { const b = el.getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth; })])).toEqual([true, true]);
  await ada.getByRole('button', { name: 'Cerrar' }).click();
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 740) await page.evaluate((y) => scrollTo(0, y), y);
  const r = await page.evaluate(() => {
    const small: string[] = [];
    for (const el of document.querySelectorAll('main *')) {
      if (el.closest('dialog')) continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (own && parseFloat(getComputedStyle(el).fontSize) < 12) small.push(el.className.toString() || el.tagName);
    }
    return { over: document.documentElement.scrollWidth - innerWidth, small };
  });
  expect(r.over).toBeLessThanOrEqual(0);
  expect(r.small).toEqual([]);
});

test('without JS the land is all there, its frame still scrolls, and the stops are listed below with what I did', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto('/v2/es/mundo/');
  await expect(page.getByRole('img', { name: /Terreno isométrico en franjas diagonales/ })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Paradas del recorrido' }).locator('li')).toHaveCount(14);
  // the two buttons need the script: they are not offered
  await expect(page.locator('.ws-nav').first()).toBeHidden();
  const frame = page.locator('.ws-view');
  await expect(frame).toHaveCSS('overflow-x', 'auto');
  await expect(frame).toHaveAttribute('tabindex', '0');
  await expect(page.locator('.wd-card')).toHaveCount(14);
  // the cards of the stops are in the HTML (closed), with the facts
  expect(await page.locator('dialog.wi').evaluateAll((ds) => ds.map((d) => d.querySelectorAll('.wi-facts dd').length >= 3))).toEqual(Array(14).fill(true));
  await context.close();
});

test('in English the stops keep their order and say where they stand', async ({ page }) => {
  await page.goto('/v2/en/mundo/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The world of Work');
  await expect(page.locator('.wd-card h3')).toHaveText(['Mar del Plata', 'TACH Argentina', 'Ada ITW', 'Tsoft', 'Eclipse', 'Agentic system', 'Kinetic Studio', 'Volta', 'Velmar', 'DentalOS', 'games-market', 'Lucero', 'Trazo', 'Core']);
  await expect(page.locator('section[aria-labelledby="wd-next"] h2')).toHaveText('Future projects');
  await expect(page.locator('section[aria-labelledby="wd-next"] .wd-state')).toHaveText('Future project');
  await expect(page.getByRole('button', { name: 'Next stop' })).toBeEnabled();
  await expect(page.getByRole('group', { name: 'Drag the land or use the arrows to travel it.' })).toBeVisible();
  await page.getByRole('button', { name: 'More information · Mar del Plata' }).click();
  const mdp = page.getByRole('dialog', { name: 'Mar del Plata' });
  await expect(mdp.locator('.kit-stamp b')).toHaveText('At 17');
  await expect(mdp.locator('.wi-facts dt')).toHaveText(['Where', 'What I did', 'How I learn']);
});
