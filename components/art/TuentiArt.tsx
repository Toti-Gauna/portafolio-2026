import type { CSSProperties, ReactNode } from 'react';
import { InView } from '@/components/diagrams/InView';
import './art.css';

type Item = { t: string; d: string };
export type TuentiArtCopy = { items: { wheel: Item; referrals: Item; dashboard: Item; labels: { prize: string; invite: string; joined: string; recurrence: string; referrals: string; game: string } }; caption: string };

const SEG = ['#ff4d2e', '#eeeae3', '#2b50ff', '#1d1d23', '#ff4d2e', '#eeeae3', '#2b50ff', '#1d1d23'];
const arc = (i: number, n: number, r: number) => {
  const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
  const p = (a: number) => `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
  return `M0 0L${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}Z`;
};

/** Tuenti, drawn: the roulette, the referral loop and the metrics dashboard. Own illustrations, fictional data, no product UI. */
export function TuentiArt({ c }: { c: TuentiArtCopy }) {
  const L = c.items.labels;
  const card = (key: keyof Omit<TuentiArtCopy['items'], 'labels'>, svg: ReactNode, i: number) => (
    <div className="art__card" style={{ '--o': i } as CSSProperties}>
      {svg}
      <h4 className="art__t">{c.items[key].t}</h4>
      <p className="art__d">{c.items[key].d}</p>
    </div>
  );
  return (
    <InView live as="figure" className="art art--tuenti">
      <div className="art__grid">
        {card('wheel', (
          <svg viewBox="0 0 400 300" aria-hidden="true" className="art__svg">
            <g transform="translate(150 158)">
              <g className="art-wheel">{SEG.map((f, i) => <path key={i} d={arc(i, 8, 112)} fill={f} stroke="#0e0e10" strokeWidth={3} />)}</g>
              <circle r={26} fill="#0e0e10" stroke="#eeeae3" strokeWidth={3} />
              <path d="M-9 0l6 6 12-13" fill="none" stroke="#ff4d2e" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <path d="M150 32l-14 -24h28z" fill="#eeeae3" />
            <g className="art-prize">
              <rect x={286} y={120} width={98} height={44} rx={22} fill="#2b50ff" />
              <text x={335} y={148} textAnchor="middle" fontSize={18} fill="#eeeae3" fontWeight={700}>{L.prize}</text>
              {[[300, 104], [366, 100], [384, 180], [296, 184], [340, 92]].map(([x, y], k) => <circle key={k} className="art-confetti" cx={x} cy={y} r={4} fill={k % 2 ? '#ffc21a' : '#ff4d2e'} style={{ '--k': k } as CSSProperties} />)}
            </g>
          </svg>
        ), 0)}
        {card('referrals', (
          <svg viewBox="0 0 400 300" aria-hidden="true" className="art__svg">
            {[[300, 70], [320, 160], [290, 246]].map(([x, y], k) => (
              <g key={k} className="art-ref" style={{ '--k': k } as CSSProperties}>
                <path className="art-ref__link" d={`M110 150C200 150 ${x - 90} ${y} ${x - 26} ${y}`} pathLength={1} />
                <circle cx={x} cy={y} r={24} fill="#16161a" stroke="#7fa3ff" strokeWidth={3} />
                <circle cx={x} cy={y - 6} r={7} fill="#7fa3ff" /><path d={`M${x - 11} ${y + 13}c3-9 19-9 22 0`} stroke="#7fa3ff" strokeWidth={3} fill="none" strokeLinecap="round" />
                <g className="art-ref__plus"><rect x={x + 18} y={y - 34} width={34} height={24} rx={12} fill="#ffc21a" /><text x={x + 35} y={y - 16} textAnchor="middle" fontSize={17} fontWeight={700} fill="#0e0e10">+1</text></g>
              </g>
            ))}
            <circle cx={84} cy={150} r={34} fill="#16161a" stroke="#ff4d2e" strokeWidth={3} />
            <circle cx={84} cy={140} r={10} fill="#ff4d2e" /><path d="M68 168c4-13 28-13 32 0" stroke="#ff4d2e" strokeWidth={3} fill="none" strokeLinecap="round" />
            <text x={84} y={214} textAnchor="middle" fontSize={17} fill="#a7a39a" fontFamily="var(--font-mono)">{L.invite}</text>
            <text x={318} y={292} textAnchor="middle" fontSize={17} fill="#a7a39a" fontFamily="var(--font-mono)">{L.joined}</text>
          </svg>
        ), 1)}
        {card('dashboard', (
          <svg viewBox="0 0 400 300" aria-hidden="true" className="art__svg">
            <rect x={12} y={12} width={376} height={276} rx={14} fill="#121216" stroke="#2a2a2e" />
            <text x={30} y={46} fontSize={17} fill="#a7a39a" fontFamily="var(--font-mono)">{L.recurrence}</text>
            <path d="M30 140H370M30 104H370M30 68H370" stroke="#2a2a2e" />
            <path className="art-line" d="M30 136C80 130 96 118 140 112S210 96 250 84 330 64 370 58" fill="none" stroke="#ff4d2e" strokeWidth={4} strokeLinecap="round" pathLength={1} />
            <text x={30} y={186} fontSize={17} fill="#a7a39a" fontFamily="var(--font-mono)">{L.referrals}</text>
            {[28, 40, 34, 52, 60, 72].map((h, k) => <rect key={k} className="art-bar" x={30 + k * 30} y={270 - h} width={20} height={h} rx={3} fill="#7fa3ff" style={{ '--k': k } as CSSProperties} />)}
            <text x={262} y={186} fontSize={17} fill="#a7a39a" fontFamily="var(--font-mono)">{L.game}</text>
            <circle cx={318} cy={234} r={34} fill="none" stroke="#2a2a2e" strokeWidth={10} />
            <circle className="art-donut" cx={318} cy={234} r={34} fill="none" stroke="#ffc21a" strokeWidth={10} pathLength={1} strokeDasharray="0.68 1" transform="rotate(-90 318 234)" strokeLinecap="round" />
          </svg>
        ), 2)}
      </div>
      <figcaption className="note">{c.caption}</figcaption>
    </InView>
  );
}
