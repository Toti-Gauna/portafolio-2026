import { BASE_PATH, CONTACT_EMAIL, LINKEDIN_URL } from '@/lib/site';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { SITE_PAGES } from '@/v2/site';
import { SiteHeaderClient } from './SiteHeaderClient';

/** Server side of the header: reads the copy and hands the client only what it shows. */
export function SiteHeader({ locale }: { locale: V2Locale }) {
  const m = v2Messages(locale);
  const s = m.site;
  return (
    <SiteHeaderClient
      locale={locale}
      base={BASE_PATH}
      mail={CONTACT_EMAIL}
      linkedin={LINKEDIN_URL}
      pages={SITE_PAGES.map((p) => ({ key: p.key, path: p.path, label: s.pages[p.key].t, line: s.pages[p.key].d, color: p.from }))}
      labels={{
        nav: s.nav, homeAria: s.homeAria, contact: s.contact, menu: s.menu, close: s.close, dialog: s.dialog, lang: m.top.lang,
        sound: m.ui.sound.label, soundOn: m.ui.sound.on, soundOff: m.ui.sound.off, elsewhere: s.elsewhere, newTab: s.newTab,
      }}
    />
  );
}
