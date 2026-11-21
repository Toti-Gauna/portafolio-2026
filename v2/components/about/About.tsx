import type { CSSProperties } from 'react';
import Link from 'next/link';
import { CONTACT_EMAIL, LINKEDIN_URL } from '@/lib/site';
import es from '@/messages/v2/about/es.json';
import en from '@/messages/v2/about/en.json';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { SITE_PAGES, sitePath } from '@/v2/site';
import { caseCopy } from '../case/copy';
import { CASES, type CaseSlug } from '../case/cases';
import { stampSvg } from '../kit/stamps';
import { PagePager } from '../site/PageOpening';
import { SiteFooter } from '../site/SiteFooter';
import { Button } from '../ui/Button';
import { Chip, RoleBadge } from '../ui/Chip';
import { ArrowIcon, MailIcon } from '../ui/Icons';
import { Constellation, type SkyGroup, type SkyStar } from './Constellation';
import { CopyMail } from './CopyMail';
import { dust, GROUPS, groupOf, kin, lonLat, type Proof, STARS, starSize, yawOfGroup } from './sky';
import { Timeline } from './Timeline';
import { STOPS } from './timeline';

export type AboutCopy = typeof es;
const COPY: Record<V2Locale, AboutCopy> = { es, en };
export const aboutCopy = (locale: V2Locale): AboutCopy => COPY[locale];

/** The three cases a recruiter is sent to first (the approved «Tres casos para mirar»). */
export const FIRST_CASES: CaseSlug[] = ['complia', 'eclipse', 'agentes'];

/**
 * «Sobre mí» of /v2 (lote 7.1). The first screen is the recruiter's sheet — role, languages, the stack I use at work
 * and the way to write to me —; then the story in thirty seconds, the timeline from 2021 to today, the skills as a
 * sky where every star opens its proofs, three cases to start with and the contact. Every fact is the approved
 * record of the published site (journey, skills, «Para reclutadores»).
 */
