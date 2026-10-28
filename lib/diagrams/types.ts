/**
 * Diagram specs: structure and geometry live here (TS); every visible word lives in messages (the copy object).
 * Each architecture diagram has two hand-placed layouts: `desktop` (viewBox 1000 wide, min text 15 units, shown
 * when its container is ≥ 820 px, so text stays ≥ 12 px) and `mobile` (viewBox 360 wide, min text 15 units: ≥ 12.6 px on a 360 px phone).
 */
export type NodeKind = 'client' | 'server' | 'db' | 'service' | 'external' | 'queue' | 'ai' | 'person' | 'gate' | 'doc' | 'code' | 'cloud';
export type Tone = 'coral' | 'blue' | 'paper' | 'yellow' | 'green';
export type Side = 't' | 'r' | 'b' | 'l';

export type Box = { x: number; y: number; w?: number; h?: number };
export type EdgeGeo = {
  /** sides of the source and target boxes (default: picked from relative position) */
  from?: Side; to?: Side;
  /** shift of each anchor along its side, in units */
  fo?: number; too?: number;
  /** a hand-written path instead of the automatic curve */
  d?: string;
  /** label position (default: middle of the curve); `hide` drops the label in this layout */
  lx?: number; ly?: number; hide?: boolean;
};
export type Layout = {
  w: number; h: number;
  nodes: Record<string, Box>;
  edges?: Record<string, EdgeGeo>;
  groups?: Record<string, { x: number; y: number; w: number; h: number }>;
};
export type ArchSpec = {
  id: string;
  nodes: { id: string; kind: NodeKind; tone?: Tone }[];
  /** order = the order packets travel in (and the order of the text version) */
  edges: { id: string; from: string; to: string; dashed?: boolean; tone?: Tone }[];
  groups?: { id: string; tone?: Tone }[];
  desktop: Layout;
  mobile: Layout;
};

/** Copy of a diagram (messages). Nodes with a `note` get a numbered callout and a line in the legend. */
export type ArchCopy = {
  /** a small tag over the title, e.g. «Esquema conceptual» */
  badge?: string;
  title: string;
  caption: string;
  nodes: Record<string, { label: string; sub?: string; note?: string }>;
  edges?: Record<string, string>;
  groups?: Record<string, string>;
};

export type SeqSpec = {
  id: string;
  lanes: { id: string; kind: NodeKind }[];
  msgs: { id: string; from: string; to: string; back?: boolean; tone?: Tone }[];
};
export type SeqCopy = { title: string; caption: string; lanes: Record<string, string>; msgs: Record<string, string> };
