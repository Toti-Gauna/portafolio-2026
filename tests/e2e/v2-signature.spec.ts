import { expect, test, type Locator, type Page } from '@playwright/test';

// Lote 1.4: the signature pieces of /v2, live in /v2/<lang>/piezas/ (and the stack on the /v2 home).

const URL = '/v2/es/piezas/';
/** The vertical move of an element, in px, from its computed transform matrix. */
const dy = (l: Locator) => l.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42);
const settle = (page: Page, ms = 900) => page.waitForTimeout(ms);

test('the page shows the six pieces, with no console errors, and is never indexed', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(URL);
  for (const id of ['apilado', 'panel', 'verbos', 'contador', 'luz', 'reproductor']) await expect(page.locator(`section#${id} h2`)).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByRole('navigation', { name: 'Sistema' }).getByRole('link', { name: 'Piezas' })).toHaveAttribute('aria-current', 'page');
  expect(errors).toEqual([]);
});

test('the stack opens a layer from its name, from the layer itself, and Escape closes it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/');
  const stack = page.locator('.sig-stack');
  const layer = (i: number) => stack.locator(`.sig-stack-layer[data-layer="${i}"]`);
  const code = stack.getByRole('button', { name: /Código/ });
  expect(await dy(layer(0))).toBe(0);
  await code.click();
  await expect(code).toHaveAttribute('aria-pressed', 'true');
  await settle(page);
  // the layer above lifts, the open one and those below sink: the gap shows it whole
  expect(await dy(layer(0))).toBeLessThan(-40);
  expect(await dy(layer(1))).toBeGreaterThan(40);
  expect(await dy(layer(4))).toBeGreaterThan(40);
  await expect(layer(0)).toHaveCSS('opacity', '0.42');
  await expect(layer(1)).toHaveCSS('opacity', '1');
  // its name travels with it
  expect(await dy(stack.locator('.sig-stack-legend li').nth(1))).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(code).toHaveAttribute('aria-pressed', 'false');
  await settle(page);
  expect(await dy(layer(1))).toBe(0);
  // a click on the face of a layer opens that layer
  await layer(3).locator('.hit').dispatchEvent('click');
  await expect(stack.getByRole('button', { name: /Tests/ })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

test('the faces carry real text only where it reads at 12 px; bars stand in on small screens', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/');
  const t = page.locator('.sig-stack-layer[data-layer="1"] .t').first();
  await expect(t).not.toHaveCSS('display', 'none');
  const px = await t.evaluate((el) => (el as SVGGraphicsElement).getBoundingClientRect().height);
  expect(px).toBeGreaterThanOrEqual(8); // a slanted 17-unit line: its box is taller than 8 px only when the type is ≥ 12 px
  const size = await page.locator('.sig-stack-stage').evaluate((el) => (17 * el.getBoundingClientRect().width) / 810);
  expect(size).toBeGreaterThanOrEqual(12);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(t).toHaveCSS('display', 'none');
  await expect(page.locator('.sig-stack-layer[data-layer="1"] .b').first()).not.toHaveCSS('display', 'none');
});

test('verbs light up once and the last one stays lit; the counter rolls to its value', async ({ page }) => {
  await page.goto(URL);
  const verbs = page.locator('.sig-verb');
  await expect(verbs).toHaveCount(3);
  await page.locator('#verbos').scrollIntoViewIfNeeded();
  await expect(verbs.nth(2)).toHaveAttribute('data-state', 'on', { timeout: 6000 });
  await expect(verbs.nth(0)).toHaveAttribute('data-state', 'done');
  await expect(verbs.nth(1)).toHaveAttribute('data-state', 'done');
  // replay runs it again from the start
  await page.locator('#verbos').getByRole('button', { name: 'Repetir' }).click();
  await expect(verbs.nth(2)).toHaveAttribute('data-state', 'wait');
  await expect(verbs.nth(2)).toHaveAttribute('data-state', 'on', { timeout: 6000 });

  const count = page.locator('#contador .sig-count').first();
  await page.locator('#contador').scrollIntoViewIfNeeded();
  await expect(count.locator('.ui-sr')).toHaveText('1.374');
  await expect(count).toHaveAttribute('data-run', '1');
  await settle(page, 2200);
  // digit 3 of «1.374»: its strip sits three tenths up
  const strip = count.locator('.sig-digit > span').nth(1);
  const ratio = await strip.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42 / el.getBoundingClientRect().height);
  expect(ratio).toBeCloseTo(-0.3, 2);
});

test('the light follows the pointer and rests when it leaves; the panel turns toward it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);
  const light = page.locator('.sig-light-demo');
  await light.scrollIntoViewIfNeeded();
  const b = (await light.boundingBox())!;
  await page.mouse.move(b.x + 200, b.y + 120);
  await page.mouse.move(b.x + 420, b.y + 180, { steps: 6 });
  await expect(light).toHaveAttribute('data-live', '1');
  await settle(page, 700);
  const lx = await light.evaluate((el) => parseFloat(el.style.getPropertyValue('--lx')));
  expect(Math.abs(lx - 420)).toBeLessThan(6);
  await page.mouse.move(b.x + 420, b.y - 60);
  await expect(light).not.toHaveAttribute('data-live', '1');

  const tilt = page.locator('.sig-tilt');
  await tilt.scrollIntoViewIfNeeded();
  const rest = await tilt.locator('.sig-tilt-body').evaluate((el) => getComputedStyle(el).transform);
  const t = (await tilt.boundingBox())!;
  await page.mouse.move(t.x + t.width * 0.85, t.y + t.height * 0.2);
  await expect(tilt).toHaveAttribute('data-live', '1');
  await settle(page, 400);
  expect(await tilt.locator('.sig-tilt-body').evaluate((el) => getComputedStyle(el).transform)).not.toBe(rest);
});

