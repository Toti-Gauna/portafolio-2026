import { expect, type Page, test } from '@playwright/test';

// Lote 4.3: the life of the world of Work, in the isometric view. Day and night, clouds, people walking the path,
// a movement of its own in every place — only in the places on screen, only while the map is on screen, never with
// reduced motion, and with a button that stops it all — crates to pick up and throw, and small sounds.

// what moves by itself: CSS animations and scripted ones (a transition is the answer to a pointer, and ends)
const running = (page: Page, inside = 'body') => page.evaluate((sel) => document.querySelector(sel)!.getAnimations({ subtree: true }).filter((a) => a.playState === 'running' && !(a instanceof CSSTransition)).length, inside);
const live = (page: Page) => page.evaluate(() => [...document.querySelectorAll<SVGElement>('.wa-isle[data-live]')].map((e) => e.dataset.id).join(' '));
const arrived = (page: Page) => expect.poll(() => page.evaluate(() => new Promise<boolean>((done) => { const v = document.querySelector('.ws-view')!, x = v.scrollLeft; setTimeout(() => done(v.scrollLeft === x), 150); }))).toBe(true);

test('every place has a movement of its own, and only the places on screen move', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready][data-seen][data-life="on"]')).toBeVisible();
  // at the start: the coast and the first city are in view, and they are the ones alive
  expect(await live(page)).toBe('mdp tach');
  // the beam of the lighthouse sweeps: a true turn in the plane of the ground (a matrix lays it down, one rotate moves it)
  const beam = page.locator('.wa-isle[data-id="mdp"] .wl-sweep');
  expect(await beam.evaluate((el) => [getComputedStyle(el).animationName, (el.parentElement as unknown as SVGGElement).getAttribute('transform')!.startsWith('matrix(0.8944 0.4472 -0.8944 0.4472')])).toEqual(['wl-turn', true]);
  // far away nothing runs: the wheel of prizes of Tsoft, the windmill of Núcleo
  expect(await page.locator('.wa-isle[data-id="tsoft"] .wl-spin').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  expect(await page.locator('.wa-isle[data-id="nucleo"] .wl-rot').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  // travel to Tsoft: it comes alive, and the coast goes still
  for (const name of ['TACH Argentina', 'Ada ITW', 'Tsoft']) { await page.getByRole('button', { name: 'Parada siguiente' }).click(); await expect(page.locator('.ws-now b')).toHaveText(name); }
  await arrived(page);
  expect(await live(page)).toContain('tsoft');
  expect(await live(page)).not.toContain('mdp');
  expect(await page.locator('.wa-isle[data-id="tsoft"] .wl-spin').evaluate((el) => getComputedStyle(el).animationName)).toBe('wl-turn');
  expect(await beam.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  // only transform, opacity and stroke-dashoffset are animated
  const props = await page.evaluate(() => [...new Set(document.querySelector('.ws')!.getAnimations({ subtree: true }).flatMap((a) => (a.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k))))].filter((k) => !['offset', 'easing', 'composite', 'computedOffset'].includes(k)).sort());
  for (const p of props) expect(['opacity', 'rotate', 'scale', 'strokeDashoffset', 'transform', 'translate']).toContain(p);
  // the visitor can stop it all, and start it again (WCAG 2.2.2)
  const pause = page.getByRole('button', { name: 'Pausar el movimiento del mapa' });
  expect(await running(page, '.ws')).toBeGreaterThan(10);
  await pause.click();
  await expect(page.getByRole('button', { name: 'Reanudar el movimiento del mapa' })).toHaveAttribute('aria-pressed', 'true');
  expect(await running(page, '.ws')).toBe(0);
  await page.getByRole('button', { name: 'Reanudar el movimiento del mapa' }).click();
  expect(await running(page, '.ws')).toBeGreaterThan(10);
  // and when the map leaves the screen, it stops by itself
  await page.locator('#lista .wd-card').last().scrollIntoViewIfNeeded();
  await expect(page.locator('.ws')).not.toHaveAttribute('data-seen', '');
  expect(await running(page, '.ws')).toBe(0);
  expect(errors).toEqual([]);
});

