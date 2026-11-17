import { lineOnTop, type Projection } from '@/v2/iso/iso-kit';
import { DIAL, DIAL_R } from './gauge-model';

/** Height of the dial's face. */
export const DIAL_TOP = 92;

/** Direction of the needle for a reading in turns, as a unit vector on the dial's face (0 points to the back). */
export const needleDir = (turn: number): [number, number] => [Math.sin(turn * Math.PI * 2), -Math.cos(turn * Math.PI * 2)];

/** Path of the needle for a reading in turns: the same function draws it on the server and moves it in the page. */
export function needlePath(turn: number, P: Projection): string {
  const [dx, dy] = needleDir(turn), [x, y] = DIAL;
  return lineOnTop([x - dx * 3.4, y - dy * 3.4], [x + dx * (DIAL_R - 4), y + dy * (DIAL_R - 4)], DIAL_TOP + 0.2, P);
}
