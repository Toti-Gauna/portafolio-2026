import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { use } from 'react';
import { TrailerButton } from '@/components/TrailerButton';
import { CONTACT_EMAIL, LINKEDIN_URL } from '@/lib/site';
import { About, Contact, Footer, Journey, Lab, Method, Skills, System, Work } from '@/components/sections/Sections';

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations('hero');
  return (
    <main id="contenido" tabIndex={-1}>
      <section id="inicio" className="hero" aria-labelledby="hero-name">
        <div className="container-x">
          <p className="hero__role label">
            <span>{t('role')}</span>
            <span className="hero__avail">{t('availability')}</span>
          </p>
          <h1 id="hero-name" className="hero__name">
            Ignacio<span>Gauna</span>
          </h1>
          <p className="hero__title">{t('title')}</p>
          <p className="hero__lead">{t('lead')}</p>
          <ul className="hero__proofs">
            <li>{t('proofs.complia')}</li>
            <li>{t('proofs.since')}</li>
            <li>{t('proofs.system')}</li>
          </ul>
          <div className="hero__cta">
            <a className="btn btn-primary" href={`mailto:${CONTACT_EMAIL}`}>{t('write')}</a>
            <a className="btn btn-ghost" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn<span className="sr-only"> ({t('newTab')})</span></a>
            <TrailerButton className="btn btn-ghost">{t('watch')}</TrailerButton>
          </div>
        </div>
      </section>
      <Journey />
      <Work />
      <Lab />
      <Method />
      <System />
      <Skills />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
