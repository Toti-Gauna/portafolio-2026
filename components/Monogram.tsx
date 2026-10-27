/** "IG" monogram (design/svg/brand/monogram.svg). Pass `label` when it stands alone; otherwise it is decorative. */
export function Monogram({ label, className }: { label?: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 17v33" />
        <path d="M50 22a16 16 0 1 0 0 20V34H38" />
      </g>
      <circle cx="18" cy="9" r="3" fill="var(--accent)" />
    </svg>
  );
}
