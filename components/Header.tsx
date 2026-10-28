import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { CONTACT_EMAIL, LINKEDIN_URL } from '@/lib/site';
import { Monogram } from './Monogram';
import { LocaleSwitch } from './LocaleSwitch';

const LINKS = [
  ['que-hago', 'what'],
  ['trabajo', 'work'],
  ['recorrido', 'journey'],
  ['laboratorio', 'lab'],
  ['metodo', 'method'],
  ['sistema', 'system'],
  ['contacto', 'contact'],
] as const;

export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations('header');
  const n = useTranslations('nav');
  const tRoot = useTranslations();
  return (
    <header className="site-header">
      <a className="skip-link" href="#contenido">{tRoot('skipLink')}</a>
      <div className="container-x site-header__row">
        <Link href="/" locale={locale} className="site-header__brand" aria-label={t('home')}>
          <Monogram className="site-header__mark" />
        </Link>
        <nav aria-label={n('label')} className="site-header__links">
          {LINKS.map(([id, key]) => <Link key={id} href={`/#${id}`}>{n(key)}</Link>)}
        </nav>
        <div className="site-header__nav">
          <details className="site-header__menu">
            <summary>{n('menu')}</summary>
            <nav aria-label={n('label')}>
              {LINKS.map(([id, key]) => <Link key={id} href={`/#${id}`}>{n(key)}</Link>)}
            </nav>
          </details>
          <LocaleSwitch current={locale} locales={routing.locales} label={t('language')} />
          <a className="btn btn-ghost site-header__li" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn<span className="sr-only"> ({t('newTab')})</span></a>
          <a className="btn btn-ghost site-header__mail" href={`mailto:${CONTACT_EMAIL}`}>{t('contact')}</a>
        </div>
      </div>
    </header>
  );
}
