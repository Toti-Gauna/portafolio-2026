import { expect, type Page, test } from '@playwright/test';

// Lote 4.2: the engine of the world, on the Work page (/v2/<l>/work/). The map under the header, full screen;
// zoom by buttons, keys, a pinch on a trackpad (ctrl + wheel), two fingers or a double click, always around the
// point it started on; a minimap with the window you see, that takes you where you press; a glass card that says
// where you are; the list of stops below for every other way of reading it. Nothing moves when nothing is asked.

const z = (page: Page) => page.locator('.ws').evaluate((el) => Number(getComputedStyle(el).getPropertyValue('--z')));
/** Where a point of the screen falls on the land, as a fraction of it. */
const onLand = (page: Page, x: number, y: number) => page.evaluate(([x, y]) => { const l = document.querySelector('.ws-land')!.getBoundingClientRect(); return [(x - l.left) / l.width, (y - l.top) / l.height]; }, [x, y]);
const settled = (page: Page) => expect.poll(() => page.evaluate(() => document.querySelector('.ws-land')!.getAnimations().length + (document.querySelector<HTMLElement>('.ws-land')!.style.transform ? 1 : 0))).toBe(0);

test('Work is the world: the map fills the screen under the header, its title is the h1 of the page, and the list follows', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lo que construí.');
  await expect(page.locator('.ws-kicker')).toHaveText('02 · Work');
  await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
  // from the bottom of the header to the bottom of the screen, edge to edge
  const box = await page.locator('.ws').evaluate((el) => { const r = el.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.left), Math.round(r.width) - document.documentElement.clientWidth, Math.round(r.bottom) - innerHeight]; });
  expect(box).toEqual([64, 0, 0, 0]);
  // the glass card says where you are; «Ver como lista» goes to the list, which has every stop
  await expect(page.locator('.ws-now')).toHaveText(/^01 \/ 14 · Donde empezóMar del PlataA los 17 · El comienzo$/);
  await page.getByRole('link', { name: 'Ver como lista' }).click();
  await expect(page).toHaveURL(/#lista$/);
  await expect(page.locator('#lista .wd-card h3')).toHaveCount(14);
  await expect(page.locator('#lista .v2-sec-text')).toHaveText('Casos del trabajo y propios, cada uno con su estado, y un laboratorio de demos y prototipos.');
  // and the way on, to the pages next to this one
  await expect(page.getByRole('navigation', { name: 'Otras páginas' }).getByRole('link')).toHaveText([/Inicio/, /Cómo trabajo/]);
  expect(errors).toEqual([]);
});

