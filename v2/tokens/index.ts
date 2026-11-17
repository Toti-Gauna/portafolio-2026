import raw from './tokens.json';

/** The /v2 design tokens (source: tokens.json). Keys starting with `$` are metadata. */
export const tokens = raw;
export type Tokens = typeof raw;
export type TokenGroup = Exclude<keyof Tokens, `$${string}`>;

export const TOKEN_GROUPS = Object.keys(raw).filter((k) => !k.startsWith('$')) as TokenGroup[];

/** Every token as [css variable name, value], e.g. ['--color-bg', '#090720']. */
export function tokenVars(): [string, string][] {
  return TOKEN_GROUPS.flatMap((g) => Object.entries(raw[g] as Record<string, string>).map(([k, v]) => [`--${g}-${k}`, v] as [string, string]));
}

/** The :root block the /v2 layout inlines; generated from tokens.json at build time, so CSS and TS cannot drift. */
export function tokensCss(): string {
  return `:root{${tokenVars().map(([k, v]) => `${k}:${v}`).join(';')}}`;
}

/** `var(--group-key)` for a token, checked at compile time. */
export function v<G extends TokenGroup>(group: G, key: keyof Tokens[G] & string): string {
  return `var(--${group}-${key})`;
}

/** The five crafts of the stack, top to bottom; their names live in messages/v2 (`layers.<id>`). */
export const LAYERS = ['plan', 'code', 'agents', 'tests', 'ship'] as const;
export type LayerId = (typeof LAYERS)[number];
