import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CHAPTERS, SCENE_H, SCENE_W, type Chapter, type Spot } from '@/lib/taller';
import { TrailerButton } from '../TrailerButton';
import { StatusTag } from '../ui/StatusTag';

const fig = (n: number) => String(n).padStart(2, '0');
const sceneId = (key: string) => (key === 'contact' ? 'contacto' : key === 'hero' ? 'inicio' : `taller-${key}`);

/** the spot's position in % of the scene; its outline travels as `data-poly` (TallerSpots draws and clips from it) */
const spotStyle = (s: Spot) => ({ '--x': `${s.at[0]}%`, '--y': `${s.at[1]}%` }) as CSSProperties;

/** the side a card opens to: away from the scene's edge it sits near; in the middle, away from the text */
export function openSide(x: number, text: 'left' | 'right'): 'left' | 'right' {
  if (x > 62) return 'left';
  if (x < 38) return 'right';
  return text === 'left' ? 'right' : 'left';
}

/**
 * The numbered references over one scene (Ola 4, design/2026/taller-interaccion.md). Each is a native
 * `<details>`: it works without JavaScript, by keyboard and with a screen reader; TallerSpots adds the lift, the
 * outline and the «one open at a time» rule everywhere. The hero's references are the workshop's index: they carry the
 * figure number of the chapter they lead to.
 */
export function Spots({ chapter, index }: { chapter: Chapter; index: number }) {
  const t = useTranslations('taller');
  const spots = chapter.spots;
  if (!spots?.length) return null;
  const text = chapter.building === 'left' ? 'right' : 'left';
  const k = `ch.${chapter.key}`;
  const labelId = `tch-spots-${chapter.key}`;

  const view = (s: Spot, n: number) => {
    const dest = chapter.key === 'hero' && s.go && 'chapter' in s.go ? CHAPTERS.findIndex((c) => c.key === (s.go as { chapter: string }).chapter) : -1;
    if (dest >= 0) {
      const d = CHAPTERS[dest];
      return {
        num: fig(dest),
        fig: `${t('fig')} ${fig(dest)}`,
        name: t(`ch.${d.key}.title`),
        text: t(`ch.${d.key}.heading`),
        cta: t('spots.goScene'),
        href: `#${sceneId(d.key)}`,
      };
    }
    const base = `${k}.spots.${s.id}`;
    return {
      num: fig(n + 1),
      fig: `${t('fig')} ${fig(index)}.${n + 1}`,
      name: t(`${base}.name`),
      text: t(`${base}.text`),
      cta: s.go && !('chapter' in s.go) ? t(`${base}.cta`) : '',
      href: s.go && 'href' in s.go ? s.go.href : '',
    };
  };

  return (
    <div className="tch__map container-x" data-map="">
      <div className="tch__plane">
        <svg className="tch__shapes" viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} aria-hidden="true" />
        <p id={labelId} className="tch__spots-label label">{t('spots.label')}</p>
        <ul className="tch__spots" aria-labelledby={labelId}>
          {spots.map((s, n) => {
            const v = view(s, n);
            const soon = !s.go && !s.status && !chapter.href;
            return (
              <li
                key={s.id}
                className="tch__spot"
                data-spot={s.id}
                data-open={openSide(s.at[0], text)}
                data-v={s.at[1] > 55 ? 'up' : 'down'}
                data-poly={s.poly.join(' ')}
                style={spotStyle(s)}
              >
                <details name={`taller-${chapter.key}`}>
                  <summary className="tch__mark">
                    <span className="tch__num" aria-hidden="true">{v.num}</span>
                    <span className="tch__tag">{v.name}</span>
                  </summary>
                  <div className="tch__card">
                    <p className="tch__card-fig label">{v.fig}</p>
                    {s.status && <StatusTag kind={s.status} />}
                    <p className="tch__card-text">{v.text}</p>
                    {s.go && 'trailer' in s.go ? (
                      <TrailerButton className="tch__go">{v.cta} <span aria-hidden="true">→</span></TrailerButton>
                    ) : v.href.startsWith('#') ? (
                      <a className="tch__go" href={v.href}>{v.cta} <span aria-hidden="true">→</span></a>
                    ) : v.href ? (
                      <Link className="tch__go" href={v.href}>{v.cta} <span aria-hidden="true">→</span></Link>
                    ) : soon ? (
                      <p className="tch__soon label">{t('soon')}</p>
                    ) : null}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
