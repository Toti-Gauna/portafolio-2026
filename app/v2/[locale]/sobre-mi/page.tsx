import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CONTACT_EMAIL, LINKEDIN_URL } from '@/lib/site';
import { PageOpening } from '@/v2/components/site/PageOpening';
import { Button } from '@/v2/components/ui/Button';
import { MailIcon } from '@/v2/components/ui/Icons';
import { isV2Locale, v2Messages } from '@/v2/i18n';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isV2Locale(locale)) return {};
  const p = v2Messages(locale).site.pages.about;
  return { title: `${p.t} · Ignacio Gauna`, description: p.d, robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isV2Locale(locale)) notFound();
  const s = v2Messages(locale).site;
  return (
    <PageOpening locale={locale} page="about">
      {/* the canonical contact block: the header's «Contacto» lands here */}
      <section className="v2-sec st-contact" id="contacto" aria-labelledby="contacto-h">
        <h2 id="contacto-h">{s.contact}</h2>
        <p className="st-mail">{CONTACT_EMAIL}</p>
        <div className="v2-actions">
          <Button href={`mailto:${CONTACT_EMAIL}`} iconStart={<MailIcon />}>{s.write}</Button>
          <Button href={LINKEDIN_URL} variant="secondary" external externalLabel={s.newTab}>LinkedIn</Button>
        </div>
      </section>
    </PageOpening>
  );
}
