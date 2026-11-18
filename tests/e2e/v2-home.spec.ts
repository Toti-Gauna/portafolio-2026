import { expect, test, type Page } from '@playwright/test';

// Lote 3.2: the home of /v2. Under the opening, four stretches of flat colour in the language of the gate:
// what I do (four objects that jump), the featured cases (their clips play under the pointer), a door to every
// page and the contact. A recruiter finds the role, the best case and the contact in under thirty seconds.
const settle = (page: Page, ms = 900) => page.waitForTimeout(ms);
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
const ours = (el: Element) => el.getAnimations().filter((a) => !(a as CSSAnimation).animationName).length;

test('role, best case and contact: what a recruiter looks for, in order, as real text', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/');
  // who and what, on the first screen
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Ignacio Gauna');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.locator('.v2-hero .ui-role')).toHaveText('SrAI Fullstack Developer');
  await expect(page.locator('.v2-hero .ui-role')).toBeInViewport();
  await expect(page.locator('.hm-stats li .sig-count .ui-sr')).toHaveText(['2021', '1.374', '11']);
  await expect(page.locator('.hm-stats li > span')).toHaveText(['Desarrollador desde', 'En verde en Eclipse (28/10/2026)', 'Con roles separados en mi forma de trabajar']);
  // the page, as a screen reader hears it
  for (const name of ['Cuatro cosas que hago bien, con pruebas.', 'Casos con su estado.', 'Elegí por dónde seguir.', 'Abierto a nuevas oportunidades.']) await expect(page.getByRole('heading', { level: 2, name })).toHaveCount(1);
  // the best case first, with where it stands
  const cases = page.locator('.hc-card');
  await expect(cases.locator('h3')).toHaveText(['CompliA', 'Tuenti', 'Eclipse']);
  await expect(cases.locator('.hc-status')).toHaveText(['En producción interna', 'Trabajo profesional', 'En construcción']);
  await expect(cases.first().locator('.hc-role')).toHaveText('Diseño y desarrollo · 2026 – hoy');
  await expect(cases.first().locator('figcaption')).toHaveText('Recorte de la demo de CompliA. Datos de ejemplo.');
  const widths = await cases.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
  expect(widths[0]).toBeGreaterThan(widths[1] * 1.2);
  // the contact: a mail and LinkedIn
  const contact = page.locator('#contacto');
  await expect(contact.getByRole('link', { name: 'Escribime' })).toHaveAttribute('href', /^mailto:.+@.+/);
  const li = contact.getByRole('link', { name: /LinkedIn/ });
  await expect(li).toHaveAttribute('href', /linkedin\.com\/in\//);
  await expect(li).toHaveAttribute('target', '_blank');
  await expect(li).toHaveAccessibleName(/se abre en otra pestaña/);
  // a door to each of the other five pages
  await expect(page.locator('#explorar .hd-t')).toHaveText(['Work', 'Cómo trabajo', 'Brand Lab', 'Negocio', 'Sobre mí']);
  await page.locator('#explorar .hd-row').first().click();
  await expect(page).toHaveURL(/\/v2\/es\/work\/$/);
  expect(errors).toEqual([]);
});

test('every stretch has its colour, and everything written on it reads (AA on the real colours)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/v2/en/');
  await expect(page.locator('.hm-sec')).toHaveCount(4);
  const fields = await page.locator('.hm-sec').evaluateAll((els) => els.map((el) => [el.id, (el as HTMLElement).dataset.theme, getComputedStyle(el).backgroundColor]));
  expect(fields).toEqual([['que-hago', 'coral', rgb('#ff5a3c')], ['casos', 'paper', rgb('#eeeae3')], ['explorar', 'blue', rgb('#2b50ff')], ['contacto', 'amber', rgb('#ffc247')]]);
  // bring everything in
  for (const id of ['que-hago', 'casos', 'explorar', 'contacto']) { await page.locator(`#${id}`).scrollIntoViewIfNeeded(); await page.evaluate(() => scrollBy(0, 500)); await settle(page, 350); }
  await settle(page, 1200);
  const bad = await page.evaluate(() => {
    const lin = (c: number) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const parse = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number);
    const out: string[] = [];
    for (const sec of document.querySelectorAll<HTMLElement>('.hm-sec')) {
      for (const el of sec.querySelectorAll<HTMLElement>('*')) {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
        if (!own || el.closest('.ui-sr') || !el.getBoundingClientRect().width) continue;
        const cs = getComputedStyle(el);
        // the field behind: the nearest ancestor that paints one
        let bg = [0, 0, 0, 0], node: HTMLElement | null = el;
        while (node && bg[3] === 0) { const b = parse(getComputedStyle(node).backgroundColor); bg = b.length === 3 ? [...b, 1] : b; if (bg[3] === 0) node = node.parentElement; }
        const fg = parse(cs.color);
        const a = lum(fg), b = lum(bg);
        const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        const size = parseFloat(cs.fontSize), large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
        if (ratio < (large ? 3 : 4.5)) out.push(`${sec.id} ${el.className || el.tagName} ${ratio.toFixed(2)} «${el.textContent!.trim().slice(0, 18)}»`);
        if (size < 12) out.push(`${sec.id} small ${el.className}`);
      }
    }
    return out;
  });
  expect(bad).toEqual([]);
  await expect(page.getByRole('heading', { level: 2, name: 'Four things I do well, with proof.' })).toBeVisible();
});

