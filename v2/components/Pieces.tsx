import type { ReactNode } from 'react';
import { BASE_PATH } from '@/lib/site';
import { tokens } from '@/v2/tokens';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { TopBar } from './TopBar';
import { SectionHeading } from './ui/Card';
import { Chip } from './ui/Chip';
import { ArrowIcon, CheckIcon } from './ui/Icons';
import { StatusBadge } from './ui/Status';
import { ChapterPlayer } from './signature/ChapterPlayer';
import { CountersDemo, VerbsDemo } from './signature/Demos';
import { LightField } from './signature/LightField';
import { Stack } from './signature/Stack';
import { stackArt } from './signature/stack-art';
import { TiltPanel } from './signature/TiltPanel';

/** Lote 1.4: the signature pieces, each one live, for Ignacio to approve one by one. */

const L = tokens.layer;
const TECH = ['TypeScript', 'React', 'Next.js', 'Node.js', 'RAG', 'Playwright', 'CI/CD', 'SQL'];

function Block({ id, n, title, text, children }: { id: string; n: string; title: string; text: string; children: ReactNode }) {
  return (
    <section className="v2-sec" id={id} aria-labelledby={`${id}-h`}>
      <SectionHeading id={`${id}-h`} n={n} title={title} text={text} />
      {children}
    </section>
  );
}

export function Pieces({ locale }: { locale: V2Locale }) {
  const m = v2Messages(locale);
  const p = m.pieces;
  const art = stackArt();
  // the player shows one layer per chapter; its ids get a prefix so they never clash with the stack's
  const chapters = art.layers.map((l) => ({
    id: l.id, title: m.layers[l.id], verb: p.player.verbs[l.id], from: l.from, to: l.to, crop: l.crop,
    art: l.svg.replaceAll('id="', 'id="p-').replaceAll('url(#', 'url(#p-'),
  }));
  const verbs = p.verbs.items.map((text, i) => {
    const id = (['plan', 'code', 'ship'] as const)[i];
    return { text, from: L[`${id}-from`], to: L[`${id}-to`] };
  });
  const c = p.counter.items;
  return (
    <>
      <TopBar locale={locale} page="pieces" />
      <main id="main" className="v2-main">
        <div className="v2-intro">
          <p className="v2-label">{p.intro.kicker}</p>
          <h1 className="cat-title">{p.intro.title}</h1>
          <p className="v2-sec-text">{p.intro.text}</p>
        </div>

        <Block id="apilado" n="01" title={p.stack.title} text={p.stack.text}>
          <div className="sig-stack-demo"><Stack locale={locale} /></div>
        </Block>

        <Block id="panel" n="02" title={p.panel.title} text={p.panel.text}>
          <div className="sig-panel-demo">
            <TiltPanel>
              <div className="sig-glass">
                <div className="sig-glass-top">
                  <p className="sig-glass-kind">{p.panel.kind}</p>
                  <StatusBadge status="demo" label={p.panel.sample} />
                </div>
                <p className="sig-glass-q">{p.panel.q}</p>
                <p className="sig-glass-a">{p.panel.a}</p>
                <div className="sig-glass-bars" aria-hidden="true"><i /><i /><i /></div>
                <p className="sig-glass-cite" data-depth="1"><span aria-hidden="true">❝</span>{p.panel.cite}</p>
                <p className="sig-glass-ok" data-depth="2"><CheckIcon size={13} />{p.panel.verified}</p>
                <p className="sig-glass-src" data-depth="3">{p.panel.sources}</p>
              </div>
            </TiltPanel>
          </div>
        </Block>

        <Block id="verbos" n="03" title={p.verbs.title} text={p.verbs.text}>
          <VerbsDemo verbs={verbs} replay={p.replay} />
        </Block>

        <Block id="contador" n="04" title={p.counter.title} text={p.counter.text}>
          <CountersDemo
            replay={p.replay}
            items={[
              { ...c.tests, from: L['tests-from'] },
              { ...c.agents, from: L['agents-from'] },
              { ...c.since, from: L['plan-from'] },
            ]}
          />
        </Block>

        <Block id="luz" n="05" title={p.light.title} text={p.light.text}>
          <LightField className="sig-light-demo">
            <p className="sig-light-hint">{p.light.hint}</p>
            <ul className="sig-light-chips">{TECH.map((x) => <li key={x}><Chip>{x}</Chip></li>)}</ul>
          </LightField>
        </Block>

        <Block id="reproductor" n="06" title={p.player.title} text={p.player.text}>
          <ChapterPlayer
            chapters={chapters}
            labels={{ film: p.player.film, play: p.player.play, pause: p.player.pause, replay: p.player.replay, chapter: p.player.chapter, chapters: p.player.chapters, keys: p.player.keys }}
          />
        </Block>
      </main>

      <footer className="v2-foot">
        <span>{m.footer.name}</span>
        <span className="v2-dim">{m.footer.place}</span>
        <a href={`${BASE_PATH}/${locale}/`}>{m.top.back}<ArrowIcon /></a>
      </footer>
    </>
  );
}
