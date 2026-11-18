import type { CSSProperties } from 'react';
import Link from 'next/link';
import { asset } from '@/lib/site';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { SITE_PAGES, sitePath } from '@/v2/site';
import { LightField } from '../signature/LightField';
import { Stack } from '../signature/Stack';
import { Button } from '../ui/Button';
import { RoleBadge } from '../ui/Chip';
import { ArrowIcon, PlayIcon } from '../ui/Icons';
import type { GateVariant } from '@/v2/gate/state';
import { LAYERS } from '@/v2/tokens';
import { Gate } from '../gate/Gate';
import { STAMP_IDS, stampSvg } from '../kit/stamps';
import { SiteFooter } from './SiteFooter';

/**
 * The home of /v2 as it stands after lote 2.1: the opening of direction 4 and a door to every page.
 * The cinematic home (lote 3.2) replaces what is under the opening.
 */
export function Home({ locale, gate = 'monograma' }: { locale: V2Locale; gate?: GateVariant }) {
  const m = v2Messages(locale);
  const s = m.site;
  const doors = SITE_PAGES.filter((p) => p.key !== 'home');
  // the surname takes the colours of gradient-name, one letter at a time
  const tint = (t: number) => {
    const stops: [number, number[]][] = [[0.1, [255, 90, 60]], [0.7, [255, 95, 162]], [1, [199, 155, 255]]];
    const k = Math.max(0, stops.findIndex(([at]) => t <= at));
    const [a0, c0] = stops[Math.max(0, k - 1)], [a1, c1] = stops[k];
    const f = a1 === a0 ? 0 : Math.min(1, Math.max(0, (t - a0) / (a1 - a0)));
    return `rgb(${c0.map((v, i) => Math.round(v + (c1[i] - v) * f)).join(', ')})`;
  };
  const lastName = [...m.hero.last];
  return (
    <>
      <Gate
        variant={gate}
        // what each version hangs on its object: the five layers, the stages of the roadmap, the stops so far
        tags={gate === 'codigo' ? LAYERS.map((id) => ({ t: m.layers[id] }))
          : gate === 'ascenso' ? [...m.gate.stages.map((st) => ({ k: st.year, t: st.name })), { k: m.gate.arrival, t: '' }]
            : gate === 'postal' ? STAMP_IDS.map((id) => ({ k: m.kit.stamps.items[id].year, t: m.kit.stamps.items[id].name })) : []}
        tagsLabel={gate === 'monograma' ? undefined : m.gate.tags[gate]}
        // only the version that shows them carries the stamps
        stamps={gate === 'postal' ? STAMP_IDS.map((id) => stampSvg(id)) : undefined}
        first={[...m.hero.first].map((ch) => ({ ch }))}
        last={lastName.map((ch, i) => ({ ch, color: tint(lastName.length > 1 ? i / (lastName.length - 1) : 0) }))}
        labels={{
          label: m.gate.label, meet: m.gate.meet, enter: m.gate.enter, loading: m.gate.loading, ready: m.gate.ready, progress: m.gate.progress, key: m.gate.key,
          level: m.hero.level, role: m.hero.role, edition: m.gate.edition, place: m.footer.place, steps: m.gate.steps,
        }}
        trailerHref={asset(`/trailer/v2/index.html?lang=${locale}`)}
      />
      <main id="main" className="v2-main" tabIndex={-1}>
        <section className="v2-hero" aria-labelledby="v2-name">
          <LightField className="v2-hero-light">
            <div className="v2-hero-grid">
              <div className="v2-hero-text">
                <RoleBadge level={m.hero.level} role={m.hero.role} />
                <h1 id="v2-name" className="v2-name">{m.hero.first}<br /><span className="v2-last">{m.hero.last}</span></h1>
                <p className="v2-lead">{m.hero.leadBefore} <span className="v2-solutions">{m.hero.leadWord}</span> {m.hero.leadAfter}</p>
                <div className="v2-actions">
                  <Button href={asset(`/trailer/v2/index.html?lang=${locale}`)} iconStart={<PlayIcon />} magnetic={10}>{m.hero.meet}</Button>
                  <Button href="#explorar" variant="secondary" iconEnd={<ArrowIcon />} magnetic={8}>{m.hero.explore}</Button>
                </div>
              </div>
              <Stack locale={locale} />
            </div>
          </LightField>
        </section>

        <section className="v2-sec st-doors" id="explorar" aria-labelledby="explorar-h">
          <h2 id="explorar-h" data-reveal>{s.explore}</h2>
          <ul>
            {doors.map((p, i) => (
              <li key={p.key} data-reveal>
                <article className="ui-card" style={{ '--from': p.from, '--to': p.to } as CSSProperties} data-cursor={s.more}>
                  <p className="ui-card-meta" aria-hidden="true">{String(i + 2).padStart(2, '0')}</p>
                  <h3 className="ui-card-title"><Link href={sitePath(locale, p.path)}>{s.pages[p.key].t}</Link></h3>
                  <div className="ui-card-body"><p>{s.pages[p.key].d}</p></div>
                  <p className="ui-card-cta" aria-hidden="true">{s.more}<ArrowIcon /></p>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