test('the colour of a stretch arrives as a dome that flattens with the scroll, and never widens the page', async ({ page, browser }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/v2/es/');
  const cap = page.locator('#que-hago .hm-cap');
  const scale = () => cap.locator('i').last().evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).d);
  // bring the top of the stretch just inside the screen: the dome is up
  await page.evaluate(() => { const top = document.querySelector('#que-hago')!.getBoundingClientRect().top + scrollY; scrollTo(0, top - innerHeight + 60); });
  await expect.poll(scale).toBeGreaterThan(0.6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  // further up the screen it has flattened
  await page.evaluate(() => { const top = document.querySelector('#que-hago')!.getBoundingClientRect().top + scrollY; scrollTo(0, top - 80); });
  await expect.poll(scale).toBe(0);
  // at 360 px nothing sticks out, whatever the scroll
  await page.setViewportSize({ width: 360, height: 740 });
  for (const id of ['que-hago', 'casos', 'explorar', 'contacto']) {
    await page.evaluate((id) => { const top = document.querySelector(`#${id}`)!.getBoundingClientRect().top + scrollY; scrollTo(0, top - innerHeight + 50); }, id);
    await settle(page, 200);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), id).toBeLessThanOrEqual(0);
  }
  // reduced motion: the stretches meet on a straight line
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
  const still = await ctx.newPage();
  await still.goto('/v2/es/');
  await still.evaluate(() => { const top = document.querySelector('#que-hago')!.getBoundingClientRect().top + scrollY; scrollTo(0, top - innerHeight + 60); });
  await settle(still, 300);
  expect(await still.locator('#que-hago .hm-cap i').evaluateAll((els) => els.map((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).d))).toEqual([0, 0]);
  await expect(still.locator('#que-hago .hm-title .jt-l').first()).toHaveCSS('animation-name', 'none');
  await expect(still.locator('#que-hago .hm-title')).toHaveCSS('opacity', '1');
  await ctx.close();
});

test('letters jump in with their title and under the pointer; objects jump and lift their lit piece', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/v2/es/');
  // the name of the opening answers to the pointer
  const name = page.locator('.v2-name .jt-l');
  await expect(name).toHaveCount(12);
  await name.nth(2).hover();
  expect(await name.evaluateAll((els) => els.map((el) => el.getAnimations().length))).toEqual([1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0]);
  // each letter of the surname has its own colour: nothing disappears while it is in the air
  expect(new Set(await name.evaluateAll((els) => els.slice(7).map((el) => getComputedStyle(el).color))).size).toBe(5);
  // a title below the fold: its letters and the ball of its kicker come in jumping
  const title = page.locator('#que-hago .hm-title');
  await expect(page.locator('#que-hago .hm-head')).not.toHaveAttribute('data-shown', /./);
  await page.locator('#que-hago .hm-head').scrollIntoViewIfNeeded();
  await expect(page.locator('#que-hago .hm-head')).toHaveAttribute('data-shown', 'in');
  await expect(title.locator('.jt-l').first()).toHaveCSS('animation-name', 'jt-jump');
  await expect(page.locator('#que-hago .hm-ball')).toHaveCSS('animation-name', 'hm-drop');
  // words never break inside
  expect(await title.locator('.jt-w').evaluateAll((els) => els.every((el) => el.getClientRects().length === 1))).toBe(true);
  // four objects, drawn (no text inside), each with one lit piece
  const objects = page.locator('.hw > li');
  await expect(objects).toHaveCount(4);
  await expect(objects.locator('h3')).toHaveText(['IA aplicada a producto', 'Fullstack, de la interfaz a la base', 'Seguridad y calidad desde el diseño', 'Interfaces con oficio']);
  expect(await objects.evaluateAll((els) => els.map((el) => [el.querySelectorAll('.hw-acc').length, el.querySelectorAll('svg.hw-obj text').length, el.querySelector('svg.hw-obj')!.getAttribute('aria-hidden')]))).toEqual(Array(4).fill([1, 0, 'true']));
  await page.locator('.hw').scrollIntoViewIfNeeded();
  await settle(page, 1400);
  await objects.nth(1).hover();
  expect(await objects.nth(1).locator('.hw-obj').evaluate(ours)).toBe(1);
  expect(await objects.nth(0).locator('.hw-obj').evaluate(ours)).toBe(0);
  await expect.poll(() => objects.nth(1).locator('.hw-acc').evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).f)).toBe(-5);
  // and it stays whole when the pointer leaves: nothing hides
  await page.mouse.move(5, 300);
  await settle(page, 700);
  await expect(objects.nth(1)).toHaveCSS('opacity', '1');
  expect(await objects.nth(1).locator('.hw-obj').evaluate(ours)).toBe(0);
});

