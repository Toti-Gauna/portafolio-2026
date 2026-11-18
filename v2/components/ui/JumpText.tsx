import type { CSSProperties } from 'react';

/**
 * Text whose letters jump: in as it comes on screen (inside a `data-reveal`), and under the pointer afterwards
 * (v2/motion/hop.ts). Screen readers get the text whole; the letters are decoration. Words never break inside.
 * `from` offsets the stagger when several pieces come in together; `tint` gives each letter its colour (a gradient
 * painted on the whole word would vanish while a letter is in the air).
 */
export function JumpText({ text, from = 0, className, tint }: { text: string; from?: number; className?: string; tint?: (t: number) => string }) {
  let n = from, k = 0;
  const count = Math.max(1, [...text.replace(/ /g, '')].length - 1);
  const words = text.split(' ');
  return (
    <span className={className ? `jt ${className}` : 'jt'} data-hop>
      <span className="ui-sr">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <span key={w}>
            <span className="jt-w">
              {[...word].map((ch, i) => <span key={i} className="jt-l" style={{ '--i': n++, color: tint?.(k++ / count) } as CSSProperties}>{ch}</span>)}
            </span>
            {w < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </span>
  );
}
