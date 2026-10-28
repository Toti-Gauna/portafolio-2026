import type { CSSProperties } from 'react';
import { InView } from '@/components/diagrams/InView';
import { CANVAS_LEVELS } from '@/lib/business';

type Copy = { title: string; low: string; high: string; us: string; them: string; factors: string[]; caption: string };

/**
 * A strategy canvas, transposed so it reads on a phone: one row per factor, the usual offer and HandyX as two dots
 * on the same low→high track, joined by a line (a dumbbell). Qualitative, and it says so.
 */
export function Canvas({ c }: { c: Copy }) {
  const pct = (v: number) => `${(v / 4) * 100}%`;
  return (
    <InView as="figure" className="bz-fig bz-canvas" aria-labelledby="bz-canvas-t">
      <h4 id="bz-canvas-t" className="bz-fig__t">{c.title}</h4>
      <p className="bz-canvas__legend"><span className="bz-dot bz-dot--them" aria-hidden="true" />{c.them}<span className="bz-dot bz-dot--us" aria-hidden="true" />{c.us}</p>
      <ul className="bz-canvas__rows">
        {c.factors.map((f, i) => {
          const [them, us] = CANVAS_LEVELS[i];
          const lo = Math.min(them, us), hi = Math.max(them, us);
          return (
            <li key={f} style={{ '--o': i } as CSSProperties}>
              <span className="bz-canvas__f">{f}</span>
              <span className="bz-canvas__track" aria-hidden="true">
                <span className="bz-canvas__span" style={{ left: pct(lo), width: `calc(${pct(hi)} - ${pct(lo)})` }} />
                <span className="bz-dot bz-dot--them" style={{ left: pct(them) }} />
                <span className="bz-dot bz-dot--us" style={{ left: pct(us) }} />
              </span>
              <span className="sr-only">{`${c.them}: ${them}/4 · ${c.us}: ${us}/4`}</span>
            </li>
          );
        })}
      </ul>
      <p className="bz-canvas__axis" aria-hidden="true"><span>{c.low}</span><span>{c.high}</span></p>
      <figcaption className="note">{c.caption}</figcaption>
    </InView>
  );
}
