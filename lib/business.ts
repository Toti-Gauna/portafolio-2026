/** Structure of the business page (copy in messages/<locale>.json → business). */
import type { CaseSlug } from '@/lib/cases';

export const BOOKS = ['lean', 'mom', 'blue'] as const;
export type BookId = (typeof BOOKS)[number];

/** Strategy canvas, qualitative levels 0–4 per factor (same order as business.books.blue.canvas.factors): [usual way, Eclipse]. */
export const CANVAS_LEVELS: [number, number][] = [[1, 4], [1, 4], [3, 0], [1, 3], [2, 4]];

/** Where each application example links to (case slug or none), by book and index (copy in business.books.<id>.apply). */
export const APPLY_LINKS: Record<BookId, (CaseSlug | null)[]> = {
  lean: ['eclipse', 'eclipse'],
  mom: [null],
  blue: ['eclipse'],
};
