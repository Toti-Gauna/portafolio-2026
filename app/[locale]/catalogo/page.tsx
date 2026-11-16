import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { STATUS_KINDS } from '@/lib/status';
import { StatusTag } from '@/components/ui/StatusTag';
import './catalogo.css';

type Params = { locale: string };

// Página interna de trabajo: no se indexa, no está en el mapa del sitio ni en el menú. Muestra los tokens y los átomos
// del sistema «Cartel suizo» (design/2026/tokens.json). Excepción a «sin copy en componentes»: solo nombres de tokens.
export const metadata: Metadata = { title: 'Catálogo de diseño', robots: { index: false, follow: false } };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const SWATCHES = [
  ['ink', 'Tinta'],
  ['surface', 'Grafito'],
  ['paper', 'Papel'],
  ['soft', 'Texto suave'],
  ['muted', 'Niebla'],
  ['line', 'Línea'],
  ['accent', 'Coral'],
] as const;

export default async function CatalogPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <main id="contenido" tabIndex={-1} className="cat container-x">
      <p className="label">Catálogo · Cartel suizo</p>
      <h1 className="cat__h1">Tokens y átomos</h1>

      <section className="cat__sec" aria-labelledby="c-color">
        <h2 id="c-color" className="label">Color</h2>
        <ul className="cat__swatches">
          {SWATCHES.map(([v, name]) => (
            <li key={v}>
              <span className="cat__chip" style={{ background: `var(--${v})` }} />
              <b>{name}</b>
              <code>--{v}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className="cat__sec" aria-labelledby="c-type">
        <h2 id="c-type" className="label">Tipografía</h2>
        <p className="cat__display">Ignacio <span>Gauna</span></p>
        <p className="cat__h2">Lo que construí.</p>
        <p className="cat__lead">Titular de bajada, 700 con ancho 110.</p>
        <p>Párrafo en Archivo regular, 16 a 19 px, interlineado 1,55.</p>
        <p className="label">Etiqueta mono · 12 px · 0,16 em</p>
      </section>

      <section className="cat__sec" aria-labelledby="c-btn">
        <h2 id="c-btn" className="label">Botones y chips</h2>
        <div className="cat__row">
          <a className="btn btn-primary" href="#c-btn">Primario</a>
          <a className="btn btn-ghost" href="#c-btn">Secundario</a>
          <span className="chip">Chip</span>
        </div>
      </section>

      <section className="cat__sec" aria-labelledby="c-status">
        <h2 id="c-status" className="label">Estados</h2>
        <div className="cat__row">
          {STATUS_KINDS.map((k) => (
            <StatusTag key={k} kind={k} />
          ))}
        </div>
      </section>

      <section className="cat__sec" aria-labelledby="c-ht">
        <h2 id="c-ht" className="label">Trama halftone</h2>
        <div className="cat__row">
          <div className="cat__ht ht" />
          <div className="cat__ht ht ht--m" />
          <div className="cat__ht ht ht--l" />
          <div className="cat__ht ht ht--paper ht--fine" />
        </div>
      </section>
    </main>
  );
}
