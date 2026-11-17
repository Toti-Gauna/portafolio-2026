import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';
import { CASE_SLUGS } from '../../lib/cases';
import { RECRUITER_CASES } from '../../lib/recruiters';
import { STATIONS } from '../../lib/career';

type Row = { k: string; v: string };

describe('Para reclutadores (Ola 8d)', () => {
  it('three existing cases, each with its line in both languages', () => {
    expect(RECRUITER_CASES).toHaveLength(3);
    for (const slug of RECRUITER_CASES) {
      expect(CASE_SLUGS as readonly string[]).toContain(slug);
      for (const m of [es, en]) expect((m.recruiters.cases as Record<string, string>)[slug], slug).toBeTruthy();
    }
  });

  it('the sheet repeats only what the site already approved: role, places and dates from the path', () => {
    for (const m of [es, en]) {
      const sheet = m.recruiters.sheet as Row[];
      expect(sheet).toHaveLength(7);
      const all = sheet.map((r) => r.v).join(' ');
      expect(all).toContain(m.intro.role);
      expect(all).toMatch(/2021 – 2022/);
      expect(all).toMatch(/2023 – 2024/);
      expect(all).toMatch(/2024/);
      expect(all).toMatch(/11/);
    }
    const dates = Object.fromEntries(Object.entries(es.career.st).map(([k, v]) => [k, (v as { when: string }).when]));
    expect(dates.tach).toBe('2021 – 2022');
    expect(dates.ada).toBe('2023 – 2024');
    expect(dates.tsoft).toBe('2024 – hoy');
    expect(STATIONS.map((s) => s.id)).toEqual(expect.arrayContaining(['tach', 'ada', 'tsoft']));
  });

  it('what Ignacio decided on 17/11/2026: no Upwork, no salary, no availability, no languages or time zone anywhere', () => {
    for (const m of [es, en]) {
      const all = JSON.stringify(m).toLowerCase();
      expect(all).not.toMatch(/upwork|fiverr|freelancer\.com/);
      const mine = JSON.stringify(m.recruiters).toLowerCase();
      expect(mine).not.toMatch(/salari|sueldo|salary|expectativ|disponibilidad|availab|zona horaria|time zone|remoto|remote|idiomas|languages|usd|\$\s?\d/);
    }
  });

  it('the lead says what he asked: new opportunities to keep developing and advance his career, with an international outlook', () => {
    expect(es.recruiters.lead).toMatch(/seguir desarrollándome y avanzando en mi carrera/);
    expect(es.recruiters.lead).toMatch(/internacional/);
    expect(en.recruiters.lead).toMatch(/keep growing and move my career forward/);
    expect(en.recruiters.lead).toMatch(/international/);
  });
});
