/**
 * «El calibre de tests»: the model behind the figure. Five changes ride a carriage under a dial gauge; the
 * gauge reads each one and only those inside the tolerance band go on. Everything the figure shows (the
 * needle, the lamp, the readout) comes from these numbers. World units ≈ px of the drawn object.
 */
export const CHANGES = [14, 14.3, 17.2, 13.8, 14.1] as const;
export const NOMINAL = 14;
export const TOLERANCE = 0.5;
/** One turn of the needle is this much travel of the plunger. */
export const PER_TURN = 20;

export const DIAL: [number, number] = [58, 0];
export const DIAL_R = 20;
export const TIP_R = 2.6;
export const CARRIAGE_TOP = 8;
export const BLOCK_W = 10;
export const STEP = 12;
export const FIRST = -30;

/** Where the carriage stops so that change `i` sits under the plunger. */
export const STOPS = CHANGES.map((_, i) => DIAL[0] - (FIRST + BLOCK_W / 2) - STEP * i);
export const REACH: [number, number] = [STOPS[STOPS.length - 1] - 6, STOPS[0] + 6];

export const passes = (height: number) => Math.abs(height - NOMINAL) <= TOLERANCE + 1e-9;

/** Height of whatever is under the plunger's tip when the carriage is at `cx`. */
export function heightUnder(cx: number): number {
  let top = CARRIAGE_TOP;
  CHANGES.forEach((height, i) => {
    const from = cx + FIRST + STEP * i, to = from + BLOCK_W;
    if (to > DIAL[0] - TIP_R && from < DIAL[0] + TIP_R) top = Math.max(top, CARRIAGE_TOP + height);
  });
  return top;
}

/** Index of the change centred under the plunger, or -1 between two. */
export function changeUnder(cx: number): number {
  return CHANGES.findIndex((_, i) => {
    const from = cx + FIRST + STEP * i;
    return DIAL[0] >= from && DIAL[0] <= from + BLOCK_W;
  });
}