test('people walk the path and clouds cross the frame: decoration, never in the way', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready][data-seen]')).toBeVisible();
  // a walker or two by every stop; the ones in view go to a point and come back
  const walkers = page.locator('.ws-walkers .ww');
  expect(await walkers.count()).toBeGreaterThanOrEqual(26);
  await expect(page.locator('.ws-walkers')).toHaveAttribute('aria-hidden', 'true');
  const one = page.locator('.ww[data-id="mdp"]').first();
  expect(await one.evaluate((el) => getComputedStyle(el).animationName)).toBe('ww-go');
  const a = (await one.boundingBox())!;
  await page.waitForTimeout(900);
  const b = (await one.boundingBox())!;
  expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeGreaterThan(3);
  // they are big enough to be seen as people and they never take a click meant for the map
  expect(a.height).toBeGreaterThan(24);
  expect(await page.locator('.ws-walkers').evaluate((el) => getComputedStyle(el).pointerEvents)).toBe('none');
  // five clouds, each with its shadow, over the map and under its controls
  await expect(page.locator('.ws-sky .wk')).toHaveCount(5);
  expect(await page.locator('.ws-sky').evaluate((el) => [el.getAttribute('aria-hidden'), getComputedStyle(el).pointerEvents])).toEqual(['true', 'none']);
  expect(await page.locator('.ws-sky .wk').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('wk-go');
  // nothing of it widens the page
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

test('day and night: the new hour spreads from its button, the land changes colour and every name stays readable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/');
  const map = page.locator('.ws');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  await expect(map).toHaveAttribute('data-time', 'day');
  const ground = () => page.locator('.wa-band[data-id="tach"] .wa-land').evaluate((el) => getComputedStyle(el).fill);
  const lum = (rgb: string) => { const [r, g, b] = rgb.match(/[\d.]+/g)!.map(Number).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const day = await ground();
  await page.getByRole('button', { name: 'Pasar a la noche' }).click();
  await expect(map).toHaveAttribute('data-time', 'night');
  await expect(page.getByRole('button', { name: 'Pasar al día' })).toBeVisible();
  // the wave clears and leaves nothing over the map
  await expect.poll(() => page.locator('.ws-veil').evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
  const night = await ground();
  expect(lum(night)).toBeLessThan(lum(day) * 0.3);
  // what is lit keeps its light: the windows are warm, the pool of light of the place shows
  expect(await page.locator('.wa-isle[data-id="tach"] .wa-lit').first().evaluate((el) => getComputedStyle(el).fill)).toBe('rgb(255, 233, 168)');
  expect(await page.locator('.wa-band[data-id="tach"] .wa-glow').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  // every name over the land, and its button, measured on the real colours of the night
  const names = await page.locator('.ws-names li').evaluateAll((els) => els.map((li) => {
    const id = (li as HTMLElement).dataset.id!, btn = li.querySelector('button')!;
    const land = id === 'mdp' ? document.querySelector('.wa-band[data-id="mdp"] .wa-seaf')! : document.querySelector(`.wa-band[data-id="${id}"] .wa-land`)!;
    return { id, ink: getComputedStyle(li).color, land: getComputedStyle(land).fill, btnBg: getComputedStyle(btn).backgroundColor, btnInk: getComputedStyle(btn).color };
  }));
  expect(names).toHaveLength(14);
  for (const n of names) { expect(ratio(n.ink, n.land), `${n.id} name`).toBeGreaterThanOrEqual(4.5); expect(ratio(n.btnInk, n.btnBg), `${n.id} button`).toBeGreaterThanOrEqual(4.5); }
  // the choice is remembered
  expect(await page.evaluate(() => localStorage.getItem('ig:v2:time'))).toBe('night');
  await page.reload();
  await expect(page.locator('.ws[data-ready]')).toHaveAttribute('data-time', 'night');
  await page.getByRole('button', { name: 'Pasar al día' }).click();
  await expect(page.locator('.ws')).toHaveAttribute('data-time', 'day');
  expect(await ground()).toBe(day);
});

test('with no choice made, the map takes the hour of the visitor: night from 19 to 7', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem('ig:v2:gate', 'off'));
  await page.clock.setFixedTime(new Date(2026, 10, 18, 22, 30));
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready]')).toHaveAttribute('data-time', 'night');
  await page.clock.setFixedTime(new Date(2026, 10, 18, 11, 0));
  await page.reload();
  await expect(page.locator('.ws[data-ready]')).toHaveAttribute('data-time', 'day');
  await context.close();
});

