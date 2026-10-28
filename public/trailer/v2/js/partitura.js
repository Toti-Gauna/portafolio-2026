/* ============================================================================
   CONOCER A IGNACIO — the score (cfg.music). Styles: js/recipes-music.js (Handy copy + the IG patch:
   lead / arp / sub / snare / duck / keys). Voices: js/audio.js (Handy copy + pluck, keys, sub, snare, duck).
   Full description: score.md.

   120 BPM · 1 bar = 2 s · 16ths = 0.125 s · C major / A minor · 65 bars = 130 s.
   The hook ("the seed"): four bars in the A-minor pentatonic (A C D E G) that climb a step per bar and
   resolve on C. Its first notes echo over Mar del Plata; it is born on drop 1 (the click on the first
   product, 10 s) on a warm pluck, under the first stretch of the line (12–16); the verse carries the fronts and
   their stretches; a lift for CompliA (42); it returns on drop 2 (the zoom-out over every path, 70 s) over new
   harmony (F G Em Am) with a bell doubling; answers on bells under the challenges (78 s); drives drop 3 (the
   technologies, 86 s); is whispered in the system's breakdown (102 s) and comes back octave-doubled on drop 4
   (the end card: the monogram and the name, 118 s). The industries land on the kicks of a growing pulse (82–85 s).
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
    // ── MAR DEL PLATA (0–6): A minor, cold. Pad + a low heartbeat; the hook's first notes as an echo over the coast.
    { from: 0, to: 6, style: 'frio', anchor: 0, chords: [Am, F, Dm], hook: ECO, hookVol: 0.05, lead: 'pluck' },
    // ── THE FIRST PRODUCT (6–10): the pulse grows while the games site builds; a 1-bar build under the cursor.
    { from: 6, to: 8, style: 'latido', anchor: 6, chords: [Em] },
    { from: 8, to: 10, style: 'subida', chords: [G] },                      // the click lands on its last 16th

    // ── DROP 1 (10–18): «…que me cambió la vida.» The hook is born (pluck), F G Am C, light: no sub, no snare.
    //    The first stretch of the line («Y ese fue mi primer paso…», 12–16) rides it.
    { from: 10, style: 'hit', chords: [F], volume: 0.9 },
    { from: 10, to: 18, style: 'coro', chords: [F, G, Am, C], hook: HOOK, lead: 'pluck', arp: 'pluck', duck: true, volume: 0.78 },

    // ── THE FRONTS (18–42): the verse under TACH, the stretch into the classroom, the classroom, the stretch into
    //    Tuenti and Tuenti; fuller for the last stretch (into CompliA).
    { from: 18, to: 26, style: 'verso', chords: [C, G, Am, F], answer: true, keys: true, duck: true },
    { from: 26, to: 34, style: 'verso', chords: [C, G, Am, F], keys: true, duck: true, answer: true },
    { from: 34, to: 42, style: 'verso', chords: [C, G, Am, F], full: true, keys: true, duck: true, arp: 'pluck' },
    // ── CompliA (42–48): a lift.
    { from: 42, style: 'hit', chords: [F], volume: 0.7 },
    { from: 42, to: 48, style: 'coro', chords: [F, G, Em], hook: false, arp: 'pluck', sub: true, snare: true, duck: true, volume: 0.82 },
    // ── TSOFT, TOO (48–60): the stretch into Supernova Eventos, the team, the stretch into the own path.
    { from: 48, to: 60, style: 'verso', chords: [C, G, Am], full: true, keys: true, duck: true, arp: 'pluck', answer: true },

    // ── THE OWN PATH (60–70): the montage cuts on the groove; a 1-bar build under the wall.
    { from: 60, to: 68, style: 'coro', chords: [F, G, Am, C], hook: false, arp: 'pluck', sub: true, duck: true, volume: 0.84 },
    { from: 68, to: 70, style: 'subida', chords: [G] },

    // ── DROP 2 (70–78): the zoom-out. The hook over IV–V–iii–vi, pluck + bell, sub, snare: «todo germina en lo mismo».
    { from: 70, style: 'hit', chords: [F], volume: 0.85 },
    { from: 70, to: 78, style: 'coro', chords: [F, G, Em, Am], hook: HOOK, lead: 'both', arp: 'pluck', sub: true, snare: true, duck: true, volume: 0.92 },

    // ── CHALLENGES AND INDUSTRIES (78–86): the breakdown answers with the hook's second half on bells; then the pulse
    //    grows and each industry lands on a kick (82–84.5); a 1-bar build into drop 3.
    { from: 78, to: 82, style: 'quiebre', chords: [Am, F], hook: HOOK, hookBar: 2, lead: 'bell', hookVol: 0.075 },
    { from: 82, to: 85, style: 'latido', anchor: 82, chords: [C, G] },
    { from: 85, to: 86, style: 'subida', chords: [G] },

    // ── DROP 3 (86–102): the technologies. The hook on the pluck over the full groove, then the groove alone.
    { from: 86, style: 'hit', chords: [F], volume: 0.8 },
    { from: 86, to: 94, style: 'coro', chords: [F, G, Am, C], hook: HOOK, lead: 'pluck', arp: 'pluck', sub: true, snare: true, duck: true, volume: 0.9 },
    { from: 94, to: 100, style: 'coro', chords: [F, G, Am], hook: false, arp: 'pluck', sub: true, snare: true, duck: true, volume: 0.86 },
    { from: 100, to: 102, style: 'subida', chords: [G] },

    // ── THE SYSTEM (102–118): one bar of breakdown (the hook on bells) → the pulse grows as the agents assemble →
    //    verse under the rules and the CI run → a 2 s build into the finale.
    { from: 102, to: 104, style: 'quiebre', chords: [Am], hook: HOOK, lead: 'bell', hookVol: 0.07 },
    { from: 104, to: 110, style: 'latido', chords: [C, G, Am] },
    { from: 110, to: 116, style: 'verso', chords: [F, G, Am], full: true, keys: true, duck: true, arp: 'pluck' },
    { from: 116, to: 118, style: 'subida', chords: [G] },

    // ── DROP 4 · THE END CARD (118–128): the biggest — on the monogram and the name: octave-doubled hook, pad in two
    //    octaves, galloping bass; then the signature on the last chord while the e-mail and the link hold.
    { from: 118, style: 'hit', chords: [F], volume: 0.8 },
    { from: 118, to: 124, style: 'coro', chords: [F, G, Am], hook: HOOK, lead: 'both', hookOct: [0, 12], hookOctDesde: 120, arp: 'pluck', sub: true, snare: true, duck: true, lleno: true, volume: 1.3 },
    { from: 124, to: 128, style: 'final', chords: [C], hook: FIRMA, hookVol: 0.06, lead: 'both' },
    // 128–130: silence. The end card empties to the portfolio's ink; nothing is scheduled at 128 or after.
  ],
};
