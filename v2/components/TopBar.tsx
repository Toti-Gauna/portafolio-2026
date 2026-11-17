import { BASE_PATH } from '@/lib/site';
import { tokens } from '@/v2/tokens';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { Monogram } from './ui/Icons';
import { LangSwitch, NavTabs } from './ui/Nav';
import { SoundToggle } from './ui/SoundToggle';

/** The pages of the system so far; each tab carries the colour of its layer. */
const PAGES = [
  { key: 'tokens', path: '', color: tokens.layer['plan-from'] },
  { key: 'components', path: 'componentes/', color: tokens.layer['code-from'] },
] as const;
export type SystemPage = (typeof PAGES)[number]['key'];

/** Top bar of the /v2 system pages (the site header proper is lote 2.1). */
export function TopBar({ locale, page }: { locale: V2Locale; page: SystemPage }) {
  const m = v2Messages(locale);
  const path = PAGES.find((p) => p.key === page)!.path;
  const href = (l: V2Locale, p = path) => `${BASE_PATH}/v2/${l}/${p}`;
  return (
    <>
      <a className="v2-skip" href="#main">{m.top.skip}</a>
      <header className="v2-top">
        <a className="v2-brand" href={href(locale, '')}>
          <Monogram />
          <span>{m.top.brand}</span>
        </a>
        <NavTabs
          label={m.nav.label}
          items={PAGES.map((p) => ({ href: href(locale, p.path), label: m.nav[p.key], color: p.color, current: p.key === page }))}
        />
        <div className="v2-top-tools">
          <SoundToggle label={m.ui.sound.label} on={m.ui.sound.on} off={m.ui.sound.off} />
          <LangSwitch label={m.top.lang} current={locale} hrefs={{ es: href('es'), en: href('en') }} />
        </div>
      </header>
    </>
  );
}
