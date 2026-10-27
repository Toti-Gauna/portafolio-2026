/* ============================================================================
   CONOCER A IGNACIO — the score (cfg.music). Styles: js/recipes-music.js (Handy copy + the IG patch:
   lead / arp / sub / snare / duck / keys). Voices: js/audio.js (Handy copy + pluck, keys, sub, snare, duck).
   Full description: score.md.

   120 BPM · 1 bar = 2 s · 16ths = 0.125 s · C major / A minor · 48 bars = 96 s.
   The hook ("the seed"): four bars in the A-minor pentatonic (A C D E G) that climb a step per bar and
   resolve on C. It enters at drop 1 on a warm pluck, returns at drop 2 over new harmony (F G Em Am) with
   a bell doubling, is whispered in the breakdown and comes back an octave-doubled in the last drop.
   ========================================================================== */

// chords as midi triads (same values as Trailer.music.ACORDES; defined here so the file needs no globals)
const C = [48, 52, 55], G = [43, 47, 50], Am = [45, 48, 52], F = [41, 45, 48], Dm = [50, 53, 57], Em = [52, 55, 59];

/** The hook. [sixteenth (from the part's anchor), midi, length in sixteenths]. 4 bars, repeats every 4. */
export const HOOK = [
  [0, 69, 2], [2, 72, 2], [4, 74, 4], [8, 72, 2], [10, 69, 6],                    // F : A C D~ C A~~
  [16, 74, 2], [18, 76, 2], [20, 79, 4], [24, 76, 2], [26, 74, 6],                // G : D E G~ E D~~
  [32, 76, 2], [34, 79, 2], [36, 81, 4], [40, 79, 2], [42, 76, 2], [44, 79, 4],   // Am: E G A~ G E G~
  [48, 81, 2], [50, 79, 2], [52, 76, 2], [54, 74, 2], [56, 72, 8],                // C : A G E D C~~~
];
/** the cold open: the first three notes of the hook, slow, an octave down in feeling (A C D). */
const ECO = [[0, 69, 6], [8, 72, 6], [16, 74, 12]];
/** the signature on the last chord: the five notes climbing to the high C. */
const FIRMA = [[0, 72, 1], [1, 74, 1], [2, 76, 1], [3, 79, 1], [4, 81, 2], [6, 84, 10]];

export const PARTITURA = {
  bpm: 120, volume: 0.74,
  parts: [
    // ── ACT 1 · LA SEMILLA (0–8): A minor, cold. Pad + low heartbeat, the hook's first notes as an echo.
    { from: 0, to: 4, style: 'frio', anchor: 0, chords: [Am, F, Dm, G], hook: ECO, hookVol: 0.05, lead: 'pluck' },
    { from: 4, to: 7, style: 'latido', anchor: 0, chords: [Am, F, Dm, G], ligado: true },
    { from: 7, to: 8, style: 'subida', chords: [G] },                       // 1 s riser into the coral flood

    // ── DROP 1 · CAMINOS (8–16): the hook is born (pluck), F G Am C, light: no sub, no snare.
    { from: 8, style: 'hit', chords: [F], volume: 0.9 },
    { from: 8, to: 16, style: 'coro', chords: [F, G, Am, C], hook: HOOK, lead: 'pluck', arp: 'pluck', duck: true, volume: 0.78 },

    // ── ACT 3 · CARRERA (16–32): the verse. C G Am F, keys + answers; it fills up at the wheel (24).
    { from: 16, to: 24, style: 'verso', chords: [C, G, Am, F], answer: true, keys: true, duck: true },
    { from: 24, to: 30, style: 'verso', chords: [C, G, Am], full: true, keys: true, duck: true, arp: 'pluck' },
    { from: 30, to: 32, style: 'subida', chords: [G] },                     // 2 s build under "2026 · SSR AI"

    // ── DROP 2 · CompliA (32–48): the hook over new harmony (IV V iii vi), pluck + bell, sub, snare.
    { from: 32, style: 'hit', chords: [F], volume: 0.8 },
    { from: 32, to: 40, style: 'coro', chords: [F, G, Em, Am], hook: HOOK, lead: 'both', arp: 'pluck', sub: true, snare: true, duck: true, volume: 0.88 },
    { from: 40, to: 52, style: 'coro', chords: [F, G, Am, C], hook: false, arp: 'pluck', sub: true, snare: true, duck: true, volume: 0.86 },

    // ── ACT 5 · RAMAS (42–58): the product montage cuts on this groove; verse full under the last shots + the wall.
    { from: 52, to: 58, style: 'verso', chords: [C, G, Am], full: true, keys: true, duck: true, arp: 'pluck' },

    // ── ACT 6 · SISTEMA (58–78): breakdown (the hook on long bells, no kick) → the pulse grows as the
    //    agents assemble → verse → 2 s build under "nothing ships without human approval".
    { from: 58, to: 62, style: 'quiebre', chords: [Am, F], hook: HOOK, lead: 'bell', hookVol: 0.075 },
    { from: 62, to: 70, style: 'latido', chords: [C, G, Am, F] },
    { from: 70, to: 76, style: 'verso', chords: [F, G, Am], full: true, keys: true, duck: true, arp: 'pluck' },
    { from: 76, to: 78, style: 'subida', chords: [G] },

    // ── DROP 3 · FINAL (78–94): the biggest — octave-doubled hook, pad in two octaves, galloping bass.
    { from: 78, style: 'hit', chords: [F], volume: 0.8 },     // the title's braam carries this hit
    { from: 78, to: 90, style: 'coro', chords: [F, G, Am, C], hook: HOOK, lead: 'both', hookOct: [0, 12], hookOctDesde: 82, arp: 'pluck', sub: true, snare: true, duck: true, lleno: true, volume: 1.3 },
    { from: 90, to: 94, style: 'final', chords: [C], hook: FIRMA, hookVol: 0.06, lead: 'both' },
    // 94–96: silence. The picture fades to the portfolio's ink; nothing is scheduled at 94 or after.
  ],
};
