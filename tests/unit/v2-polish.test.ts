import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SFX_TRIM } from '../../v2/sound/engine';
import { tokens } from '../../v2/tokens';

/** The pass of motion and sound (lote 9.1): one set of times and curves for every micro-interaction, one press for
 *  every button, and a mix where every small sound sits at the same level over the music. */
const DIR = 'app/v2/[locale]/';
/** Choreographies with their own timing, on purpose: the gate's acts, the counter that rolls (approved in 1.4) and
 *  the design systems of the products, which keep the product's own motion. */
const OWN_TIMING = ['gate.css', 'dsx.css'];

describe('v2 motion and sound pass (lote 9.1)', () => {
  it('every transition of the site uses the motion tokens: three times and three curves', () => {
    expect(Object.keys(tokens.motion)).toEqual(['ease', 'ease-in-out', 'spring', 'fast', 'base', 'slow', 'stagger']);
    expect(tokens.motion.spring).toMatch(/^cubic-bezier\(/);
    const off: string[] = [];
    for (const f of readdirSync(DIR).filter((x) => x.endsWith('.css') && !OWN_TIMING.includes(x))) {
      const css = readFileSync(DIR + f, 'utf8');
      for (const m of css.matchAll(/transition(?:-duration|-timing-function|-delay)?:\s*([^;]+);/g)) {
        const v = m[1];
        if (/^none|^0m?s/.test(v.trim()) || v.includes('!important')) continue;
        if (f === 'signature.css' && v.includes('1300ms')) continue; // the counter, as approved
        if (/\b\d+m?s\b|cubic-bezier|var\(--ease\)/.test(v.replace(/var\([^)]*\)/g, ''))) off.push(`${f}: ${v}`);
      }
    }
    expect(off).toEqual([]);
  });

  it('one press for every button: it gives under the finger with the individual scale, never with reduced motion', () => {
    const css = readFileSync(DIR + 'motion.css', 'utf8');
    const block = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: no-preference)'));
    expect(block).toMatch(/:active\s*\{\s*scale:\s*0\.96;\s*\}/);
    expect(block).toMatch(/:not\(:disabled, \.ui-btn/);
  });

  it('the small sounds have their trim in the mix, all of them', () => {
    expect(Object.keys(SFX_TRIM).sort()).toEqual(['accent', 'day', 'grab', 'horn', 'night', 'open', 'stop', 'thud']);
    for (const v of Object.values(SFX_TRIM)) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(20); }
  });
});
