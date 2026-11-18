import { expect, test, type Page } from '@playwright/test';

// Lote 3.1: «Cinética», the gate of the home of /v2. 2D motion graphics around the IG mark: the coral dot is a
// ball that drops, bounces and builds the mark, and every landing sends a new colour across the screen; then
// the gate rests with the name, the role and two doors, and answers to the pointer. Every other test skips the
// gate with the QA switch (playwright.config.ts); these run without it.
test.use({ storageState: { cookies: [], origins: [] } });

const gate = (page: Page) => page.getByRole('dialog', { name: 'Entrada al portafolio' });
const ready = async (page: Page) => {
  await expect(page.locator('.gk')).toHaveAttribute('data-ready', 'true', { timeout: 15_000 });
  await page.waitForTimeout(1700); // the letters, the role and the doors have come in
};
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;

test('the gate is in the HTML the server sends, and without JavaScript there is no gate at all', async ({ request, browser }) => {
  const html = await (await request.get('/v2/es/')).text();
  expect(html).toContain('class="gt gk"');
  expect(html).toContain('data-scene="0"');
  expect(html).toContain('Ver portafolio');
  expect(html).toContain('Conocer a Ignacio');
  expect(html).toMatch(/<noscript><style>\.gt\{display:none\}<\/style><\/noscript>/);
  const ctx = await browser.newContext({ javaScriptEnabled: false, storageState: { cookies: [], origins: [] } });
  const page = await ctx.newPage();
  await page.goto('/v2/es/');
  await expect(page.locator('.gt')).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await ctx.close();
});

for (const [w, h] of [[360, 640], [390, 844], [844, 390], [820, 1180], [1024, 768], [1440, 900]] as const) {
  test(`one screen at ${w}×${h}: everything visible, nothing scrolls, readable and touchable`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/v2/es/');
    await expect(gate(page)).toBeVisible();
    await ready(page);
    const r = await page.evaluate(() => {
      const g = document.querySelector('.gk')!;
      const inner = g.querySelector('.gk-in')!;
      const inside = (el: Element) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.left >= -1 && b.top >= -1 && b.right <= innerWidth + 1 && b.bottom <= innerHeight + 1; };
      const small: string[] = [];
      for (const el of g.querySelectorAll('.gk-in *')) {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
        if (own && !el.closest('.ui-sr') && el.getBoundingClientRect().width > 0 && parseFloat(getComputedStyle(el).fontSize) < 12) small.push(el.className.toString());
      }
      const box = (sel: string) => g.querySelector(sel)!.getBoundingClientRect();
      return {
        fits: inner.scrollHeight <= inner.clientHeight && inner.scrollWidth <= inner.clientWidth,
        outside: [...g.querySelectorAll('.gk-brand, .gk-mark, .gk-l, .gk-role, .gk-door, .gk-fork, .gk-meter')].filter((el) => !inside(el)).map((el) => el.className.toString()),
        targets: [...g.querySelectorAll('.gk-door, .gk-mark')].map((el) => Math.round(Math.min(el.getBoundingClientRect().width, el.getBoundingClientRect().height))),
        // the mark over the name, the name over the role, the role over the doors (or beside them, on a phone on its side)
        order: box('.gk-mark').bottom <= box('.gk-name').top + 1 && box('.gk-name').bottom <= box('.gk-role').top + 1,
        small,
        pageScroll: getComputedStyle(document.documentElement).overflowY,
      };
    });
    expect(r.fits).toBe(true);
    expect(r.outside).toEqual([]);
    expect(Math.min(...r.targets)).toBeGreaterThanOrEqual(44);
    expect(r.order).toBe(true);
    expect(r.small).toEqual([]);
    expect(r.pageScroll).toBe('hidden');
    await page.mouse.wheel(0, 600);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });
}

