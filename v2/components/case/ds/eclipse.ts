import type { DsSpec } from './types';

/**
 * Eclipse (Toti-Gauna/Eclipse-Web @ eb1f507): the «Efemérides» system. Tokens from app/globals.css (palette on :root,
 * semantic tokens switched by .theme-dark / .theme-light), fonts from app/fonts.ts, and six components rebuilt from
 * their CSS: the pill buttons with the glint, the section mark, the phase glyph (the brand icon), the index of
 * families, the ledger with dotted leaders and the card with the «Demo» badge.
 */

/** components/ui/PhaseGlyph.tsx, as static markup: the sun, the moon at `phase` (0 = sun alone, 1 = totality). */
function glyph(phase: number, size: number, cls: string): string {
  const p = Math.min(1, Math.max(0, phase));
  const c = 12;
  const r = 8;
  const d = (1 - p) * 2 * r;
  const total = p > 0.985;
  const f = (n: number) => +n.toFixed(3);
  let lit: string | null = null;
  if (d >= 2 * r - 0.01) lit = `M ${c - r} ${c} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
  else if (!total) {
    const x = c + d / 2;
    const h = Math.sqrt(r * r - (d / 2) ** 2);
    lit = `M ${f(x)} ${f(c - h)} A ${r} ${r} 0 1 0 ${f(x)} ${f(c + h)} A ${r} ${r} 0 0 1 ${f(x)} ${f(c - h)} Z`;
  }
  let s = `<svg class="${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1"/>`;
  if (lit) s += `<path d="${lit}" fill="currentColor"/>`;
  if (total)
    s += `<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-opacity="0.55" stroke-width="1"/><circle cx="${f(c + (r + 1) * 0.7071)}" cy="${f(c - (r + 1) * 0.7071)}" r="1.6" fill="currentColor"/>`;
  return `${s}</svg>`;
}

/** Lucide chevron-down at the repo's thin stroke (strokeWidth 1.5). */
const chevron =
  '<svg class="svc-chevron" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>';

/** One family of the services index: number, phase (index + 1) / 6, serif name, leader, piece count, result. */
const family = (n: number, key: string, pressed: boolean) =>
  `<li class="svc-row"><div class="svc-row-top"><button type="button" class="svc-head-btn" data-ds-press aria-pressed="${pressed}">` +
  `<span class="svc-num" aria-hidden="true">${String(n).padStart(2, '0')}</span>${glyph(n / 6, 16, 'svc-glyph')}` +
  `<span class="svc-name">{{${key}}}</span><span class="leader svc-leader" aria-hidden="true"></span>` +
  `<span class="svc-from">{{${key}N}}</span>${chevron}</button>` +
  `<p class="svc-result">{{${key}R}}</p></div></li>`;

const part = (n: number, key: string) =>
  `<li class="eq-row"><span class="eq-row-n readout" aria-hidden="true">${String(n).padStart(2, '0')}</span>` +
  `<span class="eq-row-name">{{${key}}}</span><span class="leader" aria-hidden="true"></span>` +
  `<span class="eq-row-quote">{{quote}}</span></li>`;

const PHASES = [0, 0.25, 0.5, 0.75, 1];

const palette = {
  '--void': '#05050a',
  '--night': '#0c0c14',
  '--ash': '#1a1a24',
  '--corona': '#f5b942',
  '--flare': '#ffe8b0',
  '--dawn': '#f4efe6',
  '--ink': '#111114',
  '--mist': '#9a97a6',
  '--corona-deep': '#8a5a00',
  '--mist-ink': '#5b5866',
  '--dawn-soft': '#ebe4d8',
};

export const DS: DsSpec = {
  repo: 'Toti-Gauna/Eclipse-Web',
  sha: 'eb1f5079018821b2726323aa619a78059e3e7508',
  themes: [
    {
      id: 'dark',
      scheme: 'dark',
      vars: {
        ...palette,
        '--fg': '#f4efe6',
        '--fg-muted': '#9a97a6',
        '--accent': '#f5b942',
        '--line': 'rgb(244 239 230 / 0.1)',
        '--line-strong': 'rgb(244 239 230 / 0.18)',
        '--surface': 'rgb(26 26 36 / 0.55)',
        '--surface-strong': 'rgb(26 26 36 / 0.85)',
        '--focus': '#f5b942',
        '--fg-inverse': '#05050a',
      },
      source: { path: 'app/globals.css', lines: [49, 60], match: '.theme-dark {' },
    },
    {
      id: 'light',
      scheme: 'light',
      vars: {
        ...palette,
        '--fg': '#111114',
        '--fg-muted': '#5b5866',
        '--accent': '#8a5a00',
        '--line': 'rgb(17 17 20 / 0.12)',
        '--line-strong': 'rgb(17 17 20 / 0.22)',
        '--surface': 'rgb(255 255 255 / 0.62)',
        '--surface-strong': 'rgb(255 255 255 / 0.9)',
        '--focus': '#8a5a00',
        '--fg-inverse': '#f4efe6',
      },
      source: { path: 'app/globals.css', lines: [62, 73], match: '.theme-light {' },
    },
  ],
  colors: [
    {
      key: 'palette',
      tokens: ['--void', '--night', '--ash', '--corona', '--flare', '--dawn', '--ink', '--mist'],
      source: { path: 'app/globals.css', lines: [10, 18], match: '--corona: #f5b942; /* acento principal */' },
    },
    {
      key: 'aa',
      tokens: ['--corona-deep', '--mist-ink', '--dawn-soft'],
      source: { path: 'app/globals.css', lines: [20, 23], match: '--corona-deep: #8a5a00; /* 5.2:1 on --dawn */' },
    },
    {
      key: 'semantic',
      tokens: ['--fg', '--fg-muted', '--accent', '--line', '--line-strong', '--surface', '--surface-strong', '--focus', '--fg-inverse'],
      source: { path: 'app/globals.css', lines: [25, 34], match: 'Semantic tokens, switched by .theme-dark' },
    },
  ],
  pairs: [
    { fg: '--fg', bg: '--fg-inverse', min: 4.5 },
    { fg: '--fg-muted', bg: '--fg-inverse', min: 4.5 },
    { fg: '--accent', bg: '--fg-inverse', min: 4.5 },
    { fg: '--void', bg: '--corona', min: 4.5 },
    { fg: '--focus', bg: '--fg-inverse', min: 3 },
  ],
  fonts: [
    {
      family: 'ds-eclipse-serif',
      name: 'Instrument Serif',
      key: 'serif',
      weights: [400],
      italic: true,
      source: { path: 'app/fonts.ts', lines: [11, 18], match: "'./fonts/InstrumentSerif-Italic.woff2'" },
    },
    {
      family: 'ds-eclipse-sans',
      name: 'Geist',
      key: 'sans',
      weights: [400, 500, 600],
      source: { path: 'app/fonts.ts', lines: [4, 9], match: "src: './fonts/Geist-Variable.woff2'," },
    },
    {
      family: 'ds-eclipse-mono',
      name: 'Geist Mono',
      key: 'mono',
      weights: [400, 500, 600],
      source: { path: 'app/fonts.ts', lines: [22, 29], match: "src: './fonts/GeistMono-Variable.woff2'," },
    },
  ],
  scale: {
    radius: [
      { token: '--radius-card-sm', value: '20px' },
      { token: '--radius-card', value: '24px' },
      { token: '--radius-card-lg', value: '28px' },
    ],
    space: [
      { token: '--gutter', value: '16px' },
      { token: '--header-h', value: '72px' },
    ],
    motion: [
      { token: '--ease-expo', value: 'cubic-bezier(0.16, 1, 0.3, 1)', kind: 'ease' },
      { token: '--ease-soft', value: 'cubic-bezier(0.33, 1, 0.68, 1)', kind: 'ease' },
    ],
    source: { path: 'app/globals.css', lines: [36, 103], match: '--radius-card: 24px;' },
  },
  components: [
    {
      id: 'buttons',
      source: { path: 'app/globals.css', lines: [200, 246], match: '/* Buttons — min 44px touch target */' },
      html:
        '<div class="ds-row"><button type="button" class="btn btn-primary">{{primary}}</button>' +
        '<button type="button" class="btn btn-ghost">{{ghost}}</button></div>',
    },
    {
      id: 'mark',
      source: { path: 'components/ui/section-mark.css', lines: [1, 42], match: '"04 ──── ◑ DEMOS"' },
      html:
        '<div class="ds-stack"><p class="section-mark"><span class="section-mark-index" aria-hidden="true">02</span>' +
        '<span class="draw-line section-mark-rule" aria-hidden="true"></span>' +
        glyph(1 - 1 / 7, 15, 'section-mark-glyph') +
        '<span class="section-mark-label">{{markLabel}}</span></p>' +
        '<p class="display ds-title">{{titleA}} <em>{{titleEm}}</em>.</p></div>',
    },
    {
      id: 'phase',
      source: { path: 'components/ui/PhaseGlyph.tsx', lines: [1, 63], match: 'phase 1   → totality: corona ring' },
      html:
        '<figure class="ds-phases ticks"><ol class="ds-phase-list">' +
        PHASES.map((p) => `<li>${glyph(p, 32, 'ds-phase-glyph')}<span class="readout">${p.toFixed(2)}</span></li>`).join('') +
        '</ol><figcaption class="label">{{phaseCaption}}</figcaption></figure>',
    },
    {
      id: 'index',
      source: { path: 'components/sections/services/services.css', lines: [125, 272], match: '.svc-row[data-open]::before {' },
      html: `<ol class="svc-list">${family(1, 'web', true)}${family(2, 'ops', false)}${family(5, 'ai', false)}</ol>`,
    },
    {
      id: 'ledger',
      source: { path: 'components/sections/equipment/equipment.css', lines: [69, 106], match: '.eq-row-quote {' },
      html: `<ol class="eq-parts" aria-label="{{ledgerLabel}}">${part(1, 'qr')}${part(2, 'displays')}${part(3, 'packaging')}${part(4, 'cards')}</ol>`,
    },
    {
      id: 'card',
      source: { path: 'app/globals.css', lines: [248, 279], match: '/* "Demo" / "Vista previa" badge' },
      html:
        '<article class="card ds-card"><div class="ds-card-top"><p class="eyebrow">{{cardKicker}}</p>' +
        '<span class="badge-demo">{{badge}}</span></div><p class="ds-card-text">{{cardText}}</p></article>',
    },
  ],
};
