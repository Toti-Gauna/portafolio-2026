// Builds the files of the «Sistema IG» design system (a Claude Design System artifact) from the /v2 sources.
//
//   npm run build && python3 -m http.server 4199 -d out &
//   node design/v2/build.mjs --base http://127.0.0.1:4199 --out <folder> [--blobs <folder>/blobs.json]
//
// Writes <folder>/project/… : tokens.json (from v2/tokens/tokens.json), README.md and ilustracion.md (from this
// folder), components/bundle.css (the /v2 stylesheets), one preview.html + README.md per component (the HTML the
// component renders on /v2, copied as is), the cover, and the icons, logos and stamps as SVG files under assets/.
// Assets are uploaded to the artifact (they become /_blob/<id>); pass the ids in blobs.json ({"assets/Icons/x.svg":
// {"blob":"<id>"}}) and the index, project/design-system.json, is written too.
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { COMPONENTS } from './components.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://127.0.0.1:4199');
const OUT = join(arg('out', join(ROOT, '.ds')), 'project');
const BLOBS = arg('blobs');
const TITLE = 'Sistema IG';

const put = (rel, text) => { const p = join(OUT, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); };
const src = JSON.parse(readFileSync(join(ROOT, 'v2/tokens/tokens.json'), 'utf8'));
const C = src.color, LY = src.layer;

// ── tokens.json ──────────────────────────────────────────────────────────────
// Names keep the site's CSS variable names (minus the leading --), so `--color-bg` is the same here and in /v2.
const COLOR_USAGE = {
  'ink-950': 'El índigo más hondo: el pie y el fondo de las escenas.', 'ink-900': 'El índigo de la página (`color-bg`).', 'ink-850': 'Texto sobre la acción de marca (`color-on-accent`) y fondo de los campos.',
  'ink-800': 'Superficie de paneles (`color-surface`).', 'ink-700': 'Superficie elevada (`color-surface-raised`) y teclas.', 'ink-600': 'Pista del interruptor apagado.',
  white: 'Títulos (`color-heading`).', paper: 'Relleno de lo encendido: el idioma actual, el botón de ícono activo.', 'mist-100': 'Texto de cuerpo (`color-text`) y bajadas.',
  'mist-200': 'Texto del pie y flechas de los selectores.', 'mist-300': 'Texto secundario (`color-text-muted`); borde de controles al pasar el puntero.', 'mist-400': 'Rótulos (`color-text-subtle`).',
  'mist-500': 'Decoración (`color-text-faint`): no pasa AA, nunca texto que haya que leer.',
  'amber-500': 'Capa «planificación y ejecución» y anillo de foco (`color-focus`).', 'amber-300': 'Final del degradado de la capa de planificación.',
  'coral-ig': 'El coral de IG, la raíz del espectro.', 'coral-500': 'Acción principal (`color-accent`), el punto del monograma y el acento de los íconos.', 'coral-400': 'Errores (`color-danger`): texto y borde.',
  'orange-400': 'Final del degradado de la capa de código.', 'pink-500': 'Capa «agentes» y final de `gradient-brand`.', 'pink-400': 'Estado «Prototipo».', 'lilac-400': 'Estado «Demo» y final de la capa de agentes.',
  'mint-500': 'Capa «tests», éxito (`color-success`), casillas e interruptores encendidos.', 'lime-400': 'Final del degradado de la capa de tests.',
  'blue-ig': 'El azul de IG. 3,5:1 sobre el fondo: solo rellenos y trazos, nunca texto.', 'blue-500': 'Capa «deploy».', 'blue-400': 'Código en línea y estado «MVP».', 'cyan-400': 'Estado «Laboratorio» y final de la capa de deploy.',
  bg: 'Fondo de la página.', 'bg-deep': 'Fondo del pie, del reproductor y de la luz del cursor.', surface: 'Paneles, muestras y tarjetas.', 'surface-raised': 'Lo que flota más alto: paneles 3D, teclas.',
  line: 'Bordes de tarjetas y separadores.', 'line-strong': 'Bordes de controles (botones de vidrio, campos, idioma).', glass: 'Relleno de vidrio de botones y chips.',
  heading: 'Títulos sobre `color-bg`, `color-surface` y `color-surface-raised`.', text: 'Cuerpo sobre `color-bg`, `color-surface` y `color-surface-raised`.',
  'text-muted': 'Texto secundario sobre `color-bg`, `color-surface` y `color-surface-raised`.', 'text-subtle': 'Rótulos sobre `color-bg`, `color-surface` y `color-surface-raised`.',
  'text-faint': 'Solo decoración (números de línea, guías): 3,7:1, no pasa AA.', accent: 'Acción principal; con `color-on-accent` encima.', 'on-accent': 'Texto sobre `gradient-brand`, `color-accent` y los rellenos claros.',
  focus: 'Anillo de foco: sólido, 2 px, a 3 px; 3:1 sobre el fondo y el botón de marca.', success: 'Lo que pasa: la franja del calibre, el estado en producción.', warning: 'Lo que está en construcción.', danger: 'Errores de formulario y lo que vuelve a ajuste.',
};
const LAYER_NAMES = { plan: 'planificación y ejecución', code: 'código', agents: 'agentes', tests: 'tests', ship: 'deploy' };
const px = (s) => Number(String(s).replace(/px$/, ''));
const maxOfClamp = (s) => (s.startsWith('clamp(') ? s.slice(6, -1).split(',').pop().trim() : s);
const T = src.type;
const style = (name, k, usage, extra = {}) => ({
  name, fontSize: maxOfClamp(T[`${k}-size`]), ...(T[`${k}-lh`] ? { lineHeight: Number(T[`${k}-lh`]) } : {}), ...(T[`${k}-weight`] ? { fontWeight: Number(T[`${k}-weight`]) } : {}),
  ...(T[`${k}-tracking`] ? { letterSpacing: T[`${k}-tracking`] } : {}), usage, ...extra,
});

