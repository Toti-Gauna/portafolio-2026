'use client';

import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

export function LocaleSwitch({ current, locales, label }: { current: Locale; locales: readonly Locale[]; label: string }) {
  const pathname = usePathname();
  return (
    <div role="group" aria-label={label} className="locale-switch">
      {locales.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          lang={l}
          hrefLang={l}
          aria-current={l === current ? 'true' : undefined}
          onClick={() => {
            try { localStorage.setItem('ig:locale', l); } catch {}
          }}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
