import { expect, test, type Page } from '@playwright/test';

// Lote 2.2: the motion and interaction engine of /v2 (v2/motion, v2/components/motion/MotionRoot.tsx).

const MOTION = '/v2/es/motion/';

/** Counts the animation frames anyone asks for, from the moment it is called. */
const countFrames = (page: Page) =>
  page.evaluate(() => {
    const w = window as Window & { __raf?: number };
    w.__raf = 0;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => { w.__raf = (w.__raf ?? 0) + 1; return raf(cb); };
  });
const frames = (page: Page) => page.evaluate(() => (window as Window & { __raf?: number }).__raf ?? 0);

/** Spies on document.startViewTransition: how many times, and the camera move set for each. */
const spyCamera = (page: Page) =>
  page.addInitScript(() => {
    const w = window as Window & { __vt?: string[] };
    w.__vt = [];
    const d = document as Document & { startViewTransition?: (cb: () => unknown) => unknown };
    const real = d.startViewTransition?.bind(document);
    if (real) d.startViewTransition = (cb) => { w.__vt!.push(document.documentElement.dataset.vt ?? ''); return real(cb); };
  });
const camera = (page: Page) => page.evaluate(() => (window as Window & { __vt?: string[] }).__vt ?? []);

test('entrances: only what is below the fold waits, it enters on screen, and nothing hides without the engine', async ({ page, browser }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/v2/es/');
  const doors = page.locator('#explorar li[data-reveal]');
  await expect(page.locator('html')).toHaveClass(/v2-motion/);
  // the hero is on screen: shown from the start, never animated
  await expect(page.locator('.v2-hero .ui-btn--primary')).toBeVisible();
  await expect(doors.first()).not.toHaveAttribute('data-shown', /./);
  await expect(doors.first()).toHaveCSS('opacity', '0');
  await page.locator('#explorar').scrollIntoViewIfNeeded();
  await expect(doors.first()).toHaveAttribute('data-shown', 'in');
  await expect(doors.first()).toHaveCSS('opacity', '1');
  // what enters together is staggered in reading order
  const ri = await page.locator('#explorar [data-reveal]').evaluateAll((els) => els.map((el) => (el as HTMLElement).style.getPropertyValue('--ri')).filter(Boolean));
  expect(ri.length).toBeGreaterThan(1);
  expect(ri.map(Number)).toEqual([...ri.map(Number)].sort((x, y) => x - y));

  for (const ctx of [await browser.newContext({ javaScriptEnabled: false }), await browser.newContext({ reducedMotion: 'reduce' })]) {
    const p = await ctx.newPage();
    await p.setViewportSize({ width: 390, height: 844 });
    await p.goto('/v2/es/');
    for (const el of await p.locator('[data-reveal]').all()) await expect(el).toHaveCSS('opacity', '1');
    await ctx.close();
  }
});

test('the demo replays its entrances on request', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(MOTION);
  const tiles = page.locator('#aparicion .mo-tile');
  await expect(tiles).toHaveCount(6);
  await page.getByRole('button', { name: 'Repetir' }).click();
  await expect(tiles.last()).toHaveAttribute('data-shown', 'in');
  await expect(tiles.last()).toHaveCSS('opacity', '1');
});

test('magnetic hover leans toward the mouse and settles back; touch screens leave it alone', async ({ page, browser }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(MOTION);
  const btn = page.locator('#magnetico [data-magnetic]').first();
  await btn.scrollIntoViewIfNeeded();
  const b = (await btn.boundingBox())!;
  await page.mouse.move(b.x + b.width - 3, b.y + b.height / 2, { steps: 6 });
  await expect.poll(() => btn.evaluate((el) => parseFloat(el.style.translate) || 0)).toBeGreaterThan(4);
  await page.mouse.move(b.x + b.width / 2, b.y + 400, { steps: 6 });
  await expect.poll(() => btn.evaluate((el) => el.style.translate)).toBe('');

  const touch = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const p = await touch.newPage();
  await p.goto(MOTION);
  const t = p.locator('#magnetico [data-magnetic]').first();
  await t.scrollIntoViewIfNeeded();
  await t.tap();
  expect(await t.evaluate((el) => el.style.translate)).toBe('');
  // and no cursor of light on a touch screen
  await expect(p.locator('.v2-cursor')).toHaveCount(0);
  await touch.close();
});