test('the player keeps its place when its first frame is stamped before the click (a busy machine)', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // every frame arrives stamped two seconds early: the first one is «before» the click that started the film
  await page.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => cb(t - 2000)); });
  await page.goto(URL);
  const player = page.getByRole('group', { name: 'El oficio, en cinco capas' });
  await player.scrollIntoViewIfNeeded();
  await settle(page, 1200);
  await player.locator('.sig-player-play').click();
  await expect(player.locator('.sig-player-play')).toHaveAccessibleName('Pausar');
  await expect(player.locator('.sig-scene-title')).toHaveText('Planificación y ejecución');
  await expect(player.locator('.sig-player-chapters button').nth(1)).toHaveAttribute('aria-current', 'true', { timeout: 6000 });
  expect(errors).toEqual([]);
});

test('the player never starts alone, plays through its chapters, jumps with the arrows and stops at the end', async ({ page }) => {
  await page.goto(URL);
  const player = page.getByRole('group', { name: 'El oficio, en cinco capas' });
  await player.scrollIntoViewIfNeeded();
  const main = player.locator('.sig-player-play');
  const chapters = player.locator('.sig-player-chapters button');
  await expect(chapters).toHaveCount(5);
  await settle(page, 1500);
  await expect(main).toHaveAccessibleName('Reproducir');
  await expect(chapters.nth(0)).toHaveAttribute('aria-current', 'true');
  await expect(player.locator('.sig-scene-title')).toHaveText('Planificación y ejecución');

  await main.click();
  await expect(main).toHaveAccessibleName('Pausar');
  await expect(chapters.nth(1)).toHaveAttribute('aria-current', 'true', { timeout: 6000 });
  await expect(player.locator('.sig-scene-title')).toHaveText('Código');
  // the first chapter's bar is full
  expect(await chapters.nth(0).locator('.sig-player-track span').evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)).toBe(1);

  await main.click(); // pause
  await expect(main).toHaveAccessibleName('Reproducir');
  await main.focus();
  await page.keyboard.press('ArrowRight');
  await expect(chapters.nth(2)).toHaveAttribute('aria-current', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(chapters.nth(1)).toHaveAttribute('aria-current', 'true');

  await chapters.nth(4).click();
  await expect(player.locator('.sig-scene-title')).toHaveText('Deploy');
  await main.click();
  await expect(main).toHaveAccessibleName('Repetir', { timeout: 6000 });
  await main.click();
  await expect(chapters.nth(0)).toHaveAttribute('aria-current', 'true');
  await expect(main).toHaveAccessibleName('Pausar');
  // it pauses when it leaves the screen
  await page.evaluate(() => scrollTo(0, 0));
  await expect(main).toHaveAccessibleName('Reproducir', { timeout: 3000 });
});

test('every stop of the Tab order on the pieces page shows its focus ring', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);
  let stops = 0;
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const r = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      return { tag: `${el.tagName}.${el.className}`, ok: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2 };
    });
    if (!r) break;
    expect(r.ok, `no visible focus on stop ${i + 1}: ${r.tag}`).toBe(true);
    stops++;
  }
  expect(stops).toBeGreaterThanOrEqual(19);
});

for (const [w, h] of [[360, 740], [390, 844], [820, 1180], [1440, 900]] as const) {
  test(`pieces at ${w}×${h}: no horizontal scroll (also with a layer open), no text under 12 px, targets of 44 px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(URL);
    await page.locator('.sig-stack').getByRole('button', { name: /Agentes/ }).click();
    await settle(page);
    const r = await page.evaluate(() => {
      const small: string[] = [];
      for (const el of document.querySelectorAll('body *:not(svg *)')) {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
        if (own && parseFloat(getComputedStyle(el).fontSize) < 12) small.push(el.className || el.tagName);
      }
      const tiny = [...document.querySelectorAll<HTMLElement>('a, button')]
        .filter((el) => el.offsetParent && !el.classList.contains('v2-skip') && el.getBoundingClientRect().height < 44)
        .map((el) => el.className || el.tagName);
      // names beside the stack never touch each other
      const names = [...document.querySelectorAll('.sig-stack-legend button')].map((el) => el.getBoundingClientRect());
      const clash = names.some((a, i) => names.some((b, j) => j > i && a.left < b.right && b.left < a.right && a.top < b.bottom - 1 && b.top < a.bottom - 1));
      return { over: document.documentElement.scrollWidth - window.innerWidth, small, tiny, clash };
    });
    expect(r.over).toBeLessThanOrEqual(0);
    expect(r.small).toEqual([]);
    expect(r.tiny).toEqual([]);
    expect(r.clash).toBe(false);
  });
}

test('reduced motion: every piece shows its end frame and nothing moves on its own', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL);
  // verbs and counters are already at their end, without scrolling to them
  await expect(page.locator('.sig-verb').nth(2)).toHaveAttribute('data-state', 'on');
  await expect(page.locator('.sig-verb').nth(0)).toHaveAttribute('data-state', 'done');
  await expect(page.locator('#contador .sig-count').first()).toHaveAttribute('data-run', '1');
  await expect(page.locator('.sig-stack-layer').first()).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('.sig-scene-art')).toHaveCSS('animation-name', 'none');
  // the light and the panel keep their resting pose under the pointer
  const light = page.locator('.sig-light-demo');
  await light.scrollIntoViewIfNeeded();
  const b = (await light.boundingBox())!;
  await page.mouse.move(b.x + 200, b.y + 100);
  await page.mouse.move(b.x + 300, b.y + 140);
  await page.waitForTimeout(300);
  await expect(light).not.toHaveAttribute('data-live', '1');
  await ctx.close();
});
