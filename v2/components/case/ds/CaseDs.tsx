'use client';

import { type CSSProperties, type MouseEvent, useMemo, useState } from 'react';
import { contrast } from '@/v2/tokens/contrast';
import type { DsCopy, DsSource, DsSpec } from './types';

export type DsLabels = {
  kicker: string; theme: string; repo: string; components: string; color: string; type: string; shape: string;
  pairs: string; radius: string; space: string; motion: string; try: string; source: string; lines: string; newTab: string;
  weights: string; on: string; dec: string;
};

/** A link to the cited lines of the product's repo, at the commit the data was read from. */
function Src({ repo, sha, s, L }: { repo: string; sha: string; s: DsSource; L: DsLabels }) {
  const href = `https://github.com/${repo}/blob/${sha}/${s.path.split('/').map(encodeURIComponent).join('/')}#L${s.lines[0]}-L${s.lines[1]}`;
  const lines = s.lines[0] === s.lines[1] ? `L${s.lines[0]}` : `L${s.lines[0]}–${s.lines[1]}`;
  return (
    <a className="dsx-src" href={href} target="_blank" rel="noreferrer">
      <span className="ui-sr">{L.source}: </span><code>{s.path}</code> <span aria-hidden="true">·</span> <span className="ui-sr">{L.lines} </span>{lines}
      <span className="ui-sr"> ({L.newTab})</span>
    </a>
  );
}

const fill = (html: string, samples: Record<string, string>) =>
  html.replace(/\{\{(\w+)\}\}/g, (_, k: string) => (samples[k] ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!));

/**
 * The design system of a product, live (lote 5.4). The tokens, fonts and components come from the product's own
 * repository at one commit (ds/<slug>.ts) and every block links to the lines it was read from. The sample is a
 * canvas painted by the product's CSS (app/v2/[locale]/ds/<slug>.css, all under .pds[data-ds]); switching the theme
 * rewrites the product's own custom properties on it, so every swatch, specimen and component changes at once,
 * the way they do in the product. The specimens are real controls: hover, focus, press, check and pick work.
 */
