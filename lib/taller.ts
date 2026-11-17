/**
 * The home as a walk through «el Taller cósmico» (design/2026/paginas.md § 2, Ignacio 16/11/2026).
 * One chapter per building: its scene (public/media/taller/escena-<n>-<w>.webp), the side the building sits on
 * (the text goes on the other one), where its button leads and, when there is one, the video that carries the camera
 * to the next chapter (public/media/taller/t-<n>-<n+1>.mp4). Copy: messages → taller.ch.<key>.
 * Scenes are generated (GPT Image) and transitions too (Higgsfield): the page says so (taller.credit).
 */
import type { StatusKind } from './status';
import type { Zone } from './zones';

export type ChapterKey =
  | 'hero' | 'origin' | 'path' | 'work' | 'how' | 'skills' | 'brand' | 'business' | 'video' | 'roadmap' | 'contact';

export type Chapter = {
  key: ChapterKey;
  /** where the building sits in its scene; the text takes the other side */
  building: 'left' | 'right';
  /** background music while this chapter is on screen (lib/zones.ts) */
  zone: Zone;
  /** where the button leads (none: the page is not built yet, the chapter says «Próximamente») */
  href?: string;
  /** video to the next chapter, if one was generated */
  next?: string;
  /** keep the text near the top (the lower part of the free side has drawing in it) */
  alignTop?: boolean;
  /** featured items with their status (copy: taller.ch.<key>.items.<i>) */
  items?: StatusKind[];
  /** what can be pointed at in the scene (Ola 4, design/2026/taller-interaccion.md) */
  spots?: Spot[];
};

/** Where a spot's card leads: another chapter of the walk (the hero's index), a page, or the trailer. */
export type SpotGo = { chapter: ChapterKey } | { href: string } | { trailer: true };

/**
 * A thing in a scene that opens a card (Ola 4). Geometry in % of the scene image (2400×1357): x of its width, y of its
 * height. `at` is the marker; `poly` outlines what it points at (x1, y1, x2, y2, …): the dashed outline and the lifted
 * cut-out are drawn from it. Copy: taller.ch.<key>.spots.<id>.{name, text, cta} (the hero's spots reuse the chapter
 * they lead to: its title and heading).
 */
export type Spot = {
  id: string;
  at: [number, number];
  poly: number[];
  go?: SpotGo;
  status?: StatusKind;
};

/** the scenes' size: the stage and the spots' layer keep this ratio */
export const SCENE_W = 2400;
export const SCENE_H = 1357;

export const SCENE_WIDTHS = [960, 1600, 2400] as const;
export const sceneSrc = (n: number, w: number) => `/media/taller/escena-${n}-${w}.webp`;

