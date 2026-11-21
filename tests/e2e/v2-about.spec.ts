import { expect, type Page, test } from '@playwright/test';

// Lote 7.1: «Sobre mí» of /v2. The first screen is the recruiter's sheet (role, languages, stack and contact); then
// the story in thirty seconds, the timeline from 2021 to today and the skills as a sky that turns in 3D, where every
// star opens its proofs.

type Sky = { frames: number; yaw: number; mode: string };
const sky = (page: Page) => page.evaluate(() => (window as unknown as { __igSky: () => Sky }).__igSky());
const atRest = async (page: Page) => { await expect.poll(async () => (await sky(page)).mode).toBe('rest'); };

for (const [w, h] of [[1440, 900], [390, 844], [360, 740]] as const) {
  test(`the first screen has the role, the languages, the stack and the contact at ${w}×${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/v2/es/sobre-mi/');
    await expect(page.locator('h1')).toHaveText('De Mar del Plata.');
    const sheet = page.locator('.ab-sheet');
    await expect(sheet.locator('.ui-role')).toHaveText('SrAI Fullstack Developer');
    await expect(sheet).toContainText('Español nativo · Inglés C1');
    await expect(sheet.locator('.ab-stack li')).toHaveCount(9);
    const mail = page.locator('.ab-actions').getByRole('link', { name: 'Escribime' });
    await expect(mail).toHaveAttribute('href', /^mailto:/);
    for (const el of [sheet.locator('.ui-role'), sheet.locator('.ab-facts'), sheet.locator('.ab-stack'), mail, page.getByRole('button', { name: 'Copiar el mail' }), page.locator('.ab-actions').getByRole('link', { name: /LinkedIn/ })]) {
      const b = (await el.boundingBox())!;
      expect(b.y, 'above the fold').toBeGreaterThanOrEqual(0);
      expect(b.y + b.height, 'above the fold').toBeLessThanOrEqual(h);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}

test('«Copiar el mail» copies the address and says so', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/v2/es/sobre-mi/');
  await page.getByRole('button', { name: 'Copiar el mail' }).click();
  await expect(page.locator('.ab-live')).toHaveText('Mail copiado');
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toBe(await page.locator('[data-mail]').innerText());
  expect(text).toMatch(/@/);
});

test('the story in thirty seconds, the three cases and the contact where the header sends', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto('/v2/es/sobre-mi/');
  const beats = page.locator('.ab-story li p');
  await expect(beats).toHaveCount(5);
  const words = (await beats.allInnerTexts()).join(' ').split(/\s+/).length;
  expect(words).toBeLessThanOrEqual(75);
  await expect(page.locator('.ab-case')).toHaveCount(3);
  await expect(page.locator('.ab-case').first()).toHaveAttribute('href', '/v2/es/work/complia/');
  await page.locator('.ab-index').getByRole('link', { name: /Contacto/ }).click();
  await expect(page.locator('#contacto')).toBeInViewport();
  await expect(page.locator('#contacto').getByRole('link', { name: 'Escribime' })).toBeVisible();
});

test('the timeline: a chart from 2021 to today, every stop opens its card, the arrows move along it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/sobre-mi/#recorrido');
  const tl = page.locator('.tl');
  await expect(tl.locator('.tl-btn')).toHaveCount(8);
  await expect(tl.locator('.tl-axis span')).toHaveText(['2021', '2022', '2023', '2024', '2025', '2026', 'Hoy']);
  // TACH sits under 2021 and 2022; Ada under 2023 and 2024
  const x = async (sel: string) => (await tl.locator(sel).boundingBox())!;
  const [y21, y23, tach, ada] = await Promise.all([x('.tl-axis span:nth-child(1)'), x('.tl-axis span:nth-child(3)'), x('[data-stop="tach"]'), x('[data-stop="ada"]')]);
  expect(Math.abs(tach.x - y21.x)).toBeLessThan(8);
  expect(tach.x + tach.width).toBeLessThanOrEqual(y23.x + 1);
  expect(Math.abs(ada.x - y23.x)).toBeLessThan(8);
  // one card at a time, the latest work first
  const card = tl.locator('.tl-card:not([data-off])');
  await expect(card).toHaveCount(1);
  await expect(card.locator('h3')).toHaveText('Productos con IA y un equipo que crece');
  await tl.locator('[data-stop="tach"]').click();
  await expect(card.locator('h3')).toHaveText('Una billetera virtual, de punta a punta');
  await expect(card.locator('.tl-when')).toHaveText('2021 – 2022 · TACH Argentina');
  await expect(card.locator('.tl-stamp')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(tl.locator('[data-stop="ada"]')).toBeFocused();
  await expect(card.locator('h3')).toHaveText('Enseñar a programar');
  await page.keyboard.press('End');
  await expect(card.locator('h3')).toHaveText('Potenciar negocios y automatizar lo difícil');
  await expect(card.getByRole('link', { name: /Ver el caso: Eclipse/ })).toHaveAttribute('href', '/v2/es/work/eclipse/');
});

test('the sky: 27 stars, a constellation turns it to the front, a star opens its proofs, and at rest nothing is drawn', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/sobre-mi/');
  const sk = page.locator('.sk');
  await sk.locator('.sk-stage').scrollIntoViewIfNeeded();
  await expect(sk.locator('.sk-star')).toHaveCount(27);
  await expect(sk.locator('.sk-chip')).toHaveCount(6);
  const stage = (await sk.locator('.sk-stage').boundingBox())!;
  const cx = stage.x + stage.width / 2;
  const dotX = async (name: string) => { const b = (await sk.locator('.sk-star', { hasText: name }).locator('.sk-dot').boundingBox())!; return b.x + b.width / 2; };
  // React opens the page: selected, with its eight proofs
  const card = sk.locator('.sk-cardwrap:not([data-off])');
  await expect(card.locator('h3')).toHaveText('React');
  await expect(card.locator('.sk-proofs li')).toHaveCount(8);
  // the far side is hidden and cannot be clicked
  const rag = sk.locator('.sk-star', { hasText: 'RAG con LLM' });
  await expect(rag).toHaveAttribute('data-back', '');
  // a constellation turns the sky until it faces front
  await sk.getByRole('button', { name: 'IA', exact: true }).click();
  await atRest(page);
  expect((await sky(page)).yaw).toBeCloseTo((120 * Math.PI) / 180, 2);
  await expect(rag).not.toHaveAttribute('data-back', '');
  await expect(card.locator('h3')).toHaveText('RAG con LLM');
  expect(Math.abs((await dotX('RAG con LLM')) - cx)).toBeLessThan(stage.width * 0.2);
  // at rest the sky asks for no frames
  const f0 = (await sky(page)).frames;
  await page.waitForTimeout(1200);
  expect((await sky(page)).frames).toBe(f0);
  // a star: its card, where it comes from, its proofs as links, and the stars used with it
  await sk.locator('.sk-star', { hasText: 'Sistemas con agentes' }).click();
  await atRest(page);
  await expect(card.locator('h3')).toHaveText('Sistemas con agentes');
  await expect(card.locator('.sk-from li')).toHaveText(['De mis proyectos']);
  await expect(card.locator('.sk-proofs a').first()).toHaveAttribute('href', '/v2/es/work/agentes/');
  await expect(card.locator('.sk-proofs a').nth(1)).toHaveAttribute('href', '/v2/es/como-trabajo/');
  expect(Math.abs((await dotX('Sistemas con agentes')) - cx)).toBeLessThan(4);
  await expect(sk.locator('.sk-star[data-kin]')).not.toHaveCount(0);
  // «Se usó junto con» leads to that star
  await card.locator('.sk-kin button', { hasText: 'Claude' }).click();
  await atRest(page);
  await expect(card.locator('h3')).toHaveText('Claude');
  // a star I am studying is hollow and says so
  await sk.locator('.sk-star', { hasText: 'Machine learning' }).click();
  await expect(card.locator('.sk-from li')).toHaveText(['En estudio']);
  await expect(card.locator('.sk-proofs')).toHaveCount(0);
  await expect(sk.locator('.sk-star', { hasText: 'Machine learning' })).toHaveAttribute('data-hollow', '');
});

test('the sky with the keyboard and with a drag', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/sobre-mi/');
  const sk = page.locator('.sk');
  await sk.locator('.sk-stage').scrollIntoViewIfNeeded();
  const card = sk.locator('.sk-cardwrap:not([data-off])');
  // arrows walk the stars; a star reached with the keyboard comes to the front
  await sk.locator('.sk-star').first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(sk.locator('.sk-star').nth(1)).toBeFocused();
  await expect(card.locator('h3')).toHaveText('TypeScript');
  await page.keyboard.press('End');
  await atRest(page);
  await expect(card.locator('h3')).toHaveText('Meshy');
  await expect(sk.locator('.sk-star').last()).not.toHaveAttribute('data-back', '');
  // the two buttons do the same for touch
  await sk.getByRole('button', { name: 'Estrella siguiente' }).click();
  await expect(card.locator('h3')).toHaveText('React');
  await atRest(page);
  // a drag turns the sky and is not a choice
  const stage = (await sk.locator('.sk-stage').boundingBox())!;
  const y0 = (await sky(page)).yaw;
  await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height * 0.8);
  await page.mouse.down();
  await page.mouse.move(stage.x + stage.width / 2 - 220, stage.y + stage.height * 0.8, { steps: 8 });
  await page.mouse.up();
  await atRest(page);
  expect((await sky(page)).yaw).toBeGreaterThan(y0 + 0.3);
  await expect(card.locator('h3')).toHaveText('React');
  const f = (await sky(page)).frames;
  await page.waitForTimeout(800);
  expect((await sky(page)).frames).toBe(f);
});

test('reduced motion: a turn arrives at once; without JavaScript every card is on the page', async ({ browser }) => {
  const calm = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 860 } });
  const page = await calm.newPage();
  await page.goto('/v2/es/sobre-mi/');
  await page.locator('.sk-stage').scrollIntoViewIfNeeded();
  const f0 = (await sky(page)).frames;
  await page.locator('.sk').getByRole('button', { name: 'Producto', exact: true }).click();
  const s = await sky(page);
  expect(s.mode).toBe('rest');
  expect(s.yaw).toBeCloseTo((240 * Math.PI) / 180, 3);
  expect(s.frames).toBe(f0);
  await expect(page.locator('.sk-star', { hasText: 'Compliance' })).not.toHaveAttribute('data-back', '');
  await calm.close();

  const plain = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 860 } });
  const p2 = await plain.newPage();
  await p2.goto('/v2/es/sobre-mi/');
  await expect(p2.locator('.sk-card')).toHaveCount(27);
  for (const c of [p2.locator('.sk-card').first(), p2.locator('.sk-card').last(), p2.locator('.tl-card').first(), p2.locator('.tl-card').last()]) await expect(c).toBeVisible();
  await expect(p2.locator('.sk-bar')).toBeHidden();
  await expect(p2.locator('.tl-chart')).toBeHidden();
  // the sky is already drawn by the server
  await expect(p2.locator('.sk-star', { hasText: 'React' }).first()).toBeVisible();
  await plain.close();
});

test('on a 360 px phone: the timeline is a list, the names of the sky stay inside it, nothing is wider than the screen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/v2/es/sobre-mi/');
  await expect(page.locator('.tl-chart')).toBeHidden();
  await expect(page.locator('.tl-card')).toHaveCount(8);
  await expect(page.locator('.tl-card').nth(1)).toBeVisible();
  const sk = page.locator('.sk');
  await sk.locator('.sk-stage').scrollIntoViewIfNeeded();
  for (const g of ['Interfaces', 'Producto', 'En estudio']) {
    await sk.getByRole('button', { name: g, exact: true }).click();
    await atRest(page);
    const out = await sk.evaluate((el) => {
      const s = el.querySelector('.sk-stage')!.getBoundingClientRect();
      return [...el.querySelectorAll<HTMLElement>('.sk-star')].filter((b) => Number(getComputedStyle(b).opacity) > 0.1 && Number(getComputedStyle(b.querySelector('.sk-name')!).opacity) > 0.1)
        .map((b) => ({ t: b.textContent, r: b.querySelector('.sk-name')!.getBoundingClientRect() })).filter((x) => x.r.left < s.left - 1 || x.r.right > s.right + 1).map((x) => x.t);
    });
    expect(out, g).toEqual([]);
  }
  for (const b of await sk.locator('.sk-chip, .sk-step').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});

test('in English', async ({ page }) => {
  await page.goto('/v2/en/sobre-mi/');
  await expect(page.locator('h1')).toHaveText('From Mar del Plata.');
  await expect(page.locator('.ab-sheet')).toContainText('Native Spanish · English C1');
  await expect(page.locator('.sk-cardwrap:not([data-off]) .sk-from li')).toHaveText(['From work', 'From my projects']);
  await expect(page.locator('.tl-card:not([data-off]) h3')).toHaveText('AI products and a team that grows');
});
