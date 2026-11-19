/**
 * The design system of a product, read from its own repository (lote 5.4). Everything here is data taken from the
 * repo at one commit; every group cites the file and the lines it comes from, so the page can link to them.
 * The words (names of groups, what each token is for, sample texts) live in messages/v2/ds/<locale>/<slug>.json.
 */

/** A place in the product's repo: a path from the repo root, the lines, and a short string that is on those lines
 *  (a local check reads the repo and confirms it, so a citation can't drift). */
export type DsSource = { path: string; lines: [number, number]; match: string };

/** A webfont of the product, from the OFL files already in public/trailer/fonts/<product>/ (licence beside them). */
export type DsFont = {
  /** CSS family name, unique to the sample (e.g. "ds-eclipse-serif"), declared with @font-face in the product's CSS */
  family: string;
  /** the family's real name, as the repo uses it (e.g. "Instrument Serif") */
  name: string;
  /** copy key in fonts.<key>: { role, sample } */
  key: string;
  /** weights shown in the specimen (only weights the file has) */
  weights: number[];
  italic?: boolean;
  source: DsSource;
};

/** One theme of the product (dark / light, a season…): the value of every token in it. Keys are the product's own
 *  custom property names, with the leading "--" (e.g. "--corona"). The renderer writes them on the sample root. */
export type DsTheme = { id: string; /** copy key in themes.<id> */ scheme: 'light' | 'dark'; vars: Record<string, string>; source: DsSource };

/** A group of colour tokens shown as swatches; values come from the active theme. */
export type DsColorGroup = { key: string; tokens: string[]; source: DsSource };

/** A text / background pair the product promises to keep readable; measured in every theme by the unit test. */
export type DsPair = { fg: string; bg: string; /** 3 for large text and UI parts, 4.5 for text */ min: 3 | 4.5 };

/** Shape, space and motion tokens (shown as rows: name, value, a small live demo). */
export type DsScale = {
  radius: { token: string; value: string }[];
  space?: { token: string; value: string }[];
  motion: { token: string; value: string; /** 'ease' = a timing function, 'dur' = a duration */ kind: 'ease' | 'dur' }[];
  source: DsSource;
};

/**
 * A component of the product, rebuilt as plain HTML + the product's CSS (scoped under `.pds[data-ds="<slug>"]` in
 * app/v2/[locale]/ds/<slug>.css). `html` is static markup; `{{key}}` is replaced by samples.<key> from the copy.
 * Interactive specimens use only these hooks, wired by the page: [data-ds-press] toggles aria-pressed,
 * [data-ds-check] toggles aria-checked, [data-ds-pick] inside a [role=radiogroup] or [role=tablist] picks one.
 * Real inputs (<input>, <select>) keep their labels. No scripts, no external images, no text under 12 px.
 */
export type DsComponent = { id: string; /** copy key in components.<id>: { name, note } */ source: DsSource; html: string };

export type DsSpec = {
  repo: string; // "Toti-Gauna/Eclipse-Web"
  sha: string; // full commit sha the citations point at
  themes: DsTheme[];
  colors: DsColorGroup[];
  pairs: DsPair[];
  fonts: DsFont[];
  scale: DsScale;
  components: DsComponent[];
};

/** The words: messages/v2/ds/<locale>/<slug>.json, same keys in both languages. */
export type DsCopy = {
  title: string; // ≤ 8 words, e.g. «El sistema de Eclipse»
  line: string; // ≤ 25 words: what the system is, in the product's own terms
  themes: Record<string, string>;
  groups: Record<string, string>;
  tokens: Record<string, string>; // "--corona" → what it is for, ≤ 6 words
  fonts: Record<string, { role: string; sample: string }>;
  components: Record<string, { name: string; note: string }>; // note ≤ 18 words
  samples: Record<string, string>;
};