export const CHAPTERS: Chapter[] = [
  { key: 'hero', building: 'right', zone: 'inicio', next: 't-0-1',
    spots: [
      { id: 'path', at: [63.5, 12], poly: [61, 6, 66, 6, 66.5, 36, 65, 41, 62, 41, 60.5, 36], go: { chapter: 'path' } },
      { id: 'work', at: [80, 44], poly: [71, 41, 80, 34, 89, 40, 90, 52, 85, 61, 77, 62, 70, 54], go: { chapter: 'work' } },
      { id: 'how', at: [56, 42], poly: [45.5, 40, 52, 33, 65, 38, 66, 47, 62, 58, 55, 61, 46, 53], go: { chapter: 'how' } },
      { id: 'skills', at: [76, 27], poly: [69, 24, 74, 20, 80, 18, 84, 25, 84, 37, 76, 40, 69, 36], go: { chapter: 'skills' } },
      { id: 'brand', at: [63, 70], poly: [57, 69, 62, 64.5, 69, 67, 69.5, 76, 65, 80.5, 58, 78], go: { chapter: 'brand' } },
      { id: 'business', at: [49.5, 63], poly: [44, 61, 48, 57, 53, 58, 55, 63, 54, 70, 49, 72, 44.5, 69], go: { chapter: 'business' } },
      { id: 'video', at: [78, 69], poly: [71, 65, 77, 61, 84, 63, 85, 72, 82, 79, 76, 80, 71, 74], go: { chapter: 'video' } },
      { id: 'contact', at: [94, 42], poly: [92.5, 35, 95.5, 35, 96.5, 54, 94, 56, 91.5, 54], go: { chapter: 'contact' } },
    ],
  },
  { key: 'origin', building: 'left', zone: 'inicio', href: '/sobre-mi', next: 't-1-2',
    spots: [
      { id: 'first', at: [29, 60], poly: [21.5, 62, 31, 48, 37, 58, 37, 68, 29, 77, 22, 70] },
      { id: 'sea', at: [21, 30], poly: [13.5, 13, 28, 13, 28, 49, 13.5, 49] },
      { id: 'books', at: [8, 69], poly: [2.5, 63, 9, 60, 14, 64, 14, 76, 8, 80, 2.5, 76], go: { href: '/negocio' } },
    ],
  },
  { key: 'path', building: 'right', zone: 'work', href: '/sobre-mi#recorrido', next: 't-2-3',
    spots: [
      { id: 'tach', at: [48, 70], poly: [37, 80, 42, 71, 42, 63, 46, 58, 53, 63, 57, 72, 57, 82, 48, 88], go: { href: '/sobre-mi#recorrido' } },
      { id: 'ada', at: [63, 44], poly: [50, 51, 54, 44, 62, 26, 70, 28, 76, 36, 75, 55, 65, 63, 52, 57], go: { href: '/sobre-mi#recorrido' } },
      { id: 'tsoft', at: [84, 30], poly: [80.5, 15, 84, 6, 88, 15, 89, 48, 96, 52, 92, 58, 82, 55, 80, 50], go: { href: '/trabajo' } },
    ],
  },
  { key: 'work', building: 'left', zone: 'work', href: '/trabajo', items: ['produccion', 'desarrollo', 'demo'],
    spots: [
      { id: 'complia', at: [44.3, 15], poly: [41.5, 13, 47, 9, 47, 17, 41.5, 21.5], go: { href: '/proyectos/complia' }, status: 'produccion' },
      { id: 'eclipse', at: [27.5, 15.5], poly: [24, 15, 31, 9, 31, 17, 24, 22], go: { href: '/proyectos/eclipse' }, status: 'desarrollo' },
      { id: 'volta', at: [50.3, 21.3], poly: [47, 20, 53.5, 15, 53.5, 23, 47, 27.5], go: { href: '/proyectos/volta' }, status: 'demo' },
      { id: 'lab', at: [38, 58], poly: [20, 55, 37, 45, 57, 52, 57, 60, 39, 72, 22, 63], go: { href: '/trabajo#laboratorio' } },
    ],
  },
  { key: 'how', building: 'right', zone: 'work', href: '/como-trabajo', next: 't-4-5',
    spots: [
      { id: 'gate', at: [65.5, 55], poly: [61, 52, 65, 49, 70, 51, 70, 59, 65, 61, 61, 59], go: { href: '/como-trabajo#sistema' } },
      { id: 'agents', at: [66, 25], poly: [62, 22, 66, 18, 70, 21, 70, 30, 66, 33, 62, 30], go: { href: '/como-trabajo#sistema' } },
      { id: 'spec', at: [84, 51], poly: [80, 47, 84, 44, 88, 47, 88, 56, 84, 58, 80, 56], go: { href: '/como-trabajo#sistema' } },
    ],
  },
  { key: 'skills', building: 'left', zone: 'brand', href: '/capacidades',
    spots: [
      { id: 'work', at: [39, 63], poly: [35.5, 61, 39, 57, 42, 61, 42, 66, 39, 69, 35.5, 66], go: { href: '/capacidades' } },
      { id: 'own', at: [54, 75], poly: [52, 72, 54, 70, 56, 73, 56, 79, 52, 79], go: { href: '/capacidades' } },
      { id: 'study', at: [22.5, 35], poly: [19, 35, 24, 27, 26.5, 29, 25, 38, 22.5, 44, 19.5, 42], go: { href: '/capacidades' } },
    ],
  },
  { key: 'brand', building: 'right', zone: 'brand', alignTop: true, next: 't-6-7',
    spots: [
      { id: 'lab', at: [78, 40], poly: [66, 40, 72, 30, 85, 28, 92, 40, 90, 58, 78, 62, 66, 58] },
      { id: 'exercise', at: [59, 80], poly: [52, 80, 61, 72, 66.5, 77, 57, 88], status: 'ejercicio' },
    ],
  },
  { key: 'business', building: 'left', zone: 'brand', href: '/negocio',
    spots: [
      { id: 'lean', at: [29, 25], poly: [27, 20, 31, 20, 31, 31, 27, 31], go: { href: '/negocio#lean' } },
      { id: 'mom', at: [42.5, 28], poly: [41, 23, 44.5, 24, 44.5, 34, 41, 33], go: { href: '/negocio#mom' } },
      { id: 'blue', at: [33, 58], poly: [31, 54, 35, 54, 35, 61, 31, 61], go: { href: '/negocio#blue' } },
    ],
  },
  { key: 'video', building: 'right', zone: 'brand', href: '/proyectos/kinetic',
    spots: [
      { id: 'kinetic', at: [55, 35], poly: [46, 26, 63, 14, 64, 40, 46, 55], go: { href: '/proyectos/kinetic' } },
      { id: 'trailer', at: [80, 40], poly: [76, 38, 80, 30, 84, 32, 85, 46, 80, 49, 76, 47], go: { trailer: true } },
    ],
  },
  { key: 'roadmap', building: 'left', zone: 'roadmap', items: ['planeado', 'planeado', 'planeado', 'planeado'], next: 't-9-10',
    spots: [
      { id: 'energy', at: [38, 38], poly: [33, 40, 38, 33, 42, 36, 42, 44, 37, 46, 33, 44], status: 'planeado' },
      { id: 'agro', at: [42, 51], poly: [37, 51, 43, 47, 47, 51, 42, 55], status: 'planeado' },
      { id: 'finance', at: [26, 66], poly: [23, 63, 26, 61, 29, 63, 29, 72, 26, 74, 23, 72], status: 'planeado' },
      { id: 'space', at: [53, 62], poly: [50, 58, 53, 52, 55, 58, 55, 73, 52, 75, 50, 73], status: 'planeado' },
    ],
  },
  { key: 'contact', building: 'right', zone: 'about' },
];
