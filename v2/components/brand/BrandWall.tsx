import Link from 'next/link';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { sitePath } from '@/v2/site';
import { Mark, skinVars } from './BrandBoard';
import { BRAND_ORDER, brandOf } from './brands';
import { WallBlind } from './WallBlind';
import { mktCopy } from '../mkt/copy';
import { PLAY_ORDER } from '../mkt/plays';

/**
 * The wall of the Brand Lab (lote 6.1): one tile per brand, each in its own field, with its submark, its display
 * type, its palette and one of its patterns. The names can be hidden («Solo forma y color»): the brands are still
 * told apart. Each tile opens its brand.
 */
export function BrandWall({ locale }: { locale: V2Locale }) {
  const L = v2Messages(locale).brandlab, M = v2Messages(locale).mkt;
  return (
    <section className="blw-sec" aria-labelledby="blw-title">
      <div className="blw-method" data-reveal>
        <h2>{L.method.title}</h2>
        <ol>{L.method.steps.map((s) => <li key={s}>{s}</li>)}</ol>
      </div>
      <div className="blw-head" data-reveal>
        <h2 id="blw-title">{L.wall}</h2>
        <WallBlind label={L.blind} wall="blw" />
      </div>
      <ul id="blw" className="blw">
        {BRAND_ORDER.map((id) => {
          const { spec, copy } = brandOf(locale, id);
          const art = spec.art(copy.art), p = art.patterns[0];
          return (
            <li key={id} data-reveal>
              <Link className="blw-tile" data-on="m" data-brand={id} href={sitePath(locale, `brand-lab/${id}/`)} style={skinVars(spec)} aria-label={`${copy.name} · ${L.kinds[spec.kind]}`} data-cursor={L.open} data-boing>
                <span className="blw-aa" aria-hidden="true">Aa</span>
                <span className="blw-dots" aria-hidden="true">{spec.palette.slice(0, 5).map((c) => <i key={c.key} style={{ background: c.hex }} />)}</span>
                <span className="blw-mark" aria-hidden="true" data-boing-part><Mark art={art.logo.submark} /></span>
                <svg className="blw-pat" aria-hidden="true" viewBox="0 0 360 90" preserveAspectRatio="xMidYMid slice">
                  <defs><pattern id={`blw-${id}`} width={p.box[2]} height={p.box[3]} patternUnits="userSpaceOnUse" patternTransform="scale(0.75)" dangerouslySetInnerHTML={{ __html: p.svg }} /></defs>
                  <rect width="360" height="90" fill={`url(#blw-${id})`} />
                </svg>
                <span className="blw-name" aria-hidden="true"><b>{copy.name}</b><span>{L.kinds[spec.kind]}</span></span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="blw-head" data-reveal>
        <h2 id="blw-mkt">{M.wall.title}</h2>
      </div>
      <p className="blw-lead" data-reveal>{M.wall.lead}</p>
      <ul className="blw-mk" aria-labelledby="blw-mkt">
        {PLAY_ORDER.map((id) => {
          const { spec, copy } = brandOf(locale, id);
          return (
            <li key={id} data-reveal>
              <Link className="blw-mk-a" data-on="m" href={sitePath(locale, `brand-lab/${id}/#marketing`)} style={skinVars(spec)}>
                <span className="blw-mk-mark" aria-hidden="true"><Mark art={spec.art(copy.art).logo.submark} /></span>
                <span className="blw-mk-t"><b>{mktCopy(locale, id).title}</b><span>{M.wall.open}</span></span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
