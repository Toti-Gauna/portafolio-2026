import type { CSSProperties, ReactNode } from 'react';
import type { Brand, BrandId } from '@/lib/brands';
import { FAMILY } from './fonts';

/**
 * The drawings of the Brand Lab (Ola 8a). Repo brands are redrawn from their code (paths, viewBoxes and colors copied
 * from the survey, scratchpad o8/brands.md); Sereno and Brote are drawn here. Typographic logos are HTML (they size
 * with container units, `cqi`, so they always fit their panel); symbols are SVG. Every line of copy on a sample piece
 * comes in `lines` (messages → brandlab.brands.<id>.apps.<n>.lines). Classes for the entrance: `.bl-draw` (a stroke
 * with pathLength=1 that draws itself) and `.bl-wipe` (a group revealed with clip-path).
 */

type Part = 'a' | 'b' | 'c';
const fam = (b: Brand, which: 'display' | 'text'): string => FAMILY[b.fonts[which]];
const css = (o: CSSProperties) => o;

/* ------------------------------------------------------------------ symbols (SVG) */

const IgMonogram = ({ ink, dot = '#ff4d2e' }: { ink: string; dot?: string }) => (
  <svg viewBox="0 0 64 64" width="64" height="64" fill="none" aria-hidden="true">
    <g stroke={ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <path className="bl-draw" d="M18 17v33" pathLength={1} />
      <path className="bl-draw" d="M50 22a16 16 0 1 0 0 20V34H38" pathLength={1} />
    </g>
    <circle cx="18" cy="9" r="3" fill={dot} />
  </svg>
);

const MiniEclipse = ({ ink, id }: { ink: string; id: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <defs>
      <radialGradient id={`${id}g`} cx="50%" cy="50%" r="50%">
        <stop offset="40%" stopColor="#FFE8B0" stopOpacity=".85" />
        <stop offset="62%" stopColor="#F5B942" stopOpacity=".4" />
        <stop offset="100%" stopColor="#F5B942" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="12" fill={`url(#${id}g)`} opacity=".12" />
    <circle className="bl-draw" cx="12" cy="12" r="6.5" fill="none" stroke={ink} strokeOpacity=".28" strokeWidth=".75" pathLength={1} />
    <circle className="bl-draw" cx="12" cy="12" r="8.6" fill="none" stroke="#F5B942" strokeWidth=".9" pathLength={1} />
    <circle cx="16.95" cy="7.05" r="1.35" fill="#FFF8E6" />
    <path d="M16.95 3.6v6.9M13.5 7.05h6.9" stroke="#FFF8E6" strokeWidth=".5" strokeLinecap="round" opacity=".85" />
  </svg>
);

const PhaseGlyph = ({ ink, id }: { ink: string; id: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" style={{ color: ink }}>
    <defs>
      <mask id={`${id}m`} maskUnits="userSpaceOnUse" x="-6" y="-6" width="36" height="36">
        <rect x="-6" y="-6" width="36" height="36" fill="#fff" />
        <circle cx="12" cy="12" r="8.25" fill="#000" />
      </mask>
    </defs>
    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeOpacity=".3" strokeWidth="1" />
    <circle cx="12" cy="12" r="8" fill="currentColor" mask={`url(#${id}m)`} />
    <circle className="bl-draw" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity=".55" strokeWidth="1" pathLength={1} />
    <circle cx="18.36" cy="5.64" r="1.6" fill="currentColor" />
  </svg>
);

const VelmarMark = ({ ink }: { ink: string }) => (
  <svg viewBox="156 234 558 452" width="558" height="452" fill="none" aria-hidden="true">
    <path className="bl-draw" d="M187.5 432.5 323 297l112 112 112-112 135.5 135.5" stroke={ink} strokeWidth="78" strokeLinejoin="miter" pathLength={1} />
    <path className="bl-draw" d="M295.5 487.5 435 627l139.5-139.5" stroke={ink} strokeWidth="78" strokeLinejoin="miter" pathLength={1} />
  </svg>
);

const VoltaMark = ({ chalk = '#f2f0ea' }: { chalk?: string }) => (
  <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
    <g className="bl-wipe">
      <path d="M4 8h14l13 34-5 14z" fill={chalk} />
      <path d="M44 8h17L48 30h7L27 60l8.5-23H29z" fill="#c8ff2e" />
    </g>
  </svg>
);

const BrisaMark = ({ id }: { id: string }) => (
  <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}m`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2c6f69" /><stop offset="1" stopColor="#173c3a" /></linearGradient>
      <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c8952c" /><stop offset=".5" stopColor="#f3d98a" /><stop offset="1" stopColor="#b8862b" /></linearGradient>
    </defs>
    <rect width="48" height="48" rx="13" fill={`url(#${id}m)`} />
    <path className="bl-wipe" d="M14 17c0-3.2 2.4-5.6 5.6-5.6 2.4 0 3.4 1.3 4.4 1.3s2-1.3 4.4-1.3c3.2 0 5.6 2.4 5.6 5.6 0 3.8-1.9 5.6-2.6 8.9-.6 3.2-1.3 10.1-3.6 10.1-2 0-2.2-6-4.9-6s-2.9 6-4.9 6c-2.3 0-3-6.9-3.6-10.1C15.9 22.6 14 20.8 14 17z" fill="#f6f4ee" />
    <path className="bl-draw" d="M9 30c8-5 22-5 30 0" stroke={`url(#${id}g)`} strokeWidth="2.6" fill="none" strokeLinecap="round" pathLength={1} />
    <circle cx="37" cy="12" r="2.4" fill={`url(#${id}g)`} />
  </svg>
);

const BrisaFavicon = () => (
  <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
    <rect width="32" height="32" rx="9" fill="#245E59" />
    <path className="bl-wipe" d="M9 11c0-2 1.5-3.5 3.5-3.5 1.6 0 2.3.9 3.5.9s1.9-.9 3.5-.9c2 0 3.5 1.5 3.5 3.5 0 2.4-1.2 3.5-1.6 5.6-.4 2-.8 6.4-2.3 6.4-1.3 0-1.4-3.8-3.1-3.8s-1.8 3.8-3.1 3.8c-1.5 0-1.9-4.4-2.3-6.4C10.2 14.5 9 13.4 9 11z" fill="#F6F4EE" />
  </svg>
);

/** Lucero has no symbol in its repo: this one is drawn for the board (a morning star over an L, in the brand's wine). */
const LuceroSub = ({ b }: { b: Brand }) => (
  <svg viewBox="0 0 100 100" width="100" height="100" aria-hidden="true">
    <circle className="bl-draw" cx="50" cy="50" r="44" fill="none" stroke="#f3e6d0" strokeWidth="2" pathLength={1} />
    <text x="47" y="74" textAnchor="middle" fontSize="64" fill="#f3e6d0" style={{ fontFamily: fam(b, 'display') }}>L</text>
    <path className="bl-wipe" d="M70 22l2.6 7.4L80 32l-7.4 2.6L70 42l-2.6-7.4L60 32l7.4-2.6z" fill="#f5b942" />
  </svg>
);

/** Sereno (exercise): a crescent moon made of dough, scored like a loaf. */
const SerenoMark = ({ dough = '#f1e4cc', score = '#e0703a', id }: { dough?: string; score?: string; id: string }) => (
  <svg viewBox="0 0 100 100" width="100" height="100" aria-hidden="true">
    <defs>
      <mask id={`${id}c`}><rect width="100" height="100" fill="#fff" /><circle cx="64" cy="40" r="34" fill="#000" /></mask>
    </defs>
    <g className="bl-wipe">
      <circle cx="46" cy="52" r="38" fill={dough} mask={`url(#${id}c)`} />
    </g>
    <g stroke={score} strokeWidth="4.5" strokeLinecap="round">
      <path className="bl-draw" d="M20 46l10 8" pathLength={1} />
      <path className="bl-draw" d="M22 62l11 6" pathLength={1} />
      <path className="bl-draw" d="M32 76l10 3" pathLength={1} />
    </g>
    <path d="M80 18l1.8 5 5 1.8-5 1.8-1.8 5-1.8-5-5-1.8 5-1.8z" fill={dough} />
  </svg>
);

/** Brote (exercise): two leaves out of a seed. */
const BroteMark = ({ leaf = '#2f6b3e', sprout = '#a8d672', seed = '#c9643f' }: { leaf?: string; sprout?: string; seed?: string }) => (
  <svg viewBox="0 0 100 100" width="100" height="100" aria-hidden="true">
    <path className="bl-draw" d="M50 84V46" stroke={leaf} strokeWidth="6" strokeLinecap="round" fill="none" pathLength={1} />
    <g className="bl-wipe">
      <path d="M50 52C50 30 34 18 14 20c0 20 14 34 36 32z" fill={sprout} />
      <path d="M50 44C50 24 64 10 86 12c0 22-14 34-36 32z" fill={leaf} />
    </g>
    <path d="M28 86a22 10 0 0 1 44 0z" fill={seed} />
  </svg>
);

/* ------------------------------------------------------------------ logos (panels A, B, C) */

const word = (b: Brand, text: string, style: CSSProperties) => <span className="bl-word" style={{ fontFamily: fam(b, 'display'), ...style }}>{text}</span>;

export function Logo({ b, part }: { b: Brand; part: Part }): ReactNode {
  const id = `bl-${b.id}-${part}`;
  switch (b.id) {
    case 'ig':
      if (part === 'a') return (
        <div className="bl-lock bl-lock--stack">
          {word(b, 'Ignacio', { fontSize: '19cqi', fontWeight: 900, fontVariationSettings: "'wdth' 125", letterSpacing: '-0.03em', lineHeight: 0.86, color: '#eeeae3' })}
          {word(b, 'Gauna', { fontSize: '19cqi', fontWeight: 300, fontVariationSettings: "'wdth' 62", letterSpacing: '-0.02em', lineHeight: 0.86, color: '#ff4d2e' })}
        </div>
      );
      if (part === 'b') return (
        <div className="bl-lock">
          <span className="bl-sym" style={{ width: '18cqi' }}><IgMonogram ink="#eeeae3" /></span>
          {word(b, 'IGNACIO GAUNA', { fontSize: '7.4cqi', fontWeight: 800, fontVariationSettings: "'wdth' 125", letterSpacing: '0.02em', color: '#eeeae3' })}
        </div>
      );
      return <span className="bl-sym" style={{ width: '62cqi' }}><IgMonogram ink="#0a0a0c" /></span>;
    case 'eclipse':
      if (part === 'a') return (
        <div className="bl-lock">
          <span className="bl-sym" style={{ width: '26cqi' }}><MiniEclipse ink="#f4efe6" id={id} /></span>
          {word(b, 'ECLIPSE', { fontFamily: fam(b, 'text'), fontSize: '8.6cqi', fontWeight: 500, letterSpacing: '0.32em', color: '#f4efe6' })}
        </div>
      );
      if (part === 'b') return (
        <div className="bl-lock">
          <span className="bl-sym" style={{ width: '13cqi' }}><PhaseGlyph ink="#8a5a00" id={id} /></span>
          {word(b, 'ECLIPSE', { fontFamily: fam(b, 'text'), fontSize: '6.4cqi', fontWeight: 500, letterSpacing: '0.32em', color: '#111114' })}
          <span className="bl-bar" style={{ background: '#5b5866' }} />
          <span className="bl-tag" style={{ color: '#5b5866', fontSize: '3.6cqi' }}>PORTAL DE CLIENTES</span>
        </div>
      );
      return <span className="bl-sym" style={{ width: '56cqi' }}><PhaseGlyph ink="#f5b942" id={id} /></span>;
    case 'velmar':
      if (part === 'a') return (
        <div className="bl-lock">
          <span className="bl-sym" style={{ width: '22cqi' }}><VelmarMark ink="#3a4527" /></span>
          {word(b, 'Velmar', { fontSize: '15cqi', fontWeight: 420, fontVariationSettings: "'opsz' 144", letterSpacing: '-0.02em', color: '#1c2016' })}
        </div>
      );
      if (part === 'b') return (
        <div className="bl-lock">
          <span className="bl-sym" style={{ width: '18cqi' }}><VelmarMark ink="#d2ad69" /></span>
          {word(b, 'Velmar', { fontSize: '12cqi', fontWeight: 420, fontVariationSettings: "'opsz' 144", letterSpacing: '-0.02em', color: '#f6f1e8' })}
        </div>
      );
      return (
        <span className="bl-sym bl-tile" style={{ width: '58cqi', background: '#ffffff', borderRadius: '25%', padding: '9cqi 8cqi' }}>
          <VelmarMark ink="#4f523e" />
        </span>
      );
    case 'volta':
      if (part === 'a') return (
        <div className="bl-lock">
          <span className="bl-sym" style={{ width: '22cqi' }}><VoltaMark /></span>
          {word(b, 'VOLTA', { fontSize: '19cqi', fontWeight: 800, letterSpacing: '0.06em', lineHeight: 0.92, color: '#f2f0ea' })}
        </div>
      );
      if (part === 'b') return (
        <div className="bl-lock bl-lock--stack" style={{ alignItems: 'flex-start' }}>
          <span className="bl-tag" style={{ color: '#c8ff2e', fontSize: '4.6cqi', letterSpacing: '0.14em' }}>VOLTA LAB</span>
          {word(b, 'LAB', { fontFamily: FAMILY.Archivo, fontSize: '20cqi', fontWeight: 850, fontVariationSettings: "'wdth' 125", color: '#f2f0ea', lineHeight: 1 })}
          <span className="bl-lane" />
        </div>
      );
      return (
        <span className="bl-sym" style={{ width: '56cqi' }}>
          <svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#0b0c0d" /><g transform="translate(6 5) scale(.82)"><path d="M4 8h14l13 34-5 14z" fill="#f2f0ea" /><path className="bl-wipe" d="M44 8h17L48 30h7L27 60l8.5-23H29z" fill="#c8ff2e" /></g></svg>
        </span>
      );
    case 'dentalos':
      if (part === 'a' || part === 'b') {
        const dark = part === 'b';
        return (
          <div className="bl-lock">
            <span className="bl-sym" style={{ width: dark ? '16cqi' : '20cqi' }}><BrisaMark id={id} /></span>
            <span className="bl-lock bl-lock--stack" style={{ alignItems: 'flex-start', gap: '1cqi' }}>
              {word(b, 'Clínica Brisa', { fontSize: dark ? '8.4cqi' : '10.4cqi', fontWeight: 500, letterSpacing: '-0.005em', color: dark ? '#f2ece1' : '#1b2a28', lineHeight: 1.05 })}
              <span style={{ fontFamily: fam(b, 'text'), fontSize: dark ? 'max(12px, 3.6cqi)' : 'max(12px, 4.2cqi)', color: dark ? '#b9b2a5' : '#55615e' }}>DentalOS · demo</span>
            </span>
          </div>
        );
      }
      return <span className="bl-sym" style={{ width: '54cqi' }}><BrisaFavicon /></span>;
    case 'lucero':
      if (part === 'a') return word(b, 'Lucero', { fontSize: '30cqi', fontWeight: 400, color: '#f3e6d0', lineHeight: 1 });
      if (part === 'b') return (
        <div className="bl-lock">
          {word(b, 'Lucero', { fontSize: '15cqi', fontWeight: 400, color: '#f3e6d0', lineHeight: 1 })}
          <span className="bl-pill" style={{ background: '#f3e6d0', color: '#1a1113', fontFamily: fam(b, 'text'), fontSize: '3.4cqi' }}>DEMO</span>
        </div>
      );
      return <span className="bl-sym" style={{ width: '60cqi' }}><LuceroSub b={b} /></span>;
    case 'sereno':
      if (part === 'a') return (
        <div className="bl-lock bl-lock--stack">
          <span className="bl-sym" style={{ width: '26cqi' }}><SerenoMark id={id} /></span>
          {word(b, 'Sereno', { fontSize: '16cqi', color: '#f1e4cc', lineHeight: 1 })}
          <span className="bl-tag" style={{ fontFamily: fam(b, 'text'), color: '#c9a24a', fontSize: '3.6cqi', letterSpacing: '0.3em' }}>PAN DE MADRUGADA</span>
        </div>
      );
      if (part === 'b') return (
        <div className="bl-lock">
          <span className="bl-sym" style={{ width: '16cqi' }}><SerenoMark id={id} dough="#1d2333" score="#e0703a" /></span>
          {word(b, 'Sereno', { fontSize: '13cqi', color: '#1d2333', lineHeight: 1 })}
        </div>
      );
      return <span className="bl-sym" style={{ width: '60cqi' }}><SerenoMark id={id} dough="#fbf8f1" score="#1d2333" /></span>;
    case 'brote':
      if (part === 'a') return (
        <div className="bl-lock">
          <span className="bl-sym" style={{ width: '24cqi' }}><BroteMark leaf="#f4f1e8" sprout="#a8d672" seed="#c9643f" /></span>
          {word(b, 'brote', { fontSize: '22cqi', fontWeight: 800, fontVariationSettings: "'wdth' 75, 'opsz' 96", letterSpacing: '-0.03em', color: '#f4f1e8', lineHeight: 0.9 })}
        </div>
      );
      if (part === 'b') return (
        <div className="bl-lock bl-lock--stack">
          <span className="bl-sym" style={{ width: '18cqi' }}><BroteMark /></span>
          {word(b, 'brote', { fontSize: '13cqi', fontWeight: 800, fontVariationSettings: "'wdth' 75, 'opsz' 96", letterSpacing: '-0.03em', color: '#2f6b3e', lineHeight: 0.9 })}
          <span className="bl-tag" style={{ fontFamily: fam(b, 'text'), color: '#3b2a20', fontSize: '3.4cqi', letterSpacing: '0.24em' }}>VIVERO DE INTERIOR</span>
        </div>
      );
      return <span className="bl-sym" style={{ width: '60cqi' }}><BroteMark leaf="#2f6b3e" sprout="#f4f1e8" seed="#3b2a20" /></span>;
  }
}

/* ------------------------------------------------------------------ patterns (panel F): three tiles per brand */

/** A square tile filled with an SVG pattern. */
const Tile = ({ id, bg, size, children }: { id: string; bg: string; size: number; children: ReactNode }) => (
  <svg viewBox="0 0 120 120" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
    <defs><pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">{children}</pattern></defs>
    <rect width="120" height="120" fill={bg} />
    <rect width="120" height="120" fill={`url(#${id})`} />
  </svg>
);

/** Halftone: dots that grow toward the center, like the site's eclipse of dots. */
const Halftone = ({ bg, fg }: { bg: string; fg: string }) => {
  const dots: ReactNode[] = [];
  for (let y = 6; y < 120; y += 12) for (let x = 6; x < 120; x += 12) {
    const d = Math.hypot(x - 60, y - 60);
    const r = Math.max(0.6, 5.4 - d / 13);
    dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={r.toFixed(2)} fill={fg} />);
  }
  return <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true"><rect width="120" height="120" fill={bg} />{dots}</svg>;
};

/** A deterministic star field (no randomness: a fixed hash). */
const Stars = ({ bg, fg, n = 46 }: { bg: string; fg: string; n?: number }) => (
  <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
    <rect width="120" height="120" fill={bg} />
    {Array.from({ length: n }, (_, i) => {
      const x = (i * 73.13) % 120, y = (i * 41.7 + (i % 7) * 13) % 120, o = 0.18 + ((i * 37) % 50) / 100;
      return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={i % 9 === 0 ? 1.4 : 0.7} fill={fg} opacity={o.toFixed(2)} />;
    })}
  </svg>
);

export function Patterns({ b }: { b: Brand }): ReactNode[] {
  const p = (n: number) => `bl-${b.id}-p${n}`;
  switch (b.id) {
    case 'ig':
      return [
        <Halftone key="1" bg="#0a0a0c" fg="#ff4d2e" />,
        <svg key="2" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" fill="#0a0a0c" />
          {[18, 48, 78, 108].map((y) => <g key={y}><path d={`M0 ${y}h120`} stroke="#eeeae3" strokeOpacity=".35" strokeWidth="1" /><path d={`M30 ${y}c14 0 18-10 32-10h24`} stroke="#ff4d2e" strokeWidth="1.5" fill="none" /><circle cx="88" cy={y - 10} r="2.6" fill="#ff4d2e" /></g>)}
        </svg>,
        <Tile key="3" id={p(3)} bg="#141418" size={12}><circle cx="6" cy="6" r="1" fill="#eeeae3" opacity=".5" /></Tile>,
      ];
    case 'eclipse':
      return [
        <Stars key="1" bg="#05050a" fg="#f4efe6" />,
        <svg key="2" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" fill="#0c0c14" />
          {Array.from({ length: 90 }, (_, i) => { const a = (i * 4 * Math.PI) / 180, r1 = i % 5 === 0 ? 40 : 44; return <path key={i} d={`M${(60 + Math.cos(a) * r1).toFixed(2)} ${(60 + Math.sin(a) * r1).toFixed(2)}L${(60 + Math.cos(a) * 48).toFixed(2)} ${(60 + Math.sin(a) * 48).toFixed(2)}`} stroke="#f4efe6" strokeOpacity=".45" strokeWidth=".6" />; })}
          <circle cx="60" cy="60" r="30" fill="none" stroke="#f4efe6" strokeOpacity=".2" />
          <path d="M60 60l26-26" stroke="#f5b942" strokeWidth="1.2" /><path d="M86 30l4 4-4 4-4-4z" fill="#f5b942" />
        </svg>,
        <svg key="3" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" fill="#05050a" />
          {[14, 22, 30, 38, 46, 54].map((r, i) => <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="#f5b942" strokeOpacity={(0.9 - i * 0.14).toFixed(2)} strokeWidth="1" />)}
          <circle cx="60" cy="60" r="12" fill="#05050a" stroke="#ffe8b0" strokeWidth="1.2" />
        </svg>,
      ];
    case 'velmar':
      return [
        <Tile key="1" id={p(1)} bg="#f6f1e8" size={20}><path d="M2 14l8-8 8 8" fill="none" stroke="#3a4527" strokeWidth="2.4" /></Tile>,
        <Tile key="2" id={p(2)} bg="#1c2016" size={40}><g transform="translate(8 10) scale(.043)"><path d="M187.5 432.5 323 297l112 112 112-112 135.5 135.5M295.5 487.5 435 627l139.5-139.5" fill="none" stroke="#d2ad69" strokeWidth="78" transform="translate(-156 -234)" /></g></Tile>,
        <svg key="3" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" fill="#ece2cf" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M0 ${6 + i * 10}c30 ${i % 2 ? 4 : -4} 60 ${i % 3 ? -3 : 3} 120 0`} stroke="#b98b5c" strokeOpacity=".7" fill="none" strokeWidth="1.2" />)}
        </svg>,
      ];
    case 'volta':
      return [
        <Tile key="1" id={p(1)} bg="#0b0c0d" size={36}><path d="M20 4 11 19h7l-3 13 10-17h-7z" fill="#c8ff2e" fillOpacity=".55" /></Tile>,
        <svg key="2" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" fill="#f3f3ef" />
          {Array.from({ length: 16 }, (_, i) => <path key={`v${i}`} d={`M${i * 8} 0V120`} stroke="#131518" strokeOpacity={i % 5 === 0 ? 0.18 : 0.06} />)}
          {Array.from({ length: 16 }, (_, i) => <path key={`h${i}`} d={`M0 ${i * 8}H120`} stroke="#131518" strokeOpacity={i % 5 === 0 ? 0.18 : 0.06} />)}
          <path d="M8 96c18-4 22-40 42-44s24 26 44 18 16-30 26-36" stroke="#4a6a00" strokeWidth="2" fill="none" />
        </svg>,
        <svg key="3" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" fill="#121416" />
          {[20, 44, 68, 92].map((y) => <path key={y} d={`M10 ${y}H110`} stroke="#c8ff2e" strokeWidth="2" strokeDasharray="18 12" />)}
          {[32, 56, 80].map((y) => <path key={y} d={`M10 ${y}H110`} stroke="#2ee6d6" strokeOpacity=".5" strokeWidth="1" strokeDasharray="4 8" />)}
        </svg>,
      ];
    case 'dentalos':
      return [
        <svg key="1" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" fill="#f6f1e8" />
          {[20, 44, 68, 92, 116].map((y, i) => <path key={y} d={`M-10 ${y}c30-18 70-18 140 0`} stroke="#b08a3e" strokeOpacity={(0.9 - i * 0.12).toFixed(2)} strokeWidth="2" fill="none" strokeLinecap="round" />)}
        </svg>,
        <Tile key="2" id={p(2)} bg="#e6d9c3" size={30}><path transform="translate(1 2) scale(.9)" d="M9 11c0-2 1.5-3.5 3.5-3.5 1.6 0 2.3.9 3.5.9s1.9-.9 3.5-.9c2 0 3.5 1.5 3.5 3.5 0 2.4-1.2 3.5-1.6 5.6-.4 2-.8 6.4-2.3 6.4-1.3 0-1.4-3.8-3.1-3.8s-1.8 3.8-3.1 3.8c-1.5 0-1.9-4.4-2.3-6.4C10.2 14.5 9 13.4 9 11z" fill="none" stroke="#1e5c55" strokeWidth="1.2" /></Tile>,
        <Tile key="3" id={p(3)} bg="#12302e" size={14}><circle cx="7" cy="7" r="1.6" fill="#d9b66c" opacity=".55" /></Tile>,
      ];
    case 'lucero':
      return [
        <svg key="1" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" fill="#f6edda" />
          {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M0 ${14 + i * 10}H120`} stroke="#2b1d18" strokeOpacity=".16" />)}
          <path d="M22 0V120" stroke="#b23a52" strokeOpacity=".6" />
          {[20, 50, 80, 110].map((y) => <circle key={y} cx="9" cy={y} r="3" fill="#1a1113" />)}
        </svg>,
        <Stars key="2" bg="#1a1113" fg="#f5b942" n={30} />,
        <svg key="3" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" fill="#140d0f" />
          <circle cx="44" cy="70" r="26" fill="#b23a52" /><path d="M44 44a26 26 0 0 1 0 52" fill="#e8909f" />
          <circle cx="84" cy="40" r="15" fill="#d9783a" /><path d="M12 108 112 20" stroke="#ffe8b0" strokeWidth="4" strokeLinecap="round" />
        </svg>,
      ];
    case 'sereno':
      return [
        <Tile key="1" id={p(1)} bg="#f1e4cc" size={30}><path d="M6 10l8 6M14 20l8 6M4 24l6 4" stroke="#8a4b2a" strokeWidth="2.2" strokeLinecap="round" /></Tile>,
        <Tile key="2" id={p(2)} bg="#1d2333" size={40}>
          <path d="M20 34V10" stroke="#c9a24a" strokeWidth="1.4" />
          {[12, 17, 22, 27].map((y) => <g key={y}><ellipse cx="16" cy={y} rx="3.4" ry="1.8" transform={`rotate(-35 16 ${y})`} fill="#c9a24a" /><ellipse cx="24" cy={y} rx="3.4" ry="1.8" transform={`rotate(35 24 ${y})`} fill="#c9a24a" /></g>)}
        </Tile>,
        <Stars key="3" bg="#1d2333" fg="#f1e4cc" n={34} />,
      ];
    case 'brote':
      return [
        <Tile key="1" id={p(1)} bg="#f4f1e8" size={30}><path d="M15 26C15 14 7 7 0 8c0 10 6 17 15 18z" fill="#a8d672" /><path d="M15 22c0-10 8-16 15-15 0 10-7 15-15 15z" fill="#2f6b3e" /></Tile>,
        <Tile key="2" id={p(2)} bg="#2f6b3e" size={16}><ellipse cx="8" cy="8" rx="2.6" ry="1.6" fill="#a8d672" opacity=".7" transform="rotate(30 8 8)" /></Tile>,
        <svg key="3" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" fill="#c9643f" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-20 + i * 20} 120L${40 + i * 20} 0`} stroke="#f4f1e8" strokeOpacity=".22" strokeWidth="6" />)}
        </svg>,
      ];
  }
}

