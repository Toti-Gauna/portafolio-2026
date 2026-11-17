import { InView } from '@/components/diagrams/InView';

type Copy = { title: string; qr: string; nfc: string; pass: string; counter: string };

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Four line icons of physical touchpoints: a table QR, an NFC plate, a pass on a phone and a counter. */
export function Touchpoints({ c }: { c: Copy }) {
  return (
    <InView as="figure" className="bz-touch">
      <figcaption className="bz-fig__t">{c.title}</figcaption>
      <ul>
        <li>
          <svg viewBox="0 0 96 96" aria-hidden="true" {...stroke}>
            <path d="M22 78 30 22h36l8 56z" /><path d="M14 78h68" />
            <rect x="38" y="32" width="8" height="8" /><rect x="50" y="32" width="8" height="8" /><rect x="38" y="44" width="8" height="8" /><path d="M52 46h6v6M52 58h6M38 58h6" />
          </svg>
          <span>{c.qr}</span>
        </li>
        <li>
          <svg viewBox="0 0 96 96" aria-hidden="true" {...stroke}>
            <rect x="20" y="20" width="56" height="56" rx="10" />
            <path d="M40 48a8 8 0 0 1 16 0M34 48a14 14 0 0 1 28 0M46 56l4-4" />
            <circle cx="48" cy="56" r="2" />
          </svg>
          <span>{c.nfc}</span>
        </li>
        <li>
          <svg viewBox="0 0 96 96" aria-hidden="true" {...stroke}>
            <rect x="28" y="12" width="40" height="72" rx="7" />
            <path d="M44 18h8" /><rect x="36" y="30" width="10" height="10" /><rect x="50" y="30" width="10" height="10" /><rect x="36" y="44" width="10" height="10" /><path d="M52 48h8v8M36 64h24" />
          </svg>
          <span>{c.pass}</span>
        </li>
        <li>
          <svg viewBox="0 0 96 96" aria-hidden="true" {...stroke}>
            <path d="M12 44h72M16 44v32h64V44M20 44 26 24h44l6 20" />
            <path d="M34 62h28M30 76v6M66 76v6" /><rect x="58" y="30" width="8" height="8" />
          </svg>
          <span>{c.counter}</span>
        </li>
      </ul>
    </InView>
  );
}
