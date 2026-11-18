import type { CSSProperties, ReactNode } from 'react';
import { GATE_THEMES, type GateTheme } from '@/v2/gate/themes';
import { JumpText } from '../ui/JumpText';

/** The colours of a screen, as the CSS variables everything written on it reads. */
export const themeVars = (theme: GateTheme) => {
  const t = GATE_THEMES[theme];
  return { '--bg': t.bg, '--fg': t.fg, '--soft': t.soft, '--alt': t.alt, '--dot': t.dot, '--btn': t.btn, '--btn-fg': t.btnFg, '--focus-c': t.focus, '--edge': t.edge } as CSSProperties;
};

/**
 * A stretch of the home (lote 3.2): one flat colour from edge to edge, in the language of the gate. Its colour
 * arrives as a dome that rises over the previous stretch and flattens while the page scrolls (`.hm-cap`, tied
 * to the scroll by the motion engine; a filo of a second colour runs ahead of it). The kicker's ball drops in
 * and the letters of the title jump in when the stretch comes on screen.
 */
export function HomeSection({ id, theme, n, kicker, title, children, className }: {
  id: string; theme: GateTheme; n: string; kicker: string; title: string; children: ReactNode; className?: string;
}) {
  return (
    <section className={className ? `hm-sec ${className}` : 'hm-sec'} id={id} data-theme={theme} aria-labelledby={`${id}-h`} style={themeVars(theme)}>
      <span className="hm-cap" data-scroll aria-hidden="true"><i /><i /></span>
      <div className="hm-in">
        <header className="hm-head" data-reveal>
          <p className="hm-kicker"><i className="hm-ball" aria-hidden="true" /><b>{n}</b>{kicker}</p>
          <h2 id={`${id}-h`} className="hm-title"><JumpText text={title} /></h2>
        </header>
        {children}
      </div>
    </section>
  );
}