const tokens = {
  name: TITLE,
  version: 1,
  color: {
    themes: [{ id: 'indigo', name: 'Índigo' }],
    tokens: [
      ...Object.entries(C).map(([k, v]) => ({ name: `color-${k}`, value: v, usage: COLOR_USAGE[k] ?? '' })),
      ...Object.entries(LY).map(([k, v]) => { const [id, end] = k.split('-'); return { name: `layer-${k}`, value: v, usage: `Capa «${LAYER_NAMES[id]}»: ${end === 'from' ? 'su color (rótulos, bordes, números) y el inicio de su degradado' : 'el final de su degradado'}.` }; }),
    ],
  },
  type: {
    fonts: [],
    families: { sans: 'Archivo, "Helvetica Neue", Arial, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace' },
    groups: [
      { name: 'Títulos', family: 'sans', styles: [
        style('display', 'display', 'El nombre en el inicio, ancho 112. En la web: de 68 px (celular) a 128 px.', { sample: 'Ignacio Gauna' }),
        style('h1', 'h1', 'Título de página, ancho 112. En la web: de 40 a 72 px.', { sample: 'Software que llega a producción' }),
        style('h2', 'h2', 'Título de sección, ancho 108. En la web: de 30 a 48 px.', { sample: 'De la idea al deploy' }),
        style('h3', 'h3', 'Título de bloque y de tarjeta. En la web: de 20 a 26 px.', { sample: 'Planificación y ejecución' }),
      ] },
      { name: 'Texto', family: 'sans', styles: [
        style('lead', 'lead', 'Bajada bajo el nombre o un título. En la web: de 21 a 30 px.', { sample: 'Construyo software para un mundo con más soluciones que problemas.' }),
        style('role', 'role', 'El rol junto al «Sr». En la web: de 17 a 21 px.', { sample: 'AI Fullstack Developer', lineHeight: 1.2 }),
        style('body', 'body', 'Cuerpo de texto, 62 caracteres de ancho como máximo.', { sample: 'Diseño y construyo productos con IA de punta a punta.' }),
        style('small', 'small', 'Ayudas de campos, pies y notas.', { sample: 'Cada proyecto lleva su estado.' }),
        style('button', 'button', 'Texto de botones. En la web: de 16 a 17 px.', { sample: 'Conocer a Ignacio', lineHeight: 1.1 }),
      ] },
      { name: 'Mono', family: 'mono', styles: [
        style('label', 'label', 'Rótulos en mayúsculas, 700, en `color-text-subtle`.', { sample: 'SR AI FULLSTACK DEVELOPER', fontWeight: 700, lineHeight: 1.3, letterSpacing: T['label-tracking'] }),
        style('code', 'code', 'Código en línea y en las caras del apilado.', { sample: 'async function responder(q: string)', fontWeight: 400 }),
      ] },
    ],
  },
  spacing: { tokens: Object.entries(src.space).map(([k, v]) => ({ name: `space-${k}`, value: v, usage: `${px(v) / 4} × 4 px.${k === '4' ? ' El margen lateral en celular.' : ''}` })) },
  radius: { tokens: Object.entries(src.radius).map(([k, v]) => ({ name: `radius-${k}`, value: v, usage: { xs: 'Rótulos chicos y teclas.', sm: 'El «Sr», el idioma, opciones segmentadas.', md: 'Campos, botones chicos, botones de ícono.', lg: 'Muestras, rótulo del rol, estados de bloque.', xl: 'Botones grandes y paneles chicos.', '2xl': 'Tarjetas de vidrio, paneles y reproductor.', pill: 'Chips, estados y verbos.' }[k] })) },
  shadow: { tokens: Object.entries(src.shadow).map(([k, v]) => ({ name: `shadow-${k}`, value: v, usage: { 'glow-brand': 'Solo debajo de la acción principal.', panel: 'Tarjetas y paneles que flotan sobre el índigo.', focus: 'El foco dibujado como sombra (anillo de 2 px con un hueco del color de la página).' }[k] })) },
  size: { tokens: Object.entries(src.size).map(([k, v]) => ({ name: `size-${k}`, value: v, usage: { touch: 'Objetivo táctil mínimo.', button: 'Alto del botón principal.', header: 'Alto de la barra de arriba.', footer: 'Alto del pie.', grid: 'Paso de la trama del fondo.', max: 'Ancho máximo del contenido.', gutter: 'Margen lateral en celular.', 'margin-tablet': 'Margen lateral desde 600 px.', 'margin-desktop': 'Margen lateral desde 1100 px.' }[k] })) },
  gradient: { tokens: Object.entries(src.gradient).map(([k, v]) => ({ name: `gradient-${k}`, value: v, usage: { brand: 'La acción principal y el «Sr».', name: 'El apellido.', solutions: 'La palabra «soluciones».', spectrum: 'La línea del pie: las cinco capas en orden.', page: 'El fondo de la página, fijo.', grid: 'La trama del fondo, cada `size-grid`.' }[k] })) },
  zIndex: { tokens: Object.entries(src.z).map(([k, v]) => ({ name: `z-${k}`, value: v, usage: { base: 'Contenido.', raised: 'Lo que sube sobre el contenido.', header: 'La barra de arriba, fija.', overlay: 'Menús y capas.', dialog: 'Diálogos y el salto al contenido.' }[k] })) },
  breakpoint: { tokens: Object.entries(src.bp).map(([k, v]) => ({ name: `bp-${k}`, value: v, usage: { sm: 'El celular más chico: sin scroll horizontal acá.', md: 'Tablet: márgenes de 32 px, grillas de dos columnas.', lg: 'Escritorio: el inicio en dos columnas.', xl: 'Ancho de diseño.' }[k] })) },
  meta: { source: 'github', repo: 'Toti-Gauna/portafolio-2026', paths: { tokens: ['v2/tokens/tokens.json'], docs: ['design/v2/README.md', 'design/v2/ilustracion.md'], components: ['v2/components/ui', 'v2/components/signature', 'v2/components/kit'] }, synced: new Date().toISOString().slice(0, 10) },
};
put('tokens.json', JSON.stringify(tokens, null, 2) + '\n');
put('README.md', readFileSync(join(HERE, 'README.md'), 'utf8'));
put('ilustracion.md', readFileSync(join(HERE, 'ilustracion.md'), 'utf8'));

