import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ZONES, type Zone } from './zones';

/** Server only (build time): the zones that already have a track in public/media/music. */
export function musicTracks(): Zone[] {
  return ZONES.filter((z) => existsSync(join(process.cwd(), 'public/media/music', `pad-${z}.mp3`)));
}
