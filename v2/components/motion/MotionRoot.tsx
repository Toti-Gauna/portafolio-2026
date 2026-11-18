'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cameraMove, samePath } from '@/v2/motion/camera';
import { installCursor } from '@/v2/motion/cursor';
import { reducedMotion } from '@/v2/motion/env';
import { OPEN_SHORTCUTS, REPLAY_REVEAL } from '@/v2/motion/events';
import { installMagnetic } from '@/v2/motion/magnetic';
import { installReveal } from '@/v2/motion/reveal';
import { installScroll } from '@/v2/motion/scroll';
import { commandFor, keysEnabled, setKeysEnabled } from '@/v2/motion/shortcuts';
import { pageOf, SITE_PAGES, sitePath } from '@/v2/site';
import { ShortcutsDialog, type ShortcutsLabels } from './ShortcutsDialog';


type Labels = ShortcutsLabels & { soundOn: string; soundOff: string };

/**
 * The motion and interaction engine of /v2 (lote 2.2), mounted once in the layout next to the header.
 * It installs the five pieces of v2/motion and runs the page transitions and the keyboard shortcuts.
 * Nothing loops: every animation frame is asked for by an input (pointer, scroll, a key, a click) and the
 * loops stop once things are at rest.
 */
export function MotionRoot({ locale, base, labels }: { locale: 'es' | 'en'; base: string; labels: Labels }) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const engine = useRef<{ reveal: ReturnType<typeof installReveal>; scroll: ReturnType<typeof installScroll> } | null>(null);
  const pending = useRef<{ path: string; done: () => void } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [keysOn, setKeysOn] = useState(true);
  const [say, setSay] = useState('');

  /* install once */
  useEffect(() => {
    const html = document.documentElement;
    if ('startViewTransition' in document) html.classList.add('v2-vt');
    const reveal = installReveal();
    const scroll = installScroll();
    const magnetic = installMagnetic();
    const cursor = installCursor();
    engine.current = { reveal, scroll };
    setKeysOn(keysEnabled());
    const onReplay = (e: Event) => reveal.replay(e.target as Element);
    const onOpen = () => setHelpOpen(true);
    // the browser's back and forward buttons: no camera, a short fade of the new page
    const onPop = () => { html.dataset.nav = 'fade'; };
    document.addEventListener(REPLAY_REVEAL, onReplay);
    window.addEventListener(OPEN_SHORTCUTS, onOpen);
    window.addEventListener('popstate', onPop);
    return () => {
      reveal.destroy(); scroll.destroy(); magnetic.destroy(); cursor.destroy();
      document.removeEventListener(REPLAY_REVEAL, onReplay);
      window.removeEventListener(OPEN_SHORTCUTS, onOpen);
      window.removeEventListener('popstate', onPop);
      engine.current = null;
    };
  }, []);

  /* a new page: find what it reveals and scrolls, and finish a pending camera move */
  useEffect(() => {
    engine.current?.reveal.scan();
    engine.current?.scroll.scan();
    if (pending.current && samePath(base + pathname, pending.current.path)) {
      const { done } = pending.current;
      pending.current = null;
      done();
    }
  }, [pathname, base]);

  /** Goes to a /v2 page; with View Transitions the camera moves from the old page to the new one. */
  const go = useCallback((url: URL) => {
    const html = document.documentElement;
    const href = url.pathname.slice(base.length) + url.search + url.hash;
    const doc = document as Document & { startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void> } };
    if (!doc.startViewTransition || reducedMotion()) {
      html.dataset.nav = 'fade';
      router.push(href);
      return;
    }
    const index = (p: string) => { const k = pageOf(p.slice(base.length)); return k ? SITE_PAGES.findIndex((s) => s.key === k) : -1; };
    html.dataset.nav = 'camera';
    html.dataset.vt = cameraMove(index(location.pathname), index(url.pathname));
    const t = doc.startViewTransition(() => new Promise<void>((resolve) => {
      pending.current = { path: url.pathname, done: resolve };
      router.push(href);
      window.setTimeout(resolve, 2500); // a slow network never freezes the screen
    }));
    t.finished.finally(() => { delete html.dataset.vt; });
  }, [base, router]);

  /* links: every click on a /v2 page link goes through the camera */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download') || a.hasAttribute('hreflang')) return;
      if (a.closest('dialog')) { document.documentElement.dataset.nav = 'fade'; return; } // the menu closes itself
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !url.pathname.startsWith(`${base}/v2/`)) return;
      if (samePath(url.pathname, location.pathname)) return; // an anchor on this page
      e.preventDefault();
      go(url);
    };
    document.addEventListener('click', onClick, true); // before next/link, which then sees the event handled
    return () => document.removeEventListener('click', onClick, true);
  }, [base, go]);

  /* keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // the saved choice is read on every key: right after a reload the state may not have caught up yet
      if (!keysEnabled() || helpOpen || document.querySelector('dialog[open]') || document.documentElement.dataset.gate === 'on') return;
      const cmd = commandFor(e, e.target as Element, SITE_PAGES.length);
      if (!cmd) return;
      e.preventDefault();
      if (cmd.type === 'help') setHelpOpen(true);
      else if (cmd.type === 'page') {
        const url = new URL(base + sitePath(locale, SITE_PAGES[cmd.index].path), location.href);
        if (!samePath(url.pathname, location.pathname)) go(url);
      } else if (cmd.type === 'top') {
        window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
        document.querySelector<HTMLElement>('.sh-home')?.focus({ preventScroll: true });
      } else if (cmd.type === 'sound') {
        document.querySelector<HTMLButtonElement>('.sh-bar .ui-sound')?.click();
      } else if (cmd.type === 'lang') {
        const other = document.querySelector<HTMLAnchorElement>('.sh-bar .ui-lang a:not([aria-current]), .sh-bar .sh-lang1');
        if (other) window.location.assign(other.href);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [helpOpen, base, locale, go]);

  /* what a screen reader hears when a shortcut changes something it cannot see */
  useEffect(() => {
    const onSound = (e: Event) => setSay((e as CustomEvent<{ on: boolean }>).detail?.on ? labels.soundOn : labels.soundOff);
    window.addEventListener('ig:v2:sound', onSound);
    return () => window.removeEventListener('ig:v2:sound', onSound);
  }, [labels.soundOn, labels.soundOff]);

  return (
    <>
      <p className="ui-sr" aria-live="polite">{say}</p>
      <ShortcutsDialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        keysOn={keysOn}
        onKeys={(on) => { setKeysOn(on); setKeysEnabled(on); }}
        labels={labels}
      />
    </>
  );
}
