import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { CASE_SLUGS } from '@/lib/cases';
import { routing } from './routing';

/** Site copy from messages/<locale>.json; each case page's copy from messages/cases/<locale>/<slug>.json (namespace cases.<slug>). */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const base = (await import(`../messages/${locale}.json`)).default;
  const cases = Object.fromEntries(
    await Promise.all(CASE_SLUGS.map(async (s) => [s, (await import(`../messages/cases/${locale}/${s}.json`)).default])),
  );
  return { locale, messages: { ...base, cases } };
});
