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
    // the pill is filled with ink-600 → ink-700 (solid on touch screens); its links are text-muted, the current one is heading
    for (const bg of [C['ink-600'], C['ink-700'], C['surface-raised']]) {
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

describe('v2 motion engine (lote 2.2)', () => {
  const key = (k: string, mods: Partial<KeyboardEvent> = {}) => ({ key: k, ctrlKey: false, metaKey: false, altKey: false, repeat: false, defaultPrevented: false, ...mods });

  it('one key per action, and never while typing, with a modifier or on a held key', async () => {
    const { commandFor } = await import('../../v2/motion/shortcuts');
    expect(commandFor(key('?'), null, 6)).toEqual({ type: 'help' });
    expect(commandFor(key('1'), null, 6)).toEqual({ type: 'page', index: 0 });
    expect(commandFor(key('6'), null, 6)).toEqual({ type: 'page', index: 5 });
    expect(commandFor(key('7'), null, 6)).toBeNull();
    expect(commandFor(key('T'), null, 6)).toEqual({ type: 'top' });
    expect(commandFor(key('m'), null, 6)).toEqual({ type: 'sound' });
    expect(commandFor(key('l'), null, 6)).toEqual({ type: 'lang' });
    expect(commandFor(key('x'), null, 6)).toBeNull();
    for (const mods of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { repeat: true }, { defaultPrevented: true }]) expect(commandFor(key('2', mods), null, 6)).toBeNull();
    const typing = { closest: (sel: string) => (sel.includes('input') ? {} : null) } as unknown as Element;
    expect(commandFor(key('2'), typing, 6)).toBeNull();
    expect(commandFor(key('?'), typing, 6)).toBeNull();
  });

  it('the help names every shortcut in both languages', async () => {
    const { SHORTCUTS } = await import('../../v2/motion/shortcuts');
    for (const m of [es, en]) for (const s of SHORTCUTS) expect(m.engine.help.actions[s.action].length, s.action).toBeGreaterThan(0);
  });

  it('the camera follows the menu: forward, back, and depth for pages off the menu', async () => {
    const { cameraMove, samePath } = await import('../../v2/motion/camera');
    expect(cameraMove(0, 3)).toBe('forward');
    expect(cameraMove(4, 1)).toBe('back');
    expect(cameraMove(-1, 2)).toBe('depth');
    expect(cameraMove(2, -1)).toBe('depth');
    expect(samePath('/v2/es/work/', '/v2/es/work')).toBe(true);
    expect(samePath('/v2/es/work/', '/v2/es/')).toBe(false);
  });
});

