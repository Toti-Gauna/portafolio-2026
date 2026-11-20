import { expect, type Page, test } from '@playwright/test';

// Lote 6.1: the Brand Lab of /v2. A wall of eight brands, each told apart without its name, and a page per brand:
// the logo that draws itself, its construction grid, colour, type, patterns, its pieces and the brand in 3D.

const BRANDS = ['ig', 'eclipse', 'velmar', 'volta', 'brisa', 'lucero', 'sereno', 'brote'];
const pose = (page: Page) => page.locator('.tt-obj').evaluate((e) => (e as HTMLElement).style.transform);

test('the wall: eight brands in eight fields, also with their names hidden', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/brand-lab/');
  const tiles = page.locator('.blw-tile');
  await expect(tiles).toHaveCount(BRANDS.length);
  // every tile is its brand: no two share a field and an accent, nor a display face
  const looks = await tiles.evaluateAll((els) => els.map((e) => {
    const cs = getComputedStyle(e);
    return `${cs.backgroundColor} ${cs.getPropertyValue('--m-accent').trim()} | ${getComputedStyle(e.querySelector('.blw-aa')!).fontFamily} ${getComputedStyle(e.querySelector('.blw-aa')!).fontStyle} ${cs.getPropertyValue('--bl-ht').trim()}`;
  }));
  expect(new Set(looks.map((l) => l.split(' | ')[0])).size).toBe(BRANDS.length);
  expect(new Set(looks.map((l) => l.split(' | ')[1])).size).toBe(BRANDS.length);
  // «Solo forma y color»: the names go, the links keep theirs
  const blind = page.getByRole('button', { name: 'Solo forma y color' });
  await blind.click();
  await expect(blind).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.blw-name').first()).toBeHidden();
  await expect(page.getByRole('link', { name: /^Volta · Ejercicio de marca$/ })).toBeVisible();
  await blind.click();
  await expect(page.locator('.blw-name').first()).toBeVisible();
  // a tile opens its brand
  await page.getByRole('link', { name: /^Velmar · / }).click();
  await expect(page).toHaveURL(/\/v2\/es\/brand-lab\/velmar\/$/);
  await expect(page.locator('h1')).toHaveText('Velmar');
  await expect(page.locator('.bl-kind b')).toHaveText('Marca de un cliente');
});

