import type { CSSProperties } from 'react';
import Link from 'next/link';
import { asset } from '@/lib/site';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { SITE_PAGES, sitePath } from '@/v2/site';
import { LightField } from '../signature/LightField';
import { Stack } from '../signature/Stack';
import { Button } from '../ui/Button';
import { RoleBadge } from '../ui/Chip';
import { ArrowIcon, PlayIcon } from '../ui/Icons';
import { SiteFooter } from './SiteFooter';

/**
 * The home of /v2 as it stands after lote 2.1: the opening of direction 4 and a door to every page.
 * The cinematic home (lote 3.2) replaces what is under the opening.
 */
export function Home({ locale }: { locale: V2Locale }) {
  const m = v2Messages(locale);
  const s = m.site;
  const doors = SITE_PAGES.filter((p) => p.key !== 'home');
  return (
    <>
      <main id="main" className="v2-main">
        <section className="v2-hero" aria-labelledby="v2-name">
          <LightField className="v2-hero-light">
            <div className="v2-hero-grid">
              <div className="v2-hero-text">
                <RoleBadge level={m.hero.level} role={m.hero.role} />
                <h1 id="v2-name" className="v2-name">{m.hero.first}<br /><span className="v2-last">{m.hero.last}</span></h1>
                <p className="v2-lead">{m.hero.leadBefore} <span className="v2-solutions">{m.hero.leadWord}</span> {m.hero.leadAfter}</p>
                <div className="v2-actions">
                  <Button href={asset(`/trailer/v2/index.html?lang=${locale}`)} iconStart={<PlayIcon />} magnetic={10}>{m.hero.meet}</Button>
                  <Button href="#explorar" variant="secondary" iconEnd={<ArrowIcon />} magnetic={8}>{m.hero.explore}</Button>
                </div>
              </div>
              <Stack locale={locale} />
            </div>
          </LightField>
        </section>

        <section className="v2-sec st-doors" id="explorar" aria-labelledby="explorar-h">
          <h2 id="explorar-h" data-reveal>{s.explore}</h2>
          <ul>
            {doors.map((p, i) => (
              <li key={p.key} data-reveal>
                <article className="ui-card" style={{ '--from': p.from, '--to': p.to } as CSSProperties} data-cursor={s.more}>
                  <p className="ui-card-meta" aria-hidden="true">{String(i + 2).padStart(2, '0')}</p>
                  <h3 className="ui-card-title"><Link href={sitePath(locale, p.path)}>{s.pages[p.key].t}</Link></h3>
                  <div className="ui-card-body"><p>{s.pages[p.key].d}</p></div>
                  <p className="ui-card-cta" aria-hidden="true">{s.more}<ArrowIcon /></p>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
