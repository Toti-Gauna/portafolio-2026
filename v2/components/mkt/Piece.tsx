import type { CSSProperties, ReactNode } from 'react';
import type { Svg } from '../brand/types';
import type { PieceKind } from './types';

/**
 * The pieces of a playbook (lote 6.3), drawn as HTML in the brand's skin: the frame reads the brand's fields
 * (--m-*, --a-*, --on-accent), its radius and its two families; the words are the copy's `p`. Each kind has a fixed
 * design size (PIECE_SIZE, px) with text of 12 px or more at scale 1. In `mini` (the thumbnails of the map, scaled
 * down) every word becomes a bar, so nothing on screen is ever smaller than 12 px. Pieces are pictures of examples:
 * aria-hidden, their message is written beside them.
 */
export const PIECE_SIZE: Record<PieceKind, [number, number]> = {
  post: [300, 340], story: [210, 370], web: [320, 230], chat: [260, 300], mail: [300, 250], call: [210, 330],
  link: [300, 250], game: [210, 330], review: [260, 220], qr: [210, 250], board: [230, 300], tag: [210, 210],
  ticket: [270, 150], card: [290, 170], box: [260, 230], counter: [260, 210], sample: [170, 240], sheet: [230, 300],
};

type Brand = { name: string; mark: Svg };
type P = Record<string, string | string[]>;

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(' ') : (v ?? ''));
const list = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

/** A deterministic, decorative QR-like grid (21 × 21 modules, three finder squares). It encodes nothing. */
function Qr({ seed, size = 72 }: { seed: string; size?: number }) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rnd = () => ((h = Math.imul(h ^ (h >>> 13), 1274126177)) >>> 0) / 4294967296;
  const finder = (x: number, y: number) => x < 8 && y < 8 ? true : x > 12 && y < 8 ? true : x < 8 && y > 12;
  let d = '';
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) { if (!finder(x, y) && rnd() > 0.52) d += `M${x} ${y}h1v1h-1z`; }
  const eye = (x: number, y: number) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
  return (
    <svg className="mkp-qr" viewBox="-1 -1 23 23" width={size} height={size} aria-hidden="true">
      <rect x="-1" y="-1" width="23" height="23" fill="#fff" />
      <path d={d + eye(0, 0) + eye(14, 0) + eye(0, 14)} fill="#000" fillRule="evenodd" />
    </svg>
  );
}

const Mark = ({ art, className }: { art: Svg; className?: string }) => (
  <svg className={className ?? 'mkp-mark'} viewBox={art.box.join(' ')} aria-hidden="true" dangerouslySetInnerHTML={{ __html: art.svg }} />
);