test('the contextual cursor follows the mouse, names the click and takes the colour of the area', async ({ page, browser }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(MOTION);
  const cursor = page.locator('.v2-cursor');
  await expect(cursor).toHaveCount(1);
  await expect(cursor).toHaveAttribute('aria-hidden', 'true');
  const zone = page.locator('.mo-zone').nth(1);
  await zone.scrollIntoViewIfNeeded();
  const z = (await zone.boundingBox())!;
  await page.mouse.move(z.x + 40, z.y + 40, { steps: 4 });
  await expect(cursor).toHaveAttribute('data-on', 'true');
  await expect(cursor).toHaveAttribute('data-mode', 'label');
  await expect(cursor.locator('.v2-cursor-label')).toHaveText('Arrastrar');
  expect(await cursor.evaluate((el) => el.style.getPropertyValue('--cc'))).toBe('#3fe0b0');
  // the ring catches up with the pointer and stops there
  await expect.poll(() => cursor.evaluate((el) => el.style.transform)).toBe(`translate3d(${(z.x + 40).toFixed(1)}px, ${(z.y + 40).toFixed(1)}px, 0px)`);
  // over a link it grows, over nothing it rests
  const link = page.locator('.sh-nav a').first();
  await link.hover();
  await expect(cursor).toHaveAttribute('data-mode', 'link');
  await page.mouse.move(5, 500);
  await expect(cursor).toHaveAttribute('data-mode', 'idle');

  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const p = await reduced.newPage();
  await p.goto(MOTION);
  await p.mouse.move(300, 300);
  await expect(p.locator('.v2-cursor')).toHaveCount(0);
  await reduced.close();
});

test('scroll-linked: --p follows the scroll, and rests at its final frame with reduced motion', async ({ page, browser }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(MOTION);
  const scene = page.locator('.mo-scroll');
  await scene.scrollIntoViewIfNeeded();
  await expect.poll(() => scene.evaluate((el) => Number(el.style.getPropertyValue('--p')))).toBeGreaterThan(0);
  const a = await scene.evaluate((el) => Number(el.style.getPropertyValue('--p')));
  await page.mouse.wheel(0, 250);
  await expect.poll(() => scene.evaluate((el) => Number(el.style.getPropertyValue('--p')))).toBeGreaterThan(a + 0.05);

  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const p = await reduced.newPage();
  await p.goto(MOTION);
  expect(await p.locator('.mo-scroll').evaluate((el) => el.style.getPropertyValue('--p'))).toBe('0.5');
  await reduced.close();
});

test('nothing loops: once the mouse and the page are still, no animation frame is asked for', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(MOTION);
  // touch every piece: the mouse over a magnetic button and a zone, a scroll through the scene
  const btn = page.locator('#magnetico [data-magnetic]').first();
  await btn.scrollIntoViewIfNeeded();
  await btn.hover();
  await page.locator('.mo-zone').first().hover();
  await page.locator('.mo-scroll').scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(1500); // springs, ring and scroll settle
  await countFrames(page);
  await page.waitForTimeout(1500);
  expect(await frames(page)).toBe(0);
});

