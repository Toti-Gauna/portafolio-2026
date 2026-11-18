import { type StampId, stampFrame, stampIsDark, stampSvg } from '../kit/stamps';
import { WORLD_IDS, WORLD_STANDS } from './world-art';

/**
 * The postcard of every stop of the world (direction 6, «Postal»: Ignacio — for Work, when a project opens).
 * Where the kit already has a stamp for the stop, that stamp: TACH, Ada ITW, Eclipse, and for Tsoft its three —
 * Tuenti, CompliA and Supernova. Every other stop is printed from its own drawing in the world: what stands on
 * it (by reference, so the art travels once) on the colour of its ground, inside the same perforated sheet.
 * No text in the art: the year and the name are HTML over it.
 */
const KIT: Record<string, StampId[]> = { tach: ['tach'], ada: ['ada'], tsoft: ['tuenti', 'complia', 'supernova'], eclipse: ['eclipse'] };
/** Where the art goes inside the sheet: below the year, above the name. */
const FIELD = { x: 30, y: 74, w: 180, h: 172 };

export type WorldPostal = { key: string; kit?: StampId; svg: string; dark: boolean };

function printed(id: string): WorldPostal {
  const s = WORLD_STANDS[id], [x, y, w, h] = s.box, k = Math.min(FIELD.w / w, FIELD.h / h);
  const tx = FIELD.x + (FIELD.w - w * k) / 2 - x * k, ty = FIELD.y + (FIELD.h - h * k) / 2 - y * k;
  return { key: `w-${id}`, dark: s.dark, svg: stampFrame(`w-${id}`, s.ground, s.dark ? '#fbf6ea' : '#0a0a0c', s.dark, `<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${k.toFixed(4)})">${s.svg}</g>`) };
}

export const WORLD_POSTALS: Record<string, WorldPostal[]> = Object.fromEntries(
  WORLD_IDS.map((id) => [id, KIT[id] ? KIT[id].map((kit) => ({ key: kit, kit, svg: stampSvg(kit), dark: stampIsDark(kit) })) : [printed(id)]]),
);