test('a crate can be picked up and thrown: it flies, tumbles, lands and stays; the map does not move under the hand', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  await expect(page.locator('.ws-crates .wc')).toHaveCount(16);
  const crate = page.locator('.wc[data-id="mdp"]');
  const where = () => crate.evaluate((el) => [Number(el.style.getPropertyValue('--x')), Number(el.style.getPropertyValue('--y'))]);
  const face = crate.locator('path').first();
  const start = await where(), box = (await face.boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  // three faces on the ground; in the hand it rises, and follows it
  expect(await crate.locator('path').evaluateAll((ps) => ps.filter((p) => p.getAttribute('d')).length)).toBe(3);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await expect(crate).toHaveAttribute('data-held', '');
  for (let i = 1; i <= 8; i++) await page.mouse.move(x + i * 24, y - i * 12);
  const held = (await face.boundingBox())!;
  expect(held.y).toBeLessThan(box.y - 60);
  await page.mouse.up();
  // thrown: it travels on, turning (its faces are redrawn), and comes to rest somewhere else
  const mid = await crate.locator('path').first().getAttribute('d');
  await expect.poll(() => crate.locator('path').first().getAttribute('d')).not.toBe(mid);
  await expect.poll(async () => { const a = await where(); await page.waitForTimeout(250); const b = await where(); return a[0] === b[0] && a[1] === b[1]; }, { timeout: 15000 }).toBe(true);
  const end = await where();
  expect(Math.hypot(end[0] - start[0], end[1] - start[1])).toBeGreaterThan(60);
  // inside the land, square on the ground again, and nothing is still asking for frames
  expect(end[0]).toBeGreaterThan(20); expect(end[1]).toBeGreaterThan(60); expect(end[1]).toBeLessThan(515);
  expect(await crate.locator('path').evaluateAll((ps) => ps.filter((p) => p.getAttribute('d')).length)).toBe(3);
  await page.getByRole('button', { name: 'Pausar el movimiento del mapa' }).click();
  await page.mouse.move(5, 300);
  await page.waitForTimeout(1200);
  expect(await page.evaluate(() => new Promise<number>((done) => { let n = 0; const raf = window.requestAnimationFrame; window.requestAnimationFrame = (cb) => { n++; return raf(cb); }; setTimeout(() => { window.requestAnimationFrame = raf; done(n); }, 800); }))).toBe(0);
  // the map stayed where it was, and so did the page
  expect(await page.evaluate(() => [document.querySelector('.ws-view')!.scrollLeft, scrollY])).toEqual([0, 0]);
  // a crate is a toy, not a control: nothing to announce or to reach with the keyboard, and a finger on it drags it, not the map
  expect(await page.locator('.ws-crates').getAttribute('aria-hidden')).toBe('true');
  expect(await crate.evaluate((el) => getComputedStyle(el).touchAction)).toBe('none');
});

test('small sounds are asked for, and heard only with the sound on', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  const music = () => page.evaluate(() => (window as unknown as { __igMusic: () => { sfx?: number; loaded: boolean } }).__igMusic());
  expect((await music()).sfx ?? 0).toBe(0);
  // a stop reached, a card opened, dusk: each asks for its sound…
  await page.getByRole('button', { name: 'Parada siguiente' }).click();
  await arrived(page);
  await page.getByRole('button', { name: 'Más información · TACH Argentina' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Pasar a la noche' }).click();
  await expect(page.locator('.ws')).toHaveAttribute('data-time', 'night');
  expect((await music()).sfx).toBe(3);
  // …and with the sound off (the default) nothing is loaded and nothing sounds
  expect((await music()).loaded).toBe(false);
});

test('with reduced motion nothing moves by itself, and the hour changes at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready][data-seen]')).toBeVisible();
  expect(await running(page, '.ws')).toBe(0);
  // the people stand on the path and the clouds rest in the sky: still, but there
  expect(await page.locator('.ww[data-id="mdp"]').first().evaluate((el) => { const b = el.getBoundingClientRect(); return b.width > 8 && getComputedStyle(el).animationName === 'none'; })).toBe(true);
  expect(await page.locator('.wk').first().evaluate((el) => el.getBoundingClientRect().left)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Pasar a la noche' }).click();
  expect(await page.locator('.ws').getAttribute('data-time')).toBe('night');
  expect(await page.locator('.ws-veil').evaluate((el) => el.getAnimations().length)).toBe(0);
});

test('on a phone: the four controls of the map fit, are big enough and the page stays its width', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true, storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  await page.addInitScript(() => { localStorage.setItem('ig:v2:gate', 'off'); localStorage.setItem('ig:v2:time', 'day'); });
  await page.goto('/v2/es/work/');
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
  const sizes = await page.locator('.ws-zbtn').evaluateAll((els) => els.map((el) => { const b = el.getBoundingClientRect(); return [Math.min(b.width, b.height) >= 44, b.right <= innerWidth, b.bottom < innerHeight * 0.6]; }));
  expect(sizes).toEqual(Array(4).fill([true, true, true]));
  // a finger on a crate throws it; the map stays
  const cdp = await context.newCDPSession(page);
  const crate = page.locator('.wc[data-id="mdp"]');
  // bring the crate to the middle of the screen
  await page.evaluate(() => { const v = document.querySelector('.ws-view')!, c = document.querySelector('.wc[data-id="mdp"] path')!.getBoundingClientRect(); v.scrollLeft += c.left - 180; });
  const box = (await crate.locator('path').first().boundingBox())!;
  expect(box.x).toBeGreaterThan(100); expect(box.x).toBeLessThan(260);
  const x = box.x + box.width / 2, y = box.y + box.height / 2, left = await page.locator('.ws-view').evaluate((v) => v.scrollLeft);
  const start = await crate.evaluate((el) => el.style.getPropertyValue('--x'));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let s = 1; s <= 6; s++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + s * 12, y: y - s * 10 }] }); await page.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => crate.evaluate((el) => el.style.getPropertyValue('--x'))).not.toBe(start);
  expect(await page.locator('.ws-view').evaluate((v) => v.scrollLeft)).toBe(left);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  await context.close();
});