test('shortcuts: «?» opens the help, numbers go to the pages, typing never fires them, and they turn off', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/componentes/');
  // typing in a field is typing
  const field = page.locator('input[type="text"], input[type="email"]').first();
  await field.focus();
  await page.keyboard.type('2?');
  await expect(page).toHaveURL(/\/componentes\/$/);
  await expect(page.locator('.v2-keys')).not.toHaveAttribute('open', '');
  await field.blur();

  await page.keyboard.press('?');
  const help = page.getByRole('dialog', { name: 'Atajos de teclado' });
  await expect(help).toBeVisible();
  await expect(help.getByRole('button', { name: 'Cerrar los atajos' })).toBeFocused();
  await expect(help.locator('dt kbd')).toHaveText(['?', '1–6', 'T', 'M', 'L', 'Esc']);
  await page.keyboard.press('Escape');
  await expect(help).toBeHidden();

  // M: the sound, announced
  await page.keyboard.press('m');
  await expect(page.locator('.sh-bar .ui-sound')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('p.ui-sr[aria-live="polite"]')).toHaveText('Sonido activado');
  await page.keyboard.press('m');

  // 2: Work
  await page.keyboard.press('2');
  await expect(page).toHaveURL(/\/v2\/es\/work\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lo que construí.');

  // T: back to the top
  await page.evaluate(() => scrollTo(0, 600));
  await page.keyboard.press('t');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);

  // turned off from the help: no key does anything, and it is remembered; the foot still opens the help
  await page.keyboard.press('?');
  await help.getByRole('switch', { name: 'Atajos de una tecla' }).click();
  await expect(help.getByText('Apagados')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.reload();
  await page.keyboard.press('1');
  await page.keyboard.press('?');
  await expect(page).toHaveURL(/\/v2\/es\/work\/$/);
  await expect(help).toBeHidden();
  await page.getByRole('button', { name: 'Atajos de teclado' }).click();
  await expect(help).toBeVisible();
  await expect(help.getByRole('switch', { name: 'Atajos de una tecla' })).not.toBeChecked();

  // L: the same page in English
  await help.getByRole('switch', { name: 'Atajos de una tecla' }).click();
  await page.keyboard.press('Escape');
  await page.keyboard.press('l');
  await expect(page).toHaveURL(/\/v2\/en\/work\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('page changes move the camera along the menu, in depth for the system, and the header stays', async ({ page }) => {
  await spyCamera(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/');
  test.skip(!(await page.evaluate(() => 'startViewTransition' in document)), 'this browser has no View Transitions');
  await page.locator('.sh').evaluate((el) => { (el as HTMLElement & { __kept?: boolean }).__kept = true; });
  const nav = page.getByRole('navigation', { name: 'Principal' });
  await nav.getByRole('link', { name: 'Negocio' }).click();
  await expect(page).toHaveURL(/\/negocio\/$/);
  await nav.getByRole('link', { name: 'Cómo trabajo' }).click();
  await expect(page).toHaveURL(/\/como-trabajo\/$/);
  await page.getByRole('link', { name: 'Sistema IG' }).click();
  await expect(page).toHaveURL(/\/tokens\/$/);
  expect(await camera(page)).toEqual(['forward', 'back', 'depth']);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  expect(await page.locator('.sh').evaluate((el) => (el as HTMLElement & { __kept?: boolean }).__kept)).toBe(true);
  // the move is over: nothing stays marked, and the first load never animated
  await expect(page.locator('html')).not.toHaveAttribute('data-vt', /./);
  // an anchor on the same page is just an anchor
  await page.goto('/v2/es/');
  await page.getByRole('link', { name: 'Explorar el portafolio' }).click();
  await expect(page).toHaveURL(/#explorar$/);
  expect(await camera(page)).toEqual([]);
});

test('without View Transitions, and from the phone menu, the new page fades in; the first load never does', async ({ page, browser }) => {
  await page.addInitScript(() => { delete (Document.prototype as unknown as Record<string, unknown>).startViewTransition; });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/');
  await expect(page.locator('html')).not.toHaveAttribute('data-nav', /./);
  expect(await page.locator('.v2-page').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Work' }).click();
  await expect(page).toHaveURL(/\/work\/$/);
  await expect(page.locator('html')).toHaveAttribute('data-nav', 'fade');
  expect(await page.locator('.v2-page').evaluate((el) => getComputedStyle(el).animationName)).toBe('v2-page-in');

  const phone = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await phone.newPage();
  await spyCamera(p);
  await p.goto('/v2/es/');
  await p.locator('.sh-bar .sh-menu').click();
  await p.getByRole('dialog', { name: 'Menú del sitio' }).getByRole('link', { name: /Negocio/ }).click();
  await expect(p).toHaveURL(/\/negocio\/$/);
  expect(await camera(p)).toEqual([]);
  await expect(p.locator('html')).toHaveAttribute('data-nav', 'fade');
  await phone.close();
});

test('the motion page fits a phone and keeps text and targets readable', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(MOTION);
  const r = await page.evaluate(() => {
    const small: string[] = [];
    for (const el of document.querySelectorAll('main *, footer *')) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (own && parseFloat(getComputedStyle(el).fontSize) < 12) small.push(el.className || el.tagName);
    }
    const tiny = [...document.querySelectorAll<HTMLElement>('main a, main button, footer a, footer button')]
      .filter((el) => el.offsetParent)
      .filter((el) => el.getBoundingClientRect().height < 44)
      .map((el) => el.className || el.textContent);
    return { over: document.documentElement.scrollWidth - innerWidth, small, tiny };
  });
  expect(r).toEqual({ over: 0, small: [], tiny: [] });
});
