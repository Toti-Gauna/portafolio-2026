import type { CSSProperties } from 'react';
import { tokens } from '@/v2/tokens';

/**
 * Where a project stands, always named in positive terms (messages/v2 `ui.status.<key>`):
 * live work gets a solid dot, work being built a half dot, demos and prototypes a ring, the roadmap a dashed ring.
 */
export const STATUSES = {
  produccion: { color: tokens.color['mint-500'], mark: 'solid' },
  interna: { color: tokens.color['mint-500'], mark: 'solid' },
  desarrollo: { color: tokens.color['amber-500'], mark: 'half' },
  mvp: { color: tokens.color['blue-400'], mark: 'half' },
  demo: { color: tokens.color['lilac-400'], mark: 'ring' },
  prototipo: { color: tokens.color['pink-400'], mark: 'ring' },
  laboratorio: { color: tokens.color['cyan-400'], mark: 'ring' },
  roadmap: { color: tokens.color['mist-300'], mark: 'dashed' },
  ejercicio: { color: tokens.color['coral-400'], mark: 'ring' },
  profesional: { color: tokens.color.paper, mark: 'solid' },
} as const;
export type StatusKey = keyof typeof STATUSES;

export function StatusBadge({ status, label }: { status: StatusKey; label: string }) {
  const s = STATUSES[status];
  return (
    <span className={`ui-status ui-status--${s.mark}`} style={{ '--st': s.color } as CSSProperties}>
      <i aria-hidden="true" />
      {label}
    </span>
  );
}
