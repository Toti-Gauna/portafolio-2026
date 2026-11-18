import { type V2Locale, v2Messages } from '@/v2/i18n';
import { TopBar } from './TopBar';
import { SiteFooter } from './site/SiteFooter';
import { WorldExplorer } from './work/WorldExplorer';

/** The tab «Mundo» of the design system: the world of Work as it is built, under the tabs of the system. */
export function WorldPage({ locale }: { locale: V2Locale }) {
  const w = v2Messages(locale).world;
  return (
    <>
      <TopBar locale={locale} page="world" />
      <main id="main">
        <WorldExplorer locale={locale} kicker={w.kicker} title={w.title} lead={w.text} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
