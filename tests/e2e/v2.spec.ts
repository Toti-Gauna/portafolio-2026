import { expect, test } from '@playwright/test';
import tokens from '../../v2/tokens/tokens.json';

// /v2: the new portfolio, built in batches next to the published one. The home is /v2/<locale>/ and the token
// specimen (lote 1.2) lives at /v2/<locale>/tokens/.

test('/v2/ sends the visitor to a language; the home and the token specimen render with no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.addInitScript(() => localStorage.setItem('ig:locale', 'es'));
  await page.goto('/v2/');
  await expect(page).toHaveURL(/\/v2\/es\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Ignacio\s*Gauna/);
  await expect(page.locator('.ui-role')).toContainText('Sr');
  await expect(page.locator('.sig-stack-legend button')).toHaveCount(5);
  expect(await page.locator('body').innerText()).not.toMatch(/\bSsr\b/);
  await page.goto('/v2/es/tokens/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  for (const id of ['color', 'tipografia', 'espacio', 'movimiento', 'profundidad']) await expect(page.locator(`section#${id} h2`)).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Sistema' }).getByRole('link', { name: 'Tokens' })).toHaveAttribute('aria-current', 'page');
  expect(errors).toEqual([]);
});

test('/v2 is never indexed and stays out of the sitemap', async ({ page, request }) => {
  const paths = ['', 'tokens/', 'work/', 'como-trabajo/', 'brand-lab/', 'negocio/', 'sobre-mi/'];
  for (const l of ['es', 'en']) for (const path of paths) {
    await page.goto(`/v2/${l}/${path}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  }
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/v2/');
});

test('the tokens reach the page: CSS variables, fonts, the brand gradient and the solid main action', async ({ page }) => {
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
  // the gradient is for the «Sr»; the main action is solid coral (Ignacio, 18/11/2026)
  await expect(page.locator('.ui-role b').first()).toHaveCSS('background-image', /linear-gradient/);
  await expect(page.locator('.ui-btn--primary').first()).toHaveCSS('background-color', 'rgb(255, 90, 60)');
  await expect(page.locator('.ui-btn--primary').first()).toHaveCSS('box-shadow', 'none');
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
  await page.goto('/v2/en/tokens/');
  const box = page.locator('.v2-motion-input').first();
  await box.focus();
  await page.keyboard.press('Space');
  await expect(box).toBeChecked();
});

for (const [w, h] of [[360, 740], [390, 844], [1440, 900]] as const) {
  test(`no horizontal scroll, no text under 12 px, targets of 44 px at ${w}×${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    for (const path of ['/v2/es/', '/v2/es/tokens/']) {
    await page.goto(path);
    const r = await page.evaluate(() => {
      const small: string[] = [];
      for (const el of document.querySelectorAll('body *')) {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
        if (own && parseFloat(getComputedStyle(el).fontSize) < 12) small.push(el.className || el.tagName);
      }
      const tiny = [...document.querySelectorAll<HTMLElement>('a, button, label')]
        // a glass card is one link stretched over the card: the card is the target
        .filter((el) => el.offsetParent && !el.classList.contains('v2-skip') && !el.closest('.ui-card-title'))
        .map((el) => el.getBoundingClientRect())
        .filter((b) => b.height < 44);
      return { over: document.documentElement.scrollWidth - window.innerWidth, small, tiny: tiny.length };
    });
    expect(r.over, path).toBeLessThanOrEqual(0);
    expect(r.small, path).toEqual([]);
    expect(r.tiny, path).toBe(0);
    }
  });
}

test('reduced motion: the motion demo jumps without a transition', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/v2/es/tokens/');
  await expect(page.locator('.v2-motion-dot').first()).toHaveCSS('transition-duration', '0s');
  await ctx.close();
});