test('zoom with the buttons and the keys, around the middle of the map; travelling zoomed in keeps the stop in the middle', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  const zin = page.getByRole('button', { name: 'Acercar' }), zout = page.getByRole('button', { name: 'Alejar' });
  // at 1× the land fills the height of the map: nothing to zoom out to
  expect(await z(page)).toBe(1);
  await expect(zout).toBeDisabled();
  const v = (await page.locator('.ws-view').boundingBox())!;
  const mid = [v.x + v.width / 2, v.y + v.height / 2] as const;
  const before = await onLand(page, ...mid);
  await zin.click();
  await settled(page);
  expect(await z(page)).toBe(1.4);
  // the point in the middle of the map is still in the middle
  const after = await onLand(page, ...mid);
  expect(Math.abs(after[0] - before[0])).toBeLessThan(0.002);
  expect(Math.abs(after[1] - before[1])).toBeLessThan(0.01);
  await expect(zout).toBeEnabled();
  // the keys + and −, from the map
  await page.locator('.ws-view').focus();
  await page.keyboard.press('+');
  await settled(page);
  expect(await z(page)).toBe(1.96);
  await page.keyboard.press('+');
  await settled(page);
  expect(await z(page)).toBe(2.4);
  await expect(zin).toBeDisabled();
  // the names keep their size: they are text over the land, not part of the drawing
  expect(await page.locator('.ws-names li[data-id="mdp"] b').evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeLessThanOrEqual(22);
  // zoomed in, the next stop comes to the middle, both ways
  await page.getByRole('button', { name: 'Parada siguiente' }).click();
  await expect(page.locator('.ws-now b')).toHaveText('TACH Argentina');
  await expect.poll(() => page.evaluate(() => {
    const vb = document.querySelector('.ws-view')!.getBoundingClientRect();
    const t = document.querySelector('.ws-land .wa-isle[data-id="tach"]')!.getBoundingClientRect();
    return [Math.abs(t.left + t.width / 2 - (vb.left + vb.width / 2)) < 160, Math.abs(t.top + t.height / 2 - (vb.top + vb.height / 2)) < 160];
  })).toEqual([true, true]);
  await page.keyboard.press('-');
  await settled(page);
  expect(await z(page)).toBe(1.71);
  // nothing of it moved the page
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test('a pinch on a trackpad (ctrl + wheel) and a double click zoom around the pointer, which stays on the same point of the land', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  // the life of the map is not what is measured here
  await page.getByRole('button', { name: 'Pausar el movimiento del mapa' }).click();
  const v = (await page.locator('.ws-view').boundingBox())!;
  const px = v.x + 760, py = v.y + 420;
  const before = await onLand(page, px, py);
  await page.mouse.move(px, py);
  await page.keyboard.down('Control');
  for (let i = 0; i < 6; i++) await page.mouse.wheel(0, -10);
  // while the fingers move only a transform changes: the land keeps its size
  expect(await z(page)).toBe(1);
  expect(await page.locator('.ws-land').evaluate((el) => (el as HTMLElement).style.transform)).toMatch(/^scale\(1\.\d+\)$/);
  await page.keyboard.up('Control');
  // when they rest the land takes the new size, and the point under the pointer has not moved
  await settled(page);
  expect(await z(page)).toBeGreaterThan(1.5);
  const after = await onLand(page, px, py);
  expect(Math.abs(after[0] - before[0])).toBeLessThan(0.002);
  expect(Math.abs(after[1] - before[1])).toBeLessThan(0.01);
  // the browser's own zoom was not used: the page is still at its size
  expect(await page.evaluate(() => [scrollY, document.documentElement.scrollWidth - innerWidth, visualViewport!.scale])).toEqual([0, 0, 1]);
  // a double click on the land zooms in around it too; at the closest it goes back to 1×
  const z1 = await z(page);
  await page.mouse.dblclick(px, py);
  await settled(page);
  expect(await z(page)).toBeGreaterThan(z1);
  const again = await onLand(page, px, py);
  expect(Math.abs(again[0] - before[0])).toBeLessThan(0.002);
  for (let i = 0; i < 3 && (await z(page)) < 2.39; i++) { await page.mouse.dblclick(px, py); await settled(page); }
  await page.mouse.dblclick(px, py);
  await settled(page);
  expect(await z(page)).toBe(1);
});

test('two fingers on a screen zoom the land, not the page', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 2, hasTouch: true, storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem('ig:v2:gate', 'off'));
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  const cdp = await context.newCDPSession(page);
  const v = (await page.locator('.ws-view').boundingBox())!;
  const cx = v.x + 520, cy = v.y + 360;
  const before = await onLand(page, cx, cy);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx - 40, y: cy, id: 1 }, { x: cx + 40, y: cy, id: 2 }] });
  for (let s = 1; s <= 12; s++) { const d = 80 + s * 8; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - d / 2, y: cy, id: 1 }, { x: cx + d / 2, y: cy, id: 2 }] }); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settled(page);
  // 176 / 80 = 2.2×, and the point between the fingers stays on the same point of the land
  expect(await z(page)).toBeCloseTo(2.2, 1);
  const after = await onLand(page, cx, cy);
  expect(Math.abs(after[0] - before[0])).toBeLessThan(0.002);
  expect(Math.abs(after[1] - before[1])).toBeLessThan(0.01);
  expect(await page.evaluate(() => [scrollY, visualViewport!.scale])).toEqual([0, 1]);
  // one finger still travels
  const left = await page.locator('.ws-view').evaluate((el) => el.scrollLeft);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: v.x + 800, y: v.y + 400 }] });
  for (let s = 1; s <= 10; s++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: v.x + 800 - s * 30, y: v.y + 400 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.locator('.ws-view').evaluate((el) => el.scrollLeft)).toBeGreaterThan(left + 150);
  await context.close();
});

