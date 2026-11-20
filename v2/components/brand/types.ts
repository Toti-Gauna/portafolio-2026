/**
 * The Brand Lab of /v2 (lote 6.1): one identity per brand. This file is the contract between the page (the frame:
 * BrandBoard, the wall, the turntable) and each brand (art/<id>.ts, a pure module that draws everything in SVG).
 *
 * A brand is told apart without reading its name: its field colour, its accent, its type and its shapes are its own.
 * The frame never styles a brand; it only lays its pieces out and writes the brand's skin as CSS custom properties.
 */

export type BrandId = 'ig' | 'eclipse' | 'velmar' | 'volta' | 'brisa' | 'lucero' | 'sereno' | 'brote';

/** Whose brand it is. `exercise` = fictional (the brands of the demos and the two lab exercises): «Ejercicio de marca». */
export type BrandKind = 'own' | 'client' | 'exercise';

/** Where a block comes from: the brand's own repo, this site, or drawn for the lab. The page says it under each block. */
export type Origin = 'repo' | 'site' | 'lab';

/** A drawing: its viewBox and its inner SVG markup (no <svg> wrapper, no <title>: the frame names it from the copy). */
export type Svg = { box: [number, number, number, number]; svg: string };

/** A font the brand uses: a family declared in app/v2/[locale]/brand-fonts.css (or one of the site's). */
export type BrandFont = {
  /** the family's real name: «Instrument Serif» */
  name: string;
  /** CSS font-family value, with a generic fallback: "'bl-instrument', serif" */
  stack: string;
  /** weights shown in the specimen (only weights the file has) */
  weights: number[];
  italic?: boolean;
};

/** One screen of the brand: a field colour and what is written on it. Every pair is measured (AA) by the unit test. */
export type BrandField = { bg: string; ink: string; muted: string; accent: string; line: string };

export type BrandSkin = {
  /** the brand's own field: the colour of its cover, the one it is recognised by on the wall */
  main: BrandField;
  /** a second screen, in contrast with the first (sections alternate between the two) */
  alt: BrandField;
  /** text on a solid block of `main.accent` (buttons, stickers) */
  onAccent: string;
  /** shape language: corners of cards and tiles, e.g. '0px', '4px', '28px' */
  radius: string;
  /** section headings in the brand's display type */
  heading: { weight: number; transform: 'none' | 'uppercase'; tracking: string; style: 'normal' | 'italic' };
  /** hairlines between blocks: '1px solid', '2px dashed', '1px dotted' */
  rule: string;
};

/** A colour of the palette, with the share of a layout it takes (the proportion bar; shares add up to 100). */
export type BrandSwatch = { key: string; hex: string; share: number };

/**
 * The brand in three dimensions, built by the frame with CSS 3D (no WebGL): the visitor turns it by dragging, with
 * the arrow keys or with its slider. Sizes are in the turntable's own units; the whole object must fit in a sphere of
 * radius 150 (a box of 200 × 150 × 80 does; a can of r 62 and h 190 does).
 *  - `box`: a cuboid (a carton, a card, a matchbox, a book). Each face is the inner SVG of a drawing whose viewBox is
 *    `0 0 <width> <height>` of that face: front/back w × h, left/right d × h, top/bottom w × d.
 *  - `can`: a cylinder (a tub, a jar, a tin, a pot). `label` is ONE drawing, viewBox `0 0 <2πr rounded> <h>`, wrapped
 *    around it (x = 0 is the back seam, the middle of the drawing faces the visitor); `top` is a drawing in
 *    `0 0 <2r> <2r>` (the frame clips it to a circle). `lid` is an optional second, plain cylinder on top: `side` is its
 *    colour (a hex) and `top` a drawing in `0 0 <2·lid.r> <2·lid.r>`; with a lid, the can's own `top` is not seen.
 */
export type BrandObject =
  | { kind: 'box'; size: [w: number, h: number, d: number]; faces: { front: string; back: string; left: string; right: string; top: string; bottom: string } }
  | { kind: 'can'; r: number; h: number; label: string; top: string; lid?: { r: number; h: number; side: string; top: string } };

