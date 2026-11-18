/**
 * Transiciones de página como movimientos de cámara. The direction follows the menu: a page further on comes in
 * from the right as the old one leaves to the left (the camera travels along the site), a page before it the
 * other way, and the design system pages, which are off the menu, move in depth.
 */
export type CameraMove = 'forward' | 'back' | 'depth';

export function cameraMove(from: number, to: number): CameraMove {
  if (from < 0 || to < 0) return 'depth';
  return to >= from ? 'forward' : 'back';
}

/** `/v2/es/work/` and `/v2/es/work` are the same page; the base path is not part of it. */
export const samePath = (a: string, b: string) => a.replace(/\/+$/, '') === b.replace(/\/+$/, '');
