import { expect, test, type Page } from '@playwright/test';

async function enter(page: Page, url: string) {
  await page.goto(url);
  await expect(async () => {
    if (await page.getByRole('button', { name: 'Ver portafolio' }).isVisible()) return;
    await page.getByRole('button', { name: 'Saltar' }).first().click({ timeout: 500 });
    await expect(page.getByRole('button', { name: 'Ver portafolio' })).toBeVisible({ timeout: 500 });
  }).toPass();
  await page.getByRole('button', { name: 'Ver portafolio' }).click();
  await expect(page.locator('#boot')).toBeHidden();
  await expect(page.locator('#app-shell')).not.toHaveAttribute('inert', '');
  await page.waitForTimeout(300);
}
const visiblePanels = (page: Page) => page.locator('.cstep:visible');
const side = (page: Page) => page.locator('.csteps__side');

test('steps: one panel at a time; a click on the column changes the step, the hash and the focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/proyectos/eclipse/');
  await expect(visiblePanels(page)).toHaveCount(1);
  await expect(page.locator('#paso-what')).toBeVisible();
  await expect(side(page).locator('a[aria-current="step"]')).toContainText('Qué es');
  await side(page).getByRole('link', { name: /Cómo funciona/ }).click();
  await expect(page.locator('#paso-how')).toBeVisible();
  await expect(visiblePanels(page)).toHaveCount(1);
  await expect(side(page).locator('a[aria-current="step"]')).toContainText('Cómo funciona');
  expect(new URL(page.url()).hash).toBe('#paso-how');
  await expect(page.locator('#h-paso-how')).toBeFocused();
});

test('steps: the links at the end of a panel go to the neighbours', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/proyectos/complia/');
  await page.locator('#paso-what .cstep__next').click();
  await expect(page.locator('#paso-how')).toBeVisible();
  await page.locator('#paso-how .cstep__prev').click();
  await expect(page.locator('#paso-what')).toBeVisible();
  // the last step has no «next» link
  await side(page).locator('a').last().click();
  await expect(page.locator('#paso-status')).toBeVisible();
  await expect(page.locator('#paso-status .cstep__next')).toHaveCount(0);
});

test('steps: opening with #paso-how shows that step, and an id inside a panel opens its panel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/proyectos/eclipse/#paso-how');
  await expect(page.locator('#paso-how')).toBeVisible();
  await expect(visiblePanels(page)).toHaveCount(1);
  await page.goto('/es/proyectos/eclipse/#security');
  await expect(page.locator('#paso-security')).toBeVisible();
});

test('steps: headings are h1 > h2 (step) > h3 (section) > h4 (inner titles)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/proyectos/eclipse/');
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('#paso-what > h2.cstep__h')).toBeVisible();
  await expect(page.locator('#paso-what h3').first()).toBeVisible();
  await side(page).getByRole('link', { name: /Decisiones/ }).click();
  await expect(page.locator('#paso-decisions h4').first()).toBeVisible();
  await expect(page.locator('#paso-decisions h2')).toHaveCount(1);
});

test('steps: the longest step of Eclipse is much shorter than the old long page (about 23,000 px)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page, '/es/proyectos/eclipse/');
  let max = 0;
  const n = await side(page).locator('a').count();
  for (let i = 0; i < n; i++) {
    await side(page).locator('a').nth(i).click();
    await page.waitForTimeout(450);
    max = Math.max(max, await page.evaluate(() => document.documentElement.scrollHeight));
  }
  console.log('Eclipse, longest page (px):', max);
  expect(max).toBeLessThan(16000);
});

test('steps: mobile bar with «Paso n de N», 44 px buttons and the full list; no horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await enter(page, '/es/proyectos/complia/');
  const bar = page.locator('.csteps__bar');
  await expect(bar).toBeVisible();
  await expect(side(page)).toBeHidden();
  await expect(bar.locator('.csteps__now')).toContainText('Paso 1 de 6');
  for (const b of await bar.locator('.csteps__btn').all()) {
    const box = (await b.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await expect(bar.getByRole('button', { name: 'Paso anterior' })).toBeDisabled();
  await bar.getByRole('button', { name: 'Paso siguiente' }).click();
  await expect(bar.locator('.csteps__now')).toContainText('Paso 2 de 6');
  await expect(page.locator('#paso-how')).toBeVisible();
  await bar.locator('summary').click();
  await bar.locator('.csteps__list a').last().click();
  await expect(page.locator('#paso-status')).toBeVisible();
  await expect(bar.locator('.csteps__now')).toContainText('Paso 6 de 6');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('steps: reduced motion has no translation on the entering panel', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await enter(page, '/es/proyectos/complia/');
  await side(page).getByRole('link', { name: /Cómo funciona/ }).click();
  await expect(page.locator('#paso-how')).toBeVisible();
  expect(await page.locator('#paso-how').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  await ctx.close();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('every step shows, one below the other, and the column is an index of links', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/es/proyectos/complia/');
    await expect(page.locator('.cstep')).toHaveCount(6);
    for (const p of await page.locator('.cstep').all()) await expect(p).toBeVisible();
    await expect(side(page).locator('a[href^="#paso-"]')).toHaveCount(6);
  });
});

test('real step (Ola 7b): the demos say what is in the repo and what is a proposal, with their diagram', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const badges: Record<string, RegExp> = {
    volta: /Diseño planificado/i, velmar: /Diseño planificado/i, dentalos: /Propuesta mía/i,
    supernova: /Ejemplo de backend/i, games: /Propuesta mía/i, lucero: /Diseño planificado/i, handyx: /Diseño decidido/i,
  };
  for (const [slug, badge] of Object.entries(badges)) {
    await enter(page, `/es/proyectos/${slug}/#paso-real`);
    await expect(page.locator('#paso-real')).toBeVisible();
    await expect(page.locator('#paso-real .dg__badge').first(), slug).toHaveText(badge);
    await expect(page.locator('#paso-real figure.dg').first(), slug).toBeVisible();
    await expect(side(page).locator('a[aria-current="step"]'), slug).toContainText('Cómo se implementa de verdad');
  }
});

test('new cases: HandyX, Lucero and Trazo exist; Trazo has no «real» step and none links to a repo', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const slug of ['handyx', 'lucero', 'trazo']) {
    await enter(page, `/es/proyectos/${slug}/`);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('main a[href*="github.com/Toti-Gauna"]'), slug).toHaveCount(0);
  }
  await expect(side(page).locator('a[href="#paso-real"]')).toHaveCount(0);
});
