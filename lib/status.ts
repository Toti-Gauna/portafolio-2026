/**
 * Estados que lleva cada pieza del portafolio (regla de honestidad). Los rótulos salen de messages: `status.<kind>`.
 * «mvp», «planeado» y «ejercicio» son nuevos (Ignacio, 16/11/2026).
 */
export const STATUS_KINDS = ['produccion', 'desarrollo', 'mvp', 'demo', 'prototipo', 'banco', 'planeado', 'ejercicio'] as const;
export type StatusKind = (typeof STATUS_KINDS)[number];