export function About({ locale }: { locale: V2Locale }) {
  const m = v2Messages(locale), s = m.site, A = aboutCopy(locale);
  const i = SITE_PAGES.findIndex((p) => p.key === 'about'), page = SITE_PAGES[i];
  const href = (path: string) => sitePath(locale, path);
  const caseHref = (slug: CaseSlug) => href(`work/${slug}/`);
  const caseName = (slug: CaseSlug) => caseCopy(locale, slug).title;
  const R = A.sheet.rows;

  // ── the timeline's cards ──
  const tlCards = STOPS.map((st) => {
    const w = A.timeline.stops[st.id];
    return (
      <article key={st.id} className="tl-in" aria-labelledby={`tl-${st.id}`}>
        {st.stamp && <svg className="tl-stamp" viewBox="0 0 240 300" aria-hidden="true" dangerouslySetInnerHTML={{ __html: stampSvg(st.stamp) }} />}
        <div className="tl-text">
          <p className="tl-when">{w.when}</p>
          <h3 id={`tl-${st.id}`}>{w.title}</h3>
          {w.text.map((t) => <p key={t}>{t}</p>)}
          <p className="tl-links">
            {st.cases?.map((c) => <Link key={c} className="ab-link" href={caseHref(c)}>{A.timeline.case}: {caseName(c)}<ArrowIcon size={14} /></Link>)}
            {st.kind === 'job' && <Link className="ab-link" href={href('work/')}>{A.timeline.world}<ArrowIcon size={14} /></Link>}
          </p>
        </div>
      </article>
    );
  });

  // ── the sky ──
  const name = (id: string) => A.sky.stars[id as keyof typeof A.sky.stars].name;
  const proofLink = (p: Proof) => 'case' in p
    ? <Link className="ab-link" href={caseHref(p.case)} style={{ '--c': CASES[p.case].color } as CSSProperties}><i aria-hidden="true" />{caseName(p.case)}<ArrowIcon size={14} /></Link>
    : <Link className="ab-link" href={href(p.page)}><i aria-hidden="true" />{A.sky.pages[p.key as keyof typeof A.sky.pages]}<ArrowIcon size={14} /></Link>;
  const stars: SkyStar[] = STARS.map((st) => {
    const [lon, lat] = lonLat(st), g = groupOf(st.group);
    return { id: st.id, group: st.group, lon, lat, size: starSize(st), hollow: st.proofs.length === 0, color: g.color, name: name(st.id), side: st.side ?? 'r', kin: kin(st.id), proofs: st.proofs.length };
  });
  const groups: SkyGroup[] = GROUPS.map((g) => ({
    id: g.id, name: A.sky.groups[g.id], color: g.color, yaw: yawOfGroup(g.id),
    edges: g.edges.map(([a, b]) => [STARS.findIndex((x) => x.id === a), STARS.findIndex((x) => x.id === b)] as [number, number]),
  }));
  const skyCards = STARS.map((st) => {
    const w = A.sky.stars[st.id as keyof typeof A.sky.stars], g = groupOf(st.group), k = kin(st.id);
    return (
      <article key={st.id} className="sk-card" aria-labelledby={`sk-${st.id}`} style={{ '--c': g.color } as CSSProperties}>
        <p className="sk-group"><i aria-hidden="true" />{A.sky.groups[st.group]}</p>
        <h3 id={`sk-${st.id}`}>{w.name}</h3>
        <ul className="sk-from">{st.from.map((f) => <li key={f} data-f={f}>{A.sky.from[f]}</li>)}</ul>
        <p className="sk-note">{w.note}</p>
        {st.proofs.length > 0 && (
          <div className="sk-proofs">
            <h4>{A.sky.proofs} · {st.proofs.length}</h4>
            <ul>{st.proofs.map((p) => <li key={'case' in p ? p.case : p.page}>{proofLink(p)}</li>)}</ul>
          </div>
        )}
        {k.length > 0 && (
          <div className="sk-kin">
            <h4>{A.sky.kin}</h4>
            <ul>{k.map((id) => <li key={id}><button type="button" data-star-go={id}>{name(id)}</button></li>)}</ul>
          </div>
        )}
      </article>
    );
  });

  const index: [string, string][] = [['historia', A.index.story], ['recorrido', A.index.timeline], ['capacidades', A.index.sky], ['casos', A.index.cases], ['contacto', A.index.contact]];
  const nn = (n: number) => String(n).padStart(2, '0');

  return (
    <>
      <main id="main" className="v2-main ab" style={{ '--from': page.from, '--to': page.to } as CSSProperties}>
        {/* the first screen: who, which languages, which stack, how to write */}
        <section className="ab-open" aria-labelledby="st-title">
          <div className="ab-intro">
            <p className="st-kicker"><b aria-hidden="true">{nn(i + 1)}</b><span>{s.pages.about.t}</span></p>
            <h1 id="st-title">{s.pages.about.title}</h1>
            <p className="st-lead ab-lead">{A.lead}</p>
            <div className="ab-actions">
              <Button href={`mailto:${CONTACT_EMAIL}`} iconStart={<MailIcon />} magnetic={6}>{A.contact.write}</Button>
              <CopyMail email={CONTACT_EMAIL} label={A.contact.copy} done={A.contact.copied} />
              <Button href={LINKEDIN_URL} variant="secondary" external externalLabel={s.newTab}>{A.contact.linkedin}</Button>
            </div>
            <p className="ab-mail" data-mail>{CONTACT_EMAIL}</p>
          </div>
          <div className="ab-side">
            <aside className="ab-sheet" aria-labelledby="ab-sheet-h">
              <h2 id="ab-sheet-h" className="ab-k">{A.sheet.title}</h2>
              <div className="ab-role"><span className="ui-sr">{R.role.k}: </span><RoleBadge level={A.sheet.level} role={R.role.v} /></div>
              <dl className="ab-facts">
                <div><dt>{R.langs.k}</dt><dd>{R.langs.v}</dd></div>
                <div><dt>{R.where.k}</dt><dd>{R.where.v}</dd></div>
              </dl>
              <div className="ab-stack">
                <h3>{A.sheet.stack}</h3>
                <ul>{A.sheet.stackItems.map((t) => <li key={t}><Chip>{t}</Chip></li>)}</ul>
              </div>
            </aside>
            <aside className="ab-more" aria-label={`${A.sheet.title}: ${R.today.k}`}>
              <dl className="ab-facts">
                <div><dt>{R.today.k}</dt><dd>{R.today.v}</dd></div>
                <div><dt>{R.before.k}</dt><dd>{R.before.v}</dd></div>
                <div><dt>{R.school.k}</dt><dd>{R.school.v}</dd></div>
                <div><dt>{A.sheet.how.k}</dt><dd>{A.sheet.how.v} <Link className="ab-link" href={href('como-trabajo/')}>{A.sheet.how.cta}<ArrowIcon size={14} /></Link></dd></div>
              </dl>
            </aside>
          </div>
        </section>

        <nav className="ab-index" aria-label={A.index.label}>
          <ol>{index.map(([id, t], k) => <li key={id}><a href={`#${id}`}><b aria-hidden="true">{nn(k + 1)}</b>{t}</a></li>)}</ol>
        </nav>

        <section className="ab-sec" id="historia" aria-labelledby="ab-story-h">
          <header className="ab-head" data-reveal>
            <p className="ab-k">{A.story.k}</p>
            <h2 id="ab-story-h">{A.story.title}</h2>
          </header>
          <ol className="ab-story">
            {A.story.beats.map((b, k) => (
              <li key={b} data-reveal style={{ '--k': k } as CSSProperties}>
                <span className="ab-clock" aria-hidden="true">0:{nn(Math.round((k * 30) / A.story.beats.length))}</span>
                <p>{b}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="ab-sec" id="recorrido" aria-labelledby="ab-tl-h">
          <header className="ab-head" data-reveal>
            <p className="ab-k">{A.timeline.k}</p>
            <h2 id="ab-tl-h">{A.timeline.title}</h2>
            <p className="ab-sub">{A.timeline.lead}</p>
          </header>
          <Timeline words={A.timeline.stops} cards={tlCards} labels={A.timeline} />
        </section>

        <section className="ab-sec" id="capacidades" aria-labelledby="ab-sky-h">
          <header className="ab-head" data-reveal>
            <p className="ab-k">{A.sky.k}</p>
            <h2 id="ab-sky-h">{A.sky.title}</h2>
            <p className="ab-sub">{A.sky.lead}</p>
          </header>
          <Constellation stars={stars} groups={groups} dust={dust()} cards={skyCards} labels={A.sky} />
          <details className="ab-list">
            <summary>{A.sky.list}</summary>
            {GROUPS.map((g) => (
              <div key={g.id} className="ab-list-g" style={{ '--c': g.color } as CSSProperties}>
                <h3><i aria-hidden="true" />{A.sky.groups[g.id]}</h3>
                <ul>
                  {STARS.filter((st) => st.group === g.id).map((st) => (
                    <li key={st.id}>
                      <b>{name(st.id)}</b>
                      <span>{st.from.map((f) => A.sky.from[f]).join(' · ')}</span>
                      {st.proofs.length > 0 && <span>{st.proofs.length} {st.proofs.length === 1 ? A.sky.proofCount.one : A.sky.proofCount.other}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </details>
        </section>

        <section className="ab-sec" id="casos" aria-labelledby="ab-cases-h">
          <header className="ab-head" data-reveal>
            <p className="ab-k">{A.cases.k}</p>
            <h2 id="ab-cases-h">{A.cases.title}</h2>
          </header>
          <ul className="ab-cases">
            {FIRST_CASES.map((c) => (
              <li key={c} data-reveal>
                <Link className="ab-case" href={caseHref(c)} style={{ '--c': CASES[c].color } as CSSProperties} data-boing>
                  <b>{caseName(c)}</b>
                  <span>{A.cases.items[c as keyof typeof A.cases.items]}</span>
                  <em>{A.cases.cta}<ArrowIcon size={14} /></em>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* the canonical contact block: the header's «Contacto» lands here */}
        <section className="ab-sec ab-contact" id="contacto" aria-labelledby="contacto-h">
          <header className="ab-head">
            <p className="ab-k">{s.contact}</p>
            <h2 id="contacto-h">{A.contact.title}</h2>
            <p className="ab-sub">{A.contact.lead}</p>
          </header>
          <p className="st-mail">{CONTACT_EMAIL}</p>
          <div className="v2-actions">
            <Button href={`mailto:${CONTACT_EMAIL}`} iconStart={<MailIcon />}>{s.write}</Button>
            <Button href={LINKEDIN_URL} variant="secondary" external externalLabel={s.newTab}>LinkedIn</Button>
          </div>
        </section>

        <PagePager locale={locale} page="about" />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
