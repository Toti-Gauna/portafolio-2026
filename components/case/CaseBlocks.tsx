import type { CSSProperties } from 'react';
import type { ArchCopy, SeqCopy } from '@/lib/diagrams/types';
import type { BlockDef } from '@/lib/cases/types';
import { asset } from '@/lib/site';
import { Diagram, type DiagramUi } from '@/components/diagrams/Diagram';
import { Sequence } from '@/components/diagrams/Sequence';
import { Flow, type FlowStep } from '@/components/diagrams/Flow';
import { Readouts, type Readout } from '@/components/diagrams/Readouts';
import { MoneySplit, type SplitCopy } from '@/components/diagrams/MoneySplit';
import { Reveal } from '@/components/Reveal';

type Copy = {
  h?: string; p?: string[]; list?: string[];
  diagram?: ArchCopy; seq?: SeqCopy;
  title?: string; caption?: string; steps?: FlowStep[]; loop?: string;
  items?: unknown; note?: string; groups?: { k: string; items: string[] }[];
} & Partial<SplitCopy>;

export type CaseUi = DiagramUi & { why: string; alt: string };

/** Groups blocks into sections: a block with a heading opens one, the next blocks without a heading join it. */
export function sectionsOf(blocks: BlockDef[], copy: Record<string, Copy>) {
  const out: { id: string; h: string; blocks: BlockDef[] }[] = [];
  for (const b of blocks) {
    const h = copy[b.key]?.h;
    if (h || out.length === 0) out.push({ id: b.key, h: h ?? '', blocks: [b] });
    else out[out.length - 1].blocks.push(b);
  }
  return out;
}

export function CaseSections({ blocks, copy, ui }: { blocks: BlockDef[]; copy: Record<string, Copy>; ui: CaseUi }) {
  return (
    <>
      {sectionsOf(blocks, copy).map((s, i) => (
        <section key={s.id} id={s.id} className="cs" aria-labelledby={`h-${s.id}`}>
          <h2 id={`h-${s.id}`} className="cs__h"><span className="cs__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{s.h}</h2>
          {s.blocks.map((b) => <Block key={b.key} b={b} c={copy[b.key] ?? {}} ui={ui} />)}
        </section>
      ))}
    </>
  );
}

function Prose({ c }: { c: Copy }) {
  if (!c.p && !c.list) return null;
  return (
    <div className="cs__prose">
      {c.p?.map((t) => <p key={t}>{t}</p>)}
      {c.list && <ul>{c.list.map((t) => <li key={t}>{t}</li>)}</ul>}
    </div>
  );
}

function Block({ b, c, ui }: { b: BlockDef; c: Copy; ui: CaseUi }) {
  switch (b.type) {
    case 'text':
    case 'limits':
      return <div className={b.type === 'limits' ? 'cs__limits' : undefined}><Prose c={c} /></div>;
    case 'diagram':
      return <><Prose c={c} />{c.diagram && <Diagram spec={b.spec} copy={c.diagram} ui={ui} className="cs__wide" />}</>;
    case 'sequence':
      return <><Prose c={c} />{c.seq && <div className="cs__wide"><Sequence spec={b.spec} copy={c.seq} /></div>}</>;
    case 'flow':
      return <><Prose c={c} /><div className="cs__wide"><Flow id={b.key} steps={c.steps ?? []} title={c.title} caption={c.caption} loop={c.loop} cols={b.cols} /></div></>;
    case 'decisions':
      return (
        <><Prose c={c} />
          <ol className="adr">
            {(c.items as { t: string; why: string; alt?: string }[]).map((d, i) => (
              <Reveal as="li" key={d.t} className="adr__item">
                <p className="adr__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</p>
                <div>
                  <h3 className="adr__t">{d.t}</h3>
                  <p className="adr__why"><span className="label">{ui.why}</span> {d.why}</p>
                  {d.alt && <p className="adr__alt"><span className="label">{ui.alt}</span> {d.alt}</p>}
                </div>
              </Reveal>
            ))}
          </ol>
        </>
      );
    case 'checks':
      return (
        <><Prose c={c} />
          <ul className="checks">
            {(c.items as { t: string; d: string }[]).map((it, i) => (
              <Reveal as="li" key={it.t} className="checks__item">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="checks__icon" style={{ '--o': i } as CSSProperties}><path d="M12 2.8l7.5 3v5.6c0 4.6-3.1 8.1-7.5 9.8-4.4-1.7-7.5-5.2-7.5-9.8V5.8z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>
                <div><h3 className="checks__t">{it.t}</h3><p>{it.d}</p></div>
              </Reveal>
            ))}
          </ul>
        </>
      );
    case 'readouts':
      return <><Prose c={c} /><Readouts items={c.items as Readout[]} note={c.note} className="cs__wide" /></>;
    case 'split':
      return <><Prose c={c} /><div className="cs__wide"><MoneySplit copy={c as SplitCopy} /></div></>;
    case 'stack':
      return (
        <><Prose c={c} />
          <dl className="stackl">
            {c.groups?.map((g) => <div key={g.k}><dt className="label">{g.k}</dt><dd>{g.items.map((x) => <span key={x} className="chip">{x}</span>)}</dd></div>)}
          </dl>
        </>
      );
    case 'video':
      return (
        <><Prose c={c} />
          <figure className="case__video cs__wide">
            <video controls muted playsInline preload="metadata" poster={asset(b.poster)} aria-label={c.caption}>
              <source src={asset(b.src)} type="video/mp4" />
            </video>
            <figcaption className="note">{c.caption}</figcaption>
          </figure>
        </>
      );
    case 'gallery': {
      const items = (c.items ?? {}) as Record<string, { alt: string; caption: string }>;
      return (
        <><Prose c={c} />
          <div className="gallery cs__wide">
            {b.shots.map((id) => (
              <figure key={id} className="gallery__item">
                <img src={asset(`${b.dir}/${id}.webp`)} alt={items[id]?.alt ?? ''} width={1600} height={1000} loading="lazy" decoding="async" />
                <figcaption className="note">{items[id]?.caption}</figcaption>
              </figure>
            ))}
          </div>
        </>
      );
    }
  }
}
