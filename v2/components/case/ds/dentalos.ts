import type { DsSpec } from './types';

/**
 * DentalOS (Toti-Gauna/DentalOS @ aac7eea): the «Editorial clínico cálido» direction (propuesta A, lote 3).
 * Every colour is a `light-dark(claro, oscuro)` token in src/styles/app.css; the two themes below are those two halves,
 * resolved. Components rebuilt from src/ui/kit.tsx, src/ui/components.tsx and the folio of src/pages/public/Home.tsx,
 * with the seed's fictional data (turno A-0012 of Martina, the agenda of Monday 19/10).
 */

const APP = 'src/styles/app.css';

/** The product's own icons (src/ui/kit.tsx, PATHS): one 24-unit path, 1.8 stroke, decorative. */
const PATHS: Record<string, string> = {
  check: 'M4 12.5l5 5L20 6.5',
  clock: 'M12 7v5l3 2M12 21a9 9 0 110-18 9 9 0 010 18z',
  info: 'M12 11v6M12 7.5v.5M12 21a9 9 0 110-18 9 9 0 010 18z',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0',
  tooth: 'M7 3c-2.2 0-4 1.8-4 4.5 0 3 1.5 4.5 2 7 .5 2.6 1 6.5 2.8 6.5 1.6 0 1.7-4.5 4.2-4.5s2.6 4.5 4.2 4.5c1.8 0 2.3-3.9 2.8-6.5.5-2.5 2-4 2-7C21 4.8 19.2 3 17 3c-2 0-3 1.2-5 1.2S9 3 7 3z',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  chat: 'M4 5h16v11H9l-5 4V5z',
  calendar: 'M4 7h16M8 3v4M16 3v4M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
  map: 'M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  stop: 'M6 6h12v12H6z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
};
const icon = (name: string, size = 18) =>
  `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${PATHS[name]}"/></svg>`;

/** StatusBadge: tone and icon from TONE, label from STATUS_LABEL (src/domain/selectors.ts). */
const badge = (tone: string, ico: string, key: string) => `<span class="badge badge-${tone}">${icon(ico, 14)}{{${key}}}</span>`;

const day = (dow: string, num: number, note: string, picked = false, closed = false) =>
  `<button type="button" class="datestrip-day" role="radio" aria-checked="${picked}"${closed ? ' disabled' : ' data-ds-pick'} aria-label="{{${dow}Long}} ${num}, {{${note}}}"><span class="dd-dow">{{${dow}}}</span><span class="dd-num tabular">${num}</span><span class="dd-note">{{${note}}}</span></button>`;

