import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const out = '/tmp/claude-0/-home-user/0b0f30c8-7eab-5440-bdc8-d526d5c379ef/scratchpad/real/';
mkdirSync(out, { recursive: true });
for (const [vname, vp] of [['d', { width: 1440, height: 900 }], ['m', { width: 390, height: 844 }]]) {
  for (const [slug, step] of [['volta','real'],['velmar','real'],['dentalos','real'],['supernova','real'],['games','real'],['lucero','how'],['lucero','real'],['handyx','real'],['trazo','how']]) {
    const ctx = await b.newContext({ viewport: vp });
    const p = await ctx.newPage();
    await p.goto(`http://127.0.0.1:4173/es/proyectos/${slug}/#paso-${step}`);
    const btn = p.getByRole('button', { name: 'Ver portafolio' });
    await btn.waitFor({ timeout: 20000 }).catch(async () => { await p.getByRole('button', { name: 'Saltar' }).first().click(); await btn.waitFor(); });
    await btn.click(); await p.locator('#boot').waitFor({ state: 'hidden' });
    await p.waitForTimeout(500);
    const figs = p.locator(`#paso-${step} figure.dg`);
    const n = await figs.count();
    for (let i = 0; i < n; i++) {
      await figs.nth(i).scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
      await figs.nth(i).screenshot({ path: `${out}${vname}-${slug}-${step}-${i}.png` });
    }
    console.log(vname, slug, step, n);
    await ctx.close();
  }
}
await b.close();
