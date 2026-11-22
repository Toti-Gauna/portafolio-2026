/**
 * How the parts of the film move (lote 8.2). A preset turns the size of a stage unit (px) into the keyframes of ONE
 * Web Animation; the film gives it its place in time. Only transform, opacity, clip-path and stroke-dashoffset move.
 */
export type Motion = { keyframes: Keyframe[]; duration: number; easing?: string; offset?: number };
export type PresetArgs = { u: number; n: number; rx: number; ry: number; hold: number };
type Preset = (a: PresetArgs) => Motion;
const SPRING = 'cubic-bezier(.2,1.5,.4,1)', OUT = 'cubic-bezier(.2,.8,.2,1)', IN = 'cubic-bezier(.6,0,.9,.4)';
const px = (n: number) => `${n.toFixed(2)}px`;
const tilt = (u: number, ry: number, rx: number, y = 0, z = 0) => `perspective(${px(u * 130)}) translate3d(0,${px(y)},${px(z)}) rotateY(${ry}deg) rotateX(${rx}deg)`;

export const PRESETS: Record<string, Preset> = {
  /** comes down into place: the camera is going up */
  drop: ({ u }) => ({ keyframes: [{ opacity: 0, transform: `translateY(${px(-u * 5)})` }, { opacity: 1, offset: 0.5 }, { opacity: 1, transform: 'translateY(0)' }], duration: 520, easing: SPRING }),
  rise: ({ u }) => ({ keyframes: [{ opacity: 0, transform: `translateY(${px(u * 4)})` }, { opacity: 1, transform: 'translateY(0)' }], duration: 460, easing: OUT }),
  fade: () => ({ keyframes: [{ opacity: 0 }, { opacity: 1 }], duration: 380, easing: 'linear' }),
  out: () => ({ keyframes: [{ opacity: 1 }, { opacity: 0 }], duration: 420, easing: 'linear' }),
  pop: () => ({ keyframes: [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, offset: 0.4 }, { opacity: 1, transform: 'scale(1)' }], duration: 420, easing: SPRING }),
  slam: () => ({ keyframes: [{ opacity: 0, transform: 'scale(1.5)' }, { opacity: 1, offset: 0.5 }, { opacity: 1, transform: 'scale(1)' }], duration: 340, easing: OUT }),
  tag: ({ u }) => ({ keyframes: [{ opacity: 0, transform: `translateX(${px(-u * 7)})` }, { opacity: 1, offset: 0.5 }, { opacity: 1, transform: 'translateX(0)' }], duration: 440, easing: SPRING }),
  /** the postmark: it comes from above, turned, and hits the paper */
  stamp: () => ({ keyframes: [{ opacity: 0, transform: 'scale(2.3) rotate(-22deg)' }, { opacity: 1, transform: 'scale(.94) rotate(9deg)', offset: 0.62, easing: OUT }, { opacity: 1, transform: 'scale(1) rotate(7deg)' }], duration: 380, easing: IN }),
  /** a glass panel arrives from the depth, turning, and rests turned */
  glass: ({ u, ry, rx }) => ({ keyframes: [{ opacity: 0, transform: tilt(u, ry - 34, rx + 16, -u * 12, -u * 46) }, { opacity: 1, offset: 0.35 }, { opacity: 1, transform: tilt(u, ry, rx) }], duration: 900, easing: OUT }),
  /** …and keeps drifting while the shot lasts (the hold, in beats) */
  drift: ({ ry, hold }) => ({ keyframes: [{ transform: `rotateY(${-ry * 0.16}deg)` }, { transform: `rotateY(${ry * 0.16}deg)` }], duration: Math.max(1, hold) * 555.6, easing: 'ease-in-out', offset: 0 }),
  /** the camera comes close to the panel */
  push: ({ u, ry, rx }) => ({ keyframes: [{ opacity: 0, transform: tilt(u, ry - 22, rx + 5, 0, -u * 30) + ' scale(.8)' }, { opacity: 1, offset: 0.3 }, { opacity: 1, transform: tilt(u, ry, rx) }], duration: 1100, easing: OUT }),
  /** a light crosses the glass once */
  glint: () => ({ keyframes: [{ transform: 'translateX(-130%) skewX(-18deg)', opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: 'translateX(330%) skewX(-18deg)', opacity: 0 }], duration: 900, easing: 'ease-in-out', offset: 0.5 }),
  draw: ({ hold }) => ({ keyframes: [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], duration: Math.max(0.5, hold) * 555.6, easing: 'ease-in-out', offset: 0 }),
  /** a pill lights up on its beat; with a hold it goes out when the next one lights */
  lit: ({ hold }) => hold > 0
    ? { keyframes: [{ opacity: 0 }, { opacity: 1, offset: 140 / (hold * 555.6 + 280) }, { opacity: 1, offset: 1 - 140 / (hold * 555.6 + 280) }, { opacity: 0 }], duration: hold * 555.6 + 280, easing: 'linear' }
    : { keyframes: [{ opacity: 0 }, { opacity: 1 }], duration: 140, easing: 'linear' },
  /** a digit rolls to its value: n rows of the column, each `hold` units tall */
  roll: ({ u, n, hold }) => ({ keyframes: [{ transform: 'translateY(0)' }, { transform: `translateY(${px(-n * hold * u)})` }], duration: 900 + n * 60, easing: 'cubic-bezier(.2,.9,.2,1)' }),
  /** a ring on the map opens from the light */
  ring: () => ({ keyframes: [{ opacity: 0, transform: 'scale(.2)' }, { opacity: 1, offset: 0.4 }, { opacity: 1, transform: 'scale(1)' }], duration: 700, easing: OUT }),
  /** the mark takes the hit of the dot */
  hit: () => ({ keyframes: [{ transform: 'scale(1,1)' }, { transform: 'scale(1.06,.9)', offset: 0.3 }, { transform: 'scale(.97,1.05)', offset: 0.65 }, { transform: 'scale(1,1)' }], duration: 420, easing: 'ease-out', offset: 0 }),
  /** the stamps open like a hand of cards: n is the place in the fan */
  fan: ({ u, n }) => ({ keyframes: [{ opacity: 0, transform: `translateY(${px(u * 30)}) rotate(0deg)` }, { opacity: 1, offset: 0.3 }, { opacity: 1, transform: `translateY(0) rotate(${(n - 2.5) * 12}deg)` }], duration: 640, easing: SPRING }),
};
export type PresetName = keyof typeof PRESETS;
/** what a part may animate: the rule of the whole site */
export const ALLOWED = ['opacity', 'transform', 'clipPath', 'strokeDashoffset', 'offset', 'easing'];
