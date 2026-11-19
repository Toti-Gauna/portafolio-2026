import type { DsSpec } from './types';

/**
 * Velmar (Toti-Gauna/velmar-ecommerce- @ aac5aed): the provisional palette taken from the olive logo and light wood
 * (src/config/brand.ts → app/globals.css), its dark mode and the season palettes that repaint every token with
 * html[data-season] (src/features/themes/palettes.ts), the product «studio» included (--studio-1/2/3).
 * Components rebuilt from src/components/{atoms,molecules}, with the demo fixtures (Comedero perro globo, PATITAS20).
 * The product drawing is a simple SVG of our own; the repo's illustrations are not copied.
 */

const BRAND = 'src/config/brand.ts';
const GLOBALS = 'app/globals.css';
const PALETTES = 'src/features/themes/palettes.ts';

/* Constant tokens: the wood is never overridden; --color-brass is a literal in the @theme block. */
const CONST = { '--brand-wood': '#b98b5c', '--color-brass': '#d2ad69' };
/* :root states (light) and DARK_EXTRAS (dark mode and immersive seasons). */
const LIGHT_STATES = { '--c-success': '#2f6b3a', '--c-success-soft': '#e4eedf', '--c-warning': '#7a5200', '--c-warning-soft': '#f8edd4' };
const DARK_STATES = { '--c-success': '#93d39f', '--c-success-soft': '#1c2b1f', '--c-warning': '#ebc77f', '--c-warning-soft': '#2d2513' };
/* ProductArt's default studio (front view): used when no season sets --studio-*. */
const STUDIO_FRONT = '#f5eee2 #eadfcb #ddd0b8';

/** One palette in the order of palettes.ts: primary · hover · on primary · accent · background · surface · text ·
 *  muted · border · night · night 2 · brass ink, plus the studio gradient. */
const ORDER = ['--brand-primary', '--brand-primary-hover', '--brand-on-primary', '--brand-accent', '--brand-background', '--brand-surface', '--brand-text', '--brand-muted', '--brand-border', '--c-night', '--c-night-2', '--c-brass-ink'];
const pal = (v: string, studio: string, states: Record<string, string>): Record<string, string> => {
  const out: Record<string, string> = {};
  v.split(' ').forEach((c, i) => { out[ORDER[i]] = c; });
  studio.split(' ').forEach((c, i) => { out[`--studio-${i + 1}`] = c; });
  return { ...out, ...states, ...CONST };
};

/* ---------- small drawings (own SVG, stroke = currentColor) ---------- */
const svg = (d: string, size: number, w = 2) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
const ICON = {
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16v4M17 18h4',
  bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 016 0v2',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  gift: 'M4 9h16v4H4zM5 13h14v8H5zM12 9v12M12 9c-2-4-6-4-6-1.5S9 9 12 9zm0 0c2-4 6-4 6-1.5S15 9 12 9z',
  hammer: 'M14 6l4 4M4 20l9-9M11 4l7 7 2-2-7-7z',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4',
  box: 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8',
  truck: 'M2 6h12v10H2zM14 10h4l3 3v3h-7M6 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z',
  check: 'M12 21a9 9 0 100-18 9 9 0 000 18zM8 12l3 3 5-6',
  flask: 'M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3',
  tick: 'M5 12l5 5 9-10',
};

/** The studio behind each product (ProductArt's Studio: gradient from --studio-1/2/3, side light, horizon, shadow)
 *  and a simple balloon-dog bowl in the pink variant (#e88aa0). */
const PRODUCT_ART = `<svg class="vm-art-svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="{{artLabel}}">
<defs><linearGradient id="ds-velmar-st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--studio-1)"/><stop offset=".72" style="stop-color:var(--studio-2)"/><stop offset="1" style="stop-color:var(--studio-3)"/></linearGradient>
<radialGradient id="ds-velmar-light" cx=".22" cy=".12" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="ds-velmar-blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9"/></filter></defs>
<rect width="400" height="400" fill="url(#ds-velmar-st)"/><rect width="400" height="400" fill="url(#ds-velmar-light)"/>
<path d="M0 292 Q200 278 400 292" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/>
<ellipse cx="200" cy="334" rx="132" ry="15" fill="#1c2016" opacity=".2" filter="url(#ds-velmar-blur)"/>
<path d="M112 252 Q118 328 200 332 Q282 328 288 252 Z" fill="#e88aa0"/>
<ellipse cx="200" cy="252" rx="88" ry="22" fill="#f3b6c3"/><ellipse cx="200" cy="253" rx="70" ry="14" fill="#c9677f"/>
<ellipse cx="176" cy="196" rx="13" ry="30" fill="#e88aa0" transform="rotate(-22 176 196)"/>
<ellipse cx="206" cy="214" rx="36" ry="27" fill="#e88aa0"/><ellipse cx="246" cy="222" rx="26" ry="14" fill="#e88aa0"/>
<circle cx="270" cy="220" r="6" fill="#4a2a33"/><circle cx="214" cy="206" r="4" fill="#4a2a33"/>
<ellipse cx="194" cy="203" rx="14" ry="7" fill="#fff" opacity=".35"/><path d="M132 270 Q140 312 182 322" stroke="#fff" stroke-opacity=".3" stroke-width="6" fill="none" stroke-linecap="round"/>
</svg>`;

