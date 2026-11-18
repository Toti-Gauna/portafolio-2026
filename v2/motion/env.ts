/** What the device and the visitor allow. Read on use: the settings can change while the page is open. */
export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
