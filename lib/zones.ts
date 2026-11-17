/**
 * Music zones (design/2026/sonido.md): five background tracks, one per area of the site, same tempo and key so they
 * cross-fade. Pure (no audio, no DOM): the server HTML, the engine and the tests agree on it.
 * Track files: public/media/music/pad-<zone>.mp3 (made by scripts/encode-music.sh from the Suno tracks).
 */
export const ZONES = ['inicio', 'work', 'brand', 'roadmap', 'about'] as const;
export type Zone = (typeof ZONES)[number];

/** The zone of a route (path without locale). The home sets its own as its chapters scroll by (components/taller). */
export function zoneForPath(path: string): Zone | null {
  const p = (path.split(/[?#]/)[0] || '/').replace(/\/+$/, '') || '/';
  if (p === '/') return 'inicio';
  if (p === '/catalogo') return null;
  if (p === '/trabajo' || p === '/como-trabajo' || p.startsWith('/proyectos/')) return 'work';
  if (p === '/capacidades' || p === '/brand-lab' || p === '/video' || p === '/negocio' || p.startsWith('/negocio/')) return 'brand';
  if (p === '/sobre-mi') return 'about';
  return 'inicio';
}
