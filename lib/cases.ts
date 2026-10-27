/** Structure of the public content (copy lives in messages/*.json). Links point only to public places. */
export const CASE_SLUGS = ['complia', 'tuenti', 'handyx', 'eclipse', 'kinetic'] as const;
export type CaseSlug = (typeof CASE_SLUGS)[number];

export const LAB = [
  { id: 'kinetic', href: 'https://toti-gauna.github.io/motion-animations/', code: 'https://github.com/Toti-Gauna/kinetic-studio', page: 'kinetic' },
  { id: 'volta', code: 'https://github.com/Toti-Gauna/supplements-ecommerce' },
  { id: 'velmar', code: 'https://github.com/Toti-Gauna/velmar-ecommerce-' },
  { id: 'dentalos', code: 'https://github.com/Toti-Gauna/DentalOS' },
  { id: 'supernova', href: 'https://toti-gauna.github.io/supernova-eventos/', code: 'https://github.com/Toti-Gauna/supernova-eventos' },
  { id: 'games', code: 'https://github.com/Toti-Gauna/games-market' },
] as const;

/** Screenshots of each case's portals: public/media/portals/<id>.webp (1600×1000), alt and caption in cases.<slug>.gallery.<id>. */
export const CASE_GALLERY: Partial<Record<CaseSlug, readonly string[]>> = {};

export const CASE_LINKS: Partial<Record<CaseSlug, { label: string; href: string }[]>> = {
  eclipse: [{ label: 'eclipse-business.com', href: 'https://eclipse-business.com/' }],
  kinetic: [
    { label: 'toti-gauna.github.io/motion-animations', href: 'https://toti-gauna.github.io/motion-animations/' },
    { label: 'github.com/Toti-Gauna/kinetic-studio', href: 'https://github.com/Toti-Gauna/kinetic-studio' },
  ],
};

export const SECTION_IDS = ['recorrido', 'trabajo', 'laboratorio', 'metodo', 'sistema', 'capacidades', 'sobre-mi', 'contacto'] as const;
