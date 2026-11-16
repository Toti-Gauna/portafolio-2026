import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { Taller } from '@/components/taller/Taller';
import { Footer } from '@/components/sections/Sections';

/** The home: a walk through «el Taller cósmico», one chapter per building (components/taller, lib/taller.ts). */
export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return (
    <>
      <main id="contenido" tabIndex={-1}>
        <Taller />
      </main>
      <Footer />
    </>
  );
}
