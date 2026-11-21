import { expect, test } from '@playwright/test';

// Lote 7.3: «Cómo trabajo» of /v2. One piece per block: the method as a cycle of six steps, the agentic system as a
// living diagram (seven stations and eleven agents, «Seguir un cambio») and the rules next to their evidence.

test('one piece per block, nothing wider than the screen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/como-trabajo/');
  await expect(page.locator('h1')).toHaveText('Un método y un sistema.');
  for (const [id, piece] of [['metodo', '.mr-ring'], ['sistema', '.af-track'], ['reglas', '.ct-ev']]) {
    await expect(page.locator(`#${id} ${piece}`), id).toHaveCount(1);
    await expect(page.locator(`#${id} ${piece}`), id).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});

test('the method: a step opens its card, the arrows walk the ring, «Recorrer el ciclo» goes round once', async ({ page }) => {
  await page.clock.install();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/como-trabajo/');
  const mr = page.locator('.mr');
  await mr.scrollIntoViewIfNeeded();
  const steps = mr.locator('.mr-steps button');
  await expect(steps).toHaveCount(6);
  await steps.nth(3).click();
  const card = mr.locator('.mr-card');
  await expect(card.locator('h3')).toHaveText('Construir por etapas');
  await expect(card.locator('.mr-did')).toContainText('Eclipse avanza por lotes documentados');
  await expect(mr.locator('.mr-arc[data-on]')).toHaveCount(3);
  await steps.nth(3).focus();
  await page.keyboard.press('ArrowRight');
  await expect(steps.nth(4)).toBeFocused();
  await expect(card.locator('h3')).toHaveText('Mostrar y validar');
  await page.keyboard.press('Home');
  await expect(card.locator('h3')).toHaveText('Entender el problema');
  await card.getByRole('button', { name: 'Recorrer el ciclo' }).click();
  for (let i = 0; i < 6; i++) await page.clock.runFor(1650);
  await expect(card.locator('h3')).toHaveText('Entregar y aprender');
  await expect(mr.locator('.mr-back')).toHaveAttribute('data-on', '');
  await expect(mr.locator('.mr-center em')).toHaveText('Vuelve a empezar');
  await expect(card.getByRole('button', { name: 'Recorrer de nuevo' })).toBeVisible();
});

test('the system: an agent lights its station, a station lights its agents', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/como-trabajo/#sistema');
  const af = page.locator('.af');
  await expect(af.locator('.af-st')).toHaveCount(7);
  await expect(af.locator('.af-ag')).toHaveCount(11);
  await af.getByRole('button', { name: 'Dirección', exact: true }).last().click();
  const card = af.locator('.af-card');
  await expect(card.locator('h3')).toHaveText('Dirección');
  await expect(card).toContainText('Actúa en: Dirección');
  await expect(af.locator('.af-st[data-lit]')).toHaveCount(1);
  await expect(af.locator('.af-st[data-lit] .af-st-t')).toHaveText('Dirección');
  await af.getByRole('button', { name: 'Ciberseguridad' }).click();
  await expect(af.locator('.af-st[data-lit] .af-st-t')).toHaveText('Agentes por rol');
  await af.locator('.af-st', { hasText: 'Agentes por rol' }).click();
  await expect(af.locator('.af-ag[data-lit]')).toHaveCount(10);
  await expect(card).toContainText('Acá trabajan');
  // arrows walk the stations
  await af.locator('.af-st').first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(af.locator('.af-st').nth(1)).toBeFocused();
  await expect(card.locator('h3')).toContainText('Dirección');
});

test('«Seguir un cambio»: the change carries the plan, fails QA once, passes the human gate and is published', async ({ page }) => {
  await page.clock.install();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/v2/es/como-trabajo/');
  const af = page.locator('.af');
  await af.scrollIntoViewIfNeeded();
  await af.getByRole('button', { name: 'Seguir un cambio' }).click();
  await page.clock.runFor(100);
  const card = af.locator('.af-card');
  await expect(card).toContainText('Paso 1 de 9');
  await expect(af.locator('.af-token')).toHaveAttribute('data-on', '');
  for (let i = 0; i < 5; i++) await page.clock.runFor(1750);
  await expect(card).toContainText('Paso 6 de 9');
  await expect(card.locator('.af-carry')).toHaveAttribute('data-fail', '');
  await expect(af.locator('.af-back')).toHaveAttribute('data-on', '');
  await expect(af.locator('.af-st[data-lit] .af-st-t')).toHaveText('Agentes por rol');
  for (let i = 0; i < 4; i++) await page.clock.runFor(1750);
  await expect(card).toContainText('Paso 9 de 9');
  await expect(af.locator('.af-st[data-lit] .af-st-t')).toHaveText('Publicar');
  await expect(af.getByRole('button', { name: 'Seguir otro cambio' })).toBeVisible();
});

test('the rules stand next to the run of 27/10/2026', async ({ page }) => {
  await page.goto('/v2/es/como-trabajo/#reglas');
  const ev = page.locator('.ct-ev');
  await expect(ev.locator('.ct-ladder li')).toHaveCount(3);
  await expect(ev.locator('.ct-run .ui-sr')).toHaveText(['463', '779', '132', '14']);
  await expect(ev.locator('figcaption')).toContainText('27/10/2026');
  await expect(page.locator('.ct-items li')).toHaveCount(7);
});

test('reduced motion and without JavaScript', async ({ browser }) => {
  const calm = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 860 } });
  const page = await calm.newPage();
  await page.goto('/v2/es/como-trabajo/');
  await expect(page.locator('.mr-arc').first()).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('.af-token')).toHaveCSS('transition-duration', '0s');
  await calm.close();
  const plain = await browser.newContext({ javaScriptEnabled: false });
  const p2 = await plain.newPage();
  await p2.goto('/v2/es/como-trabajo/');
  await expect(p2.locator('.mr-all li')).toHaveCount(6);
  await expect(p2.locator('.mr-all')).toBeVisible();
  await expect(p2.locator('.af-follow')).toBeHidden();
  await expect(p2.locator('.af-card')).toBeVisible();
  await plain.close();
});

test('on a 360 px phone: a ring of numbers, the stations in a column, targets of 44 px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/v2/es/como-trabajo/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  await expect(page.locator('.mr-label').first()).toBeHidden();
  const boxes = await page.locator('.af-st').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: Math.round(r.x), y: r.y, h: r.height })));
  expect(new Set(boxes.map((b) => b.x)).size).toBe(1);
  for (const b of await page.locator('.mr-steps button, .af-st, .af-ag, .ct-index a').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
});

test('in English', async ({ page }) => {
  await page.goto('/v2/en/como-trabajo/');
  await expect(page.locator('#metodo h2')).toHaveText('A cycle of six steps.');
  await expect(page.locator('.mr-card h3')).toHaveText('Understand the problem');
  await expect(page.getByRole('button', { name: 'Follow a change' })).toBeVisible();
});
