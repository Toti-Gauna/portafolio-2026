import type { CSSProperties, ReactNode } from 'react';
import { contrast } from '@/v2/tokens/contrast';
import { LogoStage } from './LogoStage';
import { Turntable } from './Turntable';
import type { BrandCopy, BrandField, BrandSpec, Origin, Svg } from './types';

export type BrandLabels = {
  kinds: Record<BrandSpec['kind'], string>;
  origin: Record<Origin, string>;
  sections: { build: string; color: string; type: string; patterns: string; screen: string; street: string; object: string };
  idea: string; place: string; redraw: string; grid: string; notes: string; secondary: string; submark: string; fields: string;
  share: string; pairs: string; on: string; dec: string; display: string; text: string; weights: string;
  post: string; story: string; poster: string; turn: string; reset: string; hint: string; source: string;
};

const fieldVars = (f: BrandField, p = '--f') => ({ [`${p}-bg`]: f.bg, [`${p}-ink`]: f.ink, [`${p}-muted`]: f.muted, [`${p}-accent`]: f.accent, [`${p}-line`]: f.line });

/** The brand's skin as custom properties: the frame reads only these. */
export function skinVars(spec: BrandSpec): CSSProperties {
  const s = spec.skin;
  return {
    ...fieldVars(s.main, '--m'), ...fieldVars(s.alt, '--a'), '--on-accent': s.onAccent, '--bl-radius': s.radius, '--bl-rule': s.rule,
    '--bl-display': spec.type.display.stack, '--bl-text': spec.type.text.stack,
    '--bl-hw': s.heading.weight, '--bl-ht': s.heading.transform, '--bl-hk': s.heading.tracking, '--bl-hs': s.heading.style,
  } as CSSProperties;
}

const Pic = ({ art, alt, className }: { art: Svg; alt: string; className?: string }) => (
  <svg className={className} viewBox={art.box.join(' ')} role="img" aria-label={alt} dangerouslySetInnerHTML={{ __html: art.svg }} />
);
export const Mark = ({ art }: { art: Svg }) => <svg viewBox={art.box.join(' ')} aria-hidden="true" dangerouslySetInnerHTML={{ __html: art.svg }} />;

/**
 * One brand, whole (lote 6.1): its cover with the logo drawing itself, the logo on its construction grid, colour,
 * type, patterns, its pieces on screen and on the street, and the brand in 3D. Everything inside is the brand's:
 * its two fields alternate from section to section, headings are set in its display type and every corner has its
 * radius. Under each block, where it comes from (its repo, this site, or drawn for the lab).
 */
