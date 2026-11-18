import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { LAYERS, tokens } from '@/v2/tokens';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { SHORTCUTS } from '@/v2/motion/shortcuts';
import { SITE_PAGES, sitePath } from '@/v2/site';
import { ReplayButton } from './motion/ReplayButton';
import { ShortcutsButton } from './motion/ShortcutsButton';
import { TopBar } from './TopBar';
import { Button, IconButton } from './ui/Button';
import { SectionHeading } from './ui/Card';
import { ArrowIcon, MailIcon, PlayIcon } from './ui/Icons';
import { SiteFooter } from './site/SiteFooter';

/** Lote 2.2: the motion engine, every piece live. */

function Block({ id, n, title, text, children }: { id: string; n: string; title: string; text: string; children: ReactNode }) {
  return (
    <section className="v2-sec" id={id} aria-labelledby={`${id}-h`}>
      <SectionHeading id={`${id}-h`} n={n} title={title} text={text} />
      {children}
    </section>
  );
}

const vars = (from: string, to?: string) => ({ '--from': from, ...(to ? { '--to': to } : {}) }) as CSSProperties;
const L = tokens.layer;

/** The five layers as flat slabs; each moves with the scroll at its own pace (`--k`) and a trace draws through them. */
function ScrollScene({ caption }: { caption: string }) {
  const w = 300, h = 120, x0 = 130, y0 = 70, gap = 74;
  const slab = (i: number) => {
    const y = y0 + i * gap;
    return `${x0},${y + h / 2} ${x0 + w / 2},${y} ${x0 + w},${y + h / 2} ${x0 + w / 2},${y + h}`;
  };
  return (
    <figure className="mo-scroll" data-scroll data-scroll-rest="0.5">
      <svg viewBox="0 0 560 520" aria-hidden="true">
        {[...LAYERS].reverse().map((id, k) => {
          const i = LAYERS.length - 1 - k;
          return (
            <polygon
              key={id}
              className="mo-slab"
              points={slab(i)}
              style={{ '--k': i - 2 } as CSSProperties}
              fill={`${L[`${id}-from` as keyof typeof L]}22`}
              stroke={L[`${id}-from` as keyof typeof L]}
              strokeWidth="2"
            />
          );
        })}
        <path className="mo-trace" pathLength={1} d={`M${x0 + w / 2} 40 V 480`} stroke={tokens.color['coral-500']} strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
      <figcaption className="v2-label">{caption}</figcaption>
    </figure>
  );
}

export function MotionPage({ locale }: { locale: V2Locale }) {
  const m = v2Messages(locale);
  const t = m.engine;
  const s = m.site;
  const href = (key: (typeof SITE_PAGES)[number]['key']) => sitePath(locale, SITE_PAGES.find((p) => p.key === key)!.path);
  return (
    <>
      <TopBar locale={locale} page="motion" />
      <main id="main" className="v2-main">
        <div className="v2-intro">
          <p className="v2-label">{t.intro.kicker}</p>
          <h1 className="cat-title">{t.intro.title}</h1>
          <p className="v2-sec-text">{t.intro.text}</p>
        </div>

        <Block id="aparicion" n="01" title={t.reveal.title} text={t.reveal.text}>
          <div data-replay className="mo-row" style={{ alignItems: 'stretch', flexDirection: 'column' }}>
            <ul className="mo-tiles">
              {SITE_PAGES.map((p, i) => (
                <li key={p.key} className="mo-tile" style={vars(p.from)} data-reveal>
                  <b>{String(i + 1).padStart(2, '0')}</b>
                  <span>{s.pages[p.key].t}</span>
                </li>
              ))}
            </ul>
            <div><ReplayButton label={t.reveal.replay} /></div>
          </div>
        </Block>

        <Block id="magnetico" n="02" title={t.magnetic.title} text={t.magnetic.text}>
          <div className="mo-row">
            <Button href="#magnetico" iconStart={<PlayIcon />} magnetic={10}>{m.hero.meet}</Button>
            <Button href="#magnetico" variant="secondary" iconEnd={<ArrowIcon />} magnetic={8}>{m.hero.explore}</Button>
            <IconButton label={s.contact} data-magnetic="12"><MailIcon /></IconButton>
          </div>
          <p className="v2-label">{t.magnetic.hint}</p>
        </Block>

        <Block id="cursor" n="03" title={t.cursor.title} text={t.cursor.text}>
          <div className="mo-zones">
            <div className="mo-zone" style={vars(L['plan-from'])} data-cursor={t.cursor.zones.view}>{t.cursor.zones.view}</div>
            <div className="mo-zone" style={vars(L['tests-from'])} data-cursor={t.cursor.zones.drag}>{t.cursor.zones.drag}</div>
            <div className="mo-zone" style={vars(L['agents-from'])} data-cursor={t.cursor.zones.open}>{t.cursor.zones.open}</div>
          </div>
          <p className="v2-label">{t.cursor.touch}</p>
        </Block>

        <Block id="atajos" n="04" title={t.keys.title} text={t.keys.text}>
          <ul className="mo-keys">
            {SHORTCUTS.map((k) => (
              <li key={k.action}><kbd className="ui-kbd">{k.key}</kbd>{t.help.actions[k.action]}</li>
            ))}
          </ul>
          <div><ShortcutsButton label={t.keys.open} /></div>
        </Block>

        <Block id="scroll" n="05" title={t.scroll.title} text={t.scroll.text}>
          <ScrollScene caption={t.scroll.caption} />
        </Block>

        <Block id="camara" n="06" title={t.camera.title} text={t.camera.text}>
          <p className="v2-label">{t.camera.try}</p>
          <div className="mo-cams">
            <Link className="mo-cam" href={href('work')} style={vars(L['plan-from'])}><span>{t.camera.forward}</span><span>{s.pages.work.t}</span></Link>
            <Link className="mo-cam" href={href('home')} style={vars(L['code-from'])}><span>{t.camera.back}</span><span>{s.pages.home.t}</span></Link>
            <Link className="mo-cam" href={sitePath(locale, 'kit/')} style={vars(L['tests-from'])}><span>{t.camera.depth}</span><span>{m.nav.kit}</span></Link>
          </div>
        </Block>

        <Block id="reglas" n="07" title={t.rules.title} text={t.intro.text}>
          <ul className="mo-rules">{t.rules.items.map((r) => <li key={r} data-reveal>{r}</li>)}</ul>
        </Block>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
