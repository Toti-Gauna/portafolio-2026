import script from './script.json';

/**
 * The film «Conocer a Ignacio» of /v2 (lote 8.2), as numbers: when every shot and chapter starts, the stage of each
 * format and the journey of the dot. Pure: the player, the film and the tests read the same thing.
 */
export type Fmt = 'w' | 't';
export type Theme = 'ink' | 'coral' | 'blue' | 'paper' | 'amber' | 'lime' | 'orange' | 'mint' | 'pink';
export type FilmShot = {
  id: string; chapter: string; bars: number[]; theme: Theme; year: string; cues: Record<string, number>; start: number; dur: number;
  case?: string; stamp?: string; media?: string; media2?: string; clip?: string; show?: string[]; count?: { to: number; key: string };
};

export const BEAT = 60 / script.bpm;
export const BAR = BEAT * script.beatsPerBar;
export const TOTAL = script.bars * BAR;
export const SHOTS: FilmShot[] = (script.shots as unknown as Omit<FilmShot, 'start' | 'dur'>[]).map((s) => ({ ...s, start: (s.bars[0] - 1) * BAR, dur: s.bars[1] * BAR }));
export const CHAPTERS = script.chapters.map((c) => ({ id: c.id, start: (c.bars[0] - 1) * BAR, dur: c.bars[1] * BAR }));
/** the stage, in units: every size and position of the film is in these */
export const STAGE: Record<Fmt, [number, number]> = { w: [160, 90], t: [90, 160] };

const at = <T extends { start: number }>(list: T[], t: number) => { let i = 0; list.forEach((x, j) => { if (t >= x.start - 1e-6) i = j; }); return i; };
export const shotAt = (t: number) => at(SHOTS, t);
export const chapterAt = (t: number) => at(CHAPTERS, t);
/** A shot is on stage from a breath before its bar until the next one has covered it. */
export const LIVE = { before: 0.12, after: 0.75 };
export const isLive = (i: number, t: number) => t >= SHOTS[i].start - LIVE.before && (i === SHOTS.length - 1 || t < SHOTS[i].start + SHOTS[i].dur + LIVE.after);

// ── the mark, where the dot begins and ends: the «i» of the monogram (viewBox 48: dot at 11, 7, r 3.4) ────────────────
export const MARK = { open: { w: [69, 34, 22], t: [34, 69, 22] }, end: { w: [67, 15, 26], t: [28, 33, 34] } } as const;
const markDot = ([x, y, w]: readonly [number, number, number]): [number, number, number] => [x + (11 / 48) * w, y + (7 / 48) * w, (6.8 / 48) * w];
/** the seven stations of «the human gate», by format */
export const STATIONS_AT: Record<Fmt, [number, number][]> = {
  w: Array.from({ length: 7 }, (_, i) => [16 + i * 21.3, 28] as [number, number]),
  t: Array.from({ length: 7 }, (_, i) => [16, 26 + i * 12] as [number, number]),
};
/** the centre of the ring of agents */
export const RING_AT: Record<Fmt, [number, number]> = { w: [117, 45], t: [45, 114] };
/** the city on the map of the first shot (the viewBox of each format puts it there) */
export const CITY_AT: Record<Fmt, [number, number]> = { w: [48, 45], t: [45, 80] };
/** the slot of the dot in the «Jugar» button */
export const PLAY_AT: Record<Fmt, [number, number]> = { w: [110, 73], t: [36, 132] };

type Land = { at: number; w: [number, number]; t: [number, number]; size?: number; tap?: boolean };
const CORNER: Pick<Land, 'w' | 't'> = { w: [150, 17], t: [80, 13] };
const [mo, me] = [MARK.open, MARK.end];
/** Where the dot lands in each shot: `at` in beats from the start of the shot (0 = on its first beat), a size in units. */
export const DOT: Record<string, Land[]> = {
  mdp: [{ at: 3, ...CITY_AT, size: 4 }],
  first: [{ at: 0, ...PLAY_AT, size: 3 }, { at: 7, ...PLAY_AT, size: 3, tap: true }],
  tach: [{ at: 0, ...CORNER }], ada: [{ at: 0, ...CORNER }], tuenti: [{ at: 0, ...CORNER }],
  ia: [{ at: 0, w: [80, 22], t: [45, 44], size: 6 }],
  complia: [{ at: 0, ...CORNER }],
  'complia-state': [{ at: 0, w: [84, 76], t: [80, 13], size: 4 }],
  supernova: [{ at: 0, ...CORNER }],
  own: [{ at: 0, w: [12, 45], t: [45, 22], size: 4 }],
  eclipse: [{ at: 0, ...CORNER }],
  volta: [{ at: 0, w: [150, 15], t: [80, 13], size: 4 }], velmar: [{ at: 0, w: [10, 15], t: [80, 13], size: 4 }],
  dentalos: [{ at: 0, w: [150, 15], t: [80, 13], size: 4 }], kinetic: [{ at: 0, w: [10, 15], t: [80, 13], size: 4 }],
  games: [{ at: 0, w: [150, 15], t: [80, 13], size: 4 }],
  agents: [{ at: 0, ...RING_AT }],
  gate: [0, 0.5, 1, 1.5, 2, 2.5, 6].map((b, i) => ({ at: b, w: STATIONS_AT.w[i], t: STATIONS_AT.t[i], size: 3.4 })),
  drive: [{ at: 0, ...CORNER }],
  end: [{ at: 0, w: [markDot(me.w)[0], markDot(me.w)[1]], t: [markDot(me.t)[0], markDot(me.t)[1]], size: markDot(me.w)[2] }],
};
/** the colour of the dot on each field */
export const DOT_COLOR: Record<Theme, string> = { ink: '#ff5a3c', coral: '#eeeae3', blue: '#ff7a5c', paper: '#ff4d2e', amber: '#2b50ff', lime: '#060513', orange: '#060513', mint: '#060513', pink: '#060513' };
export type DotStop = { t: number; x: number; y: number; size: number; color: string; shot: number; tap: boolean };
/** Every landing of the dot, in order: it starts as the dot of the mark and ends as the dot of the mark. */
export function dotTrack(fmt: Fmt): DotStop[] {
  const [x0, y0, d0] = markDot(mo[fmt]);
  const out: DotStop[] = [{ t: -1, x: x0, y: y0, size: d0, color: DOT_COLOR.ink, shot: 0, tap: false }];
  SHOTS.forEach((s, i) => {
    for (const l of DOT[s.id]) {
      const size = s.id === 'end' ? markDot(me[fmt])[2] : l.size ?? 5;
      out.push({ t: s.start + l.at * BEAT, x: l[fmt][0], y: l[fmt][1], size, color: DOT_COLOR[s.theme], shot: i, tap: !!l.tap });
    }
  });
  return out;
}
/** where the wave of a shot is born: the first landing of the dot in it */
export const waveAt = (id: string, fmt: Fmt): [number, number] => DOT[id][0][fmt];