/* ------------------------------------------------------------------ applications (panel G): three per brand */

/** A deterministic square grid that reads as a QR code without encoding anything (a sample, not a real code). */
const FakeQr = ({ x, y, s, fg }: { x: number; y: number; s: number; fg: string }) => {
  const c = s / 9;
  const cells: ReactNode[] = [];
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
    const finder = (i < 3 && j < 3) || (i > 5 && j < 3) || (i < 3 && j > 5);
    if (finder ? !(i % 3 === 1 && j % 3 === 1) : ((i * 7 + j * 13 + i * j) % 3 === 0)) cells.push(<rect key={`${i}-${j}`} x={x + i * c} y={y + j * c} width={c} height={c} fill={fg} />);
  }
  return <g>{cells}</g>;
};

/** A phone, 100 × 200, at (x, y); children are drawn in its screen (0,0)-(88,184). */
const Phone = ({ x = 110, y = 20, frame, screen, children }: { x?: number; y?: number; frame: string; screen: string; children: ReactNode }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width="100" height="200" rx="16" fill={frame} />
    <g transform="translate(6 8)"><rect width="88" height="184" rx="11" fill={screen} />{children}</g>
  </g>
);

type AppProps = { b: Brand; lines: string[][] };

/** Text helper inside SVG, in a brand family. */
const T = ({ b, f = 'text', x, y, size, fill, w = 400, children, anchor, ls, style }: { b: Brand; f?: 'display' | 'text'; x: number; y: number; size: number; fill: string; w?: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; ls?: string; style?: CSSProperties }) => (
  <text x={x} y={y} fontSize={size} fill={fill} fontWeight={w} textAnchor={anchor} letterSpacing={ls} style={css({ fontFamily: fam(b, f), ...style })}>{children}</text>
);

