import { useTranslations } from 'next-intl';
import type { StatusKind } from '@/lib/status';
import './ui.css';

/** Rótulo de estado de una pieza (átomo). Producción = lleno; MVP, demo, prototipo, desarrollo y banco = contorno; planeado y ejercicio = punteado. */
export function StatusTag({ kind }: { kind: StatusKind }) {
  const t = useTranslations('status');
  return (
    <span className="stag" data-kind={kind}>
      {t(kind)}
    </span>
  );
}