test('the minimap shows the whole land and the window you see, and takes you where you press', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  const mini = page.locator('.ws-mini');
  // the land in a few shapes: a band per stop (two for Núcleo), the path and a dot per stop; decoration for readers
  expect(await mini.evaluate((el) => [el.getAttribute('aria-hidden'), el.querySelectorAll('svg > path:not(.wm-path)').length, el.querySelectorAll('.wm-path').length, el.querySelectorAll('.wm-stop').length])).toEqual(['true', 15, 2, 14]);
  // the window is as wide as the map is of the land
  const win = async () => mini.evaluate((m) => { const a = m.getBoundingClientRect(), w = m.querySelector('.ws-win')!.getBoundingClientRect(); return [(w.left - a.left) / a.width, w.width / a.width]; });
  const ratio = await page.evaluate(() => { const v = document.querySelector('.ws-view')!, l = document.querySelector('.ws-land')!; return v.clientWidth / l.getBoundingClientRect().width; });
  expect(Math.abs((await win())[1] - ratio)).toBeLessThan(0.01);
  // press at three quarters: the map goes there at once, and says where it is
  const b = (await mini.boundingBox())!;
  await page.mouse.click(b.x + b.width * 0.75, b.y + b.height / 2);
  await expect.poll(async () => { const [l, w] = await win(); return Math.abs(l + w / 2 - 0.75) < 0.02; }).toBe(true);
  await expect(page.locator('.ws-now b')).not.toHaveText('Mar del Plata');
  // drag on it to travel
  await page.mouse.move(b.x + b.width * 0.3, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.5, b.y + b.height / 2, { steps: 4 });
  await page.mouse.up();
  await expect.poll(async () => { const [l, w] = await win(); return Math.abs(l + w / 2 - 0.5) < 0.02; }).toBe(true);
  // zoomed in, the window is smaller, and shows how far down you are too
  await page.getByRole('button', { name: 'Acercar' }).click();
  await settled(page);
  expect((await win())[1]).toBeLessThan(ratio * 0.8);
  expect(await mini.evaluate((m) => m.querySelector('.ws-win')!.getBoundingClientRect().height / m.getBoundingClientRect().height)).toBeLessThan(0.8);
});

test('the card is glass with a mouse and solid on a touch screen, and every control of the map is reachable and big enough', async ({ page, browser }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  expect(await page.locator('.ws-hud').evaluate((el) => getComputedStyle(el).backdropFilter)).toMatch(/blur/);
  // with the keyboard: the map, its two arrows, the two zoom buttons and the list, all with a visible ring and ≥ 44 px
  const sizes = await page.locator('.ws-nav:not(:disabled), .ws-zbtn, .ws-list, .ws-more').evaluateAll((els) => els.map((el) => { const b = el.getBoundingClientRect(); return Math.min(b.width, b.height); }));
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(44);
  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, storageState: { cookies: [], origins: [] } });
  const phone = await touch.newPage();
  await phone.addInitScript(() => localStorage.setItem('ig:v2:gate', 'off'));
  await phone.goto('/v2/es/work/');
  await expect(phone.locator('.ws[data-ready]')).toBeVisible();
  expect(await phone.locator('.ws-hud').evaluate((el) => getComputedStyle(el).backdropFilter)).toBe('none');
  // on a phone the card is a strip that leaves the stop in view, and its zoom buttons do not cover it
  const fit = await phone.evaluate(() => {
    const h = document.querySelector('.ws-hud')!.getBoundingClientRect(), m = document.querySelector('.ws')!.getBoundingClientRect(), zb = document.querySelector('.ws-zoom')!.getBoundingClientRect();
    return [h.height < m.height * 0.3, zb.left >= h.right, h.left >= 0 && zb.right <= innerWidth];
  });
  expect(fit).toEqual([true, true, true]);
  expect(await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  await touch.close();
});

test('with reduced motion a zoom arrives at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  await page.getByRole('button', { name: 'Acercar' }).click();
  // no animation of the land: by the next task it already has its size
  expect(await z(page)).toBe(1.4);
  expect(await page.locator('.ws-land').evaluate((el) => el.getAnimations().length)).toBe(0);
});

test('nothing asks for frames on its own: with its life paused, a map that has travelled and zoomed draws nothing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  // the life of the map (lote 4.3) is the one thing that moves by itself, and the visitor can stop it
  await page.getByRole('button', { name: 'Pausar el movimiento del mapa' }).click();
  await page.getByRole('button', { name: 'Parada siguiente' }).click();
  await page.getByRole('button', { name: 'Acercar' }).click();
  await settled(page);
  await page.mouse.move(5, 300);
  await page.waitForTimeout(1200);
  const asked = await page.evaluate(() => new Promise<number>((done) => {
    let n = 0;
    const raf = window.requestAnimationFrame;
    window.requestAnimationFrame = (cb) => { n++; return raf(cb); };
    setTimeout(() => { window.requestAnimationFrame = raf; done(n + document.getAnimations().filter((a) => a.playState === 'running').length); }, 1500);
  }));
  expect(asked).toBe(0);
});

test('in English', async ({ page }) => {
  await page.goto('/v2/en/work/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("What I've built.");
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeEnabled();
  await expect(page.getByRole('link', { name: 'See as a list' })).toHaveAttribute('href', '#lista');
  await expect(page.locator('.ws-now')).toHaveText(/^01 \/ 14 · Where it beganMar del Plata/);
});
