import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GatePager } from '@/v2/components/GatePager';
import { Home } from '@/v2/components/site/Home';
import { GATE_VARIANTS, type GateVariant } from '@/v2/gate/state';
import { isV2Locale, v2Messages } from '@/v2/i18n';

export const dynamicParams = false;
export function generateStaticParams() {
  return GATE_VARIANTS.map((variant) => ({ variant }));
}

type Params = Promise<{ locale: string; variant: string }>;
const isVariant = (v: string): v is GateVariant => (GATE_VARIANTS as readonly string[]).includes(v);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, variant } = await params;
  if (!isV2Locale(locale) || !isVariant(variant)) return {};
  const g = v2Messages(locale).gate.choose;
  return { title: `${g.items[variant].name} · ${g.meta.title}`, description: g.meta.description, robots: { index: false, follow: false } };
}

/** The home behind one version of the gate, to try each one as a visitor would meet it, and a bar to go on to the next. */
export default async function V2GatePreview({ params }: { params: Params }) {
  const { locale, variant } = await params;
  if (!isV2Locale(locale) || !isVariant(variant)) notFound();
  return (
    <>
      <Home locale={locale} gate={variant} />
      <GatePager locale={locale} variant={variant} />
    </>
  );
}
