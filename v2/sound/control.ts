/** Window events between the site and the music (SoundRoot), and the choice remembered on the device. */
export const SOUND_EVENT = 'ig:v2:sound'; // { on } — the sound button of the header
export const MUSIC_PREVIEW = 'ig:v2:music:preview'; // { style, zone } — listen to one proposal (the /sonido/ page)
export const MUSIC_STOP = 'ig:v2:music:stop'; // end of a preview
export const MUSIC_BAR = 'ig:v2:music:bar'; // BarInfo, once per bar while it plays
export const MUSIC_HOLD = 'ig:v2:music:hold'; // { on } — the trailer plays its own music: the site's waits
export const SFX_EVENT = 'ig:v2:sfx'; // { kind, power? } — a small sound of the world of Work; it only sounds with the sound on
export const SOUND_KEY = 'ig:v2:sound';

export const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
export const write = (key: string, v: string) => { try { localStorage.setItem(key, v); } catch { /* not remembered */ } };

/** Ask for a small sound (it is heard only if the visitor has the sound on). */
export const sfx = (kind: string, power = 1) => { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(SFX_EVENT, { detail: { kind, power } })); };
