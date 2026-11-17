'use client';

import { useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import { configureMusic, currentZone, setZone } from '@/lib/music';
import { hold } from '@/lib/sound';
import { installUiSounds } from '@/lib/ui-sounds';
import { zoneForPath, type Zone } from '@/lib/zones';

/**
 * The site's sound, mounted once in the layout (design/2026/sonido.md): music zones by route, interface sounds,
 * and the pause while the tab is hidden. It renders nothing, and nothing makes a sound until a gate or the header button
 * turns the sound on (lib/sound.ts). `tracks`: the zones that have a file in public/media/music (decided at build time).
 */
export function SoundSystem({ tracks, base }: { tracks: Zone[]; base: string }) {
  const path = usePathname() ?? '/';

  useEffect(() => {
    configureMusic(tracks, base);
    const stopUi = installUiSounds();
    const onVisibility = () => hold('hidden', document.visibilityState === 'hidden');
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stopUi();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [tracks, base]);

  // Another route, another zone. On the home the chapters set it as they scroll by (components/taller).
  useEffect(() => {
    if (path === '/' || path === '') {
      if (!currentZone()) setZone('inicio');
      return;
    }
    setZone(zoneForPath(path));
  }, [path]);

  return null;
}