describe('v2 generative music (lote 2.3)', () => {
  it('names the chords of each page motif', async () => {
    const { ZONES, chordName, barDegree } = await import('../../v2/sound/compose');
    const prog = (z: keyof typeof ZONES) => ZONES[z].prog.map((_, i) => chordName(ZONES[z], barDegree(ZONES[z], i)));
    expect(prog('home')).toEqual(['Dmaj7', 'A7', 'Bm7', 'Gmaj7']);
    expect(prog('work')).toEqual(['G7', 'Fmaj7', 'Cmaj7', 'G7']);
    expect(prog('how')).toEqual(['Am7', 'D7', 'Am7', 'Gmaj7']);
    expect(prog('brand')).toEqual(['E♭maj7', 'F7', 'E♭maj7', 'B♭maj7']);
    expect(prog('about')).toEqual(['Cmaj7', 'Em7', 'Am7', 'Fmaj7']);
  });

  it('every proposal writes sound notes on every page: in range, in the bar, in the key, the same every time', async () => {
    const { STYLES, STYLE_IDS, ZONES, MODES, degree } = await import('../../v2/sound/compose');
    const PITCHED = new Set(['pad', 'pluck', 'arp', 'keys', 'lead', 'bass', 'chime']);
    for (const id of STYLE_IDS) for (const [zk, z] of Object.entries(ZONES)) {
      const scale = new Set(MODES[z.mode].map((s) => (z.root + s) % 12));
      for (let bar = 0; bar < 16; bar++) {
        const ev = STYLES[id].compose(bar, z);
        expect(ev.length, `${id} ${zk} ${bar}`).toBeGreaterThan(3);
        expect(STYLES[id].compose(bar, z)).toEqual(ev);
        for (const e of ev) {
          expect(e.beat).toBeGreaterThanOrEqual(0);
          expect(e.beat).toBeLessThan(4);
          expect(e.vel).toBeGreaterThan(0);
          expect(e.vel).toBeLessThanOrEqual(1);
          if (!PITCHED.has(e.voice)) continue;
          expect(e.midi, `${id} ${zk} ${e.voice}`).toBeGreaterThanOrEqual(28);
          expect(e.midi, `${id} ${zk} ${e.voice}`).toBeLessThanOrEqual(100);
          // only the walking bass of «Taller» steps outside the key, on its last beat, into the next root
          if (!(id === 'taller' && e.voice === 'bass' && e.beat === 3)) expect(scale.has(e.midi % 12), `${id} ${zk} ${e.voice} ${e.midi}`).toBe(true);
        }
      }
      expect(degree(z, 7)).toBe(12);
    }
  });

  it('a motif comes back every four bars', async () => {
    const { STYLES, ZONES } = await import('../../v2/sound/compose');
    const pluck = (bar: number) => STYLES.marea.compose(bar, ZONES.home).filter((e) => e.voice === 'pluck');
    expect(pluck(4)).toEqual(pluck(0));
    const lead = (bar: number) => STYLES.taller.compose(bar, ZONES.about).filter((e) => e.voice === 'lead');
    expect(lead(5)).toEqual(lead(1));
  });

  it('each page plays its proposal: Circuito for the site, Taller on Work, Marea on the calm pages', async () => {
    const { ZONE_STYLE, ZONES, STYLE_IDS } = await import('../../v2/sound/compose');
    expect(Object.keys(ZONE_STYLE).sort()).toEqual(Object.keys(ZONES).sort());
    expect(ZONE_STYLE.home).toBe('circuito');
    expect(ZONE_STYLE.work).toBe('taller');
    expect(new Set(Object.values(ZONE_STYLE))).toEqual(new Set(STYLE_IDS));
  });

  it('swing pushes only the off-beat eighths', async () => {
    const { swingBeat } = await import('../../v2/sound/compose');
    expect(swingBeat(1.5, 0.62)).toBeCloseTo(1.62);
    expect(swingBeat(2, 0.62)).toBe(2);
    expect(swingBeat(2.25, 0.62)).toBe(2.25);
  });

  it('level meter and WAV writer', async () => {
    const { levels, wav } = await import('../../v2/sound/analyze');
    const a = new Float32Array(1000).fill(0.5);
    const l = levels([a, a], 1000);
    expect(l.peak).toBeCloseTo(0.5);
    expect(l.rmsDb).toBeCloseTo(-6.02, 1);
    const w = wav([a, a], 1000);
    expect(w.length).toBe(44 + 1000 * 4);
    expect(String.fromCharCode(...w.slice(0, 4))).toBe('RIFF');
  });

  it('the music page names every proposal and every page key in both languages', async () => {
    const { STYLE_IDS, ZONES } = await import('../../v2/sound/compose');
    for (const m of [es, en]) {
      for (const id of STYLE_IDS) expect(m.music.styles[id].name.length).toBeGreaterThan(0);
      for (const z of Object.keys(ZONES)) expect(m.music.zones.keys[z as keyof typeof m.music.zones.keys].length).toBeGreaterThan(0);
    }
  });
});

