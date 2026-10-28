import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL, asset } from '@/lib/site';
import { CASE_SLUGS, LAB, WORK_SHOT, WORK_SHOT_800, type CaseSlug } from '@/lib/cases';
import { PILLARS, SKILL_ROWS, SYSTEM_FLOW, WORK_INSIDE } from '@/lib/home';
import { CONTACT_HREF, PAGES } from '@/lib/nav';
import { BOOKS } from '@/lib/business';
import type { ArchCopy } from '@/lib/diagrams/types';
import { Reveal } from '../Reveal';
import { Diagram } from '../diagrams/Diagram';
import { TechIcon } from '../diagrams/TechIcon';
import { PillarArt } from '../home/PillarArt';
import { MethodCycle } from '../home/MethodCycle';
import { InView } from '../diagrams/InView';
import { MethodIcon } from '../MethodIcon';
import { AgentIcon, type AgentId } from '../AgentIcon';
import { HubArt } from '../home/HubArt';
import '../sections.css';
import '../home/home.css';

type Item = { when: string; title: string; text: string };
type Step = { name: string; short: string; text: string; example: string };
type Point = { title: string; text: string };

/** 1: the section is the page (its title is the page's h1). 2: one section of a page. */
type Level = 1 | 2;

function Head({ id, label, title, lead, level = 2 }: { id: string; label: string; title: string; lead?: string; level?: Level }) {
  const H = level === 1 ? 'h1' : 'h2';
  return (
    <header className={`sec__head${level === 1 ? ' sec__head--page' : ''}`}>
      <p className="label">{label}</p>
      <H id={id} className={level === 1 ? 'page-title' : 'sec__title'}>{title}</H>
      {lead && <p className="sec__lead">{lead}</p>}
    </header>
  );
}

/** The opening of a page that holds several sections: label, h1 and a lead. */
export function PageHead({ label, title, lead }: { label: string; title: string; lead: string }) {
  return (
    <header className="page-hero container-x">
      <p className="label">{label}</p>
      <h1 className="page-title">{title}</h1>
      <p className="page-hero__lead">{lead}</p>
    </header>
  );
}

