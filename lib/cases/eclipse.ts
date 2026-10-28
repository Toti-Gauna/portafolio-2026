import type { CaseDef } from './types';

export const eclipse: CaseDef = {
  blocks: [
    { type: 'text', key: 's1' }, { type: 'text', key: 's2' }, { type: 'text', key: 's3' }, { type: 'text', key: 's4' },
    { type: 'gallery', key: 'gallery', dir: '/media/portals', shots: ['eclipse-landing', 'eclipse-landing-precios', 'eclipse-portal-proyectos', 'eclipse-portal-detalle', 'eclipse-ops-prospectos', 'eclipse-ops-proyectos', 'eclipse-ops-calendario'] },
  ],
  links: [{ label: 'eclipse-business.com', href: 'https://eclipse-business.com/' }],
};