export function BrandBoard({ spec, copy, labels: L }: { spec: BrandSpec; copy: BrandCopy; labels: BrandLabels }) {
  const art = spec.art(copy.art);
  const id = spec.id;
  const ORDER = ['build', 'color', 'type', 'patterns', 'screen', 'street', 'object'];
  const Sec = ({ k, field, origin, children }: { k: keyof BrandLabels['sections']; field: 'm' | 'a'; origin: Origin; children: ReactNode }) => (
    <section className="bl-sec" data-field={field} data-k={k} aria-labelledby={`bl-${k}`}>
      <div className="bl-in">
        <header className="bl-head">
          <span className="bl-num" aria-hidden="true">{String(ORDER.indexOf(k) + 1).padStart(2, '0')}</span>
          <h2 id={`bl-${k}`}>{L.sections[k]}</h2>
          <span className="bl-origin">{L.origin[origin]}</span>
        </header>
        {children}
      </div>
    </section>
  );
  const pairs: [string, string, string, string][] = [
    ['ink', 'bg', spec.skin.main.ink, spec.skin.main.bg], ['accent', 'bg', spec.skin.main.accent, spec.skin.main.bg],
    ['ink', 'bg', spec.skin.alt.ink, spec.skin.alt.bg], ['accent', 'bg', spec.skin.alt.accent, spec.skin.alt.bg],
    ['ink', 'accent', spec.skin.onAccent, spec.skin.main.accent],
  ];
  const fonts = [['display', spec.type.display, L.display], ['text', spec.type.text, L.text]] as const;

  return (
    <article className="bl" data-brand={id} data-kind={spec.kind} style={skinVars(spec)}>
      <section className="bl-sec bl-cover" data-field="m" aria-labelledby="bl-name">
        <div className="bl-in">
          <LogoStage art={art.logo.main} alt={copy.alt.logo} labels={L} mode="cover" />
          <div className="bl-meta">
            <p className="bl-kind"><b>{L.kinds[spec.kind]}</b><span>{copy.owner}</span></p>
            <h1 id="bl-name">{copy.name}</h1>
            <p className="bl-idea">{copy.idea}</p>
            <dl className="bl-facts">
              <div><dt>{L.place}</dt><dd>{copy.place}</dd></div>
            </dl>
            <ul className="bl-traits">{copy.traits.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </div>
      </section>

      <Sec k="build" field="a" origin={spec.origin.grid}>
        <div className="bl-build">
          <LogoStage art={art.logo.main} grid={art.logo.grid} alt={copy.alt.logo} labels={L} mode="grid" />
          <div className="bl-notes">
            <h3>{L.notes}</h3>
            <ol>{copy.grid.map((g) => <li key={g}>{g}</li>)}</ol>
          </div>
        </div>
        <div className="bl-versions">
          <figure>
            <div className="bl-chip" data-on="m"><Pic art={art.logo.secondary} alt={copy.alt.secondary} /></div>
            <figcaption>{L.secondary}</figcaption>
          </figure>
          <figure>
            <div className="bl-chips">
              <div className="bl-chip" data-on="m"><Pic art={art.logo.submark} alt={copy.alt.submark} /></div>
              <div className="bl-chip" data-on="a" aria-hidden="true"><Mark art={art.logo.submark} /></div>
              <div className="bl-chip" data-on="x" aria-hidden="true"><Mark art={art.logo.submark} /></div>
            </div>
            <figcaption>{L.submark} · {L.fields}</figcaption>
          </figure>
        </div>
      </Sec>

      <Sec k="color" field="m" origin={spec.origin.palette}>
        <ul className="bl-palette">
          {spec.palette.map((c) => (
            <li key={c.key} style={{ '--c': c.hex } as CSSProperties}>
              <i aria-hidden="true" />
              <b>{copy.palette[c.key].name}</b>
              <code>{c.hex}</code>
              <span>{copy.palette[c.key].use}</span>
            </li>
          ))}
        </ul>
        <p className="bl-sub">{L.share}</p>
        <div className="bl-share" role="img" aria-label={`${L.share}: ${spec.palette.map((c) => `${copy.palette[c.key].name} ${c.share} %`).join(', ')}`}>
          {spec.palette.map((c) => <i key={c.key} style={{ flexGrow: c.share, background: c.hex }} />)}
        </div>
        <p className="bl-sub">{L.pairs}</p>
        <ul className="bl-pairs">
          {pairs.map(([, , fg, bg], i) => (
            <li key={i} style={{ color: fg, background: bg }}>
              <b aria-hidden="true">Aa</b>
              <span><code>{fg}</code> {L.on} <code>{bg}</code></span>
              <strong>{contrast(fg, bg).toFixed(1).replace('.', L.dec)}:1</strong>
            </li>
          ))}
        </ul>
      </Sec>

      <Sec k="type" field="a" origin={spec.origin.type}>
        <ul className="bl-type">
          {fonts.map(([key, f, role]) => (
            <li key={key} data-font={key} style={{ fontFamily: f.stack } as CSSProperties}>
              <p className="bl-specimen" style={{ fontWeight: key === 'display' ? spec.skin.heading.weight : f.weights[0], fontStyle: key === 'display' ? spec.skin.heading.style : undefined }}>{copy.type[key].sample}</p>
              <p className="bl-glyphs" aria-hidden="true">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Ññ Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789</p>
              <p className="bl-fontname"><b>{f.name}</b><span>{role} · {copy.type[key].role}</span></p>
              <p className="bl-weights"><span className="ui-sr">{L.weights}: </span>{f.weights.map((w) => <span key={w} style={{ fontWeight: w }}>{w}</span>)}{f.italic && <span style={{ fontStyle: 'italic' }}>Italic</span>}</p>
            </li>
          ))}
        </ul>
      </Sec>

      <Sec k="patterns" field="m" origin={spec.origin.patterns}>
        <ul className="bl-patterns" role="img" aria-label={copy.alt.patterns}>
          {art.patterns.map((p, i) => (
            <li key={i} aria-hidden="true">
              <svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid slice">
                <defs><pattern id={`bl-${id}-p${i}`} width={p.box[2]} height={p.box[3]} patternUnits="userSpaceOnUse" dangerouslySetInnerHTML={{ __html: p.svg }} /></defs>
                <rect width="360" height="240" fill={`url(#bl-${id}-p${i})`} />
              </svg>
            </li>
          ))}
        </ul>
      </Sec>

      <Sec k="screen" field="a" origin={spec.origin.pieces}>
        <div className="bl-screen">
          <figure className="bl-phone"><div className="bl-phone-view"><Pic art={art.digital.story} alt={copy.alt.story} /></div><figcaption>{L.story}</figcaption></figure>
          <figure className="bl-post"><Pic art={art.digital.post} alt={copy.alt.post} /><figcaption>{L.post}</figcaption></figure>
        </div>
      </Sec>

      <Sec k="street" field="m" origin={spec.origin.pieces}>
        <div className="bl-street">
          <figure className="bl-poster"><Pic art={art.physical.poster} alt={copy.alt.poster} /><figcaption>{L.poster}</figcaption></figure>
          <figure className="bl-print"><Pic art={art.physical.print} alt={copy.alt.print} /><figcaption>{copy.pieces.print}</figcaption></figure>
        </div>
      </Sec>

      <Sec k="object" field="a" origin={spec.origin.object}>
        <div className="bl-object">
          <Turntable object={art.object} id={`bl-${id}`} alt={copy.alt.object} labels={L} />
          <p className="bl-objname">{copy.pieces.object}</p>
        </div>
      </Sec>

      <footer className="bl-sec bl-foot" data-field="m">
        <div className="bl-in">
          <p className="bl-source"><b>{L.source}</b> {copy.source}</p>
        </div>
      </footer>
    </article>
  );
}