describe('v2 gate (lote 3.1)', () => {
  it('the metal mark is the drawn one: same stem, G, bar and dot, inside the 48 box', async () => {
    const THREE = await import('three');
    const { createMark, markMetal, MARK_DOT, MARK_FOOT } = await import('../../v2/gate/scene/monogram');
    const mark = createMark(markMetal(), false);
    for (let i = 0; i < 3; i++) mark.draw(i, 1);
    const box = new THREE.Box3().setFromObject(mark.group);
    // the SVG is 48 wide with the mark between x 9.3…44.2 and y 14.3…42.7 (stroke 3.4): centred and y up, that is
    expect(box.min.x).toBeCloseTo(-14.7, 1);
    expect(box.max.x).toBeCloseTo(20.2, 1);
    expect(box.min.y).toBeCloseTo(-19.7, 1);
    expect(box.max.y).toBeCloseTo(10.7, 1);
    expect(Math.abs(box.max.z)).toBeCloseTo(1.7, 2);
    expect(MARK_DOT).toEqual({ x: -13, y: 17, r: 3.4 }); // the dot of the SVG: (11, 7)
    expect(MARK_FOOT).toBeCloseTo(-18.7, 5);
    // half drawn, the tip of the G is on its circle
    const tip = mark.draw(1, 0.5);
    expect(Math.hypot(tip.x - 5.773, tip.y + 4.497)).toBeCloseTo(13.5, 3);
  });

  it('every 3D rig builds itself in four moves, stays finite, and has a point for each label the page hangs on it', async () => {
    const THREE = await import('three');
    const { RIGS } = await import('../../v2/gate/scene');
    const { TAG_AFTER, GATE_VARIANTS } = await import('../../v2/gate/state');
    for (const v of GATE_VARIANTS) {
      if (v === 'cinetica') continue; // the 2D gate: no rig
      for (const after of TAG_AFTER[v]) { expect(after).toBeGreaterThanOrEqual(0); expect(after).toBeLessThanOrEqual(4); }
      if (v === 'postal') continue; // prints its stamps on canvases: it is built in the browser tests
      const rig = RIGS[v]({ coarse: false, reduced: false, scene: new THREE.Scene(), bloom: {} as never });
      expect(rig.durations, v).toHaveLength(4);
      expect(rig.anchors?.length ?? 0, v).toBe(TAG_AFTER[v].length);
      expect(rig.floorY, v).toBeLessThan(rig.frame.y);
      for (const p of [[0, 0, 0, 0], [1, 0.4, 0, 0], [1, 1, 1, 0.5], [1, 1, 1, 1]]) {
        rig.update(p, 3.2, 16);
        rig.root.updateMatrixWorld(true);
        rig.root.traverse((o) => { for (const n of o.matrixWorld.elements) expect(Number.isFinite(n), `${v} ${o.type}`).toBe(true); });
      }
      // built, the object fits the frame the camera keeps in its box (with room for labels and reflection)
      const box = new THREE.Box3();
      rig.root.traverse((o) => { if (o.type === 'Mesh' && o.visible && (o as unknown as { geometry: { type: string } }).geometry.type !== 'RingGeometry') box.expandByObject(o); });
      expect(box.max.x - box.min.x, v).toBeLessThanOrEqual(rig.frame.w * 1.25);
      rig.dispose();
    }
    expect(TAG_AFTER.postal).toHaveLength(6);
  });

  it('the script that decides the gate shows it only on a full load of the home', async () => {
    const { gateScript, GATE_KEY } = await import('../../v2/gate/state');
    const run = (path: string, stored: string | null, base = '') => {
      const html = { dataset: {} as Record<string, string> };
      const env = { document: { documentElement: html, addEventListener: () => {} }, location: { pathname: base + path }, localStorage: { getItem: (k: string) => (k === GATE_KEY ? stored : null) } };
      new Function('document', 'location', 'localStorage', gateScript(base))(env.document, env.location, env.localStorage);
      return html.dataset.gate;
    };
    expect(run('/v2/es/', null)).toBe('on');
    expect(run('/v2/en', null)).toBe('on');
    expect(run('/v2/es/', 'off')).toBe('off');
    expect(run('/v2/es/work/', null)).toBe('off');
    expect(run('/v2/es/tokens/', null)).toBe('off');
    expect(run('/v2/es/', null, '/portafolio-2026')).toBe('on');
    expect(run('/v2/es/sobre-mi/', null, '/portafolio-2026')).toBe('off');
    // the preview of each version shows its gate; the page that lists them does not
    expect(run('/v2/es/puerta/codigo/', null)).toBe('on');
    expect(run('/v2/en/puerta/postal', null, '/portafolio-2026')).toBe('on');
    expect(run('/v2/es/puerta/', null)).toBe('off');
  });

  it('four versions, each with its name and its three lines in both languages; the roadmap has its four stages', async () => {
    const { GATE_VARIANTS, STEPS } = await import('../../v2/gate/state');
    expect(GATE_VARIANTS).toEqual(['cinetica', 'monograma', 'codigo', 'ascenso', 'postal']);
    for (const m of [es, en]) {
      for (const v of GATE_VARIANTS) for (const k of ['name', 'theme', 'piece', 'loading'] as const) expect(m.gate.choose.items[v][k].length, `${v}.${k}`).toBeGreaterThan(0);
      for (const st of STEPS) expect(m.gate.steps[st].length).toBeGreaterThan(0);
      expect(m.gate.stages.map((x) => x.year)).toEqual(['2026', '2028', '2028', '2029']);
      expect(m.gate.arrival).toBe('2030');
    }
    expect(es.gate.stages.map((x) => x.name)).toEqual(['Núcleo', 'Ciberseguridad', 'Quant', 'Aeroespacial']);
  });

  it('the colours of the 2D gate: every screen is readable (AA), the surname and the focus ring stand out, and the opening returns to ink', async () => {
    const { GATE_THEMES, GATE_INTRO, GATE_CYCLE } = await import('../../v2/gate/themes');
    for (const [name, t] of Object.entries(GATE_THEMES)) {
      expect(contrast(t.fg, t.bg), `${name} fg`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.soft, t.bg), `${name} soft`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.btnFg, t.btn), `${name} button`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.alt, t.bg), `${name} surname (large type)`).toBeGreaterThanOrEqual(3);
      expect(contrast(t.focus, t.bg), `${name} focus`).toBeGreaterThanOrEqual(3);
      expect(contrast(t.btn, t.bg), `${name} button on its field`).toBeGreaterThanOrEqual(1.5);
      expect(t.edge, `${name} edge`).not.toBe(t.bg);
    }
    expect(GATE_INTRO).toHaveLength(5); // one colour per act, and the rest
    expect(GATE_INTRO[0]).toBe('ink');
    expect(GATE_INTRO[4]).toBe('ink');
    for (let i = 1; i < GATE_INTRO.length; i++) expect(GATE_INTRO[i]).not.toBe(GATE_INTRO[i - 1]);
    expect(new Set(GATE_CYCLE).size).toBe(GATE_CYCLE.length);
    expect(GATE_CYCLE[0]).toBe('ink');
  });

  it('the gate has its words in both languages', () => {
    for (const m of [es, en]) for (const k of ['label', 'meet', 'enter', 'loading', 'ready', 'progress', 'key', 'edition', 'tint'] as const) expect(m.gate[k].length).toBeGreaterThan(0);
    for (const m of [es, en]) for (const k of ['codigo', 'ascenso', 'postal'] as const) expect(m.gate.tags[k].length).toBeGreaterThan(0);
  });
});

