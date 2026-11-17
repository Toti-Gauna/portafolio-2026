import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { BRANDS } from '@/lib/brands';
import { Board, displayStyle } from './Board';
import { BrandLabEngine } from './BrandLabEngine';
import { brandFontVars } from './fonts';
import './brandlab.css';

/**
 * The Brand Lab (Ola 8a): the method in four steps, a picker with the eight brands and their printed sheets.
 * Server HTML has every sheet (the first marked active): without JS they all show, one below the other, and the
 * picker is a list of `#marca-<id>` links. BrandLabEngine turns the picker into tabs and shows one sheet at a time.
 */
export function BrandLab() {
  const t = useTranslations('brandlab');
  const steps = t.raw('method.steps') as { t: string; d: string }[];
  return (
    <div className={`brandlab ${brandFontVars}`} data-brandlab="">
      <section className="container-x bl-method" aria-labelledby="bl-method">
        <h2 id="bl-method" className="label">{t('method.label')}</h2>
        <ol>
          {steps.map((s, i) => (
            <li key={s.t}><span className="bl-method__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><strong>{s.t}</strong><span>{s.d}</span></li>
          ))}
        </ol>
      </section>

      <nav className="container-x bl-picker" aria-label={t('picker')}>
        <ul>
          {BRANDS.map((b, i) => (
            <li key={b.id}>
              <a className="bl-pick" href={`#marca-${b.id}`} data-brand={b.id} aria-current={i === 0 ? 'true' : undefined}
                style={{ '--p1': b.palette[0].hex, '--p2': b.palette[1].hex, '--p3': b.palette[3].hex } as CSSProperties}>
                <span className="bl-pick__dots" aria-hidden="true"><i /><i /><i /></span>
                <span className="bl-pick__name" style={displayStyle(b)}>{t(`brands.${b.id}.name`)}</span>
                <span className="bl-pick__kind">{b.kind === 'exercise' ? t('pickExercise') : t(`kinds.${b.kind}`)}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-x bl-sheets">
        {BRANDS.map((b, i) => <Board key={b.id} b={b} n={i + 1} total={BRANDS.length} active={i === 0} />)}
      </div>
      <BrandLabEngine />
    </div>
  );
}
