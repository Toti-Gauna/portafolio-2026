import localFont from 'next/font/local';
import { Bricolage_Grotesque, Figtree, Work_Sans, Young_Serif } from 'next/font/google';

/**
 * The brands' own families, for the Brand Lab only (not preloaded: a board's font arrives when its board is shown).
 * The repo brands use the OFL files already self-hosted for the trailer (public/trailer/fonts/<brand>/, with their
 * licence); the two exercises use Google families that next/font self-hosts at build time.
 */

const instrument = localFont({
  src: [{ path: '../../public/trailer/fonts/eclipse/InstrumentSerif-Regular.woff2', style: 'normal', weight: '400' }, { path: '../../public/trailer/fonts/eclipse/InstrumentSerif-Italic.woff2', style: 'italic', weight: '400' }],
  variable: '--bl-instrument', preload: false, display: 'swap',
});
const geist = localFont({ src: '../../public/trailer/fonts/eclipse/Geist-Variable.woff2', variable: '--bl-geist', weight: '100 900', preload: false, display: 'swap' });
const bigShoulders = localFont({ src: '../../public/trailer/fonts/volta/big-shoulders-display-latin-wght-normal.woff2', variable: '--bl-bigshoulders', weight: '100 900', preload: false, display: 'swap' });
const fraunces = localFont({ src: '../../public/trailer/fonts/velmar/fraunces-latin-opsz-normal.woff2', variable: '--bl-fraunces', weight: '100 900', preload: false, display: 'swap' });
const manrope = localFont({ src: '../../public/trailer/fonts/velmar/manrope-latin-wght-normal.woff2', variable: '--bl-manrope', weight: '200 800', preload: false, display: 'swap' });
const newsreader = localFont({ src: '../../public/trailer/fonts/dentalos/newsreader-latin-500-normal.woff2', variable: '--bl-newsreader', weight: '500', preload: false, display: 'swap' });
const sourceSans = localFont({
  src: [
    { path: '../../public/trailer/fonts/dentalos/source-sans-3-latin-400-normal.woff2', weight: '400' },
    { path: '../../public/trailer/fonts/dentalos/source-sans-3-latin-600-normal.woff2', weight: '600' },
    { path: '../../public/trailer/fonts/dentalos/source-sans-3-latin-700-normal.woff2', weight: '700' },
  ],
  variable: '--bl-sourcesans', preload: false, display: 'swap',
});
const youngSerif = Young_Serif({ subsets: ['latin'], weight: '400', variable: '--bl-youngserif', preload: false, display: 'swap' });
const workSans = Work_Sans({ subsets: ['latin'], variable: '--bl-worksans', preload: false, display: 'swap' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--bl-bricolage', preload: false, display: 'swap' });
const figtree = Figtree({ subsets: ['latin'], variable: '--bl-figtree', preload: false, display: 'swap' });

/** Class names that define every --bl-* variable (put on the Brand Lab's wrapper). */
export const brandFontVars = [instrument, geist, bigShoulders, fraunces, manrope, newsreader, sourceSans, youngSerif, workSans, bricolage, figtree]
  .map((f) => f.variable)
  .join(' ');

/** CSS font stack of each family named in lib/brands.ts. */
export const FAMILY: Record<string, string> = {
  Archivo: 'var(--font-sans)',
  'JetBrains Mono': 'var(--font-mono)',
  'Instrument Serif': 'var(--bl-instrument), Georgia, serif',
  Geist: 'var(--bl-geist), system-ui, sans-serif',
  'Big Shoulders Display': 'var(--bl-bigshoulders), Impact, sans-serif',
  Fraunces: 'var(--bl-fraunces), Georgia, serif',
  Manrope: 'var(--bl-manrope), system-ui, sans-serif',
  Newsreader: 'var(--bl-newsreader), Georgia, serif',
  'Source Sans 3': 'var(--bl-sourcesans), system-ui, sans-serif',
  'Young Serif': 'var(--bl-youngserif), Georgia, serif',
  'Work Sans': 'var(--bl-worksans), system-ui, sans-serif',
  'Bricolage Grotesque': 'var(--bl-bricolage), system-ui, sans-serif',
  Figtree: 'var(--bl-figtree), system-ui, sans-serif',
};
