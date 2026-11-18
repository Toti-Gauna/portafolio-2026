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

describe('v2 signature pieces', () => {
  it('the stack: five layers, anchors on the stage, and the text threshold the CSS uses', async () => {
    const { stackArt, STACK_TEXT_MIN_WIDTH, STACK_LIFT, STACK_VIEWBOX } = await import('../../v2/components/signature/stack-art');
    const { readFileSync } = await import('node:fs');
    const css = readFileSync(new URL('../../app/v2/[locale]/signature.css', import.meta.url), 'utf8');
    const art = stackArt();
    expect(art.layers.map((l) => l.id)).toEqual([...LAYERS]);
    for (const l of art.layers) {
      expect(l.anchor.x).toBeGreaterThan(80); expect(l.anchor.x).toBeLessThan(100);
      expect(l.anchor.y).toBeGreaterThan(0); expect(l.anchor.y).toBeLessThan(100);
      // every label on a face has its bar stand-in for small sizes
      expect((l.svg.match(/class="t"/g) ?? []).length > 0).toBe((l.svg.match(/class="b"/g) ?? []).length > 0);
      expect(l.svg).not.toMatch(/filter=|<animate/);
    }
    // the five layers sit at equal steps
    const ys = art.layers.map((l) => l.anchor.y);
    for (let i = 2; i < ys.length; i++) expect(ys[i] - ys[i - 1]).toBeCloseTo(ys[1] - ys[0], 1);
    expect(css).toContain(`@container sigstage (min-width: ${STACK_TEXT_MIN_WIDTH}px)`);
    // the CSS lifts by the same share of the stage the art leaves free
    expect(css).toContain(`var(--above) * -${(STACK_LIFT.up / STACK_VIEWBOX.h) * 100}`);
    expect(css).toContain(`* ${(STACK_LIFT.down / STACK_VIEWBOX.h) * 100} * var(--open)`);
    expect(stackArt().layers[1].svg).toBe(art.layers[1].svg);
  });
  it('the player has a verb for every layer and three kinetic verbs, in both languages', () => {
    for (const m of [es, en]) {
      expect(Object.keys(m.pieces.player.verbs).sort()).toEqual([...LAYERS].sort());
      expect(m.pieces.verbs.items).toHaveLength(3);
    }
    expect(es.pieces.counter.items.tests.value).toBe('1.374');
    expect(en.pieces.counter.items.tests.value).toBe('1,374');
  });
});

