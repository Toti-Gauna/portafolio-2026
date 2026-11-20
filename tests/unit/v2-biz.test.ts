import { describe, expect, it } from 'vitest';
import es from '../../messages/v2/biz/es.json';
import en from '../../messages/v2/biz/en.json';
import { FUNNEL, LOOP, MODEL, PRICING, SALE_BEATS, UNIT } from '../../v2/components/biz/data';
import { breakeven, campaignEconomics, commercialPrice, landedCost, marginPct, proposedPrice, recipeCost, suggestedPrice, unitEconomics } from '../../v2/components/biz/econ';

/** «Negocio» of /v2 (lote 6.2): the formulas give the repos' own numbers, and the words keep the page's rules. */
describe('v2 business (lote 6.2)', () => {
  it('Velmar: a recipe of materials, machine and hand minutes gives the panel’s suggested price', () => {
    const V = UNIT.velmar;
    const plate = recipeCost({ ...V.presets.plate, machineHour: V.machineHour, handHour: V.handHour });
    expect(plate).toEqual({ materials: 2975, machine: 2000, hand: 1125, total: 6100 });
    expect(suggestedPrice(plate.total, V.margin)).toBe(12200);
    const collar = recipeCost({ ...V.presets.collar, machineHour: V.machineHour, handHour: V.handHour });
    expect(collar.total).toBe(7765);
    expect(suggestedPrice(collar.total, V.margin)).toBe(15600);
    expect(marginPct(12200, 6100)).toBe(50);
  });

  it('Volta: landed cost, the suggested price and the commercial rounding of its supplier list', () => {
    const landed = landedCost(UNIT.volta.supplier, UNIT.volta.packaging.reduce((a, b) => a + b, 0));
    expect(landed).toBe(27194);
    expect(suggestedPrice(landed, 35)).toBe(41900);
    expect(proposedPrice(landed, 35, '900')).toBe(41900);
    expect(commercialPrice(41838, '900')).toBe(41900);
    expect(commercialPrice(41900, '900')).toBe(41900); // a price ending in 900 stays
    expect(commercialPrice(41901, '900')).toBe(42900); // anything above goes up to the next one
    expect(commercialPrice(420, '900')).toBe(450);
    expect(commercialPrice(41838, '500')).toBe(42000);
    expect(suggestedPrice(1000, 95)).toBe(10000); // the margin is capped at 90 %
  });

  it('DentalOS: contribution, break-even and projection, with the cases of the repo’s test', () => {
    expect(unitEconomics(100, 0, 60, 5)).toEqual({ netRevenue: 100, contribution: 35, contributionPct: 0.35 });
    expect(unitEconomics(100, 10, 60, 5).contribution).toBe(25);
    expect(breakeven(100, 25)).toBe(4);
    expect(breakeven(100, 0)).toBeNull();
    expect(breakeven(100, -5)).toBeNull();
    const e = campaignEconomics(UNIT.dentalos); // S88, in pesos
    expect(e.unit.contribution).toBe(4500);
    expect(e.unit.contributionPct).toBe(0.375);
    expect(e.campaignCost).toBe(1300);
    expect(e.breakevenAttentions).toBe(1);
  });

  it('the words: same keys in both languages, the counts of the data, short paragraphs and a positive voice', () => {
    const keys = (o: unknown, p = ''): string[] => (o && typeof o === 'object' ? Object.entries(o).flatMap(([k, v]) => keys(v, `${p}.${k}`)) : [p]);
    expect(keys(en).sort()).toEqual(keys(es).sort());
    const strings = (o: unknown): string[] => (typeof o === 'string' ? [o] : o && typeof o === 'object' ? Object.values(o).flatMap(strings) : []);
    const NEG = { es: /\b(sin|no|nunca|todavía|falta|pendiente)\b/i, en: /\b(no|not|never|without|yet|missing|lack)\b|n't\b/i };
    for (const [lang, c] of [['es', es], ['en', en]] as const) {
      for (const s of strings(c)) {
        expect(s, lang).not.toMatch(NEG[lang]);
        expect(s.split(/\s+/).length, `${lang}: ${s}`).toBeLessThanOrEqual(25);
        // nothing measured is claimed, nothing a repo leaves open is stated as a rule
        expect(s, lang).not.toMatch(/tiendanube|métrica norte|north star|\bROI\b|\bCAC\b|\bLTV\b|\bseña\b|deposit/i);
      }
      expect(c.pricing.eclipse.levels).toHaveLength(PRICING.eclipseLevels);
      expect(c.pricing.lucero.plans).toHaveLength(PRICING.luceroPlans);
      expect(Object.keys(c.pricing.volta.steps)).toEqual([...PRICING.voltaOrder]);
      for (const p of Object.keys(FUNNEL) as (keyof typeof FUNNEL)[]) expect(c.funnel.items[p], `${lang} ${p}`).toHaveLength(FUNNEL[p].modules.length);
      for (const [p, n] of Object.entries(LOOP)) expect(c.loop.items[p as keyof typeof c.loop.items].steps, `${lang} ${p}`).toHaveLength(n!);
      expect(c.sale.beats).toHaveLength(SALE_BEATS.length);
      for (const [p, m] of Object.entries(MODEL)) {
        const t = c.model.items[p as keyof typeof c.model.items] as { nodes: Record<string, string>; links: Record<string, string> };
        for (const n of m.nodes) expect(t.nodes[n], `${lang} ${p} ${n}`).toBeTruthy();
        for (const l of m.links) expect(t.links[l.key], `${lang} ${p} ${l.key}`).toBeTruthy();
      }
    }
  });
});
