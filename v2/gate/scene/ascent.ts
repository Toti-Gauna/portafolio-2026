import * as THREE from 'three';
import { easeInOut, easeOut, type Rig, type RigFactory } from './core';
import { createMark, MARK_DOT, MARK_FOOT, markMetal } from './monogram';

/**
 * «Ascenso»: the roadmap 2026 → 2030 as a climb. Four platforms spiral up from the floor, one per stage of the
 * plan, and a fifth waits at the top with the mark on it. A point of light climbs the path between them, one
 * stage per loading step: each platform lights in its colour as the climber lands on it, and at the top the dot
 * of the mark ignites. The names of the stages are HTML that follows these points.
 */
/** Where along the height each stage's platform stands (0 the floor, 1 the top): evenly, like the years. */
const STAGE_T = [0.06, 0.33, 0.57, 0.79];
const COLORS = [0xffc247, 0xff6b4a, 0xff5fa2, 0x5f86ff];
const TURNS = 2, Y0 = -16.5, Y1 = 10, R0 = 13.5, R1 = 0;
const DISC = 6.2, TOP = 8.6, THICK = 1;

class Climb extends THREE.Curve<THREE.Vector3> {
  constructor() { super(); }
  getPoint(t: number, out = new THREE.Vector3()) {
    const a = 1.85 + t * Math.PI * 2 * TURNS; // half a turn between platforms: they alternate sides
    const r = R0 + (R1 - R0) * Math.pow(t, 1.25);
    return out.set(Math.cos(a) * r, Y0 + (Y1 - Y0) * t, Math.sin(a) * r);
  }
}

