import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { SITE_PAGES, sitePath, type SitePageKey } from '@/v2/site';
import { ArrowIcon, ArrowLeftIcon } from '../ui/Icons';
import { SiteFooter } from './SiteFooter';

type InnerKey = Exclude<SitePageKey, 'home'>;

/**
 * The opening of a page of the site: its number and name in its colour, its title and one line, and the way
 * to the pages next to it. The content of each page arrives with its own lote (fases 4 a 7).
 */
export function PageOpening({ locale, page, children }: { locale: V2Locale; page: InnerKey; children?: ReactNode }) {
  const s = v2Messages(locale).site;
  const i = SITE_PAGES.findIndex((p) => p.key === page);
  const p = SITE_PAGES[i];
  const prev = SITE_PAGES[i - 1];
  const next = SITE_PAGES[i + 1];
  const copy = s.pages[page];
  return (
    <>
      <main id="main" className="v2-main">
        <section className="st-open" aria-labelledby="st-title" style={{ '--from': p.from, '--to': p.to } as CSSProperties}>
          <p className="st-kicker"><b aria-hidden="true">{String(i + 1).padStart(2, '0')}</b><span>{copy.t}</span></p>
          <h1 id="st-title">{copy.title}</h1>
          <p className="st-lead">{copy.lead}</p>
        </section>
        {children}
        <nav className="ui-pager st-pager" aria-label={s.pager} data-reveal>
          <Link href={sitePath(locale, prev.path)} rel="prev" className="ui-pager-prev">
            <span className="ui-pager-kicker"><ArrowLeftIcon size={14} />{s.prev}</span>
            <span className="ui-pager-title">{s.pages[prev.key].t}</span>
          </Link>
          {next ? (
            <Link href={sitePath(locale, next.path)} rel="next" className="ui-pager-next">
              <span className="ui-pager-kicker">{s.next}<ArrowIcon size={14} /></span>
              <span className="ui-pager-title">{s.pages[next.key].t}</span>
            </Link>
          ) : <span />}
        </nav>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