/** CouponTicket's stub: guilloché of seven rings and twelve ellipses in the gold gradient (GoldGradient). */
const GUILLOCHE = `<svg class="vm-gui" aria-hidden="true" viewBox="0 0 112 120" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="ds-velmar-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e2b0"/><stop offset=".45" stop-color="#d2ad69"/><stop offset="1" stop-color="#9a7434"/></linearGradient></defs>
${Array.from({ length: 7 }, (_, i) => `<circle cx="56" cy="60" r="${14 + i * 9}" fill="none" stroke="url(#ds-velmar-gold)" stroke-width=".7"/>`).join('')}
${Array.from({ length: 12 }, (_, i) => `<ellipse cx="56" cy="60" rx="52" ry="16" fill="none" stroke="url(#ds-velmar-gold)" stroke-width=".45" transform="rotate(${i * 15} 56 60)"/>`).join('')}
</svg>`;
/** RewardGlyph «percent» (48-unit box, 2.6 stroke, gold). */
const PERCENT = `<svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><g fill="none" stroke="url(#ds-velmar-gold)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M24 4.5 28.6 8l5.7-.6 2.3 5.3 5.2 2.4-.6 5.7L44.5 24 41.2 28.6l.6 5.7-5.2 2.3-2.4 5.2-5.7-.6L24 44.5 19.4 41.2l-5.7.6-2.3-5.2-5.2-2.4.6-5.7L3.5 24l3.3-4.6-.6-5.7 5.2-2.3 2.4-5.2 5.7.6Z"/><path d="m17 31 14-14"/><circle cx="18" cy="18" r="2.6"/><circle cx="30" cy="30" r="2.6"/></g></svg>`;

const swatch = (key: string, hex: string, on = false) =>
  `<button type="button" role="radio" aria-checked="${on}" data-ds-pick class="vm-sw" aria-label="{{${key}}}"><span style="background:${hex}"></span></button>`;
const size = (key: string, on = false) => `<button type="button" role="radio" aria-checked="${on}" data-ds-pick class="vm-opt">{{${key}}}</button>`;
const badge = (tone: string, icon: keyof typeof ICON, key: string) => `<li><span class="vm-badge vm-badge--${tone}">${svg(ICON[icon], 12, 2.4)}{{${key}}}</span></li>`;

