/**
 * The site's pages, in menu order (labels in messages: nav.pages.<key>, hub.cards.<key>, pages.<key>).
 * The home is a hub of cards that lead here; every section of the old long home lives on one of these pages.
 */
export const PAGES = [
  { key: 'work', href: '/trabajo' },
  { key: 'how', href: '/como-trabajo' },
  { key: 'skills', href: '/capacidades' },
  { key: 'business', href: '/negocio' },
  { key: 'about', href: '/sobre-mi' },
] as const;

export type PageKey = (typeof PAGES)[number]['key'];

export const pageHref = (key: PageKey) => PAGES.find((p) => p.key === key)!.href;

/** The canonical contact block: every channel, at the end of «Sobre mí». */
export const CONTACT_HREF = '/sobre-mi#contacto';
