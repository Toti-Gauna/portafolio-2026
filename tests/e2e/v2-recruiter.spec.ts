import { type Browser, expect, type Locator, type Page, test } from '@playwright/test';

// Lote 9.3: the recruiter test. «Listo cuando: todo encontrado en menos de 60 s.» A cold visit to /v2, past its gate,
// clicking what a person would click: role and seniority, where and which languages, the stack, the contact, the
// experience and the best case. Each fact counts only when it is on screen at that moment. The time a person takes
// to look, read and reach is a model (scratchpad r93/journey.mjs, which also throttles a phone: 38.8 s on a phone and
// 34.3 s on a desktop, 22/11/2026); here the test holds what the page owes that model: few clicks, little scrolling,
// nothing to wait for.

test.use({ storageState: { cookies: [], origins: [] } }); // the gate is on, as for any first visit

const onScreen = (l: Locator) => l.evaluate((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight; });
/** how many screens a person scrolls to bring this to the middle of the screen */
const reach = async (page: Page, l: Locator) => {
  const screens = await l.evaluate((el) => Math.max(0, el.getBoundingClientRect().top - innerHeight * 0.25) / innerHeight);
  await l.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  return screens;
};

const journey = async (browser: Browser, phone: boolean) => {
  const ctx = await browser.newContext(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const started = Date.now();
  let clicks = 0, scrolled = 0;
  const click = async (l: Locator) => { clicks += 1; await l.click(); };
  const seen = async (l: Locator, what: string) => { await expect(l).toBeVisible(); expect(await onScreen(l), `${what} on screen`).toBe(true); };

  await page.goto('/v2/es/');
  // the gate's «Ver portafolio» is there from the first frame
  await click(page.locator('[data-gate-enter]').first());
  await expect(page.locator('html')).toHaveAttribute('data-gate', 'off');
  // 1. role and seniority, on the first screen
  await seen(page.locator('.v2-hero').getByText('AI Fullstack Developer').first(), 'role');
  await seen(page.locator('.v2-hero').getByText('Sr', { exact: true }).first(), 'seniority');
  // 2. «Sobre mí»: in the header on a desktop, in the menu on a phone
  if (phone) {
    await click(page.getByRole('button', { name: 'Menú', exact: true }));
    await click(page.locator('dialog.sm').getByRole('link', { name: /Sobre mí/ }));
  } else await click(page.locator('.sh-nav').getByRole('link', { name: 'Sobre mí', exact: true }));
  await expect(page).toHaveURL(/\/v2\/es\/sobre-mi\/$/);
  // 3. where, languages, the stack and the contact: all on its first screen
  const main = page.locator('main');
  await seen(main.getByText('Mar del Plata, Argentina').first(), 'where');
  await seen(main.getByText('Español nativo · Inglés C1').first(), 'languages');
  await seen(main.getByText('RAG con LLM', { exact: true }).first(), 'stack');
  await seen(main.getByRole('link', { name: /Escribime/ }).first(), 'write');
  await seen(main.getByRole('link', { name: /LinkedIn/ }).first(), 'LinkedIn');
  // 4. the experience: right under it
  const today = main.getByText('En Tsoft, desde 2024').first();
  scrolled += await reach(page, today);
  await seen(today, 'today');
  await seen(main.getByText(/TACH Argentina \(2021 – 2022\)/).first(), 'before');
  // 5. the best case: the three cases come right after the story, then its own page
  const complia = page.locator('#casos').getByRole('link', { name: /CompliA/ });
  scrolled += await reach(page, complia);
  await click(complia);
  await expect(page).toHaveURL(/\/v2\/es\/work\/complia\/$/);
  await seen(page.locator('.cf-title'), 'the case');
  await seen(page.locator('.cf-line'), 'what it is');
  await expect(page.locator('.cf-status')).toContainText('En producción interna');
  const waited = (Date.now() - started) / 1000;
  await ctx.close();
  return { clicks, scrolled, waited };
};

test('a recruiter on a phone finds everything in five taps and under three screens of scrolling', async ({ browser }) => {
  const r = await journey(browser, true);
  expect(r.clicks).toBeLessThanOrEqual(5);
  expect(r.scrolled).toBeLessThan(3);
  // what the page itself made the visitor wait for, with no time to read: a small part of the 60 s
  expect(r.waited).toBeLessThan(20);
});

test('a recruiter on a desktop finds everything in four clicks and under three screens of scrolling', async ({ browser }) => {
  const r = await journey(browser, false);
  expect(r.clicks).toBeLessThanOrEqual(4);
  expect(r.scrolled).toBeLessThan(3);
  expect(r.waited).toBeLessThan(20);
});

test('on «Sobre mí» the three cases come right after the story, in the page and in its index', async ({ page }) => {
  await page.goto('/v2/es/sobre-mi/');
  const ids = await page.locator('main section.ab-sec[id]').evaluateAll((s) => s.map((x) => x.id));
  expect(ids).toEqual(['historia', 'casos', 'recorrido', 'capacidades', 'contacto']);
  await expect(page.locator('.ab-index a')).toHaveText([/Historia/, /Casos/, /Recorrido/, /Capacidades/, /Contacto/]);
});

test('a tap on «Menú» before the page is interactive is not lost: the menu opens as soon as the header is live', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  // hold the scripts back, as a slow phone would
  let release!: () => void;
  const gate = new Promise<void>((r) => { release = r; });
  await page.route(/\/_next\/static\/chunks\/.*\.js$/, async (route) => { await gate; await route.continue(); });
  await page.goto('/v2/es/sobre-mi/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Menú', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-menu-asked', '1');
  await expect(page.locator('dialog.sm')).not.toHaveAttribute('open');
  release();
  await expect(page.locator('dialog.sm')).toHaveAttribute('open', '');
  await expect(page.locator('html')).not.toHaveAttribute('data-menu-asked');
  await expect(page.locator('dialog.sm').getByRole('link', { name: /Sobre mí/ })).toBeVisible();
  await ctx.close();
});
