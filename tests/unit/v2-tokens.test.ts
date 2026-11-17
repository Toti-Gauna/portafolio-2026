import { describe, expect, it } from 'vitest';
import { LAYERS, TOKEN_GROUPS, tokenVars, tokens, tokensCss } from '../../v2/tokens';
import { contrast } from '../../v2/tokens/contrast';
import es from '../../messages/v2/es.json';
import en from '../../messages/v2/en.json';

const C = tokens.color;
const keys = (o: unknown, prefix = ''): string[] =>
  Object.entries(o as Record<string, unknown>).flatMap(([k, val]) =>
    typeof val === 'object' && val !== null ? keys(val, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
const px = (s: string) => Number(/^(\d+(?:\.\d+)?)px$/.exec(s)?.[1] ?? NaN);
/** The smallest size a value can take: the px itself, or the minimum of a clamp(). */
const minPx = (s: string) => px(s.startsWith('clamp(') ? s.slice(6).split(',')[0].trim() : s);

describe('v2 tokens', () => {
  it('every colour is a hex or an rgba()', () => {
    for (const [k, val] of [...Object.entries(C), ...Object.entries(tokens.layer)]) {
      expect(/^#[0-9a-f]{6}$/i.test(val) || /^rgba\(\d+, \d+, \d+, (0|1|0?\.\d+)\)$/.test(val), `${k}: ${val}`).toBe(true);
    }
  });

  it('the generated CSS has one variable per token and no duplicates', () => {
    const vars = tokenVars().map(([k]) => k);
    const leaves = TOKEN_GROUPS.reduce((n, g) => n + Object.keys(tokens[g]).length, 0);
    expect(vars.length).toBe(leaves);
    expect(new Set(vars).size).toBe(vars.length);
    const css = tokensCss();
    for (const [k, val] of tokenVars()) expect(css).toContain(`${k}:${val}`);
    expect(css).not.toMatch(/[{}]\s*[{}]/);
  });

  it('body text, secondary text and labels pass AA on every surface', () => {
    for (const fg of ['heading', 'text', 'text-muted', 'text-subtle'] as const)
      for (const bg of ['bg', 'bg-deep', 'surface', 'surface-raised'] as const)
        expect(contrast(C[fg], C[bg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
  });

  it('text-faint is decoration only: it fails AA and the specimen labels it so', () => {
    expect(contrast(C['text-faint'], C.bg)).toBeLessThan(4.5);
    expect(es.color.decorative && en.color.decorative).toBeTruthy();
  });

  it('dark text on the brand gradient passes AA at both ends', () => {
    for (const end of [C['coral-500'], C['pink-500'], C.accent]) expect(contrast(C['on-accent'], end)).toBeGreaterThanOrEqual(4.5);
  });

  it('each layer colour can carry a label on the background (AA)', () => {
    for (const id of LAYERS) {
      for (const end of ['from', 'to'] as const) {
        const c = tokens.layer[`${id}-${end}` as keyof typeof tokens.layer];
        expect(contrast(c, C.bg), `${id}-${end}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('the focus ring stands out (≥ 3:1) on the background and on the brand button', () => {
    expect(contrast(C.focus, C.bg)).toBeGreaterThanOrEqual(3);
    expect(contrast(C.focus, C['ink-850'])).toBeGreaterThanOrEqual(3);
  });

  it('no type size goes below 12 px, touch targets are at least 44 px', () => {
    const sizes = Object.entries(tokens.type).filter(([k]) => k.endsWith('-size'));
    expect(sizes.length).toBeGreaterThan(8);
    for (const [k, val] of sizes) expect(minPx(val), k).toBeGreaterThanOrEqual(12);
    expect(px(tokens.size.touch)).toBeGreaterThanOrEqual(44);
    expect(px(tokens.size.button)).toBeGreaterThanOrEqual(44);
    expect(px(tokens.size.gutter)).toBe(16);
  });

  it('motion: one signature curve and durations in ms', () => {
    expect(tokens.motion.ease).toMatch(/^cubic-bezier\(/);
    for (const k of ['fast', 'base', 'slow', 'stagger'] as const) expect(tokens.motion[k]).toMatch(/^\d+ms$/);
  });
});

describe('v2 messages', () => {
  it('es and en have exactly the same keys, none empty', () => {
    expect(keys(en).sort()).toEqual(keys(es).sort());
    for (const m of [es, en]) for (const k of keys(m)) expect(String(k.split('.').reduce<unknown>((a, p) => (a as Record<string, unknown>)[p], m)).trim(), k).not.toBe('');
  });
  it('every layer has a name in both languages', () => {
    for (const id of LAYERS) expect(es.layers[id] && en.layers[id], id).toBeTruthy();
  });
  it('the title says Sr, never Ssr', () => {
    for (const m of [es, en]) {
      expect(m.hero.level).toBe('Sr');
      expect(JSON.stringify(m)).not.toMatch(/\bSsr\b/);
    }
  });
});

describe('v2 token names', () => {
  it('no token shadows the next/font variables it points to (--font-sans, --font-mono)', () => {
    const names = tokenVars().map(([k]) => k);
    for (const [k, val] of tokenVars()) {
      const refs = [...val.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]);
      for (const r of refs) expect(r, `${k} points to itself`).not.toBe(k);
    }
    expect(names).not.toContain('--font-sans');
    expect(names).not.toContain('--font-mono');
  });
});

describe('v2 statuses', () => {
  it('every status has a positive name in both languages, and only those', async () => {
    const { STATUSES } = await import('../../v2/components/ui/Status');
    expect(Object.keys(es.ui.status).sort()).toEqual(Object.keys(STATUSES).sort());
    expect(Object.keys(en.ui.status).sort()).toEqual(Object.keys(STATUSES).sort());
    for (const m of [es, en]) for (const name of Object.values(m.ui.status)) expect(name).not.toMatch(/sin |no |falta|pendiente|without|missing|not /i);
  });
  it('each status colour reads as text on its own tinted pill (AA)', async () => {
    const { STATUSES } = await import('../../v2/components/ui/Status');
    const { hexToRgb } = await import('../../v2/tokens/contrast');
    const mix = (a: string, b: string, t: number) =>
      '#' + hexToRgb(a).map((x, i) => Math.round(x * t + hexToRgb(b)[i] * (1 - t)).toString(16).padStart(2, '0')).join('');
    for (const [k, s] of Object.entries(STATUSES)) {
      for (const bg of [C.bg, C['surface-raised']]) expect(contrast(s.color, mix(s.color, bg, 0.1)), k).toBeGreaterThanOrEqual(4.5);
    }
  });
});
