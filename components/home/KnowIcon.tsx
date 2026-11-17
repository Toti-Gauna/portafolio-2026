import type { KnowledgeId } from '@/lib/home';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Line icons for the knowledge cards: a headset, a cube with its axes, a point cloud becoming a mesh, and a spark. No brand marks. */
export function KnowIcon({ id, className }: { id: KnowledgeId; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" {...stroke}>
      {id === 'arvr' && <><path d="M8 24h48a4 4 0 0 1 4 4v10a6 6 0 0 1-6 6h-8l-5-6h-12l-5 6h-8a6 6 0 0 1-6-6V28a4 4 0 0 1 4-4z" /><circle cx="20" cy="33" r="3" /><circle cx="44" cy="33" r="3" /></>}
      {id === 'blender' && <><path d="M32 8 52 19v22L32 52 12 41V19z" /><path d="M12 19l20 11 20-11M32 30v22" /></>}
      {id === 'meshy' && <><circle cx="14" cy="42" r="2" /><circle cx="26" cy="22" r="2" /><circle cx="42" cy="38" r="2" /><circle cx="50" cy="18" r="2" /><path d="M14 42 26 22 42 38 50 18M26 22l16 16" strokeDasharray="3 5" /><path d="M10 54h44" /></>}
      {id === 'claude' && <path d="M32 8v14M32 42v14M8 32h14M42 32h14M15 15l10 10M39 39l10 10M49 15 39 25M25 39 15 49" />}
    </svg>
  );
}