test('the opening: four acts with the loading, a new colour at every landing, and the gate at rest in ink', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.setViewportSize({ width: 1440, height: 900 });
  // what the gate goes through, written down as it happens
  await page.addInitScript(() => {
    const seen = { scenes: [] as string[], themes: [] as string[] };
    (window as unknown as { __gate: typeof seen }).__gate = seen;
    const push = (list: string[], v?: string) => { if (v && list[list.length - 1] !== v) list.push(v); };
    const watch = () => {
      const g = document.querySelector<HTMLElement>('.gk');
      if (!g) return false;
      const read = () => { push(seen.scenes, g.dataset.scene); push(seen.themes, g.dataset.theme); };
      read();
      new MutationObserver(read).observe(g, { attributes: true });
      return true;
    };
    if (!watch()) document.addEventListener('DOMContentLoaded', watch);
  });
  await page.goto('/v2/es/');
  // during the opening the way in is already there, and the doors of the rest are not reachable yet
  await expect(page.locator('.gk-skip')).toBeVisible();
  expect(await page.locator('.gk-final').evaluate((el: HTMLElement) => el.inert)).toBe(true);
  await expect(page.locator('.gk')).toHaveAttribute('data-landed', 'true', { timeout: 15_000 });
  const seen = await page.evaluate(() => (window as unknown as { __gate: { scenes: string[]; themes: string[] } }).__gate);
  expect(seen.scenes).toEqual(['0', '1', '2', '3', '4']);
  expect(seen.themes).toEqual(['ink', 'coral', 'blue', 'paper', 'ink']);
  await ready(page);
  await expect(page.locator('.gk-skip')).toHaveCount(0);
  await expect(page.locator('.gk-big')).toBeHidden();
  await expect(page.locator('.gk-wipe')).toHaveCount(0);
  await expect(page.getByRole('progressbar', { name: 'Carga del sitio' })).toHaveAttribute('aria-valuenow', '100');
  await expect(page.locator('.gk-step')).toHaveText('Listo');
  await expect(page.locator('.gk-num')).toHaveText('100');
  // the whole name for screen readers; the letters that jump are decoration
  await expect(page.locator('.gk-name .ui-sr')).toHaveText('Ignacio Gauna');
  await expect(page.locator('.gk-word').first()).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.gk-l')).toHaveCount(12);
  await expect(page.locator('.gk-role')).toHaveText('Sr AI Fullstack Developer');
  await expect(page.locator('.gk-brand')).toHaveText('Portafolio 2026');
  // the name in paper and the surname in coral, on ink
  await expect(page.locator('.gk-word--first .gk-l').first()).toHaveCSS('color', rgb('#eeeae3'));
  await expect(page.locator('.gk-word--last .gk-l').first()).toHaveCSS('color', rgb('#ff7a5c'));

  // the page under the gate: no focus, no shortcuts
  expect(await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.sh, #main')].map((el) => el.inert))).toEqual([true, true]);
  const stops: string[] = [];
  await page.locator('.gk').focus();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    stops.push(await page.evaluate(() => { const el = document.activeElement; return el?.closest('.gk') ? (el.getAttribute('aria-label') ?? el.textContent ?? '').replace(/Enter$/, '').trim() : 'outside'; }));
  }
  expect(stops.filter((s) => s !== 'outside').slice(0, 3)).toEqual(['Cambiar el color de la puerta', 'Conocer a Ignacio', 'Ver portafolio']);
  await page.keyboard.press('2');
  await expect(page).toHaveURL(/\/v2\/es\/$/);
  await expect(page.getByRole('link', { name: 'Conocer a Ignacio' }).first()).toHaveAttribute('href', /\/trailer\/v2\/index\.html\?lang=es$/);

  await page.locator('.gk').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.gt')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('data-gate', 'off');
  await expect(page.locator('#main')).toBeFocused();
  expect(await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.sh, #main')].map((el) => el.inert))).toEqual([false, false]);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  // nothing keeps asking for frames once it is gone
  await page.mouse.move(5, 5);
  await page.waitForTimeout(800);
  await page.evaluate(() => { const w = window as Window & { __raf?: number }; w.__raf = 0; const raf = requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => { w.__raf = (w.__raf ?? 0) + 1; return raf(cb); }; });
  await page.waitForTimeout(1200);
  expect(await page.evaluate(() => (window as Window & { __raf?: number }).__raf)).toBe(0);
  expect(errors).toEqual([]);
});

test('a press anywhere during the opening goes straight to the rest', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/v2/es/');
  await expect(page.locator('.gk')).toHaveAttribute('data-landed', 'false');
  await page.mouse.click(60, 600);
  await expect(page.locator('.gk')).toHaveAttribute('data-landed', 'true');
  await expect(page.locator('.gk')).toHaveAttribute('data-theme', 'ink');
  await expect(page.getByRole('button', { name: 'Ver portafolio' })).toBeVisible();
  await expect(page.locator('.gt')).toHaveCount(1); // it is still the gate: the press skipped the opening, not the gate
});

