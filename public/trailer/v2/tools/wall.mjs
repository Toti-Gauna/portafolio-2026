// node public/trailer/v2/tools/wall.mjs   (from the repo root, after `npm run predev` has copied GSAP)
// Makes the stills of the montage wall «Todo, en código.» (js/ig-shots.js): for each shot of the igshots scene and each
// language, the trailer is frozen on the last frame of that shot's cut, the frame (browser bar, phone or full view)
// is captured without its tag and saved as media/wall/<lang>/<id>.webp, 720 px wide. They are pictures of the
// trailer's OWN rebuilt views (no product screenshots). Run it again whenever a view in js/shots/* changes.
// Chromium: CHROMIUM_PATH, or the container's /opt/pw-browsers/chromium, or Playwright's own.
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const PUBLIC = fileURLToPath(new URL('../../../', import.meta.url)); // …/public/
const OUT = fileURLToPath(new URL('../media/wall/', import.meta.url));
const WIDTH = 720;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  try { const body = await readFile(join(PUBLIC, path)); res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/trailer/v2/index.html`;

const exe = process.env.CHROMIUM_PATH ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } }); // the 16:9 stage at scale 1
for (const lang of ['es', 'en']) {
  await page.goto(`${base}?host&lang=${lang}&lite=0&t=0.1`);
  await page.waitForFunction(() => document.documentElement.dataset.trailer === 'ready');
  // the cut list: the igshots scene's start and its shots' lengths
  const cuts = await page.evaluate(() => {
    const { map, D } = window.trailer, at = map.find(m => m.type === 'igshots').start;
    const sc = D.cfg.scenes.find(x => x.type === 'igshots');
    let t = at + (sc.titleDur ?? 1);
    return sc.shots.map(sh => { t += sh.dur || 1; return { id: sh.id, t: t - 0.03 }; });
  });
  await page.addStyleTag({ content: '.ish-tag, #hud, #ig-caps, #grain, #vignette, .bar { visibility: hidden !important; }' });
  await mkdir(join(OUT, lang), { recursive: true });
  for (const { id, t } of cuts) {
    await page.evaluate(t => { window.trailer.tl.seek(t, true); }, t);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.waitForTimeout(300); // fonts and images of the view
    const frame = page.locator(`.ish-frame[data-shot="${id}"]`);
    const png = await frame.screenshot({ animations: 'disabled' });
    const webp = await page.evaluate(async ([b64, w]) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = w; c.height = Math.round(img.height * w / img.width);
      const g = c.getContext('2d');
      g.imageSmoothingQuality = 'high';
      g.drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', 0.82).split(',')[1];
    }, [png.toString('base64'), WIDTH]);
    const file = join(OUT, lang, `${id}.webp`);
    await writeFile(file, Buffer.from(webp, 'base64'));
    console.log(file, `${Math.round(webp.length * 0.75 / 1024)} KB`);
  }
}
await browser.close();
server.close();
