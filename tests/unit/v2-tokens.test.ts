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
  it('fourteen places, each with its words in both languages, and nothing written inside the drawing', async () => {
    const { WORLD_IDS, WORLD_SVG, WORLD_ISLES, WORLD_BOX, WORLD_GROUP_OF, WORLD_GROUPS } = await import('../../v2/components/work/world-art');
    expect(WORLD_IDS).toEqual(['mdp', 'tach', 'ada', 'tsoft', 'eclipse', 'agentes', 'kinetic', 'volta', 'velmar', 'dentalos', 'games', 'lucero', 'trazo', 'nucleo']);
    expect(WORLD_SVG).not.toMatch(/<text|NaN|undefined|Infinity/);
    for (const m of [es, en]) {
      expect(Object.keys(m.world.places)).toEqual(WORLD_IDS);
      for (const id of WORLD_IDS) for (const k of ['name', 'when', 'state', 'text', 'art'] as const) expect(m.world.places[id as keyof typeof m.world.places][k].length, `${id}.${k}`).toBeGreaterThan(0);
      for (const g of WORLD_GROUPS) expect(m.world.groups[g].length).toBeGreaterThan(0);
    }
    // the journey in order: where it began, the work, my own path and, of what comes next, only Núcleo (Ignacio, 18/11/2026)
    expect(WORLD_IDS.map((id) => WORLD_GROUP_OF[id]).join(' ')).toBe(['origin', ...Array(3).fill('work'), ...Array(9).fill('own'), 'next'].join(' '));
    expect([es.world.groups.next, en.world.groups.next]).toEqual(['Proyectos futuros', 'Future projects']);
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

  it('one land in diagonal bands, travelled sideways: a band per place (two for Núcleo), a stop on each, its name readable on its ground', async () => {
    const { WORLD_IDS, WORLD_SVG, WORLD_BOX, WORLD_STOPS, WORLD_ISLES } = await import('../../v2/components/work/world-art');
    // a strip: many screens wide, and it starts at 0 so the map can measure it
    expect([WORLD_BOX.x, WORLD_BOX.y]).toEqual([0, 0]);
    expect(WORLD_BOX.width / WORLD_BOX.height).toBeGreaterThan(10);
    // every band is one ground with its own clip; the land has no gaps: 15 grounds, 14 steps between them
    expect(WORLD_SVG.match(/class="wa wa-band"/g) ?? []).toHaveLength(15);
    expect(WORLD_SVG.match(/class="wa-land"/g) ?? []).toHaveLength(15);
    expect(WORLD_SVG.match(/class="wa-step wa-tone"/g) ?? []).toHaveLength(14);
    // the drawing travels once: every id in it is unique, and a place on its own is shown by reference
    const ids = [...WORLD_SVG.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(46); // 15 grounds, 15 clips, 15 stands and the gradient of the night glow
    for (const id of WORLD_IDS) { const refs = [...WORLD_ISLES[id].svg.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]); expect(refs.length, id).toBeGreaterThanOrEqual(2); for (const r of refs) expect(ids, `${id} → ${r}`).toContain(r); expect(WORLD_ISLES[id].svg, id).not.toMatch(/<path|<circle/); }
    expect((WORLD_ISLES.nucleo.svg.match(/<use/g) ?? []).length).toBe(4);
    // the stops go left to right, in the order of the journey, each with room around it (Ignacio: «más espacio a cada zona»)
    expect(WORLD_STOPS.map((s) => s.id)).toEqual(WORLD_IDS);
    WORLD_STOPS.forEach((s, i) => {
      if (i) expect(s.x - WORLD_STOPS[i - 1].x, s.id).toBeGreaterThan(440);
      expect(s.x, s.id).toBeGreaterThan(0);
      expect(s.x, s.id).toBeLessThan(WORLD_BOX.width);
      expect(s.label[1], s.id).toBeLessThanOrEqual(WORLD_BOX.height);
      // its name and its button are written over the ground in front: ink on a light band, paper on a dark one, AA either way
      expect(contrast(s.ink, s.on), `${s.id} label`).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('every band is a biome in soft tones: something lies on its ground, nothing is cut by a border, and no ground is a pure brand colour', async () => {
    const { WORLD_SVG, WORLD_DROPPED } = await import('../../v2/components/work/world-art');
    // what was asked for and did not fit in its band would have been left out: nothing was
    expect(WORLD_DROPPED).toEqual([]);
    const bands = WORLD_SVG.split('<g class="wa wa-band"').slice(1).map((b) => b.split('<path class="wa-step')[0]);
    expect(bands).toHaveLength(15);
    const hsl = (hex: string) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; return { s: mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1)), l }; };
    for (const b of bands) {
      const id = b.match(/data-id="(\w+)"/)![1], ground = b.match(/--g0:(#[0-9a-f]{6})/)![1];
      // a biome: at least six things on the ground, of three kinds or more
      const kinds = new Set([...b.matchAll(/class="(wa-(?:water|seaf|hill|drift|peak|leaf|rock|dune|road|g2|g3|park|wheat|track|floor|row|speck|petal|flower|px|tuft)[^"]*|iso-solid wa-(?:mass|bale))"/g)].map((m) => m[1].split(' ').pop()));
      expect(kinds.size, `${id}: ${[...kinds].join(' ')}`).toBeGreaterThanOrEqual(3);
      // comfortable to look at for a whole screen: light grounds are not saturated, dark ones are deep
      const { s, l } = hsl(ground);
      expect(l > 0.6 ? s * (1 - l) < 0.3 : l < 0.3, `${id} ${ground} s=${s.toFixed(2)} l=${l.toFixed(2)}`).toBe(true);
    }
  });

  it('no building is drawn twice: every place is made of a different set of pieces', async () => {
    const { WORLD_IDS, WORLD_SVG } = await import('../../v2/components/work/world-art');
    // what stands on a place, whatever its spot on the map: the kind of every piece, in the order it is painted
    const stands = (id: string) => WORLD_SVG.split('<g class="wa wa-isle"').slice(1).filter((g) => g.includes(`data-id="${id}"`)).join('');
    const made = (svg: string) => [...svg.matchAll(/class="([^"]+)"/g)].map((m) => m[1]).filter((c) => !/^wa-(isle|on)|^iso-(fill|shade|top|line)/.test(c)).join('|');
    const seen = WORLD_IDS.map((id) => made(stands(id)));
    expect(new Set(seen).size).toBe(14);
    for (const s of seen) expect(s.split('|').length).toBeGreaterThanOrEqual(10);
  });

  it('what exists is solid and what is planned is under construction: dashed outline, scaffold or crane, only on the projects to come', async () => {
    const { WORLD_IDS, WORLD_GROUP_OF, WORLD_SVG } = await import('../../v2/components/work/world-art');
    const stands = (id: string) => WORLD_SVG.split('<g class="wa wa-isle"').slice(1).filter((g) => g.includes(`data-id="${id}"`)).join('');
    for (const id of WORLD_IDS) {
      const svg = stands(id), site = /wa-wire/.test(svg) && /wa-crane|wa-scaf/.test(svg) && /wa-pole/.test(svg);
      expect(site, id).toBe(WORLD_GROUP_OF[id] === 'next');
      if (WORLD_GROUP_OF[id] !== 'next') expect(svg, id).not.toMatch(/wa-wire|wa-crane|wa-scaf/);
    }
    // the path: travelled up to the last project of my own, dashed from there on
    expect(WORLD_SVG.match(/class="wa-path wa-path--plan"/g) ?? []).toHaveLength(1);
    expect(WORLD_SVG.match(/class="wa-node"/g) ?? []).toHaveLength(13);
    expect(WORLD_SVG.match(/class="wa-node wa-node--plan"/g) ?? []).toHaveLength(1);
  });

  it('every stop has its postcard: the stamp of the kit where there is one, printed from its own drawing where there is not', async () => {
    const { WORLD_IDS, WORLD_SVG } = await import('../../v2/components/work/world-art');
    const { WORLD_POSTALS } = await import('../../v2/components/work/world-stamps');
    expect(Object.keys(WORLD_POSTALS)).toEqual(WORLD_IDS);
    expect(WORLD_POSTALS.tsoft.map((p) => p.kit)).toEqual(['tuenti', 'complia', 'supernova']);
    expect([WORLD_POSTALS.tach[0].kit, WORLD_POSTALS.ada[0].kit, WORLD_POSTALS.eclipse[0].kit]).toEqual(['tach', 'ada', 'eclipse']);
    const keys = Object.values(WORLD_POSTALS).flat().map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const id of WORLD_IDS) for (const p of WORLD_POSTALS[id]) {
      expect(p.svg, id).not.toMatch(/<text|NaN|undefined|Infinity/);
      expect(p.svg, id).toContain(`mask id="sp-${p.key}"`);
      if (!p.kit) { const ref = p.svg.match(/href="#(wst\d+)"/)![1]; expect(WORLD_SVG, id).toContain(` id="${ref}"`); for (const m of [es, en]) expect((m.world.places[id as keyof typeof m.world.places] as { mark?: string }).mark, `${id} mark`).toBeTruthy(); }
    }
  });

  it('the world speaks in positive, in sentences a recruiter reads at a glance, and says what I did at every stop', () => {
    const words = (t: string) => t.trim().split(/\s+/).length;
    type Place = { text: string; art: string; state: string; facts: { k: string; v: string }[]; inside?: Record<string, { name: string; state: string; text: string; facts: { k: string; v: string }[] }> };
    for (const m of [es, en]) {
      expect(JSON.stringify(m.world)).not.toMatch(/\b(sin|no hay|falta|pendiente|todavía no|not yet|missing|without|nothing)\b/i);
      expect(JSON.stringify(m.world)).not.toMatch(/\bSsr\b|HandyX|vibe coding/);
      for (const p of Object.values(m.world.places) as Place[]) {
        expect(words(p.text), p.text).toBeLessThanOrEqual(25);
        expect(words(p.art), p.art).toBeLessThanOrEqual(25);
        expect(p.facts.length, p.text).toBeGreaterThanOrEqual(3);
        for (const f of [...p.facts, ...Object.values(p.inside ?? {}).flatMap((i) => i.facts)]) { expect(f.k.length).toBeGreaterThan(1); expect(f.v.length).toBeGreaterThan(1); expect(words(f.v), f.v).toBeLessThanOrEqual(14); }
        for (const i of Object.values(p.inside ?? {})) expect(words(i.text), i.text).toBeLessThanOrEqual(25);
      }
      expect(Object.keys((m.world.places.tsoft as Place).inside!)).toEqual(['tuenti', 'complia', 'supernova']);
    }
    expect([es.world.places.nucleo.state, en.world.places.nucleo.state]).toEqual(['Proyecto futuro', 'Future project']);
    expect((es.world.places.tsoft as Place).facts.find((f) => f.k === 'Puesto')!.v).toContain('Sr AI Fullstack Developer');
  });
});

describe('v2 life of the world (lote 4.3)', () => {
  it('a crate is a rigid body: thrown, it flies, bounces, tumbles and comes to rest square, inside the land', async () => {
    const { body, step, toss, faces, twirl, SQUARE_COUNT, EDGE } = await import('../../v2/components/work/crates');
    expect(SQUARE_COUNT).toBe(24);
    const walls = { x0: 24, x1: 7000, y0: 70, y1: 510 };
    const at = (b: { p: number[] }) => [(b.p[0] - b.p[1]) * 0.8944, (b.p[0] + b.p[1]) * 0.4472];
    // at rest nothing moves it, and it shows three faces
    const still = body(400, 200);
    expect(step(still, 0.016, walls)).toBe(0);
    expect(still.p).toEqual([400, 200, EDGE / 2]);
    expect(faces(still)).toHaveLength(3);
    for (const [vx, vy] of [[300, -120], [-260, 80], [40, 500], [0, 0], [-500, -500]]) {
      const b = body(420, 180);
      b.held = true; twirl(b, 0.3);
      toss(b, vx, vy);
      expect(b.rest).toBe(false);
      let hits = 0, top = 0, steps = 0;
      while (!b.rest && steps < 2000) {
        if (step(b, 0.008, walls) > 0) hits++;
        top = Math.max(top, b.p[2]);
        steps++;
        // never under the ground, never out of the land
        expect(b.p[2]).toBeGreaterThan(EDGE / 2 - 0.01);
        const [sx, sy] = at(b);
        expect(sx).toBeGreaterThanOrEqual(walls.x0 - 0.5); expect(sx).toBeLessThanOrEqual(walls.x1 + 0.5);
        expect(sy).toBeGreaterThanOrEqual(walls.y0 - 0.5); expect(sy).toBeLessThanOrEqual(walls.y1 + 0.5);
        for (const f of faces(b)) { expect(f.d).not.toMatch(/NaN/); expect(f.lit).toBeGreaterThanOrEqual(0); expect(f.lit).toBeLessThanOrEqual(1); }
      }
      // it left the hand upward, hit the ground more than once, and stopped in under 16 s of its own time
      expect(top, `${vx},${vy}`).toBeGreaterThan(EDGE);
      expect(hits, `${vx},${vy}`).toBeGreaterThanOrEqual(2);
      expect(b.rest, `${vx},${vy}`).toBe(true);
      // square on the ground: flat, still, three faces again
      expect(b.p[2]).toBeCloseTo(EDGE / 2, 5);
      expect(b.v).toEqual([0, 0, 0]);
      expect(faces(b)).toHaveLength(3);
    }
  });

  it('people walk the path near every stop and a crate waits by each, all inside the land and clear of the names', async () => {
    const { WORLD_WALKERS, WORLD_CRATES, WORLD_IDS, WORLD_BOX, WORLD_STOPS } = await import('../../v2/components/work/world-art');
    for (const id of WORLD_IDS) {
      expect(WORLD_WALKERS.filter((w) => w.id === id).length, id).toBeGreaterThanOrEqual(1);
      expect(WORLD_CRATES.filter((c) => c.id === id).length, id).toBeGreaterThanOrEqual(1);
    }
    expect(WORLD_CRATES.filter((c) => c.id === 'games')).toHaveLength(3);
    for (const w of WORLD_WALKERS) {
      for (const [x, y] of [[w.x, w.y], [w.x + w.dx, w.y + w.dy]]) { expect(x).toBeGreaterThan(0); expect(x).toBeLessThan(WORLD_BOX.width); expect(y).toBeGreaterThan(300); expect(y).toBeLessThan(WORLD_BOX.height - 70); }
      expect(Math.hypot(w.dx, w.dy)).toBeGreaterThan(40);
      expect(w.dur).toBeGreaterThan(3);
      // what they wear is a colour of the brand; the rest of them reads on their ground
      expect(w.c).toMatch(/^#[0-9a-f]{6}$/);
    }
    for (const c of WORLD_CRATES) {
      const stop = WORLD_STOPS.find((s) => s.id === c.id)!;
      expect(c.y).toBeLessThan(WORLD_BOX.height - 60);
      // to the right of the name of its stop
      expect(c.x - stop.label[0], c.id).toBeGreaterThan(95);
    }
  });

  it('by night every name over the land is still readable, and what moves has its movement written', async () => {
    const { WORLD_STOPS, WORLD_SVG } = await import('../../v2/components/work/world-art');
    const { readFileSync } = await import('node:fs');
    const css = readFileSync('app/v2/[locale]/world.css', 'utf8');
    const mix = (a: string, b: string, t: number) => `#${[1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * t + parseInt(b.slice(i, i + 2), 16) * (1 - t)).toString(16).padStart(2, '0')).join('')}`;
    // the stylesheet's own recipe for the night ground: 30 % of the day colour into #0d0b3a
    expect(css).toContain('--g: color-mix(in srgb, var(--g0) 30%, #0d0b3a)');
    for (const s of WORLD_STOPS) {
      const night = mix(s.on, '#0d0b3a', 0.3);
      expect(contrast('#eeeae3', night), `${s.id} name at night on ${night}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast('#14124a', '#eeeae3')).toBeGreaterThanOrEqual(4.5);
    // every kind of living part in the drawing has its animation in the stylesheet, under reduced-motion: no-preference
    const kinds = new Set([...WORLD_SVG.matchAll(/class="[^"]*\bwl (wl-[a-z]+)|class="[^"]*\bwl wl-[a-z]+ (wl-[a-z]+--[a-z]+)|\bwl (wl-[a-z]+)"/g)].map((m) => m[1] ?? m[2] ?? m[3]));
    expect([...kinds].sort()).toEqual(expect.arrayContaining(['wl-ball', 'wl-blink', 'wl-bob', 'wl-clock', 'wl-flick', 'wl-nod', 'wl-pulse', 'wl-rot', 'wl-smoke', 'wl-spin', 'wl-sweep', 'wl-twinkle', 'wl-wave']));
    const moving = css.slice(css.indexOf('── life (lote 4.3)'));
    for (const k of kinds) expect(moving, k).toContain(`[data-live] .${k} {`);
    // and nothing of it runs outside those conditions: no animation is declared on a living part without them
    for (const line of css.split('\n').filter((l) => /\.wl-[a-z-]+ \{ animation/.test(l))) expect(line, line).toContain(".ws[data-life='on'][data-seen] [data-live]");
    // what turns, turns in its own plane: a matrix lays it down and one rotate moves it
    expect(WORLD_SVG.match(/<g transform="matrix\([^)]+\)"><g class="wl wl-(spin|sweep|clock|nod)/g)!.length).toBeGreaterThanOrEqual(5);
  });
});


describe('v2 world from the ground (lote 4.3, primera persona)', () => {
  it('the car answers the pedals and the wheel, and stops at what is in its way', async () => {
    const { car, drive, CAR } = await import('../../v2/components/work/drive/car');
    const open = (x: number, y: number): [number, number] => [x, y];
    // gas: it gathers speed, never past its top; let go: it coasts to a stop and stays there
    const c = car(0, 0, 0);
    for (let i = 0; i < 600; i++) drive(c, { gas: 1, turn: 0 }, 1 / 60, [], [], open);
    expect(c.v).toBeGreaterThan(CAR.top * 0.9);
    expect(c.v).toBeLessThanOrEqual(CAR.top);
    expect(c.x).toBeGreaterThan(900);
    expect(Math.abs(c.y)).toBeLessThan(1e-6);
    for (let i = 0; i < 600; i++) drive(c, { gas: 0, turn: 0 }, 1 / 60, [], [], open);
    expect(c.v).toBe(0);
    const rest = [c.x, c.y, c.a];
    for (let i = 0; i < 60; i++) drive(c, { gas: 0, turn: 0 }, 1 / 60, [], [], open);
    expect([c.x, c.y, c.a]).toEqual(rest);
    // the brake stops it before it goes backwards, and reverse is slower than forward
    const r = car(0, 0, 0);
    for (let i = 0; i < 600; i++) drive(r, { gas: -1, turn: 0 }, 1 / 60, [], [], open);
    expect(r.v).toBeLessThan(0);
    expect(r.v).toBeGreaterThanOrEqual(-CAR.back);
    // the wheel: right is right (the heading grows, and the car leaves its line to the right-hand side)
    const t = car(0, 0, 0);
    for (let i = 0; i < 90; i++) drive(t, { gas: 1, turn: 1 }, 1 / 60, [], [], open);
    expect(t.a).toBeGreaterThan(0.2);
    expect(t.y).toBeGreaterThan(1);
    const l = car(0, 0, 0);
    for (let i = 0; i < 90; i++) drive(l, { gas: 1, turn: -1 }, 1 / 60, [], [], open);
    expect(l.a).toBeCloseTo(-t.a, 6);
    // a wall: it never gets inside, it loses its speed, and the hit is reported once it lands
    const w = car(0, 0, 0);
    let hit = 0;
    for (let i = 0; i < 400; i++) { hit = Math.max(hit, drive(w, { gas: 1, turn: 0 }, 1 / 60, [[100, -50, 140, 50]], [], open)); expect(w.x).toBeLessThanOrEqual(100 - CAR.r + 1e-6); }
    expect(hit).toBeGreaterThan(0.1);
    expect(Math.abs(w.v)).toBeLessThan(40);
    // a post (someone walking, a crate at rest) is gone round, not through
    const p = car(0, 0.5, 0);
    for (let i = 0; i < 400; i++) { drive(p, { gas: 1, turn: 0 }, 1 / 60, [], [[80, 0, 3]], open); expect(Math.hypot(p.x - 80, p.y)).toBeGreaterThanOrEqual(CAR.r + 3 - 1e-6); }
    // the fence keeps it on the land
    const f = car(0, 0, 0);
    for (let i = 0; i < 600; i++) drive(f, { gas: 1, turn: 0 }, 1 / 60, [], [], (x, y) => [Math.min(200, x), y]);
    expect(f.x).toBeLessThanOrEqual(200);
  });

  it('the autopilot takes the car to its mark: it joins the way, never overshoots and arrives still', async () => {
    const { along, car, nearest, pathOf, pilot, PILOT, trip } = await import('../../v2/components/work/drive/car');
    const way = pathOf([[0, 0], [300, 0], [600, 200], [900, 200], [1200, -100]]);
    expect(way.length).toBeGreaterThan(1300);
    expect(nearest(way, 150, 40)).toBeCloseTo(150, 6);
    expect(along(way, 300)).toMatchObject({ x: 300, y: 0 });
    for (const [from, to, start] of [[0, way.at[3], [0, 0]], [way.at[3], way.at[1], [900, 200]], [0, way.length, [40, 90]]] as [number, number, [number, number]][]) {
      const c = car(start[0], start[1], 1), t = trip(c, way, to);
      let n = 0, top = 0, done = false, gap = Math.abs(to - t.s);
      while (!done && n < 4000) {
        done = pilot(c, t, way, 1 / 60); n += 1; top = Math.max(top, t.v);
        // it only ever gets nearer to its mark
        expect(Math.abs(to - t.s)).toBeLessThanOrEqual(gap + 1e-9); gap = Math.abs(to - t.s);
      }
      expect(done).toBe(true);
      expect(n).toBeLessThan(60 * 14);
      expect(top).toBeLessThanOrEqual(PILOT.top);
      const end = along(way, to);
      expect(Math.hypot(c.x - end.x, c.y - end.y)).toBeLessThan(0.05);
      expect(c.v).toBe(0);
      expect(from).toBeGreaterThanOrEqual(0);
    }
  });

  it('the land in 3D is the same land: built from the same bands, light, and with every moving part', async () => {
    const { buildWorld } = await import('../../v2/components/work/drive/build');
    const { WORLD_STOPS, WORLD_BOX } = await import('../../v2/components/work/world-art');
    const world = buildWorld(WORLD_STOPS.map((s) => s.node), WORLD_STOPS.findIndex((s) => s.group === 'next'));
    // a few tens of thousands of triangles in three draw calls: light enough for a phone
    expect(world.count.lit).toBeGreaterThan(12000);
    expect(world.count.lit + world.count.glow).toBeLessThan(45000);
    expect(world.count.lines).toBeGreaterThan(1500);
    expect(world.group.children.length).toBeLessThan(12);
    for (const child of world.group.children.slice(0, 3)) {
      const pos = (child as unknown as { geometry: { attributes: { position: { array: Float32Array } } } }).geometry.attributes.position.array;
      expect(pos.every((v) => Number.isFinite(v))).toBe(true);
    }
    // what turns on the map turns here: the lighthouse, the two wheels, the sundial, the pump and the windmill
    expect(world.spinners.map((s) => s.kind.split(' ')[0]).sort()).toEqual(['wl-clock', 'wl-nod', 'wl-rot--fast', 'wl-spin', 'wl-spin', 'wl-sweep']);
    // there is something to drive round in every part of the land, and the way past every door is clear
    expect(world.walls.length).toBeGreaterThan(100);
    const KX = 0.8944, KY = 0.4472;
    for (const s of WORLD_STOPS) {
      const x = (s.node[0] / KX + s.node[1] / KY) / 2 + 30 * Math.SQRT1_2, y = (s.node[1] / KY - s.node[0] / KX) / 2 + 30 * Math.SQRT1_2;
      const blocked = world.walls.filter((w) => x > w[0] - 7.5 && x < w[2] + 7.5 && y > w[1] - 7.5 && y < w[3] + 7.5);
      expect(blocked, `where the car parks at ${s.id}`).toEqual([]);
      expect(s.tall, s.id).toBeGreaterThan(10);
      expect(s.home[0]).toBeGreaterThan(0); expect(s.home[0]).toBeLessThan(WORLD_BOX.width);
    }
    world.dispose();
  });

  it('the two views and the car have their words in both languages, in a positive voice', () => {
    for (const m of [es, en]) {
      const w = m.world;
      expect(Object.keys(w.views)).toEqual(['label', 'iso', 'drive']);
      expect(Object.keys(w.drive).sort()).toEqual(Object.keys(es.world.drive).sort());
      for (const v of [...Object.values(w.views), ...Object.values(w.drive)]) {
        expect(v.trim().length).toBeGreaterThan(0);
        expect(v).not.toMatch(/\b(sin|no hay|falta|pendiente|todavía no|not yet|missing|without|nothing)\b/i);
      }
    }
    expect(es.world.views.drive).toBe('Primera persona');
    expect(en.world.views.drive).toBe('First person');
  });
});

describe('v2 cases (lote 5.1)', () => {
  const words = (v: unknown): number => typeof v === 'string' ? v.split(/\s+/).filter(Boolean).length : Array.isArray(v) ? v.reduce((a: number, x) => a + words(x), 0) : v && typeof v === 'object' ? Object.values(v).reduce((a: number, x) => a + words(x), 0) : 0;
  const strings = (v: unknown): string[] => typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
  const keysOf = (v: unknown, p = ''): string[] => Array.isArray(v) ? v.flatMap((x, i) => keysOf(x, `${p}[${i}]`)) : v && typeof v === 'object' ? Object.entries(v).flatMap(([k, x]) => [`${p}.${k}`, ...keysOf(x, `${p}.${k}`)]) : [];
  /** A figure may be written in words in the record («Las cuatro piezas»). */
  const SPELLED: Record<string, Record<string, string>> = { es: { 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco', 6: 'seis' }, en: { 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six' } };

  it('every case has its words in both languages, with the same keys, and its media and links in place', async () => {
    const fs = await import('node:fs');
    const { CASES, CASE_ORDER, nextCase, casesAt } = await import('../../v2/components/case/cases');
    const { caseCopy } = await import('../../v2/components/case/copy');
    expect(CASE_ORDER).toHaveLength(10);
    expect(CASE_ORDER[0]).toBe('complia');
    expect(new Set(CASE_ORDER.map(nextCase)).size).toBe(10);
    expect(casesAt('tsoft').sort()).toEqual(['complia', 'supernova', 'tuenti']);
    for (const slug of CASE_ORDER) {
      const d = CASES[slug], es = caseCopy('es', slug), en = caseCopy('en', slug);
      expect(keysOf(en), slug).toEqual(keysOf(es));
      for (const m of [d.film, ...d.gallery]) {
        for (const f of [m.src, m.poster].filter(Boolean) as string[]) expect(fs.existsSync(`public${f}`), `${slug}: ${f}`).toBe(true);
      }
      // a caption and an alt for every picture of the gallery, and nothing else
      expect(Object.keys(es.gallery).sort(), slug).toEqual(d.gallery.map((g) => g.id).sort());
      for (const l of d.links) expect(l.href).toMatch(/^https:\/\//);
      // Tuenti: an illustration of my own, never a capture
      if (slug === 'tuenti') expect([d.film, ...d.gallery].every((m) => !m.src?.endsWith('.mp4') && !m.src?.endsWith('.webp'))).toBe(true);
    }
  });

  it('every case says it in ≤ 40 % of the words of the published one, in three layers', async () => {
    const fs = await import('node:fs');
    const { CASE_ORDER } = await import('../../v2/components/case/cases');
    const { caseCopy } = await import('../../v2/components/case/copy');
    for (const slug of CASE_ORDER) for (const l of ['es', 'en'] as const) {
      const old = JSON.parse(fs.readFileSync(`messages/cases/${l}/${slug}.json`, 'utf8'));
      const c = caseCopy(l, slug);
      expect(words(c), `${slug} ${l}`).toBeLessThanOrEqual(Math.floor(words(old) * 0.4));
      // what is read in 30 seconds stays short
      for (const s of [c.line, ...c.ten.map((x) => x.v), ...c.decisions.map((x) => x.why)]) expect(words(s), `${slug} ${l}: ${s}`).toBeLessThanOrEqual(25);
      for (const s of c.how.map((x) => x.d)) expect(words(s), `${slug} ${l}: ${s}`).toBeLessThanOrEqual(15);
      for (const s of c.more.map((x) => x.p)) expect(words(s), `${slug} ${l}: ${s}`).toBeLessThanOrEqual(40);
      expect([c.facts.length, c.ten.length, c.decisions.length, c.film.verbs.length]).toEqual([3, 3, 3, 3]);
      expect(c.how.length).toBeGreaterThanOrEqual(3);
      expect(c.how.length).toBeLessThanOrEqual(5);
      expect(c.film.numbers.length).toBeLessThanOrEqual(3);
      for (const v of c.film.verbs) expect(v, slug).toMatch(/^\S+( \S+)?\.$/);
    }
  });

  it('every figure of a film is in the approved record, and the voice is senior and positive', async () => {
    const fs = await import('node:fs');
    const { CASE_ORDER } = await import('../../v2/components/case/cases');
    const { caseCopy } = await import('../../v2/components/case/copy');
    const VOICE = { es: /\b(sin|no|nunca|todavía|falta|pendiente)\b/i, en: /\b(no|not|never|without|yet|missing|lack)\b|n't\b/i };
    for (const slug of CASE_ORDER) for (const l of ['es', 'en'] as const) {
      const record = fs.readFileSync(`messages/cases/${l}/${slug}.json`, 'utf8');
      const c = caseCopy(l, slug);
      for (const x of c.film.numbers) {
        const found = record.includes(x.n) || (SPELLED[l][x.n] && new RegExp(`\\b${SPELLED[l][x.n]}\\b`, 'i').test(record));
        expect(found, `${slug} ${l}: ${x.n}`).toBeTruthy();
      }
      for (const s of strings(c)) {
        expect(s, `${slug} ${l}`).not.toMatch(VOICE[l]);
        expect(s).not.toMatch(/vibe coding|\bSsr\b|handyx/i);
      }
      if (c.next) expect(c.next).toMatch(l === 'es' ? /^Próximo paso: / : /^Next step: /);
    }
    for (const l of ['es', 'en'] as const) for (const s of strings((l === 'es' ? es : en).case)) expect(s).not.toMatch(VOICE[l]);
  });
});

describe('v2 living architecture (lote 5.2)', () => {
  const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
  it('every case but Tuenti has its architecture, drawn from the published diagram, and every piece has its place', async () => {
    const { CASE_ORDER } = await import('../../v2/components/case/cases');
    const { ARCH_OF, archOf, archSpec } = await import('../../v2/components/case/arch/archs');
    expect(Object.keys(ARCH_OF).sort()).toEqual(CASE_ORDER.filter((s) => s !== 'tuenti').sort());
    for (const slug of Object.keys(ARCH_OF) as (keyof typeof ARCH_OF)[]) {
      const spec = archSpec(slug)!, art = archOf(slug)!;
      expect(spec, slug).toBeTruthy();
      for (const p of ARCH_OF[slug]!.planned ?? []) expect(spec.nodes.map((n) => n.id), slug).toContain(p);
      // a cell per piece: two pieces never stand on the same square
      expect(new Set(art.nodes.map((n) => n.cell.join())).size, slug).toBe(art.nodes.length);
      // names and labels fall inside the drawing
      for (const p of [...art.nodes, ...art.edges, ...art.zones]) { expect(p.at[0], slug).toBeGreaterThanOrEqual(0); expect(p.at[0]).toBeLessThanOrEqual(100); expect(p.at[1]).toBeGreaterThanOrEqual(0); expect(p.at[1]).toBeLessThanOrEqual(100); }
      for (const e of art.edges) expect(e.len, `${slug} ${e.id}`).toBeGreaterThan(20);
      // what is planned is a wireframe, and so is every connection to it
      expect(art.nodes.filter((n) => n.planned).map((n) => n.id).sort()).toEqual([...(ARCH_OF[slug]!.planned ?? [])].sort());
      expect(art.svg).not.toMatch(/<text/);
    }
  });

  it('its words: every piece and connection in both languages, short, and in a positive voice', async () => {
    const { ARCH_OF, archSpec } = await import('../../v2/components/case/arch/archs');
    const { archCopy } = await import('../../v2/components/case/arch/copy');
    const VOICE = { es: /\b(sin|no|nunca|todavía|falta|pendiente)\b/i, en: /\b(no|not|never|without|yet|missing|lack)\b|n't\b/i };
    for (const slug of Object.keys(ARCH_OF) as (keyof typeof ARCH_OF)[]) {
      const spec = archSpec(slug)!;
      for (const l of ['es', 'en'] as const) {
        const c = archCopy(l, slug)!;
        expect(c, `${slug} ${l}`).toBeTruthy();
        expect(Object.keys(c.nodes), `${slug} ${l}`).toEqual(spec.nodes.map((n) => n.id));
        expect(Object.keys(c.edges), `${slug} ${l}`).toEqual(spec.edges.map((e) => e.id));
        expect(Object.keys(c.groups ?? {}).sort(), `${slug} ${l}`).toEqual((spec.groups ?? []).map((g) => g.id).sort());
        expect(words(c.caption), `${slug} ${l} caption`).toBeLessThanOrEqual(25);
        for (const [id, n] of Object.entries(c.nodes)) {
          for (const k of ['label', 'sub', 'note'] as const) expect(n[k]?.trim(), `${slug} ${l} ${id}.${k}`).toBeTruthy();
          expect(words(n.note), `${slug} ${l} ${id}`).toBeLessThanOrEqual(22);
        }
        for (const [id, e] of Object.entries(c.edges)) { expect(e.trim(), `${slug} ${l} ${id}`).toBeTruthy(); expect(words(e)).toBeLessThanOrEqual(4); }
        const all = JSON.stringify(c);
        for (const s of all.match(/"[^"]*"/g) ?? []) expect(s, `${slug} ${l}`).not.toMatch(VOICE[l]);
        expect(all).not.toMatch(/vibe coding|\bSsr\b|handyx/i);
      }
    }
    // CompliA is a generic scheme, and says so
    expect(archCopy('es', 'complia')!.badge).toBeTruthy();
    expect(archCopy('en', 'complia')!.badge).toBeTruthy();
  });
});

describe('v2 case objects (lote 5.3)', () => {
  it('every case has its object, with one phase per step and a part for every phase', async () => {
    const { CASE_ORDER } = await import('../../v2/components/case/cases');
    const { caseCopy } = await import('../../v2/components/case/copy');
    const { objectArt } = await import('../../v2/components/case/objects/object-art');
    for (const slug of CASE_ORDER) {
      const n = caseCopy('es', slug).how.length;
      expect(caseCopy('en', slug).how.length, slug).toBe(n);
      const a = objectArt(slug, n);
      const marks = [...a.svg.matchAll(/<g data-(from|only|now)="(\d+)"( data-on)?>/g)].map((m) => ({ k: m[1], i: Number(m[2]), on: !!m[3] }));
      // every phase brings or lights something, and no part belongs to a phase the case lacks
      for (let i = 0; i < n; i++) expect(marks.some((m) => m.i === i), `${slug} phase ${i}`).toBe(true);
      expect(Math.max(...marks.map((m) => m.i)), slug).toBe(n - 1);
      // the HTML is the last phase: everything that came is there, what belongs only to another step is not
      for (const m of marks) expect(m.on, `${slug} ${m.k} ${m.i}`).toBe(m.k === 'from' ? true : m.i === n - 1);
      // a drawing: no text in it, and a frame with room
      expect(a.svg).not.toMatch(/<text/);
      expect(a.box[2]).toBeGreaterThan(200);
      expect(a.box[3]).toBeGreaterThan(150);
    }
  });
});
