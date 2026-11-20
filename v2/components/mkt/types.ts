/**
 * Marketing playbooks of /v2 (lote 6.3): one per project with a brand, on its page of the Brand Lab. This file is the
 * contract between the frame (the map of touchpoints, the pieces, the calendar) and each playbook (data in plays.ts,
 * words in messages/v2/mkt/<locale>/<id>.json).
 *
 * A playbook is a plan: which piece goes in each moment of the customer's way, on a screen or on the street, how it is
 * done and what is looked at. Every touchpoint says where it comes from: built in the product's repo, written in its
 * documents, live on this site, or proposed by the playbook. Pieces are examples drawn in the brand's skin; nothing
 * here is a result.
 */
import type { BrandId } from '../brand/types';

export type PlayId = Extract<BrandId, 'ig' | 'eclipse' | 'velmar' | 'volta' | 'brisa' | 'lucero'>;

/** Screen or street. */
export type Lane = 'digital' | 'physical';

/** Where a touchpoint comes from: the product's code, its documents, this site, or the playbook's own proposal. */
export type TouchOrigin = 'repo' | 'doc' | 'site' | 'plan';

/** The kinds of piece the frame knows how to draw (Piece.tsx). Their words are the copy's `p`. */
export type PieceKind =
  | 'post' | 'story' | 'web' | 'chat' | 'mail' | 'call' | 'link' | 'game' | 'review'
  | 'qr' | 'board' | 'tag' | 'ticket' | 'card' | 'box' | 'counter' | 'sample' | 'sheet';

/** A file of the product's repo (or of this site) and a literal string that is in it: a local check reads the repo and
 *  confirms it (session scratchpad, mk63/verify.mjs). */
export type TouchSource = { path: string; match: string };

export type Touch = {
  id: string;
  lane: Lane;
  /** index of the stage of the way (copy.stages) */
  stage: number;
  kind: PieceKind;
  origin: TouchOrigin;
  /** for repo, doc and site; a plan has none */
  src?: TouchSource;
};

/** A date of the year (month 1–12, day). A range that crosses New Year is split by the calendar. */
export type Day = [month: number, day: number];
export type CalDate = { key: string; lane: string; from: Day; to: Day };

export type Play = {
  id: PlayId;
  /** the repo the sources point at (owner/name) and its commit; IG points at this site */
  repo: string;
  sha?: string;
  /** how many stages the way has */
  stages: number;
  /** the touchpoints in the order the customer meets them: the path of the map */
  touches: Touch[];
  /** the brand's year of campaigns, when its repo has one */
  calendar?: { lanes: string[]; dates: CalDate[]; src: TouchSource };
};

/** The words of a playbook. Limits are measured by tests/unit/v2-mkt.test.ts. */
export type MktCopy = {
  /** ≤ 8 words */
  title: string;
  /** the one thing the playbook wants the customer to do (≤ 12 words) */
  goal: string;
  /** who it speaks to (≤ 14 words) */
  audience: string;
  /** one name per stage of the way (≤ 3 words each) */
  stages: string[];
  touches: Record<string, {
    /** ≤ 5 words */
    name: string;
    /** the message the piece carries (≤ 26 words) */
    msg: string;
    /** how it is done (≤ 24 words) */
    rule: string;
    /** what is looked at (≤ 14 words; a signal, never a number) */
    watch: string;
    /** the words inside the piece */
    p: Record<string, string | string[]>;
    /** accessible description of the piece (≤ 16 words) */
    alt: string;
  }>;
  /** how the brand talks in its marketing: three rules (≤ 16 words each) */
  rules: string[];
  calendar?: { title: string; lanes: Record<string, string>; dates: Record<string, string> };
  /** the next step, where the record leaves one (≤ 26 words) */
  next?: string;
  /** where the playbook comes from (≤ 34 words) */
  source: string;
};
