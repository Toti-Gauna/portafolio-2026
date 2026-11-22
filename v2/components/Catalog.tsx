import type { ReactNode } from 'react';
import { BASE_PATH, asset } from '@/lib/site';
import { LAYERS, tokens } from '@/v2/tokens';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { TopBar } from './TopBar';
import { trailerHref } from './video/films';
import { Button, IconButton } from './ui/Button';
import { Chip, Kbd, LayerChip, RoleBadge } from './ui/Chip';
import { GlassCard, Panel, SectionHeading, Stat } from './ui/Card';
import { Checkbox, Segmented, Select, Switch, TextArea, TextField } from './ui/Form';
import { ArrowIcon, MailIcon, MenuIcon, PlayIcon, SoundIcon } from './ui/Icons';
import { Breadcrumbs, Disclosure, LinkArrow, NavTabs, Pager } from './ui/Nav';
import { STATUSES, StatusBadge, type StatusKey } from './ui/Status';

/** Lote 1.3: the catalogue of base components, every one live and keyboard-operable. */

const TECH = ['TypeScript', 'React', 'Next.js', 'Node.js', 'RAG', 'Playwright'];

function Block({ id, n, title, text, children }: { id: string; n: string; title: string; text: string; children: ReactNode }) {
  return (
    <section className="v2-sec" id={id} aria-labelledby={`${id}-h`}>
      <SectionHeading id={`${id}-h`} n={n} title={title} text={text} />
      {children}
    </section>
  );
}

function Specimen({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`cat-spec${wide ? ' cat-spec--wide' : ''}`}>
      <p className="v2-label">{label}</p>
      <div className="cat-spec-row">{children}</div>
    </div>
  );
}