describe('v2 illustration and icon kit', () => {
  it('icons: every icon is in exactly one family, concept icons carry one accent, all are named in both languages', async () => {
    const { ICONS, ICON_FAMILIES } = await import('../../v2/components/kit/icons');
    const all = Object.values(ICON_FAMILIES).flat();
    expect([...all].sort()).toEqual(Object.keys(ICONS).sort());
    expect(new Set(all).size).toBe(all.length);
    const glyphs = ICONS as Record<string, { s: string; a?: string }>;
    for (const name of ICON_FAMILIES.interface) expect(glyphs[name].a, name).toBeUndefined();
    for (const fam of ['layers', 'technique', 'fields'] as const) for (const name of ICON_FAMILIES[fam]) expect(glyphs[name].a, name).toBeTruthy();
    expect([...ICON_FAMILIES.layers]).toEqual([...LAYERS]);
    for (const m of [es, en]) expect(Object.keys(m.kit.icons.names).sort()).toEqual(Object.keys(ICONS).sort());
    // every stroke stays on the 24 grid
    for (const [name, g] of Object.entries(glyphs)) for (const n of g.s.match(/-?(?:\d+\.?\d*|\.\d+)/g) ?? []) expect(Math.abs(Number(n)), `${name}: ${n}`).toBeLessThanOrEqual(24);
  });
  it('the gauge: each stop puts its change under the plunger, and only the ones inside the band pass', async () => {
    const g = await import('../../v2/components/kit/gauge-model');
    g.CHANGES.forEach((h, i) => {
      expect(g.changeUnder(g.STOPS[i])).toBe(i);
      expect(g.heightUnder(g.STOPS[i])).toBeCloseTo(g.CARRIAGE_TOP + h, 6);
    });
    expect(g.CHANGES.map(g.passes)).toEqual([true, true, false, true, true]);
    expect(g.REACH[0]).toBeLessThan(Math.min(...g.STOPS));
    expect(g.REACH[1]).toBeGreaterThan(Math.max(...g.STOPS));
  });
  it('the gauge drawing has its moving parts and no stray text', async () => {
    const { gaugeSvg } = await import('../../v2/components/kit/gauge-art');
    const svg = gaugeSvg('label');
    for (const part of ['carriage', 'plunger', 'needle', 'lamp']) expect(svg).toContain(`data-part="${part}"`);
    expect(svg).not.toContain('<text');
    expect((svg.match(/class="iso-solid/g) ?? []).length).toBeGreaterThanOrEqual(40);
    expect(gaugeSvg('label')).toBe(svg);
  });
  it('stamps: one per stop, ids of their own, text left to HTML, named in both languages', async () => {
    const { STAMP_IDS, stampSvg } = await import('../../v2/components/kit/stamps');
    for (const id of STAMP_IDS) {
      const svg = stampSvg(id);
      expect(svg).toContain(`id="sp-${id}"`);
      expect(svg).not.toContain('<text');
      for (const m of [es, en]) expect(m.kit.stamps.items[id].name && m.kit.stamps.items[id].alt).toBeTruthy();
    }
  });
});

describe('v2 site header (lote 2.1)', () => {
  it('six pages in header order, each with its slug, name and line in both languages', async () => {
    const { SITE_PAGES } = await import('../../v2/site');
    expect(SITE_PAGES.map((p) => p.key)).toEqual(['home', 'work', 'how', 'brand', 'business', 'about']);
    expect(new Set(SITE_PAGES.map((p) => p.path)).size).toBe(SITE_PAGES.length);
    for (const p of SITE_PAGES) {
      expect(p.path === '' || /^[a-z-]+\/$/.test(p.path), p.path).toBe(true);
      for (const m of [es, en]) {
        const copy = m.site.pages[p.key];
        expect(copy.t.length, p.key).toBeGreaterThan(0);
        // one line in the phone menu at 360 px
        expect(copy.d.length, `${p.key}: ${copy.d}`).toBeLessThanOrEqual(38);
      }
    }
  });

  it('a pathname finds its page; the design system belongs to none', async () => {
    const { pageOf } = await import('../../v2/site');
    expect(pageOf('/v2/es/')).toBe('home');
    expect(pageOf('/v2/en')).toBe('home');
    expect(pageOf('/v2/es/work/')).toBe('work');
    expect(pageOf('/v2/en/como-trabajo')).toBe('how');
    expect(pageOf('/v2/es/brand-lab/')).toBe('brand');
    expect(pageOf('/v2/es/negocio/')).toBe('business');
    expect(pageOf('/v2/es/sobre-mi/')).toBe('about');
    for (const sys of ['tokens/', 'componentes/', 'piezas/', 'kit/']) expect(pageOf(`/v2/es/${sys}`)).toBeNull();
  });

  it('each page colour reads as a label on the page and on the menu; header text passes AA on the glass', async () => {
    const { SITE_PAGES } = await import('../../v2/site');
    for (const p of SITE_PAGES) for (const bg of [C.bg, C['bg-deep']]) expect(contrast(p.from, bg), `${p.key} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    // the pill is filled with ink-700 → surface-raised; its links are text-muted, the current one is heading
    for (const bg of [C['ink-700'], C['surface-raised']]) {
      expect(contrast(C['text-muted'], bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(C.heading, bg)).toBeGreaterThanOrEqual(4.5);
    }
    // the lines of the phone menu are text-subtle on bg-deep
    expect(contrast(C['text-subtle'], C['bg-deep'])).toBeGreaterThanOrEqual(4.5);
  });

  it('the header copy never names what is missing', () => {
    for (const m of [es, en]) expect(JSON.stringify(m.site)).not.toMatch(/próximamente|coming soon|en construcción|under construction|todavía|not yet/i);
  });
});
