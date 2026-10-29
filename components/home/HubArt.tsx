import type { CSSProperties } from 'react';
import { asset } from '@/lib/site';
import { WORK_SHOT, WORK_SHOT_800 } from '@/lib/cases';
import { SKILL_ROWS } from '@/lib/home';
import type { PageKey } from '@/lib/nav';
import { TechIcon } from '../diagrams/TechIcon';

/**
 * The small drawing on each hub card, taken from the page it leads to and kept static (no observers, no loops):
 * the work covers, the method loop, the skills ledger, the build-measure-learn ring, the journey's branches.
 * Decorative: the card's text says the same.
 */
export function HubArt({ id }: { id: PageKey }) {
  switch (id) {
    case 'work':
      return (
        <div className="ha ha--work" aria-hidden="true">
          {(['eclipse', 'complia', 'tuenti'] as const).map((k, i) => (
            <img key={k} className="ha__shot" style={{ '--i': i } as CSSProperties} src={asset(WORK_SHOT_800[k] ?? WORK_SHOT[k]!)} alt="" width={800} height={500} loading="lazy" decoding="async" />
          ))}
        </div>
      );
    case 'how': {
      const st: [number, number][] = [[110, 40], [200, 40], [290, 40], [290, 120], [200, 120], [110, 120]];
      return (
        <svg className="ha ha--svg" viewBox="0 0 400 160" aria-hidden="true">
          <path className="ha__track" d="M70 40H330A40 40 0 0 1 330 120H70A40 40 0 0 1 70 40Z" />
          <path className="ha__arc" d="M70 40H200" />
          {st.map(([x, y], i) => (
            <g key={i} className={i === 0 ? 'ha__st ha__st--on' : 'ha__st'}>
              <circle cx={x} cy={y} r={15} />
              <text x={x} y={y + 4.5} fontSize={13} textAnchor="middle">{String(i + 1).padStart(2, '0')}</text>
            </g>
          ))}
        </svg>
      );
    }
    case 'skills':
      return (
        <div className="ha ha--skills" aria-hidden="true">
          {SKILL_ROWS.filter((r) => ['react', 'node', 'rag', 'security', 'python'].includes(r.id)).map((r) => (
            <div key={r.id} className="ha__row">
              <TechIcon id={r.id} className="ha__icon" />
              {(['work', 'own', 'study'] as const).map((c) => <i key={c} className="ha__dot" data-col={c} data-on={r.at.includes(c) || undefined} />)}
            </div>
          ))}
        </div>
      );
    case 'business': {
      const C = 80, R = 52;
      const at = (deg: number) => [C + R * Math.cos((deg * Math.PI) / 180), C + R * Math.sin((deg * Math.PI) / 180)] as const;
      return (
        <svg className="ha ha--svg" viewBox="0 0 400 160" aria-hidden="true">
          <circle className="ha__track" cx={C} cy={C} r={R} />
          <path className="ha__arc" d={`M${C} ${C - R}A${R} ${R} 0 0 1 ${at(30)[0]} ${at(30)[1]}`} />
          {[-90, 30, 150].map((d, i) => { const [x, y] = at(d); return <circle key={d} className={i === 0 ? 'ha__node ha__node--on' : 'ha__node'} cx={x} cy={y} r={14} />; })}
          {/* red ocean → blue ocean */}
          <path className="ha__sea ha__sea--red" d="M170 70c18-10 36 10 54 0s36-10 54 0" />
          <path className="ha__sea ha__sea--blue" d="M250 110c18-10 36 10 54 0s36-10 54 0" />
          <path className="ha__track" d="M196 92C230 92 250 92 280 108" />
        </svg>
      );
    }
    default:
      return (
        <svg className="ha ha--svg" viewBox="0 0 400 160" aria-hidden="true">
          <path className="ha__main" d="M24 120H376" />
          {[[70, 60], [130, 40], [190, 70], [250, 30], [310, 54]].map(([x, y], i) => (
            <g key={x} style={{ '--o': i } as CSSProperties}>
              <path className="ha__branch" d={`M${x - 26} 120C${x - 6} 120 ${x - 16} ${y} ${x} ${y}`} />
              <circle className="ha__commit" cx={x} cy={y} r={6} />
            </g>
          ))}
          <circle className="ha__seed" cx={24} cy={120} r={8} />
          <circle className="ha__end" cx={376} cy={120} r={8} />
        </svg>
      );
  }
}
