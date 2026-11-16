/**
 * The home as a walk through «el Taller cósmico» (design/2026/paginas.md § 2, Ignacio 16/11/2026).
 * One chapter per building: its scene (public/media/taller/escena-<n>-<w>.webp), the side the building sits on
 * (the text goes on the other one), where its button leads and, when there is one, the video that carries the camera
 * to the next chapter (public/media/taller/t-<n>-<n+1>.mp4). Copy: messages → taller.ch.<key>.
 * Scenes are generated (GPT Image) and transitions too (Higgsfield): the page says so (taller.credit).
 */
import type { StatusKind } from './status';

export type ChapterKey =
  | 'hero' | 'origin' | 'path' | 'work' | 'how' | 'skills' | 'brand' | 'business' | 'video' | 'roadmap' | 'contact';

export type Chapter = {
  key: ChapterKey;
  /** where the building sits in its scene; the text takes the other side */
  building: 'left' | 'right';
  /** where the button leads (none: the page is not built yet, the chapter says «Próximamente») */
  href?: string;
  /** video to the next chapter, if one was generated */
  next?: string;
  /** keep the text near the top (the lower part of the free side has drawing in it) */
  alignTop?: boolean;
  /** featured items with their status (copy: taller.ch.<key>.items.<i>) */
  items?: StatusKind[];
};

export const SCENE_WIDTHS = [960, 1600, 2400] as const;
export const sceneSrc = (n: number, w: number) => `/media/taller/escena-${n}-${w}.webp`;

export const CHAPTERS: Chapter[] = [
  { key: 'hero', building: 'right', next: 't-0-1' },
  { key: 'origin', building: 'left', href: '/sobre-mi', next: 't-1-2' },
  { key: 'path', building: 'right', href: '/sobre-mi#recorrido', next: 't-2-3' },
  { key: 'work', building: 'left', href: '/trabajo', items: ['produccion', 'desarrollo', 'demo'] },
  { key: 'how', building: 'right', href: '/como-trabajo', next: 't-4-5' },
  { key: 'skills', building: 'left', href: '/capacidades' },
  { key: 'brand', building: 'right', alignTop: true, next: 't-6-7' },
  { key: 'business', building: 'left', href: '/negocio' },
  { key: 'video', building: 'right', href: '/proyectos/kinetic' },
  { key: 'roadmap', building: 'left', items: ['planeado', 'planeado', 'planeado', 'planeado'], next: 't-9-10' },
  { key: 'contact', building: 'right' },
];
