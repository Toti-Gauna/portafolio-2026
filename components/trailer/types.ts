export type Orientation = 'landscape' | 'portrait';
export interface StageSize { W: number; H: number; o: Orientation }
export const LANDSCAPE: StageSize = { W: 1920, H: 1080, o: 'landscape' };
export const PORTRAIT: StageSize = { W: 1080, H: 1920, o: 'portrait' };
export const stageFor = (o: Orientation): StageSize => (o === 'landscape' ? LANDSCAPE : PORTRAIT);