export const DS: DsSpec = {
  repo: 'Toti-Gauna/DentalOS',
  sha: 'aac7eea2d057034929cb1d0b69b56fd9a7980e56',
  themes: [
    {
      id: 'claro',
      scheme: 'light',
      source: { path: APP, lines: [5, 5], match: ":root[data-theme='light'] { color-scheme: light; }" },
      vars: {
        '--ink': '#1b2a28',
        '--secondary': '#55615e',
        '--bg': '#f6f1e8',
        '--surface': '#fffcf7',
        '--surface-2': '#fbf7f0',
        '--surface-3': '#f1eadf',
        '--line': '#d8cdbb',
        '--line-strong': '#8c816e',
        '--sand': '#e6d9c3',
        '--sand-50': '#f1e9dc',
        '--primary': '#1e5c55',
        '--primary-strong': '#164842',
        '--primary-fill': '#1e5c55',
        '--primary-fill-strong': '#164842',
        '--on-primary': '#ffffff',
        '--primary-50': '#e2ece8',
        '--primary-100': '#cbddd7',
        '--warn': '#875200',
        '--warn-50': '#f8efdc',
        '--warn-line': '#e4cf9f',
        '--info': '#2d5770',
        '--info-50': '#e7eff4',
        '--info-line': '#bcd0dc',
        '--focus': '#9a6a0e',
        '--gold': '#b08a3e',
        '--gold-ink': '#76581a',
        '--gold-50': '#f7eedc',
        '--code-bg': '#f1eadf',
      },
    },
    {
      id: 'oscuro',
      scheme: 'dark',
      source: { path: APP, lines: [6, 6], match: ":root[data-theme='dark'] { color-scheme: dark; }" },
      vars: {
        '--ink': '#f2ece1',
        '--secondary': '#b9b2a5',
        '--bg': '#0e1615',
        '--surface': '#16211f',
        '--surface-2': '#19251f',
        '--surface-3': '#1e2b29',
        '--line': '#33433f',
        '--line-strong': '#6f817c',
        '--sand': '#3b3528',
        '--sand-50': '#1f1d17',
        '--primary': '#8fd3c6',
        '--primary-strong': '#b2e3da',
        '--primary-fill': '#6bbfb1',
        '--primary-fill-strong': '#8fd3c6',
        '--on-primary': '#0a1513',
        '--primary-50': '#1d3a35',
        '--primary-100': '#275049',
        '--warn': '#e8b65c',
        '--warn-50': '#2c2311',
        '--warn-line': '#66512a',
        '--info': '#95c8e8',
        '--info-50': '#12283a',
        '--info-line': '#2e4f67',
        '--focus': '#e4c88a',
        '--gold': '#d9b66c',
        '--gold-ink': '#e4c88a',
        '--gold-50': '#2a2312',
        '--code-bg': '#1e2b29',
      },
    },
  ],
  colors: [
    {
      key: 'texto',
      tokens: ['--ink', '--secondary', '--bg', '--surface', '--surface-2', '--surface-3', '--line', '--line-strong', '--sand', '--sand-50'],
      source: { path: APP, lines: [8, 18], match: '--ink: light-dark(#1b2a28, #f2ece1);' },
    },
    {
      key: 'marca',
      tokens: ['--primary', '--primary-strong', '--primary-fill', '--primary-fill-strong', '--on-primary', '--primary-50', '--primary-100'],
      source: { path: APP, lines: [19, 26], match: '--primary-fill: light-dark(#1e5c55, #6bbfb1);' },
    },
    {
      key: 'estados',
      tokens: ['--warn', '--warn-50', '--warn-line', '--info', '--info-50', '--info-line', '--focus'],
      source: { path: APP, lines: [37, 48], match: '--focus: light-dark(#9a6a0e, #e4c88a);' },
    },
    {
      key: 'oro',
      tokens: ['--gold', '--gold-ink', '--gold-50'],
      source: { path: APP, lines: [49, 53], match: '--gold-ink: light-dark(#76581a, #e4c88a);' },
    },
  ],
  // Pairs measured by the product itself in src/styles/contrast.test.ts (lines 37–77).
  pairs: [
    { fg: '--ink', bg: '--bg', min: 4.5 },
    { fg: '--secondary', bg: '--surface', min: 4.5 },
    { fg: '--on-primary', bg: '--primary-fill', min: 4.5 },
    { fg: '--primary-strong', bg: '--primary-50', min: 4.5 },
    { fg: '--warn', bg: '--warn-50', min: 4.5 },
    { fg: '--focus', bg: '--bg', min: 3 },
  ],
  fonts: [
    {
      family: 'ds-dentalos-display',
      name: 'Newsreader',
      key: 'display',
      weights: [500],
      source: { path: APP, lines: [109, 109], match: "--font-display: 'Newsreader', Georgia" },
    },
    {
      family: 'ds-dentalos-ui',
      name: 'Source Sans 3',
      key: 'ui',
      weights: [400, 600, 700],
      source: { path: APP, lines: [108, 110], match: "--font-ui: 'Source Sans 3', ui-sans-serif" },
    },
  ],
  scale: {
    radius: [
      { token: '--r-pub', value: '6px' },
      { token: '--r-pub-lg', value: '8px' },
      { token: '--r-adm', value: '6px' },
      { token: '--r-adm-sm', value: '4px' },
    ],
    space: [
      { token: '--s1', value: '4px' },
      { token: '--s2', value: '8px' },
      { token: '--s3', value: '12px' },
      { token: '--s4', value: '16px' },
      { token: '--s5', value: '24px' },
      { token: '--s6', value: '32px' },
      { token: '--s7', value: '48px' },
      { token: '--s8', value: '64px' },
    ],
    motion: [
      { token: '--dur-feedback', value: '180ms', kind: 'dur' },
      { token: '--dur-drawer', value: '280ms', kind: 'dur' },
      { token: '--dur-highlight', value: '1600ms', kind: 'dur' },
      { token: '--ease-out', value: 'cubic-bezier(0.2, 0, 0, 1)', kind: 'ease' },
    ],
    source: { path: APP, lines: [111, 124], match: '--s1: 4px; --s2: 8px; --s3: 12px;' },
  },
  components: [
    {
      // Folio del turno: the distinctive piece of direction A (Home.tsx, NextAppointmentCard).
      id: 'folio',
      source: { path: APP, lines: [1289, 1300], match: 'Folio del turno (componente distintivo' },
      html:
        `<div class="dto">` +
        `<aside class="folio" aria-label="{{folioLabel}}">` +
        `<p class="eyebrow">{{folioEyebrow}}</p>` +
        `<div class="folio-date"><span class="folio-day tabular" aria-hidden="true">22</span>` +
        `<p class="folio-meta"><span aria-hidden="true">{{folioDow}}</span><span aria-hidden="true">{{folioMonth}}</span><strong class="tabular" aria-hidden="true">{{folioTime}}</strong><span class="sr-only">{{folioLong}}</span></p></div>` +
        `<p class="folio-service">{{service}}</p>` +
        `<p class="folio-who">{{pro}} · {{site}} · <span class="tabular">A-0012</span></p>` +
        badge('ok', 'check', 'stConfirmada') +
        `<div class="row wrap">` +
        `<button type="button" class="btn btn-primary btn-md">${icon('list')}<span>{{folioPrimary}}</span></button>` +
        `<button type="button" class="btn btn-ghost btn-md">${icon('chat')}<span>{{folioGhost}}</span></button>` +
        `</div></aside>` +
        `</div>`,
    },
    {
      // TurnoCard, patient variant: A-0012 from the seed (src/domain/seed.ts, line 43).
      id: 'turno',
      source: { path: 'src/ui/components.tsx', lines: [25, 73], match: 'export function TurnoCard(' },
      html:
        `<div class="dto">` +
        `<article class="turno turno--patient st-confirmada" aria-label="{{turnoLabel}}">` +
        `<div class="turno-when" aria-hidden="true"><span class="turno-dow">{{dowShort}}</span><span class="turno-day tabular">22</span><span class="turno-month">{{monShort}}</span></div>` +
        `<div class="turno-body">` +
        `<div class="turno-top"><p class="turno-title">{{service}}</p>${badge('ok', 'check', 'stConfirmada')}</div>` +
        `<p class="turno-time tabular"><strong>10:00</strong>–10:30 · 30 min</p>` +
        `<p class="turno-meta">${icon('user', 14)} {{pro}} <span aria-hidden="true">·</span> ${icon('map', 14)} {{site}} · {{chair}}</p>` +
        `<p class="turno-id">{{turnoWord}} <span class="code">A-0012</span> · {{version}}</p>` +
        `</div></article>` +
        `</div>`,
    },
    {
      // DateStrip of the reception agenda (src/pages/admin/Today.tsx): week of Monday 19/10, notes from dayNote().
      id: 'datestrip',
      source: { path: 'src/ui/components.tsx', lines: [92, 134], match: 'export function DateStrip(' },
      html:
        `<div class="dto">` +
        `<div class="datestrip"><span class="datestrip-label" id="ds-dentalos-day">{{dayLabel}}</span>` +
        `<div class="datestrip-row"><div class="datestrip-days" role="radiogroup" aria-labelledby="ds-dentalos-day">` +
        day('lun', 19, 'n5', true) +
        day('mar', 20, 'n4') +
        day('mie', 21, 'n2') +
        day('jue', 22, 'n2') +
        day('vie', 23, 'n1') +
        day('sab', 24, 'closed', false, true) +
        day('dom', 25, 'closed', false, true) +
        `</div></div></div>` +
        `</div>`,
    },
    {
      // SummaryStrip of «Hoy y agenda» for Monday 19/10 (computeKpis over the seed: 5 active, 1 requested, 0 in room).
      id: 'summary',
      source: { path: 'src/ui/components.tsx', lines: [142, 153], match: 'export function SummaryStrip(' },
      html:
        `<div class="dto">` +
        `<dl class="summary-strip" aria-label="{{summaryLabel}}">` +
        `<div class="summary-item"><dt>{{sumActive}}</dt><dd><span class="tabular">5</span><small>n=5</small></dd></div>` +
        `<div class="summary-item tone-warn"><dt>{{sumConfirm}}</dt><dd><span class="tabular">1</span><small>{{sumConfirmDetail}}</small></dd></div>` +
        `<div class="summary-item"><dt>{{sumRoom}}</dt><dd><span class="tabular">0</span></dd></div>` +
        `</dl>` +
        `</div>`,
    },
    {
      // StatusBadge: every status with a word and an icon (TONE + STATUS_LABEL).
      id: 'badges',
      source: { path: 'src/ui/kit.tsx', lines: [69, 87], match: 'Estados: siempre texto + icono' },
      html:
        `<div class="dto">` +
        `<div class="ds-badges">` +
        badge('ok', 'check', 'stConfirmada') +
        badge('warn', 'info', 'stIndicado') +
        badge('info', 'tooth', 'stAtencion') +
        badge('muted', 'check', 'stFinalizada') +
        `</div>` +
        `</div>`,
    },
    {
      // Button variants (kit.tsx Button) with the direction A weight.
      id: 'buttons',
      source: { path: APP, lines: [255, 275], match: '/* ================= Botones ================= */' },
      html:
        `<div class="dto">` +
        `<div class="row wrap">` +
        `<button type="button" class="btn btn-primary btn-md">${icon('calendar')}<span>{{btnPrimary}}</span></button>` +
        `<button type="button" class="btn btn-secondary btn-md">${icon('stop')}<span>{{btnSecondary}}</span></button>` +
        `<button type="button" class="btn btn-ghost btn-md">${icon('arrow')}<span>{{btnGhost}}</span></button>` +
        `</div>` +
        `</div>`,
    },
  ],
};
