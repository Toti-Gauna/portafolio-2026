import * as THREE from 'three';
import { type Rig, type RigFactory } from './core';

/**
 * «Postal»: the journey so far, as six stamps (the ones of the kit, drawn in code) printed on card and hung in
 * the studio: flat ink and cream paper against the dark, the one place where the palette changes. They are
 * dealt from behind the camera, one stop after another with the loading, and stay floating over the floor.
 */
const CW = 12.4, CH = 15.5, ARC = [-0.44, 0, 0.44], WALL = 33, ROWS = [11.6, -12.3];
const DEAL: [step: number, from: number, to: number][] = [[0, 0, 1], [1, 0, 0.75], [1, 0.25, 1], [2, 0, 0.75], [2, 0.25, 1], [3, 0, 0.62]];
const quint = (x: number) => 1 - Math.pow(1 - x, 5);

export const postalRig: RigFactory = ({ reduced, images = [] }): Rig => {
  const root = new THREE.Group();
  const made: { dispose(): void }[] = [];
  const geo = new THREE.PlaneGeometry(CW, CH);
  made.push(geo);
  root.add(new THREE.AmbientLight(0xffffff, 0.46));
  const key = new THREE.DirectionalLight(0xfff1e4, 1.85);
  key.position.set(-20, 30, 40);
  root.add(key);

  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646 - 0.5;
  const cards = Array.from({ length: 6 }, (_, i) => {
    const canvas = document.createElement('canvas');
    canvas.width = 480; canvas.height = 600;
    const img = images[i];
    if (img) canvas.getContext('2d')!.drawImage(img, 0, 0, 480, 600);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    const face = new THREE.MeshStandardMaterial({ map, alphaTest: 0.5, roughness: 0.78, metalness: 0, envMapIntensity: 0.4, side: THREE.DoubleSide });
    // the card has an edge: two more cuts of the same shape behind the face, in the shade
    const edge = new THREE.MeshStandardMaterial({ map, alphaTest: 0.5, color: 0x6f6a5c, roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
    made.push(map, face, edge);
    const g = new THREE.Group();
    const front = new THREE.Mesh(geo, face);
    for (const z of [-0.09, -0.18]) { const m = new THREE.Mesh(geo, edge); m.position.z = z; g.add(m); }
    g.add(front);
    // a wall that curves toward the visitor: the cards at the sides turn to face them
    const a = ARC[i % 3], row = Math.floor(i / 3);
    const rest = new THREE.Vector3(Math.sin(a) * WALL, ROWS[row], (1 - Math.cos(a)) * WALL + rnd() * 2.4 + (row ? 1.5 : -1.5));
    const turn = new THREE.Euler(rnd() * 0.1 + (row ? -0.05 : 0.05), -a + rnd() * 0.12, rnd() * 0.06);
    root.add(g);
    return { g, rest, turn, i };
  });

  const anchors = cards.map((c) => new THREE.Vector3(c.rest.x, c.rest.y - CH / 2 - 0.4, c.rest.z));
  return {
    root,
    frame: { x: 0, y: -3.6, w: 46, h: 53 },
    floorY: ROWS[1] - CH / 2 - 3.4,
    durations: [1000, 1100, 1100, 1500],
    camera: { fromYaw: -0.5, fromPitch: 0.16, fromDist: 1.16, pitch: 0.05, sway: 0.15, follow: 0.26 },
    anchors,
    update(p, t) {
      const calm = p[3] >= 1 ? 1 : 0;
      cards.forEach((c) => {
        const [step, a, b] = DEAL[c.i];
        const q = Math.min(1, Math.max(0, (p[step] - a) / (b - a)));
        const e = quint(q), back = 1 - e;
        c.g.visible = q > 0;
        const float = reduced ? 0 : Math.sin(t * 0.6 + c.i * 1.3) * 0.22;
        c.g.position.set(c.rest.x * (1 + back * 0.5), c.rest.y + float - back * 14, c.rest.z + back * 120);
        c.g.rotation.set(c.turn.x - back * 1.1, c.turn.y + back * (c.i % 2 ? 1.4 : -1.4) + (reduced ? 0 : calm * Math.sin(t * 0.4 + c.i * 1.7) * 0.035), c.turn.z + back * 0.5);
      });
    },
    dispose() { made.forEach((m) => m.dispose()); },
  };
};
