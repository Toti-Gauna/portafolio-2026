'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { LocaleSwitch } from './LocaleSwitch';
import { Monogram } from './Monogram';
import './header.css';

export type NavItem = { key: string; href: string; label: string; desc: string };
type Strings = { nav: string; menu: string; close: string; dialog: string; contact: string; elsewhere: string; language: string; newTab: string; home: string };

const norm = (p: string) => p.replace(/[?#].*$/, '').replace(/\/+$/, '') || '/';
const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * The site navigation (strings come as props: the `nav` namespace stays on the server).
 * ≥ 1100 px: the page links, the language switch and «Contacto» in the header row.
 * Below: a «Menú» button that opens a full-screen menu (a modal dialog): focus moves in and stays there, Escape or
 * the close button close it and focus returns to the button; the page under it is inert and pinned (iOS ignores
 * overflow:hidden on <html> for touch scrolling, so the body is fixed in place, as in Intro.tsx). Motion: opacity
 * and transform only; instant with reduced motion (globals.css).
 */
export function SiteNav({ items, locale, locales, contactHref, email, linkedin, s }: {
  items: NavItem[]; locale: Locale; locales: readonly Locale[]; contactHref: string; email: string; linkedin: string; s: Strings;
}) {
  const pathname = norm(usePathname() ?? '/');
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  // a link in the menu leads to another page: don't scroll the old one back into place on the way out
  const leaving = useRef(false);
  const isCurrent = (href: string) => norm(href) === pathname;
  // a case page sits under «Trabajo» (the agentic system's case under «Cómo trabajo»): marked as the current section
  const section = pathname.startsWith('/proyectos/') ? (pathname === '/proyectos/agentes' ? '/como-trabajo' : '/trabajo') : null;
  const current = (href: string) => (isCurrent(href) ? 'page' : href === section ? 'true' : undefined);

  useEffect(() => setOpen(false), [pathname]);

  // the menu does not exist on wide screens: growing past 1100 px closes it
  useEffect(() => {
    const wide = matchMedia('(min-width: 1100px)');
    const onWide = () => wide.matches && setOpen(false);
    wide.addEventListener('change', onWide);
    return () => wide.removeEventListener('change', onWide);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement, body = document.body;
    const header = toggle.current?.closest('.site-header');
    const shell = document.getElementById('app-shell');
    const y = window.scrollY;
    root.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${y}px`;
    body.style.width = '100%';
    header?.setAttribute('data-open', '');
    const others = shell ? Array.from(shell.children).filter((c) => c !== header && !c.hasAttribute('inert')) : [];
    others.forEach((c) => c.setAttribute('inert', ''));
    const start = panel.current?.querySelector<HTMLElement>('[aria-current="page"]') ?? panel.current?.querySelector<HTMLElement>('.menu__link');
    start?.focus({ preventScroll: true });
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    const btn = toggle.current;
    return () => {
      window.removeEventListener('keydown', onKey);
      others.forEach((c) => c.removeAttribute('inert'));
      header?.removeAttribute('data-open');
      root.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      if (!leaving.current) window.scrollTo(0, y);
      leaving.current = false;
      btn?.focus({ preventScroll: true });
    };
  }, [open]);

  // keep Tab inside the dialog
  const trap = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panel.current) return;
    const f = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const go = (href: string) => () => {
    leaving.current = !isCurrent(href);
    setOpen(false);
  };

  return (
    <div className="site-nav">
      <nav aria-label={s.nav} className="site-nav__links">
        {items.slice(1).map((it) => (
          <Link key={it.key} href={it.href} aria-current={current(it.href)}>{it.label}</Link>
        ))}
      </nav>
      <div className="site-nav__end">
        <LocaleSwitch current={locale} locales={locales} label={s.language} />
        <Link className="btn btn-ghost site-nav__contact" href={contactHref}>{s.contact}</Link>
      </div>
      <button ref={toggle} type="button" className="menu-toggle" aria-expanded={open} aria-controls="site-menu" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <span>{s.menu}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16" /><path d="M4 15h11" /></svg>
      </button>

      <div id="site-menu" ref={panel} className="menu" role="dialog" aria-modal="true" aria-label={s.dialog} data-open={open || undefined} onKeyDown={trap}>
        <div className="container-x menu__bar">
          <Link href="/" className="site-header__brand" aria-label={s.home} onClick={go('/')}>
            <Monogram className="site-header__mark" />
          </Link>
          <button type="button" className="menu-toggle menu-toggle--close" onClick={() => setOpen(false)} aria-label={s.close}>
            <span aria-hidden="true">{s.menu}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12" /><path d="M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="menu__scroll">
          <div className="container-x menu__grid">
            <nav aria-label={s.nav} className="menu__nav">
              <ol className="menu__list">
                {items.map((it, i) => (
                  <li key={it.key} className="menu__item" style={{ '--i': i } as CSSProperties}>
                    <Link href={it.href} className="menu__link" aria-current={current(it.href)} onClick={go(it.href)}>
                      <span className="menu__n" aria-hidden="true">{String(i).padStart(2, '0')}</span>
                      <span className="menu__t">{it.label}</span>
                      <span className="menu__d">{it.desc}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="menu__foot" style={{ '--i': items.length } as CSSProperties}>
              <LocaleSwitch current={locale} locales={locales} label={s.language} onNavigate={(l) => { leaving.current = l !== locale; setOpen(false); }} />
              <p className="label menu__also">{s.elsewhere}</p>
              <a className="menu__ext" href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗<span className="sr-only"> ({s.newTab})</span></a>
              <a className="menu__ext" href={`mailto:${email}`}>{email}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