export function Apps({ b, lines }: AppProps): ReactNode[] {
  const L = (i: number, j: number) => lines[i]?.[j] ?? '';
  const id = (n: number) => `bl-${b.id}-g${n}`;
  switch (b.id) {
    case 'ig':
      return [
        <svg key="1" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#141418" />
          <g transform="translate(40 50) rotate(-3 120 70)"><rect width="240" height="140" fill="#eeeae3" />
            <g transform="translate(18 18) scale(.6)"><IgMonogram ink="#0a0a0c" /></g>
            <T b={b} f="display" x={18} y={104} size={22} fill="#0a0a0c" w={900} style={{ fontVariationSettings: "'wdth' 125" }}>{L(0, 0)}</T>
            <text x={18} y={124} fontSize={9} fill="#5c5952" letterSpacing="1.4" style={{ fontFamily: FAMILY['JetBrains Mono'] }}>{L(0, 1)}</text>
          </g>
        </svg>,
        <svg key="2" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#141418" />
          <g transform="translate(100 14)"><rect width="120" height="212" fill="#0a0a0c" />
            <g transform="translate(20 22) scale(.67)"><Halftone bg="#0a0a0c" fg="#ff4d2e" /></g>
            <T b={b} f="display" x={12} y={136} size={17} fill="#eeeae3" w={900} style={{ fontVariationSettings: "'wdth' 125" }}>{L(1, 0)}</T>
            <T b={b} f="display" x={12} y={154} size={17} fill="#eeeae3" w={900} style={{ fontVariationSettings: "'wdth' 125" }}>{L(1, 1)}</T>
            <text x={12} y={196} fontSize={7.5} fill="#8d8a83" letterSpacing="1.2" style={{ fontFamily: FAMILY['JetBrains Mono'] }}>{L(1, 2)}</text>
          </g>
        </svg>,
        <svg key="3" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#141418" />
          <Phone frame="#26262b" screen="#0a0a0c">
            <g transform="translate(8 10) scale(.28)"><IgMonogram ink="#eeeae3" /></g>
            <path d="M68 16h12M68 21h12" stroke="#eeeae3" strokeWidth="1.4" />
            <T b={b} f="display" x={8} y={70} size={17} fill="#eeeae3" w={900} style={{ fontVariationSettings: "'wdth' 125" }}>Ignacio</T>
            <T b={b} f="display" x={8} y={88} size={17} fill="#ff4d2e" w={300} style={{ fontVariationSettings: "'wdth' 62" }}>Gauna</T>
            <rect x="8" y="150" width="72" height="20" fill="#ff4d2e" />
            <text x={44} y={163} fontSize={7} fill="#0a0a0c" textAnchor="middle" style={{ fontFamily: FAMILY['JetBrains Mono'] }}>{L(2, 0)}</text>
          </Phone>
        </svg>,
      ];
    case 'eclipse':
      return [
        <svg key="1" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#0c0c14" />
          <g transform="translate(40 50) rotate(2 120 70)"><rect width="240" height="140" fill="#05050a" stroke="#24232e" />
            <g transform="translate(20 22) scale(1.4)"><MiniEclipse ink="#f4efe6" id={id(1)} /></g>
            <T b={b} x={60} y={42} size={11} fill="#f4efe6" w={500} ls="3.4">ECLIPSE</T>
            <T b={b} f="display" x={20} y={104} size={20} fill="#f4efe6">{L(0, 0)}</T>
            <T b={b} f="display" x={20} y={124} size={20} fill="#f5b942" style={{ fontStyle: 'italic' }}>{L(0, 1)}</T>
          </g>
        </svg>,
        <svg key="2" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#0c0c14" />
          <g transform="translate(20 22)"><rect width="280" height="196" rx="8" fill="#05050a" stroke="#24232e" />
            <circle cx="140" cy="88" r="46" fill="#f5b942" opacity=".16" /><circle cx="140" cy="88" r="30" fill="#ffe8b0" opacity=".9" /><circle cx="140" cy="88" r="29.5" fill="#05050a" />
            <circle cx="140" cy="88" r="31" fill="none" stroke="#f5b942" strokeWidth="1.4" />
            <T b={b} f="display" x={140} y={152} size={17} fill="#f4efe6" anchor="middle">{L(1, 0)}</T>
            <T b={b} f="display" x={140} y={170} size={17} fill="#f5b942" anchor="middle" style={{ fontStyle: 'italic' }}>{L(1, 1)}</T>
            <rect x="96" y="178" width="88" height="12" rx="6" fill="#f5b942" />
          </g>
        </svg>,
        <svg key="3" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#0c0c14" />
          <g transform="translate(60 20)"><rect width="200" height="200" rx="6" fill="#f4efe6" />
            <g transform="translate(16 14) scale(.9)"><PhaseGlyph ink="#8a5a00" id={id(3)} /></g>
            <T b={b} x={42} y={29} size={8} fill="#111114" w={500} ls="2.4">ECLIPSE</T>
            <T b={b} f="display" x={16} y={72} size={20} fill="#111114">{L(2, 0)}</T>
            {[92, 104, 116, 128].map((y, i) => <rect key={y} x="16" y={y} width={i === 3 ? 96 : 168} height="5" rx="2.5" fill="#5b5866" opacity=".35" />)}
            <rect x="16" y="150" width="96" height="24" rx="12" fill="#f5b942" />
            <T b={b} x={64} y={166} size={8.5} fill="#05050a" w={600} anchor="middle">{L(2, 1)}</T>
          </g>
        </svg>,
      ];
    case 'velmar':
      return [
        <svg key="1" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#ece2cf" />
          <path d="M160 10c-6 20 6 28 0 44" stroke="#b98b5c" strokeWidth="2" fill="none" />
          <g transform="translate(110 50)"><path d="M0 20 20 0h60l20 20v150H0z" fill="#fffdf8" stroke="#e2d8c4" /><circle cx="50" cy="14" r="5" fill="#ece2cf" stroke="#b98b5c" />
            <g transform="translate(26 40) scale(.09)"><g transform="translate(-156 -234)"><path d="M187.5 432.5 323 297l112 112 112-112 135.5 135.5M295.5 487.5 435 627l139.5-139.5" fill="none" stroke="#3a4527" strokeWidth="78" /></g></g>
            <T b={b} f="display" x={50} y={112} size={18} fill="#1c2016" anchor="middle" style={{ fontVariationSettings: "'opsz' 144" }}>Velmar</T>
            <T b={b} x={50} y={132} size={7} fill="#5d6050" anchor="middle" w={800} ls="1.3">{L(0, 0)}</T>
            <T b={b} x={50} y={146} size={7} fill="#5d6050" anchor="middle">{L(0, 1)}</T>
          </g>
        </svg>,
        <svg key="2" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#1c2016" />
          <ellipse cx="160" cy="176" rx="96" ry="22" fill="#262c1d" />
          <rect x="64" y="96" width="192" height="80" fill="#b9bdb0" /><ellipse cx="160" cy="96" rx="96" ry="22" fill="#d6d9cf" />
          <rect x="96" y="114" width="128" height="52" rx="4" fill="#f6f1e8" />
          <g transform="translate(108 124) scale(.06)"><g transform="translate(-156 -234)"><path d="M187.5 432.5 323 297l112 112 112-112 135.5 135.5M295.5 487.5 435 627l139.5-139.5" fill="none" stroke="#3a4527" strokeWidth="78" /></g></g>
          <T b={b} f="display" x={148} y={140} size={15} fill="#1c2016" style={{ fontVariationSettings: "'opsz' 144" }}>Velmar</T>
          <T b={b} x={148} y={156} size={7} fill="#5d6050" w={800} ls="1.2">{L(1, 0)}</T>
        </svg>,
        <svg key="3" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#ece2cf" />
          <Phone frame="#1c2016" screen="#f6f1e8">
            <g transform="translate(8 10) scale(.03)"><g transform="translate(-156 -234)"><path d="M187.5 432.5 323 297l112 112 112-112 135.5 135.5M295.5 487.5 435 627l139.5-139.5" fill="none" stroke="#3a4527" strokeWidth="78" /></g></g>
            <T b={b} f="display" x={28} y={22} size={10} fill="#1c2016">Velmar</T>
            <rect x="8" y="34" width="72" height="62" rx="6" fill="#ece2cf" /><circle cx="44" cy="65" r="18" fill="#b98b5c" /><circle cx="44" cy="65" r="11" fill="#d6b48a" />
            <T b={b} f="display" x={8} y={114} size={10} fill="#1c2016">{L(2, 0)}</T>
            <T b={b} x={8} y={128} size={7} fill="#5d6050">{L(2, 1)}</T>
            <rect x="8" y="150" width="72" height="20" rx="10" fill="#3a4527" />
            <T b={b} x={44} y={163} size={7} fill="#fffdf8" w={800} anchor="middle">{L(2, 2)}</T>
          </Phone>
        </svg>,
      ];
    case 'volta':
      return [
        <svg key="1" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#0b0c0d" />
          <defs><linearGradient id={id(1)} x1="0" x2="1"><stop offset="0" stopColor="#1f2225" /><stop offset=".55" stopColor="#151719" /><stop offset=".85" stopColor="#0b0c0d" /><stop offset="1" stopColor="#c8ff2e" stopOpacity=".5" /></linearGradient></defs>
          <rect x="104" y="40" width="112" height="22" rx="4" fill="#26292d" />
          <rect x="96" y="58" width="128" height="160" rx="10" fill={`url(#${id(1)})`} />
          <rect x="96" y="96" width="128" height="88" fill="#151719" />
          <text x={108} y={112} fontSize={7} fill="#f2f0ea" opacity=".82" letterSpacing="1.4" style={{ fontFamily: FAMILY['JetBrains Mono'] }}>VOLTA LAB</text>
          <T b={b} x={108} y={140} size={12.5} fill="#f2f0ea" w={850} style={{ fontFamily: FAMILY.Archivo, fontVariationSettings: "'wdth' 125" }}>{L(0, 0)}</T>
          <text x={108} y={156} fontSize={7} fill="#a6abb0" style={{ fontFamily: FAMILY['JetBrains Mono'] }}>{L(0, 1)}</text>
          <path d="M208 100h12l-5 22h5L204 168l4-30h-5z" fill="#c8ff2e" />
          <rect x="96" y="172" width="128" height="12" fill="#2ee6d6" opacity=".85" />
        </svg>,
        <svg key="2" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#060707" />
          <g transform="translate(100 14)"><rect width="120" height="212" fill="#0b0c0d" stroke="#33383d" />
            <g transform="translate(26 20) scale(1.05)"><VoltaMark /></g>
            <T b={b} f="display" x={60} y={124} size={30} fill="#f2f0ea" w={800} anchor="middle" ls="1">{L(1, 0)}</T>
            <T b={b} f="display" x={60} y={152} size={30} fill="#c8ff2e" w={800} anchor="middle" ls="1">{L(1, 1)}</T>
            <text x={60} y={192} fontSize={7} fill="#a6abb0" textAnchor="middle" letterSpacing="1.4" style={{ fontFamily: FAMILY['JetBrains Mono'] }}>{L(1, 2)}</text>
          </g>
        </svg>,
        <svg key="3" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#121416" />
          <Phone frame="#33383d" screen="#0b0c0d">
            <g transform="translate(8 8) scale(.25)"><VoltaMark /></g>
            <T b={b} f="display" x={28} y={22} size={12} fill="#f2f0ea" w={800} ls="1">VOLTA</T>
            <rect x="8" y="36" width="72" height="56" rx="6" fill="#151719" /><path d="M50 44h12l-6 18h5L45 86l4-18h-6z" fill="#c8ff2e" />
            <T b={b} f="display" x={8} y={110} size={13} fill="#f2f0ea" w={800}>{L(2, 0)}</T>
            <text x={8} y={124} fontSize={6.5} fill="#a6abb0" style={{ fontFamily: FAMILY['JetBrains Mono'] }}>{L(2, 1)}</text>
            <rect x="8" y="150" width="72" height="20" rx="4" fill="#c8ff2e" />
            <T b={b} x={44} y={163} size={7.5} fill="#0b0c0d" w={800} anchor="middle">{L(2, 2)}</T>
          </Phone>
        </svg>,
      ];
    case 'dentalos':
      return [
        <svg key="1" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#e6d9c3" />
          <g transform="translate(40 46) rotate(-2 120 74)"><rect width="240" height="148" rx="10" fill="#fffcf7" />
            <g transform="translate(16 14) scale(.62)"><BrisaMark id={id(1)} /></g>
            <T b={b} f="display" x={52} y={33} size={14} fill="#1b2a28" w={500}>Clínica Brisa</T>
            <T b={b} x={16} y={74} size={8} fill="#55615e" w={600} ls="1.2">{L(0, 0)}</T>
            <T b={b} f="display" x={16} y={100} size={22} fill="#1e5c55" w={500}>{L(0, 1)}</T>
            <T b={b} x={16} y={120} size={9} fill="#55615e">{L(0, 2)}</T>
            <FakeQr x={170} y={64} s={54} fg="#1b2a28" />
          </g>
        </svg>,
        <svg key="2" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#12302e" />
          <g transform="translate(100 14)"><rect width="120" height="212" fill="#f6f1e8" />
            {[40, 56, 72].map((y, i) => <path key={y} d={`M-2 ${y}c40-14 84-14 124 0`} stroke="#b08a3e" strokeOpacity={(0.9 - i * 0.25).toFixed(2)} strokeWidth="2" fill="none" />)}
            <T b={b} f="display" x={12} y={112} size={14} fill="#1b2a28" w={500}>{L(1, 0)}</T>
            <T b={b} f="display" x={12} y={130} size={14} fill="#1e5c55" w={500} style={{ fontStyle: 'italic' }}>{L(1, 1)}</T>
            <g transform="translate(12 176) scale(.5)"><BrisaMark id={id(2)} /></g>
            <T b={b} x={42} y={194} size={8} fill="#1b2a28" w={600}>Clínica Brisa</T>
          </g>
        </svg>,
        <svg key="3" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#e6d9c3" />
          <Phone frame="#1b2a28" screen="#f6f1e8">
            <g transform="translate(8 8) scale(.36)"><BrisaMark id={id(3)} /></g>
            <T b={b} f="display" x={28} y={20} size={9} fill="#1b2a28" w={500}>Clínica Brisa</T>
            <rect x="8" y="36" width="72" height="66" rx="6" fill="#fffcf7" stroke="#d8cdbb" />
            <T b={b} x={14} y={52} size={6.5} fill="#55615e" w={600}>{L(2, 0)}</T>
            <T b={b} f="display" x={14} y={72} size={15} fill="#1e5c55" w={500}>{L(2, 1)}</T>
            <T b={b} x={14} y={90} size={6.5} fill="#55615e">{L(2, 2)}</T>
            <rect x="8" y="150" width="72" height="20" rx="6" fill="#1e5c55" />
            <T b={b} x={44} y={163} size={7} fill="#ffffff" w={700} anchor="middle">{L(2, 3)}</T>
          </Phone>
        </svg>,
      ];
    case 'lucero':
      return [
        <svg key="1" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#241719" />
          <rect x="40" y="196" width="240" height="10" rx="2" fill="#3a2a2d" />
          <path d="M100 196 130 46h60l30 150z" fill="#1a1113" stroke="#3a2a2d" />
          <T b={b} f="display" x={160} y={80} size={24} fill="#f3e6d0" anchor="middle">Lucero</T>
          <FakeQr x={132} y={92} s={56} fg="#f3e6d0" />
          <T b={b} x={160} y={168} size={8} fill="#cdb9a0" anchor="middle">{L(0, 0)}</T>
          <T b={b} x={160} y={182} size={8} fill="#f5b942" anchor="middle" w={600}>{L(0, 1)}</T>
        </svg>,
        <svg key="2" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#140d0f" />
          <g transform="translate(90 14) rotate(-2 70 106)"><rect width="140" height="212" fill="#f6edda" />
            {Array.from({ length: 15 }, (_, i) => <path key={i} d={`M0 ${40 + i * 11}H140`} stroke="#2b1d18" strokeOpacity=".12" />)}
            <path d="M18 0V212" stroke="#b23a52" strokeOpacity=".6" />
            <T b={b} f="display" x={28} y={30} size={20} fill="#2b1d18">{L(1, 0)}</T>
            {[0, 1, 2, 3].map((k) => <g key={k}><T b={b} f="display" x={28} y={62 + k * 33} size={12} fill="#2b1d18">{L(1, 1 + k)}</T><T b={b} x={28} y={74 + k * 33} size={7} fill="#6b5a4e">{L(1, 5 + k)}</T></g>)}
          </g>
        </svg>,
        <svg key="3" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#241719" />
          <Phone frame="#3a2a2d" screen="#1a1113">
            <T b={b} f="display" x={8} y={22} size={14} fill="#f3e6d0">Lucero</T>
            <rect x="56" y="12" width="26" height="11" rx="5.5" fill="#f3e6d0" /><T b={b} x={69} y={20} size={5.5} fill="#1a1113" anchor="middle" ls=".6">DEMO</T>
            <rect x="8" y="34" width="72" height="104" rx="4" fill="#f6edda" />
            {[0, 1, 2].map((k) => <g key={k}><T b={b} f="display" x={14} y={54 + k * 26} size={10} fill="#2b1d18">{L(2, k)}</T><path d={`M14 ${60 + k * 26}H74`} stroke="#2b1d18" strokeOpacity=".15" /></g>)}
            <rect x="8" y="150" width="72" height="20" rx="10" fill="#b23a52" />
            <T b={b} x={44} y={163} size={7} fill="#f3e6d0" w={600} anchor="middle">{L(2, 3)}</T>
          </Phone>
        </svg>,
      ];
    case 'sereno':
      return [
        <svg key="1" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#1d2333" />
          <path d="M104 50h112l10 170H94z" fill="#d9c19a" /><path d="M104 50l-10 16h132l-10-16" fill="#c9ad80" />
          <path d="M94 66h132" stroke="#8a4b2a" strokeOpacity=".3" />
          <g transform="translate(130 86) scale(.6)"><SerenoMark id={id(1)} dough="#1d2333" score="#e0703a" /></g>
          <T b={b} f="display" x={160} y={172} size={24} fill="#1d2333" anchor="middle">Sereno</T>
          <T b={b} x={160} y={190} size={7} fill="#8a4b2a" anchor="middle" w={600} ls="2.2">{L(0, 0)}</T>
        </svg>,
        <svg key="2" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#f1e4cc" />
          <circle cx="160" cy="120" r="84" fill="#e0703a" /><circle cx="160" cy="120" r="74" fill="none" stroke="#fbf8f1" strokeDasharray="2 5" />
          <g transform="translate(132 62) scale(.56)"><SerenoMark id={id(2)} dough="#fbf8f1" score="#1d2333" /></g>
          <T b={b} f="display" x={160} y={142} size={22} fill="#fbf8f1" anchor="middle">Sereno</T>
          <T b={b} x={160} y={162} size={7.5} fill="#1d2333" anchor="middle" w={600} ls="1.8">{L(1, 0)}</T>
          <T b={b} x={160} y={176} size={7.5} fill="#1d2333" anchor="middle">{L(1, 1)}</T>
        </svg>,
        <svg key="3" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#2a3045" />
          <g transform="translate(100 14)"><rect width="120" height="212" fill="#1d2333" />
            <g transform="translate(6 10) scale(.9)"><Stars bg="#1d2333" fg="#f1e4cc" n={18} /></g>
            <g transform="translate(26 26) scale(.68)"><SerenoMark id={id(3)} /></g>
            <T b={b} f="display" x={12} y={128} size={15} fill="#f1e4cc">{L(2, 0)}</T>
            <T b={b} f="display" x={12} y={146} size={13} fill="#e0703a">{L(2, 1)}</T>
            <T b={b} x={12} y={194} size={7} fill="#c9a24a" w={600} ls="1.6">{L(2, 2)}</T>
          </g>
        </svg>,
      ];
    case 'brote':
      return [
        <svg key="1" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#f4f1e8" />
          <path d="M150 190V226" stroke="#3b2a20" strokeWidth="6" />
          <rect x="96" y="40" width="128" height="150" rx="8" fill="#2f6b3e" />
          <g transform="translate(108 52) scale(.46)"><BroteMark leaf="#f4f1e8" sprout="#a8d672" seed="#c9643f" /></g>
          <T b={b} f="display" x={160} y={82} size={19} fill="#f4f1e8" w={800} style={{ fontVariationSettings: "'wdth' 75, 'opsz' 96" }}>brote</T>
          <T b={b} x={112} y={124} size={10} fill="#f4f1e8" w={700}>{L(0, 0)}</T>
          {[1, 2, 3].map((k) => <T key={k} b={b} x={112} y={128 + k * 14} size={8} fill="#a8d672">{L(0, k)}</T>)}
        </svg>,
        <svg key="2" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#a8d672" />
          <path d="M112 30c-4 30 10 40 48 40s52-10 48-40" stroke="#2f6b3e" strokeWidth="4" fill="none" />
          <path d="M92 70h136l-12 150H104z" fill="#f4f1e8" />
          <g transform="translate(128 96) scale(.64)"><BroteMark /></g>
          <T b={b} f="display" x={160} y={186} size={24} fill="#2f6b3e" w={800} anchor="middle" style={{ fontVariationSettings: "'wdth' 75, 'opsz' 96" }}>brote</T>
          <T b={b} x={160} y={204} size={7} fill="#3b2a20" anchor="middle" w={600} ls="1.6">{L(1, 0)}</T>
        </svg>,
        <svg key="3" viewBox="0 0 320 240" aria-hidden="true"><rect width="320" height="240" fill="#2f6b3e" />
          <Phone frame="#22301f" screen="#f4f1e8">
            <g transform="translate(6 6) scale(.22)"><BroteMark /></g>
            <T b={b} f="display" x={30} y={21} size={13} fill="#2f6b3e" w={800} style={{ fontVariationSettings: "'wdth' 75, 'opsz' 96" }}>brote</T>
            <rect x="8" y="34" width="72" height="62" rx="8" fill="#a8d672" /><path d="M44 92V64" stroke="#2f6b3e" strokeWidth="3" /><path d="M44 70c0-12-8-18-18-17 0 10 7 17 18 17z" fill="#2f6b3e" /><path d="M44 64c0-11 8-17 17-16 0 10-7 16-17 16z" fill="#6f7f3a" />
            <T b={b} f="display" x={8} y={114} size={11} fill="#22301f" w={800}>{L(2, 0)}</T>
            <T b={b} x={8} y={128} size={7} fill="#5a6352">{L(2, 1)}</T>
            <rect x="8" y="150" width="72" height="20" rx="10" fill="#c9643f" />
            <T b={b} x={44} y={163} size={7} fill="#f4f1e8" w={700} anchor="middle">{L(2, 2)}</T>
          </Phone>
        </svg>,
      ];
  }
}

export const KINDS: Record<BrandId, Part[]> = { ig: ['a', 'b', 'c'], eclipse: ['a', 'b', 'c'], velmar: ['a', 'b', 'c'], volta: ['a', 'b', 'c'], dentalos: ['a', 'b', 'c'], lucero: ['a', 'b', 'c'], sereno: ['a', 'b', 'c'], brote: ['a', 'b', 'c'] };
