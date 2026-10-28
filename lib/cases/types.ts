import type { ArchSpec, SeqSpec } from '@/lib/diagrams/types';

/**
 * A case page is a list of blocks. The structure (order, diagram geometry, media) lives here in TS;
 * the copy of each block lives in messages/cases/<locale>/<slug>.json under `blocks.<key>`:
 *   text       { h?, p?: string[], list?: string[] }
 *   diagram    { h?, p?: string[], diagram: ArchCopy }
 *   sequence   { h?, p?: string[], seq: SeqCopy }
 *   flow       { h?, p?: string[], title?, caption?, steps: { actor?, t, d? }[], loop? }
 *   decisions  { h?, p?: string[], items: { t, why, alt? }[] }
 *   checks     { h?, p?: string[], items: { t, d }[] }
 *   readouts   { h?, p?: string[], items: { n, u?, d }[], note? }
 *   split      { h?, p?: string[], title, caption, payer, platform, payee, example: { k, v }[] }
 *   stack      { h?, p?: string[], groups: { k, items: string[] }[] }
 *   video      { h?, p?: string[], caption }
 *   gallery    { h?, p?: string[], items: { [shot]: { alt, caption } } }
 *   limits     { h, p?: string[], list?: string[] }
 *   art        { h?, p?: string[], …the illustration's own copy } (drawn illustrations instead of screenshots)
 *   showcase   { h?, p?: string[], items: { [id]: { alt, caption } } } (real media: video or image, in a browser or phone frame)
 * A block with `h` opens a section (and a line in the page index); one without it continues the previous section.
 */
export type BlockDef =
  | { type: 'text' | 'decisions' | 'checks' | 'readouts' | 'split' | 'stack' | 'limits'; key: string }
  | { type: 'diagram'; key: string; spec: ArchSpec }
  | { type: 'sequence'; key: string; spec: SeqSpec }
  | { type: 'flow'; key: string; cols?: number }
  | { type: 'video'; key: string; src: string; poster: string }
  | { type: 'gallery'; key: string; dir: string; shots: readonly string[] }
  | { type: 'art'; key: string; art: 'tuenti' }
  | { type: 'showcase'; key: string; items: readonly ShowItem[] };

/** One piece of real media in a showcase: files in public/media/<slug>/, with the poster of a video. */
export type ShowItem = { id: string; kind: 'video' | 'image'; frame: 'browser' | 'phone'; src: string; poster?: string; w: number; h: number; url?: string };

export type CaseDef = { blocks: BlockDef[]; links?: { label: string; href: string }[] };
