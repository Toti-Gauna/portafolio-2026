import { expect, type Page, test } from '@playwright/test';

// Lote 4.3, primera persona: the world of Work from the ground, by car. The same land, built in 3D from the same
// bands; a switch between the two views; the wheel and the pedals (keys, or buttons on a touch screen), an
// autopilot to every stop, the card of each place, crates to pick up and throw, day and night, and sounds.
// Drawn by software here: these tests run after the rest (playwright.config.ts).
test.setTimeout(120_000);

type State = { x: number; y: number; a: number; v: number; at: number; near: number | null; cam: string; pilot: boolean; frames: number; night: number; held: number; tris: number; moving: number; kicks: number; flying: number; spots: ([number, number] | null)[] };
const state = (page: Page) => page.evaluate(() => (window as unknown as { __igDrive: () => State }).__igDrive());
const enter = async (page: Page, name = 'Primera persona') => {
  await page.getByRole('button', { name, exact: true }).click();
  await expect(page.locator('.ws')).toHaveAttribute('data-mode', 'drive', { timeout: 60_000 });
  // the curtain has lifted
  await expect.poll(() => page.locator('.ws-veil').evaluate((el) => el.getAnimations().length + Number(getComputedStyle(el).opacity)), { timeout: 15_000 }).toBe(0);
};
const open = async (page: Page, path = '/v2/es/work/', size = { width: 1280, height: 800 }) => {
  await page.setViewportSize(size);
  await page.goto(path);
  await expect(page.locator('.ws[data-ready]')).toBeVisible();
};
/** Everything has settled (the car, the gaze, the light): the frame count has stopped. */
const quiet = (page: Page) => expect.poll(async () => { const a = (await state(page)).frames; await page.waitForTimeout(500); return (await state(page)).frames - a; }, { timeout: 30_000 }).toBe(0);
const still = (page: Page) => expect.poll(async () => { const a = await state(page); await page.waitForTimeout(250); const b = await state(page); return b.v === 0 && !b.pilot && a.x === b.x && a.a === b.a; }, { timeout: 30_000 }).toBe(true);