export function Piece({ kind, p, brand, mini = false, seed }: { kind: PieceKind; p: P; brand: Brand; mini?: boolean; seed: string }) {
  /** a word, or its bar in a thumbnail */
  const T = ({ t, className, as: Tag = 'span' }: { t?: string | string[]; className?: string; as?: 'span' | 'b' | 'p' | 'li' }) => {
    const s = str(t);
    if (!s) return null;
    if (mini) return <i className={`mkb ${className ?? ''}`} style={{ '--w': `${Math.max(28, Math.min(100, s.length * 3.4))}%` } as CSSProperties} />;
    return <Tag className={className}>{s}</Tag>;
  };
  const [w, h] = PIECE_SIZE[kind];
  const frame = (field: 'm' | 'a' | 'x', children: ReactNode) => (
    <div className={`mkp mkp-${kind}`} data-on={field} data-mini={mini ? '' : undefined} style={{ width: w, height: h, '--s': mini ? Math.min(112 / w, 88 / h).toFixed(3) : 1 } as CSSProperties} aria-hidden="true">{children}</div>
  );
  const head = (
    <div className="mkp-head"><Mark art={brand.mark} /><T t={brand.name} as="b" /></div>
  );

  switch (kind) {
    case 'post':
      return frame('a', <>
        {head}
        <div className="mkp-sq" data-on="m">
          <Mark art={brand.mark} className="mkp-ghost" />
          {p.steps ? (
            <><T t={p.h} className="mkp-h mkp-fd" as="b" /><ol className="mkp-steps">{list(p.steps).map((s, i) => <li key={i}><span className="mkp-sn">{i + 1}</span><T t={s} /></li>)}</ol></>
          ) : (<><T t={p.h} className="mkp-h mkp-fd mkp-big" as="b" /><T t={p.s} className="mkp-s" /></>)}
        </div>
        <div className="mkp-foot"><T t={p.tag} className="mkp-chip" /></div>
      </>);
    case 'story':
      return frame('m', <>
        <div className="mkp-bars"><i /><i /><i /></div>
        {head}
        <div className="mkp-fill"><Mark art={brand.mark} className="mkp-ghost" /></div>
        <T t={p.h} className="mkp-h mkp-fd mkp-big" as="b" />
        <T t={p.s} className="mkp-s" />
        <T t={p.cta} className="mkp-btn" />
      </>);
    case 'web':
      return frame('a', <>
        <div className="mkp-chrome"><i /><i /><i /><T t={brand.name} className="mkp-url" /></div>
        <div className="mkp-hero" data-on="m">
          <T t={p.h} className="mkp-h mkp-fd" as="b" />
          <T t={p.s} className="mkp-s" />
          <T t={p.cta} className="mkp-btn" />
        </div>
      </>);
    case 'chat':
      return frame('a', <>
        {head}
        <div className="mkp-thread">
          {p.q ? <div className="mkp-bub" data-me=""><T t={p.q} /></div> : null}
          {list(p.m).map((m, i) => <div key={i} className="mkp-bub" data-on="m"><T t={m} /></div>)}
        </div>
      </>);
    case 'mail':
      return frame('a', <>
        {head}
        <T t={p.subj} className="mkp-subj" as="b" />
        <div className="mkp-body"><T t={p.m} as="p" /></div>
        <T t={p.cta} className="mkp-btn" />
      </>);
    case 'call':
      return frame('m', <>
        <div className="mkp-avatar"><Mark art={brand.mark} /></div>
        <T t={p.who} className="mkp-h mkp-fd" as="b" />
        <div className="mkp-bub" data-on="a"><T t={p.m} /></div>
        <div className="mkp-keys"><i data-k="end" /><i data-k="ok" /></div>
      </>);
    case 'link':
      return frame('a', <>
        <div className="mkp-og" data-on="m"><Mark art={brand.mark} /></div>
        <div className="mkp-meta"><T t={p.h} className="mkp-subj" as="b" /><T t={p.d} className="mkp-d" /></div>
      </>);
    case 'game':
      return frame('m', <>
        {head}
        <T t={p.h} className="mkp-h mkp-fd" as="b" />
        <svg className="mkp-wheel" viewBox="-50 -50 100 100" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2, b = ((i + 1) / 8) * Math.PI * 2;
            return <path key={i} d={`M0 0L${(46 * Math.cos(a)).toFixed(2)} ${(46 * Math.sin(a)).toFixed(2)}A46 46 0 0 1 ${(46 * Math.cos(b)).toFixed(2)} ${(46 * Math.sin(b)).toFixed(2)}Z`} data-i={i % 2} />;
          })}
          <circle r="9" className="mkp-hub" />
          <path d="M0 -50l-6 -9h12z" className="mkp-tick" />
        </svg>
        <T t={p.prize} className="mkp-chip" />
      </>);
    case 'review':
      return frame('a', <>
        {head}
        <T t={p.h} className="mkp-h mkp-fd" as="b" />
        <div className="mkp-stars">{Array.from({ length: 5 }, (_, i) => <svg key={i} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8z" /></svg>)}</div>
        <T t={p.s} className="mkp-s" />
      </>);
    case 'qr':
      return frame('a', <>
        <div className="mkp-tent" data-on="m">
          <Mark art={brand.mark} />
          <Qr seed={seed} size={88} />
          <T t={p.h} className="mkp-s" as="b" />
        </div>
        <i className="mkp-base" />
      </>);
    case 'board':
      return frame('a', <>
        <div className="mkp-slate" data-on="m">
          <Mark art={brand.mark} />
          {list(p.l).map((l, i) => <T key={i} t={l} className="mkp-chalk mkp-fd" as="b" />)}
        </div>
        <i className="mkp-legs" />
      </>);
    case 'tag':
      return frame('m', <>
        <svg className="mkp-nfc" viewBox="0 0 48 48" aria-hidden="true"><path d="M18 30a8 8 0 0 1 0-12M13 35a15 15 0 0 1 0-22M30 18a8 8 0 0 1 0 12M35 13a15 15 0 0 1 0 22" /><circle cx="24" cy="24" r="3" /></svg>
        <T t={p.h} className="mkp-h mkp-fd mkp-big" as="b" />
        <T t={p.s} className="mkp-s" />
      </>);
    case 'ticket':
      return frame('a', <>
        <div className="mkp-tk">
          <div className="mkp-tk-main"><Mark art={brand.mark} /><T t={p.h} className="mkp-subj" as="b" /><T t={p.s} className="mkp-s" /></div>
          <div className="mkp-tk-stub" data-on="m"><T t={p.code} className="mkp-code" as="b" /></div>
        </div>
      </>);
    case 'card':
      return frame('m', <>
        <div className="mkp-card-l"><Mark art={brand.mark} /><T t={p.h} className="mkp-h mkp-fd" as="b" /><T t={p.s} className="mkp-s" /><T t={p.d} className="mkp-d" /></div>
        <Qr seed={seed} size={64} />
      </>);
    case 'box':
      return frame('a', <>
        <div className="mkp-crate">
          <i className="mkp-lid" data-on="m" />
          <div className="mkp-face" data-on="m"><Mark art={brand.mark} /><T t={p.h} className="mkp-h mkp-fd" as="b" /><T t={p.s} className="mkp-s" /></div>
        </div>
      </>);
    case 'counter':
      return frame('a', <>
        <div className="mkp-sign" data-on="x"><Mark art={brand.mark} /><T t={p.h} className="mkp-h mkp-fd mkp-big" as="b" /><T t={p.s} className="mkp-s" /></div>
        <i className="mkp-desk" data-on="m" />
      </>);
    case 'sample':
      return frame('m', <>
        <i className="mkp-crimp" /><Mark art={brand.mark} /><T t={p.h} className="mkp-h mkp-fd" as="b" /><T t={p.s} className="mkp-s" /><i className="mkp-crimp" />
      </>);
    case 'sheet':
      return frame('a', <>
        <div className="mkp-head"><Mark art={brand.mark} /><T t={p.h} className="mkp-subj" as="b" /></div>
        <ol className="mkp-lines">{list(p.l).map((l, i) => <li key={i}><span className="mkp-sn">{i + 1}</span><T t={l} /></li>)}</ol>
        <Qr seed={seed} size={56} />
      </>);
  }
}
