const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
export const Play = () => <svg {...base}><path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none" /></svg>;
export const Pause = () => <svg {...base}><path d="M8 5v14M16 5v14" strokeWidth={3} /></svg>;
export const Volume2 = () => <svg {...base}><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></svg>;
export const VolumeX = () => <svg {...base}><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" /><path d="M16 9.5l5 5M21 9.5l-5 5" /></svg>;
export const X = () => <svg {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>;
