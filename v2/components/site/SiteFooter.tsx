import Link from 'next/link';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { SITE_PAGES, sitePath } from '@/v2/site';
import { ShortcutsButton } from '../motion/ShortcutsButton';
import { ArrowIcon } from '../ui/Icons';

/** Foot of the site pages: who, where, every page (also the way around without JavaScript) and the design system. */
export function SiteFooter({ locale }: { locale: V2Locale }) {
  const m = v2Messages(locale);
  return (
    <footer className="v2-foot sf">
      <span>{m.footer.name}</span>
      <span className="v2-dim">{m.footer.place}</span>
      <nav aria-label={m.site.footerNav}>
        <ul>
          {SITE_PAGES.map((p) => (
            <li key={p.key}><Link href={sitePath(locale, p.path)}>{m.site.pages[p.key].t}</Link></li>
          ))}
        </ul>
      </nav>
      <ShortcutsButton label={m.engine.help.button} />
      <Link className="sf-system" href={sitePath(locale, 'tokens/')}>{m.site.system}<ArrowIcon /></Link>
    </footer>
  );
}