export function CaseDs({ slug, spec, copy, labels: L }: { slug: string; spec: DsSpec; copy: DsCopy; labels: DsLabels }) {
  const [tid, setTid] = useState(spec.themes[0].id);
  const theme = spec.themes.find((t) => t.id === tid) ?? spec.themes[0];
  const [runs, setRuns] = useState<Record<string, number>>({});
  const html = useMemo(() => spec.components.map((c) => fill(c.html, copy.samples)), [spec.components, copy.samples]);
  const src = (s: DsSource) => <Src repo={spec.repo} sha={spec.sha} s={s} L={L} />;

  /* the hooks the specimens use: press toggles, check toggles, pick chooses one in its group */
  const onClick = (e: MouseEvent) => {
    const t = e.target as Element;
    const press = t.closest<HTMLElement>('[data-ds-press]');
    if (press) { press.setAttribute('aria-pressed', String(press.getAttribute('aria-pressed') !== 'true')); return; }
    const check = t.closest<HTMLElement>('[data-ds-check]');
    if (check) { check.setAttribute('aria-checked', String(check.getAttribute('aria-checked') !== 'true')); return; }
    const pick = t.closest<HTMLElement>('[data-ds-pick]');
    if (pick) {
      const group = pick.closest('[role=radiogroup], [role=tablist]');
      const attr = group?.getAttribute('role') === 'tablist' ? 'aria-selected' : 'aria-checked';
      group?.querySelectorAll('[data-ds-pick]').forEach((p) => p.setAttribute(attr, String(p === pick)));
    }
  };

  const ease = spec.scale.motion.find((m) => m.kind === 'ease')?.value ?? 'ease';
  return (
    <div className="dsx" data-ds-root={slug}>
      <div className="dsx-bar">
        {spec.themes.length > 1 && (
          <div className="dsx-themes" role="group" aria-label={L.theme}>
            <span className="dsx-themes-k" aria-hidden="true">{L.theme}</span>
            {spec.themes.map((t) => (
              <button key={t.id} type="button" className="dsx-theme" aria-pressed={t.id === tid} data-scheme={t.scheme} onClick={() => setTid(t.id)}>
                <i aria-hidden="true" style={{ background: t.vars[spec.pairs[0].bg], borderColor: t.vars[spec.pairs[0].fg] }} />
                {copy.themes[t.id]}
              </button>
            ))}
          </div>
        )}
        <a className="dsx-repo" href={`https://github.com/${spec.repo}/tree/${spec.sha}`} target="_blank" rel="noreferrer">
          <span>{L.repo}</span> <code>{spec.repo}</code> <code className="dsx-sha">@{spec.sha.slice(0, 7)}</code>
          <span className="ui-sr"> ({L.newTab})</span>
        </a>
      </div>

      <div className="pds" data-ds={slug} data-theme={theme.id} data-scheme={theme.scheme} style={theme.vars as CSSProperties} onClick={onClick}>
        <div className="dsx-block">
          <h3 className="dsx-h">{L.components}</h3>
          <ul className="dsx-specs">
            {spec.components.map((c, i) => (
              <li key={c.id} className="dsx-spec">
                <div className="dsx-live" role="group" aria-label={copy.components[c.id].name} dangerouslySetInnerHTML={{ __html: html[i] }} />
                <div className="dsx-cap">
                  <b>{copy.components[c.id].name}</b>
                  <span>{copy.components[c.id].note}</span>
                  {src(c.source)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="dsx-block">
          <h3 className="dsx-h">{L.color}</h3>
          {spec.colors.map((g) => (
            <div key={g.key} className="dsx-group">
              <p className="dsx-gh"><b>{copy.groups[g.key]}</b>{src(g.source)}</p>
              <ul className="dsx-swatches">
                {g.tokens.map((tk) => (
                  <li key={tk} className="dsx-sw">
                    <i aria-hidden="true" style={{ background: `var(${tk})` }} />
                    <code>{tk}</code>
                    <span className="dsx-val">{theme.vars[tk]}</span>
                    <span className="dsx-role">{copy.tokens[tk]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="dsx-gh"><b>{L.pairs}</b>{src(theme.source)}</p>
          <ul className="dsx-pairs">
            {spec.pairs.map((p) => {
              const r = contrast(theme.vars[p.fg], theme.vars[p.bg]);
              return (
                <li key={`${p.fg}${p.bg}`} style={{ color: `var(${p.fg})`, background: `var(${p.bg})` }}>
                  <b aria-hidden="true">Aa</b>
                  <span><code>{p.fg}</code> {L.on} <code>{p.bg}</code></span>
                  <strong>{r.toFixed(1).replace('.', L.dec)}:1</strong>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="dsx-block">
          <h3 className="dsx-h">{L.type}</h3>
          <ul className="dsx-fonts">
            {spec.fonts.map((f) => (
              <li key={f.key} className="dsx-font">
                <p className="dsx-specimen" style={{ fontFamily: `'${f.family}'`, fontWeight: f.weights[0] }}>{copy.fonts[f.key].sample}</p>
                <p className="dsx-gh"><b>{f.name}</b> <span>{copy.fonts[f.key].role}</span>{src(f.source)}</p>
                <p className="dsx-weights"><span className="ui-sr">{L.weights}: </span>
                  {f.weights.map((w) => <span key={w} style={{ fontFamily: `'${f.family}'`, fontWeight: w }}>Aa {w}</span>)}
                  {f.italic && <span style={{ fontFamily: `'${f.family}'`, fontStyle: 'italic' }}>Aa it.</span>}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="dsx-block">
          <h3 className="dsx-h">{L.shape}</h3>
          <p className="dsx-gh">{src(spec.scale.source)}</p>
          <div className="dsx-scale">
            <div>
              <p className="dsx-sk">{L.radius}</p>
              <ul className="dsx-radii">
                {spec.scale.radius.map((r) => <li key={r.token}><i aria-hidden="true" style={{ borderRadius: r.value }} /><code>{r.token}</code><span className="dsx-val">{r.value}</span></li>)}
              </ul>
            </div>
            {spec.scale.space && (
              <div>
                <p className="dsx-sk">{L.space}</p>
                <ul className="dsx-space">
                  {spec.scale.space.map((s) => <li key={s.token}><i aria-hidden="true" style={{ width: s.value }} /><code>{s.token}</code><span className="dsx-val">{s.value}</span></li>)}
                </ul>
              </div>
            )}
            <div>
              <p className="dsx-sk">{L.motion}</p>
              <ul className="dsx-motion">
                {spec.scale.motion.map((m) => (
                  <li key={m.token}>
                    <code>{m.token}</code><span className="dsx-val">{m.value}</span>
                    <span className="dsx-track" aria-hidden="true">
                      <i
                        data-run={runs[m.token] ? (runs[m.token] % 2 ? 'a' : 'b') : undefined}
                        style={{ transitionTimingFunction: m.kind === 'ease' ? m.value : ease, transitionDuration: m.kind === 'dur' ? m.value : '700ms' }}
                      />
                    </span>
                    <button type="button" className="dsx-try" onClick={() => setRuns((r) => ({ ...r, [m.token]: (r[m.token] ?? 0) + 1 }))}>
                      {L.try}<span className="ui-sr"> {m.token}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
