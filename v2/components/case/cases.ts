import type { StampId } from '../kit/stamps';
import type { StatusKey } from '../ui/Status';

/**
 * The cases of /v2 (lote 5.1): their structure. The words of each one live in messages/v2/cases/<locale>/<slug>.json
 * (copy.ts); here, what is not words: the order, the colour of the project, its state, the media of its film and of
 * its gallery (real captures and clips in public/media, or a drawing), its public links and its place in the world.
 * Every media file is the one the published case already shows: data of example or fictitious, client brands covered.
 */
export type CaseMedia = {
  id: string;
  kind: 'video' | 'image' | 'world';
  /** How it is framed: a browser window, a phone, or bare (a drawing). */
  frame: 'browser' | 'phone' | 'bare';
  src?: string;
  poster?: string;
  w: number;
  h: number;
};
export type CaseLink = { kind: 'site' | 'demo' | 'code'; href: string };
export type CaseDef = {
  slug: CaseSlug;
  /** The stop of the world of Work where it stands. */
  stop: string;
  /** The colour of the project: its film, its line and its dot. */
  color: string;
  status: StatusKey;
  /** The stamp of the kit, where there is one (else the place is printed from its drawing in the world). */
  stamp?: StampId;
  film: CaseMedia;
  gallery: CaseMedia[];
  links: CaseLink[];
};

/** In the order a visitor meets them: the professional work first (CompliA, the best case), then my own. */
export const CASE_ORDER = ['complia', 'tuenti', 'supernova', 'eclipse', 'agentes', 'kinetic', 'volta', 'velmar', 'dentalos', 'games'] as const;
export type CaseSlug = (typeof CASE_ORDER)[number];

const video = (id: string, dir: string, frame: 'browser' | 'phone' = 'browser', w = frame === 'phone' ? 390 : 1280, h = frame === 'phone' ? 844 : 800): CaseMedia =>
  ({ id, kind: 'video', frame, src: `/media/${dir}/${id}.mp4`, poster: `/media/${dir}/${id}.jpg`, w, h });
const image = (id: string, src: string, frame: 'browser' | 'phone' = 'browser', w = frame === 'phone' ? 780 : 1600, h = frame === 'phone' ? 1688 : 1000): CaseMedia =>
  ({ id, kind: 'image', frame, src, w, h });

export const CASES: Record<CaseSlug, CaseDef> = {
  complia: {
    slug: 'complia', stop: 'tsoft', color: '#5f86ff', status: 'interna', stamp: 'complia',
    film: { id: 'demo', kind: 'video', frame: 'browser', src: '/media/complia-demo.mp4', poster: '/media/complia-demo-poster.jpg', w: 1280, h: 800 },
    gallery: [], links: [],
  },
  tuenti: {
    // an illustration of my own, never a capture (Tuenti and Telefónica keep their screens)
    slug: 'tuenti', stop: 'tsoft', color: '#58d5ff', status: 'profesional', stamp: 'tuenti',
    film: { id: 'drawn', kind: 'image', frame: 'bare', src: '/media/tuenti-cover.svg', w: 1600, h: 1000 },
    gallery: [], links: [],
  },
  supernova: {
    slug: 'supernova', stop: 'tsoft', color: '#c79bff', status: 'prototipo', stamp: 'supernova',
    film: video('inscripcion', 'supernova'),
    gallery: [video('creador', 'supernova'), image('favoritos', '/media/supernova/favoritos.webp')],
    links: [{ kind: 'demo', href: 'https://toti-gauna.github.io/supernova-eventos/' }, { kind: 'code', href: 'https://github.com/Toti-Gauna/supernova-eventos' }],
  },
  eclipse: {
    slug: 'eclipse', stop: 'eclipse', color: '#ffc247', status: 'desarrollo', stamp: 'eclipse',
    film: video('landing-recorrido', 'eclipse'),
    gallery: [video('portal-clientes', 'eclipse'), video('portal-interno', 'eclipse'), video('demo-lumen', 'eclipse'), video('landing-proceso', 'eclipse')],
    links: [{ kind: 'site', href: 'https://eclipse-business.com/' }],
  },
  agentes: {
    // the system has no screen: its place in the world is its picture (the eleven lights that answer one after another)
    slug: 'agentes', stop: 'agentes', color: '#c9c5de', status: 'interna',
    film: { id: 'world', kind: 'world', frame: 'bare', w: 4, h: 3 },
    gallery: [], links: [],
  },
  kinetic: {
    slug: 'kinetic', stop: 'kinetic', color: '#ff5a3c', status: 'laboratorio',
    film: video('kinetic-formas', 'kinetic', 'browser', 1280, 720),
    gallery: [video('kinetic-ritmo', 'kinetic', 'browser', 1280, 720), video('kinetic-profundidad', 'kinetic', 'browser', 1280, 720), video('lab-bauhaus', 'kinetic', 'browser', 1280, 720), video('lab-hyperspace', 'kinetic', 'browser', 1280, 720)],
    links: [{ kind: 'demo', href: 'https://toti-gauna.github.io/motion-animations/' }, { kind: 'code', href: 'https://github.com/Toti-Gauna/kinetic-studio' }],
  },
  volta: {
    slug: 'volta', stop: 'volta', color: '#b6f36a', status: 'demo',
    film: video('panel', 'volta'),
    gallery: [video('tienda', 'volta', 'phone'), video('club-ruleta', 'volta', 'phone'), image('regalar', '/media/volta/regalar.webp', 'phone')],
    links: [{ kind: 'code', href: 'https://github.com/Toti-Gauna/supplements-ecommerce' }],
  },
  velmar: {
    slug: 'velmar', stop: 'velmar', color: '#ffa04a', status: 'demo',
    film: video('panel', 'velmar'),
    gallery: [video('collar-en-vivo', 'velmar', 'phone'), video('club-ruleta', 'velmar', 'phone'), image('cupones', '/media/velmar/cupones.webp', 'phone'), image('panel-calendario', '/media/velmar/panel-calendario.webp')],
    links: [{ kind: 'code', href: 'https://github.com/Toti-Gauna/velmar-ecommerce-' }],
  },
  dentalos: {
    slug: 'dentalos', stop: 'dentalos', color: '#3fe0b0', status: 'demo',
    film: video('recepcion', 'dentalos'),
    gallery: [video('odontograma', 'dentalos'), image('ortodoncia', '/media/dentalos/ortodoncia.webp'), image('campanas', '/media/dentalos/campanas.webp')],
    links: [{ kind: 'code', href: 'https://github.com/Toti-Gauna/DentalOS' }],
  },
  games: {
    slug: 'games', stop: 'games', color: '#ff5fa2', status: 'laboratorio',
    film: video('ninja', 'games'),
    gallery: [video('arena-3d', 'games'), image('catalogo', '/media/games/catalogo.webp')],
    links: [{ kind: 'code', href: 'https://github.com/Toti-Gauna/games-market' }],
  },
};

export const isCaseSlug = (s: string): s is CaseSlug => (CASE_ORDER as readonly string[]).includes(s);
/** The case after this one (the last one leads back to the first). */
export const nextCase = (slug: CaseSlug): CaseSlug => CASE_ORDER[(CASE_ORDER.indexOf(slug) + 1) % CASE_ORDER.length];
/** The cases that stand on a stop of the world (Tsoft holds three). */
export const casesAt = (stop: string): CaseSlug[] => CASE_ORDER.filter((s) => CASES[s].stop === stop);
