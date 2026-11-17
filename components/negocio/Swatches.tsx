import type { CSSProperties } from 'react';
import { InView } from '@/components/diagrams/InView';
import { Link } from '@/i18n/navigation';
import { BRANDS } from '@/lib/brands';

/** One row per brand of the Brand Lab: three of its colors and its name, linked to its sheet. */
export function Swatches({ title, cta, names }: { title: string; cta: string; names: Record<string, string> }) {
  return (
    <InView as="figure" className="bz-sw">
      <figcaption className="bz-fig__t">{title}</figcaption>
      <ul>
        {BRANDS.map((b, i) => (
          <li key={b.id} style={{ '--o': i } as CSSProperties}>
            <Link href={`/brand-lab#marca-${b.id}`}>
              <span className="bz-sw__dots" aria-hidden="true">
                {[0, 1, 3].map((k) => <i key={k} style={{ background: b.palette[k].hex }} />)}
              </span>
              <span>{names[b.id]}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link className="card-link" href="/brand-lab">{cta} →</Link>
    </InView>
  );
}