test('a featured case plays its clip under the pointer and with its button, and is never downloaded before', async ({ page, browser }) => {
  const spy = () => { const w = window as unknown as { __clip: string[] }; w.__clip = []; const play = HTMLMediaElement.prototype.play, pause = HTMLMediaElement.prototype.pause; HTMLMediaElement.prototype.play = function () { w.__clip.push('play'); return play.call(this).catch(() => {}); }; HTMLMediaElement.prototype.pause = function () { w.__clip.push('pause'); return pause.call(this); }; };
  const calls = (p: Page) => p.evaluate(() => (window as unknown as { __clip: string[] }).__clip.join(' '));
  await page.addInitScript(spy);
  const media: string[] = [];
  page.on('request', (r) => { if (/\.mp4/.test(r.url())) media.push(r.url()); });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/v2/es/');
  const card = page.locator('.hc-card').first();
  await card.scrollIntoViewIfNeeded();
  await settle(page, 1200);
  await expect(card.locator('video')).toHaveAttribute('preload', 'none');
  await expect(card.locator('video')).toHaveAttribute('poster', /complia-demo-poster\.jpg$/);
  expect(media).toEqual([]);
  expect(await calls(page)).toBe('');
  await card.locator('h3').hover();
  await expect.poll(() => calls(page)).toBe('play');
  await page.mouse.move(5, 5);
  await expect.poll(() => calls(page)).toMatch(/^play pause/);
  // the button, for touch and keyboard: a real control with a name
  const button = card.getByRole('button', { name: /Reproducir: CompliA|Pausar: CompliA/ });
  expect((await button.boundingBox())!.width).toBeGreaterThanOrEqual(44);
  await button.click();
  await expect.poll(async () => (await calls(page)).split(' ').filter((c) => c === 'play').length).toBe(2);
  // Tuenti is an illustration, never a capture
  await expect(page.locator('.hc-card').nth(1).locator('img')).toHaveAttribute('src', /tuenti-cover\.svg$/);
  await expect(page.locator('.hc-card').nth(1).locator('video')).toHaveCount(0);
  // reduced motion: the pointer starts nothing; the button still does
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
  const still = await ctx.newPage();
  await still.addInitScript(spy);
  await still.goto('/v2/es/');
  await still.locator('.hc-card').first().scrollIntoViewIfNeeded();
  await still.locator('.hc-card h3').first().hover();
  await settle(still, 400);
  expect(await calls(still)).toBe('');
  await still.locator('.hc-card').first().getByRole('button').click();
  await expect.poll(() => calls(still)).toBe('play');
  await ctx.close();
});

for (const [w, h] of [[360, 740], [820, 1180], [1440, 900]] as const) {
  test(`the home at ${w}×${h}: nothing wider than the screen, nothing under 12 px, targets to touch`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/v2/es/');
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += h) { await page.evaluate((y) => scrollTo(0, y), y); await settle(page, 120); }
    await settle(page, 600);
    const r = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>('main *')) {
        const b = el.getBoundingClientRect();
        if (!b.width || el.closest('.ui-sr, .hm-cap, .sig-light, [aria-hidden="true"]')) continue;
        if (b.right > innerWidth + 1 || b.left < -1) out.push(`wide ${el.className || el.tagName}`);
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
        if (own && parseFloat(getComputedStyle(el).fontSize) < 12) out.push(`small ${el.className || el.tagName}`);
      }
      for (const el of document.querySelectorAll<HTMLElement>('.hm-sec a, .hm-sec button')) {
        if (el.closest('.hc-card h3')) continue; // the card is the target of its name
        const b = el.getBoundingClientRect();
        if (b.height < 44 || b.width < 44) out.push(`target ${el.className} ${Math.round(b.width)}×${Math.round(b.height)}`);
      }
      return { out, over: document.documentElement.scrollWidth - innerWidth, screens: document.documentElement.scrollHeight / innerHeight };
    });
    expect(r.out).toEqual([]);
    expect(r.over).toBeLessThanOrEqual(0);
    if (w === 1440) expect(r.screens).toBeLessThan(5.6);
  });
}

test('through the gate, the opening of the home plays its entrance once', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, storageState: { cookies: [], origins: [] } });
  const page = await ctx.newPage();
  await page.goto('/v2/es/');
  await expect(page.locator('.gk')).toBeVisible();
  await expect(page.locator('.v2-name .jt-l').first()).toHaveCSS('animation-name', 'none');
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).toHaveAttribute('data-entered', 'true');
  await expect(page.locator('.v2-name .jt-l').first()).toHaveCSS('animation-name', 'jt-jump');
  await expect(page.locator('.gt')).toHaveCount(0);
  await expect(page.locator('.v2-name .jt-l').last()).toHaveCSS('opacity', '1');
  await ctx.close();
});
