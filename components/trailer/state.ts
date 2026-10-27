/** Canvas state. GSAP tweens these numbers; the canvas just draws whatever they hold. */
export interface DrawState {
  seedA: number; // glow alpha of the seed
  seedR: number; // glow radius (fraction of the short side)
  toWord: number; // particles: seed -> the word "juegos"
  toScatter: number; // word -> scattered over the stage
  toName: number; // scattered -> the name
  pAlpha: number; // particle alpha
  burst: number; // 0..1 extra outward push used at the explosion
  trunk: number; // 0..1 trunk of the commit graph
  m0: number; m1: number; m2: number; m3: number; // 4 career branches
  focus: number; // highlighted branch (0..3, -1 none), tweened
  s0: number; s1: number; s2: number; s3: number; s4: number; s5: number; s6: number; s7: number; s8: number; // 9 own projects
  graphA: number; // alpha of the commit graph
  converge: number; // 0..1 pulls every branch to the centre
  agents: number; // 0..1 reveal of the agent graph
  gates: number; // 0..6 gates lit
  cam: number; // 0..1 camera moves from the wide shot to the focused branch
  zoom: number; // camera zoom on the graph
}

export function initialState(): DrawState {
  return {
    seedA: 0, seedR: 0.01, toWord: 0, toScatter: 0, toName: 0, pAlpha: 0, burst: 0,
    trunk: 0, m0: 0, m1: 0, m2: 0, m3: 0, focus: -1,
    s0: 0, s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, s6: 0, s7: 0, s8: 0,
    graphA: 1, converge: 0, agents: 0, gates: 0, cam: 0, zoom: 1,
  };
}