export function Catalog({ locale }: { locale: V2Locale }) {
  const m = v2Messages(locale);
  const c = m.catalog;
  const site = (p = '') => `${BASE_PATH}/${locale}/${p}`;
  const cases = (slug: string) => site(`proyectos/${slug}/`);
  const t = tokens.layer;
  return (
    <>
      <TopBar locale={locale} page="components" />
      <main id="main" className="v2-main">
        <div className="v2-intro">
          <p className="v2-label">{c.intro.kicker}</p>
          <h1 className="cat-title">{c.intro.title}</h1>
          <p className="v2-sec-text">{c.intro.text}</p>
        </div>

        <Block id="botones" n="01" title={c.buttons.title} text={c.buttons.text}>
          <div className="cat-grid">
            <Specimen label={c.buttons.variants} wide>
              <Button href={asset(trailerHref(locale))} iconStart={<PlayIcon />}>{c.buttons.primary}</Button>
              <Button href={site()} variant="secondary" iconEnd={<ArrowIcon />}>{c.buttons.secondary}</Button>
              <Button href={cases('complia')} variant="quiet" iconEnd={<ArrowIcon />}>{c.buttons.quiet}</Button>
            </Specimen>
            <Specimen label={c.buttons.sizes}>
              <Button size="sm" iconStart={<MailIcon />}>{c.buttons.small}</Button>
              <Button size="sm" variant="secondary">{c.buttons.small}</Button>
            </Specimen>
            <Specimen label={c.states.disabled}>
              <Button disabled>{c.buttons.send}</Button>
              <Button variant="secondary" disabled>{c.buttons.send}</Button>
            </Specimen>
            <Specimen label={c.buttons.icon}>
              <IconButton label={m.ui.menu}><MenuIcon /></IconButton>
              <IconButton label={m.ui.sound.off} pressed={false}><SoundIcon on={false} /></IconButton>
              <IconButton label={m.ui.sound.on} pressed><SoundIcon on /></IconButton>
            </Specimen>
          </div>
        </Block>

        <Block id="chips" n="02" title={c.chips.title} text={c.chips.text}>
          <div className="cat-grid">
            <Specimen label={c.chips.tech} wide>
              {TECH.map((x) => <Chip key={x}>{x}</Chip>)}
            </Specimen>
            <Specimen label={c.chips.layers} wide>
              {LAYERS.map((id, i) => <LayerChip key={id} id={id} n={i + 1}>{m.layers[id]}</LayerChip>)}
            </Specimen>
            <Specimen label={c.chips.keys}>
              <span className="cat-key"><Kbd>T</Kbd>{c.chips.keyItems.trailer}</span>
              <span className="cat-key"><Kbd>W</Kbd>{c.chips.keyItems.work}</span>
              <span className="cat-key"><Kbd>?</Kbd>{c.chips.keyItems.help}</span>
            </Specimen>
            <Specimen label="Sr">
              <RoleBadge level={m.hero.level} role={m.hero.role} />
            </Specimen>
          </div>
        </Block>

        <Block id="estados" n="03" title={c.status.title} text={c.status.text}>
          <ul className="cat-statuses">
            {(Object.keys(STATUSES) as StatusKey[]).map((k) => <li key={k}><StatusBadge status={k} label={m.ui.status[k]} /></li>)}
          </ul>
        </Block>

        <Block id="tarjetas" n="04" title={c.cards.title} text={c.cards.text}>
          <div className="cat-cards">
            <GlassCard layer="code" title={c.cards.items.complia.title} href={cases('complia')} meta={c.cards.items.complia.meta} status="interna" statusLabel={m.ui.status.interna} cta={c.cards.cta}>
              <p>{c.cards.items.complia.text}</p>
            </GlassCard>
            <GlassCard layer="ship" title={c.cards.items.eclipse.title} href={cases('eclipse')} meta={c.cards.items.eclipse.meta} status="desarrollo" statusLabel={m.ui.status.desarrollo} cta={c.cards.cta}>
              <p>{c.cards.items.eclipse.text}</p>
            </GlassCard>
            <GlassCard layer="agents" title={c.cards.items.volta.title} href={cases('volta')} meta={c.cards.items.volta.meta} status="demo" statusLabel={m.ui.status.demo} cta={c.cards.cta}>
              <p>{c.cards.items.volta.text}</p>
            </GlassCard>
            <GlassCard layer="tests" title={c.cards.items.supernova.title} href={cases('supernova')} meta={c.cards.items.supernova.meta} status="prototipo" statusLabel={m.ui.status.prototipo} cta={c.cards.cta}>
              <p>{c.cards.items.supernova.text}</p>
            </GlassCard>
          </div>
          <div className="cat-grid">
            <Specimen label={c.cards.stats} wide>
              <Stat value="1.374" label={c.cards.statItems.tests} layer="tests" />
              <Stat value="11" label={c.cards.statItems.agents} layer="agents" />
              <Stat value="2021" label={c.cards.statItems.since} layer="plan" />
            </Specimen>
            <Specimen label={c.cards.panel.title} wide>
              <Panel layer="ship"><p>{c.cards.panel.text}</p></Panel>
            </Specimen>
          </div>
        </Block>

        <Block id="formularios" n="05" title={c.forms.title} text={c.forms.text}>
          <Panel className="cat-form-panel">
            {/* method="dialog" outside a <dialog>: the sample never navigates or sends */}
            <form className="cat-form" method="dialog" aria-describedby="cat-form-note">
              <p className="v2-label" id="cat-form-note">{c.forms.sample}</p>
              <TextField id="f-name" label={c.forms.name.label} hint={c.forms.name.hint} autoComplete="name" />
              <TextField id="f-email" type="email" label={c.forms.email.label} defaultValue={c.forms.email.example} error={c.forms.email.error} autoComplete="email" />
              <Select id="f-topic" label={c.forms.topic.label} options={Object.entries(c.forms.topic.options).map(([value, label]) => ({ value, label }))} />
              <TextArea id="f-message" label={c.forms.message.label} hint={c.forms.message.hint} rows={4} />
              <Segmented name="f-format" legend={c.forms.format.legend} options={[{ value: 'h', label: c.forms.format.h }, { value: 'v', label: c.forms.format.v }]} />
              <Checkbox id="f-copy" label={c.forms.copy} />
              <Switch id="f-sound" label={c.forms.sound} />
              <div><Button type="submit" iconEnd={<ArrowIcon />}>{c.forms.send}</Button></div>
            </form>
          </Panel>
        </Block>

        <Block id="navegacion" n="06" title={c.nav.title} text={c.nav.text}>
          <div className="cat-grid">
            <Specimen label={c.nav.tabs} wide>
              <NavTabs
                label={c.nav.tabs}
                items={[
                  { href: '#navegacion', label: c.nav.tabItems.home, color: t['code-from'], current: true },
                  { href: '#navegacion', label: c.nav.tabItems.work, color: t['plan-from'] },
                  { href: '#navegacion', label: c.nav.tabItems.how, color: t['tests-from'] },
                  { href: '#navegacion', label: c.nav.tabItems.brand, color: t['agents-from'] },
                  { href: '#navegacion', label: c.nav.tabItems.business, color: t['ship-from'] },
                  { href: '#navegacion', label: c.nav.tabItems.about, color: t['agents-to'] },
                ]}
              />
            </Specimen>
            <Specimen label={c.nav.crumbs} wide>
              <Breadcrumbs label={m.ui.breadcrumb} items={[{ href: site(), label: c.nav.tabItems.home }, { href: site('trabajo/'), label: c.nav.tabItems.work }, { label: c.cards.items.complia.title }]} />
            </Specimen>
            <Specimen label={c.nav.pager} wide>
              <Pager label={c.nav.pager} prev={{ href: cases('tuenti'), kicker: c.nav.prev, title: c.nav.prevCase }} next={{ href: cases('eclipse'), kicker: c.nav.next, title: c.nav.nextCase }} />
            </Specimen>
            <Specimen label={c.nav.disclosure} wide>
              <Disclosure summary={c.nav.summary}><p>{c.nav.body}</p></Disclosure>
              <LinkArrow href={site('trabajo/')}>{c.nav.link}</LinkArrow>
            </Specimen>
          </div>
        </Block>
      </main>

      <footer className="v2-foot">
        <span>{m.footer.name}</span>
        <span className="v2-dim">{m.footer.place}</span>
        <a href={site()}>{m.top.back}<ArrowIcon /></a>
      </footer>
    </>
  );
}
