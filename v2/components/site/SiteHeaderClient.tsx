'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CONTACT_PATH, pageOf, sitePath, type SitePageKey } from '@/v2/site';
import { ArrowIcon, CloseIcon, MailIcon, MenuIcon, Monogram } from '../ui/Icons';
import { LangSwitch } from '../ui/Nav';
import { SoundToggle } from '../ui/SoundToggle';

export type HeaderPage = { key: SitePageKey; path: string; label: string; line: string; color: string };
export type HeaderLabels = {
  nav: string; homeAria: string; contact: string; menu: string; close: string; dialog: string; lang: string;
  sound: string; soundOn: string; soundOff: string; elsewhere: string; newTab: string;
};

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const CLOSE_MS = 180;

/**
 * The site header (lote 2.1). At the top of a page it is a transparent bar; once the page moves it becomes a
 * floating glass pill (only opacity and transform change). A light rests under the current page and slides to
 * the link under the pointer. The header lives in the /v2 layout, so it survives every change of page and the
 * light travels from the old page to the new one. Below 1100 px the pages open in a full-screen <dialog>.
 */
export function SiteHeaderClient({ locale, base, pages, labels, mail, linkedin }: {
  locale: 'es' | 'en'; base: string; pages: HeaderPage[]; labels: HeaderLabels; mail: string; linkedin: string;
}) {
  const pathname = usePathname() ?? '';
  const current = pageOf(pathname);
  const here = pages.find((p) => p.key === current);
  const href = (path = '') => sitePath(locale, path);
  // the same page in the other language: a full load, so <html lang> changes with it
  const rest = pathname.replace(/^\/v2\/[a-z]{2}\/?/, '').replace(/\/?$/, '/').replace(/^\/$/, '');
  const langHrefs = { es: `${base}/v2/es/${rest}`, en: `${base}/v2/en/${rest}` };
  const other = locale === 'es' ? 'en' : 'es';

  /* bar → pill: a sentinel at the top of the page, no scroll listener. The attribute is written straight to the
     DOM: a change of state here would re-render the whole header on every flip (measured). */
  const sentinel = useRef<HTMLSpanElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => { if (header.current) header.current.dataset.stuck = String(!e.isIntersecting); });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* the light: under the current page, or under the link the pointer or the focus is on */
  const nav = useRef<HTMLElement>(null);
  const light = useRef<HTMLSpanElement>(null);
  const [over, setOver] = useState<SitePageKey | null>(null);
  const [ready, setReady] = useState(false);
  const target = over ?? current;
  const place = useCallback(() => {
    const el = light.current;
    const link = target && nav.current?.querySelector<HTMLElement>(`a[data-key="${target}"]`);
    if (!el) return;
    if (!link) { el.dataset.on = 'off'; return; }
    el.style.setProperty('--x', `${link.offsetLeft + link.offsetWidth / 2}px`);
    el.style.color = pages.find((p) => p.key === target)?.color ?? '';
    el.dataset.on = over && over !== current ? 'over' : 'on';
  }, [target, over, current, pages]);
  useIsoLayoutEffect(() => { place(); }, [place]);
  useEffect(() => {
    // the first position is set without a slide; after that every move is animated
    const id = requestAnimationFrame(() => setReady(true));
    const ro = 'ResizeObserver' in window && nav.current ? new ResizeObserver(() => place()) : null;
    if (ro && nav.current) ro.observe(nav.current);
    document.fonts?.ready.then(() => place()).catch(() => {});
    return () => { cancelAnimationFrame(id); ro?.disconnect(); };
  }, [place]);

  /* the phone menu: a modal <dialog> (focus stays inside, Escape closes, the page under it is inert) */
  const dialog = useRef<HTMLDialogElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const openMenu = () => {
    const d = dialog.current;
    if (!d || d.open) return;
    window.clearTimeout(timer.current);
    delete d.dataset.closing;
    // browsers from before <dialog> (Safari < 15.4) still get the menu, without the modal behaviour
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    closeBtn.current?.focus();
    document.documentElement.classList.add('sm-open');
    setOpen(true);
  };
  const closeMenu = useCallback((instant = false) => {
    const d = dialog.current;
    if (!d || !d.open) return;
    const finish = () => {
      delete d.dataset.closing;
      if (typeof d.close === 'function') { if (d.open) d.close(); } else { d.removeAttribute('open'); d.dispatchEvent(new Event('close')); }
    };
    window.clearTimeout(timer.current);
    if (instant || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
    d.dataset.closing = 'true';
    timer.current = window.setTimeout(finish, CLOSE_MS);
  }, []);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onCancel = (e: Event) => { e.preventDefault(); closeMenu(); };
    const onClose = () => { document.documentElement.classList.remove('sm-open'); setOpen(false); };
    d.addEventListener('cancel', onCancel);
    d.addEventListener('close', onClose);
    // the menu belongs to the narrow layout: if the window grows past it, it closes
    const wide = window.matchMedia('(min-width: 1100px)');
    const onWide = () => { if (wide.matches) closeMenu(true); };
    wide.addEventListener('change', onWide);
    return () => {
      d.removeEventListener('cancel', onCancel);
      d.removeEventListener('close', onClose);
      wide.removeEventListener('change', onWide);
      window.clearTimeout(timer.current);
      document.documentElement.classList.remove('sm-open');
    };
  }, [closeMenu]);
  // a new page closes the menu
  useEffect(() => { closeMenu(); }, [pathname, closeMenu]);

  const tools = (
    <>
      <SoundToggle label={labels.sound} on={labels.soundOn} off={labels.soundOff} />
      <LangSwitch label={labels.lang} current={locale} hrefs={langHrefs} />
      <a className="sh-lang1" href={langHrefs[other]} hrefLang={other} lang={other} aria-label={other === 'es' ? 'Español' : 'English'}>{other.toUpperCase()}</a>
    </>
  );

  return (
    <>
      <span ref={sentinel} className="sh-sentinel" aria-hidden="true" />
      <header ref={header} className="sh" data-stuck="false" data-ready={ready} suppressHydrationWarning>
        <div className="sh-bar">
          <span className="sh-glass" aria-hidden="true" />
          <div className="sh-left">
            <Link className="sh-home" href={href()} aria-label={labels.homeAria}><Monogram /></Link>
            {here && (
              <p className="sh-here" style={{ '--c': here.color } as CSSProperties}>
                <i aria-hidden="true" />
                <span>{here.label}</span>
              </p>
            )}
          </div>
          <nav ref={nav} className="sh-nav" aria-label={labels.nav} onPointerLeave={() => setOver(null)} onBlur={() => setOver(null)}>
            <span ref={light} className="sh-light" data-on="off" aria-hidden="true"><i /><b /></span>
            <ul>
              {pages.map((p) => (
                <li key={p.key}>
                  <Link
                    href={href(p.path)}
                    data-key={p.key}
                    aria-current={p.key === current ? 'page' : undefined}
                    style={{ '--c': p.color } as CSSProperties}
                    onPointerEnter={(e) => { if (e.pointerType === 'mouse') setOver(p.key); }}
                    onFocus={() => setOver(p.key)}
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="sh-tools">
            {tools}
            <Link className="ui-btn ui-btn--secondary ui-btn--sm sh-contact" href={href(CONTACT_PATH)}><span>{labels.contact}</span></Link>
            <button type="button" className="sh-menu" aria-haspopup="dialog" aria-expanded={open} onClick={openMenu}>
              <MenuIcon />
              <span>{labels.menu}</span>
            </button>
          </div>
        </div>
      </header>

      <dialog ref={dialog} className="sm" aria-label={labels.dialog}>
        <div className="sm-in">
          <div className="sm-top">
            <Link className="sh-home" href={href()} aria-label={labels.homeAria} onClick={() => closeMenu()}><Monogram /></Link>
            <div className="sh-tools">
              {tools}
              <button ref={closeBtn} type="button" className="sh-menu" aria-label={labels.close} onClick={() => closeMenu()}>
                <CloseIcon />
              </button>
            </div>
          </div>
          <nav aria-label={labels.nav}>
            <ol className="sm-list">
              {pages.map((p, i) => (
                <li key={p.key} style={{ '--c': p.color, '--i': i } as CSSProperties}>
                  <Link href={href(p.path)} aria-current={p.key === current ? 'page' : undefined} onClick={() => closeMenu()}>
                    <span className="sm-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <span className="sm-t">{p.label}</span>
                    <span className="sm-d">{p.line}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <div className="sm-foot" style={{ '--i': pages.length } as CSSProperties}>
            <Link className="ui-btn ui-btn--primary ui-btn--md" href={href(CONTACT_PATH)} onClick={() => closeMenu()}>
              <span>{labels.contact}</span>
              <ArrowIcon />
            </Link>
            <p className="sm-links">
              <span className="v2-label">{labels.elsewhere}</span>
              <a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<span className="ui-sr"> {labels.newTab}</span></a>
              <a href={`mailto:${mail}`}><MailIcon />{mail}</a>
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
