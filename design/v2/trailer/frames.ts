import type { StampId } from '../../../v2/components/kit/stamps';

/**
 * The frames of the storyboard of «Conocer a Ignacio» (lote 8.1): one drawing per shot and per format, in HTML and
 * SVG, with the film's own grammar — the coral dot, a flat colour per landing, name tags, stamps, glass panels in
 * space, verbs in pills and numbers that count. Every size is in `--u` (a 160 × 90 stage in 16:9, 90 × 160 in 9:16),
 * so a frame is the same drawing at any size. Parts that enter late carry `data-at` (beats from the start of the shot):
 * the animatic brings them in on that beat; the board shows them all.
 */
export type Fmt = 'w' | 't';
type Dict = Record<string, unknown>;
export type Shot = {
  id: string; chapter: string; bars: [number, number]; theme: string; year: string; stamp?: StampId; case?: string;
  media?: string; media2?: string; clip?: string; frameAt?: number; count?: { to: number; key: string }; cues: Record<string, number>;
};
export type FrameCtx = {
  /** trailer words, case words, state names and the stations of «Cómo viaja un cambio», by language */
  copy: Record<'es' | 'en', { shots: Record<string, Dict>; chapters: Record<string, string> }>;
  verbs: Record<'es' | 'en', Record<string, string[]>>;
  status: Record<'es' | 'en', Record<string, string>>;
  stations: Record<'es' | 'en', string[]>;
  /** state key of each case (ui.status) and its colour */
  caseState: Record<string, string>;
  caseColor: Record<string, string>;
  /** where an image of public/ lives next to the page */
  img: (path: string) => string;
  /** the still of a shot: its poster, or the frame of its clip that the script names (`frameAt`) */
  still: (s: Shot) => string;
  agentIcons: string[];
  monogram: string;
  chapterNo: Record<string, number>;
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
/** a word in both languages; the page shows one */
const T = (es: string, en: string) => (es === en ? esc(es) : `<i class="l-es">${esc(es)}</i><i class="l-en">${esc(en)}</i>`);
const at = (b: number | undefined) => (b === undefined ? '' : ` data-at style="--at:${b}"`);
const dot = (w: [number, number], t: [number, number], size = 5) => `<span class="f-dot" style="--wx:${w[0]};--wy:${w[1]};--tx:${t[0]};--ty:${t[1]};--ds:${size}"></span>`;
const stamp = (id: StampId, cue?: number) => `<span class="f-stamp"${at(cue)}><svg viewBox="0 0 240 300"><use href="#st-${id}"/></svg><span class="f-post"></span></span>`;

// The coast of Mar del Plata, as in the published trailer (north up, the Atlantic to the east): map units.
const COAST: [number, number][] = [[780, -560], [700, -380], [630, -200], [570, -40], [522, 90], [488, 200], [468, 300], [470, 370], [484, 420], [502, 466], [516, 516], [508, 554], [480, 584], [458, 612], [446, 646], [436, 690], [422, 730], [400, 790], [372, 860], [336, 940], [290, 1030], [232, 1130], [160, 1240], [80, 1360], [-20, 1500], [-90, 1600]];
const BREAK = ['M447 640C472 639 495 643 507 653C517 663 519 679 517 695', 'M434 702C456 703 480 706 499 714'];
const CITY: [number, number] = [405, 470];
function coast(fmt: Fmt) {
  const vb = fmt === 'w' ? [40, 128, 1216, 684] : [117, -42, 576, 1024];
  const line = COAST.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('');
  let blocks = '';
  for (let i = 0; i < 46; i++) { const x = 150 + ((i * 37) % 300), y = 250 + ((i * 53) % 420); if (x < 470 - Math.abs(y - 470) * 0.12) blocks += `<rect x="${x}" y="${y}" width="16" height="10" rx="2"/>`; }
  return `<svg class="f-map" viewBox="${vb.join(' ')}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect x="-3000" y="-1000" width="6000" height="4000" fill="#060513"/>
    <path d="${line}L-2600 1600L-2600 -560Z" fill="#0f0b2c"/>
    <g fill="#16123a">${blocks}</g>
    <g fill="none" stroke="#9a95b8" stroke-opacity=".12" stroke-width="2">${[60, 130, 210].map((d) => `<path d="${line}" transform="translate(${d} 0)"/>`).join('')}</g>
    <path d="${line}" fill="none" stroke="#c9c5de" stroke-width="3" stroke-linejoin="round"/>
    <g fill="none" stroke="#c9c5de" stroke-width="3" stroke-linecap="round">${BREAK.map((d) => `<path d="${d}"/>`).join('')}</g>
    <g data-at style="--at:3"><circle cx="${CITY[0]}" cy="${CITY[1]}" r="120" fill="#ff5a3c" opacity=".1"/><circle cx="${CITY[0]}" cy="${CITY[1]}" r="62" fill="none" stroke="#ff7a5c" stroke-opacity=".5" stroke-width="2"/><circle cx="${CITY[0]}" cy="${CITY[1]}" r="30" fill="none" stroke="#ff7a5c" stroke-width="2"/></g>
  </svg>`;
}

/** a glass panel turned in space, with a real clip of the product (or drawn content) */
const glass = (inner: string, o: { ry?: number; rx?: number; cap?: string; cls?: string; cue?: number } = {}) =>
  `<figure class="f-glass ${o.cls ?? ''}" style="--ry:${o.ry ?? -14}deg;--rx:${o.rx ?? 5}deg${o.cue === undefined ? '' : `;--at:${o.cue}`}"${o.cue === undefined ? '' : ' data-at'}><span class="f-chrome"><i></i><i></i><i></i></span><div class="f-screen">${inner}</div>${o.cap ? `<figcaption>${o.cap}</figcaption>` : ''}</figure>`;
const bars = (n: number, cls = '') => `<span class="f-bars ${cls}">${Array.from({ length: n }, (_, i) => `<i style="--w:${[92, 64, 78, 48, 86, 56][i % 6]}%"></i>`).join('')}</span>`;

export function frame(s: Shot, fmt: Fmt, c: FrameCtx): string {
  const es = c.copy.es.shots[s.id] as Record<string, string & string[]>, en = c.copy.en.shots[s.id] as Record<string, string & string[]>;
  const w = (k: string) => T(es[k] as string, en[k] as string);
  const q = s.cues;
  const hud = `<span class="f-hud"><b>${String(c.chapterNo[s.chapter]).padStart(2, '0')}</b>${T(c.copy.es.chapters[s.chapter], c.copy.en.chapters[s.chapter])}</span>${s.year ? `<span class="f-year">${s.year}</span>` : ''}`;
  const tag = (cue?: number) => `<p class="f-tag"${at(cue)}><b>${w('name')}</b>${es.when ? `<span>${w('when')}</span>` : ''}</p>`;
  const state = (cue?: number) => (s.case ? `<span class="f-state"${at(cue)}>${T(c.status.es[c.caseState[s.case]], c.status.en[c.caseState[s.case]])}</span>` : '');
  const verbs = (cue: number, step = 2) => `<p class="f-pills">${c.verbs.es[s.case!].map((v, i, a) => `<span class="f-pill${i === a.length - 1 ? ' on' : ''}"${at(cue + i * step)}>${T(v, c.verbs.en[s.case!][i])}</span>`).join('')}</p>`;
  const pills = (cue: number, lastOn = false) => `<p class="f-pills">${(es.pills as string[]).map((v, i, a) => `<span class="f-pill${lastOn && i === a.length - 1 ? ' on' : ''}"${at(cue + i)}>${T(v, (en.pills as string[])[i])}</span>`).join('')}</p>`;
  const shot = (url: string, cap?: string, o: Parameters<typeof glass>[1] = {}) => glass(`<img src="${url}" alt="" loading="lazy">`, { cap, ...o });
  let body = '';
  switch (s.id) {
    case 'mdp':
      body = `${coast(fmt)}<span class="f-sea">${w('sea')}</span>${dot([30, 50], [50, 50], 4)}
        <div class="f-copy f-mdp"><p class="f-kick"${at(q.kicker)}>${w('kicker')}</p><p class="f-line"${at(q.line)}>${w('line')}</p></div>`;
      break;
    case 'first':
      body = `<div class="f-split"><div class="f-copy"><p class="f-kick"${at(q.kicker)}>${w('kicker')}</p><p class="f-line"${at(q.line)}>${w('line')}</p></div>
        <div class="f-vis">${glass(`<div class="f-retro"><span class="f-retro-h"><i></i><i></i><i></i></span><div class="f-tiles">${['▲', '●', '■', '◆', '✚', '★'].map((g, i) => `<span style="--i:${i}">${g}</span>`).join('')}</div><span class="f-play"><span class="f-dot in" style="--wx:66;--wy:72;--tx:42;--ty:80;--ds:3"></span>${w('button')}</span></div>`, { ry: -16, rx: 6 })}</div></div>`;
      break;
    case 'tach':
      body = `<div class="f-split"><div class="f-copy">${tag(q.name)}<p class="f-line"${at(q.line)}>${w('line')}</p>${pills(q.pills)}</div>
        <div class="f-vis f-trio">${glass(`<div class="f-ui">${bars(1, 'h')}<div class="f-rows">${bars(5)}</div></div>`, { ry: -18, cls: 'a', cue: q.pills })}${glass(`<div class="f-ui c">${bars(2, 'h')}<span class="f-btn"></span></div>`, { ry: -18, cls: 'b', cue: q.pills + 1 })}${glass(`<div class="f-ui">${bars(1, 'h')}<span class="f-card"></span>${bars(3)}</div>`, { ry: -18, cls: 'c phone', cue: q.pills + 2 })}<span class="f-cap"${at(q.pills)}>${w('label')}</span></div></div>${stamp('tach', q.stamp)}${dot([94, 20], [88, 6.5])}`;
      break;
    case 'ada':
      body = `<div class="f-split"><div class="f-copy">${tag(q.name)}<p class="f-line"${at(q.line)}>${w('line')}</p>${pills(q.pills)}<p class="f-after"${at(q.after)}>${w('after')}</p></div>
        <div class="f-vis">${glass(`<div class="f-board"><code>console.log(<b>'${w('board')}'</b>)</code>${bars(3)}<span class="f-out">› ${w('board')}</span></div>`, { ry: -12, rx: 4 })}<span class="f-class">${Array.from({ length: 5 }, () => '<i></i>').join('')}</span></div></div>${stamp('ada', q.stamp)}${dot([94, 20], [88, 6.5])}`;
      break;
    case 'tuenti':
      body = `<div class="f-split"><div class="f-copy">${tag(q.name)}<p class="f-line"${at(q.line)}>${w('line')}</p>${verbs(q.verbs, 1)}</div>
        <div class="f-vis">${shot(c.still(s), w('label'), { ry: -12, cls: 'bare' })}</div></div>${stamp('tuenti', q.stamp)}${dot([94, 20], [88, 6.5])}`;
      break;
    case 'ia':
      body = `<span class="f-grid"></span><div class="f-center"><p class="f-line xl"${at(q.line)}>${w('line')}</p></div>${dot([50, 22], [50, 24], 6)}`;
      break;
    case 'complia':
      body = `<div class="f-split"><div class="f-copy">${tag(q.name)}${verbs(q.verbs)}</div><div class="f-vis">${shot(c.still(s), w('label'), { ry: -20, rx: 7 })}</div></div>${stamp('complia', q.stamp)}${dot([94, 20], [88, 6.5])}`;
      break;
    case 'complia-state':
      body = `<div class="f-split wide"><div class="f-vis">${shot(c.still(s), w('label'), { ry: 6, rx: 2, cls: 'big' })}</div><div class="f-copy"><p class="f-line s"${at(q.line)}>${w('line')}</p><p class="f-after"${at(q.fact)}>${w('fact')}</p>${state(q.status)}</div></div>${dot([52, 86], [88, 6.5], 4)}`;
      break;
    case 'supernova':
      body = `<div class="f-split"><div class="f-copy">${tag(q.name)}${verbs(q.verbs, 1)}${state(q.verbs + 3)}</div><div class="f-vis">${shot(c.still(s), w('label'), { ry: -16, rx: 5 })}</div></div>${stamp('supernova', q.stamp)}${dot([94, 20], [88, 6.5])}`;
      break;
    case 'own': {
      const names = ['eclipse', 'volta', 'velmar', 'dentalos', 'kinetic', 'games'];
      body = `<svg class="f-fork" viewBox="0 0 160 90" preserveAspectRatio="none" aria-hidden="true">${names.map((n, i) => `<path d="M12 45C50 45 60 ${12 + i * 13.2} 104 ${12 + i * 13.2}" fill="none" stroke="${c.caseColor[n]}" stroke-width=".7" vector-effect="non-scaling-stroke"/>`).join('')}</svg>
        <ul class="f-lanes">${names.map((n, i) => `<li style="--i:${i};--c:${c.caseColor[n]}"><i></i>${esc(c.copy.es.shots[n].name as string)}</li>`).join('')}</ul>
        <div class="f-copy f-own"><p class="f-line"${at(q.line)}>${w('line')}</p></div>${dot([7.5, 50], [50, 13], 4)}`;
      break;
    }
    case 'eclipse':
      body = `<div class="f-split"><div class="f-copy">${tag(q.name)}<p class="f-sub"${at(q.line)}>${w('line')}</p>${verbs(q.verbs, 1)}<p class="f-count"${at(q.count)}><b data-count="${s.count!.to}">${T('1.374', '1,374')}</b><span>${w('count')}<small>${w('date')}</small></span></p>${state(q.count)}</div>
        <div class="f-vis f-duo">${shot(c.img(s.media2!), undefined, { ry: -22, rx: 6, cls: 'back' })}${shot(c.still(s), w('label'), { ry: -14, rx: 5, cls: 'front' })}</div></div>${stamp('eclipse', q.stamp)}${dot([94, 20], [88, 6.5])}`;
      break;
    case 'volta': case 'velmar': case 'dentalos': case 'kinetic': case 'games': {
      const flip = ['velmar', 'kinetic'].includes(s.id);
      const copy = `<div class="f-copy"><p class="f-name"${at(q.name)}>${w('name')}</p><p class="f-sub l"${at(q.line)}>${w('line')}</p>${state(q.state)}</div>`;
      const vis = `<div class="f-vis">${shot(c.still(s), undefined, { ry: flip ? 14 : -14, rx: 5, cls: 'dark' })}</div>`;
      body = `<div class="f-split${flip ? ' flip' : ''}">${flip ? vis + copy : copy + vis}</div>${dot(flip ? [6, 16] : [94, 16], [88, 6.5], 4)}`;
      break;
    }
    case 'agents':
      body = `<div class="f-split"><div class="f-copy"><p class="f-line"${at(q.line)}>${w('line')}</p><p class="f-count big"${at(q.count)}><b data-count="${s.count!.to}">${s.count!.to}</b><span>${w('count')}</span></p></div>
        <div class="f-vis"><ul class="f-ring">${c.agentIcons.map((svg, i) => `<li style="--i:${i}"${''}>${svg}</li>`).join('')}</ul></div></div>${dot([73.2, 50], [50, 68.6], 5)}`;
      break;
    case 'gate':
      body = `<ol class="f-stations"${at(q.stations)}>${c.stations.es.map((n, i) => `<li${i === 5 ? ' class="on"' : ''}><b>${String(i + 1).padStart(2, '0')}</b><span>${T(n, c.stations.en[i])}</span></li>`).join('')}</ol>
        <div class="f-copy f-gate"><p class="f-line"${at(q.line)}>${w('line')}</p></div>${dot([70.1, 30], [16, 61], 4)}`;
      break;
    case 'drive':
      body = `<div class="f-split"><div class="f-copy"><p class="f-line"${at(q.line)}>${w('line')}</p>${pills(q.pills, true)}</div>
        <div class="f-vis"><span class="f-fan"${at(q.stamps)}>${(['tach', 'ada', 'tuenti', 'complia', 'supernova', 'eclipse'] as StampId[]).map((id, i) => `<svg viewBox="0 0 240 300" style="--i:${i}"><use href="#st-${id}"/></svg>`).join('')}</span></div></div>${dot([94, 20], [88, 6.5])}`;
      break;
    case 'end':
      body = `<div class="f-center f-end"><span class="f-mark"${at(q.mark)}>${c.monogram}</span><p class="f-name"${at(q.name)}>${w('name')}</p><p class="f-sub"${at(q.line)}>${w('line')}</p><p class="f-links"${at(q.links)}><span>${w('mail')}</span><span>${w('linkedin')}</span><span class="go">${w('enter')}</span></p></div>`;
      break;
  }
  return `<div class="fr ${fmt}" data-theme="${s.theme}" data-shot="${s.id}" aria-hidden="true"><div class="fi">${hud}${body}</div></div>`;
}

/** The look of the frames. Colours are the film's own (the site's tokens), so they are the same in a light or dark page. */
export const FRAME_CSS = `
.fr{position:relative;container-type:size;overflow:hidden;background:var(--bg);color:var(--fg);font-family:var(--sans);line-height:1.1;isolation:isolate}
.fr.w{aspect-ratio:16/9}.fr.t{aspect-ratio:9/16}
.fr i{font-style:normal}
.fi{position:absolute;inset:0;--u:calc(100cqw/160)}.fr.t .fi{--u:calc(100cqw/90)}
.fr[data-theme=ink]{--bg:#060513;--fg:#eeeae3;--soft:#b9b4d2;--alt:#ff7a5c;--dotc:#ff5a3c;--pill:rgba(255,255,255,.1);--on:#ff5a3c;--onfg:#0c0a24;--tag:#eeeae3;--tagfg:#060513;--bar:#ff5a3c}
.fr[data-theme=coral]{--bg:#ff5a3c;--fg:#060513;--soft:#060513;--alt:#fff;--dotc:#eeeae3;--pill:rgba(6,5,19,.12);--on:#060513;--onfg:#eeeae3;--tag:#060513;--tagfg:#eeeae3;--bar:#ffc247}
.fr[data-theme=blue]{--bg:#2b50ff;--fg:#fff;--soft:#fff;--alt:#ffc247;--dotc:#ff7a5c;--pill:rgba(255,255,255,.16);--on:#eeeae3;--onfg:#060513;--tag:#060513;--tagfg:#fff;--bar:#ffc247}
.fr[data-theme=paper]{--bg:#eeeae3;--fg:#060513;--soft:#221d4f;--alt:#2b50ff;--dotc:#ff4d2e;--pill:rgba(6,5,19,.08);--on:#ff5a3c;--onfg:#0c0a24;--tag:#060513;--tagfg:#eeeae3;--bar:#2b50ff}
.fr[data-theme=amber]{--bg:#ffc247;--fg:#060513;--soft:#060513;--alt:#2b50ff;--dotc:#2b50ff;--pill:rgba(6,5,19,.1);--on:#060513;--onfg:#ffe39a;--tag:#060513;--tagfg:#ffe39a;--bar:#ff5a3c}
.fr[data-theme=lime]{--bg:#b6f36a;--fg:#060513;--soft:#060513;--alt:#060513;--dotc:#060513;--pill:rgba(6,5,19,.1);--on:#060513;--onfg:#b6f36a;--tag:#060513;--tagfg:#b6f36a;--bar:#060513}
.fr[data-theme=orange]{--bg:#ffa04a;--fg:#060513;--soft:#060513;--alt:#060513;--dotc:#060513;--pill:rgba(6,5,19,.1);--on:#060513;--onfg:#ffa04a;--tag:#060513;--tagfg:#ffa04a;--bar:#060513}
.fr[data-theme=mint]{--bg:#3fe0b0;--fg:#060513;--soft:#060513;--alt:#060513;--dotc:#060513;--pill:rgba(6,5,19,.1);--on:#060513;--onfg:#3fe0b0;--tag:#060513;--tagfg:#3fe0b0;--bar:#060513}
.fr[data-theme=pink]{--bg:#ff5fa2;--fg:#060513;--soft:#060513;--alt:#060513;--dotc:#060513;--pill:rgba(6,5,19,.1);--on:#060513;--onfg:#ff5fa2;--tag:#060513;--tagfg:#ff5fa2;--bar:#060513}
.fr :where(p,ul,ol,figure){margin:0;padding:0;list-style:none}
.f-hud{position:absolute;left:calc(var(--u)*5);top:calc(var(--u)*4.2);font:500 calc(var(--u)*1.9)/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--soft);display:flex;gap:calc(var(--u)*1.2);z-index:3}
.f-hud b{color:var(--alt);font-weight:700}
.f-year{position:absolute;right:calc(var(--u)*5);top:calc(var(--u)*3.9);font:700 calc(var(--u)*2.4)/1 var(--mono);letter-spacing:.06em;color:var(--fg);opacity:.75;z-index:3}
.fr.t .f-year{top:auto;right:auto;left:calc(var(--u)*5);bottom:calc(var(--u)*5);font-size:calc(var(--u)*3.2)}
.f-dot{position:absolute;left:calc(var(--wx)*1%);top:calc(var(--wy)*1%);width:calc(var(--u)*var(--ds));height:calc(var(--u)*var(--ds));margin:calc(var(--u)*var(--ds)/-2) 0 0 calc(var(--u)*var(--ds)/-2);border-radius:50%;background:var(--dotc);z-index:4;box-shadow:0 0 0 calc(var(--u)*.9) color-mix(in srgb,var(--dotc) 22%,transparent)}
.fr.t .f-dot{left:calc(var(--tx)*1%);top:calc(var(--ty)*1%)}
.f-split{position:absolute;inset:calc(var(--u)*11) calc(var(--u)*7) calc(var(--u)*9);display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:calc(var(--u)*5);align-items:center}
.f-split.wide{grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)}
.fr.t .f-split,.fr.t .f-split.wide{inset:calc(var(--u)*17) calc(var(--u)*7) calc(var(--u)*13);grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);gap:calc(var(--u)*6);align-items:start}
.fr.t .f-split.flip .f-copy,.fr.t .f-split.wide .f-copy{order:-1}
.f-copy{display:flex;flex-direction:column;align-items:flex-start;gap:calc(var(--u)*2.6);min-width:0;position:relative;z-index:2}
.f-vis{position:relative;display:grid;place-items:center;min-width:0;min-height:0;height:100%}
.f-center{position:absolute;inset:calc(var(--u)*10) calc(var(--u)*12);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:calc(var(--u)*2.6)}
.f-kick{font:500 calc(var(--u)*2)/1.2 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--alt)}
.f-line{font-weight:800;font-stretch:112%;font-size:calc(var(--u)*7.4);line-height:1.02;letter-spacing:-.02em;text-wrap:balance}
.f-line.s{font-size:calc(var(--u)*5)}.f-line.xl{font-size:calc(var(--u)*10.5)}
.fr.t .f-line{font-size:calc(var(--u)*9)}.fr.t .f-line.s{font-size:calc(var(--u)*6.4)}.fr.t .f-line.xl{font-size:calc(var(--u)*11)}
.f-sub{font-weight:600;font-size:calc(var(--u)*3.6);line-height:1.15;text-wrap:balance}
.fr.t .f-sub{font-size:calc(var(--u)*4.4)}
.f-sub.l{font-size:calc(var(--u)*4.6);font-weight:700}.fr.t .f-sub.l{font-size:calc(var(--u)*5.4)}
.f-after{font-weight:600;font-size:calc(var(--u)*3.3);color:var(--soft)}
.fr.t .f-after{font-size:calc(var(--u)*4.2)}
.f-tag{display:inline-flex;flex-direction:column;gap:calc(var(--u)*1);background:var(--tag);color:var(--tagfg);padding:calc(var(--u)*1.8) calc(var(--u)*2.6) calc(var(--u)*1.8) calc(var(--u)*3.4);border-radius:calc(var(--u)*.8);position:relative}
.f-tag::before{content:"";position:absolute;left:0;top:0;bottom:0;width:calc(var(--u)*1.1);background:var(--bar);border-radius:calc(var(--u)*.8) 0 0 calc(var(--u)*.8)}
.f-tag b{font-weight:800;font-stretch:112%;font-size:calc(var(--u)*5.2);letter-spacing:-.02em;line-height:1}
.f-tag span{font:500 calc(var(--u)*1.9)/1 var(--mono);letter-spacing:.06em;opacity:.8}
.f-tag{max-width:100%}.fr.t .f-hud{font-size:calc(var(--u)*2.6)}.fr.t .f-tag b{font-size:calc(var(--u)*6)}.fr.t .f-tag span{font-size:calc(var(--u)*2.8)}
.f-name{font-weight:900;font-stretch:118%;font-size:calc(var(--u)*9.4);letter-spacing:-.03em;line-height:.95}
.fr.t .f-name{font-size:calc(var(--u)*11)}
.f-pills{display:flex;flex-wrap:wrap;gap:calc(var(--u)*1.4)}
.f-pill{font-weight:700;font-size:calc(var(--u)*3.3);padding:calc(var(--u)*1.3) calc(var(--u)*2.6);border-radius:calc(var(--u)*5);background:var(--pill);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--fg) 26%,transparent)}
.f-pill.on{background:var(--on);color:var(--onfg);box-shadow:none}
.fr.t .f-pill{font-size:calc(var(--u)*4)}
.f-state{font:600 calc(var(--u)*2)/1 var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:calc(var(--u)*1.1) calc(var(--u)*1.8);border-radius:calc(var(--u)*.6);box-shadow:inset 0 0 0 1px currentColor;display:inline-flex;gap:calc(var(--u)*1);align-items:center}
.f-state::before{content:"";width:calc(var(--u)*1.1);height:calc(var(--u)*1.1);border-radius:50%;background:currentColor}
.fr.t .f-state{font-size:calc(var(--u)*2.6)}
.f-count{display:flex;align-items:flex-end;gap:calc(var(--u)*1.6)}
.f-count b{font:800 calc(var(--u)*8)/.9 var(--mono);letter-spacing:-.04em;font-variant-numeric:tabular-nums;color:var(--alt)}
.f-count.big b{font-size:calc(var(--u)*17)}
.f-count span{font-weight:700;font-size:calc(var(--u)*2.6);display:flex;flex-direction:column;gap:calc(var(--u)*.6);padding-bottom:calc(var(--u)*.6)}
.f-count small{font:500 calc(var(--u)*1.6)/1 var(--mono);letter-spacing:.04em;color:var(--soft);opacity:.85}
.fr.t .f-count span{font-size:calc(var(--u)*3.6)}.fr.t .f-count small{font-size:calc(var(--u)*2.4)}
.f-glass{position:relative;width:88%;transform:perspective(calc(var(--u)*130)) rotateY(var(--ry)) rotateX(var(--rx));border-radius:calc(var(--u)*1.6);background:#0f0b2c;box-shadow:0 0 0 1px rgba(255,255,255,.3),0 calc(var(--u)*4) calc(var(--u)*9) rgba(6,5,19,.5),calc(var(--u)*-1.4) calc(var(--u)*1.4) 0 rgba(6,5,19,.22)}
.f-glass::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(115deg,rgba(255,255,255,.22),rgba(255,255,255,0) 32%);pointer-events:none}
.f-chrome{display:flex;gap:calc(var(--u)*.8);padding:calc(var(--u)*1.1) calc(var(--u)*1.4)}
.f-chrome i{width:calc(var(--u)*1);height:calc(var(--u)*1);border-radius:50%;background:rgba(255,255,255,.28)}
.f-screen{border-radius:0 0 calc(var(--u)*1.6) calc(var(--u)*1.6);overflow:hidden;background:#16123a;aspect-ratio:16/10}
.f-screen img{display:block;width:100%;height:100%;object-fit:cover;object-position:top}
.f-glass.bare .f-screen{background:#eeeae3}
.f-glass.big{width:100%}
.f-glass figcaption,.f-cap{position:absolute;left:0;top:calc(100% + var(--u)*1.4);font:500 calc(var(--u)*1.5)/1.2 var(--mono);letter-spacing:.04em;color:var(--soft)}
.fr.t .f-glass figcaption,.fr.t .f-cap{font-size:calc(var(--u)*2.3)}
.f-duo{display:block}.f-duo .f-glass{position:absolute;width:74%}.f-duo .back{right:0;top:2%;opacity:.9}.f-duo .front{left:0;bottom:10%}
.fr.t .f-duo .back{top:0}.fr.t .f-duo .front{bottom:22%}
.f-trio{display:block}.f-trio .f-glass{position:absolute}.f-trio .a{width:60%;left:0;top:6%}.f-trio .b{width:52%;right:0;top:26%}.f-trio .c{width:22%;left:30%;bottom:6%}
.f-trio .f-screen{aspect-ratio:16/10;padding:calc(var(--u)*1.6);background:#eeeae3}.f-trio .phone .f-screen{aspect-ratio:9/16}.f-trio .f-cap{top:auto;bottom:0;left:0}
.f-ui{display:flex;flex-direction:column;gap:calc(var(--u)*1.2);height:100%}.f-ui.c{align-items:center;justify-content:center}
.f-bars{display:flex;flex-direction:column;gap:calc(var(--u)*1);width:100%}.f-bars i{height:calc(var(--u)*1.1);width:var(--w);border-radius:calc(var(--u)*1);background:#060513;opacity:.22}
.f-bars.h i{height:calc(var(--u)*1.8);opacity:.85}.f-ui.c .f-bars{align-items:center}
.f-btn{width:38%;height:calc(var(--u)*2.6);border-radius:calc(var(--u)*2);background:#ff5a3c}.f-card{height:28%;border-radius:calc(var(--u)*1);background:#2b50ff}
.f-rows{padding-top:calc(var(--u)*.6);border-top:1px solid rgba(6,5,19,.2)}
.f-board{height:100%;padding:calc(var(--u)*3);display:flex;flex-direction:column;gap:calc(var(--u)*2);background:#0c0a24;color:#eeeae3}
.f-board code{font:500 calc(var(--u)*2.5)/1.2 var(--mono)}.f-board code b{color:#ffc247;font-weight:500}.f-board .f-bars i{background:#eeeae3}
.f-out{margin-top:auto;font:600 calc(var(--u)*3.2)/1 var(--mono);color:#3fe0b0}
.fr.t .f-board code{font-size:calc(var(--u)*3)}
.f-class{position:absolute;left:8%;right:8%;bottom:-2%;display:flex;justify-content:space-between}
.f-class i{width:calc(var(--u)*7);height:calc(var(--u)*5);border-radius:calc(var(--u)*3.5) calc(var(--u)*3.5) 0 0;background:#060513;position:relative}
.f-class i::before{content:"";position:absolute;left:50%;bottom:92%;width:calc(var(--u)*3.6);height:calc(var(--u)*3.6);margin-left:calc(var(--u)*-1.8);border-radius:50%;background:#060513}
.f-retro{height:100%;padding:calc(var(--u)*2.4);display:flex;flex-direction:column;gap:calc(var(--u)*2);background:#16123a;color:#eeeae3}
.f-retro-h{display:flex;gap:calc(var(--u)*1.2)}.f-retro-h i{height:calc(var(--u)*1.6);border-radius:calc(var(--u)*1);background:rgba(255,255,255,.3);width:22%}.f-retro-h i:first-child{width:34%;background:#ffc247}
.f-tiles{flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:calc(var(--u)*1.4)}
.f-tiles span{display:grid;place-items:center;border-radius:calc(var(--u)*1);font-size:calc(var(--u)*4.4);background:rgba(255,255,255,.07);color:hsl(calc(var(--i)*52 + 10) 90% 68%)}
.f-play{align-self:center;font-weight:800;font-size:calc(var(--u)*2.8);padding:calc(var(--u)*1.2) calc(var(--u)*4);border-radius:calc(var(--u)*1);background:#eeeae3;color:#060513;display:inline-flex;align-items:center}
.f-dot.in,.fr.t .f-dot.in{position:relative;left:auto;top:auto;margin:0 calc(var(--u)*1.6) 0 0;flex:none}
.f-map{position:absolute;inset:0;width:100%;height:100%}
.f-sea{position:absolute;right:6%;top:16%;font:500 calc(var(--u)*1.6)/1 var(--mono);letter-spacing:.3em;text-transform:uppercase;color:#6c6790}
.fr.t .f-sea{top:30%;font-size:calc(var(--u)*2.2)}
.f-mdp{position:absolute;left:50%;right:6%;top:50%;transform:translateY(-50%)}
.fr.t .f-mdp{left:8%;right:8%;top:auto;bottom:9%;transform:none}
.f-grid{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.16) 1px,transparent 1.4px);background-size:calc(var(--u)*4) calc(var(--u)*4);mask-image:radial-gradient(ellipse at 50% 22%,#000,transparent 62%)}
.f-fork{position:absolute;inset:0;width:100%;height:100%}
.fr.t .f-fork{transform:rotate(90deg) scale(1.78,.5625);transform-origin:center}
.f-lanes{position:absolute;left:67%;top:0;bottom:0;right:3%}
.f-lanes li{position:absolute;left:0;top:calc((12 + var(--i)*13.2)/90*100%);transform:translateY(-50%);display:flex;align-items:center;gap:calc(var(--u)*1.2);font-weight:800;font-stretch:112%;font-size:calc(var(--u)*3.6);color:var(--c);white-space:nowrap}
.f-lanes i{width:calc(var(--u)*1.6);height:calc(var(--u)*1.6);border-radius:50%;background:var(--c)}
.fr.t .f-lanes{left:0;right:0;top:63%;bottom:auto;height:0}
.fr.t .f-lanes li{left:calc((12 + (5 - var(--i))*13.2)/90*100%);top:0;transform:rotate(90deg) translateY(-50%);transform-origin:0 0;font-size:calc(var(--u)*4)}
.f-own{position:absolute;left:14%;top:12%;width:40%}
.fr.t .f-own{left:8%;right:8%;width:auto;top:20%}
.f-ring{position:relative;width:calc(var(--u)*52);height:calc(var(--u)*52);border-radius:50%;box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)}
.f-ring li{position:absolute;left:50%;top:50%;width:calc(var(--u)*8);height:calc(var(--u)*8);margin:calc(var(--u)*-4);border-radius:50%;background:#eeeae3;color:#060513;display:grid;place-items:center;--accent:#ff4d2e;transform:rotate(calc(var(--i)*32.727deg)) translateY(calc(var(--u)*-26)) rotate(calc(var(--i)*-32.727deg))}
.f-ring svg{width:58%;height:58%}
.fr.t .f-vis .f-ring{width:calc(var(--u)*60);height:calc(var(--u)*60)}.fr.t .f-ring li{width:calc(var(--u)*10);height:calc(var(--u)*10);margin:calc(var(--u)*-5);transform:rotate(calc(var(--i)*32.727deg)) translateY(calc(var(--u)*-30)) rotate(calc(var(--i)*-32.727deg))}
.f-stations{position:absolute;left:6%;right:6%;top:30%;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:calc(var(--u)*1)}
.f-stations::before{content:"";position:absolute;left:2%;right:2%;top:0;border-top:calc(var(--u)*.4) solid #060513;opacity:.3}
.f-stations li{position:relative;padding-top:calc(var(--u)*3.4);display:flex;flex-direction:column;gap:calc(var(--u)*.8);font-weight:700;font-size:calc(var(--u)*2.3);line-height:1.1}
.f-stations li::before{content:"";position:absolute;left:0;top:calc(var(--u)*-1.1);width:calc(var(--u)*2.4);height:calc(var(--u)*2.4);border-radius:50%;background:#060513}
.f-stations li.on{color:#2b50ff}.f-stations li.on::before{background:#eeeae3;box-shadow:0 0 0 calc(var(--u)*.5) #ff4d2e}
.f-stations b{font:500 calc(var(--u)*1.6)/1 var(--mono);opacity:.7}
.fr.t .f-stations{left:16%;right:8%;top:13%;grid-template-columns:1fr;gap:calc(var(--u)*6)}
.fr.t .f-stations::before{left:calc(var(--u)*1);right:auto;top:0;bottom:0;border-top:0;border-left:calc(var(--u)*.4) solid #060513}
.fr.t .f-stations li{padding:0 0 0 calc(var(--u)*6);font-size:calc(var(--u)*4.4);flex-direction:row;align-items:baseline;gap:calc(var(--u)*2)}
.fr.t .f-stations li::before{top:calc(var(--u)*.4);left:calc(var(--u)*-.1)}.fr.t .f-stations b{font-size:calc(var(--u)*2.4)}
.f-gate{position:absolute;left:6%;right:30%;bottom:12%}
.fr.t .f-gate{right:8%;left:8%;bottom:8%}
.f-stamp{position:absolute;right:calc(var(--u)*7);bottom:calc(var(--u)*7);width:calc(var(--u)*15);transform:rotate(7deg);z-index:3;filter:drop-shadow(0 calc(var(--u)*1) calc(var(--u)*1.6) rgba(6,5,19,.4))}
.f-stamp svg,.f-fan svg{display:block;width:100%;height:auto}
.f-post{position:absolute;left:-22%;top:-12%;width:60%;aspect-ratio:1;border-radius:50%;box-shadow:inset 0 0 0 calc(var(--u)*.3) #060513,inset 0 0 0 calc(var(--u)*1) transparent,inset 0 0 0 calc(var(--u)*1.25) #060513;opacity:.55;transform:rotate(-18deg)}
.fr.t .f-stamp{width:calc(var(--u)*20);right:calc(var(--u)*6);bottom:calc(var(--u)*12)}
.f-fan{position:relative;width:100%;height:100%;display:block}
.f-fan svg{position:absolute;left:50%;top:50%;width:30%;margin:-19% 0 0 -15%;transform:rotate(calc((var(--i) - 2.5)*13deg)) translateY(calc(var(--u)*-3));transform-origin:50% 150%;filter:drop-shadow(0 calc(var(--u)*.8) calc(var(--u)*1.4) rgba(6,5,19,.45))}
.fr.t .f-fan{min-height:calc(var(--u)*60)}.fr.t .f-fan svg{width:30%;margin:-16% 0 0 -15%;transform:rotate(calc((var(--i) - 2.5)*9deg)) translateY(calc(var(--u)*-3))}
.f-end .f-mark{width:calc(var(--u)*26);color:#eeeae3;--color-coral-500:#ff5a3c}.f-end .f-mark svg{display:block;width:100%;height:auto}
.f-end .f-name{font-size:calc(var(--u)*8)}.f-end .f-sub{color:var(--alt)}
.f-links{display:flex;flex-wrap:wrap;justify-content:center;gap:calc(var(--u)*1.4);margin-top:calc(var(--u)*1.4)}
.f-links span{font-weight:700;font-size:calc(var(--u)*2.4);padding:calc(var(--u)*1.3) calc(var(--u)*2.6);border-radius:calc(var(--u)*4);box-shadow:inset 0 0 0 1px rgba(255,255,255,.34)}
.f-links .go{background:#ff5a3c;color:#0c0a24;box-shadow:none;border-radius:calc(var(--u)*1.2)}
.fr.t .f-end .f-mark{width:calc(var(--u)*34)}.fr.t .f-links span{font-size:calc(var(--u)*3.6)}
`;
