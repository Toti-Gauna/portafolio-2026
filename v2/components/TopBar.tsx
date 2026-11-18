import { BASE_PATH } from '@/lib/site';
import { tokens } from '@/v2/tokens';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { NavTabs } from './ui/Nav';

/** The pages of the design system; each tab carries the colour of its layer. */
const PAGES = [
  { key: 'tokens', path: 'tokens/', color: tokens.layer['plan-from'] },
  { key: 'components', path: 'componentes/', color: tokens.layer['code-from'] },
  { key: 'pieces', path: 'piezas/', color: tokens.layer['agents-from'] },
  { key: 'kit', path: 'kit/', color: tokens.layer['tests-from'] },
  { key: 'motion', path: 'motion/', color: tokens.layer['ship-from'] },
  { key: 'sound', path: 'sonido/', color: tokens.color['lilac-400'] },
  { key: 'gate', path: 'puerta/', color: tokens.color['coral-500'] },
] as const;
export type SystemPage = (typeof PAGES)[number]['key'];

/** The tabs of the design system pages, under the site header (which has the sound and the language). */
export function TopBar({ locale, page }: { locale: V2Locale; page: SystemPage }) {
  const m = v2Messages(locale);
  const href = (p: string) => `${BASE_PATH}/v2/${locale}/${p}`;
  return (
    <div className="v2-sys">
      <p className="v2-sys-brand">{m.top.brand}</p>
      <NavTabs
        label={m.nav.label}
        items={PAGES.map((p) => ({ href: href(p.path), label: m.nav[p.key], color: p.color, current: p.key === page }))}
      />
    </div>
  );
}
