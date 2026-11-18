import { tokens } from '@/v2/tokens';

const c = tokens.color;
/**
 * The colours the 2D gate («Cinética») passes through. Each one is a whole screen: the field, what is written
 * on it (`fg`, and `soft` for small print), the surname (`alt`, large type), the dot of the mark, the main
 * button, the flash that runs ahead of the wipe (`edge`) and the focus ring.
 * `tests/unit/v2-tokens.test.ts` measures every pair of use (AA; 3:1 for the large surname).
 */
export const GATE_THEMES = {
  ink: { bg: c['bg-deep'], fg: c.paper, soft: c['mist-300'], alt: c['coral-400'], dot: c['coral-500'], btn: c['coral-500'], btnFg: c['on-accent'], edge: c['pink-500'], focus: c.focus },
  coral: { bg: c['coral-500'], fg: c['ink-950'], soft: c['ink-950'], alt: c.white, dot: c.paper, btn: c['ink-950'], btnFg: c.paper, edge: c['amber-500'], focus: c['ink-950'] },
  blue: { bg: c['blue-ig'], fg: c.white, soft: c.white, alt: c['amber-500'], dot: c['coral-400'], btn: c.paper, btnFg: c['ink-950'], edge: c['cyan-400'], focus: c.white },
  paper: { bg: c.paper, fg: c['ink-950'], soft: c['ink-600'], alt: c['blue-ig'], dot: c['coral-ig'], btn: c['coral-500'], btnFg: c['on-accent'], edge: c['mint-500'], focus: c['ink-950'] },
  amber: { bg: c['amber-500'], fg: c['ink-950'], soft: c['ink-950'], alt: c['blue-ig'], dot: c['blue-ig'], btn: c['ink-950'], btnFg: c['amber-300'], edge: c['coral-500'], focus: c['ink-950'] },
} as const;
export type GateTheme = keyof typeof GATE_THEMES;
/** The opening: the screen starts in ink and every landing of the ball takes it to the next colour. */
export const GATE_INTRO: GateTheme[] = ['ink', 'coral', 'blue', 'paper', 'ink'];
/** At rest, the mark is a button: each press takes the gate to the next colour. */
export const GATE_CYCLE: GateTheme[] = ['ink', 'coral', 'blue', 'paper', 'amber'];
