import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { CONTACT_EMAIL } from '@/lib/site';
import { Monogram } from './Monogram';
import { LocaleSwitch } from './LocaleSwitch';

export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations('header');
  const tRoot = useTranslations();
  return (
    <header className="site-header">
      <a className="skip-link" href="#contenido">{tRoot('skipLink')}</a>
      <div className="container-x site-header__row">
        <Link href="/" locale={locale} className="site-header__brand" aria-label={t('home')}>
          <Monogram className="site-header__mark" />
        </Link>
        <nav aria-label={t('nav')} className="site-header__nav">
          <LocaleSwitch current={locale} locales={routing.locales} label={t('language')} />
          <a className="btn btn-ghost" href={`mailto:${CONTACT_EMAIL}`}>{t('contact')}</a>
        </nav>
      </div>
    </header>
  );
}
