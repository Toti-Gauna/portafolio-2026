import type { CSSProperties, ReactNode } from 'react';
import { BASE_PATH, asset } from '@/lib/site';
import { LAYERS, tokens } from '@/v2/tokens';
import { contrast, grade } from '@/v2/tokens/contrast';
import { V2_LOCALES, type V2Locale, v2Messages } from '@/v2/i18n';

/** Lote 1.2: the token specimen, the first page of /v2. Every value on screen is read from tokens.json. */

const C = tokens.color;
type ColorKey = keyof typeof C;
const cssVar = (name: string, value: string) => ({ [name]: value }) as CSSProperties;
const layerFrom = (id: (typeof LAYERS)[number]) => tokens.layer[`${id}-from` as keyof typeof tokens.layer];
const layerTo = (id: (typeof LAYERS)[number]) => tokens.layer[`${id}-to` as keyof typeof tokens.layer];

const BASE: ColorKey[] = ['ink-950', 'ink-900', 'ink-850', 'ink-800', 'ink-700', 'ink-600', 'mist-500', 'mist-400', 'mist-300', 'mist-200', 'mist-100', 'paper', 'white'];
const SPECTRUM: ColorKey[] = ['amber-500', 'amber-300', 'coral-ig', 'coral-500', 'coral-400', 'orange-400', 'pink-500', 'pink-400', 'lilac-400', 'mint-500', 'lime-400', 'blue-ig', 'blue-500', 'blue-400', 'cyan-400'];
const TEXT: ('heading' | 'text' | 'text-muted' | 'text-subtle' | 'text-faint')[] = ['heading', 'text', 'text-muted', 'text-subtle', 'text-faint'];
const TYPE = ['display', 'h1', 'h2', 'h3', 'lead', 'body', 'small', 'label', 'code'] as const;
const GRADIENTS = ['brand', 'name', 'solutions', 'spectrum'] as const;
const MOTION = ['fast', 'base', 'slow'] as const;

const typeSpec = (k: (typeof TYPE)[number]) => {
  const t = tokens.type as Record<string, string>;
  const size = t[`${k}-size`] ?? (k === 'label' ? t['label-size'] : '');
  return [size, t[`${k}-lh`] && `/ ${t[`${k}-lh`]}`, t[`${k}-weight`]].filter(Boolean).join(' ');
};

function Monogram() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="7" r="3.4" fill="var(--color-coral-500)" stroke="none" />
      <path d="M11 16v25" />
      <path d="M41 21a13.5 13.5 0 1 0 1.5 12H30" />
    </svg>
  );
}

const Play = () => (
  <svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><path d="M2 1l9 5-9 5z" fill="currentColor" /></svg>
);
const Arrow = () => (
  <svg aria-hidden="true" viewBox="0 0 16 12" width="16" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6h13M9 1l5 5-5 5" /></svg>
);

function Section({ id, n, title, text, children }: { id: string; n: string; title: string; text: string; children: ReactNode }) {
  return (
    <section className="v2-sec" id={id} aria-labelledby={`${id}-h`}>
      <header className="v2-sec-head">
        <p className="v2-label v2-sec-n" aria-hidden="true">{n}</p>
        <h2 id={`${id}-h`}>{title}</h2>
        <p className="v2-sec-text">{text}</p>
      </header>
      {children}
    </section>
  );
}

function Swatch({ name, hex, ratio }: { name: string; hex: string; ratio?: number }) {
  return (
    <li className="v2-swatch">
      <span className="v2-swatch-chip" style={{ background: hex }} />
      <span className="v2-swatch-name">{name}</span>
      <span className="v2-mono">{hex}</span>
      {ratio !== undefined && <span className="v2-mono v2-dim">{ratio.toFixed(1)} · {grade(ratio)}</span>}
    </li>
  );
}

