import { expect, test } from '@playwright/test';

// Lote 5.4: the design system of four products, read from their repos and shown live in their case.

const SLUGS = ['eclipse', 'volta', 'velmar', 'dentalos'];

test('the system of a product: its themes repaint the canvas, every block links to its lines', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const slug of SLUGS) {
    await page.goto(`/v2/es/work/${slug}/`);
    const sec = page.locator('section', { has: page.locator('#cs-ds') });
    await expect(sec.locator('#cs-ds'), slug).toBeVisible();
    const canvas = sec.locator(`.pds[data-ds="${slug}"]`);
    // the repo link names the repo and the commit, and every citation points at lines of that commit
    const repo = await sec.locator('.dsx-repo').getAttribute('href');
    expect(repo, slug).toMatch(/^https:\/\/github\.com\/Toti-Gauna\/[\w.-]+\/tree\/[0-9a-f]{40}$/);
    const sha = repo!.split('/').pop()!;
    const srcs = await sec.locator('.dsx-src').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    expect(srcs.length, slug).toBeGreaterThan(5);
    for (const h of srcs) expect(h, slug).toMatch(new RegExp(`/blob/${sha}/.+#L\\d+(-L\\d+)?$`));
    // the product's fonts are there
    await page.evaluate(() => document.fonts.ready);
    const fams = await sec.locator('.dsx-specimen').evaluateAll((ps) => ps.map((p) => getComputedStyle(p).fontFamily.split(',')[0].replace(/['"]/g, '').trim()));
    for (const f of fams) expect(await page.evaluate((f) => document.fonts.check(`32px "${f}"`), f), `${slug} ${f}`).toBe(true);
    // a second theme repaints the canvas and the values on the swatches
    const themes = sec.locator('.dsx-theme');
    if ((await themes.count()) > 1) {
      const before = await canvas.evaluate((e) => getComputedStyle(e).backgroundColor);
      const vals = await sec.locator('.dsx-val').allTextContents();
      await themes.nth(1).click();
      await expect(themes.nth(1)).toHaveAttribute('aria-pressed', 'true');
      await expect.poll(() => canvas.evaluate((e) => getComputedStyle(e).backgroundColor), slug).not.toBe(before);
      expect(await sec.locator('.dsx-val').allTextContents(), slug).not.toEqual(vals);
    }
  }
});

test('the specimens are live: press, check and pick do what they say', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  let seen = 0;
  for (const slug of SLUGS) {
    await page.goto(`/v2/es/work/${slug}/`);
    const canvas = page.locator(`.pds[data-ds="${slug}"]`);
    for (const [hook, attr] of [['data-ds-press', 'aria-pressed'], ['data-ds-check', 'aria-checked']] as const) {
      const el = canvas.locator(`[${hook}]`).first();
      if (!(await el.count())) continue;
      const was = await el.getAttribute(attr);
      await el.click();
      await expect(el, `${slug} ${hook}`).toHaveAttribute(attr, was === 'true' ? 'false' : 'true');
      seen++;
    }
    const picks = canvas.locator('[data-ds-pick]:not([disabled])');
    if ((await picks.count()) > 1) {
      const p = picks.nth(1);
      const attr = (await p.getAttribute('aria-selected')) !== null ? 'aria-selected' : 'aria-checked';
      await p.click();
      await expect(p, `${slug} pick`).toHaveAttribute(attr, 'true');
      await expect(picks.nth(0), `${slug} pick`).toHaveAttribute(attr, 'false');
      seen++;
    }
  }
  expect(seen).toBeGreaterThan(2);
});

test('only these four cases carry a system', async ({ page }) => {
  await page.goto('/v2/es/work/complia/');
  await expect(page.locator('#cs-ds')).toHaveCount(0);
  await page.goto('/v2/en/work/dentalos/');
  await expect(page.locator('#cs-ds')).toHaveText(/DentalOS/);
  await expect(page.locator('.dsx-themes')).toHaveAttribute('aria-label', 'Theme');
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });
  test('nothing wider than the screen, and the theme buttons are touchable', async ({ page }) => {
    for (const slug of SLUGS) {
      await page.goto(`/v2/es/work/${slug}/`);
      await page.locator('#cs-ds').scrollIntoViewIfNeeded();
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), slug).toBe(false);
      const small = await page.locator('.dsx-theme, .dsx-try').evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetHeight < 44).length);
      expect(small, slug).toBe(0);
    }
  });
});
