import type { CSSProperties, ReactNode } from 'react';
import { tokens } from '@/v2/tokens';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { barDegree, chordName, ZONES, type ZoneKey } from '@/v2/sound/compose';
import { SITE_PAGES } from '@/v2/site';
import { MusicLab } from './sound/MusicLab';
import { TopBar } from './TopBar';
import { SectionHeading } from './ui/Card';
import { SiteFooter } from './site/SiteFooter';

/** Lote 2.3: the three proposals of generative music, to listen to and choose. */

function Block({ id, n, title, text, children }: { id: string; n: string; title: string; text: string; children: ReactNode }) {
  return (
    <section className="v2-sec" id={id} aria-labelledby={`${id}-h`}>
      <SectionHeading id={`${id}-h`} n={n} title={title} text={text} />
      {children}
    </section>
  );
}

export function MusicPage({ locale }: { locale: V2Locale }) {
  const m = v2Messages(locale);
  const t = m.music;
  const zones: { key: ZoneKey; name: string; color: string }[] = [
    ...SITE_PAGES.map((p) => ({ key: p.key as ZoneKey, name: m.site.pages[p.key].t, color: p.from as string })),
    { key: 'system', name: t.zones.system, color: tokens.color['mist-300'] },
  ];
  const L = tokens.layer;
  return (
    <>
      <TopBar locale={locale} page="sound" />
      <main id="main" className="v2-main">
        <div className="v2-intro">
          <p className="v2-label">{t.intro.kicker}</p>
          <h1 className="cat-title">{t.intro.title}</h1>
          <p className="v2-sec-text">{t.intro.text}</p>
        </div>

        <section className="v2-sec" aria-label={t.intro.title}>
          <MusicLab
            labels={{ letter: t.letter, play: t.play, stop: t.stop, pick: t.pick, picked: t.picked, zone: t.zone, chord: t.chord, bar: t.bar, bpm: t.bpm, styles: t.styles }}
            zones={zones.map(({ key, name }) => ({ key, name }))}
            colors={{ marea: L['ship-from'], circuito: L['tests-from'], taller: L['plan-from'] }}
          />
        </section>

        <Block id="motivos" n="01" title={t.zones.title} text={t.zones.text}>
          <ul className="mu-table">
            {zones.map((z) => {
              const zone = ZONES[z.key];
              return (
                <li key={z.key} style={{ '--c': z.color } as CSSProperties} data-reveal>
                  <span className="mu-table-name"><i aria-hidden="true" />{z.name}</span>
                  <span className="mu-table-key">{t.zones.keys[z.key]}</span>
                  <span className="mu-table-prog">{zone.prog.map((_, i) => chordName(zone, barDegree(zone, i))).join(' · ')}</span>
                </li>
              );
            })}
          </ul>
        </Block>

        <Block id="reglas" n="02" title={t.rules.title} text={t.intro.text}>
          <ul className="mo-rules">{t.rules.items.map((r) => <li key={r} data-reveal>{r}</li>)}</ul>
        </Block>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
