import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL, asset } from '@/lib/site';
import { LAB, type CaseSlug } from '@/lib/cases';
import { Reveal } from '../Reveal';
import { MethodIcon } from '../MethodIcon';
import { AgentIcon, type AgentId } from '../AgentIcon';
import '../sections.css';

type Item = { when: string; title: string; text: string };
type Step = { name: string; text: string; example: string };
type Point = { title: string; text: string };

function Head({ id, label, title, lead }: { id: string; label: string; title: string; lead?: string }) {
  return (
    <header className="sec__head">
      <p className="label">{label}</p>
      <h2 id={id} className="sec__title">{title}</h2>
      {lead && <p className="sec__lead">{lead}</p>}
    </header>
  );
}

const Ext = ({ href, children, label }: { href: string; children: React.ReactNode; label: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">{children}<span className="sr-only"> ({label})</span></a>
);

export function Journey() {
  const t = useTranslations('journey');
  const items = t.raw('items') as Item[];
  return (
    <section id="recorrido" className="sec container-x" aria-labelledby="h-recorrido">
      <Head id="h-recorrido" label={t('label')} title={t('title')} lead={t('lead')} />
      <ol className="journey">
        {items.map((it, i) => (
          <Reveal as="li" key={i} className="journey__item">
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

export function Work() {
  const t = useTranslations('work');
  const tag = (s: string) => <p className="status">{s}</p>;
  const link = (slug: CaseSlug) => <Link className="card-link" href={`/proyectos/${slug}`}>{t('more')} →</Link>;
  return (
    <section id="trabajo" className="sec container-x" aria-labelledby="h-trabajo">
      <Head id="h-trabajo" label={t('label')} title={t('title')} lead={t('lead')} />
      <div className="work">
        {(['complia', 'tuenti', 'handyx', 'eclipse'] as const).map((k) => (
          <Reveal as="article" key={k} className="work__card">
            {tag(t(`cards.${k}.status`))}
            <h3 className="work__name">{t(`cards.${k}.name`)}</h3>
            <p>{t(`cards.${k}.text`)}</p>
            {k === 'tuenti' && <p className="note">{t('tuentiNote')}</p>}
            {link(k)}
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Lab() {
  const t = useTranslations('lab');
  const nt = useTranslations('contact')('newTab');
  return (
    <section id="laboratorio" className="sec container-x" aria-labelledby="h-laboratorio">
      <Head id="h-laboratorio" label={t('label')} title={t('title')} lead={t('lead')} />
      <ul className="lab">
        {LAB.map((it) => (
          <Reveal as="li" key={it.id} className="lab__item">
            <img className="lab__shot" src={asset(`/media/lab/${it.id}.webp`)} alt={t(`items.${it.id}.alt`)} width={960} height={600} loading="lazy" decoding="async" />
            <p className="status">{t(`items.${it.id}.status`)}</p>
            <h3 className="lab__name">{t(`items.${it.id}.name`)}</h3>
            <p>{t(`items.${it.id}.text`)}</p>
            <p className="lab__links">
              {'page' in it && <Link href={`/proyectos/${it.page}`}>{t('open')} →</Link>}
              {'href' in it && !('page' in it) && <Ext href={it.href} label={nt}>{t('open')} ↗</Ext>}
              <Ext href={it.code} label={nt}>{t('view')} ↗</Ext>
            </p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

export function Method() {
  const t = useTranslations('method');
  const steps = t.raw('steps') as Step[];
  const reads = t.raw('reads') as { title: string; state: string }[];
  return (
    <section id="metodo" className="sec container-x" aria-labelledby="h-metodo">
      <Head id="h-metodo" label={t('label')} title={t('title')} lead={t('lead')} />
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
        <ul className="reads__list">
          {reads.map((r) => <li key={r.title}><span>{r.title}</span> <span className="status">{r.state}</span></li>)}
        </ul>
        <p className="note">{t('readsNote')}</p>
      </div>
    </section>
  );
}

export function System() {
  const t = useTranslations('system');
  const points = t.raw('points') as Point[];
  return (
    <section id="sistema" className="sec container-x" aria-labelledby="h-sistema">
      <Head id="h-sistema" label={t('label')} title={t('title')} lead={t('lead')} />
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

export function Skills() {
  const t = useTranslations('skills');
  return (
    <section id="capacidades" className="sec container-x" aria-labelledby="h-capacidades">
      <Head id="h-capacidades" label={t('label')} title={t('title')} lead={t('lead')} />
      <div className="skills">
        {(['pro', 'own', 'exploring'] as const).map((k) => (
          <Reveal key={k} className="skills__col">
            <h3 className="skills__title">{t(`layers.${k}.title`)}</h3>
            <ul>{(t.raw(`layers.${k}.items`) as string[]).map((s) => <li key={s}>{s}</li>)}</ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function About() {
  const t = useTranslations('about');
  return (
    <section id="sobre-mi" className="sec container-x" aria-labelledby="h-sobre-mi">
      <Head id="h-sobre-mi" label={t('label')} title={t('title')} />
      <div className="about">{(t.raw('paragraphs') as string[]).map((p) => <p key={p}>{p}</p>)}</div>
    </section>
  );
}

export function Contact() {
  const t = useTranslations('contact');
  return (
    <section id="contacto" className="sec sec--contact container-x" aria-labelledby="h-contacto">
      <Head id="h-contacto" label={t('label')} title={t('title')} lead={t('lead')} />
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

export function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="foot container-x">
      <p>{t('text')}</p>
      <a href="#inicio">{t('top')}</a>
    </footer>
  );
}
