import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../../lib/taller';
import { ZONES, zoneForPath } from '../../lib/zones';
import { PAGES } from '../../lib/nav';
import { CASE_SLUGS } from '../../lib/cases';

describe('music zones', () => {
  it('every page and case has a zone, the catalogue has none', () => {
    expect(zoneForPath('/')).toBe('inicio');
    for (const p of PAGES) expect(zoneForPath(p.href), p.href).toBeTruthy();
    for (const s of CASE_SLUGS) expect(zoneForPath(`/proyectos/${s}`), s).toBe('work');
    expect(zoneForPath('/catalogo')).toBeNull();
    expect(zoneForPath('/sobre-mi/#contacto')).toBe('about');
    expect(zoneForPath('/negocio/')).toBe('brand');
  });
  it('every home chapter has a zone, every zone is used and a zone never skips back and forth', () => {
    const used = new Set(CHAPTERS.map((c) => c.zone));
    for (const z of ZONES) expect(used.has(z), z).toBe(true);
    // zones come in runs (one cross-fade per change, not a flicker): inicio → work → brand → roadmap → about
    const order = CHAPTERS.map((c) => ZONES.indexOf(c.zone));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});