// ── bundle.css ───────────────────────────────────────────────────────────────
// The /v2 stylesheets as they are. tokens.css (generated by the page from tokens.json) gives every --color-…,
// --space-…, --radius-… …; here only what tokens.json does not hold: the type and motion variables.
const typeVars = Object.entries(T).map(([k, v]) => `--type-${k}:${v}`).join(';');
const motionVars = Object.entries(src.motion).map(([k, v]) => `--motion-${k}:${v}`).join(';');
const css = (f) => readFileSync(join(ROOT, 'app/v2/[locale]', f), 'utf8');
put('components/bundle.css', [
  `/* ${TITLE} — the /v2 stylesheets (app/v2/[locale]/ui.css, signature.css, kit.css). Colours, spacing, radii, sizes, shadows and gradients come from tokens.css. */`,
  `:root{--family-sans:var(--font-sans);--family-mono:var(--font-mono);${typeVars};${motionVars}}`,
  `.ds-stage{display:grid;gap:var(--space-4);padding:var(--space-5);background:var(--gradient-page),var(--color-bg);color:var(--color-text);font-family:var(--family-sans);font-size:var(--type-body-size);line-height:var(--type-body-lh);min-height:100%;box-sizing:border-box;align-content:start}.ds-stage>:is(.ui-lang,.ui-sound,.ui-linkarrow,.ui-check,.ui-switch){justify-self:start}`,
  `.ds-stage *,.ds-stage *::before,.ds-stage *::after{box-sizing:border-box}.ds-stage :is(h1,h2,h3,p,ol,ul,figure){margin:0}.ds-stage :is(ol,ul){padding:0;list-style:none}.ds-stage a{color:inherit}.ds-stage :focus-visible{outline:2px solid var(--color-focus);outline-offset:3px;border-radius:var(--radius-xs)}`,
  `.v2-label{font-family:var(--family-mono);font-size:var(--type-label-size);font-weight:700;letter-spacing:var(--type-label-tracking);text-transform:uppercase;color:var(--color-text-subtle)}.v2-mono{font-family:var(--family-mono);font-size:var(--type-label-size)}.v2-dim{color:var(--color-text-subtle)}.v2-sub{font-size:var(--type-h3-size);line-height:var(--type-h3-lh);font-weight:var(--type-h3-weight);color:var(--color-heading)}.v2-sec-text{max-width:62ch;color:var(--color-text-muted)}`,
  css('ui.css'), css('signature.css'), css('kit.css'),
].join('\n'));

