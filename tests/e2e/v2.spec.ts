import { expect, test } from '@playwright/test';
import tokens from '../../v2/tokens/tokens.json';

// /v2: the new portfolio, built in batches next to the published one (lote 1.2: the token specimen).

test('/v2/ sends the visitor to a language, and /v2/es/ renders the specimen with no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.addInitScript(() => localStorage.setItem('ig:locale', 'es'));
  await page.goto('/v2/');
  await expect(page).toHaveURL(/\/v2\/es\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Ignacio\s*Gauna/);
  await expect(page.locator('.v2-role')).toContainText('Sr');
  for (const id of ['color', 'tipografia', 'espacio', 'movimiento', 'profundidad']) await expect(page.locator(`section#${id} h2`)).toHaveCount(1);
  await expect(page.locator('.v2-stack-legend li')).toHaveCount(5);
  expect(await page.locator('body').innerText()).not.toMatch(/\bSsr\b/);
  expect(errors).toEqual([]);
});

test('/v2 is never indexed and stays out of the sitemap', async ({ page, request }) => {
  for (const l of ['es', 'en']) {
    await page.goto(`/v2/${l}/`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  }
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/v2/');
});

test('the tokens reach the page: CSS variables, fonts and the brand gradient', async ({ page }) => {
  await page.goto('/v2/es/');
  const v = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return { bg: s.getPropertyValue('--color-bg').trim(), ease: s.getPropertyValue('--motion-ease').trim(), body: getComputedStyle(document.body).fontFamily };
  });
  expect(v.bg).toBe(tokens.color.bg);
  expect(v.ease).toBe(tokens.motion.ease);
  // the next/font family, not a serif fallback
  expect(v.body).not.toMatch(/^"?Times/);
  expect(v.body.toLowerCase()).toContain('archivo');
  await expect(page.locator('.v2-btn-primary')).toHaveCSS('background-image', /linear-gradient/);
});

test('language switch, keyboard focus and the motion rows', async ({ page }) => {
  await page.goto('/v2/es/');
  await page.getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/v2\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('link', { name: 'Meet Ignacio' })).toBeVisible();
  // the first Tab lands on the skip link, visible and outlined
  await page.keyboard.press('Tab');
  const skip = page.locator('.v2-skip');
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  // a motion row switches with the keyboard
  const box = page.locator('.v2-motion-input').first();
  await box.focus();
  await page.keyboard.press('Space');
  await expect(box).toBeChecked();
});

for (const [w, h] of [[360, 740], [390, 844], [1440, 900]] as const) {
  test(`no horizontal scroll, no text under 12 px, targets of 44 px at ${w}×${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/v2/es/');
    const r = await page.evaluate(() => {
      const small: string[] = [];
      for (const el of document.querySelectorAll('body *')) {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
        if (own && parseFloat(getComputedStyle(el).fontSize) < 12) small.push(el.className || el.tagName);
      }
      const tiny = [...document.querySelectorAll<HTMLElement>('a, button, label')]
        .filter((el) => el.offsetParent && !el.classList.contains('v2-skip'))
        .map((el) => el.getBoundingClientRect())
        .filter((b) => b.height < 44);
      return { over: document.documentElement.scrollWidth - window.innerWidth, small, tiny: tiny.length };
    });
    expect(r.over).toBeLessThanOrEqual(0);
    expect(r.small).toEqual([]);
    expect(r.tiny).toBe(0);
  });
}

test('reduced motion: the motion demo jumps without a transition', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/v2/es/');
  await expect(page.locator('.v2-motion-dot').first()).toHaveCSS('transition-duration', '0s');
  await ctx.close();
});
