import type { CSSProperties } from 'react';
import { asset } from '@/lib/site';
import type { ShowItem } from '@/lib/cases/types';
import { MediaPlayer } from './MediaPlayer';
import { Reveal } from '@/components/Reveal';

export type ShowCopy = Record<string, { alt: string; caption: string }>;

/**
 * The real product, shown like a showcase: web in a browser frame, mobile in a phone frame, a caption under each.
 * The first desktop item leads, large; the rest share a grid. Videos are muted loops that only run on screen.
 */
export function Showcase({ items, copy, labels }: { items: readonly ShowItem[]; copy: ShowCopy; labels: { play: string; pause: string } }) {
  return (
    <div className="show">
      {items.map((it, i) => {
        const c = copy[it.id] ?? { alt: '', caption: '' };
        const media = it.kind === 'video'
          ? <MediaPlayer src={asset(it.src)} poster={asset(it.poster ?? '')} label={c.alt} w={it.w} h={it.h} labels={labels} />
          : <img src={asset(it.src)} alt={c.alt} width={it.w} height={it.h} loading="lazy" decoding="async" />;
        return (
          <Reveal as="figure" key={it.id} className={`show__item show__item--${it.frame}${i === 0 && it.frame === 'browser' ? ' show__item--lead' : ''}`}>
            <div className={`frame frame--${it.frame}`} style={{ '--ar': `${it.w} / ${it.h}` } as CSSProperties}>
              {it.frame === 'browser' && <div className="frame__bar" aria-hidden="true"><i /><i /><i />{it.url && <span>{it.url}</span>}</div>}
              <div className="frame__screen">{media}</div>
            </div>
            <figcaption className="note">{c.caption}</figcaption>
          </Reveal>
        );
      })}
    </div>
  );
}
