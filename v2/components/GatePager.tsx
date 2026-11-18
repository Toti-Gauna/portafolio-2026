import { BASE_PATH } from '@/lib/site';
import { GATE_VARIANTS, type GateVariant } from '@/v2/gate/state';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { ArrowIcon } from './ui/Icons';

/**
 * On the preview of a gate (/puerta/<version>/): once the visitor is through it, a bar at the foot of the screen
 * goes to the previous one, plays this one again, goes to the next, or back to the list — to see them one by
 * one. Under an open gate it is covered and inert like the rest of the page. Full loads: a gate is decided
 * before the first paint of its page.
 */
export function GatePager({ locale, variant }: { locale: V2Locale; variant: GateVariant }) {
  const g = v2Messages(locale).gate.choose;
  const i = GATE_VARIANTS.indexOf(variant), n = GATE_VARIANTS.length;
  const prev = GATE_VARIANTS[(i + n - 1) % n], next = GATE_VARIANTS[(i + 1) % n];
  const href = (id?: GateVariant) => `${BASE_PATH}/v2/${locale}/puerta/${id ? `${id}/` : ''}`;
  return (
    <nav className="gl-pager" aria-label={g.pager.label}>
      <p><b>{i + 1} / {n}</b><span>{g.items[variant].name}</span></p>
      <ul>
        <li><a href={href(prev)} hrefLang={locale} className="gl-pager-prev"><ArrowIcon /><span>{g.pager.prev}</span><span className="ui-sr">: {g.items[prev].name}</span></a></li>
        <li><a href={href(variant)} hrefLang={locale}>{g.pager.again}</a></li>
        <li><a href={href()} hrefLang={locale}>{g.pager.all}</a></li>
        <li><a href={href(next)} hrefLang={locale} className="gl-pager-next"><span>{g.pager.next}</span><span className="ui-sr">: {g.items[next].name}</span><ArrowIcon /></a></li>
      </ul>
    </nav>
  );
}
