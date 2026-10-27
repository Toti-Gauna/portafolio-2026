/** Scene start times (seconds) of the 120 s trailer. One source of truth for scenes and score. */
export const T = {
  s1: 0, // frío
  s2: 8, // la semilla
  s3: 18, // la explosión
  s4: 28, // TACH 2021
  s5: 38, // Ada 2023
  s6: 48, // Tuenti 2024
  s7: 60, // CompliA 2026
  s8: 72, // ramas propias
  s9: 84, // el sistema
  s10: 100, // unión
  s11: 115, // créditos
  end: 120,
} as const;

export const DURATION = T.end;
export const SCENE_STARTS = [T.s1, T.s2, T.s3, T.s4, T.s5, T.s6, T.s7, T.s8, T.s9, T.s10, T.s11] as const;

/** Index (0-based) of the scene playing at time t. */
export function sceneAt(t: number): number {
  let i = 0;
  for (let k = 0; k < SCENE_STARTS.length; k++) if (t >= SCENE_STARTS[k]) i = k;
  return i;
}