describe('v2 home (lote 3.2)', () => {
  it('four objects, drawn: one lit piece each, no text inside, and a text for each in both languages', async () => {
    const { WHAT_ART, WHAT_IDS, WHAT_BOX } = await import('../../v2/components/home/what-art');
    expect(WHAT_IDS).toEqual(['ai', 'full', 'quality', 'motion']);
    for (const id of WHAT_IDS) {
      const art = WHAT_ART[id];
      expect(art.match(/class="hw-acc"/g) ?? [], id).toHaveLength(1);
      expect(art, id).not.toMatch(/<text|NaN|undefined/);
      expect(art.match(/class="hw-shadow"/g) ?? [], id).toHaveLength(1);
      // every coordinate inside the box, with room for the jump
      const nums = [...art.matchAll(/[ML]\s*(-?[\d.]+)[ ,](-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
      expect(nums.length, id).toBeGreaterThan(20);
      for (const [x, y] of nums) { expect(x, id).toBeGreaterThan(-2); expect(x, id).toBeLessThan(WHAT_BOX.width + 2); expect(y, id).toBeGreaterThan(-2); expect(y, id).toBeLessThan(WHAT_BOX.height + 2); }
      for (const m of [es, en]) for (const k of ['t', 'd', 'proof'] as const) expect(m.home.what.items[id][k].length, `${id}.${k}`).toBeGreaterThan(0);
    }
  });

  it('recruiter first: no visible paragraph of the home is longer than 25 words, in either language', () => {
    const words = (s: string) => s.trim().split(/\s+/).length;
    for (const m of [es, en]) {
      const texts = [...Object.values(m.home.what.items).map((i) => i.d), ...Object.values(m.home.cases.items).map((i) => i.text), m.home.contact.lead, ...m.home.stats.items.map((i) => i.d)];
      for (const t of texts) expect(words(t), t).toBeLessThanOrEqual(25);
      for (const t of [m.home.what.title, m.home.cases.title, m.home.doors.title, m.home.contact.title]) expect(words(t), t).toBeLessThanOrEqual(8);
    }
  });

  it('three figures, the approved ones, with the date of the run that counted the tests', () => {
    expect(es.home.stats.items.map((i) => i.n)).toEqual(['2021', '1.374', '11']);
    expect(en.home.stats.items.map((i) => i.n)).toEqual(['2021', '1,374', '11']);
    expect(es.home.stats.items[1].d).toContain('28/10/2026');
    expect(en.home.stats.items[1].d).toContain('10/28/2026');
  });

  it('the home speaks in positive: nothing announces what is missing', () => {
    for (const m of [es, en]) expect(JSON.stringify(m.home)).not.toMatch(/\b(sin|no hay|falta|pendiente|todavía no|not yet|missing|without|no screenshots)\b/i);
  });
});

describe('v2 world of Work (lote 4.1)', () => {
  it('seventeen islands, each with its words in both languages, and nothing written inside the drawing', async () => {
    const { WORLD_IDS, WORLD_SVG, WORLD_ISLES, WORLD_BOX, WORLD_GROUP_OF, WORLD_GROUPS } = await import('../../v2/components/work/world-art');
    expect(WORLD_IDS).toHaveLength(17);
    expect(new Set(WORLD_IDS).size).toBe(17);
    expect(WORLD_SVG).not.toMatch(/<text|NaN|undefined|Infinity/);
    for (const m of [es, en]) {
      expect(Object.keys(m.world.places)).toEqual(WORLD_IDS);
      for (const id of WORLD_IDS) for (const k of ['name', 'when', 'state', 'text', 'art'] as const) expect(m.world.places[id as keyof typeof m.world.places][k].length, `${id}.${k}`).toBeGreaterThan(0);
      for (const g of WORLD_GROUPS) expect(m.world.groups[g].length).toBeGreaterThan(0);
    }
    // the journey in order: where it began, the work, my own path, what comes next
    expect(WORLD_IDS.map((id) => WORLD_GROUP_OF[id]).join(' ')).toBe(['origin', ...Array(3).fill('work'), ...Array(9).fill('own'), ...Array(4).fill('next')].join(' '));
    for (const id of WORLD_IDS) {
      const [x, y, w, h] = WORLD_ISLES[id].box;
      expect(w, id).toBeGreaterThan(120);
      expect(h, id).toBeGreaterThan(90);
      expect(x, id).toBeGreaterThanOrEqual(WORLD_BOX.x);
      expect(y, id).toBeGreaterThanOrEqual(WORLD_BOX.y);
      expect(x + w, id).toBeLessThanOrEqual(WORLD_BOX.x + WORLD_BOX.width);
      expect(y + h, id).toBeLessThanOrEqual(WORLD_BOX.y + WORLD_BOX.height);
    }
  });

  it('no building is drawn twice: every island is made of a different set of pieces', async () => {
    const { WORLD_IDS, WORLD_ISLES } = await import('../../v2/components/work/world-art');
    // what an island is made of, whatever its place on the map: the kind of every piece, in the order it is painted
    const made = (svg: string) => [...svg.matchAll(/class="([^"]+)"/g)].map((m) => m[1]).filter((c) => !/^wa-isle|^iso-(fill|shade|top|line)/.test(c)).join('|');
    const seen = WORLD_IDS.map((id) => made(WORLD_ISLES[id].svg));
    expect(new Set(seen).size).toBe(17);
    for (const s of seen) expect(s.split('|').length).toBeGreaterThanOrEqual(10);
  });

  it('what exists is solid and what is planned is under construction: dashed outline, scaffold or crane, only on the roadmap', async () => {
    const { WORLD_IDS, WORLD_ISLES, WORLD_GROUP_OF, WORLD_SVG } = await import('../../v2/components/work/world-art');
    for (const id of WORLD_IDS) {
      const svg = WORLD_ISLES[id].svg, site = /wa-wire/.test(svg) && /wa-crane|wa-scaf/.test(svg) && /wa-pole/.test(svg);
      expect(site, id).toBe(WORLD_GROUP_OF[id] === 'next');
      if (WORLD_GROUP_OF[id] !== 'next') expect(svg, id).not.toMatch(/wa-wire|wa-crane|wa-scaf/);
    }
    // the path: travelled up to the last project of my own, dashed from there on
    expect(WORLD_SVG.match(/class="wa-path wa-path--plan"/g) ?? []).toHaveLength(1);
    expect(WORLD_SVG.match(/class="wa-node"/g) ?? []).toHaveLength(13);
    expect(WORLD_SVG.match(/class="wa-node wa-node--plan"/g) ?? []).toHaveLength(4);
  });

  it('the world speaks in positive, in sentences a recruiter reads at a glance', () => {
    const words = (t: string) => t.trim().split(/\s+/).length;
    for (const m of [es, en]) {
      expect(JSON.stringify(m.world)).not.toMatch(/\b(sin|no hay|falta|pendiente|todavía no|not yet|missing|without|nothing)\b/i);
      for (const p of Object.values(m.world.places)) { expect(words(p.text), p.text).toBeLessThanOrEqual(25); expect(words(p.art), p.art).toBeLessThanOrEqual(25); }
    }
    for (const id of ['nucleo', 'ciber', 'quant', 'espacio'] as const) { expect(es.world.places[id].state).toBe('En el roadmap'); expect(en.world.places[id].state).toBe('On the roadmap'); }
  });
});
