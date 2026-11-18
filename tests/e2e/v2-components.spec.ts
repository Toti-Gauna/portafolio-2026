import { expect, test, type Page } from '@playwright/test';

// Lote 1.3: the base components of /v2, live in /v2/<lang>/componentes/. "Listo cuando": full catalogue,
// keyboard and focus right.

const URL = '/v2/es/componentes/';

/** The focus indicator of the focused element: its outline, its card's (stretched link) or its drawn control's (hidden input). */
async function focusRing(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return { tag: 'body', ok: false };
    const shows = (n: Element | null) => {
      if (!n) return false;
      const s = getComputedStyle(n);
      return (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2) || /0px 0px 0px [2-9]px/.test(s.boxShadow);
    };
    const target =
      el.closest('.ui-card-title') ? el.closest('.ui-card') :
      el.matches('.ui-check input, .ui-switch input, .ui-segmented input') ? el.nextElementSibling : el;
    return { tag: `${el.tagName}.${el.className || (el as HTMLInputElement).type || ''}`, ok: shows(target) };
  });
}

test('the catalogue renders every family of components, with no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(URL);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  for (const id of ['botones', 'chips', 'estados', 'tarjetas', 'formularios', 'navegacion']) await expect(page.locator(`section#${id} h2`)).toHaveCount(1);
  await expect(page.locator('.cat-statuses .ui-status')).toHaveCount(10);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  expect(await page.locator('body').innerText()).not.toMatch(/\bSsr\b|HandyX/);
  expect(errors).toEqual([]);
});

test('system tabs: the current page is marked, tabs lead to the tokens and back, the language keeps the page', async ({ page }) => {
  await page.goto(URL);
  const tabs = page.getByRole('navigation', { name: 'Sistema' });
  await expect(tabs.getByRole('link', { name: 'Componentes' })).toHaveAttribute('aria-current', 'page');
  await tabs.getByRole('link', { name: 'Tokens' }).click();
  await expect(page).toHaveURL(/\/v2\/es\/tokens\/$/);
  await page.getByRole('navigation', { name: 'Sistema' }).getByRole('link', { name: 'Componentes' }).click();
  await page.getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/v2\/en\/componentes\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('every stop of the Tab order shows its focus ring', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);
  const seen: string[] = [];
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    const r = await focusRing(page);
    if (r.tag === 'body') break;
    expect(r.ok, `no visible focus on stop ${i + 1}: ${r.tag}`).toBe(true);
    seen.push(r.tag);
  }
  expect(seen.length).toBeGreaterThan(30);
});

test('controls work with the keyboard: sound, switch, checkbox, segmented, disclosure, form', async ({ page }) => {
  await page.goto(URL);
  // the sound toggle is remembered on this device
  const sound = page.locator('.sh-bar .ui-sound');
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await sound.focus();
  await page.keyboard.press('Enter');
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('.sh-bar .ui-sound')).toHaveAttribute('aria-pressed', 'true');
  // the toggle of the phone menu follows the one of the bar
  await expect(page.locator('.sm .ui-sound')).toHaveAttribute('aria-pressed', 'true');

  const sw = page.getByRole('switch', { name: 'Sonidos de la interfaz' });
  await sw.focus();
  await page.keyboard.press('Space');
  await expect(sw).toBeChecked();

  const box = page.getByRole('checkbox', { name: 'Quiero una copia del mensaje' });
  await box.focus();
  await page.keyboard.press('Space');
  await expect(box).toBeChecked();

  const h = page.getByRole('radio', { name: 'Horizontal' });
  await expect(h).toBeChecked();
  await h.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Vertical' })).toBeChecked();

  const summary = page.locator('.ui-disclosure summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.ui-disclosure')).toHaveAttribute('open', '');
  await expect(page.locator('.ui-disclosure-body')).toBeVisible();

  // the sample form never navigates
  const before = page.url();
  await page.getByRole('button', { name: 'Enviar', exact: true }).last().click();
  await page.waitForTimeout(200);
  expect(page.url()).toBe(before);
});

test('fields: visible labels, hints and errors tied to the control', async ({ page }) => {
  await page.goto(URL);
  const email = page.getByRole('textbox', { name: 'Mail' });
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(email).toHaveAccessibleDescription(/nombre@empresa\.com/);
  await expect(page.getByRole('textbox', { name: 'Nombre' })).toHaveAccessibleDescription('Como quieras que te llame.');
  await expect(page.getByRole('combobox', { name: 'Tema' })).toBeVisible();
});

test('a glass card is one link named by its title, and the whole card opens it', async ({ page }) => {
  await page.goto(URL);
  const card = page.locator('.ui-card').first();
  await expect(card.getByRole('link')).toHaveCount(1);
  await expect(card.getByRole('link')).toHaveAccessibleName('CompliA');
  // a click on the card's text lands on the stretched link that covers the card
  await card.scrollIntoViewIfNeeded();
  const box = (await card.locator('.ui-card-body').boundingBox())!;
  expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('a')?.textContent, [box.x + box.width / 2, box.y + box.height / 2])).toBe('CompliA');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page).toHaveURL(/\/es\/proyectos\/complia\/$/);
});

for (const [w, h] of [[360, 740], [390, 844], [1440, 900]] as const) {
  test(`components at ${w}×${h}: no horizontal scroll, no text under 12 px, targets of 44 px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(URL);
    const r = await page.evaluate(() => {
      const small: string[] = [];
      for (const el of document.querySelectorAll('body *')) {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
        if (own && parseFloat(getComputedStyle(el).fontSize) < 12) small.push(el.className || el.tagName);
      }
      // a card's title link covers the whole card (::after); a field's label sits on a 48 px control
      const tiny = [...document.querySelectorAll<HTMLElement>('a, button, summary, select, textarea, input:not([type=checkbox]):not([type=radio]), .ui-check, .ui-switch, .ui-segmented label')]
        .filter((el) => el.offsetParent && !el.classList.contains('v2-skip') && !el.closest('.ui-card-title'))
        .filter((el) => el.getBoundingClientRect().height < 44)
        .map((el) => el.className || el.tagName);
      return { over: document.documentElement.scrollWidth - window.innerWidth, small, tiny };
    });
    expect(r.over).toBeLessThanOrEqual(0);
    expect(r.small).toEqual([]);
    expect(r.tiny).toEqual([]);
  });
}

test('reduced motion: switches and cards change without transitions', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(URL);
  await expect(page.locator('.ui-switch-track span').first()).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('.ui-card').first()).toHaveCSS('transition-duration', '0s');
  await ctx.close();
});
