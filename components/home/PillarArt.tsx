import type { CSSProperties } from 'react';

/** A small drawing per pillar of «Qué hago» (240×120, decorative). Lines draw in; a light moves while on screen. */
export function PillarArt({ id }: { id: 'ai' | 'full' | 'quality' | 'motion' }) {
  const s = (o: number) => ({ '--o': o }) as CSSProperties;
  switch (id) {
    case 'ai':
      return (
        <svg viewBox="0 0 240 120" className="pa" aria-hidden="true">
          <g className="pa__ink">
            <path d="M22 30h34l10 10v50H22z" /><path d="M30 52h26M30 62h20M30 72h24" className="pa__soft" />
            <circle cx="120" cy="60" r="22" /><path d="M120 46l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" className="pa__acc" />
            <rect x="172" y="38" width="50" height="44" rx="8" /><path d="M182 54h30M182 64h20" className="pa__soft" /><path d="M206 74l6 6 10-12" className="pa__ok" />
          </g>
          <path className="pa__line" d="M66 60H98" pathLength={1} style={s(0)} /><path className="pa__line" d="M142 60H172" pathLength={1} style={s(1)} />
          <path className="pa__pkt" d="M66 60H98M142 60H172" pathLength={1} />
        </svg>
      );
    case 'full':
      return (
        <svg viewBox="0 0 240 120" className="pa" aria-hidden="true">
          <g className="pa__ink">
            <rect x="20" y="20" width="62" height="44" rx="6" /><path d="M20 30h62" className="pa__soft" />
            <rect x="96" y="46" width="52" height="30" rx="6" /><circle cx="108" cy="61" r="3" className="pa__dot" />
            <ellipse cx="190" cy="66" rx="26" ry="8" /><path d="M164 66v26c0 4 12 8 26 8s26-4 26-8V66" /><path d="M164 79c0 4 12 8 26 8s26-4 26-8" className="pa__soft" />
          </g>
          <path className="pa__line" d="M82 42C92 42 88 61 96 61" pathLength={1} style={s(0)} /><path className="pa__line" d="M148 61C158 61 156 66 164 66" pathLength={1} style={s(1)} />
          <path className="pa__pkt" d="M82 42C92 42 88 61 96 61L148 61C158 61 156 66 164 66" pathLength={1} />
        </svg>
      );
    case 'quality':
      return (
        <svg viewBox="0 0 240 120" className="pa" aria-hidden="true">
          <g className="pa__ink">
            <path d="M60 16l30 12v22c0 20-13 34-30 42-17-8-30-22-30-42V28z" />
            {[34, 60, 86].map((y, i) => <g key={y}><rect x="122" y={y - 9} width="18" height="18" rx="4" /><path d={`M150 ${y}h${70 - i * 14}`} className="pa__soft" /></g>)}
          </g>
          <path className="pa__line pa__okline" d="M47 54l9 9 18-20" pathLength={1} style={s(0)} />
          {[34, 60, 86].map((y, i) => <path key={y} className="pa__line pa__okline" d={`M126 ${y}l4 4 7-8`} pathLength={1} style={s(i + 1)} />)}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 240 120" className="pa" aria-hidden="true">
          <g className="pa__ink"><path d="M24 100H216M24 100V16" className="pa__soft" /><path d="M24 100l58-62M216 18l-60 20" className="pa__soft" /><circle cx="82" cy="38" r="4" className="pa__dot" /><circle cx="156" cy="38" r="4" className="pa__dot" /></g>
          <path className="pa__line" d="M24 100C82 38 156 38 216 18" pathLength={1} style={s(0)} />
          <path className="pa__pkt pa__pkt--ease" d="M24 100C82 38 156 38 216 18" pathLength={1} />
        </svg>
      );
  }
}
