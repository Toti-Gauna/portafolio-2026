import Link from 'next/link';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { sitePath } from '@/v2/site';
import { isPlayId } from '../mkt/plays';
import { Playbook } from '../mkt/Playbook';
import { SiteFooter } from '../site/SiteFooter';
import { ArrowIcon, ArrowLeftIcon } from '../ui/Icons';
import { BrandBoard, Mark, skinVars } from './BrandBoard';
import { BRAND_ORDER, brandOf } from './brands';
import type { BrandId } from './types';

/**
 * The page of one brand (lote 6.1): the rail of the eight brands (each chip in its own colours), the brand's board,
 * and the way to the brands next to it. Above the board the page is the site's; inside it, everything is the brand's.
 */
export function BrandPage({ locale, id }: { locale: V2Locale; id: BrandId }) {
  const m = v2Messages(locale), L = m.brandlab;
  const { spec, copy } = brandOf(locale, id);
  const i = BRAND_ORDER.indexOf(id), n = BRAND_ORDER.length;
  const near = [BRAND_ORDER[(i + n - 1) % n], BRAND_ORDER[(i + 1) % n]].map((b) => ({ id: b, ...brandOf(locale, b) }));
  const href = (b: string) => sitePath(locale, `brand-lab/${b}/`);
  return (
    <>
      <main id="main" className="blp">
        <nav className="blp-top" aria-label={L.rail}>
          <Link className="blp-back" href={sitePath(locale, 'brand-lab/')}><ArrowLeftIcon size={14} />{L.kicker}</Link>
          <ul className="blr">
            {BRAND_ORDER.map((b) => {
              const o = brandOf(locale, b);
              return (
                <li key={b}>
                  <Link className="blr-chip" data-on="m" href={href(b)} style={skinVars(o.spec)} aria-current={b === id ? 'page' : undefined} aria-label={o.copy.name}>
                    <Mark art={o.spec.art(o.copy.art).logo.submark} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <BrandBoard spec={spec} copy={copy} labels={L} />
        {isPlayId(id) && <Playbook locale={locale} id={id} />}
        <nav className="blp-near" aria-label={L.all}>
          {near.map((o, k) => (
            <Link key={k} className="blp-next" data-on="m" data-dir={k ? 'next' : 'prev'} rel={k ? 'next' : 'prev'} href={href(o.id)} style={skinVars(o.spec)}>
              <span className="blp-next-k">{k ? <>{L.next}<ArrowIcon size={14} /></> : <><ArrowLeftIcon size={14} />{L.prev}</>}</span>
              <span className="blp-next-mark" aria-hidden="true"><Mark art={o.spec.art(o.copy.art).logo.submark} /></span>
              <span className="blp-next-t">{o.copy.name}</span>
            </Link>
          ))}
          <Link className="blp-all" href={sitePath(locale, 'brand-lab/')}>{L.all}</Link>
        </nav>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