// ── previews, assets ─────────────────────────────────────────────────────────
const FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&amp;family=JetBrains+Mono:wght@400;500;600;700&amp;display=swap">';
const doc = (c, body) => `<!-- @dsCard group="${c.group}" height=${c.height}${c.width ? ` width=${c.width}` : ''} -->
<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>${c.name}</title>${FONTS}<style>html,body{margin:0;height:100%;background:var(--color-bg)}</style></head>
<body>
<main class="ds-stage">${body}</main>
</body>
</html>
`;
const PAGES = { T: '/v2/es/', C: '/v2/es/componentes/', P: '/v2/es/piezas/', K: '/v2/es/kit/' };
const browser = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const html = {};
const assets = [];
for (const [key, path] of Object.entries(PAGES)) {
  await page.goto(BASE + path);
  // let the pieces that run once reach their end frame, then read the DOM
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 450) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(350); }
  await page.waitForTimeout(2600);
  for (const c of COMPONENTS.filter((x) => x.page === key)) {
    const parts = [];
    for (const sel of c.select) {
      const got = await page.evaluate((s) => {
        const el = document.querySelector(s);
        if (!el) return null;
        const clone = el.cloneNode(true);
        clone.querySelectorAll('[style*="--lx"],[data-live]').forEach((n) => { n.removeAttribute('data-live'); });
        return clone.outerHTML;
      }, sel);
      if (!got) throw new Error(`${c.name}: nothing at ${sel} on ${path}`);
      parts.push(got);
    }
    html[c.name] = parts.join('\n');
  }
  if (key === 'K') {
    // icons: the rendered <svg>, with explicit inks for an <img> (no currentColor there)
    const icons = await page.$$eval('.kit-icons li', (lis) => lis.map((li) => ({ label: li.querySelector('span:last-child').textContent, svg: li.querySelector('svg').outerHTML })));
    const names = await page.$$eval('.kit-family', (fams) => fams.flatMap((f) => [...f.querySelectorAll('li')].map(() => f.querySelector('h3').textContent)));
    icons.forEach((ic, i) => assets.push({ group: 'Icons', ic, family: names[i] }));
    const stamps = await page.$$eval('.kit-stamp', (ls) => ls.map((l) => ({ alt: l.querySelector('svg').getAttribute('aria-label'), inner: l.querySelector('svg').innerHTML, name: l.querySelector('span').textContent })));
    stamps.forEach((s) => assets.push({ group: 'Estampillas', s }));
  }
  if (key === 'T') {
    const mono = await page.$eval('.v2-brand svg', (s) => s.innerHTML);
    assets.push({ group: 'Logos', mono });
  }
}
await browser.close();

for (const c of COMPONENTS) {
  put(`components/${c.name}/preview.html`, doc(c, html[c.name]));
  put(`components/${c.name}/README.md`, `# ${c.name}\n\n${c.readme}\n\n**En el repo:** \`${c.src}\`.\n`);
}

