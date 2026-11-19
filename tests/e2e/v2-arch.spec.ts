import { expect, type Page, test } from '@playwright/test';

// Lote 5.2: the living architecture of each case. A model on an isometric board; every piece's name is a button:
// pointing at it or focusing it lights it and its connections and opens its card (what it does, what it sends and
// receives). «Seguir el recorrido» walks the connections in order with a packet running along each; ← → step.

const arch = (page: Page) => page.locator('.la');
const dimmed = (page: Page, n: string) => page.locator(`.la-svg .la-node[data-n="${n}"]`).evaluate((el) => Number(getComputedStyle(el).opacity) < 0.5);

test('a piece says what it does and what it is connected to; the rest steps back', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/work/eclipse/');
  const a = arch(page);
  await a.scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { level: 2, name: 'Cuatro repos, un sistema' })).toBeVisible();
  // the API: lit with the pieces it talks to; the visitor, two steps away, steps back
  const api = a.getByRole('button', { name: /API Eclipse-be/ });
  await api.focus();
  await expect(a).toHaveAttribute('data-mode', 'focus');
  const card = a.locator('.la-card');
  await expect(card.locator('.la-card-t')).toHaveText(/API Eclipse-be/);
  await expect(card.locator('.la-card-io')).toHaveCount(2);
  await expect(page.locator('.la-svg .la-node[data-n="api"]')).toHaveAttribute('data-lit', '');
  await expect(page.locator('.la-svg .la-node[data-n="db"]')).toHaveAttribute('data-lit', '');
  await expect.poll(() => dimmed(page, 'visitor')).toBe(true);
  // the card says what each of its connections carries
  await expect(card.locator('.la-card-io').first()).toContainText('transacción');
  // Escape: everything back
  await page.keyboard.press('Escape');
  await expect(a).not.toHaveAttribute('data-mode');
  // with a mouse, pointing at the piece in the drawing is the same as pointing at its name
  const db = page.locator('.la-svg .la-node[data-n="db"]');
  const box = (await db.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(card.locator('.la-card-t')).toHaveText('PostgreSQL');
  await page.mouse.move(5, 5);
  await expect(a).not.toHaveAttribute('data-mode');
});

test('«Seguir el recorrido» walks every connection in order, can pause and step, and stops at the end', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto('/v2/es/work/complia/');
  const a = arch(page);
  await a.scrollIntoViewIfNeeded();
  const total = await page.locator('.la-svg .la-edge').count();
  await a.getByRole('button', { name: 'Seguir el recorrido' }).click();
  const k = a.locator('.la-card-k');
  await expect(k).toHaveText(`Paso 1 de ${total}`);
  // a packet runs on the lit connection
  await expect(page.locator('.la-svg .la-edge[data-run]')).toHaveCount(1);
  // and its label shows what travels on it
  await expect.poll(() => page.locator('.la-tag[data-lit]').evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
  await expect(k).toHaveText(`Paso 2 de ${total}`, { timeout: 4000 });
  await a.getByRole('button', { name: 'Pausar' }).click();
  await page.waitForTimeout(2300);
  await expect(k).toHaveText(`Paso 2 de ${total}`);
  // the arrows of the keyboard step
  await a.getByRole('button', { name: 'Paso siguiente' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(k).toHaveText(`Paso 3 de ${total}`);
  await page.keyboard.press('ArrowLeft');
  await expect(k).toHaveText(`Paso 2 de ${total}`);
  // to the end, and it stays there
  await a.getByRole('button', { name: 'Seguir', exact: true }).click();
  await expect(k).toHaveText(`Paso ${total} de ${total}`, { timeout: 2000 * total });
  await expect(a).not.toHaveAttribute('data-playing');
  await a.getByRole('button', { name: 'Ver todo' }).click();
  await expect(a).not.toHaveAttribute('data-mode');
  // the text version says the whole journey
  await a.locator('.la-text summary').click();
  await expect(a.locator('.la-text ol li')).toHaveCount(total);
});

test('reduced motion: the steps change, and no packet runs', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/v2/es/work/games/');
  const a = arch(page);
  await a.scrollIntoViewIfNeeded();
  await a.getByRole('button', { name: 'Seguir el recorrido' }).click();
  await expect(a.locator('.la-card-k')).toHaveText(/^Paso 1 de/);
  expect(await page.locator('.la-svg').evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
});

test('Tuenti shows no architecture; planned pieces say so', async ({ page }) => {
  await page.goto('/v2/es/work/tuenti/');
  await expect(page.locator('.la')).toHaveCount(0);
  await page.goto('/v2/es/work/velmar/');
  const a = arch(page);
  await a.scrollIntoViewIfNeeded();
  await expect(page.locator('.la-svg .la-node[data-planned]')).toHaveCount(3);
  await a.locator('.la-name[data-n="server"]').focus();
  await expect(a.locator('.la-card .la-planned')).toHaveText('Planificado');
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });
  test('the drawing is the overview and the names are a list under it', async ({ page }) => {
    await page.goto('/v2/es/work/dentalos/');
    const a = arch(page);
    await a.scrollIntoViewIfNeeded();
    await expect(a.locator('.la-name').first()).toBeHidden();
    const chips = a.locator('.la-chip');
    await expect(chips.first()).toBeVisible();
    await chips.nth(2).tap();
    await expect(a).toHaveAttribute('data-mode', 'focus');
    const report = await page.evaluate(() => {
      const tiny: string[] = [], small: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>('.la *')) {
        const cs = getComputedStyle(el);
        if (!el.offsetWidth || cs.display === 'none' || el.closest('svg, .ui-sr, details:not([open]) > :not(summary)')) continue;
        if (el.matches('button, summary') && Math.min(el.offsetWidth, el.offsetHeight) < 44) tiny.push(el.className);
        if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()) && parseFloat(cs.fontSize) < 12) small.push(el.className);
      }
      return { tiny, small, wide: document.documentElement.scrollWidth > innerWidth };
    });
    expect(report).toEqual({ tiny: [], small: [], wide: false });
  });
});

test('in English', async ({ page }) => {
  await page.goto('/v2/en/work/kinetic/');
  const a = arch(page);
  await a.scrollIntoViewIfNeeded();
  await expect(a.getByRole('button', { name: 'Follow the journey' })).toBeVisible();
  await expect(a.locator('.la-text summary')).toHaveText('Read the diagram as text');
});
