import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';
import { DECISIONS, SITE_AGENTS } from '../../lib/howsite';

const dir = join(__dirname, '../../.claude/agents');
const frontmatter = (f: string) => Object.fromEntries(readFileSync(join(dir, f), 'utf8').split('---')[1].trim().split('\n').map((l) => [l.slice(0, l.indexOf(':')), l.slice(l.indexOf(':') + 1).trim().replace(/^"|"$/g, '')]));

describe('Cómo se hizo este portafolio (Ola 11)', () => {
  it('the nine agents are the ones defined in .claude/agents, each with the model its file declares', () => {
    const files = readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')).sort();
    expect(SITE_AGENTS.map((a) => a.id).sort()).toEqual(files);
    for (const a of SITE_AGENTS) expect(frontmatter(`${a.id}.md`).model, a.id).toBe(a.model);
  });

  it('Opus on the design and data-scene agents, Sonnet on content, sound and three.js', () => {
    const by = (m: string) => SITE_AGENTS.filter((a) => a.model === m).map((a) => a.id).sort();
    expect(by('sonnet')).toEqual(['content-guardian', 'media-prompt-writer', 'sound-designer', 'three-engineer']);
    expect(by('opus')).toHaveLength(5);
  });

  it('copy in both languages: a name and a role per agent, and six decisions (tried, chose, why)', () => {
    for (const m of [es, en]) {
      const a = m.howsite.agents as Record<string, { name: string; role: string }>;
      for (const ag of SITE_AGENTS) expect(a[ag.id].name && a[ag.id].role, ag.id).toBeTruthy();
      expect(m.howsite.decisions).toHaveLength(DECISIONS);
      for (const d of m.howsite.decisions) expect(d.t && d.tried && d.chose && d.why, d.t).toBeTruthy();
    }
  });

  it('honesty: it does not claim the agents run on their own; Scroll World runs no pipeline; Remotion is tested, not added; no «vibe coding»', () => {
    for (const m of [es, en]) {
      const all = JSON.stringify(m.howsite);
      expect(all).not.toMatch(/vibe/i);
    }
    expect(es.howsite.agentsNote).toMatch(/No afirmo que corran solos/);
    expect(en.howsite.agentsNote).toMatch(/do not claim they run on their own/);
    const sw = es.howsite.decisions.find((d) => d.t === 'Scroll World')!;
    expect(sw.chose).toMatch(/no se corre su pipeline/);
    const rm = es.howsite.decisions.find((d) => d.t === 'Remotion')!;
    expect(rm.chose).toMatch(/no lo sumé/);
  });

  it('the numbers it quotes come from the case-steps measurement (11.651 px of 23.000)', () => {
    expect(es.howsite.decisions[4].tried).toMatch(/23\.000/);
    expect(es.howsite.decisions[4].chose).toMatch(/11\.651/);
  });
});
