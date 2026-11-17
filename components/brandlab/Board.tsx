import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import type { Brand, Origin } from '@/lib/brands';
import { StatusTag } from '@/components/ui/StatusTag';
import { Apps, Logo, Patterns } from './art';
import { FAMILY } from './fonts';

/** How each display family is set in its brand (weight and variable axes), for the type specimen and the names. */
const DISPLAY_STYLE: Partial<Record<Brand['id'], CSSProperties>> = {
  ig: { fontWeight: 900, fontVariationSettings: "'wdth' 125", letterSpacing: '-0.03em' },
  volta: { fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em' },
  velmar: { fontWeight: 420, fontVariationSettings: "'opsz' 144", letterSpacing: '-0.02em' },
  dentalos: { fontWeight: 500 },
  brote: { fontWeight: 800, fontVariationSettings: "'wdth' 75, 'opsz' 96", letterSpacing: '-0.03em' },
};
export const displayStyle = (b: Brand): CSSProperties => ({ fontFamily: FAMILY[b.fonts.display], ...DISPLAY_STYLE[b.id] });

const UPPER = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnñopqrstuvwxyz';
const DIGITS = '0123456789 ¿?¡! & @';

type Copy = {
  name: string; full: string; idea: string; place: string; source: string; note: string;
  palette: Record<string, { n: string; u: string }>; patterns: string[]; apps: { name: string; lines: string[] }[];
};

/** One printed sheet of the Brand Lab: header, blocks A–G and the foot (design/2026/brand-lab.md). */
export function Board({ b, n, total, active }: { b: Brand; n: number; total: number; active: boolean }) {
  const t = useTranslations('brandlab');
  const c = t.raw(`brands.${b.id}`) as Copy;
  const cap = (k: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g', from: Origin) => (
    <p className="bl-cap"><span className="bl-cap__k">{k.toUpperCase()}</span>{t(`blocks.${k}`)}<span className="bl-cap__from">{t(`from.${from}`)}</span></p>
  );
  const sheet = { '--s-bg': b.sheet.bg, '--s-ink': b.sheet.ink, '--s-muted': b.sheet.muted, '--s-line': b.sheet.line, '--s-text': FAMILY[b.fonts.text] } as CSSProperties;
  const patterns = Patterns({ b });
  const apps = Apps({ b, lines: c.apps.map((a) => a.lines) });

  return (
    <article id={`marca-${b.id}`} className="bl-sheet" data-brand={b.id} data-active={active ? '' : undefined} style={sheet} aria-labelledby={`bl-h-${b.id}`}>
      <span className="bl-crop" aria-hidden="true" />
      <header className="bl-head">
        <p className="bl-sheetno">{t('sheet', { n, total })}</p>
        <h2 id={`bl-h-${b.id}`} className="bl-name" style={displayStyle(b)} tabIndex={-1}>{c.name}</h2>
        {b.kind === 'exercise' ? <StatusTag kind="ejercicio" /> : <p className="bl-kind">{t(`kinds.${b.kind}`)}</p>}
        <dl className="bl-meta">
          <div><dt>{t('idea')}</dt><dd>{c.idea}</dd></div>
          <div><dt>{t('place')}</dt><dd>{c.place}</dd></div>
        </dl>
      </header>

      <div className="bl-grid">
        {(['a', 'b', 'c'] as const).map((k) => (
          <figure key={k} className={`bl-block bl-${k}`}>
            {cap(k, b.origin[k])}
            <div className="bl-panel" style={{ background: b.panels[k] }} role="img" aria-label={t(`alt.${k}`, { name: c.full })}>
              <div className="bl-panel__in" aria-hidden="true"><Logo b={b} part={k} /></div>
            </div>
          </figure>
        ))}

        <section className="bl-block bl-d" aria-label={t('blocks.d')}>
          {cap('d', b.origin.d)}
          <ul className="bl-palette">
            {b.palette.map((s, i) => (
              <li key={s.key} style={{ '--i': i } as CSSProperties}>
                <span className="bl-dot" style={{ background: s.hex }} aria-hidden="true" />
                <span className="bl-sw__n">{c.palette[s.key].n}</span>
                <span className="bl-sw__hex">{s.hex.toUpperCase()}</span>
                <span className="bl-sw__u">{c.palette[s.key].u}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bl-block bl-e" aria-label={t('blocks.e')}>
          {cap('e', b.origin.e)}
          <div className="bl-type">
            <div className="bl-spec">
              <p className="bl-spec__aa" style={displayStyle(b)} aria-hidden="true">Aa</p>
              <p className="bl-spec__name"><span>{b.fonts.display}</span> · {t('roles.display')}</p>
              <p className="bl-spec__set" style={displayStyle(b)} aria-hidden="true">{UPPER}<br />{LOWER}<br />{DIGITS}</p>
            </div>
            <div className="bl-spec bl-spec--text">
              <p className="bl-spec__aa" style={{ fontFamily: FAMILY[b.fonts.text] }} aria-hidden="true">Aa</p>
              <p className="bl-spec__name"><span>{b.fonts.text}</span> · {t('roles.text')}</p>
              <p className="bl-spec__set" style={{ fontFamily: FAMILY[b.fonts.text] }} aria-hidden="true">{UPPER}<br />{LOWER}<br />{DIGITS}</p>
            </div>
          </div>
        </section>

        <section className="bl-block bl-f" aria-label={t('blocks.f')}>
          {cap('f', b.origin.f)}
          <ul className="bl-pats">
            {patterns.map((p, i) => (
              <li key={i} style={{ '--i': i } as CSSProperties}>
                <div className="bl-pat" role="img" aria-label={t('alt.f', { name: c.full, what: c.patterns[i] })}>{p}</div>
                <span className="bl-pat__n">{c.patterns[i]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bl-block bl-g" aria-label={t('blocks.g')}>
          {cap('g', b.origin.g)}
          <ul className="bl-apps">
            {apps.map((a, i) => (
              <li key={i} style={{ '--i': i } as CSSProperties}>
                <div className="bl-app" role="img" aria-label={t('alt.g', { name: c.full, what: c.apps[i].name })}>{a}</div>
                <span className="bl-app__n">{c.apps[i].name}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="bl-foot">
        <p><span className="bl-foot__k">{t('source')}</span> {c.source}</p>
        <p><span className="bl-foot__k">{t('note')}</span> {c.note}</p>
      </footer>
    </article>
  );
}
