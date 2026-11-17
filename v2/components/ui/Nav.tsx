import type { CSSProperties, ReactNode } from 'react';
import { ArrowIcon, ArrowLeftIcon, ChevronIcon } from './Icons';

export type NavItem = { href: string; label: string; color: string; current?: boolean };

/** Section tabs, each with its colour; the current one is marked with aria-current and a top light. */
export function NavTabs({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <nav className="ui-tabs" aria-label={label}>
      <ul>
        {items.map((it) => (
          <li key={it.href}>
            <a href={it.href} aria-current={it.current ? 'page' : undefined} style={{ '--tab': it.color } as CSSProperties}>
              <i aria-hidden="true" />
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** ES / EN as two links to the same page in each language. */
export function LangSwitch({ label, current, hrefs }: { label: string; current: 'es' | 'en'; hrefs: Record<'es' | 'en', string> }) {
  return (
    <nav className="ui-lang" aria-label={label}>
      {(['es', 'en'] as const).map((l) => (
        <a key={l} href={hrefs[l]} hrefLang={l} lang={l} aria-current={l === current ? 'page' : undefined} aria-label={l === 'es' ? 'Español' : 'English'}>
          {l.toUpperCase()}
        </a>
      ))}
    </nav>
  );
}

export function Breadcrumbs({ label, items }: { label: string; items: { href?: string; label: string }[] }) {
  return (
    <nav className="ui-crumbs" aria-label={label}>
      <ol>
        {items.map((it, i) => (
          <li key={i}>
            {it.href ? <a href={it.href}>{it.label}</a> : <span aria-current="page">{it.label}</span>}
            {i < items.length - 1 && <ChevronIcon size={12} />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Previous and next, as two large links (case to case). */
export function Pager({ label, prev, next }: { label: string; prev?: { href: string; kicker: string; title: string }; next?: { href: string; kicker: string; title: string } }) {
  return (
    <nav className="ui-pager" aria-label={label}>
      {prev ? (
        <a href={prev.href} rel="prev" className="ui-pager-prev">
          <span className="ui-pager-kicker"><ArrowLeftIcon size={14} />{prev.kicker}</span>
          <span className="ui-pager-title">{prev.title}</span>
        </a>
      ) : <span />}
      {next && (
        <a href={next.href} rel="next" className="ui-pager-next">
          <span className="ui-pager-kicker">{next.kicker}<ArrowIcon size={14} /></span>
          <span className="ui-pager-title">{next.title}</span>
        </a>
      )}
    </nav>
  );
}

/** Inline link with an arrow that moves on hover. */
export function LinkArrow({ href, children }: { href: string; children: ReactNode }) {
  return <a className="ui-linkarrow" href={href}>{children}<ArrowIcon size={14} /></a>;
}

/** Text that unfolds (native <details>: Enter and Space work, state is announced). */
export function Disclosure({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="ui-disclosure">
      <summary><ChevronIcon size={14} />{summary}</summary>
      <div className="ui-disclosure-body">{children}</div>
    </details>
  );
}
