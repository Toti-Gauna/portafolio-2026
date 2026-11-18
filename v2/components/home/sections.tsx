import type { CSSProperties } from 'react';
import Link from 'next/link';
import { asset, CONTACT_EMAIL, LINKEDIN_URL } from '@/lib/site';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { SITE_PAGES, sitePath } from '@/v2/site';
import { CountUp } from '../signature/CountUp';
import { ArrowIcon, CheckIcon, MailIcon } from '../ui/Icons';
import { CaseClip } from './CaseClip';
import { HomeSection } from './HomeSection';
import { WHAT_ART, WHAT_BOX, WHAT_IDS } from './what-art';

/** Three figures under the opening: since when, how tested, how organised. Each rolls to its value once. */
export function HomeStats({ locale }: { locale: V2Locale }) {
  const s = v2Messages(locale).home.stats;
  return (
    <ul className="hm-stats" aria-label={s.label}>
      {s.items.map((it) => (
        <li key={it.n}>
          <b><CountUp value={it.n} />{'u' in it && <i>{it.u}</i>}</b>
          <span>{it.d}</span>
        </li>
      ))}
    </ul>
  );
}

/** What I do: four capabilities, each an object that jumps under the pointer, each with the case that proves it. */
export function HomeWhat({ locale }: { locale: V2Locale }) {
  const w = v2Messages(locale).home.what;
  return (
    <HomeSection id="que-hago" theme="coral" n="02" kicker={w.kicker} title={w.title}>
      <ul className="hw">
        {WHAT_IDS.map((id) => (
          <li key={id} data-reveal data-boing="hop">
            <svg className="iso-svg hw-obj" data-boing-part viewBox={`0 0 ${WHAT_BOX.width} ${WHAT_BOX.height}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: WHAT_ART[id] }} />
            <h3>{w.items[id].t}</h3>
            <p>{w.items[id].d}</p>
            <p className="hw-proof"><CheckIcon />{w.items[id].proof}</p>
          </li>
        ))}
      </ul>
      <p className="hm-more" data-reveal><Link className="hm-btn hm-btn--main" href={sitePath(locale, 'work/')} data-boing data-magnetic="6">{w.cta}<ArrowIcon /></Link></p>
    </HomeSection>
  );
}

const CASES = [
  { id: 'complia', status: 'interna', video: '/media/complia-demo.mp4', poster: '/media/complia-demo-poster.jpg' },
  { id: 'tuenti', status: 'profesional', image: '/media/tuenti-cover.svg' },
  { id: 'eclipse', status: 'desarrollo', video: '/media/eclipse/landing-recorrido.mp4', poster: '/media/eclipse/landing-recorrido.jpg' },
] as const;

/** Featured cases: the best one first and larger. Each says what it is, what I did and where it stands. */
export function HomeCases({ locale }: { locale: V2Locale }) {
  const m = v2Messages(locale);
  const c = m.home.cases;
  return (
    <HomeSection id="casos" theme="paper" n="03" kicker={c.kicker} title={c.title}>
      <ul className="hc">
        {CASES.map((k) => {
          const it = c.items[k.id];
          return (
            <li key={k.id} className="hc-card" data-reveal data-boing>
              <figure className="hc-media" data-boing-part>
                {'video' in k
                  ? <CaseClip src={asset(k.video)} poster={asset(k.poster)} alt={it.alt} play={c.play} pause={c.pause} name={it.name} />
                  // eslint-disable-next-line @next/next/no-img-element
                  : <img src={asset(k.image)} alt={it.alt} loading="lazy" decoding="async" />}
                <figcaption>{it.media}</figcaption>
              </figure>
              <p className="hc-status" data-status={k.status}><i aria-hidden="true" />{m.ui.status[k.status]}</p>
              <h3><Link href={sitePath(locale, 'work/')}>{it.name}</Link></h3>
              <p className="hc-role">{it.role}</p>
              <p className="hc-text">{it.text}</p>
            </li>
          );
        })}
      </ul>
      <p className="hm-more" data-reveal><Link className="hm-btn hm-btn--main" href={sitePath(locale, 'work/')} data-boing data-magnetic="6">{c.cta}<ArrowIcon /></Link></p>
    </HomeSection>
  );
}

/** A door to every other page, in the order of the menu. */
export function HomeDoors({ locale }: { locale: V2Locale }) {
  const m = v2Messages(locale);
  return (
    <HomeSection id="explorar" theme="blue" n="04" kicker={m.home.doors.kicker} title={m.home.doors.title}>
      <ul className="hd">
        {SITE_PAGES.filter((p) => p.key !== 'home').map((p, i) => (
          <li key={p.key} data-reveal>
            <Link className="hd-row" href={sitePath(locale, p.path)} data-boing data-cursor={m.site.more} style={{ '--c': p.from } as CSSProperties}>
              <span className="hd-n" aria-hidden="true">{String(i + 2).padStart(2, '0')}</span>
              <span className="hd-t">{m.site.pages[p.key].t}</span>
              <span className="hd-d">{m.site.pages[p.key].d}</span>
              <ArrowIcon size={22} />
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}

/** The last screen: what I am open to, and two ways to reach me. */
export function HomeContact({ locale }: { locale: V2Locale }) {
  const m = v2Messages(locale);
  const c = m.home.contact;
  return (
    <HomeSection id="contacto" theme="amber" n="05" kicker={c.kicker} title={c.title} className="hm-contact">
      <p className="hm-lead" data-reveal>{c.lead}</p>
      <p className="hm-actions" data-reveal>
        <a className="hm-btn hm-btn--main" href={`mailto:${CONTACT_EMAIL}`} data-boing data-magnetic="6"><MailIcon />{c.write}</a>
        <a className="hm-btn" href={LINKEDIN_URL} target="_blank" rel="noreferrer" data-boing data-magnetic="6">{c.linkedin}<span className="ui-sr"> {m.site.newTab}</span><ArrowIcon /></a>
      </p>
    </HomeSection>
  );
}