test('the map has two views: the land in 3D is fetched only when someone asks for it', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const scripts: string[] = [];
  page.on('request', (r) => { if (r.resourceType() === 'script') scripts.push(r.url()); });
  await open(page);
  const views = page.getByRole('group', { name: 'Vista del mapa' });
  await expect(views.getByRole('button', { name: 'Isométrica' })).toHaveAttribute('aria-pressed', 'true');
  await expect(views.getByRole('button', { name: 'Primera persona' })).toHaveAttribute('aria-pressed', 'false');
  // nothing of the 3D view is on the page yet
  await expect(page.locator('.dv-canvas')).toHaveCount(0);
  expect(await page.evaluate(() => '__igDrive' in window)).toBe(false);
  // go to the third stop and ask for the view from the ground
  for (const name of ['TACH Argentina', 'Ada ITW']) { await page.getByRole('button', { name: 'Parada siguiente' }).click(); await expect(page.locator('.ws-now b')).toHaveText(name); }
  const before = scripts.length;
  await enter(page);
  expect(scripts.length, 'the scene is a chunk of its own').toBeGreaterThan(before);
  await expect(views.getByRole('button', { name: 'Primera persona' })).toHaveAttribute('aria-pressed', 'true');
  // the drawing rests (it is not laid out, nothing in it runs), and the canvas has the keys
  await expect(page.locator('.ws-view')).toBeHidden();
  await expect(page.locator('.dv-canvas')).toBeFocused();
  expect(await page.locator('.ws').evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === 'running' && !(a instanceof CSSTransition) && (a.effect as KeyframeEffect).target?.closest('.ws-view, .ws-sky')).length)).toBe(0);
  const s = await state(page);
  expect(s.tris).toBeGreaterThan(12000);
  // the car is at the stop the map was on, parked beside its door; the card of the map says so, and so does the car's
  expect(s.at).toBe(2);
  expect(s.near).toBe(2);
  await expect(page.locator('.ws-now b')).toHaveText('Ada ITW');
  await expect(page.locator('.dv-card b')).toHaveText('Ada ITW');
  // the picture was drawn before the curtain lifted
  expect(s.frames).toBeGreaterThan(0);
  // the minimap shows the car instead of the window
  await expect(page.locator('.ws-car')).toBeVisible();
  await expect(page.locator('.ws-win')).toBeHidden();
  // and back: the map is where the car was, the scene is gone and its memory released
  await page.getByRole('button', { name: 'Isométrica', exact: true }).click();
  await expect(page.locator('.ws')).toHaveAttribute('data-mode', 'iso');
  await expect(page.locator('.dv-canvas')).toHaveCount(0);
  await expect(page.locator('.ws-view')).toBeVisible();
  await expect(page.locator('.ws-now b')).toHaveText('Ada ITW');
  expect(await page.evaluate(() => '__igDrive' in window)).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('at the wheel: the keys drive, the car comes to rest, and at rest no frame is drawn', async ({ page }) => {
  await open(page);
  await enter(page);
  const s0 = await state(page);
  // turn round and go: the car moves, and the stop it is nearest to is still the first
  await page.keyboard.down('d');
  await page.keyboard.down('w');
  await expect.poll(async () => (await state(page)).v, { timeout: 20_000 }).toBeGreaterThan(20);
  await page.keyboard.up('d');
  await page.keyboard.up('w');
  const s1 = await state(page);
  expect(Math.hypot(s1.x - s0.x, s1.y - s0.y)).toBeGreaterThan(2);
  expect(s1.a).not.toBe(s0.a);
  await still(page);
  // the arrows do the same as W A S D, and the brake goes on to reverse
  await page.keyboard.down('ArrowDown');
  await expect.poll(async () => (await state(page)).v, { timeout: 20_000 }).toBeLessThan(-5);
  await page.keyboard.up('ArrowDown');
  await still(page);
  // paused, parked: nothing asks for frames
  await page.getByRole('button', { name: 'Pausar el movimiento del mapa' }).click();
  await quiet(page);
  const f0 = (await state(page)).frames;
  await page.waitForTimeout(1500);
  expect((await state(page)).frames).toBe(f0);
  // with the map alive again, the place moves (people, wheels, clouds) — and stops when the map leaves the screen
  await page.getByRole('button', { name: 'Reanudar el movimiento del mapa' }).click();
  await expect.poll(async () => (await state(page)).frames, { timeout: 20_000 }).toBeGreaterThan(f0 + 3);
  await page.evaluate(() => document.getElementById('lista')!.scrollIntoView());
  await page.waitForTimeout(800);
  const f1 = (await state(page)).frames;
  await page.waitForTimeout(1200);
  expect((await state(page)).frames).toBe(f1);
});

test('the two arrows drive the car to each stop, and its card opens the same postcard as the map', async ({ page }) => {
  await open(page);
  await enter(page);
  const next = page.getByRole('button', { name: 'Manejar a la parada siguiente' });
  await expect(page.getByRole('button', { name: 'Manejar a la parada anterior' })).toBeDisabled();
  await next.click();
  // on the way the card of the place is put away, and where you are going is announced at once
  await expect(page.locator('.ws-now b')).toHaveText('TACH Argentina');
  expect((await state(page)).pilot).toBe(true);
  await expect.poll(async () => (await state(page)).pilot, { timeout: 60_000 }).toBe(false);
  await still(page);
  const s = await state(page);
  expect(s.at).toBe(1);
  expect(s.near).toBe(1);
  await expect(page.locator('.dv-card b')).toHaveText('TACH Argentina');
  // the card: the same dialog as on the map — the postcard and the facts — and the focus comes back
  const more = page.locator('.dv-card').getByRole('button', { name: /Más información/ });
  await more.click();
  const dialog = page.locator('dialog#wi-tach');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('h2')).toHaveText('TACH Argentina');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(more).toBeFocused();
  // Enter on the canvas opens it too
  await page.locator('.dv-canvas').focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  // and back
  await page.getByRole('button', { name: 'Manejar a la parada anterior' }).click();
  await expect.poll(async () => { const t = await state(page); return !t.pilot && t.at === 0 && t.v === 0; }, { timeout: 60_000 }).toBe(true);
  await expect(page.locator('.ws-now b')).toHaveText('Mar del Plata');
});

