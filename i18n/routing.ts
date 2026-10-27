import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

/** BCP 47 tags for <html lang> and hreflang. */
export const localeTags: Record<Locale, string> = { es: 'es-AR', en: 'en' };
