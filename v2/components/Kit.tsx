import type { CSSProperties, ReactNode } from 'react';
import { BASE_PATH } from '@/lib/site';
import { LAYERS, tokens } from '@/v2/tokens';
import { type V2Locale, V2_LANG_TAG, v2Messages } from '@/v2/i18n';
import { TopBar } from './TopBar';
import { SectionHeading } from './ui/Card';
import { ArrowIcon } from './ui/Icons';
import { GAUGE_P, gaugeSvg } from './kit/gauge-art';
import { GaugeFigure } from './kit/GaugeFigure';
import { ICON_FAMILIES, ICON_SIZES, Icon, type IconName } from './kit/icons';
import { STAMP_IDS, stampIsDark, stampSvg } from './kit/stamps';
import { StackScene } from './kit/StackScene';

/** Lote 1.5: the illustration and icon kit, with its rules and a live example of each language. */

const L = tokens.layer;
const layerAccent = (name: IconName) => ((LAYERS as readonly string[]).includes(name) ? L[`${name}-from` as keyof typeof L] : undefined);

function Block({ id, n, title, text, children }: { id: string; n: string; title: string; text: string; children: ReactNode }) {
  return (
    <section className="v2-sec" id={id} aria-labelledby={`${id}-h`}>
      <SectionHeading id={`${id}-h`} n={n} title={title} text={text} />
      {children}
    </section>
  );
}

function Rules({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="kit-rules">
      <h3 className="v2-label">{title}</h3>
      <ol>{items.map((r, i) => <li key={i}><i aria-hidden="true">{String(i + 1).padStart(2, '0')}</i>{r}</li>)}</ol>
    </div>
  );
}

export function Kit({ locale }: { locale: V2Locale }) {
  const m = v2Messages(locale);
  const t = m.kit;
  return (
    <>
      <TopBar locale={locale} page="kit" />
      <main id="main" className="v2-main">
        <div className="v2-intro">
          <p className="v2-label">{t.intro.kicker}</p>
          <h1 className="cat-title">{t.intro.title}</h1>
          <p className="v2-sec-text">{t.intro.text}</p>
        </div>

        <Block id="iconos" n="01" title={t.icons.title} text={t.icons.text}>
          {(Object.keys(ICON_FAMILIES) as (keyof typeof ICON_FAMILIES)[]).map((fam) => (
            <div key={fam} className="kit-family">
              <h3 className="v2-sub">{t.icons.families[fam]}</h3>
              <ul className="kit-icons">
                {ICON_FAMILIES[fam].map((name) => (
                  <li key={name}>
                    <span className="kit-icon-tile"><Icon name={name} size={32} accent={layerAccent(name)} /></span>
                    <span>{t.icons.names[name]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="kit-row">
            <div className="kit-sizes">
              <h3 className="v2-label">{t.icons.sizes}</h3>
              <ul>
                {ICON_SIZES.map((s) => (
                  <li key={s}><Icon name={s === 16 ? 'check' : 'rag'} size={s} /><span className="v2-mono v2-dim">{s} px</span></li>
                ))}
              </ul>
            </div>
            <Rules title={m.kit.rules} items={t.icons.rules} />
          </div>
        </Block>

        <Block id="ilustracion" n="02" title={t.figure.title} text={t.figure.text}>
          <figure className="kit-fig iso">
            <div className="kit-plate">
              <span className="kit-corner" data-corner="fig" aria-hidden="true">{t.figure.fig}</span>
              <span className="kit-corner" data-corner="title" aria-hidden="true">{t.figure.name}</span>
              <span className="kit-corner" data-corner="hint">{t.figure.hint}</span>
              <GaugeFigure svg={gaugeSvg(t.figure.alt)} P={GAUGE_P} labels={t.figure.labels} locale={V2_LANG_TAG[locale]} />
            </div>
            <figcaption className="kit-legend">
              <ul className="kit-keys">
                <li><i data-mark="lit" aria-hidden="true" />{t.figure.keys.lit}</li>
                <li><i data-mark="raised" aria-hidden="true" />{t.figure.keys.raised}</li>
                <li><i data-mark="band" aria-hidden="true" />{t.figure.keys.band}</li>
              </ul>
              <p>{t.figure.caption}</p>
            </figcaption>
          </figure>
          <Rules title={m.kit.rules} items={t.figure.rules} />
        </Block>

        <Block id="estampillas" n="03" title={t.stamps.title} text={t.stamps.text}>
          <ul className="kit-stamps">
            {STAMP_IDS.map((id) => (
              <li key={id} className="kit-stamp" data-dark={stampIsDark(id) || undefined}>
                <svg viewBox="0 0 240 300" role="img" aria-label={t.stamps.items[id].alt} dangerouslySetInnerHTML={{ __html: stampSvg(id) }} />
                <b>{t.stamps.items[id].year}</b>
                <span>{t.stamps.items[id].name}</span>
              </li>
            ))}
          </ul>
          <Rules title={m.kit.rules} items={t.stamps.rules} />
        </Block>

        <Block id="tres-d" n="04" title={t.three.title} text={t.three.text}>
          <div className="kit-scene-frame" style={{ '--from': L['agents-from'] } as CSSProperties}>
            <StackScene label={t.three.label} />
            <p className="kit-corner" data-corner="hint">{t.three.hint}</p>
          </div>
          <Rules title={m.kit.rules} items={t.three.rules} />
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
