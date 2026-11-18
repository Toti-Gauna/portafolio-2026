/**
 * Atajos de teclado. One key each (WCAG 2.1.4: they can be turned off, and they never fire while typing, with a
 * modifier held, or with another dialog open). `?` opens the help, `1`–`6` go to the pages in menu order, `T`
 * goes back to the top, `M` turns the sound on or off and `L` changes the language.
 */
export const KEYS_STORAGE = 'ig:v2:keys';
export const SHORTCUTS = [
  { key: '?', action: 'help' },
  { key: '1–6', action: 'pages' },
  { key: 'T', action: 'top' },
  { key: 'M', action: 'sound' },
  { key: 'L', action: 'lang' },
  { key: 'Esc', action: 'close' },
] as const;
export type ShortcutAction = (typeof SHORTCUTS)[number]['action'];

export type Command = { type: 'help' } | { type: 'page'; index: number } | { type: 'top' } | { type: 'sound' } | { type: 'lang' };

const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

/** Which command a keydown asks for, or null. Pure, so it is tested on its own. */
export function commandFor(e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'repeat' | 'defaultPrevented'>, target: Element | null, pages: number): Command | null {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return null;
  if (target?.closest?.(EDITABLE)) return null;
  if (e.key === '?') return { type: 'help' };
  if (/^[1-9]$/.test(e.key) && Number(e.key) <= pages) return { type: 'page', index: Number(e.key) - 1 };
  const k = e.key.toLowerCase();
  if (k === 't') return { type: 'top' };
  if (k === 'm') return { type: 'sound' };
  if (k === 'l') return { type: 'lang' };
  return null;
}

export const keysEnabled = () => {
  try { return localStorage.getItem(KEYS_STORAGE) !== 'off'; } catch { return true; }
};
export const setKeysEnabled = (on: boolean) => {
  try { localStorage.setItem(KEYS_STORAGE, on ? 'on' : 'off'); } catch { /* not remembered */ }
};
