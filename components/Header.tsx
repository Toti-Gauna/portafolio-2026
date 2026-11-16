import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { CONTACT_EMAIL, LINKEDIN_URL } from '@/lib/site';
import { CONTACT_HREF, PAGES } from '@/lib/nav';
import { Monogram } from './Monogram';
import { SiteNav, type NavItem } from './SiteNav';

/**
 * From 768 px: monogram, five numbered page links, the sound button and the language switch (+ one «Contacto» button from 1100 px).
 * Below 768: monogram, the sound button and a menu button that opens the full-screen menu (components/SiteNav.tsx).
 */
export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations('header');
  const n = useTranslations('nav');
  const tRoot = useTranslations();
  const items: NavItem[] = [
    { key: 'home', href: '/', label: n('home'), desc: n('homeDesc') },
    ...PAGES.map((p) => ({ key: p.key, href: p.href, label: n(`pages.${p.key}.t`), desc: n(`pages.${p.key}.d`) })),
  ];
  return (
    <header className="site-header">
      <a className="skip-link" href="#contenido">{tRoot('skipLink')}</a>
      <div className="container-x site-header__row">
        <Link href="/" locale={locale} className="site-header__brand" aria-label={t('home')}>
          <Monogram className="site-header__mark" />
        </Link>
        <SiteNav
          items={items}
          locale={locale}
          locales={routing.locales}
          contactHref={CONTACT_HREF}
          email={CONTACT_EMAIL}
          linkedin={LINKEDIN_URL}
          s={{
            nav: n('label'),
            menu: n('menu'),
            close: n('close'),
            dialog: n('dialog'),
            contact: n('contact'),
            elsewhere: n('elsewhere'),
            soundOn: t('soundOn'),
            soundOff: t('soundOff'),
            language: t('language'),
            newTab: t('newTab'),
            home: t('home'),
          }}
        />
      </div>
    </header>
  );
}
