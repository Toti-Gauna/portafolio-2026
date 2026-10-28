import { InView } from '@/components/diagrams/InView';

/** Pivot or persevere, drawn as the site's branch motif: what you learned decides the branch. */
export function Fork({ c }: { c: { go: string; pivot: string; learn: string; caption: string } }) {
  return (
    <InView live as="figure" className="bz-fig bz-fork">
      <svg viewBox="0 0 480 240" aria-hidden="true">
        <path className="bz-fork__main" d="M16 160H214" pathLength={1} />
        <path className="bz-fork__go" d="M266 160H464" pathLength={1} />
        <path className="bz-fork__pivot" d="M266 160C320 160 320 64 374 64H464" pathLength={1} />
        <path className="bz-fork__pkt" d="M16 160H214M266 160C320 160 320 64 374 64H464" pathLength={1} />
        <rect className="bz-fork__node" x={222} y={142} width={36} height={36} rx={6} transform="rotate(45 240 160)" />
        <text x={115} y={204} textAnchor="middle" fontSize={21}>{c.learn}</text>
        <text x={390} y={204} textAnchor="middle" fontSize={22} className="bz-fork__l">{c.go}</text>
        <text x={420} y={40} textAnchor="middle" fontSize={22} className="bz-fork__l bz-fork__l--pivot">{c.pivot}</text>
      </svg>
      <figcaption className="note">{c.caption}</figcaption>
    </InView>
  );
}