test('crates: the car sends them flying, and a hand picks one up and throws it', async ({ page }) => {
  await open(page);
  await enter(page);
  // seen from behind, and with the place paused (only what is thrown moves)
  await page.getByRole('button', { name: 'Ver el auto desde atrás' }).click();
  await expect(page.getByRole('button', { name: 'Ver desde el asiento' })).toBeVisible();
  expect((await state(page)).cam).toBe('out');
  // find a crate: turn the car until one is in view and within reach
  const spot = async () => (await state(page)).spots.find((p) => p !== null) ?? null;
  await page.locator('.dv-canvas').focus();
  let at = await spot();
  for (let i = 0; i < 40 && !at; i++) {
    await page.keyboard.down('d'); await page.keyboard.down('w');
    await page.waitForTimeout(350);
    await page.keyboard.up('w'); await page.keyboard.up('d');
    await still(page);
    at = await spot();
  }
  expect(at, 'a crate in view').not.toBeNull();
  const box = (await page.locator('.dv-canvas').boundingBox())!;
  // pick it up: it is in the hand, and it follows the pointer
  await page.mouse.move(box.x + at![0], box.y + at![1]);
  await page.mouse.down();
  await expect.poll(async () => (await state(page)).held).toBeGreaterThanOrEqual(0);
  await page.mouse.move(box.x + at![0] + 60, box.y + at![1] - 80, { steps: 6 });
  // let go: it flies, lands and comes to rest (and no frame is drawn after that, with the place paused)
  await page.mouse.up();
  expect((await state(page)).held).toBe(-1);
  await expect.poll(async () => (await state(page)).flying, { timeout: 20_000 }).toBeGreaterThan(0);
  await expect.poll(async () => (await state(page)).flying, { timeout: 40_000 }).toBe(0);
  // the way to the next stop passes by the crates: the car kicks one
  await page.getByRole('button', { name: 'Manejar a la parada siguiente' }).click();
  await expect.poll(async () => (await state(page)).pilot, { timeout: 60_000 }).toBe(false);
  await page.getByRole('button', { name: 'Manejar a la parada siguiente' }).click();
  await expect.poll(async () => (await state(page)).pilot, { timeout: 60_000 }).toBe(false);
  expect((await state(page)).kicks).toBeGreaterThan(0);
  // what was thrown stays thrown on the map
  await expect.poll(async () => (await state(page)).flying, { timeout: 40_000 }).toBe(0);
  await page.getByRole('button', { name: 'Isométrica', exact: true }).click();
  await expect(page.locator('.ws')).toHaveAttribute('data-mode', 'iso');
  await expect(page.locator('.ws-crates .wc').first()).toBeAttached();
});

test('night, the horn and the hum of the engine: asked for, and silent with the sound off', async ({ page }) => {
  await open(page);
  await enter(page);
  const music = () => page.evaluate(() => (window as unknown as { __igMusic: () => { loaded: boolean; sfx?: number; motor?: number } }).__igMusic());
  const n0 = (await music()).sfx ?? 0;
  // the hour is the map's: the same button, and the scene turns to night
  await page.getByRole('button', { name: 'Pasar a la noche' }).click();
  await expect.poll(async () => (await state(page)).night, { timeout: 30_000 }).toBe(1);
  await expect(page.locator('.ws')).toHaveAttribute('data-time', 'night');
  // the horn: a button, and Space on the canvas
  await page.getByRole('button', { name: 'Tocar la bocina' }).click();
  await page.locator('.dv-canvas').focus();
  await page.keyboard.press('Space');
  expect(((await music()).sfx ?? 0) - n0).toBeGreaterThanOrEqual(3);
  // the engine hums with the speed, and goes quiet when the car stops
  await page.keyboard.down('w');
  await expect.poll(async () => (await music()).motor ?? 0, { timeout: 20_000 }).toBeGreaterThan(0.05);
  await page.keyboard.up('w');
  await still(page);
  await expect.poll(async () => (await music()).motor ?? 0).toBe(0);
  // all of it with the sound off: nothing was loaded to make it
  expect((await music()).loaded).toBe(false);
});