export function System({ locale }: { locale: V2Locale }) {
  const m = v2Messages(locale);
  const home = `${BASE_PATH}/v2/${locale}/`;
  return (
    <>
      <a className="v2-skip" href="#main">{m.top.skip}</a>
      <header className="v2-top">
        <a className="v2-brand" href={home}>
          <Monogram />
          <span>{m.top.brand}</span>
          <span className="v2-chip">{m.top.version}</span>
        </a>
        <nav className="v2-seg" aria-label={m.top.lang}>
          {V2_LOCALES.map((l) => (
            <a key={l} href={`${BASE_PATH}/v2/${l}/`} hrefLang={l} lang={l} aria-current={l === locale ? 'page' : undefined} aria-label={l === 'es' ? 'Español' : 'English'}>
              {l.toUpperCase()}
            </a>
          ))}
        </nav>
      </header>

      <main id="main" className="v2-main">
        <section className="v2-hero" aria-labelledby="v2-name">
          <div className="v2-hero-text">
            <p className="v2-role"><b>{m.hero.level}</b><span>{m.hero.role}</span></p>
            <h1 id="v2-name" className="v2-name">{m.hero.first}<br /><span className="v2-last">{m.hero.last}</span></h1>
            <p className="v2-lead">{m.hero.leadBefore} <span className="v2-solutions">{m.hero.leadWord}</span> {m.hero.leadAfter}</p>
            <div className="v2-actions">
              <a className="v2-btn v2-btn-primary" href={asset(`/trailer/v2/index.html?lang=${locale}`)}><Play />{m.hero.meet}</a>
              <a className="v2-btn v2-btn-ghost" href={`${BASE_PATH}/${locale}/`}>{m.hero.explore}<Arrow /></a>
            </div>
          </div>
          <figure className="v2-stack">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, a single SVG */}
            <img src={asset('/v2/stack.svg')} alt={m.hero.stackAlt} width={790} height={960} />
            <figcaption>
              <span className="v2-sr">{m.hero.stackTitle}</span>
              <ol className="v2-stack-legend">
                {LAYERS.map((id, i) => (
                  <li key={id} style={{ ...cssVar('--from', layerFrom(id)), top: `${[24.7, 45.1, 56.8, 68.5, 80.1][i]}%` }}>
                    <i aria-hidden="true">0{i + 1}</i>
                    {m.layers[id]}
                  </li>
                ))}
              </ol>
            </figcaption>
          </figure>
        </section>

        <div className="v2-intro">
          <p className="v2-label">{m.intro.kicker}</p>
          <h2>{m.intro.title}</h2>
          <p className="v2-sec-text">{m.intro.text}</p>
        </div>

        <Section id="color" n="01" title={m.color.title} text={m.color.text}>
          <h3 className="v2-sub">{m.color.textOnBg}</h3>
          <ul className="v2-textpairs">
            {TEXT.map((k) => {
              const r = contrast(C[k], C.bg);
              return (
                <li key={k}>
                  <span className="v2-aa" style={{ color: C[k] }} aria-hidden="true">Aa</span>
                  <span className="v2-swatch-name">{m.color.names[k]}</span>
                  <span className="v2-mono">{C[k]}</span>
                  <span className="v2-mono v2-dim">{m.color.ratio} {r.toFixed(1)} · {k === 'text-faint' ? m.color.decorative : grade(r)}</span>
                </li>
              );
            })}
          </ul>
          <h3 className="v2-sub">{m.color.base}</h3>
          <ul className="v2-swatches">{BASE.map((k) => <Swatch key={k} name={k} hex={C[k]} />)}</ul>
          <h3 className="v2-sub">{m.color.spectrum}</h3>
          <ul className="v2-swatches">{SPECTRUM.map((k) => <Swatch key={k} name={k} hex={C[k]} ratio={contrast(C[k], C.bg)} />)}</ul>
          <h3 className="v2-sub">{m.color.layers}</h3>
          <ol className="v2-layers">
            {LAYERS.map((id, i) => (
              <li key={id} style={{ ...cssVar('--from', layerFrom(id)), ...cssVar('--to', layerTo(id)) }}>
                <span className="v2-layer-bar" />
                <span className="v2-layer-n" aria-hidden="true">0{i + 1}</span>
                <span className="v2-swatch-name">{m.layers[id]}</span>
                <span className="v2-mono v2-dim">{layerFrom(id)} → {layerTo(id)}</span>
              </li>
            ))}
          </ol>
          <h3 className="v2-sub">{m.color.gradients}</h3>
          <ul className="v2-gradients">
            {GRADIENTS.map((g) => (
              <li key={g}>
                <span className="v2-grad" style={{ background: tokens.gradient[g] }} />
                <span className="v2-swatch-name">{m.color.gradientNames[g]}</span>
                <span className="v2-mono v2-dim">--gradient-{g}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="tipografia" n="02" title={m.type.title} text={m.type.text}>
          <ul className="v2-type">
            {TYPE.map((k) => (
              <li key={k}>
                <p className="v2-type-meta"><span className="v2-swatch-name">{m.type.names[k]}</span><span className="v2-mono v2-dim">{typeSpec(k)}</span></p>
                <p className={`v2-t-${k}`}>{m.type.samples[k]}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="espacio" n="03" title={m.space.title} text={m.space.text}>
          <h3 className="v2-sub">{m.space.spacing}</h3>
          <ul className="v2-space">
            {Object.entries(tokens.space).map(([k, val]) => (
              <li key={k}><span className="v2-mono v2-space-k">{k}</span><span className="v2-space-bar" style={{ width: val }} /><span className="v2-mono v2-dim">{val}</span></li>
            ))}
          </ul>
          <h3 className="v2-sub">{m.space.radius}</h3>
          <ul className="v2-radii">
            {Object.entries(tokens.radius).map(([k, val]) => (
              <li key={k}><span className="v2-radius" style={{ borderRadius: val }} /><span className="v2-mono">{k}</span><span className="v2-mono v2-dim">{val}</span></li>
            ))}
          </ul>
          <h3 className="v2-sub">{m.space.touch}</h3>
          <p className="v2-touch"><span className="v2-touch-box" /><span className="v2-mono">{tokens.size.touch} × {tokens.size.touch}</span></p>
        </Section>

        <Section id="movimiento" n="04" title={m.motion.title} text={m.motion.text}>
          <p className="v2-hint">{m.motion.hint}</p>
          <ul className="v2-motion">
            {MOTION.map((k) => (
              <li key={k} style={cssVar('--dur', tokens.motion[k])}>
                <label>
                  <input type="checkbox" className="v2-motion-input" />
                  <span className="v2-motion-name"><span className="v2-swatch-name">{m.motion[k]}</span><span className="v2-mono v2-dim">{tokens.motion[k]}</span></span>
                  <span className="v2-motion-track" aria-hidden="true"><span className="v2-motion-dot" /></span>
                </label>
              </li>
            ))}
          </ul>
          <p className="v2-mono v2-dim v2-curve">--motion-ease: {tokens.motion.ease}</p>
        </Section>

        <Section id="profundidad" n="05" title={m.depth.title} text={m.depth.text}>
          <ul className="v2-depth">
            <li><span className="v2-depth-glow">{m.depth.glow}</span><span className="v2-mono v2-dim">--shadow-glow-brand</span></li>
            <li><span className="v2-depth-panel">{m.depth.panel}</span><span className="v2-mono v2-dim">--shadow-panel</span></li>
            <li><span className="v2-depth-focus">{m.depth.focus}</span><span className="v2-mono v2-dim">--shadow-focus</span></li>
          </ul>
          <h3 className="v2-sub">{m.depth.z}</h3>
          <ol className="v2-z">
            {Object.entries(tokens.z).map(([k, val], i) => (
              <li key={k} style={cssVar('--i', String(i))}><span className="v2-mono">{k}</span><span className="v2-mono v2-dim">{val}</span></li>
            ))}
          </ol>
        </Section>
      </main>

      <footer className="v2-foot">
        <span>{m.footer.name}</span>
        <span className="v2-dim">{m.footer.place}</span>
        <a href={`${BASE_PATH}/${locale}/`}>{m.top.back}<Arrow /></a>
      </footer>
    </>
  );
}