export const DS: DsSpec = {
  repo: 'Toti-Gauna/velmar-ecommerce-',
  sha: 'aac5aedaa9c0226fffbe3e0a20c1b56d9fe48634',
  themes: [
    {
      id: 'claro', scheme: 'light',
      vars: pal('#3a4527 #283019 #fffdf8 #ece2cf #f6f1e8 #fffdf8 #1c2016 #5d6050 #e2d8c4 #1c2016 #262c1d #7a5c26', STUDIO_FRONT, LIGHT_STATES),
      source: { path: BRAND, lines: [47, 58], match: 'primary: "#3a4527",' },
    },
    {
      id: 'oscuro', scheme: 'dark',
      vars: pal('#c5d19e #d6e0b4 #151910 #262b20 #121510 #1b1f17 #ece6d8 #a9a591 #2f3528 #0a0c08 #16190f #d9b878', STUDIO_FRONT, DARK_STATES),
      source: { path: GLOBALS, lines: [67, 95], match: '--brand-primary: #c5d19e !important;' },
    },
    {
      id: 'navidad', scheme: 'dark',
      vars: pal('#f3c84c #f7d777 #10251b #173a2b #0b1f16 #12291e #f1efe4 #aebfae #22412f #06140d #0e2219 #f3c84c', '#21503b #183d2d #10291f', DARK_STATES),
      source: { path: PALETTES, lines: [28, 28], match: 'navidad: immersive("#f3c84c' },
    },
    {
      id: 'halloween', scheme: 'dark',
      vars: pal('#ffa64d #ffb96f #1d1426 #2a1f38 #120b1a #1c1228 #f2e9f7 #b7a8c6 #352646 #08050d #160e21 #ffb877', '#3d2554 #2b1a3d #1d1229', DARK_STATES),
      source: { path: PALETTES, lines: [27, 27], match: 'halloween: immersive("#ffa64d' },
    },
    {
      id: 'dia-de-la-madre', scheme: 'light',
      vars: pal('#9b3563 #842c54 #fff7fa #f7dce7 #fbeaf1 #fff7fa #2a1520 #6e5060 #efd0dd #4a1830 #5e2440 #8a3d62', '#fbe3ec #f3d0de #e8bccd', LIGHT_STATES),
      source: { path: PALETTES, lines: [35, 38], match: 'light: p("light", "#9b3563' },
    },
    {
      id: 'revolucion-de-mayo', scheme: 'light',
      vars: pal('#1f5c8a #184b72 #f7fbff #e3eef6 #f6f1e6 #fffcf5 #1d1f24 #5c5a52 #e6dccb #18324a #21425f #8a5a12', '#efe6d4 #e4d8c0 #d6c6a6', LIGHT_STATES),
      source: { path: PALETTES, lines: [56, 59], match: 'light: p("light", "#1f5c8a' },
    },
  ],
  colors: [
    { key: 'marca', tokens: ['--brand-primary', '--brand-primary-hover', '--brand-on-primary', '--brand-accent', '--brand-wood'], source: { path: BRAND, lines: [48, 52], match: 'primaryHover: "#283019",' } },
    { key: 'papel', tokens: ['--brand-background', '--brand-surface', '--brand-text', '--brand-muted', '--brand-border'], source: { path: BRAND, lines: [53, 57], match: 'background: "#f6f1e8",' } },
    { key: 'noche', tokens: ['--c-night', '--c-night-2', '--color-brass', '--c-brass-ink'], source: { path: GLOBALS, lines: [24, 27], match: '--color-brass: #d2ad69;' } },
    { key: 'estudio', tokens: ['--studio-1', '--studio-2', '--studio-3'], source: { path: 'src/components/illustrations/ProductArt.tsx', lines: [17, 29], match: 'front: ["#f5eee2", "#eadfcb", "#ddd0b8"]' } },
    { key: 'estados', tokens: ['--c-success', '--c-success-soft', '--c-warning', '--c-warning-soft'], source: { path: GLOBALS, lines: [54, 57], match: '--c-success: #2f6b3a;' } },
  ],
  /* the pairs tests/unit/palettes.test.ts measures (lines 12–14), checked here in the six themes */
  pairs: [
    { fg: '--brand-text', bg: '--brand-background', min: 4.5 },
    { fg: '--brand-text', bg: '--brand-surface', min: 4.5 },
    { fg: '--brand-muted', bg: '--brand-surface', min: 4.5 },
    { fg: '--brand-on-primary', bg: '--brand-primary', min: 4.5 },
    { fg: '--c-brass-ink', bg: '--brand-background', min: 4.5 },
    { fg: '--brand-text', bg: '--brand-accent', min: 4.5 },
  ],
  fonts: [
    { family: 'ds-velmar-display', name: 'Fraunces', key: 'display', weights: [420, 600], italic: true, source: { path: BRAND, lines: [9, 9], match: "'Fraunces Variable', 'Iowan Old Style'" } },
    { family: 'ds-velmar-sans', name: 'Manrope', key: 'sans', weights: [500, 700, 800], source: { path: BRAND, lines: [59, 59], match: "fontFamily: \"'Manrope Variable'" } },
    { family: 'ds-velmar-script', name: 'Caveat', key: 'script', weights: [600], source: { path: GLOBALS, lines: [37, 37], match: '--font-script: "Caveat", cursive;' } },
  ],
  scale: {
    radius: [{ token: '--radius-card', value: '1.75rem' }],
    motion: [{ token: '--ease-out-expo', value: 'cubic-bezier(0.16, 1, 0.3, 1)', kind: 'ease' }],
    source: { path: GLOBALS, lines: [38, 41], match: '--radius-card: 1.75rem;' },
  },
  components: [
    {
      id: 'product-card',
      source: { path: 'src/components/molecules/ProductCard.tsx', lines: [42, 84], match: 'rounded-[var(--radius-card)] bg-accent' },
      html: `<article class="vm vm-card" data-product-card>
<div class="vm-card-media">
<div class="vm-card-visual"><div class="vm-art">${PRODUCT_ART}<span class="vm-art-tag">{{artBadge}}</span></div></div>
<div class="vm-card-tags"><span class="vm-tag vm-tag--light">{{tagPersonal}}</span></div>
<button type="button" class="vm-quick" aria-label="{{personalizeLabel}}">${svg(ICON.sparkle, 16)}<span>{{personalize}}</span></button>
</div>
<div class="vm-card-body">
<h3 class="vm-card-name">{{productName}}</h3>
<p class="vm-card-price"><span class="vm-from">{{from}}</span>$&nbsp;18.500</p>
<p class="vm-card-note">{{stockNote}}</p>
</div>
<p class="vm-card-dots" aria-label="{{colorsLabel}}"><span aria-hidden="true" style="background:#e88aa0"></span><span aria-hidden="true" style="background:#8cbfe0"></span><span aria-hidden="true" style="background:#f1e4c8"></span></p>
</article>`,
    },
    {
      id: 'buttons',
      source: { path: 'src/components/atoms/Button.tsx', lines: [8, 20], match: 'const SHEEN = "after:pointer-events-none' },
      html: `<div class="vm vm-actions">
<button type="button" class="vm-btn vm-btn--primary">${svg(ICON.bag, 18)}{{addCart}}</button>
<button type="button" class="vm-btn vm-btn--dark"><span class="vm-brass">${svg(ICON.bolt, 18)}</span>{{buyNow}}</button>
<button type="button" class="vm-btn vm-btn--secondary"><span class="vm-brass-ink">${svg(ICON.gift, 18)}</span>{{gift}}</button>
</div>`,
    },
    {
      id: 'variant-picker',
      source: { path: 'src/components/molecules/VariantPicker.tsx', lines: [25, 38], match: '"h-12 w-12 rounded-full"' },
      html: `<div class="vm vm-pick">
<p class="vm-legend" id="ds-velmar-color">{{colorLegend}}</p>
<div class="vm-row" role="radiogroup" aria-labelledby="ds-velmar-color">${swatch('pink', '#e88aa0', true)}${swatch('blue', '#8cbfe0')}${swatch('cream', '#f1e4c8')}</div>
<p class="vm-legend" id="ds-velmar-size">{{sizeLegend}}</p>
<div class="vm-row" role="radiogroup" aria-labelledby="ds-velmar-size">${size('medium', true)}${size('large')}</div>
</div>`,
    },
    {
      id: 'field',
      source: { path: 'src/components/atoms/Field.tsx', lines: [4, 5], match: 'w-full min-h-12 rounded-2xl border border-ink/12' },
      html: `<div class="vm vm-form">
<div class="vm-field"><label for="ds-velmar-name">{{nameLabel}}</label><input id="ds-velmar-name" class="vm-input" type="text" maxlength="10" value="{{nameValue}}" aria-describedby="ds-velmar-name-hint"><p id="ds-velmar-name-hint" class="vm-hint">{{nameHint}}</p></div>
<div class="vm-field"><label for="ds-velmar-qty">{{qtyLabel}}</label><span class="vm-select"><select id="ds-velmar-qty" class="vm-input"><option>{{qty1}}</option><option>{{qty2}}</option><option>{{qty3}}</option></select></span></div>
</div>`,
    },
    {
      id: 'coupon-ticket',
      source: { path: 'src/components/molecules/CouponTicket.tsx', lines: [18, 45], match: 'bg-night px-2 text-center text-[#f6f1e8]' },
      html: `<div class="vm vm-ticket">
<div class="vm-ticket-stub">${GUILLOCHE}<span class="vm-ticket-val">${PERCENT}<span class="vm-ticket-num">20%</span><span class="vm-ticket-off">OFF</span></span></div>
<div class="vm-ticket-perf" aria-hidden="true"><span></span><span></span><i></i></div>
<div class="vm-ticket-body"><div><p class="vm-ticket-desc">{{couponDesc}}</p><p class="vm-ticket-code">PATITAS20</p></div>
<button type="button" class="vm-btn vm-btn--primary vm-btn--sm" data-ds-press aria-pressed="false" aria-label="{{couponApply}}"><span class="vm-apply">{{apply}}</span><span class="vm-applied">${svg(ICON.tick, 15, 2.6)}{{applied}}</span></button></div>
</div>`,
    },
    {
      id: 'status-badge',
      source: { path: 'src/components/atoms/Badge.tsx', lines: [5, 15], match: 'success: "bg-success-soft text-success",' },
      html: `<ul class="vm vm-badges" aria-label="{{badgesLabel}}">
${badge('brand', 'hammer', 'stProduction')}${badge('warning', 'search', 'stReview')}${badge('success', 'box', 'stReady')}${badge('brand', 'truck', 'stShipped')}${badge('success', 'check', 'stDelivered')}${badge('demo', 'flask', 'demo')}
</ul>`,
    },
  ],
};
