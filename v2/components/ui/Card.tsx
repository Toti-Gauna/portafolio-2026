import type { CSSProperties, ReactNode } from 'react';
import { tokens, type LayerId } from '@/v2/tokens';
import { StatusBadge, type StatusKey } from './Status';
import { ArrowIcon } from './Icons';

const from = (id: LayerId) => tokens.layer[`${id}-from` as keyof typeof tokens.layer];
const to = (id: LayerId) => tokens.layer[`${id}-to` as keyof typeof tokens.layer];
const layerVars = (id: LayerId) => ({ '--from': from(id), '--to': to(id) }) as CSSProperties;

/**
 * A glass card that is one link: the title's <a> stretches over the card (::after), so the card has a single,
 * clear accessible name and one tab stop. Meta, status and text stay readable and selectable.
 */
export function GlassCard({ layer, title, href, meta, status, statusLabel, cta, headingLevel = 3, children }: {
  layer: LayerId; title: string; href: string; meta?: string; status?: StatusKey; statusLabel?: string; cta: string; headingLevel?: 2 | 3 | 4; children?: ReactNode;
}) {
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <article className="ui-card" style={layerVars(layer)}>
      <span className="ui-card-bar" aria-hidden="true" />
      <div className="ui-card-top">
        {meta && <p className="ui-card-meta">{meta}</p>}
        {status && statusLabel && <StatusBadge status={status} label={statusLabel} />}
      </div>
      <H className="ui-card-title"><a href={href}>{title}</a></H>
      {children && <div className="ui-card-body">{children}</div>}
      <p className="ui-card-cta" aria-hidden="true">{cta}<ArrowIcon /></p>
    </article>
  );
}

/** Glass container to group content; not interactive. */
export function Panel({ children, layer, className }: { children: ReactNode; layer?: LayerId; className?: string }) {
  return <div className={['ui-panel', className].filter(Boolean).join(' ')} style={layer ? layerVars(layer) : undefined}>{children}</div>;
}

/** A figure with its label. The counting animation arrives with the signature pieces (lote 1.4). */
export function Stat({ value, label, layer }: { value: string; label: string; layer?: LayerId }) {
  return (
    <p className="ui-stat" style={layer ? layerVars(layer) : undefined}>
      <b>{value}</b>
      <span>{label}</span>
    </p>
  );
}

/** Kicker number, heading and lead of a section. */
export function SectionHeading({ id, n, title, text, level = 2 }: { id: string; n?: string; title: string; text?: string; level?: 2 | 3 }) {
  const H = `h${level}` as 'h2' | 'h3';
  return (
    <header className="ui-heading">
      {n && <p className="ui-heading-n" aria-hidden="true">{n}</p>}
      <H id={id} className={`ui-heading-title ui-heading-title--${level}`}>{title}</H>
      {text && <p className="ui-heading-text">{text}</p>}
    </header>
  );
}