test('reduced motion: the car goes to each stop at once, and nothing moves by itself', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await enter(page);
  await quiet(page);
  const f0 = (await state(page)).frames;
  await page.waitForTimeout(1200);
  expect((await state(page)).frames).toBe(f0);
  await page.getByRole('button', { name: 'Manejar a la parada siguiente' }).click();
  const s = await state(page);
  expect([s.at, s.near, s.pilot, s.v]).toEqual([1, 1, false, 0]);
  await expect(page.locator('.dv-card b')).toHaveText('TACH Argentina');
  // the wheel still answers: moving by your own hand is yours to choose
  await page.locator('.dv-canvas').focus();
  await page.keyboard.down('s');
  await expect.poll(async () => (await state(page)).v, { timeout: 20_000 }).toBeLessThan(-3);
  await page.keyboard.up('s');
});

test.describe('on a phone', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  test('the wheel and the pedals are buttons, everything fits and reads', async ({ page }) => {
    await page.goto('/v2/es/work/');
    await expect(page.locator('.ws[data-ready]')).toBeVisible();
    await enter(page);
    const pads = page.locator('.dv-pad button');
    await expect(pads).toHaveCount(4);
    for (const b of await pads.all()) { const r = (await b.boundingBox())!; expect(Math.min(r.width, r.height)).toBeGreaterThanOrEqual(44); expect(r.x).toBeGreaterThanOrEqual(0); expect(r.x + r.width).toBeLessThanOrEqual(390); }
    await expect(page.locator('.dv-keys')).toBeHidden();
    // hold the gas: the car goes; let go: it stops
    const gas = page.getByRole('button', { name: 'Acelerar' });
    await gas.dispatchEvent('pointerdown', { pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0 });
    await expect.poll(async () => (await state(page)).v, { timeout: 20_000 }).toBeGreaterThan(10);
    await gas.dispatchEvent('pointerup', { pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0 });
    await still(page);
    // the card of the place and every label: on screen and readable
    const report = await page.evaluate(() => {
      const small: string[] = [], out: string[] = [];
      for (const el of document.querySelectorAll('.dv *, .ws-hud *, .ws-zoom *')) {
        const b = el.getBoundingClientRect(), cs = getComputedStyle(el);
        if (!b.width || cs.visibility === 'hidden' || el.closest('.ui-sr')) continue;
        if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()) && parseFloat(cs.fontSize) < 12) small.push(el.className.toString() || el.tagName);
        if (el.matches('button, a') && (b.left < -1 || b.right > innerWidth + 1)) out.push(el.textContent!.slice(0, 20));
      }
      return { small, out, wide: document.documentElement.scrollWidth > innerWidth };
    });
    expect(report).toEqual({ small: [], out: [], wide: false });
  });
});

test('in English, and without WebGL the map simply keeps its one view', async ({ page }) => {
  await open(page, '/v2/en/work/');
  await enter(page, 'First person');
  await expect(page.locator('.dv-canvas')).toHaveAttribute('aria-label', /arrows or W A S D drive/);
  await expect(page.getByRole('button', { name: 'Drive to the next stop' })).toBeVisible();
  await expect(page.locator('.dv-card span').first()).toHaveText('You are at');
  // a browser without WebGL 2: the switch is not offered, and the map is the map
  const plain = await page.context().newPage();
  await plain.addInitScript(() => { delete (window as unknown as { WebGL2RenderingContext?: unknown }).WebGL2RenderingContext; });
  await plain.goto('/v2/en/work/');
  await expect(plain.locator('.ws[data-ready]')).toBeVisible();
  await expect(plain.getByRole('group', { name: 'Map view' })).toHaveCount(0);
  await expect(plain.getByRole('button', { name: 'Next stop' })).toBeVisible();
});