test('pressing the mark takes the gate to the next colour, readable every time', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/v2/es/');
  await ready(page);
  const markBtn = page.getByRole('button', { name: 'Cambiar el color de la puerta' });
  // field, what is written, the surname, the main button and its text — one row per colour, in order
  const colours = [
    ['coral', '#ff5a3c', '#060513', '#ffffff', '#060513', '#eeeae3'],
    ['blue', '#2b50ff', '#ffffff', '#ffc247', '#eeeae3', '#060513'],
    ['paper', '#eeeae3', '#060513', '#2b50ff', '#ff5a3c', '#0c0a24'],
    ['amber', '#ffc247', '#060513', '#2b50ff', '#060513', '#ffe39a'],
    ['ink', '#060513', '#eeeae3', '#ff7a5c', '#ff5a3c', '#0c0a24'],
  ];
  for (const [name, bg, fg, alt, btn, btnFg] of colours) {
    await markBtn.click();
    await expect(page.locator('.gk')).toHaveAttribute('data-theme', name);
    // the wipe ends and leaves the field in the new colour; everything written has switched with it
    await expect(page.locator('.gk-wipe')).toHaveCount(0);
    await expect(page.locator('.gk-field')).toHaveCSS('background-color', rgb(bg));
    await expect(page.locator('.gk-word--first .gk-l').last()).toHaveCSS('color', rgb(fg));
    await expect(page.locator('.gk-word--last .gk-l').last()).toHaveCSS('color', rgb(alt));
    await expect(page.locator('.gk-role b')).toHaveCSS('color', rgb(fg));
    await expect(page.locator('.gk-door--meet')).toHaveCSS('background-color', rgb(btn));
    await expect(page.locator('.gk-door--meet')).toHaveCSS('color', rgb(btnFg));
    await expect(page.locator('.gk-door--enter')).toHaveCSS('color', rgb(fg));
  }
  // with the keyboard too: the mark is a button
  await markBtn.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.gk')).toHaveAttribute('data-theme', 'coral');
  await expect(page.locator('.gt')).toHaveCount(1);
});

test('at rest it answers: a letter jumps under the pointer and takes its neighbours, the mark wiggles', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/v2/es/');
  await ready(page);
  const moving = () => page.locator('.gk-l').evaluateAll((els) => els.map((el) => el.getAnimations().filter((a) => !(a as CSSAnimation).animationName).length));
  expect((await moving()).reduce((a, b) => a + b, 0)).toBe(0);
  await page.locator('.gk-l').nth(3).hover();
  const hop = await moving();
  expect(hop.slice(1, 6)).toEqual([1, 1, 1, 1, 1]); // the letter and two on each side
  expect(hop[0] + hop[7]).toBe(0);
  await expect.poll(async () => (await moving()).reduce((a, b) => a + b, 0), { timeout: 3000 }).toBe(0);
  await page.locator('.gk-mark').hover();
  expect(await page.locator('.gk-mark-g').evaluate((el) => el.getAnimations().length)).toBe(1);
  expect(await page.locator('.gk-mark-dot').evaluate((el) => el.getAnimations().filter((a) => !(a as CSSAnimation).animationName).length)).toBe(1);
  // a door takes a breath under the pointer
  await page.getByRole('button', { name: 'Ver portafolio' }).hover();
  await expect(page.getByRole('button', { name: 'Ver portafolio' })).toHaveCSS('animation-name', 'gk-boing');
});

test('reduced motion: the gate is at rest from the start, nothing moves, and it opens at once', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 }, storageState: { cookies: [], origins: [] } });
  const page = await ctx.newPage();
  await page.goto('/v2/es/');
  await expect(page.locator('.gk')).toHaveAttribute('data-landed', 'true');
  await expect(page.locator('.gk')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.gk-skip')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Ver portafolio' })).toBeVisible();
  for (const sel of ['.gk-l', '.gk-door', '.gk-mark', '.gk-mark-dot', '.gk-packet', '.gk-role']) await expect(page.locator(sel).first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.gk-l').last()).toHaveCSS('opacity', '1');
  await page.locator('.gk-l').nth(3).hover();
  expect(await page.locator('.gk-l').evaluateAll((els) => els.reduce((n, el) => n + el.getAnimations().length, 0))).toBe(0);
  // the colour still changes, at once
  await page.getByRole('button', { name: 'Cambiar el color de la puerta' }).click();
  await expect(page.locator('.gk')).toHaveAttribute('data-theme', 'coral');
  await expect(page.locator('.gk-wipe')).toHaveCount(0);
  await expect(page.locator('.gk-field')).toHaveCSS('background-color', rgb('#ff5a3c'));
  await page.getByRole('button', { name: 'Ver portafolio' }).click();
  await expect(page.locator('.gt')).toHaveCount(0);
  await ctx.close();
});

