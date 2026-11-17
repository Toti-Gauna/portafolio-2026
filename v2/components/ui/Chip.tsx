import type { CSSProperties, ReactNode } from 'react';
import { tokens, type LayerId } from '@/v2/tokens';

const from = (id: LayerId) => tokens.layer[`${id}-from` as keyof typeof tokens.layer];

/** Information, not a control: a technology, a topic, a count. */
export function Chip({ children }: { children: ReactNode }) {
  return <span className="ui-chip">{children}</span>;
}

/** A layer of the craft, numbered and in its colour (01 Planificación y ejecución … 05 Deploy). */
export function LayerChip({ id, n, children }: { id: LayerId; n: number; children: ReactNode }) {
  return (
    <span className="ui-chip ui-chip--layer" style={{ '--from': from(id) } as CSSProperties}>
      <i aria-hidden="true">{String(n).padStart(2, '0')}</i>
      {children}
    </span>
  );
}

/** A key on the keyboard, for shortcut hints. */
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="ui-kbd">{children}</kbd>;
}

/** The role, with the level in its own gradient block so it never gets lost. */
export function RoleBadge({ level, role }: { level: string; role: string }) {
  return (
    <p className="ui-role">
      <b>{level}</b>
      <span>{role}</span>
    </p>
  );
}