/**
 * Everything a brand draws. Rules for every drawing:
 *  - own SVG, drawn in code; no raster images, no external references, no logos of third parties, no <script>.
 *  - colours are the brand's own hex values (from `palette` / `skin`), written literally.
 *  - text inside a piece is part of the picture, but its words come from the copy (art(t) receives them) and it must
 *    be readable: `font-size` ≥ the minimum noted on each piece (so it is ≥ 12 px on a 360 px phone).
 *  - fonts inside drawings: class `bl-fd` on a <text> sets the brand's display family and `bl-ft` its text family
 *    (weight, size and style are the drawing's own attributes).
 */
export type BrandArt = {
  logo: {
    /** the main logo, alone, on a transparent ground (the frame puts it on `main.bg`); viewBox ≈ 3:2 or wider.
     *  Mark what is drawn by a line with class `bl-draw` (the frame gives it pathLength 1 and draws it with
     *  stroke-dashoffset) and what is filled with class `bl-fill` (it fades in after); `style="--i:N"` orders them. */
    main: Svg;
    /** its construction, in the SAME viewBox, drawn over the logo: modules, axes, circles, clear space. Only lines:
     *  class `bl-g` (guide lines), `bl-gc` (construction circles and arcs), `bl-gm` (module squares / clear space,
     *  lightly filled), `bl-gp` (points: centres and tangencies). No text: the notes are in the copy (`grid`). */
    grid: string;
    /** the stacked or reduced version, for the main field (like `main`) */
    secondary: Svg;
    /** the monogram or symbol, in a square viewBox (0 0 100 100); must read at 32 px. The frame shows it on the
     *  main field, on the alt field and on a block of accent: draw it with `currentColor` only, and give the parts
     *  that carry the accent the class `bl-acc` (the frame paints them with the accent of the field they are on). */
    submark: Svg;
  };
  /** three seamless square tiles (viewBox 0 0 120 120) made with the submark and the brand's shapes */
  patterns: [Svg, Svg, Svg];
  /** on screen: a square post (viewBox 0 0 400 400, text ≥ 17) and a story (viewBox 0 0 270 480, text ≥ 13) */
  digital: { post: Svg; story: Svg };
  /** on the street: a poster (viewBox 0 0 300 400, text ≥ 14) and a small printed piece — a label, a tag, a sticker,
   *  a card, a ticket — in its own viewBox (≈ 240 wide, text ≥ 11) */
  physical: { poster: Svg; print: Svg };
  /** the brand in 3D */
  object: BrandObject;
};

export type BrandSpec = {
  id: BrandId;
  kind: BrandKind;
  skin: BrandSkin;
  /** 5–6 colours with their own names (copy: palette.<key>) */
  palette: BrandSwatch[];
  type: { display: BrandFont; text: BrandFont };
  /** where each block comes from */
  origin: { logo: Origin; grid: Origin; palette: Origin; type: Origin; patterns: Origin; pieces: Origin; object: Origin };
  /** the drawings; `t` is copy.art (the words inside the pieces) */
  art: (t: Record<string, string>) => BrandArt;
};

/** The words: messages/v2/brands/<locale>/<id>.json, same keys in both languages. Limits are measured by the test. */
export type BrandCopy = {
  /** the brand's name as written: «Clínica Brisa» */
  name: string;
  /** whose it is, one line (≤ 14 words): «Marca personal de Ignacio» */
  owner: string;
  /** the idea of the brand in one sentence (≤ 20 words) */
  idea: string;
  /** where it lives (≤ 12 words): «Un bodegón de barrio, de noche» */
  place: string;
  /** three words that describe its character */
  traits: string[];
  palette: Record<string, { name: string; use: string }>; // use ≤ 6 words
  type: { display: { role: string; sample: string }; text: { role: string; sample: string } }; // role ≤ 10 words
  /** three notes on the construction of the logo (each ≤ 16 words) */
  grid: string[];
  /** accessible names of the drawings (each ≤ 16 words) */
  alt: { logo: string; secondary: string; submark: string; patterns: string; post: string; story: string; poster: string; print: string; object: string };
  /** names of the two pieces whose kind the brand chooses: «Etiqueta colgante», «Pote de 1 kg» */
  pieces: { print: string; object: string };
  /** what the board shows and where each thing comes from (≤ 30 words) */
  source: string;
  /** the words inside the drawings */
  art: Record<string, string>;
};
