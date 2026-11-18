import { type V2Locale, v2Messages } from '@/v2/i18n';
import { CraftStack } from './CraftStack';
import { STACK_VIEWBOX, stackArt } from './stack-art';

/** Server side: draws the art once at build time and hands it to the interactive stage. */
export function Stack({ locale, hint = true }: { locale: V2Locale; hint?: boolean }) {
  const m = v2Messages(locale);
  const art = stackArt();
  const V = STACK_VIEWBOX;
  return (
    <CraftStack
      viewBox={`${V.x} ${V.y} ${V.w} ${V.h}`}
      glow={art.glow}
      layers={art.layers.map((l) => ({ id: l.id, label: m.layers[l.id], from: l.from, svg: l.svg, anchor: l.anchor }))}
      title={m.hero.stackAlt}
      hint={hint ? m.pieces.stack.hint : undefined}
      cursor={m.engine.cursor.zones.open}
    />
  );
}
