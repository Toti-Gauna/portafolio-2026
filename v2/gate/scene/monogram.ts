import * as THREE from 'three';
import { backOut, easeInOut, easeOut, type Rig, type RigFactory } from './core';

/**
 * «Monograma»: the IG mark as a sculpture of polished metal that draws itself, one stroke per loading step —
 * the stem rises, the G is drawn in one gesture, its bar closes, and the dot ignites in coral and sends a
 * ripple across the floor. The geometry is the mark's own (the same numbers as the SVG, y up, centred).
 */
const R = 1.7; // stroke radius: the mark's own weight
const STEM_X = -13, STEM_Y0 = -17, STEM_Y1 = 8;
const GC = { x: 5.773, y: -4.497, r: 13.5, a0: 0.5887, sweep: 5.3548 };
const BAR = { y: -9, x0: 18.5, x1: 6 };
const DOT = { x: -13, y: 17, r: 3.4 };
const RADIAL = 28;

class Arc extends THREE.Curve<THREE.Vector3> {
  constructor() { super(); }
  getPoint(t: number, out = new THREE.Vector3()) {
    const a = GC.a0 + t * GC.sweep;
    return out.set(GC.x + GC.r * Math.cos(a), GC.y + GC.r * Math.sin(a), 0);
  }
}

type Stroke = { tube: THREE.Mesh; path: THREE.Curve<THREE.Vector3>; segs: number; head: THREE.Mesh; tail: THREE.Mesh };
export const MARK_DOT = DOT;
export const MARK_FOOT = STEM_Y0 - R;

/** The three strokes of the mark (stem, G, bar) as tubes that can be drawn from 0 to 1. */
export function createMark(metal: THREE.Material, coarse: boolean) {
  const group = new THREE.Group();
  const made: { dispose(): void }[] = [];
  const capGeo = new THREE.SphereGeometry(R, RADIAL, 16);
  made.push(capGeo);
  const stroke = (path: THREE.Curve<THREE.Vector3>, segs: number): Stroke => {
    const geo = new THREE.TubeGeometry(path, segs, R, RADIAL, false);
    made.push(geo);
    const tube = new THREE.Mesh(geo, metal);
    const tail = new THREE.Mesh(capGeo, metal), head = new THREE.Mesh(capGeo, metal);
    tail.position.copy(path.getPointAt(0));
    head.position.copy(path.getPointAt(1));
    group.add(tube, tail, head);
    return { tube, path, segs, head, tail };
  };
  const v = (x: number, y: number) => new THREE.Vector3(x, y, 0);
  const strokes = [
    stroke(new THREE.LineCurve3(v(STEM_X, STEM_Y0), v(STEM_X, STEM_Y1)), 24),
    stroke(new Arc(), coarse ? 140 : 220),
    stroke(new THREE.LineCurve3(v(BAR.x0, BAR.y), v(BAR.x1, BAR.y)), 16),
  ];
  const draw = (i: number, raw: number) => {
    const s = strokes[i];
    const n = Math.round(easeInOut(raw) * s.segs);
    s.tube.geometry.setDrawRange(0, n * RADIAL * 6);
    s.tube.visible = s.tail.visible = s.head.visible = n > 0;
    if (n > 0) s.head.position.copy(s.path.getPointAt(n / s.segs));
    return s.head.position;
  };
  return { group, capGeo, draw, dispose() { made.forEach((m) => m.dispose()); } };
}

export const markMetal = () => new THREE.MeshPhysicalMaterial({
  color: 0xf6f3ff, metalness: 1, roughness: 0.14, envMapIntensity: 1.15,
  iridescence: 0.22, iridescenceIOR: 1.6, iridescenceThicknessRange: [180, 420], clearcoat: 0.6, clearcoatRoughness: 0.08,
});

export const monogramRig: RigFactory = ({ coarse }): Rig => {
  const root = new THREE.Group();
  const made: { dispose(): void }[] = [];
  const metal = markMetal();
  const mark = createMark(metal, coarse);
  const capGeo = mark.capGeo;
  made.push(metal, mark);
  root.add(mark.group);

  // the point of light that draws each stroke
  const sparkMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.86, 0.74).multiplyScalar(3), transparent: true });
  const spark = new THREE.Mesh(capGeo, sparkMat);
  const sparkLight = new THREE.PointLight(0xffd9c2, 0, 60, 2);
  made.push(sparkMat);
  root.add(spark, sparkLight);

  // the dot
  const dotMat = new THREE.MeshStandardMaterial({ color: 0xe8431f, emissive: 0xff4d2e, emissiveIntensity: 0.8, roughness: 0.6, metalness: 0, envMapIntensity: 0.16 });
  const dotGeo = new THREE.SphereGeometry(DOT.r, 48, 32);
  const dot = new THREE.Mesh(dotGeo, dotMat);
  dot.position.set(DOT.x, DOT.y, 0);
  const dotLight = new THREE.PointLight(0xff5a3c, 0, 80, 2);
  dotLight.position.set(DOT.x, DOT.y, 0); // inside the dot: it lights the metal around it, never the dot itself
  made.push(dotMat, dotGeo);
  root.add(dot, dotLight);

  // the ripple it sends across the floor
  const floorY = -(Math.abs(STEM_Y0) + R + 0.9);
  const ringGeo = new THREE.RingGeometry(0.965, 1, 96);
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.42, 0.28).multiplyScalar(3), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(2.75, floorY + 0.05, 0);
  made.push(ringGeo, ringMat);
  root.add(ring);

  return {
    root,
    frame: { x: 2.75, y: -1.5, w: 42, h: 48 },
    floorY,
    durations: [900, 1500, 520, 1500],
    camera: { fromYaw: -0.62, fromPitch: 0.2, fromDist: 1.22, pitch: 0.055, sway: 0.13, follow: 0.24 },
    update(p, t) {
      let tip: THREE.Vector3 | null = null, at = 0;
      for (let i = 0; i < 3; i++) { const h = mark.draw(i, p[i]); if (p[i] > 0 && p[i] < 1) { tip = h; at = p[i]; } }
      // the spark rides the tip of the stroke being drawn
      if (tip) {
        const edge = Math.min(1, at * 8, (1 - at) * 8);
        spark.visible = true;
        spark.position.copy(tip);
        spark.scale.setScalar(1.12 + 0.06 * Math.sin(t * 40));
        sparkMat.opacity = edge;
        sparkLight.position.copy(tip).setZ(4);
        sparkLight.intensity = 140 * edge;
      } else { spark.visible = false; sparkLight.intensity = 0; }
      // the dot: lands with a little overshoot, flashes, and settles into a slow pulse
      const d = Math.min(1, p[3] / 0.34);
      dot.visible = d > 0;
      dot.scale.setScalar(Math.max(0.001, backOut(d)));
      const flash = p[3] > 0 ? Math.max(0, 1 - p[3] / 0.5) : 0;
      const pulse = p[3] >= 1 ? 0.12 * Math.sin(t * 1.6) : 0;
      dotMat.emissiveIntensity = 0.8 + flash * 2.6 + pulse;
      dotLight.intensity = d * (260 + flash * 900 + pulse * 80);
      const w = p[3] > 0.08 ? easeOut((p[3] - 0.08) / 0.92) : 0;
      ring.visible = w > 0 && w < 1;
      ring.scale.setScalar(1 + w * 78);
      ringMat.opacity = (1 - w) * (1 - w) * 0.9;
    },
    dispose() { made.forEach((m) => m.dispose()); },
  };
};
