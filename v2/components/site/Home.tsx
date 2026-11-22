import { asset } from '@/lib/site';
import { trailerHref } from '../video/films';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { LightField } from '../signature/LightField';
import { Stack } from '../signature/Stack';
import { Button } from '../ui/Button';
import { RoleBadge } from '../ui/Chip';
import { ArrowIcon, PlayIcon } from '../ui/Icons';
import type { GateVariant } from '@/v2/gate/state';
import { LAYERS } from '@/v2/tokens';
import { Gate } from '../gate/Gate';
import { GateKinetic } from '../gate/GateKinetic';
import { STAMP_IDS, stampSvg } from '../kit/stamps';
import { HomeCases, HomeContact, HomeDoors, HomeStats, HomeWhat } from '../home/sections';
import { JumpText } from '../ui/JumpText';
import { SiteFooter } from './SiteFooter';

/**
 * The home of /v2 (lote 3.2): the opening of direction 4 —role, name, one line, two actions, the live stack and
 * three figures— and four stretches of flat colour in the language of the gate: what I do, the featured cases,
 * a door to every page, and the contact. Role, best case and contact in under thirty seconds.
 */
export function Home({ locale, gate = 'cinetica' }: { locale: V2Locale; gate?: GateVariant }) {
  const m = v2Messages(locale);
  // the surname takes the colours of gradient-name, one letter at a time
  const tint = (t: number) => {
    const stops: [number, number[]][] = [[0.1, [255, 90, 60]], [0.7, [255, 95, 162]], [1, [199, 155, 255]]];
    const k = Math.max(0, stops.findIndex(([at]) => t <= at));
    const [a0, c0] = stops[Math.max(0, k - 1)], [a1, c1] = stops[k];
    const f = a1 === a0 ? 0 : Math.min(1, Math.max(0, (t - a0) / (a1 - a0)));
    return `rgb(${c0.map((v, i) => Math.round(v + (c1[i] - v) * f)).join(', ')})`;
  };
  const lastName = [...m.hero.last];
  const trailer = asset(trailerHref(locale));
  const labels = {
    label: m.gate.label, meet: m.gate.meet, enter: m.gate.enter, loading: m.gate.loading, ready: m.gate.ready, progress: m.gate.progress, key: m.gate.key,
    level: m.hero.level, role: m.hero.role, edition: m.gate.edition, place: m.footer.place, steps: m.gate.steps,
  };
  return (
    <>
      {gate === 'cinetica' ? (
        <GateKinetic
          first={m.hero.first} last={m.hero.last} trailerHref={trailer}
          labels={{ ...labels, tint: m.gate.tint }}
        />
      ) : (
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
        labels={labels}
        trailerHref={trailer}
      />
      )}
      <main id="main" className="v2-main hm" tabIndex={-1}>
        <section className="v2-hero" aria-labelledby="v2-name">
          <LightField className="v2-hero-light">
            <div className="v2-hero-grid">
              <div className="v2-hero-text">
                <RoleBadge level={m.hero.level} role={m.hero.role} />
                <h1 id="v2-name" className="v2-name"><JumpText text={m.hero.first} /><br /><JumpText text={m.hero.last} from={m.hero.first.length} tint={tint} /></h1>
                <p className="v2-lead">{m.hero.leadBefore} <span className="v2-solutions">{m.hero.leadWord}</span> {m.hero.leadAfter}</p>
                <div className="v2-actions">
                  <Button href={trailer} iconStart={<PlayIcon />} magnetic={10}>{m.hero.meet}</Button>
                  <Button href="#explorar" variant="secondary" iconEnd={<ArrowIcon />} magnetic={8}>{m.hero.explore}</Button>
                </div>
                <HomeStats locale={locale} />
              </div>
              <Stack locale={locale} />
            </div>
          </LightField>
        </section>

        <HomeWhat locale={locale} />
        <HomeCases locale={locale} />
        <HomeDoors locale={locale} />
        <HomeContact locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
