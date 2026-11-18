/** Window events between the site and the music (SoundRoot), and the choice remembered on the device. */
export const SOUND_EVENT = 'ig:v2:sound'; // { on } — the sound button of the header
export const MUSIC_STYLE = 'ig:v2:music'; // { style } — the proposal chosen for the site
export const MUSIC_PREVIEW = 'ig:v2:music:preview'; // { style, zone } — listen to one proposal (the /sonido/ page)
export const MUSIC_STOP = 'ig:v2:music:stop'; // end of a preview
export const MUSIC_BAR = 'ig:v2:music:bar'; // BarInfo, once per bar while it plays
export const SOUND_KEY = 'ig:v2:sound';
export const STYLE_KEY = 'ig:v2:music';

export const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
export const write = (key: string, v: string) => { try { localStorage.setItem(key, v); } catch { /* not remembered */ } };
