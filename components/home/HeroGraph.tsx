import type { CSSProperties } from 'react';
import { InView } from '@/components/diagrams/InView';

type Lane = { d: string; tone: string; commits: [number, number][]; tag?: { x: number; y: number; text: string } };

/**
 * The hero's branch graph: one main line since 2021, three branches (AI, fullstack, quality) that merge back into
 * production. Lines draw in on load; while on screen a light travels the main line. Decorative (aria-hidden):
 * the same facts are text in the hero. Two drawings: wide (600×440) and phone (360×230, no branch labels).
 */
export function HeroGraph({ labels }: { labels: { start: string; ai: string; full: string; quality: string; prod: string } }) {
  const wide: Lane[] = [
    { d: 'M96 360C140 360 140 140 184 140H464C508 140 508 360 552 360', tone: '#7fa3ff', commits: [[250, 140], [330, 140], [410, 140]], tag: { x: 330, y: 110, text: labels.full } },
    { d: 'M150 360C190 360 190 250 230 250H390C430 250 430 360 470 360', tone: 'var(--accent)', commits: [[270, 250], [320, 250], [370, 250]], tag: { x: 312, y: 220, text: labels.ai } },
    { d: 'M236 360C258 360 258 310 280 310H376C398 310 398 360 420 360', tone: '#4fc76a', commits: [[302, 310], [344, 310]], tag: { x: 328, y: 290, text: labels.quality } },
  ];
  const phone: Lane[] = [
    { d: 'M54 190C86 190 86 70 118 70H276C308 70 308 190 336 190', tone: '#7fa3ff', commits: [[160, 70], [214, 70], [256, 70]] },
    { d: 'M92 190C116 190 116 128 140 128H236C260 128 260 190 284 190', tone: 'var(--accent)', commits: [[166, 128], [210, 128]] },
    { d: 'M140 190C152 190 152 162 164 162H210C222 162 222 190 234 190', tone: '#4fc76a', commits: [[187, 162]] },
  ];
  const draw = (lanes: Lane[], w: number, y: number, tags: boolean, font: number) => (
    <>
      <path className="hg__main" d={`M24 ${y}H${w - 24}`} pathLength={1} />
      {lanes.map((l, i) => (
        <g key={l.d} style={{ '--o': i, color: l.tone } as CSSProperties}>
          <path className="hg__lane" d={l.d} pathLength={1} />
          {l.commits.map(([cx, cy], k) => <circle key={k} className="hg__commit" cx={cx} cy={cy} r={5} style={{ '--k': k } as CSSProperties} />)}
          {tags && l.tag && (
            <g className="hg__tag">
              <rect x={l.tag.x - (l.tag.text.length * font * 0.6) / 2 - 9} y={l.tag.y - font} width={l.tag.text.length * font * 0.6 + 18} height={font + 12} rx={5} />
              <text x={l.tag.x} y={l.tag.y + 1} fontSize={font} textAnchor="middle">{l.tag.text}</text>
            </g>
          )}
        </g>
      ))}
      <path className="hg__pkt" d={`M24 ${y}H${w - 24}`} pathLength={1} />
      <circle className="hg__seed" cx={24} cy={y} r={7} />
      <text className="hg__t" x={24} y={y + font + 18} fontSize={font}>{labels.start}</text>
      <g className="hg__prod">
        <circle cx={w - 24} cy={y} r={9} />
        <circle className="hg__ring" cx={w - 24} cy={y} r={9} />
        <text x={w - 24} y={y + font + 18} fontSize={font} textAnchor="end">{labels.prod}</text>
      </g>
    </>
  );
  return (
    <InView live className="hg" aria-hidden="true">
      <svg className="hg__svg hg__svg--wide" viewBox="0 0 600 420">{draw(wide, 600, 360, true, 15)}</svg>
      <svg className="hg__svg hg__svg--phone" viewBox="0 0 360 240">{draw(phone, 360, 190, false, 14)}</svg>
    </InView>
  );
}
