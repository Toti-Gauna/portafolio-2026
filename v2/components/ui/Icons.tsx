/** Line icons of /v2: 16 px grid, 1.8 stroke, currentColor. Decorative unless a caller labels them. */
type P = { size?: number };

export const PlayIcon = ({ size = 12 }: P) => (
  <svg aria-hidden="true" viewBox="0 0 12 12" width={size} height={size}><path d="M2 1l9 5-9 5z" fill="currentColor" /></svg>
);
export const ArrowIcon = ({ size = 16 }: P) => (
  <svg aria-hidden="true" viewBox="0 0 16 12" width={size} height={(size * 3) / 4} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6h13M9 1l5 5-5 5" /></svg>
);
export const ArrowLeftIcon = ({ size = 16 }: P) => (
  <svg aria-hidden="true" viewBox="0 0 16 12" width={size} height={(size * 3) / 4} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6H2M7 1L2 6l5 5" /></svg>
);
export const SoundIcon = ({ on, size = 18 }: P & { on: boolean }) => (
  <svg aria-hidden="true" viewBox="0 0 20 16" width={size} height={(size * 16) / 20} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 5.5h3.5L10 2v12L5.5 10.5H2z" />
    {on ? <path d="M13 5.2a4 4 0 0 1 0 5.6M15.6 3a7 7 0 0 1 0 10" /> : <path d="M13.5 5.5l5 5M18.5 5.5l-5 5" />}
  </svg>
);
export const MenuIcon = ({ size = 16 }: P) => (
  <svg aria-hidden="true" viewBox="0 0 16 10" width={size} height={(size * 10) / 16} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 1h14M1 9h14" /></svg>
);
export const CloseIcon = ({ size = 16 }: P) => (
  <svg aria-hidden="true" viewBox="0 0 16 16" width={size} height={size} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
);
export const CheckIcon = ({ size = 14 }: P) => (
  <svg aria-hidden="true" viewBox="0 0 14 14" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.5l3 3 6-7" /></svg>
);
export const ChevronIcon = ({ size = 14 }: P) => (
  <svg aria-hidden="true" viewBox="0 0 14 14" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2.5L9.5 7 5 11.5" /></svg>
);
export const MailIcon = ({ size = 16 }: P) => (
  <svg aria-hidden="true" viewBox="0 0 16 12" width={size} height={(size * 3) / 4} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><rect x="1" y="1" width="14" height="10" rx="2" /><path d="M1.5 1.8L8 7l6.5-5.2" /></svg>
);
export function Monogram({ size = 28 }: P) {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="7" r="3.4" fill="var(--color-coral-500)" stroke="none" />
      <path d="M11 16v25" />
      <path d="M41 21a13.5 13.5 0 1 0 1.5 12H30" />
    </svg>
  );
}