test('the second door and Escape open it too; inside the visit it never comes back, a reload brings it again', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/v2/en/');
  await expect(page.getByRole('dialog', { name: 'Entrance to the portfolio' })).toBeVisible();
  // still in the opening: the way in is the one at the top
  await page.getByRole('button', { name: 'View portfolio' }).first().click();
  await expect(page.locator('.gt')).toHaveCount(0);
  // around the site and back home: no gate
  await page.locator('.sh-bar .sh-menu').click();
  await page.getByRole('dialog', { name: 'Site menu' }).getByRole('link', { name: /Work/ }).click();
  await expect(page).toHaveURL(/\/work\/$/);
  await page.locator('.sh-home').first().click();
  await expect(page).toHaveURL(/\/v2\/en\/$/);
  await expect(page.locator('.gt')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // a full load of the home: the gate again, and Escape opens it
  await page.reload();
  await expect(page.locator('.gt')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.gt')).toHaveCount(0);
});

test('a visit that starts on another page never meets the gate', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/');
  await expect(page.locator('html')).toHaveAttribute('data-gate', 'off');
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Inicio' }).click();
  await expect(page).toHaveURL(/\/v2\/es\/$/);
  await expect(page.locator('.gt')).toBeHidden();
  await expect(page.locator('.v2-hero .ui-btn--primary')).toBeVisible();
});

test('/puerta/: the gate and its four studies, each a link to the real thing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/puerta/');
  await expect(page.locator('html')).toHaveAttribute('data-gate', 'off');
  await expect(page.getByRole('navigation', { name: 'Sistema' }).getByRole('link', { name: 'Puerta' })).toHaveAttribute('aria-current', 'page');
  const cards = page.locator('.gl-card');
  await expect(cards.locator('h2')).toHaveText(['Cinética', 'Monograma', 'Código', 'Ascenso', 'Postal']);
  await expect(cards.first()).toContainText('Hoy en el inicio');
  await expect(cards.nth(3)).toContainText('El roadmap 2026 → 2030');
  await cards.nth(4).getByRole('link', { name: /Abrir esta puerta/ }).click();
  await expect(page).toHaveURL(/\/v2\/es\/puerta\/postal\/$/);
  await expect(page.locator('.gt')).toHaveAttribute('data-v', 'postal');
  // through that gate, a bar goes on to the next one: the gates one by one
  expect(await page.locator('.gl-pager').evaluate((el: HTMLElement) => el.inert)).toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.locator('.gt')).toHaveCount(0);
  const pager = page.getByRole('navigation', { name: 'Recorrer las puertas' });
  await expect(pager).toContainText('5 / 5');
  await expect(pager).toContainText('Postal');
  expect(await page.locator('.gl-pager').evaluate((el: HTMLElement) => el.inert)).toBe(false);
  await expect(pager.getByRole('link')).toHaveText(['Anterior: Ascenso', 'Repetir', 'Todas', 'Siguiente: Cinética']);
  await pager.getByRole('link', { name: /Siguiente/ }).click();
  await expect(page).toHaveURL(/\/v2\/es\/puerta\/cinetica\/$/);
  await expect(page.locator('.gk')).toHaveAttribute('data-v', 'cinetica');
  await page.keyboard.press('Escape');
  await expect(page.locator('.gt')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Recorrer las puertas' })).toContainText('1 / 5');
  // the bar fits a phone, with targets to touch
  await page.setViewportSize({ width: 360, height: 740 });
  const bar = await page.locator('.gl-pager').evaluate((el) => { const b = el.getBoundingClientRect(); return { in: b.left >= 0 && b.right <= innerWidth, min: Math.min(...[...el.querySelectorAll('a')].map((a) => a.getBoundingClientRect().height)) }; });
  expect(bar.in).toBe(true);
  expect(bar.min).toBeGreaterThanOrEqual(44);
  // at 360 px the page fits
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/v2/es/puerta/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});
