import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';
import { CASE_SLUGS } from '../../lib/cases';
import { STATIONS } from '../../lib/career';
import { AUDIENCE_WIDTHS, EXAMPLES, FLOW_PROJECTS, FUNNEL_PROJECTS, RAIL_PROJECTS, TOPICS, funnelWidths } from '../../lib/negocio';

type Item = { t: string; d: string };
type Stage = { t: string; m: string };
const msgs = [es, en] as unknown as { negocio: Record<string, any> }[];
const statusOf = (slug: string) => STATIONS.flatMap((s) => s.buildings).find((b) => b.slug === slug)?.status;

describe('Negocio y marketing (lib/negocio.ts, Ola 8b)', () => {
  it('six topics, each with a label, a title and an idea in both languages', () => {
    expect(TOPICS).toHaveLength(6);
    for (const m of msgs) for (const id of TOPICS) for (const k of ['label', 'title', 'idea']) expect(m.negocio.topics[id][k], `${id}.${k}`).toBeTruthy();
  });

  it('every example points to a project with a case page and a status, and has copy in both languages', () => {
    for (const [id, projects] of Object.entries(EXAMPLES)) {
      expect(projects.length, id).toBeGreaterThanOrEqual(3);
      expect(projects.length, id).toBeLessThanOrEqual(5);
      for (const p of projects) { expect(CASE_SLUGS as readonly string[], p).toContain(p); expect(statusOf(p), p).toBeTruthy(); }
      for (const m of msgs) {
        const items = m.negocio.topics[id].items as Item[];
        expect(items, id).toHaveLength(projects.length);
        for (const it of items) expect(it.t && it.d, id).toBeTruthy();
      }
    }
  });

  it('the figures have all their copy: flows, audience, touchpoints, rails and five funnels', () => {
    for (const m of msgs) {
      const t = m.negocio.topics;
      for (const p of FLOW_PROJECTS) { expect(t.models.flows[p].n, p).toHaveLength(3); expect(t.models.flows[p].e, p).toHaveLength(2); expect(t.models.flows[p].c).toBeTruthy(); }
      expect(t.digital.aud.steps).toHaveLength(AUDIENCE_WIDTHS.length);
      for (const k of ['qr', 'nfc', 'pass', 'counter']) expect(t.physical.touch[k], k).toBeTruthy();
      for (const p of RAIL_PROJECTS) expect((t.ops.rails[p] as string[]).length, p).toBeGreaterThanOrEqual(4);
      for (const p of FUNNEL_PROJECTS) {
        const st = t.funnels.f[p] as Stage[];
        expect(st.length, p).toBeGreaterThanOrEqual(5);
        expect(st.length, p).toBeLessThanOrEqual(9);
        for (const s of st) { expect(s.t && s.m, p).toBeTruthy(); expect(s.t.length, `${p}: ${s.t}`).toBeLessThanOrEqual(26); }
      }
      expect(t.funnels.legend).toMatch(/medido|measured/i);
    }
    // same stages in both languages
    for (const p of FUNNEL_PROJECTS) expect(en.negocio.topics.funnels.f[p as 'volta'].length).toBe(es.negocio.topics.funnels.f[p as 'volta'].length);
  });

  it('funnels narrow stage by stage (illustrative widths)', () => {
    for (const n of [5, 7, 8]) { const w = funnelWidths(n); expect(w[0]).toBe(100); for (let i = 1; i < n; i++) expect(w[i]).toBeLessThan(w[i - 1]); }
    for (let i = 1; i < AUDIENCE_WIDTHS.length; i++) expect(AUDIENCE_WIDTHS[i]).toBeLessThan(AUDIENCE_WIDTHS[i - 1]);
  });

  it('honesty: no amounts or prices, no client brand, no results, no QR for DentalOS', () => {
    for (const m of msgs) {
      const all = JSON.stringify(m.negocio);
      expect(all).not.toMatch(/\$\s?\d|US\$|\bUSD\b|\bARS\b|\d+\s?%\s?(más|more)\b|conversi[oó]n (del|de) \d|\d+ ?clientes|tiendanube/i);
      expect(all).not.toMatch(/instagram\.com|@[a-z0-9_.]+\.|telef[oó]nica|movistar|tuenti|pancho|lola|\bFINO\b/i);
    }
    const physical = EXAMPLES.physical as readonly string[];
    expect(physical).not.toContain('dentalos');
    expect(JSON.stringify(es.negocio.topics.physical)).not.toMatch(/dental/i);
  });

  it('every page of the site that pointed to the books keeps a way to them', () => {
    for (const m of [es, en]) expect((m as any).negocio.books.cta).toBeTruthy();
    expect(Object.keys(es.business.books)).toEqual(['lean', 'mom', 'blue']);
  });
});