export const ascentRig: RigFactory = ({ coarse, reduced }): Rig => {
  const root = new THREE.Group();
  const made: { dispose(): void }[] = [];
  const path = new Climb();
  const SEGS = coarse ? 320 : 520, RAD = 10;
  // the path is measured by its length (wider turns at the bottom are longer): find where each height falls on it
  const uAt = (t: number) => {
    const y = Y0 + (Y1 - Y0) * t;
    let lo = 0, hi = 1;
    for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (path.getPointAt(mid).y < y) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  };
  const STAGES = STAGE_T.map(uAt), TARGETS = [...STAGES.slice(1), 1];

  // the whole route, faint: where the climb is going
  const ghostGeo = new THREE.TubeGeometry(path, SEGS, 0.06, 6, false);
  const ghostMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x9a95b8).multiplyScalar(0.42) });
  root.add(new THREE.Mesh(ghostGeo, ghostMat));
  // the part already climbed: light, in the colours of the stages
  const trailGeo = new THREE.TubeGeometry(path, SEGS, 0.3, RAD, false);
  const uv = trailGeo.attributes.uv, cols = new Float32Array(uv.count * 3), c = new THREE.Color(), d = new THREE.Color();
  const stops = [...COLORS, 0xffe9df], at = [...STAGES, 1];
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    let k = 0;
    while (k < at.length - 2 && u > at[k + 1]) k++;
    const f = Math.min(1, Math.max(0, (u - at[k]) / (at[k + 1] - at[k])));
    c.set(stops[k]).lerp(d.set(stops[k + 1]), f).multiplyScalar(1.7);
    cols.set([c.r, c.g, c.b], i * 3);
  }
  trailGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const trailMat = new THREE.MeshBasicMaterial({ vertexColors: true });
  root.add(new THREE.Mesh(trailGeo, trailMat));
  made.push(ghostGeo, ghostMat, trailGeo, trailMat);

  // the platforms: dark lacquer, a rim of light, and a fine stem down to the floor
  const discGeo = new THREE.CylinderGeometry(1, 1, THICK, 72, 1);
  const rimGeo = new THREE.TorusGeometry(1, 0.018, 8, 120);
  const stemGeo = new THREE.CylinderGeometry(0.045, 0.045, 1, 6);
  const fineMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x6c6790).multiplyScalar(0.5) });
  made.push(discGeo, rimGeo, stemGeo, fineMat);
  const floorY = Y0 - 3.2;
  const platform = (u: number, radius: number, hex: number) => {
    const body = new THREE.MeshPhysicalMaterial({ color: 0x120e33, metalness: 0.4, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 0.9 });
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const g = new THREE.Group();
    const p = path.getPointAt(u);
    g.position.set(p.x, p.y - THICK / 2 - 0.22, p.z);
    const disc = new THREE.Mesh(discGeo, body);
    disc.scale.set(radius, 1, radius);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.scale.setScalar(radius);
    rim.position.y = THICK / 2;
    const stem = new THREE.Mesh(stemGeo, fineMat);
    const drop = g.position.y - THICK / 2 - floorY;
    stem.scale.y = drop;
    stem.position.y = -THICK / 2 - drop / 2;
    g.add(disc, rim, stem);
    root.add(g);
    made.push(body, rimMat);
    return { g, rimMat, u, color: new THREE.Color(hex), top: new THREE.Vector3(p.x, p.y, p.z) };
  };
  const stages = STAGES.map((u, i) => platform(u, DISC, COLORS[i]));
  const summit = platform(1, TOP, 0xff5a3c);

  // the mark, waiting at the top
  const metal = markMetal();
  const mark = createMark(metal, coarse);
  for (let i = 0; i < 3; i++) mark.draw(i, 1);
  const K = 0.36;
  const dotMat = new THREE.MeshStandardMaterial({ color: 0xe8431f, emissive: 0xff4d2e, emissiveIntensity: 0.02, roughness: 0.6, metalness: 0, envMapIntensity: 0.16 });
  const dotGeo = new THREE.SphereGeometry(MARK_DOT.r, 32, 24);
  const dot = new THREE.Mesh(dotGeo, dotMat);
  dot.position.set(MARK_DOT.x, MARK_DOT.y, 0);
  mark.group.add(dot);
  mark.group.scale.setScalar(K);
  mark.group.position.set(summit.top.x - 2.75 * K, summit.top.y - 0.2 - MARK_FOOT * K, summit.top.z);
  const dotLight = new THREE.PointLight(0xff5a3c, 0, 60, 2);
  // inside the dot: it lights the metal around it, never the dot itself
  dotLight.position.set(mark.group.position.x + MARK_DOT.x * K, mark.group.position.y + MARK_DOT.y * K, summit.top.z);
  root.add(mark.group, dotLight);
  made.push(metal, mark, dotMat, dotGeo);

  // the climber
  const headGeo = new THREE.SphereGeometry(0.62, 24, 16);
  const headMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.84, 0.74).multiplyScalar(2.6), transparent: true });
  const head = new THREE.Mesh(headGeo, headMat);
  const light = new THREE.PointLight(0xffc0a0, 0, 60, 2);
  root.add(head, light);
  made.push(headGeo, headMat);

  const black = new THREE.Color(0x000000);
  const anchors = [...stages.map((s) => s.top.clone()), summit.top.clone().setY(summit.top.y + 15.4)];
  return {
    root,
    frame: { x: 0, y: 1.6, w: 44, h: 57 },
    floorY,
    durations: [1200, 1000, 1000, 1700],
    camera: { fromYaw: 0.85, fromPitch: 0.5, fromDist: 1.18, pitch: 0.3, sway: 0.2, follow: 0.3 },
    anchors,
    update(p, t) {
      let u = STAGES[0];
      for (let k = 0; k < 4; k++) u += easeInOut(k === 3 ? Math.min(1, p[k] / 0.7) : p[k]) * (TARGETS[k] - (k ? TARGETS[k - 1] : STAGES[0]));
      const n = Math.round(u * SEGS);
      trailGeo.setDrawRange(0, n * RAD * 6);
      path.getPointAt(Math.min(1, n / SEGS), head.position);
      const arrived = p[3] > 0.7 ? (p[3] - 0.7) / 0.3 : 0;
      head.scale.setScalar(1 + (reduced ? 0 : 0.1 * Math.sin(t * 9)));
      headMat.opacity = 1 - arrived;
      head.visible = arrived < 1;
      light.position.copy(head.position).setY(head.position.y + 1.2);
      light.intensity = 90 * (1 - arrived);
      stages.forEach((s) => {
        const since = (u - s.u) * 10; // how far past this platform the climber is
        const on = Math.min(1, Math.max(0, since + 0.25));
        s.rimMat.color.copy(black).lerp(s.color, on).multiplyScalar(0.12 + on * (1.5 + Math.exp(-since * since * 5) * 2));
      });
      const lit = easeOut(arrived), flash = arrived > 0 ? Math.exp(-Math.pow((arrived - 0.35) / 0.25, 2)) : 0;
      summit.rimMat.color.copy(summit.color).multiplyScalar(0.14 + lit * 1.5 + flash * 2);
      dotMat.emissiveIntensity = 0.02 + lit * 0.8 + flash * 2.2 + (reduced || arrived < 1 ? 0 : 0.1 * Math.sin(t * 1.6));
      dotLight.intensity = lit * 60 + flash * 240;
    },
    dispose() { made.forEach((m) => m.dispose()); },
  };
};