// asset files
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ICON_INK = C['ink-850'];
const iconFiles = [];
for (const a of assets.filter((x) => x.group === 'Icons')) {
  const accent = /--ic-accent:\s*(#[0-9a-f]{3,8})/i.exec(a.ic.svg)?.[1] ?? C['coral-500'];
  const svg = a.ic.svg
    .replace(/<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${ICON_INK}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">`)
    .replace(/fill="currentColor"/g, `fill="${ICON_INK}"`)
    .replace(/<g class="ic-a">/g, `<g fill="${accent}" stroke="none">`);
  const file = `assets/Icons/${slug(a.ic.label)}.svg`;
  if (iconFiles.some((f) => f.file === file)) throw new Error(`duplicate icon file ${file}`);
  iconFiles.push({ file, family: a.family, label: a.ic.label });
  put(file, svg + '\n');
}
put('assets/Icons/README.md', `# Icons\n\n42 íconos propios en cuatro familias, grilla de 24 × 24, trazo de 1,75. Los archivos vienen en tinta \`color-ink-850\` (${ICON_INK}) para verse sobre fondo claro; en la web el trazo toma el color del texto. La pieza rellena es el acento: coral (\`color-coral-500\`) o, en las capas del oficio, el \`-from\` de su capa.\n\n${[...new Set(iconFiles.map((f) => f.family))].map((fam) => `- **${fam}:** ${iconFiles.filter((f) => f.family === fam).map((f) => f.label).join(', ')}.`).join('\n')}\n`);
const stampFiles = [];
for (const a of assets.filter((x) => x.group === 'Estampillas')) {
  const file = `assets/Estampillas/${slug(a.s.name)}.svg`;
  stampFiles.push({ file, name: a.s.name });
  put(file, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300" width="240" height="300">${a.s.inner}</svg>\n`);
}
put('assets/Estampillas/README.md', `# Estampillas\n\nUna por parada del recorrido, 240 × 300, tinta plana sobre papel crema con borde dentado. El dibujo no lleva texto: el año y el nombre van en HTML encima (ver la sección Ilustración). ${stampFiles.map((f) => f.name).join(' · ')}.\n`);
const mono = assets.find((x) => x.group === 'Logos').mono;
for (const [name, ink] of [['ig-monogram-paper', C.paper], ['ig-monogram-ink', C['ink-850']]]) {
  put(`assets/Logos/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96" fill="none" stroke="${ink}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${mono.replace(/fill="var\(--color-coral-500\)"/, `fill="${C['coral-500']}"`)}</svg>\n`);
}
put('assets/Logos/README.md', `# Logos\n\nEl monograma «IG»: una I con un punto coral (\`color-coral-500\`) y una G, a trazo. \`ig-monogram-paper.svg\` va sobre el índigo (trazo \`color-paper\`); \`ig-monogram-ink.svg\` sobre fondos claros (trazo \`color-ink-850\`). El nombre, siempre en tipografía al lado.\n`);

// the cover: written by hand (design/v2/cover.html)
put('components/Cover/preview.html', readFileSync(join(HERE, 'cover.html'), 'utf8'));

// the index, once the assets are uploaded
const assetFiles = [...iconFiles.map((f) => f.file), ...stampFiles.map((f) => f.file), 'assets/Logos/ig-monogram-paper.svg', 'assets/Logos/ig-monogram-ink.svg'];
writeFileSync(join(OUT, '..', 'assets.json'), JSON.stringify(assetFiles, null, 2));
if (BLOBS) {
  const blobs = JSON.parse(readFileSync(BLOBS, 'utf8'));
  const group = (g, tile) => {
    const files = Object.fromEntries(assetFiles.filter((f) => f.startsWith(`assets/${g}/`)).map((f) => {
      const name = f.slice(`assets/${g}/`.length);
      if (!blobs[f]) throw new Error(`no blob for ${f}`);
      return [name, { name, blob: blobs[f], size: statSync(join(OUT, f)).size, type: 'image/svg+xml' }];
    }));
    return { name: g, tile, order: Object.keys(files), files };
  };
  const index = {
    v: 3, layout: 'files', createdOnFiles: { v: 1, at: arg('created', new Date().toISOString()) }, title: TITLE, namespace: 'SistemaIG', libraries: [],
    sections: {}, groups: ['Logos', 'Icons', 'Estampillas'],
    assetGroups: { Logos: group('Logos', 'l'), Icons: group('Icons', 's'), Estampillas: group('Estampillas', 'm') },
    blobs: {}, docs: { readme: 'project/README.md', sections: [] },
    lastChange: { by: arg('by', 'Claude'), at: new Date().toISOString(), via: 'GitHub · Toti-Gauna/portafolio-2026', note: arg('note', 'Sistema IG desde /v2') },
  };
  put('design-system.json', JSON.stringify(index, null, 2) + '\n');
}
console.log('wrote', OUT, '·', COMPONENTS.length, 'components ·', assetFiles.length, 'assets');