const Ext = ({ href, children, label }: { href: string; children: React.ReactNode; label: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">{children}<span className="sr-only"> ({label})</span></a>
);

export function WhatIDo() {
  const t = useTranslations('what');
  return (
    <section id="que-hago" className="sec container-x" aria-labelledby="h-que-hago">
      <Head id="h-que-hago" label={t('label')} title={t('title')} lead={t('lead')} />
      <ul className="pillars">
        {PILLARS.map((p, i) => (
          <InView as="li" live key={p.id} className="pillar" style={{ '--o': i } as CSSProperties}>
            <PillarArt id={p.id} />
            <h3 className="pillar__t">{t(`items.${p.id}.t`)}</h3>
            <p className="pillar__d">{t(`items.${p.id}.d`)}</p>
            <Link className="pillar__proof" href={`/proyectos/${p.slug}`}><span className="label">{t('see')}</span> {t(`items.${p.id}.proof`)} →</Link>
          </InView>
        ))}
      </ul>
    </section>
  );
}

export function Journey({ level = 2 }: { level?: Level } = {}) {
  const t = useTranslations('journey');
  const items = t.raw('items') as Item[];
  return (
    <section id="recorrido" className={`sec container-x${level === 1 ? ' sec--page' : ''}`} aria-labelledby="h-recorrido">
      <Head id="h-recorrido" label={t('label')} title={t('title')} lead={t('lead')} level={level} />
      <ol className="journey">
        {items.map((it, i) => (
          <Reveal as="li" key={i} className="journey__item">
            <svg className="journey__fork" viewBox="0 0 40 40" aria-hidden="true"><path d="M8 0V40" /><path d="M8 6C8 22 30 14 30 30" pathLength={1} /><circle cx="30" cy="30" r="5" /></svg>
            <p className="journey__when">{it.when}</p>
            <div>
              <h3 className="journey__title">{it.title}</h3>
              <p className="journey__text">{it.text}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

export function Work({ level = 2 }: { level?: Level } = {}) {
  const t = useTranslations('work');
  const tag = (s: string) => <p className="status">{s}</p>;
  const link = (slug: CaseSlug) => <Link className="card-link" href={`/proyectos/${slug}`}>{t('more')} →</Link>;
  return (
    <section id="trabajo" className={`sec container-x${level === 1 ? ' sec--page' : ''}`} aria-labelledby="h-trabajo">
      <Head id="h-trabajo" label={t('label')} title={t('title')} lead={t('lead')} level={level} />
      <div className="work">
        {(['complia', 'tuenti', 'handyx', 'eclipse'] as const).map((k) => (
          <Reveal as="article" key={k} className="work__card">
            {WORK_SHOT[k] && (
              <img
                className="work__shot" src={asset(WORK_SHOT[k])} alt={t(`cards.${k}.shotAlt`)} width={1600} height={1000} loading="lazy" decoding="async"
                {...(WORK_SHOT_800[k] ? { srcSet: `${asset(WORK_SHOT_800[k])} 800w, ${asset(WORK_SHOT[k])} 1600w`, sizes: '(min-width: 1200px) 552px, (min-width: 760px) 46vw, 92vw' } : {})}
              />
            )}
            {tag(t(`cards.${k}.status`))}
            <h3 className="work__name">{t(`cards.${k}.name`)}</h3>
            <p className="work__role">{t(`cards.${k}.role`)}</p>
            <p>{t(`cards.${k}.text`)}</p>
            {k === 'tuenti' && <p className="note">{t('tuentiNote')}</p>}
            <p className="work__inside"><span className="label">{t('inside.label')}</span>{WORK_INSIDE[k].map((x) => <span key={x} className="chip">{t(`inside.${x}`)}</span>)}</p>
            {link(k)}
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Lab({ level = 2 }: { level?: Level } = {}) {
  const t = useTranslations('lab');
  const nt = useTranslations('contact')('newTab');
  return (
    <section id="laboratorio" className={`sec container-x${level === 1 ? ' sec--page' : ''}`} aria-labelledby="h-laboratorio">
      <Head id="h-laboratorio" label={t('label')} title={t('title')} lead={t('lead')} level={level} />
      <ul className="lab">
        {LAB.map((it) => (
          <Reveal as="li" key={it.id} className="lab__item">
            <img className="lab__shot" src={asset(`/media/lab/${it.id}.webp`)} alt={t(`items.${it.id}.alt`)} width={960} height={600} loading="lazy" decoding="async" />
            <p className="status">{t(`items.${it.id}.status`)}</p>
            <h3 className="lab__name">{t(`items.${it.id}.name`)}</h3>
            <p>{t(`items.${it.id}.text`)}</p>
            <p className="lab__links">
              {(CASE_SLUGS as readonly string[]).includes(it.id) && <Link href={`/proyectos/${it.id}`}>{t('deep')} →</Link>}
              {'href' in it && <Ext href={it.href} label={nt}>{t('open')} ↗</Ext>}
              <Ext href={it.code} label={nt}>{t('view')} ↗</Ext>
            </p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

export function Method({ level = 2 }: { level?: Level } = {}) {
  const t = useTranslations('method');
  const b = useTranslations('business');
  const steps = t.raw('steps') as Step[];
  return (
    <section id="metodo" className={`sec container-x${level === 1 ? ' sec--page' : ''}`} aria-labelledby="h-metodo">
      <Head id="h-metodo" label={t('label')} title={t('title')} lead={t('lead')} level={level} />
      <MethodCycle names={steps.map((s) => s.short)} caption={t('cycle')} />
      <ol className="method">
        {steps.map((s, i) => (
          <Reveal as="li" key={i} className="method__step">
            <MethodIcon n={(i + 1) as 1 | 2 | 3 | 4 | 5 | 6} />
            <h3 className="method__name"><span className="method__n">{String(i + 1).padStart(2, '0')}</span> {s.name}</h3>
            <p>{s.text}</p>
            <p className="method__ex">{s.example}</p>
          </Reveal>
        ))}
      </ol>
      <div className="reads">
        <h3 className="reads__title">{t('readsTitle')}</h3>
        <ul className="reads__books">
          {BOOKS.map((id) => (
            <li key={id}>
              <Link href={`/negocio#${id}`} className="reads__book">
                <span className="label">{b(`books.${id}.kicker`)}</span>
                <b>{b(`books.${id}.title`)}</b>
                <span className="reads__idea">{b(`books.${id}.idea`)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="reads__more"><Link className="card-link" href="/negocio">{t('readsMore')} →</Link></p>
        <p className="note">{b('reading')}</p>
      </div>
    </section>
  );
}

export function System({ level = 2 }: { level?: Level } = {}) {
  const t = useTranslations('system');
  const u = useTranslations('caseUi');
  const points = t.raw('points') as Point[];
  return (
    <section id="sistema" className={`sec container-x${level === 1 ? ' sec--page' : ''}`} aria-labelledby="h-sistema">
      <Head id="h-sistema" label={t('label')} title={t('title')} lead={t('lead')} level={level} />
      <Diagram spec={SYSTEM_FLOW} copy={t.raw('flow') as ArchCopy} ui={{ asText: u('asText'), legend: u('legend') }} className="system__flow" />
      {(CASE_SLUGS as readonly string[]).includes('agentes') && <p className="system__deep"><Link className="card-link" href="/proyectos/agentes">{t('deep')} →</Link></p>}
      <h3 className="sub-title">{t('agentsTitle')}</h3>
      <ul className="agents">
        {(t.raw('agents') as { id: AgentId; name: string; role: string }[]).map((a) => (
          <Reveal as="li" key={a.id} className="agent">
            <AgentIcon id={a.id} />
            <div>
              <p className="agent__name">{a.name}</p>
              <p className="agent__role">{a.role}</p>
            </div>
          </Reveal>
        ))}
      </ul>
      <h3 className="sub-title">{t('principlesTitle')}</h3>
      <ol className="system">
        {points.map((p, i) => (
          <Reveal as="li" key={i} className="system__item">
            <span className="system__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="system__title">{p.title}</h3>
              <p>{p.text}</p>
            </div>
          </Reveal>
        ))}
      </ol>
      <p className="note system__limits">{t('limits')}</p>
    </section>
  );
}

export function Skills({ level = 2 }: { level?: Level } = {}) {
  const t = useTranslations('skills');
  const cols = ['work', 'own', 'study'] as const;
  return (
    <section id="capacidades" className={`sec container-x${level === 1 ? ' sec--page' : ''}`} aria-labelledby="h-capacidades">
      <Head id="h-capacidades" label={t('label')} title={t('title')} lead={t('lead')} level={level} />
      <InView className="ledger">
        <table className="ledger__table">
          <thead>
            <tr><th scope="col">{t('tech')}</th>{cols.map((c) => <th key={c} scope="col" className="ledger__col">{t(`cols.${c}`)}</th>)}</tr>
          </thead>
          <tbody>
            {SKILL_ROWS.map((r, i) => (
              <tr key={r.id} style={{ '--o': i } as CSSProperties}>
                <th scope="row">
                  <span className="ledger__tech">
                    <TechIcon id={r.id} className="ledger__icon" />
                    <span><b>{t(`rows.${r.id}.name`)}</b><span className="ledger__note">{t(`rows.${r.id}.note`)}</span></span>
                  </span>
                </th>
                {cols.map((c) => (
                  <td key={c} className="ledger__cell" data-col={c} data-on={r.at.includes(c) || undefined}>
                    {r.at.includes(c) ? <><span className="ledger__dot" aria-hidden="true" /><span className="ledger__lab">{t(`cols.${c}`)}</span></> : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </InView>
      <div className="also">
        <h3 className="sub-title">{t('also')}</h3>
        <ul className="also__list">{(t.raw('alsoItems') as string[]).map((x) => <li key={x}>{x}</li>)}</ul>
      </div>
    </section>
  );
}

export function About({ level = 2 }: { level?: Level } = {}) {
  const t = useTranslations('about');
  return (
    <section id="sobre-mi" className={`sec container-x${level === 1 ? ' sec--page' : ''}`} aria-labelledby="h-sobre-mi">
      <Head id="h-sobre-mi" label={t('label')} title={t('title')} level={level} />
      <div className="about">{(t.raw('paragraphs') as string[]).map((p) => <p key={p}>{p}</p>)}</div>
    </section>
  );
}

export function Contact({ level = 2 }: { level?: Level } = {}) {
  const t = useTranslations('contact');
  return (
    <section id="contacto" className={`sec sec--contact container-x${level === 1 ? ' sec--page' : ''}`} aria-labelledby="h-contacto" data-contact="">
      <Head id="h-contacto" label={t('label')} title={t('title')} lead={t('lead')} level={level} />
      <div className="contact">
        <a className="btn btn-primary" href={`mailto:${CONTACT_EMAIL}`}>{t('email')}</a>
        <ul className="contact__list">
          <li><span className="label">{t('emailLabel')}</span> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
          <li><span className="label">{t('linkedin')}</span> <Ext href={LINKEDIN_URL} label={t('newTab')}>linkedin.com/in/ignacio-emanuel-gauna</Ext></li>
          <li><span className="label">{t('github')}</span> <Ext href={GITHUB_URL} label={t('newTab')}>github.com/Toti-Gauna</Ext></li>
        </ul>
      </div>
    </section>
  );
}

/** Home: one card per page (a question, a short brief, a small drawing from that page, a real link). */
export function Hub() {
  const t = useTranslations('hub');
  const n = useTranslations('nav');
  return (
    <section id="explorar" className="sec container-x" aria-labelledby="h-explorar">
      <Head id="h-explorar" label={t('label')} title={t('title')} />
      <ul className="hub">
        {PAGES.map((p, i) => (
          <li key={p.key} className={`hub__card hub__card--${p.key}`}>
            <HubArt id={p.key} />
            <div className="hub__body">
              <p className="label hub__n"><span>{String(i + 1).padStart(2, '0')}</span> {n(`pages.${p.key}.t`)}</p>
              <h3 className="hub__q">{t(`cards.${p.key}.q`)}</h3>
              <p className="hub__d">{t(`cards.${p.key}.d`)}</p>
              <Link className="hub__more" href={p.href} aria-label={`${t('more')}: ${n(`pages.${p.key}.t`)}`}>
                {t('more')} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Home: a short contact block (the full one, with every channel, is on «Sobre mí»). */
export function HomeContact() {
  const t = useTranslations('contact');
  const h = useTranslations('hub');
  return (
    <section id="contacto" className="sec sec--contact container-x home-contact" aria-labelledby="h-contacto" data-contact="">
      <Head id="h-contacto" label={t('label')} title={t('title')} lead={h('contactLead')} />
      <div className="home-contact__actions">
        <a className="btn btn-primary" href={`mailto:${CONTACT_EMAIL}`}>{t('email')}</a>
        <a className="btn btn-ghost" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn<span className="sr-only"> ({t('newTab')})</span></a>
        <Link className="card-link" href={CONTACT_HREF}>{h('allChannels')} →</Link>
      </div>
    </section>
  );
}

/** Every page ends here: the full sitemap (pages and cases) and the contact channels. */
export function Footer() {
  const t = useTranslations('footer');
  const n = useTranslations('nav');
  const c = useTranslations('contact');
  const cases = useTranslations('cases');
  return (
    <footer className="foot">
      <div className="container-x foot__grid">
        <nav className="foot__col" aria-labelledby="foot-pages">
          <h2 id="foot-pages" className="label">{t('sitemap')}</h2>
          <ul>
            <li><Link href="/">{n('home')}</Link></li>
            {PAGES.map((p) => <li key={p.key}><Link href={p.href}>{n(`pages.${p.key}.t`)}</Link></li>)}
          </ul>
        </nav>
        <nav className="foot__col foot__col--cases" aria-labelledby="foot-cases">
          <h2 id="foot-cases" className="label">{t('cases')}</h2>
          <ul>{CASE_SLUGS.map((s) => <li key={s}><Link href={`/proyectos/${s}`}>{cases(`${s}.title`)}</Link></li>)}</ul>
        </nav>
        <div className="foot__col">
          <h2 className="label">{t('contact')}</h2>
          <ul>
            <li><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
            <li><Ext href={LINKEDIN_URL} label={c('newTab')}>LinkedIn ↗</Ext></li>
            <li><Ext href={GITHUB_URL} label={c('newTab')}>GitHub ↗</Ext></li>
          </ul>
        </div>
      </div>
      <div className="container-x foot__base">
        <p>{t('text')}</p>
        <a href="#contenido">{t('top')}</a>
      </div>
    </footer>
  );
}
