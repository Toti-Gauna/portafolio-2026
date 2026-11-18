import type { CSSProperties, ReactNode } from 'react';
import { BASE_PATH } from '@/lib/site';
import { LAYERS, tokens } from '@/v2/tokens';
import { contrast, grade } from '@/v2/tokens/contrast';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { TopBar } from './TopBar';
import { ArrowIcon } from './ui/Icons';

/** Lote 1.2: the token specimen (/v2/<locale>/tokens/). Every value on screen is read from tokens.json. */

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
  return (
    <>
      <TopBar locale={locale} page="tokens" />

      <main id="main" className="v2-main">
        <div className="v2-intro">
          <p className="v2-label">{m.intro.kicker}</p>
          <h1 className="cat-title">{m.intro.title}</h1>
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
        <a href={`${BASE_PATH}/${locale}/`}>{m.top.back}<ArrowIcon /></a>
      </footer>
    </>
  );
}
