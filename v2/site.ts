import { tokens } from '@/v2/tokens';

/**
 * The pages of the site, in header order. Each one has a colour of the spectrum: the light of the header,
 * the number in the phone menu and the opening of the page use it. Names and lines live in
 * messages/v2 (`site.pages.<key>`); the slugs are the same in both languages.
 */
export const SITE_PAGES = [
  { key: 'home', path: '', from: tokens.layer['code-from'], to: tokens.layer['code-to'] },
  { key: 'work', path: 'work/', from: tokens.layer['plan-from'], to: tokens.layer['plan-to'] },
  { key: 'how', path: 'como-trabajo/', from: tokens.layer['tests-from'], to: tokens.layer['tests-to'] },
  { key: 'brand', path: 'brand-lab/', from: tokens.layer['agents-from'], to: tokens.layer['agents-to'] },
  { key: 'business', path: 'negocio/', from: tokens.layer['ship-from'], to: tokens.layer['ship-to'] },
  { key: 'about', path: 'sobre-mi/', from: tokens.color['lilac-400'], to: tokens.color['pink-400'] },
] as const;

export type SitePage = (typeof SITE_PAGES)[number];
export type SitePageKey = SitePage['key'];

/** Paths without the base path (next/link adds it); always with the trailing slash of the static export. */
export const sitePath = (locale: string, path = '') => `/v2/${locale}/${path}`;
/** Every contact channel lives at the end of «Sobre mí». */
export const CONTACT_PATH = 'sobre-mi/#contacto';

/** The page a pathname belongs to (null on the pages of the design system). */
export function pageOf(pathname: string): SitePageKey | null {
  const rest = pathname.replace(/^\/v2\/[a-z]{2}\/?/, '').replace(/\/?$/, '/');
  if (rest === '/') return 'home';
  return SITE_PAGES.find((p) => p.path && rest.startsWith(p.path))?.key ?? null;
}
