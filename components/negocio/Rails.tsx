import type { CSSProperties } from 'react';
import { InView } from '@/components/diagrams/InView';

type Copy = { title: string } & Record<string, string[] | string>;

/** One track per project: its stations in order and a packet that travels the track while the figure is on screen. */
export function Rails({ c, names, projects }: { c: Copy; names: Record<string, string>; projects: readonly string[] }) {
  return (
    <InView live as="figure" className="bz-rails">
      <figcaption className="bz-fig__t">{c.title}</figcaption>
      {projects.map((p, r) => {
        const st = c[p] as string[];
        return (
          <div key={p} className="bz-rails__track" style={{ '--o': r } as CSSProperties}>
            <p className="label">{names[p]}</p>
            <ol style={{ '--n': st.length } as CSSProperties}>
              {st.map((s) => <li key={s}><i aria-hidden="true" /><span>{s}</span></li>)}
            </ol>
          </div>
        );
      })}
    </InView>
  );
}