test('a brand, whole: its own fields and fonts, every block with its origin, and the brands next to it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  for (const id of BRANDS) {
    await page.goto(`/v2/es/brand-lab/${id}/`);
    const board = page.locator(`.bl[data-brand="${id}"]`);
    await expect(board.locator('h1'), id).toBeVisible();
    await expect(board.locator('.bl-sec[data-k]'), id).toHaveCount(7);
    await expect(board.locator('.bl-origin'), id).toHaveCount(7);
    // the two fields are the brand's own, and they alternate
    const [m, a] = await Promise.all(['.bl-cover', '.bl-sec[data-k="build"]'].map((s) => board.locator(s).evaluate((e) => getComputedStyle(e).backgroundColor)));
    expect(m, id).not.toBe(a);
    // its fonts arrived
    await page.evaluate(() => document.fonts.ready);
    for (const f of await board.locator('.bl-type li').evaluateAll((ls) => ls.map((l) => getComputedStyle(l).fontFamily.split(',').map((x) => x.trim().replace(/['"]/g, '')).find((x) => !x.startsWith('var(')) ?? ''))) {
      expect(await page.evaluate((fam) => document.fonts.check(`32px "${fam}"`), f), `${id} ${f}`).toBe(true);
    }
    // the rail names where we are; the brands next to it are one click away
    await expect(page.locator('.blr-chip'), id).toHaveCount(BRANDS.length);
    await expect(page.locator('.blr-chip[aria-current="page"]'), id).toHaveCount(1);
    const i = BRANDS.indexOf(id);
    await expect(page.locator('.blp-next[rel="next"]'), id).toHaveAttribute('href', new RegExp(`/brand-lab/${BRANDS[(i + 1) % BRANDS.length]}/$`));
    // ids are unique in the page (gradients and clips of one drawing never leak into another)
    const dup = await page.evaluate(() => { const ids = [...document.querySelectorAll('main [id]')].map((e) => e.id); return ids.filter((x, k) => ids.indexOf(x) !== k); });
    expect(dup, id).toEqual([]);
  }
});

test('the logo draws itself once, draws again on request, and its grid comes and goes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto('/v2/es/brand-lab/ig/');
  const cover = page.locator('.bl-logo[data-mode="cover"]');
  await expect(cover).toHaveAttribute('data-anim', 'play');
  const drawn = () => cover.locator('.bl-draw').first().evaluate((e) => getComputedStyle(e).strokeDashoffset);
  await expect.poll(drawn, { timeout: 4000 }).toBe('0px');
  await page.getByRole('button', { name: 'Volver a dibujar' }).click();
  expect(await cover.locator('.bl-draw').first().evaluate((e) => e.getAnimations().length)).toBeGreaterThan(0);
  await expect.poll(drawn, { timeout: 4000 }).toBe('0px');
  // the grid is on to begin with; the button takes it away
  const stage = page.locator('.bl-logo[data-mode="grid"]');
  const grid = page.getByRole('button', { name: 'Grilla' });
  await expect(grid).toHaveAttribute('aria-pressed', 'true');
  await expect(stage.locator('.bl-grid')).toHaveCSS('opacity', '1');
  await grid.click();
  await expect(grid).toHaveAttribute('aria-pressed', 'false');
  await expect(stage.locator('.bl-grid')).toHaveCSS('opacity', '0');
});

test('the brand in 3D turns with the pointer, with the keyboard, and asks for nothing at rest', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  for (const id of ['ig', 'volta']) { // a box and a can
    await page.goto(`/v2/es/brand-lab/${id}/`);
    const space = page.locator('.tt-space');
    await space.scrollIntoViewIfNeeded();
    const rest = await pose(page);
    const box = (await space.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 10, { steps: 6 });
    await page.mouse.up();
    expect(await pose(page), id).not.toBe(rest);
    // faces take the light as they turn
    const lit = await page.locator('.tt-face').evaluateAll((fs) => new Set(fs.map((f) => (f as HTMLElement).style.getPropertyValue('--sh'))).size);
    expect(lit, id).toBeGreaterThan(2);
    // it coasts and stops: then, not a frame
    await page.waitForTimeout(2500);
    const frames = await page.evaluate(() => new Promise<number>((res) => {
      let n = 0; const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) => { n++; return raf(cb); };
      setTimeout(() => res(n), 1000);
    }));
    expect(frames, id).toBe(0);
    // the keyboard: its slider, and back to the starting view
    await page.getByRole('button', { name: 'Vista inicial' }).click();
    expect(await pose(page), id).toBe(rest);
    const slider = page.getByRole('slider', { name: 'Girar' });
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    expect(await pose(page), id).not.toBe(rest);
  }
});

test('without JavaScript, and with reduced motion, every brand is finished and still', async ({ browser }) => {
  for (const opts of [{ javaScriptEnabled: false }, { reducedMotion: 'reduce' as const }]) {
    const ctx = await browser.newContext({ ...opts, viewport: { width: 1280, height: 860 } });
    const page = await ctx.newPage();
    await page.goto('/v2/es/brand-lab/lucero/');
    const cover = page.locator('.bl-logo[data-mode="cover"]');
    await page.waitForTimeout(400);
    expect(await cover.locator('.bl-draw, .bl-fill').evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity !== '1' || !['0px', '0', 'none'].includes(getComputedStyle(e).strokeDashoffset)).length), JSON.stringify(opts)).toBe(0);
    await expect(page.locator('.bl-grid').first()).toHaveCSS('opacity', '1');
    await expect(page.locator('.tt-obj')).toHaveAttribute('style', /rotateX\(-16deg\) rotateY\(-32deg\)/);
    await expect(page.locator('.blr-chip')).toHaveCount(BRANDS.length);
    await ctx.close();
  }
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });
  test('nothing wider than the screen, text that can be read, controls that can be touched', async ({ page }) => {
    for (const id of ['', ...BRANDS]) {
      await page.goto(`/v2/es/brand-lab/${id ? `${id}/` : ''}`);
      await page.evaluate(() => document.fonts.ready);
      const report = await page.evaluate(() => {
        const small: string[] = [], tiny: string[] = [];
        for (const t of document.querySelectorAll<SVGTextElement>('main svg text')) {
          const svg = t.ownerSVGElement!, vb = svg.viewBox.baseVal, w = svg.getBoundingClientRect().width;
          if (!w || !vb.width || svg.closest('[aria-hidden="true"]:not(.tt-obj)')) continue;
          const px = parseFloat(getComputedStyle(t).fontSize) * (w / vb.width);
          if (px < 11.9 && !svg.closest('.tt-obj')) small.push(`${t.textContent!.slice(0, 20)} ${px.toFixed(1)}`);
        }
        for (const el of document.querySelectorAll<HTMLElement>('main button, main a, main input')) {
          if (el.offsetWidth && Math.min(el.offsetWidth, el.offsetHeight) < 44) tiny.push(`${el.className}: ${el.textContent!.slice(0, 16)}`);
        }
        return { small, tiny, wide: document.documentElement.scrollWidth > innerWidth };
      });
      expect(report, id || 'wall').toEqual({ small: [], tiny: [], wide: false });
    }
  });
});

test('in English', async ({ page }) => {
  await page.goto('/v2/en/brand-lab/');
  await expect(page.getByRole('button', { name: 'Shape and colour only' })).toBeVisible();
  await page.goto('/v2/en/brand-lab/sereno/');
  await expect(page.locator('.bl-kind b')).toHaveText('Brand exercise');
  await expect(page.getByRole('heading', { name: 'Construction' })).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Turn' })).toBeVisible();
});
